/**
 * Waitlist Fastify Plugin
 */
import type { FastifyInstance } from 'fastify';
import { waitlistRoutes } from './routes.js';

export async function waitlistPlugin(app: FastifyInstance) {
  await app.register(waitlistRoutes);
}
