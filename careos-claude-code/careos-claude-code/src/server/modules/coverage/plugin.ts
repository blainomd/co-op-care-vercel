/**
 * Coverage Module — Fastify Plugin
 * Insurance coverage verification and eligibility checks.
 */
import type { FastifyInstance } from 'fastify';

export async function coveragePlugin(app: FastifyInstance): Promise<void> {
  app.get('/api/v1/coverage/health', async () => ({ status: 'ok', module: 'coverage' }));
}
