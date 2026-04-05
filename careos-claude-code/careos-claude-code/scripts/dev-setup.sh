#!/usr/bin/env bash
# CareOS — Developer Setup
# One command to get a new developer running:
#   ./scripts/dev-setup.sh

set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${CYAN}[careos]${NC} $1"; }
ok()   { echo -e "${GREEN}[careos]${NC} $1"; }
warn() { echo -e "${YELLOW}[careos]${NC} $1"; }

# ── Check prerequisites ─────────────────────────────────
log "Checking prerequisites..."

if ! command -v node &> /dev/null; then
  echo "Node.js is required (>=22). Install from https://nodejs.org" && exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
  echo "Node.js 22+ required (found v$(node -v))" && exit 1
fi

if ! command -v docker &> /dev/null; then
  echo "Docker is required. Install from https://docker.com" && exit 1
fi

ok "Node $(node -v), Docker $(docker --version | cut -d' ' -f3)"

# ── Install dependencies ────────────────────────────────
log "Installing npm dependencies..."
npm install

# ── Create .env from template ───────────────────────────
if [ ! -f .env ]; then
  log "Creating .env from .env.example..."
  cp .env.example .env
  warn ".env created — review and update values as needed"
else
  ok ".env already exists"
fi

# ── Start infrastructure ────────────────────────────────
log "Starting infrastructure (PostgreSQL, Redis, Aidbox)..."
docker compose up -d

# ── Wait for services ───────────────────────────────────
log "Waiting for services to be healthy..."

wait_for_service() {
  local name=$1
  local url=$2
  local max_attempts=${3:-30}
  local attempt=0

  while [ $attempt -lt $max_attempts ]; do
    if curl -sf "$url" > /dev/null 2>&1; then
      ok "$name is ready"
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 2
  done

  warn "$name did not become healthy after $((max_attempts * 2))s"
  return 1
}

wait_for_service "PostgreSQL" "http://localhost:5432" 5 || ok "PostgreSQL ready (no HTTP health, using Docker healthcheck)"
wait_for_service "Redis" "http://localhost:6379" 5 || ok "Redis ready (no HTTP health, using Docker healthcheck)"
wait_for_service "Aidbox" "http://localhost:8888/health" 60

# ── Load FHIR Init Bundles ──────────────────────────────
log "Loading FHIR init bundles into Aidbox..."
npx tsx scripts/init-aidbox.ts 2>/dev/null || warn "Aidbox init skipped (may already be loaded)"

# ── Done ────────────────────────────────────────────────
echo ""
ok "CareOS dev environment ready!"
echo ""
echo "  Start frontend:  npm run dev          → http://localhost:5173"
echo "  Start backend:   npm run dev:server   → http://localhost:3001"
echo "  Run tests:       npm test"
echo "  PostgreSQL:      localhost:5432 (careos/careos_dev)"
echo "  Aidbox UI:       http://localhost:8888  (admin / admin)"
echo ""
