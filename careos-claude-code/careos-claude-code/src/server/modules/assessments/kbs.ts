/**
 * KBS (Knowledge-Behavior-Status) Outcome Rating
 * Subscales: K 1-5, B 1-5, S 1-5
 * Assessed at intake (day 0), 30, 60, 90 days per Omaha problem
 */
import { KBS_MIN, KBS_MAX } from '@shared/constants/business-rules';

export interface KBSResult {
  knowledge: number;
  behavior: number;
  status: number;
  valid: boolean;
}

/**
 * Validate and normalize KBS ratings
 */
export function validateKBS(knowledge: number, behavior: number, status: number): KBSResult {
  const valid =
    knowledge >= KBS_MIN &&
    knowledge <= KBS_MAX &&
    behavior >= KBS_MIN &&
    behavior <= KBS_MAX &&
    status >= KBS_MIN &&
    status <= KBS_MAX;

  return { knowledge, behavior, status, valid };
}
