# The Post-SaaS Healthcare Manifesto
## Why Tech-Enabled Care Services Will Replace Software Vendors — And What That Means for the Next Decade

*co-op.care | March 2026*
*Blaine Warkentine, MD, MBA*

---

## The Thesis in One Sentence

The era of selling healthcare software is ending. The era of delivering healthcare outcomes — with AI-native infrastructure invisible to the buyer — is beginning.

---

## I. The Five Structural Shifts

### Shift 1: AI Goes Native

The old model: Build software. Add an AI feature. Market it.

The new model: Design the entire business around what AI makes possible. The software is invisible. The outcome is the product.

**What this means for home care:**
Traditional home care agencies treat technology as an add-on — a scheduling app here, an EVV tracker there. co-op.care treats AI as the architect. Our 5-stage NLP pipeline (voice capture, entity extraction, Omaha System mapping, FHIR conversion, automated billing) isn't a feature of our care delivery. It IS our care delivery. Without the pipeline, the business model doesn't function.

The distinction matters because it changes who you hire, how you train, and what you measure. We don't need "full-stack developers who can also do healthcare." We need clinical architects who understand how agentic workflows transform care documentation from a compliance burden into a clinical intelligence system.

**The edge opportunity:** When compute moves to the edge (on-device, on-prem), you bypass healthcare's two biggest technology barriers: latency and data egress. A caregiver's phone can run entity extraction locally, structure clinical observations in real time, and sync when connectivity allows. This isn't a roadmap item — it's architecturally inevitable.

### Shift 2: Services Eat SaaS

The old model: Buy a license. Implement it. Manage it. Renew it.

The new model: Buy the outcome. Let someone else manage the technology.

**The SaaS fatigue cycle:**
1. Point solution proliferates (150+ vendors at ViVE hawking AI dashboards)
2. Buyers face integration exhaustion (every tool needs an API, a login, a training)
3. AI lowers the cost of replicating any point solution to near zero
4. The only durable value is accountability — owning the result, not the tool

**co-op.care is the finished cabinet, not the hammer.**
We don't sell CareOS to hospitals. We don't ask them to implement anything. We deliver a service: post-acute clinical visibility, structured FHIR data flowing back to the ACO, readmission risk reduced through human continuity. The technology is invisible. The hospital buys the outcome.

