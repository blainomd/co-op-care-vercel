/**
 * KBS Trend — Sparkline trend charts per Omaha problem
 *
 * Shows longitudinal KBS outcome data for a care recipient.
 * Each problem displays K/B/S scores over time with trend indicators.
 * Highlights declining dimensions for clinical attention.
 */
import { useState, useMemo } from 'react';
import { OMAHA_PROBLEMS } from '@shared/constants/omaha-system';

type TrendDirection = 'improving' | 'declining' | 'stable' | 'insufficient_data';
type Dimension = 'knowledge' | 'behavior' | 'status';

interface KBSDataPoint {
  date: string;
  day: number; // 0, 30, 60, 90
  knowledge: number;
  behavior: number;
  status: number;
}

interface ProblemTrend {
  omahaProblemCode: number;
  data: KBSDataPoint[];
  trends: Record<Dimension, { direction: TrendDirection; delta: number }>;
  escalation: boolean;
}

/** Mock data — will be replaced with API call to /kbs/:careRecipientId/trends */
const MOCK_TRENDS: ProblemTrend[] = [
  {
    omahaProblemCode: 21, // Cognition
    data: [
      { date: '2025-12-01', day: 0, knowledge: 3, behavior: 3, status: 3 },
      { date: '2026-01-01', day: 30, knowledge: 3, behavior: 3, status: 2 },
      { date: '2026-02-01', day: 60, knowledge: 2, behavior: 2, status: 2 },
      { date: '2026-03-01', day: 90, knowledge: 2, behavior: 2, status: 1 },
    ],
    trends: {
      knowledge: { direction: 'declining', delta: -1 },
      behavior: { direction: 'declining', delta: -1 },
      status: { direction: 'declining', delta: -2 },
    },
    escalation: true,
  },
  {
    omahaProblemCode: 25, // Neuro-Musculo-Skeletal
    data: [
      { date: '2025-12-01', day: 0, knowledge: 2, behavior: 2, status: 2 },
      { date: '2026-01-01', day: 30, knowledge: 3, behavior: 3, status: 2 },
      { date: '2026-02-01', day: 60, knowledge: 3, behavior: 3, status: 3 },
      { date: '2026-03-01', day: 90, knowledge: 4, behavior: 4, status: 3 },
    ],
    trends: {
      knowledge: { direction: 'improving', delta: 1 },
      behavior: { direction: 'improving', delta: 1 },
      status: { direction: 'stable', delta: 0 },
    },
    escalation: false,
  },
  {
    omahaProblemCode: 38, // Personal Care
    data: [
      { date: '2025-12-01', day: 0, knowledge: 3, behavior: 3, status: 3 },
      { date: '2026-01-01', day: 30, knowledge: 3, behavior: 3, status: 3 },
      { date: '2026-02-01', day: 60, knowledge: 3, behavior: 3, status: 3 },
    ],
    trends: {
      knowledge: { direction: 'stable', delta: 0 },
      behavior: { direction: 'stable', delta: 0 },
      status: { direction: 'stable', delta: 0 },
    },
    escalation: false,
  },
];

const TREND_ICONS: Record<TrendDirection, { symbol: string; color: string }> = {
  improving: { symbol: '\u2191', color: 'text-zone-green' },
  declining: { symbol: '\u2193', color: 'text-zone-red' },
  stable: { symbol: '\u2192', color: 'text-text-muted' },
  insufficient_data: { symbol: '\u2014', color: 'text-text-muted' },
};

const DIM_LABELS: Record<Dimension, string> = {
  knowledge: 'K',
  behavior: 'B',
  status: 'S',
};

