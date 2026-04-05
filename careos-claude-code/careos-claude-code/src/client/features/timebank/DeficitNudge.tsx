/**
 * DeficitNudge — Deficit spending nudge page for Time Bank
 *
 * Shows when a member's balance goes negative (below the 40-hour Care UBI floor).
 * Graduated nudge thresholds at -5, -10, -15, -20 hours with increasingly urgent
 * messaging encouraging reciprocity. NOT punitive — warm community nudge toward
 * giving back. Options: complete a task, buy hours ($15/hr), invite a friend.
 */
import { useState } from 'react';

interface DeficitTier {
  threshold: number;
  label: string;
  message: string;
  level: 'info' | 'warning' | 'elevated' | 'critical';
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  hours: number;
  type: 'debit' | 'credit';
}

const DEFICIT_TIERS: DeficitTier[] = [
  {
    threshold: -5,
    label: 'Gentle Nudge',
    message: "You've used more than you've given -- help a neighbor this week!",
    level: 'info',
  },
  {
    threshold: -10,
    label: 'Low Balance',
    message: 'Your balance is getting low. Complete a task to rebuild your community equity.',
    level: 'warning',
  },
  {
    threshold: -15,
    label: 'Elevated Deficit',
    message: 'Consider buying hours or completing tasks. Your community needs you!',
    level: 'elevated',
  },
  {
    threshold: -20,
    label: 'Critical Deficit',
    message: 'Critical deficit. New requests paused until balance improves.',
    level: 'critical',
  },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    date: '2026-03-06',
    description: 'Received: Grocery run from Maria',
    hours: -2,
    type: 'debit',
  },
  {
    id: 't2',
    date: '2026-03-04',
    description: 'Received: Tech support from James',
    hours: -1.5,
    type: 'debit',
  },
  {
    id: 't3',
    date: '2026-03-01',
    description: 'Gave: Companionship visit to Helen',
    hours: 1,
    type: 'credit',
  },
  {
    id: 't4',
    date: '2026-02-27',
    description: 'Received: Meal prep from Sarah',
    hours: -3,
    type: 'debit',
  },
  {
    id: 't5',
    date: '2026-02-25',
    description: 'Purchased: 2 hours via cash buy',
    hours: 2,
    type: 'credit',
  },
  {
    id: 't6',
    date: '2026-02-20',
    description: 'Received: Rides to appointment from Tom',
    hours: -1.5,
    type: 'debit',
  },
  {
    id: 't7',
    date: '2026-02-18',
    description: 'Gave: Pet care for neighbor Bob',
    hours: 1,
    type: 'credit',
  },
];

const TIER_STYLES = {
  info: {
    border: 'border-sage/30',
    bg: 'bg-sage/5',
    text: 'text-sage',
    badge: 'bg-sage text-white',
    dot: 'bg-sage',
  },
  warning: {
    border: 'border-gold/30',
    bg: 'bg-gold/5',
    text: 'text-gold',
    badge: 'bg-gold text-white',
    dot: 'bg-gold',
  },
  elevated: {
    border: 'border-copper/30',
    bg: 'bg-copper/10',
    text: 'text-copper',
    badge: 'bg-copper text-white',
    dot: 'bg-copper',
  },
  critical: {
    border: 'border-zone-red/30',
    bg: 'bg-zone-red/5',
    text: 'text-zone-red',
    badge: 'bg-zone-red text-white',
    dot: 'bg-zone-red',
  },
};

