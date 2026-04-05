# Galaxy Watch + MCP Server Strategy for co-op.care

**Prepared: March 9, 2026**
**Status: STRATEGIC FRAMEWORK — Pre-Build**

---

## The Story in One Sentence

Samsung and Verily build the sensors. Google provides the data layer. co-op.care provides the human who puts the watch on grandma's wrist, reads the alerts, and actually shows up.

---

## Why Galaxy Watch (Not Apple Watch)

| Factor | Apple Watch | Galaxy Watch |
|--------|------------|--------------|
| **Target demographic** | iPhone-dependent (wealthy, younger) | Android-compatible (broader, more affordable) |
| **Elderly adoption** | Complex pairing, small crown UI | Larger display, simpler Android ecosystem |
| **FDA-cleared features** | ECG, AFib, fall detection, SpO2 | ECG, AFib, sleep apnea, SpO2, body composition, skin temp |
| **Clinical research** | Apple Health Records (limited) | **Verily Pre platform** — FHIR-native, AI-ready, research-grade |
| **Developer ecosystem** | HealthKit (Apple-only, on-device) | Samsung Health SDK + **Google Health Connect** (open Android standard) |
| **RPM viability** | Requires iPhone + Apple Watch | Galaxy Watch + any Android phone (lower barrier) |
| **Partnership leverage** | Apple doesn't partner with startups | Samsung + Verily actively recruiting clinical partners |
| **Cost** | $399+ (Series 10) | $279+ (Watch 7), Watch FE even lower |

**CareOS currently supports Apple Watch only.** The strategic move is to make Galaxy Watch the PRIMARY device and maintain Apple Watch as secondary.

---

## The Three-Layer Architecture

```
┌──────────────────────────────────────────────────────┐
│  LAYER 3: co-op.care (THE HUMAN LAYER)               │
│  ┌─────────────────────────────────────────────┐     │
│  │  CareOS Platform                            │     │
│  │  ├── Sage AI (care companion)               │     │
│  │  ├── VitalsDashboard (anomaly detection)    │     │
│  │  ├── Conductor workflows (escalation)       │     │
│  │  └── FHIR R4 (Aidbox observation store)     │     │
│  └──────────────────┬──────────────────────────┘     │
│                     │ MCP Server                      │
│                     │ (Model Context Protocol)        │
├─────────────────────┼────────────────────────────────┤
│  LAYER 2: DATA HARMONIZATION                         │
│  ┌──────────────────┴──────────────────────────┐     │
│  │  Google Health Connect (unified Android API) │     │
│  │  + Verily Pre / Refinery (FHIR curation)    │     │
│  └──────────────────┬──────────────────────────┘     │
├─────────────────────┼────────────────────────────────┤
│  LAYER 1: SENSOR HARDWARE                            │
│  ┌──────────────────┴──────────────────────────┐     │
│  │  Samsung Galaxy Watch 7/8/Ultra              │     │
│  │  BioActive Sensor: PPG, ECG, BIA, temp      │     │
│  │  FDA-cleared: AFib, sleep apnea, SpO2       │     │
│  └─────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────┘
```

---

## Samsung SDK Landscape (Current as of March 2026)

### 1. Samsung Health Sensor SDK (Galaxy Watch Direct)
- **What:** Direct access to BioActive Sensor on Galaxy Watch 4+
- **Data:** Raw PPG, ECG signals, heart rate + inter-beat intervals, SpO2, body composition, skin temp
- **Access:** Requires Samsung partnership approval
- **Use case for co-op.care:** Real-time alerting (fall detection, AFib episode, SpO2 drop)
- **Platform:** Wear OS (runs ON the watch)

### 2. Samsung Health Data SDK (Phone-Side)
- **What:** Access Samsung Health app's data store on the paired Android phone
- **Data:** All aggregated health data from Galaxy Watch, Galaxy Ring, third-party devices
- **Access:** Requires partnership request to Samsung
- **Use case for co-op.care:** Historical data pull, trend analysis, baseline calculation
- **Note:** Samsung Health SDK for Android was **deprecated July 31, 2025** — must use this newer SDK