/** Simple mini sparkline for a single KBS dimension */
function MiniSparkline({ values, color = 'currentColor' }: { values: number[]; color?: string }) {
  if (values.length < 2) return <span className="text-xs text-text-muted">—</span>;

  const width = 60;
  const height = 20;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - 1) / 4) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible" style={{ color }}>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function KBSTrend() {
  const [trends] = useState<ProblemTrend[]>(MOCK_TRENDS);
  const [expandedProblem, setExpandedProblem] = useState<number | null>(null);

  const escalationCount = useMemo(() => trends.filter((t) => t.escalation).length, [trends]);

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          KBS Outcome Trends
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Knowledge-Behavior-Status trends across Omaha problems.
          {escalationCount > 0 && (
            <span className="ml-1 font-medium text-zone-red">
              {escalationCount} problem{escalationCount !== 1 ? 's' : ''} with clinical escalation.
            </span>
          )}
        </p>
      </div>

      {/* Problem trend cards */}
      <div className="space-y-3">
        {trends.map((trend) => {
          const problem = OMAHA_PROBLEMS.find((p) => p.code === trend.omahaProblemCode);
          if (!problem) return null;

          const isExpanded = expandedProblem === trend.omahaProblemCode;

          return (
            <div
              key={trend.omahaProblemCode}
              className={`rounded-xl border ${trend.escalation ? 'border-zone-red/30' : 'border-border'} bg-white`}
            >
              {/* Summary row */}
              <button
                onClick={() => setExpandedProblem(isExpanded ? null : trend.omahaProblemCode)}
                className="flex w-full items-center gap-4 p-4 text-left"
              >
                {/* Problem info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {trend.escalation && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zone-red/10 text-[10px] text-zone-red">
                        !
                      </span>
                    )}
                    <span className="text-sm font-medium text-text-primary">
                      #{problem.code} {problem.name}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">{problem.domain}</span>
                </div>

                {/* K/B/S mini indicators */}
                <div className="flex gap-4">
                  {(['knowledge', 'behavior', 'status'] as Dimension[]).map((dim) => {
                    const t = trend.trends[dim];
                    const icon = TREND_ICONS[t.direction];
                    const values = trend.data.map((d) => d[dim]);
                    return (
                      <div key={dim} className="flex items-center gap-1.5">
                        <span className="text-[10px] text-text-muted">{DIM_LABELS[dim]}</span>
                        <MiniSparkline
                          values={values}
                          color={
                            t.direction === 'declining'
                              ? '#F44336'
                              : t.direction === 'improving'
                                ? '#4CAF50'
                                : '#9CA3AF'
                          }
                        />
                        <span className={`text-xs font-semibold ${icon.color}`}>{icon.symbol}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Latest scores */}
                <div className="flex gap-2">
                  {(['knowledge', 'behavior', 'status'] as Dimension[]).map((dim) => {
                    const latest = trend.data[trend.data.length - 1];
                    const value = latest ? latest[dim] : 0;
                    return (
                      <span
                        key={dim}
                        className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                          value <= 2
                            ? 'bg-zone-red/10 text-zone-red'
                            : value <= 3
                              ? 'bg-zone-yellow/10 text-zone-yellow'
                              : 'bg-zone-green/10 text-zone-green'
                        }`}
                      >
                        {value}
                      </span>
                    );
                  })}
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-border px-4 pb-4 pt-3">
                  {/* Timeline table */}
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-text-muted">
                        <th className="pb-2 text-left font-medium">Date</th>
                        <th className="pb-2 text-left font-medium">Day</th>
                        <th className="pb-2 text-center font-medium">Knowledge</th>
                        <th className="pb-2 text-center font-medium">Behavior</th>
                        <th className="pb-2 text-center font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trend.data.map((point, i) => (
                        <tr
                          key={point.date}
                          className={i === trend.data.length - 1 ? 'font-semibold' : ''}
                        >
                          <td className="py-1 text-text-secondary">{formatDate(point.date)}</td>
                          <td className="py-1 text-text-muted">Day {point.day}</td>
                          {(['knowledge', 'behavior', 'status'] as Dimension[]).map((dim) => {
                            const prev = i > 0 ? trend.data[i - 1]![dim] : point[dim];
                            const delta = point[dim] - prev;
                            return (
                              <td key={dim} className="py-1 text-center">
                                <span
                                  className={
                                    point[dim] <= 2
                                      ? 'text-zone-red'
                                      : point[dim] <= 3
                                        ? 'text-zone-yellow'
                                        : 'text-zone-green'
                                  }
                                >
                                  {point[dim]}
                                </span>
                                {i > 0 && delta !== 0 && (
                                  <span
                                    className={`ml-1 ${delta > 0 ? 'text-zone-green' : 'text-zone-red'}`}
                                  >
                                    ({delta > 0 ? '+' : ''}
                                    {delta})
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Clinical summary */}
                  <div
                    className={`mt-3 rounded-lg p-3 text-xs ${
                      trend.escalation ? 'bg-zone-red/5 text-zone-red' : 'bg-sage/5 text-sage'
                    }`}
                  >
                    {trend.escalation ? (
                      <p>
                        <strong>Escalation:</strong> Significant decline detected in{' '}
                        {(['knowledge', 'behavior', 'status'] as Dimension[])
                          .filter((d) => trend.trends[d].delta <= -2)
                          .join(', ')}
                        . Medical director has been notified.
                      </p>
                    ) : (
                      <p>
                        {trend.trends.knowledge.direction === 'improving' ||
                        trend.trends.behavior.direction === 'improving'
                          ? 'Positive trend — care interventions appear effective.'
                          : 'Scores are stable. Continue current care plan.'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {trends.length === 0 && (
        <div className="rounded-xl border border-border bg-white p-8 text-center">
          <h3 className="text-sm font-medium text-text-primary">No KBS data yet</h3>
          <p className="mt-1 text-xs text-text-muted">
            KBS ratings will appear here after the intake assessment is completed.
          </p>
        </div>
      )}
    </div>
  );
}
