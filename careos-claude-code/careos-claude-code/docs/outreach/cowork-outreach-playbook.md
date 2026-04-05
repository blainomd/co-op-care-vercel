# Co-op.care Cowork Outreach Playbook

## The Play

Use Claude Cowork to run semi-automated, hyper-personalized outreach across your tiered contact database. Each contact gets researched individually, matched to the FCC value prop most relevant to their situation, and receives a custom email with a tailored one-pager — all without leaving Claude.

---

## Contact Tiers & Workflow

### Tier 1: Coop Best Leads (1,800 contacts)
**Who:** Pre-qualified prospects most likely to convert to founding families.
**Goal:** 200 founding families at $100 refundable deposit.

**Cowork Workflow:**
1. Feed Cowork a batch of contacts (name, email, org, role, any notes from CRM)
2. Cowork researches each contact:
   - LinkedIn profile → role, seniority, likely age bracket
   - Company → employer size, benefits offered, caregiving policies
   - Local context → Boulder Valley connection, proximity to target ZIP codes
3. Cowork classifies each contact into one of four FCC personas:
   - **Alpha Daughter** — Woman 45-60, managing aging parent care. Lead with: "Age at Home Care Insurance" positioning, CII assessment, falls prevention.
   - **Employer Champion** — HR/benefits leader. Lead with: $5,365 net savings per caregiver employee, absenteeism reduction, competitive benefit.
   - **Healthcare Insider** — Clinician or health system leader. Lead with: ACCESS Model alignment, eCKM conditions, Medicare credibility, cooperative model innovation.
   - **Community Builder** — Civic leader, nonprofit, faith community. Lead with: Community membership tier ($100/yr, 40 hrs volunteer), family caregiver-to-worker-owner pathway.
4. Cowork generates a personalized email + custom one-pager PDF for each contact
5. Cowork drafts the email in Gmail (not sends — you review first)

**Email Template Structure (Alpha Daughter example):**
```
Subject: [First Name], a new way to plan for [parent's/your family's] care in Boulder

Body:
- Personal hook (1 sentence referencing their situation)
- The problem (1 sentence on LTCI gaps or caregiver burden)
- The FCC solution (2 sentences on cooperative model + founding family opportunity)
- Specific number ($100 refundable deposit, what it unlocks)
- CTA: "See the attached overview — and if it resonates, I'd love 15 minutes."
- Signature with co-op.care link
```

**One-Pager PDF Customization:**
- Alpha Daughter → CII preview, falls prevention stats, "Age at Home Care Insurance" framing
- Employer Champion → ROI calculator snapshot, $5.2M Year 3 projection, employer partnership model
- Healthcare Insider → ACCESS Model alignment, four eCKM conditions, MSO-PC structure
- Community Builder → Volunteer pathway, cooperative governance, community density map

---

### Tier 2: Healthcare Priority (15,000 contacts)
**Who:** Broader healthcare network — potential partners, referral sources, future board candidates.
**Goal:** Awareness + warm lead generation. Convert 2-5% to active engagement.

**Cowork Workflow:**
1. Batch contacts in groups of 50-100
2. Lighter research pass — org type, role category, Boulder connection
3. Classify into Healthcare Insider or Employer Champion personas
4. Generate shorter, awareness-focused email (no one-pager attachment for this tier)
5. Include link to co-op.care with UTM tracking parameter per batch
6. Draft in Gmail for review

**Email Template Structure:**
```
Subject: Cooperative home care is coming to Boulder Valley

Body:
- Context hook (1 sentence on their org/role)
- What FCC is (2 sentences — worker-owned cooperative, founding family model)
- Why it matters to them specifically (1 sentence)
- CTA: "Worth a look → [co-op.care link with UTM]"
```

---

### Tier 3: Investor List (357 contacts)
**Who:** Angels, VCs, impact investors, strategic partners.
**Goal:** $50-100K initial investment conversations.

**Cowork Workflow:**
1. Deep research per contact — investment thesis, portfolio companies, healthcare interests
2. Custom email referencing their specific investment focus
3. Attached: Full business plan one-pager (Year 3 projections, unit economics, cooperative structure advantage)
4. Draft in Gmail for review — these get the most personal attention before sending

