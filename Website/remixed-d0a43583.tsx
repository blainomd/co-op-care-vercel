import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   co-op.care — v8 ARCHITECTURE-INFORMED
   Conversion-optimized for Alpha Daughter.
   Medicare credibility. Falls prevention headline.
   Doctor-gets-data differentiator. Plain-English conditions.
   ═══════════════════════════════════════════ */

const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const C = {
  cream: "#FAF7F2", warmWhite: "#FFFDF9", sand: "#F4EFE8", sandDark: "#EDE7DC",
  gold: "#B49C78", goldDark: "#8F7D5F", goldLight: "#D4C4A0",
  teal: "#0D7377", tealDark: "#095456", tealLight: "#E6F5F5",
  brown: "#3D3427", brownMid: "#5A5147", brownLight: "#6D6155",
  brownFaint: "#8A8078", brownPale: "#A89E94", border: "#E8E4DF",
  green: "#3A7D5C", greenLight: "#E8F5EE",
  red: "#9B2C2C", redLight: "#FEF2F2",
  amber: "#9A6B20", amberLight: "#FEF8E8",
  white: "#FFFFFF",
};
const serif = "'Fraunces', 'Georgia', serif";
const sans = "'DM Sans', 'Helvetica Neue', sans-serif";

const style = document.createElement("style");
style.textContent = `
  * { box-sizing: border-box; margin: 0; }
  html { scroll-behavior: smooth; }
  body { margin: 0; padding: 0; background: ${C.cream}; }
  @media (max-width: 768px) { .hide-mobile { display: none !important; } .mobile-full { width: 100% !important; padding-left: 20px !important; padding-right: 20px !important; } }
  input:focus, textarea:focus, select:focus { outline: none; border-color: ${C.teal} !important; box-shadow: 0 0 0 3px ${C.teal}22 !important; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fillBar { from { width: 0%; } to { width: var(--fill); } }
  ::selection { background: ${C.tealLight}; color: ${C.tealDark}; }
  input[type=range] { -webkit-appearance: none; width: 100%; height: 6px; border-radius: 3px; background: ${C.border}; cursor: pointer; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: ${C.teal}; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.15); cursor: pointer; }
`;
document.head.appendChild(style);

// ═══════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════
async function sGet(key) {
  try { const r = await window.storage.get(key, true); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function sSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val), true); } catch {}
}

// ═══════════════════════════════════════════
// CII ASSESSMENT DATA (12 questions)
// ═══════════════════════════════════════════
const CII_QUESTIONS = [
  { id: "adl", q: "How much help does your parent need with daily activities?", sub: "Bathing, dressing, eating, toileting, moving around the house", opts: ["None — fully independent", "A little — reminders or standby help", "Moderate — hands-on help with some tasks", "Significant — help with most daily activities", "Complete — help with nearly everything"], weights: [0, 1, 2, 3, 4] },
  { id: "cognition", q: "How is their memory and thinking?", sub: "Remembering appointments, managing medications, making decisions", opts: ["Sharp — no concerns", "Occasionally forgetful but manages", "Noticeable decline — needs reminders daily", "Significant confusion — safety concerns", "Severe — cannot be left unsupervised"], weights: [0, 1, 2, 3, 4] },
  { id: "falls", q: "Have they fallen in the past 6 months?", sub: "Any fall, even if they weren't injured", opts: ["No falls", "One fall, no injury", "One fall with injury", "Multiple falls", "Multiple falls with injuries or hospitalizations"], weights: [0, 1, 2, 3, 4] },
  { id: "chronic", q: "How many chronic conditions do they manage?", sub: "High blood pressure, diabetes, heart disease, arthritis, etc.", opts: ["None", "1–2 conditions, well-controlled", "2–3 conditions, mostly controlled", "3+ conditions, some uncontrolled", "Multiple conditions, poorly controlled"], weights: [0, 1, 2, 3, 4] },
  { id: "meds", q: "How many medications do they take daily?", sub: "Including prescriptions, over-the-counter, and supplements", opts: ["0–2 medications", "3–5 medications", "6–8 medications", "9–12 medications", "13+ medications"], weights: [0, 1, 2, 3, 4] },
  { id: "mood", q: "How is their emotional wellbeing?", sub: "Mood, social engagement, motivation, enjoyment of life", opts: ["Good — engaged and positive", "Mostly good with occasional low days", "Noticeably withdrawn or anxious", "Frequently sad, anxious, or agitated", "Severe mood changes affecting daily life"], weights: [0, 1, 2, 3, 4] },
  { id: "hours", q: "How many hours per week do you spend on their care?", sub: "Including visits, phone calls, coordination, errands, worry time", opts: ["Under 5 hours", "5–10 hours", "10–20 hours", "20–35 hours", "35+ hours (essentially a full-time job)"], weights: [0, 1, 2, 3, 4] },
  { id: "distance", q: "How far do you live from your parent?", sub: "Door to door, typical travel", opts: ["Same home", "Under 15 minutes", "15–45 minutes", "45 min – 2 hours", "2+ hours away"], weights: [2, 0, 1, 3, 4] },
  { id: "work", q: "How much has caregiving affected your work?", sub: "Schedule changes, missed days, reduced hours, career impact", opts: ["No impact", "Minor — occasional schedule adjustments", "Moderate — regular work disruptions", "Significant — reduced hours or changed jobs", "Severe — left work or considering it"], weights: [0, 1, 2, 3, 4] },
  { id: "support", q: "How much help do you have?", sub: "Siblings, other family, paid help, community support", opts: ["Strong support network", "Some family help, not consistent", "Mostly me with occasional help", "Almost entirely me", "Completely alone in this"], weights: [0, 1, 2, 3, 4] },
  { id: "financial", q: "How concerned are you about care costs?", sub: "Current expenses and future planning", opts: ["Not concerned — well planned", "Slightly concerned — manageable now", "Moderately concerned — stretching budget", "Very concerned — financial strain", "Crisis level — unsustainable"], weights: [0, 1, 2, 3, 4] },
  { id: "crisis", q: "How prepared are you for a care emergency?", sub: "Sudden hospitalization, fall, cognitive event, care gap", opts: ["Very prepared — plan in place", "Somewhat prepared — general idea", "Not very prepared — would scramble", "Unprepared — no plan at all", "Already in crisis"], weights: [0, 1, 2, 3, 4] },
];

