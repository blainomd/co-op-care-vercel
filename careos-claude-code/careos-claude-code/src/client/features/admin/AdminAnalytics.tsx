/**
 * AdminAnalytics — Operational analytics dashboard for CareOS admins
 *
 * Shows signups/week, CII distribution, conversion rate, source tracking,
 * ZIP code saturation table, member funnel, and Michaelis-Menten capacity
 * metrics per service area. Export to CSV (mock).
 */
import { useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TimePeriod = '7d' | '30d' | '90d' | 'all';

interface PeriodData {
  label: string;
  totalMembers: number;
  newSignups: number;
  conversionRate: number;
  avgMatchTime: number; // minutes
  activeTasks: number;
  revenue: number;
  weeklySignups: number[];
  weekLabels: string[];
}

interface SourceEntry {
  name: string;
  pct: number;
  color: string;
}

interface ZipRow {
  zip: string;
  city: string;
  members: number;
  tasksPerWeek: number;
  avgMatchMin: number;
  saturation: number;
}

interface FunnelStep {
  label: string;
  count: number;
  dropoff: number; // pct that drop off before next step
}

// ---------------------------------------------------------------------------
// Mock data per time period
// ---------------------------------------------------------------------------

const PERIOD_DATA: Record<TimePeriod, PeriodData> = {
  '7d': {
    label: '7 Days',
    totalMembers: 127,
    newSignups: 9,
    conversionRate: 42,
    avgMatchTime: 18,
    activeTasks: 34,
    revenue: 4725,
    weeklySignups: [1, 2, 0, 1, 2, 1, 2],
    weekLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  '30d': {
    label: '30 Days',
    totalMembers: 127,
    newSignups: 31,
    conversionRate: 38,
    avgMatchTime: 22,
    activeTasks: 34,
    revenue: 18900,
    weeklySignups: [6, 8, 10, 7],
    weekLabels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
  },
  '90d': {
    label: '90 Days',
    totalMembers: 127,
    newSignups: 74,
    conversionRate: 35,
    avgMatchTime: 26,
    activeTasks: 34,
    revenue: 52500,
    weeklySignups: [18, 22, 16, 8, 5, 3, 2],
    weekLabels: ['Wk 1-2', 'Wk 3-4', 'Wk 5-6', 'Wk 7-8', 'Wk 9-10', 'Wk 11-12', 'Wk 13'],
  },
  all: {
    label: 'All Time',
    totalMembers: 127,
    newSignups: 127,
    conversionRate: 33,
    avgMatchTime: 28,
    activeTasks: 34,
    revenue: 98700,
    weeklySignups: [4, 8, 14, 22, 31, 26, 22],
    weekLabels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
  },
};

const SOURCES: SourceEntry[] = [
  { name: 'Website', pct: 35, color: 'bg-sage' },
  { name: 'Discharge', pct: 28, color: 'bg-copper' },
  { name: 'Employer', pct: 18, color: 'bg-gold' },
  { name: 'Referral', pct: 12, color: 'bg-blue' },
  { name: 'Faith Community', pct: 7, color: 'bg-purple' },
];

const CII_DISTRIBUTION = {
  green: 68, // CII <= 40
  yellow: 41, // CII 41-79
  red: 18, // CII >= 80
};

const ZIP_ROWS: ZipRow[] = [
  { zip: '80302', city: 'Boulder', members: 38, tasksPerWeek: 14, avgMatchMin: 12, saturation: 72 },
  { zip: '80301', city: 'Boulder', members: 24, tasksPerWeek: 9, avgMatchMin: 18, saturation: 54 },
  { zip: '80304', city: 'Boulder', members: 22, tasksPerWeek: 8, avgMatchMin: 22, saturation: 48 },
  { zip: '80303', city: 'Boulder', members: 19, tasksPerWeek: 7, avgMatchMin: 28, saturation: 38 },
  {
    zip: '80027',
    city: 'Louisville',
    members: 14,
    tasksPerWeek: 4,
    avgMatchMin: 35,
    saturation: 22,
  },
];

const FUNNEL: FunnelStep[] = [
  { label: 'Visitor', count: 3840, dropoff: 0 },
  { label: 'Mini CII', count: 1420, dropoff: 63 },
  { label: 'Account', count: 580, dropoff: 59 },
  { label: 'Membership', count: 192, dropoff: 67 },
  { label: 'Active', count: 127, dropoff: 34 },
];

// Michaelis-Menten per-ZIP data (requests = substrate, members = enzyme)
const MM_ZIP_DATA = [
  { zip: '80302', requests: 14, members: 38, matchTime: 12, vmax: 20, km: 8 },
  { zip: '80301', requests: 9, members: 24, matchTime: 18, vmax: 14, km: 7 },
  { zip: '80304', requests: 8, members: 22, matchTime: 22, vmax: 12, km: 6 },
  { zip: '80303', requests: 7, members: 19, matchTime: 28, vmax: 10, km: 7 },
  { zip: '80027', requests: 4, members: 14, matchTime: 35, vmax: 8, km: 5 },
];

// ---------------------------------------------------------------------------
// Icons (inline SVG)
// ---------------------------------------------------------------------------

function IconUsers() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.5 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
    </svg>
  );
}

