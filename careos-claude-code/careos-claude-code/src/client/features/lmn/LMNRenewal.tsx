/**
 * LMNRenewal — Telehealth scheduling flow for Letter of Medical Necessity renewal
 *
 * Automated 12-month renewal cycle with notifications at 60/30/7 days.
 * Auto-schedules telehealth with Dr. Emdur via Zoom for CRI reassessment,
 * ICD-10 code review, and Omaha KBS rating updates.
 * Renewed LMN re-activates HSA/FSA eligibility. Target: >90% renewal rate.
 */
import { useState } from 'react';

interface QualifyingCondition {
  code: string;
  description: string;
}

interface CoveredService {
  label: string;
  frequency: string;
}

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
}

type RenewalPhase = 'reminder_60' | 'reminder_30' | 'reminder_7' | 'expired';

const MOCK_CONDITIONS: QualifyingCondition[] = [
  { code: 'F03.90', description: 'Unspecified dementia' },
  { code: 'R26.89', description: 'Other abnormalities of gait and mobility' },
  { code: 'Z74.1', description: 'Need for assistance with personal care' },
  { code: 'R41.840', description: 'Attention and concentration deficit' },
];

const MOCK_SERVICES: CoveredService[] = [
  { label: 'In-home companion care', frequency: '3-5 days/week, 2-4 hrs' },
  { label: 'Cognitive support & supervision', frequency: 'Daily during visits' },
  { label: 'Fall prevention & mobility assistance', frequency: 'Each visit' },
  { label: 'Personal care & hygiene assistance', frequency: 'As needed' },
  { label: 'Care coordination with PCP', frequency: 'Monthly' },
];

const MOCK_SLOTS: TimeSlot[] = [
  { id: 'ts1', date: 'Mon, Mar 16', time: '9:00 AM', available: true },
  { id: 'ts2', date: 'Tue, Mar 17', time: '11:30 AM', available: true },
  { id: 'ts3', date: 'Wed, Mar 18', time: '2:00 PM', available: true },
  { id: 'ts4', date: 'Thu, Mar 19', time: '10:00 AM', available: true },
  { id: 'ts5', date: 'Fri, Mar 20', time: '3:30 PM', available: true },
];

const INITIAL_CHECKLIST: ChecklistItem[] = [
  {
    id: 'c1',
    label: 'Current medications list',
    description: 'Include dosages, frequencies, and any recent changes',
    checked: false,
  },
  {
    id: 'c2',
    label: 'Recent symptoms or changes',
    description: 'New falls, behavioral changes, sleep disruptions, appetite shifts',
    checked: false,
  },
  {
    id: 'c3',
    label: 'Care plan updates',
    description: 'Changes in service hours, new services needed, caregiver feedback',
    checked: false,
  },
  {
    id: 'c4',
    label: 'Functional status notes',
    description: 'ADL changes, mobility improvements or declines since last assessment',
    checked: false,
  },
  {
    id: 'c5',
    label: 'Insurance & HSA/FSA details',
    description: 'Current plan info for eligibility verification',
    checked: false,
  },
];

const TIMELINE_PHASES: Array<{
  phase: RenewalPhase;
  label: string;
  days: string;
  description: string;
}> = [
  {
    phase: 'reminder_60',
    label: '60-Day Reminder',
    days: '60 days',
    description: 'Email + in-app notification. Begin scheduling window.',
  },
  {
    phase: 'reminder_30',
    label: '30-Day Reminder',
    days: '30 days',
    description: 'SMS + push notification. Auto-suggest available telehealth slots.',
  },
  {
    phase: 'reminder_7',
    label: '7-Day Urgent',
    days: '7 days',
    description: 'Urgent notification. Direct scheduling link. Conductor alerted.',
  },
  {
    phase: 'expired',
    label: 'Expiry',
    days: '0 days',
    description: 'LMN expires. HSA/FSA eligibility suspended until renewal.',
  },
];

