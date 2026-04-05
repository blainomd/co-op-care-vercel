/**
 * Email Templates — SendGrid-compatible HTML templates for CareOS
 *
 * All templates use inline CSS for email client compatibility.
 * Brand colors: teal #2BA5A0, background #FAF8F4, text #2B2720
 * Each function returns { subject, html } ready for SendGrid.
 */

// ─── Shared Layout ──────────────────────────────────────────────────────────

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2B2720; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FAF8F4;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2BA5A0; padding: 24px 32px; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 600; letter-spacing: 0.5px;">co-op.care</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #F5F2ED; padding: 24px 32px; text-align: center; border-top: 1px solid #E8E4DE;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B6560;">
                co-op.care &mdash; Worker-owned home care cooperative
              </p>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B6560;">
                Boulder, Colorado
              </p>
              <p style="margin: 0; font-size: 12px; color: #9B9690;">
                <a href="{{unsubscribe_url}}" style="color: #2BA5A0; text-decoration: underline;">Unsubscribe</a>
                &nbsp;&bull;&nbsp;
                <a href="https://co-op.care/privacy" style="color: #2BA5A0; text-decoration: underline;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px auto;">
  <tr>
    <td style="background-color: #2BA5A0; border-radius: 6px;">
      <a href="${url}" style="display: inline-block; padding: 14px 32px; color: #FFFFFF; font-size: 16px; font-weight: 600; text-decoration: none; text-align: center;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

// ─── Template Functions ─────────────────────────────────────────────────────

/**
 * Welcome email — sent when a new member joins co-op.care
 * Introduces the 5 sources of care model.
 */
export function welcomeEmail(name: string): { subject: string; html: string } {
  const body = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #2B2720;">Welcome to the care community, ${name}!</h2>
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #2B2720;">
      We are so glad you are here. At co-op.care, we believe that great care comes from
      many sources working together. Our cooperative is built around five sources of care:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 16px 0 24px 0;">
      <tr>
        <td style="padding: 12px 16px; border-left: 3px solid #2BA5A0; background-color: #F8FAF8; margin-bottom: 8px;">
          <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #2B2720;">
            <strong style="color: #2BA5A0;">1. Family Care</strong> &mdash; The love and daily support you already provide
          </p>
        </td>
      </tr>
      <tr><td style="height: 8px;"></td></tr>
      <tr>
        <td style="padding: 12px 16px; border-left: 3px solid #2BA5A0; background-color: #F8FAF8;">
          <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #2B2720;">
            <strong style="color: #2BA5A0;">2. Professional Care</strong> &mdash; Our trained, worker-owner caregivers
          </p>
        </td>
      </tr>
      <tr><td style="height: 8px;"></td></tr>
      <tr>
        <td style="padding: 12px 16px; border-left: 3px solid #2BA5A0; background-color: #F8FAF8;">
          <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #2B2720;">
            <strong style="color: #2BA5A0;">3. Community Care</strong> &mdash; Neighbors helping neighbors through our Time Bank
          </p>
        </td>
      </tr>
      <tr><td style="height: 8px;"></td></tr>
      <tr>
        <td style="padding: 12px 16px; border-left: 3px solid #2BA5A0; background-color: #F8FAF8;">
          <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #2B2720;">
            <strong style="color: #2BA5A0;">4. Clinical Oversight</strong> &mdash; Medical director guidance for your care plan
          </p>
        </td>
      </tr>
      <tr><td style="height: 8px;"></td></tr>
      <tr>
        <td style="padding: 12px 16px; border-left: 3px solid #2BA5A0; background-color: #F8FAF8;">
          <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #2B2720;">
            <strong style="color: #2BA5A0;">5. Self-Care &amp; Wellness</strong> &mdash; Yoga, movement, and mindfulness prescribed by a doctor and payable with pre-tax health savings
          </p>
        </td>
      </tr>
    </table>
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #2B2720;">
      Your dashboard is ready. From there you can complete your care assessment,
      explore the Time Bank, and connect with your care team.
    </p>
    ${button('Open Your Dashboard', 'https://co-op.care/dashboard')}
    <p style="margin: 16px 0 0 0; font-size: 14px; line-height: 1.5; color: #6B6560;">
      Questions? Reply to this email or reach us at
      <a href="mailto:hello@co-op.care" style="color: #2BA5A0; text-decoration: underline;">hello@co-op.care</a>.
    </p>`;

  return {
    subject: `Welcome to co-op.care, ${name}!`,
    html: layout(`Welcome to co-op.care`, body),
  };
}

/**
 * Password reset email — contains a time-limited reset link (1 hour expiry)
 */
export function passwordResetEmail(
  name: string,
  resetUrl: string,
): { subject: string; html: string } {
  const body = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #2B2720;">Reset your password</h2>
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #2B2720;">
      Hi ${name}, we received a request to reset your co-op.care password.
      Click the button below to choose a new password.
    </p>
    ${button('Reset Password', resetUrl)}
    <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.5; color: #6B6560;">
      This link will expire in <strong>1 hour</strong>. If you did not request a password
      reset, you can safely ignore this email. Your password will not be changed.
    </p>
    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #9B9690;">
      If the button does not work, copy and paste this URL into your browser:<br>
      <a href="${resetUrl}" style="color: #2BA5A0; word-break: break-all; font-size: 12px;">${resetUrl}</a>
    </p>`;

  return {
    subject: 'Reset your co-op.care password',
    html: layout('Reset Your Password', body),
  };
}

/**
 * Care visit reminder — notifies a family member about an upcoming care visit
 */
