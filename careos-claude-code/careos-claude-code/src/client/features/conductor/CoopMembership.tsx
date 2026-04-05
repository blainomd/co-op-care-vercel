/**
 * CoopMembership — Cooperative membership details
 *
 * Shows the family's cooperative membership status, benefits, co-op governance
 * participation, community impact, membership tiers, and referral program.
 */
import { useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Mock data                                                         */
/* ------------------------------------------------------------------ */

const MEMBERSHIP = {
  familyName: 'Henderson Family',
  tier: 'Founding',
  memberNumber: '#0023',
  memberSince: 'Oct 2025',
  status: 'Active' as const,
  annualFee: 100,
  nextDue: 'Oct 2026',
};

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: 'shield' | 'tax' | 'heart' | 'vote' | 'lifebuoy' | 'clock';
}

const BENEFITS: Benefit[] = [
  {
    id: 'care-floor',
    title: '40hr Care Floor',
    description: 'Guaranteed 40 hours per year of community care included with membership.',
    icon: 'shield',
  },
  {
    id: 'hsa-fsa',
    title: 'HSA/FSA Tax Savings',
    description:
      'Save 28-36% on care costs via Letter of Medical Necessity signed by our Medical Director.',
    icon: 'tax',
  },
  {
    id: 'continuity',
    title: 'Worker-Owner Continuity',
    description: 'Same caregiver, same trust. Worker-owners earn $25-28/hr + equity so they stay.',
    icon: 'heart',
  },
  {
    id: 'governance',
    title: 'Democratic Governance Vote',
    description: '1 member = 1 vote on cooperative budget, services, and policies.',
    icon: 'vote',
  },
  {
    id: 'respite',
    title: 'Emergency Respite Fund',
    description:
      'Access emergency care hours when you need them most, funded by the cooperative community.',
    icon: 'lifebuoy',
  },
  {
    id: 'timebank',
    title: 'Community Time Bank',
    description:
      'Give and receive hours of neighbor-to-neighbor care. Earn hours by helping others.',
    icon: 'clock',
  },
];

interface Vote {
  id: string;
  title: string;
  status: 'passed' | 'open';
  userVote?: 'Yes' | 'No' | 'Abstain';
  result?: string;
  daysRemaining?: number;
}

const RECENT_VOTES: Vote[] = [
  {
    id: 'v1',
    title: 'Q1 2026 Budget Approval',
    status: 'passed',
    userVote: 'Yes',
    result: 'Passed 34-6',
  },
  {
    id: 'v2',
    title: 'New Service: Pet Care',
    status: 'open',
    daysRemaining: 14,
  },
];

const IMPACT = {
  hoursReceived: 127,
  workerOwnersSupported: 3,
  timeBankGiven: 12,
  timeBankReceived: 8,
  taxSavingsYTD: 1210,
};

interface Tier {
  id: string;
  name: string;
  price: string;
  careFloor: string;
  features: string[];
  isCurrent: boolean;
}

