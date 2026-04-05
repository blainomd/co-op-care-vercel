/**
 * ACP (Advance Care Planning) Plugin — Fastify plugin wrapper
 */
import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { acpRoutes } from './routes.js';

const acpRateLimit = {
  max: 60,
  timeWindow: '1 minute',
};

export async function acpPlugin(app: FastifyInstance): Promise<void> {
  await app.register(rateLimit, acpRateLimit);
  await app.register(acpRoutes);
}
