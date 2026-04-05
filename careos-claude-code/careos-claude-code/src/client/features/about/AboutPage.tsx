/**
 * AboutPage — The co-op.care story, cooperative model, and team
 * Restored from archive, wrapped in PageLayout with accessibility.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';

const NAME = 'co-op.care';

const COOP_PILLARS = [
  {
    title: 'Workers Earn Equity',
    description:
      'Professional caregivers earn $25-28/hr in wages plus equity in the cooperative. Over five years, a full-time worker-owner accumulates approximately $52,000 in equity beyond their wages. Real ownership built through labor.',
  },
  {
    title: 'One Member, One Vote',
    description: `Every cooperative member has an equal voice in governance decisions regardless of hours worked or invested. Worker-owners elect the board, approve budgets, and set strategic direction together.`,
  },
  {
    title: 'Patronage Dividends',
    description:
      'When the cooperative generates surplus revenue, it is distributed back to members as patronage dividends based on participation. Shared prosperity under IRS Subchapter T cooperative tax treatment.',
  },
  {
    title: 'Colorado LCA Structure',
    description: `${NAME} is organized as a Colorado Limited Cooperative Association (LCA) — a legal structure designed for cooperatives that blend worker and investor membership while preserving democratic governance.`,
  },
];

const GROWTH_TARGETS = [
  {
    label: 'Care Hours Target',
    value: '10,000+',
    note: 'Year 1',
    detail:
      'Based on 50+ families receiving an average of 4 hours/week of companion care, supplemented by Time Bank community hours.',
  },
  {
    label: 'Families Served',
    value: '50+',
    note: 'Year 1',
    detail:
      'Starting with post-discharge families from Boulder Community Health — orthopedic, cardiac, and palliative care transitions.',
  },
  {
    label: 'Caregiver Retention',
    value: '85%+',
    note: 'vs 23% industry avg',
    detail:
      'Industry average is 23% (BLS 2024). CHCA, the Bronx cooperative with 600+ worker-owners, achieves 85% retention through the same model.',
  },
  {
    label: 'Tax Savings',
    value: '28-36%',
    note: 'via Comfort Card',
    detail:
      'A Letter of Medical Necessity from Josh Emdur, DO makes care expenses eligible for HSA/FSA pre-tax spending. At the 24% federal + 4.55% CO bracket, families save 28-36%.',
  },
];

const PARTNERS = [
  {
    name: 'Boulder Community Health',
    role: 'Partnership Development',
    description:
      'Collaborating on discharge planning and companion care referrals to reduce readmissions and extend care into the home.',
  },
  {
    name: 'Colorado CDPHE',
    role: 'State Licensing (Pending)',
    description: `${NAME} will operate under Colorado Class B Home Care License with Josh Emdur, DO as Medical Director. Application pending.`,
  },
  {
    name: 'Opolis',
    role: 'Worker Benefits Platform',
    description:
      'Boulder-based digital employment cooperative providing W-2 payroll, Cigna PPO health insurance, and benefits administration for our worker-owners.',
  },
  {
    name: 'Aidbox',
    role: 'HIPAA-Compliant Data',
    description:
      'Health Samurai Aidbox provides FHIR R4-compliant clinical data storage, ensuring all health information meets federal privacy and security standards.',
  },
];

export default function AboutPage() {
  const navigate = useNavigate();
  const [openPillar, setOpenPillar] = useState<number | null>(null);
  const [openPartner, setOpenPartner] = useState<number | null>(null);
  const [openStat, setOpenStat] = useState<number | null>(null);

  return (
    <PageLayout>
      {/* Hero */}
      <section className="px-4 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-heading text-4xl font-bold leading-tight text-text-primary md:text-5xl">
            About {NAME}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary">
            A community-owned cooperative where neighbors help neighbors age with dignity at home.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-white px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-center text-3xl font-bold text-text-primary">
            Our Story
          </h2>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-text-secondary">
            <p>
              {NAME} was founded in Boulder, Colorado from a simple conviction: caregiving should
              not bankrupt families or burn out the people who do the work.
            </p>
            <p>
              The home care industry is broken. Agencies charge families $35/hr or more while paying
              caregivers minimum wage with no benefits, no equity, and no stability. The result is
              77% annual turnover. Families lose their trusted caregiver every few months. Nobody
              wins except the agency shareholders.
            </p>
            <p>
              {NAME} flips that model entirely. We are a worker-owned cooperative (Colorado Limited
              Cooperative Association, filed March 2026) where professional caregivers earn
              $25-28/hr with full W-2 benefits, health insurance, and real equity ownership. When
              caregivers are paid fairly and treated as owners, they stay. Our target retention rate
              is 85%.
            </p>
            <p>
              At the heart of our model is the physician platform: Josh Emdur, DO — our co-founder
              and CMO — holds medical licenses in all 50 states. He reviews every Letter of Medical
              Necessity, which unlocks HSA/FSA eligibility for families. One letter from a doctor.
              Your health savings account pays for Mom's care.
            </p>
            <p>
              For families, retention is everything. The same caregiver showing up week after week
              is the foundation of trust. Your mother does not have to explain her medications to a
              new stranger every month.
            </p>
            <p>
              We pair this professional care model with a community Time Bank where neighbors help
              neighbors with everyday needs. And through the Comfort Card, families save 28-36% on
              care costs by making expenses eligible for HSA and FSA pre-tax accounts.
            </p>
          </div>
        </div>
      </section>

      {/* Cooperative Model */}
      <section className="bg-warm-white px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-heading text-center text-3xl font-bold text-text-primary">
            The Cooperative Model
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-text-secondary">
            What makes a worker-owned cooperative different from every home care agency in America.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {COOP_PILLARS.map((pillar, i) => {
              const firstSentence = pillar.description.split('. ')[0] + '.';
              const isOpen = openPillar === i;
              return (
                <button
                  key={pillar.title}
                  type="button"
                  onClick={() => setOpenPillar(isOpen ? null : i)}
                  className="rounded-xl border border-border bg-white p-6 text-left transition-all duration-200 hover:shadow-md hover:border-sage/40 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-heading text-base font-semibold text-text-primary">
                      {pillar.title}
                    </h3>
                    <span
                      className="mt-0.5 text-sage transition-transform duration-200 flex-shrink-0"
                      style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                    >
                      ▾
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {firstSentence}
                  </p>
                  {isOpen && (
                    <div
                      className="mt-3 text-sm leading-relaxed text-text-secondary border-t border-border pt-3"
                      style={{ animation: 'fade-up 0.2s ease-out' }}
                    >
                      {pillar.description.substring(firstSentence.length).trim()}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Growth Targets */}
      <section className="bg-sage px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              Growth Projections
            </span>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {GROWTH_TARGETS.map((stat, i) => {
              const isOpen = openStat === i;
              return (
                <button
                  key={stat.label}
                  type="button"
                  onClick={() => setOpenStat(isOpen ? null : i)}
                  className="text-center cursor-pointer rounded-xl p-4 transition-all duration-200 hover:bg-white/10"
                >
                  <p className="font-heading text-3xl font-bold text-white md:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm font-medium text-white/90">{stat.label}</p>
                  <p className="mt-0.5 text-xs text-white/70">{stat.note}</p>
                  <span
                    className="mt-2 inline-block text-white/60 transition-transform duration-200 text-xs"
                    style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                  >
                    ▾
                  </span>
                  {isOpen && (
                    <div
                      className="mt-3 text-xs leading-relaxed text-white/80 border-t border-white/20 pt-3"
                      style={{ animation: 'fade-up 0.2s ease-out' }}
                    >
                      {stat.detail}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="bg-white px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-heading text-center text-3xl font-bold text-text-primary">
            Our Partners
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {PARTNERS.map((partner, i) => {
              const isOpen = openPartner === i;
              return (
                <button
                  key={partner.name}
                  type="button"
                  onClick={() => setOpenPartner(isOpen ? null : i)}
                  className="rounded-xl border border-border bg-warm-white p-6 text-left transition-all duration-200 hover:shadow-md hover:border-sage/40 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-base font-semibold text-text-primary">
                        {partner.name}
                      </h3>
                      <p className="text-xs font-medium uppercase tracking-wider text-sage">
                        {partner.role}
                      </p>
                    </div>
                    <span
                      className="mt-0.5 text-sage transition-transform duration-200 flex-shrink-0"
                      style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                    >
                      ▾
                    </span>
                  </div>
                  {isOpen && (
                    <div
                      className="mt-3 text-sm leading-relaxed text-text-secondary border-t border-border pt-3"
                      style={{ animation: 'fade-up 0.2s ease-out' }}
                    >
                      {partner.description}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sage/5 px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-bold text-text-primary">
            Join the Cooperative
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-text-secondary">
            Whether you are a family seeking trusted care, a caregiver who deserves fair wages and
            ownership, or a community member ready to give back.
          </p>
          <button
            type="button"
            onClick={() => navigate('/card')}
            className="mt-8 rounded-lg bg-sage px-10 py-4 text-base font-semibold text-white transition-colors hover:bg-sage-dark"
          >
            Get Started
          </button>
        </div>
      </section>
    </PageLayout>
  );
}
