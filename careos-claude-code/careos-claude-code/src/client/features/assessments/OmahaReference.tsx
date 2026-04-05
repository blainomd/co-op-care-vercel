/**
 * Omaha Reference Card — Maps Omaha System problems to Time Bank tasks
 *
 * Shows the 42 Omaha problems across 4 domains with their matching
 * Time Bank task types, KBS dimensions, and ICD-10 codes.
 * Used by Conductors and clinical staff to understand how every
 * care interaction maps to the Omaha clinical taxonomy.
 */
import { useState } from 'react';

type OmahaDomain = 'Environmental' | 'Psychosocial' | 'Physiological' | 'Health-Related Behaviors';
type DomainFilter = OmahaDomain | 'All';

interface OmahaReferenceEntry {
  code: number;
  name: string;
  domain: OmahaDomain;
  description: string;
  timeBankTasks: string[];
  kbsDimensions: { knowledge: string; behavior: string; status: string };
  icd10Codes: string[];
}

const DOMAIN_COLORS: Record<
  OmahaDomain,
  { bg: string; text: string; border: string; badge: string }
> = {
  Environmental: {
    bg: 'bg-sage/10',
    text: 'text-sage',
    border: 'border-sage/20',
    badge: 'bg-sage/15 text-sage',
  },
  Psychosocial: {
    bg: 'bg-copper/10',
    text: 'text-copper',
    border: 'border-copper/20',
    badge: 'bg-copper/15 text-copper',
  },
  Physiological: {
    bg: 'bg-zone-red/5',
    text: 'text-zone-red',
    border: 'border-zone-red/20',
    badge: 'bg-zone-red/10 text-zone-red',
  },
  'Health-Related Behaviors': {
    bg: 'bg-gold/10',
    text: 'text-gold',
    border: 'border-gold/20',
    badge: 'bg-gold/15 text-gold',
  },
};

