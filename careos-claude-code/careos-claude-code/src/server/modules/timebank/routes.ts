/**
 * Time Bank Routes
 * conductor, timebank_member, admin
 */
import type { FastifyInstance } from 'fastify';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { ValidationError } from '../../common/errors.js';
import { timebankService } from './service.js';
import { careTierService } from './care-tier.service.js';
import { createTaskSchema, checkInSchema, checkOutSchema, buyCreditsSchema } from './schemas.js';

export async function timebankRoutes(app: FastifyInstance): Promise<void> {
  // All routes require auth + allowed roles
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireRole('conductor', 'timebank_member', 'admin'));

  // ─── Task Lifecycle ────────────────────────────────────────

  /**
   * POST /tasks — Create a new task request
   */
  app.post('/tasks', async (request, reply) => {
    const parsed = createTaskSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid task data');

    const task = await timebankService.createTask(request.userId!, parsed.data);
    reply.status(201).send(task);
  });

  /**
   * GET /tasks — List open tasks (task feed)
   */
  app.get('/tasks', async (request) => {
    const { limit } = request.query as { limit?: string };
    return timebankService.listOpenTasks(limit ? parseInt(limit, 10) : undefined);
  });

  /**
   * GET /tasks/mine — Get user's tasks (requested + assigned)
   */
  app.get('/tasks/mine', async (request) => {
    return timebankService.getUserTasks(request.userId!);
  });

  /**
   * POST /tasks/:taskId/accept — Accept a task
   */
  app.post('/tasks/:taskId/accept', async (request) => {
    const { taskId } = request.params as { taskId: string };
    return timebankService.acceptTask(taskId, request.userId!);
  });

  /**
   * POST /tasks/:taskId/checkin — GPS check-in
   */
  app.post('/tasks/:taskId/checkin', async (request) => {
    const { taskId } = request.params as { taskId: string };
    const parsed = checkInSchema.safeParse({ ...(request.body as object), taskId });
    if (!parsed.success) throw new ValidationError('Invalid check-in data');

    return timebankService.checkIn(request.userId!, parsed.data);
  });

  /**
   * POST /tasks/:taskId/checkout — GPS check-out (triggers credits)
   */
  app.post('/tasks/:taskId/checkout', async (request) => {
    const { taskId } = request.params as { taskId: string };
    const parsed = checkOutSchema.safeParse({ ...(request.body as object), taskId });
    if (!parsed.success) throw new ValidationError('Invalid check-out data');

    return timebankService.checkOut(request.userId!, parsed.data);
  });

  // ─── Credits ───────────────────────────────────────────────

  /**
   * GET /balance — Get current balance
   */
  app.get('/balance', async (request) => {
    return timebankService.getBalance(request.userId!);
  });

  /**
   * POST /buy — Purchase credits ($15/hr)
   */
  app.post('/buy', async (request, reply) => {
    const parsed = buyCreditsSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid purchase data');

    const result = await timebankService.buyCredits(request.userId!, parsed.data);
    reply.status(201).send(result);
  });

  // ─── Impact + Community ────────────────────────────────────

  /**
   * GET /cascade — Get cascade chain (impact visualization)
   */
  app.get('/cascade', async (request) => {
    const { depth } = request.query as { depth?: string };
    return timebankService.getCascadeChain(
      request.userId!,
      depth ? parseInt(depth, 10) : undefined,
    );
  });

  /**
   * GET /impact — Get impact score
   */
  app.get('/impact', async (request) => {
    return timebankService.getImpactScore(request.userId!);
  });

  /**
   * GET /streak — Get streak info
   */
  app.get('/streak', async (request) => {
    return timebankService.getStreakInfo(request.userId!);
  });

  /**
   * GET /nudges — Get active nudges
   */
  app.get('/nudges', async (request) => {
    return timebankService.getNudges(request.userId!);
  });

  // ─── Care Tier ────────────────────────────────────────────

  /**
   * GET /tier — Get care tier progress (Seedling → Rooted → Canopy)
   */
  app.get('/tier', async (request) => {
    return careTierService.getTierProgress(request.userId!);
  });

  /**
   * GET /tier/summary — Get full tier summary with benefits + governance
   */
  app.get('/tier/summary', async (request) => {
    return careTierService.getTierSummary(request.userId!);
  });
}
