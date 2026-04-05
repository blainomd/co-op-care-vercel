import { useState, useEffect, useRef } from "react";

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
  white: "#fff",
};

// ═══════════════════════════════════════════
// GEOGRAPHY DATA — Colorado School Districts
// ═══════════════════════════════════════════
const GEOGRAPHIES = [
  { id: "bvsd", name: "Boulder Valley", county: "Boulder County", households: 42000, commitments: 186, target: 200, status: "hot", employers: ["BVSD", "CU Boulder", "Ball Aerospace"], lat: 40.015, lng: -105.27 },
  { id: "svvsd", name: "St. Vrain Valley", county: "Boulder/Weld", households: 35000, commitments: 89, target: 200, status: "growing", employers: ["SVVSD", "IBM", "Seagate"], lat: 40.167, lng: -105.101 },
  { id: "thompson", name: "Thompson R2-J", county: "Larimer County", households: 28000, commitments: 43, target: 200, status: "early", employers: ["Thompson Schools", "UCHealth"], lat: 40.395, lng: -105.075 },
  { id: "psd", name: "Poudre", county: "Larimer County", households: 52000, commitments: 31, target: 200, status: "early", employers: ["CSU", "Poudre Schools", "HP"], lat: 40.585, lng: -105.084 },
  { id: "dps", name: "Denver Public", county: "Denver", households: 125000, commitments: 67, target: 200, status: "growing", employers: ["DPS", "UCHealth Denver", "State of CO"], lat: 39.739, lng: -104.99 },
  { id: "jeffco", name: "Jeffco Public", county: "Jefferson County", households: 98000, commitments: 22, target: 200, status: "early", employers: ["Jeffco Schools", "Lockheed Martin"], lat: 39.744, lng: -105.207 },
  { id: "cherry_creek", name: "Cherry Creek", county: "Arapahoe County", households: 65000, commitments: 14, target: 200, status: "seeding", employers: ["Cherry Creek Schools"], lat: 39.635, lng: -104.84 },
  { id: "d11", name: "Colorado Springs D11", county: "El Paso County", households: 48000, commitments: 8, target: 200, status: "seeding", employers: ["D11", "US Olympic Center", "USAFA"], lat: 38.834, lng: -104.821 },
];

const STATUS_LABELS = {
  hot: { label: "Almost There", color: C.red, bg: C.redBg },
  growing: { label: "Building Momentum", color: C.amber, bg: C.amberBg },
  early: { label: "Growing", color: C.green, bg: C.greenBg },
  seeding: { label: "Just Started", color: C.textLight, bg: C.bgMid },
};

