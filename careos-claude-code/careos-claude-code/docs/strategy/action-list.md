# co-op.care — What to Do Next

**Generated:** March 10, 2026
**Status:** LCA filed. PostgreSQL schema done. Bylaws drafted. All handoff docs ready.

---

## RESOLVED (This Session)

| Issue | Resolution |
|-------|-----------|
| Blueprint citations uncited | ✅ PHI/BLS 2024 citations applied to operating blueprint + citation reference created (`docs/research/citation-reference-PHI-BLS-2024.md`) |
| Armilla AI still active? | ✅ Confirmed: Armilla Guaranteed + Armilla Insured (Lloyd's), up to $25M coverage, launched April 2025 |
| Beazley Virtual Care current? | ⚠️ Product exists but Marc Martin contact needs re-confirmation — email him this week |
| Snapdragon positioning | ✅ Clinical middleware one-pager created (`docs/co-op-care-clinical-middleware-one-pager.md`) — not hardware, co-op.care is the interpretation layer |
| Bylaws gaps (5 flags) | ✅ User confirmed all 5 addressed. Ready for Jason Wiener final review |
| OEDIT narrative citations | ✅ Citation reference with exact PHI/BLS figures + sample paragraph for OEDIT grant narrative |
| "59% public assistance" (if used anywhere) | ✅ Corrected → **49%** (PHI 2024). Confirm no documents use the old 59% figure |
| Outer folder out of sync | ✅ All new files copied: bylaws, middleware one-pager, research folder, updated blueprint |

---

## THIS WEEK (March 10-14)

### Blaine — Founder Actions (no code needed)

| # | Action | Why | Time |
|---|--------|-----|------|
| 1 | **Email Jason Wiener** — send `co-op-care-bylaws-and-subchapter-t.md` for final review | Bylaws are the legal foundation. Can't proceed with EIN without them. Also ask about tokenized patronage under LCA + Subchapter T → SEC risk question. | 30 min |
| 2 | **Apply for EIN** — IRS Form SS-4 online (irs.gov) for "co-op.care Limited Cooperative Association" | Required for bank account, NPI, payroll, everything | 15 min |
| 3 | **Apply for NPI** — NPPES online (cms.gov) after EIN received | Required for CMS billing, ACCESS Model, LMN signing | 15 min |
| 4 | **Apply for CO State Tax ID** — Colorado Department of Revenue | Required for CO Employee Ownership Tax Credit + business operations | 15 min |
| 5 | **Email Marc Martin (Beazley)** — marc.martin@beazley.com, confirm Virtual Care policy availability for cooperative care + AI liability module | Blueprint §12 depends on this. Get written confirmation or schedule call. | 15 min |
| 6 | **Submit CO Employee Ownership Tax Credit application** — up to $40K (via OEDIT) | This is free capital. LCA formation already qualifies. Apply immediately. | 1 hr |
| 7 | **Send Jacob his handoff package** — link to the outer `careos-claude-code/` folder | He needs: START-HERE.md → 90-day plan → handoff docs → schema.sql | 10 min |

### Jacob — Technical (After Receiving Package)

| # | Action | Deliverable |
|---|--------|------------|
| 8 | Read START-HERE.md → JACOB-90-DAY-PLAN.md → schema.sql | Understanding of full build scope |
| 9 | Set up GitHub repo + push initial commit | Version control established |
| 10 | Set up local PostgreSQL 16 + PostGIS (Docker or native) | Dev environment ready |
| 11 | Begin Task #1-3 from 90-day plan: PostgreSQL connection pool, Redis client, Fastify app factory | Foundation for all endpoints |

---

## THIS MONTH (March 2026)

| # | Action | Owner | Dependencies |
|---|--------|-------|-------------|
| 12 | **CDPHE Class B license application** — Letter of Intent | Blaine | EIN required |
| 13 | **Josh Emdur agreement finalized** — compensation, NPI usage, Medical Director scope | Blaine | Bylaws finalized |
| 14 | **Jason Wiener review complete** — bylaws adopted, board resolution signed | Blaine + Jason | Bylaws sent (#1 above) |
| 15 | **GitHub repo created** — `co-op-care/careos` or similar | Jacob or Blaine | GitHub account |
| 16 | **Railway deployment configured** — PostgreSQL + Redis + Fastify on Railway Pro ($20/mo) | Jacob | GitHub repo |
| 17 | **Auth module live** (Tasks #4-9 from 90-day plan) — JWT RS256, login/register, role guards | Jacob | PostgreSQL running |
| 18 | **Assessment engine live** (Tasks #10-16) — CII/CRI submit, MD review workflow | Jacob | Auth module |
| 19 | **First CII assessments conducted** — $150-300 each, supervised by Dr. Emdur | Blaine + Josh | Assessment engine OR paper-based |
| 20 | **TRU PACE outreach** — send clinical middleware one-pager to contact | Blaine | One-pager done ✅ |
| 21 | **BCH conversation** — 30 min listening with Grant Besser, lead with Armilla/Beazley risk shields | Blaine | Armilla confirmed ✅ |

---

## NEXT 90 DAYS (March — June 2026)

| Month | Blaine Focus | Jacob Focus | Revenue Target |
|-------|-------------|-------------|---------------|
| **March** | LCA formation, EIN/NPI, Jason Wiener, CDPHE LOI, Josh agreement, first assessments | Auth + assessment engine (Tasks #1-16) | $0 (formation) |
| **April** | First 3-5 Care Navigator interviews, BVSD employer pilot conversation, BCH conversation | Family module + Stripe membership (Tasks #17-22) | $450-900 (3-6 assessments) |
| **May** | Founding caregiver cohort (5 people), CO Tax Credit funds arrive, Aidbox dev license | Time Bank core (Tasks #23-29) | $1,500-3,000 (10-20 assessments) |
| **June** | CDPHE license expected (~Month 5-6), first companion care families, CMS ACCESS research | Community endpoints + notifications + CaptureTripleOutput (Tasks #30-40) | $3,000-6,000 (assessments + first care hours) |

---

## DEFERRED (Track but Don't Act)

| Item | When | Trigger |
|------|------|---------|
| Aidbox production license ($1,900/mo) | Month 6+ | When handling real PHI |
| Railway HIPAA BAA ($1,000/mo) | Month 6+ | When handling real PHI |
| CMS ACCESS Cohort 2 application | Research now, apply ~Oct 2026 | Jan 2027 cohort |
| Class A license (skilled/medical care) | Year 2+ | After companion care proven |
| Snapdragon Wear Elite evaluation | Month 6+ | When devices ship |
| Web3/DAO governance (Snapshot, Gnosis Safe) | Month 9-12 | After Jason Wiener clears SEC question |
| OEDIT grant application | Q4 2026 | Operating history required |
| National federation expansion | Year 2+ | After Boulder model proven |

---

## DOCUMENTS NOW COMPLETE

| Document | Location | Status |
|----------|----------|--------|
| Operating Blueprint | `docs/co-op-care-complete-operating-blueprint.md` | ✅ Citations fixed |
| LCA Bylaws + Subchapter T | `docs/co-op-care-bylaws-and-subchapter-t.md` | ✅ Ready for Jason Wiener |
| Clinical Middleware One-Pager | `docs/co-op-care-clinical-middleware-one-pager.md` | ✅ Ready for TRU PACE |
| 90-Day Approach C | `docs/co-op-care-90-day-approach-c.md` | ✅ Current |
| Jacob's 90-Day Plan | `docs/JACOB-90-DAY-PLAN.md` | ✅ PostgreSQL, 40 tasks |
| Backend Handoff v1 | `docs/JACOB-BACKEND-HANDOFF.md` | ✅ 7 endpoints, PostgreSQL |
| Backend Handoff v2 | `docs/JACOB-BACKEND-HANDOFF-v2.md` | ✅ Architecture, CaptureTripleOutput |
| PostgreSQL Schema | `src/server/database/schema.sql` | ✅ 15 tables + 4 relations |
| Citation Reference | `docs/research/citation-reference-PHI-BLS-2024.md` | ✅ PHI/BLS 2024 verified |
| Snapdragon Analysis | `docs/research/snapdragon-wear-elite-elder-care.md` | ✅ Integration notes |
| Care Navigator Job Posting | `docs/Care-Navigator-Job-Posting.md` | ✅ $25-28/hr + equity |
| Aidbox FHIR Spec | `docs/HEALTH-SAMURAI-ACP-SPEC.md` | ✅ For Pavel |
| START-HERE.md | Outer folder | ✅ Updated with all new docs |

---

## THE SINGLE MOST IMPORTANT THING

**Email Jason Wiener the bylaws today.** Everything else — EIN, NPI, CDPHE, payroll, hiring — is blocked until the legal foundation is reviewed and adopted. The bylaws are clean. The 5 gaps were addressed. Send them now and ask for a 1-week turnaround.

Second priority: **Send Jacob his package.** He can start building while legal proceeds in parallel.
