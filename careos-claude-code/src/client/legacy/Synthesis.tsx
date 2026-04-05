import React, { useState } from "react";
import { C, ff, fs, useIsMobile } from "./theme";

const THROUGHLINES = [
  {
    id: "zero-cac",
    name: "The Zero-CAC Growth Loop",
    color: C.sage,
    desc: "How we acquire users for free at the point of crisis by solving the hospital's most expensive problem.",
    nodes: ["psy-activation", "psy-proximity", "prod-discharge", "prod-respite", "mac-bch", "mac-viral"]
  },
  {
    id: "tax-moat",
    name: "The 30% Tax Moat",
    color: C.copper,
    desc: "How we lock in users by making the entire community wellness ecosystem HSA/FSA eligible.",
    nodes: ["psy-loss", "psy-identity", "prod-lmn", "prod-renewal", "mac-tax", "mac-retention"]
  },
  {
    id: "margin-engine",
    name: "The Predictive Margin Engine",
    color: C.gold,
    desc: "How we capture shared savings from PACE by predicting and preventing hospitalizations.",
    nodes: ["psy-trust", "psy-streak", "prod-wearable", "prod-predictive", "mac-pace", "mac-val"]
  },
  {
    id: "labor-supply",
    name: "The Viral Labor Supply",
    color: C.blue,
    desc: "How we solve the caregiver shortage by turning passive consumers into active community members.",
    nodes: ["psy-endowment", "psy-cascade", "prod-timebank", "prod-cert", "mac-ubi", "mac-turnover"]
  }
];

