// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Waitlist Query Builders — Lead capture, waitlist management, FOMO engine
 */
import { getPostgres } from '../postgres.js';

// ── Waitlist Entry Records ──────────────────────────────

export interface WaitlistEntryRecord {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  source: 'homepage_quiz' | 'referral' | 'social_share' | 'physician' | 'employer' | 'direct';
  quizScore: number | null;
  quizZone: 'green' | 'yellow' | 'red' | null;
  interests: string[];
  zipCode: string | null;
  role: 'family' | 'caregiver' | 'neighbor' | 'employer' | 'physician' | null;
  referredBy: string | null;
  status: 'waiting' | 'invited' | 'converted' | 'declined';
  priority: number;
  position: number;
  convertedUserId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  invitedAt: string | null;
  convertedAt: string | null;
}

export interface CreateWaitlistEntryInput {
  email: string;
  name?: string;
  phone?: string;
  source: 'homepage_quiz' | 'referral' | 'social_share' | 'physician' | 'employer' | 'direct';
  quizScore?: number;
  quizZone?: 'green' | 'yellow' | 'red';
  interests: string[];
  zipCode?: string;
  role?: 'family' | 'caregiver' | 'neighbor' | 'employer' | 'physician';
  referredBy?: string;
  metadata?: Record<string, unknown>;
}

export async function createWaitlistEntry(
  input: CreateWaitlistEntryInput & { priority: number; position: number },
): Promise<WaitlistEntryRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('waitlist_entry', {
    email: input.email,
    name: input.name ?? null,
    phone: input.phone ?? null,
    source: input.source,
    quizScore: input.quizScore ?? null,
    quizZone: input.quizZone ?? null,
    interests: input.interests,
    zipCode: input.zipCode ?? null,
    role: input.role ?? null,
    referredBy: input.referredBy ?? null,
    status: 'waiting',
    priority: input.priority,
    position: input.position,
    convertedUserId: null,
    metadata: input.metadata ?? null,
    createdAt: now,
    invitedAt: null,
    convertedAt: null,
  } as Record<string, unknown>);
  return record as unknown as WaitlistEntryRecord;
}

export async function getWaitlistEntryByEmail(email: string): Promise<WaitlistEntryRecord | null> {
  const db = getPostgres();
  const result = await db.query<[WaitlistEntryRecord[]]>(
    'SELECT * FROM waitlist_entry WHERE email = $email LIMIT 1',
    { email },
  );
  return result[0]?.[0] ?? null;
}

export async function getWaitlistEntryById(id: string): Promise<WaitlistEntryRecord | null> {
  const db = getPostgres();
  const [record] = await db.select<Record<string, unknown>>(id);
  return (record as unknown as WaitlistEntryRecord) ?? null;
}

export async function updateWaitlistEntry(
  id: string,
  data: Partial<WaitlistEntryRecord>,
): Promise<WaitlistEntryRecord> {
  const db = getPostgres();
  const [record] = await db.merge(id, data as Record<string, unknown>);
  return record as unknown as WaitlistEntryRecord;
}

export async function listWaitlistEntries(filters?: {
  status?: string;
  source?: string;
  quizZone?: string;
  limit?: number;
  offset?: number;
}): Promise<WaitlistEntryRecord[]> {
  const db = getPostgres();
  let query = 'SELECT * FROM waitlist_entry';
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (filters?.status) {
    conditions.push('status = $status');
    params.status = filters.status;
  }
  if (filters?.source) {
    conditions.push('source = $source');
    params.source = filters.source;
  }
  if (filters?.quizZone) {
    conditions.push('quizZone = $quizZone');
    params.quizZone = filters.quizZone;
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY priority DESC, position ASC';

  if (filters?.limit) {
    query += ' LIMIT $limit';
    params.limit = filters.limit;
  }
  if (filters?.offset) {
    query += ' START $offset';
    params.offset = filters.offset;
  }

  const result = await db.query<[WaitlistEntryRecord[]]>(query, params);
  return result[0] ?? [];
}

export async function getWaitlistCount(): Promise<number> {
  const db = getPostgres();
  const result = await db.query<[Array<{ count: number }>]>(
    'SELECT count() AS count FROM waitlist_entry WHERE status = "waiting" GROUP ALL',
  );
  return result[0]?.[0]?.count ?? 0;
}

export async function getConvertedCount(): Promise<number> {
  const db = getPostgres();
  const result = await db.query<[Array<{ count: number }>]>(
    'SELECT count() AS count FROM waitlist_entry WHERE status = "converted" GROUP ALL',
  );
  return result[0]?.[0]?.count ?? 0;
}

export async function getNextPosition(): Promise<number> {
  const db = getPostgres();
  const result = await db.query<[Array<{ maxPos: number }>]>(
    'SELECT math::max(position) AS maxPos FROM waitlist_entry GROUP ALL',
  );
  return (result[0]?.[0]?.maxPos ?? 0) + 1;
}

export async function decrementPositionsAfter(position: number): Promise<void> {
  const db = getPostgres();
  await db.query(
    'UPDATE waitlist_entry SET position = position - 1 WHERE position > $position AND status = "waiting"',
    { position },
  );
}

export async function getWaitlistStats(): Promise<{
  totalWaiting: number;
  avgWaitDays: number;
  convertedCount: number;
}> {
  const db = getPostgres();

  const countResult = await db.query<[Array<{ count: number }>]>(
    'SELECT count() AS count FROM waitlist_entry WHERE status = "waiting" GROUP ALL',
  );
  const totalWaiting = countResult[0]?.[0]?.count ?? 0;

  const avgResult = await db.query<[Array<{ avgDays: number }>]>(
    `SELECT math::mean(
       time::unix(time::now()) - time::unix(createdAt)
     ) / 86400 AS avgDays
     FROM waitlist_entry WHERE status = "waiting" GROUP ALL`,
  );
  const avgWaitDays = Math.round(avgResult[0]?.[0]?.avgDays ?? 0);

  const convertedResult = await db.query<[Array<{ count: number }>]>(
    'SELECT count() AS count FROM waitlist_entry WHERE status = "converted" GROUP ALL',
  );
  const convertedCount = convertedResult[0]?.[0]?.count ?? 0;

  return { totalWaiting, avgWaitDays, convertedCount };
}
