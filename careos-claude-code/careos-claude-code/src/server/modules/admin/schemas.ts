/**
 * Admin Schemas — Zod validation for admin endpoints
 */
import { z } from 'zod';

export const manualAssignSchema = z.object({
  userId: z.string().min(1),
});

export const adminDisbursementSchema = z.object({
  recipientUserId: z.string().min(1),
  hours: z.number().min(1).max(48),
});

export const listMembersQuerySchema = z.object({
  role: z
    .enum([
      'conductor',
      'worker_owner',
      'timebank_member',
      'medical_director',
      'admin',
      'employer_hr',
      'wellness_provider',
    ])
    .optional(),
});

export type ManualAssignInput = z.infer<typeof manualAssignSchema>;
export type AdminDisbursementInput = z.infer<typeof adminDisbursementSchema>;
export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>;
