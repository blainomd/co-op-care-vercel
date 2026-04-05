/**
 * Incident Report — HIPAA-compliant fall and safety event documentation
 *
 * Workers document falls, injuries, near-misses, and safety concerns
 * during care visits. Auto-maps to Omaha System problem codes.
 * Reports route to Medical Director Josh Emdur for review within 24 hours.
 */
import { useState } from 'react';

type IncidentType = 'fall' | 'medication' | 'behavioral' | 'environmental' | 'near_miss';
type Severity = 'minor' | 'moderate' | 'severe' | 'critical';

interface IncidentTypeOption {
  value: IncidentType;
  label: string;
  description: string;
  icon: string;
  colorClass: string;
  selectedColorClass: string;
  omahaCode: number;
  omahaName: string;
}

const INCIDENT_TYPES: IncidentTypeOption[] = [
  {
    value: 'fall',
    label: 'Fall',
    description: 'With or without injury',
    icon: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6',
    colorClass: 'text-zone-red',
    selectedColorClass: 'bg-zone-red/10 border-zone-red text-zone-red',
    omahaCode: 25,
    omahaName: 'Neuro-musculo-skeletal Function',
  },
  {
    value: 'medication',
    label: 'Medication Error',
    description: 'Missed, wrong dose, or reaction',
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    colorClass: 'text-gold',
    selectedColorClass: 'bg-gold/10 border-gold text-gold',
    omahaCode: 42,
    omahaName: 'Prescribed Medication Regimen',
  },
  {
    value: 'behavioral',
    label: 'Behavioral Concern',
    description: 'Agitation, confusion, wandering',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    colorClass: 'text-copper',
    selectedColorClass: 'bg-copper/10 border-copper text-copper',
    omahaCode: 21,
    omahaName: 'Cognition',
  },
  {
    value: 'environmental',
    label: 'Environmental Hazard',
    description: 'Unsafe condition in the home',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    colorClass: 'text-blue-500',
    selectedColorClass: 'bg-blue-500/10 border-blue-500 text-blue-500',
    omahaCode: 3,
    omahaName: 'Residence',
  },
  {
    value: 'near_miss',
    label: 'Near Miss',
    description: 'Incident avoided, risk identified',
    icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    colorClass: 'text-text-secondary',
    selectedColorClass: 'bg-warm-gray border-border text-text-primary',
    omahaCode: 4,
    omahaName: 'Neighborhood/Workplace Safety',
  },
];

const CARE_RECIPIENTS = ['Dorothy Henderson', 'Margaret Chen', 'Robert Kim'];

const LOCATIONS = [
  'Home - Living Room',
  'Home - Bathroom',
  'Home - Kitchen',
  'Home - Bedroom',
  'Outside',
  'Other',
];

const SEVERITIES: Array<{
  value: Severity;
  label: string;
  description: string;
  colorClass: string;
}> = [
  {
    value: 'minor',
    label: 'Minor',
    description: 'No injury',
    colorClass: 'bg-zone-green/10 text-zone-green border-zone-green',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Minor injury/bruise',
    colorClass: 'bg-zone-yellow/10 text-zone-yellow border-zone-yellow',
  },
  {
    value: 'severe',
    label: 'Severe',
    description: 'Medical attention needed',
    colorClass: 'bg-orange-500/10 text-orange-500 border-orange-500',
  },
  {
    value: 'critical',
    label: 'Critical',
    description: 'ER/hospitalization',
    colorClass: 'bg-zone-red/10 text-zone-red border-zone-red',
  },
];

const IMMEDIATE_ACTIONS = [
  'First aid administered',
  'Family notified',
  'Medical director notified',
  '911 called',
  'Photos taken',
];

const CONTRIBUTING_FACTORS = [
  'Wet floor',
  'Poor lighting',
  'Medication side effect',
  'Fatigue',
  'Equipment failure',
  'Cognitive decline',
  'Other',
];

interface RecentReport {
  id: string;
  date: string;
  type: string;
  careRecipient: string;
  severity: Severity;
  status: 'Reviewed' | 'Pending' | 'Resolved';
  description: string;
}

const RECENT_REPORTS: RecentReport[] = [
  {
    id: 'IR-2026-047',
    date: '2026-03-05',
    type: 'Fall',
    careRecipient: 'Dorothy Henderson',
    severity: 'moderate',
    status: 'Reviewed',
    description:
      'Slipped on bathroom rug while transitioning from shower. Minor bruising on right hip. Ice applied, family notified. Recommended non-slip mat replacement.',
  },
  {
    id: 'IR-2026-044',
    date: '2026-02-28',
    type: 'Environmental Hazard',
    careRecipient: 'Margaret Chen',
    severity: 'minor',
    status: 'Resolved',
    description:
      'Loose handrail on back porch steps identified during arrival. Reported to family. Repaired by maintenance on 3/1.',
  },
  {
    id: 'IR-2026-041',
    date: '2026-02-22',
    type: 'Medication Error',
    careRecipient: 'Robert Kim',
    severity: 'moderate',
    status: 'Pending',
    description:
      'Evening medications found still in pill organizer from previous day. Family confirmed dose was missed. Medical director notified for follow-up.',
  },
];

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function severityBadgeClass(severity: Severity): string {
  switch (severity) {
    case 'minor':
      return 'bg-zone-green/10 text-zone-green';
    case 'moderate':
      return 'bg-zone-yellow/10 text-zone-yellow';
    case 'severe':
      return 'bg-orange-500/10 text-orange-500';
    case 'critical':
      return 'bg-zone-red/10 text-zone-red';
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'Reviewed':
      return 'bg-sage/10 text-sage';
    case 'Pending':
      return 'bg-zone-yellow/10 text-zone-yellow';
    case 'Resolved':
      return 'bg-zone-green/10 text-zone-green';
    default:
      return 'bg-warm-gray text-text-muted';
  }
}

