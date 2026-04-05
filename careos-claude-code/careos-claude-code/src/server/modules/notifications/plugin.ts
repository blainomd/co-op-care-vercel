/**
 * Notifications Plugin — Fastify plugin wrapper
 */
import type { FastifyInstance } from 'fastify';
import { notificationRoutes } from './routes.js';

export async function notificationPlugin(app: FastifyInstance): Promise<void> {
  await app.register(notificationRoutes);
}
