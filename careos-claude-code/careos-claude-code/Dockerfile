# CareOS API — Multi-stage Production Build
# Node 22 LTS on Alpine for minimal attack surface

# ── Stage 1: Builder ─────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install deps first (layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Copy source + config
COPY tsconfig.json tsconfig.node.json vite.config.ts index.html ./
COPY src/ src/
COPY config/ config/
COPY scripts/ scripts/
COPY public/ public/

# Typecheck + build frontend (Vite outputs to dist/client)
RUN npx tsc --noEmit && npx vite build

# Compile server TypeScript to CommonJS
# tsc-alias rewrites @shared/* and @server/* path aliases to relative paths.
# The root package.json has "type":"module" (for Vite), so we write a nested
# package.json in dist/server/ to make Node.js treat those files as CommonJS.
# CommonJS resolution handles extension-less imports; ESM does not.
COPY tsconfig.server.json ./
RUN npx tsc -p tsconfig.server.json && \
    npx tsc-alias -p tsconfig.server.json && \
    echo '{"type":"commonjs"}' > dist/server/package.json

# ── Stage 2: Production Runner ───────────────────────────
FROM node:22-alpine AS runner

# Security: non-root user
RUN addgroup -S careos && adduser -S careos -G careos

WORKDIR /app

# Production deps only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy built frontend + compiled server
COPY --from=builder /app/dist/ dist/

# Copy FHIR init bundles + schema
COPY --from=builder /app/config/ config/
COPY --from=builder /app/scripts/ scripts/

# Copy schema files (referenced at runtime via __dirname)
COPY --from=builder /app/src/server/database/schema.sql dist/server/server/database/
COPY --from=builder /app/src/server/database/surrealdb.schema.surql dist/server/server/database/

# Security: no PHI in image layers, no secrets baked in
# All config via environment variables at runtime

USER careos

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/server/server/server.js"]
