# CMS ACCESS Model Application
## co-op.care Technologies LLC — Boulder, Colorado

**Application Deadline: April 1, 2026**
**Program Period: July 2026 – June 2036 (10 years)**
**Applicant Type: ACCESS Management Organization (AMO)**

---

## SECTION 1: ORGANIZATIONAL DESCRIPTION AND MISSION

### 1.1 Applicant Organization

co-op.care Technologies LLC is a Colorado Limited Liability Company formed in February 2026 to address the caregiving crisis through a technology-enabled, cooperative-owned home care delivery model. The organization operates as the technology and management entity within a federated cooperative structure designed to provide aging-in-place home care services that eliminate extraction layers between families and caregivers.

The organization applies to participate in the ACCESS Model as an ACCESS Management Organization (AMO), serving as the technology platform, clinical governance, and payer coordination entity that enables a network of worker-owned local cooperatives to deliver high-quality, technology-enabled chronic care management services in the home setting.

### 1.2 Founding Team and Relevant Experience

The founding team brings direct experience in healthcare technology commercialization, clinical system integration, and cooperative enterprise development:

**Blaine Warkentine, Founder and Managing Member** — Healthcare technology executive with experience building and scaling clinical technology products. Prior work includes building BrainLAB's orthopedic vertical (surgical navigation systems for joint replacement), participation in multiple healthcare technology M&A transactions, and extensive work with hospital systems on clinical workflow integration. This background provides direct operational knowledge of hospital discharge workflows, clinical documentation requirements, and the integration challenges that ACCESS is designed to address.

**Clinical Director (MD/DO)** — [To be confirmed prior to submission. Recruitment is active targeting Boulder-area physicians with experience in value-based care, geriatric medicine, or community health. The Clinical Director will oversee clinical safety protocols, care plan approval, and quality measurement.]

**Jacob Pielke, CEO, Cohesion Health (Engineering Partner)** — Leading the Phase 1 technology build including HIPAA-compliant cloud infrastructure, clinical assessment tools, and the production architecture documentation that forms the basis of this application's technology narrative.

**Pavel Smirnov, CEO, Health Samurai (FHIR Infrastructure Partner)** — Providing the Aidbox FHIR R4 platform that serves as the clinical data backbone. Health Samurai has deployed Aidbox for enterprise healthcare clients including Innovaccer (value-based care analytics at 10TB scale), Narus Health (3,000 client palliative care platform), BestNotes (2,000 behavioral health practices), and Prenosis (first FDA-authorized AI sepsis diagnostic).

### 1.3 Mission and Theory of Change

The care economy in the United States is structurally broken. Sixty-three million Americans provide unpaid care for aging family members. The median home care aide earns $16.77 per hour and faces 77% annual turnover. Facility care costs families $9,900 per month. The existing model extracts value at every layer — staffing agencies take 40-60% margins, corporate chains prioritize shareholder returns over care quality, and families are left navigating a fragmented system with no transparency, no data ownership, and no continuity.

co-op.care replaces this model with a cooperative structure where:

- **Caregivers** are W-2 employees earning $25-30/hour with equity ownership in the cooperative entity, resulting in projected turnover rates significantly below the 77% industry average
- **Families** pay $550-3,500/month for home-based care instead of $9,900/month for facility placement
- **Clinical documentation** uses the Omaha System standardized vocabulary mapped to FHIR R4 via the Aidbox platform, enabling structured outcome measurement, interoperable data exchange, and automated quality reporting
- **Technology overhead** is absorbed by the platform entity (the LLC), so every dollar of direct care spending flows to the caregiver and the family — not to intermediary extraction

The ACCESS Model is the federal validation mechanism that transforms this local cooperative into a scalable healthcare delivery platform. By providing recurring revenue ($180-420 per beneficiary per year) tied to measurable health outcomes, ACCESS creates the financial foundation for a care model that is simultaneously lower-cost for families, higher-wage for caregivers, and clinically accountable to CMS.

### 1.4 Target Population and Service Area

**Initial Service Area:** Boulder County, Colorado (ZIP codes 80301-80310, 80314, 80321-80323, 80328-80329)

**Target Population:**
- Medicare beneficiaries with chronic conditions aligned to ACCESS tracks: expanded cardiometabolic-kidney (eCKM), cardiometabolic-kidney (CKM), musculoskeletal (MSK), and behavioral health (BH)
- Primary focus on eCKM and CKM tracks, targeting beneficiaries with hypertension, prediabetes, diabetes, and cardiovascular disease — conditions that are among the most common drivers of home care needs
- Homebound and home-limited Medicare beneficiaries who are not currently receiving adequate chronic care management services
- Family caregivers (the "Alpha Daughter" demographic: working women ages 45-60 managing care for aging parents) who require coordination support to sustain home-based care

