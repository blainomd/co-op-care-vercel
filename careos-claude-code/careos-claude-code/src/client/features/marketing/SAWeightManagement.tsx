/**
 * SurgeonAccess — Ortho Weight Management + ACCESS eCKM
 *
 * Why this exists: Obesity is the #1 modifiable risk factor for joint replacement.
 * BMI >35 = 2x revision rate. Payers are denying TKA/THA for BMI >40.
 * Surgeons NEED their patients to lose weight before surgery.
 *
 * CMS ACCESS eCKM track pays $360/beneficiary/year for chronic kidney + metabolic conditions.
 * Ortho patients with obesity, prediabetes, HTN = eligible.
 *
 * This is a SurgeonAccess module, not a separate product.
 */
import { useState, type ReactElement } from 'react';
import { fontLinks, company } from './design-tokens';

interface Patient {
  id: string;
  name: string;
  age: number;
  bmi: number;
  bmiStart: number;
  procedure: string;
  status: 'on-track' | 'plateau' | 'pre-op' | 'denied';
  weightLost: number;
  targetBmi: number;
  hba1c: number;
  accessEligible: boolean;
  nextVisit: string;
}

interface ProtocolStep {
  week: string;
  action: string;
  status: 'done' | 'current' | 'upcoming';
}

const PATIENTS: Patient[] = [
  {
    id: 'LH',
    name: 'Linda Hernandez',
    age: 62,
    bmi: 36.2,
    bmiStart: 42.1,
    procedure: 'TKA (L)',
    status: 'on-track',
    weightLost: 38,
    targetBmi: 35,
    hba1c: 5.8,
    accessEligible: true,
    nextVisit: 'Apr 5',
  },
  {
    id: 'RJ',
    name: 'Robert Johnson',
    age: 58,
    bmi: 38.4,
    bmiStart: 41.8,
    procedure: 'THA (R)',
    status: 'plateau',
    weightLost: 18,
    targetBmi: 35,
    hba1c: 6.2,
    accessEligible: true,
    nextVisit: 'Apr 8',
  },
  {
    id: 'MG',
    name: 'Maria Garcia',
    age: 55,
    bmi: 34.1,
    bmiStart: 39.5,
    procedure: 'TKA (R)',
    status: 'pre-op',
    weightLost: 32,
    targetBmi: 35,
    hba1c: 5.4,
    accessEligible: true,
    nextVisit: 'Apr 2',
  },
  {
    id: 'TW',
    name: 'Thomas Wilson',
    age: 67,
    bmi: 43.2,
    bmiStart: 44.0,
    procedure: 'TKA (B)',
    status: 'denied',
    weightLost: 4,
    targetBmi: 40,
    hba1c: 6.8,
    accessEligible: true,
    nextVisit: 'Apr 10',
  },
  {
    id: 'PD',
    name: 'Patricia Davis',
    age: 60,
    bmi: 33.8,
    bmiStart: 37.2,
    procedure: 'THA (L)',
    status: 'pre-op',
    weightLost: 22,
    targetBmi: 35,
    hba1c: 5.3,
    accessEligible: false,
    nextVisit: 'Apr 4',
  },
  {
    id: 'JB',
    name: 'James Brown',
    age: 64,
    bmi: 37.9,
    bmiStart: 40.5,
    procedure: 'Revision TKA',
    status: 'on-track',
    weightLost: 16,
    targetBmi: 35,
    hba1c: 5.9,
    accessEligible: true,
    nextVisit: 'Apr 12',
  },
];

const PROTOCOL: ProtocolStep[] = [
  {
    week: 'Wk 1-2',
    action: 'Baseline labs + metabolic panel. GLP-1 eligibility screen. Nutrition referral.',
    status: 'done',
  },
  {
    week: 'Wk 3-4',
    action: 'GLP-1 initiation (if eligible). Caloric target set. Activity prescription.',
    status: 'done',
  },
  {
    week: 'Wk 5-8',
    action: 'Bi-weekly weight check. GLP-1 titration. PROM collection (KOOS/HOOS).',
    status: 'done',
  },
  {
    week: 'Wk 9-12',
    action: 'Monthly labs (HbA1c, lipids, metabolic). Adjust protocol. PT referral.',
    status: 'current',
  },
  {
    week: 'Wk 13-24',
    action: 'Monthly weight checks. Maintain GLP-1. Pre-op clearance at BMI target.',
    status: 'upcoming',
  },
  {
    week: 'Pre-Op',
    action: 'Final BMI assessment. Surgical scheduling. Prior auth with weight loss documentation.',
    status: 'upcoming',
  },
];

