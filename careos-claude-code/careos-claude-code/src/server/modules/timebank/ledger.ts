/**
 * Time Bank Ledger Service — Double-Entry Credit/Debit
 *
 * Every operation creates a LedgerEntry with the new balance.
 * Balance = earned + membership + bought - spent - donated - expired + deficit
 * Deficit max: -20 hours
 * Credit rounding: 0.25 hour increments
 */
import {
  getOrCreateAccount,
  setAccountBalances,
  createTransaction,
  getTransactionHistory,
} from '../../database/queries/index.js';
import type { AccountRecord, TransactionRecord } from '../../database/queries/index.js';
import { TIME_BANK } from '@shared/constants/business-rules';
import type { LedgerEntry, LedgerEntryType, TimeBankBalance } from '@shared/types/timebank.types';
import { ValidationError } from '../../common/errors.js';

/**
 * Round hours to nearest 0.25 increment
 */
export function roundCredits(hours: number): number {
  const increment = TIME_BANK.CREDIT_ROUNDING_INCREMENT;
  return Math.round(hours / increment) * increment;
}

/**
 * Compute available balance from components
 */
export function computeAvailable(balance: TimeBankBalance): number {
  return (
    balance.earned +
    balance.bought +
    balance.donated -
    balance.spent -
    balance.expired +
    balance.deficit
  );
}

/**
 * Map AccountRecord to TimeBankBalance
 */
function accountToBalance(account: AccountRecord): TimeBankBalance {
  const balance: TimeBankBalance = {
    userId: typeof account.userId === 'string' ? account.userId : String(account.userId),
    earned: account.balanceEarned,
    spent: account.balanceSpent,
    bought: account.balanceBought,
    donated: account.balanceDonated,
    expired: account.balanceExpired,
    deficit: account.balanceDeficit,
    available: 0,
  };
  balance.available = computeAvailable(balance);
  return balance;
}

/**
 * Map TransactionRecord to LedgerEntry
 */
function txToLedgerEntry(tx: TransactionRecord, userId: string): LedgerEntry {
  return {
    id: tx.id,
    userId,
    type: tx.type,
    hours: tx.hours,
    balanceAfter: tx.balanceAfter,
    taskId: tx.taskId ?? undefined,
    description: tx.description,
    createdAt: tx.createdAt,
  };
}

/**
 * Get or create a TimeBankAccount for a user
 */
async function getOrCreateBalance(userId: string): Promise<TimeBankBalance> {
  const account = await getOrCreateAccount(userId);
  return accountToBalance(account);
}

/**
 * Record a ledger entry and update the account balance
 */
async function recordEntry(
  userId: string,
  type: LedgerEntryType,
  hours: number,
  taskId?: string,
  description?: string,
): Promise<LedgerEntry> {
  const balance = await getOrCreateBalance(userId);
  const account = await getOrCreateAccount(userId);

  // Apply the transaction to the correct bucket
  switch (type) {
    case 'earned':
      balance.earned += hours;
      break;
    case 'spent':
      balance.spent += Math.abs(hours);
      break;
    case 'bought':
      balance.bought += hours;
      break;
    case 'donated':
    case 'respite_deduction':
      balance.donated += Math.abs(hours);
      break;
    case 'expired':
      balance.expired += Math.abs(hours);
      break;
    case 'deficit':
      balance.deficit += hours; // negative
      break;
    case 'membership_floor':
      balance.earned += hours;
      break;
    case 'referral_bonus':
    case 'training_bonus':
      balance.earned += hours;
      break;
  }

  balance.available = computeAvailable(balance);

  // Update all balance fields via query builder
  await setAccountBalances(userId, {
    balanceEarned: balance.earned,
    balanceSpent: balance.spent,
    balanceBought: balance.bought,
    balanceDonated: balance.donated,
    balanceExpired: balance.expired,
    balanceDeficit: balance.deficit,
  });

  // Create ledger entry via query builder
  const tx = await createTransaction({
    accountId: account.id,
    type,
    hours,
    balanceAfter: balance.available,
    taskId,
    description: description ?? `${type}: ${hours > 0 ? '+' : ''}${hours} hrs`,
  });

  return txToLedgerEntry(tx, userId);
}

