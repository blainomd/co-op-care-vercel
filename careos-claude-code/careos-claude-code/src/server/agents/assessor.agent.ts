/**
 * Assessor Agent — Autonomous conversational assessment via Sage
 *
 * Instead of "click Start CII", Sage weaves assessment questions into
 * natural conversation. The Assessor Agent:
 *
 * 1. Hears profile.assessment_ready
 * 2. Injects CII questions into Sage's next conversation turn
 * 3. Collects responses, scores CII
 * 4. Then injects CRI questions
 * 5. Scores CRI
 * 6. Emits assessment.completed with both results
 *
 * The family never knows they're being "assessed" — it feels like
 * a caring conversation that naturally gets more specific.
 */
import { BaseAgent } from './base-agent.js';
import { updateJourneyData } from './care-journey.js';
import { logger } from '../common/logger.js';
import { eventBus, type CareEvent } from './event-bus.js';

// ─── Assessment State ───────────────────────────────────────────────────

export type AssessmentPhase =
  | 'idle'
  | 'cii_pending'
  | 'cii_collecting'
  | 'cri_pending'
  | 'cri_collecting'
  | 'complete';

interface AssessmentState {
  familyId: string;
  phase: AssessmentPhase;
  cii: {
    physical?: number;
    sleep?: number;
    isolation?: number;
  };
  cri: {
    mobility?: number;
    memory?: number;
    dailyTasks?: number;
    medications?: number;
    social?: number;
  };
  questionsAsked: string[];
  startedAt: Date;
}

// In-memory assessment states
const assessments = new Map<string, AssessmentState>();

export function getAssessmentState(familyId: string): AssessmentState | undefined {
  return assessments.get(familyId);
}

/**
 * Get the next question Sage should weave into conversation.
 * Returns null if no assessment is pending.
 * Sage calls this before generating each response.
 */
export function getNextAssessmentQuestion(familyId: string): {
  question: string;
  domain: string;
  scale: string;
} | null {
  const state = assessments.get(familyId);
  if (!state) return null;

  // CII questions (caregiver burnout)
  if (state.phase === 'cii_pending' || state.phase === 'cii_collecting') {
    if (state.cii.physical === undefined) {
      return {
        question:
          'How has your body been holding up? On a scale of 1-10, how would you rate your physical exhaustion this past week?',
        domain: 'cii_physical',
        scale: '1-10',
      };
    }
    if (state.cii.sleep === undefined) {
      return {
        question:
          'And sleep — how has that been? 1-10, how much is caregiving affecting your sleep?',
        domain: 'cii_sleep',
        scale: '1-10',
      };
    }
    if (state.cii.isolation === undefined) {
      return {
        question:
          'One more — how connected do you feel to friends and your own life outside of caregiving? 1-10, with 10 being very isolated.',
        domain: 'cii_isolation',
        scale: '1-10',
      };
    }
  }

  // CRI questions (care recipient acuity)
  if (state.phase === 'cri_pending' || state.phase === 'cri_collecting') {
    if (state.cri.mobility === undefined) {
      return {
        question:
          'Now let me ask about your loved one. How is their mobility? 1-10, with 10 being completely unable to move independently.',
        domain: 'cri_mobility',
        scale: '1-10',
      };
    }
    if (state.cri.memory === undefined) {
      return {
        question: 'How about memory and thinking? 1-10, with 10 being severe cognitive impairment.',
        domain: 'cri_memory',
        scale: '1-10',
      };
    }
    if (state.cri.dailyTasks === undefined) {
      return {
        question: 'Daily tasks like bathing, dressing, eating — how much help do they need? 1-10.',
        domain: 'cri_dailyTasks',
        scale: '1-10',
      };
    }
    if (state.cri.medications === undefined) {
      return {
        question:
          'Medications — can they manage their own meds, or does someone need to help? 1-10.',
        domain: 'cri_medications',
        scale: '1-10',
      };
    }
    if (state.cri.social === undefined) {
      return {
        question:
          'Last one — social engagement. How withdrawn or isolated is your loved one? 1-10.',
        domain: 'cri_social',
        scale: '1-10',
      };
    }
  }

  return null;
}

/**
 * Record an assessment response from a Sage conversation.
 * Sage extracts the numeric response and calls this.
 */
