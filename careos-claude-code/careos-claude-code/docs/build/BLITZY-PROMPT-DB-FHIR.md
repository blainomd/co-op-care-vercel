# co-op.care CareOS — DATABASE & FHIR INFRASTRUCTURE ADDENDUM
# Paste this AFTER the main prompt and first addendum.
# Covers: PostgreSQL as primary database, Health Samurai Aidbox as FHIR layer,
# and how they work together for the complete CareOS platform.

---

## DATABASE ARCHITECTURE DECISION: PostgreSQL + Aidbox Dual-Layer

CareOS requires two types of data simultaneously:

1. **Operational data** — Time Bank credits, task matching, user profiles, notifications, Comfort Card transactions, cooperative governance, employer dashboards. This is multi-model data: relational (users, families, memberships), graph (care team relationships, Time Bank cascades, impact chains), time-series (wearable vitals, CII trends), and real-time (live queries for dashboard updates, task matching notifications).

2. **Clinical data** — FHIR R4 resources (Patient, CarePlan, Observation, Condition, Procedure, QuestionnaireResponse, Encounter, Practitioner, Organization). This must be HIPAA-compliant, interoperable with hospital systems (BCH Epic via HL7 FHIR), and queryable using standard FHIR APIs for CMS reporting (ACCESS, LEAD, GUIDE).

**The architecture: PostgreSQL handles operational data. Aidbox handles clinical data. They communicate via event-driven sync.**

This is not redundancy — it's separation of concerns. PostgreSQL is the real-time operational brain. Aidbox is the clinical compliance layer. Neither can do the other's job well alone.

---

## LAYER 1: PostgreSQL — OPERATIONAL DATABASE

### Why PostgreSQL (Not PostgreSQL Alone)

co-op.care's operational data is inherently multi-model:

- **Graph:** Time Bank cascade chains (your help → their help → downstream impact), care team relationships (Conductor → Worker → Neighbor → Medical Director), faith community hub networks, referral chains
- **Document:** User profiles with variable schemas (Conductor has different fields than Worker-Owner has different fields than Time Bank Member), assessment scores with nested dimensions, care interaction logs with flexible task checklists
- **Relational:** Membership status, financial transactions (Comfort Card), equity tracking (Subchapter T patronage dividends), employer PEPM enrollment
- **Time-series:** Wearable vitals (heart rate, sleep, HRV every 5 minutes), CII score trends over months, Time Bank velocity metrics
- **Real-time:** Dashboard live updates (caregiver clock-in/out), Time Bank task matching (instant notifications), change-in-condition alerts
- **Geospatial:** Time Bank proximity matching (neighbors within 2 miles), GPS verification (check-in within 0.25 miles of task address)

PostgreSQL 16 (GA February 2026) handles ALL of these natively in a single query language (SQL). With PostgreSQL you'd need: PostgreSQL (relational) + a graph layer (Neo4j or recursive CTEs) + a document store (or JSONB with compromises) + a time-series extension (TimescaleDB) + a real-time layer (WebSockets via separate service) + PostGIS (geospatial). PostgreSQL collapses this to one binary.

### PostgreSQL Configuration

```
Version: PostgreSQL 16+
Deployment: PostgreSQL (e.g., Neon, Supabase) (managed) for production, local Docker for development
Storage: RocksDB (single-node) → TiKV (distributed cluster at federation scale)
Authentication: Built-in namespace/database/scope-level auth with JWT
Real-time: Native WebSocket connections for live queries
```

### PostgreSQL Schema — Operational Data

