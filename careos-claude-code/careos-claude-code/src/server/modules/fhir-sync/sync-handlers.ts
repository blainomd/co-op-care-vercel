/**
 * FHIR Sync Handlers — Transform PostgreSQL entities to FHIR R4 resources
 *
 * Each handler maps a CareOS entity to the corresponding FHIR resource
 * and calls the Aidbox client for create/update/delete.
 */
import { aidboxClient } from '../../database/aidbox.js';
import { logger } from '../../common/logger.js';
import type { OutboxEvent, OutboxEventAction, FhirResourceType } from './outbox.js';

/**
 * FHIR resource envelope — minimal typing for outbound resources
 */
interface FhirResource {
  resourceType: string;
  id?: string;
  [key: string]: unknown;
}

/**
 * Handler result
 */
export interface SyncResult {
  success: boolean;
  fhirId?: string;
  error?: string;
}

/**
 * Transform and sync an Encounter to Aidbox
 * Maps from: timebank task completion → FHIR Encounter
 */
async function syncEncounter(
  action: OutboxEventAction,
  payload: Record<string, unknown>,
): Promise<SyncResult> {
  const resource: FhirResource = {
    resourceType: 'Encounter',
    status: (payload.status as string) ?? 'finished',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'HH', // Home Health
      display: 'home health',
    },
    subject: payload.patientRef ? { reference: `Patient/${payload.patientRef}` } : undefined,
    participant: payload.caregiverId
      ? [{ individual: { reference: `Practitioner/${payload.caregiverId}` } }]
      : [],
    period: {
      start: payload.startTime,
      end: payload.endTime,
    },
    type: payload.encounterType
      ? [{ coding: [{ system: 'http://co-op.care/encounter-type', code: payload.encounterType }] }]
      : [],
    reasonCode: payload.omahaProblemCode
      ? [
          {
            coding: [{ system: 'http://co-op.care/omaha', code: String(payload.omahaProblemCode) }],
          },
        ]
      : [],
  };

  return syncResource('Encounter', action, payload.fhirId as string | undefined, resource);
}

/**
 * Transform and sync an Observation to Aidbox
 * Maps from: KBS outcomes, vitals → FHIR Observation
 */
async function syncObservation(
  action: OutboxEventAction,
  payload: Record<string, unknown>,
): Promise<SyncResult> {
  const resource: FhirResource = {
    resourceType: 'Observation',
    status: 'final',
    code: {
      coding: [
        {
          system: (payload.codeSystem as string) ?? 'http://loinc.org',
          code: payload.code as string,
          display: payload.codeDisplay as string,
        },
      ],
    },
    subject: payload.patientRef ? { reference: `Patient/${payload.patientRef}` } : undefined,
    effectiveDateTime: payload.effectiveDateTime ?? new Date().toISOString(),
    valueQuantity:
      payload.value !== undefined
        ? {
            value: payload.value as number,
            unit: payload.unit as string,
            system: 'http://unitsofmeasure.org',
            code: payload.unitCode as string,
          }
        : undefined,
    valueInteger: payload.valueInteger as number | undefined,
    interpretation: payload.interpretation
      ? [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                code: payload.interpretation as string,
              },
            ],
          },
        ]
      : undefined,
  };

  return syncResource('Observation', action, payload.fhirId as string | undefined, resource);
}

/**
 * Transform and sync a QuestionnaireResponse to Aidbox
 * Maps from: CII/CRI assessments → FHIR QuestionnaireResponse
 */
async function syncQuestionnaireResponse(
  action: OutboxEventAction,
  payload: Record<string, unknown>,
): Promise<SyncResult> {
  const resource: FhirResource = {
    resourceType: 'QuestionnaireResponse',
    status: 'completed',
    questionnaire: payload.questionnaireRef as string,
    subject: payload.patientRef ? { reference: `Patient/${payload.patientRef}` } : undefined,
    authored: payload.completedAt ?? new Date().toISOString(),
    author: payload.authorRef ? { reference: payload.authorRef as string } : undefined,
    item: (payload.items as unknown[]) ?? [],
  };

  return syncResource(
    'QuestionnaireResponse',
    action,
    payload.fhirId as string | undefined,
    resource,
  );
}

/**
 * Transform and sync a Patient to Aidbox
 * Maps from: CareRecipient → FHIR Patient
 */
async function syncPatient(
  action: OutboxEventAction,
  payload: Record<string, unknown>,
): Promise<SyncResult> {
  const resource: FhirResource = {
    resourceType: 'Patient',
    name:
      payload.firstName || payload.lastName
        ? [
            {
              given: payload.firstName ? [payload.firstName as string] : [],
              family: payload.lastName as string,
            },
          ]
        : [],
    birthDate: payload.dateOfBirth as string | undefined,
    gender: payload.gender as string | undefined,
    identifier: payload.pgId
      ? [{ system: 'http://co-op.care/pg-id', value: payload.pgId as string }]
      : [],
  };

  return syncResource('Patient', action, payload.fhirId as string | undefined, resource);
}

/**
 * Transform and sync a Consent to Aidbox
 * Maps from: AdvanceDirective → FHIR Consent
 */
async function syncConsent(
  action: OutboxEventAction,
  payload: Record<string, unknown>,
): Promise<SyncResult> {
  const resource: FhirResource = {
    resourceType: 'Consent',
    status: (payload.status as string) ?? 'active',
    scope: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/consentscope',
          code: 'adr',
        },
      ],
    },
    category: [
      {
        coding: [
          {
            system: 'http://loinc.org',
            code: '75320-2',
            display: 'Advance directive',
          },
        ],
      },
    ],
    patient: payload.patientRef ? { reference: `Patient/${payload.patientRef}` } : undefined,
    dateTime: payload.witnessedDate as string | undefined,
    sourceAttachment: payload.documentUrl ? { url: payload.documentUrl as string } : undefined,
    provision: payload.proxyName
      ? {
          actor: [
            {
              role: {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
                    code: 'HPOWATT',
                    display: 'Healthcare Power of Attorney',
                  },
                ],
              },
              reference: {
                display: payload.proxyName as string,
              },
            },
          ],
        }
      : undefined,
  };

  return syncResource('Consent', action, payload.fhirId as string | undefined, resource);
}

