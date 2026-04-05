import { useState, useEffect } from 'react';

const STATS = [
  { value: '$12–$400', label: 'Per Review' },
  { value: '2 min', label: 'Avg Review Time' },
  { value: '8', label: 'Specialties' },
  { value: '50', label: 'State Coverage' },
];

const REVIEW_TYPES = [
  {
    title: 'ClinicalSwipe',
    desc: 'Swipe-based review of AI-generated clinical outputs. Accept, modify, or reject in under 2 minutes.',
    rate: '$12–$18/review',
    time: '~2 min',
    icon: '⚡',
  },
  {
    title: 'LMN Generation',
    desc: 'Review and sign Letters of Medical Necessity for HSA/FSA eligible community wellness services.',
    rate: '$35–$50/LMN',
    time: '~5 min',
    icon: '📋',
  },
  {
    title: 'Peer Case Review',
    desc: 'Detailed surgical and treatment plan peer review across MSK specialties.',
    rate: '$75–$150/case',
    time: '~15 min',
    icon: '🔬',
  },
  {
    title: 'AI Safety Evaluation',
    desc: 'Clinical AI output evaluation embedded in engineering workflows at healthcare AI companies.',
    rate: '$200–$400/session',
    time: '~60 min',
    icon: '🛡️',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Apply',
    desc: 'Verify your NPI, select your specialties and review types. Takes 5 minutes.',
  },
  {
    step: '02',
    title: 'Get Matched',
    desc: 'Our algorithm routes cases matching your subspecialty and availability.',
  },
  {
    step: '03',
    title: 'Review',
    desc: 'Accept or decline cases. Review on your phone, tablet, or desktop.',
  },
  {
    step: '04',
    title: 'Get Paid',
    desc: 'Weekly payouts via Stripe. Track earnings in real time.',
  },
];

const SPECIALTIES = [
  'Spine',
  'Sports Medicine',
  'Joint Replacement',
  'Hand & Upper Extremity',
  'Foot & Ankle',
  'Trauma',
  'Pain Management',
  'Physical Medicine & Rehab',
];

