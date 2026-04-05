import { useState, useEffect } from "react";

const T = {
  teal: "#0D7377", tealDark: "#064E50", tealDeep: "#032B2D",
  gold: "#C9A84C", goldLight: "#E8D99A",
  cream: "#FAF7F2", warm: "#F5F0E8",
  fg: "#1A1A2E", mid: "#5A5A6E", muted: "#8A8A9E",
  white: "#FFFFFF", border: "#E8E4DD",
  green: "#16A34A", red: "#DC2626", amber: "#D97706",
};

const fonts = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');`;

function Shell({ children, bg, style }) {
  return <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "56px 72px", background: bg || T.cream, position: "relative", overflow: "hidden", ...style }}>{children}</div>;
}
function Tag({ children, color, bg }) {
  return <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, fontSize: 10, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", color: color || T.gold, background: bg || "rgba(201,168,76,0.12)", fontFamily: "'DM Sans', sans-serif" }}>{children}</span>;
}
function H({ children, size, color, style }) {
  return <h2 style={{ fontSize: size || 46, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: color || T.fg, margin: 0, lineHeight: 1.15, ...style }}>{children}</h2>;
}
function P({ children, style }) {
  return <p style={{ fontSize: 16, color: T.mid, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.75, margin: 0, maxWidth: 640, ...style }}>{children}</p>;
}
function Card({ children, style }) {
  return <div style={{ padding: 28, borderRadius: 18, background: T.white, border: `1px solid ${T.border}`, ...style }}>{children}</div>;
}

function S01() {
  return <Shell bg={`linear-gradient(155deg, ${T.tealDeep} 0%, ${T.teal} 45%, ${T.tealDark} 100%)`}>
    <div style={{ position: "absolute", inset: 0, opacity: 0.04, background: "repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,.4) 40px, rgba(255,255,255,.4) 41px)" }} />
    <div style={{ textAlign: "center", position: "relative", zIndex: 1, maxWidth: 880 }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: T.goldLight, fontFamily: "'DM Sans', sans-serif", marginBottom: 48 }}>FEBRUARY 2026 · BOULDER, COLORADO</div>
      <h1 style={{ fontSize: 92, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: T.white, margin: 0, lineHeight: .95, letterSpacing: -2 }}>co-op.care</h1>
      <div style={{ width: 72, height: 3, background: T.gold, margin: "32px auto", borderRadius: 2 }} />
      <p style={{ fontSize: 24, fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: T.goldLight, margin: 0, lineHeight: 1.5 }}>The logic of the neighborhood.</p>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", marginTop: 28, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8, maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
        Community infrastructure for aging in place — with dignity and grace.<br />
        Time banking · Caregiver matching · Family dashboards · Worker ownership<br />
        Clinical intelligence · Hospital integration · Cooperative economics
      </p>
    </div>
  </Shell>;
}

function S02() {
  return <Shell>
    <div style={{ maxWidth: 960, width: "100%" }}>
      <Tag>THE HUMAN CRISIS</Tag>
      <H style={{ margin: "18px 0 10px" }}>Nobody should lose their home,<br/>their savings, or their dignity<br/>because they got old.</H>
      <P style={{ marginBottom: 40 }}>53 million Americans are unpaid family caregivers. The daughter who moved back home. The teacher who misses work. The neighbor who checks in every morning. They hold the system together — and nobody holds them.</P>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
        {[
          { emoji: "💔", stat: "$9,900/mo", label: "Average facility cost", sub: "Most families can't afford it" },
          { emoji: "😞", stat: "77%", label: "Caregiver turnover", sub: "Because they earn $15/hr" },
          { emoji: "🏥", stat: "$2,500/day", label: "Blocked bed cost", sub: "Patient can't go home safely" },
          { emoji: "😰", stat: "53M", label: "Unpaid family caregivers", sub: "Burning out in silence" },
        ].map(c => <Card key={c.stat} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>{c.emoji}</div>
          <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: T.teal }}>{c.stat}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.fg, marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>{c.label}</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>{c.sub}</div>
        </Card>)}
      </div>
      <div style={{ marginTop: 28, padding: "20px 28px", borderRadius: 14, background: "rgba(220,38,38,.04)", border: "1px solid rgba(220,38,38,.1)" }}>
        <p style={{ fontSize: 15, fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: T.fg, margin: 0, lineHeight: 1.7 }}>
          "My mom needs help every day. I can't afford an agency. I can't quit my job. I'm drowning."
          <span style={{ color: T.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontStyle: "normal" }}> — Every Alpha Daughter, everywhere</span>
        </p>
      </div>
    </div>
  </Shell>;
}

