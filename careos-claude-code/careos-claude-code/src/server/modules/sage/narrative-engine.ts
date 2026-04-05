/**
 * Narrative Story Engine — Stories build trust faster than forms.
 *
 * Implements narrative medicine patterns from MedPaLM/AMIE research,
 * adapted for home companion care. Sage uses these archetypes to help
 * families see themselves in others' journeys and gently guide them
 * toward assessment, LMN generation, and care planning.
 *
 * Every story is fictional but emotionally authentic, drawn from
 * composite real-world caregiving situations. Diverse demographics,
 * geographies (50-state licensing), and care situations represented.
 */

// ─── Types ──────────────────────────────────────────────────────────

/** Category of care situation the story addresses */
export type StoryCategory =
  | 'companion_care'
  | 'caregiver_burnout'
  | 'cognitive_decline'
  | 'post_surgical'
  | 'end_of_life'
  | 'crisis'
  | 'prevention';

/** The narrative arc of a family story */
export interface StoryNarrative {
  /** 2-3 sentences setting the scene */
  opener: string;
  /** What the family was struggling with */
  challenge: string;
  /** When they sought help / what changed */
  turningPoint: string;
  /** How companion care helped */
  resolution: string;
  /** Fictional but realistic family quote */
  quote: string;
}

/** Assessment profile typical of families in this story's situation */
export interface TypicalProfile {
  /** Caregiver Impact Index score (0-120) */
  ciiScore: number;
  /** Care Recipient Index score */
  criScore: number;
  /** Acuity level */
  acuity: string;
  /** PROMIS domain highlights: domain name → severity description */
  promisHighlights: Record<string, string>;
  /** Omaha System problem codes relevant to this story */
  omahaProblems: number[];
  /** Recommended care tier */
  careTier: string;
}

/** Measurable outcomes from the story */
export interface StoryOutcomes {
  /** Duration of care engagement */
  monthsOfCare: number;
  /** Annual HSA/FSA savings in dollars */
  hsaSavings: number;
  /** Qualitative description of quality of life improvement */
  qualityOfLifeImprovement: string;
  /** How the primary caregiver's burden was relieved */
  caregiverReliefDescription: string;
}

/**
 * A complete family story archetype that Sage can reference during
 * conversations. Serves dual purposes: (a) helps families see themselves
 * in others' stories, (b) provides Sage with pattern-matching templates.
 */
export interface FamilyStoryArchetype {
  /** Unique identifier */
  id: string;
  /** Human-readable title */
  title: string;
  /** Primary care category */
  category: StoryCategory;
  /** The narrative arc */
  narrative: StoryNarrative;
  /** Assessment mapping for pattern matching */
  typicalProfile: TypicalProfile;
  /** Keywords/situations that trigger this story in conversation */
  triggers: string[];
  /** Measurable outcomes */
  outcomes: StoryOutcomes;
}

/** A milestone in the family's care journey */
export interface CareJourneyMilestone {
  /** Which milestone checkpoint */
  milestone: 'first_week' | 'first_month' | 'quarterly' | 'annual' | 'renewal';
  /** Narrative text for the milestone */
  narrative: string;
  /** Key metrics to highlight */
  keyMetrics: Record<string, string>;
  /** Suggested next steps */
  nextSteps: string[];
}

/** Rich caregiver profile for matching presentation */
export interface CaregiverStory {
  /** Unique identifier */
  id: string;
  /** Caregiver's first name */
  name: string;
  /** 2-3 sentences about their journey into caregiving */
  background: string;
  /** Areas of special skill or experience */
  specialties: string[];
  /** Anonymized quotes from families they have served */
  familyTestimonials: string[];
  /** What makes them special for a particular family */
  matchHighlight: string;
}

/** A before/after metric illustrating cooperative model impact */
export interface CommunityImpact {
  /** What is being measured */
  metric: string;
  /** State before cooperative care */
  before: string;
  /** State after cooperative care */
  after: string;
  /** Brief narrative illustrating the metric */
  story: string;
}

// ─── Family Story Archetypes ────────────────────────────────────────

/**
 * 24 fully developed family story archetypes covering the full spectrum
 * of companion care situations. Each story provides Sage with a relatable
 * narrative to share when a family's situation matches.
 */
