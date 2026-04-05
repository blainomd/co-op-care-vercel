/**
 * PersonalizedHome — Each user's personalized dashboard
 *
 * Reads the user's active Connectors, role, and CareGoals values,
 * then renders a prioritized, real-time feed of what matters NOW.
 *
 * The same Connector data feeds every surface:
 *   - Conductor (daughter): Alerts, meds, appointments, savings, guide
 *   - Care recipient (mom): Simple schedule, comfort, "call Jane" button
 *   - Worker (caregiver): Today's shift, meds to give, emergency protocols
 *   - Medical director: Review queue, attestation, billing codes
 *
 * Priority logic: urgent first, then time-sensitive, then informational.
 * Real-time via WebSocket subscription to the event bus.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { CONNECTORS } from '../../../shared/connectors/registry';
import type { ConnectorConfig } from '../../../shared/types/connector.types';
import type { UserRole } from '../../../shared/constants/business-rules';

// ─── Priority Levels ────────────────────────────────────────────────

type Priority = 'urgent' | 'action' | 'info' | 'background';

interface FeedItem {
  id: string;
  connectorId: string;
  priority: Priority;
  title: string;
  subtitle: string;
  action?: { label: string; route: string };
  icon: string;
  color: string;
  timestamp: string;
  badge?: string;
}

// ─── Role-specific greeting + context ───────────────────────────────

function getGreeting(
  role: UserRole | null,
  firstName: string,
): { greeting: string; context: string } {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  switch (role) {
    case 'conductor':
      return {
        greeting: `${timeGreeting}, ${firstName}`,
        context: "Here's what needs your attention today.",
      };
    case 'worker_owner':
      return {
        greeting: `${timeGreeting}, ${firstName}`,
        context: "Here's your shift and what to watch for.",
      };
    case 'medical_director':
      return {
        greeting: `${timeGreeting}, Dr. ${firstName}`,
        context: 'Items awaiting your review.',
      };
    default:
      return {
        greeting: `${timeGreeting}, ${firstName}`,
        context: 'Your care at a glance.',
      };
  }
}

// ─── Mock real-time feed (replace with WebSocket subscription) ──────

function buildFeed(role: UserRole | null): FeedItem[] {
  const now = new Date().toISOString();
  const items: FeedItem[] = [];

  if (role === 'conductor') {
    items.push(
      {
        id: 'med-1',
        connectorId: 'medication-mgmt',
        priority: 'urgent',
        title: 'Medication interaction flagged',
        subtitle: 'Metformin + new prescription requires physician review',
        action: { label: 'View details', route: '/conductor/medication-tracker' },
        icon: 'medication',
        color: '#c0392b',
        timestamp: now,
        badge: 'Physician review',
      },
      {
        id: 'appt-1',
        connectorId: 'appointment-monitor',
        priority: 'action',
        title: 'Cardiology appointment tomorrow',
        subtitle: 'Dr. Patel at 2:30 PM — bring medication list and insurance card',
        action: { label: 'Prep checklist', route: '/conductor/care-schedule' },
        icon: 'calendar',
        color: '#2980b9',
        timestamp: now,
      },
      {
        id: 'savings-1',
        connectorId: 'savings-finder',
        priority: 'action',
        title: 'LMN ready for review',
        subtitle: 'Letter of Medical Necessity drafted — $936/yr savings if signed',
        action: { label: 'View LMN', route: '/billing/comfort-card' },
        icon: 'savings',
        color: '#c4956a',
        timestamp: now,
        badge: '$936 savings',
      },
      {
        id: 'refill-1',
        connectorId: 'medication-mgmt',
        priority: 'action',
        title: 'Lisinopril refill in 5 days',
        subtitle: 'CVS Pharmacy — auto-refill is not set up',
        action: { label: 'Set reminder', route: '/conductor/medication-tracker' },
        icon: 'medication',
        color: '#7c956b',
        timestamp: now,
      },
      {
        id: 'plan-1',
        connectorId: 'care-plan',
        priority: 'info',
        title: 'Morning routine completed',
        subtitle: 'Maria logged: breakfast, morning meds, 15-min walk in garden',
        icon: 'care-plan',
        color: '#7c956b',
        timestamp: now,
      },
      {
        id: 'memory-1',
        connectorId: 'living-memory',
        priority: 'info',
        title: 'Guide updated',
        subtitle: 'New cardiology referral added to appointments section',
        icon: 'memory',
        color: '#8b7355',
        timestamp: now,
      },
      {
        id: 'research-1',
        connectorId: 'clinical-research',
        priority: 'background',
        title: 'Fall prevention protocol available',
        subtitle: 'Evidence-based guidelines for osteoarthritis patients — reviewed by Dr. Emdur',
        action: { label: 'Read', route: '/conductor/care-team' },
        icon: 'research',
        color: '#5a7049',
        timestamp: now,
        badge: 'Physician verified',
      },
    );
  } else if (role === 'worker_owner') {
    items.push(
      {
        id: 'shift-1',
        connectorId: 'care-plan',
        priority: 'urgent',
        title: "Today's shift: Margaret W.",
        subtitle: '9:00 AM – 3:00 PM · Companion care · Moderate assistance',
        action: { label: 'View routine', route: '/worker/care-log' },
        icon: 'care-plan',
        color: '#7c956b',
        timestamp: now,
      },
      {
        id: 'med-w-1',
        connectorId: 'medication-mgmt',
        priority: 'urgent',
        title: 'Medications to administer',
        subtitle: 'Metformin 500mg with lunch (12:00 PM) · Confirm with checklist',
        action: { label: 'Med checklist', route: '/worker/care-log' },
        icon: 'medication',
        color: '#c0392b',
        timestamp: now,
      },
      {
        id: 'values-1',
        connectorId: 'care-plan',
        priority: 'action',
        title: 'What makes a good day for Margaret',
        subtitle: 'Morning coffee on the porch, garden time, talking about grandkids',
        icon: 'care-plan',
        color: '#c4956a',
        timestamp: now,
      },
      {
        id: 'emergency-w',
        connectorId: 'clinical-research',
        priority: 'info',
        title: 'Emergency protocols loaded',
        subtitle:
          'Fall: call Jane first, then 911. Do not move her. Grab hospital bag by front door.',
        icon: 'research',
        color: '#c0392b',
        timestamp: now,
      },
    );
  } else if (role === 'medical_director') {
    items.push(
      {
        id: 'review-1',
        connectorId: 'clinical-research',
        priority: 'urgent',
        title: '3 LMNs awaiting signature',
        subtitle: 'Highest priority: Margaret W. (medication interaction flagged)',
        action: { label: 'Review queue', route: '/admin/dashboard' },
        icon: 'research',
        color: '#c0392b',
        timestamp: now,
        badge: '3 pending',
      },
      {
        id: 'review-2',
        connectorId: 'medication-mgmt',
        priority: 'action',
        title: '1 drug interaction to verify',
        subtitle: 'Metformin + Lisinopril flagged as moderate — confirm or override',
        action: { label: 'Review', route: '/admin/dashboard' },
        icon: 'medication',
        color: '#2980b9',
        timestamp: now,
      },
      {
        id: 'billing-1',
        connectorId: 'appointment-monitor',
        priority: 'info',
        title: '12 encounters this week',
        subtitle: 'G0019: 5 · G0023: 4 · 97550: 3 · Estimated: $1,240',
        icon: 'calendar',
        color: '#7c956b',
        timestamp: now,
        badge: '$1,240',
      },
    );
  }

  // Sort by priority
  const priorityOrder: Record<Priority, number> = {
    urgent: 0,
    action: 1,
    info: 2,
    background: 3,
  };
  return items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// ─── Priority Badge ─────────────────────────────────────────────────

function PriorityDot({ priority }: { priority: Priority }) {
  const colors: Record<Priority, string> = {
    urgent: '#c0392b',
    action: '#e67e22',
    info: '#7c956b',
    background: '#ccc',
  };
  return (
    <span
      className="inline-block rounded-full"
      style={{ width: 8, height: 8, background: colors[priority], flexShrink: 0 }}
    />
  );
}

// ─── Active Connectors Bar ──────────────────────────────────────────

function ActiveConnectors({ connectors }: { connectors: ConnectorConfig[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {connectors.map((c) => (
        <div
          key={c.id}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium"
          style={{
            borderColor: `${c.landing.tagColor}40`,
            color: c.landing.tagColor,
            background: `${c.landing.tagColor}08`,
          }}
        >
          <span
            className="inline-block rounded-full"
            style={{ width: 6, height: 6, background: c.landing.tagColor }}
          />
          {c.name}
        </div>
      ))}
    </div>
  );
}

// ─── Feed Card ──────────────────────────────────────────────────────

function FeedCard({ item, onAction }: { item: FeedItem; onAction: (route: string) => void }) {
  return (
    <div
      className="rounded-xl border bg-white p-4 transition-shadow hover:shadow-md"
      style={{ borderColor: item.priority === 'urgent' ? `${item.color}40` : '#eee' }}
    >
      <div className="flex items-start gap-3">
        <PriorityDot priority={item.priority} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
            {item.badge && (
              <span
                className="whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-bold"
                style={{
                  background: `${item.color}15`,
                  color: item.color,
                }}
              >
                {item.badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.subtitle}</p>
          {item.action && (
            <button
              onClick={() => onAction(item.action!.route)}
              className="mt-2 text-xs font-semibold transition-colors hover:opacity-80"
              style={{
                color: item.color,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {item.action.label} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export function PersonalizedHome() {
  const { user, activeRole } = useAuthStore();
  const navigate = useNavigate();
  const [feed, setFeed] = useState<FeedItem[]>([]);

  // Active connectors for this user (in production: fetched from user's subscription)
  const activeConnectors = CONNECTORS;

  useEffect(() => {
    setFeed(buildFeed(activeRole));

    // In production: subscribe to WebSocket for real-time updates
    // ws.on('connector.output', (event) => {
    //   setFeed(prev => prioritize([mapToFeedItem(event), ...prev]));
    // });
  }, [activeRole]);

  const { greeting, context } = getGreeting(activeRole, user?.firstName || 'there');

  const urgentCount = feed.filter((f) => f.priority === 'urgent').length;
  const actionCount = feed.filter((f) => f.priority === 'action').length;

  return (
    <div className="mx-auto max-w-lg space-y-5 p-4 md:p-6">
      {/* Greeting */}
      <div>
        <h1 className="font-heading text-2xl font-semibold text-gray-900">{greeting}</h1>
        <p className="mt-1 text-sm text-gray-500">{context}</p>
      </div>

      {/* Priority summary */}
      {(urgentCount > 0 || actionCount > 0) && (
        <div className="flex gap-3">
          {urgentCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              <PriorityDot priority="urgent" />
              {urgentCount} urgent
            </div>
          )}
          {actionCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              <PriorityDot priority="action" />
              {actionCount} action needed
            </div>
          )}
        </div>
      )}

      {/* Active Connectors */}
      <div>
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Active connectors
        </div>
        <ActiveConnectors connectors={activeConnectors} />
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {feed.map((item) => (
          <FeedCard key={item.id} item={item} onAction={(route) => navigate(route)} />
        ))}
      </div>

      {/* Caregiver Guide quick access */}
      {activeRole === 'conductor' && (
        <button
          onClick={() => navigate('/guide')}
          className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">Caregiver Guide</div>
              <div className="mt-0.5 text-xs text-gray-500">
                Printable guide updated today · Physician reviewed
              </div>
            </div>
            <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <path
                d="M8 5l5 5-5 5"
                stroke="#999"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>
      )}

      {/* Quick action for care recipient role */}
      {activeRole === 'timebank_member' && (
        <div className="space-y-3">
          <button
            className="w-full rounded-2xl p-6 text-center text-white shadow-lg"
            style={{ background: '#c0392b' }}
          >
            <div className="text-lg font-bold">Call Jane</div>
            <div className="mt-1 text-sm opacity-80">(555) 123-4567</div>
          </button>
          <button className="w-full rounded-2xl border-2 border-gray-200 bg-white p-5 text-center">
            <div className="text-base font-semibold text-gray-800">I need help</div>
            <div className="mt-1 text-xs text-gray-500">Sends alert to your care team</div>
          </button>
        </div>
      )}
    </div>
  );
}
