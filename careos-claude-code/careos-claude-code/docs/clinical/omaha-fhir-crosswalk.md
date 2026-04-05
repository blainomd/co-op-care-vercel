# Omaha System → FHIR R4 Crosswalk
## co-op.care Technologies LLC — Technical Reference for CareOS Development

**Version:** 1.0
**Date:** February 27, 2026
**Audience:** Cohesion Health engineering team, Clinical Director
**Purpose:** Maps Omaha System clinical vocabulary to FHIR R4 resources stored in Aidbox

---

## 1. Omaha System Overview

The Omaha System is a standardized clinical vocabulary developed for community-based nursing practice. It consists of three components that map directly to FHIR R4 resource types:

| Omaha Component | Purpose | FHIR R4 Resource(s) |
|----------------|---------|---------------------|
| Problem Classification Scheme | What's happening clinically | Condition, Observation |
| Intervention Scheme | What care is being provided | CarePlan, Procedure, Task |
| Problem Rating Scale (KBS) | How the patient is doing | Observation (outcome scores) |

---

## 2. Problem Classification Scheme → FHIR Mapping

The Omaha System defines 42 problems across 4 domains. Each problem maps to a FHIR Condition or Observation.

### Domain 1: Environmental

| # | Omaha Problem | FHIR Resource | FHIR Code System | Relevant ACCESS Track |
|---|--------------|---------------|-------------------|----------------------|
| 01 | Income | Observation | SDOH (social-connection) | All tracks |
| 02 | Sanitation | Condition | SNOMED → Omaha | — |
| 03 | Residence | Observation | SDOH (housing-instability) | All tracks |
| 04 | Neighborhood/workplace safety | Observation | SDOH | — |

### Domain 2: Psychosocial

| # | Omaha Problem | FHIR Resource | Relevant ACCESS Track |
|---|--------------|---------------|----------------------|
| 05 | Communication with community resources | Observation | All tracks |
| 06 | Social contact | Observation | BH |
| 07 | Role change | Observation | BH |
| 08 | Interpersonal relationship | Observation | BH |
| 09 | Spirituality | Observation | BH |
| 10 | Grief | Observation | BH |
| 11 | Mental health | Condition | BH |
| 12 | Growth and development | Observation | — |
| 13 | Abuse and neglect | Condition | All tracks |
| 14 | Substance use | Condition | BH |
| 15 | Caregiver/parenting | Observation | All tracks (CII maps here) |

### Domain 3: Physiological

| # | Omaha Problem | FHIR Resource | Relevant ACCESS Track |
|---|--------------|---------------|----------------------|
| 16 | Hearing | Condition | — |
| 17 | Vision | Condition | — |
| 18 | Speech and language | Condition | — |
| 19 | Oral health | Condition | — |
| 20 | Cognition | Condition | eCKM, CKM |
| 21 | Pain | Condition | MSK |
| 22 | Consciousness | Observation | — |
| 23 | Skin | Condition | — |
| 24 | Neuro-musculo-skeletal function | Condition | MSK |
| 25 | Respiration | Condition | eCKM, CKM |
| 26 | Circulation | Condition | eCKM, CKM |
| 27 | Digestion-hydration | Condition | eCKM |
| 28 | Bowel function | Condition | — |
| 29 | Urinary function | Condition | CKM |
| 30 | Reproductive function | Condition | — |
| 31 | Pregnancy | Condition | — |
| 32 | Postpartum | Condition | — |
| 33 | Communicable/infectious condition | Condition | — |

### Domain 4: Health-Related Behaviors

| # | Omaha Problem | FHIR Resource | Relevant ACCESS Track |
|---|--------------|---------------|----------------------|
| 34 | Nutrition | Observation | eCKM, CKM |
| 35 | Sleep and rest patterns | Observation | BH, eCKM |
| 36 | Physical activity | Observation | eCKM, CKM, MSK |
| 37 | Personal care | Observation | All tracks |
| 38 | Substance use | Condition | BH |
| 39 | Family planning | Observation | — |
| 40 | Health care supervision | Observation | All tracks |
| 41 | Medication regimen | Observation | eCKM, CKM |
| 42 | Prescribed medication regimen | Observation | eCKM, CKM |

