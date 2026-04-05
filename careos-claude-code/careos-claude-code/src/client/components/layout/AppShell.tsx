/**
 * AppShell — Main application layout container
 *
 * Wraps authenticated views with NavBar, Sidebar, and MobileNav.
 * Provides the responsive layout structure for all dashboard views.
 */
import type { ReactNode } from 'react';
import { NavBar } from './NavBar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <NavBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
