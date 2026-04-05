/**
 * SocialPrescribing — Social prescribing dashboard
 *
 * Maps Omaha System problems to community resources (Time Bank, wellness
 * providers, local services). "Non-medical prescriptions" based on clinical
 * assessment — connects Dorothy Henderson's care plan to real community
 * interventions with KBS outcome tracking.
 */
import { useState } from 'react';

type ResourceSource = 'timebank' | 'wellness' | 'medical';
type PrescriptionStatus = 'active' | 'pending' | 'completed';
type OmahaDomain = 'Environmental' | 'Psychosocial' | 'Physiological' | 'Health Behaviors';

interface Prescription {
  id: string;
  omahaCode: number;
  omahaName: string;
  description: string;
  source: ResourceSource;
  providerName: string;
  frequency: string;
  status: PrescriptionStatus;
  kbsImprovement?: number;
  lmnEligible?: boolean;
  hsaBillable?: boolean;
}

interface CommunityResource {
  id: string;
  name: string;
  source: ResourceSource;
  description: string;
  omahaProblems: number[];
  domain: OmahaDomain;
}

interface CompletedPrescription {
  id: string;
  omahaCode: number;
  omahaName: string;
  description: string;
  source: ResourceSource;
  providerName: string;
  kbsBefore: number;
  kbsAfter: number;
  completedDate: string;
  outcome: string;
}

const SOURCE_LABELS: Record<ResourceSource, string> = {
  timebank: 'Time Bank',
  wellness: 'Wellness Provider',
  medical: 'Telehealth / Medical',
};

const SOURCE_COLORS: Record<ResourceSource, string> = {
  timebank: 'text-gold',
  wellness: 'text-copper',
  medical: 'text-sage',
};

const STATUS_STYLES: Record<PrescriptionStatus, string> = {
  active: 'bg-sage/10 text-zone-green',
  pending: 'bg-gold/10 text-zone-yellow',
  completed: 'bg-warm-gray text-text-muted',
};

const ACTIVE_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-001',
    omahaCode: 6,
    omahaName: 'Social Contact',
    description: 'Weekly companionship visits',
    source: 'timebank',
    providerName: 'Janet R. (Time Bank Neighbor)',
    frequency: '2x/week',
    status: 'active',
    kbsImprovement: 1.2,
  },
  {
    id: 'rx-002',
    omahaCode: 37,
    omahaName: 'Physical Activity',
    description: 'Chair yoga with Maria',
    source: 'wellness',
    providerName: 'Mountain Wellness',
    frequency: '1x/week',
    status: 'active',
    lmnEligible: true,
    hsaBillable: true,
  },
  {
    id: 'rx-003',
    omahaCode: 28,
    omahaName: 'Digestion-Hydration',
    description: 'Meal prep service',
    source: 'timebank',
    providerName: 'David K. (Time Bank Neighbor)',
    frequency: '3x/week',
    status: 'active',
  },
  {
    id: 'rx-004',
    omahaCode: 36,
    omahaName: 'Sleep/Rest',
    description: 'Sleep hygiene coaching',
    source: 'medical',
    providerName: 'Dr. Emdur (Telehealth)',
    frequency: 'Monthly check-in',
    status: 'pending',
  },
];

const COMMUNITY_RESOURCES: CommunityResource[] = [
  {
    id: 'cr-01',
    name: 'Boulder Senior Center — Art Classes',
    source: 'wellness',
    description: 'Weekly watercolor and pottery sessions for seniors',
    omahaProblems: [6, 21],
    domain: 'Psychosocial',
  },
  {
    id: 'cr-02',
    name: 'Time Bank — Grocery Delivery',
    source: 'timebank',
    description: 'Neighbor-sourced grocery shopping and delivery',
    omahaProblems: [28],
    domain: 'Physiological',
  },
  {
    id: 'cr-03',
    name: 'Mountain Wellness — Aqua Therapy',
    source: 'wellness',
    description: 'Low-impact pool exercises for mobility',
    omahaProblems: [25, 37],
    domain: 'Physiological',
  },
  {
    id: 'cr-04',
    name: 'Time Bank — Home Safety Check',
    source: 'timebank',
    description: 'Volunteer home assessment for fall hazards',
    omahaProblems: [3],
    domain: 'Environmental',
  },
  {
    id: 'cr-05',
    name: 'Boulder Food Rescue — Meal Kits',
    source: 'wellness',
    description: 'Nutritious prepared meal kits delivered weekly',
    omahaProblems: [28, 31],
    domain: 'Physiological',
  },
  {
    id: 'cr-06',
    name: 'Time Bank — Tech Help',
    source: 'timebank',
    description: 'Neighbor tech support for video calls and devices',
    omahaProblems: [5],
    domain: 'Environmental',
  },
  {
    id: 'cr-07',
    name: 'NAMI Boulder — Caregiver Support',
    source: 'wellness',
    description: 'Support group for caregivers and families',
    omahaProblems: [10, 6],
    domain: 'Psychosocial',
  },
  {
    id: 'cr-08',
    name: 'Meditation App Subscription',
    source: 'medical',
    description: 'Guided mindfulness for sleep and anxiety',
    omahaProblems: [36, 10],
    domain: 'Health Behaviors',
  },
  {
    id: 'cr-09',
    name: 'Time Bank — Garden Maintenance',
    source: 'timebank',
    description: 'Neighbor yard work and outdoor space upkeep',
    omahaProblems: [3],
    domain: 'Environmental',
  },
  {
    id: 'cr-10',
    name: 'Silver Sneakers — Chair Fitness',
    source: 'wellness',
    description: 'Insurance-covered seated exercise program',
    omahaProblems: [37, 25],
    domain: 'Health Behaviors',
  },
];

