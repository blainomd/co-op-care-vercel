# CareOS — Client Handoff Document

**Product**: CareOS / co-op.care
**Founder**: Blaine Warkentine, MD — blaine@co-op.care
**Date**: March 2026
**Purpose**: Everything you need to understand, run, and continue building this app.

---

## What This App Does

CareOS is a web app (also works on your phone like a regular app) for a worker-owned home care cooperative. It connects:

- **Families** — people arranging care for an aging parent or loved one
- **Professional Caregivers** — worker-owners who deliver care and earn equity
- **Community Volunteers** — neighbors who help with errands, rides, meals, and earn Time Bank hours
- **Wellness Providers** — local health and wellness businesses

Members pay **$100/year** and get 40 hours of Time Bank credit. They can buy more at **$15/hour** or subscribe to a **$59/month Comfort Card**.

---

## Phase 1 Roadmap — What Was Built (March 10–24, 2026)

This is a summary of the 11-day sprint. Items marked **Done** are complete. Items marked **Blaine** need action from you.

| Day | Work | Status |
|---|---|---|
| Day 1 — Mar 10 | Roadmap, project review, account setup | Done |
| Day 2 — Mar 11 | CI/CD pipeline, branch protection, automated tests, auto-deploy | Done |
| Day 3 — Mar 12 | Railway cloud setup, environment variables, custom domain, SSL, database | Done |
| Day 4 — Mar 13 | Login system (auth), 7 user roles, role-based access to routes | Done |
| Day 5 — Mar 17 | Audit logging (HIPAA), database migration strategy, security hardening | Done |
| Day 6 — Mar 17 | Stripe account config, payment endpoints, webhook, receipt generation | Done |
| Day 7 — Mar 19 | Stripe hardening — signature checks, end-to-end payment tests | Done |
| Day 8 — Mar 20 | Full integration test suite against production | Done |
| Day 9 — Mar 21 | Bug fixes, handoff documentation | In progress |
| Day 10 — Mar 24 | Final smoke test, handoff prep | Upcoming |
| Day 11 — Mar 25 | Walk Blaine through everything, confirm independence | Upcoming |

### Still needs Blaine's action

- **Branch protection on GitHub** — must be set by repo owner (you)
- **Railway HIPAA BAA** — legal agreement with Railway; email them at hipaa@railway.app
- **Stripe BAA** — legal agreement with Stripe for healthcare; complete in Stripe dashboard → Settings → Compliance
- **Stripe: identity verification + bank account for payouts** — paused; needed before paying worker-owners
- **Stripe: fix support phone number placeholder** — update in Stripe account settings
- **CDPHE license number** — needed for Stripe MCC 8099 (healthcare merchant category) application
- **Josh Emdur's NPI number** — needed for Stripe healthcare provider verification (it is: 1649218389)

---

## Getting the Code onto Your Computer

> **What is "the code"?** The app is stored as files on GitHub (a website that holds code). To work on it, you download a copy to your computer. This is called "cloning."

### Step 1: Install the tools you need (one time only)

Install these in order. Click each link, download, and run the installer — accept all defaults.

