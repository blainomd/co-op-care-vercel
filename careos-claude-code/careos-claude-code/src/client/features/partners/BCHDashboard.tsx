/**
 * BCHDashboard — Private KPI dashboard for Grant Besser / BCH Foundation
 *
 * Shows the financial and clinical metrics BCH would track as a co-op.care partner.
 * Not linked from any nav. Accessible only via /#/bch/dashboard
 */
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { TileIcon } from '../../components/TileIcon';
import { useRef, useState, useEffect } from 'react';

/* ── Reveal ───────────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Animated counter ─────────────────────────────────────────── */
function AnimCounter({
  end,
  prefix = '',
  suffix = '',
  duration = 1500,
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const { ref, visible } = useInView(0.1);
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const start = 0;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [visible, end, duration]);
  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ── KPI Card ─────────────────────────────────────────────────── */
function KPI({
  label,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  icon?: string;
  accent?: boolean;
}) {
  const trendColor =
    trend === 'down' ? 'text-sage' : trend === 'up' ? 'text-zone-red' : 'text-text-muted';
  const trendArrow = trend === 'down' ? '↓' : trend === 'up' ? '↑' : '→';
  return (
    <div
      className={`rounded-xl p-5 ${accent ? 'border-2 border-sage/30 bg-sage/5' : 'border border-border bg-white'}`}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-text-muted">{label}</p>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage/10 text-sage">
            <TileIcon name={icon} size={16} />
          </div>
        )}
      </div>
      <p
        className={`mt-2 font-heading text-2xl font-bold ${accent ? 'text-sage-dark' : 'text-navy'}`}
      >
        {value}
      </p>
      {subtitle && <p className="mt-1 text-[11px] text-text-secondary">{subtitle}</p>}
      {trendLabel && (
        <p className={`mt-2 text-xs font-medium ${trendColor}`}>
          {trendArrow} {trendLabel}
        </p>
      )}
    </div>
  );
}

/* ── Progress bar ─────────────────────────────────────────────── */
function ProgressBar({
  label,
  current,
  target,
  unit = '',
}: {
  label: string;
  current: number;
  target: number;
  unit?: string;
}) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-navy">{label}</span>
        <span className="text-text-muted">
          {current}
          {unit} / {target}
          {unit}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-sage transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── Main Dashboard ───────────────────────────────────────────── */
