/**
 * Audit Event Emitter — HIPAA-compliant structured audit logging.
 *
 * Every call writes to:
 *   1. Pino structured log (stdout / log aggregator)
 *   2. audit_logs PostgreSQL table (durable, 6-year retention)
 *
 * Fire-and-forget: DB write failures are logged but never surface to callers.
 * NEVER include PHI in any field — identifiers and outcome only.
 */
import { insertAuditLog, type InsertAuditLogInput } from '../database/queries/audit.js';
import { logger } from './logger.js';

export type AuditEventType = 'auth_event' | 'phi_access' | 'data_change' | 'admin_action';

export type AuditAction =
  | 'login'
  | 'login_failed'
  | 'logout'
  | 'register'
  | 'token_refresh'
  | '2fa_setup'
  | '2fa_verify'
  | '2fa_failed'
  | 'read'
  | 'create'
  | 'update'
  | 'delete';

export interface AuditEvent {
  eventType: AuditEventType;
  action: AuditAction;
  outcome: 'success' | 'failure';
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  /** Extra context. MUST NOT contain PHI (names, DOB, SSN, email, etc.) */
  details?: Record<string, unknown> | null;
}

/**
 * Emit a HIPAA audit event.
 * Non-blocking — never throws. DB failures are swallowed after logging.
 */
export function emitAudit(event: AuditEvent): void {
  // 1. Structured log — always synchronous
  logger.info(
    {
      audit: true,
      eventType: event.eventType,
      action: event.action,
      outcome: event.outcome,
      userId: event.userId ?? 'anonymous',
      ip: event.ip ?? null,
      resourceType: event.resourceType ?? null,
      resourceId: event.resourceId ?? null,
      details: event.details ?? null,
    },
    `AUDIT ${event.eventType}:${event.action} [${event.outcome}]`,
  );

  // 2. Durable DB write — fire-and-forget
  const input: InsertAuditLogInput = {
    eventType: event.eventType,
    action: event.action,
    outcome: event.outcome,
    userId: event.userId ?? null,
    ipAddress: event.ip ?? null,
    userAgent: event.userAgent ?? null,
    resourceType: event.resourceType ?? null,
    resourceId: event.resourceId ?? null,
    details: event.details ?? null,
  };

  insertAuditLog(input).catch((err: unknown) => {
    logger.error({ err, auditEvent: event.action }, 'Failed to persist audit log to database');
  });
}
