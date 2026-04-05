import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════
   co-op.care — Full Website
   Worker-Owned. Neighbor-Powered. Clinically Intelligent.
   ═══════════════════════════════════════════ */

// ── Fonts ──
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// ── Scroll Animation Hook ──
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, visible] = useInView(0.1);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Color Tokens ──
const C = {
  cream: "#FAF7F2",
  warmWhite: "#FFFDF9",
  sand: "#F4EFE8",
  sandDark: "#EDE7DC",
  gold: "#B49C78",
  goldDark: "#8F7D5F",
  goldLight: "#D4C4A0",
  teal: "#0D7377",
  tealDark: "#095456",
  tealLight: "#E6F5F5",
  brown: "#3D3427",
  brownMid: "#5A5147",
  brownLight: "#6D6155",
  brownFaint: "#8A8078",
  brownPale: "#A89E94",
  border: "#E8E4DF",
  green: "#3A7D5C",
  greenLight: "#E8F5EE",
  red: "#9B2C2C",
  redLight: "#FEF2F2",
  amber: "#9A6B20",
  amberLight: "#FEF8E8",
};

// ── Shared Styles ──
const serif = "'Fraunces', 'Georgia', serif";
const sans = "'DM Sans', 'Helvetica Neue', sans-serif";

const sectionPad = { padding: "100px 24px", maxWidth: 1200, margin: "0 auto" };
const sectionPadNarrow = { padding: "100px 24px", maxWidth: 900, margin: "0 auto" };

// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════
function Nav({ activeSection }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "For Families", href: "#families" },
    { label: "For Caregivers", href: "#caregivers" },
    { label: "Time Bank", href: "#timebank" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? "rgba(250,247,242,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
      transition: "all 0.4s ease",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: scrolled ? 64 : 76, transition: "height 0.4s ease",
      }}>
        {/* Logo */}
        <a href="#" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 12px rgba(180,156,120,0.25)",
          }}>
            <span style={{ color: "#fff", fontSize: 16, lineHeight: 1 }}>♡</span>
          </div>
          <span style={{
            fontFamily: serif, fontWeight: 600, fontSize: 20, color: C.brown,
            letterSpacing: "-0.02em",
          }}>
            co-op.care
          </span>
        </a>

        {/* Desktop Links */}
        <div style={{
          display: "flex", alignItems: "center", gap: 32,
        }}>
          <div className="nav-links-desktop" style={{
            display: "flex", gap: 28, alignItems: "center",
          }}>
            {links.map(l => (
              <a key={l.href} href={l.href} style={{
                textDecoration: "none", fontSize: 14, fontWeight: 500,
                color: C.brownLight, fontFamily: sans,
                transition: "color 0.2s ease",
              }}
              onMouseEnter={e => e.target.style.color = C.brown}
              onMouseLeave={e => e.target.style.color = C.brownLight}
              >{l.label}</a>
            ))}
          </div>
          <a href="#assess" style={{
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
            color: "#fff", textDecoration: "none", padding: "10px 24px",
            borderRadius: 24, fontSize: 14, fontWeight: 600,
            fontFamily: sans, boxShadow: "0 2px 12px rgba(180,156,120,0.25)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={e => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 4px 20px rgba(180,156,120,0.35)"; }}
          onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 2px 12px rgba(180,156,120,0.25)"; }}
          >
            Free Assessment
          </a>
        </div>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════
