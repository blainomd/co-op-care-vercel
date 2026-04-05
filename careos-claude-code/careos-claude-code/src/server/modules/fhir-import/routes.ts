// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * FHIR Import Routes
 *
 * Endpoints for importing patient health records from external FHIR R4 sources
 * into Sage Living Profiles. Supports 21st Century Cures Act Patient Access APIs
 * via connectors like Flexpa, 1up Health, and Health Gorilla.
 */
import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { importPatientData, getImportStatus, recordImport } from './service.js';
import { getProfile, saveProfile } from '../memory/service.js';
import type { FhirBundle, SmartAuthRequest } from '@shared/types/fhir-import.types.js';

export async function fhirImportRoutes(app: FastifyInstance): Promise<void> {
  // All routes require authentication
  app.addHook('preHandler', requireAuth);

  /**
   * POST /api/fhir-import/patient
   *
   * Accept a FHIR R4 Bundle containing patient resources, extract structured
   * health data, and merge it into the user's existing Sage profile.
   *
   * Body: { bundle: FhirBundle, source?: string }
   */
  app.post('/patient', async (request, reply) => {
    const userId = request.userId!;
    const { bundle, source } = request.body as { bundle: FhirBundle; source?: string };

    if (!bundle?.resourceType || bundle.resourceType !== 'Bundle') {
      return reply.status(400).send({
        error: 'Invalid FHIR Bundle',
        message: 'Request body must contain a valid FHIR R4 Bundle with resourceType "Bundle".',
      });
    }

    // Extract profile data from the FHIR bundle
    const importedProfile = await importPatientData(bundle);
    importedProfile.userId = userId;

    // Merge with existing profile (additive merge via saveProfile)
    const existingProfile = await getProfile(userId);
    if (existingProfile?.careRecipient) {
      // Preserve existing careRecipient data, layer imported health on top
      importedProfile.careRecipient = {
        ...existingProfile.careRecipient,
        ...importedProfile.careRecipient,
      };
    }

    await saveProfile(importedProfile);

    // Record the import
    const entryCount = bundle.entry?.length ?? 0;
    await recordImport(userId, entryCount, source ?? 'manual');

    return reply.status(200).send({
      status: 'imported',
      resourceCount: entryCount,
      imported: {
        conditions: (importedProfile.careRecipient as Record<string, unknown>)?.importedHealth
          ? (
              (importedProfile.careRecipient as Record<string, unknown>).importedHealth as Record<
                string,
                unknown
              >
            ).conditions
          : [],
        medications: (importedProfile.careRecipient as Record<string, unknown>)?.importedHealth
          ? (
              (importedProfile.careRecipient as Record<string, unknown>).importedHealth as Record<
                string,
                unknown
              >
            ).medications
          : [],
        allergies: (importedProfile.careRecipient as Record<string, unknown>)?.importedHealth
          ? (
              (importedProfile.careRecipient as Record<string, unknown>).importedHealth as Record<
                string,
                unknown
              >
            ).allergies
          : [],
      },
    });
  });

  /**
   * POST /api/fhir-import/connect
   *
   * Initiate a SMART on FHIR authorization flow to connect a patient's
   * health records from a payer or provider portal.
   *
   * STUB: Returns the authorization URL the client should redirect to.
   * Full implementation requires SMART on FHIR client registration with
   * each connector (Flexpa, 1up Health, Health Gorilla).
   */
  app.post('/connect', async (request, reply) => {
    const userId = request.userId!;
    const { provider, fhirBaseUrl } = request.body as SmartAuthRequest;

    if (!provider) {
      return reply.status(400).send({
        error: 'Missing provider',
        message: 'Specify a FHIR connector provider: flexpa, 1up, health_gorilla, or custom.',
      });
    }

    // STUB: In production, this would:
    // 1. Look up the SMART configuration for the provider
    // 2. Generate a PKCE code verifier/challenge
    // 3. Store the state parameter linked to userId
    // 4. Return the authorization URL for the client to redirect to
    //
    // After the user authorizes, the callback would:
    // 1. Exchange the auth code for an access token
    // 2. Fetch the patient's FHIR data using the token
    // 3. Call importPatientData() with the resulting Bundle
    // 4. Save to profile

    return reply.status(200).send({
      status: 'stub',
      message:
        `SMART on FHIR authorization flow for "${provider}" is not yet implemented. ` +
        'Use POST /api/fhir-import/patient to manually import a FHIR Bundle.',
      provider,
      fhirBaseUrl: fhirBaseUrl ?? null,
      userId,
    });
  });

  /**
   * GET /api/fhir-import/status/:userId
   *
   * Check whether FHIR health data has been imported for a user.
   */
  app.get('/status/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string };

    // Users can only check their own status (unless admin)
    const requestingUser = request.userId!;
    if (requestingUser !== userId) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'You can only check your own FHIR import status.',
      });
    }

    const status = await getImportStatus(userId);
    return reply.status(200).send(status);
  });
}