```sql
-- ═══════════════════════════════════════
-- NAMESPACE: coop_care
-- DATABASE: boulder (one per federation community)
-- ═══════════════════════════════════════

-- Users
DEFINE TABLE user SCHEMAFULL;
DEFINE FIELD email ON user TYPE string ASSERT string::is::email($value);
DEFINE FIELD phone ON user TYPE string;
DEFINE FIELD firstName ON user TYPE string;
DEFINE FIELD lastName ON user TYPE string;
DEFINE FIELD role ON user TYPE string ASSERT $value INSIDE ['conductor', 'worker_owner', 'timebank_member', 'medical_director', 'admin', 'employer_hr', 'wellness_provider'];
DEFINE FIELD zipCode ON user TYPE string;
DEFINE FIELD location ON user TYPE geometry(point);
DEFINE FIELD backgroundCheck ON user TYPE object;
DEFINE FIELD backgroundCheck.status ON user TYPE string ASSERT $value INSIDE ['not_started', 'pending', 'passed', 'failed', 'expired'];
DEFINE FIELD backgroundCheck.date ON user TYPE option<datetime>;
DEFINE FIELD backgroundCheck.expiresAt ON user TYPE option<datetime>;
DEFINE FIELD isActive ON user TYPE bool DEFAULT true;
DEFINE FIELD skills ON user TYPE array<string>;  -- for Time Bank matching
DEFINE FIELD availableFor ON user TYPE array<string>;  -- task types willing to do
DEFINE FIELD maxRadius ON user TYPE float DEFAULT 2.0;  -- miles for proximity matching
DEFINE FIELD createdAt ON user TYPE datetime DEFAULT time::now();

DEFINE INDEX user_email ON user FIELDS email UNIQUE;
DEFINE INDEX user_location ON user FIELDS location;
DEFINE INDEX user_zip ON user FIELDS zipCode;
DEFINE INDEX user_role ON user FIELDS role;

-- Families
DEFINE TABLE family SCHEMAFULL;
DEFINE FIELD name ON family TYPE string;
DEFINE FIELD membership ON family TYPE object;
DEFINE FIELD membership.status ON family TYPE string ASSERT $value INSIDE ['pending', 'active', 'grace_period', 'suspended', 'cancelled'];
DEFINE FIELD membership.startDate ON family TYPE datetime;
DEFINE FIELD membership.renewalDate ON family TYPE datetime;
DEFINE FIELD membership.stripeCustomerId ON family TYPE option<string>;
DEFINE FIELD primaryConductor ON family TYPE record<user>;
DEFINE FIELD careRecipientFhirId ON family TYPE option<string>;  -- links to Aidbox Patient resource
DEFINE FIELD activeLmnId ON family TYPE option<string>;  -- links to Aidbox DocumentReference
DEFINE FIELD createdAt ON family TYPE datetime DEFAULT time::now();

-- Time Bank Accounts
DEFINE TABLE timebank_account SCHEMAFULL;
DEFINE FIELD family ON timebank_account TYPE record<family>;
DEFINE FIELD balanceEarned ON timebank_account TYPE float DEFAULT 0;
DEFINE FIELD balanceMembership ON timebank_account TYPE float DEFAULT 40;
DEFINE FIELD balanceBought ON timebank_account TYPE float DEFAULT 0;
DEFINE FIELD balanceDeficit ON timebank_account TYPE float DEFAULT 0;
DEFINE FIELD lifetimeEarned ON timebank_account TYPE float DEFAULT 0;
DEFINE FIELD lifetimeGiven ON timebank_account TYPE float DEFAULT 0;
DEFINE FIELD lifetimeDonatedToRespite ON timebank_account TYPE float DEFAULT 0;
DEFINE FIELD impactScore ON timebank_account TYPE int DEFAULT 0;
DEFINE FIELD currentStreak ON timebank_account TYPE int DEFAULT 0;
DEFINE FIELD longestStreak ON timebank_account TYPE int DEFAULT 0;
DEFINE FIELD lastActivityDate ON timebank_account TYPE option<datetime>;

-- Time Bank Tasks
DEFINE TABLE timebank_task SCHEMAFULL;
DEFINE FIELD requestedBy ON timebank_task TYPE record<user>;
DEFINE FIELD requestedForFamily ON timebank_task TYPE record<family>;
DEFINE FIELD assignedTo ON timebank_task TYPE option<record<user>>;
DEFINE FIELD taskType ON timebank_task TYPE string ASSERT $value INSIDE ['meals', 'rides', 'companionship', 'errands', 'yard_work', 'housekeeping', 'phone_companionship', 'tech_support', 'admin_help', 'pet_care', 'grocery_run', 'teaching'];
DEFINE FIELD isRemote ON timebank_task TYPE bool;
DEFINE FIELD description ON timebank_task TYPE string;
DEFINE FIELD address ON timebank_task TYPE option<object>;
DEFINE FIELD location ON timebank_task TYPE option<geometry(point)>;
DEFINE FIELD scheduledDate ON timebank_task TYPE datetime;
DEFINE FIELD estimatedHours ON timebank_task TYPE float;
DEFINE FIELD actualHours ON timebank_task TYPE option<float>;
DEFINE FIELD status ON timebank_task TYPE string DEFAULT 'posted' ASSERT $value INSIDE ['posted', 'matched', 'accepted', 'in_progress', 'completed', 'cancelled', 'expired'];
DEFINE FIELD checkIn ON timebank_task TYPE option<object>;
DEFINE FIELD checkIn.time ON timebank_task TYPE option<datetime>;
DEFINE FIELD checkIn.location ON timebank_task TYPE option<geometry(point)>;
DEFINE FIELD checkOut ON timebank_task TYPE option<object>;
DEFINE FIELD checkOut.time ON timebank_task TYPE option<datetime>;
DEFINE FIELD checkOut.location ON timebank_task TYPE option<geometry(point)>;
DEFINE FIELD ratings ON timebank_task TYPE option<object>;
DEFINE FIELD matchScore ON timebank_task TYPE option<float>;
DEFINE FIELD createdAt ON timebank_task TYPE datetime DEFAULT time::now();

DEFINE INDEX task_status ON timebank_task FIELDS status;
DEFINE INDEX task_location ON timebank_task FIELDS location;
DEFINE INDEX task_date ON timebank_task FIELDS scheduledDate;

-- Time Bank Transactions (double-entry ledger)
DEFINE TABLE timebank_tx SCHEMAFULL;
DEFINE FIELD account ON timebank_tx TYPE record<timebank_account>;
DEFINE FIELD type ON timebank_tx TYPE string ASSERT $value INSIDE ['earned', 'spent', 'bought', 'donated_to_respite', 'membership_credit', 'expired', 'respite_received', 'referral_bonus', 'training_bonus'];
DEFINE FIELD hours ON timebank_tx TYPE float;
DEFINE FIELD relatedTask ON timebank_tx TYPE option<record<timebank_task>>;
DEFINE FIELD dollarAmount ON timebank_tx TYPE option<float>;
DEFINE FIELD note ON timebank_tx TYPE option<string>;
DEFINE FIELD expiresAt ON timebank_tx TYPE option<datetime>;
DEFINE FIELD createdAt ON timebank_tx TYPE datetime DEFAULT time::now();

-- ═══════════════════════════════════════
-- GRAPH RELATIONSHIPS (PostgreSQL native)
-- ═══════════════════════════════════════

-- Care team membership (relation table)
DEFINE TABLE member_of SCHEMAFULL;
DEFINE FIELD role ON member_of TYPE string;  -- 'conductor', 'primary_caregiver', 'backup_caregiver', 'timebank_neighbor', 'skilled_provider'
DEFINE FIELD startDate ON member_of TYPE datetime;
DEFINE FIELD isFavorite ON member_of TYPE bool DEFAULT false;
DEFINE FIELD rating ON member_of TYPE option<float>;
-- Usage: RELATE user:maria -> member_of -> family:chen SET role = 'primary_caregiver'

-- Time Bank help chain (relation table for cascade visualization)
DEFINE TABLE helped SCHEMAFULL;
DEFINE FIELD task ON helped TYPE record<timebank_task>;
DEFINE FIELD hours ON helped TYPE float;
DEFINE FIELD timestamp ON helped TYPE datetime DEFAULT time::now();
-- Usage: RELATE user:janet -> helped -> family:chen SET task = timebank_task:xyz, hours = 1.5
-- Cascade query: SELECT ->helped->family->helped<-user FROM user:lisa FETCH all

-- Referral chain
DEFINE TABLE referred SCHEMAFULL;
DEFINE FIELD timestamp ON referred TYPE datetime DEFAULT time::now();
DEFINE FIELD bonusHours ON referred TYPE float DEFAULT 10;
-- Usage: RELATE user:lisa -> referred -> user:karen

-- ═══════════════════════════════════════
-- REAL-TIME LIVE QUERIES
-- ═══════════════════════════════════════

-- Conductor Dashboard: live updates when a caregiver clocks in
-- Client subscribes: LIVE SELECT * FROM timebank_task WHERE requestedForFamily = family:chen AND status IN ['in_progress', 'completed']

-- Time Bank Feed: live task availability for a neighborhood
-- Client subscribes: LIVE SELECT * FROM timebank_task WHERE status = 'posted' AND geo::distance(location, $userLocation) < 3218  -- 2 miles in meters

-- Admin Dashboard: live match latency monitoring
-- Client subscribes: LIVE SELECT count(), math::mean(time::now() - createdAt) AS avgWait FROM timebank_task WHERE status = 'posted' GROUP BY zipCode

-- ═══════════════════════════════════════
-- GEOSPATIAL MATCHING QUERY
-- ═══════════════════════════════════════

-- Find nearest 5 qualified neighbors for a Time Bank task
-- SELECT * FROM user
--   WHERE role = 'timebank_member'
--   AND isActive = true
--   AND backgroundCheck.status = 'passed'
--   AND $taskType INSIDE availableFor
--   AND geo::distance(location, $taskLocation) < (maxRadius * 1609.34)
--   ORDER BY geo::distance(location, $taskLocation) ASC
--   LIMIT 5

-- ═══════════════════════════════════════
-- COMFORT CARD TRANSACTIONS
-- ═══════════════════════════════════════

DEFINE TABLE comfort_card_tx SCHEMAFULL;
DEFINE FIELD family ON comfort_card_tx TYPE record<family>;
DEFINE FIELD date ON comfort_card_tx TYPE datetime;
DEFINE FIELD description ON comfort_card_tx TYPE string;
DEFINE FIELD amount ON comfort_card_tx TYPE float;
DEFINE FIELD paymentSource ON comfort_card_tx TYPE string ASSERT $value INSIDE ['hsa_fsa', 'employer_pepm', 'ltci_reimbursement', 'pace_subcap', 'timebank_credit', 'private_pay'];
DEFINE FIELD isHsaEligible ON comfort_card_tx TYPE bool;
DEFINE FIELD irsPub502Category ON comfort_card_tx TYPE option<string>;
DEFINE FIELD createdAt ON comfort_card_tx TYPE datetime DEFAULT time::now();

-- Monthly HSA summary
-- SELECT paymentSource, math::sum(amount) AS total, count() AS transactions
--   FROM comfort_card_tx
--   WHERE family = family:chen
--   AND date >= '2026-03-01' AND date < '2026-04-01'
--   GROUP BY paymentSource

-- ═══════════════════════════════════════
-- WORKER-OWNER EQUITY
-- ═══════════════════════════════════════

DEFINE TABLE worker_equity SCHEMAFULL;
DEFINE FIELD worker ON worker_equity TYPE record<user>;
DEFINE FIELD quarterYear ON worker_equity TYPE string;  -- '2026-Q2'
DEFINE FIELD hoursWorked ON worker_equity TYPE float;
DEFINE FIELD equityRate ON worker_equity TYPE float;
DEFINE FIELD equityEarned ON worker_equity TYPE float;
DEFINE FIELD accumulatedEquity ON worker_equity TYPE float;
DEFINE FIELD vested ON worker_equity TYPE bool DEFAULT false;
DEFINE FIELD vestingDate ON worker_equity TYPE option<datetime>;

-- ═══════════════════════════════════════
-- RESPITE EMERGENCY FUND (singleton)
-- ═══════════════════════════════════════

DEFINE TABLE respite_fund SCHEMAFULL;
DEFINE FIELD balanceHours ON respite_fund TYPE float DEFAULT 0;
DEFINE FIELD balanceDollars ON respite_fund TYPE float DEFAULT 0;
DEFINE FIELD autoApprovalThreshold ON respite_fund TYPE float DEFAULT 100;
DEFINE FIELD lifetimeDisbursed ON respite_fund TYPE float DEFAULT 0;

-- ═══════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════

DEFINE TABLE notification SCHEMAFULL;
DEFINE FIELD userId ON notification TYPE record<user>;
DEFINE FIELD type ON notification TYPE string;
DEFINE FIELD title ON notification TYPE string;
DEFINE FIELD body ON notification TYPE string;
DEFINE FIELD data ON notification TYPE option<object>;
DEFINE FIELD channel ON notification TYPE string ASSERT $value INSIDE ['push', 'sms', 'email', 'in_app'];
DEFINE FIELD status ON notification TYPE string DEFAULT 'pending' ASSERT $value INSIDE ['pending', 'sent', 'delivered', 'read', 'failed'];
DEFINE FIELD scheduledFor ON notification TYPE option<datetime>;
DEFINE FIELD sentAt ON notification TYPE option<datetime>;
DEFINE FIELD readAt ON notification TYPE option<datetime>;
DEFINE FIELD createdAt ON notification TYPE datetime DEFAULT time::now();

DEFINE INDEX notif_user_status ON notification FIELDS userId, status;

-- ═══════════════════════════════════════
-- ASSESSMENTS (CII/CRI scores stored here,
-- clinical detail in Aidbox as QuestionnaireResponse)
-- ═══════════════════════════════════════

DEFINE TABLE assessment SCHEMAFULL;
DEFINE FIELD family ON assessment TYPE record<family>;
DEFINE FIELD type ON assessment TYPE string ASSERT $value INSIDE ['cii', 'cri', 'cii_quick'];
DEFINE FIELD scores ON assessment TYPE object;  -- dimension-keyed: { physicalCare: 8, cognitive: 6, ... }
DEFINE FIELD totalScore ON assessment TYPE float;
DEFINE FIELD zone ON assessment TYPE option<string> ASSERT $value INSIDE ['green', 'yellow', 'red'] OR $value IS NONE;
DEFINE FIELD fhirQuestionnaireResponseId ON assessment TYPE option<string>;  -- links to Aidbox
DEFINE FIELD reviewedByMD ON assessment TYPE bool DEFAULT false;
DEFINE FIELD completedAt ON assessment TYPE datetime DEFAULT time::now();
DEFINE FIELD previousAssessment ON assessment TYPE option<record<assessment>>;

-- ═══════════════════════════════════════
-- ACCESS CONTROL (PostgreSQL native scopes)
-- ═══════════════════════════════════════

-- Conductor scope: can only access own family data
DEFINE SCOPE conductor SESSION 24h
  SIGNUP (
    CREATE user SET email = $email, firstName = $firstName, lastName = $lastName, role = 'conductor', phone = $phone, zipCode = $zipCode
  )
  SIGNIN (
    SELECT * FROM user WHERE email = $email AND crypto::argon2::compare(password, $password)
  );

-- Worker scope: can only access assigned families
DEFINE SCOPE worker SESSION 12h
  SIGNIN (
    SELECT * FROM user WHERE email = $email AND role = 'worker_owner' AND crypto::argon2::compare(password, $password)
  );

-- Time Bank scope: can access tasks and own profile
DEFINE SCOPE timebank SESSION 24h
  SIGNIN (
    SELECT * FROM user WHERE email = $email AND role = 'timebank_member' AND crypto::argon2::compare(password, $password)
  );

-- Admin scope: full operational access (no PHI)
DEFINE SCOPE admin SESSION 8h
  SIGNIN (
    SELECT * FROM user WHERE email = $email AND role = 'admin' AND crypto::argon2::compare(password, $password)
  );
```

