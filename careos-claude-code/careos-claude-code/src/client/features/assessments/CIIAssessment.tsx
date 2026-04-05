/**
 * CII Assessment — 12-dimension slider assessment
 *
 * Warm, friendly interface — NOT clinical feeling.
 * Each dimension scored 1-10 via smooth sliders.
 * Zone color feedback updates in real-time as user adjusts.
 */
import { useState, useMemo } from 'react';
import {
  CII_DIMENSIONS,
  CII_MAX_SCORE,
  classifyCIIZone,
  CII_ZONES,
} from '@shared/constants/business-rules';

const DIMENSION_DESCRIPTIONS: Record<string, string> = {
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
    label: "You're managing well",
  },
  YELLOW: {
    bg: 'bg-zone-yellow/10',
    text: 'text-zone-yellow',
    bar: 'bg-zone-yellow',
    label: 'Some support could help',
  },
  RED: {
    bg: 'bg-zone-red/10',
    text: 'text-zone-red',
    bar: 'bg-zone-red',
    label: 'You deserve more support',
  },
};

const SLIDER_LABELS = ['Minimal', '', '', '', 'Moderate', '', '', '', '', 'Significant'];

export function CIIAssessment() {
  const [scores, setScores] = useState<number[]>(new Array(12).fill(1));
  const [submitted, setSubmitted] = useState(false);

  const totalScore = useMemo(() => scores.reduce((a, b) => a + b, 0), [scores]);
  const zone = useMemo(() => classifyCIIZone(totalScore), [totalScore]);
  const zoneStyle = ZONE_STYLES[zone];
  const percentage = Math.round((totalScore / CII_MAX_SCORE) * 100);

  function updateScore(index: number, value: number) {
    setScores((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleSubmit() {
    setSubmitted(true);
    // API call will be wired in later
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <div
            className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${zoneStyle.bg}`}
          >
            <span className={`text-3xl font-bold ${zoneStyle.text}`}>{totalScore}</span>
          </div>
          <h2 className="font-heading text-2xl font-semibold text-text-primary">
            Assessment Complete
          </h2>
          <p className={`mt-2 text-lg font-medium ${zoneStyle.text}`}>
            {CII_ZONES[zone].label} Zone — {zoneStyle.label}
          </p>
          <p className="mt-4 text-sm text-text-secondary">
            Your score of {totalScore}/{CII_MAX_SCORE} has been recorded. Your care team will use
            this to ensure you get the right support.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a
              href="#/conductor"
              className="rounded-lg bg-sage px-6 py-2.5 text-sm font-medium text-white hover:bg-sage-dark"
            >
              Back to Dashboard
            </a>
            <button
              onClick={() => setSubmitted(false)}
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-secondary hover:bg-warm-gray"
            >
              Retake
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          Caregiver Impact Check-In
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Rate each area from 1 (minimal impact) to 10 (significant impact). There are no wrong
          answers — this helps us understand how to support you.
        </p>
      </div>

      {/* Live score indicator */}
      <div className="sticky top-14 z-30 mb-6 rounded-xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className={`text-2xl font-bold ${zoneStyle.text}`}>{totalScore}</span>
            <span className="text-sm text-text-muted">/{CII_MAX_SCORE}</span>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${zoneStyle.bg} ${zoneStyle.text}`}
          >
            {CII_ZONES[zone].label} Zone
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-warm-gray">
          <div
            className={`h-full rounded-full transition-all duration-300 ${zoneStyle.bar}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Dimension sliders */}
      <div className="space-y-6">
        {CII_DIMENSIONS.map((dimension, index) => (
          <div key={dimension} className="rounded-xl border border-border bg-white p-4">
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-text-primary">
                {index + 1}. {dimension}
              </label>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  scores[index]! <= 3
                    ? 'bg-zone-green/10 text-zone-green'
                    : scores[index]! <= 7
                      ? 'bg-zone-yellow/10 text-zone-yellow'
                      : 'bg-zone-red/10 text-zone-red'
                }`}
              >
                {scores[index]}
              </span>
            </div>
            <p className="mb-3 text-xs text-text-muted">{DIMENSION_DESCRIPTIONS[dimension]}</p>
            <input
              type="range"
              min={1}
              max={10}
              value={scores[index]}
              onChange={(e) => updateScore(index, parseInt(e.target.value, 10))}
              className="w-full accent-sage"
            />
            <div className="mt-1 flex justify-between">
              {SLIDER_LABELS.map((label, i) => (
                <span key={i} className="text-[10px] text-text-muted">
                  {label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSubmit}
          className="rounded-lg bg-sage px-8 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sage-dark"
        >
          Complete Assessment
        </button>
      </div>
    </div>
  );
}
