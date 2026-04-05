/**
 * Reimbursement Service — HSA/FSA Claims lifecycle management
 *
 * Generates reimbursement packages from care visit data + active LMNs,
 * produces EOB documents and annual tax statements, and supports
 * the full claim lifecycle (draft -> submitted -> approved/denied).
 */
import * as queries from '../../database/queries/index.js';
import { NotFoundError, ValidationError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import { irs502Service } from '../payment/irs502.js';
import { BRAND, FINANCIALS } from '@shared/constants/business-rules';
import type {
  ClaimLineItem,
  ServiceType,
  ReimbursementSummary,
} from '@shared/types/reimbursement.types';
import type { CreateClaimInput, UpdateClaimInput, ResolveClaimInput } from './schemas.js';
import type { ReimbursementClaimRecord } from '../../database/queries/reimbursement.js';

// ── Constants ─────────────────────────────────────────────

/** HSA savings estimate range (28-36% per BACKGROUND_CHECK.LMN_SAVINGS_PERCENT) */
const HSA_SAVINGS_LOW = 0.28;
const HSA_SAVINGS_HIGH = 0.36;
const HSA_SAVINGS_MID = (HSA_SAVINGS_LOW + HSA_SAVINGS_HIGH) / 2;

/** Default hourly rate for care services (cents -> dollars) */
const DEFAULT_RATE_PER_HOUR = FINANCIALS.PRIVATE_PAY_RATE_CENTS_PER_HOUR / 100;

/** co-op.care business details for EOB documents */
const COOP_BUSINESS = {
  name: BRAND.LEGAL_NAME,
  ein: '**-***####', // placeholder — populate with real EIN
  address: 'Boulder, CO',
  phone: BRAND.SUPPORT_EMAIL,
} as const;

// ── Task type to service type mapping ─────────────────────

const TASK_TYPE_TO_SERVICE: Record<string, ServiceType> = {
  companionship: 'companion_care',
  phone_companionship: 'companion_care',
  meals: 'meal_preparation',
  rides: 'transportation',
  grocery_run: 'transportation',
  errands: 'transportation',
  housekeeping: 'personal_care',
  tech_support: 'companion_care',
  yard_work: 'companion_care',
  pet_care: 'companion_care',
  admin_help: 'companion_care',
  teaching: 'companion_care',
};

function mapTaskTypeToServiceType(taskType: string): ServiceType {
  return TASK_TYPE_TO_SERVICE[taskType] ?? 'companion_care';
}

// ── Create Claim ──────────────────────────────────────────

async function createClaim(
  userId: string,
  input: CreateClaimInput,
): Promise<ReimbursementClaimRecord> {
  // Verify LMN exists and is active
  const lmn = await queries.getLMNById(input.lmnId);
  if (!lmn) throw new NotFoundError('LMN');
  if (lmn.status !== 'active' && lmn.status !== 'expiring') {
    throw new ValidationError('LMN must be active to create a reimbursement claim');
  }

  // Verify care recipient
  const careRecipient = await queries.getCareRecipientById(input.careRecipientId);
  if (!careRecipient) throw new NotFoundError('Care Recipient');

  // Verify IRS eligibility
  const eligibility = await irs502Service.checkEligibility(input.careRecipientId);
  if (!eligibility.eligible) {
    throw new ValidationError('Care recipient does not have IRS 502 eligibility (no active LMN)');
  }

  // Pull completed tasks for the claim period to auto-populate line items
  const tasks = await queries.listCompletedTasksForCareRecipient(
    input.careRecipientId,
    input.claimPeriodStart,
    input.claimPeriodEnd,
  );

  const lineItems: ClaimLineItem[] = tasks.map((task) => {
    const hours = task.actualHours ?? task.estimatedHours;
    const rate = DEFAULT_RATE_PER_HOUR;
    const amount = Math.round(hours * rate * 100) / 100;
    const taskDate = task.checkOutTime ?? task.scheduledFor ?? task.createdAt;

    return {
      date: taskDate.substring(0, 10),
      serviceType: mapTaskTypeToServiceType(task.taskType),
      hours,
      rate,
      amount,
      caregiverId: task.matchedUserId ?? '',
      caregiverName: '', // enriched separately if needed
      description: task.title,
    };
  });

  const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const estimatedReimbursement = Math.round(totalAmount * HSA_SAVINGS_MID * 100) / 100;

  const claimYear = new Date(input.claimPeriodStart).getFullYear();

  const record = await queries.createReimbursementClaim({
    familyId: input.familyId,
    careRecipientId: input.careRecipientId,
    careRecipientName: `${careRecipient.firstName} ${careRecipient.lastName}`,
    lmnId: input.lmnId,
    claimPeriodStart: input.claimPeriodStart,
    claimPeriodEnd: input.claimPeriodEnd,
    lineItems,
    totalAmount,
    estimatedReimbursement,
    irsCategories: eligibility.pub502Categories,
    taxYear: claimYear,
    hsaProvider: input.hsaProvider,
    hsaAccountId: input.hsaAccountId,
  });

  logger.info(
    { claimId: record.id, familyId: input.familyId, lineItemCount: lineItems.length, totalAmount },
    'Reimbursement claim created',
  );

  return record;
}

// ── List Claims ───────────────────────────────────────────

async function listClaims(familyId: string): Promise<ReimbursementClaimRecord[]> {
  return queries.listReimbursementClaimsByFamily(familyId);
}

// ── Get Claim ─────────────────────────────────────────────

async function getClaim(claimId: string): Promise<ReimbursementClaimRecord> {
  const record = await queries.getReimbursementClaimById(claimId);
  if (!record) throw new NotFoundError('Reimbursement Claim');
  return record;
}

// ── Update Claim ──────────────────────────────────────────

async function updateClaim(
  claimId: string,
  input: UpdateClaimInput,
): Promise<ReimbursementClaimRecord> {
  const claim = await queries.getReimbursementClaimById(claimId);
  if (!claim) throw new NotFoundError('Reimbursement Claim');

  if (claim.status === 'approved') {
    throw new ValidationError('Cannot modify an approved claim');
  }

  const updateData: Partial<ReimbursementClaimRecord> = {};
  if (input.hsaProvider !== undefined) updateData.hsaProvider = input.hsaProvider;
  if (input.hsaAccountId !== undefined) updateData.hsaAccountId = input.hsaAccountId;
  if (input.supportingDocuments !== undefined) {
    updateData.supportingDocuments = input.supportingDocuments;
  }

  // If claim was denied and is being updated, move to resubmitted
  if (claim.status === 'denied') {
    updateData.status = 'resubmitted';
    updateData.denialReason = input.denialReason ?? claim.denialReason;
  }

  const updated = await queries.updateReimbursementClaim(claimId, updateData);
  logger.info({ claimId }, 'Reimbursement claim updated');
  return updated;
}

// ── Submit Claim ──────────────────────────────────────────

async function submitClaim(claimId: string): Promise<ReimbursementClaimRecord> {
  const claim = await queries.getReimbursementClaimById(claimId);
  if (!claim) throw new NotFoundError('Reimbursement Claim');

  if (claim.status !== 'draft' && claim.status !== 'ready' && claim.status !== 'resubmitted') {
    throw new ValidationError(`Cannot submit claim in status: ${claim.status}`);
  }

  if (claim.lineItems.length === 0) {
    throw new ValidationError('Cannot submit a claim with no line items');
  }

  const updated = await queries.updateReimbursementClaim(claimId, {
    status: 'submitted',
    submittedAt: new Date().toISOString(),
  });

  logger.info({ claimId, totalAmount: claim.totalAmount }, 'Reimbursement claim submitted');
  return updated;
}

// ── Resolve Claim (Admin) ─────────────────────────────────

async function resolveClaim(
  claimId: string,
  input: ResolveClaimInput,
): Promise<ReimbursementClaimRecord> {
  const claim = await queries.getReimbursementClaimById(claimId);
  if (!claim) throw new NotFoundError('Reimbursement Claim');

  if (claim.status !== 'submitted' && claim.status !== 'resubmitted') {
    throw new ValidationError(`Cannot resolve claim in status: ${claim.status}`);
  }

  const updateData: Partial<ReimbursementClaimRecord> = {
    status: input.resolution,
    resolvedAt: new Date().toISOString(),
  };

  if (input.resolution === 'denied' && input.denialReason) {
    updateData.denialReason = input.denialReason;
  }

  const updated = await queries.updateReimbursementClaim(claimId, updateData);
  logger.info({ claimId, resolution: input.resolution }, 'Reimbursement claim resolved');
  return updated;
}

// ── Generate EOB Document ─────────────────────────────────

async function generateEOB(claimId: string): Promise<string> {
  const claim = await queries.getReimbursementClaimById(claimId);
  if (!claim) throw new NotFoundError('Reimbursement Claim');

  const lmn = await queries.getLMNById(claim.lmnId);

  const lines: string[] = [
    '═══════════════════════════════════════════════════════════',
    '              EXPLANATION OF BENEFITS (EOB)',
    `              ${COOP_BUSINESS.name}`,
    '═══════════════════════════════════════════════════════════',
    '',
    `Date Generated: ${new Date().toISOString().substring(0, 10)}`,
    `Claim ID: ${claim.id}`,
    `Tax Year: ${claim.taxYear}`,
    '',
    '── PROVIDER INFORMATION ─────────────────────────────────',
    `Provider: ${COOP_BUSINESS.name}`,
    `EIN: ${COOP_BUSINESS.ein}`,
    `Address: ${COOP_BUSINESS.address}`,
    `Contact: ${COOP_BUSINESS.phone}`,
    '',
    '── CARE RECIPIENT ──────────────────────────────────────',
    `Name: ${claim.careRecipientName}`,
    `Family ID: ${claim.familyId}`,
    '',
    '── LETTER OF MEDICAL NECESSITY ─────────────────────────',
    `LMN Reference: ${claim.lmnId}`,
    `Physician: ${lmn?.signingPhysicianName ?? 'On file'}`,
    `LMN Status: ${lmn?.status ?? 'N/A'}`,
    `LMN Issued: ${lmn?.issuedAt?.substring(0, 10) ?? 'N/A'}`,
    `LMN Expires: ${lmn?.expiresAt?.substring(0, 10) ?? 'N/A'}`,
    '',
    '── IRS PUBLICATION 502 CATEGORIES ──────────────────────',
    ...claim.irsCategories.map((cat) => `  - ${cat}`),
    '',
    '── CLAIM PERIOD ────────────────────────────────────────',
    `From: ${claim.claimPeriodStart}`,
    `To:   ${claim.claimPeriodEnd}`,
    '',
    '── ITEMIZED SERVICES ───────────────────────────────────',
    'Date       | Service              | Hours | Rate    | Amount',
    '-----------|----------------------|-------|---------|--------',
  ];

  for (const item of claim.lineItems) {
    const service = item.serviceType.replace(/_/g, ' ').padEnd(20);
    const hours = item.hours.toFixed(2).padStart(5);
    const rate = `$${item.rate.toFixed(2)}`.padStart(7);
    const amount = `$${item.amount.toFixed(2)}`.padStart(8);
    lines.push(`${item.date} | ${service} | ${hours} | ${rate} | ${amount}`);
  }

  lines.push(
    '',
    '── SUMMARY ─────────────────────────────────────────────',
    `Total Services:             ${claim.lineItems.length}`,
    `Total Amount:               $${claim.totalAmount.toFixed(2)}`,
    `Estimated HSA/FSA Savings:  $${claim.estimatedReimbursement.toFixed(2)} (${Math.round(HSA_SAVINGS_MID * 100)}% estimated)`,
    '',
    '── COMPLIANCE STATEMENT ────────────────────────────────',
    'These services were provided under physician oversight per the',
    'attached Letter of Medical Necessity. Expenses qualify for HSA/FSA',
    'reimbursement under IRS Publication 502 (Medical and Dental Expenses).',
    '',
    'This document is intended for use with your HSA/FSA provider for',
    'reimbursement of qualified medical expenses. Retain for your tax records.',
    '',
    `${COOP_BUSINESS.name}`,
    `${COOP_BUSINESS.address}`,
    '═══════════════════════════════════════════════════════════',
  );

  return lines.join('\n');
}

// ── Generate Receipt ──────────────────────────────────────

async function generateReceipt(claimId: string): Promise<string> {
  const claim = await queries.getReimbursementClaimById(claimId);
  if (!claim) throw new NotFoundError('Reimbursement Claim');

  const lines: string[] = [
    '═══════════════════════════════════════════════════════════',
    '                    ITEMIZED RECEIPT',
    `              ${COOP_BUSINESS.name}`,
    '═══════════════════════════════════════════════════════════',
    '',
    `Receipt Date: ${new Date().toISOString().substring(0, 10)}`,
    `Claim ID: ${claim.id}`,
    `Care Recipient: ${claim.careRecipientName}`,
    `Service Period: ${claim.claimPeriodStart} to ${claim.claimPeriodEnd}`,
    '',
    '── SERVICES RENDERED ───────────────────────────────────',
  ];

  for (const item of claim.lineItems) {
    lines.push(`  ${item.date}  ${item.description}`);
    lines.push(`    Service: ${item.serviceType.replace(/_/g, ' ')}`);
    lines.push(
      `    Hours: ${item.hours}  Rate: $${item.rate.toFixed(2)}/hr  Amount: $${item.amount.toFixed(2)}`,
    );
    if (item.cptCode) {
      lines.push(`    CPT Code: ${item.cptCode}`);
    }
    lines.push('');
  }

  lines.push(
    '── TOTAL ───────────────────────────────────────────────',
    `Total Amount Due: $${claim.totalAmount.toFixed(2)}`,
    '',
    `Provider: ${COOP_BUSINESS.name}`,
    `EIN: ${COOP_BUSINESS.ein}`,
    `Address: ${COOP_BUSINESS.address}`,
    '═══════════════════════════════════════════════════════════',
  );

  return lines.join('\n');
}

// ── Annual Summary ────────────────────────────────────────

async function getAnnualSummary(familyId: string, taxYear: number): Promise<ReimbursementSummary> {
  const claims = await queries.listReimbursementClaimsByTaxYear(familyId, taxYear);

  let totalSpent = 0;
  let totalReimbursed = 0;
  let totalPending = 0;
  let totalDenied = 0;
  let totalProcessingDays = 0;
  let resolvedCount = 0;

  for (const claim of claims) {
    totalSpent += claim.totalAmount;

    if (claim.status === 'approved') {
      totalReimbursed += claim.estimatedReimbursement;
    } else if (claim.status === 'submitted' || claim.status === 'resubmitted') {
      totalPending += claim.estimatedReimbursement;
    } else if (claim.status === 'denied') {
      totalDenied += claim.totalAmount;
    }

    if (claim.resolvedAt && claim.submittedAt) {
      const submitted = new Date(claim.submittedAt).getTime();
      const resolved = new Date(claim.resolvedAt).getTime();
      totalProcessingDays += (resolved - submitted) / (1000 * 60 * 60 * 24);
      resolvedCount++;
    }
  }

  const averageProcessingDays =
    resolvedCount > 0 ? Math.round(totalProcessingDays / resolvedCount) : 0;

  const savingsPercentage =
    totalSpent > 0 ? Math.round((totalReimbursed / totalSpent) * 10000) / 100 : 0;

  return {
    familyId,
    taxYear,
    totalSpent: Math.round(totalSpent * 100) / 100,
    totalReimbursed: Math.round(totalReimbursed * 100) / 100,
    totalPending: Math.round(totalPending * 100) / 100,
    totalDenied: Math.round(totalDenied * 100) / 100,
    claimCount: claims.length,
    averageProcessingDays,
    savingsPercentage,
  };
}

// ── Annual Tax Statement ──────────────────────────────────

async function generateAnnualStatement(familyId: string, taxYear: number): Promise<string> {
  const summary = await getAnnualSummary(familyId, taxYear);
  const claims = await queries.listReimbursementClaimsByTaxYear(familyId, taxYear);

  // Collect all unique IRS categories across all claims
  const allCategories = new Set<string>();
  for (const claim of claims) {
    for (const cat of claim.irsCategories) {
      allCategories.add(cat);
    }
  }

  const lines: string[] = [
    '═══════════════════════════════════════════════════════════',
    '          ANNUAL TAX STATEMENT — MEDICAL EXPENSES',
    `              ${COOP_BUSINESS.name}`,
    `                    Tax Year ${taxYear}`,
    '═══════════════════════════════════════════════════════════',
    '',
    `Family ID: ${familyId}`,
    `Generated: ${new Date().toISOString().substring(0, 10)}`,
    '',
    '── ANNUAL SUMMARY ──────────────────────────────────────',
    `Total Claims Filed:          ${summary.claimCount}`,
    `Total Care Expenses:         $${summary.totalSpent.toFixed(2)}`,
    `Total Reimbursed (Approved): $${summary.totalReimbursed.toFixed(2)}`,
    `Total Pending:               $${summary.totalPending.toFixed(2)}`,
    `Total Denied:                $${summary.totalDenied.toFixed(2)}`,
    `Effective Savings Rate:      ${summary.savingsPercentage}%`,
    `Avg Processing Time:         ${summary.averageProcessingDays} days`,
    '',
    '── IRS PUBLICATION 502 CATEGORIES ──────────────────────',
    'The following IRS-qualifying medical expense categories apply:',
    ...Array.from(allCategories).map((cat) => `  - ${cat.replace(/_/g, ' ')}`),
    '',
    '── CLAIMS DETAIL ───────────────────────────────────────',
  ];

  for (const claim of claims) {
    lines.push(
      `  Claim: ${claim.id}`,
      `    Period: ${claim.claimPeriodStart} to ${claim.claimPeriodEnd}`,
      `    Care Recipient: ${claim.careRecipientName}`,
      `    Amount: $${claim.totalAmount.toFixed(2)}`,
      `    Status: ${claim.status.toUpperCase()}`,
      `    LMN: ${claim.lmnId}`,
      '',
    );
  }

  lines.push(
    '── TAX FILING GUIDANCE ─────────────────────────────────',
    'These expenses may be deductible on IRS Schedule A (Itemized',
    'Deductions) under medical expenses, subject to the 7.5% AGI',
    'threshold. HSA/FSA reimbursements are tax-free.',
    '',
    'For questions about deductibility, consult your tax advisor.',
    '',
    '── PROVIDER CERTIFICATION ──────────────────────────────',
    `I certify that the above expenses were incurred for qualified`,
    `medical care services as defined by IRS Publication 502.`,
    '',
    `Provider: ${COOP_BUSINESS.name}`,
    `EIN: ${COOP_BUSINESS.ein}`,
    `Address: ${COOP_BUSINESS.address}`,
    '═══════════════════════════════════════════════════════════',
  );

  return lines.join('\n');
}

// ── Auto-Generate Monthly Claims ──────────────────────────

async function autoGenerateMonthly(
  month?: number,
  year?: number,
): Promise<ReimbursementClaimRecord[]> {
  const now = new Date();
  // Default: previous month
  const targetDate = new Date(year ?? now.getFullYear(), (month ?? now.getMonth()) - 1, 1);
  const periodStart = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-01`;

  const lastDay = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
  const periodEnd = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  logger.info({ periodStart, periodEnd }, 'Auto-generating monthly reimbursement claims');

  // Find all families with active LMNs
  const eligibleFamilies = await queries.listFamiliesWithActiveLMNs();
  const createdClaims: ReimbursementClaimRecord[] = [];

  for (const entry of eligibleFamilies) {
    try {
      // Check if a claim already exists for this period + care recipient
      const existingClaims = await queries.listReimbursementClaimsByCareRecipient(
        entry.careRecipientId,
      );
      const alreadyExists = existingClaims.some(
        (c) => c.claimPeriodStart === periodStart && c.claimPeriodEnd === periodEnd,
      );
      if (alreadyExists) {
        logger.debug(
          { careRecipientId: entry.careRecipientId, periodStart },
          'Claim already exists for period, skipping',
        );
        continue;
      }

      // Check if there are any completed tasks in the period
      const tasks = await queries.listCompletedTasksForCareRecipient(
        entry.careRecipientId,
        periodStart,
        periodEnd,
      );
      if (tasks.length === 0) {
        continue; // No services rendered, skip
      }

      const claim = await createClaim('system', {
        familyId: entry.familyId,
        careRecipientId: entry.careRecipientId,
        lmnId: entry.lmnId,
        claimPeriodStart: periodStart,
        claimPeriodEnd: periodEnd,
      });

      // Auto-advance to ready status since it was system-generated
      await queries.updateReimbursementClaim(claim.id, { status: 'ready' });
      claim.status = 'ready';

      createdClaims.push(claim);
    } catch (err) {
      logger.warn(
        { err, careRecipientId: entry.careRecipientId },
        'Failed to auto-generate claim for care recipient',
      );
    }
  }

  logger.info(
    { claimsCreated: createdClaims.length, period: `${periodStart} to ${periodEnd}` },
    'Monthly auto-generation complete',
  );

  return createdClaims;
}

export const reimbursementService = {
  createClaim,
  listClaims,
  getClaim,
  updateClaim,
  submitClaim,
  resolveClaim,
  generateEOB,
  generateReceipt,
  getAnnualSummary,
  generateAnnualStatement,
  autoGenerateMonthly,
};