### 3. Google Health Connect (Android Standard)
- **What:** Unified health data API for all Android devices (replaced Google Fit)
- **Data:** HR, steps, sleep sessions, skin temp, exercise routes, SpO2, and now FHIR medical records (Android 16+)
- **Access:** Open Android SDK (no partnership required)
- **Use case for co-op.care:** **PRIMARY data access path** — Samsung Health syncs to Health Connect automatically
- **Advantage:** Also captures data from Fitbit, Google Fit, other Wear OS devices
- **Key fact:** Google Fit REST API being deprecated 2026. Health Connect is THE path forward.

### Recommended Integration Path

```
Galaxy Watch → Samsung Health (auto-sync) → Health Connect → co-op.care MCP Server
                                                                    ↓
                                                              FHIR Observations
                                                                    ↓
                                                              Aidbox / CareOS
```

**Phase 1:** Google Health Connect SDK (open, no partnership needed, broadest device support)
**Phase 2:** Samsung Health Data SDK (deeper Samsung-specific data, requires partnership)
**Phase 3:** Samsung Health Sensor SDK (real-time watch-side alerts, requires deeper partnership)

---

## Verily Pre Platform — Partnership Positioning

### What Verily Pre Does
- **Refinery:** Ingests raw wearable + medical data → harmonizes into FHIR-native, AI-ready datasets
- **Exchange:** Marketplace for AI-ready health datasets and models
- **Workbench:** Trusted research environment with NVIDIA GPU-accelerated analytics
- **Viewpoint Evidence:** Real-world study platform with re-contactable participant cohorts

### The Samsung-Verily Collaboration (Announced March 9, 2026)
- Galaxy Watch 8 sensor data fully integrated into Verily Pre
- Research sponsors can access longitudinal datasets: Samsung sensor data + medical records + surveys
- Verily recruits Samsung users for research participation
- Focus: sleep, activity, health outcomes with individual-level activation

### What co-op.care Brings That Verily Doesn't Have

Verily has the data platform. Samsung has the hardware. Neither has:

1. **The human in the home.** A caregiver who physically helps a 78-year-old put on the watch, charge it, and understand what the alerts mean.
2. **Continuous relationship context.** "Mrs. Johnson's resting HR jumped 15 bpm" means nothing without knowing she just lost her husband, stopped walking, and isn't eating.
3. **Action on the alert.** Verily can flag an anomaly. co-op.care's caregiver can show up and take her to the doctor.
4. **Companion care data.** Care logs, mood observations, meal prep notes, activity participation — the unstructured human data that makes sensor data clinically meaningful.
5. **RPM billing infrastructure.** Neither Samsung nor Verily bills Medicare. co-op.care (with a clinical director) can.

### Partnership Pitch to Verily

"Verily's Pre platform makes wearable data research-grade. co-op.care makes it actionable. We're the community-based care organization that provides the last mile: putting the Galaxy Watch on elderly patients, maintaining consistent caregiver relationships (38% turnover vs. 82% industry), and generating the companion care context that turns sensor signals into clinical insight. Together, we close the loop from data collection to human intervention."

### What We'd Ask Verily For
1. **API access to Pre/Refinery** — harmonized FHIR observations from Galaxy Watch data
2. **Research cohort participation** — co-op.care's elderly clients as a consented study population
3. **Co-marketing** — "Powered by Verily Pre" on co-op.care's health monitoring features
4. **Data model alignment** — ensure co-op.care's companion care observations are Pre-compatible

---

## MCP Server Architecture

### What the MCP Server Does

The Model Context Protocol (MCP) server bridges wearable health data into CareOS's Sage AI, giving the care companion real-time health context for every conversation.

### MCP Server: `@careos/wearable-mcp`

