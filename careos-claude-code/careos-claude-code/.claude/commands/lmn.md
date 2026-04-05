# /lmn — Letter of Medical Necessity Generator

Build or modify the Autonomous LMN Generation System for co-op.care.

## What It Does

Generates Letters of Medical Necessity (LMNs) that unlock HSA/FSA eligibility for home care services. $199/letter, physician-reviewed via ClinicalSwipe. Josh Emdur DO signs all LMNs.

## Flow

1. Family completes Sage AI assessment (CII/CRI + care needs)
2. AI drafts LMN based on assessment data + clinical criteria
3. LMN routed to ClinicalSwipe: `submit_for_review({ type: 'lmn', content, patientData })`
4. Josh reviews (3-5 min), accepts/modifies/rejects
5. On accept: attestation ID generated, LMN finalized with Josh's NPI + signature
6. PDF generated, stored in family's document vault
7. Family downloads + submits to HSA/FSA administrator
8. Predictive savings shown BEFORE purchase ("Estimated HSA savings: $X,XXX/year")

## LMN Structure

```
LETTER OF MEDICAL NECESSITY
Date: [date]
Patient: [name, DOB]
Physician: Josh Emdur, DO | NPI: 1649218389

DIAGNOSIS: [ICD-10 codes from assessment]
MEDICAL NECESSITY: [Clinical rationale from CII/CRI scores]
PRESCRIBED SERVICES: [Home care services mapped to medical needs]
DURATION: [Recommended care period]
HSA/FSA ELIGIBLE: Yes, per IRS Publication 502

Physician Signature: [digital]
Attestation ID: [ClinicalSwipe ID]
```

## Key Files

- `src/server/modules/lmn/lmn.service.ts` — Generation + ClinicalSwipe integration
- `src/server/modules/lmn/lmn.routes.ts` — API endpoints
- `src/server/modules/lmn/templates/` — LMN templates by care type
- `src/client/pages/LMN.tsx` — Family-facing LMN request + status

## Revenue Model

- $199 flat per LMN (included unlimited in $59/mo plan)
- Josh reviews 10-20/hour = $520K-$1M+/year capacity
- Predictive savings shown pre-purchase to drive conversion

## Rules

- Every LMN MUST go through ClinicalSwipe physician review
- Josh's NPI (1649218389) on every signed LMN
- ICD-10 codes must be clinically justified by assessment data
- Never promise HSA/FSA approval — show "estimated" savings
- Store all LMNs as immutable records (legal/compliance)
- Legal gray area: need healthcare attorney opinion before scaling
