/**
 * Coverage Intelligence Rules — Medicaid/Insurance Monitoring
 *
 * Constants for tracking client coverage status, renewal cycles,
 * risk scoring, and regulatory deadlines. Inspired by AccessIQ's
 * Medicaid disenrollment prediction model.
 *
 * Core insight: 70% of Medicaid disenrollments stem from paperwork
 * errors, not ineligibility. Proactive monitoring = revenue protection.
 */

import type {
  CoverageType,
  CoverageStatus,
  RiskLevel,
  CoverageIntelligenceSummary,
  ClientCoverage,
  CoverageRecord,
  CoverageAlert,
  RegulatoryEvent,
} from '../types/coverage.types';

// ============================================================
// RISK SCORING THRESHOLDS
// ============================================================

export const COVERAGE_RISK = {
  /** Days until renewal that triggers "expiring soon" status */
  EXPIRING_SOON_DAYS: 90,
  /** Days until renewal that triggers "high risk" */
  HIGH_RISK_DAYS: 30,
  /** Days until renewal that triggers "critical" */
  CRITICAL_DAYS: 14,

  /** Risk score thresholds (0-100 scale) */
  THRESHOLDS: {
    low: { min: 0, max: 25 },
    moderate: { min: 26, max: 50 },
    high: { min: 51, max: 75 },
    critical: { min: 76, max: 100 },
  },

  /** Revenue impact per disenrolled client (annual, cents) */
  ANNUAL_REVENUE_LOSS_CENTS: {
    medicaid: 4800000, // $48,000/year (low end of $40-80K range)
    medicare_b: 6000000, // $60,000/year (PIN+CHI+CCM stacking)
    private_insurance: 3600000, // $36,000/year
    self_pay: 2400000, // $24,000/year (lowest retention risk)
  },

  /** Monthly revenue estimates per coverage type (cents) */
  MONTHLY_REVENUE_CENTS: {
    medicaid: 400000, // $4,000/mo
    medicare_a: 300000, // $3,000/mo
    medicare_b: 500000, // $5,000/mo (PIN+CHI billing)
    medicare_advantage: 450000, // $4,500/mo
    private_insurance: 300000, // $3,000/mo
    hsa_fsa: 0, // Supplemental, not primary revenue
    self_pay: 200000, // $2,000/mo
    va_benefits: 350000, // $3,500/mo
    pace: 550000, // $5,500/mo (capitated)
    waiver_program: 380000, // $3,800/mo
  },
} as const;

// ============================================================
// RENEWAL CYCLES BY COVERAGE TYPE
// ============================================================

export const RENEWAL_CYCLES = {
  /** Current Medicaid renewal: 12 months (pre-Dec 2026) */
  MEDICAID_CURRENT_MONTHS: 12,
  /**
   * Post-December 2026 Medicaid renewal: 6 months
   * One Big Beautiful Bill Act doubles renewal frequency.
   * This is the "regulatory cliff" that makes coverage monitoring critical.
   */
  MEDICAID_POST_CLIFF_MONTHS: 6,
  /** Medicare: annual (Oct-Dec enrollment, Jan effective) */
  MEDICARE_MONTHS: 12,
  /** Private insurance: annual (Nov-Jan open enrollment) */
  PRIVATE_INSURANCE_MONTHS: 12,
  /** PACE: continuous enrollment (no renewal) */
  PACE_MONTHS: null, // Continuous
  /** VA benefits: varies by program, typically annual */
  VA_MONTHS: 12,
  /** Medicaid waiver programs: varies, typically 12 months */
  WAIVER_MONTHS: 12,
} as const;

// ============================================================
// COLORADO-SPECIFIC MEDICAID (Health First Colorado)
// ============================================================

export const COLORADO_MEDICAID = {
  /** Program name */
  NAME: 'Health First Colorado',
  /** Managed by */
  ADMINISTRATOR: 'Colorado Department of Health Care Policy & Financing (HCPF)',
  /** Key waivers relevant to home care */
  WAIVERS: [
    {
      name: 'Elderly, Blind, and Disabled (EBD)',
      description: 'Home and community-based services for adults 65+ or disabled',
      renewalMonths: 12,
    },
    {
      name: 'Community Mental Health Supports (CMHS)',
      description: 'Community-based mental health support services',
      renewalMonths: 12,
    },
    {
      name: 'Brain Injury (BI)',
      description: 'Services for individuals with brain injuries',
      renewalMonths: 12,
    },
    {
      name: "Children's Extensive Support (CES)",
      description: 'Waiver for children with intellectual/developmental disabilities',
      renewalMonths: 12,
    },
  ],
  /** Income limits for eligibility (monthly, cents) */
  INCOME_LIMITS: {
    individual: 239100, // $2,391/mo (2024 FPL-based)
    couple: 322700, // $3,227/mo
  },
  /** Asset limits (cents) */
  ASSET_LIMITS: {
    individual: 200000, // $2,000
    couple: 300000, // $3,000
  },
} as const;

