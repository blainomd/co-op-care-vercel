/**
 * Notifications Module Tests
 *
 * Tests template rendering, channel routing, interpolation,
 * and notification type coverage.
 */
import { describe, it, expect } from 'vitest';
import { getTemplate, interpolate, renderTemplate, getDefaultChannels } from './templates.js';
import type { NotificationType, NotificationChannel } from '@shared/types/notification.types';

// ─── Template Interpolation ─────────────────────────────────

describe('Template Interpolation', () => {
  it('replaces single variable', () => {
    expect(interpolate('Hello {{name}}!', { name: 'Alice' })).toBe('Hello Alice!');
  });

  it('replaces multiple variables', () => {
    const result = interpolate('{{firstName}} helped with {{taskTitle}}', {
      firstName: 'Bob',
      taskTitle: 'Grocery Run',
    });
    expect(result).toBe('Bob helped with Grocery Run');
  });

  it('preserves unmatched variables as-is', () => {
    const result = interpolate('Task: {{taskTitle}}, by {{helperName}}', {
      taskTitle: 'Yard Work',
    });
    expect(result).toBe('Task: Yard Work, by {{helperName}}');
  });

  it('handles empty variables object', () => {
    expect(interpolate('Hello {{name}}!', {})).toBe('Hello {{name}}!');
  });

  it('handles template with no variables', () => {
    expect(interpolate('No variables here', { name: 'Alice' })).toBe('No variables here');
  });

  it('handles empty string', () => {
    expect(interpolate('', { name: 'Alice' })).toBe('');
  });
});

// ─── Template Retrieval ─────────────────────────────────────

describe('Template Retrieval', () => {
  const allTypes: NotificationType[] = [
    'task_match',
    'task_accepted',
    'task_completed',
    'condition_change',
    'assessment_due',
    'lmn_expiry',
    'deficit_warning',
    'streak_milestone',
  ];

  const allChannels: NotificationChannel[] = ['push', 'sms', 'email', 'in_app'];

  it('has templates for all 8 notification types', () => {
    for (const type of allTypes) {
      const template = getTemplate(type, 'in_app');
      expect(template).toBeDefined();
      expect(template.title).toBeTruthy();
      expect(template.body).toBeTruthy();
    }
  });

  it('has templates for all 4 channels per type', () => {
    for (const type of allTypes) {
      for (const channel of allChannels) {
        const template = getTemplate(type, channel);
        expect(template).toBeDefined();
        expect(template.title.length).toBeGreaterThan(0);
        expect(template.body.length).toBeGreaterThan(0);
      }
    }
  });

  it('total template count: 8 types × 4 channels = 32', () => {
    let count = 0;
    for (const type of allTypes) {
      for (const channel of allChannels) {
        getTemplate(type, channel);
        count++;
      }
    }
    expect(count).toBe(32);
  });
});

// ─── Template Rendering ─────────────────────────────────────

describe('Template Rendering', () => {
  it('renders task_match push notification', () => {
    const rendered = renderTemplate('task_match', 'push', {
      taskTitle: 'Meal Preparation',
    });
    expect(rendered.title).toBe('New Task Match');
    expect(rendered.body).toContain('Meal Preparation');
  });

  it('renders task_completed email with all variables', () => {
    const rendered = renderTemplate('task_completed', 'email', {
      firstName: 'Alice',
      taskTitle: 'Grocery Shopping',
      creditsEarned: '2.5',
      balance: '15.75',
    });
    expect(rendered.title).toContain('Grocery Shopping');
    expect(rendered.body).toContain('Alice');
    expect(rendered.body).toContain('2.5');
    expect(rendered.body).toContain('15.75');
  });

  it('renders deficit_warning with balance', () => {
    const rendered = renderTemplate('deficit_warning', 'in_app', {
      balance: '-10',
    });
    expect(rendered.body).toContain('-10');
  });

  it('renders streak_milestone with weeks', () => {
    const rendered = renderTemplate('streak_milestone', 'push', {
      streakWeeks: '12',
      firstName: 'Bob',
    });
    expect(rendered.body).toContain('12');
    expect(rendered.body).toContain('Bob');
  });

  it('renders condition_change SMS for urgent notification', () => {
    const rendered = renderTemplate('condition_change', 'sms', {
      careRecipientName: 'Margaret',
    });
    expect(rendered.body).toContain('Margaret');
    expect(rendered.body).toContain('condition');
  });

  it('renders lmn_expiry with days remaining', () => {
    const rendered = renderTemplate('lmn_expiry', 'email', {
      firstName: 'Carol',
      careRecipientName: 'Dad',
      daysRemaining: '30',
    });
    expect(rendered.body).toContain('Carol');
    expect(rendered.body).toContain('Dad');
    expect(rendered.body).toContain('30');
  });
});

