/**
 * SageEngine.ts — Unified Sage Response Brain
 *
 * Pure functions, no React. Merges SageChat.tsx + SageHero.tsx response logic
 * into a single engine consumed by the thin SageChat React wrapper.
 *
 * Domains: 25 keyword-classified domains
 * Public responses: ~30 keyword handlers for unauthenticated visitors
 * Member responses: 25 domain-specific switch cases
 * Onboarding: phase-based conversational flow
 * Dynamic tiles: profile-aware + phase-based + domain-reactive
 */

import type { OnboardingPhase } from '@client/stores/signupStore';

// ─── Types ──────────────────────────────────────────────────────────

export type Domain =
  | 'emergency'
  | 'assessment'
  | 'billing'
  | 'timebank'
  | 'scheduling'
  | 'family_intake'
  | 'worker_intake'
  | 'how_different'
  | 'membership'
  | 'tier'
  | 'qr'
  | 'streaks'
  | 'governance'
  | 'coverage'
  | 'lmn'
  | 'referral'
  | 'respite_fund'
  | 'equity'
  | 'care_logs'
  | 'intake'
  | 'human_escalation'
  | 'background_check'
  | 'care_questions'
  | 'emotional_support'
  | 'crisis'
  | 'visit_workflow'
  | 'tell_my_story'
  | 'default';

export type ActionType =
  | 'start-assessment'
  | 'navigate'
  | 'show-plans'
  | 'start-intake'
  | 'contact';

export interface ActionButton {
  id: string;
  label: string;
  icon: string;
  actionType: ActionType;
  payload?: string;
}

export interface FollowupChip {
  label: string;
  message: string;
}

export type InlineComponentType = 'mini_cii' | 'care_recipient' | 'role_picker' | 'consent_picker';

export interface InlineComponent {
  type: InlineComponentType;
  props?: Record<string, unknown>;
}

export interface ComponentResult {
  type: InlineComponentType;
  data: Record<string, unknown>;
}

export interface SageResponse {
  content: string;
  actions?: ActionButton[];
  followups?: FollowupChip[];
  thinkingSteps?: string[];
  component?: InlineComponent;
  omahaProblems?: OmahaProblem[];
}

// ─── Care Recipient Profile (extracted from Sage conversations) ─────

export interface CareRecipient {
  name?: string;
  age?: number;
  relationship?: string; // "mother", "father", "spouse", etc.
  location?: string;
  livingSituation?: string; // "alone", "with_family", "facility"
  conditions?: string[]; // ["dementia", "diabetes", "CHF"]
  medications?: string[]; // ["metoprolol", "lisinopril"]
  riskFlags?: string[]; // ["fall_history", "wandering", "medication_noncompliance"]
  mobilityLevel?: string; // "independent", "needs_assist", "wheelchair", "bedbound"
}

export interface NetworkMember {
  name?: string;
  relationship?: string; // "sister", "brother", "neighbor", "friend"
  location?: string;
  role?: string; // "helps_with_transport", "visits_weekly", "emergency_contact"
  isOnCoopCare?: boolean;
}

// ─── Care Seeds (engagement reward points) ──────────────────────────

export interface SeedsLedger {
  total: number;
  history: Array<{ action: string; seeds: number; date: string }>;
}

export const SEED_VALUES = {
  answer_question: 5,
  first_conversation: 10,
  mini_cii_complete: 25,
  education_module: 30,
  full_cii_complete: 50,
  cri_complete: 50,
  seven_day_streak: 50,
  video_home_assessment: 75,
  share_card: 100,
  referral_signup: 200,
} as const;

export interface UserProfile {
  lastMiniCII?: { physical: number; sleep: number; isolation: number; total: number; zone: string };
  lastCRI?: {
    mobility: number;
    memory: number;
    dailyTasks: number;
    medications: number;
    social: number;
    total: number;
    zone: string;
    omahaFlags: string[];
  };
  conversationCount: number;
  topDomains: Record<string, number>;
  referralCount: number;
  lastVisit: string;

  // ── Living Profile (extracted from Sage conversations) ──
  careRecipient?: CareRecipient;
  caregiverContext?: {
    employment?: string; // "full_time", "part_time", "retired", "not_working"
    livesWithRecipient?: boolean;
    distanceFromRecipient?: string; // "same_home", "nearby", "different_city"
    otherCaregivingDuties?: string[];
  };
  network?: NetworkMember[];

  // ── Care Seeds ──
  seeds?: SeedsLedger;
}

// ─── Profile Update Types (returned by Claude alongside content) ────

export interface ProfileUpdates {
  careRecipient?: Partial<CareRecipient>;
  caregiverContext?: Partial<NonNullable<UserProfile['caregiverContext']>>;
  networkMembers?: NetworkMember[];
  seedsEarned?: number;
  seedReason?: string;
}

export interface CardTile {
  label: string;
  value: string;
  sublabel?: string;
  color: 'sage' | 'copper' | 'gold' | 'blue' | 'red' | 'yellow' | 'gray';
  icon?: string;
  pulse?: boolean;
}

export interface TileWithAction extends CardTile {
  message: string;
}

export interface ConversationContext {
  lastDomain: Domain | null;
  onboardingPhase: OnboardingPhase;
  suggestedQuestion: string | null;
  dynamicTiles: TileWithAction[];
}

export interface AssessmentZone {
  zone: 'green' | 'yellow' | 'red';
  label: string;
  color: string;
  description: string;
}

// ─── Omaha System Classification ───────────────────────────────────────
// The Omaha System is a standardized taxonomy for community-based care.
// 4 Domains → 42 Problems → KBS outcome ratings (Knowledge/Behavior/Status 1-5)

export interface OmahaProblem {
  code: string;
  name: string;
  domain: 'environmental' | 'psychosocial' | 'physiological' | 'health_behaviors';
  /** Keywords that map conversation topics to this problem */
  keywords: string[];
  /** What Sage asks to assess this problem */
  assessmentPrompts: string[];
}

export interface OmahaAssessment {
  problemCode: string;
  knowledge: 1 | 2 | 3 | 4 | 5; // 1=no knowledge, 5=superior knowledge
  behavior: 1 | 2 | 3 | 4 | 5; // 1=not appropriate, 5=consistently appropriate
  status: 1 | 2 | 3 | 4 | 5; // 1=extreme signs/symptoms, 5=no signs/symptoms
  assessedAt: string;
  notes?: string;
}

/** Omaha problems most relevant to companion care */
export const OMAHA_PROBLEMS: OmahaProblem[] = [
  // Domain I — Environmental
  {
    code: 'E01',
    name: 'Income',
    domain: 'environmental',
    keywords: [
      'money',
      'afford',
      'cost',
      'expensive',
      'income',
      'financial',
      'budget',
      'pay',
      'insurance',
    ],
    assessmentPrompts: [
      'How are you managing the financial side of caregiving?',
      'Is cost a barrier to getting the care your family needs?',
    ],
  },
  {
    code: 'E03',
    name: 'Residence',
    domain: 'environmental',
    keywords: [
      'home',
      'house',
      'apartment',
      'stairs',
      'bathroom',
      'accessible',
      'modifications',
      'safety',
      'fall',
      'grab bar',
    ],
    assessmentPrompts: [
      "Is the home set up safely for the person you're caring for?",
      'Have you needed any home modifications?',
    ],
  },
  {
    code: 'E04',
    name: 'Neighborhood/workplace safety',
    domain: 'environmental',
    keywords: ['neighborhood', 'safe', 'transportation', 'drive', 'walk', 'access'],
    assessmentPrompts: [
      'Can you get to the services and support you need?',
      'Is transportation a challenge?',
    ],
  },

  // Domain II — Psychosocial
  {
    code: 'P05',
    name: 'Communication with community resources',
    domain: 'psychosocial',
    keywords: [
      'resources',
      'services',
      'help',
      'support',
      'agency',
      'program',
      'benefits',
      'medicaid',
      'medicare',
    ],
    assessmentPrompts: [
      'Do you know what community resources are available to you?',
      'Have you been able to connect with the support programs you need?',
    ],
  },
  {
    code: 'P06',
    name: 'Social contact',
    domain: 'psychosocial',
    keywords: [
      'lonely',
      'alone',
      'isolated',
      'friends',
      'social',
      'visit',
      'companionship',
      'talk to someone',
    ],
    assessmentPrompts: [
      'How often do you get to spend time with people outside of caregiving?',
      'Does the person you care for have regular social interaction?',
    ],
  },
  {
    code: 'P07',
    name: 'Role change',
    domain: 'psychosocial',
    keywords: [
      'role',
      'identity',
      'used to be',
      'before caregiving',
      'lost myself',
      'who am i',
      'parent became child',
    ],
    assessmentPrompts: [
      'How has caregiving changed your sense of who you are?',
      'What did you used to do that you miss?',
    ],
  },
  {
    code: 'P08',
    name: 'Interpersonal relationship',
    domain: 'psychosocial',
    keywords: [
      'family',
      'spouse',
      'sibling',
      'argument',
      'conflict',
      'relationship',
      'marriage',
      'tension',
      'resentment',
    ],
    assessmentPrompts: [
      'How are your family relationships holding up?',
      'Is caregiving creating tension with anyone?',
    ],
  },
  {
    code: 'P10',
    name: 'Grief',
    domain: 'psychosocial',
    keywords: [
      'grief',
      'loss',
      'dying',
      'death',
      'mourning',
      'passed',
      'miss',
      'end of life',
      'hospice',
      'palliative',
    ],
    assessmentPrompts: [
      'Are you dealing with grief or anticipatory loss?',
      "Would it help to talk about what you're feeling?",
    ],
  },
  {
    code: 'P11',
    name: 'Mental health',
    domain: 'psychosocial',
    keywords: [
      'depressed',
      'anxious',
      'anxiety',
      'stress',
      'overwhelmed',
      'burnout',
      "can't cope",
      'breaking point',
      'mental health',
      'therapy',
    ],
    assessmentPrompts: [
      'How are you doing emotionally — honestly?',
      'On a scale of 1-10, how overwhelmed do you feel right now?',
    ],
  },
  {
    code: 'P13',
    name: 'Abuse and neglect',
    domain: 'psychosocial',
    keywords: ['abuse', 'neglect', 'hurt', 'scared', 'unsafe', 'hitting', 'yelling', 'threatened'],
    assessmentPrompts: [
      'Is everyone in the care situation safe?',
      'Has anyone been hurt or felt unsafe?',
    ],
  },
  {
    code: 'P17',
    name: 'Caretaking/parenting',
    domain: 'psychosocial',
    keywords: [
      'caregiver',
      'caring for',
      'taking care',
      'responsibility',
      'duty',
      'sandwich generation',
      'kids and parents',
    ],
    assessmentPrompts: [
      'Tell me about your caregiving situation — who are you caring for?',
      'How many people depend on you for care?',
    ],
  },

  // Domain III — Physiological
  {
    code: 'H18',
    name: 'Neuro-musculo-skeletal function',
    domain: 'physiological',
    keywords: [
      'mobility',
      'walking',
      'wheelchair',
      'cane',
      'walker',
      'fall',
      'balance',
      'strength',
      'physical therapy',
    ],
    assessmentPrompts: [
      'How is their mobility? Can they move around safely?',
      'Have there been any falls or near-falls?',
    ],
  },
  {
    code: 'H25',
    name: 'Pain',
    domain: 'physiological',
    keywords: ['pain', 'hurts', 'aching', 'chronic pain', 'comfortable', 'uncomfortable'],
    assessmentPrompts: ['Is pain affecting daily life?', 'How is pain being managed?'],
  },
  {
    code: 'H27',
    name: 'Cognition',
    domain: 'physiological',
    keywords: [
      'memory',
      'forget',
      'confused',
      'dementia',
      'alzheimer',
      'cognitive',
      'remember',
      'wander',
      'lost',
    ],
    assessmentPrompts: [
      'How is their memory and thinking?',
      'Have you noticed changes in cognition?',
    ],
  },

  // Domain IV — Health-Related Behaviors
  {
    code: 'B33',
    name: 'Nutrition',
    domain: 'health_behaviors',
    keywords: [
      'eating',
      'food',
      'meals',
      'cooking',
      'weight',
      'appetite',
      'diet',
      'nutrition',
      'grocery',
    ],
    assessmentPrompts: [
      'Are they eating well? Getting regular meals?',
      'Is meal preparation a challenge?',
    ],
  },
  {
    code: 'B34',
    name: 'Sleep and rest patterns',
    domain: 'health_behaviors',
    keywords: ['sleep', 'tired', 'exhausted', 'insomnia', 'up all night', 'rest', 'fatigue', 'nap'],
    assessmentPrompts: [
      'How is sleep — both for you and the person you care for?',
      'Are you getting enough rest?',
    ],
  },
  {
    code: 'B35',
    name: 'Physical activity',
    domain: 'health_behaviors',
    keywords: ['exercise', 'activity', 'sedentary', 'walk', 'move', 'active', 'sitting'],
    assessmentPrompts: [
      'Is there enough physical activity in their day?',
      'Are you able to stay active yourself?',
    ],
  },
  {
    code: 'B36',
    name: 'Personal care',
    domain: 'health_behaviors',
    keywords: [
      'bathing',
      'dressing',
      'hygiene',
      'grooming',
      'toileting',
      'ADL',
      'activities of daily living',
      'shower',
    ],
    assessmentPrompts: [
      'How is personal care going — bathing, dressing, grooming?',
      'Do they need help with daily activities?',
    ],
  },
  {
    code: 'B39',
    name: 'Health care supervision',
    domain: 'health_behaviors',
    keywords: [
      'doctor',
      'appointment',
      'checkup',
      'specialist',
      'follow up',
      'medical',
      'health care',
      'provider',
    ],
    assessmentPrompts: [
      'Are medical appointments being kept up with?',
      'Is coordinating health care a challenge?',
    ],
  },
  {
    code: 'B40',
    name: 'Medication regimen',
    domain: 'health_behaviors',
    keywords: [
      'medication',
      'pills',
      'prescription',
      'pharmacy',
      'dose',
      'refill',
      'medicine',
      'drug',
      'side effect',
    ],
    assessmentPrompts: [
      'How is medication management going?',
      'Any issues with medications — missed doses, side effects?',
    ],
  },
];

