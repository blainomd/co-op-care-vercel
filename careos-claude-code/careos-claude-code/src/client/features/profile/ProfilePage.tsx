/**
 * ProfilePage — View and edit user profile, switch active role
 *
 * Shows user info, role switcher, and account settings links.
 * Worker-owners see their equity summary badge.
 */
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '@shared/constants/business-rules';

const ROLE_LABELS: Record<string, string> = {
  conductor: 'Family Conductor',
  worker_owner: 'Worker-Owner',
  timebank_member: 'Time Bank Member',
  medical_director: 'Medical Director',
  admin: 'Administrator',
  employer_hr: 'Employer HR',
  wellness_provider: 'Wellness Provider',
};

const ROLE_COLORS: Record<string, string> = {
  conductor: 'bg-sage/10 text-sage border-sage/30',
  worker_owner: 'bg-copper/10 text-copper border-copper/30',
  timebank_member: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  medical_director: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  admin: 'bg-zone-red/10 text-zone-red border-zone-red/30',
  employer_hr: 'bg-gold/10 text-gold border-gold/30',
  wellness_provider: 'bg-teal-500/10 text-teal-600 border-teal-500/30',
};

export function ProfilePage() {
  const { user, activeRole, switchRole, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!user) return null;

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      {/* Profile Header */}
      <div className="flex items-start gap-4 rounded-2xl border border-border bg-white p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage text-xl font-bold text-white">
          {initials}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-primary">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-sm text-muted">{user.email}</p>
          {user.phone && <p className="text-sm text-muted">{user.phone}</p>}
          <p className="mt-1 text-xs text-muted">Member since {memberSince}</p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${ROLE_COLORS[activeRole ?? ''] ?? 'bg-warm-gray/20 text-muted'}`}
        >
          {ROLE_LABELS[activeRole ?? ''] ?? activeRole}
        </span>
      </div>

      {/* Role Switcher */}
      {user.roles.length > 1 && (
        <div className="rounded-xl border border-border bg-white p-4 md:p-6">
          <h2 className="mb-3 text-lg font-semibold text-primary">Switch Role</h2>
          <p className="mb-4 text-sm text-muted">
            You have {user.roles.length} roles. Switch to see a different dashboard.
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {user.roles.map((role) => (
              <button
                key={role}
                onClick={() => switchRole(role as UserRole)}
                className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  role === activeRole
                    ? 'border-sage bg-sage/5'
                    : 'border-border hover:bg-warm-gray/20'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    ROLE_COLORS[role] ?? 'bg-warm-gray/20 text-muted'
                  }`}
                >
                  {(ROLE_LABELS[role] ?? role).charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">{ROLE_LABELS[role] ?? role}</p>
                  {role === activeRole && <p className="text-[11px] text-sage">Active</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Account Details */}
      <div className="rounded-xl border border-border bg-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-primary">Account Details</h2>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-primary">Email</p>
              <p className="text-sm text-muted">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-primary">Phone</p>
              <p className="text-sm text-muted">{user.phone ?? 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-primary">Two-Factor Authentication</p>
              <p className="text-sm text-muted">
                {user.twoFactorEnabled ? 'Enabled' : 'Not enabled'}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                user.twoFactorEnabled ? 'bg-sage/10 text-sage' : 'bg-warm-gray/20 text-muted'
              }`}
            >
              {user.twoFactorEnabled ? 'Active' : 'Off'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-3 md:grid-cols-2">
        <a
          href="#/billing"
          className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 transition-colors hover:bg-warm-gray/20"
        >
          <svg
            className="h-5 w-5 text-copper"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-primary">Billing & Payments</p>
            <p className="text-xs text-muted">Manage membership and payments</p>
          </div>
        </a>
        <a
          href="#/timebank/referral"
          className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 transition-colors hover:bg-warm-gray/20"
        >
          <svg
            className="h-5 w-5 text-sage"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-primary">Refer a Neighbor</p>
            <p className="text-xs text-muted">Earn bonus hours</p>
          </div>
        </a>
      </div>

      {/* Logout */}
      <div className="rounded-xl border border-border bg-white p-4">
        {!showLogoutConfirm ? (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full rounded-lg border border-zone-red/30 px-4 py-2.5 text-sm font-medium text-zone-red transition-colors hover:bg-zone-red/5"
          >
            Sign Out
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <p className="flex-1 text-sm text-muted">Are you sure?</p>
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-warm-gray/20"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                void logout();
                window.location.hash = '/';
              }}
              className="rounded-lg bg-zone-red px-4 py-2 text-sm font-medium text-white hover:bg-zone-red/90"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted">
        CareOS v1.0 — co-op.care cooperative home care platform
      </p>
    </div>
  );
}
