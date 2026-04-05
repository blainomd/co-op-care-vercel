# Job Search Session Handoff — March 14, 2026

## Who
Blaine Warkentine, MD — orthopedic surgeon (residency + fellowship, NOT board-certified) turned digital health entrepreneur. Boulder, CO. Phone: 484-684-5287. Emails: orthoblaino@gmail.com, blaine@co-op.care. LinkedIn: linkedin.com/in/blainewarkentine

## Current Roles
- **Founder, co-op.care** (Sep 2025–Present): CMS-aligned worker cooperative for aging care. CareOS platform (PostgreSQL + Aidbox FHIR R4). Full Claude Code bootstrap package built (50+ files, 9,000+ lines).
- **Faculty Physician, Automate Clinic** (2025–Present): Managed network of specialist physicians providing clinical AI evaluation, safety testing, and training data development embedded in engineering workflows at healthcare AI companies. automate.clinic

## Career Highlights (for resume context)
- **BrainLAB** (2003–2009): Clinical Orthopaedic Director. Built orthopedic computer-assisted surgery vertical from zero to $250M revenue. 5 patents.
- **3 Strategic Exits**: InVivoLink → HCA Healthcare (CMO), Disior → Paragon 28 (5 months), PumpOne → Anytime Fitness (CMO 8+ years)
- **JointCoach** (2023–2025): CEO. Built clinical AI chatbot with generative LLMs, psychosocial screening, voice-agent workflows.
- **Education**: MD (Medical College of Wisconsin), BS Business (CU Boulder), Population Health Fellow (Jefferson), Sports Medicine Fellow (Long Beach Memorial), Ortho Residency (U Maryland Shock Trauma)
- **Tech**: CEOS (open-source AI-native EOS framework), CareOS architecture, Claude Code, FHIR R4, PostgreSQL, Redis, Fastify, React 19

## Documents Built This Session (21 total, all in /mnt/user-data/outputs/)

### Master Documents
- `Warkentine_Resume_Master.docx` — Best overall resume combining all variants
- `Warkentine_CV_Full.docx` — Complete CV, nothing cut (~5-6 pages)

### Hippocratic AI (8 roles, 16 documents)
| Role | Resume | Cover Letter |
|------|--------|-------------|
| Head of Academy | `Warkentine_Resume_HippocraticAI.docx` | `Warkentine_CoverLetter_HippocraticAI.docx` |
| CCO MedTech | `Warkentine_Resume_CCO_MedTech.docx` | `Warkentine_CoverLetter_CCO_MedTech.docx` |
| VP Customer Success | `Warkentine_Resume_VP_CustomerSuccess.docx` | `Warkentine_CoverLetter_VP_CustomerSuccess.docx` |
| Director Customer Success | `Warkentine_Resume_Director_CustomerSuccess.docx` | `Warkentine_CoverLetter_Director_CustomerSuccess.docx` |
| PM AI Agents | `Warkentine_Resume_PM_AIAgents.docx` | `Warkentine_CoverLetter_PM_AIAgents.docx` |
| Life Sciences Platform Lead | `Warkentine_Resume_LifeSci_PlatformLead.docx` | `Warkentine_CoverLetter_LifeSci_PlatformLead.docx` |
| Dir CS Payor | `Warkentine_Resume_Dir_CS_Payor.docx` | `Warkentine_CoverLetter_Dir_CS_Payor.docx` |
| CSE Payors Remote | `Warkentine_Resume_CSE_Payors_Remote.docx` | `Warkentine_CoverLetter_CSE_Payors_Remote.docx` |

### Covera Health — Chief Clinical Officer
- `Warkentine_Resume_Covera_CCO.docx`
- `Warkentine_CoverLetter_Covera_CCO.docx`
- **Note**: Honest gap flagged — Blaine is orthopedic surgeon, not radiologist. Cover letter opens with the gap, reframes BrainLAB as imaging-adjacent AI validation. Ends with "or another capacity" door-opener.

### BeOne Medicine — VP AI & Innovation
- `Warkentine_Resume_BeOne_VP_AI.docx`
- `Warkentine_CoverLetter_BeOne_VP_AI.docx`
- **Note**: Biggest stretch. Drug discovery / molecular modeling gap. Letter addressed to CTO Marcello Damiani (ex-Moderna). Strongest case on Pillar 3 (organizational enablement). Honest framing: "If the VP must architect CDAC predictions, I'm not it."

### Kuddo — Advisory Board
- `Warkentine_Resume_Kuddo_Advisory.docx`
- `Warkentine_Letter_Kuddo_Advisory.docx`
- **Note**: Advisory format (not full-time). Strong natural fit. "Fidelity as the new claims data" thesis = same as co-op.care's Omaha System quality tracking for VBC. Four-pillar letter of interest.

## Strategic Framing Per Target

### Hippocratic AI — Strategy
- BrainLAB is the universal proof point: "built a clinical academy from zero to $250M"
- Automate Clinic faculty role proves physician-in-the-loop AI evaluation credibility
- For Academy role: patent "Engagement and Education of Patients for Endoscopic Surgery" is literally a patent for clinical education
- Cover letters addressed to Rahul Agarwal (CCO, reporting line for most roles)
- All letters mention 5-day in-office Palo Alto commitment and 5-step application process
- PM AI Agents variant leads with JointCoach (not BrainLAB) since he built a clinical AI chatbot
- CSE Payors is the only remote role

### Resume Tailoring Approach
Each resume variant has:
1. Role-specific subtitle
2. Tailored executive summary
3. Custom 4-quadrant competency grid mapping to JD keywords
4. Reordered experience (lead with most relevant role)
5. Same standardized tail (exits, additional experience, education, patents, tech)
6. Automate Clinic as current role on all variants

### Key Differentiators Across All Applications
- MD who ships production software (not just advises)
- 5 patents in image-guided navigation (including education/engagement systems)
- 3 strategic exits = commercial credibility
- BrainLAB $250M = enterprise adoption at scale
- Automate Clinic = actively doing clinical AI evaluation work
- CMS payment model depth (ACCESS, GUIDE, PACE, LEAD/CARA)
- EOS methodology 10+ years board-level
- co-op.care CareOS architecture = current technical builder credibility

## Flagged Connections
- **Mocingbird** (Ian Madom MD, orthopedic surgeon founder): Clinician licensing/credentialing platform. Potential co-op.care partner for federated W2 caregiver workforce compliance across state lines. Also StartUp Health community member — potential channel for co-op.care visibility.

## Build Infrastructure (in /home/claude/)
All generators are Node.js scripts using `docx` npm package:
- `build_master_resume.js` — Master resume generator
- `build_cv.js` — Full CV generator
- `build_all_resumes.js` — All 7 Hippocratic AI variants
- `build_all_letters.js` — All 7 Hippocratic AI cover letters
- `build_cover_letter.js` — Hippocratic Academy cover letter (flagship)
- `build_covera_resume.js` / `build_covera_letter.js`
- `build_beone_resume.js` / `build_beone_letter.js`
- `build_kuddo_resume.js` / `build_kuddo_letter.js`

All use the same design system: Navy (#1B2A4A), Teal (#0D7377), Arial font, US Letter, teal underline section headers, bullet numbering config.
