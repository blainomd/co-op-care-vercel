import { useState } from 'react';
import { careGoals, company, fontLinks } from './design-tokens';

interface Question {
  number: string;
  question: string;
  category: string;
  examples: string;
  color: string;
}

interface Offering {
  title: string;
  price: string;
  desc: string;
  icon: string;
  tag: string;
}

interface Objection {
  excuse: string;
  truth: string;
  color: string;
}

const THREE_QUESTIONS: Question[] = [
  {
    number: '01',
    question: 'What does a good day look like for you?',
    category: 'Daily Values',
    examples:
      'Morning coffee on the porch. A walk with the dog. Calling my sister. Watching the grandkids play.',
    color: '#7c956b',
  },
  {
    number: '02',
    question: "What would you want if you couldn't speak for yourself?",
    category: 'Medical Wishes',
    examples: 'Stay home if possible. No machines. Keep me comfortable. Let my daughter decide.',
    color: '#c4956a',
  },
  {
    number: '03',
    question: 'What do you want your grandchildren to know about you?',
    category: 'Legacy',
    examples:
      'How I met their grandfather. What I learned from my mother. Why I chose this life. What made me laugh.',
    color: '#8b7355',
  },
];

const OFFERINGS: Offering[] = [
  {
    title: 'Guided Conversation',
    price: '$149',
    desc: 'A structured, emotionally intelligent guide that helps your family talk about what matters. AI-facilitated, family-led. In person, video call, or solo reflection.',
    icon: 'CG',
    tag: 'Most families start here',
  },
  {
    title: 'Living Goals Document',
    price: 'Free with co-op.care',
    desc: 'Not a static form. A living record of what you value, what you want, and how you want to live \u2014 updated as life changes. Feeds directly into your care plan.',
    icon: 'LG',
    tag: 'Evolves with you',
  },
  {
    title: 'Video Legacy',
    price: '$99',
    desc: 'Record your stories, your messages, your voice. Short video moments preserved for your family \u2014 the things a document can never capture.',
    icon: 'VL',
    tag: 'Your voice, forever',
  },
  {
    title: 'Legal Document Bundle',
    price: '$199',
    desc: 'Advance directive, healthcare proxy, POLST \u2014 auto-generated from your conversation, state-specific, signed by our Medical Director. Legally binding. Stored securely.',
    icon: 'LD',
    tag: 'Peace of mind',
  },
];

const OBJECTIONS: Objection[] = [
  {
    excuse: "We'll do it later.",
    truth:
      '75% of families never have the conversation. Later usually means never \u2014 or it means a crisis forced the conversation in an ER waiting room.',
    color: '#c4956a',
  },
  {
    excuse: "It's too morbid.",
    truth:
      "CareGoals isn't about dying. It's about how you want to LIVE. What makes you happy. What you value. What you want to protect. That's not morbid \u2014 it's brave.",
    color: '#7c956b',
  },
  {
    excuse: "We don't know how to start.",
    truth:
      "Neither did anyone else. The Conversation Guide does the hard part. It asks the right questions in the right order so your family doesn't have to figure it out alone.",
    color: '#8b7355',
  },
  {
    excuse: "We'll figure it out when we need to.",
    truth:
      "When you 'need to' is the worst possible time. Your mom is sedated. Your siblings disagree. Nobody knows what she wanted. CareGoals prevents that day.",
    color: '#6b7c95',
  },
];

