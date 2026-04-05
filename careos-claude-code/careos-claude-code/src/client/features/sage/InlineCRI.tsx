/**
 * InlineCRI — Care Recipient Index rendered inline in Sage chat
 *
 * 5 sliders assessing the person being cared for:
 *   Mobility, Memory, Daily Tasks, Medications, Mood/Social
 *
 * Scored 1-10 each, total /50.
 * Zones: Green ≤18, Yellow 19-32, Red ≥33.
 *
 * Maps to Omaha System problems:
 *   Mobility  → H18 Neuro-musculo-skeletal function
 *   Memory    → H27 Cognition
 *   Daily     → B36 Personal care
 *   Meds      → B40 Medication regimen
 *   Social    → P06 Social contact
 *
 * Renders INSIDE a chat message — mirrors InlineMiniCII pattern.
 */
import { useState } from 'react';
import { TileIcon } from '../../components/TileIcon';

export interface CRIResult {
  mobility: number;
  memory: number;
  dailyTasks: number;
  medications: number;
  social: number;
  total: number;
  zone: 'green' | 'yellow' | 'red';
  /** Omaha problem codes flagged by this assessment */
  omahaFlags: string[];
}

interface InlineCRIProps {
  onComplete: (result: CRIResult) => void;
  completedResult?: CRIResult;
}

function getZone(total: number): 'green' | 'yellow' | 'red' {
  if (total <= 18) return 'green';
  if (total <= 32) return 'yellow';
  return 'red';
}

interface CRIScores {
  mobility: number;
  memory: number;
  dailyTasks: number;
  medications: number;
  social: number;
}

/** Flag Omaha problems when individual scores are concerning (≥7) */
function getOmahaFlags(scores: CRIScores): string[] {
  const flags: string[] = [];
  if (scores.mobility >= 7) flags.push('H18'); // Neuro-musculo-skeletal
  if (scores.memory >= 7) flags.push('H27'); // Cognition
  if (scores.dailyTasks >= 7) flags.push('B36'); // Personal care
  if (scores.medications >= 7) flags.push('B40'); // Medication regimen
  if (scores.social >= 7) flags.push('P06'); // Social contact
  // Cross-domain flags
  if (scores.mobility >= 5 && scores.dailyTasks >= 5) flags.push('E03'); // Residence safety
  if (scores.memory >= 5 && scores.medications >= 5) flags.push('B39'); // Health care supervision
  return [...new Set(flags)];
}

const ZONE_COLORS = {
  green: {
    bg: 'bg-zone-green/10',
    text: 'text-zone-green',
    border: 'border-zone-green/30',
    label: 'Mostly independent',
    detail: 'Your loved one is managing well. Companion visits can maintain this.',
  },
  yellow: {
    bg: 'bg-zone-yellow/10',
    text: 'text-yellow-700',
    border: 'border-zone-yellow/30',
    label: 'Needs regular support',
    detail: 'Some areas need attention. A matched Care Neighbor can help with the harder parts.',
  },
  red: {
    bg: 'bg-zone-red/10',
    text: 'text-zone-red',
    border: 'border-zone-red/30',
    label: 'Needs significant help',
    detail: "Multiple areas need support. Let's build a care plan together.",
  },
};

const SLIDER_LABELS = [
  {
    key: 'mobility' as const,
    low: 'Moving freely',
    high: "Can't move safely",
    question: 'How is their mobility?',
    icon: 'people',
  },
  {
    key: 'memory' as const,
    low: 'Sharp & clear',
    high: 'Very confused',
    question: 'How is their memory?',
    icon: 'pulse',
  },
  {
    key: 'dailyTasks' as const,
    low: 'Independent',
    high: 'Needs full help',
    question: 'Daily tasks — bathing, dressing?',
    icon: 'home',
  },
  {
    key: 'medications' as const,
    low: 'Managing well',
    high: 'Missing doses',
    question: 'How are medications going?',
    icon: 'hospital',
  },
  {
    key: 'social' as const,
    low: 'Engaged & social',
    high: 'Withdrawn',
    question: 'How is their mood & connection?',
    icon: 'chat',
  },
];

const OMAHA_LABELS: Record<string, string> = {
  H18: 'Mobility',
  H27: 'Cognition',
  B36: 'Personal care',
  B40: 'Medication management',
  P06: 'Social connection',
  E03: 'Home safety',
  B39: 'Health care coordination',
};

export function InlineCRI({ onComplete, completedResult }: InlineCRIProps) {
  const [scores, setScores] = useState({
    mobility: 5,
    memory: 5,
    dailyTasks: 5,
    medications: 5,
    social: 5,
  });
  const [submitted, setSubmitted] = useState(false);

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const zone = getZone(total);

  const handleSubmit = () => {
    setSubmitted(true);
    const omahaFlags = getOmahaFlags(scores);
    onComplete({ ...scores, total, zone, omahaFlags });
  };

  // Show completed view if result was already stored
  const result =
    completedResult ??
    (submitted ? { ...scores, total, zone, omahaFlags: getOmahaFlags(scores) } : null);
  if (result) {
    const z = ZONE_COLORS[result.zone];
    return (
      <div className={`mt-2 rounded-xl border p-3 ${z.bg} ${z.border}`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-semibold ${z.text}`}>
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${result.zone === 'green' ? 'bg-zone-green' : result.zone === 'yellow' ? 'bg-zone-yellow' : 'bg-zone-red'}`}
            />{' '}
            Care Score: {result.total}/50
          </span>
          <span className={`text-xs ${z.text}`}>{z.label}</span>
        </div>
        <p className="mt-1 text-xs text-text-secondary">{z.detail}</p>
        <div className="mt-2 grid grid-cols-5 gap-1 text-center text-[10px] text-text-muted">
          <div>
            <TileIcon name="people" size={10} /> {result.mobility}
          </div>
          <div>
            <TileIcon name="pulse" size={10} /> {result.memory}
          </div>
          <div>
            <TileIcon name="home" size={10} /> {result.dailyTasks}
          </div>
          <div>
            <TileIcon name="hospital" size={10} /> {result.medications}
          </div>
          <div>
            <TileIcon name="chat" size={10} /> {result.social}
          </div>
        </div>
        {result.omahaFlags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {result.omahaFlags.map((code) => (
              <span
                key={code}
                className="rounded-full bg-white/60 px-2 py-0.5 text-[9px] font-medium text-text-secondary"
              >
                {OMAHA_LABELS[code] || code}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-3 rounded-xl border border-copper/20 bg-copper/5 p-3">
      <p className="text-xs font-medium text-copper-dark">
        About your loved one — slide to reflect their current situation
      </p>

      {SLIDER_LABELS.map(({ key, low, high, question, icon }) => (
        <div key={key}>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
            <TileIcon name={icon} size={14} /> {question}
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={scores[key as keyof typeof scores]}
            onChange={(e) => setScores((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
            className="w-full accent-copper"
          />
          <div className="flex justify-between text-[10px] text-text-muted">
            <span>{low}</span>
            <span className="font-medium text-text-secondary">
              {scores[key as keyof typeof scores]}
            </span>
            <span>{high}</span>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full rounded-full bg-copper py-2 text-sm font-medium text-white hover:bg-copper-dark active:scale-95 transition-all"
      >
        See care assessment
      </button>
    </div>
  );
}
