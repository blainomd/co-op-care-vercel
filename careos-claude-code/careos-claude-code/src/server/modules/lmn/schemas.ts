/**
 * LMN Module — Zod Validation Schemas
 */
import { z } from 'zod';

export const generateLMNSchema = z.object({
  careRecipientId: z.string().min(1),
  criAssessmentId: z.string().min(1),
  diagnosisCodes: z
    .array(z.string().regex(/^[A-Z]\d{2}(\.\d{1,4})?$/, 'Invalid ICD-10 code'))
    .optional(),
  carePlanSummary: z.string().max(5000).optional(),
});

export type GenerateLMNInput = z.infer<typeof generateLMNSchema>;

export const signLMNSchema = z.object({
  signatureMethod: z.enum(['docusign', 'hellosign', 'manual']),
});

export type SignLMNInput = z.infer<typeof signLMNSchema>;

export const renewLMNSchema = z.object({
  criAssessmentId: z.string().min(1),
  durationDays: z.number().int().min(30).max(730).optional(),
});

export type RenewLMNInput = z.infer<typeof renewLMNSchema>;

/**
 * Public LMN Request — no auth required, direct-to-consumer
 * Family submits intake → Stripe payment → AI drafts LMN → Josh reviews → family receives signed letter
 */
export const publicLMNRequestSchema = z.object({
  // Requester info
  requesterName: z.string().min(2).max(100),
  requesterEmail: z.string().email(),
  requesterPhone: z.string().min(10).max(15).optional(),
  relationshipToPatient: z.enum([
    'self',
    'spouse',
    'parent',
    'child',
    'sibling',
    'caregiver',
    'other',
  ]),

  // Patient info
  patientName: z.string().min(2).max(100),
  patientDOB: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
  patientAddress: z
    .object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().length(2),
      zip: z.string().min(5).max(10),
    })
    .optional(),

  // Care needs assessment (simplified — replaces CRI for public requests)
  primaryConditions: z
    .array(z.string())
    .min(1)
    .describe('e.g. dementia, mobility limitation, fall risk, chronic pain'),
  functionalLimitations: z
    .array(
      z.enum([
        'bathing',
        'dressing',
        'meal_prep',
        'medication_management',
        'mobility',
        'toileting',
        'transfers',
        'housekeeping',
        'transportation',
        'companionship',
      ]),
    )
    .min(1),
  currentCareDescription: z.string().max(2000).optional(),
  servicesRequested: z
    .array(
      z.enum([
        'companion_care',
        'personal_care',
        'respite_care',
        'dementia_care',
        'fall_prevention',
        'medication_reminders',
        'meal_preparation',
        'transportation',
        'exercise_program',
        'home_modification',
        'wellness_membership',
        'other',
      ]),
    )
    .min(1),
  otherServiceDescription: z.string().max(500).optional(),

  // HSA/FSA info
  hsaFsaProvider: z.string().max(100).optional(),
  estimatedAnnualCost: z.number().positive().optional(),

  // Consent
  consentToReview: z.literal(true, {
    errorMap: () => ({ message: 'You must consent to physician review' }),
  }),
});

export type PublicLMNRequestInput = z.infer<typeof publicLMNRequestSchema>;
