/**
 * PACEDashboard — PACE/CMS shared savings metrics
 *
 * Shows hospitalizations avoided, cost savings per enrollee,
 * and projected PACE shared savings revenue for the cooperative.
 */

const PACE_METRICS = {
  enrollees: 40,
  monthlyCapitation: 2600,
  avgMonthlyCost: 1800,
  monthlySpread: 800,
  annualRevenue: 1248000, // 40 × $2,600 × 12
  annualCost: 864000, // 40 × $1,800 × 12
  annualMargin: 384000, // spread × 40 × 12
  hospitalizationsAvoided: 7,
  avgHospitalizationCost: 16037,
  totalSavings: 112259, // 7 × $16,037
  readmissionRate: 8.5, // % (industry avg ~15%)
  workerRetention: 85, // %
  avgCIIScore: 78,
  avgCRIScore: 32.5,
};

const MONTHLY_TREND = [
  { month: 'Oct', enrollees: 12, savings: 9600, hospitalizations: 0 },
  { month: 'Nov', enrollees: 18, savings: 14400, hospitalizations: 1 },
  { month: 'Dec', enrollees: 24, savings: 19200, hospitalizations: 0 },
  { month: 'Jan', enrollees: 30, savings: 24000, hospitalizations: 1 },
  { month: 'Feb', enrollees: 36, savings: 28800, hospitalizations: 0 },
  { month: 'Mar', enrollees: 40, savings: 32000, hospitalizations: 0 },
];

export function PACEDashboard() {
  const maxSavings = Math.max(...MONTHLY_TREND.map((m) => m.savings));

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">PACE Shared Savings</h1>
        <p className="text-sm text-muted">CMS ACCESS/ELEVATE program performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Enrollees', value: PACE_METRICS.enrollees, color: 'text-primary' },
          {
            label: 'Monthly Spread',
            value: `$${PACE_METRICS.monthlySpread.toLocaleString()}`,
            color: 'text-sage',
          },
          {
            label: 'Hosp. Avoided',
            value: PACE_METRICS.hospitalizationsAvoided,
            color: 'text-gold',
          },
          {
            label: 'Readmission Rate',
            value: `${PACE_METRICS.readmissionRate}%`,
            color: 'text-copper',
          },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-white p-3 text-center">
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-[11px] text-muted">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h2 className="text-sm font-semibold text-primary">Annual Financial Model</h2>
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-secondary">
              Capitation Revenue ({PACE_METRICS.enrollees} × $
              {PACE_METRICS.monthlyCapitation.toLocaleString()}/mo × 12)
            </span>
            <span className="font-medium text-primary">
              ${PACE_METRICS.annualRevenue.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-secondary">
              Actual Care Costs ({PACE_METRICS.enrollees} × $
              {PACE_METRICS.avgMonthlyCost.toLocaleString()}/mo × 12)
            </span>
            <span className="font-medium text-zone-red">
              -${PACE_METRICS.annualCost.toLocaleString()}
            </span>
          </div>
          <div className="border-t border-border pt-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-primary">Annual Shared Savings Margin</span>
              <span className="font-bold text-sage">
                ${PACE_METRICS.annualMargin.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="border-t border-border pt-2">
            <div className="flex justify-between text-xs">
              <span className="text-secondary">
                Hospitalizations Avoided ({PACE_METRICS.hospitalizationsAvoided} × $
                {PACE_METRICS.avgHospitalizationCost.toLocaleString()})
              </span>
              <span className="font-medium text-sage">
                ${PACE_METRICS.totalSavings.toLocaleString()} saved
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Growth Chart */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h2 className="text-sm font-semibold text-primary">Monthly Savings Trend</h2>
        <div className="mt-4 flex items-end gap-2">
          {MONTHLY_TREND.map((m) => (
            <div key={m.month} className="flex-1 text-center">
              <div className="relative mx-auto w-full max-w-[40px]">
                <div
                  className="mx-auto w-full rounded-t bg-sage"
                  style={{ height: `${(m.savings / maxSavings) * 100}px` }}
                />
                {m.hospitalizations > 0 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zone-red text-[9px] font-bold text-white">
                      {m.hospitalizations}
                    </span>
                  </div>
                )}
              </div>
              <p className="mt-1 text-[10px] text-muted">{m.month}</p>
              <p className="text-[9px] text-sage">{m.enrollees}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-4 text-[10px] text-muted">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded bg-sage" /> Monthly savings
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-zone-red" /> Hospitalizations
          </span>
          <span className="flex items-center gap-1">Numbers = enrollees</span>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h2 className="text-sm font-semibold text-primary">Quality Metrics</h2>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {[
            {
              label: 'Worker Retention',
              value: `${PACE_METRICS.workerRetention}%`,
              target: '> 80%',
              met: true,
              desc: 'vs. 23% industry avg',
            },
            {
              label: 'Readmission Rate',
              value: `${PACE_METRICS.readmissionRate}%`,
              target: '< 12%',
              met: true,
              desc: 'vs. 15% industry avg',
            },
            {
              label: 'Avg CII Score',
              value: `${PACE_METRICS.avgCIIScore}/120`,
              target: '> 60',
              met: true,
              desc: 'Community Integration',
            },
            {
              label: 'Avg CRI Score',
              value: `${PACE_METRICS.avgCRIScore}`,
              target: '< 45',
              met: true,
              desc: 'Lower = less risk',
            },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-primary">{m.label}</p>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                    m.met ? 'bg-sage/10 text-sage' : 'bg-zone-red/10 text-zone-red'
                  }`}
                >
                  Target: {m.target}
                </span>
              </div>
              <p className="mt-1 text-lg font-bold text-primary">{m.value}</p>
              <p className="text-[10px] text-muted">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CMS Program Info */}
      <div className="rounded-xl border border-sage/20 bg-sage/5 p-4">
        <h3 className="text-sm font-semibold text-sage">About CMS ACCESS/ELEVATE</h3>
        <p className="mt-1 text-xs text-secondary">
          The CMS ACCESS (Advancing Care Coordination for Elderly and Special-needs Seniors) and
          ELEVATE programs enable cooperatives like ours to share in Medicare savings when we reduce
          hospitalizations while maintaining quality metrics. Our cooperative model — with 85%
          worker retention vs. 23% industry average — directly correlates with better patient
          outcomes and lower readmission rates.
        </p>
      </div>

      <p className="text-[11px] text-muted">
        Data reflects current program year. Shared savings are calculated quarterly by CMS.
        Hospitalization cost based on national average for home care-avoidable admissions.
      </p>
    </div>
  );
}
