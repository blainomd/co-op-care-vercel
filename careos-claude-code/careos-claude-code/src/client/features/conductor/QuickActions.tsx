/**
 * QuickActions — One-tap actions for the Conductor
 *
 * Target: complete any action in under 30 seconds from home screen.
 */

const actions = [
  {
    label: 'Request Help',
    href: '#/timebank/new',
    icon: 'M12 4v16m8-8H4',
    color: 'bg-sage text-white',
  },
  {
    label: 'Quick Check',
    href: '#/assessments/mini-cii',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    color: 'bg-copper text-white',
  },
  {
    label: 'Message',
    href: '#/messages',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    color: 'bg-blue text-white',
  },
  {
    label: 'Schedule',
    href: '#/appointments',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    color: 'bg-gold text-white',
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action) => (
        <a
          key={action.label}
          href={action.href}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-white p-3 transition-shadow hover:shadow-sm"
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${action.color}`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
            </svg>
          </div>
          <span className="text-center text-xs font-medium text-text-secondary">
            {action.label}
          </span>
        </a>
      ))}
    </div>
  );
}
