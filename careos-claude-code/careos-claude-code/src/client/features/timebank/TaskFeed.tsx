/**
 * TaskFeed — Proximity-sorted task cards for Time Bank
 *
 * Shows available tasks near the user, sorted by distance.
 * Each card shows task type, requester, distance, estimated hours.
 */
import { useState, useMemo } from 'react';
import type { TaskStatus } from '@shared/types/timebank.types';
import type { TaskType } from '@shared/constants/business-rules';

// ── Icons per task type ──
const TASK_ICONS: Record<TaskType, string> = {
  meals: 'M3 3h18v2H3V3zm0 8h18v2H3v-2zm0 8h18v2H3v-2z',
  rides: 'M5 11l1.5-4.5h11L19 11M5 11v6h2v2h2v-2h6v2h2v-2h2v-6M5 11h14',
  companionship:
    'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  phone_companionship:
    'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  tech_support:
    'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  yard_work:
    'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  housekeeping:
    'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  grocery_run:
    'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z',
  errands:
    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  pet_care:
    'M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017a2 2 0 01-.867-.197l-5-2.74',
  admin_help:
    'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  teaching:
    'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
};

const TASK_COLORS: Record<string, string> = {
  meals: 'bg-copper/10 text-copper',
  rides: 'bg-blue/10 text-blue',
  companionship: 'bg-sage/10 text-sage',
  phone_companionship: 'bg-purple/10 text-purple',
  tech_support: 'bg-blue/10 text-blue',
  yard_work: 'bg-sage/10 text-sage',
  housekeeping: 'bg-gold/10 text-gold',
  grocery_run: 'bg-copper/10 text-copper',
  errands: 'bg-gold/10 text-gold',
  pet_care: 'bg-sage/10 text-sage',
  admin_help: 'bg-purple/10 text-purple',
  teaching: 'bg-blue/10 text-blue',
};

// ── Demo data ──
interface FeedTask {
  id: string;
  taskType: TaskType;
  title: string;
  requesterName: string;
  distanceMiles: number;
  estimatedHours: number;
  scheduledFor?: string;
  status: TaskStatus;
  isRemote: boolean;
}

const DEMO_TASKS: FeedTask[] = [
  {
    id: '1',
    taskType: 'companionship',
    title: 'Afternoon visit with Mom',
    requesterName: 'Sarah K.',
    distanceMiles: 0.3,
    estimatedHours: 2,
    status: 'open',
    isRemote: false,
  },
  {
    id: '2',
    taskType: 'grocery_run',
    title: 'Weekly groceries for Dad',
    requesterName: 'Michael T.',
    distanceMiles: 0.8,
    estimatedHours: 1.5,
    status: 'open',
    isRemote: false,
  },
  {
    id: '3',
    taskType: 'phone_companionship',
    title: 'Evening phone chat',
    requesterName: 'Linda R.',
    distanceMiles: 0,
    estimatedHours: 1,
    status: 'open',
    isRemote: true,
  },
  {
    id: '4',
    taskType: 'rides',
    title: 'Doctor appointment ride',
    requesterName: 'James W.',
    distanceMiles: 1.2,
    estimatedHours: 2,
    scheduledFor: 'Tomorrow, 2:00 PM',
    status: 'open',
    isRemote: false,
  },
  {
    id: '5',
    taskType: 'tech_support',
    title: 'Help set up video calls',
    requesterName: 'Dorothy P.',
    distanceMiles: 0,
    estimatedHours: 1,
    status: 'open',
    isRemote: true,
  },
  {
    id: '6',
    taskType: 'yard_work',
    title: 'Garden cleanup',
    requesterName: 'Robert M.',
    distanceMiles: 1.8,
    estimatedHours: 3,
    status: 'open',
    isRemote: false,
  },
];

type FilterType = 'all' | 'nearby' | 'remote';

export function TaskFeed() {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTasks = useMemo(() => {
    let tasks = [...DEMO_TASKS];

    if (filter === 'nearby') {
      tasks = tasks.filter((t) => !t.isRemote);
    } else if (filter === 'remote') {
      tasks = tasks.filter((t) => t.isRemote);
    }

    // Sort by distance (remote tasks at bottom)
    return tasks.sort((a, b) => {
      if (a.isRemote && !b.isRemote) return 1;
      if (!a.isRemote && b.isRemote) return -1;
      return a.distanceMiles - b.distanceMiles;
    });
  }, [filter]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All Tasks' },
    { key: 'nearby', label: 'In Person' },
    { key: 'remote', label: 'Remote' },
  ];

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">Available Tasks</h1>
        <p className="mt-1 text-sm text-text-secondary">Help a neighbor, earn time credits</p>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              filter === f.key
                ? 'bg-sage text-white'
                : 'bg-warm-gray text-text-secondary hover:bg-warm-gray/70'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task cards */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <a
            key={task.id}
            href={`#/timebank/task/${task.id}`}
            className="block rounded-xl border border-border bg-white p-4 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TASK_COLORS[task.taskType] ?? 'bg-warm-gray text-text-muted'}`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={TASK_ICONS[task.taskType]}
                  />
                </svg>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-text-primary">{task.title}</h3>
                  <span className="shrink-0 text-xs font-semibold text-sage">
                    +{task.estimatedHours}h
                  </span>
                </div>

                <p className="mt-0.5 text-xs text-text-muted">Requested by {task.requesterName}</p>

                <div className="mt-2 flex items-center gap-3">
                  {/* Distance / Remote badge */}
                  {task.isRemote ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple/10 px-2 py-0.5 text-[10px] font-medium text-purple">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Remote
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {task.distanceMiles < 1
                        ? `${Math.round(task.distanceMiles * 5280)} ft away`
                        : `${task.distanceMiles.toFixed(1)} mi away`}
                    </span>
                  )}

                  {/* Scheduled time */}
                  {task.scheduledFor && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {task.scheduledFor}
                    </span>
                  )}

                  {/* Estimated time */}
                  <span className="text-[10px] text-text-muted">~{task.estimatedHours}h</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="rounded-xl border border-border bg-white p-8 text-center">
          <p className="text-sm text-text-muted">No tasks available with this filter.</p>
        </div>
      )}
    </div>
  );
}
