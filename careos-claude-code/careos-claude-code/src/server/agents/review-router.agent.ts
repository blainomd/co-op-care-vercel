/**
 * Review Router Agent — Josh's autonomous review queue
 *
 * The immune system. Every LMN draft gets routed to Josh, prioritized by:
 * - urgent: CII red zone, critical acuity, 4+ risk flags
 * - elevated: CII yellow, high acuity, 2+ risk flags
 * - standard: everything else
 *
 * Josh's dashboard shows the queue. One-click sign.
 * After signing, emits lmn.signed → Billing Agent picks it up.
 */
import { BaseAgent } from './base-agent.js';
import { updateJourneyData } from './care-journey.js';
import { triageLMN, type TriageResult, type LMNTriageInput } from './auto-approve.js';
import { logger } from '../common/logger.js';
import type { CareEvent } from './event-bus.js';

// ─── Review Queue ───────────────────────────────────────────────────────

export type ReviewPriority = 'urgent' | 'elevated' | 'standard';
export type ReviewStatus =
  | 'pending'
  | 'in_review'
  | 'signed'
  | 'rejected'
  | 'revision_needed'
  | 'auto_approved';

export interface ReviewItem {
  id: string;
  familyId: string;
  draftId: string;
  draftText: string;
  priority: ReviewPriority;
  status: ReviewStatus;
  acuity: string;
  recommendedTier: string;
  recommendedHours: number;
  monthlyCost: number;
  estimatedHsaSavings: number;
  careRecipientName: string;
  careRecipientAge: number;
  careRecipientState: string;
  riskFlags: string[];
  diagnosisCodes: string[];
  medicationCount: number;
  omahaProblemsCount: number;
  isRenewal: boolean;
  triage?: TriageResult;
  createdAt: Date;
  assignedAt?: Date;
  reviewedAt?: Date;
  reviewerNotes?: string;
}

// In-memory review queue (Phase 1 → PostgreSQL Phase 2)
const reviewQueue: ReviewItem[] = [];