export function careReminderEmail(
  name: string,
  caregiverName: string,
  date: string,
  time: string,
): { subject: string; html: string } {
  const body = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #2B2720;">Upcoming care visit</h2>
    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #2B2720;">
      Hi ${name}, just a friendly reminder about your upcoming care visit.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F8FAF8; border-radius: 8px; border: 1px solid #E0E8E2; margin: 0 0 24px 0;">
      <tr>
        <td style="padding: 20px 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              <td style="padding: 0 0 12px 0;">
                <p style="margin: 0; font-size: 13px; color: #6B6560; text-transform: uppercase; letter-spacing: 0.5px;">Caregiver</p>
                <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600; color: #2B2720;">${caregiverName}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 12px 0;">
                <p style="margin: 0; font-size: 13px; color: #6B6560; text-transform: uppercase; letter-spacing: 0.5px;">Date</p>
                <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600; color: #2B2720;">${date}</p>
              </td>
            </tr>
            <tr>
              <td>
                <p style="margin: 0; font-size: 13px; color: #6B6560; text-transform: uppercase; letter-spacing: 0.5px;">Time</p>
                <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600; color: #2B2720;">${time}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5; color: #6B6560;">
      Need to reschedule? Open the app or contact us and we will help coordinate a new time.
    </p>
    ${button('View Visit Details', 'https://co-op.care/dashboard')}`;

  return {
    subject: `Care visit reminder: ${caregiverName} on ${date}`,
    html: layout('Care Visit Reminder', body),
  };
}

/**
 * Weekly digest email — summarizes the week's care activity and Time Bank status
 */
export function weeklyDigestEmail(
  name: string,
  stats: { hoursReceived: number; timeBankBalance: number; nextVisit: string },
): { subject: string; html: string } {
  const body = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #2B2720;">Your weekly care summary</h2>
    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #2B2720;">
      Hi ${name}, here is a snapshot of your care activity this week.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 0 0 24px 0;">
      <!-- Hours Received -->
      <tr>
        <td style="width: 50%; padding: 16px; background-color: #F8FAF8; border-radius: 8px 0 0 0; border: 1px solid #E0E8E2; border-right: none; text-align: center; vertical-align: top;">
          <p style="margin: 0; font-size: 32px; font-weight: 700; color: #2BA5A0;">${stats.hoursReceived}</p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #6B6560; text-transform: uppercase; letter-spacing: 0.5px;">Hours Received</p>
        </td>
        <!-- Time Bank Balance -->
        <td style="width: 50%; padding: 16px; background-color: #F8FAF8; border-radius: 0 8px 0 0; border: 1px solid #E0E8E2; text-align: center; vertical-align: top;">
          <p style="margin: 0; font-size: 32px; font-weight: 700; color: #2BA5A0;">${stats.timeBankBalance}</p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #6B6560; text-transform: uppercase; letter-spacing: 0.5px;">Time Bank Balance</p>
        </td>
      </tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F8FAF8; border-radius: 8px; border: 1px solid #E0E8E2; margin: 0 0 24px 0;">
      <tr>
        <td style="padding: 16px 24px;">
          <p style="margin: 0; font-size: 13px; color: #6B6560; text-transform: uppercase; letter-spacing: 0.5px;">Next Scheduled Visit</p>
          <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600; color: #2B2720;">${stats.nextVisit}</p>
        </td>
      </tr>
    </table>
    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5; color: #6B6560;">
      View your full care timeline and Time Bank activity in the app.
    </p>
    ${button('Open Dashboard', 'https://co-op.care/dashboard')}`;

  return {
    subject: `Your weekly care summary, ${name}`,
    html: layout('Weekly Care Summary', body),
  };
}

/**
 * Onboarding complete email — confirms membership and tier assignment
 */
export function onboardingCompleteEmail(
  name: string,
  membershipTier: string,
): { subject: string; html: string } {
  const body = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #2B2720;">You are all set, ${name}!</h2>
    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #2B2720;">
      Your co-op.care membership is confirmed and your care plan is ready.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F8FAF8; border-radius: 8px; border: 1px solid #E0E8E2; margin: 0 0 24px 0;">
      <tr>
        <td style="padding: 20px 24px; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #6B6560; text-transform: uppercase; letter-spacing: 0.5px;">Membership Tier</p>
          <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 700; color: #2BA5A0;">${membershipTier}</p>
        </td>
      </tr>
    </table>
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #2B2720;">
      Here is what you can do next:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="padding: 10px 0;">
          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #2B2720;">
            <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; background-color: #2BA5A0; color: #FFFFFF; border-radius: 50%; font-size: 13px; font-weight: 600; margin-right: 12px; vertical-align: middle;">1</span>
            Browse available Time Bank tasks near you
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 0;">
          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #2B2720;">
            <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; background-color: #2BA5A0; color: #FFFFFF; border-radius: 50%; font-size: 13px; font-weight: 600; margin-right: 12px; vertical-align: middle;">2</span>
            Invite family members to your care team
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 0;">
          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #2B2720;">
            <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; background-color: #2BA5A0; color: #FFFFFF; border-radius: 50%; font-size: 13px; font-weight: 600; margin-right: 12px; vertical-align: middle;">3</span>
            Set up push notifications for care updates
          </p>
        </td>
      </tr>
    </table>
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #2B2720;">
      Your 40-hour Time Bank membership floor is included with your annual membership.
      Use it to request care from your community.
    </p>
    ${button('Go to Dashboard', 'https://co-op.care/dashboard')}
    <p style="margin: 16px 0 0 0; font-size: 14px; line-height: 1.5; color: #6B6560;">
      Welcome to the cooperative. We are in this together.
    </p>`;

  return {
    subject: `Membership confirmed: Welcome to co-op.care, ${name}!`,
    html: layout('Membership Confirmed', body),
  };
}
