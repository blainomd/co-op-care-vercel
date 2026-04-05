# 0. Agent Action Plan

## 0.1 Product Understanding


### 0.1.1 Core Product Vision

Based on the prompt, the Blitzy platform understands that the new product is **CareOS** — a comprehensive, mobile-first, worker-owned home care cooperative platform operating under the brand **co-op.care**. CareOS is the full operating system for a CDPHE Class A licensed home care cooperative in Colorado that unifies five distinct sources of care into a single dashboard, governed by one Medical Director, and payable through one unified payment instrument (the Comfort Card).

**Functional Requirements (Explicit):**

- **Conductor Dashboard (Mobile-First PWA):** Real-time care timeline aggregating all caregiver interactions, notes, wearable vitals, and appointments in chronological order. Displays Time Bank credit balances, Comfort Card monthly summaries, push notifications for condition changes, and CII/CRI assessment tools.
- **Time Bank Engine:** A double-entry ledger system with GPS-verified task matching, half-life credit decay, a 40-hour/year membership floor, a 20-hour deficit limit, $15/hr cash purchase option, 12-month graduated expiry, and a Respite Emergency Fund auto-funded by the 0.1-hour Respite Default deduction and $3 from every $15/hr purchase.
- **Omaha System ↔ ICD-10 Crosswalk Engine:** A configurable rules engine (not a static table) that ingests ICD-10 codes from hospital discharges, maps them to one or more of the 42 Omaha System problems, generates Care Plans, triggers LMN creation, and populates Comfort Card tax categories. Stored in Aidbox as FHIR `ConceptMap` resources.
- **KBS Outcome Tracking:** Knowledge, Behavior, and Status ratings (1-5 scale) at intake, 30, 60, and 90 days for every active Omaha problem. Syncs to Aidbox as FHIR `Observation` resources linked to `Condition` (Omaha Problem).
- **CII/CRI Assessment Engine:** Caregiver Intensity Index (12 dimensions, scored 1-10, total /120) with zone classification (Green ≤40, Yellow 41-79, Red ≥80). Care Readiness Index (14 factors, clinical acuity scoring, min raw 14.4, max raw 72.0) with Medical Director review workflow.
- **LMN Marketplace:** E-commerce style interface for booking HSA/FSA-eligible community wellness programs, with LMN lifecycle management (draft → pending_signature → active → renewal_due → expired), annual renewal automation, and running HSA/FSA savings totals.
- **Comfort Card (Unified Payment):** Consolidates all payment sources (HSA/FSA, PEPM, LTCI, PACE sub-cap, Time Bank credit, private pay) into a single monthly statement with IRS Pub 502 categorization and exportable tax statements.
- **Worker-Owner Portal:** Daily assignment schedules, Ambient Scribe voice-to-text care logging (powered by Google Gemini API), GPS clock-in/out, cooperative equity tracking, governance voting, shift swapping, and direct messaging with Conductor and Medical Director.
- **Admin/Coordinator Dashboard:** Operational metrics, Michaelis-Menten dashboard (requests/members/match time per ZIP code), manual Time Bank matching, background check tracking, and Respite Emergency Fund management.
- **Employer Dashboard:** Aggregate anonymized CII results for workforce, productivity impact calculator, PEPM enrollment/utilization metrics, and quarterly ROI reports.
- **Public Website + Ambient Guide:** Conversion-focused landing page with an AI conversational interface (Ambient Guide) powered by `gemini-3.1-flash` that proactively guides visitors through the cooperative model, Time Bank, LMN tax savings, and Product Strategy Map.
- **Secure Messaging:** Platform-wide messaging between all care team roles.

**Non-Functional Requirements:**

- **Security:** HIPAA compliance (clinical data), AES-256 encryption at rest, TLS 1.3 in transit, RBAC with 7 roles, PHI audit logging, 2FA mandatory for clinical/admin roles, SOC 2 Type II target. JWTs stored in Secure, HttpOnly cookies (never localStorage). PWA Service Workers must bypass caching for PHI-containing API responses.
- **Performance:** <2s page load, <30s match notification, <200ms API reads.
- **Scalability:** Phase 1 single-server → Phase 2 horizontal scaling → Phase 3 microservices → Federation multi-tenant.
- **Reliability:** 99.9% uptime SLA, 6-hour backups, graceful degradation, Persistent Event Sync Layer (Transactional Outbox) guaranteeing at-least-once delivery between PostgreSQL and Aidbox.
- **Compliance:** CDPHE Class A, IRS Publication 502, Subchapter T cooperative law, Colorado SB 24-205.

**Implicit Requirements (Surfaced by Analysis):**

