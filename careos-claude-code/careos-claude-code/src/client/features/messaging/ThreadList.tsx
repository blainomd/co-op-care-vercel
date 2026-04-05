/**
 * ThreadList — Conversation thread list for secure messaging
 *
 * Shows all message threads with unread indicators, sorted by most recent.
 */
import { useState } from 'react';

interface Thread {
  id: string;
  participantName: string;
  participantRole: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  avatarInitials: string;
}

const DEMO_THREADS: Thread[] = [
  {
    id: '1',
    participantName: 'Sarah K.',
    participantRole: 'Conductor',
    lastMessage: 'Thanks so much for visiting Mom yesterday! She loved it.',
    lastMessageAt: '2 min ago',
    unreadCount: 2,
    avatarInitials: 'SK',
  },
  {
    id: '2',
    participantName: 'Dr. Martinez',
    participantRole: 'Medical Director',
    lastMessage: 'CRI review scheduled for next Tuesday at 10am.',
    lastMessageAt: '1 hr ago',
    unreadCount: 0,
    avatarInitials: 'DM',
  },
  {
    id: '3',
    participantName: 'Michael T.',
    participantRole: 'Time Bank Member',
    lastMessage: 'I can help with the grocery run this Saturday.',
    lastMessageAt: '3 hrs ago',
    unreadCount: 1,
    avatarInitials: 'MT',
  },
  {
    id: '4',
    participantName: 'Care Team',
    participantRole: 'Group',
    lastMessage: 'New respite schedule posted for this week.',
    lastMessageAt: 'Yesterday',
    unreadCount: 0,
    avatarInitials: 'CT',
  },
  {
    id: '5',
    participantName: 'Linda R.',
    participantRole: 'Worker-Owner',
    lastMessage: 'Just checking in — how is your father doing after the fall?',
    lastMessageAt: '2 days ago',
    unreadCount: 0,
    avatarInitials: 'LR',
  },
];

const ROLE_COLORS: Record<string, string> = {
  Conductor: 'bg-sage',
  'Medical Director': 'bg-copper',
  'Time Bank Member': 'bg-blue',
  'Worker-Owner': 'bg-purple',
  Group: 'bg-gold',
};

export function ThreadList() {
  const [threads] = useState<Thread[]>(DEMO_THREADS);
  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-4 md:px-6">
        <div>
          <h1 className="font-heading text-xl font-semibold text-text-primary">Messages</h1>
          {totalUnread > 0 && <p className="text-xs text-text-muted">{totalUnread} unread</p>}
        </div>
        <a
          href="#/messages/new"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-sage text-white hover:bg-sage-dark"
          title="New Message"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </a>
      </div>

      {/* Thread list */}
      <div className="divide-y divide-border">
        {threads.map((thread) => (
          <a
            key={thread.id}
            href={`#/messages/${thread.id}`}
            className={`flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-warm-gray/50 md:px-6 ${
              thread.unreadCount > 0 ? 'bg-sage/5' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white ${
                ROLE_COLORS[thread.participantRole] ?? 'bg-warm-gray'
              }`}
            >
              {thread.avatarInitials}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${thread.unreadCount > 0 ? 'font-semibold text-text-primary' : 'font-medium text-text-primary'}`}
                >
                  {thread.participantName}
                </span>
                <span className="shrink-0 text-[10px] text-text-muted">{thread.lastMessageAt}</span>
              </div>
              <p className="mt-0.5 text-xs text-text-muted">{thread.participantRole}</p>
              <p
                className={`mt-1 truncate text-sm ${thread.unreadCount > 0 ? 'font-medium text-text-primary' : 'text-text-secondary'}`}
              >
                {thread.lastMessage}
              </p>
            </div>

            {/* Unread badge */}
            {thread.unreadCount > 0 && (
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage text-[10px] font-bold text-white">
                {thread.unreadCount}
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
