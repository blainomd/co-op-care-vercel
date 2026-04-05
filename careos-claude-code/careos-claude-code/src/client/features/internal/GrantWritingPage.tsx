/**
 * GrantWritingPage — Interactive grant writing workspace
 *
 * Private page at /#/grants/write — shows full grant narratives with
 * section-by-section content, readiness scores, and improvement suggestions.
 */
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { useState } from 'react';
import { Reveal, Expandable } from '../../components/Reveal';

function ReadinessBar({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span
        className={`text-xs font-bold ${score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'}`}
      >
        {score}%
      </span>
    </div>
  );
}

function SectionCard({
  title,
  status,
  content,
  improvements,
  copyText,
}: {
  title: string;
  status: 'complete' | 'needs-work' | 'blocked';
  content: string;
  improvements?: string[];
  copyText?: string;
}) {
  const [copied, setCopied] = useState(false);
  const statusConfig = {
    complete: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Ready' },
    'needs-work': { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Needs Work' },
    blocked: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Blocked' },
  };
  const s = statusConfig[status];

  const handleCopy = () => {
    navigator.clipboard.writeText(copyText || content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-[#1B2A4A] text-sm">{title}</h4>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${s.color}`}>
            {s.label}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-[#0D7377] hover:underline flex items-center gap-1"
        >
          {copied ? 'Copied!' : 'Copy'}
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
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{content}</p>
      {improvements && improvements.length > 0 && (
        <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
          <h5 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">
            Agentic Improvements Suggested
          </h5>
          <ul className="space-y-1">
            {improvements.map((imp, i) => (
              <li key={i} className="text-xs text-amber-700 flex items-start gap-1">
                <span className="text-amber-500 mt-0.5">+</span>
                {imp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Grant data ──────────────────────────────────────────────── */
const grants = [
  {
    id: 'maha',
    name: 'MAHA ELEVATE',
    subtitle: 'Letter of Intent',
    deadline: 'April 10, 2026',
    amount: '$3.3M cooperative agreement',
    readiness: { narrative: 85, budget: 80, evidence: 90, blockers: 30 },
    overallScore: 72,
    blockers: ['SAM.gov registration (7-10 days)', 'EIN confirmation needed'],
    sections: [
      {
        title: 'Organization Information',
        status: 'needs-work' as const,
        content:
          'co-op.care Technologies LLC, Boulder, Colorado\nCEO: Blaine Warkentine, MD MBA\nClinical Director: Josh Emdur, DO (50-state licensed)\nEmail: blainecoopcare@gmail.com',
        improvements: [
          'Need confirmed EIN',
          'Need SAM.gov UEI number',
          'Add DUNS number if available',
        ],
      },
      {
        title: 'Target Chronic Condition(s)',
        status: 'complete' as const,
        content:
          'Primary: Functional decline in aging adults (2+ ADL deficits, cognitive impairment)\nSecondary: Hypertension, diabetes (comorbidities in target population)\nDementia track: Yes — seeking one of 3 dementia-reserved awards',
        improvements: [],
      },
      {
        title: 'Intervention Summary',
        status: 'complete' as const,
        content:
          'co-op.care proposes a worker-owned cooperative model delivering whole-person, technology-enabled home care to Original Medicare beneficiaries with chronic conditions. The intervention combines:\n\n1. AI-Powered Clinical Assessment (Sage AI) — conversational AI conducts comprehensive health assessments mapped to the Omaha System clinical taxonomy, generating structured FHIR-compliant clinical data.\n\n2. Physician-Reviewed Care Plans — Josh Emdur, DO reviews AI-generated assessments and creates individualized care plans addressing functional decline, chronic disease management, nutrition, physical activity, social isolation, and medication adherence.\n\n3. W-2 Cooperative Caregiver Delivery — trained caregiver member-owners (not 1099 contractors) deliver in-home care. Worker-ownership drives 15% turnover vs. 77% industry average.\n\n4. Community Time Banking — neighbors earn credits providing light support, reducing professional care costs while addressing social isolation.\n\n5. Clinical Data Pipeline — Omaha System → FHIR interoperability produces hospital-grade clinical data from home care encounters.',
        improvements: [
          'Add specific ICD-10 codes for target conditions',
          'Reference CMS-approved assessment instruments',
        ],
      },
      {
        title: 'Nutrition Component (Required)',
        status: 'complete' as const,
        content:
          '• Caregiver-assisted meal planning and preparation aligned with physician-prescribed dietary requirements\n• Sage AI nutritional assessment integrated into care plans\n• Chronic disease-specific nutrition coaching (diabetes, hypertension, renal)\n• Community-based nutrition education through time banking network',
        improvements: [
          'Add specific evidence-based nutrition protocols',
          'Reference USDA dietary guidelines for older adults',
        ],
      },
      {
        title: 'Physical Activity Component (Required)',
        status: 'complete' as const,
        content:
          '• Caregiver-supervised mobility and strength programs\n• Fall prevention protocols (CDC STEADI-based)\n• Daily activity tracking and physician-reviewed progress\n• Community walking groups and gentle exercise through time banking',
        improvements: [
          'Add Otago Exercise Programme reference (evidence-based fall prevention)',
          'Include wearable integration plans',
        ],
      },
      {
        title: 'Evidence Base',
        status: 'complete' as const,
        content:
          '1. Naylor et al. (JAMA, 2004): Transitional care model reduces readmissions by 36% and ER visits by 40%\n2. Coleman et al. (Archives of Internal Medicine, 2006): Care Transitions Intervention reduces 30-day readmissions by 30%\n3. PHI/CHCA Studies: Worker-owned cooperative achieves 15% turnover vs. 77% industry average\n4. Holt-Lunstad et al. (PLOS Medicine, 2010): Social isolation increases mortality risk by 26%\n5. CDC STEADI Program: Evidence-based fall prevention reduces fall-related hospitalizations by 60%\n6. Estate of Baral v. Commissioner (137 T.C. No. 1, 2011): Home care by non-professionals qualifies as medical care',
        improvements: [],
      },
      {
        title: 'Randomization Plan',
        status: 'complete' as const,
        content:
          'Stepped-wedge cluster randomization by geographic zone within Boulder County.\n• Control group receives standard care; intervention group receives co-op.care services\n• 6-month crossover period allowing all participants eventual access\n• IRB approval through University of Colorado Boulder partnership\n\nProjected Enrollment:\n• Year 1: 50 intervention + 50 control\n• Year 2: 150 intervention + 100 control\n• Year 3: 300 intervention + 150 control',
        improvements: [
          'Confirm CU Boulder IRB partnership',
          'Add power analysis justification for sample sizes',
        ],
      },
      {
        title: 'Budget Summary (3-Year)',
        status: 'complete' as const,
        content:
          'Year 1: $820K | Year 2: $1.18M | Year 3: $1.54M | Total: $3.3M\n\nBreakdown:\n• Personnel (clinical + ops): $1.8M\n• Caregiver wages + benefits: $1.2M\n• Technology (CareOS + AI): $240K\n• Data collection + reporting: $120K\n• Evaluation + IRB: $90K\n• Administrative: $90K\n\nCost sharing: Not required per NOFO.',
        improvements: [
          'Add indirect cost rate or waiver',
          "Include Josh's clinical time as in-kind match",
        ],
      },
      {
        title: 'Expected Outcomes',
        status: 'complete' as const,
        content:
          '• ER visits: 5.2/yr → 1.8/yr (65% reduction)\n• 30-day readmissions: 22% → 12% (45% reduction)\n• ADL improvement: 30% improvement from baseline\n• Medication adherence: 55% → 85%\n• Fall rate: 30% → 12% (60% reduction)\n• Social isolation: 40% improvement\n• Medicare cost/beneficiary: $15,000 → $12,750 (15% reduction)\n\nAt 300 beneficiaries (Year 3):\n• Total Medicare savings: ~$10.7M/year against $1.54M program cost = 6.9x ROI',
        improvements: [],
      },
    ],
  },
  {
    id: 'access',
    name: 'CMS ACCESS Model',
    subtitle: 'Cohort 1 Application',
    deadline: 'April 1, 2026 (rolling after)',
    amount: 'Outcome-aligned payments (10-year model)',
    readiness: { narrative: 90, budget: 70, evidence: 85, blockers: 25 },
    overallScore: 68,
    blockers: [
      'SAM.gov registration',
      'Medicare Part B enrollment for entity',
      'Josh NPI/TIN verification in PECOS',
    ],
    sections: [
      {
        title: 'Organization & Medicare Enrollment',
        status: 'needs-work' as const,
        content:
          'co-op.care Technologies LLC, Boulder, Colorado 80302\nFiling under Josh Emdur, DO individual NPI/TIN for Cohort 1.\nJosh has maintained continuous Medicare enrollment since 2008 via BCH.\nOrganizational Medicare Part B enrollment to follow upon acceptance.',
        improvements: [
          'Verify Josh NPI is active in PECOS',
          'Confirm no sanctions on OIG LEIE or SAM.gov',
          'Prepare CMS-855B for entity enrollment',
        ],
      },
      {
        title: 'Clinical Tracks: MSK + Behavioral Health',
        status: 'complete' as const,
        content:
          'Track 1 — Musculoskeletal (MSK):\nChronic MSK pain in aging adults managed through cooperative caregiver-delivered physical activity protocols, fall prevention (CDC STEADI), and physician-supervised care plans. Sage AI assesses pain, function, and mobility; CareOS tracks outcomes via FHIR.\n\nTrack 2 — Behavioral Health (BH):\nDepression and social isolation in homebound elderly addressed through time banking community connections, caregiver companionship, and physician-monitored behavioral health screening (PHQ-9, GAD-7). Social prescribing model integrated with clinical care.',
        improvements: [
          'Add specific CPT codes for MSK interventions',
          'Reference PROMIS measures for outcome tracking',
        ],
      },
      {
        title: 'Technology & FHIR Reporting',
        status: 'complete' as const,
        content:
          'CareOS Platform Architecture:\n• Sage AI: Conversational clinical assessment engine (Omaha System taxonomy)\n• FHIR Pipeline: All encounters mapped to Patient, Condition, Observation, CarePlan, Encounter resources\n• Autonomous LMN System: AI-drafted Letters of Medical Necessity with physician review\n• Real-time dashboards: KPIs tracked at co-op.care\n\nACCESS API Integration:\n• Eligibility API: Query beneficiary coverage status\n• Alignment API: Provisionally align beneficiaries\n• Reporting API: Submit FHIR-compliant outcome data\n• Built on existing Omaha-to-FHIR mapping (production-deployed)',
        improvements: [
          'Specify FHIR R4 version compliance',
          'Add HL7 Da Vinci Implementation Guide references',
        ],
      },
      {
        title: 'Beneficiary Recruitment & Consent',
        status: 'complete' as const,
        content:
          'Target: Medicare beneficiaries 65+ in Boulder County with chronic MSK pain and/or depression.\n\nRecruitment channels:\n1. BCH discharge referrals (Grant Besser, BCH Foundation)\n2. TRU PACE participant overflow (Lafayette, 16 zip codes)\n3. Primary care physician referrals via Sage AI screening\n4. Boulder Neighborhood Village Project community outreach\n5. Village to Village Network (350+ member organizations)\n\nConsent: Verbal or written, documented in patient record per ACCESS RFA requirements. Informed consent covers data sharing, FHIR reporting, and randomization assignment.',
        improvements: ['Draft consent form language', 'Confirm BCH referral pathway is formalized'],
      },
      {
        title: 'Outcome-Aligned Payment Design',
        status: 'needs-work' as const,
        content:
          'ACCESS replaces fee-for-service with fixed Outcome-Aligned Payments (OAPs).\n\nProposed OAP structure:\n• Per-beneficiary-per-month payment for care management\n• Outcome Attainment Threshold (OAT): 50% for Year 1\n• Measures: ADL improvement, ER utilization, PHQ-9 depression scores, fall rate\n\nRevenue projection (Year 1, 50 beneficiaries):\n• Estimated PBPM: $200-400\n• Annual: $120K-$240K',
        improvements: [
          'Need CMS guidance on exact PBPM rates for MSK/BH tracks',
          'Model financial sustainability at different OAT achievement levels',
          'Add risk adjustment methodology',
        ],
      },
    ],
  },
  {
    id: 'chf',
    name: 'Colorado Health Foundation',
    subtitle: 'Health Equity Grant',
    deadline: 'June 15, 2026',
    amount: '$250,000 (capacity building)',
    readiness: { narrative: 85, budget: 60, evidence: 80, blockers: 40 },
    overallScore: 66,
    blockers: [
      'Need fiscal sponsor (501c3 required)',
      'Approach Community Foundation Boulder County or ICA Group',
    ],
    sections: [
      {
        title: 'Health Equity Alignment',
        status: 'complete' as const,
        content:
          'co-op.care addresses health inequity at two levels simultaneously:\n\n1. Family Level: Home care costs $55/hour through traditional agencies, pricing out middle-income families. co-op.care charges $35-42/hour, and physician-issued Letters of Medical Necessity unlock HSA/FSA pre-tax payment — reducing effective cost by 30-47%. Families who could never afford quality care can now access it.\n\n2. Caregiver Level: The home care industry pays $14-18/hour, offers no benefits, classifies workers as 1099 contractors, and experiences 77% annual turnover. co-op.care pays $25-28/hour W-2 with health insurance, PTO, retirement matching, and cooperative equity ownership. This transforms caregiving from a poverty-wage gig into a career with ownership and voice.',
        improvements: [
          'Add Boulder County demographic data on aging population',
          "Include income distribution data showing who can't afford care",
        ],
      },
      {
        title: 'Cooperative Model Innovation',
        status: 'complete' as const,
        content:
          'co-op.care is structured as a worker-owned cooperative under the Colorado Cooperative Act. Every caregiver is a W-2 member-owner with:\n• One member, one vote governance\n• Cooperative equity stake ($1,000-5,000 vesting over 3 years)\n• Annual patronage dividends from cooperative surplus\n• Health insurance, PTO, and retirement benefits\n• Career progression: Caregiver → Shift Lead → Trainer → Board Member\n\nThis model is proven. CHCA in the Bronx has operated as a worker-owned home care cooperative since 1985 with 600+ member-owners and 15% turnover. co-op.care adds AI-powered clinical technology that CHCA lacks.',
        improvements: [
          'Get letter of support from CHCA/PHI',
          'Add cooperative governance bylaws summary',
        ],
      },
      {
        title: 'Technology Platform',
        status: 'complete' as const,
        content:
          'CareOS is a production-deployed AI care platform:\n• Sage AI: Conversational clinical assessment engine\n• Living Profile: Dynamic patient record updated from every interaction\n• Autonomous LMN Generation: AI drafts physician-reviewed Letters of Medical Necessity\n• Omaha-to-FHIR Pipeline: Standardized clinical data from home care encounters\n• Time Banking Dashboard: Community exchange for neighbor-to-neighbor support\n• Video Home Assessment: Remote care planning tool\n\nLive at: co-op.care (24 pages, 50+ files, 9,000+ lines of code)',
        improvements: [],
      },
      {
        title: 'Budget Request ($250K)',
        status: 'needs-work' as const,
        content:
          'Personnel: $120K (operations lead + part-time admin)\nCaregiver recruitment & training: $40K (3 founding caregivers)\nTechnology infrastructure: $30K (CareOS hosting, AI APIs, security)\nLegal & compliance: $25K (cooperative formation, Class A license, healthcare attorney)\nCommunity outreach: $20K (Boulder partnerships, Village Project)\nEvaluation: $15K (outcomes tracking, data analysis)\n\nTotal: $250,000',
        improvements: [
          'Add fiscal sponsor administrative fee (5-10%)',
          'Include indirect cost rate',
          'Add sustainability plan beyond grant period',
        ],
      },
    ],
  },
  {
    id: 'bsw',
    name: 'Boulder Startup Week',
    subtitle: 'Session Proposal',
    deadline: '~April 1, 2026',
    amount: 'Free (visibility + lead gen)',
    readiness: { narrative: 95, budget: 100, evidence: 90, blockers: 95 },
    overallScore: 95,
    blockers: [],
    sections: [
      {
        title: 'Session Title',
        status: 'complete' as const,
        content:
          '"Your Parents Are Going to Need Help. Here\'s Why the $400B Home Care Industry Can\'t Provide It — and What Boulder Is Building Instead."',
        improvements: [],
      },
      {
        title: 'Session Description',
        status: 'complete' as const,
        content:
          "15,000 Boulder residents are over 65. By 2030, that number doubles. Home care agencies charge families $55/hour, pay caregivers $16/hour, and lose 77% of their workforce every year. The math doesn't work for anyone.\n\nco-op.care is a Boulder-born, worker-owned cooperative that's rewriting the equation. Using AI-powered care assessments, physician-reviewed Letters of Medical Necessity that unlock HSA/FSA funds, and a cooperative ownership model where caregivers earn $26/hour W-2 with equity — we're proving that better care, better jobs, and lower costs aren't tradeoffs. They're the same thing.",
        improvements: [],
      },
      {
        title: 'Speakers',
        status: 'complete' as const,
        content:
          'Blaine Warkentine — CEO, co-op.care (Facilitator)\nMD (MCW), MBA (Utah). 20+ years orthopedic technology. BrainLAB $250M. Multiple M&A exits.\n\nJosh Emdur, DO — Medical Director & Co-Founder\n50-state licensed physician. BCH hospitalist since 2008. CMO, Automate Clinic.\n\nJessica Dion — Co-op Community Director\nPT at BCH. Daughter of Bob Dion, first care recipient.',
        improvements: [],
      },
    ],
  },
  {
    id: 'sam',
    name: 'SAM.gov Registration',
    subtitle: 'Federal Prerequisite',
    deadline: 'ASAP (blocks everything)',
    amount: 'Free (required for all federal grants)',
    readiness: { narrative: 100, budget: 100, evidence: 100, blockers: 20 },
    overallScore: 20,
    blockers: [
      'Need confirmed EIN',
      'Need physical business address',
      'Need date of incorporation',
      'Need business bank account',
      '7-10 business day processing time',
    ],
    sections: [
      {
        title: 'Required Information',
        status: 'blocked' as const,
        content:
          '• Legal business name: co-op.care Technologies LLC\n• Physical address: [NEEDED — Boulder, CO, no PO Box]\n• Date of incorporation: [NEEDED]\n• EIN: [NEEDED]\n• NAICS: 621610 (Home Health Care Services)\n• Entity type: LLC (worker cooperative)\n• Congressional district: Colorado 2nd\n• Bank account: [NEEDED]',
        improvements: [
          'Confirm LLC is filed with Colorado Secretary of State',
          'Apply for EIN at irs.gov (instant online)',
          'Open business bank account (Mercury, Relay, or local credit union)',
        ],
      },
      {
        title: 'Registration Steps',
        status: 'complete' as const,
        content:
          '1. Get Unique Entity ID (UEI) at sam.gov\n2. Complete Core Data section\n3. Complete Reps & Certs\n4. Complete Points of Contact\n5. Submit for validation (7-10 business days)\n6. Activate for Financial Assistance Awards\n\nMust complete by March 31 to meet April 10 MAHA ELEVATE LOI deadline.',
        improvements: [],
      },
    ],
  },
];

export default function GrantWritingPage() {
  const navigate = useNavigate();
  const [activeGrant, setActiveGrant] = useState('maha');

  const current = grants.find((g) => g.id === activeGrant) ?? grants[0]!;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Logo size="md" />
          </button>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-[#1B2A4A] px-3 py-1 text-xs font-semibold text-white">
              GRANT WRITING WORKSPACE
            </span>
            <button
              onClick={() => navigate('/grants')}
              className="text-sm text-[#0D7377] hover:underline"
            >
              ← Tracker
            </button>
            <button
              onClick={() => navigate('/internal')}
              className="text-sm text-[#0D7377] hover:underline"
            >
              ← Directory
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Grant selector tabs */}
        <Reveal>
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
            {grants.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveGrant(g.id)}
                className={`flex-shrink-0 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                  activeGrant === g.id
                    ? 'bg-[#1B2A4A] text-white shadow-lg'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-[#0D7377]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{g.name}</span>
                  <span
                    className={`h-5 w-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      g.overallScore >= 80
                        ? 'bg-emerald-500 text-white'
                        : g.overallScore >= 50
                          ? 'bg-amber-500 text-white'
                          : 'bg-red-500 text-white'
                    }`}
                  >
                    {g.overallScore}
                  </span>
                </div>
                <p className="text-[10px] mt-0.5 opacity-75">{g.deadline}</p>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Active grant detail */}
        <Reveal>
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-[#1B2A4A]">{current.name}</h1>
                <p className="text-sm text-slate-500">
                  {current.subtitle} · {current.amount}
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`text-4xl font-bold ${
                    current.overallScore >= 80
                      ? 'text-emerald-600'
                      : current.overallScore >= 50
                        ? 'text-amber-600'
                        : 'text-red-600'
                  }`}
                >
                  {current.overallScore}%
                </div>
                <p className="text-xs text-slate-400">Readiness Score</p>
              </div>
            </div>

            {/* Readiness bars */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm mb-4">
              <div className="space-y-2">
                <ReadinessBar score={current.readiness.narrative} label="Narrative" />
                <ReadinessBar score={current.readiness.budget} label="Budget" />
                <ReadinessBar score={current.readiness.evidence} label="Evidence" />
                <ReadinessBar score={current.readiness.blockers} label="Blockers Clear" />
              </div>
            </div>

            {/* Blockers */}
            {current.blockers.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-4">
                <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2">
                  Active Blockers
                </h3>
                <div className="space-y-1">
                  {current.blockers.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-red-700">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      {b}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* Sections */}
        <div className="space-y-4">
          {current.sections.map((section, i) => (
            <Reveal key={i} delay={i * 0.03}>
              <Expandable
                defaultOpen={i === 0}
                title={
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-6">{i + 1}.</span>
                    <span className="font-semibold text-[#1B2A4A]">{section.title}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                        section.status === 'complete'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : section.status === 'needs-work'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                      }`}
                    >
                      {section.status === 'complete'
                        ? 'Ready'
                        : section.status === 'needs-work'
                          ? 'Needs Work'
                          : 'Blocked'}
                    </span>
                    {section.improvements && section.improvements.length > 0 && (
                      <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[10px] font-bold">
                        {section.improvements.length} suggestions
                      </span>
                    )}
                  </div>
                }
              >
                <SectionCard {...section} />
              </Expandable>
            </Reveal>
          ))}
        </div>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center">
          <p className="text-xs text-slate-400">
            co-op.care Grant Writing Workspace · March 2026 · Confidential
          </p>
        </footer>
      </main>
    </div>
  );
}