// ============================================================
// REGULATORY CALENDAR
// ============================================================

export const REGULATORY_EVENTS: RegulatoryEvent[] = [
  {
    id: 'reg-001',
    title: 'Colorado AI Act Enforcement Begins',
    description:
      'SB 24-205 takes effect — high-risk AI deployers must comply with impact assessments, consumer disclosures, and anti-discrimination requirements.',
    effectiveDate: '2026-06-30',
    affectedCoverageTypes: [],
    impact: 'moderate',
    actionRequired:
      'Ensure CareOS AI pipeline has completed pre-deployment impact assessment. Layer 2 + Layer 4 human oversight already satisfies core requirements.',
    source: 'Colorado SB 24-205 / SB 25B-004',
  },
  {
    id: 'reg-002',
    title: 'Medicaid Renewal Frequency Doubles',
    description:
      'One Big Beautiful Bill Act changes Medicaid renewals from 12-month to 6-month cycles. Administrative burden doubles for all Medicaid recipients.',
    effectiveDate: '2026-12-01',
    affectedCoverageTypes: ['medicaid', 'waiver_program'],
    impact: 'critical',
    actionRequired:
      'Update all Medicaid client renewal tracking to 6-month cycles. Increase outreach frequency. Prepare paperwork assistance workflow for Care Navigators.',
    source: 'One Big Beautiful Bill Act (HR 1)',
  },
  {
    id: 'reg-003',
    title: 'CMS ACCESS Model Cohort 2 Application Window',
    description:
      'Rolling admissions for January 2027 start. Target this cohort after establishing 6+ months of clinical data and completing Medicare Part B enrollment.',
    effectiveDate: '2026-10-01',
    affectedCoverageTypes: ['medicare_b'],
    impact: 'moderate',
    actionRequired:
      'Prepare ACCESS Model application with 6 months of Omaha System outcome data. Ensure CMS-855B enrollment is complete.',
    source: 'CMS Innovation Center — ACCESS Model RFA',
  },
  {
    id: 'reg-004',
    title: 'Medicare Open Enrollment Period',
    description:
      'Annual Medicare Advantage and Part D open enrollment. Clients may switch plans, affecting coverage continuity.',
    effectiveDate: '2026-10-15',
    affectedCoverageTypes: ['medicare_a', 'medicare_b', 'medicare_advantage'],
    impact: 'moderate',
    actionRequired:
      'Contact all Medicare clients to verify plan selections. Ensure co-op.care is in-network with any new plan choices.',
    source: 'CMS Medicare Annual Enrollment Period',
  },
];

// ============================================================
// RISK SCORING ALGORITHM
// ============================================================

/** Calculate risk score (0-100) for a coverage record */
export function calculateCoverageRiskScore(coverage: CoverageRecord): number {
  let score = 0;

  // Days until renewal factor (0-40 points)
  if (coverage.daysUntilRenewal !== undefined) {
    if (coverage.daysUntilRenewal <= 0) score += 40;
    else if (coverage.daysUntilRenewal <= COVERAGE_RISK.CRITICAL_DAYS) score += 35;
    else if (coverage.daysUntilRenewal <= COVERAGE_RISK.HIGH_RISK_DAYS) score += 25;
    else if (coverage.daysUntilRenewal <= COVERAGE_RISK.EXPIRING_SOON_DAYS) score += 15;
    else score += 0;
  }

  // Coverage status factor (0-30 points)
  const statusScores: Record<CoverageStatus, number> = {
    active: 0,
    expiring_soon: 10,
    renewal_pending: 15,
    at_risk: 25,
    lapsed: 30,
    terminated: 30,
    unknown: 20,
  };
  score += statusScores[coverage.status];

  // Risk factors (0-30 points, 5 per active factor, max 6)
  const activeFactors = coverage.riskFactors.filter((f) => !f.resolvedAt);
  score += Math.min(30, activeFactors.length * 5);

  return Math.min(100, score);
}

/** Determine risk level from score */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= COVERAGE_RISK.THRESHOLDS.critical.min) return 'critical';
  if (score >= COVERAGE_RISK.THRESHOLDS.high.min) return 'high';
  if (score >= COVERAGE_RISK.THRESHOLDS.moderate.min) return 'moderate';
  return 'low';
}

/** Get monthly revenue at risk for a coverage type */
export function getMonthlyRevenueAtRisk(type: CoverageType): number {
  return COVERAGE_RISK.MONTHLY_REVENUE_CENTS[type] ?? 200000;
}

