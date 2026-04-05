# CO-OP.CARE — TECHNOLOGY ARCHITECTURE & CLINICAL AI
## CareOS, Aidbox FHIR Platform, CareCheck Assessments, and AI Governance
### Last Updated: February 27, 2026 — Version 3.0

---

## THE 4-LAYER SAFETY ARCHITECTURE

The foundational design principle: **AI alone under-triages 52% of emergencies.** Nature Medicine (Feb 2026, PMID 41731097) found ChatGPT Health — used by 40M people daily — has a 52% under-triage rate for gold-standard emergencies, an anchoring bias odds ratio of 11.7, and unpredictable suicide-crisis safeguards.

AI alone is not safe for clinical care. That's why co-op.care built 4 layers:

### Layer 1 — Enterprise AI (Aidbox + CareOS NLP)
- Aidbox FHIR R4 server provides the healthcare data backbone (replacing Bailey SDK)
- FHIR-native storage on PostgreSQL JSONB with full version history
- CareOS NLP engine maps plain-language caregiver notes to Omaha System clinical taxonomy
- 24/7 monitoring, medication adherence tracking, pattern detection
- Handles massive data normalization that no solo startup could build

### Layer 2 — Omaha System (CareOS Clinical Engine)
- Caregiver voice notes parsed by AI → mapped to Omaha System
- Public-domain clinical taxonomy: 42 problems, 4 domains, 75 intervention targets, KBS ratings 1–5
- F1 accuracy: 0.90 (GPT-4o-mini with RAG and few-shot learning)
- 10% residual error = mandatory human review before any data flows to billing
- Recognized by HHS. Operates entirely in public domain — no licensing costs.

### Layer 3 — Cooperative Labor (The Human Layer)
- Worker-owners know your parent personally
- They notice what sensors miss — a change in voice, a missed meal, a quieter morning
- When AI flags a concern, a real person shows up. Not an alert. Not a chatbot. A neighbor.
- Continuity of care = structural advantage of worker ownership

### Layer 4 — Clinical Director (MD/DO)
- Medicare-enrolled physician oversees every care plan
- Reviews every Omaha-coded observation before it becomes a FHIR R4 object
- Attests every PIN/CHI billing code before submission
- Assumes total professional responsibility for care quality, patient safety, regulatory compliance
- **Critical for ACCESS Model** — cannot draw federal funds without this role

---

## THE AIDBOX FHIR PLATFORM (REPLACING BAILEY SDK)

### Why Aidbox

The transition from Bailey SDK to Health Samurai's Aidbox platform represents a strategic shift from a client-side library to a server-side, FHIR-native backend. Aidbox is not a translation layer — it is a comprehensive development platform treating FHIR as foundational grammar.

**Pavel Smirnov** (CEO of Health Samurai/Aidbox) is on the Cohesion Phase 1 kickoff call. This is a direct relationship, not an arms-length vendor arrangement.

### Core Architecture

**Metadata-Driven Engine:** Every system component (REST operations, access control, validation) is a "meta-resource" manipulated via the same REST API as clinical data. Programmability and agility rarely seen in enterprise healthcare software.

**Technology Stack:**
- Clojure application server on JVM
- Immutable data structures (critical for clinical record integrity)
- Non-blocking I/O optimized for high-concurrency healthcare workloads
- Low latency even processing millions of resources

**Aidbox Format:** Isomorphic to official FHIR standard — every FHIR element has direct 1:1 mapping. Enables first-class extensions and custom resources beyond base FHIR while maintaining full compatibility for external exchange. On-the-fly conversion at /fhir endpoints to strict HL7 specs (R3, R4, R4B, R5, R6).

### Persistence Layer

**PostgreSQL JSONB Storage:**
- Each FHIR resource type gets exactly 2 tables: main (current) + history (version persistence)
- Every update = atomic transaction: existing record → history table → new version in main
- Complete, immutable audit trail of every modification
- Global transaction_id_seq ensures cross-resource ordering for any-point-in-time reconstruction
- Pure PostgreSQL access available for high-performance SQL queries (bypass FHIR API overhead)

