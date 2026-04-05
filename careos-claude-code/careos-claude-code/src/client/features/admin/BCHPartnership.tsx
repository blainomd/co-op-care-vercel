/**
 * BCHPartnership — Boulder Community Health hospital partnership dashboard
 *
 * Tracks discharge referrals, readmission rates, and revenue by stream.
 * Y1 Revenue target: $364K across 6 revenue streams.
 */

const REVENUE_STREAMS = [
  { label: 'BCH Retainer', target: 30000, actual: 22500, color: 'bg-[#4A6FA5]' },
  { label: 'Private Pay', target: 210000, actual: 131250, color: 'bg-sage' },
  { label: 'Memberships', target: 4000, actual: 2800, color: 'bg-gold' },
  { label: 'CII/CRI Assessments', target: 45000, actual: 28125, color: 'bg-copper' },
  { label: 'Conductor Certification', target: 75000, actual: 43750, color: 'bg-[#7A5CB8]' },
  { label: 'Total Y1 Revenue', target: 364000, actual: 228425, color: 'bg-sage' },
];

const DISCHARGE_METRICS = {
  referralsReceived: 87,
  familiesOnboarded: 34,
  conversionRate: 39.1,
  avgTimeToCareTeam: 2.4, // days
};

const CLINICAL_OUTCOMES = {
  readmissionRate: 8.5,
  baselineRate: 15.4,
  hospitalizationsAvoided: 11,
  savingsPerEvent: 16037,
  totalSavings: 176407, // 11 x $16,037
  workerRetention: 85,
};

const MONTHLY_DISCHARGES = [
  { month: 'Oct', referrals: 8, onboarded: 3 },
  { month: 'Nov', referrals: 10, onboarded: 4 },
  { month: 'Dec', referrals: 12, onboarded: 5 },
  { month: 'Jan', referrals: 15, onboarded: 6 },
  { month: 'Feb', referrals: 18, onboarded: 7 },
  { month: 'Mar', referrals: 24, onboarded: 9 },
];

const MILESTONES = [
  { label: 'Q2 Quarterly Review', date: 'Apr 15, 2026', status: 'upcoming' as const },
  { label: 'CMS ACCESS Application', date: 'Jun 1, 2026', status: 'upcoming' as const },
  { label: 'Phase 2 Expansion (Personal Care)', date: 'Sep 2026', status: 'planned' as const },
  { label: 'Epic HL7 FHIR Integration', date: 'Q1 2027', status: 'planned' as const },
];