### PostgreSQL Key Advantages for co-op.care

1. **Graph traversal for cascade visualization:** `SELECT ->helped->family->helped<-user FROM user:janet` — one query to show the full impact chain. In PostgreSQL this requires recursive CTEs that become unwieldy at depth >3.

2. **Live queries for dashboard real-time:** `LIVE SELECT * FROM timebank_task WHERE requestedForFamily = family:chen` pushes WebSocket updates instantly when a caregiver clocks in. No polling. No separate WebSocket server.

3. **Geospatial matching:** `geo::distance(location, $taskLocation) < 3218` — native geospatial queries for proximity-based Time Bank matching. No PostGIS extension needed.

4. **Row-level permissions:** PostgreSQL scopes enforce that a Conductor can ONLY see their own family's data at the database level — not just the API level. Defense in depth.

5. **Multi-tenancy for federation:** Each community gets its own PostgreSQL database within the same namespace. `USE NS coop_care DB boulder;` vs `USE NS coop_care DB denver;`. Clean isolation, shared infrastructure.

6. **Single binary deployment:** PostgreSQL runs as one Rust binary. Docker, edge, embedded, or distributed cluster. No PostgreSQL + Redis + Neo4j + TimescaleDB stack to manage.

---

## LAYER 2: HEALTH SAMURAI AIDBOX — FHIR CLINICAL DATA

