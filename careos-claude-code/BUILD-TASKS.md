# CareOS Phase 1 — Build Tasks

Use these as Claude Code session tasks. Each is scoped to ~1 session.

## Session 1: Project Scaffold
```
Initialize the CareOS project: Vite + React 19 + TypeScript + Tailwind CSS 4.
Configure vite-plugin-pwa. Set up monorepo paths (src/client, src/server, src/shared).
Install all dependencies from CLAUDE.md tech stack. Configure ESLint + Prettier.
Create tsconfig.json with strict mode and path aliases.
Create GitHub Actions CI workflow (lint, typecheck, test, build).
The shared constants are already written in src/shared/constants/ — preserve them.
```

## Session 2: Backend Foundation
```
Create the Fastify 5 backend in src/server/.
- app.ts: Fastify factory with plugin registration, CORS, Helmet
- server.ts: entry point with graceful shutdown
- database/postgresql.ts: connection with schema init
- database/postgresql.schema.surql: all tables, indexes, graph edges from docs/ARCHITECTURE.md §0.4.2
- database/aidbox.ts: FHIR R4 REST client with OAuth 2.0
- database/redis.ts: connection pooling for cache + sessions + pub/sub
- middleware/: auth, audit, rate-limit, error-handler (HIPAA-safe)
- common/: constants, exceptions, logger (no PHI), validators
Verify it starts with `npm run dev:server` and connects to Docker Compose stack.
```

## Session 3: Auth Module
```
Build src/server/modules/auth/ following the Fastify plugin pattern.
- JWT RS256 tokens (15-min access, 7-day refresh)
- 7-role RBAC with multi-role per user
- Routes: register, login, refresh, 2FA setup/verify
- Mandatory 2FA for medical_director and admin roles
- Password hashing with bcrypt (cost 12)
- Rate limiting on auth endpoints
Write unit tests for token generation, role validation, 2FA flow.
```

## Session 4: Family + Assessment Modules
```
Build src/server/modules/family/ (CRUD for Family + CareRecipient).
Build src/server/modules/assessments/ (CII + Mini CII + CRI).
- CII: 12 dimensions, 1-10 each, /120, zone classification
- Mini CII: 3 sliders, /30, zones per business-rules.ts
- CRI: 14 factors, 14.4-72.0, MD review workflow
- Longitudinal tracking per family
- FHIR QuestionnaireResponse sync via fhir-sync module stub
Write unit tests for zone classification edge cases.
```

## Session 5: Time Bank Engine
```
Build src/server/modules/timebank/ — the most complex module.
- ledger.service.ts: double-entry credit/debit with balance tracking
- matching.service.ts: skill + proximity + rating + availability scoring
- gps-verifier.service.ts: Haversine distance, 0.25mi threshold
- respite.service.ts: Respite Default (0.9/0.1), Emergency Fund
- nudge.service.ts: behavioral nudges at deficit thresholds + streaks
- cascade.service.ts: PostgreSQL graph queries for impact visualization
- omaha-coder.service.ts: auto-code tasks using TIME_BANK_OMAHA_MAP
Routes: create task, accept, check-in, check-out, buy credits, cascade query.
Write unit tests for ledger math, matching scores, GPS boundary.
```

## Session 6: FHIR Sync + Notifications
```
Build src/server/modules/fhir-sync/ — async PostgreSQL → Aidbox.
- Redis-backed job queue
- Sync handlers: Encounter, Observation, QuestionnaireResponse
- Exponential backoff retry on Aidbox failure

Build src/server/modules/notifications/ — multi-channel dispatch.
- push.service.ts (Web Push API)
- sms.service.ts (Twilio)
- email.service.ts (SendGrid)
- in-app storage in PostgreSQL
- Template-based content per notification type
```

## Session 7: Frontend — Shell + Auth + Dashboard
```
Build the React frontend shell:
- src/client/App.tsx: routing with role-based view switching
- src/client/main.tsx: PWA entry with service worker
- src/client/components/layout/: app shell, nav, mobile bottom nav
- src/client/hooks/useAuth.ts, useWebSocket.ts, useNotifications.ts
- src/client/services/api.ts: base HTTP client with JWT interceptor
- src/client/features/conductor/: dashboard with WebSocket timeline
- Brand system: Literata + DM Sans, Sage/Copper/Gold/Blue/Purple

Mount legacy components from src/client/legacy/ at public routes.
Legacy uses inline styles — DO NOT apply Tailwind to them.
```

## Session 8: Frontend — CII + Time Bank
```
Build CII assessment interface (warm, slider-based, NOT clinical):
- src/client/features/assessments/CIIAssessment.tsx
- src/client/features/assessments/MiniCII.tsx
- Smooth slider animations, friendly labels, zone color feedback
- Mini CII completable in 30 seconds

Build Time Bank Hub:
- src/client/features/timebank/TaskFeed.tsx (proximity-sorted cards)
- src/client/features/timebank/TaskAccept.tsx
- GPS check-in/out flow
- Gratitude prompt + rating
- Cascade visualization
```

## Session 9: Onboarding + Messaging
```
Build Conductor onboarding flow (<10 min target):
Mini CII → Create account → Full CII → Stripe $100 → CRI scheduling → Dashboard

Build secure messaging:
- src/client/components/messaging/: thread list, message view, compose
- WebSocket real-time delivery
```

## Session 10: Aidbox Init Bundle + Jobs + Tests
```
Create FHIR Init Bundle JSONs in config/aidbox/:
- omaha-codesystem.json (42 problems, custom CodeSystem)
- cii-questionnaire.json, cri-questionnaire.json
- omaha-to-icd10-conceptmap.json, icd10-to-omaha-conceptmap.json

Build background jobs in src/server/jobs/:
- timebank-expiry, membership-renewal, lmn-renewal, kbs-reassessment

Write E2E tests with Playwright:
- Conductor onboarding flow
- Time Bank task lifecycle (post → match → GPS → credit)
```
