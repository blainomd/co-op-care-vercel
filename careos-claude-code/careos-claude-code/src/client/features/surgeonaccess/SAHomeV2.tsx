import { useState, useEffect } from 'react';

const PAIN_POINTS = [
  {
    problem: '2 hours of documentation for every 1 hour of patient care',
    solution: 'Ambient AI captures the encounter. You review and sign. Done.',
    metric: '87% less documentation time',
  },
  {
    problem: "PROMs collection is manual, inconsistent, and patients don't complete them",
    solution: 'Automated PROM delivery via SMS/portal. Scored instantly. Trended over time.',
    metric: '94% completion rate',
  },
  {
    problem: "Value-based contracts require data you don't have infrastructure to collect",
    solution: 'FHIR-native platform captures every outcome measure CMS and payers require.',
    metric: 'ACCESS Model ready, day one',
  },
  {
    problem: 'Prior auths take 45 minutes and 3 phone calls per case',
    solution: 'AI drafts the auth with clinical evidence attached. You approve in one tap.',
    metric: '8 minutes avg, zero calls',
  },
];

const PLATFORM_FEATURES = [
  {
    title: 'Ambient Clinical Documentation',
    desc: 'AI listens to your patient encounter and generates the note. You review, edit, sign. Ortho-specific templates for every visit type — new patient, post-op, injection, DME.',
    icon: '🎙️',
    tag: 'Save 2hrs/day',
  },
  {
    title: 'Automated PROMs Pipeline',
    desc: 'PROMIS PF/PI, ODI, NDI, QuickDASH, KOOS JR, HOOS JR, NRS, PGIC — all validated instruments, delivered to patients automatically, scored in real time, trended across episodes.',
    icon: '📊',
    tag: '94% completion',
  },
  {
    title: 'AI-Assisted Care Plans',
    desc: 'Generate evidence-based treatment plans from the encounter. PT protocols, injection schedules, surgical workup pathways — all customizable, all under your oversight.',
    icon: '🧠',
    tag: 'Your clinical judgment, amplified',
  },
  {
    title: 'Letters of Medical Necessity',
    desc: "Auto-generate LMNs for DME, PT, imaging, and community wellness services. ICD-10 coded. Payer-ready. Make your patients' wellness activities HSA/FSA eligible.",
    icon: '📋',
    tag: 'HSA/FSA unlock',
  },
  {
    title: 'Value-Based Payment Engine',
    desc: 'Built for CMS ACCESS Model, BPCI-A, CJR, and commercial value-based contracts. Track OAP measures, manage care periods, submit G-codes — all from one dashboard.',
    icon: '💰',
    tag: 'ACCESS Model native',
  },
  {
    title: 'Prior Auth Automation',
    desc: 'AI drafts authorization requests with supporting clinical documentation pulled from the encounter. Attach imaging, labs, failed conservative treatment — one tap to submit.',
    icon: '⚡',
    tag: '8 min avg',
  },
];

const ORTHO_WORKFLOW = [
  {
    step: '01',
    title: 'Patient Walks In',
    desc: 'PROMs already collected via SMS before arrival. Scores visible on your dashboard. You know their pain, function, and trajectory before you enter the room.',
  },
  {
    step: '02',
    title: 'See the Patient',
    desc: 'Ambient AI captures the encounter. Ortho-specific terminology, exam findings, assessment — documented in real time. You focus on the patient, not the keyboard.',
  },
  {
    step: '03',
    title: 'Review & Sign',
    desc: 'AI generates the note, care plan, and any needed orders. You review on your phone or desktop. Edit anything. Sign in 30 seconds. Move to the next patient.',
  },
  {
    step: '04',
    title: 'Get Paid',
    desc: 'CPT codes suggested. Prior auths drafted. Value-based measures captured. ACCESS Model G-codes submitted. Your revenue cycle starts before the patient leaves.',
  },
];

