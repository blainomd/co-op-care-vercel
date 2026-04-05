/**
 * FederationWaitlist — Bring co.op.care to your city
 *
 * For visitors outside Boulder who want to launch a local cooperative.
 * Federation model: Boulder-first GTM, saturate locally, prove model, then replicate.
 */
import { useState } from 'react';

type RoleInterest =
  | 'family_caregiver'
  | 'potential_worker_owner'
  | 'community_organizer'
  | 'healthcare_partner'
  | 'investor';

const ROLE_OPTIONS: { value: RoleInterest; label: string }[] = [
  { value: 'family_caregiver', label: 'Family Caregiver' },
  { value: 'potential_worker_owner', label: 'Potential Worker-Owner' },
  { value: 'community_organizer', label: 'Community Organizer' },
  { value: 'healthcare_partner', label: 'Healthcare Partner' },
  { value: 'investor', label: 'Investor' },
];

const TOP_CITIES = [
  { city: 'Denver', state: 'CO', count: 184 },
  { city: 'Portland', state: 'OR', count: 127 },
  { city: 'Austin', state: 'TX', count: 98 },
  { city: 'Minneapolis', state: 'MN', count: 89 },
  { city: 'Asheville', state: 'NC', count: 76 },
  { city: 'Sacramento', state: 'CA', count: 68 },
  { city: 'Madison', state: 'WI', count: 54 },
  { city: 'Burlington', state: 'VT', count: 41 },
  { city: 'Boise', state: 'ID', count: 38 },
  { city: 'Ann Arbor', state: 'MI', count: 32 },
  { city: 'Chattanooga', state: 'TN', count: 24 },
  { city: 'Santa Fe', state: 'NM', count: 16 },
];

const FAQS = [
  {
    question: 'When will you expand beyond Boulder?',
    answer:
      'We are proving the cooperative model in Boulder first. Once we reach 40 families and demonstrate sustainable unit economics, we will begin launching in cities that have reached their waitlist threshold. We expect the first expansion city to launch in late 2026.',
  },
  {
    question: 'How many people are needed to launch in my city?',
    answer:
      'We look for a critical mass of approximately 50 interested people across all roles: families who need care, people who want to become worker-owners, and at least one community organizer or healthcare partner willing to help coordinate the launch.',
  },
  {
    question: 'Can I start one myself?',
    answer:
      'Yes, that is exactly the federation model. Once Boulder is proven, we provide the playbook: cooperative formation documents, the CareOS technology platform, caregiver training curriculum, and ongoing operational support. You bring the local relationships and community knowledge.',
  },
  {
    question: 'What does "worker-owned" mean?',
    answer:
      'Caregivers in each local co-op.care cooperative are not employees of a distant corporation. They are worker-owners who earn $25-28/hr plus equity in the cooperative. This ownership structure is why our projected turnover is 15% versus the 77% industry average. When caregivers own their workplace, they stay.',
  },
  {
    question: 'Is this a franchise?',
    answer:
      'No. Each local cooperative is independently owned by its worker-owners. co.op.care provides the technology platform (CareOS), training materials, and operational playbook through a federation agreement. Think of it like a credit union network, not a franchise chain.',
  },
];

