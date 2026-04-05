/**
 * Assessment Module — Fastify Plugin
 */
import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { assessmentRoutes } from './routes.js';
import { assessmentRateLimit } from '../../middleware/rate-limit.middleware.js';

export async function assessmentPlugin(app: FastifyInstance): Promise<void> {
  // Assessment submission rate limit: 30/min
  await app.register(rateLimit, assessmentRateLimit);

  await app.register(assessmentRoutes);
}