const COMPLETED_PRESCRIPTIONS: CompletedPrescription[] = [
  {
    id: 'rx-h01',
    omahaCode: 5,
    omahaName: 'Communication w/ Community Resources',
    description: 'Tech setup for video calls with family',
    source: 'timebank',
    providerName: 'Mike L. (Time Bank)',
    kbsBefore: 2.1,
    kbsAfter: 3.8,
    completedDate: '2026-01-15',
    outcome: 'Dorothy now independently uses FaceTime with grandchildren 3x/week',
  },
  {
    id: 'rx-h02',
    omahaCode: 3,
    omahaName: 'Residence',
    description: 'Fall-proofing home assessment and modifications',
    source: 'timebank',
    providerName: 'Tom W. (Time Bank)',
    kbsBefore: 2.4,
    kbsAfter: 4.1,
    completedDate: '2025-11-20',
    outcome: 'Grab bars installed, throw rugs removed, night lights added. Zero falls since.',
  },
  {
    id: 'rx-h03',
    omahaCode: 10,
    omahaName: 'Mental Health',
    description: 'Grief counseling referral (loss of spouse)',
    source: 'medical',
    providerName: 'Dr. Sarah Kim (Telehealth)',
    kbsBefore: 1.8,
    kbsAfter: 3.2,
    completedDate: '2026-02-01',
    outcome: '8-session telehealth course completed. PHQ-9 improved from 14 to 6.',
  },
];

const DOMAIN_COLORS: Record<OmahaDomain, string> = {
  Environmental: 'text-sage',
  Psychosocial: 'text-copper',
  Physiological: 'text-zone-red',
  'Health Behaviors': 'text-gold',
};

