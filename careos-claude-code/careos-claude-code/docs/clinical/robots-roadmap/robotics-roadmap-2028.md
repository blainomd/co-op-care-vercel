# co-op.care: Autonomous Companion Robotics Roadmap
## Community-Owned Robots as a Cooperative Asset (2028+)

---

## The Thesis

When autonomous home companions (Tesla Optimus, Figure, 1X NEO, Agility Digit) become commercially available for home deployment, every home care company will face the same question: who owns the robots and who captures the labor savings?

- **Corporations** will deploy robots and pocket the margin — replacing $25/hr workers with $3/hr amortized machine cost
- **Individual families** can't afford $20,000-50,000 units
- **A cooperative** leases robots as a shared community asset. The same unit serves multiple members. Worker-owners supervise and complement the robots. The community owns the fleet. The labor savings stay in the cooperative — funding better wages, lower member costs, and expanded access

**The cooperative structure is the only ownership model where autonomous companions benefit both the worker and the family.**

---

## The Governance Framework (Extending CareOS)

co-op.care already has the AI governance infrastructure:
- Graduated autonomy levels (L1-L5) with cooperative board vote on advancement
- Physician oversight on clinical-adjacent activities
- Human-in-the-loop requirement on all consequential decisions
- Colorado AI Act (SB 24-205) compliance architecture

Extend this to physical robots:

### Autonomy Levels for Home Companions

| Level | Robot Can Do Autonomously | Requires Human Co-Presence | Requires Worker-Owner Direction |
|-------|--------------------------|---------------------------|-------------------------------|
| L1 | Environmental monitoring (temp, humidity, air quality), security alerts, fall detection alerts | — | — |
| L2 | Companionship conversation, medication reminders (verbal only), daily schedule prompts, video call facilitation for Conductor | — | — |
| L3 | Fetch/carry objects, simple housekeeping (tidying, dishes to sink), pet feeding, plant watering | Trained family member or Time Bank neighbor present | — |
| L4 | Mobility escort (walking alongside), meal delivery from kitchen to table, laundry transport, garbage/recycling | Worker-owner caregiver present and supervising | — |
| L5 | Transfer assistance (bed-to-chair with human co-lift), bathing preparation, dressing assistance | Worker-owner physically co-performing the task | Medical Director protocol approval |

**The cooperative board votes on which levels are activated.** Not management. Not investors. Not the robot manufacturer. The worker-owners who will work alongside these machines decide how autonomous they are.

---

## The Community Fleet Model

### How It Works

```
co-op.care purchases or leases a fleet of companion robots
    ↓
Fleet is owned by the cooperative (community asset)
    ↓
Units are scheduled across member homes via CareOS
    ↓
Morning: Robot at Member A's home (companionship + monitoring)
Afternoon: Robot at Member B's home (housekeeping assist + fall detection)
Evening: Robot at Member C's home (overnight monitoring + emergency alert)
    ↓
Worker-owners supervise L3-L5 activities during their care visits
Time Bank neighbors can earn credits by providing L3 oversight
The Conductor monitors robot activity on her dashboard
    ↓
Maintenance, charging, and logistics managed by cooperative ops team
```

### Economics

| Model | Unit Cost | Annual Amortization | Hours Deployed/Day | Cost Per Member-Hour |
|-------|-----------|--------------------|--------------------|---------------------|
| Individual family purchase | $30,000-50,000 | $6,000-10,000/yr | 12-16 (one home) | $1.50-2.50 |
| Corporate fleet (extractive) | $25,000 (volume) | $5,000/yr | 16-20 (multi-home) | $0.80-1.20 |
| **Cooperative community fleet** | **$25,000 (volume)** | **$5,000/yr** | **16-20 (multi-home)** | **$0.80-1.20** |

The per-hour economics are identical between corporate and cooperative fleets. The difference: in the corporate model, the $24/hr labor savings per robot-hour goes to shareholders. In the cooperative model, it funds:
- Lower member costs
- Higher worker-owner wages for supervision and complementary tasks
- Expanded access to families who couldn't afford full human-only care
- Cooperative surplus distributed as patronage dividends

### The Time Bank Integration

Time Bank neighbors can earn credits by providing human oversight for L3 robot activities:
- "I sat with Mom while the robot helped tidy the living room" = 1 hour credit
- "I was present while the robot escorted Mom on her daily walk in the backyard" = 0.5 hour credit
- "I monitored the robot's overnight companion shift via the dashboard" = remote oversight credit

This creates a new category of Time Bank participation: **robot supervision as community service.** Lower physical demand than traditional caregiving. Accessible to neighbors who can't do heavy ADL tasks. Expands the Time Bank participant pool.

---

## The Worker-Owner Relationship

**Critical: robots complement workers, they don't replace them.**

The "AI-powered platform, AI-proof careers" thesis extends directly:
- Anthropic's March 2025 research: physical caregiving has 5% automation exposure — the lowest of any occupation
- Robots handle the repetitive, physical, and monitoring tasks that cause worker burnout
- Workers handle the relationship, clinical observation, judgment, and intimate personal care that robots cannot
- Worker-owners who supervise robots earn MORE per hour (supervision premium) not less
- The cooperative board controls the pace of robot deployment — workers are never surprised by automation

