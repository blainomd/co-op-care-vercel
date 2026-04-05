/**
 * TaskHistory — Time Bank transaction and task history for a member
 *
 * Shows filtered, searchable history of all Time Bank activity:
 * giving help, receiving help, purchasing hours, donating to Respite Fund,
 * and expired credits. Includes monthly summary chart and export.
 */

import { useState } from 'react';

type FilterTab = 'all' | 'given' | 'received' | 'purchased' | 'donated';

type TransactionType = 'gave' | 'received' | 'purchased' | 'donated' | 'expired';

interface Transaction {
  id: string;
  date: string;
  time: string;
  type: TransactionType;
  description: string;
  hours: number;
  balanceAfter: number;
  omahaProblem: string;
  omahaCode: string;
  rating: number | null;
}

interface MonthSummary {
  month: string;
  given: number;
  received: number;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    date: '2026-03-07',
    time: '2:30 PM',
    type: 'gave',
    description: 'Companionship call with Margaret Chen',
    hours: 1.5,
    balanceAfter: 28.5,
    omahaProblem: 'Social Contact',
    omahaCode: '#06',
    rating: 5,
  },
  {
    id: 'tx-002',
    date: '2026-03-05',
    time: '10:00 AM',
    type: 'received',
    description: 'Grocery run from David Kowalski',
    hours: 1.0,
    balanceAfter: 30.0,
    omahaProblem: 'Digestion-Hydration',
    omahaCode: '#28',
    rating: 5,
  },
  {
    id: 'tx-003',
    date: '2026-03-03',
    time: '4:15 PM',
    type: 'donated',
    description: 'Donated 2 hours to Respite Fund',
    hours: 2.0,
    balanceAfter: 31.0,
    omahaProblem: '',
    omahaCode: '',
    rating: null,
  },
  {
    id: 'tx-004',
    date: '2026-02-28',
    time: '11:00 AM',
    type: 'gave',
    description: 'Tech support for Helen Park — tablet setup',
    hours: 2.0,
    balanceAfter: 33.0,
    omahaProblem: 'Comm. w/ Community Resources',
    omahaCode: '#05',
    rating: 5,
  },
  {
    id: 'tx-005',
    date: '2026-02-25',
    time: '9:00 AM',
    type: 'purchased',
    description: 'Purchased 5 hours ($75)',
    hours: 5.0,
    balanceAfter: 31.0,
    omahaProblem: '',
    omahaCode: '',
    rating: null,
  },
  {
    id: 'tx-006',
    date: '2026-02-22',
    time: '3:00 PM',
    type: 'gave',
    description: 'Yard work for Robert and June Tanaka',
    hours: 3.0,
    balanceAfter: 26.0,
    omahaProblem: 'Residence',
    omahaCode: '#03',
    rating: 4,
  },
  {
    id: 'tx-007',
    date: '2026-02-18',
    time: '1:30 PM',
    type: 'received',
    description: 'Ride to cardiology appointment from Lisa Ngai',
    hours: 1.5,
    balanceAfter: 29.0,
    omahaProblem: 'Comm. w/ Community Resources',
    omahaCode: '#05',
    rating: 5,
  },
  {
    id: 'tx-008',
    date: '2026-02-14',
    time: '12:00 PM',
    type: 'expired',
    description: '1.5 hours expired (earned Feb 2025) — auto-donated to Respite',
    hours: 1.5,
    balanceAfter: 30.5,
    omahaProblem: '',
    omahaCode: '',
    rating: null,
  },
  {
    id: 'tx-009',
    date: '2026-02-10',
    time: '10:30 AM',
    type: 'gave',
    description: 'Meal prep and delivery for Alice Brennan',
    hours: 2.0,
    balanceAfter: 32.0,
    omahaProblem: 'Digestion-Hydration',
    omahaCode: '#28',
    rating: 5,
  },
  {
    id: 'tx-010',
    date: '2026-02-05',
    time: '2:00 PM',
    type: 'received',
    description: 'Pet care (dog walking) from Sam Delgado',
    hours: 1.0,
    balanceAfter: 30.0,
    omahaProblem: 'Social Contact',
    omahaCode: '#06',
    rating: 4,
  },
  {
    id: 'tx-011',
    date: '2026-01-30',
    time: '11:00 AM',
    type: 'donated',
    description: 'Donated 1 hour to Respite Fund',
    hours: 1.0,
    balanceAfter: 31.0,
    omahaProblem: '',
    omahaCode: '',
    rating: null,
  },
  {
    id: 'tx-012',
    date: '2026-01-26',
    time: '9:30 AM',
    type: 'gave',
    description: 'Housekeeping support for Eleanor Voss',
    hours: 2.5,
    balanceAfter: 32.0,
    omahaProblem: 'Sanitation',
    omahaCode: '#02',
    rating: 5,
  },
];

const MONTH_SUMMARIES: MonthSummary[] = [
  { month: 'Oct', given: 6.5, received: 3.0 },
  { month: 'Nov', given: 8.0, received: 4.5 },
  { month: 'Dec', given: 5.0, received: 2.0 },
  { month: 'Jan', given: 7.5, received: 3.5 },
  { month: 'Feb', given: 9.0, received: 4.0 },
  { month: 'Mar', given: 1.5, received: 1.0 },
];

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'given', label: 'Given' },
  { key: 'received', label: 'Received' },
  { key: 'purchased', label: 'Purchased' },
  { key: 'donated', label: 'Donated' },
];