**Why this is structurally superior for healthcare:**
- No procurement cycle (services are purchased through existing care delivery budgets)
- No IT integration burden (FHIR-native data flows through standard interfaces)
- No training required (the technology is used by our caregivers, not the hospital's staff)
- Accountability is contractual (we own the quality of the data and the continuity of the caregiver)

### Shift 3: Data Infrastructure Is the Only Moat

The old model: Proprietary software features create competitive advantage.

The new model: Proprietary data generated through unique workflows creates competitive advantage. The software is a commodity; the data flywheel is the moat.

**co-op.care's data moat has three layers:**

**Layer 1: The Omaha System taxonomy (42 problems, 75 targets, KBS ratings)**
Every patient interaction generates structured clinical observations mapped to a standardized taxonomy recognized by ANA. No other home care provider in our market generates this data systematically.

**Layer 2: Longitudinal outcome tracking**
Because our caregivers don't turn over (W-2 worker-owners, projected 15% turnover vs. 77% industry), we accumulate longitudinal data on the same patients from the same observers. The consistency of the observer is as important as the consistency of the observation.

**Layer 3: The feedback loop**
Omaha KBS ratings (1-5 scale across Knowledge, Behavior, Status) create a closed-loop system:
- Caregiver observes and documents (voice note)
- AI structures the observation (FHIR Observation)
- Physician verifies (quality gate)
- Outcome is tracked over time (KBS trend)
- Model improves prediction accuracy (18% improvement in hospitalization prediction)

This flywheel deepens with every patient visit. A PE-owned agency with 77% turnover and paper-based documentation cannot replicate it — not because they lack the technology, but because they lack the human continuity that feeds it.

### Shift 4: Cognitive Load Is the Unsolved Problem

The old model: Give clinicians more data. Build bigger dashboards. Add more alerts.

The new model: Give clinicians fewer decisions. Filter noise from signal. Let AI handle documentation so humans can handle judgment.

**The current state:** EHRs are accounting software repurposed for clinical use. They are Systems of Record. What's missing is a System of Intelligence — a layer that sits above the EHR, synthesizes data from multiple sources (home observations, vitals, medication adherence, behavioral changes), and presents the clinician with a curated clinical summary that requires a decision, not a data review.

**CareOS as the "missing layer":**
When a caregiver says "Helped Mom with the shower. She was dizzy. BP 142/88," CareOS:
1. Extracts clinical entities (dizziness, BP 142/88, ADL assistance)
2. Maps to Omaha System (Circulation domain, BP monitoring target)
3. Packages as FHIR Observation with coded values
4. Routes to physician review queue

The physician sees: "New dizziness + elevated BP in patient with hypertension history. Recommend medication review." Not: "Here are 47 unstructured notes from the last 2 weeks."

That's the difference between adding data and reducing decisions.

### Shift 5: Capital Efficiency Is a Structural Advantage

The old model: Raise $50M. Build a moat of employees and contracts. Defend it.

The new model: Stay lean. Stay flexible. Let the PE-bloated incumbents discover that their sunk costs are now sunk anchors.

**The 10-year thesis problem:**
Private equity firms acquiring home care agencies are building on a 10-year thesis: consolidate agencies, cut labor costs, extract margin, flip to a larger PE firm. This thesis assumes:
- Caregivers will continue to accept poverty wages ($13-17/hr)
- Turnover doesn't affect clinical outcomes
- Hospitals don't care about post-discharge quality
- CMS won't tie payment to outcomes

Every one of these assumptions is collapsing.

**Why cooperatives win in this environment:**
- No external equity = no extraction pressure
- Subchapter T taxation = single-tax treatment, surplus reinvested in labor
- Worker ownership = structural retention (15% projected vs. 77% industry)
- Colorado LCA = governance framework optimized for stakeholder, not shareholder, value
- $10K capital + 5,400 lines of code = a functioning clinical platform built at 1/1000th the cost of a PE acquisition

The PE agencies can't pivot. They have debt covenants, board expectations, and extraction timelines. co-op.care can pivot in weeks because there's no one to extract value from the pivot.

---

## II. The Implications for co-op.care's Positioning

### What We Are
- A tech-enabled care service (not a software company)
- A data infrastructure business disguised as a home care cooperative
- A clinical intelligence layer for ACOs and TEAM hospitals
- A worker-owned entity structurally immune to PE extraction

### What We Are Not
- A SaaS vendor selling dashboards
- A traditional home care agency that happens to use technology
- A startup seeking PE acquisition
- A point solution for any single workflow

### How We Talk About Ourselves

| To This Audience | We Say This |
|---|---|
| Hospital pop health leaders | "Post-acute visibility as a service — structured clinical data flowing back to the ACO" |
| Bundle operations managers | "Episode cost variance reduction through caregiver continuity and real-time observation data" |
| Clinical AI researchers | "4-layer safety model where AI handles documentation, humans handle judgment" |
| CMS policy architects | "Structurally aligned downstream partner — retention by ownership, not by contract" |
| PE / regulatory attorneys | "The cooperative counter-model to extraction — structural immunity under Colorado LCA" |
| Caregivers and families | "Your neighbor, your caregiver, your co-op. Same person, every week." |

---

## III. The 10-Year Arc

**Year 1 (2026):** Prove the model in Boulder. 15-25 families. BCH partnership. CMS ACCESS application. First revenue from assessments and private pay.

**Year 2-3 (2027-28):** Scale to 50+ families. LEAD Model participation via ACO partnership. PACE sub-capitation. Demonstrate the data moat through Omaha KBS outcome evidence. First patronage dividend distribution.

**Year 4-5 (2029-30):** Federated replication. License the CareOS platform and cooperative governance playbook to founding cooperatives in 3-5 additional markets. Each cooperative is independently worker-owned; the federation shares clinical data infrastructure and purchasing power.

**Year 6-10 (2031-35):** The Community Care Utility. A federated network of worker-owned cooperatives providing the clinical intelligence layer for the U.S. home care ecosystem. Revenue from care delivery, data services, and cooperative federation fees. The "moat" is the longitudinal clinical data generated by thousands of persistent caregiver relationships — irreplicable by any PE agency.

---

## IV. The Battle Cry

**Human capital that fights private equity.**

Not because we're against profit. Because we're structured so that profit flows to the people doing the work, the families receiving the care, and the clinical infrastructure that makes it safe. When every dollar of surplus strengthens the workforce instead of enriching a distant shareholder, the model gets better with scale instead of worse.

The post-SaaS era in healthcare belongs to organizations that deliver outcomes, generate proprietary clinical data, reduce cognitive load, and do it all with structural efficiency that PE bloat can't match.

co-op.care was built for this moment.

---

*This document is a strategic positioning framework, not a public-facing marketing piece. Use it to inform pitch decks, outreach messaging, and investor conversations. Adapt the language to each audience per the table in Section II.*
