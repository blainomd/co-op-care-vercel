/**
 * Employer Routes — Employer-only endpoints (org-scoped, anonymized)
 */
import type { FastifyInstance } from 'fastify';
import { employerService } from './service.js';
import { quarterlyROIQuerySchema } from './schemas.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';

export async function employerRoutes(app: FastifyInstance) {
  // All routes require auth + employer_hr or admin role
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireRole('employer_hr', 'admin'));

  // ── Aggregate Dashboard ──────────────────────────────────
  app.get('/dashboard', async () => {
    return employerService.getDashboardData();
  });

  // ── CII Distribution (anonymized) ────────────────────────
  app.get('/cii-distribution', async () => {
    const distribution = await employerService.getCIIDistribution();
    return { distribution };
  });

  // ── PEPM Metrics ─────────────────────────────────────────
  app.get('/pepm', async () => {
    const pepm = await employerService.getPEPMMetrics();
    return { pepm };
  });

  // ── Productivity Impact ──────────────────────────────────
  app.get('/productivity', async () => {
    const productivity = await employerService.getProductivityImpact();
    return { productivity };
  });

  // ── Quarterly ROI Report ─────────────────────────────────
  app.get('/roi', async (request) => {
    const query = quarterlyROIQuerySchema.safeParse(request.query);
    const quarters = query.success ? query.data.quarters : 4;

    const pepm = await employerService.getPEPMMetrics();
    const productivity = await employerService.getProductivityImpact();

    const report = employerService.generateQuarterlyROI(
      pepm.enrolledEmployees,
      productivity.totalCareHours,
      quarters,
    );
    return { report };
  });
}
