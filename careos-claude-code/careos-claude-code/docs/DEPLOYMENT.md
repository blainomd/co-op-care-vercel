# CareOS Deployment Guide

## Overview

CareOS runs on Railway with two environments:

| Environment | Branch | App Service | Database |
|---|---|---|---|
| Dev | `dev` | `care-os` | `Postgres-hUGs` (Railway managed) |
| Prod | `main` | `coop-care` | `Postgres` (Railway managed) |

Auto-deploy is active: pushing to `dev` deploys to dev, pushing to `main` deploys to prod.

---

## Architecture

```
Railway Project (helpful-alignment)
├── production environment (main branch)
│   ├── coop-care          — Node.js app (Dockerfile)
│   ├── Postgres           — Railway managed PostgreSQL 16
│   └── Redis-uf2O         — Railway managed Redis 7
│
└── dev environment (dev branch)
    ├── care-os            — Node.js app (Dockerfile)
    ├── Postgres-hUGs      — Railway managed PostgreSQL 16
    └── Redis              — Railway managed Redis 7
```

---

## Services

### CareOS App
- **Dockerfile**: `careos-claude-code/careos-claude-code/Dockerfile`
- **Port**: Railway injects `PORT=8080`
- **Healthcheck**: `GET /health` → `{"status":"ok"}`
- **Healthcheck config**: `railway.toml` — path `/health`, timeout 300s

### PostgreSQL
- **Version**: PostgreSQL 16 (Railway managed)
- **Schema**: `src/server/database/postgres.schema.sql` — 23 tables
- **Applied via**: `psql $DATABASE_URL -f postgres.schema.sql` (one-time at DB creation)
- **Migrations**: `src/server/database/migrations/` — numbered migration files for all future changes
- **Internal hostnames**:
  - Prod: `postgres.railway.internal:5432`
  - Dev: `postgres-hugs.railway.internal:5432`
- **Public TCP proxy** (for external access / schema apply):
  - Prod: `shuttle.proxy.rlwy.net:25553`
  - Dev: `maglev.proxy.rlwy.net:16929`

### Redis
- Used for WebSocket pub/sub and session caching
- **Internal hostnames**:
  - Prod: `redis-uf2o.railway.internal:6379`
  - Dev: `redis.railway.internal:6379`

---

## Environment Variables

### Required for CareOS app

| Variable | Description | How to set |
|---|---|---|
| `NODE_ENV` | Must be `production` in Railway | `production` |
| `DATABASE_URL` | PostgreSQL connection string | Use Railway reference: `${{Postgres.DATABASE_URL}}` (prod) / `${{Postgres-hUGs.DATABASE_URL}}` (dev) |
| `REDIS_URL` | Redis connection string | Use Railway reference: `${{Redis-uf2O.REDIS_URL}}` (prod) / `${{Redis.REDIS_URL}}` (dev) |
| `JWT_PRIVATE_KEY` | RSA 2048-bit PEM private key (RS256) | `-----BEGIN PRIVATE KEY-----...` |
| `JWT_PUBLIC_KEY` | RSA 2048-bit PEM public key (RS256) | `-----BEGIN PUBLIC KEY-----...` |
| `JWT_SECRET` | Random base64 string (64 bytes) | `openssl rand -base64 64 \| tr -d '\n'` |
| `JWT_REFRESH_SECRET` | Random base64 string (64 bytes) | `openssl rand -base64 64 \| tr -d '\n'` |
| `SESSION_SECRET` | Random base64 string (32 bytes) | `openssl rand -base64 32 \| tr -d '\n'` |
| `JWT_ACCESS_EXPIRY` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token TTL | `7d` |
| `CORS_ORIGINS` | Allowed frontend origin | `https://co-op.care` |
| `FRONTEND_URL` | Used for redirects/emails | `https://co-op.care` |

### Critical notes on env vars

**`DATABASE_URL` and `REDIS_URL`** — Always set as Railway service references, not hardcoded strings:
```
# CORRECT — creates visual arrow in Railway dashboard, auto-updates if service changes
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis-uf2O.REDIS_URL}}

# WRONG — breaks if service URL changes, no connecting arrow, Railway CLI may silently truncate long values
DATABASE_URL=postgresql://postgres:abc123@postgres.railway.internal:5432/railway
```

**`JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY`** — Must be real RSA PEM keys, not random strings. Generate with:
```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```
Then paste the full PEM content (including `-----BEGIN/END-----` lines) as the env var value.

**`JWT_SECRET` / `JWT_REFRESH_SECRET`** — Must be a single continuous string with no spaces or newlines:
```bash
openssl rand -base64 64 | tr -d '\n'
```

---

## Database Schema

