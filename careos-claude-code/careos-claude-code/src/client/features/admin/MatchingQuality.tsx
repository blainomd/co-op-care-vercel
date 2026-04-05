/**
 * MatchingQuality — Proximity-weighted matching quality dashboard
 *
 * Displays Time Bank matching health metrics: average match distance,
 * completion rates by distance bracket, repeat-pair rates, and match
 * latency against the <4 hour SLA. Proximity is the top-weighted
 * factor in the matching algorithm.
 *
 * Distance brackets:
 *   <0.5 mi  = 3x score boost
 *   0.5-1 mi = 2x score boost
 *   1-2 mi   = 1x (baseline)
 *   >2 mi    = remote tasks only
 */

interface DistanceBracket {
  label: string;
  range: string;
  multiplier: string;
  matchCount: number;
  completionRate: number;
  avgRating: number;
  color: string;
  barColor: string;
}

interface RecentMatch {
  id: string;
  helperName: string;
  helperInitials: string;
  familyName: string;
  distance: number;
  proximityScore: number;
  matchTimeMinutes: number;
  taskType: string;
  outcome: 'completed' | 'in_progress' | 'cancelled' | 'no_show';
  isRepeatPair: boolean;
  matchedAt: string;
}

const DISTANCE_BRACKETS: DistanceBracket[] = [
  {
    label: 'Ultra-Close',
    range: '<0.5 mi',
    multiplier: '3x',
    matchCount: 42,
    completionRate: 97,
    avgRating: 4.9,
    color: 'text-sage',
    barColor: 'bg-sage',
  },
  {
    label: 'Nearby',
    range: '0.5-1.0 mi',
    multiplier: '2x',
    matchCount: 31,
    completionRate: 93,
    avgRating: 4.7,
    color: 'text-sage',
    barColor: 'bg-sage/70',
  },
  {
    label: 'Neighborhood',
    range: '1.0-2.0 mi',
    multiplier: '1x',
    matchCount: 18,
    completionRate: 86,
    avgRating: 4.5,
    color: 'text-gold',
    barColor: 'bg-gold',
  },
  {
    label: 'Remote Only',
    range: '>2.0 mi',
    multiplier: '0x',
    matchCount: 7,
    completionRate: 71,
    avgRating: 4.1,
    color: 'text-zone-red',
    barColor: 'bg-zone-red/70',
  },
];

const RECENT_MATCHES: RecentMatch[] = [
  {
    id: 'rm1',
    helperName: 'James Park',
    helperInitials: 'JP',
    familyName: 'Martinez',
    distance: 0.28,
    proximityScore: 94,
    matchTimeMinutes: 42,
    taskType: 'Companionship',
    outcome: 'completed',
    isRepeatPair: true,
    matchedAt: '2026-03-08T09:15:00Z',
  },
  {
    id: 'rm2',
    helperName: 'Linda Chen',
    helperInitials: 'LC',
    familyName: 'Thompson',
    distance: 0.65,
    proximityScore: 82,
    matchTimeMinutes: 78,
    taskType: 'Meal Prep',
    outcome: 'completed',
    isRepeatPair: true,
    matchedAt: '2026-03-08T08:30:00Z',
  },
  {
    id: 'rm3',
    helperName: 'Roberto Mendez',
    helperInitials: 'RM',
    familyName: 'Williams',
    distance: 0.41,
    proximityScore: 91,
    matchTimeMinutes: 22,
    taskType: 'Grocery Run',
    outcome: 'in_progress',
    isRepeatPair: false,
    matchedAt: '2026-03-08T10:05:00Z',
  },
  {
    id: 'rm4',
    helperName: 'Sarah Miller',
    helperInitials: 'SM',
    familyName: 'Garcia',
    distance: 1.7,
    proximityScore: 58,
    matchTimeMinutes: 195,
    taskType: 'Tech Support',
    outcome: 'completed',
    isRepeatPair: false,
    matchedAt: '2026-03-07T16:20:00Z',
  },
  {
    id: 'rm5',
    helperName: 'Tom K.',
    helperInitials: 'TK',
    familyName: 'Johnson',
    distance: 1.2,
    proximityScore: 66,
    matchTimeMinutes: 140,
    taskType: 'Yard Work',
    outcome: 'cancelled',
    isRepeatPair: false,
    matchedAt: '2026-03-07T14:45:00Z',
  },
  {
    id: 'rm6',
    helperName: 'Maria Garcia',
    helperInitials: 'MG',
    familyName: 'Park',
    distance: 0.35,
    proximityScore: 89,
    matchTimeMinutes: 55,
    taskType: 'Companionship',
    outcome: 'completed',
    isRepeatPair: true,
    matchedAt: '2026-03-07T11:10:00Z',
  },
  {
    id: 'rm7',
    helperName: 'Emily Rodriguez',
    helperInitials: 'ER',
    familyName: 'Chen',
    distance: 2.4,
    proximityScore: 34,
    matchTimeMinutes: 310,
    taskType: 'Phone Companionship',
    outcome: 'no_show',
    isRepeatPair: false,
    matchedAt: '2026-03-06T09:00:00Z',
  },
];

