/**
 * MobileNav — Bottom navigation bar for mobile (iOS-style)
 *
 * Shows the most important nav items for the active role.
 * Visible only on mobile viewports.
 */
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

interface MobileNavItem {
  label: string;
  href: string;
  icon: string;
}

const MOBILE_NAV: Record<string, MobileNavItem[]> = {
  conductor: [
    {
      label: 'Home',
      href: '#/conductor',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    { label: 'Time Bank', href: '#/timebank', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    {
      label: 'Assess',
      href: '#/assessments',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    },
    {
      label: 'Messages',
      href: '#/messages',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    },
  ],
  timebank_member: [
    { label: 'Feed', href: '#/timebank', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    {
      label: 'My Tasks',
      href: '#/timebank/mine',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    },
    { label: 'Impact', href: '#/timebank/impact', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    {
      label: 'Profile',
      href: '#/profile',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    },
  ],
};

export function MobileNav() {
  const { activeRole } = useAuth();
  const { unreadCount } = useNotifications();

  const items = activeRole ? (MOBILE_NAV[activeRole] ?? MOBILE_NAV['conductor']!) : [];
  if (items.length === 0) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-white pb-safe md:hidden">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="relative flex flex-col items-center gap-0.5 px-3 py-1 text-text-secondary"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
          </svg>
          <span className="text-[10px]">{item.label}</span>
          {item.label === 'Messages' && unreadCount > 0 && (
            <span className="absolute right-1 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-zone-red px-0.5 text-[9px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </a>
      ))}
    </nav>
  );
}
