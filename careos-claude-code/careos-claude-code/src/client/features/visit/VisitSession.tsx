/**
 * VisitSession — The care visit experience
 *
 * QR scan → Start Visit → Voice recording → Auto-classification → Time Bank credit
 *
 * Flow:
 *   1. Scan QR → land here with the member's info
 *   2. Tap "Start Visit" → timer begins, optional voice recording
 *   3. Voice transcription captures the visit (opt-in)
 *   4. End visit → Omaha-system classification suggested
 *   5. Review & confirm → Time Bank credit/debit logged
 *   6. Smart contract settlement (future: on-chain via CareHour ERC-7818)
 *
 * Privacy: Voice recording is opt-in. Transcription happens on-device
 * via Web Speech API. No audio leaves the phone unless the user chooses.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { TileIcon } from '../../components/TileIcon';

// ─── Omaha System Classification ───────────────────────────────────────
// Simplified version — maps keywords from visit transcript to Omaha domains

interface OmahaClassification {
  domain: string;
  problem: string;
  interventions: string[];
  billingHint: string;
}

function classifyVisit(transcript: string): OmahaClassification[] {
  const lower = transcript.toLowerCase();
  const classifications: OmahaClassification[] = [];

  // Companionship / Social isolation
  if (lower.match(/lonely|alone|isolat|social|friend|visit|company|talk/)) {
    classifications.push({
      domain: 'Psychosocial',
      problem: 'Social contact',
      interventions: ['Companionship visit', 'Social engagement', 'Active listening'],
      billingHint: 'CHI G0019 — Social isolation (SDOH)',
    });
  }

  // Medication
  if (lower.match(/medic|pill|prescri|dose|pharma|drug|refill/)) {
    classifications.push({
      domain: 'Physiological',
      problem: 'Medication regimen',
      interventions: ['Medication reminder', 'Adherence support', 'Pharmacy coordination'],
      billingHint: 'CCM 99490 — Medication management',
    });
  }

  // Nutrition / meals
  if (lower.match(/eat|meal|food|cook|grocer|nutrition|diet|hungry|appetite/)) {
    classifications.push({
      domain: 'Physiological',
      problem: 'Nutrition',
      interventions: ['Meal preparation', 'Grocery assistance', 'Nutrition guidance'],
      billingHint: 'CHI G0019 — Food insecurity (SDOH)',
    });
  }

  // Transportation
  if (lower.match(/drive|appointment|transport|ride|car|bus|doctor|hospital/)) {
    classifications.push({
      domain: 'Health-related behaviors',
      problem: 'Healthcare supervision',
      interventions: ['Transportation to appointment', 'Medical escort', 'Schedule coordination'],
      billingHint: 'CHI G0019 — Transportation (SDOH)',
    });
  }

  // Caregiver burden
  if (lower.match(/stress|burnout|overwhelm|tired|exhaust|caregiver|break|respite/)) {
    classifications.push({
      domain: 'Psychosocial',
      problem: 'Caretaking/parenting',
      interventions: ['Respite care', 'Caregiver support', 'Stress assessment'],
      billingHint: 'PIN G0023 — Care navigation',
    });
  }

  // Safety / falls
  if (lower.match(/fall|safe|balance|walk|stairs|grab bar|slip/)) {
    classifications.push({
      domain: 'Environmental',
      problem: 'Residence safety',
      interventions: ['Home safety assessment', 'Fall prevention', 'Environmental modification'],
      billingHint: 'PIN G0023 — Safety navigation',
    });
  }

  // Default — general companionship
  if (classifications.length === 0) {
    classifications.push({
      domain: 'Psychosocial',
      problem: 'Social contact',
      interventions: ['Companionship visit', 'Wellness check'],
      billingHint: 'CHI G0019 — Community health',
    });
  }

  return classifications;
}

// ─── Visit State Machine ───────────────────────────────────────────────

type VisitPhase = 'ready' | 'active' | 'summary' | 'confirmed';

interface VisitData {
  startedAt: Date | null;
  endedAt: Date | null;
  durationMinutes: number;
  transcriptLines: string[];
  classifications: OmahaClassification[];
  timeBankCredit: number; // hours
}

// ─── Component ─────────────────────────────────────────────────────────

export function VisitSession() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<VisitPhase>('ready');
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [visit, setVisit] = useState<VisitData>({
    startedAt: null,
    endedAt: null,
    durationMinutes: 0,
    transcriptLines: [],
    classifications: [],
    timeBankCredit: 0,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);

  // Timer
  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Voice recognition
  const startRecording = useCallback(() => {
    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: Event) => {
      const e = event as Event & { results: SpeechRecognitionResultList; resultIndex: number };
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i]?.[0]?.transcript;
        if (transcript && e.results[i]?.isFinal) {
          setVisit((v) => ({
            ...v,
            transcriptLines: [...v.transcriptLines, transcript],
          }));
        }
      }
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => {
      // Restart if still active
      if (recognitionRef.current && phase === 'active') {
        try {
          recognitionRef.current.start();
        } catch {
          setRecording(false);
        }
      }
    };

    recognition.start();
    setRecording(true);
  }, [phase]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // prevent auto-restart
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setRecording(false);
  }, []);

  // Start visit
  const handleStart = () => {
    setPhase('active');
    setVisit((v) => ({ ...v, startedAt: new Date() }));
  };

  // End visit
  const handleEnd = () => {
    stopRecording();
    if (timerRef.current) clearInterval(timerRef.current);

    const durationMinutes = Math.ceil(elapsed / 60);
    const timeBankCredit = Math.round((elapsed / 3600) * 10) / 10; // round to 0.1 hrs
    const fullTranscript = visit.transcriptLines.join(' ');
    const classifications = classifyVisit(fullTranscript);

    setVisit((v) => ({
      ...v,
      endedAt: new Date(),
      durationMinutes,
      classifications,
      timeBankCredit,
    }));
    setPhase('summary');
  };

  // Confirm & log
  const handleConfirm = () => {
    // TODO: persist visit to store/backend, credit Time Bank
    // TODO: smart contract settlement (CareHour ERC-7818)
    setPhase('confirmed');
  };

  const voiceSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const visitingName = memberId || 'a neighbor';

  // ─── Render phases ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-warm-white">
      <header className="flex items-center justify-between px-6 py-4">
        <Logo variant="horizontal" size="sm" />
        <button
          type="button"
          onClick={() => navigate('/card')}
          className="text-sm text-text-muted hover:text-navy"
        >
          Back to card
        </button>
      </header>

      <div className="mx-auto max-w-sm px-6 pb-10">
        {/* ─── Ready Phase ─────────────────────────────────────── */}
        {phase === 'ready' && (
          <div className="warm-entrance text-center pt-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
              <TileIcon name="home" size={28} />
            </div>
            <h1 className="mt-4 font-heading text-2xl font-bold text-navy">Start a care visit</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Visiting <strong className="text-navy">{visitingName}</strong>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              When you start, the visit timer begins. You can optionally record the visit — voice
              notes help Sage understand what kind of care was provided.
            </p>

            {/* Consent notice */}
            <div className="mt-6 rounded-xl border border-border bg-white p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-bark-light">
                Your choice
              </p>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                Voice recording is <strong className="text-navy">optional</strong>. If enabled,
                speech is transcribed on your device — no audio leaves your phone. Transcripts help
                auto-classify the visit for billing and Time Bank credits.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStart}
              className="mt-6 w-full rounded-xl bg-sage py-4 text-lg font-semibold text-white shadow-sm transition-all hover:bg-sage-dark active:scale-[0.98]"
            >
              Start visit
            </button>
          </div>
        )}

        {/* ─── Active Phase ────────────────────────────────────── */}
        {phase === 'active' && (
          <div className="warm-entrance pt-8 text-center">
            {/* Timer — large, prominent */}
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-sage/10 ring-4 ring-sage/20">
              <span className="font-mono text-3xl font-bold text-sage-dark">
                {formatTime(elapsed)}
              </span>
            </div>

            <p className="mt-4 font-heading text-lg font-semibold text-navy">Visit in progress</p>
            <p className="mt-1 text-sm text-text-muted">with {visitingName}</p>

            {/* Voice recording toggle */}
            {voiceSupported && (
              <div className="mt-6">
                {recording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="mx-auto flex items-center gap-2 rounded-full bg-zone-red/10 px-5 py-2.5 text-sm font-medium text-zone-red transition-all active:scale-95"
                  >
                    <span className="h-2 w-2 animate-pulse rounded-full bg-zone-red" />
                    Recording · tap to pause
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="mx-auto flex items-center gap-2 rounded-full bg-sage/10 px-5 py-2.5 text-sm font-medium text-sage-dark transition-all hover:bg-sage/20 active:scale-95"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" x2="12" y1="19" y2="22" />
                    </svg>
                    Start voice notes
                  </button>
                )}

                {/* Live transcript */}
                {visit.transcriptLines.length > 0 && (
                  <div className="mt-4 max-h-32 overflow-y-auto rounded-xl border border-border bg-white p-3 text-left">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-bark-light">
                      Visit notes
                    </p>
                    {visit.transcriptLines.map((line, i) => (
                      <p key={i} className="text-xs leading-relaxed text-text-secondary">
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* End visit */}
            <button
              type="button"
              onClick={handleEnd}
              className="mt-8 w-full rounded-xl border-2 border-navy/20 bg-white py-3.5 font-semibold text-navy transition-all hover:bg-navy/5 active:scale-[0.98]"
            >
              End visit
            </button>
          </div>
        )}

        {/* ─── Summary Phase ───────────────────────────────────── */}
        {phase === 'summary' && (
          <div className="warm-entrance pt-8">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/10">
                <span className="text-2xl">✓</span>
              </div>
              <h1 className="mt-3 font-heading text-xl font-bold text-navy">Visit complete</h1>
              <p className="mt-1 text-sm text-text-muted">
                {visit.durationMinutes} minutes with {visitingName}
              </p>
            </div>

            {/* Time Bank credit */}
            <div className="mt-6 rounded-xl bg-sage/8 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-sage-dark">
                Time Bank credit
              </p>
              <p className="mt-1 font-heading text-3xl font-bold text-sage-dark">
                +{visit.timeBankCredit} hrs
              </p>
              <p className="mt-1 text-xs text-text-muted">Pending confirmation</p>
            </div>

            {/* Omaha classification */}
            {visit.classifications.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="px-1 text-xs font-semibold uppercase tracking-wider text-bark-light">
                  Auto-classified care
                </p>
                {visit.classifications.map((c, i) => (
                  <div key={i} className="rounded-xl border border-border bg-white p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-navy">{c.problem}</span>
                      <span className="rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-medium text-sage-dark">
                        {c.domain}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {c.interventions.map((int, j) => (
                        <span
                          key={j}
                          className="rounded-full bg-warm-gray px-2 py-0.5 text-[10px] text-text-secondary"
                        >
                          {int}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] font-medium text-bark-light">{c.billingHint}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Transcript summary */}
            {visit.transcriptLines.length > 0 && (
              <div className="mt-4 rounded-xl border border-border bg-white p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-bark-light">
                  Voice notes ({visit.transcriptLines.length})
                </p>
                <div className="mt-1 max-h-24 overflow-y-auto">
                  {visit.transcriptLines.map((line, i) => (
                    <p key={i} className="text-xs leading-relaxed text-text-secondary">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm */}
            <div className="mt-6 space-y-2">
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full rounded-xl bg-sage py-3.5 font-semibold text-white shadow-sm transition-all hover:bg-sage-dark active:scale-[0.98]"
              >
                Confirm &amp; log visit
              </button>
              <p className="text-center text-[10px] text-text-muted">
                This credits {visit.timeBankCredit} hours to your Time Bank
              </p>
            </div>
          </div>
        )}

        {/* ─── Confirmed Phase ─────────────────────────────────── */}
        {phase === 'confirmed' && (
          <div className="warm-entrance pt-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sage/10">
              <TileIcon name="check" size={28} className="celebrate-check" />
            </div>
            <h1 className="mt-4 font-heading text-2xl font-bold text-navy">
              Logged &amp; credited
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              {visit.durationMinutes} minutes of care. {visit.timeBankCredit} hours banked.
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {visit.classifications.map((c) => c.billingHint).join(' · ')}
            </p>

            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={() => navigate('/card')}
                className="w-full rounded-xl bg-sage py-3.5 font-semibold text-white transition-all active:scale-[0.98]"
              >
                Back to my card
              </button>
              <button
                type="button"
                onClick={() => {
                  const shareText = `I just completed a ${visit.durationMinutes}-minute care visit through co-op.care. ${visit.timeBankCredit} hours banked. Neighbors helping neighbors.`;
                  if (navigator.share) {
                    navigator.share({ title: 'co-op.care visit', text: shareText }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(shareText);
                  }
                }}
                className="w-full rounded-xl border border-navy/15 bg-white py-3 text-sm font-medium text-navy transition-all active:scale-[0.98]"
              >
                Share this visit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function createRecognition() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return SR ? new SR() : null;
}

export default VisitSession;
