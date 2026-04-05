/**
 * Waitlist Routes — Lead Capture & FOMO Engine
 *
 * Public routes (no auth): join waitlist, check position, get stats
 * Admin routes: list entries, invite, convert
 */
import type { FastifyInstance } from 'fastify';
import { waitlistService, joinWaitlistSchema } from './service.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';

export async function waitlistRoutes(app: FastifyInstance) {
  // ── PUBLIC ROUTES (no auth required) ──────────────────

  // ── POST /api/v1/waitlist — Join the waitlist (from homepage quiz) ─
  app.post('/', async (request, reply) => {
    const input = joinWaitlistSchema.parse(request.body);
    const entry = await waitlistService.joinWaitlist(input);
    reply.code(201);
    return {
      entry: {
        id: entry.id,
        position: entry.position,
        status: entry.status,
        priority: entry.priority,
      },
    };
  });

  // ── GET /api/v1/waitlist/position/:email — Check your position ─
  app.get<{ Params: { email: string } }>('/position/:email', async (request) => {
    const result = await waitlistService.getPosition(request.params.email);
    return result;
  });

  // ── GET /api/v1/waitlist/stats — Aggregate stats for FOMO counters ─
  app.get('/stats', async () => {
    const stats = await waitlistService.getStats();
    return stats;
  });

  // ── ADMIN ROUTES (auth required) ──────────────────────

  // ── GET /api/v1/waitlist/entries — List all entries with filters ─
  app.get<{
    Querystring: {
      status?: string;
      source?: string;
      quizZone?: string;
      limit?: string;
      offset?: string;
    };
  }>(
    '/entries',
    {
      preHandler: [requireAuth, requireRole('admin')],
    },
    async (request) => {
      const { status, source, quizZone, limit, offset } = request.query;
      const entries = await waitlistService.listEntries({
        status,
        source,
        quizZone,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      });
      return { entries };
    },
  );

  // ── POST /api/v1/waitlist/:id/invite — Send invitation to join ─
  app.post<{ Params: { id: string } }>(
    '/:id/invite',
    {
      preHandler: [requireAuth, requireRole('admin')],
    },
    async (request) => {
      const entry = await waitlistService.inviteEntry(request.params.id);
      return { entry };
    },
  );

  // ── POST /api/v1/waitlist/:id/convert — Mark as converted to full member ─
  app.post<{
    Params: { id: string };
    Body: { convertedUserId?: string };
  }>(
    '/:id/convert',
    {
      preHandler: [requireAuth, requireRole('admin')],
    },
    async (request) => {
      const body = request.body as { convertedUserId?: string } | undefined;
      const entry = await waitlistService.convertEntry(request.params.id, body?.convertedUserId);
      return { entry };
    },
  );
}
