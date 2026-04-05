// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Time Bank Query Builders — Accounts, Transactions, Tasks, Matching
 */
import { getPostgres } from '../postgres.js';
import type { TaskType } from '@shared/constants/business-rules';
import type { TaskStatus, LedgerEntryType } from '@shared/types/timebank.types';

// ── Time Bank Accounts ─────────────────────────────────

export interface AccountRecord {
  id: string;
  userId: string;
  balanceEarned: number;
  balanceMembership: number;
  balanceBought: number;
  balanceSpent: number;
  balanceDonated: number;
  balanceExpired: number;
  balanceDeficit: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityAt: string | null;
  createdAt: string;
}

export async function getOrCreateAccount(userId: string): Promise<AccountRecord> {
  const db = getPostgres();
  const result = await db.query<[AccountRecord[]]>(
    'SELECT * FROM timebank_account WHERE userId = type::thing("user", $userId) LIMIT 1',
    { userId },
  );

  if (result[0]?.[0]) return result[0][0];

  const [account] = await db.create('timebank_account', {
    userId,
    balanceEarned: 0,
    balanceMembership: 0,
    balanceBought: 0,
    balanceSpent: 0,
    balanceDonated: 0,
    balanceExpired: 0,
    balanceDeficit: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityAt: null,
  } as Record<string, unknown>);
  return account as unknown as AccountRecord;
}

export async function updateAccountBalance(
  userId: string,
  field:
    | 'balanceEarned'
    | 'balanceMembership'
    | 'balanceBought'
    | 'balanceSpent'
    | 'balanceDonated'
    | 'balanceExpired'
    | 'balanceDeficit',
  delta: number,
): Promise<AccountRecord | null> {
  const db = getPostgres();
  const result = await db.query<[AccountRecord[]]>(
    `UPDATE timebank_account SET ${field} += $delta, lastActivityAt = time::now()
     WHERE userId = type::thing("user", $userId)
     RETURN AFTER`,
    { userId, delta },
  );
  return result[0]?.[0] ?? null;
}

export async function updateStreak(
  userId: string,
  currentStreak: number,
  longestStreak: number,
): Promise<void> {
  const db = getPostgres();
  await db.query(
    `UPDATE timebank_account SET currentStreak = $current, longestStreak = $longest
     WHERE userId = type::thing("user", $userId)`,
    { userId, current: currentStreak, longest: longestStreak },
  );
}

export async function creditMembershipFloor(userId: string, hours: number): Promise<void> {
  const db = getPostgres();
  await db.query(
    `UPDATE timebank_account SET balanceMembership = $hours, lastActivityAt = time::now()
     WHERE userId = type::thing("user", $userId)`,
    { userId, hours },
  );
}

// ── Ledger Transactions ────────────────────────────────

export interface TransactionRecord {
  id: string;
  accountId: string;
  type: LedgerEntryType;
  hours: number;
  balanceAfter: number;
  taskId: string | null;
  description: string;
  createdAt: string;
}

export async function createTransaction(input: {
  accountId: string;
  type: LedgerEntryType;
  hours: number;
  balanceAfter: number;
  taskId?: string;
  description: string;
}): Promise<TransactionRecord> {
  const db = getPostgres();
  const [tx] = await db.create('timebank_transaction', {
    ...input,
    taskId: input.taskId ?? null,
  } as Record<string, unknown>);
  return tx as unknown as TransactionRecord;
}

export async function getTransactionHistory(
  userId: string,
  limit = 50,
  offset = 0,
): Promise<TransactionRecord[]> {
  const db = getPostgres();
  const result = await db.query<[TransactionRecord[]]>(
    `SELECT * FROM timebank_transaction
     WHERE accountId IN (SELECT id FROM timebank_account WHERE userId = type::thing("user", $userId))
     ORDER BY createdAt DESC
     LIMIT $limit START $offset`,
    { userId, limit, offset },
  );
  return result[0] ?? [];
}

// ── Tasks ──────────────────────────────────────────────

export interface TaskRecord {
  id: string;
  requesterId: string;
  careRecipientId: string | null;
  taskType: TaskType;
  title: string;
  description: string | null;
  location: { type: 'Point'; coordinates: [number, number] };
  estimatedHours: number;
  status: TaskStatus;
  matchedUserId: string | null;
  checkInTime: string | null;
  checkInLocation: { type: 'Point'; coordinates: [number, number] } | null;
  checkOutTime: string | null;
  checkOutLocation: { type: 'Point'; coordinates: [number, number] } | null;
  actualHours: number | null;
  omahaProblemCode: number | null;
  interventionCategory: string | null;
  rating: number | null;
  gratitudeNote: string | null;
  scheduledFor: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  requesterId: string;
  careRecipientId?: string;
  taskType: TaskType;
  title: string;
  description?: string;
  location: { type: 'Point'; coordinates: [number, number] };
  estimatedHours: number;
  omahaProblemCode?: number;
  interventionCategory?: string;
  scheduledFor?: string;
}

