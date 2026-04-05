/**
 * ROIReport — Quarterly ROI breakdown for employer sponsors
 *
 * Shows quarterly: PEPM revenue, care hours, productivity value,
 * readmission savings, net ROI, ROI multiple.
 */
import { useState } from 'react';

interface QuarterlyROI {
  quarter: string;
  enrolledEmployees: number;
  careHoursDelivered: number;
  pepmRevenueCents: number;
  productivityValueCents: number;
  readmissionSavingsCents: number;
  netROICents: number;
  roiMultiple: number;
}

const MOCK_QUARTERS: QuarterlyROI[] = [
  {
    quarter: 'Q2 2025',
    enrolledEmployees: 45,
    careHoursDelivered: 180,
    pepmRevenueCents: 60750,
    productivityValueCents: 630000,
    readmissionSavingsCents: 444226,
    netROICents: 1013476,
    roiMultiple: 1.77,
  },
  {
    quarter: 'Q3 2025',
    enrolledEmployees: 52,
    careHoursDelivered: 290,
    pepmRevenueCents: 70200,
    productivityValueCents: 1015000,
    readmissionSavingsCents: 715767,
    netROICents: 1660567,
    roiMultiple: 2.46,
  },
  {
    quarter: 'Q4 2025',
    enrolledEmployees: 60,
    careHoursDelivered: 380,
    pepmRevenueCents: 81000,
    productivityValueCents: 1330000,
    readmissionSavingsCents: 937807,
    netROICents: 2186807,
    roiMultiple: 2.8,
  },
  {
    quarter: 'Q1 2026',
    enrolledEmployees: 67,
    careHoursDelivered: 390,
    pepmRevenueCents: 90450,
    productivityValueCents: 1365000,
    readmissionSavingsCents: 962497,
    netROICents: 2237047,
    roiMultiple: 2.57,
  },
];

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function ROIReport() {
  const [quarters] = useState<QuarterlyROI[]>(MOCK_QUARTERS);

  const totals = quarters.reduce(
    (acc, q) => ({
      careHours: acc.careHours + q.careHoursDelivered,
      pepmRevenue: acc.pepmRevenue + q.pepmRevenueCents,
      productivity: acc.productivity + q.productivityValueCents,
      readmission: acc.readmission + q.readmissionSavingsCents,
      netROI: acc.netROI + q.netROICents,
    }),
    { careHours: 0, pepmRevenue: 0, productivity: 0, readmission: 0, netROI: 0 },
  );

  const overallMultiple =
    totals.pepmRevenue > 0
      ? Math.round(((totals.productivity + totals.readmission) / totals.pepmRevenue) * 100) / 100
      : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Quarterly ROI Report</h1>
        <p className="text-sm text-muted">
          Return on investment from employer-sponsored companion care
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Total PEPM Cost</p>
          <p className="text-xl font-bold text-secondary">{formatCents(totals.pepmRevenue)}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Productivity Value</p>
          <p className="text-xl font-bold text-sage">{formatCents(totals.productivity)}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Readmission Savings</p>
          <p className="text-xl font-bold text-copper">{formatCents(totals.readmission)}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Overall ROI</p>
          <p
            className={`text-xl font-bold ${overallMultiple > 1 ? 'text-zone-green' : 'text-zone-red'}`}
          >
            {overallMultiple}x
          </p>
        </div>
      </div>

      {/* Quarterly Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-warm-gray/20">
              <th className="px-4 py-3 text-left font-medium text-secondary">Quarter</th>
              <th className="px-4 py-3 text-right font-medium text-secondary">Enrolled</th>
              <th className="px-4 py-3 text-right font-medium text-secondary">Care Hours</th>
              <th className="px-4 py-3 text-right font-medium text-secondary">PEPM Cost</th>
              <th className="hidden px-4 py-3 text-right font-medium text-secondary md:table-cell">
                Productivity
              </th>
              <th className="hidden px-4 py-3 text-right font-medium text-secondary md:table-cell">
                Readmission
              </th>
              <th className="px-4 py-3 text-right font-medium text-secondary">Net ROI</th>
              <th className="px-4 py-3 text-right font-medium text-secondary">Multiple</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {quarters.map((q) => (
              <tr key={q.quarter} className="transition-colors hover:bg-warm-gray/10">
                <td className="px-4 py-3 font-medium text-primary">{q.quarter}</td>
                <td className="px-4 py-3 text-right text-secondary">{q.enrolledEmployees}</td>
                <td className="px-4 py-3 text-right text-secondary">{q.careHoursDelivered}</td>
                <td className="px-4 py-3 text-right text-secondary">
                  {formatCents(q.pepmRevenueCents)}
                </td>
                <td className="hidden px-4 py-3 text-right text-sage md:table-cell">
                  {formatCents(q.productivityValueCents)}
                </td>
                <td className="hidden px-4 py-3 text-right text-copper md:table-cell">
                  {formatCents(q.readmissionSavingsCents)}
                </td>
                <td
                  className={`px-4 py-3 text-right font-semibold ${q.netROICents > 0 ? 'text-zone-green' : 'text-zone-red'}`}
                >
                  {formatCents(q.netROICents)}
                </td>
                <td
                  className={`px-4 py-3 text-right font-bold ${q.roiMultiple > 1 ? 'text-zone-green' : 'text-zone-red'}`}
                >
                  {q.roiMultiple}x
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-warm-gray/10 font-semibold">
              <td className="px-4 py-3 text-primary">Total</td>
              <td className="px-4 py-3 text-right text-secondary">—</td>
              <td className="px-4 py-3 text-right text-secondary">{totals.careHours}</td>
              <td className="px-4 py-3 text-right text-secondary">
                {formatCents(totals.pepmRevenue)}
              </td>
              <td className="hidden px-4 py-3 text-right text-sage md:table-cell">
                {formatCents(totals.productivity)}
              </td>
              <td className="hidden px-4 py-3 text-right text-copper md:table-cell">
                {formatCents(totals.readmission)}
              </td>
              <td className="px-4 py-3 text-right text-zone-green">{formatCents(totals.netROI)}</td>
              <td className="px-4 py-3 text-right text-zone-green">{overallMultiple}x</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-[11px] text-muted">
        ROI methodology: Productivity value = care hours × $35/hr private rate proxy. Readmission
        avoidance based on BCH baseline (15.4% rate, $16,037/readmission). All data anonymized — no
        individual employee information disclosed.
      </p>
    </div>
  );
}
