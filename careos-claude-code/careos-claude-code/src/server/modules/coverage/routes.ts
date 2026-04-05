/**
 * Coverage Intelligence Routes
 *
 * Endpoints for monitoring client insurance/Medicaid coverage status,
 * risk alerts, and regulatory calendar.
 */

import type { FastifyInstance } from 'fastify';
import { coverageService } from './coverage.service.js';

export async function coverageRoutes(app: FastifyInstance) {
  /**
   * GET /summary — Coverage intelligence dashboard summary
   */
  app.get('/summary', async () => {
    return coverageService.getSummary();
  });

  /**
   * GET /clients — All client coverage records (sorted by risk)
   */
  app.get('/clients', async () => {
    return coverageService.getClients();
  });

  /**
   * GET /clients/:careRecipientId — Single client coverage
   */
  app.get<{ Params: { careRecipientId: string } }>('/clients/:careRecipientId', async (request) => {
    const coverage = await coverageService.getClientCoverage(request.params.careRecipientId);
    if (!coverage) {
      return app.httpErrors.notFound('Client coverage record not found');
    }
    return coverage;
  });

  /**
   * GET /alerts — Active coverage alerts sorted by severity
   */
  app.get('/alerts', async () => {
    return coverageService.getAlerts();
  });

  /**
   * GET /regulatory — Upcoming regulatory events and deadlines
   */
  app.get('/regulatory', async () => {
    return coverageService.getRegulatoryCalendar();
  });
}
