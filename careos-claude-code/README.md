# CareOS — co-op.care Platform

Worker-owned home care cooperative operating system. Boulder, Colorado.

## Quick Start (Claude Code)

1. Read `CLAUDE.md` — master build instructions
2. Read `BUILD-TASKS.md` — session-by-session build plan
3. Start with Session 1: Project Scaffold
4. `docker compose up -d` for local dev stack (PostgreSQL + Redis + Aidbox)

## Architecture

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + PWA
- **Backend:** Fastify 5 modular monolith on Node.js 22 LTS
- **Databases:** PostgreSQL 3.0 (operational) + Aidbox FHIR R4 (clinical) + Redis 7 (cache)
- **Clinical Taxonomy:** Omaha System (42 problems, 4 domains)

## Documentation

- `docs/PRD.md` — Full product requirements
- `docs/ARCHITECTURE.md` — Module specs, data models, API endpoints, file plan
- `src/shared/constants/` — Omaha System, business rules, LOINC codes, IRS Pub 502

## Key People

- **Blaine Warkentine, MD** — Founder/CEO — blaine@co-op.care
- **Josh Emdur, DO** — Medical Director — BCH Hospitalist since 2008

## Legal

- Worker-Owned Home Care Cooperative, LLC — Colorado
- CDPHE Class A license pending
- HIPAA compliant from Day 1
