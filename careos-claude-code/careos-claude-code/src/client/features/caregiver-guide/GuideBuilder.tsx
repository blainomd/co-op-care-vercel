/**
 * GuideBuilder — Conversational Connector Orchestrator
 *
 * NOT a form. A Sage conversation that PULLS and ESTIMATES,
 * then confirms with the human. Connectors fire behind the scenes
 * as Sage gathers enough context to invoke each one.
 *
 * Flow:
 *   1. User says one sentence about their loved one
 *   2. Sage pulls from FHIR, pharmacy, Apple Health, existing records
 *   3. Sage estimates what it doesn't know (fall risk, HSA eligibility, etc.)
 *   4. Sage presents findings and asks to confirm/correct
 *   5. Connectors fire as context accumulates
 *   6. Guide assembles from Connector outputs — not from form fields
 *
 * Inline styles — DO NOT apply Tailwind (standalone brand page).
 */
import { useState, useRef, useEffect } from 'react';
import { careGoals, fonts, fontLinks, company } from '../marketing/design-tokens';
import { getGuideConnectors } from '../../../shared/connectors/registry';

const CONNECTORS = getGuideConnectors();

// ─── Types ──────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'sage';
  content: string;
  connectorsFired?: string[];
  estimates?: Array<{ label: string; value: string; confidence: 'high' | 'medium' | 'low' }>;
  pulls?: Array<{ source: string; data: string }>;
  timestamp: Date;
}

type Phase = 'conversation' | 'generating' | 'complete';

// ─── Simulated Sage responses (replace with /api/v1/sage/chat) ──────

function simulateSageResponse(
  userMessage: string,
  messageCount: number,
): { response: Message; connectorsFired: string[] } {
  const id = crypto.randomUUID();
  const now = new Date();

  // First message — Sage pulls and estimates
  if (messageCount === 0) {
    return {
      response: {
        id,
        role: 'sage',
        content:
          "Let me pull what I can find.\n\n" +
          "From connected records, I'm seeing:\n" +
          "• **Metformin 500mg** twice daily (Type 2 diabetes)\n" +
          "• **Lisinopril 10mg** morning (hypertension)\n" +
          "• **Donepezil 5mg** at night (cognitive support)\n" +
          "• Next refill: April 12 at CVS\n\n" +
          "Based on the profile, I'm estimating:\n" +
          "• **Moderate fall risk** — age + cognitive + diabetes\n" +
          "• Morning routine needs **medication supervision**\n" +
          "• **HSA-eligible**: grab bars, companion care, therapeutic yoga\n" +
          "• A1C monitoring due Q2 2026\n\n" +
          "Does this look right? Anything I'm missing?",
        pulls: [
          { source: 'FHIR', data: '3 active medications found' },
          { source: 'Pharmacy', data: 'CVS — refill April 12' },
        ],
        estimates: [
          { label: 'Fall risk', value: 'Moderate', confidence: 'high' },
          { label: 'HSA eligibility', value: '3 services identified', confidence: 'high' },
          { label: 'Supervision level', value: 'Medication supervision', confidence: 'medium' },
        ],
        connectorsFired: ['clinical-research', 'medication-mgmt'],
        timestamp: now,
      },
      connectorsFired: ['clinical-research', 'medication-mgmt'],
    };
  }

  // Second message — user confirms/corrects, Sage adapts
  if (messageCount === 1) {
    const mentionsKnees = userMessage.toLowerCase().includes('knee') || userMessage.toLowerCase().includes('arthritis');
    return {
      response: {
        id,
        role: 'sage',
        content: mentionsKnees
          ? "Adding **osteoarthritis** — that moves fall risk to **high** and qualifies for additional services.\n\n" +
            "Updated estimates:\n" +
            "• Fall risk: **High** (was moderate)\n" +
            "• Added: physical therapy, balance training → HSA-eligible\n" +
            "• Grab bars + non-slip mats now **strongly recommended**\n\n" +
            "I also noticed a potential timing issue: Donepezil and Metformin taken together can amplify hypoglycemia risk. Routing to **Dr. Emdur** for review.\n\n" +
            "One more thing — what does a good day look like for her? This shapes everything in the guide."
          : "Got it. I've noted that.\n\n" +
            "I'd like to capture what matters to her — this is what makes the guide personal, not just clinical.\n\n" +
            "What does a good day look like for her?",
        connectorsFired: mentionsKnees ? ['clinical-research', 'savings-finder'] : [],
        estimates: mentionsKnees
          ? [
              { label: 'Fall risk', value: 'High (updated)', confidence: 'high' },
              { label: 'HSA services', value: '5 services (was 3)', confidence: 'high' },
              { label: 'Drug interaction', value: 'Donepezil + Metformin timing', confidence: 'medium' },
            ]
          : [],
        timestamp: now,
      },
      connectorsFired: mentionsKnees ? ['clinical-research', 'savings-finder'] : [],
    };
  }

  // Third message — CareGoals values, then generate
  if (messageCount === 2) {
    return {
      response: {
        id,
        role: 'sage',
        content:
          "That's beautiful. I'll weave that through every section of the guide — so any caregiver knows this isn't just a patient with diabetes and bad knees. This is someone who loves her garden.\n\n" +
          "I have everything I need. Generating your guide now — 6 specialized agents working together, each one physician-reviewed.\n\n" +
          "**Estimated savings identified: $936/year** via HSA/FSA. The Letter of Medical Necessity is already drafted for Dr. Emdur's review.",
        connectorsFired: ['care-plan', 'savings-finder', 'living-memory', 'appointment-monitor'],
        timestamp: now,
      },
      connectorsFired: ['care-plan', 'savings-finder', 'living-memory', 'appointment-monitor'],
    };
  }

  // Fallback
  return {
    response: {
      id,
      role: 'sage',
      content: "I've captured that. Anything else you'd like to add before I generate the guide?",
      timestamp: now,
    },
    connectorsFired: [],
  };
}