### Why Aidbox (Not Building FHIR From Scratch)

CareOS must:
- Store clinical data in FHIR R4 format for interoperability with BCH (Epic), TRU PACE, and CMS programs (ACCESS, LEAD, GUIDE)
- Generate and manage Letters of Medical Necessity as FHIR DocumentReference resources
- Store CII/CRI assessments as FHIR QuestionnaireResponse resources with coded scoring
- Exchange clinical data with hospital systems via HL7 FHIR REST APIs
- Maintain HIPAA-compliant audit trails for every clinical data access
- Support the Omaha System taxonomy (42 problems × KBS ratings) as coded observations
- Run SQL-on-FHIR queries for federal quality reporting

Building a FHIR server from scratch takes 12-18 months. Aidbox provides all of the above out of the box.

### Aidbox Configuration

```
Platform: Health Samurai Aidbox
FHIR Version: R4 (with R5/R6 migration path)
Storage: PostgreSQL with JSONB (Aidbox managed)
Deployment: Aidbox Cloud (managed) or self-hosted Docker
Auth: OAuth 2.0 + SMART-on-FHIR
Terminology: ICD-10, SNOMED CT, LOINC, Omaha System (custom CodeSystem)
APIs: FHIR REST, GraphQL, SQL-on-FHIR v2, Bulk Data, Subscriptions
```

