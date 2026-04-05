/**
 * Audit Log Query Builders
 * HIPAA-compliant append-only audit trail. Never store PHI here.
 */
import { getPool } from '../postgres.js';

export interface AuditLogRecord {
  id: string;
  eventType: string;
  action: string;
  outcome: 'success' | 'failure';
  userId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  resourceType: string | null;
  resourceId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export interface InsertAuditLogInput {
  eventType: 'auth_event' | 'phi_access' | 'data_change' | 'admin_action';
  action: string;
  outcome: 'success' | 'failure';
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  details?: Record<string, unknown> | null;
}

const AUDIT_COLS = `
  id::text,
  event_type    AS "eventType",
  action,
  outcome,
  user_id       AS "userId",
  ip_address    AS "ipAddress",
  user_agent    AS "userAgent",
  resource_type AS "resourceType",
  resource_id   AS "resourceId",
  details,
  created_at::text AS "createdAt"
`;

export async function insertAuditLog(input: InsertAuditLogInput): Promise<void> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO audit_logs
       (event_type, action, outcome, user_id, ip_address, user_agent,
        resource_type, resource_id, details)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      input.eventType,
      input.action,
      input.outcome,
      input.userId ?? null,
      input.ipAddress ?? null,
      input.userAgent ?? null,
      input.resourceType ?? null,
      input.resourceId ?? null,
      input.details ? JSON.stringify(input.details) : null,
    ],
  );
}

export async function queryAuditLogs(opts: {
  userId?: string;
  eventType?: string;
  action?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<AuditLogRecord[]> {
  const pool = getPool();
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (opts.userId) {
    conditions.push(`user_id = $${idx++}`);
    params.push(opts.userId);
  }
  if (opts.eventType) {
    conditions.push(`event_type = $${idx++}`);
    params.push(opts.eventType);
  }
  if (opts.action) {
    conditions.push(`action = $${idx++}`);
    params.push(opts.action);
  }
  if (opts.fromDate) {
    conditions.push(`created_at >= $${idx++}`);
    params.push(opts.fromDate.toISOString());
  }
  if (opts.toDate) {
    conditions.push(`created_at <= $${idx++}`);
    params.push(opts.toDate.toISOString());
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = opts.limit ?? 100;
  const offset = opts.offset ?? 0;
  params.push(limit, offset);

  const { rows } = await pool.query<AuditLogRecord>(
    `SELECT ${AUDIT_COLS}
     FROM audit_logs
     ${where}
     ORDER BY created_at DESC
     LIMIT $${idx++} OFFSET $${idx}`,
    params,
  );
  return rows;
}