export function IncidentReport() {
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [dateTime, setDateTime] = useState(formatDateForInput(new Date()));
  const [careRecipient, setCareRecipient] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [description, setDescription] = useState('');
  const [immediateActions, setImmediateActions] = useState<string[]>([]);
  const [contributingFactors, setContributingFactors] = useState<string[]>([]);
  const [followUps, setFollowUps] = useState({
    medicalDirectorReview: true,
    familyNotification: false,
    carePlanUpdate: false,
    environmentalModification: false,
  });
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selectedTypeInfo = INCIDENT_TYPES.find((t) => t.value === selectedType);

  function toggleAction(action: string) {
    setImmediateActions((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action],
    );
  }

  function toggleFactor(factor: string) {
    setContributingFactors((prev) =>
      prev.includes(factor) ? prev.filter((f) => f !== factor) : [...prev, factor],
    );
  }

  function handleSubmit() {
    if (!selectedType || !careRecipient || !location || !severity || !description.trim()) return;
    setSubmitted(true);
    // API call will be wired in later
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
            <svg
              className="h-8 w-8 text-sage"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="font-heading text-2xl font-semibold text-text-primary">
            Incident Report Submitted
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {selectedTypeInfo?.label} report for {careRecipient} has been recorded.
          </p>
          <div className="mt-4 rounded-lg bg-sage/5 p-3 text-sm text-sage">
            Report will be reviewed by Medical Director Josh Emdur within 24 hours.
          </div>
          {severity === 'critical' && (
            <div className="mt-3 rounded-lg bg-zone-red/10 p-3 text-sm text-zone-red">
              Critical incident flagged — immediate notification sent to Medical Director and care
              coordinator.
            </div>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => {
                setSubmitted(false);
                setSelectedType(null);
                setDateTime(formatDateForInput(new Date()));
                setCareRecipient('');
                setLocation('');
                setSeverity(null);
                setDescription('');
                setImmediateActions([]);
                setContributingFactors([]);
                setFollowUps({
                  medicalDirectorReview: true,
                  familyNotification: false,
                  carePlanUpdate: false,
                  environmentalModification: false,
                });
              }}
              className="rounded-lg bg-sage px-6 py-2.5 text-sm font-medium text-white hover:bg-sage-dark"
            >
              File Another Report
            </button>
            <a
              href="#/worker"
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-secondary hover:bg-warm-gray"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">Incident Report</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Document safety events during care visits.
        </p>
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-zone-red/10 p-3">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-zone-red"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm font-medium text-zone-red">
            For medical emergencies, call 911 immediately.
          </p>
        </div>
      </div>

      {/* Incident Type Selection */}
      <div className="mb-6 rounded-xl border border-border bg-white p-4">
        <label className="mb-3 block text-sm font-medium text-text-primary">
          1. Type of Incident
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {INCIDENT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`flex items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
                selectedType === type.value
                  ? type.selectedColorClass
                  : 'border-border bg-white text-text-secondary hover:bg-warm-gray'
              }`}
            >
              <svg
                className={`mt-0.5 h-5 w-5 shrink-0 ${selectedType === type.value ? '' : type.colorClass}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={type.icon} />
              </svg>
              <div>
                <span className="block text-sm font-medium">{type.label}</span>
                <span
                  className={`block text-xs ${selectedType === type.value ? 'opacity-75' : 'text-text-muted'}`}
                >
                  {type.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Incident Details Form */}
      <div className="mb-6 rounded-xl border border-border bg-white p-4">
        <label className="mb-3 block text-sm font-medium text-text-primary">
          2. Incident Details
        </label>
        <div className="space-y-4">
          {/* Date/Time */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">
              Date &amp; Time of Incident
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            />
          </div>

          {/* Care Recipient */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">Care Recipient</label>
            <select
              value={careRecipient}
              onChange={(e) => setCareRecipient(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            >
              <option value="">Select care recipient...</option>
              {CARE_RECIPIENTS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            >
              <option value="">Select location...</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">Severity</label>
            <div className="grid grid-cols-2 gap-2">
              {SEVERITIES.map((sev) => (
                <button
                  key={sev.value}
                  onClick={() => setSeverity(sev.value)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
                    severity === sev.value
                      ? sev.colorClass
                      : 'border-border bg-white text-text-secondary hover:bg-warm-gray'
                  }`}
                >
                  <span className="block">{sev.label}</span>
                  <span
                    className={`block text-[10px] ${severity === sev.value ? 'opacity-75' : 'text-text-muted'}`}
                  >
                    {sev.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, including any relevant circumstances leading up to the incident..."
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              rows={4}
            />
            <p
              className={`mt-1 text-[10px] ${description.length >= 50 ? 'text-sage' : 'text-text-muted'}`}
            >
              {description.length}/50 characters minimum suggested
            </p>
          </div>

          {/* Immediate Actions Taken */}
          <div>
            <label className="mb-2 block text-xs font-medium text-text-muted">
              Immediate Actions Taken
            </label>
            <div className="space-y-2">
              {IMMEDIATE_ACTIONS.map((action) => (
                <label key={action} className="flex items-center gap-2 text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={immediateActions.includes(action)}
                    onChange={() => toggleAction(action)}
                    className="h-4 w-4 rounded border-border text-sage focus:ring-sage"
                  />
                  {action}
                </label>
              ))}
            </div>
          </div>

          {/* Contributing Factors */}
          <div>
            <label className="mb-2 block text-xs font-medium text-text-muted">
              Contributing Factors
            </label>
            <div className="flex flex-wrap gap-2">
              {CONTRIBUTING_FACTORS.map((factor) => (
                <button
                  key={factor}
                  onClick={() => toggleFactor(factor)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    contributingFactors.includes(factor)
                      ? 'bg-sage text-white'
                      : 'bg-warm-gray text-text-secondary hover:bg-border'
                  }`}
                >
                  {factor}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Omaha Problem Mapping */}
      {selectedTypeInfo && (
        <div className="mb-6 rounded-xl border border-border bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-text-primary">
            3. Omaha Problem Mapping
          </label>
          <p className="mb-3 text-xs text-text-muted">
            Auto-suggested based on incident type. Used for clinical documentation and FHIR sync.
          </p>
          <div className="rounded-lg bg-warm-gray/50 p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sage/10 text-xs font-bold text-sage">
                #{selectedTypeInfo.omahaCode}
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {selectedTypeInfo.omahaName}
                </p>
                <p className="text-[10px] text-text-muted">
                  {selectedTypeInfo.omahaCode <= 4
                    ? 'Environmental Domain'
                    : selectedTypeInfo.omahaCode <= 16
                      ? 'Psychosocial Domain'
                      : selectedTypeInfo.omahaCode <= 34
                        ? 'Physiological Domain'
                        : 'Health-Related Behaviors Domain'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Required */}
      <div className="mb-6 rounded-xl border border-border bg-white p-4">
        <label className="mb-3 block text-sm font-medium text-text-primary">
          4. Follow-up Required
        </label>
        <div className="space-y-3">
          {[
            {
              key: 'medicalDirectorReview' as const,
              label: 'Medical Director review',
              sublabel: 'Josh Emdur, DO',
            },
            {
              key: 'familyNotification' as const,
              label: 'Family notification',
              sublabel: 'Conductor will be alerted',
            },
            {
              key: 'carePlanUpdate' as const,
              label: 'Care plan update needed',
              sublabel: 'Triggers care plan review',
            },
            {
              key: 'environmentalModification' as const,
              label: 'Environmental modification needed',
              sublabel: 'Home safety assessment',
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-primary">{item.label}</p>
                <p className="text-[10px] text-text-muted">{item.sublabel}</p>
              </div>
              <button
                onClick={() => setFollowUps((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  followUps[item.key] ? 'bg-sage' : 'bg-border'
                }`}
                role="switch"
                aria-checked={followUps[item.key]}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    followUps[item.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="mb-6 rounded-xl border border-border bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-medium text-text-primary">Recent Reports</label>
          <span className="text-xs text-text-muted">{RECENT_REPORTS.length} reports</span>
        </div>
        <div className="space-y-2">
          {RECENT_REPORTS.map((report) => (
            <div key={report.id} className="rounded-lg border border-border p-3">
              <button
                onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{report.type}</p>
                    <p className="text-xs text-text-muted">
                      {report.careRecipient} &middot;{' '}
                      {new Date(report.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${severityBadgeClass(report.severity)}`}
                  >
                    {report.severity}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadgeClass(report.status)}`}
                  >
                    {report.status}
                  </span>
                  <svg
                    className={`h-4 w-4 text-text-muted transition-transform ${expandedReport === report.id ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {expandedReport === report.id && (
                <div className="mt-2 border-t border-border pt-2">
                  <p className="text-xs text-text-secondary">{report.description}</p>
                  <p className="mt-1 text-[10px] text-text-muted">Report ID: {report.id}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={
            !selectedType || !careRecipient || !location || !severity || !description.trim()
          }
          className="w-full rounded-lg bg-sage px-8 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Submit Report
        </button>
        <p className="text-[10px] text-text-muted">
          Report will be reviewed by Medical Director Josh Emdur within 24 hours.
        </p>
      </div>
    </div>
  );
}
