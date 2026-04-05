/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ROIPage — Multi-stakeholder ROI visualization with expandable detail panels
 *
 * Private page at /#/legal/roi — not linked from any nav.
 * Web version of the ROI spreadsheet with interactive visuals.
 */
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { Reveal, AnimCounter, Expandable } from '../../components/Reveal';

/* ── Phase data ──────────────────────────────────────────────── */
const phases = [
  {
    label: 'Phase 0',
    sub: 'LMN Only',
    families: 0,
    caregivers: 0,
    lmns: 50,
    revenue: '$10K/mo',
    margin: '70%',
    revenueNum: 10000,
    marginNum: 70,
    detail: {
      timeline: 'Now — Month 3',
      focus: 'National LMN revenue via Sage AI assessments. Zero operational overhead.',
      revenue: [{ stream: 'LMN Fees (50/mo × $200)', amount: '$10,000/mo' }],
      costs: [
        { item: 'Josh review time (3 hrs/mo)', amount: '$1,000/mo' },
        { item: 'Technology (CareOS hosting)', amount: '$500/mo' },
        { item: 'Legal/compliance', amount: '$1,000/mo' },
      ],
      milestones: [
        'First 50 LMNs processed',
        'Legal opinion obtained',
        'Sage → LMN pipeline validated',
        'Josh workflow < 5 min/review',
      ],
    },
  },
  {
    label: 'Phase 1',
    sub: '10 Families',
    families: 10,
    caregivers: 3,
    lmns: 100,
    revenue: '$48K/mo',
    margin: '17%',
    revenueNum: 48000,
    marginNum: 17,
    detail: {
      timeline: 'Month 3 — Month 9',
      focus: 'Boulder pilot. 3 founding caregivers, 10 families, Class A license.',
      revenue: [
        { stream: 'LMN Fees (100/mo × $200)', amount: '$20,000/mo' },
        { stream: 'Companion Care (10 fam × 80 hrs × $38)', amount: '$27,720/mo' },
        { stream: 'AWV/ACP billing', amount: '$1,350/mo' },
      ],
      costs: [
        { item: 'Caregiver wages (3 × $26/hr)', amount: '$16,632/mo' },
        { item: 'Benefits + payroll tax', amount: '$3,272/mo' },
        { item: 'Operations + admin', amount: '$5,500/mo' },
        { item: 'Technology + insurance', amount: '$2,500/mo' },
      ],
      milestones: [
        'Class A license obtained',
        '3 W-2 caregiver-owners hired',
        'Bob Dion case study documented',
        'First HSA/FSA payment processed',
      ],
    },
  },
  {
    label: 'Phase 2',
    sub: '100 Families',
    families: 100,
    caregivers: 25,
    lmns: 500,
    revenue: '$420K/mo',
    margin: '26%',
    revenueNum: 420000,
    marginNum: 26,
    detail: {
      timeline: 'Month 9 — Month 18',
      focus: 'Boulder saturation. BCH partnership active. TRU PACE subcontracting begins.',
      revenue: [
        { stream: 'LMN Fees (500/mo × $200)', amount: '$100,000/mo' },
        { stream: 'Companion Care (100 fam × 80 hrs × $38)', amount: '$277,200/mo' },
        { stream: 'PACE Subcontracting (20 participants)', amount: '$42,000/mo' },
        { stream: 'CMS Billing (AWV/ACP/PIN)', amount: '$13,500/mo' },
      ],
      costs: [
        { item: 'Caregiver wages + benefits', amount: '$195,543/mo' },
        { item: 'Physician review + oversight', amount: '$15,000/mo' },
        { item: 'Operations + admin', amount: '$33,000/mo' },
        { item: 'Technology + marketing', amount: '$13,000/mo' },
      ],
      milestones: [
        'BCH formal partnership signed',
        'TRU PACE subcontract active',
        'Clinical white paper submitted',
        '25 caregiver member-owners',
      ],
    },
  },
  {
    label: 'Phase 3',
    sub: '1,000 Families',
    families: 1000,
    caregivers: 200,
    lmns: 2000,
    revenue: '$4M/mo',
    margin: '35%',
    revenueNum: 4000000,
    marginNum: 35,
    detail: {
      timeline: 'Month 18 — Month 36',
      focus: 'Colorado expansion. Multiple health system partnerships. Time banking at scale.',
      revenue: [
        { stream: 'LMN Fees (2,000/mo × $200)', amount: '$400,000/mo' },
        { stream: 'Companion Care (1,000 fam)', amount: '$2,772,000/mo' },
        { stream: 'PACE Subcontracting (50 participants)', amount: '$420,000/mo' },
        { stream: 'CMS Billing + platform fees', amount: '$235,000/mo' },
      ],
      costs: [
        { item: 'Caregiver labor (200 W-2)', amount: '$1,925,434/mo' },
        { item: 'Clinical + admin', amount: '$135,000/mo' },
        { item: 'Technology + marketing + legal', amount: '$80,000/mo' },
        { item: 'Cooperative governance', amount: '$10,000/mo' },
      ],
      milestones: [
        'Colorado Springs + Denver expansion',
        'CMS TEAM model participation',
        'Village to Village network integration',
        '200 caregiver member-owners',
      ],
    },
  },
  {
    label: 'Phase 4',
    sub: '4,000 Families',
    families: 4000,
    caregivers: 750,
    lmns: 5000,
    revenue: '$15M/mo',
    margin: '43%',
    revenueNum: 15000000,
    marginNum: 43,
    detail: {
      timeline: 'Month 36 — Month 60',
      focus: 'Multi-state federation. Technology licensing. National cooperative network.',
      revenue: [
        { stream: 'LMN Fees (5,000/mo × $200)', amount: '$1,000,000/mo' },
        { stream: 'Companion Care (4,000 fam)', amount: '$10,395,000/mo' },
        { stream: 'PACE + CMS Programs', amount: '$2,220,000/mo' },
        { stream: 'Platform licensing + time banking', amount: '$400,000/mo' },
      ],
      costs: [
        { item: 'Caregiver labor (750 W-2)', amount: '$7,214,131/mo' },
        { item: 'Clinical + admin + ops', amount: '$440,000/mo' },
        { item: 'Technology + infrastructure', amount: '$190,000/mo' },
        { item: 'Growth + governance', amount: '$130,000/mo' },
      ],
      milestones: [
        'Multi-state cooperative federation',
        'CareOS technology licensing',
        'IPO or strategic acquisition readiness',
        'National model for cooperative home care',
      ],
    },
  },
];

