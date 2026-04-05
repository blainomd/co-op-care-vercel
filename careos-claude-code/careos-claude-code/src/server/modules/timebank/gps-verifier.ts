/**
 * GPS Verification Service
 * Haversine formula for distance calculation
 * 0.25 mile (402m) verification threshold
 */
import type { GeoPoint } from '@shared/types/user.types';
import { TIME_BANK } from '@shared/constants/business-rules';

const EARTH_RADIUS_MILES = 3958.8;

/**
 * Calculate distance between two GPS points using Haversine formula
 * Returns distance in miles
 */
export function haversineDistance(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const sinHalfDLat = Math.sin(dLat / 2);
  const sinHalfDLon = Math.sin(dLon / 2);

  const h = sinHalfDLat * sinHalfDLat + Math.cos(lat1) * Math.cos(lat2) * sinHalfDLon * sinHalfDLon;

  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}

export interface GPSVerificationResult {
  withinThreshold: boolean;
  distanceMiles: number;
  thresholdMiles: number;
}

/**
 * Verify a GPS check-in/check-out location is within threshold of task location
 */
export function verifyGPS(userLocation: GeoPoint, taskLocation: GeoPoint): GPSVerificationResult {
  const distanceMiles = haversineDistance(userLocation, taskLocation);
  const thresholdMiles = TIME_BANK.GPS_VERIFICATION_MILES;

  return {
    withinThreshold: distanceMiles <= thresholdMiles,
    distanceMiles: Math.round(distanceMiles * 1000) / 1000, // 3 decimal places
    thresholdMiles,
  };
}
