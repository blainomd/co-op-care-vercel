/**
 * Ambient Scribe — Voice-to-text with Omaha problem extraction
 *
 * Uses Web Speech API for real-time speech recognition.
 * Extracts Omaha System problem codes from the transcript.
 * Auto-suggests care log category from keywords.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { OMAHA_PROBLEMS } from '@shared/constants/omaha-system';

interface ExtractedProblem {
  code: number;
  name: string;
}

/** Keyword → Omaha problem code mapping (client-side for instant feedback) */
const KEYWORD_MAP: Array<{ keywords: string[]; code: number }> = [
  { keywords: ['medication', 'medicine', 'pill', 'prescription', 'dose'], code: 24 },
  { keywords: ['fall', 'balance', 'tripped', 'stumble'], code: 25 },
  { keywords: ['confused', 'disoriented', 'memory', 'forgot'], code: 21 },
  { keywords: ['pain', 'ache', 'hurt', 'sore'], code: 28 },
  { keywords: ['appetite', 'eating', 'nutrition', 'weight'], code: 27 },
  { keywords: ['sleep', 'insomnia', 'rest', 'tired'], code: 34 },
  { keywords: ['mood', 'sad', 'anxious', 'depressed', 'agitated'], code: 13 },
  { keywords: ['skin', 'wound', 'rash', 'bruise', 'pressure'], code: 36 },
  { keywords: ['breath', 'cough', 'wheeze', 'oxygen'], code: 33 },
  { keywords: ['bath', 'hygiene', 'dress', 'groom'], code: 38 },
  { keywords: ['walk', 'mobility', 'transfer', 'wheelchair'], code: 25 },
  { keywords: ['blood pressure', 'hypertension'], code: 20 },
  { keywords: ['toilet', 'incontinence', 'bowel', 'bladder'], code: 19 },
  { keywords: ['lonely', 'isolated', 'visitor', 'social'], code: 12 },
];

const CATEGORY_MAP: Array<{ keywords: string[]; category: string; label: string }> = [
  {
    keywords: ['medication', 'pill', 'prescription'],
    category: 'medication_reminder',
    label: 'Medication Reminder',
  },
  {
    keywords: ['meal', 'cook', 'food', 'eat', 'lunch', 'dinner'],
    category: 'meal_preparation',
    label: 'Meal Preparation',
  },
  {
    keywords: ['bath', 'shower', 'dress', 'hygiene'],
    category: 'personal_care',
    label: 'Personal Care',
  },
  {
    keywords: ['walk', 'transfer', 'exercise'],
    category: 'mobility_assist',
    label: 'Mobility Assist',
  },
  {
    keywords: ['puzzle', 'game', 'read', 'memory'],
    category: 'cognitive_activity',
    label: 'Cognitive Activity',
  },
  {
    keywords: ['mood', 'comfort', 'talk', 'listen'],
    category: 'emotional_support',
    label: 'Emotional Support',
  },
  { keywords: ['errand', 'store', 'pharmacy'], category: 'errand', label: 'Errand' },
  {
    keywords: ['vital', 'blood pressure', 'temperature'],
    category: 'observation',
    label: 'Observation',
  },
];

function extractProblems(text: string): ExtractedProblem[] {
  const lower = text.toLowerCase();
  const codes = new Set<number>();
  for (const mapping of KEYWORD_MAP) {
    if (mapping.keywords.some((kw) => lower.includes(kw))) {
      codes.add(mapping.code);
    }
  }
  return Array.from(codes)
    .map((code) => {
      const problem = OMAHA_PROBLEMS.find((p) => p.code === code);
      return problem ? { code, name: problem.name } : null;
    })
    .filter((p): p is ExtractedProblem => p !== null);
}

function suggestCategory(text: string): { category: string; label: string } | null {
  const lower = text.toLowerCase();
  for (const mapping of CATEGORY_MAP) {
    if (mapping.keywords.some((kw) => lower.includes(kw))) {
      return { category: mapping.category, label: mapping.label };
    }
  }
  return null;
}

/** Check if Web Speech API is available */
function isSpeechAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
}

