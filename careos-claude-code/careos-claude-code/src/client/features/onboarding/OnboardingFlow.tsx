/**
 * OnboardingFlow — Conductor onboarding, completable in <10 minutes
 *
 * Flow: Mini CII → Create Account → Full CII → Membership ($100) → CRI Scheduling → Dashboard
 *
 * Each step is a self-contained screen. Progress is tracked with a step indicator.
 * Warm, inviting design — never clinical.
 */
import { useState, useMemo } from 'react';
import {
  MINI_CII_DIMENSIONS,
  MINI_CII_MAX_SCORE,
  classifyMiniCIIZone,
  MINI_CII_ZONES,
  CII_DIMENSIONS,
  CII_MAX_SCORE,
  classifyCIIZone,
  CII_ZONES,
  TIME_BANK,
} from '@shared/constants/business-rules';

type OnboardingStep =
  | 'mini-cii'
  | 'results'
  | 'create-account'
  | 'full-cii'
  | 'membership'
  | 'cri-schedule'
  | 'complete';

const STEP_LABELS = ['Quick Check', 'Account', 'Full Assessment', 'Membership', 'Schedule', 'Done'];

const MINI_CII_PROMPTS = [
  'How much physical help does your loved one need day-to-day?',
  'How much does caregiving affect your sleep?',
  'How isolated do you feel because of caregiving?',
];

const CII_DESCRIPTIONS: Record<string, string> = {
  'Physical Care Demands': 'How much hands-on physical help does your loved one need?',
  'Cognitive Supervision': 'How much do you need to supervise or redirect their daily activities?',
  'Emotional Labor': 'How emotionally draining is the caregiving experience?',
  'Financial Management': 'How much of their financial affairs do you manage?',
  'Medical Coordination': 'How much medical appointment and medication coordination do you handle?',
  Transportation: 'How much driving or transport arranging do you do for them?',
  'Household Management': 'How much household work falls to you because of caregiving?',
  'Social Isolation Impact': 'How much has caregiving affected your own social life?',
  'Sleep Disruption': 'How much does caregiving disrupt your sleep?',
  'Work Impact': 'How much has caregiving affected your work or career?',
  'Physical Health Impact': 'How much has caregiving affected your own physical health?',
  'Financial Strain': 'How much financial pressure does caregiving create for you?',
};

const ZONE_STYLES = {
  GREEN: {
    bg: 'bg-zone-green/10',
    text: 'text-zone-green',
    bar: 'bg-zone-green',
    ring: 'ring-zone-green',
  },
  YELLOW: {
    bg: 'bg-zone-yellow/10',
    text: 'text-zone-yellow',
    bar: 'bg-zone-yellow',
    ring: 'ring-zone-yellow',
  },
  RED: { bg: 'bg-zone-red/10', text: 'text-zone-red', bar: 'bg-zone-red', ring: 'ring-zone-red' },
};

const ZONE_MESSAGES = {
  GREEN: {
    heading: "You're doing great",
    message:
      "It sounds like you're managing well. Creating an account lets you stay connected to neighbors who can help when things change.",
  },
  YELLOW: {
    heading: 'Some support could help',
    message:
      "Many caregivers in your situation benefit from a community. Let's get you set up so neighbors can lend a hand.",
  },
  RED: {
    heading: 'You deserve support',
    message:
      "Caregiving at this level is a lot. The good news: your neighbors want to help. Let's get you connected.",
  },
};

