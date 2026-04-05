/**
 * DischargeConcierge — Hospital discharge → home care handoff
 *
 * BCH integration: When a patient is discharged, this screen assembles
 * the care team within 24-48 hours using ICD-10 → Omaha problem mapping.
 */
import { useState } from 'react';

type DischargeStep = 'intake' | 'mapping' | 'team_assembly' | 'confirmed';

interface DischargeRecord {
  patientName: string;
  dischargeDate: string;
  hospital: string;
  icdCodes: { code: string; description: string }[];
  omahaMappings: { problem: string; number: number; interventions: string[] }[];
  assignedWorkers: { name: string; role: string; eta: string }[];
}

const MOCK_DISCHARGE: DischargeRecord = {
  patientName: 'Helen Park',
  dischargeDate: '2026-03-08',
  hospital: 'Boulder Community Health',
  icdCodes: [
    { code: 'I50.9', description: 'Heart failure, unspecified' },
    { code: 'Z87.39', description: 'Personal history of falls' },
    { code: 'E11.9', description: 'Type 2 diabetes without complications' },
  ],
  omahaMappings: [
    {
      problem: 'Circulation',
      number: 28,
      interventions: ['Vital sign monitoring', 'Medication management', 'Activity modification'],
    },
    {
      problem: 'Neuro-musculo-skeletal function',
      number: 29,
      interventions: [
        'Fall prevention assessment',
        'Safe transfers training',
        'Home safety evaluation',
      ],
    },
    {
      problem: 'Nutrition',
      number: 31,
      interventions: ['Diabetic meal planning', 'Blood sugar monitoring', 'Dietitian referral'],
    },
  ],
  assignedWorkers: [
    {
      name: 'James Park',
      role: 'Primary Worker-Owner (Certified: Safe Transfers, Emergency Response)',
      eta: '24 hours',
    },
    { name: 'Linda Chen', role: 'Time Bank — Grocery Shopping & Meal Prep', eta: '48 hours' },
    {
      name: 'Dr. Sarah Kim',
      role: 'Medical Director — Cardiology oversight',
      eta: 'Telehealth scheduled',
    },
  ],
};

