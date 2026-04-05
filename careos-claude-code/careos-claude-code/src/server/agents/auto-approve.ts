/**
 * LMN Auto-Approval Engine
 *
 * Most LMNs are routine. Josh shouldn't read 60% of them.
 * This engine evaluates every draft against clinical criteria and
 * auto-approves when ALL safety gates pass.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    TRIAGE MATRIX                            │
 * ├──────────────┬──────────────────────────┬──────────────────┤
 * │ AUTO-APPROVE │ All gates pass           │ Josh sees digest │
 * │ QUICK REVIEW │ Minor flags, age 85+     │ 30-sec glance    │
 * │ FULL REVIEW  │ High acuity, red CII     │ 3-5 min read     │
 * │ CLINICAL HOLD│ Exceeds scope, conflicts │ Clinical decision│
 * └──────────────┴──────────────────────────┴──────────────────┘
 *
 * Auto-approval gates (ALL must pass):
 * 1. Acuity: moderate (CRI 19-32)
 * 2. Caregiver: NOT in crisis (CII zone ≠ red)
 * 3. Risk flags: 0 critical flags
 * 4. Age: < 85 (elevated geriatric risk above 85)
 * 5. Medications: ≤ 5 active (no polypharmacy)
 * 6. Diagnoses: all standard/common codes
 * 7. Tier: Peace of Mind or Regular Companion (≤12 hrs/week)
 * 8. No contradictory data patterns
 *
 * If ANY gate fails → escalate to appropriate review tier.
 */
import { logger } from '../common/logger.js';

// ─── Types ──────────────────────────────────────────────────────────────

export type TriageTier = 'auto_approved' | 'quick_review' | 'full_review' | 'clinical_hold';

export interface TriageResult {
  tier: TriageTier;
  autoApproved: boolean;
  reason: string;
  gateResults: GateResult[];
  joshTimeEstimate: string; // "0 sec", "30 sec", "3-5 min", "requires decision"
  riskScore: number; // 0-100, higher = more risk
}

export interface GateResult {
  gate: string;
  passed: boolean;
  value: string;
  threshold: string;
  weight: number; // How much this gate contributes to risk score
}

export interface LMNTriageInput {
  criScore: number;
  criAcuity: 'low' | 'moderate' | 'high' | 'critical';
  ciiScore: number;
  ciiZone: 'green' | 'yellow' | 'red';
  careRecipientAge: number;
  medicationCount: number;
  riskFlags: string[];
  diagnosisCodes: string[];
  recommendedTier: string;
  recommendedHours: number;
  omahaProblemsCount: number;
  isRenewal: boolean; // Renewals with stable trajectory = safer to auto-approve
}

// ─── Unusual Diagnosis Codes ────────────────────────────────────────────
// These codes require physician review because they involve complex
// clinical judgment or unusual presentations.

const UNUSUAL_DX_CODES = new Set([
  'G20', // Parkinson's — complex medication timing
  'I50.9', // Heart failure — may need higher level of care
  'J44.1', // COPD exacerbation — acute, not companion care
  'I63.9', // Cerebral infarction — post-stroke complexity
  'G89.4', // Chronic pain syndrome — opioid considerations
  'R32', // Urinary incontinence — may indicate UTI
  'R13.10', // Dysphagia — aspiration risk
]);

// ─── Critical Risk Flag Patterns ────────────────────────────────────────

const CRITICAL_FLAG_PATTERNS = [
  'CRITICAL',
  'SEVERE',
  'COLLAPSE',
  'WHEELCHAIR_DEPENDENT',
  'POLYPHARMACY',
];

// ─── Gate Functions ─────────────────────────────────────────────────────

function gateAcuity(input: LMNTriageInput): GateResult {
  const passed = input.criScore >= 19 && input.criScore <= 32;
  return {
    gate: 'Acuity Level',
    passed,
    value: `CRI ${input.criScore}/50 (${input.criAcuity})`,
    threshold: 'CRI 19-32 (moderate only)',
    weight: passed ? 0 : 30,
  };
}

