/**
 * Family Module — Zod Validation Schemas
 */
import { z } from 'zod';
import { geoPointSchema, membershipStatusSchema } from '../../common/validators.js';

export const createFamilySchema = z.object({
  name: z.string().min(1).max(200),
});

export type CreateFamilyInput = z.infer<typeof createFamilySchema>;

export const updateFamilySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  membershipStatus: membershipStatusSchema.optional(),
});

export type UpdateFamilyInput = z.infer<typeof updateFamilySchema>;

export const createCareRecipientSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.string().datetime(),
  mobilityLevel: z
    .enum(['independent', 'assisted', 'wheelchair', 'bedbound'])
    .default('independent'),
  cognitiveStatus: z.string().max(100).optional(),
  location: geoPointSchema.optional(),
  primaryDiagnoses: z.array(z.string()).default([]),
  activeOmahaProblems: z.array(z.number().int().min(1).max(42)).default([]),
});

export type CreateCareRecipientInput = z.infer<typeof createCareRecipientSchema>;

export const updateCareRecipientSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  mobilityLevel: z.enum(['independent', 'assisted', 'wheelchair', 'bedbound']).optional(),
  cognitiveStatus: z.string().max(100).optional(),
  location: geoPointSchema.optional(),
  primaryDiagnoses: z.array(z.string()).optional(),
  activeOmahaProblems: z.array(z.number().int().min(1).max(42)).optional(),
});

export type UpdateCareRecipientInput = z.infer<typeof updateCareRecipientSchema>;

export const assignCareTeamSchema = z.object({
  userId: z.string().min(1),
  role: z.string().min(1).max(50),
});

export type AssignCareTeamInput = z.infer<typeof assignCareTeamSchema>;