const C = {
  navy: '#0a1628',
  dark: '#0e1f33',
  card: '#1a242e',
  border: 'rgba(255,255,255,0.08)',
  teal: '#2dd4a8',
  tealDark: '#1a9e7a',
  gold: '#f4a261',
  coral: '#ef6461',
  blue: '#4a9eff',
  text: '#e2e8f0',
  muted: '#7a8a9a',
  dim: '#3a4a5a',
};

const statusColor: Record<Patient['status'], string> = {
  'on-track': C.teal,
  plateau: C.gold,
  'pre-op': C.blue,
  denied: C.coral,
};

const statusLabel: Record<Patient['status'], string> = {
  'on-track': 'On Track',
  plateau: 'Plateau',
  'pre-op': 'Pre-Op Ready',
  denied: 'Auth Denied',
};

function CheckSvg(): ReactElement {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M2 6l3 3 5-5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BmiBar({
  current,
  start,
  target,
}: {
  current: number;
  start: number;
  target: number;
}): ReactElement {
  const range = start - 25;
  const progress = Math.min(100, Math.max(0, ((start - current) / range) * 100));
  const targetPos = Math.min(100, Math.max(0, ((start - target) / range) * 100));
  const color = current <= target ? C.teal : current <= target + 2 ? C.gold : C.coral;

  return (
    <div
      style={{
        position: 'relative',
        height: '8px',
        background: `${C.teal}15`,
        borderRadius: '4px',
        overflow: 'visible',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: color,
          borderRadius: '4px',
          transition: 'width 0.5s',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: `${targetPos}%`,
          top: '-4px',
          width: '2px',
          height: '16px',
          background: C.gold,
        }}
      />
    </div>
  );
}

export function SAWeightManagement() {
  const [tab, setTab] = useState<'panel' | 'protocol' | 'access'>('panel');

  const totalAccessRevenue = PATIENTS.filter((p) => p.accessEligible).length * 360;
  const avgWeightLost = Math.round(
    PATIENTS.reduce((s, p) => s + p.weightLost, 0) / PATIENTS.length,
  );
  const preOpReady = PATIENTS.filter((p) => p.status === 'pre-op').length;

  return (
    <div
      style={{
        background: C.navy,
        color: C.text,
        fontFamily: "'DM Sans', sans-serif",
        minHeight: '100vh',
        padding: '24px',
      }}
    >
      <link href={fontLinks.dmSans} rel="stylesheet" />

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
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
              style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '900',
                  color: C.navy,
                }}
              >
                SA
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>
                  SurgeonAccess
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: C.dim,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                  }}
                >
                  Ortho Weight Management + ACCESS eCKM
                </div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>Pre-Surgical Optimization</div>
            <div style={{ fontSize: '12px', color: C.muted }}>
              BMI Reduction for Joint Replacement
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          {[
            {
              label: 'Weight Mgmt Patients',
              value: String(PATIENTS.length),
              change: '2 new this month',
              positive: true,
            },
            {
              label: 'Avg Weight Lost',
              value: `${avgWeightLost} lbs`,
              change: 'across all patients',
              positive: true,
            },
            {
              label: 'Pre-Op Ready',
              value: String(preOpReady),
              change: 'BMI target met',
              positive: true,
            },
            {
              label: 'ACCESS Revenue',
              value: `$${totalAccessRevenue.toLocaleString()}`,
              change: `${PATIENTS.filter((p) => p.accessEligible).length} eligible`,
              positive: true,
            },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                background: C.card,
                borderRadius: '14px',
                border: `1px solid ${C.border}`,
                padding: '20px',
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
                {m.label}
              </div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: C.teal,
                  letterSpacing: '-1px',
                }}
              >
                {m.value}
              </div>
              <div style={{ fontSize: '11px', color: C.teal, fontWeight: '500', marginTop: '4px' }}>
                {m.change}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
          {[
            { id: 'panel' as const, label: 'Patient Panel' },
            { id: 'protocol' as const, label: 'Weight Loss Protocol' },
            { id: 'access' as const, label: 'ACCESS eCKM' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                background: tab === t.id ? `${C.teal}12` : 'transparent',
                border: `1px solid ${tab === t.id ? `${C.teal}40` : C.border}`,
                color: tab === t.id ? C.teal : C.muted,
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Patient Panel */}
        {tab === 'panel' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {PATIENTS.map((p) => (
              <div
                key={p.id}
                style={{
                  background: C.card,
                  borderRadius: '16px',
                  border: `1px solid ${C.border}`,
                  borderLeft: `3px solid ${statusColor[p.status]}`,
                  padding: '24px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: `${statusColor[p.status]}15`,
                        border: `1px solid ${statusColor[p.status]}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: statusColor[p.status],
                      }}
                    >
                      {p.id}
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '700' }}>
                        {p.name}, {p.age}
                      </div>
                      <div style={{ fontSize: '12px', color: C.muted }}>
                        {p.procedure} -- Next: {p.nextVisit}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background: `${statusColor[p.status]}15`,
                      color: statusColor[p.status],
                    }}
                  >
                    {statusLabel[p.status]}
                  </span>
                </div>

                {/* BMI progress */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    gap: '16px',
                    marginBottom: '12px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: C.muted,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      }}
                    >
                      Start BMI
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: C.coral }}>
                      {p.bmiStart}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: C.muted,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      }}
                    >
                      Current BMI
                    </div>
                    <div
                      style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: p.bmi <= p.targetBmi ? C.teal : C.gold,
                      }}
                    >
                      {p.bmi}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: C.muted,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      }}
                    >
                      Target
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: C.muted }}>
                      {p.targetBmi}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: C.muted,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      }}
                    >
                      Weight Lost
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: C.teal }}>
                      {p.weightLost} lbs
                    </div>
                  </div>
                </div>

                <BmiBar current={p.bmi} start={p.bmiStart} target={p.targetBmi} />

                <div
                  style={{
                    display: 'flex',
                    gap: '16px',
                    marginTop: '12px',
                    fontSize: '12px',
                    color: C.muted,
                  }}
                >
                  <span>
                    HbA1c:{' '}
                    <span
                      style={{
                        color: p.hba1c <= 5.6 ? C.teal : p.hba1c <= 6.0 ? C.gold : C.coral,
                        fontWeight: '700',
                      }}
                    >
                      {p.hba1c}
                    </span>
                  </span>
                  {p.accessEligible && (
                    <span style={{ color: C.teal }}>ACCESS eligible ($360/yr)</span>
                  )}
                  {p.status === 'denied' && (
                    <span style={{ color: C.coral }}>
                      Prior auth denied -- BMI too high for surgical clearance
                    </span>
                  )}
                  {p.status === 'pre-op' && (
                    <span style={{ color: C.blue }}>
                      BMI target met -- ready for surgical scheduling
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Protocol */}
        {tab === 'protocol' && (
          <div>
            <div
              style={{
                background: C.card,
                borderRadius: '16px',
                border: `1px solid ${C.border}`,
                padding: '28px',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                Pre-Surgical Weight Optimization Protocol
              </div>
              <div style={{ fontSize: '13px', color: C.muted, marginBottom: '24px' }}>
                Evidence-based 6-month pathway. GLP-1 + nutrition + activity + PROM tracking. Goal:
                BMI below surgical threshold for joint replacement.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {PROTOCOL.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      paddingBottom: i < PROTOCOL.length - 1 ? '20px' : '0',
                    }}
                  >
                    {/* Timeline dot + line */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: '32px',
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background:
                            step.status === 'done'
                              ? C.teal
                              : step.status === 'current'
                                ? C.gold
                                : C.dim,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {step.status === 'done' ? (
                          <CheckSvg />
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'white' }}>
                            {i + 1}
                          </span>
                        )}
                      </div>
                      {i < PROTOCOL.length - 1 && (
                        <div
                          style={{
                            width: '2px',
                            flex: 1,
                            background: step.status === 'done' ? C.teal : C.dim,
                            marginTop: '4px',
                          }}
                        />
                      )}
                    </div>
                    {/* Content */}
                    <div style={{ paddingBottom: '4px' }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: '700',
                          color:
                            step.status === 'done'
                              ? C.teal
                              : step.status === 'current'
                                ? C.gold
                                : C.muted,
                          marginBottom: '4px',
                        }}
                      >
                        {step.week}
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          color: step.status === 'upcoming' ? C.dim : C.text,
                          lineHeight: '1.6',
                        }}
                      >
                        {step.action}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI recommendation */}
            <div
              style={{
                background: C.card,
                borderRadius: '16px',
                border: `1px solid ${C.blue}20`,
                padding: '24px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: C.blue,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: '12px',
                }}
              >
                AI Protocol Intelligence
              </div>
              <div
                style={{ fontSize: '14px', color: C.text, lineHeight: '1.7', marginBottom: '16px' }}
              >
                Based on your panel of {PATIENTS.length} weight management patients:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  {
                    rec: 'Thomas Wilson (BMI 43.2) -- GLP-1 dose increase recommended. Current weight loss stalled at 4 lbs over 8 weeks.',
                    color: C.coral,
                  },
                  {
                    rec: 'Robert Johnson (BMI 38.4) -- Plateau at week 10. Consider adding phentermine short-course or increasing activity prescription.',
                    color: C.gold,
                  },
                  {
                    rec: 'Maria Garcia (BMI 34.1) -- BMI target met. Schedule pre-op labs and surgical clearance. Document weight loss for prior auth.',
                    color: C.teal,
                  },
                  {
                    rec: 'Linda Hernandez (BMI 36.2) -- 1.2 BMI points from target. On track to reach pre-op BMI by week 16 at current trajectory.',
                    color: C.teal,
                  },
                ].map((r, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: `${r.color}08`,
                      border: `1px solid ${r.color}15`,
                      fontSize: '13px',
                      color: C.text,
                      lineHeight: '1.5',
                    }}
                  >
                    {r.rec}
                  </div>
                ))}
              </div>
              <button
                style={{
                  marginTop: '16px',
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
                  border: 'none',
                  color: C.navy,
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Review All via ClinicalSwipe
              </button>
              <div
                style={{ textAlign: 'center', marginTop: '8px', fontSize: '11px', color: C.dim }}
              >
                Physician-attested by {company.medicalDirector.name} -- documented and auditable
              </div>
            </div>
          </div>
        )}

        {/* ACCESS eCKM */}
        {tab === 'access' && (
          <div>
            <div
              style={{
                padding: '32px',
                borderRadius: '16px',
                marginBottom: '20px',
                background: `linear-gradient(135deg, ${C.card}, ${C.dark})`,
                border: `1px solid ${C.teal}20`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: C.teal,
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      marginBottom: '8px',
                    }}
                  >
                    CMS ACCESS Model -- eCKM Track
                  </div>
                  <div
                    style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      letterSpacing: '-0.5px',
                      marginBottom: '8px',
                    }}
                  >
                    Ortho patients with metabolic conditions = new revenue
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: C.muted,
                      lineHeight: '1.7',
                      maxWidth: '500px',
                    }}
                  >
                    Your joint replacement patients with obesity, prediabetes, hypertension, and
                    dyslipidemia qualify for CMS outcome-aligned payments. You're already managing
                    these conditions as part of pre-surgical optimization. ACCESS pays you $360/year
                    for tracking outcomes.
                  </div>
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '20px',
                    borderRadius: '16px',
                    background: 'rgba(0,0,0,0.3)',
                    border: `1px solid ${C.teal}20`,
                    minWidth: '140px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '40px',
                      fontWeight: '900',
                      color: C.teal,
                      letterSpacing: '-2px',
                    }}
                  >
                    ${totalAccessRevenue.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px', color: C.muted }}>annual revenue</div>
                  <div style={{ fontSize: '11px', color: C.teal, marginTop: '4px' }}>
                    {PATIENTS.filter((p) => p.accessEligible).length} eligible patients
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: C.muted,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '12px',
              }}
            >
              Qualifying Conditions in Your Panel
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              {[
                {
                  condition: 'Obesity (BMI 30+)',
                  count: PATIENTS.filter((p) => p.bmi >= 30).length,
                  code: 'E66.01',
                },
                {
                  condition: 'Prediabetes',
                  count: PATIENTS.filter((p) => p.hba1c >= 5.7 && p.hba1c < 6.5).length,
                  code: 'R73.03',
                },
                { condition: 'Hypertension', count: 4, code: 'I10' },
                { condition: 'Dyslipidemia', count: 3, code: 'E78.5' },
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    background: C.card,
                    borderRadius: '12px',
                    border: `1px solid ${C.border}`,
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '24px', fontWeight: '800', color: C.teal }}>
                    {c.count}
                  </div>
                  <div
                    style={{ fontSize: '12px', fontWeight: '600', color: C.text, marginTop: '4px' }}
                  >
                    {c.condition}
                  </div>
                  <div style={{ fontSize: '10px', color: C.dim, fontFamily: 'monospace' }}>
                    {c.code}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: '20px',
                borderRadius: '14px',
                background: `${C.teal}08`,
                border: `1px solid ${C.teal}15`,
                textAlign: 'center',
                fontSize: '13px',
                color: C.muted,
                lineHeight: '1.7',
              }}
            >
              SurgeonAccess handles beneficiary alignment, monthly G-code billing, PROM collection,
              and outcome reporting. Your pre-surgical weight optimization program generates ACCESS
              revenue on patients you're already treating.
              <div style={{ marginTop: '8px', fontSize: '11px', color: C.dim }}>
                Medical Director: {company.medicalDirector.name} -- NPI{' '}
                {company.medicalDirector.npi}
              </div>
            </div>
          </div>
        )}

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
          <div>
            <span style={{ fontWeight: '600', color: C.muted }}>SurgeonAccess</span> -- Ortho Weight
            Management Module
          </div>
          <div>{company.name} -- ClinicalSwipe physician review</div>
        </div>
      </div>
    </div>
  );
}
