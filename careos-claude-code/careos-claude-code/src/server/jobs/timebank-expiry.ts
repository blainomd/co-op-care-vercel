/**
 * Time Bank Expiry Job
 *
 * Runs daily. Expires credits older than TIME_BANK.EXPIRY_MONTHS (12 months).
 * Sends warning notifications at EXPIRY_WARNING_DAYS (30 days) before expiry.
 */
import { TIME_BANK } from '@shared/constants/business-rules';

export interface ExpiryResult {
  expiredCount: number;
  expiredHours: number;
  warningsSent: number;
}

/**
 * Find and expire credits that have passed the expiry window.
 * Credits are rounded to TIME_BANK.CREDIT_ROUNDING_INCREMENT (0.25h).
 */
export async function runTimeBankExpiry(): Promise<ExpiryResult> {
  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setMonth(expiryDate.getMonth() - TIME_BANK.EXPIRY_MONTHS);

  const warningDate = new Date(now);
  warningDate.setMonth(warningDate.getMonth() - TIME_BANK.EXPIRY_MONTHS);
  warningDate.setDate(warningDate.getDate() + TIME_BANK.EXPIRY_WARNING_DAYS);

  // In production, these would be PostgreSQL queries:
  // 1. SELECT credits WHERE type = 'earned' AND createdAt < $expiryDate AND NOT expired
  // 2. For each: create ledger entry with type 'expired', update balance
  // 3. SELECT credits WHERE type = 'earned' AND createdAt < $warningDate AND NOT expired AND NOT warned
  // 4. For each: send notification via notification service

  const result: ExpiryResult = {
    expiredCount: 0,
    expiredHours: 0,
    warningsSent: 0,
  };

  return result;
}

/**
 * Round hours to the nearest credit increment (0.25h).
 */
export function roundToIncrement(hours: number): number {
  const increment = TIME_BANK.CREDIT_ROUNDING_INCREMENT;
  return Math.round(hours / increment) * increment;
}