export function BCHPartnership() {
  const maxReferrals = Math.max(...MONTHLY_DISCHARGES.map((m) => m.referrals));

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      {/* Partnership Hero */}
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="flex items-center gap-4">
          {/* BCH Logo Area */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#4A6FA5]/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#4A6FA5]">
              <path
                d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 10h1M14 10h1M9 14h1M14 14h1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-primary">Boulder Community Health</h1>
              <span className="rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-semibold text-sage">
                Active
              </span>
            </div>
            <p className="text-xs text-muted">Hospital Partnership Dashboard</p>
          </div>
        </div>
        <div className="mt-3 flex gap-4 border-t border-border pt-3 text-xs">
          <div>
            <span className="text-muted">Contract Start</span>
            <p className="font-medium text-primary">Oct 1, 2025</p>
          </div>
          <div>
            <span className="text-muted">Contract Term</span>
            <p className="font-medium text-primary">12 months</p>
          </div>
          <div>
            <span className="text-muted">Y1 Target</span>
            <p className="font-medium text-sage">$364,000</p>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown Cards */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-primary">Revenue by Stream</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {REVENUE_STREAMS.map((stream) => {
            const pct = Math.round((stream.actual / stream.target) * 100);
            const isTotal = stream.label === 'Total Y1 Revenue';
            return (
              <div
                key={stream.label}
                className={`rounded-xl border p-3 ${
                  isTotal
                    ? 'col-span-2 border-sage/30 bg-sage/5 md:col-span-3'
                    : 'border-border bg-white'
                }`}
              >
                <p className="text-[11px] text-muted">{stream.label}</p>
                <div className="mt-1 flex items-baseline justify-between">
                  <p className={`text-lg font-bold ${isTotal ? 'text-sage' : 'text-primary'}`}>
                    ${stream.actual.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted">/ ${stream.target.toLocaleString()}</p>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-full rounded-full bg-warm-gray">
                  <div
                    className={`h-1.5 rounded-full ${stream.color} transition-all`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-[9px] text-muted">{pct}% of target</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discharge Metrics */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h2 className="text-sm font-semibold text-primary">Discharge Referral Pipeline</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            {
              label: 'Referrals Received',
              value: DISCHARGE_METRICS.referralsReceived,
              color: 'text-[#4A6FA5]',
              icon: (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-[#4A6FA5]"
                >
                  <path
                    d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ),
            },
            {
              label: 'Families Onboarded',
              value: DISCHARGE_METRICS.familiesOnboarded,
              color: 'text-sage',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-sage">
                  <path
                    d="M22 11.08V12a10 10 0 11-5.93-9.14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 4L12 14.01l-3-3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ),
            },
            {
              label: 'Conversion Rate',
              value: `${DISCHARGE_METRICS.conversionRate}%`,
              color: 'text-gold',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gold">
                  <path
                    d="M22 12h-4l-3 9L9 3l-3 9H2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ),
            },
            {
              label: 'Avg Time to Care Team',
              value: `${DISCHARGE_METRICS.avgTimeToCareTeam}d`,
              color: 'text-copper',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-copper">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M12 6v6l4 2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ),
            },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border border-border p-3 text-center">
              <div className="mb-1 flex justify-center">{m.icon}</div>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-[10px] text-muted">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Outcomes */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h2 className="text-sm font-semibold text-primary">Clinical Outcomes</h2>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {/* Readmission Rate */}
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-primary">30-Day Readmission</p>
              <span className="rounded-full bg-sage/10 px-1.5 py-0.5 text-[9px] font-medium text-sage">
                Below baseline
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-bold text-sage">{CLINICAL_OUTCOMES.readmissionRate}%</p>
              <p className="text-xs text-muted">vs. {CLINICAL_OUTCOMES.baselineRate}% baseline</p>
            </div>
            {/* Comparison bar */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="w-14 text-muted">Co-op</span>
                <div className="h-2 flex-1 rounded-full bg-warm-gray">
                  <div
                    className="h-2 rounded-full bg-sage"
                    style={{ width: `${(CLINICAL_OUTCOMES.readmissionRate / 20) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sage">
                  {CLINICAL_OUTCOMES.readmissionRate}%
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="w-14 text-muted">BCH Avg</span>
                <div className="h-2 flex-1 rounded-full bg-warm-gray">
                  <div
                    className="h-2 rounded-full bg-zone-red/60"
                    style={{ width: `${(CLINICAL_OUTCOMES.baselineRate / 20) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-zone-red">
                  {CLINICAL_OUTCOMES.baselineRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Hospitalizations Avoided */}
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs font-medium text-primary">Hospitalizations Avoided</p>
            <p className="mt-2 text-2xl font-bold text-gold">
              {CLINICAL_OUTCOMES.hospitalizationsAvoided}
            </p>
            <p className="text-[10px] text-muted">
              @ ${CLINICAL_OUTCOMES.savingsPerEvent.toLocaleString()} per event
            </p>
            <div className="mt-2 border-t border-border pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-secondary">Total Savings</span>
                <span className="font-semibold text-sage">
                  ${CLINICAL_OUTCOMES.totalSavings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Worker Retention */}
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs font-medium text-primary">Worker Retention</p>
            <p className="mt-2 text-2xl font-bold text-sage">
              {CLINICAL_OUTCOMES.workerRetention}%
            </p>
            <p className="text-[10px] text-muted">vs. 23% industry average</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-warm-gray">
              <div
                className="h-1.5 rounded-full bg-sage"
                style={{ width: `${CLINICAL_OUTCOMES.workerRetention}%` }}
              />
            </div>
          </div>

          {/* Cost Impact */}
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs font-medium text-primary">Per-Family Impact</p>
            <p className="mt-2 text-2xl font-bold text-copper">
              $
              {Math.round(
                CLINICAL_OUTCOMES.totalSavings / DISCHARGE_METRICS.familiesOnboarded,
              ).toLocaleString()}
            </p>
            <p className="text-[10px] text-muted">avg savings per onboarded family</p>
            <div className="mt-2 border-t border-border pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-secondary">ROI to BCH</span>
                <span className="font-semibold text-sage">
                  {((CLINICAL_OUTCOMES.totalSavings / 30000) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Discharge Volume Chart */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h2 className="text-sm font-semibold text-primary">Monthly Discharge Volume</h2>
        <div className="mt-4 flex items-end gap-2">
          {MONTHLY_DISCHARGES.map((m) => (
            <div key={m.month} className="flex-1 text-center">
              <div className="relative mx-auto flex w-full max-w-[40px] flex-col items-center gap-0.5">
                {/* Referrals bar */}
                <div
                  className="w-full rounded-t bg-[#4A6FA5]/30"
                  style={{ height: `${(m.referrals / maxReferrals) * 100}px` }}
                />
                {/* Onboarded bar overlaid */}
                <div
                  className="absolute bottom-0 w-full rounded-t bg-sage"
                  style={{ height: `${(m.onboarded / maxReferrals) * 100}px` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-muted">{m.month}</p>
              <p className="text-[9px] text-[#4A6FA5]">{m.referrals}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-4 text-[10px] text-muted">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded bg-[#4A6FA5]/30" /> Referrals
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded bg-sage" /> Onboarded
          </span>
          <span className="flex items-center gap-1">Numbers = referral count</span>
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h2 className="text-sm font-semibold text-primary">Upcoming Milestones</h2>
        <div className="mt-3 space-y-2">
          {MILESTONES.map((ms) => (
            <div
              key={ms.label}
              className="flex items-center gap-3 rounded-lg border border-border p-2.5"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  ms.status === 'upcoming' ? 'bg-gold/10' : 'bg-warm-gray'
                }`}
              >
                {ms.status === 'upcoming' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gold">
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M16 2v4M8 2v4M3 10h18"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-muted"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M8 12h8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-primary">{ms.label}</p>
                <p className="text-[10px] text-muted">{ms.date}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                  ms.status === 'upcoming' ? 'bg-gold/10 text-gold' : 'bg-warm-gray text-muted'
                }`}
              >
                {ms.status === 'upcoming' ? 'Upcoming' : 'Planned'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* BCH Partnership Info */}
      <div className="rounded-xl border border-sage/20 bg-sage/5 p-4">
        <h3 className="text-sm font-semibold text-sage">About the BCH Partnership</h3>
        <p className="mt-1 text-xs text-secondary">
          Boulder Community Health partners with CareOS to reduce 30-day readmission rates through
          cooperative-owned companion care. Our worker-owners provide continuity of care
          post-discharge, with 85% retention vs. the 23% industry average. The partnership feeds
          into our CMS ACCESS/ELEVATE application, targeting shared savings from avoided
          hospitalizations at $16,037 per event.
        </p>
      </div>

      <p className="text-[11px] text-muted">
        Data reflects current contract year beginning Oct 1, 2025. Readmission baseline from BCH
        publicly reported CMS data (15.4%). Savings calculated using national average cost per home
        care-avoidable hospitalization.
      </p>
    </div>
  );
}
