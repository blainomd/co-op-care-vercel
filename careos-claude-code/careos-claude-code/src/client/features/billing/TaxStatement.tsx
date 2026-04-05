/**
 * TaxStatement — Annual HSA/FSA tax statement with IRS 502 categorization
 *
 * Structured for printing/PDF export. Shows monthly breakdown,
 * category totals, and IRS 502 eligible amounts.
 */
import { useState } from 'react';

interface MonthlyTax {
  month: string;
  totalCents: number;
  eligibleCents: number;
}

interface CategoryTax {
  category: string;
  label: string;
  totalCents: number;
  eligibleCents: number;
}

interface Pub502Line {
  code: string;
  name: string;
  description: string;
  amountCents: number;
}

interface TaxStatementData {
  familyName: string;
  year: number;
  totalPaidCents: number;
  hsaEligibleCents: number;
  nonEligibleCents: number;
  lmnCoverageMonths: number;
  monthlyBreakdown: MonthlyTax[];
  categoryBreakdown: CategoryTax[];
  pub502Summary: Pub502Line[];
  disclaimers: string[];
}

const MOCK_TAX: TaxStatementData = {
  familyName: 'Johnson Family',
  year: 2025,
  totalPaidCents: 285000,
  hsaEligibleCents: 260000,
  nonEligibleCents: 25000,
  lmnCoverageMonths: 10,
  monthlyBreakdown: [
    { month: '2025-01', totalCents: 25000, eligibleCents: 25000 },
    { month: '2025-02', totalCents: 19500, eligibleCents: 19500 },
    { month: '2025-03', totalCents: 0, eligibleCents: 0 },
    { month: '2025-04', totalCents: 15000, eligibleCents: 15000 },
    { month: '2025-05', totalCents: 22500, eligibleCents: 22500 },
    { month: '2025-06', totalCents: 19500, eligibleCents: 19500 },
    { month: '2025-07', totalCents: 30000, eligibleCents: 30000 },
    { month: '2025-08', totalCents: 15000, eligibleCents: 15000 },
    { month: '2025-09', totalCents: 34500, eligibleCents: 34500 },
    { month: '2025-10', totalCents: 37500, eligibleCents: 37500 },
    { month: '2025-11', totalCents: 41500, eligibleCents: 41500 },
    { month: '2025-12', totalCents: 25000, eligibleCents: 0 },
  ],
  categoryBreakdown: [
    { category: 'comfort_card', label: 'Comfort Card', totalCents: 180000, eligibleCents: 180000 },
    {
      category: 'credit_purchase',
      label: 'Time Bank Credits',
      totalCents: 75000,
      eligibleCents: 70000,
    },
    { category: 'membership', label: 'Annual Membership', totalCents: 10000, eligibleCents: 10000 },
    { category: 'private_pay', label: 'Private Pay', totalCents: 20000, eligibleCents: 0 },
  ],
  pub502Summary: [
    {
      code: 'PERSONAL_CARE',
      name: 'Home Health Aide/Personal Care',
      description: 'Personal care assistance for diagnosed medical condition',
      amountCents: 180000,
    },
    {
      code: 'CAREGIVER_TRAINING',
      name: 'Caregiver Training',
      description: 'Training for family caregivers under physician direction',
      amountCents: 40000,
    },
    {
      code: 'RESPITE_CARE',
      name: 'Respite Care',
      description: 'Temporary care to relieve primary caregiver',
      amountCents: 25000,
    },
    {
      code: 'COGNITIVE_THERAPY',
      name: 'Cognitive Therapy/Stimulation',
      description: 'Cognitive programs for dementia or brain injury',
      amountCents: 15000,
    },
  ],
  disclaimers: [
    'This statement is provided for informational purposes to assist with HSA/FSA reimbursement claims.',
    'Consult your tax advisor to confirm eligibility of specific expenses under IRS Publication 502.',
    'co.op" care is not a tax advisor and does not provide tax advice.',
    'A Letter of Medical Necessity (LMN) must be on file for companion care expenses to qualify.',
    'LMN coverage: 10 of 12 months in 2025.',
  ],
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split('-');
  const date = new Date(Number(y), Number(m) - 1);
  return date.toLocaleDateString('en-US', { month: 'short' });
}

