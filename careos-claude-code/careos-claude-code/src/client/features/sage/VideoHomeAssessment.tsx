import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Icon } from '../../components/Icon';
// ═══════════════════════════════════════════════════════════════
// co-op.care VideoHomeAssessment — "5-Minute Home Safety Walk"
// Camera walkthrough → AI hazard detection → Omaha System mapping
// Every new customer visit starts here. The caregiver walks
// room-by-room, narrating what they see. AI flags safety issues.
// ═══════════════════════════════════════════════════════════════

// ── ROOM DEFINITIONS ──

const ROOMS = [
  { id: 'kitchen', label: 'Kitchen', icon: 'kitchen' },
  { id: 'bathroom', label: 'Bathroom', icon: 'bathroom' },
  { id: 'bedroom', label: 'Bedroom', icon: 'bedroom' },
  { id: 'living_room', label: 'Living Room', icon: 'living_room' },
  { id: 'hallways_stairs', label: 'Hallways / Stairs', icon: 'hallways_stairs' },
  { id: 'entrance', label: 'Entrance', icon: 'entrance' },
  { id: 'medication_area', label: 'Medication Area', icon: 'medication_area' },
] as const;

type RoomId = (typeof ROOMS)[number]['id'];

// ── OMAHA-MAPPED DETECTION CATEGORIES ──