function Hero() {
  return (
    <section style={{
      minHeight: "100vh",
      background: `linear-gradient(168deg, ${C.warmWhite} 0%, ${C.cream} 30%, ${C.sand} 70%, ${C.sandDark} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* Subtle decorative circles */}
      <div style={{
        position: "absolute", top: -120, right: -80,
        width: 400, height: 400, borderRadius: "50%",
        background: `radial-gradient(circle, ${C.gold}08 0%, transparent 70%)`,
      }} />
      <div style={{
        position: "absolute", bottom: -60, left: -100,
        width: 300, height: 300, borderRadius: "50%",
        background: `radial-gradient(circle, ${C.teal}06 0%, transparent 70%)`,
      }} />

      <div style={{ ...sectionPadNarrow, textAlign: "center", paddingTop: 140, paddingBottom: 80 }}>
        <FadeIn>
          <p style={{
            fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.gold,
            letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24,
          }}>
            Worker-Owned · Neighbor-Powered · Clinically Intelligent
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 style={{
            fontFamily: serif, fontSize: "clamp(36px, 5.5vw, 64px)", fontWeight: 600,
            color: C.brown, lineHeight: 1.15, letterSpacing: "-0.03em",
            marginBottom: 28, maxWidth: 780, margin: "0 auto 28px",
          }}>
            Your parent stays home.{" "}
            <span style={{ color: C.teal }}>Your caregiver stays.</span>{" "}
            <span style={{ fontStyle: "italic", fontWeight: 300, color: C.brownLight }}>You breathe.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p style={{
            fontFamily: sans, fontSize: "clamp(16px, 2vw, 20px)", color: C.brownLight,
            lineHeight: 1.75, maxWidth: 560, margin: "0 auto 44px",
          }}>
            Home care that pays caregivers like professionals, treats families like neighbors, 
            and costs a fraction of facility care. Because the person who cares for your mom 
            should still be there next month.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#assess" style={{
              background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
              color: "#fff", textDecoration: "none", padding: "18px 40px",
              borderRadius: 40, fontSize: 17, fontWeight: 600,
              fontFamily: sans, boxShadow: "0 4px 24px rgba(13,115,119,0.25)",
              transition: "all 0.25s ease", letterSpacing: "0.01em",
            }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 32px rgba(13,115,119,0.3)"; }}
            onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 24px rgba(13,115,119,0.25)"; }}
            >
              How heavy is your load?
            </a>
            <a href="#how-it-works" style={{
              background: "transparent", color: C.brown,
              textDecoration: "none", padding: "18px 40px",
              borderRadius: 40, fontSize: 17, fontWeight: 500,
              fontFamily: sans, border: `1.5px solid ${C.border}`,
              transition: "all 0.25s ease",
            }}
            onMouseEnter={e => { e.target.style.borderColor = C.gold; e.target.style.color = C.goldDark; }}
            onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.brown; }}
            >
              How it works
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <p style={{
            fontFamily: sans, fontSize: 13, color: C.brownPale,
            marginTop: 28, lineHeight: 1.5,
          }}>
            Free 2-minute assessment · No login required · Boulder, Colorado
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// CRISIS STATS BAR
// ═══════════════════════════════════════════
function CrisisStats() {
  const stats = [
    { number: "63M", label: "family caregivers in the US", sub: "Up 45% since 2020" },
    { number: "$9,900", label: "monthly cost of facility care", sub: "Colorado average" },
    { number: "77%", label: "annual caregiver turnover", sub: "Industry average" },
    { number: "10K", label: "Americans turn 65 every day", sub: "Starting now" },
  ];

  return (
    <section style={{ background: C.brown, padding: "0 24px" }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 0,
      }}>
        {stats.map((s, i) => (
          <FadeIn key={i} delay={i * 0.1} style={{
            padding: "40px 28px",
            borderRight: i < stats.length - 1 ? `1px solid rgba(255,255,255,0.08)` : "none",
            textAlign: "center",
          }}>
            <div style={{
              fontFamily: serif, fontSize: 40, fontWeight: 700,
              color: C.goldLight, letterSpacing: "-0.02em", lineHeight: 1,
            }}>{s.number}</div>
            <div style={{
              fontFamily: sans, fontSize: 14, color: "rgba(255,255,255,0.8)",
              marginTop: 8, fontWeight: 400, lineHeight: 1.4,
            }}>{s.label}</div>
            <div style={{
              fontFamily: sans, fontSize: 12, color: "rgba(255,255,255,0.4)",
              marginTop: 4, fontWeight: 500,
            }}>{s.sub}</div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// THE PROBLEM — "You're not the only one awake at 2am"
// ═══════════════════════════════════════════
function TheProblem() {
  return (
    <section style={{ background: C.cream, padding: "0 24px" }}>
      <div style={{ ...sectionPadNarrow }}>
        <FadeIn>
          <p style={{
            fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.teal,
            letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16,
          }}>
            The invisible crisis
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2 style={{
            fontFamily: serif, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 600,
            color: C.brown, lineHeight: 1.2, letterSpacing: "-0.02em",
            marginBottom: 24, maxWidth: 700,
          }}>
            You're not the only one awake at 2am wondering if you're doing enough.
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div style={{
            fontSize: 17, color: C.brownMid, lineHeight: 1.85,
            fontFamily: sans, maxWidth: 660,
          }}>
            <p style={{ marginBottom: 20 }}>
              She's 52. She teaches fourth grade. After school, she drives 
              to her mother's house to manage medications, argue with insurance, 
              and pretend she's not exhausted. She hasn't slept through the night 
              in seven months.
            </p>
            <p style={{ marginBottom: 20 }}>
              She doesn't call herself a caregiver. She's just doing what daughters do.
            </p>
            <p style={{ marginBottom: 20 }}>
              When she finally searches for help, she finds agencies that charge 
              $30 an hour, pay caregivers $13, and send a different stranger every week. 
              Or she finds a facility bed for $9,900 a month. Neither option works.
            </p>
            <p style={{ fontWeight: 500, color: C.brown }}>
              She is one of 63 million Americans carrying this weight. 
              We built co-op.care for her.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// THE EXTRACTION PROBLEM
// ═══════════════════════════════════════════
function ExtractionVsCoop() {
  return (
    <section style={{ background: C.warmWhite, padding: "0 24px" }}>
      <div style={{ ...sectionPad }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{
              fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.teal,
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16,
            }}>
              Where the money goes
            </p>
            <h2 style={{
              fontFamily: serif, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600,
              color: C.brown, lineHeight: 1.2, letterSpacing: "-0.02em",
              maxWidth: 600, margin: "0 auto",
            }}>
              The same $30 an hour. Completely different outcomes.
            </h2>
          </div>
        </FadeIn>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24, maxWidth: 900, margin: "0 auto",
        }}>
          {/* Traditional */}
          <FadeIn delay={0.1}>
            <div style={{
              background: C.redLight, borderRadius: 20, padding: "36px 30px",
              border: `1px solid ${C.red}15`,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 16, right: 20,
                fontSize: 11, fontWeight: 600, color: C.red, fontFamily: sans,
                background: `${C.red}10`, padding: "4px 12px", borderRadius: 12,
              }}>
                Traditional agency
              </div>
              <h3 style={{
                fontFamily: serif, fontSize: 22, fontWeight: 600, color: C.red,
                marginBottom: 28, marginTop: 8,
              }}>
                The extraction model
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Family pays", amount: "$30/hr" },
                  { label: "Agency takes", amount: "$17/hr", note: "57%" },
                  { label: "Caregiver gets", amount: "$13/hr", note: "no benefits, no equity" },
                ].map((r, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    paddingBottom: 12, borderBottom: `1px solid ${C.red}12`,
                  }}>
                    <span style={{ fontFamily: sans, fontSize: 15, color: C.brownMid }}>{r.label}</span>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: C.red }}>{r.amount}</span>
                      {r.note && <div style={{ fontFamily: sans, fontSize: 11, color: C.brownPale }}>{r.note}</div>}
                    </div>
                  </div>
                ))}
              </div>

              <p style={{
                fontFamily: sans, fontSize: 13, color: C.brownFaint, marginTop: 20,
                lineHeight: 1.5, fontStyle: "italic",
              }}>
                77% annual turnover. A new stranger every few weeks.
              </p>
            </div>
          </FadeIn>

          {/* Cooperative */}
          <FadeIn delay={0.2}>
            <div style={{
              background: C.greenLight, borderRadius: 20, padding: "36px 30px",
              border: `1px solid ${C.green}15`,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 16, right: 20,
                fontSize: 11, fontWeight: 600, color: C.green, fontFamily: sans,
                background: `${C.green}10`, padding: "4px 12px", borderRadius: 12,
              }}>
                co-op.care
              </div>
              <h3 style={{
                fontFamily: serif, fontSize: 22, fontWeight: 600, color: C.green,
                marginBottom: 28, marginTop: 8,
              }}>
                The cooperative model
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Family pays", amount: "$30/hr" },
                  { label: "Cooperative retains", amount: "$4/hr", note: "RN supervision, insurance, AI" },
                  { label: "Caregiver earns", amount: "$26/hr", note: "W-2 + benefits + equity" },
                ].map((r, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    paddingBottom: 12, borderBottom: `1px solid ${C.green}12`,
                  }}>
                    <span style={{ fontFamily: sans, fontSize: 15, color: C.brownMid }}>{r.label}</span>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: C.green }}>{r.amount}</span>
                      {r.note && <div style={{ fontFamily: sans, fontSize: 11, color: C.brownPale }}>{r.note}</div>}
                    </div>
                  </div>
                ))}
              </div>

              <p style={{
                fontFamily: sans, fontSize: 13, color: C.brownFaint, marginTop: 20,
                lineHeight: 1.5, fontStyle: "italic",
              }}>
                Same caregiver every week. $52K in equity over 5 years.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// HOW IT WORKS
// ═══════════════════════════════════════════
function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Take the free assessment",
      body: "The Caregiver Intensity Index measures your burnout in 2 minutes. The Care Readiness Index maps your loved one's actual needs across 14 clinical dimensions. No login. No credit card. Just clarity.",
      icon: "◈",
    },
    {
      num: "02",
      title: "Get matched with a worker-owner",
      body: "Not a gig worker. Not a temp. A W-2 caregiver who earns $25–28/hr, has benefits, builds equity, and lives in your neighborhood. They stay because they own the business.",
      icon: "◇",
    },
    {
      num: "03",
      title: "Your care team shows up",
      body: "Your caregiver's daily notes are translated by AI into hospital-grade clinical documentation — so your parent's doctor sees what's happening at home. A physician Clinical Director oversees everything.",
      icon: "△",
    },
    {
      num: "04",
      title: "Your neighbors fill in the gaps",
      body: "Need someone to sit with Mom while you sleep? The Time Bank connects you with vetted neighbors. One hour of help earns one hour of credit. No money. Just community.",
      icon: "○",
    },
  ];

  return (
    <section id="how-it-works" style={{ background: C.sand, padding: "0 24px" }}>
      <div style={{ ...sectionPad }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{
              fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.teal,
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16,
            }}>
              How co-op.care works
            </p>
            <h2 style={{
              fontFamily: serif, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600,
              color: C.brown, lineHeight: 1.2, letterSpacing: "-0.02em",
              maxWidth: 600, margin: "0 auto",
            }}>
              Professional care. Cooperative economics. Neighborhood trust.
            </h2>
          </div>
        </FadeIn>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}>
          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div style={{
                background: C.warmWhite, borderRadius: 20, padding: "32px 26px",
                border: `1px solid ${C.border}`,
                height: "100%", display: "flex", flexDirection: "column",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{
                  display: "flex", alignItems: "center", gap: 12, marginBottom: 18,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `linear-gradient(135deg, ${C.teal}10, ${C.teal}05)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, color: C.teal,
                  }}>{step.icon}</div>
                  <span style={{
                    fontFamily: serif, fontSize: 13, fontWeight: 600,
                    color: C.goldDark, letterSpacing: "0.02em",
                  }}>{step.num}</span>
                </div>

                <h3 style={{
                  fontFamily: serif, fontSize: 20, fontWeight: 600,
                  color: C.brown, marginBottom: 12, lineHeight: 1.3,
                }}>{step.title}</h3>

                <p style={{
                  fontFamily: sans, fontSize: 14.5, color: C.brownMid,
                  lineHeight: 1.7, flex: 1,
                }}>{step.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// CII ASSESSMENT CTA
// ═══════════════════════════════════════════
function AssessmentCTA() {
  const dimensions = [
    { label: "Caregiver Load", icon: "⬡", desc: "Sleep, work impact, financial strain" },
    { label: "Emotional Impact", icon: "◇", desc: "Guilt, isolation, patience, sense of failure" },
    { label: "Resilience Gap", icon: "△", desc: "Health neglect, contingency fragility" },
  ];

  return (
    <section id="assess" style={{
      background: `linear-gradient(168deg, ${C.brown} 0%, #2a2318 100%)`,
      padding: "0 24px", position: "relative", overflow: "hidden",
    }}>
      {/* Decorative */}
      <div style={{
        position: "absolute", top: -100, right: -100,
        width: 400, height: 400, borderRadius: "50%",
        background: `radial-gradient(circle, ${C.gold}10 0%, transparent 70%)`,
      }} />

      <div style={{ ...sectionPad, position: "relative" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 48, alignItems: "center",
        }}>
          {/* Left: copy */}
          <FadeIn>
            <div>
              <p style={{
                fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.gold,
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16,
              }}>
                Free assessment
              </p>
              <h2 style={{
                fontFamily: serif, fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 600,
                color: "#fff", lineHeight: 1.2, letterSpacing: "-0.02em",
                marginBottom: 20,
              }}>
                How heavy is the weight you're carrying?
              </h2>
              <p style={{
                fontFamily: sans, fontSize: 16, color: "rgba(255,255,255,0.7)",
                lineHeight: 1.75, marginBottom: 32,
              }}>
                The Caregiver Intensity Index is a 2-minute check-in designed for people 
                like you — the ones holding everything together. Twelve questions. 
                Three dimensions. No wrong answers. This is not a test. It is a mirror.
              </p>

              <a href="#" style={{
                display: "inline-block",
                background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
                color: "#fff", textDecoration: "none", padding: "16px 40px",
                borderRadius: 40, fontSize: 16, fontWeight: 600,
                fontFamily: sans, boxShadow: "0 4px 24px rgba(13,115,119,0.3)",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.target.style.transform = "translateY(0)"}
              >
                Take the free assessment
              </a>
              <p style={{
                fontFamily: sans, fontSize: 12, color: "rgba(255,255,255,0.4)",
                marginTop: 16,
              }}>
                No login required · 100% private · Results in 2 minutes
              </p>
            </div>
          </FadeIn>

          {/* Right: dimension cards */}
          <FadeIn delay={0.2}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {dimensions.map((d, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.06)", borderRadius: 16,
                  padding: "22px 24px", border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(8px)",
                  display: "flex", alignItems: "center", gap: 18,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${C.gold}15`, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 22, color: C.goldLight, flexShrink: 0,
                  }}>{d.icon}</div>
                  <div>
                    <div style={{
                      fontFamily: serif, fontSize: 16, fontWeight: 600,
                      color: "#fff", marginBottom: 4,
                    }}>{d.label}</div>
                    <div style={{
                      fontFamily: sans, fontSize: 13, color: "rgba(255,255,255,0.5)",
                    }}>{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// FOR FAMILIES
// ═══════════════════════════════════════════
function ForFamilies() {
  return (
    <section id="families" style={{ background: C.cream, padding: "0 24px" }}>
      <div style={{ ...sectionPad }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 48, alignItems: "center",
        }}>
          <FadeIn>
            <div>
              <p style={{
                fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.teal,
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16,
              }}>
                For families
              </p>
              <h2 style={{
                fontFamily: serif, fontSize: "clamp(28px, 3.5vw, 38px)", fontWeight: 600,
                color: C.brown, lineHeight: 1.2, letterSpacing: "-0.02em",
                marginBottom: 20,
              }}>
                You shouldn't have to choose between your parent and your life.
              </h2>
              <p style={{
                fontFamily: sans, fontSize: 16, color: C.brownMid,
                lineHeight: 1.75, marginBottom: 28,
              }}>
                Facility care costs $9,900 a month. And your parent doesn't want to go there anyway. 
                With co-op.care, they stay in their own home, with a caregiver who knows their name, 
                their medications, and how they take their coffee. For $3,500 a month.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "Same caregiver every visit — not a rotating cast of strangers",
                  "AI monitors changes and alerts your care team before a crisis",
                  "A physician Clinical Director oversees the care plan",
                  "Your parent's doctor gets daily clinical-grade notes",
                  "Time Bank neighbors fill in when you need a break",
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                  }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: C.teal, marginTop: 8, flexShrink: 0, opacity: 0.7,
                    }} />
                    <span style={{
                      fontFamily: sans, fontSize: 15, color: C.brownMid, lineHeight: 1.55,
                    }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div style={{
              background: C.warmWhite, borderRadius: 24, padding: "40px 32px",
              border: `1px solid ${C.border}`,
              boxShadow: "0 4px 32px rgba(0,0,0,0.04)",
            }}>
              <div style={{
                fontFamily: sans, fontSize: 12, fontWeight: 600, color: C.brownPale,
                letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20,
              }}>
                What families are saying
              </div>
              <blockquote style={{
                fontFamily: serif, fontSize: 20, fontStyle: "italic",
                color: C.brown, lineHeight: 1.6, margin: 0, marginBottom: 20,
                fontWeight: 300, letterSpacing: "-0.01em",
              }}>
                "For the first time in three years, I slept through the night knowing 
                someone I trust is there. Not a stranger. A neighbor."
              </blockquote>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.gold}30, ${C.teal}20)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: serif, fontSize: 16, fontWeight: 600, color: C.goldDark,
                }}>S</div>
                <div>
                  <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.brown }}>
                    Sarah M.
                  </div>
                  <div style={{ fontFamily: sans, fontSize: 12, color: C.brownPale }}>
                    Boulder, CO — caring for her mother
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// FOR CAREGIVERS
// ═══════════════════════════════════════════
function ForCaregivers() {
  const benefits = [
    { stat: "$25–28", unit: "/hr", label: "W-2 wages", detail: "vs. $13–17/hr industry average" },
    { stat: "$52K", unit: "", label: "equity over 5 years", detail: "Internal Capital Account ownership" },
    { stat: "100%", unit: "", label: "benefits included", detail: "Health insurance, PTO, retirement" },
    { stat: "<15%", unit: "", label: "target turnover", detail: "vs. 77% industry average" },
  ];

  return (
    <section id="caregivers" style={{ background: C.warmWhite, padding: "0 24px" }}>
      <div style={{ ...sectionPad }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{
              fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.teal,
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16,
            }}>
              For caregivers
            </p>
            <h2 style={{
              fontFamily: serif, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600,
              color: C.brown, lineHeight: 1.2, letterSpacing: "-0.02em",
              maxWidth: 650, margin: "0 auto 16px",
            }}>
              You're not a gig worker. You're not disposable. You're an owner.
            </h2>
            <p style={{
              fontFamily: sans, fontSize: 16, color: C.brownLight, lineHeight: 1.7,
              maxWidth: 560, margin: "0 auto",
            }}>
              The industry calls you "essential" and pays you $13 an hour. 
              We pay you $25–28 an hour and give you ownership of the company. 
              Words are cheap. Equity isn't.
            </p>
          </div>
        </FadeIn>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16, maxWidth: 960, margin: "0 auto",
        }}>
          {benefits.map((b, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div style={{
                background: C.tealLight, borderRadius: 20, padding: "30px 24px",
                textAlign: "center", border: `1px solid ${C.teal}12`,
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{
                  fontFamily: serif, fontSize: 36, fontWeight: 700, color: C.teal,
                  letterSpacing: "-0.02em", lineHeight: 1,
                }}>
                  {b.stat}<span style={{ fontSize: 18 }}>{b.unit}</span>
                </div>
                <div style={{
                  fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.brown,
                  marginTop: 8, marginBottom: 4,
                }}>{b.label}</div>
                <div style={{
                  fontFamily: sans, fontSize: 12, color: C.brownPale,
                }}>{b.detail}</div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <div style={{ textAlign: "center", marginTop: 44 }}>
            <a href="#" style={{
              display: "inline-block",
              background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
              color: "#fff", textDecoration: "none", padding: "15px 36px",
              borderRadius: 32, fontSize: 15, fontWeight: 600, fontFamily: sans,
              boxShadow: "0 4px 20px rgba(13,115,119,0.2)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={e => e.target.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.target.style.transform = "translateY(0)"}
            >
              Apply to become a worker-owner
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// TIME BANK
// ═══════════════════════════════════════════
function TimeBank() {
  return (
    <section id="timebank" style={{
      background: `linear-gradient(168deg, ${C.sand} 0%, ${C.sandDark} 100%)`,
      padding: "0 24px",
    }}>
      <div style={{ ...sectionPad }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 48, alignItems: "center",
        }}>
          {/* Illustration card */}
          <FadeIn>
            <div style={{
              background: C.warmWhite, borderRadius: 24, padding: "40px 32px",
              border: `1px solid ${C.border}`,
              boxShadow: "0 4px 32px rgba(0,0,0,0.04)",
            }}>
              <div style={{
                display: "flex", flexDirection: "column", gap: 20,
              }}>
                {[
                  { icon: "🌅", name: "Margaret", action: "Walks with Eleanor on Tuesdays", earned: "+1 hour" },
                  { icon: "🍲", name: "David", action: "Drops off meals on Thursdays", earned: "+1 hour" },
                  { icon: "📖", name: "Lisa", action: "Reads to Ruth so her daughter can sleep", earned: "+1 hour" },
                ].map((person, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "16px 18px", borderRadius: 14,
                    background: `${C.teal}05`, border: `1px solid ${C.teal}10`,
                  }}>
                    <span style={{ fontSize: 28 }}>{person.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.brown,
                      }}>{person.name}</div>
                      <div style={{
                        fontFamily: sans, fontSize: 13, color: C.brownFaint,
                      }}>{person.action}</div>
                    </div>
                    <div style={{
                      fontFamily: serif, fontSize: 14, fontWeight: 600, color: C.teal,
                      background: C.tealLight, padding: "4px 12px", borderRadius: 10,
                    }}>{person.earned}</div>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: 24, padding: "16px 20px", borderRadius: 14,
                background: `linear-gradient(135deg, ${C.gold}08, ${C.teal}06)`,
                border: `1px solid ${C.border}`,
                textAlign: "center",
              }}>
                <div style={{
                  fontFamily: serif, fontSize: 24, fontWeight: 700, color: C.teal,
                }}>$7,488</div>
                <div style={{
                  fontFamily: sans, fontSize: 12, color: C.brownFaint,
                }}>average annual savings per member family</div>
              </div>
            </div>
          </FadeIn>

          {/* Copy */}
          <FadeIn delay={0.15}>
            <div>
              <p style={{
                fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.teal,
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16,
              }}>
                The Time Bank
              </p>
              <h2 style={{
                fontFamily: serif, fontSize: "clamp(28px, 3.5vw, 38px)", fontWeight: 600,
                color: C.brown, lineHeight: 1.2, letterSpacing: "-0.02em",
                marginBottom: 20,
              }}>
                1 hour of help = 1 hour of credit. No money. Just neighbors.
              </h2>
              <p style={{
                fontFamily: sans, fontSize: 16, color: C.brownMid,
                lineHeight: 1.75, marginBottom: 20,
              }}>
                You don't need a medical degree to sit with someone so their daughter can sleep. 
                The Time Bank is the oldest technology there is: neighbors helping neighbors. 
                We just made it easier to find each other.
              </p>
              <p style={{
                fontFamily: sans, fontSize: 15, color: C.brownMid,
                lineHeight: 1.75, marginBottom: 28,
              }}>
                Every participant passes a background check. Every hour is tracked. Every credit 
                you earn is yours to use when you need help yourself. Walk with Eleanor today. 
                Get a ride to your appointment tomorrow.
              </p>
              <a href="#" style={{
                display: "inline-block",
                background: "transparent", color: C.teal,
                textDecoration: "none", padding: "14px 32px",
                borderRadius: 32, fontSize: 15, fontWeight: 600, fontFamily: sans,
                border: `2px solid ${C.teal}`,
                transition: "all 0.25s ease",
              }}
              onMouseEnter={e => { e.target.style.background = C.teal; e.target.style.color = "#fff"; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = C.teal; }}
              >
                Join the Time Bank
              </a>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// FOR EMPLOYERS
// ═══════════════════════════════════════════
function ForEmployers() {
  return (
    <section style={{ background: C.warmWhite, padding: "0 24px" }}>
      <div style={{ ...sectionPad }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 48, alignItems: "center",
        }}>
          <FadeIn>
            <div>
              <p style={{
                fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.gold,
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16,
              }}>
                For employers
              </p>
              <h2 style={{
                fontFamily: serif, fontSize: "clamp(28px, 3.5vw, 38px)", fontWeight: 600,
                color: C.brown, lineHeight: 1.2, letterSpacing: "-0.02em",
                marginBottom: 20,
              }}>
                23% of your employees are secret caregivers. It's costing you $5,365 each.
              </h2>
              <p style={{
                fontFamily: sans, fontSize: 16, color: C.brownMid,
                lineHeight: 1.75, marginBottom: 20,
              }}>
                They're your best people. The ones who never say no, never complain, 
                and one day just hand in their resignation. Not because of the job. 
                Because they can't manage their parent's care and yours at the same time.
              </p>
              <p style={{
                fontFamily: sans, fontSize: 15, color: C.brownMid,
                lineHeight: 1.75, marginBottom: 28,
              }}>
                The Caregiver Intensity Index identifies who's struggling before they leave. 
                Our care coordination platform connects them with support — professional 
                caregivers, Time Bank neighbors, and community resources. HSA/FSA eligible.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div style={{
              background: C.amberLight, borderRadius: 24, padding: "36px 32px",
              border: `1px solid ${C.amber}15`,
            }}>
              <div style={{
                fontFamily: sans, fontSize: 12, fontWeight: 600, color: C.amber,
                letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20,
              }}>
                Boulder Valley School District
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Total employees", value: "1,717" },
                  { label: "Hidden family caregivers (23%)", value: "~395" },
                  { label: "Annual hidden cost", value: "$2.1M" },
                  { label: "Cost per affected employee", value: "$5,365" },
                  { label: "co-op.care ROI", value: "74:1 to 149:1" },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    paddingBottom: 12, borderBottom: `1px solid ${C.amber}12`,
                  }}>
                    <span style={{ fontFamily: sans, fontSize: 14, color: C.brownMid }}>{row.label}</span>
                    <span style={{
                      fontFamily: serif, fontSize: 18, fontWeight: 700, color: C.amber,
                    }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <p style={{
                fontFamily: sans, fontSize: 13, color: C.brownFaint, marginTop: 20,
                lineHeight: 1.5, fontStyle: "italic",
              }}>
                Measure the invisible. Fix the expensive. Keep the irreplaceable.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// FOR HOSPITALS
// ═══════════════════════════════════════════
function ForHospitals() {
  return (
    <section style={{ background: C.sand, padding: "0 24px" }}>
      <div style={{ ...sectionPadNarrow }}>
        <FadeIn>
          <p style={{
            fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.teal,
            letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16,
          }}>
            For hospitals & health systems
          </p>
          <h2 style={{
            fontFamily: serif, fontSize: "clamp(28px, 3.5vw, 38px)", fontWeight: 600,
            color: C.brown, lineHeight: 1.2, letterSpacing: "-0.02em",
            marginBottom: 24,
          }}>
            Turn blocked beds into billable care coordination.
          </h2>
        </FadeIn>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 16, marginBottom: 32,
        }}>
          {[
            { stat: "$2,500+", label: "per day", desc: "Cost of a blocked hospital bed" },
            { stat: "$17K–$24K", label: "per month", desc: "Net-new Medicare revenue from PIN/CHI codes for 200 patients" },
            { stat: "9–12%", label: "Part B penalty", desc: "ASM revenue risk starting January 2027" },
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div style={{
                background: C.warmWhite, borderRadius: 16, padding: "24px 22px",
                border: `1px solid ${C.border}`, textAlign: "center",
              }}>
                <div style={{
                  fontFamily: serif, fontSize: 32, fontWeight: 700, color: C.teal,
                  lineHeight: 1,
                }}>{item.stat}</div>
                <div style={{
                  fontFamily: sans, fontSize: 12, fontWeight: 600, color: C.brownPale,
                  marginTop: 4, marginBottom: 8,
                }}>{item.label}</div>
                <div style={{
                  fontFamily: sans, fontSize: 13, color: C.brownFaint, lineHeight: 1.4,
                }}>{item.desc}</div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.2}>
          <div style={{
            background: C.warmWhite, borderRadius: 20, padding: "32px 28px",
            border: `1px solid ${C.border}`,
          }}>
            <p style={{
              fontFamily: sans, fontSize: 15.5, color: C.brownMid, lineHeight: 1.75,
              marginBottom: 16,
            }}>
              We're not competing for your care management patients. We're the safe graduation 
              tier. When your CCM patients stabilize, they step down to our AI-monitored Care 
              Maintenance — so you free up clinical capacity without risking readmission.
            </p>
            <p style={{
              fontFamily: sans, fontSize: 15.5, color: C.brownMid, lineHeight: 1.75,
              marginBottom: 0,
            }}>
              Every caregiver note is translated into FHIR-compliant clinical documentation. 
              A physician Clinical Director oversees the care plan. PIN and CHI billing codes 
              turn your uncompensated discharge coordination into Medicare revenue.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// PRICING
// ═══════════════════════════════════════════
function Pricing() {
  const tiers = [
    {
      name: "Companion Care",
      price: "$400–$1,200",
      per: "/month",
      hours: "4–12 hours/week",
      color: C.green,
      bg: C.greenLight,
      features: [
        "Social companionship & check-ins",
        "Light meal preparation",
        "Errand running & transportation",
        "Medication reminders",
        "Time Bank neighbor matching",
      ],
      cta: "Get started",
    },
    {
      name: "Standard Home Care",
      price: "$1,500–$3,500",
      per: "/month",
      hours: "15–30 hours/week",
      color: C.teal,
      bg: C.tealLight,
      popular: true,
      features: [
        "Personal care (bathing, dressing, mobility)",
        "Dedicated worker-owner caregiver",
        "Medication management",
        "AI-powered clinical documentation",
        "Care coordination with physicians",
        "Fall prevention & safety monitoring",
      ],
      cta: "Get matched",
    },
    {
      name: "Comprehensive Care",
      price: "$3,500–$9,000",
      per: "/month",
      hours: "30–56+ hours/week",
      color: C.brown,
      bg: C.sand,
      features: [
        "Skilled nursing oversight",
        "Complex medication administration",
        "Wound care & medical device management",
        "Cognitive & behavioral support",
        "Hospital discharge coordination",
        "FHIR-compliant clinical documentation",
        "24-hour care available",
      ],
      cta: "Schedule a consultation",
    },
  ];

  return (
    <section id="pricing" style={{ background: C.cream, padding: "0 24px" }}>
      <div style={{ ...sectionPad }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{
              fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.teal,
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16,
            }}>
              Transparent pricing
            </p>
            <h2 style={{
              fontFamily: serif, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600,
              color: C.brown, lineHeight: 1.2, letterSpacing: "-0.02em",
              maxWidth: 600, margin: "0 auto 12px",
            }}>
              Real care. Real prices. No hidden fees.
            </h2>
            <p style={{
              fontFamily: sans, fontSize: 16, color: C.brownLight, lineHeight: 1.7,
              maxWidth: 520, margin: "0 auto",
            }}>
              The average Colorado assisted living facility costs $9,900 per month. 
              Your loved one can stay home for a fraction of that.
            </p>
          </div>
        </FadeIn>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20, maxWidth: 1000, margin: "0 auto",
        }}>
          {tiers.map((tier, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div style={{
                background: "#fff", borderRadius: 24, padding: "36px 28px",
                border: tier.popular ? `2px solid ${C.teal}` : `1px solid ${C.border}`,
                position: "relative", height: "100%",
                display: "flex", flexDirection: "column",
                boxShadow: tier.popular ? "0 8px 40px rgba(13,115,119,0.08)" : "none",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                {tier.popular && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    background: C.teal, color: "#fff", padding: "4px 16px",
                    borderRadius: 12, fontSize: 11, fontWeight: 700, fontFamily: sans,
                    letterSpacing: "0.04em",
                  }}>MOST COMMON</div>
                )}

                <h3 style={{
                  fontFamily: serif, fontSize: 20, fontWeight: 600, color: tier.color,
                  marginBottom: 4,
                }}>{tier.name}</h3>

                <div style={{
                  fontFamily: sans, fontSize: 12, color: C.brownPale,
                  marginBottom: 16,
                }}>{tier.hours}</div>

                <div style={{ marginBottom: 24 }}>
                  <span style={{
                    fontFamily: serif, fontSize: 32, fontWeight: 700, color: C.brown,
                  }}>{tier.price}</span>
                  <span style={{
                    fontFamily: sans, fontSize: 14, color: C.brownPale,
                  }}>{tier.per}</span>
                </div>

                <div style={{
                  display: "flex", flexDirection: "column", gap: 10,
                  flex: 1, marginBottom: 28,
                }}>
                  {tier.features.map((f, j) => (
                    <div key={j} style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                    }}>
                      <span style={{
                        color: tier.color, fontSize: 14, marginTop: 2, flexShrink: 0,
                        opacity: 0.7,
                      }}>✓</span>
                      <span style={{
                        fontFamily: sans, fontSize: 13.5, color: C.brownMid, lineHeight: 1.4,
                      }}>{f}</span>
                    </div>
                  ))}
                </div>

                <a href="#assess" style={{
                  display: "block", textAlign: "center",
                  background: tier.popular ? `linear-gradient(135deg, ${C.teal}, ${C.tealDark})` : "transparent",
                  color: tier.popular ? "#fff" : tier.color,
                  textDecoration: "none", padding: "14px 0",
                  borderRadius: 14, fontSize: 15, fontWeight: 600, fontFamily: sans,
                  border: tier.popular ? "none" : `1.5px solid ${tier.color}40`,
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={e => { if (!tier.popular) { e.target.style.background = `${tier.color}10`; } }}
                onMouseLeave={e => { if (!tier.popular) { e.target.style.background = "transparent"; } }}
                >
                  {tier.cta}
                </a>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <p style={{
            textAlign: "center", fontFamily: sans, fontSize: 14, color: C.brownFaint,
            marginTop: 32, lineHeight: 1.6, fontStyle: "italic", maxWidth: 600,
            margin: "32px auto 0",
          }}>
            No agency markups. No hidden fees. Your caregiver earns $25–28/hr with 
            benefits and equity. That's where your money goes.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// AI SAFETY SECTION
// ═══════════════════════════════════════════
function AISafety() {
  return (
    <section style={{
      background: `linear-gradient(168deg, ${C.tealDark} 0%, #072f31 100%)`,
      padding: "0 24px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", bottom: -80, left: -80,
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(180,156,120,0.08) 0%, transparent 70%)",
      }} />

      <div style={{ ...sectionPadNarrow, position: "relative" }}>
        <FadeIn>
          <p style={{
            fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.goldLight,
            letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16,
          }}>
            Why human + AI
          </p>
          <h2 style={{
            fontFamily: serif, fontSize: "clamp(28px, 3.5vw, 38px)", fontWeight: 600,
            color: "#fff", lineHeight: 1.2, letterSpacing: "-0.02em",
            marginBottom: 24, maxWidth: 600,
          }}>
            AI alone under-triages 52% of emergencies. That's why we built it differently.
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p style={{
            fontFamily: sans, fontSize: 16, color: "rgba(255,255,255,0.7)",
            lineHeight: 1.75, marginBottom: 36, maxWidth: 640,
          }}>
            A Mount Sinai study found that the most popular consumer health AI misses 
            more than half of urgent situations. We use the same enterprise-grade AI — 
            but we never let it make decisions alone.
          </p>
        </FadeIn>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}>
          {[
            { layer: "Enterprise AI", desc: "Normalizes data from 350+ clinical sources. Monitors patterns 24/7. Flags changes before they become crises.", icon: "◈" },
            { layer: "Cooperative Labor", desc: "Worker-owners know your parent. They notice the things sensors miss — a change in voice, a missed meal, a quieter morning.", icon: "◇" },
            { layer: "Clinical Director", desc: "A physician (MD/DO) oversees every care plan. No Medicare billing without human review. No shortcuts.", icon: "△" },
          ].map((item, i) => (
            <FadeIn key={i} delay={0.15 + i * 0.08}>
              <div style={{
                background: "rgba(255,255,255,0.05)", borderRadius: 16,
                padding: "28px 22px", border: "1px solid rgba(255,255,255,0.08)",
                height: "100%",
              }}>
                <div style={{
                  fontSize: 24, color: C.goldLight, marginBottom: 14,
                }}>{item.icon}</div>
                <div style={{
                  fontFamily: serif, fontSize: 17, fontWeight: 600, color: "#fff",
                  marginBottom: 8,
                }}>{item.layer}</div>
                <div style={{
                  fontFamily: sans, fontSize: 14, color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.65,
                }}>{item.desc}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// ABOUT / COOPERATIVE
// ═══════════════════════════════════════════
function About() {
  return (
    <section style={{ background: C.cream, padding: "0 24px" }}>
      <div style={{ ...sectionPadNarrow }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{
              fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.gold,
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16,
            }}>
              Boulder, Colorado
            </p>
            <h2 style={{
              fontFamily: serif, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600,
              color: C.brown, lineHeight: 1.2, letterSpacing: "-0.02em",
              maxWidth: 600, margin: "0 auto 16px",
            }}>
              Worker-owned. Neighbor-powered. Clinically intelligent.
            </h2>
            <p style={{
              fontFamily: sans, fontSize: 16, color: C.brownLight, lineHeight: 1.75,
              maxWidth: 560, margin: "0 auto",
            }}>
              co-op.care is a worker-owned cooperative launching in Boulder, Colorado. 
              Our caregivers aren't gig workers sent by an algorithm. They're your neighbors 
              who own the company, earn professional wages, and stay.
            </p>
          </div>
        </FadeIn>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14, marginBottom: 40,
        }}>
          {[
            { value: "26", label: "home care co-ops nationally", sub: "We're building #27" },
            { value: "34%", label: "co-op growth since 2020", sub: "vs 13% traditional small business" },
            { value: "87%", label: "of care workers are women", sub: "70%+ of co-op leadership is women" },
            { value: "67%", label: "of care workers are people of color", sub: "Ownership changes everything" },
          ].map((s, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div style={{
                background: C.warmWhite, borderRadius: 16, padding: "22px 18px",
                border: `1px solid ${C.border}`, textAlign: "center",
              }}>
                <div style={{
                  fontFamily: serif, fontSize: 28, fontWeight: 700, color: C.gold,
                  lineHeight: 1,
                }}>{s.value}</div>
                <div style={{
                  fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.brown,
                  marginTop: 6, marginBottom: 4, lineHeight: 1.3,
                }}>{s.label}</div>
                <div style={{
                  fontFamily: sans, fontSize: 11, color: C.brownPale, lineHeight: 1.3,
                }}>{s.sub}</div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <div style={{
            background: `linear-gradient(135deg, ${C.gold}08, ${C.teal}06)`,
            borderRadius: 20, padding: "32px 28px",
            border: `1px solid ${C.border}`, textAlign: "center",
          }}>
            <p style={{
              fontFamily: serif, fontSize: 20, fontStyle: "italic",
              color: C.brown, lineHeight: 1.6, fontWeight: 300,
              maxWidth: 560, margin: "0 auto",
            }}>
              "When AI eliminates healthcare friction, who captures the savings? 
              In our model, the workers and families do. That's not idealism. 
              That's the math."
            </p>
            <p style={{
              fontFamily: sans, fontSize: 13, color: C.brownPale, marginTop: 16,
              fontWeight: 600,
            }}>
              Blaine Warkentine, Founder
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// FINAL CTA
// ═══════════════════════════════════════════
function FinalCTA() {
  return (
    <section style={{
      background: `linear-gradient(168deg, ${C.brown} 0%, #2a2318 100%)`,
      padding: "0 24px", textAlign: "center",
    }}>
      <div style={{ ...sectionPadNarrow, paddingTop: 80, paddingBottom: 80 }}>
        <FadeIn>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px", boxShadow: "0 4px 20px rgba(180,156,120,0.3)",
          }}>
            <span style={{ fontSize: 24, color: "#fff" }}>♡</span>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2 style={{
            fontFamily: serif, fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 600,
            color: "#fff", lineHeight: 1.2, letterSpacing: "-0.02em",
            maxWidth: 580, margin: "0 auto 20px",
          }}>
            You've been carrying this alone long enough.
          </h2>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p style={{
            fontFamily: sans, fontSize: 17, color: "rgba(255,255,255,0.65)",
            lineHeight: 1.75, maxWidth: 480, margin: "0 auto 36px",
          }}>
            Take the free 2-minute assessment. No login, no credit card, no sales pitch. 
            Just an honest picture of where you are — and what comes next.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <a href="#" style={{
            display: "inline-block",
            background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
            color: "#fff", textDecoration: "none", padding: "18px 48px",
            borderRadius: 40, fontSize: 17, fontWeight: 600,
            fontFamily: sans, boxShadow: "0 4px 24px rgba(13,115,119,0.3)",
            transition: "all 0.25s ease", letterSpacing: "0.01em",
          }}
          onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 32px rgba(13,115,119,0.35)"; }}
          onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 24px rgba(13,115,119,0.3)"; }}
          >
            How heavy is your load?
          </a>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════
function Footer() {
  return (
    <footer style={{
      background: "#1a1610", padding: "60px 24px 40px",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 40, marginBottom: 48,
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "#fff", fontSize: 14 }}>♡</span>
            </div>
            <span style={{
              fontFamily: serif, fontWeight: 600, fontSize: 18, color: C.goldLight,
            }}>co-op.care</span>
          </div>
          <p style={{
            fontFamily: sans, fontSize: 13, color: "rgba(255,255,255,0.4)",
            lineHeight: 1.6,
          }}>
            Worker-owned home care cooperative.<br />
            Boulder, Colorado.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 style={{
            fontFamily: sans, fontSize: 12, fontWeight: 600,
            color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em",
            textTransform: "uppercase", marginBottom: 16,
          }}>For You</h4>
          {["Free Assessment", "For Families", "For Caregivers", "Time Bank", "Pricing"].map(l => (
            <a key={l} href="#" style={{
              display: "block", fontFamily: sans, fontSize: 14,
              color: "rgba(255,255,255,0.5)", textDecoration: "none",
              marginBottom: 10, transition: "color 0.2s ease",
            }}
            onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.8)"}
            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
            >{l}</a>
          ))}
        </div>

        <div>
          <h4 style={{
            fontFamily: sans, fontSize: 12, fontWeight: 600,
            color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em",
            textTransform: "uppercase", marginBottom: 16,
          }}>Partners</h4>
          {["For Employers", "For Hospitals", "For Orthopedic Practices", "Cooperative Network"].map(l => (
            <a key={l} href="#" style={{
              display: "block", fontFamily: sans, fontSize: 14,
              color: "rgba(255,255,255,0.5)", textDecoration: "none",
              marginBottom: 10, transition: "color 0.2s ease",
            }}
            onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.8)"}
            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
            >{l}</a>
          ))}
        </div>

        <div>
          <h4 style={{
            fontFamily: sans, fontSize: 12, fontWeight: 600,
            color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em",
            textTransform: "uppercase", marginBottom: 16,
          }}>Connect</h4>
          <a href="mailto:blaine@co-op.care" style={{
            display: "block", fontFamily: sans, fontSize: 14,
            color: C.goldLight, textDecoration: "none", marginBottom: 10,
          }}>blaine@co-op.care</a>
          {["LinkedIn", "Twitter/X", "Instagram"].map(l => (
            <a key={l} href="#" style={{
              display: "block", fontFamily: sans, fontSize: 14,
              color: "rgba(255,255,255,0.5)", textDecoration: "none",
              marginBottom: 10, transition: "color 0.2s ease",
            }}
            onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.8)"}
            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
            >{l}</a>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingTop: 24, display: "flex", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
      }}>
        <p style={{
          fontFamily: sans, fontSize: 12, color: "rgba(255,255,255,0.3)",
        }}>
          © 2026 co-op.care Technologies LLC · Boulder, Colorado
        </p>
        <p style={{
          fontFamily: sans, fontSize: 12, color: "rgba(255,255,255,0.3)",
        }}>
          Worker-owned · Neighbor-powered · Clinically intelligent
        </p>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════
// RESPONSIVE STYLES
// ═══════════════════════════════════════════
const styleTag = document.createElement("style");
styleTag.textContent = `
  * { box-sizing: border-box; margin: 0; }
  html { scroll-behavior: smooth; }
  body { margin: 0; padding: 0; background: #FAF7F2; }
  
  @media (max-width: 768px) {
    .nav-links-desktop { display: none !important; }
  }
`;
document.head.appendChild(styleTag);

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function CoopCareWebsite() {
  return (
    <div style={{ fontFamily: sans, color: C.brown }}>
      <Nav />
      <Hero />
      <CrisisStats />
      <TheProblem />
      <ExtractionVsCoop />
      <HowItWorks />
      <AssessmentCTA />
      <ForFamilies />
      <ForCaregivers />
      <TimeBank />
      <ForEmployers />
      <ForHospitals />
      <AISafety />
      <Pricing />
      <About />
      <FinalCTA />
      <Footer />
    </div>
  );
}
