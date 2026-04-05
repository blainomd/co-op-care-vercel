/**
 * EmployerDashboard — Aggregate anonymized view for employer sponsors
 *
 * CII zone distribution, engagement metrics, key stats.
 * No PHI — only anonymized/aggregate data.
 */
import { useState } from 'react';

interface CIIDistribution {
  green: number | null;
  yellow: number | null;
  red: number | null;
  total: number;
  suppressed: boolean;
}

interface PEPMMetrics {
  enrolledEmployees: number;
  activeUtilizers: number;
  utilizationRate: number;
  monthlyPEPMCents: number;
  totalMonthlyRevenueCents: number;
  totalAnnualRevenueCents: number;
}

interface ProductivityImpact {
  totalCareHours: number;
  estimatedAbsenteeismReduction: number;
  productivityValueCents: number;
  readmissionAvoidanceCount: number;
  readmissionSavingsCents: number;
  totalROICents: number;
}

const MOCK_CII: CIIDistribution = {
  green: 32,
  yellow: 22,
  red: 13,
  total: 67,
  suppressed: false,
};

const MOCK_PEPM: PEPMMetrics = {
  enrolledEmployees: 67,
  activeUtilizers: 41,
  utilizationRate: 61.2,
  monthlyPEPMCents: 450,
  totalMonthlyRevenueCents: 30150,
  totalAnnualRevenueCents: 361800,
};

const MOCK_PRODUCTIVITY: ProductivityImpact = {
  totalCareHours: 1240,
  estimatedAbsenteeismReduction: 620,
  productivityValueCents: 4340000,
  readmissionAvoidanceCount: 1.9,
  readmissionSavingsCents: 3047030,
  totalROICents: 7387030,
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function EmployerDashboard() {
  const [cii] = useState<CIIDistribution>(MOCK_CII);
  const [pepm] = useState<PEPMMetrics>(MOCK_PEPM);
  const [productivity] = useState<ProductivityImpact>(MOCK_PRODUCTIVITY);

  // Donut chart calculations
  const greenPct = cii.total > 0 && cii.green !== null ? (cii.green / cii.total) * 100 : 0;
  const yellowPct = cii.total > 0 && cii.yellow !== null ? (cii.yellow / cii.total) * 100 : 0;
  const redPct = cii.total > 0 && cii.red !== null ? (cii.red / cii.total) * 100 : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Employer Dashboard</h1>
        <p className="text-sm text-muted">Aggregate anonymized workforce care metrics</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Enrolled Employees"
          value={String(pepm.enrolledEmployees)}
          color="text-sage"
        />
        <StatCard
          label="Active Utilizers"
          value={String(pepm.activeUtilizers)}
          sub={`${pepm.utilizationRate}% utilization`}
          color="text-copper"
        />
        <StatCard
          label="Monthly PEPM"
          value={formatCents(pepm.monthlyPEPMCents)}
          sub="per employee"
          color="text-blue-600"
        />
        <StatCard
          label="Care Hours"
          value={String(productivity.totalCareHours)}
          sub="total delivered"
          color="text-gold"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* CII Zone Distribution */}
        <div className="rounded-xl border border-border bg-white p-4 md:p-6">
          <h2 className="mb-4 text-lg font-semibold text-primary">CII Zone Distribution</h2>
          {cii.suppressed ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted">
              Some categories suppressed (k-anonymity, min group size 5)
            </div>
          ) : (
            <>
              {/* Simple horizontal bar chart */}
              <div className="mb-4 flex h-6 overflow-hidden rounded-full">
                <div className="bg-zone-green" style={{ width: `${greenPct}%` }} />
                <div className="bg-gold" style={{ width: `${yellowPct}%` }} />
                <div className="bg-zone-red" style={{ width: `${redPct}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <ZoneStat
                  label="Green (≤40)"
                  count={cii.green}
                  pct={greenPct}
                  color="text-zone-green"
                  bg="bg-zone-green/10"
                />
                <ZoneStat
                  label="Yellow (41-79)"
                  count={cii.yellow}
                  pct={yellowPct}
                  color="text-gold"
                  bg="bg-gold/10"
                />
                <ZoneStat
                  label="Red (≥80)"
                  count={cii.red}
                  pct={redPct}
                  color="text-zone-red"
                  bg="bg-zone-red/10"
                />
              </div>
            </>
          )}
          <p className="mt-3 text-[11px] text-muted">
            Caregiver Impact Index — anonymized aggregate. No individual data shown.
          </p>
        </div>

        {/* Productivity Impact */}
        <div className="rounded-xl border border-border bg-white p-4 md:p-6">
          <h2 className="mb-4 text-lg font-semibold text-primary">Productivity Impact</h2>
          <div className="space-y-3">
            <ImpactRow
              label="Absenteeism Reduction"
              value={`${productivity.estimatedAbsenteeismReduction}h`}
              sub="estimated hours saved"
            />
            <ImpactRow
              label="Productivity Value"
              value={formatCents(productivity.productivityValueCents)}
              sub="care hours × private rate"
            />
            <ImpactRow
              label="Readmission Avoidance"
              value={formatCents(productivity.readmissionSavingsCents)}
              sub={`${productivity.readmissionAvoidanceCount} prevented`}
            />
            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">Total ROI</span>
                <span className="text-xl font-bold text-sage">
                  {formatCents(productivity.totalROICents)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-3 md:grid-cols-2">
        <a
          href="#/employer/roi"
          className="group flex items-center gap-3 rounded-xl border border-border bg-white p-4 transition-colors hover:border-sage/40 hover:bg-sage/5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/10 text-sage">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-primary group-hover:text-sage">
              Quarterly ROI Report
            </p>
            <p className="text-xs text-muted">Detailed quarterly breakdown</p>
          </div>
        </a>
        <a
          href="#/employer/enrollment"
          className="group flex items-center gap-3 rounded-xl border border-border bg-white p-4 transition-colors hover:border-sage/40 hover:bg-sage/5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/10 text-sage">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-primary group-hover:text-sage">
              Enrollment Status
            </p>
            <p className="text-xs text-muted">Employee enrollment and utilization</p>
          </div>
        </a>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted">{sub}</p>}
    </div>
  );
}

function ZoneStat({
  label,
  count,
  pct,
  color,
  bg,
}: {
  label: string;
  count: number | null;
  pct: number;
  color: string;
  bg: string;
}) {
  return (
    <div className={`rounded-lg p-3 ${bg}`}>
      <p className={`text-lg font-bold ${color}`}>{count ?? '—'}</p>
      <p className="text-[11px] text-muted">{label}</p>
      <p className={`text-xs font-medium ${color}`}>{Math.round(pct)}%</p>
    </div>
  );
}

function ImpactRow({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-secondary">{label}</p>
        <p className="text-[11px] text-muted">{sub}</p>
      </div>
      <span className="text-sm font-semibold text-primary">{value}</span>
    </div>
  );
}
