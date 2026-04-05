/**
 * Sage Action Engine — Last Mile, Not Advice
 *
 * The bridge between Sage's conversation and co-op.care's actual services.
 * When Sage detects an intent, instead of just giving advice, it generates
 * actionable next steps that connect to real modules.
 *
 * The difference between an LLM and co-op.care:
 * we don't give advice, we deliver the last mile.
 */
import { logger } from '../../common/logger.js';

// ── Types ────────────────────────────────────────────────

export type SageActionType =
  | 'start_assessment'
  | 'schedule_visit'
  | 'order_meal'
  | 'recommend_product'
  | 'join_community'
  | 'create_meal_plan'
  | 'check_eligibility'
  | 'generate_lmn'
  | 'find_caregiver'
  | 'file_claim'
  | 'call_emergency';

export interface SageAction {
  id: string;
  type: SageActionType;
  title: string;
  description: string;
  priority: 'immediate' | 'recommended' | 'informational';

  /** Which co-op.care module handles this action */
  module:
    | 'assessment'
    | 'nutrition'
    | 'matching'
    | 'wellness'
    | 'referral'
    | 'reimbursement'
    | 'peer_support'
    | 'scheduling'
    | 'lmn';

  /** API endpoint the client calls when the user clicks this action */
  endpoint: string;
  method: 'GET' | 'POST';
  payload?: Record<string, unknown>;

  /** Client rendering hints */
  buttonLabel: string;
  icon: string;
  estimatedTime?: string;
  estimatedSavings?: string;
}

// ── Intent Patterns ──────────────────────────────────────

interface IntentPattern {
  keywords: string[];
  /** All keywords must match (AND) vs any keyword matches (OR) */
  matchMode: 'any' | 'all';
  actions: SageAction[];
}

let actionIdCounter = 0;
function nextActionId(): string {
  actionIdCounter++;
  return `sage-action-${actionIdCounter}`;
}

/** Reset counter (for deterministic tests) */
export function resetActionIdCounter(): void {
  actionIdCounter = 0;
}

// ── Action Templates ─────────────────────────────────────

function fallActions(): SageAction[] {
  return [
    {
      id: nextActionId(),
      type: 'start_assessment',
      title: 'STEADI Fall Risk Assessment',
      description:
        'CDC-validated fall risk screening — takes about 2 minutes. Identifies specific risk factors and generates a personalized prevention plan.',
      priority: 'immediate',
      module: 'assessment',
      endpoint: '/api/v1/assessments',
      method: 'POST',
      payload: { type: 'fall_risk', tool: 'STEADI' },
      buttonLabel: 'Start Fall Risk Assessment',
      icon: 'shield',
      estimatedTime: '2 minutes',
    },
    {
      id: nextActionId(),
      type: 'start_assessment',
      title: 'Sarcopenia Screening (SARC-F)',
      description:
        'Muscle loss screening — weakness contributes to falls. 5 quick questions about strength, walking, rising from a chair, climbing stairs, and fall history.',
      priority: 'immediate',
      module: 'nutrition',
      endpoint: '/api/v1/nutrition/assess',
      method: 'POST',
      payload: { type: 'sarc_f' },
      buttonLabel: 'Screen for Muscle Loss',
      icon: 'activity',
      estimatedTime: '1 minute',
    },
    {
      id: nextActionId(),
      type: 'recommend_product',
      title: 'Fall Prevention Products',
      description:
        'Grab bars, non-slip mats, night lights, medical alert systems — curated and rated by our community.',
      priority: 'recommended',
      module: 'wellness',
      endpoint: '/api/v1/wellness/products',
      method: 'GET',
      payload: { intervention: 'fall_prevention' },
      buttonLabel: 'View Fall Prevention Products',
      icon: 'shopping-bag',
    },
    {
      id: nextActionId(),
      type: 'join_community',
      title: 'Fall Prevention & Mobility Community',
      description:
        'Connect with other families navigating fall prevention. Share tips, ask questions, and learn from real experiences.',
      priority: 'informational',
      module: 'peer_support',
      endpoint: '/api/v1/peer-support/communities/fall-prevention-mobility/join',
      method: 'POST',
      buttonLabel: 'Join Community',
      icon: 'users',
    },
  ];
}

