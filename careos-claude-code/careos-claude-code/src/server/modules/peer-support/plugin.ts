/**
 * Peer Support Fastify Plugin
 */
import type { FastifyInstance } from 'fastify';
import { peerSupportRoutes } from './routes.js';

export async function peerSupportPlugin(app: FastifyInstance) {
  await app.register(peerSupportRoutes);
}