### The Complementary Task Matrix

| Task | Human Worker-Owner | Robot Companion | Together |
|------|-------------------|-----------------|----------|
| Bathing | Performs the task with dignity | Prepares bathroom, manages water temp, holds supplies | Worker focuses on person, robot handles logistics |
| Transfers | Co-performs with proper body mechanics | Provides mechanical assist (L5, worker co-present) | Reduces worker injury risk, safer for member |
| Medication | Clinical judgment, administration | Verbal reminders, tracks compliance, alerts Conductor | Worker handles complex regimens, robot handles routine |
| Companionship | Emotional connection, conversation, relationship | Consistent presence during off-hours, activity suggestions | Worker provides depth, robot provides continuity |
| Monitoring | Clinical observation, change-in-condition detection | 24/7 environmental monitoring, fall detection, vital signs | Worker catches subtle clinical changes, robot catches physical events |
| Housekeeping | Deep cleaning, organization, laundry | Light tidying, dish transport, trash, surface cleaning | Worker does weekly deep clean, robot maintains daily |
| Night shift | Expensive, disruptive to worker's life | Overnight monitoring with emergency alert to worker on-call | Member has 24/7 coverage without paying for overnight human shift |

**The overnight monitoring use case alone justifies the fleet.** A human overnight shift costs $200-300/night. A robot overnight monitoring shift costs $10-15/night in amortized fleet cost. For families who need 24/7 coverage, this drops annual care costs by $50,000-75,000.

---

## Regulatory Considerations

### Colorado AI Act (SB 24-205)
- Physical robots in healthcare settings are "high-risk AI systems" making "consequential decisions"
- co-op.care's graduated autonomy framework already satisfies the human-in-the-loop requirement
- Impact assessments must include physical safety analysis for robot-assisted tasks
- Consumer disclosure: families must be informed before robot companion is deployed
- The cooperative board vote on autonomy levels satisfies the democratic governance requirement

### Liability
- Beazley Virtual Care policy covers technology errors — extends to robotic system failures
- Armilla AI warranty covers AI performance — extends to robot decision-making errors
- Workers' comp covers worker injuries during robot co-task activities
- Product liability for robot hardware defects rests with manufacturer (Tesla, Figure, etc.)
- Cooperative umbrella covers general liability for robot-related property damage

### HIPAA
- Robot sensors collecting health data (gait analysis, fall detection, vital signs) are PHI
- Data flows through CareOS → Aidbox FHIR pipeline → same privacy architecture as voice notes
- Robot does not store data locally — streams to cooperative's encrypted infrastructure
- Member consent required before robot deployment (part of care plan, physician-approved)

---

## Deployment Timeline

| Phase | Timeline | What Happens |
|-------|----------|-------------|
| **Watch** | 2026-2027 | Monitor Optimus, Figure, 1X pricing and availability. Engage with Tesla's commercial deployment team. Build robotics governance framework into CareOS. |
| **Pilot** | 2028 | Lease 2-3 units for controlled pilot with willing founding families. L1-L2 autonomy only (monitoring + companionship). Worker-owners trained on supervision. Board votes on pilot scope. |
| **Evaluate** | 2028-2029 | Measure: member satisfaction, worker satisfaction, cost reduction, safety incidents, family peace of mind. Conductor dashboard integration. Time Bank supervision pilot. |
| **Scale** | 2029-2030 | Expand fleet to 10-20 units across Boulder cooperative. Advance to L3-L4 with board approval. Publish outcomes data for federation replication. |
| **Federate** | 2030+ | Fleet management becomes a federation service. Louisville, Longmont, Fort Collins cooperatives share fleet logistics, maintenance, and governance frameworks. |

---

## The Investor Slide (2028+ Vision)

"When autonomous companions become commercially available, the cooperative is the only structure where a community owns the robots instead of a corporation owning the labor savings. The cooperative board — not executives, not investors — decides how fast automation advances. Worker-owners are complemented, not replaced. Families get 24/7 coverage at a fraction of overnight shift costs. And the same AI governance framework we built for clinical documentation extends naturally to physical robots. This isn't science fiction — Tesla is targeting home deployment of Optimus by 2027. We're building the governance, the workforce model, and the community ownership structure now, so we're ready when the hardware arrives."

---

## The One Paragraph for the Federation Roadmap

"Phase 4 (2028+): As autonomous home companions reach commercial availability, co-op.care deploys a community-owned robot fleet as a cooperative asset — shared across member homes, supervised by worker-owners and Time Bank neighbors, governed by cooperative board vote on autonomy levels. Robots handle overnight monitoring, environmental maintenance, and routine physical tasks. Humans handle relationships, clinical observation, judgment, and intimate care. The cooperative captures the labor savings that would otherwise flow to robot manufacturers or corporate deployers, using them to fund lower member costs, higher worker wages, and expanded access. The federation's governance framework, AI safety architecture, and workforce model make it the natural institutional home for community-owned autonomous care."
