/**
 * Worker Service — Shift management, care logging, voice transcription
 *
 * Orchestrates the daily operational flow for worker-owner caregivers.
 */
import * as queries from '../../database/queries/index.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../../common/errors.js';
import { verifyGPS } from '../timebank/gps-verifier.js';
import { notificationService } from '../notifications/service.js';
import { logger } from '../../common/logger.js';
import { OMAHA_PROBLEMS } from '@shared/constants/omaha-system';
import type { Shift, ShiftSummary, CareLog, ShiftSwap } from '@shared/types/worker.types';
import type {
  CheckInShiftInput,
  CheckOutShiftInput,
  CreateCareLogInput,
  RequestShiftSwapInput,
  RespondShiftSwapInput,
  SubmitTranscriptionInput,
} from './schemas.js';

/** Convert DB GeoJSON to {latitude, longitude} */
function fromGeoJSON(geo: { type: 'Point'; coordinates: [number, number] }): {
  latitude: number;
  longitude: number;
} {
  return { latitude: geo.coordinates[1], longitude: geo.coordinates[0] };
}

/** Convert {latitude, longitude} to GeoJSON */
function toGeoJSON(point: { latitude: number; longitude: number }): {
  type: 'Point';
  coordinates: [number, number];
} {
  return { type: 'Point', coordinates: [point.longitude, point.latitude] };
}

/** Calculate hours between two ISO date strings */
function hoursBetween(start: string, end: string): number {
  return (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
}

/** Keyword → Omaha problem code mapping for voice transcription */
const KEYWORD_OMAHA_MAP: Array<{ keywords: string[]; code: number }> = [
  { keywords: ['medication', 'medicine', 'pill', 'prescription', 'dose'], code: 24 },
  { keywords: ['fall', 'balance', 'tripped', 'stumble', 'unsteady'], code: 25 },
  { keywords: ['confused', 'disoriented', 'memory', 'forgot', 'cognitive'], code: 21 },
  { keywords: ['pain', 'ache', 'hurt', 'sore', 'discomfort'], code: 28 },
  { keywords: ['appetite', 'eating', 'nutrition', 'weight', 'meal'], code: 27 },
  { keywords: ['sleep', 'insomnia', 'rest', 'tired', 'fatigue'], code: 34 },
  { keywords: ['mood', 'sad', 'anxious', 'depressed', 'agitated'], code: 13 },
  { keywords: ['skin', 'wound', 'rash', 'bruise', 'pressure'], code: 36 },
  { keywords: ['breath', 'cough', 'wheeze', 'oxygen', 'respiratory'], code: 33 },
  { keywords: ['bath', 'hygiene', 'dress', 'groom', 'personal care'], code: 38 },
  { keywords: ['walk', 'mobility', 'transfer', 'wheelchair', 'ambulation'], code: 25 },
  { keywords: ['blood pressure', 'hypertension', 'circulation'], code: 20 },
  { keywords: ['toilet', 'incontinence', 'bowel', 'bladder', 'urinary'], code: 19 },
  { keywords: ['social', 'lonely', 'isolated', 'visitor', 'engagement'], code: 12 },
];

/** Extract Omaha problem codes from free text */
function extractOmahaProblems(text: string): number[] {
  const lower = text.toLowerCase();
  const codes = new Set<number>();
  for (const mapping of KEYWORD_OMAHA_MAP) {
    if (mapping.keywords.some((kw) => lower.includes(kw))) {
      codes.add(mapping.code);
    }
  }
  return Array.from(codes);
}

/** Suggest care log category from text */
function suggestCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/medication|pill|prescription|dose/.test(lower)) return 'medication_reminder';
  if (/meal|cook|food|eat|lunch|dinner|breakfast/.test(lower)) return 'meal_preparation';
  if (/bath|shower|dress|groom|hygiene/.test(lower)) return 'personal_care';
  if (/walk|transfer|mobility|exercise/.test(lower)) return 'mobility_assist';
  if (/puzzle|game|read|memory|cognitive/.test(lower)) return 'cognitive_activity';
  if (/mood|comfort|talk|listen|emotional/.test(lower)) return 'emotional_support';
  if (/errand|store|pharmacy|shopping/.test(lower)) return 'errand';
  if (/vital|blood pressure|temperature|pulse/.test(lower)) return 'observation';
  return 'companion_visit';
}

