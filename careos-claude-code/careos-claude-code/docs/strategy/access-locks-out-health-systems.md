# The CMS ACCESS Model Locks Health Systems Out—By Design

**My initial read on CMS's new chronic care payment model and why it fundamentally differs from what most people assumed it would do**

Blaine Warkentine · February 2026

---

Dr. Christian Pean published an excellent piece this week arguing that the EHR is going to kill most AI startups in healthcare. He's right about that. But buried in his analysis is a detail that deserves its own headline: the ACCESS Model isn't just a new payment pathway. It's a structural lockout.

I want to explain what I mean, because I think most people reading the ACCESS RFA are missing the single most important design decision CMS made.

## The FFS Exclusion Is the Whole Story

Here's the rule, straight from the RFA: ACCESS participants and their affiliated entities may not submit Medicare fee-for-service claims for aligned beneficiaries during active care periods.

Read that again.

If you're a health system — say, Boulder Community Health, or any of the 4,900 community hospitals in America — and you decide to participate in ACCESS as an organization, you cannot bill Medicare FFS for any service you provide to the same patient you're managing under the model. The exclusion extends to affiliates: any entity in which you hold 5% or more ownership, any entity you exercise operational or managerial control over, and any reassignment relationships under 42 CFR § 424.80.

CMS's claims processing systems will automatically suppress your FFS billing for those beneficiaries. Not a policy memo. Not a guideline. An automated kill switch on your revenue.

For a health system that runs on FFS — and despite two decades of value-based care rhetoric, most still do — this is disqualifying. A hospital cannot afford to forfeit office visit revenue, imaging revenue, lab revenue, and procedural revenue for every patient it enrolls in a $360/year payment model. The math doesn't work. It was never supposed to.

## CMS Built This for Outsiders

The RFA acknowledges this explicitly. CMS notes that "technology-enabled care organizations deeply integrate technology into delivery to provide continuous high-value care for chronic disease prevention and management" and that "most currently serve commercially insured populations where more flexible payment arrangements make participation feasible." The entire model is designed to bring these organizations into Medicare for the first time.

More than 500 technology-enabled care organizations have already signaled intent to apply. Noom, Oura, Teladoc — companies that have built their businesses in commercial insurance where outcome-aligned economics already exist. The ACCESS Model gives them a Medicare on-ramp that traditional providers structurally cannot use without cannibalizing their own revenue.

This is not accidental. This is the point.

CMS watched what happened with Remote Patient Monitoring codes — the business model became collecting device readings without demonstrated clinical impact. They watched CCM billing balloon into a documentation exercise. They designed ACCESS to prevent that pattern from repeating by making the FFS exclusion so aggressive that organizations whose business model depends on volume literally cannot participate without self-destructing.

## What This Means for the Care Orchestration Layer

Dr. Pean identifies the opportunity precisely: an orchestration layer that sits alongside the EHR, powered by AI agents and augmented humans, financed by policy-aligned reimbursement, and designed around the patient's journey rather than the clinician's documentation.

ACCESS is how that layer gets paid.

But here's what his analysis doesn't address — and it's what I spend all my time thinking about: who does the actual work between visits? Who shows up at someone's house when their blood pressure won't come down because they can't afford their medication, or they're eating what their 82-year-old spouse can cook, or they stopped taking their pills because they can't open the bottles?

Technology-enabled doesn't mean technology-only. The RFA is clear that care may be delivered in-person, virtually, asynchronously, or through other technology-enabled methods as clinically appropriate. CMS built flexibility into the delivery model precisely because they understand that managing hypertension for a 74-year-old in rural Colorado is a fundamentally different problem than managing it for a 55-year-old commercial insurance member with a smartphone and a Whole Foods within walking distance.

The 50% Outcome Attainment Threshold — the minimum share of aligned beneficiaries who must show measurable clinical improvement to earn full payment — demands that someone actually help people get better. Not monitor them. Help them. And for the Medicare population, that often means hands in homes.

## The Cooperative Model Fits the Gap Exactly

I'm building a worker-owned home care cooperative in Boulder, Colorado. We're applying for ACCESS. And I want to be transparent about why I think the cooperative model — not the venture-backed digital health model — is what this payment structure actually rewards.

The OAP for the early cardio-kidney-metabolic track is $360 per beneficiary per year. That's $30 a month. You cannot run a Silicon Valley cost structure on $30/month/patient. You cannot support $243 million in venture debt on $30/month/patient. You can, however, fund a caregiver who lives in the same neighborhood as the patient, makes $28/hour with equity ownership in the cooperative, and checks in twice a week to make sure the medication is sorted, the blood pressure cuff is being used, and the pantry has something in it besides canned soup.

That's not a technology problem. It's a labor economics problem. And cooperative ownership — where the margin that would normally flow to investors instead flows to the people doing the work — is what makes $30/month viable.

Add PIN and CHI billing codes (G0019–G0024) for the community health worker and navigator services that wrap around the ACCESS intervention, and the economics shift from marginal to sustainable. A cooperative caregiver conducting a home safety assessment, coordinating medication pickup, and documenting a care note that AI translates into FHIR R4 and Omaha System codes is simultaneously earning ACCESS OAPs, generating PIN/CHI claims, and producing the longitudinal outcome data that makes the whole model work.

## The 10-Year Signal

ACCESS runs through 2036. That's not a pilot. That's infrastructure.

CMS is telling the market: we are going to pay for outcomes in chronic care management for the next decade. If you can show that your model reduces total cost of care while improving clinical metrics, we will keep paying you. And if you can't, we'll publish your risk-adjusted results in a public directory so patients and referring physicians can see exactly how you performed.

For organizations that depend on information asymmetry — billing for activity regardless of outcome — this is existential. For organizations that actually make people healthier, it's a decade-long guarantee.

The LEAD Model, announced the same month as ACCESS, extends the same logic to ACOs through 2036. CARA creates episode-based risk arrangements for falls prevention within LEAD. The Ambulatory Specialty Model makes two-sided risk mandatory for 8,600 specialists starting January 2027. Every single CMS initiative announced in the last six months points in the same direction: outcomes, transparency, and accountability. The organizations that will thrive in this environment are the ones built for it from day one — not the ones trying to retrofit a FFS business model into an outcome-aligned world.

## The Honest Version

I'm a solo founder with $10K in capital building a home care cooperative in Boulder. I'm not pretending to have this figured out. What I have is a reading of federal policy that says the payment architecture is shifting toward exactly the model I'm building: human caregivers, AI-assisted clinical documentation, cooperative economics, and outcome-aligned federal reimbursement.

The ACCESS FFS Exclusion isn't a bug. It's the design. CMS built a door that only opens for organizations willing to be paid for results. Most health systems will stand outside that door, because walking through it means leaving their FFS revenue behind.

For a cooperative with no FFS revenue to protect? That door is wide open.

---

*Blaine Warkentine is the founder of Family Care Cooperative (co-op.care), a worker-owned home care cooperative launching in Boulder, Colorado. The cooperative is applying for the CMS ACCESS Model's first cohort with an April 1, 2026 deadline.*

*If you're a physician interested in serving as Clinical Director, a caregiver interested in ownership, or a family navigating care for an aging parent — I'd like to hear from you: blaine@co-op.care*
