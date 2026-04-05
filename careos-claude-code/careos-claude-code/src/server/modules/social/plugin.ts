/**
 * Social Fastify Plugin
 */
import type { FastifyInstance } from 'fastify';
import { socialRoutes } from './routes.js';

export async function socialPlugin(app: FastifyInstance) {
  await app.register(socialRoutes);
}
