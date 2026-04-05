/**
 * PHI Access Audit Hook — HIPAA-compliant data access logging.
 *
 * Fires on `onResponse` (not onRequest) so that:
 *   - request.userId is populated by requireAuth preHandler
 *   - HTTP status code is known (captures success vs failure outcome)
 *
 * No PHI is stored in audit logs — only resource type, opaque resource ID,
 * acting user ID, IP, HTTP method, and outcome.
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
import { emitAudit, type AuditAction } from '../common/audit-events.js';

// Route prefixes that touch PHI — must be audited on every access
const PHI_ROUTE_PREFIXES = [
  '/api/v1/families',
  '/api/v1/assessments',
  '/api/v1/workers',
  '/api/v1/timebank',
  '/api/v1/lmn',
  '/api/v1/notifications',
  '/api/v1/payment',
  '/fhir/r4',
];

const HTTP_METHOD_TO_ACTION: Record<string, AuditAction> = {
  GET: 'read',
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
};

/**
 * Extract a coarse resource type from the URL path.
 * e.g. /api/v1/families/abc-123/members -> 'family'
 */
function extractResourceType(url: string): string {
  if (url.startsWith('/api/v1/families')) return 'family';
  if (url.startsWith('/api/v1/assessments')) return 'assessment';
  if (url.startsWith('/api/v1/workers')) return 'worker';
  if (url.startsWith('/api/v1/timebank')) return 'timebank';
  if (url.startsWith('/api/v1/lmn')) return 'lmn';
  if (url.startsWith('/api/v1/notifications')) return 'notification';
  if (url.startsWith('/api/v1/payment')) return 'payment';
  if (url.startsWith('/fhir/r4')) return 'fhir_resource';
  return 'unknown';
}

/**
 * Extract the first UUID-like segment after the resource prefix.
 * Returns null if not present (e.g. list endpoints).
 */
function extractResourceId(url: string): string | null {
  const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const match = UUID_RE.exec(url);
  return match ? match[0] : null;
}

export async function phiAuditHook(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const isPHIRoute = PHI_ROUTE_PREFIXES.some((prefix) => request.url.startsWith(prefix));
  if (!isPHIRoute) return;

  const userId = (request as FastifyRequest & { userId?: string }).userId ?? null;
  const method = request.method.toUpperCase();
  const action: AuditAction = HTTP_METHOD_TO_ACTION[method] ?? 'read';
  const outcome = reply.statusCode < 400 ? 'success' : 'failure';

  emitAudit({
    eventType: 'phi_access',
    action,
    outcome,
    userId,
    ip: request.ip,
    resourceType: extractResourceType(request.url),
    resourceId: extractResourceId(request.url),
  });
}

/**
 * Legacy export name — kept for backward compatibility with app.ts registrations.
 */
export const auditHook = phiAuditHook;
