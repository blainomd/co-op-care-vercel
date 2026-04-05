/**
 * SageChat — Thin chat wrapper over useSageStore.
 *
 * All response generation, state, and profile management live in sageStore.ts
 * which delegates to SageEngine.ts pure functions.
 *
 * This component is ONLY responsible for:
 *  1. Initializing the store on mount
 *  2. Rendering chat bubbles with rich text
 *  3. Rendering inline components (MiniCII, RolePicker, ConsentPicker)
 *  4. Follow-up chips + input form
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useSignupStore, type OnboardingPhase, type MemoryConsent } from '../../stores/signupStore';
import { useSageStore, type Message } from '../../stores/sageStore';
import { saveProfile, loadProfile } from '@client/features/sage/engine/SageEngine';
import { InlineMiniCII, type MiniCIIResult } from './InlineMiniCII';
import { InlineCRI, type CRIResult } from './InlineCRI';
import { TileIcon } from '../../components/TileIcon';
import { InlineRolePicker } from './InlineRolePicker';
import { InlineConsentPicker } from './InlineConsentPicker';

// ─── Props ──────────────────────────────────────────────────────────

interface SageChatProps {
  isNewUser?: boolean;
  comfortCardMode?: boolean;
}

// ─── Rich Text Renderer ─────────────────────────────────────────────

function renderInline(text: string) {
  return text
    .split(/\*\*(.*?)\*\*/g)
    .map((part, j) => (j % 2 === 1 ? <strong key={j}>{part}</strong> : part));
}

function renderContent(content: string) {
  return content.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="h-1" />;

    // Bullet points
    const bullet = trimmed.match(/^[•\u2022]\s*(.*)/);
    if (bullet)
      return (
        <div key={i} className="flex gap-1.5 pl-1 mt-1 leading-snug">
          <span className="opacity-40 shrink-0">{'\u2022'}</span>
          <span>{renderInline(bullet[1]!)}</span>
        </div>
      );

    // Numbered list items
    const num = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (num)
      return (
        <div key={i} className="flex gap-1.5 pl-1 mt-1 leading-snug">
          <span className="opacity-40 font-medium shrink-0 min-w-[1rem] text-right">
            {num[1]!}.
          </span>
          <span>{renderInline(num[2]!)}</span>
        </div>
      );

    // Emoji-prefixed lines
    const emojiLine = trimmed.match(
      /^([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}][\uFE0F\u200D]?)\s*(.*)/u,
    );
    if (emojiLine)
      return (
        <div key={i} className="flex gap-1.5 pl-1 mt-1 leading-snug">
          <span className="shrink-0">{emojiLine[1]!}</span>
          <span>{renderInline(emojiLine[2]!)}</span>
        </div>
      );

    return (
      <p key={i} className={i > 0 ? 'mt-2' : ''}>
        {renderInline(trimmed)}
      </p>
    );
  });
}

// ─── Voice Input Hook ────────────────────────────────────────────────

/** Web Speech API types — not in all TS libs */
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

type VoiceError = 'no-speech' | 'not-allowed' | 'network' | 'unknown' | null;

/**
 * Dictation-mode voice input.
 *
 * - continuous + interimResults → shows live transcription
 * - onTranscript updates the text field (user can review/edit before sending)
 * - finalizedText accumulates completed sentences
 * - interimText shows the "in-progress" word being spoken
 */
function useVoiceInput(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<VoiceError>(null);
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);
  const finalizedRef = useRef('');

  const supported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
    setInterimText('');
  }, []);

  const toggle = useCallback(() => {
    if (!supported) return;
    setError(null);

    // Stop if currently listening
    if (listening) {
      stop();
      return;
    }

    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Reset accumulated text
    finalizedRef.current = '';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result?.[0]) {
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
      }

      // Accumulate finalized text
      if (finalTranscript) {
        finalizedRef.current += finalTranscript;
        // Update the input field with all finalized text
        onTranscript(finalizedRef.current.trim());
      }

      // Show interim text (the word currently being spoken)
      setInterimText(interim);
    };

    recognition.onerror = (event: Event & { error?: string }) => {
      const errorType = event.error;
      if (errorType === 'no-speech') {
        setError('no-speech');
      } else if (errorType === 'not-allowed') {
        setError('not-allowed');
      } else if (errorType === 'network') {
        setError('network');
      } else {
        setError('unknown');
      }
      stop();
    };

    // On mobile, recognition can end unexpectedly — restart if still in listening mode
    recognition.onend = () => {
      // Only auto-restart if we didn't intentionally stop
      if (recognitionRef.current === recognition) {
        // Browser ended recognition (timeout, etc.) — try to restart
        try {
          recognition.start();
        } catch {
          // Can't restart — stop cleanly
          stop();
        }
      }
    };

    try {
      recognition.start();
      setListening(true);
    } catch {
      setError('unknown');
    }
  }, [listening, onTranscript, supported, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // prevent auto-restart
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  return { listening, interimText, error, toggle, stop, supported };
}

