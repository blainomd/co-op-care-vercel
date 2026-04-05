/**
 * Admin Routes — Admin-only endpoints (role-gated)
 */
import type { FastifyInstance } from 'fastify';
import { adminService } from './service.js';
import { manualAssignSchema, adminDisbursementSchema, listMembersQuerySchema } from './schemas.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { ValidationError } from '../../common/errors.js';

export async function adminRoutes(app: FastifyInstance) {
  // All routes require auth + admin role
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireRole('admin'));

  // ── Dashboard Stats ──────────────────────────────────────
  app.get('/stats', async () => {
    return adminService.getDashboardStats();
  });

  // ── Capacity Metrics (Michaelis-Menten) ──────────────────
  app.get('/capacity', async () => {
    const metrics = await adminService.getCapacityMetrics();
    const curve = adminService.generateCapacityCurve(
      metrics.vmax,
      metrics.km,
      Math.max(metrics.openTasks * 2, 50),
    );
    return { metrics, curve };
  });

  // ── Match Candidates for a Task ──────────────────────────
  app.get<{ Params: { taskId: string } }>('/tasks/:taskId/candidates', async (request) => {
    const candidates = await adminService.getMatchCandidates(request.params.taskId);
    return { candidates };
  });

  // ── Manual Task Assignment ───────────────────────────────
  app.post<{ Params: { taskId: string } }>('/tasks/:taskId/assign', async (request, reply) => {
    const parsed = manualAssignSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid assignment data');

    await adminService.manualAssign(request.params.taskId, parsed.data.userId, request.userId!);
    reply.status(200).send({ ok: true });
  });

  // ── Member Management ────────────────────────────────────
  app.get('/members', async (request) => {
    const query = listMembersQuerySchema.safeParse(request.query);
    const role = query.success ? query.data.role : undefined;
    const members = await adminService.listMembers(role);
    return { members };
  });

  // ── Respite Fund ─────────────────────────────────────────
  app.get('/respite', async () => {
    const fund = await adminService.getRespiteFundAdmin();
    return { fund };
  });

  app.post('/respite/disburse', async (request, reply) => {
    const parsed = adminDisbursementSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid disbursement data');

    const result = await adminService.adminDisbursement(
      parsed.data.recipientUserId,
      parsed.data.hours,
      request.userId!,
    );
    reply.status(200).send(result);
  });
}
