/**
 * BillingDashboard — Transaction history, category breakdown, HSA/FSA summary
 *
 * Shows all payment activity for a family with monthly/annual aggregations
 * and HSA/FSA eligibility indicators.
 */
import { useState } from 'react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amountCents: number;
  hsaEligible: boolean;
}

interface CategoryBreakdown {
  category: string;
  label: string;
  totalCents: number;
  percentage: number;
  color: string;
}

interface BillingMetrics {
  totalPaidCents: number;
  hsaEligibleCents: number;
  thisMonthCents: number;
  lmnStatus: 'active' | 'expiring' | 'none';
  lmnExpiresAt?: string;
  transactions: Transaction[];
  categories: CategoryBreakdown[];
}

const MOCK_BILLING: BillingMetrics = {
  totalPaidCents: 235000,
  hsaEligibleCents: 210000,
  thisMonthCents: 19500,
  lmnStatus: 'active',
  lmnExpiresAt: '2026-09-15',
  transactions: [
    {
      id: 't1',
      date: '2026-03-05',
      description: 'Comfort Card — March',
      category: 'comfort_card',
      amountCents: 15000,
      hsaEligible: true,
    },
    {
      id: 't2',
      date: '2026-03-01',
      description: 'Time Bank Credits (3 hrs)',
      category: 'credit_purchase',
      amountCents: 4500,
      hsaEligible: true,
    },
    {
      id: 't3',
      date: '2026-02-05',
      description: 'Comfort Card — February',
      category: 'comfort_card',
      amountCents: 15000,
      hsaEligible: true,
    },
    {
      id: 't4',
      date: '2026-02-01',
      description: 'Time Bank Credits (5 hrs)',
      category: 'credit_purchase',
      amountCents: 7500,
      hsaEligible: true,
    },
    {
      id: 't5',
      date: '2026-01-15',
      description: 'Annual Membership Renewal',
      category: 'membership',
      amountCents: 10000,
      hsaEligible: true,
    },
    {
      id: 't6',
      date: '2026-01-05',
      description: 'Comfort Card — January',
      category: 'comfort_card',
      amountCents: 15000,
      hsaEligible: true,
    },
    {
      id: 't7',
      date: '2025-12-05',
      description: 'Comfort Card — December',
      category: 'comfort_card',
      amountCents: 15000,
      hsaEligible: true,
    },
    {
      id: 't8',
      date: '2025-12-01',
      description: 'Time Bank Credits (2 hrs)',
      category: 'credit_purchase',
      amountCents: 3000,
      hsaEligible: true,
    },
  ],
  categories: [
    {
      category: 'comfort_card',
      label: 'Comfort Card',
      totalCents: 150000,
      percentage: 63.8,
      color: 'bg-sage',
    },
    {
      category: 'membership',
      label: 'Membership',
      totalCents: 10000,
      percentage: 4.3,
      color: 'bg-copper',
    },
    {
      category: 'credit_purchase',
      label: 'Time Bank Credits',
      totalCents: 75000,
      percentage: 31.9,
      color: 'bg-blue-500',
    },
  ],
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

export function BillingDashboard() {
  const [metrics] = useState<BillingMetrics>(MOCK_BILLING);
  const [filter, setFilter] = useState<string>('all');

  const filtered =
    filter === 'all'
      ? metrics.transactions
      : metrics.transactions.filter((t) => t.category === filter);

  const hsaPercentage =
    metrics.totalPaidCents > 0
      ? Math.round((metrics.hsaEligibleCents / metrics.totalPaidCents) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Billing & Payments</h1>
        <p className="text-sm text-muted">Transaction history and HSA/FSA eligibility</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Total Paid (YTD)</p>
          <p className="text-2xl font-bold text-primary">{formatCents(metrics.totalPaidCents)}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">HSA/FSA Eligible</p>
          <p className="text-2xl font-bold text-sage">{formatCents(metrics.hsaEligibleCents)}</p>
          <p className="text-[11px] text-muted">{hsaPercentage}% of total</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">This Month</p>
          <p className="text-2xl font-bold text-secondary">{formatCents(metrics.thisMonthCents)}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">LMN Status</p>
          <p
            className={`text-lg font-bold ${metrics.lmnStatus === 'active' ? 'text-zone-green' : metrics.lmnStatus === 'expiring' ? 'text-zone-yellow' : 'text-zone-red'}`}
          >
            {metrics.lmnStatus === 'active'
              ? 'Active'
              : metrics.lmnStatus === 'expiring'
                ? 'Expiring'
                : 'None'}
          </p>
          {metrics.lmnExpiresAt && (
            <p className="text-[11px] text-muted">Expires {formatDate(metrics.lmnExpiresAt)}</p>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="rounded-xl border border-border bg-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-primary">Spending by Category</h2>
        <div className="mb-4 flex h-4 w-full overflow-hidden rounded-full">
          {metrics.categories.map((c) => (
            <div
              key={c.category}
              className={`${c.color} h-full`}
              style={{ width: `${c.percentage}%` }}
              title={`${c.label}: ${formatCents(c.totalCents)}`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          {metrics.categories.map((c) => (
            <div key={c.category} className="flex items-center gap-2 text-xs">
              <span className={`inline-block h-2 w-4 rounded ${c.color}`} />
              <span className="text-secondary">{c.label}</span>
              <span className="font-medium text-primary">{formatCents(c.totalCents)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-xl border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold text-primary">Transactions</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-secondary"
          >
            <option value="all">All Categories</option>
            <option value="comfort_card">Comfort Card</option>
            <option value="credit_purchase">Time Bank Credits</option>
            <option value="membership">Membership</option>
          </select>
        </div>
        <div className="divide-y divide-border">
          {filtered.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white ${
                    t.category === 'comfort_card'
                      ? 'bg-sage'
                      : t.category === 'membership'
                        ? 'bg-copper'
                        : 'bg-blue-500'
                  }`}
                >
                  {t.category === 'comfort_card' ? 'CC' : t.category === 'membership' ? 'M' : 'TB'}
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">{t.description}</p>
                  <p className="text-xs text-muted">{formatDate(t.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">{formatCents(t.amountCents)}</p>
                {t.hsaEligible && (
                  <span className="text-[10px] font-medium text-sage">HSA Eligible</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex gap-3">
        <a
          href="#/billing/tax-statement"
          className="flex-1 rounded-xl border border-border bg-white p-4 text-center transition-colors hover:bg-warm-gray/20"
        >
          <p className="text-sm font-medium text-primary">Tax Statement</p>
          <p className="text-xs text-muted">Annual HSA/FSA summary</p>
        </a>
        <a
          href="#/billing/comfort-card"
          className="flex-1 rounded-xl border border-border bg-white p-4 text-center transition-colors hover:bg-warm-gray/20"
        >
          <p className="text-sm font-medium text-primary">Comfort Card</p>
          <p className="text-xs text-muted">Balance & settings</p>
        </a>
      </div>

      <p className="text-[11px] text-muted">
        HSA/FSA eligibility requires an active Letter of Medical Necessity (LMN) on file. Consult
        your tax advisor for specific eligibility questions.
      </p>
    </div>
  );
}
