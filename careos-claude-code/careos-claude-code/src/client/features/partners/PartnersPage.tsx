/**
 * PartnersPage — Dedicated page for healthcare partners
 *
 * Hospitals, clinics, health plans. Different buying persona
 * than families — they need data, ROI, and clinical language.
 * This page can be shared internally with hospital admin teams.
 */
import { useState } from 'react';
import { TileIcon } from '../../components/TileIcon';
import PageLayout from '../../components/layout/PageLayout';
import { track } from '../../lib/analytics';

function AnimatedStat({ stat, label }: { stat: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 text-center">
      <p className="font-heading text-2xl font-bold text-sage-dark">{stat}</p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
    </div>
  );
}

export function PartnersPage() {
  return (
    <PageLayout>
      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="px-6 pb-8 pt-12 md:px-12 md:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-sage">For healthcare partners &amp; employers</p>
          <h1 className="mt-3 font-heading text-[2.4rem] font-bold leading-[1.1] text-navy md:text-[3rem]">
            We deliver the human capital
            <br />
            for the last mile.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-text-secondary">
            Blocked beds cost $2,500 per day. Readmissions cost $16,000 each. co-op.care provides
            the trusted, retained caregivers that pick up where your discharge plan ends.
          </p>
        </div>
      </section>

      {/* ─── Key Stats ──────────────────────────────────────── */}
      <section className="px-6 py-10 md:px-12">
        <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-3">
          <AnimatedStat stat="$2,500" label="per day for a blocked bed" />
          <AnimatedStat stat="15.4%" label="average readmission rate" />
          <AnimatedStat stat="85%" label="caregiver retention (vs. 23% industry)" />
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────── */}
      <section className="bg-warm-gray/40 px-6 py-16 md:px-12">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <p className="text-sm font-medium text-sage">How it works</p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-navy">
              From discharge to home in 48 hours.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              {
                icon: 'phone',
                title: 'Refer a patient',
                detail: 'Send us the family at discharge. One call.',
              },
              {
                icon: 'home',
                title: 'We set up care',
                detail: 'Matched caregiver in the home within 48 hours.',
              },
              {
                icon: 'chart',
                title: 'Real health data',
                detail: 'Every visit generates data your team can use.',
              },
              {
                icon: 'check',
                title: 'Patient stays home',
                detail: 'Fewer readmissions. Fewer blocked beds.',
              },
            ].map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-sage shadow-sm">
                  <TileIcon name={s.icon} size={22} />
                </div>
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-text-muted">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <p className="font-heading text-sm font-bold text-navy">{s.title}</p>
                <p className="mt-1 text-xs text-text-secondary">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── What Makes Us Different ────────────────────────── */}
      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <h2 className="font-heading text-2xl font-bold text-navy">What makes us different</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-text-secondary">
              co-op.care isn't another staffing agency. Our cooperative model solves the retention
              crisis that makes home care unreliable.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: 'community',
                title: 'Caregivers who own the company',
                detail:
                  'Our caregivers are W-2 employees with equity. They don\u2019t quit because they\u2019re building something.',
              },
              {
                icon: 'chart',
                title: 'Structured health data',
                detail:
                  'Every visit generates data your team can actually use \u2014 not just a checkbox that someone showed up.',
              },
              {
                icon: 'stethoscope',
                title: 'Physician oversight built in',
                detail:
                  'A real doctor reviews every care plan. Josh Emdur, DO \u2014 50-state licensed, local hospitalist since 2008.',
              },
              {
                icon: 'money',
                title: 'Zero upfront cost',
                detail:
                  'We bill families directly. No cost to your organization. No contracts. No risk.',
              },
              {
                icon: 'pulse',
                title: 'Wellness-integrated care',
                detail:
                  'Yoga, movement, and breathing exercises prescribed as part of the care plan \u2014 reducing falls, improving sleep, and lowering readmission risk.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-white p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sage/10 text-sage">
                    <TileIcon name={item.icon} size={20} />
                  </div>
                  <div>
                    <p className="font-heading text-sm font-bold text-navy">{item.title}</p>
                    <p className="mt-1 text-xs text-text-secondary">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CMS TEAM Model ─────────────────────────────────── */}
      <section className="bg-red-50 px-6 py-14 md:px-12">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-red-600">Now active</p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-navy">
              CMS TEAM Model Changes Everything
            </h2>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { stat: '741', label: 'Mandatory hospitals' },
              { stat: '2/3', label: 'Projected to lose money' },
              { stat: '30 days', label: 'Post-discharge bundle' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-red-200 bg-white p-4 text-center"
              >
                <p className="font-heading text-2xl font-bold text-red-600">{s.stat}</p>
                <p className="mt-1 text-xs text-text-secondary">{s.label}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-text-secondary">
            CMS's Transforming Episode Accountability Model (TEAM) went live{' '}
            <strong>January 1, 2026</strong>. It bundles payment for joint replacement, hip
            fracture, spinal fusion, CABG, and major bowel procedures across a 30-day post-discharge
            episode. Every discharge without coordination is now costing hospitals money.
          </p>
          <p className="mt-3 text-sm font-semibold text-navy">
            co-op.care's post-discharge services directly reduce the episode cost TEAM measures — at
            $35/hr vs. $38-45/hr from competitors. Our care plans include prescribed wellness
            activities — yoga, guided movement, and balance exercises — that reduce fall risk and
            accelerate recovery. This isn't a nice-to-have. It's a financial necessity.
          </p>
        </div>
      </section>

      {/* ─── ROI + The Numbers ─────────────────────────────────── */}
      <section className="bg-navy px-6 py-14 md:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            {[
              { stat: '$2,500', label: 'Per day for a blocked bed' },
              { stat: '15.4%', label: 'Average readmission rate' },
              { stat: '48 hrs', label: 'To matched caregiver' },
              { stat: '85%', label: 'Caregiver retention' },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-heading text-3xl font-bold text-sage-light">{s.stat}</p>
                <p className="mt-1 text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-sm text-white/70">Projected 90-day pilot ROI</p>
            <p className="mt-2 font-heading text-3xl font-bold text-sage-light">
              $23,000 – $69,000
            </p>
            <p className="mt-2 text-xs text-white/50">
              Based on 5-10 families, 1-3 avoided readmissions at $15K each + TEAM episode cost
              reductions. Zero cost to your organization.
            </p>
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────── */}
      <PartnerContactForm />
    </PageLayout>
  );
}

function PartnerContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    track('partner_inquiry');
    try {
      await fetch('/api/v1/contact/schedule-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          role: 'partner',
          message: `Org: ${org}\n\n${message}`,
        }),
      });
    } catch {
      const subject = encodeURIComponent('Healthcare Partnership Inquiry');
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nOrg: ${org}\n\n${message}`);
      window.open(`mailto:blaine@co-op.care?subject=${subject}&body=${body}`, '_self');
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="px-6 py-16 text-center md:px-12">
        <div className="mx-auto max-w-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/10">
            <svg
              className="h-7 w-7 text-sage"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 font-heading text-2xl font-bold text-navy">We'll be in touch</h2>
          <p className="mt-2 text-sm text-text-secondary">Expect a response within 24 hours.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold text-navy">Let's talk about a pilot.</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm text-text-secondary">
            Zero upfront investment. We handle everything. Start with 10 families and see the data.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="partner-name" className="block text-sm font-medium text-navy">
              Your name
            </label>
            <input
              id="partner-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
            />
          </div>
          <div>
            <label htmlFor="partner-email" className="block text-sm font-medium text-navy">
              Work email
            </label>
            <input
              id="partner-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
            />
          </div>
          <div>
            <label htmlFor="partner-org" className="block text-sm font-medium text-navy">
              Organization
            </label>
            <input
              id="partner-org"
              type="text"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
              placeholder="Hospital, health system, employer..."
            />
          </div>
          <div>
            <label htmlFor="partner-message" className="block text-sm font-medium text-navy">
              How can we help? <span className="text-text-muted">(optional)</span>
            </label>
            <textarea
              id="partner-message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-sage px-8 py-4 text-base font-bold text-white shadow-lg shadow-sage/20 transition-all hover:bg-sage-dark active:scale-[0.98]"
          >
            Schedule a conversation
          </button>
          <p className="text-center text-xs text-text-muted">
            Or email{' '}
            <a href="mailto:blaine@co-op.care" className="text-sage hover:text-sage-dark">
              blaine@co-op.care
            </a>{' '}
            directly
          </p>
        </form>
      </div>
    </section>
  );
}

export default PartnersPage;
