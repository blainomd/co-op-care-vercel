/**
 * InlineMiniCII — Mini Caregiver Impact Index rendered inline in Sage chat
 *
 * 3 sliders: physical energy, sleep quality, connection.
 * Scored 1-10 each, total /30.
 * Zones: Green ≤11, Yellow 12-20, Red ≥21.
 * Renders INSIDE a chat message — not a separate screen.
 */
import { useState } from 'react';

export interface MiniCIIResult {
  physical: number;
  sleep: number;
  isolation: number;
  total: number;
  zone: 'green' | 'yellow' | 'red';
}

interface InlineMiniCIIProps {
  onComplete: (result: MiniCIIResult) => void;
  completedResult?: MiniCIIResult;
}

function getZone(total: number): 'green' | 'yellow' | 'red' {
  if (total <= 11) return 'green';
  if (total <= 20) return 'yellow';
  return 'red';
}

const ZONE_COLORS = {
  green: {
    bg: 'bg-zone-green/10',
    text: 'text-zone-green',
    border: 'border-zone-green/30',
    label: "You're managing well",
  },
  yellow: {
    bg: 'bg-zone-yellow/10',
    text: 'text-yellow-700',
    border: 'border-zone-yellow/30',
    label: "You're carrying a lot",
  },
  red: {
    bg: 'bg-zone-red/10',
    text: 'text-zone-red',
    border: 'border-zone-red/30',
    label: 'You need support right now',
  },
};

const SLIDER_LABELS = [
  {
    key: 'physical' as const,
    low: 'Energized',
    high: 'Exhausted',
    question: "How's your body feeling?",
  },
  {
    key: 'sleep' as const,
    low: 'Sleeping well',
    high: "Can't sleep",
    question: "How's your sleep been?",
  },
  {
    key: 'isolation' as const,
    low: 'Connected',
    high: 'Isolated',
    question: 'How connected do you feel?',
  },
];

export function InlineMiniCII({ onComplete, completedResult }: InlineMiniCIIProps) {
  const [scores, setScores] = useState({ physical: 5, sleep: 5, isolation: 5 });
  const [submitted, setSubmitted] = useState(false);

  const total = scores.physical + scores.sleep + scores.isolation;
  const zone = getZone(total);

  const handleSubmit = () => {
    setSubmitted(true);
    onComplete({ ...scores, total, zone });
  };

  // Show completed view if result was already stored (survives re-mount)
  const result = completedResult ?? (submitted ? { ...scores, total, zone } : null);
  if (result) {
    const z = ZONE_COLORS[result.zone];
    return (
      <div className={`mt-2 rounded-xl border p-3 ${z.bg} ${z.border}`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-semibold ${z.text}`}>
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${result.zone === 'green' ? 'bg-zone-green' : result.zone === 'yellow' ? 'bg-zone-yellow' : 'bg-zone-red'}`}
            />{' '}
            Score: {result.total}/30
          </span>
          <span className={`text-xs ${z.text}`}>{z.label}</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
          <div>Body: {result.physical}/10</div>
          <div>Sleep: {result.sleep}/10</div>
          <div>Connection: {result.isolation}/10</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-3 rounded-xl border border-sage/20 bg-sage/5 p-3">
      <p className="text-xs font-medium text-sage-dark">
        Quick Check-in — slide honestly, no wrong answers
      </p>

      {SLIDER_LABELS.map(({ key, low, high, question }) => (
        <div key={key}>
          <label className="mb-1 block text-xs font-medium text-text-secondary">{question}</label>
          <input
            type="range"
            min={1}
            max={10}
            value={scores[key]}
            onChange={(e) => setScores((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
            className="w-full accent-sage"
          />
          <div className="flex justify-between text-[10px] text-text-muted">
            <span>{low}</span>
            <span className="font-medium text-text-secondary">{scores[key]}</span>
            <span>{high}</span>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full rounded-full bg-sage py-2 text-sm font-medium text-white hover:bg-sage-dark active:scale-95 transition-all"
      >
        See my results
      </button>
    </div>
  );
}
