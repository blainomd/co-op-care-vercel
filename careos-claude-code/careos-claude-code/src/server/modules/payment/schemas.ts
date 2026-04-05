/**
 * Payment Module — Zod Validation Schemas
 */
import { z } from 'zod';
import { paymentSourceSchema } from '../../common/validators.js';

export const createMembershipSchema = z.object({
  familyId: z.string().min(1),
  paymentMethodId: z.string().min(1),
});

export type CreateMembershipInput = z.infer<typeof createMembershipSchema>;

export const buyCreditsSchema = z.object({
  hours: z.number().min(1).max(100),
  paymentMethodId: z.string().min(1),
});

export type BuyCreditsInput = z.infer<typeof buyCreditsSchema>;

export const comfortCardSubscribeSchema = z.object({
  familyId: z.string().min(1),
  paymentMethodId: z.string().min(1),
  paymentSources: z.array(paymentSourceSchema).min(1),
});

export type ComfortCardSubscribeInput = z.infer<typeof comfortCardSubscribeSchema>;

export const cancelSubscriptionSchema = z.object({
  familyId: z.string().min(1),
});

export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;

// ── Billing & Reconciliation Schemas ─────────────────────

export const statementQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  year: z.coerce.number().int().min(2024).max(2030).optional(),
  familyId: z.string().min(1),
});

export type StatementQueryInput = z.infer<typeof statementQuerySchema>;

export const eligibilityQuerySchema = z.object({
  careRecipientId: z.string().min(1),
});

export type EligibilityQueryInput = z.infer<typeof eligibilityQuerySchema>;

export const annualStatementSchema = z.object({
  familyId: z.string().min(1),
  year: z.coerce.number().int().min(2024).max(2030),
});

export type AnnualStatementInput = z.infer<typeof annualStatementSchema>;
