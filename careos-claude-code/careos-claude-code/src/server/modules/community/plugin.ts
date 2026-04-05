/**
 * Community Fastify Plugin
 */
import type { FastifyInstance } from 'fastify';
import { communityRoutes } from './routes.js';

export async function communityPlugin(app: FastifyInstance) {
  await app.register(communityRoutes);
}
