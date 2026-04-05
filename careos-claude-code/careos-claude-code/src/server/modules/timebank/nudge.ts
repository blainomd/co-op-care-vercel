/**
 * Behavioral Nudge Service
 * Deficit threshold nudges at -5, -10, -15, -20 hours
 * Streak tracking at 4, 8, 12, 26, 52 week milestones
 *
 * NOTE: Warm community recognition, NEVER gamification
 * (no leaderboards, XP, achievements)
 */
import { TIME_BANK } from '@shared/constants/business-rules';
import type { StreakInfo } from '@shared/types/timebank.types';
import {
  getStreakByUserId,
  createStreakRecord,
  updateStreakByUserId,
} from '../../database/queries/index.js';

export type NudgeType =
  | 'deficit_warning'
  | 'streak_milestone'
  | 'burnout_warning'
  | 'expiry_warning'
  | 'referral_prompt'
  | 'credit_expiry_warning';

export interface Nudge {
  type: NudgeType;
  level: 'info' | 'warning' | 'urgent';
  message: string;
  deficitHours?: number;
  streakWeeks?: number;
  expiringHours?: number;
  expiryDate?: string;
  referralCode?: string;
}

/**
 * Generate deficit nudges based on current balance
 * Escalating urgency: -5 (info) → -10 (warning) → -15 (warning) → -20 (urgent)
 */
export function generateDeficitNudges(available: number): Nudge[] {
  const nudges: Nudge[] = [];

  if (available >= 0) return nudges;

  const deficit = Math.abs(available);

  // Find the highest threshold hit
  const thresholds = TIME_BANK.DEFICIT_NUDGE_THRESHOLDS;
  for (const threshold of thresholds) {
    const absThreshold = Math.abs(threshold);
    if (deficit >= absThreshold) {
      const level = absThreshold >= 15 ? 'urgent' : absThreshold >= 10 ? 'warning' : 'info';
      nudges.push({
        type: 'deficit_warning',
        level,
        message: deficitMessage(deficit, absThreshold),
        deficitHours: deficit,
      });
    }
  }

  // Return only the most severe nudge
  const last = nudges[nudges.length - 1];
  return last ? [last] : [];
}

function deficitMessage(deficit: number, threshold: number): string {
  if (threshold >= 20) {
    return `You've reached the maximum deficit of ${deficit} hours. Please complete tasks or purchase credits to continue using the Time Bank.`;
  }
  if (threshold >= 15) {
    return `Your balance is ${deficit} hours in deficit. Consider helping a neighbor to earn credits back.`;
  }
  if (threshold >= 10) {
    return `You're ${deficit} hours in deficit. Giving back to your community is a great way to build your balance.`;
  }
  return `You're ${deficit} hours in deficit. No rush — every bit of help counts.`;
}

/**
 * Check for streak milestones
 */
export function checkStreakMilestone(currentWeeks: number): Nudge | null {
  const milestones = TIME_BANK.STREAK_MILESTONES_WEEKS;
  const milestone = milestones.find((m) => m === currentWeeks);
  if (!milestone) return null;

  return {
    type: 'streak_milestone',
    level: 'info',
    message: streakMessage(milestone),
    streakWeeks: milestone,
  };
}

function streakMessage(weeks: number): string {
  if (weeks >= 52)
    return `A full year of community care! Your consistency makes a real difference.`;
  if (weeks >= 26) return `Half a year of steady giving. Your neighbors are grateful.`;
  if (weeks >= 12) return `Three months of helping! You're building something meaningful.`;
  if (weeks >= 8) return `Two months strong. Your community notices.`;
  return `Four weeks of giving back. Keep it up!`;
}

/**
 * Check for burnout warning (>10 hrs/week)
 */
export function checkBurnoutWarning(hoursThisWeek: number): Nudge | null {
  if (hoursThisWeek <= TIME_BANK.BURNOUT_THRESHOLD_HOURS_PER_WEEK) return null;

  return {
    type: 'burnout_warning',
    level: 'warning',
    message: `You've logged ${hoursThisWeek} hours this week. Remember to take care of yourself too.`,
  };
}

/**
 * Referral prompt — triggered after a member's 3rd completed task.
 * Warm community tone: "Know someone who could use a hand?"
 */
export function checkReferralPrompt(
  completedTaskCount: number,
  referralCode: string,
): Nudge | null {
  if (completedTaskCount < 3) return null;
  // Only show once (at exactly 3) — caller should track dismissal
  if (completedTaskCount !== 3) return null;

  return {
    type: 'referral_prompt',
    level: 'info',
    message: `You've helped 3 neighbors! Know someone who could use a hand? Share your referral code — you'll both earn ${TIME_BANK.REFERRAL_BONUS_HOURS} bonus hours.`,
    referralCode,
  };
}