function notEatingActions(): SageAction[] {
  return [
    {
      id: nextActionId(),
      type: 'start_assessment',
      title: 'Nutrition Assessment (MNA-SF)',
      description:
        'Mini Nutritional Assessment — Short Form. Screens for malnutrition risk in elderly adults. Takes about 2 minutes.',
      priority: 'immediate',
      module: 'nutrition',
      endpoint: '/api/v1/nutrition/assess',
      method: 'POST',
      payload: { type: 'mna_sf' },
      buttonLabel: 'Run Nutrition Screening',
      icon: 'clipboard',
      estimatedTime: '2 minutes',
    },
    {
      id: nextActionId(),
      type: 'create_meal_plan',
      title: 'Create Meal Plan',
      description:
        'Build a personalized meal plan based on dietary needs, restrictions, and caloric/protein targets.',
      priority: 'recommended',
      module: 'nutrition',
      endpoint: '/api/v1/nutrition/plans',
      method: 'POST',
      buttonLabel: 'Create Meal Plan',
      icon: 'utensils',
      estimatedTime: '5 minutes',
    },
    {
      id: nextActionId(),
      type: 'find_caregiver',
      title: 'Find a Neighbor Kitchen',
      description:
        "Connect with a neighbor who can prepare and deliver home-cooked meals tailored to your care recipient's dietary needs.",
      priority: 'recommended',
      module: 'nutrition',
      endpoint: '/api/v1/nutrition/kitchens',
      method: 'GET',
      buttonLabel: 'Find Neighbor Kitchens',
      icon: 'home',
    },
    {
      id: nextActionId(),
      type: 'check_eligibility',
      title: 'Check Medicaid MTM Eligibility',
      description:
        'See if your care recipient qualifies for Medicaid-covered medically tailored meals or other nutrition assistance programs.',
      priority: 'informational',
      module: 'nutrition',
      endpoint: '/api/v1/nutrition/eligibility',
      method: 'GET',
      buttonLabel: 'Check Eligibility',
      icon: 'dollar-sign',
    },
  ];
}

function burnoutActions(): SageAction[] {
  return [
    {
      id: nextActionId(),
      type: 'start_assessment',
      title: 'Caregiver Impact Index (CII)',
      description:
        "A 30-second check-in on how you're doing. Three sliders — completely private, no judgment. Your score helps us personalize your support.",
      priority: 'immediate',
      module: 'assessment',
      endpoint: '/api/v1/assessments',
      method: 'POST',
      payload: { type: 'cii' },
      buttonLabel: 'Start Burnout Check-In',
      icon: 'heart',
      estimatedTime: '30 seconds',
    },
    {
      id: nextActionId(),
      type: 'join_community',
      title: 'Caregiver Burnout & Self-Care Community',
      description:
        "A safe space with other caregivers who understand. Share the emotional weight, find strategies, and know you're not alone.",
      priority: 'recommended',
      module: 'peer_support',
      endpoint: '/api/v1/peer-support/communities/caregiver-burnout/join',
      method: 'POST',
      buttonLabel: 'Join Support Community',
      icon: 'users',
    },
    {
      id: nextActionId(),
      type: 'find_caregiver',
      title: 'Find Respite Care',
      description:
        'Get matched with a caregiver who can give you a break. Even a few hours makes a difference.',
      priority: 'recommended',
      module: 'matching',
      endpoint: '/api/v1/matching/request',
      method: 'POST',
      payload: { needs: ['respite'], urgency: 'routine' },
      buttonLabel: 'Find Respite Caregiver',
      icon: 'refresh-cw',
    },
    {
      id: nextActionId(),
      type: 'check_eligibility',
      title: 'HSA Eligibility for Respite Care',
      description:
        'Respite care may be HSA/FSA eligible with a Letter of Medical Necessity. Check your eligibility.',
      priority: 'informational',
      module: 'reimbursement',
      endpoint: '/api/v1/reimbursement/eligibility',
      method: 'GET',
      buttonLabel: 'Check HSA Eligibility',
      icon: 'credit-card',
      estimatedSavings: '28-36% savings',
    },
  ];
}

