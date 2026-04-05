/**
 * WorkerOnboarding — Worker-owner onboarding flow
 *
 * Guides a new worker-owner through joining the cooperative:
 * 1. Welcome — understand cooperative ownership model
 * 2. Personal Profile — basic info, certs, availability
 * 3. Equity & Benefits — vesting schedule, W-2 benefits, governance
 * 4. Required Training — Conductor Certification pathway + background check
 * 5. Your First Match — mock family match with proximity scoring
 *
 * 5-step wizard with progress indicator, Back/Next navigation.
 */
import { useState } from 'react';

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS = ['Welcome', 'Profile', 'Equity', 'Training', 'Match'];

const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
] as const;

const CERTIFICATIONS = [
  { key: 'cna', label: 'CNA (Certified Nursing Assistant)' },
  { key: 'hha', label: 'HHA (Home Health Aide)' },
  { key: 'cpr', label: 'CPR Certification' },
  { key: 'first_aid', label: 'First Aid Certification' },
] as const;

const VESTING_SCHEDULE = [
  { year: 1, amount: 5200, cumulative: 5200 },
  { year: 2, amount: 5200, cumulative: 10400 },
  { year: 3, amount: 5200, cumulative: 15600 },
  { year: 4, amount: 5200, cumulative: 20800 },
  { year: 5, amount: 5200, cumulative: 26000 },
];

const TRAINING_MODULES = [
  {
    id: 'omaha',
    title: 'Omaha System Basics',
    duration: '2 hours',
    description: 'Learn the 42-problem clinical taxonomy that powers CareOS care documentation.',
  },
  {
    id: 'cii_cri',
    title: 'CII/CRI Assessment Training',
    duration: '1.5 hours',
    description:
      'How to understand Caregiver Impact Index scores and Care Review Interview factors.',
  },
  {
    id: 'ambient_scribe',
    title: 'Ambient Scribe Usage',
    duration: '1 hour',
    description: 'Using the AI-powered ambient scribe to document care visits hands-free.',
  },
];

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  zip: string;
  languages: Set<string>;
  yearsExperience: string;
  certifications: Set<string>;
  availableDays: Set<string>;
  availableTimes: Set<string>;
}