export function TaxStatement() {
  const [data] = useState<TaxStatementData>(MOCK_TAX);
  const [selectedYear] = useState(data.year);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6 print:p-0">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Annual Tax Statement</h1>
          <p className="text-sm text-muted">HSA/FSA Eligible Expenses — {selectedYear}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sage/90 print:hidden"
        >
          Print / Save PDF
        </button>
      </div>

      {/* Statement Header */}
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-muted">Account Holder</p>
            <p className="text-lg font-semibold text-primary">{data.familyName}</p>
            <p className="text-xs text-muted">co.op.care member</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Tax Year</p>
            <p className="text-lg font-semibold text-primary">{selectedYear}</p>
            <p className="text-xs text-muted">LMN Coverage: {data.lmnCoverageMonths}/12 months</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted">Total Paid</p>
            <p className="text-xl font-bold text-primary">{formatCents(data.totalPaidCents)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">HSA/FSA Eligible</p>
            <p className="text-xl font-bold text-sage">{formatCents(data.hsaEligibleCents)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Non-Eligible</p>
            <p className="text-xl font-bold text-secondary">{formatCents(data.nonEligibleCents)}</p>
          </div>
        </div>
      </div>

      {/* IRS Publication 502 Categories */}
      <div className="rounded-xl border border-border bg-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-primary">IRS Publication 502 Categories</h2>
        <p className="mb-4 text-xs text-muted">
          Eligible medical expenses per IRS Publication 502 — Medical and Dental Expenses
        </p>
        <div className="divide-y divide-border">
          {data.pub502Summary.map((item) => (
            <div key={item.code} className="flex items-start justify-between py-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">{item.name}</p>
                <p className="text-xs text-muted">{item.description}</p>
              </div>
              <p className="ml-4 text-sm font-semibold text-sage">
                {formatCents(item.amountCents)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3">
          <p className="text-sm font-semibold text-primary">Total Eligible</p>
          <p className="text-sm font-bold text-sage">{formatCents(data.hsaEligibleCents)}</p>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="rounded-xl border border-border bg-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-primary">Monthly Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left font-medium text-secondary">Month</th>
                <th className="pb-2 text-right font-medium text-secondary">Total Paid</th>
                <th className="pb-2 text-right font-medium text-secondary">HSA Eligible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.monthlyBreakdown.map((m) => (
                <tr key={m.month}>
                  <td className="py-2 text-secondary">
                    {monthLabel(m.month)} {selectedYear}
                  </td>
                  <td className="py-2 text-right text-secondary">{formatCents(m.totalCents)}</td>
                  <td
                    className={`py-2 text-right font-medium ${m.eligibleCents > 0 ? 'text-sage' : 'text-muted'}`}
                  >
                    {formatCents(m.eligibleCents)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border font-semibold">
                <td className="pt-2 text-primary">Annual Total</td>
                <td className="pt-2 text-right text-primary">{formatCents(data.totalPaidCents)}</td>
                <td className="pt-2 text-right text-sage">{formatCents(data.hsaEligibleCents)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="rounded-xl border border-border bg-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-primary">By Payment Category</h2>
        <div className="divide-y divide-border">
          {data.categoryBreakdown.map((c) => (
            <div key={c.category} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-primary">{c.label}</p>
                <p className="text-xs text-muted">Total: {formatCents(c.totalCents)}</p>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold ${c.eligibleCents > 0 ? 'text-sage' : 'text-muted'}`}
                >
                  {formatCents(c.eligibleCents)}
                </p>
                <p className="text-[10px] text-muted">eligible</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimers */}
      <div className="rounded-xl border border-border bg-warm-gray/10 p-4">
        <h3 className="mb-2 text-xs font-semibold text-secondary">Important Information</h3>
        <ul className="space-y-1">
          {data.disclaimers.map((d, i) => (
            <li key={i} className="text-[11px] text-muted">
              {d}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
