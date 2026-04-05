// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Aidbox Webhook Handler — Reverse sync (Aidbox → PostgreSQL)
 *
 * Handles FHIR Subscription notifications from Aidbox.
 * When clinical events occur in Aidbox (e.g., hospital integration creates Encounter),
 * this handler writes the corresponding operational data to PostgreSQL.
 */
import { getPostgres } from '../../database/postgres.js';
import { logger } from '../../common/logger.js';

export interface AidboxWebhookPayload {
  resourceType: string;
  id: string;
  event: 'create' | 'update' | 'delete';
  resource: Record<string, unknown>;
}

/**
 * Process an incoming Aidbox subscription webhook
 */
export async function handleAidboxWebhook(payload: AidboxWebhookPayload): Promise<void> {
  const { resourceType, id, event, resource } = payload;

  logger.info({ resourceType, id, event }, 'Aidbox webhook received');

  switch (resourceType) {
    case 'Encounter':
      await handleEncounterEvent(event, id, resource);
      break;
    case 'Observation':
      await handleObservationEvent(event, id, resource);
      break;
    default:
      logger.debug({ resourceType, id }, 'No reverse sync handler for resource type');
  }
}

/**
 * Handle Encounter events from Aidbox (e.g., hospital discharge creates encounter)
 */
async function handleEncounterEvent(
  event: string,
  fhirId: string,
  _resource: Record<string, unknown>,
): Promise<void> {
  if (event === 'create' || event === 'update') {
    // Create or update a notification for the care team
    await getPostgres().query(
      `CREATE notification SET
        type = 'condition_change',
        channel = 'in_app',
        title = 'New Clinical Encounter',
        body = $body,
        data = $data,
        read = false,
        sentAt = time::now()`,
      {
        body: `A new encounter (${fhirId}) has been recorded`,
        data: { fhirResourceType: 'Encounter', fhirId, event },
      },
    );
  }
}

/**
 * Handle Observation events from Aidbox (e.g., wearable vitals, lab results)
 */
async function handleObservationEvent(
  event: string,
  fhirId: string,
  resource: Record<string, unknown>,
): Promise<void> {
  if (event === 'create') {
    // Check if observation indicates a change in condition
    const interpretation = resource.interpretation as
      | Array<{ coding?: Array<{ code?: string }> }>
      | undefined;
    const isAbnormal = interpretation?.some((i) =>
      i.coding?.some((c) => c.code === 'A' || c.code === 'H' || c.code === 'L'),
    );

    if (isAbnormal) {
      await getPostgres().query(
        `CREATE notification SET
          type = 'condition_change',
          channel = 'push',
          title = 'Abnormal Observation',
          body = $body,
          data = $data,
          read = false,
          sentAt = time::now()`,
        {
          body: 'An abnormal clinical observation has been recorded',
          data: { fhirResourceType: 'Observation', fhirId, event },
        },
      );
    }
  }
}