const ACCESS_TRACK = {
  title: 'CMS ACCESS Model — MSK Track',
  payment: '$180/beneficiary/year',
  desc: 'Outcome-Aligned Payments for chronic musculoskeletal pain. Technology-enabled care with physician oversight. 10-year CMS program launching July 2026.',
  measures: [
    { name: 'PROMIS Physical Function', target: '2-point T-score increase' },
    { name: 'PROMIS Pain Interference', target: '2-point T-score reduction' },
    { name: 'Pain Intensity (NRS)', target: 'No more than 2-point increase' },
    {
      name: 'Site-Specific PROM',
      target: 'ODI 8pt / NDI 8pt / QuickDASH 10pt / KOOS 10pt / HOOS 10pt',
    },
  ],
  threshold: '50% of patients meet targets = full payment',
};

const TESTIMONIAL_SCENARIOS = [
  {
    role: 'Sports Medicine Surgeon',
    location: 'Boulder, CO',
    quote:
      'I was spending Sunday nights doing charts. Now my notes are done before I leave the office. The PROMs data actually shows me which patients are improving and which need intervention — before they tell me.',
  },
  {
    role: 'Spine Surgeon',
    location: 'Denver, CO',
    quote:
      "The ACCESS Model payment is real money for work I'm already doing. SurgeonAccess just handles the data submission. I don't think about G-codes or OAP measures — the platform does it.",
  },
  {
    role: 'Hand & Upper Extremity',
    location: 'Aspen, CO',
    quote:
      'Prior auths used to be the worst part of my week. Now the AI drafts them with all the clinical evidence attached. My staff approves and submits. I never touch them.',
  },
];