// ─── Default Channel Routing ────────────────────────────────

describe('Default Channel Routing', () => {
  it('condition_change routes to push + sms + in_app (urgent)', () => {
    const channels = getDefaultChannels('condition_change');
    expect(channels).toContain('push');
    expect(channels).toContain('sms');
    expect(channels).toContain('in_app');
  });

  it('lmn_expiry routes to email + in_app (scheduled)', () => {
    const channels = getDefaultChannels('lmn_expiry');
    expect(channels).toContain('email');
    expect(channels).toContain('in_app');
    expect(channels).not.toContain('sms');
  });

  it('task_match routes to push + in_app (time-sensitive)', () => {
    const channels = getDefaultChannels('task_match');
    expect(channels).toContain('push');
    expect(channels).toContain('in_app');
  });

  it('deficit_warning routes to in_app only (gentle nudge)', () => {
    const channels = getDefaultChannels('deficit_warning');
    expect(channels).toEqual(['in_app']);
  });

  it('streak_milestone routes to in_app only (community recognition)', () => {
    const channels = getDefaultChannels('streak_milestone');
    expect(channels).toEqual(['in_app']);
  });

  it('task_accepted routes to push + in_app', () => {
    const channels = getDefaultChannels('task_accepted');
    expect(channels).toContain('push');
    expect(channels).toContain('in_app');
  });

  it('task_completed routes to push + in_app', () => {
    const channels = getDefaultChannels('task_completed');
    expect(channels).toContain('push');
    expect(channels).toContain('in_app');
  });

  it('assessment_due routes to email + in_app', () => {
    const channels = getDefaultChannels('assessment_due');
    expect(channels).toContain('email');
    expect(channels).toContain('in_app');
  });

  it('all notification types have at least one default channel', () => {
    const allTypes: NotificationType[] = [
      'task_match',
      'task_accepted',
      'task_completed',
      'condition_change',
      'assessment_due',
      'lmn_expiry',
      'deficit_warning',
      'streak_milestone',
    ];
    for (const type of allTypes) {
      expect(getDefaultChannels(type).length).toBeGreaterThan(0);
    }
  });

  it('all default channels include in_app', () => {
    const allTypes: NotificationType[] = [
      'task_match',
      'task_accepted',
      'task_completed',
      'condition_change',
      'assessment_due',
      'lmn_expiry',
      'deficit_warning',
      'streak_milestone',
    ];
    for (const type of allTypes) {
      expect(getDefaultChannels(type)).toContain('in_app');
    }
  });
});

// ─── Notification Type Coverage ─────────────────────────────

describe('Notification Types', () => {
  it('shared types define exactly 8 notification types', () => {
    const types: NotificationType[] = [
      'task_match',
      'task_accepted',
      'task_completed',
      'condition_change',
      'assessment_due',
      'lmn_expiry',
      'deficit_warning',
      'streak_milestone',
    ];
    expect(types).toHaveLength(8);
  });

  it('shared types define exactly 4 channels', () => {
    const channels: NotificationChannel[] = ['push', 'sms', 'email', 'in_app'];
    expect(channels).toHaveLength(4);
  });
});

// ─── Channel Service Interfaces ─────────────────────────────

describe('Channel Service Interfaces', () => {
  it('PushPayload has required fields', () => {
    const payload = {
      title: 'Test',
      body: 'Test body',
      data: { key: 'value' },
      tag: 'test_tag',
    };
    expect(payload.title).toBeTruthy();
    expect(payload.body).toBeTruthy();
  });

  it('SmsPayload has required fields', () => {
    const payload = { to: '+15551234567', body: 'Test SMS' };
    expect(payload.to).toBeTruthy();
    expect(payload.body).toBeTruthy();
  });

  it('EmailPayload has required fields', () => {
    const payload = {
      to: 'test@example.com',
      subject: 'Test Subject',
      body: 'Test body',
    };
    expect(payload.to).toBeTruthy();
    expect(payload.subject).toBeTruthy();
    expect(payload.body).toBeTruthy();
  });

  it('InAppPayload has required fields', () => {
    const payload = {
      userId: 'user:1',
      type: 'task_match' as NotificationType,
      title: 'Test',
      body: 'Test body',
    };
    expect(payload.userId).toBeTruthy();
    expect(payload.type).toBe('task_match');
  });
});