```
┌───────────────────────────────────────────┐
│  MCP Server: @careos/wearable-mcp         │
│                                           │
│  Tools:                                   │
│  ├── get_vitals(patient_id, metric, range)│
│  │   → Returns FHIR Observations          │
│  ├── get_anomalies(patient_id, window)    │
│  │   → Flags readings >2 SD from baseline │
│  ├── get_trends(patient_id, metric, days) │
│  │   → 7/30/90-day trend analysis         │
│  ├── get_risk_score(patient_id)           │
│  │   → 72-96hr hospitalization risk       │
│  ├── get_device_status(patient_id)        │
│  │   → Battery, last sync, data gaps      │
│  └── get_care_context(patient_id)         │
│      → Merges vitals + care logs + CII    │
│                                           │
│  Resources:                               │
│  ├── vitals://latest/{patient_id}         │
│  ├── anomalies://active/{patient_id}      │
│  ├── device://status/{patient_id}         │
│  └── baseline://summary/{patient_id}      │
│                                           │
│  Data Sources:                            │
│  ├── Aidbox FHIR R4 (observations)        │
│  ├── Health Connect (real-time sync)      │
│  ├── Samsung Health Data SDK (enriched)   │
│  └── CareOS care logs (context)           │
└───────────────────────────────────────────┘
```

### How Sage Uses the MCP Server

**Before MCP (current):**
> User: "How is Mom doing?"
> Sage: "Based on your care logs, your mother had a good week. She enjoyed the garden walk on Tuesday."

**After MCP (with Galaxy Watch data):**
> User: "How is Mom doing?"
> Sage: "Your mother's resting heart rate has been slightly elevated this week (78 bpm vs. her 30-day average of 68). Her sleep has also been shorter — averaging 5.2 hours instead of her usual 6.8. Her step count is down 30%. These changes together suggest she may be experiencing increased stress or discomfort. Her caregiver Maria noted she's been less interested in meals. I'd recommend mentioning this pattern to her doctor. Would you like me to help prepare a summary for her next appointment?"

### MCP Server Data Flow

```
Galaxy Watch → Samsung Health → Health Connect → [Sync Service] → Aidbox FHIR
                                                                      ↓
Sage AI ←── MCP Server ←── FHIR Observation queries ←──────── Aidbox FHIR
   ↓                                                              ↑
   ↓                                                     Care logs, CII scores
   ↓
Family member conversation with real health context
```

---

## RPM Reimbursement Model

### 2026 CPT Codes for Remote Patient Monitoring

| Code | Description | Rate | Frequency |
|------|-------------|------|-----------|
| **99453** | Device setup + patient education | ~$22 | One-time per enrollment |
| **99454** | Device supply, 16+ days data/month | ~$47 | Monthly |
| **99445** | Device supply, 2-15 days data/month *(new 2026)* | ~$50 | Monthly |
| **99457** | First 20 min clinical review/month | ~$52 | Monthly |
| **99458** | Each additional 20 min review | ~$40 | Monthly (add-on) |
| **99470** | 10-min management *(new 2026)* | ~$26 | Monthly (cannot combine with 99454/99457) |

### co-op.care RPM Revenue Per Patient

**Scenario: Elderly patient with Galaxy Watch, Medicare beneficiary**

| Code | Monthly | Annual |
|------|---------|--------|
| 99453 (setup) | $22 (month 1 only) | $22 |
| 99454 (device, 16+ days) | $47 | $564 |
| 99457 (20 min review) | $52 | $624 |
| 99458 (additional 20 min) | $40 | $480 |
| **Total per patient** | **~$139/mo** (after month 1: $161) | **~$1,690** |

### Revenue Projection

| Patients | Monthly RPM Revenue | Annual RPM Revenue |
|----------|--------------------|--------------------|
| 20 | $2,780 | $33,360 |
| 50 | $6,950 | $83,400 |
| 100 | $13,900 | $166,800 |
| 200 | $27,800 | $333,600 |

**This is NET NEW revenue on top of companion care fees.** A patient paying $27/hr for 10 hrs/week companion care ($1,170/mo) ALSO generates $139/mo in RPM reimbursement — a 12% revenue uplift with minimal marginal cost.