export function OnboardingFlow() {
  const [step, setStep] = useState<OnboardingStep>('mini-cii');

  // Mini CII state
  const [miniScores, setMiniScores] = useState<number[]>([5, 5, 5]);
  const miniTotal = useMemo(() => miniScores.reduce((a, b) => a + b, 0), [miniScores]);
  const miniZone = useMemo(() => classifyMiniCIIZone(miniTotal), [miniTotal]);

  // Account state
  const [accountData, setAccountData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  // Full CII state
  const [ciiScores, setCiiScores] = useState<number[]>(new Array(12).fill(1));
  const ciiTotal = useMemo(() => ciiScores.reduce((a, b) => a + b, 0), [ciiScores]);
  const ciiZone = useMemo(() => classifyCIIZone(ciiTotal), [ciiTotal]);

  // ── Step progress bar ──
  function stepIndex(): number {
    const map: Record<OnboardingStep, number> = {
      'mini-cii': 0,
      results: 0,
      'create-account': 1,
      'full-cii': 2,
      membership: 3,
      'cri-schedule': 4,
      complete: 5,
    };
    return map[step];
  }

  function ProgressBar() {
    const current = stepIndex();
    return (
      <div className="mx-auto mb-8 max-w-md px-4">
        <div className="flex items-center justify-between">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  i < current
                    ? 'bg-sage text-white'
                    : i === current
                      ? 'bg-sage text-white ring-2 ring-sage/30'
                      : 'bg-warm-gray text-text-muted'
                }`}
              >
                {i < current ? (
                  <svg
                    className="h-3.5 w-3.5"
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
                className={`mt-1 text-[9px] ${i <= current ? 'text-text-primary font-medium' : 'text-text-muted'}`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 h-1 rounded-full bg-warm-gray">
          <div
            className="h-full rounded-full bg-sage transition-all duration-500"
            style={{ width: `${(current / (STEP_LABELS.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  // ── Step 1: Mini CII ──
  if (step === 'mini-cii') {
    const zoneStyle = ZONE_STYLES[miniZone];
    const pct = Math.round((miniTotal / MINI_CII_MAX_SCORE) * 100);

    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <ProgressBar />
        <div className="mb-6 text-center">
          <h1 className="font-heading text-2xl font-semibold text-text-primary">
            Quick Care Check
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            3 quick questions — takes about 30 seconds
          </p>
        </div>

        {/* Live score */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className={`font-semibold ${zoneStyle.text}`}>
              {miniTotal}/{MINI_CII_MAX_SCORE}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs ${zoneStyle.bg} ${zoneStyle.text}`}>
              {MINI_CII_ZONES[miniZone].label}
            </span>
          </div>
          <div className="mt-1.5 h-2.5 rounded-full bg-warm-gray">
            <div
              className={`h-full rounded-full transition-all duration-300 ${zoneStyle.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="space-y-5">
          {MINI_CII_DIMENSIONS.map((dim, i) => (
            <div key={dim} className="rounded-xl border border-border bg-white p-5">
              <label className="mb-1 block text-sm font-medium text-text-primary">{dim}</label>
              <p className="mb-4 text-xs text-text-muted">{MINI_CII_PROMPTS[i]}</p>
              <div className="flex items-center gap-3">
                <span className="w-6 text-center text-xs text-text-muted">1</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={miniScores[i]}
                  onChange={(e) => {
                    const next = [...miniScores];
                    next[i] = parseInt(e.target.value, 10);
                    setMiniScores(next);
                  }}
                  className="flex-1 accent-sage"
                />
                <span className="w-6 text-center text-xs text-text-muted">10</span>
              </div>
              <div className="mt-1 flex justify-between px-6">
                <span className="text-[10px] text-text-muted">Low impact</span>
                <span
                  className={`text-sm font-semibold ${
                    miniScores[i]! <= 3
                      ? 'text-zone-green'
                      : miniScores[i]! <= 7
                        ? 'text-zone-yellow'
                        : 'text-zone-red'
                  }`}
                >
                  {miniScores[i]}
                </span>
                <span className="text-[10px] text-text-muted">High impact</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStep('results')}
          className="mt-6 w-full rounded-lg bg-sage px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-sage-dark"
        >
          See My Results
        </button>
      </div>
    );
  }

  // ── Step 1b: Results ──
  if (step === 'results') {
    const zoneStyle = ZONE_STYLES[miniZone];
    const msg = ZONE_MESSAGES[miniZone];

    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <ProgressBar />
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <div
            className={`mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full ring-4 ${zoneStyle.ring} ${zoneStyle.bg}`}
          >
            <span className={`text-3xl font-bold ${zoneStyle.text}`}>{miniTotal}</span>
          </div>
          <h2 className="font-heading text-xl font-semibold text-text-primary">{msg.heading}</h2>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${zoneStyle.bg} ${zoneStyle.text}`}
          >
            {MINI_CII_ZONES[miniZone].label} Zone — {miniTotal}/{MINI_CII_MAX_SCORE}
          </span>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">{msg.message}</p>
          <button
            onClick={() => setStep('create-account')}
            className="mt-6 w-full rounded-lg bg-sage px-6 py-3 text-sm font-medium text-white hover:bg-sage-dark"
          >
            Create My Free Account
          </button>
        </div>
      </div>
    );
  }

  // ── Step 2: Create Account ──
  if (step === 'create-account') {
    function handleAccountSubmit(e: React.FormEvent) {
      e.preventDefault();
      // API call will be wired in later
      setStep('full-cii');
    }

    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <ProgressBar />
        <div className="mb-6 text-center">
          <h1 className="font-heading text-xl font-semibold text-text-primary">
            Create Your Account
          </h1>
          <p className="mt-1 text-sm text-text-secondary">Join your neighborhood care community</p>
        </div>

        <form
          onSubmit={handleAccountSubmit}
          className="rounded-2xl border border-border bg-white p-6"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-primary">First Name</label>
              <input
                type="text"
                required
                value={accountData.firstName}
                onChange={(e) => setAccountData((p) => ({ ...p, firstName: e.target.value }))}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-primary">Last Name</label>
              <input
                type="text"
                required
                value={accountData.lastName}
                onChange={(e) => setAccountData((p) => ({ ...p, lastName: e.target.value }))}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-text-primary">Email</label>
            <input
              type="email"
              required
              value={accountData.email}
              onChange={(e) => setAccountData((p) => ({ ...p, email: e.target.value }))}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              placeholder="you@example.com"
            />
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-text-primary">
              Phone <span className="font-normal text-text-muted">(optional)</span>
            </label>
            <input
              type="tel"
              value={accountData.phone}
              onChange={(e) => setAccountData((p) => ({ ...p, phone: e.target.value }))}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              placeholder="(303) 555-0100"
            />
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-text-primary">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={accountData.password}
              onChange={(e) => setAccountData((p) => ({ ...p, password: e.target.value }))}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              placeholder="At least 8 characters"
            />
          </div>

          <button
            type="submit"
            className="mt-5 w-full rounded-lg bg-sage px-6 py-3 text-sm font-medium text-white hover:bg-sage-dark"
          >
            Create Account & Continue
          </button>

          <p className="mt-3 text-center text-[10px] text-text-muted">
            By creating an account you agree to co-op.care&apos;s Terms of Service and Privacy
            Policy.
          </p>
        </form>
      </div>
    );
  }

  // ── Step 3: Full CII ──
  if (step === 'full-cii') {
    const zoneStyle = ZONE_STYLES[ciiZone];
    const pct = Math.round((ciiTotal / CII_MAX_SCORE) * 100);

    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <ProgressBar />
        <div className="mb-4">
          <h1 className="font-heading text-xl font-semibold text-text-primary">
            Full Care Assessment
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Rate each area from 1 (minimal) to 10 (significant). This helps us match you with the
            right support.
          </p>
        </div>

        {/* Sticky score */}
        <div className="sticky top-0 z-30 mb-4 rounded-xl border border-border bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-xl font-bold ${zoneStyle.text}`}>{ciiTotal}</span>
              <span className="text-sm text-text-muted">/{CII_MAX_SCORE}</span>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${zoneStyle.bg} ${zoneStyle.text}`}
            >
              {CII_ZONES[ciiZone].label}
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-warm-gray">
            <div
              className={`h-full rounded-full transition-all duration-300 ${zoneStyle.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {CII_DIMENSIONS.map((dim, i) => (
            <div key={dim} className="rounded-xl border border-border bg-white p-4">
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium text-text-primary">
                  {i + 1}. {dim}
                </label>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    ciiScores[i]! <= 3
                      ? 'bg-zone-green/10 text-zone-green'
                      : ciiScores[i]! <= 7
                        ? 'bg-zone-yellow/10 text-zone-yellow'
                        : 'bg-zone-red/10 text-zone-red'
                  }`}
                >
                  {ciiScores[i]}
                </span>
              </div>
              <p className="mb-3 text-xs text-text-muted">{CII_DESCRIPTIONS[dim]}</p>
              <input
                type="range"
                min={1}
                max={10}
                value={ciiScores[i]}
                onChange={(e) => {
                  const next = [...ciiScores];
                  next[i] = parseInt(e.target.value, 10);
                  setCiiScores(next);
                }}
                className="w-full accent-sage"
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => setStep('membership')}
          className="mt-6 w-full rounded-lg bg-sage px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-sage-dark"
        >
          Continue to Membership
        </button>
      </div>
    );
  }

  // ── Step 4: Membership ($100) ──
  if (step === 'membership') {
    const annualCost = TIME_BANK.MEMBERSHIP_ANNUAL_COST_CENTS / 100;
    const floorHours = TIME_BANK.MEMBERSHIP_FLOOR_HOURS;

    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <ProgressBar />
        <div className="mb-6 text-center">
          <h1 className="font-heading text-xl font-semibold text-text-primary">
            Time Bank Membership
          </h1>
          <p className="mt-1 text-sm text-text-secondary">One simple annual fee</p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          {/* Price card */}
          <div className="rounded-xl bg-sage/5 p-5 text-center">
            <span className="text-4xl font-bold text-sage">${annualCost}</span>
            <span className="text-sm text-text-muted">/year</span>
            <p className="mt-2 text-sm text-text-secondary">
              Includes <span className="font-semibold text-text-primary">{floorHours} hours</span>{' '}
              of community care credits
            </p>
          </div>

          {/* Benefits */}
          <div className="mt-5 space-y-3">
            {[
              'Exchange care hours with neighbors',
              'GPS-verified task completion',
              'Access to community cascade network',
              'Emergency respite fund coverage',
              'HSA/FSA eligible',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 shrink-0 text-sage"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-text-secondary">{benefit}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep('cri-schedule')}
            className="mt-6 w-full rounded-lg bg-sage px-6 py-3 text-sm font-medium text-white hover:bg-sage-dark"
          >
            Continue with Membership — ${annualCost}
          </button>

          <p className="mt-2 text-center text-[10px] text-text-muted">
            Stripe-secured payment. Cancel anytime. HSA/FSA eligible.
          </p>
        </div>
      </div>
    );
  }

  // ── Step 5: CRI Scheduling ──
  if (step === 'cri-schedule') {
    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <ProgressBar />
        <div className="mb-6 text-center">
          <h1 className="font-heading text-xl font-semibold text-text-primary">
            Schedule Your Care Review
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            A brief phone call with our care team to understand your needs
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="mb-5 rounded-lg bg-sage/5 p-4">
            <h3 className="text-sm font-medium text-text-primary">Care Review Interview (CRI)</h3>
            <p className="mt-1 text-xs text-text-secondary">
              A 15-minute phone call where we learn about your care situation. This helps our
              medical director ensure you get the right level of support.
            </p>
          </div>

          {/* Time slots */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Available Times
            </p>
            {[
              { day: 'Tomorrow', time: '10:00 AM', label: 'Mon, Mar 10' },
              { day: 'Tomorrow', time: '2:00 PM', label: 'Mon, Mar 10' },
              { day: 'Wednesday', time: '9:00 AM', label: 'Wed, Mar 12' },
              { day: 'Wednesday', time: '3:30 PM', label: 'Wed, Mar 12' },
              { day: 'Thursday', time: '11:00 AM', label: 'Thu, Mar 13' },
            ].map((slot) => (
              <button
                key={`${slot.label}-${slot.time}`}
                onClick={() => setStep('complete')}
                className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-3 text-left transition-colors hover:border-sage hover:bg-sage/5"
              >
                <div>
                  <span className="text-sm font-medium text-text-primary">
                    {slot.day}, {slot.time}
                  </span>
                  <span className="ml-2 text-xs text-text-muted">{slot.label}</span>
                </div>
                <svg
                  className="h-4 w-4 text-text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep('complete')}
            className="mt-4 w-full rounded-lg border border-border px-6 py-2.5 text-sm text-text-secondary hover:bg-warm-gray"
          >
            Skip for Now
          </button>
        </div>
      </div>
    );
  }

  // ── Step 6: Complete ──
  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <ProgressBar />
      <div className="rounded-2xl border border-border bg-white p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
          <svg
            className="h-8 w-8 text-sage"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-heading text-xl font-semibold text-text-primary">Welcome to CareOS!</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Your community care account is ready. Your neighbors are here for you.
        </p>

        <div className="mt-5 rounded-lg bg-sage/5 p-4 text-left">
          <h3 className="text-sm font-medium text-text-primary">What happens next</h3>
          <ul className="mt-2 space-y-2 text-xs text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-sage">1.</span>
              Browse available help in your Time Bank
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-sage">2.</span>
              Request your first care task from a neighbor
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-sage">3.</span>
              Complete your CRI call to unlock full benefits
            </li>
          </ul>
        </div>

        <a
          href="#/conductor"
          className="mt-6 block rounded-lg bg-sage px-6 py-3 text-sm font-medium text-white hover:bg-sage-dark"
        >
          Go to My Dashboard
        </a>
      </div>
    </div>
  );
}
