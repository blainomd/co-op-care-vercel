import { useState } from "react";

// ── Fonts ──
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=DM+Sans:wght@400;500;600;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const ff = { display: "'Fraunces', serif", body: "'DM Sans', sans-serif" };
const C = {
  forest: "#1A3D2E", accent: "#B49C78", accentDark: "#8f7d5f",
  text: "#3d3427", textMid: "#5a5147", textLight: "#8a8078", textFaint: "#a89e94",
  bg: "#faf8f5", bgMid: "#f4efe8", bgDark: "#ede7dc", border: "#e8e4df",
  green: "#2d6a4f", greenBg: "#e8f5ee", greenLight: "#6ba588",
  amber: "#b07d2b", amberBg: "#fef8e8",
  red: "#c53030", redBg: "#fef2f2",
  white: "#fff", purple: "#6B46C1", purpleBg: "#F3EEFF",
};

// ═══════════════════════════════════════════
// DEEP MODALS
// ═══════════════════════════════════════════
const DEEP = {
  extraction_pattern: {
    title: "The Extraction Pattern",
    sections: [
      { t: "How It Works Every Time", b: "A tech company builds a robot or autonomous vehicle. They sell it as a service. They capture the margin between operating cost and customer price. The customer saves slightly versus the human-labor alternative. The tech company's shareholders capture the rest. The community that was previously employed loses income. Wealth concentrates. The community hollows." },
      { t: "The Care Economy Example", b: "When Waymo launches autonomous ride-hailing, the $45 a family pays a driver to take Margaret to cardiology flows to Alphabet's balance sheet. When Amazon deploys delivery robots, the $15 that a Time Bank neighbor earns bringing groceries disappears into a logistics algorithm in Seattle. When a monitoring company sells a $200/month subscription, the margin flows to Series C investors." },
      { t: "The Fork", b: "Every technology that enters the aging-in-place market presents the same fork. Path A: the tech company sells to individual families, captures the margin, extracts the data. Path B: the cooperative leases or operates the technology collectively, distributes savings to the pool, retains the data. Co-op.care always takes Path B." },
    ]
  },
  av_transport: {
    title: "Autonomous Medical Transport",
    sections: [
      { t: "The Vehicle", b: "Not consumer robotaxis optimized for 28-year-olds. Vehicles configured for senior transport: wide doors, grab handles, low step-in height, wheelchair ramps, real-time vitals monitoring during transit, and a live human dispatcher who can intervene if Margaret seems confused or distressed." },
      { t: "The Integration", b: "CareOS schedules the appointment. The vehicle arrives at the time the AI determined was optimal for her energy levels and medication schedule. It confirms she is seated safely. It alerts Denise if Margaret's blood pressure reads abnormally during the ride. GPS logs generate EVV compliance data automatically." },
      { t: "The Human Layer", b: "An autonomous vehicle cannot help Margaret out of her chair, down her front steps, and into the car. It cannot notice she seems more confused than last week. Paul (Time Bank neighbor) walks Margaret to the vehicle. A volunteer at BCH meets her at the door. The technology handles the miles. The humans handle the moments." },
      { t: "The Math", b: "Cost per trip: $6–10 for lease amortization, energy, and insurance. Versus $45 for a human driver or $75 for medical transport. Over 200 families averaging 4 medical transports per month: $28,000–$52,000/month stays in the pool instead of flowing to Uber Health." },
    ]
  },
  delivery_robots: {
    title: "Medication & Grocery Delivery",
    sections: [
      { t: "The Use Case", b: "Margaret's metformin needs refilling every 30 days. Blood pressure meds every 90. Groceries twice a week. She can't drive. Karen drives her, missing work. Or delivery apps charge $10–$15 per order, with margins flowing to DoorDash shareholders." },
      { t: "The Accessibility Fix", b: "Margaret can't bend to a small sidewalk robot — she has a bad knee, she's 74. The cooperative specifies robots with elevated cargo compartments, or installs a $150 receiving shelf at Margaret's front door at wheelchair height. The home modification pool already funds accessibility upgrades." },
      { t: "The Intelligence Layer", b: "CareOS tracks nutrition patterns from delivery data. If Margaret stops ordering fresh vegetables and starts ordering only frozen meals, the AI flags a potential decline in self-care capacity and schedules an earlier CRI reassessment. Every delivery is a data point." },
      { t: "The Economics", b: "Cost per delivery: $2–4. Versus $10–15 for Instacart. Over 200 households averaging 8 deliveries per month: $9,600–$17,600/month in savings retained by the cooperative." },
    ]
  },
  monitoring: {
    title: "Cooperative Monitoring Network",
    sections: [
      { t: "The Extraction Problem", b: "A $200/month fall detection subscription from a commercial provider is pure extraction. Hardware costs $40. Cellular: $5/month. Monitoring center: $3/alert. The remaining $192/month is margin for the company and its investors." },
      { t: "The Cooperative Model", b: "Hardware purchased at wholesale. Shared monitoring hub staffed by trained Time Bank coordinators supervised by the clinical director. Cost per household drops from $200/month to $15–25/month. Data feeds directly into CareOS — integrated with the clinical record instead of sitting in a separate silo." },
      { t: "The Escalation Protocol", b: "Tier 1: Time Bank coordinator notices Margaret's motion sensor hasn't triggered by 8:30 AM. Calls Margaret. Tier 2: Margaret doesn't answer. Coordinator dispatches Paul for in-person check. Tier 3: Paul finds Margaret on the floor. 911 called. System simultaneously alerts Denise, Karen, Margaret's PCP, and the clinical director. Every step documented in CareOS." },
      { t: "What's Monitored", b: "Motion patterns (activity levels, sleep quality). Fall detection and gait analysis. Medication dispensing timestamps. Vital signs (BP, glucose from connected devices). Door sensors (leaving home, visitor patterns). Kitchen activity (nutrition proxy). Bathroom frequency (UTI early detection)." },
    ]
  },
  leasing_strategy: {
    title: "Why Lease, Not Buy",
    sections: [
      { t: "Technology Obsolescence", b: "An autonomous vehicle purchased in 2027 is obsolete by 2030. A delivery robot purchased today costs half as much in two years. Leasing transfers obsolescence risk to the lessor. The cooperative always operates current-generation technology." },
      { t: "Balance Sheet Protection", b: "Leasing is an operating expense, not a capital expenditure. Pool funds stay available for insurance reserves and captive formation capitalization ($500K threshold) instead of being tied up in depreciating hardware." },
      { t: "Federation Leverage", b: "One cooperative leasing 5 vehicles has no leverage. Thirty cooperatives leasing 150 vehicles negotiate as a fleet. The national entity handles lease negotiation. Local cooperatives operate the vehicles. The federated structure creates a buying consortium." },
      { t: "Data as Currency", b: "Data from 200 elderly passengers using autonomous vehicles in real conditions — mobility patterns, assistance needs, comfort thresholds, emergency scenarios — is extraordinarily valuable to AV manufacturers. The cooperative trades anonymized data access for reduced lease rates. The cooperative owns the data. The cooperative negotiates from strength." },
    ]
  },
  human_role: {
    title: "Automation + Humans = Better Care",
    sections: [
      { t: "What Automation Replaces", b: "Driving (lowest-value, highest-liability). Package carrying. Dashboard monitoring during overnight hours. Medication dispensing logistics. Route optimization. Scheduling. Documentation formatting." },
      { t: "What Humans Do Better", b: "Walking Margaret to the vehicle. Sitting in the waiting room. Noticing Margaret seems more anxious than usual. Putting groceries away and spotting expired milk. Holding Margaret's hand during a scary diagnosis. Telling Denise that Margaret asked about her deceased husband three times today." },
      { t: "The Evolution", b: "Paul never just drove Margaret to the doctor. Paul walked her to the car, sat with her in the waiting room, noticed she was anxious, mentioned it to Denise. The autonomous vehicle freed Paul from driving — the lowest-value part — and let him focus on companionship, observation, and social connection that actually prevent decline." },
      { t: "The Credit Shift", b: "Paul still earns Time Bank credits. He earns them for being human, not for operating a steering wheel. The robot delivers groceries. The neighbor puts them away and notices the expired milk. The AV drives to the hospital. The neighbor holds Margaret's hand." },
    ]
  },
  future_tech: {
    title: "The Technology Roadmap",
    sections: [
      { t: "AI Diagnostics (2027–2028)", b: "Voice pattern analysis detecting cognitive decline. Gait analysis predicting falls. Pharmacy record analysis identifying medication interactions. Commercial companies will sell subscriptions at $50–200/month. The cooperative runs these on its own infrastructure using CareOS data at marginal cost." },
      { t: "Ambient Monitoring (2028–2029)", b: "Passive health tracking embedded in furniture, flooring, bathroom fixtures. Smart toilets detecting UTIs. Smart beds monitoring sleep apnea. The cooperative installs as part of the home modification pool and owns the data stream." },
      { t: "Companion Devices (2029+)", b: "Simple devices providing medication reminders, video calls, music, emergency detection. Not creepy humanoids. Functional companions. Marketed to seniors at $100–300/month individually. The cooperative leases in bulk, configures for CareOS, deploys as part of membership." },
      { t: "The National Tech Evaluation Function", b: "The national entity tests devices, negotiates fleet pricing, develops CareOS integration protocols, and deploys proven technology to local cooperatives. One evaluation team serves 30 cooperatives. Cost absorbed by the 5% federation fee. No local cooperative needs a technology officer." },
    ]
  },
};

