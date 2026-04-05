/**
 * Server-side constants that don't belong in shared/
 */

export const API_PREFIX = '/api/v1';
export const FHIR_PREFIX = '/fhir/r4';

export const COOKIE_ACCESS_TOKEN = 'careos_access';
export const COOKIE_REFRESH_TOKEN = 'careos_refresh';

export const OUTBOX_POLL_INTERVAL_MS = 5000;
export const OUTBOX_BATCH_SIZE = 50;
export const OUTBOX_MAX_RETRIES = 5;

export const AUDIT_EVENT_SYSTEM = 'https://co-op.care/audit';