export async function createTask(input: CreateTaskInput): Promise<TaskRecord> {
  const db = getPostgres();
  const [task] = await db.create('timebank_task', {
    ...input,
    careRecipientId: input.careRecipientId ?? null,
    description: input.description ?? null,
    status: 'open',
    matchedUserId: null,
    checkInTime: null,
    checkInLocation: null,
    checkOutTime: null,
    checkOutLocation: null,
    actualHours: null,
    omahaProblemCode: input.omahaProblemCode ?? null,
    interventionCategory: input.interventionCategory ?? null,
    rating: null,
    gratitudeNote: null,
    scheduledFor: input.scheduledFor ?? null,
    expiresAt: null,
  } as Record<string, unknown>);
  return task as unknown as TaskRecord;
}

export async function getTaskById(id: string): Promise<TaskRecord | null> {
  const db = getPostgres();
  const result = await db.query<[TaskRecord[]]>(
    'SELECT * FROM type::thing("timebank_task", $id) LIMIT 1',
    { id },
  );
  return result[0]?.[0] ?? null;
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
  extra?: Partial<TaskRecord>,
): Promise<TaskRecord | null> {
  const db = getPostgres();
  const data = { status, ...extra, updatedAt: new Date().toISOString() };
  const result = await db.query<[TaskRecord[]]>(
    `UPDATE type::thing("timebank_task", $id) MERGE $data RETURN AFTER`,
    { id, data },
  );
  return result[0]?.[0] ?? null;
}

export async function listOpenTasks(limit = 50): Promise<TaskRecord[]> {
  const db = getPostgres();
  const result = await db.query<[TaskRecord[]]>(
    `SELECT * FROM timebank_task WHERE status = 'open' ORDER BY createdAt DESC LIMIT $limit`,
    { limit },
  );
  return result[0] ?? [];
}

export async function listOpenTasksNear(
  longitude: number,
  latitude: number,
  radiusMiles: number,
  limit = 50,
): Promise<Array<TaskRecord & { distanceMiles: number }>> {
  const db = getPostgres();
  const radiusMeters = radiusMiles * 1609.34;
  const result = await db.query<[Array<TaskRecord & { distanceMiles: number }>]>(
    `SELECT *, geo::distance(location, { type: 'Point', coordinates: [$lng, $lat] }) / 1609.34 AS distanceMiles
     FROM timebank_task
     WHERE status = 'open'
       AND geo::distance(location, { type: 'Point', coordinates: [$lng, $lat] }) < $radius
     ORDER BY distanceMiles ASC
     LIMIT $limit`,
    { lng: longitude, lat: latitude, radius: radiusMeters, limit },
  );
  return result[0] ?? [];
}

export async function listUserTasks(userId: string): Promise<TaskRecord[]> {
  const db = getPostgres();
  const result = await db.query<[TaskRecord[]]>(
    `SELECT * FROM timebank_task
     WHERE requesterId = type::thing("user", $userId)
        OR matchedUserId = type::thing("user", $userId)
     ORDER BY updatedAt DESC`,
    { userId },
  );
  return result[0] ?? [];
}

export async function listCompletedTasks(limit = 500): Promise<TaskRecord[]> {
  const db = getPostgres();
  const result = await db.query<[TaskRecord[]]>(
    `SELECT * FROM timebank_task WHERE status = 'completed' ORDER BY updatedAt DESC LIMIT $limit`,
    { limit },
  );
  return result[0] ?? [];
}

// ── Cascade Chain (Graph Traversal) ────────────────────

export interface CascadeNode {
  userId: string;
  helpedUserId: string;
  hours: number;
  createdAt: string;
}

export async function getCascadeChain(userId: string, depth = 3): Promise<CascadeNode[]> {
  const db = getPostgres();
  const result = await db.query<[CascadeNode[]]>(
    `SELECT in AS userId, out AS helpedUserId, hours, createdAt
     FROM helped
     WHERE in = type::thing("user", $userId)
        OR out = type::thing("user", $userId)
     ORDER BY createdAt DESC
     LIMIT ${depth * 10}`,
    { userId },
  );
  return result[0] ?? [];
}

export async function recordHelped(
  helperId: string,
  helpedId: string,
  taskId: string,
  hours: number,
): Promise<void> {
  const db = getPostgres();
  await db.query(
    `RELATE type::thing("user", $helperId)->helped->type::thing("user", $helpedId)
     SET taskId = type::thing("timebank_task", $taskId), hours = $hours`,
    { helperId, helpedId, taskId, hours },
  );
}

// ── Respite Fund ───────────────────────────────────────

export interface RespiteFundRecord {
  id: string;
  balanceHours: number;
  balanceDollars: number;
  autoApprovalThreshold: number;
}

export async function getRespiteFund(): Promise<RespiteFundRecord | null> {
  const db = getPostgres();
  const result = await db.query<[RespiteFundRecord[]]>('SELECT * FROM respite_fund LIMIT 1');
  return result[0]?.[0] ?? null;
}

export async function updateRespiteFund(deltaHours: number, deltaDollars: number): Promise<void> {
  const db = getPostgres();
  await db.query(`UPDATE respite_fund SET balanceHours += $dh, balanceDollars += $dd`, {
    dh: deltaHours,
    dd: deltaDollars,
  });
}

