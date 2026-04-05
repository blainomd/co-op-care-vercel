import React, { useState, useRef, useEffect } from 'react';
import { C, ff, fs, fm, useIsMobile } from './theme';

const ACCELERATORS = [
  {
    id: 4,
    phase: 1,
    rank: 'High',
    name: 'Discharge Concierge',
    tag: 'Safe Graduation',
    feat: 'Hospital API Integration',
    desc: 'HL7 feed from BCH Epic',
    eng: 'GET /api/hl7/discharge',
    biz: 'Zero CAC acquisition',
    rev: { now: '$364K', y1: '$364K', y3: '$1.2M', drv: 'BCH Readmissions' },
    moat: 'Hospital workflow integration',
    dep: ['Class A License'],
    time: '3 weeks',
    val: '$2M',
  },
  {
    id: 9,
    phase: 1,
    rank: 'Medium',
    name: 'BCH Staff Recruitment',
    tag: 'Provider Pipeline',
    feat: 'CNA Equity Portal',
    desc: 'Subchapter T tracking',
    eng: 'POST /api/equity/grant',
    biz: 'Solves supply side',
    rev: { now: '$0', y1: '$0', y3: '$0', drv: 'N/A' },
    moat: 'Worker ownership',
    dep: [],
    time: '2 weeks',
    val: '$1M',
  },
  {
    id: 12,
    phase: 1,
    rank: 'Critical',
    name: 'Respite Emergency Fund',
    tag: 'Crisis Catch',
    feat: '48hr SLA Engine',
    desc: 'Automated dispatch',
    eng: 'POST /api/dispatch/emergency',
    biz: 'Converts crisis to membership',
    rev: { now: '$0', y1: '$50K', y3: '$200K', drv: 'Conversion Rate' },
    moat: 'Community trust',
    dep: ['Time Bank Core'],
    time: '4 weeks',
    val: '$3M',
  },

  {
    id: 3,
    phase: 2,
    rank: 'Critical',
    name: 'Self-Serve CII Portal',
    tag: 'Lead Gen',
    feat: '12-Factor Assessment',
    desc: 'Dynamic scoring algorithm',
    eng: 'POST /api/assess/cii',
    biz: 'B2B2C distribution',
    rev: { now: '$0', y1: '$93K', y3: '$500K', drv: 'PEPM' },
    moat: 'Proprietary data asset',
    dep: [],
    time: '2 weeks',
    val: '$5M',
  },
  {
    id: 6,
    phase: 2,
    rank: 'High',
    name: 'Conductor Certification',
    tag: 'Upskilling',
    feat: 'LMS Integration',
    desc: 'Module tracking & badges',
    eng: 'GET /api/lms/progress',
    biz: 'New revenue line + better care',
    rev: { now: '$0', y1: '$120K', y3: '$400K', drv: 'Course Fees' },
    moat: 'Credentialing authority',
    dep: [],
    time: '6 weeks',
    val: '$2M',
  },
  {
    id: 13,
    phase: 2,
    rank: 'Medium',
    name: 'Dementia Workshops',
    tag: 'Community',
    feat: 'Event Booking',
    desc: 'Capacity management',
    eng: 'POST /api/events/book',
    biz: 'Top of funnel',
    rev: { now: '$0', y1: '$40K', y3: '$150K', drv: 'Ticket Sales' },
    moat: 'Local presence',
    dep: [],
    time: '1 week',
    val: '$1M',
  },
  {
    id: 15,
    phase: 2,
    rank: 'High',
    name: 'Corporate Bundle',
    tag: 'B2B Sales',
    feat: 'Employer Dashboard',
    desc: 'Aggregate reporting',
    eng: 'GET /api/b2b/reports',
    biz: 'Wholesale acquisition',
    rev: { now: '$0', y1: '$2.4M', y3: '$8M', drv: 'Enterprise Contracts' },
    moat: 'Switching costs',
    dep: ['Self-Serve CII Portal'],
    time: '8 weeks',
    val: '$10M',
  },

  {
    id: 1,
    phase: 3,
    rank: 'Critical',
    name: 'LMN Marketplace',
    tag: 'Tax Moat',
    feat: 'HSA/FSA Gateway',
    desc: 'Automated LMN generation',
    eng: 'POST /api/lmn/generate',
    biz: '28-36% price advantage',
    rev: { now: '$0', y1: '$0', y3: '$1.2M', drv: 'Marketplace Take' },
    moat: 'IRS Pub 502 compliance',
    dep: ['Medical Director'],
    time: '10 weeks',
    val: '$15M',
  },
  {
    id: 2,
    phase: 3,
    rank: 'High',
    name: 'Annual LMN Renewal',
    tag: 'Retention',
    feat: 'Subscription Engine',
    desc: 'Automated telehealth scheduling',
    eng: 'POST /api/telehealth/book',
    biz: 'Recurring high-margin revenue',
    rev: { now: '$0', y1: '$0', y3: '$800K', drv: 'Renewal Rate' },
    moat: 'Lock-in',
    dep: ['LMN Marketplace'],
    time: '3 weeks',
    val: '$4M',
  },
  {
    id: 7,
    phase: 3,
    rank: 'Medium',
    name: 'Faith Community Hubs',
    tag: 'Distribution',
    feat: 'Group Time Bank',
    desc: 'Organization-level credits',
    eng: 'PUT /api/timebank/org',
    biz: 'Viral node activation',
    rev: { now: '$0', y1: '$0', y3: '$0', drv: 'N/A' },
    moat: 'Network effects',
    dep: ['Time Bank Core'],
    time: '4 weeks',
    val: '$2M',
  },
  {
    id: 14,
    phase: 3,
    rank: 'Medium',
    name: 'Home Safety Mods',
    tag: 'Ecosystem',
    feat: 'Vendor API',
    desc: 'Contractor dispatch',
    eng: 'POST /api/vendor/dispatch',
    biz: 'Affiliate revenue',
    rev: { now: '$0', y1: '$0', y3: '$300K', drv: 'Referral Fees' },
    moat: 'Full-stack service',
    dep: [],
    time: '5 weeks',
    val: '$1M',
  },
  {
    id: 17,
    phase: 3,
    rank: 'High',
    name: "Conductor's Playbook",
    tag: 'Content',
    feat: 'CMS Headless',
    desc: 'SEO-optimized articles',
    eng: 'GET /api/cms/articles',
    biz: 'Organic acquisition',
    rev: { now: '$0', y1: '$0', y3: '$0', drv: 'Traffic' },
    moat: 'Brand authority',
    dep: [],
    time: '2 weeks',
    val: '$2M',
  },

  {
    id: 10,
    phase: 4,
    rank: 'Critical',
    name: 'Wearable Integration',
    tag: 'Data Advantage',
    feat: 'Apple Health API',
    desc: 'Continuous vital monitoring',
    eng: 'POST /api/healthkit/sync',
    biz: 'Predictive care',
    rev: { now: '$0', y1: '$0', y3: '$0', drv: 'N/A' },
    moat: 'Proprietary dataset',
    dep: [],
    time: '12 weeks',
    val: '$20M',
  },
  {
    id: 11,
    phase: 4,
    rank: 'High',
    name: 'Predictive Hospitalization',
    tag: 'AI Model',
    feat: 'Risk Scoring',
    desc: 'ML anomaly detection',
    eng: 'GET /api/ml/risk-score',
    biz: 'Reduces PACE costs',
    rev: { now: '$0', y1: '$0', y3: '$1.25M', drv: 'Shared Savings' },
    moat: 'Algorithm performance',
    dep: ['Wearable Integration'],
    time: '16 weeks',
    val: '$25M',
  },
  {
    id: 8,
    phase: 4,
    rank: 'Medium',
    name: 'CU Clinical Pipeline',
    tag: 'Research',
    feat: 'De-identified Export',
    desc: 'HIPAA-compliant data dump',
    eng: 'GET /api/data/export',
    biz: 'Academic partnerships',
    rev: { now: '$0', y1: '$0', y3: '$200K', drv: 'Grants' },
    moat: 'Validation',
    dep: [],
    time: '4 weeks',
    val: '$3M',
  },
  {
    id: 16,
    phase: 4,
    rank: 'Medium',
    name: 'Bridge-to-Medicaid',
    tag: 'Financial',
    feat: 'Spend-down Tracker',
    desc: 'Asset depletion calculation',
    eng: 'GET /api/finance/spend-down',
    biz: 'Retains PACE pipeline',
    rev: { now: '$0', y1: '$0', y3: '$0', drv: 'N/A' },
    moat: 'Financial advisory',
    dep: [],
    time: '6 weeks',
    val: '$2M',
  },

  {
    id: 20,
    phase: 5,
    rank: 'Critical',
    name: 'ACL Caregiver AI Prize',
    tag: 'Federal Validation',
    feat: 'Grant Reporting',
    desc: 'Automated outcome metrics',
    eng: 'GET /api/reports/acl',
    biz: 'Non-dilutive capital',
    rev: { now: '$0', y1: '$0', y3: '$2M', drv: 'Prize Money' },
    moat: 'Federal recognition',
    dep: ['Predictive Hospitalization'],
    time: '4 weeks',
    val: '$10M',
  },
  {
    id: 5,
    phase: 5,
    rank: 'High',
    name: 'Comfort Card (Pilot)',
    tag: 'Fintech',
    feat: 'Auto-Substantiation Engine',
    desc: 'Stripe Issuing + IRS Receipt Gen',
    eng: 'POST /api/stripe/issue-card',
    biz: 'Bypasses HSA bureaucracy',
    rev: { now: '$0', y1: '$0', y3: '$500K', drv: 'Interchange' },
    moat: 'Payment infrastructure',
    dep: ['LMN Marketplace'],
    time: '14 weeks',
    val: '$15M',
  },

  {
    id: 19,
    phase: 6,
    rank: 'Critical',
    name: 'Age at Home Insurance',
    tag: 'The Endgame',
    feat: 'Actuarial Engine',
    desc: 'Pricing & underwriting',
    eng: 'POST /api/insurance/quote',
    biz: 'Category creation',
    rev: { now: '$0', y1: '$0', y3: '$18.3M', drv: 'Premiums' },
    moat: 'Regulatory approval',
    dep: ['Predictive Hospitalization'],
    time: '24 weeks',
    val: '$100M+',
  },
  {
    id: 18,
    phase: 6,
    rank: 'High',
    name: 'Federation Playbook',
    tag: 'Scale',
    feat: 'Multi-tenant Architecture',
    desc: 'Instance provisioning',
    eng: 'POST /api/tenant/create',
    biz: 'National expansion',
    rev: { now: '$0', y1: '$0', y3: '$5M', drv: 'Franchise Fees' },
    moat: 'Platform scale',
    dep: [],
    time: '20 weeks',
    val: '$50M',
  },
];