---

## 3. FHIR Condition Resource Template (Omaha Problem)

```json
{
  "resourceType": "Condition",
  "id": "omaha-condition-example",
  "meta": {
    "profile": ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-condition-problems-health-concerns"]
  },
  "clinicalStatus": {
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
      "code": "active"
    }]
  },
  "category": [{
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/condition-category",
      "code": "problem-list-item",
      "display": "Problem List Item"
    }]
  }],
  "code": {
    "coding": [
      {
        "system": "http://omaha-system.org/problems",
        "code": "26",
        "display": "Circulation"
      },
      {
        "system": "http://snomed.info/sct",
        "code": "38341003",
        "display": "Hypertensive disorder"
      }
    ]
  },
  "subject": {
    "reference": "Patient/example-patient-id"
  },
  "onsetDateTime": "2026-03-15",
  "recorder": {
    "reference": "Practitioner/clinical-director-id"
  },
  "note": [{
    "text": "Identified via CRI assessment. Blood pressure monitoring and medication adherence support indicated."
  }]
}
```

---

## 4. Intervention Scheme → FHIR CarePlan + Procedure

The Omaha Intervention Scheme defines 4 intervention categories with 75 targets:

| Omaha Category | Description | FHIR Resource |
|---------------|-------------|---------------|
| Teaching, Guidance, Counseling (TGC) | Education and support activities | CarePlan.activity |
| Treatments and Procedures (TP) | Direct care actions | Procedure |
| Case Management (CM) | Coordination and referral | Task, ServiceRequest |
| Surveillance (S) | Monitoring and assessment | Observation |

### Intervention Targets (75 total — key ACCESS-relevant targets)

| Target | Omaha Code | Common Problems | FHIR Mapping |
|--------|-----------|-----------------|--------------|
| Anatomy/physiology | 01 | All physiological | CarePlan.activity.detail |
| Behavior modification | 02 | Nutrition, Physical activity | CarePlan.activity.detail |
| Bladder care | 03 | Urinary function | Procedure |
| Cardiac care | 07 | Circulation | Procedure |
| Communication | 10 | Cognition, Speech | CarePlan.activity.detail |
| Dietary management | 14 | Nutrition, Digestion | CarePlan.activity.detail |
| Exercise | 18 | Physical activity, MSK | CarePlan.activity.detail |
| Medication action/side effects | 27 | Medication regimen | CarePlan.activity.detail |
| Medication administration | 28 | Prescribed medication | Procedure |
| Medication coordination | 29 | Medication regimen | Task |
| Mobility/transfers | 31 | Neuro-musculo-skeletal | Procedure |
| Pain management | 35 | Pain | Procedure, CarePlan |
| Relaxation/breathing techniques | 40 | Mental health, Pain | CarePlan.activity.detail |
| Safety | 42 | All domains | CarePlan.activity.detail |
| Signs/symptoms - mental/emotional | 44 | Mental health | Observation |
| Signs/symptoms - physical | 45 | All physiological | Observation |
| Stress management | 50 | Mental health, Caregiver | CarePlan.activity.detail |
| Wellness | 56 | All domains | CarePlan.activity.detail |

### FHIR CarePlan Template (Omaha Interventions)

```json
{
  "resourceType": "CarePlan",
  "id": "omaha-careplan-example",
  "status": "active",
  "intent": "plan",
  "category": [{
    "coding": [{
      "system": "http://hl7.org/fhir/us/core/CodeSystem/careplan-category",
      "code": "assess-plan"
    }]
  }],
  "subject": {
    "reference": "Patient/example-patient-id"
  },
  "period": {
    "start": "2026-03-15"
  },
  "careTeam": [{
    "reference": "CareTeam/cooperative-care-team"
  }],
  "addresses": [{
    "reference": "Condition/omaha-condition-circulation"
  }],
  "activity": [
    {
      "detail": {
        "code": {
          "coding": [{
            "system": "http://omaha-system.org/interventions",
            "code": "TGC-27",
            "display": "Teaching, Guidance, Counseling: medication action/side effects"
          }]
        },
        "status": "in-progress",
        "description": "Educate patient on blood pressure medication timing and potential side effects. Monitor adherence weekly."
      }
    },
    {
      "detail": {
        "code": {
          "coding": [{
            "system": "http://omaha-system.org/interventions",
            "code": "S-45",
            "display": "Surveillance: signs/symptoms - physical"
          }]
        },
        "status": "in-progress",
        "description": "Monitor blood pressure readings, dizziness, and medication side effects during each visit."
      }
    }
  ]
}
```