const OUTCOME_CONFIG: Record<string, { label: string; dotClass: string; textClass: string }> = {
  completed: { label: 'Completed', dotClass: 'bg-sage', textClass: 'text-sage' },
  in_progress: { label: 'In Progress', dotClass: 'bg-gold', textClass: 'text-gold' },
  cancelled: { label: 'Cancelled', dotClass: 'bg-warm-gray', textClass: 'text-muted' },
  no_show: { label: 'No Show', dotClass: 'bg-zone-red', textClass: 'text-zone-red' },
};

// Derived metrics
const totalMatches = DISTANCE_BRACKETS.reduce((sum, b) => sum + b.matchCount, 0);
const maxBracketCount = Math.max(...DISTANCE_BRACKETS.map((b) => b.matchCount));
const avgDistance = 0.74;
const avgMatchTimeMinutes = 87;
const overallCompletionRate = 91;
const repeatPairRate = 38;

function formatMatchTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function MatchingQuality() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Matching Quality</h1>
        <p className="text-sm text-muted">
          Proximity-weighted matching performance — Time Bank algorithm health
        </p>
      </div>

      {/* Top-Level Metrics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-primary">{avgDistance} mi</p>
          <p className="text-[11px] text-muted">Avg Match Distance</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p
            className={`text-2xl font-bold ${avgMatchTimeMinutes <= 240 ? 'text-sage' : 'text-zone-red'}`}
          >
            {formatMatchTime(avgMatchTimeMinutes)}
          </p>
          <div className="flex items-center justify-center gap-1">
            <p className="text-[11px] text-muted">Avg Match Time</p>
            {avgMatchTimeMinutes <= 240 && <span className="text-[10px] text-sage">(SLA met)</span>}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-sage">{overallCompletionRate}%</p>
          <p className="text-[11px] text-muted">Completion Rate</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-copper">{repeatPairRate}%</p>
          <p className="text-[11px] text-muted">Repeat-Pair Rate</p>
        </div>
      </div>

      {/* SLA Status */}
      <div
        className={`flex items-center gap-2 rounded-xl border p-3 ${
          avgMatchTimeMinutes <= 240
            ? 'border-sage/30 bg-sage/5'
            : 'border-zone-red/30 bg-zone-red/5'
        }`}
      >
        {avgMatchTimeMinutes <= 240 ? (
          <svg
            className="h-5 w-5 text-sage"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5 text-zone-red"
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
        )}
        <div>
          <p
            className={`text-sm font-semibold ${avgMatchTimeMinutes <= 240 ? 'text-sage' : 'text-zone-red'}`}
          >
            Match Latency SLA: {avgMatchTimeMinutes <= 240 ? 'Within Target' : 'Exceeding Target'}
          </p>
          <p className="text-[11px] text-muted">
            Target: &lt;4 hours from request to match. Current avg:{' '}
            {formatMatchTime(avgMatchTimeMinutes)}.
          </p>
        </div>
      </div>

      {/* Proximity Distribution */}
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <svg
            className="h-4 w-4 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
          </svg>
          <h2 className="text-sm font-semibold text-primary">Proximity Distribution</h2>
          <span className="text-[11px] text-muted">({totalMatches} matches, last 30 days)</span>
        </div>

        <div className="space-y-3">
          {DISTANCE_BRACKETS.map((bracket) => {
            const widthPercent = Math.max((bracket.matchCount / maxBracketCount) * 100, 4);
            return (
              <div key={bracket.range}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary">{bracket.range}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${bracket.color} ${bracket.barColor}/10`}
                    >
                      {bracket.multiplier} boost
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted">
                    <span>{bracket.matchCount} matches</span>
                    <span
                      className={
                        bracket.completionRate >= 90
                          ? 'text-sage'
                          : bracket.completionRate >= 80
                            ? 'text-gold'
                            : 'text-zone-red'
                      }
                    >
                      {bracket.completionRate}% complete
                    </span>
                    <span className="text-gold">
                      {'★'.repeat(Math.round(bracket.avgRating))} {bracket.avgRating}
                    </span>
                  </div>
                </div>
                <div className="h-5 w-full rounded-full bg-warm-gray/10">
                  <div
                    className={`flex h-5 items-center rounded-full ${bracket.barColor} px-2 text-[10px] font-medium text-white transition-all`}
                    style={{ width: `${widthPercent}%` }}
                  >
                    {bracket.matchCount}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-1 text-[11px] text-muted">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
            />
          </svg>
          <span>
            {Math.round(
              ((DISTANCE_BRACKETS[0]!.matchCount + DISTANCE_BRACKETS[1]!.matchCount) /
                totalMatches) *
                100,
            )}
            % of matches are within 1 mile — strong neighborhood density signal.
          </span>
        </div>
      </div>

      {/* Proximity Score Formula */}
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <svg
            className="h-4 w-4 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z"
            />
          </svg>
          <h2 className="text-sm font-semibold text-primary">Proximity Score Formula</h2>
        </div>

        <div className="rounded-lg bg-warm-gray/5 p-3">
          <p className="mb-2 font-mono text-xs text-secondary">
            match_score = base_score × proximity_weight × identity_bonus
          </p>
          <div className="space-y-1.5 text-[11px] text-muted">
            <p>
              <span className="font-semibold text-primary">base_score</span> = skill_match +
              availability + rating + streak_bonus
            </p>
            <p>
              <span className="font-semibold text-primary">proximity_weight</span> = distance
              multiplier from bracket table below
            </p>
            <p>
              <span className="font-semibold text-primary">identity_bonus</span> = 2x if
              identity-matched (language, culture, preference)
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {[
            {
              range: '<0.5 mi',
              weight: '3.0x',
              bg: 'bg-sage/10',
              text: 'text-sage',
              desc: 'Walking distance',
            },
            {
              range: '0.5-1 mi',
              weight: '2.0x',
              bg: 'bg-sage/5',
              text: 'text-sage',
              desc: 'Close neighbor',
            },
            {
              range: '1-2 mi',
              weight: '1.0x',
              bg: 'bg-gold/10',
              text: 'text-gold',
              desc: 'Baseline',
            },
            {
              range: '>2 mi',
              weight: '0x',
              bg: 'bg-zone-red/10',
              text: 'text-zone-red',
              desc: 'Remote only',
            },
          ].map((tier) => (
            <div key={tier.range} className={`rounded-lg ${tier.bg} p-2 text-center`}>
              <p className={`text-lg font-bold ${tier.text}`}>{tier.weight}</p>
              <p className="text-[11px] font-semibold text-primary">{tier.range}</p>
              <p className="text-[10px] text-muted">{tier.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1 text-[11px] text-muted">
          <p>
            Proximity is weighted above all other factors. Tasks beyond 2 miles are restricted to
            remote-eligible types only (phone companionship, tech support, admin help).
          </p>
          <p>
            GPS verification at check-in/check-out confirms the helper is within 0.25 miles of the
            family location (Haversine formula).
          </p>
        </div>
      </div>

      {/* Recent Matches Table */}
      <div className="rounded-xl border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <h2 className="text-sm font-semibold text-primary">Recent Matches</h2>
          </div>
          <span className="text-[11px] text-muted">{RECENT_MATCHES.length} matches</span>
        </div>

        <div className="divide-y divide-border">
          {RECENT_MATCHES.map((match) => {
            const outcomeConfig = OUTCOME_CONFIG[match.outcome]!;
            const isOverSLA = match.matchTimeMinutes > 240;
            const distanceBracketColor =
              match.distance < 0.5
                ? 'text-sage'
                : match.distance < 1.0
                  ? 'text-sage'
                  : match.distance < 2.0
                    ? 'text-gold'
                    : 'text-zone-red';

            return (
              <div key={match.id} className="p-4">
                <div className="flex items-start gap-3">
                  {/* Helper Avatar */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sage/10 text-xs font-bold text-sage">
                    {match.helperInitials}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Names + Task Type */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary">{match.helperName}</span>
                      <svg
                        className="h-3 w-3 text-muted"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        />
                      </svg>
                      <span className="text-sm text-secondary">{match.familyName} family</span>
                      {match.isRepeatPair && (
                        <span className="rounded-full bg-copper/10 px-1.5 py-0.5 text-[10px] font-medium text-copper">
                          Repeat Pair
                        </span>
                      )}
                    </div>

                    {/* Task Type + Metadata */}
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px]">
                      <span className="rounded-full bg-warm-gray/10 px-2 py-0.5 text-secondary">
                        {match.taskType}
                      </span>
                      <span className={distanceBracketColor}>
                        <svg
                          className="mr-0.5 inline h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                          />
                        </svg>
                        {match.distance.toFixed(2)} mi
                      </span>
                      <span className={isOverSLA ? 'text-zone-red font-medium' : 'text-muted'}>
                        <svg
                          className="mr-0.5 inline h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {formatMatchTime(match.matchTimeMinutes)}
                        {isOverSLA && ' (over SLA)'}
                      </span>
                    </div>

                    {/* Score + Outcome */}
                    <div className="mt-2 flex items-center gap-3 text-[11px]">
                      <span className="text-muted">
                        Proximity Score:{' '}
                        <span
                          className={`font-semibold ${
                            match.proximityScore >= 80
                              ? 'text-sage'
                              : match.proximityScore >= 60
                                ? 'text-gold'
                                : 'text-zone-red'
                          }`}
                        >
                          {match.proximityScore}/100
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span
                          className={`inline-block h-1.5 w-1.5 rounded-full ${outcomeConfig.dotClass}`}
                        />
                        <span className={outcomeConfig.textClass}>{outcomeConfig.label}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Insight */}
      <div className="rounded-xl border border-border bg-warm-gray/5 p-4">
        <div className="flex items-start gap-2">
          <svg
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-copper"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-primary">Matching Insight</p>
            <p className="mt-0.5 text-[11px] text-muted">
              {Math.round(
                ((DISTANCE_BRACKETS[0]!.matchCount + DISTANCE_BRACKETS[1]!.matchCount) /
                  totalMatches) *
                  100,
              )}
              % of matches are under 1 mile with a {DISTANCE_BRACKETS[0]!.completionRate}%
              completion rate at ultra-close range. Repeat-pair rate of {repeatPairRate}% indicates
              relationship continuity is building — same helper, same family, same trust. Matches
              beyond 2 miles show a significant completion drop (
              {DISTANCE_BRACKETS[3]!.completionRate}%), confirming that proximity weighting should
              remain the top factor.
            </p>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted">
        Match data covers last 30 days. {totalMatches} total matches across{' '}
        {DISTANCE_BRACKETS.length} distance brackets. SLA target: &lt;4 hours from request to
        confirmed match.
      </p>
    </div>
  );
}