function S03() {
  return <Shell bg={`linear-gradient(155deg, ${T.tealDeep}, ${T.tealDark})`}>
    <div style={{ maxWidth: 820, textAlign: "center", position: "relative", zIndex: 1 }}>
      <Tag color={T.goldLight} bg="rgba(201,168,76,.15)">THE VISION</Tag>
      <H size={52} color={T.white} style={{ marginTop: 20 }}>What if your neighborhood<br/>could take care of its own?</H>
      <div style={{ width: 60, height: 2, background: T.gold, margin: "32px auto", borderRadius: 2 }} />
      <p style={{ fontSize: 19, fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,.7)", lineHeight: 1.85, maxWidth: 680, margin: "0 auto" }}>
        A neighbor drives your mom to the doctor and earns a time credit. A professional caregiver — who <em>owns</em> the company she works for — helps with morning medications and logs a note that automatically generates clinical documentation. Your family dashboard shows you everything: health trends, schedule, care log, and the knowledge that 88% of every dollar goes directly to the person doing the work.
      </p>
      <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 44 }}>
        {[
          { icon: "🏠", role: "Families", desc: "Find care. See everything. Stay connected." },
          { icon: "👥", role: "Worker-Owners", desc: "Real wages. Equity. A career, not a gig." },
          { icon: "💚", role: "Neighbors", desc: "Give an hour. Earn a credit. Build community." },
        ].map(r => <div key={r.role} style={{ flex: 1, padding: 24, borderRadius: 16, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>{r.icon}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.white, fontFamily: "'DM Sans', sans-serif" }}>{r.role}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", fontFamily: "'DM Sans', sans-serif", marginTop: 6, lineHeight: 1.6 }}>{r.desc}</div>
        </div>)}
      </div>
    </div>
  </Shell>;
}

