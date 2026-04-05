/**
 * MedicationTracker — Medication adherence tracking for care recipients
 *
 * Displays current medication list, weekly adherence grid, interaction alerts,
 * refill reminders, and worker-owner observation prompts.
 * Maps to Omaha System: #42 Prescribed Medication.
 * KBS subscales: Knowledge (med purpose), Behavior (taking as directed), Status (adherence %).
 */

import { useState } from 'react';

type AdherenceStatus = 'taken' | 'missed' | 'unknown';
type ObservationResponse = 'yes' | 'no' | 'unsure' | null;

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescriber: string;
  refillDate: string;
  daysUntilRefill: number;
  adherence: AdherenceStatus[];
}

interface InteractionAlert {
  medications: [string, string];
  severity: 'moderate' | 'high';
  message: string;
}

interface KBSRating {
  label: string;
  code: string;
  score: number;
  description: string;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MOCK_MEDICATIONS: Medication[] = [
  {
    id: 'lisinopril',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    prescriber: 'Dr. Patel',
    refillDate: '2026-03-22',
    daysUntilRefill: 14,
    adherence: ['taken', 'taken', 'taken', 'missed', 'taken', 'taken', 'taken'],
  },
  {
    id: 'metformin',
    name: 'Metformin',
    dosage: '500mg',
    frequency: '2x daily',
    prescriber: 'Dr. Patel',
    refillDate: '2026-03-18',
    daysUntilRefill: 10,
    adherence: ['taken', 'taken', 'missed', 'taken', 'taken', 'missed', 'taken'],
  },
  {
    id: 'amlodipine',
    name: 'Amlodipine',
    dosage: '5mg',
    frequency: 'Once daily',
    prescriber: 'Dr. Nguyen',
    refillDate: '2026-04-05',
    daysUntilRefill: 28,
    adherence: ['taken', 'taken', 'taken', 'taken', 'taken', 'taken', 'taken'],
  },
  {
    id: 'warfarin',
    name: 'Warfarin',
    dosage: '5mg',
    frequency: 'Once daily',
    prescriber: 'Dr. Nguyen',
    refillDate: '2026-03-15',
    daysUntilRefill: 7,
    adherence: ['taken', 'taken', 'taken', 'taken', 'missed', 'taken', 'unknown'],
  },
  {
    id: 'omeprazole',
    name: 'Omeprazole',
    dosage: '20mg',
    frequency: 'Once daily',
    prescriber: 'Dr. Kim',
    refillDate: '2026-03-29',
    daysUntilRefill: 21,
    adherence: ['taken', 'taken', 'taken', 'taken', 'taken', 'taken', 'taken'],
  },
];

const INTERACTION_ALERTS: InteractionAlert[] = [
  {
    medications: ['Warfarin', 'Omeprazole'],
    severity: 'moderate',
    message:
      'Warfarin + Omeprazole: monitor INR more frequently. Omeprazole may increase Warfarin levels.',
  },
  {
    medications: ['Lisinopril', 'Metformin'],
    severity: 'moderate',
    message:
      'Lisinopril + Metformin: monitor blood glucose and kidney function. ACE inhibitors may enhance hypoglycemic effect.',
  },
];

const KBS_RATINGS: KBSRating[] = [
  {
    label: 'Knowledge',
    code: 'K',
    score: 4,
    description: 'Can name most medications and their purposes',
  },
  {
    label: 'Behavior',
    code: 'B',
    score: 3,
    description: 'Usually takes medications as directed with occasional misses',
  },
  { label: 'Status', code: 'S', score: 4, description: 'Overall adherence at 87% this week' },
];

function calculateAdherenceScore(medications: Medication[]): number {
  let taken = 0;
  let total = 0;
  for (const med of medications) {
    for (const status of med.adherence) {
      if (status !== 'unknown') {
        total++;
        if (status === 'taken') taken++;
      }
    }
  }
  return total > 0 ? Math.round((taken / total) * 100) : 0;
}

export function MedicationTracker() {
  const [observations, setObservations] = useState<Record<string, ObservationResponse>>({});
  const [expandedMed, setExpandedMed] = useState<string | null>(null);

  const adherenceScore = calculateAdherenceScore(MOCK_MEDICATIONS);
  const previousWeekScore = 82;
  const scoreDelta = adherenceScore - previousWeekScore;

  const urgentRefills = MOCK_MEDICATIONS.filter((m) => m.daysUntilRefill <= 14).sort(
    (a, b) => a.daysUntilRefill - b.daysUntilRefill,
  );

  function handleObservation(medId: string, response: ObservationResponse) {
    setObservations((prev) => ({ ...prev, [medId]: response }));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Medication Tracker</h1>
        <p className="text-sm text-muted">Prescribed medication adherence for Helen Park</p>
      </div>

      {/* Adherence Score */}
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-primary">Weekly Adherence Score</h3>
            <p className="text-xs text-muted">Based on 7-day medication tracking</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-2xl font-bold text-sage">{adherenceScore}%</p>
              <p className="text-[10px] text-muted">this week</p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                scoreDelta >= 0 ? 'bg-sage/10 text-sage' : 'bg-zone-red/10 text-zone-red'
              }`}
            >
              {scoreDelta >= 0 ? (
                <span className="inline-flex items-center gap-0.5">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                  +{scoreDelta}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  {scoreDelta}%
                </span>
              )}
            </span>
          </div>
        </div>
        <p className="mt-2 text-xs text-secondary">
          Medication adherence is a key predictive feature for hospitalization risk. Score &lt;80%
          triggers a care plan review with Medical Director.
        </p>
      </div>

      {/* Interaction Alerts */}
      {INTERACTION_ALERTS.length > 0 && (
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-gold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <p className="text-sm font-medium text-gold">
              {INTERACTION_ALERTS.length} Medication Interaction
              {INTERACTION_ALERTS.length > 1 ? 's' : ''} Flagged
            </p>
          </div>
          <div className="mt-2 space-y-2">
            {INTERACTION_ALERTS.map((alert, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-secondary">
                <svg
                  className="mt-0.5 h-3 w-3 flex-shrink-0 text-gold"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="4" />
                </svg>
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Adherence Grid */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h3 className="text-sm font-semibold text-primary">Weekly Adherence Grid</h3>
        <p className="mt-0.5 text-xs text-muted">March 2 -- March 8, 2026</p>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="pb-2 pr-3 text-left font-medium text-muted">Medication</th>
                {DAYS_OF_WEEK.map((day) => (
                  <th key={day} className="pb-2 text-center font-medium text-muted w-10">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_MEDICATIONS.map((med) => (
                <tr key={med.id} className="border-t border-border/50">
                  <td className="py-2 pr-3">
                    <button
                      className="text-left text-sm font-medium text-primary hover:text-copper transition-colors"
                      onClick={() => setExpandedMed(expandedMed === med.id ? null : med.id)}
                    >
                      {med.name}
                    </button>
                    <span className="ml-1 text-[10px] text-muted">{med.dosage}</span>
                  </td>
                  {med.adherence.map((status, dayIndex) => (
                    <td key={dayIndex} className="py-2 text-center">
                      {status === 'taken' ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sage/15">
                          <svg
                            className="h-3.5 w-3.5 text-sage"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      ) : status === 'missed' ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zone-red/15">
                          <svg
                            className="h-3.5 w-3.5 text-zone-red"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </span>
                      ) : (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                          <svg
                            className="h-3.5 w-3.5 text-muted"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01"
                            />
                          </svg>
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center gap-4 text-[10px] text-muted">
          <span className="flex items-center gap-1">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-sage/15">
              <svg
                className="h-2.5 w-2.5 text-sage"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            Taken
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zone-red/15">
              <svg
                className="h-2.5 w-2.5 text-zone-red"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
            Missed
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-2.5 w-2.5 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01"
                />
              </svg>
            </span>
            Unknown
          </span>
        </div>
      </div>

      {/* Expanded Medication Detail */}
      {expandedMed &&
        (() => {
          const med = MOCK_MEDICATIONS.find((m) => m.id === expandedMed);
          if (!med) return null;
          return (
            <div className="rounded-xl border border-copper/30 bg-copper/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
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
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                  <h4 className="text-sm font-semibold text-primary">
                    {med.name} {med.dosage}
                  </h4>
                </div>
                <button
                  onClick={() => setExpandedMed(null)}
                  className="text-muted hover:text-primary transition-colors"
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
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted">Frequency:</span>
                  <span className="ml-1 text-secondary">{med.frequency}</span>
                </div>
                <div>
                  <span className="text-muted">Prescriber:</span>
                  <span className="ml-1 text-secondary">{med.prescriber}</span>
                </div>
                <div>
                  <span className="text-muted">Next refill:</span>
                  <span className="ml-1 text-secondary">
                    {new Date(med.refillDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted">Days remaining:</span>
                  <span
                    className={`ml-1 font-medium ${med.daysUntilRefill <= 7 ? 'text-zone-red' : 'text-secondary'}`}
                  >
                    {med.daysUntilRefill} days
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Refill Reminders */}
      {urgentRefills.length > 0 && (
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center gap-2">
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
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
            <h3 className="text-sm font-semibold text-primary">Upcoming Refills</h3>
          </div>
          <div className="mt-3 space-y-2">
            {urgentRefills.map((med) => (
              <div
                key={med.id}
                className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-primary">
                    {med.name} {med.dosage}
                  </p>
                  <p className="text-[10px] text-muted">
                    {med.prescriber} -- refill by {new Date(med.refillDate).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    med.daysUntilRefill <= 7
                      ? 'bg-zone-red/10 text-zone-red'
                      : 'bg-gold/10 text-gold'
                  }`}
                >
                  {med.daysUntilRefill} day{med.daysUntilRefill !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Worker-Owner Observation Prompts */}
      <div className="rounded-xl border border-border bg-white p-4">
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
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
            />
          </svg>
          <h3 className="text-sm font-semibold text-primary">Visit Observation</h3>
        </div>
        <p className="mt-1 text-xs text-muted">Record what you observed during today's visit</p>

