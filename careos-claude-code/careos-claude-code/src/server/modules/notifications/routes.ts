/**
 * Notification Routes
 * All authenticated users can read their notifications
 */
import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { notificationService } from './service.js';
import type { PushSubscription } from './channels/push.js';

export async function notificationRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireAuth);

  /**
   * GET / — Get all notifications for the current user
   */
  app.get('/', async (request) => {
    const { limit, offset } = request.query as { limit?: string; offset?: string };
    return notificationService.getAll(
      request.userId!,
      limit ? parseInt(limit, 10) : undefined,
      offset ? parseInt(offset, 10) : undefined,
    );
  });

  /**
   * GET /unread — Get unread notifications
   */
  app.get('/unread', async (request) => {
    const { limit } = request.query as { limit?: string };
    return notificationService.getUnread(request.userId!, limit ? parseInt(limit, 10) : undefined);
  });

  /**
   * GET /count — Get unread count
   */
  app.get('/count', async (request) => {
    const count = await notificationService.getUnreadCount(request.userId!);
    return { unread: count };
  });

  /**
   * PUT /:notificationId/read — Mark a notification as read
   */
  app.put('/:notificationId/read', async (request, reply) => {
    const { notificationId } = request.params as { notificationId: string };
    await notificationService.markRead(notificationId, request.userId!);
    reply.status(200).send({ status: 'ok' });
  });

  /**
   * PUT /read-all — Mark all notifications as read
   */
  app.put('/read-all', async (request, reply) => {
    await notificationService.markAllRead(request.userId!);
    reply.status(200).send({ status: 'ok' });
  });

  /**
   * POST /push/subscribe — Register push subscription
   */
  app.post('/push/subscribe', async (request, reply) => {
    const subscription = request.body as PushSubscription;
    await notificationService.registerPushSubscription(request.userId!, subscription);
    reply.status(201).send({ status: 'subscribed' });
  });

  /**
   * DELETE /push/subscribe — Remove push subscription
   */
  app.delete('/push/subscribe', async (request, reply) => {
    await notificationService.removePushSubscription(request.userId!);
    reply.status(200).send({ status: 'unsubscribed' });
  });
}
