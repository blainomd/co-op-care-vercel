import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { fontLinks } from './design-tokens';

// ─── Interfaces ──────────────────────────────────────────────

interface Patient {
  name: string;
  age: number;
  protocol: string;
  provider: string;
  location: string;
  since: string;
  nextLab: string;
  nextVisit: string;
}

interface LabResult {
  date: string;
  totalT: number;
  freeT: number;
  estradiol: number;
  shbg: number;
  hct: number;
  psa: number;
  ldl: number;
  hdl: number;
  hba1c: number;
  tsh: number;
  weight: number;
  bp: string;
}

interface Symptom {
  name: string;
  scores: [number, number, number];
  optimal: number;
}

interface ProtocolMed {
  med: string;
  dose: string;
  route: string;
  status: string;
  since: string;
  adjusted: string;
}

interface AIInsight {
  type: 'positive' | 'watch' | 'action';
  title: string;
  detail: string;
  icon: string;
}

interface AccessEligible {
  condition: string;
  measure: string;
  status: string;
  eligible: boolean;
}

interface Tab {
  id: string;
  label: string;
}

interface HeroStat {
  label: string;
  value: string;
  unit: string;
  prev: number;
  color: string;
  trend: string;
}

interface BiomarkerRow {
  name: string;
  values: number[];
  unit: string;
  range: string;
  color: string;
}

interface Recommendation {
  rec: string;
  status: 'keep' | 'adjust' | 'add' | 'monitor';
}

// ─── Color palette ───────────────────────────────────────────

interface Palette {
  bg: string;
  surface: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  dim: string;
  teal: string;
  gold: string;
  coral: string;
  blue: string;
  purple: string;
}

// ─── SVG icon helpers (no emojis) ────────────────────────────

function CheckIcon(): ReactNode {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      style={{ display: 'inline', verticalAlign: 'middle' }}
    >
      <circle cx="8" cy="8" r="7" fill="#2dd4a822" stroke="#2dd4a8" strokeWidth="1.2" />
      <path
        d="M5 8.5L7 10.5L11 6"
        stroke="#2dd4a8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrendDownIcon(): ReactNode {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      style={{ display: 'inline', verticalAlign: 'middle' }}
    >
      <path
        d="M3 4L8 10L13 4"
        stroke="#2dd4a8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarningIcon(): ReactNode {
  return <span style={{ fontWeight: 800, fontSize: '13px', color: '#f4a261' }}>!</span>;
}

function MonitorIcon(): ReactNode {
  return (
    <span style={{ fontWeight: 700, fontSize: '11px', color: '#f4a261', letterSpacing: '0.5px' }}>
      MON
    </span>
  );
}

function HctIcon(): ReactNode {
  return (
    <span style={{ fontWeight: 700, fontSize: '11px', color: '#ef6461', letterSpacing: '0.5px' }}>
      HCT
    </span>
  );
}

function AiIcon(): ReactNode {
  return (
    <span style={{ fontWeight: 800, fontSize: '13px', color: '#4a9eff', letterSpacing: '0.5px' }}>
      AI
    </span>
  );
}

// ─── Data ────────────────────────────────────────────────────

const PATIENT: Patient = {
  name: 'Marcus Rivera',
  age: 54,
  protocol: 'TRT + Metabolic Optimization',
  provider: 'Dr. Rand McClain, DO',
  location: 'Santa Monica',
  since: 'Sep 2025',
  nextLab: 'Apr 8, 2026',
  nextVisit: 'Apr 15, 2026',
};

