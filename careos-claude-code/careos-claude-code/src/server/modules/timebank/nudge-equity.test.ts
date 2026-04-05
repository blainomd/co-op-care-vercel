/**
 * Session 24 Tests — Behavioral Nudges (extended) + Equity Tracking
 *
 * Nudge extensions: referral_prompt, credit_expiry_warning
 * Equity: vesting schedule, patronage dividends, equity position, projections
 */
import { describe, it, expect } from 'vitest';
import {
  generateDeficitNudges,
  checkStreakMilestone,
  checkBurnoutWarning,
  checkReferralPrompt,
  checkCreditExpiryWarning,
} from './nudge.js';
import { equityService } from './equity.js';
import { TIME_BANK, FINANCIALS } from '@shared/constants/business-rules';

// ============================================================
// Referral Prompt Nudge
// ============================================================

describe('Nudge: Referral Prompt', () => {
  it('returns null before 3rd task', () => {
    expect(checkReferralPrompt(0, 'CODE1')).toBeNull();
    expect(checkReferralPrompt(1, 'CODE1')).toBeNull();
    expect(checkReferralPrompt(2, 'CODE1')).toBeNull();
  });

  it('triggers at exactly 3 completed tasks', () => {
    const nudge = checkReferralPrompt(3, 'CARE-ABC');
    expect(nudge).not.toBeNull();
    expect(nudge!.type).toBe('referral_prompt');
    expect(nudge!.level).toBe('info');
    expect(nudge!.referralCode).toBe('CARE-ABC');
  });

  it('returns null after 3rd task (show only once)', () => {
    expect(checkReferralPrompt(4, 'CODE1')).toBeNull();
    expect(checkReferralPrompt(10, 'CODE1')).toBeNull();
    expect(checkReferralPrompt(100, 'CODE1')).toBeNull();
  });

  it('includes bonus hours in message', () => {
    const nudge = checkReferralPrompt(3, 'XYZ');
    expect(nudge!.message).toContain(`${TIME_BANK.REFERRAL_BONUS_HOURS}`);
  });

  it('includes referral code in message', () => {
    const nudge = checkReferralPrompt(3, 'MY-CODE');
    expect(nudge!.message).toContain('referral code');
  });
});

// ============================================================
// Credit Expiry Warning Nudge
// ============================================================

describe('Nudge: Credit Expiry Warning', () => {
  it('returns null when no hours expiring', () => {
    expect(checkCreditExpiryWarning(0, '2026-04-01')).toBeNull();
    expect(checkCreditExpiryWarning(-1, '2026-04-01')).toBeNull();
  });

  it('returns null when expiry is far away (>30 days)', () => {
    const farFuture = new Date();
    farFuture.setDate(farFuture.getDate() + 60);
    expect(checkCreditExpiryWarning(5, farFuture.toISOString())).toBeNull();
  });

  it('returns null when expiry date is in the past', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    expect(checkCreditExpiryWarning(5, pastDate.toISOString())).toBeNull();
  });

  it('returns info level for 15-30 days away', () => {
    const d = new Date();
    d.setDate(d.getDate() + 20);
    const nudge = checkCreditExpiryWarning(3, d.toISOString());
    expect(nudge).not.toBeNull();
    expect(nudge!.level).toBe('info');
    expect(nudge!.type).toBe('credit_expiry_warning');
  });

  it('returns warning level for 8-14 days away', () => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    const nudge = checkCreditExpiryWarning(3, d.toISOString());
    expect(nudge).not.toBeNull();
    expect(nudge!.level).toBe('warning');
  });

  it('returns urgent level for <=7 days away', () => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    const nudge = checkCreditExpiryWarning(3, d.toISOString());
    expect(nudge).not.toBeNull();
    expect(nudge!.level).toBe('urgent');
  });

  it('includes expiring hours in result', () => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    const nudge = checkCreditExpiryWarning(7.5, d.toISOString());
    expect(nudge!.expiringHours).toBe(7.5);
  });

  it('includes expiry date in result', () => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    const nudge = checkCreditExpiryWarning(3, d.toISOString());
    expect(nudge!.expiryDate).toBe(d.toISOString());
  });

  it('boundary: exactly 30 days', () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    const nudge = checkCreditExpiryWarning(5, d.toISOString());
    expect(nudge).not.toBeNull();
    expect(nudge!.level).toBe('info');
  });

  it('boundary: exactly 7 days', () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const nudge = checkCreditExpiryWarning(5, d.toISOString());
    expect(nudge).not.toBeNull();
    expect(nudge!.level).toBe('urgent');
  });
});

