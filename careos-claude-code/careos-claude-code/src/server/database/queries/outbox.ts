// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Transactional Outbox Query Builders — PostgreSQL → Aidbox FHIR sync
 */
import { getPostgres } from '../postgres.js';

export interface OutboxEventRecord {
  id: string;
  eventType: string;
  resourceType: string;
  resourceId: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retryCount: number;
  lastError: string | null;
  createdAt: string;
  processedAt: string | null;
}

export async function createOutboxEvent(input: {
  eventType: string;
  resourceType: string;
  resourceId: string;
  payload: Record<string, unknown>;
}): Promise<OutboxEventRecord> {
  const db = getPostgres();
  const [event] = await db.create('outbox_event', {
    ...input,
    status: 'pending',
    retryCount: 0,
    lastError: null,
    processedAt: null,
  } as Record<string, unknown>);
  return event as unknown as OutboxEventRecord;
}

export async function claimPendingEvents(batchSize = 10): Promise<OutboxEventRecord[]> {
  const db = getPostgres();
  const result = await db.query<[OutboxEventRecord[]]>(
    `UPDATE outbox_event SET status = 'processing'
     WHERE status = 'pending'
     ORDER BY createdAt ASC
     LIMIT $batchSize
     RETURN AFTER`,
    { batchSize },
  );
  return result[0] ?? [];
}

export async function markEventCompleted(id: string): Promise<void> {
  const db = getPostgres();
  await db.query(
    `UPDATE type::thing("outbox_event", $id) SET status = 'completed', processedAt = time::now()`,
    { id },
  );
}

export async function markEventFailed(id: string, error: string): Promise<void> {
  const db = getPostgres();
  await db.query(
    `UPDATE type::thing("outbox_event", $id) SET
       status = 'failed',
       lastError = $error,
       retryCount += 1`,
    { id, error },
  );
}

export async function requeueFailedEvents(maxRetries = 5): Promise<number> {
  const db = getPostgres();
  const result = await db.query<[Array<{ count: number }>]>(
    `UPDATE outbox_event SET status = 'pending'
     WHERE status = 'failed' AND retryCount < $maxRetries
     RETURN { count: count() }`,
    { maxRetries },
  );
  return result[0]?.[0]?.count ?? 0;
}

export async function getDeadLetterEvents(limit = 50): Promise<OutboxEventRecord[]> {
  const db = getPostgres();
  const result = await db.query<[OutboxEventRecord[]]>(
    `SELECT * FROM outbox_event
     WHERE status = 'failed' AND retryCount >= 5
     ORDER BY createdAt DESC
     LIMIT $limit`,
    { limit },
  );
  return result[0] ?? [];
}

export async function purgeCompletedEvents(olderThanDays = 30): Promise<void> {
  const db = getPostgres();
  await db.query(
    `DELETE outbox_event WHERE status = 'completed' AND createdAt < time::now() - ${olderThanDays}d`,
  );
}
