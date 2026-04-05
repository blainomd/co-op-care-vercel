/**
 * PricingPage — Three-tier pricing with HSA/FSA savings calculator
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { track } from '../../lib/analytics';

const FEATURE_EXPLANATIONS: Record<string, string> = {
  // Free tier
  'Sage AI care companion':
    "Talk naturally about your family's situation. Sage listens, remembers, and helps coordinate — no forms or portals.",
  '30-second burnout check':
    'Three quick questions that measure how heavy your caregiving load really is. Validated against clinical burnout scales.',
  'Living Profile (auto-built)':
    "Every conversation with Sage adds to a rich picture of your family's needs, preferences, and history. No data entry required.",
  'Care Intensity assessment':
    'Clinical-grade measurement of both caregiver burden (CII) and care recipient needs (CRI).',
  'Community resources':
    'Curated directory of Boulder County resources — respite care, support groups, financial assistance, and more.',
  // Membership tier
  'Everything in Free': 'All free features included automatically.',
  'Physician oversight (Josh Emdur, DO)':
    'Board-certified physician licensed in 50 states. Reviews your care plan quarterly and is available for clinical questions.',
  'Letter of Medical Necessity':
    'A signed physician letter that makes your care expenses eligible for HSA/FSA pre-tax spending.',
  'HSA/FSA eligibility (save 28-36%)':
    'At the 24% federal + 4.55% Colorado bracket, every dollar spent through HSA/FSA saves you ~29 cents in taxes.',
  'Care plan review & coordination':
    'Dr. Emdur reviews assessments, medications, and care goals. Your plan adapts as needs change.',
  'Priority caregiver matching':
    'Get matched first when new Care Neighbors join. We prioritize membership families for scheduling.',
  'Comfort Card digital wallet':
    'Your care profile, physician letter, and HSA/FSA documentation — all in one digital card.',
  // Care Plans tier
  'Everything in Membership': 'All membership features included automatically.',
  'Matched Care Neighbors ($25-28/hr)':
    'W-2 professional caregivers matched to your family. Same person every week — real relationships, not strangers.',
  'Same caregiver every week':
    "Continuity is everything. Your Care Neighbor knows Mom's routine, medications, and moods.",
  'Omaha System-coded visit data':
    'Every visit produces structured clinical data visible to Dr. Emdur. Hospital-grade documentation from home care.',
  'Yoga & wellness in every plan':
    'Movement, stretching, and mindfulness prescribed by Dr. Emdur. Payable via HSA/FSA.',
  'Time Bank community hours':
    'Earn hours by helping neighbors. Spend hours getting help. A community currency for care.',
  'Structured health intelligence':
    "Your family's data tells a story — trends, risks, and opportunities visible to both you and your physician.",
};

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Talk to Sage, understand your situation, and see what help looks like.',
    features: [
      'Sage AI care companion',
      '30-second burnout check',
      'Living Profile (auto-built)',
      'Care Intensity assessment',
      'Community resources',
    ],
    cta: 'Start free',
    ctaTo: '/card',
    accent: 'border-border',
    badge: null,
  },
  {
    name: 'Membership',
    price: '$59',
    period: '/month',
    description: 'Physician oversight, Letters of Medical Necessity, and HSA/FSA eligibility.',
    features: [
      'Everything in Free',
      'Physician oversight (Josh Emdur, DO)',
      'Letter of Medical Necessity',
      'HSA/FSA eligibility (save 28-36%)',
      'Care plan review & coordination',
      'Priority caregiver matching',
      'Comfort Card digital wallet',
    ],
    cta: 'Get started',
    ctaTo: '/card',
    accent: 'border-sage ring-2 ring-sage/10',
    badge: 'Most popular',
  },
  {
    name: 'Care Plans',
    price: '$400',
    period: '– $12,000/mo',
    description: 'Full companion care delivery with matched, retained caregivers.',
    features: [
      'Everything in Membership',
      'Matched Care Neighbors ($25-28/hr)',
      'Same caregiver every week',
      'Omaha System-coded visit data',
      'Yoga & wellness in every plan',
      'Time Bank community hours',
      'Structured health intelligence',
    ],
    cta: 'Contact us',
    ctaTo: '/contact',
    accent: 'border-navy',
    badge: null,
  },
];

function SavingsCalculator() {
  const [monthly, setMonthly] = useState(1500);
  const taxRate = 0.2855; // 24% federal + 4.55% CO
  const annualSavings = Math.round(monthly * 12 * taxRate);

  return (
    <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
      <h3 className="font-heading text-lg font-bold text-navy">HSA/FSA Savings Calculator</h3>
      <p className="mt-1 text-sm text-text-secondary">
        See how much you could save with a Letter of Medical Necessity.
      </p>
      <div className="mt-5">
        <label htmlFor="calc-monthly" className="block text-sm font-medium text-navy">
          Monthly care spend
        </label>
        <div className="mt-2 flex items-center gap-4">
          <input
            id="calc-monthly"
            type="range"
            min={200}
            max={12000}
            step={100}
            value={monthly}
            onChange={(e) => setMonthly(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-sage/20 accent-sage"
          />
          <span className="w-24 text-right font-heading text-lg font-bold text-navy">
            ${monthly.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-sage/5 p-4 text-center">
          <p className="text-xs text-text-muted">Annual care spend</p>
          <p className="mt-1 font-heading text-xl font-bold text-navy">
            ${(monthly * 12).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl bg-sage/10 p-4 text-center">
          <p className="text-xs text-text-muted">Annual tax savings</p>
          <p className="mt-1 font-heading text-xl font-bold text-sage-dark">
            ${annualSavings.toLocaleString()}
          </p>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-text-muted">
        Based on 24% federal + 4.55% Colorado state tax bracket. Actual savings depend on your
        marginal rate. HSA/FSA eligibility requires a valid LMN from Dr. Emdur.
      </p>
    </div>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();
  const [openFeatures, setOpenFeatures] = useState<Record<string, boolean>>({});
  const toggleFeature = (key: string) =>
    setOpenFeatures((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <PageLayout>
      {/* Hero */}
      <section className="px-6 pb-4 pt-12 md:px-12 md:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-sage">Simple, honest pricing</p>
          <h1 className="mt-3 font-heading text-3xl font-bold text-navy md:text-4xl">
            Care that fits your budget.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-text-secondary">
            Start free. Add physician oversight for $59/month. Scale care as you need it. Every tier
            includes HSA/FSA eligibility.
          </p>
        </div>
      </section>

      {/* Tiers */}
      <section className="px-6 py-10 md:px-12">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl border-2 ${tier.accent} bg-white p-6`}
            >
              {tier.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sage px-3 py-1 text-xs font-semibold text-white">
                  {tier.badge}
                </span>
              )}
              <div>
                <h3 className="font-heading text-lg font-bold text-navy">{tier.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-heading text-3xl font-bold text-navy">{tier.price}</span>
                  <span className="text-sm text-text-muted">{tier.period}</span>
                </div>
                <p className="mt-3 text-sm text-text-secondary">{tier.description}</p>
              </div>
              <ul className="mt-6 flex-1 space-y-1">
                {tier.features.map((f) => {
                  const featureKey = `${tier.name}::${f}`;
                  const isOpen = !!openFeatures[featureKey];
                  const explanation = FEATURE_EXPLANATIONS[f];
                  return (
                    <li key={f}>
                      <button
                        type="button"
                        onClick={() => explanation && toggleFeature(featureKey)}
                        className={`flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-text-primary transition-colors ${
                          explanation ? 'cursor-pointer hover:bg-sage/5' : 'cursor-default'
                        }`}
                      >
                        <svg
                          className="mt-0.5 h-4 w-4 shrink-0 text-sage"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="flex-1">{f}</span>
                        {explanation && (
                          <svg
                            className={`mt-0.5 h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>
                      {isOpen && explanation && (
                        <div className="ml-8 mr-2 mb-1 border-l-2 border-sage/40 pl-3 text-xs leading-relaxed text-text-secondary">
                          {explanation}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={() => {
                  track('pricing_cta_click', { tier: tier.name });
                  navigate(tier.ctaTo);
                }}
                className={`mt-6 w-full rounded-xl py-3.5 text-sm font-bold transition-all active:scale-[0.98] ${
                  tier.name === 'Membership'
                    ? 'bg-sage text-white shadow-lg shadow-sage/20 hover:bg-sage-dark'
                    : 'border border-navy/15 text-navy hover:bg-navy/5'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Savings Calculator */}
      <section className="px-6 py-10 md:px-12">
        <div className="mx-auto max-w-xl">
          <SavingsCalculator />
        </div>
      </section>

      {/* FAQ snippet */}
      <section className="bg-warm-gray/40 px-6 py-14 text-center md:px-12">
        <h2 className="font-heading text-2xl font-bold text-navy">Questions about pricing?</h2>
        <p className="mt-3 text-sm text-text-secondary">
          Check our comprehensive FAQ or talk to Sage directly.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/faq')}
            className="rounded-full border border-navy/15 px-6 py-3 text-sm font-medium text-navy transition-colors hover:bg-navy/5"
          >
            Read FAQ
          </button>
          <button
            type="button"
            onClick={() => navigate('/card')}
            className="rounded-full bg-sage px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-dark"
          >
            Talk to Sage
          </button>
        </div>
      </section>
    </PageLayout>
  );
}
