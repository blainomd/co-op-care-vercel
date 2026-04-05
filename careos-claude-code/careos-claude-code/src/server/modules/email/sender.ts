/**
 * Email Sender — SendGrid delivery wrapper for HTML email templates
 *
 * Consumes template output { subject, html } and sends via SendGrid v3 API.
 * Uses the centralized config for API key and from address.
 */
import { config } from '../../config/settings.js';
import { logger } from '../../common/logger.js';

export interface EmailTemplate {
  subject: string;
  html: string;
}

export interface SendResult {
  success: boolean;
  error?: string;
}

/**
 * Send an email using a pre-built template.
 *
 * @param to - Recipient email address
 * @param template - Object with { subject, html } from a template function
 * @returns Promise resolving to { success, error? }
 *
 * @example
 * ```ts
 * import { welcomeEmail } from './templates.js';
 * import { sendEmail } from './sender.js';
 *
 * await sendEmail('user@example.com', welcomeEmail('Sarah'));
 * ```
 */
export async function sendEmail(to: string, template: EmailTemplate): Promise<SendResult> {
  const { apiKey, fromEmail } = config.sendgrid;

  if (!apiKey) {
    logger.debug({ subject: template.subject }, 'Email skipped — SendGrid API key not configured');
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
        personalizations: [{ to: [{ email: to }] }],
        from: { email: fromEmail, name: 'co-op.care' },
        subject: template.subject,
        content: [{ type: 'text/html', value: template.html }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error({ status: response.status, body: errorBody }, 'SendGrid email delivery failed');
      return { success: false, error: `SendGrid error: ${response.status}` };
    }

    logger.debug({ subject: template.subject }, 'Email sent successfully');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email delivery failed';
    logger.error({ error: message }, 'Email send error');
    return { success: false, error: message };
  }
}
