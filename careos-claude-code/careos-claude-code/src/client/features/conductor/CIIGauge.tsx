/**
 * CIIGauge — Caregiver Impact Index score with zone coloring
 *
 * Displays the most recent CII score with Green/Yellow/Red zone visualization.
 * Includes trend indicator (30/60/90 day).
 */

// Placeholder until API integration
const PLACEHOLDER_CII = {
  score: 62,
  maxScore: 120,
  zone: 'green' as const,
  lastAssessedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
};

const ZONE_COLORS = {
  green: {
    bg: 'bg-zone-green/10',
    text: 'text-zone-green',
    bar: 'bg-zone-green',
    label: 'Green Zone',
  },
  yellow: {
    bg: 'bg-zone-yellow/10',
    text: 'text-zone-yellow',
    bar: 'bg-zone-yellow',
    label: 'Yellow Zone',
  },
  red: { bg: 'bg-zone-red/10', text: 'text-zone-red', bar: 'bg-zone-red', label: 'Red Zone' },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function CIIGauge() {
  const cii = PLACEHOLDER_CII;
  const zone = ZONE_COLORS[cii.zone];
  const percentage = Math.round((cii.score / cii.maxScore) * 100);

  return (
    <div className="rounded-xl border border-border bg-white p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-text-primary">CII Score</h2>
        <a href="#/assessments" className="text-sm font-medium text-sage hover:text-sage-dark">
          Details
        </a>
      </div>

      {/* Score display */}
      <div className="mb-3 text-center">
        <p className={`text-3xl font-bold ${zone.text}`}>
          {cii.score}
          <span className="text-lg text-text-muted">/{cii.maxScore}</span>
        </p>
        <span
          className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${zone.bg} ${zone.text}`}
        >
          {zone.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-2 h-2 rounded-full bg-warm-gray">
        <div
          className={`h-full rounded-full ${zone.bar} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-center text-xs text-text-muted">
        Last assessed: {formatDate(cii.lastAssessedAt)}
      </p>
    </div>
  );
}