### Aidbox FHIR Resources for CareOS

```
CLINICAL RESOURCES (stored in Aidbox):

Patient
  ├── demographics (name, DOB, address, contact)
  ├── conditions (ICD-10 coded: dementia, fall risk, CHF, diabetes, etc.)
  ├── medications (RxNorm coded)
  ├── allergies
  └── linked to PostgreSQL family via Patient.identifier

Practitioner
  ├── Josh Emdur, DO (Medical Director)
  ├── NPI, licensure, specialties
  └── RN, PT, OT, SLP providers

Organization
  ├── co-op.care Boulder (the cooperative)
  ├── BCH (Boulder Community Health)
  ├── TRU PACE (PACE provider)
  └── Community wellness providers

CarePlan
  ├── status: active
  ├── category: community care plan
  ├── addresses: Patient conditions
  ├── activity: each care source mapped
  │   ├── Professional care schedule
  │   ├── Time Bank services planned
  │   ├── Wellness program prescriptions
  │   └── Conductor training milestones
  └── period: start/end dates

QuestionnaireResponse
  ├── CII Assessment (12 dimensions, scored)
  │   ├── questionnaire: CII-v1
  │   ├── item[]: each dimension with valueInteger
  │   └── extension: zone classification, total score
  └── CRI Assessment (14 factors, clinically weighted)
      ├── questionnaire: CRI-v1
      ├── item[]: each factor with valueDecimal
      └── author: Practitioner (Medical Director)

Observation
  ├── Wearable vitals (heart rate, sleep, HRV, steps, SpO2)
  │   ├── code: LOINC coded
  │   ├── valueQuantity: numeric + unit
  │   ├── effectiveDateTime: timestamp
  │   └── device: Apple Watch reference
  ├── Omaha System KBS ratings
  │   ├── code: Omaha System problem code
  │   ├── component[]: Knowledge (1-5), Behavior (1-5), Status (1-5)
  │   └── effectiveDateTime: assessment date
  └── Change-in-condition reports
      ├── code: custom co-op.care code
      ├── valueString: worker narrative
      ├── interpretation: severity (routine/monitor/urgent/emergency)
      └── performer: worker-owner reference

Encounter
  ├── Each care interaction logged
  ├── type: personal_care, skilled_nursing, telehealth, wellness_visit
  ├── period: start/end times
  ├── participant: worker-owner + patient
  ├── reasonCode: linked conditions
  └── note: worker's care notes

DocumentReference
  ├── Letter of Medical Necessity (LMN)
  │   ├── type: LMN
  │   ├── status: current / superseded / entered-in-error
  │   ├── date: issued date
  │   ├── author: Medical Director
  │   ├── content: signed PDF attachment
  │   ├── context.related: Patient conditions justifying the LMN
  │   └── extension: IRS Pub 502 category, approved services list, expiration date
  └── Assessment reports (PDF exports of CII/CRI)

AuditEvent
  ├── Every access to clinical data logged
  ├── agent: who accessed
  ├── entity: what was accessed
  ├── outcome: success/failure
  └── recorded: timestamp
  (Aidbox generates these automatically via AuditBox module)
```