        <div className="mt-3 space-y-3">
          {MOCK_MEDICATIONS.slice(0, 3).map((med) => (
            <div key={med.id} className="rounded-lg border border-border/50 p-3">
              <p className="text-sm text-secondary">
                Did Helen take her{' '}
                <span className="font-medium text-primary">
                  {med.name} {med.dosage}
                </span>{' '}
                ({med.frequency.toLowerCase()})?
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleObservation(med.id, 'yes')}
                  className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
                    observations[med.id] === 'yes'
                      ? 'bg-sage text-white'
                      : 'border border-sage/30 text-sage hover:bg-sage/10'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleObservation(med.id, 'no')}
                  className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
                    observations[med.id] === 'no'
                      ? 'bg-zone-red text-white'
                      : 'border border-zone-red/30 text-zone-red hover:bg-zone-red/10'
                  }`}
                >
                  No
                </button>
                <button
                  onClick={() => handleObservation(med.id, 'unsure')}
                  className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
                    observations[med.id] === 'unsure'
                      ? 'bg-gray-500 text-white'
                      : 'border border-gray-300 text-muted hover:bg-gray-100'
                  }`}
                >
                  Unsure
                </button>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(observations).length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-sage">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {Object.keys(observations).length} observation
            {Object.keys(observations).length !== 1 ? 's' : ''} recorded
          </div>
        )}
      </div>

      {/* Medication List */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h3 className="text-sm font-semibold text-primary">Current Medications</h3>
        <p className="mt-0.5 text-xs text-muted">5 active prescriptions</p>

        <div className="mt-3 space-y-2">
          {MOCK_MEDICATIONS.map((med) => {
            const medAdherence = med.adherence.filter((s) => s !== 'unknown');
            const medTaken = medAdherence.filter((s) => s === 'taken').length;
            const medPercent =
              medAdherence.length > 0 ? Math.round((medTaken / medAdherence.length) * 100) : 0;

            return (
              <div
                key={med.id}
                className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage/10">
                    <svg
                      className="h-4 w-4 text-sage"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {med.name} <span className="text-muted">{med.dosage}</span>
                    </p>
                    <p className="text-[10px] text-muted">
                      {med.frequency} -- {med.prescriber}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    medPercent === 100
                      ? 'text-sage'
                      : medPercent >= 80
                        ? 'text-gold'
                        : 'text-zone-red'
                  }`}
                >
                  {medPercent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* KBS Omaha Mapping */}
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-primary">Omaha System Assessment</h3>
            <p className="text-xs text-muted">#42 Prescribed Medication -- KBS Rating</p>
          </div>
          <span className="rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-medium text-sage">
            Physiological Domain
          </span>
        </div>

        <div className="mt-3 space-y-3">
          {KBS_RATINGS.map((rating) => (
            <div key={rating.code}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-primary">
                  {rating.label} ({rating.code})
                </span>
                <span className="text-xs font-semibold text-copper">{rating.score}/5</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-copper/70 transition-all"
                  style={{ width: `${(rating.score / 5) * 100}%` }}
                />
              </div>
              <p className="mt-0.5 text-[10px] text-muted">{rating.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="text-[11px] text-muted">
        Medication data is reported by worker-owners during visits and self-reported by care
        recipients. Adherence trends inform the Predictive Risk Score and are synced to Aidbox as
        FHIR MedicationStatement resources. Omaha: #42 Prescribed Medication, Physiological Domain.
      </p>
    </div>
  );
}
