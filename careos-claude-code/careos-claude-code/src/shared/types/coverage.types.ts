/**
 * Coverage Intelligence Types — Medicaid/Insurance Monitoring
 *
 * Inspired by AccessIQ: predicts coverage gaps before they happen,
 * tracks renewal deadlines, and protects co-op.care revenue by
 * ensuring clients maintain active coverage.
 *
 * Key insight: 70% of Medicaid disenrollments come from paperwork
 * errors, not actual ineligibility. Proactive monitoring prevents
 * revenue loss of $40-80K/year per disenrolled client.
 *
 * December 2026 regulatory cliff: One Big Beautiful Bill Act doubles
 * Medicaid renewal frequency to every 6 months.
 */

// ============================================================
// COVERAGE STATUS
// ============================================================

export type CoverageType =
  | 'medicaid'
  | 'medicare_a'
  | 'medicare_b'
  | 'medicare_advantage'
  | 'private_insurance'
  | 'hsa_fsa'
  | 'self_pay'
  | 'va_benefits'
  | 'pace'
  | 'waiver_program';

export type CoverageStatus =
  | 'active' // Coverage confirmed and current
  | 'expiring_soon' // Within renewal window (90 days)
  | 'renewal_pending' // Renewal submitted, awaiting determination
  | 'at_risk' // Paperwork incomplete or issues flagged
  | 'lapsed' // Coverage expired — immediate action needed
  | 'terminated' // Formally ended — transition to alternate
  | 'unknown'; // Status not yet verified

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

// ============================================================
// CLIENT COVERAGE RECORD
// ============================================================