export function recordAssessmentResponse(
  familyId: string,
  domain: string,
  value: number,
): { complete: boolean; phase: AssessmentPhase } {
  const state = assessments.get(familyId);
  if (!state) return { complete: false, phase: 'idle' };

  // Clamp to 1-10
  const clamped = Math.max(1, Math.min(10, Math.round(value)));

  // Record the value
  switch (domain) {
    case 'cii_physical':
      state.cii.physical = clamped;
      break;
    case 'cii_sleep':
      state.cii.sleep = clamped;
      break;
    case 'cii_isolation':
      state.cii.isolation = clamped;
      break;
    case 'cri_mobility':
      state.cri.mobility = clamped;
      break;
    case 'cri_memory':
      state.cri.memory = clamped;
      break;
    case 'cri_dailyTasks':
      state.cri.dailyTasks = clamped;
      break;
    case 'cri_medications':
      state.cri.medications = clamped;
      break;
    case 'cri_social':
      state.cri.social = clamped;
      break;
  }

  state.questionsAsked.push(domain);

  // Check if CII is complete → advance to CRI
  if (
    state.phase === 'cii_collecting' &&
    state.cii.physical !== undefined &&
    state.cii.sleep !== undefined &&
    state.cii.isolation !== undefined
  ) {
    state.phase = 'cri_pending';
    logger.info({ familyId, cii: state.cii }, 'CII assessment complete, starting CRI');
  }

  // Update phase from pending to collecting
  if (state.phase === 'cii_pending') state.phase = 'cii_collecting';
  if (state.phase === 'cri_pending') state.phase = 'cri_collecting';

  // Check if CRI is complete → full assessment done
  if (
    state.phase === 'cri_collecting' &&
    state.cri.mobility !== undefined &&
    state.cri.memory !== undefined &&
    state.cri.dailyTasks !== undefined &&
    state.cri.medications !== undefined &&
    state.cri.social !== undefined
  ) {
    state.phase = 'complete';
    logger.info({ familyId, cii: state.cii, cri: state.cri }, 'Full assessment complete');
  }

  return { complete: state.phase === 'complete', phase: state.phase };
}

// ─── Agent ──────────────────────────────────────────────────────────────

export class AssessorAgent extends BaseAgent {
  constructor() {
    super({
      name: 'assessor',
      description: 'Autonomous conversational CII/CRI assessment via Sage',
      subscribesTo: ['profile.assessment_ready'],
      enabled: true,
    });
  }

  protected async handle(event: CareEvent): Promise<void> {
    const { familyId } = event;

    // Don't re-assess if already in progress or complete
    if (assessments.has(familyId)) {
      const existing = assessments.get(familyId)!;
      if (existing.phase !== 'idle') {
        logger.info({ familyId, phase: existing.phase }, 'Assessment already in progress');
        return;
      }
    }

    // Initialize assessment state — CII first
    const state: AssessmentState = {
      familyId,
      phase: 'cii_pending',
      cii: {},
      cri: {},
      questionsAsked: [],
      startedAt: new Date(),
    };
    assessments.set(familyId, state);

    logger.info(
      { familyId },
      'Assessment initiated — CII questions will be woven into next Sage conversation',
    );

    await this.emit('assessment.started', familyId, {
      phase: 'cii_pending',
      startedAt: state.startedAt.toISOString(),
    });
  }
}

/**
 * Called by the Assessor Agent listener when assessment is complete.
 * Calculates scores and emits assessment.completed.
 */
export async function finalizeAssessment(familyId: string): Promise<void> {
  const state = assessments.get(familyId);
  if (!state || state.phase !== 'complete') return;

  const ciiTotal = (state.cii.physical ?? 0) + (state.cii.sleep ?? 0) + (state.cii.isolation ?? 0);
  const ciiZone: 'green' | 'yellow' | 'red' =
    ciiTotal >= 21 ? 'red' : ciiTotal >= 13 ? 'yellow' : 'green';

  const criTotal =
    (state.cri.mobility ?? 0) +
    (state.cri.memory ?? 0) +
    (state.cri.dailyTasks ?? 0) +
    (state.cri.medications ?? 0) +
    (state.cri.social ?? 0);

  const criAcuity: 'low' | 'moderate' | 'high' | 'critical' =
    criTotal >= 40 ? 'critical' : criTotal >= 33 ? 'high' : criTotal >= 19 ? 'moderate' : 'low';

  // Update journey with assessment results
  updateJourneyData(familyId, {
    assessments: {
      ciiCompleted: true,
      criCompleted: true,
      ciiScore: ciiTotal,
      ciiZone,
      criScore: criTotal,
      criAcuity,
    },
  });

  // Emit both individual and combined completion events
  await eventBus.emit({
    type: 'assessment.completed',
    familyId,
    source: 'assessor',
    payload: {
      cii: {
        physical: state.cii.physical,
        sleep: state.cii.sleep,
        isolation: state.cii.isolation,
        total: ciiTotal,
        zone: ciiZone,
      },
      cri: {
        mobility: state.cri.mobility,
        memory: state.cri.memory,
        dailyTasks: state.cri.dailyTasks,
        medications: state.cri.medications,
        social: state.cri.social,
        total: criTotal,
        acuity: criAcuity,
      },
      durationMs: Date.now() - state.startedAt.getTime(),
    },
    timestamp: new Date(),
  });

  logger.info(
    { familyId, ciiTotal, ciiZone, criTotal, criAcuity },
    'Assessment finalized and emitted',
  );
}
