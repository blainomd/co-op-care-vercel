import React, { useState } from "react";
import { C, ff, fs, useIsMobile } from "./theme";

const PRINCIPLES = [
  { id: 1, name: "Activation Energy", bio: "Psychological friction preventing helping must be lowered. We reduce the initial barrier to entry so that taking the first step feels effortless and completely risk-free for every new member.", app: "Default enrollment (40 hrs), first action = 1 phone call, micro-tasks not commitments", script: "To get people to help, we have to lower the activation energy. We give everyone 40 hours upfront so they feel wealthy, and make the first ask incredibly small, like a 15-minute phone call.", nudges: [
    { title: "The 40-Hour Floor", desc: "By giving every member 40 hours upfront, we remove the 'I don't have enough to give' anxiety. They start with wealth.", cite: "Endowment Effect (Kahneman & Tversky, 1979)" },
    { title: "Micro-Task Onboarding", desc: "The first request is never 'drive someone to Denver.' It's 'call Mr. Torres for 15 minutes.' Low stakes, high reward.", cite: "Foot-in-the-Door Technique (Freedman & Fraser, 1966)" },
    { title: "Opt-Out Volunteering", desc: "When you join, you are automatically listed as available for remote tasks (like phone calls) unless you opt out.", cite: "Default Bias (Johnson & Goldstein, 2003)" }
  ]},
  { id: 2, name: "Substrate Specificity", bio: "People help more when the match is right. By aligning specific tasks with a person's unique skills and identity, we dramatically increase the likelihood of a positive response and long-term engagement.", app: "Skills-based matching, proximity weighting, identity-task alignment", script: "People don't want to do generic volunteering; they want to use their specific skills. We match requests to identities, asking a retired accountant to help with medical bills, not yard work.", nudges: [
    { title: "Identity-Task Alignment", desc: "We don't ask a retired accountant to do yard work. We ask them to help a family organize medical bills.", cite: "Self-Verification Theory (Swann, 1983)" },
    { title: "Hyper-Local Matching", desc: "Requests are routed to neighbors within a 2-mile radius first. Proximity increases the likelihood of a 'yes'.", cite: "Propinquity Effect (Festinger, Schachter, & Back, 1950)" },
    { title: "The 'Only You' Frame", desc: "Notifications say 'You are one of 3 people nearby with this skill' rather than 'Can someone do this?'", cite: "Bystander Effect Mitigation (Darley & Latané, 1968)" }
  ]},
  { id: 3, name: "Induced Fit", bio: "Both the enzyme and the substrate change shape during interaction. When someone helps a neighbor, their own self-perception shifts, solidifying their identity as an active, valuable community contributor.", app: "Post-interaction gratitude prompts, story capture, skill discovery", script: "When someone helps, it changes how they see themselves. We use automated gratitude loops and story capture to solidify their new identity as a community helper.", nudges: [
    { title: "The Gratitude Loop", desc: "After a task, the recipient is prompted to send a 1-tap thank you note. This solidifies the giver's identity as a helper.", cite: "Positive Reinforcement (Skinner, 1938)" },
    { title: "Skill Discovery", desc: "After 3 successful tasks, the app suggests a new, slightly harder task based on what similar users do.", cite: "Zone of Proximal Development (Vygotsky, 1978)" },
    { title: "Story Capture", desc: "We ask 'What was the best part of helping today?' and share the anonymized answers in the community feed.", cite: "Narrative Identity (McAdams, 2001)" }
  ]},
  { id: 4, name: "Catalytic Cycle", bio: "The enzyme is regenerated after each reaction, ready to act again. We build habit loops through instant feedback and streak tracking, ensuring that one act of helping naturally leads to the next.", app: "Streak tracking, instant credit notification, cascade visualization", script: "We want helping to become a habit. Instant credit notifications and streak tracking provide the dopamine hit needed to keep the cycle going.", nudges: [
    { title: "Instant Credit", desc: "The moment a task is marked complete, the giver's balance updates with a satisfying animation and sound.", cite: "Operant Conditioning (Skinner, 1938)" },
    { title: "Streak Tracking", desc: "Users see 'You've helped someone 3 weeks in a row!' This builds a habit.", cite: "Goal Gradient Effect (Hull, 1932)" },
    { title: "Cascade Visualization", desc: "Users can see how their 1 hour of help allowed another family to get 1 hour of respite. They see the chain.", cite: "Identifiable Victim Effect (Small & Loewenstein, 2003)" }
  ]},
  { id: 5, name: "Allosteric Regulation", bio: "External factors can either activate or inhibit the reaction. We use social proof to normalize helping behaviors, while actively monitoring for burnout to protect our most generous and vulnerable members.", app: "Social proof dashboard, public recognition, burnout detection", script: "Behavior is contagious. We use social proof dashboards to show that 'everyone is doing it,' while actively monitoring for burnout to protect our most generous members.", nudges: [
    { title: "Social Proof Feed", desc: "The app shows '3 neighbors helped out today' to normalize the behavior.", cite: "Social Norms Marketing (Perkins & Berkowitz, 1986)" },
    { title: "Burnout Detection", desc: "If a user gives more than 10 hours in a week, the app pauses requests and suggests they take a break.", cite: "Ego Depletion (Baumeister, 1998)" },
    { title: "Public Recognition", desc: "Top contributors get a special badge on their profile and a shoutout in the monthly newsletter.", cite: "Social Identity Theory (Tajfel & Turner, 1979)" }
  ]},
  { id: 6, name: "Cofactors & Coenzymes", bio: "Supporting infrastructure is required for the reaction to occur safely. Trust is the essential cofactor; without background checks, GPS tracking, and two-way ratings, the perceived risk halts all community interaction.", app: "Background checks, GPS tracking, two-way ratings", script: "Trust is the cofactor that makes the whole system work. Background checks, two-way ratings, and GPS tracking reduce the perceived risk of letting a stranger into your home.", nudges: [
    { title: "Trust Infrastructure", desc: "Visible background check badges and verified identities reduce the perceived risk of letting a stranger in.", cite: "Signaling Theory (Spence, 1973)" },
    { title: "Two-Way Ratings", desc: "Both giver and receiver rate the interaction, ensuring accountability and safety.", cite: "Reputation Systems (Resnick & Zeckhauser, 2002)" },
    { title: "GPS Tracking", desc: "For rides and visits, real-time tracking provides peace of mind for the family Conductor.", cite: "Uncertainty Reduction Theory (Berger & Calabrese, 1975)" }
  ]},
  { id: 7, name: "Product Inhibition", bio: "The accumulation of product slows down the reaction. If users hoard their earned credits, the system stalls. We use graduated expiry and deficit nudges to keep liquidity flowing through the network.", app: "Deficit nudges, reciprocity norm framing, graduated credit expiry", script: "If people hoard credits, the system stalls. We use graduated expiry and deficit nudges to ensure hours keep flowing through the community.", nudges: [
    { title: "Deficit Nudges", desc: "When a user hits -10 hours, they get a gentle prompt: 'Your community has supported you! Ready to give back?'", cite: "Reciprocity Norm (Gouldner, 1960)" },
    { title: "Graduated Expiry", desc: "Credits don't expire all at once, but slowly depreciate after 12 months to encourage continuous engagement.", cite: "Loss Aversion (Kahneman & Tversky, 1979)" },
    { title: "Donation Option", desc: "Users with excess credits can donate them to the Respite Emergency Fund, feeling good about their surplus.", cite: "Warm Glow Giving (Andreoni, 1990)" }
  ]},
  { id: 8, name: "Michaelis-Menten Kinetics", bio: "Capacity curves and critical mass dictate system efficiency. We focus on hyper-local density to ensure requests are matched quickly, maintaining trust in the platform's reliability and responsiveness.", app: "Match-time SLA (4hr target), hub density (1 per 50 households), coordinator dashboard", script: "Liquidity requires density. We focus on hyper-local hubs to achieve 1 member per 50 households, ensuring requests are matched within our 4-hour SLA.", nudges: [
    { title: "The 4-Hour SLA", desc: "Requests must be matched within 4 hours to build trust in the system's reliability.", cite: "Service Level Agreements (ITIL)" },
    { title: "Hub Density", desc: "We focus marketing on specific neighborhoods until we hit 1 user per 50 households, ensuring liquidity.", cite: "Network Effects (Metcalfe's Law)" },
    { title: "Coordinator Dashboard", desc: "A human coordinator monitors unmatched requests and manually intervenes before the SLA breaches.", cite: "Human-in-the-Loop AI" }
  ]},
  { id: 9, name: "Cascade Amplification", bio: "Signal amplification occurs through visible chains of impact. By showing members how their single action enabled a cascade of community support, we drive organic growth and story-driven recruitment.", app: "Visible impact chains, story-driven recruitment, refer-a-neighbor after 3rd interaction", script: "Growth happens through stories, not ads. We show members the visible impact chain of their actions, prompting them to refer neighbors after their third successful task.", nudges: [
    { title: "Refer-a-Neighbor", desc: "After their 3rd successful task, users are prompted to invite a friend, earning 10 bonus hours.", cite: "Viral Loop (Bly, 2007)" },
    { title: "Story-Driven Recruitment", desc: "We use real stories of impact in our marketing, not abstract concepts.", cite: "Narrative Persuasion (Green & Brock, 2000)" },
    { title: "Visible Impact Chains", desc: "Showing how one action led to another creates a sense of belonging to a larger movement.", cite: "Meaning Making (Frankl, 1946)" }
  ]},
  { id: 10, name: "Evolutionary Optimization", bio: "Natural selection improves efficiency over time. As a cooperative, members vote on platform features, creating a sense of ownership and psychological safety that allows us to test and iterate rapidly.", app: "A/B test everything, quarterly member vote, failure celebration", script: "The cooperative model means the members own the platform. We use quarterly votes on new features to increase their sense of ownership and psychological safety.", nudges: [
    { title: "A/B Testing", desc: "We constantly test different nudges, copy, and matching algorithms to see what drives the most engagement.", cite: "Continuous Improvement (Kaizen)" },
    { title: "Quarterly Member Vote", desc: "Members vote on which new features to build next, increasing their sense of ownership.", cite: "IKEA Effect (Norton, Mochon, & Ariely, 2012)" },
    { title: "Failure Celebration", desc: "We openly share when an experiment fails, building trust through transparency.", cite: "Psychological Safety (Edmondson, 1999)" }
  ]},
  { id: 11, name: "Time Bank Liquidity", bio: "The Hourworld and legacy migration strategy. By allowing legacy time bank users to port their hours into our clinical-grade system, we acquire highly altruistic users at zero customer acquisition cost.", app: "Vampire porting, care-grade framing, respite defaults, use-it-or-donate-it", script: "We don't need to build a network from scratch. By allowing legacy time bank users to port their hours into our clinical-grade system, we acquire highly altruistic users at zero cost.", nudges: [
    { title: "The Vampire Port", desc: "Allow Boulder Time Bank / Hourworld users to port their existing hours 1:1 into co-op.care, but ONLY after passing our background check. They instantly feel wealthy in our system and abandon the legacy UI. Zero CAC acquisition of highly altruistic users.", cite: "Endowment Effect (Kahneman & Tversky, 1979)" },
    { title: "Care-Grade Framing", desc: "Position legacy time banks as 'casual' (mowing lawns) and co-op.care as 'Clinical/Care-Grade' (HIPAA-compliant, verified). This justifies our subscription fee and creates a premium moat.", cite: "Framing Effect (Tversky & Kahneman, 1981)" },
    { title: "The Respite Default", desc: "When a user earns an hour, the UI defaults to keeping 0.9 hours and donating 0.1 hours to the 'Community Emergency Respite Pool'. People rarely uncheck the default, ensuring the system always has liquidity for families in crisis.", cite: "Choice Architecture (Thaler & Sunstein, 2008)" },
    { title: "Use-It-Or-Donate-It", desc: "Hours decay after 12 months. To avoid 'losing' them, users are prompted to donate them to a family in crisis. This prevents the macroeconomic hoarding that bankrupts legacy time banks.", cite: "Loss Aversion (Kahneman & Tversky, 1979)" }
  ]}
];

