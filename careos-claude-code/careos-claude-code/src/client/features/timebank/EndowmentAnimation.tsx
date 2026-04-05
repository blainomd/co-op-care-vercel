/**
 * EndowmentAnimation — 40-hour "Care UBI" balance visualization
 *
 * The endowment effect: "The moment membership confirms, the Time Bank balance
 * animates from 0 to 40 hours." Wealth framing, not allowance framing.
 * "You HAVE 40 hours of community care" — not "you CAN REQUEST up to 40 hours."
 *
 * Metrics tracked: first-spend latency, hoarding rate.
 * The 40-hour floor reduces caregiver anxiety structurally.
 */

import { useState } from 'react';

interface BalanceBreakdown {
  base: number;
  earned: number;
  spent: number;
  donated: number;
  bought: number;
}

interface UsageSuggestion {
  label: string;
  description: string;
  icon: React.ReactNode;
}

const MOCK_BREAKDOWN: BalanceBreakdown = {
  base: 40,
  earned: 8,
  spent: 6,
  donated: 2,
  bought: 3,
};

const MOCK_STATS = {
  hoursAvailable: 43,
  hoursUsedThisMonth: 4,
  daysSinceLastUse: 3,
};

const ANIMATION_DURATION_MS = 2000;
const TARGET_HOURS = 40;
const FRAME_INTERVAL_MS = 20;

