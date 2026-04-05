# Co-op.care Financial Model Stress Test

**Date:** March 7, 2026
**Purpose:** Pressure-test every revenue, cost, and margin assumption in the Strategic Blueprint before investor and CMS conversations.

---

## 1. Revenue Stack Stress Test

### Layer 1: Private Pay ($35/hr)

| Assumption | Base Case | Bear Case | Bull Case | Risk |
|------------|-----------|-----------|-----------|------|
| Hourly rate | $35 | $30 | $40 | LOW — Boulder market supports $35; Genworth median for CO is ~$33 |
| Hours/client/week | 10 (blended) | 6 | 15 | MEDIUM — depends on acuity mix |
| Client acquisition (Year 1) | 50 families | 25 | 75 | HIGH — pre-license, assessment-only until mid-summer |
| Utilization rate | 80% | 60% | 90% | MEDIUM — scheduling gaps, cancellations |

**Base revenue (Year 1, post-license):** 50 clients × 10 hrs × $35 × 80% util × 26 weeks = $364,000
**Bear case:** 25 × 6 × $30 × 60% × 26 = $70,200
**Bull case:** 75 × 15 × $40 × 90% × 26 = $1,053,000

**Verdict:** The spread is enormous. Year 1 private pay is highly sensitive to client count and hours. The bridge from assessments ($150-$300) to actual care delivery is the critical gate.

---

### Layer 2: Membership Revenue

| Tier | Monthly Price | Year 1 Members (Base) | Year 1 Members (Bear) | Year 1 Members (Bull) |
|------|-------------|----------------------|----------------------|----------------------|
| Comfort Card | $0-$9.95 | 200 | 100 | 400 |
| Care Plan | $59 | 50 | 20 | 100 |
| Shield | $149 | 15 | 5 | 30 |
| Age at Home | $55+ | 0 (2027 launch) | 0 | 0 |

**Base annual revenue:** (200 × $5 × 12) + (50 × $59 × 12) + (15 × $149 × 12) = $12,000 + $35,400 + $26,820 = **$74,220**
**Bear case:** (100 × $5 × 12) + (20 × $59 × 12) + (5 × $149 × 12) = $6,000 + $14,160 + $8,940 = **$29,100**
**Bull case:** (400 × $5 × 12) + (100 × $59 × 12) + (30 × $149 × 12) = $24,000 + $70,800 + $53,640 = **$148,440**

**Verdict:** Membership revenue alone doesn't sustain operations in any scenario. It's a retention and data mechanism, not a primary revenue driver. That's fine — but don't pitch it as material revenue to investors.

---

### Layer 3: Assessment Revenue (Pre-License Bridge)

| Assumption | Base | Bear | Bull | Notes |
|------------|------|------|------|-------|
| CII/CRI price | $225 avg | $150 | $300 | HSA/FSA eligible with LMN |
| Assessments/month (May-Aug) | 20 | 8 | 40 | Requires active outreach |
| Months pre-license | 4 | 6 | 3 | CDPHE processing time |

**Base bridge revenue:** 20 × $225 × 4 = **$18,000**
**Bear case:** 8 × $150 × 6 = **$7,200**
**Bull case:** 40 × $300 × 3 = **$36,000**

**⚠️ CRITICAL FINDING:** At $10K starting capital, the bear case ($7,200 over 6 months = $1,200/month) does NOT cover operating costs. The burn rate for even minimal operations (Beazley premium, developer contractors, basic infrastructure) likely exceeds $3,000-$5,000/month.

**Survival threshold:** Need at least 15 assessments/month at $225 avg to generate $3,375/month — barely covering minimal burn. This makes the Cowork outreach playbook existentially important. The first 90 days of assessment bookings determine whether the company survives to licensure.

---

### Layer 4: Medicare CHI/PIN ($85-$120 PBPM)

| Assumption | Base | Bear | Bull | Notes |
|------------|------|------|------|-------|
| Payment per beneficiary/month | $100 avg | $85 | $120 | Verify against current fee schedule |
| Enrolled beneficiaries (Year 1) | 30 | 10 | 60 | Requires Medicare enrollment (CMS-855B) |
| Months active (Year 1) | 6 | 4 | 8 | Depends on enrollment processing |

