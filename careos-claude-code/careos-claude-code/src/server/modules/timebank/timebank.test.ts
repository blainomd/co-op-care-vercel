/**
 * Time Bank Module Tests
 * Ledger math, matching scores, GPS boundary, nudges, Omaha coding, schemas
 */
import { describe, it, expect } from 'vitest';
import { roundCredits, computeAvailable } from './ledger.js';
import { haversineDistance, verifyGPS } from './gps-verifier.js';
import { proximityScore, computeMatchScore } from './matching.js';
import { generateDeficitNudges, checkStreakMilestone, checkBurnoutWarning } from './nudge.js';
import { autoCodeTask, getTaskTypesForProblem } from './omaha-coder.js';
import { createTaskSchema, checkOutSchema, buyCreditsSchema } from './schemas.js';
import { TIME_BANK, MATCHING_WEIGHTS } from '@shared/constants/business-rules';
import type { TimeBankBalance } from '@shared/types/timebank.types';

// ============================================================
// Credit Rounding
// ============================================================

describe('Credit Rounding', () => {
  it('rounds to 0.25 increments', () => {
    expect(roundCredits(1.0)).toBe(1.0);
    expect(roundCredits(1.1)).toBe(1.0);
    expect(roundCredits(1.13)).toBe(1.25);
    expect(roundCredits(1.25)).toBe(1.25);
    expect(roundCredits(1.37)).toBe(1.25);
    expect(roundCredits(1.38)).toBe(1.5);
    expect(roundCredits(1.5)).toBe(1.5);
    expect(roundCredits(1.75)).toBe(1.75);
    expect(roundCredits(2.0)).toBe(2.0);
  });

  it('handles zero', () => {
    expect(roundCredits(0)).toBe(0);
  });

  it('handles large values', () => {
    expect(roundCredits(40.0)).toBe(40.0);
    expect(roundCredits(40.12)).toBe(40.0);
    expect(roundCredits(40.13)).toBe(40.25);
  });
});

// ============================================================
// Balance Computation
// ============================================================

describe('Balance Computation', () => {
  it('computes available = earned + bought + donated - spent - expired + deficit', () => {
    const balance: TimeBankBalance = {
      userId: 'u1',
      earned: 50,
      spent: 10,
      bought: 5,
      donated: 2,
      expired: 3,
      deficit: 0,
      available: 0,
    };
    // 50 + 5 + 2 - 10 - 3 + 0 = 44
    expect(computeAvailable(balance)).toBe(44);
  });

  it('handles deficit', () => {
    const balance: TimeBankBalance = {
      userId: 'u1',
      earned: 10,
      spent: 25,
      bought: 0,
      donated: 0,
      expired: 0,
      deficit: -5,
      available: 0,
    };
    // 10 + 0 + 0 - 25 - 0 + (-5) = -20
    expect(computeAvailable(balance)).toBe(-20);
  });

  it('membership floor adds to available', () => {
    const balance: TimeBankBalance = {
      userId: 'u1',
      earned: 40, // membership floor
      spent: 0,
      bought: 0,
      donated: 0,
      expired: 0,
      deficit: 0,
      available: 0,
    };
    expect(computeAvailable(balance)).toBe(40);
  });
});

// ============================================================
// GPS Verification — Haversine Distance
// ============================================================

describe('GPS Verification', () => {
  // Boulder, CO: 40.0150, -105.2705
  const boulder = { latitude: 40.015, longitude: -105.2705 };

  it('same location → distance 0', () => {
    const d = haversineDistance(boulder, boulder);
    expect(d).toBe(0);
  });

  it('known distance: Boulder to Denver (~25 miles)', () => {
    const denver = { latitude: 39.7392, longitude: -104.9903 };
    const d = haversineDistance(boulder, denver);
    expect(d).toBeGreaterThan(24);
    expect(d).toBeLessThan(28);
  });

  it('very short distance (~0.1 miles)', () => {
    // Move ~0.1 miles north (0.00145 degrees latitude ≈ 0.1 miles)
    const nearby = { latitude: 40.015 + 0.00145, longitude: -105.2705 };
    const d = haversineDistance(boulder, nearby);
    expect(d).toBeGreaterThan(0.09);
    expect(d).toBeLessThan(0.12);
  });

  it('verifyGPS: within 0.25 mile threshold', () => {
    // ~0.1 miles away
    const nearby = { latitude: 40.015 + 0.00145, longitude: -105.2705 };
    const result = verifyGPS(nearby, boulder);
    expect(result.withinThreshold).toBe(true);
    expect(result.thresholdMiles).toBe(TIME_BANK.GPS_VERIFICATION_MILES);
  });

  it('verifyGPS: outside 0.25 mile threshold', () => {
    // ~0.5 miles away
    const farther = { latitude: 40.015 + 0.0072, longitude: -105.2705 };
    const result = verifyGPS(farther, boulder);
    expect(result.withinThreshold).toBe(false);
    expect(result.distanceMiles).toBeGreaterThan(0.25);
  });

  it('verifyGPS: exactly at boundary', () => {
    // ~0.25 miles = ~0.00362 degrees latitude
    const boundary = { latitude: 40.015 + 0.00362, longitude: -105.2705 };
    const result = verifyGPS(boundary, boulder);
    // Should be very close to 0.25
    expect(result.distanceMiles).toBeGreaterThan(0.24);
    expect(result.distanceMiles).toBeLessThan(0.26);
  });
});

