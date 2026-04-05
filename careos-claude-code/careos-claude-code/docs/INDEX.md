# co-op.care — Document Index

**Last synced:** March 15, 2026
**Total:** 348 files across 14 folders

---

## Quick Access

| Need | Go to |
|------|-------|
| Build CareOS | `build/` — Architecture, PRD, Product Bible, HIPAA |
| Jacob's work | `jacob/` — Briefing, backend wiring, handoff docs |
| Josh clinical docs | `clinical/josh-emdur/` — Agreements, CMS enrollment, BCH pilot |
| Pitch someone | `pitch-decks/` — All deck versions (CareGoals → CaresCircle → co-op.care) |
| Send a one-pager | `business/one-pagers/` — Employer, health system, investor, BCH |
| Financial model | `business/financial/` — FCC model, revenue architecture, stress test |
| BCH meeting prep | `outreach/BCH-CONVERSATION-PREP.md` + `outreach/bch_partnership_brief.html` |
| Gemini gem context | `gemini-gems/` — All 10 chapters (md + pdf) |
| Research papers | `research/` — AARP, ARK Invest, Stanford, competitive analysis |

---

## Folder Structure

```
docs/
├── build/              CareOS technical docs (Architecture, PRD, HIPAA, Blitzy prompts)
│   └── plans/          Design session docs (March 2026)
├── jacob/              Everything Jacob Pielke needs for backend wiring
├── clinical/           Josh Emdur docs, Omaha/FHIR crosswalk, robotics roadmap
│   └── josh-emdur/     Clinical director agreement, CMS enrollment, compensation
│   └── robots-roadmap/ Physical AI / elder care robotics (2028+)
├── business/           SOWs, agreements, business docs
│   ├── financial/      Revenue model, financial stress test, FHV
│   ├── legal/          Co-founder agreement, BAA template, bylaws
│   └── one-pagers/     Employer, health system, investor, BCH one-pagers
├── strategy/           Operating blueprints, CMS ACCESS, competitive positioning
├── outreach/           Email drafts, BCH prep, speaker outreach, pipeline
├── pitch-decks/        All pitch deck versions (.pptx, .pdf, .key)
├── research/           Academic papers, market reports, competitive analysis
├── gemini-gems/        Gemini gem context docs (10 chapters, md + pdf)
├── media/              Podcasts, images, video (gitignored — local only)
│   └── podcast-episodes/  NotebookLM podcast episodes (1-16)
├── logo/               Logo files (gitignored — local only)
├── resumes/            Blaine's resumes and job search handoff
└── legacy/             Old codebase (co-op-care-suite), archived strategy docs, JSX prototypes
```

---

## Key Documents

### For Building
- `build/ARCHITECTURE.md` — Full module specs, data models, API endpoints
- `build/PRD.md` — Product requirements document
- `build/PRODUCT-BIBLE.md` — Product vision and principles
- `build/HIPAA-COMPLIANCE.md` — HIPAA compliance guide
- `build/plans/` — Design session docs from March 2026 build sprint

### For Jacob
- `jacob/JACOB-SAGE-BACKEND-WIRING.md` — **START HERE** — 6 prioritized tasks for connecting Sage frontend to PostgreSQL/Aidbox
- `jacob/JACOB-BRIEFING.md` — Full context briefing
- `jacob/JACOB-BACKEND-HANDOFF.md` — Original backend handoff
- `jacob/JACOB-90-DAY-PLAN.md` — Sprint plan

### For Josh / Clinical
- `clinical/josh-emdur/clinical-director-agreement.docx` — Clinical director terms
- `clinical/josh-emdur/compensation-term-sheet.docx` — Compensation structure
- `clinical/josh-emdur/cms-855b-enrollment-prep.docx` — Medicare enrollment
- `clinical/josh-emdur/bch-discharge-pilot-guide.docx` — BCH pilot protocol
- `clinical/omaha-fhir-crosswalk.md` — Omaha System → FHIR R4 mapping (core IP)
- `clinical/CLINICAL-TAXONOMY-DEEP-DIVE.md` — Full Omaha taxonomy

### For Fundraising
- `pitch-decks/coop_care_investor_deck_20260228223437.pptx` — Latest investor deck
- `pitch-decks/coop-care-investor-deck.pptx` — Newer investor version
- `business/one-pagers/coop-care-investor-one-pager.docx` — Investor one-pager
- `business/financial/co-op-care-revenue-architecture.docx` — Revenue model
- `strategy/coopcare_investor_doc.html` — Full investor document

### For BCH Partnership
- `outreach/BCH-CONVERSATION-PREP.md` — Meeting prep (Monday 3/16)
- `outreach/bch_partnership_brief.html` — Partnership brief
- `business/one-pagers/coop-care-bch-intro.docx` — BCH intro doc
- `clinical/josh-emdur/bch-discharge-pilot-guide.docx` — Pilot protocol