function getActiveTier(balance: number): DeficitTier | null {
  const sorted = [...DEFICIT_TIERS].sort((a, b) => a.threshold - b.threshold);
  for (const tier of sorted) {
    if (balance <= tier.threshold) return tier;
  }
  return null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function DeficitNudge() {
  const [balance] = useState(-12);
  const [buyQty, setBuyQty] = useState(5);
  const floor = 40;
  const maxDeficit = -20;

  const activeTier = getActiveTier(balance);

  // Balance bar calculation: range is from maxDeficit to floor
  const totalRange = floor - maxDeficit; // 60
  const balancePosition = ((balance - maxDeficit) / totalRange) * 100;
  const zeroPosition = ((0 - maxDeficit) / totalRange) * 100;
  const floorPosition = 100;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Time Bank Balance</h1>
        <p className="text-sm text-muted">Your community reciprocity status</p>
      </div>

      {/* Current Balance Card */}
      <div
        className={`rounded-xl border-2 ${activeTier ? 'border-zone-red/30 bg-zone-red/5' : 'border-sage/30 bg-sage/5'} p-5`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${activeTier ? 'bg-zone-red/10' : 'bg-sage/10'}`}
            >
              <svg
                className={`h-6 w-6 ${activeTier ? 'text-zone-red' : 'text-sage'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-secondary">Current Balance</p>
              <p className={`text-3xl font-bold ${balance < 0 ? 'text-zone-red' : 'text-sage'}`}>
                {balance}h
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Care UBI Floor</p>
            <p className="text-lg font-semibold text-primary">{floor}h/yr</p>
          </div>
        </div>

        {/* Balance Bar */}
        <div className="mt-4">
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-warm-gray/30">
            {/* Deficit zone (red, from maxDeficit to 0) */}
            <div
              className="absolute left-0 top-0 h-full bg-zone-red/20"
              style={{ width: `${zeroPosition}%` }}
            />
            {/* Positive zone (sage, from 0 to floor) */}
            <div
              className="absolute top-0 h-full bg-sage/20"
              style={{ left: `${zeroPosition}%`, width: `${floorPosition - zeroPosition}%` }}
            />
            {/* Current balance marker */}
            <div
              className={`absolute top-0 h-full rounded-full transition-all ${balance < 0 ? 'bg-zone-red' : 'bg-sage'}`}
              style={{
                left: `${Math.min(balancePosition, zeroPosition)}%`,
                width: `${Math.abs(balancePosition - zeroPosition)}%`,
              }}
            />
            {/* Zero line */}
            <div
              className="absolute top-0 h-full w-0.5 bg-primary/40"
              style={{ left: `${zeroPosition}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted">
            <span>{maxDeficit}h</span>
            <span
              style={{ position: 'absolute', left: `calc(${zeroPosition}% - 4px)` }}
              className="relative"
            >
              0h
            </span>
            <span>{floor}h</span>
          </div>
        </div>
      </div>

      {/* Active Alert Banner */}
      {activeTier && (
        <div
          className={`rounded-xl border-2 ${TIER_STYLES[activeTier.level].border} ${TIER_STYLES[activeTier.level].bg} p-4`}
        >
          <div className="flex items-center gap-3">
            <svg
              className={`h-6 w-6 shrink-0 ${TIER_STYLES[activeTier.level].text}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <div>
              <p className={`text-sm font-semibold ${TIER_STYLES[activeTier.level].text}`}>
                {activeTier.label}
              </p>
              <p className="text-xs text-secondary">{activeTier.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Deficit Tier Cards */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-primary">Deficit Thresholds</h2>
        <div className="space-y-2">
          {DEFICIT_TIERS.map((tier) => {
            const styles = TIER_STYLES[tier.level];
            const isActive = balance <= tier.threshold;
            return (
              <div
                key={tier.threshold}
                className={`rounded-xl border ${isActive ? styles.border : 'border-border'} ${isActive ? styles.bg : 'bg-white'} p-3`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 h-3 w-3 shrink-0 rounded-full ${isActive ? styles.dot : 'bg-warm-gray/40'}`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm font-semibold ${isActive ? styles.text : 'text-muted'}`}
                      >
                        {tier.threshold}h — {tier.label}
                      </h3>
                      {isActive && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${styles.badge}`}
                        >
                          Active
                        </span>
                      )}
                    </div>
                    <p className={`mt-0.5 text-xs ${isActive ? 'text-secondary' : 'text-muted'}`}>
                      {tier.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Restore Your Balance */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-primary">Restore Your Balance</h2>
        <div className="space-y-3">
          {/* Option 1: Complete a Task */}
          <div className="rounded-xl border border-sage/30 bg-sage/5 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/10">
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
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-primary">Complete a Task</h3>
                <p className="mt-0.5 text-xs text-secondary">
                  Help a neighbor and earn hours back. Meals, companionship, rides, tech support,
                  and more.
                </p>
                <a
                  href="#/timebank"
                  className="mt-3 inline-block rounded-lg bg-sage px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-sage-dark"
                >
                  Browse Available Tasks
                </a>
              </div>
            </div>
          </div>

          {/* Option 2: Buy Hours */}
          <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
                <svg
                  className="h-5 w-5 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-primary">Buy Hours</h3>
                <p className="mt-0.5 text-xs text-secondary">
                  Purchase Time Bank hours at $15/hr ($12 coordination + $3 Respite Fund donation).
                </p>
                <div className="mt-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={20}
                      value={buyQty}
                      onChange={(e) => setBuyQty(Number(e.target.value))}
                      className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-warm-gray/30 accent-gold"
                    />
                    <span className="w-12 text-right text-sm font-semibold text-primary">
                      {buyQty}h
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[11px] text-muted">1h</span>
                    <span className="text-xs font-medium text-gold">${buyQty * 15}.00 total</span>
                    <span className="text-[11px] text-muted">20h</span>
                  </div>
                  <div className="mt-1 text-[10px] text-muted">
                    ${buyQty * 12} coordination + ${buyQty * 3} Respite Fund
                  </div>
                </div>
                <button className="mt-3 rounded-lg bg-gold px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-gold/90">
                  Purchase {buyQty} Hours — ${buyQty * 15}
                </button>
              </div>
            </div>
          </div>

          {/* Option 3: Invite a Friend */}
          <div className="rounded-xl border border-copper/30 bg-copper/10 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-copper/10">
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
                    d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-primary">Invite a Friend</h3>
                <p className="mt-0.5 text-xs text-secondary">
                  When a friend joins and completes their first task, you both earn 5 bonus hours.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <code className="rounded bg-white px-3 py-1.5 text-xs font-mono font-semibold text-copper">
                    CARE-JM2K8
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText('CARE-JM2K8')}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:bg-warm-gray/20"
                  >
                    Copy Code
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-muted">
                  +5 bonus hours for you and your friend upon their first completed task
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-zone-red">{balance}h</p>
          <p className="text-[11px] text-muted">Current Deficit</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-gold">{Math.abs(balance)}h</p>
          <p className="text-[11px] text-muted">To Reach Zero</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-sage">{floor + balance}h</p>
          <p className="text-[11px] text-muted">To Full Floor</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h3 className="text-sm font-semibold text-primary">Recent Activity</h3>
        <div className="mt-3 divide-y divide-border">
          {MOCK_TRANSACTIONS.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${tx.type === 'credit' ? 'bg-sage/10' : 'bg-zone-red/10'}`}
                >
                  <svg
                    className={`h-3.5 w-3.5 ${tx.type === 'credit' ? 'text-sage' : 'text-zone-red'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={
                        tx.type === 'credit'
                          ? 'M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75'
                          : 'M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75'
                      }
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-primary">{tx.description}</p>
                  <p className="text-[10px] text-muted">{formatDate(tx.date)}</p>
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${tx.type === 'credit' ? 'text-sage' : 'text-zone-red'}`}
              >
                {tx.type === 'credit' ? '+' : ''}
                {tx.hours}h
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Deficit Policy */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h3 className="text-sm font-semibold text-primary">Deficit Policy</h3>
        <div className="mt-2 space-y-1.5 text-xs text-secondary">
          <p>* Every member starts with 40 hours (Care UBI floor) included in annual membership</p>
          <p>
            * You can go into deficit by receiving more help than you give -- this is normal and
            expected
          </p>
          <p>* Graduated nudges encourage reciprocity at -5, -10, -15, and -20 hours</p>
          <p>* At -20 hours, new requests are paused until balance improves</p>
          <p>* Deficit is NOT punitive -- it is a gentle nudge toward community reciprocity</p>
        </div>
      </div>

      <p className="text-[11px] text-muted">
        Time Bank hours can be earned by helping neighbors, purchased at $15/hr, or earned through
        referrals. The Respite Fund receives $3 from every hour purchased.
      </p>
    </div>
  );
}
