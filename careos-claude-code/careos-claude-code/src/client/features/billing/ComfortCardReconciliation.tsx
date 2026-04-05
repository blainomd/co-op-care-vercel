/**
 * ComfortCardReconciliation — Comfort Card payment reconciliation
 *
 * Shows how care expenses are split across payment sources:
 * HSA/FSA (pre-tax), Employer Benefit, Time Bank, Private Pay.
 * Monthly breakdown with transaction detail and tax savings summary.
 */
import { useState } from 'react';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

interface PaymentSource {
  key: string;
  label: string;
  amount: number;
  percentage: number;
  color: string;
  bgColor: string;
  dotColor: string;
  description: string;
}

interface ReconciliationTransaction {
  id: string;
  date: string;
  service: string;
  provider: string;
  total: number;
  hsa: number;
  employer: number;
  timeBankHours: number;
  privatePay: number;
}

interface MonthlyData {
  total: number;
  sources: PaymentSource[];
  transactions: ReconciliationTransaction[];
  reconciled: boolean;
  pendingCount: number;
}

interface YtdMonth {
  month: string;
  hsa: number;
  employer: number;
  timeBank: number;
  privatePay: number;
}

const MOCK_TRANSACTIONS: ReconciliationTransaction[] = [
  {
    id: 'r1',
    date: '2026-03-02',
    service: 'Companion Visit — 3 hrs',
    provider: 'Maria S.',
    total: 105,
    hsa: 105,
    employer: 0,
    timeBankHours: 0,
    privatePay: 0,
  },
  {
    id: 'r2',
    date: '2026-03-05',
    service: 'Light Housekeeping — 2 hrs',
    provider: 'James K.',
    total: 70,
    hsa: 0,
    employer: 0,
    timeBankHours: 0,
    privatePay: 70,
  },
  {
    id: 'r3',
    date: '2026-03-07',
    service: 'Companion Visit — 4 hrs',
    provider: 'Maria S.',
    total: 140,
    hsa: 140,
    employer: 0,
    timeBankHours: 0,
    privatePay: 0,
  },
  {
    id: 'r4',
    date: '2026-03-10',
    service: 'Wellness Session — 1 hr',
    provider: 'Dr. Chen',
    total: 85,
    hsa: 85,
    employer: 0,
    timeBankHours: 0,
    privatePay: 0,
  },
  {
    id: 'r5',
    date: '2026-03-12',
    service: 'Transportation — 2 trips',
    provider: 'Robert L.',
    total: 48,
    hsa: 0,
    employer: 48,
    timeBankHours: 0,
    privatePay: 0,
  },
  {
    id: 'r6',
    date: '2026-03-15',
    service: 'Meal Preparation — 3 hrs',
    provider: 'James K.',
    total: 105,
    hsa: 0,
    employer: 0,
    timeBankHours: 0,
    privatePay: 105,
  },
  {
    id: 'r7',
    date: '2026-03-18',
    service: 'Companion Visit — 3 hrs',
    provider: 'Maria S.',
    total: 105,
    hsa: 90,
    employer: 0,
    timeBankHours: 0,
    privatePay: 15,
  },
  {
    id: 'r8',
    date: '2026-03-20',
    service: 'Caregiver Certification',
    provider: 'CareOS Admin',
    total: 17,
    hsa: 0,
    employer: 17,
    timeBankHours: 0,
    privatePay: 0,
  },
  {
    id: 'r9',
    date: '2026-03-23',
    service: 'Companion Visit — 4 hrs',
    provider: 'Maria S.',
    total: 140,
    hsa: 0,
    employer: 0,
    timeBankHours: 0,
    privatePay: 140,
  },
  {
    id: 'r10',
    date: '2026-03-28',
    service: 'Wellness Session — 1.5 hrs',
    provider: 'Dr. Chen',
    total: 118,
    hsa: 0,
    employer: 0,
    timeBankHours: 0,
    privatePay: 118,
  },
];