- **Omaha Coding for Time Bank Tasks:** All Time Bank tasks must auto-map to Omaha System interventions (e.g., "Meals Delivered" = Omaha #35 Nutrition), making community care clinically documentable.
- **LOINC Mapping for Wearables:** Apple Health data must map to specific LOINC codes (e.g., 8867-4 for Heart Rate) and store as FHIR `Observation` resources.
- **Aidbox Init Bundle:** A startup bundle is required to load `CodeSystem` (Omaha taxonomy), `ConceptMap` (ICD-10 crosswalk), and `Questionnaire` (CII/CRI) resources into Aidbox on deployment.
- **Graph Relationships in PostgreSQL:** The `helped` relation table (Time Bank cascade), `member_of` relation table (cooperative governance), and Time Bank proximity matching require PostgreSQL's relational capabilities with foreign keys.
- **Behavioral Economics Logic:** Half-life decay, Respite Default nudge (opt-outable), deficit nudges at -5/-10/-15/-20, streak tracking, viral loop triggers (after 3rd completed task), and the Liquidity Nudge all require embedded business rules.
- **Seed Data:** Seed scripts must populate the concrete user stories (Lisa, Janet, Patricia) for demonstrations.

### 0.1.2 User Instructions Interpretation

**Technology Stack Directives (Explicit):**

- Frontend: React 18+ (TypeScript), Vite, PWA with strict PHI cache-bypassing, TanStack Query for server state, Zustand for client state, Tailwind CSS with centralized brand colors, Web Speech API, Recharts or Chart.js, Framer Motion
- Backend: Node.js with Express (preferred for middleware compatibility)
- Operational Database: PostgreSQL (graph, document, relational, time-series, geospatial, real-time)
- Clinical Database: Aidbox FHIR R4 (PostgreSQL with JSONB, managed)
- Caching/Streaming: Redis (caching, real-time notifications via persistent streams)
- AI: Google Gemini API (`@google/genai`) for Ambient Scribe (`gemini-2.5-flash-native-audio-preview` or Web Audio + `gemini-3.1-flash`) and Ambient Guide (`gemini-3.1-flash`)
- Integrations: Stripe (payments), Apple Health API (wearables), Twilio (SMS), SendGrid (email), Google Maps API (geospatial), DocuSign/HelloSign (LMN signing), Zoom API (telehealth), HL7 FHIR
- Infrastructure: Vercel (frontend), AWS/GCP (backend), HIPAA-compliant hosting (BAA), Docker, GitHub Actions

**Architecture Directives:**

- Dual-database architecture: PostgreSQL (operational) + Aidbox (clinical) communicating via Persistent Event Sync Layer (Transactional Outbox)
- "AIDBOX is the source of truth for clinical data (FHIR); PostgreSQL is the source of truth for operational/graph data."
- "Do NOT use fire-and-forget Redis Pub/Sub for clinical data sync."
- Single application with role-based views (NOT separate apps per user type)
- Hash-based router with persistent navigation bar (existing pattern in codebase)

**Anti-Pattern Directives (Must NOT Build):**

- No marketplace for browsing/hiring individual caregivers — algorithmic + coordinator-curated matching only
- No separate apps per user type — one app, role-based views
- No custom real-time video — Zoom API integration only
- No insurance claims engine — Comfort Card is reporting/reconciliation, not claims processing
- No complex drag-and-drop scheduling — simple coordinator-assigns, worker-confirms model
- No long Time Bank onboarding gate — first interaction within 24 hours, background checks proceed in parallel
- No clinical-feeling CII assessment — warm, conversational, slider-based UX
- No gamification with points/levels/badges/leaderboards — only streaks and impact scores with warm community tone
- No dark patterns for Respite Default — genuinely easy one-tap opt-out
- No storage of SSNs, full credit card numbers, or bank account numbers — Stripe and background check API handle these

**Existing Codebase Integration Directive:**

User Example: "The existing React communication suite (Website, ProductMap, Enzyme, CareUBI, Synthesis) should be integrated as the public-facing layer immediately. The CareOS platform features build behind a login wall alongside it."

Existing files to preserve and enhance:
- `src/theme.ts` — centralized brand colors, fonts, mobile hook
- `src/App.tsx` — hash-based router with persistent navigation bar
- `src/Website.tsx` — public-facing site (integrate Ambient Guide)
- `src/ProductMap.tsx` — investor-facing product strategy map
- `src/Enzyme.tsx` — behavioral design framework
- `src/CareUBI.tsx` — policy/research thesis
- `src/Synthesis.tsx` — cross-cutting throughlines

**Key Numbers (Immutable Constants):**

- 63M US family caregivers (AARP 2025)
- 27 hours/week average unpaid care
- $7,200/year out-of-pocket per caregiver
- 77% annual agency turnover (Home Care Pulse 2024)
- 1,717 BVSD teachers (NOT 6,000)
- 341 TRU PACE enrollees
- 15.4% BCH readmission rate
- $16,037 average readmission cost
- CII: 12 dimensions, scored 1-10 each, total /120
- CRI: min raw 14.4, max raw 72.0

### 0.1.3 Product Type Classification

- **Product Category:** Full-stack web application — Mobile-first Progressive Web App (PWA) with desktop-responsive interfaces, backed by a Node.js API server connecting dual databases (PostgreSQL + Aidbox FHIR).
- **Target Users:** 7 distinct roles — Conductor (family caregiver), Time Bank Member (neighbor), W-2 Worker-Owner (professional caregiver), Wellness Provider, Employer HR, Medical Director, System Admin/Coordinator. Some users hold multiple roles simultaneously (e.g., a Conductor can also be a Time Bank member).
- **Primary Use Cases:** Care coordination (Conductor), community care exchange (Time Bank), clinical documentation (Worker-Owner/Medical Director), wellness marketplace access (Conductor/Wellness Provider), workforce caregiver burden analytics (Employer HR), and operational oversight (Admin).
- **Scale Expectations:** Production-ready from Phase 1 for 40 founding families in Boulder County, Colorado. Designed to scale to 600 members by Year 5, and to multi-city federation in Phase 3+. HIPAA-compliant from day one — no prototype shortcuts permitted for clinical data.
- **Maintenance and Evolution:** Three-phase build strategy. Phase 1 is the minimum viable cooperative (auth, Conductor Dashboard, Time Bank core, CII assessment, Stripe integration, Omaha Crosswalk Engine). Each phase builds on validated usage data from the prior phase. The phased dependency map ensures no circular dependencies between phases.


## 0.2 Background Research


### 0.2.1 Technology Research

Web search research conducted includes:

**PostgreSQL 16 (Operational Database):**

<cite index="8-1">The funding extension coincides with the general availability release of PostgreSQL 16, which the company describes as its most stable, high-performance, and enterprise-ready version to date.</cite> <cite index="8-7">Built in Rust, PostgreSQL 16 is designed to unify multiple data models within a single platform, including relational, document, graph, time-series, vector, search, geospatial, and key-value data types.</cite> <cite index="9-6">PostgreSQL 16 introduces architectural updates aimed at improving reliability and operational consistency, including a redesigned on-disk document representation, separation of stored values from executable expressions, ID-based metadata storage and synchronized writes enabled by default.</cite> This aligns perfectly with CareOS's multi-model requirements — graph data for Time Bank cascades, geospatial for proximity matching, time-series for wearable vitals, document-based for user profiles, and real-time WebSocket for dashboard live updates. <cite index="10-5">Key highlights include full support for PostgreSQL 16, multi-session support, automatic token refreshing, client side transactions, a redesigned live query API, and a new query builder pattern that makes working with your data more intuitive than ever.</cite>

**Aidbox FHIR Platform (Clinical Database):**

<cite index="11-4,11-5">Aidbox manages FHIR data with the power of PostgreSQL — fully under your control. Aidbox stores resources transparently as JSONB, enabling you to query, join, and aggregate by any element, with full support for transactional operations, reporting, and seamless migrations.</cite> <cite index="14-1,14-2">Aidbox supports STU3, R4, R4B, R5, R6 ballot3, with full CRUD, history/versioning, conditional operations, transactions and full implementation of Structured Data Capture (SDC): extract, populate, Questionnaire, and QuestionnaireResponse.</cite> <cite index="13-5">Enterprise-grade security with OAuth 2.0, multitenancy, flexible user management, granular access policies, and complete audit trails.</cite> This directly supports HIPAA-compliant clinical data storage, the CII/CRI QuestionnaireResponse resources, and the Omaha System CodeSystem/ConceptMap hosting. <cite index="16-18">Built-in OAuth 2.0 and OpenID Connect authorization server with granular access control policies using JSON Schema, SQL, and Matcho DSL, plus SMART App Launch support.</cite>

**Express.js v5 (Backend Framework):**

<cite index="31-5,31-6">After years of development, the long-awaited Express v5 has been officially released. This version focuses on simplifying the codebase, improving security, and dropping support for older Node.js versions to enable better performance and maintainability.</cite> <cite index="32-2">Latest version: 5.2.1.</cite> <cite index="31-10">Middleware can now return rejected promises, caught by the router as errors.</cite> The native Promise support in Express v5 eliminates the need for async wrapper middleware, which is essential for CareOS's many async operations (database queries to both PostgreSQL and Aidbox, Stripe API calls, Gemini API calls).

**React 18+ with Vite and TypeScript:**

<cite index="23-9,23-10">As of 2025, Vite has firmly established itself as the go-to build tool for modern React applications, offering near-instant startup, lightning-fast hot module replacement (HMR), and a highly optimized production build process. With the deprecation of older tools like Create React App (CRA), It is no longer just an alternative—it's the new standard for frontend development.</cite> <cite index="21-22">Whether you're starting a brand-new project or migrating from an older setup, this powerful trio provides a streamlined development experience with fast hot module replacement (HMR), first-class TypeScript support, and a lean, production-ready build system.</cite>

**TanStack Query + Zustand (State Management):**

<cite index="43-6,43-7,43-8">Zustand handles client state — user preferences, UI state, form data, and application-specific logic that lives entirely in your app. TanStack Query handles server state — data fetched from APIs, caching, synchronization, and all the complexity that comes with managing data that lives on your server.</cite> <cite index="49-11">The React version is still on v5 (currently v5.90.11, released October 2023).</cite> This separation of concerns mirrors CareOS's architecture: Zustand for local UI state (active role view, navigation state, form draft data), TanStack Query for server-fetched data (Time Bank balances, care timelines, assessment scores).

**Omaha System Clinical Taxonomy:**

<cite index="54-17,54-18">The Omaha System is a standardized health care terminology consisting of an assessment component (Problem Classification Scheme), a care plan/services component (Intervention Scheme), and an evaluation component (Problem Rating Scale for Outcomes). Approximately 22,000 health care practitioners, educators, and researchers use Omaha System to improve clinical practice, structure documentation, and analyze secondary data.</cite> <cite index="51-15,51-16,51-17">The Problem Classification Scheme includes 42 problems and 335 symptoms and signs in four domains: environmental, psychosocial, physiological and health‐related behaviour domains. It enables to diagnose the problems of individuals, families and communities at actual, potential and health promotion levels. The Intervention Scheme consists of four categories: treatments and procedures; teaching, guidance and counselling; case management; and surveillance in addition to 76 targets for intervention.</cite> <cite index="55-8,55-9,55-10">The Omaha System terms, definitions, and codes have existed in the public domain since 1975. Therefore the terms, definitions, and codes as they appear in Appendices A and E are not held under copyright. They are available for use without permission from the publisher or the developers, and without a licensing fee.</cite> This public domain status is critical — CareOS can embed the full 42-problem taxonomy as a FHIR CodeSystem in Aidbox without licensing concerns.

### 0.2.2 Architecture Pattern Research

**Dual-Database Sync Pattern:**

The CareOS architecture requires a dual-database pattern where PostgreSQL handles operational data and Aidbox handles clinical data. Research confirms the Transactional Outbox pattern as the industry standard for guaranteeing at-least-once delivery between heterogeneous data stores. This pattern involves writing sync events to an outbox table within the same transaction as the primary write, then a separate poller/consumer reads from the outbox and delivers to the target system. This avoids the dual-write problem and ensures no clinical data is lost in transit.

**HIPAA-Compliant PWA Architecture:**

PWAs for healthcare require strict Service Worker discipline: all API responses containing PHI must bypass the cache entirely, using `Cache-Control: no-store` headers and explicit cache exclusion rules in the Service Worker. The PHI boundary must be enforced at the API layer, with clear separation between cacheable public content (marketing pages, wellness provider listings) and non-cacheable protected content (care timelines, clinical assessments, wearable vitals).

**FHIR-First Clinical Architecture:**

The Aidbox platform natively supports the FHIR resource types needed: `Patient`, `CarePlan`, `Observation`, `Condition`, `Encounter`, `QuestionnaireResponse`, `DocumentReference`, `ConceptMap`, `CodeSystem`, `CareTeam`, `Procedure`, and `AuditEvent`. The ConceptMap resource is purpose-built for terminology crosswalks (ICD-10 ↔ Omaha System), making it the correct FHIR resource for the Crosswalk Engine.

**Anti-Patterns Identified and Avoided:**

- Fire-and-forget messaging for clinical data (risk of data loss)
- Single-database approach attempting to handle both FHIR compliance and graph operations (neither PostgreSQL nor PostgreSQL alone satisfies both requirements)
- Microservice decomposition in Phase 1 (premature; monolithic modular is appropriate for 40 families)
- Custom video calling implementation (Zoom API integration is the correct approach)
- Marketplace-driven caregiver selection (contradicts the cooperative model)

### 0.2.3 Dependency and Tool Research

**Latest Stable Versions of Proposed Technologies:**

| Technology | Version | Registry | Status |
|---|---|---|---|
| React | 18.3.x | npm | Stable |
| TypeScript | 5.x | npm | Stable |
| Vite | 6.x | npm | Stable |
| TanStack Query | 5.x | npm | Stable (React) |
| Zustand | 5.x | npm | Stable |
| Tailwind CSS | 3.x / 4.x | npm | Stable |
| Framer Motion | 11.x | npm | Stable |
| Recharts | 2.x | npm | Stable |
| Express.js | 5.2.1 | npm | Stable (GA) |
| PostgreSQL | 16.x | Docker/Binary | GA |
| node-postgres (pg) | 8.x | npm | Stable |
| Aidbox | Latest (R4) | Docker/Cloud | Stable |
| Stripe Node SDK | Latest | npm | Stable |
| Google Generative AI | Latest (`@google/genai`) | npm | Stable |
| Redis | 7.x | Docker | Stable |
| Node.js | 22.x LTS | nvm | Active LTS |

**Compatibility Matrix:**

- PostgreSQL 16 + node-postgres (pg) v8.x: Full compatibility confirmed
- Aidbox FHIR R4 + Node.js TypeScript SDK: Native support
- Express v5 + Node.js 22 LTS: Fully supported (Node.js 18+ required)
- React 18 + Vite 6 + TypeScript 5: First-class support via `react-ts` template
- TanStack Query v5 + React 18: Full compatibility
- Zustand 5 + React 18: Full compatibility

**Development Tool Recommendations:**

- **Testing:** Vitest (unit, aligned with Vite), Playwright (E2E, specifically for Omaha Crosswalk Pipeline and Time Bank round-trip tests)
- **Linting:** ESLint v9 with TypeScript parser, eslint-plugin-react-hooks, eslint-plugin-jsx-a11y
- **Formatting:** Prettier
- **API Documentation:** OpenAPI/Swagger for REST endpoints
- **CI/CD:** GitHub Actions with Docker-based pipelines
- **Container Orchestration:** Docker Compose for local development (Node.js API + PostgreSQL + Aidbox + Redis)


## 0.3 Technical Architecture Design


### 0.3.1 Technology Stack Selection

**Primary Language: TypeScript 5.x**
- Rationale: Full-stack type safety across React frontend and Node.js backend. Enables shared type definitions for data models, API contracts, and FHIR resource interfaces. TypeScript's strict mode catches errors at compile time, which is critical for clinical data handling where runtime errors can have patient safety implications.

**Frontend Framework: React 18+ with Vite 6.x**
- Rationale: React 18's concurrent features (Suspense, startTransition) support the complex dashboard UX with multiple data streams (wearable vitals, care timeline, Time Bank balance, notifications). Vite provides sub-second HMR and optimized production builds. PWA capability with Service Worker for offline resilience and push notifications.

**Server State Management: TanStack Query v5**
- Rationale: Handles all server-fetched data — care timelines, Time Bank balances, assessment scores, Comfort Card statements — with automatic caching, background refetching, and optimistic updates for mutations (e.g., accepting a Time Bank task).

**Client State Management: Zustand 5.x**
- Rationale: Lightweight store for UI-specific state — active role view, navigation state, form draft data, notification preferences, Ambient Guide conversation context. Clean separation from server state managed by TanStack Query.

**CSS Framework: Tailwind CSS**
- Rationale: Utility-first approach enables rapid mobile-first development with consistent spacing, color, and typography. Centralized brand colors in `tailwind.config.ts` aligned with existing `src/theme.ts`. Tiny production bundles via PurgeCSS.

**Backend Framework: Express.js v5.2.x**
- Rationale: User explicitly stated "Express preferred for middleware compatibility." Express v5's native Promise rejection handling eliminates async wrapper boilerplate. Massive middleware ecosystem supports Helmet (security headers), CORS, cookie-parser (HttpOnly JWT cookies), compression, and rate limiting. Existing `server.ts` uses Express.

**Operational Database: PostgreSQL 16**
- Rationale: Multi-model database natively supports the five data paradigms CareOS requires — graph (Time Bank cascade chains, care team relationships), document (user profiles, variable-schema assessments), relational (membership status, financial transactions), time-series (wearable vitals, CII score trends), and geospatial (Time Bank proximity matching, GPS verification). Native WebSocket support for real-time dashboard updates. Built-in namespace/database/scope-level auth with JWT.

**Clinical Database: Aidbox FHIR R4 (Health Samurai)**
- Rationale: Purpose-built FHIR server with PostgreSQL JSONB storage. Supports all required FHIR resources (Patient, CarePlan, Observation, Condition, Encounter, QuestionnaireResponse, DocumentReference, ConceptMap, CodeSystem, CareTeam, Procedure, AuditEvent). Built-in OAuth 2.0 + SMART-on-FHIR. Terminology services for ICD-10, SNOMED CT, LOINC, and custom Omaha System codes. HIPAA-eligible infrastructure.

**Cache/Streaming: Redis 7.x**
- Rationale: Used for API response caching (non-PHI only), real-time notification delivery via Redis Streams (persistent, acknowledgment-based), and session management. Redis Streams provide persistent, replay-capable message delivery suitable for non-clinical event notifications. Clinical data sync uses the Transactional Outbox — NOT Redis.

**AI/NLP: Google Gemini API (`@google/genai`)**
- Rationale: Powers two critical features — the Ambient Scribe (voice-to-text care logging with Omaha System auto-coding, using `gemini-2.5-flash-native-audio-preview` or Web Audio + `gemini-3.1-flash`) and the Ambient Guide (conversational AI on the public website, using `gemini-3.1-flash`).

### 0.3.2 Architecture Pattern

**Overall Pattern: Modular Monolith with Dual-Database Architecture**

CareOS uses a modular monolith backend pattern for Phase 1, with clear module boundaries that enable future extraction into microservices (Phase 3). The frontend is a single-page PWA with role-based view switching.

```mermaid
flowchart TB
    subgraph ClientLayer["Client Layer (React PWA)"]
        CD["Conductor Dashboard"]
        TB["Time Bank Hub"]
        WO["Worker-Owner Portal"]
        MD["Medical Director Console"]
        AD["Admin Dashboard"]
        ED["Employer Dashboard"]
        PW["Public Website + Ambient Guide"]
    end

    subgraph APILayer["API Layer (Express.js v5)"]
        GW["API Gateway & Auth Middleware"]
        AM["Auth Module"]
        FM["Family Module"]
        TM["Time Bank Module"]
        OM["Omaha Crosswalk Module"]
        AS["Assessment Module (CII/CRI/KBS)"]
        LM["LMN Module"]
        PM["Payment Module (Stripe)"]
        NM["Notification Module"]
        WM["Wearable Module"]
        GM["Gemini AI Module"]
        WPM["Wellness Provider Module"]
        EMP["Employer Module"]
        WKR["Worker Module"]
        MSG["Messaging Module"]
    end

    subgraph DataLayer["Data Layer"]
        SDB["PostgreSQL 16 (Operational)"]
        ADB["Aidbox FHIR R4 (Clinical)"]
        RDS["Redis 7.x (Cache/Streams)"]
    end

    subgraph SyncLayer["Sync Layer"]
        TOB["Transactional Outbox"]
        POL["Outbox Poller"]
    end

    ClientLayer -->|HTTPS/WSS| GW
    GW --> AM & FM & TM & OM & AS & LM & PM & NM & WM & GM & WPM & EMP & WKR & MSG
    AM & FM & TM & PM & NM & WKR & MSG -->|SQL| SDB
    OM & AS & LM & WM -->|FHIR REST| ADB
    NM -->|Streams| RDS
    SDB -->|Write Events| TOB
    TOB -->|Poll & Deliver| POL
    POL -->|FHIR REST| ADB
    ADB -->|Subscription Events| POL
    POL -->|SQL| SDB
end
```

**Component Interaction Model:**

All client requests flow through the API Gateway which handles JWT validation (from HttpOnly cookies), role-based access control, rate limiting, and request logging. Each module encapsulates its own routes, services, schemas, and data access. Modules communicate internally via direct function calls within the monolith — no inter-service HTTP calls in Phase 1.

**Data Flow Architecture:**

- **Operational Flow (PostgreSQL):** User actions (create task, accept match, submit assessment, process payment) → Express module → PostgreSQL write → Outbox event written in same transaction → Success response to client
- **Clinical Sync (Outbox → Aidbox):** Outbox Poller reads pending events → Transforms to FHIR resources → POST/PUT to Aidbox → Marks event as delivered (ACK) → Retry on failure
- **Reverse Sync (Aidbox → PostgreSQL):** Aidbox Subscription fires on clinical events (e.g., new Encounter from hospital integration) → Webhook to Express → Express writes to PostgreSQL (e.g., create notification, generate Comfort Card transaction)

**Security Architecture:**

- **Authentication:** Google OAuth for initial onboarding → JWT tokens in Secure, HttpOnly, SameSite=Strict cookies. Refresh token rotation. 2FA mandatory for Medical Director and Admin roles.
- **Authorization:** RBAC middleware validates role claims in JWT against endpoint-level role requirements. Row-level data isolation (Conductor sees only own family, Worker sees only assigned families).
- **PHI Protection:** All clinical data responses include `Cache-Control: no-store` header. Service Worker explicitly excludes PHI endpoints from cache. Audit logging on all PHI access via Aidbox AuditEvent.
- **Data Classification:** PostgreSQL holds operational data (PII but not PHI). Aidbox holds clinical data (PHI). Both encrypted at rest (AES-256) and in transit (TLS 1.3).

### 0.3.3 Integration Points

| External Service | Purpose | Protocol | Auth Method | Data Direction |
|---|---|---|---|---|
| Stripe | Comfort Card payments, $100 membership, $15/hr TB purchases | REST API | API Key (server-side only) | Bidirectional (charges + webhooks) |
| Google Gemini API | Ambient Scribe (voice-to-text + Omaha coding), Ambient Guide (conversational AI) | REST/gRPC | API Key | Request/Response |
| Apple Health API | Wearable vitals (HR, sleep, activity) | HealthKit JS | OAuth 2.0 | Client → Server (push from device) |
| Google OAuth | User authentication (initial onboarding) | OAuth 2.0 | Client ID/Secret | Bidirectional |
| Twilio | SMS notifications (change-in-condition, SLA breaches) | REST API | API Key + Auth Token | Outbound |
| SendGrid | Email notifications (LMN expiry, monthly statements, employer reports) | REST API | API Key | Outbound |
| Google Maps API | Geospatial matching (Time Bank proximity), GPS verification display | REST API | API Key | Request/Response |
| DocuSign/HelloSign | LMN electronic signature by Medical Director | REST API | OAuth 2.0 | Bidirectional |
| Zoom API | Telehealth session scheduling and launch (CRI assessment, MD consultations) | REST API | OAuth 2.0 | Bidirectional |
| HL7 FHIR (BCH) | Hospital discharge data exchange (Phase 2+) | FHIR REST | SMART-on-FHIR | Inbound |
| Google Sheets | Lead management webhook (existing, preserve as-is) | Webhook | API Key | Outbound |

**API Contracts:**

- All CareOS REST endpoints follow the pattern `/api/v1/{module}/{resource}`
- FHIR resources accessed via Aidbox proxy at `/fhir/r4/{ResourceType}`
- WebSocket connections for real-time dashboard updates via PostgreSQL native WS
- All request/response payloads in JSON with TypeScript-generated schemas
- Rate limiting: 100 req/min for standard endpoints, 10 req/min for assessment submissions, 1000 req/min for read-only dashboard polling

**Authentication and Authorization Approach:**

| Role | Auth Method | 2FA | Data Access Scope |
|---|---|---|---|
| Conductor | Email/Password or Google OAuth | Optional | Own family data only |
| Time Bank Member | Email/Password or Google OAuth | No | Own profile + available tasks |
| W-2 Worker-Owner | Email/Password | Mandatory | Assigned families only |
| Medical Director | Email/Password | Mandatory | All clinical data |
| Admin/Coordinator | Email/Password | Mandatory | All operational data |
| Employer HR | Email/Password or SSO | Optional | Aggregate workforce data only |
| Wellness Provider | Email/Password | No | Own listing + booking data |


## 0.4 Implementation Specifications


### 0.4.1 Core Components and Modules

**Module A: Authentication & Authorization**
- Purpose: User registration, login (email/password + Google OAuth), JWT issuance/validation, 2FA enrollment/verification, role-based access control, session management via HttpOnly cookies
- Location: `src/server/modules/auth/`
- Key interfaces: `AuthService.register()`, `AuthService.login()`, `AuthService.verifyOAuth()`, `AuthService.refresh()`, `RBACMiddleware.requireRole()`
- Dependencies: PostgreSQL (user records), Redis (session cache), Google OAuth client

**Module B: Family & Care Recipient Management**
- Purpose: Family CRUD, CareRecipient profiles, care team assignment, membership lifecycle (pending → active → grace_period → suspended → cancelled)
- Location: `src/server/modules/family/`
- Key interfaces: `FamilyService.create()`, `FamilyService.assignCareTeam()`, `CareRecipientService.update()`, `MembershipService.processRenewal()`
- Dependencies: Auth module, PostgreSQL, Aidbox (Patient resource sync)

**Module C: Time Bank Engine**
- Purpose: Double-entry ledger management, task CRUD/matching, GPS verification, half-life decay calculation, deficit tracking, Respite Default deduction, cash purchase processing, streak/impact score calculation, behavioral nudge triggers
- Location: `src/server/modules/timebank/`
- Key interfaces: `LedgerService.credit()`, `LedgerService.debit()`, `MatchingService.findMatches()`, `DecayService.applyHalfLife()`, `RespiteService.autoDeduct()`
- Dependencies: Auth module, Family module, PostgreSQL (relation tables for cascade), Stripe (cash purchases), Notification module, Google Maps API (proximity)

**Module D: Assessment Engine (CII/CRI/KBS)**
- Purpose: Administer CII (12 dimensions, 1-10, /120), CRI (14 factors, clinical acuity), and KBS (1-5 per Omaha problem) assessments. Zone classification, longitudinal trending, employer aggregate queries, MD review workflows
- Location: `src/server/modules/assessment/`
- Key interfaces: `CIIService.submit()`, `CRIService.submit()`, `KBSService.recordOutcome()`, `AssessmentService.getZone()`, `AssessmentService.getAggregate()`
- Dependencies: Auth module, Family module, PostgreSQL, Aidbox (QuestionnaireResponse/Observation sync), Notification module

**Module E: Omaha Crosswalk & Clinical Coding**
- Purpose: Map ICD-10 codes to Omaha System problems (bidirectional), auto-code Time Bank tasks to Omaha interventions, generate care plans from discharge codes, populate LMN templates
- Location: `src/server/modules/omaha/`
- Key interfaces: `CrosswalkService.mapIcd10()`, `CrosswalkService.mapOmahaToIcd10()`, `AutoCodingService.mapTaskToProblem()`, `CarePlanService.generate()`
- Dependencies: Aidbox (ConceptMap, CodeSystem, CarePlan), Time Bank module, LMN module

**Module F: LMN (Letter of Medical Necessity)**
- Purpose: LMN lifecycle management (draft → pending_signature → active → renewal_due → expired), template generation from clinical profile, electronic signature workflow, annual renewal automation, HSA/FSA eligibility tracking
- Location: `src/server/modules/lmn/`
- Key interfaces: `LMNService.generate()`, `LMNService.requestSignature()`, `LMNService.renew()`, `LMNService.getEligibleServices()`
- Dependencies: Omaha module, Assessment module, Aidbox (DocumentReference), DocuSign/HelloSign API, Notification module

**Module G: Payment & Comfort Card**
- Purpose: Stripe integration for $100 membership, $59/mo Comfort Card subscription (waived with 1 hr/mo Time Bank), $15/hr Time Bank cash purchases, transaction categorization by payment source and IRS Pub 502 eligibility, monthly statement generation, annual HSA/FSA totals
- Location: `src/server/modules/payment/`
- Key interfaces: `StripeService.createSubscription()`, `StripeService.processPayment()`, `ComfortCardService.generateStatement()`, `ComfortCardService.getHsaTotal()`
- Dependencies: Auth module, Family module, Time Bank module, Stripe SDK, PostgreSQL

**Module H: Notification Engine**
- Purpose: Multi-channel notification delivery (push, SMS, email, in-app) with scheduling, templating, delivery status tracking, and channel-specific routing per notification type
- Location: `src/server/modules/notification/`
- Key interfaces: `NotificationService.send()`, `NotificationService.schedule()`, `NotificationService.getUnread()`, `ChannelRouter.route()`
- Dependencies: Redis Streams, Twilio (SMS), SendGrid (email), Web Push API, PostgreSQL (notification records)

**Module I: Wearable Integration**
- Purpose: Ingest Apple Health API data, map to LOINC codes, detect anomalies (>2 standard deviations from baseline), trigger condition alerts, store as FHIR Observations
- Location: `src/server/modules/wearable/`
- Key interfaces: `WearableService.ingest()`, `AnomalyService.detect()`, `LOINCMapper.map()`
- Dependencies: Aidbox (Observation), Notification module, PostgreSQL (vitals time-series)

**Module J: Gemini AI (Ambient Scribe + Ambient Guide)**
- Purpose: Ambient Scribe — voice-to-text care logging for worker-owners, auto-extracts clinical concepts and maps to Omaha System problems, generates FHIR Observations and polished narrative notes. Ambient Guide — conversational AI on public website, holds full cooperative context, proactively guides users.
- Location: `src/server/modules/gemini/`
- Key interfaces: `AmbientScribeService.transcribe()`, `AmbientScribeService.extractConcepts()`, `AmbientGuideService.chat()`, `AmbientGuideService.getContext()`
- Dependencies: Google Gemini API (`@google/genai`), Omaha module, Aidbox (Observation)

**Module K: Worker-Owner Portal**
- Purpose: Daily assignment display, care interaction logging, clock-in/out with GPS, shift swap requests, equity tracking (Subchapter T calculations), governance voting, benefits enrollment
- Location: `src/server/modules/worker/`
- Key interfaces: `WorkerService.getAssignments()`, `CareInteractionService.log()`, `EquityService.calculate()`, `GovernanceService.vote()`
- Dependencies: Auth module, Family module, PostgreSQL, Gemini module (Ambient Scribe)

**Module L: Wellness Provider & Marketplace**
- Purpose: Provider registration, service listing, LMN-eligible service discovery, booking management, Comfort Card payment routing, referral analytics
- Location: `src/server/modules/wellness/`
- Key interfaces: `ProviderService.register()`, `ServiceService.list()`, `BookingService.create()`, `MarketplaceService.search()`
- Dependencies: LMN module, Payment module, PostgreSQL

**Module M: Employer Dashboard**
- Purpose: Employer registration, employee CII invitation management, aggregate anonymized CII dashboard, productivity impact calculation, PEPM enrollment, quarterly ROI report generation
- Location: `src/server/modules/employer/`
- Key interfaces: `EmployerService.uploadCSV()`, `EmployerService.getAggregate()`, `ROIService.calculateImpact()`, `PEPMService.enroll()`
- Dependencies: Assessment module, Auth module, PostgreSQL

**Module N: Messaging**
- Purpose: Secure messaging between all care team roles, conversation threads, read receipts, attachment support
- Location: `src/server/modules/messaging/`
- Key interfaces: `MessageService.send()`, `ConversationService.getThreads()`, `MessageService.markRead()`
- Dependencies: Auth module, PostgreSQL, Notification module

### 0.4.2 Data Models and Schemas

**Core Entities (PostgreSQL — Operational):**

The user-provided data model is comprehensive and definitive. The following entities are stored in PostgreSQL with their complete schemas as specified in the PRD addendum:

| Entity | Key Attributes | Relationships | Validation Rules |
|---|---|---|---|
| Family | id, name, membershipStatus (enum), primaryConductor, careRecipient | has_one TimeBankAccount, has_one ComfortCard, has_many Assessments, has_many CareTeamAssignments | membershipStatus enum: pending, active, grace_period, suspended, cancelled |
| User | id, email (unique), role (enum), location (point), backgroundCheckStatus | belongs_to Family (via CareTeamAssignment), has_many Notifications | role enum: conductor, worker_owner, timebank_member, medical_director, admin, employer_hr, wellness_provider |
| CareRecipient | id, dateOfBirth, mobilityLevel, cognitiveStatus, medications, wearableDeviceId | belongs_to Family | mobilityLevel enum: independent, assisted, wheelchair, bedbound |
| TimeBankAccount | id, balanceEarned, balanceMembership, balanceBought, balanceDeficit (max -20) | belongs_to Family, has_many TimeBankTransactions | balanceDeficit constraint: max -20 hours |
| TimeBankTransaction | id, type (enum), hours, dollarAmount | belongs_to TimeBankAccount, references TimeBankTask | type enum: earned, spent, bought, donated_to_respite, membership_credit, expired, respite_received, referral_bonus, training_bonus |
| TimeBankTask | id, taskType (enum), isRemote, status (enum), matchScore, GPS points | requested_by User, assigned_to User, requested_for CareRecipient | Must contain mapped omahaProblemId. GPS verification: 0.25 mile radius |
| CareInteraction | id, interactionType (enum), changeInCondition, vitalsRecorded (JSON) | belongs_to Family, belongs_to Worker (User), belongs_to CareRecipient | changeInConditionSeverity enum: routine, monitor, urgent, emergency |
| Assessment | id, type (enum: cii, cri, cii_quick), scores (JSON), totalScore, zone | belongs_to Family, assessed_by User | CII: 12 dimensions × 1-10. CRI: 14 factors. Zone: green ≤40, yellow 41-79, red ≥80 |
| WorkerEquity | id, hoursWorkedThisQuarter, equityRatePerHour, accumulatedEquity, vestedEquity | belongs_to Worker (User) | Subchapter T compliance |
| RespiteEmergencyFund | singleton, balanceHours, balanceDollars, autoApprovalThreshold (default 100 hours) | has_many RespiteFundTransactions | Auto-approve if balance >100 hours |

**PostgreSQL Relation Tables:**

| Edge Type | From | To | Purpose |
|---|---|---|---|
| `helped` | User | User | Time Bank cascade chain (who helped whom) |
| `member_of` | User | Cooperative | Governance membership tracking |
| `assigned_to` | User (Worker) | Family | Care team assignment relationship |
| `referred` | User | User | Referral tracking for viral loop |

**Clinical Entities (Aidbox — FHIR R4):**

| CareOS Entity | FHIR R4 Resource | Sync Direction | Key Elements |
|---|---|---|---|
| CareRecipient | Patient | PostgreSQL → Aidbox | Demographics, identifiers |
| CII/CRI Assessment | QuestionnaireResponse | PostgreSQL → Aidbox | Linked to Questionnaire, scored items |
| KBS Outcome | Observation | PostgreSQL → Aidbox | Value 1-5, linked to Condition (Omaha Problem) |
| Omaha Taxonomy | CodeSystem | Static (Init Bundle) | 42 problems × 4 domains |
| ICD-10 ↔ Omaha Map | ConceptMap | Static/Manual | Configurable rules engine |
| Care Plan | CarePlan | Generated | From Crosswalk Engine output |
| LMN Document | DocumentReference | PostgreSQL → Aidbox | Signed PDF, status tracking |
| Care Interaction | Encounter + Observation | PostgreSQL → Aidbox | Visit record + clinical observations |
| Wearable Vitals | Observation | Client → Aidbox | LOINC coded (e.g., 8867-4 Heart Rate) |
| Care Team | CareTeam | PostgreSQL → Aidbox | Members, roles, period |
| Conductor Cert | Procedure | PostgreSQL → Aidbox | Certification completion record |
| PHI Access Log | AuditEvent | Aidbox native | All PHI read/write events |

### 0.4.3 API Specifications

**Core Endpoint Groups:**

| Group | Base Path | Methods | Auth Required | Allowed Roles |
|---|---|---|---|---|
| Auth | `/api/v1/auth/*` | POST | No (public) | All |
| Family | `/api/v1/families/*` | GET, POST, PUT, DELETE | Yes | conductor, admin |
| Time Bank | `/api/v1/timebank/*` | GET, POST, PUT | Yes | conductor, timebank_member, admin |
| Assessments | `/api/v1/assessments/*` | GET, POST | Yes | conductor, medical_director, admin |
| Omaha/KBS | `/api/v1/omaha/*` | GET, POST | Yes | conductor, medical_director, admin |
| LMN | `/api/v1/lmn/*` | GET, POST, PUT | Yes | conductor, medical_director, admin |
| Payments | `/api/v1/payments/*` | GET, POST | Yes | conductor, admin |
| Notifications | `/api/v1/notifications/*` | GET, PUT | Yes | All authenticated |
| Wearables | `/api/v1/wearables/*` | GET, POST | Yes | conductor |
| Workers | `/api/v1/workers/*` | GET, POST, PUT | Yes | worker_owner, admin |
| Wellness | `/api/v1/wellness/*` | GET, POST, PUT | Yes | wellness_provider, conductor, admin |
| Employer | `/api/v1/employer/*` | GET, POST | Yes | employer_hr, admin |
| Messaging | `/api/v1/messages/*` | GET, POST, PUT | Yes | All authenticated |
| AI (Gemini) | `/api/v1/ai/*` | POST | Yes | worker_owner (Scribe), All (Guide) |
| FHIR Proxy | `/fhir/r4/*` | GET, POST, PUT | Yes | medical_director, admin |
| Admin | `/api/v1/admin/*` | GET, POST, PUT | Yes | admin |

**Authentication Flow:**

- `POST /api/v1/auth/register` — Create account (email, password, role)
- `POST /api/v1/auth/login` — Authenticate, returns JWT in HttpOnly cookie
- `POST /api/v1/auth/oauth/google` — Google OAuth callback
- `POST /api/v1/auth/refresh` — Rotate refresh token
- `POST /api/v1/auth/2fa/setup` — Initialize 2FA (TOTP)
- `POST /api/v1/auth/2fa/verify` — Verify 2FA code

**Rate Limiting:**

| Endpoint Category | Rate Limit | Window |
|---|---|---|
| Authentication | 10 req | per minute |
| Assessment submission | 10 req | per minute |
| Standard read | 100 req | per minute |
| Dashboard polling | 1000 req | per minute |
| Stripe webhooks | Unlimited | — |

### 0.4.4 User Interface Design

**Key UI Insights and Goals:**

The CareOS frontend is a single React PWA that renders different dashboard views based on the authenticated user's role. The primary design principle is **mobile-first for the Conductor** — the target user (daughter, 35-60, iPhone user, overwhelmed) must be able to check on her parent's care, approve appointments, and check Time Bank balance in under 30 seconds from her phone.

**Core Interface Requirements:**

- **Conductor Dashboard:** Single pane of glass — care timeline (chronological feed of all interactions), vital signs cards (Apple Health data with anomaly badges), appointment calendar (one-tap reschedule), Time Bank wallet (balance breakdown with earn/spend/buy CTAs), Comfort Card summary, CII score gauge with zone coloring, and quick-access messaging
- **Time Bank Hub:** Task feed (filtered by skill + proximity), accept/post/track task cards with GPS status, impact score visualization, cascade chain diagram, streak counter, deficit/balance indicator with behavioral nudge overlays
- **Worker-Owner Portal:** Daily schedule with family preference notes, Ambient Scribe recording interface (single large record button → auto-generated structured note), clock-in/out with GPS confirmation, equity dashboard with vesting timeline, governance voting cards
- **Medical Director Console:** Clinical queue (CRI reviews, change-in-condition escalations, LMN approvals), KBS trend charts per patient, LMN signature workflow, quality metrics dashboard
- **Admin Dashboard:** Michaelis-Menten dashboard (requests vs. members per ZIP on map), Time Bank liquidity gauges, match latency alerts, Respite Emergency Fund balance, background check pipeline
- **Employer Dashboard:** Aggregate CII donut chart (Green/Yellow/Red), productivity impact table, PEPM enrollment progress bar, quarterly ROI summary cards
- **Public Website + Ambient Guide:** Role selection landing (Conductor, Neighbor, Pro, Wellness, Employer, Leader), Mini CII Quick Check (3 sliders), Ambient Guide chat overlay (auto-opens, proactive guidance), Flywheel strategy visualization (behind toggle)

**Design Principles:**

- CII assessment must feel conversational, not clinical — warm language, slider interactions, progress indicators
- Time Bank UX uses streaks and impact scores (warm community recognition), never gamification (no leaderboards, XP, achievements)
- Respite Default opt-out must be genuinely easy — one tap, clearly labeled
- All clinical data displays include a timestamp and source attribution
- Notifications prioritize push for urgent (change-in-condition), email for scheduled (monthly statements), in-app for informational (impact chain updates)


## 0.5 Repository Structure Planning


### 0.5.1 Proposed Repository Structure

```
/
├── src/
│   ├── client/                              # React PWA Frontend
│   │   ├── main.tsx                         # Application entry point
│   │   ├── App.tsx                          # Root component with hash-based router (EXISTING — enhance)
│   │   ├── theme.ts                         # Centralized brand colors, fonts, mobile hook (EXISTING — preserve)
│   │   ├── vite-env.d.ts                    # Vite environment type definitions
│   │   ├── service-worker.ts                # PWA Service Worker with PHI cache bypass rules
│   │   ├── components/                      # Shared UI components
│   │   │   ├── ui/                          # Atomic design components (buttons, inputs, cards, modals)
│   │   │   ├── layout/                      # Layout shells (AppShell, NavBar, Sidebar, RoleSwitch)
│   │   │   ├── charts/                      # Recharts wrappers (CII gauge, KBS trends, vitals)
│   │   │   └── forms/                       # Form components (CII sliders, task creation, assessment)
│   │   ├── features/                        # Feature-organized modules
│   │   │   ├── auth/                        # Login, Register, OAuth, 2FA screens
│   │   │   ├── conductor/                   # Conductor Dashboard views
│   │   │   │   ├── CareTimeline.tsx         # Chronological care feed
│   │   │   │   ├── VitalsOverview.tsx       # Wearable data display with anomaly flags
│   │   │   │   ├── TimeBankWallet.tsx       # Balance display with earn/spend/buy CTAs
│   │   │   │   ├── ComfortCardSummary.tsx   # Monthly payment summary
│   │   │   │   └── AppointmentCalendar.tsx  # Upcoming appointments
│   │   │   ├── timebank/                    # Time Bank Hub views
│   │   │   │   ├── TaskFeed.tsx             # Available tasks filtered by proximity/skill
│   │   │   │   ├── TaskDetail.tsx           # Task accept/decline with GPS preview
│   │   │   │   ├── ImpactScore.tsx          # Cascade visualization
│   │   │   │   └── StreakTracker.tsx         # Weekly streak display
│   │   │   ├── assessment/                  # CII, CRI, KBS assessment flows
│   │   │   │   ├── CIIAssessment.tsx        # 12-dimension slider assessment
│   │   │   │   ├── MiniCII.tsx              # 3-slider quick check (public)
│   │   │   │   ├── CRIAssessment.tsx        # 14-factor clinical assessment
│   │   │   │   └── KBSRating.tsx            # KBS 1-5 outcome rating
│   │   │   ├── worker/                      # Worker-Owner Portal views
│   │   │   │   ├── DailySchedule.tsx        # Assignment schedule
│   │   │   │   ├── AmbientScribe.tsx        # Voice recording + auto-coding UI
│   │   │   │   ├── EquityDashboard.tsx      # Equity/vesting tracker
│   │   │   │   └── GovernanceVoting.tsx      # Cooperative governance voting
│   │   │   ├── medical/                     # Medical Director Console views
│   │   │   │   ├── ClinicalQueue.tsx        # CRI reviews, escalations, LMN approvals
│   │   │   │   ├── KBSTrends.tsx            # KBS outcome trend charts
│   │   │   │   └── LMNSignature.tsx         # Electronic signature workflow
│   │   │   ├── lmn/                         # LMN Marketplace views
│   │   │   │   ├── MarketplaceBrowse.tsx    # Wellness service discovery
│   │   │   │   ├── ServiceDetail.tsx        # Service booking with HSA savings display
│   │   │   │   └── LMNStatus.tsx            # LMN lifecycle tracker
│   │   │   ├── admin/                       # Admin/Coordinator Dashboard views
│   │   │   │   ├── MichaelisMenten.tsx      # Time Bank liquidity dashboard
│   │   │   │   ├── MatchOverride.tsx        # Manual matching for unmatched requests
│   │   │   │   ├── BackgroundChecks.tsx     # Background check pipeline
│   │   │   │   └── RespiteFund.tsx          # Respite Emergency Fund management
│   │   │   ├── employer/                    # Employer Dashboard views
│   │   │   │   ├── CIIAggregate.tsx         # Anonymized CII distribution chart
│   │   │   │   ├── ProductivityImpact.tsx   # Productivity calculator
│   │   │   │   └── ROIReport.tsx            # Quarterly ROI report
│   │   │   ├── messaging/                   # Secure messaging UI
│   │   │   ├── public/                      # Public website views
│   │   │   │   ├── Website.tsx              # Landing page (EXISTING — enhance)
│   │   │   │   ├── ProductMap.tsx           # Investor strategy map (EXISTING — preserve)
│   │   │   │   ├── Enzyme.tsx              # Behavioral design framework (EXISTING — preserve)
│   │   │   │   ├── CareUBI.tsx             # Policy/research thesis (EXISTING — preserve)
│   │   │   │   ├── Synthesis.tsx           # Cross-cutting throughlines (EXISTING — preserve)
│   │   │   │   └── AmbientGuide.tsx        # AI conversational interface (EXISTING AIChat.tsx — enhance)
│   │   │   └── onboarding/                  # Conductor onboarding flow (10-step)
│   │   ├── hooks/                           # Custom React hooks
│   │   │   ├── useAuth.ts                   # Authentication state and methods
│   │   │   ├── useRole.ts                   # Active role detection and switching
│   │   │   ├── useTimeBank.ts               # Time Bank balance and operations
│   │   │   └── useNotifications.ts          # Push notification subscription
│   │   ├── stores/                          # Zustand stores (client state)
│   │   │   ├── authStore.ts                 # Auth token, active role, user profile
│   │   │   ├── uiStore.ts                   # Navigation, modals, sidebar state
│   │   │   └── ambientGuideStore.ts         # Conversation context for AI guide
│   │   ├── api/                             # TanStack Query API layer
│   │   │   ├── client.ts                    # Axios/fetch client with interceptors
│   │   │   ├── queries/                     # Query hooks per module
│   │   │   └── mutations/                   # Mutation hooks per module
│   │   ├── types/                           # Shared TypeScript type definitions
│   │   │   ├── models.ts                    # Entity interfaces (Family, User, Assessment, etc.)
│   │   │   ├── api.ts                       # API request/response types
│   │   │   ├── fhir.ts                      # FHIR resource type interfaces
│   │   │   └── enums.ts                     # Shared enums (roles, statuses, zones)
│   │   └── utils/                           # Client-side utility functions
│   │       ├── constants.ts                 # Immutable key numbers (63M, 77%, etc.)
│   │       ├── formatters.ts                # Date, currency, hours formatting
│   │       └── validators.ts                # Client-side validation helpers
│   │
│   ├── server/                              # Node.js Express Backend
│   │   ├── index.ts                         # Server entry point
│   │   ├── app.ts                           # Express app initialization, middleware stack
│   │   ├── server.ts                        # HTTP server creation (EXISTING — enhance)
│   │   ├── middleware/                       # Express middleware
│   │   │   ├── auth.ts                      # JWT validation from HttpOnly cookies
│   │   │   ├── rbac.ts                      # Role-based access control
│   │   │   ├── rateLimiter.ts               # Rate limiting per endpoint category
│   │   │   ├── phiHeaders.ts                # Cache-Control: no-store for PHI responses
│   │   │   ├── errorHandler.ts              # Global error handling middleware
│   │   │   └── requestLogger.ts             # Request/response audit logging
│   │   ├── modules/                         # Feature modules (routes + services + schemas)
│   │   │   ├── auth/                        # Authentication & authorization
│   │   │   │   ├── routes.ts                # Auth endpoints
│   │   │   │   ├── service.ts               # Auth business logic
│   │   │   │   └── schemas.ts               # Zod validation schemas
│   │   │   ├── family/                      # Family & CareRecipient management
│   │   │   │   ├── routes.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── schemas.ts
│   │   │   ├── timebank/                    # Time Bank engine
│   │   │   │   ├── routes.ts
│   │   │   │   ├── service.ts               # Ledger, matching, decay logic
│   │   │   │   ├── schemas.ts
│   │   │   │   ├── ledger.ts                # Double-entry ledger operations
│   │   │   │   ├── matching.ts              # Proximity + skill matching algorithm
│   │   │   │   ├── decay.ts                 # Half-life decay calculator
│   │   │   │   └── respite.ts               # Respite Default and Emergency Fund
│   │   │   ├── assessment/                  # CII/CRI/KBS assessment engine
│   │   │   │   ├── routes.ts
│   │   │   │   ├── service.ts
│   │   │   │   ├── schemas.ts
│   │   │   │   ├── cii.ts                   # CII scoring and zone classification
│   │   │   │   ├── cri.ts                   # CRI scoring and MD review workflow
│   │   │   │   └── kbs.ts                   # KBS outcome tracking (1-5 per Omaha problem)
│   │   │   ├── omaha/                       # Omaha Crosswalk & clinical coding
│   │   │   │   ├── routes.ts
│   │   │   │   ├── service.ts
│   │   │   │   ├── schemas.ts
│   │   │   │   ├── crosswalk.ts             # ICD-10 ↔ Omaha mapping engine
│   │   │   │   └── kbs.ts                   # KBS recording and FHIR sync
│   │   │   ├── lmn/                         # LMN lifecycle management
│   │   │   │   ├── routes.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── schemas.ts
│   │   │   ├── payment/                     # Stripe & Comfort Card
│   │   │   │   ├── routes.ts
│   │   │   │   ├── service.ts
│   │   │   │   ├── schemas.ts
│   │   │   │   └── stripe.ts                # Stripe API wrapper
│   │   │   ├── notification/                # Multi-channel notification engine
│   │   │   │   ├── routes.ts
│   │   │   │   ├── service.ts
│   │   │   │   ├── schemas.ts
│   │   │   │   └── channels/                # Channel-specific senders
│   │   │   │       ├── push.ts
│   │   │   │       ├── sms.ts               # Twilio integration
│   │   │   │       └── email.ts             # SendGrid integration
│   │   │   ├── wearable/                    # Apple Health integration
│   │   │   │   ├── routes.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── loinc-mapper.ts          # LOINC code mapping for vitals
│   │   │   ├── gemini/                      # Ambient Scribe + Ambient Guide
│   │   │   │   ├── routes.ts
│   │   │   │   ├── scribe-service.ts        # Voice-to-text + Omaha auto-coding
│   │   │   │   └── guide-service.ts         # Conversational AI for public site
│   │   │   ├── worker/                      # Worker-Owner portal backend
│   │   │   │   ├── routes.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── equity.ts                # Subchapter T equity calculations
│   │   │   ├── wellness/                    # Wellness Provider & Marketplace
│   │   │   │   ├── routes.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── schemas.ts
│   │   │   ├── employer/                    # Employer dashboard backend
│   │   │   │   ├── routes.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── roi-calculator.ts        # ROI and productivity impact
│   │   │   └── messaging/                   # Secure messaging
│   │   │       ├── routes.ts
│   │   │       └── service.ts
│   │   ├── db/                              # Database connections and helpers
│   │   │   ├── postgres.ts                 # PostgreSQL client initialization
│   │   │   ├── aidbox.ts                    # Aidbox FHIR client initialization
│   │   │   ├── redis.ts                     # Redis client initialization
│   │   │   └── sync/                        # Transactional Outbox sync layer
│   │   │       ├── outbox.ts                # Outbox event writer
│   │   │       ├── poller.ts                # Outbox event poller/consumer
│   │   │       └── transformers/            # PostgreSQL ↔ FHIR resource transformers
│   │   │           ├── patient.ts
│   │   │           ├── observation.ts
│   │   │           ├── encounter.ts
│   │   │           ├── questionnaire-response.ts
│   │   │           └── care-plan.ts
│   │   ├── config/                          # Server configuration
│   │   │   ├── settings.ts                  # Central config (env vars, constants)
│   │   │   ├── roles.ts                     # RBAC role definitions and permissions
│   │   │   └── omaha-taxonomy.ts            # Omaha System 42 problems reference
│   │   └── utils/                           # Server-side utilities
│   │       ├── errors.ts                    # Custom error classes
│   │       ├── logger.ts                    # Structured logging
│   │       └── validators.ts                # Zod schema helpers
│   │
│   └── shared/                              # Shared code between client and server
│       ├── types/                           # Shared TypeScript interfaces
│       │   ├── entities.ts                  # Core entity interfaces
│       │   ├── enums.ts                     # Shared enum definitions
│       │   └── api-contracts.ts             # Request/response contracts
│       ├── constants/                       # Immutable values
│       │   ├── key-numbers.ts               # 63M, 77%, 1717 BVSD, etc.
│       │   ├── omaha-problems.ts            # 42 Omaha System problem definitions
│       │   └── cii-dimensions.ts            # 12 CII dimensions with labels
│       └── validators/                      # Shared validation logic
│           ├── assessment.ts                # CII (1-10 bounds), CRI (14.4-72.0), KBS (1-5)
│           └── timebank.ts                  # Deficit limit (-20), GPS bounds (0.25 mi)
│
├── tests/                                   # Test suite
│   ├── unit/                                # Unit tests (Vitest)
│   │   ├── server/                          # Server module unit tests
│   │   │   ├── timebank/                    # Ledger, matching, decay tests
│   │   │   ├── omaha/                       # Crosswalk engine tests
│   │   │   ├── assessment/                  # CII/CRI/KBS scoring tests
│   │   │   └── payment/                     # Stripe integration tests
│   │   └── client/                          # React component unit tests
│   ├── integration/                         # Integration tests
│   │   ├── sync/                            # PostgreSQL ↔ Aidbox sync tests
│   │   └── api/                             # API endpoint integration tests
│   ├── e2e/                                 # End-to-end tests (Playwright)
│   │   ├── conductor-onboarding.spec.ts     # Full onboarding flow (<10 min)
│   │   ├── timebank-round-trip.spec.ts      # Post → match → GPS → credit
│   │   ├── lmn-hsa-booking.spec.ts          # LMN → Marketplace → HSA charge
│   │   ├── change-in-condition.spec.ts      # Worker flags → Conductor push → MD review
│   │   ├── employer-cii-rollout.spec.ts     # CSV upload → invites → aggregate
│   │   └── omaha-crosswalk-pipeline.spec.ts # ICD-10 in → LMN out
│   └── fixtures/                            # Test data and mocks
│       ├── seed-lisa.ts                     # Lisa (Conductor) user story data
│       ├── seed-janet.ts                    # Janet (Time Bank neighbor) user story data
│       ├── seed-patricia.ts                 # Patricia (BVSD HR) user story data
│       └── fhir-bundles/                    # Sample FHIR resource bundles
│
├── scripts/                                 # Utility scripts
│   ├── seed.ts                              # Database seed script (Lisa, Janet, Patricia stories)
│   ├── init-aidbox.ts                       # Load Omaha CodeSystem, ConceptMap, Questionnaires
│   ├── setup-dev.sh                         # Development environment setup
│   └── migrate.ts                           # Database migration runner
│
├── config/                                  # Environment-specific configuration
│   ├── development/                         # Dev environment settings
│   ├── staging/                             # Staging environment settings
│   └── production/                          # Production environment settings
│
├── docs/                                    # Documentation
│   ├── api/                                 # API documentation (OpenAPI specs)
│   ├── architecture/                        # Architecture diagrams and ADRs
│   │   ├── dual-database-sync.md            # PostgreSQL ↔ Aidbox sync documentation
│   │   └── omaha-crosswalk.md               # Crosswalk engine documentation
│   ├── guides/                              # User and developer guides
│   │   ├── onboarding.md                    # Developer onboarding guide
│   │   └── deployment.md                    # Deployment guide
│   └── compliance/                          # HIPAA and regulatory documentation
│       └── phi-handling.md                  # PHI data flow and protection rules
│
├── .github/                                 # GitHub-specific files
│   └── workflows/                           # CI/CD workflows
│       ├── ci.yml                           # Lint, type-check, test pipeline
│       ├── e2e.yml                          # Playwright E2E test pipeline
│       └── deploy.yml                       # Deployment pipeline
│
├── docker-compose.yml                       # Local dev: Node.js + PostgreSQL + Aidbox + Redis
├── Dockerfile                               # Production container definition
├── package.json                             # Dependencies and scripts
├── tsconfig.json                            # TypeScript configuration (root)
├── tsconfig.server.json                     # TypeScript config for server
├── tsconfig.client.json                     # TypeScript config for client
├── vite.config.ts                           # Vite configuration with path aliases
├── tailwind.config.ts                       # Tailwind CSS configuration with brand colors
├── .env.example                             # Environment variables template
├── .gitignore                               # Git ignore rules
├── .eslintrc.cjs                            # ESLint configuration
├── .prettierrc                              # Prettier configuration
├── vitest.config.ts                         # Vitest configuration
├── playwright.config.ts                     # Playwright E2E configuration
└── README.md                                # Project documentation
```

### 0.5.2 File Path Specifications

**Core Application Files:**

- `src/server/index.ts` — Server entry point, initializes Express app, connects PostgreSQL/Aidbox/Redis, starts outbox poller
- `src/server/app.ts` — Express middleware stack (auth, RBAC, rate limiting, PHI headers, error handling)
- `src/server/modules/*/routes.ts` — Express route definitions per module
- `src/server/modules/*/service.ts` — Business logic per module
- `src/server/modules/*/schemas.ts` — Zod validation schemas per module
- `src/server/db/postgres.ts` — PostgreSQL client singleton with WebSocket connection
- `src/server/db/aidbox.ts` — Aidbox FHIR REST client with TypeScript SDK
- `src/server/db/sync/outbox.ts` — Transactional Outbox event writer (writes in same PostgreSQL transaction)
- `src/server/db/sync/poller.ts` — Outbox event consumer (polls, transforms, delivers to Aidbox, ACKs)

**Configuration Files:**

- `docker-compose.yml` — Local development orchestration (Node.js API, PostgreSQL 16, Aidbox, Redis 7)
- `.env.example` — Template for: `POSTGRES_URL`, `AIDBOX_URL`, `AIDBOX_CLIENT_ID`, `AIDBOX_CLIENT_SECRET`, `STRIPE_SECRET_KEY`, `GEMINI_API_KEY`, `GOOGLE_OAUTH_CLIENT_ID`, `TWILIO_*`, `SENDGRID_*`, `JWT_SECRET`, `REDIS_URL`
- `vite.config.ts` — Path aliases (`@components`, `@features`, `@hooks`, `@stores`, `@api`, `@types`, `@utils`)
- `tailwind.config.ts` — Brand color tokens, mobile breakpoints, custom spacing scale

**Entry Points:**

- `src/client/main.tsx` — React DOM root, TanStack QueryClient provider, Zustand store initialization
- `src/server/index.ts` — Express server start, database connections, graceful shutdown handlers
- `scripts/seed.ts` — Populates PostgreSQL with Lisa/Janet/Patricia user stories for development
- `scripts/init-aidbox.ts` — Loads Omaha CodeSystem, ICD-10↔Omaha ConceptMap, CII/CRI Questionnaire resources into Aidbox


## 0.6 Scope Definition


### 0.6.1 Explicitly In Scope

**Phase 1 — High Priority (Build First):**

- User authentication and authorization (email/password, Google OAuth, JWT in HttpOnly cookies, RBAC for 7 roles, 2FA for clinical/admin)
- Family and CareRecipient CRUD with membership lifecycle management
- Conductor Dashboard (care timeline, vitals summary, appointment view, Time Bank wallet, Comfort Card summary, CII zone display, notifications, messaging)
- CII Assessment Engine (Mini CII Quick Check — 3 sliders for public site, Full CII — 12 dimensions with zone classification and longitudinal trending)
- Time Bank Core Engine: double-entry ledger, task CRUD, proximity + skill matching algorithm, GPS-verified check-in/out, half-life decay, deficit tracking (-20 limit), Respite Default (0.1 hr auto-deduction), $15/hr cash purchase with $12/$3 split, membership credit (40 hrs on $100 payment), 12-month graduated expiry, streak/impact score
- Omaha System ↔ ICD-10 Crosswalk Engine: configurable rules engine stored as FHIR ConceptMap in Aidbox, bidirectional mapping, Time Bank task auto-coding to Omaha problems
- KBS Outcome Tracking: Knowledge, Behavior, Status 1-5 ratings at intake/30/60/90 days, sync to Aidbox as FHIR Observation
- Comfort Card Stripe Integration: $100 annual membership, $59/mo subscription (waived with 1 hr/mo Time Bank), $15/hr Time Bank cash purchases
- Secure Messaging: platform-wide messaging between all care team roles
- Public Website integration: existing React components (Website, ProductMap, Enzyme, CareUBI, Synthesis) integrated as public layer with Ambient Guide AI chat overlay
- Notification Engine: push, SMS (Twilio), email (SendGrid), in-app — covering all notification types specified in the Notification Architecture addendum
- PostgreSQL ↔ Aidbox Persistent Event Sync Layer (Transactional Outbox)
- Aidbox Init Bundle: CodeSystem (Omaha taxonomy), ConceptMap (ICD-10 crosswalk), Questionnaire (CII/CRI)
- Docker Compose for local development (Node.js + PostgreSQL + Aidbox + Redis)
- Seed scripts with concrete user stories (Lisa, Janet, Patricia)
- CI/CD pipeline via GitHub Actions (lint, type-check, test)
- Core E2E tests: Conductor onboarding, Time Bank round-trip, Omaha crosswalk pipeline

**Phase 2 — Medium Priority (Build Second):**

- CRI Assessment Engine (14 factors, clinical acuity, MD review workflow)
- Worker-Owner Portal (daily schedule, care interaction logging, Ambient Scribe voice-to-text with Omaha auto-coding, clock-in/out GPS, shift swap, messaging)
- LMN Generation and Signing (template generation from clinical profile, DocuSign/HelloSign electronic signature, lifecycle management)
- LMN Marketplace (wellness provider listing, LMN-eligible service discovery, booking, Comfort Card payment routing, HSA savings display)
- Comfort Card full reconciliation (multi-source categorization, IRS Pub 502 eligibility, monthly statement generation, annual HSA/FSA totals, exportable tax statements)
- Wearable Integration (Apple Health API ingestion, LOINC mapping, anomaly detection, FHIR Observation storage)
- Employer Dashboard (aggregate anonymized CII, productivity impact, PEPM enrollment, quarterly ROI reports)
- Admin/Coordinator Dashboard (Michaelis-Menten dashboard, manual matching, background check tracking, Respite Emergency Fund management)
- Background check API integration
- Time Bank behavioral nudges (deficit nudges at -5/-10/-15, streak notifications, refer-a-neighbor after 3rd task, credit expiry warnings, burnout detection at >10 hrs/week)
- Worker-Owner equity tracking (Subchapter T calculations, patronage dividends, vesting)
- Conductor Certification modules (training content, Time Bank bonus hours on completion)
- Two-way ratings with low-rating resolution workflow

**Phase 3 — Lower Priority (Build Third):**

- Hospital HL7 FHIR integration (BCH discharge data exchange)
- Predictive Hospitalization ML model (wearable + care note analysis, 72-96 hour risk prediction)
- PACE Data Exchange (TRU PACE clinical data, readmission risk scores)
- Federation Multi-Tenancy (deploying cooperative model to other cities)
- Physical/Virtual Comfort Card issuance
- Age at Home Insurance underwriting engine data preparation
- Advanced analytics and reporting

**Infrastructure (All Phases):**

- HIPAA-compliant hosting with BAA (AWS/GCP backend, Vercel frontend)
- AES-256 encryption at rest, TLS 1.3 in transit
- PHI audit logging via Aidbox AuditEvent
- Service Worker with PHI cache bypass rules
- Environment-specific configuration (development, staging, production)
- Comprehensive README and developer onboarding documentation

### 0.6.2 Explicitly Out of Scope

- **Separate mobile native apps (iOS/Android):** CareOS is a PWA accessed via mobile browser. No React Native or native app development.
- **Custom real-time video calling:** Telehealth uses Zoom API integration only. No WebRTC or custom video implementation.
- **Insurance claims processing engine:** The Comfort Card is a reporting/reconciliation tool. Age at Home Care Insurance is a 2028+ product.
- **Complex drag-and-drop scheduling:** Worker scheduling is coordinator-assigns, worker-confirms. No Gantt charts or visual schedule builders.
- **Marketplace for browsing/hiring individual caregivers:** Matching is algorithmic + coordinator-curated, not marketplace-driven.
- **Gamification with points, levels, badges, leaderboards, XP, or achievements:** Only streaks and impact scores with warm community tone.
- **Social Security number storage:** Stripe and background check API handle identity verification. CareOS never stores raw financial identity data.
- **PACE data exchange (Phase 3):** Clinical data structures will support future PACE exchange, but the integration itself is out of scope.
- **Federation multi-tenancy (Phase 3+):** Architecture will not prematurely optimize for multi-tenant; single-tenant deployment for Boulder County.
- **Predictive ML model (Phase 3):** Data collection infrastructure is in scope; model training and inference pipeline is not.
- **Physical/virtual card issuance for Comfort Card (Phase 3):** Comfort Card is a digital ledger in Phase 1-2, not a physical payment instrument.
- **Internationalization (i18n):** Phase 1 targets English-speaking Boulder County, Colorado only.
- **Advanced monitoring and observability:** Basic structured logging is in scope; APM tools (Datadog, New Relic) are not in initial scope.
- **Comprehensive load testing and performance optimization:** Basic performance targets (<2s page load, <200ms API reads) will be validated, but no dedicated performance engineering effort.


## 0.7 Deliverable Mapping


### 0.7.1 File Creation Plan

| File Path | Purpose | Content Type | Priority |
|---|---|---|---|
| `src/server/index.ts` | Server entry point, DB connections, outbox poller start | Source | High |
| `src/server/app.ts` | Express app init, middleware stack configuration | Source | High |
| `src/server/middleware/auth.ts` | JWT validation from HttpOnly cookies | Source | High |
| `src/server/middleware/rbac.ts` | Role-based access control middleware | Source | High |
| `src/server/middleware/rateLimiter.ts` | Rate limiting per endpoint category | Source | High |
| `src/server/middleware/phiHeaders.ts` | Cache-Control: no-store for PHI responses | Source | High |
| `src/server/middleware/errorHandler.ts` | Global error handling middleware | Source | High |
| `src/server/middleware/requestLogger.ts` | Request/response audit logging | Source | High |
| `src/server/modules/auth/routes.ts` | Auth endpoints (register, login, OAuth, 2FA) | Source | High |
| `src/server/modules/auth/service.ts` | Auth business logic | Source | High |
| `src/server/modules/auth/schemas.ts` | Auth Zod validation schemas | Source | High |
| `src/server/modules/family/routes.ts` | Family & CareRecipient endpoints | Source | High |
| `src/server/modules/family/service.ts` | Family management business logic | Source | High |
| `src/server/modules/family/schemas.ts` | Family Zod validation schemas | Source | High |
| `src/server/modules/timebank/routes.ts` | Time Bank endpoints | Source | High |
| `src/server/modules/timebank/service.ts` | Time Bank orchestration logic | Source | High |
| `src/server/modules/timebank/schemas.ts` | Time Bank Zod validation schemas | Source | High |
| `src/server/modules/timebank/ledger.ts` | Double-entry ledger operations | Source | High |
| `src/server/modules/timebank/matching.ts` | Proximity + skill matching algorithm | Source | High |
| `src/server/modules/timebank/decay.ts` | Half-life decay calculator | Source | High |
| `src/server/modules/timebank/respite.ts` | Respite Default and Emergency Fund logic | Source | High |
| `src/server/modules/assessment/routes.ts` | CII/CRI/KBS endpoints | Source | High |
| `src/server/modules/assessment/service.ts` | Assessment orchestration | Source | High |
| `src/server/modules/assessment/schemas.ts` | Assessment Zod validation schemas | Source | High |
| `src/server/modules/assessment/cii.ts` | CII scoring, zone classification | Source | High |
| `src/server/modules/assessment/cri.ts` | CRI scoring, MD review workflow | Source | Medium |
| `src/server/modules/assessment/kbs.ts` | KBS 1-5 outcome tracking | Source | High |
| `src/server/modules/omaha/routes.ts` | Omaha crosswalk endpoints | Source | High |
| `src/server/modules/omaha/service.ts` | Omaha crosswalk orchestration | Source | High |
| `src/server/modules/omaha/schemas.ts` | Omaha Zod validation schemas | Source | High |
| `src/server/modules/omaha/crosswalk.ts` | ICD-10 ↔ Omaha mapping engine | Source | High |
| `src/server/modules/omaha/kbs.ts` | KBS recording and FHIR sync | Source | High |
| `src/server/modules/lmn/routes.ts` | LMN lifecycle endpoints | Source | Medium |
| `src/server/modules/lmn/service.ts` | LMN generation and signing logic | Source | Medium |
| `src/server/modules/lmn/schemas.ts` | LMN Zod validation schemas | Source | Medium |
| `src/server/modules/payment/routes.ts` | Stripe and Comfort Card endpoints | Source | High |
| `src/server/modules/payment/service.ts` | Payment orchestration | Source | High |
| `src/server/modules/payment/schemas.ts` | Payment Zod validation schemas | Source | High |
| `src/server/modules/payment/stripe.ts` | Stripe API wrapper | Source | High |
| `src/server/modules/notification/routes.ts` | Notification endpoints | Source | High |
| `src/server/modules/notification/service.ts` | Notification routing and delivery | Source | High |
| `src/server/modules/notification/channels/push.ts` | Web Push sender | Source | High |
| `src/server/modules/notification/channels/sms.ts` | Twilio SMS sender | Source | High |
| `src/server/modules/notification/channels/email.ts` | SendGrid email sender | Source | High |
| `src/server/modules/wearable/routes.ts` | Wearable data endpoints | Source | Medium |
| `src/server/modules/wearable/service.ts` | Vitals ingestion and anomaly detection | Source | Medium |
| `src/server/modules/wearable/loinc-mapper.ts` | LOINC code mapping for Apple Health vitals | Source | Medium |
| `src/server/modules/gemini/routes.ts` | AI endpoints (Scribe + Guide) | Source | Medium |
| `src/server/modules/gemini/scribe-service.ts` | Ambient Scribe voice-to-text + Omaha coding | Source | Medium |
| `src/server/modules/gemini/guide-service.ts` | Ambient Guide conversational AI | Source | High |
| `src/server/modules/worker/routes.ts` | Worker-Owner portal endpoints | Source | Medium |
| `src/server/modules/worker/service.ts` | Worker portal business logic | Source | Medium |
| `src/server/modules/worker/equity.ts` | Subchapter T equity calculations | Source | Medium |
| `src/server/modules/wellness/routes.ts` | Wellness provider/marketplace endpoints | Source | Medium |
| `src/server/modules/wellness/service.ts` | Marketplace business logic | Source | Medium |
| `src/server/modules/employer/routes.ts` | Employer dashboard endpoints | Source | Medium |
| `src/server/modules/employer/service.ts` | Employer aggregate logic | Source | Medium |
| `src/server/modules/employer/roi-calculator.ts` | ROI and productivity impact formulas | Source | Medium |
| `src/server/modules/messaging/routes.ts` | Messaging endpoints | Source | High |
| `src/server/modules/messaging/service.ts` | Messaging business logic | Source | High |
| `src/server/db/postgres.ts` | PostgreSQL client initialization | Source | High |
| `src/server/db/aidbox.ts` | Aidbox FHIR client initialization | Source | High |
| `src/server/db/redis.ts` | Redis client initialization | Source | High |
| `src/server/db/sync/outbox.ts` | Transactional Outbox event writer | Source | High |
| `src/server/db/sync/poller.ts` | Outbox event poller/consumer | Source | High |
| `src/server/db/sync/transformers/*.ts` | FHIR resource transformers (5 files) | Source | High |
| `src/server/config/settings.ts` | Central configuration management | Config | High |
| `src/server/config/roles.ts` | RBAC role and permission definitions | Config | High |
| `src/server/config/omaha-taxonomy.ts` | Omaha System 42 problems reference data | Config | High |
| `src/client/main.tsx` | React entry point with providers | Source | High |
| `src/client/App.tsx` | Root router (EXISTING — enhance with auth gate) | Source | High |
| `src/client/theme.ts` | Brand tokens (EXISTING — preserve) | Source | High |
| `src/client/service-worker.ts` | PWA Service Worker with PHI bypass | Source | High |
| `src/client/features/auth/*.tsx` | Auth screens (login, register, OAuth, 2FA) | Source | High |
| `src/client/features/conductor/*.tsx` | Conductor Dashboard (5 views) | Source | High |
| `src/client/features/timebank/*.tsx` | Time Bank Hub (4 views) | Source | High |
| `src/client/features/assessment/*.tsx` | Assessment flows (4 views) | Source | High |
| `src/client/features/public/*.tsx` | Public site (6 views, 5 EXISTING) | Source | High |
| `src/client/features/onboarding/*.tsx` | Conductor onboarding (10-step flow) | Source | High |
| `src/client/features/messaging/*.tsx` | Messaging UI | Source | High |
| `src/client/features/worker/*.tsx` | Worker-Owner Portal (4 views) | Source | Medium |
| `src/client/features/medical/*.tsx` | Medical Director Console (3 views) | Source | Medium |
| `src/client/features/lmn/*.tsx` | LMN Marketplace (3 views) | Source | Medium |
| `src/client/features/admin/*.tsx` | Admin Dashboard (4 views) | Source | Medium |
| `src/client/features/employer/*.tsx` | Employer Dashboard (3 views) | Source | Medium |
| `src/client/stores/*.ts` | Zustand stores (3 stores) | Source | High |
| `src/client/api/client.ts` | API client with auth interceptors | Source | High |
| `src/client/api/queries/*.ts` | TanStack Query hooks per module | Source | High |
| `src/client/api/mutations/*.ts` | TanStack mutation hooks per module | Source | High |
| `src/client/hooks/*.ts` | Custom hooks (4 hooks) | Source | High |
| `src/shared/types/*.ts` | Shared TypeScript interfaces (3 files) | Source | High |
| `src/shared/constants/*.ts` | Immutable constants (3 files) | Source | High |
| `src/shared/validators/*.ts` | Shared validation logic (2 files) | Source | High |
| `tests/e2e/*.spec.ts` | E2E test specs (6 specs) | Test | High |
| `tests/fixtures/seed-*.ts` | Seed data fixtures (3 files) | Test | High |
| `scripts/seed.ts` | Database seed script | Script | High |
| `scripts/init-aidbox.ts` | Aidbox init bundle loader | Script | High |
| `scripts/setup-dev.sh` | Dev environment setup | Script | High |
| `docker-compose.yml` | Local dev orchestration | Config | High |
| `Dockerfile` | Production container | Config | High |
| `.env.example` | Environment variables template | Config | High |
| `package.json` | Dependencies and scripts | Config | High |
| `tsconfig.json` | Root TypeScript config | Config | High |
| `vite.config.ts` | Vite build config with aliases | Config | High |
| `tailwind.config.ts` | Tailwind brand customization | Config | High |
| `.github/workflows/*.yml` | CI/CD pipelines (3 workflows) | Config | High |
| `README.md` | Project documentation | Documentation | High |
| `docs/architecture/*.md` | Architecture decision records | Documentation | Medium |
| `docs/compliance/phi-handling.md` | PHI data handling rules | Documentation | High |

### 0.7.2 Implementation Phases

**Foundation Phase — Core Structure and Configuration:**

Establishes the project skeleton, database connections, authentication, and infrastructure. All subsequent phases depend on this foundation.

- Project scaffolding (Vite + React + TypeScript + Tailwind)
- Express v5 server setup with middleware stack (auth, RBAC, rate limiting, PHI headers, error handling, logging)
- PostgreSQL connection and schema initialization
- Aidbox FHIR R4 connection and init bundle (CodeSystem, ConceptMap, Questionnaire)
- Redis connection for caching and notification streams
- Docker Compose for local development
- CI/CD pipeline (GitHub Actions)
- Environment configuration (.env.example, settings.ts)
- Shared types, constants, validators
- Authentication module (register, login, OAuth, JWT cookies, 2FA, RBAC)

**Core Logic Phase — Primary Business Logic and Data Models:**

Implements the three core engines that define CareOS — the Time Bank, the Omaha Crosswalk, and the Assessment system.

- Family and CareRecipient CRUD
- Time Bank Engine (ledger, matching, decay, deficit, Respite Default, cash purchases)
- CII Assessment Engine (Mini CII + Full CII with zone classification)
- KBS Outcome Tracking (1-5 ratings linked to Omaha problems)
- Omaha ↔ ICD-10 Crosswalk Engine (configurable rules in Aidbox ConceptMap)
- Time Bank task auto-coding to Omaha problems
- Stripe Payment integration ($100 membership, $59/mo subscription, $15/hr purchases)
- Notification Engine (multi-channel: push, SMS, email, in-app)
- Transactional Outbox sync layer (PostgreSQL → Aidbox and reverse)
- Secure Messaging module

**Interfaces Phase — Dashboards and User-Facing Views:**

Builds all frontend views, connecting to the API layer via TanStack Query hooks.

- Conductor Dashboard (care timeline, vitals, Time Bank wallet, Comfort Card, CII gauge)
- Time Bank Hub (task feed, accept/post/track, GPS check-in/out, impact score)
- Assessment UIs (Mini CII sliders, Full CII form, KBS rating form)
- Public Website integration (existing components + Ambient Guide chat overlay)
- Conductor Onboarding Flow (10-step from landing to dashboard)
- PWA Service Worker with PHI cache bypass
- Worker-Owner Portal, Medical Director Console, Admin Dashboard (Phase 2 views)
- LMN Marketplace, Employer Dashboard (Phase 2 views)

**Testing Phase — Comprehensive Test Coverage:**

Validates all critical user flows and business logic against the PRD test scenarios.

- Unit tests for Time Bank ledger, decay, matching, deficit rules
- Unit tests for CII/CRI/KBS scoring and zone classification
- Unit tests for Omaha Crosswalk Engine (ICD-10 mapping, auto-coding)
- Integration tests for PostgreSQL ↔ Aidbox sync pipeline
- E2E test: Conductor onboarding (<10 minutes completion)
- E2E test: Time Bank round-trip (post → match → GPS → credit → gratitude)
- E2E test: LMN → HSA booking flow
- E2E test: Change-in-condition escalation (worker → conductor → MD)
- E2E test: Omaha Crosswalk Pipeline (ICD-10 in → LMN out)
- E2E test: Employer CII rollout (CSV → invites → aggregate)
- Seed data scripts with Lisa, Janet, Patricia user stories

**Documentation Phase — Essential Guides:**

- README with setup instructions, architecture overview, and developer guide
- API documentation (OpenAPI/Swagger)
- PHI handling compliance documentation
- Architecture decision records (dual-database, Transactional Outbox, Omaha crosswalk)
- Deployment guide (Docker, Vercel, AWS/GCP)


## 0.8 References


### 0.8.1 User-Provided Documentation

The following documents were provided by the user as the basis for this Agent Action Plan. No file attachments were uploaded — all content was provided inline as structured text.

| Document | Summary |
|---|---|
| **CareOS: Definitive Product Requirements Document (PRD)** | Comprehensive PRD covering vision, core requirements, planning, business rules, and implementation priorities for a worker-owned home care cooperative platform. Defines the Conductor persona, Time Bank engine, Omaha System ↔ ICD-10 Crosswalk, KBS outcome tracking, CII/CRI assessments, LMN Marketplace, Comfort Card, and 7 user roles. Specifies React 18+/TypeScript/Vite frontend, Node.js/Express backend, PostgreSQL operational database, and Aidbox FHIR R4 clinical database. |
| **co-op.care — CareOS Platform Master Build Specification & Architecture Addendum** | Extended architecture document including detailed user stories (Lisa, Janet, Patricia), notification architecture for all roles, Time Bank state machine and deficit rules, complete data models for 15+ entities, dual-database architecture (PostgreSQL + Aidbox), sync layer design, Omaha System clinical taxonomy deep dive (42 problems × 4 domains with ICD-10 mappings), Gemini AI integration specs (Ambient Scribe + Ambient Guide), phased dependency map, anti-patterns list (10 items), and test scenarios (7 tests). |

### 0.8.2 External Resources Referenced

| Resource | URL | Purpose |
|---|---|---|
| PostgreSQL Releases | https://postgresql.org/docs/16/release.html | Version verification — PostgreSQL 16 GA confirmed |
| PostgreSQL GitHub | https://github.com/postgres/postgres | Architecture documentation, driver compatibility |
| node-postgres (pg) | https://github.com/brianc/node-postgres | pg v8.x with PostgreSQL 16 support confirmed |
| Aidbox Documentation | https://docs.aidbox.app/ | FHIR R4 capabilities, Docker setup, SDK tutorials |
| Health Samurai Aidbox | https://www.health-samurai.io/aidbox | Platform features, pricing, HIPAA compliance |
| Aidbox Features | https://docs.aidbox.app/readme/features | FHIR version support, performance benchmarks, multitenancy |
| Express.js Releases | https://github.com/expressjs/express/releases | Express v5 GA confirmation, Promise support, Node.js 18+ requirement |
| Express.js npm | https://www.npmjs.com/package/express | Latest version (5.2.1), installation |
| TanStack Query | https://tanstack.com/query/latest | React Query v5 documentation, API reference |
| Vite Getting Started | https://vite.dev/guide/ | Vite setup, React TypeScript template, build configuration |
| Omaha System Official | https://www.omahasystem.org/ | Taxonomy documentation, public domain status, KBS rating scale |
| Omaha System (NLM UMLS) | https://www.nlm.nih.gov/research/umls/sourcereleasedocs/current/OMS/index.html | 42 problems, 4 domains, UMLS integration |
| Omaha System (Wikipedia) | https://en.wikipedia.org/wiki/Omaha_System | HL7 registration, LOINC/SNOMED CT integration, ANA recognition |
| Omaha System in Nursing (PMC) | https://pmc.ncbi.nlm.nih.gov/articles/PMC8013593/ | Clinical validation of Omaha System, KBS outcome measurement |

### 0.8.3 Key People Referenced

| Person | Role | Contact |
|---|---|---|
| Blaine Warkentine, MD | Founder/CEO, co-op.care | blaine@co-op.care · 484-684-5287 |
| Josh Emdur, DO | Medical Director, BCH Hospitalist (2008–present), 50-state licensed | Writes all LMNs, conducts CRI assessments |

### 0.8.4 Figma Assets

No Figma URLs or design assets were provided for this project. UI implementation will follow the functional descriptions in the PRD with mobile-first responsive design using Tailwind CSS.

### 0.8.5 Legal and Compliance References

| Reference | Relevance |
|---|---|
| HIPAA (Health Insurance Portability and Accountability Act) | Clinical data in Aidbox requires HIPAA-compliant storage, transmission, and access controls. BAA required with hosting provider. |
| IRS Publication 502 | Defines qualifying medical expenses for HSA/FSA eligibility. LMN must reference Pub 502 categories to justify wellness service tax deductibility. |
| Subchapter T (Internal Revenue Code) | Governs cooperative taxation and patronage dividends. Worker-Owner equity calculations must comply. |
| Colorado SB 24-205 | State-level regulation relevant to worker-owned cooperative operations in Colorado. |
| CDPHE Class A License | Colorado Department of Public Health and Environment home care agency license. Application pending. |


## 0.9 Execution Patterns


### 0.9.1 Implementation Guidelines

**TypeScript Best Practices:**

- Strict mode enabled (`strict: true` in tsconfig.json) with no `any` types permitted in production code
- Shared type definitions in `src/shared/types/` for all entities, API contracts, and FHIR resources
- Zod schemas for runtime validation at API boundaries (request body/params/query validation)
- Discriminated union types for status enums (e.g., `membershipStatus`, `taskStatus`, `lmnStatus`) to enable exhaustive switch handling
- Barrel exports (`index.ts`) for each module to maintain clean import paths

**React Patterns:**

- Feature-based folder organization (`src/client/features/{feature}/`) rather than type-based (`components/`, `pages/`)
- TanStack Query for all server-fetched data — no direct `useState` for API data
- Zustand stores only for purely client-side state (UI preferences, navigation, form drafts)
- Custom hooks (`useAuth`, `useRole`, `useTimeBank`, `useNotifications`) encapsulate shared logic
- Code splitting via React.lazy and Suspense for role-specific dashboard bundles
- All forms use controlled components with proper accessibility (ARIA labels, keyboard navigation)

**Express/Node.js Patterns:**

- Modular route registration: each module's `routes.ts` exports an Express Router, registered in `app.ts`
- Service layer pattern: routes delegate to services, services contain business logic, services call database clients
- Centralized error handling via `errorHandler.ts` middleware — no try/catch in route handlers
- Async route handlers use Express v5 native Promise rejection handling
- Structured logging via `logger.ts` with request ID correlation
- All environment variables accessed through `config/settings.ts` — never directly from `process.env` in modules

**Database Access Patterns:**

- PostgreSQL: Use SQL with parameterized queries to prevent injection. Leverage relation table joins for cascade chains and care team relationships. Use live queries (WebSocket) for real-time dashboard updates.
- Aidbox: Use FHIR REST API with TypeScript SDK. All clinical writes go through the Transactional Outbox. Direct reads are permitted for clinical data display.
- Redis: Use for non-PHI caching only. Notification delivery via Redis Streams with consumer group acknowledgment. Session tokens stored with appropriate TTL.

**Omaha System Integration Patterns:**

- The 42 Omaha problems are stored as a FHIR `CodeSystem` in Aidbox and mirrored as a reference constant in `src/server/config/omaha-taxonomy.ts` for fast server-side lookups
- ICD-10 ↔ Omaha crosswalk rules stored as a FHIR `ConceptMap` in Aidbox — the engine queries this at runtime for mapping
- Time Bank task auto-coding uses a local mapping table (`taskType → omahaProblemId`) validated against the CodeSystem
- KBS outcomes are FHIR `Observation` resources with `valueInteger` (1-5) and `code` referencing the Omaha problem

**Security Implementation:**

- JWTs issued on login and stored in `Set-Cookie` with `Secure; HttpOnly; SameSite=Strict; Path=/api`
- Refresh tokens stored in PostgreSQL with rotation on each use
- RBAC middleware reads role from JWT claims and validates against endpoint-level `allowedRoles` array
- PHI endpoints flagged via `phiHeaders.ts` middleware that injects `Cache-Control: no-store` and `Pragma: no-cache`
- Service Worker in `src/client/service-worker.ts` maintains an explicit PHI URL pattern list and bypasses cache for any matching request
- All Aidbox writes generate an `AuditEvent` resource for HIPAA audit trail
- Rate limiting per role and endpoint category via `rateLimiter.ts`

**Behavioral Economics Implementation:**

- Respite Default (0.1 hr per earned hour) implemented as a default parameter in `LedgerService.credit()` with an explicit opt-out flag — the opt-out must be a single clearly-labeled toggle in the task completion UI
- Half-life decay runs as a scheduled job (daily) via a cron-like mechanism in the server, applying graduated decay to inactive accounts
- Deficit nudges trigger notifications at -5, -10, -15 thresholds, checked on every `LedgerService.debit()` call
- Viral loop trigger (refer-a-neighbor prompt) fires via notification after the 3rd completed task, checked in `TimeBankService.completeTask()`
- Credit expiry warnings sent at 30 days before 12-month expiry via scheduled notification job

### 0.9.2 Quality Standards

**Code Quality:**

- ESLint with TypeScript parser, React hooks rules, jsx-a11y accessibility rules, and import ordering
- Prettier for consistent formatting (2-space indent, single quotes, trailing commas)
- Husky pre-commit hooks for lint-staged (lint + format check on staged files)
- All public service methods and utility functions must include JSDoc documentation
- All modules must export TypeScript interfaces for their public API

**Testing Standards:**

- Test coverage target: 80% for core business logic (Time Bank ledger, assessment scoring, Omaha crosswalk, payment processing)
- Unit tests with Vitest for all service-layer functions with edge cases (deficit limits, GPS boundary, score bounds)
- Integration tests for PostgreSQL ↔ Aidbox sync pipeline (verifying at-least-once delivery, idempotency)
- E2E tests with Playwright for all 7 test scenarios defined in the PRD:
  - Test 1: Full Conductor Onboarding (must complete in <10 minutes)
  - Test 2: Time Bank Round Trip (post → match → GPS → credit → gratitude)
  - Test 3: LMN → HSA Booking
  - Test 4: Change-in-Condition Escalation
  - Test 5: Wearable Anomaly Detection
  - Test 6: Employer CII Rollout
  - Test 7: Respite Emergency Fund Crisis
- Seed data scripts populate realistic test data based on Lisa, Janet, and Patricia user stories

**Security Standards:**

- No PHI in client-side localStorage or sessionStorage — ever
- No raw financial identity data (SSN, full CC numbers, bank accounts) stored in CareOS
- All API endpoints require authentication except: public website, Mini CII Quick Check, auth routes
- 2FA mandatory for Medical Director and Admin roles
- Background check verification gate for in-person Time Bank tasks
- HIPAA-compliant audit logging for all clinical data access (via Aidbox AuditEvent)
- Dependency vulnerability scanning via `npm audit` in CI pipeline
- Secrets management via environment variables (never hardcoded, never committed)

**Performance Standards:**

- Page load: <2 seconds (measured at P95 on mobile 4G)
- API read latency: <200ms (measured at P95)
- Time Bank match notification: <30 seconds from task post to push notification
- Time Bank task match: <4 hours SLA (operational, not performance)
- PWA offline: public pages and cached dashboard data available offline; all writes queued for sync

**Operational Standards:**

- Docker Compose must bring up full local development environment with a single `docker compose up` command
- All configuration via environment variables documented in `.env.example`
- Graceful shutdown handling: server drains in-flight requests, closes DB connections, and stops outbox poller
- Structured JSON logging for all server events with correlation IDs for request tracing
- Health check endpoint (`/api/v1/health`) returning database connection status for both PostgreSQL and Aidbox

**Build and Deploy Standards:**

- CI pipeline: lint → type-check → unit tests → integration tests → build
- E2E pipeline: separate workflow with Docker Compose-based infrastructure
- Frontend deployed to Vercel with preview deployments on pull requests
- Backend deployed to AWS/GCP with Docker containers and HIPAA-compliant hosting (BAA)
- Database migrations tracked in version control and applied via `scripts/migrate.ts`
- Aidbox initialization (CodeSystem, ConceptMap, Questionnaire) via `scripts/init-aidbox.ts` run as deployment hook