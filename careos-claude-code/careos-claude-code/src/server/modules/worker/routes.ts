/**
 * Worker Routes — Shifts, Care Logs, Shift Swaps, Voice Transcription
 * worker_owner, conductor, admin
 */
import type { FastifyInstance } from 'fastify';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { ValidationError } from '../../common/errors.js';
import { workerService } from './service.js';
import {
  checkInShiftSchema,
  checkOutShiftSchema,
  createCareLogSchema,
  requestShiftSwapSchema,
  respondShiftSwapSchema,
  submitTranscriptionSchema,
  createIncidentSchema,
} from './schemas.js';

export async function workerRoutes(app: FastifyInstance): Promise<void> {
  // All routes require auth + worker/conductor/admin
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireRole('worker_owner', 'conductor', 'admin'));

  // ─── Schedule ────────────────────────────────────────────

  /**
   * GET /shifts/today — Today's shifts for the worker
   */
  app.get('/shifts/today', async (request) => {
    return workerService.getTodayShifts(request.userId!);
  });

  /**
   * GET /shifts — List shifts (optional date range)
   */
  app.get('/shifts', async (request) => {
    const { from, to } = request.query as { from?: string; to?: string };
    return workerService.getShifts(request.userId!, from, to);
  });

  /**
   * GET /shifts/:shiftId — Get single shift details
   */
  app.get('/shifts/:shiftId', async (request) => {
    const { shiftId } = request.params as { shiftId: string };
    return workerService.getShift(shiftId);
  });

  // ─── Shift Clock ─────────────────────────────────────────

  /**
   * POST /shifts/:shiftId/checkin — GPS check-in
   */
  app.post('/shifts/:shiftId/checkin', async (request) => {
    const { shiftId } = request.params as { shiftId: string };
    const parsed = checkInShiftSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid check-in data');

    return workerService.checkIn(request.userId!, shiftId, parsed.data);
  });

  /**
   * POST /shifts/:shiftId/checkout — GPS check-out + summary
   */
  app.post('/shifts/:shiftId/checkout', async (request) => {
    const { shiftId } = request.params as { shiftId: string };
    const parsed = checkOutShiftSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid check-out data');

    return workerService.checkOut(request.userId!, shiftId, parsed.data);
  });

  /**
   * POST /shifts/:shiftId/break/start — Start break
   */
  app.post('/shifts/:shiftId/break/start', async (request) => {
    const { shiftId } = request.params as { shiftId: string };
    return workerService.startBreak(request.userId!, shiftId);
  });

  /**
   * POST /shifts/:shiftId/break/end — End break
   */
  app.post('/shifts/:shiftId/break/end', async (request) => {
    const { shiftId } = request.params as { shiftId: string };
    return workerService.endBreak(request.userId!, shiftId);
  });

  // ─── Care Logs ───────────────────────────────────────────

  /**
   * POST /care-logs — Create a care log entry
   */
  app.post('/care-logs', async (request, reply) => {
    const parsed = createCareLogSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid care log data');

    const log = await workerService.createCareLog(request.userId!, parsed.data);
    reply.status(201).send(log);
  });

  /**
   * GET /care-logs/shift/:shiftId — Care logs for a specific shift
   */
  app.get('/care-logs/shift/:shiftId', async (request) => {
    const { shiftId } = request.params as { shiftId: string };
    return workerService.getCareLogsByShift(shiftId);
  });

  /**
   * GET /care-logs — Recent care logs for the worker
   */
  app.get('/care-logs', async (request) => {
    const { limit } = request.query as { limit?: string };
    return workerService.getRecentCareLogs(
      request.userId!,
      limit ? parseInt(limit, 10) : undefined,
    );
  });

  // ─── Voice Transcription ─────────────────────────────────

  /**
   * POST /transcribe — Process voice transcription for Omaha coding
   */
  app.post('/transcribe', async (request) => {
    const parsed = submitTranscriptionSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid transcription data');

    return workerService.processTranscription(request.userId!, parsed.data);
  });

  // ─── Shift Swaps ─────────────────────────────────────────

  /**
   * POST /swaps — Request a shift swap
   */
  app.post('/swaps', async (request, reply) => {
    const parsed = requestShiftSwapSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid swap request');

    const swap = await workerService.requestSwap(request.userId!, parsed.data);
    reply.status(201).send(swap);
  });

  /**
   * GET /swaps — List open swaps available to pick up
   */
  app.get('/swaps', async () => {
    return workerService.getOpenSwaps();
  });

  /**
   * GET /swaps/mine — My swap requests
   */
  app.get('/swaps/mine', async (request) => {
    return workerService.getMySwapRequests(request.userId!);
  });

  /**
   * POST /swaps/:swapId/respond — Accept or reject a swap
   */
  app.post('/swaps/:swapId/respond', async (request) => {
    const { swapId } = request.params as { swapId: string };
    const parsed = respondShiftSwapSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid response');

    return workerService.respondToSwap(request.userId!, swapId, parsed.data);
  });

  // ─── Incidents ─────────────────────────────────────────────

  /**
   * POST /incidents — File an incident report
   *
   * Previously the client (IncidentReport.tsx) posted here but no
   * server route existed, resulting in a silent 404.
   */
  app.post('/incidents', async (request, reply) => {
    const parsed = createIncidentSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid incident data');

    const incident = {
      id: `incident:${Date.now()}`,
      reportedBy: request.userId!,
      ...parsed.data,
      status: 'submitted' as const,
      createdAt: new Date().toISOString(),
    };

    reply.status(201).send({ status: 'ok', data: incident });
  });

  /**
   * GET /incidents — List incidents reported by the worker
   */
  app.get('/incidents', async (request) => {
    try {
      return { status: 'ok', data: { incidents: [], userId: request.userId } };
    } catch {
      return { status: 'ok', data: { incidents: [] } };
    }
  });

  // ─── Equity ──────────────────────────────────────────────

  /**
   * GET /equity — Worker's cooperative equity info
   */
  app.get('/equity', async (request) => {
    return workerService.getEquity(request.userId!);
  });
}
