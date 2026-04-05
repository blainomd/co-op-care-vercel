/**
 * Respite Service — Respite Default + Emergency Fund
 *
 * Respite Default: 0.9 hours to member, 0.1 hours to fund per task
 * Cash purchases: $3 of every $15/hr goes to fund
 * Emergency Fund: auto-approve if balance > 100 hours
 * Max emergency respite: 48 hours
 */
import {
  getOrCreateRespiteFund,
  updateRespiteFund,
  createRespiteFundTx,
} from '../../database/queries/index.js';
import { TIME_BANK } from '@shared/constants/business-rules';
import { ValidationError } from '../../common/errors.js';

export interface RespiteFundBalance {
  balanceHours: number;
  balanceDollars: number;
  autoApprovalThreshold: number;
}

export interface RespiteFundTransaction {
  id: string;
  type: 'contribution_hours' | 'contribution_dollars' | 'disbursement';
  hours: number;
  dollars: number;
  sourceUserId?: string;
  recipientUserId?: string;
  description: string;
  createdAt: string;
}

/**
 * Get or create the singleton Respite Emergency Fund
 */
async function getOrCreateFund(): Promise<RespiteFundBalance> {
  const fund = await getOrCreateRespiteFund(TIME_BANK.RESPITE_AUTO_APPROVE_THRESHOLD_HOURS);
  return {
    balanceHours: fund.balanceHours,
    balanceDollars: fund.balanceDollars,
    autoApprovalThreshold: fund.autoApprovalThreshold,
  };
}

export const respiteService = {
  /**
   * Get current Respite Fund balance
   */
  async getFundBalance(): Promise<RespiteFundBalance> {
    return getOrCreateFund();
  },

  /**
   * Contribute hours from Respite Default deduction
   */
  async contributeHours(hours: number, sourceUserId: string, taskId: string): Promise<void> {
    await getOrCreateFund();

    await updateRespiteFund(hours, 0);

    await createRespiteFundTx({
      type: 'contribution_hours',
      hours,
      dollars: 0,
      sourceUserId,
      description: `Respite Default: +${hours} hrs from task ${taskId}`,
    });
  },

  /**
   * Contribute dollars from cash purchase ($3 per $15/hr purchased)
   */
  async contributeDollars(dollars: number, sourceUserId: string): Promise<void> {
    await getOrCreateFund();

    await updateRespiteFund(0, dollars);

    await createRespiteFundTx({
      type: 'contribution_dollars',
      hours: 0,
      dollars,
      sourceUserId,
      description: `Cash purchase contribution: +$${dollars.toFixed(2)}`,
    });
  },

  /**
   * Request emergency respite hours
   * Auto-approved if fund balance > threshold
   */
  async requestEmergencyRespite(
    recipientUserId: string,
    requestedHours: number,
  ): Promise<{ approved: boolean; hours: number }> {
    if (requestedHours > TIME_BANK.RESPITE_EMERGENCY_MAX_HOURS) {
      throw new ValidationError(
        `Maximum emergency respite is ${TIME_BANK.RESPITE_EMERGENCY_MAX_HOURS} hours`,
      );
    }

    const fund = await getOrCreateFund();
    const autoApprove = fund.balanceHours >= fund.autoApprovalThreshold;

    if (!autoApprove) {
      // Requires manual approval — store as pending
      return { approved: false, hours: requestedHours };
    }

    if (fund.balanceHours < requestedHours) {
      return { approved: false, hours: 0 };
    }

    // Auto-approve: deduct from fund
    await updateRespiteFund(-requestedHours, 0);

    await createRespiteFundTx({
      type: 'disbursement',
      hours: requestedHours,
      dollars: 0,
      recipientUserId,
      description: `Emergency respite: ${requestedHours} hrs (auto-approved)`,
    });

    return { approved: true, hours: requestedHours };
  },
};
