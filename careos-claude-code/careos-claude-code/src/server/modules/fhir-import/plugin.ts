/**
 * FHIR Import Plugin — Fastify plugin wrapper
 *
 * Registers routes for importing patient health records from external
 * FHIR R4 sources into Sage Living Profiles.
 */
import type { FastifyInstance } from 'fastify';
import { fhirImportRoutes } from './routes.js';

export async function fhirImportPlugin(app: FastifyInstance): Promise<void> {
  await app.register(fhirImportRoutes);
}
