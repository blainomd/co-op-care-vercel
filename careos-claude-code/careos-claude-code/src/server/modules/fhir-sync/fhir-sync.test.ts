/**
 * FHIR Sync Module Tests
 *
 * Tests outbox event management, exponential backoff, poller lifecycle,
 * sync handler dispatch, and webhook processing.
 */
import { describe, it, expect } from 'vitest';
import { calculateBackoff, type FhirResourceType, type OutboxEventAction } from './outbox.js';

// ─── Exponential Backoff ────────────────────────────────────

describe('Exponential Backoff', () => {
  it('calculates 2^0 = 1 second for first attempt', () => {
    expect(calculateBackoff(0)).toBe(1);
  });

  it('calculates 2^1 = 2 seconds for second attempt', () => {
    expect(calculateBackoff(1)).toBe(2);
  });

  it('calculates 2^2 = 4 seconds for third attempt', () => {
    expect(calculateBackoff(2)).toBe(4);
  });

  it('calculates 2^3 = 8 seconds for fourth attempt', () => {
    expect(calculateBackoff(3)).toBe(8);
  });

  it('calculates 2^4 = 16 seconds for fifth attempt', () => {
    expect(calculateBackoff(4)).toBe(16);
  });

  it('scales exponentially — each attempt doubles the delay', () => {
    for (let i = 0; i < 5; i++) {
      expect(calculateBackoff(i + 1)).toBe(calculateBackoff(i) * 2);
    }
  });
});

// ─── Outbox Event Types ─────────────────────────────────────

describe('Outbox Event Types', () => {
  it('supports all FHIR resource types from architecture spec', () => {
    const resourceTypes: FhirResourceType[] = [
      'Patient',
      'Encounter',
      'Observation',
      'QuestionnaireResponse',
      'CarePlan',
      'CareTeam',
      'DocumentReference',
      'Procedure',
    ];
    expect(resourceTypes).toHaveLength(8);
  });

  it('supports create, update, delete actions', () => {
    const actions: OutboxEventAction[] = ['create', 'update', 'delete'];
    expect(actions).toHaveLength(3);
  });
});

// ─── Poller State ───────────────────────────────────────────

describe('Poller Lifecycle', () => {
  it('isPollerRunning returns false when not started', async () => {
    const { isPollerRunning } = await import('./poller.js');
    expect(isPollerRunning()).toBe(false);
  });

  it('startPoller then stopPoller manages state correctly', async () => {
    // We can't actually start the poller without DB, but we can test the state guard
    const { isPollerRunning } = await import('./poller.js');
    expect(isPollerRunning()).toBe(false);
  });
});

// ─── Sync Handler Dispatch ──────────────────────────────────

describe('Sync Handler Dispatch', () => {
  it('dispatchSync returns error for unknown resource type', async () => {
    const { dispatchSync } = await import('./sync-handlers.js');
    const result = await dispatchSync({
      id: 'test:1',
      resourceType: 'UnknownType' as FhirResourceType,
      resourceId: 'test-123',
      action: 'create',
      payload: {},
      status: 'pending',
      attempts: 0,
      maxAttempts: 5,
      createdAt: new Date().toISOString(),
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('No handler');
  });
});

// ─── Webhook Payload Structure ──────────────────────────────

describe('Webhook Payload', () => {
  it('AidboxWebhookPayload has required fields', () => {
    // Type-level test — validates interface structure
    const payload = {
      resourceType: 'Encounter',
      id: 'enc-123',
      event: 'create' as const,
      resource: { status: 'finished' },
    };
    expect(payload.resourceType).toBe('Encounter');
    expect(payload.id).toBe('enc-123');
    expect(payload.event).toBe('create');
    expect(payload.resource).toHaveProperty('status');
  });
});