// ============================================================
// Existing nudges still work
// ============================================================

describe('Nudge: Deficit (regression)', () => {
  it('no nudge when balance positive', () => {
    expect(generateDeficitNudges(10)).toEqual([]);
  });

  it('returns most severe deficit nudge', () => {
    const nudges = generateDeficitNudges(-15);
    expect(nudges.length).toBe(1);
    expect(nudges[0]!.level).toBe('urgent');
    expect(nudges[0]!.deficitHours).toBe(15);
  });
});

describe('Nudge: Streak (regression)', () => {
  it('returns null for non-milestone weeks', () => {
    expect(checkStreakMilestone(3)).toBeNull();
    expect(checkStreakMilestone(5)).toBeNull();
  });

  it('returns milestone at 4 weeks', () => {
    const nudge = checkStreakMilestone(4);
    expect(nudge).not.toBeNull();
    expect(nudge!.type).toBe('streak_milestone');
    expect(nudge!.streakWeeks).toBe(4);
  });
});

describe('Nudge: Burnout (regression)', () => {
  it('no warning at or below threshold', () => {
    expect(checkBurnoutWarning(10)).toBeNull();
    expect(checkBurnoutWarning(8)).toBeNull();
  });

  it('warns above threshold', () => {
    const nudge = checkBurnoutWarning(12);
    expect(nudge).not.toBeNull();
    expect(nudge!.type).toBe('burnout_warning');
  });
});

// ============================================================
// Equity: Vesting Schedule
// ============================================================

describe('Equity: Vesting', () => {
  const { calculateVesting, VESTING_YEARS, VESTING_PER_YEAR_PERCENT } = equityService;

  it('constants are correct', () => {
    expect(VESTING_YEARS).toBe(5);
    expect(VESTING_PER_YEAR_PERCENT).toBe(20);
  });

  it('before cliff (< 1 year): 0% vested', () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const result = calculateVesting(sixMonthsAgo.toISOString(), 1000000);
    expect(result.vestingPercentage).toBe(0);
    expect(result.vestedCents).toBe(0);
    expect(result.unvestedCents).toBe(1000000);
    expect(result.fullyVested).toBe(false);
  });

  it('at 1 year: 20% vested', () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setMonth(oneYearAgo.getMonth() - 1); // safely past 1 year
    const result = calculateVesting(oneYearAgo.toISOString(), 1000000);
    expect(result.vestingPercentage).toBe(20);
    expect(result.vestedCents).toBe(200000);
    expect(result.yearsCompleted).toBe(1);
  });

  it('at 3 years: 60% vested', () => {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    threeYearsAgo.setMonth(threeYearsAgo.getMonth() - 1);
    const result = calculateVesting(threeYearsAgo.toISOString(), 1000000);
    expect(result.vestingPercentage).toBe(60);
    expect(result.vestedCents).toBe(600000);
  });

  it('at 5+ years: 100% vested', () => {
    const sixYearsAgo = new Date();
    sixYearsAgo.setFullYear(sixYearsAgo.getFullYear() - 6);
    const result = calculateVesting(sixYearsAgo.toISOString(), 1000000);
    expect(result.vestingPercentage).toBe(100);
    expect(result.vestedCents).toBe(1000000);
    expect(result.unvestedCents).toBe(0);
    expect(result.fullyVested).toBe(true);
    expect(result.nextVestingDate).toBeNull();
  });

  it('milestones array has 5 entries', () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setMonth(oneYearAgo.getMonth() - 1);
    const result = calculateVesting(oneYearAgo.toISOString(), 1000000);
    expect(result.yearsMilestones.length).toBe(5);
    expect(result.yearsMilestones[0]!.status).toBe('completed');
    expect(result.yearsMilestones[1]!.status).toBe('current');
    expect(result.yearsMilestones[2]!.status).toBe('future');
  });

  it('zero equity vests correctly', () => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    twoYearsAgo.setMonth(twoYearsAgo.getMonth() - 1);
    const result = calculateVesting(twoYearsAgo.toISOString(), 0);
    expect(result.vestingPercentage).toBe(40);
    expect(result.vestedCents).toBe(0);
    expect(result.unvestedCents).toBe(0);
  });
});

