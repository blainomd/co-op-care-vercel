/**
 * Settings Module — Fastify Plugin
 */
import type { FastifyInstance } from 'fastify';
import { settingsRoutes } from './routes.js';

export async function settingsPlugin(app: FastifyInstance): Promise<void> {
  await app.register(settingsRoutes);
}
