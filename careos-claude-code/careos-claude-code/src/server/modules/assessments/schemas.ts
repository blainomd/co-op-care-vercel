/**
 * Assessment Module — Zod Validation Schemas
 */
import { z } from 'zod';
import { ciiScoresSchema, miniCiiScoresSchema, kbsRatingSchema } from '../../common/validators.js';

export const submitCIISchema = z.object({
  familyId: z.string().min(1),
  careRecipientId: z.string().min(1).optional(),
  scores: ciiScoresSchema,
});

export type SubmitCIIInput = z.infer<typeof submitCIISchema>;

export const submitMiniCIISchema = z.object({
  // Mini CII is public — familyId/conductorId optional
  familyId: z.string().min(1).optional(),
  scores: miniCiiScoresSchema,
});

export type SubmitMiniCIIInput = z.infer<typeof submitMiniCIISchema>;

export const submitCRISchema = z.object({
  careRecipientId: z.string().min(1),
  factors: z
    .array(
      z.object({
        name: z.string().min(1),
        weight: z.number().min(0),
        score: z.number().min(0),
      }),
    )
    .length(14),
});

export type SubmitCRIInput = z.infer<typeof submitCRISchema>;

export const reviewCRISchema = z.object({
  reviewStatus: z.enum(['reviewed', 'approved', 'revision_requested']),
  notes: z.string().max(2000).optional(),
});

export type ReviewCRIInput = z.infer<typeof reviewCRISchema>;

export const submitKBSSchema = z.object({
  careRecipientId: z.string().min(1),
  omahaProblemCode: z.number().int().min(1).max(42),
  knowledge: kbsRatingSchema,
  behavior: kbsRatingSchema,
  status: kbsRatingSchema,
  assessmentDay: z.union([z.literal(0), z.literal(30), z.literal(60), z.literal(90)]),
});

export type SubmitKBSInput = z.infer<typeof submitKBSSchema>;
