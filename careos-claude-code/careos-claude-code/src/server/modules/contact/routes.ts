/**
 * Contact Routes — Public lead capture
 * POST /schedule-call — No auth required
 */
import type { FastifyInstance } from 'fastify';
import { ValidationError } from '../../common/errors.js';
import { contactService } from './service.js';
import { scheduleCallSchema } from './schemas.js';

export async function contactRoutes(app: FastifyInstance): Promise<void> {
  /**
   * POST /schedule-call — Schedule a call with Care Navigator
   * Public endpoint, part of onboarding funnel.
   */
  app.post('/schedule-call', async (request, reply) => {
    const parsed = scheduleCallSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid contact data');

    const result = await contactService.scheduleCall(parsed.data);
    reply.status(201).send(result);
  });
}