function typeMatchesFilter(type: TransactionType, filter: FilterTab): boolean {
  if (filter === 'all') return true;
  if (filter === 'given') return type === 'gave';
  if (filter === 'received') return type === 'received';
  if (filter === 'purchased') return type === 'purchased';
  if (filter === 'donated') return type === 'donated' || type === 'expired';
  return true;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function TypeIcon({ type }: { type: TransactionType }) {
  switch (type) {
    case 'gave':
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/15">
          <svg
            className="h-4 w-4 text-sage"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
      );
    case 'received':
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/15">
          <svg
            className="h-4 w-4 text-sage"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
            />
          </svg>
        </div>
      );
    case 'purchased':
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15">
          <svg
            className="h-4 w-4 text-gold"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      );
    case 'donated':
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warm-gray/15">
          <svg
            className="h-4 w-4 text-warm-gray"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      );
    case 'expired':
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warm-gray/15">
          <svg
            className="h-4 w-4 text-warm-gray"
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
        </div>
      );
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`h-3 w-3 ${i < rating ? 'text-gold' : 'text-warm-gray/30'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function hoursColor(type: TransactionType): string {
  switch (type) {
    case 'gave':
    case 'received':
      return 'text-sage';
    case 'purchased':
      return 'text-gold';
    case 'donated':
    case 'expired':
      return 'text-warm-gray';
  }
}

function hoursPrefix(type: TransactionType): string {
  switch (type) {
    case 'gave':
      return '+';
    case 'received':
      return '-';
    case 'purchased':
      return '+';
    case 'donated':
      return '-';
    case 'expired':
      return '-';
  }
}

export function TaskHistory() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filtered = MOCK_TRANSACTIONS.filter((tx) => typeMatchesFilter(tx.type, activeFilter));

  const totalGiven = MOCK_TRANSACTIONS.filter((tx) => tx.type === 'gave').reduce(
    (sum, tx) => sum + tx.hours,
    0,
  );
  const totalReceived = MOCK_TRANSACTIONS.filter((tx) => tx.type === 'received').reduce(
    (sum, tx) => sum + tx.hours,
    0,
  );
  const netChange = totalGiven - totalReceived;
  const tasksCompleted = MOCK_TRANSACTIONS.filter(
    (tx) => tx.type === 'gave' || tx.type === 'received',
  ).length;

  const maxMonthHours = Math.max(...MONTH_SUMMARIES.flatMap((m) => [m.given, m.received]));

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Task History</h1>
        <p className="text-sm text-muted">Your Time Bank transaction log</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-sage">{totalGiven}</p>
          <p className="text-[11px] text-muted">Hours Given</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-copper">{totalReceived}</p>
          <p className="text-[11px] text-muted">Hours Received</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className={`text-2xl font-bold ${netChange >= 0 ? 'text-sage' : 'text-copper'}`}>
            {netChange >= 0 ? '+' : ''}
            {netChange}
          </p>
          <p className="text-[11px] text-muted">Net Balance Change</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-primary">{tasksCompleted}</p>
          <p className="text-[11px] text-muted">Tasks Completed</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-xl border border-border bg-white p-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === tab.key ? 'bg-sage text-white' : 'text-secondary hover:bg-sage/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-primary">Transactions</h2>
        <div className="space-y-2">
          {filtered.map((tx) => (
            <div key={tx.id} className="rounded-xl border border-border bg-white p-3">
              <div className="flex items-start gap-3">
                <TypeIcon type={tx.type} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-primary">{tx.description}</p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {formatDate(tx.date)} at {tx.time}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-sm font-bold ${hoursColor(tx.type)}`}>
                        {hoursPrefix(tx.type)}
                        {tx.hours} hr{tx.hours !== 1 ? 's' : ''}
                      </p>
                      <p className="text-[10px] text-muted">Bal: {tx.balanceAfter}</p>
                    </div>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {tx.omahaProblem && (
                      <span className="rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-medium text-sage">
                        {tx.omahaCode} {tx.omahaProblem}
                      </span>
                    )}
                    {tx.rating !== null && <StarRating rating={tx.rating} />}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-xl border border-border bg-white p-6 text-center">
              <p className="text-sm text-muted">No transactions match this filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Summary Chart */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-primary">Monthly Summary</h2>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-end gap-3">
            {MONTH_SUMMARIES.map((month) => {
              const givenHeight = maxMonthHours > 0 ? (month.given / maxMonthHours) * 100 : 0;
              const receivedHeight = maxMonthHours > 0 ? (month.received / maxMonthHours) * 100 : 0;
              return (
                <div key={month.month} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-24 items-end gap-1">
                    <div
                      className="w-4 rounded-t bg-sage transition-all"
                      style={{ height: `${givenHeight}%` }}
                      title={`Given: ${month.given}h`}
                    />
                    <div
                      className="w-4 rounded-t bg-copper/60 transition-all"
                      style={{ height: `${receivedHeight}%` }}
                      title={`Received: ${month.received}h`}
                    />
                  </div>
                  <p className="text-[10px] text-muted">{month.month}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-muted">
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-sm bg-sage" />
              <span>Given</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-sm bg-copper/60" />
              <span>Received</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <button className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-xs font-medium text-secondary transition-colors hover:bg-sage/5">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export History (CSV)
        </button>
      </div>

      <p className="text-[11px] text-muted">
        Transactions reflect confirmed Time Bank activity. Purchased hours are credited at $15/hr
        ($12 coordination + $3 Respite Fund). Expired credits are auto-donated to the Respite Fund
        after 12 months.
      </p>
    </div>
  );
}
