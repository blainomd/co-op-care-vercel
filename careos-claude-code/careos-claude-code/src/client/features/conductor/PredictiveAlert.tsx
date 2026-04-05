/**
 * PredictiveAlert — Predictive Hospitalization Risk Dashboard
 *
 * ML model predicting hospitalization 72-96 hours in advance.
 * Features: wearable trends + worker care notes (NLP) + Time Bank neighbor
 * observations + CRI scores + medication adherence.
 *
 * Daily risk score 0-100. Score >70 triggers Medical Director notification,
 * additional worker visit, and Conductor alert.
 *
 * Each avoided hospitalization saves $16,037.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface ContributingFactor {
  label: string;
  weight: number;
  detail: string;
}

interface OmahaProblem {
  code: string;
  name: string;
  domain: string;
}

interface Intervention {
  action: string;
  priority: 'immediate' | 'today' | 'scheduled';
  assignee: string;
}

interface RiskDataPoint {
  day: string;
  score: number;
}

interface PatientRisk {
  id: string;
  name: string;
  score: number;
  trend: 'rising' | 'stable' | 'falling';
  primaryConcern: string;
  factors?: ContributingFactor[];
  omahaProblems?: OmahaProblem[];
  interventions?: Intervention[];
  history?: RiskDataPoint[];
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                         */
/* ------------------------------------------------------------------ */

const PATIENTS: PatientRisk[] = [
  {
    id: 'hp1',
    name: 'Helen Park',
    score: 78,
    trend: 'rising',
    primaryConcern: 'UTI risk pattern — elevated HR, decreased HRV, fatigue noted in care notes',
    factors: [
      {
        label: 'Wearable Anomaly',
        weight: 0.32,
        detail: 'Resting HR 82 bpm (+2.3 SD), HRV 28ms (-1.8 SD) over 48 hrs',
      },
      {
        label: 'Care Note Flag',
        weight: 0.25,
        detail: 'Worker-owner noted increased fatigue and mild confusion on 2 consecutive visits',
      },
      {
        label: 'CRI Score Increase',
        weight: 0.22,
        detail: 'CRI rose from 28.4 to 36.6 (+8.2 pts) over 30 days',
      },
      {
        label: 'Medication Skipped',
        weight: 0.21,
        detail: 'Evening prophylactic antibiotic missed 2 of last 4 days per adherence tracker',
      },
    ],
    omahaProblems: [
      { code: '#30', name: 'Urinary Function', domain: 'Physiological' },
      { code: '#36', name: 'Sleep & Rest Patterns', domain: 'Physiological' },
      { code: '#21', name: 'Cognition', domain: 'Psychosocial' },
      { code: '#27', name: 'Circulation', domain: 'Physiological' },
    ],
    interventions: [
      {
        action: 'Schedule additional worker-owner visit within 24 hours',
        priority: 'immediate',
        assignee: 'Coordinator',
      },
      {
        action: 'Alert Medical Director (Dr. Emdur) for telehealth review',
        priority: 'immediate',
        assignee: 'System',
      },
      {
        action: 'Adjust care plan — add hydration and urinary monitoring tasks',
        priority: 'today',
        assignee: 'Conductor',
      },
      {
        action: 'Contact pharmacy to confirm medication refill status',
        priority: 'scheduled',
        assignee: 'Conductor',
      },
    ],
    history: [
      { day: 'Mon', score: 42 },
      { day: 'Tue', score: 45 },
      { day: 'Wed', score: 51 },
      { day: 'Thu', score: 58 },
      { day: 'Fri', score: 64 },
      { day: 'Sat', score: 71 },
      { day: 'Sun', score: 78 },
    ],
  },
  {
    id: 'rl1',
    name: 'Robert Lee',
    score: 54,
    trend: 'rising',
    primaryConcern: 'Fall risk — decreased mobility, medication change',
  },
  {
    id: 'mc1',
    name: 'Margaret Chen',
    score: 31,
    trend: 'stable',
    primaryConcern: 'Mild sleep disruption, otherwise stable',
  },
  {
    id: 'jw1',
    name: 'James Whitfield',
    score: 22,
    trend: 'falling',
    primaryConcern: 'Improving post-discharge recovery',
  },
  {
    id: 'dv1',
    name: 'Dorothy Valdez',
    score: 15,
    trend: 'stable',
    primaryConcern: 'Low risk — routine monitoring only',
  },
];