function Modal({ topic, onClose }) {
  if (!topic || !DEEP[topic]) return null;
  const d = DEEP[topic];
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      backdropFilter: "blur(4px)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.white, borderRadius: 20, maxWidth: 560, width: "100%",
        maxHeight: "80vh", overflow: "auto", padding: "32px 28px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <h2 style={{ fontFamily: ff.display, fontSize: 22, fontWeight: 600, color: C.forest, margin: 0, lineHeight: 1.3, flex: 1, paddingRight: 16 }}>{d.title}</h2>
          <button onClick={onClose} style={{
            background: C.bgMid, border: "none", borderRadius: 8, width: 32, height: 32,
            cursor: "pointer", fontSize: 16, color: C.textLight, flexShrink: 0,
          }}>✕</button>
        </div>
        {d.sections.map((s, i) => (
          <div key={i} style={{ marginBottom: i < d.sections.length - 1 ? 20 : 0 }}>
            <h3 style={{ fontFamily: ff.display, fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 6 }}>{s.t}</h3>
            <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.7, margin: 0 }}>{s.b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// VALUE FLOW COMPARISON
// ═══════════════════════════════════════════
function ValueFlowComparison({ openModal }) {
  const [mode, setMode] = useState("extraction"); // extraction | cooperative

  const extraction = [
    { label: "Family Pays", amount: "$45", color: C.red },
    { label: "Platform Takes", amount: "$37", color: C.red, pct: 82 },
    { label: "Driver Receives", amount: "$8", color: C.textLight, pct: 18 },
    { label: "Community Gets", amount: "$0", color: C.textFaint, pct: 0 },
  ];

  const cooperative = [
    { label: "Family Pays (Pool)", amount: "$8", color: C.green },
    { label: "AV Operating Cost", amount: "$6", color: C.greenLight, pct: 75 },
    { label: "Pool Retains", amount: "$37", color: C.forest, pct: 82 },
    { label: "Community Reinvested", amount: "$37", color: C.green, pct: 82 },
  ];

  const data = mode === "extraction" ? extraction : cooperative;

  return (
    <div onClick={() => openModal("extraction_pattern")} style={{ cursor: "pointer" }}>
      {/* Toggle */}
      <div style={{ display: "flex", gap: 4, background: C.bg, borderRadius: 10, padding: 3, marginBottom: 16 }}>
        {[
          { id: "extraction", label: "Extraction Model" },
          { id: "cooperative", label: "Cooperative Model" },
        ].map(m => (
          <button key={m.id} onClick={(e) => { e.stopPropagation(); setMode(m.id); }} style={{
            flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: mode === m.id ? (m.id === "extraction" ? C.red : C.forest) : "transparent",
            color: mode === m.id ? "#fff" : C.textLight,
            border: "none", cursor: "pointer", fontFamily: ff.body,
            transition: "all 0.2s ease",
          }}>{m.label}</button>
        ))}
      </div>

      {/* Flow */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: C.textMid, width: 120, textAlign: "right" }}>{item.label}</span>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
              {i > 0 && (
                <div style={{
                  height: 24, borderRadius: 6, background: item.color,
                  width: `${Math.max(item.pct || 5, 8)}%`, minWidth: 32,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: "#fff",
                  transition: "width 0.4s ease",
                }}>{item.pct}%</div>
              )}
              <span style={{
                fontSize: 16, fontWeight: 700, color: item.color,
                fontFamily: ff.display,
              }}>{item.amount}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 14, padding: "10px 14px", borderRadius: 8,
        background: mode === "extraction" ? C.redBg : C.greenBg,
        border: `1px solid ${mode === "extraction" ? C.red : C.green}20`,
      }}>
        <p style={{ fontSize: 12.5, color: C.textMid, lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>
          {mode === "extraction"
            ? "The $37 difference between what families pay and what the driver earns flows to Uber/Waymo shareholders. The community gets nothing."
            : "The $37 saved per trip stays in the cooperative pool — funding Margaret's bathroom remodel, Karen's respite hours, and Denise's equity account."}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// SAVINGS CALCULATOR
// ═══════════════════════════════════════════
function SavingsCalculator() {
  const [households, setHouseholds] = useState(200);

  const transportTrips = households * 4;
  const transportSaving = transportTrips * 37;
  const deliveries = households * 8;
  const deliverySaving = deliveries * 9;
  const monitoringSaving = households * 175;
  const totalMonthly = transportSaving + deliverySaving + monitoringSaving;
  const totalAnnual = totalMonthly * 12;

  return (
    <div style={{
      background: C.white, borderRadius: 16, padding: "24px 22px",
      border: `1px solid ${C.border}`,
    }}>
      <h3 style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 16 }}>
        Savings Calculator
      </h3>

      {/* Household slider */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.textMid }}>Member Households</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.forest, fontFamily: ff.display }}>{households}</span>
        </div>
        <input type="range" min="50" max="500" step="10" value={households}
          onChange={e => setHouseholds(+e.target.value)}
          style={{ width: "100%", accentColor: C.forest }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textFaint }}>
          <span>50</span><span>200</span><span>350</span><span>500</span>
        </div>
      </div>

      {/* Breakdown */}
      {[
        { label: "Medical Transport", icon: "🚗", saving: transportSaving, detail: `${transportTrips} trips × $37 saved` },
        { label: "Delivery Robots", icon: "📦", saving: deliverySaving, detail: `${deliveries} deliveries × $9 saved` },
        { label: "Monitoring Network", icon: "📡", saving: monitoringSaving, detail: `${households} homes × $175/mo saved` },
      ].map((item, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
          borderBottom: i < 2 ? `1px solid ${C.border}` : "none",
        }}>
          <span style={{ fontSize: 18 }}>{item.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.label}</div>
            <div style={{ fontSize: 11, color: C.textLight }}>{item.detail}</div>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.green, fontFamily: ff.display }}>
            ${item.saving.toLocaleString()}
          </span>
        </div>
      ))}

      {/* Total */}
      <div style={{
        marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
      }}>
        <div style={{ background: C.greenBg, borderRadius: 12, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.green, fontFamily: ff.display }}>
            ${(totalMonthly / 1000).toFixed(0)}K
          </div>
          <div style={{ fontSize: 11, color: C.textLight }}>saved per month</div>
        </div>
        <div style={{ background: C.forest, borderRadius: 12, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", fontFamily: ff.display }}>
            ${(totalAnnual / 1000000).toFixed(1)}M
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>retained annually</div>
        </div>
      </div>

      <p style={{ fontSize: 11, color: C.textFaint, textAlign: "center", marginTop: 10, fontStyle: "italic" }}>
        Every dollar saved stays in the cooperative pool — not on a shareholder balance sheet.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
export default function AutomationInfrastructure() {
  const [modal, setModal] = useState(null);
  const [tab, setTab] = useState("thesis"); // thesis | fleet | monitor | future

  const tabs = [
    { id: "thesis", label: "The Thesis" },
    { id: "fleet", label: "The Fleet" },
    { id: "monitor", label: "Monitoring" },
    { id: "future", label: "Roadmap" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(168deg, ${C.bg} 0%, ${C.bgMid} 40%, ${C.bgDark} 100%)`,
      fontFamily: ff.body, padding: "20px 16px",
    }}>
      <Modal topic={modal} onClose={() => setModal(null)} />

      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            display: "inline-block", padding: "5px 16px", borderRadius: 20,
            background: `${C.forest}10`, border: `1px solid ${C.forest}20`,
            fontSize: 11, fontWeight: 600, color: C.forest, marginBottom: 12, letterSpacing: 1,
          }}>COOPERATIVE INFRASTRUCTURE</div>
          <h1 style={{
            fontFamily: ff.display, fontSize: 26, fontWeight: 700,
            color: C.forest, lineHeight: 1.25, marginBottom: 10,
          }}>
            When a robot delivers Margaret's medication for $3, where does the $12 go?
          </h1>
          <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>
            Autonomous vehicles, delivery robots, and smart monitoring — owned by the cooperative, not by shareholders. Every dollar saved stays in the community.
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, background: C.white, borderRadius: 12, padding: 4,
          border: `1px solid ${C.border}`, marginBottom: 20,
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "10px 6px", borderRadius: 9, fontSize: 12, fontWeight: 600,
              background: tab === t.id ? C.forest : "transparent",
              color: tab === t.id ? "#fff" : C.textLight,
              border: "none", cursor: "pointer", fontFamily: ff.body,
              transition: "all 0.2s ease", whiteSpace: "nowrap",
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── THESIS TAB ── */}
        {tab === "thesis" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Value flow comparison */}
            <div style={{
              background: C.white, borderRadius: 16, padding: "24px 22px",
              border: `1px solid ${C.border}`,
            }}>
              <h3 style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 14 }}>
                One ride. Two paths. Entirely different outcomes.
              </h3>
              <ValueFlowComparison openModal={setModal} />
            </div>

            {/* The three systems */}
            {[
              { topic: "av_transport", icon: "🚗", label: "Medical Transport", stat: "$37 saved/trip", statColor: C.green, bg: C.greenBg, border: C.green,
                desc: "Autonomous vehicles configured for senior mobility. Wide doors, grab handles, vitals monitoring. CareOS schedules. Time Bank neighbors handle the human moments." },
              { topic: "delivery_robots", icon: "📦", label: "Medication & Grocery Delivery", stat: "$9 saved/delivery", statColor: C.amber, bg: C.amberBg, border: C.amber,
                desc: "Sidewalk robots with elevated cargo and accessible receiving shelves. CareOS tracks nutrition patterns. Pharmacy bulk purchasing. Zero extraction." },
              { topic: "monitoring", icon: "📡", label: "Home Monitoring Network", stat: "$175/mo saved", statColor: C.red, bg: C.redBg, border: C.red,
                desc: "Wholesale hardware. Time Bank coordinators. Clinical escalation protocol. Data feeds CareOS — not a separate silo. $200/mo commercial subscription drops to $15–25." },
            ].map(sys => (
              <div key={sys.topic}
                onClick={() => setModal(sys.topic)}
                style={{
                  background: sys.bg, borderRadius: 16, padding: "22px 20px",
                  border: `1px solid ${sys.border}20`, cursor: "pointer",
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{sys.icon}</span>
                    <h3 style={{ fontFamily: ff.display, fontSize: 17, fontWeight: 600, color: C.text, margin: 0 }}>
                      {sys.label}
                    </h3>
                  </div>
                  <span style={{
                    padding: "4px 10px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                    color: sys.statColor, background: `${sys.statColor}15`,
                  }}>{sys.stat}</span>
                </div>
                <p style={{ fontSize: 13.5, color: C.textMid, lineHeight: 1.6, margin: 0 }}>{sys.desc}</p>
              </div>
            ))}

            {/* Human + automation card */}
            <div
              onClick={() => setModal("human_role")}
              style={{
                background: "linear-gradient(135deg, #1A3D2E, #2d5a3e)",
                borderRadius: 16, padding: "24px 22px", color: "#fff",
                cursor: "pointer",
              }}
            >
              <h3 style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                Automation does not replace humans. It frees them.
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.65, opacity: 0.9, margin: 0 }}>
                The robot delivers the groceries. The neighbor puts them away and notices the expired milk.
                The AV drives to the hospital. The neighbor holds Margaret's hand in the waiting room.
                Paul still earns his Time Bank credits. He earns them for being human, not for operating a steering wheel.
              </p>
            </div>
          </div>
        )}

        {/* ── FLEET TAB ── */}
        {tab === "fleet" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* AV detail */}
            <div style={{
              background: C.white, borderRadius: 16, padding: "24px 22px",
              border: `1px solid ${C.border}`,
            }}>
              <h3 style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 14 }}>
                Senior-Configured Autonomous Transport
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[
                  { icon: "🚪", label: "Wide doors + low step-in" },
                  { icon: "🦽", label: "Wheelchair ramp" },
                  { icon: "💓", label: "In-transit vitals" },
                  { icon: "🧑‍💻", label: "Live human dispatcher" },
                  { icon: "📍", label: "CareOS scheduling" },
                  { icon: "📋", label: "Automatic EVV logging" },
                ].map(f => (
                  <div key={f.label} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 12px", borderRadius: 10, background: C.bg,
                    border: `1px solid ${C.border}`,
                  }}>
                    <span style={{ fontSize: 16 }}>{f.icon}</span>
                    <span style={{ fontSize: 12.5, color: C.textMid, fontWeight: 500 }}>{f.label}</span>
                  </div>
                ))}
              </div>

              {/* Cost comparison */}
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textLight, marginBottom: 8, letterSpacing: 0.5 }}>
                COST PER MEDICAL TRIP
              </div>
              {[
                { label: "Medical transport service", cost: "$75", color: C.red },
                { label: "Rideshare (Uber/Lyft)", cost: "$45", color: C.amber },
                { label: "Karen drives (hidden cost)", cost: "$35+", color: C.textLight },
                { label: "Co-op.care AV", cost: "$8", color: C.green },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "7px 0",
                  borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
                }}>
                  <div style={{
                    width: `${(parseFloat(item.cost.replace(/[$+]/g, '')) / 75) * 100}%`,
                    height: 8, borderRadius: 4, background: item.color,
                    minWidth: 16, transition: "width 0.4s ease",
                  }} />
                  <span style={{ fontSize: 12, color: C.textMid, flex: 1 }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: item.color, fontFamily: ff.display }}>{item.cost}</span>
                </div>
              ))}
            </div>

            {/* Delivery robots */}
            <div
              onClick={() => setModal("delivery_robots")}
              style={{
                background: C.white, borderRadius: 16, padding: "24px 22px",
                border: `1px solid ${C.border}`, cursor: "pointer",
              }}
            >
              <h3 style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 12 }}>
                Medication + Grocery Delivery
              </h3>
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1, background: C.greenBg, borderRadius: 10, padding: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.green, fontFamily: ff.display }}>$3</div>
                  <div style={{ fontSize: 10, color: C.textLight }}>cost per delivery</div>
                </div>
                <div style={{ flex: 1, background: C.redBg, borderRadius: 10, padding: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.red, fontFamily: ff.display }}>$12</div>
                  <div style={{ fontSize: 10, color: C.textLight }}>Instacart average</div>
                </div>
                <div style={{ flex: 1, background: C.amberBg, borderRadius: 10, padding: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.amber, fontFamily: ff.display }}>$9</div>
                  <div style={{ fontSize: 10, color: C.textLight }}>stays in pool</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, margin: 0 }}>
                Bulk pharmacy purchasing. Accessible receiving shelves ($150, funded by home mod pool). CareOS tracks nutrition patterns — if Margaret stops ordering fresh vegetables, the AI flags a potential decline and schedules an earlier CRI reassessment.
              </p>
            </div>

            {/* Leasing strategy */}
            <div
              onClick={() => setModal("leasing_strategy")}
              style={{
                background: C.amberBg, borderRadius: 16, padding: "24px 22px",
                border: `1px solid ${C.amber}20`, cursor: "pointer",
              }}
            >
              <h3 style={{ fontFamily: ff.display, fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8 }}>
                Lease, don't buy. Federate, don't fragment.
              </h3>
              <p style={{ fontSize: 13.5, color: C.textMid, lineHeight: 1.6, margin: 0 }}>
                Technology changes too fast to own. Leasing transfers obsolescence risk. And 30 cooperatives leasing 150 vehicles as a federation negotiate fleet pricing no individual family could access. The national brain evaluates. The local hands deploy.
              </p>
            </div>

            <SavingsCalculator />
          </div>
        )}

        {/* ── MONITORING TAB ── */}
        {tab === "monitor" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* The extraction expose */}
            <div style={{
              background: C.redBg, borderRadius: 16, padding: "24px 22px",
              border: `1px solid ${C.red}20`,
            }}>
              <h3 style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 10 }}>
                The $200/month monitoring scam
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                {[
                  { label: "Hardware", cost: "$40", pct: "one-time" },
                  { label: "Cellular", cost: "$5/mo", pct: "2.5%" },
                  { label: "Monitoring", cost: "$3/alert", pct: "1.5%" },
                  { label: "Extraction", cost: "$192/mo", pct: "96%" },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.red, fontFamily: ff.display }}>{item.cost}</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>{item.label}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.5, margin: 0 }}>
                96% of what families pay for fall detection is margin for the company and its investors. The cooperative model: wholesale hardware, Time Bank coordinators, CareOS integration. Cost drops to $15–25/month.
              </p>
            </div>

            {/* What's monitored */}
            <div
              onClick={() => setModal("monitoring")}
              style={{
                background: C.white, borderRadius: 16, padding: "24px 22px",
                border: `1px solid ${C.border}`, cursor: "pointer",
              }}
            >
              <h3 style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 14 }}>
                Cooperative Monitoring Network
              </h3>
              {[
                { icon: "🚶", label: "Motion patterns", desc: "Activity levels, sleep quality, daily routine changes" },
                { icon: "⚠️", label: "Fall detection", desc: "Real-time alerts with automated escalation protocol" },
                { icon: "💊", label: "Medication dispensing", desc: "Timestamps confirm adherence, flag missed doses" },
                { icon: "💓", label: "Vital signs", desc: "BP, glucose from connected devices — trends visible to PCP" },
                { icon: "🚪", label: "Door sensors", desc: "Departure patterns, visitor frequency, wandering detection" },
                { icon: "🍳", label: "Kitchen activity", desc: "Nutrition proxy — declining use flags self-care decline" },
                { icon: "🚻", label: "Bathroom frequency", desc: "UTI early detection, continence pattern changes" },
              ].map(item => (
                <div key={item.label} style={{
                  display: "flex", gap: 12, padding: "8px 0",
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: C.textLight }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Escalation protocol */}
            <div style={{
              background: C.white, borderRadius: 16, padding: "24px 22px",
              border: `1px solid ${C.border}`,
            }}>
              <h3 style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 14 }}>
                Three-Tier Escalation Protocol
              </h3>
              {[
                { tier: "1", title: "Time Bank Coordinator", desc: "Margaret's motion sensor hasn't triggered by 8:30 AM. Coordinator calls Margaret.", time: "0–5 min", color: C.greenLight },
                { tier: "2", title: "Neighbor Dispatch", desc: "Margaret doesn't answer. Paul dispatched for in-person check. 3 blocks away.", time: "5–15 min", color: C.amber },
                { tier: "3", title: "Emergency + Clinical", desc: "Paul finds Margaret on floor. 911 called. System alerts Denise, Karen, PCP, clinical director simultaneously.", time: "15–20 min", color: C.red },
              ].map((step, i) => (
                <div key={i} style={{
                  display: "flex", gap: 14, marginBottom: i < 2 ? 14 : 0,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: step.color, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 700, fontFamily: ff.display,
                  }}>
                    {step.tier}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{step.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: step.color }}>{step.time}</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: C.textMid, lineHeight: 1.5, margin: "3px 0 0" }}>{step.desc}</p>
                  </div>
                </div>
              ))}

              <p style={{ fontSize: 12, color: C.textLight, marginTop: 14, fontStyle: "italic" }}>
                Every escalation step documented in CareOS. Every response time tracked. Every outcome feeds the risk model.
              </p>
            </div>
          </div>
        )}

        {/* ── ROADMAP TAB ── */}
        {tab === "future" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { year: "2026–2027", title: "Foundation Fleet", items: [
                "Autonomous medical transport pilot (3–5 vehicles per geography)",
                "Sidewalk delivery robots for medication and groceries",
                "Cooperative monitoring network with Time Bank coordinators",
                "CareOS integration for all autonomous systems",
              ], color: C.green },
              { year: "2027–2028", title: "AI Diagnostics Layer", items: [
                "Voice pattern analysis detecting cognitive decline",
                "Gait analysis predicting falls from motion sensor data",
                "Pharmacy record analysis for medication interaction risks",
                "All running on cooperative infrastructure, not $200/mo subscriptions",
              ], color: C.accent },
              { year: "2028–2029", title: "Ambient Intelligence", items: [
                "Passive health tracking embedded in furniture and flooring",
                "Smart bathroom fixtures (UTI detection, fall prevention)",
                "Smart beds (sleep apnea monitoring, restlessness tracking)",
                "Installed via home modification pool, data owned by cooperative",
              ], color: C.amber },
              { year: "2029+", title: "Companion Ecosystem", items: [
                "Functional companion devices (medication, video calls, music)",
                "Coordinated with CareOS and Time Bank for seamless care",
                "Bulk-leased, cooperatively configured, membership-included",
                "National Tech Evaluation function serving 30+ cooperatives",
              ], color: C.forest },
            ].map((phase, i) => (
              <div key={i}
                onClick={() => setModal("future_tech")}
                style={{
                  background: C.white, borderRadius: 16, padding: "22px 20px",
                  border: `1px solid ${C.border}`, cursor: "pointer",
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{
                    padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                    color: "#fff", background: phase.color,
                  }}>{phase.year}</span>
                  <h3 style={{ fontFamily: ff.display, fontSize: 17, fontWeight: 600, color: C.text, margin: 0 }}>
                    {phase.title}
                  </h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {phase.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%", background: phase.color,
                        flexShrink: 0, marginTop: 6, opacity: 0.6,
                      }} />
                      <span style={{ fontSize: 13, color: C.textMid, lineHeight: 1.45 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* The principle */}
            <div style={{
              background: "linear-gradient(135deg, #1A3D2E, #2d5a3e)",
              borderRadius: 16, padding: "24px 22px", color: "#fff",
            }}>
              <h3 style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 600, marginBottom: 10 }}>
                The Principle
              </h3>
              <p style={{
                fontFamily: ff.display, fontSize: 15, fontWeight: 400,
                lineHeight: 1.7, margin: 0, fontStyle: "italic", opacity: 0.95,
              }}>
                Every technology that enters the aging-in-place market presents the same fork. The tech company sells to individual families, captures the margin, extracts the data. Or the cooperative leases it collectively, distributes savings to the pool, retains the data, and uses it to make insurance more accurate and care more effective. Co-op.care exists to always take the second path.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <p style={{
          textAlign: "center", fontSize: 12, color: C.textFaint,
          marginTop: 28, fontWeight: 500,
        }}>
          co-op.care · Boulder, Colorado · Worker-owned, neighbor-powered
        </p>
      </div>
    </div>
  );
}
