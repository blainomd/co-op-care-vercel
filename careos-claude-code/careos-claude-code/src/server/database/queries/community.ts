// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Community Query Builders — Profiles, Capabilities, Reviews
 */
import { getPostgres } from '../postgres.js';

// ── Community Profile Records ───────────────────────────

export interface CommunityProfileRecord {
  id: string;
  userId: string;
  displayName: string;
  totalHoursGiven: number;
  totalHoursReceived: number;
  trustScore: number;
  reviewCount: number;
  memberSince: string;
  tier: 'newcomer' | 'helper' | 'trusted' | 'guardian' | 'elder';
  optInLeaderboard: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommunityProfileInput {
  userId: string;
  displayName: string;
  memberSince?: string;
}

export async function createCommunityProfile(
  input: CreateCommunityProfileInput,
): Promise<CommunityProfileRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('community_profile', {
    userId: input.userId,
    displayName: input.displayName,
    totalHoursGiven: 0,
    totalHoursReceived: 0,
    trustScore: 0,
    reviewCount: 0,
    memberSince: input.memberSince ?? now,
    tier: 'newcomer',
    optInLeaderboard: false,
    createdAt: now,
    updatedAt: now,
  } as Record<string, unknown>);
  return record as unknown as CommunityProfileRecord;
}

export async function getCommunityProfileByUserId(
  userId: string,
): Promise<CommunityProfileRecord | null> {
  const db = getPostgres();
  const result = await db.query<[CommunityProfileRecord[]]>(
    'SELECT * FROM community_profile WHERE userId = $userId LIMIT 1',
    { userId },
  );
  return result[0]?.[0] ?? null;
}

export async function updateCommunityProfile(
  id: string,
  data: Partial<CommunityProfileRecord>,
): Promise<CommunityProfileRecord> {
  const db = getPostgres();
  const [record] = await db.merge(id, { ...data, updatedAt: new Date().toISOString() } as Record<
    string,
    unknown
  >);
  return record as unknown as CommunityProfileRecord;
}

export async function listLeaderboard(limit = 20): Promise<CommunityProfileRecord[]> {
  const db = getPostgres();
  const result = await db.query<[CommunityProfileRecord[]]>(
    'SELECT * FROM community_profile WHERE optInLeaderboard = true ORDER BY totalHoursGiven DESC LIMIT $limit',
    { limit },
  );
  return result[0] ?? [];
}

// ── Capability Records ──────────────────────────────────

export interface CapabilityRecord {
  id: string;
  userId: string;
  name: string;
  verified: boolean;
  verifiedAt: string | null;
  verifiedBy: string | null;
  hoursInCategory: number;
  createdAt: string;
  updatedAt: string;
}

export async function createCapability(input: {
  userId: string;
  name: string;
}): Promise<CapabilityRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('capability', {
    userId: input.userId,
    name: input.name,
    verified: false,
    verifiedAt: null,
    verifiedBy: null,
    hoursInCategory: 0,
    createdAt: now,
    updatedAt: now,
  } as Record<string, unknown>);
  return record as unknown as CapabilityRecord;
}

export async function getCapabilityById(id: string): Promise<CapabilityRecord | null> {
  const db = getPostgres();
  const [record] = await db.select<Record<string, unknown>>(id);
  return (record as unknown as CapabilityRecord) ?? null;
}

export async function listCapabilitiesByUserId(userId: string): Promise<CapabilityRecord[]> {
  const db = getPostgres();
  const result = await db.query<[CapabilityRecord[]]>(
    'SELECT * FROM capability WHERE userId = $userId ORDER BY name ASC',
    { userId },
  );
  return result[0] ?? [];
}

export async function verifyCapability(id: string, verifiedBy: string): Promise<CapabilityRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.merge(id, {
    verified: true,
    verifiedAt: now,
    verifiedBy,
    updatedAt: now,
  } as Record<string, unknown>);
  return record as unknown as CapabilityRecord;
}

// ── Review Records ──────────────────────────────────────

export interface ReviewRecord {
  id: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  taskId: string | null;
  createdAt: string;
}

export async function createReview(input: {
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  taskId?: string;
}): Promise<ReviewRecord> {
  const db = getPostgres();
  const [record] = await db.create('community_review', {
    reviewerId: input.reviewerId,
    revieweeId: input.revieweeId,
    rating: input.rating,
    comment: input.comment ?? null,
    taskId: input.taskId ?? null,
    createdAt: new Date().toISOString(),
  } as Record<string, unknown>);
  return record as unknown as ReviewRecord;
}

export async function listReviewsByUserId(userId: string): Promise<ReviewRecord[]> {
  const db = getPostgres();
  const result = await db.query<[ReviewRecord[]]>(
    'SELECT * FROM community_review WHERE revieweeId = $userId ORDER BY createdAt DESC',
    { userId },
  );
  return result[0] ?? [];
}

export async function getAverageRating(userId: string): Promise<{ avg: number; count: number }> {
  const db = getPostgres();
  const result = await db.query<[Array<{ avg: number; count: number }>]>(
    'SELECT math::mean(rating) AS avg, count() AS count FROM community_review WHERE revieweeId = $userId GROUP ALL',
    { userId },
  );
  const row = result[0]?.[0];
  return { avg: row?.avg ?? 0, count: row?.count ?? 0 };
}