export default function SurgeonAccessHome() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const C = {
    navy: '#0a1628',
    dark: '#0e1f33',
    mid: '#132a3e',
    teal: '#2dd4a8',
    tealDark: '#1a9e7a',
    gold: '#f4a261',
    coral: '#e76f51',
    text: '#e8edf2',
    muted: '#7a9aaa',
    dim: '#3a5a6a',
    card: 'rgba(255,255,255,0.025)',
    border: 'rgba(255,255,255,0.06)',
    glow: 'rgba(45, 212, 168, 0.08)',
  };

  return (
    <div
      style={{
        background: C.navy,
        color: C.text,
        fontFamily: "'DM Sans', sans-serif",
        minHeight: '100vh',
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      {/* NAV */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: scrollY > 50 ? `${C.navy}f0` : 'transparent',
          backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
          borderBottom: scrollY > 50 ? `1px solid ${C.border}` : 'none',
          transition: 'all 0.3s',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '16px 32px',
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
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '900',
                color: C.navy,
                boxShadow: `0 4px 16px ${C.teal}40`,
              }}
            >
              SA
            </div>
            <div>
              <div
                style={{
                  fontSize: '17px',
                  fontWeight: '700',
                  letterSpacing: '-0.5px',
                  lineHeight: '1.2',
                }}
              >
                SurgeonAccess
              </div>
              <div
                style={{
                  fontSize: '9px',
                  color: C.dim,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}
              >
                Orthopedic Intelligence Platform
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
            <a
              href="#platform"
              style={{
                color: C.muted,
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '500',
              }}
            >
              Platform
            </a>
            <a
              href="#workflow"
              style={{
                color: C.muted,
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '500',
              }}
            >
              Workflow
            </a>
            <a
              href="#access"
              style={{
                color: C.muted,
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '500',
              }}
            >
              ACCESS Model
            </a>
            <a
              href="#start"
              style={{
                color: C.muted,
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '500',
              }}
            >
              Pricing
            </a>
            <button
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
                border: 'none',
                color: C.navy,
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: `0 4px 12px ${C.teal}30`,
              }}
            >
              Get Early Access
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '100px 32px 60px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-150px',
            width: '500px',
            height: '500px',
            background: `radial-gradient(circle, ${C.teal}06 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px 6px 8px',
            borderRadius: '20px',
            background: `${C.gold}10`,
            border: `1px solid ${C.gold}30`,
            marginBottom: '28px',
            fontSize: '12px',
            fontWeight: '600',
            color: C.gold,
          }}
        >
          🦴 Built exclusively for orthopedic surgery
        </div>

        <h1
          style={{
            fontSize: 'clamp(42px, 6vw, 68px)',
            fontWeight: '900',
            lineHeight: '1.05',
            letterSpacing: '-2.5px',
            marginBottom: '20px',
            maxWidth: '780px',
          }}
        >
          Treat your patients.
          <br />
          <span style={{ color: C.teal }}>Not your paperwork.</span>
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
          The AI-powered practice platform that handles documentation, PROMs, prior auths, and
          value-based compliance — so you can focus on what you trained to do.
        </p>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '64px' }}>
          <button
            style={{
              padding: '18px 36px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
              border: 'none',
              color: C.navy,
              fontWeight: '800',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: `0 6px 24px ${C.teal}40`,
            }}
          >
            Request Early Access
          </button>
          <button
            style={{
              padding: '18px 36px',
              borderRadius: '14px',
              background: 'transparent',
              border: `1px solid ${C.border}`,
              color: C.text,
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            See It In Action →
          </button>
        </div>

        {/* Pain points ticker */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            background: C.border,
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {PAIN_POINTS.map((p, i) => (
            <div key={i} style={{ padding: '24px 20px', background: C.dark }}>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: '900',
                  color: C.teal,
                  letterSpacing: '-0.5px',
                  marginBottom: '6px',
                }}
              >
                {p.metric}
              </div>
              <div style={{ fontSize: '12px', color: C.muted, lineHeight: '1.5' }}>
                {p.solution.split('.')[0]}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* THE PROBLEM */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 32px' }}>
        <div
          style={{
            padding: '48px',
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${C.dark}, ${C.mid})`,
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: C.coral,
              textTransform: 'uppercase',
              letterSpacing: '3px',
              marginBottom: '12px',
            }}
          >
            The Reality
          </div>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: '800',
              letterSpacing: '-1px',
              marginBottom: '24px',
              maxWidth: '600px',
            }}
          >
            Your training prepared you to operate. Not to be a data entry clerk.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {PAIN_POINTS.map((p, i) => (
              <div
                key={i}
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  background: 'rgba(0,0,0,0.2)',
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    color: C.coral,
                    fontWeight: '600',
                    marginBottom: '8px',
                    lineHeight: '1.5',
                  }}
                >
                  {p.problem}
                </div>
                <div style={{ fontSize: '14px', color: C.teal, lineHeight: '1.5' }}>
                  → {p.solution}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM FEATURES */}
      <section id="platform" style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ marginBottom: '48px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: C.teal,
              textTransform: 'uppercase',
              letterSpacing: '3px',
              marginBottom: '12px',
            }}
          >
            The Platform
          </div>
          <h2 style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-1.5px' }}>
            Six capabilities. One dashboard.
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: C.muted,
              marginTop: '8px',
              maxWidth: '520px',
              lineHeight: '1.6',
            }}
          >
            Everything an orthopedic practice needs to deliver AI-assisted, outcome-tracked,
            value-based care — without hiring a single new staff member.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {PLATFORM_FEATURES.map((f, i) => (
            <div
              key={i}
              onMouseEnter={() => setActiveFeature(i)}
              style={{
                padding: '28px',
                background: activeFeature === i ? C.glow : C.card,
                border: `1px solid ${activeFeature === i ? `${C.teal}30` : C.border}`,
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
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
                <div style={{ fontSize: '28px' }}>{f.icon}</div>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: `${C.teal}12`,
                    fontSize: '10px',
                    fontWeight: '700',
                    color: C.teal,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {f.tag}
                </span>
              </div>
              <h3
                style={{
                  fontSize: '17px',
                  fontWeight: '700',
                  marginBottom: '8px',
                  lineHeight: '1.3',
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: '13px', color: C.muted, lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WORKFLOW */}
      <section id="workflow" style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ marginBottom: '48px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: C.gold,
              textTransform: 'uppercase',
              letterSpacing: '3px',
              marginBottom: '12px',
            }}
          >
            Your Day, Reimagined
          </div>
          <h2 style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-1.5px' }}>
            From patient to payment in four steps
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {ORTHO_WORKFLOW.map((item, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div
                style={{
                  fontSize: '72px',
                  fontWeight: '900',
                  color: `${C.teal}08`,
                  position: 'absolute',
                  top: '-16px',
                  left: '-4px',
                  lineHeight: '1',
                  letterSpacing: '-4px',
                }}
              >
                {item.step}
              </div>
              <div style={{ position: 'relative', paddingTop: '52px' }}>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    marginBottom: '10px',
                    color: C.text,
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', color: C.muted, lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ACCESS MODEL */}
      <section id="access" style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 32px' }}>
        <div
          style={{
            padding: '48px',
            background: `linear-gradient(135deg, ${C.dark}, ${C.mid})`,
            borderRadius: '24px',
            border: `1px solid ${C.teal}20`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '300px',
              height: '300px',
              background: `radial-gradient(circle, ${C.teal}08 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: `${C.teal}12`,
                marginBottom: '20px',
                fontSize: '11px',
                fontWeight: '700',
                color: C.teal,
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              CMS Innovation Center · 10-Year Program
            </div>

            <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    fontSize: '32px',
                    fontWeight: '800',
                    letterSpacing: '-1px',
                    marginBottom: '12px',
                  }}
                >
                  {ACCESS_TRACK.title}
                </h2>
                <p
                  style={{
                    fontSize: '15px',
                    color: C.muted,
                    lineHeight: '1.7',
                    marginBottom: '24px',
                  }}
                >
                  {ACCESS_TRACK.desc}
                </p>
                <p style={{ fontSize: '14px', color: C.muted, lineHeight: '1.7' }}>
                  SurgeonAccess handles everything: beneficiary alignment via CMS APIs, monthly
                  G-code billing, PROM collection and scoring, outcome reporting via FHIR, and
                  semi-annual reconciliation. You see your patients. We handle the model.
                </p>
              </div>
              <div
                style={{
                  minWidth: '220px',
                  textAlign: 'center',
                  padding: '32px',
                  borderRadius: '20px',
                  background: 'rgba(0,0,0,0.3)',
                  border: `1px solid ${C.teal}20`,
                }}
              >
                <div
                  style={{
                    fontSize: '48px',
                    fontWeight: '900',
                    color: C.teal,
                    letterSpacing: '-2px',
                  }}
                >
                  $180
                </div>
                <div style={{ fontSize: '13px', color: C.muted, marginTop: '4px' }}>
                  per beneficiary / year
                </div>
                <div
                  style={{
                    marginTop: '16px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: `${C.gold}15`,
                    fontSize: '12px',
                    fontWeight: '600',
                    color: C.gold,
                  }}
                >
                  Outcome-Aligned Payment
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginTop: '32px',
              }}
            >
              {ACCESS_TRACK.measures.map((m, i) => (
                <div
                  key={i}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: 'rgba(0,0,0,0.2)',
                    border: `1px solid ${C.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{m.name}</span>
                  <span style={{ fontSize: '11px', color: C.teal, fontWeight: '500' }}>
                    {m.target}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '20px',
                padding: '14px 20px',
                borderRadius: '10px',
                background: `${C.teal}08`,
                border: `1px solid ${C.teal}15`,
                fontSize: '13px',
                color: C.muted,
                textAlign: 'center',
              }}
            >
              <span style={{ color: C.teal, fontWeight: '700' }}>{ACCESS_TRACK.threshold}</span>
              <span style={{ margin: '0 12px', color: C.dim }}>·</span>
              Medical Director: Josh Emdur DO · NPI 1649218389
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 32px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '700',
            color: C.muted,
            textTransform: 'uppercase',
            letterSpacing: '3px',
            marginBottom: '32px',
            textAlign: 'center',
          }}
        >
          Built by surgeons, for surgeons
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {TESTIMONIAL_SCENARIOS.map((t, i) => (
            <div
              key={i}
              style={{
                padding: '32px',
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: '20px',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '16px', color: `${C.teal}40` }}>"</div>
              <p
                style={{
                  fontSize: '14px',
                  color: C.muted,
                  lineHeight: '1.7',
                  marginBottom: '20px',
                  fontStyle: 'italic',
                }}
              >
                {t.quote}
              </p>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>{t.role}</div>
                <div style={{ fontSize: '12px', color: C.dim }}>{t.location}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ORTHO-SPECIFIC DIFFERENTIATOR */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 32px' }}>
        <div
          style={{
            padding: '40px 48px',
            background: C.card,
            borderRadius: '24px',
            border: `1px solid ${C.border}`,
            display: 'flex',
            gap: '48px',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: C.coral,
                textTransform: 'uppercase',
                letterSpacing: '3px',
                marginBottom: '12px',
              }}
            >
              Why Ortho-Specific Matters
            </div>
            <h3
              style={{
                fontSize: '28px',
                fontWeight: '800',
                letterSpacing: '-1px',
                marginBottom: '12px',
              }}
            >
              Generic EHRs weren't built for what you do
            </h3>
            <p style={{ fontSize: '14px', color: C.muted, lineHeight: '1.7' }}>
              Every template, every PROM instrument, every care pathway, every documentation
              shortcut in SurgeonAccess is built for orthopedic surgery. We know the difference
              between a knee scope and a total knee. Between an AC joint injection and a subacromial
              decompression. Between KOOS JR and HOOS JR.
            </p>
            <p style={{ fontSize: '14px', color: C.muted, lineHeight: '1.7', marginTop: '12px' }}>
              Built by a surgeon who spent 7 years building BrainLAB's orthopedic computer-assisted
              surgery vertical from $0 to $250M. Five patents in image-guided surgical navigation.
              This isn't a generic platform with an ortho skin. It's ortho from the ground up.
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              minWidth: '240px',
            }}
          >
            {[
              'Spine',
              'Sports Medicine',
              'Joint Replacement',
              'Hand & Upper Extremity',
              'Foot & Ankle',
              'Trauma',
              'Shoulder & Elbow',
              'Pain Management',
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: `${C.teal}06`,
                  border: `1px solid ${C.teal}10`,
                  fontSize: '13px',
                  fontWeight: '500',
                  color: C.text,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ color: C.teal, fontSize: '10px' }}>●</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="start"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 32px 100px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: '48px',
            fontWeight: '900',
            letterSpacing: '-2px',
            marginBottom: '12px',
          }}
        >
          See 30 patients a day.
          <br />
          <span style={{ color: C.teal }}>Leave by 5.</span>
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: C.muted,
            maxWidth: '480px',
            margin: '0 auto 36px',
            lineHeight: '1.6',
          }}
        >
          Early access is open for orthopedic practices in Colorado. National rollout Q4 2026.
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your practice email"
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
              background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
              border: 'none',
              color: C.navy,
              fontWeight: '800',
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: `0 6px 24px ${C.teal}30`,
              whiteSpace: 'nowrap',
            }}
          >
            Get Early Access
          </button>
        </div>
        <div style={{ fontSize: '12px', color: C.dim, marginTop: '16px' }}>
          Free during beta · No long-term contract · Cancel anytime
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: '40px 32px',
          maxWidth: '1200px',
          margin: '0 auto',
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
                  borderRadius: '8px',
                  background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '900',
                  color: C.navy,
                }}
              >
                SA
              </div>
              <span style={{ fontSize: '14px', fontWeight: '700' }}>SurgeonAccess</span>
            </div>
            <div style={{ fontSize: '12px', color: C.dim, lineHeight: '1.8' }}>
              Solving Health Inc. · EIN 41-5139576
              <br />
              2490 University Heights Ave · Boulder, CO 80302
              <br />
              surgeons@surgeonaccess.com · 484-684-5287
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: C.dim, lineHeight: '1.8' }}>
              Medical Director: Josh Emdur DO
              <br />
              NPI 1649218389 · 50-state licensed
              <br />
              Boulder Community Health
            </div>
            <div
              style={{
                marginTop: '12px',
                display: 'flex',
                gap: '16px',
                justifyContent: 'flex-end',
              }}
            >
              <a href="#" style={{ color: C.dim, textDecoration: 'none', fontSize: '12px' }}>
                Privacy
              </a>
              <a href="#" style={{ color: C.dim, textDecoration: 'none', fontSize: '12px' }}>
                Terms
              </a>
              <a href="#" style={{ color: C.dim, textDecoration: 'none', fontSize: '12px' }}>
                HIPAA
              </a>
              <a href="#" style={{ color: C.dim, textDecoration: 'none', fontSize: '12px' }}>
                BAA
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        a:hover { color: #2dd4a8 !important; }
        button:hover { transform: translateY(-1px); }
        button { transition: all 0.2s ease; }
      `}</style>
    </div>
  );
}
