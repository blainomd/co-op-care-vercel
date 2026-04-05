/**
 * Worker-Owner Types — Shifts, Care Logs, Shift Swaps, Equity
 *
 * Covers the daily operational types for worker-owner caregivers
 * in the cooperative model.
 */
import type { GeoPoint } from './user.types';

// ── Shift Types ──────────────────────────────────────────

export type ShiftStatus =
  | 'scheduled'
  | 'checked_in'
  | 'on_break'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Shift {
  id: string;
  workerId: string;
  careRecipientId: string;
  careRecipientName?: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: ShiftStatus;
  checkInLocation?: GeoPoint;
  checkOutLocation?: GeoPoint;
  breaks: ShiftBreak[];
  totalBreakMinutes: number;
  billableHours?: number;
  notes?: string;
  address?: string;
  taskTypes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ShiftBreak {
  startedAt: string;
  endedAt?: string;
  durationMinutes?: number;
}

export interface ShiftSummary {
  shiftId: string;
  scheduledHours: number;
  actualHours: number;
  breakMinutes: number;
  billableHours: number;
  careRecipientName: string;
  taskTypes: string[];
  careLogsCount: number;
}

// ── Care Log Types ───────────────────────────────────────

export type CareLogCategory =
  | 'companion_visit'
  | 'personal_care'
  | 'medication_reminder'
  | 'meal_preparation'
  | 'mobility_assist'
  | 'cognitive_activity'
  | 'emotional_support'
  | 'errand'
  | 'observation'
  | 'other';

export interface CareLog {
  id: string;
  shiftId: string;
  workerId: string;
  careRecipientId: string;
  category: CareLogCategory;
  notes: string;
  omahaProblems: number[];
  vitals?: VitalsRecord;
  moodRating?: number; // 1-5
  alertLevel?: 'normal' | 'monitor' | 'alert';
  voiceTranscript?: string;
  duration?: number; // minutes
  createdAt: string;
}

export interface VitalsRecord {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  painLevel?: number; // 0-10
  bloodGlucose?: number;
}

// ── Shift Swap Types ─────────────────────────────────────

export type ShiftSwapStatus =
  | 'open'
  | 'offered'
  | 'accepted'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'expired';

export interface ShiftSwap {
  id: string;
  requesterId: string;
  requesterName?: string;
  shiftId: string;
  shiftDate: string;
  shiftStart: string;
  shiftEnd: string;
  careRecipientName: string;
  reason?: string;
  status: ShiftSwapStatus;
  offeredToId?: string;
  offeredToName?: string;
  approvedById?: string;
  respondedAt?: string;
  createdAt: string;
}

// ── Worker Equity Types ──────────────────────────────────

export interface WorkerEquity {
  workerId: string;
  hoursWorkedThisQuarter: number;
  equityRatePerHour: number;
  accumulatedEquity: number;
  vestedEquity: number;
  vestingStartDate: string;
  nextVestingDate: string;
}

// ── Voice Transcription Types ────────────────────────────

export type TranscriptionStatus = 'recording' | 'processing' | 'completed' | 'failed';

export interface VoiceTranscription {
  id: string;
  workerId: string;
  shiftId: string;
  careRecipientId: string;
  rawText: string;
  extractedProblems: number[]; // Omaha problem codes
  suggestedCategory: CareLogCategory;
  confidence: number; // 0-1
  status: TranscriptionStatus;
  createdAt: string;
}
