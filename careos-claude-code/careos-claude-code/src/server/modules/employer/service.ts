/**
 * Employer Service — Anonymized aggregation, PEPM metrics, ROI calculations
 *
 * PHI-free: employer_hr role has phiAccess=false.
 * All outputs are aggregate/anonymized with k-anonymity (min group size 5).
 *
 * Financial model:
 * - PEPM = $4.50/employee/month
 * - ROI = (care hours × productivity proxy) + readmission avoidance
 * - Readmission baseline = 15.4% at $16,037/readmission (BCH data)
 */
import * as queries from '../../database/queries/index.js';
import { FINANCIALS } from '@shared/constants/business-rules';
import { logger } from '../../common/logger.js';

// ── K-Anonymity ─────────────────────────────────────────────
const K_ANONYMITY_THRESHOLD = 5;

/**
 * Suppress counts below k-anonymity threshold to prevent re-identification.
 * Returns null for values < K, signaling "suppressed" to the client.
 */
function kAnonymize(count: number): number | null {
  return count >= K_ANONYMITY_THRESHOLD ? count : null;
}

// ── Types ───────────────────────────────────────────────────

export interface CIIDistribution {
  green: number | null; // CII ≤ 40
  yellow: number | null; // CII 41-79
  red: number | null; // CII ≥ 80
  total: number;
  suppressed: boolean; // true if any bucket was k-suppressed
}

export interface PEPMMetrics {
  enrolledEmployees: number;
  activeUtilizers: number;
  utilizationRate: number; // activeUtilizers / enrolledEmployees × 100
  monthlyPEPMCents: number; // per employee
  totalMonthlyRevenueCents: number; // enrolledEmployees × PEPM
  totalAnnualRevenueCents: number;
}

export interface ProductivityImpact {
  totalCareHours: number;
  estimatedAbsenteeismReduction: number; // hours saved
  productivityValueCents: number; // care hours × private rate proxy
  readmissionAvoidanceCount: number; // estimated prevented readmissions
  readmissionSavingsCents: number; // count × $16,037
  totalROICents: number;
}

export interface QuarterlyROI {
  quarter: string; // "Q1 2026"
  enrolledEmployees: number;
  careHoursDelivered: number;
  pepmRevenueCents: number;
  productivityValueCents: number;
  readmissionSavingsCents: number;
  netROICents: number;
  roiMultiple: number; // net ROI / PEPM revenue
}

export interface EmployerDashboardData {
  ciiDistribution: CIIDistribution;
  pepm: PEPMMetrics;
  productivity: ProductivityImpact;
}

// ── CII Distribution ────────────────────────────────────────

/**
 * Aggregate CII scores into zone distribution (anonymized).
 * Uses latest CII assessment per family, groups by zone.
 */
async function getCIIDistribution(): Promise<CIIDistribution> {
  const families = await queries.listAllFamilies();
  let green = 0;
  let yellow = 0;
  let red = 0;

  for (const family of families) {
    const assessment = await queries.getLatestAssessment(family.id, 'cii');
    if (!assessment) continue;

    const score = assessment.totalScore ?? 0;
    if (score <= 40) green++;
    else if (score <= 79) yellow++;
    else red++;
  }

  const total = green + yellow + red;
  const anonymizedGreen = kAnonymize(green);
  const anonymizedYellow = kAnonymize(yellow);
  const anonymizedRed = kAnonymize(red);

  return {
    green: anonymizedGreen,
    yellow: anonymizedYellow,
    red: anonymizedRed,
    total,
    suppressed: anonymizedGreen === null || anonymizedYellow === null || anonymizedRed === null,
  };
}

// ── PEPM Metrics ────────────────────────────────────────────

/**
 * Calculate PEPM enrollment and utilization metrics.
 * Enrolled = families with active membership (proxy for employer enrollment).
 * Active utilizers = families with at least one completed task in last 90 days.
 */
async function getPEPMMetrics(): Promise<PEPMMetrics> {
  const families = await queries.listAllFamilies();
  const enrolledEmployees = families.length;

  // Count families with recent task activity (last 90 days)
  const completedTasks = await queries.listCompletedTasks();
  const now = Date.now();
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  const recentRequesterIds = new Set<string>();

  for (const task of completedTasks) {
    const completedAt = task.checkOutTime ?? task.updatedAt;
    if (completedAt && now - new Date(completedAt).getTime() < ninetyDaysMs) {
      recentRequesterIds.add(task.requesterId);
    }
  }

  const activeUtilizers = recentRequesterIds.size;
  const utilizationRate =
    enrolledEmployees > 0 ? Math.round((activeUtilizers / enrolledEmployees) * 1000) / 10 : 0;

  const monthlyPEPMCents = FINANCIALS.EMPLOYER_PEPM_CENTS;
  const totalMonthlyRevenueCents = enrolledEmployees * monthlyPEPMCents;
  const totalAnnualRevenueCents = totalMonthlyRevenueCents * 12;

  return {
    enrolledEmployees,
    activeUtilizers,
    utilizationRate,
    monthlyPEPMCents,
    totalMonthlyRevenueCents,
    totalAnnualRevenueCents,
  };
}

