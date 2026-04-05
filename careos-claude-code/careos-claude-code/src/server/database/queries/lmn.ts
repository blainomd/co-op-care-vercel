// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * LMN Query Builders — Letter of Medical Necessity CRUD
 */
import { getPostgres } from '../postgres.js';

// ── LMN Records ────────────────────────────────────────

export interface LMNRecord {
  id: string;
  careRecipientId: string;
  careRecipientName: string;
  generatedBy: string;
  signingPhysicianId: string | null;
  signingPhysicianName: string | null;
  criAssessmentId: string;
  criScore: number;
  acuity: string;
  diagnosisCodes: string[];
  omahaProblems: number[];
  carePlanSummary: string;
  status: string;
  issuedAt: string | null;
  expiresAt: string | null;
  durationDays: number;
  documentUrl: string | null;
  signatureRequestId: string | null;
  signedAt: string | null;
  signatureMethod: string | null;
  lastReminderTier: number | null;
  renewalCriId: string | null;
  fhirDocumentReferenceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLMNInput {
  careRecipientId: string;
  careRecipientName: string;
  generatedBy: string;
  criAssessmentId: string;
  criScore: number;
  acuity: string;
  diagnosisCodes?: string[];
  omahaProblems?: number[];
  carePlanSummary?: string;
  durationDays?: number;
}

export async function createLMN(input: CreateLMNInput): Promise<LMNRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('lmn', {
    careRecipientId: input.careRecipientId,
    careRecipientName: input.careRecipientName,
    generatedBy: input.generatedBy,
    signingPhysicianId: null,
    signingPhysicianName: null,
    criAssessmentId: input.criAssessmentId,
    criScore: input.criScore,
    acuity: input.acuity,
    diagnosisCodes: input.diagnosisCodes ?? [],
    omahaProblems: input.omahaProblems ?? [],
    carePlanSummary: input.carePlanSummary ?? '',
    status: 'draft',
    issuedAt: null,
    expiresAt: null,
    durationDays: input.durationDays ?? 365,
    documentUrl: null,
    signatureRequestId: null,
    signedAt: null,
    signatureMethod: null,
    lastReminderTier: null,
    renewalCriId: null,
    fhirDocumentReferenceId: null,
    createdAt: now,
    updatedAt: now,
  } as Record<string, unknown>);
  return record as unknown as LMNRecord;
}

export async function getLMNById(id: string): Promise<LMNRecord | null> {
  const db = getPostgres();
  const [record] = await db.select<Record<string, unknown>>(id);
  return (record as unknown as LMNRecord) ?? null;
}

export async function updateLMN(id: string, data: Partial<LMNRecord>): Promise<LMNRecord> {
  const db = getPostgres();
  const [record] = await db.merge(id, { ...data, updatedAt: new Date().toISOString() } as Record<
    string,
    unknown
  >);
  return record as unknown as LMNRecord;
}

export async function listLMNsByCareRecipient(careRecipientId: string): Promise<LMNRecord[]> {
  const db = getPostgres();
  const records = await db.query<[LMNRecord[]]>(
    'SELECT * FROM lmn WHERE careRecipientId = $careRecipientId ORDER BY createdAt DESC',
    { careRecipientId },
  );
  return records[0] ?? [];
}

export async function listLMNsByStatus(status: string): Promise<LMNRecord[]> {
  const db = getPostgres();
  const records = await db.query<[LMNRecord[]]>(
    'SELECT * FROM lmn WHERE status = $status ORDER BY expiresAt ASC',
    { status },
  );
  return records[0] ?? [];
}

export async function listActiveLMNs(): Promise<LMNRecord[]> {
  const db = getPostgres();
  const records = await db.query<[LMNRecord[]]>(
    'SELECT * FROM lmn WHERE status IN ["active", "expiring"] ORDER BY expiresAt ASC',
  );
  return records[0] ?? [];
}

export async function listExpiringLMNs(withinDays: number): Promise<LMNRecord[]> {
  const db = getPostgres();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);
  const records = await db.query<[LMNRecord[]]>(
    'SELECT * FROM lmn WHERE status IN ["active", "expiring"] AND expiresAt <= $cutoff ORDER BY expiresAt ASC',
    { cutoff: cutoff.toISOString() },
  );
  return records[0] ?? [];
}

export async function listAllLMNs(): Promise<LMNRecord[]> {
  const db = getPostgres();
  const records = await db.query<[LMNRecord[]]>('SELECT * FROM lmn ORDER BY createdAt DESC');
  return records[0] ?? [];
}

export async function listPendingSignatureLMNs(): Promise<LMNRecord[]> {
  const db = getPostgres();
  const records = await db.query<[LMNRecord[]]>(
    'SELECT * FROM lmn WHERE status = "pending_signature" ORDER BY createdAt ASC',
  );
  return records[0] ?? [];
}

export async function listLMNsForUserFamilies(userId: string): Promise<LMNRecord[]> {
  const db = getPostgres();
  const result = await db.query(
    `SELECT l.* FROM lmns l
     JOIN care_recipients cr ON l.care_recipient_id = cr.id
     JOIN families f ON cr.family_id = f.id
     JOIN family_memberships fm ON fm.family_id = f.id
     WHERE fm.user_id = $1
     ORDER BY l.created_at DESC`,
    [userId],
  );
  return result.rows as LMNRecord[];
}