/* ------------------------------------------------------------------ */
/*  Summary Stats                                                     */
/* ------------------------------------------------------------------ */

const SUMMARY = {
  monitored: PATIENTS.length,
  highRisk: PATIENTS.filter((p) => p.score > 70).length,
  hospitalizationsAvoided: 3,
  savingsThisQuarter: 3 * 16_037,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function riskColor(score: number): { text: string; bg: string; border: string; label: string } {
  if (score > 70)
    return {
      text: 'text-zone-red',
      bg: 'bg-zone-red/10',
      border: 'border-zone-red/30',
      label: 'High Risk',
    };
  if (score >= 30)
    return { text: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30', label: 'Moderate' };
  return { text: 'text-sage', bg: 'bg-sage/10', border: 'border-sage/30', label: 'Low' };
}

function trendIcon(trend: 'rising' | 'stable' | 'falling'): { path: string; color: string } {
  if (trend === 'rising')
    return { path: 'M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25', color: 'text-zone-red' };
  if (trend === 'falling')
    return { path: 'M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25', color: 'text-sage' };
  return { path: 'M17.25 12H6.75', color: 'text-gold' };
}

function priorityBadge(priority: 'immediate' | 'today' | 'scheduled'): string {
  if (priority === 'immediate') return 'bg-zone-red text-white';
  if (priority === 'today') return 'bg-gold text-white';
  return 'bg-warm-gray/30 text-muted';
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function PredictiveAlert() {
  const highRiskPatient = PATIENTS.find((p) => p.score > 70);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Predictive Risk Dashboard</h1>
        <p className="text-sm text-muted">
          ML hospitalization prediction — 72-96 hour advance warning
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-primary">{SUMMARY.monitored}</p>
          <p className="text-[11px] text-muted">Monitored</p>
        </div>
        <div className="rounded-xl border border-zone-red/20 bg-zone-red/5 p-3 text-center">
          <p className="text-2xl font-bold text-zone-red">{SUMMARY.highRisk}</p>
          <p className="text-[11px] text-muted">High Risk ({'>'}70)</p>
        </div>
        <div className="rounded-xl border border-sage/20 bg-sage/5 p-3 text-center">
          <p className="text-2xl font-bold text-sage">{SUMMARY.hospitalizationsAvoided}</p>
          <p className="text-[11px] text-muted">Avoided This Qtr</p>
        </div>
        <div className="rounded-xl border border-gold/20 bg-gold/5 p-3 text-center">
          <p className="text-2xl font-bold text-gold">
            ${SUMMARY.savingsThisQuarter.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted">Savings This Qtr</p>
        </div>
      </div>

      {/* Patient Risk List */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-secondary">Patient Risk Scores</h2>
        {PATIENTS.map((patient) => {
          const rc = riskColor(patient.score);
          const ti = trendIcon(patient.trend);
          const isExpanded = patient.id === highRiskPatient?.id;

          return (
            <div key={patient.id} className={`rounded-xl border ${rc.border} ${rc.bg} p-4`}>
              {/* Patient Row */}
              <div className="flex items-center gap-3">
                {/* Risk Score Bar */}
                <div className="w-16 shrink-0">
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-warm-gray/20">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full ${patient.score > 70 ? 'bg-zone-red' : patient.score >= 30 ? 'bg-gold' : 'bg-sage'}`}
                      style={{ width: `${patient.score}%` }}
                    />
                  </div>
                  <p className={`mt-0.5 text-center text-xs font-bold ${rc.text}`}>
                    {patient.score}
                  </p>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-primary">{patient.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${patient.score > 70 ? 'bg-zone-red text-white' : patient.score >= 30 ? 'bg-gold text-white' : 'bg-sage/20 text-sage'}`}
                    >
                      {rc.label}
                    </span>
                    <svg
                      className={`h-4 w-4 ${ti.color}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={ti.path} />
                    </svg>
                  </div>
                  <p className="text-[11px] text-secondary">{patient.primaryConcern}</p>
                </div>
              </div>

              {/* Expanded Detail for High-Risk Patient */}
              {isExpanded && patient.factors && (
                <div className="mt-4 space-y-4 border-t border-zone-red/20 pt-4">
                  {/* 7-Day Risk Timeline */}
                  {patient.history && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold text-primary">
                        <svg
                          className="mr-1 inline h-3.5 w-3.5 text-copper"
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
                        7-Day Risk Trend
                      </h4>
                      <div className="flex items-end gap-1.5">
                        {patient.history.map((dp) => {
                          const dpc = riskColor(dp.score);
                          return (
                            <div key={dp.day} className="flex flex-1 flex-col items-center gap-1">
                              <span className={`text-[9px] font-medium ${dpc.text}`}>
                                {dp.score}
                              </span>
                              <div
                                className="relative w-full overflow-hidden rounded-sm bg-warm-gray/15"
                                style={{ height: '60px' }}
                              >
                                <div
                                  className={`absolute inset-x-0 bottom-0 rounded-sm ${dp.score > 70 ? 'bg-zone-red/70' : dp.score >= 30 ? 'bg-gold/60' : 'bg-sage/50'}`}
                                  style={{ height: `${dp.score}%` }}
                                />
                              </div>
                              <span className="text-[9px] text-muted">{dp.day}</span>
                            </div>
                          );
                        })}
                      </div>
                      {/* Threshold line label */}
                      <div className="mt-1 flex items-center gap-1">
                        <div className="h-px flex-1 border-t border-dashed border-zone-red/40" />
                        <span className="text-[9px] text-zone-red">70 threshold</span>
                        <div className="h-px flex-1 border-t border-dashed border-zone-red/40" />
                      </div>
                    </div>
                  )}

                  {/* Contributing Factors */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold text-primary">
                      <svg
                        className="mr-1 inline h-3.5 w-3.5 text-copper"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                        />
                      </svg>
                      Contributing Factors
                    </h4>
                    <div className="space-y-2">
                      {patient.factors.map((f) => (
                        <div key={f.label} className="rounded-lg bg-white/80 p-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-primary">{f.label}</span>
                            <span className="text-[10px] font-semibold text-copper">
                              {Math.round(f.weight * 100)}% weight
                            </span>
                          </div>
                          {/* Weight bar */}
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-warm-gray/20">
                            <div
                              className="h-full rounded-full bg-copper/60"
                              style={{ width: `${f.weight * 100}%` }}
                            />
                          </div>
                          <p className="mt-1 text-[10px] text-secondary">{f.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Omaha Problem Mapping */}
                  {patient.omahaProblems && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold text-primary">
                        <svg
                          className="mr-1 inline h-3.5 w-3.5 text-copper"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 6h.008v.008H6V6z"
                          />
                        </svg>
                        Omaha Problem Mapping
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {patient.omahaProblems.map((op) => (
                          <span
                            key={op.code}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white/80 px-2.5 py-1.5"
                          >
                            <span className="text-[10px] font-bold text-copper">{op.code}</span>
                            <span className="text-[11px] text-primary">{op.name}</span>
                            <span className="text-[9px] text-muted">({op.domain})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Interventions */}
                  {patient.interventions && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold text-primary">
                        <svg
                          className="mr-1 inline h-3.5 w-3.5 text-copper"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                          />
                        </svg>
                        Recommended Interventions
                      </h4>
                      <div className="space-y-1.5">
                        {patient.interventions.map((iv, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 rounded-lg bg-white/80 p-2.5"
                          >
                            <span
                              className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium ${priorityBadge(iv.priority)}`}
                            >
                              {iv.priority}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] text-primary">{iv.action}</p>
                              <p className="text-[9px] text-muted">Assigned to: {iv.assignee}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p className="text-[11px] text-muted">
        Risk scores generated daily using wearable vitals, worker-owner care notes (NLP), Time Bank
        neighbor observations, CRI assessment trends, and medication adherence data. Scores above 70
        trigger automatic Medical Director notification. Each avoided hospitalization saves $16,037
        (BCH average readmission cost).
      </p>
    </div>
  );
}