**Boulder County Demographics (relevant to ACCESS):**
- Population 65+: approximately 43,000 (2024 Census estimates)
- Medicare beneficiaries: approximately 35,000
- Estimated beneficiaries meeting ACCESS chronic condition criteria: 8,000-12,000
- Initial alignment target: 200 beneficiaries in Year 1, scaling to 500 by Year 3

### 1.5 Cooperative Structure and Legal Architecture

co-op.care operates as a federated system with three distinct layers, each with a specific function:

**Layer 1: co-op.care Technologies LLC (the AMO applicant)**
- Owns all intellectual property: CareOS clinical documentation platform, assessment tools (CII, CRI), NLP/ML pipeline, Omaha System coding engine
- Holds federal and payer contracts (ACCESS, Medicare Part B enrollment, hospital partnerships)
- Licenses the platform to local cooperatives under a services agreement
- Takes on technology and contracting risk, not clinical care delivery risk

**Layer 2: co-op.care Boulder Cooperative (care delivery entity)**
- Multi-stakeholder worker cooperative formed under Colorado cooperative law
- Employs caregivers as W-2 worker-owners ($25-30/hr, equity accumulation, patronage dividends)
- Holds home care agency license and clinical liability insurance
- Delivers direct care services under the Clinical Director's oversight
- Consumer-members (families) participate through annual membership and Time Bank contributions

**Layer 3: co-op.care Federation (future governance)**
- Governing agreement between the Technologies LLC and local cooperatives
- Sets quality standards, coordinates training, negotiates shared purchasing
- Enables replication: new cooperatives form when density thresholds are met in additional communities

This structure ensures that the ACCESS application and federal relationship are managed by a professionally governed LLC, while care delivery occurs through a worker-owned cooperative that aligns financial incentives with care quality.

---

## SECTION 2: TECHNOLOGY AND DATA INFRASTRUCTURE

### 2.1 Platform Architecture Overview

co-op.care's technology infrastructure is designed as a four-layer safety architecture that ensures every clinical observation captured by a caregiver is validated, coded, and transmitted through redundant quality checkpoints before generating any billing or reporting output:

**Layer 1: Aidbox FHIR R4 Platform + CareOS NLP Engine**
The foundation layer combines the Health Samurai Aidbox FHIR-native backend with co-op.care's proprietary CareOS natural language processing engine. Aidbox provides FHIR R4 resource storage via PostgreSQL JSONB, REST/GraphQL/Bulk FHIR APIs, OAuth 2.0/SMART on FHIR authorization, multi-tenant isolation, FHIR Subscriptions for event-driven routing, terminology services, and SQL on FHIR analytics. CareOS converts plain-language caregiver notes into structured clinical data through a five-stage pipeline.

**Layer 2: Omaha System Clinical Vocabulary**
All clinical observations are coded using the Omaha System — a standardized nursing vocabulary consisting of the Problem Classification Scheme (42 problems), Intervention Scheme (4 categories × 75 targets), and Knowledge-Behavior-Status (KBS) Outcome Rating Scale. The Omaha System provides the clinical structure that enables longitudinal outcome measurement, which is the foundation of ACCESS's Outcome Attainment Threshold.

**Layer 3: Cooperative Labor Model**
The worker-owned cooperative structure provides continuity of care that is structurally impossible in traditional high-turnover agencies. When the same caregiver works with the same family over months and years, they develop observational acuity that no algorithmic system can replicate. This human intelligence layer is the primary clinical safety mechanism.

**Layer 4: MD/DO Clinical Director Oversight**
The Clinical Director reviews care plans, validates clinical coding, approves escalation protocols, and provides the medical oversight required by the ACCESS Model. This layer ensures that technology-generated clinical codes are validated by a physician before any billing or quality reporting occurs.

### 2.2 FHIR R4 Infrastructure: Aidbox Platform

The clinical data backbone is the Health Samurai Aidbox platform, a metadata-driven, FHIR-native backend built on Clojure/JVM with PostgreSQL JSONB storage. Aidbox was selected for the following ACCESS-relevant capabilities:

**FHIR R4 Compliance:**
- Full FHIR R4 resource storage and retrieval via REST API
- US Core and Da Vinci profiles pre-configured for CMS interoperability
- On-the-fly conversion between internal Aidbox format and standard FHIR R4 at /fhir endpoints
- Support for FHIR R3, R4, R4B, R5, and emerging R6 specifications