function CommunityCareSvg() {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto h-48 w-full max-w-xs"
      aria-hidden="true"
    >
      {/* Background circles representing community nodes */}
      <circle cx="160" cy="100" r="70" fill="#4F7A5E" opacity="0.08" />
      <circle cx="160" cy="100" r="50" fill="#4F7A5E" opacity="0.12" />

      {/* Connection lines */}
      <line x1="100" y1="80" x2="140" y2="100" stroke="#4F7A5E" strokeWidth="1.5" opacity="0.3" />
      <line x1="220" y1="80" x2="180" y2="100" stroke="#4F7A5E" strokeWidth="1.5" opacity="0.3" />
      <line x1="160" y1="55" x2="160" y2="85" stroke="#4F7A5E" strokeWidth="1.5" opacity="0.3" />
      <line x1="120" y1="140" x2="148" y2="115" stroke="#4F7A5E" strokeWidth="1.5" opacity="0.3" />
      <line x1="200" y1="140" x2="172" y2="115" stroke="#4F7A5E" strokeWidth="1.5" opacity="0.3" />
      <line x1="80" y1="120" x2="110" y2="105" stroke="#B07A4F" strokeWidth="1.5" opacity="0.3" />
      <line x1="240" y1="120" x2="210" y2="105" stroke="#B07A4F" strokeWidth="1.5" opacity="0.3" />

      {/* Central house/heart icon */}
      <g transform="translate(145, 85)">
        <path d="M15 0L0 12V28H10V20H20V28H30V12L15 0Z" fill="#4F7A5E" opacity="0.9" />
        <path d="M15 5L7 11V22H12V17H18V22H23V11L15 5Z" fill="white" opacity="0.6" />
      </g>

      {/* People nodes around the center */}
      {/* Top person */}
      <circle cx="160" cy="48" r="8" fill="#4F7A5E" opacity="0.7" />
      <circle cx="160" cy="44" r="3.5" fill="white" opacity="0.8" />

      {/* Left person */}
      <circle cx="92" cy="76" r="8" fill="#B07A4F" opacity="0.7" />
      <circle cx="92" cy="72" r="3.5" fill="white" opacity="0.8" />

      {/* Right person */}
      <circle cx="228" cy="76" r="8" fill="#B07A4F" opacity="0.7" />
      <circle cx="228" cy="72" r="3.5" fill="white" opacity="0.8" />

      {/* Bottom-left person */}
      <circle cx="112" cy="148" r="8" fill="#C49B40" opacity="0.7" />
      <circle cx="112" cy="144" r="3.5" fill="white" opacity="0.8" />

      {/* Bottom-right person */}
      <circle cx="208" cy="148" r="8" fill="#C49B40" opacity="0.7" />
      <circle cx="208" cy="144" r="3.5" fill="white" opacity="0.8" />

      {/* Far-left person */}
      <circle cx="72" cy="124" r="7" fill="#4F7A5E" opacity="0.5" />
      <circle cx="72" cy="121" r="3" fill="white" opacity="0.7" />

      {/* Far-right person */}
      <circle cx="248" cy="124" r="7" fill="#4F7A5E" opacity="0.5" />
      <circle cx="248" cy="121" r="3" fill="white" opacity="0.7" />

      {/* Small satellite dots representing broader network */}
      <circle cx="55" cy="60" r="3" fill="#4F7A5E" opacity="0.2" />
      <circle cx="265" cy="60" r="3" fill="#4F7A5E" opacity="0.2" />
      <circle cx="40" cy="150" r="3" fill="#4F7A5E" opacity="0.2" />
      <circle cx="280" cy="150" r="3" fill="#4F7A5E" opacity="0.2" />
      <circle cx="160" cy="185" r="3" fill="#4F7A5E" opacity="0.2" />
    </svg>
  );
}

