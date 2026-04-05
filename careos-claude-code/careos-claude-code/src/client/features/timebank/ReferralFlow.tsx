/**
 * ReferralFlow — Refer-a-neighbor with tracking code + bonus credit
 *
 * Both referrer and referred member earn TIME_BANK.REFERRAL_BONUS_HOURS (5 hrs)
 * when the referred neighbor completes their first task.
 *
 * Warm community tone: "Share the care."
 */
import { useState } from 'react';

interface Referral {
  id: string;
  referredName: string;
  referredAt: string;
  status: 'pending' | 'signed_up' | 'first_task_completed' | 'bonus_earned';
  bonusHours: number;
}

interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  bonusHoursEarned: number;
  referrals: Referral[];
}

const MOCK_REFERRAL: ReferralData = {
  referralCode: 'CARE-JM2K8',
  totalReferrals: 3,
  bonusHoursEarned: 10,
  referrals: [
    {
      id: 'r1',
      referredName: 'Sarah M.',
      referredAt: '2026-02-20',
      status: 'bonus_earned',
      bonusHours: 5,
    },
    {
      id: 'r2',
      referredName: 'Tom K.',
      referredAt: '2026-02-28',
      status: 'first_task_completed',
      bonusHours: 5,
    },
    {
      id: 'r3',
      referredName: 'Elena R.',
      referredAt: '2026-03-05',
      status: 'signed_up',
      bonusHours: 0,
    },
  ],
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Invited', color: 'text-muted bg-warm-gray/20' },
  signed_up: { label: 'Signed Up', color: 'text-copper bg-copper/10' },
  first_task_completed: { label: 'First Task Done', color: 'text-sage bg-sage/10' },
  bonus_earned: { label: 'Bonus Earned', color: 'text-zone-green bg-zone-green/10' },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ReferralFlow() {
  const [data] = useState<ReferralData>(MOCK_REFERRAL);
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(data.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = `https://coopcareapp.com/join?ref=${data.referralCode}`;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Refer a Neighbor</h1>
        <p className="text-sm text-muted">Share the care — you both earn 5 bonus hours</p>
      </div>

      {/* Referral Card */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-sage to-sage/80 p-6 text-white shadow-lg">
        <p className="mb-1 text-xs opacity-70">Your referral code</p>
        <div className="mb-4 flex items-center gap-3">
          <code className="text-3xl font-bold tracking-wider">{data.referralCode}</code>
          <button
            onClick={copyCode}
            className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-white/30"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-sm opacity-90">
          When your neighbor signs up and completes their first task, you each earn 5 bonus hours.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-primary">{data.totalReferrals}</p>
          <p className="text-xs text-muted">Neighbors Referred</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-sage">{data.bonusHoursEarned}</p>
          <p className="text-xs text-muted">Bonus Hours Earned</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-copper">
            {
              data.referrals.filter((r) => r.status === 'signed_up' || r.status === 'pending')
                .length
            }
          </p>
          <p className="text-xs text-muted">Pending Bonuses</p>
        </div>
      </div>

      {/* Share Options */}
      <div className="rounded-xl border border-border bg-white p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Share Your Code</h2>
          <button
            onClick={() => setShowShareOptions(!showShareOptions)}
            className="text-sm text-sage hover:text-sage/80"
          >
            {showShareOptions ? 'Hide' : 'Show'} options
          </button>
        </div>
        {showShareOptions && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <button
              onClick={() =>
                window.open(
                  `sms:?body=Join our care community! Use my code ${data.referralCode} at ${shareLink}`,
                  '_blank',
                )
              }
              className="flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-warm-gray/20"
            >
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-primary">Text Message</p>
                <p className="text-xs text-muted">Send via SMS</p>
              </div>
            </button>
            <button
              onClick={() =>
                window.open(
                  `mailto:?subject=Join our care community&body=I'd love for you to join our cooperative care community! Use my referral code ${data.referralCode} at ${shareLink}`,
                  '_blank',
                )
              }
              className="flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-warm-gray/20"
            >
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-primary">Email</p>
                <p className="text-xs text-muted">Send an invitation</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Referral History */}
      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold text-primary">Referral History</h2>
        </div>
        <div className="divide-y divide-border">
          {data.referrals.map((r) => {
            const statusConfig = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pending!;
            return (
              <div key={r.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage/10 text-sm font-medium text-sage">
                    {r.referredName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">{r.referredName}</p>
                    <p className="text-xs text-muted">Referred {formatDate(r.referredAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </span>
                  {r.bonusHours > 0 && (
                    <p className="mt-0.5 text-xs font-medium text-sage">+{r.bonusHours} hrs</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-muted">
        Bonus hours are credited when your referred neighbor completes their first task. Both you
        and your neighbor receive {5} bonus hours. There is no limit on referrals.
      </p>
    </div>
  );
}
