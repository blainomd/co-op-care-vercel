/**
 * Josh's LMN Review Dashboard — CareOS Command Center
 *
 * THE revenue bottleneck UI. Josh sees:
 * - Triage stats: how many auto-approved, how much time saved
 * - Priority-sorted queue (urgent = red, elevated = yellow, standard = green)
 * - Auto-approved daily digest with safety gate results
 * - Pipeline analytics and agent health
 * - One-click sign or reject
 *
 * Falls back to client-side demo data when backend isn't running,
 * so Josh can always see what the system looks like populated.
 *
 * Route: /admin/review
 */
import { useState, useEffect, useCallback } from 'react';
import {
  DEMO_REVIEW_QUEUE,
  DEMO_REVIEW_DETAILS,
  DEMO_AUTO_APPROVED,
  DEMO_TRIAGE_STATS,
  DEMO_SYNTHESIS,
  DEMO_AGENT_STATUS,
  type DemoReviewItem,
  type DemoAutoApprovedItem,
  type DemoTriageStats,
  type DemoSynthesisReport,
} from './demo-data.js';

// ─── Types ──────────────────────────────────────────────────────────────

type ReviewItem = DemoReviewItem;

type AutoApprovedItem = DemoAutoApprovedItem;

type TriageStats = DemoTriageStats;

interface ReviewDetail {
  id: string;
  draftText: string;
  riskFlags: string[];
  diagnosisCodes: string[];
  priority: string;
  status: string;
  careRecipientName: string;
  careRecipientAge: number;
  careRecipientState: string;
  monthlyCost: number;
  estimatedHsaSavings: number;
  recommendedTier: string;
  acuity: string;
}

type SynthesisReport = DemoSynthesisReport;

const API_BASE = '/api/v1/agents';

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-100 text-red-800 border-red-300',
  elevated: 'bg-amber-100 text-amber-800 border-amber-300',
  standard: 'bg-green-100 text-green-800 border-green-300',
};

const priorityBadge: Record<string, string> = {
  urgent: 'bg-red-600 text-white',
  elevated: 'bg-amber-500 text-white',
  standard: 'bg-green-600 text-white',
};

const priorityLabel: Record<string, string> = {
  urgent: 'CLINICAL HOLD',
  elevated: 'FULL REVIEW',
  standard: 'QUICK REVIEW',
};

const priorityTime: Record<string, string> = {
  urgent: 'Requires clinical decision',
  elevated: '3-5 min review',
  standard: '30 sec glance',
};

const acuityLabels: Record<string, string> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  moderate: 'MODERATE',
  low: 'LOW',
};

