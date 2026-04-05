/**
 * Nutrition Fastify Plugin
 */
import type { FastifyInstance } from 'fastify';
import { nutritionRoutes } from './routes.js';

export async function nutritionPlugin(app: FastifyInstance) {
  await app.register(nutritionRoutes);
}