function S04() {
  return <Shell>
    <div style={{ maxWidth: 960, width: "100%" }}>
      <Tag>THE TIME BANK</Tag>
      <H style={{ margin: "18px 0 10px" }}>Every hour given is an hour earned.</H>
      <P style={{ marginBottom: 36 }}>The Time Bank is where community starts. No money changes hands. A neighbor drives your mom to the pharmacy and earns one credit. She uses that credit next month when she needs help. This is the on-ramp — anyone can participate, and it builds the care infrastructure organically.</P>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.teal, textTransform: "uppercase", marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>AVAILABLE REQUESTS NEARBY</div>
          {[
            { task: "Grocery Shopping", who: "The Chen Family", dist: "0.2 mi", time: "~1 hr", credit: "+1" },
            { task: "Companionship Visit", who: "Eleanor Rodriguez", dist: "0.8 mi", time: "~2 hrs", credit: "+2" },
            { task: "Ride to Appointment", who: "James Thompson", dist: "1.1 mi", time: "~1 hr", credit: "+1" },
            { task: "Light Yardwork", who: "The Park Family", dist: "0.4 mi", time: "~2 hrs", credit: "+2" },
          ].map((r, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < 3 ? `1px solid ${T.border}` : "none" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.fg, fontFamily: "'DM Sans', sans-serif" }}>{r.task}</div>
              <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{r.who} · {r.dist} · {r.time}</div>
            </div>
            <div style={{ padding: "6px 14px", borderRadius: 100, background: "rgba(13,115,119,.08)", color: T.teal, fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{r.credit}</div>
          </div>)}
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ background: `linear-gradient(135deg, ${T.teal}, ${T.tealDark})`, border: "none", textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.goldLight, textTransform: "uppercase", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>YOUR BALANCE</div>
            <div style={{ fontSize: 72, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: T.white, lineHeight: 1 }}>12</div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,.7)", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>Time Credits Available</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", fontFamily: "'DM Sans', sans-serif", marginTop: 12 }}>1 hour of help = 1 credit earned<br/>Every hour is valued equally</div>
          </Card>
          <Card style={{ background: T.warm }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.fg, fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>Why this matters</div>
            <div style={{ fontSize: 13, color: T.mid, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
              If 30% of low-acuity needs are met through neighbor exchanges, that saves <strong>$7,488 per member annually</strong> in professional care hours. The Time Bank isn't charity — it's community infrastructure that makes the whole cooperative viable.
            </div>
          </Card>
        </div>
      </div>
    </div>
  </Shell>;
}

function S05() {
  return <Shell bg={T.white}>
    <div style={{ maxWidth: 960, width: "100%" }}>
      <Tag>FOR FAMILIES</Tag>
      <H style={{ margin: "18px 0 10px" }}>The Alpha Daughter finally<br/>gets a command center.</H>
      <P style={{ marginBottom: 36 }}>She's the one who coordinates everything — usually from another city, usually alone. co-op.care gives her a real-time dashboard showing care status, health trends, schedule, and caregiver communication. She's not alone anymore.</P>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.teal, textTransform: "uppercase", marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>FAMILY DASHBOARD</div>
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: 16, background: `linear-gradient(135deg, ${T.teal}, ${T.tealDark})`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: T.white, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>72</div>
              <div style={{ fontSize: 8, color: T.goldLight, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>CRI SCORE</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: T.fg, fontFamily: "'Playfair Display', serif" }}>Mom is doing well today</div>
              <div style={{ fontSize: 12, color: T.green, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>↑ Improving · CRI up 4 points this month</div>
              <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>Sarah Jenkins is with her now · Next: Meds at 2 PM</div>
            </div>
          </div>
          {[
            { time: "9:15 AM", event: "Morning Meds Administered", status: "Success", color: T.green },
            { time: "12:30 PM", event: "Lunch: Grilled Salmon & Greens", status: "Completed", color: T.green },
            { time: "2:00 PM", event: "Blood Pressure: 125/82", status: "Normal", color: T.teal },
          ].map((e, i) => <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderTop: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans', sans-serif", width: 60, flexShrink: 0 }}>{e.time}</div>
            <div style={{ fontSize: 13, color: T.fg, fontFamily: "'DM Sans', sans-serif", flex: 1 }}>{e.event}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: e.color, fontFamily: "'DM Sans', sans-serif" }}>{e.status}</div>
          </div>)}
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { n: "12", label: "Time Bank Credits", icon: "💚" },
              { n: "12", label: "Care Hours This Week", icon: "⏰" },
              { n: "$550", label: "Monthly Cost", icon: "💰" },
              { n: "4.9★", label: "Caregiver Rating", icon: "⭐" },
            ].map(s => <div key={s.label} style={{ padding: "12px", borderRadius: 10, background: T.cream, textAlign: "center" }}>
              <div style={{ fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: T.teal }}>{s.n}</div>
              <div style={{ fontSize: 10, color: T.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{s.label}</div>
            </div>)}
          </Card>
          <Card style={{ background: T.warm }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.fg, fontFamily: "'DM Sans', sans-serif", marginBottom: 6 }}>How are YOU doing? 💛</div>
            <div style={{ fontSize: 12, color: T.mid, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>Caregiving is a journey. The Caregiver Intensity Index checks in on YOUR wellbeing — and if you're burning out, the system activates automatically.</div>
          </Card>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.fg, fontFamily: "'DM Sans', sans-serif", marginBottom: 6 }}>Care Readiness Assessment</div>
            <div style={{ fontSize: 12, color: T.mid, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>14 factors — Mobility, Cognition, Medication, Nutrition, Home Safety, Fall Risk, Social Isolation, Pain, Sleep, Hygiene, Communication, Emotional State, Financial Stress, Caregiver Burnout. Simple sliders, clinical precision underneath.</div>
          </Card>
        </div>
      </div>
    </div>
  </Shell>;
}

function S06() {
  return <Shell>
    <div style={{ maxWidth: 960, width: "100%" }}>
      <Tag>FOR CAREGIVERS</Tag>
      <H style={{ margin: "18px 0 10px" }}>A real career. Real ownership.<br/>Not a gig.</H>
      <P style={{ marginBottom: 36 }}>Every caregiver on co-op.care is a W-2 worker-owner. They earn $25-28/hour. They build equity that vests over 500 hours. They have health benefits, a voice in governance, and a career path. That's why turnover is under 15% instead of 77%.</P>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card style={{ background: `linear-gradient(155deg, ${T.tealDeep}, ${T.tealDark})`, border: "none" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.goldLight, textTransform: "uppercase", marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>WORKER-OWNER DASHBOARD</div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${T.gold}, #A88A3A)`, display: "flex", alignItems: "center", justifyContent: "center", color: T.white, fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>SJ</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: T.white, fontFamily: "'Playfair Display', serif" }}>Sarah Jenkins</div>
              <div style={{ fontSize: 12, color: T.goldLight, fontFamily: "'DM Sans', sans-serif" }}>Worker-Owner since Jan 2023 · 4.9★</div>
            </div>
          </div>
          <div style={{ padding: 20, borderRadius: 14, background: "rgba(255,255,255,.06)", marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>YOUR EQUITY</div>
            <div style={{ fontSize: 40, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: T.goldLight, lineHeight: 1 }}>$12,450</div>
            <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,.1)", marginTop: 12 }}>
              <div style={{ height: 8, borderRadius: 4, width: "64%", background: `linear-gradient(90deg, ${T.gold}, ${T.goldLight})` }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontFamily: "'DM Sans', sans-serif" }}>320 / 500 hours</span>
              <span style={{ fontSize: 11, color: T.goldLight, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>64% Vested</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, fontStyle: "italic" }}>
            "I used to work for an agency making $14/hour with no benefits. Now I earn $27, I'm building real wealth, and I have a vote in how the company runs."
          </div>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { n: "$26.40", label: "Average hourly wage", vs: "vs. $15.27 industry" },
              { n: "$52K", label: "5-year equity target", vs: "500-hour vesting" },
              { n: "<15%", label: "Annual turnover", vs: "vs. 77% industry" },
              { n: "88%", label: "Revenue to workers", vs: "vs. 40-60% agencies" },
            ].map(s => <Card key={s.label} style={{ textAlign: "center", padding: 18 }}>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: T.teal }}>{s.n}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.fg, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: T.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{s.vs}</div>
            </Card>)}
          </div>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.fg, fontFamily: "'DM Sans', sans-serif", marginBottom: 10 }}>The caregiver's daily tools</div>
            {["Check in with EVV (Electronic Visit Verification) — one tap", "View care plan, meds, dietary needs, emergency info", "Log visit notes by voice or text — AI handles clinical coding", "Track vitals — BP, weight, temperature, pain scale", "See equity growing with every shift worked", "Vote on cooperative policies and governance decisions"].map((t, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <span style={{ color: T.teal, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>✓</span>
              <span style={{ fontSize: 13, color: T.mid, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{t}</span>
            </div>)}
          </Card>
        </div>
      </div>
    </div>
  </Shell>;
}

function S07() {
  return <Shell bg={T.white}>
    <div style={{ maxWidth: 960, width: "100%" }}>
      <Tag>FINDING CARE</Tag>
      <H style={{ margin: "18px 0 10px" }}>Find your caregiver.<br/>Book in four steps.</H>
      <P style={{ marginBottom: 36 }}>The matching engine scores caregivers across skills, proximity, availability, personality, and clinical acuity. Every caregiver has a profile showing their story, equity, and reviews. You choose. You book. You meet.</P>
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.teal, textTransform: "uppercase", marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>TOP MATCHES FOR YOUR FAMILY</div>
          {[
            { name: "Sarah Jenkins", title: "Personal Care Specialist", match: 94, rate: "$27/hr", dist: "0.6 mi", rating: "4.9★", equity: "$12,450" },
            { name: "Rosa Garcia", title: "Skilled Care & Rehab", match: 91, rate: "$30/hr", dist: "2.1 mi", rating: "5.0★", equity: "$28,900" },
            { name: "Marcus Brown", title: "Companion & Wellness", match: 88, rate: "$28/hr", dist: "1.2 mi", rating: "4.8★", equity: "$31,200" },
          ].map((c, i) => <div key={i} style={{ display: "flex", gap: 14, padding: "16px 0", borderBottom: i < 2 ? `1px solid ${T.border}` : "none" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${T.teal}, ${T.tealDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: T.white, fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>{c.name.split(" ").map(w=>w[0]).join("")}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "'Playfair Display', serif", color: T.fg }}>{c.name}</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: T.teal, fontFamily: "'Playfair Display', serif" }}>{c.match}%</span>
              </div>
              <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{c.title} · {c.rating} · {c.dist} · {c.rate}</div>
              <div style={{ fontSize: 11, color: T.teal, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>💚 Worker-Owner · {c.equity} equity</div>
            </div>
          </div>)}
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ background: T.cream }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.fg, fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }}>4-Step Booking</div>
            {[
              { step: "1", label: "Choose Plan", desc: "Companion $550 · Standard $1,800 · Full $3,500" },
              { step: "2", label: "Schedule Meet & Greet", desc: "Pick a day and time that works" },
              { step: "3", label: "Care Needs", desc: "Select from 12 common needs + notes" },
              { step: "4", label: "Confirm & Pay", desc: "HSA · Private · Medicaid accepted" },
            ].map(s => <div key={s.step} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${T.teal}, ${T.tealDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: T.white, fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>{s.step}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.fg, fontFamily: "'DM Sans', sans-serif" }}>{s.label}</div>
                <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{s.desc}</div>
              </div>
            </div>)}
          </Card>
          <div style={{ padding: "18px 20px", borderRadius: 14, background: "rgba(22,163,74,.06)", border: "1px solid rgba(22,163,74,.12)", textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.green, fontFamily: "'DM Sans', sans-serif" }}>Save $76,800 - $112,200/year</div>
            <div style={{ fontSize: 12, color: T.mid, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>keeping your parent home vs. a facility</div>
          </div>
        </div>
      </div>
    </div>
  </Shell>;
}

function S08() {
  return <Shell>
    <div style={{ maxWidth: 960, width: "100%" }}>
      <Tag>NOBODY FALLS THROUGH THE CRACKS</Tag>
      <H style={{ margin: "18px 0 10px" }}>When burnout hits,<br/>the system activates.</H>
      <P style={{ marginBottom: 36 }}>The Caregiver Intensity Index monitors Load, Emotional Impact, and Support Systems. When someone enters the Red Zone, co-op.care doesn't just alert — it acts.</P>
      <div style={{ display: "flex", gap: 0, borderRadius: 20, overflow: "hidden", border: `1px solid ${T.border}` }}>
        {[
          { zone: "GREEN", range: "0-40", label: "Manageable", color: T.green, bg: "rgba(22,163,74,.04)", desc: "Self-care tips, community prompts, Time Bank suggestions" },
          { zone: "YELLOW", range: "41-65", label: "Elevated", color: T.amber, bg: "rgba(217,119,6,.04)", desc: "Care plan adjustment, respite scheduling, neighbor check-in" },
          { zone: "RED", range: "66-100", label: "Critical", color: T.red, bg: "rgba(220,38,38,.04)", desc: "Automated cascade: Time Bank → Professional → Coordinator" },
        ].map((z, i) => <div key={z.zone} style={{ flex: 1, padding: "24px 20px", background: z.bg, borderRight: i < 2 ? `1px solid ${T.border}` : "none", textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: z.color, fontFamily: "'DM Sans', sans-serif" }}>{z.zone} ZONE</div>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: z.color, marginTop: 6 }}>{z.range}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.fg, fontFamily: "'DM Sans', sans-serif", marginTop: 6 }}>{z.label}</div>
          <div style={{ fontSize: 12, color: T.mid, fontFamily: "'DM Sans', sans-serif", marginTop: 8, lineHeight: 1.6 }}>{z.desc}</div>
        </div>)}
      </div>
      <Card style={{ marginTop: 20, background: "rgba(220,38,38,.03)", border: "1px solid rgba(220,38,38,.1)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.red, fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }}>⚡ RED ZONE AUTOMATED CASCADE</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 1fr 32px 1fr 32px 1fr", alignItems: "center" }}>
          {[
            { step: "1", action: "Query Time Bank", desc: "Neighbors within 2 mi", time: "Instant" },
            null,
            { step: "2", action: "Dispatch Respite", desc: "Auto-request neighbor help", time: "< 15 min" },
            null,
            { step: "3", action: "Schedule Pro", desc: "Escalate to W-2 caregiver", time: "< 4 hrs" },
            null,
            { step: "4", action: "Coordinator", desc: "Follow-up + care plan revision", time: "< 24 hrs" },
          ].map((s, i) => s ? <div key={i} style={{ textAlign: "center", padding: "8px" }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: T.red, color: T.white, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>{s.step}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.fg, fontFamily: "'DM Sans', sans-serif", marginTop: 6 }}>{s.action}</div>
            <div style={{ fontSize: 10, color: T.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 3, lineHeight: 1.4 }}>{s.desc}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.red, fontFamily: "'DM Sans', sans-serif", marginTop: 3 }}>{s.time}</div>
          </div> : <div key={i} style={{ textAlign: "center", color: T.muted, fontSize: 16 }}>→</div>)}
        </div>
      </Card>
    </div>
  </Shell>;
}

