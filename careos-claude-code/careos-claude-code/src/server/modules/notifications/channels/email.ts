/**
 * Email Channel — SendGrid email delivery
 *
 * Used for scheduled notifications: LMN expiry, monthly statements, reports
 */
import { config } from '../../../config/settings.js';
import { logger } from '../../../common/logger.js';

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

/**
 * Send an email via SendGrid v3 API
 */
export async function sendEmail(
  payload: EmailPayload,
): Promise<{ success: boolean; error?: string }> {
  const { apiKey, fromEmail } = config.sendgrid;

  if (!apiKey) {
    logger.debug({ subject: payload.subject }, 'Email skipped — SendGrid not configured');
    return { success: false, error: 'SendGrid not configured' };
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: payload.to }] }],
        from: { email: fromEmail, name: 'CareOS' },
        subject: payload.subject,
        content: [
          { type: 'text/plain', value: payload.body },
          ...(payload.html ? [{ type: 'text/html', value: payload.html }] : []),
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error({ status: response.status, body: errorBody }, 'SendGrid email failed');
      return { success: false, error: `SendGrid error: ${response.status}` };
    }

    logger.debug({ subject: payload.subject }, 'Email sent');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email delivery failed';
    logger.error({ error: message }, 'Email send error');
    return { success: false, error: message };
  }
}