interface DetectionCategory {
  id: string;
  label: string;
  omahaCodes: { code: string; name: string }[];
  flags: string[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DETECTION_CATEGORIES: DetectionCategory[] = [
  {
    id: 'fall_hazards',
    label: 'Fall Hazards',
    omahaCodes: [
      { code: '03', name: 'Residence' },
      { code: '22', name: 'Neuro-musculo-skeletal function' },
    ],
    flags: [
      'Loose rugs',
      'Poor lighting',
      'No grab bars',
      'Cluttered pathways',
      'Wet floors',
      'Uneven surfaces',
    ],
  },
  {
    id: 'medication_safety',
    label: 'Medication Safety',
    omahaCodes: [{ code: '42', name: 'Medication regimen' }],
    flags: [
      'Medications on counter',
      'Expired bottles',
      'No pill organizer',
      'Unlabeled containers',
      'Improper storage',
    ],
  },
  {
    id: 'nutrition',
    label: 'Nutrition Indicators',
    omahaCodes: [
      { code: '25', name: 'Digestion-hydration' },
      { code: '35', name: 'Nutrition' },
    ],
    flags: [
      'Empty fridge',
      'Expired food',
      'Limited fresh food',
      'No water accessible',
      'Spoiled items',
    ],
  },
  {
    id: 'sanitation',
    label: 'Sanitation',
    omahaCodes: [{ code: '02', name: 'Sanitation' }],
    flags: [
      'Pest evidence',
      'Excessive clutter',
      'Bathroom safety issues',
      'Mold',
      'Unclean surfaces',
    ],
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    omahaCodes: [{ code: '03', name: 'Residence' }],
    flags: [
      'Stairs without railings',
      'Narrow doorways',
      'High shelves in use',
      'No ramps',
      'Inaccessible bathroom',
    ],
  },
  {
    id: 'social_isolation',
    label: 'Social Isolation',
    omahaCodes: [{ code: '06', name: 'Social contact' }],
    flags: [
      'Unopened mail pileup',
      'No recent photos',
      'Dark/closed curtains',
      'No visitors calendar',
      'Disconnected phone',
    ],
  },
  {
    id: 'cognitive_indicators',
    label: 'Cognitive Indicators',
    omahaCodes: [{ code: '16', name: 'Cognition' }],
    flags: [
      'Post-it notes everywhere',
      'Appliances left on',
      'Repeated labels',
      'Confusion signs',
      'Disoriented layout',
    ],
  },
];

// ── FINDING TYPES ──

type Severity = 'high' | 'medium' | 'low';

interface Finding {
  id: string;
  room: RoomId;
  roomLabel: string;
  category: string;
  categoryLabel: string;
  description: string;
  severity: Severity;
  omahaCode: string;
  omahaProblemName: string;
  recommendedAction: string;
  timestamp: number; // seconds into recording
}

interface ReferralRecommendation {
  type: string;
  description: string;
  urgency: Severity;
}

interface AssessmentResults {
  overallScore: number;
  findings: Finding[];
  referrals: ReferralRecommendation[];
  roomScores: Record<RoomId, { score: number; findingCount: number }>;
  completedRooms: RoomId[];
  totalDuration: number;
  assessmentDate: string;
}

// ── PHASE TYPE ──

type Phase = 'ready' | 'recording' | 'processing' | 'results';

// ── DESIGN TOKENS (matching CareOS brand) ──

const T = {
  bg: '#FAFAF8',
  surface: '#FFFFFF',
  teal: '#2BA5A0',
  tealDark: '#1B8A85',
  tealLight: '#E8F5F4',
  tealGlow: 'rgba(43,165,160,0.12)',
  navy: '#1B3A5C',
  navyLight: '#2A5580',
  gold: '#C49B40',
  goldLight: '#FDF5E6',
  goldDark: '#A07E30',
  text: '#2C2C2C',
  textSecondary: '#6B6B6B',
  textMuted: '#9B9B9B',
  border: '#E5E5E0',
  borderLight: '#F0EDE8',
  red: '#DC2626',
  redLight: '#FEF2F2',
  redBorder: '#FECACA',
  amber: '#D97706',
  amberLight: '#FFFBEB',
  amberBorder: '#FDE68A',
  green: '#16A34A',
  greenLight: '#F0FDF4',
  greenBorder: '#BBF7D0',
  white: '#FFFFFF',
} as const;

const SERIF = "'Literata', Georgia, serif";
const SANS = "'DM Sans', system-ui, sans-serif";
const MONO = "'DM Mono', 'JetBrains Mono', monospace";

const MAX_DURATION = 300; // 5 minutes in seconds
const RING_RADIUS = 88;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// ═══════════════════════════════════════════════════════════════
// MOCK ASSESSMENT DATA (for demo mode)
// ═══════════════════════════════════════════════════════════════

function generateMockResults(completedRooms: RoomId[], duration: number): AssessmentResults {
  const findings: Finding[] = [
    {
      id: 'f1',
      room: 'bathroom',
      roomLabel: 'Bathroom',
      category: 'fall_hazards',
      categoryLabel: 'Fall Hazards',
      description: 'No grab bars near toilet or shower. Wet floor mat without non-slip backing.',
      severity: 'high',
      omahaCode: '03',
      omahaProblemName: 'Residence',
      recommendedAction:
        'Install grab bars near toilet and in shower/tub area. Replace floor mat with non-slip version.',
      timestamp: 45,
    },
    {
      id: 'f2',
      room: 'bathroom',
      roomLabel: 'Bathroom',
      category: 'fall_hazards',
      categoryLabel: 'Fall Hazards',
      description: 'Dim lighting in bathroom — single 40W bulb, no nightlight.',
      severity: 'medium',
      omahaCode: '03',
      omahaProblemName: 'Residence',
      recommendedAction:
        'Upgrade to brighter LED bulb (100W equivalent). Install motion-activated nightlight.',
      timestamp: 62,
    },
    {
      id: 'f3',
      room: 'kitchen',
      roomLabel: 'Kitchen',
      category: 'medication_safety',
      categoryLabel: 'Medication Safety',
      description:
        'Expired medications on kitchen counter (metformin exp. 08/2025, lisinopril exp. 11/2025). No pill organizer visible.',
      severity: 'high',
      omahaCode: '42',
      omahaProblemName: 'Medication regimen',
      recommendedAction:
        'Remove expired medications safely. Set up weekly pill organizer. Coordinate with pharmacy for refills.',
      timestamp: 95,
    },
    {
      id: 'f4',
      room: 'kitchen',
      roomLabel: 'Kitchen',
      category: 'nutrition',
      categoryLabel: 'Nutrition Indicators',
      description:
        'Refrigerator contains minimal fresh food. Several expired items (milk, yogurt). Mostly canned goods and frozen meals.',
      severity: 'medium',
      omahaCode: '35',
      omahaProblemName: 'Nutrition',
      recommendedAction:
        'Coordinate meal delivery service or grocery assistance. Review dietary needs with care plan.',
      timestamp: 110,
    },
    {
      id: 'f5',
      room: 'living_room',
      roomLabel: 'Living Room',
      category: 'fall_hazards',
      categoryLabel: 'Fall Hazards',
      description:
        'Loose area rug on hardwood floor between couch and TV. Extension cord across walkway to floor lamp.',
      severity: 'high',
      omahaCode: '22',
      omahaProblemName: 'Neuro-musculo-skeletal function',
      recommendedAction:
        'Secure rug with non-slip pad or remove. Reroute extension cord along wall. Consider relocating floor lamp.',
      timestamp: 140,
    },
    {
      id: 'f6',
      room: 'living_room',
      roomLabel: 'Living Room',
      category: 'social_isolation',
      categoryLabel: 'Social Isolation',
      description:
        'Stack of unopened mail on side table (approximately 2 weeks). Calendar on wall has no entries for current month.',
      severity: 'medium',
      omahaCode: '06',
      omahaProblemName: 'Social contact',
      recommendedAction:
        'Assess social support network. Consider Time Bank companionship visits. Help organize mail routine.',
      timestamp: 165,
    },
    {
      id: 'f7',
      room: 'hallways_stairs',
      roomLabel: 'Hallways / Stairs',
      category: 'accessibility',
      categoryLabel: 'Accessibility',
      description:
        'Stairway to basement has no railing on left side. Carpet on stairs is loose on 3rd and 5th steps.',
      severity: 'high',
      omahaCode: '03',
      omahaProblemName: 'Residence',
      recommendedAction:
        'Install handrail on left side of stairs. Secure loose carpet with tack strips. Consider blocking basement access if not essential.',
      timestamp: 195,
    },
    {
      id: 'f8',
      room: 'hallways_stairs',
      roomLabel: 'Hallways / Stairs',
      category: 'fall_hazards',
      categoryLabel: 'Fall Hazards',
      description: 'Hallway between bedroom and bathroom has no nightlight. Dark at night.',
      severity: 'medium',
      omahaCode: '03',
      omahaProblemName: 'Residence',
      recommendedAction: 'Install motion-activated LED nightlights along hallway path to bathroom.',
      timestamp: 210,
    },
    {
      id: 'f9',
      room: 'bedroom',
      roomLabel: 'Bedroom',
      category: 'cognitive_indicators',
      categoryLabel: 'Cognitive Indicators',
      description:
        'Multiple Post-it notes on nightstand and mirror with daily reminders (take pills, lock door, call Sarah). Suggests possible memory concerns.',
      severity: 'medium',
      omahaCode: '16',
      omahaProblemName: 'Cognition',
      recommendedAction:
        'Discuss cognitive screening with care team. Consider medication reminder system. Note for physician review.',
      timestamp: 240,
    },
    {
      id: 'f10',
      room: 'bedroom',
      roomLabel: 'Bedroom',
      category: 'fall_hazards',
      categoryLabel: 'Fall Hazards',
      description:
        'Bed is high off ground with no step stool or bed rail. Slippers by bed have no grip on soles.',
      severity: 'medium',
      omahaCode: '22',
      omahaProblemName: 'Neuro-musculo-skeletal function',
      recommendedAction:
        'Consider bed rail installation. Replace slippers with non-slip footwear. Evaluate bed height.',
      timestamp: 255,
    },
    {
      id: 'f11',
      room: 'medication_area',
      roomLabel: 'Medication Area',
      category: 'medication_safety',
      categoryLabel: 'Medication Safety',
      description:
        'Medications stored in bathroom cabinet (heat and humidity can degrade medications). No single organized medication station.',
      severity: 'medium',
      omahaCode: '42',
      omahaProblemName: 'Medication regimen',
      recommendedAction:
        'Relocate medications to cool, dry area. Establish dedicated medication station with organizer and schedule.',
      timestamp: 275,
    },
    {
      id: 'f12',
      room: 'entrance',
      roomLabel: 'Entrance',
      category: 'accessibility',
      categoryLabel: 'Accessibility',
      description: 'Front door step is 6 inches with no handrail. Welcome mat is curled at edges.',
      severity: 'medium',
      omahaCode: '03',
      omahaProblemName: 'Residence',
      recommendedAction:
        'Install small handrail at front step. Replace or secure welcome mat. Consider portable ramp for future needs.',
      timestamp: 285,
    },
  ];

  // Filter findings to only completed rooms
  const relevantFindings = findings.filter((f) => completedRooms.includes(f.room));

  // Calculate room scores
  const roomScores = {} as Record<RoomId, { score: number; findingCount: number }>;
  for (const room of ROOMS) {
    const roomFindings = relevantFindings.filter((f) => f.room === room.id);
    const highCount = roomFindings.filter((f) => f.severity === 'high').length;
    const medCount = roomFindings.filter((f) => f.severity === 'medium').length;
    const lowCount = roomFindings.filter((f) => f.severity === 'low').length;
    const penalty = highCount * 20 + medCount * 10 + lowCount * 5;
    roomScores[room.id] = {
      score: Math.max(0, 100 - penalty),
      findingCount: roomFindings.length,
    };
  }

  // Overall score
  const completedScores = completedRooms.map((r) => roomScores[r]?.score ?? 100);
  const overallScore =
    completedScores.length > 0
      ? Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length)
      : 100;

  const referrals: ReferralRecommendation[] = [
    {
      type: 'Grab Bar Installation',
      description: 'Professional installation of grab bars in bathroom (toilet and shower areas)',
      urgency: 'high',
    },
    {
      type: 'Lighting Upgrade',
      description:
        'LED upgrade throughout home, motion-activated nightlights for hallway and bathroom',
      urgency: 'medium',
    },
    {
      type: 'Medical Alert System',
      description: 'Personal emergency response system (PERS) — wearable pendant recommended',
      urgency: 'medium',
    },
    {
      type: 'Medication Management',
      description: 'Pharmacy consultation for medication review and organizer setup',
      urgency: 'high',
    },
    {
      type: 'Home Modification Assessment',
      description:
        'Occupational therapy home evaluation for comprehensive accessibility modifications',
      urgency: 'medium',
    },
    {
      type: 'Cognitive Screening',
      description: 'Physician referral for cognitive assessment based on observed memory aids',
      urgency: 'medium',
    },
  ];

  return {
    overallScore,
    findings: relevantFindings,
    referrals,
    roomScores,
    completedRooms,
    totalDuration: duration,
    assessmentDate: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function VideoHomeAssessment() {
  const [phase, setPhase] = useState<Phase>('ready');
  const [elapsed, setElapsed] = useState(0);
  const [currentRoom, setCurrentRoom] = useState<RoomId | null>(null);
  const [completedRooms, setCompletedRooms] = useState<RoomId[]>([]);
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [expandedRoom, setExpandedRoom] = useState<RoomId | null>(null);
  const [showShareConfirm, setShowShareConfirm] = useState(false);
  const [showFhirConfirm, setShowFhirConfirm] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // ── TIME FORMAT ──
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const pct = (elapsed / MAX_DURATION) * 100;
  const remaining = MAX_DURATION - elapsed;

  // ── CAMERA SETUP ──
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      return true;
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
        setCameraError(
          'Camera access denied. Please allow camera access in your browser settings to perform a home assessment.',
        );
      } else if (msg.includes('NotFoundError') || msg.includes('DevicesNotFound')) {
        setCameraError('No camera found. Using demo mode — the assessment will use sample data.');
      } else {
        setCameraError(`Camera unavailable: ${msg}. Using demo mode.`);
      }
      return false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // ── START RECORDING ──
  const startRecording = async () => {
    const cameraReady = await startCamera();

    // Start recording if camera is available
    if (cameraReady && streamRef.current) {
      try {
        const recorder = new MediaRecorder(streamRef.current, {
          mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
            ? 'video/webm;codecs=vp9,opus'
            : MediaRecorder.isTypeSupported('video/webm')
              ? 'video/webm'
              : 'video/mp4',
        });
        chunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        mediaRecorderRef.current = recorder;
        recorder.start(1000);
      } catch {
        // Recording not available — continue without it
      }
    }

    setPhase('recording');
    setElapsed(0);
    setCompletedRooms([]);
    setCurrentRoom(null);

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev >= MAX_DURATION - 1) {
          return MAX_DURATION;
        }
        return prev + 1;
      });
    }, 1000);
  };

  // ── STOP RECORDING ──
  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    stopCamera();
  }, [stopCamera]);

  // ── AUTO-STOP AT 5 MINUTES ──
  useEffect(() => {
    if (elapsed >= MAX_DURATION && phase === 'recording') {
      finishRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, phase]);

  // ── FINISH AND PROCESS ──
  const finishRecording = useCallback(() => {
    stopRecording();
    setPhase('processing');
    setProcessingProgress(0);

    // Simulate AI processing with progressive updates
    const steps = [
      { progress: 15, delay: 400 },
      { progress: 30, delay: 800 },
      { progress: 50, delay: 1400 },
      { progress: 70, delay: 2000 },
      { progress: 85, delay: 2600 },
      { progress: 95, delay: 3200 },
      { progress: 100, delay: 3800 },
    ];

    for (const step of steps) {
      setTimeout(() => setProcessingProgress(step.progress), step.delay);
    }

    // Generate results after processing
    setTimeout(() => {
      const roomsToUse = completedRooms.length > 0 ? completedRooms : ROOMS.map((r) => r.id); // If none tagged, assume all rooms
      const mockResults = generateMockResults(roomsToUse, elapsed);
      setResults(mockResults);
      setPhase('results');
    }, 4200);
  }, [stopRecording, completedRooms, elapsed]);

  // ── ROOM TAGGING ──
  const tagRoom = (roomId: RoomId) => {
    setCurrentRoom(roomId);
    if (!completedRooms.includes(roomId)) {
      setCompletedRooms((prev) => [...prev, roomId]);
    }
  };

  // ── RESET ──
  const reset = () => {
    stopRecording();
    setPhase('ready');
    setElapsed(0);
    setCurrentRoom(null);
    setCompletedRooms([]);
    setResults(null);
    setProcessingProgress(0);
    setCameraError(null);
    setExpandedRoom(null);
    setShowShareConfirm(false);
    setShowFhirConfirm(false);
  };

  // ── CLEANUP ON UNMOUNT ──
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopCamera();
    };
  }, [stopCamera]);

  // ── SCORE COLOR HELPERS ──
  const scoreColor = (score: number) => {
    if (score >= 80) return T.green;
    if (score >= 60) return T.amber;
    return T.red;
  };

  const scoreZone = (score: number): string => {
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Needs Attention';
    return 'At Risk';
  };

  const scoreBg = (score: number) => {
    if (score >= 80) return T.greenLight;
    if (score >= 60) return T.amberLight;
    return T.redLight;
  };

  const severityColor = (s: Severity) => {
    if (s === 'high') return T.red;
    if (s === 'medium') return T.amber;
    return T.teal;
  };

  const severityBg = (s: Severity) => {
    if (s === 'high') return T.redLight;
    if (s === 'medium') return T.amberLight;
    return T.tealLight;
  };

  // ── GROUP FINDINGS BY ROOM ──
  const findingsByRoom = useMemo(() => {
    if (!results) return {};
    const grouped: Record<string, Finding[]> = {};
    for (const f of results.findings) {
      if (!grouped[f.room]) grouped[f.room] = [];
      grouped[f.room]!.push(f);
    }
    return grouped;
  }, [results]);

  // ── PROCESSING STATUS LABEL ──
  const processingLabel = useMemo(() => {
    if (processingProgress < 20) return 'Extracting video frames...';
    if (processingProgress < 40) return 'Identifying room features...';
    if (processingProgress < 60) return 'Detecting safety hazards...';
    if (processingProgress < 80) return 'Mapping to Omaha System...';
    if (processingProgress < 95) return 'Generating recommendations...';
    return 'Finalizing report...';
  }, [processingProgress]);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        fontFamily: SANS,
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      {/* ── INLINE KEYFRAMES ── */}
      <style>{`
        @keyframes vha-spin { to { transform: rotate(360deg); } }
        @keyframes vha-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes vha-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vha-score-reveal {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes vha-ring-fill {
          from { stroke-dashoffset: ${RING_CIRCUMFERENCE}; }
        }
        .vha-fade-up { animation: vha-fade-up 0.4s ease-out forwards; }
        .vha-fade-up-d1 { opacity: 0; animation: vha-fade-up 0.4s ease-out 0.1s forwards; }
        .vha-fade-up-d2 { opacity: 0; animation: vha-fade-up 0.4s ease-out 0.2s forwards; }
        .vha-fade-up-d3 { opacity: 0; animation: vha-fade-up 0.4s ease-out 0.3s forwards; }
        .vha-fade-up-d4 { opacity: 0; animation: vha-fade-up 0.4s ease-out 0.4s forwards; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: T.teal,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              CareOS
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: T.navy }}>
              Home Assessment
            </div>
          </div>
          <PhaseIndicator phase={phase} />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* PHASE 1: READY                                            */}
      {/* ════════════════════════════════════════════════════════════ */}
      {phase === 'ready' && (
        <div style={{ padding: '24px 16px' }}>
          {/* Camera Preview */}
          <div
            style={{
              position: 'relative',
              borderRadius: 16,
              overflow: 'hidden',
              background: T.navy,
              aspectRatio: '4/3',
              marginBottom: 20,
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* Overlay when no camera */}
            {!streamRef.current && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
                }}
              >
                <div
                  style={{
                    marginBottom: 12,
                    opacity: 0.6,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="video" size={48} />
                </div>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.7)',
                    textAlign: 'center',
                    padding: '0 32px',
                  }}
                >
                  Camera preview will appear when you start the assessment
                </div>
              </div>
            )}
          </div>

          {/* Room Checklist */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: T.teal,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              Room-by-Room Checklist
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {ROOMS.map((room) => (
                <div
                  key={room.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: T.white,
                    border: `1px solid ${T.border}`,
                  }}
                >
                  <span style={{ fontSize: 18, display: 'inline-flex' }}>
                    <Icon name={room.icon} size={18} />
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: 13, color: T.text, fontWeight: 500 }}>
                    {room.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Camera Error */}
          {cameraError && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                marginBottom: 16,
                background: T.amberLight,
                border: `1px solid ${T.amberBorder}`,
                fontFamily: SANS,
                fontSize: 13,
                color: T.amber,
                lineHeight: 1.5,
              }}
            >
              {cameraError}
            </div>
          )}

          {/* Instructions */}
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: T.tealLight,
              border: `1px solid ${T.teal}15`,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontFamily: SANS,
                fontSize: 14,
                fontWeight: 600,
                color: T.tealDark,
                marginBottom: 6,
              }}
            >
              5-Minute Video Walkthrough
            </div>
            <div
              style={{ fontFamily: SANS, fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}
            >
              Walk through each room, narrating what you see. Tap room buttons to tag your current
              location. The AI will analyze for safety hazards, accessibility issues, and home
              readiness.
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: T.textMuted, marginTop: 8 }}>
              First visit protocol — every new customer assessment
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startRecording}
            style={{
              width: '100%',
              padding: '18px 24px',
              border: 'none',
              borderRadius: 14,
              cursor: 'pointer',
              fontFamily: SANS,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '0.02em',
              background: `linear-gradient(135deg, ${T.teal}, ${T.tealDark})`,
              color: T.white,
              boxShadow: `0 4px 20px ${T.tealGlow}`,
              transition: 'all 0.3s ease',
            }}
          >
            Start Home Assessment
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* PHASE 2: RECORDING                                        */}
      {/* ════════════════════════════════════════════════════════════ */}
      {phase === 'recording' && (
        <div style={{ padding: '0' }}>
          {/* Camera Feed */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4/3',
              background: T.navy,
              overflow: 'hidden',
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />

            {/* No-camera fallback */}
            {!streamRef.current && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
                }}
              >
                <div
                  style={{
                    marginBottom: 8,
                    opacity: 0.5,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="video" size={48} />
                </div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                  Demo Mode — No Camera
                </div>
              </div>
            )}

            {/* Timer Ring Overlay (top-right) */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 72,
                height: 72,
                background: 'rgba(0,0,0,0.55)',
                borderRadius: '50%',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                style={{ transform: 'rotate(-90deg)', position: 'absolute' }}
              >
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke={remaining <= 60 ? T.red : T.teal}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
                />
              </svg>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 14,
                  fontWeight: 700,
                  color: T.white,
                  position: 'relative',
                }}
              >
                {fmt(remaining)}
              </div>
            </div>

            {/* Current Room Indicator (top-left) */}
            {currentRoom && (
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: 'rgba(0,0,0,0.55)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 14 }}>
                  {ROOMS.find((r) => r.id === currentRoom)?.icon}
                </span>
                <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: T.white }}>
                  {ROOMS.find((r) => r.id === currentRoom)?.label}
                </span>
              </div>
            )}

            {/* Recording Indicator (bottom-left) */}
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 20,
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: T.red,
                  animation: 'vha-pulse 1.5s ease-in-out infinite',
                }}
              />
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  color: T.white,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}
              >
                REC {fmt(elapsed)}
              </span>
            </div>
          </div>

          {/* Room Tagging Buttons */}
          <div style={{ padding: '12px 16px' }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: T.teal,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Tap to tag current room
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
              }}
            >
              {ROOMS.map((room) => {
                const isActive = currentRoom === room.id;
                const isCompleted = completedRooms.includes(room.id);
                return (
                  <button
                    key={room.id}
                    onClick={() => tagRoom(room.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: isActive
                        ? `2px solid ${T.teal}`
                        : isCompleted
                          ? `1px solid ${T.green}40`
                          : `1px solid ${T.border}`,
                      background: isActive ? T.tealLight : isCompleted ? T.greenLight : T.white,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span style={{ fontSize: 14, display: 'inline-flex' }}>
                      <Icon name={room.icon} size={14} />
                    </span>
                    <span
                      style={{
                        fontFamily: SANS,
                        fontSize: 12,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? T.tealDark : isCompleted ? T.green : T.text,
                      }}
                    >
                      {room.label}
                    </span>
                    {isCompleted && !isActive && (
                      <span style={{ display: 'inline-flex', color: T.green }}>
                        <Icon name="check" size={12} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress: rooms completed */}
          <div style={{ padding: '0 16px 8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 8,
                background: T.bg,
                border: `1px solid ${T.borderLight}`,
              }}
            >
              <span style={{ fontFamily: SANS, fontSize: 12, color: T.textMuted }}>
                Rooms tagged
              </span>
              <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, color: T.teal }}>
                {completedRooms.length} / {ROOMS.length}
              </span>
            </div>
          </div>

          {/* Stop / Finish Button */}
          <div style={{ padding: '8px 16px 24px' }}>
            <button
              onClick={finishRecording}
              style={{
                width: '100%',
                padding: '16px 24px',
                border: 'none',
                borderRadius: 14,
                cursor: 'pointer',
                fontFamily: SANS,
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: '0.02em',
                background: `linear-gradient(135deg, ${T.red}, #B83A3A)`,
                color: T.white,
                boxShadow: `0 4px 16px rgba(220,38,38,0.25)`,
              }}
            >
              Finish Assessment
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* PHASE 3: PROCESSING                                       */}
      {/* ════════════════════════════════════════════════════════════ */}
      {phase === 'processing' && (
        <div style={{ padding: '60px 16px', textAlign: 'center' }}>
          {/* Animated ring */}
          <div
            style={{
              width: 100,
              height: 100,
              margin: '0 auto 24px',
              position: 'relative',
            }}
          >
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <circle cx="50" cy="50" r="42" fill="none" stroke={T.border} strokeWidth="4" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={T.teal}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - processingProgress / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: MONO,
                fontSize: 18,
                fontWeight: 700,
                color: T.teal,
              }}
            >
              {processingProgress}%
            </div>
          </div>

          <div
            style={{
              fontFamily: SERIF,
              fontSize: 18,
              fontWeight: 600,
              color: T.navy,
              marginBottom: 6,
            }}
          >
            Analyzing home safety...
          </div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: T.textMuted, marginBottom: 24 }}>
            {processingLabel}
          </div>

          {/* Processing steps */}
          <div style={{ textAlign: 'left', maxWidth: 300, margin: '0 auto' }}>
            {[
              { label: 'Video frame extraction', threshold: 15 },
              { label: 'Room feature identification', threshold: 30 },
              { label: 'Safety hazard detection', threshold: 50 },
              { label: 'Omaha System mapping', threshold: 70 },
              { label: 'Recommendation generation', threshold: 85 },
              { label: 'Report compilation', threshold: 95 },
            ].map((step) => {
              const done = processingProgress >= step.threshold;
              const active = !done && processingProgress >= step.threshold - 20;
              return (
                <div
                  key={step.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '6px 0',
                    opacity: done || active ? 1 : 0.4,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      background: done ? T.greenLight : active ? T.tealLight : T.bg,
                      border: `1px solid ${done ? T.green + '40' : active ? T.teal + '30' : T.border}`,
                      color: done ? T.green : T.teal,
                    }}
                  >
                    {done ? (
                      <Icon name="check" size={11} />
                    ) : active ? (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          border: `2px solid ${T.teal}`,
                          borderTopColor: 'transparent',
                          animation: 'vha-spin 0.8s linear infinite',
                        }}
                      />
                    ) : null}
                  </div>
                  <span
                    style={{
                      fontFamily: SANS,
                      fontSize: 13,
                      color: done ? T.green : active ? T.text : T.textMuted,
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* PHASE 4: RESULTS                                          */}
      {/* ════════════════════════════════════════════════════════════ */}
      {phase === 'results' && results && (
        <div style={{ padding: '20px 16px 60px' }}>
          {/* ── Overall Score Card ── */}
          <div
            className="vha-fade-up"
            style={{
              background: `linear-gradient(135deg, ${scoreBg(results.overallScore)}, ${T.white})`,
              borderRadius: 16,
              padding: 24,
              marginBottom: 16,
              border: `1px solid ${scoreColor(results.overallScore)}20`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: T.teal,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              Home Readiness Report
            </div>

            {/* Score Circle */}
            <div
              style={{
                display: 'inline-block',
                position: 'relative',
                width: 140,
                height: 140,
                marginBottom: 16,
              }}
            >
              <svg
                width="140"
                height="140"
                viewBox="0 0 140 140"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <circle cx="70" cy="70" r="60" fill="none" stroke={T.border} strokeWidth="8" />
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  fill="none"
                  stroke={scoreColor(results.overallScore)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 60}`}
                  strokeDashoffset={`${2 * Math.PI * 60 * (1 - results.overallScore / 100)}`}
                  style={{ animation: `vha-ring-fill 1.5s ease-out forwards` }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 42,
                    fontWeight: 700,
                    color: scoreColor(results.overallScore),
                    animation: 'vha-score-reveal 0.8s ease-out forwards',
                  }}
                >
                  {results.overallScore}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: T.textMuted,
                    letterSpacing: '0.05em',
                  }}
                >
                  / 100
                </div>
              </div>
            </div>

            <div
              style={{
                fontFamily: SERIF,
                fontSize: 18,
                fontWeight: 600,
                color: scoreColor(results.overallScore),
                marginBottom: 4,
              }}
            >
              {scoreZone(results.overallScore)}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: T.textSecondary }}>
              {results.findings.filter((f) => f.severity === 'high').length} high-priority findings
              {' / '}
              {results.findings.length} total
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: T.textMuted, marginTop: 4 }}>
              {results.completedRooms.length} rooms assessed in {fmt(results.totalDuration)}
            </div>
          </div>

          {/* ── Room-by-Room Breakdown ── */}
          <div className="vha-fade-up-d1" style={{ marginBottom: 20 }}>
            <SectionHeader title="Room-by-Room Breakdown" />
            {ROOMS.filter((r) => results.completedRooms.includes(r.id)).map((room) => {
              const roomScore = results.roomScores[room.id];
              const roomFindings = findingsByRoom[room.id] || [];
              const isExpanded = expandedRoom === room.id;

              return (
                <div key={room.id} style={{ marginBottom: 8 }}>
                  {/* Room Header */}
                  <button
                    onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: isExpanded ? '10px 10px 0 0' : 10,
                      background: T.white,
                      border: `1px solid ${T.border}`,
                      borderBottom: isExpanded
                        ? `1px solid ${T.borderLight}`
                        : `1px solid ${T.border}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18, display: 'inline-flex' }}>
                        <Icon name={room.icon} size={18} />
                      </span>
                      <div style={{ textAlign: 'left' }}>
                        <div
                          style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: T.text }}
                        >
                          {room.label}
                        </div>
                        <div style={{ fontFamily: MONO, fontSize: 11, color: T.textMuted }}>
                          {roomFindings.length} finding{roomFindings.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          padding: '4px 10px',
                          borderRadius: 12,
                          background: scoreBg(roomScore?.score ?? 100),
                          fontFamily: MONO,
                          fontSize: 13,
                          fontWeight: 700,
                          color: scoreColor(roomScore?.score ?? 100),
                        }}
                      >
                        {roomScore?.score ?? 100}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: T.textMuted,
                          transition: 'transform 0.2s',
                          transform: isExpanded ? 'rotate(180deg)' : 'none',
                        }}
                      >
                        ▼
                      </span>
                    </div>
                  </button>

                  {/* Room Findings (expanded) */}
                  {isExpanded && roomFindings.length > 0 && (
                    <div
                      style={{
                        background: T.white,
                        border: `1px solid ${T.border}`,
                        borderTop: 'none',
                        borderRadius: '0 0 10px 10px',
                        padding: '8px 12px 12px',
                      }}
                    >
                      {roomFindings.map((finding) => (
                        <FindingCard
                          key={finding.id}
                          finding={finding}
                          severityColor={severityColor}
                          severityBg={severityBg}
                        />
                      ))}
                    </div>
                  )}

                  {/* Room expanded but no findings */}
                  {isExpanded && roomFindings.length === 0 && (
                    <div
                      style={{
                        background: T.white,
                        border: `1px solid ${T.border}`,
                        borderTop: 'none',
                        borderRadius: '0 0 10px 10px',
                        padding: '16px 14px',
                        fontFamily: SANS,
                        fontSize: 13,
                        color: T.green,
                        textAlign: 'center',
                      }}
                    >
                      No safety issues identified in this room.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── All Findings Summary ── */}
          <div className="vha-fade-up-d2" style={{ marginBottom: 20 }}>
            <SectionHeader title="All Findings by Severity" />

            {/* High severity */}
            {results.findings.filter((f) => f.severity === 'high').length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: T.red,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.red }} />
                  High Priority
                </div>
                {results.findings
                  .filter((f) => f.severity === 'high')
                  .map((f) => (
                    <FindingCard
                      key={f.id}
                      finding={f}
                      severityColor={severityColor}
                      severityBg={severityBg}
                    />
                  ))}
              </div>
            )}

            {/* Medium severity */}
            {results.findings.filter((f) => f.severity === 'medium').length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: T.amber,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.amber }} />
                  Medium Priority
                </div>
                {results.findings
                  .filter((f) => f.severity === 'medium')
                  .map((f) => (
                    <FindingCard
                      key={f.id}
                      finding={f}
                      severityColor={severityColor}
                      severityBg={severityBg}
                    />
                  ))}
              </div>
            )}

            {/* Low severity */}
            {results.findings.filter((f) => f.severity === 'low').length > 0 && (
              <div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: T.teal,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.teal }} />
                  Low Priority
                </div>
                {results.findings
                  .filter((f) => f.severity === 'low')
                  .map((f) => (
                    <FindingCard
                      key={f.id}
                      finding={f}
                      severityColor={severityColor}
                      severityBg={severityBg}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* ── Referral Recommendations ── */}
          <div className="vha-fade-up-d3" style={{ marginBottom: 20 }}>
            <SectionHeader title="Referral Recommendations" />
            {results.referrals.map((referral, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'start',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 10,
                  marginBottom: 6,
                  background: T.white,
                  border: `1px solid ${T.border}`,
                  borderLeft: `3px solid ${
                    referral.urgency === 'high'
                      ? T.red
                      : referral.urgency === 'medium'
                        ? T.amber
                        : T.teal
                  }`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: SANS,
                      fontSize: 14,
                      fontWeight: 600,
                      color: T.text,
                      marginBottom: 3,
                    }}
                  >
                    {referral.type}
                  </div>
                  <div
                    style={{
                      fontFamily: SANS,
                      fontSize: 13,
                      color: T.textSecondary,
                      lineHeight: 1.5,
                    }}
                  >
                    {referral.description}
                  </div>
                </div>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    flexShrink: 0,
                    fontFamily: MONO,
                    fontSize: 9,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background:
                      referral.urgency === 'high'
                        ? T.redLight
                        : referral.urgency === 'medium'
                          ? T.amberLight
                          : T.tealLight,
                    color:
                      referral.urgency === 'high'
                        ? T.red
                        : referral.urgency === 'medium'
                          ? T.amber
                          : T.teal,
                    border: `1px solid ${
                      referral.urgency === 'high'
                        ? T.red + '20'
                        : referral.urgency === 'medium'
                          ? T.amber + '20'
                          : T.teal + '20'
                    }`,
                  }}
                >
                  {referral.urgency}
                </span>
              </div>
            ))}
          </div>

          {/* ── Action Buttons ── */}
          <div
            className="vha-fade-up-d4"
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {/* Share Button */}
            <button
              onClick={() => {
                setShowShareConfirm(true);
                setTimeout(() => setShowShareConfirm(false), 3000);
              }}
              style={{
                width: '100%',
                padding: '16px',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                fontFamily: SANS,
                fontSize: 15,
                fontWeight: 700,
                background: `linear-gradient(135deg, ${T.teal}, ${T.tealDark})`,
                color: T.white,
                boxShadow: `0 4px 16px ${T.tealGlow}`,
              }}
            >
              {showShareConfirm ? 'Sent to family member' : 'Share with Family'}
            </button>

            {/* Generate FHIR Report */}
            <button
              onClick={() => {
                setShowFhirConfirm(true);
                setTimeout(() => setShowFhirConfirm(false), 3000);
              }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                cursor: 'pointer',
                fontFamily: SANS,
                fontSize: 14,
                fontWeight: 600,
                background: T.white,
                color: T.navy,
                border: `1px solid ${T.border}`,
              }}
            >
              {showFhirConfirm ? 'FHIR R4 report generated' : 'Generate FHIR Report'}
            </button>

            {/* New Assessment */}
            <button
              onClick={reset}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                cursor: 'pointer',
                fontFamily: SANS,
                fontSize: 14,
                fontWeight: 600,
                background: 'transparent',
                color: T.textMuted,
                border: `1px solid ${T.borderLight}`,
              }}
            >
              New Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function PhaseIndicator({ phase }: { phase: Phase }) {
  const config = {
    ready: { label: 'Ready', bg: T.tealLight, color: T.teal, border: `${T.teal}30` },
    recording: { label: 'Recording', bg: T.redLight, color: T.red, border: `${T.red}30` },
    processing: { label: 'Analyzing...', bg: T.amberLight, color: T.amber, border: `${T.amber}30` },
    results: { label: 'Complete', bg: T.greenLight, color: T.green, border: `${T.green}30` },
  }[phase];

  return (
    <div
      style={{
        padding: '4px 10px',
        borderRadius: 20,
        fontFamily: MONO,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {phase === 'recording' && (
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: T.red,
            animation: 'vha-pulse 1.5s ease-in-out infinite',
          }}
        />
      )}
      {phase === 'results' && (
        <>
          <Icon name="check" size={10} />{' '}
        </>
      )}
      {config.label}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 10,
        color: T.teal,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontWeight: 600,
        marginBottom: 10,
        paddingBottom: 6,
        borderBottom: `1px solid ${T.borderLight}`,
      }}
    >
      {title}
    </div>
  );
}