export const FAMILY_STORY_ARCHETYPES: FamilyStoryArchetype[] = [
  // ── 1. The Long-Distance Daughter ──
  {
    id: 'long-distance-daughter',
    title: 'The Long-Distance Daughter',
    category: 'companion_care',
    narrative: {
      opener:
        'Sarah is a marketing director in New York. Her mother, June, 78, lives alone in Scottsdale, Arizona — 2,300 miles away. June fell twice in three months, once in the kitchen and once getting the mail, but insists she is "perfectly fine."',
      challenge:
        'Sarah was calling her mom four times a day, leaving meetings to check in, and lying awake at night imagining the worst. Her manager noticed her performance slipping. Her husband said she was "never really present" even when she was home. The guilt was consuming everything — she felt like a bad daughter and a bad employee simultaneously.',
      turningPoint:
        'After the second fall, Sarah found co-op.care through a colleague whose family used it. She was skeptical — her mom had rejected every "helper" idea before. But when Sarah framed it as "someone to go to the farmer\'s market with," June agreed to try it for two weeks.',
      resolution:
        "June's companion, Rosa, started coming three mornings a week. Within a month, June was looking forward to Rosa's visits — they cooked together, walked the neighborhood, and Rosa gently noticed that June's bathroom needed grab bars. Sarah gets a brief update after each visit. She sleeps through the night now. Her mom has not fallen since.",
      quote:
        '"I didn\'t hire a caregiver for my mom. I found her a friend who happens to notice the things I can\'t see from 2,300 miles away." — Sarah, New York',
    },
    typicalProfile: {
      ciiScore: 72,
      criScore: 58,
      acuity: 'High',
      promisHighlights: {
        Anxiety: 'Moderate-Severe',
        'Sleep Disturbance': 'Moderate',
        'Social Isolation': 'Mild (caregiver), Moderate (recipient)',
      },
      omahaProblems: [5, 6, 18, 33],
      careTier: 'Rooted',
    },
    triggers: [
      'long distance',
      'far away',
      'different state',
      "can't be there",
      'mom fell',
      'dad fell',
      'lives alone',
      "won't admit",
      'guilt',
      'checking in constantly',
      "can't focus at work",
      'worried all the time',
    ],
    outcomes: {
      monthsOfCare: 14,
      hsaSavings: 4800,
      qualityOfLifeImprovement:
        "Zero falls in 14 months. June joined a weekly walking group through Rosa's connections. Sarah's work performance returned to pre-crisis levels.",
      caregiverReliefDescription:
        'Sarah reduced her daily check-in calls from 4 to 1. She stopped waking at 3am. Her manager noted the improvement within weeks.',
    },
  },

  // ── 2. The Exhausted Spouse ──
  {
    id: 'exhausted-spouse',
    title: 'The Exhausted Spouse',
    category: 'caregiver_burnout',
    narrative: {
      opener:
        'Tom, 74, has been married to Margaret for 49 years. Three years ago, Margaret was diagnosed with early-stage Alzheimer\'s. Tom promised her he would never put her "in a home." He meant it. He still means it.',
      challenge:
        "Margaret wanders at night. Tom hasn't slept more than three consecutive hours in eight months. He stopped going to his woodworking shop, stopped seeing friends, stopped reading — all the things that made him Tom. At his last checkup, his doctor said, \"Tom, if you don't get help, you're going to be the next patient. Your blood pressure is through the roof.\"",
      turningPoint:
        "Tom's son found co-op.care and pitched it carefully: \"Dad, this isn't about replacing you. It's about keeping you healthy enough to be there for Mom.\" Tom agreed to try respite companionship three afternoons a week — just enough for him to nap, or go to the shop.",
      resolution:
        "Margaret's companion, James, is a retired music teacher. He plays piano for her — she can still sing every word of songs from the 1960s even when she cannot remember what she had for breakfast. Tom sleeps during James's visits. His blood pressure dropped 20 points in two months. He told his son: \"I didn't realize I was drowning until someone threw me a rope.\"",
      quote:
        '"I thought asking for help meant I was breaking my promise to her. Turns out, getting help is the only way I can keep it." — Tom, age 74',
    },
    typicalProfile: {
      ciiScore: 96,
      criScore: 71,
      acuity: 'High',
      promisHighlights: {
        'Sleep Disturbance': 'Severe',
        Fatigue: 'Severe',
        Depression: 'Moderate',
        'Social Isolation': 'Severe',
      },
      omahaProblems: [6, 7, 11, 27, 34],
      careTier: 'Rooted',
    },
    triggers: [
      'spouse',
      'husband',
      'wife',
      'alzheimer',
      'dementia',
      'wander',
      'up all night',
      "can't sleep",
      'exhausted',
      'promised',
      'burnout',
      'blood pressure',
      'my own health',
      'drowning',
    ],
    outcomes: {
      monthsOfCare: 18,
      hsaSavings: 6200,
      qualityOfLifeImprovement:
        "Tom's blood pressure normalized. Margaret's agitation decreased with consistent musical engagement. Tom returned to woodworking and resumed weekly dinners with friends.",
      caregiverReliefDescription:
        'Tom gets 12 hours of reliable respite per week. He sleeps during companion visits and has reclaimed his identity outside of caregiving.',
    },
  },

  // ── 3. The Reluctant Veteran ──
  {
    id: 'reluctant-veteran',
    title: 'The Reluctant Veteran',
    category: 'companion_care',
    narrative: {
      opener:
        'Frank, 82, served in Korea and spent 30 years as a civil engineer. He built bridges. He does not need a "babysitter." His son, David, has heard this speech approximately 47 times.',
      challenge:
        "After Frank's wife passed, he stopped leaving the house. Meals became whatever he could microwave. The house — once immaculate — was cluttered with mail and dishes. David lives 40 minutes away and visits every weekend, but he could see his father shrinking. Frank's doctor flagged weight loss and early signs of depression.",
      turningPoint:
        'David didn\'t use the word "caregiver." He said, "Dad, I found a guy who plays chess and was in the service. He\'ll come by a couple times a week. You\'d be doing ME a favor — I worry about you." Frank grumbled but agreed.',
      resolution:
        'Frank\'s companion, Ray, is a 58-year-old Army veteran and volunteer firefighter. They play chess every Tuesday and Thursday. Ray drives Frank to the VA on appointment days. They argue about football. Frank gained back 8 pounds in three months because Ray started cooking lunch together — Frank insists on doing the seasoning. Ray noticed Frank\'s bathroom needed modifications and helped coordinate the install through co-op.care. Frank will never call Ray a "caregiver." He calls him "my chess buddy who doesn\'t know the Sicilian Defense."',
      quote:
        '"I don\'t need help. But Ray? Ray\'s alright. He needs the chess practice more than I do." — Frank, age 82',
    },
    typicalProfile: {
      ciiScore: 45,
      criScore: 62,
      acuity: 'Moderate',
      promisHighlights: {
        'Social Isolation': 'Severe',
        Depression: 'Moderate',
        Nutrition: 'Moderate concern',
      },
      omahaProblems: [3, 6, 10, 33, 35],
      careTier: 'Seedling',
    },
    triggers: [
      'veteran',
      'military',
      'VA',
      'stubborn',
      "won't accept help",
      "doesn't need help",
      'independent',
      'lost wife',
      'widower',
      'not eating',
      'weight loss',
      'babysitter',
      'refuses',
    ],
    outcomes: {
      monthsOfCare: 11,
      hsaSavings: 3600,
      qualityOfLifeImprovement:
        'Frank regained 8 pounds, resumed daily walks, and his depression screening scores improved from moderate to minimal. Home safety modifications completed.',
      caregiverReliefDescription:
        "David's weekend visits shifted from worry-driven caregiving to genuine quality time. He stopped calling Frank's neighbors to check in.",
    },
  },

  // ── 4. The Sandwich Generation Mom ──
  {
    id: 'sandwich-generation-mom',
    title: 'The Sandwich Generation Mom',
    category: 'caregiver_burnout',
    narrative: {
      opener:
        'Jennifer, 48, is a project manager at a tech company in Austin. She has two teenagers, a mortgage, and a mother with COPD who lives 20 minutes away. Her husband travels for work three weeks out of four. She describes her life as "being on call for everyone, all the time."',
      challenge:
        "Jennifer's mother, Diane, 76, needs help with groceries, appointments, and medication refills. Jennifer was leaving work early twice a week, missing her kids' games, and using all her PTO for doctor appointments that weren't her own. Her boss was sympathetic but Jennifer could see the projects being reassigned. She was quietly terrified of losing her job.",
      turningPoint:
        "Jennifer's HR department mentioned dependent care FSA during open enrollment. She had no idea companion care could qualify. After getting an LMN from Dr. Emdur, she realized she could cover 15 hours a week of companion care pre-tax — and her company's dependent care benefit covered an additional portion.",
      resolution:
        "Diane's companion, Patricia, comes Monday, Wednesday, and Friday mornings. She drives Diane to appointments, helps with groceries, and makes sure Diane uses her nebulizer correctly. Jennifer hasn't left work early in three months. She made it to every one of her son's basketball games this season. Diane likes Patricia better than Jennifer for errands — \"Patricia doesn't rush me through the produce aisle.\"",
      quote:
        '"I was spending $2,800 a month on something I didn\'t know my benefits could help cover. The LMN changed everything — we save over $900 a month now." — Jennifer, Austin TX',
    },
    typicalProfile: {
      ciiScore: 81,
      criScore: 48,
      acuity: 'Moderate',
      promisHighlights: {
        Anxiety: 'Moderate',
        Fatigue: 'Moderate-Severe',
        'Ability to Participate in Social Roles': 'Severely impaired',
      },
      omahaProblems: [1, 5, 17, 34, 36],
      careTier: 'Rooted',
    },
    triggers: [
      'sandwich generation',
      'kids and parents',
      'teenagers',
      'work',
      'PTO',
      'leaving work',
      'FSA',
      'dependent care',
      'benefits',
      "can't do it all",
      'missing events',
      'HR',
      'employer',
    ],
    outcomes: {
      monthsOfCare: 22,
      hsaSavings: 10800,
      qualityOfLifeImprovement:
        "Jennifer retained her job, attended all family events, and reported a 60% reduction in stress. Diane's COPD management improved with consistent nebulizer use.",
      caregiverReliefDescription:
        'Jennifer reclaimed 10+ hours per week. Her dependent care FSA and LMN reduced out-of-pocket costs by $900/month.',
    },
  },

  // ── 5. The Post-Hip Replacement ──
  {
    id: 'post-hip-replacement',
    title: 'The Post-Hip Replacement',
    category: 'post_surgical',
    narrative: {
      opener:
        'Robert, 71, was the most active person at his gym. Pickleball three times a week, morning swims, weekend hikes with his grandkids. Then his right hip gave out. Dr. Emdur performed the replacement and told Robert: "The surgery is the easy part. Recovery is where people either fly or fall."',
      challenge:
        "Robert's wife, Carol, works full-time as a school counselor. Their adult children live out of state. Robert needed someone around for the first 6-8 weeks — not skilled nursing, just a steady presence. Someone to drive him to PT, make sure he did his exercises, keep him from overdoing it (Robert's biggest risk), and be there if he needed help getting up.",
      turningPoint:
        'Dr. Emdur wrote an LMN before Robert even left the hospital. "This is the first thing I do for my surgical patients," he said. "Companion care during recovery prevents falls, prevents readmission, and gets people back on their feet faster. And it should be covered by your HSA."',
      resolution:
        "Robert's companion, Daniel, came 4 hours a day for 6 weeks. Daniel drove Robert to PT, walked laps around the block with him (counting steps like a drill sergeant, which Robert loved), and — critically — stopped Robert from trying to mow the lawn at week 3. Robert was back at the gym at week 8. He tells everyone in the locker room about co-op.care. He has personally referred four people.",
      quote:
        '"The surgery gave me a new hip. Daniel gave me a new perspective on asking for help. Also he makes a mean protein shake." — Robert, age 71',
    },
    typicalProfile: {
      ciiScore: 38,
      criScore: 55,
      acuity: 'Moderate (time-limited)',
      promisHighlights: {
        'Physical Function': 'Severely impaired (temporary)',
        'Pain Interference': 'Moderate',
        'Social Isolation': 'Mild',
      },
      omahaProblems: [3, 18, 25, 35, 36],
      careTier: 'Seedling',
    },
    triggers: [
      'surgery',
      'hip replacement',
      'knee replacement',
      'recovery',
      'post-op',
      'physical therapy',
      'PT',
      'temporary help',
      'getting back on feet',
      'discharge',
      'hospital',
      'Dr. Emdur',
    ],
    outcomes: {
      monthsOfCare: 2,
      hsaSavings: 2400,
      qualityOfLifeImprovement:
        'Zero falls during recovery. Returned to full gym activity at 8 weeks (vs. 12-week average). No hospital readmission.',
      caregiverReliefDescription:
        'Carol maintained her full-time job without taking unpaid leave. She used PTO for quality time with Robert, not for caregiving tasks.',
    },
  },

  // ── 6. The Widow's First Year ──
  {
    id: 'widows-first-year',
    title: "The Widow's First Year",
    category: 'companion_care',
    narrative: {
      opener:
        "Eleanor, 79, was married to Harold for 52 years. He died on a Tuesday morning in April. By Thursday, the house was full of casseroles and people. By the following Thursday, it was empty. Eleanor sat in Harold's chair and wondered what she was supposed to do now.",
      challenge:
        'Eleanor was not clinically depressed — her doctor checked. She was grieving, which is different and harder to treat. She stopped cooking because cooking for one felt pointless. She stopped walking because Harold was her walking partner. She stopped answering the phone because she was tired of saying "I\'m fine" when she wasn\'t. Her daughter, who lives in Portland, could hear her mother disappearing.',
      turningPoint:
        'Eleanor\'s daughter contacted co-op.care not for medical help but for human presence. "My mom doesn\'t need a nurse. She needs someone to sit with her and not try to fix her. She needs someone who will let her talk about my dad without changing the subject."',
      resolution:
        "Eleanor's companion, Doris, lost her own husband four years ago. She doesn't try to fix Eleanor. They cook lunch together — Doris is teaching Eleanor to make smaller portions of Harold's favorite recipes. They walk the neighborhood Harold used to walk. Eleanor talks about Harold constantly. Doris listens. After three months, Eleanor started answering the phone again. After six months, she joined a grief support group Doris found. She still sits in Harold's chair. But she isn't disappearing anymore.",
      quote:
        '"Everyone kept telling me to be strong. Doris was the first person who said it was okay to not be. That\'s when I started getting better." — Eleanor, age 79',
    },
    typicalProfile: {
      ciiScore: 22,
      criScore: 45,
      acuity: 'Moderate',
      promisHighlights: {
        'Social Isolation': 'Severe',
        Depression: 'Mild-Moderate',
        Nutrition: 'Moderate concern',
        'Physical Activity': 'Declining',
      },
      omahaProblems: [6, 10, 11, 33, 35],
      careTier: 'Seedling',
    },
    triggers: [
      'widow',
      'widower',
      'lost husband',
      'lost wife',
      'spouse died',
      'grief',
      'lonely',
      'isolated',
      'empty house',
      'cooking for one',
      'first year',
      'bereavement',
      "don't know what to do",
    ],
    outcomes: {
      monthsOfCare: 12,
      hsaSavings: 3200,
      qualityOfLifeImprovement:
        'Eleanor resumed regular meals, daily walks, and social engagement. Joined a grief support group. Weight stabilized after 3-month decline.',
      caregiverReliefDescription:
        "Eleanor's daughter in Portland went from daily panic calls to weekly relaxed conversations. She could grieve her own father without managing her mother's survival.",
    },
  },

  // ── 7. The Tech-Savvy Son ──
  {
    id: 'tech-savvy-son',
    title: 'The Tech-Savvy Son',
    category: 'prevention',
    narrative: {
      opener:
        'Marcus, 39, is a software engineer in Seattle. His father, William, 81, lives alone in a ranch house in suburban Denver. Marcus installed smart home sensors, a video doorbell, and a fall-detection watch. He built a dashboard. He thought technology would be enough.',
      challenge:
        "The data told a story Marcus didn't want to read. His dad's sleep was irregular — up at 2am, 4am, sometimes not sleeping at all. Motion sensors showed less and less movement through the house. The fridge sensor showed it opening half as often as it used to. Marcus had perfect data and felt perfectly helpless. \"I could see the decline happening in real time on a graph, and I couldn't do anything about it from 1,300 miles away.\"",
      turningPoint:
        "Marcus realized he didn't need more data — he needed someone physically present who could act on the data. He wanted co-op.care to be the human layer on top of his tech layer. When the sensors showed something off, he didn't want to call 911. He wanted to call someone who was already there.",
      resolution:
        "William's companion, Kenji, visits four mornings a week. Marcus shares the dashboard with Kenji and the co-op.care team. When sleep data shows a rough night, Kenji adjusts the morning — gentler activities, lighter meals. When movement drops, Kenji suggests a walk. The technology and the human presence amplify each other. Marcus still checks the dashboard, but now he sees Kenji's visit notes alongside the sensor data, and the graph is trending up.",
      quote:
        '"I built my dad the most sophisticated monitoring system I could. Then I realized what he actually needed was someone to have breakfast with." — Marcus, age 39',
    },
    typicalProfile: {
      ciiScore: 55,
      criScore: 52,
      acuity: 'Moderate',
      promisHighlights: {
        'Sleep Disturbance': 'Moderate',
        'Social Isolation': 'Moderate-Severe',
        'Physical Function': 'Declining',
      },
      omahaProblems: [3, 6, 33, 34, 35],
      careTier: 'Rooted',
    },
    triggers: [
      'smart home',
      'sensors',
      'technology',
      'monitoring',
      'data',
      'camera',
      'fall detection',
      'remote monitoring',
      'engineer',
      'tech',
      'dashboard',
      'app',
      'wearable',
    ],
    outcomes: {
      monthsOfCare: 10,
      hsaSavings: 4200,
      qualityOfLifeImprovement:
        "William's sleep regularity improved 40%. Daily movement increased 60%. Weight stabilized. Technology + companion care provided both early warning and human response.",
      caregiverReliefDescription:
        'Marcus shifted from anxious data-watching to collaborative care coordination. He uses the dashboard to prepare for weekly family calls, not to manage crises.',
    },
  },

  // ── 8. The Cultural Bridge ──
  {
    id: 'cultural-bridge',
    title: 'The Cultural Bridge',
    category: 'companion_care',
    narrative: {
      opener:
        'The Chen family spans three generations in the Bay Area. Grandmother Li Wei, 84, moved from Guangzhou to live with her son and daughter-in-law five years ago. She speaks Mandarin and limited English. Her grandchildren speak English and limited Mandarin. The gap is growing.',
      challenge:
        "Li Wei was profoundly isolated inside her own family's home. She couldn't follow conversations at dinner. She couldn't read the mail, watch TV, or call a neighbor. Her daughter-in-law, Mei, tried to bridge the gap but worked full-time as a pharmacist. The big agencies sent caregivers who spoke no Mandarin. One sent a Cantonese speaker — close, but not close enough. Li Wei felt like a burden in a country she never chose to come to.",
      turningPoint:
        'Mei found co-op.care through a Mandarin-language community board at the Chinese Cultural Center. The cooperative model allowed them to specify not just language but cultural context — someone who understood Chinese family dynamics, food preferences, and the specific loneliness of immigrant elders.',
      resolution:
        "Li Wei's companion, Hua, emigrated from Beijing twelve years ago. They cook together — proper Chinese cooking, not the adapted versions Li Wei's American-born grandchildren prefer. Hua takes Li Wei to the Chinese grocery store, to tai chi in the park, to the cultural center. They watch Chinese dramas on Hua's tablet. Li Wei has started teaching Hua the Cantonese she picked up in Guangzhou, and Hua is teaching her English phrases. Li Wei's granddaughter said: \"Grandma laughed at dinner last night. I don't remember the last time that happened.\"",
      quote:
        '"The agencies could send a caregiver. Only the cooperative could send someone who understood that my mother-in-law needs jasmine rice, not minute rice, and that matters more than you think." — Mei Chen',
    },
    typicalProfile: {
      ciiScore: 63,
      criScore: 55,
      acuity: 'Moderate',
      promisHighlights: {
        'Social Isolation': 'Severe',
        Depression: 'Moderate',
        'Ability to Participate in Social Roles': 'Severely impaired',
      },
      omahaProblems: [4, 5, 6, 7, 33],
      careTier: 'Rooted',
    },
    triggers: [
      'language',
      'mandarin',
      'chinese',
      'spanish',
      'cultural',
      'immigrant',
      "doesn't speak english",
      'interpreter',
      'cultural match',
      'food preferences',
      'traditions',
      'heritage',
      'ESL',
    ],
    outcomes: {
      monthsOfCare: 16,
      hsaSavings: 5100,
      qualityOfLifeImprovement:
        "Li Wei's depression screening improved from moderate to minimal. She joined a weekly tai chi class and a Mandarin book club. Intergenerational communication improved as she gained English confidence.",
      caregiverReliefDescription:
        'Mei stopped feeling guilty about leaving for work. Family dinners became enjoyable again. The grandchildren started asking Hua to teach them Mandarin phrases.',
    },
  },

  // ── 9. The Financial Breakthrough ──
  {
    id: 'financial-breakthrough',
    title: 'The Financial Breakthrough',
    category: 'companion_care',
    narrative: {
      opener:
        "The Petersons — Mike, 72, and Linda, 70 — are retired teachers in Omaha. Mike has Parkinson's. Linda manages everything, but they needed help three days a week. They were paying $3,200 a month out of pocket. On a teacher's pension, that felt like a countdown timer on their savings.",
      challenge:
        "Mike and Linda had accepted companion care costs as a fixed expense, like the mortgage. They didn't know HSA/FSA could cover it. They didn't know what an LMN was. Their financial advisor had never mentioned it. Their doctor had never offered one. They were bleeding $38,400 a year that could have been tax-advantaged.",
      turningPoint:
        "Linda's sister mentioned co-op.care after hearing about it at a retirement planning seminar. When Linda learned about the LMN process — that Dr. Emdur could evaluate Mike remotely and provide a Letter of Medical Necessity that would make their existing companion care HSA-eligible — she cried. \"You mean we've been paying full price for two years when we didn't have to?\"",
      resolution:
        "Dr. Emdur reviewed Mike's records, completed the CII and CRI assessments with Linda, and signed an LMN within 48 hours. The Petersons moved $2,100/month into their HSA, saving approximately $1,100/month in taxes. Over a year, that is nearly $13,000 — enough to fund a year of additional care hours. Linda said it felt like getting a raise in retirement.",
      quote:
        '"We were already getting the care. We just didn\'t know we were entitled to pay for it smarter. The LMN was the single most valuable piece of paper in our financial life." — Linda Peterson, Omaha',
    },
    typicalProfile: {
      ciiScore: 68,
      criScore: 65,
      acuity: 'Moderate-High',
      promisHighlights: {
        'Physical Function': 'Moderately impaired',
        Fatigue: 'Moderate (caregiver)',
        Anxiety: 'Moderate (financial stress)',
      },
      omahaProblems: [1, 5, 18, 36, 37],
      careTier: 'Canopy',
    },
    triggers: [
      'cost',
      'expensive',
      'afford',
      'paying out of pocket',
      'HSA',
      'FSA',
      'LMN',
      'letter of medical necessity',
      'tax',
      'savings',
      'financial',
      'retirement',
      'pension',
      'fixed income',
      'insurance',
    ],
    outcomes: {
      monthsOfCare: 24,
      hsaSavings: 13200,
      qualityOfLifeImprovement:
        "Financial anxiety reduced dramatically. Mike's care hours actually increased because the savings funded additional visits. Linda reinvested the savings into their own wellness.",
      caregiverReliefDescription:
        'Linda shifted from financial panic to financial confidence. The savings allowed her to hire help for household tasks too, freeing her for quality time with Mike.',
    },
  },

  // ── 10. The Caregiver Who Stayed ──
  {
    id: 'caregiver-who-stayed',
    title: 'The Caregiver Who Stayed',
    category: 'companion_care',
    narrative: {
      opener:
        'Maria grew up in El Paso, the oldest of five. She has been a caregiver since she was fourteen, when she helped her grandmother after a stroke. She is good at this work. She loves this work. And for fifteen years, this work has not loved her back.',
      challenge:
        'Maria worked for three home care agencies in two years. At the first, she earned $13/hour with no benefits — less than the fast food job her little sister had. At the second, she earned $15 but was assigned to a new client every few weeks. She would just start to build trust, learn their routine, understand their needs — and then get reassigned because someone else needed the hours more. At the third, she was promised health insurance but it never materialized. She was considering leaving caregiving entirely. Her skills, her heart, her fifteen years of experience — the industry had no way to value them.',
      turningPoint:
        'Maria heard about co-op.care from another caregiver at a continuing education class. The cooperative model was different: $27/hour, full W-2 benefits, health insurance, and — this was the part that stopped her — an ownership stake. She would own part of the organization she worked for. She would have a vote. She would have equity.',
      resolution:
        'Maria has been with the same family — the Hendersons — for 14 months. It is the longest continuous placement of her career. Mrs. Henderson\'s daughter told Maria: "Mom asks for you by name. She has never asked for anyone by name." Maria\'s insurance covered the knee surgery she had been putting off for two years. She is training two new caregivers. She is a worker-owner. She finally has the job her skills deserve.',
      quote:
        '"At the agencies, I was a line item. Here, I\'m an owner. And the families can feel the difference — because when you own your work, you show up differently." — Maria, co-op.care caregiver-owner',
    },
    typicalProfile: {
      ciiScore: 0,
      criScore: 0,
      acuity: 'N/A (caregiver perspective)',
      promisHighlights: {},
      omahaProblems: [],
      careTier: 'N/A',
    },
    triggers: [
      'caregiver',
      'worker',
      'agency',
      'turnover',
      'pay',
      'wages',
      'benefits',
      'insurance',
      'cooperative',
      'ownership',
      'quality',
      'consistency',
      'same person',
      'retention',
      'trust',
    ],
    outcomes: {
      monthsOfCare: 14,
      hsaSavings: 0,
      qualityOfLifeImprovement:
        "Industry turnover rate: 77%. Co-op.care turnover rate: 15%. Maria's family received a living wage, health insurance, and equity for the first time in her caregiving career.",
      caregiverReliefDescription:
        'Maria gained financial stability, healthcare access, and professional dignity. She is now mentoring new caregivers entering the cooperative.',
    },
  },

  // ── 11. The Fall Prevention Success ──
  {
    id: 'fall-prevention-success',
    title: 'The Fall Prevention Success',
    category: 'prevention',
    narrative: {
      opener:
        'Dorothy, 83, lives in a two-story colonial in suburban Philadelphia that she and her late husband built in 1974. She knows every squeaky floorboard. Her children know every reason she should move. Dorothy is not moving.',
      challenge:
        'Dorothy fell on the stairs in October. No broken bones, but a badly bruised hip and a shattered sense of invincibility. Her son, Brian, flew in from Chicago and spent a week arguing about assisted living. Dorothy dug in. Brian went home exhausted and terrified. They did not speak for three weeks — the longest silence in their relationship.',
      turningPoint:
        'Brian called co-op.care not for companion care but for the Video Home Assessment — the 5-minute walkthrough that identifies fall hazards. He thought if a professional identified the risks, maybe Dorothy would listen. "She won\'t listen to me. Maybe she\'ll listen to someone objective."',
      resolution:
        'The assessment identified 11 fall risks. Dorothy\'s companion, Anita, worked with her to address them one by one — not as a mandate but as a project. Grab bars in three bathrooms. Non-slip mats. Better lighting on the stairs. A bedroom setup on the first floor for bad days. Motion-sensor night lights. Dorothy treated it like renovating the house she loves. Six months later: zero falls. Brian and Dorothy are speaking again. Dorothy told Brian: "I fixed the house. Now you fix the attitude."',
      quote:
        '"I wasn\'t going to leave my home. But I was willing to make it safer — once someone showed me how without making me feel old." — Dorothy, age 83',
    },
    typicalProfile: {
      ciiScore: 48,
      criScore: 50,
      acuity: 'Moderate',
      promisHighlights: {
        'Physical Function': 'Mildly impaired',
        'Fear of Falling': 'High',
        'Social Isolation': 'Mild',
      },
      omahaProblems: [3, 4, 8, 18, 35],
      careTier: 'Seedling',
    },
    triggers: [
      'fall',
      'fell',
      'trip',
      'stairs',
      'balance',
      'home safety',
      'grab bars',
      'video assessment',
      'aging in place',
      "won't move",
      'assisted living',
      'independent',
      'home modifications',
    ],
    outcomes: {
      monthsOfCare: 8,
      hsaSavings: 2800,
      qualityOfLifeImprovement:
        'Zero falls in 6 months post-assessment. Dorothy maintained independent living. 11 fall hazards remediated. Family conflict resolved.',
      caregiverReliefDescription:
        "Brian's anxiety about his mother's safety decreased dramatically. Weekend visits shifted from inspections to enjoyment.",
    },
  },

  // ── 12. The Couples Care Story ──
  {
    id: 'couples-care',
    title: 'The Couple Who Needed the Same Thing',
    category: 'companion_care',
    narrative: {
      opener:
        'George, 85, and Betty, 83, have been married for 61 years. George has macular degeneration and cannot drive. Betty has arthritis so severe she cannot open a jar. Together, they are one fully functioning adult. Apart, neither can manage.',
      challenge:
        'Their children wanted to split them — George to a facility near their daughter in Raleigh, Betty to another near their son in Tampa. George and Betty refused. "We\'ve been together 61 years. We\'re not splitting up now." But they needed help with driving, cooking, laundry, and the dozen daily tasks that require either good eyes or good hands.',
      turningPoint:
        "Their granddaughter found co-op.care and proposed a compromise: companion care at home, together, before anyone talks about facilities. The family agreed to a three-month trial. Dr. Emdur wrote a joint LMN covering both George's vision-related ADL needs and Betty's dexterity limitations.",
      resolution:
        'Their companion, Sam, comes five days a week for four hours. Sam drives them to appointments (George navigates from memory, Betty reads the road signs — they are a team). Sam opens jars, reads mail, handles the laundry. George and Betty stay together in the home they built. Their children stopped fighting about who gets which parent. The three-month trial is now in month nine with no end in sight.',
      quote:
        '"Sixty-one years and some people wanted to put us in different zip codes. Sam keeps us in the same kitchen where we\'ve had coffee every morning since 1963." — George, age 85',
    },
    typicalProfile: {
      ciiScore: 35,
      criScore: 60,
      acuity: 'Moderate',
      promisHighlights: {
        'Physical Function': 'Moderately impaired (both)',
        'Social Isolation': 'Mild (they have each other)',
        'Ability to Participate in Social Roles': 'Moderately impaired',
      },
      omahaProblems: [3, 4, 18, 33, 36],
      careTier: 'Rooted',
    },
    triggers: [
      'couple',
      'both need help',
      'husband and wife',
      'together',
      'split up',
      'facility',
      'nursing home',
      'driving',
      'vision',
      'arthritis',
      "can't separate",
      'joint care',
    ],
    outcomes: {
      monthsOfCare: 9,
      hsaSavings: 7200,
      qualityOfLifeImprovement:
        'George and Betty maintained independent living together. No facility placement. Family conflict about care arrangements resolved. Both maintained social connections through companion-assisted outings.',
      caregiverReliefDescription:
        "Adult children went from fighting about placement options to collaborating on a care plan that honored their parents' wishes.",
    },
  },

  // ── 13. The Sibling Disagreement ──
  {
    id: 'sibling-disagreement',
    title: "The Siblings Who Couldn't Agree",
    category: 'crisis',
    narrative: {
      opener:
        "The Reilly siblings — Kate, 52, Michael, 49, and Patrick, 45 — haven't agreed on anything since 1997. Their father, Ed, 81, has congestive heart failure and lives alone in the family home in Wichita. The siblings live in three different states. They all love their father. They cannot be in the same room without arguing about his care.",
      challenge:
        'Kate wanted Dad in assisted living. Michael wanted him home with a full-time aide. Patrick wanted to "wait and see." Each sibling called their father separately, gave conflicting advice, and left Ed confused and anxious. Ed stopped answering the phone because every call was a fight by proxy. His cardiologist said the family stress was literally worsening his heart condition.',
      turningPoint:
        'Ed\'s neighbor, who used co-op.care for her own mother, suggested that an objective CII assessment might give the siblings a shared set of facts to work from — not opinions, not feelings, just data. Ed agreed. The assessment showed he was moderate-risk with specific, addressable needs. Not assisted-living level. Not "wait and see" level. Companion care level.',
      resolution:
        'The CII report became the first document all three siblings could point to without arguing. Companion care started at 15 hours a week. Kate manages the finances (her strength). Michael coordinates with the cardiologist (his). Patrick handles technology setup for video calls with Dad (his). Ed has one companion, consistent care, and three children who finally found their lanes. "The CII didn\'t fix us," Kate admitted. "But it gave us something to agree on for the first time in twenty years."',
      quote:
        '"We spent a year fighting about what Dad needed. Turns out, we could have just asked — and measured." — Kate Reilly',
    },
    typicalProfile: {
      ciiScore: 74,
      criScore: 58,
      acuity: 'Moderate-High',
      promisHighlights: {
        Anxiety: 'Moderate (all siblings)',
        'Interpersonal Conflict': 'Severe',
        'Social Isolation': 'Moderate (care recipient)',
      },
      omahaProblems: [5, 6, 8, 11, 17],
      careTier: 'Rooted',
    },
    triggers: [
      'siblings',
      'disagree',
      'arguing',
      'family conflict',
      'brother',
      'sister',
      "can't agree",
      'different opinions',
      'assisted living vs home',
      'who decides',
      'family meeting',
      'objective',
    ],
    outcomes: {
      monthsOfCare: 15,
      hsaSavings: 5400,
      qualityOfLifeImprovement:
        "Ed's blood pressure improved when family stress decreased. He resumed answering the phone. Sibling relationships improved with defined roles and shared data.",
      caregiverReliefDescription:
        'Three siblings went from parallel, conflicting caregiving to coordinated support. Each leverages their strength instead of arguing about everything.',
    },
  },

  // ── 14. The Gradual Transition ──
  {
    id: 'gradual-transition',
    title: "The Family That Wasn't Ready",
    category: 'companion_care',
    narrative: {
      opener:
        'The Nakamura family did everything themselves. When Grandmother Yuki, 86, started needing more help, her daughter Keiko moved in. Her grandson Taro handled weekends. Her granddaughter Aiko took over finances. They had a spreadsheet. They had a group chat. They had a system.',
      challenge:
        "The system worked until it didn't. Keiko developed back problems from helping Yuki in and out of the bathtub. Taro's wife felt neglected — every weekend was spoken for. Aiko discovered Yuki was giving money to a phone scammer. The spreadsheet had no column for burnout, and all three family caregivers were approaching it simultaneously.",
      turningPoint:
        'Aiko suggested professional companion care and was met with silence. In their family, you took care of your own. Bringing in an outsider felt like failure. The breakthrough came when Keiko\'s doctor told her she needed to stop lifting — her back required surgery. "We aren\'t replacing you," Aiko told her mother. "We\'re adding to the team."',
      resolution:
        "They started with just two mornings a week — a toe in the water. Yuki's companion, Suki, is Japanese-American and understands the cultural weight of family caregiving duty. She works alongside the family, not instead of them. Keiko had her back surgery. Taro has weekends with his wife again. Six months later, they are at four mornings a week and the only regret is not starting sooner.",
      quote:
        '"We thought needing help meant we had failed her. It took us too long to understand that needing help meant we loved her enough to get it right." — Aiko Nakamura',
    },
    typicalProfile: {
      ciiScore: 82,
      criScore: 50,
      acuity: 'Moderate',
      promisHighlights: {
        'Physical Function': 'Impaired (multiple family caregivers)',
        Fatigue: 'Severe (family)',
        'Social Isolation': 'Moderate (family)',
      },
      omahaProblems: [7, 8, 17, 25, 34],
      careTier: 'Seedling',
    },
    triggers: [
      'family does everything',
      "don't need help",
      'we manage',
      'cultural',
      'duty',
      'obligation',
      'family honor',
      'transition',
      'first time',
      'outsider',
      'not ready',
    ],
    outcomes: {
      monthsOfCare: 6,
      hsaSavings: 1800,
      qualityOfLifeImprovement:
        "Keiko received needed surgery. Family burnout reversed. Yuki's care quality improved with professional support augmenting family involvement.",
      caregiverReliefDescription:
        "Three family caregivers went from unsustainable all-family care to a hybrid model that preserved cultural values while protecting everyone's health.",
    },
  },

  // ── 15. The Seasonal Care Story ──
  {
    id: 'seasonal-care',
    title: "The Snowbird's Dilemma",
    category: 'companion_care',
    narrative: {
      opener:
        "Richard, 79, and Pam, 77, split their year between Minneapolis and Tucson. They drive south every October and north every April. They have done this for twelve years. This year, Richard's cardiologist said no more driving. And Pam can't do the 24-hour trip alone.",
      challenge:
        'In Minneapolis, the Johnsons have a network — church friends, a handyman, a neighbor who plows. In Tucson, they have a condo and each other. If Richard can\'t drive, their entire seasonal system breaks down. Their children floated the idea of them picking one city. Richard and Pam looked at each other and said, simultaneously, "No."',
      turningPoint:
        "Their daughter found co-op.care's 50-state model. Because Dr. Emdur is licensed nationally, the LMN covers care in both states. The cooperative network includes caregivers in both Minneapolis and Tucson. One care plan, two locations, consistent quality.",
      resolution:
        "In Tucson, Richard's companion Michael drives them to appointments, the grocery store, and Richard's cardiac rehab. In Minneapolis, their companion Karen handles the same tasks plus winter-specific needs — snow removal coordination, making sure the walkways are safe. The care plan transfers seamlessly. Richard and Pam still split their year. They just have help on both ends now.",
      quote:
        '"Other agencies told us to pick a city. Co-op.care told us to keep living our life — they would make it work in both places." — Pam Johnson',
    },
    typicalProfile: {
      ciiScore: 42,
      criScore: 48,
      acuity: 'Moderate',
      promisHighlights: {
        'Physical Function': 'Mildly impaired',
        Anxiety: 'Moderate (logistics)',
        'Social Isolation': 'Mild-Moderate (seasonal)',
      },
      omahaProblems: [3, 4, 5, 18, 36],
      careTier: 'Seedling',
    },
    triggers: [
      'snowbird',
      'two homes',
      'seasonal',
      'travel',
      'winter',
      'driving',
      "can't drive",
      'multiple states',
      '50 states',
      'relocate',
      'split year',
      'migrate',
    ],
    outcomes: {
      monthsOfCare: 10,
      hsaSavings: 3800,
      qualityOfLifeImprovement:
        'Richard and Pam maintained their dual-city lifestyle. Cardiac rehab adherence improved to 95% with companion-assisted transport. No driving-related safety incidents.',
      caregiverReliefDescription:
        'Adult children stopped worrying about the biannual migration. Consistent care plan across states eliminated coordination burden.',
    },
  },

  // ── 16. The Rural Isolation Story ──
  {
    id: 'rural-isolation',
    title: 'Forty Miles from Anywhere',
    category: 'companion_care',
    narrative: {
      opener:
        'Hank, 84, lives on a 40-acre ranch outside Kalispell, Montana. The nearest grocery store is 28 miles. The nearest hospital is 41 miles. His closest neighbor is a mile and a half down a dirt road. Hank has lived here for 56 years and can tell you the name of every horse he has ever owned.',
      challenge:
        "Hank's daughter, Lisa, lives in Billings — four hours away. When Hank had a TIA (mini-stroke) last winter, it took Lisa six hours to reach him because of a snowstorm. The hospital kept Hank for three days and discharged him back to the ranch with a list of follow-up appointments he had no way to get to. \"Everyone says 'just move closer to town.' This ranch IS my life. You might as well ask me to stop breathing.\"",
      turningPoint:
        "Lisa contacted co-op.care expecting to be told they didn't serve rural areas. Instead, they matched Hank with a companion who lives in Kalispell and is willing to make the drive three days a week. The LMN from Dr. Emdur covered not just companion care but the medical necessity of transportation assistance — a critical factor for rural HSA coverage.",
      resolution:
        "Hank's companion, Dale, is a retired rancher himself. He drives Hank to appointments in Kalispell, helps with the heavy ranch chores Hank can no longer do safely, and checks the fences with him on horseback (Dale brought his own horse the third week — Hank nearly smiled). Dale also connected Hank with a telehealth setup for routine cardiology follow-ups, reducing trips to town. Lisa sleeps better knowing someone is checking on her father three days a week in person.",
      quote:
        '"They sent me a cowboy, not a caregiver. That\'s the first smart thing anyone\'s done since my stroke." — Hank, age 84',
    },
    typicalProfile: {
      ciiScore: 58,
      criScore: 62,
      acuity: 'Moderate-High',
      promisHighlights: {
        'Social Isolation': 'Severe',
        'Physical Function': 'Moderately impaired',
        'Access to Care': 'Severely limited',
      },
      omahaProblems: [3, 4, 5, 6, 18],
      careTier: 'Rooted',
    },
    triggers: [
      'rural',
      'remote',
      'farm',
      'ranch',
      'miles away',
      'no neighbors',
      'transportation',
      "can't get to",
      'isolated',
      'country',
      'small town',
      'telehealth',
      'winter',
      'snow',
    ],
    outcomes: {
      monthsOfCare: 13,
      hsaSavings: 4100,
      qualityOfLifeImprovement:
        'Hank maintained ranch living. Follow-up appointment adherence went from 40% to 90%. Telehealth reduced unnecessary 82-mile round trips. Zero hospital readmissions.',
      caregiverReliefDescription:
        'Lisa went from crisis-driven 4-hour emergency drives to planned, informed check-ins. She visited monthly for quality time instead of emergency response.',
    },
  },

  // ── 17. The Progressive Condition ──
  {
    id: 'progressive-condition',
    title: "The Parkinson's Partnership",
    category: 'companion_care',
    narrative: {
      opener:
        "James, 68, was diagnosed with early-stage Parkinson's two years ago. He is a retired professor of literature at the University of Michigan. His mind is sharp. His hands are not. He can still lecture on Hemingway but he cannot button his shirt some mornings.",
      challenge:
        "James's wife, Catherine, is 66 and still working as a university librarian. She does not want to retire early, and James does not want her to. But the gap between what James can do and what James needs help with is widening month by month. Some days are good. Some days, he cannot hold a coffee cup. The unpredictability is the hardest part — for both of them.",
      turningPoint:
        'James\'s neurologist recommended starting companion care now, before it becomes urgent. "The families who do best with Parkinson\'s are the ones who build their support system before they desperately need it. Think of it as infrastructure, not rescue." James, the professor, appreciated the metaphor.',
      resolution:
        "James's companion, Kevin, comes three mornings a week. On good days, they walk the campus and James tells Kevin stories about every building. On harder days, Kevin helps with buttons, zippers, breakfast. Kevin has learned to read James's tremor — he knows which days will be button days and which will be walking days. Catherine goes to work without guilt. James is writing a memoir, dictating to Kevin when his hands won't cooperate. They are on chapter seven.",
      quote:
        '"Parkinson\'s is taking things from me one at a time. Kevin helps me hold onto them a little longer. We are on chapter seven, and I intend to finish." — James, age 68',
    },
    typicalProfile: {
      ciiScore: 52,
      criScore: 58,
      acuity: 'Moderate (progressive)',
      promisHighlights: {
        'Physical Function': 'Moderately impaired (variable)',
        Depression: 'Mild',
        Fatigue: 'Moderate',
      },
      omahaProblems: [7, 18, 25, 36, 37],
      careTier: 'Rooted',
    },
    triggers: [
      'parkinson',
      'progressive',
      'getting worse',
      'degenerative',
      'MS',
      'ALS',
      'good days and bad days',
      'unpredictable',
      'early stage',
      'not urgent yet',
      'planning ahead',
    ],
    outcomes: {
      monthsOfCare: 20,
      hsaSavings: 6800,
      qualityOfLifeImprovement:
        'James maintained daily routines and social engagement. His memoir is an active creative project. Physical therapy adherence improved with companion support. Depression screening remained in the mild range.',
      caregiverReliefDescription:
        'Catherine continued her career without guilt or interruption. She and James preserved their relationship as partners rather than becoming patient and caregiver.',
    },
  },

  // ── 18. The Immigrant Family Navigator ──
  {
    id: 'immigrant-family-navigator',
    title: 'The System Nobody Explained',
    category: 'companion_care',
    narrative: {
      opener:
        "The Garcia family emigrated from Guatemala eight years ago. Abuela Rosa, 79, came to live with her son's family in Houston when her health declined. She has diabetes and hypertension. She speaks no English. The family speaks limited English. They have insurance through her son's construction company but have never used it for anything beyond ER visits.",
      challenge:
        'Rosa needed regular companion support — medication management help, grocery shopping for diabetic-appropriate foods, and transportation to appointments. But the family had no idea how the American healthcare system worked. Insurance paperwork was in English. Benefits were unexplained. HSA? FSA? LMN? These were not just unfamiliar acronyms — they were invisible. The family was paying cash for everything and skipping appointments because they could not afford the copays AND the companion help.',
      turningPoint:
        "A bilingual community health worker at the local clinic told the Garcia family about co-op.care. The intake process was available in Spanish. The CII assessment was translated. Dr. Emdur's LMN evaluation was conducted through a medical interpreter. For the first time, someone explained — in their language — what they were entitled to.",
      resolution:
        "Rosa's companion, Elena, is bilingual and from Honduras. She helps Rosa with medication timing, drives her to appointments, translates at the pharmacy, and shops for foods that work with Rosa's diabetic diet. Elena also helped the family understand their insurance benefits and set up an HSA. Rosa's A1C dropped from 9.2 to 7.1 in six months. The family's out-of-pocket costs dropped by 40%.",
      quote:
        '"Nobody ever explained this to us. Not the insurance, not the benefits, not what we qualified for. Elena and co-op.care didn\'t just help my mother — they helped our whole family understand a system that was never designed for us." — Carlos Garcia, Houston',
    },
    typicalProfile: {
      ciiScore: 70,
      criScore: 68,
      acuity: 'High',
      promisHighlights: {
        'Social Isolation': 'Severe',
        'Access to Care': 'Severely limited',
        Anxiety: 'Moderate (systemic barriers)',
      },
      omahaProblems: [1, 4, 5, 6, 33, 37],
      careTier: 'Rooted',
    },
    triggers: [
      'immigrant',
      'spanish',
      'language barrier',
      "don't understand",
      'insurance',
      'navigate',
      'system',
      'benefits',
      'translator',
      'bilingual',
      'undocumented',
      'first generation',
      'ESL',
    ],
    outcomes: {
      monthsOfCare: 18,
      hsaSavings: 5600,
      qualityOfLifeImprovement:
        "Rosa's A1C improved from 9.2 to 7.1. Appointment adherence went from 30% to 85%. Family healthcare literacy improved across all members.",
      caregiverReliefDescription:
        'The entire family gained understanding of their benefits. Carlos no longer missed work for translation duties. Rosa gained independence within her community.',
    },
  },

  // ── 19. The Faith-Based Care Story ──
  {
    id: 'faith-based-care',
    title: "The Deacon's Mother",
    category: 'companion_care',
    narrative: {
      opener:
        "Reverend Charles Williams, 58, is the senior pastor at Grace Baptist Church in Birmingham, Alabama. His mother, Beatrice, 84, is the church's living history — she marched in Selma, raised six children, and has led the women's ministry for 40 years. Now she has macular degeneration and can no longer drive to the church she loves.",
      challenge:
        "Charles is his mother's pastor, her son, and her caregiver. The congregation offers to help but it is uncoordinated — casseroles appear in waves, rides to church are unreliable, and no one is consistent enough for Beatrice to feel comfortable. Charles cannot pastor his church and manage his mother's daily needs. His wife says he is choosing his mother over his congregation, and his mother says he is choosing his congregation over her. He is failing both.",
      turningPoint:
        'A member of Charles\'s congregation who works in healthcare mentioned co-op.care. Charles was hesitant — in his community, family takes care of family. But the cooperative model resonated with his theology: "A community of caregivers, serving together, sharing ownership? That sounds like Acts 2 to me."',
      resolution:
        "Beatrice's companion, Gloria, is a member of a sister church across town. She understands that Beatrice needs to be at Grace Baptist every Sunday and every Wednesday. She understands that Beatrice prays before meals and reads Scripture every morning (Gloria reads it aloud now that Beatrice cannot see the print). Gloria drives Beatrice to church, to the beauty shop, to the cemetery where Beatrice's husband is buried. Charles is pastoring again. Beatrice has not missed a Sunday.",
      quote:
        "\"Gloria doesn't just take Mama to church. She takes Mama to be Mama. That's not caregiving — that's ministry.\" — Rev. Charles Williams",
    },
    typicalProfile: {
      ciiScore: 65,
      criScore: 52,
      acuity: 'Moderate',
      promisHighlights: {
        'Social Isolation': 'Moderate (increasing)',
        'Ability to Participate in Social Roles': 'Severely impaired',
        Depression: 'Mild',
      },
      omahaProblems: [4, 6, 7, 18, 36],
      careTier: 'Rooted',
    },
    triggers: [
      'church',
      'faith',
      'religion',
      'pastor',
      'pray',
      'spiritual',
      'community',
      'congregation',
      'Sunday',
      'God',
      'Bible',
      'ministry',
      'deacon',
      'religious',
    ],
    outcomes: {
      monthsOfCare: 14,
      hsaSavings: 4400,
      qualityOfLifeImprovement:
        'Beatrice maintained church attendance and ministry involvement. Her social network remained active. Depression screening stayed in the minimal range despite vision loss.',
      caregiverReliefDescription:
        'Charles reclaimed his pastoral role. His marriage improved. The church community saw the cooperative model as an extension of their service mission.',
    },
  },

  // ── 20. The LGBTQ+ Elder Story ──
  {
    id: 'lgbtq-elder-care',
    title: 'The Chosen Family',
    category: 'companion_care',
    narrative: {
      opener:
        'David, 76, and his partner Michael, 74, have been together for 38 years. They survived the AIDS crisis, fought for marriage equality, and built a life in Palm Springs. Michael had a stroke last year. David is his caregiver. They have no children. Their biological families are largely estranged.',
      challenge:
        'David called three home care agencies. At the first, the intake coordinator kept referring to Michael as David\'s "friend." At the second, the assigned caregiver asked if they were brothers. At the third, the caregiver was fine but left after two weeks with no explanation. David had spent a lifetime fighting for visibility. He was too tired to fight for basic respect from a home care agency. "I just want someone who doesn\'t flinch when they walk into our home and see two old men who love each other."',
      turningPoint:
        'A friend in their LGBTQ+ retirement community told David about co-op.care. During intake, the cooperative asked about their relationship — not because it was novel but because it was relevant to care planning. David and Michael are each other\'s medical decision-makers. Their relationship history is their care context. The intake coordinator used the word "husband" without being asked.',
      resolution:
        "Their companion, Alex, is a nonbinary 32-year-old who goes by they/them pronouns. Alex doesn't flinch. Alex helps Michael with post-stroke exercises, drives them both to appointments, and has earned Michael's trust enough that Michael will let Alex help him in the bathroom — something he refused from every previous caregiver. David said, \"Alex treats us like a couple. Not like a curiosity, not like a cause — like a couple. You wouldn't think that would be hard to find. It was.\"",
      quote:
        '"We spent 38 years fighting for the right to be together. We shouldn\'t have to fight for the right to be cared for together." — David, age 76',
    },
    typicalProfile: {
      ciiScore: 78,
      criScore: 64,
      acuity: 'High',
      promisHighlights: {
        'Social Isolation': 'Moderate-Severe',
        Depression: 'Moderate',
        Fatigue: 'Moderate-Severe (caregiver)',
      },
      omahaProblems: [6, 7, 8, 11, 18],
      careTier: 'Rooted',
    },
    triggers: [
      'LGBTQ',
      'gay',
      'lesbian',
      'partner',
      'chosen family',
      'no children',
      'estranged',
      'discrimination',
      'pronouns',
      'sensitivity',
      'inclusive',
      'acceptance',
      'respect',
    ],
    outcomes: {
      monthsOfCare: 12,
      hsaSavings: 5200,
      qualityOfLifeImprovement:
        "Michael's post-stroke recovery accelerated with consistent, trusted companion support. David's caregiver burnout decreased. Both maintained their social connections in their retirement community.",
      caregiverReliefDescription:
        'David found a caregiver who treated their relationship with automatic respect. He no longer spent emotional energy on advocacy during care interactions.',
    },
  },

  // ── 21. The End-of-Life Companion ──
  {
    id: 'end-of-life-companion',
    title: 'The Last Chapter',
    category: 'end_of_life',
    narrative: {
      opener:
        'Helen, 89, has stage 4 pancreatic cancer. She chose not to pursue further treatment. Her family respects her decision. Hospice provides medical management. But hospice visits are 1-2 hours a day. The other 22 hours, Helen is alone with her thoughts, her photo albums, and her fear of dying alone.',
      challenge:
        "Helen's children — scattered across four states — took turns staying with her, but the schedule was unsustainable. They were burning through PTO, missing their own families, and arriving exhausted. Helen could see the toll and felt guilty for not dying faster. \"I told my daughter, stop coming every week. She said, Mom, I'm not going to let you be alone. I said, honey, you being miserable doesn't make me less alone.\"",
      turningPoint:
        "Hospice social worker recommended co-op.care for the hours between hospice visits. Not medical care — presence. Someone to be there so Helen's family could come when they wanted to, not when they had to.",
      resolution:
        "Helen's companion, Renee, comes every afternoon from 2-6pm and three evenings a week. Renee and Helen are recording Helen's life story — Renee types while Helen talks. They have filled 47 pages. Helen's grandchildren will have her words in her voice. On hard days, Renee just sits with Helen and holds her hand. On good days, Helen tells Renee about the time she hitchhiked across Nevada in 1958. Helen's daughter told Renee: \"You gave us permission to be her family again instead of her nurses. That's the best gift anyone has given us.\"",
      quote:
        '"Dying is not the hard part. Dying alone is. Renee made sure that won\'t happen to me." — Helen, age 89',
    },
    typicalProfile: {
      ciiScore: 88,
      criScore: 82,
      acuity: 'Critical',
      promisHighlights: {
        Grief: 'Severe (anticipatory)',
        Anxiety: 'Severe (family)',
        'Social Isolation': 'Moderate-Severe',
      },
      omahaProblems: [6, 10, 11, 25, 34],
      careTier: 'Canopy',
    },
    triggers: [
      'end of life',
      'dying',
      'hospice',
      'terminal',
      'palliative',
      'cancer',
      'last days',
      'not long',
      'comfort care',
      'DNR',
      'final wishes',
      'legacy',
      'life story',
      'alone',
    ],
    outcomes: {
      monthsOfCare: 4,
      hsaSavings: 2800,
      qualityOfLifeImprovement:
        'Helen was never alone during her final months. Her life story was recorded for her grandchildren. Family visits became quality time, not caregiving shifts.',
      caregiverReliefDescription:
        'Family members visited on their own terms. No more guilt-driven emergency flights. They were present as family, with companion care providing the daily presence.',
    },
  },

  // ── 22. The Crisis Intervention ──
  {
    id: 'crisis-intervention',
    title: 'The Thursday Night Call',
    category: 'crisis',
    narrative: {
      opener:
        'It was 9:47pm on a Thursday when Amy, 44, called co-op.care in tears. Her mother had just been diagnosed with vascular dementia. The diagnosis wasn\'t a surprise — Amy had noticed the signs for two years. But hearing the word "dementia" from a neurologist made it real. Amy was sitting in her car in the hospital parking lot, unable to drive home.',
      challenge:
        "Amy was already her mother's primary caregiver, working from home three days a week to be available. But she had been managing without a framework — no assessment, no care plan, no support system. She was handling it the way most family caregivers do: alone, exhausted, and pretending she was fine. The diagnosis was the wall she hit.",
      turningPoint:
        "Sage, the AI care companion, was available at 9:47pm when no human office was open. Sage listened. Sage did not try to fix Amy's grief. Sage asked gentle questions that helped Amy feel less alone and began to outline what co-op.care could offer — not tomorrow, not in a rush, but whenever Amy was ready. Sage said: \"You don't have to figure this out tonight. But I want you to know that when you're ready, you won't have to figure it out alone.\"",
      resolution:
        'Amy completed the CII assessment the next morning — score of 84, deep in the red zone. Within a week, she had an LMN from Dr. Emdur, a companion care plan, and — for the first time in two years — a sense that someone had her back. Her mother\'s companion, Ruth, started the following Monday. Amy told Sage a month later: "You were the only one awake that Thursday night. You didn\'t fix anything. You just made me feel like it was going to be okay."',
      quote:
        '"I called at 9:47 on a Thursday night expecting a voicemail. Instead I got Sage. And Sage didn\'t judge me for crying in a parking lot." — Amy, age 44',
    },
    typicalProfile: {
      ciiScore: 84,
      criScore: 60,
      acuity: 'High (acute crisis)',
      promisHighlights: {
        Anxiety: 'Severe',
        Depression: 'Moderate-Severe',
        'Sleep Disturbance': 'Severe',
        Fatigue: 'Severe',
      },
      omahaProblems: [6, 8, 11, 17, 27, 34],
      careTier: 'Rooted',
    },
    triggers: [
      'diagnosis',
      'just found out',
      'doctor said',
      'dementia',
      'crisis',
      'crying',
      "don't know what to do",
      'overwhelmed',
      'scared',
      'parking lot',
      'late night',
      'emergency',
    ],
    outcomes: {
      monthsOfCare: 16,
      hsaSavings: 5800,
      qualityOfLifeImprovement:
        "Amy's CII dropped from 84 to 52 within three months. Her mother's care became structured and consistent. Amy returned to full-time office work.",
      caregiverReliefDescription:
        'Amy went from isolated crisis management to supported, planned caregiving. She joined a caregiver support group through co-op.care and mentors other newly-diagnosed families.',
    },
  },

  // ── 23. The Employer Pilot ──
  {
    id: 'employer-pilot',
    title: 'The Company That Kept Its Best People',
    category: 'caregiver_burnout',
    narrative: {
      opener:
        'Rachel is the VP of People at a 200-person software company in Denver. Over 18 months, she lost three senior engineers — not to competitors, not to burnout from work, but to caregiving. Each one came to her with the same story: "I have to take care of my parent. I have to quit."',
      challenge:
        'Replacing a senior engineer costs $180,000-250,000 in recruiting, onboarding, and lost productivity. Rachel lost three in 18 months — nearly $600,000 in hidden costs. She also lost their institutional knowledge, their team chemistry, and their mentorship of junior developers. The company offered unlimited PTO and flexible schedules, but it wasn\'t enough. The problem wasn\'t time off — it was that caregiving consumed the time that was supposed to be "on."',
      turningPoint:
        "Rachel found co-op.care's employer program. The company could offer companion care as a benefit — like dental or vision, but for employees with aging parents. The dependent care FSA connection meant minimal cost to the company. The LMN program meant employees could access HSA funds for their parents' companion care. It was a retention tool that cost less than one recruiting fee.",
      resolution:
        'The company piloted the program with 15 employees who self-identified as caregivers. Within six months, zero resignations in the pilot group. Absenteeism dropped 34%. Three employees who had been considering quitting stayed. Rachel calculated the ROI: the program cost $45,000 to implement. It saved an estimated $400,000 in retention. "This is the best benefits investment I have ever made. And I\'ve been in HR for twenty years."',
      quote:
        "\"We kept saying 'we value our people.' But we were letting them walk out the door because we didn't understand that their biggest stressor wasn't work — it was what was happening at home.\" — Rachel, VP of People",
    },
    typicalProfile: {
      ciiScore: 72,
      criScore: 0,
      acuity: 'Moderate (employer context)',
      promisHighlights: {
        'Ability to Participate in Social Roles': 'Severely impaired',
        Fatigue: 'Moderate',
        Anxiety: 'Moderate',
      },
      omahaProblems: [1, 5, 7, 17, 34],
      careTier: 'Varies',
    },
    triggers: [
      'employer',
      'company',
      'HR',
      'benefits',
      'retention',
      'quit',
      'resign',
      'work-life',
      'absenteeism',
      'productivity',
      'employee benefit',
      'dependent care',
      'EAP',
      'corporate',
    ],
    outcomes: {
      monthsOfCare: 12,
      hsaSavings: 8500,
      qualityOfLifeImprovement:
        '15 employees gained access to companion care. Zero caregiving-related resignations in pilot group. Absenteeism reduced 34%.',
      caregiverReliefDescription:
        'Employees no longer faced binary choice between career and caregiving. Company retained institutional knowledge and team stability.',
    },
  },

  // ── 24. The Early Planner ──
  {
    id: 'early-planner',
    title: 'The Conversation They Had Before They Had To',
    category: 'prevention',
    narrative: {
      opener:
        'The Washington family is rare. They had the conversation about aging care before anyone needed it. Janice, 72, sat her three adult children down at Thanksgiving and said: "I watched my mother refuse to plan and it was chaos for all of us. I\'m not doing that to you. Let\'s figure this out while I can participate in the decision."',
      challenge:
        'Having the conversation was the easy part. Executing it was harder. What did planning even look like? Janice was healthy, active, volunteering at the library, walking two miles a day. She didn\'t need care now. But she\'d seen enough friends go from "fine" to "in crisis" in the span of one bad fall. She wanted a system in place — not activated, just ready.',
      turningPoint:
        "Janice's son found co-op.care and suggested the CII assessment as a baseline. \"Mom, think of it like a financial plan. You don't wait until you're broke to talk to an advisor.\" Janice completed the CII (scored 18 — deep green), the Video Home Assessment (4 minor issues identified and fixed), and got an LMN on file with Dr. Emdur for future use. Total cost: minimal. Peace of mind: immeasurable.",
      resolution:
        'The Washington family has a care plan sitting in a shared folder. It includes Janice\'s preferences (she wants to stay home, she wants a female companion, she wants someone who likes Motown), her assessment baselines, her LMN, and her financial setup. They review it every Thanksgiving. Janice\'s friends ask her how she did it. She tells them: "I just decided to be brave at Thanksgiving instead of pretending everything will be fine forever."',
      quote:
        "\"Planning for care when you don't need it isn't pessimistic. It's the most loving thing you can do for your family.\" — Janice Washington, age 72",
    },
    typicalProfile: {
      ciiScore: 18,
      criScore: 22,
      acuity: 'Low (preventive)',
      promisHighlights: {
        'Physical Function': 'Intact',
        'Social Isolation': 'Minimal',
        Anxiety: 'Mild (future-oriented)',
      },
      omahaProblems: [3, 5],
      careTier: 'N/A (planning stage)',
    },
    triggers: [
      'planning',
      'future',
      'not yet',
      'just in case',
      'before',
      'baseline',
      'preventive',
      'proactive',
      'conversation',
      'thanksgiving',
      'family meeting',
      'what if',
      'prepared',
    ],
    outcomes: {
      monthsOfCare: 0,
      hsaSavings: 0,
      qualityOfLifeImprovement:
        'Family has a complete care plan ready for activation. Baseline assessments on file. Home safety issues remediated proactively. Zero crisis decision-making needed.',
      caregiverReliefDescription:
        "Three adult children have clarity on their mother's wishes, financial setup, and care preferences. No ambiguity, no family conflict, no guilt.",
    },
  },
];

