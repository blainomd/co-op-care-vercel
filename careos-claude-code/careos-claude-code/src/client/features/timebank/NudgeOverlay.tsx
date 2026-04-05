/**
 * NudgeOverlay — Contextual, dismissible nudge cards
 *
 * Non-blocking behavioral nudges that appear above content.
 * Warm community tone, NEVER gamification.
 * Each nudge can be dismissed individually.
 */
import { useState } from 'react';

interface NudgeData {
  id: string;
  type:
    | 'deficit_warning'
    | 'streak_milestone'
    | 'burnout_warning'
    | 'expiry_warning'
    | 'referral_prompt'
    | 'credit_expiry_warning';
  level: 'info' | 'warning' | 'urgent';
  message: string;
  deficitHours?: number;
  streakWeeks?: number;
  expiringHours?: number;
  expiryDate?: string;
  referralCode?: string;
}

const MOCK_NUDGES: NudgeData[] = [
  {
    id: 'n1',
    type: 'streak_milestone',
    level: 'info',
    message: 'Four weeks of giving back. Keep it up!',
    streakWeeks: 4,
  },
  {
    id: 'n2',
    type: 'credit_expiry_warning',
    level: 'warning',
    message: '3.5 hours will expire on Apr 8. Consider using them to help a neighbor.',
    expiringHours: 3.5,
    expiryDate: '2026-04-08',
  },
  {
    id: 'n3',
    type: 'referral_prompt',
    level: 'info',
    message:
      "You've helped 3 neighbors! Know someone who could use a hand? Share your referral code — you'll both earn 5 bonus hours.",
    referralCode: 'CARE-JM2K8',
  },
];

const LEVEL_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  info: { bg: 'bg-sage/10', border: 'border-sage/30', icon: 'text-sage' },
  warning: { bg: 'bg-copper/10', border: 'border-copper/30', icon: 'text-copper' },
  urgent: { bg: 'bg-zone-red/10', border: 'border-zone-red/30', icon: 'text-zone-red' },
};

const TYPE_ICONS: Record<string, string> = {
  deficit_warning:
    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  streak_milestone:
    'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  burnout_warning:
    'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  expiry_warning: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  referral_prompt:
    'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  credit_expiry_warning: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
};

function NudgeCard({ nudge, onDismiss }: { nudge: NudgeData; onDismiss: () => void }) {
  const styles = LEVEL_STYLES[nudge.level] ?? LEVEL_STYLES.info!;
  const icon = TYPE_ICONS[nudge.type] ?? TYPE_ICONS.deficit_warning!;

  return (
    <div className={`flex items-start gap-3 rounded-xl border ${styles.border} ${styles.bg} p-4`}>
      <svg
        className={`mt-0.5 h-5 w-5 shrink-0 ${styles.icon}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      <div className="flex-1">
        <p className="text-sm text-primary">{nudge.message}</p>
        {nudge.type === 'referral_prompt' && nudge.referralCode && (
          <div className="mt-2 flex items-center gap-2">
            <code className="rounded bg-white px-2 py-1 text-xs font-mono font-semibold text-sage">
              {nudge.referralCode}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(nudge.referralCode ?? '')}
              className="text-xs text-sage hover:text-sage/80"
            >
              Copy
            </button>
          </div>
        )}
        {nudge.type === 'credit_expiry_warning' && nudge.expiringHours && (
          <a
            href="#/timebank"
            className="mt-2 inline-block text-xs font-medium text-sage hover:text-sage/80"
          >
            Browse available tasks
          </a>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-full p-1 text-muted transition-colors hover:bg-white/50 hover:text-secondary"
        aria-label="Dismiss"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function NudgeOverlay() {
  const [nudges, setNudges] = useState<NudgeData[]>(MOCK_NUDGES);

  const dismiss = (id: string) => {
    setNudges((prev) => prev.filter((n) => n.id !== id));
  };

  if (nudges.length === 0) return null;

  return (
    <div className="space-y-2">
      {nudges.map((nudge) => (
        <NudgeCard key={nudge.id} nudge={nudge} onDismiss={() => dismiss(nudge.id)} />
      ))}
    </div>
  );
}
