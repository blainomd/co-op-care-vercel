/**
 * Reconciliation Service
 * Multi-source transaction categorization for HSA/FSA-eligible companion care.
 *
 * Categories: membership, credit_purchase, comfort_card, hsa_reimbursement,
 * employer_pepm, private_pay.
 */
import type { PAYMENT_SOURCES } from '@shared/constants/business-rules';
import { TIME_BANK, FINANCIALS } from '@shared/constants/business-rules';
import { irs502Service } from './irs502.js';

// ── Types ────────────────────────────────────────────────

export type PaymentSource = (typeof PAYMENT_SOURCES)[number];

export type TransactionCategory =
  | 'membership'
  | 'credit_purchase'
  | 'comfort_card'
  | 'hsa_reimbursement'
  | 'employer_pepm'
  | 'private_pay';

export interface ReconciliationEntry {
  id: string;
  date: string;
  category: TransactionCategory;
  description: string;
  amountCents: number;
  hsaFsaEligible: boolean;
  irsPub502Categories: string[];
  familyId?: string;
  careRecipientId?: string;
  stripePaymentIntentId?: string;
  metadata?: Record<string, string>;
}

export interface ReconciliationSummary {
  totalAmountCents: number;
  hsaEligibleCents: number;
  nonEligibleCents: number;
  byCategory: Record<TransactionCategory, number>;
  entryCount: number;
}

export interface MonthlyReconciliation {
  month: string; // YYYY-MM
  entries: ReconciliationEntry[];
  summary: ReconciliationSummary;
}

// ── Categorization ───────────────────────────────────────

/**
 * Categorize a Stripe charge by its metadata.
 * Returns the TransactionCategory based on `metadata.type`.
 */
function categorizeStripeCharge(metadata: Record<string, string>): TransactionCategory {
  const type = metadata['type'] ?? '';
  switch (type) {
    case 'membership':
    case 'membership_renewal':
      return 'membership';
    case 'credit_purchase':
      return 'credit_purchase';
    case 'comfort_card':
      return 'comfort_card';
    default:
      return 'private_pay';
  }
}

/**
 * Determine HSA/FSA eligibility for a transaction.
 *
 * Rules:
 * 1. All membership payments are HSA-eligible (medical care services)
 * 2. Time Bank credit purchases are HSA-eligible (care coordination)
 * 3. Comfort Card charges are HSA-eligible IF active LMN exists for care recipient
 * 4. Employer PEPM: not direct-billed to individual (employer pays)
 * 5. Private pay: only eligible if active LMN + qualifying Omaha problems
 */
async function determineHSAEligibility(
  category: TransactionCategory,
  careRecipientId?: string,
): Promise<{ eligible: boolean; pub502Categories: string[] }> {
  // Membership and credit purchases are always HSA-eligible
  if (category === 'membership' || category === 'credit_purchase') {
    return { eligible: true, pub502Categories: ['medical_care_services'] };
  }

  // Employer PEPM is employer-paid, not individual HSA
  if (category === 'employer_pepm') {
    return { eligible: false, pub502Categories: [] };
  }

  // For comfort_card, hsa_reimbursement, and private_pay — check LMN
  if (!careRecipientId) {
    return { eligible: false, pub502Categories: [] };
  }

  return irs502Service.checkEligibility(careRecipientId);
}

// ── Public API ───────────────────────────────────────────

/**
 * Build a reconciliation entry from raw transaction data.
 */
async function reconcileTransaction(input: {
  id: string;
  date: string;
  amountCents: number;
  description: string;
  stripeMetadata?: Record<string, string>;
  familyId?: string;
  careRecipientId?: string;
  stripePaymentIntentId?: string;
  overrideCategory?: TransactionCategory;
}): Promise<ReconciliationEntry> {
  const category = input.overrideCategory ?? categorizeStripeCharge(input.stripeMetadata ?? {});

  const { eligible, pub502Categories } = await determineHSAEligibility(
    category,
    input.careRecipientId,
  );

  return {
    id: input.id,
    date: input.date,
    category,
    description: input.description,
    amountCents: input.amountCents,
    hsaFsaEligible: eligible,
    irsPub502Categories: pub502Categories,
    familyId: input.familyId,
    careRecipientId: input.careRecipientId,
    stripePaymentIntentId: input.stripePaymentIntentId,
    metadata: input.stripeMetadata,
  };
}

/**
 * Summarize a list of reconciliation entries.
 */
function summarizeEntries(entries: ReconciliationEntry[]): ReconciliationSummary {
  const byCategory: Record<TransactionCategory, number> = {
    membership: 0,
    credit_purchase: 0,
    comfort_card: 0,
    hsa_reimbursement: 0,
    employer_pepm: 0,
    private_pay: 0,
  };

  let totalAmountCents = 0;
  let hsaEligibleCents = 0;

  for (const entry of entries) {
    totalAmountCents += entry.amountCents;
    byCategory[entry.category] += entry.amountCents;
    if (entry.hsaFsaEligible) {
      hsaEligibleCents += entry.amountCents;
    }
  }

  return {
    totalAmountCents,
    hsaEligibleCents,
    nonEligibleCents: totalAmountCents - hsaEligibleCents,
    byCategory,
    entryCount: entries.length,
  };
}

/**
 * Group entries by month and produce monthly reconciliations.
 */
function groupByMonth(entries: ReconciliationEntry[]): MonthlyReconciliation[] {
  const months = new Map<string, ReconciliationEntry[]>();

  for (const entry of entries) {
    const month = entry.date.slice(0, 7); // YYYY-MM
    const existing = months.get(month) ?? [];
    existing.push(entry);
    months.set(month, existing);
  }

  const result: MonthlyReconciliation[] = [];
  for (const [month, monthEntries] of months) {
    result.push({
      month,
      entries: monthEntries.sort((a, b) => a.date.localeCompare(b.date)),
      summary: summarizeEntries(monthEntries),
    });
  }

  return result.sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Compute PEPM cost for an employer for a given month.
 */
function computePEPMCost(enrolledEmployees: number): number {
  return enrolledEmployees * FINANCIALS.EMPLOYER_PEPM_CENTS;
}

/**
 * Compute credit purchase cost for given hours.
 */
function computeCreditCost(hours: number): {
  totalCents: number;
  coordinationCents: number;
  respiteCents: number;
} {
  return {
    totalCents: hours * TIME_BANK.CASH_RATE_CENTS_PER_HOUR,
    coordinationCents: hours * TIME_BANK.CASH_COORDINATION_SPLIT_CENTS,
    respiteCents: hours * TIME_BANK.CASH_RESPITE_SPLIT_CENTS,
  };
}

export const reconciliationService = {
  categorizeStripeCharge,
  determineHSAEligibility,
  reconcileTransaction,
  summarizeEntries,
  groupByMonth,
  computePEPMCost,
  computeCreditCost,
};
