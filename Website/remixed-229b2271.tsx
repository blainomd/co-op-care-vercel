import { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════════════════════════
   co-op.care — The page that makes anyone want to belong.
   ══════════════════════════════════════════════════════════════ */

const serif = "'Playfair Display', Georgia, serif";
const sans = "'DM Sans', 'Segoe UI', system-ui, sans-serif";

const C = {
  cream: "#faf8f5", warm: "#f5f0ea", white: "#ffffff",
  brown: "#3d3427", brownMid: "#5c5347", brownSoft: "#8a8078", brownPale: "#a89e94",
  teal: "#5b8a8a", tealDeep: "#3d6b6b", tealGlow: "#e8f0ef",
  amber: "#c4956a", amberDeep: "#a08a66", amberGlow: "#fdf6ef", amberWarm: "#e8c9a8",
  gold: "#b49c78", border: "#e0dbd4",
  green: "#5b8a6a", greenGlow: "#edf5ef",
  rose: "#c47a6a",
};

/* ── Intersection observer hook ── */
const useFade = (threshold = 0.1) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVis(true), { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
};

const Fade = ({ children, delay = 0, y = 24 }) => {
  const [ref, vis] = useFade();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0, transform: vis ? "none" : `translateY(${y}px)`,
      transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
    }}>{children}</div>
  );
};

/* ── Animated counter ── */
const Counter = ({ end, duration = 2000, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [ref, vis] = useFade();
  useEffect(() => {
    if (!vis) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [vis, end, duration]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

/* ── Visitor paths ── */
const PATHS = {
  family: { label: "I'm caring for someone I love", icon: "♡", color: C.amber, sub: "Parent, spouse, sibling, friend" },
  caregiver: { label: "I want to do this work — and own it", icon: "◈", color: C.teal, sub: "Professional caregiver or CNA" },
  neighbor: { label: "I want to help my community", icon: "⏰", color: C.gold, sub: "Give time, skills, or presence" },
  employer: { label: "My employees are burning out", icon: "△", color: C.tealDeep, sub: "HR, benefits, or leadership" },
};

/* ── Choice card ── */
const Choice = ({ selected, onClick, children, accent = C.amber }) => (
  <div onClick={onClick} style={{
    background: selected ? `${accent}08` : C.white,
    border: `2px solid ${selected ? accent : C.border}`,
    borderRadius: 14, padding: "16px 18px", cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: selected ? `0 4px 20px ${accent}12` : "none",
  }}
    onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = `${accent}60`; e.currentTarget.style.transform = "translateY(-1px)"; } }}
    onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; } }}
  >{children}</div>
);

