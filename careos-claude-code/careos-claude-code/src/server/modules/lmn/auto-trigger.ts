/**
 * LMN Auto-Trigger — The "automagic" engine
 *
 * Monitors assessment completions and automatically generates LMN drafts
 * when a family's clinical profile crosses the eligibility threshold.
 *
 * Flow:
 *   1. CII/CRI assessment completes → this service evaluates eligibility
 *   2. If eligible → auto-generate LMN draft via lmn-generator.ts
 *   3. Draft enters physician review queue with priority ranking
 *   4. Physician signs → family notified → HSA/FSA savings unlocked
 *
 * The family never sees a form. They just talk to Sage.
 */
import { logger } from '../../common/logger.js';
import * as queries from '../../database/queries/index.js';
import { notificationService } from '../notifications/service.js';
import {
  checkLMNEligibility,
  generateLMNDraft,
  type CareRecipientProfile,
  type CaregiverProfile,
  type CIIResult,
  type CRIResult,
  type OmahaProblem,
  type LMNDraftOutput,
} from '../sage/lmn-generator.js';

// ─── Types ───────────────────────────────────────────────────────────

export interface AssessmentCompleteEvent {
  assessmentId: string;
  assessmentType: 'cii' | 'cri' | 'promis' | 'steadi';
  userId: string;
  careRecipientId: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface AutoTriggerResult {
  triggered: boolean;
  reason: string;
  lmnDraft?: LMNDraftOutput;
  eligibility?: {
    eligible: boolean;
    score: number;
    factors: string[];
  };
}

// ─── Clinical Profile (internal, maps DB records → generator types) ──

interface ClinicalProfile {
  careRecipient: CareRecipientProfile;
  caregiver: CaregiverProfile;
  ciiResult: CIIResult;
  criResult: CRIResult;
  omahaProblems: OmahaProblem[];
}

// ─── Main Auto-Trigger Logic ─────────────────────────────────────────

/**
 * Evaluate whether a completed assessment should trigger LMN generation.
 * Called after any CII, CRI, PROMIS, or STEADI assessment completes.
 */
export async function evaluateForLMN(event: AssessmentCompleteEvent): Promise<AutoTriggerResult> {
  const { assessmentType, userId, careRecipientId } = event;

  logger.info(
    { assessmentType, userId, careRecipientId, score: event.score },
    'LMN auto-trigger: evaluating assessment',
  );

  // Step 1: Check if an active/pending LMN already exists
  try {
    const existingLMNs = await queries.listLMNsByCareRecipient(careRecipientId);
    const hasActive = existingLMNs.some(
      (l) => l.status === 'active' || l.status === 'pending_signature' || l.status === 'draft',
    );
    if (hasActive) {
      return {
        triggered: false,
        reason: 'Active or pending LMN already exists for this care recipient',
      };
    }
  } catch {
    logger.warn('LMN auto-trigger: could not check existing LMNs (demo mode?)');
  }

  // Step 2: Gather all available assessment data for this care recipient
  const profile = await gatherClinicalProfile(careRecipientId);

  // Step 3: Run eligibility check
  const eligibility = checkLMNEligibility(
    profile.criResult,
    profile.ciiResult,
    profile.omahaProblems,
  );

  if (!eligibility.eligible) {
    logger.info({ careRecipientId, reason: eligibility.reason }, 'LMN auto-trigger: not eligible');
    return {
      triggered: false,
      reason: eligibility.reason ?? 'Does not meet eligibility threshold',
      eligibility: {
        eligible: false,
        score: event.score,
        factors: [eligibility.reason],
      },
    };
  }

  // Step 4: Auto-generate LMN draft
  logger.info({ careRecipientId }, 'LMN auto-trigger: generating draft');

  try {
    const draft = generateLMNDraft(
      profile.careRecipient,
      profile.caregiver,
      profile.ciiResult,
      profile.criResult,
      profile.omahaProblems,
    );

    // Step 5: Store draft in database
    try {
      await queries.createLMN({
        careRecipientId,
        careRecipientName: profile.careRecipient.name,
        generatedBy: 'auto-trigger',
        criAssessmentId: event.assessmentId,
        criScore: profile.criResult.total,
        acuity: draft.acuity,
        diagnosisCodes: draft.diagnosisCodes,
        omahaProblems: profile.omahaProblems.map((p) => parseInt(p.code, 10) || 0),
        carePlanSummary: draft.draftText.substring(0, 500),
      });
    } catch {
      logger.warn('LMN auto-trigger: could not persist draft (demo mode?)');
    }

    // Step 6: Notify the family
    try {
      await notificationService.send({
        userId,
        type: 'lmn_expiry',
        variables: {
          careRecipientName: profile.careRecipient.name,
          daysRemaining: 'LMN Ready for Review',
        },
      });
    } catch {
      logger.warn('LMN auto-trigger: notification failed (non-critical)');
    }

    logger.info(
      {
        careRecipientId,
        acuity: draft.acuity,
        tier: draft.recommendedTier,
        hsaSavings: draft.estimatedHsaSavings,
        priority: draft.reviewPriority,
      },
      'LMN auto-trigger: draft generated successfully',
    );

    return {
      triggered: true,
      reason: 'Assessment scores meet LMN eligibility — draft auto-generated',
      lmnDraft: draft,
      eligibility: {
        eligible: true,
        score: event.score,
        factors: [eligibility.reason],
      },
    };
  } catch (err) {
    logger.error({ err, careRecipientId }, 'LMN auto-trigger: draft generation failed');
    return {
      triggered: false,
      reason: `Draft generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

// ─── Clinical Profile Aggregation ────────────────────────────────────

/**
 * Gather all assessment data for a care recipient.
 * In production, this pulls from PostgreSQL. In demo mode, returns defaults.
 */
async function gatherClinicalProfile(careRecipientId: string): Promise<ClinicalProfile> {
  const defaultProfile: ClinicalProfile = {
    careRecipient: {
      id: careRecipientId,
      name: 'Unknown',
      dateOfBirth: '1940-01-01',
      age: 85,
      conditions: [],
      medications: [],
      mobilityLevel: 'assisted',
      riskFlags: [],
      state: 'CO',
    },
    caregiver: {
      id: 'unknown',
      name: 'Family Caregiver',
      relationship: 'family',
      email: '',
    },
    ciiResult: {
      physical: 0,
      sleep: 0,
      isolation: 0,
      total: 0,
      zone: 'green',
      completedAt: new Date().toISOString(),
    },
    criResult: {
      mobility: 0,
      memory: 0,
      dailyTasks: 0,
      medications: 0,
      social: 0,
      total: 0,
      zone: 'green',
      omahaFlags: [],
      completedAt: new Date().toISOString(),
    },
    omahaProblems: [],
  };

  try {
    const assessments = await queries.listAssessmentsByCareRecipient(careRecipientId);

    const cii = assessments.find((a) => a.type === 'cii');
    const cri = assessments.find((a) => a.type === 'cri');

    const ciiTotal = cii?.totalScore ?? 0;
    const criTotal = cri?.totalScore ?? 0;
    const scores = cri?.scores ?? [];

    return {
      careRecipient: {
        ...defaultProfile.careRecipient,
        name: cri?.careRecipientId ?? 'Unknown',
      },
      caregiver: defaultProfile.caregiver,
      ciiResult: {
        physical: cii?.scores?.[0] ?? 0,
        sleep: cii?.scores?.[1] ?? 0,
        isolation: cii?.scores?.[2] ?? 0,
        total: ciiTotal,
        zone: ciiTotal >= 21 ? 'red' : ciiTotal >= 14 ? 'yellow' : 'green',
        completedAt: cii?.completedAt ?? new Date().toISOString(),
      },
      criResult: {
        mobility: scores[0] ?? 0,
        memory: scores[1] ?? 0,
        dailyTasks: scores[2] ?? 0,
        medications: scores[3] ?? 0,
        social: scores[4] ?? 0,
        total: criTotal,
        zone: criTotal >= 33 ? 'red' : criTotal >= 19 ? 'yellow' : 'green',
        omahaFlags: [],
        completedAt: cri?.completedAt ?? new Date().toISOString(),
      },
      omahaProblems: [],
    };
  } catch {
    logger.warn('LMN auto-trigger: could not load assessments (demo mode?)');
    return defaultProfile;
  }
}

// ─── Batch Processing ────────────────────────────────────────────────

/**
 * Scan all recent assessments and trigger LMN generation where eligible.
 * Run as a daily job.
 */
export async function runAutoTriggerScan(): Promise<{ scanned: number; triggered: number }> {
  logger.info('LMN auto-trigger scan: starting');
  let scanned = 0;
  let triggered = 0;

  try {
    const recentAssessments = await queries.listRecentAssessments(24);

    for (const assessment of recentAssessments) {
      scanned++;
      const result = await evaluateForLMN({
        assessmentId: assessment.id,
        assessmentType: assessment.type as 'cii' | 'cri',
        userId: assessment.assessorId ?? 'system',
        careRecipientId: assessment.careRecipientId ?? '',
        score: assessment.totalScore,
      });
      if (result.triggered) triggered++;
    }
  } catch (err) {
    logger.error({ err }, 'LMN auto-trigger scan: failed');
  }

  logger.info({ scanned, triggered }, 'LMN auto-trigger scan: complete');
  return { scanned, triggered };
}
