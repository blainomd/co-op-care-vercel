/**
 * ACP (Advance Care Planning) Module — Zod Validation Schemas
 */
import { z } from 'zod';

export const createDirectiveSchema = z.object({
  familyId: z.string(),
  careRecipientId: z.string(),
  type: z.enum(['living_will', 'healthcare_proxy', 'polst', 'dnr', 'organ_donation', 'other']),
  proxyName: z.string().optional(),
  proxyPhone: z.string().optional(),
  proxyRelationship: z.string().optional(),
  alternateProxyName: z.string().optional(),
  alternateProxyPhone: z.string().optional(),
  witnessedDate: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateDirectiveInput = z.infer<typeof createDirectiveSchema>;

export const createGoalSchema = z.object({
  familyId: z.string(),
  careRecipientId: z.string(),
  category: z.enum(['comfort', 'function', 'longevity', 'autonomy', 'spiritual', 'legacy']),
  description: z.string().min(1),
  priority: z.enum(['highest', 'high', 'moderate', 'low']),
  discussedWith: z.array(z.string()),
  startDate: z.string(),
  reviewDate: z.string().optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export const createPreferenceSchema = z.object({
  familyId: z.string(),
  careRecipientId: z.string(),
  category: z.enum(['comfort', 'spiritual', 'legacy', 'daily_routine', 'social', 'dietary']),
  preference: z.string().min(1),
  importance: z.enum(['essential', 'preferred', 'nice_to_have']),
  notes: z.string().optional(),
});

export type CreatePreferenceInput = z.infer<typeof createPreferenceSchema>;

export const createConversationSchema = z.object({
  familyId: z.string(),
  date: z.string(),
  participants: z.array(z.string()),
  topics: z.array(z.string()),
  keyDecisions: z.string().optional(),
  nextSteps: z.string().optional(),
  emotionalTone: z.enum(['positive', 'neutral', 'difficult', 'breakthrough']).optional(),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;

export const toggleChecklistItemSchema = z.object({
  completed: z.boolean(),
  notes: z.string().optional(),
});

export type ToggleChecklistItemInput = z.infer<typeof toggleChecklistItemSchema>;
