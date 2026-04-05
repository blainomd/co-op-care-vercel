# Mercury × co-op.care: Embedded AI Health Liability Insurance

**Deep Thought Document — March 9, 2026**
**Status: Concept exploration, not a formal proposal**

---

## The Conversation That Started This

Brooklyn Wilson (Mercury) asked Blaine about raising outside capital vs. bootstrapping. Blaine's response: "looking at things I need a full stack reinsurance at some point. but AI malpractice for one. and more. would be a solid footing for new markets."

This document explores: **What would it look like if Mercury offered embedded AI healthcare liability insurance — and co-op.care was the design partner?**

---

## The Gap Nobody Has Filled

### The Problem

Every health-tech startup using AI faces the same unsolved insurance question:

**When an AI system contributes to a clinical error, who pays?**

- Traditional **malpractice insurance** says: "That's a technology failure, not a clinical one."
- Traditional **tech E&O insurance** says: "That's a clinical outcome, not a software bug."
- Traditional **cyber liability** says: "There was no breach — the AI just gave bad advice."

The result: a gray zone where claims are "too technical for malpractice, too clinical for tech E&O, and outside the bounds of traditional administrative E&O." And this gray zone is growing exponentially as AI embeds deeper into clinical workflows.

### The Numbers

- **Top 50 malpractice awards averaged $56M in 2024** — up 75% from 2022
- **42% of medical group leaders** already use ambient listening AI (2024 survey)
- **250+ state AI bills** introduced across 34+ states in 2025 alone
- **Colorado's AI Act** (co-op.care's home state) is the toughest — mandatory disclosure, impact assessments, anti-bias controls, record-keeping. Enforcement: **June 30, 2026**
- **Embedded insurance market**: $136B (2024) → projected $210B (2025), 35% CAGR

### Who's Trying to Solve It

**Corgi Insurance** ($108M funding, Jan 2026) — offers AI liability coverage for startups. Instant quote for D&O, E&O, cyber, AND AI liability. Revenue >$40M ARR. But they're generalist — not healthcare-specific.

**Nobody** is offering a healthcare-specific, AI-specific liability product embedded in a banking/fintech platform.

That's the gap.

---

## What Mercury Already Is

Mercury isn't just a bank. It's becoming a **financial operating system for startups**:

| Product | What It Does |
|---------|-------------|
| Banking | Checking, savings, $5M FDIC via sweep network |
| Treasury | 3.67-4.47% yield on idle cash |
| Credit Card | IO Mastercard, 1.5% cashback, underwritten on cash balance |
| Venture Debt | Non-dilutive capital for VC-backed startups |
| Working Capital | Unsecured loans for e-commerce |
| Bill Pay | AI-parsed invoicing, Slack-integrated approvals |
| Expense Mgmt | Accounting automation, QuickBooks/Xero/NetSuite sync |
| Consumer Banking | Mercury Personal for founders |
| Investor Database | Brooklyn's message to Blaine — matchmaking investors |
| API | Read/write access for custom automation |

**What Mercury doesn't have: Insurance.**

200,000+ startup customers. $650M annualized revenue. $3.5B valuation. National bank charter pending. And zero insurance products.

---

## The Concept: Mercury Health Shield

### What It Would Be

An **embedded AI healthcare liability insurance product** offered through Mercury's platform to health-tech startups. Not a standalone insurance company — a distribution partnership between Mercury and a specialty insurer, embedded in Mercury's banking stack the same way their FDIC coverage is embedded through partner banks.

### How It Would Work

```
Health-tech startup signs up for Mercury banking
         ↓
Mercury surfaces: "You're building AI in healthcare.
You need AI liability coverage. Get a quote in 60 seconds."
         ↓
Embedded underwriting (using Mercury's own financial data
+ startup's AI risk profile)
         ↓
Blended policy: Tech E&O + Clinical Liability + AI Liability
+ Cyber + Colorado AI Act Compliance
         ↓
Premium billed through Mercury. Claims managed by insurer.
Mercury earns distribution fee.
```

### What Makes Mercury's Position Unique

No other fintech can do this because Mercury has **underwriting data no insurer has**:

