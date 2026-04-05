// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Matching Query Builders — Match Requests, Caregiver Availability, Match History
 */
import { getPostgres } from '../postgres.js';

// ── Match Request Records ───────────────────────────────

export interface MatchRequestRecord {
  id: string;
  familyId: string;
  careRecipientId: string;
  needs: string[];
  schedule: {
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
    hoursPerWeek: number;
  };
  preferences: {
    genderPreference?: 'male' | 'female' | 'no_preference';
    languagePreference?: string[];
    maxDistanceMiles?: number;
    experienceMinYears?: number;
  };
  urgency: 'routine' | 'expedited' | 'urgent';
  status: 'open' | 'matched' | 'declined' | 'expired';
  acceptedCaregiverId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMatchRequestInput {
  familyId: string;
  careRecipientId: string;
  needs: string[];
  schedule: {
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
    hoursPerWeek: number;
  };
  preferences: {
    genderPreference?: 'male' | 'female' | 'no_preference';
    languagePreference?: string[];
    maxDistanceMiles?: number;
    experienceMinYears?: number;
  };
  urgency: 'routine' | 'expedited' | 'urgent';
}

export async function createMatchRequest(
  input: CreateMatchRequestInput,
): Promise<MatchRequestRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('match_request', {
    familyId: input.familyId,
    careRecipientId: input.careRecipientId,
    needs: input.needs,
    schedule: input.schedule,
    preferences: input.preferences,
    urgency: input.urgency,
    status: 'open',
    createdAt: now,
    updatedAt: now,
  } as Record<string, unknown>);
  return record as unknown as MatchRequestRecord;
}

export async function getMatchRequestById(id: string): Promise<MatchRequestRecord | null> {
  const db = getPostgres();
  const [record] = await db.select<Record<string, unknown>>(id);
  return (record as unknown as MatchRequestRecord) ?? null;
}

export async function listMatchRequestsByFamilyId(familyId: string): Promise<MatchRequestRecord[]> {
  const db = getPostgres();
  const result = await db.query<[MatchRequestRecord[]]>(
    'SELECT * FROM match_request WHERE familyId = $familyId ORDER BY createdAt DESC',
    { familyId },
  );
  return result[0] ?? [];
}

export async function updateMatchRequest(
  id: string,
  data: Partial<MatchRequestRecord>,
): Promise<MatchRequestRecord> {
  const db = getPostgres();
  const [record] = await db.merge(id, { ...data, updatedAt: new Date().toISOString() } as Record<
    string,
    unknown
  >);
  return record as unknown as MatchRequestRecord;
}

// ── Match History Records ───────────────────────────────

export interface MatchHistoryRecord {
  id: string;
  matchRequestId: string;
  familyId: string;
  caregiverId: string;
  matchScore: number;
  matchFactors: {
    capabilityMatch: number;
    availabilityMatch: number;
    proximityScore: number;
    experienceScore: number;
    trustScore: number;
    continuityBonus: number;
  };
  outcome: 'presented' | 'accepted' | 'declined';
  createdAt: string;
}

export async function createMatchHistory(
  input: Omit<MatchHistoryRecord, 'id' | 'createdAt'>,
): Promise<MatchHistoryRecord> {
  const db = getPostgres();
  const [record] = await db.create('match_history', {
    ...input,
    createdAt: new Date().toISOString(),
  } as Record<string, unknown>);
  return record as unknown as MatchHistoryRecord;
}

export async function listMatchHistoryByRequestId(
  matchRequestId: string,
): Promise<MatchHistoryRecord[]> {
  const db = getPostgres();
  const result = await db.query<[MatchHistoryRecord[]]>(
    'SELECT * FROM match_history WHERE matchRequestId = $matchRequestId ORDER BY matchScore DESC',
    { matchRequestId },
  );
  return result[0] ?? [];
}

export async function hasCaregiverServedFamily(
  caregiverId: string,
  familyId: string,
): Promise<boolean> {
  const db = getPostgres();
  const result = await db.query<[Array<{ count: number }>]>(
    'SELECT count() AS count FROM match_history WHERE caregiverId = $caregiverId AND familyId = $familyId AND outcome = "accepted" GROUP ALL',
    { caregiverId, familyId },
  );
  return (result[0]?.[0]?.count ?? 0) > 0;
}

// ── Caregiver Availability Records ──────────────────────

export interface CaregiverAvailabilityRecord {
  id: string;
  caregiverId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

export async function listCaregiverAvailability(
  caregiverId: string,
): Promise<CaregiverAvailabilityRecord[]> {
  const db = getPostgres();
  const result = await db.query<[CaregiverAvailabilityRecord[]]>(
    'SELECT * FROM caregiver_availability WHERE caregiverId = $caregiverId ORDER BY dayOfWeek ASC, startTime ASC',
    { caregiverId },
  );
  return result[0] ?? [];
}

// ── Caregiver Search ────────────────────────────────────

export interface CaregiverSearchResult {
  userId: string;
  displayName: string;
  totalHoursGiven: number;
  tier: string;
  trustScore: number;
  capabilities: string[];
}

export async function listActiveCaregivers(): Promise<CaregiverSearchResult[]> {
  const db = getPostgres();
  const result = await db.query<[CaregiverSearchResult[]]>(
    `SELECT
       cp.userId AS userId,
       cp.displayName AS displayName,
       cp.totalHoursGiven AS totalHoursGiven,
       cp.tier AS tier,
       cp.trustScore AS trustScore,
       array::group(cap.name) AS capabilities
     FROM community_profile AS cp
     LEFT JOIN capability AS cap ON cap.userId = cp.userId AND cap.verified = true
     GROUP BY cp.userId, cp.displayName, cp.totalHoursGiven, cp.tier, cp.trustScore`,
  );
  return result[0] ?? [];
}
