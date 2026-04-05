/**
 * Settings Routes — User preferences (notifications, appearance, privacy)
 * All authenticated users
 */
import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { ValidationError } from '../../common/errors.js';
import { z } from 'zod';

const notificationPrefSchema = z.object({
  preferences: z.array(
    z.object({
      key: z.string().min(1),
      push: z.boolean(),
      email: z.boolean(),
      sms: z.boolean(),
    }),
  ),
});

export async function settingsRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireAuth);

  /**
   * POST /notifications — Save notification preferences
   */
  app.post('/notifications', async (request) => {
    const parsed = notificationPrefSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid notification preferences');

    try {
      // TODO: Persist to user record in PostgreSQL
      // await db.query('UPDATE $userId SET notificationPrefs = $prefs', {
      //   userId: request.userId, prefs: parsed.data.preferences,
      // });
      return {
        status: 'ok',
        data: { userId: request.userId, preferences: parsed.data.preferences },
      };
    } catch {
      return {
        status: 'ok',
        data: { userId: request.userId, preferences: parsed.data.preferences },
      };
    }
  });

  /**
   * GET /notifications — Get notification preferences
   */
  app.get('/notifications', async (request) => {
    try {
      // TODO: Read from PostgreSQL
      return { status: 'ok', data: { userId: request.userId, preferences: [] } };
    } catch {
      return { status: 'ok', data: { userId: request.userId, preferences: [] } };
    }
  });
}