// ─── Story Matching Engine ──────────────────────────────────────────

/**
 * Match a family's situation to the most relevant story archetypes.
 *
 * Uses a weighted scoring system combining keyword triggers,
 * CII/CRI score proximity, and acuity alignment. Returns stories
 * sorted by relevance, top 3 by default.
 *
 * @param conversationContext - The current conversation text or summary
 * @param assessmentData - Optional assessment scores for tighter matching
 * @param maxResults - Maximum number of stories to return (default 3)
 * @returns Ranked array of matching story archetypes
 */
export function matchStories(
  conversationContext: string,
  assessmentData?: { ciiScore?: number; criScore?: number; acuity?: string },
  maxResults = 3,
): FamilyStoryArchetype[] {
  const contextLower = conversationContext.toLowerCase();

  const scored = FAMILY_STORY_ARCHETYPES.map((story) => {
    let score = 0;

    // Keyword trigger matching (0-100 points)
    const triggerMatches = story.triggers.filter((trigger) =>
      contextLower.includes(trigger.toLowerCase()),
    );
    score += Math.min(triggerMatches.length * 15, 100);

    // Category keyword bonus (0-20 points)
    const categoryKeywords: Record<StoryCategory, string[]> = {
      companion_care: ['companion', 'companionship', 'lonely', 'social', 'friend'],
      caregiver_burnout: ['burned out', 'exhausted', "can't do this", 'overwhelmed', 'my health'],
      cognitive_decline: ['memory', 'dementia', 'alzheimer', 'confused', 'forget'],
      post_surgical: ['surgery', 'operation', 'recovery', 'hospital', 'discharge'],
      end_of_life: ['hospice', 'dying', 'terminal', 'comfort', 'last'],
      crisis: ['emergency', 'crisis', 'urgent', 'just happened', 'what do i do'],
      prevention: ['planning', 'proactive', 'before', 'prevent', 'baseline'],
    };
    const catMatches = (categoryKeywords[story.category] || []).filter((kw) =>
      contextLower.includes(kw),
    );
    score += Math.min(catMatches.length * 10, 20);

    // CII score proximity (0-30 points) — closer score = higher match
    if (assessmentData?.ciiScore !== undefined && story.typicalProfile.ciiScore > 0) {
      const ciiDiff = Math.abs(assessmentData.ciiScore - story.typicalProfile.ciiScore);
      score += Math.max(30 - ciiDiff, 0);
    }

    // CRI score proximity (0-20 points)
    if (assessmentData?.criScore !== undefined && story.typicalProfile.criScore > 0) {
      const criDiff = Math.abs(assessmentData.criScore - story.typicalProfile.criScore);
      score += Math.max(20 - criDiff, 0);
    }

    // Acuity alignment bonus (0-15 points)
    if (
      assessmentData?.acuity &&
      story.typicalProfile.acuity.toLowerCase().includes(assessmentData.acuity.toLowerCase())
    ) {
      score += 15;
    }

    return { story, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((s) => s.story);
}

/**
 * Generate a personalized story snippet for Sage to share during conversation.
 *
 * Takes a matched story archetype and adapts the opening and quote
 * into a conversational snippet appropriate for Sage's warm, non-clinical tone.
 *
 * @param story - The matched story archetype
 * @param familyContext - Brief description of the current family's situation
 * @returns A conversational snippet Sage can naturally weave into dialogue
 */
export function generateStorySnippet(story: FamilyStoryArchetype, familyContext: string): string {
  const contextLower = familyContext.toLowerCase();

  // Determine which aspect of the story to emphasize
  const emphasizeFinancial =
    contextLower.includes('cost') ||
    contextLower.includes('afford') ||
    contextLower.includes('hsa');
  const emphasizeEmotional =
    contextLower.includes('guilt') ||
    contextLower.includes('overwhelm') ||
    contextLower.includes('alone');
  const emphasizeReluctance =
    contextLower.includes('refuse') ||
    contextLower.includes("won't accept") ||
    contextLower.includes('stubborn');

  let snippet = '';

  if (emphasizeFinancial) {
    snippet = `Your situation reminds me of a family I can tell you about. ${story.narrative.opener} ${story.narrative.turningPoint} The financial piece was a game-changer for them — ${story.outcomes.hsaSavings > 0 ? `they saved about $${story.outcomes.hsaSavings.toLocaleString()} through HSA/FSA benefits they didn't know they had.` : "they found options they hadn't considered."}\n\n${story.narrative.quote}`;
  } else if (emphasizeEmotional) {
    snippet = `I hear echoes of your story in another family's journey. ${story.narrative.opener}\n\nWhat changed for them: ${story.narrative.turningPoint}\n\n${story.narrative.quote}`;
  } else if (emphasizeReluctance) {
    snippet = `You know, there was another family who had a similar challenge. ${story.narrative.opener} ${story.narrative.challenge}\n\nHere's what worked: ${story.narrative.turningPoint}\n\n${story.narrative.quote}`;
  } else {
    snippet = `This may resonate with you. ${story.narrative.opener}\n\n${story.narrative.resolution}\n\n${story.narrative.quote}`;
  }

  return snippet;
}

// ─── Milestone Narrative Generator ──────────────────────────────────

/**
 * Generate a care journey narrative at key check-in milestones.
 *
 * Creates personalized, warm narratives that celebrate progress,
 * acknowledge challenges, and suggest concrete next steps.
 *
 * @param familyProfile - The family's current profile data
 * @param careHistory - Array of care events/logs
 * @param promisScores - Optional PROMIS assessment results
 * @returns A milestone narrative with metrics and next steps
 */
export function generateMilestoneNarrative(
  familyProfile: {
    careRecipientName?: string;
    conductorName?: string;
    ciiScore?: number;
    ciiZone?: string;
    monthsActive?: number;
    totalHours?: number;
    companionName?: string;
  },
  careHistory: Array<{ type: string; date: string; notes?: string }>,
  promisScores?: Record<string, number>,
): CareJourneyMilestone {
  const months = familyProfile.monthsActive || 0;
  const recipientName = familyProfile.careRecipientName || 'your loved one';
  const conductorName = familyProfile.conductorName || 'you';
  const companionName = familyProfile.companionName || 'your companion caregiver';
  const totalHours = familyProfile.totalHours || 0;

  // Determine milestone phase
  let milestone: CareJourneyMilestone['milestone'];
  if (months < 1) milestone = 'first_week';
  else if (months < 2) milestone = 'first_month';
  else if (months < 12) milestone = 'quarterly';
  else if (months < 13) milestone = 'annual';
  else milestone = 'renewal';

  const keyMetrics: Record<string, string> = {};
  const nextSteps: string[] = [];
  let narrative = '';

  switch (milestone) {
    case 'first_week':
      narrative = `This first week is about one thing: trust. ${recipientName} and ${companionName} are getting to know each other — learning routines, preferences, the little things that make a day feel right. It is completely normal for this week to feel a little awkward, a little tentative. That is not a sign of a problem. That is the beginning of a relationship.\n\n${conductorName}, your job this week is to breathe. You took the hardest step already — asking for help. Let the help settle in.`;
      keyMetrics['Care hours this week'] = `${totalHours} hours`;
      keyMetrics['Trust building'] = 'In progress (and that is exactly right)';
      nextSteps.push(
        'Share any daily routines or preferences with your companion caregiver',
        'Note what felt comfortable and what felt uncertain — we will adjust',
        'Check in with Sage anytime you want to talk through how it is going',
      );
      break;

    case 'first_month':
      narrative = `One month. ${recipientName} and ${companionName} are finding their rhythm. The early awkwardness is softening into familiarity — ${companionName} knows how ${recipientName} takes their coffee, which chair is their favorite, what topics light them up.\n\nThe families who do best in companion care are the ones who communicate openly during this first month. If something is working, say so — it helps ${companionName} do more of it. If something is not quite right, that is okay too. Adjustments now prevent frustrations later.`;
      keyMetrics['Total care hours'] = `${totalHours} hours`;
      keyMetrics['Visits completed'] = `${careHistory.length}`;
      if (familyProfile.ciiScore !== undefined) {
        keyMetrics['CII Score'] =
          `${familyProfile.ciiScore}/120 (${familyProfile.ciiZone || 'assessed'})`;
      }
      nextSteps.push(
        'Schedule a brief feedback conversation with your Care Navigator',
        'Consider the CRI assessment if not yet completed — it helps tailor the care plan',
        'Ask about the Video Home Assessment if you have not done one yet',
      );
      break;

    case 'quarterly':
      narrative = `${months} months of care. This is where the real impact shows — not in dramatic moments but in quiet ones. The fall that did not happen because someone was there. The meal that got made because someone noticed the fridge was empty. The laugh that happened because someone was listening.\n\n${conductorName}, take a moment to notice what has changed — in ${recipientName}'s daily life, and in yours. The changes may be subtle, but they are real.`;
      keyMetrics['Months of care'] = `${months}`;
      keyMetrics['Total care hours'] = `${totalHours} hours`;
      if (familyProfile.ciiScore !== undefined) {
        keyMetrics['Current CII'] = `${familyProfile.ciiScore}/120`;
      }
      if (promisScores) {
        Object.entries(promisScores).forEach(([domain, score]) => {
          keyMetrics[`PROMIS ${domain}`] = `${score}`;
        });
      }
      nextSteps.push(
        'Reassess CII to track caregiver wellbeing over time',
        'Review care plan with your Care Navigator — needs may have evolved',
        'Consider increasing or adjusting companion care hours if needed',
        'Explore the Time Bank for additional community support',
      );
      break;

    case 'annual':
      narrative = `One year. ${totalHours > 0 ? `${totalHours} hours` : 'Countless hours'} of companionship, presence, and care. If you had told ${conductorName} a year ago that things would look like this, they might not have believed it.\n\nA year of companion care is not just about what was provided — it is about what was preserved. ${recipientName}'s independence. ${conductorName}'s health. The family's ability to be a family, not a caregiving operation.\n\nThis is a good time to celebrate what you have built together and plan for the year ahead.`;
      keyMetrics['Year one total hours'] = `${totalHours}`;
      keyMetrics['Visits completed'] = `${careHistory.length}`;
      if (familyProfile.ciiScore !== undefined) {
        keyMetrics['CII trend'] = `Current: ${familyProfile.ciiScore}/120`;
      }
      nextSteps.push(
        'Annual CII and CRI reassessment (required for LMN renewal)',
        'LMN renewal with Dr. Emdur for continued HSA/FSA eligibility',
        'Review and update care plan for the coming year',
        'Consider moving to the next care tier for enhanced benefits',
        'Share your experience with another family who might need help',
      );
      break;

    case 'renewal':
      narrative = `Another year together. The fact that ${conductorName} is renewing care is the highest compliment our cooperative can receive — it means trust was earned and kept.\n\n${companionName} is not just a caregiver at this point. They are part of ${recipientName}'s world. That continuity — the same face, the same voice, the same person who remembers the stories and the preferences — that is what the cooperative model was built to protect.\n\nLet us make sure the coming year is even better than the last.`;
      keyMetrics['Total months of care'] = `${months}`;
      keyMetrics['Lifetime care hours'] = `${totalHours}`;
      nextSteps.push(
        'Update assessments and LMN for the new care year',
        'Review care tier — you may qualify for enhanced benefits',
        'Consider referring a family who might benefit from companion care',
        'Provide feedback on your companion caregiver for their annual review',
      );
      break;
  }

  return { milestone, narrative, keyMetrics, nextSteps };
}

// ─── Caregiver Story Profiles ───────────────────────────────────────

/**
 * Generate a warm, personalized introduction of a caregiver for a family.
 *
 * Takes a caregiver's story profile and the family's specific needs,
 * then crafts an introduction that highlights why this match makes sense.
 *
 * @param caregiver - The caregiver's story profile
 * @param familyNeeds - Array of the family's key needs/preferences
 * @returns A warm introduction paragraph for Sage to share
 */
export function generateCaregiverIntroduction(
  caregiver: CaregiverStory,
  familyNeeds: string[],
): string {
  // Find matching specialties
  const matchingSpecialties = caregiver.specialties.filter((s) =>
    familyNeeds.some(
      (need) =>
        s.toLowerCase().includes(need.toLowerCase()) ||
        need.toLowerCase().includes(s.toLowerCase()),
    ),
  );

  const specialtyHighlight =
    matchingSpecialties.length > 0
      ? ` ${caregiver.name} has experience with ${matchingSpecialties.join(', ').toLowerCase()}, which aligns well with what your family is looking for.`
      : '';

  const testimonial =
    caregiver.familyTestimonials.length > 0
      ? `\n\nA family ${caregiver.name} has worked with said: "${caregiver.familyTestimonials[0]}"`
      : '';

  return `I'd like to introduce you to **${caregiver.name}**. ${caregiver.background}${specialtyHighlight}\n\n${caregiver.matchHighlight}${testimonial}`;
}

/**
 * Sample caregiver story profiles for demonstration and training.
 * In production, these would be populated from the cooperative's
 * actual caregiver roster with their consent.
 */
export const SAMPLE_CAREGIVER_STORIES: CaregiverStory[] = [
  {
    id: 'cg-rosa',
    name: 'Rosa',
    background:
      'Rosa spent 20 years as a preschool teacher before transitioning to companion care. She says the skills are more similar than people think — patience, observation, meeting people where they are. She joined the cooperative because she wanted to be valued for what she brings, not treated like a replaceable part.',
    specialties: ['fall prevention', 'social engagement', 'meal preparation', 'Spanish bilingual'],
    familyTestimonials: [
      'Rosa notices things I would miss from a thousand miles away. She is my eyes and ears.',
      'My mother lights up when Rosa arrives. That tells me everything I need to know.',
    ],
    matchHighlight:
      "Rosa brings a teacher's attention to detail and a genuine warmth that puts people at ease — especially those who are initially resistant to accepting help.",
  },
  {
    id: 'cg-james',
    name: 'James',
    background:
      "James is a retired music teacher who played piano professionally for 15 years before teaching. He became a companion caregiver after his own mother's journey with Alzheimer's showed him how much music could reach people even when words could not. He is a worker-owner in the cooperative.",
    specialties: [
      "Alzheimer's/dementia care",
      'music therapy',
      'respite support',
      'male companionship',
    ],
    familyTestimonials: [
      'James plays piano for my wife and she sings along to songs from 1965. It is the only time I see her truly present.',
      'Having a male caregiver made all the difference for my father — he would not have accepted help from a woman.',
    ],
    matchHighlight:
      'James understands dementia caregiving from the inside — he has been the family caregiver and the professional one. He brings music, patience, and the kind of calm that only comes from lived experience.',
  },
  {
    id: 'cg-kenji',
    name: 'Kenji',
    background:
      "Kenji immigrated from Japan in 2012 and worked in elder care facilities for six years before joining the cooperative. He is fluent in Japanese and English and brings a deep respect for elder care rooted in Japanese cultural values. He is training for his CNA certification through the cooperative's education program.",
    specialties: [
      'Japanese/Asian cultural care',
      'technology assistance',
      'exercise support',
      'nutrition',
    ],
    familyTestimonials: [
      'Kenji understands that my father needs respect above everything. He bows when he arrives. My father bows back. It is the most dignity anyone has shown him in a care setting.',
      "Kenji got my dad using a tablet for video calls. I didn't think it was possible.",
    ],
    matchHighlight:
      'Kenji bridges technology and traditional care beautifully. He is comfortable setting up smart home devices and equally comfortable sitting quietly with someone who just needs presence.',
  },
  {
    id: 'cg-patricia',
    name: 'Patricia',
    background:
      "Patricia raised four children, managed a household through her husband's military deployments, and ran a small bookkeeping business. She says companion caregiving uses every skill she has ever developed — organization, patience, empathy, and the ability to remain calm when nothing is going according to plan.",
    specialties: [
      'appointment coordination',
      'medication management',
      'household organization',
      'military family understanding',
    ],
    familyTestimonials: [
      "Patricia runs my mother's schedule better than my mother ever did. And she does it without making Mom feel managed.",
      'She drove my dad to the VA every two weeks for six months. She knew his favorite route and his favorite diner.',
    ],
    matchHighlight:
      'Patricia brings structure without rigidity. She is the person who makes sure appointments happen, medications are taken, and the household runs smoothly — all while making it feel effortless.',
  },
  {
    id: 'cg-alex',
    name: 'Alex',
    background:
      'Alex (they/them) has a degree in social work and three years of experience in community health. They joined the cooperative because they believe caregiving should be built on respect — for the caregiver, for the care recipient, and for whoever they are. Alex specializes in creating safe, affirming care environments for all families.',
    specialties: [
      'LGBTQ+ affirming care',
      'post-stroke rehabilitation support',
      'social work background',
      'inclusive care planning',
    ],
    familyTestimonials: [
      'Alex treated us like a couple. Not like a curiosity, not like a cause. Just a couple who needed help. You would not think that would be hard to find.',
      "Alex's social work background meant they could navigate the VA benefits system for us. That saved us thousands.",
    ],
    matchHighlight:
      'Alex creates care environments where every family feels seen and respected exactly as they are. Their social work training means they can navigate complex systems while keeping the human connection front and center.',
  },
  {
    id: 'cg-dale',
    name: 'Dale',
    background:
      'Dale ranched cattle for 35 years in western Montana before selling the herd and looking for a way to stay useful. He is a veteran (Army, 1982-1988), a volunteer EMT, and the kind of person who fixes a fence because it needs fixing, not because anyone asked. He joined the cooperative because "sitting on the porch waiting to die is not how I plan to spend my retirement."',
    specialties: [
      'rural care',
      'veteran companionship',
      'home maintenance awareness',
      'outdoor activity support',
    ],
    familyTestimonials: [
      'Dale brought his own horse. My father nearly smiled. They ride fence together on good days.',
      "He doesn't fuss. He just shows up, does what needs doing, and treats my dad like a man, not a patient.",
    ],
    matchHighlight:
      'Dale understands rural living, veteran pride, and the particular loneliness of people who have spent their lives being strong. He meets people where they are — literally and figuratively.',
  },
];

// ─── Community Impact Stories ───────────────────────────────────────

/**
 * Aggregate stories showing the cooperative model's impact
 * on caregivers, families, and the community. Each metric
 * includes a before/after comparison and an illustrative narrative.
 */
export const COMMUNITY_IMPACT_STORIES: CommunityImpact[] = [
  {
    metric: 'Caregiver Retention',
    before: '77% annual turnover (industry average)',
    after: '15% annual turnover (co-op.care)',
    story:
      'Maria worked for three agencies in two years, earning $13-15/hour with no benefits. At co-op.care, she earns $27/hour with health insurance and an ownership stake. She has been with the same family for 14 months — the longest placement of her career. When caregivers stay, families get consistency. When families get consistency, trust builds. When trust builds, outcomes improve.',
  },
  {
    metric: 'Caregiver Wages',
    before: '$13-16/hour (industry average, no benefits)',
    after: '$25-28/hour (co-op.care, full W-2 benefits)',
    story:
      'The home care industry posts $13/hour jobs and wonders why turnover is 77%. At co-op.care, caregivers earn a living wage, receive health insurance, and own equity in the cooperative. The math is simple: pay people what they are worth and they stay. When they stay, everyone wins.',
  },
  {
    metric: 'HSA/FSA Savings per Family',
    before: '$0 savings (families paying cash, unaware of LMN option)',
    after: '$4,200 average annual savings (via LMN + HSA/FSA)',
    story:
      'The Peterson family was spending $3,200/month out of pocket for companion care. They had no idea an LMN could make it HSA-eligible. After Dr. Emdur signed their LMN, they saved $1,100/month in taxes — nearly $13,000/year. They are not unique. Most families paying for companion care are overpaying because nobody told them about the LMN.',
  },
  {
    metric: 'Caregiver Burnout (CII Scores)',
    before: 'Average CII of 74 at intake (Yellow-Red zone)',
    after: 'Average CII of 48 after 3 months of companion care (Green-Yellow zone)',
    story:
      'Amy called at 9:47pm on a Thursday, crying in a parking lot. Her CII was 84 — deep red. Three months later, with consistent companion care for her mother and support from her Care Navigator, her CII dropped to 52. She sleeps through the night. She is back at work full-time. The companion care was for her mother. The benefit was for the whole family.',
  },
  {
    metric: 'Fall Prevention',
    before: '1 in 4 adults over 65 falls each year (CDC)',
    after: 'Zero falls reported among families with companion care + home assessment',
    story:
      "Dorothy's Video Home Assessment identified 11 fall hazards. Her companion, Anita, worked with her to fix them — grab bars, lighting, non-slip mats. Six months later: zero falls. The assessment took 5 minutes. The modifications cost less than one ER visit. Dorothy is still in her home.",
  },
  {
    metric: 'Employer Retention ROI',
    before: '$180K-250K cost to replace one senior employee lost to caregiving',
    after: '$3,000/employee/year for companion care benefit — 10x ROI',
    story:
      'Rachel, VP of People, lost three senior engineers to caregiving in 18 months — nearly $600K in replacement costs. She piloted co-op.care as an employee benefit for 15 caregiving employees. Cost: $45,000. Result: zero caregiving resignations, 34% reduction in absenteeism. She called it "the best benefits investment I have ever made."',
  },
  {
    metric: 'Hospital Readmission Prevention',
    before: '17.1% 30-day readmission rate for hip replacement (national average)',
    after: '0% readmission rate for co-op.care companion care post-surgical families',
    story:
      'Robert had a hip replacement at 71. With companion support during his 6-week recovery — transportation to PT, exercise monitoring, fall prevention — he returned to the gym at week 8 with zero complications. His companion, Daniel, stopped him from mowing the lawn at week 3. That alone may have prevented a readmission.',
  },
  {
    metric: 'Family Caregiver Work Disruption',
    before: '61% of family caregivers report work disruptions (AARP)',
    after: '12% report work disruptions after starting companion care',
    story:
      "Jennifer was leaving work early twice a week for her mother's needs and burning through all her PTO. After starting companion care three mornings a week, she hasn't left work early in three months. She made it to every one of her son's basketball games. Her dependent care FSA covered most of the cost.",
  },
];

// ─── Utility Exports ────────────────────────────────────────────────

/**
 * Get all stories for a given category.
 *
 * @param category - The story category to filter by
 * @returns Array of stories in that category
 */
export function getStoriesByCategory(category: StoryCategory): FamilyStoryArchetype[] {
  return FAMILY_STORY_ARCHETYPES.filter((s) => s.category === category);
}

/**
 * Get a single story by ID.
 *
 * @param id - The story's unique identifier
 * @returns The matching story, or undefined
 */
export function getStoryById(id: string): FamilyStoryArchetype | undefined {
  return FAMILY_STORY_ARCHETYPES.find((s) => s.id === id);
}

/**
 * Get all unique trigger keywords across all stories.
 * Useful for building keyword detection in the SageEngine.
 *
 * @returns Deduplicated array of all trigger strings
 */
export function getAllTriggers(): string[] {
  const triggers = new Set<string>();
  FAMILY_STORY_ARCHETYPES.forEach((s) => s.triggers.forEach((t) => triggers.add(t)));
  return Array.from(triggers);
}
