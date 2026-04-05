/**
 * Demo Data Seeder — 12 realistic families across all triage tiers
 *
 * Populates the full agent pipeline so Josh can experience the dashboard
 * with actual cases. Each family has a realistic clinical profile, assessment
 * scores, and LMN draft that flows through the auto-approval triage.
 *
 * Distribution (mirrors expected production mix):
 * - 7 auto_approved  (~58%) — routine, moderate acuity
 * - 2 quick_review   (~17%) — minor flags, Josh glances 30 sec
 * - 2 full_review    (~17%) — significant concern, 3-5 min read
 * - 1 clinical_hold  (~8%)  — multi-system, clinical decision needed
 */
import { eventBus } from './event-bus.js';
import { updateProfile } from './profile-builder.agent.js';
import { advanceJourney } from './care-journey.js';
import { logger } from '../common/logger.js';

// ─── Demo Family Data ────────────────────────────────────────────────────

interface DemoFamily {
  familyId: string;
  careRecipient: {
    name: string;
    age: number;
    state: string;
    conditions: string[];
    medications: string[];
    mobilityLevel: string;
    diagnosisCodes: string[];
    riskFlags: string[];
  };
  caregiver: {
    name: string;
    relationship: string;
  };
  cii: {
    physical: number;
    sleep: number;
    isolation: number;
    total: number;
    zone: 'green' | 'yellow' | 'red';
  };
  cri: {
    mobility: number;
    memory: number;
    dailyTasks: number;
    medications: number;
    social: number;
    total: number;
    acuity: 'low' | 'moderate' | 'high' | 'critical';
  };
  recommendedTier: string;
  recommendedHours: number;
  monthlyCost: number;
  hsaSavings: number;
  isRenewal: boolean;
  expectedTriage: string; // For logging/verification
}