function S09() {
  return <Shell bg={`linear-gradient(155deg, ${T.tealDeep}, ${T.tealDark})`}>
    <div style={{ maxWidth: 960, width: "100%" }}>
      <Tag color={T.goldLight} bg="rgba(201,168,76,.15)">THE INVISIBLE ENGINE</Tag>
      <H size={44} color={T.white} style={{ marginTop: 18 }}>The caregiver writes a note.<br/>The AI does <span style={{ color: T.goldLight }}>everything else.</span></H>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,.55)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.75, maxWidth: 640, marginTop: 12, marginBottom: 32 }}>Built on the Omaha System — a public-domain clinical taxonomy validated since 1975. The AI translation layer is proprietary. The caregiver never sees any of it.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 50px 1fr", alignItems: "stretch" }}>
        <div style={{ padding: 24, borderRadius: "18px 0 0 18px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", borderRight: "none" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,.4)", fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }}>CAREGIVER TYPES THIS</div>
          <div style={{ fontSize: 15, fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "rgba(255,255,255,.85)", lineHeight: 1.7, padding: 16, borderRadius: 12, background: "rgba(255,255,255,.04)" }}>
            "Helped Eleanor with morning wash. She resisted at first but was OK after encouragement. Took blood pressure: 128/84. She asked about her daughter three times."
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 10, fontFamily: "'DM Sans', sans-serif" }}>45 seconds. Voice or text.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(180deg, ${T.gold}, #A88A3A)`, color: T.white, fontSize: 18, fontWeight: 700 }}>AI</div>
        <div style={{ padding: 24, borderRadius: "0 18px 18px 0", background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.12)", borderLeft: "none" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: T.goldLight, fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }}>SYSTEM GENERATES 5 RECORDS</div>
          {[
            { icon: "🏥", label: "FHIR R4 clinical observation", desc: "Epic-interoperable" },
            { icon: "📋", label: "Omaha-coded problem classification", desc: "42 problems, 4 domains" },
            { icon: "✅", label: "EVV-compliant visit record", desc: "Medicaid billing ready" },
            { icon: "📊", label: "CMS quality measure data", desc: "ACCESS Model reporting" },
            { icon: "💛", label: "Family dashboard update", desc: "Plain language summary" },
          ].map((r, i) => <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 14 }}>{r.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.goldLight, fontFamily: "'DM Sans', sans-serif" }}>{r.label}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", fontFamily: "'DM Sans', sans-serif" }}>{r.desc}</div>
            </div>
          </div>)}
        </div>
      </div>
    </div>
  </Shell>;
}

