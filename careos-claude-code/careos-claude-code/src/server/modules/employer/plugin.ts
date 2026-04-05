/**
 * Employer Plugin — Register employer routes
 */
import type { FastifyInstance } from 'fastify';
import { employerRoutes } from './routes.js';

export async function employerPlugin(app: FastifyInstance): Promise<void> {
  await app.register(employerRoutes);
}
