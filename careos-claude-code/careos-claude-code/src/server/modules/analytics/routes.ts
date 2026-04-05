/**
 * Analytics Routes — Admin Dashboard API
 *
 * All routes require admin or medical_director role.
 */
import type { FastifyInstance } from 'fastify';
import { analyticsService } from './service.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';

export async function analyticsRoutes(app: FastifyInstance) {
  // All analytics routes require admin or medical_director
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireRole('admin', 'medical_director'));

  // ── GET /api/v1/analytics/overview — Key metrics dashboard ─
  app.get('/overview', async () => {
    const metrics = await analyticsService.getOverview();
    return { metrics };
  });

  // ── GET /api/v1/analytics/lmn — LMN pipeline metrics ─
  app.get('/lmn', async () => {
    const metrics = await analyticsService.getLmnPipeline();
    return { metrics };
  });

  // ── GET /api/v1/analytics/assessments — Assessment volume and scores ─
  app.get('/assessments', async () => {
    const metrics = await analyticsService.getAssessments();
    return { metrics };
  });

  // ── GET /api/v1/analytics/revenue — Revenue and reimbursement metrics ─
  app.get('/revenue', async () => {
    const metrics = await analyticsService.getRevenue();
    return { metrics };
  });

  // ── GET /api/v1/analytics/community — Community health metrics ─
  app.get('/community', async () => {
    const metrics = await analyticsService.getCommunity();
    return { metrics };
  });

  // ── GET /api/v1/analytics/funnel — Conversion funnel metrics ─
  app.get('/funnel', async () => {
    const metrics = await analyticsService.getFunnel();
    return { metrics };
  });
}