**Data Persistence and Audit:**
- Each FHIR resource type stored in exactly two PostgreSQL tables (current + history)
- Global transaction ID sequence (txid) for cross-resource ordering and point-in-time database reconstruction
- Immutable audit trail: every update atomically moves the existing record to history before writing the new version
- FHIR AuditEvent resources generated for all CRUD operations and search requests (BALP compliance)

**Interoperability:**
- HL7 v2 pipeline for hospital discharge feed integration (critical for Boulder Community Health partnership)
- C-CDA converter for ingesting discharge summaries and referral notes as discrete FHIR resources
- SMART on FHIR implementation for future Epic/Cerner EHR integration
- FHIR Subscriptions (Topic-based) for event-driven routing between cooperative tenants

**Security and Compliance:**
- AccessPolicy engine supporting Attribute-Based Access Control (ABAC) and Relationship-Based Access Control (ReBAC)
- Matcho engine for declarative policy matching (90% of scenarios)
- SQL engine for complex authorization logic requiring database joins
- Multi-tenant isolation via Multibox (per-cooperative FHIR instances in shared runtime)
- OpenTelemetry export for centralized audit monitoring

**Analytics:**
- SQL on FHIR v2 implementation for tabular views of nested FHIR data
- ViewDefinition resources using FHIRPath expressions mapped to flat PostgreSQL columns
- Native PostgreSQL execution (not in-memory) — validated as reference implementation producing identical results to Apache Spark-based runners
- AI-assisted ViewDefinition generator for clinical report creation

### 2.3 Clinical Assessment Tools

**Caregiver Intensity Index (CII)**
A 12-question validated assessment measuring family caregiver burden across domains including sleep disruption, guilt, career impact, health neglect, isolation, emotional resilience, financial stress, and care plan fragility. Scoring produces three zones:

- Green Zone (≤45): Manageable caregiving load
- Yellow Zone (46-85): Significant strain requiring support
- Red Zone (>85): Crisis-level burden requiring immediate intervention

The CII includes a "Red Zone Cascade" — when any three individual sliders score 8+ simultaneously, the system triggers an immediate escalation regardless of total score, identifying acute crisis patterns that aggregate scores may mask.

CII data is captured as FHIR Observation resources in Aidbox with Omaha System problem codes mapped to domains.

**Care Readiness Index (CRI)**
A 14-factor clinical assessment measuring the care recipient's needs across activities of daily living (ADLs), instrumental ADLs, cognitive status, fall risk, medication complexity, social isolation, and home safety. Clinical weights are applied to each factor, with a 1.1x multiplier on fall risk given its outsized impact on hospital readmission.

The CRI maps to the Omaha System Problem Classification Scheme, enabling every assessment result to be coded in a standardized clinical vocabulary. CRI longitudinal tracking provides the outcome measurement foundation for ACCESS's Outcome Attainment Threshold — demonstrating measurable improvement in 50% of aligned beneficiaries.

### 2.4 CareOS Clinical Documentation Pipeline

CareOS is the proprietary NLP engine that converts plain-language caregiver observations into structured clinical data. The pipeline operates in five stages:

**Stage 1: Capture** — Caregiver enters a plain-language observation (e.g., "Mom seemed confused about her medication schedule today and almost took her blood pressure pill twice")

**Stage 2: Parse** — NLP engine extracts clinical entities: medication management concern, cognitive function observation, safety risk

**Stage 3: Omaha Mapping** — Extracted entities are mapped to Omaha System codes:
- Problem: Cognition (Domain 4, Problem 37)
- Intervention: Surveillance → signs/symptoms of medication management
- KBS Baseline: Knowledge=3, Behavior=2, Status=3

**Stage 4: FHIR R4 via Aidbox** — Coded observations are stored as FHIR resources:
- Observation (clinical finding with Omaha codes)
- CarePlan (updated with new intervention)
- CommunicationRequest (alert to Clinical Director if threshold crossed)
- AuditEvent (documentation trail)

**Stage 5: Outputs** — From a single caregiver note, the system simultaneously generates:
- FHIR R4 Observation resource (clinical interoperability)
- Omaha System coded record (outcome measurement)
- EVV record (visit verification with GPS/timestamp)
- Billing codes (PIN/CHI for CMS claims)
- Family-readable summary (plain-language care update)