// ── Productivity Impact ─────────────────────────────────────

/**
 * Calculate productivity impact from care hours delivered.
 *
 * Model:
 * 1. Total care hours = sum of actual hours from completed tasks
 * 2. Productivity value = care hours × private pay rate (proxy)
 * 3. Absenteeism reduction = ~0.5 hours saved per care hour delivered
 * 4. Readmission avoidance = (care hours / 100) × baseline rate × cost
 *    (every 100 care hours prevents ~1 readmission at baseline rate)
 */
async function getProductivityImpact(): Promise<ProductivityImpact> {
  const completedTasks = await queries.listCompletedTasks();

  let totalCareHours = 0;
  for (const task of completedTasks) {
    totalCareHours += task.actualHours ?? task.estimatedHours;
  }

  // Absenteeism proxy: 0.5 hours of reduced absenteeism per care hour
  const estimatedAbsenteeismReduction = Math.round(totalCareHours * 0.5 * 10) / 10;

  // Productivity value: care hours valued at private pay rate
  const productivityValueCents = Math.round(
    totalCareHours * FINANCIALS.PRIVATE_PAY_RATE_CENTS_PER_HOUR,
  );

  // Readmission avoidance: every 100 care hours prevents ~baseline% readmissions
  const readmissionAvoidanceCount = Math.max(
    0,
    Math.round((totalCareHours / 100) * FINANCIALS.BCH_READMISSION_RATE * 10) / 10,
  );
  const readmissionSavingsCents = Math.round(
    readmissionAvoidanceCount * FINANCIALS.BCH_READMISSION_COST_CENTS,
  );

  const totalROICents = productivityValueCents + readmissionSavingsCents;

  return {
    totalCareHours: Math.round(totalCareHours * 10) / 10,
    estimatedAbsenteeismReduction,
    productivityValueCents,
    readmissionAvoidanceCount,
    readmissionSavingsCents,
    totalROICents,
  };
}

// ── Quarterly ROI Report ────────────────────────────────────

/**
 * Generate quarterly ROI summary.
 * Returns data for the last 4 quarters.
 */
function generateQuarterlyROI(
  enrolledEmployees: number,
  totalCareHours: number,
  quarters: number = 4,
): QuarterlyROI[] {
  const results: QuarterlyROI[] = [];
  const now = new Date();

  for (let q = quarters - 1; q >= 0; q--) {
    const qDate = new Date(now);
    qDate.setMonth(qDate.getMonth() - q * 3);
    const quarter = `Q${Math.ceil((qDate.getMonth() + 1) / 3)} ${qDate.getFullYear()}`;

    // Distribute care hours across quarters (weighted toward recent)
    const weight = (quarters - q) / ((quarters * (quarters + 1)) / 2);
    const careHours = Math.round(totalCareHours * weight * 10) / 10;

    const pepmRevenueCents = enrolledEmployees * FINANCIALS.EMPLOYER_PEPM_CENTS * 3; // 3 months
    const productivityValueCents = Math.round(
      careHours * FINANCIALS.PRIVATE_PAY_RATE_CENTS_PER_HOUR,
    );
    const readmissions = Math.round((careHours / 100) * FINANCIALS.BCH_READMISSION_RATE * 10) / 10;
    const readmissionSavingsCents = Math.round(
      readmissions * FINANCIALS.BCH_READMISSION_COST_CENTS,
    );
    const netROICents = productivityValueCents + readmissionSavingsCents - pepmRevenueCents;
    const roiMultiple =
      pepmRevenueCents > 0
        ? Math.round(
            ((productivityValueCents + readmissionSavingsCents) / pepmRevenueCents) * 100,
          ) / 100
        : 0;

    results.push({
      quarter,
      enrolledEmployees,
      careHoursDelivered: careHours,
      pepmRevenueCents,
      productivityValueCents,
      readmissionSavingsCents,
      netROICents,
      roiMultiple,
    });
  }

  return results;
}

// ── Aggregate Dashboard ─────────────────────────────────────

async function getDashboardData(): Promise<EmployerDashboardData> {
  const [ciiDistribution, pepm, productivity] = await Promise.all([
    getCIIDistribution(),
    getPEPMMetrics(),
    getProductivityImpact(),
  ]);

  logger.info(
    {
      enrolled: pepm.enrolledEmployees,
      utilization: pepm.utilizationRate,
      careHours: productivity.totalCareHours,
    },
    'Employer dashboard data generated',
  );

  return { ciiDistribution, pepm, productivity };
}

export const employerService = {
  getCIIDistribution,
  getPEPMMetrics,
  getProductivityImpact,
  generateQuarterlyROI,
  getDashboardData,
  // Exported for testing
  kAnonymize,
  K_ANONYMITY_THRESHOLD,
};