function medicalAlertActions(): SageAction[] {
  return [
    {
      id: nextActionId(),
      type: 'recommend_product',
      title: 'Medical Alert Systems — Compared',
      description:
        "We've tested and rated the top medical alert systems. Filtered by ease of use so your loved one will actually wear it.",
      priority: 'immediate',
      module: 'wellness',
      endpoint: '/api/v1/wellness/products',
      method: 'GET',
      payload: { category: 'medical_alert' },
      buttonLabel: 'Compare Medical Alerts',
      icon: 'bell',
    },
    {
      id: nextActionId(),
      type: 'recommend_product',
      title: 'Fall Prevention Starter Kit Bundle',
      description:
        'Medical alert + grab bars + night lights + bath mat — everything for baseline fall safety. Save $20 as a bundle.',
      priority: 'recommended',
      module: 'wellness',
      endpoint: '/api/v1/wellness/bundles',
      method: 'GET',
      payload: { condition: 'R29.6' },
      buttonLabel: 'View Starter Kit',
      icon: 'package',
      estimatedSavings: '$20 bundle savings',
    },
  ];
}

function paymentActions(): SageAction[] {
  return [
    {
      id: nextActionId(),
      type: 'check_eligibility',
      title: 'HSA/FSA Eligibility Check',
      description:
        'See which co-op.care services and products are eligible for tax-free HSA/FSA reimbursement.',
      priority: 'immediate',
      module: 'reimbursement',
      endpoint: '/api/v1/reimbursement/eligibility',
      method: 'GET',
      buttonLabel: 'Check My Eligibility',
      icon: 'credit-card',
      estimatedSavings: '28-36% savings',
    },
    {
      id: nextActionId(),
      type: 'generate_lmn',
      title: 'Generate Letter of Medical Necessity',
      description:
        'An LMN from your physician unlocks HSA/FSA eligibility for home care, medically tailored meals, and safety equipment.',
      priority: 'recommended',
      module: 'lmn',
      endpoint: '/api/v1/lmn',
      method: 'POST',
      buttonLabel: 'Start LMN Process',
      icon: 'file-text',
      estimatedTime: '5 minutes',
    },
    {
      id: nextActionId(),
      type: 'file_claim',
      title: 'View Reimbursement Claims',
      description: 'Track your HSA/FSA reimbursement claims and see payment status.',
      priority: 'recommended',
      module: 'reimbursement',
      endpoint: '/api/v1/reimbursement/claims',
      method: 'GET',
      buttonLabel: 'View My Claims',
      icon: 'file-check',
    },
    {
      id: nextActionId(),
      type: 'join_community',
      title: 'HSA/FSA & Financial Navigation Community',
      description:
        'Tips and strategies from other families on maximizing benefits and reducing out-of-pocket costs.',
      priority: 'informational',
      module: 'peer_support',
      endpoint: '/api/v1/peer-support/communities/hsa-fsa-financial/join',
      method: 'POST',
      buttonLabel: 'Join Community',
      icon: 'users',
    },
  ];
}

function dementiaActions(): SageAction[] {
  return [
    {
      id: nextActionId(),
      type: 'start_assessment',
      title: 'Care Recipient Impact Assessment (CRI)',
      description:
        "Assess your care recipient's current functional status, cognitive level, and care needs.",
      priority: 'immediate',
      module: 'assessment',
      endpoint: '/api/v1/assessments',
      method: 'POST',
      payload: { type: 'cri' },
      buttonLabel: 'Start CRI Assessment',
      icon: 'clipboard',
      estimatedTime: '3 minutes',
    },
    {
      id: nextActionId(),
      type: 'recommend_product',
      title: 'Dementia Home Safety Package',
      description:
        'Door alarms, stove shutoff, reminder clock, night lights — essential safety modifications for dementia care at home.',
      priority: 'recommended',
      module: 'wellness',
      endpoint: '/api/v1/wellness/bundles',
      method: 'GET',
      payload: { condition: 'F03.90' },
      buttonLabel: 'View Safety Package',
      icon: 'shield',
      estimatedSavings: '$30 bundle savings',
    },
    {
      id: nextActionId(),
      type: 'join_community',
      title: "Dementia & Alzheimer's Caregivers Community",
      description:
        'Connect with families on the same journey. Strategies for sundowning, wandering, communication changes, and more.',
      priority: 'recommended',
      module: 'peer_support',
      endpoint: '/api/v1/peer-support/communities/dementia-caregivers/join',
      method: 'POST',
      buttonLabel: 'Join Community',
      icon: 'users',
    },
    {
      id: nextActionId(),
      type: 'check_eligibility',
      title: 'Medicaid HCBS Waiver Eligibility',
      description:
        'Check if your care recipient qualifies for Medicaid Home and Community Based Services — may cover in-home care and meals.',
      priority: 'informational',
      module: 'reimbursement',
      endpoint: '/api/v1/reimbursement/eligibility',
      method: 'GET',
      buttonLabel: 'Check Medicaid Eligibility',
      icon: 'dollar-sign',
    },
  ];
}