**Schema Columns:**
- `id` — persistent resource identifier
- `txid` — global transaction ID for cross-resource ordering
- `resource` — JSONB representation of FHIR/Aidbox resource
- `status` — lifecycle (created, updated, deleted, recreated)
- `ts` — commit timestamp
- `cts` — immutable creation timestamp
- `resource_type` — FHIR resource class

### Search & Indexing

FHIR search parameters compiled into native PostgreSQL SQL expressions:
- B-tree indexes for primary identifiers
- GIN indexes for complex JSON structures
- Token searches via JSONB containment operator (@>)
- Reference searches for patient/encounter/observation navigation
- String modifiers: :contains, :exact, :missing
- Thousands of operations/second across hundreds of millions of resources

### Interoperability Beyond FHIR

**HL7 v2 Pipeline:**
- Transforms pipe-and-hat messages into FHIR resources
- Multi-step: raw message → intermediate JSON format → FHIR Bundle
- Preserves non-standard Z-segments and idiosyncratic EHR field usage
- Lisp-based DSL for mapping definitions

**C-CDA Converter:**
- Ingests discharge summaries and referral notes
- Decomposes into discrete FHIR resources (Observation, Condition, MedicationRequest)
- Critical for BCH hospital discharge integration

### Epic & Cerner Integration (SMART on FHIR)

**SMART on FHIR Applications:**
- Context-aware web apps launched from within EHR interface
- Receives patient ID, user ID, encounter ID via signed JWT
- Aidbox handles OAuth 2.0 handshake, token management
- Epic Showroom registration (4–8 week technical review)
- Cerner Code Console (Open Developer Experience)

**Backend Systems:**
- Persistent 24/7 integration outside clinician sessions
- Mix of FHIR APIs, HL7 v2 ADT feeds, webhooks
- Aidbox provides centralized integration layer mapping EHR-specific models to vendor-agnostic internal models
- Adding support for additional EHR vendors doesn't require rewriting application logic

### Security (AccessPolicy Engine)

- Attribute-Based Access Control (ABAC) and Relationship-Based Access Control (ReBAC)
- Matcho engine for 90% of scenarios (declarative rule matching)
- SQL engine for complex joins (e.g., verifying practitioner is on specific care team)
- "Tiny policies" linked to specific User, Client, or Operation resources
- FHIR Basic Audit Log Patterns (BALP) for HIPAA and 21st Century Cures Act compliance
- OpenTelemetry export for centralized monitoring

### SQL on FHIR (Analytics)

- ViewDefinition resources using FHIRPath → flat columns
- Native PostgreSQL execution (not slow in-memory processing)
- Materialized tables in dedicated `sof` schema
- Validated as reference implementation (peer-reviewed study, identical to Apache Spark/Pathling)
- AI-assisted ViewDefinition generator for non-technical analysts

### Project-Specific SDKs

Aidbox generates lightweight SDKs based on "Type Schema" — only resources actually needed:

| Language | Core Features |
|---|---|
| TypeScript | Static FHIR Client, type-safe resources, AccessPolicy testing |
| Python | Async support, safe_db testing, Pydantic validation |
| C# (.NET) | Firely.NET SDK integration, R4 core types |
| Java | Custom operations, high-concurrency handling |

### FHIR Schema Migration (Critical Note)

Health Samurai is migrating from legacy "Zen" engine to native FHIR Schema engine:
- Faster validation, more precise FHIRPath invariants and slicing
- JSON Schema-like representation (developer-friendly)
- Legacy Zen-based validation scheduled to become obsolete August 2025
- Migration: GET /deprecated/capabilities → parallel environment with AIDBOX_FHIR_SCHEMA_VALIDATION=true → systematic profile migration

### CMS FHIR vs. Epic FHIR (Critical Distinction)

CMS uses FHIR R4 for Bulk Data, claims/adjudication, quality reporting, patient access. This is NOT the same as Epic FHIR integration. co-op.care needs CMS FHIR for ACCESS Model compliance and outcome reporting. Epic/Cerner FHIR is needed for hospital discharge integration (BCH). Aidbox handles both through its vendor-agnostic abstraction layer.

---

## THE CARECHECK ASSESSMENT SUITE

### Tool 1: Caregiver Intensity Index (CII)

