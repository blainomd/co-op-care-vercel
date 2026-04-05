/**
 * QualityMetrics — Quality metrics dashboard for admin
 *
 * Tracks clinical outcomes, worker retention, family satisfaction,
 * and regulatory compliance. Includes CMS STAR rating projection,
 * incident summary, and quality trend visualization.
 *
 * Key metrics:
 *   - 30-day hospital readmission vs BCH baseline (15.4%)
 *   - CII change rate per quarter
 *   - KBS improvement rate
 *   - Worker retention vs 77% industry turnover
 *   - CMS STAR rating projection
 */

import { useState } from 'react';

type TimePeriod = '30d' | '90d' | 'ytd';

interface KpiCard {
  label: string;
  value: string;
  comparison: string;
  indicator: 'green' | 'gold' | 'red';
}

interface SatisfactionMetric {
  label: string;
  value: number;
  max: number;
  display: string;
}

interface ComplianceItem {
  label: string;
  status: 'pass' | 'warning';
  note?: string;
}

interface TrendMonth {
  month: string;
  cii: number;
  readmission: number;
  satisfaction: number;
}

const CLINICAL_OUTCOMES: KpiCard[] = [
  {
    label: '30-Day Hospital Readmission',
    value: '8.5%',
    comparison: 'vs 15.4% BCH baseline',
    indicator: 'green',
  },
  {
    label: 'Average CII Change',
    value: '-4.2 pts/qtr',
    comparison: 'improvement trend',
    indicator: 'green',
  },
  {
    label: 'KBS Improvement Rate',
    value: '73%',
    comparison: 'of patients improving',
    indicator: 'green',
  },
  {
    label: 'Fall Rate',
    value: '2.1',
    comparison: 'per 1,000 care hrs (vs 4.8 industry)',
    indicator: 'green',
  },
];

const WORKFORCE_QUALITY: KpiCard[] = [
  {
    label: 'Worker Retention',
    value: '85%',
    comparison: 'vs 23% industry avg',
    indicator: 'green',
  },
  {
    label: 'Average Worker Tenure',
    value: '14 mo',
    comparison: 'across active workers',
    indicator: 'gold',
  },
  {
    label: 'Certification Completion',
    value: '92%',
    comparison: 'of required certs current',
    indicator: 'green',
  },
  {
    label: 'Background Check Currency',
    value: '100%',
    comparison: 'all checks current',
    indicator: 'green',
  },
];

const SATISFACTION_METRICS: SatisfactionMetric[] = [
  { label: 'Overall Satisfaction', value: 4.7, max: 5, display: '4.7 / 5' },
  { label: 'Worker Reliability', value: 4.8, max: 5, display: '4.8 / 5' },
  { label: 'Communication Quality', value: 4.5, max: 5, display: '4.5 / 5' },
  { label: 'Would Recommend', value: 96, max: 100, display: '96%' },
  { label: 'NPS Score', value: 72, max: 100, display: '+72' },
];

const COMPLIANCE_ITEMS: ComplianceItem[] = [
  { label: 'HIPAA training current', status: 'pass' },
  { label: 'Class B license active', status: 'pass' },
  { label: 'Insurance coverage verified', status: 'pass' },
  { label: 'Incident reports filed (<24hr)', status: 'pass' },
  { label: 'Worker comp current', status: 'pass' },
  { label: 'CPR/First Aid certifications', status: 'warning', note: '2 expiring soon' },
];

const TREND_DATA: TrendMonth[] = [
  { month: 'Oct', cii: 52, readmission: 14.2, satisfaction: 4.3 },
  { month: 'Nov', cii: 49, readmission: 12.8, satisfaction: 4.4 },
  { month: 'Dec', cii: 47, readmission: 11.5, satisfaction: 4.5 },
  { month: 'Jan', cii: 44, readmission: 10.1, satisfaction: 4.6 },
  { month: 'Feb', cii: 41, readmission: 9.3, satisfaction: 4.6 },
  { month: 'Mar', cii: 38, readmission: 8.5, satisfaction: 4.7 },
];

const INDICATOR_CLASSES: Record<string, { dot: string; text: string }> = {
  green: { dot: 'bg-zone-green', text: 'text-zone-green' },
  gold: { dot: 'bg-gold', text: 'text-gold' },
  red: { dot: 'bg-zone-red', text: 'text-zone-red' },
};

