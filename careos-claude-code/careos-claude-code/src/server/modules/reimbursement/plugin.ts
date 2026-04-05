/**
 * Reimbursement Fastify Plugin
 */
import type { FastifyInstance } from 'fastify';
import { reimbursementRoutes } from './routes.js';

export async function reimbursementPlugin(app: FastifyInstance) {
  await app.register(reimbursementRoutes);
}