**Purpose:** Predictive health monitoring that detects family caregiver burnout prior to crisis. Primary user acquisition wedge.

**Structure:** 12 questions, each scored on a 1–10 slider

**Three Dimensions:**
1. **Caregiver Load** — Physical demands, time commitment, financial strain, medical complexity
2. **Emotional Impact** — Anticipatory grief, social isolation, guilt, compassion fatigue
3. **Support Systems** — Inverse-scored: family support, professional help, employer flexibility, self-care

**The 12 Questions:**
1. "I get a full, uninterrupted night of sleep." (reversed)
2. "I feel guilty that I am not doing enough for my parent or loved one."
3. "I have missed work, meetings, or career opportunities because of caregiving."
4. "I am delaying my own medical appointments or ignoring my own health."
5. "I feel completely alone in managing these responsibilities."
6. "I find myself losing my temper or patience more quickly than I used to."
7. "I am the only person who fully understands my loved one's medical and daily needs."
8. "I worry about the financial toll this care is taking."
9. "If I got sick for a week, my loved one's care plan would completely collapse."
10. "I wake up in the middle of the night worrying about what happens next."
11. "I have completely stopped participating in my own hobbies or social life."
12. "I feel like I am failing, no matter how hard I try."

**Scoring:** Raw sum normalized to 0–100. Three zones:
- **Green (≤45):** "Your caregiving load is currently manageable." Offer Time Bank resources.
- **Yellow (46–85):** "You are showing signs of real caregiver strain." Recommend shared care planning.
- **Red (>85):** "You are not failing. You are carrying more than one person should carry alone." Triggers intervention cascade.

**Red Zone Cascade Protocol:**
1. Screen changes to warm red/amber gradient
2. Message validates — "This is unsustainable, and it is not your fault"
3. Immediate options: Connect with neighbor (Time Bank), Schedule professional care, Call a human now
4. If employer-referred: HR receives anonymized aggregate data (never individual scores)

### Tool 2: Care Readiness Index (CRI)

**Purpose:** 14-factor acuity assessment evaluating care recipient needs. Auto-maps to service tier and caregiver matching.

**Structure:** 14 factors, each 1–5 (1 = independent, 5 = full assistance)

**The 14 Factors with Clinical Weights:**

| Category | Factor | Weight |
|---|---|---|
| Physical Function | Mobility | 1.0x |
| Physical Function | Bathing & Personal Hygiene | 1.0x |
| Physical Function | Toileting & Continence | 1.0x |
| Physical Function | Eating & Nutrition | 1.0x |
| Cognitive Function | Cognition & Memory | **1.3x** |
| Cognitive Function | Communication | 1.0x |
| Safety | Fall Risk | **1.1x** |
| Safety | Wandering & Elopement Risk | 1.0x |
| Medical Complexity | Medication Management | 1.0x |
| Medical Complexity | Chronic Condition Monitoring | 1.0x |
| Medical Complexity | Wound/Device/Equipment Care | 1.0x |
| Psychosocial | Behavioral & Emotional | 1.0x |
| Psychosocial | Social Isolation | 1.0x |
| Home Environment | Home Safety & Accessibility | 1.0x |

Cognition weighted 1.3x (strongest predictor of care escalation). Fall Risk weighted 1.1x (leading cause of injury-related hospitalization).

### CRI → Omaha System Crosswalk

Every CRI factor maps to specific Omaha System problems:
- Mobility (CRI) → Neuro-musculo-skeletal function (Omaha Domain 35)
- Cognition (CRI) → Cognition (Omaha Domain 28)
- Medication Management (CRI) → Prescribed medication regimen (Omaha Domain 24)
- Social Isolation (CRI) → Social contact (Omaha Domain 12)

This crosswalk enables automatic clinical documentation from the moment a family takes the CRI assessment.

---

## THE CAREOS NLP PIPELINE

### 5-Stage Deterministic Pipeline

**Stage 1: Data Capture**
Caregiver dictates/types narrative note:
> "Helped Mom with shower. She was dizzy getting out. BP was 142/88. She asked about Dad three times."

