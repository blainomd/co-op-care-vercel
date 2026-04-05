/**
 * NavBar — Top navigation bar with role indicator and notifications
 */
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useUiStore } from '../../stores/uiStore';

const ROLE_LABELS: Record<string, string> = {
  conductor: 'Conductor',
  worker_owner: 'Worker-Owner',
  timebank_member: 'Time Bank',
  medical_director: 'Medical Director',
  admin: 'Admin',
  employer_hr: 'Employer',
  wellness_provider: 'Wellness',
};

const ROLE_COLORS: Record<string, string> = {
  conductor: 'bg-copper text-white',
  worker_owner: 'bg-sage text-white',
  timebank_member: 'bg-sage-light text-white',
  medical_director: 'bg-blue text-white',
  admin: 'bg-purple text-white',
  employer_hr: 'bg-gold text-white',
  wellness_provider: 'bg-sage text-white',
};

export function NavBar() {
  const { user, activeRole, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { toggleSidebar } = useUiStore();

  if (!user) return null;

  const roleLabel = activeRole ? (ROLE_LABELS[activeRole] ?? activeRole) : '';
  const roleColor = activeRole ? (ROLE_COLORS[activeRole] ?? 'bg-sage text-white') : '';

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-white px-4 md:px-6">
      {/* Left: hamburger + logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1.5 text-text-secondary hover:bg-warm-gray md:hidden"
          aria-label="Toggle menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <a href="#/" className="font-heading text-lg font-semibold text-sage">
          CareOS
        </a>
      </div>

      {/* Center: role badge */}
      <div className="flex items-center gap-2">
        {activeRole && (
          <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${roleColor}`}>
            {roleLabel}
          </span>
        )}
      </div>

      {/* Right: notifications + user menu */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <a
          href="#/notifications"
          className="relative rounded-md p-1.5 text-text-secondary hover:bg-warm-gray"
          aria-label="Notifications"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-zone-red px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </a>

        {/* User avatar + logout */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage text-sm font-medium text-white">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <button
            onClick={logout}
            className="hidden text-sm text-text-secondary hover:text-text-primary md:block"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