/* ── Stakeholder data ────────────────────────────────────────── */
const stakeholders = [
  {
    name: 'Families',
    icon: '👨‍👩‍👧‍👦',
    lightColor: 'bg-blue-50 border-blue-200',
    headline: { label: 'Annual savings vs traditional', value: '$14,400+', highlight: true },
    metrics: [
      { label: 'Monthly savings vs traditional (20 hrs/wk)', value: '$1,200' },
      { label: 'HSA/FSA tax benefit (30% bracket)', value: '$494/mo' },
      { label: 'Time banking offset', value: '$330/mo' },
      { label: 'ER visits avoided per year', value: '4' },
      { label: 'Savings vs traditional agency', value: '47%' },
    ],
    detail: {
      description:
        'Families with chronically ill loved ones save through three mechanisms: lower hourly rates ($38 vs $55 traditional), HSA/FSA pre-tax payment (25-37% tax savings via physician LMN), and time banking credits that offset 15-25% of professional care hours.',
      tiers: [
        {
          tier: 'Light Care (10 hrs/wk)',
          traditional: '$2,383/mo',
          coopcare: '$1,646/mo',
          effective: '$1,152/mo',
          savings: '$1,231/mo',
        },
        {
          tier: 'Moderate Care (20 hrs/wk)',
          traditional: '$4,766/mo',
          coopcare: '$3,293/mo',
          effective: '$2,305/mo',
          savings: '$2,461/mo',
        },
        {
          tier: 'Intensive Care (40 hrs/wk)',
          traditional: '$9,532/mo',
          coopcare: '$6,585/mo',
          effective: '$4,610/mo',
          savings: '$4,922/mo',
        },
      ],
      healthOutcomes: [
        { metric: 'ER visits avoided/year (from 5 → 1)', value: '$10,000 saved' },
        { metric: 'Hospitalizations avoided/year', value: '$15,000 saved' },
        { metric: 'Medication adherence improvement', value: '40% better' },
        { metric: 'Fall prevention', value: '60% reduction' },
      ],
    },
  },
  {
    name: 'Caregivers',
    icon: '💪',
    lightColor: 'bg-emerald-50 border-emerald-200',
    headline: { label: 'Comp advantage vs industry', value: '+78%', highlight: true },
    metrics: [
      { label: 'W-2 hourly wage (vs $16 industry)', value: '$26/hr' },
      { label: 'Health insurance (employer-paid)', value: '$6,000/yr' },
      { label: 'Cooperative equity stake (Year 1)', value: '$1,000' },
      { label: 'Total comp Year 1', value: '$58,200' },
      { label: 'Turnover rate (vs 77% industry)', value: '15%' },
    ],
    detail: {
      description:
        'The cooperative ownership model transforms caregiving from a dead-end gig into a career with equity, benefits, and governance voice. CHCA in the Bronx proved this model: 600+ worker-owners, 15% turnover vs 77% industry average.',
      comparison: [
        { metric: 'Employment type', industry: '1099 contractor', coopcare: 'W-2 member-owner' },
        { metric: 'Hourly wage', industry: '$14-18/hr', coopcare: '$25-28/hr' },
        { metric: 'Health insurance', industry: 'None', coopcare: '$6,000/yr employer-paid' },
        { metric: 'PTO', industry: 'None', coopcare: '10 days + holidays' },
        { metric: 'Retirement', industry: 'None', coopcare: '3-5% match' },
        { metric: 'Equity/ownership', industry: 'None', coopcare: '$1,000-5,000 vesting' },
        {
          metric: 'Schedule control',
          industry: 'On-call/variable',
          coopcare: 'Preferred/consistent',
        },
        { metric: 'Career path', industry: 'None', coopcare: 'Shift lead → Trainer → Board' },
        { metric: 'Voice in operations', industry: 'None', coopcare: '1 member, 1 vote' },
      ],
      turnoverAnalysis: {
        workforce: 25,
        industryTurnover: '77% = 19 replacements/year',
        coopcareTurnover: '15% = 4 replacements/year',
        costPerReplacement: '$5,000',
        annualSavings: '$75,000',
      },
    },
  },
  {
    name: 'Josh Emdur, DO',
    icon: '🩺',
    lightColor: 'bg-purple-50 border-purple-200',
    headline: { label: 'Effective hourly rate (Phase 2)', value: '$600+/hr', highlight: true },
    metrics: [
      { label: 'LMN revenue at Phase 2 (500/mo)', value: '$100K/mo' },
      { label: 'AWV + ACP + PIN/CHI billing', value: '$13.5K/mo' },
      { label: 'Total physician revenue (Phase 2)', value: '$1.36M/yr' },
      { label: 'Time commitment', value: '20 hrs/wk' },
      { label: 'vs hospitalist salary ($300K)', value: '4.5x' },
    ],
    detail: {
      description:
        "Josh's 50-state license is the platform. AI generates LMN drafts from Sage assessments; Josh reviews, modifies, and signs. At 3-5 minutes per review, his effective rate scales dramatically. CMS billing codes (AWV, ACP, PIN/CHI) add recurring revenue on top of LMN fees.",
      revenueByPhase: [
        {
          phase: 'Phase 0 (50 LMNs/mo)',
          lmn: '$10,000',
          cms: '$0',
          total: '$10,000/mo',
          hours: '5 hrs/wk',
          rate: '$500/hr',
        },
        {
          phase: 'Phase 1 (100 LMNs/mo)',
          lmn: '$20,000',
          cms: '$1,350',
          total: '$21,350/mo',
          hours: '8 hrs/wk',
          rate: '$615/hr',
        },
        {
          phase: 'Phase 2 (500 LMNs/mo)',
          lmn: '$100,000',
          cms: '$13,500',
          total: '$113,500/mo',
          hours: '20 hrs/wk',
          rate: '$1,310/hr',
        },
        {
          phase: 'Phase 3 (2,000 LMNs/mo)',
          lmn: '$400,000',
          cms: '$135,000',
          total: '$535,000/mo',
          hours: '40 hrs/wk',
          rate: '$3,090/hr',
        },
      ],
      cmsCodes: [
        {
          code: 'G0438/G0439',
          name: 'Annual Wellness Visit',
          rate: '$175-282',
          frequency: '60% of families/year',
        },
        {
          code: 'CPT 99497',
          name: 'Advance Care Planning',
          rate: '$80-86',
          frequency: '30% of families/year',
        },
        {
          code: 'G0023/G0024',
          name: 'PIN/CHI Navigation',
          rate: '$16-28/30min',
          frequency: 'All families',
        },
      ],
    },
  },
  {
    name: 'co-op.care',
    icon: '🏠',
    lightColor: 'bg-teal-50 border-teal-200',
    headline: { label: 'Phase 4 annual revenue', value: '$180M', highlight: true },
    metrics: [
      { label: 'Phase 2 monthly revenue', value: '$420K' },
      { label: 'Phase 2 gross margin', value: '36%' },
      { label: 'Phase 2 net income (annual)', value: '$1.3M' },
      { label: 'Phase 4 monthly revenue', value: '$15M' },
      { label: 'Ops cost/family (Phase 1 → 4)', value: '$200 → $8' },
    ],
    detail: {
      description:
        'Six revenue streams create a diversified business model. LMN fees provide high-margin national revenue from Day 1. Companion care adds volume. PACE subcontracting and CMS billing codes layer government revenue. Time banking and platform licensing scale the technology moat.',
      revenueStreams: [
        {
          stream: 'LMN Fees',
          ph1: '$20K',
          ph2: '$100K',
          ph4: '$1M',
          margin: '90%',
          note: 'Highest margin, scales nationally',
        },
        {
          stream: 'Companion Care',
          ph1: '$28K',
          ph2: '$277K',
          ph4: '$10.4M',
          margin: '32%',
          note: 'Volume driver, W-2 labor cost',
        },
        {
          stream: 'PACE Subcontracting',
          ph1: '-',
          ph2: '$42K',
          ph4: '$1.7M',
          margin: '35%',
          note: 'TRU PACE in Lafayette, CO',
        },
        {
          stream: 'CMS Billing',
          ph1: '$1.4K',
          ph2: '$13.5K',
          ph4: '$540K',
          margin: '85%',
          note: 'AWV, ACP, PIN/CHI codes',
        },
        {
          stream: 'Time Banking Platform',
          ph1: '-',
          ph2: '$5K',
          ph4: '$200K',
          margin: '95%',
          note: 'Transaction fees on credits',
        },
        {
          stream: 'Platform Licensing',
          ph1: '-',
          ph2: '-',
          ph4: '$200K',
          margin: '90%',
          note: 'CareOS to other co-ops',
        },
      ],
      breakeven:
        'Month 6-8 (Phase 1 → 2 transition). LMN revenue alone covers fixed costs by Month 4.',
    },
  },
  {
    name: 'BCH / Health System',
    icon: '🏥',
    lightColor: 'bg-red-50 border-red-200',
    headline: { label: 'ROI on partnership (Phase 2)', value: '75x', highlight: true },
    metrics: [
      { label: 'ER visits avoided (100 families)', value: '400/yr' },
      { label: 'Readmissions prevented', value: '50/yr' },
      { label: 'Annual cost savings (Phase 2)', value: '$3.75M' },
      { label: 'BCH investment', value: '$50K/yr' },
      { label: 'At 4,000 families', value: '$150M savings' },
    ],
    detail: {
      description:
        "Health systems lose money on preventable readmissions (CMS penalties), avoidable ER visits, and blocked beds. co-op.care's proactive home care model prevents these costly events. BCH invests $50K/year in partnership support; the return is 75x at 100 families.",
      costAvoidance: [
        {
          event: 'ER Visit Avoided',
          unitCost: '$2,500',
          volume100: '400/yr',
          savings100: '$1,000,000',
        },
        {
          event: 'Readmission Prevented',
          unitCost: '$18,000',
          volume100: '50/yr',
          savings100: '$900,000',
        },
        {
          event: 'Blocked Bed Day Recovered',
          unitCost: '$2,000',
          volume100: '200/yr',
          savings100: '$400,000',
        },
        {
          event: 'Fall Hospitalization Avoided',
          unitCost: '$35,000',
          volume100: '30/yr',
          savings100: '$1,050,000',
        },
        {
          event: 'CMS Readmission Penalty',
          unitCost: '$25,000',
          volume100: '15/yr',
          savings100: '$375,000',
        },
      ],
      additionalValue: [
        'Community health narrative for fundraising',
        'Grant eligibility for aging-in-place programs',
        'Academic publication partnership (clinical white paper)',
        'Village to Village Network positioning',
      ],
    },
  },
  {
    name: 'CMS / Taxpayer',
    icon: '🇺🇸',
    lightColor: 'bg-slate-50 border-slate-200',
    headline: { label: 'Total taxpayer value (Phase 2)', value: '$3M/yr', highlight: true },
    metrics: [
      { label: 'Medicare spend reduction (100 fam)', value: '$225K/yr' },
      { label: 'Facility avoidance (40% of families)', value: '$2.5M/yr' },
      { label: 'New payroll tax revenue (25 W-2)', value: '$99K/yr' },
      { label: 'Reduced safety net spending', value: '$120K/yr' },
      { label: 'At 4,000 families', value: '$120M/yr' },
    ],
    detail: {
      description:
        'Every family that ages in place instead of entering a facility saves Medicare $63,600/year ($8,500/mo facility vs $3,200/mo home care). W-2 caregivers generate payroll tax revenue and reduce SNAP/Medicaid usage. The cooperative model aligns with CMS innovation (TEAM, PACE, GUIDE, ACCESS).',
      facilityComparison: [
        { setting: 'Nursing Facility', monthly: '$8,500', annual: '$102,000' },
        { setting: 'Assisted Living', monthly: '$5,500', annual: '$66,000' },
        { setting: 'co-op.care Home Care', monthly: '$3,200', annual: '$38,400' },
        { setting: 'Savings vs Nursing Facility', monthly: '$5,300', annual: '$63,600' },
      ],
      cmsPrograms: [
        {
          program: 'TEAM',
          description: 'Total cost of care for surgical episodes',
          opportunity: 'Shared savings on post-surgical home recovery',
        },
        {
          program: 'PACE',
          description: 'Capitated all-inclusive care for elderly',
          opportunity: 'TRU PACE subcontractor at $35-42/hr',
        },
        {
          program: 'GUIDE',
          description: 'Dementia care model',
          opportunity: 'Caregiver support + respite services',
        },
        {
          program: 'ACCESS/ELEVATE',
          description: 'Home-based care expansion',
          opportunity: 'Direct participation as cooperative provider',
        },
      ],
    },
  },
  {
    name: 'Boulder Community',
    icon: '🏔️',
    lightColor: 'bg-amber-50 border-amber-200',
    headline: { label: 'Total economic impact (Phase 2)', value: '$1.3M', highlight: true },
    metrics: [
      { label: 'Jobs created (Phase 2)', value: '30' },
      { label: 'W-2 wages injected annually', value: '$780K' },
      { label: 'Economic multiplier impact', value: '$1.3M' },
      { label: 'Time bank hours/year', value: '5,000' },
      { label: 'Seniors aging in place', value: '80' },
    ],
    detail: {
      description:
        'Every dollar of W-2 wages generates $1.70 in local economic activity (BEA multiplier). Time banking creates a parallel economy of neighbor-to-neighbor support. Seniors aging in place preserve housing stock and community fabric.',
      byPhase: [
        {
          phase: 'Phase 1',
          jobs: 4,
          wages: '$94K',
          impact: '$160K',
          timebank: '500 hrs',
          agingInPlace: 8,
        },
        {
          phase: 'Phase 2',
          jobs: 30,
          wages: '$780K',
          impact: '$1.3M',
          timebank: '5,000 hrs',
          agingInPlace: 80,
        },
        {
          phase: 'Phase 3',
          jobs: 225,
          wages: '$6.2M',
          impact: '$10.6M',
          timebank: '50,000 hrs',
          agingInPlace: 800,
        },
        {
          phase: 'Phase 4',
          jobs: 825,
          wages: '$23.4M',
          impact: '$39.8M',
          timebank: '200,000 hrs',
          agingInPlace: 3200,
        },
      ],
      housingImpact:
        "At Phase 4, 2,400 housing units NOT vacated for facility care. In Boulder's tight housing market ($750K median home price), this preserves neighborhood continuity and prevents displacement.",
    },
  },
  {
    name: 'Seed Investor',
    icon: '💰',
    lightColor: 'bg-yellow-50 border-yellow-200',
    headline: { label: 'Year 5 return multiple', value: '36x', highlight: true },
    metrics: [
      { label: 'Seed investment', value: '$500K' },
      { label: 'Year 3 equity value', value: '$3M' },
      { label: 'Year 3 return multiple', value: '6x' },
      { label: 'Year 5 equity value', value: '$18M+' },
      { label: 'Comparable exit multiples', value: '8-15x rev' },
    ],
    detail: {
      description:
        "co-op.care combines healthcare services revenue (predictable, recurring) with technology platform value (high multiple at exit). The cooperative structure is a feature, not a bug — it creates retention, data quality, and community moats that pure-tech competitors can't replicate.",
      projections: [
        {
          year: 'Year 1',
          revenue: '$576K',
          netIncome: '($48K)',
          valuation: '$2M',
          seedValue: '$500K',
          multiple: '1.0x',
        },
        {
          year: 'Year 2',
          revenue: '$2.5M',
          netIncome: '$252K',
          valuation: '$5M',
          seedValue: '$1.25M',
          multiple: '2.5x',
        },
        {
          year: 'Year 3',
          revenue: '$8.6M',
          netIncome: '$1.7M',
          valuation: '$15M',
          seedValue: '$3M',
          multiple: '6.0x',
        },
        {
          year: 'Year 4',
          revenue: '$30M',
          netIncome: '$7.5M',
          valuation: '$50M',
          seedValue: '$7.5M',
          multiple: '15x',
        },
        {
          year: 'Year 5',
          revenue: '$90M',
          netIncome: '$27M',
          valuation: '$150M',
          seedValue: '$18M',
          multiple: '36x',
        },
      ],
      comparables: [
        {
          company: 'Honor/Home Instead',
          category: 'Home Care',
          multiple: '3-5x rev',
          exitValue: '$1.4B',
        },
        {
          company: 'Hinge Health (IPO)',
          category: 'Digital MSK',
          multiple: '15-20x',
          exitValue: '$6.5B',
        },
        {
          company: 'Sword Health',
          category: 'Digital Health',
          multiple: '10-15x',
          exitValue: '$3B+',
        },
        {
          company: 'InVivoLink → HCA',
          category: 'Health IT',
          multiple: '8-12x',
          exitValue: '$50M+',
        },
      ],
    },
  },
];