**Stage 2: NLP Parsing**
AI extracts entities into structured JSON:
```json
{
  "activities": ["bathing_assistance"],
  "symptoms": ["dizziness", "repetitive_questioning"],
  "vitals": {"systolic": 142, "diastolic": 88},
  "behavioral": ["confusion_possible_dementia_indicator"]
}
```

**Stage 3: Omaha System Mapping**
- Problem Classification: Circulation (Physiological), Cognition (Psychosocial)
- Intervention Targets: Surveillance → Signs/Symptoms; Teaching → Disease management
- KBS Ratings: Knowledge=3, Behavior=3, Status=2

**Stage 4: FHIR R4 Conversion (via Aidbox)**
Omaha-coded data packages into FHIR R4 Observation objects for hospital EHR ingestion. Aidbox handles the storage, versioning, and external exchange compliance.

**Stage 5: Billing + Verification**
- Maps encounter to CMS billing codes (PIN/CHI: G0019–G0024)
- GPS + timestamp → Medicaid-compliant EVV record
- No billing code submitted without Clinical Director attestation

### Five Simultaneous Outputs from One Note

From a single caregiver voice note, the system produces:
1. **Family-facing summary** — plain language for the Alpha Daughter
2. **Clinical summary** — Omaha-coded for physician review
3. **FHIR R4 objects** — for hospital EHR integration (via Aidbox)
4. **Billing codes** — PIN/CHI and ACCESS Model documentation
5. **EVV record** — GPS + time for Medicaid compliance

### AI Performance Benchmarks

| Model | Problem ID F1 | Sign/Symptom ID F1 |
|---|---|---|
| GPT-4o-mini (RAG-enhanced) | 0.90 | 0.90 |
| GPT-o3-mini (RAG-enhanced) | 0.83 | 0.82 |
| Llama 3.1-8B-Instruct (RAG) | 0.73 | 0.72 |
| Legacy Open-Source (NimbleMiner) | 0.84 avg | 0.84 avg |

**Governance:** F1 of 0.90 is exceptional, but 10% error is unacceptable for clinical/billing. Human-in-the-loop is NOT optional — it is a legal and clinical requirement.

---

## THE TECHNOLOGY STACK

### Production Architecture (Post-Cohesion Phase 1)
- **FHIR Backend:** Aidbox (Health Samurai) — PostgreSQL JSONB, metadata-driven, FHIR-native
- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Hosting:** Firebase Hosting (or Aidbox cloud)
- **Design System:** Playfair Display + DM Sans fonts; Teal (#0D7377) / Gold (#C9A84C) / Cream (#FAF7F2)
- **Architecture:** 40+ routes using /role/feature organization
- **Database:** Firestore for app state + Aidbox for clinical FHIR data
- **Assessments:** CII (12-slider) and CRI (14-factor) fully built as React components
- **AI Pipeline:** Cloud Functions → GPT-4o-mini with RAG → Omaha System mapping → Aidbox FHIR storage
- **Auth:** Firebase Auth
- **Payments:** Stripe integration
- **Mobile:** Progressive Web App for caregiver tools
- **EVV:** GPS + timestamp for Medicaid compliance
- **CI/CD:** Firebase-native or custom pipeline

### Deployment Architecture
- Local: Docker + Docker Compose (Aidbox container + PostgreSQL)
- Production: Kubernetes with Health Samurai Helm charts
- Configuration: Git-ops via Configuration Project files (version-controlled)
- Backups: CloudNativePG operator
- SSL: Ingress controllers

### Build Phases (Cohesion Phase 1 → Production)

**Phase 1 (Weeks 1–5, March–April 2026):** Aidbox FHIR setup, CareOS Omaha System engine, ACCESS Model application infrastructure
**Phase 2 (Q2 2026):** Employer benefit platform, CII/CRI integration with Aidbox, BCH discharge workflow
**Phase 3 (Q3 2026):** Caregiver dashboard, visit logging with AI translation, Time Bank, EVV compliance
**Phase 4 (Q4 2026):** Clinical Director dashboard, PIN/CHI billing, ACCESS outcome reporting, KBS tracking
**Phase 5 (2027):** Admin command center, equity tracking, CMS reporting, multi-region, Elevate API
