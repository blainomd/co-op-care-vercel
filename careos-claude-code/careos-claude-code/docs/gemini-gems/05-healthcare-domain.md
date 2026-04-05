# co-op.care — Healthcare Domain & Payment Model Reference

---

## CMS PAYMENT MODELS RELEVANT TO co-op.care

**PACE (Program of All-inclusive Care for the Elderly)**
Capitated model for dual-eligible seniors (Medicare + Medicaid) aged 55+ who qualify for nursing home level of care but can live safely in the community. PACE organizations receive a fixed monthly payment per enrollee and are responsible for all care. co-op.care's strategy: sub-contract care delivery under TRU PACE (Lafayette, CO) capitation rather than becoming a PACE organization directly. This is the highest-margin revenue layer.

**LEAD (Limiting Avoidable Disability) / CARA (Center for At-Risk Americans)**
Newer CMS models targeting home and community-based services. Expected to provide institutional revenue starting 2027. These models pay for keeping people out of institutional settings — directly aligned with co-op.care's mission.

**GUIDE Model (Dementia Care)**
CMS model for comprehensive dementia care. Blaine analyzed this extensively and determined it was too CMS-dependent for primary revenue but relevant for clinical protocol design.

**ACCESS Model**
CMS primary care payment tracks analyzed in depth. Blaine concluded these were better suited for primary care practices than cooperative care delivery, but the analysis informed revenue architecture decisions.

**Hospice Per Diem Economics**
Analyzed as a reference for understanding capitated end-of-life care economics. Informed the full-acuity-spectrum design of co-op.care (companion → palliative without relationship rupture).

**RTM/RPM Billing (Remote Therapeutic/Physiologic Monitoring)**
Blaine built KineticFirst, an AI-native MSK care model around RTM billing and the ACCESS Model. This work preceded and informed co-op.care's approach to technology-enabled care delivery.

---

## CLINICAL FRAMEWORK: OMAHA SYSTEM

The Omaha System is co-op.care's native clinical architecture. It is a standardized, research-based framework used in community health, home care, and public health.

**Three Components:**
1. Problem Classification Scheme — 42 problems across 4 domains (Environmental, Psychosocial, Physiological, Health-Related Behaviors)
2. Intervention Scheme — 4 categories (Teaching/Guidance/Counseling, Treatments/Procedures, Case Management, Surveillance) × 75 targets
3. Problem Rating Scale for Outcomes (PRSO) — Knowledge, Behavior, Status on 1–5 Likert scales

**Why Omaha System (not OASIS, not MDS):**
- Designed for community and home-based care (not institutional)
- Covers the full person, not just clinical deficits
- Maps cleanly to FHIR R4 resources
- Supports the cooperative's wellness-to-palliative spectrum
- Enables standardized quality measurement across federated cooperatives

---

## PROPRIETARY ASSESSMENT INSTRUMENTS

**Care Independence Index (CII) — 12 Dimensions**
Measures member independence across daily living and wellness. Serves triple duty: clinical assessment, care plan driver, and Alpha Daughter conversion tool (web self-assessment).

**Care Risk Index (CRI) — 14 Weighted Factors**
Risk stratification predicting care escalation, hospitalization, and resource needs. Used for proactive care planning and PACE risk adjustment.

---

## HSA/FSA ELIGIBILITY STRATEGY

The Medical Director (Dr. Emdur) issues Letters of Medical Necessity that make community wellness referrals (yoga, fitness, nutrition, mental health) eligible for HSA/FSA reimbursement. This is a strategic differentiator: co-op.care doesn't just deliver care hours, it unlocks financial access to the entire local wellness ecosystem for its members.

---

## KEY REGULATORY CONTEXT

- W2 employment of caregivers (not 1099) — deliberate choice for quality, retention, and legal compliance
- HIPAA compliance required for CareOS platform
- State home care licensing requirements for Boulder County operations
- Cooperative incorporation under Colorado cooperative statutes
- Federation structure separates IP/payer risk (Technologies LLC) from care delivery risk (city cooperatives)