/**
 * Transform and sync a Goal to Aidbox
 * Maps from: GoalOfCare → FHIR Goal
 */
async function syncGoal(
  action: OutboxEventAction,
  payload: Record<string, unknown>,
): Promise<SyncResult> {
  const resource: FhirResource = {
    resourceType: 'Goal',
    lifecycleStatus: 'active',
    category: [
      {
        coding: [
          {
            system: 'http://co-op.care/goal-category',
            code: payload.category as string,
          },
        ],
      },
    ],
    priority: payload.priority
      ? {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/goal-priority',
              code: payload.priority as string,
            },
          ],
        }
      : undefined,
    description: {
      text: payload.description as string,
    },
    subject: payload.patientRef ? { reference: `Patient/${payload.patientRef}` } : undefined,
    startDate: payload.startDate as string | undefined,
    target: payload.reviewDate ? [{ dueDate: payload.reviewDate as string }] : [],
  };

  return syncResource('Goal', action, payload.fhirId as string | undefined, resource);
}

/**
 * Transform and sync a Communication to Aidbox
 * Maps from: FamilyConversation → FHIR Communication
 */
async function syncCommunication(
  action: OutboxEventAction,
  payload: Record<string, unknown>,
): Promise<SyncResult> {
  const resource: FhirResource = {
    resourceType: 'Communication',
    status: 'completed',
    category: [
      {
        coding: [
          {
            system: 'http://co-op.care/communication-type',
            code: 'family-meeting',
          },
        ],
      },
    ],
    subject: payload.patientRef ? { reference: `Patient/${payload.patientRef}` } : undefined,
    sent: payload.date as string | undefined,
    payload: [
      {
        contentString: JSON.stringify({
          topics: payload.topics,
          keyDecisions: payload.keyDecisions,
          nextSteps: payload.nextSteps,
        }),
      },
    ],
  };

  return syncResource('Communication', action, payload.fhirId as string | undefined, resource);
}

/**
 * Generic FHIR resource sync — create/update/delete via Aidbox client
 */
async function syncResource(
  resourceType: string,
  action: OutboxEventAction,
  existingFhirId: string | undefined,
  resource: FhirResource,
): Promise<SyncResult> {
  try {
    switch (action) {
      case 'create': {
        const result = await aidboxClient.create<FhirResource>(resourceType, resource);
        return { success: true, fhirId: result.id };
      }
      case 'update': {
        if (!existingFhirId) {
          return { success: false, error: `Cannot update ${resourceType} without fhirId` };
        }
        const result = await aidboxClient.update<FhirResource>(
          resourceType,
          existingFhirId,
          resource,
        );
        return { success: true, fhirId: result.id };
      }
      case 'delete': {
        if (!existingFhirId) {
          return { success: false, error: `Cannot delete ${resourceType} without fhirId` };
        }
        await aidboxClient.delete(resourceType, existingFhirId);
        return { success: true, fhirId: existingFhirId };
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error';
    logger.error({ resourceType, action, error: message }, 'FHIR sync failed');
    return { success: false, error: message };
  }
}

/**
 * Handler registry — maps FHIR resource types to sync functions
 */
const handlers: Record<
  FhirResourceType,
  (action: OutboxEventAction, payload: Record<string, unknown>) => Promise<SyncResult>
> = {
  Patient: syncPatient,
  Encounter: syncEncounter,
  Observation: syncObservation,
  QuestionnaireResponse: syncQuestionnaireResponse,
  CarePlan: async (action, payload) =>
    syncResource('CarePlan', action, payload.fhirId as string | undefined, {
      resourceType: 'CarePlan',
      ...payload,
    }),
  CareTeam: async (action, payload) =>
    syncResource('CareTeam', action, payload.fhirId as string | undefined, {
      resourceType: 'CareTeam',
      ...payload,
    }),
  DocumentReference: async (action, payload) =>
    syncResource('DocumentReference', action, payload.fhirId as string | undefined, {
      resourceType: 'DocumentReference',
      status: 'current',
      type: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '11503-0',
            display: 'Medical records',
          },
        ],
        text: 'Letter of Medical Necessity',
      },
      subject: payload.careRecipientId
        ? { reference: `Patient/${payload.careRecipientId}` }
        : undefined,
      date: payload.issuedAt ?? new Date().toISOString(),
      author: payload.signedBy ? [{ reference: `Practitioner/${payload.signedBy}` }] : [],
      description: `LMN — CRI ${payload.criScore} (${payload.acuity})`,
      context: {
        period: {
          start: payload.issuedAt,
          end: payload.expiresAt,
        },
      },
    }),
  Procedure: async (action, payload) =>
    syncResource('Procedure', action, payload.fhirId as string | undefined, {
      resourceType: 'Procedure',
      ...payload,
    }),
  Consent: syncConsent,
  Goal: syncGoal,
  Communication: syncCommunication,
};

/**
 * Dispatch an outbox event to the appropriate handler
 */
export async function dispatchSync(event: OutboxEvent): Promise<SyncResult> {
  const handler = handlers[event.resourceType];
  if (!handler) {
    return { success: false, error: `No handler for resource type: ${event.resourceType}` };
  }
  return handler(event.action, event.payload);
}