- **Location**: `src/server/database/postgres.schema.sql`
- **23 tables**: users, families, care_recipients, family_memberships, care_team_assignments, timebank_accounts, timebank_tasks, timebank_transactions, help_edges, assessments, kbs_ratings, notifications, messages, outbox_events, respite_fund, worker_equity, shifts, care_logs, shift_swaps, lmns, worker_applications, worker_documents, employer_accounts
- **Applied once** at database creation — not on every startup
- **Future changes**: Use numbered migration files in `src/server/database/migrations/` per `docs/MIGRATION.md`

### Applying schema to a fresh Railway database
```bash
# Prod
psql postgresql://postgres:<pass>@shuttle.proxy.rlwy.net:25553/railway \
  -f src/server/database/postgres.schema.sql

# Dev
psql postgresql://postgres:<pass>@maglev.proxy.rlwy.net:16929/railway \
  -f src/server/database/postgres.schema.sql
```

---

## Server Startup Order

The server deliberately listens on the port **before** connecting to databases so Railway's healthcheck can pass immediately:

```
1. buildApp()           — register Fastify plugins/routes
2. app.listen(:8080)    — port open, /health returns 200
3. connectPostgres()    — connect to PostgreSQL pool     ─┐
4. connectRedis()       — connect to Redis               ─┤ parallel
5. initAidbox()         — connect (non-blocking warn)    ─┘
6. setupRedisRelay()    — subscribe to ws:broadcast (must be after step 4)
```

DB connection failures are caught and logged — the server stays up in degraded mode rather than crashing.

---

## Custom Domain

- **Domain**: `co-op.care` and `www.co-op.care`
- **Registrar/DNS**: Squarespace
- **DNS records**:
  ```
  www   CNAME  m1lxkwy2.up.railway.app
  @     CNAME  m1lxkwy2.up.railway.app
  _railway-verify  TXT  railway-verify=fa5750f7...
  ```
- **SSL**: Auto-provisioned by Railway (Let's Encrypt) after DNS propagates

---

## CI/CD

**GitHub Actions** (`.github/workflows/ci.yml`):
- Triggers on push/PR to `main` and `dev`
- Jobs: `lint` → `typecheck` → `test` → `build`

**Greptile** (`.github/workflows/greptile-review.yml`):
- AI code review on pull requests
- Requires `GREPTILE_API_KEY` and `GITHUB_TOKEN` secrets in GitHub repo settings

---

## Local Development

```bash
# Start dependencies
docker compose up -d careos-db redis

# Start server (uses .env or .env.local)
npm run dev:server

# Start frontend (separate terminal)
npm run dev
```

Local uses `DATABASE_URL=postgresql://careos:careos_dev@localhost:5432/careos` (set in `.env` from `.env.example`).

---

## Generating New Secrets

```bash
# RSA key pair for JWT RS256
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
cat private.pem  # → JWT_PRIVATE_KEY
cat public.pem   # → JWT_PUBLIC_KEY
rm private.pem public.pem  # don't leave keys on disk

# HMAC secrets
openssl rand -base64 64 | tr -d '\n'  # → JWT_SECRET, JWT_REFRESH_SECRET
openssl rand -base64 32 | tr -d '\n'  # → SESSION_SECRET
```

---

## Known Issues / Gotchas

1. **Railway CLI `variable set` with long URLs** — Setting long connection strings (with `@` and special chars) as literal values silently truncates. Always use Railway service references (`${{Service.VAR}}`) instead.

2. **`setupRedisRelay()` timing** — Must be called after `connectRedis()` completes. It's called in `server.ts` after `Promise.all([connectPostgres(), connectRedis(), initAidbox()])`. Do not move it back into the Fastify plugin registration.

3. **Multiline env vars in Railway** — PEM keys must be pasted with actual newlines preserved. If Railway strips newlines, JWT signing will fail with a key import error.

4. **Aidbox** — Not yet configured in either environment. Server logs `WARN: Aidbox not reachable` on startup — this is non-fatal, clinical FHIR sync is simply skipped.

5. **Docker `EXPOSE`** — `EXPOSE 3001` in Dockerfile is metadata only. Railway routes traffic based on the `PORT` env var (injected as 8080).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Railway healthcheck fails | Server not listening when healthcheck fires | Verify `app.listen()` is before DB connections in `server.ts` |
| `ECONNREFUSED` on PostgreSQL | `DATABASE_URL` is empty or literal was truncated | Set as Railway reference: `${{Postgres.DATABASE_URL}}` |
| `Redis not available` log on startup | `setupRedisRelay()` called before `connectRedis()` | Verify it's called after `Promise.all` in `server.ts` |
| No connecting arrow in Railway dashboard | Env var set as hardcoded string, not service reference | Re-set with `railway variable set VAR='${{Service.VAR}}'` |
| JWT sign/verify error | Invalid RSA key format | Regenerate with `openssl genrsa`, paste full PEM including headers |
| `502 Application failed to respond` | Port mismatch or server crashed | Check deploy logs; verify `PORT` env var is read correctly |
| Schema table missing | Fresh DB, schema never applied | Apply `postgres.schema.sql` via psql using public TCP proxy URL |