const VOICE_ERROR_MESSAGES: Record<string, string> = {
  'no-speech': 'No speech detected — try again',
  'not-allowed': 'Microphone access denied — check your browser settings',
  network: 'Network error — voice needs an internet connection',
  unknown: 'Something went wrong — try again',
};

function createRecognition() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return SR ? new SR() : null;
}

// ─── Component ──────────────────────────────────────────────────────

export function SageChat({ isNewUser, comfortCardMode }: SageChatProps) {
  const user = useAuthStore((s) => s.user);
  const cardHolder = useSignupStore((s) => s.cardHolder);
  const setMemoryConsent = useSignupStore((s) => s.setMemoryConsent);
  const setCommunityRoles = useSignupStore((s) => s.setCommunityRoles);

  // Store selectors
  const messages = useSageStore((s) => s.messages);
  const thinking = useSageStore((s) => s.thinking);
  const input = useSageStore((s) => s.input);
  const context = useSageStore((s) => s.context);
  const activeSubject = useSageStore((s) => s.activeSubject);
  const initialized = useSageStore((s) => s.initialized);
  const initialize = useSageStore((s) => s.initialize);
  const sendMessage = useSageStore((s) => s.sendMessage);
  const setInput = useSageStore((s) => s.setInput);
  const setComponentResult = useSageStore((s) => s.setComponentResult);
  const advancePhase = useSageStore((s) => s.advancePhase);
  const setActiveSubject = useSageStore((s) => s.setActiveSubject);
  const profile = useSageStore((s) => s.profile);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize store on mount
  useEffect(() => {
    if (initialized) return;

    const initialPhase: OnboardingPhase = (() => {
      if (cardHolder?.onboardingPhase && cardHolder.onboardingPhase !== 'fresh')
        return cardHolder.onboardingPhase;
      if (!isNewUser && (user || cardHolder)) return 'onboarded';
      return 'fresh';
    })();

    initialize({
      isNewUser: !!isNewUser,
      isComfortCard: !!comfortCardMode,
      isMember: !!user,
      isReferred: !!cardHolder?.referredBy,
      referrerName: cardHolder?.referredBy
        ? useSignupStore.getState().getReferrerName(cardHolder.referredBy)
        : undefined,
      firstName: cardHolder?.firstName || user?.firstName,
      userId: user?.id || cardHolder?.memberId,
      initialPhase,
    });
  }, [initialized, isNewUser, comfortCardMode, user, cardHolder, initialize]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  // ─── Inline component handlers ─────────────────────────────────────

  const handleMiniCIIComplete = (msgId: string, result: MiniCIIResult) => {
    setComponentResult(msgId, { type: 'mini_cii', result });
    // Save to profile
    const currentProfile = loadProfile();
    saveProfile({ ...currentProfile, lastMiniCII: { ...result } });
    // Send result to Sage
    const zoneLabel =
      result.zone === 'green'
        ? 'managing well'
        : result.zone === 'yellow'
          ? 'carrying a lot'
          : 'need support';
    sendMessage(`My check-in score is ${result.total}/30 — I'm ${zoneLabel}`);
  };

  const handleCRIComplete = (msgId: string, result: CRIResult) => {
    setComponentResult(msgId, { type: 'care_recipient', result });
    // Save to profile
    const currentProfile = loadProfile();
    saveProfile({ ...currentProfile, lastCRI: { ...result } });
    // Build a summary for Sage
    const zoneLabel =
      result.zone === 'green'
        ? 'mostly independent'
        : result.zone === 'yellow'
          ? 'needs regular support'
          : 'needs significant help';
    const flagLabels =
      result.omahaFlags.length > 0 ? ` Areas flagged: ${result.omahaFlags.join(', ')}.` : '';
    sendMessage(`Care recipient score: ${result.total}/50 — ${zoneLabel}.${flagLabels}`);
  };

  const handleRolePickerComplete = (msgId: string, roles: string[]) => {
    setComponentResult(msgId, { type: 'role_picker', result: roles });
    setCommunityRoles(roles);
    advancePhase('profile_community');
    sendMessage(`I'm interested in ${roles.join(', ')}`);
  };

  const handleConsentComplete = (msgId: string, consent: MemoryConsent) => {
    setComponentResult(msgId, { type: 'consent_picker', result: consent });
    setMemoryConsent(consent);
    advancePhase('onboarded');
    sendMessage(
      consent === 'granted' ? 'Yes, you can remember me' : 'Just remember me for this session',
    );
  };

  // Voice input — transcribes into the input field for review before sending
  const handleVoiceTranscript = useCallback(
    (transcript: string) => {
      setInput(transcript);
    },
    [setInput],
  );

  const voice = useVoiceInput(handleVoiceTranscript);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // Stop voice if still listening when user hits send
    if (voice.listening) voice.stop();
    sendMessage(input);
  };

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="flex w-full flex-col rounded-2xl border border-border bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <TileIcon name="seedling" size={16} />
          <span className="font-heading text-sm font-semibold text-navy">Sage</span>
          {thinking && <span className="ml-auto text-xs text-text-muted">thinking…</span>}
          {voice.listening && (
            <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-sage-dark">
              <span className="flex gap-0.5">
                <span className="h-3 w-0.5 animate-pulse rounded-full bg-sage [animation-delay:0ms]" />
                <span className="h-2 w-0.5 animate-pulse rounded-full bg-sage [animation-delay:150ms]" />
                <span className="h-4 w-0.5 animate-pulse rounded-full bg-sage [animation-delay:75ms]" />
                <span className="h-2 w-0.5 animate-pulse rounded-full bg-sage [animation-delay:200ms]" />
              </span>
              hearing you
            </span>
          )}
        </div>

        {/* Active subject — who are we talking about right now? */}
        {activeSubject && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="text-[10px] text-text-muted">talking about</span>
            <button
              type="button"
              onClick={() => sendMessage(`Tell me more about ${activeSubject.name}`)}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-all active:scale-95 ${
                activeSubject.type === 'self'
                  ? 'bg-sage/15 text-sage-dark'
                  : activeSubject.type === 'care_recipient'
                    ? 'bg-gold/15 text-gold'
                    : 'bg-navy/10 text-navy'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  activeSubject.type === 'self'
                    ? 'bg-sage'
                    : activeSubject.type === 'care_recipient'
                      ? 'bg-gold'
                      : 'bg-navy'
                }`}
              />
              {activeSubject.name}
              {activeSubject.relationship && activeSubject.type !== 'self' && (
                <span className="opacity-60">({activeSubject.relationship})</span>
              )}
            </button>

            {/* Quick-switch to other known people */}
            {(() => {
              const others: Array<{
                name: string;
                rel?: string;
                type: 'care_recipient' | 'network_member' | 'self';
              }> = [];
              // Add self if not current
              if (activeSubject.type !== 'self') {
                others.push({ name: 'Me', type: 'self' });
              }
              // Add care recipient if not current
              if (
                profile.careRecipient?.name &&
                activeSubject.name !== profile.careRecipient.name
              ) {
                others.push({
                  name: profile.careRecipient.name,
                  rel: profile.careRecipient.relationship,
                  type: 'care_recipient',
                });
              }
              // Add network members if not current
              for (const m of profile.network ?? []) {
                if (m.name && m.name !== activeSubject.name) {
                  others.push({ name: m.name, rel: m.relationship, type: 'network_member' });
                }
              }
              if (others.length === 0) return null;
              return others.slice(0, 3).map((o) => (
                <button
                  key={o.name}
                  type="button"
                  onClick={() => {
                    setActiveSubject({ name: o.name, relationship: o.rel, type: o.type });
                    sendMessage(`Let's talk about ${o.name}${o.rel ? ` (my ${o.rel})` : ''}`);
                  }}
                  className="rounded-full border border-border bg-white px-2 py-0.5 text-[10px] text-text-muted hover:bg-warm-gray transition-all active:scale-95"
                >
                  {o.name}
                </button>
              ));
            })()}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="max-h-[60vh] min-h-[200px] flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-sage text-white rounded-br-md'
                  : 'bg-warm-gray text-text-primary rounded-bl-md'
              }`}
            >
              {renderContent(msg.content)}

              {/* Inline components */}
              {msg.component?.type === 'mini_cii' && (
                <InlineMiniCII
                  completedResult={extractMiniCIIResult(msg)}
                  onComplete={(result) => handleMiniCIIComplete(msg.id, result)}
                />
              )}
              {msg.component?.type === 'care_recipient' && (
                <InlineCRI
                  completedResult={extractCRIResult(msg)}
                  onComplete={(result) => handleCRIComplete(msg.id, result)}
                />
              )}
              {msg.component?.type === 'role_picker' && (
                <InlineRolePicker
                  completedRoles={extractRoleResult(msg)}
                  onComplete={(roles) => handleRolePickerComplete(msg.id, roles)}
                />
              )}
              {msg.component?.type === 'consent_picker' && (
                <InlineConsentPicker
                  completedConsent={extractConsentResult(msg)}
                  onComplete={(consent) => handleConsentComplete(msg.id, consent)}
                  onTellMeMore={() => sendMessage('What exactly do you store about me?')}
                />
              )}
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {thinking && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl bg-warm-gray px-4 py-3 rounded-bl-md">
              <span className="h-2 w-2 animate-bounce rounded-full bg-text-muted [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-text-muted [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-text-muted [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {/* Follow-up chips */}
        {(() => {
          const lastMsg = messages[messages.length - 1];
          if (!lastMsg || lastMsg.role !== 'sage' || !lastMsg.followups || thinking) return null;
          return (
            <div className="flex flex-wrap gap-1.5 pl-1">
              {lastMsg.followups.map((f, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(f.message)}
                  className="rounded-full border border-sage/30 bg-sage/5 px-3 py-1.5 text-xs font-medium text-sage-dark hover:bg-sage/10 active:scale-95 transition-all"
                >
                  {f.label}
                </button>
              ))}
            </div>
          );
        })()}

        <div ref={bottomRef} />
      </div>

      {/* Voice error feedback */}
      {voice.error && (
        <div className="mx-3 mb-1 rounded-lg bg-zone-red/10 px-3 py-1.5 text-xs text-zone-red">
          {VOICE_ERROR_MESSAGES[voice.error] ?? 'Something went wrong'}
        </div>
      )}

      {/* Live transcription preview — shows what's being heard */}
      {voice.listening && (voice.interimText || input) && (
        <div className="mx-3 mb-1 rounded-lg bg-sage/5 border border-sage/20 px-3 py-2">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zone-red" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
              Hearing you...
            </span>
          </div>
          <p className="text-sm text-text-primary">
            {input}
            {voice.interimText && (
              <span className="text-text-muted italic"> {voice.interimText}</span>
            )}
          </p>
        </div>
      )}

      {/* Input — voice-first with text fallback */}
      <form onSubmit={handleSubmit} className="border-t border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          {/* Mic button — prominent when voice is supported */}
          {voice.supported && (
            <button
              type="button"
              onClick={voice.toggle}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all active:scale-90 ${
                voice.listening
                  ? 'bg-zone-red text-white shadow-md shadow-zone-red/30 animate-pulse'
                  : 'bg-sage/10 text-sage-dark hover:bg-sage/20'
              }`}
              aria-label={voice.listening ? 'Stop listening' : 'Talk to Sage'}
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
            </button>
          )}
          <input
            type="text"
            value={
              voice.listening ? input + (voice.interimText ? ' ' + voice.interimText : '') : input
            }
            onChange={(e) => {
              if (!voice.listening) setInput(e.target.value);
            }}
            placeholder={
              voice.listening
                ? "Speak naturally — I'm listening..."
                : context.suggestedQuestion || 'Type or tap the mic...'
            }
            className={`flex-1 rounded-full border px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-all ${
              voice.listening
                ? 'border-sage/50 bg-sage/5 ring-1 ring-sage/20'
                : 'border-border bg-warm-white focus:border-sage focus:ring-1 focus:ring-sage/30'
            }`}
            readOnly={voice.listening}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage text-white disabled:opacity-30 hover:bg-sage-dark active:scale-90 transition-all"
            aria-label="Send"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" x2="11" y1="2" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Result Extractors ──────────────────────────────────────────────
// componentResult is stored as `unknown` in the store; these helpers
// safely extract typed results for the inline component props.

function extractMiniCIIResult(msg: Message): MiniCIIResult | undefined {
  const r = msg.componentResult as { type?: string; result?: MiniCIIResult } | undefined;
  return r?.type === 'mini_cii' ? r.result : undefined;
}

function extractRoleResult(msg: Message): string[] | undefined {
  const r = msg.componentResult as { type?: string; result?: string[] } | undefined;
  return r?.type === 'role_picker' ? r.result : undefined;
}

function extractCRIResult(msg: Message): CRIResult | undefined {
  const r = msg.componentResult as { type?: string; result?: CRIResult } | undefined;
  return r?.type === 'care_recipient' ? r.result : undefined;
}

function extractConsentResult(msg: Message): MemoryConsent | undefined {
  const r = msg.componentResult as { type?: string; result?: MemoryConsent } | undefined;
  return r?.type === 'consent_picker' ? r.result : undefined;
}

export default SageChat;
