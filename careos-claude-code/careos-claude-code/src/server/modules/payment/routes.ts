/**
 * Payment Routes
 * conductor, timebank_member, admin
 */
import type { FastifyInstance } from 'fastify';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { ValidationError } from '../../common/errors.js';
import { paymentService } from './service.js';
import {
  createMembershipSchema,
  buyCreditsSchema,
  comfortCardSubscribeSchema,
  cancelSubscriptionSchema,
} from './schemas.js';

export async function paymentRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireRole('conductor', 'timebank_member', 'admin'));

  /**
   * POST /membership — Pay annual membership ($100)
   */
  app.post('/membership', async (request, reply) => {
    const parsed = createMembershipSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid membership data');

    const result = await paymentService.createMembership(
      request.userId!,
      parsed.data.familyId,
      parsed.data.paymentMethodId,
    );
    reply.status(201).send(result);
  });

  /**
   * POST /credits — Purchase time bank credits ($15/hr)
   */
  app.post('/credits', async (request, reply) => {
    const parsed = buyCreditsSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid credit purchase data');

    const result = await paymentService.purchaseCredits(
      request.userId!,
      parsed.data.hours,
      parsed.data.paymentMethodId,
    );
    reply.status(201).send(result);
  });

  /**
   * POST /comfort-card — Subscribe to Comfort Card
   */
  app.post('/comfort-card', async (request, reply) => {
    const parsed = comfortCardSubscribeSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid subscription data');

    const result = await paymentService.subscribeComfortCard(
      request.userId!,
      parsed.data.familyId,
      parsed.data.paymentMethodId,
    );
    reply.status(201).send(result);
  });

  /**
   * DELETE /comfort-card — Cancel Comfort Card subscription
   */
  app.delete('/comfort-card', async (request, reply) => {
    const parsed = cancelSubscriptionSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid cancellation data');

    const result = await paymentService.cancelComfortCard(parsed.data.familyId);
    reply.send(result);
  });
}