export default function ROIPage() {
  const navigate = useNavigate();

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
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
              CONFIDENTIAL — FINANCIAL MODEL
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

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Hero stats */}
        <Reveal>
          <div className="mb-12 text-center">
            <div className="inline-block rounded-full bg-[#0D7377]/10 px-4 py-1.5 text-sm font-semibold text-[#0D7377] mb-4">
              Full Financial Model
            </div>
            <h1 className="text-4xl font-bold text-[#1B2A4A] mb-3">
              Multi-Stakeholder ROI Analysis
            </h1>
            <p className="text-lg text-slate-500 mb-8">Every party wins. Here's the math.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-3xl font-bold text-[#0D7377]">
                  <AnimCounter end={8} />
                </p>
                <p className="text-xs text-slate-500">Stakeholders</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-3xl font-bold text-[#0D7377]">
                  <AnimCounter end={5} />
                </p>
                <p className="text-xs text-slate-500">Growth Phases</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-3xl font-bold text-[#0D7377]">
                  <AnimCounter end={6} />
                </p>
                <p className="text-xs text-slate-500">Revenue Streams</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-3xl font-bold text-[#0D7377]">
                  <AnimCounter prefix="$" end={180} suffix="M" />
                </p>
                <p className="text-xs text-slate-500">Phase 4 Annual Rev</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── PHASE CARDS (expandable) ────────────────────────────── */}
        <Reveal>
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-4">Growth Phases</h2>
          <p className="text-sm text-slate-500 mb-6">
            Click any phase to see revenue breakdown, costs, and milestones.
          </p>
          <div className="space-y-3 mb-12">
            {phases.map((phase, i) => (
              <Expandable
                key={i}
                defaultOpen={i === 2}
                title={
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#0D7377] flex items-center justify-center text-white text-xs font-bold">
                      {i}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#1B2A4A]">
                          {phase.label}: {phase.sub}
                        </span>
                        <span className="text-lg font-bold text-[#0D7377]">{phase.revenue}</span>
                        <span className="text-xs text-slate-400">{phase.margin} margin</span>
                      </div>
                    </div>
                  </div>
                }
                summary={phase.detail.focus}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="font-semibold">Timeline:</span> {phase.detail.timeline}
                  </div>
                  <p className="text-sm text-slate-700">{phase.detail.focus}</p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                      <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
                        Revenue Streams
                      </h4>
                      {phase.detail.revenue.map((r, j) => (
                        <div key={j} className="flex justify-between text-sm mb-1">
                          <span className="text-emerald-700">{r.stream}</span>
                          <span className="font-semibold text-emerald-900">{r.amount}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                      <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-3">
                        Costs
                      </h4>
                      {phase.detail.costs.map((c, j) => (
                        <div key={j} className="flex justify-between text-sm mb-1">
                          <span className="text-red-700">{c.item}</span>
                          <span className="font-semibold text-red-900">{c.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                      Key Milestones
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {phase.detail.milestones.map((m, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm text-slate-700">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#0D7377]" />
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Expandable>
            ))}
          </div>
        </Reveal>

        {/* ── STAKEHOLDER CARDS (expandable) ──────────────────────── */}
        <Reveal>
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-4">Stakeholder Returns</h2>
          <p className="text-sm text-slate-500 mb-6">
            Click any stakeholder to see detailed breakdowns, comparisons, and projections.
          </p>
        </Reveal>

        <div className="space-y-4 mb-12">
          {stakeholders.map((s, i) => (
            <Reveal key={i} delay={i * 0.03}>
              <Expandable
                defaultOpen={i === 0}
                title={
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{s.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#1B2A4A]">{s.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm text-slate-500">{s.headline.label}:</span>
                        <span className="text-lg font-bold text-[#0D7377]">{s.headline.value}</span>
                      </div>
                    </div>
                  </div>
                }
              >
                <div className="space-y-4">
                  <p className="text-sm text-slate-700 leading-relaxed">{s.detail.description}</p>

                  {/* Key metrics */}
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                      Key Metrics
                    </h4>
                    <div className="space-y-2">
                      {s.metrics.map((m, j) => (
                        <div key={j} className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">{m.label}</span>
                          <span className="font-semibold text-[#1B2A4A] text-sm">{m.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detailed tables */}
                  {'tiers' in s.detail && (
                    <div className="overflow-x-auto">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                        Cost Comparison by Care Tier
                      </h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-[#1B2A4A]">
                            <th className="py-2 text-left text-[#1B2A4A]">Tier</th>
                            <th className="py-2 text-right text-[#1B2A4A]">Traditional</th>
                            <th className="py-2 text-right text-[#1B2A4A]">co-op.care</th>
                            <th className="py-2 text-right text-[#1B2A4A]">w/ HSA+TimeBank</th>
                            <th className="py-2 text-right text-[#0D7377]">Monthly Savings</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(s.detail as any).tiers.map((t: any, j: number) => (
                            <tr key={j} className={j % 2 ? 'bg-slate-50' : ''}>
                              <td className="py-2 font-medium">{t.tier}</td>
                              <td className="py-2 text-right text-red-600">{t.traditional}</td>
                              <td className="py-2 text-right">{t.coopcare}</td>
                              <td className="py-2 text-right text-[#0D7377] font-semibold">
                                {t.effective}
                              </td>
                              <td className="py-2 text-right text-emerald-600 font-bold">
                                {t.savings}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {'healthOutcomes' in s.detail && (
                    <div className="grid grid-cols-2 gap-3">
                      {(s.detail as any).healthOutcomes.map((h: any, j: number) => (
                        <div
                          key={j}
                          className="rounded-lg bg-emerald-50 border border-emerald-200 p-3"
                        >
                          <p className="text-xs text-emerald-600">{h.metric}</p>
                          <p className="text-lg font-bold text-emerald-800">{h.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {'comparison' in s.detail && (
                    <div className="overflow-x-auto">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                        Industry vs co-op.care
                      </h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-[#1B2A4A]">
                            <th className="py-2 text-left text-[#1B2A4A]">Metric</th>
                            <th className="py-2 text-center text-red-600">Industry Standard</th>
                            <th className="py-2 text-center text-[#0D7377]">co-op.care</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(s.detail as any).comparison.map((c: any, j: number) => (
                            <tr key={j} className={j % 2 ? 'bg-slate-50' : ''}>
                              <td className="py-2 font-medium">{c.metric}</td>
                              <td className="py-2 text-center text-red-600">{c.industry}</td>
                              <td className="py-2 text-center text-[#0D7377] font-semibold">
                                {c.coopcare}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {'revenueByPhase' in s.detail && (
                    <div className="overflow-x-auto">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                        Revenue by Phase
                      </h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-[#1B2A4A]">
                            <th className="py-2 text-left">Phase</th>
                            <th className="py-2 text-right">LMN Rev</th>
                            <th className="py-2 text-right">CMS Billing</th>
                            <th className="py-2 text-right font-bold text-[#0D7377]">Total/Mo</th>
                            <th className="py-2 text-right">Hours/Wk</th>
                            <th className="py-2 text-right text-emerald-600">$/Hr</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(s.detail as any).revenueByPhase.map((r: any, j: number) => (
                            <tr key={j} className={j % 2 ? 'bg-slate-50' : ''}>
                              <td className="py-2 font-medium">{r.phase}</td>
                              <td className="py-2 text-right">{r.lmn}</td>
                              <td className="py-2 text-right">{r.cms}</td>
                              <td className="py-2 text-right font-bold text-[#0D7377]">
                                {r.total}
                              </td>
                              <td className="py-2 text-right">{r.hours}</td>
                              <td className="py-2 text-right font-bold text-emerald-600">
                                {r.rate}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {'revenueStreams' in s.detail && (
                    <div className="overflow-x-auto">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                        Revenue Streams Detail
                      </h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-[#1B2A4A]">
                            <th className="py-2 text-left">Stream</th>
                            <th className="py-2 text-right">Phase 1</th>
                            <th className="py-2 text-right">Phase 2</th>
                            <th className="py-2 text-right">Phase 4</th>
                            <th className="py-2 text-right">Margin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(s.detail as any).revenueStreams.map((r: any, j: number) => (
                            <tr key={j} className={j % 2 ? 'bg-slate-50' : ''}>
                              <td className="py-2 font-medium">{r.stream}</td>
                              <td className="py-2 text-right">{r.ph1}</td>
                              <td className="py-2 text-right">{r.ph2}</td>
                              <td className="py-2 text-right font-semibold">{r.ph4}</td>
                              <td className="py-2 text-right text-[#0D7377]">{r.margin}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="mt-2 text-xs text-slate-500">
                        Breakeven: {(s.detail as any).breakeven}
                      </p>
                    </div>
                  )}

                  {'costAvoidance' in s.detail && (
                    <>
                      <div className="overflow-x-auto">
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          Cost Avoidance (100 Families)
                        </h4>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-[#1B2A4A]">
                              <th className="py-2 text-left">Event</th>
                              <th className="py-2 text-right">Unit Cost</th>
                              <th className="py-2 text-right">Volume/Year</th>
                              <th className="py-2 text-right text-emerald-600">Annual Savings</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(s.detail as any).costAvoidance.map((c: any, j: number) => (
                              <tr key={j} className={j % 2 ? 'bg-slate-50' : ''}>
                                <td className="py-2 font-medium">{c.event}</td>
                                <td className="py-2 text-right">{c.unitCost}</td>
                                <td className="py-2 text-right">{c.volume100}</td>
                                <td className="py-2 text-right font-bold text-emerald-600">
                                  {c.savings100}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="rounded-lg bg-[#0D7377]/10 p-3">
                        <h4 className="text-xs font-bold text-[#0D7377] mb-2">
                          Additional Partnership Value
                        </h4>
                        <div className="grid grid-cols-2 gap-1">
                          {(s.detail as any).additionalValue.map((v: string, j: number) => (
                            <p key={j} className="text-xs text-slate-600 flex items-center gap-1">
                              <span className="text-[#0D7377]">+</span> {v}
                            </p>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {'facilityComparison' in s.detail && (
                    <>
                      <div className="overflow-x-auto">
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          Care Setting Cost Comparison
                        </h4>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-[#1B2A4A]">
                              <th className="py-2 text-left">Setting</th>
                              <th className="py-2 text-right">Monthly</th>
                              <th className="py-2 text-right">Annual</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(s.detail as any).facilityComparison.map((f: any, j: number) => (
                              <tr
                                key={j}
                                className={
                                  j === 3
                                    ? 'bg-emerald-50 font-bold text-emerald-800'
                                    : j % 2
                                      ? 'bg-slate-50'
                                      : ''
                                }
                              >
                                <td className="py-2">{f.setting}</td>
                                <td className="py-2 text-right">{f.monthly}</td>
                                <td className="py-2 text-right">{f.annual}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="overflow-x-auto">
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-4 mb-2">
                          CMS Innovation Programs
                        </h4>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-[#1B2A4A]">
                              <th className="py-2 text-left">Program</th>
                              <th className="py-2 text-left">Description</th>
                              <th className="py-2 text-left text-[#0D7377]">
                                co-op.care Opportunity
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(s.detail as any).cmsPrograms.map((p: any, j: number) => (
                              <tr key={j} className={j % 2 ? 'bg-slate-50' : ''}>
                                <td className="py-2 font-bold">{p.program}</td>
                                <td className="py-2 text-slate-600">{p.description}</td>
                                <td className="py-2 text-[#0D7377]">{p.opportunity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {'byPhase' in s.detail && (
                    <>
                      <div className="overflow-x-auto">
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          Community Impact by Phase
                        </h4>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-[#1B2A4A]">
                              <th className="py-2 text-left">Phase</th>
                              <th className="py-2 text-right">Jobs</th>
                              <th className="py-2 text-right">W-2 Wages</th>
                              <th className="py-2 text-right">Econ Impact</th>
                              <th className="py-2 text-right">TimeBank Hrs</th>
                              <th className="py-2 text-right">Aging in Place</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(s.detail as any).byPhase.map((p: any, j: number) => (
                              <tr key={j} className={j % 2 ? 'bg-slate-50' : ''}>
                                <td className="py-2 font-bold">{p.phase}</td>
                                <td className="py-2 text-right">{p.jobs}</td>
                                <td className="py-2 text-right">{p.wages}</td>
                                <td className="py-2 text-right font-semibold text-[#0D7377]">
                                  {p.impact}
                                </td>
                                <td className="py-2 text-right">{p.timebank}</td>
                                <td className="py-2 text-right">{p.agingInPlace}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {(s.detail as any).housingImpact}
                      </p>
                    </>
                  )}

                  {'projections' in s.detail && (
                    <>
                      <div className="overflow-x-auto">
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          Seed Investor Projections ($500K)
                        </h4>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-[#1B2A4A]">
                              <th className="py-2 text-left">Year</th>
                              <th className="py-2 text-right">Revenue</th>
                              <th className="py-2 text-right">Net Income</th>
                              <th className="py-2 text-right">Valuation</th>
                              <th className="py-2 text-right">Seed Value</th>
                              <th className="py-2 text-right text-emerald-600">Multiple</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(s.detail as any).projections.map((p: any, j: number) => (
                              <tr key={j} className={j % 2 ? 'bg-slate-50' : ''}>
                                <td className="py-2 font-bold">{p.year}</td>
                                <td className="py-2 text-right">{p.revenue}</td>
                                <td className="py-2 text-right">{p.netIncome}</td>
                                <td className="py-2 text-right">{p.valuation}</td>
                                <td className="py-2 text-right font-semibold">{p.seedValue}</td>
                                <td className="py-2 text-right font-bold text-emerald-600">
                                  {p.multiple}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="overflow-x-auto mt-4">
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          Comparable Exits
                        </h4>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-[#1B2A4A]">
                              <th className="py-2 text-left">Company</th>
                              <th className="py-2 text-left">Category</th>
                              <th className="py-2 text-right">Multiple</th>
                              <th className="py-2 text-right">Exit Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(s.detail as any).comparables.map((c: any, j: number) => (
                              <tr key={j} className={j % 2 ? 'bg-slate-50' : ''}>
                                <td className="py-2 font-medium">{c.company}</td>
                                <td className="py-2 text-slate-600">{c.category}</td>
                                <td className="py-2 text-right">{c.multiple}</td>
                                <td className="py-2 text-right font-semibold">{c.exitValue}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </Expandable>
            </Reveal>
          ))}
        </div>

        {/* ── JEVONS PARADOX ──────────────────────────────────────── */}
        <Reveal>
          <Expandable
            defaultOpen={false}
            title={
              <div>
                <h2 className="text-xl font-bold text-[#1B2A4A]">
                  The Jevons Paradox: Why Everyone Wins
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  When care becomes cheaper, demand expands — 6x total market growth
                </p>
              </div>
            }
          >
            <div className="space-y-6">
              <p className="text-sm text-slate-700 leading-relaxed">
                The Jevons Paradox (1865) observes that when a resource becomes more efficient to
                use, total consumption increases rather than decreases. Applied to home care: when
                co-op.care reduces the effective cost of care through lower rates, HSA/FSA pre-tax
                payment, and time banking credits, more families enter the market and existing
                families consume more hours.
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-white border-2 border-[#0D7377] p-5 text-center">
                  <p className="text-5xl font-bold text-[#0D7377]">
                    <AnimCounter end={3} suffix="x" />
                  </p>
                  <p className="text-sm text-slate-600 mt-2">More families can afford care</p>
                  <p className="text-xs text-slate-400 mt-1">
                    At $55/hr: 4,000 families. At $24/hr effective: 12,000+
                  </p>
                </div>
                <div className="rounded-xl bg-white border-2 border-[#0D7377] p-5 text-center">
                  <p className="text-5xl font-bold text-[#0D7377]">
                    <AnimCounter end={2} suffix="x" />
                  </p>
                  <p className="text-sm text-slate-600 mt-2">More hours consumed per family</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Families increase from 20 hrs/wk to 35+ hrs/wk at lower cost
                  </p>
                </div>
                <div className="rounded-xl bg-white border-2 border-[#0D7377] p-5 text-center">
                  <p className="text-5xl font-bold text-[#0D7377]">
                    <AnimCounter end={6} suffix="x" />
                  </p>
                  <p className="text-sm text-slate-600 mt-2">Total market expansion</p>
                  <p className="text-xs text-slate-400 mt-1">
                    3x families × 2x hours = 6x addressable market
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                  What This Means for Each Stakeholder
                </h4>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="text-sm text-slate-700">
                    <strong className="text-[#0D7377]">Families:</strong> Care becomes affordable
                    for middle-income families, not just wealthy
                  </div>
                  <div className="text-sm text-slate-700">
                    <strong className="text-[#0D7377]">Caregivers:</strong> 6x more demand = stable
                    employment, not gig uncertainty
                  </div>
                  <div className="text-sm text-slate-700">
                    <strong className="text-[#0D7377]">co-op.care:</strong> TAM expands from $400M
                    to $2.4B in Boulder County alone
                  </div>
                  <div className="text-sm text-slate-700">
                    <strong className="text-[#0D7377]">BCH:</strong> Proactive care at scale
                    prevents exponentially more ER/readmissions
                  </div>
                  <div className="text-sm text-slate-700">
                    <strong className="text-[#0D7377]">CMS:</strong> More aging-in-place = less
                    facility spend at population scale
                  </div>
                  <div className="text-sm text-slate-700">
                    <strong className="text-[#0D7377]">Boulder:</strong> Care economy becomes a
                    major employer, not a hidden cost
                  </div>
                </div>
              </div>
            </div>
          </Expandable>
        </Reveal>

        {/* ── AUTOMATION FLYWHEEL ─────────────────────────────────── */}
        <Reveal>
          <div className="mt-4">
            <Expandable
              defaultOpen={false}
              title={
                <div>
                  <h2 className="text-xl font-bold text-[#1B2A4A]">
                    Automation Flywheel: $200 → $8 per Family
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    96% ops cost reduction through AI-driven automation at scale
                  </p>
                </div>
              }
            >
              <div className="space-y-6">
                <p className="text-sm text-slate-700 leading-relaxed">
                  CareOS automates scheduling, matching, documentation, billing, and quality
                  monitoring. As the platform serves more families, fixed costs are amortized and AI
                  models improve — driving per-family operational costs from $200/month (Phase 1) to
                  $8/month (Phase 4).
                </p>

                <div className="flex items-end justify-between gap-3 h-52 mb-4">
                  {[
                    {
                      phase: 'Phase 1',
                      cost: 200,
                      pct: 100,
                      color: 'from-red-400 to-red-500',
                      tasks: 'Manual scheduling, paper docs, phone calls',
                    },
                    {
                      phase: 'Phase 2',
                      cost: 80,
                      pct: 40,
                      color: 'from-amber-400 to-amber-500',
                      tasks: 'AI matching, digital docs, auto-billing',
                    },
                    {
                      phase: 'Phase 3',
                      cost: 25,
                      pct: 12.5,
                      color: 'from-emerald-400 to-emerald-500',
                      tasks: 'Full automation, exception-only human review',
                    },
                    {
                      phase: 'Phase 4',
                      cost: 8,
                      pct: 4,
                      color: 'from-teal-500 to-teal-600',
                      tasks: 'Platform-level efficiency, near-zero marginal cost',
                    },
                  ].map((p, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center justify-end h-full group"
                    >
                      <p className="text-lg font-bold text-[#1B2A4A] mb-1">${p.cost}</p>
                      <div
                        className={`w-full rounded-t-xl bg-gradient-to-t ${p.color} transition-all group-hover:opacity-80`}
                        style={{ height: `${p.pct}%`, minHeight: '12px' }}
                      />
                      <p className="mt-2 text-xs font-semibold text-slate-700">{p.phase}</p>
                      <p className="text-[10px] text-slate-400 text-center mt-1 leading-tight">
                        {p.tasks}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-[#0D7377]/10 border border-[#0D7377]/20 p-4">
                  <h4 className="text-sm font-bold text-[#0D7377] mb-2">
                    The Margin Transformation
                  </h4>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <p className="text-xs text-slate-500">Phase 1</p>
                      <p className="font-bold text-red-600">-15% net</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Phase 2</p>
                      <p className="font-bold text-amber-600">26% net</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Phase 3</p>
                      <p className="font-bold text-emerald-600">35% net</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Phase 4</p>
                      <p className="font-bold text-[#0D7377]">43% net</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 text-center">
                    Low-margin care service → high-margin technology platform. Same caregivers, same
                    families, dramatically less overhead.
                  </p>
                </div>
              </div>
            </Expandable>
          </div>
        </Reveal>

        {/* Download */}
        <Reveal>
          <div className="mt-12 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-[#1B2A4A] mb-1">
              Full 10-tab Excel Model Available
            </p>
            <p className="text-xs text-slate-400">
              co-op-care-ROI-Model-2026.xlsx — includes formulas, sensitivity analysis, risk matrix,
              and source citations
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Tabs: Summary Dashboard · Family ROI · Caregiver ROI · Physician ROI · P&L · Health
              System · CMS/Taxpayer · Community · Investor · Assumptions
            </p>
          </div>
        </Reveal>

        <footer className="mt-16 border-t border-slate-200 pt-8 text-center">
          <p className="text-sm text-slate-400">
            co-op.care Financial Model · March 2026 · Confidential
          </p>
        </footer>
      </main>
    </div>
  );
}