export interface ClientCoverage {
  id: string;
  careRecipientId: string;
  familyId: string;
  /** Primary coverage — most clients have Medicaid or Medicare */
  primaryCoverage: CoverageRecord;
  /** Secondary/supplemental coverage (Medicare + Medicaid dual-eligible, etc.) */
  secondaryCoverage?: CoverageRecord;
  /** HSA/FSA status — enables tax transformation via LMN */
  taxAdvantaged?: TaxAdvantagedAccount;
  /** Composite risk score across all coverage */
  overallRisk: RiskLevel;
  /** Revenue impact if coverage lapses */
  monthlyRevenueAtRisk: number; // cents
  /** Next action required */
  nextAction: CoverageAction | null;
  lastVerified: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoverageRecord {
  type: CoverageType;
  status: CoverageStatus;
  /** Payer name (e.g., "Health First Colorado", "Original Medicare Part B") */
  payerName: string;
  /** Member/subscriber ID */
  memberId?: string;
  /** Group number (private insurance) */
  groupNumber?: string;
  /** Coverage effective date */
  effectiveDate: string;
  /** Coverage end date (if known) */
  endDate?: string;
  /** Next renewal date */
  renewalDate?: string;
  /** Days until renewal (calculated) */
  daysUntilRenewal?: number;
  /** Renewal frequency in months (12 = annual, 6 = post-Dec 2026 Medicaid) */
  renewalFrequencyMonths: number;
  /** Risk factors affecting this coverage */
  riskFactors: CoverageRiskFactor[];
  /** Risk score for this specific coverage (0-100) */
  riskScore: number;
  /** Notes from last verification */
  verificationNotes?: string;
}

export interface TaxAdvantagedAccount {
  type: 'hsa' | 'fsa';
  /** Whether an active LMN exists for this care recipient */
  hasActiveLMN: boolean;
  /** LMN expiry date */
  lmnExpiryDate?: string;
  /** Estimated annual tax savings (cents) */
  estimatedAnnualSavings: number;
  /** Tax bracket used for calculation */
  taxBracketPercent: number;
}

// ============================================================
// RISK FACTORS
// ============================================================

export type RiskFactorCategory =
  | 'paperwork' // Missing/incomplete renewal documents
  | 'regulatory' // Policy changes affecting eligibility
  | 'income' // Income changes that may affect Medicaid
  | 'age_transition' // Aging into/out of programs (65 → Medicare)
  | 'residency' // Address changes, state moves
  | 'enrollment' // Open enrollment windows, plan changes
  | 'billing' // Billing issues, claims denied
  | 'system'; // Payer system changes, migrations

export interface CoverageRiskFactor {
  category: RiskFactorCategory;
  description: string;
  severity: RiskLevel;
  /** Whether this factor is actionable by co-op.care staff */
  actionable: boolean;
  /** Recommended action to mitigate */
  mitigation: string;
  /** Date this risk factor was identified */
  identifiedAt: string;
  /** Date this factor was resolved (null if still active) */
  resolvedAt?: string;
}

// ============================================================
// COVERAGE ACTIONS
// ============================================================

export type CoverageActionType =
  | 'verify_status' // Call payer to confirm active coverage
  | 'submit_renewal' // File renewal paperwork
  | 'complete_paperwork' // Client needs to provide documents
  | 'appeal_denial' // Coverage denied, appeal possible
  | 'transition_coverage' // Move to new coverage type
  | 'update_lmn' // LMN expiring, need physician renewal
  | 'contact_navigator' // Refer to benefits navigator/case worker
  | 'enroll_new_coverage' // Open enrollment action needed
  | 'dual_eligible_check'; // Check for Medicaid+Medicare dual eligibility

export interface CoverageAction {
  type: CoverageActionType;
  description: string;
  priority: RiskLevel;
  /** Who is responsible: family, caregiver, care_navigator, medical_director */
  assignedTo: 'family' | 'caregiver' | 'care_navigator' | 'medical_director';
  /** Due date — when this must be completed */
  dueDate: string;
  /** Days until due (calculated) */
  daysUntilDue: number;
  /** Is this action overdue? */
  isOverdue: boolean;
  /** Has this action been completed? */
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}

// ============================================================
// DASHBOARD AGGREGATES
// ============================================================

export interface CoverageIntelligenceSummary {
  /** Total clients being monitored */
  totalClients: number;
  /** Clients with active, confirmed coverage */
  activeCoverage: number;
  /** Clients with coverage expiring within 90 days */
  expiringSoon: number;
  /** Clients at high or critical risk */
  atRisk: number;
  /** Clients with lapsed coverage */
  lapsed: number;
  /** Total monthly revenue at risk (cents) */
  totalRevenueAtRisk: number;
  /** Pending actions requiring attention */
  pendingActions: number;
  /** Overdue actions */
  overdueActions: number;
  /** Coverage type distribution */
  coverageDistribution: Record<CoverageType, number>;
  /** Risk level distribution */
  riskDistribution: Record<RiskLevel, number>;
}

export interface CoverageAlert {
  id: string;
  careRecipientId: string;
  familyId: string;
  clientName: string;
  alertType: CoverageActionType;
  message: string;
  severity: RiskLevel;
  /** Revenue impact if unaddressed (cents/month) */
  revenueImpact: number;
  createdAt: string;
  dismissedAt?: string;
  resolvedAt?: string;
}

// ============================================================
// REGULATORY CALENDAR
// ============================================================

export interface RegulatoryEvent {
  id: string;
  title: string;
  description: string;
  effectiveDate: string;
  /** Which coverage types are affected */
  affectedCoverageTypes: CoverageType[];
  /** Impact assessment */
  impact: RiskLevel;
  /** What co-op.care needs to do */
  actionRequired: string;
  /** Source of the regulation */
  source: string;
}

/**
 * Key regulatory dates that affect coverage monitoring.
 * The December 2026 cliff is the most impactful:
 * One Big Beautiful Bill Act moves Medicaid renewals from
 * 12-month to 6-month cycles, doubling administrative burden.
 */
export interface RegulatoryCalendar {
  events: RegulatoryEvent[];
  /** Next critical date */
  nextCriticalDate: string;
  /** Number of clients affected by upcoming changes */
  clientsAffected: number;
}
