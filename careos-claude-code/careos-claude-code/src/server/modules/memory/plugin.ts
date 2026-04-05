// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Memory Plugin — Fastify plugin for profile persistence
 */
import type { FastifyInstance } from 'fastify';
import { memoryRoutes } from './routes.js';

export async function memoryPlugin(app: FastifyInstance) {
  await app.register(memoryRoutes);
}