1. **Real-time cash flow** — Mercury sees burn rate, revenue, runway. This is better than annual financials for risk assessment.
2. **Customer segmentation** — Mercury knows which of its 200K customers are health-tech. They can target precisely.
3. **Transaction patterns** — Mercury sees vendor payments (AWS for compute, HIPAA compliance vendors, clinical staffing agencies). This reveals operational maturity without questionnaires.
4. **Growth signals** — Mercury sees payroll growth, funding rounds, customer acquisition patterns. A fast-growing health-tech startup has different risk than a stagnant one.

### The Product (Blended eHealth E&O)

| Coverage Layer | What It Covers | Why It's Needed |
|---------------|---------------|-----------------|
| **AI Clinical Liability** | Patient harm caused or contributed to by AI-generated recommendations, risk scores, anomaly alerts, or clinical decision support | The core gray zone — neither malpractice nor traditional E&O covers this clearly |
| **Tech E&O** | Software bugs, system failures, data processing errors, integration failures | Standard tech coverage, but specifically calibrated for health-tech |
| **Clinical Malpractice Tail** | Liability for clinical oversight of AI systems (the human-in-the-loop physician) | Covers the supervising clinician's liability for AI-influenced decisions |
| **Regulatory Compliance** | Fines, penalties, legal costs from state AI Act violations (Colorado, California, Texas, Utah) | Colorado AI Act enforcement starts June 30, 2026. co-op.care is IN Colorado. |
| **Cyber + HIPAA** | PHI breach, ransomware, unauthorized access to health data | Standard but critical for any health-tech |
| **AI Model Governance** | Liability for bias, drift, hallucination in clinical AI models | Emerging risk category — covers the "your model was trained on biased data" claim |

### Pricing Model

Based on the Corgi Insurance model (instant, API-driven) adapted for healthcare:

| Tier | Revenue Range | Estimated Annual Premium | Includes |
|------|--------------|------------------------|----------|
| Seed | <$1M | $5,000-15,000 | AI liability + tech E&O + cyber |
| Growth | $1M-10M | $15,000-50,000 | Full blended eHealth E&O |
| Scale | $10M-50M | $50,000-150,000 | Full suite + clinical malpractice tail |

Mercury's cut: 15-25% distribution fee (standard embedded insurance economics).

---

## Where co-op.care Fits In

### co-op.care's Specific AI Liability Exposure

co-op.care isn't a hypothetical customer — it's a **perfect pilot case** because it has every type of AI healthcare liability exposure:

| AI System | Liability Scenario | Current Coverage |
|-----------|-------------------|-----------------|
| **Sage AI** (care companion) | Sage tells a family member "your mother's vitals look normal" when they're not. Family delays care. Harm results. | **None** |
| **Galaxy Watch RPM** | Anomaly detection fails to flag elevated resting HR. Patient is hospitalized 48 hours later. | **None** |
| **Caregiver matching algorithm** | AI matches a caregiver with a patient based on personality profile. Caregiver misses a clinical sign because they weren't qualified for that patient's condition. | **None** |
| **Risk scoring (72-96hr hospitalization)** | Risk score says "low risk." Patient is readmitted within 72 hours. Health system blames co-op.care's data. | **None** |
| **CII (Care Integration Index)** | CII score used to determine care intensity. Score is wrong. Patient gets inadequate care. | **None** |

### co-op.care as Design Partner (Not Just Customer)

The proposal to Mercury isn't "sell us insurance." It's:

**"We'll help you design the product."**

co-op.care brings:

1. **Real AI-in-healthcare use cases** — Sage, Galaxy Watch RPM, anomaly detection, risk scoring. These are concrete scenarios an insurer can model, not hypotheticals.

2. **Clinical oversight structure** — Josh Emdur, DO as Clinical Director provides the human-in-the-loop documentation that insurers need to underwrite AI risk.

3. **Cooperative model** — Worker-owned, lower turnover (38% vs 82%), consistent caregiver relationships. This is actually a LOWER risk profile than traditional home care agencies, which is an underwriting advantage.

4. **Colorado AI Act compliance data** — co-op.care will need to comply with Colorado's AI Act by June 30, 2026. The compliance documentation itself becomes the risk assessment framework for the insurance product.

