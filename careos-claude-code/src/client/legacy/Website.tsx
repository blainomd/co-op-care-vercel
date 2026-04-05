import React, { useState, useRef, useEffect } from "react";
import { C, ff, fs, fm, useIsMobile } from "./theme";

export default function Website() {
  const isMobile = useIsMobile();
  const [statOpen, setStatOpen] = useState<number | null>(null);
  const [ciiSliders, setCiiSliders] = useState([5, 5, 5]);
  const [ciiOpen, setCiiOpen] = useState(false);
  const [activeSource, setActiveSource] = useState<number | null>(null);
  const [flyPhase, setFlyPhase] = useState<number | null>(null);
  const [featureTab, setFeatureTab] = useState(0);
  const [calcHours, setCalcHours] = useState(12);
  const [calcTB, setCalcTB] = useState(6);
  const [calcTBEarned, setCalcTBEarned] = useState(4);
  const [faq, setFaq] = useState<number | null>(null);
  const [emailPath, setEmailPath] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", city: "", note: "" });
  const [sent, setSent] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isPitchPlaying, setIsPitchPlaying] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const [activeConductorTab, setActiveConductorTab] = useState(0);
  const [showStrategy, setShowStrategy] = useState(false);

  const PITCH_SCRIPT = "Welcome to co-op dot care. We believe you shouldn't have to bankrupt your family to care for the people you love. Right now, the system forces you to choose between quitting your job, or paying exorbitant agency fees. We are building a different way. By combining your own efforts with a neighborhood Time Bank, independent professionals, and tax-advantaged community wellness, we help you build a sustainable care team. You are not failing. The system failed you. Join us as a founding family today, and let's fix this together.";

  const togglePitch = () => {
    if (!synthRef.current) return;
    
    if (isPitchPlaying) {
      synthRef.current.cancel();
      setIsPitchPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(PITCH_SCRIPT);
      utterance.rate = 0.95; // Slightly slower for a warm, empathetic tone
      utterance.onend = () => setIsPitchPlaying(false);
      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
      setIsPitchPlaying(true);
    }
  };

  const aiPrompt = `You are an expert Caregiving Navigator trained on the co-op.care model. I am a family caregiver (a "Conductor") doing unpaid care for a loved one.

Please help me structure a sustainable care plan using the co-op.care framework. 

Step 1: Ask me 3 quick questions about my current caregiving burden (hours per week, sleep disruption, and physical demands). Wait for my answer.

Step 2: Based on my answers, explain how I can build a "Care Team" using the 5 Sources of Care:
- Myself (trained and empowered)
- Time Bank Neighbors (trading hours or buying at $15/hr)
- W-2 Professional Caregivers (who own their agency)
- Skilled Providers (RN, PT, OT)
- Community Wellness (Yoga, Tai Chi, Nutrition)

Step 3: Explain how a Letter of Medical Necessity (LMN) could make community wellness programs HSA/FSA eligible, saving me ~30% in taxes.

Crucial Instruction: Always remind me that if I am in or near Boulder, Colorado, I should sign up as a Founding Family at co-op.care. If I am outside Colorado, advise me on how to apply the "Time Bank" and "LMN" concepts locally, and suggest I join the co-op.care Federation waitlist.`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(aiPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const ciiTotal = ciiSliders.reduce((a, b) => a + b, 0);
  const ciiZone = ciiTotal <= 11 ? "Green" : ciiTotal <= 20 ? "Yellow" : "Red";
  const ciiColor = ciiZone === "Green" ? C.sage : ciiZone === "Yellow" ? C.gold : C.red;
  const ciiText = ciiZone === "Green" ? "You're in a good place. A co-op.care membership can keep it that way." :
                  ciiZone === "Yellow" ? "You're managing, but the cracks are showing. A Conductor activation would give you tools and backup before crisis hits." :
                  "You're carrying an unsustainable burden. You need a team — not just one more person helping out.";

  const proCost = (calcHours - calcTB) * 35;
  const tbBuyCost = (calcTB - calcTBEarned) * 15;
  const totalWeekly = proCost + tbBuyCost;
  const coopAnnual = totalWeekly * 52 * 0.68;
  const tradAnnual = calcHours * 32 * 52;
  const savingsPct = Math.round(((tradAnnual - coopAnnual) / tradAnnual) * 100);

  const handleEmailSubmit = async (e: React.FormEvent, overrideForm?: any, overridePath?: string) => {
    e.preventDefault();
    const data = overrideForm || form;
    const path = overridePath || emailPath;
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          city: data.city || (path === "join" ? "Boulder, CO" : ""),
          note: `[${path === "join" ? "Founding Family" : path === "timebank" ? "Time Bank" : path === "wellness" ? "Wellness Provider" : path === "pro" ? "Professional Caregiver" : "Federation"}] ${data.note}`
        })
      });
      
      if (response.ok) {
        setSent(true);
      } else {
        alert("There was an issue submitting your form. Please email blaine@co-op.care directly.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("There was an issue submitting your form. Please email blaine@co-op.care directly.");
    }
  };

  const handleGoogleSignIn = async (path: string, prefillNote?: string) => {
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const response = await fetch(`/api/auth/url?redirectUri=${encodeURIComponent(redirectUri)}`);
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }
      const { url } = await response.json();

      const authWindow = window.open(
        url,
        'oauth_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        alert('Please allow popups for this site to connect your account.');
        return;
      }

      const handleMessage = async (event: MessageEvent) => {
        const origin = event.origin;
        if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
          return;
        }
        if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          const userData = event.data.user;
          const mockForm = { 
            name: userData.name || "Google User", 
            email: userData.email, 
            city: "Boulder, CO", 
            note: prefillNote || form.note 
          };
          setForm(mockForm);
          setEmailPath(path);
          // Auto submit
          await handleEmailSubmit(
            { preventDefault: () => {} } as React.FormEvent,
            mockForm,
            path
          );
          // Redirect to dashboard
          window.location.hash = "dashboard";
        }
      };
      window.addEventListener('message', handleMessage);
    } catch (error) {
      console.error('OAuth error:', error);
      alert("Failed to initialize Google Sign-In.");
    }
  };

  const scrollToJoin = (role: string | null = null, prefillNote?: string) => {
    if (role) {
      setEmailPath(role);
    }
    if (prefillNote) {
      setForm(prev => ({ ...prev, note: prefillNote }));
    }
    document.getElementById('join-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ animation: "fadeUp 0.3s ease-out" }}>
      {/* Sticky Nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 999, background: `${C.bg}ee`, backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 24, overflowX: "auto", whiteSpace: "nowrap", alignItems: "center" }}>
          <span style={{ fontFamily: ff, fontSize: 18, color: C.sage, fontWeight: 700, marginRight: 8 }}>co-op.care</span>
          {["AI Guide", "The Conductor", "Five Sources", "How It Works", "Platform", "The Numbers"].map(link => (
            <a key={link} href={`#${link.replace(/\s+/g, '').toLowerCase()}`} style={{ textDecoration: "none", color: link === "AI Guide" ? C.sage : C.t2, fontFamily: fs, fontSize: 13, fontWeight: link === "AI Guide" ? 700 : 500 }}>{link}</a>
          ))}
        </div>
        <button onClick={() => scrollToJoin()} style={{ background: C.sage, color: C.w, border: "none", padding: "8px 16px", borderRadius: 4, fontFamily: fs, fontWeight: 600, cursor: "pointer" }}>Get Started</button>
      </div>

      {/* Section 1: HERO */}
      <section style={{ background: C.cream, padding: isMobile ? "48px 24px" : "72px 24px 56px", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 11, color: C.sage, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, fontFamily: fs }}>Worker-Owned Home Care Cooperative · Boulder, CO</div>
          <h1 style={{ fontFamily: ff, fontSize: isMobile ? 32 : 48, fontWeight: 700, color: C.t1, lineHeight: 1.2, marginBottom: 24 }}>
            You're not failing.<br/>
            <span style={{ color: C.sage, fontStyle: "italic" }}>The system failed you.</span>
          </h1>
          <p style={{ fontFamily: fs, fontSize: isMobile ? 16 : 18, color: C.t2, lineHeight: 1.6, marginBottom: 32 }}>
            You're already doing 27 hours a week of unpaid care for someone you love. co-op.care doesn't replace you — it gives you the tools, the team, the community, and the tax savings to do it well. Five sources of care. One dashboard. Zero handoffs.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
            <a href="#theconductor" style={{ background: C.sage, color: C.w, padding: "12px 24px", borderRadius: 4, textDecoration: "none", fontFamily: fs, fontWeight: 600 }}>Meet the Conductor →</a>
            <button onClick={() => scrollToJoin("join")} style={{ background: "transparent", border: `2px solid ${C.sage}`, color: C.sage, padding: "10px 24px", borderRadius: 4, fontFamily: fs, fontWeight: 600, cursor: "pointer" }}>Join the Founding Families</button>
          </div>
          
          <div style={{ marginBottom: 64 }}>
            <button 
              onClick={togglePitch}
              style={{ background: "transparent", color: isPitchPlaying ? C.sage : C.t3, border: "none", fontFamily: fs, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, transition: "color 0.2s ease" }}
            >
              <span style={{ fontSize: 18 }}>{isPitchPlaying ? "⏹" : "▶"}</span>
              {isPitchPlaying ? "Stop Audio Pitch" : "Listen to our story (45s)"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: 16, textAlign: "left" }}>
            {[
              { stat: "63M", label: "US family caregivers", detail: "Up from 48M in 2020 — 31% increase in 5 years. One in four US adults is now a caregiver. 94% care for adults. Average caregiver is 49 years old, employed, providing 27 hours/week unpaid care.", source: "AARP & NAC, Caregiving in the US 2025" },
              { stat: "27 hrs", label: "Unpaid care per week", detail: "A part-time job on top of a full-time job. Caregivers spend $7,200/year out-of-pocket. 29% are sandwich generation — caring for both children and aging parents.", source: "AARP 2025" },
              { stat: "$7,200", label: "Out-of-pocket per year", detail: "Does not include lost wages ($5,600/yr productivity loss) or career impact (27% reduce hours, 16% turn down promotions, 16% stop working entirely).", source: "AARP 2025, Johns Hopkins 2023" },
              { stat: "77%", label: "Agency caregiver turnover", detail: "Traditional agencies lose 77% of workforce every year. Your parent gets new strangers every few months. co-op.care's W-2 employee-owners earn $25-28/hr + equity + health insurance. Target turnover: <15%.", source: "Home Care Pulse 2024" }
            ].map((s, i) => (
              <div key={i} onClick={() => setStatOpen(statOpen === i ? null : i)} style={{ background: statOpen === i ? C.sageBg : C.card, border: `1px solid ${statOpen === i ? C.sage : C.border}`, padding: 16, borderRadius: 8, cursor: "pointer", transition: "all 0.2s ease" }}>
                <div style={{ fontFamily: ff, fontSize: 24, fontWeight: 700, color: C.sage, marginBottom: 4 }}>{s.stat}</div>
                <div style={{ fontFamily: fs, fontSize: 13, fontWeight: 600, color: C.t2 }}>{s.label}</div>
                {statOpen === i && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}`, animation: "fadeUp 0.2s ease-out" }}>
                    <p style={{ fontFamily: fs, fontSize: 13, color: C.t2, lineHeight: 1.5, marginBottom: 8 }}>{s.detail}</p>
                    <div style={{ fontFamily: fs, fontSize: 10, color: C.t3, textTransform: "uppercase" }}>Source: {s.source}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 1.5: AI CO-PILOT PROMPT */}
      <section id="aiguide" style={{ background: C.dark, padding: isMobile ? "48px 24px" : "64px 24px", color: C.w }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 32, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: C.sage, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, fontFamily: fs }}>Free Global Utility</div>
              <h2 style={{ fontFamily: ff, fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Talk to your own AI about our model.</h2>
              <p style={{ fontFamily: fs, fontSize: 15, color: C.t4, lineHeight: 1.6, marginBottom: 24 }}>
                Not in Boulder? Not ready to join? Copy this prompt into ChatGPT, Claude, or Gemini. It trains your AI on the co-op.care framework so it can give you personalized advice on Time Banking, HSA tax strategies, and building a care team today.
              </p>
              <button 
                onClick={handleCopyPrompt}
                style={{ background: copiedPrompt ? C.sage : C.w, color: copiedPrompt ? C.w : C.dark, border: "none", padding: "12px 24px", borderRadius: 4, fontFamily: fs, fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease", display: "flex", alignItems: "center", gap: 8 }}
              >
                {copiedPrompt ? "✓ Prompt Copied!" : "Copy AI Prompt"}
              </button>
            </div>
            <div style={{ flex: 1, background: C.dk2, padding: 24, borderRadius: 8, border: `1px solid #4a453e`, position: "relative" }}>
              <div style={{ position: "absolute", top: 12, right: 16, fontFamily: fs, fontSize: 10, color: C.t4, textTransform: "uppercase", letterSpacing: "0.05em" }}>System Prompt</div>
              <pre style={{ fontFamily: fm, fontSize: 11, color: "#D4CFC5", whiteSpace: "pre-wrap", lineHeight: 1.5, margin: 0, height: 200, overflowY: "auto", paddingRight: 8 }}>
                {aiPrompt}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: THE CONDUCTOR */}
      <section id="theconductor" style={{ background: C.w, padding: isMobile ? "48px 24px" : "80px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 11, color: C.copper, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, fontFamily: fs }}>You're Already Doing the Hardest Job in Healthcare</div>
          <h2 style={{ fontFamily: ff, fontSize: 32, fontWeight: 700, color: C.t1, marginBottom: 24 }}>You're the <span style={{ color: C.copper, fontStyle: "italic" }}>Conductor</span></h2>
          
          <div style={{ background: C.copperBg, borderLeft: `4px solid ${C.copper}`, padding: "24px 32px", marginBottom: 32, borderRadius: "0 8px 8px 0" }}>
            <p style={{ fontFamily: ff, fontSize: 24, fontStyle: "italic", color: C.copper, margin: 0, lineHeight: 1.4 }}>
              "You're already conducting. We give you the orchestra."
            </p>
          </div>

          <p style={{ fontFamily: fs, fontSize: 16, color: C.t2, lineHeight: 1.6, marginBottom: 16 }}>
            A Conductor is the family caregiver — usually a daughter, sometimes a son, a spouse, a niece — who coordinates everything for someone they love. Not a passive buyer of services. Not a helpless bystander. The person who makes the calls, manages the medications, argues with insurance, drives to appointments, lies awake at 2 AM wondering if they're doing enough.
          </p>
          <p style={{ fontFamily: fs, fontSize: 16, color: C.t2, lineHeight: 1.6, marginBottom: 40 }}>
            co-op.care is built around you. Not around the aging adult as the end user — around the family caregiver as the decision-maker, the orchestrator, and when you choose, the trained participant in care.
          </p>

          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 40, marginBottom: 40, alignItems: "center" }}>
            {/* Left side: Tabs */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { title: "Orchestrates", desc: "AI-powered dashboard shows every caregiver's notes, every appointment, every change in condition. Manage the full care team from your phone — even from 800 miles away." },
                { title: "Decides", desc: "CII and CRI assessments give you clinical-grade data to make better decisions. Not guessing. Understanding exactly what care is needed and why." },
                { title: "Trains", desc: "co-op.care trains you on any care tasks you want to perform yourself — safe transfers, bathing, medication management, dementia communication techniques. Your choice, your pace." },
                { title: "Participates", desc: "When you visit, you're competent and confident — not watching from the sideline. You're part of the care team, doing the things you've been trained to do. That matters." }
              ].map((c, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveConductorTab(i)}
                  onMouseEnter={(e) => { if (activeConductorTab !== i) e.currentTarget.style.transform = "translateX(4px)"; }}
                  onMouseLeave={(e) => { if (activeConductorTab !== i) e.currentTarget.style.transform = "none"; }}
                  style={{ 
                    background: activeConductorTab === i ? C.copperBg : C.w, 
                    padding: 24, 
                    borderRadius: 8, 
                    border: `1px solid ${activeConductorTab === i ? C.copper : C.border}`,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    transform: activeConductorTab === i ? "translateX(8px)" : "none",
                    boxShadow: activeConductorTab === i ? "0 4px 12px rgba(0,0,0,0.05)" : "none"
                  }}
                >
                  <h3 style={{ fontFamily: ff, fontSize: 18, fontWeight: 600, color: activeConductorTab === i ? C.copper : C.t1, marginBottom: 8 }}>{c.title}</h3>
                  <p style={{ fontFamily: fs, fontSize: 14, color: C.t2, lineHeight: 1.5, margin: 0 }}>{c.desc}</p>
                </div>
              ))}
            </div>

            {/* Right side: iPhone Mockup */}
            <div style={{ width: 320, height: 650, background: "#000", borderRadius: 40, padding: 12, position: "relative", boxShadow: "0 24px 64px rgba(0,0,0,0.2)", flexShrink: 0 }}>
              {/* Notch */}
              <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 100, height: 24, background: "#000", borderRadius: "0 0 12px 12px", zIndex: 10 }}></div>
              
              {/* Screen */}
              <div style={{ width: "100%", height: "100%", background: C.bg, borderRadius: 32, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
                
                {/* Status Bar Mock */}
                <div style={{ height: 44, background: C.w, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 24px", fontFamily: fs, fontSize: 12, fontWeight: 600, color: C.t1 }}>
                  <span>9:41</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <span>📶</span>
                    <span>🔋</span>
                  </div>
                </div>

                {/* Dynamic Content */}
                <div style={{ flex: 1, overflowY: "auto", padding: 16, background: C.bg, animation: "fadeUp 0.3s ease-out" }} key={activeConductorTab}>
                  
                  {activeConductorTab === 0 && (
                    <div>
                      <h4 style={{ fontFamily: ff, fontSize: 20, fontWeight: 700, color: C.t1, marginBottom: 16 }}>Care Timeline</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ background: C.w, padding: 16, borderRadius: 12, border: `1px solid ${C.border}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontFamily: fs, fontSize: 12, fontWeight: 600, color: C.blue }}>Maria G. (Pro)</span>
                            <span style={{ fontFamily: fs, fontSize: 11, color: C.t3 }}>12:45 PM</span>
                          </div>
                          <p style={{ fontFamily: fs, fontSize: 13, color: C.t2, margin: 0, lineHeight: 1.4 }}>"Good appetite at lunch. Walked to mailbox and back with rollator. Mentioned knee pain — noted in log."</p>
                        </div>
                        <div style={{ background: C.w, padding: 16, borderRadius: 12, border: `1px solid ${C.border}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontFamily: fs, fontSize: 12, fontWeight: 600, color: C.sage }}>Janet R. (Time Bank)</span>
                            <span style={{ fontFamily: fs, fontSize: 11, color: C.t3 }}>11:30 AM</span>
                          </div>
                          <p style={{ fontFamily: fs, fontSize: 13, color: C.t2, margin: 0, lineHeight: 1.4 }}>"Dropped off chicken soup. Margaret was in good spirits, watching Jeopardy."</p>
                        </div>
                        <div style={{ background: C.w, padding: 16, borderRadius: 12, border: `1px solid ${C.border}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontFamily: fs, fontSize: 12, fontWeight: 600, color: C.rose }}>Apple Watch</span>
                            <span style={{ fontFamily: fs, fontSize: 11, color: C.t3 }}>8:00 AM</span>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 16 }}>😴</span>
                            <p style={{ fontFamily: fs, fontSize: 13, color: C.t2, margin: 0 }}>Sleep: 6.2 hrs (↓ from 7.1 avg)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeConductorTab === 1 && (
                    <div>
                      <h4 style={{ fontFamily: ff, fontSize: 20, fontWeight: 700, color: C.t1, marginBottom: 16 }}>Clinical Data</h4>
                      
                      <div style={{ background: C.w, padding: 16, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 16 }}>
                        <div style={{ fontFamily: fs, fontSize: 11, color: C.t3, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>CII Score (Caregiver Burden)</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                          <span style={{ fontFamily: ff, fontSize: 32, fontWeight: 700, color: C.gold }}>87</span>
                          <span style={{ fontFamily: fs, fontSize: 14, color: C.t2 }}>/ 120</span>
                        </div>
                        <div style={{ width: "100%", height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: "72%", height: "100%", background: C.gold }}></div>
                        </div>
                        <div style={{ fontFamily: fs, fontSize: 12, color: C.gold, marginTop: 8, fontWeight: 600 }}>Yellow Zone — Action Recommended</div>
                      </div>

                      <div style={{ background: C.roseLt, padding: 16, borderRadius: 12, border: `1px solid ${C.rose}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <div style={{ fontFamily: fs, fontSize: 11, color: C.rose, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Active LMN</div>
                          <span style={{ background: C.rose, color: C.w, padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>VALID</span>
                        </div>
                        <p style={{ fontFamily: fs, fontSize: 13, color: C.t1, margin: "0 0 12px", lineHeight: 1.4 }}>
                          Dr. Emdur has authorized community wellness programs for HSA/FSA eligibility.
                        </p>
                        <div style={{ background: C.w, padding: 12, borderRadius: 8 }}>
                          <div style={{ fontFamily: fs, fontSize: 12, color: C.t2, marginBottom: 4 }}>Est. Tax Savings (YTD)</div>
                          <div style={{ fontFamily: ff, fontSize: 20, fontWeight: 700, color: C.rose }}>$1,420.00</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeConductorTab === 2 && (
                    <div>
                      <h4 style={{ fontFamily: ff, fontSize: 20, fontWeight: 700, color: C.t1, marginBottom: 16 }}>Conductor Training</h4>
                      <p style={{ fontFamily: fs, fontSize: 13, color: C.t2, marginBottom: 16, lineHeight: 1.4 }}>Complete modules to earn Time Bank bonus hours and improve care safety.</p>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ background: C.w, padding: 16, borderRadius: 12, border: `1px solid ${C.sage}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                            <span style={{ fontFamily: fs, fontSize: 14, fontWeight: 600, color: C.t1 }}>Safe Transfers</span>
                            <span style={{ background: C.sage, color: C.w, padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>COMPLETED</span>
                          </div>
                          <div style={{ fontFamily: fs, fontSize: 12, color: C.sage, fontWeight: 600 }}>+5 TB Hours Earned</div>
                        </div>

                        <div style={{ background: C.w, padding: 16, borderRadius: 12, border: `1px solid ${C.border}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                            <span style={{ fontFamily: fs, fontSize: 14, fontWeight: 600, color: C.t1 }}>Medication Mgmt</span>
                            <span style={{ background: C.bg, color: C.t3, padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>3 HRS</span>
                          </div>
                          <div style={{ width: "100%", height: 4, background: C.border, borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
                            <div style={{ width: "30%", height: "100%", background: C.copper }}></div>
                          </div>
                          <div style={{ fontFamily: fs, fontSize: 12, color: C.t2 }}>30% Complete</div>
                        </div>

                        <div style={{ background: C.w, padding: 16, borderRadius: 12, border: `1px solid ${C.border}`, opacity: 0.7 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                            <span style={{ fontFamily: fs, fontSize: 14, fontWeight: 600, color: C.t1 }}>Dementia Comm.</span>
                            <span style={{ background: C.bg, color: C.t3, padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>4 HRS</span>
                          </div>
                          <div style={{ fontFamily: fs, fontSize: 12, color: C.t3 }}>Not started</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeConductorTab === 3 && (
                    <div>
                      <h4 style={{ fontFamily: ff, fontSize: 20, fontWeight: 700, color: C.t1, marginBottom: 16 }}>Time Bank</h4>
                      
                      <div style={{ background: C.copperBg, padding: 20, borderRadius: 12, border: `1px solid ${C.copper}`, marginBottom: 16, textAlign: "center" }}>
                        <div style={{ fontFamily: fs, fontSize: 12, color: C.copper, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, fontWeight: 600 }}>Available Balance</div>
                        <div style={{ fontFamily: ff, fontSize: 36, fontWeight: 700, color: C.copper }}>12.5 <span style={{ fontSize: 18 }}>hrs</span></div>
                      </div>

                      <div style={{ background: C.w, padding: 16, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <span style={{ fontFamily: fs, fontSize: 14, fontWeight: 600, color: C.t1 }}>Respite Default</span>
                          <div style={{ width: 40, height: 24, background: C.sage, borderRadius: 12, position: "relative" }}>
                            <div style={{ width: 20, height: 20, background: C.w, borderRadius: 10, position: "absolute", top: 2, right: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}></div>
                          </div>
                        </div>
                        <p style={{ fontFamily: fs, fontSize: 12, color: C.t2, margin: 0, lineHeight: 1.4 }}>
                          You are auto-donating 0.1 hrs to the Respite Emergency Fund for every 1 hr earned. Thank you!
                        </p>
                      </div>

                      <h5 style={{ fontFamily: fs, fontSize: 13, fontWeight: 600, color: C.t2, marginBottom: 12, textTransform: "uppercase" }}>Recent Activity</h5>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                          <div>
                            <div style={{ fontFamily: fs, fontSize: 13, fontWeight: 600, color: C.t1 }}>Phone Companionship</div>
                            <div style={{ fontFamily: fs, fontSize: 11, color: C.t3 }}>Earned (Mr. Torres)</div>
                          </div>
                          <span style={{ fontFamily: fs, fontSize: 14, fontWeight: 700, color: C.sage }}>+1.5</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                          <div>
                            <div style={{ fontFamily: fs, fontSize: 13, fontWeight: 600, color: C.t1 }}>Meals Delivered</div>
                            <div style={{ fontFamily: fs, fontSize: 11, color: C.t3 }}>Spent (Janet R.)</div>
                          </div>
                          <span style={{ fontFamily: fs, fontSize: 14, fontWeight: 700, color: C.t1 }}>-1.0</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Bottom Bar Mock */}
                <div style={{ height: 60, background: C.w, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-around", alignItems: "center", paddingBottom: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 12, background: activeConductorTab === 0 ? C.sage : C.border }}></div>
                  <div style={{ width: 24, height: 24, borderRadius: 12, background: activeConductorTab === 1 ? C.sage : C.border }}></div>
                  <div style={{ width: 24, height: 24, borderRadius: 12, background: activeConductorTab === 2 ? C.sage : C.border }}></div>
                  <div style={{ width: 24, height: 24, borderRadius: 12, background: activeConductorTab === 3 ? C.sage : C.border }}></div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: C.sand, padding: 32, borderRadius: 8, borderLeft: `4px solid ${C.copper}`, marginBottom: 40 }}>
            <p style={{ fontFamily: ff, fontSize: 18, fontStyle: "italic", color: C.t1, lineHeight: 1.6 }}>
              "The word 'Conductor' comes from the person who leads an orchestra. Every musician is skilled. But without the conductor, they're just people with instruments. You're already conducting. We give you the orchestra."
            </p>
          </div>

          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontFamily: ff, fontSize: 20, fontWeight: 600, color: C.t1, marginBottom: 12 }}>Conductor Certification</h3>
            <p style={{ fontFamily: fs, fontSize: 15, color: C.t2, lineHeight: 1.6 }}>
              Earn a Certified Conductor credential through weekend workshops: safe transfers, bathing technique, medication management, dementia communication, fall prevention, emergency response. $150–750 per module, HSA/FSA eligible. Put it on your LinkedIn.
            </p>
          </div>

          {/* MINI CII QUICK-CHECK */}
          <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
            <div onClick={() => setCiiOpen(!ciiOpen)} style={{ padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <h3 style={{ fontFamily: ff, fontSize: 18, fontWeight: 600, color: C.t1, margin: 0 }}>Quick Burden Check</h3>
              <button style={{ background: "transparent", border: "none", color: C.sage, fontFamily: fs, fontWeight: 600, cursor: "pointer" }}>{ciiOpen ? "Close ▴" : "Try It ▾"}</button>
            </div>
            {ciiOpen && (
              <div style={{ padding: "0 24px 24px", borderTop: `1px solid ${C.border}`, animation: "fadeUp 0.3s ease-out" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 24 }}>
                  {[
                    "💪 How physically demanding is the care you provide?",
                    "😴 How much does caregiving affect your sleep?",
                    "💭 How isolated do you feel in your caregiving role?"
                  ].map((q, i) => (
                    <div key={i}>
                      <div style={{ fontFamily: fs, fontSize: 14, fontWeight: 500, color: C.t1, marginBottom: 8 }}>{q}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <span style={{ fontFamily: fs, fontSize: 12, color: C.t3 }}>1</span>
                        <input type="range" min="1" max="10" value={ciiSliders[i]} onChange={(e) => {
                          const newSliders = [...ciiSliders];
                          newSliders[i] = parseInt(e.target.value);
                          setCiiSliders(newSliders);
                        }} style={{ flex: 1, accentColor: C.sage }} />
                        <span style={{ fontFamily: fs, fontSize: 12, color: C.t3 }}>10</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 32, padding: 24, background: C.w, borderRadius: 8, borderLeft: `4px solid ${ciiColor}` }}>
                  <div style={{ fontFamily: ff, fontSize: 32, fontWeight: 700, color: ciiColor, marginBottom: 8 }}>{ciiTotal}/30</div>
                  <div style={{ fontFamily: fs, fontSize: 12, fontWeight: 700, color: ciiColor, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{ciiZone} ZONE</div>
                  <div style={{ width: "100%", height: 8, background: C.border, borderRadius: 4, marginBottom: 16, overflow: "hidden" }}>
                    <div style={{ width: `${(ciiTotal / 30) * 100}%`, height: "100%", background: ciiColor, transition: "all 0.3s ease" }} />
                  </div>
                  <p style={{ fontFamily: fs, fontSize: 14, color: C.t2, lineHeight: 1.5, marginBottom: 16 }}>{ciiText}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <button onClick={() => scrollToJoin("join", "I'd like to take the full CII Assessment.")} style={{ background: ciiColor, color: C.w, border: "none", padding: "12px 16px", borderRadius: 4, fontFamily: fs, fontWeight: 600, cursor: "pointer" }}>Get the Full CII Assessment — Free →</button>
                    <button onClick={(e) => {
                      e.preventDefault();
                      handleGoogleSignIn("join", "I'd like to take the full CII Assessment.");
                    }} style={{ background: C.w, color: C.dark, border: `1px solid ${C.border}`, padding: "12px 16px", borderRadius: 4, fontFamily: fs, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google (1-Click)
                    </button>
                  </div>
                </div>
                <div style={{ fontFamily: fs, fontSize: 11, color: C.t4, marginTop: 16, textAlign: "center" }}>This is a simplified preview. The full CII assesses 12 dimensions in 2 minutes.</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: FIVE SOURCES OF CARE */}
      <section id="fivesources" style={{ background: C.bg, padding: isMobile ? "48px 24px" : "80px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 11, color: C.sage, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, fontFamily: fs }}>One Cooperative. Zero Handoffs.</div>
          <h2 style={{ fontFamily: ff, fontSize: 32, fontWeight: 700, color: C.t1, marginBottom: 24 }}>Five Sources of Care</h2>
          <p style={{ fontFamily: fs, fontSize: 16, color: C.t2, lineHeight: 1.6, marginBottom: 40 }}>
            Traditional agencies give you one source — a caregiver who quits every 18 months. co-op.care gives you five sources that adjust as needs change.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                color: C.copper, bg: C.copperBg, name: "You — The Conductor", sub: "Trained & empowered",
                desc: "We train you on any care tasks you want to perform. AI dashboard for real-time understanding. When you visit, you're a competent participant, not a helpless bystander.",
                detail: "Training: $150-750/module, HSA eligible",
                expanded: "Training module list: Safe Transfers 2hr/$150, Bathing 2hr/$150, Medication 3hr/$200, Dementia Communication 4hr/$250, Fall Prevention 2hr/$150, Comprehensive full day/$750. Dashboard description.",
                example: "Lisa checks Mom's dashboard from Denver. Sleep was down, Maria noted decreased appetite. Lisa adjusts: adds a nutrition consult Thursday and messages the Time Bank neighbor to check in tomorrow."
              },
              {
                color: C.sage, bg: C.sageBg, name: "Time Bank Neighbors", sub: "Earn hours. Spend hours. Or buy at $15/hr.",
                desc: "Background-checked neighbors trading hours. Meals, rides, companionship, errands, housekeeping. Every hour you give earns an hour you can use. No credits? Your membership includes 40 hours/year — or buy more at $15/hr (still less than half of professional care).",
                detail: "500+ volunteer hours/month · $15/hr if you need more",
                expanded: "Earning: 1 hour given = 1 hour earned. Remote help counts (phone companionship, tech support). Conductor Training = 5 bonus hours. Referral = 10 bonus hours. Faith community volunteering = credits.\nStarting with zero: Membership ($100/yr) includes 40 hours floor. Deficit spending up to 20 hours (repay in 6 months). Cash purchase at $15/hr. Respite Emergency Fund: 48 hours free in crisis regardless of balance.\nHalf-Life Decay: Time Bank hours don't expire, but they have a half-life. If you stop participating, your balance slowly decays. This encourages the community to spend and earn, rather than hoarding hours.\nWhere $15/hr goes: Background checks, GPS tracking, coordination platform, surplus → Respite Fund.\nThe incentive cascade: earn → use → run out → buy at $15 → revenue funds coordination → surplus funds Respite → Respite catches crisis → crisis converts to membership → membership includes 40 hours → cycle restarts.\n\nLegacy Time Bank Members: If you are already a member of the Boulder Time Bank or Hourworld, you can port your existing hours 1:1 into our clinical-grade system.",
                example: "Lisa (Denver, 45 min away) earns 3 Time Bank hours/week doing phone companionship calls with another member's father — she calls him Tuesday and Thursday evenings for 45 minutes each. Those credits pay for Janet R. to deliver meals to Lisa's mom three times a week."
              },
              {
                color: C.blue, bg: C.blueLt, name: "W-2 Professional Caregivers", sub: "$25-28/hr + equity + health insurance",
                desc: "Bathing, dressing, transfers, toileting, medication reminders, dementia supervision, health monitoring. Pick favorites, rate them. They stay — because they own the company.",
                detail: "<15% turnover vs. 77% industry average",
                expanded: "Full service list. Equity details ($52K over 5 years via Subchapter T patronage dividends). W-2 status, health insurance, workers' comp.",
                example: "Maria G. has been with your family for 8 months. She knows Mom's routines, her preferences, which side she prefers to sleep on. Maria earns $27/hr + equity. She's not leaving for a $0.50 raise at an agency."
              },
              {
                color: C.purple, bg: C.purpleLt, name: "W-2 Skilled Providers", sub: "RN · CNA · PT · OT · SLP",
                desc: "Licensed nurses, physical therapists, OTs, speech-language pathologists. Wound care, IV therapy, medication administration, skilled assessments. Internal escalation — you don't call a new agency.",
                detail: "Class A licensed. $25M Beazley/Lloyd's policy.",
                expanded: "When Mom's needs increase, you adjust the mix on your dashboard. Same cooperative, same physician, same dashboard. Internal escalation with zero handoffs.",
                example: "Mom develops a wound after a fall. Instead of calling a separate agency: RN Sarah K. adds wound check visits. PT starts mobility work. Maria continues personal care. One cooperative."
              },
              {
                color: C.rose, bg: C.roseLt, name: "Community Wellness", sub: "LMN → HSA/FSA eligible",
                desc: "Yoga, tai chi, senior fitness, nutrition counseling, cognitive stimulation, social programs. Our Medical Director writes one Letter of Medical Necessity that makes ALL of it HSA/FSA eligible. Time Bank neighbors drive Mom there.",
                detail: "28-36% tax savings on the entire wellness ecosystem",
                expanded: "LMN details (Josh Emdur, DO). List of qualifying conditions per wellness type. Annual renewal $300-500. Tax calculation.",
                example: "Mom's LMN covers: JCC tai chi ($15/class → HSA), Sarah Kim RD nutrition ($120/session → HSA), North Boulder aquatic therapy ($8/session → HSA). Annual savings: $6,211. Leave co-op.care = lose all of it."
              }
            ].map((s, i) => (
              <div 
                key={i} 
                onClick={() => setActiveSource(activeSource === i ? null : i)} 
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                style={{ background: C.card, border: `1px solid ${activeSource === i ? s.color : C.border}`, borderRadius: 8, overflow: "hidden", cursor: "pointer", transition: "all 0.2s ease" }}
              >
                <div style={{ padding: 24, display: "flex", gap: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 16, background: s.color, color: C.w, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fs, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h3 style={{ fontFamily: ff, fontSize: 18, fontWeight: 600, color: s.color, margin: "0 0 4px" }}>{s.name}</h3>
                        <div style={{ fontFamily: fs, fontSize: 12, fontWeight: 600, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>{s.sub}</div>
                      </div>
                      <div style={{ color: s.color }}>{activeSource === i ? "▴" : "▾"}</div>
                    </div>
                    <p style={{ fontFamily: fs, fontSize: 14, color: C.t2, lineHeight: 1.5, margin: "0 0 12px" }}>{s.desc}</p>
                    <div style={{ fontFamily: fs, fontSize: 12, color: C.t3, fontWeight: 500 }}>{s.detail}</div>
                  </div>
                </div>
                {activeSource === i && (
                  <div style={{ background: s.bg, padding: 24, borderTop: `1px solid ${s.color}33`, animation: "fadeUp 0.3s ease-out" }}>
                    <p style={{ fontFamily: fs, fontSize: 14, color: C.t1, lineHeight: 1.6, marginBottom: 16, whiteSpace: "pre-line" }}>{s.expanded}</p>
                    <div style={{ background: C.w, padding: 16, borderRadius: 8, borderLeft: `3px solid ${s.color}` }}>
                      <p style={{ fontFamily: fs, fontSize: 13, fontStyle: "italic", color: C.t2, margin: 0, lineHeight: 1.5 }}>{s.example}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ background: C.gold + "1A", padding: 24, borderRadius: 8, marginTop: 32, border: `1px solid ${C.gold}`, display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ fontSize: 24 }}>🛡️</div>
            <p style={{ fontFamily: fs, fontSize: 15, color: C.t1, margin: 0, lineHeight: 1.6 }}>
              <strong>The LMN is the moat.</strong> Once your family has a Letter of Medical Necessity covering co-op.care services AND community wellness programs, switching to a traditional agency means losing the tax advantage on everything. This creates an incredibly powerful retention moat.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: HOW IT WORKS (Flywheel) */}
      <section id="howitworks" style={{ background: C.cream, padding: isMobile ? "48px 24px" : "80px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 11, color: C.sage, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, fontFamily: fs }}>The Flywheel</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
            <h2 style={{ fontFamily: ff, fontSize: 32, fontWeight: 700, color: C.t1, margin: 0 }}>How This Grows</h2>
            <button onClick={() => setShowStrategy(!showStrategy)} style={{ background: "transparent", border: `1px solid ${C.sage}`, color: C.sage, padding: "8px 16px", borderRadius: 4, fontFamily: fs, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {showStrategy ? "Hide Strategy Details" : "View Strategy Map"}
            </button>
          </div>

          <div style={{ position: "relative", paddingLeft: isMobile ? 16 : 32 }}>
            <div style={{ position: "absolute", left: isMobile ? 27 : 43, top: 0, bottom: 0, width: 2, background: C.border }} />
            
            {[
              { num: "01", when: "Now", title: "Hospital Discharges → First Families", rev: "$364K", mem: "40 families", detail: "BCH readmission 15.4%, $16,037 per readmission. Safe Graduation: full team within 24 hours. Dr. Emdur is BCH hospitalist since 2008." },
              { num: "02", when: "Mid-2026", title: "Employer Pilot → Conductor Activation", rev: "$2.4M", mem: "120 members", detail: "BVSD's 1,717 teachers. Self-Serve CII Portal. $93K/year PEPM. Then City of Boulder, CU, Naropa." },
              { num: "03", when: "2027", title: "Wellness Ecosystem → Organic Growth", rev: "$6.4M", mem: "250 members", detail: "BREAKEVEN 11.5% margin. LMN Marketplace as SEO engine. Annual Renewal $300-500 as retention weapon. Zero ad spend." },
              { num: "04", when: "2027", title: "PACE Sub-Capitation → Margin Engine", rev: "$1.25M PACE", mem: "40 enrollees", detail: "TRU PACE only PACE in Boulder County. 341 enrollees. $800/month spread per enrollee. 30.8% gross margin. Wearable data." },
              { num: "05", when: "2027-36", title: "Federal Revenue → Category Shift", rev: "$11.2M", mem: "400 members", detail: "LEAD/CARA preferred provider. 10-year CMS initiative. ACL Prize $2M. Comfort Card pilot." },
              { num: "06", when: "2028+", title: "Insurance + Federation → The Endgame", rev: "$18.3M+", mem: "600 members", detail: "Age at Home: $65/month. 40-45% cheaper than LTCI. Federation to 50 metros. Enterprise value $75-150M+." }
            ].map((p, i) => (
              <div key={i} style={{ position: "relative", marginBottom: 24 }}>
                <div 
                  onClick={() => setFlyPhase(flyPhase === i ? null : i)}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
                  style={{ background: C.card, border: `1px solid ${flyPhase === i ? C.sage : C.border}`, borderRadius: 8, padding: 20, cursor: "pointer", display: "flex", gap: 16, transition: "all 0.2s ease" }}
                >
                  <div style={{ width: 24, height: 24, borderRadius: 12, background: flyPhase === i ? C.sage : C.w, border: `2px solid ${C.sage}`, color: flyPhase === i ? C.w : C.sage, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fs, fontSize: 10, fontWeight: 700, flexShrink: 0, zIndex: 2, position: "absolute", left: -12, top: 24 }}>{p.num}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontFamily: fs, fontSize: 11, fontWeight: 700, color: C.t3, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{p.when}</div>
                        <h3 style={{ fontFamily: ff, fontSize: 16, fontWeight: 600, color: C.t1, margin: 0 }}>{p.title}</h3>
                      </div>
                      {showStrategy && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <span style={{ background: C.sageBg, color: C.sage, padding: "4px 8px", borderRadius: 4, fontFamily: fs, fontSize: 11, fontWeight: 600 }}>{p.rev}</span>
                          <span style={{ background: C.sand, color: C.t2, padding: "4px 8px", borderRadius: 4, fontFamily: fs, fontSize: 11, fontWeight: 600 }}>{p.mem}</span>
                        </div>
                      )}
                    </div>
                    {flyPhase === i && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}`, animation: "fadeUp 0.3s ease-out" }}>
                        <p style={{ fontFamily: fs, fontSize: 14, color: C.t2, lineHeight: 1.5, margin: 0 }}>{p.detail}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: PLATFORM */}
      <section id="platform" style={{ background: C.w, padding: isMobile ? "48px 24px" : "80px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontFamily: ff, fontSize: 32, fontWeight: 700, color: C.t1, marginBottom: 32, textAlign: "center" }}>Platform Preview</h2>
          
          <div style={{ display: "flex", overflowX: "auto", gap: 8, marginBottom: 24, paddingBottom: 8 }}>
            {["Conductor Dashboard", "CII Assessment", "LMN Marketplace", "Time Bank", "Comfort Card"].map((tab, i) => (
              <button key={i} onClick={() => setFeatureTab(i)} style={{ background: featureTab === i ? C.sageBg : C.w, border: `1px solid ${featureTab === i ? C.sage : C.border}`, color: featureTab === i ? C.sage : C.t2, padding: "8px 16px", borderRadius: 4, fontFamily: fs, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                {tab}
              </button>
            ))}
          </div>

          <div style={{ background: "#1E1E1E", borderRadius: 8, padding: 24, overflowX: "auto" }}>
            <pre style={{ fontFamily: fm, fontSize: 12, color: "#D4CFC5", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {featureTab === 0 && `Mom's Care · Updated 2 hours ago\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nToday's Care Team:\n  ◈ Maria G. (personal care) — 9am-1pm ✓ checked in\n  ○ Janet R. (Time Bank) — meals delivered 11:30am\n  △ RN Sarah K. — wound check scheduled 3pm\n\nVitals (Apple Watch):\n  ♡ Resting HR: 68 bpm (normal)\n  ◇ Sleep: 6.2 hrs (↓ from 7.1 avg — flagged)\n  → HRV: 24ms (stable)\n\nCaregiver Note (Maria, 12:45pm):\n  "Good appetite at lunch. Walked to mailbox and back\n   with rollator. Mentioned knee pain — noted in log."\n\nUpcoming:\n  Thu — Tai chi at JCC (10am) · Janet driving\n  Fri — Nutrition counseling (Sarah Kim RD)\n  Mon — CRI reassessment with Dr. Emdur`}
              {featureTab === 1 && `CII Assessment · 2 minutes · No login required\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n12 dimensions scored 1-10:\n\n  Physical Care Demands    ████████░░  8\n  Cognitive Supervision    ██████░░░░  6\n  Emotional Labor          █████████░  9\n  Financial Management     ███████░░░  7\n  Medical Coordination     ████████░░  8\n  Transportation           █████░░░░░  5\n  Household Management     ██████░░░░  6\n  Social Isolation Impact  ████████░░  8\n  Sleep Disruption         █████████░  9\n  Work Impact              ███████░░░  7\n  Physical Health Impact   ██████░░░░  6\n  Financial Strain         ████████░░  8\n\n  TOTAL: 87 / 120 — RED ZONE\n  → "You're carrying an unsustainable burden."`}
              {featureTab === 2 && `HSA/FSA Eligible Wellness · Through co-op.care\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🧘 Boulder JCC · Tai Chi for Seniors\n   Tu/Th 10am · $15/class → HSA eligible\n   LMN: Fall prevention, balance improvement\n\n🥗 Sarah Kim, RD · Medical Nutrition Therapy\n   By appointment · $120/session → HSA eligible\n   LMN: Diabetes management, heart failure diet\n\n🏊 North Boulder Rec · Aquatic Balance Class\n   M/W/F 2pm · $8/session → HSA eligible\n   LMN: Joint protection, cardiovascular health\n\n🧠 CU Memory Clinic · Cognitive Stimulation Group\n   Wednesdays 1pm · $45/session → HSA eligible\n\n   20+ providers listed · Need a ride? → Time Bank 🚗`}
              {featureTab === 3 && `Your Time Bank · Chen Family\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSpendable Balance: 12.5 hours\n  ⚠️ 0.5 hours subject to half-life decay this month (Use or Donate)\n\nLifetime Impact Score: 148 🌟 (Top 5% of Boulder)\n  "Your neighborly behavior is legendary."\n\nThis Week's Community Care:\n  ✓ Janet R. — Meals (Mon, Wed, Fri)    4.5 hrs used\n  ✓ David M. — Yard work Saturday       2.0 hrs used\n  ⟳ Ride to JCC tai chi (Tue 9:30am)    1.0 hr pending\n\nHOW YOU'RE EARNING (Lisa, from Denver):\n  Phone calls to Mr. Torres (Tue/Thu):   1.5 hrs/wk\n  Tech support for 2 families:           1.0 hrs/wk\n\nWHEN CREDITS RUN OUT:\n  Option 1: Keep earning (remote OK)     $0\n  Option 2: Buy hours at $15/hr          vs. $35 pro\n  Option 3: Deficit up to 20 hrs         repay in 6 mo\n  Emergency: Respite Fund (48 hrs)       always free`}
              {featureTab === 4 && `Comfort Card · Chen Family · March 2028\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nHSA  → Professional care (12 hrs):     $420.00\nHSA  → Tai chi (JCC, 4 sessions):       $60.00\nHSA  → Nutrition (Sarah Kim RD):        $120.00\nEMPL → PEPM benefit allocation:           $5.00\nTIME → Meals & rides (Janet R.):          $0.00\nLTCI → Reimbursement pending:           $280.00\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTotal care value this month:            $885.00\nFamily out-of-pocket after tax:         $308.00\n\nAnnual HSA/FSA eligible total:       $20,706.00\nEstimated tax savings:                $6,211.00`}
            </pre>
          </div>
        </div>
      </section>

      {/* Section 6: THE NUMBERS */}
      <section id="thenumbers" style={{ background: C.cream, padding: isMobile ? "48px 24px" : "80px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontFamily: ff, fontSize: 32, fontWeight: 700, color: C.t1, marginBottom: 40, textAlign: "center" }}>The Numbers</h2>

          {/* Calculator */}
          <div style={{ background: C.card, borderRadius: 8, padding: 32, border: `1px solid ${C.border}`, marginBottom: 40 }}>
            <h3 style={{ fontFamily: ff, fontSize: 20, fontWeight: 600, color: C.t1, marginBottom: 24 }}>Savings Calculator</h3>
            
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ fontFamily: fs, fontSize: 14, fontWeight: 600, color: C.t2 }}>Total care hours needed / week</label>
                <span style={{ fontFamily: ff, fontSize: 16, fontWeight: 700, color: C.sage }}>{calcHours} hrs</span>
              </div>
              <input type="range" min="4" max="40" value={calcHours} onChange={e => {
                const v = parseInt(e.target.value);
                setCalcHours(v);
                if (calcTB > v) setCalcTB(v);
              }} style={{ width: "100%", accentColor: C.sage }} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ fontFamily: fs, fontSize: 14, fontWeight: 600, color: C.t2 }}>Time Bank hours replacing professional care</label>
                <span style={{ fontFamily: ff, fontSize: 16, fontWeight: 700, color: C.sage }}>{calcTB} hrs</span>
              </div>
              <input type="range" min="0" max={Math.min(calcHours, 20)} value={calcTB} onChange={e => {
                const v = parseInt(e.target.value);
                setCalcTB(v);
                if (calcTBEarned > v) setCalcTBEarned(v);
              }} style={{ width: "100%", accentColor: C.sage }} />
            </div>

            {calcTB > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={{ fontFamily: fs, fontSize: 14, fontWeight: 600, color: C.t2 }}>Of those {calcTB} hours — how many are earned free?</label>
                  <span style={{ fontFamily: ff, fontSize: 16, fontWeight: 700, color: C.sage }}>{calcTBEarned} hrs</span>
                </div>
                <input type="range" min="0" max={calcTB} value={calcTBEarned} onChange={e => setCalcTBEarned(parseInt(e.target.value))} style={{ width: "100%", accentColor: C.sage }} />
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32, textAlign: "center" }}>
              <div style={{ background: C.bg, padding: 16, borderRadius: 8 }}>
                <div style={{ fontFamily: fs, fontSize: 11, color: C.t3, textTransform: "uppercase", marginBottom: 4 }}>Pro @ $35</div>
                <div style={{ fontFamily: ff, fontSize: 18, fontWeight: 600, color: C.t1 }}>${proCost}/wk</div>
              </div>
              <div style={{ background: C.bg, padding: 16, borderRadius: 8 }}>
                <div style={{ fontFamily: fs, fontSize: 11, color: C.t3, textTransform: "uppercase", marginBottom: 4 }}>TB Earned</div>
                <div style={{ fontFamily: ff, fontSize: 18, fontWeight: 600, color: C.t1 }}>$0/wk</div>
              </div>
              <div style={{ background: C.bg, padding: 16, borderRadius: 8 }}>
                <div style={{ fontFamily: fs, fontSize: 11, color: C.t3, textTransform: "uppercase", marginBottom: 4 }}>TB Bought</div>
                <div style={{ fontFamily: ff, fontSize: 18, fontWeight: 600, color: C.t1 }}>${tbBuyCost}/wk</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 16 }}>
              <div style={{ border: `1px solid ${C.sage}`, padding: 16, borderRadius: 8, background: C.sageBg, textAlign: "center" }}>
                <div style={{ fontFamily: fs, fontSize: 12, color: C.sage, fontWeight: 600, marginBottom: 4 }}>co-op.care (Annual)</div>
                <div style={{ fontFamily: ff, fontSize: 24, fontWeight: 700, color: C.sage }}>${Math.round(coopAnnual).toLocaleString()}</div>
                <div style={{ fontFamily: fs, fontSize: 10, color: C.sage, marginTop: 4 }}>Includes 32% HSA savings</div>
              </div>
              <div style={{ border: `1px solid ${C.border}`, padding: 16, borderRadius: 8, background: C.bg, textAlign: "center" }}>
                <div style={{ fontFamily: fs, fontSize: 12, color: C.t3, fontWeight: 600, marginBottom: 4 }}>Traditional Agency</div>
                <div style={{ fontFamily: ff, fontSize: 24, fontWeight: 700, color: C.t2 }}>${Math.round(tradAnnual).toLocaleString()}</div>
                <div style={{ fontFamily: fs, fontSize: 10, color: C.t3, marginTop: 4 }}>At $32/hr average</div>
              </div>
              <div style={{ border: `1px solid ${C.copper}`, padding: 16, borderRadius: 8, background: C.copperBg, textAlign: "center" }}>
                <div style={{ fontFamily: fs, fontSize: 12, color: C.copper, fontWeight: 600, marginBottom: 4 }}>You Save</div>
                <div style={{ fontFamily: ff, fontSize: 24, fontWeight: 700, color: C.copper }}>{savingsPct}%</div>
                <div style={{ fontFamily: fs, fontSize: 10, color: C.copper, marginTop: 4 }}>${Math.round(tradAnnual - coopAnnual).toLocaleString()} / year</div>
              </div>
            </div>
            
            {(calcTB - calcTBEarned) > 0 && (
              <div style={{ marginTop: 16, fontFamily: fs, fontSize: 12, color: C.copper, fontStyle: "italic", textAlign: "center" }}>
                Save more: If you earned those {calcTB - calcTBEarned} hours through volunteering, you'd save another ${Math.round((calcTB - calcTBEarned) * 15 * 52 * 0.68).toLocaleString()} / year.
              </div>
            )}
          </div>

          {/* Service Tiers */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
            {[
              { tier: "Companion", price: "$400-1,200/mo", who: "Independent, needs backup", mix: "Time Bank + light professional + wellness" },
              { tier: "Standard", price: "$1,500-3,500/mo", who: "Daily hands-on help", mix: "Personal care + Time Bank + visits + wellness" },
              { tier: "Comprehensive", price: "$3,500-9,000/mo", who: "Complex clinical needs", mix: "Skilled + personal + Time Bank + wellness" }
            ].map((t, i) => (
              <div 
                key={i} 
                onClick={() => scrollToJoin("join", `I am interested in exploring the ${t.tier} tier for my family.`)}
                style={{ background: C.card, border: `1px solid ${C.border}`, padding: 24, borderRadius: 8, cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.sage; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h4 style={{ fontFamily: ff, fontSize: 18, fontWeight: 600, color: C.t1, marginBottom: 8 }}>{t.tier}</h4>
                  <span style={{ color: C.sage, fontSize: 18 }}>→</span>
                </div>
                <div style={{ fontFamily: fs, fontSize: 14, fontWeight: 700, color: C.sage, marginBottom: 12 }}>{t.price}</div>
                <div style={{ fontFamily: fs, fontSize: 13, color: C.t2, marginBottom: 8 }}><strong>Who:</strong> {t.who}</div>
                <div style={{ fontFamily: fs, fontSize: 13, color: C.t2 }}><strong>Mix:</strong> {t.mix}</div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div>
            <h3 style={{ fontFamily: ff, fontSize: 24, fontWeight: 700, color: C.t1, marginBottom: 24 }}>Frequently Asked Questions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { q: "Does Medicare cover this?", a: "Traditional Medicare (Parts A and B) does not cover non-medical home care. However, if your loved one qualifies for PACE (Program of All-Inclusive Care for the Elderly), our services can be covered through our partnership with TRU PACE. Additionally, our Medical Director's Letter of Medical Necessity makes many of our services HSA/FSA eligible, saving you 28-36% in taxes." },
                { q: "What makes the Conductor different from a regular family caregiver?", a: "A Conductor is trained, equipped, and integrated into the care team. Instead of just guessing, you have access to the same dashboard the professionals use. You can take certification modules to learn safe transfers or dementia communication, making your visits safer and more effective." },
                { q: "Is it the same person every time?", a: "Yes. Because our professional caregivers are worker-owners with equity and benefits, our turnover is a fraction of the industry average. You build a real relationship with a consistent team." },
                { q: "What if I have no Time Bank credits?", a: "Your $100 annual membership includes a floor of 40 hours per year. If you need more and can't earn them, you can buy them at $15/hr, or use up to 20 hours of deficit spending (to be repaid in 6 months). In a true crisis, the Respite Emergency Fund provides 48 hours free." },
                { q: "What about the yoga and wellness stuff?", a: "co-op.care isn't just about surviving; it's about thriving. We partner with local community centers (like the JCC and rec centers) for wellness programs. Our Medical Director can write a Letter of Medical Necessity for these programs, making them HSA/FSA eligible." },
                { q: "What if I'm far away?", a: "You can still be the Conductor. The dashboard lets you coordinate care from anywhere. You can manage the wallet, approve Time Bank matches, and communicate with the W-2 professionals. You can even earn Time Bank credits remotely by providing phone companionship or tech support to other members in the cooperative." },
                { q: "What does 'worker-owned cooperative' actually mean?", a: "It means the professional caregivers own the company. They receive Subchapter T patronage dividends (equity) based on the hours they work. This aligns incentives: they provide better care, they stay longer, and the wealth generated stays in the community." }
              ].map((item, i) => (
                <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
                  <button onClick={() => setFaq(faq === i ? null : i)} style={{ width: "100%", background: "transparent", border: "none", padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left" }}>
                    <span style={{ fontFamily: fs, fontSize: 15, fontWeight: 600, color: C.t1 }}>{item.q}</span>
                    <span style={{ color: C.sage }}>{faq === i ? "▴" : "▾"}</span>
                  </button>
                  {faq === i && (
                    <div style={{ padding: "0 20px 20px", fontFamily: fs, fontSize: 14, color: C.t2, lineHeight: 1.6, animation: "fadeUp 0.2s ease-out" }}>
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: JOIN */}
      <section id="join-section" style={{ background: C.dark, padding: isMobile ? "64px 24px" : "100px 24px", color: C.w, textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {!emailPath && !sent && (
            <>
              <h2 style={{ fontFamily: ff, fontSize: 36, fontWeight: 700, marginBottom: 16 }}>Choose Your Role in the Cooperative</h2>
              <p style={{ fontFamily: fs, fontSize: 16, color: C.t4, marginBottom: 40, lineHeight: 1.6 }}>
                co-op.care only works when the whole community participates. Whether you need care, want to give care, or provide community wellness, there is a place for you.
              </p>
              
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, textAlign: "left" }}>
                
                {/* Comfort Card Sign-up */}
                <div 
                  onClick={() => setEmailPath("comfortcard")} 
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  style={{ background: C.dk2, border: `2px solid ${C.sage}`, padding: 24, borderRadius: 8, cursor: "pointer", transition: "all 0.2s ease", gridColumn: isMobile ? "auto" : "span 2" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 20, background: C.sage, color: C.w, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💳</div>
                      <h3 style={{ fontFamily: ff, fontSize: 24, fontWeight: 700, color: C.w, margin: 0 }}>The Comfort Card</h3>
                    </div>
                    <div style={{ background: C.sage, color: C.w, padding: "4px 8px", borderRadius: 4, fontFamily: fs, fontSize: 12, fontWeight: 700 }}>BEST DEAL</div>
                  </div>
                  <p style={{ fontFamily: fs, fontSize: 15, color: C.t4, lineHeight: 1.5, marginBottom: 16 }}>
                    Get access to the full co-op.care platform, LMN tax savings, and the Time Bank. 
                    <strong> $59/month — or completely FREE if you contribute just 1 hour to the Time Bank per month.</strong>
                  </p>
                  <div style={{ fontFamily: fs, fontSize: 14, color: C.sage, fontWeight: 700 }}>Sign up for the Comfort Card →</div>
                </div>

                {/* Family Caregiver */}
                <div 
                  onClick={() => setEmailPath("join")} 
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                  style={{ background: C.dk2, border: `1px solid ${C.border}`, padding: 24, borderRadius: 8, cursor: "pointer", transition: "all 0.2s ease" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 20, background: C.t3, color: C.w, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🛡️</div>
                    <h3 style={{ fontFamily: ff, fontSize: 20, fontWeight: 600, color: C.w, margin: 0 }}>Family Caregiver</h3>
                  </div>
                  <p style={{ fontFamily: fs, fontSize: 14, color: C.t4, lineHeight: 1.5, marginBottom: 16 }}>
                    Become a Founding Family. Secure your spot in the first 200 families in Boulder to access the dashboard and W-2 professionals.
                  </p>
                  <div style={{ fontFamily: fs, fontSize: 13, color: C.w, fontWeight: 600 }}>$100 Refundable Deposit</div>
                </div>

                {/* Time Bank Neighbor */}
                <div 
                  onClick={() => setEmailPath("timebank")} 
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                  style={{ background: C.dk2, border: `1px solid ${C.copper}`, padding: 24, borderRadius: 8, cursor: "pointer", transition: "all 0.2s ease" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 20, background: C.copper, color: C.w, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤝</div>
                    <h3 style={{ fontFamily: ff, fontSize: 20, fontWeight: 600, color: C.w, margin: 0 }}>Time Bank Neighbor</h3>
                  </div>
                  <p style={{ fontFamily: fs, fontSize: 14, color: C.t4, lineHeight: 1.5, marginBottom: 16 }}>
                    Join for free. Earn hours by helping neighbors with meals, rides, or companionship. Port your existing Boulder Time Bank hours 1:1.
                  </p>
                  <div style={{ fontFamily: fs, fontSize: 13, color: C.copper, fontWeight: 600 }}>Free Membership</div>
                </div>

                {/* Wellness Provider */}
                <div 
                  onClick={() => setEmailPath("wellness")} 
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                  style={{ background: C.dk2, border: `1px solid ${C.rose}`, padding: 24, borderRadius: 8, cursor: "pointer", transition: "all 0.2s ease" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 20, background: C.rose, color: C.w, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🧘</div>
                    <h3 style={{ fontFamily: ff, fontSize: 20, fontWeight: 600, color: C.w, margin: 0 }}>Wellness Provider</h3>
                  </div>
                  <p style={{ fontFamily: fs, fontSize: 14, color: C.t4, lineHeight: 1.5, marginBottom: 16 }}>
                    Yoga instructors, nutritionists, therapists: Register your brand. Our Medical Director's LMN makes your services HSA/FSA eligible.
                  </p>
                  <div style={{ fontFamily: fs, fontSize: 13, color: C.rose, fontWeight: 600 }}>Advertise Services & Get LMN</div>
                </div>

                {/* Professional Caregiver */}
                <div 
                  onClick={() => setEmailPath("pro")} 
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                  style={{ background: C.dk2, border: `1px solid ${C.blue}`, padding: 24, borderRadius: 8, cursor: "pointer", transition: "all 0.2s ease" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 20, background: C.blue, color: C.w, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🩺</div>
                    <h3 style={{ fontFamily: ff, fontSize: 20, fontWeight: 600, color: C.w, margin: 0 }}>Professional Caregiver</h3>
                  </div>
                  <p style={{ fontFamily: fs, fontSize: 14, color: C.t4, lineHeight: 1.5, marginBottom: 16 }}>
                    CNAs, RNs, and experienced caregivers: Stop working for agencies that take 50%. Become a worker-owner with W-2 status, health insurance, and equity.
                  </p>
                  <div style={{ fontFamily: fs, fontSize: 13, color: C.blue, fontWeight: 600 }}>$25-28/hr + Equity</div>
                </div>

                {/* Employer / HR */}
                <div 
                  onClick={() => setEmailPath("employer")} 
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                  style={{ background: C.dk2, border: `1px solid ${C.gold}`, padding: 24, borderRadius: 8, cursor: "pointer", transition: "all 0.2s ease" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 20, background: C.gold, color: C.w, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏢</div>
                    <h3 style={{ fontFamily: ff, fontSize: 20, fontWeight: 600, color: C.w, margin: 0 }}>Employer / HR</h3>
                  </div>
                  <p style={{ fontFamily: fs, fontSize: 14, color: C.t4, lineHeight: 1.5, marginBottom: 16 }}>
                    Support your caregiving employees. Reduce absenteeism and turnover by offering co-op.care as a PEPM benefit.
                  </p>
                  <div style={{ fontFamily: fs, fontSize: 13, color: C.gold, fontWeight: 600 }}>Explore Employer Plans</div>
                </div>

                {/* Community Leader */}
                <div 
                  onClick={() => setEmailPath("leader")} 
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                  style={{ background: C.dk2, border: `1px solid ${C.stone}`, padding: 24, borderRadius: 8, cursor: "pointer", transition: "all 0.2s ease" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 20, background: C.stone, color: C.w, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏛️</div>
                    <h3 style={{ fontFamily: ff, fontSize: 20, fontWeight: 600, color: C.w, margin: 0 }}>Community Leader</h3>
                  </div>
                  <p style={{ fontFamily: fs, fontSize: 14, color: C.t4, lineHeight: 1.5, marginBottom: 16 }}>
                    Faith leaders, local government, and non-profits: Partner with us to build a resilient care infrastructure in your community.
                  </p>
                  <div style={{ fontFamily: fs, fontSize: 13, color: C.stone, fontWeight: 600 }}>Partner with Us</div>
                </div>

              </div>

              <div style={{ marginTop: 24 }}>
                <button onClick={() => setEmailPath("start")} style={{ background: "transparent", color: C.w, border: `1px solid ${C.t3}`, padding: "12px 24px", borderRadius: 8, fontFamily: fs, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Not in Boulder? Start a Co-op in Your Community →
                </button>
              </div>
            </>
          )}

          {emailPath && !sent && (
            <form onSubmit={handleEmailSubmit} style={{ textAlign: "left", animation: "fadeUp 0.3s ease-out", background: C.dk2, padding: isMobile ? 24 : 40, borderRadius: 12, border: `1px solid ${C.t3}`, maxWidth: 500, margin: "0 auto" }}>
              <button type="button" onClick={() => setEmailPath(null)} style={{ background: "transparent", border: "none", color: C.t4, cursor: "pointer", marginBottom: 16, fontFamily: fs, padding: 0 }}>← Back to Roles</button>
              
              <h2 style={{ fontFamily: ff, fontSize: 28, fontWeight: 700, marginBottom: 8, color: C.w }}>
                {emailPath === "comfortcard" ? "Get the Comfort Card" :
                 emailPath === "join" ? "Secure Your Founding Family Spot" : 
                 emailPath === "timebank" ? "Join the Time Bank (Free)" : 
                 emailPath === "wellness" ? "Register Your Wellness Brand" :
                 emailPath === "pro" ? "Apply as a Worker-Owner" :
                 emailPath === "employer" ? "Explore Employer Plans" :
                 emailPath === "leader" ? "Partner with Us" :
                 "Start a Co-op"}
              </h2>
              
              <p style={{ fontFamily: fs, fontSize: 14, color: C.t4, marginBottom: 24, lineHeight: 1.5 }}>
                {emailPath === "comfortcard" ? "Sign up for the Comfort Card at $59/month. Remember, your membership is completely FREE if you contribute just 1 hour to the Time Bank per month." :
                 emailPath === "join" ? "Place your $100 refundable deposit to secure one of the first 200 spots in Boulder. This guarantees your family access to the platform, W-2 professionals, and the LMN tax moat." : 
                 emailPath === "timebank" ? "Create your free account. You'll be able to port existing Time Bank hours or start earning immediately by helping neighbors." : 
                 emailPath === "wellness" ? "List your services in our marketplace. We'll review your offerings to see if they qualify for our Medical Director's Letter of Medical Necessity (LMN), making them HSA/FSA eligible for our members." :
                 emailPath === "pro" ? "Join the waitlist for our first cohort of worker-owners. W-2 employment, $25-28/hr, health insurance, and Subchapter T patronage dividends." :
                 emailPath === "employer" ? "Let's discuss how co-op.care can support your employees and reduce absenteeism. We'll reach out to schedule a consultation." :
                 emailPath === "leader" ? "We're looking for community partners to help build a resilient care infrastructure. Tell us a bit about your organization." :
                 "Join the Federation waitlist to get the playbook for launching co-op.care in your city."}
              </p>

              {/* Google Sign In */}
              <button type="button" onClick={(e) => {
                e.preventDefault();
                handleGoogleSignIn(emailPath || "join");
              }} style={{ width: "100%", background: C.w, color: C.dark, border: "none", padding: "12px", borderRadius: 4, fontFamily: fs, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google (1-Click)
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <div style={{ flex: 1, height: 1, background: C.t3, opacity: 0.3 }}></div>
                <div style={{ fontFamily: fs, fontSize: 12, color: C.t4 }}>OR USE EMAIL</div>
                <div style={{ flex: 1, height: 1, background: C.t3, opacity: 0.3 }}></div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: fs, fontSize: 13, marginBottom: 8, color: C.t2 }}>Name</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 4, border: `1px solid ${C.t3}`, fontFamily: fs, background: C.dark, color: C.w }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: fs, fontSize: 13, marginBottom: 8, color: C.t2 }}>Email</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 4, border: `1px solid ${C.t3}`, fontFamily: fs, background: C.dark, color: C.w }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontFamily: fs, fontSize: 13, marginBottom: 8, color: C.t2 }}>City, State</label>
                <input required type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 4, border: `1px solid ${C.t3}`, fontFamily: fs, background: C.dark, color: C.w }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontFamily: fs, fontSize: 13, marginBottom: 8, color: C.t2 }}>{emailPath === "join" ? "What's your situation? (Optional)" : "Additional Notes (Optional)"}</label>
                <textarea rows={4} value={form.note} onChange={e => setForm({...form, note: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 4, border: `1px solid ${C.t3}`, fontFamily: fs, background: C.dark, color: C.w }} />
              </div>
              
              <button type="submit" style={{ width: "100%", background: emailPath === "comfortcard" ? C.sage : emailPath === "join" ? C.w : emailPath === "timebank" ? C.copper : emailPath === "wellness" ? C.rose : emailPath === "pro" ? C.blue : emailPath === "employer" ? C.gold : emailPath === "leader" ? C.stone : C.w, color: (emailPath === "start" || emailPath === "join") ? C.dark : C.w, border: "none", padding: "16px", borderRadius: 4, fontFamily: fs, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
                {emailPath === "comfortcard" ? "Get the Comfort Card" : emailPath === "join" ? "Pay $100 Deposit" : "Complete Registration"}
              </button>
            </form>
          )}

          {sent && (
            <div style={{ background: C.dk2, padding: 48, borderRadius: 12, border: `1px solid ${C.sage}`, animation: "fadeUp 0.3s ease-out", maxWidth: 500, margin: "0 auto" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
              <h3 style={{ fontFamily: ff, fontSize: 24, fontWeight: 700, color: C.sage, marginBottom: 16 }}>You're on the list.</h3>
              <p style={{ fontFamily: fs, fontSize: 16, color: C.t4, lineHeight: 1.6 }}>
                We'll be in touch shortly with next steps. In the meantime, share this with your neighbors. Co-ops only work when we build them together.
              </p>
              <button onClick={() => { setSent(false); setEmailPath(null); setForm({name:"", email:"", city:"", note:""}); }} style={{ marginTop: 24, background: "transparent", border: `1px solid ${C.t3}`, color: C.w, padding: "8px 16px", borderRadius: 4, cursor: "pointer", fontFamily: fs }}>Back to Home</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
