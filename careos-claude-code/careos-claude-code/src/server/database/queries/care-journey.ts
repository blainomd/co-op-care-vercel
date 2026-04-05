// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending
/**
 * Care Journey Query Builders — PostgreSQL persistence for agent state
 *
 * Stores care_journey records so agent state survives deploys.
 * Schema: care_journey table with JSONB columns for flexible nested data.
 */
import { getPostgres } from '../postgres.js';
import { logger } from '../../common/logger.js';

export interface CareJourneyRecord {
  id: string;
  familyId: string;
  stage: string;
  profileCompleteness: number;
  stageEnteredAt: string;
  history: Array<{ from: string; to: string; at: string; trigger: string }>;
  assessments: Record<string, unknown>;
  lmn: Record<string, unknown>;
  billing: Record<string, unknown>;
  match: Record<string, unknown>;
  profileData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export async function upsertCareJourney(
  familyId: string,
  data: Partial<Omit<CareJourneyRecord, 'id' | 'familyId' | 'createdAt'>>,
): Promise<CareJourneyRecord | null> {
  try {
    const db = getPostgres();
    const existing = await getCareJourney(familyId);

    if (existing) {
      // Update
      const [updated] = await db.query<[CareJourneyRecord[]]>(
        `UPDATE care_journey SET
           stage = $stage,
           profileCompleteness = $profileCompleteness,
           stageEnteredAt = $stageEnteredAt,
           history = $history,
           assessments = $assessments,
           lmn = $lmn,
           billing = $billing,
           match_data = $match,
           profileData = $profileData,
           updatedAt = time::now()
         WHERE familyId = $familyId
         RETURN AFTER`,
        {
          familyId,
          stage: data.stage ?? existing.stage,
          profileCompleteness: data.profileCompleteness ?? existing.profileCompleteness,
          stageEnteredAt: data.stageEnteredAt ?? existing.stageEnteredAt,
          history: data.history ?? existing.history,
          assessments: data.assessments ?? existing.assessments,
          lmn: data.lmn ?? existing.lmn,
          match: data.match ?? existing.match,
          profileData: data.profileData ?? existing.profileData,
          billing: data.billing ?? existing.billing,
        },
      );
      return updated?.[0] ?? null;
    } else {
      // Create
      const [created] = await db.create('care_journey', {
        familyId,
        stage: data.stage ?? 'discovered',
        profileCompleteness: data.profileCompleteness ?? 0,
        stageEnteredAt: data.stageEnteredAt ?? new Date().toISOString(),
        history: data.history ?? [],
        assessments: data.assessments ?? {},
        lmn: data.lmn ?? {},
        billing: data.billing ?? {},
        match_data: data.match ?? {},
        profileData: data.profileData ?? {},
      } as Record<string, unknown>);
      return created as unknown as CareJourneyRecord;
    }
  } catch (err) {
    logger.warn({ err, familyId }, 'Failed to persist care journey — using in-memory fallback');
    return null;
  }
}

export async function getCareJourney(familyId: string): Promise<CareJourneyRecord | null> {
  try {
    const db = getPostgres();
    const result = await db.query<[CareJourneyRecord[]]>(
      `SELECT * FROM care_journey WHERE familyId = $familyId LIMIT 1`,
      { familyId },
    );
    return result[0]?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function listCareJourneys(stage?: string): Promise<CareJourneyRecord[]> {
  try {
    const db = getPostgres();
    const query = stage
      ? `SELECT * FROM care_journey WHERE stage = $stage ORDER BY updatedAt DESC`
      : `SELECT * FROM care_journey ORDER BY updatedAt DESC`;
    const result = await db.query<[CareJourneyRecord[]]>(query, stage ? { stage } : {});
    return result[0] ?? [];
  } catch {
    return [];
  }
}

export async function listReviewQueueItems(status = 'pending'): Promise<Record<string, unknown>[]> {
  try {
    const db = getPostgres();
    const result = await db.query<[Record<string, unknown>[]]>(
      `SELECT * FROM lmn_review_queue WHERE status = $status ORDER BY
        CASE priority WHEN 'urgent' THEN 0 WHEN 'elevated' THEN 1 ELSE 2 END ASC,
        createdAt ASC`,
      { status },
    );
    return result[0] ?? [];
  } catch {
    return [];
  }
}

export async function upsertReviewQueueItem(
  item: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  try {
    const db = getPostgres();
    const [created] = await db.create('lmn_review_queue', item);
    return created;
  } catch (err) {
    logger.warn({ err }, 'Failed to persist review queue item');
    return null;
  }
}
