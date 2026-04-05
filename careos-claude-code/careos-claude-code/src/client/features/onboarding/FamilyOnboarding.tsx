/**
 * FamilyOnboarding — Family-specific onboarding flow
 *
 * Guides a new family through setting up their care recipient's profile,
 * completing the CII mini-assessment, choosing a membership tier, and
 * meeting their matched care team.
 *
 * 5-step wizard: Welcome → Care Recipient Profile → Quick Assessment →
 * Membership Selection → Care Team Preview
 */
import { useState } from 'react';

type OnboardingStep = 'welcome' | 'profile' | 'assessment' | 'membership' | 'care-team';

const STEP_LABELS = ['Welcome', 'Profile', 'Assessment', 'Membership', 'Care Team'];

const STEP_MAP: Record<OnboardingStep, number> = {
  welcome: 0,
  profile: 1,
  assessment: 2,
  membership: 3,
  'care-team': 4,
};

const PRIMARY_CONDITIONS = [
  'Heart Failure',
  'Diabetes',
  'Fall Risk',
  'Cognitive Decline',
  'COPD',
  'Other',
];

const LIVING_SITUATIONS = ['Alone', 'With Spouse', 'With Family', 'Assisted Living'];

const MOBILITY_LEVELS = ['Independent', 'Uses Walker', 'Wheelchair', 'Bed-bound'];

const ASSESSMENT_QUESTIONS = [
  {
    key: 'physical',
    label: 'Physical health burden',
    description: 'How much does managing physical health affect daily life?',
  },
  {
    key: 'emotional',
    label: 'Emotional stress',
    description: 'How much emotional weight does the care situation carry?',
  },
  {
    key: 'financial',
    label: 'Financial strain',
    description: 'How much financial pressure does the care situation create?',
  },
  {
    key: 'social',
    label: 'Social isolation',
    description: 'How much has the care situation affected social connections?',
  },
  {
    key: 'daily',
    label: 'Daily task difficulty',
    description: 'How difficult are everyday tasks like meals, bathing, or errands?',
  },
  {
    key: 'sleep',
    label: 'Sleep quality',
    description: 'How much does the care situation affect sleep?',
  },
];

const FIVE_SOURCES = [
  {
    title: 'Worker-Owners',
    description: 'Professional caregivers who earn fair wages, own equity, and stay.',
  },
  {
    title: 'Time Bank Neighbors',
    description: 'Community members exchanging care hours based on shared identity and proximity.',
  },
  {
    title: 'Medical Director',
    description: 'Dr. Josh Emdur oversees clinical assessments and Letters of Medical Necessity.',
  },
  {
    title: 'Technology (CareOS)',
    description:
      'This platform coordinates everything — scheduling, GPS verification, and communication.',
  },
  {
    title: 'Family (You)',
    description: 'You are the Conductor. You know your loved one best and guide the care team.',
  },
];

const MEMBERSHIP_TIERS = [
  {
    name: 'Community',
    price: 100,
    period: '/yr',
    description: 'Everything you need to get started with cooperative care.',
    benefits: [
      'Access to matched worker-owners',
      'CII assessment and care plan',
      'Time Bank membership (40 hrs/yr)',
      'GPS-verified task completion',
      'Secure messaging with care team',
    ],
    highlighted: false,
    badge: null,
  },
  {
    name: 'Enhanced',
    price: 200,
    period: '/yr',
    description: 'Additional support for families with higher care needs.',
    benefits: [
      'Everything in Community',
      'Priority matching with top-rated worker-owners',
      'Monthly care plan review with coordinator',
      'Extended Time Bank credits (80 hrs/yr)',
      'Wearable health data integration',
      'Emergency respite fund priority',
    ],
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Founding',
    price: 100,
    period: '/yr',
    description: 'For early supporters who believe in cooperative care. Limited spots.',
    benefits: [
      'Everything in Enhanced',
      'Founding member recognition',
      'Cooperative governance voting rights',
      'Direct line to Medical Director',
      'Shape the future of co.op.care',
      'Locked-in rate for life',
    ],
    highlighted: false,
    badge: 'Limited',
  },
];

const MOCK_CAREGIVERS = [
  {
    name: 'Maria Garcia',
    specialty: 'Companion Care',
    distance: '0.3mi away',
    rating: 4.9,
    reviews: 47,
    bio: 'Bilingual caregiver with 8 years of companion care experience. Passionate about meaningful conversation and gentle daily support.',
    availability: 'Mon-Fri, mornings',
  },
  {
    name: 'Janet Rodriguez',
    specialty: 'Meal Prep',
    distance: '0.7mi away',
    rating: 4.8,
    reviews: 32,
    bio: 'Former chef turned caregiver. Specializes in nutritious, easy-to-eat meals tailored to dietary restrictions and personal preferences.',
    availability: 'Tue-Sat, afternoons',
  },
];