/**
 * classifyOmahaProblems — Maps user message text to relevant Omaha problems
 * Returns problems sorted by keyword match relevance
 */
export function classifyOmahaProblems(text: string): OmahaProblem[] {
  const lower = text.toLowerCase();
  const scored = OMAHA_PROBLEMS.map((problem) => {
    const matchCount = problem.keywords.filter((kw) => lower.includes(kw)).length;
    return { problem, matchCount };
  }).filter((s) => s.matchCount > 0);

  scored.sort((a, b) => b.matchCount - a.matchCount);
  return scored.map((s) => s.problem);
}

/**
 * getOmahaAssessmentPrompt — Given classified problems, returns
 * a contextual follow-up question Sage can ask
 */
export function getOmahaAssessmentPrompt(problems: OmahaProblem[]): string | null {
  if (problems.length === 0) return null;
  const primary = problems[0];
  if (!primary) return null;
  const prompts = primary.assessmentPrompts;
  return prompts[Math.floor(Math.random() * prompts.length)] ?? null;
}

// ─── Constants ──────────────────────────────────────────────────────

export const THINKING_SEQUENCES: Record<string, string[]> = {
  general: ['Thinking about that...', 'Let me consider this...'],
  assessment: ['Setting up your check-in...'],
  emotional: ['I hear you...', 'Taking this in...'],
  intake: ['Getting to know you...'],
  search: ['Looking into this...'],
  financial: ['Checking the numbers...'],
  safety: ['This is important...', 'Prioritizing your safety...'],
  local: ['Checking Boulder-area options...'],
};

export const SUGGESTED_TOPICS: FollowupChip[] = [
  { label: 'Tell my story', message: 'I want to tell you about my care situation' },
  {
    label: 'How a visit works',
    message: 'Walk me through how a care visit works — from QR scan to billing',
  },
  {
    label: 'Am I burned out?',
    message: 'I think I might be experiencing caregiver burnout. Can you help me check?',
  },
  { label: 'Become a neighbor', message: "I'm interested in becoming a care neighbor" },
  { label: 'What does it cost?', message: 'How much does co-op.care cost?' },
  { label: 'What is this?', message: 'What is co-op.care?' },
];

// ─── Keyword Router ─────────────────────────────────────────────────

const KEYWORDS: Record<string, Domain> = {
  // Emergency / crisis
  suicide: 'crisis',
  suicidal: 'crisis',
  'kill myself': 'crisis',
  'end my life': 'crisis',
  'want to die': 'crisis',
  'harm myself': 'crisis',
  '911': 'emergency',
  emergency: 'emergency',
  'call 911': 'emergency',
  'chest pain': 'emergency',
  'cant breathe': 'emergency',
  unconscious: 'emergency',

  // Assessment — includes exact phrases from followup chips
  burnout: 'assessment',
  'burned out': 'assessment',
  'caregiver stress': 'assessment',
  stressed: 'assessment',
  overwhelmed: 'assessment',
  exhausted: 'assessment',
  'how am i doing': 'assessment',
  'check in': 'assessment',
  'self-care': 'assessment',
  assessment: 'assessment',
  cii: 'assessment',
  score: 'assessment',
  'wellness check': 'assessment',
  wellness: 'assessment',
  'do the wellness check': 'assessment',
  'do the check': 'assessment',
  'let me do the wellness check': 'assessment',
  'do a quick wellness': 'assessment',
  'yes, let me do the wellness check': 'assessment',
  'am i burned out': 'assessment',
  'caregiver wellness check': 'assessment',
  "check how i'm doing": 'assessment',
  "check how i'm really doing": 'assessment',
  'redo my wellness': 'assessment',
  'assess my loved one': 'family_intake',
  'care recipient': 'family_intake',
  'assess their needs': 'family_intake',
  'how are they doing': 'family_intake',
  "assess my loved one's needs": 'family_intake',
  'care recipient index': 'family_intake',
  cri: 'family_intake',

  // Billing / cost
  cost: 'billing',
  price: 'billing',
  pricing: 'billing',
  'how much': 'billing',
  afford: 'billing',
  expensive: 'billing',
  pay: 'billing',
  payment: 'billing',
  hsa: 'billing',
  fsa: 'billing',
  insurance: 'billing',
  covered: 'billing',

  // Time Bank
  'time bank': 'timebank',
  timebank: 'timebank',
  hours: 'timebank',
  'give hours': 'timebank',
  'earn hours': 'timebank',
  bank: 'timebank',

  // Scheduling
  schedule: 'scheduling',
  book: 'scheduling',
  appointment: 'scheduling',
  availability: 'scheduling',
  calendar: 'scheduling',
  visit: 'scheduling',

  // Intake
  'sign up': 'intake',
  'get started': 'intake',
  join: 'intake',
  enroll: 'intake',
  register: 'intake',
  start: 'intake',

  // Family intake
  family: 'family_intake',
  parent: 'family_intake',
  mom: 'family_intake',
  dad: 'family_intake',
  aging: 'family_intake',
  elder: 'family_intake',
  'loved one': 'family_intake',

  // Worker intake
  'become a caregiver': 'worker_intake',
  'work for': 'worker_intake',
  'care neighbor': 'worker_intake',
  'become a neighbor': 'worker_intake',
  'caregiver job': 'worker_intake',
  apply: 'worker_intake',
  career: 'worker_intake',
  job: 'worker_intake',

  // How different
  different: 'how_different',
  agency: 'how_different',
  'why not': 'how_different',
  compare: 'how_different',
  vs: 'how_different',
  versus: 'how_different',
  'better than': 'how_different',

  // Membership
  membership: 'membership',
  member: 'membership',
  plan: 'membership',
  tier: 'tier',
  seedling: 'tier',
  rooted: 'tier',
  canopy: 'tier',

  // QR
  qr: 'qr',
  'qr code': 'qr',
  scan: 'qr',
  share: 'qr',

  // Streaks
  streak: 'streaks',
  daily: 'streaks',
  'check-in': 'streaks',

  // Governance
  cooperative: 'governance',
  'co-op': 'governance',
  vote: 'governance',
  governance: 'governance',
  ownership: 'governance',
  board: 'governance',
  lca: 'governance',

  // Coverage
  medicaid: 'coverage',
  medicare: 'coverage',
  coverage: 'coverage',

  // LMN
  lmn: 'lmn',
  'letter of medical necessity': 'lmn',
  'doctor letter': 'lmn',

  // Referral
  referral: 'referral',
  refer: 'referral',
  invite: 'referral',
  friend: 'referral',

  // Respite fund
  respite: 'respite_fund',
  'respite fund': 'respite_fund',
  break: 'respite_fund',

  // Equity
  equity: 'equity',
  shares: 'equity',
  'ownership stake': 'equity',

  // Care logs
  'care log': 'care_logs',
  omaha: 'care_logs',
  documentation: 'care_logs',

  // Human escalation
  'talk to someone': 'human_escalation',
  'real person': 'human_escalation',
  human: 'human_escalation',
  phone: 'human_escalation',
  call: 'human_escalation',

  // Background check
  'background check': 'background_check',
  background: 'background_check',
  'safety check': 'background_check',
  checkr: 'background_check',
  vetting: 'background_check',

  // Care questions
  sundowning: 'care_questions',
  fall: 'care_questions',
  falls: 'care_questions',
  medication: 'care_questions',
  wandering: 'care_questions',
  'advance directive': 'care_questions',
  hospice: 'care_questions',

  // Emotional support — includes conversational phrases people actually say
  guilt: 'emotional_support',
  guilty: 'emotional_support',
  lonely: 'emotional_support',
  alone: 'emotional_support',
  sad: 'emotional_support',
  crying: 'emotional_support',
  angry: 'emotional_support',
  frustrated: 'emotional_support',
  tired: 'emotional_support',
  grief: 'emotional_support',
  loss: 'emotional_support',
  depressed: 'emotional_support',
  'someone to talk to': 'emotional_support',
  'need to talk': 'emotional_support',
  'just listen': 'emotional_support',
  'just need someone': 'emotional_support',
  'need someone to listen': 'emotional_support',
  struggling: 'emotional_support',
  'hard time': 'emotional_support',
  'having a rough': 'emotional_support',
  'tough day': 'emotional_support',
  'need support': 'emotional_support',
  'feeling down': 'emotional_support',
  "can't do this": 'emotional_support',
  'too much': 'emotional_support',
  'breaking point': 'emotional_support',
  'at my limit': 'emotional_support',

  // Visit workflow — the brilliant caregiver journey
  'how visit works': 'visit_workflow',
  'how does a visit work': 'visit_workflow',
  'caregiver workflow': 'visit_workflow',
  'what happens during': 'visit_workflow',
  'show me how': 'visit_workflow',
  'how it works': 'visit_workflow',
  'walk me through': 'visit_workflow',
  'step by step': 'visit_workflow',
  'the process': 'visit_workflow',
  'how does it work': 'visit_workflow',

  // Tell my story — conversation asset building
  'my story': 'tell_my_story',
  'tell you about': 'tell_my_story',
  'my situation': 'tell_my_story',
  'my family': 'tell_my_story',
  'caring for': 'tell_my_story',
  'i take care of': 'tell_my_story',
  'about me': 'tell_my_story',
  'my life': 'tell_my_story',
  profile: 'tell_my_story',
  'learn from me': 'tell_my_story',
  'fill out': 'tell_my_story',
  update: 'tell_my_story',
  'learn about me': 'tell_my_story',
  'get to know': 'tell_my_story',
  account: 'tell_my_story',
  'my card': 'tell_my_story',
  'my name': 'tell_my_story',
};