const PHASES = [
  {
    id: 0,
    name: 'All',
    stats: ['20 Accelerators', '46 Features', '6 Biz Model Shifts', '$75-150M+ Valuation'],
    script:
      "This is the complete product strategy map for co-op.care. We're building a worker-owned home care cooperative that scales through community economics and tax-advantaged wellness. This map shows exactly how we get from our first hospital discharge to a national federation and a new category of insurance.",
  },
  {
    id: 1,
    name: 'Phase 1: BCH',
    stats: ['3 Accelerators', '7 Features', '$364K Y1 Revenue', '$0 Acquisition Cost'],
    script:
      'Phase 1 is about proving the model at the point of crisis. We partner with Boulder Community Health to catch families at discharge. The Discharge Concierge API integrates with Epic, allowing us to assemble a care team within 24 hours. This gives us zero-cost acquisition and immediate revenue.',
  },
  {
    id: 2,
    name: 'Phase 2: BVSD',
    stats: ['4 Accelerators', '9 Features', '$2.4M Y2 Revenue', 'Sales Cycle: Days'],
    script:
      'Phase 2 shifts to B2B2C. We sell to employers like the Boulder Valley School District. The Self-Serve CII Portal lets employees assess their caregiving burden, generating qualified leads for our Conductor Certification and Corporate Bundles. This is wholesale acquisition.',
  },
  {
    id: 3,
    name: 'Phase 3: Wellness',
    stats: ['5 Accelerators', '11 Features', '$6.4M BREAKEVEN', '28-36% Tax Moat'],
    script:
      'Phase 3 builds the moat. The LMN Marketplace allows our Medical Director to make community wellness programs HSA and FSA eligible. This saves families 30% and locks them into our ecosystem. If they leave the co-op, they lose the tax advantage.',
  },
  {
    id: 4,
    name: 'Phase 4: PACE',
    stats: ['4 Accelerators', '9 Features', '$1.25M PACE Rev', 'Daily Data Advantage'],
    script:
      'Phase 4 is the margin engine. We integrate with TRU PACE, taking sub-capitation risk. By combining wearable data with our Time Bank neighbors, we can predict and prevent hospitalizations, capturing the shared savings.',
  },
  {
    id: 5,
    name: 'Phase 5: LEAD',
    stats: ['2 Accelerators', '5 Features', '$11.2M Y4 Revenue', '10 Year Horizon'],
    script:
      'Phase 5 targets federal revenue. We position for the ACL Caregiver AI Prize and CMS initiatives. The Comfort Card pilot launches, capturing the full wallet share of care spending through a single fintech interface.',
  },
  {
    id: 6,
    name: 'Phase 6: Insurance',
    stats: ['3 Accelerators', '8 Features', '$18.3M Y5 Revenue', '50 Metro Target'],
    script:
      "Phase 6 is the endgame. We launch Age at Home Insurance, a product 40% cheaper than traditional long-term care insurance because it's backed by a Time Bank. And we open the Federation Playbook, scaling the software to 50 metros.",
  },
];

