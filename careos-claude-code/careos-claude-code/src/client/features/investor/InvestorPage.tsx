/**
 * InvestorPage — Private investor pitch page (unlisted, direct URL only)
 */
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';

const REVENUE_LAYERS = [
  {
    layer: 'Free Assessments',
    revenue: '$0',
    description: 'Sage conversation + CII assessment + Living Profile. Lead generation funnel.',
    margin: 'N/A',
  },
  {
    layer: 'LMN Service',
    revenue: '$150–300/letter',
    description:
      'AI-drafted Letters of Medical Necessity reviewed and signed by Josh Emdur, DO. National reach via 50-state license.',
    margin: '85%+',
  },
  {
    layer: 'Membership',
    revenue: '$59/month',
    description: 'Physician oversight, care coordination, HSA/FSA eligibility, Comfort Card.',
    margin: '70%',
  },
  {
    layer: 'Companion Care',
    revenue: '$400–12,000/month',
    description: 'Full service delivery with W-2 caregivers at $25-28/hr. Four tiers by acuity.',
    margin: '15–25%',
  },
  {
    layer: 'CMS Revenue',
    revenue: '$85–359/patient/mo',
    description: 'PIN (G0023-G0024), CHI (G0019-G0022), CCM (99490-99491) Medicare billing codes.',
    margin: '60%+',
  },
];

const TRACTION = [
  { label: 'Platform', value: 'Live', detail: 'CareOS — 95+ modules, 5,400+ lines' },
  {
    label: 'Co-Founder/CMO',
    value: 'Josh Emdur, DO',
    detail: '50-state licensed, NPI: 1649218389',
  },
  { label: 'Entity', value: 'LCA filed', detail: 'Colorado LCA — March 10, 2026' },
  { label: 'Stage', value: 'Pre-revenue', detail: '$15K capital across ventures' },
];

