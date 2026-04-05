import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   co-op.care — Website v9.0
   "Radical Simplicity for Families"
   
   Design philosophy:
   - Family sees only what matters: savings, consistency, relief
   - No sausage: FHIR, Omaha, CMS codes hidden in deep drawers
   - Emotional first, economics second
   - Three truths: parent stays home, caregiver stays, you save
   ═══════════════════════════════════════════ */

// ── Fonts ──
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// ── Color Tokens ──
const C = {
  cream: "#FAF7F2", warmWhite: "#FFFDF9", sand: "#F4EFE8", sandDark: "#EDE7DC",
  gold: "#B49C78", goldDark: "#8F7D5F", goldLight: "#D4C4A0",
  teal: "#0D7377", tealDark: "#095456", tealLight: "#E6F5F5",
  brown: "#3D3427", brownMid: "#5A5147", brownLight: "#6D6155",
  brownFaint: "#8A8078", brownPale: "#A89E94", border: "#E8E4DF",
  green: "#3A7D5C", greenLight: "#E8F5EE",
  red: "#9B2C2C", redLight: "#FEF2F2",
  amber: "#9A6B20", amberLight: "#FEF8E8",
};

const serif = "'Fraunces', 'Georgia', serif";
const sans = "'DM Sans', 'Helvetica Neue', sans-serif";

// ── Global Styles ──
const styleTag = document.createElement("style");
styleTag.textContent = `
  * { box-sizing: border-box; margin: 0; }
  html { scroll-behavior: smooth; }
  body { margin: 0; padding: 0; background: ${C.cream}; }
  @media (max-width: 768px) { .hide-mobile { display: none !important; } .show-mobile { display: flex !important; } }
  @media (min-width: 769px) { .show-mobile { display: none !important; } }
  ::selection { background: ${C.teal}20; }
`;
document.head.appendChild(styleTag);

