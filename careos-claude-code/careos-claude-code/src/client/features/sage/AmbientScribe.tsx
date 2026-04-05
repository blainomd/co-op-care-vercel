import { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '../../components/Icon';
// ═══════════════════════════════════════════════════════════════
// co-op.care AmbientScribe — "10-Minute Clinical Sync"
// Whisper transcription → Claude Omaha parser → FHIR R4 output
// The parser is the core IP. The listener is replaceable.
// ═══════════════════════════════════════════════════════════════

// ── OMAHA SYSTEM CONSTANTS ──
const OMAHA_DOMAINS = {
  environmental: {
    code: 'E',
    label: 'Environmental',
    color: '#2D6A4F',
    problems: [
      { id: '01', name: 'Income' },
      { id: '02', name: 'Sanitation' },
      { id: '03', name: 'Residence' },
      { id: '04', name: 'Neighborhood/workplace safety' },
    ],
  },
  psychosocial: {
    code: 'P',
    label: 'Psychosocial',
    color: '#5E548E',
    problems: [
      { id: '05', name: 'Communication with community resources' },
      { id: '06', name: 'Social contact' },
      { id: '07', name: 'Role change' },
      { id: '08', name: 'Interpersonal relationship' },
      { id: '09', name: 'Spirituality' },
      { id: '10', name: 'Grief' },
      { id: '11', name: 'Mental health' },
      { id: '12', name: 'Growth and development' },
      { id: '13', name: 'Abuse and neglect' },
      { id: '14', name: 'Substance use' },
      { id: '15', name: 'Caretaking/parenting' },
      { id: '16', name: 'Cognition' },
    ],
  },
  physiological: {
    code: 'PH',
    label: 'Physiological',
    color: '#9B2226',
    problems: [
      { id: '17', name: 'Hearing' },
      { id: '18', name: 'Vision' },
      { id: '19', name: 'Speech and language' },
      { id: '20', name: 'Oral health' },
      { id: '21', name: 'Integument' },
      { id: '22', name: 'Neuro-musculo-skeletal function' },
      { id: '23', name: 'Respiration' },
      { id: '24', name: 'Circulation' },
      { id: '25', name: 'Digestion-hydration' },
      { id: '26', name: 'Bowel function' },
      { id: '27', name: 'Urinary function' },
      { id: '28', name: 'Reproductive function' },
      { id: '29', name: 'Pregnancy' },
      { id: '30', name: 'Postpartum' },
      { id: '31', name: 'Communicable/infectious condition' },
      { id: '32', name: 'Pain' },
      { id: '33', name: 'Consciousness' },
      { id: '34', name: 'Skin integrity' },
    ],
  },
  healthBehaviors: {
    code: 'HB',
    label: 'Health-Related Behaviors',
    color: '#E76F51',
    problems: [
      { id: '35', name: 'Nutrition' },
      { id: '36', name: 'Sleep and rest patterns' },
      { id: '37', name: 'Physical activity' },
      { id: '38', name: 'Personal care' },
      { id: '39', name: 'Substance use' },
      { id: '40', name: 'Family planning' },
      { id: '41', name: 'Health care supervision' },
      { id: '42', name: 'Medication regimen' },
    ],
  },
};

// ── CLAUDE SYSTEM PROMPT — THE CORE IP ──
const OMAHA_PARSER_PROMPT = `You are the co-op.care CareOS Omaha System Parser. You analyze clinical sync transcripts from home care visits and extract structured clinical data.

CONTEXT: A W-2 caregiver worker-owner has just completed a 10-minute Clinical Sync recording during a home visit. The transcript may include conversation between the caregiver, the patient (care recipient), and a family caregiver (the "Conductor" / Alpha Daughter).

YOUR TASK: Extract clinical observations and map them to the Omaha System taxonomy.

OUTPUT FORMAT — respond ONLY with valid JSON, no markdown, no preamble:
{
  "visit_summary": "2-3 sentence plain-language summary of the visit for the family caregiver's phone",
  "observations": [
    {
      "omaha_problem_id": "24",
      "omaha_problem_name": "Circulation",
      "omaha_domain": "physiological",
      "raw_observation": "The exact quote or paraphrase from transcript",
      "kbs_knowledge": 3,
      "kbs_behavior": 4,
      "kbs_status": 2,
      "clinical_note": "Structured clinical note for this observation",
      "icd10_flag": "I50.9",
      "icd10_description": "Heart failure, unspecified",
      "hcc_flag": true,
      "hcc_category": "HCC85",
      "physician_review_needed": true,
      "physician_review_reason": "Potential undiagnosed CHF — recommend physician evaluation for PACE risk adjustment"
    }
  ],
  "vitals_captured": {
    "blood_pressure": "142/88",
    "heart_rate": null,
    "temperature": null,
    "weight": null,
    "pain_level": null,
    "oxygen_saturation": null
  },
  "medications_mentioned": ["metoprolol", "lisinopril"],
  "behavioral_observations": [
    "Patient asked about deceased spouse three times — possible grief or cognitive concern",
    "Patient was dizzy getting out of shower — fall risk"
  ],
  "social_determinants": [
    "Daughter reports missing work to provide care — caregiver burden"
  ],
  "fall_risk_indicators": ["Dizziness on standing", "Unsteady gait reported"],
  "mood_and_cognition": {
    "mood_observation": "Appeared withdrawn, less talkative than usual",
    "repetitive_questions": true,
    "orientation_concerns": false
  },
  "urgency_level": "routine | elevated | urgent",
  "recommended_actions": [
    "Schedule physician review for circulation concerns",
    "Update fall prevention care plan",
    "Refer to Time Bank for companionship visits"
  ]
}

KBS RATING SCALE (1-5 for each):
- Knowledge: 1=No knowledge → 5=Superior knowledge
- Behavior: 1=Not appropriate → 5=Consistently appropriate
- Status: 1=Extreme signs/symptoms → 5=No signs/symptoms

RULES:
1. Map EVERY clinically relevant observation to an Omaha Problem Classification
2. Flag ANY potential HCC-relevant diagnosis for physician review
3. The visit_summary is written FOR THE FAMILY CAREGIVER — plain language, warm, reassuring but honest
4. If you detect fall risk indicators, ALWAYS flag them
5. If repetitive questions or confusion is observed, flag cognition (Problem 16)
6. Extract ALL vitals mentioned, even partial
7. Note medications by name
8. Social determinants (income stress, housing, isolation) map to Environmental domain`;

// ── DESIGN TOKENS ──
const T = {
  bg: '#FDFAF6',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E8E4DF',
  borderLight: '#F0ECE6',
  teal: '#0D7377',
  tealDark: '#095456',
  tealLight: '#E6F5F5',
  tealGlow: '#0D737720',
  gold: '#B49C78',
  goldLight: '#F5EDD4',
  brown: '#3D3427',
  brownMid: '#5A5147',
  brownLight: '#8A8078',
  brownFaint: '#B8AD9E',
  red: '#9B2C2C',
  redLight: '#FEF2F2',
  green: '#3A7D5C',
  greenLight: '#E8F5EE',
  amber: '#9A6B20',
  amberLight: '#FEF8E8',
  white: '#FFFFFF',
};

const serif = "'Fraunces', 'Georgia', serif";
const sans = "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif";
const mono = "'DM Mono', 'JetBrains Mono', monospace";
const MAX_DURATION = 600; // 10 minutes in seconds

interface OmahaObservation {
  omaha_problem_id: string;
  omaha_problem_name: string;
  omaha_domain: string;
  raw_observation: string;
  kbs_knowledge: number;
  kbs_behavior: number;
  kbs_status: number;
  clinical_note: string;
  icd10_flag?: string;
  icd10_description?: string;
  hcc_flag?: boolean;
  hcc_category?: string;
  physician_review_needed?: boolean;
  physician_review_reason?: string;
}

interface ParsedSyncData {
  visit_summary: string;
  observations: OmahaObservation[];
  vitals_captured: Record<string, string | null>;
  medications_mentioned: string[];
  behavioral_observations: string[];
  social_determinants: string[];
  fall_risk_indicators: string[];
  mood_and_cognition: {
    mood_observation: string;
    repetitive_questions: boolean;
    orientation_concerns: boolean;
  };
  urgency_level: 'routine' | 'elevated' | 'urgent';
  recommended_actions: string[];
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function AmbientScribe() {
  const [phase, setPhase] = useState<
    'ready' | 'recording' | 'transcribing' | 'parsing' | 'complete' | 'error'
  >('ready');
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState<ParsedSyncData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ── AUDIO LEVEL VISUALIZATION ──
  const updateLevel = useCallback(() => {
    if (analyserRef.current && phase === 'recording') {
      const data = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = ((data[i] ?? 128) - 128) / 128;
        sum += v * v;
      }
      setAudioLevel(Math.sqrt(sum / data.length));
      animFrameRef.current = requestAnimationFrame(updateLevel);
    }
  }, [phase]);

  // ── STOP RECORDING ──
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    setPhase('transcribing');
    setAudioLevel(0);
  }, []);

  // ── START RECORDING ──
  const startRecording = async () => {
    try {
      setError(null);
      setTranscript('');
      setParsedData(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
      });
      streamRef.current = stream;

      // Audio level analyser
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      recorder.start(1000);
      setPhase('recording');
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= MAX_DURATION - 1) {
            stopRecording();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);

      requestAnimationFrame(updateLevel);
    } catch (err) {
      setError(
        `Microphone access denied: ${(err as Error).message}. Please allow microphone access in your browser settings.`,
      );
      setPhase('error');
    }
  };

  // ── AUTO-STOP AT 10 MINUTES ──
  useEffect(() => {
    if (elapsed >= MAX_DURATION && phase === 'recording') {
      stopRecording();
    }
  }, [elapsed, phase, stopRecording]);

  // ── TRANSCRIBE WITH WHISPER ──
  useEffect(() => {
    if (phase !== 'transcribing' || !audioBlob) return;

    const transcribe = async () => {
      try {
        // In production: send audioBlob to Whisper API
        // const formData = new FormData();
        // formData.append("file", audioBlob, "clinical-sync.webm");
        // formData.append("model", "whisper-1");
        // formData.append("language", "en");
        // formData.append("response_format", "verbose_json");
        // const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        //   method: "POST",
        //   headers: { "Authorization": `Bearer ${OPENAI_KEY}` },
        //   body: formData,
        // });

        // For demo: use a realistic sample transcript
        await new Promise((r) => setTimeout(r, 1500));

        const sampleTranscript = `Caregiver: Good morning Dorothy, how are you feeling today?
Patient: Oh, I'm alright dear. A little tired. I didn't sleep well last night.
Caregiver: I'm sorry to hear that. Was anything bothering you?
Patient: My legs were aching. And I kept thinking about Harold. Is Harold coming today?
Caregiver: Let's focus on getting you comfortable. I'm going to help you with your morning routine. Can you stand up for me slowly?
Patient: [stands up] Oh... I'm a little dizzy.
Caregiver: Take your time. Hold onto the grab bar. Let me check your blood pressure first. Okay, it's reading 142 over 88. That's a bit high. Are you taking your metoprolol this morning?
Patient: I think so. Sarah usually gives it to me. Is Sarah coming?
Caregiver: Your daughter Sarah comes in the afternoon, remember? She left your medications in the blue pill organizer. Let me check — yes, looks like the morning dose hasn't been taken yet. Let's do that now.
Patient: Where's Harold? He usually helps me in the morning.
Caregiver: I helped Dorothy with her shower. She was a bit unsteady getting in and out. I stayed close and used the shower chair. She seemed a little confused about the day — asked about Harold three times. Harold passed away two years ago. Her appetite was good, she ate most of her oatmeal and had some orange juice. I noticed some swelling in her ankles that I haven't seen before. Her mood seemed lower than last week — quieter, less engaged.`;

        setTranscript(sampleTranscript);
        setPhase('parsing');
      } catch (err) {
        setError(`Transcription failed: ${(err as Error).message}`);
        setPhase('error');
      }
    };

    transcribe();
  }, [phase, audioBlob]);

  // ── PARSE WITH CLAUDE → OMAHA SYSTEM ──
  useEffect(() => {
    if (phase !== 'parsing' || !transcript) return;

    const parse = async () => {
      try {
        const response = await fetch('/api/sage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'user', content: `Parse this clinical sync transcript:\n\n${transcript}` },
            ],
            systemOverride: OMAHA_PARSER_PROMPT,
          }),
        });

        const data = await response.json();
        const text = data.content || '';
        const cleaned = text
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .trim();
        const parsed = JSON.parse(cleaned);

        setParsedData(parsed);
        setPhase('complete');
      } catch (err) {
        setError(`Omaha parsing failed: ${(err as Error).message}`);
        setPhase('error');
      }
    };

    parse();
  }, [phase, transcript]);

  // ── RESET ──
  const reset = () => {
    setPhase('ready');
    setElapsed(0);
    setTranscript('');
    setParsedData(null);
    setError(null);
    setAudioBlob(null);
    setAudioLevel(0);
  };

  // ── TIME FORMAT ──
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const pct = (elapsed / MAX_DURATION) * 100;

  // Typed accessors
  const visitSummary = parsedData?.visit_summary;
  const urgencyLevel = parsedData?.urgency_level;
  const vitalsCaptured = parsedData?.vitals_captured;
  const observations = parsedData?.observations;
  const behavioralObs = parsedData?.behavioral_observations;
  const medications = parsedData?.medications_mentioned;
  const fallRisks = parsedData?.fall_risk_indicators;
  const actions = parsedData?.recommended_actions;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        fontFamily: sans,
        maxWidth: 480,
        margin: '0 auto',
        padding: '0 16px',
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* ── HEADER ── */}
      <div style={{ padding: '20px 0 16px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 10,
                color: T.teal,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              CareOS
            </div>
            <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.brown }}>
              Clinical Sync
            </div>
          </div>
          <div
            style={{
              padding: '4px 10px',
              borderRadius: 20,
              fontFamily: mono,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              background:
                phase === 'recording'
                  ? T.redLight
                  : phase === 'complete'
                    ? T.greenLight
                    : T.tealLight,
              color: phase === 'recording' ? T.red : phase === 'complete' ? T.green : T.teal,
              border: `1px solid ${phase === 'recording' ? T.red + '30' : phase === 'complete' ? T.green + '30' : T.teal + '30'}`,
            }}
          >
            {phase === 'ready' ? (
              'Ready'
            ) : phase === 'recording' ? (
              '● Recording'
            ) : phase === 'transcribing' ? (
              'Transcribing...'
            ) : phase === 'parsing' ? (
              'Analyzing...'
            ) : phase === 'complete' ? (
              <>
                <Icon name="check" size={10} /> Complete
              </>
            ) : (
              'Error'
            )}
          </div>
        </div>
      </div>

      {/* ── RECORDING PHASE ── */}
      {(phase === 'ready' || phase === 'recording') && (
        <div style={{ padding: '32px 0' }}>
          {/* Timer Ring */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{ position: 'relative', width: 200, height: 200 }}>
              <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <circle cx="100" cy="100" r="88" fill="none" stroke={T.border} strokeWidth="6" />
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  fill="none"
                  stroke={phase === 'recording' ? T.teal : T.border}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - pct / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
                {phase === 'recording' && (
                  <circle
                    cx="100"
                    cy="100"
                    r={44 + audioLevel * 30}
                    fill="none"
                    stroke={T.teal}
                    strokeWidth="1"
                    opacity={0.3 + audioLevel * 0.5}
                    style={{ transition: 'r 0.1s ease, opacity 0.1s ease' }}
                  />
                )}
              </svg>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 36,
                    fontWeight: 700,
                    color: phase === 'recording' ? T.teal : T.brownFaint,
                  }}
                >
                  {fmt(elapsed)}
                </div>
                <div style={{ fontFamily: mono, fontSize: 11, color: T.brownLight }}>
                  / {fmt(MAX_DURATION)}
                </div>
              </div>
            </div>
          </div>

          {/* Start/Stop Button */}
          <button
            onClick={phase === 'ready' ? startRecording : stopRecording}
            style={{
              width: '100%',
              padding: '18px 24px',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              fontFamily: sans,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '0.02em',
              background:
                phase === 'recording'
                  ? `linear-gradient(135deg, ${T.red}, #B83A3A)`
                  : `linear-gradient(135deg, ${T.teal}, ${T.tealDark})`,
              color: T.white,
              boxShadow: phase === 'recording' ? `0 4px 20px ${T.red}40` : `0 4px 20px ${T.teal}40`,
              transition: 'all 0.3s ease',
            }}
          >
            {phase === 'recording' ? '■  Stop Clinical Sync' : '●  Start Clinical Sync'}
          </button>

          {/* Info */}
          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 10,
              background: T.tealLight,
              border: `1px solid ${T.teal}15`,
            }}
          >
            <div style={{ fontFamily: sans, fontSize: 13, color: T.tealDark, lineHeight: 1.6 }}>
              {phase === 'ready' ? (
                <>
                  <strong>10-Minute Clinical Sync</strong> — Record the initial assessment
                  conversation. Audio is processed locally, then analyzed for clinical observations
                  mapped to the Omaha System.
                  <div
                    style={{ marginTop: 8, fontFamily: mono, fontSize: 11, color: T.brownLight }}
                  >
                    Caregiver controls the recording. Bounded, not continuous.
                  </div>
                </>
              ) : (
                <>
                  <strong>Recording...</strong> — The sync captures conversation between you, the
                  patient, and any family members present. Auto-stops at 10 minutes.
                  <div
                    style={{ marginTop: 8, fontFamily: mono, fontSize: 11, color: T.brownLight }}
                  >
                    Tap "Stop" when the clinical assessment conversation is complete.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PROCESSING PHASE ── */}
      {(phase === 'transcribing' || phase === 'parsing') && (
        <div style={{ padding: '48px 0', textAlign: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              margin: '0 auto 20px',
              border: `3px solid ${T.border}`,
              borderTopColor: T.teal,
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div
            style={{
              fontFamily: serif,
              fontSize: 18,
              fontWeight: 600,
              color: T.brown,
              marginBottom: 6,
            }}
          >
            {phase === 'transcribing' ? 'Transcribing audio...' : 'Mapping to Omaha System...'}
          </div>
          <div style={{ fontFamily: sans, fontSize: 13, color: T.brownLight }}>
            {phase === 'transcribing'
              ? 'Converting speech to text with medical vocabulary'
              : 'Extracting clinical observations, vitals, medications, and risk factors'}
          </div>
        </div>
      )}

      {/* ── ERROR PHASE ── */}
      {phase === 'error' && (
        <div style={{ padding: '32px 0' }}>
          <div
            style={{
              padding: 20,
              borderRadius: 12,
              background: T.redLight,
              border: `1px solid ${T.red}20`,
            }}
          >
            <div
              style={{
                fontFamily: sans,
                fontSize: 14,
                fontWeight: 600,
                color: T.red,
                marginBottom: 6,
              }}
            >
              Error
            </div>
            <div style={{ fontFamily: sans, fontSize: 13, color: T.brownMid, lineHeight: 1.5 }}>
              {error}
            </div>
          </div>
          <button
            onClick={reset}
            style={{
              width: '100%',
              marginTop: 16,
              padding: '14px',
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              background: T.white,
              cursor: 'pointer',
              fontFamily: sans,
              fontSize: 14,
              fontWeight: 600,
              color: T.brown,
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── RESULTS PHASE ── */}
      {phase === 'complete' && parsedData && (
        <div style={{ padding: '20px 0 60px' }}>
          {/* After-Visit Summary — THE ALPHA DAUGHTER VIEW */}
          <div
            style={{
              background: `linear-gradient(135deg, ${T.teal}08, ${T.gold}08)`,
              borderRadius: 14,
              padding: 20,
              marginBottom: 16,
              border: `1px solid ${T.teal}20`,
            }}
          >
            <div
              style={{
                fontFamily: mono,
                fontSize: 10,
                color: T.teal,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              After-Visit Summary
            </div>
            <div
              style={{
                fontFamily: serif,
                fontSize: 16,
                fontWeight: 600,
                color: T.brown,
                marginBottom: 8,
              }}
            >
              For Your Family
            </div>
            <div style={{ fontFamily: sans, fontSize: 14, color: T.brownMid, lineHeight: 1.7 }}>
              {visitSummary}
            </div>
            {urgencyLevel === 'urgent' && (
              <div
                style={{
                  marginTop: 12,
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: T.redLight,
                  border: `1px solid ${T.red}20`,
                  fontFamily: sans,
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.red,
                }}
              >
                <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: 4 }}>
                  <Icon name="warning" size={14} />
                </span>
                Physician review has been requested
              </div>
            )}
          </div>

          {/* Vitals */}
          {vitalsCaptured && (
            <Section title="Vitals Captured" color={T.teal}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {Object.entries(vitalsCaptured)
                  .filter(([, v]) => v)
                  .map(([key, val]) => (
                    <div
                      key={key}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: T.tealLight,
                        border: `1px solid ${T.teal}15`,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 10,
                          color: T.tealDark,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 18,
                          fontWeight: 700,
                          color: T.teal,
                          marginTop: 2,
                        }}
                      >
                        {val}
                      </div>
                    </div>
                  ))}
              </div>
            </Section>
          )}

          {/* Omaha Observations */}
          {observations && observations.length > 0 && (
            <Section title="Clinical Observations (Omaha System)" color={T.brown}>
              {observations.map((obs, i) => {
                const domain = Object.values(OMAHA_DOMAINS).find((d) =>
                  d.problems.some((p) => p.id === obs.omaha_problem_id),
                );
                return (
                  <div
                    key={i}
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      marginBottom: 8,
                      background: T.white,
                      border: `1px solid ${T.border}`,
                      borderLeft: `3px solid ${domain?.color || T.teal}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: 6,
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontFamily: mono,
                            fontSize: 10,
                            color: domain?.color || T.teal,
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                          }}
                        >
                          {domain?.label?.toUpperCase()} #{obs.omaha_problem_id}
                        </span>
                        <div
                          style={{
                            fontFamily: sans,
                            fontSize: 14,
                            fontWeight: 600,
                            color: T.brown,
                            marginTop: 2,
                          }}
                        >
                          {obs.omaha_problem_name}
                        </div>
                      </div>
                      {obs.physician_review_needed && (
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontFamily: mono,
                            fontSize: 9,
                            background: T.amberLight,
                            color: T.amber,
                            fontWeight: 600,
                            border: `1px solid ${T.amber}30`,
                            letterSpacing: '0.03em',
                          }}
                        >
                          MD REVIEW
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontFamily: sans,
                        fontSize: 13,
                        color: T.brownMid,
                        lineHeight: 1.5,
                        marginBottom: 8,
                      }}
                    >
                      {obs.clinical_note}
                    </div>
                    {/* KBS Ratings */}
                    <div style={{ display: 'flex', gap: 12 }}>
                      {[
                        { label: 'K', value: obs.kbs_knowledge },
                        { label: 'B', value: obs.kbs_behavior },
                        { label: 'S', value: obs.kbs_status },
                      ].map((kbs) => (
                        <div
                          key={kbs.label}
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <span
                            style={{
                              fontFamily: mono,
                              fontSize: 10,
                              color: T.brownLight,
                              fontWeight: 600,
                            }}
                          >
                            {kbs.label}
                          </span>
                          <div style={{ display: 'flex', gap: 2 }}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <div
                                key={n}
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: n <= kbs.value ? domain?.color || T.teal : T.border,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* ICD-10 / HCC flags */}
                    {obs.icd10_flag && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: '6px 10px',
                          borderRadius: 6,
                          background: obs.hcc_flag ? T.amberLight : T.bg,
                          border: `1px solid ${obs.hcc_flag ? T.amber + '30' : T.border}`,
                          fontFamily: mono,
                          fontSize: 11,
                          color: T.brownMid,
                        }}
                      >
                        ICD-10: {obs.icd10_flag} — {obs.icd10_description}
                        {obs.hcc_flag && (
                          <span style={{ color: T.amber, fontWeight: 600 }}>
                            {' '}
                            · {obs.hcc_category}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </Section>
          )}

          {/* Behavioral Observations */}
          {behavioralObs && behavioralObs.length > 0 && (
            <Section title="Behavioral Observations" color="#5E548E">
              {behavioralObs.map((obs, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    marginBottom: 6,
                    background: '#F8F6FC',
                    border: '1px solid #5E548E15',
                    fontFamily: sans,
                    fontSize: 13,
                    color: T.brownMid,
                    lineHeight: 1.5,
                  }}
                >
                  {obs}
                </div>
              ))}
            </Section>
          )}

          {/* Medications */}
          {medications && medications.length > 0 && (
            <Section title="Medications Mentioned" color={T.green}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {medications.map((med, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 20,
                      fontFamily: mono,
                      fontSize: 12,
                      background: T.greenLight,
                      color: T.green,
                      border: `1px solid ${T.green}20`,
                    }}
                  >
                    {med}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Fall Risk */}
          {fallRisks && fallRisks.length > 0 && (
            <Section title="Fall Risk Indicators" color={T.red}>
              {fallRisks.map((risk, i) => (
                <div
                  key={i}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    marginBottom: 6,
                    background: T.redLight,
                    border: `1px solid ${T.red}15`,
                    fontFamily: sans,
                    fontSize: 13,
                    color: T.red,
                    fontWeight: 500,
                  }}
                >
                  <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: 4 }}>
                    <Icon name="warning" size={14} />
                  </span>
                  {risk}
                </div>
              ))}
            </Section>
          )}

          {/* Recommended Actions */}
          {actions && actions.length > 0 && (
            <Section title="Recommended Actions" color={T.teal}>
              {actions.map((action, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'start',
                    gap: 10,
                    padding: '8px 0',
                    borderBottom: i < actions.length - 1 ? `1px solid ${T.borderLight}` : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      flexShrink: 0,
                      marginTop: 1,
                      border: `2px solid ${T.teal}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                  <span
                    style={{ fontFamily: sans, fontSize: 13, color: T.brownMid, lineHeight: 1.5 }}
                  >
                    {action}
                  </span>
                </div>
              ))}
            </Section>
          )}

          {/* Raw Transcript */}
          <TranscriptToggle transcript={transcript} />

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button
              onClick={reset}
              style={{
                flex: 1,
                padding: '14px',
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                background: T.white,
                cursor: 'pointer',
                fontFamily: sans,
                fontSize: 14,
                fontWeight: 600,
                color: T.brown,
              }}
            >
              New Sync
            </button>
            <button
              style={{
                flex: 1,
                padding: '14px',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                background: `linear-gradient(135deg, ${T.teal}, ${T.tealDark})`,
                fontFamily: sans,
                fontSize: 14,
                fontWeight: 600,
                color: T.white,
                boxShadow: `0 4px 16px ${T.teal}30`,
              }}
            >
              Submit to Physician
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SUB-COMPONENTS ──

function Section({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          color,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function TranscriptToggle({ transcript }: { transcript: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '12px 14px',
          border: `1px solid #E8E4DF`,
          borderRadius: 10,
          background: '#FDFAF6',
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: '#5A5147',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>Raw Transcript</span>
        <span style={{ fontSize: 11, color: '#8A8078' }}>{open ? '▲ Hide' : '▼ Show'}</span>
      </button>
      {open && (
        <div
          style={{
            marginTop: 8,
            padding: 16,
            borderRadius: 10,
            maxHeight: 300,
            overflowY: 'auto',
            background: '#FFFFFF',
            border: '1px solid #E8E4DF',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: '#5A5147',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
          }}
        >
          {transcript}
        </div>
      )}
    </div>
  );
}
