/**
 * AgeAtHomePreview — Preview/explainer for the cooperative LTC insurance product
 *
 * Shows how current CareOS data feeds future underwriting for the
 * Age at Home cooperative long-term care insurance product (planned 2027).
 */

import { useState } from 'react';

/* ---------- FAQ data ---------- */
const FAQ_ITEMS = [
  {
    question: 'Is this insurance?',
    answer:
      'Not yet. Age at Home is a cooperative long-term care insurance product planned for launch in 2027. Today we are collecting the operational and clinical data through CareOS that will inform our actuarial models. No premiums are being collected and no coverage is being offered at this time.',
  },
  {
    question: 'How are premiums calculated?',
    answer:
      'Unlike traditional LTC insurance that uses individual medical underwriting, Age at Home will use community-rated premiums informed by anonymized, aggregate CareOS data. Members who participate in preventive care, Time Bank exchanges, and maintain healthy CII trajectories will benefit from lower group rates.',
  },
  {
    question: "What's covered?",
    answer:
      'The planned product will cover in-home companion care, personal care, skilled nursing visits, respite care, and adaptive equipment. Because our cooperative model reduces overhead and our data-driven prevention reduces claims, we project broader coverage at lower premiums than traditional LTC policies.',
  },
] as const;

/* ---------- Mock bar data for data stream cards ---------- */
const DATA_STREAMS = [
  {
    label: 'CII Scores Over Time',
    description: 'Longitudinal caregiver burden trajectories across families',
    bars: [68, 55, 48, 42, 38, 35],
    color: 'bg-sage',
  },
  {
    label: 'Hospitalization Risk',
    description: 'CRI-derived risk trends predict future care needs',
    bars: [25, 30, 28, 22, 18, 15],
    color: 'bg-copper',
  },
  {
    label: 'Time Bank Engagement',
    description: 'Community care hours reduce formal care utilization',
    bars: [12, 18, 24, 30, 35, 40],
    color: 'bg-sage',
  },
  {
    label: 'Medication Adherence',
    description: 'Omaha System tracking of medication management outcomes',
    bars: [70, 75, 82, 88, 90, 93],
    color: 'bg-gold',
  },
  {
    label: 'Wearable Vitals',
    description: 'Continuous biometric baselines via Apple Health integration',
    bars: [60, 62, 58, 65, 68, 70],
    color: 'bg-copper',
  },
];

/* ---------- Component ---------- */

