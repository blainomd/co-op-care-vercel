/**
 * Action Page Types — The entire mobile strategy
 *
 * There is no app. There are notifications and personalized pages.
 *
 * Flow:
 *   1. Connector fires a trigger (event bus)
 *   2. Notification router matches trigger → action template
 *   3. Server generates a short-lived token + personalized page URL
 *   4. Twilio delivers SMS with the link
 *   5. User taps → /act/:token loads the right template with their data
 *   6. User takes ONE action (tap, confirm, answer)
 *   7. Action recorded → billing fires → profile updates → tab closes
 *
 * "The health system that works for you — instead of you working for it."
 */

// ─── Action Templates ───────────────────────────────────────────────

export type ActionTemplate =
  | 'prom'              // "How's your knee?" → 3 taps → RTM 98980
  | 'med_reminder'      // "Afternoon meds" → tap "Done"
  | 'lmn_confirm'       // "HSA savings available" → tap to confirm
  | 'shift_checklist'   // "Margaret in 1hr" → tap for routine
  | 'appointment_prep'  // "Cardiology tomorrow" → tap for checklist
  | 'physician_review'  // "3 LMNs ready" → tap to review/sign
  | 'prior_auth'        // "Auth drafted for MRI" → tap to review
  | 'fall_check'        // "How steady today?" → 1 tap
  | 'ccm_checkin'       // "Anything change this month?" → 2 taps
  | 'care_update'       // "Maria logged: good morning" → tap to view
  | 'caregiver_training'// "New protocol" → tap to read
  | 'billing_consent'   // "$0 with HSA" → tap to approve
  | 'emergency_alert'   // "Fall detected" → call order displayed
  | 'refill_alert'      // "Refill due tomorrow" → tap to call pharmacy
  | 'acp_question'      // "What matters most today?" → tap to answer
  | 'guide_update';     // "Guide updated" → tap to view changes

// ─── Action Token (server-generated, short-lived) ───────────────────

export interface ActionToken {
  /** Unique token ID (URL-safe, short) */
  token: string;
  /** Which template to render */
  template: ActionTemplate;
  /** Who this is for */
  userId: string;
  /** Their role (determines page styling) */
  role: 'conductor' | 'worker' | 'physician' | 'recipient';
  /** Personalization data for the template */
  data: Record<string, unknown>;
  /** Which Connector generated this action */
  connectorId: string;
  /** Billing codes that fire when action is completed */
  billingCodes?: string[];
  /** Created timestamp */
  createdAt: string;
  /** Expires (short-lived — 72 hours) */
  expiresAt: string;
  /** Whether this token has been used */
  used: boolean;
  /** Action result (filled when user completes the action) */
  result?: {
    action: string;
    value: unknown;
    completedAt: string;
  };
}

// ─── SMS Template ───────────────────────────────────────────────────

export interface SmsTemplate {
  /** Which action template this SMS leads to */
  actionTemplate: ActionTemplate;
  /** SMS body (max 160 chars for single segment) */
  body: (data: Record<string, unknown>) => string;
  /** Priority (determines delivery urgency) */
  priority: 'urgent' | 'standard' | 'low';
}

// ─── Notification Rule (event bus → SMS + page) ─────────────────────

export interface NotificationRule {
  /** Event type to listen for */
  eventType: string;
  /** Which action template to generate */
  actionTemplate: ActionTemplate;
  /** Who to notify (role-based) */
  notifyRole: 'conductor' | 'worker' | 'physician' | 'recipient';
  /** SMS message template */
  smsBody: string;
  /** How long the action token lives */
  tokenTtlHours: number;
  /** Billing codes that fire on completion */
  billingCodes?: string[];
}