const CASCADE = [
  { step: "1. Seed", desc: "40 founding families join, each receiving 40 hours. The system is primed with 1,600 hours of liquidity.", prin: "Activation Energy" },
  { step: "2. First Reaction", desc: "A family uses 4 hours for meals after a hospital discharge. The system proves it works.", prin: "Michaelis-Menten Kinetics" },
  { step: "3. Catalytic Cycle", desc: "The family feels grateful and the Conductor does 1 hour of remote tech support to give back.", prin: "Product Inhibition" },
  { step: "4. Induced Fit", desc: "The Conductor realizes they enjoy helping and identify as a 'Time Bank Member', not just a consumer.", prin: "Induced Fit" },
  { step: "5. Allosteric Activation", desc: "A local church adopts the Time Bank, bringing in 20 new members who want to help.", prin: "Allosteric Regulation" },
  { step: "6. Critical Mass", desc: "The neighborhood hits 1 member per 50 households. Match times drop below 2 hours.", prin: "Substrate Specificity" },
  { step: "7. Cascade Amplification", desc: "Members invite friends. Stories of impact spread. The network grows organically.", prin: "Cascade Amplification" },
  { step: "8. Self-Sustaining", desc: "Surplus cash from $15/hr purchases funds the coordination platform and Respite Fund.", prin: "Evolutionary Optimization" }
];

