# CareOS — Technical Architecture Reference
## co-op.care's Operating System

---

## OVERVIEW

CareOS is the HIPAA-compliant Progressive Web App (PWA) serving as the operating system for co-op.care. It was designed and packaged as a full Claude Code bootstrap — 50+ files, 9,000+ lines of code — with a 10-session build plan. Phase 1 output was validated as production-ready via the Blitzy AI platform.

---

## DATABASE ARCHITECTURE

**Dual-Database Design:**
- **PostgreSQL** — Operational database for real-time application state, user management, scheduling, Time Bank transactions, and care coordination workflows
- **Aidbox FHIR R4** — Clinical data store providing full FHIR R4 compliance for health records, care plans, clinical observations, and interoperability with external health systems

This dual architecture separates operational agility (PostgreSQL) from clinical compliance (FHIR R4) while maintaining data synchronization between the two.

---

## CLINICAL ARCHITECTURE: OMAHA SYSTEM

The Omaha System is implemented as the native, first-class clinical framework — not bolted on, but foundational. Components:

**Problem Classification Scheme** — Standardized taxonomy of 42 problems across four domains (Environmental, Psychosocial, Physiological, Health-Related Behaviors) used to classify all member care needs.

**Intervention Scheme** — Standardized categories (Teaching/Guidance/Counseling, Treatments/Procedures, Case Management, Surveillance) and targets for all care activities.

**Problem Rating Scale for Outcomes (PRSO)** — Knowledge, Behavior, and Status ratings (1–5 scale) tracked over time to measure care effectiveness.

**CareOS Implementation:**
- Crosswalk engine mapping between Omaha System problems/interventions and FHIR R4 resources
- Knowledge-Based System (KBS) tracking for clinical decision support
- Omaha System codes as the primary clinical language across all CareOS modules

---

## ASSESSMENT INSTRUMENTS

**Care Independence Index (CII) — 12 Dimensions**
A proprietary assessment measuring a member's independence across 12 dimensions of daily living and wellness. Used for:
- Initial member assessment and care plan creation
- Ongoing tracking of independence trajectory
- Alpha Daughter conversion funnel (web-based self-assessment)
- Matching care intensity to member needs

**Care Risk Index (CRI) — 14 Weighted Factors**
A proprietary risk stratification instrument with 14 weighted factors predicting care escalation, hospitalization risk, and resource utilization. Used for:
- Proactive care planning
- PACE sub-capitation risk adjustment
- Resource allocation within the cooperative
- Clinical oversight prioritization by Medical Director

Scoring tables for both CII and CRI are ready for implementation in the build plan.

---

## TIME BANK

The Time Bank is co-op.care's internal currency system for care exchange.

**Mechanics:**
- Members earn credits by contributing to the cooperative (caregiving, training, community activities)
- Credits can be redeemed for care services
- 12-month graduated credit expiry (credits lose value over time to encourage circulation)
- Prevents hoarding while rewarding sustained participation

**Comfort Card**
The Comfort Card is the reconciliation instrument for Time Bank transactions — the physical/digital mechanism through which credits are tracked, spent, and balanced across members and the cooperative.

---

## WEBSITE / CONVERSION FUNNEL

The co-op.care website (multiple iterations through v7, v8) targets Alpha Daughter conversion:

1. **CII Assessment** — Self-service Care Independence Index assessment for the aging parent
2. **Density Mapping** — Shows cooperative coverage and caregiver availability in the family's area
3. **Founding Member Deposit Flow** — $100 refundable deposit collection
4. **"Age at Home Care Insurance" Framing** — Positions co-op.care membership against traditional LTCI, emphasizing ongoing relationship vs. episodic coverage

---

## BUILD APPROACH

- Full Claude Code bootstrap: 50+ files, 9,000+ lines
- 10-session progressive build plan
- Phase 1 validated via Blitzy AI platform as production-ready
- Designed for AI-augmented development (Claude Code as primary build tool)
- All clinical architecture (Omaha System, CII, CRI) implemented as first-class modules, not afterthoughts