### Omaha System as Custom FHIR Terminology

```json
{
  "resourceType": "CodeSystem",
  "url": "https://co-op.care/fhir/CodeSystem/omaha-system",
  "name": "OmahaSystem",
  "title": "Omaha System Community Health Taxonomy",
  "status": "active",
  "content": "complete",
  "concept": [
    {
      "code": "01",
      "display": "Income",
      "definition": "Domain: Environmental. Financial resources."
    },
    {
      "code": "06",
      "display": "Mental health",
      "definition": "Domain: Psychosocial. Emotional and psychological functioning."
    },
    {
      "code": "19",
      "display": "Cognition",
      "definition": "Domain: Physiological. Memory, thinking, decision-making."
    },
    {
      "code": "35",
      "display": "Nutrition",
      "definition": "Domain: Health Related Behaviors. Diet and eating patterns."
    }
  ]
}
```

Load this as a custom CodeSystem in Aidbox using Init Bundle or the Terminology API.

### Aidbox Integration Points

```
1. FHIR Subscriptions (event-driven sync with PostgreSQL):
   - When a new QuestionnaireResponse (CII/CRI) is created → push to PostgreSQL assessment table
   - When a new Encounter is created → push to PostgreSQL for Comfort Card transaction generation
   - When an Observation (vitals) exceeds threshold → push anomaly alert to PostgreSQL notification table

2. BCH Epic Integration:
   - ADT (Admit-Discharge-Transfer) feed via HL7 v2 → Aidbox HL7 v2 adapter → FHIR Encounter
   - Discharge summary → FHIR DocumentReference
   - Trigger: new discharge with caregiver at home → PostgreSQL creates onboarding task

3. CMS Reporting:
   - SQL-on-FHIR ViewDefinitions for ACCESS Model quality metrics
   - Bulk Data export ($export) for LEAD/CARA program reporting
   - QuestionnaireResponse aggregation for CII outcomes data

4. SMART-on-FHIR Apps:
   - Conductor Dashboard can launch as SMART app within BCH's Epic patient portal
   - Medical Director console uses SMART-on-FHIR for clinical context

5. Aidbox Forms:
   - CII Questionnaire built using Aidbox Forms (no-code FHIR SDC builder)
   - CRI Questionnaire built using Aidbox Forms with clinical validation rules
   - Rendered in CareOS UI via embedded Aidbox Forms renderer
```

