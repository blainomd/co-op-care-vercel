// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Referral Rewards Query Builders — Codes, Events, Leaderboard
 *
 * Tracks referral codes, redemption events, milestone progression,
 * and the referral leaderboard for cooperative growth.
 */
import { getPostgres } from '../postgres.js';

// ── Referral Code Records ────────────────────────────────

export interface ReferralCodeRecord {
  id: string;
  code: string;
  ownerId: string;
  ownerName: string;
  type: 'member' | 'physician' | 'employer' | 'partner';
  rewardType: 'free_meal' | 'free_hour' | 'account_credit' | 'donation';
  refereeReward: 'free_assessment' | 'free_first_meal' | 'waived_signup';
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreateReferralCodeInput {
  code: string;
  ownerId: string;
  ownerName: string;
  type: ReferralCodeRecord['type'];
  rewardType: ReferralCodeRecord['rewardType'];
  refereeReward: ReferralCodeRecord['refereeReward'];
  maxUses: number;
  expiresAt?: string;
}

export async function createReferralCode(
  input: CreateReferralCodeInput,
): Promise<ReferralCodeRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('referral_code', {
    code: input.code,
    ownerId: input.ownerId,
    ownerName: input.ownerName,
    type: input.type,
    rewardType: input.rewardType,
    refereeReward: input.refereeReward,
    maxUses: input.maxUses,
    usedCount: 0,
    active: true,
    expiresAt: input.expiresAt ?? null,
    createdAt: now,
  } as Record<string, unknown>);
  return record as unknown as ReferralCodeRecord;
}

export async function getReferralCodeByCode(code: string): Promise<ReferralCodeRecord | null> {
  const db = getPostgres();
  const records = await db.query<[ReferralCodeRecord[]]>(
    'SELECT * FROM referral_code WHERE code = $code LIMIT 1',
    { code },
  );
  return records[0]?.[0] ?? null;
}

export async function getReferralCodeById(id: string): Promise<ReferralCodeRecord | null> {
  const db = getPostgres();
  const [record] = await db.select<Record<string, unknown>>(id);
  return (record as unknown as ReferralCodeRecord) ?? null;
}

export async function listReferralCodesByOwner(ownerId: string): Promise<ReferralCodeRecord[]> {
  const db = getPostgres();
  const records = await db.query<[ReferralCodeRecord[]]>(
    'SELECT * FROM referral_code WHERE ownerId = $ownerId ORDER BY createdAt DESC',
    { ownerId },
  );
  return records[0] ?? [];
}

export async function incrementReferralCodeUsedCount(id: string): Promise<ReferralCodeRecord> {
  const db = getPostgres();
  const records = await db.query<[ReferralCodeRecord[]]>(
    'UPDATE $id SET usedCount += 1 RETURN AFTER',
    { id },
  );
  return records[0]![0]!;
}

export async function deactivateReferralCode(id: string): Promise<ReferralCodeRecord> {
  const db = getPostgres();
  const [record] = await db.merge(id, {
    active: false,
  } as Record<string, unknown>);
  return record as unknown as ReferralCodeRecord;
}

// ── Referral Event Records ───────────────────────────────

export interface ReferralEventRecord {
  id: string;
  referralCodeId: string;
  referrerId: string;
  refereeId: string;
  refereeEmail: string;
  status:
    | 'pending'
    | 'signed_up'
    | 'background_cleared'
    | 'first_visit_complete'
    | 'reward_issued'
    | 'expired';
  signedUpAt: string | null;
  backgroundClearedAt: string | null;
  firstVisitAt: string | null;
  rewardIssuedAt: string | null;
  rewardType: string;
  rewardValue: number;
  rewardDescription: string;
  mealOrderId: string | null;
  createdAt: string;
}

export interface CreateReferralEventInput {
  referralCodeId: string;
  referrerId: string;
  refereeId: string;
  refereeEmail: string;
  rewardType: string;
  rewardValue: number;
  rewardDescription: string;
}

