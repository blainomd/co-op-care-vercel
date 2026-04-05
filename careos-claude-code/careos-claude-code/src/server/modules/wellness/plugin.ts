/**
 * Wellness Marketplace Fastify Plugin
 */
import type { FastifyInstance } from 'fastify';
import { wellnessRoutes } from './routes.js';

export async function wellnessPlugin(app: FastifyInstance) {
  await app.register(wellnessRoutes);
}