const NODE_DETAILS: Record<string, { what: string, how: string, omaha?: string, icd10?: string, metric?: string, feeds?: string, formula?: string, targetPage: string }> = {
  "psy-activation": {
    what: "The first Time Bank task must require <15 minutes, zero travel, zero skill. \"Call Mr. Torres for 15 minutes.\" The acceptance rate of this micro-task determines the health of the entire system.",
    how: "Push notification with task card. One-tap accept. Phone number auto-revealed via Twilio. Timer starts on call connect. Auto-credit on call end.",
    omaha: "#06 Social Contact — phone companionship directly addresses social isolation. KBS Behavior subscale improves with each completed call.",
    icd10: "Z60.2 (Problems related to living alone), Z60.4 (Social exclusion)",
    metric: "First-task acceptance rate (target >60%), time-to-first-task (<24 hours from signup)",
    feeds: "psy-streak (first task starts the streak), prod-timebank (first credit earned)",
    targetPage: "enzyme"
  },
  "psy-endowment": {
    what: "The moment membership confirms, the Time Bank balance animates from 0 to 40 hours. The psychological frame: \"You HAVE 40 hours of community care\" — not \"you CAN REQUEST up to 40 hours.\" Wealth framing, not allowance framing.",
    how: "Stripe webhook → PostgreSQL balance update → WebSocket push → frontend counter animation.",
    omaha: "#13 Caretaking/Parenting — the 40-hour floor reduces caregiver anxiety at the structural level.",
    icd10: "Z63.6 (Dependent relative needing care at home), Z73.0 (Burnout)",
    metric: "First-spend latency (how fast do new members use hour #1?), hoarding rate (do they spend or save?)",
    feeds: "psy-activation (the floor enables the first micro-task), mac-ubi (the 40-hour floor IS the Care UBI)",
    targetPage: "enzyme"
  },
  "psy-proximity": {
    what: "Time Bank matching weights proximity above all other factors. <0.5 mi = 3× score boost. 0.5-1.0 mi = 2×. 1-2 mi = 1×. Beyond 2 mi = remote tasks only. The closer the neighbor, the more likely they say yes, the more likely they become a friend, the more likely they keep helping.",
    how: "PostgreSQL geospatial query: geo::distance(user.location, task.location). Real-time recalculation. Results sorted by proximity-weighted match score.",
    omaha: "#04 Neighborhood Safety, #03 Residence — proximity matching builds neighborhood-level social infrastructure.",
    icd10: "Z59.89 (Problems related to housing and economic circumstances)",
    metric: "Average match distance, completion rate by distance bracket, repeat-pair rate (same helper↔family)",
    feeds: "psy-trust (proximity builds familiarity), mac-viral (neighbors recruit neighbors)",
    targetPage: "enzyme"
  },
  "psy-loss": {
    what: "Two loss mechanisms. (1) Credit expiry: earned credits expire after 12 months. 30-day warning: \"4.5 hours expire. Use them or donate to Respite.\" (2) LMN expiry: \"Your LMN expires in 30 days. Without renewal, you lose $6,200/year in HSA tax savings.\" The LMN loss is the retention moat — nobody voluntarily gives up 28-36% tax savings.",
    how: "PostgreSQL scheduled jobs checking expiry dates. Tiered notifications (60/30/7 days). Auto-donation to Respite Fund on expiry.",
    omaha: "#35 Nutrition, #37 Physical Activity, #25 NMS — every LMN-eligible service has an Omaha problem justification that expires with the LMN.",
    icd10: "All ICD-10 codes on the LMN become inactive on expiry. Renewal re-activates them.",
    metric: "Spend velocity increase in final 30 days, LMN renewal rate (target >90%), churn rate of lapsed LMN members",
    feeds: "prod-renewal (the renewal workflow), mac-retention (the financial moat), mac-tax (the 28-36% savings)",
    targetPage: "enzyme"
  },
  "psy-identity": {
    what: "During Time Bank onboarding, members complete \"I enjoy...\" (NOT \"I'm willing to...\"). Retired teacher → tutoring. Car enthusiast → driving. Gardener → yard work. The algorithm matches identity to task. People who help in alignment with their identity help more, longer, and with higher satisfaction.",
    how: "Skills array in PostgreSQL. Matching query weights taskType ∈ user.skills by 2×. Post-task satisfaction tracked per skill type — algorithm learns.",
    omaha: "#07 Role Change — the Conductor's identity transforms progressively through skill-aligned tasks and Conductor Certification.",
    icd10: "Z56.9 (Unspecified work-related problem) — caregiver role strain is a diagnosable condition.",
    metric: "Satisfaction by skill alignment, repeat acceptance by skill type, identity persistence over time",
    feeds: "prod-cert (Conductor Certification formalizes the identity shift), psy-streak (aligned tasks sustain streaks)",
    targetPage: "enzyme"
  },
  "psy-trust": {
    what: "Every Time Bank profile shows: ✓ Background Checked (with date), star rating (1-5 with count), \"Member since [date]\", neighborhood name. For worker-owners: W-2 Employee-Owner badge + equity tier. Trust signals reduce the perceived risk of letting a stranger help your mother.",
    how: "Checkr/Sterling API for background checks. Status in PostgreSQL. Badge auto-rendered. Rating = rolling 90-day weighted average.",
    omaha: "#06 Social Contact (trust enables interaction), #15 Abuse prevention (background checks are a safeguard)",
    icd10: "T74.01XA (Adult neglect prevention), T76.01XA (Suspected abuse — screening trigger)",
    metric: "Task acceptance with/without visible badge (A/B test), trust score × match success correlation",
    feeds: "prod-timebank (trust enables the first exchange), psy-activation (trust reduces activation energy)",
    targetPage: "enzyme"
  },
  "psy-streak": {
    what: "\"You've helped someone 4 weeks in a row! 🔥\" Streaks are weekly — any task in a 7-day window counts. Milestones at 4, 8, 12, 26, 52 weeks unlock community champion recognition. The coffee card effect: people accelerate effort as they approach the next milestone.",
    how: "PostgreSQL currentStreak + longestStreak. Cron job Monday 6 AM: did user complete a task in prior 7 days? Yes → increment. No → reset. Push notification on milestones.",
    omaha: "All intervention categories — streaks measure sustained helping behavior across all Omaha problem areas.",
    icd10: "Not directly mapped — streaks are a behavioral metric, not a clinical one.",
    metric: "Week-over-week retention (streakers vs non-streakers), average streak length, streak × referral correlation",
    feeds: "psy-cascade (long-streak members are most likely to refer), mac-turnover (streak culture retains the community)",
    targetPage: "enzyme"
  },
  "psy-cascade": {
    what: "After the 3rd completed task: \"Know someone who'd be great at this? Invite a neighbor → you both get 5 bonus hours.\" The referral is a graph edge: RELATE user:lisa → referred → user:karen. The cascade visualization shows the chain: your help → their help → downstream impact across households.",
    how: "Referral tracking as PostgreSQL graph. Bonus hours on referee's first COMPLETED task (not signup). Cascade viz: SELECT →helped→*→helped→* FROM user:lisa — multi-hop graph traversal.",
    omaha: "#05 Communication with community resources — the referral network IS the community resource infrastructure.",
    icd10: "Not directly mapped — virality is a distribution metric.",
    metric: "Referral rate after 3rd task, referral conversion, cascade depth (average chain length), viral coefficient (referrals per member)",
    feeds: "mac-viral ($0 CAC), mac-ubi (each new member expands the Care UBI pool), prod-timebank (more members = better matching = lower match time)",
    targetPage: "enzyme"
  },
  "prod-discharge": {
    what: "BCH discharge → co-op.care care team assembled within 24-48 hours. Zero-CAC acquisition at the point of maximum family vulnerability and motivation.",
    how: "BCH Epic sends ADT via HL7 v2 or FHIR R4 Encounter. Aidbox receives, extracts ICD-10 codes, maps to Omaha problems via crosswalk engine, triggers onboarding workflow in PostgreSQL.",
    omaha: "ICD-10 → Omaha crosswalk auto-generates care plan. I50.9 → #27 Circulation. E11.9 → #35 Nutrition. Z87.39 → #25 NMS (fall history). F03.90 → #21 Cognition.",
    icd10: "All discharge diagnosis codes. The crosswalk handles the translation.",
    metric: "Time from discharge to care team assembly (target <48hr), 30-day readmission rate (target <10% vs BCH baseline 15.4%), conversion rate (discharge → founding family)",
    feeds: "mac-bch ($364K Y1 revenue), psy-activation (discharge family's first Time Bank task), all prod- nodes (discharge is entry to entire ecosystem)",
    targetPage: "product"
  },
  "prod-respite": {
    what: "Any family in crisis gets 48 hours of care immediately, regardless of balance. Funded by: $3 from every $15/hr purchase, 0.1 hrs auto-donated per earned hour (Respite Default nudge), expired credits.",
    how: "PostgreSQL singleton table. Auto-approve if balance >100 hours. Coordinator approval if <100. Dispatch: nearest worker-owner + Time Bank neighbor.",
    omaha: "Crisis triggers map to multiple problems simultaneously: #13 Caretaking (caregiver hospitalized), #25 NMS (fall), #27 Circulation (cardiac), #21 Cognition (acute confusion).",
    icd10: "Emergency diagnosis codes from ER/hospital admission. W19.XXXA (fall), I50.9 (heart failure), R41.0 (disorientation).",
    metric: "Response time (<4 hours), fund balance, disbursement frequency, crisis → membership conversion rate",
    feeds: "mac-ubi (the safety net that makes Care UBI real), psy-endowment (crisis families get immediate hours), psy-cascade (crisis stories are the most powerful recruitment)",
    targetPage: "product"
  },
  "prod-timebank": {
    what: "Double-entry ledger of earned, spent, bought, donated, expired hours. The engine behind the Care UBI. Every transaction is Omaha-coded for clinical outcome measurement.",
    how: "PostgreSQL timebank_account + timebank_tx + timebank_task. State machine: Posted → Matched → Accepted → In Progress (GPS check-in) → Completed (GPS check-out) → Rated → Credits transferred. Match latency SLA: <4 hours.",
    omaha: "Every task type auto-maps to an Omaha intervention. Meals → #28 Digestion-hydration. Rides → #05 Communication. Companionship → #06 Social Contact. This makes community care clinically documentable.",
    icd10: "Not directly — Time Bank transactions are coded at the Omaha level, which bridges to ICD-10 via the crosswalk when needed for PACE or CMS reporting.",
    metric: "Match latency, hours earned/spent/bought per week (velocity), active members per ZIP code, hours-to-match ratio",
    feeds: "All psy- nodes (Time Bank IS the behavioral engine), mac-ubi (Time Bank IS the Care UBI), mac-turnover (Time Bank displaces paid hours, reducing cost)",
    targetPage: "product"
  },
  "prod-lmn": {
    what: "Physician-governed marketplace making community wellness HSA/FSA eligible. The tax moat. Dr. Emdur writes one LMN covering all qualifying services for a family.",
    how: "Aidbox stores LMN as FHIR DocumentReference with ICD-10 codes, qualifying conditions, approved services, e-signature, expiration. Marketplace UI filters by member's LMN conditions.",
    omaha: "#25 NMS → tai chi (fall prevention). #35 Nutrition → RD counseling. #27 Circulation → cardiac rehab. #37 Physical Activity → fitness programs. #21 Cognition → cognitive stimulation. Each Omaha problem maps to qualifying wellness services.",
    icd10: "Z87.39 (falls) → tai chi. E11.9 (diabetes) → nutrition. I50.9 (CHF) → cardiac rehab. F03.90 (dementia) → cognitive programs. The crosswalk drives the Marketplace filtering.",
    metric: "LMN activation rate, annual HSA savings per family, marketplace booking volume, provider referral revenue (8-12%)",
    feeds: "mac-tax (28-36% savings), mac-retention (LMN is the moat), prod-renewal (annual renewal cycle)",
    targetPage: "product"
  },
  "prod-renewal": {
    what: "Automated 12-month renewal cycle. Notifications at 60/30/7 days. Auto-schedules telehealth with Dr. Emdur via Zoom. CRI reassessment updates Omaha KBS ratings. Renewed LMN re-activates HSA eligibility.",
    how: "Aidbox LMN expirationDate. PostgreSQL scheduled jobs. Zoom API for telehealth scheduling. CRI reassessment during telehealth.",
    omaha: "KBS reassessment across all LMN-qualifying problems. Knowledge/Behavior/Status scores at 0/6/12 months create longitudinal outcome data.",
    icd10: "All LMN ICD-10 codes reviewed and updated during renewal. New diagnoses added, resolved ones removed.",
    metric: "Renewal rate (target >90%), lapse-to-churn correlation, KBS improvement between renewals",
    feeds: "mac-retention (renewal IS retention), psy-loss (fear of losing tax savings drives renewal), mac-val (longitudinal KBS data feeds actuarial models)",
    targetPage: "product"
  },
  "prod-wearable": {
    what: "Apple Watch → continuous passive monitoring. Resting HR, HRV, sleep, steps, SpO2. Personal baselines. Anomaly detection at >2 standard deviations from 30-day rolling average.",
    how: "Apple HealthKit API → CareOS API → Aidbox as FHIR Observations (LOINC-coded). PostgreSQL for operational dashboard. Anomaly detection triggers alerts.",
    omaha: "HR/HRV → #27 Circulation. SpO2 → #26 Respiration. Sleep → #36 Sleep/Rest. Steps → #37 Physical Activity + #25 NMS.",
    icd10: "Anomalies generate clinical alerts mapped to ICD-10: elevated HR → I49.9 (cardiac arrhythmia workup). Low SpO2 → J96.10 (respiratory failure). Sleep decline → G47.00 (insomnia).",
    metric: "Anomalies detected, true positive rate, time from anomaly to intervention, hospitalizations predicted",
    feeds: "prod-predictive (wearable data IS the predictive model's primary input), mac-pace (wearable data enables PACE margin)",
    targetPage: "product"
  },
  "prod-predictive": {
    what: "ML model predicting hospitalization 72-96 hours in advance. Features: wearable trends + worker care notes (NLP) + Time Bank neighbor observations + CRI scores + medication adherence.",
    how: "Feature engineering from Aidbox (clinical) + PostgreSQL (operational). Model: XGBoost or time-series transformer. Daily risk score 0-100. Score >70 → Medical Director notification + additional worker visit + Conductor alert.",
    omaha: "UTI prediction: #30 Urinary + #36 Sleep + #21 Cognition + #27 Circulation. Fall prediction: #25 NMS + #37 Physical Activity + #42 Medication. Each prediction maps to Omaha problems for structured intervention.",
    icd10: "Predicted diagnoses trigger pre-emptive documentation. \"At risk for UTI\" → N39.0. \"At risk for fall\" → Z91.81. Pre-emptive ICD-10 coding enables early intervention billing.",
    metric: "Prediction accuracy (sensitivity/specificity), hospitalizations avoided, PACE savings per avoided event ($16,037)",
    feeds: "mac-pace (avoided hospitalizations = pure margin), mac-val (predictive model is the IP), prod-wearable (wearable data is primary input)",
    targetPage: "product"
  },
  "prod-cert": {
    what: "Modules: Safe Transfers (2hr/$150), Bathing (2hr/$150), Medication Management (3hr/$200), Dementia Communication (4hr/$250), Fall Prevention (2hr/$150), Emergency Response (2hr/$150), Comprehensive (full day/$750). All HSA/FSA eligible via LMN. 5 Time Bank bonus hours per module completed.",
    how: "LMS integration or custom module tracker. Video + in-person hybrid. Competency assessment. Certificate generation. PostgreSQL tracks modules. Aidbox stores as FHIR Procedure.",
    omaha: "Each module → Omaha Intervention Scheme \"Teaching/Guidance/Counseling.\" Safe Transfers → #25 NMS. Medication → #42 Prescribed Medication. Dementia → #21 Cognition. KBS Knowledge subscale improves measurably after each module.",
    icd10: "Training justification maps to caregiver burden: Z63.6 (dependent relative), Z73.0 (burnout), Z56.3 (stressful work schedule).",
    metric: "Module completion rate, KBS Knowledge improvement pre/post, Conductor confidence score, CII reduction correlated to certification level",
    feeds: "psy-identity (certification formalizes identity shift), psy-endowment (5 bonus hours per module), mac-bch (certification revenue stream)",
    targetPage: "product"
  },
  "mac-bch": {
    what: "Immediate cash flow from hospital partnerships.",
    how: "BCH retainer + private pay + memberships + assessments + certification.",
    formula: "$364K = BCH retainer ($30K) + private pay ($210K) + memberships ($4K) + CII/CRI ($45K) + Conductor Cert ($75K)",
    targetPage: "ubi"
  },
  "mac-viral": {
    what: "B2B2C distribution eliminates consumer ad spend.",
    how: "Institutional channels and viral loops replace consumer marketing.",
    formula: "$0 CAC = BCH discharge + BVSD employer + faith community + wellness referral + Time Bank word-of-mouth",
    targetPage: "ubi"
  },
  "mac-tax": {
    what: "The financial moat that prevents churn to agencies.",
    how: "IRS Pub 502 HSA/FSA deduction rate on LMN-eligible services.",
    formula: "28-36% = Family spending $20K → saves $6-7.2K.",
    targetPage: "ubi"
  },
  "mac-retention": {
    what: "Leaving the co-op means losing the tax advantage.",
    how: "No competitor has physician-governed LMN.",
    formula: ">90% LMN renewal rate.",
    targetPage: "ubi"
  },
  "mac-pace": {
    what: "Shared savings from avoided readmissions.",
    how: "Predictive models prevent hospitalizations, increasing the PACE sub-capitation spread.",
    formula: "$1.25M = 40 enrollees × $2,600/mo × 12 - (40 × $1,800/mo × 12) = $800 spread × 40 × 12",
    targetPage: "ubi"
  },
  "mac-val": {
    what: "Enterprise value driven by proprietary data asset.",
    how: "Proprietary clinical datasets, actuarial data, and federation licensing.",
    formula: "$75-150M+ = proprietary Omaha+wearable dataset + actuarial data + federation licenses + >90% retention",
    targetPage: "ubi"
  },
  "mac-ubi": {
    what: "A 40-hour guaranteed floor of community care.",
    how: "Self-sustaining via reciprocity + $15/hr. No government funding.",
    formula: "40 hrs/yr × membership base = community care floor.",
    targetPage: "ubi"
  },
  "mac-turnover": {
    what: "Worker-ownership solves the 77% industry churn rate.",
    how: "Worker-owners earn $25-28/hr + equity + benefits, ensuring relationship continuity.",
    formula: "$25-28/hr + equity ($52K/5yr) + health insurance + democratic governance = <15% vs 77% industry",
    targetPage: "ubi"
  }
};

