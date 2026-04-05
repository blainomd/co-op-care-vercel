/**
 * NotificationsPage — In-app notification list with mark-read
 *
 * Groups notifications by date, supports individual and bulk mark-as-read.
 * Links to relevant pages (tasks, assessments, messages).
 */
import { useState } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  linkTo?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'task_matched',
    title: 'Task Matched',
    body: 'James accepted "Cook Korean comfort food" for Soon-Yi.',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    linkTo: '#/timebank/task/6',
  },
  {
    id: 'n2',
    type: 'assessment_due',
    title: 'CII Reassessment Due',
    body: "Helen's 90-day CII reassessment is due in 3 days.",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    linkTo: '#/assessments/cii',
  },
  {
    id: 'n3',
    type: 'streak_milestone',
    title: 'Streak Milestone',
    body: 'Four weeks of giving back! Your care streak is growing.',
    read: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n4',
    type: 'membership_renewal',
    title: 'Membership Renewal',
    body: 'Your annual membership renews in 30 days ($100/year).',
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    linkTo: '#/billing',
  },
  {
    id: 'n5',
    type: 'task_completed',
    title: 'Task Completed',
    body: 'Linda completed "Weekly grocery shopping" for Roberto.',
    read: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    linkTo: '#/timebank',
  },
  {
    id: 'n6',
    type: 'referral_bonus',
    title: 'Referral Bonus',
    body: 'Tom K. completed their first task! You earned 5 bonus hours.',
    read: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    linkTo: '#/timebank/referral',
  },
];

const TYPE_ICONS: Record<string, { path: string; color: string }> = {
  task_matched: {
    path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    color: 'text-sage',
  },
  assessment_due: {
    path: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'text-copper',
  },
  streak_milestone: {
    path: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    color: 'text-gold',
  },
  membership_renewal: {
    path: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
    color: 'text-copper',
  },
  task_completed: {
    path: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    color: 'text-sage',
  },
  referral_bonus: {
    path: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    color: 'text-sage',
  },
};

function formatRelativeTime(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearRead = () => {
    setNotifications((prev) => prev.filter((n) => !n.read));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Notifications</h1>
          <p className="text-sm text-muted">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-warm-gray/20"
            >
              Mark all read
            </button>
          )}
          {notifications.some((n) => n.read) && (
            <button
              onClick={clearRead}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-warm-gray/20"
            >
              Clear read
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <div className="rounded-xl border border-border bg-white py-12 text-center">
          <svg
            className="mx-auto h-10 w-10 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
          <p className="mt-3 text-sm text-muted">No notifications</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="divide-y divide-border">
            {notifications.map((n) => {
              const icon = TYPE_ICONS[n.type] ?? TYPE_ICONS.task_completed!;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-4 transition-colors ${
                    n.read ? 'bg-white' : 'bg-sage/5'
                  }`}
                >
                  <svg
                    className={`mt-0.5 h-5 w-5 shrink-0 ${icon.color}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon.path} />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm ${n.read ? 'text-secondary' : 'font-medium text-primary'}`}
                      >
                        {n.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-muted">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted">{n.body}</p>
                    <div className="mt-2 flex items-center gap-3">
                      {n.linkTo && (
                        <a
                          href={n.linkTo}
                          className="text-xs font-medium text-sage hover:text-sage/80"
                        >
                          View
                        </a>
                      )}
                      {!n.read && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-xs text-muted hover:text-secondary"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                  {!n.read && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sage" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted">
        Notification preferences can be configured in Settings.
      </p>
    </div>
  );
}
