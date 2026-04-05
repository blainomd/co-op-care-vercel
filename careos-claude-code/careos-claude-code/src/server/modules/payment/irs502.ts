/**
 * IRS Publication 502 — Eligibility Engine
 *
 * Determines whether companion care expenses qualify for HSA/FSA
 * reimbursement based on active LMN + Omaha problem codes.
 *
 * Core rule: Companion care is IRS 502-eligible when an active
 * Letter of Medical Necessity (LMN) is on file for the care recipient.
 */
import {
  IRS_PUB_502_CATEGORIES,
  getPub502ForOmahaProblem,
  type IRSPub502Category,
} from '@shared/constants/irs-pub502';
import {
  listLMNsByCareRecipient,
  listCareRecipientsByFamily,
} from '../../database/queries/index.js';
import type { LMNRecord } from '../../database/queries/lmn.js';

// ── Types ────────────────────────────────────────────────

export interface EligibilityResult {
  eligible: boolean;
  pub502Categories: string[];
  activeLMNId?: string;
  activeLMNExpiresAt?: string;
  omahaProblems: number[];
  categoryDetails: IRSPub502Category[];
}

export interface FamilyEligibility {
  familyId: string;
  careRecipients: CareRecipientEligibility[];
  anyEligible: boolean;
  allCategories: string[];
}

export interface CareRecipientEligibility {
  careRecipientId: string;
  careRecipientName: string;
  eligible: boolean;
  activeLMNId?: string;
  activeLMNExpiresAt?: string;
  pub502Categories: string[];
}

export interface AnnualEligibilitySummary {
  year: number;
  totalEligibleCents: number;
  totalNonEligibleCents: number;
  categorizedAmounts: Record<string, number>;
  hasActiveLMN: boolean;
  lmnCoverageMonths: number;
}

// ── Core Eligibility Logic ───────────────────────────────

/**
 * Check if a care recipient has an active (non-expired) LMN.
 */
function isLMNActive(lmn: LMNRecord): boolean {
  if (lmn.status !== 'active' && lmn.status !== 'expiring') return false;
  if (!lmn.expiresAt) return false;
  return new Date(lmn.expiresAt) > new Date();
}

/**
 * Get all eligible IRS 502 categories for a set of Omaha problem codes.
 * Deduplicates categories that appear from multiple problems.
 */
function getEligibleCategories(omahaProblems: number[]): IRSPub502Category[] {
  const seen = new Set<string>();
  const categories: IRSPub502Category[] = [];

  for (const code of omahaProblems) {
    for (const cat of getPub502ForOmahaProblem(code)) {
      if (!seen.has(cat.code)) {
        seen.add(cat.code);
        categories.push(cat);
      }
    }
  }

  return categories;
}

/**
 * Check HSA/FSA eligibility for a specific care recipient.
 *
 * Rules:
 * 1. Must have an active LMN (status = 'active' or 'expiring', not expired)
 * 2. LMN's Omaha problems determine which IRS 502 categories apply
 * 3. PERSONAL_CARE (Omaha 38) is always included for companion care recipients
 *    with an active LMN
 */
async function checkEligibility(careRecipientId: string): Promise<EligibilityResult> {
  const lmns = await listLMNsByCareRecipient(careRecipientId);
  const activeLMN = lmns.find(isLMNActive);

  if (!activeLMN) {
    return {
      eligible: false,
      pub502Categories: [],
      omahaProblems: [],
      categoryDetails: [],
    };
  }

  const omahaProblems = activeLMN.omahaProblems ?? [];
  const categories = getEligibleCategories(omahaProblems);

  // Always include PERSONAL_CARE for companion care with active LMN
  const hasPersonalCare = categories.some((c) => c.code === 'PERSONAL_CARE');
  if (!hasPersonalCare) {
    const personalCare = IRS_PUB_502_CATEGORIES.find((c) => c.code === 'PERSONAL_CARE');
    if (personalCare) categories.push(personalCare);
  }

  return {
    eligible: true,
    pub502Categories: categories.map((c) => c.code),
    activeLMNId: activeLMN.id,
    activeLMNExpiresAt: activeLMN.expiresAt ?? undefined,
    omahaProblems,
    categoryDetails: categories,
  };
}

