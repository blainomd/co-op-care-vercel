/**
 * Contact Module — Fastify Plugin
 */
import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { contactRoutes } from './routes.js';
import { contactRateLimit } from '../../middleware/rate-limit.middleware.js';

export async function contactPlugin(app: FastifyInstance): Promise<void> {
  // Contact form rate limit: 5/min (prevent spam)
  await app.register(rateLimit, contactRateLimit);

  await app.register(contactRoutes);
}
