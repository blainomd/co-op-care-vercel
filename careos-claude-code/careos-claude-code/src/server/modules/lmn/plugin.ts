/**
 * LMN Fastify Plugin
 *
 * Registers both public routes (no auth — direct-to-consumer $199 LMN flow)
 * and authenticated routes (conductor/MD/admin LMN management).
 */
import type { FastifyInstance } from 'fastify';
import { lmnRoutes, lmnPublicRoutes } from './routes.js';

export async function lmnPlugin(app: FastifyInstance) {
  // Public routes: /api/lmn/public-request, /api/lmn/pricing
  await app.register(lmnPublicRoutes, { prefix: '' });
  // Authenticated routes: /api/lmn/* (list, generate, sign, revoke, renew)
  await app.register(lmnRoutes, { prefix: '' });
}