function gateCaregiverStability(input: LMNTriageInput): GateResult {
  const passed = input.ciiZone !== 'red';
  return {
    gate: 'Caregiver Stability',
    passed,
    value: `CII ${input.ciiScore}/30 (${input.ciiZone} zone)`,
    threshold: 'CII zone ≠ red (not in crisis)',
    weight: passed ? 0 : 25,
  };
}

function gateRiskFlags(input: LMNTriageInput): GateResult {
  const criticalFlags = input.riskFlags.filter((f) =>
    CRITICAL_FLAG_PATTERNS.some((p) => f.includes(p)),
  );
  const passed = criticalFlags.length === 0;
  return {
    gate: 'Critical Risk Flags',
    passed,
    value: `${criticalFlags.length} critical flags of ${input.riskFlags.length} total`,
    threshold: '0 critical flags',
    weight: passed ? 0 : 20 + criticalFlags.length * 5,
  };
}

function gateAge(input: LMNTriageInput): GateResult {
  const passed = input.careRecipientAge < 85;
  return {
    gate: 'Age Risk',
    passed,
    value: `Age ${input.careRecipientAge}`,
    threshold: 'Under 85',
    weight: passed ? 0 : 10,
  };
}

function gateMedications(input: LMNTriageInput): GateResult {
  const passed = input.medicationCount <= 5;
  return {
    gate: 'Medication Complexity',
    passed,
    value: `${input.medicationCount} active medications`,
    threshold: '≤ 5 medications (no polypharmacy)',
    weight: passed ? 0 : 15,
  };
}

function gateDiagnoses(input: LMNTriageInput): GateResult {
  const unusual = input.diagnosisCodes.filter((c) => UNUSUAL_DX_CODES.has(c));
  const passed = unusual.length === 0;
  return {
    gate: 'Diagnosis Complexity',
    passed,
    value: unusual.length > 0 ? `Unusual: ${unusual.join(', ')}` : 'All standard codes',
    threshold: 'No unusual/complex diagnosis codes',
    weight: passed ? 0 : 15,
  };
}

function gateCareTier(input: LMNTriageInput): GateResult {
  const passed = input.recommendedHours <= 12;
  return {
    gate: 'Care Intensity',
    passed,
    value: `${input.recommendedTier} (${input.recommendedHours} hrs/week)`,
    threshold: '≤ 12 hrs/week (Peace of Mind or Regular)',
    weight: passed ? 0 : 10,
  };
}

function gateDataConsistency(input: LMNTriageInput): GateResult {
  // Check for contradictory patterns
  const contradictions: string[] = [];

  // Low CRI but red CII = caregiver burning out for a low-acuity patient → possible psychosocial issue
  if (input.criScore < 19 && input.ciiZone === 'red') {
    contradictions.push(
      'Low acuity patient with caregiver in crisis — investigate psychosocial factors',
    );
  }

  // High CRI but green CII = patient is very sick but caregiver says they're fine → possible denial
  if (input.criScore >= 40 && input.ciiZone === 'green') {
    contradictions.push(
      'Critical acuity patient with caregiver reporting no strain — possible caregiver denial',
    );
  }

  // Many Omaha problems but low CRI = assessment may be incomplete
  if (input.omahaProblemsCount >= 5 && input.criScore < 25) {
    contradictions.push(
      'Many clinical problems identified but low CRI score — assessment may be incomplete',
    );
  }

  const passed = contradictions.length === 0;
  return {
    gate: 'Data Consistency',
    passed,
    value: passed ? 'No contradictions detected' : contradictions.join('; '),
    threshold: 'No contradictory data patterns',
    weight: passed ? 0 : 20,
  };
}

// ─── Main Triage Function ───────────────────────────────────────────────