// ============================================================
// Matching Scores
// ============================================================

describe('Proximity Scoring', () => {
  it('<0.5 miles → multiplier 3', () => {
    expect(proximityScore(0.3)).toBe(3);
  });

  it('0.5-1 mile → multiplier 2', () => {
    expect(proximityScore(0.7)).toBe(2);
  });

  it('1-2 miles → multiplier 1', () => {
    expect(proximityScore(1.5)).toBe(1);
  });

  it('>2 miles → multiplier 0 (remote only)', () => {
    expect(proximityScore(3.0)).toBe(0);
  });

  it('exactly 0.5 → multiplier 3 (inclusive)', () => {
    expect(proximityScore(0.5)).toBe(3);
  });

  it('exactly 1.0 → multiplier 2 (inclusive)', () => {
    expect(proximityScore(1.0)).toBe(2);
  });

  it('exactly 2.0 → multiplier 1 (inclusive)', () => {
    expect(proximityScore(2.0)).toBe(1);
  });
});

describe('Match Score Computation', () => {
  const taskLocation = { latitude: 40.015, longitude: -105.2705 };

  it('nearby available user with matching skill', () => {
    const candidate = {
      id: 'user1',
      location: { latitude: 40.0155, longitude: -105.271 }, // ~0.04mi
      skills: ['meals', 'rides'],
      averageRating: 4.5,
      completedTasks: 10,
      isAvailable: true,
    };
    const score = computeMatchScore(candidate, taskLocation, 'meals', 'requester1');
    expect(score.proximityScore).toBe(3); // very close
    expect(score.skillScore).toBe(1.0); // skill match
    expect(score.availabilityScore).toBe(1.0);
    expect(score.identityMatch).toBe(false);
    expect(score.totalScore).toBeGreaterThan(0);
  });

  it('identity match doubles score', () => {
    const candidate = {
      id: 'requester1', // same as requester
      location: { latitude: 40.0155, longitude: -105.271 },
      isAvailable: true,
    };
    const score = computeMatchScore(candidate, taskLocation, 'meals', 'requester1');
    expect(score.identityMatch).toBe(true);

    // Non-identity version
    const score2 = computeMatchScore(
      { ...candidate, id: 'other' },
      taskLocation,
      'meals',
      'requester1',
    );
    expect(score.totalScore).toBeCloseTo(
      score2.totalScore * MATCHING_WEIGHTS.IDENTITY_MATCH_MULTIPLIER,
      1,
    );
  });

  it('unavailable user gets availability score 0', () => {
    const candidate = {
      id: 'user1',
      location: { latitude: 40.0155, longitude: -105.271 },
      isAvailable: false,
    };
    const score = computeMatchScore(candidate, taskLocation, 'meals', 'requester1');
    expect(score.availabilityScore).toBe(0);
  });

  it('remote task ignores proximity', () => {
    const candidate = {
      id: 'user1',
      location: { latitude: 41.0, longitude: -106.0 }, // far away
      isAvailable: true,
    };
    const score = computeMatchScore(candidate, taskLocation, 'phone_companionship', 'requester1');
    expect(score.proximityScore).toBe(1.0); // remote tasks get 1.0
    expect(score.distanceMiles).toBe(0);
  });
});

// ============================================================
// Deficit Nudges
// ============================================================

