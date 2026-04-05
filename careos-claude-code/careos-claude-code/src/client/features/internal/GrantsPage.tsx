/**
 * GrantsPage — Comprehensive grant & funding opportunities for co-op.care
 *
 * Private page at /#/grants — not linked from any nav.
 */
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { Reveal, Expandable } from '../../components/Reveal';

function DeadlineBadge({ date, label }: { date: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 border border-red-200 px-2.5 py-0.5 text-xs font-semibold text-red-800">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
      {label || 'Deadline:'} {date}
    </span>
  );
}

function AmountBadge({ amount }: { amount: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
      {amount}
    </span>
  );
}

interface Grant {
  name: string;
  source: string;
  amount: string;
  deadline: string;
  url: string;
  fit: 'strong' | 'moderate' | 'stretch';
  urgency: 'critical' | 'soon' | 'monitor';
  summary: string;
  whyFit: string[];
  howToApply: string;
  contact?: string;
}

const grants: { category: string; icon: string; color: string; items: Grant[] }[] = [
  {
    category: 'Federal — CMS Innovation',
    icon: '🏛️',
    color: 'bg-blue-50 border-blue-200',
    items: [
      {
        name: 'MAHA ELEVATE',
        source: 'CMS Innovation Center',
        amount: '$100M total (up to 30 awards, ~$3.3M each)',
        deadline: 'LOI: April 10, 2026 · Application: May 15, 2026',
        url: 'https://www.cms.gov/priorities/innovation/innovation-models/maha-elevate',
        fit: 'strong',
        urgency: 'critical',
        summary:
          'Funds 3-year cooperative agreements for whole-person care, functional/lifestyle medicine for Medicare beneficiaries. Explicitly targets interventions NOT currently covered by Medicare.',
        whyFit: [
          'Whole-person care for aging populations — exactly what co-op.care delivers',
          'Functional medicine / lifestyle interventions = our Sage AI assessments + care plans',
          'Data collection requirement = CareOS Omaha-to-FHIR pipeline',
          "Physician oversight required = Josh's role",
          'Cooperative model = community-based delivery',
        ],
        howToApply:
          'Submit mandatory LOI by April 10 at grants.gov. Full application by May 15. First cohort launches October 2026.',
        contact: 'mahaelevate@cms.hhs.gov',
      },
      {
        name: 'ACCESS Model',
        source: 'CMS Innovation Center',
        amount: 'Model participation (shared savings, not direct grant)',
        deadline: 'Application: April 1, 2026',
        url: 'https://www.cms.gov/priorities/innovation/innovation-models/access',
        fit: 'moderate',
        urgency: 'critical',
        summary:
          'Advancing Chronic Care with Effective, Scalable Solutions. 10-year model for chronic conditions (diabetes, hypertension, MSK pain, depression). Emphasizes digital technologies, telehealth, wearables.',
        whyFit: [
          'Chronic disease focus aligns with our target population (2+ ADL deficits)',
          'Digital technology + telehealth = CareOS + Sage AI',
          'Wearable integration = future CareOS roadmap',
          'Josh can serve as participating physician',
        ],
        howToApply: 'Apply via CMS Participant Portal by April 1, 2026. Model begins July 5, 2026.',
        contact: 'CMS Innovation Center',
      },
      {
        name: 'Rural Health Transformation (RHT)',
        source: 'CMS',
        amount: '$50B total ($10B/year, $147M-$281M per state)',
        deadline: 'State-administered, ongoing through 2030',
        url: 'https://www.cms.gov/priorities/rural-health-transformation-rht-program/overview',
        fit: 'moderate',
        urgency: 'monitor',
        summary:
          'Massive rural health investment. States distribute funds. Supports community health workers, innovative care models, workforce development. Colorado will receive $200M+ in 2026.',
        whyFit: [
          'Community health worker funding = caregiver workforce development',
          'Innovative care models = cooperative home care',
          'Workforce expansion = W-2 caregiver jobs',
          'Colorado is receiving funds — need to connect with state administrators',
        ],
        howToApply:
          'Monitor Colorado HCPF for sub-grant opportunities. Contact state rural health office.',
      },
    ],
  },
  {
    category: 'Federal — ACL / Aging',
    icon: '🏠',
    color: 'bg-purple-50 border-purple-200',
    items: [
      {
        name: 'RAISE Act Caregiver Implementation Grants',
        source: 'Administration for Community Living (ACL)',
        amount: '$2M available (multiple awards)',
        deadline: 'Rolling / check grants.gov',
        url: 'https://acl.gov/programs/support-caregivers/raise-family-caregiving-advisory-council',
        fit: 'strong',
        urgency: 'soon',
        summary:
          'Funds state-level cross-sector caregiver support demonstrations implementing the National Strategy to Support Family Caregivers. Direct result of RAISE Family Caregivers Act.',
        whyFit: [
          'Caregiver support is our core mission',
          'Cross-sector demonstrations = cooperative model innovation',
          'National Strategy alignment = federal priority',
          'Colorado is actively implementing — connect with state aging office',
        ],
        howToApply:
          'Monitor ACL.gov and grants.gov for next funding cycle. Partner with Colorado State Unit on Aging.',
      },
      {
        name: 'National Family Caregiver Support Program (NFCSP)',
        source: 'ACL / Older Americans Act',
        amount: 'Formula grants to states (~$200M national)',
        deadline: 'State-administered, ongoing',
        url: 'https://acl.gov/programs/support-caregivers/national-family-caregiver-support-program',
        fit: 'strong',
        urgency: 'monitor',
        summary:
          'Grants to states for respite care, counseling, training, and support services for family caregivers. Administered through Area Agencies on Aging.',
        whyFit: [
          'Respite care = our companion care services',
          'Caregiver training = our cooperative workforce development',
          'Boulder County AAA is the local administrator',
          'co-op.care could be a contracted service provider',
        ],
        howToApply: 'Contact Boulder County Area Agency on Aging to become a contracted provider.',
      },
      {
        name: 'ACL MAHA Grants ($60M)',
        source: 'Administration for Community Living',
        amount: '$60M (awarded Sept 2025, may have new cycle)',
        deadline: 'Monitor for 2026 cycle',
        url: 'https://www.hhs.gov/press-room/administration-community-living-awards-60-million-dollars-advance-maha-agenda.html',
        fit: 'strong',
        urgency: 'monitor',
        summary:
          'Grants advancing MAHA agenda for older adults and people with disabilities. Falls prevention, chronic disease management, hospitalization reduction, state caregiver strategies.',
        whyFit: [
          'Falls prevention = our caregiver safety monitoring',
          'Chronic disease management = Sage AI assessments',
          'Hospitalization reduction = our core value proposition',
          'Caregiver strategies = cooperative model',
        ],
        howToApply: 'Monitor ACL.gov for next funding opportunity announcement.',
      },
    ],
  },
  {
    category: 'Federal — USDA Cooperative',
    icon: '🌾',
    color: 'bg-amber-50 border-amber-200',
    items: [
      {
        name: 'Rural Cooperative Development Grant (RCDG)',
        source: 'USDA Rural Development',
        amount: 'Up to $200K per grant (~$5.8M total)',
        deadline: 'Next cycle ~Sept 2026 (annual)',
        url: 'https://www.rd.usda.gov/programs-services/business-programs/rural-cooperative-development-grant-program',
        fit: 'moderate',
        urgency: 'monitor',
        summary:
          'Funds nonprofit centers for rural cooperative development. Feasibility studies, business plans, training, technical assistance for new cooperatives. 25% match required.',
        whyFit: [
          'Directly funds cooperative development',
          'Technical assistance for new co-ops = our Phase 1 needs',
          'Could fund CareOS feasibility study for other markets',
          'Must be rural — Boulder County edges qualify',
        ],
        howToApply:
          'Apply through grants.gov when next NOFO opens (~Sept 2026). Must be nonprofit applicant — could partner with existing co-op development center.',
      },
      {
        name: 'Rural Economic Development Loan & Grant (REDLG)',
        source: 'USDA Rural Development',
        amount: '$50M loans + $10M grants for FY 2026',
        deadline: 'Quarterly: March 31 · June 30, 2026',
        url: 'https://www.federalregister.gov/documents/2025/09/15/2025-17770/notice-of-funding-opportunity-for-the-rural-economic-development-loan-and-grant-programs-for-fiscal',
        fit: 'moderate',
        urgency: 'soon',
        summary:
          'Loans and grants for rural economic development projects. Quarterly application cycles.',
        whyFit: [
          'Job creation in rural/semi-rural areas',
          'Cooperative workforce development',
          'March 31 deadline is imminent for Q3',
        ],
        howToApply:
          'Apply via USDA Rural Development. Q3 deadline March 31, Q4 deadline June 30, 2026.',
      },
    ],
  },
  {
    category: 'Colorado State',
    icon: '🏔️',
    color: 'bg-teal-50 border-teal-200',
    items: [
      {
        name: 'Money Follows the Person ($43M)',
        source: 'Colorado HCPF / CMS',
        amount: '$43M over 4 years (+ $100M HCBS investment)',
        deadline: 'Ongoing — state-administered',
        url: 'https://hcpf.colorado.gov/state-receives-43m-grant',
        fit: 'strong',
        urgency: 'soon',
        summary:
          'CMS demonstration grant to help people transition from institutional care to home/community settings. Combined with state HCBS funding = $100M+ investment.',
        whyFit: [
          'Directly funds home and community-based services',
          'co-op.care IS the HCBS delivery mechanism',
          'Transitions from facility to home = our core use case',
          'Colorado HCPF is actively distributing these funds',
        ],
        howToApply: 'Contact HCPF HCBS division to become an approved provider/subcontractor.',
      },
      {
        name: 'Colorado Respite Care Grants',
        source: 'Colorado DHS / Easterseals Colorado',
        amount: '$10K-$30K per grant',
        deadline: 'Current cycle ends June 30, 2026',
        url: 'https://coloradorespitecoalition.org/providers/grant-opportunities/',
        fit: 'strong',
        urgency: 'soon',
        summary:
          'Funds agencies providing respite care to family caregivers. Managed by Easterseals Colorado and Colorado DHS State Unit on Aging.',
        whyFit: [
          'Respite care is a core co-op.care service',
          'Small but validates model with state funding',
          'Builds relationship with State Unit on Aging',
          'LOI required — straightforward application',
        ],
        howToApply:
          'Submit LOI to Colorado Respite Coalition. Must already provide respite care services.',
      },
      {
        name: 'Colorado Health Foundation Grants',
        source: 'Colorado Health Foundation',
        amount: 'Varies (major funder)',
        deadline: 'March 31, 2026',
        url: 'https://coloradohealth.org',
        fit: 'strong',
        urgency: 'critical',
        summary:
          "Colorado's largest health foundation. Funds health equity, community health, workforce development. Strong alignment with cooperative model.",
        whyFit: [
          'Health equity = W-2 wages for caregivers vs. gig economy',
          'Community health = aging-in-place, time banking',
          'Workforce development = cooperative caregiver training',
          'Colorado-focused = Boulder-first model',
        ],
        howToApply: 'Apply at coloradohealth.org by March 31, 2026.',
      },
      {
        name: 'Boettcher Foundation',
        source: 'Boettcher Foundation',
        amount: 'Varies',
        deadline: 'May 29, 2026',
        url: 'https://boettcherfoundation.org',
        fit: 'moderate',
        urgency: 'soon',
        summary:
          'Colorado foundation funding community transformation. Priority for rural Colorado but funds statewide.',
        whyFit: [
          'Community transformation = cooperative care model',
          'Statewide expansion potential',
          'Strong Colorado presence and network',
        ],
        howToApply: 'Apply at boettcherfoundation.org by May 29, 2026.',
      },
      {
        name: 'Anschutz Family Foundation',
        source: 'Anschutz Family Foundation',
        amount: 'Varies',
        deadline: 'Rolling',
        url: 'https://anschutzfamilyfoundation.org',
        fit: 'moderate',
        urgency: 'monitor',
        summary: 'Strengthening families and communities. Priority for rural Colorado.',
        whyFit: [
          'Family strengthening = aging-in-place support',
          'Community focus = cooperative model',
          'Could fund Colorado expansion beyond Boulder',
        ],
        howToApply: 'Submit inquiry at foundation website.',
      },
    ],
  },
  {
    category: 'PACE / Medicare',
    icon: '⚕️',
    color: 'bg-red-50 border-red-200',
    items: [
      {
        name: 'TRU PACE Subcontracting',
        source: 'TRU Community Care (Lafayette, CO)',
        amount: '$35-42/hr per participant (50 participants = $2.2M/yr)',
        deadline: 'Ongoing — relationship-driven',
        url: '',
        fit: 'strong',
        urgency: 'soon',
        summary:
          'Not a grant — a revenue contract. TRU PACE serves 16 Boulder County zip codes. co-op.care as subcontractor providing home-based companion care to PACE participants.',
        whyFit: [
          'Immediate revenue opportunity (no grant application)',
          'Lafayette is 15 minutes from Boulder',
          'PACE capitation = predictable revenue',
          'No worker-owned cooperative has a PACE contract anywhere (whitespace)',
        ],
        howToApply:
          'Contact Heather Bowie at TRU Community Care. Present one-pager (already created).',
      },
      {
        name: 'CMS GUIDE Model (Dementia)',
        source: 'CMS Innovation Center',
        amount: 'Model participation + per-beneficiary payments',
        deadline: 'Monitor for enrollment windows',
        url: 'https://www.cms.gov/priorities/innovation/models',
        fit: 'moderate',
        urgency: 'monitor',
        summary:
          'Guiding an Improved Dementia Experience. Comprehensive dementia care model with caregiver support and respite services.',
        whyFit: [
          'Dementia care = chronically ill population (our LMN sweet spot)',
          'Caregiver support + respite = core services',
          'Josh can serve as clinical lead',
        ],
        howToApply: 'Monitor CMS Innovation Center for next application window.',
      },
    ],
  },
  {
    category: 'Foundation / Impact',
    icon: '💚',
    color: 'bg-emerald-50 border-emerald-200',
    items: [
      {
        name: 'Robert Wood Johnson Foundation (RWJF)',
        source: 'RWJF',
        amount: '$625M committed to impact investments',
        deadline: 'Rolling',
        url: 'https://www.rwjf.org/en/about-rwjf/impact-investing.html',
        fit: 'strong',
        urgency: 'monitor',
        summary:
          "Nation's largest health philanthropy. $625M in impact investments targeting health equity and community health. PRIs, loans, equity investments, guarantees.",
        whyFit: [
          'Health equity = cooperative caregiver ownership',
          'Community health = aging-in-place model',
          'Impact investment = aligned with cooperative structure',
          'Could fund Phase 1-2 scaling',
        ],
        howToApply:
          'Submit inquiry through RWJF website. Build relationship with program officers.',
      },
      {
        name: 'DRK Foundation',
        source: 'DRK Foundation',
        amount: 'Up to $300K over 3 years',
        deadline: 'Rolling (20 funded/year from 2,225 applications)',
        url: 'https://www.drkfoundation.org/apply-for-funding/what-we-fund/',
        fit: 'moderate',
        urgency: 'monitor',
        summary:
          'Funds high-impact social enterprises with unrestricted grants + dedicated board member for 3 years. Operational and technical support included.',
        whyFit: [
          'Social enterprise focus = cooperative model',
          'Unrestricted funding = maximum flexibility',
          'Board service = experienced mentor/advisor',
          'Highly competitive but high-value',
        ],
        howToApply: 'Apply at drkfoundation.org. ~1% acceptance rate — need strong impact metrics.',
      },
      {
        name: 'Echoing Green Fellowship',
        source: 'Echoing Green',
        amount: 'Stipend + health insurance + network',
        deadline: 'Annual cycle (typically Jan-Feb)',
        url: 'https://echoinggreen.org',
        fit: 'moderate',
        urgency: 'monitor',
        summary:
          'Fellowship for social entrepreneurs working on health, poverty, education. Living stipend, health insurance, global network of investors and mentors.',
        whyFit: [
          'Social entrepreneurship in health = co-op.care',
          'Network access = investors, mentors, partners',
          'Validation + visibility for cooperative model',
        ],
        howToApply: 'Apply during next annual cycle (typically opens January).',
      },
      {
        name: 'Cigna Group Foundation',
        source: 'The Cigna Group',
        amount: 'Varies',
        deadline: 'RFA opens April 2026',
        url: 'https://www.thecignagroup.com/our-impact/esg/healthy-society/community/foundation/',
        fit: 'moderate',
        urgency: 'soon',
        summary:
          'Health Equity Impact Fund supporting projects that address root causes of health disparities. 2026 locations and goals announced April 2026.',
        whyFit: [
          'Health equity = caregiver wage equity',
          'Root cause focus = systemic care model change',
          'Potential for corporate partnership beyond grant',
        ],
        howToApply: 'Monitor for April 2026 RFA announcement.',
      },
      {
        name: 'Richard King Mellon Foundation',
        source: 'RKM Foundation',
        amount: '$23.2M invested in 67 startups since 2021',
        deadline: 'Rolling',
        url: 'https://www.rkmf.org/funding-programs/social-impact-investments/',
        fit: 'moderate',
        urgency: 'monitor',
        summary:
          'Program-Related Investments (PRIs) for social-impact startups. Industry agnostic, any stage beyond idea. For-profit companies eligible.',
        whyFit: [
          'PRI = patient capital for cooperative',
          'Social impact focus = aging care + jobs',
          'Industry agnostic = healthcare welcome',
          'For-profit eligible (cooperative LLC)',
        ],
        howToApply: 'Submit inquiry through RKM Foundation website.',
      },
    ],
  },
  {
    category: 'Cooperative-Specific',
    icon: '🤝',
    color: 'bg-indigo-50 border-indigo-200',
    items: [
      {
        name: 'National Cooperative Bank (NCB)',
        source: 'NCB',
        amount: 'Loans + technical assistance',
        deadline: 'Ongoing',
        url: 'https://www.ncb.coop',
        fit: 'strong',
        urgency: 'monitor',
        summary:
          'Only bank in the US exclusively serving cooperatives. Provides loans, lines of credit, and technical assistance to cooperative businesses.',
        whyFit: [
          'Purpose-built for cooperatives',
          'Understands cooperative governance',
          'Could fund Phase 1-2 operations',
          'Technical assistance for cooperative formation',
        ],
        howToApply: 'Contact NCB directly for lending inquiry.',
      },
      {
        name: 'Cooperative Fund of New England (CFNE)',
        source: 'CFNE',
        amount: 'Loans $10K-$500K',
        deadline: 'Ongoing',
        url: 'https://cooperativefund.org',
        fit: 'moderate',
        urgency: 'monitor',
        summary:
          'Community development financial institution (CDFI) providing loans to cooperatives and community organizations. Patient capital at below-market rates.',
        whyFit: [
          'CDFI = mission-aligned lending',
          'Below-market rates = affordable capital',
          'Cooperative expertise in underwriting',
        ],
        howToApply: 'Apply at cooperativefund.org.',
      },
      {
        name: 'ICA Group Technical Assistance',
        source: 'ICA Group',
        amount: 'Free/subsidized technical assistance',
        deadline: 'Ongoing',
        url: 'https://icagroup.org',
        fit: 'strong',
        urgency: 'soon',
        summary:
          'Leading cooperative development organization. Provides free technical assistance for worker cooperative formation, governance, and operations. Specific expertise in home care cooperatives (helped build CHCA).',
        whyFit: [
          'Built CHCA — the model co-op.care is based on',
          'Free technical assistance for cooperative formation',
          'Governance, bylaws, member education expertise',
          'Could help with Colorado cooperative articles of incorporation',
        ],
        howToApply: 'Contact ICA Group directly. Reference CHCA model.',
      },
    ],
  },
];

