/**
 * Family Module — Fastify Plugin
 */
import type { FastifyInstance } from 'fastify';
import { familyRoutes } from './routes.js';

export async function familyPlugin(app: FastifyInstance): Promise<void> {
  await app.register(familyRoutes);
}