describe('Deficit Nudges', () => {
  it('no nudges when balance >= 0', () => {
    expect(generateDeficitNudges(10)).toHaveLength(0);
    expect(generateDeficitNudges(0)).toHaveLength(0);
  });

  it('no nudge for small deficit (-1 to -4)', () => {
    expect(generateDeficitNudges(-3)).toHaveLength(0);
  });

  it('-5 → info level nudge', () => {
    const nudges = generateDeficitNudges(-5);
    expect(nudges).toHaveLength(1);
    expect(nudges[0]!.level).toBe('info');
    expect(nudges[0]!.deficitHours).toBe(5);
  });

  it('-10 → warning level nudge', () => {
    const nudges = generateDeficitNudges(-10);
    expect(nudges).toHaveLength(1);
    expect(nudges[0]!.level).toBe('warning');
  });

  it('-15 → urgent level nudge', () => {
    const nudges = generateDeficitNudges(-15);
    expect(nudges).toHaveLength(1);
    expect(nudges[0]!.level).toBe('urgent');
  });

  it('-20 → urgent (max deficit)', () => {
    const nudges = generateDeficitNudges(-20);
    expect(nudges).toHaveLength(1);
    expect(nudges[0]!.level).toBe('urgent');
    expect(nudges[0]!.deficitHours).toBe(20);
  });

  it('returns only the most severe nudge', () => {
    const nudges = generateDeficitNudges(-12);
    expect(nudges).toHaveLength(1);
    // -12 hits -5 (info) and -10 (warning), should return only warning
    expect(nudges[0]!.level).toBe('warning');
  });
});

// ============================================================
// Streak Milestones
// ============================================================

describe('Streak Milestones', () => {
  it('4-week milestone', () => {
    const nudge = checkStreakMilestone(4);
    expect(nudge).not.toBeNull();
    expect(nudge!.streakWeeks).toBe(4);
  });

  it('52-week milestone', () => {
    const nudge = checkStreakMilestone(52);
    expect(nudge).not.toBeNull();
    expect(nudge!.streakWeeks).toBe(52);
  });

  it('non-milestone week → null', () => {
    expect(checkStreakMilestone(3)).toBeNull();
    expect(checkStreakMilestone(5)).toBeNull();
    expect(checkStreakMilestone(25)).toBeNull();
  });

  it('all milestone weeks recognized', () => {
    for (const week of TIME_BANK.STREAK_MILESTONES_WEEKS) {
      expect(checkStreakMilestone(week)).not.toBeNull();
    }
  });
});

// ============================================================
// Burnout Warning
// ============================================================

describe('Burnout Warning', () => {
  it('no warning at threshold', () => {
    expect(checkBurnoutWarning(TIME_BANK.BURNOUT_THRESHOLD_HOURS_PER_WEEK)).toBeNull();
  });

  it('warning above threshold', () => {
    const nudge = checkBurnoutWarning(12);
    expect(nudge).not.toBeNull();
    expect(nudge!.type).toBe('burnout_warning');
  });

  it('no warning below threshold', () => {
    expect(checkBurnoutWarning(5)).toBeNull();
  });
});

// ============================================================
// Omaha Auto-Coding
// ============================================================

describe('Omaha Auto-Coding', () => {
  it('meals → Digestion-Hydration (#28)', () => {
    const coding = autoCodeTask('meals');
    expect(coding).not.toBeNull();
    expect(coding!.omahaProblemCode).toBe(28);
    expect(coding!.interventionCategory).toBe('Treatments/Procedures');
  });

  it('companionship → Social Contact (#6)', () => {
    const coding = autoCodeTask('companionship');
    expect(coding!.omahaProblemCode).toBe(6);
    expect(coding!.interventionCategory).toBe('Surveillance');
  });

  it('rides → Communication with Community Resources (#5)', () => {
    const coding = autoCodeTask('rides');
    expect(coding!.omahaProblemCode).toBe(5);
    expect(coding!.interventionCategory).toBe('Case Management');
  });

  it('yard_work → Residence (#3)', () => {
    const coding = autoCodeTask('yard_work');
    expect(coding!.omahaProblemCode).toBe(3);
  });

  it('housekeeping → Sanitation (#2)', () => {
    const coding = autoCodeTask('housekeeping');
    expect(coding!.omahaProblemCode).toBe(2);
  });

  it('teaching → null (varies by subject)', () => {
    const coding = autoCodeTask('teaching');
    expect(coding).toBeNull();
  });

  it('all non-teaching tasks have mappings', () => {
    const tasks = [
      'meals',
      'rides',
      'companionship',
      'phone_companionship',
      'tech_support',
      'yard_work',
      'housekeeping',
      'grocery_run',
      'errands',
      'pet_care',
      'admin_help',
    ] as const;
    for (const t of tasks) {
      expect(autoCodeTask(t), `${t} should have mapping`).not.toBeNull();
    }
  });

  it('reverse lookup: problem #6 → companionship + phone_companionship + pet_care', () => {
    const tasks = getTaskTypesForProblem(6);
    expect(tasks).toContain('companionship');
    expect(tasks).toContain('phone_companionship');
    expect(tasks).toContain('pet_care');
  });
});