const SORTED_KEYWORDS = Object.keys(KEYWORDS).sort((a, b) => b.length - a.length);

export function classify(msg: string): Domain {
  const lower = msg.toLowerCase();
  for (const kw of SORTED_KEYWORDS) {
    if (lower.includes(kw)) return KEYWORDS[kw]!;
  }
  return 'default';
}

// ─── Utilities ──────────────────────────────────────────────────────

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

let _uid = 0;
export function uid(): string {
  return `msg-${Date.now()}-${++_uid}`;
}

export function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "You're up late. I'm here if you need to talk.";
  if (h < 12) return 'Good morning!';
  if (h < 17) return 'Good afternoon!';
  if (h < 21) return 'Good evening!';
  return "It's getting late. How are you holding up?";
}

export function getThinkingSteps(domain: Domain): string[] {
  switch (domain) {
    case 'emergency':
    case 'crisis':
      return THINKING_SEQUENCES.safety!;
    case 'assessment':
      return THINKING_SEQUENCES.assessment!;
    case 'emotional_support':
      return THINKING_SEQUENCES.emotional!;
    case 'family_intake':
    case 'worker_intake':
    case 'intake':
      return THINKING_SEQUENCES.intake!;
    case 'billing':
    case 'coverage':
    case 'lmn':
    case 'tier':
      return THINKING_SEQUENCES.financial!;
    case 'care_questions':
      return THINKING_SEQUENCES.search!;
    default:
      return THINKING_SEQUENCES.general!;
  }
}

// ─── Assessment ─────────────────────────────────────────────────────

export function calculateZone(score: number): AssessmentZone {
  if (score <= 11) {
    return {
      zone: 'green',
      label: "You're managing well",
      color: '#22c55e',
      description: 'Your stress levels are in a healthy range. Keep up your self-care routines.',
    };
  }
  if (score <= 20) {
    return {
      zone: 'yellow',
      label: 'Moderate stress',
      color: '#eab308',
      description:
        "You're carrying a significant load. Let's look at ways to lighten it before it becomes overwhelming.",
    };
  }
  return {
    zone: 'red',
    label: "High stress — let's get you support",
    color: '#ef4444',
    description:
      "You're under serious strain. You deserve help, and we have resources ready for you right now.",
  };
}

// ─── Profile Persistence ────────────────────────────────────────────

const PROFILE_KEY = 'coop_user_profile';

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw) as UserProfile;
  } catch {
    /* noop */
  }
  return {
    conversationCount: 0,
    topDomains: {},
    referralCount: 0,
    lastVisit: new Date().toISOString(),
  };
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* noop */
  }
}

// ─── Chat Persistence ───────────────────────────────────────────────

export interface StoredMessage {
  id: string;
  role: 'user' | 'sage';
  content: string;
  timestamp: number;
}

export function getChatKey(userId: string): string {
  return `coop_sage_chat_${userId}`;
}

