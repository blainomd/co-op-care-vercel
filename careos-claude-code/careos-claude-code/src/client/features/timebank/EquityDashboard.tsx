/**
 * EquityDashboard — Worker-owner equity position, dividend history, vesting
 *
 * Shows cooperatively earned equity through patronage (hours worked).
 * Transparent, warm presentation of Subchapter T mechanics.
 */
import { useState } from 'react';

interface VestingMilestone {
  year: number;
  percentageVested: number;
  amountCents: number;
  status: 'completed' | 'current' | 'future';
}

interface PatronageDividend {
  year: number;
  totalPatronageHours: number;
  memberShareCents: number;
  paidCashCents: number;
  retainedEquityCents: number;
}

interface EquityData {
  memberSince: string;
  totalEquityCents: number;
  vestedEquityCents: number;
  unvestedCents: number;
  vestingPercentage: number;
  yearsCompleted: number;
  fullyVested: boolean;
  nextVestingDate: string | null;
  milestones: VestingMilestone[];
  dividends: PatronageDividend[];
  estimatedAnnualDividendCents: number;
  hourlyEquityRateCents: number;
  currentYearHours: number;
}

const MOCK_EQUITY: EquityData = {
  memberSince: '2024-06-15',
  totalEquityCents: 1560000,
  vestedEquityCents: 312000,
  unvestedCents: 1248000,
  vestingPercentage: 20,
  yearsCompleted: 1,
  fullyVested: false,
  nextVestingDate: '2026-06-15',
  milestones: [
    { year: 1, percentageVested: 20, amountCents: 312000, status: 'completed' },
    { year: 2, percentageVested: 40, amountCents: 624000, status: 'current' },
    { year: 3, percentageVested: 60, amountCents: 936000, status: 'future' },
    { year: 4, percentageVested: 80, amountCents: 1248000, status: 'future' },
    { year: 5, percentageVested: 100, amountCents: 1560000, status: 'future' },
  ],
  dividends: [
    {
      year: 2025,
      totalPatronageHours: 1200,
      memberShareCents: 780000,
      paidCashCents: 156000,
      retainedEquityCents: 624000,
    },
    {
      year: 2024,
      totalPatronageHours: 780,
      memberShareCents: 780000,
      paidCashCents: 156000,
      retainedEquityCents: 624000,
    },
  ],
  estimatedAnnualDividendCents: 1040000,
  hourlyEquityRateCents: 693,
  currentYearHours: 340,
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function EquityDashboard() {
  const [equity] = useState<EquityData>(MOCK_EQUITY);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Your Equity</h1>
        <p className="text-sm text-muted">
          Worker-owner equity earned through care — member since {formatDate(equity.memberSince)}
        </p>
      </div>

      {/* Equity Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Total Equity</p>
          <p className="text-2xl font-bold text-primary">{formatCents(equity.totalEquityCents)}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Vested</p>
          <p className="text-2xl font-bold text-sage">{formatCents(equity.vestedEquityCents)}</p>
          <p className="text-[11px] text-muted">{equity.vestingPercentage}% vested</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Est. Annual Dividend</p>
          <p className="text-2xl font-bold text-secondary">
            {formatCents(equity.estimatedAnnualDividendCents)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Equity Rate</p>
          <p className="text-2xl font-bold text-copper">
            {formatCents(equity.hourlyEquityRateCents)}/hr
          </p>
          <p className="text-[11px] text-muted">{equity.currentYearHours} hrs this year</p>
        </div>
      </div>

      {/* Vesting Progress */}
      <div className="rounded-xl border border-border bg-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-primary">Vesting Schedule</h2>
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-xs text-muted">
            <span>{equity.vestingPercentage}% vested</span>
            <span>100%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-warm-gray/20">
            <div
              className="h-3 rounded-full bg-sage transition-all"
              style={{ width: `${equity.vestingPercentage}%` }}
            />
          </div>
        </div>
        {equity.nextVestingDate && (
          <p className="mb-4 text-xs text-muted">
            Next vesting milestone: {formatDate(equity.nextVestingDate)}
          </p>
        )}
        <div className="grid gap-2 md:grid-cols-5">
          {equity.milestones.map((m) => (
            <div
              key={m.year}
              className={`rounded-lg border p-3 text-center ${
                m.status === 'completed'
                  ? 'border-sage/30 bg-sage/10'
                  : m.status === 'current'
                    ? 'border-copper/30 bg-copper/10'
                    : 'border-border bg-warm-gray/10'
              }`}
            >
              <p className="text-[11px] text-muted">Year {m.year}</p>
              <p
                className={`text-sm font-bold ${
                  m.status === 'completed'
                    ? 'text-sage'
                    : m.status === 'current'
                      ? 'text-copper'
                      : 'text-muted'
                }`}
              >
                {m.percentageVested}%
              </p>
              <p className="text-[11px] text-secondary">{formatCents(m.amountCents)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Patronage Dividends */}
      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold text-primary">Patronage Dividends</h2>
          <p className="text-xs text-muted">Annual distributions based on your hours of care</p>
        </div>
        <div className="divide-y divide-border">
          {equity.dividends.map((d) => (
            <div key={d.year} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">{d.year} Dividend</p>
                  <p className="text-xs text-muted">
                    {d.totalPatronageHours.toLocaleString()} patronage hours
                  </p>
                </div>
                <p className="text-sm font-bold text-primary">{formatCents(d.memberShareCents)}</p>
              </div>
              <div className="mt-2 flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-sage" />
                  <span className="text-muted">Cash: {formatCents(d.paidCashCents)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-copper" />
                  <span className="text-muted">Retained: {formatCents(d.retainedEquityCents)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="rounded-xl border border-border bg-sage/5 p-4 md:p-6">
        <h2 className="mb-3 text-lg font-semibold text-primary">How Cooperative Equity Works</h2>
        <div className="space-y-2 text-sm text-secondary">
          <p>
            As a worker-owner, you earn equity through <strong>patronage</strong> — the hours of
            care you provide.
          </p>
          <p>
            Each year, the cooperative distributes surplus to members based on hours worked. At
            least 20% is paid in cash; the rest is retained as your equity in the cooperative.
          </p>
          <p>
            Your equity vests over 5 years (20% per year). Fully vested equity is yours if you leave
            the cooperative.
          </p>
        </div>
      </div>

      <p className="text-[11px] text-muted">
        Equity calculations are based on Subchapter T of the Internal Revenue Code. Patronage
        dividends are distributed annually after the fiscal year close. Consult your tax advisor for
        specific questions about cooperative equity taxation.
      </p>
    </div>
  );
}
