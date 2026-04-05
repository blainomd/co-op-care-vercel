# /auth — co-op.care / CareOS Authentication Flows

Build, modify, or debug authentication for the co-op.care family app powered by CareOS.

## Architecture

- **Frontend:** Vite + React 19 + Zustand + React Query
- **Backend:** Fastify 5.2 + TypeScript
- **Auth:** RS256 JWT (jose library), bcrypt password hashing
- **Database:** PostgreSQL 16 + Redis 7 (sessions/jobs)
- **Tokens:** Access (15min) + Refresh (7 days), HttpOnly cookies
- **2FA:** Required for `medical_director` and `admin` roles
- **Design:** Warm sage/cream theme, no emojis, custom SVG icons only

## User Roles (7-role RBAC)

```typescript
type UserRole =
  | 'family_admin'      // Alpha Daughter / primary family caregiver — manages everything
  | 'family_member'     // Other family (read access, limited actions)
  | 'care_recipient'    // Aging adult receiving care
  | 'care_neighbor'     // W-2 caregiver worker ($25-28/hr + equity)
  | 'medical_director'  // Josh Emdur DO — signs LMNs, clinical oversight (2FA required)
  | 'care_coordinator'  // Operations staff — scheduling, matching
  | 'admin';            // System admin (2FA required)
```

## Sign Up Flow — Family (Primary Persona)

The primary customer is the "Alpha Daughter" — the family caregiver managing care for an aging parent.

1. **Landing:** co-op.care homepage -> "What brings you here?" -> "I'm caring for a loved one"
2. **Step 1 — About You:** First name, last name, email, phone, password, relationship to care recipient (daughter/son/spouse/other)
3. **Step 2 — About Your Loved One:** First name, age, city/zip, primary care needs (select from Omaha System domains: Environmental, Psychosocial, Physiological, Health-Related Behaviors)
4. **Step 3 — Quick CII Assessment:** 5-question Caregiver Intensity Index mini-assessment (burnout level, hours/week, tasks performed, support level, stress rating)
5. **Step 4 — Plan Selection:**
   - Free: Assessment only (lead gen)
   - $59/mo: Full platform (CareGoals, vault, LMNs, CareScore, matching)
   - Custom: Companion care hours ($28-45/hr added)
6. **Step 5 — Stripe Checkout** (if paid plan): `POST /api/payments/checkout`
7. **Step 6 — Account Created:** `POST /api/auth/register` -> bcrypt hash -> insert user -> generate RS256 JWT pair -> set HttpOnly cookies -> redirect to onboarding
8. **Step 7 — Onboarding:** CareGoals first conversation with Sage AI (tap-to-select modules, not forms)

### API: `POST /api/auth/register`
```json
{
  "email": "string",
  "password": "string (min 12 chars)",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "role": "family_admin",
  "careRecipient": {
    "firstName": "string",
    "age": "number",
    "zip": "string",
    "primaryNeeds": ["string"]
  }
}
```

Response: `201` with `{ accessToken, refreshToken }` set as HttpOnly cookies.

## Sign Up Flow — Care Neighbor (Worker)

1. **Entry:** "I want to give care" -> `/apply`
2. **Step 1:** Name, email, phone, password, zip code
3. **Step 2:** Experience (years, certifications, specialties), availability (days/hours), transportation
4. **Step 3:** Background check consent (Checkr integration) -> `POST /api/workers/apply`
5. **Step 4:** Account created with `role: 'care_neighbor'`, status `pending_verification`
6. **Step 5:** Background check clears -> status `active`, can accept assignments
7. Worker sees: assigned families, schedule, care plans, Omaha System task checklists, hours/equity tracking

## Sign In Flow

```
POST /api/auth/login { email, password }
  -> bcrypt.compare()
  -> if role requires 2FA -> return { requires2FA: true, tempToken }
  -> if no 2FA needed -> generate JWT pair -> set cookies -> return user profile
  -> redirect to /home (family) or /assignments (worker)
```

### 2FA Flow (medical_director, admin)
```
POST /api/auth/verify-2fa { tempToken, code }
  -> verify TOTP code
  -> generate full JWT with twoFactorVerified: true
  -> set cookies -> return user profile
```

## Password Reset

```
POST /api/auth/forgot-password { email }
  -> generate reset token -> store in Redis (TTL 1 hour)
  -> send email via SendGrid with reset link

POST /api/auth/reset-password { token, newPassword }
  -> validate token from Redis -> bcrypt hash -> update user -> delete token
  -> auto login -> redirect /home
```

## Session Management

- **Access Token:** RS256 JWT, 15-minute expiry, HttpOnly cookie
- **Refresh Token:** Opaque token, 7-day expiry, HttpOnly cookie, stored in Redis
- **Refresh endpoint:** `POST /api/auth/refresh` -> verify refresh token -> issue new access token
- **Logout:** `POST /api/auth/logout` -> clear cookies, delete refresh token from Redis
- **Middleware:** `requireAuth` hook on all `/api/*` routes except auth endpoints

## Key Auth Files

| File | Purpose |
|------|---------|
| `src/server/modules/auth/jwt.ts` | RS256 sign/verify with jose |
| `src/server/modules/auth/auth.service.ts` | Register, login, refresh, reset logic |
| `src/server/modules/auth/auth.routes.ts` | Fastify route definitions |
| `src/server/middleware/auth.middleware.ts` | requireAuth, requireRole, require2FA |
| `src/server/middleware/rate-limit.middleware.ts` | Login attempt limiting |
| `src/server/middleware/audit.middleware.ts` | HIPAA audit logging |
| `src/server/config/roles.ts` | ROLE_PERMISSIONS map |
| `src/client/stores/auth.store.ts` | Zustand auth state (user, role, isAuthenticated) |
| `src/client/pages/Login.tsx` | Login form component |
| `src/client/pages/Register.tsx` | Multi-step registration |

## Invite Flow (Family Members)

Family admin invites other family members:
```
POST /api/auth/invite { email, role: 'family_member', familyId }
  -> generate invite token -> send email
  -> recipient clicks link -> /join?token=xxx -> simplified signup (name + password only)
  -> auto-linked to family unit
```

## Rules

- Passwords minimum 12 characters (NIST 800-63B)
- Never return different errors for "user not found" vs "wrong password"
- All auth events logged to `audit_log` table (HIPAA requirement)
- PHI boundary: auth tokens carry userId + roles only, never clinical data
- Rate limit: 5 login attempts per 15 minutes per IP
- Redis session store enables instant revocation
- Care Neighbor accounts require background check before activation
- Warm sage/cream theme on all auth pages, custom SVG icons, zero emojis
