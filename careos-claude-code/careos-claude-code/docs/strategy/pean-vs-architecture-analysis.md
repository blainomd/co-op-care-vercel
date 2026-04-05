# Pean vs. co-op.care Architecture: Strategic Alignment & Critical Gaps

**Date:** February 27, 2026  
**Context:** Dr. Christian Pean's article "Yes, the EHR Is Going to Kill Your AI Startup" (published today) compared against Blaine's February 26 architecture email to Jacob Pielke at Cohesion.

---

## The Big Picture: Pean Validates Your Strategy

Pean's core thesis is that healthcare AI startups building **inside** the EHR will die. The winners build a **care orchestration layer alongside** the EHR — powered by AI agents + augmented humans, financed by policy-aligned reimbursement (ACCESS, ASM, PIN/CHI), and designed around the patient's journey rather than clinician documentation.

**co-op.care is already building exactly what Pean describes as the winning model.** The cooperative structure IS his "super-staffing path" — worker-owners augmented by CareOS AI, connected to but not embedded in the EHR, financed by ACCESS/PIN/CHI. This is not a coincidence; it's convergent analysis arriving at the same conclusion from different directions.

---

## Point-by-Point: Where Pean Validates You

| Pean's Argument | co-op.care's Position | Status |
|---|---|---|
| Build outside the EHR, not inside it | CareOS is a care orchestration platform, not an EHR feature | ✅ Aligned |
| ACCESS Model is THE opportunity | Applying for first cohort (April 1 deadline) | ✅ Aligned |
| "Super-staffing" — bring humans + AI together | Worker-owner cooperative model IS this | ✅ Aligned |
| Tie to novel reimbursement (ACCESS, ASM, PIN, CHI) | All four are in the revenue model | ✅ Aligned |
| Post-acute transitions / discharge coordination | BCH partnership for blocked bed coordination | ✅ Aligned |
| Care gap closure between visits | CareOS + Time Bank for continuous support | ✅ Aligned |
| "Your AI doesn't assist a human — it completes the task end-to-end" | CareOS: voice → Omaha codes → FHIR → billing codes | ✅ Aligned |
| People-first models need AI efficiency AND policy-aligned reimbursement | 50% margin + ACCESS + worker ownership | ✅ Aligned |
| Carbon Health failed from headcount without AI efficiency | Cooperative model: AI handles coordination, humans deliver care | ✅ Aligned |
| Medicaid disenrollment creates navigation demand | Time Bank + community health worker model | ✅ Aligned |

**Pean essentially wrote the investment thesis for co-op.care without knowing it exists.**

---

## Point-by-Point: Where Pean Exposes Critical Risks

### RISK 1: Epic FHIR Integration Timeline (CRITICAL)

**What Pean says:**
> "The process of getting to the right analyst ticket, navigating App Orchard or the Epic Toolbox, securing FHIR API credentials, and passing security reviews has taken us one to two years — even with strong clinical champions inside major health systems pushing on our behalf."

**What Blaine told Jacob:**
> "FHIR R4 as the integration layer. When BCH sends a discharge notification, it hits the Technologies LLC's FHIR server, which routes it to the appropriate cooperative based on the patient's ZIP code and membership."

**The Gap:** Blaine's email describes FHIR R4 integration with BCH (which runs Epic) as architectural plumbing that Cohesion designs in Phase 1. Pean's experience — and independent research — confirms this is a 6-18 month process requiring:

- BCH internal sponsorship (a named clinical champion)
- Epic Connection Hub registration ($500+)
- Security review and penetration testing
- HIPAA compliance documentation review
- Production API credential approval
- Per-site configuration and testing

**Research confirms:** Basic read-only FHIR access can take 2-3 months. Complex workflows (write-backs, orders, discharge notifications) require 6-18 months. The 18-month figure from JMIR case studies reflects comprehensive integration including workflow embedding.

**What this means for the architecture doc:** The Phase 1 architecture must distinguish between:

