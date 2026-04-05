/**
 * TaxCalculator — HSA/FSA tax savings estimator
 *
 * Shows families how much they save by paying for companion care
 * through HSA/FSA with a valid LMN: "$20K spend → $6-7.2K savings"
 */
import { useState } from 'react';

const TAX_BRACKETS = [
  { rate: 0.1, label: '10%', min: 0, max: 11600 },
  { rate: 0.12, label: '12%', min: 11601, max: 47150 },
  { rate: 0.22, label: '22%', min: 47151, max: 100525 },
  { rate: 0.24, label: '24%', min: 100526, max: 191950 },
  { rate: 0.32, label: '32%', min: 191951, max: 243725 },
  { rate: 0.35, label: '35%', min: 243726, max: 609350 },
  { rate: 0.37, label: '37%', min: 609351, max: Infinity },
];

const FICA_RATE = 0.0765;
const STATE_TAX_CO = 0.044;

export function TaxCalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [hourlyRate] = useState(27);
  const [taxBracketIdx, setTaxBracketIdx] = useState(3); // default 24%
  const [hasLMN, setHasLMN] = useState(true);

  const weeklySpend = hoursPerWeek * hourlyRate;
  const annualSpend = weeklySpend * 52;
  const bracket = TAX_BRACKETS[taxBracketIdx]!;

  // With LMN, payments are HSA/FSA eligible = pre-tax
  const federalSavings = hasLMN ? annualSpend * bracket.rate : 0;
  const ficaSavings = hasLMN ? annualSpend * FICA_RATE : 0;
  const stateSavings = hasLMN ? annualSpend * STATE_TAX_CO : 0;
  const totalSavings = federalSavings + ficaSavings + stateSavings;
  const effectiveRate = annualSpend > 0 ? (totalSavings / annualSpend) * 100 : 0;

  const tiers = [
    { name: 'Peace of Mind', hours: 5, desc: '~$550/mo' },
    { name: 'Regular', hours: 10, desc: '~$1,100/mo' },
    { name: 'Daily', hours: 20, desc: '~$2,200/mo' },
    { name: 'Intensive', hours: 35, desc: '~$3,850/mo' },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Tax Savings Calculator</h1>
        <p className="text-sm text-muted">
          Estimate your HSA/FSA tax savings with a Letter of Medical Necessity
        </p>
      </div>

      {/* LMN Toggle */}
      <div
        className={`rounded-xl border-2 p-4 ${hasLMN ? 'border-sage bg-sage/5' : 'border-zone-red/30 bg-zone-red/5'}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-primary">
              Letter of Medical Necessity (LMN)
            </h3>
            <p className="text-xs text-secondary">
              {hasLMN
                ? 'With an LMN, your care expenses qualify for HSA/FSA pre-tax payment'
                : 'Without an LMN, you pay with post-tax dollars — no tax savings'}
            </p>
          </div>
          <button
            onClick={() => setHasLMN(!hasLMN)}
            className={`relative h-6 w-11 rounded-full transition-colors ${hasLMN ? 'bg-sage' : 'bg-warm-gray/40'}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${hasLMN ? 'left-[22px]' : 'left-0.5'}`}
            />
          </button>
        </div>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-white p-4">
          <label className="text-xs font-medium text-primary">Hours per Week</label>
          <input
            type="range"
            min={1}
            max={40}
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(Number(e.target.value))}
            className="mt-2 w-full accent-sage"
          />
          <div className="mt-1 flex justify-between text-xs text-muted">
            <span>{hoursPerWeek} hrs/week</span>
            <span>${weeklySpend}/week</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4">
          <label className="text-xs font-medium text-primary">Federal Tax Bracket</label>
          <select
            value={taxBracketIdx}
            onChange={(e) => setTaxBracketIdx(Number(e.target.value))}
            className="mt-2 w-full rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-sage"
          >
            {TAX_BRACKETS.map((b, i) => (
              <option key={i} value={i}>
                {b.label} (
                {b.max === Infinity
                  ? `$${b.min.toLocaleString()}+`
                  : `$${b.min.toLocaleString()} - $${b.max.toLocaleString()}`}
                )
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Select Tiers */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted">Quick select a care tier:</p>
        <div className="flex gap-2">
          {tiers.map((tier) => (
            <button
              key={tier.hours}
              onClick={() => setHoursPerWeek(tier.hours)}
              className={`flex-1 rounded-lg border p-2 text-center transition-colors ${
                hoursPerWeek === tier.hours
                  ? 'border-sage bg-sage/5'
                  : 'border-border bg-white hover:border-sage/30'
              }`}
            >
              <p className="text-[11px] font-medium text-primary">{tier.name}</p>
              <p className="text-[10px] text-muted">
                {tier.hours}h · {tier.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="rounded-xl border-2 border-sage bg-white p-4">
        <h2 className="text-sm font-semibold text-primary">Your Estimated Annual Savings</h2>

        <div className="mt-4 text-center">
          <p className="text-4xl font-bold text-sage">
            ${Math.round(totalSavings).toLocaleString()}
          </p>
          <p className="text-sm text-muted">estimated tax savings per year</p>
          <p className="mt-1 text-xs text-secondary">
            {effectiveRate.toFixed(1)}% effective savings rate on ${annualSpend.toLocaleString()}{' '}
            annual spend
          </p>
        </div>

        <div className="mt-4 space-y-2 border-t border-border pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary">Annual Care Spend</span>
            <span className="font-medium text-primary">${annualSpend.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary">Federal Tax Savings ({bracket.label})</span>
            <span className={`font-medium ${hasLMN ? 'text-sage' : 'text-muted line-through'}`}>
              ${Math.round(federalSavings).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary">FICA Savings (7.65%)</span>
            <span className={`font-medium ${hasLMN ? 'text-sage' : 'text-muted line-through'}`}>
              ${Math.round(ficaSavings).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary">Colorado State Tax (4.4%)</span>
            <span className={`font-medium ${hasLMN ? 'text-sage' : 'text-muted line-through'}`}>
              ${Math.round(stateSavings).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
            <span className="font-semibold text-primary">Total Annual Savings</span>
            <span className="font-bold text-sage">
              ${Math.round(totalSavings).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Without vs With LMN Comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zone-red/20 bg-zone-red/5 p-4 text-center">
          <p className="text-xs font-medium text-zone-red">Without LMN</p>
          <p className="mt-1 text-xl font-bold text-primary">${annualSpend.toLocaleString()}</p>
          <p className="text-[11px] text-muted">Post-tax cost</p>
        </div>
        <div className="rounded-xl border border-sage/20 bg-sage/5 p-4 text-center">
          <p className="text-xs font-medium text-sage">With LMN + HSA</p>
          <p className="mt-1 text-xl font-bold text-sage">
            ${(annualSpend - totalSavings).toLocaleString()}
          </p>
          <p className="text-[11px] text-muted">Effective cost</p>
        </div>
      </div>

      {/* CTA */}
      {!hasLMN && (
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
          <h3 className="text-sm font-semibold text-primary">Get Your LMN</h3>
          <p className="mt-1 text-xs text-secondary">
            A Letter of Medical Necessity from your physician makes your companion care HSA/FSA
            eligible. Our Medical Director can help coordinate the process.
          </p>
          <a
            href="#/lmn"
            className="mt-2 inline-block rounded-lg bg-sage px-4 py-1.5 text-xs font-medium text-white hover:bg-sage-dark"
          >
            Start LMN Process
          </a>
        </div>
      )}

      <p className="text-[11px] text-muted">
        This calculator provides estimates only. Consult a tax professional for specific advice. HSA
        contribution limits apply ($4,300 individual / $8,550 family for 2026).
      </p>
    </div>
  );
}