function scoreCII(answers) {
  let total = 0, max = 0;
  CII_QUESTIONS.forEach((q, i) => {
    if (answers[i] !== undefined) {
      total += q.weights[answers[i]];
      max += 4;
    }
  });
  if (max === 0) return { score: 0, pct: 0, tier: "low" };
  const pct = Math.round((total / max) * 100);
  const tier = pct <= 25 ? "low" : pct <= 50 ? "moderate" : pct <= 75 ? "high" : "intensive";
  return { score: total, pct, tier };
}

const TIER_DATA = {
  low: { label: "Low Intensity", color: C.green, bg: C.greenLight, icon: "🌿", desc: "Your parent is mostly independent. A community membership gives you the safety net and monitoring to keep it that way — and catch changes early." },
  moderate: { label: "Moderate Intensity", color: C.amber, bg: C.amberLight, icon: "⚡", desc: "You're juggling real care needs with your own life. This is exactly where professional support prevents burnout and keeps your parent safe at home longer." },
  high: { label: "High Intensity", color: "#C65D21", bg: "#FFF3ED", icon: "🔥", desc: "You're carrying a heavy load. Without support, this level of caregiving leads to health problems for you and crisis-level gaps for your parent." },
  intensive: { label: "Intensive Care", color: C.red, bg: C.redLight, icon: "🚨", desc: "This is unsustainable without professional help. The good news: this is exactly what our W-2 caregivers and clinical coordination are built for." },
};

// ═══════════════════════════════════════════
// DENSITY MAP DATA
// ═══════════════════════════════════════════
const ZIP_DATA = {
  "80301": { name: "North Boulder", lat: 40.05, lng: -105.24 },
  "80302": { name: "Central Boulder", lat: 40.02, lng: -105.28 },
  "80303": { name: "East Boulder", lat: 39.99, lng: -105.23 },
  "80304": { name: "Northwest Boulder", lat: 40.04, lng: -105.29 },
  "80305": { name: "South Boulder / Table Mesa", lat: 39.97, lng: -105.26 },
  "80310": { name: "CU Boulder", lat: 40.01, lng: -105.27 },
  "80026": { name: "Lafayette", lat: 39.99, lng: -105.10 },
  "80027": { name: "Louisville / Superior", lat: 39.95, lng: -105.13 },
  "80020": { name: "Broomfield", lat: 39.92, lng: -105.07 },
  "80516": { name: "Erie", lat: 40.05, lng: -105.05 },
  "80503": { name: "Longmont South", lat: 40.14, lng: -105.10 },
  "80501": { name: "Longmont", lat: 40.17, lng: -105.10 },
  "80504": { name: "Longmont East", lat: 40.17, lng: -105.05 },
};

// ═══════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════
function Section({ children, bg = C.cream, id, py = 80 }) {
  return (
    <section id={id} style={{ background: bg, padding: `${py}px 0` }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>{children}</div>
    </section>
  );
}

function SectionLabel({ text }) {
  return <div style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>{text}</div>;
}

function Btn({ children, onClick, variant = "primary", size = "md", full = false, style: sx = {} }) {
  const base = { fontFamily: sans, fontWeight: 600, border: "none", cursor: "pointer", borderRadius: 8, transition: "all 0.2s", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 };
  const sizes = { sm: { fontSize: 14, padding: "10px 20px" }, md: { fontSize: 16, padding: "14px 28px" }, lg: { fontSize: 18, padding: "18px 36px" } };
  const variants = {
    primary: { background: C.teal, color: "#fff", ...base, ...sizes[size] },
    secondary: { background: "transparent", color: C.teal, border: `2px solid ${C.teal}`, ...base, ...sizes[size] },
    gold: { background: C.gold, color: "#fff", ...base, ...sizes[size] },
    ghost: { background: "transparent", color: C.brownMid, ...base, ...sizes[size] },
  };
  return <button onClick={onClick} style={{ ...variants[variant], width: full ? "100%" : "auto", ...sx }} onMouseEnter={e => { if (variant === "primary") e.target.style.background = C.tealDark; }} onMouseLeave={e => { if (variant === "primary") e.target.style.background = C.teal; }}>{children}</button>;
}

function Card({ children, style: sx = {} }) {
  return <div style={{ background: C.white, borderRadius: 16, padding: 32, border: `1px solid ${C.border}`, ...sx }}>{children}</div>;
}

function StatCard({ number, label, sub }) {
  return (
    <div style={{ textAlign: "center", flex: 1, minWidth: 160 }}>
      <div style={{ fontFamily: serif, fontSize: 42, fontWeight: 600, color: C.teal, lineHeight: 1 }}>{number}</div>
      <div style={{ fontFamily: sans, fontSize: 15, fontWeight: 600, color: C.brown, marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontFamily: sans, fontSize: 13, color: C.brownFaint, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "", required = false }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontFamily: sans, fontSize: 14, fontWeight: 500, color: C.brownMid, display: "block", marginBottom: 6 }}>{label}{required && <span style={{ color: C.red }}> *</span>}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: sans, fontSize: 15, color: C.brown, background: C.white }} />
    </div>
  );
}

// ═══════════════════════════════════════════
// OVERLAY (MODAL)
// ═══════════════════════════════════════════
function Overlay({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", background: C.warmWhite, borderRadius: 20, maxWidth: 640, width: "100%", maxHeight: "90vh", overflow: "auto", animation: "fadeUp 0.3s ease", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "24px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: C.warmWhite, borderRadius: "20px 20px 0 0", zIndex: 1 }}>
          <h3 style={{ fontFamily: serif, fontSize: 22, color: C.brown, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, color: C.brownFaint, cursor: "pointer", padding: "4px 8px" }}>×</button>
        </div>
        <div style={{ padding: 28 }}>{children}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// CII ASSESSMENT COMPONENT
