/**
 * Analytics Fastify Plugin
 */
import type { FastifyInstance } from 'fastify';
import { analyticsRoutes } from './routes.js';

export async function analyticsPlugin(app: FastifyInstance) {
  await app.register(analyticsRoutes);
}