const fitColors = {
  strong: 'text-emerald-700 bg-emerald-100',
  moderate: 'text-amber-700 bg-amber-100',
  stretch: 'text-red-700 bg-red-100',
};

export default function GrantsPage() {
  const navigate = useNavigate();

  const criticalCount = grants
    .flatMap((g) => g.items)
    .filter((i) => i.urgency === 'critical').length;
  const soonCount = grants.flatMap((g) => g.items).filter((i) => i.urgency === 'soon').length;
  const totalAmount = '$50B+';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Logo size="md" />
          </button>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
              GRANT FUNDING TRACKER
            </span>
            <button
              onClick={() => navigate('/internal')}
              className="text-sm text-[#0D7377] hover:underline"
            >
              ← Directory
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <Reveal>
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">
              Grant & Funding Opportunities
            </h1>
            <p className="text-slate-500 mb-6">
              Every federal, state, foundation, and cooperative funding source applicable to
              co-op.care.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                <p className="text-3xl font-bold text-[#1B2A4A]">
                  {grants.flatMap((g) => g.items).length}
                </p>
                <p className="text-xs text-slate-500">Opportunities</p>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center shadow-sm">
                <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
                <p className="text-xs text-red-500">Urgent (days away)</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center shadow-sm">
                <p className="text-3xl font-bold text-amber-600">{soonCount}</p>
                <p className="text-xs text-amber-500">Apply Soon</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center shadow-sm">
                <p className="text-3xl font-bold text-emerald-600">{totalAmount}</p>
                <p className="text-xs text-emerald-500">Total Available</p>
              </div>
            </div>

            {/* Strategy */}
            <div className="rounded-xl border-2 border-[#1B2A4A] bg-[#1B2A4A] p-5 text-white mb-6">
              <h3 className="font-bold text-lg mb-2">The Strategy</h3>
              <p className="text-slate-300 text-sm">
                Government money validates. Surgeon money aligns. VC money scales.{' '}
                <strong className="text-white">In that order.</strong>
              </p>
            </div>

            {/* Progress tracker */}
            <div className="rounded-xl border-2 border-red-300 bg-red-50 p-5 mb-6">
              <h3 className="font-bold text-red-800 mb-3">Submission Pipeline</h3>
              <div className="space-y-3">
                {[
                  {
                    name: 'SAM.gov Entity Registration',
                    deadline: 'ASAP (blocks all federal)',
                    status: 'not-started',
                    blocker: 'Need EIN + incorporation docs',
                    owner: 'Blaine',
                  },
                  {
                    name: 'Colorado Health Foundation',
                    deadline: 'June 15, 2026',
                    status: 'drafting',
                    blocker: 'Need fiscal sponsor (501c3)',
                    owner: 'Blaine',
                  },
                  {
                    name: 'Boulder Startup Week',
                    deadline: '~April 1, 2026',
                    status: 'drafted',
                    blocker: 'None — ready to submit',
                    owner: 'Blaine',
                  },
                  {
                    name: 'CMS ACCESS Model',
                    deadline: 'April 1, 2026 (rolling after)',
                    status: 'drafting',
                    blocker: 'SAM.gov + Medicare Part B enrollment',
                    owner: 'Josh + Blaine',
                  },
                  {
                    name: 'MAHA ELEVATE LOI',
                    deadline: 'April 10, 2026',
                    status: 'drafted',
                    blocker: 'SAM.gov registration',
                    owner: 'Blaine',
                  },
                  {
                    name: 'MAHA ELEVATE Full App',
                    deadline: 'May 15, 2026',
                    status: 'drafting',
                    blocker: 'LOI must be submitted first',
                    owner: 'Blaine + Josh',
                  },
                  {
                    name: 'Boettcher Foundation',
                    deadline: 'May 29, 2026',
                    status: 'not-started',
                    blocker: 'None',
                    owner: 'Blaine',
                  },
                  {
                    name: 'TRU PACE Outreach',
                    deadline: 'Ongoing',
                    status: 'one-pager-ready',
                    blocker: 'Need to contact Heather Bowie',
                    owner: 'Blaine',
                  },
                ].map((item, i) => {
                  const statusConfig: Record<string, { color: string; label: string }> = {
                    'not-started': { color: 'bg-slate-300', label: 'Not Started' },
                    drafting: { color: 'bg-amber-400', label: 'Drafting' },
                    drafted: { color: 'bg-blue-400', label: 'Drafted' },
                    submitted: { color: 'bg-emerald-500', label: 'Submitted' },
                    blocked: { color: 'bg-red-500', label: 'Blocked' },
                    'one-pager-ready': { color: 'bg-blue-400', label: 'One-Pager Ready' },
                  };
                  const s = statusConfig[item.status] ?? {
                    color: 'bg-slate-300',
                    label: 'Not Started',
                  };
                  return (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className={`h-3 w-3 rounded-full ${s.color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-red-900 truncate">{item.name}</span>
                          <span className="text-xs text-red-600 flex-shrink-0 ml-2">
                            {item.deadline}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${s.color}`}
                          >
                            {s.label}
                          </span>
                          {item.blocker !== 'None' && item.blocker !== 'None — ready to submit' && (
                            <span className="text-[10px] text-red-500">
                              Blocker: {item.blocker}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 ml-auto">{item.owner}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Critical blocker */}
            <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-5">
              <h3 className="font-bold text-amber-800 mb-2">
                Critical Blocker: SAM.gov Registration
              </h3>
              <p className="text-sm text-amber-900 mb-3">
                No federal grant application can be submitted without SAM.gov registration. Takes
                7-10 business days to process.
                <strong> Must start immediately to meet April 10 MAHA ELEVATE LOI deadline.</strong>
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded bg-white p-2">
                  <strong>Need:</strong> EIN (co-op.care Technologies LLC)
                </div>
                <div className="rounded bg-white p-2">
                  <strong>Need:</strong> Legal business name + address
                </div>
                <div className="rounded bg-white p-2">
                  <strong>Need:</strong> Date of incorporation
                </div>
                <div className="rounded bg-white p-2">
                  <strong>Need:</strong> Banking information
                </div>
              </div>
              <a
                href="https://sam.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-amber-800 hover:underline"
              >
                Register at SAM.gov
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => navigate('/grants/write')}
              className="rounded-lg bg-[#0D7377] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0a5c5f] transition-colors"
            >
              Open Grant Writing Workspace
            </button>
          </div>

          {/* Master To-Do List */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm mb-6">
            <h3 className="font-bold text-[#1B2A4A] mb-4">Master To-Do List</h3>
            <div className="space-y-4">
              {[
                {
                  week: 'This Week (March 22-28)',
                  color: 'border-red-300 bg-red-50',
                  tasks: [
                    {
                      task: 'Confirm co-op.care Technologies LLC is filed with CO Secretary of State',
                      owner: 'Blaine',
                      done: false,
                    },
                    {
                      task: 'Get EIN from IRS (instant online at irs.gov)',
                      owner: 'Blaine',
                      done: false,
                    },
                    {
                      task: 'Open business bank account (Mercury, Relay, or local CU)',
                      owner: 'Blaine',
                      done: false,
                    },
                    {
                      task: 'Start SAM.gov registration (7-10 day processing)',
                      owner: 'Blaine',
                      done: false,
                    },
                    { task: 'Verify Josh NPI is active in PECOS', owner: 'Josh', done: false },
                    {
                      task: 'Attend MAHA ELEVATE informational webinar (March 25)',
                      owner: 'Both',
                      done: false,
                    },
                    { task: 'Submit Boulder Startup Week proposal', owner: 'Blaine', done: false },
                  ],
                },
                {
                  week: 'Next Week (March 29 - April 4)',
                  color: 'border-amber-300 bg-amber-50',
                  tasks: [
                    {
                      task: 'Submit CMS ACCESS application via Participant Portal',
                      owner: 'Blaine + Josh',
                      done: false,
                    },
                    { task: 'Confirm SAM.gov UEI received', owner: 'Blaine', done: false },
                    {
                      task: 'Josh reviews MAHA ELEVATE LOI for clinical accuracy',
                      owner: 'Josh',
                      done: false,
                    },
                    {
                      task: 'Draft MAHA ELEVATE LOI for grants.gov submission',
                      owner: 'Blaine',
                      done: false,
                    },
                    {
                      task: 'Contact TRU PACE — Heather Bowie outreach',
                      owner: 'Blaine',
                      done: false,
                    },
                    {
                      task: 'Research fiscal sponsor options for CO Health Foundation',
                      owner: 'Blaine',
                      done: false,
                    },
                  ],
                },
                {
                  week: 'April 5-10',
                  color: 'border-[#0D7377]/30 bg-[#0D7377]/5',
                  tasks: [
                    { task: 'Submit MAHA ELEVATE LOI at grants.gov', owner: 'Blaine', done: false },
                    {
                      task: 'Begin MAHA ELEVATE full application narrative',
                      owner: 'Blaine',
                      done: false,
                    },
                    {
                      task: 'Secure fiscal sponsor agreement for CO Health Foundation',
                      owner: 'Blaine',
                      done: false,
                    },
                    {
                      task: 'Contact ICA Group for cooperative technical assistance',
                      owner: 'Blaine',
                      done: false,
                    },
                    {
                      task: 'Contact Alexandra Drane / ARCHANGELS re: CII alignment',
                      owner: 'Blaine',
                      done: false,
                    },
                  ],
                },
                {
                  week: 'April 11 - May 15',
                  color: 'border-slate-200 bg-slate-50',
                  tasks: [
                    {
                      task: 'Write MAHA ELEVATE full application (due May 15)',
                      owner: 'Blaine + Josh',
                      done: false,
                    },
                    {
                      task: 'Prepare appendices: CVs, platform architecture, FHIR mapping',
                      owner: 'Blaine',
                      done: false,
                    },
                    {
                      task: 'Obtain BCH letter of support',
                      owner: 'Blaine (via Grant Besser)',
                      done: false,
                    },
                    {
                      task: 'Obtain CU Boulder IRB partnership letter',
                      owner: 'Josh',
                      done: false,
                    },
                    {
                      task: 'Boettcher Foundation application (due May 29)',
                      owner: 'Blaine',
                      done: false,
                    },
                    {
                      task: 'Colorado Health Foundation application (due June 15)',
                      owner: 'Blaine',
                      done: false,
                    },
                    {
                      task: 'VtV Network presentation proposal (due April 17)',
                      owner: 'Blaine',
                      done: false,
                    },
                    {
                      task: 'Boulder Startup Week session prep (May 4-8)',
                      owner: 'Blaine + Josh + Jess',
                      done: false,
                    },
                  ],
                },
              ].map((week, wi) => (
                <div key={wi} className={`rounded-lg border ${week.color} p-4`}>
                  <h4 className="font-bold text-[#1B2A4A] text-sm mb-2">{week.week}</h4>
                  <div className="space-y-1.5">
                    {week.tasks.map((t, ti) => (
                      <div key={ti} className="flex items-start gap-2 text-sm">
                        <div
                          className={`mt-1 h-3.5 w-3.5 rounded border flex-shrink-0 flex items-center justify-center ${t.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}
                        >
                          {t.done && (
                            <svg
                              className="h-2.5 w-2.5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-slate-700 flex-1">{t.task}</span>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">{t.owner}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Grant categories */}
        {grants.map((cat, ci) => (
          <Reveal key={ci} delay={ci * 0.03}>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{cat.icon}</span>
                <h2 className="text-xl font-bold text-[#1B2A4A]">{cat.category}</h2>
                <span className="text-xs text-slate-400">{cat.items.length} opportunities</span>
              </div>

              <div className="space-y-3">
                {cat.items.map((grant, gi) => (
                  <Expandable
                    key={gi}
                    urgency={grant.urgency}
                    defaultOpen={grant.urgency === 'critical' && gi === 0 && ci === 0}
                    title={
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-[#1B2A4A]">{grant.name}</h3>
                          <AmountBadge
                            amount={grant.amount.split('(')[0]?.trim() ?? grant.amount}
                          />
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${fitColors[grant.fit]}`}
                          >
                            {grant.fit} fit
                          </span>
                          {grant.urgency === 'critical' && (
                            <DeadlineBadge
                              date={
                                grant.deadline.split('·')[0]?.replace('LOI:', '').trim() ??
                                grant.deadline
                              }
                            />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{grant.source}</p>
                      </div>
                    }
                  >
                    <div className="space-y-4">
                      <p className="text-sm text-slate-700 leading-relaxed">{grant.summary}</p>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                            Why co-op.care Fits
                          </h4>
                          <ul className="space-y-1.5">
                            {grant.whyFit.map((item, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-xs text-emerald-700"
                              >
                                <span className="text-emerald-500 mt-0.5">✓</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            How to Apply
                          </h4>
                          <p className="text-xs text-slate-700 mb-2">{grant.howToApply}</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-semibold text-slate-500">Deadline:</span>
                              <span className="text-slate-700">{grant.deadline}</span>
                            </div>
                            {grant.contact && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-semibold text-slate-500">Contact:</span>
                                <span className="text-[#0D7377]">{grant.contact}</span>
                              </div>
                            )}
                            {grant.url && (
                              <a
                                href={grant.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-[#0D7377] hover:underline mt-1"
                              >
                                Visit website
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
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Expandable>
                ))}
              </div>
            </div>
          </Reveal>
        ))}

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center">
          <p className="text-xs text-slate-400">
            co-op.care Grant Tracker · Updated March 22, 2026 · Confidential
          </p>
          <p className="text-[10px] text-slate-300 mt-1">
            Deadlines and amounts are approximate. Verify at source websites before applying.
          </p>
        </footer>
      </main>
    </div>
  );
}