/**
 * Check eligibility for all care recipients in a family.
 */
async function checkFamilyEligibility(familyId: string): Promise<FamilyEligibility> {
  const recipients = await listCareRecipientsByFamily(familyId);
  const results: CareRecipientEligibility[] = [];
  const allCategories = new Set<string>();

  for (const recipient of recipients) {
    const eligibility = await checkEligibility(recipient.id);
    results.push({
      careRecipientId: recipient.id,
      careRecipientName: `${recipient.firstName} ${recipient.lastName}`,
      eligible: eligibility.eligible,
      activeLMNId: eligibility.activeLMNId,
      activeLMNExpiresAt: eligibility.activeLMNExpiresAt,
      pub502Categories: eligibility.pub502Categories,
    });
    for (const cat of eligibility.pub502Categories) {
      allCategories.add(cat);
    }
  }

  return {
    familyId,
    careRecipients: results,
    anyEligible: results.some((r) => r.eligible),
    allCategories: Array.from(allCategories),
  };
}

/**
 * Compute how many months in a year an LMN was active for.
 * Used for prorating annual eligibility.
 */
function computeLMNCoverageMonths(lmns: LMNRecord[], year: number): number {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year + 1, 0, 1);
  const monthsCovered = new Set<number>();

  for (const lmn of lmns) {
    if (lmn.status === 'draft' || lmn.status === 'pending_signature' || lmn.status === 'revoked') {
      continue;
    }

    const issued = lmn.issuedAt ? new Date(lmn.issuedAt) : null;
    const expires = lmn.expiresAt ? new Date(lmn.expiresAt) : null;
    if (!issued) continue;

    const effectiveStart = issued > yearStart ? issued : yearStart;
    const effectiveEnd = expires && expires < yearEnd ? expires : yearEnd;

    if (effectiveStart >= effectiveEnd) continue;

    // Mark each month that has at least partial coverage
    const cursor = new Date(effectiveStart);
    while (cursor < effectiveEnd) {
      monthsCovered.add(cursor.getMonth());
      cursor.setMonth(cursor.getMonth() + 1);
      cursor.setDate(1);
    }
  }

  return monthsCovered.size;
}

/**
 * Build annual eligibility summary for tax purposes.
 */
async function getAnnualEligibility(
  careRecipientId: string,
  year: number,
  totalSpentCents: number,
): Promise<AnnualEligibilitySummary> {
  const lmns = await listLMNsByCareRecipient(careRecipientId);
  const coverageMonths = computeLMNCoverageMonths(lmns, year);
  const eligibility = await checkEligibility(careRecipientId);

  // Prorate eligible amount by LMN coverage months
  const coverageRatio = coverageMonths / 12;
  const eligibleCents = eligibility.eligible ? Math.round(totalSpentCents * coverageRatio) : 0;

  const categorizedAmounts: Record<string, number> = {};
  if (eligibility.eligible && eligibility.pub502Categories.length > 0) {
    // Distribute eligible amount evenly across categories
    const perCategory = Math.round(eligibleCents / eligibility.pub502Categories.length);
    for (const cat of eligibility.pub502Categories) {
      categorizedAmounts[cat] = perCategory;
    }
  }

  return {
    year,
    totalEligibleCents: eligibleCents,
    totalNonEligibleCents: totalSpentCents - eligibleCents,
    categorizedAmounts,
    hasActiveLMN: eligibility.eligible,
    lmnCoverageMonths: coverageMonths,
  };
}

export const irs502Service = {
  isLMNActive,
  getEligibleCategories,
  checkEligibility,
  checkFamilyEligibility,
  computeLMNCoverageMonths,
  getAnnualEligibility,
};
