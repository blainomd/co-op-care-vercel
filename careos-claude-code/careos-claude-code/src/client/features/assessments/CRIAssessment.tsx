/**
 * CRI Assessment — 14-factor Clinical Risk Index input form
 *
 * Clinical but approachable interface for conductors/admins.
 * Each factor scored 1-5 with fixed PRD weights.
 * Acuity classification and LMN eligibility shown in real-time.
 * Submits for MD review (24h SLA).
 */
import { useState, useMemo } from 'react';
import { CRI_MIN_RAW, CRI_MAX_RAW } from '@shared/constants/business-rules';

/** Factor definitions matching the server CRI_FACTOR_DEFINITIONS */
const CRI_FACTORS = [
  {
    name: 'Cognitive Status',
    weight: 1.2,
    description: 'Orientation, memory, and executive function',
    tooltip:
      'Consider MMSE/MoCA scores, ability to follow multi-step instructions, awareness of time/place.',
  },
  {
    name: 'Functional Mobility',
    weight: 1.2,
    description: 'Ambulation, transfers, and balance',
    tooltip:
      'Assess gait stability, transfer safety (bed→chair), use of assistive devices, Timed Up & Go results.',
  },
  {
    name: 'ADL Independence',
    weight: 1.0,
    description: 'Bathing, dressing, toileting, feeding',
    tooltip:
      'Rate independence in basic self-care activities. Consider need for cueing vs. hands-on assistance.',
  },
  {
    name: 'IADL Capacity',
    weight: 0.8,
    description: 'Cooking, finances, medication management, phone use',
    tooltip:
      'Assess ability to manage instrumental activities independently. Include bill paying, meal prep, transportation.',
  },
  {
    name: 'Medication Complexity',
    weight: 1.0,
    description: 'Number of medications, interactions, administration route',
    tooltip:
      'Consider polypharmacy risk (5+ meds), high-risk medications (anticoagulants, insulin), self-administration ability.',
  },
  {
    name: 'Behavioral Challenges',
    weight: 1.2,
    description: 'Agitation, wandering, sundowning, aggression',
    tooltip:
      'Evaluate frequency and severity of behavioral symptoms. Include verbal/physical aggression, exit-seeking, delusions.',
  },
  {
    name: 'Fall Risk',
    weight: 1.0,
    description: 'Fall history, environmental hazards, assistive device use',
    tooltip:
      'Review fall history (last 6 months), home hazards, balance assessment, medication-related fall risk.',
  },
  {
    name: 'Nutritional Status',
    weight: 0.8,
    description: 'Weight stability, dysphagia risk, special diets',
    tooltip:
      'Assess BMI trends, unintentional weight loss, swallowing safety, need for modified diet textures.',
  },
  {
    name: 'Social Support Network',
    weight: 0.8,
    description: 'Family involvement, caregiver availability, isolation',
    tooltip:
      'Evaluate available family/friend support, geographic proximity, willingness to assist, social engagement level.',
  },
  {
    name: 'Caregiver Burnout Level',
    weight: 1.0,
    description: 'Caregiver stress, respite needs, CII zone correlation',
    tooltip:
      'Cross-reference with CII score if available. Consider caregiver health, sleep disruption, employment impact.',
  },
  {
    name: 'Home Environment Safety',
    weight: 0.8,
    description: 'Grab bars, lighting, stairs, trip hazards',
    tooltip:
      'Assess physical home safety: grab bars in bathrooms, adequate lighting, stair management, clutter/trip hazards.',
  },
  {
    name: 'Emergency Preparedness',
    weight: 0.6,
    description: 'Emergency contacts, medical alert, advance directives',
    tooltip:
      'Review emergency plan, medical alert device, advance directive status, POLST/MOLST completion.',
  },
  {
    name: 'Financial Resources',
    weight: 0.6,
    description: 'Insurance coverage, ability to pay, benefit eligibility',
    tooltip:
      'Assess insurance coverage gaps, HSA/FSA availability, PACE eligibility, long-term care insurance, VA benefits.',
  },
  {
    name: 'Care Plan Adherence History',
    weight: 0.8,
    description: 'Compliance with previous care plans, follow-through',
    tooltip:
      'Review history of appointment attendance, medication compliance, therapy participation, home exercise program.',
  },
] as const;

type Acuity = 'low' | 'moderate' | 'high' | 'critical';

const ACUITY_STYLES: Record<
  Acuity,
  { bg: string; text: string; label: string; description: string }
> = {
  low: {
    bg: 'bg-zone-green/10',
    text: 'text-zone-green',
    label: 'Low Acuity',
    description: 'Minimal care coordination needed',
  },
  moderate: {
    bg: 'bg-zone-yellow/10',
    text: 'text-zone-yellow',
    label: 'Moderate Acuity',
    description: 'Regular care coordination recommended',
  },
  high: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    label: 'High Acuity',
    description: 'Intensive care plan — LMN eligible',
  },
  critical: {
    bg: 'bg-zone-red/10',
    text: 'text-zone-red',
    label: 'Critical Acuity',
    description: 'Urgent care plan + LMN required',
  },
};

function classifyAcuity(score: number): Acuity {
  if (score >= 60) return 'critical';
  if (score >= 45) return 'high';
  if (score >= 30) return 'moderate';
  return 'low';
}