**Base:** 30 × $100 × 6 = **$18,000**
**Bear:** 10 × $85 × 4 = **$3,400**
**Bull:** 60 × $120 × 8 = **$57,600**

**Verdict:** Meaningful only at scale. Not a Year 1 survival driver.

---

### Layer 5: Hospital Retainers (BCH)

| Assumption | Base | Bear | Bull | Notes |
|------------|------|------|------|-------|
| PBPM retainer | $100 | $85 | $120 | |
| Patients/month | 20 | 0 | 40 | Zero if BCH pilot doesn't close |
| Start month | Month 6 | Never | Month 4 | BCH deal is not signed |

**Base:** 20 × $100 × 6 = **$12,000**
**Bear:** **$0** — this deal isn't done yet
**Bull:** 40 × $120 × 8 = **$38,400**

**⚠️ FLAG:** The Blueprint treats BCH as a near-certainty. The bear case must assume zero hospital revenue in Year 1. Do not include this in survival math until an LOI or MOU is signed.

---

### Layer 6: Employer Benefits (BVSD)

| Assumption | Base | Bear | Bull | Notes |
|------------|------|------|------|-------|
| PEPM rate | $4.50 | $3 | $6 | |
| Covered employees | 500 | 200 | 1,000 | BVSD has ~6,000 employees |
| Start month | Month 8 | Never | Month 6 | |

**Base:** 500 × $4.50 × 4 = **$9,000**
**Bear:** **$0**
**Bull:** 1,000 × $6 × 6 = **$36,000**

**Same flag as BCH:** Not signed. Bear case = zero.

---

### Layer 7-8: CMS Innovation Models (ACCESS, MAHA ELEVATE)

**ACCESS OAP:** Application due April 1, 2026. Model launches July 2026. Even if accepted, Year 1 revenue = minimal during ramp.
- Base: $360/beneficiary × 20 beneficiaries × 0.5 (50% upfront) = **$3,600**
- Reality check: ACCESS is a multi-year play. Don't model material revenue until Year 2.

**MAHA ELEVATE:** $3.3M cooperative agreement over 3 years ≈ $1.1M/year IF awarded.
- Probability of award: Unknown. 30 awardees from unknown applicant pool.
- **Do not include in base case financial projections.** Model as upside scenario only.

---

## 2. Cost Structure Stress Test

### Year 1 Fixed Costs (Monthly)

| Item | Estimated Monthly | Notes |
|------|-----------------|-------|
| Beazley insurance premium | $800-$1,500 | Verify quote; critical — can't operate without it |
| Aidbox/FHIR platform | $500-$1,000 | Health Samurai pricing at startup tier |
| Contract developers | $2,000-$5,000 | Security hardening, auth, deployment |
| Legal (ongoing) | $500-$1,000 | Entity maintenance, contracts |
| Cloud infrastructure | $200-$500 | Firebase, hosting |
| Medical Director stipend | $0-$2,000 | Depends on equity vs. cash arrangement with Dr. Emdur |
| Marketing/outreach | $500-$1,000 | Digital, events, materials |
| Misc operations | $500 | |

**Estimated monthly burn:** $5,000-$12,500
**Estimated annual burn (Year 1):** $60,000-$150,000

### Year 1 Variable Costs (Post-License)

| Item | Per Unit | Notes |
|------|----------|-------|
| Caregiver wages | $25-$28/hr | W-2 with benefits adds ~30% burden = $32.50-$36.40 fully loaded |
| Payroll taxes & workers comp | ~$7-$9/hr | On top of base wage |
| Care coordination overhead | ~$3-$5/hr | Scheduling, QA, compliance |

**Fully loaded cost per care hour:** $35-$45/hr
**Billing rate:** $35/hr

