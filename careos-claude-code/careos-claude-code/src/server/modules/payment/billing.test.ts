/**
 * Billing tests — reconciliation categorization, IRS 502 eligibility, statement totals
 */
import { describe, it, expect } from 'vitest';
import { reconciliationService } from './reconciliation';
import { irs502Service } from './irs502';
import { statementService } from './statements';
import { IRS_PUB_502_CATEGORIES, getPub502ForOmahaProblem } from '@shared/constants/irs-pub502';
import { TIME_BANK, FINANCIALS } from '@shared/constants/business-rules';
import type { ReconciliationEntry } from './reconciliation';
import type { LMNRecord } from '../../database/queries/lmn';
import { statementQuerySchema, eligibilityQuerySchema, annualStatementSchema } from './schemas';

// ── Reconciliation: Categorization ───────────────────────

describe('Reconciliation: Stripe Charge Categorization', () => {
  const { categorizeStripeCharge } = reconciliationService;

  it('categorizes membership charges', () => {
    expect(categorizeStripeCharge({ type: 'membership' })).toBe('membership');
  });

  it('categorizes membership renewal charges', () => {
    expect(categorizeStripeCharge({ type: 'membership_renewal' })).toBe('membership');
  });

  it('categorizes credit purchase charges', () => {
    expect(categorizeStripeCharge({ type: 'credit_purchase' })).toBe('credit_purchase');
  });

  it('categorizes comfort card charges', () => {
    expect(categorizeStripeCharge({ type: 'comfort_card' })).toBe('comfort_card');
  });

  it('defaults to private_pay for unknown types', () => {
    expect(categorizeStripeCharge({ type: 'unknown' })).toBe('private_pay');
    expect(categorizeStripeCharge({})).toBe('private_pay');
  });
});

describe('Reconciliation: Entry Summarization', () => {
  const { summarizeEntries } = reconciliationService;

  const entries: ReconciliationEntry[] = [
    {
      id: '1',
      date: '2026-01-05',
      category: 'membership',
      description: 'Membership',
      amountCents: 10000,
      hsaFsaEligible: true,
      irsPub502Categories: ['medical_care_services'],
    },
    {
      id: '2',
      date: '2026-01-10',
      category: 'credit_purchase',
      description: 'Credits',
      amountCents: 4500,
      hsaFsaEligible: true,
      irsPub502Categories: ['medical_care_services'],
    },
    {
      id: '3',
      date: '2026-01-15',
      category: 'comfort_card',
      description: 'Comfort Card',
      amountCents: 15000,
      hsaFsaEligible: true,
      irsPub502Categories: ['PERSONAL_CARE'],
    },
    {
      id: '4',
      date: '2026-01-20',
      category: 'private_pay',
      description: 'Private',
      amountCents: 5000,
      hsaFsaEligible: false,
      irsPub502Categories: [],
    },
  ];

  it('calculates total amount correctly', () => {
    const summary = summarizeEntries(entries);
    expect(summary.totalAmountCents).toBe(34500);
  });

  it('calculates HSA eligible total', () => {
    const summary = summarizeEntries(entries);
    expect(summary.hsaEligibleCents).toBe(29500);
  });

  it('calculates non-eligible total', () => {
    const summary = summarizeEntries(entries);
    expect(summary.nonEligibleCents).toBe(5000);
  });

  it('breaks down by category', () => {
    const summary = summarizeEntries(entries);
    expect(summary.byCategory.membership).toBe(10000);
    expect(summary.byCategory.credit_purchase).toBe(4500);
    expect(summary.byCategory.comfort_card).toBe(15000);
    expect(summary.byCategory.private_pay).toBe(5000);
  });

  it('counts entries', () => {
    const summary = summarizeEntries(entries);
    expect(summary.entryCount).toBe(4);
  });

  it('handles empty entries', () => {
    const summary = summarizeEntries([]);
    expect(summary.totalAmountCents).toBe(0);
    expect(summary.entryCount).toBe(0);
  });
});

