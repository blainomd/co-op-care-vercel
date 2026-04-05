import { describe, it, expect } from 'vitest';
import {
  CII_DIMENSIONS,
  CII_DIMENSION_COUNT,
  CII_MAX_SCORE,
  classifyCIIZone,
  classifyMiniCIIZone,
  MINI_CII_DIMENSIONS,
  MINI_CII_MAX_SCORE,
  TIME_BANK,
  MATCHING_WEIGHTS,
  TASK_TYPES,
  USER_ROLES,
  ROLES_REQUIRING_2FA,
} from './business-rules';

describe('CII Zone Classification', () => {
  it('has exactly 12 dimensions', () => {
    expect(CII_DIMENSIONS).toHaveLength(CII_DIMENSION_COUNT);
  });

  it('max score is 120 (12 dimensions × 10)', () => {
    expect(CII_MAX_SCORE).toBe(120);
  });

  it('classifies Green zone (≤40)', () => {
    expect(classifyCIIZone(0)).toBe('GREEN');
    expect(classifyCIIZone(12)).toBe('GREEN');
    expect(classifyCIIZone(40)).toBe('GREEN');
  });

  it('classifies Yellow zone (41-79)', () => {
    expect(classifyCIIZone(41)).toBe('YELLOW');
    expect(classifyCIIZone(60)).toBe('YELLOW');
    expect(classifyCIIZone(79)).toBe('YELLOW');
  });

  it('classifies Red zone (≥80)', () => {
    expect(classifyCIIZone(80)).toBe('RED');
    expect(classifyCIIZone(100)).toBe('RED');
    expect(classifyCIIZone(120)).toBe('RED');
  });
});

describe('Mini CII Zone Classification', () => {
  it('has exactly 3 dimensions', () => {
    expect(MINI_CII_DIMENSIONS).toHaveLength(3);
  });

  it('max score is 30', () => {
    expect(MINI_CII_MAX_SCORE).toBe(30);
  });

  it('classifies Green zone (≤11)', () => {
    expect(classifyMiniCIIZone(3)).toBe('GREEN');
    expect(classifyMiniCIIZone(11)).toBe('GREEN');
  });

  it('classifies Yellow zone (12-20)', () => {
    expect(classifyMiniCIIZone(12)).toBe('YELLOW');
    expect(classifyMiniCIIZone(20)).toBe('YELLOW');
  });

  it('classifies Red zone (≥21)', () => {
    expect(classifyMiniCIIZone(21)).toBe('RED');
    expect(classifyMiniCIIZone(30)).toBe('RED');
  });
});

describe('Time Bank Constants', () => {
  it('membership floor is 40 hours', () => {
    expect(TIME_BANK.MEMBERSHIP_FLOOR_HOURS).toBe(40);
  });

  it('cash rate is $15/hr ($12 coord + $3 respite)', () => {
    expect(TIME_BANK.CASH_RATE_CENTS_PER_HOUR).toBe(1500);
    expect(TIME_BANK.CASH_COORDINATION_SPLIT_CENTS + TIME_BANK.CASH_RESPITE_SPLIT_CENTS).toBe(1500);
  });

  it('Respite Default is 0.9/0.1 split', () => {
    expect(TIME_BANK.RESPITE_DEFAULT_MEMBER_RATIO + TIME_BANK.RESPITE_DEFAULT_FUND_RATIO).toBe(1);
  });

  it('deficit max is -20 hours', () => {
    expect(TIME_BANK.DEFICIT_MAX_HOURS).toBe(-20);
  });

  it('GPS verification is 0.25 miles', () => {
    expect(TIME_BANK.GPS_VERIFICATION_MILES).toBe(0.25);
  });

  it('streak milestones are 4/8/12/26/52 weeks', () => {
    expect(TIME_BANK.STREAK_MILESTONES_WEEKS).toEqual([4, 8, 12, 26, 52]);
  });
});

describe('Matching Weights', () => {
  it('identity match is 2x multiplier', () => {
    expect(MATCHING_WEIGHTS.IDENTITY_MATCH_MULTIPLIER).toBe(2);
  });

  it('proximity tiers decrease with distance', () => {
    const multipliers = MATCHING_WEIGHTS.PROXIMITY_TIERS.map((t) => t.multiplier);
    expect(multipliers).toEqual([3, 2, 1, 0]);
  });
});

describe('Role System', () => {
  it('has 7 roles', () => {
    expect(USER_ROLES).toHaveLength(7);
  });

  it('requires 2FA for medical_director and admin', () => {
    expect(ROLES_REQUIRING_2FA).toContain('medical_director');
    expect(ROLES_REQUIRING_2FA).toContain('admin');
    expect(ROLES_REQUIRING_2FA).toHaveLength(2);
  });
});

describe('Task Types', () => {
  it('has 12 task types', () => {
    expect(TASK_TYPES).toHaveLength(12);
  });

  it('includes core task types', () => {
    expect(TASK_TYPES).toContain('meals');
    expect(TASK_TYPES).toContain('companionship');
    expect(TASK_TYPES).toContain('rides');
  });
});
