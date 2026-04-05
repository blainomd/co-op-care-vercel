/**
 * Admin Plugin — Register admin routes
 */
import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { adminRoutes } from './routes.js';
import { adminRateLimit } from '../../middleware/rate-limit.middleware.js';

export async function adminPlugin(app: FastifyInstance): Promise<void> {
  await app.register(rateLimit, adminRateLimit);
  await app.register(adminRoutes);
}
