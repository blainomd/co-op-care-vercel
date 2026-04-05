/**
 * AdminDashboard — Coordinator-level overview of system operations
 *
 * Capacity metrics, task queue depth, matching efficiency, member counts.
 */
import { useState } from 'react';
import { MichaelisVisualization } from './MichaelisVisualization';

interface DashboardStats {
  totalConductors: number;
  totalWorkers: number;
  totalMembers: number;
  totalDirectors: number;
  openTaskCount: number;
  activeLMNCount: number;
  pendingLMNCount: number;
}

interface CapacityMetrics {
  openTasks: number;
  availableCaregivers: number;
  activeShifts: number;
  vmax: number;
  km: number;
  currentVelocity: number;
  saturationPercent: number;
  estimatedClearTime: number;
  matchEfficiency: number;
  averageWaitHours: number;
  oldestTaskHours: number;
  slaBreaches: number;
}

const MOCK_STATS: DashboardStats = {
  totalConductors: 4,
  totalWorkers: 23,
  totalMembers: 67,
  totalDirectors: 2,
  openTaskCount: 12,
  activeLMNCount: 41,
  pendingLMNCount: 3,
};

const MOCK_CAPACITY: CapacityMetrics = {
  openTasks: 12,
  availableCaregivers: 23,
  activeShifts: 8,
  vmax: 11.5,
  km: 18.4,
  currentVelocity: 4.54,
  saturationPercent: 39.5,
  estimatedClearTime: 2.64,
  matchEfficiency: 87.5,
  averageWaitHours: 3.21,
  oldestTaskHours: 14.7,
  slaBreaches: 1,
};

const STAT_CARDS: { key: keyof DashboardStats; label: string; color: string; icon: string }[] = [
  {
    key: 'totalMembers',
    label: 'Members',
    color: 'text-sage',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    key: 'totalWorkers',
    label: 'Caregivers',
    color: 'text-copper',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  },
  {
    key: 'totalConductors',
    label: 'Conductors',
    color: 'text-blue-600',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    key: 'openTaskCount',
    label: 'Open Tasks',
    color: 'text-gold',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    key: 'activeLMNCount',
    label: 'Active LMNs',
    color: 'text-zone-green',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    key: 'pendingLMNCount',
    label: 'Pending LMNs',
    color: 'text-orange-500',
    icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
  },
];

export function AdminDashboard() {
  const [stats] = useState<DashboardStats>(MOCK_STATS);
  const [capacity] = useState<CapacityMetrics>(MOCK_CAPACITY);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
        <p className="text-sm text-muted">System operations overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center gap-2">
              <svg
                className={`h-5 w-5 ${card.color}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
              </svg>
              <span className="text-xs text-muted">{card.label}</span>
            </div>
            <p className={`mt-1 text-2xl font-bold ${card.color}`}>{stats[card.key]}</p>
          </div>
        ))}
      </div>

      {/* Capacity & Queue Health */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Michaelis-Menten Capacity */}
        <div className="rounded-xl border border-border bg-white p-4 md:p-6">
          <h2 className="mb-4 text-lg font-semibold text-primary">Matching Capacity</h2>
          <MichaelisVisualization
            vmax={capacity.vmax}
            km={capacity.km}
            currentSubstrate={capacity.openTasks}
            currentVelocity={capacity.currentVelocity}
          />
        </div>

        {/* Queue Health */}
        <div className="rounded-xl border border-border bg-white p-4 md:p-6">
          <h2 className="mb-4 text-lg font-semibold text-primary">Queue Health</h2>
          <div className="space-y-4">
            <MetricRow
              label="Saturation"
              value={`${capacity.saturationPercent}%`}
              bar={capacity.saturationPercent}
              color={
                capacity.saturationPercent > 80
                  ? 'bg-zone-red'
                  : capacity.saturationPercent > 50
                    ? 'bg-gold'
                    : 'bg-zone-green'
              }
            />
            <MetricRow
              label="Match Efficiency"
              value={`${capacity.matchEfficiency}%`}
              bar={capacity.matchEfficiency}
              color={
                capacity.matchEfficiency < 70
                  ? 'bg-zone-red'
                  : capacity.matchEfficiency < 85
                    ? 'bg-gold'
                    : 'bg-zone-green'
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Avg Wait"
                value={`${capacity.averageWaitHours}h`}
                warn={capacity.averageWaitHours > 4}
              />
              <MetricCard
                label="Oldest Task"
                value={`${capacity.oldestTaskHours}h`}
                warn={capacity.oldestTaskHours > 24}
              />
              <MetricCard
                label="Est. Clear"
                value={`${capacity.estimatedClearTime}h`}
                warn={capacity.estimatedClearTime > 8}
              />
              <MetricCard
                label="SLA Breaches"
                value={String(capacity.slaBreaches)}
                warn={capacity.slaBreaches > 0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-3 md:grid-cols-3">
        <QuickLink
          href="#/admin/matching"
          label="Manual Matching"
          description="Override task assignments"
          icon="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
        <QuickLink
          href="#/admin/members"
          label="Member Management"
          description="View and manage members"
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
        <QuickLink
          href="#/admin/respite"
          label="Respite Fund"
          description="Emergency fund management"
          icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  bar,
  color,
}: {
  label: string;
  value: string;
  bar: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm text-secondary">{label}</span>
        <span className="text-sm font-semibold text-primary">{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-warm-gray/30">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(bar, 100)}%` }} />
      </div>
    </div>
  );
}

function MetricCard({ label, value, warn }: { label: string; value: string; warn: boolean }) {
  return (
    <div
      className={`rounded-lg border p-3 ${warn ? 'border-zone-red/30 bg-zone-red/5' : 'border-border bg-warm-gray/10'}`}
    >
      <p className="text-xs text-muted">{label}</p>
      <p className={`text-lg font-bold ${warn ? 'text-zone-red' : 'text-primary'}`}>{value}</p>
    </div>
  );
}

function QuickLink({
  href,
  label,
  description,
  icon,
}: {
  href: string;
  label: string;
  description: string;
  icon: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-border bg-white p-4 transition-colors hover:border-sage/40 hover:bg-sage/5"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/10 text-sage">
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-primary group-hover:text-sage">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
    </a>
  );
}