1. **CMS FHIR (Phase 1, required for ACCESS):** co-op.care's Aidbox server reports OAP Measures to CMS via their FHIR-based Data Reporting API. This is participant-to-CMS. Achievable in 5 weeks.
2. **co-op.care internal FHIR (Phase 1):** Aidbox stores all CareOS data natively in FHIR R4. CII/CRI assessments, visit documentation, Omaha System codes all stored as FHIR resources. This is self-contained.
3. **Epic/BCH FHIR integration (Phase 2+, 6-18 months):** Discharge notifications, clinical data exchange with BCH's Epic instance. Requires BCH sponsorship, Epic Showroom registration, security review. **This is NOT Phase 1.**

### RISK 2: Aidbox Production Pricing

**What was in the draft reply to Jacob:**
> "I'll budget $500-800/month for infrastructure during Phase 1."

**Research reveals:**
- Aidbox production license: **$1,900/month minimum**
- Development license: Free, but NO PHI and 5GB storage limit
- Professional support: $25,000/year
- Enterprise support: $80,000/year

**The Gap:** The $500-800/month infrastructure budget is impossible if Aidbox production is included. Either:
- Phase 1 uses the free development license (no real PHI) and delays production Aidbox until Phase 2
- The budget increases to $2,500-3,000/month to accommodate production Aidbox
- Pavel negotiates a startup/case study arrangement (likely — he's already engaged)

**This needs to be resolved on today's 2:00 PM call with Pavel.**

### RISK 3: The "Political Moat" with BCH

**What Pean says:**
> "Epic is not entirely malicious. They have perfectly legitimate concerns about data security, patient safety, and maintaining the integrity of their ecosystem. But the incentive structure is clear: they are not incentivized to let nimble startups embed deeply within the system of record."

**What this means for co-op.care:** The BCH partnership is positioned as a hospital discharge coordination play — "$2,500/day blocked bed costs." But the FHIR integration required to receive discharge notifications from BCH's Epic instance faces the same political moat Pean describes. co-op.care needs:

- A named BCH clinical champion (Grant Besser is community health, not IT)
- BCH IT/CIO buy-in for a third-party FHIR integration
- BCH to sponsor co-op.care through Epic's review process

**Mitigation:** Pean's own framework suggests the answer — don't require Epic integration for the BCH relationship to work initially. Start with manual/phone-based discharge coordination (the "fax-laden handoff" Pean describes), demonstrate value, then use proven results to justify the IT investment for FHIR integration. The first 6 months of BCH partnership should be human-process, not API-dependent.

### RISK 4: The Architecture Doc's Dual Audience Problem

**What Jacob asked:**
> "What are the requirements for a CMS application that the architecture doc will need to follow?"

**What the ACCESS RFA actually requires (from the document):**
1. Report OAP Measures via CMS' FHIR-based Data Reporting API
2. Electronically share clinical updates with beneficiaries' other providers
3. Check eligibility and enroll beneficiaries via CMS Eligibility and Alignment APIs
4. Submit claims using model-specific G-codes
5. HIPAA compliance as covered entity
6. FDA compliance for any technologies qualifying as medical devices
7. Designate Medicare-enrolled physician Medical Director

**The architecture doc does NOT need to show Epic integration.** CMS requires FHIR-based reporting **to CMS** and electronic clinical updates **to other providers** (which could be via Direct messaging, FHIR, or other electronic means — it doesn't specify Epic). This is a critical reframe: the Phase 1 architecture doc should demonstrate CMS API compliance, not Epic interoperability.

---

## What Needs to Change in Your Deliverables

### 1. Reply to Jacob (Draft Email)

The CMS ACCESS requirements section needs to be reframed. Remove the emphasis on "Epic-compatible data exchange" and replace with:

**CMS-facing requirements (Phase 1):**
- FHIR-based Data Reporting API to CMS for OAP Measures
- CMS Eligibility and Alignment API integration
- Electronic clinical update transmission to referring providers
- Model-specific G-code billing infrastructure
- HIPAA covered entity compliance posture

**Epic/BCH integration (Phase 2+, post-ACCESS application):**
- Requires BCH sponsorship through Epic's review process
- 6-18 month timeline based on industry benchmarks
- Start with manual discharge coordination, automate later

Also: flag the Aidbox pricing issue for the 2:00 PM call. The $500-800 budget is wrong if production Aidbox is needed.

### 2. Gem Files (Potential Updates)

**gem-02-technology-architecture.md** needs adjustment:

- The "5-Stage CareOS Pipeline" describes FHIR R4 as producing "Epic-interoperable Observation objects for hospital EHR ingestion." This should be reframed: FHIR R4 resources stored in Aidbox (co-op.care's FHIR server) that are CMS-reportable AND Epic-compatible when integration is established.
- Add a section on the "Care Orchestration Layer" positioning — co-op.care sits alongside the EHR, not inside it. Use Pean's framework explicitly.
- Distinguish Phase 1 (CMS FHIR compliance) from Phase 2+ (Epic integration).

**gem-01-master-universe.md** could benefit from:

- Adding "care orchestration" as a positioning term alongside "care coordination"
- Noting the Epic integration timeline risk in the BCH partnership section
- Adding the Carbon Health cautionary reference as a "why cooperative economics matters" proof point

**gem-03-operational-protocol.md:**

- Hospital messaging should lead with manual/human coordination capability first, FHIR integration as the technology upgrade path — not the other way around

**gem-05-quick-reference.md:** No changes needed — it's high-level enough.

---

## Strategic Recommendations for Today's Call

### Agenda Item 1: Architecture Doc Reframe
Tell Jacob: "After reviewing the ACCESS RFA in detail, the architecture doc should be framed as a **CMS-compliant care orchestration platform**, not an EHR integration. CMS requires FHIR-based reporting TO CMS and electronic updates to other providers. It does NOT require Epic integration. Phase 1 architecture shows: Aidbox as our FHIR server, CMS API compliance, and HIPAA infrastructure. Epic integration is Phase 2+."

### Agenda Item 2: Aidbox Pricing with Pavel
Ask Pavel directly: "Production license is listed at $1,900/month. What's the startup program look like? We're a pre-revenue cooperative — can we get a case study arrangement that starts with the development license and graduates to production when we have PHI?"

### Agenda Item 3: Phase 1 Scope Clarification
Phase 1 deliverables should be:
1. HIPAA-compliant cloud infrastructure (AWS with BAA)
2. CII and CRI assessments live on the web (no PHI yet — lead generation tools)
3. Architecture document positioned as CMS ACCESS application narrative
4. Aidbox development instance configured with FHIR R4 resources for CareOS data model
5. CMS API integration architecture (Eligibility, Alignment, Data Reporting)

Phase 1 should NOT include:
- Epic FHIR integration (Phase 2+)
- Production PHI storage (until BAA and compliance tooling are in place)
- Billing code generation (until Clinical Director is secured)

### Agenda Item 4: The Pean Thesis as Positioning
Consider sharing Pean's article with Jacob and Pavel. It provides external validation from a Duke Health AI leader that co-op.care's architecture — care orchestration alongside the EHR, ACCESS-financed, human+AI delivery — is the correct strategic bet. It also frames the Epic integration timeline honestly, which builds trust with your engineering partners.

---

## One More Thing: Pean as a Potential Ally

Dr. Christian Pean is:
- CEO and Co-Founder of RevelAi Health (care orchestration startup)
- Executive Director of AI & IT Innovation at Duke Health Orthopedic Surgery
- Core Faculty at Duke Margolis Institute for Health Policy
- An orthopedic surgeon (your professional network)
- Building in the same white space (ACCESS, ASM, care orchestration)
- Frustrated by the same Epic integration barriers

He's not a competitor — RevelAi appears focused on the clinician workflow side. co-op.care is focused on the home care / community care / caregiver support side. There's a potential complementarity here, similar to the Elevate Cooperative relationship: RevelAi handles the clinical/specialist workflow, co-op.care handles the community care orchestration and caregiver support layer.

**Consider reaching out after the Cohesion engagement is locked.** An orthopedic surgeon building at the intersection of AI, CMS policy, and care coordination — who writes about the exact regulatory landscape co-op.care operates in — is a valuable contact regardless of whether a formal partnership emerges.
