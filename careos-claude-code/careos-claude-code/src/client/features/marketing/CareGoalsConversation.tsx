import { useState, useEffect, useRef } from 'react';
import { fontLinks, company } from './design-tokens';
import { SHIcons } from './IconShowcase';

// ─── Types ──────────────────────────────────────────────────

interface CareGoalsModule {
  id: number;
  abbr: string;
  title: string;
  question: string;
  subtitle: string;
  options: string[];
}

interface Selections {
  [moduleId: number]: string[];
}

interface CustomInputs {
  [moduleId: number]: string[];
}

// ─── Inline SVG check icon ──────────────────────────────────

function CheckIcon({ color = 'white', size = 12 }: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 6L5 9L10 3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Module data ────────────────────────────────────────────

const MODULES: CareGoalsModule[] = [
  {
    id: 1,
    abbr: 'DAY',
    title: 'A Good Day',
    question: 'What makes a good day for you?',
    subtitle: 'Tap everything that fits. Add your own too.',
    options: [
      'Morning coffee on the porch',
      'A walk outside, even a short one',
      'Talking to my kids or grandkids',
      'Reading or watching something I enjoy',
      'Cooking or eating a good meal',
      'Working in the garden',
      'Being with my pet',
      'Listening to music',
      'A nap without guilt',
      'Just having no pain today',
    ],
  },
  {
    id: 2,
    abbr: 'HRT',
    title: 'What Matters Most',
    question: 'Right now, what matters most to you?',
    subtitle: 'Pick the ones that feel true today.',
    options: [
      'Staying in my own home',
      'Being independent as long as possible',
      'Spending time with family',
      'Not being a burden on anyone',
      'Managing my pain',
      'Keeping my mind sharp',
      'My faith or spiritual life',
      'Feeling useful and needed',
      'Having fun — laughing, enjoying life',
      'Being comfortable, not just alive',
    ],
  },
  {
    id: 3,
    abbr: 'CMF',
    title: 'My Comfort',
    question: 'When things get hard, what helps?',
    subtitle: 'These tell your care team how to support you.',
    options: [
      'A warm blanket and quiet room',
      'Having someone just sit with me',
      'Music — especially classical / jazz / oldies',
      'My pet nearby',
      'Prayer or meditation',
      'A phone call from family',
      'Being outside or near a window',
      'A cup of tea or coffee',
      'Watching old movies or familiar shows',
      'Being left alone for a while',
    ],
  },
  {
    id: 4,
    abbr: 'PPL',
    title: 'My People',
    question: "Who's important in your care?",
    subtitle: "Pick the roles. You'll add names next.",
    options: [
      'My daughter makes the big decisions',
      'My son handles the finances',
      'My spouse is my primary support',
      'My best friend checks on me regularly',
      'A neighbor helps with day-to-day things',
      'I want my whole family involved',
      'I want one person in charge, not a committee',
      'My doctor should weigh in on medical choices',
      "I trust my caregiver's judgment",
      'I want to make my own decisions as long as I can',
    ],
  },
  {
    id: 5,
    abbr: 'WRY',
    title: 'What Worries Me',
    question: 'What are you most worried about?',
    subtitle: "It's okay. Everyone has these. Picking them helps us plan.",
    options: [
      'Falling and not being able to get up',
      'Losing my memory',
      "Being in pain that won't stop",
      'Running out of money',
      'Being a burden on my family',
      'Going to a nursing home',
      'Losing my independence',
      'Being alone at the end',
      'Not being able to communicate what I want',
      'My family fighting over my care',
    ],
  },
  {
    id: 6,
    abbr: 'MED',
    title: "If I Can't Speak",
    question: "If you couldn't speak for yourself, what would you want?",
    subtitle: 'These guide your family during the hardest moments.',
    options: [
      'Keep me comfortable — even if it means less treatment',
      "No machines keeping me alive if there's no hope",
      "Try everything possible — I'm a fighter",
      'Let my daughter/son decide — I trust them',
      'I want to be at home, not in a hospital',
      "No feeding tubes if I can't eat on my own",
      'Pain management is the top priority',
      "I'm okay with hospice when the time comes",
      "Don't let me suffer just to live longer",
      'I want my family around me at the end',
    ],
  },
  {
    id: 7,
    abbr: 'LGC',
    title: 'What I Want Remembered',
    question: 'What do you want your grandchildren to know about you?',
    subtitle: 'These are the stories that live forever.',
    options: [
      "How I met their grandparent — that's a good one",
      'What I did for work and why it mattered',
      'The hard things I survived',
      'My favorite family traditions',
      'The places I traveled',
      'What made me laugh the hardest',
      'The music, food, or books I loved',
      'What I believe about life',
      'The mistakes I learned from',
      'That I loved them more than anything',
    ],
  },
  {
    id: 8,
    abbr: 'TRM',
    title: 'My Terms',
    question: 'How do you want to live from here?',
    subtitle: 'This is your north star. Everything else follows from this.',
    options: [
      'On my own terms, in my own home',
      'Surrounded by people I love',
      'Doing the things I enjoy for as long as I can',
      'With dignity — no matter what happens',
      'Without unnecessary medical interventions',
      "With help when I need it, independence when I don't",
      'Laughing as much as possible',
      'Making peace with the people in my life',
      'Leaving things in order for my family',
      'Living each day like it matters — because it does',
    ],
  },
];

// ─── Module abbr → SHIcons key map ─────────────────────────

const MODULE_ICON_MAP: Record<string, string> = {
  DAY: 'sunrise',
  HRT: 'heart',
  CMF: 'dove',
  PPL: 'people',
  WRY: 'waves',
  MED: 'medical',
  LGC: 'book',
  TRM: 'horizon',
};

// ─── Component ──────────────────────────────────────────────

export function CareGoalsConversation() {
  const [moduleIdx, setModuleIdx] = useState<number>(-1); // -1 = welcome
  const [selections, setSelections] = useState<Selections>({});
  const [customInputs, setCustomInputs] = useState<CustomInputs>({});
  const [showingCustom, setShowingCustom] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');
  const [celebration, setCelebration] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [doneStep, setDoneStep] = useState<
    'summary' | 'save' | 'saved' | 'share' | 'payment' | 'complete'
  >('summary');
  const [saveEmail, setSaveEmail] = useState<string>('');
  const [shareEmails, setShareEmails] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const hasSpeech =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = () => {
    if (!hasSpeech) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join('');
      setCustomText(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    if (!showingCustom) setShowingCustom(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const currentModule: CareGoalsModule | null =
    moduleIdx >= 0 && moduleIdx < MODULES.length ? (MODULES[moduleIdx] ?? null) : null;
  const currentSelections: string[] = currentModule ? selections[currentModule.id] || [] : [];
  const currentCustoms: string[] = currentModule ? customInputs[currentModule.id] || [] : [];

  const toggleOption = (option: string) => {
    if (!currentModule) return;
    const current = selections[currentModule.id] || [];
    const updated = current.includes(option)
      ? current.filter((o: string) => o !== option)
      : [...current, option];
    setSelections({ ...selections, [currentModule.id]: updated });
  };

  const addCustom = () => {
    if (!customText.trim() || !currentModule) return;
    const current = customInputs[currentModule.id] || [];
    setCustomInputs({ ...customInputs, [currentModule.id]: [...current, customText.trim()] });
    const sel = selections[currentModule.id] || [];
    setSelections({ ...selections, [currentModule.id]: [...sel, customText.trim()] });
    setCustomText('');
    setShowingCustom(false);
  };

  const nextModule = () => {
    if (moduleIdx < MODULES.length - 1) {
      const msgs = [
        "Nice. That's one down!",
        "You're on a roll!",
        'This is great -- keep going!',
        'Your family is going to love this.',
        "You're over halfway!",
        "Almost there! You're doing amazing.",
        'One more after this!',
        "Last one -- you've got this!",
      ];
      setCelebration(msgs[moduleIdx] || 'Nice!');
      setTimeout(() => {
        setCelebration(null);
        setModuleIdx(moduleIdx + 1);
        setShowingCustom(false);
        setCustomText('');
      }, 1200);
    } else {
      setModuleIdx(MODULES.length); // done state
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [moduleIdx]);

  const C = {
    bg: '#faf8f4',
    card: '#ffffff',
    sage: '#6b8f71',
    sageDark: '#4a7050',
    sageLight: '#e8f0e9',
    copper: '#c4956a',
    copperLight: '#faf0e6',
    text: '#2a2a2a',
    muted: '#888',
    light: '#f3ede5',
    border: '#e8e0d6',
    navy: '#1a2a3a',
    coral: '#d4766a',
    selected: '#e8f0e9',
    selectedBorder: '#6b8f71',
  };

  // ===== WELCOME =====
  if (moduleIdx === -1) {
    return (
      <div
        style={{
          background: '#e8e0d6',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <link href={fontLinks.dmSans} rel="stylesheet" />
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <div
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#4a4a4a',
              letterSpacing: '-0.5px',
            }}
          >
            co-op.care
          </div>
          <div style={{ fontSize: '11px', color: '#888', maxWidth: '320px', lineHeight: '1.4' }}>
            $59/month · The app that comes with a caregiver and loads of pretax cost savings on
            healthcare and wellness including caregiving expenses
          </div>
        </div>
        <div
          style={{
            width: '390px',
            minHeight: '844px',
            background: C.bg,
            borderRadius: '40px',
            border: '3px solid #ddd',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}
        >
          <div
            style={{
              height: '50px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: '0 24px 8px',
              fontSize: '13px',
              fontWeight: '600',
              color: C.text,
            }}
          >
            9:41
          </div>
          <div
            style={{
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              marginTop: '40px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: C.sage,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: '800',
                color: 'white',
                marginBottom: '20px',
                boxShadow: `0 8px 32px ${C.sage}40`,
              }}
            >
              CG
            </div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: '800',
                color: C.navy,
                letterSpacing: '-1px',
                marginBottom: '8px',
              }}
            >
              CareGoals
            </div>
            <div
              style={{ fontSize: '16px', color: C.sage, fontWeight: '600', marginBottom: '24px' }}
            >
              Advance care planning made fun and simple.
            </div>
            <div
              style={{
                fontSize: '15px',
                color: C.muted,
                lineHeight: '1.7',
                marginBottom: '32px',
                maxWidth: '300px',
              }}
            >
              We're going to ask Peggy 8 simple questions. Each one takes about 3 minutes. She'll
              tap answers that feel right — and add her own if she wants.
            </div>
            <div
              style={{
                fontSize: '14px',
                color: C.text,
                lineHeight: '1.7',
                marginBottom: '32px',
                maxWidth: '300px',
                padding: '20px',
                background: C.sageLight,
                borderRadius: '16px',
              }}
            >
              <div style={{ fontWeight: '700', color: C.navy, marginBottom: '6px' }}>
                What this creates:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckIcon color={C.sage} size={14} /> A living goals document for her care team
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckIcon color={C.sage} size={14} /> An advance directive (auto-generated)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckIcon color={C.sage} size={14} /> Family alignment — everyone on the same page
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckIcon color={C.sage} size={14} /> Her voice, preserved — even if she can't
                speak later
              </div>
            </div>
            <button
              onClick={() => setModuleIdx(0)}
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '18px',
                background: C.sage,
                border: 'none',
                borderRadius: '16px',
                color: 'white',
                fontSize: '17px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: `0 4px 20px ${C.sage}40`,
              }}
            >
              Let's Start {'\u2192'}
            </button>
            <div style={{ fontSize: '12px', color: C.muted, marginTop: '12px' }}>
              Takes about 20 minutes total · Do it all now or come back anytime
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== DONE =====
  if (moduleIdx >= MODULES.length) {
    return (
      <div
        style={{
          background: '#e8e0d6',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <link href={fontLinks.dmSans} rel="stylesheet" />
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#4a4a4a' }}>co-op.care</div>
          <div style={{ fontSize: '11px', color: '#888', maxWidth: '320px', lineHeight: '1.4' }}>
            $59/month · The app that comes with a caregiver and loads of pretax cost savings
          </div>
        </div>
        <div
          style={{
            width: '390px',
            minHeight: '844px',
            background: C.bg,
            borderRadius: '40px',
            border: '3px solid #ddd',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}
        >
          <div
            style={{
              height: '50px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: '0 24px 8px',
              fontSize: '13px',
              fontWeight: '600',
              color: C.text,
            }}
          >
            9:41
          </div>
          <div style={{ padding: '20px 24px', textAlign: 'center', marginTop: '40px' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: C.sage,
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 32px ${C.sage}40`,
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 18L14 26L30 10"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: '800',
                color: C.navy,
                marginBottom: '8px',
                letterSpacing: '-1px',
              }}
            >
              You did it!
            </div>
            <div
              style={{ fontSize: '15px', color: C.muted, lineHeight: '1.7', marginBottom: '28px' }}
            >
              Peggy's goals are captured. Her advance directive is being generated. Her care team
              will know exactly what she wants.
            </div>

            <div
              style={{
                background: C.card,
                borderRadius: '16px',
                border: `1px solid ${C.border}`,
                padding: '20px',
                textAlign: 'left',
                marginBottom: '16px',
              }}
            >
              <div
                style={{ fontSize: '14px', fontWeight: '700', color: C.navy, marginBottom: '12px' }}
              >
                Summary
              </div>
              {MODULES.map((m) => {
                const sel = selections[m.id] || [];
                return (
                  <div
                    key={m.id}
                    style={{
                      marginBottom: '12px',
                      paddingBottom: '12px',
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: C.sage,
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '22px',
                          height: '22px',
                          borderRadius: '4px',
                          background: C.sageLight,
                          fontSize: '8px',
                          fontWeight: '800',
                          color: C.sageDark,
                          letterSpacing: '0.3px',
                        }}
                      >
                        {m.abbr}
                      </span>
                      {m.title}
                    </div>
                    <div style={{ fontSize: '13px', color: C.text, lineHeight: '1.5' }}>
                      {sel.length > 0 ? sel.join(' · ') : 'No selections'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* STEP 1: Summary → Save */}
            {doneStep === 'summary' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => setDoneStep('save')}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: C.sage,
                    border: 'none',
                    borderRadius: '14px',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: `0 4px 16px ${C.sage}40`,
                  }}
                >
                  Save Peggy's Goals
                </button>
                <div style={{ fontSize: '12px', color: C.muted, textAlign: 'center' }}>
                  Free -- no account needed yet
                </div>
              </div>
            )}

            {/* STEP 2: Email capture */}
            {doneStep === 'save' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: C.navy,
                    textAlign: 'center',
                  }}
                >
                  Save these goals
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: C.muted,
                    textAlign: 'center',
                    lineHeight: '1.6',
                  }}
                >
                  Enter your email and we'll send a copy of Peggy's goals. You can come back and
                  update them anytime.
                </div>
                <input
                  value={saveEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSaveEmail(e.target.value)
                  }
                  placeholder="sarah@email.com"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: C.light,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: '12px',
                    fontSize: '15px',
                    color: C.navy,
                    outline: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={() => setDoneStep('saved')}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: C.sage,
                    border: 'none',
                    borderRadius: '14px',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Save + Email Me a Copy
                </button>
                <button
                  onClick={() => setDoneStep('saved')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: C.muted,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Skip for now
                </button>
              </div>
            )}

            {/* STEP 3: Saved → Share or Buy */}
            {doneStep === 'saved' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: C.sageLight,
                    textAlign: 'center',
                    fontSize: '13px',
                    color: C.sageDark,
                    fontWeight: '600',
                  }}
                >
                  Goals saved{saveEmail ? ` -- copy sent to ${saveEmail}` : ''}
                </div>

                <button
                  onClick={() => setDoneStep('share')}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: C.sage,
                    border: 'none',
                    borderRadius: '14px',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Share with Family
                </button>

                <button
                  onClick={() => setDoneStep('payment')}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'transparent',
                    border: `1.5px solid ${C.copper}`,
                    borderRadius: '14px',
                    color: C.copper,
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Make It Legal -- $199
                </button>

                <div
                  style={{
                    fontSize: '11px',
                    color: C.muted,
                    textAlign: 'center',
                    lineHeight: '1.6',
                    marginTop: '4px',
                  }}
                >
                  $199 generates a signed advance directive, healthcare proxy, and POLST from this
                  conversation. Reviewed by {company.medicalDirector.name}.
                </div>
              </div>
            )}

            {/* STEP 4: Share with family */}
            {doneStep === 'share' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: C.navy,
                    textAlign: 'center',
                  }}
                >
                  Share with family
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: C.muted,
                    textAlign: 'center',
                    lineHeight: '1.6',
                  }}
                >
                  Send Peggy's goals to siblings, the doctor, or anyone who needs to be on the same
                  page.
                </div>
                <input
                  value={shareEmails}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setShareEmails(e.target.value)
                  }
                  placeholder="brother@email.com, doctor@clinic.com"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: C.light,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: '12px',
                    fontSize: '15px',
                    color: C.navy,
                    outline: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={() => setDoneStep('saved')}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: C.sage,
                    border: 'none',
                    borderRadius: '14px',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Send Invite
                </button>
                <button
                  onClick={() => setDoneStep('saved')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: C.muted,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {'\u2190'} Back
                </button>
              </div>
            )}

            {/* STEP 5: Payment for legal docs */}
            {doneStep === 'payment' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    padding: '24px',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${C.navy}, #1a3a55)`,
                    textAlign: 'center',
                    color: 'white',
                  }}
                >
                  <div style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-2px' }}>
                    $199
                  </div>
                  <div style={{ fontSize: '13px', opacity: 0.7, marginTop: '4px' }}>
                    One-time -- Legal Document Bundle
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: C.text, lineHeight: '1.7' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '6px',
                    }}
                  >
                    <CheckIcon color={C.sage} size={14} /> Advance Directive (state-specific)
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '6px',
                    }}
                  >
                    <CheckIcon color={C.sage} size={14} /> Healthcare Power of Attorney
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '6px',
                    }}
                  >
                    <CheckIcon color={C.sage} size={14} /> POLST (signed by{' '}
                    {company.medicalDirector.name})
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '6px',
                    }}
                  >
                    <CheckIcon color={C.sage} size={14} /> Digital + printed copies
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckIcon color={C.sage} size={14} /> Shareable with any hospital via FHIR
                  </div>
                </div>

                <button
                  onClick={() => setDoneStep('complete')}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #6772e5, #5469d4)',
                    border: 'none',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(103, 114, 229, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  Pay $199 with Stripe
                </button>

                <button
                  onClick={() => setDoneStep('saved')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: C.muted,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {'\u2190'} Maybe later
                </button>
              </div>
            )}

            {/* STEP 6: Complete → co-op.care conversion */}
            {doneStep === 'complete' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: C.sageLight,
                    fontSize: '14px',
                    color: C.sageDark,
                    fontWeight: '600',
                  }}
                >
                  Legal documents are being generated
                </div>
                <div style={{ fontSize: '13px', color: C.muted, lineHeight: '1.6' }}>
                  {company.medicalDirector.name} will review and sign via ClinicalSwipe. You'll
                  receive the documents by email within 24 hours.
                </div>

                <div
                  style={{
                    marginTop: '8px',
                    padding: '20px',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${C.sageLight}, ${C.light})`,
                    border: `1.5px solid ${C.sage}40`,
                  }}
                >
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: C.navy,
                      marginBottom: '8px',
                    }}
                  >
                    Want a caregiver who knows these goals?
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: C.muted,
                      lineHeight: '1.6',
                      marginBottom: '14px',
                    }}
                  >
                    co-op.care delivers home care that honors Peggy's wishes -- because her goals
                    are already in the care plan. $59/month. Pays for itself in HSA/FSA savings.
                  </div>
                  <button
                    onClick={() => {
                      window.location.hash = '/app-preview';
                    }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      background: C.sage,
                      border: 'none',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    See co-op.care -- $59/month
                  </button>
                </div>
              </div>
            )}

            <div
              style={{
                marginTop: '16px',
                fontSize: '11px',
                color: C.muted,
                lineHeight: '1.6',
                textAlign: 'center',
              }}
            >
              {company.medicalDirector.name} reviews via ClinicalSwipe -- Redo anytime for free
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== CONVERSATION =====
  return (
    <div
      style={{
        background: '#e8e0d6',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link href={fontLinks.dmSans} rel="stylesheet" />
      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: '800', color: '#4a4a4a' }}>co-op.care</div>
        <div style={{ fontSize: '11px', color: '#888', maxWidth: '320px', lineHeight: '1.4' }}>
          $59/month · The app that comes with a caregiver and loads of pretax cost savings on
          healthcare and wellness including caregiving expenses
        </div>
      </div>
      <div
        style={{
          width: '390px',
          minHeight: '844px',
          background: C.bg,
          borderRadius: '40px',
          border: '3px solid #ddd',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            height: '50px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '0 24px 8px',
            fontSize: '13px',
            fontWeight: '600',
            color: C.text,
          }}
        >
          9:41
        </div>

        {/* Progress */}
        <div style={{ padding: '0 24px', marginBottom: '8px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}
          >
            <button
              onClick={() => (moduleIdx > 0 ? setModuleIdx(moduleIdx - 1) : setModuleIdx(-1))}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '14px',
                color: C.sage,
                fontWeight: '600',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {'\u2190'} Back
            </button>
            <span style={{ fontSize: '12px', color: C.muted, fontWeight: '500' }}>
              {moduleIdx + 1} of {MODULES.length}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '3px' }}>
            {MODULES.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: i < moduleIdx ? C.sage : i === moduleIdx ? `${C.sage}80` : '#ddd',
                  transition: 'all 0.4s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Celebration overlay */}
        {celebration && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `${C.sageLight}f0`,
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '40px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: C.sage,
                  margin: '0 auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L9 17L20 6"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: C.navy }}>
                {celebration}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div
          ref={scrollRef}
          style={{ padding: '16px 24px 120px', overflowY: 'auto', maxHeight: '680px' }}
        >
          {/* Question bubble */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#e8f0e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {SHIcons[MODULE_ICON_MAP[currentModule!.abbr] ?? '']?.(20) ?? <span />}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: C.sage,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {currentModule!.title}
              </div>
            </div>

            <div
              style={{
                background: C.card,
                borderRadius: '20px 20px 20px 4px',
                padding: '20px',
                border: `1px solid ${C.border}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: C.navy,
                  lineHeight: '1.3',
                  marginBottom: '6px',
                }}
              >
                {currentModule!.question}
              </div>
              <div style={{ fontSize: '13px', color: C.muted }}>{currentModule!.subtitle}</div>
            </div>
          </div>

          {/* Answer options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentModule!.options.map((option, i) => {
              const selected = currentSelections.includes(option);
              return (
                <div
                  key={i}
                  onClick={() => toggleOption(option)}
                  style={{
                    padding: '14px 16px',
                    background: selected ? C.sageLight : C.card,
                    border: `1.5px solid ${selected ? C.sage : C.border}`,
                    borderRadius: selected ? '4px 18px 18px 18px' : '18px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginLeft: selected ? '0px' : '0px',
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      minWidth: '22px',
                      borderRadius: '6px',
                      background: selected ? C.sage : 'transparent',
                      border: `2px solid ${selected ? C.sage : '#ccc'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    {selected && <CheckIcon color="white" size={12} />}
                  </div>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: selected ? '600' : '400',
                      color: selected ? C.navy : C.text,
                      lineHeight: '1.4',
                    }}
                  >
                    {option}
                  </div>
                </div>
              );
            })}

            {/* Custom answers already added */}
            {currentCustoms.map((custom, i) => (
              <div
                key={`custom-${i}`}
                style={{
                  padding: '14px 16px',
                  background: C.copperLight,
                  border: `1.5px solid ${C.copper}`,
                  borderRadius: '4px 18px 18px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    minWidth: '22px',
                    borderRadius: '6px',
                    background: C.copper,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckIcon color="white" size={12} />
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: C.navy }}>{custom}</div>
                <div
                  style={{
                    fontSize: '10px',
                    color: C.copper,
                    marginLeft: 'auto',
                    fontWeight: '600',
                  }}
                >
                  yours
                </div>
              </div>
            ))}

            {/* Add your own — type or speak */}
            {!showingCustom ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <div
                  onClick={() => setShowingCustom(true)}
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    background: 'transparent',
                    border: `1.5px dashed ${C.border}`,
                    borderRadius: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '6px',
                      border: `2px dashed ${C.copper}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      color: C.copper,
                    }}
                  >
                    +
                  </div>
                  <div style={{ fontSize: '15px', color: C.copper, fontWeight: '500' }}>
                    Add your own...
                  </div>
                </div>
                {hasSpeech && (
                  <button
                    onClick={startListening}
                    style={{
                      width: '52px',
                      minWidth: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: C.sage,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 16px ${C.sage}40`,
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="7" y="2" width="6" height="10" rx="3" fill="white" />
                      <path
                        d="M5 9c0 2.8 2.2 5 5 5s5-2.2 5-5"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <line
                        x1="10"
                        y1="14"
                        x2="10"
                        y2="18"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <line
                        x1="7"
                        y1="18"
                        x2="13"
                        y2="18"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <div
                style={{
                  padding: '14px 16px',
                  background: isListening ? `${C.sage}15` : C.copperLight,
                  border: `1.5px solid ${isListening ? C.sage : C.copper}`,
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <input
                  autoFocus
                  value={customText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCustomText(e.target.value)
                  }
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    e.key === 'Enter' && addCustom()
                  }
                  placeholder={isListening ? 'Listening...' : 'Type or tap the mic to speak...'}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    fontSize: '15px',
                    color: C.navy,
                    outline: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
                {hasSpeech && (
                  <button
                    onClick={isListening ? stopListening : startListening}
                    style={{
                      width: '36px',
                      minWidth: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isListening ? C.coral : C.sage,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: isListening ? 'pulse-mic 1.5s infinite' : 'none',
                    }}
                  >
                    {isListening ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="3" y="3" width="8" height="8" rx="1" fill="white" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <rect x="7" y="2" width="6" height="10" rx="3" fill="white" />
                        <path
                          d="M5 9c0 2.8 2.2 5 5 5s5-2.2 5-5"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <line
                          x1="10"
                          y1="14"
                          x2="10"
                          y2="18"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </button>
                )}
                <button
                  onClick={addCustom}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: C.copper,
                    border: 'none',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Selection count */}
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: C.muted }}>
            {currentSelections.length === 0
              ? 'Tap the ones that feel right'
              : `${currentSelections.length} selected`}
          </div>
        </div>

        {/* Bottom button */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px 24px 36px',
            background: `linear-gradient(transparent, ${C.bg} 30%)`,
            borderRadius: '0 0 37px 37px',
          }}
        >
          <button
            onClick={nextModule}
            disabled={currentSelections.length === 0}
            style={{
              width: '100%',
              padding: '18px',
              background: currentSelections.length > 0 ? C.sage : '#ccc',
              border: 'none',
              borderRadius: '16px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '700',
              cursor: currentSelections.length > 0 ? 'pointer' : 'default',
              boxShadow: currentSelections.length > 0 ? `0 4px 20px ${C.sage}40` : 'none',
              transition: 'all 0.3s',
            }}
          >
            {moduleIdx < MODULES.length - 1 ? `Next ${'\u2192'}` : 'Finish'}
          </button>
        </div>
        <style>{`
          @keyframes pulse-mic {
            0%, 100% { box-shadow: 0 0 0 0 rgba(212, 118, 106, 0.4); }
            50% { box-shadow: 0 0 0 10px rgba(212, 118, 106, 0); }
          }
        `}</style>
      </div>
    </div>
  );
}