function KpiCardGrid({ title, items }: { title: string; items: KpiCard[] }) {
  return (
    <div>
      <h2 className="mb-3 font-heading text-sm font-semibold text-text-primary">{title}</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((item) => {
          const indicator = INDICATOR_CLASSES[item.indicator]!;
          return (
            <div key={item.label} className="rounded-xl border border-border bg-white p-4">
              <div className="mb-2 flex items-center gap-1.5">
                <span className={`inline-block h-2 w-2 rounded-full ${indicator.dot}`} />
                <span
                  className={`text-[10px] font-medium uppercase tracking-wide ${indicator.text}`}
                >
                  {item.indicator === 'green'
                    ? 'On Track'
                    : item.indicator === 'gold'
                      ? 'Monitor'
                      : 'Alert'}
                </span>
              </div>
              <p className="text-xl font-bold text-text-primary">{item.value}</p>
              <p className="mt-0.5 text-[11px] text-text-muted">{item.label}</p>
              <p className="mt-1 text-[10px] text-text-secondary">{item.comparison}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function QualityMetrics() {
  const [period, setPeriod] = useState<TimePeriod>('30d');

  const periodOptions: { value: TimePeriod; label: string }[] = [
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'ytd', label: 'YTD' },
  ];

  // Compute trend chart max for bar scaling
  const maxCii = Math.max(...TREND_DATA.map((d) => d.cii));

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Quality Dashboard</h1>
          <p className="text-sm text-text-secondary">
            Clinical outcomes, workforce, and compliance metrics
          </p>
        </div>
        <div className="flex rounded-lg border border-border bg-white">
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                period === opt.value
                  ? 'bg-sage text-white'
                  : 'text-text-secondary hover:text-text-primary'
              } ${opt.value === '30d' ? 'rounded-l-lg' : ''} ${opt.value === 'ytd' ? 'rounded-r-lg' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Clinical Outcomes ── */}
      <KpiCardGrid title="Clinical Outcomes" items={CLINICAL_OUTCOMES} />

      {/* ── Workforce Quality ── */}
      <KpiCardGrid title="Workforce Quality" items={WORKFORCE_QUALITY} />

      {/* ── Family Satisfaction ── */}
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <svg
            className="h-4 w-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
            />
          </svg>
          <h2 className="font-heading text-sm font-semibold text-text-primary">
            Family Satisfaction
          </h2>
        </div>
        <div className="space-y-3">
          {SATISFACTION_METRICS.map((metric) => {
            const pct = (metric.value / metric.max) * 100;
            return (
              <div key={metric.label}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{metric.label}</span>
                  <span className="text-xs font-semibold text-text-primary">{metric.display}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-warm-gray/20">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      pct >= 90 ? 'bg-sage' : pct >= 70 ? 'bg-gold' : 'bg-zone-red'
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Regulatory Compliance ── */}
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <svg
            className="h-4 w-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
          <h2 className="font-heading text-sm font-semibold text-text-primary">
            Regulatory Compliance
          </h2>
        </div>
        <div className="space-y-2">
          {COMPLIANCE_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg bg-warm-gray/5 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                {item.status === 'pass' ? (
                  <svg
                    className="h-4 w-4 text-zone-green"
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
                    className="h-4 w-4 text-zone-yellow"
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
                <span className="text-xs text-text-primary">{item.label}</span>
              </div>
              {item.note && (
                <span className="text-[10px] font-medium text-zone-yellow">{item.note}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Quality Trend Chart ── */}
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <svg
            className="h-4 w-4 text-text-muted"
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
          <h2 className="font-heading text-sm font-semibold text-text-primary">Quality Trends</h2>
          <span className="text-[11px] text-text-muted">Oct 2025 - Mar 2026</span>
        </div>

        {/* Legend */}
        <div className="mb-3 flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-sage" />
            <span className="text-text-secondary">CII Score (lower = better)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-copper" />
            <span className="text-text-secondary">Readmission %</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-gold" />
            <span className="text-text-secondary">Satisfaction (x20 scale)</span>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="flex items-end gap-2">
          {TREND_DATA.map((month) => {
            const ciiHeight = (month.cii / maxCii) * 100;
            const readmitHeight = (month.readmission / 20) * 100;
            const satHeight = ((month.satisfaction * 20) / maxCii) * 100;
            return (
              <div key={month.month} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-28 w-full items-end justify-center gap-0.5">
                  <div
                    className="w-2.5 rounded-t bg-sage transition-all"
                    style={{ height: `${ciiHeight}%` }}
                    title={`CII: ${month.cii}`}
                  />
                  <div
                    className="w-2.5 rounded-t bg-copper transition-all"
                    style={{ height: `${readmitHeight}%` }}
                    title={`Readmit: ${month.readmission}%`}
                  />
                  <div
                    className="w-2.5 rounded-t bg-gold transition-all"
                    style={{ height: `${satHeight}%` }}
                    title={`Satisfaction: ${month.satisfaction}`}
                  />
                </div>
                <span className="text-[10px] text-text-muted">{month.month}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-1 text-[11px] text-text-muted">
          <svg
            className="h-3.5 w-3.5 text-zone-green"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181"
            />
          </svg>
          <span>All metrics trending favorably. CII down 27% over 6 months.</span>
        </div>
      </div>

      {/* ── Incident Summary ── */}
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <svg
            className="h-4 w-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <h2 className="font-heading text-sm font-semibold text-text-primary">Incident Summary</h2>
        </div>

        {/* Stat Cards */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Total Incidents', value: '7', color: 'text-text-primary' },
            { label: 'Falls', value: '3', color: 'text-zone-yellow' },
            { label: 'Near Misses', value: '4', color: 'text-text-secondary' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-white p-3 text-center"
            >
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[11px] text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Severity Breakdown */}
        <div className="rounded-lg bg-warm-gray/5 p-3">
          <p className="mb-2 text-xs font-semibold text-text-primary">Severity Breakdown</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { severity: 'Minor', count: 5, color: 'text-zone-green' },
              { severity: 'Moderate', count: 2, color: 'text-zone-yellow' },
              { severity: 'Severe', count: 0, color: 'text-zone-red' },
              { severity: 'Critical', count: 0, color: 'text-zone-red' },
            ].map((item) => (
              <div key={item.severity} className="text-center">
                <p className={`text-lg font-bold ${item.color}`}>{item.count}</p>
                <p className="text-[10px] text-text-muted">{item.severity}</p>
              </div>
            ))}
          </div>
        </div>

        <button className="mt-3 text-xs font-medium text-sage hover:underline">
          View Full Incident Reports →
        </button>
      </div>

      {/* ── CMS STAR Rating Projection ── */}
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <svg className="h-4 w-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <h2 className="font-heading text-sm font-semibold text-text-primary">
            CMS STAR Rating Projection
          </h2>
        </div>

        <div className="flex items-center gap-6">
          {/* Projected Rating */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-0.5">
              {[1, 2, 3, 4].map((star) => (
                <svg
                  key={star}
                  className="h-6 w-6 text-gold"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
              {/* Half star */}
              <svg className="h-6 w-6 text-gold" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="halfStar">
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="#e5e7eb" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#halfStar)"
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
            </div>
            <p className="mt-1 text-2xl font-bold text-text-primary">4.5 / 5</p>
            <p className="text-[11px] text-text-muted">Projected Rating</p>
          </div>

          {/* Comparison */}
          <div className="flex-1 rounded-lg bg-warm-gray/5 p-3">
            <div className="space-y-2">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-text-secondary">co.op.care (projected)</span>
                  <span className="text-xs font-semibold text-sage">4.5</span>
                </div>
                <div className="h-2 w-full rounded-full bg-warm-gray/20">
                  <div className="h-2 rounded-full bg-sage" style={{ width: '90%' }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Colorado home care avg</span>
                  <span className="text-xs font-semibold text-text-muted">3.2</span>
                </div>
                <div className="h-2 w-full rounded-full bg-warm-gray/20">
                  <div className="h-2 rounded-full bg-warm-gray" style={{ width: '64%' }} />
                </div>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-text-muted">
              Based on readmission rates, patient outcomes, family satisfaction, and compliance
              metrics. Rating exceeds state average by 1.3 stars.
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <p className="text-[11px] text-text-muted">
        Quality data reflects{' '}
        {period === '30d' ? '30-day' : period === '90d' ? '90-day' : 'year-to-date'} rolling window.
        Metrics auto-refresh daily. Last updated Mar 8, 2026.
      </p>
    </div>
  );
}