function S10() {
  return <Shell bg={T.white}>
    <div style={{ maxWidth: 960, width: "100%" }}>
      <Tag>WHO PAYS</Tag>
      <H style={{ margin: "18px 0 10px" }}>Six revenue streams. Not just families.</H>
      <P style={{ marginBottom: 36 }}>co-op.care connects cooperatives to revenue streams they can't access alone. The cooperative does the care. We handle the integration.</P>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {[
          { payer: "🏥 Hospitals", amount: "$75K/mo", desc: "Discharge coordination retainer. Prevents $2,500/day blocked beds.", tag: "RETAINER" },
          { payer: "🏫 Employers", amount: "$2.6-$6.2K/yr", desc: "Self-insured school districts fund via HSA. Teachers 2x more likely to be caregivers.", tag: "HSA" },
          { payer: "🏛️ CMS/Medicaid", amount: "$85/pt/mo", desc: "PIN + CHI billing codes. ACCESS Model 20% uplift. Omaha System outcomes.", tag: "FEDERAL" },
          { payer: "🏠 Families", amount: "$550-$3,500/mo", desc: "Transparent tiers. vs. $9,900/mo facility. Private pay, HSA, or Medicaid.", tag: "PRIVATE" },
          { payer: "🦴 Specialists", amount: "$85/pt/mo", desc: "ASM compliance: Joint Coach, HRSN screening, CCA docs. $0 upfront pilot.", tag: "COMPLIANCE" },
          { payer: "💚 Community", amount: "$0", desc: "Time Bank creates value with zero dollars. Neighbors helping neighbors. The free tier.", tag: "TIME BANK" },
        ].map(p => <Card key={p.payer} style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Playfair Display', serif", color: T.fg }}>{p.payer}</span>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, color: T.teal, fontFamily: "'DM Sans', sans-serif", padding: "2px 8px", background: "rgba(13,115,119,.06)", borderRadius: 100 }}>{p.tag}</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: T.teal, marginBottom: 6 }}>{p.amount}</div>
          <div style={{ fontSize: 12, color: T.mid, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>{p.desc}</div>
        </Card>)}
      </div>
    </div>
  </Shell>;
}

