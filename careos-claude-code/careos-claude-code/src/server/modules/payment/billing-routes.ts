/**
 * Billing Routes — Reconciliation, eligibility, statements
 * conductor, timebank_member, admin
 */
import type { FastifyInstance } from 'fastify';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { ValidationError } from '../../common/errors.js';
import { irs502Service } from './irs502.js';
import { statementQuerySchema, eligibilityQuerySchema } from './schemas.js';

export async function billingRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireRole('conductor', 'timebank_member', 'admin'));

  /**
   * GET /eligibility — Check HSA/FSA eligibility for a care recipient
   */
  app.get('/eligibility', async (request, reply) => {
    const parsed = eligibilityQuerySchema.safeParse(request.query);
    if (!parsed.success) throw new ValidationError('Invalid eligibility query');

    const result = await irs502Service.checkEligibility(parsed.data.careRecipientId);
    reply.send(result);
  });

  /**
   * GET /eligibility/family — Check eligibility for all care recipients in a family
   */
  app.get('/eligibility/family', async (request, reply) => {
    const parsed = statementQuerySchema.safeParse(request.query);
    if (!parsed.success) throw new ValidationError('Invalid family query');

    const result = await irs502Service.checkFamilyEligibility(parsed.data.familyId);
    reply.send(result);
  });
}