export default function ReviewDashboard() {
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ReviewDetail | null>(null);
  const [synthesis, setSynthesis] = useState<SynthesisReport | null>(null);
  const [agentStatus, setAgentStatus] = useState<typeof DEMO_AGENT_STATUS | null>(null);
  const [autoApproved, setAutoApproved] = useState<AutoApprovedItem[]>([]);
  const [triageStats, setTriageStats] = useState<TriageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [tab, setTab] = useState<'queue' | 'auto' | 'synthesis' | 'agents'>('queue');
  const [notes, setNotes] = useState('');

  // ── Fetch with demo fallback ────────────────────────────────────────

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/review-queue?status=pending`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.items?.length > 0) {
        setQueue(data.items);
        return true;
      }
    } catch {
      /* fallback below */
    }
    return false;
  }, []);

  const fetchAutoApproved = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/auto-approved`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.items?.length > 0) {
        setAutoApproved(data.items);
        return true;
      }
    } catch {
      /* fallback below */
    }
    return false;
  }, []);

  const fetchTriageStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/triage-stats`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.total > 0) {
        setTriageStats(data);
        return true;
      }
    } catch {
      /* fallback below */
    }
    return false;
  }, []);

  const fetchSynthesis = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/synthesis`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.report) {
        setSynthesis(data.report);
        return true;
      }
    } catch {
      /* fallback below */
    }
    return false;
  }, []);

  const fetchAgentStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/status`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.agents?.length > 0) {
        setAgentStatus(data);
        return true;
      }
    } catch {
      /* fallback below */
    }
    return false;
  }, []);

  const loadDemoData = useCallback(() => {
    setDemoMode(true);
    setQueue(DEMO_REVIEW_QUEUE);
    setAutoApproved(DEMO_AUTO_APPROVED);
    setTriageStats(DEMO_TRIAGE_STATS);
    setSynthesis(DEMO_SYNTHESIS);
    setAgentStatus(DEMO_AGENT_STATUS);
  }, []);

  useEffect(() => {
    async function init() {
      const results = await Promise.all([
        fetchQueue(),
        fetchAutoApproved(),
        fetchTriageStats(),
        fetchSynthesis(),
        fetchAgentStatus(),
      ]);
      // If no API returned real data, load demo data automatically
      if (!results.some(Boolean)) {
        loadDemoData();
      }
      setLoading(false);
    }
    init();
    const interval = setInterval(async () => {
      if (!demoMode) {
        const results = await Promise.all([
          fetchQueue(),
          fetchAutoApproved(),
          fetchTriageStats(),
          fetchAgentStatus(),
        ]);
        if (!results.some(Boolean) && !demoMode) {
          loadDemoData();
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [
    fetchQueue,
    fetchAutoApproved,
    fetchTriageStats,
    fetchSynthesis,
    fetchAgentStatus,
    loadDemoData,
    demoMode,
  ]);

  // ── Actions ─────────────────────────────────────────────────────────

  const selectItem = async (id: string) => {
    if (demoMode) {
      const detail = DEMO_REVIEW_DETAILS[id];
      if (detail) setSelectedItem(detail);
      setNotes('');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/review-queue/${id}`);
      const data = await res.json();
      setSelectedItem(data.item);
      setNotes('');
    } catch {
      setSelectedItem(null);
    }
  };

  const signLMN = async () => {
    if (!selectedItem) return;
    if (demoMode) {
      // Simulate signing in demo mode
      setQueue((prev) => prev.filter((i) => i.id !== selectedItem.id));
      setTriageStats((prev) =>
        prev
          ? {
              ...prev,
              pending: prev.pending - 1,
              signed: prev.signed + 1,
            }
          : prev,
      );
      setSelectedItem(null);
      return;
    }
    setSigning(true);
    try {
      await fetch(`${API_BASE}/review/${selectedItem.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      setSelectedItem(null);
      await fetchQueue();
    } finally {
      setSigning(false);
    }
  };

  const rejectLMN = async () => {
    if (!selectedItem) return;
    if (demoMode) {
      setQueue((prev) => prev.filter((i) => i.id !== selectedItem.id));
      setTriageStats((prev) =>
        prev
          ? {
              ...prev,
              pending: prev.pending - 1,
              rejected: prev.rejected + 1,
            }
          : prev,
      );
      setSelectedItem(null);
      return;
    }
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    try {
      await fetch(`${API_BASE}/review/${selectedItem.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      setSelectedItem(null);
      await fetchQueue();
    } catch {
      /* ignore */
    }
  };

  const runSynthesis = async () => {
    if (demoMode) return; // Already showing demo synthesis
    try {
      const res = await fetch(`${API_BASE}/synthesis/run`, { method: 'POST' });
      const data = await res.json();
      setSynthesis(data.report);
    } catch {
      /* ignore */
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-sage/20 border-t-sage" />
          <p className="mt-3 font-body text-sm text-text-muted">Loading agent dashboard...</p>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-warm-gray/20 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-navy">CareOS Command Center</h1>
            <p className="font-body text-sm text-text-muted">
              Dr. Emdur's LMN review queue · Agent health · Pipeline analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            {demoMode && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                Demo Mode
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              {agentStatus?.agents?.length ?? 0} agents online
            </span>
            <span className="rounded-full bg-navy/10 px-3 py-1 text-xs font-medium text-navy">
              {queue.length} need{queue.length !== 1 ? '' : 's'} review
            </span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-warm-gray/20 bg-white px-6">
        <div className="mx-auto flex max-w-7xl gap-6">
          {(['queue', 'auto', 'synthesis', 'agents'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                tab === t
                  ? 'border-sage text-sage'
                  : 'border-transparent text-text-muted hover:text-navy'
              }`}
            >
              {t === 'queue'
                ? `Review Queue (${queue.length})`
                : t === 'auto'
                  ? `Auto-Approved (${autoApproved.length})`
                  : t === 'synthesis'
                    ? 'Pipeline Analytics'
                    : 'Agent Health'}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* ── Triage Stats Banner ── */}
        {triageStats && triageStats.total > 0 && (
          <div className="mb-6">
            <p className="mb-2 text-xs font-medium text-text-muted uppercase tracking-wider">
              Today's Triage Summary
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
              <div className="rounded-xl border border-warm-gray/20 bg-white p-3 text-center">
                <p className="text-2xl font-bold text-navy">{triageStats.total}</p>
                <p className="text-xs text-text-muted">Total LMNs</p>
              </div>
              <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{triageStats.autoApproved}</p>
                <p className="text-xs text-green-600">Auto-Approved</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
                <p className="text-2xl font-bold text-amber-700">{triageStats.pending}</p>
                <p className="text-xs text-amber-600">Needs Your Review</p>
              </div>
              <div className="rounded-xl border border-sage/20 bg-sage/5 p-3 text-center">
                <p className="text-2xl font-bold text-sage">{triageStats.signed}</p>
                <p className="text-xs text-sage">Signed Today</p>
              </div>
              <div className="rounded-xl border border-warm-gray/20 bg-white p-3 text-center">
                <p className="text-2xl font-bold text-navy">
                  {Math.round(triageStats.autoApproveRate * 100)}%
                </p>
                <p className="text-xs text-text-muted">Auto-Approve Rate</p>
              </div>
              <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-center">
                <p className="text-2xl font-bold text-green-700">
                  {triageStats.estimatedJoshMinutesSaved} min
                </p>
                <p className="text-xs text-green-600">Your Time Saved</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-text-muted">
              The AI triaged {triageStats.total} LMNs through 8 safety gates.{' '}
              {triageStats.autoApproved} routine cases were auto-approved — you only need to review
              the {triageStats.pending} flagged cases below.
            </p>
          </div>
        )}

        {/* ── QUEUE TAB ── */}
        {tab === 'queue' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Queue list */}
            <div className="lg:col-span-1 space-y-3">
              <h2 className="font-serif text-lg font-semibold text-navy">Needs Your Review</h2>
              <p className="text-xs text-text-muted -mt-2 mb-2">
                These LMNs failed one or more safety gates. Sorted by urgency.
              </p>
              {queue.length === 0 ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
                  <p className="text-lg font-serif font-semibold text-green-700">All caught up!</p>
                  <p className="mt-1 text-sm text-green-600">No LMNs need your review right now.</p>
                </div>
              ) : (
                queue.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => selectItem(item.id)}
                    className={`w-full rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                      selectedItem?.id === item.id ? 'ring-2 ring-sage' : ''
                    } ${priorityColors[item.priority]}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-serif font-semibold">{item.careRecipientName}</p>
                        <p className="text-xs opacity-80">
                          Age {item.careRecipientAge} · {item.careRecipientState} ·{' '}
                          {item.recommendedTier}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${priorityBadge[item.priority]}`}
                        >
                          {priorityLabel[item.priority] ?? item.priority}
                        </span>
                        <p className="mt-1 text-xs opacity-60">{priorityTime[item.priority]}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-3 text-xs opacity-70">
                      <span>${item.monthlyCost}/mo</span>
                      <span>
                        {item.riskFlagCount} risk flag{item.riskFlagCount !== 1 ? 's' : ''}
                      </span>
                      <span>
                        {item.diagnosisCount} diagnos{item.diagnosisCount !== 1 ? 'es' : 'is'}
                      </span>
                      <span>{acuityLabels[item.acuity] ?? item.acuity}</span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* LMN Detail */}
            <div className="lg:col-span-2">
              {selectedItem ? (
                <div className="rounded-xl border border-warm-gray/20 bg-white p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-xl font-bold text-navy">
                        {selectedItem.careRecipientName}
                      </h2>
                      <p className="text-sm text-text-muted">
                        Age {selectedItem.careRecipientAge} · {selectedItem.careRecipientState} ·{' '}
                        {selectedItem.recommendedTier} · ${selectedItem.monthlyCost}/mo · HSA
                        savings: ${selectedItem.estimatedHsaSavings}/mo
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${priorityBadge[selectedItem.priority] ?? 'bg-gray-500 text-white'}`}
                    >
                      {priorityLabel[selectedItem.priority] ?? selectedItem.priority} ·{' '}
                      {acuityLabels[selectedItem.acuity]}
                    </span>
                  </div>

                  {/* Why flagged */}
                  <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <p className="text-xs font-bold text-amber-800 uppercase mb-1">
                      Why This Needs Your Review
                    </p>
                    <p className="text-xs text-amber-700">
                      {selectedItem.priority === 'urgent'
                        ? 'Multiple critical concerns: high acuity, caregiver in crisis, complex diagnoses. May exceed companion care scope.'
                        : selectedItem.priority === 'elevated'
                          ? 'Significant clinical concern — complex diagnoses or care intensity exceeds auto-approval thresholds.'
                          : 'Minor flag — age over 85 or polypharmacy. Quick verification that care plan is appropriate.'}
                    </p>
                  </div>

                  {/* Risk Flags */}
                  {selectedItem.riskFlags.length > 0 && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3">
                      <p className="mb-1 text-xs font-bold text-red-700 uppercase">Risk Flags</p>
                      {selectedItem.riskFlags.map((flag, i) => (
                        <p key={i} className="text-xs text-red-600">
                          • {flag.replace(/_/g, ' ')}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Diagnoses */}
                  <div className="mb-4">
                    <p className="mb-1 text-xs font-bold text-navy/60 uppercase">Diagnosis Codes</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedItem.diagnosisCodes.map((code, i) => (
                        <span
                          key={i}
                          className="rounded bg-navy/10 px-2 py-0.5 text-xs font-mono text-navy"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* LMN Text */}
                  <div className="mb-4 max-h-96 overflow-y-auto rounded-lg bg-cream p-4">
                    <pre className="whitespace-pre-wrap font-body text-xs leading-relaxed text-navy/80">
                      {selectedItem.draftText}
                    </pre>
                  </div>

                  {/* Reviewer Notes */}
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes (optional) — e.g., 'Confirmed appropriate for companion care level'..."
                    className="mb-4 w-full rounded-lg border border-warm-gray/30 p-3 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                    rows={2}
                  />

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={signLMN}
                      disabled={signing}
                      className="flex-1 rounded-xl bg-sage px-6 py-3 font-serif font-bold text-white transition-all hover:bg-sage/90 disabled:opacity-50"
                    >
                      {signing ? 'Signing...' : 'Sign LMN'}
                    </button>
                    <button
                      onClick={rejectLMN}
                      className="rounded-xl border border-red-300 px-6 py-3 font-serif font-medium text-red-600 transition-all hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex h-96 flex-col items-center justify-center rounded-xl border border-warm-gray/20 bg-white">
                  <p className="font-serif text-lg text-navy/40">Select an LMN to review</p>
                  <p className="mt-1 text-xs text-text-muted">
                    Click a case on the left to see the full letter
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── AUTO-APPROVED TAB ── */}
        {tab === 'auto' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-semibold text-navy">Auto-Approved LMNs</h2>
                <p className="text-xs text-text-muted">
                  These passed all 8 safety gates — no physician review needed. You see them here
                  for transparency.
                </p>
              </div>
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-center">
                <p className="text-lg font-bold text-green-700">
                  {autoApproved.length} auto-approved
                </p>
                <p className="text-xs text-green-600">{autoApproved.length * 3} minutes saved</p>
              </div>
            </div>

            {/* Safety gates explanation */}
            <div className="rounded-xl border border-warm-gray/20 bg-white p-4">
              <p className="mb-2 text-xs font-bold text-navy/60 uppercase">
                8 Safety Gates (all must pass)
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-text-muted md:grid-cols-4">
                <span>1. Acuity: CRI 19-32 (moderate)</span>
                <span>2. Caregiver: not in crisis</span>
                <span>3. Risk flags: 0 critical</span>
                <span>4. Age: under 85</span>
                <span>5. Medications: 5 or fewer</span>
                <span>6. Diagnoses: all standard</span>
                <span>7. Hours: 12/week or less</span>
                <span>8. Data: no contradictions</span>
              </div>
            </div>

            {autoApproved.length === 0 ? (
              <div className="rounded-xl border border-warm-gray/20 bg-white p-8 text-center">
                <p className="text-text-muted">No auto-approved LMNs yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {autoApproved.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-green-200 bg-green-50/50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-serif font-semibold text-navy">
                            {item.careRecipientName}
                          </p>
                          <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white uppercase">
                            Auto-Approved
                          </span>
                        </div>
                        <p className="text-xs text-text-muted">
                          Age {item.careRecipientAge} · {item.careRecipientState} ·{' '}
                          {item.recommendedTier} · ${item.monthlyCost}/mo · HSA savings: $
                          {item.estimatedHsaSavings}/mo
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-green-700">
                          Risk: {item.triage?.riskScore ?? 0}/100
                        </p>
                        <p className="text-xs text-text-muted">{item.triage?.joshTimeEstimate}</p>
                      </div>
                    </div>

                    {/* Gate Results — visual checklist */}
                    {item.triage?.gateResults && (
                      <div className="mt-3 grid grid-cols-2 gap-1 md:grid-cols-4">
                        {item.triage.gateResults.map((gate, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs">
                            <span
                              className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${gate.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                            >
                              {gate.passed ? '\u2713' : '\u2717'}
                            </span>
                            <span className="text-text-muted">{gate.gate}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="mt-2 text-xs text-green-700 italic">{item.triage?.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SYNTHESIS TAB ── */}
        {tab === 'synthesis' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-semibold text-navy">Pipeline Analytics</h2>
                <p className="text-xs text-text-muted">
                  How families flow through the care pipeline, where they get stuck, and what to do
                  about it
                </p>
              </div>
              {!demoMode && (
                <button
                  onClick={runSynthesis}
                  className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage/90"
                >
                  Run Synthesis Now
                </button>
              )}
            </div>

            {synthesis ? (
              <>
                {/* Funnel */}
                <div className="rounded-xl border border-warm-gray/20 bg-white p-6">
                  <h3 className="mb-1 font-serif font-semibold text-navy">Care Pipeline Funnel</h3>
                  <p className="mb-4 text-xs text-text-muted">
                    Each number = families at that stage right now
                  </p>
                  <div className="grid grid-cols-5 gap-2 lg:grid-cols-10">
                    {Object.entries(synthesis.funnel).map(([stage, count]) => (
                      <div key={stage} className="text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-sage/10 font-bold text-sage">
                          {count}
                        </div>
                        <p className="mt-1 text-[10px] text-text-muted leading-tight">
                          {stage.replace(/_/g, ' ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Revenue */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="rounded-xl border border-warm-gray/20 bg-white p-4 text-center">
                    <p className="text-2xl font-bold text-sage">
                      ${synthesis.revenue.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-text-muted">LMN Revenue</p>
                  </div>
                  <div className="rounded-xl border border-warm-gray/20 bg-white p-4 text-center">
                    <p className="text-2xl font-bold text-navy">{synthesis.revenue.lmnsPaid}</p>
                    <p className="text-xs text-text-muted">LMNs Paid</p>
                  </div>
                  <div className="rounded-xl border border-warm-gray/20 bg-white p-4 text-center">
                    <p className="text-2xl font-bold text-amber-600">
                      {synthesis.revenue.lmnsPending}
                    </p>
                    <p className="text-xs text-text-muted">Invoices Pending</p>
                  </div>
                  <div className="rounded-xl border border-warm-gray/20 bg-white p-4 text-center">
                    <p className="text-2xl font-bold text-navy">${synthesis.revenue.avgLmnValue}</p>
                    <p className="text-xs text-text-muted">Avg LMN Value</p>
                  </div>
                </div>

                {/* Bottlenecks */}
                {synthesis.bottlenecks.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
                    <h3 className="mb-3 font-serif font-semibold text-amber-800">
                      Bottlenecks Detected
                    </h3>
                    <p className="mb-3 text-xs text-amber-700">
                      The Synthesis Agent found stages where families are getting stuck
                    </p>
                    {synthesis.bottlenecks.map((b, i) => (
                      <div key={i} className="mb-2 rounded-lg bg-white p-3">
                        <p className="font-medium text-navy">
                          {b.count} families stuck in "{b.stage}" — avg {b.avgDaysStuck} days
                        </p>
                        <p className="text-sm text-text-muted">{b.recommendation}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Insights */}
                {synthesis.insights.length > 0 && (
                  <div className="rounded-xl border border-warm-gray/20 bg-white p-6">
                    <h3 className="mb-1 font-serif font-semibold text-navy">AI Insights</h3>
                    <p className="mb-3 text-xs text-text-muted">
                      Generated by the Synthesis Agent from cross-agent event analysis
                    </p>
                    {synthesis.insights.map((insight, i) => (
                      <p key={i} className="mb-2 text-sm text-navy/80">
                        • {insight}
                      </p>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-warm-gray/20 bg-white p-8 text-center">
                <p className="text-text-muted">
                  No synthesis report yet. Click "Run Synthesis Now" to generate.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── AGENTS TAB ── */}
        {tab === 'agents' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-serif text-lg font-semibold text-navy">Agent Health Monitor</h2>
              <p className="text-xs text-text-muted">
                6 autonomous agents process events in real-time. The Synthesis Agent monitors all
                others and flags anomalies.
              </p>
            </div>

            {/* Agent description cards */}
            {agentStatus?.agents ? (
              <>
                {/* Architecture diagram */}
                <div className="rounded-xl border border-warm-gray/20 bg-white p-4">
                  <p className="mb-2 text-xs font-bold text-navy/60 uppercase">Agent Pipeline</p>
                  <div className="flex items-center justify-between gap-1 overflow-x-auto text-xs">
                    {[
                      {
                        name: 'profile-builder',
                        label: 'Profile Builder',
                        desc: 'Extracts family data from Sage conversations',
                      },
                      {
                        name: 'assessor',
                        label: 'Assessor',
                        desc: 'Runs CII/CRI assessments conversationally',
                      },
                      {
                        name: 'lmn-trigger',
                        label: 'LMN Trigger',
                        desc: 'Auto-generates LMN drafts when eligible',
                      },
                      {
                        name: 'review-router',
                        label: 'Review Router',
                        desc: 'Triages LMNs — auto-approve or queue for Josh',
                      },
                      {
                        name: 'billing',
                        label: 'Billing',
                        desc: 'Creates Stripe invoices after signing',
                      },
                      {
                        name: 'synthesis',
                        label: 'Synthesis',
                        desc: 'Monitors all agents + generates insights',
                      },
                    ].map((a, i) => (
                      <div key={a.name} className="flex items-center gap-1">
                        <div className="min-w-[100px] rounded-lg bg-sage/5 border border-sage/20 p-2 text-center">
                          <p className="font-medium text-navy text-[11px]">{a.label}</p>
                          <p className="text-[9px] text-text-muted leading-tight">{a.desc}</p>
                        </div>
                        {i < 5 && <span className="text-sage/40 text-lg">→</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Health cards */}
                {agentStatus.agents.map((agent) => {
                  const descriptions: Record<string, string> = {
                    'profile-builder':
                      'Listens to conversations, extracts names, ages, conditions, medications. Triggers assessment when profile is 70%+ complete.',
                    assessor:
                      'Injects CII/CRI questions into Sage conversation. Scores caregiver impact and care recipient needs.',
                    'lmn-trigger':
                      'When assessment completes, checks eligibility and generates full LMN draft with Omaha problem codes.',
                    'review-router':
                      'Runs 8 safety gates on every LMN. Auto-approves routine cases, queues complex ones for Josh.',
                    billing:
                      'Creates Stripe payment intents after Josh signs. Tracks invoice status and subscription lifecycle.',
                    synthesis:
                      'Wildcard listener — sees ALL events. Calculates funnel metrics, finds bottlenecks, generates nightly insights.',
                  };
                  return (
                    <div
                      key={agent.name}
                      className="flex items-center justify-between rounded-xl border border-warm-gray/20 bg-white p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-3 w-3 rounded-full ${
                            agent.errorRate > 0.5
                              ? 'bg-red-500'
                              : agent.errorRate > 0.1
                                ? 'bg-amber-500'
                                : 'bg-green-500'
                          }`}
                        />
                        <div>
                          <p className="font-serif font-semibold text-navy">{agent.name}</p>
                          <p className="text-xs text-text-muted">
                            {descriptions[agent.name] ?? ''}
                          </p>
                          <p className="mt-1 text-xs text-navy/50">
                            {agent.eventCount} events · {(agent.errorRate * 100).toFixed(1)}% errors
                            {agent.lastEventAt
                              ? ` · Last active: ${new Date(agent.lastEventAt).toLocaleTimeString()}`
                              : ''}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          agent.errorRate > 0.5
                            ? 'bg-red-100 text-red-700'
                            : agent.errorRate > 0.1
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {agent.errorRate > 0.5
                          ? 'FAILING'
                          : agent.errorRate > 0.1
                            ? 'DEGRADED'
                            : 'HEALTHY'}
                      </span>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="rounded-xl border border-warm-gray/20 bg-white p-8 text-center">
                <p className="text-text-muted">
                  Agent status unavailable. Server may not be running.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
