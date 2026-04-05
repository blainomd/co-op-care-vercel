// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Reimbursement Query Builders — HSA/FSA Claims CRUD
 */
import { getPostgres } from '../postgres.js';
import type { ClaimStatus, ClaimLineItem } from '@shared/types/reimbursement.types';

// ── Reimbursement Claim Records ─────────────────────────

export interface ReimbursementClaimRecord {
  id: string;
  familyId: string;
  careRecipientId: string;
  careRecipientName: string;
  lmnId: string;
  claimPeriodStart: string;
  claimPeriodEnd: string;
  status: ClaimStatus;
  lineItems: ClaimLineItem[];
  totalAmount: number;
  estimatedReimbursement: number;
  lmnDocumentHash: string | null;
  supportingDocuments: string[];
  irsCategories: string[];
  taxYear: number;
  hsaProvider: string | null;
  hsaAccountId: string | null;
  submittedAt: string | null;
  resolvedAt: string | null;
  denialReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReimbursementClaimInput {
  familyId: string;
  careRecipientId: string;
  careRecipientName: string;
  lmnId: string;
  claimPeriodStart: string;
  claimPeriodEnd: string;
  lineItems: ClaimLineItem[];
  totalAmount: number;
  estimatedReimbursement: number;
  irsCategories: string[];
  taxYear: number;
  lmnDocumentHash?: string;
  hsaProvider?: string;
  hsaAccountId?: string;
}

export async function createReimbursementClaim(
  input: CreateReimbursementClaimInput,
): Promise<ReimbursementClaimRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('reimbursement_claim', {
    familyId: input.familyId,
    careRecipientId: input.careRecipientId,
    careRecipientName: input.careRecipientName,
    lmnId: input.lmnId,
    claimPeriodStart: input.claimPeriodStart,
    claimPeriodEnd: input.claimPeriodEnd,
    status: 'draft',
    lineItems: input.lineItems,
    totalAmount: input.totalAmount,
    estimatedReimbursement: input.estimatedReimbursement,
    lmnDocumentHash: input.lmnDocumentHash ?? null,
    supportingDocuments: [],
    irsCategories: input.irsCategories,
    taxYear: input.taxYear,
    hsaProvider: input.hsaProvider ?? null,
    hsaAccountId: input.hsaAccountId ?? null,
    submittedAt: null,
    resolvedAt: null,
    denialReason: null,
    createdAt: now,
    updatedAt: now,
  } as Record<string, unknown>);
  return record as unknown as ReimbursementClaimRecord;
}

export async function getReimbursementClaimById(
  id: string,
): Promise<ReimbursementClaimRecord | null> {
  const db = getPostgres();
  const [record] = await db.select<Record<string, unknown>>(id);
  return (record as unknown as ReimbursementClaimRecord) ?? null;
}

export async function updateReimbursementClaim(
  id: string,
  data: Partial<ReimbursementClaimRecord>,
): Promise<ReimbursementClaimRecord> {
  const db = getPostgres();
  const [record] = await db.merge(id, {
    ...data,
    updatedAt: new Date().toISOString(),
  } as Record<string, unknown>);
  return record as unknown as ReimbursementClaimRecord;
}

export async function listReimbursementClaimsByFamily(
  familyId: string,
): Promise<ReimbursementClaimRecord[]> {
  const db = getPostgres();
  const records = await db.query<[ReimbursementClaimRecord[]]>(
    'SELECT * FROM reimbursement_claim WHERE familyId = $familyId ORDER BY createdAt DESC',
    { familyId },
  );
  return records[0] ?? [];
}

export async function listReimbursementClaimsByStatus(
  status: ClaimStatus,
): Promise<ReimbursementClaimRecord[]> {
  const db = getPostgres();
  const records = await db.query<[ReimbursementClaimRecord[]]>(
    'SELECT * FROM reimbursement_claim WHERE status = $status ORDER BY createdAt DESC',
    { status },
  );
  return records[0] ?? [];
}

export async function listReimbursementClaimsByTaxYear(
  familyId: string,
  taxYear: number,
): Promise<ReimbursementClaimRecord[]> {
  const db = getPostgres();
  const records = await db.query<[ReimbursementClaimRecord[]]>(
    'SELECT * FROM reimbursement_claim WHERE familyId = $familyId AND taxYear = $taxYear ORDER BY claimPeriodStart ASC',
    { familyId, taxYear },
  );
  return records[0] ?? [];
}

export async function listReimbursementClaimsByCareRecipient(
  careRecipientId: string,
): Promise<ReimbursementClaimRecord[]> {
  const db = getPostgres();
  const records = await db.query<[ReimbursementClaimRecord[]]>(
    'SELECT * FROM reimbursement_claim WHERE careRecipientId = $careRecipientId ORDER BY createdAt DESC',
    { careRecipientId },
  );
  return records[0] ?? [];
}

/**
 * List all families with active LMNs that have completed tasks in the given period.
 * Used by auto-generate to find families that need monthly claims.
 */
export async function listFamiliesWithActiveLMNs(): Promise<
  Array<{ familyId: string; careRecipientId: string; careRecipientName: string; lmnId: string }>
> {
  const db = getPostgres();
  const records = await db.query<
    [Array<{ familyId: string; careRecipientId: string; careRecipientName: string; lmnId: string }>]
  >(
    `SELECT
      cr.familyId AS familyId,
      cr.id AS careRecipientId,
      string::concat(cr.firstName, ' ', cr.lastName) AS careRecipientName,
      lmn.id AS lmnId
    FROM lmn
    JOIN care_recipient AS cr ON lmn.careRecipientId = cr.id
    WHERE lmn.status IN ['active', 'expiring']
      AND (lmn.expiresAt IS NONE OR lmn.expiresAt > time::now())`,
  );
  return records[0] ?? [];
}

/**
 * List completed timebank tasks for a care recipient in a date range.
 * Used to auto-populate claim line items.
 */
export async function listCompletedTasksForCareRecipient(
  careRecipientId: string,
  periodStart: string,
  periodEnd: string,
): Promise<
  Array<{
    id: string;
    taskType: string;
    title: string;
    actualHours: number | null;
    estimatedHours: number;
    matchedUserId: string | null;
    checkOutTime: string | null;
    scheduledFor: string | null;
    createdAt: string;
  }>
> {
  const db = getPostgres();
  const records = await db.query<
    [
      Array<{
        id: string;
        taskType: string;
        title: string;
        actualHours: number | null;
        estimatedHours: number;
        matchedUserId: string | null;
        checkOutTime: string | null;
        scheduledFor: string | null;
        createdAt: string;
      }>,
    ]
  >(
    `SELECT id, taskType, title, actualHours, estimatedHours, matchedUserId, checkOutTime, scheduledFor, createdAt
     FROM timebank_task
     WHERE careRecipientId = $careRecipientId
       AND status = 'completed'
       AND (
         (checkOutTime >= $periodStart AND checkOutTime <= $periodEnd)
         OR (scheduledFor >= $periodStart AND scheduledFor <= $periodEnd)
         OR (createdAt >= $periodStart AND createdAt <= $periodEnd)
       )
     ORDER BY checkOutTime ASC`,
    { careRecipientId, periodStart, periodEnd },
  );
  return records[0] ?? [];
}
