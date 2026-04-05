/**
 * Referral Rewards Routes — Code Generation, Validation, Redemption, Leaderboard
 *
 * Public routes: validate code, redeem code
 * Auth routes: generate code, my codes, history, leaderboard, stats
 * Admin routes: advance events through milestones
 */
import type { FastifyInstance } from 'fastify';
import {
  referralRewardsService,
  generateCodeSchema,
  redeemCodeSchema,
  advanceEventSchema,
} from './service.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';

export async function referralRewardsRoutes(app: FastifyInstance) {
  // ── PUBLIC ROUTES (no auth required) ──────────────────

  // GET /api/v1/referral-rewards/codes/:code/validate — Validate a referral code
  app.get<{ Params: { code: string } }>('/codes/:code/validate', async (request) => {
    const result = await referralRewardsService.validateCode(request.params.code);
    return result;
  });

  // POST /api/v1/referral-rewards/redeem — Record referral code redemption during signup
  app.post('/redeem', async (request, reply) => {
    const input = redeemCodeSchema.parse(request.body);
    const event = await referralRewardsService.redeemCode(input);
    reply.code(201);
    return { event };
  });

  // ── AUTHENTICATED ROUTES ──────────────────────────────

  // POST /api/v1/referral-rewards/codes — Generate my referral code
  app.post(
    '/codes',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      const input = generateCodeSchema.parse(request.body);
      const code = await referralRewardsService.generateCode(request.userId!, input);
      reply.code(201);
      return { code };
    },
  );

  // GET /api/v1/referral-rewards/codes — Get my codes
  app.get(
    '/codes',
    {
      preHandler: [requireAuth],
    },
    async (request) => {
      const codes = await referralRewardsService.getMyCodes(request.userId!);
      return { codes };
    },
  );

  // GET /api/v1/referral-rewards/history — My referral history + rewards
  app.get(
    '/history',
    {
      preHandler: [requireAuth],
    },
    async (request) => {
      const history = await referralRewardsService.getMyHistory(request.userId!);
      return history;
    },
  );

  // GET /api/v1/referral-rewards/leaderboard — Top referrers
  app.get(
    '/leaderboard',
    {
      preHandler: [requireAuth],
    },
    async () => {
      const leaderboard = await referralRewardsService.getLeaderboard();
      return { leaderboard };
    },
  );

  // GET /api/v1/referral-rewards/stats — Aggregate stats
  app.get(
    '/stats',
    {
      preHandler: [requireAuth],
    },
    async () => {
      const stats = await referralRewardsService.getStats();
      return stats;
    },
  );

  // ── ADMIN ROUTES ──────────────────────────────────────

  // POST /api/v1/referral-rewards/events/:id/advance — Advance through milestones
  app.post<{ Params: { id: string } }>(
    '/events/:id/advance',
    {
      preHandler: [requireAuth, requireRole('admin')],
    },
    async (request) => {
      const input = advanceEventSchema.parse(request.body);
      const event = await referralRewardsService.advanceEvent(request.params.id, input);
      return { event };
    },
  );
}