describe('Reconciliation: Monthly Grouping', () => {
  const { groupByMonth } = reconciliationService;

  const entries: ReconciliationEntry[] = [
    {
      id: '1',
      date: '2026-01-05',
      category: 'membership',
      description: 'Jan',
      amountCents: 10000,
      hsaFsaEligible: true,
      irsPub502Categories: [],
    },
    {
      id: '2',
      date: '2026-01-15',
      category: 'credit_purchase',
      description: 'Jan Credits',
      amountCents: 4500,
      hsaFsaEligible: true,
      irsPub502Categories: [],
    },
    {
      id: '3',
      date: '2026-02-05',
      category: 'comfort_card',
      description: 'Feb',
      amountCents: 15000,
      hsaFsaEligible: true,
      irsPub502Categories: [],
    },
    {
      id: '4',
      date: '2026-03-05',
      category: 'comfort_card',
      description: 'Mar',
      amountCents: 15000,
      hsaFsaEligible: false,
      irsPub502Categories: [],
    },
  ];

  it('groups entries by month', () => {
    const months = groupByMonth(entries);
    expect(months.length).toBe(3);
  });

  it('sorts months chronologically', () => {
    const months = groupByMonth(entries);
    expect(months[0]!.month).toBe('2026-01');
    expect(months[1]!.month).toBe('2026-02');
    expect(months[2]!.month).toBe('2026-03');
  });

  it('includes correct entries per month', () => {
    const months = groupByMonth(entries);
    expect(months[0]!.entries.length).toBe(2); // January has 2
    expect(months[1]!.entries.length).toBe(1); // February has 1
  });

  it('computes per-month summaries', () => {
    const months = groupByMonth(entries);
    expect(months[0]!.summary.totalAmountCents).toBe(14500); // 10000 + 4500
    expect(months[1]!.summary.totalAmountCents).toBe(15000);
  });
});

// ── Reconciliation: Cost Computation ─────────────────────

describe('Reconciliation: Cost Computation', () => {
  it('computes PEPM cost correctly', () => {
    expect(reconciliationService.computePEPMCost(50)).toBe(50 * FINANCIALS.EMPLOYER_PEPM_CENTS);
    expect(reconciliationService.computePEPMCost(0)).toBe(0);
  });

  it('computes credit cost with coordination/respite split', () => {
    const result = reconciliationService.computeCreditCost(10);
    expect(result.totalCents).toBe(10 * TIME_BANK.CASH_RATE_CENTS_PER_HOUR);
    expect(result.coordinationCents).toBe(10 * TIME_BANK.CASH_COORDINATION_SPLIT_CENTS);
    expect(result.respiteCents).toBe(10 * TIME_BANK.CASH_RESPITE_SPLIT_CENTS);
    expect(result.coordinationCents + result.respiteCents).toBe(result.totalCents);
  });
});

// ── IRS 502: Eligibility Logic ───────────────────────────

describe('IRS 502: Omaha Problem Mapping', () => {
  it('maps Omaha problem 38 to PERSONAL_CARE', () => {
    const categories = getPub502ForOmahaProblem(38);
    expect(categories.some((c) => c.code === 'PERSONAL_CARE')).toBe(true);
  });

  it('maps Omaha problem 13 to CAREGIVER_TRAINING and RESPITE_CARE', () => {
    const categories = getPub502ForOmahaProblem(13);
    const codes = categories.map((c) => c.code);
    expect(codes).toContain('CAREGIVER_TRAINING');
    expect(codes).toContain('RESPITE_CARE');
  });

  it('returns empty for unmapped Omaha codes', () => {
    const categories = getPub502ForOmahaProblem(999);
    expect(categories.length).toBe(0);
  });
});

describe('IRS 502: Category Deduplication', () => {
  const { getEligibleCategories } = irs502Service;

  it('deduplicates categories from multiple Omaha problems', () => {
    // Omaha 22 → PHYSICAL_THERAPY, THERAPEUTIC_EXERCISE, AQUATIC_THERAPY
    // Omaha 25 → PHYSICAL_THERAPY, OCCUPATIONAL_THERAPY, etc.
    // PHYSICAL_THERAPY should appear only once
    const categories = getEligibleCategories([22, 25]);
    const ptCount = categories.filter((c) => c.code === 'PHYSICAL_THERAPY').length;
    expect(ptCount).toBe(1);
  });

  it('returns empty for empty Omaha list', () => {
    expect(getEligibleCategories([]).length).toBe(0);
  });

  it('handles single Omaha problem', () => {
    const categories = getEligibleCategories([38]);
    expect(categories.length).toBeGreaterThan(0);
    // Omaha 38 maps to OCCUPATIONAL_THERAPY and PERSONAL_CARE
    const codes = categories.map((c) => c.code);
    expect(codes).toContain('PERSONAL_CARE');
  });
});

