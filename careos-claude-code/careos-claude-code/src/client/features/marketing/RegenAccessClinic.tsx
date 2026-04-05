/**
 * RegenAccess — Clinician Dashboard
 *
 * The provider-side view of the hormone optimization vertical.
 * What Rand, Todd, and Kristin see when they log in.
 *
 * Brand hierarchy: Solving Health > ClinicalSwipe > RegenAccess > [RHM Med, etc.]
 * Same pattern as: Solving Health > ClinicalSwipe > SurgeonAccess > [ortho practices]
 */
import { useState, useEffect } from 'react';
import { fontLinks, company } from './design-tokens';
import { SHIcons } from './IconShowcase';

// ─── Types ────────────────────────────────────────────────

interface Patient {
  id: string;
  name: string;
  age: number;
  protocol: string;
  lastLab: string;
  nextLab: string;
  status: 'optimal' | 'adjusting' | 'onboarding' | 'flagged';
  totalT: number;
  freeT: number;
  hba1c: number;
  alerts: number;
  accessEligible: boolean;
  accessRevenue: number;
}

interface ReviewItem {
  id: string;
  patient: string;
  type: 'protocol' | 'lab' | 'symptom' | 'access';
  title: string;
  detail: string;
  urgency: 'routine' | 'soon' | 'urgent';
  aiRecommendation: string;
  timestamp: string;
}

