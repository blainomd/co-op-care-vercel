/**
 * Agent API — REST endpoints for the agentic system
 *
 * Exposes:
 * - GET  /api/v1/agents/status          — All agent health metrics
 * - GET  /api/v1/agents/journeys        — All family care journeys
 * - GET  /api/v1/agents/journeys/:id    — Single family journey
 * - GET  /api/v1/agents/review-queue    — Josh's LMN review queue
 * - POST /api/v1/agents/review/:id/sign — Sign an LMN
 * - POST /api/v1/agents/review/:id/reject — Reject an LMN
 * - GET  /api/v1/agents/synthesis       — Latest synthesis report
 * - POST /api/v1/agents/synthesis/run   — Trigger synthesis cycle
 * - GET  /api/v1/agents/billing         — Billing records
 * - POST /api/v1/agents/billing/:id/pay — Mark invoice paid
 */
import type { FastifyInstance } from 'fastify';
import type { ReviewStatus } from './review-router.agent.js';
import {
  getAgentMetrics,
  runSynthesisCycle,
  getAllJourneys,
  getJourney,
  getReviewQueue,
  getReviewItem,
  getAutoApprovedItems,
  getTriageStats,
  signLMN,
  rejectLMN,
  getLatestReport,
  getReports,
  getBillingRecords,
  markInvoicePaid,
} from './index.js';
import { seedDemoData } from './demo-seed.js';
import { logger } from '../common/logger.js';

export async function registerAgentRoutes(app: FastifyInstance): Promise<void> {
  // ── Agent Health ────────────────────────────────────────────────────

  app.get('/api/v1/agents/status', async () => {
    return {
      status: 'online',
      agents: getAgentMetrics(),
      timestamp: new Date().toISOString(),
    };
  });

  // ── Care Journeys ──────────────────────────────────────────────────

  app.get('/api/v1/agents/journeys', async () => {
    const journeys = getAllJourneys();
    return {
      count: journeys.length,
      journeys: journeys.map((j) => ({
        familyId: j.familyId,
        stage: j.stage,
        profileCompleteness: j.profileCompleteness,
        stageEnteredAt: j.stageEnteredAt,
        assessments: j.assessments,
        lmn: j.lmn,
        billing: j.billing,
        historyLength: j.history.length,
      })),
    };
  });

  app.get<{ Params: { id: string } }>('/api/v1/agents/journeys/:id', async (request) => {
    const journey = getJourney(request.params.id);
    return { journey };
  });

  // ── Review Queue (Josh's Dashboard) ────────────────────────────────

  app.get<{ Querystring: { status?: string } }>('/api/v1/agents/review-queue', async (request) => {
    const status = request.query.status as ReviewStatus | undefined;
    const queue = getReviewQueue(status);
    return {
      count: queue.length,
      items: queue.map((item) => ({
        id: item.id,
        familyId: item.familyId,
        priority: item.priority,
        status: item.status,
        acuity: item.acuity,
        recommendedTier: item.recommendedTier,
        monthlyCost: item.monthlyCost,
        estimatedHsaSavings: item.estimatedHsaSavings,
        careRecipientName: item.careRecipientName,
        careRecipientAge: item.careRecipientAge,
        careRecipientState: item.careRecipientState,
        riskFlagCount: item.riskFlags.length,
        diagnosisCount: item.diagnosisCodes.length,
        createdAt: item.createdAt,
      })),
    };
  });

  app.get<{ Params: { id: string } }>('/api/v1/agents/review-queue/:id', async (request) => {
    const item = getReviewItem(request.params.id);
    if (!item) return { error: 'Review item not found' };
    return { item };
  });

  app.post<{ Params: { id: string }; Body: { notes?: string } }>(
    '/api/v1/agents/review/:id/sign',
    async (request) => {
      const result = await signLMN(request.params.id, request.body?.notes);
      if (!result) return { error: 'Review item not found' };
      return { success: true, item: result };
    },
  );

  app.post<{ Params: { id: string }; Body: { reason: string } }>(
    '/api/v1/agents/review/:id/reject',
    async (request) => {
      const result = await rejectLMN(request.params.id, request.body?.reason ?? 'Needs revision');
      if (!result) return { error: 'Review item not found' };
      return { success: true, item: result };
    },
  );

  // ── Auto-Approved & Triage Stats ──────────────────────────────────

  app.get('/api/v1/agents/auto-approved', async () => {
    const items = getAutoApprovedItems();
    return {
      count: items.length,
      items: items.map((item) => ({
        id: item.id,
        familyId: item.familyId,
        careRecipientName: item.careRecipientName,
        careRecipientAge: item.careRecipientAge,
        careRecipientState: item.careRecipientState,
        recommendedTier: item.recommendedTier,
        monthlyCost: item.monthlyCost,
        estimatedHsaSavings: item.estimatedHsaSavings,
        acuity: item.acuity,
        triage: item.triage,
        createdAt: item.createdAt,
        reviewedAt: item.reviewedAt,
      })),
    };
  });

  app.get('/api/v1/agents/triage-stats', async () => {
    return getTriageStats();
  });

  // ── Demo Seed ────────────────────────────────────────────────────

  app.post('/api/v1/agents/demo/seed', async () => {
    logger.info('Demo data seed triggered');
    const result = await seedDemoData();
    return { success: true, ...result };
  });

  // ── Synthesis ──────────────────────────────────────────────────────

  app.get('/api/v1/agents/synthesis', async () => {
    const latest = getLatestReport();
    return {
      hasReport: !!latest,
      report: latest,
    };
  });

  app.get<{ Querystring: { limit?: string } }>(
    '/api/v1/agents/synthesis/history',
    async (request) => {
      const limit = parseInt(request.query.limit ?? '30', 10);
      return { reports: getReports(limit) };
    },
  );

  app.post('/api/v1/agents/synthesis/run', async () => {
    logger.info('Manual synthesis cycle triggered');
    const report = await runSynthesisCycle();
    return { success: true, report };
  });

  // ── Billing ────────────────────────────────────────────────────────

  app.get<{ Querystring: { familyId?: string } }>('/api/v1/agents/billing', async (request) => {
    const records = getBillingRecords(request.query.familyId);
    return {
      count: records.length,
      records,
    };
  });

  app.post<{ Params: { id: string } }>('/api/v1/agents/billing/:id/pay', async (request) => {
    const result = await markInvoicePaid(request.params.id);
    if (!result) return { error: 'Billing record not found' };
    return { success: true, record: result };
  });

  logger.info('Agent API routes registered — /api/v1/agents/*');
}
