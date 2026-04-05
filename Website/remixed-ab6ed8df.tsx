import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   co-op.care — Community Membership v3
   Cooperative ethos: Everyone gives.
   Everyone gets. Nobody pays for belonging.
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
  violet: "#6D28D9", violetLight: "#F5F3FF",
};
const serif = "'Fraunces', 'Georgia', serif";
const sans = "'DM Sans', 'Helvetica Neue', sans-serif";

const styleTag = document.createElement("style");
styleTag.textContent = `* { box-sizing: border-box; margin: 0; } html { scroll-behavior: smooth; } body { margin: 0; padding: 0; background: ${C.cream}; }`;
document.head.appendChild(styleTag);

function useInView(t = 0.08) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.unobserve(el); } }, { threshold: t });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, v];
}

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(28px)", transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`, ...style }}>{children}</div>
  );
}

// ── Drawer building blocks ──
function DH({ icon, bg, title, subtitle }) {
  return (<div style={{ background: bg, borderRadius: 20, padding: "36px 28px", marginBottom: 28, textAlign: "center" }}>
    <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 22, color: "#fff" }}>{icon}</div>
    <h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 600, color: "#fff", lineHeight: 1.25, marginBottom: 10 }}>{title}</h2>
    <p style={{ fontFamily: sans, fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, maxWidth: 440, margin: "0 auto" }}>{subtitle}</p>
  </div>);
}
function DS({ title, children }) {
  return (<div style={{ marginBottom: 28 }}><h3 style={{ fontFamily: serif, fontSize: 18, fontWeight: 600, color: C.brown, marginBottom: 12 }}>{title}</h3><div style={{ fontFamily: sans, fontSize: 14.5, color: C.brownMid, lineHeight: 1.7 }}>{children}</div></div>);
}
function DG({ cols, children }) {
  return (<div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${cols === 1 ? "280" : cols === 2 ? "200" : "150"}px, 1fr))`, gap: 12, marginTop: 12 }}>{children}</div>);
}
function DC({ text }) {
  return (<div style={{ background: `linear-gradient(135deg, ${C.gold}08, ${C.teal}06)`, borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.border}`, marginTop: 16 }}><p style={{ fontFamily: sans, fontSize: 14, color: C.brownMid, lineHeight: 1.65, margin: 0, fontStyle: "italic" }}>{text}</p></div>);
}
function DCTA({ text, subtitle }) {
  return (<div style={{ textAlign: "center", padding: "8px 0 12px" }}><div style={{ display: "inline-block", background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`, color: "#fff", padding: "15px 36px", borderRadius: 32, fontSize: 15, fontWeight: 600, fontFamily: sans, cursor: "pointer", boxShadow: "0 4px 20px rgba(13,115,119,0.2)" }}>{text}</div>{subtitle && <p style={{ fontFamily: sans, fontSize: 12, color: C.brownPale, marginTop: 10 }}>{subtitle}</p>}</div>);
}

// ── Exchange block — "you give / community gets" ──
function Exchange({ give, get, giveIcon = "→", getIcon = "←", giveColor = C.gold, getColor = C.teal }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, marginTop: 12, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}` }}>
      <div style={{ background: `${giveColor}06`, padding: "20px 18px", borderRight: `1px solid ${C.border}` }}>
        <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: giveColor, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 14 }}>{giveIcon}</span> You give</div>
        {give.map((g, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <span style={{ color: giveColor, fontSize: 9, marginTop: 5 }}>●</span>
            <span style={{ fontFamily: sans, fontSize: 13, color: C.brownMid, lineHeight: 1.4 }}>{g}</span>
          </div>
        ))}
      </div>
      <div style={{ background: `${getColor}06`, padding: "20px 18px" }}>
        <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: getColor, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 14 }}>{getIcon}</span> Everyone gets</div>
        {get.map((g, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <span style={{ color: getColor, fontSize: 9, marginTop: 5 }}>●</span>
            <span style={{ fontFamily: sans, fontSize: 13, color: C.brownMid, lineHeight: 1.4 }}>{g}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// DRAWER CONTENT — cooperative ethos
// ═══════════════════════════════════════════
function getDrawerContent(id) {
  const drawers = {

    "how-it-works": {
      title: "How the Co-op Works",
      accent: C.teal,
      content: (
        <>
          <DH icon="♡" bg={C.teal} title="Nobody pays for belonging. Everyone contributes something." subtitle="This is a cooperative, not a subscription. The more each person puts in, the more everyone has." />
          <DS title="The cooperative principle">
            <p>In a traditional company, you pay money and receive a product. The company keeps the profit. In a cooperative, everyone contributes what they can — time, skills, money, or just showing up — and the value flows back to the community. There is no profit extraction. There are no shareholders. There is only the neighborhood.</p>
            <p style={{ marginTop: 12 }}>co-op.care has four ways to contribute. None is more valuable than another. A retired teacher who walks with an elder on Tuesday mornings is contributing just as much as someone who writes a monthly check. The currency is care. The return is a community that knows your name.</p>
          </DS>
          <DS title="Four ways to contribute">
            <DG cols={2}>
              {[
                { way: "Your time", icon: "⏰", color: C.green, examples: "Walk with a neighbor. Drive someone to an appointment. Sit with someone so their daughter can sleep. Every hour = 1 Time Credit." },
                { way: "Your skills", icon: "◈", color: C.teal, examples: "Fix a grab bar. Teach a tech class. Translate for a family. Lead a support circle. Review a care plan. Your expertise has value here." },
                { way: "Your presence", icon: "♡", color: C.gold, examples: "Show up to potlucks. Vote in governance meetings. Take the CII assessment. Check on the neighbor you haven't seen in a week. Density is the infrastructure." },
                { way: "Your resources", icon: "◇", color: C.amber, examples: "Monthly contribution (sliding scale, whatever you can). Donate equipment. Fund a neighbor's membership. Sponsor a community event. Every dollar stays local." },
              ].map((w, i) => (
                <div key={i} style={{ background: `${w.color}06`, borderRadius: 14, padding: "18px 16px", border: `1px solid ${w.color}10` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>{w.icon}</span>
                    <span style={{ fontFamily: serif, fontSize: 15, fontWeight: 600, color: C.brown }}>{w.way}</span>
                  </div>
                  <p style={{ fontFamily: sans, fontSize: 13, color: C.brownFaint, lineHeight: 1.5, margin: 0 }}>{w.examples}</p>
                </div>
              ))}
            </DG>
          </DS>
          <DS title="What everyone gets back">
            <p>Regardless of how you contribute, every member of the cooperative has access to the full community — assessments, Time Bank, events, support circles, care planning tools, the resource directory, and the knowledge that when you need help, it's already there. The tiers aren't paywalls. They're levels of engagement. You choose how deep you want to go.</p>
          </DS>
          <DCTA text="Find your place in the co-op" subtitle="Start anywhere. Contribute what you can. Grow when you're ready." />
        </>
      ),
    },

    "circle-neighbor": {
      title: "The Neighbor Circle",
      accent: C.green,
      content: (
        <>
          <DH icon="○" bg={C.green} title="You showed up. That's the hardest part." subtitle="The Neighbor Circle is for everyone. No cost. No catch. Just the beginning of something." />
          <DS title="What you bring">
            <p>Yourself. That's it. Maybe you take the CII assessment because you're curious about your own burnout. Maybe you sign up for the Time Bank because you've got Tuesday mornings free. Maybe you just want to know who else in your neighborhood cares about aging in place. All of that counts.</p>
          </DS>
          <Exchange
            give={["Your presence — showing up, being counted, adding to neighborhood density", "Your honest CII/CRI scores — anonymized, they help us understand where care gaps are", "Whatever Time Bank hours you can spare — even one hour a month matters", "Word of mouth — tell one neighbor about co-op.care"]}
            get={["CII & CRI assessments for anyone, anytime — your burnout score and your loved one's care map", "Time Bank access — earn credits by helping, spend them when you need help", "Community events — potlucks, walks, support circles, skills workshops", "Resource directory — vetted local providers, senior services, legal aid, respite care", "Neighborhood dashboard — see your community's density growing in real time", "The knowledge that when you need help, you won't be starting from zero"]}
            giveColor={C.green} getColor={C.teal}
          />
          <DS title="Why your presence matters more than money">
            <p>The Village Movement — 300+ aging-in-place communities across America — found that the single strongest predictor of community resilience isn't funding. It's density. How many people know each other. How many people show up. A Village coordinator put it simply: you need 3–4 committed people to start, and 50 engaged households to become self-sustaining.</p>
            <p style={{ marginTop: 12 }}>Every Neighbor who joins makes every other Neighbor safer. Your CII score — even if you never use a paid service — helps the cooperative understand where burnout is concentrated. Your Time Bank hour means someone's daughter sleeps tonight. Your presence at the potluck means the retired widower on Maple Street has a reason to leave the house.</p>
            <DC text={`"About 40% of Village members serve as volunteers for other members in some capacity. Older adults who actively participate experience improvements in social engagement, civic engagement, quality of life, and confidence in believing they can age in their own homes." — AARP Village Model Research, 2022`} />
          </DS>
          <DCTA text="Join the Neighbor Circle" subtitle="Free. Takes 2 minutes. Start with the CII assessment." />
        </>
      ),
    },

    "circle-keeper": {
      title: "The Keeper Circle",
      accent: C.teal,
      content: (
        <>
          <DH icon="◇" bg={C.teal} title="You're not just in the community. You're tending it." subtitle="Keepers contribute regular time, skills, or resources — and the whole neighborhood deepens." />
          <DS title="What Keepers give">
            <p>Keepers are the people who make the cooperative feel like a neighborhood instead of a platform. They commit to something regular — a monthly Time Bank shift, a weekly check-in call, a quarterly governance vote, or a sliding-scale financial contribution. The form doesn't matter. The consistency does.</p>
          </DS>
          <Exchange
            give={[
              "Regular Time Bank commitment — at least 2 hours/month of neighbor-helping-neighbor",
              "Or a skill contribution — leading a support circle, teaching a class, mentoring a new member",
              "Or a sliding-scale monthly contribution — $10, $25, $50, whatever your household can sustain",
              "Or governance participation — attend quarterly meetings, vote on cooperative priorities",
              "Any combination of the above — the co-op values all contributions equally",
            ]}
            get={[
              "Everything in the Neighbor Circle, plus:",
              "Monthly CII check-in — track your trajectory, catch escalation before crisis",
              "Priority Time Bank matching — your help requests are served first",
              "Caregiver support circle — monthly facilitated group for people carrying the weight",
              "Care planning toolkit — advance directives, medication tracking, emergency protocols",
              "Family coordination hub — share care plans with siblings, stop the 2am group text",
              "10% discount when you need professional co-op.care services",
              "Your contribution directly funds a neighbor's free membership",
            ]}
            giveColor={C.gold} getColor={C.teal}
          />
          <DS title="The sliding scale">
            <p>We will never ask you to prove your income. We will never shame you for contributing $10 instead of $50. The sliding scale is exactly what it sounds like: contribute what your household can sustain. If that's $10 and two hours of Time Bank, you're a Keeper. If that's $50 and zero Time Bank hours because you're already caring for your mother 40 hours a week, you're a Keeper. If that's $0 and four hours a month because you're retired and rich in time, you're a Keeper.</p>
            <p style={{ marginTop: 12 }}>The only thing we ask is consistency. A cooperative runs on trust, and trust runs on showing up.</p>
            <DC text={`Every dollar contributed by a Keeper stays in the community. There are no shareholders. No franchise fees going to corporate headquarters. No venture capitalists expecting a return. 88% of net revenue goes to worker-owner caregivers. The rest covers clinical oversight, insurance, and the technology that connects everyone.`} />
          </DS>
          <DS title="HSA / FSA / Employer reimbursement">
            <p>The Keeper contribution qualifies as a preventive health expense under most HSA and FSA plans. Many employers reimburse caregiver support benefits. Ask your HR department — or tell them about our employer program, where we can cover your whole team.</p>
          </DS>
          <DCTA text="Become a Keeper" subtitle="Sliding scale. Cancel anytime. Your contribution funds a neighbor." />
        </>
      ),
    },

    "circle-builder": {
      title: "The Builder Circle",
      accent: C.gold,
      content: (
        <>
          <DH icon="◈" bg={C.goldDark} title="You're not using a cooperative. You're building one." subtitle="Builders shape what this becomes — through governance, ownership, and community leadership." />
          <DS title="What Builders give">
            <p>Builders commit to the democratic life of the cooperative. They attend governance meetings. They vote. They mentor new members. They organize living-room chats in their neighborhoods. They bridge the gap between "I signed up for an app" and "this is my community."</p>
          </DS>
          <Exchange
            give={[
              "Governance participation — quarterly meetings, annual assembly, committee work",
              "Community organizing — host living-room chats, recruit neighbors, welcome new members",
              "Mentorship — pair with a new Neighbor or Keeper, help them find their place",
              "Regular contribution — time, skills, and/or resources at Keeper level or above",
              "Feedback — help test new features, review care plans, improve the cooperative",
            ]}
            get={[
              "Everything in Keeper Circle, plus:",
              "Voting rights on cooperative direction — where resources go, who leads, what's next",
              "Governance credits — every meeting, vote, and mentorship hour earns equity credits",
              "Path to cooperative ownership — credits accumulate in your Internal Capital Account",
              "Beta access to CareOS tools — help shape the technology before it launches",
              "Builder badge — visible signal of your investment in the community",
              "15% discount on professional care services",
              "Annual impact report — your personal contribution mapped against community outcomes",
              "The satisfaction of building something that will outlive you",
            ]}
            giveColor={C.gold} getColor={C.teal}
          />
          <DS title="Governance that matters">
            <p>This isn't a suggestion box. co-op.care follows the Quebec Solidarity Cooperative model — the fastest-growing cooperative form in North America. Three membership classes share real power: worker-owners (40% of board seats), user members who receive care (30%), and supporter members like Builders (30%). When you vote as a Builder, you're voting alongside the caregiver who bathes your neighbor's mother and the family who depends on that care.</p>
            <p style={{ marginTop: 12 }}>Decisions are made by simple majority for routine business. Two-thirds supermajority for bylaws changes, major partnerships, and budget allocation. Every member gets one vote within their class. No one gets more votes by contributing more money.</p>
          </DS>
          <DS title="The ownership path">
            <p>Every governance meeting attended, every committee hour served, every mentorship session completed earns equity credits in your Internal Capital Account — the same structure that worker-owner caregivers use to build $52K in equity over 5 years. You're not paying for a subscription. You're earning ownership in a community institution.</p>
            <DC text={`Colorado's Employee Ownership Tax Credit covers 75% of cooperative formation costs. When your neighborhood reaches density threshold and incorporates, your equity credits transfer to the new entity. You helped build it. You own a piece of it.`} />
          </DS>
          <DCTA text="Become a Builder" subtitle="Governance. Ownership. Community. This is your cooperative." />
        </>
      ),
    },

    "circle-founder": {
      title: "The Founder Circle",
      accent: C.amber,
      content: (
        <>
          <DH icon="△" bg={C.amber} title="Every cooperative in history started with a handful of people who believed before it was proven." subtitle="Founders give the most — and trust the most. Limited to 100 founding households." />
          <DS title="What Founders give">
            <p>Founders invest their resources, their reputation, and their time at the deepest level. They serve on the advisory board. They fund the infrastructure that makes the first year possible — the legal formation, the clinical governance, the technology. They connect the cooperative with their professional networks. They put their name on something that doesn't exist yet.</p>
          </DS>
          <Exchange
            give={[
              "Significant resource commitment — $150/month or equivalent time/skill contribution",
              "Advisory board service — monthly strategic sessions alongside Clinical Director and operations",
              "Network activation — introduce co-op.care to employers, hospitals, providers, civic leaders",
              "Public advocacy — willingness to be named as a founding member, speak at events",
              "Long-term commitment — Founders commit to 12 months to give the cooperative runway",
            ]}
            get={[
              "Everything in Builder Circle, plus:",
              "Advisory board participation — real influence on strategy, partnerships, and expansion",
              "2x equity credit accumulation — accelerated path to cooperative ownership",
              "Priority caregiver matching — when you need professional care, you're matched first",
              "Founding member recognition — in perpetuity, in cooperative records and public materials",
              "Annual founder gathering — dinner with the people building this together",
              "Early access to the aging-in-place insurance product (when it launches)",
              "Direct line to the care coordinator — for non-emergency questions",
              "20% discount on professional care services",
              "The knowledge that 100 households built the 27th home care cooperative in America",
            ]}
            giveColor={C.amber} getColor={C.teal}
          />
          <DS title="Why 100?">
            <p>CHCA — the nation's largest worker-owned home care cooperative — was founded in the Bronx in 1985 by a small group who believed caregivers deserved ownership. 40 years later, it's still operating. Circle of Life in Bellingham, Washington started in 2007 with a woman who needed help caring for her father and called out to other women for help. It now has 30+ caregiver-owners.</p>
            <p style={{ marginTop: 12 }}>100 Founding households at $150/month generates $180K in annual community investment — enough to fund the Clinical Director, legal formation, first caregiver cohort, and technology infrastructure for Year One. After that, the cooperative sustains itself through care revenue, employer partnerships, and Medicare billing. The Founders make the first year possible. The community makes the next forty years inevitable.</p>
          </DS>
          <DCTA text="Become a Founder" subtitle="100 households. 12-month commitment. The beginning of everything." />
        </>
      ),
    },

    "village-status": {
      title: "Village Status",
      accent: C.violet,
      content: (
        <>
          <DH icon="♡" bg={C.violet} title="When your neighborhood has enough neighbors, something extraordinary happens." subtitle="Nobody pays for Village Status. The community earns it — together." />
          <DS title="What is Village Status?">
            <p>It's what happens when enough people in the same place care about the same thing. Not a product launch. Not a feature unlock. A community reaching the density where mutual aid becomes self-sustaining — where you don't need to call a hotline because your neighbor already noticed you haven't picked up your mail.</p>
            <p style={{ marginTop: 12 }}>The Village Movement has proven this works. 300+ communities. Average size: 140 members. 40% volunteer for each other. 79% say they're more likely to stay in their homes because of their Village. co-op.care adds something the Village Movement doesn't have: professional caregiver cooperatives, AI clinical documentation, and Medicare billing infrastructure.</p>
          </DS>
          <DS title="The five thresholds">
            <DG cols={1}>
              {[
                { n: "10 members / 2 mi", stage: "Seed", color: C.green, give: "10 neighbors who signed up and said 'I'm here'", get: "Time Bank activates. Monthly meetup auto-scheduled. Community thread opens. You can find each other." },
                { n: "25 members / 2 mi", stage: "Sprout", color: C.teal, give: "25 neighbors engaging — Time Bank hours, events, assessments", get: "Caregiver support circle forms. Group purchasing for care supplies. Shared calendar. You're starting to look like a community." },
                { n: "50 members / 2 mi", stage: "Root", color: C.gold, give: "50 neighbors with enough density to sustain regular activity", get: "Part-time care coordinator assigned. Professional caregivers dispatched from your neighborhood. Same-day emergency respite. Governance council eligible. The infrastructure is real." },
                { n: "100 members / 2 mi", stage: "Village", color: C.amber, give: "100 neighbors — enough for self-sustaining mutual aid and care delivery", get: "Full-time coordinator. Physical Time Bank hub. Shared equipment library (wheelchairs, hospital beds, monitors). Group health advocacy. You're a Village now." },
                { n: "200+ members / 2 mi", stage: "Cooperative", color: C.violet, give: "200 neighbors — enough to incorporate as a worker-owned entity", get: "Your neighborhood files articles of incorporation. Local caregivers become worker-owners with equity. You govern yourselves. The co-op.care federation provides technology, clinical oversight, and billing. You own your care." },
              ].map((t, i) => (
                <div key={i} style={{ padding: "20px 18px", borderRadius: 14, border: `1px solid ${t.color}10`, borderLeft: `4px solid ${t.color}`, background: `${t.color}04` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, color: t.color, letterSpacing: "0.04em", textTransform: "uppercase" }}>{t.stage}</span>
                    <span style={{ fontFamily: sans, fontSize: 11, color: C.brownPale, background: `${t.color}08`, padding: "3px 10px", borderRadius: 8 }}>{t.n}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><span style={{ fontFamily: sans, fontSize: 10, fontWeight: 700, color: C.goldDark, letterSpacing: "0.04em", textTransform: "uppercase" }}>The community gives</span><p style={{ fontFamily: sans, fontSize: 12.5, color: C.brownFaint, lineHeight: 1.45, margin: "4px 0 0" }}>{t.give}</p></div>
                    <div><span style={{ fontFamily: sans, fontSize: 10, fontWeight: 700, color: C.teal, letterSpacing: "0.04em", textTransform: "uppercase" }}>Everyone unlocks</span><p style={{ fontFamily: sans, fontSize: 12.5, color: C.brownFaint, lineHeight: 1.45, margin: "4px 0 0" }}>{t.get}</p></div>
                  </div>
                </div>
              ))}
            </DG>
          </DS>
          <DS title="Your neighborhood right now">
            <p>Every member gets a real-time dashboard showing density — how many neighbors are nearby, what skills are available in the Time Bank, which threshold you're approaching, and what unlocks next. You can invite neighbors directly. You can organize a living-room chat. You can watch a neighborhood come alive.</p>
          </DS>
          <DCTA text="Check your neighborhood's density" subtitle="Join free → See your dashboard → Invite a neighbor" />
        </>
      ),
    },

    "grow-your-coop": {
      title: "Grow Your Own Co-op",
      accent: C.brown,
      content: (
        <>
          <DH icon="◈" bg={C.brown} title="You don't need permission to care for your neighbors." subtitle="co-op.care provides the infrastructure. You provide the community. Then you own it." />
          <DS title="The 6-step path from conversation to cooperative">
            <DG cols={1}>
              {[
                { num: "1", title: "Living-room chats", desc: "3–4 neighbors meet informally. They take the CII together. They talk about what's missing. This is how every Village in America started — and every cooperative since Rochdale in 1844." },
                { num: "2", title: "Seed (10 members)", desc: "The Time Bank activates. Neighbors start exchanging help — meals, rides, companionship. Trust builds through the simple act of showing up for each other." },
                { num: "3", title: "Sprout (25 members)", desc: "A caregiver support circle forms. The neighborhood starts purchasing care supplies together. A governance conversation begins: 'What do we want this to become?'" },
                { num: "4", title: "Root (50 members)", desc: "A care coordinator is assigned. Professional caregivers begin serving the neighborhood. Emergency respite works. The community has real infrastructure." },
                { num: "5", title: "Village (100 members)", desc: "Full-time coordinator. Physical hub. Shared equipment. Governance council with elected representatives. The community is self-sustaining." },
                { num: "6", title: "Cooperative (200+ members)", desc: "The neighborhood incorporates. Worker-owner caregivers from the community receive equity. co-op.care federation provides technology, clinical oversight, billing. The community owns itself." },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: i < 5 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${C.teal}10`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: serif, fontSize: 15, fontWeight: 600, color: C.teal, flexShrink: 0 }}>{s.num}</div>
                  <div><div style={{ fontFamily: serif, fontSize: 15, fontWeight: 600, color: C.brown, marginBottom: 4 }}>{s.title}</div><p style={{ fontFamily: sans, fontSize: 13.5, color: C.brownFaint, lineHeight: 1.55, margin: 0 }}>{s.desc}</p></div>
                </div>
              ))}
            </DG>
          </DS>
          <DS title="What the federation provides — what the community keeps">
            <Exchange
              give={["5% of gross revenue to the co-op.care federation", "Participation in national governance and shared learning"]}
              get={[
                "CareOS AI platform (voice → Omaha System → FHIR R4)",
                "Clinical Director oversight (MD/DO, Medicare-enrolled)",
                "CII/CRI assessment infrastructure",
                "Medicare billing (PIN/CHI codes, ACCESS Model)",
                "Legal templates, bylaws, formation support",
                "Cooperative governance training",
                "Insurance, HIPAA compliance, background checks",
                "Employer benefit platform for B2B revenue",
              ]}
              giveColor={C.gold} getColor={C.teal}
            />
            <DC text={`Traditional home care agencies take 40–60% of revenue as franchise fees, management overhead, and shareholder returns. co-op.care's federation takes 5%. The community keeps 95%. 88% of net revenue goes to worker-owner caregivers. That's not charity. That's cooperative economics.`} />
          </DS>
          <DS title="Who's done this before">
            <p>Washington State: 5 home care cooperatives. Circle of Life in Bellingham (2007), Peninsula in Port Townsend (2016), Capital in Olympia (2018), Ridgeline in Port Angeles (2020), Heartsong in Anacortes (2021). Each started with a handful of caregivers. Each still operates. Each pays better wages than industry average.</p>
            <p style={{ marginTop: 12 }}>CoopCycle: 72 bike delivery cooperatives across 12 countries. Federated model — shared technology, local governance. €49/month first year, then 2% of revenue. Proves that cooperatives can replicate without extracting.</p>
            <p style={{ marginTop: 12 }}>Colorado has zero home care cooperatives. You're building the first one.</p>
          </DS>
          <DCTA text="Start a living-room chat" subtitle="3 neighbors. 1 conversation. Everything starts here." />
        </>
      ),
    },

    "multi-stakeholder": {
      title: "Everyone Has a Seat",
      accent: C.teal,
      content: (
        <>
          <DH icon="◈" bg={C.tealDark} title="Caregivers, families, and community members govern together." subtitle="Three circles of membership. One shared table. Nobody's voice outweighs another's." />
          <DS title="Why multi-stakeholder?">
            <p>Traditional worker cooperatives serve workers. Traditional consumer cooperatives serve consumers. But care is a relationship — it doesn't work unless everyone has voice, dignity, and power. The person giving care and the person receiving care and the community holding them both need to be at the same table.</p>
            <p style={{ marginTop: 12 }}>Quebec pioneered this in 1997 with "solidarity cooperatives." In ten years, 479 were created — especially in home care. Italy did it in 1991 with "social cooperatives" — now numbering over 10,000 enterprises. co-op.care is building the first multi-stakeholder home care cooperative in Colorado.</p>
          </DS>
          <DS title="Three membership classes">
            <DG cols={1}>
              {[
                { class: "Worker-Owners", icon: "◇", color: C.teal, seats: "40%", give: "Their labor, their skill, their presence in your loved one's home every week", get: "$25–28/hr W-2 wages, benefits, $52K equity over 5 years, board representation, democratic control over their working conditions" },
                { class: "User Members", icon: "♡", color: C.gold, seats: "30%", give: "Honest feedback on care quality, participation in quality reviews, trust", get: "Consistent care from a caregiver who stays, voice in service standards and pricing, clinical-grade documentation flowing to their doctor" },
                { class: "Supporter Members", icon: "◈", color: C.violet, seats: "30%", give: "Community investment (time, skills, resources), governance participation, neighborhood organizing", get: "Ownership equity, community infrastructure, the care system they'll need someday, the knowledge they're building something that lasts" },
              ].map((m, i) => (
                <div key={i} style={{ background: `${m.color}05`, borderRadius: 16, padding: "22px 20px", border: `1px solid ${m.color}10` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 22, color: m.color, fontFamily: serif }}>{m.icon}</span>
                    <span style={{ fontFamily: serif, fontSize: 17, fontWeight: 600, color: C.brown }}>{m.class}</span>
                    <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: m.color, background: `${m.color}10`, padding: "2px 10px", borderRadius: 8, marginLeft: "auto" }}>{m.seats} of board</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><span style={{ fontFamily: sans, fontSize: 10, fontWeight: 700, color: C.goldDark, letterSpacing: "0.04em", textTransform: "uppercase" }}>They give</span><p style={{ fontFamily: sans, fontSize: 12.5, color: C.brownFaint, lineHeight: 1.5, margin: "4px 0 0" }}>{m.give}</p></div>
                    <div><span style={{ fontFamily: sans, fontSize: 10, fontWeight: 700, color: C.teal, letterSpacing: "0.04em", textTransform: "uppercase" }}>They receive</span><p style={{ fontFamily: sans, fontSize: 12.5, color: C.brownFaint, lineHeight: 1.5, margin: "4px 0 0" }}>{m.get}</p></div>
                  </div>
                </div>
              ))}
            </DG>
          </DS>
          <DS title="One member, one vote">
            <p>No one gets more votes by contributing more money. The caregiver who earns $25/hour has the same vote as the Founder who contributes $150/month. Board elections happen at the annual assembly. Simple majority for routine decisions. Two-thirds supermajority for bylaws, partnerships, and budget. Quorum is 50% of worker-owners, 30% of user members, 20% of supporter members.</p>
            <DC text={`"The common mission of a multi-stakeholder cooperative reflects the interdependence of interests of the multiple partners. Choosing to focus on common interests rather than divergent ones is as rational a choice as any." — Margaret Lund, Solidarity as a Business Model`} />
          </DS>
        </>
      ),
    },
  };
  return drawers[id] || { title: "Coming Soon", accent: C.gold, content: <p style={{ fontFamily: sans, color: C.brownMid, padding: 20 }}>Coming soon.</p> };
}

// ═══════════════════════════════════════════
// DRAWER COMPONENT
// ═══════════════════════════════════════════
function Drawer({ drawerId, onClose }) {
  const { title, accent, content } = getDrawerContent(drawerId);
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: visible ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0)", transition: "background 0.3s ease" }} onClick={handleClose}>
      <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(560px, 92vw)", background: C.cream, transform: visible ? "translateX(0)" : "translateX(100%)", transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1)", overflowY: "auto", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 10, background: `${C.cream}F0`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 4, height: 20, borderRadius: 2, background: accent }} /><span style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, color: C.brown }}>{title}</span></div>
          <button onClick={handleClose} style={{ width: 36, height: 36, borderRadius: "50%", border: `1.5px solid ${C.border}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: C.brownFaint, fontFamily: sans }} onMouseEnter={e => { e.target.style.background = C.sand; }} onMouseLeave={e => { e.target.style.background = "transparent"; }}>✕</button>
        </div>
        <div style={{ padding: "24px 24px 48px" }}>{content}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function CoopCommunity() {
  const [activeDrawer, setActiveDrawer] = useState(null);
  const open = useCallback((id) => setActiveDrawer(id), []);
  const close = useCallback(() => setActiveDrawer(null), []);

  return (
    <div style={{ fontFamily: sans, color: C.brown }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: `${C.cream}F2`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 16 }}>♡</span></div>
            <span style={{ fontFamily: serif, fontWeight: 600, fontSize: 20, color: C.brown }}>co-op.care</span>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {[["How it works", "how-it-works"], ["Density", "village-status"], ["Grow a co-op", "grow-your-coop"]].map(([l, t]) => (
              <a key={l} href="#" onClick={e => { e.preventDefault(); open(t); }} style={{ fontFamily: sans, fontSize: 14, fontWeight: 500, color: C.brownLight, textDecoration: "none" }}>{l}</a>
            ))}
            <a href="#" onClick={e => { e.preventDefault(); open("circle-neighbor"); }} style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`, color: "#fff", textDecoration: "none", padding: "9px 20px", borderRadius: 20, fontSize: 13, fontWeight: 600, fontFamily: sans }}>Join the co-op</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: "100vh", background: `linear-gradient(168deg, ${C.warmWhite} 0%, ${C.cream} 30%, ${C.sand} 70%, ${C.sandDark} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -120, right: -80, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${C.gold}08 0%, transparent 70%)` }} />
        <div style={{ padding: "140px 24px 80px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <FadeIn><p style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.teal, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24 }}>Everyone gives. Everyone gets. Nobody is a customer.</p></FadeIn>
          <FadeIn delay={0.1}><h1 style={{ fontFamily: serif, fontSize: "clamp(36px, 5.5vw, 60px)", fontWeight: 600, color: C.brown, lineHeight: 1.12, letterSpacing: "-0.03em", marginBottom: 28, maxWidth: 780, margin: "0 auto 28px" }}>
            A cooperative is not a <span style={{ textDecoration: "line-through", opacity: 0.3 }}>product</span>.<br />It's a <span style={{ color: C.teal }}>neighborhood</span> that owns itself.
          </h1></FadeIn>
          <FadeIn delay={0.2}><p style={{ fontFamily: sans, fontSize: "clamp(16px, 2vw, 19px)", color: C.brownLight, lineHeight: 1.75, maxWidth: 560, margin: "0 auto 44px" }}>
            Contribute your time, your skills, your presence, or your resources. The community grows for everyone. When enough neighbors show up, the neighborhood takes care of itself — then it incorporates and governs itself.
          </p></FadeIn>
          <FadeIn delay={0.3}><div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#" onClick={e => { e.preventDefault(); open("how-it-works"); }} style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`, color: "#fff", textDecoration: "none", padding: "18px 40px", borderRadius: 40, fontSize: 17, fontWeight: 600, fontFamily: sans, boxShadow: "0 4px 24px rgba(13,115,119,0.25)" }}>How the co-op works</a>
            <a href="#" onClick={e => { e.preventDefault(); open("circle-neighbor"); }} style={{ background: "transparent", color: C.brown, textDecoration: "none", padding: "18px 40px", borderRadius: 40, fontSize: 17, fontWeight: 500, fontFamily: sans, border: `1.5px solid ${C.border}` }}>Join for free</a>
          </div></FadeIn>
        </div>
      </section>

      {/* The Give/Get Grid */}
      <section style={{ background: C.cream, padding: "0 24px" }}>
        <div style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn><div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.gold, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Four ways to contribute</p>
            <h2 style={{ fontFamily: serif, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, color: C.brown, maxWidth: 650, margin: "0 auto 16px" }}>The currency is care. The return is a community that knows your name.</h2>
          </div></FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {[
              { way: "Your time", icon: "⏰", color: C.green, ex: "Walk with a neighbor. Drive to appointments. Sit with someone. 1 hour = 1 Time Credit.", drawer: "circle-neighbor" },
              { way: "Your skills", icon: "◈", color: C.teal, ex: "Fix a grab bar. Teach a tech class. Lead a support circle. Translate for a family.", drawer: "circle-keeper" },
              { way: "Your presence", icon: "♡", color: C.gold, ex: "Show up. Vote. Check on a neighbor. Take the CII. Attend the potluck. Density is infrastructure.", drawer: "circle-builder" },
              { way: "Your resources", icon: "◇", color: C.amber, ex: "Sliding scale contribution. Donate equipment. Fund a neighbor. Sponsor an event. Every dollar stays local.", drawer: "circle-founder" },
            ].map((w, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div onClick={() => open(w.drawer)} style={{ background: C.warmWhite, borderRadius: 20, padding: "30px 24px", border: `1px solid ${C.border}`, cursor: "pointer", height: "100%", display: "flex", flexDirection: "column", transition: "transform 0.3s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${w.color}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>{w.icon}</div>
                  <h3 style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: C.brown, marginBottom: 10 }}>{w.way}</h3>
                  <p style={{ fontFamily: sans, fontSize: 14.5, color: C.brownMid, lineHeight: 1.65, flex: 1 }}>{w.ex}</p>
                  <span style={{ fontFamily: sans, fontSize: 13, color: w.color, fontWeight: 600, marginTop: 14 }}>See how →</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Circles */}
      <section style={{ background: C.warmWhite, padding: "0 24px" }}>
        <div style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn><div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.teal, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Four circles of engagement</p>
            <h2 style={{ fontFamily: serif, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, color: C.brown, maxWidth: 650, margin: "0 auto 16px" }}>Not tiers. Not levels. Circles. Because every circle holds the ones inside it.</h2>
          </div></FadeIn>

          {/* Concentric circles visual */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
            <div style={{ position: "relative", width: "min(500px, 90vw)", height: "min(500px, 90vw)" }}>
              {[
                { r: "100%", color: C.amber, label: "Founder", sub: "invest deeply", drawer: "circle-founder" },
                { r: "78%", color: C.gold, label: "Builder", sub: "shape governance", drawer: "circle-builder" },
                { r: "56%", color: C.teal, label: "Keeper", sub: "tend the community", drawer: "circle-keeper" },
                { r: "34%", color: C.green, label: "Neighbor", sub: "show up", drawer: "circle-neighbor" },
              ].map((c, i) => (
                <div key={i} onClick={() => open(c.drawer)} style={{
                  position: "absolute", width: c.r, height: c.r,
                  top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                  borderRadius: "50%", border: `2px solid ${c.color}25`,
                  background: `radial-gradient(circle, ${c.color}04 0%, ${c.color}02 100%)`,
                  cursor: "pointer", transition: "all 0.3s ease",
                  display: "flex", alignItems: "flex-start", justifyContent: "center",
                  paddingTop: i === 0 ? "6%" : i === 1 ? "4%" : i === 2 ? "3%" : "8%",
                }}
                onMouseEnter={e => { e.currentTarget.style.border = `2px solid ${c.color}60`; e.currentTarget.style.background = `radial-gradient(circle, ${c.color}08 0%, ${c.color}04 100%)`; }}
                onMouseLeave={e => { e.currentTarget.style.border = `2px solid ${c.color}25`; e.currentTarget.style.background = `radial-gradient(circle, ${c.color}04 0%, ${c.color}02 100%)`; }}
                >
                  {i < 3 && <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: serif, fontSize: 15, fontWeight: 600, color: c.color }}>{c.label}</div>
                    <div style={{ fontFamily: sans, fontSize: 11, color: C.brownPale }}>{c.sub}</div>
                  </div>}
                  {i === 3 && <div style={{ textAlign: "center", marginTop: "18%" }}>
                    <div style={{ fontFamily: serif, fontSize: 18, fontWeight: 600, color: c.color }}>{c.label}</div>
                    <div style={{ fontFamily: sans, fontSize: 12, color: C.brownPale }}>{c.sub}</div>
                  </div>}
                </div>
              ))}
            </div>
          </div>

          {/* Circle cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { name: "Neighbor", icon: "○", color: C.green, give: "Your presence", get: "Assessments, Time Bank, events, community", cost: "Free — always", drawer: "circle-neighbor" },
              { name: "Keeper", icon: "◇", color: C.teal, give: "Regular time, skills, or resources", get: "Monthly check-ins, priority matching, support circles", cost: "Sliding scale — contribute what you can", drawer: "circle-keeper" },
              { name: "Builder", icon: "◈", color: C.gold, give: "Governance + organizing", get: "Voting rights, ownership credits, beta access", cost: "Time + sliding scale — earn your equity", drawer: "circle-builder" },
              { name: "Founder", icon: "△", color: C.amber, give: "Deep investment + advocacy", get: "Advisory board, 2x equity, priority care", cost: "12-month commitment — build the institution", drawer: "circle-founder" },
            ].map((c, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div onClick={() => open(c.drawer)} style={{
                  background: "#fff", borderRadius: 20, padding: "28px 22px", border: `1px solid ${C.border}`,
                  cursor: "pointer", transition: "transform 0.3s", height: "100%", display: "flex", flexDirection: "column",
                }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: c.color, fontFamily: serif }}>{c.icon}</div>
                    <span style={{ fontFamily: serif, fontSize: 18, fontWeight: 600, color: C.brown }}>{c.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: C.goldDark, background: `${C.gold}08`, padding: "2px 8px", borderRadius: 6 }}>GIVE</span>
                    <span style={{ fontFamily: sans, fontSize: 13, color: C.brownFaint }}>{c.give}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: C.teal, background: `${C.teal}08`, padding: "2px 8px", borderRadius: 6 }}>GET</span>
                    <span style={{ fontFamily: sans, fontSize: 13, color: C.brownFaint }}>{c.get}</span>
                  </div>
                  <p style={{ fontFamily: sans, fontSize: 12, color: c.color, fontWeight: 600, marginTop: "auto" }}>{c.cost}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Density */}
      <section style={{ background: C.brown, padding: "0 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -40, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${C.violet}12 0%, transparent 70%)` }} />
        <div style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 40, alignItems: "center" }}>
            <FadeIn><div>
              <p style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, color: C.violet, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>The density principle</p>
              <h3 style={{ fontFamily: serif, fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 600, color: "#fff", lineHeight: 1.25, marginBottom: 16 }}>When enough neighbors show up, the neighborhood takes care of itself.</h3>
              <p style={{ fontFamily: sans, fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 20 }}>Nobody unlocks anything alone. The community earns infrastructure by growing together. Your dashboard tracks it in real time.</p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <a href="#" onClick={e => { e.preventDefault(); open("village-status"); }} style={{ background: `${C.violet}20`, color: C.violet, textDecoration: "none", padding: "12px 24px", borderRadius: 24, fontSize: 14, fontWeight: 600, fontFamily: sans, border: `1px solid ${C.violet}30` }}>See all 5 thresholds →</a>
                <a href="#" onClick={e => { e.preventDefault(); open("grow-your-coop"); }} style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", padding: "12px 24px", borderRadius: 24, fontSize: 14, fontWeight: 500, fontFamily: sans }}>Grow your own co-op →</a>
              </div>
            </div></FadeIn>
            <FadeIn delay={0.15}><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { n: "10", label: "Seed", desc: "Time Bank activates", color: C.green, w: "20%" },
                { n: "25", label: "Sprout", desc: "Support circles form", color: C.teal, w: "35%" },
                { n: "50", label: "Root", desc: "Care coordinator", color: C.gold, w: "55%" },
                { n: "100", label: "Village", desc: "Full community hub", color: C.amber, w: "75%" },
                { n: "200+", label: "Cooperative", desc: "Own your neighborhood", color: C.violet, w: "100%" },
              ].map((s, i) => (
                <div key={i} onClick={() => open("village-status")} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                  <div style={{ width: 50, flexShrink: 0, textAlign: "right" }}><span style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: s.color }}>{s.n}</span></div>
                  <div style={{ flex: 1, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ width: s.w, height: "100%", borderRadius: 8, background: `linear-gradient(90deg, ${s.color}40, ${s.color})`, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8 }}>
                      <span style={{ fontFamily: sans, fontSize: 9, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.03em" }}>{s.label}</span>
                    </div>
                  </div>
                  <span style={{ fontFamily: sans, fontSize: 11, color: "rgba(255,255,255,0.35)", width: 120, flexShrink: 0 }}>{s.desc}</span>
                </div>
              ))}
            </div></FadeIn>
          </div>
        </div>
      </section>

      {/* Multi-stakeholder + Grow */}
      <section style={{ background: C.sand, padding: "0 24px" }}>
        <div style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
            <FadeIn>
              <div onClick={() => open("multi-stakeholder")} style={{ background: C.warmWhite, borderRadius: 24, padding: "36px 28px", border: `1px solid ${C.border}`, cursor: "pointer", height: "100%", transition: "transform 0.3s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <div style={{ fontSize: 24, color: C.teal, marginBottom: 14, fontFamily: serif }}>◈</div>
                <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: C.brown, marginBottom: 10, lineHeight: 1.25 }}>Everyone has a seat at the table.</h3>
                <p style={{ fontFamily: sans, fontSize: 15, color: C.brownMid, lineHeight: 1.65, marginBottom: 14 }}>Caregivers (40%), families (30%), and community (30%) govern together. Inspired by Quebec solidarity cooperatives. One member, one vote. Nobody's money outweighs anyone's voice.</p>
                <span style={{ fontFamily: sans, fontSize: 14, color: C.teal, fontWeight: 600 }}>How governance works →</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div onClick={() => open("grow-your-coop")} style={{ background: `linear-gradient(135deg, ${C.gold}08, ${C.teal}06)`, borderRadius: 24, padding: "36px 28px", border: `1px solid ${C.border}`, cursor: "pointer", height: "100%", transition: "transform 0.3s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <div style={{ fontSize: 24, color: C.gold, marginBottom: 14, fontFamily: serif }}>♡</div>
                <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: C.brown, marginBottom: 10, lineHeight: 1.25 }}>Your neighborhood can become its own cooperative.</h3>
                <p style={{ fontFamily: sans, fontSize: 15, color: C.brownMid, lineHeight: 1.65, marginBottom: 14 }}>Washington has 5 home care co-ops. Colorado has zero — until now. 200 members and your neighborhood can incorporate. We provide the technology. You provide the community. You keep 95%.</p>
                <span style={{ fontFamily: sans, fontSize: 14, color: C.teal, fontWeight: 600 }}>The 6-step path →</span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: `linear-gradient(168deg, ${C.brown} 0%, #2a2318 100%)`, padding: "70px 24px", textAlign: "center" }}>
        <FadeIn><div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 4px 20px rgba(180,156,120,0.3)" }}><span style={{ fontSize: 24, color: "#fff" }}>♡</span></div></FadeIn>
        <FadeIn delay={0.1}><h2 style={{ fontFamily: serif, fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 600, color: "#fff", lineHeight: 1.25, maxWidth: 550, margin: "0 auto 18px" }}>You don't need to be in crisis to belong. You just need to show up.</h2></FadeIn>
        <FadeIn delay={0.2}><p style={{ fontFamily: sans, fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 460, margin: "0 auto 32px" }}>Join the Neighbor Circle. Take the free CII assessment. See who else is nearby. The care you need tomorrow starts with the community you build today.</p></FadeIn>
        <FadeIn delay={0.3}>
          <a href="#" onClick={e => { e.preventDefault(); open("circle-neighbor"); }} style={{ display: "inline-block", background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`, color: "#fff", padding: "18px 48px", borderRadius: 40, fontSize: 17, fontWeight: 600, fontFamily: sans, textDecoration: "none", boxShadow: "0 4px 24px rgba(13,115,119,0.3)" }}>Join the co-op — free</a>
        </FadeIn>
        <FadeIn delay={0.35}><p style={{ fontFamily: sans, fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 16 }}>300+ Villages. 26 home care cooperatives. 72 CoopCycle chapters. The model works. Your turn.</p></FadeIn>
      </section>

      {/* Footer */}
      <footer style={{ background: "#1a1610", padding: "40px 24px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 11 }}>♡</span></div>
            <span style={{ fontFamily: serif, fontWeight: 600, fontSize: 16, color: C.goldLight }}>co-op.care</span>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {[["Neighbor", "circle-neighbor"], ["Keeper", "circle-keeper"], ["Builder", "circle-builder"], ["Founder", "circle-founder"], ["Village", "village-status"], ["Governance", "multi-stakeholder"]].map(([l, t]) => (
              <a key={l} href="#" onClick={e => { e.preventDefault(); open(t); }} style={{ fontFamily: sans, fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
          <p style={{ fontFamily: sans, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>© 2026 co-op.care · Boulder, CO · Worker-owned · Neighbor-powered</p>
        </div>
      </footer>

      {activeDrawer && <Drawer drawerId={activeDrawer} onClose={close} />}
    </div>
  );
}