interface ClinicMetric {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

// ─── Data ─────────────────────────────────────────────────

const PATIENTS: Patient[] = [
  {
    id: 'MR',
    name: 'Marcus Rivera',
    age: 54,
    protocol: 'TRT + Metabolic',
    lastLab: 'Mar 15',
    nextLab: 'Apr 8',
    status: 'optimal',
    totalT: 785,
    freeT: 22.1,
    hba1c: 5.4,
    alerts: 0,
    accessEligible: true,
    accessRevenue: 360,
  },
  {
    id: 'JK',
    name: 'James Kim',
    age: 47,
    protocol: 'TRT',
    lastLab: 'Mar 10',
    nextLab: 'Apr 5',
    status: 'adjusting',
    totalT: 620,
    freeT: 16.8,
    hba1c: 5.1,
    alerts: 1,
    accessEligible: false,
    accessRevenue: 0,
  },
  {
    id: 'DW',
    name: 'David Walsh',
    age: 61,
    protocol: 'TRT + Thyroid',
    lastLab: 'Mar 18',
    nextLab: 'Apr 12',
    status: 'flagged',
    totalT: 445,
    freeT: 12.3,
    hba1c: 6.1,
    alerts: 3,
    accessEligible: true,
    accessRevenue: 360,
  },
  {
    id: 'SC',
    name: 'Sarah Chen',
    age: 52,
    protocol: 'HRT (Peri)',
    lastLab: 'Mar 20',
    nextLab: 'Apr 15',
    status: 'optimal',
    totalT: 0,
    freeT: 0,
    hba1c: 5.3,
    alerts: 0,
    accessEligible: true,
    accessRevenue: 360,
  },
  {
    id: 'TN',
    name: 'Tom Nguyen',
    age: 39,
    protocol: 'TRT + Peptides',
    lastLab: 'Mar 22',
    nextLab: 'Apr 18',
    status: 'optimal',
    totalT: 890,
    freeT: 28.4,
    hba1c: 5.0,
    alerts: 0,
    accessEligible: false,
    accessRevenue: 0,
  },
  {
    id: 'RB',
    name: 'Rachel Brooks',
    age: 58,
    protocol: 'HRT + Metabolic',
    lastLab: 'Mar 8',
    nextLab: 'Apr 2',
    status: 'adjusting',
    totalT: 0,
    freeT: 0,
    hba1c: 5.7,
    alerts: 2,
    accessEligible: true,
    accessRevenue: 360,
  },
  {
    id: 'ML',
    name: 'Michael Lee',
    age: 44,
    protocol: 'Onboarding',
    lastLab: 'Mar 25',
    nextLab: 'Apr 20',
    status: 'onboarding',
    totalT: 285,
    freeT: 8.2,
    hba1c: 5.9,
    alerts: 0,
    accessEligible: true,
    accessRevenue: 360,
  },
  {
    id: 'KP',
    name: 'Karen Park',
    age: 49,
    protocol: 'HRT',
    lastLab: 'Mar 12',
    nextLab: 'Apr 8',
    status: 'optimal',
    totalT: 0,
    freeT: 0,
    hba1c: 5.2,
    alerts: 0,
    accessEligible: false,
    accessRevenue: 0,
  },
];

const REVIEW_QUEUE: ReviewItem[] = [
  {
    id: 'r1',
    patient: 'David Walsh',
    type: 'lab',
    title: 'HbA1c elevated at 6.1%',
    detail:
      'Up from 5.8 last draw. Pre-diabetic range. Weight stable at 225. Current metformin 500mg may need increase.',
    urgency: 'urgent',
    aiRecommendation:
      'Increase metformin to 1000mg/day. Recheck HbA1c in 8 weeks. Add CGM if patient willing.',
    timestamp: '2 hrs ago',
  },
  {
    id: 'r2',
    patient: 'David Walsh',
    type: 'lab',
    title: 'Total T dropped to 445 ng/dL',
    detail:
      'Down from 680 last draw. SHBG elevated at 58. Possible compliance issue or absorption problem.',
    urgency: 'urgent',
    aiRecommendation:
      'Check injection site rotation. Consider switching from IM to subQ. Recheck in 4 weeks with SHBG.',
    timestamp: '2 hrs ago',
  },
  {
    id: 'r3',
    patient: 'David Walsh',
    type: 'lab',
    title: 'Hematocrit at 51.2%',
    detail:
      'Approaching upper limit. Up from 48.9. Monitor closely -- may need therapeutic phlebotomy or TRT dose reduction.',
    urgency: 'urgent',
    aiRecommendation:
      'Reduce TRT to 140mg/week (from 160mg). Phlebotomy if HCT exceeds 52%. Recheck CBC in 4 weeks.',
    timestamp: '2 hrs ago',
  },
  {
    id: 'r4',
    patient: 'James Kim',
    type: 'protocol',
    title: 'E2 rising -- 42 pg/mL',
    detail:
      'Above optimal range (20-35). No gynecomastia symptoms reported. Current anastrozole 0.25mg 2x/week.',
    urgency: 'soon',
    aiRecommendation: 'Increase anastrozole to 0.5mg 2x/week. Recheck E2 in 6 weeks.',
    timestamp: '5 hrs ago',
  },
  {
    id: 'r5',
    patient: 'Rachel Brooks',
    type: 'symptom',
    title: 'Sleep score dropped to 4/10',
    detail: 'Down from 7/10 last month. Hot flashes increased. Current estradiol patch 0.05mg.',
    urgency: 'soon',
    aiRecommendation:
      'Increase estradiol to 0.075mg patch. Add progesterone 100mg at bedtime for sleep. Follow up in 2 weeks.',
    timestamp: '1 day ago',
  },
  {
    id: 'r6',
    patient: 'Michael Lee',
    type: 'protocol',
    title: 'Initial protocol recommendation',
    detail: 'Baseline labs complete. Total T 285, Free T 8.2, E2 18, SHBG 45. BMI 31. HbA1c 5.9.',
    urgency: 'routine',
    aiRecommendation:
      'Start TRT 120mg/week subQ. Anastrozole 0.25mg 1x/week. Metformin 500mg/day. GLP-1 evaluation. Recheck 8 weeks.',
    timestamp: '2 days ago',
  },
];

const CLINIC_METRICS: ClinicMetric[] = [
  { label: 'Active Patients', value: '127', change: '+8 this month', positive: true },
  { label: 'Reviews Pending', value: '6', change: '3 urgent', positive: false },
  { label: 'ACCESS Revenue', value: '$18,360', change: '51 eligible patients', positive: true },
  { label: 'Avg Optimization', value: '73%', change: '+4% vs last quarter', positive: true },
];

// ─── Palette ──────────────────────────────────────────────

const C = {
  bg: '#0c1117',
  surface: '#141c24',
  card: '#1a242e',
  border: 'rgba(255,255,255,0.08)',
  teal: '#2dd4a8',
  tealDark: '#1a9e7a',
  gold: '#f4a261',
  coral: '#ef6461',
  blue: '#4a9eff',
  purple: '#8b5cf6',
  text: '#e2e8f0',
  muted: '#7a8a9a',
  dim: '#3a4a5a',
};

const statusColor: Record<Patient['status'], string> = {
  optimal: C.teal,
  adjusting: C.gold,
  onboarding: C.blue,
  flagged: C.coral,
};

const urgencyColor: Record<ReviewItem['urgency'], string> = {
  routine: C.muted,
  soon: C.gold,
  urgent: C.coral,
};

// ─── Component ────────────────────────────────────────────

export function RegenAccessClinic() {
  const [tab, setTab] = useState<'patients' | 'reviews' | 'access'>('patients');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [approvedReviews, setApprovedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    document.title = 'RegenAccess -- Clinician Dashboard';
  }, []);

  const totalAccessRevenue = PATIENTS.reduce((sum, p) => sum + p.accessRevenue, 0);
  const accessEligibleCount = PATIENTS.filter((p) => p.accessEligible).length;