const LAB_HISTORY: LabResult[] = [
  {
    date: 'Mar 2026',
    totalT: 785,
    freeT: 22.1,
    estradiol: 28,
    shbg: 32,
    hct: 47.2,
    psa: 0.9,
    ldl: 108,
    hdl: 52,
    hba1c: 5.4,
    tsh: 2.1,
    weight: 198,
    bp: '128/82',
  },
  {
    date: 'Dec 2025',
    totalT: 620,
    freeT: 18.4,
    estradiol: 35,
    shbg: 28,
    hct: 46.8,
    psa: 0.8,
    ldl: 122,
    hdl: 48,
    hba1c: 5.6,
    tsh: 2.3,
    weight: 205,
    bp: '134/86',
  },
  {
    date: 'Sep 2025',
    totalT: 285,
    freeT: 8.2,
    estradiol: 42,
    shbg: 24,
    hct: 44.1,
    psa: 0.7,
    ldl: 138,
    hdl: 44,
    hba1c: 5.8,
    tsh: 2.5,
    weight: 212,
    bp: '142/90',
  },
];

const SYMPTOMS: Symptom[] = [
  { name: 'Energy', scores: [3, 6, 8], optimal: 8 },
  { name: 'Libido', scores: [2, 5, 7], optimal: 8 },
  { name: 'Sleep', scores: [4, 6, 7], optimal: 8 },
  { name: 'Mood', scores: [4, 7, 8], optimal: 8 },
  { name: 'Body Comp', scores: [3, 5, 7], optimal: 8 },
  { name: 'Mental Clarity', scores: [5, 7, 8], optimal: 8 },
];

const PROTOCOL: ProtocolMed[] = [
  {
    med: 'Testosterone Cypionate',
    dose: '160mg/week',
    route: 'IM injection (split 2x/week)',
    status: 'active',
    since: 'Sep 2025',
    adjusted: 'Dec 2025 (up from 120mg)',
  },
  {
    med: 'Anastrozole',
    dose: '0.25mg',
    route: 'Oral (2x/week)',
    status: 'active',
    since: 'Dec 2025',
    adjusted: 'Added Dec 2025 (E2 elevated)',
  },
  {
    med: 'HCG',
    dose: '500 IU',
    route: 'SubQ (2x/week)',
    status: 'active',
    since: 'Sep 2025',
    adjusted: '—',
  },
  {
    med: 'DHEA',
    dose: '25mg',
    route: 'Oral (daily)',
    status: 'active',
    since: 'Sep 2025',
    adjusted: '—',
  },
  {
    med: 'Metformin',
    dose: '500mg',
    route: 'Oral (with dinner)',
    status: 'active',
    since: 'Sep 2025',
    adjusted: '—',
  },
];

const AI_INSIGHTS: AIInsight[] = [
  {
    type: 'positive',
    title: 'Testosterone optimized',
    detail:
      'Total T rose from 285 to 785 ng/dL over 6 months. Free T now in optimal range. Protocol is working.',
    icon: 'check',
  },
  {
    type: 'positive',
    title: 'Metabolic improvement',
    detail:
      'HbA1c dropped from 5.8 to 5.4. Weight down 14 lbs. BP improving. Pre-diabetes risk significantly reduced.',
    icon: 'trend',
  },
  {
    type: 'watch',
    title: 'LDL still elevated',
    detail:
      'LDL 108 — improved from 138 but still above optimal (<100). Consider adding omega-3 or statin discussion at next visit.',
    icon: 'warning',
  },
  {
    type: 'watch',
    title: 'Estradiol managed',
    detail:
      'E2 dropped from 42 to 28 after anastrozole addition. Now in range. Continue monitoring — may reduce AI dose if E2 drops below 20.',
    icon: 'monitor',
  },
  {
    type: 'action',
    title: 'Hematocrit trending up',
    detail:
      'HCT 47.2 — approaching 50 threshold. If next draw >49, consider therapeutic phlebotomy or dose reduction.',
    icon: 'hct',
  },
];

const ACCESS_ELIGIBLE: AccessEligible[] = [
  {
    condition: 'Hypertension (I10)',
    measure: 'BP 128/82 -> target <130 systolic',
    status: 'At target',
    eligible: true,
  },
  {
    condition: 'Dyslipidemia (E78.5)',
    measure: 'LDL 108 -> target <100',
    status: 'Approaching',
    eligible: true,
  },
  {
    condition: 'Obesity (E66.01)',
    measure: 'BMI 29.2 -> target <30',
    status: 'Approaching',
    eligible: true,
  },
  {
    condition: 'Prediabetes (R73.03)',
    measure: 'HbA1c 5.4 -> target <5.7',
    status: 'At target',
    eligible: true,
  },
];