1. **Git** — downloads code from GitHub
   - Go to [git-scm.com](https://git-scm.com) → Download → install, accept all defaults

2. **Node.js 22** — the engine that runs the app *(must be version 22 — not older)*
   - Go to [nodejs.org](https://nodejs.org) → click **"22 LTS"** → install

3. **Docker Desktop** — runs the database and supporting services on your machine
   - Go to [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) → Download → install
   - After installing, **open Docker Desktop** and leave it running in the background (it shows a whale icon in your menu bar)

4. **Claude Code** — the AI assistant that helps you make changes without knowing how to code
   - Open Terminal (press Cmd+Space, type "Terminal", press Enter)
   - Paste this and press Enter:
   ```
   npm install -g @anthropic-ai/claude-code
   ```

### Step 2: Download the code

In Terminal, type these one at a time, pressing Enter after each:

```
cd ~/Desktop
git clone https://github.com/YOUR-ORG/care-os.git
cd care-os/careos-claude-code/careos-claude-code
```

> Replace `YOUR-ORG` with the actual GitHub org name — ask your developer for the exact URL.

### Step 3: Run the one-time setup script

This single command installs everything the app needs, starts the database, and gets you ready to run:

```
npm run setup
```

It takes 2–5 minutes the first time. You'll see it print progress. When it's done, it says **"CareOS dev environment ready!"**

> If it fails, make sure Docker Desktop is open and running (whale icon in menu bar).

### Step 4: Start the app

The app has two parts — a backend (the brains) and a frontend (what you see). You need **two Terminal windows** open at the same time.

**Terminal window 1 — start the backend:**
```
npm run dev:server
```

**Terminal window 2 — start the frontend:**
```
npm run dev
```

Now open your browser and go to **http://localhost:5173** — you should see the app.

> To open a second Terminal window: press Cmd+T (new tab) or Cmd+N (new window).

### Step 5: Set up your secret keys

The app needs keys to connect to Stripe, email, and SMS. These are stored in a file called `.env` that lives only on your computer (never shared).

The setup script already created this file. Open it in any text editor (TextEdit works):

```
open -e .env
```

Fill in the values for:
- `STRIPE_SECRET_KEY` — from [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API keys
- `STRIPE_WEBHOOK_SECRET` — from Stripe → Developers → Webhooks → signing secret
- `SENDGRID_API_KEY` — from [app.sendgrid.com](https://app.sendgrid.com)
- `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` — from [console.twilio.com](https://console.twilio.com)

The JWT keys (for login security) need to be generated once. Paste this into Terminal:
```
openssl genrsa -out private.pem 2048 && openssl rsa -in private.pem -pubout -out public.pem
```
Then copy the contents of `private.pem` into `JWT_PRIVATE_KEY` and `public.pem` into `JWT_PUBLIC_KEY` in your `.env` file.

After editing `.env`, restart the backend (stop it with Ctrl+C, then run `npm run dev:server` again).

---

## Making Changes with Claude Code

> You don't need to know how to code. Claude Code is an AI that reads your codebase and makes changes for you. Think of it like texting instructions to a very smart developer.

### Starting a session

Open Terminal, navigate to the project folder, and type:

```
claude
```

That's it. Claude opens and reads your entire codebase. You can then type requests in plain English, like:

- *"Add a help page that explains how Time Bank hours work"*
- *"The login button isn't showing on mobile. Fix it."*
- *"Show me what the Stripe webhook does"*

### Saving your changes (committing)

After Claude makes changes, you save them like this:

```
git add .
git commit -m "describe what you changed"
```

Example:
```
git commit -m "added FAQ page for Time Bank"
```

### Publishing changes (pushing)

To push your changes to the live site:

```
git push
```

If you're on the `dev` branch, this updates the test environment. If you're on the `main` branch, it updates the live site at co-op.care. **Always test on `dev` first.**

### Switching between branches

Think of branches like parallel drafts of your document.

- `dev` — your working draft (safe to experiment)
- `main` — the live site (be careful)

To switch:
```
git checkout dev
```
or
```
git checkout main
```

---

## Infrastructure Overview

> "Infrastructure" = the pieces keeping the app running in the cloud.

| Piece | What it does | Where it lives |
|---|---|---|
| **App (web server)** | Runs all the logic, serves the website | Railway |
| **Main Database (PostgreSQL)** | Stores users, families, Time Bank records, payments | Railway managed |
| **Clinical Database (Aidbox)** | Stores health records in a medical standard format | Deferred — not active yet |
| **Cache (Redis)** | Short-term memory for login sessions and rate limits | Railway managed — recommended to remove soon |
| **File Storage** | Not needed yet | N/A |

### Railway (your cloud host)

Railway is where the app lives on the internet. Think of it like renting a computer in a data center that never turns off.

Two environments:

- **Dev** — your sandbox. Deploys automatically when you push to the `dev` branch.
- **Production** — the real live site at co-op.care. Deploys automatically when you push to `main`.

You never have to manually restart or redeploy. Push code → Railway rebuilds → site updates.

**Railway dashboard**: railway.app — log in to see logs, environment variables, and usage.

### Custom Domain

`co-op.care` and `www.co-op.care` are configured in Squarespace DNS, pointing to Railway via CNAME records. SSL (the padlock in your browser) is managed automatically by Railway.

---

## Usage Overview

### How users log in

1. User creates an account (email + password)
2. App gives them a login token that expires in 15 minutes (for security)
3. A "refresh token" keeps them logged in for up to 7 days without re-entering their password
4. Doctors and admins must also enter a one-time code from an authenticator app (2FA)

### The 7 user roles

Each role sees a different version of the app:

| Role | Who |
|---|---|
| Conductor | Family member arranging care (the primary user) |
| Worker Owner | Professional caregiver |
| Time Bank Member | Community volunteer |
| Medical Director | Doctor (Josh Emdur) who reviews care letters |
| Admin | Internal co-op staff |
| Employer HR | Company offering CareOS as an employee benefit |
| Wellness Provider | Local wellness business |

### How care flows

1. Family enrolls → pays $100/year → gets 40 hours credit
2. Family posts a task (e.g., "need rides to appointments")
3. System matches a volunteer or worker by location and skill
4. Care happens → hours logged → Time Bank updated automatically
5. If medical need identified → app generates a Letter of Medical Necessity for Dr. Emdur to review
6. All payments go through Stripe — no card info ever touches our servers

---

## HIPAA Guidelines

HIPAA is the US law that protects health information. This app handles health data, so these rules are non-negotiable.

### What's already built and working

- **No health data in logs** — names, emails, dates of birth are automatically hidden from all server logs
- **No health data stored in the browser** — the app never saves medical info to the phone or browser
- **Encrypted connections** — all data travels over HTTPS (locked padlock in browser)
- **Audit trail** — every time someone views a health record, it logs who, when, and which record (not the content)
- **Short login sessions** — 15-minute token expiry limits damage if a token is stolen
- **2FA for doctors and admins** — extra verification required for sensitive roles
- **No medical data in Redis** — the cache only holds session tokens, never health information

### What you must do before accepting real patient data

> **Do not store real patient information until these are done.**

- **Sign a BAA with Railway** — a legal contract that makes Railway responsible for protecting health data on their servers. Email hipaa@railway.app.
- **Sign a BAA with Stripe** — go to Stripe dashboard → Settings → Compliance → Business Associate Agreement.
- **Hire a penetration tester** — a security firm that tries to break in and gives you a report. Budget $3,000–$8,000.
- **Write an incident response plan** — a one-page document: who to call, what to do, and how to notify users if there's ever a data breach.
- **Annual risk assessment** — schedule a yearly security review (can be done internally with a checklist).

---

## Recommendations

### 1. Remove Redis in the short term

Redis is a separate service that stores login sessions and handles rate limiting (blocking bots). It works fine, but it adds cost and complexity you don't need yet.

**Action**: After launch, move session storage into the main PostgreSQL database. This simplifies your infrastructure from 3 services to 2. Your developer can do this in a day.

### 2. No Firebase or other third-party login services

The app does not use Firebase, Auth0, Okta, or any external login provider. Login is built into the app itself. This is intentional — it keeps costs low and means you don't depend on any other company's uptime.

Do not add these in the future without a clear reason.

### 3. No third-party analytics or tracking

No Google Analytics, Mixpanel, or similar tools are installed. People using a health app should not have their behavior tracked by advertising companies. Keep it this way.

### 4. Defer Aidbox (clinical database)

Aidbox stores health records in a medical standard format (FHIR). It requires a separate license and hosting. The main features don't need it yet — defer until you're actively generating Letters of Medical Necessity at scale.

### 5. Migrate from Docker to local Postgres (post-Day 10)

Currently dev uses Docker containers. For simpler local development, migrate to a direct local PostgreSQL install. Lower friction for whoever works on the code next.

---

## Stripe Setup

Stripe handles all money. No card numbers ever touch our servers — Stripe stores them securely.

### What Stripe charges for

| Product | Price |
|---|---|
| Annual membership | $100/year |
| Extra Time Bank hours | $15/hour |
| Comfort Card subscription | $59/month |

### What's already done

- Stripe account configured with MCC 8099 (healthcare merchant category — required for HSA/FSA)
- Payment endpoints built: membership, credit purchase, webhook handler, receipt generation
- Webhook signature validation in place (prevents fake payment events)
- Full end-to-end payment flow tested in test mode

### What still needs to be done (Blaine)

1. **Identity verification** — go to Stripe dashboard → Settings → Business verification and complete the process
2. **Bank account for payouts** — add your business bank account so Stripe can send you money
3. **Fix support phone number** — there's a placeholder in Stripe account settings; update it with the real co-op support number
4. **Switch to live mode** when ready to charge real members — flip the toggle in Stripe dashboard → toggle "Test mode" off

### Keys to set in Railway

Go to Railway dashboard → your project → Variables tab, and add:

- `STRIPE_SECRET_KEY` — from Stripe dashboard → Developers → API keys → Secret key
- `STRIPE_WEBHOOK_SECRET` — from Stripe dashboard → Developers → Webhooks → your webhook → Signing secret

The webhook URL is already configured: `https://co-op.care/api/v1/payment/webhook`

---

## No Firebase or Other Third Parties

The app is intentionally self-contained. These services are **not used** and should **not be added** without a deliberate decision:

- Firebase — not used
- AWS, Google Cloud, Azure — not used (Railway handles everything)
- Auth0, Okta, Cognito — not used (login is built in)
- Google Analytics, Mixpanel, Segment — not used (no behavioral tracking)
- Intercom, Zendesk — not used
- Cloudinary, S3 — not used (no file uploads yet)

### Approved third-party services

| Service | Purpose | Status |
|---|---|---|
| Stripe | All payments | Active |
| Twilio | SMS text messages | Configured |
| SendGrid | Transactional email | Configured |
| Checkr | Background checks for caregivers | Future |
| Zoom | Telehealth video calls (via API only — no custom video) | Future |

---

## Next Steps

In priority order:

1. **Sign BAA with Railway** — email hipaa@railway.app — required before real patient data
2. **Sign BAA with Stripe** — Stripe dashboard → Settings → Compliance
3. **Complete Stripe verification** — identity + bank account for payouts
4. **Switch Stripe to live mode** and run one real end-to-end payment
5. **Remove Redis** — move sessions to PostgreSQL; your next developer can do this
6. **Defer Aidbox** — don't license or set it up until LMN workflows are actively in use
7. **Penetration test** — budget for an external security review before enrolling real members
8. **Write a one-page incident response plan** — who to call, what to do, how to notify users
9. **Set up uptime monitoring** — Better Uptime (free tier) sends you a text if the site goes down
10. **Onboard first real members** — use the `dev` environment to test with real people first, then promote to production

---

## Where to Find Things

| What you need | Where to look |
|---|---|
| Live site | https://co-op.care |
| Hosting & logs | railway.app → your project |
| Code repository | GitHub (you own it — log in to github.com) |
| Payment dashboard | dashboard.stripe.com |
| SMS dashboard | console.twilio.com |
| Email dashboard | app.sendgrid.com |
| All required environment variables | `.env.example` file in the project root |
| Detailed system architecture | `docs/ARCHITECTURE.md` |
| HIPAA security controls | `docs/HIPAA-COMPLIANCE.md` |
| Deployment steps | `docs/DEPLOYMENT.md` |
| Database change guide | `docs/MIGRATION.md` |

---

## Your First Claude Code Session (Quickstart)

Every time you sit down to work on the app, do this:

**1. Make sure Docker Desktop is open** (whale icon in menu bar — if not, open it)

**2. Open Terminal window 1 — start the backend:**
```
cd ~/Desktop/care-os/careos-claude-code/careos-claude-code
npm run dev:server
```

**3. Open Terminal window 2 — start the frontend:**
```
cd ~/Desktop/care-os/careos-claude-code/careos-claude-code
npm run dev
```

**4. Open Terminal window 3 — start Claude:**
```
cd ~/Desktop/care-os/careos-claude-code/careos-claude-code
claude
```

**5. Type what you want to change** in plain English:

- *"Add a help page that explains how Time Bank hours work"*
- *"The login button isn't showing on mobile. Fix it."*
- *"Show me what the Stripe webhook does"*
- *"Something is broken on the signup page — here's what I see: [describe it]"*

**6. Save and publish your changes:**

```
git add .
git commit -m "describe what you changed"
git push
```

Done. The live site at co-op.care updates automatically within 2–3 minutes.

> **Always test on `dev` branch first.** Only push to `main` when you're sure it works.

---

*For technical depth: `docs/ARCHITECTURE.md`. For deployment steps: `docs/DEPLOYMENT.md`. For security/HIPAA: `docs/HIPAA-COMPLIANCE.md`.*