**⚠️ CRITICAL FINDING:** At $35/hr billing and $35-$45/hr fully loaded cost, the private pay layer alone is MARGIN NEGATIVE in early operations. The cooperative model's margin comes from the blended revenue stack (memberships + assessments + Medicare codes + employer retainers layered on top of the base care delivery). This is the correct model — but it means the multi-layer stack isn't optional, it's survival-critical.

---

## 3. MGA Break-Even Deep Dive

The Blueprint claims break-even at 245 premium-paying members. Let's verify:

### Assumptions
- Average premium: $65/month × 12 = $780/year per member
- Target loss ratio: 80%
- Fixed firewall costs: $250,000/year
- Variable admin: ~5% of premium

### Math
- Premium revenue at 245 members: 245 × $780 = **$191,100**
- Claims payout at 80% MLR: $191,100 × 0.80 = **$152,880**
- Fixed costs: **$250,000**
- Variable admin (5%): **$9,555**
- Total costs: $152,880 + $250,000 + $9,555 = **$412,435**

**$191,100 revenue vs. $412,435 costs = NEGATIVE $221,335**

### ⚠️ THE MGA MATH DOESN'T WORK AT 245 MEMBERS

The Blueprint's break-even calculation appears to exclude the $250K firewall cost OR uses a different premium structure. Let me recalculate what's needed:

**True break-even with firewall:**
- Fixed costs: $250,000
- If 20% of premium goes to admin/profit after 80% MLR: Revenue × 0.20 = $250,000
- Revenue needed: $1,250,000
- Members needed: $1,250,000 / $780 = **1,603 members**

**Alternative interpretation:** The 245-member break-even may apply only to the MGA commission/fee structure (not the full insurance operation). If the MGA earns a 15% commission on premiums:
- Commission at 245 members: 245 × $780 × 0.15 = $28,665
- This doesn't cover $250K in firewall costs either

**Possible correct interpretation:** The Blueprint may be modeling the MGA break-even EXCLUDING the firewall as a startup cost funded by capital raise, with the 245 figure representing the point where ongoing MGA operations (commission revenue minus ongoing operating costs minus the firewall) reach zero. At $250K fixed + $780 × 245 members × (1 - 0.80 MLR - operating margin):

This needs the full actuarial model to resolve. **Recommendation: Build a standalone spreadsheet showing the MGA P&L with all assumptions explicit, and have it reviewed by the independent actuary before any investor conversation.**

---

## 4. $5.2M Year 3 Revenue Projection — Reverse Engineering

The Blueprint claims $5.2M revenue by Year 3. What does the member/client base need to look like?

### Required Revenue by Layer (Year 3 Estimate)

| Layer | Year 3 Revenue | Implied Scale |
|-------|---------------|---------------|
| Private Pay ($35/hr) | $1,500,000 | ~165 clients × 10 hrs/wk × 50 wks × 80% util |
| Memberships | $300,000 | ~400 members at blended $62/mo avg |
| Assessments | $150,000 | 50/month × $250 avg |
| Medicare CHI/PIN | $360,000 | 300 beneficiaries × $100/mo |
| Hospital Retainers | $240,000 | 200 patients × $100/mo |
| Employer Benefits | $432,000 | 8,000 covered employees × $4.50 PEPM |
| ACCESS OAPs | $100,000 | ~265 beneficiaries × $380 avg |
| MAHA ELEVATE | $1,100,000 | 1/3 of $3.3M cooperative agreement |
| Insurance Premiums | $500,000 | ~640 members × $780/yr |
| Other | $518,000 | Federation fees, consulting, etc. |
| **TOTAL** | **$5,200,000** | |

### Feasibility Assessment

| Layer | Feasibility | Confidence |
|-------|------------|------------|
| Private Pay | Achievable with 165 clients in Boulder County | MEDIUM |
| Memberships | 400 members by Year 3 is reasonable if Year 1 hits 200 founding families | MEDIUM |
| Assessments | Sustainable at 50/mo with clinical reputation | MEDIUM |
| Medicare CHI/PIN | Requires operational Medicare enrollment and coding infrastructure | MEDIUM |
| Hospital Retainers | Requires signed contracts with 2-3 hospitals | LOW-MEDIUM |
| Employer Benefits | 8,000 employees = BVSD + 2-3 more large employers | LOW-MEDIUM |
| ACCESS OAPs | Requires CMS acceptance + 12mo ramp + outcome attainment | LOW |
| MAHA ELEVATE | Binary: either awarded or not. 1-in-? odds | LOW |
| Insurance Premiums | Requires MGA operational by Year 2, 640 members by Year 3 | LOW |