export default function SurgeonAccessHome() {
  const [scrolled, setScrolled] = useState(false);
  const [activeReview, setActiveReview] = useState(0);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const C = {
    teal: '#2dd4a8',
    navy: '#0a1628',
    dark: '#0f2035',
    mid: '#132a3e',
    accent: '#f4a261',
    coral: '#e76f51',
    text: '#e8edf2',
    muted: '#6a9aaa',
    dimmed: '#3a5a6a',
    card: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.06)',
  };

  return (
    <div
      style={{
        background: C.navy,
        color: C.text,
        fontFamily: "'DM Sans', sans-serif",
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap"
        rel="stylesheet"
      />

      {/* NAV */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '16px 32px',
          background: scrolled ? `${C.navy}ee` : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? `1px solid ${C.border}` : 'none',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${C.teal}, #1a9e7a)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '800',
              color: C.navy,
              boxShadow: `0 4px 16px ${C.teal}40`,
            }}
          >
            SA
          </div>
          <span style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px' }}>
            SurgeonAccess
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <a
            href="#reviews"
            style={{ color: C.muted, textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}
          >
            Reviews
          </a>
          <a
            href="#how"
            style={{ color: C.muted, textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}
          >
            How It Works
          </a>
          <a
            href="#specialties"
            style={{ color: C.muted, textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}
          >
            Specialties
          </a>
          <button
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${C.teal}, #1a9e7a)`,
              border: 'none',
              color: C.navy,
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: `0 4px 16px ${C.teal}30`,
            }}
          >
            Apply Now
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 32px 60px',
          position: 'relative',
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-200px',
            width: '600px',
            height: '600px',
            background: `radial-gradient(circle, ${C.teal}08 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            background: `${C.teal}10`,
            border: `1px solid ${C.teal}30`,
            marginBottom: '24px',
            fontSize: '12px',
            fontWeight: '600',
            color: C.teal,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: C.teal,
              animation: 'pulse 2s infinite',
            }}
          />
          Now accepting surgeons in all 50 states
        </div>

        <h1
          style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: '800',
            lineHeight: '1.05',
            letterSpacing: '-2px',
            marginBottom: '20px',
            maxWidth: '800px',
          }}
        >
          Your expertise. <span style={{ color: C.teal }}>Your schedule.</span> <br />A new revenue
          stream.
        </h1>
        <p
          style={{
            fontSize: '18px',
            lineHeight: '1.7',
            color: C.muted,
            maxWidth: '560px',
            marginBottom: '40px',
          }}
        >
          Get paid to review AI-generated clinical outputs, sign Letters of Medical Necessity, and
          evaluate healthcare AI — all under your medical license, whenever you want.
        </p>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            style={{
              padding: '18px 36px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${C.teal}, #1a9e7a)`,
              border: 'none',
              color: C.navy,
              fontWeight: '800',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: `0 6px 24px ${C.teal}40`,
              transition: 'transform 0.2s',
            }}
          >
            Start Earning Today
          </button>
          <span style={{ color: C.dimmed, fontSize: '14px' }}>5 minute application</span>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            marginTop: '64px',
            background: C.border,
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {STATS.map((stat, i) => (
            <div
              key={i}
              style={{
                padding: '28px 24px',
                background: C.dark,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: C.teal,
                  letterSpacing: '-1px',
                }}
              >
                {stat.value}
              </div>
              <div
                style={{ fontSize: '12px', color: C.muted, marginTop: '4px', fontWeight: '500' }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEW TYPES */}
      <section
        id="reviews"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 32px',
        }}
      >
        <div style={{ marginBottom: '48px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: C.teal,
              textTransform: 'uppercase',
              letterSpacing: '3px',
              marginBottom: '12px',
            }}
          >
            Revenue Streams
          </div>
          <h2
            style={{
              fontSize: '40px',
              fontWeight: '800',
              letterSpacing: '-1.5px',
              lineHeight: '1.1',
            }}
          >
            Four ways to earn
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {REVIEW_TYPES.map((r, i) => (
            <div
              key={i}
              style={{
                padding: '32px',
                background: activeReview === i ? `${C.teal}08` : C.card,
                border: `1px solid ${activeReview === i ? `${C.teal}40` : C.border}`,
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={() => setActiveReview(i)}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontSize: '32px' }}>{r.icon}</div>
                <div
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: `${C.teal}15`,
                    fontSize: '16px',
                    fontWeight: '800',
                    color: C.teal,
                  }}
                >
                  {r.rate}
                </div>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                {r.title}
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: C.muted,
                  lineHeight: '1.6',
                  marginBottom: '12px',
                }}
              >
                {r.desc}
              </p>
              <div style={{ fontSize: '12px', color: C.dimmed }}>Avg time: {r.time}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 32px',
        }}
      >
        <div style={{ marginBottom: '48px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: C.accent,
              textTransform: 'uppercase',
              letterSpacing: '3px',
              marginBottom: '12px',
            }}
          >
            Process
          </div>
          <h2 style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-1.5px' }}>
            How it works
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {HOW_IT_WORKS.map((item, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div
                style={{
                  fontSize: '64px',
                  fontWeight: '900',
                  color: `${C.teal}10`,
                  position: 'absolute',
                  top: '-10px',
                  left: '-4px',
                  lineHeight: '1',
                  letterSpacing: '-4px',
                }}
              >
                {item.step}
              </div>
              <div style={{ position: 'relative', paddingTop: '48px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', color: C.muted, lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SPECIALTIES */}
      <section
        id="specialties"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 32px',
        }}
      >
        <div style={{ marginBottom: '48px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: C.coral,
              textTransform: 'uppercase',
              letterSpacing: '3px',
              marginBottom: '12px',
            }}
          >
            MSK Expertise
          </div>
          <h2 style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-1.5px' }}>
            Built for your specialty
          </h2>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {SPECIALTIES.map((spec, i) => (
            <div
              key={i}
              style={{
                padding: '14px 24px',
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '500',
                color: C.text,
                transition: 'all 0.2s',
              }}
            >
              {spec}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: '48px',
            padding: '40px',
            background: `linear-gradient(135deg, ${C.dark}, ${C.mid})`,
            borderRadius: '24px',
            border: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '40px',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '24px',
                fontWeight: '800',
                marginBottom: '8px',
                letterSpacing: '-0.5px',
              }}
            >
              Powered by ClinicalSwipe
            </h3>
            <p style={{ fontSize: '15px', color: C.muted, lineHeight: '1.6', maxWidth: '480px' }}>
              Our physician review marketplace connects your expertise to healthcare AI companies
              that need qualified professional oversight. Every AI output reviewed. Every
              recommendation validated. Every patient protected.
            </p>
          </div>
          <div
            style={{
              padding: '20px 28px',
              background: `${C.teal}10`,
              borderRadius: '16px',
              border: `1px solid ${C.teal}20`,
              textAlign: 'center',
              minWidth: '160px',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: C.teal,
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Medical Director
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '8px' }}>
              Josh Emdur DO
            </div>
            <div style={{ fontSize: '12px', color: C.muted }}>50-state licensed</div>
            <div style={{ fontSize: '11px', color: C.dimmed, marginTop: '4px' }}>
              NPI 1649218389
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 32px 120px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: '48px',
            fontWeight: '800',
            letterSpacing: '-2px',
            marginBottom: '16px',
          }}
        >
          Ready to earn on <span style={{ color: C.teal }}>your terms</span>?
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: C.muted,
            marginBottom: '36px',
            maxWidth: '480px',
            margin: '0 auto 36px',
          }}
        >
          Join SurgeonAccess and add a revenue stream that values your clinical expertise without
          disrupting your practice.
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            maxWidth: '480px',
            margin: '0 auto',
          }}
        >
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{
              flex: 1,
              padding: '16px 20px',
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '15px',
              outline: 'none',
            }}
          />
          <button
            style={{
              padding: '16px 32px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${C.teal}, #1a9e7a)`,
              border: 'none',
              color: C.navy,
              fontWeight: '800',
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: `0 6px 24px ${C.teal}30`,
              whiteSpace: 'nowrap',
            }}
          >
            Apply Now
          </button>
        </div>
        <div style={{ fontSize: '12px', color: C.dimmed, marginTop: '16px' }}>
          Takes 5 minutes · No commitment · Start reviewing this week
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: '40px 32px',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${C.teal}, #1a9e7a)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: '800',
              color: C.navy,
            }}
          >
            SA
          </div>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>SurgeonAccess</span>
          <span style={{ fontSize: '12px', color: C.dimmed }}>· Solving Health Inc.</span>
        </div>
        <div style={{ fontSize: '12px', color: C.dimmed }}>
          surgeons@surgeonaccess.com · 484-684-5287 · Boulder, CO
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        a:hover { color: #2dd4a8 !important; }
        button:hover { transform: translateY(-1px); }
      `}</style>
    </div>
  );
}
