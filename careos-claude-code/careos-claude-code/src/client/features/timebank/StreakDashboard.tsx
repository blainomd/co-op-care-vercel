/**
 * StreakDashboard — Weekly helping streak tracker with milestone celebrations
 *
 * Gamified retention: "You've helped someone 4 weeks in a row!"
 * Unlock progression at 4/8/12/26/52-week milestones with community recognition.
 */

interface WeekRecord {
  weekStart: string;
  hoursGiven: number;
  tasksCompleted: number;
  active: boolean;
}

interface Milestone {
  weeks: number;
  label: string;
  reward: string;
  unlocked: boolean;
}

const CURRENT_STREAK = 12;
const LONGEST_STREAK = 12;
const TOTAL_WEEKS_ACTIVE = 18;

const MOCK_WEEKS: WeekRecord[] = Array.from({ length: 16 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (15 - i) * 7);
  const weekStart = d.toISOString().split('T')[0]!;
  const active = i >= 4; // last 12 weeks active
  return {
    weekStart,
    hoursGiven: active ? Math.floor(Math.random() * 4) + 1 : 0,
    tasksCompleted: active ? Math.floor(Math.random() * 3) + 1 : 0,
    active,
  };
});

const MILESTONES: Milestone[] = [
  { weeks: 4, label: 'Helping Hand', reward: '+2 bonus Time Bank hours', unlocked: true },
  { weeks: 8, label: 'Steady Heart', reward: '+3 bonus hours + community badge', unlocked: true },
  {
    weeks: 12,
    label: 'Care Champion',
    reward: '+5 bonus hours + featured profile',
    unlocked: true,
  },
  {
    weeks: 26,
    label: 'Half-Year Hero',
    reward: '+10 bonus hours + Comfort Card bonus',
    unlocked: false,
  },
  {
    weeks: 52,
    label: 'Annual Guardian',
    reward: '+20 bonus hours + co-op equity bonus',
    unlocked: false,
  },
];

export function StreakDashboard() {
  const nextMilestone = MILESTONES.find((m) => !m.unlocked);
  const weeksToNext = nextMilestone ? nextMilestone.weeks - CURRENT_STREAK : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Your Streak</h1>
        <p className="text-sm text-muted">Keep helping to unlock milestones</p>
      </div>

      {/* Current Streak Hero */}
      <div className="rounded-xl border-2 border-sage bg-sage/5 p-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <svg className="h-8 w-8 text-gold" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2c.5 0 1 .19 1.41.59l3 3A2 2 0 0118 7.5V11l1.6 1.2a1 1 0 01.2 1.4l-4.8 6.4a1 1 0 01-.8.4H9.8a1 1 0 01-.8-.4l-4.8-6.4a1 1 0 01.2-1.4L6 11V7.5a2 2 0 011.59-1.91l3-3A2 2 0 0112 2z" />
          </svg>
          <span className="text-5xl font-bold text-sage">{CURRENT_STREAK}</span>
        </div>
        <p className="mt-1 text-lg font-semibold text-primary">Week Streak!</p>
        <p className="mt-1 text-sm text-secondary">
          You've helped someone every week for {CURRENT_STREAK} weeks straight
        </p>
        {nextMilestone && (
          <p className="mt-2 text-xs text-sage">
            {weeksToNext} more weeks to "{nextMilestone.label}" milestone
          </p>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-primary">{CURRENT_STREAK}</p>
          <p className="text-[11px] text-muted">Current Streak</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-gold">{LONGEST_STREAK}</p>
          <p className="text-[11px] text-muted">Longest Streak</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-sage">{TOTAL_WEEKS_ACTIVE}</p>
          <p className="text-[11px] text-muted">Total Weeks Active</p>
        </div>
      </div>

      {/* Week Grid */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-primary">Activity History</h2>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="grid grid-cols-8 gap-2">
            {MOCK_WEEKS.map((week, i) => {
              const intensity = !week.active ? 0 : Math.min(week.hoursGiven, 4);
              const bg =
                intensity === 0
                  ? 'bg-warm-gray/20'
                  : intensity === 1
                    ? 'bg-sage/30'
                    : intensity === 2
                      ? 'bg-sage/50'
                      : intensity === 3
                        ? 'bg-sage/70'
                        : 'bg-sage';
              const d = new Date(week.weekStart);
              const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              return (
                <div key={i} className="text-center">
                  <div
                    className={`mx-auto h-8 w-8 rounded-lg ${bg} transition-colors`}
                    title={`Week of ${label}: ${week.hoursGiven}h, ${week.tasksCompleted} tasks`}
                  />
                  <p className="mt-1 text-[9px] text-muted">{label}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-muted">
            <span>Less</span>
            <div className="h-3 w-3 rounded bg-warm-gray/20" />
            <div className="h-3 w-3 rounded bg-sage/30" />
            <div className="h-3 w-3 rounded bg-sage/50" />
            <div className="h-3 w-3 rounded bg-sage/70" />
            <div className="h-3 w-3 rounded bg-sage" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-primary">Milestones</h2>
        <div className="space-y-2">
          {MILESTONES.map((milestone) => {
            const progress = Math.min(100, (CURRENT_STREAK / milestone.weeks) * 100);
            return (
              <div
                key={milestone.weeks}
                className={`rounded-xl border p-3 ${
                  milestone.unlocked ? 'border-sage/30 bg-sage/5' : 'border-border bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      milestone.unlocked ? 'bg-sage text-white' : 'bg-warm-gray/20 text-muted'
                    }`}
                  >
                    {milestone.unlocked ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      `${milestone.weeks}w`
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-semibold ${milestone.unlocked ? 'text-sage' : 'text-primary'}`}
                      >
                        {milestone.label}
                      </p>
                      <span className="text-[10px] text-muted">{milestone.weeks} weeks</span>
                    </div>
                    <p className="text-[11px] text-secondary">{milestone.reward}</p>
                    {!milestone.unlocked && (
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-warm-gray/20">
                        <div
                          className="h-full rounded-full bg-sage/40"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Recognition */}
      <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
        <h3 className="text-sm font-semibold text-primary">Community Recognition</h3>
        <p className="mt-1 text-xs text-secondary">
          Your 12-week streak has earned you "Care Champion" status. Your profile is featured in the
          community directory, and you've earned 10 bonus Time Bank hours total from milestones.
        </p>
        <div className="mt-2 flex gap-2">
          <span className="rounded-full bg-sage px-2 py-0.5 text-[10px] font-medium text-white">
            Care Champion
          </span>
          <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-medium text-gold">
            Featured Profile
          </span>
          <span className="rounded-full bg-copper/10 px-2 py-0.5 text-[10px] font-medium text-copper">
            +10h Earned
          </span>
        </div>
      </div>

      <p className="text-[11px] text-muted">
        A week counts if you complete at least one Time Bank task. Streaks reset after 7 days of
        inactivity.
      </p>
    </div>
  );
}
