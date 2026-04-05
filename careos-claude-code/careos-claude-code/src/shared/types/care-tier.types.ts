/**
 * Care Tier Types — Engagement-to-Equity Pipeline
 *
 * Three tiers of community recognition based on rolling 12-month Care Hours:
 *   Seedling (0-39 hrs)  → Learn about cooperative ownership
 *   Rooted (40-119 hrs)  → Vote, purchase equity, earn dividends
 *   Canopy (120+ hrs)    → Govern, propose, run for Board
 */

export type CareTierLevel = 'seedling' | 'rooted' | 'canopy';

export interface CareTierDefinition {
  level: CareTierLevel;
  label: string;
  icon: string;
  tagline: string;
  minHours: number;
  maxHours: number | null; // null = no cap
  earningMultiplier: number;
  creditExpiryMonths: number | null; // null = never expires
  referralBonusHours: number;
  sageSessionsPerMonth: number | null; // null = unlimited
  colorToken: string; // Tailwind color class
  bgToken: string; // Background color class
  borderToken: string; // Border/ring color class
}

export interface CareTierBenefit {
  icon: string; // SVG path data (Heroicons)
  label: string;
  seedling: string | boolean;
  rooted: string | boolean;
  canopy: string | boolean;
}

export interface CareTierProgress {
  currentTier: CareTierLevel;
  hoursThisYear: number;
  hoursToNextTier: number | null; // null if at Canopy
  nextTierLevel: CareTierLevel | null;
  nextTierLabel: string | null;
  progressPercent: number; // 0-100 within current tier range
  multiplier: number;
  memberSince: string;
  /** Quarterly tier evaluation — when tier was last calculated */
  evaluatedAt: string;
  /** Warning: hours needed to maintain current tier (if at risk) */
  maintenanceWarning: string | null;
}

export interface CareTierSummary {
  tier: CareTierProgress;
  benefits: CareTierBenefit[];
  /** Governance status derived from tier */
  governance: {
    canVote: boolean;
    canPropose: boolean;
    canRunForBoard: boolean;
  };
  /** Equity status derived from tier */
  equity: {
    eligible: boolean;
    patronageDividends: boolean;
    surplusPriority: boolean;
  };
}