// ─── Component ──────────────────────────────────────────────────────

export function GuideBuilder() {
  const [phase, setPhase] = useState<Phase>('conversation');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'sage',
      content: "Tell me about the person you're caring for — even one sentence is enough. I'll pull what I can from connected records and fill in the rest.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [firedConnectors, setFiredConnectors] = useState<Set<string>>(new Set());
  const [userMessageCount, setUserMessageCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate Sage thinking + pulling
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

    const { response, connectorsFired: newConnectors } = simulateSageResponse(
      userMsg.content,
      userMessageCount,
    );

    setMessages((prev) => [...prev, response]);
    setFiredConnectors((prev) => {
      const next = new Set(prev);
      newConnectors.forEach((c) => next.add(c));
      return next;
    });
    setUserMessageCount((prev) => prev + 1);
    setIsTyping(false);

    // After 3 exchanges, trigger guide generation
    if (userMessageCount >= 2) {
      setTimeout(() => {
        setPhase('generating');
        // Simulate generation
        setTimeout(() => setPhase('complete'), 3000);
      }, 2000);
    }

    // Focus back on input
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <link rel="stylesheet" href={fontLinks.dmSans} />
      <link rel="stylesheet" href={fontLinks.lora} />

      <div
        style={{
          fontFamily: fonts.body,
          background: careGoals.cream,
          color: careGoals.text,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${careGoals.border}`,
            background: careGoals.cream,
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: careGoals.sage,
                    background: `${careGoals.sage}12`,
                    padding: '3px 10px',
                    borderRadius: 12,
                  }}
                >
                  co-op.care
                </span>
                <span style={{ fontFamily: fonts.serif, fontSize: 18, fontWeight: 600, color: careGoals.charcoal }}>
                  Caregiver Guide
                </span>
              </div>
            </div>

            {/* Active Connectors indicator */}
            <div style={{ display: 'flex', gap: 4 }}>
              {CONNECTORS.map((c) => (
                <div
                  key={c.id}
                  title={c.name}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: firedConnectors.has(c.id) ? careGoals.sage : careGoals.border,
                    transition: 'background 0.5s',
                  }}
                />
              ))}
            </div>
          </div>
        </header>

        {/* Chat area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
          }}
        >
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  marginBottom: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Role label */}
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: msg.role === 'sage' ? careGoals.sage : careGoals.muted,
                    marginBottom: 4,
                    letterSpacing: '0.04em',
                  }}
                >
                  {msg.role === 'sage' ? 'SAGE' : 'YOU'}
                </div>

                {/* Message bubble */}
                <div
                  style={{
                    background: msg.role === 'user' ? careGoals.sage : '#ffffff',
                    color: msg.role === 'user' ? '#fff' : careGoals.charcoal,
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '14px 18px',
                    maxWidth: '85%',
                    fontSize: 15,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    border: msg.role === 'sage' ? `1px solid ${careGoals.border}` : 'none',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />

                {/* Pulls indicator */}
                {msg.pulls && msg.pulls.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    {msg.pulls.map((p) => (
                      <span
                        key={p.source}
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: '#2980b9',
                          background: 'rgba(41,128,185,0.08)',
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        Pulled from {p.source}: {p.data}
                      </span>
                    ))}
                  </div>
                )}

                {/* Estimates indicator */}
                {msg.estimates && msg.estimates.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    {msg.estimates.map((e) => (
                      <span
                        key={e.label}
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color:
                            e.confidence === 'high'
                              ? careGoals.sage
                              : e.confidence === 'medium'
                                ? '#e67e22'
                                : careGoals.muted,
                          background:
                            e.confidence === 'high'
                              ? `${careGoals.sage}12`
                              : e.confidence === 'medium'
                                ? 'rgba(230,126,34,0.08)'
                                : `${careGoals.muted}15`,
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        {e.label}: {e.value}
                      </span>
                    ))}
                  </div>
                )}

                {/* Connectors fired */}
                {msg.connectorsFired && msg.connectorsFired.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    {msg.connectorsFired.map((cId) => {
                      const connector = CONNECTORS.find((c) => c.id === cId);
                      return (
                        <span
                          key={cId}
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: connector?.landing.tagColor || careGoals.sage,
                            background: `${connector?.landing.tagColor || careGoals.sage}12`,
                            padding: '2px 8px',
                            borderRadius: 6,
                          }}
                        >
                          {connector?.name || cId}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: careGoals.sage,
                    marginBottom: 4,
                    letterSpacing: '0.04em',
                  }}
                >
                  SAGE
                </div>
                <div
                  style={{
                    background: '#ffffff',
                    border: `1px solid ${careGoals.border}`,
                    borderRadius: '16px 16px 16px 4px',
                    padding: '14px 18px',
                    display: 'inline-flex',
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 12, color: careGoals.muted }}>
                    Pulling records and estimating
                  </span>
                  <span style={{ animation: 'pulse 1.5s infinite', color: careGoals.sage }}>...</span>
                </div>
              </div>
            )}

            {/* Generation phase */}
            {phase === 'generating' && (
              <div
                style={{
                  background: `${careGoals.sage}08`,
                  border: `1px solid ${careGoals.sage}30`,
                  borderRadius: 14,
                  padding: '20px 24px',
                  marginTop: 12,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: careGoals.sage, marginBottom: 12 }}>
                  ASSEMBLING YOUR GUIDE
                </div>
                {CONNECTORS.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '6px 0',
                      fontSize: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: firedConnectors.has(c.id) ? careGoals.sage : careGoals.border,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {firedConnectors.has(c.id) && (
                        <svg width={10} height={10} viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span style={{ color: firedConnectors.has(c.id) ? careGoals.charcoal : careGoals.muted }}>
                      {c.name}
                    </span>
                    {c.requiresPhysicianReview && firedConnectors.has(c.id) && (
                      <span style={{ fontSize: 10, color: careGoals.sage, marginLeft: 'auto' }}>
                        Physician reviewed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Complete phase */}
            {phase === 'complete' && (
              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    background: '#ffffff',
                    border: `1px solid ${careGoals.border}`,
                    borderRadius: 16,
                    padding: '24px',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontFamily: fonts.serif, fontSize: 22, fontWeight: 700, color: careGoals.charcoal, margin: 0 }}>
                      Caregiver Guide Ready
                    </h2>
                    <span style={{ fontSize: 11, fontWeight: 600, color: careGoals.sage, background: `${careGoals.sage}12`, padding: '3px 10px', borderRadius: 8 }}>
                      Physician reviewed
                    </span>
                  </div>

                  {[
                    'About Margaret — garden, grandkids, morning coffee',
                    'Daily Schedule — morning through night with supervision levels',
                    'Medications — 3 active, 1 interaction flagged, refill April 12',
                    'Emergency Protocols — fall protocol, hospital bag list',
                    'HSA/FSA Savings — $936/year, LMN drafted',
                    'Appointments — A1C due Q2, Dr. Emdur review pending',
                  ].map((section) => (
                    <div
                      key={section}
                      style={{
                        padding: '10px 0',
                        borderBottom: `1px solid ${careGoals.border}`,
                        fontSize: 14,
                        color: careGoals.text,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>{section}</span>
                      <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                        <path d="M5 3l4 4-4 4" stroke={careGoals.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  ))}
                </div>

                {/* Triggers summary */}
                <div
                  style={{
                    background: `${careGoals.sage}08`,
                    border: `1px solid ${careGoals.sage}25`,
                    borderRadius: 12,
                    padding: '16px 20px',
                    marginBottom: 16,
                    fontSize: 13,
                  }}
                >
                  <div style={{ fontWeight: 700, color: careGoals.sage, marginBottom: 8 }}>
                    WHAT HAPPENED DURING THIS CONVERSATION
                  </div>
                  {[
                    'Living Profile created from 3 exchanges',
                    'Drug interaction flagged → physician review queued',
                    '5 HSA-eligible services identified → $936/yr savings',
                    'LMN drafted for Dr. Emdur signature',
                    'Fall risk: High → grab bars recommended',
                  ].map((t) => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', color: careGoals.text }}>
                      <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke={careGoals.sage} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {t}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    style={{
                      flex: 1,
                      background: careGoals.sage,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 12,
                      padding: '14px',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: fonts.body,
                    }}
                  >
                    Print guide
                  </button>
                  <button
                    style={{
                      flex: 1,
                      background: careGoals.copper,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 12,
                      padding: '14px',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: fonts.body,
                    }}
                  >
                    Keep alive — $59/mo
                  </button>
                </div>
                <p style={{ fontSize: 11, color: careGoals.muted, textAlign: 'center', marginTop: 8 }}>
                  Medical Director: {company.medicalDirector.name} · {company.medicalDirector.license}
                </p>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input area (sticky bottom) */}
        {phase === 'conversation' && (
          <div
            style={{
              borderTop: `1px solid ${careGoals.border}`,
              background: careGoals.cream,
              padding: '16px 24px',
              position: 'sticky',
              bottom: 0,
            }}
          >
            <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', gap: 10 }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tell Sage about your loved one..."
                rows={1}
                style={{
                  flex: 1,
                  border: `1px solid ${careGoals.border}`,
                  borderRadius: 12,
                  padding: '12px 16px',
                  fontSize: 15,
                  fontFamily: fonts.body,
                  resize: 'none',
                  outline: 'none',
                  background: '#fff',
                  color: careGoals.charcoal,
                  lineHeight: 1.5,
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                style={{
                  background: input.trim() && !isTyping ? careGoals.sage : careGoals.border,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  width: 44,
                  height: 44,
                  cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.15s',
                }}
              >
                <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h12M11 5l4 4-4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    </>
  );
}
