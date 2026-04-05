/**
 * LMN Trigger Agent — Auto-generates LMN drafts when assessments complete
 *
 * The revenue engine's autonomous trigger. When assessment.completed fires:
 * 1. Check eligibility via checkLMNEligibility()
 * 2. Build Omaha problems from conversation + assessment data
 * 3. Generate draft via generateLMNDraft()
 * 4. Emit lmn.draft_created → Review Router picks it up
 *
 * Zero human intervention. Family talked to Sage, assessment happened
 * conversationally, and now an LMN draft is in Josh's queue.
 */
import { BaseAgent } from './base-agent.js';
import { updateJourneyData, advanceJourney } from './care-journey.js';
import { getProfile } from './profile-builder.agent.js';
import {
  generateLMNDraft,
  checkLMNEligibility,
  type CareRecipientProfile,
  type CaregiverProfile,
  type CIIResult,
  type CRIResult,
  type OmahaProblem,
} from '../modules/sage/lmn-generator.js';
import { logger } from '../common/logger.js';
import type { CareEvent } from './event-bus.js';

// ─── Omaha Problem Inference ────────────────────────────────────────────

/**
 * Infer Omaha problems from assessment scores.
 * The LMN generator also does Omaha mapping, but this builds the initial
 * problem list from CRI subscale scores.
 */
function inferOmahaProblems(cri: {
  mobility?: number;
  memory?: number;
  dailyTasks?: number;
  medications?: number;
  social?: number;
}): OmahaProblem[] {
  const problems: OmahaProblem[] = [];

  if ((cri.mobility ?? 0) >= 5) {
    problems.push({
      code: 'H18',
      name: 'Neuro-musculo-skeletal function',
      domain: 'Physiological',
      kbs: Math.max(1, 6 - Math.floor((cri.mobility ?? 0) / 2)),
      source: 'cri',
    });
  }

  if ((cri.memory ?? 0) >= 5) {
    problems.push({
      code: 'H27',
      name: 'Cognition',
      domain: 'Physiological',
      kbs: Math.max(1, 6 - Math.floor((cri.memory ?? 0) / 2)),
      source: 'cri',
    });
  }

  if ((cri.dailyTasks ?? 0) >= 5) {
    problems.push({
      code: 'B36',
      name: 'Physical activity',
      domain: 'Health-related Behaviors',
      kbs: Math.max(1, 6 - Math.floor((cri.dailyTasks ?? 0) / 2)),
      source: 'cri',
    });
  }

  if ((cri.medications ?? 0) >= 5) {
    problems.push({
      code: 'B40',
      name: 'Prescribed medication regimen',
      domain: 'Health-related Behaviors',
      kbs: Math.max(1, 6 - Math.floor((cri.medications ?? 0) / 2)),
      source: 'cri',
    });
  }

  if ((cri.social ?? 0) >= 5) {
    problems.push({
      code: 'P06',
      name: 'Social contact',
      domain: 'Psychosocial',
      kbs: Math.max(1, 6 - Math.floor((cri.social ?? 0) / 2)),
      source: 'cri',
    });
  }

  return problems;
}

// ─── Agent ──────────────────────────────────────────────────────────────

export class LMNTriggerAgent extends BaseAgent {
  constructor() {
    super({
      name: 'lmn-trigger',
      description: 'Auto-generates LMN drafts when assessments complete and eligibility is met',
      subscribesTo: ['assessment.completed'],
      enabled: true,
    });
  }

