/**
 * Contact Service — Schedule-a-call handling
 * Jacob: Wire to PostgreSQL for lead storage + notification to Care Navigator team.
 */
import { logger } from '../../common/logger.js';
import type { ScheduleCallInput } from './schemas.js';

export const contactService = {
  /**
   * Schedule a call with a Care Navigator (public, no auth)
   * Stores lead, sends notification to team.
   */
  async scheduleCall(input: ScheduleCallInput): Promise<{
    id: string;
    status: 'scheduled';
    message: string;
  }> {
    // TODO: Jacob — Store in PostgreSQL `contact_lead` table
    // TODO: Jacob — Send notification to Care Navigator team (email/SMS)
    const leadId = `lead_${Date.now()}`;

    logger.info(
      {
        leadId,
        hasPhone: !!input.phone,
        hasEmail: !!input.email,
        miniCiiZone: input.miniCiiZone ?? 'none',
      },
      'Call scheduled',
    );

    return {
      id: leadId,
      status: 'scheduled',
      message: 'A Care Navigator will reach out within 24 hours.',
    };
  },
};
