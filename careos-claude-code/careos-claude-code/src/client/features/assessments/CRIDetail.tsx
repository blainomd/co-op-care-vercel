/**
 * CRI Detail — Side-by-side CII vs CRI with trend comparison
 *
 * Shows a single CRI assessment detail with:
 * - Factor-by-factor breakdown with visual bars
 * - CII ↔ CRI correlation sidebar
 * - Longitudinal trend chart (sparklines)
 * - Review status and notes
 */
import { useState, useMemo } from 'react';
import type { CRIAcuity, CRIReviewStatus } from '@shared/types/assessment.types';
import type { CIIZone } from '@shared/constants/business-rules';
import { CRI_MAX_RAW } from '@shared/constants/business-rules';

/** Mock data — will be replaced with API response */
const MOCK_CRI = {
  id: 'cri_001',
  careRecipientName: 'Margaret Thompson',
  assessorName: 'Sarah Chen',
  rawScore: 52.4,
  acuity: 'high' as CRIAcuity,
  lmnEligible: true,
  reviewStatus: 'approved' as CRIReviewStatus,
  reviewedBy: 'Dr. James Park',
  reviewNotes:
    'Approved. High fall risk and cognitive decline warrant intensive care plan. LMN generated for HSA coverage.',
  completedAt: '2026-03-05T14:30:00Z',
  reviewedAt: '2026-03-05T18:45:00Z',
  factors: [
    { name: 'Cognitive Status', weight: 1.2, score: 4 },
    { name: 'Functional Mobility', weight: 1.2, score: 3 },
    { name: 'ADL Independence', weight: 1.0, score: 4 },
    { name: 'IADL Capacity', weight: 0.8, score: 5 },
    { name: 'Medication Complexity', weight: 1.0, score: 3 },
    { name: 'Behavioral Challenges', weight: 1.2, score: 4 },
    { name: 'Fall Risk', weight: 1.0, score: 4 },
    { name: 'Nutritional Status', weight: 0.8, score: 2 },
    { name: 'Social Support Network', weight: 0.8, score: 3 },
    { name: 'Caregiver Burnout Level', weight: 1.0, score: 4 },
    { name: 'Home Environment Safety', weight: 0.8, score: 3 },
    { name: 'Emergency Preparedness', weight: 0.6, score: 2 },
    { name: 'Financial Resources', weight: 0.6, score: 2 },
    { name: 'Care Plan Adherence History', weight: 0.8, score: 3 },
  ],
};

const MOCK_CII = {
  totalScore: 78,
  zone: 'YELLOW' as CIIZone,
  completedAt: '2026-03-04T10:00:00Z',
};

/** Historical CRI scores for trend */
const MOCK_TREND = [
  { date: '2025-12-01', score: 38.2 },
  { date: '2026-01-15', score: 42.8 },
  { date: '2026-02-10', score: 47.1 },
  { date: '2026-03-05', score: 52.4 },
];

const ACUITY_STYLES: Record<CRIAcuity, { bg: string; text: string; label: string }> = {
  low: { bg: 'bg-zone-green/10', text: 'text-zone-green', label: 'Low' },
  moderate: { bg: 'bg-zone-yellow/10', text: 'text-zone-yellow', label: 'Moderate' },
  high: { bg: 'bg-orange-100', text: 'text-orange-600', label: 'High' },
  critical: { bg: 'bg-zone-red/10', text: 'text-zone-red', label: 'Critical' },
};

const ZONE_STYLES: Record<CIIZone, { bg: string; text: string }> = {
  GREEN: { bg: 'bg-zone-green/10', text: 'text-zone-green' },
  YELLOW: { bg: 'bg-zone-yellow/10', text: 'text-zone-yellow' },
  RED: { bg: 'bg-zone-red/10', text: 'text-zone-red' },
};

const STATUS_STYLES: Record<CRIReviewStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-zone-yellow/10', text: 'text-zone-yellow', label: 'Pending Review' },
  reviewed: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Reviewed' },
  approved: { bg: 'bg-zone-green/10', text: 'text-zone-green', label: 'Approved' },
  revision_requested: { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Revision Requested' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Simple sparkline using SVG polyline */
function Sparkline({
  data,
  width = 160,
  height = 40,
}: {
  data: { score: number }[];
  width?: number;
  height?: number;
}) {
  const minScore = Math.min(...data.map((d) => d.score));
  const maxScore = Math.max(...data.map((d) => d.score));
  const range = maxScore - minScore || 1;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d.score - minScore) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      {data.length > 0 &&
        (() => {
          const last = data[data.length - 1]!;
          const x = width;
          const y = height - ((last.score - minScore) / range) * (height - 4) - 2;
          return <circle cx={x} cy={y} r={3} fill="currentColor" />;
        })()}
    </svg>
  );
}

