/**
 * Card Types — CareCard identity and tile system
 *
 * The CareCard is one of two surfaces in the simplified co-op.care app.
 * It shows: QR identity, member info, and 3 role-aware context tiles.
 */
import type { CareTierLevel } from './care-tier.types';

export interface CardTile {
  label: string;
  value: string;
  sublabel?: string;
  color: 'sage' | 'copper' | 'gold' | 'blue' | 'red' | 'yellow' | 'gray';
  icon?: string;
  pulse?: boolean;
}

export interface CardTilesResponse {
  tiles: [CardTile, CardTile, CardTile];
  lastUpdated: string;
}

export interface CardIdentity {
  memberId: string;
  displayName: string;
  memberSince: string;
  tier: CareTierLevel;
  tierIcon: string;
  balanceFormatted: string;
  balanceHours: number;
  qrData: string;
  activeRole: string;
  avatarUrl?: string;
}
