/**
 * Worker-Owner Equity Service — Subchapter T Patronage Dividends + Vesting
 *
 * Cooperative economics: worker-owners earn equity through patronage
 * (hours worked). Under Subchapter T of the Internal Revenue Code,
 * cooperatives distribute surplus based on patronage rather than
 * capital contribution.
 *
 * Vesting: 5-year schedule reaching ~$52K (WORKER_EQUITY_5YR_CENTS).
 * Linear vesting with cliff at Year 1 (20% per year).
 *
 * NOTE: Warm, transparent language. Workers see exactly how their
 * equity grows with every hour of care they provide.
 */
import { FINANCIALS } from '@shared/constants/business-rules';

// ── Types ────────────────────────────────────────────────

export interface VestingSchedule {
  totalEquityCents: number;
  vestedCents: number;
  unvestedCents: number;
  vestingPercentage: number;
  yearsCompleted: number;
  yearsMilestones: VestingMilestone[];
  nextVestingDate: string | null;
  fullyVested: boolean;
}

export interface VestingMilestone {
  year: number;
  percentageVested: number;
  amountCents: number;
  status: 'completed' | 'current' | 'future';
}

export interface PatronageDividend {
  year: number;
  totalPatronageHours: number;
  coopSurplusCents: number;
  memberShareCents: number;
  patronageRatio: number;
  paidCashCents: number;
  retainedEquityCents: number;
  cashPercentage: number;
}

export interface EquityPosition {
  memberId: string;
  memberSince: string;
  totalEquityCents: number;
  vestedEquityCents: number;
  patronageDividends: PatronageDividend[];
  vestingSchedule: VestingSchedule;
  estimatedAnnualDividendCents: number;
  hourlyEquityRateCents: number;
}

export interface CoopFinancials {
  totalRevenueCents: number;
  totalExpensesCents: number;
  surplusCents: number;
  memberCount: number;
  totalPatronageHours: number;
}

// ── Constants ────────────────────────────────────────────

const VESTING_YEARS = 5;
const VESTING_CLIFF_YEARS = 1;
const VESTING_PER_YEAR_PERCENT = 20; // Linear: 20% per year over 5 years

/**
 * Subchapter T requires cooperatives to distribute at least 20% of
 * patronage dividends in cash within 8.5 months of fiscal year end.
 * The rest can be retained as equity (qualified written notice).
 */
const MIN_CASH_DISTRIBUTION_PERCENT = 20;

// ── Vesting Logic ────────────────────────────────────────

/**
 * Calculate vesting schedule for a worker-owner.
 *
 * @param memberSince - ISO date when membership started
 * @param totalEquityCents - Total accumulated equity (retained dividends + initial)
 */
export function calculateVesting(memberSince: string, totalEquityCents: number): VestingSchedule {
  const startDate = new Date(memberSince);
  const now = new Date();
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const yearsElapsed = (now.getTime() - startDate.getTime()) / msPerYear;
  const yearsCompleted = Math.min(Math.floor(yearsElapsed), VESTING_YEARS);

  // Before cliff: 0% vested
  const vestingPercentage =
    yearsCompleted < VESTING_CLIFF_YEARS
      ? 0
      : Math.min(yearsCompleted * VESTING_PER_YEAR_PERCENT, 100);

  const vestedCents = Math.round((totalEquityCents * vestingPercentage) / 100);
  const unvestedCents = totalEquityCents - vestedCents;
  const fullyVested = vestingPercentage >= 100;

  // Build milestones
  const yearsMilestones: VestingMilestone[] = [];
  for (let y = 1; y <= VESTING_YEARS; y++) {
    const pct = y * VESTING_PER_YEAR_PERCENT;
    const amt = Math.round((totalEquityCents * pct) / 100);
    yearsMilestones.push({
      year: y,
      percentageVested: pct,
      amountCents: amt,
      status: y <= yearsCompleted ? 'completed' : y === yearsCompleted + 1 ? 'current' : 'future',
    });
  }

  // Next vesting date
  let nextVestingDate: string | null = null;
  if (!fullyVested) {
    const nextYear = yearsCompleted + 1;
    const next = new Date(startDate);
    next.setFullYear(next.getFullYear() + nextYear);
    nextVestingDate = next.toISOString().split('T')[0]!;
  }

  return {
    totalEquityCents,
    vestedCents,
    unvestedCents,
    vestingPercentage,
    yearsCompleted,
    yearsMilestones,
    nextVestingDate,
    fullyVested,
  };
}