export function AgeAtHomePreview() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* ===== Section 1: Hero ===== */}
      <section className="mb-10">
        <div className="rounded-xl bg-sage/10 border border-sage/30 p-6 md:p-8 text-center">
          {/* Shield icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sage/20">
            <svg
              className="h-7 w-7 text-sage"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3.375c-2.55 0-4.875.675-6.375 1.688C4.5 5.775 3.75 7.125 3.75 8.625v3.75c0 4.688 3.563 8.438 8.25 9.75 4.688-1.313 8.25-5.063 8.25-9.75v-3.75c0-1.5-.75-2.85-1.875-3.563C16.875 4.05 14.55 3.375 12 3.375z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12l1.5 1.5 3-3" />
            </svg>
          </div>

          <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
            Age at Home
          </h1>
          <p className="mt-2 text-lg text-sage font-medium">
            Cooperative Long-Term Care Insurance — Coming 2027
          </p>

          {/* Disclaimer banner */}
          <div className="mt-5 rounded-lg bg-gold/10 border border-gold/30 px-4 py-3">
            <p className="text-sm font-semibold text-gold">Important Notice</p>
            <p className="mt-1 text-sm text-text-secondary">
              Age at Home is our cooperative long-term care insurance product, planned for launch in
              2027. It is not a licensed insurance product today.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Section 2: The Problem ===== */}
      <section className="mb-10">
        <h2 className="font-heading text-2xl font-semibold text-text-primary mb-2">The Problem</h2>
        <p className="text-text-secondary mb-5">
          Long-term care is one of the largest uninsured financial risks facing American families.
          Most people are unaware of the cost — or simply cannot afford protection.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Stat card 1 */}
          <div className="rounded-xl border border-border bg-white p-4 text-center">
            <p className="text-3xl font-bold text-copper">$3,490</p>
            <p className="mt-1 text-sm text-text-muted">
              Average annual LTC premium for a 55-year-old couple
            </p>
          </div>

          {/* Stat card 2 */}
          <div className="rounded-xl border border-border bg-white p-4 text-center">
            <p className="text-3xl font-bold text-copper">70%</p>
            <p className="mt-1 text-sm text-text-muted">
              Of adults 65+ will need long-term care services
            </p>
          </div>

          {/* Stat card 3 */}
          <div className="rounded-xl border border-border bg-white p-4 text-center">
            <p className="text-3xl font-bold text-copper">$108,405</p>
            <p className="mt-1 text-sm text-text-muted">
              Median annual cost of a private nursing home room
            </p>
          </div>
        </div>
      </section>

      {/* ===== Section 3: Our Approach ===== */}
      <section className="mb-10">
        <h2 className="font-heading text-2xl font-semibold text-text-primary mb-2">Our Approach</h2>
        <p className="text-text-secondary mb-5">
          Cooperative ownership fundamentally changes how insurance works. Members share risk, share
          data, and share in the savings.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Card: Community-Rated */}
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-sage/10">
              <svg
                className="h-5 w-5 text-sage"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            </div>
            <h3 className="font-heading text-base font-semibold text-text-primary">
              Community-Rated Premiums
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Risk is pooled across the cooperative, not assessed individually. No one is priced out
              for pre-existing conditions.
            </p>
          </div>

          {/* Card: Data-Driven */}
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-sage/10">
              <svg
                className="h-5 w-5 text-sage"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
                />
              </svg>
            </div>
            <h3 className="font-heading text-base font-semibold text-text-primary">
              CareOS Data Improves Risk Models
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Real operational data from CareOS — CII scores, vitals, care patterns — feeds
              actuarial models that traditional insurers lack.
            </p>
          </div>

          {/* Card: Time Bank */}
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-sage/10">
              <svg
                className="h-5 w-5 text-sage"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-heading text-base font-semibold text-text-primary">
              Time Bank Hours Reduce Claims
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Community care hours delivered through the Time Bank reduce reliance on paid formal
              care, lowering overall claim costs.
            </p>
          </div>

          {/* Card: Preventive Care */}
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-sage/10">
              <svg
                className="h-5 w-5 text-sage"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </div>
            <h3 className="font-heading text-base font-semibold text-text-primary">
              Preventive Care via Omaha System
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Structured clinical assessments catch problems early. Early intervention reduces
              hospitalizations and long-term utilization.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Section 4: Data Feeding Underwriting ===== */}
      <section className="mb-10">
        <h2 className="font-heading text-2xl font-semibold text-text-primary mb-2">
          Data Feeding Underwriting
        </h2>
        <p className="text-text-secondary mb-5">
          Every interaction in CareOS generates data that will inform Age at Home actuarial models.
          Here is what we are collecting today.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {DATA_STREAMS.map((stream) => (
            <div key={stream.label} className="rounded-xl border border-border bg-white p-4">
              <h3 className="font-heading text-sm font-semibold text-text-primary">
                {stream.label}
              </h3>
              <p className="mt-1 text-xs text-text-muted">{stream.description}</p>

              {/* Mini bar chart */}
              <div className="mt-3 flex items-end gap-1.5 h-12">
                {stream.bars.map((value, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${stream.color} opacity-${60 + i * 8 > 100 ? 100 : 60 + i * 8}`}
                    style={{ height: `${value}%` }}
                  />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-text-muted">
                <span>6 mo ago</span>
                <span>Now</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Section 5: Projected Benefits ===== */}
      <section className="mb-10">
        <h2 className="font-heading text-2xl font-semibold text-text-primary mb-2">
          Projected Benefits
        </h2>
        <p className="text-text-secondary mb-5">
          By combining cooperative economics with data-driven prevention, we project significantly
          lower premiums than traditional LTC insurance.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Traditional */}
          <div className="rounded-xl border border-border bg-warm-gray p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Traditional LTC Insurance
            </p>
            <p className="mt-2 text-3xl font-bold text-text-primary">
              $3,490
              <span className="text-base font-normal text-text-muted">/yr</span>
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Average for a 55-year-old couple. Individual underwriting. Rates increase with age and
              health conditions.
            </p>
          </div>

          {/* Age at Home */}
          <div className="rounded-xl border-2 border-sage bg-sage/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-sage">
              Age at Home (Projected)
            </p>
            <p className="mt-2 text-3xl font-bold text-sage">
              $1,800–2,400
              <span className="text-base font-normal text-sage/70">/yr</span>
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Community-rated. Cooperative dividends reinvested. Projected savings from data and
              prevention.
            </p>
          </div>
        </div>

        {/* Savings breakdown */}
        <div className="mt-4 rounded-xl border border-border bg-white p-4">
          <h3 className="font-heading text-sm font-semibold text-text-primary mb-3">
            Where the Savings Come From
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Cooperative model (no shareholders)</span>
                <span className="font-semibold text-sage">-20%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-warm-gray">
                <div className="h-full w-[20%] rounded-full bg-sage" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Preventive data reduces claims</span>
                <span className="font-semibold text-sage">-15%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-warm-gray">
                <div className="h-full w-[15%] rounded-full bg-sage" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Community care via Time Bank</span>
                <span className="font-semibold text-sage">-10%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-warm-gray">
                <div className="h-full w-[10%] rounded-full bg-sage" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Section 6: Timeline ===== */}
      <section className="mb-10">
        <h2 className="font-heading text-2xl font-semibold text-text-primary mb-5">Timeline</h2>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {/* Phase 1 */}
            <div className="relative flex gap-4">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage text-white text-sm font-bold">
                1
              </div>
              <div className="rounded-xl border border-border bg-white p-4 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-sage/10 px-2.5 py-0.5 text-xs font-medium text-sage">
                    Now
                  </span>
                </div>
                <h3 className="font-heading text-base font-semibold text-text-primary mt-1">
                  Data Collection via CareOS
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  CII assessments, Time Bank exchanges, vitals, and Omaha System observations
                  building the data foundation.
                </p>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="relative flex gap-4">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/60 text-white text-sm font-bold">
                2
              </div>
              <div className="rounded-xl border border-border bg-white p-4 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
                    2026
                  </span>
                </div>
                <h3 className="font-heading text-base font-semibold text-text-primary mt-1">
                  Actuarial Modeling
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Partner with actuarial firms to build cooperative-specific risk models from
                  de-identified CareOS data.
                </p>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="relative flex gap-4">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/40 text-white text-sm font-bold">
                3
              </div>
              <div className="rounded-xl border border-border bg-white p-4 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-copper/10 px-2.5 py-0.5 text-xs font-medium text-copper">
                    2027
                  </span>
                </div>
                <h3 className="font-heading text-base font-semibold text-text-primary mt-1">
                  Insurance Product Launch
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Licensed cooperative LTC insurance product available to co.op.care member families
                  in Colorado.
                </p>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="relative flex gap-4">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/25 text-white text-sm font-bold">
                4
              </div>
              <div className="rounded-xl border border-border bg-white p-4 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-warm-gray px-2.5 py-0.5 text-xs font-medium text-text-muted">
                    2028
                  </span>
                </div>
                <h3 className="font-heading text-base font-semibold text-text-primary mt-1">
                  Multi-City Expansion
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Replicate the model to federated cooperatives in other states, each contributing
                  data to improve group rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Section 7: Interest Form ===== */}
      <section className="mb-10">
        <div className="rounded-xl border border-border bg-sage/5 p-6 text-center">
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-2">
            Stay Informed
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Be the first to know when Age at Home launches.
          </p>

          {submitted ? (
            <div className="rounded-lg bg-sage/10 border border-sage/30 px-4 py-3">
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="h-5 w-5 text-sage"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-medium text-sage">
                  We will notify you when Age at Home launches.
                </p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleNotify}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage sm:w-64"
              />
              <button
                type="submit"
                className="rounded-lg bg-sage px-5 py-2.5 text-sm font-medium text-white hover:bg-sage-dark transition-colors"
              >
                Notify me when Age at Home launches
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ===== Section 8: FAQ ===== */}
      <section className="mb-10">
        <h2 className="font-heading text-2xl font-semibold text-text-primary mb-4">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <div key={index} className="rounded-xl border border-border bg-white">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <span className="font-heading text-base font-semibold text-text-primary">
                  {item.question}
                </span>
                <svg
                  className={`h-5 w-5 shrink-0 text-text-muted transition-transform ${
                    openFaq === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
              {openFaq === index && (
                <div className="border-t border-border px-4 py-3">
                  <p className="text-sm text-text-secondary">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Repeat disclaimer at bottom */}
      <div className="mb-6 rounded-lg bg-gold/10 border border-gold/30 px-4 py-3 text-center">
        <p className="text-xs text-text-muted">
          Age at Home is our cooperative long-term care insurance product, planned for launch in
          2027. It is not a licensed insurance product today. All projected premiums and savings are
          estimates based on cooperative and actuarial modeling assumptions.
        </p>
      </div>
    </div>
  );
}