export function getReviewQueue(status?: ReviewStatus): ReviewItem[] {
  const items = status ? reviewQueue.filter((i) => i.status === status) : reviewQueue;

  // Sort: urgent first, then elevated, then standard. Within priority, oldest first.
  const priorityOrder: Record<ReviewPriority, number> = { urgent: 0, elevated: 1, standard: 2 };
  return [...items].sort((a, b) => {
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

export function getReviewItem(id: string): ReviewItem | undefined {
  return reviewQueue.find((i) => i.id === id);
}

export function getAutoApprovedItems(): ReviewItem[] {
  return reviewQueue
    .filter((i) => i.status === 'auto_approved')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getTriageStats(): {
  total: number;
  autoApproved: number;
  pending: number;
  signed: number;
  rejected: number;
  autoApproveRate: number;
  estimatedJoshMinutesSaved: number;
} {
  const total = reviewQueue.length;
  const autoApproved = reviewQueue.filter((i) => i.status === 'auto_approved').length;
  const pending = reviewQueue.filter((i) => i.status === 'pending').length;
  const signed = reviewQueue.filter((i) => i.status === 'signed').length;
  const rejected = reviewQueue.filter((i) => i.status === 'rejected').length;
  // Each auto-approved LMN saves Josh ~3 min of review time
  const estimatedJoshMinutesSaved = autoApproved * 3;
  return {
    total,
    autoApproved,
    pending,
    signed,
    rejected,
    autoApproveRate: total > 0 ? autoApproved / total : 0,
    estimatedJoshMinutesSaved,
  };
}

/**
 * Josh signs an LMN. Called from the review dashboard.
 * Returns the signed review item.
 */
export async function signLMN(
  reviewItemId: string,
  reviewerNotes?: string,
): Promise<ReviewItem | null> {
  const item = reviewQueue.find((i) => i.id === reviewItemId);
  if (!item) return null;

  item.status = 'signed';
  item.reviewedAt = new Date();
  item.reviewerNotes = reviewerNotes;

  // Update journey
  updateJourneyData(item.familyId, {
    lmn: {
      lmnId: item.draftId,
      signedAt: item.reviewedAt,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
  });

  // Emit lmn.signed → Billing Agent
  const { eventBus } = await import('./event-bus.js');
  await eventBus.emit({
    type: 'lmn.signed',
    familyId: item.familyId,
    source: 'review-router',
    payload: {
      reviewItemId: item.id,
      draftId: item.draftId,
      draftText: item.draftText,
      recommendedTier: item.recommendedTier,
      monthlyCost: item.monthlyCost,
      estimatedHsaSavings: item.estimatedHsaSavings,
      careRecipientName: item.careRecipientName,
      careRecipientState: item.careRecipientState,
      signedAt: item.reviewedAt.toISOString(),
    },
    timestamp: new Date(),
  });

  logger.info(
    { reviewItemId: item.id, familyId: item.familyId, priority: item.priority },
    'LMN signed by physician',
  );

  return item;
}

/**
 * Josh rejects an LMN. Sends back for more assessment data.
 */
export async function rejectLMN(reviewItemId: string, reason: string): Promise<ReviewItem | null> {
  const item = reviewQueue.find((i) => i.id === reviewItemId);
  if (!item) return null;

  item.status = 'rejected';
  item.reviewedAt = new Date();
  item.reviewerNotes = reason;

  const { eventBus } = await import('./event-bus.js');
  await eventBus.emit({
    type: 'lmn.rejected',
    familyId: item.familyId,
    source: 'review-router',
    payload: { reviewItemId: item.id, reason },
    timestamp: new Date(),
  });

  logger.info(
    { reviewItemId: item.id, familyId: item.familyId, reason },
    'LMN rejected — returning to assessment',
  );

  return item;
}

// ─── Agent ──────────────────────────────────────────────────────────────

export class ReviewRouterAgent extends BaseAgent {
  constructor() {
    super({
      name: 'review-router',
      description: 'Routes LMN drafts to Josh review queue by priority',
      subscribesTo: ['lmn.draft_created'],
      enabled: true,
    });
  }

  protected async handle(event: CareEvent): Promise<void> {
    const { familyId, payload } = event;

    // ── Run Auto-Approval Triage ──────────────────────────────────
    const criScore = (payload.criScore as number) ?? 25;
    const ciiScore = (payload.ciiScore as number) ?? 10;
    const acuityStr = (payload.acuity as string) ?? 'moderate';
    const ciiZone = (payload.ciiZone as string) ?? 'green';

    const triageInput: LMNTriageInput = {
      criScore,
      criAcuity: acuityStr as LMNTriageInput['criAcuity'],
      ciiScore,
      ciiZone: ciiZone as LMNTriageInput['ciiZone'],
      careRecipientAge: (payload.careRecipientAge as number) ?? 75,
      medicationCount: (payload.medicationCount as number) ?? 3,
      riskFlags: (payload.riskFlags as string[]) ?? [],
      diagnosisCodes: (payload.diagnosisCodes as string[]) ?? [],
      recommendedTier: (payload.recommendedTier as string) ?? 'Regular Companion',
      recommendedHours: (payload.recommendedHours as number) ?? 8,
      omahaProblemsCount: (payload.omahaProblemsCount as number) ?? 3,
      isRenewal: (payload.isRenewal as boolean) ?? false,
    };

    const triage = triageLMN(triageInput);

    const reviewItem: ReviewItem = {
      id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      familyId,
      draftId: payload.draftId as string,
      draftText: payload.draftText as string,
      priority: payload.reviewPriority as ReviewPriority,
      status: triage.autoApproved ? 'auto_approved' : 'pending',
      acuity: acuityStr,
      recommendedTier: payload.recommendedTier as string,
      recommendedHours: (payload.recommendedHours as number) ?? 8,
      monthlyCost: payload.monthlyCost as number,
      estimatedHsaSavings: payload.estimatedHsaSavings as number,
      careRecipientName: payload.careRecipientName as string,
      careRecipientAge: payload.careRecipientAge as number,
      careRecipientState: payload.careRecipientState as string,
      riskFlags: (payload.riskFlags as string[]) ?? [],
      diagnosisCodes: (payload.diagnosisCodes as string[]) ?? [],
      medicationCount: (payload.medicationCount as number) ?? 3,
      omahaProblemsCount: (payload.omahaProblemsCount as number) ?? 3,
      isRenewal: (payload.isRenewal as boolean) ?? false,
      triage,
      createdAt: new Date(),
    };

    reviewQueue.push(reviewItem);

    // ── Auto-approved? Sign immediately, skip Josh's queue ────────
    if (triage.autoApproved) {
      reviewItem.reviewedAt = new Date();
      reviewItem.reviewerNotes = `AUTO-APPROVED: ${triage.reason}`;

      // Update journey
      updateJourneyData(familyId, {
        lmn: {
          lmnId: reviewItem.draftId,
          signedAt: reviewItem.reviewedAt,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });

      // Emit lmn.signed → Billing Agent picks it up
      const { eventBus } = await import('./event-bus.js');
      await eventBus.emit({
        type: 'lmn.signed',
        familyId,
        source: 'review-router',
        payload: {
          reviewItemId: reviewItem.id,
          draftId: reviewItem.draftId,
          draftText: reviewItem.draftText,
          recommendedTier: reviewItem.recommendedTier,
          monthlyCost: reviewItem.monthlyCost,
          estimatedHsaSavings: reviewItem.estimatedHsaSavings,
          careRecipientName: reviewItem.careRecipientName,
          careRecipientState: reviewItem.careRecipientState,
          signedAt: reviewItem.reviewedAt.toISOString(),
          autoApproved: true,
          triageTier: triage.tier,
          riskScore: triage.riskScore,
        },
        timestamp: new Date(),
      });

      logger.info(
        {
          reviewItemId: reviewItem.id,
          familyId,
          riskScore: triage.riskScore,
          tier: triage.tier,
          joshTime: triage.joshTimeEstimate,
        },
        `LMN AUTO-APPROVED — Josh sees this in daily digest only`,
      );
      return;
    }

    // ── Not auto-approved → queue for Josh ────────────────────────
    logger.info(
      {
        reviewItemId: reviewItem.id,
        familyId,
        priority: reviewItem.priority,
        triageTier: triage.tier,
        riskScore: triage.riskScore,
        joshTime: triage.joshTimeEstimate,
        queueDepth: reviewQueue.filter((i) => i.status === 'pending').length,
      },
      `LMN queued for Josh — ${triage.tier} (risk: ${triage.riskScore})`,
    );

    // Emit assignment event
    await this.emit('lmn.review_assigned', familyId, {
      reviewItemId: reviewItem.id,
      priority: reviewItem.priority,
      triageTier: triage.tier,
      careRecipientName: reviewItem.careRecipientName,
      queueDepth: reviewQueue.filter((i) => i.status === 'pending').length,
    });

    if (reviewItem.priority === 'urgent') {
      logger.warn(
        { reviewItemId: reviewItem.id, familyId },
        'URGENT LMN in queue — Josh notification needed',
      );
    }
  }
}