export function CRIAssessment() {
  const [scores, setScores] = useState<number[]>(new Array(14).fill(1));
  const [expandedTooltip, setExpandedTooltip] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const rawScore = useMemo(() => {
    const sum = CRI_FACTORS.reduce((acc, factor, i) => acc + factor.weight * scores[i]!, 0);
    return Math.round(Math.max(CRI_MIN_RAW, Math.min(CRI_MAX_RAW, sum)) * 10) / 10;
  }, [scores]);

  const acuity = useMemo(() => classifyAcuity(rawScore), [rawScore]);
  const acuityStyle = ACUITY_STYLES[acuity];
  const lmnEligible = rawScore >= 45;
  const percentage = Math.round(((rawScore - CRI_MIN_RAW) / (CRI_MAX_RAW - CRI_MIN_RAW)) * 100);

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
            className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${acuityStyle.bg}`}
          >
            <span className={`text-3xl font-bold ${acuityStyle.text}`}>{rawScore}</span>
          </div>
          <h2 className="font-heading text-2xl font-semibold text-text-primary">
            CRI Assessment Submitted
          </h2>
          <p className={`mt-2 text-lg font-medium ${acuityStyle.text}`}>{acuityStyle.label}</p>
          <p className="mt-1 text-sm text-text-muted">{acuityStyle.description}</p>
          {lmnEligible && (
            <div className="mt-4 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
              LMN will be generated upon MD approval
            </div>
          )}
          <p className="mt-4 text-sm text-text-secondary">
            This assessment is now pending Medical Director review (24h SLA). You will be notified
            when it is reviewed.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a
              href="#/conductor"
              className="rounded-lg bg-sage px-6 py-2.5 text-sm font-medium text-white hover:bg-sage-dark"
            >
              Back to Dashboard
            </a>
            <button
              onClick={() => {
                setSubmitted(false);
                setScores(new Array(14).fill(1));
              }}
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-secondary hover:bg-warm-gray"
            >
              New Assessment
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
          Clinical Risk Index (CRI)
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Rate each clinical factor from 1 (minimal concern) to 5 (critical concern). Tap the info
          icon for clinical assessment guidance.
        </p>
      </div>

      {/* Live score indicator */}
      <div className="sticky top-14 z-30 mb-6 rounded-xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className={`text-2xl font-bold ${acuityStyle.text}`}>{rawScore}</span>
            <span className="text-sm text-text-muted"> / {CRI_MAX_RAW}</span>
          </div>
          <div className="flex items-center gap-2">
            {lmnEligible && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                LMN
              </span>
            )}
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${acuityStyle.bg} ${acuityStyle.text}`}
            >
              {acuityStyle.label}
            </span>
          </div>
        </div>
        <div className="mt-2 h-2 rounded-full bg-warm-gray">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              acuity === 'low'
                ? 'bg-zone-green'
                : acuity === 'moderate'
                  ? 'bg-zone-yellow'
                  : acuity === 'high'
                    ? 'bg-orange-500'
                    : 'bg-zone-red'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-text-muted">{acuityStyle.description}</p>
      </div>

      {/* Factor inputs */}
      <div className="space-y-4">
        {CRI_FACTORS.map((factor, index) => (
          <div key={factor.name} className="rounded-xl border border-border bg-white p-4">
            <div className="mb-1 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-text-primary">
                    {index + 1}. {factor.name}
                  </label>
                  <span className="text-xs text-text-muted">({factor.weight}x)</span>
                  <button
                    onClick={() => setExpandedTooltip(expandedTooltip === index ? null : index)}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-warm-gray text-xs text-text-muted hover:bg-border hover:text-text-secondary"
                    aria-label={`Clinical guidance for ${factor.name}`}
                  >
                    ?
                  </button>
                </div>
                <p className="text-xs text-text-muted">{factor.description}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  scores[index]! <= 2
                    ? 'bg-zone-green/10 text-zone-green'
                    : scores[index]! <= 3
                      ? 'bg-zone-yellow/10 text-zone-yellow'
                      : scores[index]! <= 4
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-zone-red/10 text-zone-red'
                }`}
              >
                {scores[index]}
              </span>
            </div>

            {/* Clinical tooltip */}
            {expandedTooltip === index && (
              <div className="mb-3 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                {factor.tooltip}
              </div>
            )}

            {/* Score buttons (1-5 discrete) */}
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => updateScore(index, value)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                    scores[index] === value
                      ? value <= 2
                        ? 'bg-zone-green text-white'
                        : value <= 3
                          ? 'bg-zone-yellow text-white'
                          : value <= 4
                            ? 'bg-orange-500 text-white'
                            : 'bg-zone-red text-white'
                      : 'border border-border bg-white text-text-secondary hover:bg-warm-gray'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-text-muted">
              <span>Minimal</span>
              <span>Moderate</span>
              <span>Critical</span>
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={handleSubmit}
          className="rounded-lg bg-sage px-8 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sage-dark"
        >
          Submit for MD Review
        </button>
        <p className="text-xs text-text-muted">
          Assessment will be reviewed by the Medical Director within 24 hours
        </p>
      </div>
    </div>
  );
}
