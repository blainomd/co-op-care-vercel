// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Assessment Query Builders — CII, CRI, KBS storage + history
 */
import { getPostgres } from '../postgres.js';

// ── Assessment Records ─────────────────────────────────

export interface AssessmentRecord {
  id: string;
  familyId: string;
  careRecipientId: string | null;
  assessorId: string;
  type: 'cii' | 'mini_cii' | 'cri';
  scores: number[];
  totalScore: number;
  zone: string | null;
  acuity: string | null;
  lmnEligible: boolean | null;
  reviewStatus: string;
  reviewNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  fhirQuestionnaireResponseId: string | null;
  completedAt: string;
  createdAt: string;
}

export interface CreateAssessmentInput {
  familyId?: string;
  careRecipientId?: string;
  assessorId: string;
  type: 'cii' | 'mini_cii' | 'cri';
  scores: number[];
  totalScore: number;
  zone?: string;
  acuity?: string;
  lmnEligible?: boolean;
}

export async function createAssessment(input: CreateAssessmentInput): Promise<AssessmentRecord> {
  const db = getPostgres();
  const [record] = await db.create('assessment', {
    ...input,
    familyId: input.familyId ?? null,
    careRecipientId: input.careRecipientId ?? null,
    zone: input.zone ?? null,
    acuity: input.acuity ?? null,
    lmnEligible: input.lmnEligible ?? null,
    reviewStatus: input.type === 'cri' ? 'pending' : 'completed',
    reviewNotes: null,
    reviewedBy: null,
    reviewedAt: null,
    fhirQuestionnaireResponseId: null,
    completedAt: new Date().toISOString(),
  } as Record<string, unknown>);
  return record as unknown as AssessmentRecord;
}

export async function getAssessmentById(id: string): Promise<AssessmentRecord | null> {
  const db = getPostgres();
  const result = await db.query<[AssessmentRecord[]]>(
    'SELECT * FROM type::thing("assessment", $id) LIMIT 1',
    { id },
  );
  return result[0]?.[0] ?? null;
}

export async function reviewAssessment(
  id: string,
  reviewerId: string,
  status: 'approved' | 'reviewed' | 'revision_requested',
  notes?: string,
): Promise<AssessmentRecord | null> {
  const db = getPostgres();
  const result = await db.query<[AssessmentRecord[]]>(
    `UPDATE type::thing("assessment", $id) SET
       reviewStatus = $status,
       reviewNotes = $notes,
       reviewedBy = type::thing("user", $reviewerId),
       reviewedAt = time::now()
     RETURN AFTER`,
    { id, status, reviewerId, notes: notes ?? null },
  );
  return result[0]?.[0] ?? null;
}

export async function setFhirId(id: string, fhirId: string): Promise<void> {
  const db = getPostgres();
  await db.query(
    `UPDATE type::thing("assessment", $id) SET fhirQuestionnaireResponseId = $fhirId`,
    { id, fhirId },
  );
}

export async function getAssessmentHistory(
  familyId: string,
  type?: string,
  limit = 50,
): Promise<AssessmentRecord[]> {
  const db = getPostgres();
  const typeFilter = type ? 'AND type = $type' : '';
  const result = await db.query<[AssessmentRecord[]]>(
    `SELECT * FROM assessment
     WHERE familyId = type::thing("family", $familyId) ${typeFilter}
     ORDER BY completedAt DESC
     LIMIT $limit`,
    { familyId, type: type ?? '', limit },
  );
  return result[0] ?? [];
}

export async function getLatestAssessment(
  familyId: string,
  type: string,
): Promise<AssessmentRecord | null> {
  const db = getPostgres();
  const result = await db.query<[AssessmentRecord[]]>(
    `SELECT * FROM assessment
     WHERE familyId = type::thing("family", $familyId) AND type = $type
     ORDER BY completedAt DESC
     LIMIT 1`,
    { familyId, type },
  );
  return result[0]?.[0] ?? null;
}

export async function getPendingCRIReviews(): Promise<AssessmentRecord[]> {
  const db = getPostgres();
  const result = await db.query<[AssessmentRecord[]]>(
    `SELECT * FROM assessment WHERE type = 'cri' AND reviewStatus = 'pending' ORDER BY createdAt ASC`,
  );
  return result[0] ?? [];
}

// ── KBS Ratings ────────────────────────────────────────