function S11() {
  return <Shell>
    <div style={{ maxWidth: 960, width: "100%" }}>
      <Tag>THE COOPERATIVE ADVANTAGE</Tag>
      <H style={{ margin: "18px 0 10px" }}>Zero extraction to Wall Street.</H>
      <P style={{ marginBottom: 36 }}>Worker ownership isn't just moral — it's a business advantage. Lower turnover means better continuity. Better continuity means better outcomes. Better outcomes mean hospital contracts. The cycle starts with paying people what they're worth.</P>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.red, textTransform: "uppercase", marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>TRADITIONAL AGENCY</div>
          <div style={{ background: `linear-gradient(90deg, ${T.red} 40%, ${T.border} 40%)`, height: 28, borderRadius: 8, marginBottom: 8 }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "'DM Sans', sans-serif", marginBottom: 16 }}>
            <span style={{ color: T.red, fontWeight: 600 }}>40-60% extracted</span>
            <span style={{ color: T.muted }}>Caregiver: $13-17/hr</span>
          </div>
          <div style={{ fontSize: 13, color: T.mid, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>No equity. No benefits. No voice. 77% quit every year.</div>
        </Card>
        <Card style={{ background: `linear-gradient(155deg, ${T.tealDeep}, ${T.tealDark})`, border: "none" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.goldLight, textTransform: "uppercase", marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>CO-OP.CARE COOPERATIVE</div>
          <div style={{ background: `linear-gradient(90deg, ${T.gold} 88%, rgba(255,255,255,.1) 88%)`, height: 28, borderRadius: 8, marginBottom: 8 }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "'DM Sans', sans-serif", marginBottom: 16 }}>
            <span style={{ color: T.goldLight, fontWeight: 600 }}>88% to worker-owners</span>
            <span style={{ color: "rgba(255,255,255,.5)" }}>$25-28/hr + equity</span>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>$52K equity over 5 years. Benefits. Governance vote. Under 15% turnover.</div>
        </Card>
      </div>
    </div>
  </Shell>;
}

function S12() {
  return <Shell bg={`linear-gradient(155deg, ${T.tealDeep}, ${T.tealDark})`}>
    <div style={{ maxWidth: 900, width: "100%", textAlign: "center" }}>
      <Tag color={T.goldLight} bg="rgba(201,168,76,.15)">SCALE</Tag>
      <H size={44} color={T.white} style={{ marginTop: 18 }}>National brain. Local hands.</H>
      <p style={{ fontSize: 16, color: "rgba(255,255,255,.6)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8, maxWidth: 660, margin: "12px auto 36px" }}>
        We don't run cooperatives. We build the operating system that makes them into healthcare delivery organizations. Every cooperative that launches on our platform is a recurring revenue customer.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        {[
          { n: "900+", label: "Home Care Cooperatives", sub: "Each a potential SaaS customer" },
          { n: "6,100+", label: "US Hospitals", sub: "Every discharge planner is a buyer" },
          { n: "13,000+", label: "School Districts", sub: "Self-insured with caregiving employees" },
        ].map(m => <div key={m.label} style={{ padding: 24, borderRadius: 16, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", textAlign: "center" }}>
          <div style={{ fontSize: 40, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: T.gold, lineHeight: 1 }}>{m.n}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.white, marginTop: 8, fontFamily: "'DM Sans', sans-serif" }}>{m.label}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>{m.sub}</div>
        </div>)}
      </div>
      <div style={{ padding: "20px 28px", borderRadius: 16, background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.15)", textAlign: "left" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.goldLight, fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>RMEOC is already building this</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.55)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
          Rocky Mountain Employee Ownership Center is incubating a statewide Colorado Care Cooperative across five regions. co-op.care is the technology partner. Each branch runs on our platform.
        </div>
      </div>
    </div>
  </Shell>;
}

function S13() {
  return <Shell>
    <div style={{ maxWidth: 960, width: "100%" }}>
      <Tag>ALREADY IN MOTION</Tag>
      <H style={{ margin: "18px 0 32px" }}>Partnerships and pipeline.</H>
      {[
        { name: "Boulder Community Health", status: "CONFIRMED", detail: "VP Grant Besser bringing Case Management + Foundation. Target: $75K/mo.", color: T.green },
        { name: "RMEOC / Colorado Care Cooperative", status: "TECHNOLOGY PARTNER", detail: "Statewide cooperative incubation. 5 regions. co-op.care is the platform.", color: T.green },
        { name: "Boulder Valley School District", status: "TARGET", detail: "1,000 teacher families. Self-insured. HSA eligible. Replicable nationally.", color: T.amber },
        { name: "CMS ACCESS Model", status: "APRIL 2026", detail: "20% per-client Medicare uplift. Omaha System outcomes.", color: T.teal },
        { name: "ASM Orthopedic Compliance", status: "JAN 2027", detail: "38 Boulder providers mandatory. Joint Coach + HRSN. $0 upfront.", color: T.teal },
      ].map((p, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "6px 1fr", borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, background: T.white, marginBottom: 10 }}>
        <div style={{ background: p.color }} />
        <div style={{ padding: "14px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
            <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "'Playfair Display', serif", color: T.fg }}>{p.name}</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: p.color, fontFamily: "'DM Sans', sans-serif", padding: "2px 10px", background: `${p.color}11`, borderRadius: 100 }}>{p.status}</span>
          </div>
          <div style={{ fontSize: 13, color: T.mid, fontFamily: "'DM Sans', sans-serif" }}>{p.detail}</div>
        </div>
      </div>)}
    </div>
  </Shell>;
}