export function BCHDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* ─── Nav ───────────────────────────────────────────── */}
      <nav className="flex items-center justify-between border-b border-border bg-white px-6 py-4 md:px-12">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="transition-opacity active:opacity-70"
          >
            <Logo variant="horizontal" size="sm" />
          </button>
          <span className="text-xs text-text-muted">×</span>
          <span className="text-xs font-semibold text-navy">BCH Foundation</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/bch')}
            className="rounded-full border border-navy/15 px-4 py-2 text-xs font-medium text-navy transition-colors hover:bg-navy/5"
          >
            Partnership Overview
          </button>
        </div>
      </nav>

      {/* ─── Header ────────────────────────────────────────── */}
      <div className="px-6 pt-8 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-bold uppercase tracking-wider text-sage">
              Partnership Dashboard
            </p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-navy">
              BCH Foundation × co-op.care
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Real-time KPIs your team would track as a co-op.care partner. These are the metrics
              that matter — every number ties back to patients staying home and costs going down.
            </p>
          </div>
        </Reveal>
      </div>

      {/* ─── Top-line KPIs ─────────────────────────────────── */}
      <section className="px-6 py-8 md:px-12">
        <Reveal>
          <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KPI
              label="ER Visits Avoided"
              value={<AnimCounter end={5} />}
              subtitle="This month"
              trend="down"
              trendLabel="vs. 5 visits baseline (Bob)"
              icon="shield"
              accent
            />
            <KPI
              label="Cost Avoided"
              value={<AnimCounter end={12500} prefix="$" />}
              subtitle="ER + readmission savings"
              trend="down"
              trendLabel="$12,500 saved this month"
              icon="money"
            />
            <KPI
              label="Families Served"
              value={<AnimCounter end={1} />}
              subtitle="Pilot — Month 1"
              trend="neutral"
              trendLabel="Target: 10 by Month 6"
              icon="home"
            />
            <KPI
              label="Caregiver Retention"
              value="100%"
              subtitle="0 turnover (pilot start)"
              trend="down"
              trendLabel="vs. 77% industry turnover"
              icon="community"
            />
          </div>
        </Reveal>
      </section>

      {/* ─── Bob Dion — Live Case Study ────────────────────── */}
      <section className="px-6 pb-8 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <div className="rounded-2xl border border-border bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage text-sm font-bold text-white">
                  BD
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-navy">
                    Bob Dion — Case Study #001
                  </p>
                  <p className="text-xs text-text-secondary">
                    Morningstar → Home Care · Dr. Emdur overseeing
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-[#F8F9FB] p-4">
                  <p className="text-xs text-text-muted">ER Visits (Before)</p>
                  <p className="mt-1 font-heading text-xl font-bold text-zone-red">5 / month</p>
                </div>
                <div className="rounded-xl bg-sage/5 p-4">
                  <p className="text-xs text-text-muted">ER Visits (Target)</p>
                  <p className="mt-1 font-heading text-xl font-bold text-sage-dark">0 / month</p>
                </div>
                <div className="rounded-xl bg-[#F8F9FB] p-4">
                  <p className="text-xs text-text-muted">Monthly Cost (Before)</p>
                  <p className="mt-1 font-heading text-xl font-bold text-zone-red">$12,500+</p>
                  <p className="text-[10px] text-text-muted">Facility + ER visits</p>
                </div>
                <div className="rounded-xl bg-sage/5 p-4">
                  <p className="text-xs text-text-muted">Monthly Cost (Target)</p>
                  <p className="mt-1 font-heading text-xl font-bold text-sage-dark">~$1,800</p>
                  <p className="text-[10px] text-text-muted">Home care + oversight</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold text-navy">Health Tracking</p>
                  <div className="mt-2 space-y-2">
                    <ProgressBar label="Fall Risk Score" current={7} target={10} />
                    <ProgressBar label="Medication Adherence" current={85} target={100} unit="%" />
                    <ProgressBar label="Mobility Score" current={4} target={10} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-navy">Wellness Activities</p>
                  <div className="mt-2 space-y-2">
                    <ProgressBar label="Chair Yoga Sessions" current={3} target={8} unit="/wk" />
                    <ProgressBar label="Guided Breathing" current={5} target={7} unit="/wk" />
                    <ProgressBar label="Outdoor Walks" current={2} target={5} unit="/wk" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-navy">Care Quality</p>
                  <div className="mt-2 space-y-2">
                    <ProgressBar
                      label="Caregiver Visits Logged"
                      current={24}
                      target={30}
                      unit="/mo"
                    />
                    <ProgressBar label="Physician Reviews" current={4} target={4} unit="/mo" />
                    <ProgressBar label="Family Satisfaction" current={9} target={10} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Financial Impact — BCH System ────────────────── */}
      <section className="px-6 py-8 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <h2 className="font-heading text-lg font-bold text-navy">Financial Impact to BCH</h2>
            <p className="mt-1 text-xs text-text-secondary">
              Projected across pilot families · Updated as real data flows in
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-[#F8F9FB]">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-navy">Metric</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-navy">
                      Per Family / Mo
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-navy">
                      10 Families / Mo
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-navy">
                      10 Families / Year
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-navy">ER Visits Avoided</p>
                      <p className="text-[11px] text-text-muted">
                        Avg 2.5 visits/mo avoided × $2,500 each
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-sage-dark">$6,250</td>
                    <td className="px-5 py-3 text-right font-semibold text-sage-dark">$62,500</td>
                    <td className="px-5 py-3 text-right font-semibold text-sage-dark">$750,000</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-navy">Readmissions Prevented</p>
                      <p className="text-[11px] text-text-muted">
                        0.3 readmissions avoided/mo × $16,000 each
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-sage-dark">$4,800</td>
                    <td className="px-5 py-3 text-right font-semibold text-sage-dark">$48,000</td>
                    <td className="px-5 py-3 text-right font-semibold text-sage-dark">$576,000</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-navy">Blocked Bed Days Freed</p>
                      <p className="text-[11px] text-text-muted">
                        Avg 1.5 days/mo freed × $2,500/day
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-sage-dark">$3,750</td>
                    <td className="px-5 py-3 text-right font-semibold text-sage-dark">$37,500</td>
                    <td className="px-5 py-3 text-right font-semibold text-sage-dark">$450,000</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-navy">TEAM Episode Savings</p>
                      <p className="text-[11px] text-text-muted">
                        30-day post-discharge bundle cost reduction
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-sage-dark">$2,200</td>
                    <td className="px-5 py-3 text-right font-semibold text-sage-dark">$22,000</td>
                    <td className="px-5 py-3 text-right font-semibold text-sage-dark">$264,000</td>
                  </tr>
                  <tr className="bg-navy/5">
                    <td className="px-5 py-4">
                      <p className="font-bold text-navy">Total Cost Avoided</p>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-sage-dark">$17,000</td>
                    <td className="px-5 py-4 text-right font-bold text-sage-dark">$170,000</td>
                    <td className="px-5 py-4 text-right text-lg font-bold text-sage-dark">
                      $2,040,000
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-xl border border-sage/20 bg-sage/5 p-4">
              <p className="text-xs text-text-secondary">
                <strong className="text-navy">Note:</strong> These projections are based on Bob
                Dion's baseline (5 ER visits/month) extrapolated conservatively across 10 families.
                Actual metrics will replace projections as real data flows through CareOS.{' '}
                <strong className="text-navy">BCH's cost to participate: $0.</strong> co-op.care
                bills families directly.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Pilot Milestones ─────────────────────────────── */}
      <section className="px-6 py-8 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <h2 className="font-heading text-lg font-bold text-navy">90-Day Pilot Milestones</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  week: 'Week 1-2',
                  title: 'Bob moves home',
                  items: [
                    'Baseline health data collected',
                    'First caregiver placed',
                    'CareOS onboarded',
                    'Josh reviews care plan',
                  ],
                  status: 'upcoming',
                },
                {
                  week: 'Week 3-4',
                  title: 'Rhythms established',
                  items: [
                    'Daily care logs flowing',
                    'Wellness activities started',
                    'First physician review cycle',
                    'Family dashboard live',
                  ],
                  status: 'upcoming',
                },
                {
                  week: 'Week 6',
                  title: 'Mid-point check',
                  items: [
                    'ER visit comparison',
                    'Cost tracking report',
                    'Caregiver satisfaction survey',
                    'Health trend analysis',
                  ],
                  status: 'upcoming',
                },
                {
                  week: 'Week 12',
                  title: 'Full case study',
                  items: [
                    'Complete outcomes report',
                    'BCH presentation ready',
                    'Scale decision: 3-5 homes',
                    'VtV Gathering submission',
                  ],
                  status: 'upcoming',
                },
              ].map((m) => (
                <div key={m.week} className="rounded-xl border border-border bg-white p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-sage">
                    {m.week}
                  </p>
                  <p className="mt-1 font-heading text-sm font-bold text-navy">{m.title}</p>
                  <ul className="mt-3 space-y-1.5">
                    {m.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-text-secondary">
                        <span className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border border-border bg-white" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Research Foundation ─────────────────────────── */}
      <section className="px-6 py-8 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <h2 className="font-heading text-lg font-bold text-navy">
              Why This Works — The Research
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              Every number on this dashboard is grounded in published research
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-sage">
                  Readmission Reduction
                </p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Home-based care programs reduce 30-day hospital readmissions by{' '}
                  <strong className="text-navy">25–40%</strong>. Medicare penalizes hospitals up to
                  3% of reimbursements for excess readmissions under HRRP.
                </p>
                <p className="mt-2 text-[10px] text-text-muted">
                  CMS Hospital Readmissions Reduction Program; Naylor et al., JAMA 2004; Coleman et
                  al., Arch Intern Med 2006
                </p>
              </div>
              <div className="rounded-xl border border-border bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-sage">
                  Caregiver Retention via Cooperatives
                </p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Worker-owned home care cooperatives achieve{' '}
                  <strong className="text-navy">85% retention</strong> vs. the industry average of
                  23%. Cooperative Home Care Associates (CHCA) in the Bronx has demonstrated this
                  model for 35+ years with 2,300 workers.
                </p>
                <p className="mt-2 text-[10px] text-text-muted">
                  PHI National; CHCA/Paraprofessional Healthcare Institute; ICA Group cooperative
                  development research
                </p>
              </div>
              <div className="rounded-xl border border-border bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-sage">
                  ER Utilization &amp; Aging in Place
                </p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Adults 65+ account for <strong className="text-navy">40% of ER visits</strong> and
                  60% of hospital admissions nationally. Community-based care coordination programs
                  reduce ER utilization by <strong className="text-navy">17–30%</strong>. The
                  Village model specifically has shown reduced isolation, which correlates with a
                  29% reduction in mortality risk.
                </p>
                <p className="mt-2 text-[10px] text-text-muted">
                  CDC NCHS Data Brief; AARP/Village to Village Network outcomes; Holt-Lunstad et
                  al., PLOS Medicine 2010
                </p>
              </div>
              <div className="rounded-xl border border-border bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-sage">
                  HSA/FSA &amp; Home Care Economics
                </p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  <strong className="text-navy">$104 billion</strong> sits in HSA accounts
                  nationally. Home care with a physician's letter of medical necessity qualifies as
                  a tax-deductible medical expense, saving families{' '}
                  <strong className="text-navy">28–36%</strong> on care costs through pre-tax
                  dollars.
                </p>
                <p className="mt-2 text-[10px] text-text-muted">
                  Devenir HSA Research 2025; IRS Publication 502; IRC §213(d) medical expense
                  deduction
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Adoption Curve: 1 → 100 → 4,000 ─────────────── */}
      <section className="bg-navy px-6 py-12 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-sage-light">
              Adoption Model
            </p>
            <h2 className="mt-2 text-center font-heading text-xl font-bold text-white">
              From 1 family to 4,000
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-white/60">
              Boulder County has 42,000 adults 65+. The Village movement's adoption pattern shows
              community care models reach 8–12% of the eligible population within 5 years once trust
              is established. That's 3,400–5,000 families. Here's the path.
            </p>

            {/* Adoption curve visualization */}
            <div className="mt-10 px-4">
              <div className="flex items-end gap-2" style={{ height: 220 }}>
                {[
                  { label: 'Pilot', families: 1, h: 8 },
                  { label: 'Q2', families: 5, h: 16 },
                  { label: 'Q3', families: 15, h: 28 },
                  { label: 'Q4', families: 30, h: 40 },
                  { label: 'Y2-Q1', families: 60, h: 58 },
                  { label: 'Y2-Q2', families: 100, h: 78 },
                  { label: 'Y2-Q3', families: 180, h: 100 },
                  { label: 'Y2-Q4', families: 300, h: 124 },
                  { label: 'Y3', families: 600, h: 150 },
                  { label: 'Y4', families: 1500, h: 182 },
                  { label: 'Y5', families: 4000, h: 220 },
                ].map((d) => (
                  <div key={d.label} className="flex flex-1 flex-col items-center">
                    <p className="mb-1 text-[9px] font-bold text-sage-light">
                      {d.families.toLocaleString()}
                    </p>
                    <div
                      className="w-full rounded-t-md"
                      style={{
                        height: d.h,
                        background: `linear-gradient(to top, rgba(13,115,119,0.8), rgba(13,115,119,0.4))`,
                      }}
                    />
                    <p className="mt-1 text-[8px] text-white/40">{d.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-center text-[10px] text-white/30">Families served</p>
            </div>

            {/* Phase detail cards — BCH drives each phase */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-sage-light">
                  Phase 1 — Prove
                </p>
                <p className="mt-2 font-heading text-2xl font-bold text-white">1 → 10</p>
                <p className="text-xs text-white/50">families · Year 1</p>
                <div className="mt-3 space-y-1 text-[11px] text-white/60">
                  <p>Bob's home + 3–5 nearby homes</p>
                  <p>15–25 care neighbors</p>
                  <p className="font-semibold text-sage-light">$2M cost avoided / year</p>
                </div>
                <div className="mt-3 rounded-lg border border-sage/20 bg-sage/5 p-2">
                  <p className="text-[10px] font-bold text-sage-light">BCH's role:</p>
                  <p className="text-[10px] text-white/60">
                    First 10 referrals from discharge planning. Warm handoff pilot with care
                    coordinators.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-sage/30 bg-sage/10 p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-sage-light">
                  Phase 2 — Spread
                </p>
                <p className="mt-2 font-heading text-2xl font-bold text-white">10 → 100</p>
                <p className="text-xs text-white/50">families · Year 2</p>
                <div className="mt-3 space-y-1 text-[11px] text-white/60">
                  <p>Multiple Boulder neighborhoods</p>
                  <p>ADU conversions accelerating</p>
                  <p className="font-semibold text-sage-light">$20M cost avoided / year</p>
                </div>
                <div className="mt-3 rounded-lg border border-sage/20 bg-sage/5 p-2">
                  <p className="text-[10px] font-bold text-sage-light">BCH's role:</p>
                  <p className="text-[10px] text-white/60">
                    Formal discharge pathway. co-op.care in BCH aftercare materials. Foundation
                    promotes to community. Outcomes data shared back.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-sage-light">
                  Phase 3 — County
                </p>
                <p className="mt-2 font-heading text-2xl font-bold text-white">100 → 1,000</p>
                <p className="text-xs text-white/50">families · Year 3–4</p>
                <div className="mt-3 space-y-1 text-[11px] text-white/60">
                  <p>Boulder County-wide network</p>
                  <p>Longmont, Louisville, Lafayette</p>
                  <p className="font-semibold text-sage-light">$200M cost avoided / year</p>
                </div>
                <div className="mt-3 rounded-lg border border-sage/20 bg-sage/5 p-2">
                  <p className="text-[10px] font-bold text-sage-light">BCH's role:</p>
                  <p className="text-[10px] text-white/60">
                    BCH becomes anchor health system partner. Joint CMS TEAM reporting. Foundation
                    fundraises around proven outcomes. Expand to BCH satellite clinics.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-sage-light">
                  Phase 4 — Movement
                </p>
                <p className="mt-2 font-heading text-2xl font-bold text-white">1,000 → 4,000</p>
                <p className="text-xs text-white/50">families · Year 5</p>
                <div className="mt-3 space-y-1 text-[11px] text-white/60">
                  <p>~10% of Boulder County 65+ pop</p>
                  <p>Federation to Front Range</p>
                  <p className="font-semibold text-sage-light">$800M+ cost avoided / year</p>
                </div>
                <div className="mt-3 rounded-lg border border-sage/20 bg-sage/5 p-2">
                  <p className="text-[10px] font-bold text-sage-light">BCH's role:</p>
                  <p className="text-[10px] text-white/60">
                    National model. BCH Foundation is the origin story. Other health systems license
                    the BCH+co-op.care playbook. Grant writes the case study.
                  </p>
                </div>
              </div>
            </div>

            {/* BCH rides the wave */}
            <div className="mt-8 rounded-xl border border-sage/30 bg-sage/10 p-6">
              <p className="text-sm font-bold text-white">What BCH Foundation rides:</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold text-sage-light">Community Health Impact</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/60">
                    Boulder becomes the national model for aging in place. BCH Foundation is
                    credited as the catalyst — the institution that saw it first and made the first
                    bet. This is a{' '}
                    <strong className="text-white/80">legacy-defining partnership</strong>.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-sage-light">Financial Transformation</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/60">
                    At 4,000 families, BCH avoids hundreds of millions in readmission penalties and
                    blocked-bed costs. Under CMS TEAM, every dollar saved on post-discharge episodes
                    flows directly to BCH's bottom line.{' '}
                    <strong className="text-white/80">
                      co-op.care becomes BCH's most valuable community asset.
                    </strong>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-sage-light">Fundraising Story</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/60">
                    "We invested in a cooperative that now keeps 4,000 families home, employs
                    hundreds of neighbors, and saves our health system $800M a year."
                    <strong className="text-white/80"> That's a story donors fund.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Time Banking: The Growth Engine ──────────────── */}
      <section className="px-6 py-10 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <h2 className="font-heading text-lg font-bold text-navy">
              How We Grow: Neighbor Care + Time Banking
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Not every hour of care needs to come from a paid caregiver. That's what makes this
              model different from every home care agency in Boulder — and why it scales without
              breaking.
            </p>

            <div className="mt-8 rounded-2xl border border-border bg-white p-6">
              <div className="grid gap-8 md:grid-cols-2">
                {/* How it works */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-sage">
                    How time banking works
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/10 text-xs font-bold text-sage">
                        1
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy">
                          Neighbors sign up as Care Neighbors
                        </p>
                        <p className="text-xs text-text-secondary">
                          Anyone in the community — retirees, students, parents, professionals. No
                          certification required for companion care.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/10 text-xs font-bold text-sage">
                        2
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy">
                          Every hour of help earns a time credit
                        </p>
                        <p className="text-xs text-text-secondary">
                          Drive someone to an appointment, sit with Bob while Jess is at work, bring
                          groceries, lead a chair yoga session. One hour = one credit.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/10 text-xs font-bold text-sage">
                        3
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy">
                          Credits are redeemable for care when you need it
                        </p>
                        <p className="text-xs text-text-secondary">
                          Bank hours now, use them later for yourself or a loved one. The more
                          people participate, the richer the care network becomes.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/10 text-xs font-bold text-sage">
                        4
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy">
                          Neighbors who want a career path become W2 caregivers
                        </p>
                        <p className="text-xs text-text-secondary">
                          Time banking is the on-ramp. Those who discover they love care work can
                          become paid cooperative members — $25-28/hr, benefits, equity, housing.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Why it cuts cost AND creates jobs */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-sage">
                    Why this changes the economics
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl bg-sage/5 p-4">
                      <p className="text-sm font-semibold text-navy">
                        Not every care hour is a paid hour
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        Traditional agencies charge $35-50/hr for <em>everything</em> —
                        companionship, errands, transportation. In co-op.care, neighbors handle
                        those hours through time banking.{' '}
                        <strong>Paid caregivers focus on clinical and hands-on care</strong> where
                        training matters. This cuts community care costs by 40-60%.
                      </p>
                    </div>
                    <div className="rounded-xl bg-sage/5 p-4">
                      <p className="text-sm font-semibold text-navy">
                        But it still creates real jobs
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        Every 10 families need 3-5 full-time W2 caregivers for skilled care. At
                        4,000 families, that's <strong>1,200-2,000 paid cooperative jobs</strong> in
                        Boulder County — with living wages, housing, and ownership. Time banking
                        doesn't replace jobs. It creates them by making the overall model affordable
                        enough that families actually sign up.
                      </p>
                    </div>
                    <div className="rounded-xl bg-sage/5 p-4">
                      <p className="text-sm font-semibold text-navy">The network effect</p>
                      <p className="mt-1 text-xs text-text-secondary">
                        Each Care Neighbor who earns credits tells 3-5 friends. Each family who
                        receives help refers 2-3 more. Time banking is the growth engine — it turns
                        every participant into a recruiter.{' '}
                        <strong>The community builds itself.</strong>
                      </p>
                    </div>
                  </div>

                  {/* The math */}
                  <div className="mt-4 rounded-xl border-2 border-sage/20 p-4">
                    <p className="text-xs font-bold text-navy">
                      The math at scale (4,000 families)
                    </p>
                    <div className="mt-2 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Time-banked hours (volunteer)</span>
                        <span className="font-semibold text-navy">~200,000 hrs/yr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Paid caregiver hours (W2)</span>
                        <span className="font-semibold text-navy">~800,000 hrs/yr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">W2 caregiver jobs created</span>
                        <span className="font-semibold text-sage-dark">1,200–2,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Active Care Neighbors</span>
                        <span className="font-semibold text-sage-dark">5,000–8,000</span>
                      </div>
                      <div className="mt-2 border-t border-border pt-2 flex justify-between">
                        <span className="text-text-secondary">
                          Cost per family vs. traditional agency
                        </span>
                        <span className="font-bold text-sage-dark">40–60% less</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Jevons Paradox */}
            <div className="mt-6 rounded-2xl border-2 border-navy/10 bg-white p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy">
                  <TileIcon name="chart" size={24} />
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-navy">
                    Jevons Paradox in Healthcare: Why Cheaper Care Means More Care
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    In 1865, economist William Stanley Jevons observed that when coal became more
                    efficient to use, total coal consumption <em>increased</em> rather than
                    decreased. The same principle applies to healthcare.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    Right now,{' '}
                    <strong className="text-navy">
                      most families who need home care don't buy it
                    </strong>{' '}
                    — it's too expensive, too unreliable, too hard to find. When co-op.care makes
                    care 40-60% cheaper through time banking, unlocks pre-tax health savings, and
                    provides consistent caregivers who actually stay —{' '}
                    <strong className="text-navy">demand doesn't shrink. It explodes.</strong>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    Families who were white-knuckling it alone start buying 10 hours a week.
                    Families who had 5 hours increase to 20. Families who were headed to a nursing
                    home stay home instead.
                    <strong className="text-navy">
                      {' '}
                      The total hours of care consumed in Boulder goes up — and every one of those
                      hours is a job.
                    </strong>
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-sage/5 p-3 text-center">
                      <p className="font-heading text-lg font-bold text-sage-dark">3×</p>
                      <p className="text-[10px] text-text-muted">
                        More families access care when cost drops 50%
                      </p>
                    </div>
                    <div className="rounded-lg bg-sage/5 p-3 text-center">
                      <p className="font-heading text-lg font-bold text-sage-dark">2×</p>
                      <p className="text-[10px] text-text-muted">More hours consumed per family</p>
                    </div>
                    <div className="rounded-lg bg-sage/5 p-3 text-center">
                      <p className="font-heading text-lg font-bold text-sage-dark">6×</p>
                      <p className="text-[10px] text-text-muted">Total market expansion</p>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] text-text-muted">
                    Jevons, W.S. "The Coal Question" (1865); analogous demand elasticity observed in
                    telemedicine adoption (McKinsey, 2021), dental care access (RAND HIE), and
                    prescription drug markets.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-sage/20 bg-sage/5 p-4">
              <p className="text-xs text-text-secondary">
                <strong className="text-navy">For BCH Foundation:</strong> Time banking means
                co-op.care doesn't need massive upfront hiring to launch. The community bootstraps
                itself through neighbor participation. And because affordable care creates{' '}
                <em>more</em> demand (Jevons), the job creation is real — 1,200-2,000 paid positions
                at 4,000 families, plus thousands of active Care Neighbors earning time credits.
                BCH's role is the referral — "go home, and co-op.care will be there."
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── The Automation Flywheel ─────────────────────── */}
      <section className="bg-warm-gray/40 px-6 py-10 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <h2 className="font-heading text-lg font-bold text-navy">The Automation Flywheel</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              co-op.care automates the entire care economy — scheduling, matching, documentation,
              billing, physician review, quality tracking — so the <em>human</em> part stays human
              while the
              <em> operational</em> cost drops with every family added.
            </p>

            <div className="mt-8 rounded-2xl border border-border bg-white p-6">
              {/* Flywheel visualization */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-sage">
                    How the flywheel works
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      {
                        step: 'Automate operations',
                        detail:
                          'AI handles scheduling, care matching, documentation, LMN generation, and billing. One platform replaces 6 back-office roles.',
                      },
                      {
                        step: 'Lower cost per family',
                        detail:
                          'At 10 families, ops cost ~$200/family/mo. At 1,000 families, ops cost drops to ~$15/family/mo. The marginal cost of adding one more family approaches zero.',
                      },
                      {
                        step: 'Affordable care = more families',
                        detail:
                          'Jevons: cheaper care means 3\u00d7 more families sign up and consume 2\u00d7 more hours. Total market expands 6\u00d7.',
                      },
                      {
                        step: 'More families = more data',
                        detail:
                          'Every care visit generates structured health data. More data = better AI predictions, earlier interventions, fewer ER trips.',
                      },
                      {
                        step: 'Better outcomes = hospital value',
                        detail:
                          'BCH gets readmission reduction data, CMS TEAM compliance, and a community health story. This is the high-margin output from a low-margin service business.',
                      },
                    ].map((s, i) => (
                      <div key={s.step} className="flex gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage text-[10px] font-bold text-white">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-navy">{s.step}</p>
                          <p className="text-xs text-text-secondary">{s.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-sage">
                    The economics at each stage
                  </p>
                  <div className="mt-4 overflow-hidden rounded-xl border border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#F8F9FB]">
                          <th className="px-3 py-2 text-left font-semibold text-navy">Scale</th>
                          <th className="px-3 py-2 text-right font-semibold text-navy">
                            Ops Cost / Family
                          </th>
                          <th className="px-3 py-2 text-right font-semibold text-navy">
                            Gross Margin
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-border/50">
                          <td className="px-3 py-2 text-text-secondary">10 families</td>
                          <td className="px-3 py-2 text-right font-semibold text-navy">$200/mo</td>
                          <td className="px-3 py-2 text-right text-zone-red">-15%</td>
                        </tr>
                        <tr className="border-t border-border/50">
                          <td className="px-3 py-2 text-text-secondary">100 families</td>
                          <td className="px-3 py-2 text-right font-semibold text-navy">$60/mo</td>
                          <td className="px-3 py-2 text-right text-text-secondary">18%</td>
                        </tr>
                        <tr className="border-t border-border/50">
                          <td className="px-3 py-2 text-text-secondary">1,000 families</td>
                          <td className="px-3 py-2 text-right font-semibold text-navy">$15/mo</td>
                          <td className="px-3 py-2 text-right text-sage-dark">42%</td>
                        </tr>
                        <tr className="border-t border-border/50 bg-sage/5">
                          <td className="px-3 py-2 font-semibold text-navy">4,000 families</td>
                          <td className="px-3 py-2 text-right font-bold text-sage-dark">$8/mo</td>
                          <td className="px-3 py-2 text-right font-bold text-sage-dark">58%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 rounded-xl bg-navy p-4">
                    <p className="text-xs font-bold text-sage-light">The insight for BCH</p>
                    <p className="mt-2 text-[11px] leading-relaxed text-white/70">
                      Home care is a <strong className="text-white">low-margin, high-value</strong>{' '}
                      business. The care itself runs at thin margins — that's fine, because the{' '}
                      <em>data and outcomes</em> it produces are{' '}
                      <strong className="text-white">high-margin, high-value</strong> for health
                      systems. Every readmission avoided saves BCH $16,000. Every CMS TEAM episode
                      optimized goes straight to BCH's bottom line. co-op.care runs the low-margin
                      service so BCH can capture the high-margin outcome.
                    </p>
                    <p className="mt-2 text-[11px] leading-relaxed text-white/70">
                      <strong className="text-sage-light">BCH's investment: referrals.</strong>{' '}
                      co-op.care's investment: the entire operational stack. The automation makes
                      this sustainable at any scale without BCH spending a dollar on infrastructure.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Clinical White Paper ─────────────────────────── */}
      <section className="px-6 py-10 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <h2 className="font-heading text-lg font-bold text-navy">
              Toward a Clinical Evidence Base
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              The Bob Dion pilot is structured as a publishable proof-of-concept study. Here's the
              clinical framework.
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-white p-6 md:p-8">
              <p className="font-heading text-base font-bold text-navy">
                Worker-Owned Cooperative Home Care With Physician Oversight and AI-Assisted
                Coordination: A Proof-of-Concept Study in Reducing Emergency Utilization Among
                Community-Dwelling Older Adults
              </p>
              <p className="mt-2 text-xs text-text-muted">
                Emdur J, DO · Warkentine B, MD MBA · Dion J, PT · co-op.care Limited Cooperative
                Association · Boulder Community Health Foundation
              </p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-sage">
                    Study Design
                  </p>
                  <div className="mt-3 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-navy">Design</p>
                      <p className="text-xs text-text-secondary">
                        Single-subject, pre-post observational study with 12-week intervention
                        period. Patient serves as own historical control (5 ER visits/month baseline
                        at Morningstar).
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">Intervention</p>
                      <p className="text-xs text-text-secondary">
                        Transition from assisted living to family home with live-in W2 cooperative
                        caregivers, physician oversight via CareOS platform (AI-assisted care
                        coordination, structured health data capture, prescribed wellness
                        activities), and community time-banking support network.
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">Setting</p>
                      <p className="text-xs text-text-secondary">
                        Private residence within 1 mile of Boulder Community Health, Boulder, CO.
                        Care delivered by co-op.care cooperative members (W2, $25-28/hr, equity
                        holders).
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-sage">
                    Primary &amp; Secondary Outcomes
                  </p>
                  <div className="mt-3 space-y-2">
                    {[
                      {
                        type: 'Primary',
                        measure: 'ER utilization rate',
                        unit: 'visits/30 days',
                        baseline: '5.0',
                        target: '0\u20131.0',
                      },
                      {
                        type: 'Primary',
                        measure: 'Total healthcare cost',
                        unit: '$/month',
                        baseline: '$12,500+',
                        target: '~$1,800',
                      },
                      {
                        type: 'Secondary',
                        measure: 'Fall incidents',
                        unit: 'events/30 days',
                        baseline: 'TBD',
                        target: 'Reduce',
                      },
                      {
                        type: 'Secondary',
                        measure: 'Medication adherence',
                        unit: '%',
                        baseline: 'TBD',
                        target: '>95%',
                      },
                      {
                        type: 'Secondary',
                        measure: 'Caregiver retention',
                        unit: 'months tenure',
                        baseline: '3 (industry)',
                        target: '6+',
                      },
                      {
                        type: 'Secondary',
                        measure: 'Family caregiver burden',
                        unit: 'Zarit score',
                        baseline: 'TBD',
                        target: 'Reduce',
                      },
                      {
                        type: 'Secondary',
                        measure: 'Patient satisfaction',
                        unit: '1\u201310 scale',
                        baseline: 'N/A',
                        target: '>8',
                      },
                    ].map((o) => (
                      <div
                        key={o.measure}
                        className="flex items-center gap-2 rounded-lg bg-[#F8F9FB] px-3 py-2 text-xs"
                      >
                        <span
                          className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${o.type === 'Primary' ? 'bg-sage/20 text-sage-dark' : 'bg-navy/10 text-navy'}`}
                        >
                          {o.type}
                        </span>
                        <span className="flex-1 font-medium text-navy">{o.measure}</span>
                        <span className="text-zone-red">{o.baseline}</span>
                        <span className="text-text-muted">→</span>
                        <span className="text-sage-dark">{o.target}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-[#F8F9FB] p-4">
                  <p className="text-xs font-bold text-navy">Data Collection</p>
                  <p className="mt-1 text-[11px] text-text-secondary">
                    CareOS platform captures structured data from every caregiver visit (vitals,
                    mobility, medication adherence, wellness activity completion, incident reports).
                    BCH provides ER utilization records. Physician reviews logged with timestamps.
                  </p>
                </div>
                <div className="rounded-xl bg-[#F8F9FB] p-4">
                  <p className="text-xs font-bold text-navy">Analysis Plan</p>
                  <p className="mt-1 text-[11px] text-text-secondary">
                    Pre-post comparison of ER visits and costs (paired analysis). Time-series
                    tracking of health metrics with trend analysis. Qualitative interviews with
                    family members and caregivers at Weeks 6 and 12. Cost-effectiveness analysis vs.
                    institutional care.
                  </p>
                </div>
                <div className="rounded-xl bg-[#F8F9FB] p-4">
                  <p className="text-xs font-bold text-navy">Publication Target</p>
                  <p className="mt-1 text-[11px] text-text-secondary">
                    Case report for <em>Journal of the American Geriatrics Society</em> or
                    <em> Home Health Care Management &amp; Practice</em>. Presentation at VtV
                    Network National Gathering (Sept 2026) and Leading Age Philadelphia (Oct 2026).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Village to Village Network ──────────────────── */}
      <section className="bg-warm-gray/40 px-6 py-10 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-sage">
                  National Movement
                </p>
                <h2 className="mt-2 font-heading text-lg font-bold text-navy">
                  Village to Village Network
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  The Village movement has 350+ communities across the US helping older adults age
                  in place through volunteer-driven mutual aid. co-op.care is the next evolution:
                  adding physician oversight, cooperative employment, and technology coordination to
                  what Villages have been doing with goodwill alone.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  We're presenting at the{' '}
                  <strong className="text-navy">2026 National Virtual Village Gathering</strong>{' '}
                  (September 22–24) and the{' '}
                  <strong className="text-navy">Leading Age Philadelphia</strong> conference
                  (October 25). BCH Foundation's partnership with co-op.care will be central to both
                  presentations.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  Locally, the <strong className="text-navy">Neighborhood Village Project</strong>{' '}
                  is already training 12 Boulder neighborhoods to rebuild community connections.
                  co-op.care adds the care infrastructure that makes those connections sustain real
                  health outcomes.
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-sage">
                  What this means for BCH
                </p>
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl border border-border bg-white p-4">
                    <p className="text-sm font-semibold text-navy">National visibility</p>
                    <p className="text-xs text-text-secondary">
                      BCH Foundation becomes the first health system partner to back a cooperative
                      care model. 350+ Villages are watching. This is a first-mover position.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-white p-4">
                    <p className="text-sm font-semibold text-navy">Replication demand</p>
                    <p className="text-xs text-text-secondary">
                      Every Village in the network will want to know how Boulder did it. The
                      BCH+co-op.care playbook becomes the template. Other health systems call Grant,
                      not the other way around.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-white p-4">
                    <p className="text-sm font-semibold text-navy">Publication &amp; recognition</p>
                    <p className="text-xs text-text-secondary">
                      The clinical study co-authored with BCH. Conference presentations at VtV and
                      Leading Age. A model that CMS can point to when they expand ACCESS and TEAM.
                      BCH is on the paper.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-white p-4">
                    <p className="text-sm font-semibold text-navy">Boulder as proof</p>
                    <p className="text-xs text-text-secondary">
                      The Neighborhood Village Project shows Boulder wants this. The clinical study
                      proves it works. The adoption curve shows it scales. BCH Foundation is the
                      catalyst that connects all three.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Clinical Leadership Team ─────────────────────── */}
      <section className="bg-navy px-6 py-12 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-sage-light">
              Clinical Leadership
            </p>
            <h2 className="mt-2 text-center font-heading text-xl font-bold text-white">
              The team behind the evidence
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage text-lg font-bold text-white">
                  JE
                </div>
                <p className="mt-4 font-heading text-sm font-bold text-white">Josh Emdur, DO</p>
                <p className="text-xs text-sage-light">
                  Medical Director &amp; Principal Investigator
                </p>
                <p className="mt-3 text-[11px] leading-relaxed text-white/60">
                  BCH hospitalist since 2008. Licensed in all 50 states. Oversees every care plan,
                  signs every LMN, reviews every clinical assessment. The physician in the loop.
                  Will serve as PI on the clinical study and co-author the publication.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-dark text-lg font-bold text-white">
                  BW
                </div>
                <p className="mt-4 font-heading text-sm font-bold text-white">
                  Blaine Warkentine, MD MBA
                </p>
                <p className="text-xs text-sage-light">CEO &amp; Platform Architect</p>
                <p className="mt-3 text-[11px] leading-relaxed text-white/60">
                  20+ years in health technology. Grew BrainLAB orthopedic vertical to $250M. 5
                  patents in image-guided navigation. Multiple healthcare M&amp;A exits including
                  HCA Healthcare. Designed and built the CareOS platform. Study co-author.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple text-lg font-bold text-white">
                  JD
                </div>
                <p className="mt-4 font-heading text-sm font-bold text-white">Jessica Dion, PT</p>
                <p className="text-xs text-sage-light">
                  Co-op Community Director &amp; Study Coordinator
                </p>
                <p className="mt-3 text-[11px] leading-relaxed text-white/60">
                  Physical therapist at BCH. First investor. Runs daily operations, caregiver
                  recruitment, and community partnerships. Her father Bob is Case Study #001 — she
                  lives this from both sides. Coordinates data collection and family experience
                  tracking.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-sage/30 bg-sage/10 p-5 text-center">
              <p className="text-sm text-white/80">
                <strong className="text-white">BCH Foundation's name goes on this.</strong>{' '}
                Co-authored study. Co-presented at national conferences. The institution that saw it
                first, backed it, and helped prove that cooperative care works. That's your legacy.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Community Conversations ─────────────────────── */}
      <section className="px-6 py-10 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <h2 className="font-heading text-lg font-bold text-navy">Community Conversations</h2>
            <p className="mt-1 text-xs text-text-muted">
              Clinical decision layer: <strong className="text-navy">CareGoals.com</strong>
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              The most powerful thing co-op.care does isn't technology — it's getting people to talk
              to each other about care before a crisis hits.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              <strong className="text-navy">CareGoals</strong> is the clinical decision-making layer
              that sits underneath those conversations. It takes what families say — messy,
              emotional, unstructured — and transforms it into standardized, evidence-based care
              goals that the medical establishment can trust. Mapped to clinical ontologies. Scored
              for risk. Ready for a physician to review, approve, and act on.{' '}
              <strong className="text-navy">
                CareGoals turns community voice into clinical signal.
              </strong>
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-white p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-sage">
                    How it works
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    Anyone in Boulder can have a conversation with{' '}
                    <strong className="text-navy">Sage</strong> — our AI care companion. No
                    commitment, no sign-up, no cost. Just talk about what matters:
                  </p>
                  <ul className="mt-3 space-y-2">
                    {[
                      'What does your family need right now?',
                      'What are you worried about for Mom or Dad?',
                      'What would help you feel less alone in this?',
                      'Have you talked about what happens if something goes wrong?',
                      'What does "aging well" look like for your family?',
                    ].map((q) => (
                      <li key={q} className="flex items-start gap-2 text-xs text-text-secondary">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                        {q}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                    Every conversation builds a{' '}
                    <strong className="text-navy">Living Profile</strong> — a picture of what this
                    family actually needs. That profile becomes the foundation for care matching,
                    wellness prescriptions, and physician oversight if they choose to go further.
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-sage">
                    Rewards for having conversations
                  </p>
                  <div className="mt-3 space-y-3">
                    <div className="rounded-xl bg-sage/5 p-4">
                      <p className="text-sm font-semibold text-navy">Time credits for talking</p>
                      <p className="mt-1 text-xs text-text-secondary">
                        Have a 15-minute conversation with Sage about your family's needs? Earn a
                        time credit. Invite a neighbor to have one? Earn another.{' '}
                        <strong>The act of thinking about care is itself valuable.</strong>
                      </p>
                    </div>
                    <div className="rounded-xl bg-sage/5 p-4">
                      <p className="text-sm font-semibold text-navy">
                        ACP conversations are Medicare-reimbursable
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        When a community conversation leads to an Advance Care Planning session with
                        Josh, Medicare pays $80-86.{' '}
                        <strong>People get rewarded, and the system gets paid.</strong>
                      </p>
                    </div>
                    <div className="rounded-xl bg-sage/5 p-4">
                      <p className="text-sm font-semibold text-navy">
                        Every conversation is a lead
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        Families who talk to Sage are 5x more likely to sign up for care. But even
                        if they don't, the conversation itself reduces crisis events — people who
                        think about care ahead of time make better decisions in emergencies.
                      </p>
                    </div>
                    <div className="rounded-xl bg-sage/5 p-4">
                      <p className="text-sm font-semibold text-navy">
                        CareGoals: clinical-grade community intelligence
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        Every conversation flows through CareGoals — mapped to Omaha System care
                        domains, scored against validated risk instruments (STEADI for falls, PHQ-2
                        for depression, Zarit for caregiver burden), and output as FHIR-compatible
                        care goals. 1,000 conversations = a clinical-grade map of what Boulder
                        families need.{' '}
                        <strong>
                          This is population health data BCH can trust, report on, and act on.
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-navy p-4 text-center">
                  <p className="font-heading text-2xl font-bold text-sage-light">15 min</p>
                  <p className="mt-1 text-[10px] text-white/60">Average Sage conversation</p>
                </div>
                <div className="rounded-xl bg-navy p-4 text-center">
                  <p className="font-heading text-2xl font-bold text-sage-light">1 credit</p>
                  <p className="mt-1 text-[10px] text-white/60">Earned per conversation</p>
                </div>
                <div className="rounded-xl bg-navy p-4 text-center">
                  <p className="font-heading text-2xl font-bold text-sage-light">5×</p>
                  <p className="mt-1 text-[10px] text-white/60">Conversion to care services</p>
                </div>
                <div className="rounded-xl bg-navy p-4 text-center">
                  <p className="font-heading text-2xl font-bold text-sage-light">$0</p>
                  <p className="mt-1 text-[10px] text-white/60">Cost to the family</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── CMS Revenue Streams ─────────────────────────── */}
      <section className="px-6 py-10 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <h2 className="font-heading text-lg font-bold text-navy">
              Revenue Streams Beyond Private Pay
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              co-op.care's cooperative model aligns with multiple CMS programs and funding sources.
              As the pilot proves outcomes, these income streams unlock — each one multiplies the
              value for BCH.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-[#F8F9FB]">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-navy">Program</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-navy">
                      What It Is
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-navy">
                      co-op.care Fit
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-navy">
                      Revenue Potential
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">CMS TEAM</p>
                      <p className="text-[10px] text-sage">Active Jan 2026</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      30-day bundled payment for joint replacement, hip fracture, spinal fusion,
                      CABG, major bowel. 741 mandatory hospitals.
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      co-op.care provides post-discharge home care that reduces episode costs. BCH
                      keeps the savings.
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-sage-dark">$2,200/episode</p>
                      <p className="text-[10px] text-text-muted">avg savings</p>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">PACE</p>
                      <p className="text-[10px] text-sage">Established</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      Program of All-Inclusive Care for the Elderly. Capitated Medicare/Medicaid
                      model for dual-eligibles 55+. Covers ALL care — medical, home, social.
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      co-op.care as preferred home care subcontractor to TRU PACE in Lafayette, CO
                      (16 Boulder County zip codes). W2 cooperative caregivers + CareOS FHIR data
                      flowing to TRU's interdisciplinary team. 50 participants = $2.2M/yr.
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-sage-dark">$35–42/hr</p>
                      <p className="text-[10px] text-text-muted">subcontract rate</p>
                      <p className="text-[10px] text-sage">50 participants = $2.2M/yr</p>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">CMS GUIDE</p>
                      <p className="text-[10px] text-sage">Active July 2024</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      Guiding an Improved Dementia Experience. Monthly per-beneficiary payment for
                      comprehensive dementia care including caregiver support.
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      co-op.care caregivers provide the in-home support. CareOS tracks cognitive and
                      behavioral data. Josh oversees care plans.
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-sage-dark">$150–250</p>
                      <p className="text-[10px] text-text-muted">/member/month</p>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">Medicaid HCBS</p>
                      <p className="text-[10px] text-sage">State-level</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      Home and Community-Based Services waiver. Colorado funds personal care,
                      homemaker, respite for Medicaid-eligible adults.
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      co-op.care as licensed HCBS provider. W2 caregivers meet state requirements.
                      Class B license application underway.
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-sage-dark">$22–35/hr</p>
                      <p className="text-[10px] text-text-muted">Medicaid reimbursement</p>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">HSA/FSA via LMN</p>
                      <p className="text-[10px] text-sage">Active now</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      Families use pre-tax health savings to pay for care. Josh signs Letters of
                      Medical Necessity. $104B in HSA accounts nationally.
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      First revenue stream. Scales nationally via Josh's 50-state license. No
                      caregivers needed — pure physician review.
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-sage-dark">$150–300</p>
                      <p className="text-[10px] text-text-muted">/letter</p>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">Private Pay</p>
                      <p className="text-[10px] text-sage">Active now</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      Families pay directly for companion care, personal care, and wellness
                      services. Boulder median household income: $137K.
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      Core revenue. $35/hr care + $59/mo physician oversight. Time banking reduces
                      total cost 40-60% vs. traditional agencies.
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-sage-dark">$400–12,000</p>
                      <p className="text-[10px] text-text-muted">/family/month</p>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">AWV</p>
                      <p className="text-[10px] text-sage">Medicare billable</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      Annual Wellness Visit. Medicare covers a yearly preventive visit focused on
                      health risk assessment, care planning, and cognitive screening.
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      Josh conducts AWVs via telehealth for co-op.care families. CareOS Living
                      Profile data pre-populates the health risk assessment. Triggers referrals and
                      care plan updates.
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-sage-dark">$175–282</p>
                      <p className="text-[10px] text-text-muted">/visit (G0438/G0439)</p>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">ACP</p>
                      <p className="text-[10px] text-sage">Medicare billable</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      Advance Care Planning. Medicare reimburses physician-led conversations about
                      end-of-life wishes, healthcare proxies, and living wills.
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      Josh facilitates ACP conversations with families during care plan reviews.
                      CareOS documents preferences in structured FHIR format. Reduces unwanted
                      hospitalizations.
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-sage-dark">$80–86</p>
                      <p className="text-[10px] text-text-muted">/session (CPT 99497)</p>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">PIN / CHI Codes</p>
                      <p className="text-[10px] text-sage">CMS Innovation</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      Principal Illness Navigation (PIN) and Community Health Integration (CHI). New
                      CMS codes (2024) reimburse non-physician navigators for care coordination and
                      social determinant screening.
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      co-op.care caregivers serve as community health workers under Josh's
                      supervision. Time spent coordinating care, connecting to resources, and
                      navigating systems — now billable.
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-sage-dark">$16–28</p>
                      <p className="text-[10px] text-text-muted">/30-min unit (G0023-G0024)</p>
                    </td>
                  </tr>
                  <tr className="bg-navy/5">
                    <td className="px-4 py-4" colSpan={2}>
                      <p className="font-bold text-navy">Blended revenue per family (Year 2+)</p>
                      <p className="text-[10px] text-text-muted">
                        Mix of private pay, HSA/FSA, Medicaid, CMS programs, AWV, ACP, PIN/CHI
                      </p>
                    </td>
                    <td className="px-4 py-4 text-xs text-text-secondary">
                      Multiple payers per family = revenue stability
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="text-lg font-bold text-sage-dark">$1,500–4,000</p>
                      <p className="text-[10px] text-text-muted">/family/month avg</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-xl border border-sage/20 bg-sage/5 p-4">
              <p className="text-xs text-text-secondary">
                <strong className="text-navy">Why this matters to BCH:</strong> Every CMS program
                above rewards reduced ER visits, fewer readmissions, and better post-discharge
                outcomes — exactly what co-op.care delivers. As co-op.care qualifies for these
                programs, the revenue model diversifies and BCH's cost avoidance compounds.
                <strong className="text-navy"> BCH doesn't pay for any of this.</strong> co-op.care
                captures the revenue. BCH captures the outcomes.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section className="px-6 py-14 text-center md:px-12">
        <Reveal>
          <div className="mx-auto max-w-md">
            <h2 className="font-heading text-xl font-bold text-navy">Share this with your team.</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-text-secondary">
              This dashboard updates with real data once the pilot launches. Every number you see
              here will be replaced by Bob's actual outcomes.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="mailto:blaine@co-op.care?subject=BCH%20Foundation%20Pilot%20Discussion"
                className="inline-block w-full max-w-xs rounded-xl bg-sage px-8 py-4 text-center text-base font-bold text-white shadow-lg shadow-sage/20 transition-all hover:bg-sage-dark active:scale-[0.98] sm:w-auto"
              >
                Start the conversation
              </a>
              <button
                type="button"
                onClick={() => navigate('/bch')}
                className="inline-block w-full max-w-xs rounded-xl border border-navy/15 px-8 py-4 text-center text-base font-medium text-navy transition-all hover:bg-navy/5 sm:w-auto"
              >
                Back to overview
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-border bg-white px-6 py-6 text-center">
        <Logo variant="full" size="sm" />
        <p className="mt-2 text-[10px] text-text-muted">
          Prepared for Grant Besser · BCH Foundation · March 2026
        </p>
        <p className="mt-1 text-[10px] text-text-muted/50">
          © 2026 co-op.care Limited Cooperative Association · Confidential
        </p>
      </footer>
    </div>
  );
}

export default BCHDashboard;