---

## LAYER 3: SYNC ARCHITECTURE — PostgreSQL ↔ Aidbox

```
                    ┌──────────────────────┐
                    │   CareOS Frontend    │
                    │   (React/TypeScript)  │
                    └────────┬─────────────┘
                             │
                    ┌────────▼─────────────┐
                    │   CareOS API Server   │
                    │   (Node.js/Fastify)   │
                    └───┬──────────┬────────┘
                        │          │
           ┌────────────▼──┐  ┌───▼────────────┐
           │   PostgreSQL   │  │  Aidbox FHIR   │
           │  (Operational) │  │  (Clinical)    │
           │               │  │                │
           │ Users         │  │ Patient        │
           │ Families      │  │ CarePlan       │
           │ Time Bank     │  │ Observation    │
           │ Comfort Card  │  │ Encounter      │
           │ Notifications │  │ Questionnaire  │
           │ Equity        │  │ DocumentRef    │
           │ Assessments*  │  │ AuditEvent     │
           └───────┬───────┘  └───────┬────────┘
                   │                  │
                   └──────┬───────────┘
                          │
                   Event Sync Layer
                   (Aidbox Subscriptions +
                    PostgreSQL Live Queries)

  * Assessment scores stored in both:
    - PostgreSQL: operational scoring, zone classification, trend queries
    - Aidbox: FHIR QuestionnaireResponse for clinical interoperability
```

