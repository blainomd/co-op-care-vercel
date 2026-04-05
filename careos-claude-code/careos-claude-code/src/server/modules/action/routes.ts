/**
 * Action Routes — Token-based action pages
 *
 * POST /generate  — Create an action token + send SMS
 * GET  /:token    — Retrieve action data for rendering
 * POST /:token/complete — Record action completion, fire billing
 *
 * No auth required — tokens are short-lived (72hr) and single-use.
 * This is the entire mobile strategy: SMS → tap → action → done.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ValidationError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import { sendSms } from '../notifications/channels/sms.js';
import { eventBus } from '../../agents/event-bus.js';
import type { ActionTemplate } from '../../../shared/types/action-page.types.js';

// ─── In-memory token store (replace with Redis/PostgreSQL) ──────────

const tokenStore = new Map<
  string,
  {
    template: ActionTemplate;
    userId: string;
    role: string;
    recipientName: string;
    data: Record<string, unknown>;
    billingCodes: string[];
    createdAt: string;
    expiresAt: string;
    used: boolean;
    result?: { action: string; value: unknown; completedAt: string };
  }
>();

function generateToken(): string {
  // URL-safe, short token
  return crypto.randomUUID().slice(0, 12);
}

// ─── Schemas ────────────────────────────────────────────────────────

const generateSchema = z.object({
  template: z.string() as z.ZodType<ActionTemplate>,
  userId: z.string(),
  role: z.enum(['conductor', 'worker', 'physician', 'recipient']),
  recipientName: z.string(),
  phone: z.string(),
  smsBody: z.string().max(160),
  data: z.record(z.unknown()),
  billingCodes: z.array(z.string()).optional(),
  ttlHours: z.number().min(1).max(168).optional(),
});

const completeSchema = z.object({
  value: z.unknown(),
});

// ─── Routes ─────────────────────────────────────────────────────────

export async function actionRoutes(app: FastifyInstance): Promise<void> {
  /**
   * POST /generate — Create action token, send SMS with link
   */
  app.post('/generate', async (request) => {
    const parsed = generateSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid action request');

    const input = parsed.data;
    const token = generateToken();
    const ttlHours = input.ttlHours || 72;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);

    // Store token
    tokenStore.set(token, {
      template: input.template,
      userId: input.userId,
      role: input.role,
      recipientName: input.recipientName,
      data: input.data,
      billingCodes: input.billingCodes || [],
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      used: false,
    });

    // Build action URL
    const baseUrl = process.env['APP_URL'] || 'https://careos-claude-code.vercel.app';
    const actionUrl = `${baseUrl}/act/${token}`;

    // Send SMS via Twilio
    const smsResult = await sendSms({
      to: input.phone,
      body: `${input.smsBody}\n${actionUrl}`,
    });

    logger.info(
      { token, template: input.template, smsSuccess: smsResult.success },
      'Action token generated and SMS sent',
    );

    return {
      token,
      actionUrl,
      smsDelivered: smsResult.success,
      expiresAt: expiresAt.toISOString(),
    };
  });

  /**
   * GET /:token — Retrieve action data for page rendering
   */
  app.get('/:token', async (request) => {
    const { token } = request.params as { token: string };
    const action = tokenStore.get(token);

    if (!action) {
      return { expired: true };
    }

    if (new Date() > new Date(action.expiresAt) || action.used) {
      return { expired: true };
    }

    return {
      template: action.template,
      role: action.role,
      recipientName: action.recipientName,
      data: action.data,
      billingCodes: action.billingCodes,
      expired: false,
    };
  });

  /**
   * POST /:token/complete — Record action, fire billing, update profile
   */
  app.post('/:token/complete', async (request) => {
    const { token } = request.params as { token: string };
    const parsed = completeSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid completion');

    const action = tokenStore.get(token);
    if (!action || action.used || new Date() > new Date(action.expiresAt)) {
      return { success: false, error: 'Token expired or already used' };
    }

    // Mark as used
    action.used = true;
    action.result = {
      action: action.template,
      value: parsed.data.value,
      completedAt: new Date().toISOString(),
    };

    // Fire billing codes via event bus
    for (const code of action.billingCodes) {
      await eventBus.emit({
        type: 'billing.invoice_created' as any,
        familyId: action.userId,
        payload: {
          code,
          template: action.template,
          value: parsed.data.value,
          recipientName: action.recipientName,
        },
        source: `action:${action.template}`,
        timestamp: new Date(),
      });
    }

    // Update Living Profile via event bus
    await eventBus.emit({
      type: 'profile.updated' as any,
      familyId: action.userId,
      payload: {
        source: `action:${action.template}`,
        value: parsed.data.value,
        completedAt: action.result.completedAt,
      },
      source: `action:${action.template}`,
      timestamp: new Date(),
    });

    logger.info(
      { token, template: action.template, billingCodes: action.billingCodes },
      'Action completed — billing fired, profile updated',
    );

    return { success: true, billingCodes: action.billingCodes };
  });
}