const TIERS: Tier[] = [
  {
    id: 'community',
    name: 'Community',
    price: '$100/yr',
    careFloor: '40hr floor',
    features: [
      '40hr care floor',
      'Time Bank access',
      'HSA/FSA eligibility',
      'Emergency Respite Fund',
    ],
    isCurrent: false,
  },
  {
    id: 'enhanced',
    name: 'Enhanced',
    price: '$200/yr',
    careFloor: '80hr floor',
    features: [
      '80hr care floor',
      'Priority caregiver matching',
      'Time Bank access',
      'HSA/FSA eligibility',
      'Emergency Respite Fund',
    ],
    isCurrent: false,
  },
  {
    id: 'founding',
    name: 'Founding',
    price: '$100/yr',
    careFloor: '40hr floor',
    features: [
      '40hr care floor',
      'Governance vote',
      'Founding member badge',
      'Time Bank access',
      'HSA/FSA eligibility',
      'Emergency Respite Fund',
    ],
    isCurrent: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Inline SVG icon helpers                                           */
/* ------------------------------------------------------------------ */

function BenefitIcon({ type }: { type: Benefit['icon'] }) {
  const cls = 'h-6 w-6 text-sage';
  switch (type) {
    case 'shield':
      return (
        <svg
          className={cls}
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
      );
    case 'tax':
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
          />
        </svg>
      );
    case 'heart':
      return (
        <svg
          className={cls}
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
      );
    case 'vote':
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3.026a3.708 3.708 0 00-1.538.515l-.442-.442a1.575 1.575 0 00-2.227 2.227l.441.441a3.708 3.708 0 00-.515 1.538H1.575a1.575 1.575 0 100 3.15h1.026c.1.544.303 1.06.515 1.538l-.441.442a1.575 1.575 0 102.227 2.227l.441-.442c.478.212.994.316 1.538.515v1.026a1.575 1.575 0 103.15 0v-1.026c.544-.1 1.06-.303 1.538-.515l.442.442a1.575 1.575 0 102.227-2.227l-.442-.442c.212-.478.416-.994.515-1.538h1.026a1.575 1.575 0 100-3.15h-1.026a3.708 3.708 0 00-.515-1.538l.442-.441a1.575 1.575 0 10-2.227-2.227l-.442.441a3.708 3.708 0 00-1.538-.515V4.575zM8.475 12a3.525 3.525 0 117.05 0 3.525 3.525 0 01-7.05 0z"
          />
        </svg>
      );
    case 'lifebuoy':
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.712 4.33a9.027 9.027 0 011.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 00-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 010 9.424m-4.138-5.976a3.736 3.736 0 00-.88-1.388 3.737 3.737 0 00-1.388-.88m2.268 2.268a3.765 3.765 0 010 2.528m-2.268-4.796l-3.448 4.138m0 0a3.736 3.736 0 00-.88 1.388 3.736 3.736 0 001.388.88m-1.388-.88l-4.138 3.448m5.526-2.568a3.765 3.765 0 01-2.528 0m4.796-2.268l-4.138 3.448m0 0a9.027 9.027 0 01-1.306 1.652c-.51.51-1.064.944-1.652 1.306m0 0l3.448-4.138m-3.448 4.138a9.014 9.014 0 01-9.424 0m5.976-4.138a3.765 3.765 0 01-2.528 0m0 0a3.736 3.736 0 01-.88-1.388 3.737 3.737 0 01.88-1.388m0 2.776l-4.138-3.448M4.33 16.712a9.014 9.014 0 010-9.424m4.138 5.976l-4.138 3.448m0-8.872a9.027 9.027 0 00-1.306 1.652c-.51.51-.944 1.064-1.306 1.652m8.872-4.138L7.288 4.33"
          />
        </svg>
      );
    case 'clock':
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function CoopMembership() {
  const [referralCopied, setReferralCopied] = useState(false);

  const handleCopyReferral = () => {
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      {/* Page header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Cooperative Membership
        </h1>
        <p className="text-sm text-text-secondary">
          Your family's co-op membership, benefits, and governance
        </p>
      </div>

      {/* ---------------------------------------------------------- */}
      {/*  1. Membership Card                                        */}
      {/* ---------------------------------------------------------- */}
      <div className="rounded-xl border border-border bg-sage p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">
              co-op.care Member
            </p>
            <h2 className="mt-1 font-heading text-xl font-bold text-white">
              {MEMBERSHIP.familyName}
            </h2>
            <p className="mt-0.5 text-sm font-medium text-white/80">
              Founding Member {MEMBERSHIP.memberNumber}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <svg
              className="h-5 w-5 text-white"
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
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <p className="text-[11px] text-white/60">Member Since</p>
            <p className="text-sm font-semibold text-white">{MEMBERSHIP.memberSince}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/60">Status</p>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              <p className="text-sm font-semibold text-white">{MEMBERSHIP.status}</p>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-white/60">Annual Fee</p>
            <p className="text-sm font-semibold text-white">${MEMBERSHIP.annualFee}/year</p>
          </div>
          <div>
            <p className="text-[11px] text-white/60">Next Due</p>
            <p className="text-sm font-semibold text-white">{MEMBERSHIP.nextDue}</p>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/*  2. Membership Benefits                                    */}
      {/* ---------------------------------------------------------- */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Membership Benefits
        </h2>
        <p className="mb-3 text-sm text-text-secondary">
          Included with your cooperative membership
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <div key={b.id} className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sage/10">
                  <BenefitIcon type={b.icon} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{b.title}</h3>
                  <p className="mt-0.5 text-xs text-text-muted">{b.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/*  3. Cooperative Ownership                                  */}
      {/* ---------------------------------------------------------- */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Cooperative Ownership
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          co-op.care is a worker-owned cooperative. Families are members, not customers. Caregivers
          are owners, not contractors.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-sage/5 p-3">
            <div className="flex items-center gap-2">
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
                  d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                />
              </svg>
              <p className="text-sm font-semibold text-text-primary">1 Member = 1 Vote</p>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Democratic governance. Every family has an equal voice in cooperative decisions
              regardless of usage.
            </p>
          </div>

          <div className="rounded-lg bg-sage/5 p-3">
            <div className="flex items-center gap-2">
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
                  d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                />
              </svg>
              <p className="text-sm font-semibold text-text-primary">Worker-Owner Equity</p>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Caregivers earn $25-28/hr plus equity vesting (~$52K over 5 years). Ownership means
              they stay.
            </p>
          </div>

          <div className="rounded-lg bg-sage/5 p-3">
            <div className="flex items-center gap-2">
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
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-semibold text-text-primary">85% Retention</p>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Industry average turnover is 77%. Our cooperative model retains 85% of worker-owners
              year over year.
            </p>
          </div>

          <div className="rounded-lg bg-sage/5 p-3">
            <div className="flex items-center gap-2">
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
              <p className="text-sm font-semibold text-text-primary">Democratic Governance</p>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Budget, services, and policies are decided collectively. Members vote on quarterly
              budgets and new services.
            </p>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/*  4. Governance Participation                               */}
      {/* ---------------------------------------------------------- */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Governance Participation
        </h2>
        <p className="mb-3 text-sm text-text-secondary">Recent and open votes</p>

        <div className="space-y-3">
          {RECENT_VOTES.map((vote) => (
            <div key={vote.id} className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-primary">{vote.title}</h3>
                    {vote.status === 'passed' ? (
                      <span className="rounded-full bg-sage/10 px-2 py-0.5 text-[11px] font-medium text-sage">
                        Passed
                      </span>
                    ) : (
                      <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[11px] font-medium text-gold">
                        Open
                      </span>
                    )}
                  </div>

                  {vote.status === 'passed' && (
                    <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                      <span>Your vote: {vote.userVote}</span>
                      <span>{vote.result}</span>
                    </div>
                  )}

                  {vote.status === 'open' && vote.daysRemaining && (
                    <p className="mt-1 text-xs text-text-muted">
                      {vote.daysRemaining} days remaining to vote
                    </p>
                  )}
                </div>

                {vote.status === 'open' && (
                  <button
                    type="button"
                    className="shrink-0 rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage/90"
                  >
                    Vote Now
                  </button>
                )}

                {vote.status === 'passed' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/10">
                    <svg
                      className="h-4 w-4 text-sage"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/*  5. Community Impact                                       */}
      {/* ---------------------------------------------------------- */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h2 className="font-heading text-lg font-semibold text-text-primary">Community Impact</h2>
        <p className="mb-4 text-sm text-text-secondary">
          Your family's impact on the cooperative community
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-sage/5 p-3 text-center">
            <p className="text-2xl font-bold text-sage">{IMPACT.hoursReceived}</p>
            <p className="mt-0.5 text-xs text-text-muted">Hours of care received</p>
          </div>
          <div className="rounded-lg bg-copper/5 p-3 text-center">
            <p className="text-2xl font-bold text-copper">{IMPACT.workerOwnersSupported}</p>
            <p className="mt-0.5 text-xs text-text-muted">Worker-owners supported</p>
          </div>
          <div className="rounded-lg bg-sage/5 p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <p className="text-2xl font-bold text-sage">{IMPACT.timeBankGiven}</p>
              <svg
                className="h-4 w-4 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                />
              </svg>
              <p className="text-2xl font-bold text-sage">{IMPACT.timeBankReceived}</p>
            </div>
            <p className="mt-0.5 text-xs text-text-muted">Time Bank hrs (given / received)</p>
          </div>
          <div className="rounded-lg bg-gold/5 p-3 text-center">
            <p className="text-2xl font-bold text-gold">${IMPACT.taxSavingsYTD.toLocaleString()}</p>
            <p className="mt-0.5 text-xs text-text-muted">Tax savings YTD</p>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/*  6. Membership Tiers                                       */}
      {/* ---------------------------------------------------------- */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-text-primary">Membership Tiers</h2>
        <p className="mb-3 text-sm text-text-secondary">Compare membership options</p>

        <div className="grid gap-3 sm:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-xl border p-4 ${
                tier.isCurrent ? 'border-sage bg-sage/5 ring-1 ring-sage' : 'border-border bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-base font-semibold text-text-primary">
                  {tier.name}
                </h3>
                {tier.isCurrent && (
                  <span className="rounded-full bg-sage px-2 py-0.5 text-[11px] font-bold text-white">
                    Current
                  </span>
                )}
              </div>
              <p className="mt-1 text-lg font-bold text-sage">{tier.price}</p>
              <p className="text-xs text-text-muted">{tier.careFloor}</p>

              <ul className="mt-3 space-y-1.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-text-secondary">
                    <svg
                      className="mt-0.5 h-3 w-3 shrink-0 text-sage"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {!tier.isCurrent && (
                <button
                  type="button"
                  className="mt-4 w-full rounded-lg border border-sage px-3 py-1.5 text-xs font-medium text-sage hover:bg-sage/5"
                >
                  Switch to {tier.name}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/*  7. Refer a Family                                         */}
      {/* ---------------------------------------------------------- */}
      <div className="rounded-xl border border-border bg-warm-gray p-5">
        <div className="flex items-start gap-3">
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
                d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="font-heading text-base font-semibold text-text-primary">
              Refer a Family
            </h2>
            <p className="mt-0.5 text-sm text-text-secondary">
              Invite a neighbor — both families earn 5 bonus Time Bank hours
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleCopyReferral}
                className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage/90"
              >
                {referralCopied ? 'Link Copied!' : 'Copy Referral Link'}
              </button>
              <button
                type="button"
                className="rounded-lg border border-sage px-4 py-2 text-sm font-medium text-sage hover:bg-sage/5"
              >
                Share via Email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-[11px] text-text-muted">
        co-op.care is a worker-owned cooperative in Boulder, CO. Membership fees support cooperative
        operations and the Emergency Respite Fund. Questions? Contact us at hello@co-op.care.
      </p>
    </div>
  );
}
