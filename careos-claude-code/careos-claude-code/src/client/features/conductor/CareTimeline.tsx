/**
 * CareTimeline — Chronological feed of care interactions
 *
 * Shows tasks, check-ins, vitals, appointments in reverse chronological order.
 * Supports real-time updates via WebSocket.
 */
import { useState, useCallback } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';

interface TimelineEvent {
  id: string;
  type: 'task_completed' | 'check_in' | 'vitals' | 'appointment' | 'assessment' | 'note';
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
}

const EVENT_ICONS: Record<string, string> = {
  task_completed: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  check_in: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
  vitals:
    'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  appointment:
    'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  assessment:
    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  note: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
};

const EVENT_COLORS: Record<string, string> = {
  task_completed: 'bg-sage/10 text-sage',
  check_in: 'bg-blue/10 text-blue',
  vitals: 'bg-zone-red/10 text-zone-red',
  appointment: 'bg-copper/10 text-copper',
  assessment: 'bg-purple/10 text-purple',
  note: 'bg-gold/10 text-gold',
};

// Placeholder events until real API integration
const PLACEHOLDER_EVENTS: TimelineEvent[] = [
  {
    id: '1',
    type: 'task_completed',
    title: 'Grocery Shopping Complete',
    description: 'Maria helped with weekly grocery shopping',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    actor: 'Maria S.',
  },
  {
    id: '2',
    type: 'check_in',
    title: 'Care Visit Check-In',
    description: 'Daily companion care visit started',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    actor: 'James T.',
  },
  {
    id: '3',
    type: 'assessment',
    title: 'CII Assessment Updated',
    description: 'Caregiver Impact Index score: 62/120 (Green Zone)',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'appointment',
    title: 'Medical Director Review',
    description: 'Quarterly CRI reassessment scheduled',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function CareTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>(PLACEHOLDER_EVENTS);

  // Listen for real-time updates
  const handleWsMessage = useCallback((message: { type: string; data: unknown }) => {
    if (message.type === 'timeline_event') {
      setEvents((prev) => [message.data as TimelineEvent, ...prev]);
    }
  }, []);

  const { isConnected } = useWebSocket({
    onMessage: handleWsMessage,
    enabled: true,
  });

  return (
    <div className="rounded-xl border border-border bg-white p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-text-primary">Care Timeline</h2>
        <div className="flex items-center gap-1.5">
          <div
            className={`h-2 w-2 rounded-full ${isConnected ? 'bg-zone-green' : 'bg-text-muted'}`}
          />
          <span className="text-xs text-text-muted">{isConnected ? 'Live' : 'Offline'}</span>
        </div>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex gap-3">
            {/* Icon */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${EVENT_COLORS[event.type] ?? 'bg-warm-gray text-text-secondary'}`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={EVENT_ICONS[event.type] ?? ''}
                />
              </svg>
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-text-primary">{event.title}</p>
                <span className="shrink-0 text-xs text-text-muted">
                  {formatTimeAgo(event.timestamp)}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-text-secondary">{event.description}</p>
              {event.actor && <p className="mt-1 text-xs text-text-muted">by {event.actor}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
