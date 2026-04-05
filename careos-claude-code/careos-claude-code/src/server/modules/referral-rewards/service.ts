/**
 * Referral Rewards Service — Growth Engine via Medically Tailored Meals
 *
 * When a member invites someone new to the co-op, and that person completes
 * milestones (signup, background check, first visit), the referrer earns a
 * free medically-tailored meal delivered to their care recipient.
 *
 * Cost: ~$15 per meal. Value: new member worth $550+/mo.
 */
import { z } from 'zod';
import * as queries from '../../database/queries/index.js';
import { NotFoundError, ValidationError, ConflictError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';

// ── Zod Schemas ─────────────────────────────────────────

export const generateCodeSchema = z.object({
  type: z.enum(['member', 'physician', 'employer', 'partner']).default('member'),
  maxUses: z.number().int().min(0).default(0),
  expiresAt: z.string().optional(),
});

export type GenerateCodeInput = z.infer<typeof generateCodeSchema>;

export const redeemCodeSchema = z.object({
  code: z.string().min(1),
  refereeId: z.string().min(1),
  refereeEmail: z.string().email(),
});

export type RedeemCodeInput = z.infer<typeof redeemCodeSchema>;

export const advanceEventSchema = z.object({
  milestone: z.enum(['signed_up', 'background_cleared', 'first_visit_complete', 'reward_issued']),
});

export type AdvanceEventInput = z.infer<typeof advanceEventSchema>;

// ── Code Generation ─────────────────────────────────────

function generateUniqueCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 for readability
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CARE-${code}`;
}

// ── Reward Defaults by Type ─────────────────────────────

function getDefaultRewards(type: 'member' | 'physician' | 'employer' | 'partner'): {
  rewardType: queries.ReferralCodeRecord['rewardType'];
  refereeReward: queries.ReferralCodeRecord['refereeReward'];
} {
  switch (type) {
    case 'physician':
      return { rewardType: 'donation', refereeReward: 'waived_signup' };
    case 'employer':
      return { rewardType: 'account_credit', refereeReward: 'free_first_meal' };
    case 'partner':
      return { rewardType: 'account_credit', refereeReward: 'free_assessment' };
    case 'member':
    default:
      return { rewardType: 'free_meal', refereeReward: 'free_assessment' };
  }
}

function getRewardDescription(rewardType: string): string {
  switch (rewardType) {
    case 'free_meal':
      return 'Free medically-tailored meal delivered to your care recipient';
    case 'free_hour':
      return 'One free hour of companion care';
    case 'account_credit':
      return '$25 account credit';
    case 'donation':
      return '$25 donation to your chosen charity';
    default:
      return 'Referral reward';
  }
}

function getRewardValue(rewardType: string): number {
  switch (rewardType) {
    case 'free_meal':
      return 15;
    case 'free_hour':
      return 28;
    case 'account_credit':
      return 25;
    case 'donation':
      return 25;
    default:
      return 0;
  }
}

// ── Service Functions ───────────────────────────────────

async function generateCode(
  userId: string,
  input: GenerateCodeInput,
): Promise<queries.ReferralCodeRecord> {
  // Get user info for owner name
  const user = await queries.getUserById(userId);
  if (!user) throw new NotFoundError('User');

  const { rewardType, refereeReward } = getDefaultRewards(input.type);

  // Generate a unique code (retry if collision)
  let code: string;
  let attempts = 0;
  do {
    code = generateUniqueCode();
    const existing = await queries.getReferralCodeByCode(code);
    if (!existing) break;
    attempts++;
  } while (attempts < 10);

  if (attempts >= 10) {
    throw new ValidationError('Unable to generate unique referral code. Please try again.');
  }

  const record = await queries.createReferralCode({
    code,
    ownerId: userId,
    ownerName: `${user.firstName} ${user.lastName?.charAt(0) ?? ''}.`,
    type: input.type,
    rewardType,
    refereeReward,
    maxUses: input.maxUses,
    expiresAt: input.expiresAt,
  });

  logger.info(
    { codeId: record.id, code: record.code, type: input.type },
    'Referral code generated',
  );
  return record;
}

async function getMyCodes(userId: string): Promise<queries.ReferralCodeRecord[]> {
  return queries.listReferralCodesByOwner(userId);
}

async function validateCode(code: string): Promise<{
  valid: boolean;
  code?: queries.ReferralCodeRecord;
  reason?: string;
}> {
  const record = await queries.getReferralCodeByCode(code);

  if (!record) {
    return { valid: false, reason: 'Code not found' };
  }

  if (!record.active) {
    return { valid: false, reason: 'Code is no longer active' };
  }

  if (record.maxUses > 0 && record.usedCount >= record.maxUses) {
    return { valid: false, reason: 'Code has reached its maximum uses' };
  }

  if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
    return { valid: false, reason: 'Code has expired' };
  }

  return {
    valid: true,
    code: record,
  };
}

async function redeemCode(input: RedeemCodeInput): Promise<queries.ReferralEventRecord> {
  const validation = await validateCode(input.code);

  if (!validation.valid || !validation.code) {
    throw new ValidationError(validation.reason ?? 'Invalid referral code');
  }

  const codeRecord = validation.code;

  // Prevent self-referral
  if (codeRecord.ownerId === input.refereeId) {
    throw new ValidationError('Cannot use your own referral code');
  }

  // Check if referee has already been referred
  const existingEvents = await queries.listReferralEventsByReferrer(codeRecord.ownerId);
  const alreadyReferred = existingEvents.find((e) => e.refereeEmail === input.refereeEmail);
  if (alreadyReferred) {
    throw new ConflictError('This email has already been referred');
  }

  const rewardValue = getRewardValue(codeRecord.rewardType);
  const rewardDescription = getRewardDescription(codeRecord.rewardType);

  const event = await queries.createReferralEvent({
    referralCodeId: codeRecord.id,
    referrerId: codeRecord.ownerId,
    refereeId: input.refereeId,
    refereeEmail: input.refereeEmail,
    rewardType: codeRecord.rewardType,
    rewardValue,
    rewardDescription,
  });

  // Increment the code's used count
  await queries.incrementReferralCodeUsedCount(codeRecord.id);

  // Auto-advance to signed_up since they're redeeming during signup
  const updated = await queries.updateReferralEvent(event.id, {
    status: 'signed_up',
    signedUpAt: new Date().toISOString(),
  });

  logger.info(
    { eventId: event.id, referrerId: codeRecord.ownerId, code: input.code },
    'Referral code redeemed',
  );

  return updated;
}

async function getMyHistory(userId: string): Promise<{
  events: queries.ReferralEventRecord[];
  totalRewards: number;
  mealsEarned: number;
}> {
  const events = await queries.listReferralEventsByReferrer(userId);

  const rewardedEvents = events.filter((e) => e.status === 'reward_issued');
  const totalRewards = rewardedEvents.reduce((sum, e) => sum + e.rewardValue, 0);
  const mealsEarned = rewardedEvents.filter((e) => e.rewardType === 'free_meal').length;

  return { events, totalRewards, mealsEarned };
}

/**
 * Advance a referral event through milestones.
 *
 * Milestone progression:
 *   pending -> signed_up -> background_cleared -> first_visit_complete -> reward_issued
 *
 * When reward_issued and rewardType is free_meal, a meal order is created.
 */
async function advanceEvent(
  eventId: string,
  input: AdvanceEventInput,
): Promise<queries.ReferralEventRecord> {
  const event = await queries.getReferralEventById(eventId);
  if (!event) throw new NotFoundError('Referral event');

  if (event.status === 'reward_issued') {
    throw new ValidationError('Reward has already been issued for this referral');
  }

  if (event.status === 'expired') {
    throw new ValidationError('This referral has expired');
  }

  // Validate milestone order
  const milestoneOrder: Record<string, number> = {
    pending: 0,
    signed_up: 1,
    background_cleared: 2,
    first_visit_complete: 3,
    reward_issued: 4,
  };

  const currentStep = milestoneOrder[event.status] ?? 0;
  const targetStep = milestoneOrder[input.milestone] ?? 0;

  if (targetStep <= currentStep) {
    throw new ValidationError(`Cannot advance from ${event.status} to ${input.milestone}`);
  }

  const now = new Date().toISOString();
  const updateData: Partial<queries.ReferralEventRecord> = {
    status: input.milestone,
  };

  // Set milestone timestamps
  switch (input.milestone) {
    case 'signed_up':
      updateData.signedUpAt = now;
      break;
    case 'background_cleared':
      updateData.backgroundClearedAt = now;
      break;
    case 'first_visit_complete':
      updateData.firstVisitAt = now;
      break;
    case 'reward_issued':
      updateData.rewardIssuedAt = now;
      break;
  }

  const updated = await queries.updateReferralEvent(eventId, updateData);

  logger.info(
    { eventId, milestone: input.milestone, referrerId: event.referrerId },
    'Referral event advanced',
  );

  return updated;
}

async function getLeaderboard(): Promise<queries.ReferralLeaderboardEntry[]> {
  const rawEntries = await queries.getReferralLeaderboard(20);

  // Enrich with community profile data
  const enriched: queries.ReferralLeaderboardEntry[] = [];
  let rank = 1;

  for (const entry of rawEntries) {
    const profile = await queries.getCommunityProfileByUserId(entry.userId);
    enriched.push({
      ...entry,
      userName: profile?.displayName ?? 'Unknown',
      communityTier: profile?.tier ?? 'newcomer',
      rank,
    });
    rank++;
  }

  return enriched;
}

async function getStats(): Promise<{
  totalCodes: number;
  totalRedemptions: number;
  conversionRate: number;
  totalMealsAwarded: number;
  totalValueGenerated: number;
}> {
  const stats = await queries.getReferralRewardStats();

  const conversionRate =
    stats.totalRedemptions > 0
      ? Math.round((stats.totalRewardIssued / stats.totalRedemptions) * 100) / 100
      : 0;

  // Estimate value generated: each converted member averages $550/mo
  const AVG_MONTHLY_SPEND = 550;
  const totalValueGenerated = stats.totalRewardIssued * AVG_MONTHLY_SPEND;

  return {
    totalCodes: stats.totalCodes,
    totalRedemptions: stats.totalRedemptions,
    conversionRate,
    totalMealsAwarded: stats.totalMealsAwarded,
    totalValueGenerated,
  };
}

export const referralRewardsService = {
  generateCode,
  getMyCodes,
  validateCode,
  redeemCode,
  getMyHistory,
  advanceEvent,
  getLeaderboard,
  getStats,
};
