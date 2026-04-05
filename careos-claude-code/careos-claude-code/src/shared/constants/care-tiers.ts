/**
 * Care Tier Definitions — Seedling → Rooted → Canopy
 *
 * The engagement-to-equity pipeline for co-op.care.
 * Progression currency: Care Hours (rolling 12-month window).
 *
 * These tiers are NOT gamification — they're community recognition
 * of care commitment, mapped to cooperative governance and equity.
 */

import type { CareTierLevel, CareTierDefinition, CareTierBenefit } from '../types/care-tier.types';

// ─── Tier Definitions ──────────────────────────────────────────

export const CARE_TIER_DEFINITIONS: Record<CareTierLevel, CareTierDefinition> = {
  seedling: {
    level: 'seedling',
    label: 'Seedling',
    icon: 'seedling',
    tagline: 'Planting Your First Roots',
    minHours: 0,
    maxHours: 39,
    earningMultiplier: 1.0,
    creditExpiryMonths: 12,
    referralBonusHours: 5,
    sageSessionsPerMonth: 3,
    colorToken: 'text-sage',
    bgToken: 'bg-sage/10',
    borderToken: 'ring-sage/40',
  },
  rooted: {
    level: 'rooted',
    label: 'Rooted',
    icon: 'rooted',
    tagline: 'Deep Roots, Real Ownership',
    minHours: 40,
    maxHours: 119,
    earningMultiplier: 1.25,
    creditExpiryMonths: 18,
    referralBonusHours: 7,
    sageSessionsPerMonth: 10,
    colorToken: 'text-copper',
    bgToken: 'bg-copper/10',
    borderToken: 'ring-copper/40',
  },
  canopy: {
    level: 'canopy',
    label: 'Canopy',
    icon: 'canopy',
    tagline: 'Sheltering the Community',
    minHours: 120,
    maxHours: null,
    earningMultiplier: 1.5,
    creditExpiryMonths: null, // Never expires
    referralBonusHours: 10,
    sageSessionsPerMonth: null, // Unlimited
    colorToken: 'text-primary-dark',
    bgToken: 'bg-primary-dark/10',
    borderToken: 'ring-primary-dark/40',
  },
} as const;

export const CARE_TIER_ORDER: CareTierLevel[] = ['seedling', 'rooted', 'canopy'];

// ─── Helper Functions ──────────────────────────────────────────

/** Determine tier from cumulative 12-month hours */
export function getCareTier(hoursThisYear: number): CareTierLevel {
  if (hoursThisYear >= 120) return 'canopy';
  if (hoursThisYear >= 40) return 'rooted';
  return 'seedling';
}

/** Get the next tier (or null if at Canopy) */
export function getNextTier(current: CareTierLevel): CareTierLevel | null {
  const idx = CARE_TIER_ORDER.indexOf(current);
  return idx < CARE_TIER_ORDER.length - 1 ? (CARE_TIER_ORDER[idx + 1] ?? null) : null;
}

/** Calculate progress within current tier (0-100%) */
export function getTierProgress(hoursThisYear: number): number {
  const tier = getCareTier(hoursThisYear);
  const def = CARE_TIER_DEFINITIONS[tier];
  const nextTier = getNextTier(tier);

  if (!nextTier) {
    // At Canopy — show progress within Canopy (120 = 0%, 240 = 100% for visual)
    const excess = hoursThisYear - def.minHours;
    return Math.min(100, (excess / 120) * 100);
  }

  const nextDef = CARE_TIER_DEFINITIONS[nextTier];
  const range = nextDef.minHours - def.minHours;
  const progress = hoursThisYear - def.minHours;
  return Math.min(100, (progress / range) * 100);
}

/** Hours needed to reach next tier */
export function hoursToNextTier(hoursThisYear: number): number | null {
  const tier = getCareTier(hoursThisYear);
  const nextTier = getNextTier(tier);
  if (!nextTier) return null;
  const nextDef = CARE_TIER_DEFINITIONS[nextTier];
  return Math.max(0, nextDef.minHours - hoursThisYear);
}

