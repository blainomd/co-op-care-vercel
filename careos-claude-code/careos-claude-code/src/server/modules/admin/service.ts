/**
 * Admin Service — Aggregate queries, capacity metrics, matching overrides
 *
 * Provides coordinator-level view of system operations:
 * - Michaelis-Menten capacity modeling (enzyme kinetics applied to task matching)
 * - Manual task assignment overrides
 * - Member management
 * - Respite fund oversight
 */
import * as queries from '../../database/queries/index.js';
import { matchingService } from '../timebank/matching.js';
import { respiteService } from '../timebank/respite.js';
import { logger } from '../../common/logger.js';
import { NotFoundError, ValidationError } from '../../common/errors.js';
import type { GeoPoint } from '@shared/types/user.types';
import type { TaskType, UserRole } from '@shared/constants/business-rules';
import { SLA } from '@shared/constants/business-rules';

// ── Michaelis-Menten Capacity Model ──────────────────────────

/**
 * Michaelis-Menten parameters for matching capacity
 *
 * V = (Vmax × [S]) / (Km + [S])
 *
 * Where:
 * - V = matching velocity (tasks matched per hour)
 * - Vmax = maximum matching rate (limited by available caregivers)
 * - [S] = substrate concentration (open tasks in queue)
 * - Km = Michaelis constant (task queue depth at half-max velocity)
 */
export interface CapacityMetrics {
  // Current state
  openTasks: number; // [S] — substrate concentration
  availableCaregivers: number; // enzyme pool size
  activeShifts: number; // enzymes currently bound

  // Michaelis-Menten parameters
  vmax: number; // max matching velocity (tasks/hour)
  km: number; // half-max constant
  currentVelocity: number; // V — current matching rate

  // Derived metrics
  saturationPercent: number; // V/Vmax × 100
  estimatedClearTime: number; // hours to clear queue at current velocity
  matchEfficiency: number; // % of tasks matched within SLA

  // Queue health
  averageWaitHours: number;
  oldestTaskHours: number;
  slaBreaches: number; // tasks past SLA target
}

export interface MichaelisPoint {
  substrate: number; // [S]
  velocity: number; // V
}

/**
 * Calculate Michaelis-Menten capacity curve and current operating point
 */
async function getCapacityMetrics(): Promise<CapacityMetrics> {
  // Fetch current system state
  const [openTasks, allUsers] = await Promise.all([
    queries.listOpenTasks(1000),
    queries.listUsersByRole('worker_owner'),
  ]);

  const availableCaregivers = allUsers.length;
  const activeShifts = 0; // would come from shift tracking in production

  // Michaelis-Menten parameters
  // Vmax = available caregivers × avg tasks/caregiver/hour (assume 0.5 matches/hr per caregiver)
  const tasksPerCaregiverPerHour = 0.5;
  const vmax = Math.max(1, availableCaregivers * tasksPerCaregiverPerHour);

  // Km = queue depth at which matching runs at half speed
  // Empirically: when queue equals caregiver count, matching slows significantly
  const km = Math.max(1, availableCaregivers * 0.8);

  // Current velocity: V = Vmax × [S] / (Km + [S])
  const substrate = openTasks.length;
  const currentVelocity = substrate > 0 ? (vmax * substrate) / (km + substrate) : 0;

  // Derived metrics
  const saturationPercent = vmax > 0 ? (currentVelocity / vmax) * 100 : 0;
  const estimatedClearTime =
    currentVelocity > 0 ? substrate / currentVelocity : substrate > 0 ? Infinity : 0;

  // Queue health metrics
  const now = Date.now();
  let totalWaitMs = 0;
  let oldestMs = 0;
  let slaBreaches = 0;
  const slaMs = SLA.TIME_BANK_MATCH_HOURS * 60 * 60 * 1000;

  for (const task of openTasks) {
    const waitMs = now - new Date(task.createdAt).getTime();
    totalWaitMs += waitMs;
    if (waitMs > oldestMs) oldestMs = waitMs;
    if (waitMs > slaMs) slaBreaches++;
  }

  const averageWaitHours =
    openTasks.length > 0 ? totalWaitMs / openTasks.length / (1000 * 60 * 60) : 0;
  const oldestTaskHours = oldestMs / (1000 * 60 * 60);

  const recentlyMatched = openTasks.filter(
    (t) => t.status === 'matched' || t.status === 'completed',
  );
  const matchEfficiency =
    openTasks.length > 0 ? (recentlyMatched.length / openTasks.length) * 100 : 100;

  return {
    openTasks: substrate,
    availableCaregivers,
    activeShifts,
    vmax: Math.round(vmax * 100) / 100,
    km: Math.round(km * 100) / 100,
    currentVelocity: Math.round(currentVelocity * 100) / 100,
    saturationPercent: Math.round(saturationPercent * 10) / 10,
    estimatedClearTime: Math.round(estimatedClearTime * 100) / 100,
    matchEfficiency: Math.round(matchEfficiency * 10) / 10,
    averageWaitHours: Math.round(averageWaitHours * 100) / 100,
    oldestTaskHours: Math.round(oldestTaskHours * 100) / 100,
    slaBreaches,
  };
}