export interface KBSRecord {
  id: string;
  careRecipientId: string;
  omahaProblemCode: number;
  knowledge: number;
  behavior: number;
  status: number;
  assessmentDay: number;
  ratedBy: string;
  fhirObservationId: string | null;
  ratedAt: string;
}

export interface CreateKBSInput {
  careRecipientId: string;
  omahaProblemCode: number;
  knowledge: number;
  behavior: number;
  status: number;
  assessmentDay: number;
  ratedBy: string;
}

export async function createKBSRating(input: CreateKBSInput): Promise<KBSRecord> {
  const db = getPostgres();
  const [record] = await db.create('kbs_rating', {
    ...input,
    fhirObservationId: null,
    ratedAt: new Date().toISOString(),
  } as Record<string, unknown>);
  return record as unknown as KBSRecord;
}

export async function getKBSHistory(
  careRecipientId: string,
  omahaProblemCode?: number,
  limit = 50,
): Promise<KBSRecord[]> {
  const db = getPostgres();
  const problemFilter = omahaProblemCode !== undefined ? 'AND omahaProblemCode = $code' : '';
  const result = await db.query<[KBSRecord[]]>(
    `SELECT * FROM kbs_rating
     WHERE careRecipientId = type::thing("care_recipient", $crId) ${problemFilter}
     ORDER BY ratedAt DESC
     LIMIT $limit`,
    { crId: careRecipientId, code: omahaProblemCode ?? 0, limit },
  );
  return result[0] ?? [];
}

export async function getLatestKBSForProblem(
  careRecipientId: string,
  omahaProblemCode: number,
): Promise<KBSRecord | null> {
  const db = getPostgres();
  const result = await db.query<[KBSRecord[]]>(
    `SELECT * FROM kbs_rating
     WHERE careRecipientId = type::thing("care_recipient", $crId)
       AND omahaProblemCode = $code
     ORDER BY ratedAt DESC
     LIMIT 1`,
    { crId: careRecipientId, code: omahaProblemCode },
  );
  return result[0]?.[0] ?? null;
}

export interface KBSCareRecipientSummary {
  careRecipientId: string;
  problemCodes: number[];
  latestRatedAt: string;
  ratingCount: number;
}

export async function getCareRecipientsWithKBS(): Promise<KBSCareRecipientSummary[]> {
  const db = getPostgres();
  const result = await db.query<[KBSCareRecipientSummary[]]>(
    `SELECT
       careRecipientId,
       array::distinct(omahaProblemCode) AS problemCodes,
       math::max(ratedAt) AS latestRatedAt,
       count() AS ratingCount
     FROM kbs_rating
     GROUP BY careRecipientId`,
  );
  return result[0] ?? [];
}

export async function countKBSForRecipient(
  careRecipientId: string,
  omahaProblemCode: number,
): Promise<number> {
  const db = getPostgres();
  const result = await db.query<[Array<{ count: number }>]>(
    `SELECT count() AS count FROM kbs_rating
     WHERE careRecipientId = type::thing("care_recipient", $crId)
       AND omahaProblemCode = $code
     GROUP ALL`,
    { crId: careRecipientId, code: omahaProblemCode },
  );
  return result[0]?.[0]?.count ?? 0;
}

// ── LMN Auto-Trigger Queries ─────────────────────────────

/**
 * List all assessments for a care recipient (used by auto-trigger to
 * aggregate clinical profile data across CII/CRI assessments).
 */
export async function listAssessmentsByCareRecipient(
  careRecipientId: string,
  limit = 50,
): Promise<AssessmentRecord[]> {
  const db = getPostgres();
  const result = await db.query<[AssessmentRecord[]]>(
    `SELECT * FROM assessment
     WHERE careRecipientId = type::thing("care_recipient", $crId)
     ORDER BY completedAt DESC
     LIMIT $limit`,
    { crId: careRecipientId, limit },
  );
  return result[0] ?? [];
}

/**
 * List assessments completed within the last N hours that haven't been
 * processed for LMN eligibility yet. Used by the daily auto-trigger scan.
 */
export async function listRecentAssessments(
  hoursBack: number,
  limit = 500,
): Promise<AssessmentRecord[]> {
  const db = getPostgres();
  const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();
  const result = await db.query<[AssessmentRecord[]]>(
    `SELECT * FROM assessment
     WHERE completedAt >= $cutoff
       AND (type = 'cii' OR type = 'cri')
     ORDER BY completedAt DESC
     LIMIT $limit`,
    { cutoff, limit },
  );
  return result[0] ?? [];
}