**Email Template Structure:**
```
Subject: [First Name] — cooperative model disrupting $100B home care market

Body:
- Connection hook (mutual contact, shared interest, their portfolio relevance)
- The thesis (2 sentences — structural inefficiency in home care, cooperative model advantage)
- The numbers ($5.2M revenue Year 3, $2.5M net income, $50-100K initial investment)
- The team (your three exits, BrainLAB track record, patent portfolio)
- CTA: "Happy to walk you through the model — 20 minutes?"
```

---

## Cowork Setup Instructions

### Step 1: Connect Gmail
In Claude's tools menu, enable the Gmail connector. This lets Cowork draft emails directly in your Gmail account.

### Step 2: Prepare Contact Batches
Export from your CRM in this format (CSV or markdown):
```
Name, Email, Organization, Role, Tier, Notes
Jane Smith, jane@company.com, Boulder Health, VP Benefits, employer_champion, Met at BVHD event
```

### Step 3: Prompt Template for Cowork
Copy and customize this prompt for each batch run:

```
I'm running outreach for co-op.care (Family Care Cooperative), a worker-owned 
home care cooperative launching in Boulder Valley. We're recruiting 200 founding 
families at $100 refundable deposits.

Here are my contacts for this batch: [paste batch]

For each contact:
1. Research them — LinkedIn, company, any public info on their caregiving or 
   healthcare involvement
2. Classify them as: alpha_daughter, employer_champion, healthcare_insider, 
   or community_builder
3. Draft a personalized email using the appropriate template below
4. Create the email as a draft in my Gmail

[Paste the relevant email template from this playbook]

Key facts about co-op.care:
- Worker-owned cooperative model (family caregiver → worker-owner pathway)
- Targeting Boulder Valley (80301-80310, 80027, 80026, 80516, 80503)
- $100 refundable founding family deposit
- "Age at Home Care Insurance" — not traditional LTCI
- CMS ACCESS Model aligned (eCKM, CKM, MSK, BH tracks)
- Year 3 projections: $5.2M revenue, $2.5M net income
- $5,365 net savings per caregiver employee for employer partners
- Founded by Blaine Warkentine, MD — orthopedic surgeon turned digital 
  health entrepreneur, three strategic exits (HCA, Paragon 28, Anytime Fitness)
```

### Step 4: Review Cadence
- **Tier 1 (Best Leads):** Review every draft before sending. These are high-value.
- **Tier 2 (Healthcare Priority):** Review first 10 per batch, then spot-check.
- **Tier 3 (Investors):** Review and personally edit every single one.

---

## Tracking & Pipeline

After Cowork drafts emails, track responses in your FCC CRM:

| Stage | Action | Next Step |
|-------|--------|-----------|
| Drafted | Email in Gmail drafts | Review & send |
| Sent | Email delivered | Wait 3-5 days |
| Opened | Track via UTM/response | Follow up |
| Replied | Got a response | Book call |
| Meeting | 15-20 min call | Present full model |
| Deposit | $100 founding family | Onboard |

---

## Volume Estimates

| Tier | Contacts | Batches (50/batch) | Cowork Sessions | Expected Conversions |
|------|----------|-------------------|-----------------|---------------------|
| Best Leads | 1,800 | 36 | 36 | 90-180 (5-10%) |
| Healthcare Priority | 15,000 | 300 | 300 | 300-750 (2-5%) |
| Investors | 357 | 8 | 8 | 18-36 (5-10%) |

**Target: 200 founding families from Tier 1 alone is achievable at 11% conversion.**

---

## What This Replaces

Without Cowork, this outreach would require:
- A VA or SDR ($3-5K/month)
- Manual research per contact (10-15 min each)
- Template customization (5-10 min each)
- Total: ~750 hours for the Best Leads tier alone

With Cowork: ~36 sessions, each running 30-60 minutes with review. Total: ~36 hours of your time for Tier 1.

**20x efficiency gain on your highest-leverage pre-launch activity.**