function needHelpActions(): SageAction[] {
  return [
    {
      id: nextActionId(),
      type: 'find_caregiver',
      title: 'Submit Caregiver Match Request',
      description:
        "Tell us what you need — we'll match you with caregivers based on skills, availability, proximity, and trust scores.",
      priority: 'immediate',
      module: 'matching',
      endpoint: '/api/v1/matching/request',
      method: 'POST',
      buttonLabel: 'Find a Caregiver',
      icon: 'search',
      estimatedTime: '3 minutes',
    },
    {
      id: nextActionId(),
      type: 'recommend_product',
      title: 'View Care Plans & Pricing',
      description:
        'Flexible care plans starting at ~$550/month (5 hrs/week). HSA-eligible. No contracts.',
      priority: 'recommended',
      module: 'scheduling',
      endpoint: '/api/v1/sage/chat',
      method: 'POST',
      payload: { topic: 'billing' },
      buttonLabel: 'View Care Plans',
      icon: 'clipboard',
    },
    {
      id: nextActionId(),
      type: 'find_caregiver',
      title: 'Invite a Neighbor',
      description:
        'Know someone who could help? Invite them to earn Time Bank credits by helping your family.',
      priority: 'informational',
      module: 'referral',
      endpoint: '/api/v1/referrals/invite',
      method: 'POST',
      buttonLabel: 'Invite a Neighbor',
      icon: 'user-plus',
    },
  ];
}

function sundowningWanderingActions(): SageAction[] {
  return [
    {
      id: nextActionId(),
      type: 'recommend_product',
      title: 'Door & Window Alarm Sensors',
      description:
        'Wireless alarms that alert when doors or windows are opened — critical for wandering prevention.',
      priority: 'immediate',
      module: 'wellness',
      endpoint: '/api/v1/wellness/products',
      method: 'GET',
      payload: { category: 'home_safety' },
      buttonLabel: 'View Safety Products',
      icon: 'alert-triangle',
    },
    {
      id: nextActionId(),
      type: 'join_community',
      title: 'Dementia Caregivers Community',
      description:
        'Sundowning strategies, wandering prevention tips, and support from families managing the same challenges.',
      priority: 'recommended',
      module: 'peer_support',
      endpoint: '/api/v1/peer-support/communities/dementia-caregivers/join',
      method: 'POST',
      buttonLabel: 'Join Community',
      icon: 'users',
    },
    {
      id: nextActionId(),
      type: 'schedule_visit',
      title: 'Schedule Evening Care Visit',
      description:
        'Sundowning peaks in late afternoon and evening. Schedule a caregiver for those hours to give yourself a break.',
      priority: 'recommended',
      module: 'scheduling',
      endpoint: '/api/v1/matching/request',
      method: 'POST',
      payload: { needs: ['companionship', 'safety_supervision'], urgency: 'routine' },
      buttonLabel: 'Schedule Evening Care',
      icon: 'clock',
    },
  ];
}

// ── Intent Pattern Registry ──────────────────────────────