export function LMNRenewal() {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [scheduling, setScheduling] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  const daysRemaining = 38;
  const expiryDate = 'April 15, 2026';
  const careRecipientName = 'Eleanor Davis';
  const currentPhase = 'reminder_30' as RenewalPhase;

  function toggleChecklistItem(id: string) {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  }

  function handleSchedule() {
    if (!selectedSlot) return;
    setScheduling(true);
    // API call: POST /lmn/renewal/schedule { slotId, careRecipientId }
    setTimeout(() => {
      setScheduling(false);
      setScheduled(true);
    }, 1500);
  }

  const completedChecklist = checklist.filter((c) => c.checked).length;
  const selectedSlotData = MOCK_SLOTS.find((s) => s.id === selectedSlot);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      {/* Back link */}
      <a
        href="#/lmn"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-secondary"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to LMN List
      </a>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">LMN Renewal</h1>
        <p className="text-sm text-muted">
          {careRecipientName} — 12-month Letter of Medical Necessity renewal
        </p>
      </div>

      {/* Current LMN Status Card */}
      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage/10">
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
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-primary">Current LMN Status</h2>
              <p className="text-xs text-muted">Active — renewal required before expiry</p>
            </div>
          </div>
          <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
            {daysRemaining} days left
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg bg-warm-gray/50 p-3">
            <p className="text-[11px] text-muted">Expiry Date</p>
            <p className="text-sm font-semibold text-primary">{expiryDate}</p>
          </div>
          <div className="rounded-lg bg-warm-gray/50 p-3">
            <p className="text-[11px] text-muted">Days Remaining</p>
            <p
              className={`text-sm font-semibold ${daysRemaining <= 7 ? 'text-zone-red' : daysRemaining <= 30 ? 'text-gold' : 'text-primary'}`}
            >
              {daysRemaining} days
            </p>
          </div>
          <div className="rounded-lg bg-warm-gray/50 p-3">
            <p className="text-[11px] text-muted">Renewal Cycle</p>
            <p className="text-sm font-semibold text-primary">12 months</p>
          </div>
          <div className="rounded-lg bg-warm-gray/50 p-3">
            <p className="text-[11px] text-muted">Renewal Rate</p>
            <p className="text-sm font-semibold text-sage">Target &gt;90%</p>
          </div>
        </div>

        {/* Qualifying Conditions */}
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-primary">Qualifying Conditions (ICD-10)</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {MOCK_CONDITIONS.map((condition) => (
              <span
                key={condition.code}
                className="rounded-full border border-border bg-warm-gray/30 px-2.5 py-1 text-[11px] text-secondary"
                title={condition.description}
              >
                <span className="font-semibold text-primary">{condition.code}</span>
                <span className="mx-1 text-muted">|</span>
                {condition.description}
              </span>
            ))}
          </div>
        </div>

        {/* Covered Services */}
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-primary">Covered Services</h3>
          <div className="mt-2 space-y-1.5">
            {MOCK_SERVICES.map((service) => (
              <div key={service.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-3.5 w-3.5 text-sage"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-secondary">{service.label}</span>
                </div>
                <span className="text-muted">{service.frequency}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tax Savings at Risk */}
      <div className="rounded-xl border-2 border-gold/30 bg-gold/5 p-4">
        <div className="flex items-center gap-3">
          <svg
            className="h-6 w-6 text-gold"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-gold">
              $6,200/year in HSA/FSA savings at risk
            </p>
            <p className="text-xs text-secondary">
              Without a renewed LMN, care services lose HSA/FSA eligibility. Renewing preserves your
              28-36% tax savings on all qualifying care expenses.
            </p>
          </div>
        </div>
      </div>

      {/* Renewal Timeline */}
      <div className="rounded-xl border border-border bg-white p-5">
        <h2 className="text-sm font-semibold text-primary">Renewal Timeline</h2>
        <p className="text-xs text-muted">
          Automated notifications guide you through the renewal window
        </p>

        <div className="mt-4 space-y-0">
          {TIMELINE_PHASES.map((step, i) => {
            const isActive = step.phase === currentPhase;
            const isPast =
              (currentPhase === 'reminder_30' && step.phase === 'reminder_60') ||
              (currentPhase === 'reminder_7' &&
                (step.phase === 'reminder_60' || step.phase === 'reminder_30')) ||
              (currentPhase === 'expired' && step.phase !== 'expired');
            const isFuture = !isActive && !isPast;

            return (
              <div key={step.phase} className="flex gap-3">
                {/* Vertical connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                      isActive
                        ? 'border-gold bg-gold text-white'
                        : isPast
                          ? 'border-sage bg-sage text-white'
                          : 'border-border bg-warm-gray/50 text-muted'
                    }`}
                  >
                    {isPast ? (
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    ) : (
                      <span className="text-[10px] font-bold">{i + 1}</span>
                    )}
                  </div>
                  {i < TIMELINE_PHASES.length - 1 && (
                    <div className={`h-10 w-0.5 ${isPast ? 'bg-sage/40' : 'bg-border'}`} />
                  )}
                </div>

                {/* Content */}
                <div className={`pb-4 ${i === TIMELINE_PHASES.length - 1 ? 'pb-0' : ''}`}>
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-semibold ${isActive ? 'text-gold' : isPast ? 'text-sage' : 'text-muted'}`}
                    >
                      {step.label}
                    </p>
                    {isActive && (
                      <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-medium text-white">
                        Current
                      </span>
                    )}
                    {step.phase === 'expired' && (
                      <span className="rounded-full bg-zone-red/10 px-2 py-0.5 text-[10px] font-medium text-zone-red">
                        HSA suspended
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${isFuture ? 'text-muted' : 'text-secondary'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Renewal Telehealth */}
      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage/10">
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
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-primary">Schedule Renewal Telehealth</h2>
            <p className="text-xs text-muted">
              30-minute video visit to reassess care needs and renew your LMN
            </p>
          </div>
        </div>

        {/* Provider Details */}
        <div className="mt-4 rounded-lg border border-border bg-warm-gray/30 p-3">
          <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
            <div>
              <p className="text-muted">Provider</p>
              <p className="font-semibold text-primary">Dr. Mark Emdur, MD</p>
            </div>
            <div>
              <p className="text-muted">Duration</p>
              <p className="font-semibold text-primary">30 minutes</p>
            </div>
            <div>
              <p className="text-muted">Platform</p>
              <p className="font-semibold text-primary">Zoom (via CareOS)</p>
            </div>
            <div>
              <p className="text-muted">Cost</p>
              <p className="font-semibold text-sage">Included in membership</p>
            </div>
          </div>
        </div>

        {/* What to Expect */}
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-primary">What to Expect</h3>
          <div className="mt-2 space-y-2">
            {[
              {
                icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z',
                label: 'CRI Reassessment',
                desc: 'Updated Care Readiness Index scoring across all 14 factors',
              },
              {
                icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
                label: 'Condition Review',
                desc: 'Evaluate current qualifying conditions and symptom progression',
              },
              {
                icon: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5',
                label: 'ICD-10 Code Update',
                desc: 'Add, remove, or revise diagnosis codes to reflect current status',
              },
              {
                icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
                label: 'Omaha KBS Update',
                desc: 'Knowledge, Behavior, and Status ratings updated across identified problems',
              },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2.5">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-copper"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <div>
                  <p className="text-xs font-medium text-primary">{item.label}</p>
                  <p className="text-[11px] text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        {!scheduled ? (
          <div className="mt-5">
            <h3 className="text-xs font-semibold text-primary">Available Time Slots</h3>
            <p className="text-[11px] text-muted">
              Select a time for your renewal telehealth visit
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {MOCK_SLOTS.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    selectedSlot === slot.id
                      ? 'border-sage bg-sage/5'
                      : 'border-border bg-white hover:bg-warm-gray/30'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      selectedSlot === slot.id ? 'bg-sage text-white' : 'bg-warm-gray/50 text-muted'
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
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
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${selectedSlot === slot.id ? 'text-sage' : 'text-primary'}`}
                    >
                      {slot.date}
                    </p>
                    <p className="text-xs text-muted">{slot.time} MST</p>
                  </div>
                  {selectedSlot === slot.id && (
                    <svg
                      className="ml-auto h-5 w-5 text-sage"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleSchedule}
              disabled={!selectedSlot || scheduling}
              className="mt-4 w-full rounded-lg bg-sage py-3 text-sm font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-50"
            >
              {scheduling
                ? 'Scheduling...'
                : selectedSlot
                  ? `Schedule for ${selectedSlotData?.date} at ${selectedSlotData?.time}`
                  : 'Select a time slot to continue'}
            </button>
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-sage/30 bg-sage/5 p-4">
            <div className="flex items-center gap-3">
              <svg
                className="h-6 w-6 text-sage"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-sage">Telehealth Scheduled</p>
                <p className="text-xs text-secondary">
                  {selectedSlotData?.date} at {selectedSlotData?.time} MST with Dr. Mark Emdur, MD
                  via Zoom
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <a
                href="#/calendar"
                className="rounded-lg bg-sage px-4 py-2 text-xs font-medium text-white hover:bg-sage-dark"
              >
                View in Calendar
              </a>
              <button
                onClick={() => {
                  setScheduled(false);
                  setSelectedSlot(null);
                }}
                className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-secondary hover:bg-warm-gray/20"
              >
                Reschedule
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Renewal Preparation Checklist */}
      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-primary">Renewal Preparation Checklist</h2>
            <p className="text-xs text-muted">Gather these items before your telehealth visit</p>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              completedChecklist === checklist.length
                ? 'bg-sage/10 text-sage'
                : 'bg-warm-gray/30 text-muted'
            }`}
          >
            {completedChecklist}/{checklist.length}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {checklist.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleChecklistItem(item.id)}
              className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                item.checked
                  ? 'border-sage/30 bg-sage/5'
                  : 'border-border bg-white hover:bg-warm-gray/20'
              }`}
            >
              <div
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                  item.checked ? 'border-sage bg-sage' : 'border-border'
                }`}
              >
                {item.checked && (
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>
              <div>
                <p
                  className={`text-xs font-medium ${item.checked ? 'text-sage line-through' : 'text-primary'}`}
                >
                  {item.label}
                </p>
                <p className="text-[11px] text-muted">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* How Renewal Works */}
      <div className="rounded-xl border border-border bg-white p-5">
        <h3 className="text-sm font-semibold text-primary">How LMN Renewal Works</h3>
        <div className="mt-3 space-y-1.5 text-xs text-secondary">
          <p>
            1. CareOS automatically tracks your LMN expiry date and sends reminders at 60, 30, and 7
            days.
          </p>
          <p>2. A 30-minute telehealth visit with Dr. Mark Emdur, MD is auto-scheduled via Zoom.</p>
          <p>3. During the visit, your CRI is reassessed and Omaha KBS ratings are updated.</p>
          <p>
            4. All ICD-10 diagnosis codes are reviewed and updated to reflect current conditions.
          </p>
          <p>
            5. The renewed LMN is signed electronically and re-activates HSA/FSA eligibility
            immediately.
          </p>
        </div>
      </div>

      <p className="text-[11px] text-muted">
        Renewal notifications are sent at 60, 30, and 7 days before expiry via email, SMS, and
        in-app push. LMN renewal is included in your co-op.care membership. No additional cost.
      </p>
    </div>
  );
}