export function CareGoalsHome() {
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [email, setEmail] = useState('');

  const C = careGoals;

  return (
    <div
      style={{
        background: C.cream,
        color: C.text,
        fontFamily: "'Lora', 'Georgia', serif",
        minHeight: '100vh',
      }}
    >
      <link href={fontLinks.lora} rel="stylesheet" />
      <link href={fontLinks.dmSans} rel="stylesheet" />

      {/* NAV */}
      <nav
        style={{
          padding: '20px 32px',
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.sage}, ${C.sageDark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '700',
              color: C.cream,
            }}
          >
            CG
          </div>
          <span
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: C.charcoal,
              letterSpacing: '-0.5px',
            }}
          >
            CareGoals
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '28px',
            alignItems: 'center',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <a
            href="#conversation"
            style={{ color: C.muted, textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}
          >
            The Conversation
          </a>
          <a
            href="#offerings"
            style={{ color: C.muted, textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}
          >
            What You Get
          </a>
          <a
            href="#why"
            style={{ color: C.muted, textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}
          >
            Why Now
          </a>
          <button
            style={{
              padding: '10px 24px',
              borderRadius: '24px',
              background: C.sage,
              border: 'none',
              color: C.cream,
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
            onClick={() => {
              window.location.href = window.location.pathname + '#/caregoals-conversation';
            }}
          >
            Start the Conversation
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '80px 32px 60px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '6px 18px',
            borderRadius: '20px',
            background: `${C.sage}12`,
            border: `1px solid ${C.sage}30`,
            fontSize: '12px',
            fontWeight: '500',
            color: C.sage,
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: '28px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          Aging with intention
        </div>

        <h1
          style={{
            fontSize: 'clamp(36px, 5.5vw, 64px)',
            fontWeight: '600',
            lineHeight: '1.15',
            letterSpacing: '-1.5px',
            color: C.charcoal,
            marginBottom: '20px',
            maxWidth: '700px',
            margin: '0 auto 20px',
          }}
        >
          The conversation your family needs to have.
        </h1>

        <p
          style={{
            fontSize: '18px',
            lineHeight: '1.8',
            color: C.muted,
            maxWidth: '540px',
            margin: '0 auto 40px',
          }}
        >
          CareGoals helps families talk about what matters — how you want to live, what you want
          preserved, and who speaks for you when you can't.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button
            style={{
              padding: '16px 36px',
              borderRadius: '28px',
              background: C.sage,
              border: 'none',
              color: C.cream,
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: `0 4px 20px ${C.sage}30`,
            }}
            onClick={() => {
              window.location.href = window.location.pathname + '#/caregoals-conversation';
            }}
          >
            Start the Conversation
          </button>
          <button
            style={{
              padding: '16px 36px',
              borderRadius: '28px',
              background: 'transparent',
              border: `1.5px solid ${C.border}`,
              color: C.text,
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
            onClick={() => {
              document.getElementById('conversation')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            It's Easier Than You Think
          </button>
        </div>

        <div
          style={{
            marginTop: '48px',
            fontSize: '14px',
            color: C.muted,
            fontFamily: "'DM Sans', sans-serif",
            fontStyle: 'italic',
          }}
        >
          "I didn't want to have this conversation. Now I can't imagine not having had it."
          <div style={{ fontSize: '12px', marginTop: '6px', fontStyle: 'normal', color: C.earth }}>
            — Sarah, 52, caring for her mother in Boulder
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div style={{ maxWidth: '100px', margin: '0 auto', height: '1px', background: C.border }} />

      {/* THREE QUESTIONS */}
      <section
        id="conversation"
        style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: '600',
              color: C.charcoal,
              letterSpacing: '-1px',
              marginBottom: '12px',
            }}
          >
            Every family needs to answer three questions
          </h2>
          <p style={{ fontSize: '16px', color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>
            Before a crisis forces them to guess.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {THREE_QUESTIONS.map((q, i) => (
            <div
              key={i}
              onClick={() => setExpandedQ(expandedQ === i ? null : i)}
              style={{
                padding: expandedQ === i ? '36px 40px' : '28px 40px',
                background: C.card,
                borderRadius: '20px',
                border: `1px solid ${expandedQ === i ? q.color + '40' : C.border}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow:
                  expandedQ === i ? `0 8px 32px rgba(0,0,0,0.06)` : '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                <div
                  style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    color: q.color,
                    opacity: 0.3,
                    lineHeight: '1',
                    minWidth: '48px',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {q.number}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '22px',
                      fontWeight: '600',
                      color: C.charcoal,
                      lineHeight: '1.3',
                      marginBottom: expandedQ === i ? '12px' : '4px',
                    }}
                  >
                    {q.question}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: q.color,
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {q.category}
                  </div>
                  {expandedQ === i && (
                    <div
                      style={{
                        marginTop: '16px',
                        padding: '20px',
                        background: C.warmWhite,
                        borderRadius: '12px',
                        fontSize: '15px',
                        color: C.text,
                        lineHeight: '1.8',
                        fontStyle: 'italic',
                      }}
                    >
                      "{q.examples}"
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    color: C.muted,
                    transform: expandedQ === i ? 'rotate(45deg)' : 'none',
                    transition: 'transform 0.3s',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  +
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OFFERINGS */}
      <section
        id="offerings"
        style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: '600',
              color: C.charcoal,
              letterSpacing: '-1px',
              marginBottom: '12px',
            }}
          >
            What you get
          </h2>
          <p style={{ fontSize: '16px', color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>
            From the first conversation to a legal, living plan — all in one place.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {OFFERINGS.map((o, i) => (
            <div
              key={i}
              style={{
                padding: '36px',
                background: C.card,
                borderRadius: '20px',
                border: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, ${C.sage}20, ${C.sageDark}20)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: C.sage,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {o.icon}
                </div>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: `${C.sage}10`,
                    border: `1px solid ${C.sage}20`,
                    fontSize: '11px',
                    fontWeight: '600',
                    color: C.sage,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {o.tag}
                </span>
              </div>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: C.charcoal,
                  marginBottom: '4px',
                }}
              >
                {o.title}
              </h3>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: C.copper,
                  marginBottom: '12px',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {o.price}
              </div>
              <p
                style={{
                  fontSize: '14px',
                  color: C.muted,
                  lineHeight: '1.7',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {o.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY NOW */}
      <section id="why" style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: '600',
              color: C.charcoal,
              letterSpacing: '-1px',
              marginBottom: '12px',
            }}
          >
            Why families wait
          </h2>
          <p style={{ fontSize: '16px', color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>
            And why they wish they hadn't.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {OBJECTIONS.map((o, i) => (
            <div
              key={i}
              style={{
                padding: '32px 40px',
                background: C.card,
                borderRadius: '20px',
                border: `1px solid ${C.border}`,
                display: 'flex',
                gap: '32px',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ minWidth: '200px' }}>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: o.color,
                    fontStyle: 'italic',
                    lineHeight: '1.4',
                  }}
                >
                  "{o.excuse}"
                </div>
              </div>
              <div
                style={{
                  fontSize: '15px',
                  color: C.text,
                  lineHeight: '1.7',
                  fontFamily: "'DM Sans', sans-serif",
                  borderLeft: `2px solid ${o.color}30`,
                  paddingLeft: '24px',
                }}
              >
                {o.truth}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONNECTION TO CARE */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 32px' }}>
        <div
          style={{
            padding: '48px',
            background: `linear-gradient(135deg, ${C.sage}08, ${C.earth}08)`,
            borderRadius: '24px',
            border: `1px solid ${C.sage}20`,
            textAlign: 'center',
          }}
        >
          <h3
            style={{
              fontSize: '24px',
              fontWeight: '600',
              color: C.charcoal,
              marginBottom: '12px',
              letterSpacing: '-0.5px',
            }}
          >
            CareGoals isn't just planning. It's the beginning of a care relationship.
          </h3>
          <p
            style={{
              fontSize: '15px',
              color: C.muted,
              lineHeight: '1.8',
              maxWidth: '560px',
              margin: '0 auto 28px',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            When you're ready for help at home, co-op.care delivers care that honors your goals —
            because your goals are already in the care plan. Not in a filing cabinet. Not on a
            fridge. In the hands of the people caring for you.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
            {(
              [
                { label: 'Your wishes', arrow: '\u2192' },
                { label: 'Your care plan', arrow: '\u2192' },
                { label: 'Your care team', arrow: '' },
              ] as const
            ).map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <div
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    fontSize: '14px',
                    fontWeight: '600',
                    color: C.charcoal,
                  }}
                >
                  {item.label}
                </div>
                {item.arrow && (
                  <span style={{ color: C.sage, fontSize: '18px', fontWeight: '700' }}>
                    {item.arrow}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: '24px',
              fontSize: '12px',
              color: C.muted,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Powered by co-op.care -- Worker-owned home care -- Boulder, Colorado
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}
      >
        <h2
          style={{
            fontSize: '36px',
            fontWeight: '600',
            color: C.charcoal,
            letterSpacing: '-1px',
            marginBottom: '12px',
          }}
        >
          You already know you should do this.
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: C.muted,
            marginBottom: '36px',
            fontFamily: "'DM Sans', sans-serif",
            maxWidth: '460px',
            margin: '0 auto 36px',
          }}
        >
          The only thing harder than having the conversation is wishing you had.
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            maxWidth: '460px',
            margin: '0 auto',
          }}
        >
          <input
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="Your email"
            style={{
              flex: 1,
              padding: '16px 20px',
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: '24px',
              color: C.charcoal,
              fontSize: '15px',
              outline: 'none',
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          <button
            style={{
              padding: '16px 32px',
              borderRadius: '24px',
              background: C.sage,
              border: 'none',
              color: C.cream,
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: `0 4px 16px ${C.sage}30`,
              whiteSpace: 'nowrap',
            }}
            onClick={() => {
              window.location.href = window.location.pathname + '#/caregoals-conversation';
            }}
          >
            Start Planning
          </button>
        </div>
        <div
          style={{
            fontSize: '12px',
            color: C.muted,
            marginTop: '16px',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Free to explore -- Guided Conversation $149 -- No pressure, no forms until you're ready
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: '40px 32px',
          maxWidth: '1100px',
          margin: '0 auto',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: C.sage,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '700',
                  color: C.cream,
                }}
              >
                CG
              </div>
              <span style={{ fontSize: '15px', fontWeight: '600', color: C.charcoal }}>
                CareGoals
              </span>
              <span style={{ fontSize: '12px', color: C.muted }}>-- Aging with intention</span>
            </div>
            <div style={{ fontSize: '12px', color: C.muted, lineHeight: '1.8' }}>
              {company.name} -- Boulder, Colorado
              <br />
              hello@caregoals.com -- {company.phone}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: C.muted, lineHeight: '1.8' }}>
              Medical Director: {company.medicalDirector.name}
              <br />
              NPI {company.medicalDirector.npi} -- {company.medicalDirector.affiliation}
            </div>
            <div
              style={{
                marginTop: '12px',
                display: 'flex',
                gap: '16px',
                justifyContent: 'flex-end',
                fontSize: '12px',
              }}
            >
              <span style={{ color: C.muted }}>co-op.care</span>
              <span style={{ color: C.muted }}>SurgeonAccess</span>
              <span style={{ color: C.muted }}>ClinicalSwipe</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        button { transition: all 0.2s ease; }
        button:hover { transform: translateY(-1px); }
        a:hover { color: #7c956b !important; }
      `}</style>
    </div>
  );
}