const INTENT_PATTERNS: IntentPattern[] = [
  // Falls — "mom keeps falling", "falling", "fell", "fall risk"
  {
    keywords: ['fall', 'falling', 'fell', 'trip', 'tripped', 'balance'],
    matchMode: 'any',
    actions: [], // Populated dynamically to get fresh IDs
  },
  // Not eating — "dad's not eating", "won't eat", "lost weight", "appetite"
  {
    keywords: [
      'not eating',
      "won't eat",
      'appetite',
      'lost weight',
      'losing weight',
      'malnourish',
      'underweight',
      'not hungry',
    ],
    matchMode: 'any',
    actions: [],
  },
  // Burnout — "burned out", "exhausted", "can't do this", "overwhelmed", "tired"
  {
    keywords: [
      'burn',
      'burned out',
      'exhausted',
      'overwhelmed',
      "can't do this",
      'so tired',
      'need a break',
      'respite',
      'guilty',
    ],
    matchMode: 'any',
    actions: [],
  },
  // Medical alert — "medical alert", "life alert", "emergency button", "PERS"
  {
    keywords: [
      'medical alert',
      'life alert',
      'emergency button',
      'emergency pendant',
      'pers',
      'fall detection',
    ],
    matchMode: 'any',
    actions: [],
  },
  // Payment/HSA — "pay for", "cost", "hsa", "fsa", "afford", "insurance"
  {
    keywords: [
      'pay for',
      'how much',
      'cost',
      'afford',
      'hsa',
      'fsa',
      'insurance',
      'reimburse',
      'lmn',
      'letter of medical',
    ],
    matchMode: 'any',
    actions: [],
  },
  // Dementia — "dementia", "alzheimer", "memory loss", "cognitive decline"
  {
    keywords: [
      'dementia',
      'alzheimer',
      'memory loss',
      'cognitive decline',
      'confused',
      'forgetful',
      "doesn't remember",
    ],
    matchMode: 'any',
    actions: [],
  },
  // Need help — "need someone", "need help", "caregiver", "home care"
  {
    keywords: [
      'need someone',
      'need help',
      'find a caregiver',
      'home care',
      'in-home',
      'companion',
      'care worker',
    ],
    matchMode: 'any',
    actions: [],
  },
  // Sundowning/wandering — "sundowning", "sundown", "wandering", "wanders"
  {
    keywords: [
      'sundown',
      'sundowning',
      'wandering',
      'wanders',
      'wander',
      'agitated at night',
      'confused at night',
    ],
    matchMode: 'any',
    actions: [],
  },
];

// ── Core Engine ──────────────────────────────────────────

/**
 * Analyze a message and return concrete, actionable next steps
 * that connect to real co-op.care modules.
 *
 * This is the "last mile" — not advice, but actions.
 */
export function generateActions(
  message: string,
  _userId?: string,
  _careRecipientId?: string,
): SageAction[] {
  const lower = message.toLowerCase();
  const matchedActions: SageAction[] = [];
  const matchedIntents: string[] = [];

  // Check each intent pattern
  for (let i = 0; i < INTENT_PATTERNS.length; i++) {
    const pattern = INTENT_PATTERNS[i]!;
    const matched =
      pattern.matchMode === 'any'
        ? pattern.keywords.some((kw) => lower.includes(kw))
        : pattern.keywords.every((kw) => lower.includes(kw));

    if (matched) {
      // Generate fresh actions based on which pattern matched
      const actions = getActionsForPatternIndex(i);
      matchedActions.push(...actions);
      matchedIntents.push(pattern.keywords[0]!);
    }
  }

  // Deduplicate by action type + module combination
  const seen = new Set<string>();
  const deduped = matchedActions.filter((action) => {
    const key = `${action.type}:${action.module}:${action.endpoint}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (deduped.length > 0) {
    logger.info(
      { intents: matchedIntents, actionCount: deduped.length },
      'Sage action engine generated actions',
    );
  }

  return deduped;
}

/** Map pattern index to action generator */
function getActionsForPatternIndex(index: number): SageAction[] {
  switch (index) {
    case 0:
      return fallActions();
    case 1:
      return notEatingActions();
    case 2:
      return burnoutActions();
    case 3:
      return medicalAlertActions();
    case 4:
      return paymentActions();
    case 5:
      return dementiaActions();
    case 6:
      return needHelpActions();
    case 7:
      return sundowningWanderingActions();
    default:
      return [];
  }
}