function getZone(total: number): 'GREEN' | 'YELLOW' | 'RED' {
  if (total <= 12) return 'GREEN';
  if (total <= 22) return 'YELLOW';
  return 'RED';
}

const ZONE_CONFIG = {
  GREEN: {
    label: 'Green Zone — Manageable',
    bg: 'bg-zone-green/10',
    text: 'text-zone-green',
    bar: 'bg-zone-green',
    message:
      'Your loved one is doing well. A Community membership keeps your support network ready.',
  },
  YELLOW: {
    label: 'Yellow Zone — Moderate Needs',
    bg: 'bg-zone-yellow/10',
    text: 'text-zone-yellow',
    bar: 'bg-zone-yellow',
    message:
      'Some areas need attention. Regular support from worker-owners can make a real difference.',
  },
  RED: {
    label: 'Red Zone — Significant Needs',
    bg: 'bg-zone-red/10',
    text: 'text-zone-red',
    bar: 'bg-zone-red',
    message:
      'Your loved one needs consistent support. Our care team is ready to help lighten the load.',
  },
};

export function FamilyOnboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const stepIndex = STEP_MAP[currentStep];

  // ── Profile state ──
  const [profileData, setProfileData] = useState({
    name: '',
    dateOfBirth: '',
    street: '',
    city: 'Boulder',
    state: 'CO',
    zip: '',
    conditions: new Set<string>(),
    livingSituation: '',
    mobility: '',
  });

  // ── Assessment state ──
  const [assessmentScores, setAssessmentScores] = useState<number[]>([3, 3, 3, 3, 3, 3]);
  const assessmentTotal = assessmentScores.reduce((a, b) => a + b, 0);
  const zone = getZone(assessmentTotal);
  const zoneConfig = ZONE_CONFIG[zone];

  // ── Membership state ──
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  // ── Navigation helpers ──
  const STEPS: OnboardingStep[] = ['welcome', 'profile', 'assessment', 'membership', 'care-team'];

  function goNext() {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1]!);
  }

  function goBack() {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) setCurrentStep(STEPS[idx - 1]!);
  }

  function toggleCondition(condition: string) {
    setProfileData((prev) => {
      const next = new Set(prev.conditions);
      if (next.has(condition)) {
        next.delete(condition);
      } else {
        next.add(condition);
      }
      return { ...prev, conditions: next };
    });
  }

  // ── Progress Indicator ──
  function ProgressIndicator() {
    return (
      <div className="mx-auto mb-8 max-w-lg px-4">
        <div className="flex items-center justify-between">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all ${
                    i < stepIndex
                      ? 'bg-sage text-white'
                      : i === stepIndex
                        ? 'bg-sage text-white ring-2 ring-sage/30'
                        : 'bg-warm-gray text-text-muted'
                  }`}
                >
                  {i < stepIndex ? (
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
                    i + 1
                  )}
                </div>
                <span
                  className={`mt-1 text-[9px] whitespace-nowrap ${
                    i <= stepIndex ? 'font-medium text-text-primary' : 'text-text-muted'
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Connecting line */}
              {i < STEP_LABELS.length - 1 && (
                <div className="mx-1 mt-[-14px] h-0.5 flex-1">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      i < stepIndex ? 'bg-sage' : 'bg-warm-gray'
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Navigation Buttons ──
  function NavButtons({
    nextLabel = 'Next',
    nextDisabled = false,
    onNext,
  }: {
    nextLabel?: string;
    nextDisabled?: boolean;
    onNext?: () => void;
  }) {
    return (
      <div className="mt-6 flex items-center gap-3">
        {stepIndex > 0 && (
          <button
            onClick={goBack}
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-warm-gray"
          >
            Back
          </button>
        )}
        <button
          onClick={onNext ?? goNext}
          disabled={nextDisabled}
          className={`flex-1 rounded-lg px-6 py-3 text-sm font-medium shadow-sm transition-colors ${
            nextDisabled
              ? 'cursor-not-allowed bg-warm-gray text-text-muted'
              : 'bg-sage text-white hover:bg-sage-dark'
          }`}
        >
          {nextLabel}
        </button>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  //  STEP 1: Welcome
  // ══════════════════════════════════════════════
  if (currentStep === 'welcome') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <ProgressIndicator />

        <div className="mb-8 text-center">
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
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">
            Welcome to co.op.care
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
            You are joining a worker-owned home care cooperative where caregivers earn fair wages,
            own equity, and stay. This is care built on relationships, not transactions.
          </p>
        </div>

        {/* Cooperative values */}
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-white p-4 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sage/10">
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
                  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Worker-Owned</h3>
            <p className="mt-1 text-xs text-text-muted">
              Caregivers earn $25-28/hr + equity. When they own their workplace, they stay.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-copper/10">
              <svg
                className="h-5 w-5 text-copper"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Community-First</h3>
            <p className="mt-1 text-xs text-text-muted">
              Care rooted in your neighborhood. Not a distant agency, but neighbors who know you.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
              <svg
                className="h-5 w-5 text-gold"
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
            <h3 className="text-sm font-semibold text-text-primary">Relationship-Based</h3>
            <p className="mt-1 text-xs text-text-muted">
              Same caregiver, same trust, same relationship. Continuity is the product.
            </p>
          </div>
        </div>

        {/* What to expect */}
        <div className="mb-8 rounded-xl border border-border bg-white p-4">
          <h2 className="mb-3 font-heading text-base font-semibold text-text-primary">
            What to expect
          </h2>
          <p className="mb-3 text-sm text-text-secondary">
            This onboarding takes about 10 minutes. We will walk you through:
          </p>
          <div className="space-y-2">
            {[
              "Setting up your care recipient's profile",
              'A quick 6-question needs assessment',
              'Choosing your membership tier',
              'Meeting your matched care team',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage/10 text-[10px] font-semibold text-sage">
                  {i + 1}
                </span>
                <span className="text-sm text-text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5 Sources of Care */}
        <div className="mb-2 rounded-xl border border-border bg-white p-4">
          <h2 className="mb-1 font-heading text-base font-semibold text-text-primary">
            The 5 Sources of Care
          </h2>
          <p className="mb-4 text-xs text-text-muted">
            co.op.care brings together 5 sources to surround your loved one with support.
          </p>
          <div className="space-y-3">
            {FIVE_SOURCES.map((source, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage/10">
                  <span className="text-xs font-semibold text-sage">{i + 1}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-primary">{source.title}</h4>
                  <p className="text-xs text-text-muted">{source.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <NavButtons nextLabel="Get Started" />
      </div>
    );
  }

  // ══════════════════════════════════════════════
  //  STEP 2: Care Recipient Profile
  // ══════════════════════════════════════════════
  if (currentStep === 'profile') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <ProgressIndicator />

        <div className="mb-6 text-center">
          <h1 className="font-heading text-2xl font-semibold text-text-primary">
            Care Recipient Profile
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Tell us about the person who will be receiving care.
          </p>
        </div>

        <div className="space-y-4">
          {/* Name and DOB */}
          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="mb-3 text-sm font-medium text-text-primary">Basic Information</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-primary">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                  placeholder="e.g. Margaret Johnson"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-text-primary">
                  Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData((p) => ({ ...p, dateOfBirth: e.target.value }))}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="mb-3 text-sm font-medium text-text-primary">Address</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-primary">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={profileData.street}
                  onChange={(e) => setProfileData((p) => ({ ...p, street: e.target.value }))}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                  placeholder="123 Pearl St"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-primary">City</label>
                  <input
                    type="text"
                    required
                    value={profileData.city}
                    onChange={(e) => setProfileData((p) => ({ ...p, city: e.target.value }))}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-primary">State</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={profileData.state}
                    onChange={(e) =>
                      setProfileData((p) => ({ ...p, state: e.target.value.toUpperCase() }))
                    }
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-primary">ZIP</label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={5}
                    value={profileData.zip}
                    onChange={(e) =>
                      setProfileData((p) => ({
                        ...p,
                        zip: e.target.value.replace(/\D/g, '').slice(0, 5),
                      }))
                    }
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                    placeholder="80302"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Primary Conditions (multi-select) */}
          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="mb-1 text-sm font-medium text-text-primary">Primary Conditions</h3>
            <p className="mb-3 text-xs text-text-muted">Select all that apply.</p>
            <div className="flex flex-wrap gap-2">
              {PRIMARY_CONDITIONS.map((condition) => {
                const isSelected = profileData.conditions.has(condition);
                return (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => toggleCondition(condition)}
                    className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'border-sage bg-sage text-white'
                        : 'border-border bg-warm-gray text-text-secondary hover:border-sage/40'
                    }`}
                  >
                    {condition}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Living Situation */}
          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="mb-1 text-sm font-medium text-text-primary">Current Living Situation</h3>
            <p className="mb-3 text-xs text-text-muted">
              Where does your loved one currently live?
            </p>
            <div className="flex flex-wrap gap-2">
              {LIVING_SITUATIONS.map((situation) => {
                const isSelected = profileData.livingSituation === situation;
                return (
                  <button
                    key={situation}
                    type="button"
                    onClick={() => setProfileData((p) => ({ ...p, livingSituation: situation }))}
                    className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'border-sage bg-sage text-white'
                        : 'border-border bg-warm-gray text-text-secondary hover:border-sage/40'
                    }`}
                  >
                    {situation}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobility Level */}
          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="mb-1 text-sm font-medium text-text-primary">Mobility Level</h3>
            <p className="mb-3 text-xs text-text-muted">How does your loved one get around?</p>
            <div className="flex flex-wrap gap-2">
              {MOBILITY_LEVELS.map((level) => {
                const isSelected = profileData.mobility === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setProfileData((p) => ({ ...p, mobility: level }))}
                    className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'border-sage bg-sage text-white'
                        : 'border-border bg-warm-gray text-text-secondary hover:border-sage/40'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <NavButtons
          nextLabel="Continue to Assessment"
          nextDisabled={
            !profileData.name ||
            !profileData.dateOfBirth ||
            !profileData.livingSituation ||
            !profileData.mobility
          }
        />
      </div>
    );
  }

  // ══════════════════════════════════════════════
  //  STEP 3: Quick Assessment (CII mini)
  // ══════════════════════════════════════════════
  if (currentStep === 'assessment') {
    const maxScore = 30;
    const pct = Math.round((assessmentTotal / maxScore) * 100);

    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <ProgressIndicator />

        <div className="mb-6 text-center">
          <h1 className="font-heading text-2xl font-semibold text-text-primary">
            Quick Needs Assessment
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            6 quick questions to understand your care situation. This takes about 2 minutes.
          </p>
        </div>

        {/* Sticky score bar */}
        <div className="sticky top-0 z-30 mb-5 rounded-xl border border-border bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-xl font-bold ${zoneConfig.text}`}>{assessmentTotal}</span>
              <span className="text-sm text-text-muted">/{maxScore}</span>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${zoneConfig.bg} ${zoneConfig.text}`}
            >
              {zoneConfig.label}
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-warm-gray">
            <div
              className={`h-full rounded-full transition-all duration-300 ${zoneConfig.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {ASSESSMENT_QUESTIONS.map((q, i) => (
            <div key={q.key} className="rounded-xl border border-border bg-white p-4">
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium text-text-primary">
                  {i + 1}. {q.label}
                </label>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    assessmentScores[i]! <= 2
                      ? 'bg-zone-green/10 text-zone-green'
                      : assessmentScores[i]! <= 3
                        ? 'bg-zone-yellow/10 text-zone-yellow'
                        : 'bg-zone-red/10 text-zone-red'
                  }`}
                >
                  {assessmentScores[i]}
                </span>
              </div>
              <p className="mb-3 text-xs text-text-muted">{q.description}</p>
              <input
                type="range"
                min={1}
                max={5}
                value={assessmentScores[i]}
                onChange={(e) => {
                  const next = [...assessmentScores];
                  next[i] = parseInt(e.target.value, 10);
                  setAssessmentScores(next);
                }}
                className="w-full accent-sage"
              />
              <div className="mt-1 flex justify-between px-1">
                <span className="text-[10px] text-text-muted">Minimal</span>
                <span className="text-[10px] text-text-muted">Significant</span>
              </div>
            </div>
          ))}
        </div>

        {/* Zone message */}
        <div className={`mt-5 rounded-xl p-4 ${zoneConfig.bg}`}>
          <p className={`text-sm font-medium ${zoneConfig.text}`}>{zoneConfig.message}</p>
        </div>

        <NavButtons nextLabel="Choose Membership" />
      </div>
    );
  }

  // ══════════════════════════════════════════════
  //  STEP 4: Membership Selection
  // ══════════════════════════════════════════════
  if (currentStep === 'membership') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <ProgressIndicator />

        <div className="mb-6 text-center">
          <h1 className="font-heading text-2xl font-semibold text-text-primary">
            Choose Your Membership
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            All memberships include a $100 founding deposit applied to your first year.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {MEMBERSHIP_TIERS.map((tier, i) => {
            const isSelected = selectedTier === i;
            return (
              <button
                key={tier.name}
                type="button"
                onClick={() => setSelectedTier(i)}
                className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                  isSelected
                    ? 'border-sage bg-sage/5 shadow-sm'
                    : tier.highlighted
                      ? 'border-sage/30 bg-white hover:border-sage/60'
                      : 'border-border bg-white hover:border-sage/40'
                }`}
              >
                {/* Badge */}
                {tier.badge && (
                  <span
                    className={`absolute -top-2.5 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      tier.badge === 'Limited' ? 'bg-gold/10 text-gold' : 'bg-sage/10 text-sage'
                    }`}
                  >
                    {tier.badge}
                  </span>
                )}

                {/* Price */}
                <div className="mb-3">
                  <span className="text-2xl font-bold text-text-primary">${tier.price}</span>
                  <span className="text-sm text-text-muted">{tier.period}</span>
                </div>

                <h3 className="font-heading text-base font-semibold text-text-primary">
                  {tier.name}
                </h3>
                <p className="mt-1 text-xs text-text-muted">{tier.description}</p>

                {/* Benefits */}
                <ul className="mt-4 space-y-2">
                  {tier.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <svg
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs text-text-secondary">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-sage py-1.5 text-xs font-medium text-white">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Selected
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Deposit and payment info */}
        <div className="mt-5 rounded-xl border border-border bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10">
              <svg
                className="h-4 w-4 text-gold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-text-primary">$100 Founding Deposit</h4>
              <p className="mt-0.5 text-xs text-text-muted">
                Applied to your first year membership. Refundable within 30 days if co.op.care is
                not the right fit.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-medium text-sage">
                  HSA Eligible
                </span>
                <span className="rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-medium text-sage">
                  FSA Eligible
                </span>
              </div>
            </div>
          </div>
        </div>

        <NavButtons nextLabel="Meet Your Care Team" nextDisabled={selectedTier === null} />
      </div>
    );
  }

  // ══════════════════════════════════════════════
  //  STEP 5: Care Team Preview
  // ══════════════════════════════════════════════
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <ProgressIndicator />

      <div className="mb-6 text-center">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          Meet Your Care Team
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Based on your profile and location, we have matched you with nearby worker-owners.
        </p>
      </div>

      {/* Matched caregivers */}
      <div className="space-y-4">
        {MOCK_CAREGIVERS.map((cg) => (
          <div key={cg.name} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-start gap-4">
              {/* Avatar placeholder */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sage/10">
                <svg
                  className="h-7 w-7 text-sage"
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

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading text-base font-semibold text-text-primary">
                      {cg.name}
                    </h3>
                    <p className="text-xs text-text-muted">{cg.specialty}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <svg
                        className="h-3.5 w-3.5 text-gold"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-sm font-semibold text-text-primary">{cg.rating}</span>
                      <span className="text-xs text-text-muted">({cg.reviews})</span>
                    </div>
                    <span className="text-xs text-sage">{cg.distance}</span>
                  </div>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-text-secondary">{cg.bio}</p>

                <div className="mt-3 flex items-center gap-3">
                  <span className="flex items-center gap-1 rounded-full bg-warm-gray px-2.5 py-0.5 text-[10px] font-medium text-text-secondary">
                    <svg
                      className="h-3 w-3"
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
                    {cg.availability}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-sage/10 px-2.5 py-0.5 text-[10px] font-medium text-sage">
                    <svg
                      className="h-3 w-3"
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
                    Worker-Owner
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Matching explainer */}
      <div className="mt-5 rounded-xl border border-border bg-sage/5 p-4">
        <h3 className="mb-2 text-sm font-medium text-text-primary">How Matching Works</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-2.5">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-sage"
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
            <div>
              <span className="text-xs font-medium text-text-primary">Proximity Matching</span>
              <p className="text-xs text-text-muted">
                We prioritize worker-owners who live nearby. Closer caregivers mean faster response
                times and stronger community ties.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-sage"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            <div>
              <span className="text-xs font-medium text-text-primary">Relationship Continuity</span>
              <p className="text-xs text-text-muted">
                The same worker-owner visits every time. Because they earn fair wages and own
                equity, our projected turnover is 15% versus the 77% industry average. Same
                caregiver, same trust.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={goBack}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-warm-gray"
        >
          Back
        </button>
        <button
          onClick={() => {
            // API call will be wired in later — submit all onboarding data
            console.log({
              profile: {
                ...profileData,
                conditions: Array.from(profileData.conditions),
              },
              assessment: {
                scores: assessmentScores,
                total: assessmentTotal,
                zone,
              },
              membership: selectedTier !== null ? MEMBERSHIP_TIERS[selectedTier]!.name : null,
            });
          }}
          className="flex-1 rounded-lg bg-sage px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sage-dark"
        >
          Complete Onboarding
        </button>
      </div>
    </div>
  );
}