export function WorkerOnboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    zip: '',
    languages: new Set(['english']),
    yearsExperience: '',
    certifications: new Set(),
    availableDays: new Set(),
    availableTimes: new Set(),
  });

  function goNext() {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as OnboardingStep);
    }
  }

  function goBack() {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as OnboardingStep);
    }
  }

  function toggleSetItem(
    setter: React.Dispatch<React.SetStateAction<ProfileData>>,
    field: keyof ProfileData,
    item: string,
  ) {
    setter((prev) => {
      const current = prev[field] as Set<string>;
      const next = new Set(current);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return { ...prev, [field]: next };
    });
  }

  // ── Progress Indicator ──
  function ProgressIndicator() {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const isCompleted = completedSteps.has(stepNum);
            const isCurrent = currentStep === stepNum;

            return (
              <div key={label} className="flex flex-1 items-center">
                {/* Step circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                      isCompleted
                        ? 'bg-sage text-white'
                        : isCurrent
                          ? 'bg-sage text-white ring-2 ring-sage/30'
                          : 'bg-warm-gray text-text-muted'
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span
                    className={`mt-1.5 text-[10px] ${
                      isCurrent || isCompleted ? 'font-medium text-text-primary' : 'text-text-muted'
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {/* Connecting line */}
                {i < STEP_LABELS.length - 1 && (
                  <div className="mx-2 mt-[-16px] h-0.5 flex-1 rounded-full bg-warm-gray">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-sage' : 'bg-transparent'
                      }`}
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Navigation Buttons ──
  function NavButtons({ nextLabel = 'Continue' }: { nextLabel?: string }) {
    return (
      <div className="mt-8 flex gap-3">
        {currentStep > 1 && (
          <button
            onClick={goBack}
            className="flex-1 rounded-lg border border-border px-6 py-3 text-sm font-medium text-text-secondary hover:bg-warm-gray"
          >
            Back
          </button>
        )}
        <button
          onClick={goNext}
          className={`rounded-lg bg-sage px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-sage-dark ${
            currentStep > 1 ? 'flex-1' : 'w-full'
          }`}
        >
          {nextLabel}
        </button>
      </div>
    );
  }

  // ── Step 1: Welcome ──
  function WelcomeStep() {
    return (
      <div>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
            <svg
              className="h-8 w-8 text-sage"
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
          <h1 className="font-heading text-2xl font-semibold text-text-primary">
            Welcome to the Cooperative
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            co.op.care is different. You are not just an employee — you are an owner.
          </p>
        </div>

        {/* Ownership benefits */}
        <div className="rounded-xl border border-border bg-white p-4">
          <h2 className="mb-3 font-heading text-base font-semibold text-text-primary">
            What Worker Ownership Means
          </h2>
          <div className="space-y-3">
            {[
              {
                icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                title: '$25-28/hr wage',
                desc: 'Fair, livable pay — not the industry minimum. Your wage reflects the value of your work.',
              },
              {
                icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
                title: 'Equity stake (~$52K over 5 years)',
                desc: 'You build real ownership. $5,200/year vests into your cooperative equity account.',
              },
              {
                icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
                title: 'Full W-2 benefits',
                desc: 'Health insurance, PTO, workers compensation. Real benefits, not 1099 gig work.',
              },
              {
                icon: 'M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z',
                title: 'Democratic governance',
                desc: '1 member = 1 vote. You have a say in how the cooperative is run — wages, policies, leadership.',
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage/10">
                  <svg
                    className="h-5 w-5 text-sage"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
                  <p className="mt-0.5 text-xs text-text-secondary">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison vs traditional agency */}
        <div className="mt-4 rounded-xl border border-border bg-white p-4">
          <h2 className="mb-3 font-heading text-base font-semibold text-text-primary">
            co.op.care vs. Traditional Home Care Agency
          </h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-warm-gray">
                  <th className="px-4 py-2.5 text-xs font-medium text-text-muted" />
                  <th className="px-4 py-2.5 text-xs font-semibold text-sage">co.op.care</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-text-muted">
                    Traditional Agency
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-2.5 text-xs font-medium text-text-primary">Hourly Pay</td>
                  <td className="px-4 py-2.5 text-xs font-semibold text-sage">$25-28/hr</td>
                  <td className="px-4 py-2.5 text-xs text-text-muted">$12-15/hr</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-xs font-medium text-text-primary">Equity</td>
                  <td className="px-4 py-2.5 text-xs font-semibold text-sage">~$52K/5yr</td>
                  <td className="px-4 py-2.5 text-xs text-text-muted">$0</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-xs font-medium text-text-primary">
                    Health Insurance
                  </td>
                  <td className="px-4 py-2.5 text-xs font-semibold text-sage">Yes</td>
                  <td className="px-4 py-2.5 text-xs text-text-muted">Rarely</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-xs font-medium text-text-primary">
                    Turnover Rate
                  </td>
                  <td className="px-4 py-2.5 text-xs font-semibold text-sage">15% projected</td>
                  <td className="px-4 py-2.5 text-xs text-copper">77% average</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-xs font-medium text-text-primary">Governance</td>
                  <td className="px-4 py-2.5 text-xs font-semibold text-sage">1 member = 1 vote</td>
                  <td className="px-4 py-2.5 text-xs text-text-muted">No say</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <NavButtons nextLabel="Get Started" />
      </div>
    );
  }

  // ── Step 2: Personal Profile ──
  function ProfileStep() {
    return (
      <div>
        <div className="mb-6 text-center">
          <h1 className="font-heading text-2xl font-semibold text-text-primary">Your Profile</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Tell us about yourself so we can match you with families.
          </p>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Personal Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-primary">
                  First Name
                </label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-text-primary">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-text-primary">Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                placeholder="(303) 555-0100"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-text-primary">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-text-primary">
                Address / ZIP <span className="font-normal text-text-muted">(Boulder area)</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                  placeholder="123 Pearl St"
                  className="col-span-2 rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={profile.zip}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      zip: e.target.value.replace(/\D/g, '').slice(0, 5),
                    }))
                  }
                  placeholder="80302"
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                />
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Languages Spoken</h3>
            <div className="flex flex-wrap gap-2">
              {['english', 'spanish', 'other'].map((lang) => {
                const isSelected = profile.languages.has(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleSetItem(setProfile, 'languages', lang)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                      isSelected
                        ? 'border-sage bg-sage text-white'
                        : 'border-border bg-warm-gray text-text-secondary hover:border-sage/40'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Experience */}
          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Caregiving Experience</h3>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-primary">
                Years of experience
              </label>
              <select
                value={profile.yearsExperience}
                onChange={(e) => setProfile((p) => ({ ...p, yearsExperience: e.target.value }))}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              >
                <option value="">Select...</option>
                <option value="0">No formal experience</option>
                <option value="1-2">1-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
          </div>

          {/* Certifications */}
          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Certifications Held</h3>
            <div className="space-y-2">
              {CERTIFICATIONS.map((cert) => {
                const isChecked = profile.certifications.has(cert.key);
                return (
                  <label
                    key={cert.key}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                      isChecked ? 'border-sage bg-sage/5' : 'border-border hover:border-sage/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSetItem(setProfile, 'certifications', cert.key)}
                      className="accent-sage"
                    />
                    <span
                      className={
                        isChecked ? 'font-medium text-text-primary' : 'text-text-secondary'
                      }
                    >
                      {cert.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Availability</h3>

            <div className="mb-4">
              <label className="mb-2 block text-xs font-medium text-text-primary">
                Days of the week
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = profile.availableDays.has(day.key);
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleSetItem(setProfile, 'availableDays', day.key)}
                      className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                        isSelected
                          ? 'border-sage bg-sage text-white'
                          : 'border-border bg-warm-gray text-text-secondary hover:border-sage/40'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-text-primary">
                Time of day
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'morning', label: 'Morning', detail: '6 AM - 12 PM' },
                  { key: 'afternoon', label: 'Afternoon', detail: '12 - 5 PM' },
                  { key: 'evening', label: 'Evening', detail: '5 - 9 PM' },
                ].map((time) => {
                  const isSelected = profile.availableTimes.has(time.key);
                  return (
                    <button
                      key={time.key}
                      type="button"
                      onClick={() => toggleSetItem(setProfile, 'availableTimes', time.key)}
                      className={`flex flex-col items-center rounded-lg border px-4 py-2.5 transition-colors ${
                        isSelected
                          ? 'border-sage bg-sage text-white'
                          : 'border-border bg-warm-gray text-text-secondary hover:border-sage/40'
                      }`}
                    >
                      <span className="text-sm font-medium">{time.label}</span>
                      <span
                        className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-text-muted'}`}
                      >
                        {time.detail}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <NavButtons />
      </div>
    );
  }

  // ── Step 3: Equity & Benefits ──
  function EquityStep() {
    const maxEquity = 26000;

    return (
      <div>
        <div className="mb-6 text-center">
          <h1 className="font-heading text-2xl font-semibold text-text-primary">
            Equity & Benefits
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            As a worker-owner, you build real equity in the cooperative over time.
          </p>
        </div>

        {/* Vesting Schedule */}
        <div className="rounded-xl border border-border bg-white p-4">
          <h2 className="mb-1 font-heading text-base font-semibold text-text-primary">
            Cooperative Equity Vesting
          </h2>
          <p className="mb-4 text-xs text-text-muted">
            $5,200 vests each year. After 5 years, your equity stake is approximately $26,000.
          </p>

          {/* Bar chart */}
          <div className="space-y-3">
            {VESTING_SCHEDULE.map((entry) => {
              const pct = (entry.cumulative / maxEquity) * 100;
              return (
                <div key={entry.year}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-text-primary">Year {entry.year}</span>
                    <span className="font-semibold text-gold">
                      ${entry.cumulative.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-full bg-warm-gray">
                    <div
                      className="flex h-full items-center justify-end rounded-full bg-sage pr-2 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    >
                      <span className="text-[9px] font-semibold text-white">
                        +${entry.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-lg bg-sage/5 p-3 text-center">
            <span className="text-2xl font-bold text-sage">~$52,000</span>
            <p className="mt-0.5 text-xs text-text-muted">
              Total equity value over 5 years (with cooperative growth)
            </p>
          </div>
        </div>

        {/* W-2 Benefits */}
        <div className="mt-4 rounded-xl border border-border bg-white p-4">
          <h2 className="mb-3 font-heading text-base font-semibold text-text-primary">
            Full W-2 Benefits
          </h2>
          <div className="space-y-2.5">
            {[
              {
                icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
                title: 'W-2 Employment',
                desc: 'You are a real employee, not a 1099 contractor. Payroll taxes, unemployment insurance, and labor protections included.',
              },
              {
                icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
                title: 'Health Insurance',
                desc: 'Medical, dental, and vision coverage for you and your dependents.',
              },
              {
                icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
                title: 'Paid Time Off',
                desc: 'Vacation days and sick leave. Take care of yourself so you can take care of others.',
              },
              {
                icon: 'M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008H12v-.008z',
                title: 'Workers Compensation',
                desc: 'If you are injured on the job, you are covered. Full protection under Colorado law.',
              },
            ].map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sage/10">
                  <svg
                    className="h-4 w-4 text-sage"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={benefit.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{benefit.title}</h3>
                  <p className="mt-0.5 text-xs text-text-secondary">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Governance */}
        <div className="mt-4 rounded-xl border border-border bg-white p-4">
          <h2 className="mb-3 font-heading text-base font-semibold text-text-primary">
            Governance Rights
          </h2>
          <div className="rounded-lg bg-sage/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/10">
                <svg
                  className="h-5 w-5 text-sage"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">1 Member = 1 Vote</h3>
                <p className="mt-0.5 text-xs text-text-secondary">
                  Every worker-owner has equal say. Vote on wages, policies, benefits, and
                  cooperative leadership. Your voice matters as much as anyone else&apos;s.
                </p>
              </div>
            </div>
          </div>
        </div>

        <NavButtons />
      </div>
    );
  }

  // ── Step 4: Required Training ──
  function TrainingStep() {
    return (
      <div>
        <div className="mb-6 text-center">
          <h1 className="font-heading text-2xl font-semibold text-text-primary">
            Required Training
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Complete your Conductor Certification to start caring for families.
          </p>
        </div>

        {/* Training modules */}
        <div className="rounded-xl border border-border bg-white p-4">
          <h2 className="mb-1 font-heading text-base font-semibold text-text-primary">
            Conductor Certification
          </h2>
          <p className="mb-4 text-xs text-text-muted">
            3 required modules — approximately 4.5 hours total
          </p>

          <div className="space-y-3">
            {TRAINING_MODULES.map((mod, i) => (
              <div key={mod.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warm-gray text-sm font-semibold text-text-muted">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{mod.title}</h3>
                      <p className="mt-0.5 text-xs text-text-secondary">{mod.description}</p>
                      <span className="mt-1.5 inline-block text-[10px] text-text-muted">
                        <svg
                          className="mr-1 inline h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {mod.duration}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-warm-gray px-2.5 py-1 text-[10px] font-medium text-text-muted">
                    Not Started
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Background Check */}
        <div className="mt-4 rounded-xl border border-border bg-white p-4">
          <h2 className="mb-3 font-heading text-base font-semibold text-text-primary">
            Background Check
          </h2>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage/10">
                <svg
                  className="h-5 w-5 text-sage"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Required Background Verification
                </h3>
                <p className="mt-0.5 text-xs text-text-secondary">
                  All worker-owners must pass a background check before being matched with families.
                  This is processed securely through Checkr — co.op.care never stores your sensitive
                  personal data.
                </p>
                <span className="mt-2 inline-block rounded-full bg-warm-gray px-2.5 py-1 text-[10px] font-medium text-text-muted">
                  Pending — link sent after training
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline note */}
        <div className="mt-4 rounded-lg bg-sage/5 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-sage"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            <p className="text-xs text-text-secondary">
              You can begin training immediately. Background check is initiated after you complete
              all three modules. Most worker-owners are matched with their first family within 2
              weeks of completing certification.
            </p>
          </div>
        </div>

        <NavButtons />
      </div>
    );
  }

  // ── Step 5: Your First Match ──
  function MatchStep() {
    return (
      <div>
        <div className="mb-6 text-center">
          <h1 className="font-heading text-2xl font-semibold text-text-primary">
            Your First Match
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Here is a preview of how our matching algorithm connects you with families.
          </p>
        </div>

        {/* Mock family card */}
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-text-primary">
              Henderson Family
            </h2>
            <span className="rounded-full bg-sage/10 px-2.5 py-1 text-[10px] font-medium text-sage">
              98% Match
            </span>
          </div>

          <div className="mt-3 flex items-start gap-4">
            {/* Avatar placeholder */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-copper/10">
              <svg
                className="h-7 w-7 text-copper"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Dorothy Henderson</h3>
              <p className="text-xs text-text-muted">78 years old</p>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-sage">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <span className="font-medium">0.3 miles away</span>
              </div>
            </div>
          </div>

          {/* Care needs */}
          <div className="mt-4 rounded-lg bg-warm-gray p-3">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Care Needs
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Companionship',
                'Light Housekeeping',
                'Meal Preparation',
                'Medication Reminders',
                'Transportation',
              ].map((need) => (
                <span
                  key={need}
                  className="rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-text-primary"
                >
                  {need}
                </span>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="mt-3 rounded-lg bg-warm-gray p-3">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Schedule
            </h4>
            <p className="text-xs text-text-secondary">Mon, Wed, Fri — Mornings (8 AM - 12 PM)</p>
            <p className="mt-0.5 text-xs text-text-secondary">
              15 hours/week — Regular companion care
            </p>
          </div>
        </div>

        {/* Proximity matching explanation */}
        <div className="mt-4 rounded-xl border border-border bg-white p-4">
          <h2 className="mb-3 font-heading text-base font-semibold text-text-primary">
            How Matching Works
          </h2>
          <p className="mb-3 text-xs text-text-secondary">
            Our algorithm uses Haversine distance to calculate the exact distance between your home
            and each family. Closer matches mean less commute time and more time caring.
          </p>
          <div className="space-y-2">
            {[
              { distance: '< 0.5 mi', weight: '3x', label: 'Walking distance', color: 'text-sage' },
              { distance: '0.5 - 1 mi', weight: '2x', label: 'Neighborhood', color: 'text-sage' },
              { distance: '1 - 2 mi', weight: '1x', label: 'Across town', color: 'text-gold' },
              {
                distance: '> 2 mi',
                weight: 'Remote only',
                label: 'Phone companionship',
                color: 'text-text-muted',
              },
            ].map((tier) => (
              <div
                key={tier.distance}
                className="flex items-center justify-between rounded-lg bg-warm-gray px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${tier.color}`}>{tier.weight}</span>
                  <span className="text-xs text-text-primary">{tier.distance}</span>
                </div>
                <span className="text-[10px] text-text-muted">{tier.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8">
          <button
            onClick={() => {
              setCompletedSteps((prev) => new Set([...prev, 5]));
              // Navigate to dashboard or next step — API call wired in later
              console.log('Worker onboarding complete', { profile });
            }}
            className="w-full rounded-lg bg-sage px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-sage-dark"
          >
            Start Your Journey
          </button>
          {currentStep > 1 && (
            <button
              onClick={goBack}
              className="mt-2 w-full rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-secondary hover:bg-warm-gray"
            >
              Back
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <ProgressIndicator />
      {currentStep === 1 && <WelcomeStep />}
      {currentStep === 2 && <ProfileStep />}
      {currentStep === 3 && <EquityStep />}
      {currentStep === 4 && <TrainingStep />}
      {currentStep === 5 && <MatchStep />}
    </div>
  );
}
