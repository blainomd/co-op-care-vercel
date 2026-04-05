/**
 * CRI (Care Readiness Index) Scoring Engine
 * 14 factors, weighted scores
 * Raw range: 14.4 — 72.0
 * Requires MD review
 *
 * Acuity levels drive care plan intensity and LMN eligibility.
 */
import { CRI_MIN_RAW, CRI_MAX_RAW, CRI_FACTOR_COUNT } from '@shared/constants/business-rules';

export interface CRIFactor {
  name: string;
  weight: number;
  score: number;
}

export type CRIAcuity = 'low' | 'moderate' | 'high' | 'critical';

export interface CRIResult {
  factors: CRIFactor[];
  rawScore: number;
  clamped: boolean;
  acuity: CRIAcuity;
  lmnEligible: boolean; // true when acuity ≥ high (score ≥ 45)
}

/**
 * The 14 CRI factors with default weights.
 * Weights are fixed in the PRD — the MD reviews the score inputs, not the weights.
 */
export const CRI_FACTOR_DEFINITIONS = [
  {
    name: 'Cognitive Status',
    weight: 1.2,
    description: 'Orientation, memory, and executive function',
  },
  { name: 'Functional Mobility', weight: 1.2, description: 'Ambulation, transfers, and balance' },
  { name: 'ADL Independence', weight: 1.0, description: 'Bathing, dressing, toileting, feeding' },
  {
    name: 'IADL Capacity',
    weight: 0.8,
    description: 'Cooking, finances, medication management, phone use',
  },
  {
    name: 'Medication Complexity',
    weight: 1.0,
    description: 'Number of medications, interactions, administration route',
  },
  {
    name: 'Behavioral Challenges',
    weight: 1.2,
    description: 'Agitation, wandering, sundowning, aggression',
  },
  {
    name: 'Fall Risk',
    weight: 1.0,
    description: 'Fall history, environmental hazards, assistive device use',
  },
  {
    name: 'Nutritional Status',
    weight: 0.8,
    description: 'Weight stability, dysphagia risk, special diets',
  },
  {
    name: 'Social Support Network',
    weight: 0.8,
    description: 'Family involvement, caregiver availability, isolation',
  },
  {
    name: 'Caregiver Burnout Level',
    weight: 1.0,
    description: 'Caregiver stress, respite needs, CII zone correlation',
  },
  {
    name: 'Home Environment Safety',
    weight: 0.8,
    description: 'Grab bars, lighting, stairs, trip hazards',
  },
  {
    name: 'Emergency Preparedness',
    weight: 0.6,
    description: 'Emergency contacts, medical alert, advance directives',
  },
  {
    name: 'Financial Resources',
    weight: 0.6,
    description: 'Insurance coverage, ability to pay, benefit eligibility',
  },
  {
    name: 'Care Plan Adherence History',
    weight: 0.8,
    description: 'Compliance with previous care plans, follow-through',
  },
] as const;

/** Acuity thresholds */
const ACUITY_THRESHOLDS = {
  low: 0, // 14.4 – 29.9
  moderate: 30, // 30.0 – 44.9
  high: 45, // 45.0 – 59.9 → LMN eligible
  critical: 60, // 60.0 – 72.0
} as const;

/** LMN is triggered when score reaches 'high' acuity (≥ 45) */
export const LMN_THRESHOLD = ACUITY_THRESHOLDS.high;

/**
 * Classify acuity level from raw CRI score
 */
export function classifyAcuity(rawScore: number): CRIAcuity {
  if (rawScore >= ACUITY_THRESHOLDS.critical) return 'critical';
  if (rawScore >= ACUITY_THRESHOLDS.high) return 'high';
  if (rawScore >= ACUITY_THRESHOLDS.moderate) return 'moderate';
  return 'low';
}

/**
 * Score a CRI assessment (14 weighted factors)
 */
export function scoreCRI(factors: CRIFactor[]): CRIResult {
  if (factors.length !== CRI_FACTOR_COUNT) {
    throw new Error(`CRI requires exactly ${CRI_FACTOR_COUNT} factors, got ${factors.length}`);
  }

  const rawScore = factors.reduce((sum, f) => sum + f.weight * f.score, 0);

  // Clamp to valid range
  const clamped = rawScore < CRI_MIN_RAW || rawScore > CRI_MAX_RAW;
  const clampedScore = Math.max(CRI_MIN_RAW, Math.min(CRI_MAX_RAW, rawScore));
  const finalScore = Math.round(clampedScore * 10) / 10; // 1 decimal

  const acuity = classifyAcuity(finalScore);

  return {
    factors,
    rawScore: finalScore,
    clamped,
    acuity,
    lmnEligible: finalScore >= LMN_THRESHOLD,
  };
}