const DEMO_FAMILIES: DemoFamily[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // AUTO-APPROVED (7) — Routine moderate cases, all gates pass
  // ═══════════════════════════════════════════════════════════════════════
  {
    familyId: 'demo-chen-family',
    careRecipient: {
      name: 'Margaret Chen',
      age: 76,
      state: 'CO',
      conditions: ['Mild cognitive impairment', 'Hypertension'],
      medications: ['Aricept 10mg', 'Lisinopril 20mg'],
      mobilityLevel: 'assisted',
      diagnosisCodes: ['G31.84', 'I10'],
      riskFlags: ['FALL_RISK_MODERATE'],
    },
    caregiver: { name: 'David Chen', relationship: 'son' },
    cii: { physical: 5, sleep: 3, isolation: 4, total: 12, zone: 'yellow' },
    cri: {
      mobility: 5,
      memory: 6,
      dailyTasks: 5,
      medications: 4,
      social: 5,
      total: 25,
      acuity: 'moderate',
    },
    recommendedTier: 'Regular Companion',
    recommendedHours: 8,
    monthlyCost: 832,
    hsaSavings: 291,
    isRenewal: false,
    expectedTriage: 'auto_approved',
  },
  {
    familyId: 'demo-johnson-family',
    careRecipient: {
      name: 'Robert Johnson',
      age: 72,
      state: 'TX',
      conditions: ['Type 2 Diabetes', 'Mild arthritis'],
      medications: ['Metformin 1000mg', 'Ibuprofen PRN'],
      mobilityLevel: 'independent',
      diagnosisCodes: ['E11.9', 'M19.90'],
      riskFlags: [],
    },
    caregiver: { name: 'Sarah Johnson', relationship: 'wife' },
    cii: { physical: 3, sleep: 2, isolation: 2, total: 7, zone: 'green' },
    cri: {
      mobility: 4,
      memory: 3,
      dailyTasks: 5,
      medications: 5,
      social: 6,
      total: 23,
      acuity: 'moderate',
    },
    recommendedTier: 'Peace of Mind',
    recommendedHours: 4,
    monthlyCost: 416,
    hsaSavings: 146,
    isRenewal: false,
    expectedTriage: 'auto_approved',
  },
  {
    familyId: 'demo-williams-family',
    careRecipient: {
      name: 'Dorothy Williams',
      age: 78,
      state: 'FL',
      conditions: ["Early-stage Alzheimer's", 'Osteoporosis'],
      medications: ['Donepezil 5mg', 'Calcium/Vitamin D', 'Alendronate 70mg'],
      mobilityLevel: 'assisted',
      diagnosisCodes: ['G30.0', 'M81.0'],
      riskFlags: ['FALL_RISK_MODERATE'],
    },
    caregiver: { name: 'James Williams', relationship: 'husband' },
    cii: { physical: 4, sleep: 4, isolation: 3, total: 11, zone: 'yellow' },
    cri: {
      mobility: 5,
      memory: 7,
      dailyTasks: 5,
      medications: 4,
      social: 5,
      total: 26,
      acuity: 'moderate',
    },
    recommendedTier: 'Regular Companion',
    recommendedHours: 10,
    monthlyCost: 1040,
    hsaSavings: 364,
    isRenewal: false,
    expectedTriage: 'auto_approved',
  },
  {
    familyId: 'demo-garcia-family',
    careRecipient: {
      name: 'Elena Garcia',
      age: 70,
      state: 'CA',
      conditions: ['Mild depression', 'Social isolation'],
      medications: ['Sertraline 50mg'],
      mobilityLevel: 'independent',
      diagnosisCodes: ['F32.0', 'Z60.2'],
      riskFlags: [],
    },
    caregiver: { name: 'Maria Garcia', relationship: 'daughter' },
    cii: { physical: 2, sleep: 3, isolation: 6, total: 11, zone: 'yellow' },
    cri: {
      mobility: 3,
      memory: 3,
      dailyTasks: 4,
      medications: 3,
      social: 8,
      total: 21,
      acuity: 'moderate',
    },
    recommendedTier: 'Peace of Mind',
    recommendedHours: 6,
    monthlyCost: 624,
    hsaSavings: 218,
    isRenewal: false,
    expectedTriage: 'auto_approved',
  },
  {
    familyId: 'demo-patel-family',
    careRecipient: {
      name: 'Raj Patel',
      age: 74,
      state: 'NJ',
      conditions: ['Post-hip replacement', 'Hypertension'],
      medications: ['Lisinopril 10mg', 'Aspirin 81mg', 'Acetaminophen PRN'],
      mobilityLevel: 'assisted',
      diagnosisCodes: ['Z96.641', 'I10'],
      riskFlags: ['FALL_RISK_MODERATE'],
    },
    caregiver: { name: 'Priya Patel', relationship: 'wife' },
    cii: { physical: 5, sleep: 3, isolation: 2, total: 10, zone: 'green' },
    cri: {
      mobility: 6,
      memory: 3,
      dailyTasks: 6,
      medications: 4,
      social: 4,
      total: 23,
      acuity: 'moderate',
    },
    recommendedTier: 'Regular Companion',
    recommendedHours: 8,
    monthlyCost: 832,
    hsaSavings: 291,
    isRenewal: false,
    expectedTriage: 'auto_approved',
  },
  {
    familyId: 'demo-anderson-renewal',
    careRecipient: {
      name: 'Betty Anderson',
      age: 80,
      state: 'AZ',
      conditions: ['Mild dementia', 'Controlled diabetes'],
      medications: ['Metformin 500mg', 'Memantine 10mg', 'Amlodipine 5mg'],
      mobilityLevel: 'assisted',
      diagnosisCodes: ['F03.90', 'E11.65'],
      riskFlags: [],
    },
    caregiver: { name: 'Tom Anderson', relationship: 'son' },
    cii: { physical: 3, sleep: 3, isolation: 3, total: 9, zone: 'green' },
    cri: {
      mobility: 4,
      memory: 5,
      dailyTasks: 5,
      medications: 4,
      social: 4,
      total: 22,
      acuity: 'moderate',
    },
    recommendedTier: 'Regular Companion',
    recommendedHours: 8,
    monthlyCost: 832,
    hsaSavings: 291,
    isRenewal: true,
    expectedTriage: 'auto_approved',
  },
  {
    familyId: 'demo-kim-family',
    careRecipient: {
      name: 'Soo-Jin Kim',
      age: 73,
      state: 'WA',
      conditions: ['Chronic back pain', 'Anxiety'],
      medications: ['Gabapentin 300mg', 'Buspirone 10mg'],
      mobilityLevel: 'assisted',
      diagnosisCodes: ['M54.5', 'F41.1'],
      riskFlags: [],
    },
    caregiver: { name: 'Michael Kim', relationship: 'son' },
    cii: { physical: 4, sleep: 4, isolation: 3, total: 11, zone: 'yellow' },
    cri: {
      mobility: 5,
      memory: 3,
      dailyTasks: 5,
      medications: 4,
      social: 5,
      total: 22,
      acuity: 'moderate',
    },
    recommendedTier: 'Peace of Mind',
    recommendedHours: 6,
    monthlyCost: 624,
    hsaSavings: 218,
    isRenewal: false,
    expectedTriage: 'auto_approved',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // QUICK REVIEW (2) — Minor flags, Josh glances 30 seconds
  // ═══════════════════════════════════════════════════════════════════════
  {
    familyId: 'demo-thompson-family',
    careRecipient: {
      name: 'Harold Thompson',
      age: 87,
      state: 'OH',
      conditions: ['Mild cognitive decline', 'Controlled COPD'],
      medications: ['Albuterol inhaler', 'Donepezil 5mg', 'Aspirin 81mg'],
      mobilityLevel: 'assisted',
      diagnosisCodes: ['G31.84', 'J44.9'],
      riskFlags: ['FALL_RISK_MODERATE'],
    },
    caregiver: { name: 'Linda Thompson', relationship: 'daughter' },
    cii: { physical: 4, sleep: 3, isolation: 3, total: 10, zone: 'green' },
    cri: {
      mobility: 5,
      memory: 5,
      dailyTasks: 5,
      medications: 4,
      social: 5,
      total: 24,
      acuity: 'moderate',
    },
    recommendedTier: 'Regular Companion',
    recommendedHours: 10,
    monthlyCost: 1040,
    hsaSavings: 364,
    isRenewal: false,
    expectedTriage: 'quick_review', // Age 87 > 85 threshold
  },
  {
    familyId: 'demo-martinez-family',
    careRecipient: {
      name: 'Carmen Martinez',
      age: 79,
      state: 'NM',
      conditions: ['Moderate arthritis', 'Hypertension', 'Hypothyroidism'],
      medications: [
        'Methotrexate 15mg',
        'Losartan 50mg',
        'Levothyroxine 75mcg',
        'Folic acid',
        'Calcium',
        'Omeprazole 20mg',
      ],
      mobilityLevel: 'assisted',
      diagnosisCodes: ['M06.9', 'I10', 'E03.9'],
      riskFlags: ['POLYPHARMACY'],
    },
    caregiver: { name: 'Rosa Martinez', relationship: 'daughter' },
    cii: { physical: 5, sleep: 4, isolation: 3, total: 12, zone: 'yellow' },
    cri: {
      mobility: 5,
      memory: 4,
      dailyTasks: 5,
      medications: 7,
      social: 4,
      total: 25,
      acuity: 'moderate',
    },
    recommendedTier: 'Regular Companion',
    recommendedHours: 10,
    monthlyCost: 1040,
    hsaSavings: 364,
    isRenewal: false,
    expectedTriage: 'quick_review', // 6 meds > 5 threshold + POLYPHARMACY flag
  },

  // ═══════════════════════════════════════════════════════════════════════
  // FULL REVIEW (2) — Significant clinical concerns, Josh reads 3-5 min
  // ═══════════════════════════════════════════════════════════════════════
  {
    familyId: 'demo-washington-family',
    careRecipient: {
      name: 'Charles Washington',
      age: 82,
      state: 'GA',
      conditions: ["Parkinson's disease", 'Depression', 'Fall history x3'],
      medications: ['Carbidopa-levodopa', 'Pramipexole', 'Sertraline', 'Melatonin'],
      mobilityLevel: 'wheelchair',
      diagnosisCodes: ['G20', 'F32.1', 'W19.XXXA'],
      riskFlags: ['FALL_RISK_SEVERE', 'WHEELCHAIR_DEPENDENT'],
    },
    caregiver: { name: 'Patricia Washington', relationship: 'wife' },
    cii: { physical: 7, sleep: 6, isolation: 5, total: 18, zone: 'yellow' },
    cri: {
      mobility: 8,
      memory: 6,
      dailyTasks: 7,
      medications: 5,
      social: 6,
      total: 32,
      acuity: 'moderate',
    },
    recommendedTier: 'Extended Companion',
    recommendedHours: 16,
    monthlyCost: 1664,
    hsaSavings: 582,
    isRenewal: false,
    expectedTriage: 'full_review', // G20 unusual dx + WHEELCHAIR_DEPENDENT + >12 hrs
  },
  {
    familyId: 'demo-baker-family',
    careRecipient: {
      name: 'Evelyn Baker',
      age: 88,
      state: 'PA',
      conditions: ['Heart failure', 'Chronic kidney disease stage 3', 'Atrial fibrillation'],
      medications: [
        'Furosemide 40mg',
        'Lisinopril 20mg',
        'Warfarin',
        'Metoprolol',
        'Potassium',
        'Digoxin 0.125mg',
      ],
      mobilityLevel: 'assisted',
      diagnosisCodes: ['I50.9', 'N18.3', 'I48.91'],
      riskFlags: ['FALL_RISK_SEVERE', 'POLYPHARMACY'],
    },
    caregiver: { name: 'Steven Baker', relationship: 'son' },
    cii: { physical: 6, sleep: 5, isolation: 4, total: 15, zone: 'yellow' },
    cri: {
      mobility: 6,
      memory: 5,
      dailyTasks: 7,
      medications: 8,
      social: 5,
      total: 31,
      acuity: 'moderate',
    },
    recommendedTier: 'Extended Companion',
    recommendedHours: 14,
    monthlyCost: 1456,
    hsaSavings: 510,
    isRenewal: false,
    expectedTriage: 'full_review', // I50.9 unusual dx + age 88 + 6 meds + >12 hrs
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLINICAL HOLD (1) — Multi-system, may exceed companion care scope
  // ═══════════════════════════════════════════════════════════════════════
  {
    familyId: 'demo-crawford-family',
    careRecipient: {
      name: 'Walter Crawford',
      age: 91,
      state: 'IL',
      conditions: [
        "Advanced Parkinson's",
        'Dysphagia',
        'Chronic pain syndrome',
        'Heart failure',
        'Frequent falls',
      ],
      medications: [
        'Carbidopa-levodopa',
        'Entacapone',
        'Oxycodone',
        'Furosemide',
        'Lisinopril',
        'Metoprolol',
        'Gabapentin',
        'Omeprazole',
      ],
      mobilityLevel: 'wheelchair',
      diagnosisCodes: ['G20', 'R13.10', 'G89.4', 'I50.9', 'W19.XXXA'],
      riskFlags: [
        'CRITICAL_FALL_RISK',
        'WHEELCHAIR_DEPENDENT',
        'SEVERE_MOBILITY',
        'POLYPHARMACY',
        'COLLAPSE_RISK',
      ],
    },
    caregiver: { name: 'Nancy Crawford', relationship: 'daughter' },
    cii: { physical: 9, sleep: 8, isolation: 7, total: 24, zone: 'red' },
    cri: {
      mobility: 10,
      memory: 7,
      dailyTasks: 9,
      medications: 9,
      social: 7,
      total: 42,
      acuity: 'critical',
    },
    recommendedTier: 'Full-Time Companion',
    recommendedHours: 30,
    monthlyCost: 3120,
    hsaSavings: 1092,
    isRenewal: false,
    expectedTriage: 'clinical_hold', // Everything fails: age 91, red CII, critical CRI, 4 unusual dx, 8 meds, many critical flags
  },
];

// ─── LMN Draft Text Generator ────────────────────────────────────────────

function generateDemoDraftText(f: DemoFamily): string {
  const today = new Date().toISOString().split('T')[0];
  return `LETTER OF MEDICAL NECESSITY

Date: ${today}
Patient: ${f.careRecipient.name}
Date of Birth: ${2026 - f.careRecipient.age}-01-15
Age: ${f.careRecipient.age}
State: ${f.careRecipient.state}

To Whom It May Concern:

I am writing to certify the medical necessity of companion care services for ${f.careRecipient.name}, a ${f.careRecipient.age}-year-old ${f.careRecipient.state} resident under my care.

CLINICAL ASSESSMENT:
${f.careRecipient.name} presents with the following conditions:
${f.careRecipient.conditions.map((c) => `  - ${c}`).join('\n')}

ICD-10 Diagnosis Codes: ${f.careRecipient.diagnosisCodes.join(', ')}

Current Medications (${f.careRecipient.medications.length}):
${f.careRecipient.medications.map((m) => `  - ${m}`).join('\n')}

FUNCTIONAL STATUS:
Mobility: ${f.careRecipient.mobilityLevel}
Care Recipient Index (CRI): ${f.cri.total}/50 — ${f.cri.acuity} acuity
  Mobility: ${f.cri.mobility}/10 | Memory: ${f.cri.memory}/10 | Daily Tasks: ${f.cri.dailyTasks}/10
  Medications: ${f.cri.medications}/10 | Social: ${f.cri.social}/10

CAREGIVER STATUS:
Primary Caregiver: ${f.caregiver.name} (${f.caregiver.relationship})
Caregiver Impact Index (CII): ${f.cii.total}/30 — ${f.cii.zone} zone
  Physical: ${f.cii.physical}/10 | Sleep: ${f.cii.sleep}/10 | Isolation: ${f.cii.isolation}/10

${f.cii.zone === 'red' ? 'WARNING: Caregiver is in CRISIS zone. Immediate respite support needed.\n' : ''}${f.careRecipient.riskFlags.length > 0 ? `RISK FLAGS: ${f.careRecipient.riskFlags.join(', ')}\n` : ''}
RECOMMENDED CARE PLAN:
Tier: ${f.recommendedTier}
Hours: ${f.recommendedHours} hours/week
Monthly Cost: $${f.monthlyCost}
Estimated HSA/FSA Savings: $${Math.round(f.hsaSavings)}/month (28-36% tax advantage)

MEDICAL NECESSITY DETERMINATION:
Based on the clinical assessment above, companion care services are medically necessary for ${f.careRecipient.name} to maintain functional independence, ensure medication compliance, prevent social isolation, and support caregiver ${f.caregiver.name} in sustaining their caregiving role.

These services qualify as medical expenses under IRS Publication 502 when prescribed by a licensed physician, making them eligible for HSA/FSA reimbursement.

Respectfully,

[Pending Physician Signature]
Joshua Emdur, DO
Medical Director, co-op.care
50-State Licensed Physician`;
}

// ─── Seed Function ───────────────────────────────────────────────────────

export async function seedDemoData(): Promise<{
  seeded: number;
  results: Array<{ familyId: string; name: string; expectedTriage: string; actualTriage?: string }>;
}> {
  logger.info('═══ Seeding Demo Data — 12 families ═══');

  const results: Array<{
    familyId: string;
    name: string;
    expectedTriage: string;
    actualTriage?: string;
  }> = [];

  for (const family of DEMO_FAMILIES) {
    const { familyId } = family;

    // 1. Create profile
    updateProfile(familyId, {
      name: family.careRecipient.name,
      age: family.careRecipient.age,
      state: family.careRecipient.state,
      conditions: family.careRecipient.conditions,
      medications: family.careRecipient.medications,
      mobilityLevel: family.careRecipient.mobilityLevel,
      caregiverName: family.caregiver.name,
      caregiverRelationship: family.caregiver.relationship,
      riskFlags: family.careRecipient.riskFlags,
    });

    // 2. Advance journey through stages
    advanceJourney(familyId, 'profiling', 'profile.updated');
    advanceJourney(familyId, 'assessing', 'profile.assessment_ready');
    advanceJourney(familyId, 'lmn_eligible', 'assessment.completed');
    advanceJourney(familyId, 'lmn_review', 'lmn.draft_created');

    // 3. Emit lmn.draft_created → Review Router picks up + runs auto-approve
    const draftId = `LMN-DEMO-${familyId}`;
    const draftText = generateDemoDraftText(family);

    await eventBus.emit({
      type: 'lmn.draft_created',
      familyId,
      source: 'demo-seed',
      payload: {
        draftId,
        draftText,
        reviewPriority:
          family.cri.acuity === 'critical'
            ? 'urgent'
            : family.cii.zone === 'red'
              ? 'urgent'
              : family.cii.zone === 'yellow'
                ? 'elevated'
                : 'standard',
        acuity: family.cri.acuity,
        criScore: family.cri.total,
        ciiScore: family.cii.total,
        ciiZone: family.cii.zone,
        recommendedTier: family.recommendedTier,
        recommendedHours: family.recommendedHours,
        monthlyCost: family.monthlyCost,
        estimatedHsaSavings: family.hsaSavings,
        diagnosisCodes: family.careRecipient.diagnosisCodes,
        omahaProblems: [],
        omahaProblemsCount: family.careRecipient.conditions.length,
        riskFlags: family.careRecipient.riskFlags,
        careRecipientName: family.careRecipient.name,
        careRecipientAge: family.careRecipient.age,
        careRecipientState: family.careRecipient.state,
        medicationCount: family.careRecipient.medications.length,
        isRenewal: family.isRenewal,
      },
      timestamp: new Date(),
    });

    results.push({
      familyId,
      name: family.careRecipient.name,
      expectedTriage: family.expectedTriage,
    });

    logger.info(
      { familyId, name: family.careRecipient.name, expectedTriage: family.expectedTriage },
      `Demo family seeded: ${family.careRecipient.name}`,
    );
  }

  logger.info(`═══ Demo seeding complete — ${results.length} families ═══`);
  return { seeded: results.length, results };
}
