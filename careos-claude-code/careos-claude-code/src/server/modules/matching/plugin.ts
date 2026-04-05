/**
 * Matching Fastify Plugin
 */
import type { FastifyInstance } from 'fastify';
import { matchingRoutes } from './routes.js';

export async function matchingPlugin(app: FastifyInstance) {
  await app.register(matchingRoutes);
}