export const ledgerService = {
  /**
   * Get current balance for a user
   */
  async getBalance(userId: string): Promise<TimeBankBalance> {
    return getOrCreateBalance(userId);
  },

  /**
   * Credit hours earned from completing a task
   * Applies Respite Default split (0.9 member / 0.1 fund)
   * Returns the net hours credited to the member
   */
  async creditEarned(
    userId: string,
    grossHours: number,
    taskId: string,
    applyRespiteDefault: boolean = true,
  ): Promise<{ memberHours: number; respiteHours: number; entry: LedgerEntry }> {
    const rounded = roundCredits(grossHours);

    let memberHours: number;
    let respiteHours: number;

    if (applyRespiteDefault) {
      memberHours = roundCredits(rounded * TIME_BANK.RESPITE_DEFAULT_MEMBER_RATIO);
      respiteHours = roundCredits(rounded * TIME_BANK.RESPITE_DEFAULT_FUND_RATIO);
    } else {
      memberHours = rounded;
      respiteHours = 0;
    }

    const entry = await recordEntry(
      userId,
      'earned',
      memberHours,
      taskId,
      `Earned ${memberHours} hrs (task completion)`,
    );

    return { memberHours, respiteHours, entry };
  },

  /**
   * Debit hours for requesting a task
   * Allows deficit up to DEFICIT_MAX_HOURS (-20)
   */
  async debitSpent(userId: string, hours: number, taskId: string): Promise<LedgerEntry> {
    const rounded = roundCredits(hours);
    const balance = await getOrCreateBalance(userId);
    const newAvailable = balance.available - rounded;

    if (newAvailable < TIME_BANK.DEFICIT_MAX_HOURS) {
      throw new ValidationError(
        `Insufficient credits. Available: ${balance.available}, requested: ${rounded}, deficit limit: ${TIME_BANK.DEFICIT_MAX_HOURS}`,
      );
    }

    // If going into deficit, record as deficit type
    if (balance.available < rounded && newAvailable >= TIME_BANK.DEFICIT_MAX_HOURS) {
      return recordEntry(
        userId,
        'spent',
        rounded,
        taskId,
        `Spent ${rounded} hrs (deficit: ${newAvailable.toFixed(2)})`,
      );
    }

    return recordEntry(userId, 'spent', rounded, taskId, `Spent ${rounded} hrs`);
  },

  /**
   * Credit bought hours from cash purchase ($15/hr)
   * $12 goes to coordination, $3 to Respite Fund
   */
  async creditBought(
    userId: string,
    hours: number,
  ): Promise<{ entry: LedgerEntry; respiteDollars: number }> {
    const rounded = roundCredits(hours);
    const respiteDollars = (rounded * TIME_BANK.CASH_RESPITE_SPLIT_CENTS) / 100;

    const entry = await recordEntry(
      userId,
      'bought',
      rounded,
      undefined,
      `Purchased ${rounded} hrs at $${TIME_BANK.CASH_RATE_CENTS_PER_HOUR / 100}/hr`,
    );

    return { entry, respiteDollars };
  },

  /**
   * Credit membership floor hours (40 hrs on $100 annual payment)
   */
  async creditMembership(userId: string): Promise<LedgerEntry> {
    return recordEntry(
      userId,
      'membership_floor',
      TIME_BANK.MEMBERSHIP_FLOOR_HOURS,
      undefined,
      `Annual membership: +${TIME_BANK.MEMBERSHIP_FLOOR_HOURS} hrs`,
    );
  },

  /**
   * Credit referral bonus (5 hrs each party)
   */
  async creditReferralBonus(userId: string): Promise<LedgerEntry> {
    return recordEntry(
      userId,
      'referral_bonus',
      TIME_BANK.REFERRAL_BONUS_HOURS,
      undefined,
      `Referral bonus: +${TIME_BANK.REFERRAL_BONUS_HOURS} hrs`,
    );
  },

  /**
   * Credit training bonus (5 hrs per certification module)
   */
  async creditTrainingBonus(userId: string, moduleName: string): Promise<LedgerEntry> {
    return recordEntry(
      userId,
      'training_bonus',
      TIME_BANK.TRAINING_BONUS_HOURS,
      undefined,
      `Training bonus (${moduleName}): +${TIME_BANK.TRAINING_BONUS_HOURS} hrs`,
    );
  },

  /**
   * Expire credits (12-month auto-expiry, auto-donated to respite)
   */
  async expireCredits(userId: string, hours: number): Promise<LedgerEntry> {
    return recordEntry(
      userId,
      'expired',
      Math.abs(hours),
      undefined,
      `Credits expired: ${hours} hrs (auto-donated to Respite Fund)`,
    );
  },

  /**
   * Get ledger history for a user
   */
  async getLedgerHistory(userId: string, limit: number = 50): Promise<LedgerEntry[]> {
    const transactions = await getTransactionHistory(userId, limit);
    return transactions.map((tx) => txToLedgerEntry(tx, userId));
  },
};