const PILLARS = [
  {
    title: "1. The Catalyst (Psychology)",
    subtitle: "From the Enzyme Thesis",
    nodes: [
      { id: "psy-activation", name: "Activation Energy", desc: "Lowering the friction to say 'yes' to the first micro-task." },
      { id: "psy-endowment", name: "Endowment Effect", desc: "Giving 40 hours upfront so users feel wealthy, not needy." },
      { id: "psy-proximity", name: "Propinquity Effect", desc: "Hyper-local matching within a 2-mile radius." },
      { id: "psy-loss", name: "Loss Aversion", desc: "Graduated credit expiry and fear of losing tax status." },
      { id: "psy-identity", name: "Self-Verification", desc: "Aligning tasks with the user's existing identity." },
      { id: "psy-trust", name: "Signaling Theory", desc: "Visible background checks and two-way ratings." },
      { id: "psy-streak", name: "Goal Gradient", desc: "Streak tracking to build continuous habits." },
      { id: "psy-cascade", name: "Viral Loop", desc: "Refer-a-neighbor prompts after the 3rd successful task." }
    ]
  },
  {
    title: "2. The Engine (Product)",
    subtitle: "From the Strategy Map",
    nodes: [
      { id: "prod-discharge", name: "Discharge Concierge", desc: "HL7 feed integration with BCH Epic." },
      { id: "prod-respite", name: "Respite Emergency Fund", desc: "48hr SLA automated dispatch for crisis catch." },
      { id: "prod-timebank", name: "Time Bank Core", desc: "The ledger tracking earned, spent, and bought hours." },
      { id: "prod-lmn", name: "LMN Marketplace", desc: "Automated Letter of Medical Necessity generation." },
      { id: "prod-renewal", name: "Annual Renewal", desc: "Automated telehealth scheduling for LMN upkeep." },
      { id: "prod-wearable", name: "Wearable Integration", desc: "Apple Health API for continuous vital monitoring." },
      { id: "prod-predictive", name: "Predictive Hospitalization", desc: "ML anomaly detection triggering interventions." },
      { id: "prod-cert", name: "Conductor Certification", desc: "LMS integration for family upskilling." }
    ]
  },
  {
    title: "3. The Output (Macro)",
    subtitle: "From Care UBI & Financials",
    nodes: [
      { id: "mac-bch", name: "$364K Y1 Revenue", desc: "Immediate cash flow from hospital partnerships." },
      { id: "mac-viral", name: "$0 Acquisition Cost", desc: "B2B2C distribution eliminates consumer ad spend." },
      { id: "mac-tax", name: "28-36% Tax Savings", desc: "The financial moat that prevents churn to agencies." },
      { id: "mac-retention", name: "Infinite Retention", desc: "Leaving the co-op means losing the tax advantage." },
      { id: "mac-pace", name: "$1.25M PACE Margin", desc: "Shared savings from avoided readmissions." },
      { id: "mac-val", name: "$100M+ Valuation", desc: "Enterprise value driven by proprietary data asset." },
      { id: "mac-ubi", name: "The Care UBI", desc: "A 40-hour guaranteed floor of community care." },
      { id: "mac-turnover", name: "<15% Turnover", desc: "Worker-ownership solves the 77% industry churn rate." }
    ]
  }
];

