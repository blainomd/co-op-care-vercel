/**
 * Community Routes — Profiles, Leaderboard, Capability Verification, Reviews
 */
import type { FastifyInstance } from 'fastify';
import { communityService, createReviewSchema } from './service.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';

export async function communityRoutes(app: FastifyInstance) {
  // All community routes require authentication
  app.addHook('preHandler', requireAuth);

  // ── GET /api/v1/community/profile/:userId — Public community profile ─
  app.get<{ Params: { userId: string } }>('/profile/:userId', async (request) => {
    const profile = await communityService.getProfile(request.params.userId);
    return { profile };
  });

  // ── GET /api/v1/community/leaderboard — Top contributors (opt-in only) ─
  app.get('/leaderboard', async () => {
    const leaderboard = await communityService.getLeaderboard();
    return { leaderboard };
  });

  // ── POST /api/v1/community/capabilities/:capabilityId/verify — Admin verifies capability ─
  app.post<{ Params: { capabilityId: string } }>(
    '/capabilities/:capabilityId/verify',
    {
      preHandler: [requireRole('admin', 'medical_director')],
    },
    async (request) => {
      const capability = await communityService.verifyCapability(
        request.params.capabilityId,
        request.userId!,
      );
      return { capability };
    },
  );

  // ── POST /api/v1/community/reviews — Leave a review ──
  app.post('/reviews', async (request) => {
    const input = createReviewSchema.parse(request.body);
    const review = await communityService.createReview(request.userId!, input);
    return { review };
  });
}