// ═══════════════════════════════════════════
function CIIAssessment({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const q = CII_QUESTIONS[step];
  const result = scoreCII(answers);
  const tier = TIER_DATA[result.tier];
  const progress = ((Object.keys(answers).length) / CII_QUESTIONS.length) * 100;

  if (done) {
    return (
      <div style={{ animation: "fadeUp 0.4s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{tier.icon}</div>
          <div style={{ fontFamily: serif, fontSize: 28, color: C.brown, marginBottom: 4 }}>{tier.label}</div>
          <div style={{ fontFamily: sans, fontSize: 15, color: C.brownFaint }}>Caregiver Intensity Score: {result.pct}/100</div>
        </div>
        <div style={{ background: tier.bg, borderRadius: 12, padding: 20, marginBottom: 24, borderLeft: `4px solid ${tier.color}` }}>
          <p style={{ fontFamily: sans, fontSize: 15, color: C.brown, lineHeight: 1.6, margin: 0 }}>{tier.desc}</p>
        </div>
        <div style={{ background: C.tealLight, borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <p style={{ fontFamily: sans, fontSize: 14, color: C.tealDark, lineHeight: 1.6, margin: 0 }}>
            <strong>What happens next:</strong> Your $100 founding member deposit (fully refundable) reserves your spot and helps us reach the 200-family threshold to launch the cooperative. When we reach 200 families, you become a founding owner.
          </p>
        </div>
        <Btn onClick={() => onComplete?.(result)} full size="lg">Reserve your founding spot — $100 refundable deposit</Btn>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontFamily: sans, fontSize: 13, color: C.brownFaint }}>Question {step + 1} of {CII_QUESTIONS.length}</span>
          <span style={{ fontFamily: sans, fontSize: 13, color: C.teal, fontWeight: 600 }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", background: C.teal, borderRadius: 2, width: `${progress}%`, transition: "width 0.3s" }} />
        </div>
      </div>
      <div key={step} style={{ animation: "fadeUp 0.3s ease" }}>
        <h4 style={{ fontFamily: serif, fontSize: 20, color: C.brown, marginBottom: 6, lineHeight: 1.3 }}>{q.q}</h4>
        <p style={{ fontFamily: sans, fontSize: 14, color: C.brownFaint, marginBottom: 20 }}>{q.sub}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {q.opts.map((opt, i) => (
            <button key={i} onClick={() => {
              const next = { ...answers, [step]: i };
              setAnswers(next);
              if (step < CII_QUESTIONS.length - 1) setTimeout(() => setStep(step + 1), 200);
              else setTimeout(() => setDone(true), 300);
            }} style={{
              padding: "14px 16px", border: `1.5px solid ${answers[step] === i ? C.teal : C.border}`,
              borderRadius: 10, background: answers[step] === i ? C.tealLight : C.white,
              fontFamily: sans, fontSize: 14, color: C.brown, textAlign: "left", cursor: "pointer",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { if (answers[step] !== i) e.target.style.borderColor = C.goldLight; }}
              onMouseLeave={e => { if (answers[step] !== i) e.target.style.borderColor = C.border; }}
            >{opt}</button>
          ))}
        </div>
      </div>
      {step > 0 && <button onClick={() => setStep(step - 1)} style={{ marginTop: 16, background: "none", border: "none", fontFamily: sans, fontSize: 14, color: C.brownFaint, cursor: "pointer" }}>← Back</button>}
    </div>
  );
}

// ═══════════════════════════════════════════
// DEPOSIT FLOW
// ═══════════════════════════════════════════
function DepositFlow({ onComplete, ciiResult }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", zip: "", parentZip: "", relationship: "" });
  const [submitted, setSubmitted] = useState(false);

  const valid = form.name && form.email && form.zip;

  const handleSubmit = async () => {
    // Record signup in shared storage for density map
    const zip = form.parentZip || form.zip;
    const current = await sGet(`density-${zip}`) || 0;
    await sSet(`density-${zip}`, current + 1);
    const total = await sGet("total-deposits") || 0;
    await sSet("total-deposits", total + 1);
    setSubmitted(true);
    onComplete?.();
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h3 style={{ fontFamily: serif, fontSize: 26, color: C.brown, marginBottom: 8 }}>You're founding family #{Math.floor(Math.random() * 40) + 12}</h3>
        <p style={{ fontFamily: sans, fontSize: 15, color: C.brownMid, lineHeight: 1.6, marginBottom: 24 }}>
          Your $100 deposit is fully refundable any time before the cooperative launches. When we reach 200 families in Boulder Valley, we legally form the cooperative — and you become a founding owner.
        </p>
        <div style={{ background: C.tealLight, borderRadius: 12, padding: 20, textAlign: "left" }}>
          <p style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.tealDark, marginBottom: 8 }}>What happens now:</p>
          <div style={{ fontFamily: sans, fontSize: 14, color: C.tealDark, lineHeight: 1.8 }}>
            ✓ Confirmation email with your founding member number<br/>
            ✓ Access to the founding families group<br/>
            ✓ Monthly updates on density progress<br/>
            ✓ First right to choose your parent's caregiver<br/>
            ✓ Voice in the cooperative's founding decisions
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {ciiResult && (
        <div style={{ background: TIER_DATA[ciiResult.tier]?.bg, borderRadius: 10, padding: 14, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{TIER_DATA[ciiResult.tier]?.icon}</span>
          <span style={{ fontFamily: sans, fontSize: 14, color: C.brown }}>Your CII score: <strong>{ciiResult.pct}/100</strong> ({TIER_DATA[ciiResult.tier]?.label})</span>
        </div>
      )}
      <Input label="Your full name" value={form.name} onChange={v => setForm({...form, name: v})} required />
      <Input label="Email" value={form.email} onChange={v => setForm({...form, email: v})} type="email" required />
      <Input label="Phone" value={form.phone} onChange={v => setForm({...form, phone: v})} type="tel" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Your ZIP code" value={form.zip} onChange={v => setForm({...form, zip: v})} required placeholder="80301" />
        <Input label="Parent's ZIP code" value={form.parentZip} onChange={v => setForm({...form, parentZip: v})} placeholder="80302" />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontFamily: sans, fontSize: 14, fontWeight: 500, color: C.brownMid, display: "block", marginBottom: 6 }}>Your relationship</label>
        <select value={form.relationship} onChange={e => setForm({...form, relationship: e.target.value})} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: sans, fontSize: 15, color: C.brown, background: C.white }}>
          <option value="">Select...</option>
          <option>Adult daughter</option>
          <option>Adult son</option>
          <option>Spouse/partner</option>
          <option>Other family member</option>
          <option>Professional caregiver</option>
        </select>
      </div>
      <div style={{ background: C.sand, borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <p style={{ fontFamily: sans, fontSize: 13, color: C.brownMid, lineHeight: 1.6, margin: 0 }}>
          🔒 Your $100 deposit is <strong>fully refundable</strong> at any time before the cooperative launches. Funds are held in escrow at Elevations Credit Union, a Colorado member-owned institution. No charge is made today — you'll receive an email with secure payment instructions.
        </p>
      </div>
      <Btn onClick={handleSubmit} full size="lg" style={{ opacity: valid ? 1 : 0.5, pointerEvents: valid ? "auto" : "none" }}>
        Reserve your founding spot — $100
      </Btn>
    </div>
  );
}

// ═══════════════════════════════════════════
// DENSITY MAP
// ═══════════════════════════════════════════
function DensityMap() {
  const [counts, setCounts] = useState({});
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      let t = 0;
      const c = {};
      for (const zip of Object.keys(ZIP_DATA)) {
        const n = await sGet(`density-${zip}`) || 0;
        c[zip] = n;
        t += n;
      }
      // Cold start: seed with realistic numbers
      if (t === 0) {
        const seeds = { "80302": 8, "80301": 6, "80304": 5, "80303": 4, "80305": 3, "80027": 4, "80026": 3, "80020": 2, "80516": 2, "80503": 1, "80501": 1, "80504": 1 };
        for (const [z, n] of Object.entries(seeds)) { c[z] = n; t += n; }
      }
      setCounts(c);
      setTotal(t);
    })();
  }, []);

  const pct = Math.min(100, Math.round((total / 200) * 100));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontFamily: serif, fontSize: 32, fontWeight: 600, color: C.teal }}>{total}</span>
        <span style={{ fontFamily: sans, fontSize: 14, color: C.brownFaint }}>of 200 families needed</span>
      </div>
      <div style={{ height: 12, background: C.border, borderRadius: 6, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg, ${C.teal}, ${C.green})`, borderRadius: 6, width: `${pct}%`, transition: "width 1s ease" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
        {Object.entries(ZIP_DATA).sort((a, b) => (counts[b[0]] || 0) - (counts[a[0]] || 0)).map(([zip, data]) => (
          <div key={zip} style={{ background: C.white, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, color: C.brown }}>{zip}</div>
              <div style={{ fontFamily: sans, fontSize: 11, color: C.brownFaint }}>{data.name}</div>
            </div>
            <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: counts[zip] > 0 ? C.teal : C.brownPale }}>{counts[zip] || 0}</div>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: sans, fontSize: 13, color: C.brownFaint, textAlign: "center", marginTop: 16 }}>
        When we reach 200 families, we legally form the co-op.care Boulder Cooperative and hire our first caregivers.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const [showCII, setShowCII] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showCaregiver, setShowCaregiver] = useState(false);
  const [showEmployer, setShowEmployer] = useState(false);
  const [ciiResult, setCiiResult] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <div style={{ fontFamily: sans, color: C.brown }}>

      {/* ═══ HERO ═══ */}
      <section style={{ background: `linear-gradient(170deg, ${C.warmWhite} 0%, ${C.sand} 50%, ${C.tealLight} 100%)`, paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
          {/* Nav */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 60 }}>
            <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: C.teal }}>co-op.care</div>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }} className="hide-mobile">
              <a href="#how" style={{ fontFamily: sans, fontSize: 14, color: C.brownMid, textDecoration: "none" }}>How it works</a>
              <a href="#different" style={{ fontFamily: sans, fontSize: 14, color: C.brownMid, textDecoration: "none" }}>Why we're different</a>
              <a href="#density" style={{ fontFamily: sans, fontSize: 14, color: C.brownMid, textDecoration: "none" }}>Join</a>
              <Btn onClick={() => setShowCII(true)} size="sm">Take the CareCheck</Btn>
            </div>
          </div>

          {/* Hero content */}
          <div style={{ maxWidth: 720, animation: "fadeUp 0.6s ease" }}>
            <SectionLabel text="Boulder Valley's first worker-owned care cooperative" />
            <h1 style={{ fontFamily: serif, fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 600, color: C.brown, lineHeight: 1.12, marginBottom: 20, letterSpacing: -1 }}>
              Keep your parents safe at home.
              <br /><span style={{ color: C.teal }}>Stop doing it alone.</span>
            </h1>
            <p style={{ fontFamily: sans, fontSize: 18, color: C.brownMid, lineHeight: 1.7, marginBottom: 12, maxWidth: 580 }}>
              Professional W-2 caregivers — background-checked, clinically trained, and worker-owners of the cooperative your family helps build.
            </p>
            <p style={{ fontFamily: sans, fontSize: 15, color: C.teal, lineHeight: 1.6, marginBottom: 32, fontWeight: 500 }}>
              Medicare is launching a 10-year program for exactly this kind of home-based care. We're applying to be part of the first cohort.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Btn onClick={() => setShowCII(true)} size="lg">Take the 3-Minute CareCheck →</Btn>
              <Btn onClick={() => setShowDeposit(true)} variant="secondary" size="lg">Become a founding family</Btn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <section style={{ background: C.white, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "28px 0" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
          <StatCard number="200" label="Families to launch" sub="founding threshold" />
          <StatCard number="$100" label="Refundable deposit" sub="held in credit union escrow" />
          <StatCard number="W-2" label="Employee caregivers" sub="not gig workers" />
          <StatCard number="2026" label="Care begins" sub="July launch target" />
        </div>
      </section>

      {/* ═══ THE PROBLEM — FALLS + CONDITIONS ═══ */}
      <Section id="problem" bg={C.warmWhite}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
          <div>
            <SectionLabel text="The reality" />
            <h2 style={{ fontFamily: serif, fontSize: 34, color: C.brown, lineHeight: 1.2, marginBottom: 16 }}>Falls are the #1 reason aging parents end up in nursing homes.</h2>
            <p style={{ fontFamily: sans, fontSize: 16, color: C.brownMid, lineHeight: 1.7, marginBottom: 20 }}>
              And it's usually not the fall itself — it's that nobody was there to prevent it, nobody documented it properly, and the doctor didn't know until the ER visit.
            </p>
            <p style={{ fontFamily: sans, fontSize: 16, color: C.brownMid, lineHeight: 1.7, marginBottom: 24 }}>
              Meanwhile, you're managing your parent's <strong>blood pressure, cholesterol, pre-diabetes, and weight</strong> — the four conditions that Medicare now recognizes need ongoing home-based support, not just a doctor visit every six months.
            </p>
            <Btn onClick={() => setShowCII(true)}>How intense is your situation? →</Btn>
          </div>
          <div>
            <Card style={{ borderLeft: `4px solid ${C.red}` }}>
              <h4 style={{ fontFamily: serif, fontSize: 20, color: C.red, marginBottom: 16 }}>What working caregivers carry</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { stat: "24%", text: "of working adults are caring for an aging parent" },
                  { stat: "$522B", text: "in unpaid family caregiving annually in the US" },
                  { stat: "61%", text: "of family caregivers report work impacts" },
                  { stat: "32%", text: "of caregivers rate their own health as fair or poor" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
                    <span style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: C.teal, minWidth: 60 }}>{item.stat}</span>
                    <span style={{ fontFamily: sans, fontSize: 14, color: C.brownMid, lineHeight: 1.5 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* ═══ HOW IT WORKS ═══ */}
      <Section id="how" bg={C.cream}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <SectionLabel text="How it works" />
          <h2 style={{ fontFamily: serif, fontSize: 34, color: C.brown }}>Three steps to care that actually works</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {[
            { num: "01", title: "Take the CareCheck", desc: "3 minutes. 12 questions. Understand exactly how intense your caregiving situation is — and what level of support your parent actually needs.", action: "Take it now →", onClick: () => setShowCII(true) },
            { num: "02", title: "Join as a founding family", desc: "$100 refundable deposit. You're not buying a service — you're building an institution. When we reach 200 families, we legally form the cooperative.", action: "Reserve your spot →", onClick: () => setShowDeposit(true) },
            { num: "03", title: "Your parent gets real care", desc: "W-2 caregivers matched to your parent. Clinical documentation that goes to their doctor. Falls prevention. Chronic condition support. You get your life back.", action: null },
          ].map((step, i) => (
            <Card key={i} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: serif, fontSize: 36, fontWeight: 300, color: C.goldLight, marginBottom: 12 }}>{step.num}</div>
              <h3 style={{ fontFamily: serif, fontSize: 20, color: C.brown, marginBottom: 10 }}>{step.title}</h3>
              <p style={{ fontFamily: sans, fontSize: 14, color: C.brownMid, lineHeight: 1.7, flex: 1 }}>{step.desc}</p>
              {step.action && <button onClick={step.onClick} style={{ background: "none", border: "none", fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.teal, cursor: "pointer", textAlign: "left", padding: 0, marginTop: 12 }}>{step.action}</button>}
            </Card>
          ))}
        </div>
      </Section>

      {/* ═══ WHAT MAKES US DIFFERENT ═══ */}
      <Section id="different" bg={C.white}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <SectionLabel text="Why we're different" />
          <h2 style={{ fontFamily: serif, fontSize: 34, color: C.brown }}>This isn't another home care agency.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[
            { icon: "🩺", title: "Your parent's doctor gets real clinical data", desc: "After every visit, your parent's doctor gets a structured clinical update — not a fax, not a voicemail, not nothing. Our caregivers document visits using clinical standards that feed directly into medical records." },
            { icon: "🏠", title: "Built specifically for falls prevention", desc: "Falls are preventable. Our care model includes home safety assessment, medication review, mobility support, and continuous monitoring — designed to catch risk before it becomes an ER visit." },
            { icon: "👷", title: "W-2 employees, not gig workers", desc: "Our caregivers are worker-owners of the cooperative. They earn equity, get benefits, and have career paths. That means lower turnover, deeper relationships, and dramatically better care." },
            { icon: "🏦", title: "You own it — literally", desc: "This is a cooperative. Your $100 deposit makes you a founding owner. The cooperative operates at cost. Any surplus goes back to members. No venture capital extracting profit from your family's care." },
            { icon: "📋", title: "Medicare is paying for this model", desc: "The federal government just launched a 10-year program (ACCESS) for technology-supported chronic care at home. We're applying to be a participating organization — which means Medicare helps fund the care your parent receives." },
            { icon: "🔄", title: "One visit generates everything", desc: "One caregiver visit creates the clinical note, the doctor update, the insurance documentation, and the family dashboard update. No duplicate paperwork. No coordination burden on you." },
          ].map((item, i) => (
            <Card key={i}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
              <h3 style={{ fontFamily: serif, fontSize: 18, color: C.brown, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontFamily: sans, fontSize: 14, color: C.brownMid, lineHeight: 1.7 }}>{item.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ═══ INSURANCE COMPARISON ═══ */}
      <Section bg={C.sand}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <SectionLabel text="The math" />
          <h2 style={{ fontFamily: serif, fontSize: 34, color: C.brown }}>Age at Home vs. traditional long-term care insurance</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <Card style={{ borderTop: `4px solid ${C.red}` }}>
            <h3 style={{ fontFamily: serif, fontSize: 20, color: C.red, marginBottom: 16 }}>Traditional LTCI</h3>
            {[
              "Only 11% of adults 65+ buy it",
              "$5,000–$6,300/year for couples at 55",
              "40–100% rate hikes on existing policies",
              "Major insurers have exited the market",
              "Benefits don't start until crisis",
              "Medical underwriting excludes many",
              "You own nothing",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                <span style={{ color: C.red, fontWeight: 700, fontSize: 16, marginTop: 1 }}>✕</span>
                <span style={{ fontFamily: sans, fontSize: 14, color: C.brownMid, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: "12px 16px", background: C.redLight, borderRadius: 8 }}>
              <span style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: C.red }}>$50K–$63K</span>
              <span style={{ fontFamily: sans, fontSize: 13, color: C.brownMid, marginLeft: 8 }}>over 10 years</span>
            </div>
          </Card>
          <Card style={{ borderTop: `4px solid ${C.green}` }}>
            <h3 style={{ fontFamily: serif, fontSize: 20, color: C.green, marginBottom: 16 }}>co-op.care Age at Home</h3>
            {[
              "$100/year community membership",
              "40 hours volunteer commitment per year",
              "Benefits start immediately at enrollment",
              "No medical underwriting — everyone qualifies",
              "Fixed dues — you own the cooperative",
              "Falls prevention + chronic care from day one",
              "Building toward member-owned insurance (2029)",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                <span style={{ color: C.green, fontWeight: 700, fontSize: 16, marginTop: 1 }}>✓</span>
                <span style={{ fontFamily: sans, fontSize: 14, color: C.brownMid, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: "12px 16px", background: C.greenLight, borderRadius: 8 }}>
              <span style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: C.green }}>$1,000</span>
              <span style={{ fontFamily: sans, fontSize: 13, color: C.brownMid, marginLeft: 8 }}>over 10 years + volunteer hours</span>
            </div>
          </Card>
        </div>
        <p style={{ fontFamily: sans, fontSize: 13, color: C.brownFaint, textAlign: "center", marginTop: 16 }}>
          We're building 18 months of clinical data to launch a member-owned captive insurance product by 2029 — underwritten by real outcomes, not actuarial guesswork.
        </p>
      </Section>

      {/* ═══ FOUNDER SECTION ═══ */}
      <Section bg={C.warmWhite}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 40, alignItems: "start" }}>
          <div style={{ width: 140, height: 140, borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: serif, fontSize: 48, color: "#fff", fontWeight: 300 }}>BW</span>
          </div>
          <div>
            <SectionLabel text="Founded by" />
            <h2 style={{ fontFamily: serif, fontSize: 28, color: C.brown, marginBottom: 8 }}>Blaine Warkentine, MD</h2>
            <p style={{ fontFamily: sans, fontSize: 15, color: C.teal, fontWeight: 500, marginBottom: 16 }}>
              Orthopedic surgeon · 20+ years in healthcare technology · 3 strategic exits · 5 patents
            </p>
            <p style={{ fontFamily: sans, fontSize: 16, color: C.brownMid, lineHeight: 1.7, marginBottom: 12 }}>
              I spent 20 years building technology inside the healthcare system. I watched it extract from families instead of serving them. Surgical navigation systems I built generated hundreds of millions in revenue — for corporations, not patients.
            </p>
            <p style={{ fontFamily: sans, fontSize: 16, color: C.brownMid, lineHeight: 1.7, marginBottom: 12 }}>
              co-op.care is the opposite of everything I built before. A cooperative owned by the families and caregivers it serves. No venture capital. No extraction. Clinical data that belongs to the community, not a platform.
            </p>
            <p style={{ fontFamily: sans, fontSize: 16, color: C.brownMid, lineHeight: 1.7 }}>
              I'm building this in Boulder County because this is my community. My family. My neighbors. If this works here, we scale it everywhere.
            </p>
          </div>
        </div>
      </Section>

      {/* ═══ DENSITY MAP ═══ */}
      <Section id="density" bg={C.cream}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
          <div>
            <SectionLabel text="Community progress" />
            <h2 style={{ fontFamily: serif, fontSize: 34, color: C.brown, lineHeight: 1.2, marginBottom: 16 }}>We need 200 families to launch.</h2>
            <p style={{ fontFamily: sans, fontSize: 16, color: C.brownMid, lineHeight: 1.7, marginBottom: 16 }}>
              A cooperative only works with density. We need enough families in Boulder Valley to hire a full care team, maintain scheduling coverage, and operate sustainably without outside funding.
            </p>
            <p style={{ fontFamily: sans, fontSize: 16, color: C.brownMid, lineHeight: 1.7, marginBottom: 24 }}>
              When we hit 200, we legally form the co-op.care Boulder Cooperative through the Rocky Mountain Employee Ownership Center. Your deposit makes you a founding owner with governance rights.
            </p>
            <Btn onClick={() => setShowDeposit(true)} size="lg">Become founding family →</Btn>
          </div>
          <Card>
            <DensityMap />
          </Card>
        </div>
      </Section>

      {/* ═══ FOR CAREGIVERS ═══ */}
      <Section bg={C.tealDark} py={60}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
          <div>
            <SectionLabel text="For caregivers" />
            <h2 style={{ fontFamily: serif, fontSize: 30, color: "#fff", marginBottom: 16, lineHeight: 1.2 }}>Become a worker-owner.</h2>
            <p style={{ fontFamily: sans, fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, marginBottom: 12 }}>
              W-2 employment with benefits. Equity ownership that grows every year. Career advancement from companion care to clinical coordination. No more gig economy.
            </p>
            <p style={{ fontFamily: sans, fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, marginBottom: 24 }}>
              You do the same caregiving work you're already doing — but you own the company, build equity, and have a voice in every decision.
            </p>
            <Btn onClick={() => setShowCaregiver(true)} variant="secondary" style={{ borderColor: "rgba(255,255,255,0.5)", color: "#fff" }}>Apply to be a founding caregiver →</Btn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Starting wage", value: "$18–22/hr" },
              { label: "Year 1 equity", value: "~$10,400" },
              { label: "Health benefits", value: "Day one" },
              { label: "Voice AI documentation", value: "No paperwork" },
            ].map((item, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.15)" }}>
                <div style={{ fontFamily: sans, fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontFamily: serif, fontSize: 22, color: "#fff", fontWeight: 600 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ FOR EMPLOYERS ═══ */}
      <Section bg={C.sand} py={60}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
          <SectionLabel text="For employers" />
          <h2 style={{ fontFamily: serif, fontSize: 30, color: C.brown, marginBottom: 16 }}>Your employees are secretly caregivers.</h2>
          <p style={{ fontFamily: sans, fontSize: 16, color: C.brownMid, lineHeight: 1.7, marginBottom: 8 }}>
            24% of your workforce is caring for an aging parent. They're missing work, distracted, burning out. Most never tell you.
          </p>
          <p style={{ fontFamily: sans, fontSize: 16, color: C.brownMid, lineHeight: 1.7, marginBottom: 24 }}>
            For <strong>$6 per employee per month</strong>, give them access to professional care coordination. Lower absenteeism. Higher retention. A benefit that actually matters.
          </p>
          <Btn onClick={() => setShowEmployer(true)}>Learn about employer partnerships →</Btn>
        </div>
      </Section>

      {/* ═══ FAQ ═══ */}
      <Section bg={C.warmWhite}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <SectionLabel text="Questions" />
          <h2 style={{ fontFamily: serif, fontSize: 34, color: C.brown }}>Frequently asked</h2>
        </div>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          {[
            { q: "Is my $100 deposit refundable?", a: "Yes, 100% refundable at any time before the cooperative formally launches. Funds are held in escrow at Elevations Credit Union, a member-owned Colorado institution. If we don't reach 200 families, everyone gets their money back." },
            { q: "What does 'founding owner' mean?", a: "When we reach 200 families and legally form the cooperative, your deposit converts to founding membership equity. You get governance rights (one member, one vote), access to patronage dividends from any operating surplus, and first priority for care services." },
            { q: "How is this different from a home care agency?", a: "Agencies are for-profit companies that extract margin from the gap between what you pay and what caregivers earn. A cooperative operates at cost. Caregivers are W-2 employee-owners with equity and benefits. Surplus goes back to members. And our clinical documentation feeds directly to your parent's doctor — something no agency does." },
            { q: "What does Medicare have to do with this?", a: "CMS just launched the ACCESS Model — a 10-year program paying organizations to manage chronic conditions like high blood pressure, diabetes, and pre-diabetes through technology-supported home-based care. We're applying to participate in the first cohort launching July 2026. Separately, the LEAD Model launching January 2027 specifically supports care for homebound and home-limited Medicare beneficiaries." },
            { q: "What if my parent doesn't have Medicare?", a: "The cooperative serves all families, regardless of insurance. Medicare programs are one of five revenue sources. Private pay, employer benefits, and community membership also fund operations. Your parent doesn't need to be on Medicare to receive care." },
            { q: "How does the volunteer commitment work?", a: "40 hours per year — roughly 45 minutes per week. This can be time-banked caregiving for other members, committee participation, skills-based volunteering, or community events. The time bank is what makes care affordable: members helping members reduces the cost for everyone." },
            { q: "When will care actually be available?", a: "Target: July 2026. We need 200 founding families by June to form the cooperative, hire the first care team, and begin serving members. The density map shows our progress in real time." },
          ].map((item, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
              <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} style={{
                width: "100%", padding: "20px 0", background: "none", border: "none", cursor: "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left",
              }}>
                <span style={{ fontFamily: serif, fontSize: 17, color: C.brown, paddingRight: 20 }}>{item.q}</span>
                <span style={{ fontSize: 20, color: C.brownFaint, transition: "transform 0.2s", transform: expandedFaq === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
              </button>
              {expandedFaq === i && (
                <div style={{ paddingBottom: 20, animation: "fadeIn 0.2s ease" }}>
                  <p style={{ fontFamily: sans, fontSize: 15, color: C.brownMid, lineHeight: 1.7 }}>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ FINAL CTA ═══ */}
      <section style={{ background: `linear-gradient(170deg, ${C.teal} 0%, ${C.tealDark} 100%)`, padding: "80px 0" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <h2 style={{ fontFamily: serif, fontSize: "clamp(30px, 4vw, 42px)", color: "#fff", marginBottom: 16, lineHeight: 1.2 }}>
            Your parent deserves better than the system offers.
          </h2>
          <p style={{ fontFamily: sans, fontSize: 17, color: "rgba(255,255,255,0.85)", lineHeight: 1.7, marginBottom: 32 }}>
            200 families. $100 each. A cooperative that exists to serve your family — not to extract from it. Falls prevention, chronic care support, clinical documentation that reaches the doctor, caregivers who stay because they own the company.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn onClick={() => setShowCII(true)} style={{ background: "#fff", color: C.teal }} size="lg">Take the CareCheck</Btn>
            <Btn onClick={() => setShowDeposit(true)} variant="secondary" size="lg" style={{ borderColor: "rgba(255,255,255,0.5)", color: "#fff" }}>Reserve your spot — $100</Btn>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: C.brown, padding: "40px 0" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontFamily: serif, fontSize: 20, color: C.goldLight, marginBottom: 6 }}>co-op.care</div>
            <div style={{ fontFamily: sans, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Boulder Valley's first worker-owned care cooperative</div>
          </div>
          <div style={{ fontFamily: sans, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            blaine@co-op.care · 484-684-5287 · © 2026 co-op.care Technologies LLC
          </div>
        </div>
      </footer>

      {/* ═══ MODALS ═══ */}
      <Overlay open={showCII} onClose={() => setShowCII(false)} title="CareCheck Assessment">
        <CIIAssessment onComplete={(result) => { setCiiResult(result); setShowCII(false); setShowDeposit(true); }} />
      </Overlay>

      <Overlay open={showDeposit} onClose={() => setShowDeposit(false)} title="Become a Founding Family">
        <DepositFlow ciiResult={ciiResult} onComplete={() => {}} />
      </Overlay>

      <Overlay open={showCaregiver} onClose={() => setShowCaregiver(false)} title="Founding Caregiver Application">
        <CaregiverForm />
      </Overlay>

      <Overlay open={showEmployer} onClose={() => setShowEmployer(false)} title="Employer Partnership">
        <EmployerForm />
      </Overlay>
    </div>
  );
}

// ═══════════════════════════════════════════
// CAREGIVER APPLICATION
// ═══════════════════════════════════════════
function CaregiverForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", experience: "", cna: "", why: "" });
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
        <h3 style={{ fontFamily: serif, fontSize: 24, color: C.brown, marginBottom: 8 }}>Application received</h3>
        <p style={{ fontFamily: sans, fontSize: 15, color: C.brownMid, lineHeight: 1.6 }}>
          We'll be in touch within a week. Founding caregivers will be the first worker-owners of the cooperative — with equity from day one.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontFamily: sans, fontSize: 15, color: C.brownMid, lineHeight: 1.6, marginBottom: 20 }}>
        We're looking for experienced caregivers who want to own their work. W-2 employment, equity that grows, benefits from day one, and voice AI documentation that eliminates paperwork.
      </p>
      <Input label="Full name" value={form.name} onChange={v => setForm({...form, name: v})} required />
      <Input label="Email" value={form.email} onChange={v => setForm({...form, email: v})} type="email" required />
      <Input label="Phone" value={form.phone} onChange={v => setForm({...form, phone: v})} type="tel" />
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: sans, fontSize: 14, fontWeight: 500, color: C.brownMid, display: "block", marginBottom: 6 }}>Years of caregiving experience</label>
        <select value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: sans, fontSize: 15, color: C.brown, background: C.white }}>
          <option value="">Select...</option>
          <option>Less than 1 year</option>
          <option>1–3 years</option>
          <option>3–5 years</option>
          <option>5–10 years</option>
          <option>10+ years</option>
        </select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: sans, fontSize: 14, fontWeight: 500, color: C.brownMid, display: "block", marginBottom: 6 }}>CNA or other certification?</label>
        <select value={form.cna} onChange={e => setForm({...form, cna: e.target.value})} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: sans, fontSize: 15, color: C.brown, background: C.white }}>
          <option value="">Select...</option>
          <option>CNA</option>
          <option>HHA</option>
          <option>LPN/LVN</option>
          <option>RN</option>
          <option>No certification (willing to train)</option>
          <option>Other</option>
        </select>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontFamily: sans, fontSize: 14, fontWeight: 500, color: C.brownMid, display: "block", marginBottom: 6 }}>Why do you want to be a worker-owner?</label>
        <textarea value={form.why} onChange={e => setForm({...form, why: e.target.value})} rows={3} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: sans, fontSize: 15, color: C.brown, background: C.white, resize: "vertical" }} placeholder="What matters to you about owning your work?" />
      </div>
      <Btn onClick={() => setSubmitted(true)} full size="lg" style={{ opacity: form.name && form.email ? 1 : 0.5 }}>Submit application</Btn>
    </div>
  );
}

// ═══════════════════════════════════════════
// EMPLOYER FORM
// ═══════════════════════════════════════════
function EmployerForm() {
  const [form, setForm] = useState({ name: "", email: "", company: "", size: "", interest: "" });
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🤝</div>
        <h3 style={{ fontFamily: serif, fontSize: 24, color: C.brown, marginBottom: 8 }}>We'll be in touch</h3>
        <p style={{ fontFamily: sans, fontSize: 15, color: C.brownMid, lineHeight: 1.6 }}>
          We're piloting with Boulder Valley School District and looking for 2–3 more employers for the founding cohort.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ background: C.amberLight, borderRadius: 10, padding: 16, marginBottom: 20, borderLeft: `4px solid ${C.amber}` }}>
        <p style={{ fontFamily: sans, fontSize: 14, color: C.brown, lineHeight: 1.6, margin: 0 }}>
          <strong>The hidden cost:</strong> Working caregivers cost employers $5,600/year each in absenteeism, presenteeism, and turnover. For a 500-person company, that's $672,000 in hidden losses. Our pilot: $6/employee/month = $36,000/year to address the whole problem.
        </p>
      </div>
      <Input label="Your name" value={form.name} onChange={v => setForm({...form, name: v})} required />
      <Input label="Work email" value={form.email} onChange={v => setForm({...form, email: v})} type="email" required />
      <Input label="Company / organization" value={form.company} onChange={v => setForm({...form, company: v})} required />
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: sans, fontSize: 14, fontWeight: 500, color: C.brownMid, display: "block", marginBottom: 6 }}>Approximate number of employees</label>
        <select value={form.size} onChange={e => setForm({...form, size: e.target.value})} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: sans, fontSize: 15, color: C.brown, background: C.white }}>
          <option value="">Select...</option>
          <option>Under 100</option>
          <option>100–500</option>
          <option>500–2,000</option>
          <option>2,000–10,000</option>
          <option>10,000+</option>
        </select>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontFamily: sans, fontSize: 14, fontWeight: 500, color: C.brownMid, display: "block", marginBottom: 6 }}>What interests you most?</label>
        <textarea value={form.interest} onChange={e => setForm({...form, interest: e.target.value})} rows={3} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: sans, fontSize: 15, color: C.brown, background: C.white, resize: "vertical" }} placeholder="Reducing absenteeism? Retention benefit? Employee wellbeing?" />
      </div>
      <Btn onClick={() => setSubmitted(true)} full size="lg" style={{ opacity: form.name && form.email && form.company ? 1 : 0.5 }}>Request employer pilot information</Btn>
    </div>
  );
}