// ============================================================
// DEMO DATA
// ============================================================

export const DEMO_COVERAGE_CLIENTS: ClientCoverage[] = [
  {
    id: 'cov-001',
    careRecipientId: 'cr-001',
    familyId: 'fam-001',
    primaryCoverage: {
      type: 'medicaid',
      status: 'expiring_soon',
      payerName: 'Health First Colorado',
      memberId: 'HFC-2024-7832',
      effectiveDate: '2025-04-15',
      renewalDate: '2026-04-15',
      daysUntilRenewal: 36,
      renewalFrequencyMonths: 12,
      riskFactors: [
        {
          category: 'paperwork',
          description: 'Renewal form not yet submitted — due in 36 days',
          severity: 'high',
          actionable: true,
          mitigation:
            'Contact family to gather required documents. Schedule Care Navigator visit to assist with renewal paperwork.',
          identifiedAt: '2026-03-01T00:00:00Z',
        },
      ],
      riskScore: 40,
    },
    taxAdvantaged: {
      type: 'hsa',
      hasActiveLMN: true,
      lmnExpiryDate: '2026-09-15',
      estimatedAnnualSavings: 432000, // $4,320
      taxBracketPercent: 32,
    },
    overallRisk: 'moderate',
    monthlyRevenueAtRisk: 400000, // $4,000
    nextAction: {
      type: 'submit_renewal',
      description: 'Submit Medicaid renewal paperwork for Health First Colorado',
      priority: 'high',
      assignedTo: 'care_navigator',
      dueDate: '2026-03-25',
      daysUntilDue: 15,
      isOverdue: false,
      completed: false,
    },
    lastVerified: '2026-03-01T00:00:00Z',
    createdAt: '2025-04-15T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },
  {
    id: 'cov-002',
    careRecipientId: 'cr-002',
    familyId: 'fam-002',
    primaryCoverage: {
      type: 'medicare_b',
      status: 'active',
      payerName: 'Original Medicare Part B',
      memberId: 'MBI-1A2B-3C4D-5E6',
      effectiveDate: '2024-01-01',
      renewalDate: '2027-01-01',
      daysUntilRenewal: 297,
      renewalFrequencyMonths: 12,
      riskFactors: [],
      riskScore: 0,
    },
    secondaryCoverage: {
      type: 'medicaid',
      status: 'active',
      payerName: 'Health First Colorado (Dual Eligible)',
      memberId: 'HFC-2023-4521',
      effectiveDate: '2023-06-01',
      renewalDate: '2026-06-01',
      daysUntilRenewal: 83,
      renewalFrequencyMonths: 12,
      riskFactors: [],
      riskScore: 10,
    },
    overallRisk: 'low',
    monthlyRevenueAtRisk: 0,
    nextAction: null,
    lastVerified: '2026-02-15T00:00:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'cov-003',
    careRecipientId: 'cr-003',
    familyId: 'fam-003',
    primaryCoverage: {
      type: 'medicaid',
      status: 'at_risk',
      payerName: 'Health First Colorado',
      memberId: 'HFC-2024-9103',
      effectiveDate: '2025-08-01',
      renewalDate: '2026-03-20',
      daysUntilRenewal: 10,
      renewalFrequencyMonths: 12,
      riskFactors: [
        {
          category: 'paperwork',
          description: 'Missing income verification — HCPF requesting updated documents',
          severity: 'critical',
          actionable: true,
          mitigation:
            'Urgent: Family must provide last 3 months pay stubs or SSI verification letter. Schedule same-day Care Navigator visit.',
          identifiedAt: '2026-02-20T00:00:00Z',
        },
        {
          category: 'income',
          description: 'Recent SSI adjustment may affect eligibility threshold',
          severity: 'moderate',
          actionable: false,
          mitigation:
            'Monitor HCPF determination. Prepare alternate coverage options if Medicaid is denied.',
          identifiedAt: '2026-03-01T00:00:00Z',
        },
      ],
      riskScore: 75,
    },
    overallRisk: 'critical',
    monthlyRevenueAtRisk: 400000,
    nextAction: {
      type: 'complete_paperwork',
      description: 'URGENT: Client must provide income verification to HCPF within 10 days',
      priority: 'critical',
      assignedTo: 'family',
      dueDate: '2026-03-15',
      daysUntilDue: 5,
      isOverdue: false,
      completed: false,
    },
    lastVerified: '2026-03-05T00:00:00Z',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },
  {
    id: 'cov-004',
    careRecipientId: 'cr-004',
    familyId: 'fam-004',
    primaryCoverage: {
      type: 'self_pay',
      status: 'active',
      payerName: 'Self-Pay (HSA/FSA)',
      effectiveDate: '2026-01-15',
      renewalFrequencyMonths: 12,
      riskFactors: [],
      riskScore: 0,
    },
    taxAdvantaged: {
      type: 'hsa',
      hasActiveLMN: true,
      lmnExpiryDate: '2026-07-15',
      estimatedAnnualSavings: 540000, // $5,400
      taxBracketPercent: 36,
    },
    overallRisk: 'low',
    monthlyRevenueAtRisk: 0,
    nextAction: {
      type: 'update_lmn',
      description: 'LMN expires in 4 months — schedule physician review for renewal',
      priority: 'low',
      assignedTo: 'medical_director',
      dueDate: '2026-06-15',
      daysUntilDue: 97,
      isOverdue: false,
      completed: false,
    },
    lastVerified: '2026-03-01T00:00:00Z',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },
  {
    id: 'cov-005',
    careRecipientId: 'cr-005',
    familyId: 'fam-005',
    primaryCoverage: {
      type: 'medicaid',
      status: 'lapsed',
      payerName: 'Health First Colorado',
      memberId: 'HFC-2023-6277',
      effectiveDate: '2023-09-01',
      endDate: '2026-03-01',
      renewalDate: '2026-03-01',
      daysUntilRenewal: -9,
      renewalFrequencyMonths: 12,
      riskFactors: [
        {
          category: 'paperwork',
          description: 'Renewal deadline missed — coverage lapsed March 1',
          severity: 'critical',
          actionable: true,
          mitigation:
            'File expedited reinstatement with HCPF. Coverage may be retroactively restored if filed within 90 days.',
          identifiedAt: '2026-03-02T00:00:00Z',
        },
      ],
      riskScore: 90,
    },
    overallRisk: 'critical',
    monthlyRevenueAtRisk: 400000,
    nextAction: {
      type: 'appeal_denial',
      description:
        'CRITICAL: File Medicaid reinstatement within 90-day window. Coverage lapsed 9 days ago.',
      priority: 'critical',
      assignedTo: 'care_navigator',
      dueDate: '2026-03-15',
      daysUntilDue: 5,
      isOverdue: false,
      completed: false,
    },
    lastVerified: '2026-03-02T00:00:00Z',
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },
];

/** Pre-computed demo summary */
export const DEMO_COVERAGE_SUMMARY: CoverageIntelligenceSummary = {
  totalClients: 5,
  activeCoverage: 2,
  expiringSoon: 1,
  atRisk: 1,
  lapsed: 1,
  totalRevenueAtRisk: 800000, // $8,000/mo (2 clients at risk)
  pendingActions: 4,
  overdueActions: 0,
  coverageDistribution: {
    medicaid: 3,
    medicare_a: 0,
    medicare_b: 1,
    medicare_advantage: 0,
    private_insurance: 0,
    hsa_fsa: 0,
    self_pay: 1,
    va_benefits: 0,
    pace: 0,
    waiver_program: 0,
  },
  riskDistribution: {
    low: 2,
    moderate: 1,
    high: 0,
    critical: 2,
  },
};

/** Demo alerts for the dashboard */
export const DEMO_COVERAGE_ALERTS: CoverageAlert[] = [
  {
    id: 'alert-001',
    careRecipientId: 'cr-005',
    familyId: 'fam-005',
    clientName: 'Margaret W.',
    alertType: 'appeal_denial',
    message:
      'Medicaid coverage lapsed 9 days ago. Reinstatement must be filed within 90-day window to restore coverage retroactively.',
    severity: 'critical',
    revenueImpact: 400000,
    createdAt: '2026-03-02T00:00:00Z',
  },
  {
    id: 'alert-002',
    careRecipientId: 'cr-003',
    familyId: 'fam-003',
    clientName: 'Robert K.',
    alertType: 'complete_paperwork',
    message:
      'Income verification documents due to HCPF in 10 days. SSI adjustment may affect eligibility.',
    severity: 'critical',
    revenueImpact: 400000,
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'alert-003',
    careRecipientId: 'cr-001',
    familyId: 'fam-001',
    clientName: 'Dorothy P.',
    alertType: 'submit_renewal',
    message: 'Medicaid renewal due in 36 days. Paperwork not yet started.',
    severity: 'high',
    revenueImpact: 400000,
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'alert-004',
    careRecipientId: 'cr-001',
    familyId: 'fam-001',
    clientName: 'All Medicaid Clients',
    alertType: 'contact_navigator',
    message:
      'REGULATORY ALERT: December 2026 — Medicaid renewals shift to 6-month cycles. Begin preparing all Medicaid clients for doubled renewal frequency.',
    severity: 'moderate',
    revenueImpact: 0,
    createdAt: '2026-03-10T00:00:00Z',
  },
];
