/**
 * CareSchedule — Weekly care schedule and appointment management
 *
 * Shows upcoming visits from worker-owners, Time Bank tasks, medical appointments,
 * and wellness sessions. Integrated with the care team.
 */
import { useState } from 'react';

interface ScheduleEvent {
  id: string;
  title: string;
  type: 'worker_visit' | 'timebank_task' | 'medical' | 'wellness' | 'telehealth';
  date: string;
  startTime: string;
  endTime: string;
  provider: string;
  status: 'confirmed' | 'pending' | 'completed';
  careRecipient: string;
  notes?: string;
}

const today = new Date();
const formatDate = (daysOffset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0]!;
};

const MOCK_SCHEDULE: ScheduleEvent[] = [
  {
    id: 's1',
    title: 'Morning Care Visit',
    type: 'worker_visit',
    date: formatDate(0),
    startTime: '8:00 AM',
    endTime: '10:00 AM',
    provider: 'James Park',
    status: 'confirmed',
    careRecipient: 'Helen Park',
    notes: 'Morning routine, medication, light breakfast prep',
  },
  {
    id: 's2',
    title: 'Grocery Shopping',
    type: 'timebank_task',
    date: formatDate(0),
    startTime: '2:00 PM',
    endTime: '3:30 PM',
    provider: 'Linda Chen',
    status: 'confirmed',
    careRecipient: 'Helen Park',
  },
  {
    id: 's3',
    title: 'Dr. Kim Follow-up',
    type: 'medical',
    date: formatDate(1),
    startTime: '10:30 AM',
    endTime: '11:00 AM',
    provider: 'Dr. Sarah Kim',
    status: 'confirmed',
    careRecipient: 'Helen Park',
    notes: 'Cardiology follow-up, bring medication list',
  },
  {
    id: 's4',
    title: 'Afternoon Care Visit',
    type: 'worker_visit',
    date: formatDate(1),
    startTime: '1:00 PM',
    endTime: '4:00 PM',
    provider: 'James Park',
    status: 'confirmed',
    careRecipient: 'Helen Park',
  },
  {
    id: 's5',
    title: 'Gentle Yoga',
    type: 'wellness',
    date: formatDate(2),
    startTime: '9:00 AM',
    endTime: '10:00 AM',
    provider: 'Lisa Chen, RYT-500',
    status: 'pending',
    careRecipient: 'Helen Park',
  },
  {
    id: 's6',
    title: 'Companionship Visit',
    type: 'timebank_task',
    date: formatDate(2),
    startTime: '3:00 PM',
    endTime: '5:00 PM',
    provider: 'Tom K.',
    status: 'pending',
    careRecipient: 'Helen Park',
  },
  {
    id: 's7',
    title: 'LMN Renewal Telehealth',
    type: 'telehealth',
    date: formatDate(4),
    startTime: '11:00 AM',
    endTime: '11:30 AM',
    provider: 'Dr. Michael Emdur',
    status: 'confirmed',
    careRecipient: 'Helen Park',
    notes: 'Annual LMN renewal — CRI reassessment during call',
  },
  {
    id: 's8',
    title: 'Morning Care Visit',
    type: 'worker_visit',
    date: formatDate(3),
    startTime: '8:00 AM',
    endTime: '10:00 AM',
    provider: 'James Park',
    status: 'confirmed',
    careRecipient: 'Helen Park',
  },
];

const TYPE_CONFIG: Record<string, { color: string; bgColor: string; icon: string }> = {
  worker_visit: {
    color: 'text-copper',
    bgColor: 'bg-copper/10 border-copper/20',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  timebank_task: {
    color: 'text-sage',
    bgColor: 'bg-sage/10 border-sage/20',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  medical: {
    color: 'text-zone-red',
    bgColor: 'bg-zone-red/10 border-zone-red/20',
    icon: 'M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5',
  },
  wellness: {
    color: 'text-teal-600',
    bgColor: 'bg-teal-500/10 border-teal-500/20',
    icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
  },
  telehealth: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    icon: 'M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z',
  },
};

export function CareSchedule() {
  const [viewDays] = useState(7);

  // Group events by date
  const grouped = MOCK_SCHEDULE.reduce<Record<string, ScheduleEvent[]>>((acc, event) => {
    (acc[event.date] ??= []).push(event);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Care Schedule</h1>
          <p className="text-sm text-muted">Next {viewDays} days for Helen Park</p>
        </div>
        <a
          href="#/timebank/new"
          className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-dark"
        >
          Request Help
        </a>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(TYPE_CONFIG).map(([type, config]) => {
          const count = MOCK_SCHEDULE.filter((e) => e.type === type).length;
          return (
            <div key={type} className="rounded-lg border border-border bg-white p-2 text-center">
              <svg
                className={`mx-auto h-4 w-4 ${config.color}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
              </svg>
              <p className="mt-1 text-lg font-bold text-primary">{count}</p>
              <p className="text-[10px] text-muted">{type.replace('_', ' ')}</p>
            </div>
          );
        })}
      </div>

      {/* Schedule by Day */}
      {sortedDates.map((date) => {
        const events = grouped[date]!;
        const d = new Date(date + 'T12:00:00');
        const isToday = date === formatDate(0);
        const isTomorrow = date === formatDate(1);
        const dayLabel = isToday
          ? 'Today'
          : isTomorrow
            ? 'Tomorrow'
            : d.toLocaleDateString('en-US', { weekday: 'long' });

        return (
          <div key={date}>
            <div className="flex items-center gap-2 mb-2">
              <h2 className={`text-sm font-semibold ${isToday ? 'text-sage' : 'text-primary'}`}>
                {dayLabel}
              </h2>
              <span className="text-xs text-muted">
                {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              {isToday && (
                <span className="rounded-full bg-sage px-2 py-0.5 text-[10px] font-medium text-white">
                  Today
                </span>
              )}
            </div>
            <div className="space-y-2">
              {events
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((event) => {
                  const config = TYPE_CONFIG[event.type]!;
                  return (
                    <div
                      key={event.id}
                      className={`flex items-start gap-3 rounded-xl border p-3 ${config.bgColor}`}
                    >
                      <svg
                        className={`mt-0.5 h-5 w-5 shrink-0 ${config.color}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-primary">{event.title}</p>
                          <span
                            className={`shrink-0 text-xs ${
                              event.status === 'confirmed'
                                ? 'text-sage'
                                : event.status === 'pending'
                                  ? 'text-gold'
                                  : 'text-muted'
                            }`}
                          >
                            {event.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted">
                          {event.startTime} – {event.endTime} · {event.provider}
                        </p>
                        {event.notes && (
                          <p className="mt-1 text-xs text-secondary">{event.notes}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}

      <p className="text-[11px] text-muted">
        Schedule includes worker-owner visits, Time Bank tasks, medical appointments, and wellness
        sessions.
      </p>
    </div>
  );
}