// ═══════════════════════════════════════════
// DEEP MODALS
// ═══════════════════════════════════════════
const DEEP = {
  commitment: {
    title: "The $100 Founding Commitment",
    sections: [
      { t: "What It Is", b: "A refundable deposit that converts into your first month of cooperative membership upon activation. Not a donation. Not a fee. A reservation in the system you are helping to build." },
      { t: "What You Get Immediately", b: "Unlimited CareCheck assessments (CII for your burnout, CRI for your loved one's acuity). Digital Time Bank enrollment — start logging neighbor care hours today. Access to your geography's private community of committed families. Shareable care plan summaries for your parent's physician." },
      { t: "What Triggers Activation", b: "200 commitments in a single school district geography. This threshold produces $20,000 in seed capital, 200 families who have self-identified as needing care, and a proven demand signal that justifies every subsequent investment: caregiver recruitment, training, home safety assessments, Time Bank coordination, and cooperative legal formation." },
      { t: "What If You Can't Afford $100?", b: "The Work-for-Membership pathway starts pre-activation. 10 hours of verified Time Bank service equals a $100 commitment credit. Help a neighbor with groceries, sit with someone's parent, drive someone to a doctor's appointment. You appear on the activation wall the same as everyone else. You are a founding member. Not a charity case." },
    ]
  },
  activation: {
    title: "The 90-Day Activation Sequence",
    sections: [
      { t: "Week 1–2: Cooperative Formation", b: "The $20,000 seed capital funds legal formation of the local cooperative entity. Colorado Care Cooperative is formed with RMEOC technical assistance, eligible for the Colorado Employee Ownership Tax Credit covering 75% of formation costs. Effective out-of-pocket: $3,000–$5,000." },
      { t: "Week 2–4: Caregiver Recruitment & Training", b: "Positions posted at $25–$28/hour W-2 with equity — $8–$11 above local median. 40-hour training cohort: Omaha System documentation, CareOS mobile app, Time Bank coordination, cooperative governance, and clinical protocols for fall prevention, medication management, diabetes, hypertension, post-surgical recovery, and dementia companionship." },
      { t: "Week 3–5: Home Safety Blitz", b: "Every committed family receives a free, comprehensive home safety assessment: grab bars, lighting, trip hazards, stair access, bathroom accessibility, kitchen safety, medication storage, emergency egress. Documented in CareOS with prioritized modification list. The single most effective conversion tool in the model." },
      { t: "Week 5–8: Time Bank Launch", b: "Digital Time Bank becomes coordinated local network. Part-time coordinator matches neighbors to families. CBI background checks completed. 40-hour Work-for-Membership pathway formalized. Pre-activation hours recognized." },
      { t: "Week 6–10: First Care Delivery", b: "Highest-acuity families identified through CRI receive first professional caregiver visits. The Margarets with fall risk scores of 4. The Karens with CII scores in the red. Demonstrate value immediately with families who need it most." },
      { t: "Week 8–12: Pool Activation", b: "Committed families convert to full annual memberships. HSA/FSA payment integration goes live. Pool begins collecting. First home modifications funded. First family caregiver stipends disbursed. By day 90: functioning cooperative." },
    ]
  },
  economics: {
    title: "The Activation Economics",
    sections: [
      { t: "Seed Capital Deployment", b: "$3K–5K cooperative legal formation (net of 75% tax credit). $4K–6K caregiver recruitment and 40-hour training. $3K–4K home safety assessment blitz. $2K–3K Time Bank coordination setup. $2K–3K local marketing and community events. Remainder held as operating reserve." },
      { t: "Steady-State Revenue", b: "140 active members × $2,100 average annual membership = $294,000 pool revenue. Plus ACCESS OAP revenue from qualifying patients. Plus employer PMPM from local employers. Plus hospital retainer for discharge coordination." },
      { t: "Federation Economics", b: "National Co-op.care entity charges 5% administrative fee on all local pool revenue. This funds shared clinical director, technology platform, training curriculum, and new geography activation reserves. 5% is a fraction of the 40–60% traditional agencies extract." },
    ]
  },
  work_for_membership: {
    title: "Work-for-Membership Pathway",
    sections: [
      { t: "The Model", b: "40 hours of verified Time Bank service per year = Companion-tier membership at zero cash cost. That's roughly 45 minutes per week — achievable, meaningful, and community-building." },
      { t: "Pre-Activation Credit", b: "10 hours of Time Bank service before activation equals a $100 commitment credit. A single mother caring for her father on a $38,000 salary can earn her founding membership by helping neighbors. She appears on the activation wall the same as everyone else." },
      { t: "The Flywheel", b: "Every Work-for-Membership participant expands the care network. More contributors → larger network → more valuable membership → more contributors. A Time Bank member building their own safety net. When their own parent needs help 2 years later, they're already enrolled, home assessed, CRI baseline documented." },
      { t: "Not a Loss Leader", b: "The most efficient patient acquisition channel. Every dollar of membership not paid in cash is offset by labor contributed plus the lifetime value of eventual paid membership conversion. 60% of Work-for-Membership participants convert to paid tiers within 18 months." },
    ]
  },
  geography: {
    title: "Why School Districts?",
    sections: [
      { t: "Employer Alignment", b: "School districts map to employer benefit distribution. When BVSD offers the Co-op.care HSA benefit, every teacher in the district is a potential committed family. The employer channel and the geographic channel align perfectly." },
      { t: "Community Identity", b: "People say 'I live in Boulder Valley' or 'I'm in St. Vrain.' They don't say 'I live in census tract 0801.02.' The activation map reflects how people actually think about where they live." },
      { t: "Proximity", b: "Districts are large enough to sustain a cooperative (30,000–60,000 households) but small enough that caregivers and neighbors are genuinely proximate. A caregiver in Longmont cannot serve Castle Rock. She can absolutely serve Niwot." },
      { t: "Natural Expansion", b: "Boulder Valley activates first. Families in St. Vrain see neighbors receiving care and commit. St. Vrain hits 200. Then Thompson. Then DPS. Each activation self-funded. No geography subsidizes another. The national entity provides tech. The local cooperative provides care." },
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
// GEOGRAPHY CARD
// ═══════════════════════════════════════════
function GeographyCard({ geo, onSelect, isSelected, onCommit }) {
  const pct = Math.round((geo.commitments / geo.target) * 100);
  const remaining = geo.target - geo.commitments;
  const st = STATUS_LABELS[geo.status];
  const isHot = geo.status === "hot";
  const poolRevenue = Math.round(geo.commitments * 0.7 * 2100);

  return (
    <div
      onClick={() => onSelect(geo.id)}
      style={{
        background: isSelected ? `${C.forest}05` : C.white,
        borderRadius: 16, padding: "20px 18px",
        border: isSelected ? `2px solid ${C.forest}40` : `1px solid ${C.border}`,
        cursor: "pointer", transition: "all 0.2s ease",
        boxShadow: isSelected ? "0 4px 20px rgba(26,61,46,0.1)" : "0 1px 4px rgba(0,0,0,0.03)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <h3 style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 600, color: C.text, margin: 0, lineHeight: 1.2 }}>
            {geo.name}
          </h3>
          <span style={{ fontSize: 12, color: C.textLight }}>{geo.county}</span>
        </div>
        <span style={{
          padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
          background: st.bg, color: st.color, border: `1px solid ${st.color}20`,
        }}>
          {st.label}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
            {geo.commitments} of {geo.target} families
          </span>
          <span style={{
            fontSize: 13, fontWeight: 700, color: isHot ? C.red : C.accent,
            fontFamily: ff.display,
          }}>
            {pct}%
          </span>
        </div>
        <div style={{ height: 10, background: C.bgDark, borderRadius: 5, overflow: "hidden", position: "relative" }}>
          <div style={{
            height: "100%", borderRadius: 5,
            width: `${pct}%`,
            background: isHot
              ? "linear-gradient(90deg, #c53030, #e53e3e)"
              : pct > 40
                ? "linear-gradient(90deg, #b07d2b, #d4a44a)"
                : `linear-gradient(90deg, ${C.green}, ${C.greenLight})`,
            transition: "width 0.8s ease",
          }} />
          {isHot && (
            <div style={{
              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
              fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: 0.5,
            }}>
              {remaining} TO GO
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 8, marginBottom: isSelected ? 16 : 0 }}>
        <div style={{ flex: 1, background: C.bg, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.forest, fontFamily: ff.display }}>
            ${(geo.commitments * 100).toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: C.textLight }}>Seed Capital</div>
        </div>
        <div style={{ flex: 1, background: C.bg, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.green, fontFamily: ff.display }}>
            ${(poolRevenue / 1000).toFixed(0)}K
          </div>
          <div style={{ fontSize: 10, color: C.textLight }}>Est. Annual Pool</div>
        </div>
        <div style={{ flex: 1, background: C.bg, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, fontFamily: ff.display }}>
            {geo.households >= 1000 ? `${(geo.households / 1000).toFixed(0)}K` : geo.households}
          </div>
          <div style={{ fontSize: 10, color: C.textLight }}>Households</div>
        </div>
      </div>

      {/* Expanded details */}
      {isSelected && (
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.textLight, marginBottom: 8, letterSpacing: 0.5 }}>
            LOCAL EMPLOYERS
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {geo.employers.map(e => (
              <span key={e} style={{
                padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 500,
                background: C.bgMid, color: C.textMid, border: `1px solid ${C.border}`,
              }}>{e}</span>
            ))}
          </div>

          {isHot && (
            <button
              onClick={(e) => { e.stopPropagation(); onCommit(geo.id); }}
              style={{
                width: "100%", padding: "14px 0", borderRadius: 12,
                background: "linear-gradient(135deg, #c53030, #e53e3e)",
                color: "#fff", border: "none", fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: ff.body,
                boxShadow: "0 4px 16px rgba(197,48,48,0.3)",
                transition: "all 0.2s ease", letterSpacing: 0.3,
              }}
            >
              Commit $100 — Only {remaining} families to go
            </button>
          )}
          {!isHot && (
            <button
              onClick={(e) => { e.stopPropagation(); onCommit(geo.id); }}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 12,
                background: "linear-gradient(135deg, #B49C78, #a08a66)",
                color: "#fff", border: "none", fontSize: 14, fontWeight: 600,
                cursor: "pointer", fontFamily: ff.body,
                boxShadow: "0 4px 16px rgba(180,156,120,0.3)",
                transition: "all 0.2s ease",
              }}
            >
              Join {remaining} families away from activation
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// ACTIVATION TIMELINE
// ═══════════════════════════════════════════
function ActivationTimeline({ openModal }) {
  const steps = [
    { week: "1–2", title: "Cooperative Formation", desc: "Legal entity filed with RMEOC. 75% tax credit on formation costs.", icon: "📋", cost: "$3K–5K" },
    { week: "2–4", title: "Caregiver Recruitment", desc: "W-2 positions at $25–28/hr. 40-hour clinical training cohort.", icon: "👩‍⚕️", cost: "$4K–6K" },
    { week: "3–5", title: "Home Safety Blitz", desc: "Every committed family gets a free comprehensive assessment.", icon: "🏠", cost: "$3K–4K" },
    { week: "5–8", title: "Time Bank Launch", desc: "Coordinator matches neighbors. CBI background checks. Work-for-Membership formalized.", icon: "⏰", cost: "$2K–3K" },
    { week: "6–10", title: "First Care Delivery", desc: "Highest-acuity families receive professional caregiver visits.", icon: "💛", cost: "Revenue begins" },
    { week: "8–12", title: "Pool Activation", desc: "HSA/FSA integration. Memberships convert. Home modifications begin.", icon: "🛡️", cost: "Pool collecting" },
  ];

  return (
    <div onClick={() => openModal("activation")} style={{ cursor: "pointer" }}>
      {steps.map((s, i) => (
        <div key={i} style={{
          display: "flex", gap: 14, marginBottom: i < steps.length - 1 ? 4 : 0,
        }}>
          {/* Timeline line */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: i < 3 ? C.forest : i < 5 ? C.accent : C.green,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, flexShrink: 0,
            }}>{s.icon}</div>
            {i < steps.length - 1 && (
              <div style={{ width: 2, flex: 1, background: C.border, minHeight: 24 }} />
            )}
          </div>
          {/* Content */}
          <div style={{ flex: 1, paddingBottom: i < steps.length - 1 ? 12 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{s.title}</span>
              <span style={{ fontSize: 11, color: C.textLight, fontWeight: 500 }}>Week {s.week}</span>
            </div>
            <p style={{ fontSize: 12.5, color: C.textMid, lineHeight: 1.5, margin: "3px 0 0" }}>{s.desc}</p>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.accent }}>{s.cost}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// COMMIT FORM MODAL
// ═══════════════════════════════════════════
function CommitModal({ geo, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", path: "cash" });
  const [submitted, setSubmitted] = useState(false);

  if (!geo) return null;

  const remaining = geo.target - geo.commitments;
  const isHot = geo.status === "hot";

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      backdropFilter: "blur(4px)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.white, borderRadius: 20, maxWidth: 480, width: "100%",
        padding: "32px 28px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        {!submitted ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              {isHot && (
                <div style={{
                  display: "inline-block", padding: "5px 14px", borderRadius: 16,
                  background: C.redBg, color: C.red, fontSize: 12, fontWeight: 700,
                  marginBottom: 12, border: `1px solid ${C.red}20`,
                }}>
                  Only {remaining} families to go in {geo.name}
                </div>
              )}
              <h2 style={{
                fontFamily: ff.display, fontSize: 24, fontWeight: 700,
                color: C.forest, margin: 0, lineHeight: 1.3,
              }}>
                Become a founding member.
              </h2>
              <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.6, marginTop: 8 }}>
                Your commitment brings Co-op.care to {geo.name}. Choose how you want to join.
              </p>
            </div>

            {/* Path selector */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[
                { id: "cash", label: "$100 Deposit", sub: "Refundable, converts to first month", icon: "💳" },
                { id: "time", label: "10 Hours Service", sub: "Earn your commitment through care", icon: "⏰" },
              ].map(p => (
                <button key={p.id}
                  onClick={() => setForm(f => ({ ...f, path: p.id }))}
                  style={{
                    flex: 1, padding: "14px 12px", borderRadius: 12, textAlign: "center",
                    border: form.path === p.id ? `2px solid ${C.forest}` : `1.5px solid ${C.border}`,
                    background: form.path === p.id ? `${C.forest}08` : C.white,
                    cursor: "pointer", transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{p.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>{p.sub}</div>
                </button>
              ))}
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              <input type="text" placeholder="First name" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={{
                  width: "100%", padding: "13px 16px", borderRadius: 10,
                  border: "1.5px solid #e0dbd4", fontSize: 15,
                  fontFamily: ff.body, outline: "none", background: C.bg,
                  color: C.text, boxSizing: "border-box",
                }}
              />
              <input type="email" placeholder="Email address" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={{
                  width: "100%", padding: "13px 16px", borderRadius: 10,
                  border: "1.5px solid #e0dbd4", fontSize: 15,
                  fontFamily: ff.body, outline: "none", background: C.bg,
                  color: C.text, boxSizing: "border-box",
                }}
              />
            </div>

            <button
              onClick={() => { if (form.name && form.email) setSubmitted(true); }}
              style={{
                width: "100%", padding: "15px 0", borderRadius: 12,
                background: isHot
                  ? "linear-gradient(135deg, #c53030, #e53e3e)"
                  : "linear-gradient(135deg, #1A3D2E, #2d5a3e)",
                color: "#fff", border: "none", fontSize: 16, fontWeight: 700,
                cursor: "pointer", fontFamily: ff.body,
                boxShadow: isHot ? "0 4px 16px rgba(197,48,48,0.3)" : "0 4px 16px rgba(26,61,46,0.3)",
              }}
            >
              {form.path === "cash" ? "Commit $100" : "Start Earning My Membership"}
            </button>

            <p style={{ fontSize: 11, color: C.textFaint, textAlign: "center", marginTop: 12 }}>
              {form.path === "cash"
                ? "Fully refundable until activation. Converts to first month of membership."
                : "10 hours of verified Time Bank service = $100 commitment credit."}
            </p>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "linear-gradient(135deg, #2d6a4f, #3a7d5c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <span style={{ color: "#fff", fontSize: 26 }}>✓</span>
            </div>
            <h3 style={{
              fontFamily: ff.display, fontSize: 22, fontWeight: 600,
              color: C.forest, marginBottom: 8,
            }}>
              You're founding member #{geo.commitments + 1}, {form.name}.
            </h3>
            <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.6, marginBottom: 16 }}>
              {geo.name} is now {remaining - 1} families away from activation.
              {remaining <= 15 && " You just brought your neighborhood one step closer to real care."}
            </p>
            <div style={{
              background: C.greenBg, borderRadius: 12, padding: "16px 18px",
              border: `1px solid ${C.green}20`, textAlign: "left",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.green, marginBottom: 6 }}>What happens next:</div>
              <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6 }}>
                Your CareCheck assessments are now unlocked. Take the CII (for you) and the CRI (for your loved one) — they take 2 minutes each. Your Time Bank account is active. Welcome to the neighborhood.
              </div>
            </div>
            <button onClick={onClose} style={{
              marginTop: 16, padding: "12px 32px", borderRadius: 10,
              background: C.forest, color: "#fff", border: "none",
              fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: ff.body,
            }}>
              Take My Free Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
export default function DensityActivationMap() {
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState("bvsd");
  const [commitGeo, setCommitGeo] = useState(null);
  const [tab, setTab] = useState("map"); // map | how | economics

  const totalCommitments = GEOGRAPHIES.reduce((s, g) => s + g.commitments, 0);
  const totalSeed = totalCommitments * 100;
  const hotGeos = GEOGRAPHIES.filter(g => g.status === "hot").length;

  const tabs = [
    { id: "map", label: "Activation Map" },
    { id: "how", label: "How It Works" },
    { id: "economics", label: "The Math" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(168deg, ${C.bg} 0%, ${C.bgMid} 40%, ${C.bgDark} 100%)`,
      fontFamily: ff.body, padding: "20px 16px",
    }}>
      <Modal topic={modal} onClose={() => setModal(null)} />
      <CommitModal
        geo={commitGeo ? GEOGRAPHIES.find(g => g.id === commitGeo) : null}
        onClose={() => setCommitGeo(null)}
      />

      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            display: "inline-block", padding: "5px 16px", borderRadius: 20,
            background: `${C.forest}10`, border: `1px solid ${C.forest}20`,
            fontSize: 11, fontWeight: 600, color: C.forest, marginBottom: 12, letterSpacing: 1,
          }}>BRING CO-OP.CARE TO YOUR NEIGHBORHOOD</div>

          <h1 style={{
            fontFamily: ff.display, fontSize: 28, fontWeight: 700,
            color: C.forest, lineHeight: 1.25, marginBottom: 10,
          }}>
            200 families. One neighborhood. Real care.
          </h1>
          <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>
            When 200 families in a school district commit, we activate: trained caregivers, a neighbor Time Bank, home safety assessments, and an insurance pool. Your $100 builds it.
          </p>
        </div>

        {/* Live stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20,
        }}>
          {[
            { v: totalCommitments, l: "families committed", color: C.forest },
            { v: `$${(totalSeed / 1000).toFixed(0)}K`, l: "seed capital", color: C.green },
            { v: `${hotGeos} district${hotGeos !== 1 ? "s" : ""}`, l: "near activation", color: C.red },
          ].map(s => (
            <div key={s.l} style={{
              background: C.white, borderRadius: 12, padding: "14px 10px",
              textAlign: "center", border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: ff.display }}>{s.v}</div>
              <div style={{ fontSize: 11, color: C.textLight }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, background: C.white, borderRadius: 12, padding: 4,
          border: `1px solid ${C.border}`, marginBottom: 20,
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "10px 8px", borderRadius: 9, fontSize: 13, fontWeight: 600,
              background: tab === t.id ? C.forest : "transparent",
              color: tab === t.id ? "#fff" : C.textLight,
              border: "none", cursor: "pointer", fontFamily: ff.body,
              transition: "all 0.2s ease",
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── MAP TAB ── */}
        {tab === "map" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {GEOGRAPHIES.map(geo => (
              <GeographyCard
                key={geo.id}
                geo={geo}
                isSelected={selected === geo.id}
                onSelect={setSelected}
                onCommit={setCommitGeo}
              />
            ))}

            {/* Work for membership callout */}
            <div
              onClick={() => setModal("work_for_membership")}
              style={{
                background: "linear-gradient(135deg, #1A3D2E, #2d5a3e)",
                borderRadius: 16, padding: "24px 22px", color: "#fff",
                cursor: "pointer", transition: "transform 0.15s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, opacity: 0.7, marginBottom: 8 }}>
                CAN'T AFFORD $100?
              </div>
              <h3 style={{ fontFamily: ff.display, fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
                Earn your founding membership.
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.65, opacity: 0.9, margin: 0 }}>
                10 hours of Time Bank service before activation = $100 commitment credit.
                Help a neighbor. Earn your spot. Appear on the wall the same as everyone else.
              </p>
            </div>
          </div>
        )}

        {/* ── HOW IT WORKS TAB ── */}
        {tab === "how" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* The model */}
            <div
              onClick={() => setModal("commitment")}
              style={{
                background: C.white, borderRadius: 16, padding: "24px 22px",
                border: `1px solid ${C.border}`, cursor: "pointer",
              }}
            >
              <h3 style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 10 }}>
                The Density Model
              </h3>
              <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.65, marginBottom: 16 }}>
                Care is radically local. A cooperative with 200 members across all of Colorado is useless.
                A cooperative with 200 members in a single school district is transformative.
              </p>

              {/* Three steps */}
              {[
                { n: "1", title: "Commit $100", desc: "Refundable deposit. Unlocks CareCheck assessments, Time Bank, and your local community of committed families — immediately." },
                { n: "2", title: "Reach 200", desc: "When 200 families in your school district commit, $20,000 in seed capital triggers the 90-day activation sequence." },
                { n: "3", title: "Activation", desc: "Trained caregivers recruited. Time Bank coordinated. Home safety assessments for every family. Pool begins collecting. Real care begins." },
              ].map((step, i) => (
                <div key={i} style={{
                  display: "flex", gap: 14, padding: "12px 0",
                  borderTop: i > 0 ? `1px solid ${C.border}` : "none",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: C.forest, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, fontFamily: ff.display,
                  }}>{step.n}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{step.title}</div>
                    <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.5, marginTop: 2 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Why school districts */}
            <div
              onClick={() => setModal("geography")}
              style={{
                background: C.amberBg, borderRadius: 16, padding: "24px 22px",
                border: `1px solid ${C.amber}20`, cursor: "pointer",
              }}
            >
              <h3 style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                Why school districts?
              </h3>
              <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.65, margin: 0 }}>
                They map to employer benefits, community identity, and caregiver proximity. When BVSD offers the Co-op.care HSA benefit, every teacher in the district is a potential committed family. The employer channel and the geographic channel align perfectly.
              </p>
            </div>

            {/* 90-day timeline */}
            <div style={{
              background: C.white, borderRadius: 16, padding: "24px 22px",
              border: `1px solid ${C.border}`,
            }}>
              <h3 style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 16 }}>
                The 90-Day Activation Sequence
              </h3>
              <ActivationTimeline openModal={setModal} />
            </div>

            {/* Pre-activation value */}
            <div style={{
              background: C.greenBg, borderRadius: 16, padding: "24px 22px",
              border: `1px solid ${C.green}20`,
            }}>
              <h3 style={{ fontFamily: ff.display, fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 10 }}>
                What you get before activation
              </h3>
              {[
                { icon: "📊", label: "CareCheck Assessments", desc: "Unlimited CII + CRI. Shareable with physicians." },
                { icon: "⏰", label: "Time Bank Enrollment", desc: "Start logging neighbor care hours today." },
                { icon: "👥", label: "Local Community", desc: "Connect with committed families in your district." },
                { icon: "📋", label: "Care Plan Summary", desc: "Printable plan based on your CRI results." },
              ].map(f => (
                <div key={f.label} style={{
                  display: "flex", gap: 12, padding: "8px 0",
                  borderBottom: `1px solid ${C.green}15`,
                }}>
                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: C.textMid }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ECONOMICS TAB ── */}
        {tab === "economics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Seed capital deployment */}
            <div
              onClick={() => setModal("economics")}
              style={{
                background: C.white, borderRadius: 16, padding: "24px 22px",
                border: `1px solid ${C.border}`, cursor: "pointer",
              }}
            >
              <h3 style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 14 }}>
                Where $20,000 Goes
              </h3>
              {[
                { label: "Cooperative Formation", amount: "$3K–5K", pct: 22, note: "Net of 75% tax credit" },
                { label: "Caregiver Recruitment & Training", amount: "$4K–6K", pct: 28, note: "40-hour clinical cohort" },
                { label: "Home Safety Blitz", amount: "$3K–4K", pct: 18, note: "Every committed family assessed" },
                { label: "Time Bank Coordination", amount: "$2K–3K", pct: 14, note: "Coordinator, background checks" },
                { label: "Launch & Community Events", amount: "$2K–3K", pct: 14, note: "Local marketing, events" },
                { label: "Operating Reserve", amount: "Remainder", pct: 4, note: "Buffer for unexpected costs" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                  borderBottom: i < 5 ? `1px solid ${C.border}` : "none",
                }}>
                  <div style={{
                    width: `${Math.max(item.pct, 8)}%`, height: 8, borderRadius: 4,
                    background: C.forest, opacity: 1 - (i * 0.12), minWidth: 16,
                  }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{item.label}</span>
                    <span style={{ fontSize: 11, color: C.textLight, marginLeft: 6 }}>({item.note})</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.forest, fontFamily: ff.display }}>{item.amount}</span>
                </div>
              ))}
            </div>

            {/* Scaling math */}
            <div style={{
              background: C.white, borderRadius: 16, padding: "24px 22px",
              border: `1px solid ${C.border}`,
            }}>
              <h3 style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 14 }}>
                The Scaling Math
              </h3>
              {[
                { year: "Year 1", geos: 5, members: 700, pool: "$1.47M", fed: "$73.5K" },
                { year: "Year 2", geos: 15, members: 2100, pool: "$4.4M", fed: "$220K" },
                { year: "Year 3", geos: 30, members: 4200, pool: "$8.8M", fed: "$440K" },
              ].map((row, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                  gap: 8, padding: "10px 0",
                  borderBottom: i < 2 ? `1px solid ${C.border}` : "none",
                  fontSize: i === 0 ? 13 : 13,
                }}>
                  <span style={{ fontWeight: 700, color: C.forest, fontFamily: ff.display }}>{row.year}</span>
                  <span style={{ color: C.textMid, textAlign: "center" }}>{row.geos} districts</span>
                  <span style={{ color: C.textMid, textAlign: "center" }}>{row.members.toLocaleString()}</span>
                  <span style={{ fontWeight: 600, color: C.green, textAlign: "center" }}>{row.pool}</span>
                  <span style={{ color: C.textLight, textAlign: "right", fontSize: 11 }}>5% fee: {row.fed}</span>
                </div>
              ))}
              <p style={{ fontSize: 12, color: C.textLight, lineHeight: 1.5, marginTop: 12, fontStyle: "italic" }}>
                Conservative assumption: 60% of projected activations, 80% annual member retention. Insurance-formation scale ($500K capitalization) reached within 18–24 months.
              </p>
            </div>

            {/* The one-sentence version */}
            <div style={{
              background: "linear-gradient(135deg, #1A3D2E, #2d5a3e)",
              borderRadius: 16, padding: "24px 22px", color: "#fff",
            }}>
              <p style={{
                fontFamily: ff.display, fontSize: 16, fontWeight: 400,
                lineHeight: 1.65, margin: 0, fontStyle: "italic",
              }}>
                A family pays $100 to say "we need this here," and when 200 families in the same school district say the same thing, the money funds the cooperative that serves them all — trained caregivers, neighbor Time Bank, home safety assessments, insurance pool — and the $100 becomes their first month of membership in the system they built by asking for it.
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