const MOCK_MONTHLY: MonthlyData = {
  total: 1233,
  sources: [
    {
      key: 'hsa',
      label: 'HSA/FSA',
      amount: 420,
      percentage: 34,
      color: 'text-sage',
      bgColor: 'bg-sage',
      dotColor: 'bg-sage',
      description: 'Pre-tax, LMN-eligible',
    },
    {
      key: 'employer',
      label: 'Employer Benefit',
      amount: 65,
      percentage: 5,
      color: 'text-gold',
      bgColor: 'bg-gold',
      dotColor: 'bg-gold',
      description: 'BVSD caregiver benefit',
    },
    {
      key: 'timeBank',
      label: 'Time Bank',
      amount: 0,
      percentage: 0,
      color: 'text-copper',
      bgColor: 'bg-copper',
      dotColor: 'bg-copper',
      description: 'Community hours used',
    },
    {
      key: 'privatePay',
      label: 'Private Pay',
      amount: 748,
      percentage: 61,
      color: 'text-warm-gray',
      bgColor: 'bg-warm-gray',
      dotColor: 'bg-warm-gray',
      description: 'Post-tax',
    },
  ],
  transactions: MOCK_TRANSACTIONS,
  reconciled: true,
  pendingCount: 0,
};

const YTD_SPENDING: YtdMonth[] = [
  { month: 'Jan', hsa: 380, employer: 65, timeBank: 30, privatePay: 690 },
  { month: 'Feb', hsa: 410, employer: 65, timeBank: 15, privatePay: 720 },
  { month: 'Mar', hsa: 420, employer: 65, timeBank: 0, privatePay: 748 },
];