// ─── Component ───────────────────────────────────────────────

export function HormoneDashboard(): ReactNode {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showAccess, setShowAccess] = useState<boolean>(false);

  useEffect(() => {
    document.title = 'RegenAccess -- Patient Dashboard';
  }, []);

  const C: Palette = {
    bg: '#0c1117',
    surface: '#141c24',
    card: '#1a242e',
    border: 'rgba(255,255,255,0.06)',
    text: '#e2e8f0',
    muted: '#64748b',
    dim: '#334155',
    teal: '#2dd4a8',
    gold: '#f4a261',
    coral: '#ef6461',
    blue: '#4a9eff',
    purple: '#8b5cf6',
  };

  const optimal = (val: number, low: number, high: number): string =>
    val >= low && val <= high ? C.teal : val < low ? C.gold : C.coral;

  const badge = (color: string, text: string): ReactNode => (
    <span
      style={{
        padding: '3px 8px',
        borderRadius: '6px',
        background: `${color}18`,
        fontSize: '10px',
        fontWeight: '600',
        color,
      }}
    >
      {text}
    </span>
  );

  const insightIcon = (key: string): ReactNode => {
    switch (key) {
      case 'check':
        return <CheckIcon />;
      case 'trend':
        return <TrendDownIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'monitor':
        return <MonitorIcon />;
      case 'hct':
        return <HctIcon />;
      default:
        return null;
    }
  };

  const miniChart = (values: number[], color: string, height: number = 40): ReactNode => {
    const max = Math.max(...values) * 1.1;
    const min = Math.min(...values) * 0.9;
    const range = max - min || 1;
    const w = 100 / (values.length - 1);
    const points = values
      .map((v, i) => `${i * w},${height - ((v - min) / range) * height}`)
      .join(' ');
    return (
      <svg
        viewBox={`0 0 100 ${height}`}
        style={{ width: '100%', height }}
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {values.map((v, i) => (
          <circle
            key={i}
            cx={i * w}
            cy={height - ((v - min) / range) * height}
            r="3"
            fill={color}
          />
        ))}
      </svg>
    );
  };

  const renderOverview = (): ReactNode => (
    <div>
      {/* Hero stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        {(
          [
            {
              label: 'Total T',
              value: '785',
              unit: 'ng/dL',
              prev: 285,
              color: optimal(785, 500, 1000),
              trend: 'up 175%',
            },
            {
              label: 'Free T',
              value: '22.1',
              unit: 'pg/mL',
              prev: 8.2,
              color: optimal(22.1, 15, 30),
              trend: 'up 170%',
            },
            {
              label: 'Weight',
              value: '198',
              unit: 'lbs',
              prev: 212,
              color: C.teal,
              trend: 'down 14 lbs',
            },
            {
              label: 'HbA1c',
              value: '5.4',
              unit: '%',
              prev: 5.8,
              color: optimal(5.4, 4.0, 5.6),
              trend: 'down 0.4',
            },
          ] as HeroStat[]
        ).map((s, i) => (
          <div
            key={i}
            style={{
              background: C.card,
              borderRadius: '16px',
              border: `1px solid ${C.border}`,
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: C.muted,
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px',
              }}
            >
              {s.label}
            </div>
            <div
              style={{ fontSize: '32px', fontWeight: '800', color: s.color, letterSpacing: '-1px' }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: '11px', color: C.muted }}>{s.unit}</div>
            <div style={{ fontSize: '11px', color: C.teal, fontWeight: '600', marginTop: '6px' }}>
              {s.trend}
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div
        style={{
          fontSize: '12px',
          fontWeight: '700',
          color: C.muted,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '12px',
        }}
      >
        AI Insights
      </div>
      {AI_INSIGHTS.map((insight, i) => (
        <div
          key={i}
          style={{
            background: C.card,
            borderRadius: '14px',
            border: `1px solid ${C.border}`,
            padding: '16px',
            marginBottom: '8px',
            borderLeft: `3px solid ${insight.type === 'positive' ? C.teal : insight.type === 'watch' ? C.gold : C.coral}`,
          }}
        >
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <div>
              <div
                style={{ fontSize: '14px', fontWeight: '600', color: C.text, marginBottom: '4px' }}
              >
                {insightIcon(insight.icon)} {insight.title}
              </div>
              <div style={{ fontSize: '13px', color: C.muted, lineHeight: '1.6' }}>
                {insight.detail}
              </div>
            </div>
            {badge(
              insight.type === 'positive' ? C.teal : insight.type === 'watch' ? C.gold : C.coral,
              insight.type === 'positive'
                ? 'On Track'
                : insight.type === 'watch'
                  ? 'Monitor'
                  : 'Action',
            )}
          </div>
        </div>
      ))}

      {/* Symptom scores */}
      <div
        style={{
          fontSize: '12px',
          fontWeight: '700',
          color: C.muted,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '12px',
          marginTop: '24px',
        }}
      >
        Symptom Tracking (1-10)
      </div>
      <div
        style={{
          background: C.card,
          borderRadius: '16px',
          border: `1px solid ${C.border}`,
          padding: '20px',
        }}
      >
        {SYMPTOMS.map((sym, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: i < SYMPTOMS.length - 1 ? '12px' : 0,
            }}
          >
            <div style={{ width: '90px', fontSize: '13px', fontWeight: '500', color: C.muted }}>
              {sym.name}
            </div>
            <div
              style={{
                flex: 1,
                height: '8px',
                borderRadius: '4px',
                background: `${C.teal}15`,
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(sym.scores[2] / 10) * 100}%`,
                  background: sym.scores[2] >= 7 ? C.teal : sym.scores[2] >= 5 ? C.gold : C.coral,
                  borderRadius: '4px',
                  transition: 'width 0.5s',
                }}
              />
            </div>
            <div
              style={{
                width: '30px',
                textAlign: 'right',
                fontSize: '16px',
                fontWeight: '700',
                color: sym.scores[2] >= 7 ? C.teal : C.gold,
              }}
            >
              {sym.scores[2]}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', justifyContent: 'center' }}>
          {(["Sep '25", "Dec '25", "Mar '26"] as const).map((d, i) => (
            <div
              key={d}
              style={{
                fontSize: '10px',
                color: C.dim,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: [C.coral, C.gold, C.teal][i],
                }}
              />
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* ACCESS Model card */}
      <div
        style={{
          marginTop: '24px',
          padding: '20px',
          borderRadius: '16px',
          background: `linear-gradient(135deg, ${C.card}, ${C.surface})`,
          border: `1px solid ${C.teal}20`,
          cursor: 'pointer',
        }}
        onClick={() => setShowAccess(!showAccess)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: C.teal }}>
              $ ACCESS Model — eCKM Track
            </div>
            <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>
              Marcus qualifies for $360/year in CMS outcome-aligned payments
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: C.teal }}>$360</div>
        </div>
        {showAccess && (
          <div
            style={{ marginTop: '16px', borderTop: `1px solid ${C.border}`, paddingTop: '12px' }}
          >
            {ACCESS_ELIGIBLE.map((ae, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: i < ACCESS_ELIGIBLE.length - 1 ? `1px solid ${C.border}` : 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: C.text }}>
                    {ae.condition}
                  </div>
                  <div style={{ fontSize: '11px', color: C.muted }}>{ae.measure}</div>
                </div>
                {badge(ae.status === 'At target' ? C.teal : C.gold, ae.status)}
              </div>
            ))}
            <div
              style={{ fontSize: '11px', color: C.muted, marginTop: '12px', textAlign: 'center' }}
            >
              4 qualifying conditions · All measures tracked · OAP submission ready
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderLabs = (): ReactNode => (
    <div>
      <div
        style={{
          fontSize: '12px',
          fontWeight: '700',
          color: C.muted,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '16px',
        }}
      >
        Biomarker Trends
      </div>
      {(
        [
          {
            name: 'Total Testosterone',
            values: LAB_HISTORY.map((l) => l.totalT).reverse(),
            unit: 'ng/dL',
            range: '500-1000',
            color: C.teal,
          },
          {
            name: 'Free Testosterone',
            values: LAB_HISTORY.map((l) => l.freeT).reverse(),
            unit: 'pg/mL',
            range: '15-30',
            color: C.blue,
          },
          {
            name: 'Estradiol (E2)',
            values: LAB_HISTORY.map((l) => l.estradiol).reverse(),
            unit: 'pg/mL',
            range: '20-35',
            color: C.purple,
          },
          {
            name: 'Hematocrit',
            values: LAB_HISTORY.map((l) => l.hct).reverse(),
            unit: '%',
            range: '38-50',
            color: C.gold,
          },
          {
            name: 'PSA',
            values: LAB_HISTORY.map((l) => l.psa).reverse(),
            unit: 'ng/mL',
            range: '<4.0',
            color: C.teal,
          },
          {
            name: 'LDL Cholesterol',
            values: LAB_HISTORY.map((l) => l.ldl).reverse(),
            unit: 'mg/dL',
            range: '<100',
            color: C.coral,
          },
          {
            name: 'HbA1c',
            values: LAB_HISTORY.map((l) => l.hba1c).reverse(),
            unit: '%',
            range: '<5.7',
            color: C.teal,
          },
          {
            name: 'Blood Pressure (sys)',
            values: LAB_HISTORY.map((l) => parseInt(l.bp)).reverse(),
            unit: 'mmHg',
            range: '<130',
            color: C.teal,
          },
        ] as BiomarkerRow[]
      ).map((marker, i) => (
        <div
          key={i}
          style={{
            background: C.card,
            borderRadius: '14px',
            border: `1px solid ${C.border}`,
            padding: '16px',
            marginBottom: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '10px',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: C.text }}>
                {marker.name}
              </div>
              <div style={{ fontSize: '11px', color: C.muted }}>
                Optimal: {marker.range} {marker.unit}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: marker.color }}>
                {marker.values[marker.values.length - 1]}
              </div>
              <div style={{ fontSize: '10px', color: C.muted }}>{marker.unit}</div>
            </div>
          </div>
          {miniChart(marker.values, marker.color)}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '6px',
              fontSize: '10px',
              color: C.dim,
            }}
          >
            <span>Sep '25</span>
            <span>Dec '25</span>
            <span>Mar '26</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderProtocol = (): ReactNode => (
    <div>
      <div
        style={{
          fontSize: '12px',
          fontWeight: '700',
          color: C.muted,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '16px',
        }}
      >
        Active Protocol
      </div>
      {PROTOCOL.map((med, i) => (
        <div
          key={i}
          style={{
            background: C.card,
            borderRadius: '14px',
            border: `1px solid ${C.border}`,
            padding: '16px',
            marginBottom: '10px',
          }}
        >
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: C.text }}>{med.med}</div>
              <div style={{ fontSize: '13px', color: C.teal, fontWeight: '500' }}>
                {med.dose} — {med.route}
              </div>
              <div style={{ fontSize: '11px', color: C.muted, marginTop: '4px' }}>
                Since {med.since}
              </div>
            </div>
            {badge(C.teal, med.status)}
          </div>
          {med.adjusted !== '—' && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 12px',
                background: `${C.gold}10`,
                borderRadius: '8px',
                fontSize: '12px',
                color: C.gold,
              }}
            >
              {med.adjusted}
            </div>
          )}
        </div>
      ))}

      <div
        style={{
          fontSize: '12px',
          fontWeight: '700',
          color: C.muted,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '12px',
          marginTop: '24px',
        }}
      >
        AI Protocol Recommendation
      </div>
      <div
        style={{
          background: C.card,
          borderRadius: '16px',
          border: `1px solid ${C.blue}20`,
          padding: '20px',
        }}
      >
        <div
          style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '12px' }}
        >
          <div style={{ fontSize: '20px' }}>
            <AiIcon />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: C.text }}>
              Next Visit Recommendation
            </div>
            <div style={{ fontSize: '13px', color: C.muted, lineHeight: '1.6', marginTop: '6px' }}>
              Based on Marcus's labs and symptom trajectory, consider:
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {(
            [
              {
                rec: 'Maintain current TRT dose (160mg/week) — testosterone optimized',
                status: 'keep',
              },
              {
                rec: 'Reduce anastrozole to 0.25mg 1x/week — E2 may drop below 20 at current dose',
                status: 'adjust',
              },
              {
                rec: 'Add fish oil 2g/day — LDL still >100 despite metabolic improvement',
                status: 'add',
              },
              {
                rec: 'Order CBC at next draw — monitor hematocrit trajectory toward 50',
                status: 'monitor',
              },
            ] as Recommendation[]
          ).map((r, i) => (
            <div
              key={i}
              style={{
                padding: '10px 14px',
                background: `${r.status === 'keep' ? C.teal : r.status === 'adjust' ? C.gold : r.status === 'add' ? C.blue : C.muted}08`,
                borderRadius: '8px',
                border: `1px solid ${r.status === 'keep' ? C.teal : r.status === 'adjust' ? C.gold : r.status === 'add' ? C.blue : C.muted}15`,
                fontSize: '13px',
                color: C.text,
              }}
            >
              {r.rec}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '10px',
              background: C.teal,
              border: 'none',
              color: C.bg,
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Approve All via ClinicalSwipe
          </button>
          <button
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              background: 'transparent',
              border: `1px solid ${C.border}`,
              color: C.muted,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '11px', color: C.dim }}>
          Dr. McClain reviews and attests · Documented in patient record
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: "'DM Sans', sans-serif",
        minHeight: '100vh',
        padding: '24px',
      }}
    >
      <link href={fontLinks.dmSans} rel="stylesheet" />

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '28px',
          }}
        >
          <div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${C.teal}, ${C.blue})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '800',
                  color: C.bg,
                }}
              >
                RHM
              </div>
              <span style={{ fontSize: '18px', fontWeight: '700' }}>
                Regenerative & Hormone Medicine
              </span>
            </div>
            <div style={{ fontSize: '12px', color: C.muted }}>
              Powered by SurgeonAccess · AI-Assisted Protocol Management
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: C.text }}>
              {PATIENT.name}, {PATIENT.age}
            </div>
            <div style={{ fontSize: '12px', color: C.muted }}>{PATIENT.protocol}</div>
            <div style={{ fontSize: '11px', color: C.teal }}>Next lab: {PATIENT.nextLab}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'labs', label: 'Lab Trends' },
              { id: 'protocol', label: 'Protocol' },
            ] as Tab[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                background: activeTab === t.id ? `${C.teal}12` : 'transparent',
                border: `1px solid ${activeTab === t.id ? `${C.teal}40` : C.border}`,
                color: activeTab === t.id ? C.teal : C.muted,
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'labs' && renderLabs()}
        {activeTab === 'protocol' && renderProtocol()}

        {/* Footer */}
        <div
          style={{
            marginTop: '32px',
            paddingTop: '16px',
            borderTop: `1px solid ${C.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: C.dim,
          }}
        >
          <span>
            Provider: {PATIENT.provider} · {PATIENT.location}
          </span>
          <span>Platform by SolvingHealth · ClinicalSwipe physician review</span>
        </div>
      </div>
    </div>
  );
}