export const workerService = {
  // ─── Shift Lifecycle ───────────────────────────────────

  async checkIn(workerId: string, shiftId: string, input: CheckInShiftInput): Promise<Shift> {
    const shift = await queries.getShiftById(shiftId);
    if (!shift) throw new NotFoundError('Shift');
    if (shift.workerId !== workerId) throw new ForbiddenError('Not your shift');
    if (shift.status !== 'scheduled') {
      throw new ValidationError(`Cannot check in — shift status is ${shift.status}`);
    }

    // GPS verification against shift address (if set)
    if (shift.checkInLocation) {
      const taskLocation = fromGeoJSON(shift.checkInLocation);
      const gps = verifyGPS(input.location, taskLocation);
      if (!gps.withinThreshold) {
        throw new ValidationError(
          `GPS verification failed: ${gps.distanceMiles.toFixed(3)} miles from shift location`,
        );
      }
    }

    const updated = await queries.updateShift(shiftId, {
      status: 'checked_in',
      actualStart: new Date().toISOString(),
      checkInLocation: toGeoJSON(input.location),
    });

    logger.info({ workerId, shiftId }, 'Worker checked in to shift');
    return updated as unknown as Shift;
  },

  async startBreak(workerId: string, shiftId: string): Promise<Shift> {
    const shift = await queries.getShiftById(shiftId);
    if (!shift) throw new NotFoundError('Shift');
    if (shift.workerId !== workerId) throw new ForbiddenError('Not your shift');
    if (shift.status !== 'checked_in' && shift.status !== 'active') {
      throw new ValidationError('Must be checked in to start break');
    }

    const breaks = [
      ...shift.breaks,
      { startedAt: new Date().toISOString(), endedAt: null, durationMinutes: null },
    ];
    const updated = await queries.updateShift(shiftId, {
      status: 'on_break',
      breaks,
    });

    return updated as unknown as Shift;
  },

  async endBreak(workerId: string, shiftId: string): Promise<Shift> {
    const shift = await queries.getShiftById(shiftId);
    if (!shift) throw new NotFoundError('Shift');
    if (shift.workerId !== workerId) throw new ForbiddenError('Not your shift');
    if (shift.status !== 'on_break') {
      throw new ValidationError('No active break to end');
    }

    const breaks = [...shift.breaks];
    const activeBreak = breaks[breaks.length - 1];
    if (activeBreak && !activeBreak.endedAt) {
      const now = new Date().toISOString();
      activeBreak.endedAt = now;
      activeBreak.durationMinutes = Math.round(
        (new Date(now).getTime() - new Date(activeBreak.startedAt).getTime()) / (1000 * 60),
      );
    }

    const totalBreakMinutes = breaks.reduce((sum, b) => sum + (b.durationMinutes ?? 0), 0);
    const updated = await queries.updateShift(shiftId, {
      status: 'active',
      breaks,
      totalBreakMinutes,
    });

    return updated as unknown as Shift;
  },

  async checkOut(
    workerId: string,
    shiftId: string,
    input: CheckOutShiftInput,
  ): Promise<ShiftSummary> {
    const shift = await queries.getShiftById(shiftId);
    if (!shift) throw new NotFoundError('Shift');
    if (shift.workerId !== workerId) throw new ForbiddenError('Not your shift');
    if (shift.status !== 'checked_in' && shift.status !== 'active' && shift.status !== 'on_break') {
      throw new ValidationError('Must be checked in to check out');
    }

    // End any active break
    const breaks = [...shift.breaks];
    const activeBreak = breaks[breaks.length - 1];
    if (activeBreak && !activeBreak.endedAt) {
      const now = new Date().toISOString();
      activeBreak.endedAt = now;
      activeBreak.durationMinutes = Math.round(
        (new Date(now).getTime() - new Date(activeBreak.startedAt).getTime()) / (1000 * 60),
      );
    }

    const totalBreakMinutes = breaks.reduce((sum, b) => sum + (b.durationMinutes ?? 0), 0);
    const actualEnd = new Date().toISOString();
    const actualHours = shift.actualStart ? hoursBetween(shift.actualStart, actualEnd) : 0;
    const billableHours = Math.max(0, actualHours - totalBreakMinutes / 60);

    await queries.updateShift(shiftId, {
      status: 'completed',
      actualEnd,
      checkOutLocation: toGeoJSON(input.location),
      breaks,
      totalBreakMinutes,
      billableHours: Math.round(billableHours * 100) / 100,
      notes: input.notes ?? null,
    });

    // Update worker equity hours
    await queries.updateWorkerEquityHours(workerId, billableHours);

    const careLogsCount = await queries.countCareLogsByShift(shiftId);
    const scheduledHours = hoursBetween(shift.scheduledStart, shift.scheduledEnd);

    logger.info({ workerId, shiftId, billableHours }, 'Worker checked out of shift');

    return {
      shiftId,
      scheduledHours: Math.round(scheduledHours * 100) / 100,
      actualHours: Math.round(actualHours * 100) / 100,
      breakMinutes: totalBreakMinutes,
      billableHours: Math.round(billableHours * 100) / 100,
      careRecipientName: shift.careRecipientName ?? 'Unknown',
      taskTypes: shift.taskTypes,
      careLogsCount,
    };
  },

  // ─── Schedule Queries ──────────────────────────────────

  async getTodayShifts(workerId: string): Promise<Shift[]> {
    const shifts = await queries.listTodayShifts(workerId);
    return shifts as unknown as Shift[];
  },

  async getShifts(workerId: string, dateFrom?: string, dateTo?: string): Promise<Shift[]> {
    const shifts = await queries.listWorkerShifts(workerId, dateFrom, dateTo);
    return shifts as unknown as Shift[];
  },

  async getShift(shiftId: string): Promise<Shift> {
    const shift = await queries.getShiftById(shiftId);
    if (!shift) throw new NotFoundError('Shift');
    return shift as unknown as Shift;
  },

  // ─── Care Logging ──────────────────────────────────────

  async createCareLog(workerId: string, input: CreateCareLogInput): Promise<CareLog> {
    // Verify shift exists and belongs to worker
    const shift = await queries.getShiftById(input.shiftId);
    if (!shift) throw new NotFoundError('Shift');
    if (shift.workerId !== workerId) throw new ForbiddenError('Not your shift');

    const log = await queries.createCareLog({
      shiftId: input.shiftId,
      workerId,
      careRecipientId: input.careRecipientId,
      category: input.category,
      notes: input.notes,
      omahaProblems: input.omahaProblems,
      vitals: input.vitals as Record<string, number> | undefined,
      moodRating: input.moodRating,
      alertLevel: input.alertLevel,
      voiceTranscript: input.voiceTranscript,
      duration: input.duration,
    });

    // If alert level is 'alert', notify the conductor/admin
    if (input.alertLevel === 'alert') {
      const problemNames = (input.omahaProblems ?? [])
        .map((code) => OMAHA_PROBLEMS.find((p) => p.code === code)?.name)
        .filter(Boolean)
        .join(', ');

      // Notify all conductors
      const conductors = await queries.listUsersByRole('conductor');
      for (const conductor of conductors) {
        await notificationService.send({
          userId: conductor.id,
          type: 'care_log_alert',
          variables: {
            workerName: 'Worker',
            careRecipientName: shift.careRecipientName ?? 'Care Recipient',
            category: input.category,
            problems: problemNames || 'Not specified',
            notes: input.notes.substring(0, 200),
          },
        });
      }
    }

    logger.info({ workerId, shiftId: input.shiftId, category: input.category }, 'Care log created');
    return log as unknown as CareLog;
  },

  async getCareLogsByShift(shiftId: string): Promise<CareLog[]> {
    const logs = await queries.listCareLogsByShift(shiftId);
    return logs as unknown as CareLog[];
  },

  async getRecentCareLogs(workerId: string, limit?: number): Promise<CareLog[]> {
    const logs = await queries.listCareLogsByWorker(workerId, limit);
    return logs as unknown as CareLog[];
  },

  // ─── Voice Transcription ───────────────────────────────

  async processTranscription(
    workerId: string,
    input: SubmitTranscriptionInput,
  ): Promise<{
    extractedProblems: Array<{ code: number; name: string }>;
    suggestedCategory: string;
    confidence: number;
  }> {
    const extractedCodes = extractOmahaProblems(input.rawText);
    const category = suggestCategory(input.rawText);
    const confidence = extractedCodes.length > 0 ? 0.7 : 0.3;

    const extractedProblems = extractedCodes
      .map((code) => {
        const problem = OMAHA_PROBLEMS.find((p) => p.code === code);
        return problem ? { code, name: problem.name } : null;
      })
      .filter((p): p is { code: number; name: string } => p !== null);

    logger.info(
      { workerId, problems: extractedCodes.length, category, confidence },
      'Voice transcription processed',
    );

    return { extractedProblems, suggestedCategory: category, confidence };
  },

  // ─── Shift Swaps ───────────────────────────────────────

  async requestSwap(workerId: string, input: RequestShiftSwapInput): Promise<ShiftSwap> {
    const shift = await queries.getShiftById(input.shiftId);
    if (!shift) throw new NotFoundError('Shift');
    if (shift.workerId !== workerId) throw new ForbiddenError('Not your shift');
    if (shift.status !== 'scheduled') {
      throw new ValidationError('Can only swap scheduled shifts');
    }

    const swap = await queries.createShiftSwap({
      requesterId: workerId,
      shiftId: input.shiftId,
      shiftDate: shift.scheduledStart.split('T')[0]!,
      shiftStart: shift.scheduledStart,
      shiftEnd: shift.scheduledEnd,
      careRecipientName: shift.careRecipientName ?? 'Unknown',
      reason: input.reason,
    });

    logger.info({ workerId, shiftId: input.shiftId }, 'Shift swap requested');
    return swap as unknown as ShiftSwap;
  },

  async respondToSwap(
    workerId: string,
    swapId: string,
    input: RespondShiftSwapInput,
  ): Promise<ShiftSwap> {
    const swap = await queries.getShiftSwapById(swapId);
    if (!swap) throw new NotFoundError('Shift swap');
    if (swap.status !== 'open') {
      throw new ValidationError('Swap is no longer available');
    }
    if (swap.requesterId === workerId) {
      throw new ValidationError('Cannot respond to your own swap request');
    }

    if (input.action === 'accept') {
      const updated = await queries.updateShiftSwap(swapId, {
        status: 'accepted',
        offeredToId: workerId,
        respondedAt: new Date().toISOString(),
      });

      // Update the original shift to the new worker
      await queries.updateShift(swap.shiftId, { workerId });

      // Notify the requester
      await notificationService.send({
        userId: swap.requesterId,
        type: 'shift_swap_accepted',
        variables: {
          shiftDate: swap.shiftDate,
          acceptedBy: 'Team member',
        },
      });

      logger.info({ workerId, swapId }, 'Shift swap accepted');
      return updated as unknown as ShiftSwap;
    }

    // Reject — just record, don't close the swap (others can still accept)
    logger.info({ workerId, swapId }, 'Shift swap offer declined');
    return swap as unknown as ShiftSwap;
  },

  async getOpenSwaps(): Promise<ShiftSwap[]> {
    const swaps = await queries.listOpenShiftSwaps();
    return swaps as unknown as ShiftSwap[];
  },

  async getMySwapRequests(workerId: string): Promise<ShiftSwap[]> {
    const swaps = await queries.listWorkerSwapRequests(workerId);
    return swaps as unknown as ShiftSwap[];
  },

  // ─── Worker Equity ─────────────────────────────────────

  async getEquity(workerId: string) {
    const equity = await queries.getWorkerEquity(workerId);
    return equity;
  },
};
