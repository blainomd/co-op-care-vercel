/**
 * Mini CII — 3-slider quick check, completable in 30 seconds
 *
 * Public-facing (no auth required). Warm, inviting design.
 * Physical Care + Sleep Disruption + Social Isolation = /30
 */
import { useState, useMemo } from 'react';
import {
  MINI_CII_DIMENSIONS,
  MINI_CII_MAX_SCORE,
  classifyMiniCIIZone,
  MINI_CII_ZONES,
} from '@shared/constants/business-rules';

const DIMENSION_PROMPTS = [
  'How much physical help does your loved one need day-to-day?',
  'How much does caregiving affect your sleep?',
  'How isolated do you feel because of caregiving?',
];

const ZONE_MESSAGES = {
  GREEN: {
    heading: "You're doing great",
    message:
      "It sounds like you're managing well. The CareOS community is here whenever you need a hand.",
    cta: 'Explore the Community',
  },
  YELLOW: {
    heading: 'Some support could help',
    message:
      'Many caregivers in your situation benefit from a little help. Our Time Bank lets neighbors exchange care hours.',
    cta: 'See How It Works',
  },
  RED: {
    heading: 'You deserve support',
    message:
      "Caregiving at this level is a lot. You don't have to do it alone. Let's connect you with neighbors who care.",
    cta: "Get Started — It's Free",
  },
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

export function MiniCII() {
  const [scores, setScores] = useState<number[]>([5, 5, 5]);
  const [showResult, setShowResult] = useState(false);

  const totalScore = useMemo(() => scores.reduce((a, b) => a + b, 0), [scores]);
  const zone = useMemo(() => classifyMiniCIIZone(totalScore), [totalScore]);
  const zoneStyle = ZONE_STYLES[zone];
  const zoneMessage = ZONE_MESSAGES[zone];
  const percentage = Math.round((totalScore / MINI_CII_MAX_SCORE) * 100);

  function updateScore(index: number, value: number) {
    setScores((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  if (showResult) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          {/* Score circle */}
          <div
            className={`mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full ring-4 ${zoneStyle.ring} ${zoneStyle.bg}`}
          >
            <span className={`text-3xl font-bold ${zoneStyle.text}`}>{totalScore}</span>
          </div>

          <h2 className="font-heading text-xl font-semibold text-text-primary">
            {zoneMessage.heading}
          </h2>

          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${zoneStyle.bg} ${zoneStyle.text}`}
          >
            {MINI_CII_ZONES[zone].label} Zone — {totalScore}/{MINI_CII_MAX_SCORE}
          </span>

          <p className="mt-4 text-sm leading-relaxed text-text-secondary">{zoneMessage.message}</p>

          <div className="mt-6 space-y-3">
            <a
              href="#/conductor"
              className="block rounded-lg bg-sage px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sage-dark"
            >
              {zoneMessage.cta}
            </a>
            <button
              onClick={() => setShowResult(false)}
              className="block w-full rounded-lg border border-border px-6 py-2.5 text-sm text-text-secondary hover:bg-warm-gray"
            >
              Retake Quick Check
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">Quick Care Check</h1>
        <p className="mt-2 text-sm text-text-secondary">
          3 quick questions — takes about 30 seconds
        </p>
      </div>

      {/* Live score bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className={`font-semibold ${zoneStyle.text}`}>
            {totalScore}/{MINI_CII_MAX_SCORE}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs ${zoneStyle.bg} ${zoneStyle.text}`}>
            {MINI_CII_ZONES[zone].label}
          </span>
        </div>
        <div className="mt-1.5 h-2.5 rounded-full bg-warm-gray">
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${zoneStyle.bar}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-6">
        {MINI_CII_DIMENSIONS.map((dimension, index) => (
          <div key={dimension} className="rounded-xl border border-border bg-white p-5">
            <label className="mb-1 block text-sm font-medium text-text-primary">{dimension}</label>
            <p className="mb-4 text-xs text-text-muted">{DIMENSION_PROMPTS[index]}</p>

            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-xs text-text-muted">1</span>
              <input
                type="range"
                min={1}
                max={10}
                value={scores[index]}
                onChange={(e) => updateScore(index, parseInt(e.target.value, 10))}
                className="flex-1 accent-sage"
              />
              <span className="w-6 text-center text-xs text-text-muted">10</span>
            </div>

            <div className="mt-1 flex justify-between px-6">
              <span className="text-[10px] text-text-muted">Low impact</span>
              <span
                className={`text-sm font-semibold ${
                  scores[index]! <= 3
                    ? 'text-zone-green'
                    : scores[index]! <= 7
                      ? 'text-zone-yellow'
                      : 'text-zone-red'
                }`}
              >
                {scores[index]}
              </span>
              <span className="text-[10px] text-text-muted">High impact</span>
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={() => setShowResult(true)}
        className="mt-8 w-full rounded-lg bg-sage px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sage-dark"
      >
        See My Results
      </button>
    </div>
  );
}
