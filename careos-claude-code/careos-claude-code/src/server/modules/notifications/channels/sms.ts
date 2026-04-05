/**
 * SMS Channel — Twilio SMS delivery
 *
 * Used for urgent notifications: change-in-condition, SLA breaches
 */
import { config } from '../../../config/settings.js';
import { logger } from '../../../common/logger.js';

export interface SmsPayload {
  to: string;
  body: string;
}

/**
 * Send an SMS via Twilio REST API
 */
export async function sendSms(
  payload: SmsPayload,
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const { accountSid, authToken, phoneNumber } = config.twilio;

  if (!accountSid || !authToken || !phoneNumber) {
    logger.debug({ to: '[REDACTED]' }, 'SMS skipped — Twilio not configured');
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        To: payload.to,
        From: phoneNumber,
        Body: payload.body,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error({ status: response.status, body: errorBody }, 'Twilio SMS failed');
      return { success: false, error: `Twilio error: ${response.status}` };
    }

    const data = (await response.json()) as { sid: string };
    logger.debug({ sid: data.sid }, 'SMS sent');
    return { success: true, sid: data.sid };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SMS delivery failed';
    logger.error({ error: message }, 'SMS send error');
    return { success: false, error: message };
  }
}