export async function getOrCreateRespiteFund(
  autoApprovalThreshold: number,
): Promise<RespiteFundRecord> {
  const existing = await getRespiteFund();
  if (existing) return existing;

  const db = getPostgres();
  const [fund] = await db.create('respite_fund', {
    balanceHours: 0,
    balanceDollars: 0,
    autoApprovalThreshold,
  } as Record<string, unknown>);
  return fund as unknown as RespiteFundRecord;
}

// ── Respite Fund Transactions ─────────────────────────

export interface RespiteFundTxRecord {
  id: string;
  type: 'contribution_hours' | 'contribution_dollars' | 'disbursement';
  hours: number;
  dollars: number;
  sourceUserId: string | null;
  recipientUserId: string | null;
  description: string;
  createdAt: string;
}

export async function createRespiteFundTx(input: {
  type: 'contribution_hours' | 'contribution_dollars' | 'disbursement';
  hours: number;
  dollars: number;
  sourceUserId?: string;
  recipientUserId?: string;
  description: string;
}): Promise<RespiteFundTxRecord> {
  const db = getPostgres();
  const [tx] = await db.create('respite_fund_tx', {
    ...input,
    sourceUserId: input.sourceUserId ?? null,
    recipientUserId: input.recipientUserId ?? null,
  } as Record<string, unknown>);
  return tx as unknown as RespiteFundTxRecord;
}

// ── User Streak ───────────────────────────────────────

export interface StreakRecord {
  id: string;
  userId: string;
  currentWeeks: number;
  longestWeeks: number;
  nextMilestone: number | null;
  lastActivityAt: string;
}

export async function getStreakByUserId(userId: string): Promise<StreakRecord | null> {
  const db = getPostgres();
  const result = await db.query<[StreakRecord[]]>(
    'SELECT * FROM user_streak WHERE userId = type::thing("user", $userId) LIMIT 1',
    { userId },
  );
  return result[0]?.[0] ?? null;
}

export async function createStreakRecord(input: {
  userId: string;
  currentWeeks: number;
  longestWeeks: number;
  nextMilestone: number | null;
}): Promise<StreakRecord> {
  const db = getPostgres();
  const [record] = await db.create('user_streak', {
    ...input,
  } as Record<string, unknown>);
  return record as unknown as StreakRecord;
}

export async function updateStreakByUserId(
  userId: string,
  data: Partial<Pick<StreakRecord, 'currentWeeks' | 'longestWeeks' | 'nextMilestone'>>,
): Promise<void> {
  const db = getPostgres();
  await db.query(
    `UPDATE user_streak SET
      currentWeeks = $currentWeeks, longestWeeks = $longestWeeks,
      nextMilestone = $nextMilestone, lastActivityAt = time::now()
    WHERE userId = type::thing("user", $userId)`,
    { userId, ...data },
  );
}

// ── Graph Helpers (Cascade BFS) ───────────────────────

export async function getDirectlyHelpedByUser(
  userId: string,
): Promise<Array<{ id: string; firstName: string; lastName: string }>> {
  const db = getPostgres();
  const result = await db.query<
    [Array<{ helped: Array<{ id: string; firstName: string; lastName: string }> }>]
  >(`SELECT ->helped->user.* AS helped FROM type::thing("user", $userId)`, { userId });
  const row = result[0]?.[0];
  return row?.helped ?? [];
}

export async function countHelpedEdgesFrom(userId: string): Promise<number> {
  const db = getPostgres();
  const result = await db.query<[Array<{ count: number }>]>(
    `SELECT count() AS count FROM helped WHERE in = type::thing("user", $userId) GROUP ALL`,
    { userId },
  );
  return result[0]?.[0]?.count ?? 0;
}

export async function recordHelpedEdge(
  helperId: string,
  helpedUserId: string,
  taskId: string,
): Promise<void> {
  const db = getPostgres();
  await db.query(
    `RELATE type::thing("user", $helperId)->helped->type::thing("user", $helpedUserId)
     SET taskId = type::thing("timebank_task", $taskId), createdAt = time::now()`,
    { helperId, helpedUserId, taskId },
  );
}

// ── Account Balance Bulk Update ───────────────────────

export async function setAccountBalances(
  userId: string,
  balances: {
    balanceEarned: number;
    balanceSpent: number;
    balanceBought: number;
    balanceDonated: number;
    balanceExpired: number;
    balanceDeficit: number;
  },
): Promise<AccountRecord | null> {
  const db = getPostgres();
  const result = await db.query<[AccountRecord[]]>(
    `UPDATE timebank_account SET
      balanceEarned = $balanceEarned, balanceSpent = $balanceSpent,
      balanceBought = $balanceBought, balanceDonated = $balanceDonated,
      balanceExpired = $balanceExpired, balanceDeficit = $balanceDeficit,
      lastActivityAt = time::now()
    WHERE userId = type::thing("user", $userId)
    RETURN AFTER`,
    { userId, ...balances },
  );
  return result[0]?.[0] ?? null;
}
