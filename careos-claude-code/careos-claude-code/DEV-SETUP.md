# CareOS — Developer Setup Guide

Local dev, Railway dev env, compliance checklist (HIPAA + HSA/FSA).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Environment Variables (.env)](#environment-variables)
4. [Railway Dev Environment](#railway-dev-environment)
5. [Stripe Dashboard Checklist](#stripe-dashboard-checklist)
6. [HIPAA Compliance Checklist](#hipaa-compliance-checklist)
7. [HSA/FSA + MCC 8099 Checklist](#hsafsa--mcc-8099-checklist)
8. [Running Tests](#running-tests)

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 22 LTS | `brew install node` or [nvm](https://github.com/nvm-sh/nvm) |
| Docker Desktop | Latest | [docker.com](https://www.docker.com/products/docker-desktop) |
| Railway CLI | Latest | `brew install railway` |
| Stripe CLI | Latest | Download arm64 binary from [GitHub releases](https://github.com/stripe/stripe-cli/releases) → `mv stripe ~/bin/stripe && chmod +x ~/bin/stripe` |

---

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/co-op-care/care-os.git
cd care-os/careos-claude-code/careos-claude-code
npm install
```

### 2. Start infrastructure (Docker)

```bash
# Start Postgres, Redis, Aidbox (takes ~30s first time)
docker compose up -d

# Verify all containers are healthy
docker compose ps
```

Services started:
- **PostgreSQL** → `localhost:5432` (db: `careos`, user: `careos`, pass: `careos_dev`)
- **Redis** → `localhost:6379`
- **Aidbox FHIR** → `localhost:8888` (client: `root`, secret: `secret`)

### 3. Copy and fill environment variables

```bash
cp .env.example .env
# Fill in values per the section below
```

### 4. Start the API server

```bash
npm run dev:server
# Server starts on http://localhost:3001
```

### 5. Start the Stripe webhook listener (separate terminal)

```bash
~/bin/stripe listen \
  --api-key sk_test_YOUR_STRIPE_TEST_KEY_HERE \
  --forward-to http://localhost:3001/api/v1/payment/webhooks/stripe
```

The listener will print a `whsec_...` webhook signing secret — set it as `STRIPE_WEBHOOK_SECRET` in `.env`.

### 6. Start the frontend (separate terminal)

```bash
npm run dev
# Frontend starts on http://localhost:5173
```

### 7. Verify everything is running

```bash
curl http://localhost:3001/health
# → {"status":"ok","timestamp":"..."}
```

---

## Environment Variables

Copy this into `.env` and fill in the values marked `# ← SET THIS`.

```dotenv
# ============================================================
# DATABASE
# ============================================================
DATABASE_URL=postgresql://careos:careos_dev@localhost:5432/careos

POSTGRESQL_URL=postgresql://careos:careos_dev@localhost:5432/careos
POSTGRESQL_NAMESPACE=careos
POSTGRESQL_DATABASE=production
POSTGRESQL_USER=root
POSTGRESQL_PASS=root

AIDBOX_URL=http://localhost:8888
AIDBOX_CLIENT_ID=root
AIDBOX_CLIENT_SECRET=secret

REDIS_URL=redis://localhost:6379

# ============================================================
# AUTH — JWT RS256 (already generated for local dev)
# ============================================================
# These are dev-only keys. DO NOT use in production.
# Generate new ones for prod: openssl genrsa -out private.pem 2048
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDB1FBwJ8+Nc8PV
uy201OuGwDUVc0eQrX3+eqh7/kx/Ql1nhYBxkOCwS6Oski9L3PsA/nHstZgwfmjj
n9J1qq5UsZF1FK+uy5uhX6SQZr+z+Nf6GtSXUolkdfXL8oZ0jRQzX9fA+uii3b4p
yeB/O/SEIektsWBATmLCIzAySJo2hWKC9HYpZ9OHegnKlkdGaR3IuXTzxg+RyTBT
0sOHWe85/NC0LZgE5NZOg+kJh/XOvO2xHp/K/y9+Sq5O7mw+YHBiX0ookzImpPf0
XVRd/gNJfnNejHiBNgo/HZMKgGefOTZPRBVU5fuZE1Y0yFSuVH57KqzaszaZt70w
EvDGWjHbAgMBAAECggEADFcI8WVIl/bC4F2krYF+uOREwXoPvNOdpxVqvwPYZshG
fjKDlBvryh2FiEwl+bM/0/coMOdDDvK8KzSSHlfJ0aVBRBdORgUWlH0sZSaGnubT
mvBQNUSoJr6vhASLgmo27WD1MWKMkJcD3PWlpHrpeH4PVrQE3H6loRYL/kHUCUpP
ABDpULeoA9bThc85p//PKE2GEUDojAtzcaLGQ4zYXLhaehUrpLVY0tzFYA3HVfiE
n2Yh9iAD6YYmsDsyrrLC/8rC/r5dDkrFc53W55DKqgZs6SLPCxlhNX5LXI4BmhVs
J4JLWp8Ru4QcZzMqyUGmSxCGcYuMOa+NSnrgfm6lcQKBgQDhTc6MMhrsw6RY7eRC
ZrjPUPRoR0mUQ78owPuZ2IPwIE2pruMnPl99Dpio+gz9b8y7AW+In4dCy9QT5P/e
7IhnbEozY8wmms0MKU5Ph4nI+pY9S9oaNzqk1rU4fRcblkrReHUJ3BEnbN8CsgLj
lZJfWQXJqAO7NSGXTXf6rEN2KwKBgQDcPLsjtjrAhLe7MTmCQAvd3RNCpVXaRiMz
EMB+VIjphDdMa9NTU9njAgAWh1fpcixz6/kAq9uVEtvYbQPwoY7LVH07dHiOeIo8
6JnyEYun96culXSMuUhSgTi8sBBTRha2VUacNAwINM3Ks9WZ6prWYwfZFULmZZ8P
KNWwiSKLEQKBgQCG2SProz2cQgiGtXOuDn9EjkaKd0hhth6ezMqKLR3ixeLV0Xfh
kCJk3iyeznKh6Z1WvCg+VIUHhKmdcq12homppRXQJkYVQQfC5KIbVZsxMFJlw5V5
pV6zNFLoyW3gNBb5wqgCS7X0q+PaYCL8hhRCfyzIoogBL264eUR7Q0lpWwKBgBDx
kywyLt701vXN2bDNoJwXEA5Gjg5W6wpYtZaChm4AwAhfG0kD4HV4h+0zyG2rXQQm
GWgV0LTtWICUEoOGymeWPnQ+h6/eUjRRaNaYxvfLM89/rBHPh2Lhki3iFb9yWvj4
IpCN6IcRGOwJXduTkwn/YHExE46KLuyJpbcJNeEhAoGBAL0DoefjFnCxBtGLvt+z
2VMVOSf/4B6lKxGdS6lYHitu4mHFMNbMlu8mC62Y3ILRqPtxagH59SjGbkU0J7M2
YbgfsD4ubqpktijRPJnGnORJcZDWTVUZBetfMTCFMAdJhsX2vzHT4BQUDvX6s+4T
1KdULQqO8BRtx7N6vMQPwuJZ
-----END PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwdRQcCfPjXPD1bsttNTr
hsA1FXNHkK19/nqoe/5Mf0JdZ4WAcZDgsEujrJIvS9z7AP5x7LWYMH5o45/Sdaqu
VLGRdRSvrsuboV+kkGa/s/jX+hrUl1KJZHX1y/KGdI0UM1/XwProot2+Kcngfzv0
hCHpLbFgQE5iwiMwMkiaNoVigvR2KWfTh3oJypZHRmkdyLl088YPkckwU9LDh1nv
OfzQtC2YBOTWToPpCYf1zrztsR6fyv8vfkquTu5sPmBwYl9KKJMyJqT39F1UXf4D
SX5zXox4gTYKPx2TCoBnnzk2T0QVVOX7mRNWNMhUrlR+eyqs2rM2mbe9MBLwxlox
2wIDAQAB
-----END PUBLIC KEY-----"
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ============================================================
# STRIPE — Test mode (dev/local only)
# ============================================================
# Account: Blaine Warkentine (stripe.com → test mode)
# MCC: 8099 (Other medical services) — set in Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_TEST_KEY_HERE

# Get this by running the Stripe CLI listener (see step 5 above).
# It changes each time you start a new listener session.
STRIPE_WEBHOOK_SECRET=whsec_ddb67a7f319703d7cf842b1dc40a5fb0f6fd93c1846d8c5a75023684057f6d10

# Created via: stripe prices create --product prod_UANWFHCX7S695Q --unit-amount 10000 --currency usd
STRIPE_MEMBERSHIP_PRICE_ID=price_1TC2lyIKPrlV1tgyAJxuK3Ws

# Comfort Card subscription price (Phase 2 — leave empty for now)
STRIPE_COMFORT_CARD_PRICE_ID=

# ============================================================
# INTEGRATIONS — fill when needed
# ============================================================
TWILIO_ACCOUNT_SID=          # ← SET THIS when SMS notifications are needed
TWILIO_AUTH_TOKEN=            # ← SET THIS
TWILIO_PHONE_NUMBER=          # ← SET THIS (e.g. +17205550000)

SENDGRID_API_KEY=             # ← SET THIS when email is needed
SENDGRID_FROM_EMAIL=hello@co-op.care

GOOGLE_MAPS_API_KEY=          # ← SET THIS for GPS verification features

DOCUSIGN_INTEGRATION_KEY=     # ← SET THIS for LMN e-signatures (Phase 2)
DOCUSIGN_SECRET_KEY=
DOCUSIGN_ACCOUNT_ID=

ZOOM_CLIENT_ID=               # ← SET THIS for telehealth video calls
ZOOM_CLIENT_SECRET=

CHECKR_API_KEY=               # ← SET THIS for worker background checks

# ============================================================
# APPLICATION
# ============================================================
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173

# ============================================================
# VAPID KEYS — Web Push notifications
# Generate: npx web-push generate-vapid-keys
# ============================================================
VAPID_PUBLIC_KEY=             # ← SET THIS
VAPID_PRIVATE_KEY=            # ← SET THIS
VAPID_MAILTO=mailto:blaine@co-op.care
```

---

## Railway Dev Environment

**URL:** https://care-os-dev.up.railway.app
**Branch:** `dev` (auto-deploys on push)
**Railway project:** `helpful-alignment` → environment `dev` → service `care-os`

### Switch to dev env and verify

```bash
cd careos-claude-code/careos-claude-code
railway environment dev
railway service care-os
railway variables   # shows all set vars
```

### Dev environment secrets (already set)

| Variable | Value | Notes |
|----------|-------|-------|
| `STRIPE_SECRET_KEY` | `sk_test_51Ei3js...` | Same test key as local |
| `STRIPE_WEBHOOK_SECRET` | `whsec_i9Vqrmo...` | Dev-specific webhook secret |
| `STRIPE_MEMBERSHIP_PRICE_ID` | `price_1TC2lyIK...` | Shared test price |
| `DATABASE_URL` | auto-injected | Railway Postgres plugin |
| `REDIS_URL` | auto-injected | Railway Redis plugin |
| `NODE_ENV` | `development` | Skips assertProductionSecrets() |
| `POSTGRES_SSL_REJECT_UNAUTHORIZED` | `false` | Required for Railway self-signed cert |

### Stripe webhook for dev

Endpoint registered in Stripe Dashboard (test mode):
- **URL:** `https://care-os-dev.up.railway.app/api/v1/payment/webhooks/stripe`
- **Events:** `payment_intent.succeeded`, `payment_intent.payment_failed`, `customer.subscription.created/deleted`, `charge.refunded`
- **Webhook ID:** `we_1TC35HIKPrlV1tgyFtD2OE3O`

### Update a Railway dev variable

```bash
railway environment dev && railway service care-os
railway variables set MY_VAR="value"
```

### View dev logs

```bash
railway environment dev && railway service care-os
railway logs --lines 50
```

---

## Stripe Dashboard Checklist

Go to [dashboard.stripe.com](https://dashboard.stripe.com) (make sure you are in **test mode**).

### Required — do these now

- [ ] **Fix statement descriptor** — Settings → Business → Business details → Statement descriptor
  Change from `CHASE` → `CO-OP CARE`
  (Customers see this on their bank statement. "CHASE" is a placeholder and will confuse users.)

- [ ] **Set industry to MCC 8099** — Settings → Business → Business details → Industry
  Select: `Healthcare` → `Other medical services`
  This assigns MCC 8099, which makes the merchant account recognized by HSA/FSA debit card networks.

- [ ] **Fix support phone** — Settings → Business → Public details → Customer support
  Replace `+1 (800) 935-9935` with a real support number (or remove if not yet set up).

- [ ] **Complete the 2 paused capabilities** — click "View tasks" in the dashboard banner
  These are likely: identity verification and/or bank account for payouts.
  Must be completed before you can accept live payments.

- [ ] **Add product description** — Settings → Business → Business details → Product description
  Example: _"Co-op.care is a worker-owned home care cooperative providing care coordination, time banking, and respite care services in Boulder, Colorado."_

### Before going live (switching to live keys)

- [ ] Switch `STRIPE_SECRET_KEY` in Railway production to `sk_live_...`
- [ ] Create a new **live-mode** webhook endpoint in Stripe Dashboard pointing to `https://www.co-op.care/api/v1/payment/webhooks/stripe`
- [ ] Update `STRIPE_WEBHOOK_SECRET` in Railway production with the live `whsec_...`
- [ ] Complete all Stripe identity verification steps (currently paused)

---

## HIPAA Compliance Checklist

### Done in code ✓

- [x] **No PHI in logs** — logger only records identifiers (`userId`, `familyId`), error codes, and event types. No names, emails, DOBs, or care recipient data.
- [x] **No PHI in error responses** — error handler returns opaque codes (`UNAUTHORIZED`, `NOT_FOUND`). Raw DB and Stripe errors are caught and sanitized before propagation.
- [x] **Auth required on all payment endpoints** — `requireAuth` + `requireRole` hooks on `/billing/*` and `/payment/*`.
- [x] **JWT RS256** — 15-min access tokens, 7-day refresh tokens. RS256 (asymmetric) required; HS256 is not used.
- [x] **Stripe errors sanitized** — `chargeOneTime` calls are wrapped in try/catch; raw Stripe error messages (which may include card details) never reach API responses.
- [x] **No card data stored** — `payment_records` table stores only Stripe PaymentIntent ID, amount, type, status. No PAN, CVV, cardholder name.
- [x] **Write-once payment records** — no `updatePaymentRecord` or `deletePaymentRecord` query exists. Immutable audit trail.
- [x] **Webhook signature verification** — every webhook request validates `stripe-signature` header before processing. Invalid signatures return 400 with opaque error.
- [x] **HTTPS in production** — Railway enforces TLS termination. `assertProductionSecrets()` blocks startup without required secrets.
- [x] **Audit logging** — `audit.middleware.ts` logs every PHI-adjacent request with `userId`, `resourceType`, `outcome`.
- [x] **19 HIPAA compliance tests** in `payment-compliance.test.ts` — run with `npm test`.

### Still needed (before first real patient data)

- [ ] **Business Associate Agreement (BAA) with Stripe** — Stripe offers a BAA for HIPAA customers. Request at: stripe.com/docs/security/stripe-hipaa → "Request a BAA". Required before storing any payment data tied to real care recipients.
- [ ] **BAA with Railway** — Railway's HIPAA compliance page: railway.app/legal. Contact their enterprise team for a BAA before production launch.
- [ ] **BAA with any email/SMS provider** — Twilio and SendGrid both offer BAAs. Required before sending any messages that reference a patient or care recipient.
- [ ] **Encryption at rest** — Railway Postgres encrypts at rest by default. Verify this is enabled in Railway dashboard → your Postgres service → Settings.
- [ ] **Access logs retained 6 years** — HIPAA requires audit logs for 6 years. Configure Railway log retention or export to a log aggregator (Datadog, CloudWatch).
- [ ] **Workforce training** — All staff with system access must complete annual HIPAA training. Document in a policy.
- [ ] **Incident response plan** — Written procedure for breach notification within 60 days (HIPAA Breach Notification Rule).

---

## HSA/FSA + MCC 8099 Checklist

### Done in code ✓

- [x] **`hsa_fsa_eligible: 'true'`** on every Stripe PaymentIntent metadata — enforced in `stripe.ts:chargeOneTime`.
- [x] **`hsaFsaEligible: true`** on every `payment_records` row — enforced in `service.ts`.
- [x] **`irs_pub_502: 'medical_care_services'`** in membership PaymentIntent metadata.
- [x] **Payment type discriminator** (`membership`, `credit_purchase`, `comfort_card`) on every record — required for IRS documentation.
- [x] **Human-readable description** on every charge and receipt — required for HSA/FSA reimbursement claims.
- [x] **Exact amounts stored** — `amountCents` integer, no rounding. IRS Pub-502 requires exact dollar amounts on receipts.
- [x] **Receipt endpoints** — `GET /api/v1/payment/billing/receipts?familyId=` and `GET /api/v1/payment/billing/receipts/:paymentIntentId` return full receipt data for HSA/FSA documentation.
- [x] **9 MCC 8099/HSA-FSA compliance tests** in `payment-compliance.test.ts`.

### Done in Stripe Dashboard ✓ (after you complete the checklist above)

- [ ] **Industry set to "Other medical services"** → assigns MCC 8099.
- [ ] **Statement descriptor set to `CO-OP CARE`** → appears on HSA/FSA card statements.

### Still needed

- [ ] **Letter of Medical Necessity (LMN) workflow** — Individual HSA/FSA reimbursement claims (especially for care coordination and time bank credits) require an LMN signed by Dr. Josh Emdur, DO. The LMN generation + DocuSign integration is Phase 2. Until then, provide receipts manually and advise members their HSA/FSA administrator may require an LMN.
- [ ] **IRS Pub-502 receipt template** — The receipt returned by `GET /billing/receipts/:id` should include: provider name, service date, service description, amount, and provider NPI/tax ID. NPI integration is Phase 2.
- [ ] **IIAS compliance** (optional, for HSA debit card auto-authorization) — Full IIAS requires a product database tagging every SKU. For a service business like CareOS, manual claims are the practical path. Not required for credit card + manual reimbursement flow.

---

## Running Tests

```bash
# All tests
npm test

# Payment functional tests (18 tests)
npx vitest run src/server/modules/payment/payment.test.ts --reporter=verbose

# HIPAA + MCC 8099 compliance tests (19 tests)
npx vitest run src/server/modules/payment/payment-compliance.test.ts --reporter=verbose

# Type check
npm run typecheck

# Lint + format check
npm run lint -- --max-warnings=0
npm run format:check
```

### Test Stripe webhooks locally

```bash
# Trigger a successful payment (opens Stripe CLI listener first)
~/bin/stripe trigger payment_intent.succeeded \
  --api-key sk_test_YOUR_STRIPE_TEST_KEY_HERE

# Trigger a failed payment
~/bin/stripe trigger payment_intent.payment_failed \
  --api-key sk_test_YOUR_STRIPE_TEST_KEY_HERE
```

### Stripe test card numbers

| Card | Behavior |
|------|----------|
| `4242 4242 4242 4242` | Always succeeds |
| `4000 0000 0000 0002` | Always declined |
| `4000 0025 0000 3155` | Requires 3D Secure |
| `4000 0000 0000 9995` | Insufficient funds |

Use any future expiry (e.g. `12/34`), any 3-digit CVC, any ZIP.
