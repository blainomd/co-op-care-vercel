/**
 * Statement Generation Service
 * Monthly statements + annual HSA/FSA tax summaries.
 *
 * Generates structured data suitable for PDF rendering
 * on the client (no server-side PDF generation needed).
 */
import { IRS_PUB_502_CATEGORIES } from '@shared/constants/irs-pub502';
import type { ReconciliationEntry, TransactionCategory } from './reconciliation.js';

// ── Types ────────────────────────────────────────────────

export interface MonthlyStatement {
  familyId: string;
  familyName: string;
  month: string; // YYYY-MM
  generatedAt: string;
  entries: StatementLineItem[];
  summary: StatementSummary;
  hsaFsaSummary: HSAFSASummary;
}

export interface StatementLineItem {
  date: string;
  description: string;
  category: TransactionCategory;
  amountCents: number;
  hsaFsaEligible: boolean;
  pub502Code?: string;
}

export interface StatementSummary {
  totalChargesCents: number;
  membershipCents: number;
  creditPurchasesCents: number;
  comfortCardCents: number;
  otherCents: number;
  transactionCount: number;
}

export interface HSAFSASummary {
  eligibleAmountCents: number;
  nonEligibleAmountCents: number;
  eligibleByCategory: Record<string, number>;
  lmnOnFile: boolean;
  lmnExpiresAt?: string;
}

export interface AnnualTaxStatement {
  familyId: string;
  familyName: string;
  year: number;
  generatedAt: string;
  taxPayerId?: string; // masked
  totalPaidCents: number;
  hsaFsaEligibleCents: number;
  nonEligibleCents: number;
  monthlyBreakdown: MonthlyTaxSummary[];
  categoryBreakdown: CategoryTaxSummary[];
  pub502Summary: Pub502TaxSummary[];
  lmnCoverageMonths: number;
  disclaimers: string[];
}

export interface MonthlyTaxSummary {
  month: string;
  totalCents: number;
  eligibleCents: number;
}

export interface CategoryTaxSummary {
  category: TransactionCategory;
  label: string;
  totalCents: number;
  eligibleCents: number;
}

export interface Pub502TaxSummary {
  code: string;
  name: string;
  description: string;
  amountCents: number;
}

// ── Category Labels ──────────────────────────────────────

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  membership: 'Annual Membership',
  credit_purchase: 'Time Bank Credits',
  comfort_card: 'Comfort Card',
  hsa_reimbursement: 'HSA Reimbursement',
  employer_pepm: 'Employer PEPM',
  private_pay: 'Private Pay',
};

// ── Statement Generation ─────────────────────────────────

/**
 * Generate a monthly statement from reconciliation entries.
 */
function generateMonthlyStatement(
  familyId: string,
  familyName: string,
  month: string,
  entries: ReconciliationEntry[],
  lmnOnFile: boolean,
  lmnExpiresAt?: string,
): MonthlyStatement {
  const lineItems: StatementLineItem[] = entries.map((e) => ({
    date: e.date,
    description: e.description,
    category: e.category,
    amountCents: e.amountCents,
    hsaFsaEligible: e.hsaFsaEligible,
    pub502Code: e.irsPub502Categories[0],
  }));

  const summary = computeStatementSummary(entries);
  const hsaFsaSummary = computeHSAFSASummary(entries, lmnOnFile, lmnExpiresAt);

  return {
    familyId,
    familyName,
    month,
    generatedAt: new Date().toISOString(),
    entries: lineItems,
    summary,
    hsaFsaSummary,
  };
}

function computeStatementSummary(entries: ReconciliationEntry[]): StatementSummary {
  let totalChargesCents = 0;
  let membershipCents = 0;
  let creditPurchasesCents = 0;
  let comfortCardCents = 0;
  let otherCents = 0;

  for (const e of entries) {
    totalChargesCents += e.amountCents;
    switch (e.category) {
      case 'membership':
        membershipCents += e.amountCents;
        break;
      case 'credit_purchase':
        creditPurchasesCents += e.amountCents;
        break;
      case 'comfort_card':
        comfortCardCents += e.amountCents;
        break;
      default:
        otherCents += e.amountCents;
    }
  }

  return {
    totalChargesCents,
    membershipCents,
    creditPurchasesCents,
    comfortCardCents,
    otherCents,
    transactionCount: entries.length,
  };
}