5. **FHIR-native data** — co-op.care stores everything in FHIR R4 (Aidbox). This means audit trails, observation histories, and clinical decision logs are structured, queryable, and defensible — exactly what an insurer needs for claims investigation.

### The Pitch to Mercury

> "Mercury is the financial OS for 200,000 startups. A growing percentage are building AI in healthcare — and none of them have adequate liability coverage. The malpractice/tech E&O gray zone is a ticking time bomb, especially with Colorado, California, and Texas AI Acts taking effect in 2026.
>
> co-op.care is a worker-owned home care cooperative deploying AI (companion care AI, Galaxy Watch RPM, anomaly detection, hospitalization risk scoring) to 78-year-olds in Boulder. We have every type of AI healthcare liability exposure, a clinical director (Josh Emdur, DO), FHIR-native data architecture, and Colorado AI Act compliance requirements.
>
> We propose a design partnership: co-op.care as the pilot customer for Mercury's first embedded AI healthcare liability product. We provide the real-world risk scenarios, clinical governance framework, and compliance documentation. Mercury provides the distribution platform and underwriting data advantage. Together with a specialty insurer (Corgi, The Doctors Company, or a Lloyd's syndicate), we create the first AI-in-healthcare liability product embedded in a fintech banking stack.
>
> This isn't just an insurance product. It's a moat. Every health-tech startup on Mercury's platform needs this. Nobody else offers it."

---

## The "Full Stack Reinsurance" Vision

Blaine mentioned "full stack reinsurance" in his message to Brooklyn. Here's what that could look like at scale:

### Layer 1: Primary Insurance (Mercury Health Shield)
- Direct coverage for co-op.care's AI systems
- Embedded in Mercury banking
- ~$5K-15K annual premium at seed stage

### Layer 2: Excess Liability
- Umbrella coverage above primary limits
- Kicks in for claims above $1M
- Needed when co-op.care scales to 200+ patients

### Layer 3: Reinsurance
- Insurance for the insurer
- If Mercury's insurance partner writes $100M in AI health policies, they need reinsurance backing
- co-op.care doesn't buy this directly — but if co-op.care helps DESIGN the risk model, co-op.care could participate in the reinsurance economics (as a data/consulting partner)

### Layer 4: Captive Insurance (Long-Term)
- At scale (Year 3+), co-op.care could form a **captive insurance company** — essentially self-insuring through a wholly-owned subsidiary
- Cooperatives have a long history of captive insurance (agricultural co-ops, credit unions)
- A co-op.care captive could pool risk across multiple cooperative home care agencies nationally
- This is the "full stack" — owning the insurance, not just buying it

---

## The Business Case for Mercury

### Why Mercury Should Care

| Factor | Impact |
|--------|--------|
| **New revenue stream** | 15-25% distribution fee on embedded insurance. $10K avg premium × 5,000 health-tech customers = $50M+ premium volume = $7.5-12.5M fee revenue |
| **Customer retention** | Insurance creates switching costs. If your liability coverage is bundled with your bank, you don't move banks. |
| **Differentiation** | No other fintech offers health-tech AI liability. Not Brex. Not Ramp. Not Rho. |
| **Bank charter synergy** | Mercury's pending national bank charter + insurance distribution = full financial services platform |
| **Data advantage** | Mercury already has the underwriting data (cash flow, vendor payments, payroll). Adding insurance is leveraging existing data, not building new infrastructure. |

### Why Mercury Should Listen to co-op.care Specifically

1. **Blaine's 20+ years in health-tech** — grew BrainLAB's orthopedic vertical to $250M, multiple M&A exits. He understands health system economics and liability better than most founders.
2. **The cooperative angle** — worker-owned cooperatives are a novel, lower-risk employment model. If Mercury helps insure this model, they're positioning for the broader cooperative economy wave.
3. **Colorado timing** — AI Act enforcement June 30, 2026. co-op.care needs this NOW. Being first-to-need is valuable for product design.
4. **The Galaxy Watch RPM story** — Samsung + Verily + Google Health Connect + RPM reimbursement. This is a concrete, revenue-generating AI health product, not vaporware.

---

## Possible Partners for Mercury

