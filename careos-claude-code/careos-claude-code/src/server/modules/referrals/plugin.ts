/**
 * Referral Fastify Plugin
 */
import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { referralRoutes } from './routes.js';
import { referralRateLimit } from '../../middleware/rate-limit.middleware.js';

export async function referralPlugin(app: FastifyInstance): Promise<void> {
  await app.register(rateLimit, referralRateLimit);
  await app.register(referralRoutes);
}