/**
 * Credit expiry warning — credits expiring within EXPIRY_WARNING_DAYS (30 days).
 * Shows hours at risk and the expiry date.
 */
export function checkCreditExpiryWarning(expiringHours: number, expiryDate: string): Nudge | null {
  if (expiringHours <= 0) return null;

  const daysUntil = Math.ceil(
    (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntil > TIME_BANK.EXPIRY_WARNING_DAYS || daysUntil < 0) return null;

  const level = daysUntil <= 7 ? 'urgent' : daysUntil <= 14 ? 'warning' : 'info';

  return {
    type: 'credit_expiry_warning',
    level,
    message:
      daysUntil <= 7
        ? `${expiringHours} hours expire in ${daysUntil} days! Use them or they'll move to the Respite Fund.`
        : `${expiringHours} hours will expire on ${new Date(expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}. Consider using them to help a neighbor.`,
    expiringHours,
    expiryDate,
  };
}

export const nudgeService = {
  /**
   * Get all active nudges for a user
   */
  async getNudges(
    userId: string,
    available: number,
    opts?: {
      hoursThisWeek?: number;
      completedTaskCount?: number;
      referralCode?: string;
      expiringHours?: number;
      expiryDate?: string;
    },
  ): Promise<Nudge[]> {
    const nudges: Nudge[] = [];

    // Deficit nudges
    nudges.push(...generateDeficitNudges(available));

    // Streak check
    const streak = await this.getStreakInfo(userId);
    if (streak) {
      const milestone = checkStreakMilestone(streak.currentWeeks);
      if (milestone) nudges.push(milestone);
    }

    // Burnout check
    if (opts?.hoursThisWeek != null) {
      const burnout = checkBurnoutWarning(opts.hoursThisWeek);
      if (burnout) nudges.push(burnout);
    }

    // Referral prompt
    if (opts?.completedTaskCount != null && opts?.referralCode) {
      const referral = checkReferralPrompt(opts.completedTaskCount, opts.referralCode);
      if (referral) nudges.push(referral);
    }

    // Credit expiry warning
    if (opts?.expiringHours != null && opts?.expiryDate) {
      const expiry = checkCreditExpiryWarning(opts.expiringHours, opts.expiryDate);
      if (expiry) nudges.push(expiry);
    }

    return nudges;
  },

  /**
   * Get streak info for a user
   */
  async getStreakInfo(userId: string): Promise<StreakInfo | null> {
    const record = await getStreakByUserId(userId);
    if (!record) return null;
    return {
      userId: record.userId,
      currentWeeks: record.currentWeeks,
      longestWeeks: record.longestWeeks,
      nextMilestone: record.nextMilestone,
      lastActivityAt: record.lastActivityAt,
    };
  },

  /**
   * Update streak after task completion
   */
  async updateStreak(userId: string): Promise<StreakInfo> {
    const now = new Date();
    const existing = await this.getStreakInfo(userId);

    if (!existing) {
      // First task ever — start streak at 1 week
      const streak: StreakInfo = {
        userId,
        currentWeeks: 1,
        longestWeeks: 1,
        nextMilestone: TIME_BANK.STREAK_MILESTONES_WEEKS[0],
        lastActivityAt: now.toISOString(),
      };

      await createStreakRecord({
        userId,
        currentWeeks: 1,
        longestWeeks: 1,
        nextMilestone: streak.nextMilestone,
      });

      return streak;
    }

    // Check if within the same week or new week
    const lastActivity = new Date(existing.lastActivityAt);
    const daysSince = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);

    let currentWeeks = existing.currentWeeks;
    if (daysSince >= 7 && daysSince < 14) {
      // New week activity — increment streak
      currentWeeks++;
    } else if (daysSince >= 14) {
      // Streak broken — reset
      currentWeeks = 1;
    }
    // else: same week, no change

    const longestWeeks = Math.max(currentWeeks, existing.longestWeeks);
    const milestones = TIME_BANK.STREAK_MILESTONES_WEEKS;
    const nextMilestone = milestones.find((m) => m > currentWeeks) ?? null;

    await updateStreakByUserId(userId, {
      currentWeeks,
      longestWeeks,
      nextMilestone,
    });

    return { userId, currentWeeks, longestWeeks, nextMilestone, lastActivityAt: now.toISOString() };
  },
};
