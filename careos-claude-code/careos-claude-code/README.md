# co-op.care -- CareOS Platform

Worker-owned home care cooperative + national LMN production. Boulder, Colorado.

**Live:** https://careos-claude-code.vercel.app
**Entity:** co-op.care Technologies LLC (Colorado LCA)

## Setup

```bash
npm install
npm run dev
# Frontend: http://localhost:5173
# Backend: http://localhost:3001 (when wired)
```

For full dev stack (PostgreSQL + Redis + Aidbox):

```bash
docker compose up -d
```

### Environment Variables

Create `.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://user:pass@localhost:5432/careos
REDIS_URL=redis://localhost:6379
```

## Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS 4 + PWA
- **Backend:** Fastify 5 modular monolith on Node.js 22 LTS
- **Databases:** PostgreSQL (operational) + Aidbox FHIR R4 (clinical) + Redis (cache)
- **State:** Zustand (5 stores)
- **Clinical Taxonomy:** Omaha System (42 problems, 4 domains)

## Structure

```
src/
├── client/
│   ├── features/sage/     # Sage AI chat, CareCard, dashboard
│   ├── stores/            # 5 Zustand stores
│   └── components/        # Shared UI
├── server/                # Fastify backend modules
└── shared/                # Constants, types, Omaha System
docs/                      # PRD, architecture, briefings
```

## Key People

- **Blaine Warkentine, MD MBA** -- Founder/CEO -- blaine@co-op.care
- **Josh Emdur, DO** -- Co-Founder/CMO -- 50-state licensed physician
- **Jacob Pielke** -- Backend architecture

## Documentation

- `CLAUDE.md` -- AI assistant context and build instructions
- `JACOB-HANDOFF.md` -- Developer handoff
- `docs/` -- PRD, architecture, clinical specs, strategy
