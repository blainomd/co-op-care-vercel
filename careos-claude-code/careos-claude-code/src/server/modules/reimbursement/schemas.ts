/**
 * Reimbursement Module — Zod Validation Schemas
 */
import { z } from 'zod';

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format');

export const createClaimSchema = z.object({
  familyId: z.string().min(1),
  careRecipientId: z.string().min(1),
  lmnId: z.string().min(1),
  claimPeriodStart: dateStringSchema,
  claimPeriodEnd: dateStringSchema,
  hsaProvider: z.string().max(200).optional(),
  hsaAccountId: z.string().max(100).optional(),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;

export const updateClaimSchema = z.object({
  hsaProvider: z.string().max(200).optional(),
  hsaAccountId: z.string().max(100).optional(),
  supportingDocuments: z.array(z.string().url()).optional(),
  denialReason: z.string().max(2000).optional(),
});

export type UpdateClaimInput = z.infer<typeof updateClaimSchema>;

export const resolveClaimSchema = z.object({
  resolution: z.enum(['approved', 'denied']),
  denialReason: z.string().max(2000).optional(),
});

export type ResolveClaimInput = z.infer<typeof resolveClaimSchema>;

export const autoGenerateSchema = z.object({
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2024).max(2040).optional(),
});

export type AutoGenerateInput = z.infer<typeof autoGenerateSchema>;