// ============================================================
// Equity: Patronage Dividends
// ============================================================

describe('Equity: Patronage Dividends', () => {
  const { calculatePatronageDividend, MIN_CASH_DISTRIBUTION_PERCENT } = equityService;

  const coopFinancials = {
    totalRevenueCents: 50000000,
    totalExpensesCents: 40000000,
    surplusCents: 10000000,
    memberCount: 10,
    totalPatronageHours: 15000,
  };

  it('minimum cash distribution is 20%', () => {
    expect(MIN_CASH_DISTRIBUTION_PERCENT).toBe(20);
  });

  it('calculates patronage ratio correctly', () => {
    const result = calculatePatronageDividend(2025, 1500, coopFinancials);
    expect(result.patronageRatio).toBe(0.1);
    expect(result.memberShareCents).toBe(1000000); // 10% of 10M
  });

  it('splits cash and retained equity at 20/80 default', () => {
    const result = calculatePatronageDividend(2025, 1500, coopFinancials);
    expect(result.paidCashCents).toBe(200000); // 20% of 1M
    expect(result.retainedEquityCents).toBe(800000); // 80% of 1M
    expect(result.cashPercentage).toBe(20);
  });

  it('respects custom cash percentage above minimum', () => {
    const result = calculatePatronageDividend(2025, 1500, coopFinancials, 50);
    expect(result.paidCashCents).toBe(500000);
    expect(result.retainedEquityCents).toBe(500000);
    expect(result.cashPercentage).toBe(50);
  });

  it('enforces minimum 20% even when lower requested', () => {
    const result = calculatePatronageDividend(2025, 1500, coopFinancials, 10);
    expect(result.cashPercentage).toBe(20);
    expect(result.paidCashCents).toBe(200000);
  });

  it('handles zero patronage hours', () => {
    const zeroCoop = { ...coopFinancials, totalPatronageHours: 0 };
    const result = calculatePatronageDividend(2025, 0, zeroCoop);
    expect(result.memberShareCents).toBe(0);
    expect(result.paidCashCents).toBe(0);
    expect(result.retainedEquityCents).toBe(0);
  });

  it('handles negative surplus (no dividend)', () => {
    const lossCoop = { ...coopFinancials, surplusCents: -500000 };
    const result = calculatePatronageDividend(2025, 1500, lossCoop);
    expect(result.memberShareCents).toBe(0);
    expect(result.paidCashCents).toBe(0);
    expect(result.retainedEquityCents).toBe(0);
  });

  it('handles zero surplus', () => {
    const zeroCoop = { ...coopFinancials, surplusCents: 0 };
    const result = calculatePatronageDividend(2025, 1500, zeroCoop);
    expect(result.memberShareCents).toBe(0);
  });

  it('higher patronage hours = larger share', () => {
    const low = calculatePatronageDividend(2025, 500, coopFinancials);
    const high = calculatePatronageDividend(2025, 3000, coopFinancials);
    expect(high.memberShareCents).toBeGreaterThan(low.memberShareCents);
  });

  it('cash + retained = total share', () => {
    const result = calculatePatronageDividend(2025, 1500, coopFinancials);
    expect(result.paidCashCents + result.retainedEquityCents).toBe(result.memberShareCents);
  });
});