describe('IRS 502: LMN Active Check', () => {
  const { isLMNActive } = irs502Service;
  const future = new Date(Date.now() + 86400000 * 30).toISOString();
  const past = new Date(Date.now() - 86400000).toISOString();

  const baseLMN: LMNRecord = {
    id: 'lmn:test',
    careRecipientId: 'cr:1',
    careRecipientName: 'Test',
    generatedBy: 'user:1',
    signingPhysicianId: null,
    signingPhysicianName: null,
    criAssessmentId: 'cri:1',
    criScore: 85,
    acuity: 'high',
    diagnosisCodes: [],
    omahaProblems: [38],
    carePlanSummary: '',
    status: 'active',
    issuedAt: '2026-01-01T00:00:00Z',
    expiresAt: future,
    durationDays: 365,
    documentUrl: null,
    signatureRequestId: null,
    signedAt: null,
    signatureMethod: null,
    lastReminderTier: null,
    renewalCriId: null,
    fhirDocumentReferenceId: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  it('returns true for active LMN with future expiry', () => {
    expect(isLMNActive(baseLMN)).toBe(true);
  });

  it('returns true for expiring LMN with future expiry', () => {
    expect(isLMNActive({ ...baseLMN, status: 'expiring' })).toBe(true);
  });

  it('returns false for expired LMN', () => {
    expect(isLMNActive({ ...baseLMN, expiresAt: past })).toBe(false);
  });

  it('returns false for draft LMN', () => {
    expect(isLMNActive({ ...baseLMN, status: 'draft' })).toBe(false);
  });

  it('returns false for revoked LMN', () => {
    expect(isLMNActive({ ...baseLMN, status: 'revoked' })).toBe(false);
  });

  it('returns false when expiresAt is null', () => {
    expect(isLMNActive({ ...baseLMN, expiresAt: null })).toBe(false);
  });
});

describe('IRS 502: LMN Coverage Months', () => {
  const { computeLMNCoverageMonths } = irs502Service;

  const makeLMN = (status: string, issuedAt: string, expiresAt: string): LMNRecord => ({
    id: 'lmn:test',
    careRecipientId: 'cr:1',
    careRecipientName: 'Test',
    generatedBy: 'user:1',
    signingPhysicianId: null,
    signingPhysicianName: null,
    criAssessmentId: 'cri:1',
    criScore: 85,
    acuity: 'high',
    diagnosisCodes: [],
    omahaProblems: [38],
    carePlanSummary: '',
    status,
    issuedAt,
    expiresAt,
    durationDays: 365,
    documentUrl: null,
    signatureRequestId: null,
    signedAt: null,
    signatureMethod: null,
    lastReminderTier: null,
    renewalCriId: null,
    fhirDocumentReferenceId: null,
    createdAt: issuedAt,
    updatedAt: issuedAt,
  });

  it('counts 12 months for full-year active LMN', () => {
    const lmn = makeLMN('active', '2025-01-01', '2025-12-31');
    expect(computeLMNCoverageMonths([lmn], 2025)).toBe(12);
  });

  it('counts partial year correctly', () => {
    // Use mid-month dates to avoid UTC/local timezone boundary issues
    const lmn = makeLMN('active', '2025-07-15T12:00:00Z', '2025-12-15T12:00:00Z');
    expect(computeLMNCoverageMonths([lmn], 2025)).toBe(6);
  });

  it('skips draft LMNs', () => {
    const lmn = makeLMN('draft', '2025-01-01', '2025-12-31');
    expect(computeLMNCoverageMonths([lmn], 2025)).toBe(0);
  });

  it('skips revoked LMNs', () => {
    const lmn = makeLMN('revoked', '2025-01-01', '2025-12-31');
    expect(computeLMNCoverageMonths([lmn], 2025)).toBe(0);
  });

  it('handles multiple LMNs with overlap', () => {
    const lmn1 = makeLMN('expired', '2025-01-01', '2025-06-30');
    const lmn2 = makeLMN('active', '2025-06-01', '2025-12-31');
    // June is covered by both, but counted once
    expect(computeLMNCoverageMonths([lmn1, lmn2], 2025)).toBe(12);
  });

  it('returns 0 for year with no active LMNs', () => {
    const lmn = makeLMN('active', '2024-01-01', '2024-12-31');
    expect(computeLMNCoverageMonths([lmn], 2025)).toBe(0);
  });
});

// ── Statement Service ────────────────────────────────────

describe('Statement: Monthly Generation', () => {
  const { generateMonthlyStatement } = statementService;

  const entries: ReconciliationEntry[] = [
    {
      id: '1',
      date: '2026-03-01',
      category: 'comfort_card',
      description: 'Comfort Card',
      amountCents: 15000,
      hsaFsaEligible: true,
      irsPub502Categories: ['PERSONAL_CARE'],
    },
    {
      id: '2',
      date: '2026-03-10',
      category: 'credit_purchase',
      description: 'Credits',
      amountCents: 4500,
      hsaFsaEligible: true,
      irsPub502Categories: ['medical_care_services'],
    },
    {
      id: '3',
      date: '2026-03-15',
      category: 'private_pay',
      description: 'Private',
      amountCents: 3000,
      hsaFsaEligible: false,
      irsPub502Categories: [],
    },
  ];

  it('generates statement with correct family info', () => {
    const stmt = generateMonthlyStatement('fam:1', 'Johnson', '2026-03', entries, true);
    expect(stmt.familyId).toBe('fam:1');
    expect(stmt.familyName).toBe('Johnson');
    expect(stmt.month).toBe('2026-03');
  });

  it('includes all line items', () => {
    const stmt = generateMonthlyStatement('fam:1', 'Johnson', '2026-03', entries, true);
    expect(stmt.entries.length).toBe(3);
  });

  it('computes statement summary correctly', () => {
    const stmt = generateMonthlyStatement('fam:1', 'Johnson', '2026-03', entries, true);
    expect(stmt.summary.totalChargesCents).toBe(22500);
    expect(stmt.summary.comfortCardCents).toBe(15000);
    expect(stmt.summary.creditPurchasesCents).toBe(4500);
  });

  it('computes HSA/FSA summary', () => {
    const stmt = generateMonthlyStatement('fam:1', 'Johnson', '2026-03', entries, true);
    expect(stmt.hsaFsaSummary.eligibleAmountCents).toBe(19500);
    expect(stmt.hsaFsaSummary.nonEligibleAmountCents).toBe(3000);
    expect(stmt.hsaFsaSummary.lmnOnFile).toBe(true);
  });
});

describe('Statement: Annual Tax Generation', () => {
  const { generateAnnualTaxStatement } = statementService;

  const monthlyData = [
    {
      month: '2025-01',
      entries: [
        {
          id: '1',
          date: '2025-01-05',
          category: 'membership' as const,
          description: 'Membership',
          amountCents: 10000,
          hsaFsaEligible: true,
          irsPub502Categories: ['medical_care_services'],
        },
        {
          id: '2',
          date: '2025-01-10',
          category: 'comfort_card' as const,
          description: 'CC',
          amountCents: 15000,
          hsaFsaEligible: true,
          irsPub502Categories: ['PERSONAL_CARE'],
        },
      ],
    },
    {
      month: '2025-02',
      entries: [
        {
          id: '3',
          date: '2025-02-05',
          category: 'comfort_card' as const,
          description: 'CC',
          amountCents: 15000,
          hsaFsaEligible: true,
          irsPub502Categories: ['PERSONAL_CARE'],
        },
        {
          id: '4',
          date: '2025-02-10',
          category: 'private_pay' as const,
          description: 'Private',
          amountCents: 5000,
          hsaFsaEligible: false,
          irsPub502Categories: [],
        },
      ],
    },
  ];

  it('computes annual totals', () => {
    const stmt = generateAnnualTaxStatement('fam:1', 'Johnson', 2025, monthlyData, 10);
    expect(stmt.totalPaidCents).toBe(45000);
    expect(stmt.hsaFsaEligibleCents).toBe(40000);
    expect(stmt.nonEligibleCents).toBe(5000);
  });

  it('includes monthly breakdown', () => {
    const stmt = generateAnnualTaxStatement('fam:1', 'Johnson', 2025, monthlyData, 10);
    expect(stmt.monthlyBreakdown.length).toBe(2);
    expect(stmt.monthlyBreakdown[0]!.month).toBe('2025-01');
    expect(stmt.monthlyBreakdown[0]!.totalCents).toBe(25000);
    expect(stmt.monthlyBreakdown[0]!.eligibleCents).toBe(25000);
  });

  it('includes category breakdown', () => {
    const stmt = generateAnnualTaxStatement('fam:1', 'Johnson', 2025, monthlyData, 10);
    const ccCategory = stmt.categoryBreakdown.find((c) => c.category === 'comfort_card');
    expect(ccCategory).toBeDefined();
    expect(ccCategory!.totalCents).toBe(30000);
    expect(ccCategory!.eligibleCents).toBe(30000);
  });

  it('includes IRS 502 summary', () => {
    const stmt = generateAnnualTaxStatement('fam:1', 'Johnson', 2025, monthlyData, 10);
    const personalCare = stmt.pub502Summary.find((s) => s.code === 'PERSONAL_CARE');
    expect(personalCare).toBeDefined();
    expect(personalCare!.amountCents).toBe(30000);
  });

  it('includes LMN coverage months', () => {
    const stmt = generateAnnualTaxStatement('fam:1', 'Johnson', 2025, monthlyData, 10);
    expect(stmt.lmnCoverageMonths).toBe(10);
  });

  it('includes disclaimers', () => {
    const stmt = generateAnnualTaxStatement('fam:1', 'Johnson', 2025, monthlyData, 10);
    expect(stmt.disclaimers.length).toBeGreaterThan(0);
    expect(stmt.disclaimers.some((d) => d.includes('IRS Publication 502'))).toBe(true);
  });
});

describe('Statement: Format Cents', () => {
  const { formatCents } = statementService;

  it('formats whole dollars', () => {
    expect(formatCents(10000)).toBe('$100.00');
  });

  it('formats cents', () => {
    expect(formatCents(450)).toBe('$4.50');
  });

  it('formats zero', () => {
    expect(formatCents(0)).toBe('$0.00');
  });

  it('formats large amounts with comma separators', () => {
    expect(formatCents(1603700)).toBe('$16,037.00');
  });
});

// ── Schema Validation ────────────────────────────────────

describe('Billing: Schema Validation', () => {
  describe('statementQuerySchema', () => {
    it('accepts valid month format', () => {
      expect(statementQuerySchema.safeParse({ familyId: 'f:1', month: '2026-03' }).success).toBe(
        true,
      );
    });

    it('rejects invalid month format', () => {
      expect(statementQuerySchema.safeParse({ familyId: 'f:1', month: '2026/03' }).success).toBe(
        false,
      );
    });

    it('accepts valid year', () => {
      expect(statementQuerySchema.safeParse({ familyId: 'f:1', year: 2025 }).success).toBe(true);
    });

    it('rejects year out of range', () => {
      expect(statementQuerySchema.safeParse({ familyId: 'f:1', year: 2023 }).success).toBe(false);
    });
  });

  describe('eligibilityQuerySchema', () => {
    it('accepts valid careRecipientId', () => {
      expect(eligibilityQuerySchema.safeParse({ careRecipientId: 'cr:123' }).success).toBe(true);
    });

    it('rejects empty careRecipientId', () => {
      expect(eligibilityQuerySchema.safeParse({ careRecipientId: '' }).success).toBe(false);
    });
  });

  describe('annualStatementSchema', () => {
    it('accepts valid input', () => {
      expect(annualStatementSchema.safeParse({ familyId: 'f:1', year: 2025 }).success).toBe(true);
    });

    it('coerces string year', () => {
      const result = annualStatementSchema.safeParse({ familyId: 'f:1', year: '2025' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.year).toBe(2025);
    });

    it('rejects missing familyId', () => {
      expect(annualStatementSchema.safeParse({ year: 2025 }).success).toBe(false);
    });
  });
});

// ── IRS 502: Category Constants ──────────────────────────

describe('IRS 502: Category Constants', () => {
  it('has 18 categories', () => {
    expect(IRS_PUB_502_CATEGORIES.length).toBe(18);
  });

  it('includes PERSONAL_CARE for companion care', () => {
    const pc = IRS_PUB_502_CATEGORIES.find((c) => c.code === 'PERSONAL_CARE');
    expect(pc).toBeDefined();
    expect(pc!.omahaProblems).toContain(38);
  });

  it('includes RESPITE_CARE', () => {
    const rc = IRS_PUB_502_CATEGORIES.find((c) => c.code === 'RESPITE_CARE');
    expect(rc).toBeDefined();
    expect(rc!.omahaProblems).toContain(13);
  });

  it('all categories have required fields', () => {
    for (const cat of IRS_PUB_502_CATEGORIES) {
      expect(cat.code).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.description).toBeTruthy();
      expect(cat.omahaProblems.length).toBeGreaterThan(0);
    }
  });
});
