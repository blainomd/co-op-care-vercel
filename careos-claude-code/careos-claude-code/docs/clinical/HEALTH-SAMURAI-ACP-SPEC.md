# CareOS Advance Care Planning -- FHIR Resource Configuration Spec

**To:** Health Samurai Team / Pavel
**From:** Blaine Warkentine, MD -- CareOS (co-op.care)
**Date:** 2026-03-09
**Status:** Draft -- Requesting Review and Guidance
**Version:** 2.0

---

## Table of Contents

1. [Context](#1-context)
2. [FHIR Resources Needed](#2-fhir-resources-needed)
   - 2.1 [Consent (Advance Directives)](#21-consent-advance-directives)
   - 2.2 [Goal (Goals of Care)](#22-goal-goals-of-care)
   - 2.3 [Communication (Family Conversations)](#23-communication-family-conversations)
3. [Sync Architecture](#3-sync-architecture)
4. [Custom CodeSystems to Register](#4-custom-codesystems-to-register)
5. [SearchParameter Requirements](#5-searchparameter-requirements)
6. [Questions for Pavel](#6-questions-for-pavel)

---

## 1. Context

### 1.1 What is CareOS?

CareOS is the operating system for **co.op.care**, a worker-owned home care cooperative based in Boulder, Colorado. The platform manages caregiver scheduling, client care plans, clinical documentation, and family communication for companion and personal care services.

The primary user is the **Conductor** -- typically a daughter aged 35-60 managing care for an aging parent from her phone.

### 1.2 Current Aidbox Integration

We already have a working FHIR sync pipeline with Aidbox. The following resource types are currently synced:

| Resource Type | CareOS Usage |
|---|---|
| Patient | Care recipients |
| Encounter | Time Bank task completions (home health visits) |
| Observation | KBS outcomes, vitals |
| QuestionnaireResponse | CII/CRI assessments |
| CarePlan | Active care plans |
| CareTeam | Family care teams + caregiver assignments |
| DocumentReference | Letters of Medical Necessity (LMN), uploaded documents |
| Procedure | Completed care activities |

### 1.3 Architecture Overview

Our architecture uses PostgreSQL as the operational database with an asynchronous outbox pattern to sync clinical data into Aidbox:

```
  PostgreSQL (operational store)
       |
       |  DB trigger on write
       v
  fhir_outbox table (change events queued in same transaction)
       |
       |  Polled every 5 seconds
       v
  Redis job queue (BullMQ)
       |
       |  Process job: transform to FHIR R4, PUT to Aidbox
       v
  Aidbox FHIR API (R4)
       |
       +---> AuditEvent logged per write (HIPAA)
```

- **PostgreSQL** is the primary operational database. All application writes land here first.
- On each write, a trigger inserts a row into the **`fhir_outbox`** table with the resource type, resource ID, operation (create/update/delete), and a serialized FHIR payload.
- A **Redis-backed poller** (BullMQ) picks up outbox entries and pushes them to Aidbox via the FHIR REST API.
- Delivery is at-least-once with idempotent PUT operations to Aidbox.
- Clinical taxonomy uses the **Omaha System** (42 problems, 4 domains), already configured as a CodeSystem in Aidbox.

### 1.4 What We Need

Three **new FHIR resource types** to support Advance Care Planning (ACP) workflows:

1. **Consent** -- Advance directives, healthcare proxy designations, POLST/MOLST
2. **Goal** -- Goals of care expressed by the client and/or family
3. **Communication** -- Family care conversations, documented decisions

These are critical for our companion care model. Many of our clients are aging adults who want to stay home, and their families need structured, trackable advance care planning.

---

## 2. FHIR Resources Needed

### 2.1 Consent (Advance Directives)

**Purpose:** Store advance directive metadata and link to uploaded PDF documents. Each Consent resource represents one legal advance directive document (living will, healthcare proxy designation, POLST, DNR, or combined directive).

**CareOS Workflow:**
1. Conductor uploads a scanned/signed advance directive PDF
2. CareOS creates a Consent resource with metadata + sourceAttachment linking to the PDF
3. Consent.provision captures the designated healthcare proxy (role HPOWATT)
4. When a new directive supersedes an old one, the old Consent status transitions to `inactive`

#### Full FHIR R4 JSON Example

```json
{
  "resourceType": "Consent",
  "id": "acp-living-will-001",
  "meta": {
    "profile": [
      "http://hl7.org/fhir/us/core/StructureDefinition/us-core-consent"
    ],
    "lastUpdated": "2026-03-09T14:30:00Z"
  },
  "status": "active",
  "scope": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/consentscope",
        "code": "adr",
        "display": "Advance Directive"
      }
    ]
  },
  "category": [
    {
      "coding": [
        {
          "system": "http://loinc.org",
          "code": "75320-2",
          "display": "Advance directive"
        }
      ]
    },
    {
      "coding": [
        {
          "system": "https://co-op.care/fhir/CodeSystem/directive-type",
          "code": "living-will",
          "display": "Living Will"
        }
      ]
    }
  ],
  "patient": {
    "reference": "Patient/care-recipient-martha-001",
    "display": "Martha Johnson"
  },
  "dateTime": "2026-02-15T10:00:00-07:00",
  "performer": [
    {
      "reference": "RelatedPerson/conductor-sarah-001",
      "display": "Sarah Johnson (daughter, Conductor)"
    }
  ],
  "organization": [
    {
      "reference": "Organization/co-op-care",
      "display": "co.op.care -- Boulder Home Care Cooperative"
    }
  ],
  "sourceAttachment": {
    "contentType": "application/pdf",
    "url": "https://aidbox.co-op.care/fhir/Binary/acp-pdf-living-will-001",
    "title": "Martha Johnson -- Living Will (signed 2026-02-15)",
    "creation": "2026-02-15"
  },
  "policy": [
    {
      "authority": "https://leg.colorado.gov",
      "uri": "https://leg.colorado.gov/sites/default/files/images/olls/crs2023-title-15-article-18.pdf"
    }
  ],
  "policyRule": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        "code": "OPTIN",
        "display": "Opt-in"
      }
    ]
  },
  "provision": {
    "type": "permit",
    "period": {
      "start": "2026-02-15"
    },
    "actor": [
      {
        "role": {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
              "code": "HPOWATT",
              "display": "Healthcare Power of Attorney"
            }
          ]
        },
        "reference": {
          "reference": "RelatedPerson/healthcare-proxy-sarah-001",
          "display": "Sarah Johnson (Healthcare Proxy)"
        }
      },
      {
        "role": {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
              "code": "HPOWATT",
              "display": "Healthcare Power of Attorney"
            }
          ],
          "text": "Alternate Healthcare Proxy"
        },
        "reference": {
          "reference": "RelatedPerson/alternate-proxy-michael-001",
          "display": "Michael Johnson (Alternate Proxy, son)"
        }
      }
    ],
    "action": [
      {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/consentaction",
            "code": "correct",
            "display": "Access and Correct"
          }
        ]
      }
    ],
    "purpose": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason",
        "code": "TREAT",
        "display": "Treatment"
      }
    ]
  },
  "identifier": [
    {
      "system": "https://co-op.care/fhir/consent-id",
      "value": "acp-lw-martha-2026-02-15"
    }
  ]
}
```

#### Open Questions for Pavel -- Consent

| # | Question | Context |
|---|---|---|
| Q1 | **Consent vs DocumentReference for PDF storage?** | We store the signed PDF via `sourceAttachment` pointing to an Aidbox Binary resource. Should we also create a parallel `DocumentReference` and link from the Consent? Or is `sourceAttachment` sufficient for Aidbox search and retrieval? |
| Q2 | **Healthcare proxy as RelatedPerson?** | We model the healthcare proxy (e.g., Sarah Johnson above) as a `RelatedPerson` referenced via `provision.actor` with role `HPOWATT`. Is this the recommended linking pattern in Aidbox? Should the RelatedPerson be created first, or can we use contained resources? Any Aidbox-specific indexing considerations for querying "who is the proxy for Patient X?" |
| Q3 | **State-specific POLST validation?** | Colorado has specific POLST form requirements under CRS 15-18. Should we register a Colorado-specific profile, or handle POLST as a separate Consent with a different `category` code? Is validation best handled at the Aidbox level or the application layer? |
| Q4 | **Supersession / revocation handling?** | When a client updates their advance directive, what is the correct Aidbox pattern? Set old Consent to `status=inactive` and create a new one? Or use a provenance-based linking pattern? Does Aidbox enforce or validate status transitions? |

---

### 2.2 Goal (Goals of Care)

**Purpose:** Capture care preferences and goals expressed by the care recipient and/or their family Conductor. Goals are categorized by the care domain they address (comfort, function, longevity, autonomy, spiritual, legacy) and are linked to the care recipient's CarePlan.

These are NOT clinical treatment goals -- they are life goals and care preferences that inform companion care delivery.

**CareOS Workflow:**
1. Conductor opens the "Goals of Care" section in the ACP module
2. Selects a goal category from our custom CodeSystem and describes the goal
3. Optionally sets a target date and priority
4. Goal syncs to Aidbox and is linked to the active CarePlan via `CarePlan.goal`

#### Full FHIR R4 JSON Example

```json
{
  "resourceType": "Goal",
  "id": "goal-comfort-martha-001",
  "meta": {
    "lastUpdated": "2026-03-09T14:30:00Z"
  },
  "lifecycleStatus": "active",
  "achievementStatus": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/goal-achievement",
        "code": "in-progress",
        "display": "In Progress"
      }
    ]
  },
  "category": [
    {
      "coding": [
        {
          "system": "https://co-op.care/fhir/CodeSystem/goal-category",
          "code": "comfort",
          "display": "Comfort & Symptom Management"
        }
      ]
    }
  ],
  "priority": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/goal-priority",
        "code": "high-priority",
        "display": "High Priority"
      }
    ]
  },
  "description": {
    "text": "Mom wants to remain comfortable at home with minimal medical interventions. She has expressed that pain management is her top priority, and she does not want to be hospitalized unless absolutely necessary."
  },
  "subject": {
    "reference": "Patient/care-recipient-martha-001",
    "display": "Martha Johnson"
  },
  "startDate": "2026-03-01",
  "target": [
    {
      "measure": {
        "coding": [
          {
            "system": "http://loinc.org",
            "code": "75776-5",
            "display": "Goals AndOr treatment preferences"
          }
        ]
      },
      "detailString": "Maintain current daily routine with caregiver support for meal prep and mobility",
      "dueDate": "2026-09-01"
    }
  ],
  "statusDate": "2026-03-09",
  "expressedBy": {
    "reference": "RelatedPerson/conductor-sarah-001",
    "display": "Sarah Johnson (daughter, Conductor)"
  },
  "addresses": [
    {
      "reference": "Condition/chronic-pain-martha-001",
      "display": "Chronic lower back pain"
    }
  ],
  "note": [
    {
      "authorReference": {
        "reference": "RelatedPerson/conductor-sarah-001",
        "display": "Sarah Johnson (Conductor)"
      },
      "time": "2026-03-09T14:30:00Z",
      "text": "Discussed with Mom on 3/9. She was clear that she wants to stay home. Dr. Emdur confirmed pain management plan is appropriate."
    },
    {
      "authorReference": {
        "reference": "RelatedPerson/sibling-michael-001",
        "display": "Michael Johnson (son)"
      },
      "time": "2026-03-10T09:15:00Z",
      "text": "I agree with Mom's goals. We should also make sure she can keep up her Wednesday tea with Helen -- that is the highlight of her week."
    }
  ],
  "identifier": [
    {
      "system": "https://co-op.care/fhir/goal-id",
      "value": "goal-comfort-martha-2026-03-01"
    }
  ]
}
```

#### Open Questions for Pavel -- Goal

| # | Question | Context |
|---|---|---|
| Q5 | **Custom CodeSystem registration process?** | We need to register `https://co-op.care/fhir/CodeSystem/goal-category` with 6 codes (see Section 4). What is the Aidbox process for loading custom CodeSystems? Can we POST them as part of an init bundle, or is there a separate registration step? We already have `omaha-codesystem.json` loaded as an init bundle and want to follow the same pattern. |
| Q6 | **Goal-to-CarePlan linkage?** | Our CarePlan resources reference Goals via `CarePlan.goal`. Does Aidbox support reverse-include queries like `GET /Goal?_revinclude=CarePlan:goal` to find all Goals referenced by a CarePlan? What indexes does Aidbox maintain for this? |
| Q7 | **achievementStatus tracking?** | We want to track goal achievement over time. Should we update `achievementStatus` in place on the Goal resource (relying on Aidbox resource history for audit trail), or create snapshots? What is the Aidbox-recommended pattern for goal lifecycle tracking? |

---

### 2.3 Communication (Family Conversations)

**Purpose:** Record structured notes from family care conversations and meetings. These are not clinical encounters but family discussions about care preferences, decisions, and next steps. The Conductor logs these to maintain a shared record accessible to the care team.

**CareOS Workflow:**
1. After a family meeting or care conversation, the Conductor opens the "Log Conversation" feature
2. Enters date, participants, topics discussed, decisions made, and next steps
3. Communication resource is created in PostgreSQL and synced to Aidbox
4. Visible on the care timeline for all authorized care team members

#### Full FHIR R4 JSON Example

```json
{
  "resourceType": "Communication",
  "id": "comm-family-meeting-001",
  "meta": {
    "lastUpdated": "2026-03-09T14:30:00Z"
  },
  "status": "completed",
  "category": [
    {
      "coding": [
        {
          "system": "https://co-op.care/fhir/CodeSystem/communication-type",
          "code": "family-meeting",
          "display": "Family Meeting"
        }
      ]
    }
  ],
  "priority": "routine",
  "subject": {
    "reference": "Patient/care-recipient-martha-001",
    "display": "Martha Johnson"
  },
  "about": [
    {
      "reference": "CarePlan/careplan-martha-001",
      "display": "Martha's Active Care Plan"
    },
    {
      "reference": "Goal/goal-comfort-martha-001",
      "display": "Comfort & Home Care Goal"
    },
    {
      "reference": "Consent/acp-living-will-001",
      "display": "Martha's Advance Directive (Living Will)"
    }
  ],
  "encounter": {
    "reference": "Encounter/home-visit-2026-03-09"
  },
  "sent": "2026-03-09T14:00:00-07:00",
  "received": "2026-03-09T15:30:00-07:00",
  "sender": {
    "reference": "RelatedPerson/conductor-sarah-001",
    "display": "Sarah Johnson (Conductor)"
  },
  "recipient": [
    {
      "reference": "Patient/care-recipient-martha-001",
      "display": "Martha Johnson (care recipient)"
    },
    {
      "reference": "RelatedPerson/sibling-michael-001",
      "display": "Michael Johnson (son)"
    },
    {
      "reference": "RelatedPerson/sibling-emily-001",
      "display": "Emily Johnson-Park (daughter)"
    }
  ],
  "payload": [
    {
      "contentString": "MEETING SUMMARY\n\nDate: March 9, 2026, 2:00 PM -- 3:30 PM MT\nLocation: Martha's home, Boulder, CO\nFacilitator: Sarah Johnson (Conductor)\n\nATTENDEES:\n- Martha Johnson (care recipient)\n- Sarah Johnson (Conductor, daughter)\n- Michael Johnson (son)\n- Emily Johnson-Park (daughter)\n- Maria Gonzalez (primary caregiver, co.op.care worker-owner)\n\nTOPICS DISCUSSED:\n1. Review of current care plan and daily routine\n2. Martha's comfort level with current pain management\n3. Whether to continue physical therapy 2x/week\n4. Healthcare proxy confirmation (Sarah as primary, Michael as alternate)\n5. Home modifications -- grab bars in bathroom, icy walkway safety\n\nDECISIONS MADE:\n1. Continue current pain management plan per Dr. Emdur\n2. Reduce PT to 1x/week, supplement with daily walks (Emily to coordinate)\n3. Healthcare proxy designations confirmed -- Sarah will update legal documents\n4. Michael will arrange grab bar installation by end of March\n5. Martha confirmed she does NOT want feeding tube or mechanical ventilation under any circumstances\n\nACTION ITEMS:\n1. Sarah: Update advance directive with confirmed proxy designations [Due: 2026-03-15]\n2. Emily: Coordinate with PT office for schedule change [Due: 2026-03-12]\n3. Michael: Get quotes for grab bar installation [Due: 2026-03-16]\n4. Maria: Begin morning check-in calls on non-visit days starting 2026-03-10\n5. All: Follow-up family call in 4 weeks (April 6, 2026)\n\nMOM'S EXPRESSED WISHES:\n- Wants to stay in her house as long as possible\n- Does not want to go to a nursing home\n- Trusts Sarah to make decisions on her behalf"
    }
  ],
  "note": [
    {
      "authorReference": {
        "reference": "RelatedPerson/conductor-sarah-001",
        "display": "Sarah Johnson"
      },
      "time": "2026-03-09T15:45:00-07:00",
      "text": "Good conversation. Everyone was aligned. Mom was lucid and participated fully. Michael seemed more engaged than last time. No conflicts or concerns noted."
    }
  ],
  "identifier": [
    {
      "system": "https://co-op.care/fhir/communication-id",
      "value": "comm-fm-martha-2026-03-09"
    }
  ]
}
```

#### Open Questions for Pavel -- Communication

| # | Question | Context |
|---|---|---|
| Q8 | **Communication vs Composition?** | We considered using `Composition` for structured family meeting notes (with sections for topics, decisions, next steps). `Communication` felt more appropriate since these are interactive conversations with multiple participants, not clinical documents. Does Aidbox have a recommendation? Are there search/query or performance advantages to one over the other? |
| Q9 | **Non-FHIR participants?** | Some family meeting participants may not have corresponding FHIR resources (e.g., a neighbor who joins a conversation, a clergy member, an out-of-state sibling with no CareOS account). Options we see: (a) Create minimal `RelatedPerson` resources for all participants, (b) Use `Communication.recipient` with a `display` string and no `reference`, (c) Include participant names in the payload text only. What does Aidbox handle best for querying "all communications involving person X"? |
| Q10 | **Payload structure?** | We put the full meeting summary as a single `contentString` in `payload`. Should we split into multiple payload entries (one per section: topics, decisions, action items)? Or use `contentReference` pointing to a `DocumentReference` containing structured content? We want these to be searchable and renderable in the CareOS timeline. What storage/retrieval pattern works best with Aidbox? |

---

## 3. Sync Architecture

### 3.1 Data Flow Diagram

All three new resource types (Consent, Goal, Communication) will follow our existing transactional outbox sync pattern:

```
+------------------+     +------------------+     +---------------------------+
|                  |     |                  |     |        PostgreSQL          |
|  CareOS Client   |---->|  Fastify API     |---->|  (Operational DB)         |
|  (React PWA)     | REST|  (Node.js)       | TX  |                           |
|                  |     |                  |     |  +---------------------+  |
+------------------+     +------------------+     |  | advance_directives  |  |
                                                  |  | goals_of_care       |  |
                                                  |  | family_conversations|  |
                                                  |  +---------------------+  |
                                                  |                           |
                                                  |  +---------------------+  |
                                                  |  | fhir_outbox         |  |
                                                  |  | (same transaction)  |  |
                                                  |  +---------------------+  |
                                                  +-------------+-------------+
                                                                |
                                                                | Poll every 5s
                                                                v
                                                  +---------------------------+
                                                  |        Redis              |
                                                  |  (BullMQ Job Queue)       |
                                                  |                           |
                                                  |  fhir-sync worker picks   |
                                                  |  up outbox entries        |
                                                  +-------------+-------------+
                                                                |
                                                                | Transform to FHIR R4
                                                                | PUT /fhir/{ResourceType}/{id}
                                                                v
                                                  +---------------------------+
                                                  |        Aidbox             |
                                                  |  (FHIR R4 Clinical DB)    |
                                                  |                           |
                                                  |  NEW resources:           |
                                                  |  - Consent                |
                                                  |  - Goal                   |
                                                  |  - Communication          |
                                                  |                           |
                                                  |  + AuditEvent per write   |
                                                  +---------------------------+
```

### 3.2 Sync Properties

| Property | Value | Notes |
|---|---|---|
| Delivery guarantee | At-least-once | Idempotent PUT to Aidbox by resource ID |
| Retry strategy | Exponential backoff | 2s, 4s, 8s, 16s, 32s |
| Max attempts | 5 | After 5 failures, event marked `failed` in outbox |
| Polling interval | 5 seconds | Outbox table poll frequency |
| Batch size | 10 resources | Per poll cycle |
| Failed event handling | Dead-letter | Surfaced in admin monitoring, manual retry available |
| Audit logging | AuditEvent | Every successful Aidbox write generates an AuditEvent |
| Conflict resolution | Last-write-wins | CareOS/PostgreSQL is source of truth |
| ID strategy | Deterministic | CareOS ID = Aidbox resource ID |

### 3.3 Implementation Notes

No architectural changes are needed to the sync pipeline. We just need to:

1. Add PostgreSQL triggers for the new tables (`advance_directives`, `goals_of_care`, `family_conversations`)
2. Add FHIR serialization functions for each resource type (Consent, Goal, Communication)
3. Extend the `FhirResourceType` union in `outbox.ts` to include the three new types
4. Register the resource types and custom CodeSystems in the Aidbox configuration
5. Load the custom CodeSystems (Section 4) before first sync

---

## 4. Custom CodeSystems to Register

We need three custom CodeSystem resources loaded into Aidbox before syncing ACP resources. These follow the same pattern as our existing `omaha-codesystem.json` init bundle.

### 4.1 Goal Category CodeSystem

```json
{
  "resourceType": "CodeSystem",
  "id": "goal-category",
  "url": "https://co-op.care/fhir/CodeSystem/goal-category",
  "version": "1.0.0",
  "name": "CareOSGoalCategory",
  "title": "CareOS Goals of Care Categories",
  "status": "active",
  "experimental": false,
  "date": "2026-03-09",
  "publisher": "co-op.care",
  "description": "Categories for goals of care expressed by care recipients and their family Conductors in the CareOS advance care planning module. These are life goals and care preferences, not clinical treatment goals.",
  "caseSensitive": true,
  "content": "complete",
  "count": 6,
  "concept": [
    {
      "code": "comfort",
      "display": "Comfort & Symptom Management",
      "definition": "Goals focused on pain management, symptom control, and overall physical comfort. Prioritizes quality of life and minimizing distress."
    },
    {
      "code": "function",
      "display": "Functional Independence",
      "definition": "Goals focused on maintaining or improving ability to perform daily activities independently, including mobility, self-care, and household tasks."
    },
    {
      "code": "longevity",
      "display": "Life Extension",
      "definition": "Goals focused on extending life span, including willingness to accept aggressive medical interventions and hospitalization."
    },
    {
      "code": "autonomy",
      "display": "Autonomy & Decision-Making",
      "definition": "Goals focused on preserving the care recipient's ability to make their own decisions, maintain independence, and control their daily schedule and environment."
    },
    {
      "code": "spiritual",
      "display": "Spiritual & Emotional Well-Being",
      "definition": "Goals focused on spiritual fulfillment, emotional peace, existential concerns, and connection to faith or meaning-making practices."
    },
    {
      "code": "legacy",
      "display": "Legacy & Life Completion",
      "definition": "Goals focused on maintaining relationships, completing life projects, documenting family history, creating meaningful legacy artifacts, and saying goodbye."
    }
  ]
}
```

### 4.2 Communication Type CodeSystem

```json
{
  "resourceType": "CodeSystem",
  "id": "communication-type",
  "url": "https://co-op.care/fhir/CodeSystem/communication-type",
  "version": "1.0.0",
  "name": "CareOSCommunicationType",
  "title": "CareOS Communication Types",
  "status": "active",
  "experimental": false,
  "date": "2026-03-09",
  "publisher": "co-op.care",
  "description": "Types of care-related communications recorded in the CareOS advance care planning and care coordination modules.",
  "caseSensitive": true,
  "content": "complete",
  "count": 3,
  "concept": [
    {
      "code": "family-meeting",
      "display": "Family Care Meeting",
      "definition": "A structured family conversation about care preferences, decisions, and coordination. Typically involves the Conductor, care recipient, and family members."
    },
    {
      "code": "care-planning-session",
      "display": "Care Planning Session",
      "definition": "A focused conversation between the Conductor and care team about updating the care plan, goals, or service levels."
    },
    {
      "code": "medical-review",
      "display": "Medical Review Discussion",
      "definition": "A conversation involving the Medical Director or other clinical staff reviewing assessment results, care plans, or advance directives with the family."
    }
  ]
}
```

### 4.3 Directive Type CodeSystem

```json
{
  "resourceType": "CodeSystem",
  "id": "directive-type",
  "url": "https://co-op.care/fhir/CodeSystem/directive-type",
  "version": "1.0.0",
  "name": "CareOSDirectiveType",
  "title": "CareOS Advance Directive Types",
  "status": "active",
  "experimental": false,
  "date": "2026-03-09",
  "publisher": "co-op.care",
  "description": "Types of advance directive documents tracked in CareOS. Used as a secondary category on Consent resources alongside the LOINC 75320-2 advance directive code.",
  "caseSensitive": true,
  "content": "complete",
  "count": 5,
  "concept": [
    {
      "code": "living-will",
      "display": "Living Will",
      "definition": "A legal document specifying the care recipient's wishes regarding medical treatment if they become unable to communicate."
    },
    {
      "code": "healthcare-proxy",
      "display": "Healthcare Proxy Designation",
      "definition": "A legal document designating a person (typically the Conductor) to make healthcare decisions on behalf of the care recipient."
    },
    {
      "code": "polst",
      "display": "POLST/MOLST",
      "definition": "Physician Orders for Life-Sustaining Treatment (or Medical Orders for Life-Sustaining Treatment). A portable, actionable medical order signed by a physician."
    },
    {
      "code": "dnr",
      "display": "Do Not Resuscitate",
      "definition": "A medical order indicating that CPR should not be performed if the care recipient's heart or breathing stops."
    },
    {
      "code": "combined",
      "display": "Combined Advance Directive",
      "definition": "A single document combining living will and healthcare proxy designation, as permitted by Colorado law (CRS 15-18)."
    }
  ]
}
```

---

## 5. SearchParameter Requirements

We need the following search queries to work efficiently in Aidbox. Please confirm which are supported by built-in SearchParameters and which require custom definitions.

### 5.1 Consent Searches

| Use Case | Query | Notes |
|---|---|---|
| All active directives for a patient | `GET /fhir/Consent?patient=Patient/{id}&status=active` | Primary lookup |
| All directives (any status) | `GET /fhir/Consent?patient=Patient/{id}&category=http://loinc.org\|75320-2` | LOINC category filter |
| Specific directive type | `GET /fhir/Consent?patient=Patient/{id}&category=https://co-op.care/fhir/CodeSystem/directive-type\|living-will` | Custom CodeSystem filter |
| Most recent active first | `GET /fhir/Consent?patient=Patient/{id}&status=active&_sort=-dateTime` | Sort by date |
| Directives needing review | `GET /fhir/Consent?date=le2025-03-09&status=active` | Older than 1 year |
| Find by proxy | `GET /fhir/Consent?actor=RelatedPerson/{id}` | Who is proxy for whom? |

### 5.2 Goal Searches

| Use Case | Query | Notes |
|---|---|---|
| Active goals for a patient | `GET /fhir/Goal?patient=Patient/{id}&lifecycle-status=active` | Primary lookup |
| Goals by category | `GET /fhir/Goal?patient=Patient/{id}&category=https://co-op.care/fhir/CodeSystem/goal-category\|comfort` | Custom CodeSystem filter |
| High-priority goals | `GET /fhir/Goal?patient=Patient/{id}&priority=high-priority` | Priority filter |
| Active goals sorted by date | `GET /fhir/Goal?patient=Patient/{id}&lifecycle-status=active&_sort=-start-date` | Most recent first |
| Goals with addressed conditions | `GET /fhir/Goal?patient=Patient/{id}&_include=Goal:addresses` | Include linked Conditions |
| Goals linked to a care plan | `GET /fhir/Goal?patient=Patient/{id}&_revinclude=CarePlan:goal` | Reverse include |
| Overdue goals | `GET /fhir/Goal?target-date=le2026-03-09&lifecycle-status=active` | Past due date |

### 5.3 Communication Searches

| Use Case | Query | Notes |
|---|---|---|
| All family meetings for a patient | `GET /fhir/Communication?subject=Patient/{id}&category=https://co-op.care/fhir/CodeSystem/communication-type\|family-meeting` | Primary lookup |
| Most recent conversations | `GET /fhir/Communication?subject=Patient/{id}&_sort=-sent` | Sort by sent date |
| Conversations since a date | `GET /fhir/Communication?subject=Patient/{id}&sent=ge2026-01-01` | Date range |
| Conversations with linked resources | `GET /fhir/Communication?subject=Patient/{id}&_include=Communication:about` | Include linked CarePlan/Goal/Consent |
| Meetings involving a family member | `GET /fhir/Communication?recipient=RelatedPerson/{id}` | Family-specific history |
| Meetings by facilitator | `GET /fhir/Communication?sender=Practitioner/{id}` | Conductor/facilitator workload |

---

## 6. Questions for Pavel

### Q11: SearchParameter Definitions

For the queries listed in Section 5:
- Which work out-of-the-box with Aidbox's default SearchParameters?
- Specifically: Does `Consent?actor=RelatedPerson/xxx` work by default? Does `Goal?category=comfort` resolve against our custom CodeSystem? Does `Communication?about=CarePlan/xxx` work for polymorphic reference search?
- For any that do NOT work by default, can you provide the SearchParameter resource definitions we need to POST to Aidbox? We want to include these in our init bundle.

### Q12: US Advance Directive Extensions / Profiles

Are there existing US Core or PACIO profiles for advance directives that we should align with? We are aware of:
- `http://hl7.org/fhir/us/core/StructureDefinition/us-core-consent` (draft)
- PACIO Advance Directive Interoperability (ADI) Implementation Guide

Should we use the PACIO ADI profiles instead of (or in addition to) base R4 Consent? What is the Aidbox support status for these profiles?

### Q13: Consent Status Machine

What is the recommended Aidbox pattern for Consent lifecycle transitions?

```
  draft  -->  proposed  -->  active  -->  inactive
                  |                          ^
                  |                          |
                  +--- rejected              |
                                             |
                              (superseded by new Consent)
```

Options we see:
- (a) Aidbox-level validation that rejects invalid transitions
- (b) Application-level enforcement in our sync handlers
- (c) Aidbox subscriptions that react to status changes

Should we handle this as in-place status updates, or create new Consent resources and use provenance-based linking for the supersession chain?

### Q14: Large Payload Performance

Communication resources may contain substantial meeting notes in `payload.contentString` (2,000-5,000 characters for detailed meeting summaries). Questions:
- Does Aidbox have a practical size limit for string fields?
- Are there performance implications for full-text searching across Communication payloads?
- Should we consider moving large payloads to `Binary` resources and using `payload.contentReference` instead?
- Would `_summary=true` or `_elements` parameters help with list queries where we only need metadata?

### Q15: Aidbox Subscriptions for BCH / Epic Integration

We anticipate a future integration with Boulder Community Health (BCH), which runs Epic. If BCH needs to receive ACP data from Aidbox:
- Can we set up Aidbox Subscriptions (or TopicBasedSubscription) to push Consent/Goal/Communication changes to an Epic FHIR endpoint?
- What is the recommended pattern for Aidbox-to-Epic data sharing?
- Are there SMART on FHIR considerations for this flow?
- Should we configure subscriptions now to be ready, or wait until the BCH integration is active?

### Q16: Init Bundle Loading

Should we add the three new CodeSystem resources (Section 4) as:
- (a) Individual JSON files in `config/aidbox/` (matching our existing pattern with `omaha-codesystem.json` etc.)
- (b) A single FHIR Transaction Bundle containing all three CodeSystems + any required SearchParameters
- (c) Loaded via Aidbox REST API during application startup

Can we package everything needed for ACP support into a single idempotent Transaction Bundle?

```
Bundle (type: transaction)
  +-- CodeSystem/goal-category (PUT)
  +-- CodeSystem/communication-type (PUT)
  +-- CodeSystem/directive-type (PUT)
  +-- SearchParameter definitions (PUT, if needed)
  +-- ValueSet resources (PUT, if needed)
```

What is the best way to load this into Aidbox? `PUT /fhir/Bundle`? Aidbox-specific seed mechanism? Should this be idempotent (safe to re-run on every deployment)?

---

## Appendix A: Resource Relationship Map

```
Patient (Martha Johnson)
  |
  +-- Consent (Advance Directive -- Living Will)
  |     +-- sourceAttachment --> Binary (PDF)
  |     +-- provision.actor --> RelatedPerson (Sarah, Healthcare Proxy, HPOWATT)
  |     +-- provision.actor --> RelatedPerson (Michael, Alternate Proxy, HPOWATT)
  |
  +-- Goal (Comfort & Home Care)
  |     +-- expressedBy --> RelatedPerson (Sarah, Conductor)
  |     +-- addresses --> Condition (Chronic pain)
  |     +-- note[].authorReference --> RelatedPerson (Sarah), RelatedPerson (Michael)
  |
  +-- CarePlan (Companion Care Plan)
  |     +-- goal --> Goal
  |     +-- careTeam --> CareTeam
  |     +-- activity --> various
  |
  +-- Communication (Family Meeting)
  |     +-- about --> CarePlan, Goal, Consent
  |     +-- sender --> RelatedPerson (Sarah, Conductor)
  |     +-- recipient --> Patient, RelatedPerson (Michael), RelatedPerson (Emily)
  |     +-- payload --> Meeting summary (contentString)
  |
  +-- RelatedPerson (Sarah Johnson -- daughter, Conductor, Healthcare Proxy)
  |     linked from: Consent.provision.actor, Communication.sender, Goal.expressedBy, Goal.note
  |
  +-- RelatedPerson (Michael Johnson -- son, Alternate Proxy)
  |     linked from: Consent.provision.actor, Communication.recipient, Goal.note
  |
  +-- RelatedPerson (Emily Johnson-Park -- daughter)
        linked from: Communication.recipient
```

## Appendix B: Existing Aidbox Init Bundles

For reference, our current Aidbox init bundle files in `config/aidbox/`:

| File | Resource Type | Description |
|---|---|---|
| `omaha-codesystem.json` | CodeSystem | 42 Omaha System problems, 4 domains |
| `cii-questionnaire.json` | Questionnaire | Caregiver Intensity Index (12 dimensions, /120) |
| `cri-questionnaire.json` | Questionnaire | Care Recipient Index (14 factors) |
| `omaha-to-icd10-conceptmap.json` | ConceptMap | Omaha-to-ICD-10 crosswalk |
| `icd10-to-omaha-conceptmap.json` | ConceptMap | ICD-10-to-Omaha crosswalk |

## Appendix C: New Files to Create After Review

After receiving Pavel's guidance, we will create:

| File | Type | Description |
|---|---|---|
| `config/aidbox/goal-category-codesystem.json` | CodeSystem | 6 goal categories |
| `config/aidbox/communication-type-codesystem.json` | CodeSystem | 3 communication types |
| `config/aidbox/directive-type-codesystem.json` | CodeSystem | 5 advance directive types |
| `config/aidbox/acp-searchparameters.json` | SearchParameter Bundle | Custom search parameters (if needed) |
| `src/server/modules/fhir-sync/handlers/consent.handler.ts` | TypeScript | Consent sync handler |
| `src/server/modules/fhir-sync/handlers/goal.handler.ts` | TypeScript | Goal sync handler |
| `src/server/modules/fhir-sync/handlers/communication.handler.ts` | TypeScript | Communication sync handler |

## Appendix D: Proposed Timeline

| Date | Milestone |
|---|---|
| 2026-03-09 | Spec v2.0 delivered to Pavel for review |
| 2026-03-14 | Pavel feedback / Q&A call |
| 2026-03-21 | CodeSystem + SearchParameter registration in Aidbox sandbox |
| 2026-03-28 | First Consent sync (dev environment) |
| 2026-04-04 | Goal + Communication sync (dev environment) |
| 2026-04-11 | End-to-end ACP workflow testing |
| 2026-04-25 | Production deployment |

---

*This document is a living spec. Questions and feedback should be directed to blaine@co-op.care. All resource examples use fictional patient data.*