export function AmbientScribe() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [problems, setProblems] = useState<ExtractedProblem[]>([]);
  const [category, setCategory] = useState<{ category: string; label: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechAvailable = isSpeechAvailable();

  const startRecording = useCallback(() => {
    if (!speechAvailable) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result?.[0]) {
          if (result.isFinal) {
            final += result[0].transcript + ' ';
          } else {
            interim += result[0].transcript;
          }
        }
      }

      if (final) {
        setTranscript((prev) => {
          const updated = prev + final;
          setProblems(extractProblems(updated));
          setCategory(suggestCategory(updated));
          return updated;
        });
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech') {
        setIsRecording(false);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript('');
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  }, [speechAvailable]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    setInterimTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function handleSave() {
    if (!transcript.trim()) return;
    setSaved(true);
    // Will pass transcript + problems + category to CareLog via API
  }

  if (saved) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
            <svg
              className="h-8 w-8 text-sage"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="font-heading text-2xl font-semibold text-text-primary">
            Voice Note Saved
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {problems.length} Omaha problem{problems.length !== 1 ? 's' : ''} detected
            {category && ` — suggested as ${category.label}`}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => {
                setSaved(false);
                setTranscript('');
                setProblems([]);
                setCategory(null);
              }}
              className="rounded-lg bg-sage px-6 py-2.5 text-sm font-medium text-white hover:bg-sage-dark"
            >
              Record Another
            </button>
            <a
              href="#/worker/care-log"
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-secondary hover:bg-warm-gray"
            >
              Create Full Care Log
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">Voice Note</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Speak naturally about the care interaction. Omaha problems are extracted automatically.
        </p>
      </div>

      {/* Speech not available */}
      {!speechAvailable && (
        <div className="mb-6 rounded-xl border border-zone-yellow/30 bg-zone-yellow/5 p-4 text-center">
          <p className="text-sm font-medium text-zone-yellow">Speech Recognition Not Available</p>
          <p className="mt-1 text-xs text-text-muted">
            Your browser does not support speech recognition. Try Chrome or Edge, or type your notes
            below.
          </p>
        </div>
      )}

      {/* Recording button */}
      <div className="mb-6 flex flex-col items-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!speechAvailable}
          className={`relative flex h-24 w-24 items-center justify-center rounded-full transition-all ${
            isRecording
              ? 'bg-zone-red shadow-lg shadow-zone-red/30'
              : 'bg-sage shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50'
          }`}
        >
          {isRecording && (
            <span className="absolute inset-0 animate-ping rounded-full bg-zone-red opacity-20" />
          )}
          <svg
            className="h-10 w-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            {isRecording ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
              />
            )}
          </svg>
        </button>
        <p className="mt-3 text-sm font-medium text-text-secondary">
          {isRecording ? 'Recording... tap to stop' : 'Tap to start recording'}
        </p>
      </div>

      {/* Transcript */}
      <div className="mb-6 rounded-xl border border-border bg-white p-4">
        <label className="mb-2 block text-sm font-medium text-text-primary">Transcript</label>
        <div className="min-h-[120px] rounded-lg bg-warm-gray/50 p-3 text-sm text-text-primary">
          {transcript || (
            <span className="text-text-muted italic">
              {isRecording ? 'Listening...' : 'Your spoken words will appear here.'}
            </span>
          )}
          {interimTranscript && (
            <span className="text-text-muted italic"> {interimTranscript}</span>
          )}
        </div>
        {/* Manual editing fallback */}
        <textarea
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            setProblems(extractProblems(e.target.value));
            setCategory(suggestCategory(e.target.value));
          }}
          placeholder="Or type your notes here..."
          className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          rows={3}
        />
      </div>

      {/* Extracted problems */}
      {problems.length > 0 && (
        <div className="mb-6 rounded-xl border border-sage/20 bg-sage/5 p-4">
          <h3 className="mb-2 text-sm font-medium text-sage">Detected Omaha Problems</h3>
          <div className="flex flex-wrap gap-2">
            {problems.map((p) => (
              <span
                key={p.code}
                className="rounded-full bg-sage/10 px-3 py-1 text-xs font-medium text-sage"
              >
                #{p.code} {p.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggested category */}
      {category && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-medium text-blue-700">Suggested Category</h3>
          <p className="mt-1 text-xs text-blue-600">{category.label}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <button
          onClick={handleSave}
          disabled={!transcript.trim()}
          className="rounded-lg bg-sage px-8 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save Voice Note
        </button>
        <a
          href="#/worker/care-log"
          className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-text-secondary hover:bg-warm-gray"
        >
          Full Care Log
        </a>
      </div>
    </div>
  );
}
