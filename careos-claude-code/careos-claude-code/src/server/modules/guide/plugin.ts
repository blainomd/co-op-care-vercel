/**
 * Guide Plugin — Caregiver Guide Connector orchestrator
 */
import type { FastifyInstance } from 'fastify';
import { guideRoutes } from './routes.js';

export async function guidePlugin(app: FastifyInstance): Promise<void> {
  await app.register(guideRoutes);
}
