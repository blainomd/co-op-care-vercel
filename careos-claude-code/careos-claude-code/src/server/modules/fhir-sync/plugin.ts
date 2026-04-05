/**
 * FHIR Sync Plugin — Fastify plugin wrapper
 */
import type { FastifyInstance } from 'fastify';
import { fhirSyncRoutes } from './routes.js';

export async function fhirSyncPlugin(app: FastifyInstance): Promise<void> {
  await app.register(fhirSyncRoutes);
}
