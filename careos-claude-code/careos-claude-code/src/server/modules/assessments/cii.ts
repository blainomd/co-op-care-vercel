/**
 * CII Scoring Engine
 * 12 dimensions, each 1-10, total /120
 * Zones: Green ≤40, Yellow 41-79, Red ≥80
 */
import {
  classifyCIIZone,
  classifyMiniCIIZone,
  type CIIZone,
} from '@shared/constants/business-rules';

export interface CIIResult {
  scores: number[];
  totalScore: number;
  zone: CIIZone;
}

export interface MiniCIIResult {
  scores: number[];
  totalScore: number;
  zone: CIIZone;
}

/**
 * Score a full CII assessment (12 dimensions)
 */
export function scoreCII(scores: number[]): CIIResult {
  const totalScore = scores.reduce((sum, s) => sum + s, 0);
  const zone = classifyCIIZone(totalScore);
  return { scores, totalScore, zone };
}

/**
 * Score a Mini CII Quick Check (3 dimensions)
 */
export function scoreMiniCII(scores: number[]): MiniCIIResult {
  const totalScore = scores.reduce((sum, s) => sum + s, 0);
  const zone = classifyMiniCIIZone(totalScore);
  return { scores, totalScore, zone };
}