export function FederationWaitlist() {
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    email: '',
    role: '' as RoleInterest | '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // API call will be wired in later
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* ── Hero ── */}
      <section className="mb-12 text-center">
        <CommunityCareSvg />
        <h1 className="mt-6 font-heading text-3xl font-semibold text-primary">
          Bring co.op.care to Your City
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-secondary">
          co.op.care is a worker-owned home care cooperative where caregivers earn fair wages, own
          equity, and stay. We are proving the model in Boulder, Colorado first — then bringing it
          to communities like yours.
        </p>
      </section>

      {/* ── Why Boulder First ── */}
      <section className="mb-12 rounded-2xl border border-border bg-white p-6">
        <h2 className="font-heading text-xl font-semibold text-primary">Why Boulder First?</h2>
        <p className="mt-3 text-sm leading-relaxed text-secondary">
          Great cooperatives are not built by scaling fast. They are built by getting it right in
          one place, then replicating what works. Boulder is our proving ground: 40 families, 15
          worker-owners, real unit economics, and a care model that actually reduces hospital
          readmissions. Once we demonstrate that caregivers who own their workplace stay (projected
          15% turnover vs. the 77% industry average), we open the playbook to your city.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-4 text-center">
          <div className="rounded-xl bg-sage/5 p-4">
            <span className="block text-2xl font-bold text-sage">$25-28</span>
            <span className="mt-1 block text-xs text-muted">/hr worker-owner wage</span>
          </div>
          <div className="rounded-xl bg-sage/5 p-4">
            <span className="block text-2xl font-bold text-sage">15%</span>
            <span className="mt-1 block text-xs text-muted">projected turnover</span>
          </div>
          <div className="rounded-xl bg-sage/5 p-4">
            <span className="block text-2xl font-bold text-gold">77%</span>
            <span className="mt-1 block text-xs text-muted">industry avg turnover</span>
          </div>
        </div>
      </section>

      {/* ── Waitlist Stats ── */}
      <section className="mb-12">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-2xl border border-border bg-white p-5">
            <span className="block text-3xl font-bold text-sage">12</span>
            <span className="mt-1 block text-sm text-muted">cities on the waitlist</span>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <span className="block text-3xl font-bold text-copper">847</span>
            <span className="mt-1 block text-sm text-muted">people interested</span>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <span className="block text-3xl font-bold text-gold">3</span>
            <span className="mt-1 block text-sm text-muted">cities approaching launch</span>
          </div>
        </div>
      </section>

      {/* ── Waitlist Form ── */}
      <section className="mb-12" id="join">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="font-heading text-xl font-semibold text-primary">Join the Waitlist</h2>
          <p className="mt-1 text-sm text-secondary">
            Tell us where you are and how you want to be involved. We will notify you when your city
            reaches critical mass.
          </p>

          {submitted ? (
            <div className="mt-6 rounded-xl bg-sage/5 p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sage/10">
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
              <h3 className="font-heading text-lg font-semibold text-primary">
                You are on the list!
              </h3>
              <p className="mt-2 text-sm text-secondary">
                We will email you at{' '}
                <span className="font-medium text-primary">{formData.email}</span> when{' '}
                {formData.city}, {formData.state} reaches its launch threshold. In the meantime,
                share this page with others in your community.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-primary">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                    placeholder="e.g. Denver"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-primary">State</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        state: e.target.value.toUpperCase(),
                      }))
                    }
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                    placeholder="CO"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-primary">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-primary">
                  How do you want to be involved?
                </label>
                <div className="mt-2 space-y-2">
                  {ROLE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                        formData.role === option.value
                          ? 'border-sage bg-sage/5 text-primary'
                          : 'border-border text-secondary hover:border-sage/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={formData.role === option.value}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            role: e.target.value as RoleInterest,
                          }))
                        }
                        className="accent-sage"
                        required
                      />
                      <span>{option.label}</span>
                      {option.value === 'family_caregiver' && (
                        <span className="ml-auto text-xs text-muted">
                          I need care for a loved one
                        </span>
                      )}
                      {option.value === 'potential_worker_owner' && (
                        <span className="ml-auto text-xs text-muted">I want to provide care</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-sage px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-sage-dark"
              >
                Join the Waitlist
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="mb-12">
        <h2 className="mb-6 text-center font-heading text-xl font-semibold text-primary">
          How Federation Works
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Step 1 */}
          <div className="rounded-2xl border border-border bg-white p-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sage/10">
              <svg
                className="h-6 w-6 text-sage"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                />
              </svg>
            </div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-sage">
              Step 1
            </div>
            <h3 className="text-sm font-semibold text-primary">Join the Waitlist</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Tell us your city and how you want to be involved. Family caregiver, potential
              worker-owner, community organizer, healthcare partner, or investor.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-border bg-white p-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-copper/10">
              <svg
                className="h-6 w-6 text-copper"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            </div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-copper">
              Step 2
            </div>
            <h3 className="text-sm font-semibold text-primary">Reach Critical Mass</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              When approximately 50 people across all roles sign up in your area, we begin the
              launch process. Share the waitlist to accelerate your city.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-border bg-white p-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
              <svg
                className="h-6 w-6 text-gold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                />
              </svg>
            </div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold">
              Step 3
            </div>
            <h3 className="text-sm font-semibold text-primary">Launch Your Local Co-op</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              We provide the CareOS platform, cooperative formation documents, caregiver training
              curriculum, and ongoing support. Your community provides the relationships.
            </p>
          </div>
        </div>
      </section>

      {/* ── City Interest List ── */}
      <section className="mb-12">
        <h2 className="mb-4 font-heading text-xl font-semibold text-primary">
          Cities on the Waitlist
        </h2>
        <p className="mb-5 text-sm text-secondary">
          These communities have people who want co.op.care. The launch threshold is approximately
          50 interested people.
        </p>
        <div className="rounded-2xl border border-border bg-white">
          {TOP_CITIES.map((item, i) => {
            const progress = Math.min((item.count / 50) * 100, 100);
            const isApproaching = item.count >= 50;
            return (
              <div
                key={item.city}
                className={`flex items-center gap-4 px-5 py-3 ${
                  i < TOP_CITIES.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="w-5 text-center text-xs font-medium text-muted">{i + 1}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary">
                      {item.city}, {item.state}
                    </span>
                    {isApproaching && (
                      <span className="rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-medium text-sage">
                        Approaching launch
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-warm-gray">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isApproaching ? 'bg-sage' : 'bg-sage/40'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-sage">{item.count}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center text-xs text-muted">
          Don&apos;t see your city?{' '}
          <a href="#join" className="font-medium text-sage underline underline-offset-2">
            Add it to the waitlist
          </a>
        </p>
      </section>

      {/* ── FAQ ── */}
      <section className="mb-12">
        <h2 className="mb-5 font-heading text-xl font-semibold text-primary">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-xl border border-border bg-white">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-primary">{faq.question}</span>
                <svg
                  className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${
                    openFaq === i ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="border-t border-border px-5 py-4">
                  <p className="text-sm leading-relaxed text-secondary">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="rounded-2xl bg-sage/5 p-8 text-center">
        <h2 className="font-heading text-xl font-semibold text-primary">
          Care should be local, fair, and owned by the people who provide it.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-secondary">
          Every city on this waitlist is one step closer to a care economy where caregivers earn a
          living wage, families get consistent and trusted support, and no one has to navigate the
          system alone.
        </p>
        <a
          href="#join"
          className="mt-5 inline-block rounded-lg bg-sage px-8 py-3 text-sm font-medium text-white shadow-sm hover:bg-sage-dark"
        >
          Join the Waitlist
        </a>
      </section>
    </div>
  );
}
