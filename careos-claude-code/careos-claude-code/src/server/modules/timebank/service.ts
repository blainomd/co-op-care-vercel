/**
 * Time Bank Orchestration Service
 * Coordinates ledger, matching, GPS, respite, nudge, cascade, and Omaha coding
 */
import * as queries from '../../database/queries/index.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../../common/errors.js';
import type {
  TimeBankTask,
  MatchScore,
  TimeBankBalance,
  StreakInfo,
} from '@shared/types/timebank.types';
import type { TaskType } from '@shared/constants/business-rules';
import { REMOTE_TASK_TYPES } from '@shared/constants/business-rules';
import { ledgerService, roundCredits } from './ledger.js';
import { matchingService } from './matching.js';
import { verifyGPS } from './gps-verifier.js';
import { respiteService } from './respite.js';
import { nudgeService, type Nudge } from './nudge.js';
import { cascadeService, type CascadeChain, type ImpactScore } from './cascade.js';
import { autoCodeTask } from './omaha-coder.js';
import { web3Service } from '../web3/service.js';
import type { CreateTaskInput, CheckInInput, CheckOutInput, BuyCreditsInput } from './schemas.js';

/** Convert GeoPoint {latitude, longitude} to GeoJSON {type, coordinates} */
function toGeoJSON(point: { latitude: number; longitude: number }): {
  type: 'Point';
  coordinates: [number, number];
} {
  return { type: 'Point', coordinates: [point.longitude, point.latitude] };
}

