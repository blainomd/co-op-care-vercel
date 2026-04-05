# /care-plan — co-op.care Care Plan Builder

Build or modify care plan functionality using the Omaha System taxonomy.

## Omaha System Structure

- **4 Domains:** Environmental, Psychosocial, Physiological, Health-Related Behaviors
- **42 Problems:** Mapped across domains (e.g., Income, Nutrition, Pain, Mental health)
- **3 Intervention Schemes:** Teaching/Guidance/Counseling, Treatments/Procedures, Case Management, Surveillance
- **KBS Rating:** Knowledge (1-5), Behavior (1-5), Status (1-5)

## Care Plan Flow

1. Family admin completes CII (Caregiver Intensity Index, 12 dimensions) + CRI (Care Recipient Index, 14 factors)
2. Sage AI analyzes scores -> identifies top Omaha problems
3. Generate care plan with interventions mapped to Omaha taxonomy
4. Care Neighbor receives care plan on mobile -> task checklists per visit
5. After each visit: KBS rating updated, outcomes tracked
6. Monthly: AI re-evaluates, adjusts plan, generates FHIR R4 resources

## Key Files

- `src/server/modules/care-plans/` — CRUD + AI generation
- `src/server/modules/assessments/` — CII/CRI scoring
- `src/shared/constants/omaha-system.ts` — Full taxonomy
- `src/client/pages/CarePlan.tsx` — Family view
- `src/client/pages/WorkerCarePlan.tsx` — Care Neighbor view

## Rules

- All care plans require physician sign-off (ClinicalSwipe `submit_for_review`)
- Omaha System codes required on every intervention
- KBS ratings tracked longitudinally for outcome measurement
- FHIR R4 resources generated for every care plan (Aidbox)
- Never auto-apply care plan changes without family_admin approval
