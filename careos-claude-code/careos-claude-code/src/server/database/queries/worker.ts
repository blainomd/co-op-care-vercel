// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Worker Query Builders — Shifts, Care Logs, Shift Swaps
 */
import { getPostgres } from '../postgres.js';
import type { ShiftStatus, CareLogCategory, ShiftSwapStatus } from '@shared/types/worker.types';

// ── Shift Records ─────────────────────────────────────────

export interface ShiftRecord {
  id: string;
  workerId: string;
  careRecipientId: string;
  careRecipientName: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  status: ShiftStatus;
  checkInLocation: { type: 'Point'; coordinates: [number, number] } | null;
  checkOutLocation: { type: 'Point'; coordinates: [number, number] } | null;
  breaks: Array<{ startedAt: string; endedAt: string | null; durationMinutes: number | null }>;
  totalBreakMinutes: number;
  billableHours: number | null;
  notes: string | null;
  address: string | null;
  taskTypes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateShiftInput {
  workerId: string;
  careRecipientId: string;
  careRecipientName?: string;
  scheduledStart: string;
  scheduledEnd: string;
  address?: string;
  taskTypes?: string[];
}

export async function createShift(input: CreateShiftInput): Promise<ShiftRecord> {
  const db = getPostgres();
  const [shift] = await db.create('shift', {
    workerId: input.workerId,
    careRecipientId: input.careRecipientId,
    careRecipientName: input.careRecipientName ?? null,
    scheduledStart: input.scheduledStart,
    scheduledEnd: input.scheduledEnd,
    actualStart: null,
    actualEnd: null,
    status: 'scheduled',
    checkInLocation: null,
    checkOutLocation: null,
    breaks: [],
    totalBreakMinutes: 0,
    billableHours: null,
    notes: null,
    address: input.address ?? null,
    taskTypes: input.taskTypes ?? [],
  } as Record<string, unknown>);
  return shift as unknown as ShiftRecord;
}

export async function getShiftById(id: string): Promise<ShiftRecord | null> {
  const db = getPostgres();
  const result = await db.query<[ShiftRecord[]]>(
    'SELECT * FROM type::thing("shift", $id) LIMIT 1',
    { id },
  );
  return result[0]?.[0] ?? null;
}

export async function updateShift(
  id: string,
  data: Partial<Omit<ShiftRecord, 'id' | 'createdAt'>>,
): Promise<ShiftRecord | null> {
  const db = getPostgres();
  const result = await db.query<[ShiftRecord[]]>(
    'UPDATE type::thing("shift", $id) MERGE $data RETURN AFTER',
    { id, data: { ...data, updatedAt: new Date().toISOString() } },
  );
  return result[0]?.[0] ?? null;
}

export async function listWorkerShifts(
  workerId: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<ShiftRecord[]> {
  const db = getPostgres();
  let query = 'SELECT * FROM shift WHERE workerId = type::thing("user", $workerId)';
  const params: Record<string, unknown> = { workerId };

  if (dateFrom) {
    query += ' AND scheduledStart >= $dateFrom';
    params.dateFrom = dateFrom;
  }
  if (dateTo) {
    query += ' AND scheduledStart <= $dateTo';
    params.dateTo = dateTo;
  }

  query += ' ORDER BY scheduledStart ASC';

  const result = await db.query<[ShiftRecord[]]>(query, params);
  return result[0] ?? [];
}

export async function listTodayShifts(workerId: string): Promise<ShiftRecord[]> {
  const db = getPostgres();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = await db.query<[ShiftRecord[]]>(
    `SELECT * FROM shift
     WHERE workerId = type::thing("user", $workerId)
       AND scheduledStart >= $today
       AND scheduledStart < $tomorrow
     ORDER BY scheduledStart ASC`,
    {
      workerId,
      today: today.toISOString(),
      tomorrow: tomorrow.toISOString(),
    },
  );
  return result[0] ?? [];
}

// ── Care Interaction / Care Log Records ───────────────────

export interface CareLogRecord {
  id: string;
  shiftId: string;
  workerId: string;
  careRecipientId: string;
  category: CareLogCategory;
  notes: string;
  omahaProblems: number[];
  vitals: Record<string, number> | null;
  moodRating: number | null;
  alertLevel: 'normal' | 'monitor' | 'alert' | null;
  voiceTranscript: string | null;
  duration: number | null;
  createdAt: string;
}

export interface CreateCareLogInput {
  shiftId: string;
  workerId: string;
  careRecipientId: string;
  category: CareLogCategory;
  notes: string;
  omahaProblems?: number[];
  vitals?: Record<string, number>;
  moodRating?: number;
  alertLevel?: 'normal' | 'monitor' | 'alert';
  voiceTranscript?: string;
  duration?: number;
}

export async function createCareLog(input: CreateCareLogInput): Promise<CareLogRecord> {
  const db = getPostgres();
  const [log] = await db.create('care_interaction', {
    shiftId: input.shiftId,
    workerId: input.workerId,
    careRecipientId: input.careRecipientId,
    category: input.category,
    notes: input.notes,
    omahaProblems: input.omahaProblems ?? [],
    vitals: input.vitals ?? null,
    moodRating: input.moodRating ?? null,
    alertLevel: input.alertLevel ?? null,
    voiceTranscript: input.voiceTranscript ?? null,
    duration: input.duration ?? null,
  } as Record<string, unknown>);
  return log as unknown as CareLogRecord;
}

export async function listCareLogsByShift(shiftId: string): Promise<CareLogRecord[]> {
  const db = getPostgres();
  const result = await db.query<[CareLogRecord[]]>(
    `SELECT * FROM care_interaction
     WHERE shiftId = type::thing("shift", $shiftId)
     ORDER BY createdAt ASC`,
    { shiftId },
  );
  return result[0] ?? [];
}

export async function listCareLogsByWorker(workerId: string, limit = 50): Promise<CareLogRecord[]> {
  const db = getPostgres();
  const result = await db.query<[CareLogRecord[]]>(
    `SELECT * FROM care_interaction
     WHERE workerId = type::thing("user", $workerId)
     ORDER BY createdAt DESC
     LIMIT $limit`,
    { workerId, limit },
  );
  return result[0] ?? [];
}

export async function countCareLogsByShift(shiftId: string): Promise<number> {
  const db = getPostgres();
  const result = await db.query<[Array<{ count: number }>]>(
    `SELECT count() AS count FROM care_interaction
     WHERE shiftId = type::thing("shift", $shiftId)
     GROUP ALL`,
    { shiftId },
  );
  return result[0]?.[0]?.count ?? 0;
}

// ── Shift Swap Records ────────────────────────────────────

export interface ShiftSwapRecord {
  id: string;
  requesterId: string;
  requesterName: string | null;
  shiftId: string;
  shiftDate: string;
  shiftStart: string;
  shiftEnd: string;
  careRecipientName: string;
  reason: string | null;
  status: ShiftSwapStatus;
  offeredToId: string | null;
  offeredToName: string | null;
  approvedById: string | null;
  respondedAt: string | null;
  createdAt: string;
}

export interface CreateShiftSwapInput {
  requesterId: string;
  requesterName?: string;
  shiftId: string;
  shiftDate: string;
  shiftStart: string;
  shiftEnd: string;
  careRecipientName: string;
  reason?: string;
}

export async function createShiftSwap(input: CreateShiftSwapInput): Promise<ShiftSwapRecord> {
  const db = getPostgres();
  const [swap] = await db.create('shift_swap', {
    requesterId: input.requesterId,
    requesterName: input.requesterName ?? null,
    shiftId: input.shiftId,
    shiftDate: input.shiftDate,
    shiftStart: input.shiftStart,
    shiftEnd: input.shiftEnd,
    careRecipientName: input.careRecipientName,
    reason: input.reason ?? null,
    status: 'open',
    offeredToId: null,
    offeredToName: null,
    approvedById: null,
    respondedAt: null,
  } as Record<string, unknown>);
  return swap as unknown as ShiftSwapRecord;
}

export async function getShiftSwapById(id: string): Promise<ShiftSwapRecord | null> {
  const db = getPostgres();
  const result = await db.query<[ShiftSwapRecord[]]>(
    'SELECT * FROM type::thing("shift_swap", $id) LIMIT 1',
    { id },
  );
  return result[0]?.[0] ?? null;
}

export async function updateShiftSwap(
  id: string,
  data: Partial<Omit<ShiftSwapRecord, 'id' | 'createdAt'>>,
): Promise<ShiftSwapRecord | null> {
  const db = getPostgres();
  const result = await db.query<[ShiftSwapRecord[]]>(
    'UPDATE type::thing("shift_swap", $id) MERGE $data RETURN AFTER',
    { id, data },
  );
  return result[0]?.[0] ?? null;
}

export async function listOpenShiftSwaps(): Promise<ShiftSwapRecord[]> {
  const db = getPostgres();
  const result = await db.query<[ShiftSwapRecord[]]>(
    `SELECT * FROM shift_swap
     WHERE status = 'open'
     ORDER BY shiftDate ASC`,
  );
  return result[0] ?? [];
}

export async function listWorkerSwapRequests(workerId: string): Promise<ShiftSwapRecord[]> {
  const db = getPostgres();
  const result = await db.query<[ShiftSwapRecord[]]>(
    `SELECT * FROM shift_swap
     WHERE requesterId = type::thing("user", $workerId)
     ORDER BY createdAt DESC`,
    { workerId },
  );
  return result[0] ?? [];
}

// ── Worker Equity Records ─────────────────────────────────

export interface WorkerEquityRecord {
  id: string;
  workerId: string;
  hoursWorkedThisQuarter: number;
  equityRatePerHour: number;
  accumulatedEquity: number;
  vestedEquity: number;
  vestingStartDate: string;
  createdAt: string;
  updatedAt: string;
}

export async function getWorkerEquity(workerId: string): Promise<WorkerEquityRecord | null> {
  const db = getPostgres();
  const result = await db.query<[WorkerEquityRecord[]]>(
    'SELECT * FROM worker_equity WHERE workerId = type::thing("user", $workerId) LIMIT 1',
    { workerId },
  );
  return result[0]?.[0] ?? null;
}

export async function updateWorkerEquityHours(
  workerId: string,
  additionalHours: number,
): Promise<void> {
  const db = getPostgres();
  await db.query(
    `UPDATE worker_equity SET
       hoursWorkedThisQuarter += $hours,
       accumulatedEquity += $hours * equityRatePerHour,
       updatedAt = time::now()
     WHERE workerId = type::thing("user", $workerId)`,
    { workerId, hours: additionalHours },
  );
}
