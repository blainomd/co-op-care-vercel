/**
 * EnrollmentView — Employee enrollment status, utilization rates
 *
 * Anonymized: shows aggregate counts, not individual employees.
 */
import { useState } from 'react';

interface EnrollmentMetrics {
  totalEnrolled: number;
  activeUtilizers: number;
  utilizationRate: number;
  monthlyPEPMCents: number;
  totalMonthlyCostCents: number;
  enrollmentTrend: EnrollmentMonth[];
}

interface EnrollmentMonth {
  month: string;
  enrolled: number;
  utilizers: number;
}

const MOCK_ENROLLMENT: EnrollmentMetrics = {
  totalEnrolled: 67,
  activeUtilizers: 41,
  utilizationRate: 61.2,
  monthlyPEPMCents: 450,
  totalMonthlyCostCents: 30150,
  enrollmentTrend: [
    { month: 'Oct 2025', enrolled: 45, utilizers: 22 },
    { month: 'Nov 2025', enrolled: 48, utilizers: 26 },
    { month: 'Dec 2025', enrolled: 52, utilizers: 30 },
    { month: 'Jan 2026', enrolled: 58, utilizers: 34 },
    { month: 'Feb 2026', enrolled: 63, utilizers: 38 },
    { month: 'Mar 2026', enrolled: 67, utilizers: 41 },
  ],
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function EnrollmentView() {
  const [metrics] = useState<EnrollmentMetrics>(MOCK_ENROLLMENT);

  const maxEnrolled = Math.max(...metrics.enrollmentTrend.map((m) => m.enrolled));

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Enrollment Status</h1>
        <p className="text-sm text-muted">Employee enrollment and utilization rates</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Total Enrolled</p>
          <p className="text-2xl font-bold text-sage">{metrics.totalEnrolled}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Active Utilizers</p>
          <p className="text-2xl font-bold text-copper">{metrics.activeUtilizers}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Utilization Rate</p>
          <p className="text-2xl font-bold text-blue-600">{metrics.utilizationRate}%</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Monthly Cost</p>
          <p className="text-2xl font-bold text-primary">
            {formatCents(metrics.totalMonthlyCostCents)}
          </p>
          <p className="text-[11px] text-muted">{formatCents(metrics.monthlyPEPMCents)}/employee</p>
        </div>
      </div>

      {/* Enrollment Trend */}
      <div className="rounded-xl border border-border bg-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-primary">Enrollment Trend</h2>
        <div className="space-y-3">
          {metrics.enrollmentTrend.map((m) => {
            const enrolledPct = maxEnrolled > 0 ? (m.enrolled / maxEnrolled) * 100 : 0;
            const utilizerPct = maxEnrolled > 0 ? (m.utilizers / maxEnrolled) * 100 : 0;
            return (
              <div key={m.month}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-secondary">{m.month}</span>
                  <span className="text-xs text-muted">
                    {m.enrolled} enrolled / {m.utilizers} active
                  </span>
                </div>
                <div className="relative h-4 w-full rounded-full bg-warm-gray/20">
                  <div
                    className="absolute h-4 rounded-full bg-sage/30"
                    style={{ width: `${enrolledPct}%` }}
                  />
                  <div
                    className="absolute h-4 rounded-full bg-sage"
                    style={{ width: `${utilizerPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded bg-sage/30" /> Enrolled
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded bg-sage" /> Active Utilizers
          </span>
        </div>
      </div>

      {/* Utilization Breakdown */}
      <div className="rounded-xl border border-border bg-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-primary">Utilization Analysis</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-secondary">Enrollment Growth</p>
            <p className="text-3xl font-bold text-sage">
              +
              {metrics.enrollmentTrend.length > 1
                ? metrics.enrollmentTrend[metrics.enrollmentTrend.length - 1]!.enrolled -
                  metrics.enrollmentTrend[0]!.enrolled
                : 0}
            </p>
            <p className="text-xs text-muted">
              new enrollees over {metrics.enrollmentTrend.length} months
            </p>
          </div>
          <div>
            <p className="text-sm text-secondary">Utilization Growth</p>
            <p className="text-3xl font-bold text-copper">
              +
              {metrics.enrollmentTrend.length > 1
                ? metrics.enrollmentTrend[metrics.enrollmentTrend.length - 1]!.utilizers -
                  metrics.enrollmentTrend[0]!.utilizers
                : 0}
            </p>
            <p className="text-xs text-muted">
              new active utilizers over {metrics.enrollmentTrend.length} months
            </p>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted">
        All data anonymized. Utilization defined as at least one completed care task in the last 90
        days. PEPM rate: $4.50/employee/month.
      </p>
    </div>
  );
}