**Verdict:** The $5.2M is achievable but MAHA ELEVATE ($1.1M) and Insurance Premiums ($500K) are the two least certain layers and together represent 31% of the projection. Without them, Year 3 revenue is closer to $3.6M — still strong, but materially different for investor conversations.

**Recommendation:** Present investors with a waterfall chart showing "Core Revenue" ($3.6M from layers 1-7) + "Upside Revenue" ($1.6M from MAHA ELEVATE + insurance) as distinct tiers. This builds credibility by acknowledging uncertainty.

---

## 5. $2.5M Net Income Claim — Reality Check

$2.5M net income on $5.2M revenue implies a **48% net margin**. This is extremely aggressive for a healthcare services company, especially a cooperative.

### Margin Analysis

**Typical healthcare services margins:** 3-8% (hospitals), 10-15% (home care agencies), 20-30% (tech-enabled care platforms)

**Co-op.care's claim of 48% requires:**
- Very low COGS (blended model offloads hours to Time Bank)
- High-margin revenue layers (assessments, memberships, CMS codes are high-margin vs. hourly care)
- MAHA ELEVATE grant counted as revenue (grants don't have COGS)

**If we remove MAHA ELEVATE grant from the calculation:**
- Revenue: $4.1M
- If net margin is 20% (aggressive but plausible for tech-enabled model): Net income = $820K
- If net margin is 30% (very aggressive): Net income = $1.23M

**Recommendation:** The $2.5M net income figure should be presented as the "full scenario including federal grants" with a clear callout that the core business net income is $800K-$1.2M. A sophisticated investor will do this math themselves — better to show it than have them find it.

---

## 6. Key Risks Summary

| Risk | Severity | Mitigation |
|------|----------|------------|
| Pre-license cash runway ($10K start) | CRITICAL | Assessment revenue must start by May 2026 |
| CDPHE license delay beyond 6 months | HIGH | Extend 1099 bridge model; accelerate assessment volume |
| BCH/BVSD partnerships don't close | HIGH | Diversify to other hospitals/employers immediately |
| CMS ACCESS application rejected | MEDIUM | Focus on commercial layers; reapply in next cycle |
| MAHA ELEVATE not awarded | MEDIUM | Don't include in base projections |
| MGA break-even math doesn't hold | HIGH | Get independent actuarial review before launching |
| SB 24-205 compliance costs exceed budget | MEDIUM | Leverage sandbox participation for extended timeline |
| Medical Director availability/commitment | CRITICAL | Formalize agreement with equity + stipend terms |
| 93M caregiver stat challenged in due diligence | MEDIUM | Fix citation now; use 53M NAC/AARP figure |

---

## 7. Recommendations for Investor Materials

1. **Lead with core business economics (Layers 1-6):** Show $3.6M Year 3 revenue as the base case. Federal innovation models and insurance are upside.

2. **Show the waterfall:** Core → CMS Models → Insurance → Full Scenario. Let investors see where certainty decreases.

3. **Fix the net margin claim:** 48% is not credible for healthcare services. Present 20-30% on core business, with grant revenue shown separately.

4. **Address the pre-license gap explicitly:** Show the assessment bridge revenue and burn rate. Investors need to know the company survives to licensure.

5. **MGA break-even needs rework:** The 245-member figure needs a standalone actuarial model. If the real number is 1,600, the path to insurance profitability looks very different.

6. **$5,365 employer savings claim:** This is on your resume and in the outreach playbook. Show the math: current employer cost of caregiver absenteeism/turnover minus co-op.care PEPM cost minus reduced absenteeism = net savings. Cite MetLife/AARP/Rosalynn Carter Institute caregiver-employee studies.