export default function Synthesis() {
  const isMobile = useIsMobile();
  const [activeLine, setActiveLine] = useState<string | null>(null);
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  const activeData = THROUGHLINES.find(t => t.id === activeLine);

  const handleNodeClick = (nodeId: string) => {
    setExpandedNode(expandedNode === nodeId ? null : nodeId);
  };

  const navigateTo = (targetPage: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.hash = targetPage;
  };

  return (
    <div style={{ background: C.dark, minHeight: "100vh", color: C.w, animation: "fadeUp 0.3s ease-out", paddingBottom: 80 }}>
      {/* Header */}
      <header style={{ padding: isMobile ? "48px 24px" : "80px 24px", textAlign: "center", borderBottom: `1px solid ${C.dk2}` }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 11, color: C.sage, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, fontFamily: fs }}>The Unified Theory</div>
          <h1 style={{ fontFamily: ff, fontSize: isMobile ? 32 : 48, fontWeight: 700, marginBottom: 24 }}>Master Synthesis Matrix</h1>
          <p style={{ fontFamily: fs, fontSize: 18, color: C.t4, lineHeight: 1.6 }}>
            How behavioral psychology unlocks product features, which generate macroeconomic outcomes. Select a through-line to see the system in action.
          </p>
        </div>
      </header>

      {/* Through-line Selectors */}
      <div style={{ position: "sticky", top: 48, zIndex: 99, background: `${C.dark}ee`, backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.dk2}`, padding: "24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
          {THROUGHLINES.map(t => (
            <button 
              key={t.id} 
              onClick={() => setActiveLine(activeLine === t.id ? null : t.id)}
              style={{ 
                background: activeLine === t.id ? t.color : "transparent", 
                color: activeLine === t.id ? C.w : C.t3, 
                border: `1px solid ${activeLine === t.id ? t.color : C.dk2}`, 
                padding: "12px 20px", 
                borderRadius: 8, 
                fontFamily: fs, 
                fontSize: 14, 
                fontWeight: 600, 
                cursor: "pointer", 
                whiteSpace: "nowrap", 
                transition: "all 0.2s ease",
                boxShadow: activeLine === t.id ? `0 0 20px ${t.color}40` : "none"
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
        
        {/* Active Description Bar */}
        <div style={{ maxWidth: 1200, margin: "0 auto", height: activeLine ? 60 : 0, overflow: "hidden", transition: "all 0.3s ease" }}>
          {activeData && (
            <div style={{ marginTop: 16, padding: "12px 20px", background: `${activeData.color}20`, borderLeft: `4px solid ${activeData.color}`, borderRadius: "0 8px 8px 0", fontFamily: fs, fontSize: 15, color: C.w, animation: "fadeUp 0.3s ease-out" }}>
              {activeData.desc}
            </div>
          )}
        </div>
      </div>

      {/* The Matrix */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 32, alignItems: "start" }}>
          {PILLARS.map((pillar, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ marginBottom: 16, borderBottom: `1px solid ${C.dk2}`, paddingBottom: 16 }}>
                <h2 style={{ fontFamily: ff, fontSize: 22, fontWeight: 600, color: C.w, margin: "0 0 4px" }}>{pillar.title}</h2>
                <div style={{ fontFamily: fs, fontSize: 12, color: C.t4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{pillar.subtitle}</div>
              </div>
              
              {pillar.nodes.map(node => {
                const isActive = activeLine ? activeData?.nodes.includes(node.id) : true;
                const isDimmed = activeLine && !isActive;
                const isExpanded = expandedNode === node.id;
                const details = NODE_DETAILS[node.id];
                
                return (
                  <div 
                    key={node.id} 
                    onClick={() => handleNodeClick(node.id)}
                    style={{ 
                      background: isActive && activeLine ? `${activeData?.color}15` : C.dk2, 
                      border: `1px solid ${isActive && activeLine ? activeData?.color : "#4a453e"}`, 
                      padding: 20, 
                      borderRadius: 8, 
                      opacity: isDimmed ? 0.2 : 1,
                      transform: isActive && activeLine && !isExpanded ? "scale(1.02)" : "scale(1)",
                      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      boxShadow: isActive && activeLine ? `0 8px 24px ${activeData?.color}20` : "none",
                      cursor: "pointer",
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8
                    }}
                    onMouseEnter={(e) => {
                      if (!isDimmed && !isExpanded) e.currentTarget.style.transform = "scale(1.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = isActive && activeLine && !isExpanded ? "scale(1.02)" : "scale(1)";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <h3 style={{ fontFamily: fs, fontSize: 16, fontWeight: 700, color: isActive && activeLine ? activeData?.color : C.w, margin: "0 0 8px" }}>{node.name}</h3>
                      <span style={{ fontSize: 16, color: isActive && activeLine ? activeData?.color : C.t4, opacity: 0.5 }}>
                        {isExpanded ? "−" : "+"}
                      </span>
                    </div>
                    <p style={{ fontFamily: fs, fontSize: 13, color: C.t4, lineHeight: 1.5, margin: 0 }}>{node.desc}</p>
                    
                    {isExpanded && details && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.3s ease-out" }}>
                        <div>
                          <span style={{ fontSize: 11, color: C.sage, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>WHAT</span>
                          <p style={{ fontFamily: fs, fontSize: 13, color: C.w, margin: "4px 0 0", lineHeight: 1.5 }}>{details.what}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: 11, color: C.sage, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>HOW</span>
                          <p style={{ fontFamily: fs, fontSize: 13, color: C.w, margin: "4px 0 0", lineHeight: 1.5 }}>{details.how}</p>
                        </div>
                        {details.omaha && (
                          <div>
                            <span style={{ fontSize: 11, color: C.sage, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>OMAHA</span>
                            <p style={{ fontFamily: fs, fontSize: 13, color: C.w, margin: "4px 0 0", lineHeight: 1.5 }}>{details.omaha}</p>
                          </div>
                        )}
                        {details.icd10 && (
                          <div>
                            <span style={{ fontSize: 11, color: C.sage, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>ICD-10</span>
                            <p style={{ fontFamily: fs, fontSize: 13, color: C.w, margin: "4px 0 0", lineHeight: 1.5 }}>{details.icd10}</p>
                          </div>
                        )}
                        {details.formula && (
                          <div>
                            <span style={{ fontSize: 11, color: C.sage, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>FORMULA</span>
                            <p style={{ fontFamily: fs, fontSize: 13, color: C.w, margin: "4px 0 0", lineHeight: 1.5 }}>{details.formula}</p>
                          </div>
                        )}
                        {details.metric && (
                          <div>
                            <span style={{ fontSize: 11, color: C.sage, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>METRIC</span>
                            <p style={{ fontFamily: fs, fontSize: 13, color: C.w, margin: "4px 0 0", lineHeight: 1.5 }}>{details.metric}</p>
                          </div>
                        )}
                        {details.feeds && (
                          <div>
                            <span style={{ fontSize: 11, color: C.sage, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>FEEDS</span>
                            <p style={{ fontFamily: fs, fontSize: 13, color: C.w, margin: "4px 0 0", lineHeight: 1.5 }}>{details.feeds}</p>
                          </div>
                        )}
                        <button 
                          onClick={(e) => navigateTo(details.targetPage, e)}
                          style={{ 
                            marginTop: 8,
                            background: C.sage, 
                            color: C.w, 
                            border: "none", 
                            padding: "8px 16px", 
                            borderRadius: 4, 
                            fontFamily: fs, 
                            fontSize: 13, 
                            fontWeight: 600, 
                            cursor: "pointer",
                            alignSelf: "flex-start"
                          }}
                        >
                          Explore →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* The Flywheel */}
      <div style={{ padding: "64px 24px", background: C.dk2, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: C.sage, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, fontFamily: fs }}>The Grand Unification</div>
            <h2 style={{ fontFamily: ff, fontSize: 32, fontWeight: 700, color: C.w, marginBottom: 16 }}>The Community Care Flywheel</h2>
            <p style={{ fontFamily: fs, fontSize: 16, color: C.t4, maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
              Clever behavioral economics matched with enzymatic community involvement and real economic potential. We leverage everything the community already has to do it all better.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(5, 1fr)", gap: 16 }}>
            {[
              { title: "1. The People", desc: "Families are empowered as Conductors, lowering their burden and preventing burnout.", icon: "👥" },
              { title: "2. The Skills", desc: "Neighbors use the Time Bank to provide respite, creating massive, zero-cost liquidity.", icon: "⏱️" },
              { title: "3. The Wellness", desc: "LMNs unlock HSA/FSA funds, driving revenue to local community wellness centers.", icon: "🧘" },
              { title: "4. The Business", desc: "W-2 Co-op professionals provide clinical care with 0% agency extraction and high retention.", icon: "💼" },
              { title: "5. The System", desc: "PACE and hospitals pay for the predictive data and reduced readmissions, funding the whole loop.", icon: "🏥" }
            ].map((step, i) => (
              <div key={i} style={{ background: C.dk2, border: `1px solid #4a453e`, padding: 24, borderRadius: 8, position: "relative" }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{step.icon}</div>
                <div style={{ fontFamily: fs, fontSize: 14, fontWeight: 700, color: C.w, marginBottom: 8 }}>{step.title}</div>
                <div style={{ fontFamily: fs, fontSize: 13, color: C.t4, lineHeight: 1.5 }}>{step.desc}</div>
                {!isMobile && i < 4 && (
                  <div style={{ position: "absolute", right: -16, top: "50%", transform: "translateY(-50%)", color: C.sage, fontSize: 24 }}>→</div>
                )}
                {isMobile && i < 4 && (
                  <div style={{ position: "absolute", bottom: -24, left: "50%", transform: "translateX(-50%)", color: C.sage, fontSize: 24 }}>↓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