  protected async handle(event: CareEvent): Promise<void> {
    const { familyId, payload } = event;
    const ciiData = payload.cii as Record<string, unknown>;
    const criData = payload.cri as Record<string, unknown>;

    if (!ciiData || !criData) {
      logger.warn({ familyId }, 'LMN Trigger: assessment.completed missing CII/CRI data');
      return;
    }

    // Build CII/CRI results from event payload
    const ciiResult: CIIResult = {
      physical: ciiData.physical as number,
      sleep: ciiData.sleep as number,
      isolation: ciiData.isolation as number,
      total: ciiData.total as number,
      zone: ciiData.zone as 'green' | 'yellow' | 'red',
      completedAt: new Date().toISOString(),
    };

    const criResult: CRIResult = {
      mobility: criData.mobility as number,
      memory: criData.memory as number,
      dailyTasks: criData.dailyTasks as number,
      medications: criData.medications as number,
      social: criData.social as number,
      total: criData.total as number,
      zone:
        (criData.total as number) >= 33
          ? 'red'
          : (criData.total as number) >= 19
            ? 'yellow'
            : 'green',
      omahaFlags: [],
      completedAt: new Date().toISOString(),
    };

    // Infer Omaha problems from CRI scores
    const omahaProblems = inferOmahaProblems(criData as Record<string, number>);

    // Check eligibility
    const eligibility = checkLMNEligibility(criResult, ciiResult, omahaProblems);

    if (!eligibility.eligible) {
      logger.info(
        { familyId, reason: eligibility.reason },
        'LMN Trigger: not eligible — continuing to build profile',
      );

      // Go back to profiling for more data
      advanceJourney(familyId, 'profiling', 'assessment.completed');
      return;
    }

    // Build profiles from stored data
    const profileData = getProfile(familyId);

    const careRecipient: CareRecipientProfile = {
      id: familyId,
      name: profileData.name ?? 'Care Recipient',
      dateOfBirth: profileData.age ? `${2026 - profileData.age}-01-01` : '1940-01-01',
      age: profileData.age ?? 80,
      conditions: profileData.conditions ?? [],
      medications: profileData.medications ?? [],
      mobilityLevel:
        (profileData.mobilityLevel as CareRecipientProfile['mobilityLevel']) ?? 'assisted',
      riskFlags: profileData.riskFlags ?? [],
      state: profileData.state ?? 'CO',
    };

    const caregiver: CaregiverProfile = {
      id: `cg-${familyId}`,
      name: profileData.caregiverName ?? 'Family Caregiver',
      relationship: profileData.caregiverRelationship ?? 'family member',
      email: '',
    };

    // Generate the LMN draft
    const lmnDraft = generateLMNDraft(
      careRecipient,
      caregiver,
      ciiResult,
      criResult,
      omahaProblems,
    );

    // Update journey with LMN data
    const draftId = `LMN-DRAFT-${Date.now()}`;
    updateJourneyData(familyId, {
      lmn: { draftId },
    });

    logger.info(
      {
        familyId,
        draftId,
        tier: lmnDraft.recommendedTier,
        acuity: lmnDraft.acuity,
        reviewPriority: lmnDraft.reviewPriority,
        monthlyCost: lmnDraft.monthlyCost,
        hsaSavings: lmnDraft.estimatedHsaSavings,
      },
      'LMN draft generated autonomously',
    );

    // Emit — Review Router picks this up and runs auto-approval triage
    await this.emit('lmn.draft_created', familyId, {
      draftId,
      draftText: lmnDraft.draftText,
      reviewPriority: lmnDraft.reviewPriority,
      acuity: lmnDraft.acuity,
      recommendedTier: lmnDraft.recommendedTier,
      recommendedHours: lmnDraft.recommendedHours,
      monthlyCost: lmnDraft.monthlyCost,
      estimatedHsaSavings: lmnDraft.estimatedHsaSavings,
      diagnosisCodes: lmnDraft.diagnosisCodes,
      omahaProblems: lmnDraft.omahaProblems,
      riskFlags: lmnDraft.riskFlags,
      careRecipientName: careRecipient.name,
      careRecipientAge: careRecipient.age,
      careRecipientState: careRecipient.state,
      // Fields needed by auto-approval triage engine
      criScore: criResult.total,
      ciiScore: ciiResult.total,
      ciiZone: ciiResult.zone,
      medicationCount: careRecipient.medications.length,
      omahaProblemsCount: omahaProblems.length,
      isRenewal: false, // Phase 2: detect renewals from journey history
    });
  }
}