export default function InvestorPage() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      {/* Hero */}
      <section className="px-6 pb-8 pt-12 md:px-12 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-sage">Confidential</p>
          <h1 className="mt-4 font-heading text-3xl font-bold text-navy md:text-5xl">
            The physician platform for
            <br />
            aging-in-place care.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-text-secondary">
            63 million Americans provide unpaid care. $600B in economic value. Zero infrastructure.
            co-op.care is the operating system for community-based aging care —
            physician-supervised, worker-owned, and built to generate hospital-grade data from home
            visits.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="bg-navy px-6 py-14 md:px-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-white">The Problem</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { stat: '77%', label: 'Annual caregiver turnover at agencies' },
              { stat: '$16K', label: 'Average cost per hospital readmission' },
              { stat: '27 hrs', label: 'Unpaid care per week by family members' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-white/5 p-5 text-center"
              >
                <p className="font-heading text-3xl font-bold text-sage-light">{s.stat}</p>
                <p className="mt-1 text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm leading-relaxed text-white/70">
            Home care is a $100B+ market dominated by private equity extraction. Agencies charge
            $35-45/hr, pay caregivers $12-15/hr, deliver zero clinical data, and lose 77% of their
            workforce annually. Families get a revolving door of strangers. Hospitals get
            readmissions. Nobody wins.
          </p>
        </div>
      </section>

      {/* The Solution */}
      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-navy">The Solution: Three Moats</h2>
          <div className="mt-8 space-y-4">
            {[
              {
                title: 'Technology (CareOS)',
                detail:
                  'AI care companion (Sage) + Omaha System clinical coding + FHIR R4 data pipeline + autonomous LMN generation. Every visit produces structured health data.',
              },
              {
                title: 'Operations (We employ caregivers)',
                detail:
                  'W-2 workers at $25-28/hr with equity. 85% projected retention vs 23% industry. Same caregiver every week. Proof of value = our own P&L.',
              },
              {
                title: 'Ownership (Cooperative structure)',
                detail:
                  'Worker-owned cooperative. Caregivers earn equity as they work. Built-in change management. Aligned incentives at every level.',
              },
            ].map((m, i) => (
              <div
                key={m.title}
                className="flex gap-4 rounded-xl border border-border bg-white p-5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/10 font-heading text-sm font-bold text-sage">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-navy">{m.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">{m.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Model */}
      <section className="bg-warm-gray/40 px-6 py-16 md:px-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-navy">Revenue Model</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-navy/10">
                  <th className="py-3 text-left font-heading font-bold text-navy">Layer</th>
                  <th className="py-3 text-left font-heading font-bold text-navy">Revenue</th>
                  <th className="py-3 text-left font-heading font-bold text-navy">Margin</th>
                  <th className="hidden py-3 text-left font-heading font-bold text-navy md:table-cell">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {REVENUE_LAYERS.map((r) => (
                  <tr key={r.layer} className="border-b border-border/60">
                    <td className="py-3 font-medium text-text-primary">{r.layer}</td>
                    <td className="py-3 font-semibold text-sage-dark">{r.revenue}</td>
                    <td className="py-3 text-text-secondary">{r.margin}</td>
                    <td className="hidden py-3 text-xs text-text-secondary md:table-cell">
                      {r.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-text-muted">
            LMN revenue requires no license, no caregivers, no operations. At 5 hrs/week physician
            review time, generates $520K–$1M+/year in LMN revenue alone. Companion care layered on
            top as recurring revenue.
          </p>
        </div>
      </section>

      {/* CMS Balance Model */}
      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-navy">
            CMS Balance Model: GLP-1 + Lifestyle Support
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            GLP-1 drugs (Ozempic, Wegovy, Mounjaro) are entering Medicare/Medicaid coverage in
            2026-2027. CMS mandates lifestyle support alongside prescriptions but leaves
            implementation to manufacturers — creating a weak, unfunded mandate. co-op.care fills
            the gap as the premium lifestyle support layer.
          </p>
          <div className="mt-6 space-y-3">
            {[
              {
                title: 'CMS pays for the drug',
                detail: 'Medicare/Medicaid covers GLP-1 prescriptions starting 2026-2027.',
              },
              {
                title: 'We provide the lifestyle medicine',
                detail:
                  'Care Navigators deliver nutrition coaching, fitness programming, and behavior change support.',
              },
              {
                title: "Josh's LMN makes it HSA/FSA eligible",
                detail:
                  'One letter from a physician. Your health savings account pays for the lifestyle support.',
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-xl border border-border bg-white p-5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/10 font-heading text-sm font-bold text-sage">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-navy">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-sage/5 px-5 py-3 text-sm font-semibold text-sage-dark">
            "CMS pays for the drug. We provide the lifestyle medicine."
          </p>
        </div>
      </section>

      {/* Falls Prevention */}
      <section className="bg-navy px-6 py-16 md:px-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-white">Falls Prevention Pipeline</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            co-op.care prevents the fall. SurgeonAccess fixes the fracture. Two ventures, one
            clinical pipeline, aligned with CMS LEAD model (Jan 2027).
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: 'Video Home Safety Assessment',
                detail:
                  'Patent #7 — AI-analyzed 5-minute video walkthrough identifies fall hazards, generates structured Home Readiness Report.',
              },
              {
                title: 'Joint Falls Prevention Pipeline',
                detail:
                  'Patent #11 — Sensor data from GOX Labs Boost Kit feeds fall risk scoring, integrated with Omaha coding.',
              },
              {
                title: 'CMS LEAD Model',
                detail:
                  'January 2027 payment mechanism for evidence-based falls prevention. co-op.care positioned for Cohort 1.',
              },
              {
                title: 'SurgeonAccess Integration',
                detail:
                  'When prevention fails, SurgeonAccess connects patients to orthopedic surgeons under CMS ACCESS Model.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
                <h3 className="font-heading text-sm font-bold text-sage-light">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/60">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LMN Engine */}
      <section className="bg-warm-gray/40 px-6 py-16 md:px-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-navy">The LMN Engine (ALGS)</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Autonomous LMN Generation System — the core revenue engine.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            {[
              'Sage AI conversation builds a Living Profile from every interaction',
              'CII burnout assessment + CRI acuity assessment produce structured clinical data',
              'ALGS auto-drafts Letter of Medical Necessity from Omaha-coded data',
              'Josh reviews each LMN in 2-3 minutes ($50-75 per review)',
              'Signed LMN unlocks HSA/FSA eligibility for the family',
            ].map((step, i) => (
              <div
                key={step}
                className="flex items-start gap-3 rounded-lg border border-border bg-white px-5 py-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage text-xs font-bold text-white">
                  {i + 1}
                </span>
                <p className="text-sm text-text-primary">{step}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 rounded-xl bg-navy/5 px-5 py-4 text-center text-base font-semibold text-navy">
            "One letter from a doctor. Your HSA pays for Mom's care."
          </p>
        </div>
      </section>

      {/* Honest Positioning */}
      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-navy">Where We Are (Honest)</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Revenue', value: 'Pre-revenue', color: 'text-gold' },
              { label: 'Capital', value: '$15K total', color: 'text-gold' },
              { label: 'Entity', value: 'LCA filed March 10, 2026', color: 'text-sage-dark' },
              { label: 'Class B License', value: 'Not yet applied', color: 'text-gold' },
              { label: 'Caregivers', value: 'None hired yet', color: 'text-gold' },
              { label: 'Legal Review', value: 'HSA/FSA via LMN pending', color: 'text-gold' },
              { label: 'Platform', value: 'CareOS live, 95+ modules', color: 'text-sage-dark' },
              { label: 'Physician', value: 'Josh Emdur DO, co-founder', color: 'text-sage-dark' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3"
              >
                <span className="text-sm text-text-secondary">{item.label}</span>
                <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Traction */}
      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-navy">Traction</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {TRACTION.map((t) => (
              <div
                key={t.label}
                className="rounded-xl border border-border bg-white p-4 text-center"
              >
                <p className="text-xs text-text-muted">{t.label}</p>
                <p className="mt-1 font-heading text-lg font-bold text-navy">{t.value}</p>
                <p className="mt-0.5 text-[10px] text-text-muted">{t.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white px-6 py-16 md:px-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-navy">Leadership</h2>
          <div className="mt-6 space-y-4">
            {[
              {
                name: 'Blaine Warkentine, MD MBA',
                role: 'Architect & Co-Founder',
                detail:
                  'Grew BrainLAB ortho vertical to $250M. 3 strategic exits (HCA, Anytime Fitness, Paragon 28). 20+ years orthopedic technology and health system partnerships.',
              },
              {
                name: 'Josh Emdur, DO',
                role: 'Co-Founder & CMO',
                detail:
                  '50-state licensed physician (NPI: 1649218389). BCH contract hospitalist since 2008. Former CMO of SteadyMD. Signs every LMN for HSA/FSA eligibility. Medical Director for Colorado Class B license.',
              },
              {
                name: 'Jessica Dion',
                role: 'Co-op Community Director',
                detail:
                  'Physical therapist at BCH. Leads member engagement, caregiver recruitment, and wellness programs.',
              },
            ].map((p) => (
              <div key={p.name} className="flex gap-4 rounded-xl border border-border p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/10 font-heading text-sm font-bold text-sage">
                  {p.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-navy">{p.name}</p>
                  <p className="text-xs font-medium text-sage">{p.role}</p>
                  <p className="mt-1 text-xs text-text-secondary">{p.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy px-6 py-16 text-center md:px-12">
        <div className="mx-auto max-w-md">
          <h2 className="font-heading text-2xl font-bold text-white">Interested?</h2>
          <p className="mt-3 text-sm text-white/70">
            We'd love to share more about the co-op.care opportunity.
          </p>
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className="mt-6 rounded-full bg-sage px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-dark"
          >
            Schedule a conversation
          </button>
        </div>
      </section>

      {/* Confidential footer */}
      <div className="border-t border-border py-4 text-center text-[10px] text-text-muted">
        Confidential · co-op.care Limited Cooperative Association ·{' '}
        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </div>
    </PageLayout>
  );
}