### RPM Requirements
- **Requires:** Medicare-enrolled ordering physician (Josh Emdur, DO)
- **Clinical staff** can perform the 20-min monthly review under general supervision
- **Galaxy Watch qualifies** as an RPM device if data transmits daily recordings/alerts
- **New 2026 rule:** Only 2 days of data needed (down from 16) for 99445 — lowers the bar for intermittent wearers
- **Can stack with:** CCM (99487-99490), TCM (99495-99496), BHI (99484, 99492-99494)

### The 2026 Window

The new 99445 code (2-15 days of data) is designed for **exactly this use case**: episodic monitoring during post-discharge transition. BCH discharges a patient → co-op.care caregiver helps them set up Galaxy Watch → even partial data qualifies for reimbursement → caregiver monitors and escalates.

---

## CareOS Codebase Changes Required

### Phase 1: Multi-Device Support (Galaxy Watch Primary)

| File | Change |
|------|--------|
| `src/shared/constants/loinc-codes.ts` | Add `samsungHealthKey` alongside `appleHealthKey`. Add Galaxy Watch-specific metrics (skin temp, body composition, sleep apnea risk). |
| `src/client/features/conductor/WearableSetup.tsx` | Expand from Apple Watch-only to device selection (Galaxy Watch, Apple Watch, Fitbit). Galaxy Watch as default/recommended. Update pairing flow for Android/Health Connect. |
| `src/client/features/conductor/VitalsDashboard.tsx` | Add Samsung-specific data source indicators. Support additional Galaxy Watch metrics. |

### Phase 2: MCP Server

| File | Change |
|------|--------|
| `src/server/mcp/wearable-server.ts` *(new)* | MCP server implementation with 6 tools + 4 resources |
| `src/server/mcp/wearable-tools.ts` *(new)* | Tool handlers: get_vitals, get_anomalies, get_trends, get_risk_score, get_device_status, get_care_context |
| `src/server/services/health-connect-sync.ts` *(new)* | Health Connect data sync service (Android-side, pushes to Aidbox) |
| `src/client/features/sage/SageChat.tsx` | Wire Sage to MCP server — inject health context into care conversations |

### Phase 3: RPM Billing Integration

| File | Change |
|------|--------|
| `src/server/services/rpm-tracker.ts` *(new)* | Track data transmission days, management minutes, billing eligibility per patient per month |
| `src/client/features/billing/RPMDashboard.tsx` *(new)* | Admin view: eligible patients, data days, management time, billable codes |
| `src/shared/constants/cpt-codes.ts` *(new)* | RPM CPT codes with 2026 rates and rules |

---

## Partnership Approach (Who to Contact)

### Samsung Health
- **What:** Samsung Health SDK partnership approval + potential co-development
- **Who:** Samsung Health Developer Relations (developer.samsung.com/health)
- **Ask:** Partnership approval for Samsung Health Data SDK + Sensor SDK access
- **Pitch:** "Worker-owned home care cooperative deploying Galaxy Watch as standard equipment for elderly companion care. 200+ member cooperative model with 38% turnover (vs 82% industry). Clinical research potential with consented elderly population."
- **Timeline:** Apply for partnership now. 4-6 week approval typical.

### Verily
- **What:** Pre platform API access + potential research collaboration
- **Who:** Verily partnerships (verily.com)
- **Ask:** API access to Pre/Refinery for harmonized Galaxy Watch data. Explore research cohort collaboration.
- **Pitch:** See "Partnership Pitch to Verily" section above.
- **Timeline:** Exploratory conversation Q2 2026. Requires co-op.care to be operational with patients.

### Google Health
- **What:** Health Connect is open — no partnership needed for basic integration
- **Who:** N/A for Health Connect SDK (open). Google Health team for deeper collaboration.
- **Note:** Health Connect is the path of least resistance. Start here, no gates.

---

## Build Sequence

