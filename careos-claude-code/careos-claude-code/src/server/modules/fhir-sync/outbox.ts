// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Transactional Outbox — Write sync events in the same PostgreSQL transaction
 *
 * Guarantees at-least-once delivery from PostgreSQL → Aidbox.
 * Events are written to the `fhir_outbox` table alongside the primary write.
 * The Poller reads pending events and delivers to Aidbox.
 */
import { getPostgres } from '../../database/postgres.js';
import { logger } from '../../common/logger.js';

export type FhirResourceType =
  | 'Patient'
  | 'Encounter'
  | 'Observation'
  | 'QuestionnaireResponse'
  | 'CarePlan'
  | 'CareTeam'
  | 'DocumentReference'
  | 'Procedure'
  | 'Consent'
  | 'Goal'
  | 'Communication';

export type OutboxEventAction = 'create' | 'update' | 'delete';

export interface OutboxEvent {
  id: string;
  resourceType: FhirResourceType;
  resourceId: string;
  action: OutboxEventAction;
  payload: Record<string, unknown>;
  status: 'pending' | 'delivered' | 'failed';
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  nextRetryAt?: string;
  createdAt: string;
  deliveredAt?: string;
}

const MAX_ATTEMPTS = 5;

/**
 * Write an outbox event — call this in the same transaction as the primary write
 */
export async function writeOutboxEvent(
  resourceType: FhirResourceType,
  resourceId: string,
  action: OutboxEventAction,
  payload: Record<string, unknown>,
): Promise<void> {
  await getPostgres().query(
    `CREATE fhir_outbox SET
      resourceType = $resourceType,
      resourceId = $resourceId,
      action = $action,
      payload = $payload,
      status = 'pending',
      attempts = 0,
      maxAttempts = $maxAttempts,
      createdAt = time::now()`,
    {
      resourceType,
      resourceId,
      action,
      payload,
      maxAttempts: MAX_ATTEMPTS,
    },
  );

  logger.debug({ resourceType, resourceId, action }, 'Outbox event written');
}

/**
 * Fetch pending outbox events ready for delivery
 */
export async function fetchPendingEvents(limit: number = 50): Promise<OutboxEvent[]> {
  const [events] = await getPostgres().query<[OutboxEvent[]]>(
    `SELECT * FROM fhir_outbox
     WHERE status = 'pending'
       AND (nextRetryAt IS NONE OR nextRetryAt <= time::now())
     ORDER BY createdAt ASC
     LIMIT $limit`,
    { limit },
  );
  return events ?? [];
}

/**
 * Mark an event as successfully delivered
 */
export async function markDelivered(eventId: string): Promise<void> {
  await getPostgres().query(
    `UPDATE $eventId SET
      status = 'delivered',
      deliveredAt = time::now()`,
    { eventId },
  );
}

/**
 * Mark an event as failed with error info and exponential backoff
 */
export async function markFailed(eventId: string, error: string, attempts: number): Promise<void> {
  const status = attempts >= MAX_ATTEMPTS ? 'failed' : 'pending';
  // Exponential backoff: 2^attempts seconds (2s, 4s, 8s, 16s, 32s)
  const backoffSeconds = Math.pow(2, attempts);

  await getPostgres().query(
    `UPDATE $eventId SET
      status = $status,
      attempts = $attempts,
      lastError = $error,
      nextRetryAt = time::now() + ${backoffSeconds}s`,
    { eventId, status, attempts, error },
  );

  if (status === 'failed') {
    logger.error(
      { eventId, attempts, error },
      'Outbox event permanently failed after max attempts',
    );
  }
}

/**
 * Get failed events for monitoring/alerting
 */
export async function getFailedEvents(limit: number = 100): Promise<OutboxEvent[]> {
  const [events] = await getPostgres().query<[OutboxEvent[]]>(
    `SELECT * FROM fhir_outbox
     WHERE status = 'failed'
     ORDER BY createdAt DESC
     LIMIT $limit`,
    { limit },
  );
  return events ?? [];
}

/**
 * Retry a specific failed event (manual intervention)
 */
export async function retryEvent(eventId: string): Promise<void> {
  await getPostgres().query(
    `UPDATE $eventId SET
      status = 'pending',
      attempts = 0,
      lastError = NONE,
      nextRetryAt = NONE`,
    { eventId },
  );
  logger.info({ eventId }, 'Outbox event manually retried');
}

/**
 * Calculate exponential backoff delay in seconds
 */
export function calculateBackoff(attempt: number): number {
  return Math.pow(2, attempt);
}