---

## 5. KBS Problem Rating Scale → FHIR Observation (Outcomes)

The KBS (Knowledge-Behavior-Status) scale is the outcome measurement engine. Each problem is rated on three dimensions, each scored 1-5:

| Dimension | Score 1 | Score 3 | Score 5 |
|-----------|---------|---------|---------|
| Knowledge | No knowledge | Basic knowledge | Superior knowledge |
| Behavior | Not appropriate | Inconsistently appropriate | Consistently appropriate |
| Status | Extreme signs/symptoms | Moderate signs/symptoms | No signs/symptoms |

**ACCESS Outcome Attainment:** Improvement on ANY KBS dimension for a problem counts as measurable improvement. The Outcome Attainment Threshold requires 50% of aligned beneficiaries to show improvement.

### FHIR Observation Template (KBS Scores)

```json
{
  "resourceType": "Observation",
  "id": "kbs-rating-example",
  "status": "final",
  "category": [{
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
      "code": "survey",
      "display": "Survey"
    }]
  }],
  "code": {
    "coding": [{
      "system": "http://omaha-system.org/kbs",
      "code": "KBS-26",
      "display": "Omaha KBS Rating: Circulation"
    }]
  },
  "subject": {
    "reference": "Patient/example-patient-id"
  },
  "effectiveDateTime": "2026-03-15T14:30:00-06:00",
  "component": [
    {
      "code": {
        "coding": [{
          "system": "http://omaha-system.org/kbs",
          "code": "knowledge",
          "display": "Knowledge"
        }]
      },
      "valueInteger": 3
    },
    {
      "code": {
        "coding": [{
          "system": "http://omaha-system.org/kbs",
          "code": "behavior",
          "display": "Behavior"
        }]
      },
      "valueInteger": 2
    },
    {
      "code": {
        "coding": [{
          "system": "http://omaha-system.org/kbs",
          "code": "status",
          "display": "Status"
        }]
      },
      "valueInteger": 3
    }
  ],
  "derivedFrom": [{
    "reference": "Observation/caregiver-note-12345"
  }],
  "performer": [{
    "reference": "Practitioner/caregiver-id"
  }]
}
```

---

## 6. CII Assessment → FHIR Mapping

The CII (Caregiver Intensity Index) maps to Omaha Problem #15 (Caregiver/parenting):

```json
{
  "resourceType": "Observation",
  "id": "cii-assessment-example",
  "status": "final",
  "category": [{
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
      "code": "survey"
    }]
  }],
  "code": {
    "coding": [{
      "system": "http://co-op.care/assessments",
      "code": "CII",
      "display": "Caregiver Intensity Index"
    }]
  },
  "subject": {
    "reference": "RelatedPerson/family-caregiver-id"
  },
  "focus": [{
    "reference": "Patient/care-recipient-id"
  }],
  "effectiveDateTime": "2026-03-15T10:00:00-06:00",
  "valueInteger": 72,
  "interpretation": [{
    "coding": [{
      "system": "http://co-op.care/cii-zones",
      "code": "yellow",
      "display": "Yellow Zone - Significant Caregiver Strain"
    }]
  }],
  "component": [
    { "code": { "text": "Sleep disruption" }, "valueInteger": 7 },
    { "code": { "text": "Guilt" }, "valueInteger": 6 },
    { "code": { "text": "Career impact" }, "valueInteger": 8 },
    { "code": { "text": "Health neglect" }, "valueInteger": 5 },
    { "code": { "text": "Isolation" }, "valueInteger": 7 },
    { "code": { "text": "Emotional resilience" }, "valueInteger": 4 },
    { "code": { "text": "Care knowledge burden" }, "valueInteger": 6 },
    { "code": { "text": "Financial stress" }, "valueInteger": 8 },
    { "code": { "text": "Care plan fragility" }, "valueInteger": 7 },
    { "code": { "text": "Sleep anxiety" }, "valueInteger": 5 },
    { "code": { "text": "Social withdrawal" }, "valueInteger": 4 },
    { "code": { "text": "Failure perception" }, "valueInteger": 5 }
  ]
}
```