export const timebankService = {
  // ─── Task Lifecycle ────────────────────────────────────────

  /**
   * Create a new task request
   * Auto-codes to Omaha, queues for matching
   */
  async createTask(requesterId: string, input: CreateTaskInput): Promise<TimeBankTask> {
    // Auto-code to Omaha System
    const coding = autoCodeTask(input.taskType as TaskType);

    const task = await queries.createTask({
      requesterId,
      careRecipientId: input.careRecipientId,
      taskType: input.taskType as TaskType,
      title: input.title,
      description: input.description,
      location: toGeoJSON(input.location),
      estimatedHours: roundCredits(input.estimatedHours),
      omahaProblemCode: coding?.omahaProblemCode,
      interventionCategory: coding?.interventionCategory,
      scheduledFor: input.scheduledFor,
    });

    return task as unknown as TimeBankTask;
  },

  /**
   * Find matches for a task
   */
  async findMatches(taskId: string): Promise<MatchScore[]> {
    const task = await this.getTask(taskId);
    return matchingService.findMatches(task.location, task.taskType as TaskType, task.requesterId);
  },

  /**
   * Accept a task assignment
   */
  async acceptTask(taskId: string, userId: string): Promise<TimeBankTask> {
    const task = await this.getTask(taskId);

    if (task.status !== 'open' && task.status !== 'matched') {
      throw new ValidationError(`Task cannot be accepted in status: ${task.status}`);
    }
    if (task.requesterId === userId) {
      throw new ValidationError('Cannot accept your own task');
    }

    const updated = await queries.updateTaskStatus(taskId, 'accepted', {
      matchedUserId: userId,
    });

    return updated as unknown as TimeBankTask;
  },

  /**
   * GPS check-in for a task
   */
  async checkIn(userId: string, input: CheckInInput): Promise<TimeBankTask> {
    const task = await this.getTask(input.taskId);

    if (task.status !== 'accepted') {
      throw new ValidationError('Task must be accepted before check-in');
    }
    if (task.matchedUserId !== userId) {
      throw new ForbiddenError('Only the assigned user can check in');
    }

    // GPS verification (skip for remote tasks)
    const isRemote = REMOTE_TASK_TYPES.includes(task.taskType as TaskType);
    if (!isRemote) {
      const gps = verifyGPS(input.location, task.location);
      if (!gps.withinThreshold) {
        throw new ValidationError(
          `GPS verification failed: ${gps.distanceMiles.toFixed(3)} miles from task location (max ${gps.thresholdMiles} miles)`,
        );
      }
    }

    const updated = await queries.updateTaskStatus(input.taskId, 'checked_in', {
      checkInTime: new Date().toISOString(),
      checkInLocation: toGeoJSON(input.location),
    });

    return updated as unknown as TimeBankTask;
  },

  /**
   * GPS check-out — triggers ledger credits and cascade recording
   */
  async checkOut(
    userId: string,
    input: CheckOutInput,
  ): Promise<{
    task: TimeBankTask;
    credits: { memberHours: number; respiteHours: number };
    nudges: Nudge[];
  }> {
    const task = await this.getTask(input.taskId);

    if (task.status !== 'checked_in') {
      throw new ValidationError('Must check in before checking out');
    }
    if (task.matchedUserId !== userId) {
      throw new ForbiddenError('Only the assigned user can check out');
    }

    // GPS verification (skip for remote)
    const isRemote = REMOTE_TASK_TYPES.includes(task.taskType as TaskType);
    if (!isRemote) {
      const gps = verifyGPS(input.location, task.location);
      if (!gps.withinThreshold) {
        throw new ValidationError(
          `GPS verification failed: ${gps.distanceMiles.toFixed(3)} miles from task location`,
        );
      }
    }

    const actualHours = roundCredits(input.actualHours);

    // Credit the helper (with Respite Default split)
    const { memberHours, respiteHours } = await ledgerService.creditEarned(
      userId,
      actualHours,
      input.taskId,
    );

    // Contribute respite hours to fund
    if (respiteHours > 0) {
      await respiteService.contributeHours(respiteHours, userId, input.taskId);
    }

    // Debit the requester
    await ledgerService.debitSpent(task.requesterId, actualHours, input.taskId);

    // Record cascade (helped edge)
    await cascadeService.recordHelped(userId, task.requesterId, input.taskId);

    // Update streak
    await nudgeService.updateStreak(userId);

    // Update task
    const updated = await queries.updateTaskStatus(input.taskId, 'completed', {
      checkOutTime: new Date().toISOString(),
      checkOutLocation: toGeoJSON(input.location),
      actualHours,
      rating: input.rating ?? null,
      gratitudeNote: input.gratitudeNote ?? null,
    });

    // Record care visit on-chain (fire and forget — never blocks checkout)
    web3Service.recordCareVisit(userId, task.requesterId, actualHours, input.taskId).catch(() => {
      /* swallow — already logged inside web3Service */
    });

    // Get nudges for requester (they may now be in deficit)
    const requesterBalance = await ledgerService.getBalance(task.requesterId);
    const nudges = await nudgeService.getNudges(task.requesterId, requesterBalance.available);

    return {
      task: updated as unknown as TimeBankTask,
      credits: { memberHours, respiteHours },
      nudges,
    };
  },

  // ─── Credits ───────────────────────────────────────────────

  /**
   * Buy credits with cash ($15/hr)
   */
  async buyCredits(
    userId: string,
    input: BuyCreditsInput,
  ): Promise<{
    entry: ReturnType<typeof ledgerService.creditBought> extends Promise<infer T> ? T : never;
    totalCostCents: number;
  }> {
    const result = await ledgerService.creditBought(userId, input.hours);

    // Contribute $3/hr to respite fund
    await respiteService.contributeDollars(result.respiteDollars, userId);

    return {
      entry: result,
      totalCostCents: input.hours * 1500,
    };
  },

  // ─── Queries ───────────────────────────────────────────────

  /**
   * Get a task by ID
   */
  async getTask(taskId: string): Promise<TimeBankTask> {
    const task = await queries.getTaskById(taskId);
    if (!task) {
      throw new NotFoundError('Task');
    }
    return task as unknown as TimeBankTask;
  },

  /**
   * List open tasks (for task feed)
   */
  async listOpenTasks(limit: number = 50): Promise<TimeBankTask[]> {
    const tasks = await queries.listOpenTasks(limit);
    return tasks as unknown as TimeBankTask[];
  },

  /**
   * Get user's tasks (requested or assigned)
   */
  async getUserTasks(userId: string): Promise<TimeBankTask[]> {
    const tasks = await queries.listUserTasks(userId);
    return tasks as unknown as TimeBankTask[];
  },

  /**
   * Get balance
   */
  async getBalance(userId: string): Promise<TimeBankBalance> {
    return ledgerService.getBalance(userId);
  },

  /**
   * Get cascade chain
   */
  async getCascadeChain(userId: string, depth: number = 5): Promise<CascadeChain> {
    return cascadeService.getCascadeChain(userId, depth);
  },

  /**
   * Get impact score
   */
  async getImpactScore(userId: string): Promise<ImpactScore> {
    return cascadeService.getImpactScore(userId);
  },

  /**
   * Get streak info
   */
  async getStreakInfo(userId: string): Promise<StreakInfo | null> {
    return nudgeService.getStreakInfo(userId);
  },

  /**
   * Get active nudges
   */
  async getNudges(userId: string): Promise<Nudge[]> {
    const balance = await ledgerService.getBalance(userId);
    return nudgeService.getNudges(userId, balance.available);
  },
};