export function triageLMN(input: LMNTriageInput): TriageResult {
  const gates: GateResult[] = [
    gateAcuity(input),
    gateCaregiverStability(input),
    gateRiskFlags(input),
    gateAge(input),
    gateMedications(input),
    gateDiagnoses(input),
    gateCareTier(input),
    gateDataConsistency(input),
  ];

  const failedGates = gates.filter((g) => !g.passed);
  const riskScore = Math.min(
    100,
    gates.reduce((sum, g) => sum + g.weight, 0),
  );

  // Determine tier
  let tier: TriageTier;
  let reason: string;
  let joshTimeEstimate: string;

  if (failedGates.length === 0) {
    // ALL gates passed → auto-approve
    tier = 'auto_approved';
    reason = 'All 8 safety gates passed. Standard moderate-acuity LMN with no clinical concerns.';
    joshTimeEstimate = '0 sec (auto-approved, daily digest)';
  } else if (riskScore <= 20) {
    // Minor issues → quick review
    tier = 'quick_review';
    const failedNames = failedGates.map((g) => g.gate).join(', ');
    reason = `Minor flag(s): ${failedNames}. Low risk — quick verification recommended.`;
    joshTimeEstimate = '30 sec glance';
  } else if (riskScore <= 50) {
    // Significant issues → full review
    tier = 'full_review';
    const failedNames = failedGates.map((g) => g.gate).join(', ');
    reason = `Significant clinical concern(s): ${failedNames}. Full physician review required.`;
    joshTimeEstimate = '3-5 min full review';
  } else {
    // Major issues → clinical hold
    tier = 'clinical_hold';
    const failedNames = failedGates.map((g) => g.gate).join(', ');
    reason = `Multiple critical concerns: ${failedNames}. Clinical decision required — may exceed companion care scope.`;
    joshTimeEstimate = 'Requires clinical decision';
  }

  // Renewals with stable trajectory get a tier bump toward auto-approve
  if (input.isRenewal && tier === 'quick_review' && riskScore <= 15) {
    tier = 'auto_approved';
    reason = 'Renewal with stable trajectory. Previously reviewed and approved. ' + reason;
    joshTimeEstimate = '0 sec (auto-approved renewal, daily digest)';
  }

  logger.info(
    {
      tier,
      riskScore,
      failedGateCount: failedGates.length,
      criScore: input.criScore,
      ciiZone: input.ciiZone,
      age: input.careRecipientAge,
    },
    `LMN triaged: ${tier} (risk score: ${riskScore})`,
  );

  return {
    tier,
    autoApproved: tier === 'auto_approved',
    reason,
    gateResults: gates,
    joshTimeEstimate,
    riskScore,
  };
}

// ─── Triage Statistics ──────────────────────────────────────────────────

export interface TriageStats {
  total: number;
  autoApproved: number;
  quickReview: number;
  fullReview: number;
  clinicalHold: number;
  autoApproveRate: number;
  estimatedJoshMinutes: number; // Total physician time needed
}

export function calculateTriageStats(results: TriageResult[]): TriageStats {
  const stats: TriageStats = {
    total: results.length,
    autoApproved: 0,
    quickReview: 0,
    fullReview: 0,
    clinicalHold: 0,
    autoApproveRate: 0,
    estimatedJoshMinutes: 0,
  };

  for (const r of results) {
    switch (r.tier) {
      case 'auto_approved':
        stats.autoApproved++;
        break;
      case 'quick_review':
        stats.quickReview++;
        stats.estimatedJoshMinutes += 0.5;
        break;
      case 'full_review':
        stats.fullReview++;
        stats.estimatedJoshMinutes += 4;
        break;
      case 'clinical_hold':
        stats.clinicalHold++;
        stats.estimatedJoshMinutes += 10;
        break;
    }
  }

  stats.autoApproveRate = stats.total > 0 ? stats.autoApproved / stats.total : 0;
  return stats;
}
