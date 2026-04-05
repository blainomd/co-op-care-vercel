/**
 * Time Bank Plugin — Fastify plugin wrapper
 */
import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { timebankRoutes } from './routes.js';

const timebankRateLimit = {
  max: 60,
  timeWindow: '1 minute',
};

export async function timebankPlugin(app: FastifyInstance): Promise<void> {
  await app.register(rateLimit, timebankRateLimit);
  await app.register(timebankRoutes);
}
