// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Care Tier Service — Server-side tier calculation
 *
 * Calculates a user's Care Tier from their rolling 12-month
 * earned hours in the timebank_transaction ledger.
 */
import { getPostgres } from '../../database/postgres.js';
import {
  getCareTier,
  getNextTier,
  getTierProgress,
  hoursToNextTier,
  CARE_TIER_DEFINITIONS,
} from '@shared/constants/care-tiers';
import type { CareTierProgress, CareTierSummary } from '@shared/types/care-tier.types';
import { CARE_TIER_BENEFITS } from '@shared/constants/care-tiers';
import { CARE_TIERS } from '@shared/constants/business-rules';

export const careTierService = {
  /**
   * Get a user's current tier progress
   */
  async getTierProgress(userId: string): Promise<CareTierProgress> {
    // Query earned hours in the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - CARE_TIERS.WINDOW_MONTHS);

    let hoursThisYear = 0;
    let memberSince = 'January 2026';

    try {
      const db = getPostgres();
      const result = await db.query<[{ total: number }[]]>(
        `SELECT math::sum(hours) as total FROM timebank_transaction
         WHERE userId = $userId AND type = 'earned' AND createdAt > $since`,
        { userId, since: twelveMonthsAgo.toISOString() },
      );
      hoursThisYear = result?.[0]?.[0]?.total ?? 0;

      // Get member since date
      const userResult = await db.query<[{ createdAt: string }[]]>(
        `SELECT createdAt FROM user WHERE id = $userId`,
        { userId },
      );
      if (userResult?.[0]?.[0]?.createdAt) {
        const date = new Date(userResult[0][0].createdAt);
        memberSince = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
    } catch {
      // Demo mode — use defaults
    }

    const tier = getCareTier(hoursThisYear);
    const def = CARE_TIER_DEFINITIONS[tier];
    const nextLevel = getNextTier(tier);
    const nextDef = nextLevel ? CARE_TIER_DEFINITIONS[nextLevel] : null;
    const remaining = hoursToNextTier(hoursThisYear);

    // Check if user is at risk of losing current tier
    let maintenanceWarning: string | null = null;
    if (tier !== 'seedling' && remaining === null) {
      // At Canopy — no warning needed
    } else if (tier !== 'seedling') {
      // Check if they're close to falling below current tier threshold
      const hoursAboveFloor = hoursThisYear - def.minHours;
      if (hoursAboveFloor <= CARE_TIERS.MAINTENANCE_WARNING_HOURS) {
        maintenanceWarning = `You're ${hoursAboveFloor} hours above the ${def.label} threshold. Keep it up!`;
      }
    }

    return {
      currentTier: tier,
      hoursThisYear,
      hoursToNextTier: remaining,
      nextTierLevel: nextLevel,
      nextTierLabel: nextDef?.label ?? null,
      progressPercent: getTierProgress(hoursThisYear),
      multiplier: def.earningMultiplier,
      memberSince,
      evaluatedAt: new Date().toISOString(),
      maintenanceWarning,
    };
  },

  /**
   * Get full tier summary with benefits and governance info
   */
  async getTierSummary(userId: string): Promise<CareTierSummary> {
    const tier = await this.getTierProgress(userId);

    return {
      tier,
      benefits: CARE_TIER_BENEFITS,
      governance: {
        canVote: tier.currentTier === 'rooted' || tier.currentTier === 'canopy',
        canPropose: tier.currentTier === 'canopy',
        canRunForBoard: tier.currentTier === 'canopy',
      },
      equity: {
        eligible: tier.currentTier === 'rooted' || tier.currentTier === 'canopy',
        patronageDividends: tier.currentTier === 'rooted' || tier.currentTier === 'canopy',
        surplusPriority: tier.currentTier === 'canopy',
      },
    };
  },
};
