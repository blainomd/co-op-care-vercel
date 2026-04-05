/**
 * FHIR Sync Routes
 * admin only — monitoring + manual intervention for outbox events
 * Plus webhook endpoint for Aidbox reverse sync
 */
import type { FastifyInstance } from 'fastify';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { getFailedEvents, retryEvent } from './outbox.js';
import { isPollerRunning } from './poller.js';
import { handleAidboxWebhook, type AidboxWebhookPayload } from './webhook.js';

export async function fhirSyncRoutes(app: FastifyInstance): Promise<void> {
  // --- Admin monitoring endpoints ---
  app.register(async (admin) => {
    admin.addHook('preHandler', requireAuth);
    admin.addHook('preHandler', requireRole('admin'));

    /**
     * GET /status — Poller status + failed event count
     */
    admin.get('/status', async () => {
      const failed = await getFailedEvents(1);
      return {
        pollerRunning: isPollerRunning(),
        failedEvents: failed.length > 0,
      };
    });

    /**
     * GET /failed — List failed outbox events
     */
    admin.get('/failed', async (request) => {
      const { limit } = request.query as { limit?: string };
      return getFailedEvents(limit ? parseInt(limit, 10) : 100);
    });

    /**
     * POST /retry/:eventId — Manually retry a failed event
     */
    admin.post('/retry/:eventId', async (request, reply) => {
      const { eventId } = request.params as { eventId: string };
      await retryEvent(eventId);
      reply.status(200).send({ status: 'retried', eventId });
    });
  });

  // --- Aidbox webhook endpoint (no auth — uses shared secret in prod) ---
  /**
   * POST /webhook — Aidbox subscription notification
   */
  app.post('/webhook', async (request, reply) => {
    const payload = request.body as AidboxWebhookPayload;
    await handleAidboxWebhook(payload);
    reply.status(200).send({ status: 'ok' });
  });
}