function SourceIcon({
  source,
  className = 'h-4 w-4',
}: {
  source: ResourceSource;
  className?: string;
}) {
  const color = SOURCE_COLORS[source];
  switch (source) {
    case 'timebank':
      return (
        <svg
          className={`${className} ${color}`}
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
      );
    case 'wellness':
      return (
        <svg
          className={`${className} ${color}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      );
    case 'medical':
      return (
        <svg
          className={`${className} ${color}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 14.5M14.25 3.104c.251.023.501.05.75.082M19.8 14.5a2.25 2.25 0 010 3l-4.5 4.5a2.25 2.25 0 01-3 0l-4.5-4.5a2.25 2.25 0 010-3"
          />
        </svg>
      );
  }
}

export function SocialPrescribing() {
  const [domainFilter, setDomainFilter] = useState<OmahaDomain | 'all'>('all');
  const [formProblem, setFormProblem] = useState('');
  const [formResourceType, setFormResourceType] = useState<ResourceSource>('timebank');
  const [formProvider, setFormProvider] = useState('');
  const [formFrequency, setFormFrequency] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const domains: OmahaDomain[] = [
    'Environmental',
    'Psychosocial',
    'Physiological',
    'Health Behaviors',
  ];

  const filteredResources =
    domainFilter === 'all'
      ? COMMUNITY_RESOURCES
      : COMMUNITY_RESOURCES.filter((r) => r.domain === domainFilter);

  const totalKbsImprovement = ACTIVE_PRESCRIPTIONS.reduce(
    (sum, p) => sum + (p.kbsImprovement ?? 0),
    0,
  );
  const avgKbs =
    ACTIVE_PRESCRIPTIONS.length > 0
      ? totalKbsImprovement / ACTIVE_PRESCRIPTIONS.filter((p) => p.kbsImprovement).length || 0
      : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          Social Prescriptions
        </h1>
        <p className="mt-0.5 text-sm text-text-secondary">Dorothy Henderson</p>
        <p className="text-xs text-text-muted">
          Community-based interventions mapped from Omaha System assessment
        </p>
      </div>

      {/* Active Prescriptions */}
      <div>
        <h2 className="font-heading mb-3 text-lg font-semibold text-text-primary">
          Active Prescriptions
        </h2>
        <div className="space-y-3">
          {ACTIVE_PRESCRIPTIONS.map((rx) => (
            <div key={rx.id} className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-start gap-3">
                {/* Omaha code badge */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sage/10 text-xs font-bold text-sage">
                  #{rx.omahaCode}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Problem name and status */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-text-primary">{rx.omahaName}</h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[rx.status]}`}
                    >
                      {rx.status}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mt-0.5 text-sm text-text-secondary">{rx.description}</p>

                  {/* Provider and frequency */}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <SourceIcon source={rx.source} className="h-3.5 w-3.5" />
                      <span className={SOURCE_COLORS[rx.source]}>{rx.providerName}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="h-3.5 w-3.5 text-text-muted"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                        />
                      </svg>
                      {rx.frequency}
                    </span>
                  </div>

                  {/* Tags row: KBS improvement, LMN, HSA */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {rx.kbsImprovement != null && (
                      <span className="inline-flex items-center gap-1 rounded bg-sage/10 px-1.5 py-0.5 text-[10px] font-bold text-zone-green">
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                          />
                        </svg>
                        KBS +{rx.kbsImprovement.toFixed(1)}
                      </span>
                    )}
                    {rx.lmnEligible && (
                      <span className="rounded bg-copper/10 px-1.5 py-0.5 text-[10px] font-bold text-copper">
                        LMN-eligible
                      </span>
                    )}
                    {rx.hsaBillable && (
                      <span className="rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-bold text-gold">
                        HSA billable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Resources by Problem */}
      <div>
        <h2 className="font-heading mb-3 text-lg font-semibold text-text-primary">
          Available Resources by Problem
        </h2>

        {/* Domain filter tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setDomainFilter('all')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              domainFilter === 'all'
                ? 'bg-sage text-white'
                : 'border border-border bg-white text-text-secondary hover:bg-warm-gray'
            }`}
          >
            All Domains
          </button>
          {domains.map((d) => (
            <button
              key={d}
              onClick={() => setDomainFilter(d)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                domainFilter === d
                  ? 'bg-sage text-white'
                  : 'border border-border bg-white text-text-secondary hover:bg-warm-gray'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Resource list */}
        <div className="space-y-2">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <SourceIcon source={resource.source} className="h-4 w-4" />
                    <h4 className="text-sm font-semibold text-text-primary">{resource.name}</h4>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">{resource.description}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`text-[10px] font-medium ${DOMAIN_COLORS[resource.domain]}`}>
                      {resource.domain}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      Omaha #{resource.omahaProblems.join(', #')}
                    </span>
                  </div>
                </div>
                <button className="shrink-0 rounded-lg bg-sage px-3 py-1.5 text-xs font-medium text-white hover:bg-sage/90">
                  Prescribe
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impact Dashboard */}
      <div>
        <h2 className="font-heading mb-3 text-lg font-semibold text-text-primary">
          Impact Dashboard
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Active prescriptions */}
          <div className="rounded-xl border border-border bg-white p-4 text-center">
            <div className="text-2xl font-bold text-sage">4</div>
            <div className="mt-1 text-[11px] text-text-muted">Active Prescriptions</div>
          </div>
          {/* Avg KBS improvement */}
          <div className="rounded-xl border border-border bg-white p-4 text-center">
            <div className="text-2xl font-bold text-zone-green">+{avgKbs.toFixed(1)}</div>
            <div className="mt-1 text-[11px] text-text-muted">Avg KBS Improvement</div>
          </div>
          {/* Hours of community care */}
          <div className="rounded-xl border border-border bg-white p-4 text-center">
            <div className="text-2xl font-bold text-gold">18</div>
            <div className="mt-1 text-[11px] text-text-muted">Community Hrs/Month</div>
          </div>
          {/* Cost avoidance */}
          <div className="rounded-xl border border-border bg-white p-4 text-center">
            <div className="text-2xl font-bold text-copper">$2,340</div>
            <div className="mt-1 text-[11px] text-text-muted">Saved vs Professional/Mo</div>
          </div>
        </div>
      </div>

      {/* New Prescription Form */}
      <div>
        <h2 className="font-heading mb-3 text-lg font-semibold text-text-primary">
          New Prescription
        </h2>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="space-y-4">
            {/* Omaha problem */}
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                Omaha Problem
              </label>
              <select
                value={formProblem}
                onChange={(e) => setFormProblem(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              >
                <option value="">Select a problem...</option>
                <option value="6">06 — Social Contact</option>
                <option value="28">28 — Digestion-Hydration</option>
                <option value="37">37 — Physical Activity</option>
                <option value="36">36 — Sleep/Rest</option>
                <option value="25">25 — Neuro-musculo-skeletal Function</option>
                <option value="10">10 — Mental Health</option>
                <option value="5">05 — Communication w/ Community Resources</option>
                <option value="3">03 — Residence</option>
                <option value="21">21 — Cognition</option>
                <option value="42">42 — Medication Regimen</option>
              </select>
            </div>

            {/* Resource type */}
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                Resource Type
              </label>
              <div className="flex gap-2">
                {(['timebank', 'wellness', 'medical'] as ResourceSource[]).map((src) => (
                  <button
                    key={src}
                    onClick={() => setFormResourceType(src)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      formResourceType === src
                        ? 'border-sage bg-sage/10 text-sage'
                        : 'border-border bg-white text-text-secondary hover:bg-warm-gray'
                    }`}
                  >
                    <SourceIcon source={src} className="h-3.5 w-3.5" />
                    {SOURCE_LABELS[src]}
                  </button>
                ))}
              </div>
            </div>

            {/* Specific provider */}
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Provider</label>
              <input
                type="text"
                value={formProvider}
                onChange={(e) => setFormProvider(e.target.value)}
                placeholder="e.g. Janet R., Mountain Wellness, Dr. Emdur"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                Frequency
              </label>
              <select
                value={formFrequency}
                onChange={(e) => setFormFrequency(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              >
                <option value="">Select frequency...</option>
                <option value="daily">Daily</option>
                <option value="3x/week">3x/week</option>
                <option value="2x/week">2x/week</option>
                <option value="1x/week">1x/week</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
                <option value="as-needed">As needed</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Notes</label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
                placeholder="Additional context for this prescription..."
                className="w-full resize-none rounded-lg border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>

            {/* Submit */}
            <button className="w-full rounded-lg bg-sage px-4 py-2.5 text-sm font-semibold text-white hover:bg-sage/90">
              Create Prescription
            </button>
          </div>
        </div>
      </div>

      {/* Prescription History */}
      <div>
        <h2 className="font-heading mb-3 text-lg font-semibold text-text-primary">
          Prescription History
        </h2>
        <div className="space-y-3">
          {COMPLETED_PRESCRIPTIONS.map((rx) => (
            <div key={rx.id} className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-start gap-3">
                {/* Omaha code badge */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warm-gray text-xs font-bold text-text-muted">
                  #{rx.omahaCode}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-text-primary">{rx.omahaName}</h3>
                    <span className="shrink-0 rounded-full bg-warm-gray px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                      Completed
                    </span>
                  </div>

                  <p className="mt-0.5 text-sm text-text-secondary">{rx.description}</p>

                  {/* Provider and date */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <SourceIcon source={rx.source} className="h-3.5 w-3.5" />
                      <span className={SOURCE_COLORS[rx.source]}>{rx.providerName}</span>
                    </span>
                    <span>Completed {rx.completedDate}</span>
                  </div>

                  {/* KBS before/after */}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded bg-warm-gray px-2 py-1 text-[11px]">
                      <span className="font-medium text-text-muted">KBS Before:</span>
                      <span className="font-bold text-zone-red">{rx.kbsBefore.toFixed(1)}</span>
                    </div>
                    <svg
                      className="h-3 w-3 text-zone-green"
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
                    <div className="flex items-center gap-1.5 rounded bg-sage/10 px-2 py-1 text-[11px]">
                      <span className="font-medium text-text-muted">KBS After:</span>
                      <span className="font-bold text-zone-green">{rx.kbsAfter.toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] font-bold text-zone-green">
                      +{(rx.kbsAfter - rx.kbsBefore).toFixed(1)}
                    </span>
                  </div>

                  {/* Outcome */}
                  <div className="mt-2 rounded-lg bg-sage/5 px-3 py-2">
                    <p className="text-[11px] font-medium text-sage">Outcome</p>
                    <p className="mt-0.5 text-xs text-text-secondary">{rx.outcome}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-text-muted">
        Social prescriptions mapped from Omaha System assessment. KBS = Knowledge / Behavior /
        Status (Omaha Outcome Scale, 1-5 each).
      </p>
    </div>
  );
}