const REFERENCE_DATA: OmahaReferenceEntry[] = [
  // --- Environmental ---
  {
    code: 3,
    name: 'Residence',
    domain: 'Environmental',
    description:
      'Housing stability, safety hazards, home modifications, and accessibility assessments.',
    timeBankTasks: ['Home safety assessment', 'Yard work', 'Minor home repairs'],
    kbsDimensions: {
      knowledge: 'Awareness of home hazards',
      behavior: 'Removes tripping hazards, uses grab bars',
      status: 'Home environment safety level',
    },
    icd10Codes: ['Z59.0', 'Z59.19'],
  },
  {
    code: 4,
    name: 'Neighborhood/Workplace Safety',
    domain: 'Environmental',
    description: 'Community safety, environmental risks, and access to safe outdoor spaces.',
    timeBankTasks: ['Neighborhood watch', 'Safety checks', 'Escort to appointments'],
    kbsDimensions: {
      knowledge: 'Awareness of neighborhood risks',
      behavior: 'Uses safety precautions outdoors',
      status: 'Perceived neighborhood safety',
    },
    icd10Codes: ['Z77.098', 'Z59.3'],
  },

  // --- Psychosocial ---
  {
    code: 5,
    name: 'Communication with Community Resources',
    domain: 'Psychosocial',
    description: 'Care coordination, transportation access, and connecting with services.',
    timeBankTasks: [
      'Rides',
      'Transportation coordination',
      'Tech support',
      'Errands',
      'Admin help',
    ],
    kbsDimensions: {
      knowledge: 'Knows available community resources',
      behavior: 'Actively accesses services',
      status: 'Level of resource utilization',
    },
    icd10Codes: ['Z75.4', 'Z75.3'],
  },
  {
    code: 6,
    name: 'Social Contact',
    domain: 'Psychosocial',
    description: 'Social isolation prevention through companionship and community connection.',
    timeBankTasks: ['Companionship visits', 'Phone companionship', 'Pet care', 'Group activities'],
    kbsDimensions: {
      knowledge: 'Understands importance of social connection',
      behavior: 'Engages in social activities',
      status: 'Frequency and quality of social contacts',
    },
    icd10Codes: ['Z60.2', 'Z60.4'],
  },
  {
    code: 7,
    name: 'Role Change',
    domain: 'Psychosocial',
    description: 'Caregiver identity transformation and adjusting to the Conductor role.',
    timeBankTasks: ['Caregiver support groups', 'Respite care coordination', 'Conductor mentoring'],
    kbsDimensions: {
      knowledge: 'Understands new caregiving role',
      behavior: 'Adapts to role responsibilities',
      status: 'Role adjustment and satisfaction',
    },
    icd10Codes: ['Z63.6', 'Z73.1'],
  },
  {
    code: 13,
    name: 'Caretaking/Parenting',
    domain: 'Psychosocial',
    description: 'Caregiver burden management and respite needs assessment.',
    timeBankTasks: ['Respite care', 'Caregiver relief visits', 'Overnight stays'],
    kbsDimensions: {
      knowledge: 'Recognizes signs of caregiver burnout',
      behavior: 'Accepts and uses respite services',
      status: 'Caregiver burden level',
    },
    icd10Codes: ['Z63.6', 'Z73.1'],
  },
  {
    code: 15,
    name: 'Abuse',
    domain: 'Psychosocial',
    description: 'Elder abuse screening and safety planning.',
    timeBankTasks: [
      'Safety screening',
      'Wellness check visits',
      'Protective intervention referrals',
    ],
    kbsDimensions: {
      knowledge: 'Knows signs of elder abuse',
      behavior: 'Reports concerns, follows safety plan',
      status: 'Safety and freedom from abuse',
    },
    icd10Codes: ['T74.11XA'],
  },

  // --- Physiological ---
  {
    code: 21,
    name: 'Cognition',
    domain: 'Physiological',
    description:
      'Cognitive function monitoring, dementia-related activities, and mental stimulation.',
    timeBankTasks: [
      'Cognitive stimulation activities',
      'Memory games',
      'Reading sessions',
      'Puzzles',
    ],
    kbsDimensions: {
      knowledge: 'Understands cognitive condition',
      behavior: 'Participates in cognitive activities',
      status: 'Cognitive function level (MMSE/MoCA)',
    },
    icd10Codes: ['F03.90', 'G30.9'],
  },
  {
    code: 25,
    name: 'Neuro-Musculo-Skeletal Function',
    domain: 'Physiological',
    description: 'Mobility support, fall prevention, and physical function maintenance.',
    timeBankTasks: [
      'Fall prevention exercises',
      'Tai chi sessions',
      'Walking companions',
      'Exercise programs',
    ],
    kbsDimensions: {
      knowledge: 'Understands fall risk factors',
      behavior: 'Performs balance exercises, uses assistive devices',
      status: 'Mobility level, fall frequency',
    },
    icd10Codes: ['M62.81', 'R26.2', 'W19.XXXA', 'Z87.39'],
  },
  {
    code: 27,
    name: 'Circulation',
    domain: 'Physiological',
    description: 'Cardiac health monitoring, blood pressure tracking, and exercise support.',
    timeBankTasks: ['Cardiac rehab support', 'Vitals monitoring', 'Exercise companions'],
    kbsDimensions: {
      knowledge: 'Understands cardiac condition and meds',
      behavior: 'Monitors vitals, follows exercise plan',
      status: 'Blood pressure, heart rate stability',
    },
    icd10Codes: ['I50.9', 'I10'],
  },
  {
    code: 28,
    name: 'Digestion-Hydration',
    domain: 'Physiological',
    description: 'Nutrition support, meal preparation, hydration monitoring.',
    timeBankTasks: ['Meal prep', 'Grocery runs', 'Nutrition support', 'Hydration reminders'],
    kbsDimensions: {
      knowledge: 'Understands dietary requirements',
      behavior: 'Follows meal plan, stays hydrated',
      status: 'Nutritional status, hydration level',
    },
    icd10Codes: ['E86.0', 'R63.0'],
  },
  {
    code: 30,
    name: 'Urinary Function',
    domain: 'Physiological',
    description: 'UTI prevention, hydration monitoring, and continence management.',
    timeBankTasks: ['Hydration monitoring', 'UTI prevention checks', 'Continence support'],
    kbsDimensions: {
      knowledge: 'Knows UTI signs and prevention',
      behavior: 'Maintains hydration, reports symptoms',
      status: 'Urinary function, infection frequency',
    },
    icd10Codes: ['N39.0'],
  },

  // --- Health-Related Behaviors ---
  {
    code: 35,
    name: 'Nutrition',
    domain: 'Health-Related Behaviors',
    description: 'Dietary management, dietitian coordination, and meal planning.',
    timeBankTasks: [
      'Dietitian counseling',
      'Meal planning',
      'Cooking classes',
      'Grocery shopping assistance',
    ],
    kbsDimensions: {
      knowledge: 'Understands nutritional needs',
      behavior: 'Follows dietary recommendations',
      status: 'Weight, BMI, lab values',
    },
    icd10Codes: ['E11.9', 'E78.5'],
  },
  {
    code: 36,
    name: 'Sleep and Rest Patterns',
    domain: 'Health-Related Behaviors',
    description: 'Sleep quality assessment, sleep hygiene education, and rest monitoring.',
    timeBankTasks: ['Sleep hygiene education', 'Evening routine support', 'Rest monitoring'],
    kbsDimensions: {
      knowledge: 'Understands sleep hygiene practices',
      behavior: 'Follows bedtime routine',
      status: 'Sleep quality and duration',
    },
    icd10Codes: ['G47.00'],
  },
  {
    code: 37,
    name: 'Physical Activity',
    domain: 'Health-Related Behaviors',
    description: 'Exercise programs, walking groups, and activity tracking.',
    timeBankTasks: [
      'Exercise programs',
      'Walking companions',
      'Yoga sessions',
      'Tai chi',
      'Aquatic therapy',
    ],
    kbsDimensions: {
      knowledge: 'Knows exercise benefits and limits',
      behavior: 'Engages in regular physical activity',
      status: 'Activity level, endurance, strength',
    },
    icd10Codes: ['Z72.3'],
  },
  {
    code: 42,
    name: 'Prescribed Medication Regimen',
    domain: 'Health-Related Behaviors',
    description: 'Medication adherence support, pill sorting, and pharmacy coordination.',
    timeBankTasks: [
      'Medication reminders',
      'Pill sorting',
      'Pharmacy pickup',
      'Med reconciliation support',
    ],
    kbsDimensions: {
      knowledge: 'Knows medications, doses, and purposes',
      behavior: 'Takes medications as prescribed',
      status: 'Adherence rate, side effect management',
    },
    icd10Codes: ['Z91.19'],
  },
];

