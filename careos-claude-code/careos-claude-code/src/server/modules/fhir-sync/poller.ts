/**
 * Outbox Poller — Reads pending events and delivers to Aidbox
 *
 * Runs on a configurable interval (default: 5 seconds).
 * Uses exponential backoff on failure (2^attempt seconds).
 * NOT a Redis job — uses direct PostgreSQL polling for clinical data safety.
 */
import { logger } from '../../common/logger.js';
import { fetchPendingEvents, markDelivered, markFailed } from './outbox.js';
import { dispatchSync } from './sync-handlers.js';

const DEFAULT_POLL_INTERVAL_MS = 5_000;
const DEFAULT_BATCH_SIZE = 50;

let pollerInterval: ReturnType<typeof setInterval> | null = null;
let isProcessing = false;

/**
 * Process a single batch of pending outbox events
 */
export async function processBatch(batchSize: number = DEFAULT_BATCH_SIZE): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  const events = await fetchPendingEvents(batchSize);

  let succeeded = 0;
  let failed = 0;

  for (const event of events) {
    try {
      const result = await dispatchSync(event);

      if (result.success) {
        await markDelivered(event.id);
        succeeded++;
        logger.debug(
          { eventId: event.id, resourceType: event.resourceType, fhirId: result.fhirId },
          'Outbox event delivered',
        );
      } else {
        const attempts = event.attempts + 1;
        await markFailed(event.id, result.error ?? 'Sync returned failure', attempts);
        failed++;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const attempts = event.attempts + 1;
      await markFailed(event.id, message, attempts);
      failed++;
      logger.error(
        { eventId: event.id, resourceType: event.resourceType, error: message },
        'Outbox event processing error',
      );
    }
  }

  return { processed: events.length, succeeded, failed };
}

/**
 * Single poll cycle — fetch and process pending events
 */
async function pollCycle(batchSize: number): Promise<void> {
  if (isProcessing) return; // Skip if previous cycle still running
  isProcessing = true;

  try {
    const result = await processBatch(batchSize);
    if (result.processed > 0) {
      logger.info(result, 'Outbox poll cycle completed');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error: message }, 'Outbox poll cycle failed');
  } finally {
    isProcessing = false;
  }
}

/**
 * Start the outbox poller
 */
export function startPoller(
  intervalMs: number = DEFAULT_POLL_INTERVAL_MS,
  batchSize: number = DEFAULT_BATCH_SIZE,
): void {
  if (pollerInterval) {
    logger.warn('Outbox poller already running');
    return;
  }

  pollerInterval = setInterval(() => {
    void pollCycle(batchSize);
  }, intervalMs);

  logger.info({ intervalMs, batchSize }, 'Outbox poller started');
}

/**
 * Stop the outbox poller
 */
export function stopPoller(): void {
  if (pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
    logger.info('Outbox poller stopped');
  }
}

/**
 * Check if poller is running
 */
export function isPollerRunning(): boolean {
  return pollerInterval !== null;
}