function S14() {
  return <Shell bg={T.white}>
    <div style={{ maxWidth: 860, width: "100%", textAlign: "center" }}>
      <Tag>TEAM</Tag>
      <H style={{ margin: "18px 0 32px" }}>Healthcare technology meets<br/>cooperative economics.</H>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, textAlign: "left" }}>
        <Card>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${T.teal}, ${T.tealDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: T.white, fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif", marginBottom: 16 }}>BW</div>
          <div style={{ fontSize: 20, fontWeight: 600, fontFamily: "'Playfair Display', serif", color: T.fg }}>Blaine Warkentine</div>
          <div style={{ fontSize: 13, color: T.teal, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }}>Founder & CEO</div>
          <div style={{ fontSize: 13, color: T.mid, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8 }}>Built BrainLAB's orthopedic vertical. Multiple healthcare M&A exits. Deep FHIR, hospital IT, CMS regulatory expertise.</div>
        </Card>
        <Card style={{ border: `2px dashed ${T.border}` }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: T.warm, display: "flex", alignItems: "center", justifyContent: "center", color: T.muted, fontSize: 20, fontFamily: "'Playfair Display', serif", marginBottom: 16 }}>?</div>
          <div style={{ fontSize: 20, fontWeight: 600, fontFamily: "'Playfair Display', serif", color: T.fg }}>Technical Co-Founder</div>
          <div style={{ fontSize: 13, color: T.amber, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }}>ACTIVELY RECRUITING</div>
          <div style={{ fontSize: 13, color: T.mid, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8 }}>Next.js + Firebase. AI/NLP for clinical intelligence. FHIR R4. Co-founder equity in co-op.care Technologies LLC.</div>
        </Card>
      </div>
    </div>
  </Shell>;
}