export default function CoopCareSignup() {
  const [phase, setPhase] = useState("story"); // story | signup | done
  const [path, setPath] = useState(null); // family | caregiver | neighbor | employer
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", zip: "",
    // family-specific
    caregivingFor: "", urgency: "",
    // caregiver-specific
    experience: "", certification: "",
    // employer-specific
    company: "", employees: "", role: "",
    // neighbor-specific
    canGive: [],
    // universal
    deposit: null, agreeTerms: false, heardFrom: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const topRef = useRef(null);
  const formRef = useRef(null);

  const update = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: undefined })); };
  const scrollTo = (ref) => ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Simulated live counter
  const [memberCount] = useState(47 + Math.floor(Math.random() * 12));
  const [neighborhoodCount] = useState(3 + Math.floor(Math.random() * 2));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = true;
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = true;
    if (!form.zip.trim()) e.zip = true;
    if (step === 1 && form.deposit === null) e.deposit = true;
    if (step === 1 && form.deposit > 0 && !form.agreeTerms) e.agreeTerms = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && validate()) { setStep(1); scrollTo(formRef); }
  };

  const handleSubmit = () => {
    if (validate()) {
      setSubmitting(true);
      setTimeout(() => { setSubmitting(false); setPhase("done"); scrollTo(topRef); }, 2200);
    }
  };

  const startSignup = () => { setPhase("signup"); scrollTo(topRef); };

  const inputStyle = (hasErr) => ({
    width: "100%", padding: "14px 16px", borderRadius: 10, fontSize: 15,
    fontFamily: sans, outline: "none", background: C.cream, color: C.brown,
    border: `1.5px solid ${hasErr ? C.rose : C.border}`,
    transition: "all 0.2s ease", boxSizing: "border-box",
  });

  const labelSt = { fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.brownMid, marginBottom: 6, display: "block" };

  /* ══════════════════════════════════════════════════════════════
     THE STORY — Before any form, earn the signup
     ══════════════════════════════════════════════════════════════ */
  if (phase === "story") return (
    <div style={{ minHeight: "100vh", background: C.cream, overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::selection { background: ${C.amberWarm}; color: ${C.brown}; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(1.8); opacity: 0; } }
        @keyframes grain { 0% { transform: translate(0,0); } 10% { transform: translate(-2%,-2%); } 20% { transform: translate(1%,1%); } 30% { transform: translate(-1%,3%); } 40% { transform: translate(3%,-1%); } 50% { transform: translate(-3%,2%); } 60% { transform: translate(2%,-3%); } 70% { transform: translate(-1%,-1%); } 80% { transform: translate(1%,2%); } 90% { transform: translate(-2%,1%); } 100% { transform: translate(0,0); } }
        details summary::-webkit-details-marker { display: none; }
        details summary { list-style: none; }
      `}</style>

      {/* ── STICKY NAV ── */}
      <nav ref={topRef} style={{
        position: "sticky", top: 0, zIndex: 100, background: "rgba(250,248,245,0.92)",
        backdropFilter: "blur(16px)", borderBottom: `1px solid ${C.border}`,
        padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${C.teal}, ${C.tealDeep})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 14, fontWeight: 700,
          }}>♡</div>
          <span style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, color: C.brown }}>co-op.care</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: C.green,
              position: "relative",
            }}>
              <div style={{
                position: "absolute", inset: -3, borderRadius: "50%", border: `2px solid ${C.green}`,
                animation: "pulse-ring 2s infinite",
              }} />
            </div>
            <span style={{ fontFamily: sans, fontSize: 12, color: C.brownSoft }}>{memberCount} members in Boulder</span>
          </div>
          <button onClick={startSignup} style={{
            background: C.brown, color: C.cream, border: "none", borderRadius: 20,
            padding: "8px 18px", fontSize: 13, fontWeight: 600, fontFamily: sans,
            cursor: "pointer", transition: "all 0.2s ease",
          }}
            onMouseEnter={e => e.target.style.background = C.tealDeep}
            onMouseLeave={e => e.target.style.background = C.brown}
          >Join</button>
        </div>
      </nav>

      {/* ══════ HERO ══════ */}
      <section style={{
        minHeight: "85vh", display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "80px 24px 60px", position: "relative", overflow: "hidden",
        background: `linear-gradient(175deg, ${C.amberGlow} 0%, ${C.cream} 35%, ${C.tealGlow} 100%)`,
      }}>
        {/* Subtle texture overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <Fade>
            <p style={{
              fontFamily: sans, fontSize: 13, fontWeight: 500, color: C.teal,
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 24,
              textAlign: "center",
            }}>Boulder, Colorado</p>
          </Fade>
          <Fade delay={0.15}>
            <h1 style={{
              fontFamily: serif, fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 600,
              color: C.brown, lineHeight: 1.1, textAlign: "center", marginBottom: 24,
            }}>
              Everyone you love<br />
              <span style={{ color: C.amber }}>will need care.</span>
            </h1>
          </Fade>
          <Fade delay={0.3}>
            <p style={{
              fontFamily: serif, fontStyle: "italic", fontSize: "clamp(18px, 2.5vw, 22px)",
              color: C.brownMid, lineHeight: 1.7, textAlign: "center",
              maxWidth: 520, margin: "0 auto 40px",
            }}>
              Including you. The question isn't whether — it's who shows up when they do. We built a place where the answer is: your neighbors.
            </p>
          </Fade>
          <Fade delay={0.45}>
            <div style={{ textAlign: "center" }}>
              <button onClick={startSignup} style={{
                background: `linear-gradient(135deg, ${C.amber}, ${C.amberDeep})`,
                color: "#fff", border: "none", borderRadius: 32, padding: "18px 48px",
                fontSize: 18, fontWeight: 600, fontFamily: sans, cursor: "pointer",
                boxShadow: "0 6px 32px rgba(196,149,106,0.3)", transition: "all 0.3s ease",
                letterSpacing: "0.01em",
              }}
                onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 40px rgba(196,149,106,0.4)"; }}
                onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "0 6px 32px rgba(196,149,106,0.3)"; }}
              >Join the cooperative</button>
              <p style={{ fontFamily: sans, fontSize: 13, color: C.brownPale, marginTop: 16 }}>
                Free to start · No credit card · Takes 3 minutes
              </p>
            </div>
          </Fade>
        </div>
      </section>

      {/* ══════ THE THREE SENTENCES ══════ */}
      <section style={{ background: C.white, padding: "80px 24px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <Fade>
            <p style={{
              fontFamily: serif, fontSize: "clamp(22px, 3.5vw, 30px)", fontWeight: 500,
              color: C.brown, lineHeight: 1.55, textAlign: "center",
            }}>
              <span style={{ color: C.amber }}>co-op.care</span> is not a company. It's a neighborhood that organized itself — so when the call comes at 2am, you're not alone. The caregivers who show up at your door <em>own</em> the cooperative. Every dollar stays in Boulder. And every member gets a vote.
            </p>
          </Fade>
        </div>
      </section>

      {/* ══════ THE STORIES — See yourself ══════ */}
      <section style={{
        padding: "80px 24px",
        background: `linear-gradient(180deg, ${C.cream} 0%, ${C.warm} 100%)`,
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Fade>
            <p style={{
              fontFamily: sans, fontSize: 12, fontWeight: 600, color: C.teal,
              letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center", marginBottom: 12,
            }}>Which one are you?</p>
            <h2 style={{
              fontFamily: serif, fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 600,
              color: C.brown, textAlign: "center", lineHeight: 1.2, marginBottom: 48,
            }}>
              Four doors. One community.
            </h2>
          </Fade>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {/* ── THE DAUGHTER ── */}
            <Fade delay={0}>
              <div style={{
                background: C.white, borderRadius: 20, padding: "32px 28px",
                border: `1px solid ${C.border}`, position: "relative", overflow: "hidden",
                transition: "box-shadow 0.3s ease",
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 40px ${C.amber}12`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{
                  position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%",
                  background: `${C.amber}08`,
                }} />
                <div style={{
                  fontSize: 28, marginBottom: 16, width: 52, height: 52, borderRadius: 14,
                  background: `linear-gradient(135deg, ${C.amberGlow}, ${C.amber}15)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>♡</div>
                <h3 style={{ fontFamily: serif, fontSize: 21, fontWeight: 600, color: C.brown, marginBottom: 10 }}>
                  "I'm the one everyone calls."
                </h3>
                <p style={{ fontFamily: sans, fontSize: 15, color: C.brownMid, lineHeight: 1.7, marginBottom: 20 }}>
                  You manage your mother's medications before your own coffee. You leave work early and stay late to make up for it. You haven't slept through the night in months. You love her fiercely — and you're disappearing.
                </p>
                <div style={{
                  background: C.amberGlow, borderRadius: 10, padding: "14px 16px",
                  border: `1px solid ${C.amber}10`,
                }}>
                  <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.amber, marginBottom: 4 }}>What changes</p>
                  <p style={{ fontFamily: sans, fontSize: 13, color: C.brownMid, lineHeight: 1.6 }}>
                    A care coordinator who knows your mom's name. Professional caregivers who show up — the same person, every week. Neighbors who cover the Tuesday gap. And a 2am number that's not just yours.
                  </p>
                </div>
              </div>
            </Fade>

            {/* ── THE CAREGIVER ── */}
            <Fade delay={0.1}>
              <div style={{
                background: C.white, borderRadius: 20, padding: "32px 28px",
                border: `1px solid ${C.border}`, position: "relative", overflow: "hidden",
                transition: "box-shadow 0.3s ease",
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 40px ${C.teal}12`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{
                  position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%",
                  background: `${C.teal}08`,
                }} />
                <div style={{
                  fontSize: 28, marginBottom: 16, width: 52, height: 52, borderRadius: 14,
                  background: `linear-gradient(135deg, ${C.tealGlow}, ${C.teal}15)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>◈</div>
                <h3 style={{ fontFamily: serif, fontSize: 21, fontWeight: 600, color: C.brown, marginBottom: 10 }}>
                  "I do sacred work for poverty wages."
                </h3>
                <p style={{ fontFamily: sans, fontSize: 15, color: C.brownMid, lineHeight: 1.7, marginBottom: 20 }}>
                  You hold someone's hand while they take their last breath — then drive to your second job. The agency takes 60% of what families pay. You're worth $30/hour and you make $14. You deserve better.
                </p>
                <div style={{
                  background: C.tealGlow, borderRadius: 10, padding: "14px 16px",
                  border: `1px solid ${C.teal}10`,
                }}>
                  <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.teal, marginBottom: 4 }}>What changes</p>
                  <p style={{ fontFamily: sans, fontSize: 13, color: C.brownMid, lineHeight: 1.6 }}>
                    $25–28/hour, W-2 with benefits. Equity ownership in the cooperative — real shares, real governance. Your voice on the board. After 5 years: $52K in your Internal Capital Account.
                  </p>
                </div>
              </div>
            </Fade>

            {/* ── THE NEIGHBOR ── */}
            <Fade delay={0.2}>
              <div style={{
                background: C.white, borderRadius: 20, padding: "32px 28px",
                border: `1px solid ${C.border}`, position: "relative", overflow: "hidden",
                transition: "box-shadow 0.3s ease",
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 40px ${C.gold}12`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{
                  position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%",
                  background: `${C.gold}08`,
                }} />
                <div style={{
                  fontSize: 28, marginBottom: 16, width: 52, height: 52, borderRadius: 14,
                  background: `linear-gradient(135deg, ${C.amberGlow}, ${C.gold}15)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>⏰</div>
                <h3 style={{ fontFamily: serif, fontSize: 21, fontWeight: 600, color: C.brown, marginBottom: 10 }}>
                  "I want to help. I just don't know how."
                </h3>
                <p style={{ fontFamily: sans, fontSize: 15, color: C.brownMid, lineHeight: 1.7, marginBottom: 20 }}>
                  You see the house with the overgrown lawn. You know the woman next door hasn't left in weeks. You'd do something if someone just told you what. You don't need a medical degree — you need a neighbor who needs you.
                </p>
                <div style={{
                  background: `${C.gold}08`, borderRadius: 10, padding: "14px 16px",
                  border: `1px solid ${C.gold}12`,
                }}>
                  <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.gold, marginBottom: 4 }}>What changes</p>
                  <p style={{ fontFamily: sans, fontSize: 13, color: C.brownMid, lineHeight: 1.6 }}>
                    Join the Time Bank. One hour of help = one hour in your account. Drive someone's dad to PT. Sit with someone so a daughter can sleep. When your day comes, your hours are waiting.
                  </p>
                </div>
              </div>
            </Fade>

            {/* ── THE EMPLOYER ── */}
            <Fade delay={0.3}>
              <div style={{
                background: C.white, borderRadius: 20, padding: "32px 28px",
                border: `1px solid ${C.border}`, position: "relative", overflow: "hidden",
                transition: "box-shadow 0.3s ease",
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 40px ${C.tealDeep}12`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{
                  position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%",
                  background: `${C.tealDeep}08`,
                }} />
                <div style={{
                  fontSize: 28, marginBottom: 16, width: 52, height: 52, borderRadius: 14,
                  background: `linear-gradient(135deg, ${C.tealGlow}, ${C.tealDeep}15)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>△</div>
                <h3 style={{ fontFamily: serif, fontSize: 21, fontWeight: 600, color: C.brown, marginBottom: 10 }}>
                  "My best people keep leaving."
                </h3>
                <p style={{ fontFamily: sans, fontSize: 15, color: C.brownMid, lineHeight: 1.7, marginBottom: 20 }}>
                  23% of your workforce are secret caregivers. They cost you $5,365 each in absenteeism and turnover. They're the ones who never complain — and one day just hand in their resignation. You can't fix what you can't see.
                </p>
                <div style={{
                  background: `${C.tealDeep}06`, borderRadius: 10, padding: "14px 16px",
                  border: `1px solid ${C.tealDeep}10`,
                }}>
                  <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.tealDeep, marginBottom: 4 }}>What changes</p>
                  <p style={{ fontFamily: sans, fontSize: 13, color: C.brownMid, lineHeight: 1.6 }}>
                    A $3–6/month employee benefit that identifies hidden caregiver strain (anonymized), coordinates real help, and pays for itself 74:1. Free 90-day pilot. BVSD is already in.
                  </p>
                </div>
              </div>
            </Fade>
          </div>
        </div>
      </section>

      {/* ══════ THE DIFFERENCE — visceral, not a table ══════ */}
      <section style={{ background: C.white, padding: "80px 24px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <Fade>
            <h2 style={{
              fontFamily: serif, fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 600,
              color: C.brown, textAlign: "center", lineHeight: 1.25, marginBottom: 16,
            }}>
              Here's what happens to your<br />
              <span style={{ color: C.amber }}>$30/hour</span> right now.
            </h2>
            <p style={{
              fontFamily: sans, fontSize: 16, color: C.brownMid, textAlign: "center",
              lineHeight: 1.7, marginBottom: 48, maxWidth: 480, margin: "0 auto 48px",
            }}>
              When a family pays for home care, this is where the money goes — depending on who they hire.
            </p>
          </Fade>

          {/* Revenue split visualization */}
          <Fade delay={0.1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {/* Traditional agency */}
              <div>
                <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.brownSoft, marginBottom: 10, letterSpacing: "0.04em" }}>
                  TRADITIONAL AGENCY
                </div>
                <div style={{ display: "flex", height: 48, borderRadius: 12, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ width: "55%", background: `linear-gradient(135deg, #d4695a, #c45a4a)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, color: "#fff" }}>55% → Shareholders</span>
                  </div>
                  <div style={{ width: "45%", background: `linear-gradient(135deg, ${C.brownSoft}, ${C.brownPale})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: "#fff" }}>45% → Caregiver ($13.50/hr)</span>
                  </div>
                </div>
                <p style={{ fontFamily: sans, fontSize: 13, color: C.brownPale }}>77% annual turnover · Different person every week · Care quality? Unknown.</p>
              </div>

              {/* co-op.care */}
              <div>
                <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.teal, marginBottom: 10, letterSpacing: "0.04em" }}>
                  CO-OP.CARE COOPERATIVE
                </div>
                <div style={{ display: "flex", height: 48, borderRadius: 12, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ width: "88%", background: `linear-gradient(135deg, ${C.teal}, ${C.tealDeep})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, color: "#fff" }}>88% → Caregiver-owners ($25–28/hr + equity)</span>
                  </div>
                  <div style={{ width: "7%", background: `linear-gradient(135deg, ${C.gold}, ${C.amberDeep})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: sans, fontSize: 10, fontWeight: 600, color: "#fff" }}>7%</span>
                  </div>
                  <div style={{ width: "5%", background: C.amber, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: sans, fontSize: 10, fontWeight: 600, color: "#fff" }}>5%</span>
                  </div>
                </div>
                <p style={{ fontFamily: sans, fontSize: 13, color: C.brownPale }}>
                  7% reserves · 5% federation technology · 0% to Wall Street · Same caregiver every week · Clinical-grade documentation.
                </p>
              </div>
            </div>
          </Fade>

          <Fade delay={0.2}>
            <div style={{
              marginTop: 40, background: C.cream, borderRadius: 14, padding: "22px 24px",
              border: `1px solid ${C.border}`, textAlign: "center",
            }}>
              <p style={{
                fontFamily: serif, fontSize: 18, fontWeight: 500, color: C.brown, fontStyle: "italic", lineHeight: 1.6,
              }}>
                "When AI eliminates healthcare friction, who captures the savings? In the venture model: shareholders. In ours: the workers and families. That's not idealism. That's the math."
              </p>
            </div>
          </Fade>
        </div>
      </section>

      {/* ══════ THE PROOF — not claims, numbers ══════ */}
      <section style={{ padding: "80px 24px", background: C.cream, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Fade>
            <h2 style={{
              fontFamily: serif, fontSize: "clamp(26px, 4vw, 34px)", fontWeight: 600,
              color: C.brown, textAlign: "center", marginBottom: 48,
            }}>
              Cooperatives aren't an experiment.<br />
              <span style={{ color: C.teal }}>They're the evidence.</span>
            </h2>
          </Fade>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { n: "26", label: "home care cooperatives in the US", sub: "We're building #27", color: C.amber },
              { n: "40", label: "years CHCA has operated", sub: "Bronx, NY — nation's largest", color: C.teal },
              { n: "50%", label: "less turnover than agencies", sub: "UCLA/JAMA research", color: C.green },
              { n: "88%", label: "of revenue to worker-owners", sub: "vs 40-45% at traditional agencies", color: C.gold },
              { n: "820", label: "worker co-ops in America", sub: "Up 34% since 2020", color: C.tealDeep },
              { n: "$52K", label: "equity per caregiver (5 years)", sub: "Real ownership, real wealth", color: C.amber },
            ].map((stat, i) => (
              <Fade key={i} delay={i * 0.06}>
                <div style={{
                  background: C.white, borderRadius: 14, padding: "22px 18px", textAlign: "center",
                  border: `1px solid ${C.border}`, transition: "transform 0.3s ease",
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}
                >
                  <div style={{ fontFamily: serif, fontSize: 32, fontWeight: 700, color: stat.color }}>{stat.n}</div>
                  <div style={{ fontFamily: sans, fontSize: 13, color: C.brownMid, marginTop: 4, lineHeight: 1.4 }}>{stat.label}</div>
                  <div style={{ fontFamily: sans, fontSize: 11, color: C.brownPale, marginTop: 6 }}>{stat.sub}</div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ HOW IT ACTUALLY WORKS ══════ */}
      <section style={{ background: C.white, padding: "80px 24px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <Fade>
            <h2 style={{
              fontFamily: serif, fontSize: "clamp(24px, 3.5vw, 32px)", fontWeight: 600,
              color: C.brown, textAlign: "center", marginBottom: 8,
            }}>What your first 90 days look like</h2>
            <p style={{ fontFamily: sans, fontSize: 15, color: C.brownSoft, textAlign: "center", marginBottom: 44 }}>
              Honestly. No surprises. No upsell at day 89.
            </p>
          </Fade>

          {[
            { w: "Day 1", t: "You take a breath", d: "A 2-minute assessment that shows — honestly — how things are. A welcome from a real person. For the first time, someone knows." },
            { w: "Week 1", t: "Someone calls you", d: "Not a chatbot. A care coordinator from Boulder who asks about your family, your schedule, your breaking points. Together you build a plan that fits inside your real life." },
            { w: "Weeks 2–8", t: "The help arrives", d: "Professional caregivers matched to your family. Time Bank neighbors for the everyday gaps. A monthly circle with people who finally understand. The phone calls during lunch start to slow down." },
            { w: "Day 90", t: "You decide", d: "Stay as a cooperative member — with ownership, governance, and a voice. Or walk away with everything you've built: your care plan, your connections, your data. No penalty. No guilt. No fine print." },
          ].map((phase, i) => (
            <Fade key={i} delay={i * 0.08}>
              <div style={{ display: "flex", gap: 20, marginBottom: 32, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, textAlign: "center", width: 60 }}>
                  <div style={{
                    background: `linear-gradient(135deg, ${C.amber}, ${C.amberDeep})`,
                    borderRadius: 8, padding: "4px 10px", display: "inline-block",
                    fontFamily: sans, fontSize: 11, fontWeight: 700, color: "#fff",
                  }}>{phase.w}</div>
                  {i < 3 && <div style={{ width: 2, height: 28, background: C.border, margin: "8px auto 0" }} />}
                </div>
                <div>
                  <div style={{ fontFamily: sans, fontSize: 16, fontWeight: 600, color: C.brown, marginBottom: 4 }}>{phase.t}</div>
                  <div style={{ fontFamily: sans, fontSize: 14, color: C.brownSoft, lineHeight: 1.7 }}>{phase.d}</div>
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ══════ COMMUNITY MOMENTUM ══════ */}
      <section style={{
        padding: "80px 24px", borderTop: `1px solid ${C.border}`,
        background: `linear-gradient(170deg, ${C.tealGlow} 0%, ${C.cream} 100%)`,
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <Fade>
            <p style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, color: C.teal, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
              Growing right now
            </p>
            <h2 style={{ fontFamily: serif, fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 600, color: C.brown, marginBottom: 32, lineHeight: 1.25 }}>
              <Counter end={memberCount} prefix="" /> neighbors.<br />
              <span style={{ color: C.teal }}><Counter end={neighborhoodCount} /> neighborhoods.</span><br />
              One cooperative.
            </h2>
          </Fade>

          <Fade delay={0.1}>
            <div style={{
              background: C.white, borderRadius: 16, padding: "28px 24px", border: `1px solid ${C.border}`,
              marginBottom: 32,
            }}>
              <p style={{ fontFamily: sans, fontSize: 14, color: C.brownMid, lineHeight: 1.7, marginBottom: 16 }}>
                When 50 neighbors join within a 2-mile radius, something extraordinary happens: a care coordinator is assigned, professional caregivers dispatch from your neighborhood, and same-day emergency respite activates. At 200, the neighborhood incorporates as its own worker-owned cooperative.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                {["Seed", "Sprout", "Root", "Village", "Co-op"].map((level, i) => (
                  <div key={level} style={{
                    padding: "6px 12px", borderRadius: 20, fontFamily: sans, fontSize: 11, fontWeight: 600,
                    background: i < neighborhoodCount ? `${C.teal}15` : C.cream,
                    color: i < neighborhoodCount ? C.teal : C.brownPale,
                    border: `1px solid ${i < neighborhoodCount ? `${C.teal}25` : C.border}`,
                  }}>{level}</div>
                ))}
              </div>
            </div>
          </Fade>

          <Fade delay={0.15}>
            <p style={{
              fontFamily: serif, fontStyle: "italic", fontSize: 17, color: C.brownMid, lineHeight: 1.6,
              maxWidth: 440, margin: "0 auto",
            }}>
              The care you need tomorrow is built by the community you join today.
            </p>
          </Fade>
        </div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section style={{
        padding: "96px 24px", textAlign: "center",
        background: `linear-gradient(175deg, ${C.cream} 0%, ${C.amberGlow} 100%)`,
        borderTop: `1px solid ${C.border}`,
      }}>
        <Fade>
          <h2 style={{
            fontFamily: serif, fontSize: "clamp(30px, 5vw, 44px)", fontWeight: 600,
            color: C.brown, lineHeight: 1.15, marginBottom: 20, maxWidth: 520, margin: "0 auto 20px",
          }}>
            You already know<br />this is coming.
          </h2>
          <p style={{
            fontFamily: sans, fontSize: 17, color: C.brownMid, lineHeight: 1.7,
            maxWidth: 440, margin: "0 auto 36px",
          }}>
            For your parents. For your partner. For you. The only question is whether you'll have a community around you when it does — or a search engine and a prayer.
          </p>
          <button onClick={startSignup} style={{
            background: `linear-gradient(135deg, ${C.amber}, ${C.amberDeep})`,
            color: "#fff", border: "none", borderRadius: 32, padding: "18px 52px",
            fontSize: 18, fontWeight: 600, fontFamily: sans, cursor: "pointer",
            boxShadow: "0 6px 32px rgba(196,149,106,0.3)", transition: "all 0.3s ease",
          }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.target.style.transform = "none"; }}
          >I'm ready</button>
          <p style={{ fontFamily: sans, fontSize: 13, color: C.brownPale, marginTop: 16 }}>
            Free to start · 3 minutes · No one does this alone
          </p>
        </Fade>
      </section>

      {/* Footer */}
      <footer style={{ background: C.brown, padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: serif, fontSize: 17, fontWeight: 600, color: C.cream, marginBottom: 6 }}>co-op.care</div>
        <p style={{ fontFamily: sans, fontSize: 12, color: `${C.cream}60` }}>Worker-owned cooperative home care · Boulder, Colorado · The 27th in America</p>
        <p style={{ fontFamily: sans, fontSize: 11, color: `${C.cream}40`, marginTop: 8 }}>
          <a href="mailto:orthoblaino@gmail.com" style={{ color: C.amberWarm }}>orthoblaino@gmail.com</a>
        </p>
      </footer>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════
     SIGNUP FLOW — Adaptive to visitor type
     ══════════════════════════════════════════════════════════════ */
  if (phase === "done") return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes pop { 0% { transform: scale(0); } 60% { transform: scale(1.15); } 100% { transform: scale(1); } }
      `}</style>
      <nav ref={topRef} style={{
        padding: "14px 24px", borderBottom: `1px solid ${C.border}`, background: C.white,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `linear-gradient(135deg, ${C.teal}, ${C.tealDeep})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 14,
        }}>♡</div>
        <span style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, color: C.brown }}>co-op.care</span>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <Fade>
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%", margin: "0 auto 28px",
              background: `linear-gradient(135deg, ${C.green}, ${C.teal})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "pop 0.5s ease", boxShadow: `0 8px 36px ${C.teal}20`,
            }}>
              <span style={{ color: "#fff", fontSize: 36 }}>✓</span>
            </div>
            <h2 style={{ fontFamily: serif, fontSize: 32, fontWeight: 600, color: C.brown, marginBottom: 12 }}>
              Welcome home, {form.firstName}.
            </h2>
            <p style={{
              fontFamily: sans, fontSize: 16, color: C.brownMid, lineHeight: 1.7, marginBottom: 36,
            }}>
              {path === "family" && "You're not alone anymore. A care coordinator will reach out this week to learn about your family."}
              {path === "caregiver" && "You just joined a cooperative that believes your work is worth what families actually pay. We'll be in touch about next steps."}
              {path === "neighbor" && `You're neighbor #${memberCount + 1}. Every person who joins brings Boulder closer to the density where care becomes infrastructure.`}
              {path === "employer" && "We'll send you the pilot details and ROI analysis this week. Your employees don't know they need this yet — but you do."}
              {!path && "You're part of something that will outlast all of us. Check your email for next steps."}
            </p>

            {/* Summary */}
            <div style={{
              background: C.white, borderRadius: 16, padding: "24px 22px",
              border: `1px solid ${C.border}`, textAlign: "left", marginBottom: 24,
            }}>
              <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: C.amber, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
                Your enrollment
              </div>
              {[
                { l: "Name", v: `${form.firstName} ${form.lastName || ""}`.trim() },
                { l: "Email", v: form.email },
                path && { l: "Path", v: PATHS[path]?.label },
                form.zip && { l: "ZIP", v: form.zip },
                { l: "Pilot", v: "90 days free" },
                { l: "Deposit", v: form.deposit > 0 ? `$${form.deposit} fully refundable` : "None — add one anytime" },
              ].filter(Boolean).map((r, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", paddingBottom: 10, marginBottom: 10,
                  borderBottom: `1px solid ${C.border}`, gap: 16,
                }}>
                  <span style={{ fontFamily: sans, fontSize: 12, color: C.brownPale }}>{r.l}</span>
                  <span style={{ fontFamily: sans, fontSize: 13, fontWeight: 500, color: C.brown, textAlign: "right" }}>{r.v}</span>
                </div>
              ))}
            </div>

            {/* Next steps */}
            <div style={{
              background: `linear-gradient(135deg, ${C.tealGlow}, ${C.amberGlow})`,
              borderRadius: 14, padding: "22px 20px", textAlign: "left",
            }}>
              <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.brown, marginBottom: 12 }}>What happens next</div>
              {[
                { w: "Today", t: "Welcome email with your CII assessment link" },
                { w: "This week", t: path === "employer" ? "Pilot details + ROI analysis for your team" : "A care coordinator reaches out" },
                { w: "2 weeks", t: path === "caregiver" ? "Orientation + your first matched family" : "Your personalized care plan + Time Bank match" },
                { w: "Day 90", t: "You decide: cooperative membership, or take everything with you" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                  <div style={{
                    background: C.amberGlow, borderRadius: 6, padding: "3px 8px", flexShrink: 0,
                    fontFamily: sans, fontSize: 10, fontWeight: 600, color: C.amber,
                  }}>{item.w}</div>
                  <div style={{ fontFamily: sans, fontSize: 13, color: C.brownMid, lineHeight: 1.5 }}>{item.t}</div>
                </div>
              ))}
            </div>

            <p style={{ fontFamily: sans, fontSize: 13, color: C.brownPale, marginTop: 24 }}>
              Questions anytime → <strong style={{ color: C.brownMid }}>orthoblaino@gmail.com</strong>
            </p>
          </div>
        </Fade>
      </div>
    </div>
  );

  /* ── SIGNUP FORM ── */
  return (
    <div style={{ minHeight: "100vh", background: C.cream }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        input:focus { border-color: ${C.amber} !important; box-shadow: 0 0 0 3px ${C.amber}12 !important; }
        ::selection { background: ${C.amberWarm}; color: ${C.brown}; }
        @keyframes breathe { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      {/* Nav */}
      <nav ref={topRef} style={{
        position: "sticky", top: 0, zIndex: 100, background: "rgba(250,248,245,0.95)",
        backdropFilter: "blur(14px)", borderBottom: `1px solid ${C.border}`,
        padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${C.teal}, ${C.tealDeep})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 14,
          }}>♡</div>
          <span style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, color: C.brown }}>co-op.care</span>
        </div>
        <button onClick={() => setPhase("story")} style={{
          background: "none", border: "none", fontFamily: sans, fontSize: 13,
          color: C.brownPale, cursor: "pointer",
        }}>← Back</button>
      </nav>

      <div ref={formRef} style={{ padding: "48px 24px 80px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>

          {/* Step dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 36 }}>
            {[0, 1].map(i => (
              <div key={i} style={{
                width: i === step ? 28 : 8, height: 8, borderRadius: 4,
                background: i <= step ? C.amber : C.border, transition: "all 0.4s ease",
              }} />
            ))}
          </div>

          {/* ── STEP 0: Who are you + info ── */}
          {step === 0 && (
            <Fade>
              <h2 style={{
                fontFamily: serif, fontSize: 28, fontWeight: 600, color: C.brown,
                textAlign: "center", marginBottom: 8,
              }}>Tell us about you.</h2>
              <p style={{
                fontFamily: sans, fontSize: 15, color: C.brownSoft, textAlign: "center",
                marginBottom: 36, maxWidth: 400, margin: "0 auto 36px",
              }}>
                Everything is confidential. We use this to match you with the right people and resources.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Path selector */}
                <div>
                  <label style={labelSt}>What brings you here?</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {Object.entries(PATHS).map(([key, p]) => (
                      <Choice key={key} selected={path === key} onClick={() => setPath(key)} accent={p.color}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <span style={{ fontSize: 18, lineHeight: 1 }}>{p.icon}</span>
                          <div>
                            <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: path === key ? p.color : C.brown, lineHeight: 1.3 }}>
                              {p.label}
                            </div>
                            <div style={{ fontFamily: sans, fontSize: 11, color: C.brownPale, marginTop: 2 }}>{p.sub}</div>
                          </div>
                        </div>
                      </Choice>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={labelSt}>First name *</label>
                    <input style={inputStyle(errors.firstName)} placeholder="Maria" value={form.firstName}
                      onChange={e => update("firstName", e.target.value)} />
                  </div>
                  <div>
                    <label style={labelSt}>Last name</label>
                    <input style={inputStyle(false)} placeholder="Gonzalez" value={form.lastName}
                      onChange={e => update("lastName", e.target.value)} />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={labelSt}>Email *</label>
                  <input style={inputStyle(errors.email)} placeholder="maria@email.com" value={form.email}
                    onChange={e => update("email", e.target.value)} type="email" />
                </div>

                {/* ZIP */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={labelSt}>ZIP code *</label>
                    <input style={inputStyle(errors.zip)} placeholder="80302" value={form.zip}
                      onChange={e => update("zip", e.target.value)} />
                    <div style={{ fontFamily: sans, fontSize: 11, color: C.brownPale, marginTop: 4 }}>
                      Helps us track neighborhood density
                    </div>
                  </div>
                  <div>
                    <label style={labelSt}>Phone <span style={{ fontWeight: 400, color: C.brownPale }}>(optional)</span></label>
                    <input style={inputStyle(false)} placeholder="(303) 555-0127" value={form.phone}
                      onChange={e => update("phone", e.target.value)} type="tel" />
                  </div>
                </div>

                {/* Path-specific fields */}
                {path === "family" && (
                  <Fade>
                    <div>
                      <label style={labelSt}>Who are you caring for?</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {["Parent / in-law", "Spouse / partner", "Sibling", "Friend / neighbor", "Myself", "Not yet — preparing"].map(opt => (
                          <Choice key={opt} selected={form.caregivingFor === opt} onClick={() => update("caregivingFor", opt)}>
                            <span style={{ fontFamily: sans, fontSize: 13, color: form.caregivingFor === opt ? C.amber : C.brownMid }}>{opt}</span>
                          </Choice>
                        ))}
                      </div>
                    </div>
                  </Fade>
                )}

                {path === "caregiver" && (
                  <Fade>
                    <div>
                      <label style={labelSt}>Experience level</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {["CNA / HHA certified", "Professional experience", "Informal caregiver", "New — want training"].map(opt => (
                          <Choice key={opt} selected={form.experience === opt} onClick={() => update("experience", opt)} accent={C.teal}>
                            <span style={{ fontFamily: sans, fontSize: 13, color: form.experience === opt ? C.teal : C.brownMid }}>{opt}</span>
                          </Choice>
                        ))}
                      </div>
                    </div>
                  </Fade>
                )}

                {path === "employer" && (
                  <Fade>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div>
                        <label style={labelSt}>Organization</label>
                        <input style={inputStyle(false)} placeholder="Company or district" value={form.company}
                          onChange={e => update("company", e.target.value)} />
                      </div>
                      <div>
                        <label style={labelSt}>Approx. employees</label>
                        <input style={inputStyle(false)} placeholder="e.g. 500" value={form.employees}
                          onChange={e => update("employees", e.target.value)} />
                      </div>
                    </div>
                  </Fade>
                )}

                {path === "neighbor" && (
                  <Fade>
                    <div>
                      <label style={labelSt}>What can you give? <span style={{ fontWeight: 400, color: C.brownPale }}>(select any)</span></label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {["Time (rides, visits, errands)", "Skills (repairs, tech help, cooking)", "Presence (check-ins, company)", "Resources (equipment, funding)"].map(opt => {
                          const sel = form.canGive.includes(opt);
                          return (
                            <Choice key={opt} selected={sel} accent={C.gold}
                              onClick={() => update("canGive", sel ? form.canGive.filter(x => x !== opt) : [...form.canGive, opt])}>
                              <span style={{ fontFamily: sans, fontSize: 13, color: sel ? C.gold : C.brownMid }}>{opt}</span>
                            </Choice>
                          );
                        })}
                      </div>
                    </div>
                  </Fade>
                )}

                {/* How did you hear */}
                <div>
                  <label style={labelSt}>How did you hear about us? <span style={{ fontWeight: 400, color: C.brownPale }}>(optional)</span></label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {["BVSD", "Nextdoor", "A friend", "Social media", "BCH / hospital", "Other"].map(opt => (
                      <div key={opt} onClick={() => update("heardFrom", opt)} style={{
                        padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                        background: form.heardFrom === opt ? `${C.amber}12` : C.white,
                        border: `1.5px solid ${form.heardFrom === opt ? C.amber : C.border}`,
                        fontFamily: sans, fontSize: 13, color: form.heardFrom === opt ? C.amber : C.brownSoft,
                        fontWeight: form.heardFrom === opt ? 600 : 400, transition: "all 0.2s ease",
                      }}>{opt}</div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                  <button onClick={handleNext} style={{
                    background: `linear-gradient(135deg, ${C.amber}, ${C.amberDeep})`,
                    color: "#fff", border: "none", borderRadius: 28, padding: "15px 40px",
                    fontSize: 16, fontWeight: 600, fontFamily: sans, cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(196,149,106,0.2)", transition: "all 0.3s ease",
                  }}>Continue →</button>
                </div>
              </div>
            </Fade>
          )}

          {/* ── STEP 1: Deposit ── */}
          {step === 1 && (
            <Fade>
              <h2 style={{
                fontFamily: serif, fontSize: 28, fontWeight: 600, color: C.brown,
                textAlign: "center", marginBottom: 8,
              }}>One last thing, {form.firstName}.</h2>
              <p style={{
                fontFamily: sans, fontSize: 15, color: C.brownSoft, textAlign: "center",
                maxWidth: 420, margin: "0 auto 36px",
              }}>
                Your 90-day pilot is completely free. A refundable deposit holds your cooperative membership spot — but it's totally optional.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Free pilot badge */}
                <div style={{
                  background: C.greenGlow, borderRadius: 14, padding: "16px 18px",
                  border: `1.5px solid ${C.green}18`, display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", background: C.green, flexShrink: 0,
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                  }}>✓</div>
                  <div>
                    <div style={{ fontFamily: sans, fontSize: 15, fontWeight: 600, color: C.green }}>90 days free — confirmed</div>
                    <div style={{ fontFamily: sans, fontSize: 13, color: C.brownMid, marginTop: 2 }}>Full access, no credit card required</div>
                  </div>
                </div>

                {/* Options */}
                <Choice selected={form.deposit === 0} onClick={() => update("deposit", 0)} accent={C.teal}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: sans, fontSize: 15, fontWeight: 600, color: form.deposit === 0 ? C.teal : C.brown }}>Just the free pilot</div>
                      <div style={{ fontFamily: sans, fontSize: 13, color: C.brownSoft, marginTop: 3 }}>Full access. Decide about membership later.</div>
                    </div>
                    <div style={{ fontFamily: serif, fontSize: 24, fontWeight: 700, color: form.deposit === 0 ? C.teal : C.brownPale }}>$0</div>
                  </div>
                </Choice>

                <Choice selected={form.deposit === 50} onClick={() => update("deposit", 50)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: sans, fontSize: 15, fontWeight: 600, color: form.deposit === 50 ? C.amber : C.brown }}>Hold my cooperative spot</span>
                        <span style={{
                          background: C.amberGlow, color: C.amber, fontSize: 10, fontWeight: 700,
                          padding: "2px 8px", borderRadius: 10, fontFamily: sans,
                        }}>MOST CHOOSE THIS</span>
                      </div>
                      <div style={{ fontFamily: sans, fontSize: 13, color: C.brownSoft, marginTop: 3 }}>100% refundable anytime. Credits toward first month.</div>
                    </div>
                    <div style={{ fontFamily: serif, fontSize: 24, fontWeight: 700, color: form.deposit === 50 ? C.amber : C.brownPale }}>$50</div>
                  </div>
                </Choice>

                <Choice selected={form.deposit === 150} onClick={() => update("deposit", 150)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: sans, fontSize: 15, fontWeight: 600, color: form.deposit === 150 ? C.amber : C.brown }}>Founding member</div>
                      <div style={{ fontFamily: sans, fontSize: 13, color: C.brownSoft, marginTop: 3 }}>100% refundable. Priority matching, 2x equity, founding recognition.</div>
                    </div>
                    <div style={{ fontFamily: serif, fontSize: 24, fontWeight: 700, color: form.deposit === 150 ? C.amber : C.brownPale }}>$150</div>
                  </div>
                </Choice>

                {errors.deposit && <div style={{ fontFamily: sans, fontSize: 12, color: C.rose }}>Please choose an option</div>}

                {/* Refund + checkbox */}
                {form.deposit > 0 && (
                  <Fade>
                    <div style={{
                      background: C.amberGlow, borderRadius: 12, padding: "16px 18px",
                      border: `1px solid ${C.amber}10`,
                    }}>
                      <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.amber, marginBottom: 6 }}>♡ Our promise</div>
                      <p style={{ fontFamily: sans, fontSize: 13, color: C.brownMid, lineHeight: 1.65, marginBottom: 12 }}>
                        ${form.deposit} — <strong>fully refundable at any time</strong>. No questions. No waiting. Email us and it's back. This is a cooperative, not a contract.
                      </p>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}
                        onClick={() => update("agreeTerms", !form.agreeTerms)}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 2,
                          border: `2px solid ${form.agreeTerms ? C.amber : errors.agreeTerms ? C.rose : C.border}`,
                          background: form.agreeTerms ? C.amber : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontSize: 11, transition: "all 0.2s ease",
                        }}>{form.agreeTerms ? "✓" : ""}</div>
                        <span style={{ fontFamily: sans, fontSize: 13, color: C.brownMid, lineHeight: 1.5 }}>
                          I understand this is fully refundable and holds my cooperative spot.
                        </span>
                      </div>
                    </div>
                  </Fade>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                  <button onClick={() => setStep(0)} style={{
                    background: "transparent", color: C.brownPale, border: `1.5px solid ${C.border}`,
                    borderRadius: 28, padding: "13px 28px", fontSize: 15, fontFamily: sans, cursor: "pointer",
                  }}>← Back</button>
                  <button onClick={handleSubmit} disabled={submitting} style={{
                    background: submitting ? C.brownPale : `linear-gradient(135deg, ${C.amber}, ${C.amberDeep})`,
                    color: "#fff", border: "none", borderRadius: 28, padding: "15px 40px",
                    fontSize: 16, fontWeight: 600, fontFamily: sans,
                    cursor: submitting ? "default" : "pointer",
                    boxShadow: submitting ? "none" : "0 4px 20px rgba(196,149,106,0.2)",
                    transition: "all 0.3s ease", opacity: submitting ? 0.7 : 1,
                  }}>
                    {submitting ? (
                      <span style={{ animation: "breathe 1.2s infinite" }}>Joining the cooperative...</span>
                    ) : form.deposit > 0
                      ? `Join + $${form.deposit} deposit`
                      : "Join free"
                    }
                  </button>
                </div>
              </div>
            </Fade>
          )}
        </div>
      </div>
    </div>
  );
}