// ═══════════════════════════════════════════
// SCROLL ANIMATION
// ═══════════════════════════════════════════
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, vis] = useInView(0.08);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`, ...style,
    }}>{children}</div>
  );
}

// ═══════════════════════════════════════════
// DRAWER SYSTEM
// ═══════════════════════════════════════════
function Drawer({ drawerId, onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const { title, accent, content } = getDrawerContent(drawerId);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  return (
    <div onClick={handleClose} style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: isClosing ? "transparent" : "rgba(0,0,0,0.4)",
      transition: "background 0.3s ease",
      display: "flex", justifyContent: "flex-end",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(540px, 92vw)", height: "100vh", background: C.warmWhite,
        overflowY: "auto", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        transform: isClosing ? "translateX(100%)" : "translateX(0)",
        transition: "transform 0.3s ease",
      }}>
        <div style={{
          position: "sticky", top: 0, zIndex: 10, padding: "18px 24px",
          background: `${C.warmWhite}F8`, backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 4, height: 24, borderRadius: 2, background: accent }} />
            <h3 style={{ fontFamily: serif, fontSize: 18, fontWeight: 600, color: C.brown }}>{title}</h3>
          </div>
          <button onClick={handleClose} style={{
            width: 36, height: 36, borderRadius: "50%", border: `1.5px solid ${C.border}`,
            background: "transparent", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 16, color: C.brownFaint,
            transition: "all 0.2s", fontFamily: sans,
          }}
          onMouseEnter={e => { e.target.style.background = C.sand; }}
          onMouseLeave={e => { e.target.style.background = "transparent"; }}
          >✕</button>
        </div>
        <div style={{ padding: "24px 24px 64px" }}>{content}</div>
      </div>
    </div>
  );
}

// ── Drawer building blocks ──
function DSection({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      {title && <h3 style={{ fontFamily: serif, fontSize: 18, fontWeight: 600, color: C.brown, marginBottom: 14 }}>{title}</h3>}
      <div style={{ fontFamily: sans, fontSize: 14.5, color: C.brownMid, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

function DHero({ icon, bg, title, subtitle }) {
  return (
    <div style={{ background: bg, borderRadius: 20, padding: "36px 28px", marginBottom: 28, textAlign: "center" }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22, color: "#fff" }}>{icon}</div>
      <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: "#fff", lineHeight: 1.3, marginBottom: 10 }}>{title}</h2>
      <p style={{ fontFamily: sans, fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>{subtitle}</p>
    </div>
  );
}

function DCallout({ text, color = C.teal }) {
  return (
    <div style={{ background: `${color}08`, borderLeft: `3px solid ${color}`, borderRadius: "0 12px 12px 0", padding: "18px 20px", marginTop: 16 }}>
      <p style={{ fontFamily: sans, fontSize: 14, color: C.brownMid, lineHeight: 1.65, margin: 0, fontStyle: "italic" }}>{text}</p>
    </div>
  );
}

function DCTA({ text, subtitle, onClick }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 0 8px" }}>
      <button onClick={onClick} style={{
        background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`, color: "#fff",
        padding: "16px 40px", borderRadius: 40, fontSize: 16, fontWeight: 600, fontFamily: sans, border: "none", cursor: "pointer",
        boxShadow: "0 4px 20px rgba(13,115,119,0.25)", transition: "transform 0.2s",
      }}
      onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.target.style.transform = "translateY(0)"}
      >{text}</button>
      {subtitle && <p style={{ fontFamily: sans, fontSize: 12, color: C.brownPale, marginTop: 12 }}>{subtitle}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════
// DRAWER CONTENT — Deep dives live here
// ═══════════════════════════════════════════
function getDrawerContent(id) {
  const drawers = {
    "how-care-works": {
      title: "How Care Actually Works",
      accent: C.teal,
      content: (
        <>
          <DHero icon="♡" bg={C.teal} title="Simple for you. Sophisticated underneath." subtitle="You see a warm, familiar face. Behind the scenes, clinical-grade technology keeps everything coordinated." />
          <DSection title="What your family experiences">
            <p style={{ marginBottom: 14 }}>You take a short assessment that helps us understand your situation — not just your parent's medical needs, but your needs as a caregiver too. Within 24 hours, we match you with a dedicated caregiver who lives nearby.</p>
            <p style={{ marginBottom: 14 }}>That caregiver comes to the same home, at the same times, every week. They learn your parent's preferences — how Mom likes her coffee, which side of the bed Dad prefers, the stories that make them laugh. This isn't a staffing agency sending a stranger. This is a neighbor who chose this work and owns the company.</p>
            <p>Every visit, your caregiver takes simple notes that our system translates into documentation your parent's doctor can actually use. You get a weekly update. Your parent's physician gets clinical notes. Nobody has to be the middleman.</p>
          </DSection>
          <DSection title="What makes this different">
            <p style={{ marginBottom: 14 }}>Traditional agencies capture 40-60% of what you pay as profit. That extraction causes 77% annual turnover — which means a new stranger every few weeks. No relationship. No continuity.</p>
            <p>In our model, 88% of what you pay goes directly to your caregiver's wages and benefits. They earn $25-28/hr as W-2 employees with health insurance, PTO, and equity in the company. They stay because they're building something.</p>
          </DSection>
          <DCallout text="Your caregiver isn't an employee of a corporation. They're a worker-owner of a cooperative. That's why the turnover is different. That's why the care is different." />
        </>
      ),
    },

    "real-families": {
      title: "Real Families",
      accent: C.gold,
      content: (
        <>
          <DHero icon="♡" bg={C.goldDark} title="You're not the only one." subtitle="63 million Americans are carrying this weight quietly. Here are some of their stories." />
          {[
            {
              name: "Sarah, 52 · Boulder",
              role: "Teacher caring for her mother",
              story: "I was teaching all day and driving to Mom's every evening for medications. I hadn't slept through the night in seven months. I didn't call myself a caregiver — I was just doing what daughters do.",
              change: "Now she has a dedicated caregiver 3 times a week and two neighbors who check in on alternating days. She sleeps again. Her principal noticed the difference before she did."
            },
            {
              name: "David, 47 · Louisville",
              role: "Software engineer caring for his father with Parkinson's",
              story: "Dad's been declining for two years. I work remote, so everyone assumed I had it covered. I was missing morning meetings to handle his falls. My manager noticed. I almost lost my job before anyone knew why.",
              change: "His employer enrolled in the co-op.care benefit. His father was matched with a caregiver who specializes in mobility support. David's work performance recovered within a month."
            },
            {
              name: "Maria, 61 · Longmont",
              role: "Retired nurse caring for her husband after a stroke",
              story: "I know how to do this professionally. But when it's your husband, it's different. I was so focused on his recovery I forgot I had a body too. I skipped my own appointments for a year.",
              change: "She now has 20 hours per week of professional support and uses her free time to attend her own doctor's appointments. She says the hardest part was admitting she needed help."
            },
          ].map((s, i) => (
            <DSection key={i} title={s.name}>
              <p style={{ fontSize: 12, color: C.goldDark, fontWeight: 600, fontFamily: sans, marginBottom: 8 }}>{s.role}</p>
              <p style={{ fontStyle: "italic", marginBottom: 14, color: C.brownMid }}>"{s.story}"</p>
              <div style={{ background: C.greenLight, borderRadius: 12, padding: "14px 18px", border: `1px solid ${C.green}15` }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: C.green, fontFamily: sans, marginBottom: 4 }}>What changed</p>
                <p style={{ fontSize: 13.5, color: C.brownMid, margin: 0, lineHeight: 1.55 }}>{s.change}</p>
              </div>
            </DSection>
          ))}
        </>
      ),
    },

    "tax-savings": {
      title: "The Tax Advantage",
      accent: C.gold,
      content: (
        <>
          <DHero icon="◈" bg={C.goldDark} title="How families pay 36% less than the sticker price." subtitle="Our clinical oversight unlocks tax advantages that traditional agencies can't offer." />
          <DSection title="The short version">
            <p style={{ marginBottom: 14 }}>Because every co-op.care plan includes physician oversight and clinical documentation, your care costs qualify as a medical expense under IRS rules. That means you can pay with pre-tax dollars from your HSA, FSA, or Dependent Care FSA.</p>
            <p>Traditional home care agencies can't do this because they don't have clinical governance. Their care is classified as "custodial" — which the IRS doesn't consider a medical expense.</p>
          </DSection>
          <DSection title="What this means in real dollars">
            <div style={{ background: C.amberLight, borderRadius: 16, padding: "24px 20px", border: `1px solid ${C.amber}12`, marginBottom: 16 }}>
              {[
                { label: "Monthly care cost", value: "$3,500" },
                { label: "Your tax bracket (est.)", value: "~36%" },
                { label: "Your effective cost", value: "$2,240/mo", highlight: true },
                { label: "Annual savings from tax advantage alone", value: "$15,120", highlight: true },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 3 ? `1px solid ${C.amber}10` : "none" }}>
                  <span style={{ fontFamily: sans, fontSize: 14, color: C.brownMid }}>{r.label}</span>
                  <span style={{ fontFamily: serif, fontSize: r.highlight ? 20 : 16, fontWeight: r.highlight ? 700 : 400, color: r.highlight ? C.amber : C.brown }}>{r.value}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: C.brownFaint, lineHeight: 1.5 }}>Based on 24% federal + 4.4% Colorado state + 7.65% FICA. Your actual savings depend on your tax situation. The 2026 HSA family limit is $8,750 (plus $1,000 catch-up if you're 55+). Dependent Care FSA allows up to $5,000 for qualifying elder care.</p>
          </DSection>
          <DCallout text="This isn't a loophole. It's what happens when care is properly documented and clinically supervised. The IRS simply treats it differently — and so should you." />
        </>
      ),
    },

    "for-employers": {
      title: "For Employers",
      accent: C.gold,
      content: (
        <>
          <DHero icon="◈" bg={C.goldDark} title="23% of your workforce is hiding something." subtitle="They're caring for aging parents. It's costing you $5,365 per employee per year in lost productivity, absenteeism, and turnover." />
          <DSection title="The hidden cost">
            <p style={{ marginBottom: 14 }}>Your best employees — the reliable ones, the ones who never complain — are often the ones carrying the heaviest load at home. They're managing medications before work, taking calls from doctors during meetings, and driving to their parents' homes after hours.</p>
            <p>They don't tell you because there's no benefit for it. Unlike childcare, elder care has no workplace infrastructure. So they burn out silently, and one day they resign.</p>
          </DSection>
          <DSection title="What a pilot looks like">
            <div style={{ background: C.amberLight, borderRadius: 16, padding: "24px 20px", border: `1px solid ${C.amber}12` }}>
              {[
                { label: "Pilot size", value: "50 employees" },
                { label: "Duration", value: "90 days" },
                { label: "Cost to employer", value: "$0 upfront" },
                { label: "What we measure", value: "Hidden caregivers identified, absenteeism reduction, retention impact" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 3 ? `1px solid ${C.amber}10` : "none" }}>
                  <span style={{ fontFamily: sans, fontSize: 14, color: C.brownMid }}>{r.label}</span>
                  <span style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.brown, textAlign: "right", maxWidth: "55%" }}>{r.value}</span>
                </div>
              ))}
            </div>
          </DSection>
          <DSection title="The BVSD case study">
            <p>Boulder Valley School District has 1,717 employees. Based on national data, approximately 395 of them are hidden caregivers. The estimated annual cost in absenteeism, reduced productivity, and turnover: $2.1 million. A co-op.care employer benefit delivers ROI between 74:1 and 149:1.</p>
          </DSection>
          <DCallout text="You already pay for employee childcare support, EAP programs, and gym memberships. Elder care is the benefit nobody offers — and the one your employees need most." />
        </>
      ),
    },

    "for-caregivers": {
      title: "Become a Worker-Owner",
      accent: C.teal,
      content: (
        <>
          <DHero icon="◇" bg={C.teal} title="You're not a gig worker. You're an owner." subtitle="$25-28/hr, W-2 with benefits, equity, and the same families every week." />
          <DSection title="What you get">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { stat: "$25–28/hr", label: "W-2 wages", detail: "47-65% above industry average" },
                { stat: "$52K", label: "Equity over 5 years", detail: "You own a piece of what you build" },
                { stat: "Full benefits", label: "Health, PTO, retirement", detail: "Real employment, not gig work" },
                { stat: "Consistency", label: "Same families each week", detail: "Relationships, not random dispatch" },
              ].map((b, i) => (
                <div key={i} style={{ background: C.tealLight, borderRadius: 14, padding: "18px 16px", border: `1px solid ${C.teal}12` }}>
                  <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.teal }}>{b.stat}</div>
                  <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.brown, marginTop: 4 }}>{b.label}</div>
                  <div style={{ fontFamily: sans, fontSize: 12, color: C.brownFaint, marginTop: 4, lineHeight: 1.4 }}>{b.detail}</div>
                </div>
              ))}
            </div>
          </DSection>
          <DSection title="Why this is different">
            <p>Traditional agencies pay $13-17/hr with no benefits, no equity, a different family every shift, and 77% of your coworkers quit within a year. At co-op.care, you vote on how the business is run, you build wealth through ownership, and you stay because it's worth staying.</p>
          </DSection>
          <DCallout text="We're hiring in Boulder, CO. Launching March 2026. If you have genuine warmth, reliability, and a willingness to learn, we want to talk." />
        </>
      ),
    },

    "timebank": {
      title: "The Time Bank",
      accent: C.teal,
      content: (
        <>
          <DHero icon="⏰" bg={C.tealDark} title="1 hour of help = 1 hour of credit." subtitle="No money changes hands. Just neighbors helping neighbors, with a system to keep track." />
          <DSection title="How it works">
            {[
              "Sign up and pass a background check. Safety first, always.",
              "Browse requests from neighbors: companionship, grocery runs, meal prep, sitting with someone so their daughter can sleep.",
              "Complete an hour of help, earn one Time Credit. Every person's time is valued equally.",
              "Spend your credits when you need help. Save them for the future. Or gift them to a neighbor who's struggling.",
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.tealLight, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: serif, fontSize: 14, fontWeight: 700, color: C.teal, flexShrink: 0 }}>{i + 1}</div>
                <p style={{ margin: 0, lineHeight: 1.6 }}>{step}</p>
              </div>
            ))}
          </DSection>
          <DSection title="What neighbors are doing">
            {[
              { name: "Margaret, 68", action: "Walks with Eleanor every Tuesday morning" },
              { name: "David, 44", action: "Drops off home-cooked meals on Thursdays" },
              { name: "Lisa, 71", action: "Reads to Ruth so her daughter can attend meetings" },
              { name: "Carlos, 19", action: "Mows lawns and does light yard maintenance" },
            ].map((n, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.brown }}>{n.name}</div>
                <div style={{ fontFamily: sans, fontSize: 13, color: C.brownFaint }}>{n.action}</div>
              </div>
            ))}
          </DSection>
          <DCallout text="Families using the Time Bank save an average of $7,488 per year by supplementing professional care with neighbor support. It's the oldest technology in the world — we just made it easier to find each other." />
        </>
      ),
    },

    "our-story": {
      title: "Our Story",
      accent: C.goldDark,
      content: (
        <>
          <DHero icon="♡" bg={C.goldDark} title="Why we built this." subtitle="Because the traditional home care model is an extraction machine — and families and caregivers both lose." />
          <DSection title="The problem">
            <p style={{ marginBottom: 14 }}>Standard agencies capture 40-60% of what families pay, leaving caregivers with $13-17/hr and no benefits. That extraction causes 77% annual turnover — a new stranger every few weeks. No relationship. No continuity. No accountability.</p>
            <p>The agency doesn't care because they'll just send someone else. The caregiver can't build a career because they're barely surviving. The family is stuck in the middle.</p>
          </DSection>
          <DSection title="The cooperative answer">
            <p style={{ marginBottom: 14 }}>A worker-owned cooperative inverts the model. Caregivers earn $25-28/hr as W-2 employees with benefits and equity. They stay because they own the business. Families pay similar rates but get radically different outcomes — same caregiver every week, proper documentation, and a community of neighbors who fill in the gaps.</p>
            <p>There are 26 home care cooperatives in America. We're building number 27 — and the first with clinical-grade technology that lets every caregiver note flow seamlessly to your parent's doctor.</p>
          </DSection>
          <DSection title="Built in Boulder">
            <p>co-op.care is incubated through the Rocky Mountain Employee Ownership Center, with mentorship from Boulder SBDC, and in partnership with Boulder Community Health for hospital coordination. We launch in March 2026.</p>
          </DSection>
          <DCallout text="When technology eliminates healthcare friction, who captures the savings? In the traditional model: shareholders. In ours: the workers and families. That's not idealism. That's the math." />
        </>
      ),
    },

    "contact": {
      title: "Get in Touch",
      accent: C.teal,
      content: (
        <>
          <DHero icon="♡" bg={C.teal} title="Let's talk." subtitle="Whether you're a family, a caregiver, an employer, or just curious — we'd love to hear from you." />
          <DSection>
            {[
              { label: "Email", value: "blaine@co-op.care" },
              { label: "Founder", value: "Blaine Warkentine" },
              { label: "Location", value: "Boulder, Colorado" },
              { label: "Launch", value: "March 2026" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 13, color: C.brownPale }}>{r.label}</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: C.brown }}>{r.value}</span>
              </div>
            ))}
          </DSection>
          <DSection title="I am a...">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { type: "Family caregiver", action: "Take the free 2-minute check-in to get started." },
                { type: "Professional caregiver", action: "Apply to become a worker-owner. $25-28/hr, benefits, equity." },
                { type: "Employer or HR leader", action: "Request a free 50-person pilot. We'll show you the hidden cost." },
                { type: "Hospital or health system", action: "Schedule a 15-minute call. We bring the data." },
              ].map((t, i) => (
                <div key={i} style={{ background: C.tealLight, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.teal}10` }}>
                  <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.teal }}>{t.type}</div>
                  <div style={{ fontFamily: sans, fontSize: 12, color: C.brownMid, marginTop: 4, lineHeight: 1.4 }}>{t.action}</div>
                </div>
              ))}
            </div>
          </DSection>
        </>
      ),
    },

    "assessment-info": {
      title: "The Check-In",
      accent: C.teal,
      content: (
        <>
          <DHero icon="♡" bg={C.teal} title="How heavy is the weight you're carrying?" subtitle="A 2-minute check-in. No login. No email required. Just an honest picture of where you are." />
          <DSection title="What it asks">
            <p style={{ marginBottom: 14 }}>12 simple questions across three areas: how the caregiving is affecting your daily life, how it's affecting you emotionally, and what would happen if something went wrong tomorrow.</p>
            <p>There are no wrong answers. This isn't a test. It's a mirror.</p>
          </DSection>
          <DSection title="What you'll learn">
            <div style={{ display: "grid", gap: 10 }}>
              {[
                { zone: "Green", color: C.green, bg: C.greenLight, desc: "Your load is manageable. We'll help you build a safety net before you need it — neighbors, resources, and a plan for when things change." },
                { zone: "Yellow", color: C.amber, bg: C.amberLight, desc: "You're showing real strain. It's affecting your health, your work, or your peace of mind. We'll connect you with professional support and community care." },
                { zone: "Red", color: C.red, bg: C.redLight, desc: "Critical burnout. You're functioning as the primary nurse, care coordinator, and financial planner for your loved one — all at once. This is unsustainable. Here's what happens next." },
              ].map((z, i) => (
                <div key={i} style={{ background: z.bg, borderRadius: 12, padding: "16px 18px", border: `1px solid ${z.color}15` }}>
                  <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, color: z.color, marginBottom: 6 }}>{z.zone} Zone</div>
                  <p style={{ fontSize: 13.5, color: C.brownMid, lineHeight: 1.5, margin: 0 }}>{z.desc}</p>
                </div>
              ))}
            </div>
          </DSection>
          <DSection title="After your results">
            <p>Your score is instant — no login required. If you want, save your results and we'll match you with local caregivers, Time Bank neighbors, and resources based on your specific situation. A care coordinator reaches out within 24 hours with a personalized plan.</p>
          </DSection>
        </>
      ),
    },
  };

  return drawers[id] || { title: "Coming Soon", accent: C.gold, content: <p style={{ fontFamily: sans, color: C.brownMid, padding: 20 }}>This section is coming soon. Launching March 2026.</p> };
}

// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════
function Nav({ openDrawer }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const go = (target) => {
    setMenuOpen(false);
    if (target.startsWith("#")) {
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    } else {
      openDrawer(target);
    }
  };

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? `${C.cream}F2` : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        transition: "all 0.4s ease",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: scrolled ? 64 : 72, transition: "height 0.4s",
        }}>
          <a href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 12px rgba(180,156,120,0.2)",
            }}><span style={{ color: "#fff", fontSize: 15 }}>♡</span></div>
            <span style={{ fontFamily: serif, fontWeight: 600, fontSize: 19, color: C.brown }}>co-op.care</span>
          </a>

          <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {[["How It Works", "#how-it-works"], ["Pricing", "#pricing"], ["Families", "real-families"], ["Our Story", "our-story"]].map(([label, target]) => (
              <a key={label} href="#" onClick={e => { e.preventDefault(); go(target); }}
                style={{ textDecoration: "none", fontSize: 14, fontWeight: 500, color: C.brownLight, fontFamily: sans, transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = C.brown} onMouseLeave={e => e.target.style.color = C.brownLight}
              >{label}</a>
            ))}
            <a href="#" onClick={e => { e.preventDefault(); go("assessment-info"); }}
              style={{
                background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, color: "#fff",
                textDecoration: "none", padding: "10px 22px", borderRadius: 24, fontSize: 14,
                fontWeight: 600, fontFamily: sans, boxShadow: "0 2px 12px rgba(180,156,120,0.2)",
                transition: "transform 0.2s",
              }}
              onMouseEnter={e => e.target.style.transform = "translateY(-1px)"} onMouseLeave={e => e.target.style.transform = "translateY(0)"}
            >Free Check-In</a>
          </div>

          {/* Mobile hamburger */}
          <button className="show-mobile" onClick={() => setMenuOpen(!menuOpen)} style={{
            display: "none", background: "none", border: "none", cursor: "pointer", padding: 8,
            flexDirection: "column", gap: 5, alignItems: "center",
          }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 22, height: 2, background: C.brown, borderRadius: 1, transition: "all 0.3s",
                transform: menuOpen ? (i === 0 ? "rotate(45deg) translate(5px, 5px)" : i === 2 ? "rotate(-45deg) translate(5px, -5px)" : "scaleX(0)") : "none",
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: "fixed", top: 64, left: 0, right: 0, bottom: 0, zIndex: 999, background: `${C.cream}FA`, backdropFilter: "blur(16px)", padding: "40px 32px" }}>
          {[["How It Works", "#how-it-works"], ["Pricing", "#pricing"], ["Real Families", "real-families"], ["Our Story", "our-story"], ["For Employers", "for-employers"], ["For Caregivers", "for-caregivers"], ["Contact", "contact"]].map(([label, target]) => (
            <a key={label} href="#" onClick={e => { e.preventDefault(); go(target); }}
              style={{ display: "block", fontFamily: serif, fontSize: 22, fontWeight: 500, color: C.brown, textDecoration: "none", padding: "16px 0", borderBottom: `1px solid ${C.border}` }}
            >{label}</a>
          ))}
          <div style={{ marginTop: 32 }}>
            <a href="#" onClick={e => { e.preventDefault(); go("assessment-info"); }}
              style={{ display: "inline-block", background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`, color: "#fff", padding: "16px 36px", borderRadius: 32, fontSize: 16, fontWeight: 600, fontFamily: sans, textDecoration: "none" }}
            >Take the Free Check-In</a>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════
// HERO — Emotional, simple, one clear ask
// ═══════════════════════════════════════════
function Hero({ openDrawer }) {
  return (
    <section style={{
      minHeight: "100vh",
      background: `linear-gradient(168deg, ${C.warmWhite} 0%, ${C.cream} 40%, ${C.sand} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* Subtle warmth orb */}
      <div style={{ position: "absolute", top: -100, right: -60, width: 380, height: 380, borderRadius: "50%", background: `radial-gradient(circle, ${C.gold}06 0%, transparent 70%)` }} />
      <div style={{ position: "absolute", bottom: -80, left: -40, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${C.teal}04 0%, transparent 70%)` }} />

      <div style={{ padding: "140px 24px 100px", maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 28 }}>Home Care That Actually Works</p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 style={{
            fontFamily: serif, fontSize: "clamp(34px, 5.5vw, 60px)", fontWeight: 600,
            color: C.brown, lineHeight: 1.15, letterSpacing: "-0.025em",
            maxWidth: 700, margin: "0 auto 28px",
          }}>
            Your parent stays home.<br />
            <span style={{ color: C.teal }}>Your caregiver stays.</span><br />
            <span style={{ fontStyle: "italic", fontWeight: 300, color: C.brownLight }}>You breathe.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p style={{
            fontFamily: sans, fontSize: "clamp(16px, 2vw, 19px)", color: C.brownLight,
            lineHeight: 1.8, maxWidth: 520, margin: "0 auto 44px",
          }}>
            A dedicated caregiver who knows your parent by name, earns a real wage, and is still there next month. For a fraction of what a facility costs.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#" onClick={e => { e.preventDefault(); openDrawer("assessment-info"); }} style={{
              background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`, color: "#fff", textDecoration: "none",
              padding: "17px 38px", borderRadius: 40, fontSize: 16, fontWeight: 600, fontFamily: sans,
              boxShadow: "0 4px 24px rgba(13,115,119,0.2)", transition: "all 0.25s ease",
            }} onMouseEnter={e => e.target.style.transform = "translateY(-2px)"} onMouseLeave={e => e.target.style.transform = "translateY(0)"}>
              How heavy is your load?
            </a>
            <a href="#" onClick={e => { e.preventDefault(); document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" }); }} style={{
              background: "transparent", color: C.brown, textDecoration: "none", padding: "17px 38px",
              borderRadius: 40, fontSize: 16, fontWeight: 500, fontFamily: sans, border: `1.5px solid ${C.border}`, transition: "all 0.25s ease",
            }} onMouseEnter={e => e.target.style.borderColor = C.gold} onMouseLeave={e => e.target.style.borderColor = C.border}>
              See how it works
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <p style={{ fontFamily: sans, fontSize: 13, color: C.brownPale, marginTop: 28 }}>
            Free · 2 minutes · No login required · Boulder, Colorado
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// MAIN SITE SECTIONS
// ═══════════════════════════════════════════
function MainSite({ openDrawer }) {

  const link = (drawerId, style = {}) => ({
    href: "#", onClick: e => { e.preventDefault(); openDrawer(drawerId); },
    style: { textDecoration: "none", cursor: "pointer", transition: "all 0.25s ease", ...style },
  });

  return (
    <>
      {/* ── THE NUMBERS ── */}
      <section style={{ background: C.brown }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[
            { number: "$9,900/mo", label: "Average facility cost", sub: "Colorado, 2026" },
            { number: "77%", label: "Caregiver turnover", sub: "A new stranger every few weeks" },
            { number: "63M", label: "Family caregivers", sub: "Most don't call themselves that" },
          ].map((s, i) => (
            <FadeIn key={i} delay={i * 0.1} style={{ padding: "44px 24px", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none", textAlign: "center" }}>
              <div style={{ fontFamily: serif, fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 700, color: C.goldLight, lineHeight: 1 }}>{s.number}</div>
              <div style={{ fontFamily: sans, fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 10 }}>{s.label}</div>
              <div style={{ fontFamily: sans, fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{s.sub}</div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── THE PROBLEM (short, human) ── */}
      <section style={{ background: C.cream, padding: "0 24px" }}>
        <div style={{ padding: "100px 24px 80px", maxWidth: 640, margin: "0 auto" }}>
          <FadeIn>
            <h2 style={{ fontFamily: serif, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 600, color: C.brown, lineHeight: 1.25, marginBottom: 28 }}>
              You're not the only one awake at 2am.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ fontSize: 17, color: C.brownMid, lineHeight: 1.85, fontFamily: sans }}>
              <p style={{ marginBottom: 20 }}>She's 52. She teaches fourth grade. After school, she drives to her mother's house to manage medications, argue with insurance, and pretend she's not exhausted.</p>
              <p style={{ marginBottom: 20 }}>She doesn't call herself a caregiver. She's just doing what daughters do.</p>
              <p>She is one of <a {...link("real-families", { color: C.teal, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 })}>63 million Americans</a> carrying this weight. We built co-op.care for her.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── HOW IT WORKS (radically simple) ── */}
      <section id="how-it-works" style={{ background: C.warmWhite, padding: "0 24px" }}>
        <div style={{ padding: "100px 24px", maxWidth: 900, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.teal, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>How it works</p>
              <h2 style={{ fontFamily: serif, fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 600, color: C.brown, lineHeight: 1.25, maxWidth: 500, margin: "0 auto" }}>Three steps. No jargon. No runaround.</h2>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {[
              {
                num: "01",
                title: "Tell us what you're carrying",
                desc: "A 2-minute check-in that measures how caregiving is affecting your life — not a medical intake form. Instant results, no login.",
                action: "Take the free check-in →",
                drawer: "assessment-info",
              },
              {
                num: "02",
                title: "Meet your caregiver",
                desc: "We match you with a dedicated caregiver who lives nearby and stays every week. They're a W-2 employee with benefits and equity in the cooperative.",
                action: "How care works →",
                drawer: "how-care-works",
              },
              {
                num: "03",
                title: "Get your life back",
                desc: "Professional care for your parent. Clinical notes for their doctor. Neighbor support through the Time Bank. And you finally get to sleep.",
                action: "The Time Bank →",
                drawer: "timebank",
              },
            ].map((step, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <div style={{ background: C.cream, borderRadius: 20, padding: "36px 28px", border: `1px solid ${C.border}`, height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontFamily: serif, fontSize: 36, fontWeight: 300, color: C.goldLight, marginBottom: 20, lineHeight: 1 }}>{step.num}</div>
                  <h3 style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: C.brown, marginBottom: 14, lineHeight: 1.3 }}>{step.title}</h3>
                  <p style={{ fontFamily: sans, fontSize: 14.5, color: C.brownMid, lineHeight: 1.7, flex: 1 }}>{step.desc}</p>
                  <a {...link(step.drawer, { display: "inline-block", marginTop: 20, fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.teal })}>
                    {step.action}
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE ECONOMICS (simple comparison — not the sausage) ── */}
      <section id="pricing" style={{ background: C.cream, padding: "0 24px" }}>
        <div style={{ padding: "100px 24px", maxWidth: 900, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.gold, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>What it costs</p>
              <h2 style={{ fontFamily: serif, fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 600, color: C.brown, lineHeight: 1.25, maxWidth: 560, margin: "0 auto" }}>
                Your parent stays in their own bed. For 40–80% less.
              </h2>
            </div>
          </FadeIn>

          {/* Comparison */}
          <FadeIn delay={0.1}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 48 }}>
              {/* Facility */}
              <div style={{ background: C.redLight, borderRadius: 20, padding: "32px 28px", border: `1px solid ${C.red}12`, opacity: 0.85 }}>
                <div style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, color: C.red, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>Facility care</div>
                <div style={{ fontFamily: serif, fontSize: 42, fontWeight: 700, color: C.red, lineHeight: 1 }}>$9,900<span style={{ fontSize: 18, fontWeight: 400 }}>/mo</span></div>
                <p style={{ fontFamily: sans, fontSize: 14, color: C.brownMid, marginTop: 16, lineHeight: 1.6 }}>Shared room. Institutional meals. Rotating staff. Your parent leaves their home, their neighborhood, their life.</p>
              </div>

              {/* co-op.care */}
              <div style={{ background: `linear-gradient(135deg, ${C.tealLight}, ${C.greenLight})`, borderRadius: 20, padding: "32px 28px", border: `2px solid ${C.teal}20`, position: "relative" }}>
                <div style={{ position: "absolute", top: -12, right: 20, background: C.teal, color: "#fff", fontFamily: sans, fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 20, letterSpacing: "0.03em" }}>RECOMMENDED</div>
                <div style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, color: C.teal, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>co-op.care home care</div>
                <div style={{ fontFamily: serif, fontSize: 42, fontWeight: 700, color: C.teal, lineHeight: 1 }}>$550–3,500<span style={{ fontSize: 18, fontWeight: 400 }}>/mo</span></div>
                <p style={{ fontFamily: sans, fontSize: 14, color: C.brownMid, marginTop: 16, lineHeight: 1.6 }}>Their own bed. Their own neighborhood. A caregiver who knows them by name and stays month after month.</p>
              </div>
            </div>
          </FadeIn>

          {/* Three tiers, simple */}
          <FadeIn delay={0.2}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              {[
                { tier: "Companion Care", hours: "4–12 hrs/week", price: "$550–1,200/mo", desc: "Companionship, errands, meal prep, medication reminders. Neighbors from the Time Bank fill in the gaps.", color: C.green },
                { tier: "Regular Support", hours: "15–30 hrs/week", price: "$1,500–3,500/mo", desc: "Personal care, mobility support, medication management. A dedicated worker-owner caregiver every week.", color: C.teal, popular: true },
                { tier: "Comprehensive", hours: "30–56+ hrs/week", price: "$3,500–9,000/mo", desc: "Complex care with clinical oversight. Hospital discharge coordination. Still 40% less than a facility.", color: C.brown },
              ].map((t, i) => (
                <div key={i} style={{
                  background: C.warmWhite, borderRadius: 18, padding: "28px 24px",
                  border: t.popular ? `2px solid ${C.teal}25` : `1px solid ${C.border}`,
                  position: "relative",
                }}>
                  {t.popular && <div style={{ position: "absolute", top: -10, left: 20, background: C.teal, color: "#fff", fontFamily: sans, fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 12, letterSpacing: "0.04em" }}>MOST POPULAR</div>}
                  <div style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, color: t.color, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>{t.tier}</div>
                  <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.brown, marginBottom: 4 }}>{t.price}</div>
                  <div style={{ fontFamily: sans, fontSize: 12, color: C.brownPale, marginBottom: 14 }}>{t.hours}</div>
                  <p style={{ fontFamily: sans, fontSize: 13.5, color: C.brownMid, lineHeight: 1.6, margin: 0 }}>{t.desc}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Tax hint — not the sausage */}
          <FadeIn delay={0.3}>
            <div onClick={() => openDrawer("tax-savings")} style={{
              marginTop: 32, background: `linear-gradient(135deg, ${C.gold}08, ${C.teal}04)`, borderRadius: 16,
              padding: "24px 28px", border: `1px solid ${C.border}`, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
              transition: "transform 0.3s",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div>
                <p style={{ fontFamily: serif, fontSize: 18, fontWeight: 600, color: C.brown, marginBottom: 6 }}>These prices can drop another 36%.</p>
                <p style={{ fontFamily: sans, fontSize: 14, color: C.brownFaint, margin: 0 }}>Our clinical oversight qualifies your care costs for HSA and FSA tax advantages that traditional agencies can't offer.</p>
              </div>
              <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.teal, whiteSpace: "nowrap" }}>See how →</div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── WHY CAREGIVERS STAY (the real secret) ── */}
      <section style={{ background: C.warmWhite, padding: "0 24px" }}>
        <div style={{ padding: "100px 24px", maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 48, alignItems: "center" }}>
            <FadeIn>
              <div>
                <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.teal, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>The real difference</p>
                <h2 style={{ fontFamily: serif, fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: 600, color: C.brown, lineHeight: 1.25, marginBottom: 20 }}>
                  Your caregiver owns the company. That's why they stay.
                </h2>
                <p style={{ fontFamily: sans, fontSize: 16, color: C.brownMid, lineHeight: 1.75, marginBottom: 28 }}>
                  Traditional agencies take 40-60% of what you pay. The caregiver gets what's left — no benefits, no equity, no reason to stay. Our caregivers earn $25-28/hr as W-2 employees, build $52K in equity over five years, and vote on how the business is run.
                </p>
                <a {...link("for-caregivers", { display: "inline-block", fontFamily: sans, fontSize: 15, fontWeight: 600, color: C.teal, textDecoration: "underline", textUnderlineOffset: 4 })}>
                  Meet our caregivers →
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Traditional agency", values: [{ k: "Caregiver pay", v: "$13–17/hr" }, { k: "Benefits", v: "None" }, { k: "Annual turnover", v: "77%" }], accent: C.red, bg: C.redLight },
                  { label: "co-op.care", values: [{ k: "Caregiver pay", v: "$25–28/hr" }, { k: "Benefits", v: "Full W-2" }, { k: "Annual turnover", v: "<15% target" }], accent: C.teal, bg: C.tealLight },
                ].map((col, ci) => (
                  <div key={ci} style={{ background: col.bg, borderRadius: 16, padding: "24px 18px", border: `1px solid ${col.accent}12` }}>
                    <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: col.accent, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 18 }}>{col.label}</div>
                    {col.values.map((v, vi) => (
                      <div key={vi} style={{ marginBottom: 14 }}>
                        <div style={{ fontFamily: sans, fontSize: 11, color: C.brownPale }}>{v.k}</div>
                        <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: col.accent, lineHeight: 1.2 }}>{v.v}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── TIME BANK (brief, warm) ── */}
      <section style={{ background: `linear-gradient(168deg, ${C.sand} 0%, ${C.sandDark} 100%)`, padding: "0 24px" }}>
        <div style={{ padding: "100px 24px", maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48, alignItems: "center" }}>
            <FadeIn>
              <div style={{ background: C.warmWhite, borderRadius: 20, padding: "32px 24px", border: `1px solid ${C.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.03)" }}>
                {[
                  { emoji: "🌅", name: "Margaret", action: "Walks with Eleanor on Tuesdays", credit: "+1 hr" },
                  { emoji: "🍲", name: "David", action: "Drops off meals on Thursdays", credit: "+1 hr" },
                  { emoji: "📖", name: "Lisa", action: "Reads to Ruth while her daughter sleeps", credit: "+1 hr" },
                ].map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, background: `${C.teal}04`, border: `1px solid ${C.teal}08`, marginBottom: 10 }}>
                    <span style={{ fontSize: 26 }}>{p.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.brown }}>{p.name}</div>
                      <div style={{ fontFamily: sans, fontSize: 12, color: C.brownFaint }}>{p.action}</div>
                    </div>
                    <div style={{ fontFamily: serif, fontSize: 13, fontWeight: 600, color: C.teal, background: C.tealLight, padding: "3px 10px", borderRadius: 8 }}>{p.credit}</div>
                  </div>
                ))}
                <div style={{ marginTop: 14, padding: "14px 16px", borderRadius: 14, background: `${C.gold}06`, textAlign: "center" }}>
                  <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.teal }}>$7,488</div>
                  <div style={{ fontFamily: sans, fontSize: 11, color: C.brownFaint }}>average annual savings per family</div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div>
                <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.teal, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>The Time Bank</p>
                <h2 style={{ fontFamily: serif, fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: 600, color: C.brown, lineHeight: 1.25, marginBottom: 20 }}>
                  1 hour of help = 1 hour of credit.
                </h2>
                <p style={{ fontFamily: sans, fontSize: 16, color: C.brownMid, lineHeight: 1.75, marginBottom: 28 }}>
                  You don't need a medical degree to sit with someone so their daughter can sleep. Everyone passes a background check. Every hour is tracked. Every credit you earn is yours to use, save, or gift.
                </p>
                <a {...link("timebank", { display: "inline-block", background: "transparent", color: C.teal, padding: "13px 28px", borderRadius: 32, fontSize: 15, fontWeight: 600, fontFamily: sans, border: `2px solid ${C.teal}`, transition: "all 0.2s" })}
                  onMouseEnter={e => { e.target.style.background = C.teal; e.target.style.color = "#fff"; }}
                  onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = C.teal; }}
                >Join the Time Bank</a>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── FOR EMPLOYERS (brief hook) ── */}
      <section style={{ background: C.warmWhite, padding: "0 24px" }}>
        <div style={{ padding: "80px 24px", maxWidth: 800, margin: "0 auto" }}>
          <FadeIn>
            <div onClick={() => openDrawer("for-employers")} style={{
              background: C.amberLight, borderRadius: 24, padding: "40px 36px",
              border: `1px solid ${C.amber}12`, cursor: "pointer", transition: "transform 0.3s",
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 32, alignItems: "center",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div>
                <p style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, color: C.amber, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>For employers</p>
                <h3 style={{ fontFamily: serif, fontSize: 24, fontWeight: 600, color: C.brown, lineHeight: 1.3, marginBottom: 12 }}>23% of your employees are secret caregivers.</h3>
                <p style={{ fontFamily: sans, fontSize: 14, color: C.brownMid, lineHeight: 1.6 }}>It's costing you $5,365 per person per year in lost productivity and turnover. There's a benefit for this now.</p>
                <p style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.amber, marginTop: 16 }}>See the employer case study →</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: serif, fontSize: 48, fontWeight: 700, color: C.amber, lineHeight: 1 }}>$2.1M</div>
                <div style={{ fontFamily: sans, fontSize: 13, color: C.brownFaint, marginTop: 8 }}>Hidden annual cost at BVSD<br />(1,717 employees)</div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── SOCIAL PROOF / ABOUT (one block) ── */}
      <section style={{ background: C.cream, padding: "0 24px" }}>
        <div style={{ padding: "80px 24px", maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 48 }}>
              {[
                { value: "26", label: "home care co-ops in the US", sub: "We're building #27" },
                { value: "34%", label: "co-op growth since 2020", sub: "vs 13% traditional" },
                { value: "88%", label: "of revenue to caregivers", sub: "vs 43% at agencies" },
              ].map((s, i) => (
                <div key={i} style={{ background: C.warmWhite, borderRadius: 16, padding: "22px 16px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: C.gold, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, color: C.brown, marginTop: 8, lineHeight: 1.3 }}>{s.label}</div>
                  <div style={{ fontFamily: sans, fontSize: 11, color: C.brownPale }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div onClick={() => openDrawer("our-story")} style={{
              background: `linear-gradient(135deg, ${C.gold}06, ${C.teal}04)`, borderRadius: 20,
              padding: "32px 28px", border: `1px solid ${C.border}`, cursor: "pointer",
            }}>
              <p style={{ fontFamily: serif, fontSize: 20, fontStyle: "italic", color: C.brown, lineHeight: 1.6, fontWeight: 300, maxWidth: 520, margin: "0 auto" }}>
                "When technology eliminates healthcare friction, who captures the savings? In our model, the workers and families do."
              </p>
              <p style={{ fontFamily: sans, fontSize: 13, color: C.brownPale, marginTop: 16, fontWeight: 600 }}>
                Blaine Warkentine, Founder · <span style={{ color: C.teal }}>Read our story →</span>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: `linear-gradient(168deg, ${C.brown} 0%, #2a2318 100%)`, padding: "0 24px", textAlign: "center" }}>
        <div style={{ padding: "100px 24px", maxWidth: 600, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", boxShadow: "0 4px 20px rgba(180,156,120,0.3)" }}>
              <span style={{ fontSize: 22, color: "#fff" }}>♡</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 style={{ fontFamily: serif, fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 600, color: "#fff", lineHeight: 1.25, maxWidth: 480, margin: "0 auto 20px" }}>
              You've been carrying this alone long enough.
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p style={{ fontFamily: sans, fontSize: 17, color: "rgba(255,255,255,0.6)", lineHeight: 1.75, maxWidth: 440, margin: "0 auto 36px" }}>
              Take the free 2-minute check-in. No login, no credit card, no sales pitch. Just an honest picture of where you are — and what comes next.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <a href="#" onClick={e => { e.preventDefault(); openDrawer("assessment-info"); }}
              style={{
                display: "inline-block", background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`, color: "#fff",
                padding: "18px 44px", borderRadius: 40, fontSize: 17, fontWeight: 600, fontFamily: sans,
                boxShadow: "0 4px 24px rgba(13,115,119,0.3)", textDecoration: "none", transition: "transform 0.2s",
              }}
              onMouseEnter={e => e.target.style.transform = "translateY(-2px)"} onMouseLeave={e => e.target.style.transform = "translateY(0)"}
            >How heavy is your load?</a>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#1a1610", padding: "56px 24px 36px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 36, marginBottom: 44 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 13 }}>♡</span>
              </div>
              <span style={{ fontFamily: serif, fontWeight: 600, fontSize: 17, color: C.goldLight }}>co-op.care</span>
            </div>
            <p style={{ fontFamily: sans, fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>Worker-owned home care.<br />Boulder, Colorado.</p>
          </div>
          <div>
            <h4 style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>For Families</h4>
            {[["Free Check-In", "assessment-info"], ["How Care Works", "how-care-works"], ["Real Families", "real-families"], ["Time Bank", "timebank"], ["Tax Savings", "tax-savings"]].map(([label, target]) => (
              <a key={label} href="#" onClick={e => { e.preventDefault(); openDrawer(target); }}
                style={{ display: "block", fontFamily: sans, fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none", marginBottom: 9, transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.75)"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}
              >{label}</a>
            ))}
          </div>
          <div>
            <h4 style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Partners</h4>
            {[["For Employers", "for-employers"], ["For Caregivers", "for-caregivers"], ["Our Story", "our-story"], ["Contact Us", "contact"]].map(([label, target]) => (
              <a key={label} href="#" onClick={e => { e.preventDefault(); openDrawer(target); }}
                style={{ display: "block", fontFamily: sans, fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none", marginBottom: 9, transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.75)"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}
              >{label}</a>
            ))}
          </div>
          <div>
            <h4 style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Connect</h4>
            <a href="mailto:blaine@co-op.care" style={{ display: "block", fontFamily: sans, fontSize: 13, color: C.goldLight, textDecoration: "none", marginBottom: 9 }}>blaine@co-op.care</a>
            <p style={{ fontFamily: sans, fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginTop: 8 }}>Launching March 2026</p>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <p style={{ fontFamily: sans, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>© 2026 co-op.care Technologies LLC · Boulder, Colorado</p>
          <p style={{ fontFamily: sans, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Worker-owned · Neighbor-powered</p>
        </div>
      </footer>
    </>
  );
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function CoopCareWebsite() {
  const [activeDrawer, setActiveDrawer] = useState(null);
  const openDrawer = useCallback((id) => setActiveDrawer(id), []);
  const closeDrawer = useCallback(() => setActiveDrawer(null), []);

  return (
    <div style={{ fontFamily: sans, color: C.brown }}>
      <Nav openDrawer={openDrawer} />
      <Hero openDrawer={openDrawer} />
      <MainSite openDrawer={openDrawer} />
      {activeDrawer && <Drawer drawerId={activeDrawer} onClose={closeDrawer} />}
    </div>
  );
}