function S15() {
  return <Shell bg={`linear-gradient(155deg, ${T.tealDeep} 0%, ${T.teal} 50%, ${T.tealDark} 100%)`}>
    <div style={{ position: "absolute", inset: 0, opacity: 0.04, background: "repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,.4) 40px, rgba(255,255,255,.4) 41px)" }} />
    <div style={{ maxWidth: 800, textAlign: "center", position: "relative", zIndex: 1 }}>
      <H size={52} color={T.white}>Care is the last<br/>human economy.</H>
      <div style={{ width: 60, height: 2, background: T.gold, margin: "28px auto", borderRadius: 2 }} />
      <p style={{ fontSize: 19, fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: T.goldLight, lineHeight: 1.7, margin: "0 auto", maxWidth: 580 }}>
        We're not disrupting an industry.<br/>
        We're returning it to the people who do the work —<br/>
        and the neighborhoods where it happens.
      </p>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,.45)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8, marginTop: 28, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
        Time banking. Caregiver matching. Family dashboards. Burnout detection.<br/>
        Worker ownership. Clinical intelligence. Hospital integration.<br/>
        Community infrastructure for aging in place — with dignity and grace.
      </p>
      <div style={{ marginTop: 44 }}>
        <div style={{ fontSize: 44, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: T.white }}>co-op.care</div>
        <div style={{ fontSize: 17, fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: T.goldLight, marginTop: 4 }}>The logic of the neighborhood.</div>
      </div>
      <div style={{ marginTop: 40, display: "flex", gap: 32, justifyContent: "center" }}>
        {["blaine@co-op.care", "co-op.care", "Boulder, Colorado"].map(t => <span key={t} style={{ fontSize: 13, color: "rgba(255,255,255,.4)", fontFamily: "'DM Sans', sans-serif" }}>{t}</span>)}
      </div>
    </div>
  </Shell>;
}

const slides = [
  { c: S01, l: "Title" }, { c: S02, l: "Crisis" }, { c: S03, l: "Vision" },
  { c: S04, l: "Time Bank" }, { c: S05, l: "Families" }, { c: S06, l: "Caregivers" },
  { c: S07, l: "Matching" }, { c: S08, l: "Burnout" }, { c: S09, l: "AI Engine" },
  { c: S10, l: "Revenue" }, { c: S11, l: "Economics" }, { c: S12, l: "Scale" },
  { c: S13, l: "Traction" }, { c: S14, l: "Team" }, { c: S15, l: "Close" },
];

export default function Deck() {
  const [cur, setCur] = useState(0);
  const [mode, setMode] = useState("scroll");
  useEffect(() => {
    if (mode !== "slide") return;
    const h = (e) => {
      if (["ArrowRight","ArrowDown"," "].includes(e.key)) { e.preventDefault(); setCur(c => Math.min(c+1, slides.length-1)); }
      if (["ArrowLeft","ArrowUp"].includes(e.key)) { e.preventDefault(); setCur(c => Math.max(c-1, 0)); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [mode]);

  return <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
    <style>{fonts}</style>
    <div style={{ position: "fixed", top: 14, right: 14, zIndex: 1000, display: "flex", gap: 8 }}>
      <button onClick={() => setMode(m => m === "scroll" ? "slide" : "scroll")} style={{ padding: "7px 14px", borderRadius: 100, border: `1px solid ${T.border}`, background: T.white, color: T.fg, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 8px rgba(0,0,0,.1)" }}>
        {mode === "scroll" ? "▶ Present" : "≡ Scroll"}
      </button>
      {mode === "slide" && <span style={{ fontSize: 11, color: T.white, background: "rgba(0,0,0,.5)", padding: "5px 12px", borderRadius: 100, fontWeight: 600 }}>{cur+1}/{slides.length}</span>}
    </div>
    {mode === "slide" && <div style={{ position: "fixed", left: 14, top: "50%", transform: "translateY(-50%)", zIndex: 1000, display: "flex", flexDirection: "column", gap: 5 }}>
      {slides.map((s, i) => <button key={i} onClick={() => setCur(i)} title={s.l} style={{ width: i === cur ? 22 : 7, height: 7, borderRadius: 4, background: i === cur ? T.gold : "rgba(255,255,255,.25)", border: "none", cursor: "pointer", transition: "all .3s", padding: 0 }} />)}
    </div>}
    {mode === "scroll"
      ? <div>{slides.map((s, i) => { const C = s.c; return <C key={i} />; })}</div>
      : <div style={{ height: "100vh", overflow: "hidden" }}>{(() => { const C = slides[cur].c; return <C />; })()}</div>}
  </div>;
}