export function CRIDetail() {
  const [activeTab, setActiveTab] = useState<'factors' | 'comparison' | 'trend'>('factors');
  const cri = MOCK_CRI;
  const cii = MOCK_CII;
  const trend = MOCK_TREND;

  const acuityStyle = ACUITY_STYLES[cri.acuity];
  const statusStyle = STATUS_STYLES[cri.reviewStatus];
  const ciiZoneStyle = ZONE_STYLES[cii.zone];

  const trendDirection = useMemo(() => {
    if (trend.length < 2) return 'stable';
    const latest = trend[trend.length - 1]!.score;
    const previous = trend[trend.length - 2]!.score;
    if (latest > previous + 2) return 'increasing';
    if (latest < previous - 2) return 'decreasing';
    return 'stable';
  }, [trend]);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-text-primary">
              CRI Assessment Detail
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {cri.careRecipientName} &middot; {formatDate(cri.completedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {cri.lmnEligible && (
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600">
                LMN Eligible
              </span>
            )}
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
            >
              {statusStyle.label}
            </span>
          </div>
        </div>
      </div>

      {/* Score summary cards */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {/* CRI Score */}
        <div className="rounded-xl border border-border bg-white p-4 text-center">
          <p className="text-xs font-medium text-text-muted">CRI Score</p>
          <p className={`mt-1 text-3xl font-bold ${acuityStyle.text}`}>{cri.rawScore}</p>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${acuityStyle.bg} ${acuityStyle.text}`}
          >
            {acuityStyle.label} Acuity
          </span>
        </div>

        {/* CII Score (correlated) */}
        <div className="rounded-xl border border-border bg-white p-4 text-center">
          <p className="text-xs font-medium text-text-muted">CII Score</p>
          <p className={`mt-1 text-3xl font-bold ${ciiZoneStyle.text}`}>{cii.totalScore}</p>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ciiZoneStyle.bg} ${ciiZoneStyle.text}`}
          >
            {cii.zone} Zone
          </span>
        </div>

        {/* Trend */}
        <div className="rounded-xl border border-border bg-white p-4 text-center">
          <p className="text-xs font-medium text-text-muted">Trend</p>
          <div
            className={`mt-2 flex justify-center ${
              trendDirection === 'increasing'
                ? 'text-zone-red'
                : trendDirection === 'decreasing'
                  ? 'text-zone-green'
                  : 'text-text-muted'
            }`}
          >
            <Sparkline data={trend} />
          </div>
          <p className="mt-1 text-xs text-text-muted capitalize">{trendDirection}</p>
        </div>
      </div>

      {/* Review notes (if any) */}
      {cri.reviewNotes && (
        <div className="mb-6 rounded-xl border border-border bg-white p-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-secondary">MD Notes</span>
            <span className="text-xs text-text-muted">
              — {cri.reviewedBy}, {cri.reviewedAt ? formatDate(cri.reviewedAt) : ''}
            </span>
          </div>
          <p className="mt-2 text-sm text-text-primary">{cri.reviewNotes}</p>
        </div>
      )}

      {/* Tab navigation */}
      <div className="mb-4 flex border-b border-border">
        {(['factors', 'comparison', 'trend'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-sage text-sage'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab === 'factors'
              ? '14 Factors'
              : tab === 'comparison'
                ? 'CII ↔ CRI'
                : 'Trend History'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'factors' && (
        <div className="space-y-2">
          {cri.factors.map((factor) => {
            const weighted = Math.round(factor.weight * factor.score * 10) / 10;
            const barWidth = (factor.score / 5) * 100;
            return (
              <div key={factor.name} className="flex items-center gap-3 rounded-lg bg-white p-3">
                <div className="w-48 flex-shrink-0">
                  <span className="text-xs font-medium text-text-primary">{factor.name}</span>
                  <span className="ml-1 text-[10px] text-text-muted">({factor.weight}x)</span>
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-warm-gray">
                    <div
                      className={`h-full rounded-full transition-all ${
                        factor.score <= 2
                          ? 'bg-zone-green'
                          : factor.score <= 3
                            ? 'bg-zone-yellow'
                            : factor.score <= 4
                              ? 'bg-orange-500'
                              : 'bg-zone-red'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-semibold text-text-primary">
                    {factor.score}/5
                  </span>
                  <span className="w-12 text-right text-[10px] text-text-muted">= {weighted}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="rounded-xl border border-border bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">CII ↔ CRI Correlation</h3>
          <div className="grid grid-cols-2 gap-6">
            {/* CII side */}
            <div>
              <h4 className="mb-3 text-xs font-medium text-text-muted">CII (Caregiver Impact)</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Score</span>
                  <span className={`font-semibold ${ciiZoneStyle.text}`}>{cii.totalScore}/120</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Zone</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${ciiZoneStyle.bg} ${ciiZoneStyle.text}`}
                  >
                    {cii.zone}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Assessed</span>
                  <span className="text-text-muted">{formatDate(cii.completedAt)}</span>
                </div>
                <p className="mt-2 text-xs text-text-muted">
                  Measures caregiver burden across 12 dimensions. Higher scores indicate greater
                  caregiver strain.
                </p>
              </div>
            </div>

            {/* CRI side */}
            <div>
              <h4 className="mb-3 text-xs font-medium text-text-muted">CRI (Clinical Risk)</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Score</span>
                  <span className={`font-semibold ${acuityStyle.text}`}>
                    {cri.rawScore}/{CRI_MAX_RAW}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Acuity</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${acuityStyle.bg} ${acuityStyle.text}`}
                  >
                    {acuityStyle.label}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Assessed</span>
                  <span className="text-text-muted">{formatDate(cri.completedAt)}</span>
                </div>
                <p className="mt-2 text-xs text-text-muted">
                  Measures care recipient clinical risk across 14 factors. Higher scores indicate
                  greater care complexity.
                </p>
              </div>
            </div>
          </div>

          {/* Correlation insight */}
          <div className="mt-6 rounded-lg bg-sage/5 p-4">
            <p className="text-xs font-medium text-sage">Clinical Insight</p>
            <p className="mt-1 text-sm text-text-secondary">
              CII {cii.zone} Zone with CRI {cri.acuity} acuity suggests the caregiver burden is{' '}
              {cii.zone === 'RED'
                ? 'critically high'
                : cii.zone === 'YELLOW'
                  ? 'elevated'
                  : 'manageable'}{' '}
              relative to the care recipient&apos;s clinical complexity.
              {cri.lmnEligible && ' LMN has been generated for HSA/FSA coverage eligibility.'}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'trend' && (
        <div className="rounded-xl border border-border bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">CRI Score History</h3>
          <div className="space-y-3">
            {trend.map((entry, i) => {
              const prev = i > 0 ? trend[i - 1]!.score : entry.score;
              const delta = Math.round((entry.score - prev) * 10) / 10;
              const barWidth = ((entry.score - 14.4) / (CRI_MAX_RAW - 14.4)) * 100;
              return (
                <div key={entry.date} className="flex items-center gap-3">
                  <span className="w-24 flex-shrink-0 text-xs text-text-muted">
                    {formatDate(entry.date)}
                  </span>
                  <div className="h-3 flex-1 rounded-full bg-warm-gray">
                    <div
                      className={`h-full rounded-full ${
                        entry.score < 30
                          ? 'bg-zone-green'
                          : entry.score < 45
                            ? 'bg-zone-yellow'
                            : entry.score < 60
                              ? 'bg-orange-500'
                              : 'bg-zone-red'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs font-semibold text-text-primary">
                    {entry.score}
                  </span>
                  {i > 0 && (
                    <span
                      className={`w-12 text-right text-xs ${
                        delta > 0
                          ? 'text-zone-red'
                          : delta < 0
                            ? 'text-zone-green'
                            : 'text-text-muted'
                      }`}
                    >
                      {delta > 0 ? '+' : ''}
                      {delta}
                    </span>
                  )}
                  {i === 0 && <span className="w-12 text-right text-xs text-text-muted">—</span>}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-text-muted">
            {trendDirection === 'increasing'
              ? 'CRI score is trending upward — clinical risk is increasing. Consider care plan escalation.'
              : trendDirection === 'decreasing'
                ? 'CRI score is trending downward — care interventions may be showing positive effect.'
                : 'CRI score is relatively stable between assessments.'}
          </p>
        </div>
      )}
    </div>
  );
}
