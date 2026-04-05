/**
 * KBS Trend Analysis Engine
 *
 * Analyzes longitudinal KBS (Knowledge-Behavior-Status) scores
 * to detect improvement, decline, or stagnation across Omaha problems.
 *
 * Escalation: auto-notify MD when any dimension declines 2+ points.
 */
import type { KBSRecord } from '../../database/queries/assessments.js';

export type TrendDirection = 'improving' | 'declining' | 'stable' | 'insufficient_data';

export interface DimensionTrend {
  dimension: 'knowledge' | 'behavior' | 'status';
  direction: TrendDirection;
  latestValue: number;
  previousValue: number | null;
  delta: number;
  escalationRequired: boolean; // true if decline >= 2 points
}

export interface KBSTrendResult {
  omahaProblemCode: number;
  assessmentCount: number;
  latestRating: KBSRecord | null;
  previousRating: KBSRecord | null;
  dimensions: DimensionTrend[];
  overallDirection: TrendDirection;
  escalationRequired: boolean; // true if ANY dimension needs escalation
}

/** Decline threshold that triggers MD escalation */
const ESCALATION_DECLINE_THRESHOLD = 2;

/**
 * Analyze KBS trend for a single Omaha problem
 * Requires at least 2 ratings for meaningful analysis
 */
export function analyzeKBSTrend(ratings: KBSRecord[]): KBSTrendResult {
  if (ratings.length === 0) {
    return {
      omahaProblemCode: 0,
      assessmentCount: 0,
      latestRating: null,
      previousRating: null,
      dimensions: [],
      overallDirection: 'insufficient_data',
      escalationRequired: false,
    };
  }

  // Sort by date descending (most recent first)
  const sorted = [...ratings].sort(
    (a, b) => new Date(b.ratedAt).getTime() - new Date(a.ratedAt).getTime(),
  );

  const latest = sorted[0]!;
  const previous = sorted.length >= 2 ? sorted[1]! : null;

  const dimensions: DimensionTrend[] = (['knowledge', 'behavior', 'status'] as const).map((dim) => {
    const latestValue = latest[dim];
    const previousValue = previous ? previous[dim] : null;
    const delta = previousValue !== null ? latestValue - previousValue : 0;

    let direction: TrendDirection;
    if (previousValue === null) {
      direction = 'insufficient_data';
    } else if (delta > 0) {
      direction = 'improving';
    } else if (delta < 0) {
      direction = 'declining';
    } else {
      direction = 'stable';
    }

    return {
      dimension: dim,
      direction,
      latestValue,
      previousValue,
      delta,
      escalationRequired: delta <= -ESCALATION_DECLINE_THRESHOLD,
    };
  });

  const escalationRequired = dimensions.some((d) => d.escalationRequired);

  // Overall direction: declining if any dimension declining, improving if all stable or improving
  let overallDirection: TrendDirection;
  if (!previous) {
    overallDirection = 'insufficient_data';
  } else if (dimensions.some((d) => d.direction === 'declining')) {
    overallDirection = 'declining';
  } else if (dimensions.every((d) => d.direction === 'improving' || d.direction === 'stable')) {
    overallDirection = dimensions.some((d) => d.direction === 'improving') ? 'improving' : 'stable';
  } else {
    overallDirection = 'stable';
  }

  return {
    omahaProblemCode: latest.omahaProblemCode,
    assessmentCount: ratings.length,
    latestRating: latest,
    previousRating: previous,
    dimensions,
    overallDirection,
    escalationRequired,
  };
}

/**
 * Analyze trends across multiple Omaha problems for a care recipient.
 * Returns per-problem trend results.
 */
export function analyzeMultiProblemTrends(allRatings: KBSRecord[]): KBSTrendResult[] {
  // Group ratings by Omaha problem code
  const byProblem = new Map<number, KBSRecord[]>();
  for (const rating of allRatings) {
    const existing = byProblem.get(rating.omahaProblemCode) ?? [];
    existing.push(rating);
    byProblem.set(rating.omahaProblemCode, existing);
  }

  return Array.from(byProblem.entries())
    .map(([, ratings]) => analyzeKBSTrend(ratings))
    .sort((a, b) => {
      // Escalation-required problems first, then by problem code
      if (a.escalationRequired !== b.escalationRequired) return a.escalationRequired ? -1 : 1;
      return a.omahaProblemCode - b.omahaProblemCode;
    });
}

/**
 * Check if an escalation should be triggered based on KBS trends.
 * Returns the dimensions that have declined by >= 2 points.
 */
export function getEscalationDetails(
  trendResult: KBSTrendResult,
): { dimension: string; from: number; to: number; delta: number }[] {
  return trendResult.dimensions
    .filter((d) => d.escalationRequired)
    .map((d) => ({
      dimension: d.dimension,
      from: d.previousValue ?? d.latestValue,
      to: d.latestValue,
      delta: d.delta,
    }));
}