### Sync Rules

```
AIDBOX → POSTGRESQL (clinical events trigger operational actions):
  New Encounter created            → Generate Comfort Card transaction
  Vitals Observation anomaly       → Create notification in PostgreSQL
  CRI completed by MD              → Update assessment record + LMN eligibility
  LMN signed                       → Update family.activeLmnId, enable Marketplace HSA badges
  Discharge ADT received           → Trigger onboarding workflow in PostgreSQL

POSTGRESQL → AIDBOX (operational events generate clinical records):
  CII assessment completed         → Create QuestionnaireResponse in Aidbox
  Worker logs care interaction     → Create Encounter + Observations in Aidbox
  Wearable data received           → Create Observation resources in Aidbox
  Time Bank task completed         → Create Encounter (community care type) in Aidbox
```

### API Server Routing

```
CareOS API Server routes requests to the appropriate backend:

/api/v1/auth/*              → PostgreSQL (user auth, JWT)
/api/v1/families/*          → PostgreSQL
/api/v1/timebank/*          → PostgreSQL
/api/v1/comfort-card/*      → PostgreSQL
/api/v1/notifications/*     → PostgreSQL
/api/v1/assessments/*       → PostgreSQL (scores) + Aidbox (FHIR resource)
/api/v1/employer/*          → PostgreSQL
/api/v1/equity/*            → PostgreSQL
/api/v1/admin/*             → PostgreSQL

/api/v1/clinical/patients/* → Aidbox (proxied FHIR API)
/api/v1/clinical/careplans/*→ Aidbox
/api/v1/clinical/vitals/*   → Aidbox
/api/v1/clinical/lmn/*      → Aidbox (DocumentReference)
/api/v1/clinical/encounters/*→ Aidbox
/api/v1/clinical/reports/*  → Aidbox (SQL-on-FHIR + Bulk Data)

/fhir/*                     → Aidbox (direct FHIR API for external integrations — BCH, TRU PACE, CMS)
```

---

## WHAT THIS CHANGES IN THE MAIN SPEC

Update the "Required stack components" section of the main Blitzy prompt:

**Backend (REPLACE):**
```
- Node.js (Fastify) — API server, routing between PostgreSQL and Aidbox
- PostgreSQL 16 — primary operational database (multi-model: document, graph, relational, time-series, geospatial, real-time)
- Health Samurai Aidbox — FHIR R4 clinical data platform (runs on PostgreSQL JSONB internally)
- Redis — optional caching layer (PostgreSQL handles most real-time needs natively)
```

**The data models in the first addendum remain valid as logical models.** PostgreSQL schema above is the physical implementation. Aidbox FHIR resources above are the clinical implementation. The API server bridges them.

---

## DEPLOYMENT TOPOLOGY

```
PHASE 1 (40 families):
  PostgreSQL (e.g., Neon, Supabase) (managed, single-node) — $0-50/month
  Aidbox Cloud (managed, dev tier) — free for development, ~$500/month production
  Vercel (frontend) — free
  Node.js API on Railway or Fly.io — ~$20/month

PHASE 2 (200 families):
  PostgreSQL (e.g., Neon, Supabase) (scaled) — ~$200/month
  Aidbox Cloud (production) — ~$1,000/month
  Dedicated API server — ~$100/month

PHASE 3+ (Federation):
  PostgreSQL distributed cluster (TiKV backend) — per-community database
  Aidbox Multi-tenant (Multibox) — per-community FHIR server
  Kubernetes orchestration
```

---

## CRITICAL INSTRUCTION

Do NOT merge PostgreSQL and Aidbox into one database. They serve different purposes and different compliance requirements. PostgreSQL is fast, flexible, and real-time. Aidbox is FHIR-compliant, auditable, and interoperable. The sync layer between them is intentionally thin and event-driven. This separation is what makes co-op.care both operationally excellent AND clinically compliant.

When building, start with PostgreSQL for ALL operational features (Time Bank, dashboard, notifications, Comfort Card, equity). Add Aidbox when you build the CII/CRI assessment engine and the clinical data pipeline. The frontend doesn't need to know which backend is serving data — the API server abstracts that.
