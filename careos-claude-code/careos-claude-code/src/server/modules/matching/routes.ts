/**
 * Matching Routes — Caregiver-Family Matching Engine
 */
import type { FastifyInstance } from 'fastify';
import { matchingService, matchRequestSchema } from './service.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

export async function matchingRoutes(app: FastifyInstance) {
  // All matching routes require authentication
  app.addHook('preHandler', requireAuth);

  // ── POST /api/v1/matching/request — Submit match request, returns ranked matches ─
  app.post('/request', async (request) => {
    const input = matchRequestSchema.parse(request.body);
    const result = await matchingService.submitMatchRequest(input);
    return {
      matchRequest: result.matchRequest,
      matches: result.matches,
    };
  });

  // ── GET /api/v1/matching/requests — List my match requests ─
  app.get('/requests', async (request) => {
    const requests = await matchingService.listMyMatchRequests(request.userId!);
    return { requests };
  });

  // ── POST /api/v1/matching/requests/:id/accept — Accept a specific caregiver ─
  app.post<{
    Params: { id: string };
    Body: { caregiverId: string };
  }>('/requests/:id/accept', async (request) => {
    const { caregiverId } = request.body as { caregiverId: string };
    const matchRequest = await matchingService.acceptMatch(
      request.params.id,
      caregiverId,
      request.userId!,
    );
    return { matchRequest };
  });

  // ── POST /api/v1/matching/requests/:id/decline — Decline and see next options ─
  app.post<{ Params: { id: string } }>('/requests/:id/decline', async (request) => {
    const result = await matchingService.declineMatch(request.params.id, request.userId!);
    return {
      matchRequest: result.matchRequest,
      alternateMatches: result.alternateMatches,
    };
  });

  // ── GET /api/v1/matching/availability/:caregiverId — Check caregiver schedule ─
  app.get<{ Params: { caregiverId: string } }>('/availability/:caregiverId', async (request) => {
    const availability = await matchingService.getCaregiverAvailability(request.params.caregiverId);
    return { availability };
  });
}
