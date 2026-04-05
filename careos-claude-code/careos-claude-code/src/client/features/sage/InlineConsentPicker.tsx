/**
 * InlineConsentPicker — Memory consent choice rendered inline in Sage chat
 *
 * Used during onboarding memory_consent phase.
 * Three options: remember me, session only, tell me more.
 */
import { useState } from 'react';
import type { MemoryConsent } from '../../stores/signupStore';
import { TileIcon } from '../../components/TileIcon';

interface InlineConsentPickerProps {
  onComplete: (consent: MemoryConsent) => void;
  onTellMeMore: () => void;
  completedConsent?: MemoryConsent;
}

const OPTIONS: Array<{
  consent: MemoryConsent | 'more';
  label: string;
  desc: string;
  emoji: string;
}> = [
  {
    consent: 'granted',
    label: 'Yes, remember me',
    desc: 'Data stays on your device',
    emoji: 'check',
  },
  {
    consent: 'session_only',
    label: 'Just this session',
    desc: 'Forgotten when you leave',
    emoji: 'clock',
  },
  { consent: 'more', label: 'Tell me more', desc: 'What exactly do you store?', emoji: 'question' },
];

export function InlineConsentPicker({
  onComplete,
  onTellMeMore,
  completedConsent,
}: InlineConsentPickerProps) {
  const [chosen, setChosen] = useState<string | null>(null);

  const handlePick = (consent: MemoryConsent | 'more') => {
    if (consent === 'more') {
      onTellMeMore();
      return;
    }
    setChosen(consent);
    onComplete(consent);
  };

  // Show completed view if result was already stored (survives re-mount)
  const done = completedConsent ?? chosen;
  if (done) {
    return (
      <div className="mt-2 rounded-xl border border-sage/20 bg-sage/5 p-3">
        <p className="text-xs font-medium text-sage-dark">
          {done === 'granted'
            ? "I'll remember you — your data stays on this device."
            : "Got it — I'll forget when you close this tab."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1.5 rounded-xl border border-sage/20 bg-sage/5 p-3">
      <p className="text-xs font-medium text-sage-dark">Your choice — no wrong answer:</p>
      {OPTIONS.map((opt) => (
        <button
          key={opt.consent}
          type="button"
          onClick={() => handlePick(opt.consent)}
          className="flex w-full items-center gap-2 rounded-lg border border-sage/20 bg-white px-3 py-2 text-left text-xs transition-all hover:bg-sage/5 active:scale-[0.98]"
        >
          <TileIcon name={opt.emoji} size={16} />
          <div>
            <span className="font-medium text-text-primary">{opt.label}</span>
            <span className="ml-1 text-text-muted">— {opt.desc}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