const USAGE_SUGGESTIONS: UsageSuggestion[] = [
  {
    label: 'Companionship Calls',
    description: 'Weekly phone check-ins with a caring neighbor',
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
        />
      </svg>
    ),
  },
  {
    label: 'Rides',
    description: 'Doctor visits, errands, or social outings',
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75M2.25 14.25h1.5m14.25 0v-2.625c0-.621-.504-1.125-1.125-1.125H6.75a1.125 1.125 0 00-1.125 1.125v2.625m12.75 0h-1.5"
        />
      </svg>
    ),
  },
  {
    label: 'Meal Prep',
    description: 'Home-cooked meals delivered by a co-op member',
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265z"
        />
      </svg>
    ),
  },
  {
    label: 'Yard Work',
    description: 'Seasonal help with garden, snow, or maintenance',
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
      </svg>
    ),
  },
  {
    label: 'Errands',
    description: 'Pharmacy pickups, mail, or shopping assistance',
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    ),
  },
];

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function EndowmentAnimation() {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const total =
    MOCK_BREAKDOWN.base +
    MOCK_BREAKDOWN.earned -
    MOCK_BREAKDOWN.spent -
    MOCK_BREAKDOWN.donated +
    MOCK_BREAKDOWN.bought;

  function startAnimation() {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnimatedValue(0);

    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
      const eased = easeOutCubic(progress);
      const current = Math.round(eased * TARGET_HOURS);

      setAnimatedValue(current);

      if (progress >= 1) {
        clearInterval(interval);
        setIsAnimating(false);
        setHasAnimated(true);
      }
    }, FRAME_INTERVAL_MS);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Your Care Balance</h1>
        <p className="text-sm text-muted">Your 40-hour care floor — yours the moment you join</p>
      </div>

      {/* Animated Counter Hero */}
      <div className="rounded-xl border-2 border-sage bg-sage/5 p-8 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-sage">Time Bank Balance</p>
        <div className="mt-3 flex items-baseline justify-center gap-1">
          <span
            className="text-7xl font-bold tabular-nums text-sage"
            style={{
              transition: isAnimating ? 'none' : 'color 0.3s',
            }}
          >
            {hasAnimated || isAnimating ? animatedValue : TARGET_HOURS}
          </span>
          <span className="text-2xl font-medium text-sage/70">hours</span>
        </div>
        <p className="mt-2 text-sm text-secondary">
          {isAnimating ? 'Activating your care floor...' : 'of community care available to you'}
        </p>

        <button
          onClick={startAnimation}
          disabled={isAnimating}
          className={`mt-4 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
            isAnimating
              ? 'cursor-not-allowed bg-sage/30 text-sage/50'
              : 'bg-sage text-white hover:bg-sage/90 active:scale-95'
          }`}
        >
          {isAnimating ? 'Activating...' : hasAnimated ? 'Replay Animation' : 'Start Animation'}
        </button>

        {/* Animated progress bar */}
        <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-sage/10">
          <div
            className="h-full rounded-full bg-sage transition-none"
            style={{
              width: `${((hasAnimated || isAnimating ? animatedValue : TARGET_HOURS) / TARGET_HOURS) * 100}%`,
              transition: isAnimating ? 'none' : 'width 0.3s',
            }}
          />
        </div>
      </div>

      {/* Your Care Floor Card */}
      <div className="rounded-xl border border-gold/30 bg-gold/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/20">
            <svg className="h-5 w-5 text-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-primary">Your Care Floor</h2>
            <p className="mt-1 text-sm leading-relaxed text-secondary">
              You <span className="font-semibold text-primary">HAVE</span> 40 hours of community
              care. This is yours — use it, share it, grow it.
            </p>
            <p className="mt-2 text-[11px] text-muted">
              Included with your $100/year co-op membership. Renewed annually.
            </p>
          </div>
        </div>
      </div>

      {/* Balance Breakdown */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-primary">Balance Breakdown</h2>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-sage" />
                <span className="text-sm text-secondary">Base hours</span>
              </div>
              <span className="text-sm font-semibold tabular-nums text-primary">
                {MOCK_BREAKDOWN.base}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gold" />
                <span className="text-sm text-secondary">Earned hours</span>
              </div>
              <span className="text-sm font-semibold tabular-nums text-sage">
                +{MOCK_BREAKDOWN.earned}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-copper" />
                <span className="text-sm text-secondary">Spent hours</span>
              </div>
              <span className="text-sm font-semibold tabular-nums text-copper">
                -{MOCK_BREAKDOWN.spent}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-warm-gray" />
                <span className="text-sm text-secondary">Donated hours</span>
              </div>
              <span className="text-sm font-semibold tabular-nums text-muted">
                -{MOCK_BREAKDOWN.donated}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-sage/50" />
                <span className="text-sm text-secondary">Bought hours</span>
              </div>
              <span className="text-sm font-semibold tabular-nums text-sage">
                +{MOCK_BREAKDOWN.bought}
              </span>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">Total available</span>
                <span className="text-lg font-bold tabular-nums text-sage">{total} hrs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-sage">{MOCK_STATS.hoursAvailable}</p>
          <p className="text-[11px] text-muted">Hours Available</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-gold">{MOCK_STATS.hoursUsedThisMonth}</p>
          <p className="text-[11px] text-muted">Used This Month</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-copper">{MOCK_STATS.daysSinceLastUse}</p>
          <p className="text-[11px] text-muted">Days Since Last Use</p>
        </div>
      </div>

      {/* Usage Suggestions */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-primary">Ways to Use Your Hours</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {USAGE_SUGGESTIONS.map((suggestion) => (
            <div
              key={suggestion.label}
              className="flex items-start gap-3 rounded-xl border border-border bg-white p-3 transition-colors hover:border-sage/30 hover:bg-sage/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sage/10 text-sage">
                {suggestion.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary">{suggestion.label}</p>
                <p className="text-[11px] leading-snug text-muted">{suggestion.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anxiety Reduction Note */}
      <div className="rounded-xl border border-sage/20 bg-sage/5 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-sage"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-primary">Your safety net, always there</h3>
            <p className="mt-1 text-xs leading-relaxed text-secondary">
              The 40-hour floor is not a budget to manage — it is a foundation to build on. Use
              hours freely knowing they renew each year with your membership. Earn more by helping
              others. Buy more at $15/hr anytime.
            </p>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted">
        Balance reflects base membership hours, earned hours from helping, spent hours, Respite Fund
        donations, and purchased hours ($15/hr).
      </p>
    </div>
  );
}
