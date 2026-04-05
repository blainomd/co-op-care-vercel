/**
 * BCHPartnerPage — Private page for Grant Besser (BCH Foundation)
 *
 * Not linked from any nav. Accessible only via direct link: /#/bch
 * Tells the Boulder story with real numbers, Bob's case study,
 * the neighborhood model, and what BCH Foundation's role could be.
 */
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { TileIcon } from '../../components/TileIcon';

/* ── Reveal animation (scroll-triggered) ─────────────────────── */
import { useRef, useState, useEffect } from 'react';

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

/* ── Stat card ────────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Stat({
  value,
  label,
  accent = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-5 text-center ${accent ? 'border-2 border-sage/30 bg-sage/5' : 'border border-border bg-white'}`}
    >
      <p className={`font-heading text-2xl font-bold ${accent ? 'text-sage-dark' : 'text-navy'}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
    </div>
  );
}

export function BCHPartnerPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-warm-white">
      {/* ─── Nav ───────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-12">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="transition-opacity active:opacity-70"
        >
          <Logo variant="horizontal" size="sm" />
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-full border border-navy/15 px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-navy/5"
          >
            Home
          </button>
        </div>
      </nav>

      {/* ─── Hero — personal, not corporate ─────────────────── */}
      <section className="px-6 pb-6 pt-10 md:px-12 md:pt-16">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-sage">For Boulder Community Health Foundation</p>
            <h1 className="mt-3 font-heading text-[2.2rem] font-bold leading-[1.08] text-navy md:text-[2.8rem]">
              Five ER visits in one month.
              <br />
              <span className="text-sage">We're here to stop that.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-text-secondary">
              co-op.care is a worker-owned cooperative building a neighborhood care network in
              Boulder. Trusted caregivers. A real doctor. Technology that keeps everyone connected.
              And a model that transforms how your community ages.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ─── The Problem (Boulder-specific) ──────────────────── */}
      <section className="px-6 py-12 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-zone-red/20 bg-red-50/50 p-6 md:p-8">
              <p className="text-xs font-bold uppercase tracking-wider text-zone-red">
                The problem you described Monday
              </p>
              <h2 className="mt-3 font-heading text-xl font-bold text-navy">
                Patients leave BCH and fall through the cracks.
              </h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-4 text-center">
                  <p className="font-heading text-2xl font-bold text-zone-red">$2,500</p>
                  <p className="mt-1 text-xs text-text-secondary">per day for a blocked bed</p>
                </div>
                <div className="rounded-xl bg-white p-4 text-center">
                  <p className="font-heading text-2xl font-bold text-zone-red">$16,000</p>
                  <p className="mt-1 text-xs text-text-secondary">average cost per readmission</p>
                </div>
                <div className="rounded-xl bg-white p-4 text-center">
                  <p className="font-heading text-2xl font-bold text-zone-red">77%</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    caregiver turnover industry-wide
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-text-secondary">
                Families scramble to find help. The help they find doesn't stay. Patients bounce
                back. BCH absorbs the cost. The cycle repeats.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Bob's Story — the first case ────────────────────── */}
      <section className="bg-warm-gray/40 px-6 py-14 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-sage">
              Case study — our first family
            </p>
            <h2 className="mt-3 font-heading text-xl font-bold text-navy">
              Bob Dion, Morningstar Senior Living
            </h2>
            <div className="mt-6 rounded-2xl border border-border bg-white p-6">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-navy">The situation</p>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    Bob has bounced back to the ER{' '}
                    <strong className="text-zone-red">5 times in the last month</strong> from
                    Morningstar. His daughter Jessica — a physical therapist at BCH — invested the
                    first $7,500 into co-op.care because she lived this problem every day, on both
                    sides of the hospital door.
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-navy">The plan</p>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    Bob moves into Jessica's home near BCH. Live-in caregivers share the space —
                    room and board in exchange for helping care for Bob. Dr. Josh Emdur oversees
                    everything from the platform. Real data. Real oversight. Bob stays home.
                  </p>
                </div>
              </div>
              <div className="mt-6 rounded-xl bg-sage/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/10 text-sage">
                    <TileIcon name="money" size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">The math on Bob alone</p>
                    <p className="text-xs text-text-secondary">
                      5 ER visits × $2,500+ each ={' '}
                      <strong className="text-zone-red">$12,500+ in one month</strong>. co-op.care
                      home care costs a fraction of that — and keeps him out of the ER entirely.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── The Team ─────────────────────────────────────────── */}
      <section className="px-6 py-14 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center font-heading text-xl font-bold text-navy">
              The team behind this
            </h2>
            <div className="mt-8 space-y-4">
              {[
                {
                  initials: 'JE',
                  color: 'bg-sage',
                  name: 'Josh Emdur, DO',
                  role: 'Medical Director & Co-Founder',
                  detail:
                    'BCH hospitalist since 2008. Licensed in all 50 states. Reviews every care plan, signs every medical letter. The clinical authority.',
                },
                {
                  initials: 'JD',
                  color: 'bg-purple',
                  name: 'Jessica Dion, PT',
                  role: 'Co-op Community Director',
                  detail:
                    'Physical therapist at BCH. First investor ($7,500). Runs day-to-day operations. Her father Bob is our first case. This is personal.',
                },
                {
                  initials: 'BW',
                  color: 'bg-navy',
                  name: 'Blaine Warkentine, MD/MBA',
                  role: 'CEO & Platform Architect',
                  detail:
                    "20+ years in health technology. Built BrainLAB's orthopedic vertical to $250M. Designed the CareOS platform that powers everything.",
                },
              ].map((p) => (
                <div
                  key={p.name}
                  className="flex items-start gap-4 rounded-xl border border-border bg-white p-5"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${p.color} text-sm font-bold text-white`}
                  >
                    {p.initials}
                  </div>
                  <div>
                    <p className="font-heading text-sm font-bold text-navy">{p.name}</p>
                    <p className="text-xs font-medium text-sage">{p.role}</p>
                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">{p.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── The Technology ────────────────────────────────────── */}
      <section className="bg-warm-gray/40 px-6 py-14 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-2xl">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-sage">
              The technology
            </p>
            <h2 className="mt-2 text-center font-heading text-xl font-bold text-navy">
              A platform that makes this scalable
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-center text-sm text-text-secondary">
              This isn't just people showing up. It's a full technology platform that coordinates
              care, generates clinical data, and keeps a physician in the loop.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: 'brain',
                  title: 'Sage AI Companion',
                  detail:
                    'Families talk to Sage to tell their story, get matched with care, and track how things are going. Voice-first, 8th-grade reading level.',
                },
                {
                  icon: 'stethoscope',
                  title: 'Physician oversight layer',
                  detail:
                    'Dr. Emdur reviews AI-generated care assessments and signs medical letters that unlock families\u2019 pre-tax health savings.',
                },
                {
                  icon: 'chart',
                  title: 'Real health data from every visit',
                  detail:
                    'Structured data flows from every caregiver visit \u2014 not just a checkbox. Mapped to clinical standards BCH can actually use.',
                },
                {
                  icon: 'community',
                  title: 'Time banking & care coordination',
                  detail:
                    'Neighbors earn credit for helping each other. The platform tracks every hour, schedules every visit, and connects the whole community.',
                },
                {
                  icon: 'pulse',
                  title: 'Wellness as prescribed care',
                  detail:
                    'Yoga, movement, breathing exercises \u2014 prescribed by Josh, tracked by the platform, payable with health savings. Reduces falls and readmissions.',
                },
                {
                  icon: 'shield',
                  title: 'Pre-tax health savings unlock',
                  detail:
                    'Families save 28\u201336% on care costs by using HSA/FSA dollars. Josh signs the medical letters that make it possible.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-white p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sage/10 text-sage">
                      <TileIcon name={item.icon} size={20} />
                    </div>
                    <div>
                      <p className="font-heading text-sm font-bold text-navy">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── The Boulder Vision ───────────────────────────────── */}
      <section className="px-6 py-14 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center font-heading text-xl font-bold text-navy">
              What Boulder looks like in 12 months
            </h2>
            <div className="mt-8 space-y-0">
              {[
                {
                  phase: 'Month 1\u20133',
                  title: 'First home, first family',
                  detail:
                    'Bob moves in. 2\u20133 live-in caregivers. Jessica runs operations. Josh oversees clinically. Platform tracks everything. Prove the model works.',
                  active: true,
                },
                {
                  phase: 'Month 3\u20136',
                  title: '3\u20135 homes near BCH',
                  detail:
                    'Recruit care neighbors from the community. Convert nearby homes with ADUs. Each home serves 1\u20132 residents with live-in caregivers. W2 wages, benefits, housing.',
                },
                {
                  phase: 'Month 6\u201312',
                  title: 'A neighborhood care network',
                  detail:
                    'A quiet network of care homes within walking distance of BCH. Not a facility. Not an institution. Neighbors caring for neighbors, with a doctor watching over it and technology connecting everyone.',
                },
                {
                  phase: 'Year 2+',
                  title: 'Federation across Colorado',
                  detail:
                    'Replicate the model to other communities. Each co-op is locally owned. The platform, physician network, and cooperative structure travel. Boulder is the proof.',
                },
              ].map((step, i) => (
                <div key={step.phase} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step.active ? 'bg-sage text-white' : 'border-2 border-border bg-white text-text-muted'}`}
                    >
                      {i + 1}
                    </div>
                    {i < 3 && <div className="my-1 h-full w-px bg-border" />}
                  </div>
                  <div className="pb-8">
                    <p
                      className={`text-xs font-bold uppercase tracking-wider ${step.active ? 'text-sage' : 'text-text-muted'}`}
                    >
                      {step.phase}
                    </p>
                    <p className="mt-1 font-heading text-sm font-bold text-navy">{step.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Financial Model ──────────────────────────────────── */}
      <section className="bg-navy px-6 py-14 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-2xl">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-sage-light">
              The financial picture
            </p>
            <h2 className="mt-2 text-center font-heading text-xl font-bold text-white">
              What this costs. What it saves.
            </h2>

            {/* Cost comparison */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-zone-red/80">
                  Without co-op.care
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">ER visit (avg)</span>
                    <span className="font-semibold text-white">$2,500</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Readmission (avg)</span>
                    <span className="font-semibold text-white">$16,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Blocked bed / day</span>
                    <span className="font-semibold text-white">$2,500</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Caregiver turnover</span>
                    <span className="font-semibold text-white">77%</span>
                  </div>
                  <div className="mt-2 border-t border-white/10 pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Bob's last month alone</span>
                      <span className="font-bold text-zone-red">$12,500+</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-sage/30 bg-sage/10 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-sage-light">
                  With co-op.care
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Home care (per hr)</span>
                    <span className="font-semibold text-white">$35</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Physician oversight</span>
                    <span className="font-semibold text-white">$59/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Live-in (room + board)</span>
                    <span className="font-semibold text-white">Included</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Caregiver retention</span>
                    <span className="font-semibold text-sage-light">85%</span>
                  </div>
                  <div className="mt-2 border-t border-white/10 pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Bob's projected month</span>
                      <span className="font-bold text-sage-light">~$1,800</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings projection */}
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-sm text-white/70">Projected savings per family per year</p>
              <p className="mt-2 font-heading text-3xl font-bold text-sage-light">
                $25,000 – $120,000
              </p>
              <p className="mt-2 text-xs text-white/50">
                Based on avoided ER visits, prevented readmissions, and reduced institutional care
                costs. Multiply by 10 families and the numbers transform BCH's community health
                metrics.
              </p>
            </div>

            {/* 10-home model */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="font-heading text-2xl font-bold text-sage-light">10</p>
                <p className="mt-1 text-xs text-white/60">Care homes in Year 1</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="font-heading text-2xl font-bold text-sage-light">15–20</p>
                <p className="mt-1 text-xs text-white/60">Residents served</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="font-heading text-2xl font-bold text-sage-light">25–30</p>
                <p className="mt-1 text-xs text-white/60">Care neighbors employed</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── What BCH Foundation's role could be ──────────────── */}
      <section className="px-6 py-14 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center font-heading text-xl font-bold text-navy">
              What a partnership looks like
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-center text-sm text-text-secondary">
              We're not asking BCH Foundation to fund a startup. We're asking you to help build a
              community asset that reduces your costs and keeps your patients home.
            </p>

            <div className="mt-8 space-y-3">
              {[
                {
                  icon: 'phone',
                  title: 'Referral pipeline',
                  detail:
                    'When BCH discharges a patient who needs home support, co-op.care is the answer. A warm handoff, not a pamphlet.',
                },
                {
                  icon: 'community',
                  title: 'Community co-investment',
                  detail:
                    'Foundation grant funding to help establish the first 3\u20135 care homes near BCH. Every dollar avoids multiples in ER and readmission costs.',
                },
                {
                  icon: 'chart',
                  title: 'Shared outcomes data',
                  detail:
                    'We give BCH real data on post-discharge outcomes \u2014 falls prevented, ER visits avoided, medication adherence. The data you need for CMS reporting.',
                },
                {
                  icon: 'home',
                  title: 'Neighborhood anchor',
                  detail:
                    'BCH Foundation becomes the catalyst for a new model of aging in Boulder. Not another facility \u2014 a community that takes care of its own.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-xl border border-border bg-white p-5 transition-all hover:border-sage/30 hover:shadow-md hover:shadow-sage/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sage/10 text-sage">
                    <TileIcon name={item.icon} size={20} />
                  </div>
                  <div>
                    <p className="font-heading text-sm font-bold text-navy">{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="bg-warm-gray/40 px-6 py-16 md:px-12">
        <Reveal>
          <div className="mx-auto max-w-md text-center">
            <h2 className="font-heading text-2xl font-bold text-navy">
              Let's build this together.
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-text-secondary">
              Bob is waiting. The model is ready. The team is here. We'd love to show you what the
              platform can do.
            </p>
            <a
              href="mailto:blaine@co-op.care?subject=BCH%20Foundation%20%2B%20co-op.care"
              className="mt-6 inline-block w-full max-w-xs rounded-xl bg-sage px-8 py-4 text-center text-base font-bold text-white shadow-lg shadow-sage/20 transition-all hover:bg-sage-dark active:scale-[0.98]"
            >
              Let's talk
            </a>
            <button
              type="button"
              onClick={() => navigate('/bch/dashboard')}
              className="mt-3 inline-block w-full max-w-xs rounded-xl border border-navy/15 px-8 py-4 text-center text-base font-medium text-navy transition-all hover:bg-navy/5"
            >
              View the KPI Dashboard →
            </button>
            <p className="mt-3 text-xs text-text-muted">
              blaine@co-op.care · Josh and Jess are copied on every conversation.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ─── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-warm-white px-6 py-6 text-center">
        <Logo variant="full" size="sm" />
        <p className="mt-2 text-[10px] text-text-muted">
          Boulder, Colorado · Pre-launch 2026 · Doctor-supervised care
        </p>
        <p className="mt-1 text-[10px] text-text-muted/50">
          Prepared for Grant Besser · BCH Foundation · March 2026
        </p>
        <p className="mt-1 text-[10px] text-text-muted/50">
          © 2026 co-op.care Limited Cooperative Association · Confidential
        </p>
      </footer>
    </div>
  );
}

export default BCHPartnerPage;