// ============================================================
// Equity: Position Building
// ============================================================

describe('Equity: Position Building', () => {
  const { buildEquityPosition } = equityService;

  it('computes total equity from dividends', () => {
    const dividends = [
      {
        year: 2024,
        totalPatronageHours: 1000,
        coopSurplusCents: 5000000,
        memberShareCents: 500000,
        patronageRatio: 0.1,
        paidCashCents: 100000,
        retainedEquityCents: 400000,
        cashPercentage: 20,
      },
      {
        year: 2025,
        totalPatronageHours: 1200,
        coopSurplusCents: 6000000,
        memberShareCents: 600000,
        patronageRatio: 0.1,
        paidCashCents: 120000,
        retainedEquityCents: 480000,
        cashPercentage: 20,
      },
    ];
    const position = buildEquityPosition('user1', '2024-01-15', dividends, 500);
    expect(position.totalEquityCents).toBe(880000); // 400K + 480K
    expect(position.memberId).toBe('user1');
  });

  it('computes hourly equity rate based on target', () => {
    const position = buildEquityPosition('user1', '2024-01-15', [], 1000);
    // WORKER_EQUITY_5YR_CENTS / 5 / 1500
    const expectedRate = Math.round(FINANCIALS.WORKER_EQUITY_5YR_CENTS / 5 / 1500);
    expect(position.hourlyEquityRateCents).toBe(expectedRate);
  });

  it('estimated annual dividend based on current hours', () => {
    const position = buildEquityPosition('user1', '2024-01-15', [], 750);
    expect(position.estimatedAnnualDividendCents).toBe(750 * position.hourlyEquityRateCents);
  });
});

// ============================================================
// Equity: Growth Projections
// ============================================================

describe('Equity: Growth Projections', () => {
  const { projectEquityGrowth } = equityService;

  it('projects correct number of years', () => {
    const projections = projectEquityGrowth(100000, 50000, 4);
    expect(projections.length).toBe(4);
  });

  it('accumulates linearly', () => {
    const projections = projectEquityGrowth(100000, 50000, 3);
    expect(projections[0]!.projectedCents).toBe(150000);
    expect(projections[1]!.projectedCents).toBe(200000);
    expect(projections[2]!.projectedCents).toBe(250000);
  });

  it('handles zero annual retained', () => {
    const projections = projectEquityGrowth(100000, 0, 2);
    expect(projections[0]!.projectedCents).toBe(100000);
    expect(projections[1]!.projectedCents).toBe(100000);
  });

  it('handles zero current equity', () => {
    const projections = projectEquityGrowth(0, 50000, 2);
    expect(projections[0]!.projectedCents).toBe(50000);
    expect(projections[1]!.projectedCents).toBe(100000);
  });

  it('year numbers are sequential from 1', () => {
    const projections = projectEquityGrowth(0, 10000, 3);
    expect(projections[0]!.year).toBe(1);
    expect(projections[1]!.year).toBe(2);
    expect(projections[2]!.year).toBe(3);
  });
});

// ============================================================
// Financial Constants
// ============================================================

describe('Equity: Financial Constants', () => {
  it('worker equity 5-year target is $52K', () => {
    expect(FINANCIALS.WORKER_EQUITY_5YR_CENTS).toBe(5200000);
  });

  it('worker-owner wage range is $25-28/hr', () => {
    expect(FINANCIALS.WORKER_OWNER_WAGE_MIN_CENTS).toBe(2500);
    expect(FINANCIALS.WORKER_OWNER_WAGE_MAX_CENTS).toBe(2800);
  });

  it('referral bonus is 5 hours', () => {
    expect(TIME_BANK.REFERRAL_BONUS_HOURS).toBe(5);
  });

  it('expiry warning is 30 days', () => {
    expect(TIME_BANK.EXPIRY_WARNING_DAYS).toBe(30);
  });
});