// ── Patronage Dividend Logic ─────────────────────────────

/**
 * Calculate a member's patronage dividend for a given year.
 *
 * Subchapter T formula:
 *   memberShare = coopSurplus × (memberHours / totalPatronageHours)
 *   cashPortion = memberShare × cashPercentage (min 20%)
 *   retainedEquity = memberShare - cashPortion
 */
export function calculatePatronageDividend(
  year: number,
  memberHours: number,
  coopFinancials: CoopFinancials,
  cashPercentage: number = MIN_CASH_DISTRIBUTION_PERCENT,
): PatronageDividend {
  const effectiveCashPct = Math.max(cashPercentage, MIN_CASH_DISTRIBUTION_PERCENT);

  if (coopFinancials.totalPatronageHours === 0 || coopFinancials.surplusCents <= 0) {
    return {
      year,
      totalPatronageHours: memberHours,
      coopSurplusCents: coopFinancials.surplusCents,
      memberShareCents: 0,
      patronageRatio: 0,
      paidCashCents: 0,
      retainedEquityCents: 0,
      cashPercentage: effectiveCashPct,
    };
  }

  const patronageRatio = memberHours / coopFinancials.totalPatronageHours;
  const memberShareCents = Math.round(coopFinancials.surplusCents * patronageRatio);
  const paidCashCents = Math.round((memberShareCents * effectiveCashPct) / 100);
  const retainedEquityCents = memberShareCents - paidCashCents;

  return {
    year,
    totalPatronageHours: memberHours,
    coopSurplusCents: coopFinancials.surplusCents,
    memberShareCents,
    patronageRatio: Math.round(patronageRatio * 10000) / 10000,
    paidCashCents,
    retainedEquityCents,
    cashPercentage: effectiveCashPct,
  };
}

// ── Equity Position ──────────────────────────────────────

/**
 * Build a complete equity position for a worker-owner.
 */
export function buildEquityPosition(
  memberId: string,
  memberSince: string,
  patronageDividends: PatronageDividend[],
  currentAnnualHours: number,
): EquityPosition {
  // Total equity = sum of all retained dividends
  const totalEquityCents = patronageDividends.reduce((sum, d) => sum + d.retainedEquityCents, 0);

  const vestingSchedule = calculateVesting(memberSince, totalEquityCents);

  // Estimate annual dividend based on current pace
  // Using the 5-year target as a reference for hourly equity rate
  const targetHoursPerYear = 1500; // ~30 hrs/week, 50 weeks
  const annualEquityTarget = FINANCIALS.WORKER_EQUITY_5YR_CENTS / VESTING_YEARS;
  const hourlyEquityRateCents =
    targetHoursPerYear > 0 ? Math.round(annualEquityTarget / targetHoursPerYear) : 0;
  const estimatedAnnualDividendCents = Math.round(currentAnnualHours * hourlyEquityRateCents);

  return {
    memberId,
    memberSince,
    totalEquityCents,
    vestedEquityCents: vestingSchedule.vestedCents,
    patronageDividends,
    vestingSchedule,
    estimatedAnnualDividendCents,
    hourlyEquityRateCents,
  };
}

/**
 * Project equity growth over remaining vesting period.
 * Returns projected equity at each year mark assuming steady hours.
 */
export function projectEquityGrowth(
  currentEquityCents: number,
  annualRetainedCents: number,
  yearsRemaining: number,
): { year: number; projectedCents: number }[] {
  const projections: { year: number; projectedCents: number }[] = [];
  for (let y = 1; y <= yearsRemaining; y++) {
    projections.push({
      year: y,
      projectedCents: currentEquityCents + annualRetainedCents * y,
    });
  }
  return projections;
}

export const equityService = {
  VESTING_YEARS,
  VESTING_CLIFF_YEARS,
  VESTING_PER_YEAR_PERCENT,
  MIN_CASH_DISTRIBUTION_PERCENT,
  calculateVesting,
  calculatePatronageDividend,
  buildEquityPosition,
  projectEquityGrowth,
};
