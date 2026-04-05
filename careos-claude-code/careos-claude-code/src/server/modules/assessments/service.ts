/**
 * Assessment Service — CII, Mini CII, CRI, KBS
 * Stores in PostgreSQL, queues FHIR sync via outbox
 */
import * as queries from '../../database/queries/index.js';
import { logger } from '../../common/logger.js';
import { NotFoundError, ForbiddenError } from '../../common/errors.js';
import { scoreCII, scoreMiniCII } from './cii.js';
import { scoreCRI } from './cri.js';
import { validateKBS } from './kbs.js';
import { analyzeKBSTrend, getEscalationDetails } from './kbs-trend.js';
import { notificationService } from '../notifications/service.js';
import { evaluateForLMN } from '../lmn/auto-trigger.js';
import type {
  SubmitCIIInput,
  SubmitMiniCIIInput,
  SubmitCRIInput,
  ReviewCRIInput,
  SubmitKBSInput,
} from './schemas.js';

export const assessmentService = {
  /**
   * Submit a full CII assessment (12 dimensions)
   */
  async submitCII(assessorId: string, input: SubmitCIIInput) {
    const { totalScore, zone } = scoreCII(input.scores);

    const assessment = await queries.createAssessment({
      familyId: input.familyId,
      careRecipientId: input.careRecipientId,
      assessorId,
      type: 'cii',
      scores: input.scores,
      totalScore,
      zone,
    });

    // Queue FHIR sync via outbox
    await queries.createOutboxEvent({
      eventType: 'assessment.created',
      resourceType: 'QuestionnaireResponse',
      resourceId: assessment.id,
      payload: { type: 'cii', totalScore, zone },
    });

    logger.info({ assessmentId: assessment.id, type: 'cii', zone }, 'CII assessment submitted');
    return assessment;
  },

  /**
   * Submit Mini CII Quick Check (3 sliders, public)
   */
  async submitMiniCII(
    assessorId: string | null,
    input: SubmitMiniCIIInput,
  ): Promise<{ totalScore: number; zone: string }> {
    const { totalScore, zone } = scoreMiniCII(input.scores);

    // If user is authenticated and has a family, store it
    if (assessorId && input.familyId) {
      await queries.createAssessment({
        familyId: input.familyId,
        assessorId,
        type: 'mini_cii',
        scores: input.scores,
        totalScore,
        zone,
      });
    }

    return { totalScore, zone };
  },

  /**
   * Submit CRI assessment (14 factors, requires MD review)
   */
  async submitCRI(assessorId: string, input: SubmitCRIInput) {
    const { rawScore, factors, acuity, lmnEligible } = scoreCRI(input.factors);

    const assessment = await queries.createAssessment({
      careRecipientId: input.careRecipientId,
      assessorId,
      type: 'cri',
      scores: factors.map((f) => f.weight * f.score),
      totalScore: rawScore,
      acuity,
      lmnEligible,
    });

    // Queue FHIR sync via outbox
    await queries.createOutboxEvent({
      eventType: 'assessment.created',
      resourceType: 'QuestionnaireResponse',
      resourceId: assessment.id,
      payload: { type: 'cri', rawScore, acuity, lmnEligible },
    });

    // Notify all medical directors that a CRI needs review (24h SLA)
    const medicalDirectors = await queries.listUsersByRole('medical_director');
    for (const md of medicalDirectors) {
      await notificationService
        .send({
          userId: md.id,
          type: 'cri_pending_review',
          variables: {
            careRecipientName: input.careRecipientId,
            rawScore: String(rawScore),
            acuity,
            lmnEligible: lmnEligible ? 'Yes' : 'No',
          },
        })
        .catch((err) => {
          logger.warn({ err, mdId: md.id }, 'Failed to notify MD of pending CRI');
        });
    }

    logger.info(
      { assessmentId: assessment.id, type: 'cri', rawScore, acuity },
      'CRI assessment submitted (pending MD review)',
    );
    return assessment;
  },

  /**
   * MD reviews a CRI assessment
   */
  async reviewCRI(assessmentId: string, reviewerId: string, input: ReviewCRIInput) {
    const existing = await queries.getAssessmentById(assessmentId);
    if (!existing || existing.type !== 'cri') {
      throw new NotFoundError('CRI Assessment');
    }

    // Allow review of pending or revision_requested assessments
    if (existing.reviewStatus !== 'pending' && existing.reviewStatus !== 'revision_requested') {
      throw new ForbiddenError('Assessment already reviewed');
    }

    const updated = await queries.reviewAssessment(
      assessmentId,
      reviewerId,
      input.reviewStatus as 'approved' | 'reviewed' | 'revision_requested',
      input.notes,
    );

    // Queue FHIR sync
    await queries.createOutboxEvent({
      eventType: 'assessment.reviewed',
      resourceType: 'QuestionnaireResponse',
      resourceId: assessmentId,
      payload: { type: 'cri', reviewStatus: input.reviewStatus },
    });

    // Notify the assessor based on review outcome
    if (input.reviewStatus === 'approved') {
      await notificationService
        .send({
          userId: existing.assessorId,
          type: 'cri_approved',
          variables: {
            careRecipientName: existing.careRecipientId ?? '',
            acuity: existing.acuity ?? 'unknown',
          },
        })
        .catch((err) => {
          logger.warn({ err, assessmentId }, 'Failed to notify assessor of CRI approval');
        });

      // If LMN-eligible, queue LMN generation
      if (existing.lmnEligible) {
        await queries.createOutboxEvent({
          eventType: 'lmn.generation_requested',
          resourceType: 'DocumentReference',
          resourceId: assessmentId,
          payload: {
            careRecipientId: existing.careRecipientId,
            criScore: existing.totalScore,
            acuity: existing.acuity,
            approvedBy: reviewerId,
          },
        });
        logger.info(
          { assessmentId, acuity: existing.acuity },
          'LMN generation queued (CRI approved, acuity >= high)',
        );

        // Fire-and-forget: run LMN auto-trigger evaluation
        evaluateForLMN({
          assessmentId,
          assessmentType: 'cri',
          userId: existing.assessorId,
          careRecipientId: existing.careRecipientId ?? '',
          score: existing.totalScore,
        }).catch((err) => {
          logger.warn({ err, assessmentId }, 'LMN auto-trigger evaluation failed (non-blocking)');
        });
      }
    } else if (input.reviewStatus === 'revision_requested') {
      await notificationService
        .send({
          userId: existing.assessorId,
          type: 'cri_revision_requested',
          variables: {
            careRecipientName: existing.careRecipientId ?? '',
            reviewNotes: input.notes ?? 'No additional notes provided.',
          },
        })
        .catch((err) => {
          logger.warn({ err, assessmentId }, 'Failed to notify assessor of CRI revision request');
        });
    }

    logger.info({ assessmentId, reviewStatus: input.reviewStatus }, 'CRI assessment reviewed');
    return updated!;
  },

  /**
   * Get pending CRI reviews for the MD review queue
   */
  async getPendingCRIReviews() {
    return queries.getPendingCRIReviews();
  },

  /**
   * Submit KBS outcome rating
   */
  async submitKBS(raterId: string, input: SubmitKBSInput) {
    const { valid } = validateKBS(input.knowledge, input.behavior, input.status);
    if (!valid) {
      throw new ForbiddenError('KBS ratings must be 1-5');
    }

    const kbs = await queries.createKBSRating({
      careRecipientId: input.careRecipientId,
      omahaProblemCode: input.omahaProblemCode,
      knowledge: input.knowledge,
      behavior: input.behavior,
      status: input.status,
      assessmentDay: input.assessmentDay,
      ratedBy: raterId,
    });

    // Queue FHIR sync (Observation)
    await queries.createOutboxEvent({
      eventType: 'kbs.recorded',
      resourceType: 'Observation',
      resourceId: kbs.id,
      payload: {
        omahaProblemCode: input.omahaProblemCode,
        knowledge: input.knowledge,
        behavior: input.behavior,
        status: input.status,
      },
    });

    // Trend analysis: check for 2+ point decline → escalate to MD
    if (input.assessmentDay > 0) {
      const history = await queries.getKBSHistory(input.careRecipientId, input.omahaProblemCode);
      const trend = analyzeKBSTrend(history);

      if (trend.escalationRequired) {
        const details = getEscalationDetails(trend);
        const declinedDims = details.map((d) => d.dimension).join(', ');
        const declineDetails = details
          .map((d) => `${d.dimension}: ${d.from} → ${d.to} (${d.delta})`)
          .join('; ');

        const medicalDirectors = await queries.listUsersByRole('medical_director');
        for (const md of medicalDirectors) {
          await notificationService
            .send({
              userId: md.id,
              type: 'kbs_decline_escalation',
              variables: {
                careRecipientName: input.careRecipientId,
                omahaProblemName: `Problem #${input.omahaProblemCode}`,
                declinedDimensions: declinedDims,
                declinePoints: '2',
                declineDetails,
              },
            })
            .catch((err) => {
              logger.warn({ err, mdId: md.id }, 'Failed to notify MD of KBS decline');
            });
        }
        logger.warn({ kbsId: kbs.id, details }, 'KBS decline escalation triggered');
      }
    }

    logger.info({ kbsId: kbs.id, omahaProblemCode: input.omahaProblemCode }, 'KBS rating recorded');
    return kbs;
  },

  /**
   * Get KBS trend analysis for a care recipient across all problems
   */
  async getKBSTrends(careRecipientId: string) {
    const allRatings = await queries.getKBSHistory(careRecipientId);
    const { analyzeMultiProblemTrends } = await import('./kbs-trend.js');
    return analyzeMultiProblemTrends(allRatings);
  },

  /**
   * Get assessment history for a family (longitudinal tracking)
   */
  async getAssessmentHistory(familyId: string, type?: string) {
    return queries.getAssessmentHistory(familyId, type);
  },

  /**
   * Get KBS ratings for a care recipient (longitudinal)
   */
  async getKBSHistory(careRecipientId: string, omahaProblemCode?: number) {
    return queries.getKBSHistory(careRecipientId, omahaProblemCode);
  },
};
