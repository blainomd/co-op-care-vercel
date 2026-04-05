# Snapdragon Wear Elite — Elder Care Relevance for co-op.care

**Date saved:** March 10, 2026
**Source:** Qualcomm Snapdragon Wear Elite platform briefing
**Relevance:** RPM billing layer, wearable MCP server, Care Navigator safety tools

---

## Why This Matters for co-op.care

The Snapdragon Wear Elite shifts wearables from "passive tracking" to "proactive assistance" — which maps directly to our 4-layer safety model and RPM billing strategy. Key overlaps:

| Snapdragon Feature | co-op.care Application | Revenue Layer |
|---|---|---|
| Continuous vitals (50+ sensors) | RPM billing (99457/99458) — requires 16+ days/month data | Medicare RPM |
| Fall detection (on-device ML) | Layer 3: Environmental Safety | Reduces liability risk |
| Vertical location (floor-level E911) | Critical for multi-story senior housing | Safety differentiation |
| Brain health / cognitive monitoring | CII assessment correlation — early decline detection | CRI scoring input |
| On-device processing (Hexagon NPU) | HIPAA advantage — PHI stays on device, not cloud | Compliance cost reduction |
| Satellite connectivity (Skylo NB-NTN) | Rural/dead-zone emergency coverage | Geographic expansion |
| Multi-day battery + 10-min fast charge | "Always-worn" viability for seniors | Adoption/compliance |

---

## Platform Capabilities

### Safety and Emergency Response
- **Vertical Location Accuracy:** Bosch BMP585 pressure sensors provide z-axis data (which floor). Critical for E911 response during falls.
- **Advanced Fall Detection:** Smart inertial module with on-device ML distinguishes actual falls from normal movement in real time.
- **Satellite Connectivity:** Skylo NB-NTN two-way emergency messaging — works without cellular or Wi-Fi.

### Cognitive Health and Memory Support
- **Dementia/Brain Health Monitoring:** Analyzes speech patterns, typing speed, walking gait, sleep quality for early cognitive decline detection.
- **Life Logging as Memory Aid:** On-device AI retrieval — "where did I leave my keys?" from local multimodal memory log.

### Proactive Health Monitoring
- **50+ sensor support:** Blood oxygen, heart rate, temperature, fatigue levels. Continuous without rapid battery drain.
- **On-Device Privacy:** Hexagon NPU processes health data locally — no cloud required for sensitive data. Major HIPAA advantage.

### Accessibility
- **ASL-to-speech translation:** Real-time on-device. Relevant for diverse care teams.
- **Multi-day battery:** Always-worn viability. 50% charge in 10 minutes.

---

## Integration Notes for CareOS

### Current state
- Galaxy Watch is primary target device (see `loinc-codes.ts`)
- Wearable MCP server (`src/server/modules/wearable-mcp/`) queries Aidbox FHIR for readings
- `monitors` relation table in PostgreSQL schema tracks user→care_recipient device assignments
- RPM billing requires 16+ data transmission days/month

### What Snapdragon adds
- On-device ML means the watch can pre-classify readings before sending to CareOS — reduces data volume, improves signal quality
- Floor-level location makes the GPS check-in/check-out system more precise (PostGIS currently only does lat/lon)
- Cognitive monitoring data could feed directly into CRI risk scores
- Satellite fallback means RPM billing compliance even in rural areas (no missed transmission days due to connectivity)

### Timeline
- Phase 1 (now): Galaxy Watch via Samsung Health SDK
- Phase 2 (Month 6+): Evaluate Snapdragon Wear Elite devices as they ship
- Phase 3: Multi-device support — abstract the wearable MCP server to handle both platforms