function computeHSAFSASummary(
  entries: ReconciliationEntry[],
  lmnOnFile: boolean,
  lmnExpiresAt?: string,
): HSAFSASummary {
  let eligibleAmountCents = 0;
  const eligibleByCategory: Record<string, number> = {};

  for (const e of entries) {
    if (e.hsaFsaEligible) {
      eligibleAmountCents += e.amountCents;
      for (const cat of e.irsPub502Categories) {
        eligibleByCategory[cat] = (eligibleByCategory[cat] ?? 0) + e.amountCents;
      }
    }
  }

  return {
    eligibleAmountCents,
    nonEligibleAmountCents: entries.reduce((s, e) => s + e.amountCents, 0) - eligibleAmountCents,
    eligibleByCategory,
    lmnOnFile,
    lmnExpiresAt,
  };
}

/**
 * Generate an annual tax statement suitable for HSA/FSA filing.
 */
function generateAnnualTaxStatement(
  familyId: string,
  familyName: string,
  year: number,
  monthlyData: Array<{ month: string; entries: ReconciliationEntry[] }>,
  lmnCoverageMonths: number,
): AnnualTaxStatement {
  const allEntries = monthlyData.flatMap((m) => m.entries);

  // Monthly breakdown
  const monthlyBreakdown: MonthlyTaxSummary[] = monthlyData.map((m) => {
    const totalCents = m.entries.reduce((s, e) => s + e.amountCents, 0);
    const eligibleCents = m.entries
      .filter((e) => e.hsaFsaEligible)
      .reduce((s, e) => s + e.amountCents, 0);
    return { month: m.month, totalCents, eligibleCents };
  });

  // Category breakdown
  const categoryTotals = new Map<TransactionCategory, { total: number; eligible: number }>();
  for (const e of allEntries) {
    const existing = categoryTotals.get(e.category) ?? { total: 0, eligible: 0 };
    existing.total += e.amountCents;
    if (e.hsaFsaEligible) existing.eligible += e.amountCents;
    categoryTotals.set(e.category, existing);
  }

  const categoryBreakdown: CategoryTaxSummary[] = [];
  for (const [category, totals] of categoryTotals) {
    categoryBreakdown.push({
      category,
      label: CATEGORY_LABELS[category],
      totalCents: totals.total,
      eligibleCents: totals.eligible,
    });
  }

  // IRS 502 category totals
  const pub502Totals = new Map<string, number>();
  for (const e of allEntries) {
    if (!e.hsaFsaEligible) continue;
    for (const cat of e.irsPub502Categories) {
      pub502Totals.set(cat, (pub502Totals.get(cat) ?? 0) + e.amountCents);
    }
  }

  const pub502Summary: Pub502TaxSummary[] = [];
  for (const [code, amountCents] of pub502Totals) {
    const category = IRS_PUB_502_CATEGORIES.find((c) => c.code === code);
    pub502Summary.push({
      code,
      name: category?.name ?? code,
      description: category?.description ?? '',
      amountCents,
    });
  }

  const totalPaidCents = allEntries.reduce((s, e) => s + e.amountCents, 0);
  const hsaFsaEligibleCents = allEntries
    .filter((e) => e.hsaFsaEligible)
    .reduce((s, e) => s + e.amountCents, 0);

  return {
    familyId,
    familyName,
    year,
    generatedAt: new Date().toISOString(),
    totalPaidCents,
    hsaFsaEligibleCents,
    nonEligibleCents: totalPaidCents - hsaFsaEligibleCents,
    monthlyBreakdown,
    categoryBreakdown,
    pub502Summary,
    lmnCoverageMonths,
    disclaimers: [
      'This statement is provided for informational purposes to assist with HSA/FSA reimbursement claims.',
      'Consult your tax advisor to confirm eligibility of specific expenses under IRS Publication 502.',
      'co.op.care is not a tax advisor and does not provide tax advice.',
      'A Letter of Medical Necessity (LMN) must be on file for companion care expenses to qualify.',
      `LMN coverage: ${lmnCoverageMonths} of 12 months in ${year}.`,
    ],
  };
}

/**
 * Format cents to dollar string for display.
 */
function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const statementService = {
  generateMonthlyStatement,
  generateAnnualTaxStatement,
  computeStatementSummary,
  computeHSAFSASummary,
  formatCents,
  CATEGORY_LABELS,
};
