/**
 * Auth Module — Fastify Plugin
 * Registers auth routes with rate limiting.
 */
import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { authRoutes } from './routes.js';
import { authRateLimit } from '../../middleware/rate-limit.middleware.js';

export async function authPlugin(app: FastifyInstance): Promise<void> {
  // Stricter rate limit for auth endpoints (10/min)
  await app.register(rateLimit, authRateLimit);

  await app.register(authRoutes);
}
