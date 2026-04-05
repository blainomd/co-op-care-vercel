/**
 * Care Journey — Per-family state machine tracking their path through CareOS
 *
 * Every family moves through stages autonomously:
 *   discovered → profiling → assessing → lmn_eligible → lmn_review
 *   → lmn_signed → active_lmn → care_matched → active_care → renewal
 *
 * Agents advance the journey by emitting events. This module tracks state
 * and enforces valid transitions.
 */
import { logger } from '../common/logger.js';
import { eventBus, type CareEvent, type CareEventType } from './event-bus.js';

// ─── Journey Stages ─────────────────────────────────────────────────────

export type JourneyStage =
  | 'discovered' // Sage first contact
  | 'profiling' // Living Profile building via Sage conversations
  | 'assessing' // CII/CRI in progress (conversational)
  | 'lmn_eligible' // Assessment complete, LMN auto-generated
  | 'lmn_review' // In Josh's review queue
  | 'lmn_signed' // Josh signed, awaiting payment
  | 'active_lmn' // LMN paid, HSA/FSA unlocked
  | 'care_matched' // Caregiver assigned (Colorado Phase 1)
  | 'active_care' // Receiving companion care
  | 'renewal'; // Approaching LMN/assessment renewal

export interface CareJourney {
  familyId: string;
  stage: JourneyStage;
  /** Profile completeness 0.0 - 1.0 */
  profileCompleteness: number;
  /** When did they enter this stage */
  stageEnteredAt: Date;
  /** Full history of stage transitions */
  history: Array<{
    from: JourneyStage;
    to: JourneyStage;
    at: Date;
    trigger: CareEventType;
  }>;
  /** Assessment data collected so far */
  assessments: {
    ciiCompleted: boolean;
    criCompleted: boolean;
    ciiScore?: number;
    ciiZone?: 'green' | 'yellow' | 'red';
    criScore?: number;
    criAcuity?: 'low' | 'moderate' | 'high' | 'critical';
  };
  /** LMN tracking */
  lmn: {
    draftId?: string;
    signedAt?: Date;
    expiresAt?: Date;
    lmnId?: string;
  };
  /** Billing tracking */
  billing: {
    lmnPaid: boolean;
    subscriptionId?: string;
    tier?: string;
  };
  /** Match tracking */
  match: {
    caregiverId?: string;
    confirmedAt?: Date;
  };
}

// ─── Valid Transitions ──────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<JourneyStage, JourneyStage[]> = {
  discovered: ['profiling'],
  profiling: ['assessing'],
  assessing: ['lmn_eligible', 'profiling'], // back to profiling if not eligible
  lmn_eligible: ['lmn_review'],
  lmn_review: ['lmn_signed', 'assessing'], // back to assessing if rejected
  lmn_signed: ['active_lmn'],
  active_lmn: ['care_matched', 'renewal'],
  care_matched: ['active_care'],
  active_care: ['renewal'],
  renewal: ['assessing'], // restart assessment cycle
};

// ─── Event → Stage Mapping ──────────────────────────────────────────────

const EVENT_STAGE_MAP: Partial<Record<CareEventType, JourneyStage>> = {
  'profile.updated': 'profiling',
  'profile.assessment_ready': 'assessing',
  'assessment.completed': 'lmn_eligible',
  'lmn.draft_created': 'lmn_review',
  'lmn.signed': 'lmn_signed',
  'billing.paid': 'active_lmn',
  'billing.subscription_created': 'active_lmn',
  'match.confirmed': 'care_matched',
  'visit.logged': 'active_care',
  'lmn.reassessment_needed': 'renewal',
  'lmn.rejected': 'assessing',
};

// ─── In-Memory Journey Store ────────────────────────────────────────────
// Phase 1: in-memory. Phase 2: PostgreSQL care_journey table.

const journeys = new Map<string, CareJourney>();

function createJourney(familyId: string): CareJourney {
  const journey: CareJourney = {
    familyId,
    stage: 'discovered',
    profileCompleteness: 0,
    stageEnteredAt: new Date(),
    history: [],
    assessments: {
      ciiCompleted: false,
      criCompleted: false,
    },
    lmn: {},
    billing: { lmnPaid: false },
    match: {},
  };
  journeys.set(familyId, journey);
  return journey;
}

export function getJourney(familyId: string): CareJourney {
  return journeys.get(familyId) ?? createJourney(familyId);
}

export function getAllJourneys(): CareJourney[] {
  return Array.from(journeys.values());
}

/**
 * Advance a family's journey to a new stage.
 * Validates the transition is allowed.
 */
export function advanceJourney(
  familyId: string,
  targetStage: JourneyStage,
  trigger: CareEventType,
): { success: boolean; journey: CareJourney; error?: string } {
  const journey = getJourney(familyId);
  const currentStage = journey.stage;

  // Already at target stage — idempotent
  if (currentStage === targetStage) {
    return { success: true, journey };
  }

  // Validate transition
  const allowed = VALID_TRANSITIONS[currentStage] ?? [];
  if (!allowed.includes(targetStage)) {
    const error = `Invalid transition: ${currentStage} → ${targetStage} (trigger: ${trigger})`;
    logger.warn({ familyId, currentStage, targetStage, trigger }, error);
    return { success: false, journey, error };
  }

  // Execute transition
  const now = new Date();
  journey.history.push({
    from: currentStage,
    to: targetStage,
    at: now,
    trigger,
  });
  journey.stage = targetStage;
  journey.stageEnteredAt = now;

  logger.info(
    { familyId, from: currentStage, to: targetStage, trigger },
    `Journey advanced: ${currentStage} → ${targetStage}`,
  );

  // Emit stage change event
  eventBus.emit({
    type: 'journey.stage_changed',
    familyId,
    source: 'care-journey',
    payload: {
      from: currentStage,
      to: targetStage,
      trigger,
    },
    timestamp: now,
  });

  return { success: true, journey };
}

/**
 * Update journey metadata without changing stage.
 */
export function updateJourneyData(
  familyId: string,
  update: Partial<
    Pick<CareJourney, 'profileCompleteness' | 'assessments' | 'lmn' | 'billing' | 'match'>
  >,
): CareJourney {
  const journey = getJourney(familyId);
  if (update.profileCompleteness !== undefined)
    journey.profileCompleteness = update.profileCompleteness;
  if (update.assessments) Object.assign(journey.assessments, update.assessments);
  if (update.lmn) Object.assign(journey.lmn, update.lmn);
  if (update.billing) Object.assign(journey.billing, update.billing);
  if (update.match) Object.assign(journey.match, update.match);
  return journey;
}

// ─── Auto-Advance Listener ─────────────────────────────────────────────
// Listens to all events and auto-advances journey when appropriate.

export function initJourneyListener(): void {
  eventBus.on('*', (event: CareEvent) => {
    const targetStage = EVENT_STAGE_MAP[event.type];
    if (!targetStage || !event.familyId) return;

    advanceJourney(event.familyId, targetStage, event.type);
  });

  logger.info('Care Journey listener initialized — auto-advancing on events');
}
