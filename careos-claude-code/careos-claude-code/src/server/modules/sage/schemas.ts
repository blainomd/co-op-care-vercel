/**
 * Sage Module — Zod Validation Schemas
 * Matches SageResponse contract in SageHero.tsx
 */
import { z } from 'zod';

// --- Request schemas ---

export const sageChatSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().optional(),
  topic: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .optional(),
  profile: z.record(z.unknown()).optional(),
});

export type SageChatInput = z.infer<typeof sageChatSchema>;

export const sageIntentSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().min(1),
  context: z
    .object({
      previousIntents: z.array(z.string()).optional(),
      currentTier: z.string().optional(),
      ciiZone: z.string().optional(),
    })
    .optional(),
});

export type SageIntentInput = z.infer<typeof sageIntentSchema>;

// --- Response types (matching SageHero.tsx frontend contract) ---

export interface ActionButton {
  id: string;
  label: string;
  icon: string;
  actionType: 'start-assessment' | 'navigate' | 'show-plans' | 'start-intake' | 'contact';
  payload?: string;
}

export interface FollowupChip {
  label: string;
  message: string;
}

export interface SageResponse {
  content: string;
  actions?: ActionButton[];
  followups?: FollowupChip[];
  thinkingSteps?: string[];
}