export async function createReferralEvent(
  input: CreateReferralEventInput,
): Promise<ReferralEventRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('referral_event', {
    referralCodeId: input.referralCodeId,
    referrerId: input.referrerId,
    refereeId: input.refereeId,
    refereeEmail: input.refereeEmail,
    status: 'pending',
    signedUpAt: now,
    backgroundClearedAt: null,
    firstVisitAt: null,
    rewardIssuedAt: null,
    rewardType: input.rewardType,
    rewardValue: input.rewardValue,
    rewardDescription: input.rewardDescription,
    mealOrderId: null,
    createdAt: now,
  } as Record<string, unknown>);
  return record as unknown as ReferralEventRecord;
}

export async function getReferralEventById(id: string): Promise<ReferralEventRecord | null> {
  const db = getPostgres();
  const [record] = await db.select<Record<string, unknown>>(id);
  return (record as unknown as ReferralEventRecord) ?? null;
}

export async function listReferralEventsByReferrer(
  referrerId: string,
): Promise<ReferralEventRecord[]> {
  const db = getPostgres();
  const records = await db.query<[ReferralEventRecord[]]>(
    'SELECT * FROM referral_event WHERE referrerId = $referrerId ORDER BY createdAt DESC',
    { referrerId },
  );
  return records[0] ?? [];
}

export async function updateReferralEvent(
  id: string,
  data: Partial<ReferralEventRecord>,
): Promise<ReferralEventRecord> {
  const db = getPostgres();
  const [record] = await db.merge(id, data as Record<string, unknown>);
  return record as unknown as ReferralEventRecord;
}

export async function listReferralEventsByCode(
  referralCodeId: string,
): Promise<ReferralEventRecord[]> {
  const db = getPostgres();
  const records = await db.query<[ReferralEventRecord[]]>(
    'SELECT * FROM referral_event WHERE referralCodeId = $referralCodeId ORDER BY createdAt DESC',
    { referralCodeId },
  );
  return records[0] ?? [];
}

// ── Leaderboard ──────────────────────────────────────────

export interface ReferralLeaderboardEntry {
  userId: string;
  userName: string;
  communityTier: string;
  totalReferrals: number;
  successfulReferrals: number;
  totalRewardsEarned: number;
  mealsEarned: number;
  rank: number;
}

export async function getReferralLeaderboard(
  limit: number = 20,
): Promise<ReferralLeaderboardEntry[]> {
  const db = getPostgres();
  const records = await db.query<[ReferralLeaderboardEntry[]]>(
    `SELECT
       referrerId AS userId,
       count() AS totalReferrals,
       count(status = 'reward_issued' OR NULL) AS successfulReferrals,
       math::sum(IF status = 'reward_issued' THEN rewardValue ELSE 0 END) AS totalRewardsEarned,
       count((status = 'reward_issued' AND rewardType = 'free_meal') OR NULL) AS mealsEarned
     FROM referral_event
     GROUP BY referrerId
     ORDER BY successfulReferrals DESC
     LIMIT $limit`,
    { limit },
  );
  return records[0] ?? [];
}

// ── Stats ────────────────────────────────────────────────

export interface ReferralStats {
  totalCodes: number;
  totalRedemptions: number;
  totalRewardIssued: number;
  totalMealsAwarded: number;
}

export async function getReferralRewardStats(): Promise<ReferralStats> {
  const db = getPostgres();
  const codeCountResult = await db.query<[{ count: number }[]]>(
    'SELECT count() AS count FROM referral_code GROUP ALL',
  );
  const eventCountResult = await db.query<[{ count: number }[]]>(
    'SELECT count() AS count FROM referral_event GROUP ALL',
  );
  const rewardCountResult = await db.query<[{ count: number }[]]>(
    "SELECT count() AS count FROM referral_event WHERE status = 'reward_issued' GROUP ALL",
  );
  const mealCountResult = await db.query<[{ count: number }[]]>(
    "SELECT count() AS count FROM referral_event WHERE status = 'reward_issued' AND rewardType = 'free_meal' GROUP ALL",
  );

  return {
    totalCodes: codeCountResult[0]?.[0]?.count ?? 0,
    totalRedemptions: eventCountResult[0]?.[0]?.count ?? 0,
    totalRewardIssued: rewardCountResult[0]?.[0]?.count ?? 0,
    totalMealsAwarded: mealCountResult[0]?.[0]?.count ?? 0,
  };
}