export default function Enzyme() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState(0);
  const [expandedNudge, setExpandedNudge] = useState<number | null>(null);
  const [activeCascade, setActiveCascade] = useState(0);
  const [emailPath, setEmailPath] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", note: "" });

  const [playingId, setPlayingId] = useState<number | null>(null);
  const synthRef = React.useRef<SpeechSynthesis | null>(null);
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  React.useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const handlePlay = (id: number, text: string) => {
    if (!synthRef.current) return;
    if (playingId === id) {
      synthRef.current.cancel();
      setPlayingId(null);
    } else {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setPlayingId(null);
      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
      setPlayingId(id);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent, overrideForm?: any) => {
    e.preventDefault();
    const data = overrideForm || form;
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          city: "N/A",
          note: `[Enzyme Thesis / Research] ${data.note}`
        })
      });
      alert("Message received! We will be in touch shortly.");
      setEmailPath(null);
      setForm({ name: "", email: "", note: "" });
    } catch (error) {
      console.error("Submission error:", error);
      alert("There was an issue submitting your form. Please email blaine@co-op.care directly.");
    }
  };

  const handleGoogleSignIn = async () => {
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
            note: form.note 
          };
          setForm(mockForm);
          // Auto submit
          await handleEmailSubmit(
            { preventDefault: () => {} } as React.FormEvent,
            mockForm
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

  return (
    <div style={{ background: C.bg, minHeight: "100vh", animation: "fadeUp 0.3s ease-out" }}>
      {/* Header */}
      <header style={{ background: C.dark, color: C.w, padding: isMobile ? "48px 24px" : "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 11, color: C.sage, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, fontFamily: fs }}>Behavioral Design</div>
          <h1 style={{ fontFamily: ff, fontSize: isMobile ? 32 : 48, fontWeight: 700, marginBottom: 24 }}>The Enzyme Thesis</h1>
          <p style={{ fontFamily: fs, fontSize: 18, color: C.t4, lineHeight: 1.6, fontStyle: "italic" }}>
            "Every person in Boulder has something to give. The reaction is thermodynamically favorable. But the activation energy is too high. co-op.care is the enzyme."
          </p>
        </div>
      </header>

      {/* 11 Principles Tabs */}
      <div style={{ position: "sticky", top: 48, zIndex: 99, background: `${C.bg}ee`, backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.border}`, padding: "16px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
          {PRINCIPLES.map((p, i) => (
            <button key={i} onClick={() => { setActiveTab(i); setExpandedNudge(null); }} style={{ background: activeTab === i ? C.sage : "transparent", color: activeTab === i ? C.w : C.t2, border: `1px solid ${activeTab === i ? C.sage : C.border}`, padding: "8px 16px", borderRadius: 20, fontFamily: fs, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s ease" }}>
              {p.id}. {p.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px" }}>
        {/* Active Principle Content */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: isMobile ? 24 : 40, marginBottom: 48, animation: "fadeUp 0.3s ease-out" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
            <h2 style={{ fontFamily: ff, fontSize: 28, fontWeight: 700, color: C.t1, margin: 0 }}>{PRINCIPLES[activeTab].id}. {PRINCIPLES[activeTab].name}</h2>
            <button 
              onClick={() => handlePlay(PRINCIPLES[activeTab].id, PRINCIPLES[activeTab].script)}
              style={{ background: playingId === PRINCIPLES[activeTab].id ? C.sage : "transparent", color: playingId === PRINCIPLES[activeTab].id ? C.w : C.sage, border: `1px solid ${C.sage}`, padding: "8px 16px", borderRadius: 20, fontFamily: fs, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s ease" }}
            >
              {playingId === PRINCIPLES[activeTab].id ? "■ Stop Narration" : "▶ Play Narration"}
            </button>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 24, marginBottom: 40 }}>
            <div style={{ background: C.blueLt, padding: 20, borderRadius: 8, borderLeft: `4px solid ${C.blue}` }}>
              <div style={{ fontFamily: fs, fontSize: 11, fontWeight: 700, color: C.blue, textTransform: "uppercase", marginBottom: 8 }}>Biology Layer</div>
              <div style={{ fontFamily: fs, fontSize: 14, color: C.t1, fontWeight: 500 }}>{PRINCIPLES[activeTab].bio}</div>
            </div>
            <div style={{ background: C.copperBg, padding: 20, borderRadius: 8, borderLeft: `4px solid ${C.copper}` }}>
              <div style={{ fontFamily: fs, fontSize: 11, fontWeight: 700, color: C.copper, textTransform: "uppercase", marginBottom: 8 }}>Behavioral Mapping</div>
              <div style={{ fontFamily: fs, fontSize: 14, color: C.t1, fontWeight: 500 }}>{PRINCIPLES[activeTab].bio}</div> {/* Using bio again as placeholder for behavioral mapping if not explicitly separated in data */}
            </div>
            <div style={{ background: C.sageBg, padding: 20, borderRadius: 8, borderLeft: `4px solid ${C.sage}` }}>
              <div style={{ fontFamily: fs, fontSize: 11, fontWeight: 700, color: C.sage, textTransform: "uppercase", marginBottom: 8 }}>Time Bank Application</div>
              <div style={{ fontFamily: fs, fontSize: 14, color: C.t1, fontWeight: 500 }}>{PRINCIPLES[activeTab].app}</div>
            </div>
          </div>

          <h3 style={{ fontFamily: ff, fontSize: 20, fontWeight: 600, color: C.t1, marginBottom: 16 }}>Behavioral Nudges</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PRINCIPLES[activeTab].nudges.map((n, i) => (
              <div key={i} style={{ border: `1px solid ${expandedNudge === i ? C.sage : C.border}`, borderRadius: 8, overflow: "hidden", transition: "all 0.2s ease" }}>
                <button onClick={() => setExpandedNudge(expandedNudge === i ? null : i)} style={{ width: "100%", background: expandedNudge === i ? C.sageBg : C.bg, border: "none", padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontFamily: fs, fontSize: 15, fontWeight: 600, color: C.t1 }}>{n.title}</span>
                  <span style={{ color: C.sage }}>{expandedNudge === i ? "▴" : "▾"}</span>
                </button>
                {expandedNudge === i && (
                  <div style={{ padding: "0 16px 16px", background: C.sageBg, animation: "fadeUp 0.2s ease-out" }}>
                    <p style={{ fontFamily: fs, fontSize: 14, color: C.t2, lineHeight: 1.6, margin: "0 0 12px" }}>{n.desc}</p>
                    <div style={{ fontFamily: fs, fontSize: 11, color: C.sage, fontStyle: "italic" }}>Citation: {n.cite}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Viral Adoption Cascade */}
        <div style={{ background: C.dark, borderRadius: 8, padding: isMobile ? 24 : 40, color: C.w }}>
          <div style={{ fontSize: 11, color: C.sage, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, fontFamily: fs }}>System Dynamics</div>
          <h2 style={{ fontFamily: ff, fontSize: 28, fontWeight: 700, marginBottom: 32 }}>Viral Adoption Cascade</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 32 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CASCADE.map((c, i) => (
                <button key={i} onClick={() => setActiveCascade(i)} style={{ background: activeCascade === i ? C.sage : "transparent", color: activeCascade === i ? C.w : C.t4, border: `1px solid ${activeCascade === i ? C.sage : "#4a453e"}`, padding: "12px 16px", borderRadius: 4, fontFamily: fs, fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "left", transition: "all 0.2s ease" }}>
                  {c.step}
                </button>
              ))}
            </div>
            
            <div style={{ background: C.dk2, padding: 32, borderRadius: 8, border: `1px solid #4a453e`, display: "flex", flexDirection: "column", justifyContent: "center", animation: "fadeUp 0.3s ease-out" }}>
              <div style={{ fontFamily: fs, fontSize: 12, color: C.sage, fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>{CASCADE[activeCascade].prin}</div>
              <h3 style={{ fontFamily: ff, fontSize: 24, fontWeight: 600, color: C.w, marginBottom: 16 }}>{CASCADE[activeCascade].step}</h3>
              <p style={{ fontFamily: fs, fontSize: 16, color: C.t4, lineHeight: 1.6 }}>{CASCADE[activeCascade].desc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Capture */}
      <section style={{ background: C.cream, padding: "64px 24px", textAlign: "center", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: ff, fontSize: 28, fontWeight: 700, color: C.t1, marginBottom: 24 }}>Collaborate on the Research</h2>
          {!emailPath ? (
            <button onClick={() => setEmailPath("research")} style={{ background: C.sage, color: C.w, border: "none", padding: "16px 32px", borderRadius: 8, fontFamily: fs, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
              Connect with the Team
            </button>
          ) : (
            <form onSubmit={handleEmailSubmit} style={{ textAlign: "left", animation: "fadeUp 0.3s ease-out" }}>
              {/* Google Sign In */}
              <button type="button" onClick={(e) => {
                e.preventDefault();
                handleGoogleSignIn();
              }} style={{ width: "100%", background: C.w, color: C.dark, border: `1px solid ${C.border}`, padding: "12px", borderRadius: 4, fontFamily: fs, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google (1-Click)
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <div style={{ flex: 1, height: 1, background: C.border }}></div>
                <div style={{ fontFamily: fs, fontSize: 12, color: C.t4 }}>OR USE EMAIL</div>
                <div style={{ flex: 1, height: 1, background: C.border }}></div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: fs, fontSize: 13, color: C.t1, marginBottom: 8 }}>Name</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 4, border: `1px solid ${C.border}`, fontFamily: fs }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: fs, fontSize: 13, color: C.t1, marginBottom: 8 }}>Email</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 4, border: `1px solid ${C.border}`, fontFamily: fs }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontFamily: fs, fontSize: 13, color: C.t1, marginBottom: 8 }}>Note (Optional)</label>
                <textarea rows={3} value={form.note} onChange={e => setForm({...form, note: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 4, border: `1px solid ${C.border}`, fontFamily: fs }} />
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <button type="button" onClick={() => setEmailPath(null)} style={{ flex: 1, background: "transparent", color: C.sage, border: `1px solid ${C.sage}`, padding: 12, borderRadius: 4, fontFamily: fs, fontWeight: 600, cursor: "pointer" }}>Back</button>
                <button type="submit" style={{ flex: 2, background: C.sage, color: C.w, border: "none", padding: 12, borderRadius: 4, fontFamily: fs, fontWeight: 600, cursor: "pointer" }}>Send Message</button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
