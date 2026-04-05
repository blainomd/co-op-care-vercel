/**
 * Referral Routes — Discharge Planner / Social Worker Referral API
 */
import type { FastifyInstance } from 'fastify';
import { referralService, createReferralSchema, updateReferralStatusSchema } from './service.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';

export async function referralRoutes(app: FastifyInstance) {
  // ── POST /api/v1/referrals — Submit a new referral ────
  // Auth required but open to any authenticated role (hospitals may have service accounts)
  app.post('/', { preHandler: [requireAuth] }, async (request) => {
    const input = createReferralSchema.parse(request.body);
    const result = await referralService.create(input);
    return {
      referralId: result.referral.id,
      estimatedAcuity: result.estimatedAcuity,
      estimatedCriScore: result.estimatedCriScore,
      recommendedTier: result.recommendedTier,
      lmnDraftGenerated: result.lmnDraftGenerated,
    };
  });

  // ── GET /api/v1/referrals — List all referrals (admin/medical_director) ─
  app.get(
    '/',
    {
      preHandler: [requireAuth, requireRole('admin', 'medical_director')],
    },
    async () => {
      const referrals = await referralService.list();
      return { referrals };
    },
  );

  // ── GET /api/v1/referrals/:id — Get referral detail ───
  app.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [requireAuth, requireRole('admin', 'medical_director')],
    },
    async (request) => {
      const referral = await referralService.getById(request.params.id);
      return { referral };
    },
  );

  // ── PATCH /api/v1/referrals/:id — Update referral status ─
  app.patch<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [requireAuth, requireRole('admin', 'medical_director')],
    },
    async (request) => {
      const input = updateReferralStatusSchema.parse(request.body);
      const referral = await referralService.updateStatus(request.params.id, input);
      return { referral };
    },
  );
}