function IconTrendUp() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 1-5.594 5.203 19.1 19.1 0 0 1-7.063 2.93.75.75 0 1 1-.29-1.472 17.6 17.6 0 0 0 6.51-2.7 17.907 17.907 0 0 0 5.213-4.876l-3.086.826a.75.75 0 0 1-.53-.919Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconClock() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M11.983 1.907a.75.75 0 0 0-1.292-.657l-8.5 9.5A.75.75 0 0 0 2.75 12h6.572l-1.305 6.093a.75.75 0 0 0 1.292.657l8.5-9.5A.75.75 0 0 0 17.25 8h-6.572l1.305-6.093Z" />
    </svg>
  );
}

function IconCurrency() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M10.75 10.818v2.614A3.13 3.13 0 0 0 11.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 0 0-1.138-.432ZM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 0 0-.35.13c-.318.178-.529.396-.529.657 0 .205.107.497.96 1.23Z" />
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM9.25 4.75A.75.75 0 0 1 10 4a.75.75 0 0 1 .75.75v.331c.362.07.71.193 1.02.378.49.292.87.744.87 1.33 0 .762-.627 1.293-1.154 1.607a5.71 5.71 0 0 1-1.486.586v2.38c.305-.098.58-.26.786-.446a.75.75 0 1 1 1.004 1.116 4.149 4.149 0 0 1-1.79.757v.282a.75.75 0 0 1-1.5 0v-.282a5.033 5.033 0 0 1-1.608-.674C6.39 11.748 6 11.275 6 10.689c0-.592.39-1.065.892-1.385a5.032 5.032 0 0 1 1.608-.674V6.28a2.008 2.008 0 0 0-.285.126.75.75 0 0 1-.748-1.3 3.497 3.497 0 0 1 1.033-.504V4.75Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconChart() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminAnalytics() {
  const [period, setPeriod] = useState<TimePeriod>('30d');
  const data = PERIOD_DATA[period];
  const maxSignup = Math.max(...data.weeklySignups, 1);

  const ciiTotal = CII_DISTRIBUTION.green + CII_DISTRIBUTION.yellow + CII_DISTRIBUTION.red;
  const ciiMax = Math.max(CII_DISTRIBUTION.green, CII_DISTRIBUTION.yellow, CII_DISTRIBUTION.red);

  const periods: { key: TimePeriod; label: string }[] = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
    { key: 'all', label: 'All Time' },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Operational Analytics</h1>
          <p className="text-sm text-muted">Co-op performance, signups, matching capacity</p>
        </div>
        <button
          type="button"
          onClick={() => alert('CSV export would download here')}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:bg-warm-gray"
        >
          <IconDownload />
          Export CSV
        </button>
      </div>

      {/* Time Period Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-warm-gray p-1">
        {periods.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPeriod(p.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              period === p.key
                ? 'bg-white text-primary shadow-sm'
                : 'text-muted hover:text-secondary'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[
          {
            label: 'Total Members',
            value: data.totalMembers.toLocaleString(),
            icon: <IconUsers />,
            color: 'text-primary',
          },
          {
            label: `Signups (${data.label})`,
            value: data.newSignups.toLocaleString(),
            icon: <IconTrendUp />,
            color: 'text-sage',
          },
          {
            label: 'Conversion Rate',
            value: `${data.conversionRate}%`,
            icon: <IconChart />,
            color: 'text-copper',
          },
          {
            label: 'Avg Match Time',
            value: `${data.avgMatchTime} min`,
            icon: <IconClock />,
            color: 'text-gold',
          },
          {
            label: 'Active Tasks',
            value: data.activeTasks.toLocaleString(),
            icon: <IconBolt />,
            color: 'text-sage',
          },
          {
            label: `Revenue (${data.label})`,
            value: `$${data.revenue.toLocaleString()}`,
            icon: <IconCurrency />,
            color: 'text-gold',
          },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-white p-3">
            <div className="flex items-center gap-2 text-muted">
              {kpi.icon}
              <span className="text-[11px]">{kpi.label}</span>
            </div>
            <p className={`mt-1 text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Signup Trend */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h2 className="text-sm font-semibold text-primary">Signup Trend</h2>
        <div className="mt-4 flex items-end gap-2">
          {data.weeklySignups.map((count, i) => (
            <div key={data.weekLabels[i]} className="flex-1 text-center">
              <div className="relative mx-auto w-full max-w-[40px]">
                <div
                  className="mx-auto w-full rounded-t bg-sage"
                  style={{ height: `${Math.max((count / maxSignup) * 80, 4)}px` }}
                />
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-medium text-primary">
                  {count}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-muted">{data.weekLabels[i]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Source Breakdown + CII Distribution side by side */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* Source Breakdown */}
        <div className="rounded-xl border border-border bg-white p-4">
          <h2 className="text-sm font-semibold text-primary">Referral Sources</h2>
          <div className="mt-3 space-y-2">
            {SOURCES.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-secondary">{s.name}</span>
                  <span className="font-medium text-primary">{s.pct}%</span>
                </div>
                <div className="mt-0.5 h-2 w-full rounded-full bg-warm-gray">
                  <div className={`h-2 rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-muted">
            {SOURCES.map((s) => (
              <span key={s.name} className="flex items-center gap-1">
                <span className={`inline-block h-2 w-2 rounded ${s.color}`} />
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {/* CII Distribution */}
        <div className="rounded-xl border border-border bg-white p-4">
          <h2 className="text-sm font-semibold text-primary">CII Distribution</h2>
          <p className="text-[11px] text-muted">{ciiTotal} total assessments</p>
          <div className="mt-3 flex items-end gap-4">
            {[
              {
                label: 'Green',
                sublabel: 'CII \u2264 40',
                count: CII_DISTRIBUTION.green,
                color: 'bg-sage',
                textColor: 'text-sage',
              },
              {
                label: 'Yellow',
                sublabel: 'CII 41-79',
                count: CII_DISTRIBUTION.yellow,
                color: 'bg-gold',
                textColor: 'text-gold',
              },
              {
                label: 'Red',
                sublabel: 'CII \u2265 80',
                count: CII_DISTRIBUTION.red,
                color: 'bg-zone-red',
                textColor: 'text-zone-red',
              },
            ].map((zone) => (
              <div key={zone.label} className="flex-1 text-center">
                <p className={`text-lg font-bold ${zone.textColor}`}>{zone.count}</p>
                <div className="mx-auto mt-1 w-full max-w-[48px]">
                  <div
                    className={`mx-auto w-full rounded-t ${zone.color}`}
                    style={{ height: `${Math.max((zone.count / ciiMax) * 60, 6)}px` }}
                  />
                </div>
                <p className="mt-1 text-[10px] font-medium text-secondary">{zone.label}</p>
                <p className="text-[9px] text-muted">{zone.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ZIP Code Heatmap Table */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h2 className="text-sm font-semibold text-primary">Service Area by ZIP Code</h2>
        <p className="text-[11px] text-muted">
          Top 5 ZIPs — members, weekly tasks, avg match time, saturation
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="pb-2 pr-3 font-medium">ZIP</th>
                <th className="pb-2 pr-3 font-medium">Area</th>
                <th className="pb-2 pr-3 text-right font-medium">Members</th>
                <th className="pb-2 pr-3 text-right font-medium">Tasks/Wk</th>
                <th className="pb-2 pr-3 text-right font-medium">Match (min)</th>
                <th className="pb-2 text-right font-medium">Saturation</th>
              </tr>
            </thead>
            <tbody>
              {ZIP_ROWS.map((row) => (
                <tr key={row.zip} className="border-b border-border/50 last:border-0">
                  <td className="py-2 pr-3 font-mono font-medium text-primary">{row.zip}</td>
                  <td className="py-2 pr-3 text-secondary">{row.city}</td>
                  <td className="py-2 pr-3 text-right text-primary">{row.members}</td>
                  <td className="py-2 pr-3 text-right text-primary">{row.tasksPerWeek}</td>
                  <td
                    className={`py-2 pr-3 text-right font-medium ${
                      row.avgMatchMin <= 15
                        ? 'text-sage'
                        : row.avgMatchMin <= 25
                          ? 'text-gold'
                          : 'text-zone-red'
                    }`}
                  >
                    {row.avgMatchMin}
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-warm-gray">
                        <div
                          className={`h-1.5 rounded-full ${
                            row.saturation >= 60
                              ? 'bg-sage'
                              : row.saturation >= 35
                                ? 'bg-gold'
                                : 'bg-zone-red'
                          }`}
                          style={{ width: `${row.saturation}%` }}
                        />
                      </div>
                      <span
                        className={`font-medium ${
                          row.saturation >= 60
                            ? 'text-sage'
                            : row.saturation >= 35
                              ? 'text-gold'
                              : 'text-zone-red'
                        }`}
                      >
                        {row.saturation}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Michaelis-Menten Dashboard */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h2 className="text-sm font-semibold text-primary">Michaelis-Menten Capacity Model</h2>
        <p className="text-[11px] text-muted">
          V = (V<sub>max</sub> x [S]) / (K<sub>m</sub> + [S]) — matching velocity by service area
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="pb-2 pr-3 font-medium">ZIP</th>
                <th className="pb-2 pr-3 text-right font-medium">Requests [S]</th>
                <th className="pb-2 pr-3 text-right font-medium">Members</th>
                <th className="pb-2 pr-3 text-right font-medium">
                  V<sub>max</sub>
                </th>
                <th className="pb-2 pr-3 text-right font-medium">
                  K<sub>m</sub>
                </th>
                <th className="pb-2 pr-3 text-right font-medium">Match (min)</th>
                <th className="pb-2 text-right font-medium">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {MM_ZIP_DATA.map((row) => {
                const velocity = (row.vmax * row.requests) / (row.km + row.requests);
                const utilization = Math.round((velocity / row.vmax) * 100);
                return (
                  <tr key={row.zip} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-3 font-mono font-medium text-primary">{row.zip}</td>
                    <td className="py-2 pr-3 text-right text-primary">{row.requests}</td>
                    <td className="py-2 pr-3 text-right text-primary">{row.members}</td>
                    <td className="py-2 pr-3 text-right text-secondary">{row.vmax}</td>
                    <td className="py-2 pr-3 text-right text-secondary">{row.km}</td>
                    <td
                      className={`py-2 pr-3 text-right font-medium ${
                        row.matchTime <= 15
                          ? 'text-sage'
                          : row.matchTime <= 25
                            ? 'text-gold'
                            : 'text-zone-red'
                      }`}
                    >
                      {row.matchTime}
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-14 rounded-full bg-warm-gray">
                          <div
                            className={`h-1.5 rounded-full ${
                              utilization >= 70
                                ? 'bg-zone-red'
                                : utilization >= 50
                                  ? 'bg-gold'
                                  : 'bg-sage'
                            }`}
                            style={{ width: `${utilization}%` }}
                          />
                        </div>
                        <span
                          className={`font-medium ${
                            utilization >= 70
                              ? 'text-zone-red'
                              : utilization >= 50
                                ? 'text-gold'
                                : 'text-sage'
                          }`}
                        >
                          {utilization}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 rounded-lg border border-sage/20 bg-sage/5 px-3 py-2">
          <p className="text-[10px] text-secondary">
            <span className="font-medium text-sage">How to read:</span> High utilization (red) means
            the ZIP is near matching saturation — adding more members will have diminishing returns.
            Low utilization (green) means the area can absorb more requests without degrading match
            times.
          </p>
        </div>
      </div>

      {/* Member Funnel */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h2 className="text-sm font-semibold text-primary">Member Funnel</h2>
        <p className="text-[11px] text-muted">Conversion path from first visit to active member</p>
        <div className="mt-4 space-y-0">
          {FUNNEL.map((step, i) => {
            const widthPct = Math.max((step.count / FUNNEL[0]!.count) * 100, 12);
            const isLast = i === FUNNEL.length - 1;
            return (
              <div key={step.label}>
                <div className="flex items-center gap-3">
                  <div className="w-20 text-right">
                    <p className="text-xs font-medium text-primary">{step.label}</p>
                  </div>
                  <div className="relative flex-1">
                    <div
                      className="flex h-8 items-center rounded bg-sage/15 px-3"
                      style={{ width: `${widthPct}%` }}
                    >
                      <span className="text-xs font-bold text-sage">
                        {step.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                {!isLast && (
                  <div className="ml-20 flex items-center gap-1 py-0.5 pl-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="h-3 w-3 text-zone-red"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 2a.75.75 0 0 1 .75.75v8.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.22 3.22V2.75A.75.75 0 0 1 8 2Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-[10px] text-zone-red">
                      {FUNNEL[i + 1]!.dropoff}% drop-off
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-3 border-t border-border pt-2">
          <div className="flex justify-between text-xs">
            <span className="text-secondary">Overall Conversion (Visitor to Active)</span>
            <span className="font-bold text-sage">
              {((FUNNEL[FUNNEL.length - 1]!.count / FUNNEL[0]!.count) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-[11px] text-muted">
        Mock data for development. Production will pull from PostgreSQL operational metrics and
        Aidbox clinical aggregates. Michaelis-Menten parameters calibrated from matching algorithm
        telemetry.
      </p>
    </div>
  );
}
