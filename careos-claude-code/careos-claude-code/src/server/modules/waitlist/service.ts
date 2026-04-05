/**
 * Waitlist Service — Lead Capture & FOMO Engine
 *
 * Captures visitors from homepage burnout quiz, manages priority queue,
 * tracks conversion funnel from waitlist → invited → converted member.
 * Founding member cap: 100.
 */
import { z } from 'zod';
import * as queries from '../../database/queries/index.js';
import { NotFoundError, ValidationError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';

// ── Constants ───────────────────────────────────────────

const FOUNDING_MEMBER_CAP = 100;

// ── Zod Schemas ─────────────────────────────────────────

export const joinWaitlistSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1).max(200).optional(),
  phone: z.string().max(20).optional(),
  source: z.enum(['homepage_quiz', 'referral', 'social_share', 'physician', 'employer', 'direct']),
  quizScore: z.number().min(0).max(100).optional(),
  quizZone: z.enum(['green', 'yellow', 'red']).optional(),
  interests: z.array(z.string()).default([]),
  zipCode: z.string().max(10).optional(),
  role: z.enum(['family', 'caregiver', 'neighbor', 'employer', 'physician']).optional(),
  referredBy: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;

// ── Priority Calculation ────────────────────────────────

function calculatePriority(input: JoinWaitlistInput): number {
  let priority = 40; // default (green zone)

  // Quiz zone priority
  if (input.quizZone === 'red') {
    priority = 100;
  } else if (input.quizZone === 'yellow') {
    priority = 70;
  }

  // Source bonuses
  if (input.source === 'physician') {
    priority += 20;
  } else if (input.source === 'employer') {
    priority += 15;
  } else if (input.source === 'referral') {
    priority += 10;
  }

  return Math.min(priority, 150); // cap at 150
}

// ── Service ─────────────────────────────────────────────

async function joinWaitlist(input: JoinWaitlistInput): Promise<queries.WaitlistEntryRecord> {
  // Check for existing entry by email
  const existing = await queries.getWaitlistEntryByEmail(input.email);

  if (existing) {
    // Update existing entry (re-submission)
    const priority = calculatePriority(input);
    const updated = await queries.updateWaitlistEntry(existing.id, {
      name: input.name ?? existing.name,
      phone: input.phone ?? existing.phone,
      source: input.source,
      quizScore: input.quizScore ?? existing.quizScore,
      quizZone: input.quizZone ?? existing.quizZone,
      interests: input.interests.length > 0 ? input.interests : existing.interests,
      zipCode: input.zipCode ?? existing.zipCode,
      role: input.role ?? existing.role,
      referredBy: input.referredBy ?? existing.referredBy,
      priority: Math.max(priority, existing.priority), // keep higher priority
      metadata: input.metadata ?? existing.metadata,
    });

    logger.info(
      { email: '[REDACTED]', entryId: updated.id },
      'Waitlist entry updated (re-submission)',
    );
    return updated;
  }

  // New entry
  const priority = calculatePriority(input);
  const position = await queries.getNextPosition();

  const entry = await queries.createWaitlistEntry({
    ...input,
    priority,
    position,
  });

  logger.info({ entryId: entry.id, position, priority }, 'New waitlist entry created');
  return entry;
}

async function getPosition(email: string): Promise<{
  position: number;
  status: string;
  estimatedWaitDays: number;
}> {
  const entry = await queries.getWaitlistEntryByEmail(email);
  if (!entry) throw new NotFoundError('Waitlist entry');

  // Count how many people are ahead (higher priority or earlier position)
  const aheadCount = entry.position - 1;
  // Estimate ~2 entries converted per week
  const estimatedWaitDays = Math.max(Math.round((aheadCount / 2) * 7), 1);

  return {
    position: entry.position,
    status: entry.status,
    estimatedWaitDays,
  };
}

async function getStats(): Promise<{
  totalWaiting: number;
  avgWaitDays: number;
  spotsThisMonth: number;
  foundingMemberSpotsLeft: number;
}> {
  let stats: { totalWaiting: number; avgWaitDays: number; convertedCount: number };
  try {
    stats = await queries.getWaitlistStats();
  } catch {
    // Fallback for when DB isn't available
    stats = { totalWaiting: 0, avgWaitDays: 0, convertedCount: 0 };
  }

  const foundingMemberSpotsLeft = Math.max(FOUNDING_MEMBER_CAP - stats.convertedCount, 0);
  // Estimate spots opening this month based on conversion rate
  const spotsThisMonth = Math.min(8, foundingMemberSpotsLeft); // ~2 per week

  return {
    totalWaiting: stats.totalWaiting,
    avgWaitDays: stats.avgWaitDays,
    spotsThisMonth,
    foundingMemberSpotsLeft,
  };
}

async function listEntries(filters?: {
  status?: string;
  source?: string;
  quizZone?: string;
  limit?: number;
  offset?: number;
}): Promise<queries.WaitlistEntryRecord[]> {
  return queries.listWaitlistEntries(filters);
}

async function inviteEntry(id: string): Promise<queries.WaitlistEntryRecord> {
  const entry = await queries.getWaitlistEntryById(id);
  if (!entry) throw new NotFoundError('Waitlist entry');

  if (entry.status !== 'waiting') {
    throw new ValidationError(`Entry is already ${entry.status}`);
  }

  const updated = await queries.updateWaitlistEntry(id, {
    status: 'invited',
    invitedAt: new Date().toISOString(),
  });

  logger.info({ entryId: id }, 'Waitlist entry invited');
  return updated;
}

async function convertEntry(
  id: string,
  convertedUserId?: string,
): Promise<queries.WaitlistEntryRecord> {
  const entry = await queries.getWaitlistEntryById(id);
  if (!entry) throw new NotFoundError('Waitlist entry');

  if (entry.status === 'converted') {
    throw new ValidationError('Entry is already converted');
  }

  const updated = await queries.updateWaitlistEntry(id, {
    status: 'converted',
    convertedUserId: convertedUserId ?? null,
    convertedAt: new Date().toISOString(),
  });

  // Move everyone behind them up one position
  await queries.decrementPositionsAfter(entry.position);

  logger.info({ entryId: id, convertedUserId }, 'Waitlist entry converted to member');
  return updated;
}

export const waitlistService = {
  joinWaitlist,
  getPosition,
  getStats,
  listEntries,
  inviteEntry,
  convertEntry,
};