**AI Validation:** Initial benchmarks using GPT-4o-mini for Omaha System coding achieve F1=0.90. Human-in-the-loop validation is mandatory — no AI-generated code is submitted for billing or quality reporting without Clinical Director review.

### 2.5 Electronic Visit Verification (EVV)

EVV compliance is built into the CareOS documentation workflow. Each caregiver visit is verified through:

- GPS-stamped check-in and check-out (mobile device location services)
- Timestamp verification against scheduled visit windows
- Service type documentation linked to care plan activities
- Caregiver identification verification
- Visit summary with clinical observations captured during the visit

EVV data is stored as FHIR Encounter resources in Aidbox, linked to the corresponding Observation, CarePlan, and Claim resources.

### 2.6 Outcome Measurement and Quality Reporting

The ACCESS Model requires that 50% of aligned beneficiaries demonstrate measurable health improvement (the Outcome Attainment Threshold) to earn the withheld outcome payment component.

co-op.care measures outcomes through:

**Omaha System KBS (Knowledge-Behavior-Status) Rating Scale:**
- Each identified problem is rated on three dimensions (1-5 scale each)
- Knowledge: what the individual knows about the condition
- Behavior: what the individual does in response to the condition
- Status: the individual's condition relative to the problem
- Improvement is measured as positive movement on any dimension over time

**CRI Longitudinal Tracking:**
- CRI assessments administered at intake, 30 days, 90 days, and quarterly thereafter
- Statistical comparison of CRI scores over time demonstrates improvement or decline
- Domain-specific tracking enables granular outcome reporting per ACCESS track

**FHIR-Based Quality Reporting:**
- SQL on FHIR ViewDefinitions create analytical views aligned to CMS quality measures
- Automated calculation of outcome attainment percentages per track
- Dashboard visibility for Clinical Director review and intervention prioritization
- Bulk FHIR export capability for CMS data submission requirements

### 2.7 Interoperability: Hospital and Provider Integration

**Boulder Community Health (BCH) Integration:**
- HL7 v2 ADT feeds for real-time discharge notifications via Aidbox's HL7 v2 pipeline
- C-CDA converter for ingesting discharge summaries as discrete FHIR resources
- FHIR-based care coordination with BCH's clinical systems
- Purpose: reduce blocked bed days (each costing BCH ~$2,500/day in unreimbursed care) by providing immediate post-discharge home care coordination

**Primary Care Provider Coordination:**
- FHIR CommunicationRequest resources for care team notifications
- Clinical Director co-management documentation for PCP coordination
- ACCESS co-management payment tracking (~$100/beneficiary/year for coordinating PCPs)

**CMS Data Exchange:**
- FHIR R4 Bulk Data export for claims, quality reporting, and patient access
- Da Vinci profiles for payer-provider data exchange
- Automated Claim resource generation from documented interventions with PIN/CHI billing codes

### 2.8 Security, Privacy, and HIPAA Compliance

**Technical Safeguards:**
- All data encrypted at rest (AES-256) and in transit (TLS 1.2+)
- Aidbox AccessPolicy engine enforces minimum necessary access per role
- Multi-tenant isolation ensures PHI is segregated by cooperative
- FHIR AuditEvent logging for all access (BALP compliance)
- OpenTelemetry integration for centralized security monitoring

**Administrative Safeguards:**
- HIPAA compliance platform (organizational policies, risk assessments, training)
- Business Associate Agreements with all vendors handling PHI
- Workforce training on HIPAA Privacy and Security Rules
- Incident response plan with 30-day breach notification procedures

**Physical Safeguards:**
- Cloud infrastructure hosted in HIPAA-compliant AWS environment
- No PHI stored on local devices (cloud-only architecture)
- Mobile device management for caregiver devices

**BAA Chain:**
- co-op.care Technologies LLC (Covered Entity) → Cohesion Health (engineering BA)
- co-op.care Technologies LLC → Health Samurai / Aidbox (FHIR infrastructure BA)
- co-op.care Technologies LLC → AWS (cloud hosting BA)
- co-op.care Technologies LLC → HIPAA compliance platform vendor (BA)

---

*[Sections 3-6 to be drafted in Weeks 2-4: Clinical Model and Care Delivery, Outcome Measurement Methodology, Financial Model and Payment Track Selection, Governance and Organizational Capacity]*

---

**Document Status:** DRAFT v1 — Sections 1-2 complete for internal review
**Next Review:** Week 2 (March 10-14, 2026) with Jacob Pielke (Cohesion) for technical accuracy
**Final Submission Target:** April 1, 2026
