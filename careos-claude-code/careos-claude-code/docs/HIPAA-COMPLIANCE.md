# CareOS HIPAA Technical Safeguards Checklist

## Access Control (§164.312(a))

| Control | Status | Evidence |
|---------|--------|----------|
| Unique user identification | DONE | JWT `sub` claim = userId, `src/server/modules/auth/jwt.ts` |
| Emergency access procedure | TODO | Break-glass admin override not yet implemented |
| Automatic logoff | DONE | JWT access tokens expire in 15 minutes, `src/server/config/settings.ts:46` |
| Encryption at rest | IN PROGRESS — BAA pending | PostgreSQL 16 encrypted storage (Railway managed), Redis ephemeral only (no PHI cached). Technical control confirmed; HIPAA legitimisation requires Railway BAA — see Remaining Items. |
| Role-based access control | DONE | 7 roles, PHI access flags, endpoint ACLs, `src/server/config/roles.ts` |
| 2FA for sensitive roles | DONE | medical_director + admin require TOTP, `src/shared/constants/business-rules.ts:165` |

## Audit Controls (§164.312(b))

| Control | Status | Evidence |
|---------|--------|----------|
| PHI access audit logging | DONE | `src/server/middleware/audit.middleware.ts` — logs all /families, /assessments, /fhir requests |
| Audit log fields | DONE | method, url, ip, userId, timestamp (no PHI in log) |
| Log redaction | DONE | Pino redacts password, ssn, dateOfBirth, email, phone, firstName, lastName — `src/server/app.ts:36-48` |
| FHIR AuditEvent | TODO | Aidbox AuditEvent creation on clinical data access (Phase 2) |

## Integrity (§164.312(c))

| Control | Status | Evidence |
|---------|--------|----------|
| PHI integrity verification | DONE | PostgreSQL ACID transactions for clinical data writes |
| Error handling (no PHI leak) | DONE | `src/server/middleware/error-handler.middleware.ts` — generic errors to client |
| Input validation | DONE | Zod schemas on all endpoints — `src/server/modules/*/schemas.ts` |

## Person or Entity Authentication (§164.312(d))

| Control | Status | Evidence |
|---------|--------|----------|
| JWT RS256 authentication | DONE | `src/server/modules/auth/jwt.ts` — asymmetric signing |
| HttpOnly secure cookies | DONE | Access token in HttpOnly cookie, `src/server/middleware/auth.middleware.ts` |
| Token refresh rotation | DONE | Refresh tokens with JTI tracking, rotation on use |
| Background check integration | TODO | Checkr API integration placeholder in `.env.example` |

## Transmission Security (§164.312(e))

| Control | Status | Evidence |
|---------|--------|----------|
| TLS in transit | DONE | HTTPS enforced via reverse proxy (Dockerfile exposes 3001, TLS at load balancer) |
| WebSocket security | DONE | WSS with JWT auth on connection, `src/server/ws/handler.ts` |
| CORS restriction | DONE | Origins from env var, no wildcard, `src/server/config/settings.ts:22` |
| Security headers | DONE | Helmet middleware with CSP, `src/server/app.ts:59-61` |

## Application Security

| Control | Status | Evidence |
|---------|--------|----------|
| Rate limiting (auth) | DONE | 10 req/min on auth endpoints, `src/server/middleware/rate-limit.middleware.ts` |
| Rate limiting (API) | DONE | 100 req/min global, 20-30 on business endpoints |
| Service worker PHI bypass | DONE | /api/ and /fhir/ routes = NetworkOnly, `vite.config.ts:63-71` |
| No PHI in localStorage | DONE | Verified by `scripts/hipaa-audit.ts` |
| No PHI in URL params | DONE | POST bodies for all PHI operations, GET only for non-PHI |
| No secrets in source | DONE | Verified by `scripts/hipaa-audit.ts` |
| Docker non-root user | DONE | `careos` user in `Dockerfile:27` |
| No secrets in image | DONE | All config via env vars at runtime, `Dockerfile:51-52` |

## Automated Verification

Run the HIPAA audit script to verify compliance:

```bash
npx tsx scripts/hipaa-audit.ts
```

This checks 10 categories automatically:
1. No PHI in log statements
2. No PHI in browser storage
3. JWT expiry ≤ 15 minutes
4. Audit logging on PHI routes
5. Log redaction configured
6. Service worker PHI cache bypass
7. Error handler doesn't leak internals
8. 2FA for sensitive roles
9. No hardcoded secrets
10. CORS properly restricted

## Remaining Items (Phase 2)

- [ ] FHIR AuditEvent on every clinical data read/write
- [ ] Break-glass emergency access procedure
- [ ] Checkr background check integration
- [ ] BAA (Business Associate Agreement) with Railway (PostgreSQL host), Aidbox, Stripe, Twilio, SendGrid
- [ ] Penetration test report
- [ ] Incident response plan documentation
- [ ] Annual risk assessment schedule
