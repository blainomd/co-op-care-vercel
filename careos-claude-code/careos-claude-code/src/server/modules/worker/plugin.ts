/**
 * Worker Plugin — Fastify plugin wrapper
 */
import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { workerRoutes } from './routes.js';

const workerRateLimit = {
  max: 60,
  timeWindow: '1 minute',
};

export async function workerPlugin(app: FastifyInstance): Promise<void> {
  await app.register(rateLimit, workerRateLimit);
  await app.register(workerRoutes);
}