/**
 * Generate Michaelis-Menten curve points for visualization
 * Returns points from [S]=0 to [S]=maxSubstrate
 */
function generateCapacityCurve(
  vmax: number,
  km: number,
  maxSubstrate: number = 100,
): MichaelisPoint[] {
  const points: MichaelisPoint[] = [];
  const steps = 50;

  for (let i = 0; i <= steps; i++) {
    const substrate = (maxSubstrate / steps) * i;
    const velocity = (vmax * substrate) / (km + substrate);
    points.push({
      substrate: Math.round(substrate * 10) / 10,
      velocity: Math.round(velocity * 100) / 100,
    });
  }

  return points;
}

// ── Manual Matching ──────────────────────────────────────────

/**
 * Manually assign a task to a specific user (admin override)
 */
async function manualAssign(taskId: string, userId: string, adminId: string): Promise<void> {
  const task = await queries.getTaskById(taskId);
  if (!task) throw new NotFoundError('Task');
  if (task.status !== 'open') {
    throw new ValidationError(`Cannot assign — task status is ${task.status}`);
  }

  const user = await queries.getUserById(userId);
  if (!user) throw new NotFoundError('User');

  await queries.updateTaskStatus(taskId, 'matched', {
    matchedUserId: userId,
  });

  logger.info({ taskId, userId, adminId }, 'Task manually assigned by admin');
}

/**
 * Get match candidates for a task (for admin to review before manual assign)
 */
async function getMatchCandidates(taskId: string): Promise<unknown[]> {
  const task = await queries.getTaskById(taskId);
  if (!task) throw new NotFoundError('Task');

  const location: GeoPoint = task.location
    ? { latitude: task.location.coordinates[1], longitude: task.location.coordinates[0] }
    : { latitude: 40.015, longitude: -105.27 }; // Boulder default

  return matchingService.findMatches(
    location,
    (task.taskType ?? 'companionship') as TaskType,
    task.requesterId ?? '',
    50,
  );
}

// ── Member Management ────────────────────────────────────────

export interface MemberSummary {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  status: string;
  createdAt: string;
  lastLoginAt?: string;
}

/**
 * List all members with summary info
 */
async function listMembers(role?: UserRole): Promise<MemberSummary[]> {
  const users = role
    ? await queries.listUsersByRole(role)
    : await queries.listUsersByRole('timebank_member'); // default

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    firstName: u.firstName ?? undefined,
    lastName: u.lastName ?? undefined,
    roles: u.roles ?? [],
    status: u.backgroundCheckStatus ?? 'active',
    createdAt: u.createdAt ?? new Date().toISOString(),
    lastLoginAt: u.updatedAt ?? undefined,
  }));
}

/**
 * Get aggregate dashboard stats
 */
async function getDashboardStats(): Promise<Record<string, number>> {
  const [conductors, workers, members, directors, openTasks, activeLMNs, pendingLMNs] =
    await Promise.all([
      queries.listUsersByRole('conductor'),
      queries.listUsersByRole('worker_owner'),
      queries.listUsersByRole('timebank_member'),
      queries.listUsersByRole('medical_director'),
      queries.listOpenTasks(1000),
      queries.listActiveLMNs(),
      queries.listPendingSignatureLMNs(),
    ]);

  return {
    totalConductors: conductors.length,
    totalWorkers: workers.length,
    totalMembers: members.length,
    totalDirectors: directors.length,
    openTaskCount: openTasks.length,
    activeLMNCount: activeLMNs.length,
    pendingLMNCount: pendingLMNs.length,
  };
}

// ── Respite Fund Admin ───────────────────────────────────────

/**
 * Admin view of respite fund with override capabilities
 */
async function getRespiteFundAdmin() {
  return respiteService.getFundBalance();
}

/**
 * Admin-initiated emergency respite disbursement (bypasses auto-approve threshold)
 */
async function adminDisbursement(recipientUserId: string, hours: number, adminId: string) {
  const user = await queries.getUserById(recipientUserId);
  if (!user) throw new NotFoundError('Recipient user');

  if (hours <= 0 || hours > 48) {
    throw new ValidationError('Disbursement must be between 1 and 48 hours');
  }

  const result = await respiteService.requestEmergencyRespite(recipientUserId, hours);
  logger.info(
    { recipientUserId, hours, adminId, approved: result.approved },
    'Admin respite disbursement',
  );
  return result;
}

export const adminService = {
  getCapacityMetrics,
  generateCapacityCurve,
  manualAssign,
  getMatchCandidates,
  listMembers,
  getDashboardStats,
  getRespiteFundAdmin,
  adminDisbursement,
};
