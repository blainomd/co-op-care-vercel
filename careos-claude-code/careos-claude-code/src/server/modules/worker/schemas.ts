/**
 * Worker Module — Zod Validation Schemas
 */
import { z } from 'zod';

// ── Shift Schemas ─────────────────────────────────────────

export const checkInShiftSchema = z.object({
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
});

export type CheckInShiftInput = z.infer<typeof checkInShiftSchema>;

export const checkOutShiftSchema = z.object({
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  notes: z.string().max(2000).optional(),
});

export type CheckOutShiftInput = z.infer<typeof checkOutShiftSchema>;

export const startBreakSchema = z.object({});
export const endBreakSchema = z.object({});

// ── Care Log Schemas ──────────────────────────────────────

export const createCareLogSchema = z.object({
  shiftId: z.string().min(1),
  careRecipientId: z.string().min(1),
  category: z.enum([
    'companion_visit',
    'personal_care',
    'medication_reminder',
    'meal_preparation',
    'mobility_assist',
    'cognitive_activity',
    'emotional_support',
    'errand',
    'observation',
    'other',
  ]),
  notes: z.string().min(1).max(5000),
  omahaProblems: z.array(z.number().int().min(1).max(42)).optional(),
  vitals: z
    .object({
      bloodPressureSystolic: z.number().min(60).max(250).optional(),
      bloodPressureDiastolic: z.number().min(30).max(150).optional(),
      heartRate: z.number().min(30).max(220).optional(),
      temperature: z.number().min(90).max(110).optional(),
      oxygenSaturation: z.number().min(50).max(100).optional(),
      weight: z.number().min(50).max(500).optional(),
      painLevel: z.number().min(0).max(10).optional(),
      bloodGlucose: z.number().min(20).max(600).optional(),
    })
    .optional(),
  moodRating: z.number().int().min(1).max(5).optional(),
  alertLevel: z.enum(['normal', 'monitor', 'alert']).optional(),
  voiceTranscript: z.string().max(10000).optional(),
  duration: z.number().int().min(1).max(720).optional(),
});

export type CreateCareLogInput = z.infer<typeof createCareLogSchema>;

// ── Shift Swap Schemas ────────────────────────────────────

export const requestShiftSwapSchema = z.object({
  shiftId: z.string().min(1),
  reason: z.string().max(500).optional(),
});

export type RequestShiftSwapInput = z.infer<typeof requestShiftSwapSchema>;

export const respondShiftSwapSchema = z.object({
  action: z.enum(['accept', 'reject']),
});

export type RespondShiftSwapInput = z.infer<typeof respondShiftSwapSchema>;

// ── Incident Report Schema ───────────────────────────────

export const createIncidentSchema = z.object({
  type: z.enum([
    'fall',
    'medication_error',
    'behavioral',
    'injury',
    'equipment_failure',
    'missed_visit',
    'elopement',
    'abuse_neglect',
    'other',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(10).max(5000),
  careRecipientName: z.string().max(200).optional(),
  shiftId: z.string().min(1).optional(),
  immediateActions: z.string().max(2000).optional(),
  witnesses: z.array(z.string().max(200)).max(10).optional(),
  injuryDetails: z.string().max(2000).optional(),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;

// ── Voice Transcription Schema ────────────────────────────

export const submitTranscriptionSchema = z.object({
  shiftId: z.string().min(1),
  careRecipientId: z.string().min(1),
  rawText: z.string().min(1).max(10000),
});

export type SubmitTranscriptionInput = z.infer<typeof submitTranscriptionSchema>;