// ============================================================
// Schema Validation
// ============================================================

describe('Time Bank Schemas', () => {
  describe('createTaskSchema', () => {
    it('accepts valid task', () => {
      const result = createTaskSchema.safeParse({
        taskType: 'meals',
        title: 'Deliver meals to Mrs. Johnson',
        location: { latitude: 40.015, longitude: -105.27 },
        estimatedHours: 2,
      });
      expect(result.success).toBe(true);
    });

    it('rejects estimatedHours < 0.25', () => {
      const result = createTaskSchema.safeParse({
        taskType: 'meals',
        title: 'Quick task',
        location: { latitude: 40.015, longitude: -105.27 },
        estimatedHours: 0.1,
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid task type', () => {
      const result = createTaskSchema.safeParse({
        taskType: 'skydiving',
        title: 'Fun task',
        location: { latitude: 40.015, longitude: -105.27 },
        estimatedHours: 1,
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid GPS coordinates', () => {
      const result = createTaskSchema.safeParse({
        taskType: 'meals',
        title: 'Test',
        location: { latitude: 91, longitude: -105.27 },
        estimatedHours: 1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('checkOutSchema', () => {
    it('accepts valid check-out', () => {
      const result = checkOutSchema.safeParse({
        taskId: 'task:123',
        location: { latitude: 40.015, longitude: -105.27 },
        actualHours: 2.5,
        rating: 5,
        gratitudeNote: 'Thank you so much!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects rating > 5', () => {
      const result = checkOutSchema.safeParse({
        taskId: 'task:123',
        location: { latitude: 40.015, longitude: -105.27 },
        actualHours: 2,
        rating: 6,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('buyCreditsSchema', () => {
    it('accepts valid purchase', () => {
      const result = buyCreditsSchema.safeParse({ hours: 10 });
      expect(result.success).toBe(true);
    });

    it('rejects < 1 hour', () => {
      const result = buyCreditsSchema.safeParse({ hours: 0.5 });
      expect(result.success).toBe(false);
    });

    it('rejects > 100 hours', () => {
      const result = buyCreditsSchema.safeParse({ hours: 101 });
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================
// Business Rule Constants
// ============================================================

describe('Time Bank Constants', () => {
  it('membership floor is 40 hours', () => {
    expect(TIME_BANK.MEMBERSHIP_FLOOR_HOURS).toBe(40);
  });

  it('cash rate is $15/hr', () => {
    expect(TIME_BANK.CASH_RATE_CENTS_PER_HOUR).toBe(1500);
  });

  it('respite split: $12 coordination + $3 respite = $15', () => {
    expect(TIME_BANK.CASH_COORDINATION_SPLIT_CENTS + TIME_BANK.CASH_RESPITE_SPLIT_CENTS).toBe(1500);
  });

  it('respite default: 0.9 + 0.1 = 1.0', () => {
    expect(TIME_BANK.RESPITE_DEFAULT_MEMBER_RATIO + TIME_BANK.RESPITE_DEFAULT_FUND_RATIO).toBe(1.0);
  });

  it('deficit max is -20', () => {
    expect(TIME_BANK.DEFICIT_MAX_HOURS).toBe(-20);
  });

  it('GPS threshold is 0.25 miles', () => {
    expect(TIME_BANK.GPS_VERIFICATION_MILES).toBe(0.25);
  });

  it('credit rounding is 0.25', () => {
    expect(TIME_BANK.CREDIT_ROUNDING_INCREMENT).toBe(0.25);
  });

  it('4 deficit nudge thresholds', () => {
    expect(TIME_BANK.DEFICIT_NUDGE_THRESHOLDS).toHaveLength(4);
  });

  it('5 streak milestones', () => {
    expect(TIME_BANK.STREAK_MILESTONES_WEEKS).toHaveLength(5);
  });
});