  const approveReview = (id: string) => {
    setApprovedReviews((prev) => new Set([...prev, id]));
  };

  const approveAll = () => {
    setApprovedReviews(new Set(REVIEW_QUEUE.map((r) => r.id)));
  };

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
                  background: `linear-gradient(135deg, ${C.teal}, ${C.blue})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '900',
                  color: C.bg,
                }}
              >
                RA
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>
                  RegenAccess
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: C.dim,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                  }}
                >
                  Regenerative Medicine Intelligence Platform
                </div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>Dr. Rand McClain, DO</div>
            <div style={{ fontSize: '12px', color: C.muted }}>RHM Med -- Santa Monica</div>
            <div style={{ fontSize: '11px', color: C.teal }}>Medical Director</div>
          </div>
        </div>

        {/* Metrics row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          {CLINIC_METRICS.map((m, i) => (
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
                  color: m.positive ? C.teal : C.coral,
                  letterSpacing: '-1px',
                }}
              >
                {m.value}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: m.positive ? C.teal : C.coral,
                  fontWeight: '500',
                  marginTop: '4px',
                }}
              >
                {m.change}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
          {[
            { id: 'patients' as const, label: 'Patient Panel', count: PATIENTS.length },
            {
              id: 'reviews' as const,
              label: 'Review Queue',
              count: REVIEW_QUEUE.length - approvedReviews.size,
            },
            { id: 'access' as const, label: 'ACCESS eCKM', count: accessEligibleCount },
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
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {t.label}
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: '700',
                  background: t.id === 'reviews' && t.count > 0 ? `${C.coral}20` : `${C.teal}15`,
                  color: t.id === 'reviews' && t.count > 0 ? C.coral : C.teal,
                }}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Patient Panel */}
        {tab === 'patients' && (
          <div>
            <div
              style={{
                background: C.card,
                borderRadius: '16px',
                border: `1px solid ${C.border}`,
                overflow: 'hidden',
              }}
            >
              {/* Table header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 0.8fr',
                  padding: '14px 20px',
                  background: C.surface,
                  fontSize: '11px',
                  fontWeight: '700',
                  color: C.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                <span>Patient</span>
                <span>Protocol</span>
                <span>Total T</span>
                <span>HbA1c</span>
                <span>Next Lab</span>
                <span>Status</span>
                <span>Alerts</span>
              </div>
              {/* Table rows */}
              {PATIENTS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(selectedPatient === p.id ? null : p.id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 0.8fr',
                    padding: '16px 20px',
                    borderTop: `1px solid ${C.border}`,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    background: selectedPatient === p.id ? `${C.teal}06` : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: `${statusColor[p.status]}15`,
                        border: `1px solid ${statusColor[p.status]}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: statusColor[p.status],
                      }}
                    >
                      {p.id}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: C.muted }}>{p.age}y</div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: C.muted,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {p.protocol}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {p.totalT > 0 ? (
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: p.totalT >= 500 ? C.teal : p.totalT >= 300 ? C.gold : C.coral,
                        }}
                      >
                        {p.totalT}
                      </span>
                    ) : (
                      <span style={{ fontSize: '12px', color: C.dim }}>N/A</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: p.hba1c <= 5.6 ? C.teal : p.hba1c <= 6.0 ? C.gold : C.coral,
                      }}
                    >
                      {p.hba1c}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: C.muted,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {p.nextLab}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        background: `${statusColor[p.status]}15`,
                        color: statusColor[p.status],
                      }}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {p.alerts > 0 ? (
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: `${C.coral}15`,
                          color: C.coral,
                        }}
                      >
                        {p.alerts}
                      </span>
                    ) : (
                      <span style={{ fontSize: '12px', color: C.dim }}>--</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Queue */}
        {tab === 'reviews' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '14px', color: C.muted }}>
                {REVIEW_QUEUE.length - approvedReviews.size} pending --{' '}
                {REVIEW_QUEUE.filter((r) => r.urgency === 'urgent').length} urgent
              </div>
              <button
                onClick={approveAll}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
                  border: 'none',
                  color: C.bg,
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Approve All via ClinicalSwipe
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {REVIEW_QUEUE.map((r) => {
                const approved = approvedReviews.has(r.id);
                return (
                  <div
                    key={r.id}
                    style={{
                      background: approved ? `${C.teal}06` : C.card,
                      borderRadius: '14px',
                      border: `1px solid ${approved ? `${C.teal}20` : C.border}`,
                      borderLeft: `3px solid ${approved ? C.teal : urgencyColor[r.urgency]}`,
                      padding: '20px',
                      opacity: approved ? 0.6 : 1,
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
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '4px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '15px',
                              fontWeight: '700',
                              color: approved ? C.muted : C.text,
                            }}
                          >
                            {r.title}
                          </span>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              background: `${urgencyColor[r.urgency]}15`,
                              color: urgencyColor[r.urgency],
                            }}
                          >
                            {r.urgency}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: C.muted }}>
                          {r.patient} -- {r.timestamp}
                        </div>
                      </div>
                      {!approved && (
                        <button
                          onClick={() => approveReview(r.id)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: C.teal,
                            border: 'none',
                            color: C.bg,
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          {SHIcons['check']?.(14) ?? <span />} Approve
                        </button>
                      )}
                      {approved && (
                        <span
                          style={{
                            padding: '8px 16px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: C.teal,
                          }}
                        >
                          Approved
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: C.muted,
                        lineHeight: '1.6',
                        marginBottom: '12px',
                      }}
                    >
                      {r.detail}
                    </div>
                    <div
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: `${C.blue}08`,
                        border: `1px solid ${C.blue}15`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: C.blue,
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          marginBottom: '4px',
                        }}
                      >
                        AI Recommendation
                      </div>
                      <div style={{ fontSize: '13px', color: C.text, lineHeight: '1.6' }}>
                        {r.aiRecommendation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: C.dim }}>
              Each approval is ClinicalSwipe-attested by {company.medicalDirector.name} --
              documented and auditable
            </div>
          </div>
        )}

        {/* ACCESS eCKM */}
        {tab === 'access' && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  background: C.card,
                  borderRadius: '14px',
                  border: `1px solid ${C.teal}20`,
                  padding: '24px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '36px',
                    fontWeight: '900',
                    color: C.teal,
                    letterSpacing: '-2px',
                  }}
                >
                  ${totalAccessRevenue.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>
                  Annual ACCESS Revenue
                </div>
              </div>
              <div
                style={{
                  background: C.card,
                  borderRadius: '14px',
                  border: `1px solid ${C.border}`,
                  padding: '24px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '36px',
                    fontWeight: '900',
                    color: C.blue,
                    letterSpacing: '-2px',
                  }}
                >
                  {accessEligibleCount}
                </div>
                <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>
                  Eligible Patients
                </div>
              </div>
              <div
                style={{
                  background: C.card,
                  borderRadius: '14px',
                  border: `1px solid ${C.border}`,
                  padding: '24px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '36px',
                    fontWeight: '900',
                    color: C.gold,
                    letterSpacing: '-2px',
                  }}
                >
                  $360
                </div>
                <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>
                  Per Beneficiary / Year
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
              eCKM-Eligible Patients
            </div>
            <div
              style={{
                background: C.card,
                borderRadius: '16px',
                border: `1px solid ${C.border}`,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
                  padding: '14px 20px',
                  background: C.surface,
                  fontSize: '11px',
                  fontWeight: '700',
                  color: C.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                <span>Patient</span>
                <span>Qualifying Conditions</span>
                <span>Measures</span>
                <span>Status</span>
                <span>Revenue</span>
              </div>
              {PATIENTS.filter((p) => p.accessEligible).map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
                    padding: '16px 20px',
                    borderTop: `1px solid ${C.border}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: `${C.teal}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: '700',
                        color: C.teal,
                      }}
                    >
                      {p.id}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{p.name}</div>
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: C.muted,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {p.hba1c > 5.6 ? 'Prediabetes, ' : ''}
                    {p.protocol.includes('Metabolic')
                      ? 'Metabolic syndrome'
                      : 'Chronic condition management'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '700',
                        background: `${C.teal}15`,
                        color: C.teal,
                      }}
                    >
                      All tracked
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '700',
                        background: `${C.teal}15`,
                        color: C.teal,
                      }}
                    >
                      Submitted
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: C.teal,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    ${p.accessRevenue}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '20px',
                padding: '20px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${C.card}, ${C.surface})`,
                border: `1px solid ${C.teal}15`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '13px', color: C.muted, lineHeight: '1.7' }}>
                ACCESS eCKM is a 10-year CMS program for chronic kidney and metabolic conditions.
                RegenAccess handles beneficiary alignment, monthly G-code billing, outcome measure
                collection, and semi-annual reconciliation. You see your patients. We handle the
                model.
              </div>
              <div style={{ fontSize: '11px', color: C.dim, marginTop: '10px' }}>
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
            <span style={{ fontWeight: '600', color: C.muted }}>RegenAccess</span> -- Regenerative
            Medicine Intelligence Platform
          </div>
          <div>{company.name} -- ClinicalSwipe physician review -- Boulder, CO</div>
        </div>
      </div>
    </div>
  );
}
