/**
 * ImpactScore — Cascade visualization for Time Bank impact
 *
 * Shows the ripple effect: your hours → families helped → community impact.
 * Streak tracking with milestone badges.
 */
import { useMemo } from 'react';
import { TIME_BANK } from '@shared/constants/business-rules';

// Demo data
const DEMO_IMPACT = {
  hoursGiven: 42,
  hoursReceived: 18,
  familiesHelped: 8,
  tasksCompleted: 23,
  currentStreak: 6, // weeks
  longestStreak: 6,
  communityHoursTotal: 1247,
  communityFamilies: 89,
};

const MILESTONE_LABELS: Record<number, string> = {
  4: 'Neighbor',
  8: 'Connector',
  12: 'Pillar',
  26: 'Champion',
  52: 'Community Hero',
};

function getMilestoneProgress(currentWeeks: number): {
  current: number;
  next: number;
  label: string;
  progress: number;
} {
  const milestones = TIME_BANK.STREAK_MILESTONES_WEEKS;
  for (const milestone of milestones) {
    if (currentWeeks < milestone) {
      const prev = milestones[milestones.indexOf(milestone) - 1] ?? 0;
      return {
        current: currentWeeks,
        next: milestone,
        label: MILESTONE_LABELS[milestone] ?? '',
        progress: ((currentWeeks - prev) / (milestone - prev)) * 100,
      };
    }
  }
  return { current: currentWeeks, next: 52, label: 'Community Hero', progress: 100 };
}

export function ImpactScore() {
  const milestone = useMemo(() => getMilestoneProgress(DEMO_IMPACT.currentStreak), []);

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">Your Impact</h1>
        <p className="mt-1 text-sm text-text-secondary">Every hour creates a ripple effect</p>
      </div>

      {/* ── Cascade visualization ── */}
      <div className="mb-6 rounded-2xl border border-border bg-white p-6">
        <h2 className="mb-4 text-center text-sm font-medium text-text-muted uppercase tracking-wider">
          Your Cascade Effect
        </h2>

        {/* Ripple circles */}
        <div className="relative flex flex-col items-center py-4">
          {/* You (center) */}
          <div className="relative z-30 flex h-20 w-20 items-center justify-center rounded-full bg-sage text-white shadow-lg">
            <div className="text-center">
              <span className="block text-xl font-bold">{DEMO_IMPACT.hoursGiven}</span>
              <span className="block text-[9px] uppercase tracking-wider opacity-80">hours</span>
            </div>
          </div>

          {/* Connecting line */}
          <div className="h-6 w-px bg-border" />

          {/* Families (second ring) */}
          <div className="relative z-20 flex h-28 w-28 items-center justify-center rounded-full bg-copper/10 ring-2 ring-copper/20">
            <div className="text-center">
              <span className="block text-2xl font-bold text-copper">
                {DEMO_IMPACT.familiesHelped}
              </span>
              <span className="block text-[9px] font-medium uppercase tracking-wider text-copper/70">
                families
              </span>
            </div>
          </div>

          {/* Connecting line */}
          <div className="h-6 w-px bg-border" />

          {/* Community (outer ring) */}
          <div className="relative z-10 flex h-36 w-36 items-center justify-center rounded-full bg-gold/10 ring-2 ring-gold/20">
            <div className="text-center">
              <span className="block text-2xl font-bold text-gold">
                {DEMO_IMPACT.communityHoursTotal}
              </span>
              <span className="block text-[9px] font-medium uppercase tracking-wider text-gold/70">
                community hrs
              </span>
              <span className="block mt-0.5 text-[10px] text-text-muted">
                {DEMO_IMPACT.communityFamilies} families
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-white p-4 text-center">
          <span className="text-2xl font-bold text-sage">{DEMO_IMPACT.hoursGiven}</span>
          <p className="mt-0.5 text-xs text-text-muted">Hours Given</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 text-center">
          <span className="text-2xl font-bold text-copper">{DEMO_IMPACT.hoursReceived}</span>
          <p className="mt-0.5 text-xs text-text-muted">Hours Received</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 text-center">
          <span className="text-2xl font-bold text-text-primary">{DEMO_IMPACT.tasksCompleted}</span>
          <p className="mt-0.5 text-xs text-text-muted">Tasks Completed</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 text-center">
          <span className="text-2xl font-bold text-gold">{DEMO_IMPACT.familiesHelped}</span>
          <p className="mt-0.5 text-xs text-text-muted">Families Helped</p>
        </div>
      </div>

      {/* ── Streak & Milestones ── */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-text-primary">Weekly Streak</h2>
            <p className="mt-0.5 text-xs text-text-muted">
              {DEMO_IMPACT.currentStreak} weeks and counting
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="h-5 w-5 text-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span className="text-sm font-bold text-gold">{DEMO_IMPACT.currentStreak}w</span>
          </div>
        </div>

        {/* Progress to next milestone */}
        <div className="mt-4">
          <div className="flex justify-between text-xs">
            <span className="text-text-muted">Week {milestone.current}</span>
            <span className="font-medium text-text-primary">
              Next: {milestone.label} (Week {milestone.next})
            </span>
          </div>
          <div className="mt-1.5 h-2.5 rounded-full bg-warm-gray">
            <div
              className="h-full rounded-full bg-gold transition-all duration-500"
              style={{ width: `${Math.min(milestone.progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Earned badges */}
        <div className="mt-5">
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">
            Earned Badges
          </h3>
          <div className="mt-2 flex gap-3">
            {TIME_BANK.STREAK_MILESTONES_WEEKS.map((m) => {
              const earned = DEMO_IMPACT.currentStreak >= m;
              return (
                <div
                  key={m}
                  className={`flex flex-col items-center gap-1 ${earned ? '' : 'opacity-30'}`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      earned ? 'bg-gold/20 text-gold' : 'bg-warm-gray text-text-muted'
                    }`}
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <span className="text-[9px] font-medium text-text-muted">
                    {MILESTONE_LABELS[m]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