// ─── Benefits Matrix ───────────────────────────────────────────

/** Heroicon path data for benefit icons */
const ICONS = {
  multiplier:
    'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  clock: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  bolt: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
  users:
    'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
  heart:
    'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
  sparkle:
    'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z',
  clipboard:
    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  vote: 'M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75',
  equity:
    'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941',
  shield:
    'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
  academic:
    'M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5',
  star: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
  calendar:
    'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  gift: 'M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
} as const;

export const CARE_TIER_BENEFITS: CareTierBenefit[] = [
  {
    icon: ICONS.multiplier,
    label: 'Earning Multiplier',
    seedling: '1.0×',
    rooted: '1.25×',
    canopy: '1.5×',
  },
  {
    icon: ICONS.clock,
    label: 'Credit Expiry',
    seedling: '12 months',
    rooted: '18 months',
    canopy: 'Never',
  },
  {
    icon: ICONS.bolt,
    label: 'Matching Priority',
    seedling: 'Standard',
    rooted: 'Priority',
    canopy: 'First Access',
  },
  {
    icon: ICONS.users,
    label: 'Referral Bonus',
    seedling: '5 hrs each',
    rooted: '7 hrs each',
    canopy: '10 hrs each',
  },
  {
    icon: ICONS.heart,
    label: 'Respite Fund',
    seedling: 'Receive',
    rooted: 'Receive + Contribute',
    canopy: 'Auto-enrolled + Priority',
  },
  {
    icon: ICONS.sparkle,
    label: 'Sage AI Sessions',
    seedling: '3/month',
    rooted: '10/month',
    canopy: 'Unlimited',
  },
  {
    icon: ICONS.clipboard,
    label: 'Assessments',
    seedling: 'CII',
    rooted: 'CII + KBS',
    canopy: 'CII + KBS + CRI',
  },
  {
    icon: ICONS.vote,
    label: 'Governance',
    seedling: 'Read updates',
    rooted: 'Vote on proposals',
    canopy: 'Vote + Propose',
  },
  {
    icon: ICONS.equity,
    label: 'Equity',
    seedling: 'Learn',
    rooted: 'Purchase eligible',
    canopy: 'Full patronage',
  },
  {
    icon: ICONS.shield,
    label: 'Board Eligibility',
    seedling: false,
    rooted: false,
    canopy: true,
  },
  {
    icon: ICONS.star,
    label: 'Community Spotlight',
    seedling: false,
    rooted: true,
    canopy: 'Featured + Mentor',
  },
  {
    icon: ICONS.sparkle,
    label: 'Wellness & Yoga',
    seedling: 'Community classes',
    rooted: 'Guided sessions + support',
    canopy: 'Prescribed plan + tax savings',
  },
  {
    icon: ICONS.academic,
    label: 'Training',
    seedling: 'Basic orientation',
    rooted: 'Advanced skills',
    canopy: 'Specialty certification',
  },
  {
    icon: ICONS.calendar,
    label: 'Events',
    seedling: 'General admission',
    rooted: 'Early registration',
    canopy: 'VIP + Host',
  },
  {
    icon: ICONS.gift,
    label: 'Patronage Dividends',
    seedling: false,
    rooted: 'Pro-rata (20% cash)',
    canopy: 'Pro-rata + Surplus priority',
  },
];

// ─── Demo Data ─────────────────────────────────────────────────

export const DEMO_TIER_PROGRESS = {
  currentTier: 'seedling' as CareTierLevel,
  hoursThisYear: 12,
  hoursToNextTier: 28,
  nextTierLevel: 'rooted' as CareTierLevel,
  nextTierLabel: 'Rooted',
  progressPercent: 30,
  multiplier: 1.0,
  memberSince: 'January 2026',
  evaluatedAt: new Date().toISOString(),
  maintenanceWarning: null,
};