export function loadMessages(userId: string): StoredMessage[] {
  try {
    const raw = localStorage.getItem(getChatKey(userId));
    return raw ? (JSON.parse(raw) as StoredMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveMessages(userId: string, messages: StoredMessage[]): void {
  try {
    const toSave = messages.slice(-50);
    localStorage.setItem(getChatKey(userId), JSON.stringify(toSave));
  } catch {
    /* noop */
  }
}

// ─── Welcome Messages ───────────────────────────────────────────────

export function getWelcomeMessage(opts: {
  isNewVisitor?: boolean;
  isReturning?: boolean;
  isMember?: boolean;
  isComfortCard?: boolean;
  isReferred?: boolean;
  referrerName?: string | null;
  firstName?: string;
}): SageResponse {
  const greeting = getTimeGreeting();

  if (opts.isReferred && opts.referrerName) {
    return {
      content: `${greeting} ${opts.referrerName} thought you'd like co-op.care! I'm Sage, your guide to our neighbor-powered care community.\n\nYou both get a **free Time Bank hour** just for connecting. When you get your free Comfort Card, you're instantly part of their care circle.\n\nWhat brought you here today?`,
      followups: [
        { label: 'What is this?', message: 'What is co-op.care?' },
        { label: 'Get my card', message: 'I want my free Comfort Card' },
        { label: 'How does Time Bank work?', message: 'Tell me about the Time Bank' },
      ],
    };
  }

  if (opts.isComfortCard && opts.firstName) {
    const name = opts.firstName === 'New Member' ? '' : `, ${opts.firstName}`;
    return {
      content: `Welcome back${name}!\n\nYour card is ready. I'm here whenever you want to talk — about your care situation, your family, or just to check in.\n\nWhat's on your mind?`,
      followups: [
        { label: 'Tell my story', message: 'I want to tell you about my care situation' },
        { label: 'How visits work', message: 'Walk me through how a care visit works' },
        { label: 'Wellness check', message: "Let's do a quick wellness check" },
        { label: 'Share my card', message: 'I want to share my QR code with someone' },
      ],
    };
  }

  if (opts.isMember) {
    return {
      content: `${greeting} Welcome back! What can I help you with?`,
      followups: [
        { label: 'My schedule', message: 'Show me my upcoming visits' },
        { label: 'Time Bank', message: 'Check my Time Bank balance' },
        { label: 'Care check-in', message: 'I want to do a caregiver check-in' },
      ],
    };
  }

  if (opts.isReturning) {
    return {
      content: `${greeting} Good to see you again! I remember we were chatting before. What's on your mind today?`,
      followups: [
        { label: 'Continue exploring', message: 'Tell me more about co-op.care' },
        { label: 'Get my card', message: 'I want my free Comfort Card' },
        { label: 'Check in', message: 'How am I doing as a caregiver?' },
      ],
    };
  }

  // New visitor — warm, question-first, inviting
  return {
    content: `${greeting} I'm Sage.\n\nI'm here to listen. Whether you're caring for someone you love, thinking about helping a neighbor, or just wondering what this is — I'd love to hear your story.\n\nWhat's on your mind today?`,
    followups: SUGGESTED_TOPICS.slice(0, 4),
  };
}

// ─── Emotional Support (profile-aware) ──────────────────────────────

function pickEmotionalResponse(profile: UserProfile): SageResponse {
  // Red zone — urgent but gentle
  if (profile.lastMiniCII && profile.lastMiniCII.zone === 'red') {
    return {
      content:
        "I remember you were carrying a lot last time we talked.\n\nI'm not going to tell you what to do. But I want you to know: our **Respite Fund** exists specifically for moments like this — 4 hours of free care so you can breathe.\n\nBut first — how are you *right now*? Not your parent, not your schedule. You.",
      followups: [
        {
          label: 'Honestly, not great',
          message: "I'm really struggling. I don't know how much longer I can do this.",
        },
        { label: 'I need a break', message: 'Tell me about the Respite Fund — I think I need it' },
        { label: 'I just need to talk', message: 'I just need someone to listen right now' },
      ],
      thinkingSteps: THINKING_SEQUENCES.emotional,
    };
  }

  // Frequent emotional user — they keep coming back
  const emotionalCount = profile.topDomains['emotional_support'] ?? 0;
  if (emotionalCount > 3) {
    return {
      content:
        "You keep coming back here, and I'm glad you do. That tells me something important — you need a steady presence, not just a crisis line.\n\nCan I ask: what would help the most right now? Not long-term, not someday. *Today.*",
      followups: [
        {
          label: 'Just peace and quiet',
          message: 'I need someone to take over for even an hour so I can rest',
        },
        {
          label: 'Someone who understands',
          message: 'I want to connect with someone who gets what this is like',
        },
        { label: 'A plan', message: "I need help making a plan so I'm not doing this alone" },
      ],
      thinkingSteps: THINKING_SEQUENCES.emotional,
    };
  }

  // Yellow zone — moderate stress
  if (profile.lastMiniCII && profile.lastMiniCII.zone === 'yellow') {
    return {
      content:
        "Last time you checked in, you were carrying more than most people realize. That hasn't gone away, has it?\n\nHere's what I've learned about caregivers: you always think you should be doing more. But you're already doing so much.\n\nWhat's the hardest part right now?",
      followups: [
        { label: "I'm not sleeping", message: "I'm up at night worrying. I can't turn it off." },
        { label: 'Nobody helps', message: "I feel like I'm doing this completely alone" },
        { label: 'I feel trapped', message: "I love them but I've lost my own life" },
      ],
      thinkingSteps: THINKING_SEQUENCES.emotional,
    };
  }

  // Default emotional — first time expressing feelings
  return {
    content:
      "I hear you.\n\nYou don't have to explain everything right now. Just knowing you're here, reaching out — that matters.\n\nCan you tell me what today has been like?",
    followups: [
      { label: 'Quick check-in', message: 'I want to do a caregiver check-in' },
      {
        label: "It's been a hard day",
        message: 'Today was really hard. I had to do everything myself again.',
      },
      { label: 'Check my wellness', message: "Maybe I should check how I'm really doing" },
      { label: 'Just keep talking', message: 'I just need someone to listen' },
    ],
    thinkingSteps: THINKING_SEQUENCES.emotional,
  };
}

// ─── Public Response Engine (unauthenticated visitors) ───────────────

export function generatePublicResponse(msg: string, domain?: Domain): SageResponse {
  const d = domain ?? classify(msg);

  switch (d) {
    case 'emergency':
      return {
        content:
          "**If someone is in immediate danger, call 911.**\n\nIf this is a medical emergency, please hang up with me and dial emergency services right away. I'll be here when you get back.",
        thinkingSteps: THINKING_SEQUENCES.safety,
      };

    case 'crisis':
      return {
        content:
          "I'm really glad you reached out. **You matter**, and help is available right now.\n\n**988 Suicide & Crisis Lifeline:** Call or text **988** (24/7)\n**Crisis Text Line:** Text **HOME** to **741741**\n\nThese are free, confidential services with trained counselors. You don't have to go through this alone.",
        thinkingSteps: THINKING_SEQUENCES.safety,
      };

    case 'assessment':
      return {
        content:
          "I'm glad you're checking in with yourself. That takes real self-awareness.\n\nLet me ask you three quick questions — just slide each one to where it feels true. There are no wrong answers.\n\nThis is between us.",
        component: { type: 'mini_cii' },
        thinkingSteps: THINKING_SEQUENCES.emotional,
      };

    case 'billing':
      return {
        content: pick([
          'Great question about cost. co-op.care companion care is **$35/hr** — comparable to agencies, but with a crucial difference: your caregiver earns equity and stays.\n\n**$59/month Care Card membership** unlocks HSA/FSA eligibility, so your effective rate drops to ~$23/hr.\n\n**Plans (flexible, no contracts):**\n- **Peace of Mind** — 5 hrs/wk (~$758/mo before tax savings, ~$523 with HSA)\n- **Regular** — 10-15 hrs/wk ($1,517-$2,275/mo before, ~$1,030-$1,547 with HSA)\n- **Daily** — 20-25 hrs/wk ($3,033-$3,792/mo before, ~$2,062-$2,578 with HSA)\n\nAgencies charge $35-45/hr with no equity, no HSA coordination, and a different person every week. Your $59 membership pays for itself in month 1.\n\nWant to explore payment options or learn about HSA/FSA savings?',
          "Here's how our pricing works:\n\n**$35/hr for companion care.** Add the **$59/month Care Card membership** and every dollar becomes HSA/FSA eligible — effectively ~$23/hr.\n\n**Flexible plans — you choose the hours you need:**\n- **5 hrs/wk** (~$758/mo, ~$523 with HSA) — Peace of Mind\n- **10-15 hrs/wk** ($1,517-$2,275/mo, ~$1,030-$1,547 with HSA) — Regular\n- **20-25 hrs/wk** ($3,033-$3,792/mo, ~$2,062-$2,578 with HSA) — Daily\n\nCompare to agencies at $35-45/hr with no equity, no HSA coordination, and a different person every week. No contracts. Adjust anytime.\n\nWant to know about tax savings or the Care Card membership?",
        ]),
        followups: [
          { label: 'HSA/FSA details', message: 'How do I use my HSA or FSA?' },
          { label: 'LMN letter', message: 'What is a Letter of Medical Necessity?' },
          { label: 'Compare costs', message: 'How does this compare to an agency?' },
        ],
        thinkingSteps: THINKING_SEQUENCES.financial,
      };

    case 'timebank':
      return {
        content: pick([
          "The **Time Bank** is the heart of co-op.care.\n\n**How it works:** Every hour you give is an hour you earn. Help a neighbor with groceries? That's an hour in your bank. Need someone to sit with your mom? Spend an hour.\n\n**Rate:** $35/hr — and with your **$59/month Care Card membership**, every dollar is HSA/FSA eligible.\n\nThe Time Bank tracks hours given and received. When you spend hours, you pay $35/hr. It's neighbor-to-neighbor, tracked on your Care Card. No corporate middleman.",
          'Think of the **Time Bank** like a neighborhood favor system, but structured and trustworthy.\n\n**Give an hour** of companionship, a ride, meal prep, or errands.\n**Earn an hour** you can use when YOU need help.\n\nEverything is tracked through your Comfort Card. Your hours never expire.',
        ]),
        followups: [
          { label: 'What can I do?', message: 'What kinds of tasks can I help with?' },
          { label: 'Get my card', message: 'I want my free Comfort Card' },
          { label: 'How is it tracked?', message: 'How are hours tracked?' },
        ],
      };

    case 'scheduling':
      return {
        content: pick([
          'Scheduling with co-op.care is simple:\n\n1. **Tell us what you need** — companionship, errands, meals, rides\n2. **We match you** with a vetted care neighbor\n3. **Confirm the visit** through your Comfort Card\n\nOur AI matching considers proximity, skills, availability, and relationship history. Same caregiver, same trust.\n\nWant to get started?',
          "Ready to schedule? Here's how:\n\n**First visit:** We match you with a neighbor based on your needs, location, and preferences.\n**Ongoing:** Your matched neighbor becomes your regular companion. Same face, same trust.\n\nNo minimum commitment. Cancel anytime.",
        ]),
        followups: [
          { label: 'Get started', message: 'I want to schedule my first visit' },
          { label: 'How matching works', message: 'How do you match me with a neighbor?' },
        ],
      };

    case 'family_intake': {
      // If they've done the CII but not the CRI, offer the care recipient assessment
      const p = loadProfile();
      if (p.lastMiniCII && !p.lastCRI) {
        return {
          content:
            "Thank you for sharing. You've already told me how *you're* doing — now I'd like to understand the person you're caring for.\n\nSlide each one to where it feels true. This helps me match you with the right kind of support.",
          component: { type: 'care_recipient' },
          thinkingSteps: THINKING_SEQUENCES.emotional,
        };
      }
      return {
        content:
          "Thank you for sharing that. Family caregiving is one of the hardest and most invisible things a person can do.\n\nI'd love to understand your world a little better. Tell me about the person you're caring for — what's a typical day look like for the two of you?",
        followups: [
          {
            label: 'They live alone',
            message: 'They live alone and I worry about them constantly',
          },
          {
            label: 'They live with me',
            message: "They live with us and it's a lot — meals, meds, everything",
          },
          {
            label: "I'm the only one",
            message: "I'm doing this mostly alone and I'm running out of energy",
          },
          { label: 'Assess their needs', message: "I want to assess my loved one's care needs" },
        ],
        thinkingSteps: THINKING_SEQUENCES.emotional,
      };
    }

    case 'worker_intake':
      return {
        content:
          "That's wonderful — we need people like you.\n\nBefore I tell you about us, I'd love to know: what draws you to caregiving? Is it someone in your life who needs help, or do you just feel like you have something to give?\n\nThere's no wrong answer — it helps me understand what role might fit you best.",
        followups: [
          {
            label: 'Someone I know needs help',
            message: "There's someone in my neighborhood who could really use companionship",
          },
          {
            label: 'I want to give back',
            message: 'I have free time and I want to do something meaningful with it',
          },
          {
            label: 'I need flexible work',
            message:
              "I'm looking for flexible work that actually pays well and treats people right",
          },
        ],
        thinkingSteps: THINKING_SEQUENCES.intake,
      };

    case 'how_different':
      return {
        content:
          "Most home care companies send you a stranger and a bill. co-op.care is different in five ways no one else combines:\n\n**1. The caregivers own the company.** Not gig workers. Not temps. W-2 employees earning **$25-28/hr + equity** in the cooperative they build. That's why they stay — and why your mom sees the same faces.\n\n**2. A real physician is in the loop — for $59/month.** Not a chatbot. A licensed doctor who reviews every care plan, signs the letter that lets you pay with your HSA, and oversees everything. The physician letter is included. No extra cost.\n\n**3. Every interaction produces clinical data — even a neighbor's visit.** Your neighbor stops by for 20 minutes and taps what she noticed on her phone. That observation flows through the same AI pipeline as a professional caregiver's — coded in the Omaha System, stored in FHIR, visible to the physician.\n\n**4. The community builds itself.** co-op.care doesn't sell to neighborhoods. It grows from them. Each community owns its data and governance. Federation, not franchise.\n\n**5. Your voice is the interface.** Sage — the AI you're talking to right now — handles scheduling, check-ins, care questions, and medication reminders through conversation. Behind the scenes, it extracts clinical documentation automatically.\n\nFive care sources. One physician. One $59 membership. Zero handoffs. Worker-owned. Community-powered.\n\nWhat matters most to you?",
        followups: [
          {
            label: 'The ownership part',
            message: 'Tell me more about how caregivers own the company',
          },
          { label: 'The physician', message: 'How does the physician oversight actually work?' },
          { label: 'How is it $59?', message: 'How can you offer all that for $59 a month?' },
        ],
      };

    case 'membership':
      return {
        content:
          "co-op.care membership is **$59/month** and includes everything:\n\n- **Physician oversight** — A licensed doctor (50-state) reviews your care plan and signs your Letter of Medical Necessity\n- **HSA/FSA eligibility** — That letter unlocks your health savings account, saving you **28-36%** on care costs\n- **Sage AI** — Your 24/7 care companion for scheduling, check-ins, medication reminders\n- **Care coordination** — Professional caregivers, neighbors, and family all connected under one plan\n- **Time Bank** — Give an hour of help, get an hour back\n- **Clinical documentation** — Every visit produces physician-grade records\n\nYour **free Comfort Card** is always free — it's your digital identity in the care community. The $59 membership unlocks physician oversight and HSA savings.\n\nFor most families, the HSA tax savings alone exceed the membership cost.",
        followups: [
          { label: 'Get free card first', message: 'I want my free Comfort Card to start' },
          {
            label: 'HSA savings math',
            message: 'Show me how the HSA savings work with the $59 membership',
          },
          {
            label: 'What does the doctor do?',
            message: 'What exactly does the physician do for my $59?',
          },
        ],
      };

    case 'tier':
      return {
        content:
          "Your care grows with you:\n\n**Seedling** (0-39 care hours) — 1.0x Time Bank multiplier. You're getting started.\n\n**Rooted** (40-119 care hours) — 1.25x multiplier. Your care network is established.\n\n**Canopy** (120+ care hours) — 1.5x multiplier. Credits never expire. Priority matching.\n\nEveryone starts as Seedling with a free Comfort Card. The **$59/month membership** unlocks physician oversight and HSA/FSA savings at any tier.\n\nYour tier advances automatically as you give and receive care.",
        followups: [
          { label: 'Start free', message: 'Get my free Comfort Card' },
          { label: 'How do I earn hours?', message: 'How do I earn care hours to advance tiers?' },
          { label: "What's Time Bank?", message: 'How does the Time Bank multiplier work?' },
        ],
      };

    case 'qr':
      return {
        content:
          'Your **QR code** is your key to the co-op.care community.\n\n**How it works:**\n- Share your QR with family, neighbors, anyone who helps\n- They scan it to connect with you in our network\n- Track Time Bank hours automatically\n- Verify identity for safety\n\n**Privacy first:** Your QR only shares your first name and member ID. No phone number, no address, no personal details unless you choose to share them.\n\nWant your free Comfort Card with your personal QR code?',
        followups: [
          { label: 'Get my card', message: 'I want my free Comfort Card' },
          { label: 'Privacy details', message: 'What data does the QR code share?' },
        ],
      };

    case 'governance':
      return {
        content:
          "co-op.care is a **Limited Cooperative Association (LCA)** — that means the workers own it.\n\n**How governance works:**\n- Every worker-owner gets **one vote**\n- Board of directors elected by members\n- Transparent financials\n- Profit sharing based on hours worked\n\nThis isn't a gig platform where someone else gets rich off your labor. It's **your** cooperative.",
        followups: [
          { label: 'How do I vote?', message: 'How does voting work in the cooperative?' },
          { label: 'Equity details', message: 'Tell me about the equity ownership' },
          { label: 'Become a member', message: 'How do I become a worker-owner?' },
        ],
      };

    case 'coverage':
      return {
        content:
          "Here's what we know about coverage:\n\n**HSA/FSA:** Yes! With a Letter of Medical Necessity (LMN), companion care through co-op.care qualifies. Tax savings of **28-36%**.\n\n**Medicare:** Traditional Medicare doesn't cover companion care. But CMS ACCESS and ELEVATE programs (coming 2026-2027) may change this.\n\n**Medicaid:** Some Medicaid waiver programs cover personal care. We can help you check eligibility.\n\n**Long-term care insurance:** Many policies cover companion care. Check your policy or ask us to help review it.",
        followups: [
          { label: 'Get an LMN', message: 'How do I get a Letter of Medical Necessity?' },
          { label: 'Check Medicaid', message: 'Am I eligible for Medicaid coverage?' },
          { label: 'Tax savings', message: 'Tell me more about the tax savings' },
        ],
        thinkingSteps: THINKING_SEQUENCES.financial,
      };

    case 'lmn':
      return {
        content:
          "A **Letter of Medical Necessity** is your key to **saving 28-36%** on care costs through your HSA or FSA.\n\nHere's the best part: **you don't need to go anywhere.** Our process is practically automatic:\n\n1. **You've already started** — this conversation is building your care profile right now\n2. **One tap** — when your profile is ready, I'll ask \"Want to check your HSA/FSA eligibility?\" You tap yes.\n3. **We handle the rest** — our system generates the letter from your assessment data\n4. **Dr. Emdur signs it** — our physician co-founder is licensed in all 50 states. He reviews and signs within 24 hours.\n5. **You download it** — upload to your HSA portal or give to your benefits administrator\n\n**Cost:** $150-300 (and it typically saves families **$3,000-6,000/year**).\n\nWant to check your eligibility right now? I just need to ask you a few quick questions about your care situation.",
        followups: [
          { label: 'Check my eligibility', message: 'Yes, check if I qualify for an LMN' },
          { label: 'How much would I save?', message: 'Calculate my potential HSA/FSA savings' },
          {
            label: 'How does Dr. Emdur review it?',
            message: 'Tell me about the physician review process',
          },
        ],
        thinkingSteps: THINKING_SEQUENCES.financial,
      };

    case 'referral':
      return {
        content:
          "Here's the deal — and it's a good one.\n\n**Share your card. You both get a free hour.**\n\nThat's it. You share your QR code with someone — a neighbor, a family member, a friend who could use support. They get their free Comfort Card. You **both** get an hour in your Time Bank.\n\nAnd here's where it gets interesting:\n\n**5 referrals = Founding Circle member**\nThe first people who build this community get recognized forever. Founding Circle members get priority matching, early access to new features, and a gold badge on their card.\n\nYour card is your invitation. Who needs this in your life?",
        followups: [
          { label: 'Share my card now', message: 'I want to share my QR code right now' },
          {
            label: "What's Founding Circle?",
            message: 'Tell me more about the Founding Circle benefits',
          },
          { label: 'Get my card first', message: 'I need my Comfort Card first' },
        ],
      };

    case 'respite_fund':
      return {
        content:
          "The **Respite Fund** exists because every caregiver deserves a break.\n\n**How it works:**\n- $3 from every Time Bank hour goes into the fund\n- Caregivers in the **red zone** (high stress) can request up to **4 hours of free care**\n- No paperwork, no guilt, no strings\n\nThis is the community taking care of its own. If you're running on empty, this is for you.",
        followups: [
          { label: 'Am I eligible?', message: 'How do I qualify for the Respite Fund?' },
          { label: 'Check my stress', message: 'I want to do a caregiver check-in' },
        ],
      };

    case 'equity':
      return {
        content:
          'This is what makes co-op.care truly different.\n\n**Worker-owner equity:**\n- Every Care Neighbor earns ownership stake\n- Projected value: **$52K** per share at scale\n- Profit sharing based on hours worked\n- Voting rights on cooperative decisions\n- Vesting over 2 years\n\nTraditional agencies extract value from workers. We **share** it. When the cooperative grows, everyone grows.',
        followups: [
          { label: 'How does vesting work?', message: 'How does equity vesting work?' },
          { label: 'Become a neighbor', message: 'I want to become a Care Neighbor' },
        ],
      };

    case 'human_escalation':
      return {
        content:
          "Absolutely — sometimes you need a voice, not a screen. I completely understand.\n\n**hello@co-op.care**\n\nWe're pre-launch, so right now the best way to reach a real person is email. But I promise — you'll hear back from someone who actually cares.\n\nIn the meantime, I'm still here. What's going on?",
        followups: [
          { label: 'Keep talking to Sage', message: "Actually, let me tell you what's happening" },
          { label: "I'll email", message: "I'll send an email — what should I include?" },
        ],
      };

    case 'background_check':
      return {
        content:
          'Safety is non-negotiable at co-op.care.\n\n**Every Care Neighbor** undergoes:\n- **Checkr background check** — criminal, sex offender registry, SSN verification\n- **Reference checks** — 3 personal/professional references\n- **Training verification** — CPR, First Aid, companion care basics\n\n**Cost:** $30 one-time, or **free** if you have a Letter of Medical Necessity (LMN upgrade)\n\nResults are confidential and stored securely. Most checks complete in 1-3 business days.',
        followups: [
          { label: 'Start my check', message: 'I want to start my background check' },
          { label: 'Free with LMN', message: 'How do I get the background check for free?' },
        ],
      };

    case 'care_questions':
      return {
        content: pick([
          "That's a really important question. Tell me more about what's happening — is this something new, or has it been building for a while?\n\nI can share what I know, and if it's something that needs a doctor's eye, I'll be honest about that too.",
          'I want to make sure I give you something actually helpful. Can you paint me a picture — when does this usually happen? Morning, evening, after meals?\n\nThe more I understand, the better I can help you think through it.',
        ]),
        followups: [
          { label: 'Safety at home', message: "I'm worried about falls and safety in the house" },
          {
            label: 'Sundowning',
            message: 'The evenings are getting harder. They get confused and agitated.',
          },
          { label: 'Medications', message: 'Managing medications is overwhelming' },
        ],
        thinkingSteps: THINKING_SEQUENCES.search,
      };

    case 'emotional_support':
      return pickEmotionalResponse(loadProfile());

    case 'streaks':
      return {
        content:
          "**Daily check-ins** build your care community streak!\n\nEvery day you check in with Sage (that's me), you earn streak points. These unlock:\n- Milestone badges\n- Referral bonus multipliers\n- Community recognition\n\nIt's a small thing, but it keeps you connected and reminds you to take care of yourself too.",
        followups: [
          { label: 'Start a streak', message: 'I want to start my check-in streak' },
          { label: 'Check in now', message: 'Let me do my daily check-in' },
        ],
      };

    case 'care_logs':
      return {
        content:
          '**Care Logs** use the Omaha System — the gold standard for community health documentation.\n\n**What gets tracked:**\n- Visit notes from each Care Neighbor interaction\n- Health observations and changes\n- Tasks completed\n- Family communication notes\n\n**Why it matters:** Continuous documentation means nothing falls through the cracks. Every caregiver who visits your loved one can see the full picture.\n\nThis is available for Rooted and Canopy members.',
        followups: [
          { label: 'See an example', message: 'What does a care log entry look like?' },
          { label: 'Upgrade', message: 'How do I upgrade to Rooted?' },
        ],
      };

    case 'intake':
      return {
        content:
          "I'd love to get to know you better first.\n\nBefore we do anything — are you here because someone you love needs help? Or because *you* want to be the person who shows up for a neighbor?",
        followups: [
          {
            label: 'Someone needs help',
            message: "My parent needs help and I can't do it all alone anymore",
          },
          { label: 'I want to help', message: 'I want to help someone in my community' },
          { label: 'Just exploring', message: "I'm just curious about how this works" },
        ],
      };

    case 'visit_workflow':
      return {
        content:
          "Here's what makes co-op.care different from anything else out there:\n\n**1. Scan a QR code**\nYou share your Comfort Card. A neighbor scans it. That's the handshake.\n\n**2. The visit happens naturally**\nCompanionship, a meal, a drive to the doctor. The phone listens quietly — with your permission — to understand what kind of care is happening.\n\n**3. Automatic Omaha classification**\nThe conversation is mapped to clinical care categories in real-time. Psychosocial support. Health monitoring. Environmental safety. This is the same system hospitals use.\n\n**4. Billing codes generated**\nCMS-recognized codes — G0023, G0019, 99490 — are created automatically. No paperwork. No guesswork.\n\n**5. Smart contract settlement**\nTime Bank hours are credited instantly. If the visit qualifies for reimbursement, the billing flows through automatically.\n\nAll of this happens in the background. The caregiver just... cares.\n\nWhat part would you like to know more about?",
        followups: [
          {
            label: 'How does the listening work?',
            message: 'How does the voice recording work during a visit? Is it private?',
          },
          {
            label: 'What are the billing codes?',
            message: 'Tell me about the CMS billing codes and how reimbursement works',
          },
          { label: 'Tell my story first', message: 'I want to tell you about my care situation' },
        ],
      };

    case 'tell_my_story': {
      const storyProfile = loadProfile();
      const hasAnyProfile =
        storyProfile.careRecipient?.name ||
        storyProfile.careRecipient?.relationship ||
        storyProfile.lastMiniCII;

      if (hasAnyProfile) {
        // They already have profile data — acknowledge and build on it
        const parts: string[] = ["Here's what I know about you so far:"];
        if (storyProfile.careRecipient?.name)
          parts.push(`\n• You're caring for **${storyProfile.careRecipient.name}**`);
        if (storyProfile.careRecipient?.relationship)
          parts.push(`• Relationship: ${storyProfile.careRecipient.relationship}`);
        if (storyProfile.careRecipient?.conditions?.length)
          parts.push(`• Conditions: ${storyProfile.careRecipient.conditions.join(', ')}`);
        if (storyProfile.lastMiniCII)
          parts.push(
            `• Your last wellness score: ${storyProfile.lastMiniCII.total}/30 (${storyProfile.lastMiniCII.zone} zone)`,
          );
        parts.push('\nWant to add more or update anything?');

        return {
          content: parts.join('\n'),
          followups: [
            {
              label: 'Update care recipient',
              message: "Let me update you on my loved one's situation",
            },
            { label: 'Check my wellness', message: 'I want to redo my wellness check-in' },
            { label: 'Add my network', message: 'Let me tell you about the people who help me' },
          ],
          thinkingSteps: THINKING_SEQUENCES.emotional,
        };
      }

      return {
        content:
          "I'd love to hear about you.\n\nThere's no form to fill out, no boxes to check. Just tell me what's happening in your life, and I'll remember.\n\nSome things that might help me understand:",
        followups: [
          {
            label: 'Who I care for',
            message: "I'm caring for my parent. Let me tell you about them.",
          },
          {
            label: "How I'm feeling",
            message: "Honestly? I'm exhausted. I don't know how much longer I can keep this up.",
          },
          {
            label: 'I want to help others',
            message: 'I have time and I want to help someone in my neighborhood.',
          },
          {
            label: 'Just exploring',
            message: "I'm not sure what I need yet. I just know something has to change.",
          },
        ],
        thinkingSteps: THINKING_SEQUENCES.emotional,
      };
    }

    default:
      return getSmartDefault(msg);
  }
}

// ─── Smart Default — context-aware, never loops ─────────────────────

let _defaultIndex = 0;

function getSmartDefault(text: string): SageResponse {
  const profile = loadProfile();
  const lower = text.toLowerCase().trim();

  // If user typed a name (short input, no question marks, capitalized)
  if (lower.length < 30 && !lower.includes('?') && /^[A-Z]/.test(text.trim())) {
    const firstName = text.trim().split(/\s+/)[0] ?? text.trim();
    return {
      content: `Nice to meet you, **${firstName}**!\n\nI'm Sage — I'm here to help you figure out what kind of support you or your family might need.\n\nThere's no form to fill out. Just tell me what's going on in your life, and I'll remember it.`,
      followups: [
        {
          label: 'I need care for someone',
          message: "I'm looking for help caring for a family member",
        },
        { label: 'I want to give care', message: "I'm interested in becoming a Care Neighbor" },
        { label: 'Just exploring', message: "I'm just curious about how co-op.care works" },
        { label: 'Check my wellness', message: 'I think I might be burning out as a caregiver' },
      ],
    };
  }

  // Build profile-aware responses that cycle and never repeat
  const responses: SageResponse[] = [];

  // If they have a care recipient, ask about them
  if (profile.careRecipient?.name) {
    responses.push({
      content: `I remember you're caring for **${profile.careRecipient.name}**. How are things going? Any changes I should know about?`,
      followups: [
        {
          label: 'Things changed',
          message: `Yes, there have been some changes with ${profile.careRecipient.name}`,
        },
        {
          label: 'Check my stress',
          message: "Actually, I want to check how I'm doing as a caregiver",
        },
        { label: 'Get care hours', message: 'I need help scheduling care visits' },
      ],
    });
  }

  // If they haven't done a wellness check
  if (!profile.lastMiniCII) {
    responses.push({
      content:
        "I'd love to understand your situation better. How about a quick **30-second wellness check**? It's just 3 sliders — takes no time at all, and it helps me give you better support.",
      followups: [
        { label: 'Do the check-in', message: 'Yes, let me do the wellness check' },
        { label: 'Tell my story first', message: 'Let me tell you about my care situation first' },
        { label: 'What does it cost?', message: 'How much does co-op.care cost?' },
      ],
    });
  }

  // If they haven't done CRI
  if (!profile.lastCRI && profile.careRecipient) {
    responses.push({
      content:
        "You've told me about your care situation, which is really helpful. Would you like to do a quick assessment of your loved one's needs? It helps me understand what kind of support would make the biggest difference.",
      followups: [
        { label: 'Assess their needs', message: "Yes, let me assess my loved one's needs" },
        { label: 'My needs first', message: 'I want to focus on my own wellness first' },
      ],
    });
  }

  // General conversational responses that don't loop
  responses.push(
    {
      content:
        "I want to make sure I'm being helpful. What would be most useful right now — learning about what co-op.care offers, talking through your care situation, or just having someone listen?",
      followups: [
        { label: 'What co-op.care offers', message: 'Tell me what co-op.care actually does' },
        { label: 'Talk about my situation', message: 'I want to tell you about my care situation' },
        { label: 'Just listen', message: 'I just need someone to talk to right now' },
      ],
    },
    {
      content:
        "Everyone's care journey is different. Some people come here because they're **caring for a parent**. Others want to **become a caregiver**. Some just need to know their options.\n\nWhat's bringing you here today?",
      followups: [
        { label: 'Caring for someone', message: "I'm caring for a loved one and need help" },
        { label: 'Want to help others', message: 'I want to become a Care Neighbor' },
        {
          label: 'Exploring options',
          message: 'I want to understand what kind of care is available',
        },
      ],
    },
    {
      content:
        "Here are some things I can help with right now:\n\n• **Tell me your story** — I'll remember your care situation and personalize everything\n• **Wellness check** — 30 seconds to see how you're really doing\n• **How co-op.care works** — pricing, Time Bank, cooperative ownership\n• **Get your card** — share it to earn free care hours\n\nWhat sounds most useful?",
      followups: [
        { label: 'Tell my story', message: 'I want to tell you about my care situation' },
        { label: 'Wellness check', message: 'Let me do the caregiver wellness check' },
        { label: 'How it works', message: 'Walk me through how co-op.care works' },
        { label: 'Share my card', message: 'I want to share my card and earn hours' },
      ],
    },
    {
      content:
        "I appreciate you being here. The fact that you're reaching out already says something important about who you are.\n\nWant to tell me a bit about what's going on? I'm a good listener, and I'll remember everything for next time.",
      followups: [
        { label: 'My care situation', message: "Here's what's happening in my life" },
        { label: 'How do I start?', message: 'What should I do first on co-op.care?' },
        { label: 'Check my wellness', message: 'Am I burned out? Let me check' },
      ],
    },
  );

  // Cycle through responses deterministically (no repeats until all shown)
  const idx = _defaultIndex % responses.length;
  _defaultIndex++;
  return responses[idx]!;
}

// ─── Onboarding Response Engine ─────────────────────────────────────

export function getOnboardingResponse(
  phase: OnboardingPhase,
  text: string,
  domain: Domain,
): SageResponse | null {
  const lower = text.toLowerCase();

  // If domain is emergency/crisis, always handle that first
  if (domain === 'emergency' || domain === 'crisis') return null; // Let main engine handle

  switch (phase) {
    case 'profile_intent': {
      if (lower.includes('care') && lower.includes('give')) {
        return {
          content:
            "Both! You're looking for care AND want to give back to the community. That's the co-op spirit.\n\nI'd love to learn more about what you're looking for. What roles interest you?",
          component: { type: 'role_picker' },
        };
      }
      if (
        lower.includes('care') ||
        lower.includes('help') ||
        lower.includes('parent') ||
        lower.includes('need')
      ) {
        return {
          content:
            "You're looking for care support — whether for yourself or a loved one. You're in the right place.\n\nTo connect you with the right resources, what interests you most?",
          component: { type: 'role_picker' },
        };
      }
      if (
        lower.includes('give') ||
        lower.includes('volunteer') ||
        lower.includes('neighbor') ||
        lower.includes('work')
      ) {
        return {
          content:
            "You want to give care and join as a Care Neighbor. We'd love to have you!\n\nWhat roles interest you?",
          component: { type: 'role_picker' },
        };
      }
      return null; // Unrecognized — let main engine handle
    }

    case 'profile_roles': {
      // After role picker completes, transition is handled by component result
      if (lower.includes('interested in') || lower.includes('selected')) {
        return {
          content:
            "Great choices! co-op.care is a **Limited Cooperative Association** — that means it's owned by the workers, not investors.\n\nWhen you join, you're not just getting care or giving it — you're part of a community that takes care of each other.\n\nWould you like to get your free Comfort Card? It's your digital identity in the co-op.",
          followups: [
            { label: 'Get my card', message: 'Yes, I want my Comfort Card!' },
            { label: 'Tell me more', message: 'How does the cooperative work?' },
            { label: 'Not yet', message: "I'm still learning" },
          ],
        };
      }
      return null;
    }

    case 'profile_community': {
      if (
        lower.includes('card') ||
        lower.includes('yes') ||
        lower.includes('join') ||
        lower.includes('sign')
      ) {
        return {
          content:
            'Before we set you up, one quick thing:\n\nI can remember our conversation to give you a more personalized experience next time. Your data stays on your device — I never share it.\n\nWould you like me to remember you?',
          component: { type: 'consent_picker' },
        };
      }
      if (lower.includes('ownership') || lower.includes('cooperative') || lower.includes('how')) {
        return {
          content:
            'The cooperative model is what makes us special:\n\n- **Workers earn $25-28/hr** + equity ownership\n- **Families pay $35/hr** — with HSA/FSA through the $59/mo Care Card, effectively ~$23/hr\n- **Everyone votes** on how the co-op runs\n- **Profits are shared** based on hours contributed\n\nNo corporate extraction. No venture capital pressure. Just neighbors helping neighbors.\n\nReady to get your free Care Card?',
          followups: [
            { label: 'Get my card', message: 'Yes, get me my card!' },
            { label: 'More questions', message: 'I have more questions first' },
          ],
        };
      }
      return null;
    }

    case 'memory_consent': {
      if (lower.includes('remember') || lower.includes('yes') || lower.includes('save')) {
        return {
          content:
            "I'll remember you! Your profile is saved locally on your device.\n\nNow let's get your **free Comfort Card** — it takes 30 seconds!",
          actions: [
            {
              id: 'get-card',
              label: 'Get My Comfort Card',
              icon: 'card',
              actionType: 'navigate',
              payload: '/join',
            },
          ],
        };
      }
      if (lower.includes('session') || lower.includes('no') || lower.includes("don't")) {
        return {
          content:
            "No problem! I'll keep things session-only. Nothing saved after you close this tab.\n\nLet's get your **free Comfort Card**!",
          actions: [
            {
              id: 'get-card',
              label: 'Get My Comfort Card',
              icon: 'card',
              actionType: 'navigate',
              payload: '/join',
            },
          ],
        };
      }
      if (
        lower.includes('what') ||
        lower.includes('store') ||
        lower.includes('data') ||
        lower.includes('privacy')
      ) {
        return {
          content:
            "Great question. Here's exactly what I store:\n\n- **Your first name** and member ID\n- **Conversation history** (last 50 messages)\n- **Assessment results** (if you do a check-in)\n- **Community roles** you're interested in\n\n**All stored locally** in your browser. Not on any server. Not shared with anyone. You can clear it anytime.\n\nWould you like me to remember you, or keep things session-only?",
          component: { type: 'consent_picker' },
        };
      }
      return null;
    }

    default:
      return null; // fresh, exploring, onboarded, returning — handled by main engine
  }
}

// ─── Member Domain Response Engine ──────────────────────────────────

export function getMemberResponse(domain: Domain, profile: UserProfile): SageResponse {
  // For members (authenticated), use the full domain switch
  // This is a superset of public responses with member-specific features
  switch (domain) {
    case 'emergency':
    case 'crisis':
    case 'how_different':
    case 'governance':
    case 'equity':
    case 'care_logs':
    case 'human_escalation':
    case 'background_check':
    case 'care_questions':
    case 'lmn':
    case 'coverage':
    case 'respite_fund':
    case 'streaks':
      // These are the same for public and member
      return generatePublicResponse('', domain);

    case 'assessment':
      return {
        content:
          "Let's do your check-in. This quick assessment helps me understand what you're going through so I can point you to the right support.",
        component: { type: 'mini_cii' },
        thinkingSteps: THINKING_SEQUENCES.assessment,
      };

    case 'billing':
      return {
        content:
          "Here's your billing overview:\n\n**Companion Care Rate:** $35/hr\n**Care Card Membership:** $59/month — includes LMN coordination and unlocks HSA/FSA eligibility\n**With HSA/FSA:** effective rate ~$23/hr (saves you **28-36%** in taxes)\n\nWant to set up automatic payments or check your current balance?",
        followups: [
          { label: 'Set up payments', message: 'How do I set up automatic payments?' },
          { label: 'Get an LMN', message: 'Help me get a Letter of Medical Necessity' },
          { label: 'Tax savings', message: 'Show me my potential tax savings' },
        ],
        thinkingSteps: THINKING_SEQUENCES.financial,
      };

    case 'timebank':
      return {
        content:
          'Your **Time Bank** tracks every hour given and received.\n\nAs a member, you can:\n- View your balance and history\n- See pending hours\n- Refer friends — **you both get a free hour** each time\n- Refer 5 people → **Founding Circle** status\n\nWhat would you like to do?',
        followups: [
          { label: 'Check balance', message: 'What is my Time Bank balance?' },
          { label: 'Refer a friend', message: 'I want to refer someone and earn hours' },
          { label: 'How to earn', message: 'What can I do to earn more hours?' },
        ],
      };

    case 'scheduling':
      return {
        content:
          "Let's get something on the calendar.\n\n**Your options:**\n- Schedule a new visit with your matched Care Neighbor\n- View upcoming visits\n- Request a different time\n\nWhat works best?",
        followups: [
          { label: 'New visit', message: 'I want to schedule a visit' },
          { label: 'View upcoming', message: 'Show me my upcoming visits' },
          { label: 'Change schedule', message: 'I need to change a visit time' },
        ],
      };

    case 'referral': {
      const refCount = profile.referralCount || 0;
      const refPlural = refCount === 1 ? '' : 's';
      const circleStatus =
        refCount >= 5
          ? " **You're a Founding Circle member!**"
          : ' ' + (5 - refCount) + ' more to **Founding Circle** status.';
      return {
        content:
          "Every time someone joins through your QR code, **you both get a free Time Bank hour**.\n\nYou've made **" +
          refCount +
          '** referral' +
          refPlural +
          ' so far.' +
          circleStatus +
          "\n\nShare your Comfort Card QR in person, by text, or on social media. When someone scans it, they're automatically connected to you.",
        followups: [
          { label: 'Share my QR', message: 'Show me my QR code to share' },
          { label: 'Referral stats', message: 'How many people have I referred?' },
        ],
      };
    }

    case 'qr':
      return {
        content:
          'Your QR code is on your **Comfort Card**. Share it with:\n\n- Family members who help with care\n- Neighbors who might want to join\n- Friends who could use support\n\n**You both get a free hour** when they sign up. 5 referrals = **Founding Circle** status.\n\nYour QR only shares your first name and member ID — nothing personal.',
        followups: [
          { label: 'View my card', message: 'Show me my Comfort Card' },
          { label: 'Share now', message: 'I want to share my QR code' },
        ],
      };

    case 'membership':
    case 'tier':
      return generatePublicResponse('', domain);

    case 'family_intake':
    case 'worker_intake':
    case 'intake':
      return generatePublicResponse('', domain);

    case 'emotional_support':
      return pickEmotionalResponse(profile);

    default:
      // Smart default uses profile context — never loops
      return getSmartDefault('');
  }
}

// ─── Dynamic Tiles ──────────────────────────────────────────────────

export function getDynamicTiles(
  phase: OnboardingPhase,
  lastDomain: Domain | null,
  isReferred?: boolean,
  profile?: UserProfile,
): TileWithAction[] {
  // Profile-aware tiles
  if (profile) {
    if (profile.lastMiniCII?.zone === 'red') {
      return [
        {
          label: 'Respite Fund',
          value: 'Get up to 4 free hours',
          color: 'red',
          icon: 'sos',
          message: 'Tell me about the Respite Fund',
        },
        {
          label: 'Care Navigator',
          value: 'Talk to a real person',
          color: 'blue',
          icon: 'phone',
          message: 'Connect me with a Care Navigator',
        },
        {
          label: 'Check In Again',
          value: 'Reassess your stress',
          color: 'sage',
          icon: 'clipboard',
          message: 'I want to do another check-in',
        },
      ];
    }

    const daysSinceVisit = profile.lastVisit
      ? Math.floor((Date.now() - new Date(profile.lastVisit).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    if (daysSinceVisit > 14) {
      return [
        {
          label: 'Welcome Back',
          value: "It's been a while",
          color: 'sage',
          icon: 'wave',
          message: "I've been away for a bit, what's new?",
        },
        {
          label: 'Quick Check-in',
          value: 'How are you doing?',
          color: 'sage',
          icon: 'heart',
          message: 'I want to do a caregiver check-in',
        },
        {
          label: 'Community Update',
          value: 'See what happened',
          color: 'blue',
          icon: 'community',
          message: "What's been happening in the community?",
        },
      ];
    }
  }

  // Phase-based tiles
  switch (phase) {
    case 'fresh':
      return [
        {
          label: 'What is co-op.care?',
          value: 'Learn how it works',
          color: 'sage',
          icon: 'home',
          message: 'What is co-op.care and how does it work?',
        },
        {
          label: 'Caregiver Check-in',
          value: '30-second stress check',
          color: 'sage',
          icon: 'heart',
          message: 'I want to do a caregiver check-in',
        },
        {
          label: 'Caregiver Stories',
          value: "You're not alone",
          color: 'blue',
          icon: 'book',
          message: 'Tell me about other caregivers like me',
        },
        ...(isReferred
          ? [
              {
                label: 'Your Referral',
                value: 'Free hour waiting!',
                color: 'gold' as const,
                icon: 'gift',
                message: 'Tell me about my referral bonus',
              },
            ]
          : []),
      ];

    case 'exploring':
      return [
        {
          label: 'How It Works',
          value: 'Time Bank + Comfort Card',
          color: 'sage',
          icon: 'clock',
          message: 'How does the Time Bank work?',
        },
        {
          label: 'What It Costs',
          value: 'Transparent pricing',
          color: 'gold',
          icon: 'money',
          message: 'How much does co-op.care cost?',
        },
        {
          label: 'Why Different',
          value: 'Not an agency',
          color: 'copper',
          icon: 'sparkle',
          message: 'How is co-op.care different from an agency?',
        },
      ];

    case 'profile_intent':
      return [
        {
          label: 'I Need Care',
          value: 'For me or my family',
          color: 'blue',
          icon: 'home',
          message: "I'm looking for care support",
        },
        {
          label: 'I Want to Help',
          value: 'Become a Care Neighbor',
          color: 'sage',
          icon: 'handshake',
          message: 'I want to give care and help neighbors',
        },
        {
          label: 'Both!',
          value: 'Give and receive',
          color: 'sage',
          icon: 'heart',
          message: 'I want to both give and receive care',
        },
      ];

    case 'profile_roles':
      return [
        {
          label: 'Companion',
          value: 'Visits & conversation',
          color: 'sage',
          icon: 'coffee',
          message: "I'm interested in companionship visits",
        },
        {
          label: 'Errands & Rides',
          value: 'Groceries, pharmacy, appointments',
          color: 'blue',
          icon: 'car',
          message: "I'm interested in help with errands and rides",
        },
        {
          label: 'Meals',
          value: 'Cooking & meal prep',
          color: 'gold',
          icon: 'meal',
          message: "I'm interested in meal preparation help",
        },
      ];

    case 'profile_community':
      return [
        {
          label: 'Get My Card',
          value: 'Free Comfort Card',
          color: 'sage',
          icon: 'card',
          message: 'I want my free Comfort Card!',
        },
        {
          label: 'Cooperative Model',
          value: 'How ownership works',
          color: 'copper',
          icon: 'building',
          message: 'Tell me more about the cooperative ownership',
        },
        {
          label: 'More Questions',
          value: 'I want to learn more',
          color: 'blue',
          icon: 'question',
          message: 'I have more questions before deciding',
        },
      ];

    case 'memory_consent':
      return [
        {
          label: 'Remember Me',
          value: 'Save my preferences',
          color: 'sage',
          icon: 'save',
          message: 'Yes, please remember me',
        },
        {
          label: 'Session Only',
          value: 'No data saved',
          color: 'gray',
          icon: 'lock',
          message: "Just for this session, don't save anything",
        },
        {
          label: 'What Do You Store?',
          value: 'Privacy details',
          color: 'blue',
          icon: 'search',
          message: 'What data do you store about me?',
        },
      ];

    case 'returning':
      return [
        {
          label: 'Continue',
          value: 'Pick up where we left off',
          color: 'sage',
          icon: 'play',
          message: "Let's continue where we left off",
        },
        {
          label: 'Check In',
          value: 'How am I doing?',
          color: 'sage',
          icon: 'heart',
          message: 'I want to do a caregiver check-in',
        },
        {
          label: "What's New",
          value: 'Updates & features',
          color: 'copper',
          icon: 'newBadge',
          message: "What's new at co-op.care?",
        },
      ];

    case 'onboarded':
      // Domain-reactive tiles for onboarded users
      return getDomainReactiveTiles(lastDomain, profile);

    default:
      return getDomainReactiveTiles(lastDomain, profile);
  }
}

/** All discoverable features, functions, and benefits — tiles cycle through these */
const FEATURE_TILE_POOL: TileWithAction[] = [
  // ─── Core Features ────
  {
    label: 'Wellness Check',
    value: '30-second stress check',
    color: 'sage',
    icon: 'heart',
    message: 'I want to do a caregiver check-in',
  },
  {
    label: 'Assess Loved One',
    value: 'Care recipient needs',
    color: 'copper',
    icon: 'home',
    message: "I want to assess my loved one's needs",
  },
  {
    label: 'Time Bank',
    value: '1 hr given = 1 hr earned',
    color: 'sage',
    icon: 'clock',
    message: 'How does the Time Bank work?',
  },
  {
    label: 'Comfort Card',
    value: 'HSA/FSA care wallet',
    color: 'blue',
    icon: 'card',
    message: 'Tell me about the Comfort Card',
  },
  // ─── Financial Benefits ────
  {
    label: '$35/hr Care',
    value: '$23 after HSA savings',
    color: 'gold',
    icon: 'money',
    message: 'How much does co-op.care cost?',
  },
  {
    label: 'HSA/FSA Eligible',
    value: 'Save 28-36% on care',
    color: 'sage',
    icon: 'hospital',
    message: 'How do I pay with my HSA or FSA?',
  },
  {
    label: 'LMN Included',
    value: '$59/mo membership perk',
    color: 'blue',
    icon: 'note',
    message: 'Tell me about the Letter of Medical Necessity',
  },
  {
    label: 'Compare Costs',
    value: 'vs agencies & gig apps',
    color: 'copper',
    icon: 'chart',
    message: 'Compare co-op.care costs to an agency',
  },
  // ─── Community & Growth ────
  {
    label: 'Share & Earn',
    value: 'Free hour for you both',
    color: 'gold',
    icon: 'gift',
    message: 'How do referral bonuses work?',
  },
  {
    label: 'Founding Circle',
    value: '5 referrals = equity',
    color: 'copper',
    icon: 'building',
    message: 'What is the Founding Circle?',
  },
  {
    label: 'Cooperative Equity',
    value: 'Own a piece of the co-op',
    color: 'copper',
    icon: 'trending',
    message: 'Tell me about cooperative ownership and equity',
  },
  {
    label: 'Become a Neighbor',
    value: '$25-28/hr + benefits',
    color: 'sage',
    icon: 'handshake',
    message: 'How do I become a Care Neighbor?',
  },
  // ─── Care Services ────
  {
    label: 'Companion Care',
    value: 'Same caregiver, always',
    color: 'sage',
    icon: 'coffee',
    message: 'Tell me about companion care visits',
  },
  {
    label: 'Care Plans',
    value: 'Flexible, no contracts',
    color: 'blue',
    icon: 'clipboard',
    message: 'What care plans are available?',
  },
  {
    label: 'How Visits Work',
    value: 'QR → visit → billing',
    color: 'sage',
    icon: 'refresh',
    message: 'Walk me through how a care visit works',
  },
  {
    label: 'Respite Fund',
    value: 'Free hours when you need them',
    color: 'red',
    icon: 'sos',
    message: 'Tell me about the Respite Fund',
  },
  // ─── Support ────
  {
    label: 'Tell My Story',
    value: 'Share your care journey',
    color: 'sage',
    icon: 'book',
    message: 'I want to tell you about my care situation',
  },
  {
    label: 'Care Navigator',
    value: 'Talk to a real person',
    color: 'blue',
    icon: 'phone',
    message: 'Connect me with a Care Navigator',
  },
  {
    label: 'Care Questions',
    value: 'Ask about anything',
    color: 'sage',
    icon: 'question',
    message: 'I have a question about caring for my loved one',
  },
  {
    label: 'Boulder Resources',
    value: 'Local care support',
    color: 'blue',
    icon: 'mountain',
    message: 'What care resources are available in Boulder?',
  },
];

function getDomainReactiveTiles(
  lastDomain: Domain | null,
  profile?: UserProfile,
): TileWithAction[] {
  // Domain-specific tiles when contextually relevant
  const domainTiles: Partial<Record<Domain, TileWithAction[]>> = {
    assessment: [
      {
        label: 'My Results',
        value: 'View past assessments',
        color: 'sage',
        icon: 'chart',
        message: 'Show me my past assessment results',
      },
      {
        label: 'Resources',
        value: 'Based on your score',
        color: 'blue',
        icon: 'books',
        message: 'What resources do you recommend for me?',
      },
      {
        label: 'Share Results',
        value: 'With family or doctor',
        color: 'copper',
        icon: 'send',
        message: 'How do I share my results with my family?',
      },
    ],
    timebank: [
      {
        label: 'Earn Hours',
        value: 'Ways to contribute',
        color: 'sage',
        icon: 'clock',
        message: 'What can I do to earn Time Bank hours?',
      },
      {
        label: 'Use Hours',
        value: 'Get help',
        color: 'blue',
        icon: 'target',
        message: 'I want to use my Time Bank hours',
      },
      {
        label: 'Refer & Earn',
        value: 'Free hour each!',
        color: 'gold',
        icon: 'gift',
        message: 'I want to refer someone for bonus hours',
      },
    ],
    billing: [
      {
        label: 'HSA/FSA',
        value: 'Tax-free payments',
        color: 'sage',
        icon: 'card',
        message: 'How do I pay with my HSA or FSA?',
      },
      {
        label: 'Get an LMN',
        value: 'Letter of Medical Necessity',
        color: 'blue',
        icon: 'note',
        message: 'Help me get a Letter of Medical Necessity',
      },
      {
        label: 'Compare Costs',
        value: 'vs traditional agencies',
        color: 'copper',
        icon: 'chart',
        message: 'Compare co-op.care costs to an agency',
      },
    ],
    emotional_support: [
      {
        label: 'Quick Check-in',
        value: '30-second assessment',
        color: 'sage',
        icon: 'heart',
        message: 'I want to do a caregiver check-in',
      },
      {
        label: 'Take a Break',
        value: 'You deserve it',
        color: 'sage',
        icon: 'seedling',
        message: 'Tell me about the Respite Fund',
      },
      {
        label: 'Talk to Someone',
        value: 'Care Navigator',
        color: 'blue',
        icon: 'phone',
        message: 'I want to talk to a Care Navigator',
      },
    ],
    referral: [
      {
        label: 'Share QR',
        value: 'Invite a neighbor',
        color: 'sage',
        icon: 'send',
        message: 'Show me how to share my QR code',
      },
      {
        label: 'Referral Bonus',
        value: 'Free hour each!',
        color: 'gold',
        icon: 'gift',
        message: 'How do referral bonuses work?',
      },
      {
        label: 'Founding Circle',
        value: '5 referrals = equity',
        color: 'copper',
        icon: 'building',
        message: 'What is the Founding Circle?',
      },
    ],
    qr: [
      {
        label: 'Share QR',
        value: 'Invite a neighbor',
        color: 'sage',
        icon: 'send',
        message: 'Show me how to share my QR code',
      },
      {
        label: 'Referral Bonus',
        value: 'Free hour each!',
        color: 'gold',
        icon: 'gift',
        message: 'How do referral bonuses work?',
      },
      {
        label: 'Founding Circle',
        value: '5 referrals = equity',
        color: 'copper',
        icon: 'building',
        message: 'What is the Founding Circle?',
      },
    ],
  };

  // If we have domain-specific tiles, show 1 domain tile + 2 smart next actions
  if (lastDomain && domainTiles[lastDomain]) {
    const contextual = domainTiles[lastDomain]!;
    const smart = getSmartNextActions(profile, contextual);
    return [contextual[0]!, ...smart.slice(0, 2)];
  }

  // Default: 3 best next actions based on profile state
  return getSmartNextActions(profile);
}

/**
 * Smart tile selection — always picks the 3 best next actions:
 *   1. PROFILE TILE: What should the user do to improve/complete their profile?
 *   2. DISCOVERY TILE: What should we learn about the user next?
 *   3. BENEFIT TILE: What's the most beneficial action they could take right now?
 */
function getSmartNextActions(profile?: UserProfile, exclude?: TileWithAction[]): TileWithAction[] {
  const excludeLabels = new Set((exclude ?? []).map((t) => t.label));

  // ── 1. Profile completion tile — what's missing? ──
  const profileTile = getProfileCompletionTile(profile);

  // ── 2. Discovery tile — what should we learn about the user? ──
  const discoveryTile = getDiscoveryTile(profile);

  // ── 3. Benefit tile — highest-value action right now ──
  const benefitTile = getBenefitTile(profile);

  const tiles = [profileTile, discoveryTile, benefitTile].filter(
    (t) => !excludeLabels.has(t.label),
  );

  // If filtering removed any, backfill from the feature pool
  if (tiles.length < 3) {
    const usedLabels = new Set(tiles.map((t) => t.label));
    for (const t of FEATURE_TILE_POOL) {
      if (tiles.length >= 3) break;
      if (!usedLabels.has(t.label) && !excludeLabels.has(t.label)) {
        tiles.push(t);
        usedLabels.add(t.label);
      }
    }
  }

  return tiles.slice(0, 3);
}

function getProfileCompletionTile(profile?: UserProfile): TileWithAction {
  // Priority order: CII → CRI → Referral → Share
  if (!profile?.lastMiniCII) {
    return {
      label: 'Wellness Check',
      value: 'How are you really doing?',
      color: 'sage',
      icon: 'heart',
      message: 'I want to do a caregiver check-in',
    };
  }
  if (!profile?.lastCRI) {
    return {
      label: 'Assess Loved One',
      value: 'Understand their needs',
      color: 'copper',
      icon: 'home',
      message: "I want to assess my loved one's care needs",
    };
  }
  if (profile.referralCount === 0) {
    return {
      label: 'Share & Earn',
      value: 'Free hour for you both',
      color: 'gold',
      icon: 'gift',
      message: 'How do I share my card and earn a free hour?',
    };
  }
  if (profile.referralCount < 5) {
    return {
      label: 'Founding Circle',
      value: `${5 - profile.referralCount} referrals to go`,
      color: 'copper',
      icon: 'building',
      message: 'Tell me about the Founding Circle',
    };
  }
  // Profile is complete — suggest community engagement
  return {
    label: 'My Impact',
    value: 'See your care journey',
    color: 'sage',
    icon: 'chart',
    message: 'Show me my care journey and impact',
  };
}

function getDiscoveryTile(profile?: UserProfile): TileWithAction {
  const explored = profile?.topDomains ?? {};

  // What hasn't the user asked about yet? Priority by value.
  const discoveryOptions: Array<{ domain: string; tile: TileWithAction }> = [
    {
      domain: 'billing',
      tile: {
        label: '$35/hr Care',
        value: '$23 after HSA savings',
        color: 'gold',
        icon: 'money',
        message: 'How much does co-op.care cost and how do HSA savings work?',
      },
    },
    {
      domain: 'how_different',
      tile: {
        label: 'Why Different',
        value: 'Not an agency',
        color: 'copper',
        icon: 'sparkle',
        message: 'How is co-op.care different from a traditional agency?',
      },
    },
    {
      domain: 'governance',
      tile: {
        label: 'Co-op Model',
        value: 'Caregivers own it',
        color: 'copper',
        icon: 'building',
        message: 'How does the cooperative ownership model work?',
      },
    },
    {
      domain: 'timebank',
      tile: {
        label: 'Time Bank',
        value: 'Give an hour, get an hour',
        color: 'sage',
        icon: 'clock',
        message: 'How does the Time Bank work?',
      },
    },
    {
      domain: 'visit_workflow',
      tile: {
        label: 'How Visits Work',
        value: 'QR → visit → billing',
        color: 'sage',
        icon: 'refresh',
        message: 'Walk me through how a care visit works from start to finish',
      },
    },
    {
      domain: 'lmn',
      tile: {
        label: 'LMN Included',
        value: 'Unlock HSA/FSA',
        color: 'blue',
        icon: 'note',
        message: 'How does the Letter of Medical Necessity work?',
      },
    },
    {
      domain: 'tell_my_story',
      tile: {
        label: 'Tell My Story',
        value: 'Share your journey',
        color: 'sage',
        icon: 'book',
        message: 'I want to tell you about my care situation',
      },
    },
  ];

  // Find first unexplored domain
  for (const opt of discoveryOptions) {
    if (!explored[opt.domain] || explored[opt.domain]! < 1) {
      return opt.tile;
    }
  }

  // All explored — rotate through deeper questions
  const rotationIndex = (profile?.conversationCount ?? 0) % discoveryOptions.length;
  return discoveryOptions[rotationIndex]!.tile;
}

function getBenefitTile(profile?: UserProfile): TileWithAction {
  // Context-aware: what would help them most RIGHT NOW?

  // Red zone CII → respite is most urgent
  if (profile?.lastMiniCII?.zone === 'red') {
    return {
      label: 'Respite Fund',
      value: 'Free hours when you need them',
      color: 'red',
      icon: 'sos',
      message: 'I need a break. Tell me about the Respite Fund',
    };
  }

  // Yellow zone CII → care navigator
  if (profile?.lastMiniCII?.zone === 'yellow') {
    return {
      label: 'Care Navigator',
      value: 'Personal guidance',
      color: 'blue',
      icon: 'phone',
      message: 'I want to talk to a Care Navigator about my situation',
    };
  }

  // Has CRI red flags → care planning
  if (profile?.lastCRI?.zone === 'red') {
    return {
      label: 'Care Plans',
      value: 'Build a plan together',
      color: 'blue',
      icon: 'clipboard',
      message: 'Help me figure out the right care plan for my loved one',
    };
  }

  // New user → show the value prop
  if (!profile || profile.conversationCount < 3) {
    return {
      label: 'Companion Care',
      value: 'Same caregiver, always',
      color: 'sage',
      icon: 'coffee',
      message: 'Tell me about how companion care works at co-op.care',
    };
  }

  // Engaged user → cooperative equity is the sticky benefit
  return {
    label: 'Your Equity',
    value: 'Grow with the co-op',
    color: 'copper',
    icon: 'trending',
    message: 'Tell me about cooperative equity and how my stake grows',
  };
}

// ─── Main Response Router ───────────────────────────────────────────

export function getResponse(
  text: string,
  opts: {
    phase: OnboardingPhase;
    isMember?: boolean;
    profile?: UserProfile;
  },
): SageResponse {
  const domain = classify(text);
  const thinkingSteps = getThinkingSteps(domain);

  // Omaha System classification — runs on every message
  const omahaProblems = classifyOmahaProblems(text);

  let response: SageResponse | null = null;

  // 1. Check onboarding phases first (if in an onboarding flow)
  if (
    ['profile_intent', 'profile_roles', 'profile_community', 'memory_consent'].includes(opts.phase)
  ) {
    const onboardingResp = getOnboardingResponse(opts.phase, text, domain);
    if (onboardingResp) {
      response = {
        ...onboardingResp,
        thinkingSteps: onboardingResp.thinkingSteps ?? thinkingSteps,
      };
    }
  }

  // 2. Member-specific responses
  if (response === null && opts.isMember && opts.profile) {
    const resp = getMemberResponse(domain, opts.profile);
    response = { ...resp, thinkingSteps: resp.thinkingSteps ?? thinkingSteps };
  }

  // 3. Public responses (fallback)
  if (response === null) {
    const resp = generatePublicResponse(text, domain);
    response = { ...resp, thinkingSteps: resp.thinkingSteps ?? thinkingSteps };
  }

  // Attach Omaha classification metadata
  if (omahaProblems.length > 0) {
    response.omahaProblems = omahaProblems;

    // If no followup chips exist, add a clinically-informed follow-up from Omaha
    const omahaFollowup = getOmahaAssessmentPrompt(omahaProblems);
    if (omahaFollowup && (!response.followups || response.followups.length === 0)) {
      const primaryProblem = omahaProblems[0]!;
      response.content = response.content + '\n\n' + omahaFollowup;
      response.followups = [{ label: primaryProblem.name, message: omahaFollowup }];
    }
  }

  return response;
}