---

## 7. CRI Assessment → FHIR Mapping

The CRI maps across multiple Omaha problems depending on which factors score highest:

| CRI Factor | Omaha Problem | FHIR Resource |
|-----------|---------------|---------------|
| ADL independence | #37 Personal care | Observation |
| IADL capability | #37 Personal care | Observation |
| Cognitive status | #20 Cognition | Condition/Observation |
| Fall risk (1.1x weight) | #24 Neuro-musculo-skeletal | RiskAssessment |
| Medication complexity | #42 Prescribed medication | Observation |
| Chronic condition count | Multiple | Condition (list) |
| Social isolation | #06 Social contact | Observation |
| Caregiver availability | #15 Caregiver/parenting | Observation |
| Home safety | #04 Neighborhood safety | Observation |
| Nutrition status | #34 Nutrition | Observation |
| Pain level | #21 Pain | Observation |
| Sleep quality | #35 Sleep and rest | Observation |
| Mobility | #24 Neuro-musculo-skeletal | Observation |
| Emotional wellbeing | #11 Mental health | Observation |

---

## 8. Billing Code Generation (PIN/CHI)

The CareOS pipeline generates CMS billing codes from documented interventions:

| Service | CPT/HCPCS Code | Description | ACCESS Relevance |
|---------|---------------|-------------|-----------------|
| Chronic Care Management | 99490 | 20+ min/month clinical staff | Primary ACCESS billing |
| Complex CCM | 99487 | 60+ min/month clinical staff | High-acuity patients |
| CCM Add-on | 99489 | Each additional 30 min | Extended service |
| Principal Care Management | 99424 | Single high-risk condition | eCKM/CKM patients |
| Remote Patient Monitoring | 99453 | Device setup/education | Future capability |
| RPM Data Review | 99457 | 20+ min/month review | Future capability |
| Caregiver Training | 96161 | Caregiver assessment | CII administration |
| Care Plan Oversight | 99339 | 15-29 min/month physician | Clinical Director |

### Claim Resource Generation Flow

```
Caregiver Note → CareOS NLP → Omaha Coding → 
Intervention Duration Tracking → Threshold Check (≥20 min/month) →
Clinical Director Review → FHIR Claim Resource → CMS Submission
```

---

## 9. Implementation Notes for Cohesion Engineering

**Custom CodeSystem Registration in Aidbox:**
- Register `http://omaha-system.org/problems` (42 codes)
- Register `http://omaha-system.org/interventions` (4 categories × 75 targets = 300 codes)
- Register `http://omaha-system.org/kbs` (3 dimensions × 5 levels)
- Register `http://co-op.care/assessments` (CII, CRI codes)
- Register `http://co-op.care/cii-zones` (green, yellow, red)

**SQL on FHIR ViewDefinitions Needed:**
- `cii_scores_by_patient` — longitudinal CII tracking
- `cri_scores_by_patient` — longitudinal CRI tracking  
- `kbs_outcomes_by_problem` — outcome attainment calculation
- `intervention_minutes_by_patient` — CCM billing threshold tracking
- `access_outcome_dashboard` — aggregate outcome attainment percentage

**FHIR Subscription Topics:**
- `new-red-zone-cii` — triggers Clinical Director alert
- `kbs-decline-detected` — triggers care plan review
- `ccm-threshold-approaching` — alerts when patient nearing billing threshold
- `discharge-notification` — BCH HL7 v2 ADT feed trigger

---

*This crosswalk is a living document. Updates will be made as the Omaha System coding engine is validated against real clinical observations during the Phase 1 sprint.*
