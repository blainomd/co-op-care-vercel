/**
 * CareOS Event Bus — The nervous system of the agentic architecture
 *
 * In-process EventEmitter backed by PostgreSQL outbox for durability.
 * Events flow between agents without agents knowing about each other.
 *
 * Why EventEmitter + outbox (not just one):
 * - EventEmitter: fast, in-process, real-time agent coordination
 * - Outbox: durable, survives restarts, enables replay and audit
 */
import { EventEmitter } from 'events';
import { logger } from '../common/logger.js';
import * as queries from '../database/queries/index.js';

// ─── Event Types ────────────────────────────────────────────────────────

export type CareEventType =
  // Sage / Profile events
  | 'profile.updated'
  | 'profile.assessment_ready'
  | 'intent.detected'
  | 'omaha.problem.found'
  // Assessment events
  | 'assessment.started'
  | 'assessment.completed'
  | 'assessment.cii_completed'
  | 'assessment.cri_completed'
  // LMN events
  | 'lmn.eligible'
  | 'lmn.draft_created'
  | 'lmn.review_assigned'
  | 'lmn.signed'
  | 'lmn.rejected'
  | 'lmn.expired'
  | 'lmn.reassessment_needed'
  // Billing events
  | 'billing.invoice_created'
  | 'billing.paid'
  | 'billing.failed'
  | 'billing.subscription_created'
  | 'billing.subscription_cancelled'
  // Care matching events
  | 'match.proposed'
  | 'match.confirmed'
  | 'match.rejected'
  // Visit / outcome events
  | 'visit.logged'
  | 'visit.documented'
  | 'outcome.trajectory_update'
  | 'outcome.kbs_changed'
  // Journey events
  | 'journey.stage_changed'
  // Synthesis events
  | 'synthesis.insights'
  | 'synthesis.config_updated'
  // Connector events
  | 'clinicalswipe.review_needed'
  | 'caregoals.profile_created'
  | 'billing.pin_g0019'
  | 'comfortcard.activated'
  | 'access.outcome_captured';

export interface CareEvent {
  id?: string;
  type: CareEventType;
  familyId: string;
  payload: Record<string, unknown>;
  source: string; // which agent emitted this
  timestamp: Date;
}

// ─── Event Bus ──────────────────────────────────────────────────────────

class CareEventBus {
  private emitter = new EventEmitter();
  private persistEvents = true;

  constructor() {
    // Allow many listeners (one per agent per event type)
    this.emitter.setMaxListeners(50);
  }

  /**
   * Emit an event to all subscribed agents.
   * Persists to outbox for durability and audit trail.
   */
  async emit(event: CareEvent): Promise<void> {
    const eventWithTimestamp = {
      ...event,
      timestamp: event.timestamp ?? new Date(),
    };

    logger.info(
      {
        eventType: event.type,
        familyId: event.familyId,
        source: event.source,
      },
      `Event emitted: ${event.type}`,
    );

    // Persist to outbox (fire-and-forget for speed, log errors)
    if (this.persistEvents) {
      queries
        .createOutboxEvent({
          eventType: event.type,
          resourceType: 'CareEvent',
          resourceId: event.familyId,
          payload: {
            ...event.payload,
            source: event.source,
            familyId: event.familyId,
          },
        })
        .catch((err) => {
          logger.warn({ err, eventType: event.type }, 'Failed to persist event to outbox');
        });
    }

    // Dispatch to in-process listeners
    this.emitter.emit(event.type, eventWithTimestamp);

    // Also emit wildcard for synthesis agent
    this.emitter.emit('*', eventWithTimestamp);
  }

  /**
   * Subscribe to a specific event type.
   */
  on(eventType: CareEventType | '*', handler: (event: CareEvent) => void | Promise<void>): void {
    this.emitter.on(eventType, async (event: CareEvent) => {
      try {
        await handler(event);
      } catch (err) {
        logger.error(
          { err, eventType, source: event?.source, familyId: event?.familyId },
          `Agent error handling event: ${eventType}`,
        );
      }
    });
  }

  /**
   * Disable persistence (for testing).
   */
  disablePersistence(): void {
    this.persistEvents = false;
  }

  /**
   * Get listener count for debugging.
   */
  listenerCount(eventType: string): number {
    return this.emitter.listenerCount(eventType);
  }
}

// Singleton
export const eventBus = new CareEventBus();
