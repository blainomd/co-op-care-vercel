import type { TaskType } from '../constants/business-rules';
import type { GeoPoint } from './user.types';

export type LedgerEntryType =
  | 'earned'
  | 'spent'
  | 'bought'
  | 'donated'
  | 'expired'
  | 'deficit'
  | 'respite_deduction'
  | 'referral_bonus'
  | 'training_bonus'
  | 'membership_floor';

export interface LedgerEntry {
  id: string;
  userId: string;
  type: LedgerEntryType;
  hours: number; // positive for credit, negative for debit
  balanceAfter: number;
  taskId?: string;
  description: string;
  createdAt: string;
}

export interface TimeBankBalance {
  userId: string;
  earned: number;
  spent: number;
  bought: number;
  donated: number;
  expired: number;
  deficit: number;
  available: number; // computed
  /** Care Tier based on rolling 12-month earned hours */
  careTier?: {
    level: 'seedling' | 'rooted' | 'canopy';
    hoursThisYear: number;
    multiplier: number;
  };
}

export type TaskStatus =
  | 'open'
  | 'matched'
  | 'accepted'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'expired';

export interface TimeBankTask {
  id: string;
  requesterId: string;
  careRecipientId?: string;
  taskType: TaskType;
  title: string;
  description?: string;
  location: GeoPoint;
  estimatedHours: number;
  status: TaskStatus;
  matchedUserId?: string;
  checkInTime?: string;
  checkInLocation?: GeoPoint;
  checkOutTime?: string;
  checkOutLocation?: GeoPoint;
  actualHours?: number;
  omahaProblemCode?: number;
  interventionCategory?: string;
  rating?: number; // 1-5
  gratitudeNote?: string;
  scheduledFor?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatchScore {
  userId: string;
  totalScore: number;
  proximityScore: number;
  skillScore: number;
  ratingScore: number;
  availabilityScore: number;
  identityMatch: boolean;
  distanceMiles: number;
}

export interface StreakInfo {
  userId: string;
  currentWeeks: number;
  longestWeeks: number;
  nextMilestone: number | null;
  lastActivityAt: string;
}