| Insurer | Fit | Why |
|---------|-----|-----|
| **Corgi Insurance** | Best | Already offers AI liability for startups, $108M funded, API-first, instant quotes. Natural Mercury embedded partner. |
| **The Doctors Company** | Good | Largest physician-owned malpractice insurer. Deep healthcare expertise. Could provide clinical malpractice tail. |
| **ProAssurance** | Good | Specializes in healthcare professional liability. Already writing about AI risks. |
| **Coalition** | Moderate | Leading cyber + tech E&O. Strong on the tech side but less healthcare-specific. |
| **Lloyd's syndicates** | Ambitious | Custom coverage for novel risks. Where truly new insurance products get created. |
| **Founder Shield** | Good | Already works with startups. Published 2026 tech insurance trends. Healthcare-aware. |

---

## Immediate Next Steps (If Blaine Wants to Pursue)

1. **Reply to Brooklyn** — Don't pitch insurance yet. Instead: "Interesting question about capital. We're looking at a unique angle — the AI liability gap in healthcare is massive, and I think Mercury is perfectly positioned to offer embedded coverage to its health-tech customers. Would love to explore this with someone on your product team. Is there a right person to talk to?"

2. **One-pager** — Create a concise "Mercury Health Shield" concept document that positions co-op.care as the design partner, not just the customer.

3. **Corgi Insurance intro** — Separately explore Corgi's AI liability coverage for co-op.care's immediate needs. If Corgi is interested in a Mercury distribution partnership, co-op.care could make the introduction.

4. **Colorado AI Act compliance** — Start documenting co-op.care's AI governance framework NOW (June 30, 2026 deadline). This documentation becomes the risk model for the insurance product.

---

## The Honest Assessment

**Likelihood Mercury builds this with co-op.care:** Low-medium in the short term. Mercury is focused on its bank charter application and has no public insurance strategy. But the idea plants a seed.

**Likelihood Mercury builds this eventually:** High. Every financial OS eventually adds insurance (Shopify did it, Stripe has it, Square has it). Mercury will too. Being the health-tech design partner when they do is valuable.

**What co-op.care should do NOW regardless:** Get AI liability coverage from Corgi Insurance or Founder Shield. Don't wait for Mercury. The Colorado AI Act deadline is real.

**The real value of this conversation with Brooklyn:** It positions Blaine as someone who thinks about the insurance/liability layer, not just the product layer. That's a founder who understands risk, which makes co-op.care more investable. Even if Mercury doesn't build the insurance product, the conversation elevates Blaine's credibility.

---

## References

- [Mercury — Official Site](https://mercury.com/)
- [Mercury Bank Charter Application (Dec 2025)](https://www.businesswire.com/news/home/20251219760269/en/Mercury-Applies-for-OCC-National-Bank-Charter-to-Become-the-Bank-for-Builders)
- [Mercury Business Breakdown — Contrary Research](https://research.contrary.com/company/mercury)
- [Corgi Insurance — AI Liability for Startups](https://fintech.global/2026/01/13/ai-driven-insurtech-corgi-lands-108m-funding-round/)
- [AI Malpractice & Insurance — STAT News](https://www.statnews.com/2026/03/04/health-care-malpractice-insurance-ai-prognosis/)
- [AI Liability in Healthcare — The Doctors Company](https://www.thedoctors.com/the-doctors-advocate/fourth-quarter-2025/ai-on-trial-the-rising-liability-risks-of-artificial-intelligence-in-healthcare/)
- [2026 State AI Bills & Liability — Wiley](https://www.wiley.law/article-2026-State-AI-Bills-That-Could-Expand-Liability-Insurance-Risk)
- [Healthcare E&O Gray Zone — EPIC Brokers](https://www.epicbrokers.com/insights/donoharm-exe/)
- [Tech Insurance Pricing 2026 — Founder Shield](https://foundershield.com/blog/tech-insurance-pricing-trends-2026/)
- [Embedded Insurance Market Growth — Embedded Finance Playbook](https://www.fintechtris.com/blog/the-embedded-finance-playbook)
- [2026 Insurtech Predictions — Qover](https://www.qover.com/blog/2026-insurtech-predictions)
