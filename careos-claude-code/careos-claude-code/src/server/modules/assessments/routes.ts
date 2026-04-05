/**
 * Assessment Routes — CII, Mini CII, CRI, KBS
 * CII/CRI/KBS: conductor, medical_director, admin
 * Mini CII: public (no auth required)
 */
import type { FastifyInstance } from 'fastify';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { ValidationError } from '../../common/errors.js';
import { assessmentService } from './service.js';
import {
  submitCIISchema,
  submitMiniCIISchema,
  submitCRISchema,
  reviewCRISchema,
  submitKBSSchema,
} from './schemas.js';

export async function assessmentRoutes(app: FastifyInstance): Promise<void> {
  /**
   * POST /mini-cii — Public Mini CII Quick Check (no auth)
   * 3 sliders, 30 seconds, part of onboarding funnel
   */
  app.post('/mini-cii', async (request) => {
    const parsed = submitMiniCIISchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid Mini CII data');

    return assessmentService.submitMiniCII(request.userId ?? null, parsed.data);
  });

  /**
   * POST /mini-cii/anonymous — Fully anonymous Mini CII (homepage onboarding funnel)
   * Returns score + zone + linkToken for later account linking.
   */
  app.post('/mini-cii/anonymous', async (request, reply) => {
    const parsed = submitMiniCIISchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid Mini CII data');

    const result = await assessmentService.submitMiniCII(null, parsed.data);
    const linkToken = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const recommendations =
      result.zone === 'red'
        ? 'Your burnout level is high. Please consider scheduling a call with a Care Navigator.'
        : result.zone === 'yellow'
          ? "You're showing moderate caregiver stress. Small changes can help."
          : 'You are managing well! The Time Bank can help you stay ahead.';

    reply.status(201).send({
      ...result,
      linkToken,
      recommendations,
    });
  });

  /**
   * GET /cii/latest — Latest CII score for the authenticated user's family
   * Used by the CIIGauge dashboard widget
   */
  app.get(
    '/cii/latest',
    {
      preHandler: [requireAuth],
    },
    async (request) => {
      try {
        const history = await assessmentService.getAssessmentHistory(
          (request.query as { familyId?: string }).familyId ?? request.userId!,
          'cii',
        );
        if (history && Array.isArray(history) && history.length > 0) {
          const latest = history[0]!;
          return {
            score: latest.totalScore,
            maxScore: 120,
            zone: latest.zone,
            lastAssessedAt: latest.createdAt,
          };
        }
        return { score: null };
      } catch {
        return { score: null };
      }
    },
  );

  // --- Authenticated routes below ---

  /**
   * POST /cii — Submit full CII assessment
   */
  app.post(
    '/cii',
    {
      preHandler: [requireAuth, requireRole('conductor', 'medical_director', 'admin')],
    },
    async (request, reply) => {
      const parsed = submitCIISchema.safeParse(request.body);
      if (!parsed.success) throw new ValidationError('Invalid CII data');

      const assessment = await assessmentService.submitCII(request.userId!, parsed.data);
      reply.status(201).send(assessment);
    },
  );

  /**
   * POST /cri — Submit CRI assessment (pending MD review)
   */
  app.post(
    '/cri',
    {
      preHandler: [requireAuth, requireRole('conductor', 'medical_director', 'admin')],
    },
    async (request, reply) => {
      const parsed = submitCRISchema.safeParse(request.body);
      if (!parsed.success) throw new ValidationError('Invalid CRI data');

      const assessment = await assessmentService.submitCRI(request.userId!, parsed.data);
      reply.status(201).send(assessment);
    },
  );

  /**
   * GET /cri/pending — MD review queue (pending CRI assessments)
   */
  app.get(
    '/cri/pending',
    {
      preHandler: [requireAuth, requireRole('medical_director', 'admin')],
    },
    async () => {
      return assessmentService.getPendingCRIReviews();
    },
  );

  /**
   * PUT /cri/:assessmentId/review — MD reviews CRI
   */
  app.put(
    '/cri/:assessmentId/review',
    {
      preHandler: [requireAuth, requireRole('medical_director', 'admin')],
    },
    async (request) => {
      const { assessmentId } = request.params as { assessmentId: string };
      const parsed = reviewCRISchema.safeParse(request.body);
      if (!parsed.success) throw new ValidationError('Invalid review data');

      return assessmentService.reviewCRI(assessmentId, request.userId!, parsed.data);
    },
  );

  /**
   * POST /kbs — Submit KBS outcome rating
   */
  app.post(
    '/kbs',
    {
      preHandler: [requireAuth, requireRole('conductor', 'medical_director', 'admin')],
    },
    async (request, reply) => {
      const parsed = submitKBSSchema.safeParse(request.body);
      if (!parsed.success) throw new ValidationError('Invalid KBS data');

      const rating = await assessmentService.submitKBS(request.userId!, parsed.data);
      reply.status(201).send(rating);
    },
  );

  /**
   * GET /family/:familyId — Assessment history for a family
   */
  app.get(
    '/family/:familyId',
    {
      preHandler: [requireAuth, requireRole('conductor', 'medical_director', 'admin')],
    },
    async (request) => {
      const { familyId } = request.params as { familyId: string };
      const { type } = request.query as { type?: string };
      return assessmentService.getAssessmentHistory(familyId, type);
    },
  );

  /**
   * GET /kbs/:careRecipientId — KBS history for a care recipient
   */
  app.get(
    '/kbs/:careRecipientId',
    {
      preHandler: [requireAuth, requireRole('conductor', 'medical_director', 'admin')],
    },
    async (request) => {
      const { careRecipientId } = request.params as { careRecipientId: string };
      const { omahaProblemCode } = request.query as { omahaProblemCode?: string };
      return assessmentService.getKBSHistory(
        careRecipientId,
        omahaProblemCode ? parseInt(omahaProblemCode, 10) : undefined,
      );
    },
  );

  /**
   * GET /kbs/:careRecipientId/trends — KBS trend analysis across all problems
   */
  app.get(
    '/kbs/:careRecipientId/trends',
    {
      preHandler: [requireAuth, requireRole('conductor', 'medical_director', 'admin')],
    },
    async (request) => {
      const { careRecipientId } = request.params as { careRecipientId: string };
      return assessmentService.getKBSTrends(careRecipientId);
    },
  );
}