const FEDERAL_RATE = 0.24;
const FICA_RATE = 0.0765;
const STATE_RATE = 0.044;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function ComfortCardReconciliation() {
  const [selectedMonth, setSelectedMonth] = useState(2); // March (0-indexed)
  const [data] = useState<MonthlyData>(MOCK_MONTHLY);

  const ytdHsa = YTD_SPENDING.reduce((sum, m) => sum + m.hsa, 0);
  const federalSavings = ytdHsa * FEDERAL_RATE;
  const ficaSavings = ytdHsa * FICA_RATE;
  const stateSavings = ytdHsa * STATE_RATE;
  const totalTaxSavings = federalSavings + ficaSavings + stateSavings;
  const effectiveDiscount = ytdHsa > 0 ? (totalTaxSavings / ytdHsa) * 100 : 0;

  const ytdMax = Math.max(
    ...YTD_SPENDING.map((m) => m.hsa + m.employer + m.timeBank + m.privatePay),
    1,
  );

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Payment Reconciliation</h1>
        <p className="text-sm text-muted">
          How your care expenses are split across payment sources
        </p>
      </div>

      {/* Month Selector Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-white p-1">
        {MONTHS.map((month, idx) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(idx)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
              idx === selectedMonth
                ? 'bg-sage text-white'
                : idx <= 2
                  ? 'text-secondary hover:bg-warm-gray/10'
                  : 'cursor-not-allowed text-muted/40'
            }`}
            disabled={idx > 2}
          >
            {month}
          </button>
        ))}
      </div>

      {/* Total Spend Card */}
      <div className="rounded-xl border-2 border-sage bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">{MONTHS[selectedMonth]} 2026 Total</p>
            <p className="text-3xl font-bold text-primary">${data.total.toLocaleString()}</p>
          </div>
          {/* Comfort Card icon */}
          <div className="rounded-lg bg-sage/10 p-2">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-sage"
            >
              <rect x="1" y="4" width="22" height="16" rx="3" />
              <line x1="1" y1="10" x2="23" y2="10" />
              <line x1="6" y1="15" x2="6" y2="15.01" />
              <line x1="10" y1="15" x2="14" y2="15" />
            </svg>
          </div>
        </div>

        {/* Breakdown Bar */}
        <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full">
          {data.sources
            .filter((s) => s.percentage > 0)
            .map((source) => (
              <div
                key={source.key}
                className={`${source.bgColor} h-full`}
                style={{ width: `${source.percentage}%` }}
                title={`${source.label}: ${formatCurrency(source.amount)} (${source.percentage}%)`}
              />
            ))}
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {data.sources.map((source) => (
            <div key={source.key} className="flex items-center gap-1.5 text-xs">
              <span className={`inline-block h-2 w-3 rounded ${source.dotColor}`} />
              <span className="text-muted">{source.label}</span>
              <span className={`font-medium ${source.color}`}>{source.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Source Cards */}
      <div className="grid grid-cols-2 gap-3">
        {data.sources.map((source) => (
          <div key={source.key} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${source.dotColor}`} />
              <p className="text-xs font-medium text-muted">{source.label}</p>
            </div>
            <p className={`mt-1 text-xl font-bold ${source.color}`}>
              {formatCurrency(source.amount)}
            </p>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-[11px] text-muted">{source.description}</p>
              <p className={`text-xs font-medium ${source.color}`}>{source.percentage}%</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reconciliation Status */}
      <div
        className={`flex items-center justify-between rounded-xl border p-3 ${
          data.reconciled ? 'border-sage/30 bg-sage/5' : 'border-gold/30 bg-gold/5'
        }`}
      >
        <div className="flex items-center gap-2">
          {data.reconciled ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-sage"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gold"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          <div>
            <p className={`text-sm font-medium ${data.reconciled ? 'text-sage' : 'text-gold'}`}>
              {data.reconciled
                ? 'All transactions reconciled'
                : `${data.pendingCount} transaction${data.pendingCount !== 1 ? 's' : ''} pending`}
            </p>
            <p className="text-[11px] text-muted">
              {data.reconciled
                ? 'All payment sources verified for this month'
                : 'Review and confirm pending transactions'}
            </p>
          </div>
        </div>
        {!data.reconciled && (
          <button className="rounded-lg bg-gold px-3 py-1.5 text-xs font-medium text-white hover:bg-gold/90">
            Review
          </button>
        )}
      </div>

      {/* Transaction Detail Table */}
      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border p-4">
          <h2 className="text-sm font-semibold text-primary">Transaction Detail</h2>
          <p className="text-xs text-muted">Payment source allocation per transaction</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-warm-gray/5">
                <th className="px-3 py-2 font-medium text-muted">Date</th>
                <th className="px-3 py-2 font-medium text-muted">Service</th>
                <th className="px-3 py-2 font-medium text-muted">Provider</th>
                <th className="px-3 py-2 text-right font-medium text-muted">Total</th>
                <th className="px-3 py-2 text-right font-medium text-sage">HSA</th>
                <th className="px-3 py-2 text-right font-medium text-gold">Employer</th>
                <th className="px-3 py-2 text-right font-medium text-copper">TB hrs</th>
                <th className="px-3 py-2 text-right font-medium text-warm-gray">Private</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-warm-gray/5">
                  <td className="whitespace-nowrap px-3 py-2.5 text-secondary">
                    {formatDate(txn.date)}
                  </td>
                  <td className="px-3 py-2.5 text-primary">{txn.service}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-secondary">{txn.provider}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-medium text-primary">
                    ${txn.total}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-2.5 text-right ${txn.hsa > 0 ? 'font-medium text-sage' : 'text-muted'}`}
                  >
                    {txn.hsa > 0 ? `$${txn.hsa}` : '--'}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-2.5 text-right ${txn.employer > 0 ? 'font-medium text-gold' : 'text-muted'}`}
                  >
                    {txn.employer > 0 ? `$${txn.employer}` : '--'}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-2.5 text-right ${txn.timeBankHours > 0 ? 'font-medium text-copper' : 'text-muted'}`}
                  >
                    {txn.timeBankHours > 0 ? `${txn.timeBankHours}h` : '--'}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-2.5 text-right ${txn.privatePay > 0 ? 'font-medium text-warm-gray' : 'text-muted'}`}
                  >
                    {txn.privatePay > 0 ? `$${txn.privatePay}` : '--'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-warm-gray/5">
                <td colSpan={3} className="px-3 py-2.5 text-xs font-semibold text-primary">
                  Month Total
                </td>
                <td className="px-3 py-2.5 text-right text-xs font-bold text-primary">
                  ${data.transactions.reduce((s, t) => s + t.total, 0).toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right text-xs font-bold text-sage">
                  ${data.transactions.reduce((s, t) => s + t.hsa, 0).toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right text-xs font-bold text-gold">
                  ${data.transactions.reduce((s, t) => s + t.employer, 0).toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right text-xs font-bold text-copper">
                  {data.transactions.reduce((s, t) => s + t.timeBankHours, 0) > 0
                    ? `${data.transactions.reduce((s, t) => s + t.timeBankHours, 0)}h`
                    : '--'}
                </td>
                <td className="px-3 py-2.5 text-right text-xs font-bold text-warm-gray">
                  ${data.transactions.reduce((s, t) => s + t.privatePay, 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Tax Savings Summary */}
      <div className="rounded-xl border-2 border-sage bg-white p-4">
        <div className="flex items-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-sage"
          >
            <path d="M12 1v22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <h2 className="text-sm font-semibold text-primary">Tax Savings Summary (YTD)</h2>
        </div>

        <div className="mt-4 text-center">
          <p className="text-3xl font-bold text-sage">
            ${Math.round(totalTaxSavings).toLocaleString()}
          </p>
          <p className="text-xs text-muted">estimated tax savings year-to-date</p>
          <p className="mt-1 text-[11px] text-secondary">
            {effectiveDiscount.toFixed(1)}% effective discount on ${ytdHsa.toLocaleString()} HSA/FSA
            spend
          </p>
        </div>

        <div className="mt-4 space-y-2 border-t border-border pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary">Total HSA/FSA Used (YTD)</span>
            <span className="font-medium text-primary">${ytdHsa.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary">Federal Tax Savings (24%)</span>
            <span className="font-medium text-sage">
              ${Math.round(federalSavings).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary">FICA Savings (7.65%)</span>
            <span className="font-medium text-sage">
              ${Math.round(ficaSavings).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary">Colorado State Tax (4.4%)</span>
            <span className="font-medium text-sage">
              ${Math.round(stateSavings).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
            <span className="font-semibold text-primary">Total Tax Savings</span>
            <span className="font-bold text-sage">
              ${Math.round(totalTaxSavings).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Year-to-Date Spending Trend */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-primary">Year-to-Date Spending Trend</h2>
        <div className="space-y-3">
          {YTD_SPENDING.map((month) => {
            const total = month.hsa + month.employer + month.timeBank + month.privatePay;
            const barWidth = (total / ytdMax) * 100;
            return (
              <div key={month.month}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="w-8 font-medium text-secondary">{month.month}</span>
                  <span className="text-muted">${total.toLocaleString()}</span>
                </div>
                <div className="flex h-5 overflow-hidden rounded" style={{ width: `${barWidth}%` }}>
                  {month.hsa > 0 && (
                    <div
                      className="bg-sage h-full"
                      style={{ width: `${(month.hsa / total) * 100}%` }}
                      title={`HSA: $${month.hsa}`}
                    />
                  )}
                  {month.employer > 0 && (
                    <div
                      className="bg-gold h-full"
                      style={{ width: `${(month.employer / total) * 100}%` }}
                      title={`Employer: $${month.employer}`}
                    />
                  )}
                  {month.timeBank > 0 && (
                    <div
                      className="bg-copper h-full"
                      style={{ width: `${(month.timeBank / total) * 100}%` }}
                      title={`Time Bank: $${month.timeBank}`}
                    />
                  )}
                  {month.privatePay > 0 && (
                    <div
                      className="bg-warm-gray h-full"
                      style={{ width: `${(month.privatePay / total) * 100}%` }}
                      title={`Private Pay: $${month.privatePay}`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Chart Legend */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="inline-block h-2 w-3 rounded bg-sage" />
            <span className="text-muted">HSA/FSA</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="inline-block h-2 w-3 rounded bg-gold" />
            <span className="text-muted">Employer</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="inline-block h-2 w-3 rounded bg-copper" />
            <span className="text-muted">Time Bank</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="inline-block h-2 w-3 rounded bg-warm-gray" />
            <span className="text-muted">Private Pay</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <a
          href="#/billing/tax-statement"
          className="flex-1 rounded-xl border border-border bg-white p-3 text-center transition-colors hover:bg-warm-gray/10"
        >
          <p className="text-sm font-medium text-primary">Export Tax Report</p>
          <p className="text-[11px] text-muted">Download HSA/FSA summary</p>
        </a>
        <a
          href="#/billing/comfort-card"
          className="flex-1 rounded-xl border border-border bg-white p-3 text-center transition-colors hover:bg-warm-gray/10"
        >
          <p className="text-sm font-medium text-primary">Comfort Card</p>
          <p className="text-[11px] text-muted">Balance & settings</p>
        </a>
      </div>

      <p className="text-[11px] text-muted">
        Tax savings are estimates based on the 24% federal bracket. Consult a tax professional for
        specific advice. HSA contribution limits apply ($4,300 individual / $8,550 family for 2026).
      </p>
    </div>
  );
}
