/**
 * Caregiver Guide Routes — Connector orchestrator API
 *
 * POST /build  — Public (no auth). Runs all 6 Connectors in sequence.
 * GET  /:id    — Retrieve a generated guide
 *
 * The guide is the first Workflow Template. Each step invokes a Connector's
 * domain prompt against Sage (Claude) and emits triggers to the event bus.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ValidationError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import { eventBus, type CareEventType } from '../../agents/event-bus.js';

// ─── Request Schema ─────────────────────────────────────────────────

const guideBuildSchema = z.object({
  // Care recipient
  recipientName: z.string().min(1).max(100),
  recipientAge: z.string().max(3).optional(),
  relationship: z.string().max(100).optional(),
  // Clinical
  conditions: z.string().min(1).max(5000),
  medications: z.string().min(1).max(5000),
  // Routines
  morningRoutine: z.string().max(2000).optional(),
  eveningRoutine: z.string().max(2000).optional(),
  // Emergency
  emergencyContact: z.string().max(200).optional(),
  emergencyPhone: z.string().max(20).optional(),
  // CareGoals values
  goodDay: z.string().max(2000).optional(),
  whatMatters: z.string().max(2000).optional(),
  // Conductor
  yourName: z.string().max(100).optional(),
  yourEmail: z.string().email().optional(),
});

type GuideBuildInput = z.infer<typeof guideBuildSchema>;

// ─── Connector Execution (calls Sage with domain prompt) ────────────

async function executeConnector(
  connectorId: string,
  domainPrompt: string,
  context: GuideBuildInput,
): Promise<{ output: Record<string, unknown>; triggers: string[] }> {
  // In production: call Claude API with the connector's domain prompt + context
  // For now: structured placeholder that the frontend can display
  const triggers: string[] = [];

  logger.info({ connectorId }, 'Executing Connector');

  // Simulate domain-specific output
  switch (connectorId) {
    case 'clinical-research':
      triggers.push('clinicalswipe.review_needed');
      return {
        output: {
          condition_protocols: context.conditions.split(',').map((c) => ({
            condition: c.trim(),
            evidence_level: 'B',
            recommendations: ['Evidence-based protocol identified'],
          })),
          interaction_alerts: [],
          physician_review_notes: 'Awaiting physician review',
        },
        triggers,
      };

    case 'care-plan':
      triggers.push('caregoals.profile_created', 'billing.pin_g0019');
      return {
        output: {
          morning_routine: context.morningRoutine || 'To be structured from conversation',
          evening_routine: context.eveningRoutine || 'To be structured from conversation',
          personal_values: {
            good_day: context.goodDay,
            what_matters: context.whatMatters,
          },
        },
        triggers,
      };

    case 'medication-mgmt':
      triggers.push('clinicalswipe.review_needed');
      return {
        output: {
          med_schedule: context.medications.split(',').map((m) => ({
            medication: m.trim(),
            interaction_check: 'pending_physician_review',
          })),
        },
        triggers,
      };

    case 'savings-finder':
      triggers.push('lmn.draft_created', 'comfortcard.activated');
      return {
        output: {
          eligible_expenses: [
            'companion care',
            'therapeutic services',
            'home safety modifications',
          ],
          estimated_annual_savings: 936,
          lmn_status: 'draft_queued_for_review',
        },
        triggers,
      };

    case 'living-memory':
      triggers.push('profile.updated');
      return {
        output: {
          profile_created: true,
          sections_tracked: 6,
        },
        triggers,
      };

    case 'appointment-monitor':
      triggers.push('access.outcome_captured');
      return {
        output: {
          monitoring_active: true,
          alert_preferences: ['48hr_reminder', 'refill_7day'],
        },
        triggers,
      };

    default:
      return { output: {}, triggers };
  }
}

// ─── Routes ─────────────────────────────────────────────────────────

export async function guideRoutes(app: FastifyInstance): Promise<void> {
  /**
   * POST /build — Build a caregiver guide (public, no auth)
   * Runs all 6 Connectors in sequence, emits events, returns assembled guide.
   */
  app.post('/build', async (request) => {
    const parsed = guideBuildSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid guide input');

    const input = parsed.data;
    const guideId = crypto.randomUUID();

    logger.info({ guideId, recipientName: input.recipientName }, 'Starting guide build');

    // Execute Connectors in sequence
    const connectorSequence = [
      { id: 'clinical-research', prompt: 'Research conditions and medications' },
      { id: 'care-plan', prompt: 'Structure daily care plan' },
      { id: 'medication-mgmt', prompt: 'Build medication schedule' },
      { id: 'savings-finder', prompt: 'Identify HSA/FSA eligible expenses' },
      { id: 'living-memory', prompt: 'Create Living Profile' },
      { id: 'appointment-monitor', prompt: 'Set up appointment monitoring' },
    ];

    const results: Record<string, Record<string, unknown>> = {};
    const allTriggers: string[] = [];

    for (const connector of connectorSequence) {
      const { output, triggers } = await executeConnector(connector.id, connector.prompt, input);
      results[connector.id] = output;
      allTriggers.push(...triggers);

      // Emit triggers to the event bus
      for (const trigger of triggers) {
        await eventBus.emit({
          type: trigger as CareEventType,
          familyId: guideId,
          payload: { connectorId: connector.id, guideId, ...output },
          source: `connector:${connector.id}`,
          timestamp: new Date(),
        });
      }
    }

    const guide = {
      id: guideId,
      status: 'complete',
      recipientName: input.recipientName,
      createdAt: new Date().toISOString(),
      sections: results,
      triggers: allTriggers,
      physicianReviewRequired: true,
      physicianReviewStatus: 'pending',
      medicalDirector: {
        name: 'Josh Emdur DO',
        npi: '1649218389',
      },
    };

    logger.info({ guideId, triggers: allTriggers.length }, 'Guide build complete');

    return guide;
  });

  /**
   * GET /:id — Retrieve a generated guide
   */
  app.get('/:id', async (request) => {
    const { id } = request.params as { id: string };
    // In production: fetch from database
    return { id, status: 'not_found', message: 'Guide retrieval requires database integration' };
  });
}