export function DischargeConcierge() {
  const [step, setStep] = useState<DischargeStep>('intake');
  const discharge = MOCK_DISCHARGE;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Discharge Concierge</h1>
        <p className="text-sm text-muted">Hospital-to-home care transition</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {(['intake', 'mapping', 'team_assembly', 'confirmed'] as const).map((s, i) => {
          const labels = ['Intake', 'Clinical Mapping', 'Team Assembly', 'Confirmed'];
          const stepIndex = ['intake', 'mapping', 'team_assembly', 'confirmed'].indexOf(step);
          const isCurrent = s === step;
          const isDone = i < stepIndex;
          return (
            <div key={s} className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  isDone
                    ? 'bg-sage text-white'
                    : isCurrent
                      ? 'bg-sage/20 text-sage ring-2 ring-sage'
                      : 'bg-warm-gray/20 text-muted'
                }`}
              >
                {isDone ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <p
                className={`mt-1 text-[10px] ${isCurrent ? 'font-semibold text-sage' : 'text-muted'}`}
              >
                {labels[i]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Step 1: Intake */}
      {step === 'intake' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-sm font-semibold text-primary">Discharge Summary</h2>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Patient</span>
                <span className="font-medium text-primary">{discharge.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Hospital</span>
                <span className="font-medium text-primary">{discharge.hospital}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Discharge Date</span>
                <span className="font-medium text-primary">
                  {new Date(discharge.dischargeDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-sm font-semibold text-primary">Diagnosis Codes (ICD-10)</h2>
            <div className="mt-3 space-y-2">
              {discharge.icdCodes.map((icd) => (
                <div
                  key={icd.code}
                  className="flex items-start gap-3 rounded-lg border border-zone-red/10 bg-zone-red/5 p-2"
                >
                  <span className="shrink-0 rounded bg-zone-red/10 px-1.5 py-0.5 text-[11px] font-mono font-bold text-zone-red">
                    {icd.code}
                  </span>
                  <span className="text-xs text-secondary">{icd.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-sage/20 bg-sage/5 p-4">
            <h3 className="text-sm font-semibold text-sage">What Happens Next</h3>
            <p className="mt-1 text-xs text-secondary">
              CareOS will map these diagnoses to Omaha System problems and automatically identify
              the right certifications and services needed. A care team will be assembled within
              24-48 hours.
            </p>
          </div>

          <button
            onClick={() => setStep('mapping')}
            className="w-full rounded-lg bg-sage px-4 py-2.5 text-sm font-medium text-white hover:bg-sage-dark"
          >
            Begin Clinical Mapping
          </button>
        </div>
      )}

      {/* Step 2: Clinical Mapping */}
      {step === 'mapping' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-sm font-semibold text-primary">ICD-10 → Omaha Problem Mapping</h2>
            <p className="mt-1 text-xs text-muted">
              Each diagnosis maps to specific Omaha System problems with targeted interventions
            </p>
          </div>

          {discharge.icdCodes.map((icd, idx) => {
            const mapping = discharge.omahaMappings[idx]!;
            return (
              <div key={icd.code} className="rounded-xl border border-border bg-white p-4">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-zone-red/10 px-1.5 py-0.5 text-[11px] font-mono font-bold text-zone-red">
                    {icd.code}
                  </span>
                  <svg
                    className="h-4 w-4 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                  <span className="rounded bg-sage/10 px-1.5 py-0.5 text-[11px] font-bold text-sage">
                    #{mapping.number} {mapping.problem}
                  </span>
                </div>
                <p className="mt-2 text-xs text-secondary">{icd.description}</p>
                <div className="mt-2">
                  <p className="text-[11px] font-medium text-primary">Interventions:</p>
                  <ul className="mt-1 space-y-1">
                    {mapping.interventions.map((intervention) => (
                      <li
                        key={intervention}
                        className="flex items-center gap-2 text-xs text-secondary"
                      >
                        <svg
                          className="h-3 w-3 shrink-0 text-sage"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {intervention}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}

          <div className="flex gap-3">
            <button
              onClick={() => setStep('intake')}
              className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-secondary hover:bg-warm-gray/20"
            >
              Back
            </button>
            <button
              onClick={() => setStep('team_assembly')}
              className="flex-1 rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-dark"
            >
              Assemble Care Team
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Team Assembly */}
      {step === 'team_assembly' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-sage/20 bg-sage/5 p-4">
            <h2 className="text-sm font-semibold text-sage">Care Team Assembled</h2>
            <p className="mt-1 text-xs text-secondary">
              Based on {discharge.patientName}'s discharge diagnoses and care needs, the following
              team has been matched.
            </p>
          </div>

          {discharge.assignedWorkers.map((worker, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-border bg-white p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/10 text-sm font-bold text-sage">
                {worker.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-primary">{worker.name}</p>
                <p className="text-xs text-secondary">{worker.role}</p>
                <div className="mt-1 flex items-center gap-2">
                  <svg
                    className="h-3.5 w-3.5 text-gold"
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
                  <span className="text-[11px] text-gold">{worker.eta}</span>
                </div>
              </div>
              <span className="rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-medium text-sage">
                Confirmed
              </span>
            </div>
          ))}

          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="text-sm font-semibold text-primary">Timeline</h3>
            <div className="mt-3 space-y-3">
              {[
                {
                  time: 'Day 1',
                  action: 'Primary worker-owner arrival, home safety assessment',
                  done: false,
                },
                {
                  time: 'Day 1-2',
                  action: 'Medication reconciliation with Medical Director',
                  done: false,
                },
                {
                  time: 'Day 2',
                  action: 'Time Bank volunteer for grocery shopping & meal prep',
                  done: false,
                },
                {
                  time: 'Week 1',
                  action: 'CRI assessment to establish care baseline',
                  done: false,
                },
                { time: 'Week 2', action: 'Follow-up telehealth with cardiology', done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-sage/40" />
                  <div>
                    <p className="text-xs font-medium text-primary">{item.time}</p>
                    <p className="text-[11px] text-secondary">{item.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('mapping')}
              className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-secondary hover:bg-warm-gray/20"
            >
              Back
            </button>
            <button
              onClick={() => setStep('confirmed')}
              className="flex-1 rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-dark"
            >
              Confirm & Activate Care Plan
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmed */}
      {step === 'confirmed' && (
        <div className="space-y-4">
          <div className="rounded-xl border-2 border-sage bg-sage/5 p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-sage"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z"
              />
            </svg>
            <h2 className="mt-3 text-xl font-bold text-sage">Care Plan Activated!</h2>
            <p className="mt-1 text-sm text-secondary">
              {discharge.patientName}'s care team has been notified and will begin within 24 hours
            </p>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="text-sm font-semibold text-primary">Summary</h3>
            <div className="mt-2 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Patient</span>
                <span className="font-medium text-primary">{discharge.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Discharged From</span>
                <span className="font-medium text-primary">{discharge.hospital}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Diagnoses Mapped</span>
                <span className="font-medium text-primary">
                  {discharge.icdCodes.length} ICD-10 → {discharge.omahaMappings.length} Omaha
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Team Members</span>
                <span className="font-medium text-primary">
                  {discharge.assignedWorkers.length} assigned
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">First Visit</span>
                <span className="font-medium text-sage">Within 24 hours</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href="#/conductor"
              className="flex-1 rounded-lg border border-border px-4 py-2 text-center text-sm font-medium text-secondary hover:bg-warm-gray/20"
            >
              Back to Dashboard
            </a>
            <a
              href="#/conductor/schedule"
              className="flex-1 rounded-lg bg-sage px-4 py-2 text-center text-sm font-medium text-white hover:bg-sage-dark"
            >
              View Schedule
            </a>
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted">
        Discharge integration powered by Epic ADT feed. ICD-10 → Omaha mapping is automated with
        clinical review.
      </p>
    </div>
  );
}