function FindingCard({
  finding,
  severityColor,
  severityBg,
}: {
  finding: Finding;
  severityColor: (s: Severity) => string;
  severityBg: (s: Severity) => string;
}) {
  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: 10,
        marginBottom: 6,
        background: T.bg,
        border: `1px solid ${T.borderLight}`,
        borderLeft: `3px solid ${severityColor(finding.severity)}`,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          marginBottom: 6,
        }}
      >
        <div>
          <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: T.text }}>
            {finding.description}
          </div>
        </div>
        <span
          style={{
            padding: '2px 7px',
            borderRadius: 4,
            flexShrink: 0,
            marginLeft: 8,
            fontFamily: MONO,
            fontSize: 9,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            background: severityBg(finding.severity),
            color: severityColor(finding.severity),
            border: `1px solid ${severityColor(finding.severity)}20`,
          }}
        >
          {finding.severity}
        </span>
      </div>

      {/* Omaha code */}
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10,
          color: T.textMuted,
          marginBottom: 6,
        }}
      >
        Omaha #{finding.omahaCode} — {finding.omahaProblemName} / {finding.categoryLabel}
      </div>

      {/* Recommended action */}
      <div
        style={{
          padding: '8px 10px',
          borderRadius: 6,
          background: T.white,
          border: `1px solid ${T.borderLight}`,
          fontFamily: SANS,
          fontSize: 12,
          color: T.textSecondary,
          lineHeight: 1.5,
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10,
            color: T.teal,
            fontWeight: 600,
            letterSpacing: '0.03em',
          }}
        >
          ACTION:{' '}
        </span>
        {finding.recommendedAction}
      </div>
    </div>
  );
}