const DOMAIN_FILTERS: DomainFilter[] = [
  'All',
  'Environmental',
  'Psychosocial',
  'Physiological',
  'Health-Related Behaviors',
];

/** Search icon */
function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/** Book/reference icon */
function BookIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

/** Link/chain icon for mappings */
function LinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

/** Clipboard/checklist icon */
function ClipboardIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

/** Activity/pulse icon */
function ActivityIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

/** Info circle icon */
function InfoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

/** Chevron down icon */
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function OmahaReference() {
  const [activeDomain, setActiveDomain] = useState<DomainFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [showExplainer, setShowExplainer] = useState(false);

  const filteredEntries = REFERENCE_DATA.filter((entry) => {
    const matchesDomain = activeDomain === 'All' || entry.domain === activeDomain;
    if (!matchesDomain) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      entry.name.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      entry.timeBankTasks.some((t) => t.toLowerCase().includes(q)) ||
      entry.icd10Codes.some((c) => c.toLowerCase().includes(q)) ||
      `#${entry.code}`.includes(q)
    );
  });

  const domainCounts: Record<OmahaDomain, number> = {
    Environmental: REFERENCE_DATA.filter((e) => e.domain === 'Environmental').length,
    Psychosocial: REFERENCE_DATA.filter((e) => e.domain === 'Psychosocial').length,
    Physiological: REFERENCE_DATA.filter((e) => e.domain === 'Physiological').length,
    'Health-Related Behaviors': REFERENCE_DATA.filter(
      (e) => e.domain === 'Health-Related Behaviors',
    ).length,
  };

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sage">
            <BookIcon />
          </span>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">
            Omaha System Reference
          </h1>
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          How every Time Bank task maps to the Omaha System clinical taxonomy.{' '}
          {REFERENCE_DATA.length} problems shown across 4 domains.
        </p>
      </div>

      {/* How We Use Omaha explainer */}
      <div className="mb-5">
        <button
          onClick={() => setShowExplainer(!showExplainer)}
          className="flex w-full items-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-left"
        >
          <span className="text-sage">
            <InfoIcon />
          </span>
          <span className="flex-1 text-sm font-medium text-text-primary">
            How We Use the Omaha System
          </span>
          <ChevronDownIcon
            className={`text-text-muted transition-transform duration-200 ${showExplainer ? 'rotate-180' : ''}`}
          />
        </button>

        {showExplainer && (
          <div className="mt-2 rounded-xl border border-border bg-white p-4">
            <div className="space-y-3 text-sm text-text-secondary">
              <p>
                The <strong className="text-text-primary">Omaha System</strong> is a standardized
                clinical taxonomy used in home care since 1975. It organizes all health-related
                concerns into 42 problems across 4 domains.
              </p>
              <div className="rounded-lg bg-sage/5 p-3">
                <p className="font-medium text-sage">Why This Matters for CareOS</p>
                <p className="mt-1 text-xs text-text-muted">
                  Every Time Bank task you complete is automatically coded to an Omaha problem. This
                  means informal care (companionship visits, meal prep, rides) generates the same
                  clinical documentation as formal home health. This data supports Letters of
                  Medical Necessity and HSA/FSA eligibility.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs font-medium text-text-primary">Auto-Coding</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    Complete a task, get an Omaha code. No manual documentation needed.
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs font-medium text-text-primary">KBS Tracking</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    Knowledge-Behavior-Status scores track outcomes at 30/60/90 days.
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs font-medium text-text-primary">ICD-10 Crosswalk</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    Each Omaha problem maps to ICD-10 codes for billing and clinical documentation.
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs font-medium text-text-primary">LMN Support</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    Aggregated Omaha data feeds Letters of Medical Necessity for HSA/FSA.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder="Search by problem, task type, or ICD-10 code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text-primary"
          >
            Clear
          </button>
        )}
      </div>

      {/* Domain filter tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {DOMAIN_FILTERS.map((domain) => {
          const isActive = activeDomain === domain;
          const count =
            domain === 'All' ? REFERENCE_DATA.length : domainCounts[domain as OmahaDomain];

          let colorClasses = 'bg-warm-gray/50 text-text-secondary';
          if (isActive && domain === 'All') {
            colorClasses = 'bg-sage text-white';
          } else if (isActive && domain !== 'All') {
            const colors = DOMAIN_COLORS[domain as OmahaDomain];
            colorClasses = `${colors.bg} ${colors.text} font-medium`;
          }

          return (
            <button
              key={domain}
              onClick={() => setActiveDomain(domain)}
              className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${colorClasses}`}
            >
              {domain === 'Health-Related Behaviors' ? 'Behaviors' : domain}
              <span className="ml-1 opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Problem cards */}
      <div className="space-y-3">
        {filteredEntries.map((entry) => {
          const colors = DOMAIN_COLORS[entry.domain];
          const isExpanded = expandedCard === entry.code;

          return (
            <div key={entry.code} className={`rounded-xl border ${colors.border} bg-white`}>
              {/* Summary row */}
              <button
                onClick={() => setExpandedCard(isExpanded ? null : entry.code)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                {/* Problem number badge */}
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${colors.badge}`}
                >
                  #{entry.code}
                </span>

                {/* Problem name + domain */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-text-primary">{entry.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-medium ${colors.text}`}>{entry.domain}</span>
                    <span className="text-[10px] text-text-muted">
                      {entry.timeBankTasks.length} task{entry.timeBankTasks.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Task preview chips */}
                <div className="hidden sm:flex items-center gap-1">
                  {entry.timeBankTasks.slice(0, 2).map((task) => (
                    <span
                      key={task}
                      className="rounded-full bg-warm-gray/40 px-2 py-0.5 text-[10px] text-text-muted"
                    >
                      {task}
                    </span>
                  ))}
                  {entry.timeBankTasks.length > 2 && (
                    <span className="text-[10px] text-text-muted">
                      +{entry.timeBankTasks.length - 2}
                    </span>
                  )}
                </div>

                <ChevronDownIcon
                  className={`shrink-0 text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
                  {/* Description */}
                  <p className="text-xs text-text-secondary">{entry.description}</p>

                  {/* Time Bank Tasks */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-sage">
                        <LinkIcon />
                      </span>
                      <span className="text-xs font-medium text-text-primary">Time Bank Tasks</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.timeBankTasks.map((task) => (
                        <span
                          key={task}
                          className={`rounded-lg px-2.5 py-1 text-xs ${colors.badge}`}
                        >
                          {task}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* KBS Dimensions */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-sage">
                        <ClipboardIcon />
                      </span>
                      <span className="text-xs font-medium text-text-primary">
                        KBS Dimensions Tracked
                      </span>
                    </div>
                    <div className="rounded-lg bg-warm-gray/20 p-3 space-y-2">
                      <div className="flex gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-sage/15 text-[10px] font-semibold text-sage">
                          K
                        </span>
                        <span className="text-xs text-text-secondary">
                          {entry.kbsDimensions.knowledge}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-copper/15 text-[10px] font-semibold text-copper">
                          B
                        </span>
                        <span className="text-xs text-text-secondary">
                          {entry.kbsDimensions.behavior}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gold/15 text-[10px] font-semibold text-gold">
                          S
                        </span>
                        <span className="text-xs text-text-secondary">
                          {entry.kbsDimensions.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ICD-10 Codes */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-sage">
                        <ActivityIcon />
                      </span>
                      <span className="text-xs font-medium text-text-primary">
                        Related ICD-10 Codes
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.icd10Codes.map((code) => (
                        <span
                          key={code}
                          className="rounded border border-border bg-warm-gray/20 px-2 py-0.5 font-mono text-[10px] text-text-muted"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredEntries.length === 0 && (
        <div className="rounded-xl border border-border bg-white p-8 text-center">
          <h3 className="text-sm font-medium text-text-primary">No matching problems</h3>
          <p className="mt-1 text-xs text-text-muted">
            Try adjusting your search or domain filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveDomain('All');
            }}
            className="mt-3 text-xs font-medium text-sage hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Footer note */}
      <div className="mt-6 rounded-xl bg-warm-gray/20 p-4">
        <p className="text-xs text-text-muted">
          The Omaha System is a standardized clinical taxonomy in the public domain since 1975.
          CareOS maps all 42 problems across 4 domains. This reference shows the{' '}
          {REFERENCE_DATA.length} problems most relevant to companion care and Time Bank tasks. Full
          taxonomy details at <span className="font-medium text-sage">omahasystem.org</span>.
        </p>
      </div>
    </div>
  );
}