export default function ProductMap() {
  const isMobile = useIsMobile();
  const [activePhase, setActivePhase] = useState(0);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [valToggle, setValToggle] = useState(false);
  const [emailPath, setEmailPath] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', note: '' });
  const [copiedApi, setCopiedApi] = useState<number | null>(null);

  const handleCopyApi = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedApi(id);
    setTimeout(() => setCopiedApi(null), 2000);
  };

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const handlePlay = () => {
    if (!synthRef.current) return;
    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
    } else {
      const text = PHASES[activePhase]!.script;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = playbackRate;
      utterance.onend = () => setIsPlaying(false);
      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleRateChange = () => {
    const rates = [1, 1.25, 1.5, 2];
    const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length] ?? 1;
    setPlaybackRate(next);
    if (isPlaying && synthRef.current) {
      synthRef.current.cancel();
      const text = PHASES[activePhase]!.script;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = next;
      utterance.onend = () => setIsPlaying(false);
      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    }
  };

  const filteredAccels = ACCELERATORS.filter((a) => {
    if (activePhase !== 0 && a.phase !== activePhase) return false;
    if (priorityFilter && a.rank !== priorityFilter) return false;
    return true;
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = 'Product Strategy Inquiry';
    const body = `Name: ${form.name}%0AEmail: ${form.email}%0A${form.note ? `Note: ${form.note}` : ''}`;
    window.location.href = `mailto:blaine@co-op.care?subject=${subject}&body=${body}`;
    setEmailPath(null);
  };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', animation: 'fadeUp 0.3s ease-out' }}>
      {/* Header */}
      <header
        style={{
          background: C.dark,
          color: C.w,
          padding: isMobile ? '48px 24px' : '64px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: C.sage,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 16,
            fontFamily: fs,
          }}
        >
          Product Strategy Map
        </div>
        <h1
          style={{
            fontFamily: ff,
            fontSize: isMobile ? 32 : 48,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          The Path to $100M+
        </h1>
        <p
          style={{
            fontFamily: fs,
            fontSize: 16,
            color: C.t4,
            maxWidth: 600,
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Every business model shift grounded in product features, revenue, and enterprise value.
        </p>
      </header>

      {/* Filters & Stats */}
      <div
        style={{
          position: 'sticky',
          top: 48,
          zIndex: 99,
          background: `${C.bg}ee`,
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${C.border}`,
          padding: '16px 24px',
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 16,
              marginBottom: 16,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            {PHASES.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setActivePhase(i);
                  if (isPlaying) handlePlay();
                }}
                style={{
                  background: activePhase === i ? C.sage : 'transparent',
                  color: activePhase === i ? C.w : C.t2,
                  border: `1px solid ${activePhase === i ? C.sage : C.border}`,
                  padding: '8px 16px',
                  borderRadius: 20,
                  fontFamily: fs,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: 16,
            }}
          >
            {PHASES[activePhase]!.stats.map((stat, i) => (
              <div
                key={i}
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  padding: 16,
                  borderRadius: 8,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: ff,
                    fontSize: isMobile ? 16 : 20,
                    fontWeight: 700,
                    color: C.sage,
                    marginBottom: 4,
                  }}
                >
                  {stat}
                </div>
                <div
                  style={{
                    fontFamily: fs,
                    fontSize: 11,
                    color: C.t3,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Metric {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        {/* Controls */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 8,
              background: C.card,
              padding: 8,
              borderRadius: 8,
              border: `1px solid ${C.border}`,
            }}
          >
            {['Critical', 'High', 'Medium'].map((rank) => (
              <button
                key={rank}
                onClick={() => setPriorityFilter(priorityFilter === rank ? null : rank)}
                style={{
                  background: priorityFilter === rank ? C.dark : 'transparent',
                  color: priorityFilter === rank ? C.w : C.t2,
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 4,
                  fontFamily: fs,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {rank}
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              background: C.card,
              padding: '8px 16px',
              borderRadius: 8,
              border: `1px solid ${C.border}`,
            }}
          >
            <button
              onClick={handlePlay}
              style={{
                background: C.sage,
                color: C.w,
                border: 'none',
                width: 32,
                height: 32,
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontFamily: fs,
                fontWeight: 700,
              }}
            >
              {isPlaying ? '■' : '▶'}
            </button>
            <span style={{ fontFamily: fs, fontSize: 13, fontWeight: 600, color: C.t1 }}>
              Founder Narration
            </span>
            <button
              onClick={handleRateChange}
              style={{
                background: 'transparent',
                border: `1px solid ${C.border}`,
                color: C.t2,
                padding: '4px 8px',
                borderRadius: 4,
                fontFamily: fs,
                fontSize: 11,
                cursor: 'pointer',
                marginLeft: 8,
              }}
            >
              {playbackRate}x
            </button>
          </div>

          <button
            onClick={() => setValToggle(!valToggle)}
            style={{
              background: valToggle ? C.copper : 'transparent',
              color: valToggle ? C.w : C.copper,
              border: `1px solid ${C.copper}`,
              padding: '8px 16px',
              borderRadius: 8,
              fontFamily: fs,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {valToggle ? 'Hide Valuation Trajectory' : 'Show Valuation Trajectory'}
          </button>
        </div>

        {valToggle && (
          <div
            style={{
              background: C.copperBg,
              border: `1px solid ${C.copperLt}`,
              padding: 24,
              borderRadius: 8,
              marginBottom: 32,
              animation: 'fadeUp 0.3s ease-out',
            }}
          >
            <h3
              style={{
                fontFamily: ff,
                fontSize: 18,
                fontWeight: 600,
                color: C.copper,
                marginBottom: 16,
              }}
            >
              Enterprise Value Trajectory
            </h3>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                height: 100,
                borderBottom: `1px solid ${C.copper}`,
                paddingBottom: 8,
              }}
            >
              {[
                { p: 'P1', v: '$1M', h: 20 },
                { p: 'P2', v: '$5M', h: 40 },
                { p: 'P3', v: '$15M', h: 60 },
                { p: 'P4', v: '$30M', h: 80 },
                { p: 'P6', v: '$100M+', h: 100 },
              ].map((bar, i) => (
                <div
                  key={i}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                >
                  <div style={{ fontFamily: fs, fontSize: 12, fontWeight: 700, color: C.copper }}>
                    {bar.v}
                  </div>
                  <div
                    style={{
                      width: 40,
                      height: bar.h,
                      background: C.copper,
                      borderRadius: '4px 4px 0 0',
                      opacity: 0.8,
                    }}
                  />
                  <div style={{ fontFamily: fs, fontSize: 11, color: C.t2 }}>{bar.p}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard Preview */}
        {activePhase !== 0 && (
          <div
            style={{
              background: '#1E1E1E',
              borderRadius: 8,
              padding: 24,
              marginBottom: 32,
              overflowX: 'auto',
              borderLeft: `4px solid ${C.sage}`,
            }}
          >
            <div
              style={{
                fontFamily: fs,
                fontSize: 11,
                color: C.sage,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 16,
              }}
            >
              Phase {activePhase} UX Preview
            </div>
            <pre
              style={{
                fontFamily: fm,
                fontSize: 12,
                color: '#D4CFC5',
                margin: 0,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
              }}
            >
              {activePhase === 1 &&
                `> SYSTEM: HL7 Feed Connected [BCH Epic]\n> ALERT: Discharge pending for Patient #8842\n> ACTION: Assembling Care Team...\n  [✓] RN Sarah K. (Admit assessment)\n  [✓] Maria G. (Personal care - 4hrs/day)\n  [✓] Time Bank: Meals requested for 3 days\n> STATUS: Safe Graduation Protocol Active`}
              {activePhase === 2 &&
                `> B2B DASHBOARD: Boulder Valley School District\n> METRICS:\n  - 342 employees completed CII\n  - 84 in RED ZONE (High Burden)\n  - 12 Conductor Certifications in progress\n> IMPACT:\n  - Est. Productivity Saved: $142,000\n  - Est. Absenteeism Avoided: 412 days`}
              {activePhase === 3 &&
                `> LMN MARKETPLACE ENGINE\n> USER: Chen Family\n> GENERATING LMN...\n  - Condition: Fall Risk (ICD-10: Z91.81)\n  - Rx: Tai Chi (JCC Boulder)\n  - Status: Signed by Dr. Emdur\n> TAX IMPACT: $15/class now HSA eligible`}
              {activePhase === 4 &&
                `> PACE RISK ENGINE\n> ENROLLEE: Torres, M.\n> ALERTS:\n  [!] Apple Watch: HRV dropped 15% over 48h\n  [!] Time Bank: Neighbor reported "seems confused"\n> PREDICTION: 78% risk of UTI / Hospitalization\n> INTERVENTION: Dispatching RN Sarah K. for UA`}
              {activePhase === 5 &&
                `> COMFORT CARD LEDGER\n> TRANSACTION: $120.00 (Sarah Kim RD)\n> ROUTING:\n  - Checking HSA balance... [$450 available]\n  - Verifying LMN... [Valid through 12/2026]\n  - Approving transaction via Stripe Issuing\n> SUBSTANTIATION: IRS-compliant receipt auto-generated.\n> RESULT: $0 out-of-pocket, 0 reimbursement forms.`}
              {activePhase === 6 &&
                `> ACTUARIAL ENGINE: Age at Home\n> QUOTE GENERATION:\n  - Base Risk Premium: $140/mo\n  - Conductor Discount: -$30/mo\n  - Time Bank Commitment (4hrs/wk): -$45/mo\n> FINAL PREMIUM: $65/mo\n> STATUS: 42% cheaper than market average`}
            </pre>
          </div>
        )}

        {/* Accelerators Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredAccels.map((a, i) => (
            <div
              key={i}
              style={{
                background: C.card,
                border: `1px solid ${expandedCard === a.id ? C.sage : C.border}`,
                borderRadius: 8,
                overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                onClick={() => setExpandedCard(expandedCard === a.id ? null : a.id)}
                style={{
                  padding: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: expandedCard === a.id ? C.sageBg : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: fs,
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.t2,
                    }}
                  >
                    {a.id}
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span
                        style={{
                          fontFamily: fs,
                          fontSize: 10,
                          fontWeight: 700,
                          color: C.w,
                          background:
                            a.rank === 'Critical' ? C.red : a.rank === 'High' ? C.copper : C.stone,
                          padding: '2px 6px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                        }}
                      >
                        {a.rank}
                      </span>
                      <span style={{ fontFamily: fs, fontSize: 11, color: C.t3 }}>
                        Phase {a.phase}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontFamily: ff,
                        fontSize: 18,
                        fontWeight: 600,
                        color: C.t1,
                        margin: 0,
                      }}
                    >
                      {a.name}
                    </h3>
                  </div>
                </div>
                <div style={{ color: C.t3 }}>{expandedCard === a.id ? '▴' : '▾'}</div>
              </div>

              {expandedCard === a.id && (
                <div
                  style={{
                    padding: 24,
                    borderTop: `1px solid ${C.border}`,
                    animation: 'fadeUp 0.3s ease-out',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                      gap: 24,
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          fontFamily: fs,
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.t3,
                          textTransform: 'uppercase',
                          marginBottom: 8,
                        }}
                      >
                        Product Feature
                      </h4>
                      <div
                        style={{
                          fontFamily: fs,
                          fontSize: 14,
                          fontWeight: 600,
                          color: C.t1,
                          marginBottom: 4,
                        }}
                      >
                        {a.feat}
                      </div>
                      <div style={{ fontFamily: fs, fontSize: 13, color: C.t2, marginBottom: 8 }}>
                        {a.desc}
                      </div>
                      <div
                        onClick={() => handleCopyApi(a.eng, a.id)}
                        style={{
                          fontFamily: fm,
                          fontSize: 11,
                          background: copiedApi === a.id ? C.sage : C.bg,
                          padding: '4px 8px',
                          borderRadius: 4,
                          color: copiedApi === a.id ? C.w : C.sageD,
                          display: 'inline-block',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        title="Click to copy API endpoint"
                      >
                        {copiedApi === a.id ? '✓ Copied' : a.eng}
                      </div>
                    </div>
                    <div>
                      <h4
                        style={{
                          fontFamily: fs,
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.t3,
                          textTransform: 'uppercase',
                          marginBottom: 8,
                        }}
                      >
                        Business Model Impact
                      </h4>
                      <div style={{ fontFamily: fs, fontSize: 14, color: C.t2, marginBottom: 12 }}>
                        {a.biz}
                      </div>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <div>
                          <div style={{ fontFamily: fs, fontSize: 10, color: C.t3 }}>Y1 Rev</div>
                          <div
                            style={{ fontFamily: ff, fontSize: 16, fontWeight: 600, color: C.sage }}
                          >
                            {a.rev.y1}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontFamily: fs, fontSize: 10, color: C.t3 }}>Y3 Rev</div>
                          <div
                            style={{ fontFamily: ff, fontSize: 16, fontWeight: 600, color: C.sage }}
                          >
                            {a.rev.y3}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 24,
                      paddingTop: 16,
                      borderTop: `1px solid ${C.border}`,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 24,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: fs,
                          fontSize: 11,
                          color: C.t3,
                          display: 'block',
                          marginBottom: 4,
                        }}
                      >
                        Moat Contribution
                      </span>
                      <span style={{ fontFamily: fs, fontSize: 13, fontWeight: 500, color: C.t1 }}>
                        {a.moat}
                      </span>
                    </div>
                    <div>
                      <span
                        style={{
                          fontFamily: fs,
                          fontSize: 11,
                          color: C.t3,
                          display: 'block',
                          marginBottom: 4,
                        }}
                      >
                        Dependencies
                      </span>
                      <span style={{ fontFamily: fs, fontSize: 13, fontWeight: 500, color: C.t1 }}>
                        {a.dep.length ? a.dep.join(', ') : 'None'}
                      </span>
                    </div>
                    <div>
                      <span
                        style={{
                          fontFamily: fs,
                          fontSize: 11,
                          color: C.t3,
                          display: 'block',
                          marginBottom: 4,
                        }}
                      >
                        Build Time
                      </span>
                      <span style={{ fontFamily: fs, fontSize: 13, fontWeight: 500, color: C.t1 }}>
                        {a.time}
                      </span>
                    </div>
                    <div>
                      <span
                        style={{
                          fontFamily: fs,
                          fontSize: 11,
                          color: C.t3,
                          display: 'block',
                          marginBottom: 4,
                        }}
                      >
                        Value Created
                      </span>
                      <span
                        style={{ fontFamily: fs, fontSize: 13, fontWeight: 700, color: C.copper }}
                      >
                        {a.val}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Valuation Trajectory */}
      <section style={{ maxWidth: 1000, margin: '64px auto', padding: '0 24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: C.sage,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 8,
                fontFamily: fs,
              }}
            >
              Enterprise Value
            </div>
            <h2 style={{ fontFamily: ff, fontSize: 28, fontWeight: 700, color: C.t1, margin: 0 }}>
              Valuation Trajectory
            </h2>
          </div>
          <button
            onClick={() => setValToggle(!valToggle)}
            style={{
              background: 'transparent',
              border: `1px solid ${C.border}`,
              padding: '8px 16px',
              borderRadius: 20,
              fontFamily: fs,
              fontSize: 12,
              fontWeight: 600,
              color: C.t2,
              cursor: 'pointer',
            }}
          >
            {valToggle ? 'Show Revenue' : 'Show Valuation'}
          </button>
        </div>

        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: 32,
            overflowX: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 8,
              minWidth: 600,
              height: 200,
              paddingBottom: 24,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            {[
              { p: 1, val: 6, rev: 0.36, label: 'Seed' },
              { p: 2, val: 15, rev: 2.4, label: 'Series A' },
              { p: 3, val: 30, rev: 6.4, label: 'Series B' },
              { p: 4, val: 50, rev: 8.2, label: 'Growth' },
              { p: 5, val: 80, rev: 11.2, label: 'Scale' },
              { p: 6, val: 150, rev: 18.3, label: 'Exit' },
            ].map((v, i) => {
              const height = valToggle ? (v.rev / 20) * 100 : (v.val / 150) * 100;
              const displayValue = valToggle ? `$${v.rev}M` : `$${v.val}M`;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div style={{ fontFamily: fm, fontSize: 11, color: C.t3, fontWeight: 600 }}>
                    {displayValue}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 60,
                      height: `${Math.max(10, height)}%`,
                      background: activePhase === 0 || activePhase === v.p ? C.sage : C.border,
                      borderRadius: '4px 4px 0 0',
                      transition: 'all 0.5s ease',
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, minWidth: 600, paddingTop: 16 }}>
            {['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5', 'Phase 6'].map((p, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontFamily: fs,
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.t2,
                }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email Capture */}
      <section
        style={{
          background: C.dark,
          padding: '64px 24px',
          color: C.w,
          textAlign: 'center',
          marginTop: 64,
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: ff, fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
            Want to dig deeper into the model?
          </h2>
          {!emailPath ? (
            <button
              onClick={() => setEmailPath('investor')}
              style={{
                background: C.sage,
                color: C.w,
                border: 'none',
                padding: '16px 32px',
                borderRadius: 8,
                fontFamily: fs,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Request the Full Data Room
            </button>
          ) : (
            <form
              onSubmit={handleEmailSubmit}
              style={{ textAlign: 'left', animation: 'fadeUp 0.3s ease-out' }}
            >
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontFamily: fs, fontSize: 13, marginBottom: 8 }}>
                  Name
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 4,
                    border: 'none',
                    fontFamily: fs,
                  }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontFamily: fs, fontSize: 13, marginBottom: 8 }}>
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 4,
                    border: 'none',
                    fontFamily: fs,
                  }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontFamily: fs, fontSize: 13, marginBottom: 8 }}>
                  Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 4,
                    border: 'none',
                    fontFamily: fs,
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <button
                  type="button"
                  onClick={() => setEmailPath(null)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    color: C.w,
                    border: `1px solid ${C.w}`,
                    padding: 12,
                    borderRadius: 4,
                    fontFamily: fs,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    background: C.sage,
                    color: C.w,
                    border: 'none',
                    padding: 12,
                    borderRadius: 4,
                    fontFamily: fs,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Send Request
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Phase-Reactive Footer */}
      <footer
        style={{
          background: C.dk2,
          padding: '48px 24px',
          color: C.t4,
          borderTop: `4px solid ${activePhase === 0 ? C.sage : activePhase === 1 ? C.blue : activePhase === 2 ? C.copper : activePhase === 3 ? C.rose : activePhase === 4 ? C.gold : activePhase === 5 ? C.purple : C.sage}`,
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ fontFamily: ff, fontSize: 20, color: C.w, marginBottom: 16 }}>
            Why Phase {activePhase === 0 ? '1-6' : activePhase} Matters
          </div>
          <p style={{ fontFamily: fs, fontSize: 14, lineHeight: 1.6, maxWidth: 600 }}>
            {activePhase === 0 &&
              'The full roadmap demonstrates how we move from a localized service business to a national platform and financial product. Every phase funds the next.'}
            {activePhase === 1 &&
              'Hospital discharges are the highest-intent moment in healthcare. By solving the discharge bottleneck for BCH, we acquire customers at zero CAC while proving our clinical reliability.'}
            {activePhase === 2 &&
              'B2B distribution changes the math. Instead of fighting for individual families on Google, we acquire them in blocks of 1,000 through their employers, framed as a productivity benefit.'}
            {activePhase === 3 &&
              "The LMN is our strongest retention tool. By making community wellness tax-advantaged, we embed ourselves into the family's financial life. Switching to a competitor means a 30% price hike."}
            {activePhase === 4 &&
              'PACE sub-capitation proves we can manage risk. This is where our data advantage (wearables + Time Bank observations) turns into hard margin through shared savings.'}
            {activePhase === 5 &&
              'Federal validation through the ACL Prize and LEAD/CARA programs provides non-dilutive capital and establishes co-op.care as the gold standard for caregiver support.'}
            {activePhase === 6 &&
              'Insurance is the endgame. By using the Time Bank to lower the cost of care delivery, we can underwrite a product that is fundamentally cheaper than anything on the market.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