| Phase | What | Timeline | Dependency |
|-------|------|----------|------------|
| **0** | Apply for Samsung Health SDK partnership | Now | None |
| **1a** | Expand `loinc-codes.ts` with Samsung Health keys | Week 1 | None |
| **1b** | Expand `WearableSetup.tsx` to multi-device | Week 1-2 | 1a |
| **1c** | Update `VitalsDashboard.tsx` for Galaxy Watch | Week 2 | 1a |
| **2a** | Build MCP server (`wearable-server.ts`) | Week 2-3 | 1a |
| **2b** | Build MCP tools (`wearable-tools.ts`) | Week 3 | 2a |
| **2c** | Wire Sage to MCP server | Week 3-4 | 2a, 2b |
| **3a** | Health Connect sync service | Week 4-5 | Samsung partnership |
| **3b** | RPM tracking service | Week 5-6 | 2a |
| **3c** | RPM billing dashboard | Week 6 | 3b |
| **4** | Verily Pre integration (if API available) | Month 3+ | Verily partnership |

---

## The Competitive Moat

**Why co-op.care + Galaxy Watch is defensible:**

1. **No one else has the caregiver.** Verily has data. Samsung has hardware. Home care agencies have high turnover. co-op.care has consistent, relationship-based caregivers who know the patient.

2. **Cooperative retention = data continuity.** 38% turnover means the same caregiver sees the same patient for months/years. That caregiver knows when "elevated HR" is because Mrs. Johnson's daughter didn't call, not because she's having a cardiac event. This context cannot be replicated by a sensor.

3. **RPM + companion care stacking.** No other companion care provider is building RPM billing on top of hourly care fees. The 12% revenue uplift makes co-op.care's unit economics better than any traditional agency.

4. **The Verily research play.** A consented elderly population with continuous wearable data AND daily caregiver observations is extremely valuable for clinical research. Verily's Pre platform needs exactly this kind of data.

5. **Galaxy Watch is cheaper.** At $279 (vs $399+ for Apple Watch), the device cost can be subsidized or included in care packages. At scale, Samsung may co-fund device deployment for the research value.

---

## Key Questions to Resolve

1. **Samsung partnership approval timeline** — How long to get Samsung Health Data SDK + Sensor SDK access?
2. **Health Connect on older Android** — What % of elderly patients' Android phones support Health Connect? (Android 14+ native, 13 requires install)
3. **Verily API access** — Is Pre platform API available to non-research customers? Or only through Viewpoint Evidence studies?
4. **RPM clinical oversight** — Can Josh Emdur, DO serve as the ordering physician for RPM at scale? What's the patient-to-physician ratio CMS allows?
5. **Device cost model** — Include Galaxy Watch in care package (amortized over contract)? Or require family to purchase?
6. **Class B license scope** — Does Colorado Class B companion care license allow caregivers to assist with medical device setup? Or does this require Class A?

---

## References

- [Samsung Health Data SDK](https://developer.samsung.com/health/data/overview.html)
- [Samsung Health Sensor SDK](https://developer.samsung.com/health/sensor/overview.html)
- [Samsung Health → Health Connect Blog](https://developer.samsung.com/health/blog/en/accessing-samsung-health-data-through-health-connect)
- [Google Health Connect](https://developer.android.com/health-and-fitness/health-connect)
- [Verily Pre Platform](https://verily.com/solutions/pre-platform)
- [Verily + Samsung Announcement](https://verily.com/perspectives/verily-and-samsung-collaborate-to-accelerate-clinical-research-with-the-galaxy-watch-and-pre-platform)
- [RPM CPT Codes 2026 — Tenovi](https://www.tenovi.com/rpm-cpt-codes-2026/)
- [RPM CPT Codes 2026 — Prevounce](https://blog.prevounce.com/2026-remote-patient-monitoring-cpt-codes-whats-new-and-what-to-know)
- [CMS 2026 RPM Updates — Nixon Law Group](https://www.nixonlawgroup.com/resources/cms-finalizes-2026-remote-monitoring-reimbursement-updates-what-changed-for-rpm-and-rtm)
- [RPM Billing Overview — HealthSnap](https://healthsnap.io/resources/rpm-billing-overview/)
- [HHS Telehealth RPM Billing](https://telehealth.hhs.gov/providers/best-practice-guides/telehealth-and-remote-patient-monitoring/billing-remote-patient)
