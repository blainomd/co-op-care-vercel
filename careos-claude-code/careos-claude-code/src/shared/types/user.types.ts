import type { UserRole } from '../constants/business-rules';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: UserRole[];
  activeRole: UserRole;
  twoFactorEnabled: boolean;
  avatarUrl?: string;
  location?: GeoPoint;
  createdAt: string;
  updatedAt: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type MembershipStatus = 'pending' | 'active' | 'grace_period' | 'suspended' | 'cancelled';
