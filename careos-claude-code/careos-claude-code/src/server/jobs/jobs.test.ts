/**
 * Unit tests for background jobs utility functions
 */
import { describe, it, expect } from 'vitest';
import { roundToIncrement } from './timebank-expiry';
import { calculateRenewalDate, isInReminderWindow } from './membership-renewal';
import { calculateLMNExpiry, getLMNReminderTier } from './lmn-renewal';
import { getNextReassessmentDate, isReassessmentOverdue } from './kbs-reassessment';

/** Format a Date as YYYY-MM-DD using local time (avoids UTC shift from toISOString). */
function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

describe('Time Bank Expiry', () => {
  describe('roundToIncrement', () => {
    it('rounds to 0.25 hour increments', () => {
      expect(roundToIncrement(1.1)).toBe(1.0);
      expect(roundToIncrement(1.13)).toBe(1.25);
      expect(roundToIncrement(1.3)).toBe(1.25);
      expect(roundToIncrement(1.4)).toBe(1.5);
      expect(roundToIncrement(1.6)).toBe(1.5);
      expect(roundToIncrement(1.9)).toBe(2.0);
      expect(roundToIncrement(2.0)).toBe(2.0);
    });

    it('handles zero and small values', () => {
      expect(roundToIncrement(0)).toBe(0);
      expect(roundToIncrement(0.1)).toBe(0);
      expect(roundToIncrement(0.15)).toBe(0.25);
    });

    it('handles large values', () => {
      expect(roundToIncrement(40.37)).toBe(40.25);
      expect(roundToIncrement(40.5)).toBe(40.5);
      expect(roundToIncrement(100)).toBe(100);
    });
  });
});

describe('Membership Renewal', () => {
  describe('calculateRenewalDate', () => {
    it('calculates next annual renewal date', () => {
      const memberSince = new Date(2025, 2, 15); // March 15, 2025 local
      const renewal = calculateRenewalDate(memberSince);

      expect(renewal.getMonth()).toBe(2); // March (0-indexed)
      expect(renewal.getDate()).toBe(15);
      expect(renewal.getTime()).toBeGreaterThan(Date.now());
    });

    it('advances past current date', () => {
      const oldMember = new Date(2020, 0, 1); // January 1, 2020 local
      const renewal = calculateRenewalDate(oldMember);

      expect(renewal.getTime()).toBeGreaterThan(Date.now());
      expect(renewal.getMonth()).toBe(0); // January
      expect(renewal.getDate()).toBe(1);
    });
  });

  describe('isInReminderWindow', () => {
    // Use January dates to avoid DST boundary issues (all MST)
    it('returns reminder day when date matches', () => {
      const now = new Date(2026, 0, 1); // January 1
      const in30Days = new Date(2026, 0, 31); // January 31
      expect(isInReminderWindow(in30Days, now)).toBe(30);
    });

    it('returns 14 for 14-day window', () => {
      const now = new Date(2026, 0, 1); // January 1
      const in14Days = new Date(2026, 0, 15); // January 15
      expect(isInReminderWindow(in14Days, now)).toBe(14);
    });

    it('returns 3 for 3-day window', () => {
      const now = new Date(2026, 0, 1); // January 1
      const in3Days = new Date(2026, 0, 4); // January 4
      expect(isInReminderWindow(in3Days, now)).toBe(3);
    });

    it('returns null when not in any window', () => {
      const now = new Date(2026, 0, 1); // January 1
      const in25Days = new Date(2026, 0, 26); // January 26
      expect(isInReminderWindow(in25Days, now)).toBeNull();
    });
  });
});

describe('LMN Renewal', () => {
  describe('calculateLMNExpiry', () => {
    it('defaults to 365-day duration', () => {
      const issued = new Date(2026, 0, 1); // January 1, 2026 local
      const expiry = calculateLMNExpiry(issued);
      expect(localDateStr(expiry)).toBe('2027-01-01');
    });

    it('supports custom duration', () => {
      const issued = new Date(2026, 0, 1); // January 1, 2026 local
      const expiry = calculateLMNExpiry(issued, 90);
      expect(localDateStr(expiry)).toBe('2026-04-01');
    });
  });

  describe('getLMNReminderTier', () => {
    it('returns 60 for 60-day reminder', () => {
      const now = new Date(2026, 0, 1); // January 1
      const expiry = new Date(2026, 2, 2); // March 2 (60 days)
      expect(getLMNReminderTier(expiry, now)).toBe(60);
    });

    it('returns 30 for 30-day reminder', () => {
      const now = new Date(2026, 0, 1); // January 1
      const expiry = new Date(2026, 0, 31); // January 31 (30 days)
      expect(getLMNReminderTier(expiry, now)).toBe(30);
    });

    it('returns 60 for 50 days (within 60-day tier)', () => {
      const now = new Date(2026, 0, 1); // January 1
      const expiry = new Date(2026, 1, 20); // Feb 20 (50 days)
      expect(getLMNReminderTier(expiry, now)).toBe(60);
    });

    it('returns null when not in tier (>60 days)', () => {
      const now = new Date(2026, 0, 1); // January 1
      const expiry = new Date(2026, 5, 1); // June 1
      expect(getLMNReminderTier(expiry, now)).toBeNull();
    });
  });
});

describe('KBS Reassessment', () => {
  describe('getNextReassessmentDate', () => {
    it('returns 30-day milestone for first reassessment', () => {
      const initial = new Date(2026, 0, 1); // January 1
      const last = new Date(2026, 0, 1);
      const next = getNextReassessmentDate(initial, last, 0);
      expect(localDateStr(next)).toBe('2026-01-31');
    });

    it('returns 60-day milestone for second reassessment', () => {
      const initial = new Date(2026, 0, 1); // January 1
      const last = new Date(2026, 0, 31);
      const next = getNextReassessmentDate(initial, last, 1);
      expect(localDateStr(next)).toBe('2026-03-02');
    });

    it('returns 90-day milestone for third reassessment', () => {
      const initial = new Date(2026, 0, 1); // January 1
      const last = new Date(2026, 2, 2); // March 2
      const next = getNextReassessmentDate(initial, last, 2);
      expect(localDateStr(next)).toBe('2026-04-01');
    });

    it('returns 90 days from last for ongoing reassessments', () => {
      const initial = new Date(2026, 0, 1); // January 1
      const last = new Date(2026, 5, 15); // June 15
      const next = getNextReassessmentDate(initial, last, 3);
      expect(localDateStr(next)).toBe('2026-09-13');
    });

    it('handles multiple ongoing reassessments', () => {
      const initial = new Date(2025, 0, 1); // January 1, 2025
      const last = new Date(2026, 0, 15); // January 15, 2026
      const next = getNextReassessmentDate(initial, last, 10);
      expect(localDateStr(next)).toBe('2026-04-15');
    });
  });

  describe('isReassessmentOverdue', () => {
    it('returns false for future due date', () => {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      expect(isReassessmentOverdue(futureDate)).toBe(false);
    });

    it('returns false within grace period', () => {
      const recentPast = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(isReassessmentOverdue(recentPast, 7)).toBe(false);
    });

    it('returns true after grace period', () => {
      const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      expect(isReassessmentOverdue(oldDate, 7)).toBe(true);
    });

    it('respects custom grace days', () => {
      const date = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      expect(isReassessmentOverdue(date, 3)).toBe(true);
      expect(isReassessmentOverdue(date, 10)).toBe(false);
    });
  });
});
