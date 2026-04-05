/**
 * SageHero — Agentic AI companion as the homepage's primary interface
 *
 * AGENTIC CAPABILITIES:
 * 1. Inline Mini CII assessment — 3 sliders, scored in real-time
 * 2. Action buttons — trigger workflows from within chat
 * 3. Thinking steps — animated multi-step reasoning visualization
 * 4. Contextual follow-ups — dynamic chips based on conversation
 * 5. Multi-turn intake — structured care needs gathering
 * 6. Voice input via Web Speech API
 *
 * Public-facing (no auth). After sign-in, users get full SageChat
 * with care recipient context, medications, and CII scores.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { TileIcon } from '../../components/TileIcon';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ActionButton {
  id: string;
  label: string;
  icon: string;
  actionType: 'start-assessment' | 'navigate' | 'show-plans' | 'start-intake' | 'contact';
  payload?: string;
}

interface FollowupChip {
  label: string;
  message: string;
}

interface Message {
  id: string;
  role: 'user' | 'sage';
  content: string;
  timestamp: Date;
  actions?: ActionButton[];
  followups?: FollowupChip[];
  type?: 'text' | 'assessment' | 'assessment-result' | 'intake';
}

interface SageResponse {
  content: string;
  actions?: ActionButton[];
  followups?: FollowupChip[];
  thinkingSteps?: string[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const THINKING_SEQUENCES: Record<string, string[]> = {
  general: ['Thinking...', 'Finding resources...', 'Preparing response...'],
  assessment: [
    'Analyzing your responses...',
    'Calculating care index...',
    'Preparing personalized recommendations...',
  ],
  emotional: ['I hear you...', 'Processing what you shared...', 'Finding the right support...'],
  intake: [
    'Understanding your needs...',
    'Checking available services...',
    'Building your care profile...',
  ],
  search: [
    'Searching care options...',
    'Checking availability in Boulder...',
    'Matching resources...',
  ],
  financial: [
    'Running the numbers...',
    'Checking HSA/FSA eligibility...',
    'Calculating potential savings...',
  ],
  safety: ['Checking our protocols...', 'Reviewing safety measures...'],
  local: ['Searching Boulder area...', 'Checking local resources...', 'Finding nearby support...'],
};

type SuggestedTopic =
  | 'what-is-coop'
  | 'time-bank'
  | 'comfort-card'
  | 'caregiver-stress'
  | 'get-started'
  | 'become-neighbor'
  | 'cost';

const SUGGESTED_TOPICS: Array<{ id: SuggestedTopic; label: string; icon: string }> = [
  { id: 'caregiver-stress', label: "I'm overwhelmed", icon: 'heart' },
  { id: 'what-is-coop', label: 'What is co-op.care?', icon: 'home' },
  { id: 'become-neighbor', label: 'I want to help', icon: 'handshake' },
  { id: 'time-bank', label: 'How does Time Bank work?', icon: 'clock' },
  { id: 'comfort-card', label: 'Save on care costs', icon: 'card' },
  { id: 'cost', label: "What's free vs paid?", icon: 'money' },
];

// ─── Agentic Response Engine ────────────────────────────────────────────────
// Handler order matters: emergency first, then topic-chip matches, then keyword
// matches (most specific → least specific), then default fallback.

function generatePublicResponse(userMessage: string, topic?: SuggestedTopic): SageResponse {
  const msg = userMessage.toLowerCase().trim();

  // ── EMERGENCY — always check first ────────────────────────────────────────

  if (
    msg.includes('911') ||
    msg.includes('emergency') ||
    msg.includes('chest pain') ||
    msg.includes("can't breathe") ||
    msg.includes('unconscious') ||
    msg.includes('stroke') ||
    msg.includes('not breathing') ||
    msg.includes('seizure') ||
    msg.includes('bleeding') ||
    msg.includes('unresponsive')
  ) {
    return {
      content: `**If this is a medical emergency, please call 911 immediately.**\n\nI'm here for you after everyone is safe. I can help you understand what happened, plan next steps with your care team, and find additional support.\n\nYou're not alone in this.`,
      actions: [
        { id: 'call', label: 'Call 911', icon: 'sos', actionType: 'navigate', payload: 'tel:911' },
        { id: 'schedule', label: 'Talk to Someone After', icon: 'phone', actionType: 'contact' },
      ],
      thinkingSteps: ['Checking for emergency...'],
    };
  }

  // ── CRISIS / SUICIDAL ─────────────────────────────────────────────────────

  if (
    msg.includes('suicide') ||
    msg.includes('kill myself') ||
    msg.includes('want to die') ||
    msg.includes('end it') ||
    msg.includes('no reason to live') ||
    msg.includes('self-harm') ||
    msg.includes('hurt myself')
  ) {
    return {
      content: `I hear you, and I'm glad you said something. Please reach out now:\n\n**988 Suicide & Crisis Lifeline:** Call or text **988** (24/7, free, confidential)\n\n**Crisis Text Line:** Text HOME to **741741**\n\nCaregiving can push you to places you never expected. That doesn't make you weak — it makes you human. These feelings are more common than you think among caregivers, and there are people trained to help right now.\n\nI'll be here when you're ready to talk about care support.`,
      actions: [
        {
          id: 'crisis',
          label: 'Call 988 Crisis Line',
          icon: 'phone',
          actionType: 'navigate',
          payload: 'tel:988',
        },
        {
          id: 'text',
          label: 'Text Crisis Line',
          icon: 'chat',
          actionType: 'navigate',
          payload: 'sms:741741',
        },
      ],
      thinkingSteps: ['Connecting you with support...'],
    };
  }

  // ── TOPIC CHIP: What is co-op.care? ───────────────────────────────────────

  if (
    topic === 'what-is-coop' ||
    msg.includes('what is co-op') ||
    msg.includes('what is coop') ||
    msg.includes('how does co-op') ||
    msg.includes('tell me about co-op') ||
    msg.includes('about co-op')
  ) {
    return {
      content: `We're Boulder's first worker-owned home care cooperative. Think of it as three circles of care:\n\n**Care Navigators** — Professional caregivers who earn $25-28/hr, get full benefits, and own equity in the company. They stay because it's theirs.\n\n**Time Bank Neighbors** — Community members who give an hour of help and earn an hour of care credit. Meals, rides, companionship, yard work — real support from real people nearby.\n\n**Your Existing Circle** — We help the people already helping you coordinate better, so nothing falls through the cracks.\n\nThe reason it works? When caregivers are paid well and own what they build, they don't leave. That continuity — the same person, the same trust — is the care.`,
      actions: [
        {
          id: 'assess',
          label: 'Check My Burnout Level',
          icon: 'pulse',
          actionType: 'start-assessment',
        },
        { id: 'plans', label: 'See Care Plans', icon: 'clipboard', actionType: 'show-plans' },
      ],
      followups: [
        {
          label: 'How is it different from agencies?',
          message: 'How is co-op.care different from traditional home care agencies?',
        },
        {
          label: 'What does a Care Navigator do?',
          message: 'What does a Care Navigator actually do day-to-day?',
        },
        { label: 'Who runs this?', message: 'Who started co-op.care and why?' },
      ],
      thinkingSteps: THINKING_SEQUENCES.general,
    };
  }

  // ── TOPIC CHIP: I'm overwhelmed / caregiver stress ────────────────────────

  if (
    topic === 'caregiver-stress' ||
    msg.includes('overwhelm') ||
    msg.includes('stressed') ||
    msg.includes("can't do this") ||
    msg.includes('breaking point') ||
    msg.includes('at my limit') ||
    msg.includes('falling apart')
  ) {
    return {
      content: `I hear you. The fact that you're reaching out? That takes courage.\n\n63 million Americans are doing exactly what you're doing right now — providing an average of 27 hours of unpaid care every week. It's one of the hardest things a person can do, and most of us do it without nearly enough support.\n\nI can do something right now that might help. A quick burnout check — three sliders, 30 seconds. It gives you a clear, honest picture of where you are. Not to scare you, but so we can figure out the right kind of help together.`,
      actions: [
        {
          id: 'assess',
          label: 'Take the 30-Second Check',
          icon: 'pulse',
          actionType: 'start-assessment',
        },
        { id: 'talk', label: 'I Just Need to Talk', icon: 'chat', actionType: 'start-intake' },
      ],
      followups: [
        {
          label: 'What support is available?',
          message: 'What kind of support can co-op.care actually provide?',
        },
        { label: 'I need to talk to someone', message: 'Can I talk to a real person?' },
        { label: 'Am I a bad caregiver?', message: "I feel like I'm failing at caregiving" },
      ],
      thinkingSteps: THINKING_SEQUENCES.emotional,
    };
  }

  // ── GUILT / FAILURE / "BAD DAUGHTER" ──────────────────────────────────────

  if (
    msg.includes('guilt') ||
    msg.includes('guilty') ||
    msg.includes('fail') ||
    msg.includes('bad daughter') ||
    msg.includes('bad son') ||
    msg.includes('bad caregiver') ||
    msg.includes('not enough') ||
    msg.includes('letting them down') ||
    msg.includes('selfish') ||
    msg.includes('should be doing more')
  ) {
    return {
      content: `Can I be really honest with you? The people who worry about being a bad caregiver are almost never the ones who actually are.\n\nGuilt is the most common feeling among family caregivers — and it's almost always undeserved. You're carrying something enormous. The fact that you care this much IS the proof that you're doing right by them.\n\nHere's what I know from talking to thousands of caregivers: taking a break doesn't mean you're abandoning anyone. Getting help doesn't mean you're failing. It means you're making sure you can keep going.\n\nWould it help to see where you actually stand? The burnout check takes 30 seconds and gives you real data instead of your inner critic's version.`,
      actions: [
        {
          id: 'assess',
          label: 'See Where I Actually Stand',
          icon: 'pulse',
          actionType: 'start-assessment',
        },
        {
          id: 'schedule',
          label: 'Talk to Someone Who Gets It',
          icon: 'phone',
          actionType: 'contact',
        },
      ],
      followups: [
        { label: 'I need a break', message: 'I need respite — I need a break from caregiving' },
        {
          label: 'How do others handle this?',
          message: 'How do other caregivers manage the guilt?',
        },
        { label: "What help won't cost me?", message: 'What support is free?' },
      ],
      thinkingSteps: THINKING_SEQUENCES.emotional,
    };
  }

  // ── GRIEF / LOSS / ANTICIPATORY GRIEF ─────────────────────────────────────

  if (
    msg.includes('grief') ||
    msg.includes('griev') ||
    msg.includes('dying') ||
    msg.includes('end of life') ||
    msg.includes('hospice') ||
    msg.includes('losing') ||
    msg.includes('lost') ||
    msg.includes('passed') ||
    msg.includes('miss them') ||
    msg.includes('not the same person')
  ) {
    return {
      content: `I'm so sorry. Grief in caregiving is something people don't talk about enough — especially the grief that starts before someone is gone. Watching the person you love change, forget, slip away slowly... that's a loss you carry every single day.\n\nYou don't need to be "okay" right now. You just need to not carry this alone.\n\nco-op.care can connect you with other caregivers who understand this specific kind of grief. We also have Care Navigators who are trained to support families through end-of-life transitions — not as therapists, but as people who've been there.`,
      actions: [
        { id: 'schedule', label: 'Talk to a Care Navigator', icon: 'phone', actionType: 'contact' },
        {
          id: 'assess',
          label: 'Check My Burnout Level',
          icon: 'pulse',
          actionType: 'start-assessment',
        },
      ],
      followups: [
        { label: 'Advance care planning', message: 'Help me think about advance care planning' },
        { label: 'Finding respite', message: 'I need a break from caregiving' },
        { label: "I'm not coping well", message: "I'm struggling to cope with being a caregiver" },
      ],
      thinkingSteps: THINKING_SEQUENCES.emotional,
    };
  }

  // ── EXHAUSTION / TIRED / BURNOUT (without the more acute "overwhelm") ─────

  if (
    msg.includes('tired') ||
    msg.includes('exhaust') ||
    msg.includes('burn') ||
    msg.includes('no energy') ||
    msg.includes('running on empty') ||
    msg.includes('worn out') ||
    msg.includes('drain')
  ) {
    return {
      content: `Running on empty is where most caregivers live — and it's not sustainable. Your body is telling you something important.\n\nThe average family caregiver spends $7,200 out-of-pocket per year on top of the 27 hours a week of unpaid care. That's a full-time job you didn't apply for, on top of everything else in your life.\n\nLet's get you a quick read on where you are — not to judge, but to figure out what kind of support would actually make a difference. Thirty seconds, three sliders.`,
      actions: [
        {
          id: 'assess',
          label: 'Quick Burnout Check',
          icon: 'pulse',
          actionType: 'start-assessment',
        },
        { id: 'schedule', label: 'Talk to Someone', icon: 'phone', actionType: 'contact' },
      ],
      followups: [
        { label: "I can't afford help", message: "I can't afford to pay for care" },
        { label: 'I need respite now', message: 'I need a break from caregiving right now' },
        {
          label: "What if it's just temporary?",
          message: 'Is this normal or should I be worried?',
        },
      ],
      thinkingSteps: THINKING_SEQUENCES.emotional,
    };
  }

  // ── RESPITE / NEED A BREAK ────────────────────────────────────────────────

  if (
    msg.includes('respite') ||
    msg.includes('break') ||
    msg.includes('time off') ||
    msg.includes("can't keep going") ||
    msg.includes('need a rest') ||
    msg.includes('night off')
  ) {
    return {
      content: `Needing a break isn't weakness — it's how you keep going. And you deserve it more than you probably believe right now.\n\nHere's what co-op.care can do:\n\n**Time Bank (free to start)** — A neighbor can sit with your loved one while you take a walk, see a friend, or just breathe. Every family gets access to our Respite Fund for urgent needs — yoga classes, meditation sessions, massage, anything that helps you recover.\n\n**Care Navigator ($35/hr, or $22-25 with HSA)** — A trained professional for when you need a full day, a weekend, or regular weekly respite.\n\n**Your first Time Bank request can happen within 24 hours.** Someone nearby, background-checked, ready to help.\n\nWhat would help most — a few hours this week, or a regular schedule?`,
      actions: [
        {
          id: 'tb',
          label: 'Request Time Bank Help',
          icon: 'clock',
          actionType: 'navigate',
          payload: '#/onboarding',
        },
        { id: 'schedule', label: 'Talk to a Navigator', icon: 'phone', actionType: 'contact' },
      ],
      followups: [
        { label: "What's the Respite Fund?", message: 'Tell me about the Respite Fund' },
        { label: 'I need help today', message: 'I need someone to help today or tomorrow' },
        { label: 'Regular weekly help', message: 'I need regular weekly respite care' },
      ],
      thinkingSteps: THINKING_SEQUENCES.local,
    };
  }

  // ── TOPIC CHIP: Become a neighbor / volunteer ─────────────────────────────

  if (
    topic === 'become-neighbor' ||
    msg.includes('give back') ||
    msg.includes('i want to help') ||
    msg.includes('help others') ||
    msg.includes('contribute') ||
    msg.includes('volunteer')
  ) {
    return {
      content: `That means a lot. The families in our community really need people like you.\n\nAs a **Time Bank Neighbor**, you give an hour of help and earn an hour of care credit. It's reciprocity — not charity.\n\n**Things you might do:**\n- Drive someone's mom to the doctor\n- Cook a meal and drop it off\n- Sit with someone for an hour so their daughter can rest\n- Help with yard work, tech support, errands\n- Share a skill — PT exercises, yoga, tutoring\n\n**What you get back:**\n- Hours saved for when you or your family needs care someday\n- A real safety net built on community trust\n- Background-checked, GPS-verified for everyone's safety\n\nYour first match can happen within 24 hours. No membership fee to start helping — the $100/year membership unlocks full benefits when you're ready.\n\nSome neighbors discover they want to make this a career as a **Care Navigator** — $25-28/hr, full W-2 benefits, ownership equity.`,
      actions: [
        {
          id: 'join-tb',
          label: 'Sign Up as a Neighbor',
          icon: 'handshake',
          actionType: 'navigate',
          payload: '#/onboarding',
        },
        {
          id: 'pro',
          label: 'Explore Care Navigator Career',
          icon: 'compass',
          actionType: 'navigate',
          payload: '#/onboarding/worker',
        },
      ],
      followups: [
        {
          label: 'What does a Care Navigator earn?',
          message: 'Tell me about the Care Navigator career path',
        },
        { label: 'How is safety handled?', message: 'How are volunteers vetted and verified?' },
        {
          label: 'I know someone who needs help',
          message: 'I know someone who could use care support',
        },
      ],
      thinkingSteps: THINKING_SEQUENCES.general,
    };
  }

  // ── TOPIC CHIP: Time Bank ─────────────────────────────────────────────────

  if (
    topic === 'time-bank' ||
    msg.includes('time bank') ||
    msg.includes('timebank') ||
    msg.includes('hour bank') ||
    msg.includes('earn hours') ||
    msg.includes('care credit')
  ) {
    return {
      content: `The Time Bank is the heart of how co-op.care works. The idea is simple — and powerful:\n\n**Give an hour → Earn an hour.** Drive someone to the doctor? One hour. Cook a meal? One hour. Provide companionship? One hour. Every kind of help is valued equally.\n\n**Use your hours anytime.** When your family needs a meal delivered, a ride to an appointment, companionship for your parent, or yard work — spend your hours.\n\n**It's reciprocity, not charity.** A teacher tutors a student and receives yard work. A retired nurse gives health guidance and receives tech support. Everyone has something to offer.\n\n**$100/year membership** includes 40 hours. You can earn unlimited more by helping neighbors. Your first match can happen within 24 hours.`,
      actions: [
        {
          id: 'join-tb',
          label: 'Join the Time Bank',
          icon: 'clock',
          actionType: 'navigate',
          payload: '#/onboarding',
        },
        {
          id: 'browse',
          label: 'See Available Tasks',
          icon: 'clipboard',
          actionType: 'navigate',
          payload: '#/neighbors',
        },
      ],
      followups: [
        {
          label: 'What tasks can I do?',
          message: 'What kinds of tasks are available in the Time Bank?',
        },
        {
          label: "What's free vs $100?",
          message: 'What can I do before paying the $100 membership?',
        },
        { label: 'Is it safe?', message: 'How are Time Bank members vetted?' },
      ],
      thinkingSteps: THINKING_SEQUENCES.general,
    };
  }

  // ── TOPIC CHIP: Comfort Card / HSA / FSA / Tax savings ────────────────────

  if (
    topic === 'comfort-card' ||
    msg.includes('comfort card') ||
    msg.includes('hsa') ||
    msg.includes('fsa') ||
    msg.includes('tax') ||
    msg.includes('deduct') ||
    msg.includes('pre-tax')
  ) {
    return {
      content: `The Comfort Card is how families save 28-36% on care costs — it's one of the most impactful things we offer.\n\nIt works like a debit card loaded with your HSA or FSA funds. Use it for companion care, meals, rides, respite — all with pre-tax dollars.\n\n**Here's a real example:** If you're in a 24% tax bracket spending $5,000/year on care, you save **$1,200-1,800 in taxes.** That's money back in your pocket every year.\n\nTo activate it, you need a Letter of Medical Necessity (LMN) — a doctor's note saying your loved one needs assistance. Our Medical Director, Dr. Emdur, handles this for a one-time $200 review. That $200 saves you $1,200+ in year one alone.`,
      actions: [
        {
          id: 'calc',
          label: 'Calculate My Savings',
          icon: 'chart',
          actionType: 'navigate',
          payload: '#/comfort-card/value',
        },
        {
          id: 'apply',
          label: 'Get Started with Comfort Card',
          icon: 'card',
          actionType: 'navigate',
          payload: '#/comfort-card',
        },
      ],
      followups: [
        { label: 'How does the LMN work?', message: 'How do I get a Letter of Medical Necessity?' },
        { label: 'What expenses qualify?', message: 'What care expenses are HSA/FSA eligible?' },
        { label: 'Is it worth the $200?', message: 'Is the $200 physician review worth it?' },
      ],
      thinkingSteps: THINKING_SEQUENCES.financial,
    };
  }

  // ── LMN / Letter of Medical Necessity ─────────────────────────────────────

  if (
    msg.includes('lmn') ||
    msg.includes('letter of medical') ||
    msg.includes('medical necessity') ||
    msg.includes('doctor letter') ||
    msg.includes('physician review')
  ) {
    return {
      content: `The Letter of Medical Necessity (LMN) is the key that unlocks HSA/FSA savings on care. Here's how it works:\n\n**What it is:** A letter from a physician certifying that your loved one requires assistance with daily living. It makes companion care, meals, rides, and other services HSA/FSA-eligible.\n\n**How we help:** Our Medical Director, Dr. Josh Emdur (board-certified, licensed in all 50 states), conducts a Caregiver Resource Index assessment and writes the LMN. One-time $200 fee.\n\n**What it saves:** $1,200-1,800/year in tax savings on care costs. The $200 pays for itself within the first 2-3 months.\n\n**The process:**\n1. Complete your free burnout assessment (we have your side covered)\n2. Dr. Emdur reviews your situation and your loved one's needs\n3. LMN issued — typically within a week\n4. Comfort Card activated — start paying with pre-tax dollars`,
      actions: [
        {
          id: 'assess',
          label: 'Start with Free Assessment',
          icon: 'pulse',
          actionType: 'start-assessment',
        },
        { id: 'schedule', label: 'Talk to Us About the LMN', icon: 'phone', actionType: 'contact' },
      ],
      followups: [
        { label: 'Who is Dr. Emdur?', message: 'Tell me about your Medical Director' },
        {
          label: 'What does the $200 cover?',
          message: 'What exactly is included in the $200 physician review?',
        },
        { label: 'I already have an LMN', message: 'I already have a Letter of Medical Necessity' },
      ],
      thinkingSteps: THINKING_SEQUENCES.financial,
    };
  }

  // ── TOPIC CHIP: Cost / Free vs Paid ───────────────────────────────────────

  if (
    topic === 'cost' ||
    msg.includes('cost') ||
    msg.includes('price') ||
    msg.includes('how much') ||
    msg.includes('free') ||
    msg.includes('paid') ||
    msg.includes('charge') ||
    msg.includes('what do you charge') ||
    msg.includes('pricing')
  ) {
    return {
      content: `Here's the honest breakdown — we lead with free because we mean it:\n\n**Always Free:**\n- Sage (this conversation, always)\n- Burnout assessment & care planning\n- Emotional support and caregiver resources\n- Signing up as a Time Bank neighbor\n\n**$100/year Membership:**\n- 40 Time Bank hours included (that's $2.50/hr)\n- Earn unlimited more by helping neighbors\n- Voting rights in the cooperative\n\n**$200 Physician Review (one-time):**\n- Dr. Emdur conducts your Caregiver Resource Index\n- Writes a Letter of Medical Necessity\n- Activates the Comfort Card for HSA/FSA spending\n- Saves **$1,200-1,800/year** → a **6-9x return** in year one\n\n**$35/hr Professional Care:**\n- W-2 Care Navigator visits\n- Drops to **$22-25/hr** with Comfort Card\n- Compare: agencies charge $45-65/hr\n\nMost families start with the free assessment, then decide from there.`,
      actions: [
        {
          id: 'assess',
          label: 'Free Burnout Check',
          icon: 'pulse',
          actionType: 'start-assessment',
        },
        {
          id: 'neighbor',
          label: 'Become a Neighbor (Free)',
          icon: 'handshake',
          actionType: 'navigate',
          payload: '#/onboarding',
        },
        {
          id: 'calc',
          label: 'Calculate My Savings',
          icon: 'money',
          actionType: 'navigate',
          payload: '#/comfort-card/value',
        },
      ],
      followups: [
        {
          label: 'How does the Comfort Card work?',
          message: 'Tell me more about the Comfort Card and HSA/FSA savings',
        },
        {
          label: "What if I can't afford it?",
          message: "What options are there if I can't afford care right now?",
        },
        { label: 'I want to help neighbors', message: 'I want to become a Time Bank neighbor' },
      ],
      thinkingSteps: THINKING_SEQUENCES.financial,
    };
  }

  // ── GETTING STARTED ───────────────────────────────────────────────────────

  if (
    topic === 'get-started' ||
    msg.includes('sign up') ||
    msg.includes('register') ||
    msg.includes('how do i start') ||
    msg.includes('get started') ||
    msg.includes('next step')
  ) {
    return {
      content: `Two paths — both start free:\n\n**Need care for a loved one?**\n1. Take the free burnout check (30 seconds, right here)\n2. Create your account and tell us about your situation\n3. We match you with the right support\n→ Your first care visit can happen within days\n\n**Want to help neighbors?**\n1. Sign up as a Time Bank neighbor (free)\n2. Complete a background check\n3. Browse tasks near you\n→ Your first match within 24 hours\n\nYou can always do both — many people do. Which feels right for you?`,
      actions: [
        {
          id: 'assess',
          label: 'Free Burnout Check',
          icon: 'pulse',
          actionType: 'start-assessment',
        },
        {
          id: 'neighbor',
          label: 'Help Neighbors',
          icon: 'handshake',
          actionType: 'navigate',
          payload: '#/onboarding',
        },
        {
          id: 'signup',
          label: 'Sign Up for Care',
          icon: 'sparkle',
          actionType: 'navigate',
          payload: '#/onboarding/family',
        },
      ],
      followups: [
        { label: "What's free vs paid?", message: 'What exactly is free and what costs money?' },
        { label: 'Can I do both?', message: 'Can I both receive care and help neighbors?' },
      ],
      thinkingSteps: THINKING_SEQUENCES.general,
    };
  }

  // ── ASSESSMENT REQUEST ────────────────────────────────────────────────────

  if (
    msg.includes('assessment') ||
    msg.includes('check-in') ||
    msg.includes('check in') ||
    msg.includes('burnout') ||
    msg.includes('score') ||
    msg.includes('quiz') ||
    msg.includes('test my')
  ) {
    return {
      content: `Let's do it. Three sliders, 30 seconds, completely private.\n\nI'll measure your physical strain, sleep quality, and social isolation — the three things that predict caregiver burnout most reliably. Then we'll talk about what the numbers mean for you.`,
      actions: [
        {
          id: 'assess',
          label: 'Start the Check-in',
          icon: 'pulse',
          actionType: 'start-assessment',
        },
      ],
      thinkingSteps: THINKING_SEQUENCES.assessment,
    };
  }

  // ── CARE NAVIGATOR CAREER PATH ────────────────────────────────────────────

  if (
    msg.includes('care navigator') ||
    msg.includes('career') ||
    msg.includes('work for') ||
    msg.includes('job') ||
    msg.includes('apply') ||
    msg.includes('become a caregiver') ||
    msg.includes('hiring') ||
    msg.includes('employment')
  ) {
    return {
      content: `Care Navigators are the professional heart of co-op.care — and the job is unlike anything else in home care.\n\n**The basics:**\n- $25-28/hr, W-2 with full benefits\n- Equity ownership in the cooperative (~$52K value over 5 years)\n- You build real relationships — same families, ongoing trust\n\n**Why it's different:** At agencies, caregivers earn $12-15/hr with no benefits and 77% turnover. Here, you own what you build. When you stay, your families get continuity — and you get wealth.\n\n**What you'd do:** Companion care, care coordination, medication reminders, meal support, transportation, health monitoring. You're not just "sitting" — you're navigating a family through one of the hardest things they'll face.\n\nWe're looking for compassionate people in the Boulder area. Experience helps, but what matters most is that you genuinely care.`,
      actions: [
        {
          id: 'apply',
          label: 'Apply as Care Navigator',
          icon: 'compass',
          actionType: 'navigate',
          payload: '#/onboarding/worker',
        },
        { id: 'schedule', label: 'Ask Us Questions', icon: 'phone', actionType: 'contact' },
      ],
      followups: [
        {
          label: 'What training is provided?',
          message: 'What training do Care Navigators receive?',
        },
        {
          label: 'How does equity work?',
          message: 'How does cooperative ownership work for caregivers?',
        },
        {
          label: "What's the schedule like?",
          message: 'What does a typical Care Navigator schedule look like?',
        },
      ],
      thinkingSteps: THINKING_SEQUENCES.search,
    };
  }

  // ── COOPERATIVE OWNERSHIP / EQUITY ────────────────────────────────────────

  if (
    msg.includes('cooperative') ||
    msg.includes('co-op') ||
    msg.includes('equity') ||
    msg.includes('ownership') ||
    msg.includes('worker-owned') ||
    msg.includes('worker owned') ||
    msg.includes('how do workers') ||
    msg.includes('patronage') ||
    msg.includes('dividend')
  ) {
    return {
      content: `co-op.care is a Limited Cooperative Association (LCA) — that means the people who do the work and the families who receive care together own the company.\n\n**For Care Navigators:**\n- After a qualifying period, you can purchase a membership share\n- You receive patronage dividends based on hours worked\n- You vote on major decisions — pay rates, policies, leadership\n- Projected equity value: ~$52K over 5 years\n\n**For Families:**\n- Your $100/year membership includes cooperative voting rights\n- You have a real voice in how care is delivered\n- Surplus revenue flows back to members, not to shareholders\n\n**Why it matters:** Agencies are owned by private equity firms who extract value. Here, every dollar stays in the community. That's why our caregivers earn $25-28/hr instead of $12-15.`,
      actions: [
        {
          id: 'join',
          label: 'Join the Cooperative',
          icon: 'home',
          actionType: 'navigate',
          payload: '#/onboarding',
        },
        {
          id: 'navigator',
          label: 'Become a Care Navigator',
          icon: 'compass',
          actionType: 'navigate',
          payload: '#/onboarding/worker',
        },
      ],
      followups: [
        {
          label: 'How is this different from agencies?',
          message: 'How is co-op.care different from traditional home care agencies?',
        },
        { label: 'Do I get a say?', message: 'What can I vote on as a member?' },
        { label: 'Is this a non-profit?', message: 'Is co-op.care a non-profit?' },
      ],
      thinkingSteps: THINKING_SEQUENCES.general,
    };
  }

  // ── SAFETY / VETTING / BACKGROUND CHECKS ──────────────────────────────────

  if (
    msg.includes('safe') ||
    msg.includes('background') ||
    msg.includes('vetted') ||
    msg.includes('trust') ||
    msg.includes('verified') ||
    msg.includes('check') ||
    msg.includes('screen') ||
    msg.includes('stranger')
  ) {
    return {
      content: `Safety is everything when you're inviting someone into your family's life. Here's what we do:\n\n**Background Checks:** Every neighbor and Care Navigator goes through a comprehensive background check before their first visit.\n\n**GPS Verification:** Check-in and check-out within 0.25 miles of the care location. You always know when someone arrives and leaves.\n\n**Identity Matching:** We prioritize matching people who share identities, interests, or proximity — because comfort matters as much as competence.\n\n**W-2 Professionals:** Care Navigators are employees, not gig workers. They're trained, insured, and accountable.\n\n**Your control:** You approve every match. You can request specific people. You can change your mind anytime.\n\nNothing happens in your home without your explicit okay.`,
      actions: [
        {
          id: 'signup',
          label: 'See How Matching Works',
          icon: 'sparkle',
          actionType: 'navigate',
          payload: '#/onboarding/family',
        },
        { id: 'schedule', label: 'Ask Us Anything', icon: 'phone', actionType: 'contact' },
      ],
      followups: [
        { label: 'How does matching work?', message: 'How do you match families with caregivers?' },
        {
          label: "What if I don't like the match?",
          message: "What happens if the match isn't working?",
        },
        {
          label: 'Is my information private?',
          message: 'How is my personal information protected?',
        },
      ],
      thinkingSteps: THINKING_SEQUENCES.safety,
    };
  }

  // ── AGENCY COMPARISON ─────────────────────────────────────────────────────

  if (
    msg.includes('agency') ||
    msg.includes('agencies') ||
    msg.includes('visiting angel') ||
    msg.includes('home instead') ||
    msg.includes('different from') ||
    msg.includes('compare') ||
    msg.includes('vs ') ||
    msg.includes('versus')
  ) {
    return {
      content: `Here's the honest comparison:\n\n| | Agencies | co-op.care |\n|---|---|---|\n| Rate | $45-65/hr | $35/hr ($22-25 with HSA) |\n| Caregiver pay | $12-15/hr | $25-28/hr + equity |\n| Annual turnover | 77% | Target: 15% |\n| Ownership | Corporate/PE | Worker + family owned |\n| Continuity | New face every month | Same navigator, always |\n\nThe math is simple: when caregivers earn twice as much, own equity, and build real relationships — they stay. And continuity is the single biggest predictor of care quality.\n\nAgencies have 77% annual turnover. That means your mom meets a new stranger almost every month. We think that's broken, and we built something to fix it.`,
      actions: [
        { id: 'assess', label: 'Check My Needs', icon: 'pulse', actionType: 'start-assessment' },
        {
          id: 'signup',
          label: 'Get Started',
          icon: 'sparkle',
          actionType: 'navigate',
          payload: '#/onboarding/family',
        },
      ],
      followups: [
        {
          label: 'How do workers become owners?',
          message: 'How does cooperative ownership work for caregivers?',
        },
        { label: 'What about quality?', message: 'How do you ensure care quality?' },
        {
          label: 'What tasks are covered?',
          message: 'What kinds of care services do you provide?',
        },
      ],
      thinkingSteps: THINKING_SEQUENCES.search,
    };
  }

  // ── CAN'T AFFORD / FINANCIAL HARDSHIP ─────────────────────────────────────

  if (
    msg.includes('afford') ||
    msg.includes('expensive') ||
    msg.includes('money') ||
    msg.includes('income') ||
    msg.includes('poor') ||
    msg.includes('budget') ||
    msg.includes('struggling financially') ||
    msg.includes('too much')
  ) {
    return {
      content: `I hear you — care costs are genuinely overwhelming. The average family caregiver spends $7,200 out-of-pocket per year. That's not sustainable.\n\nBut here's why we exist: **most of what co-op.care offers is free.**\n\nRight now, at no cost:\n- This conversation and everything Sage can do\n- A full burnout assessment and care plan\n- Signing up as a Time Bank neighbor — give an hour, get an hour\n\nThe **Time Bank** ($100/year, includes 40 hours) was designed specifically for families who can't afford traditional care. That's $2.50/hour. You can earn more hours by helping neighbors — making it even more affordable.\n\nAnd if you can swing the $200 physician review, it unlocks HSA/FSA savings of $1,200-1,800/year. That's a 6-9x return.\n\nBut start free. Start with the assessment. We'll figure out the rest together.`,
      actions: [
        { id: 'assess', label: 'Free Assessment', icon: 'pulse', actionType: 'start-assessment' },
        {
          id: 'tb',
          label: 'Explore Time Bank',
          icon: 'handshake',
          actionType: 'navigate',
          payload: '#/onboarding',
        },
      ],
      followups: [
        { label: 'How do I earn hours?', message: 'What tasks can I do to earn Time Bank hours?' },
        {
          label: 'Is the $200 worth it?',
          message: 'Is the $200 physician review worth it for the Comfort Card?',
        },
        { label: 'I need help right now', message: "I need help right now and I'm struggling" },
      ],
      thinkingSteps: THINKING_SEQUENCES.financial,
    };
  }

  // ── REAL PERSON / CONTACT ─────────────────────────────────────────────────

  if (
    msg.includes('person') ||
    msg.includes('human') ||
    msg.includes('phone') ||
    msg.includes('talk to') ||
    msg.includes('speak to') ||
    msg.includes('contact') ||
    msg.includes('call you') ||
    msg.includes('email')
  ) {
    return {
      content: `Of course — I'm good for a lot of things, but sometimes you need a real person.\n\n**Schedule a Call** — 15 minutes with a Care Navigator who'll listen and help you figure out next steps.\n\n**Email** — blaine@co-op.care — our founder responds personally.\n\n**In Person** — We're based in Boulder, CO. We'd love to meet over coffee.\n\nIf you'd like, I can run a quick assessment first so your Navigator has context before the call. But no pressure — you can just talk.`,
      actions: [
        { id: 'schedule', label: 'Schedule a Call', icon: 'phone', actionType: 'contact' },
        {
          id: 'assess',
          label: 'Prep with a Quick Check',
          icon: 'pulse',
          actionType: 'start-assessment',
        },
      ],
      followups: [
        {
          label: 'What happens on the call?',
          message: 'What should I expect on a call with a Care Navigator?',
        },
        { label: 'Run the assessment first', message: 'Let me take the burnout check first' },
      ],
      thinkingSteps: THINKING_SEQUENCES.general,
    };
  }

  // ── GREETINGS ─────────────────────────────────────────────────────────────

  if (msg.match(/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|what's up)/)) {
    return {
      content: `Hey there. I'm **Sage**, your care companion.\n\nI can help two ways — both start free:\n\n**Need care?** I'll run a quick burnout assessment and help you figure out the right support.\n\n**Want to give back?** Become a neighbor — give an hour of help, earn an hour of care credit.\n\nWhat's on your mind?`,
      actions: [
        {
          id: 'assess',
          label: 'Free Burnout Check',
          icon: 'pulse',
          actionType: 'start-assessment',
        },
        { id: 'neighbor', label: 'I Want to Help', icon: 'handshake', actionType: 'start-intake' },
      ],
      followups: [
        { label: 'What is co-op.care?', message: 'What is co-op.care?' },
        { label: "I'm overwhelmed", message: "I'm feeling overwhelmed as a caregiver" },
        { label: "What's free vs paid?", message: 'What exactly is free and what costs money?' },
      ],
      thinkingSteps: THINKING_SEQUENCES.general,
    };
  }

  // ── CARE PLAN / CARE NEEDS ────────────────────────────────────────────────

  if (
    msg.includes('plan') ||
    msg.includes('care for') ||
    msg.includes('my parent') ||
    msg.includes('my mom') ||
    msg.includes('my dad') ||
    msg.includes('my mother') ||
    msg.includes('my father') ||
    msg.includes('my spouse') ||
    msg.includes('aging') ||
    msg.includes('elderly')
  ) {
    return {
      content: `Let me help you think through this. Every family's situation is different, and the right care plan depends on what you're actually dealing with day-to-day.\n\nFirst — who needs care, and what's the biggest challenge right now?`,
      followups: [
        { label: 'My aging parent', message: 'My aging parent needs help at home' },
        { label: 'My spouse/partner', message: 'My spouse needs care support' },
        { label: 'I need help myself', message: "I'm the one who needs support" },
        {
          label: "I'm not sure yet",
          message: "I'm not sure what we need — can you help me figure it out?",
        },
      ],
      thinkingSteps: THINKING_SEQUENCES.intake,
    };
  }

  // ── YOGA / WELLNESS / MOVEMENT ───────────────────────────────────────────

  if (
    msg.includes('yoga') ||
    msg.includes('stretch') ||
    msg.includes('meditation') ||
    msg.includes('mindful') ||
    msg.includes('exercise') ||
    msg.includes('movement') ||
    msg.includes('wellness') ||
    msg.includes('self-care') ||
    msg.includes('self care') ||
    msg.includes('my body') ||
    msg.includes('my back') ||
    msg.includes('physical health')
  ) {
    return {
      content: `Caregiving is physically brutal — and your body deserves care too.\n\nAt co-op.care, yoga and wellness aren't extras. They're part of your care plan:\n\n**For you (the caregiver):**\n- Gentle yoga and stretching for caregiver fatigue\n- Mindfulness and breathing exercises for stress\n- Movement breaks built into your schedule\n- Respite Fund covers yoga classes and meditation apps\n\n**For your loved one:**\n- Chair yoga for mobility and balance\n- Guided stretching to prevent falls\n- Breathing exercises for anxiety and sleep\n- Social movement groups to reduce isolation\n\n**The HSA/FSA benefit:** When yoga and wellness activities are part of a physician-supervised care plan, they're HSA/FSA eligible. Dr. Emdur writes the Letter of Medical Necessity — you save 28-36% paying with pre-tax health dollars.\n\nEvery wellness activity is documented in your care plan and visible to the physician. This isn't wellness theater — it's prescribed, tracked, and reimbursable.`,
      actions: [
        {
          id: 'assess',
          label: 'Check My Burnout Level',
          icon: 'pulse',
          actionType: 'start-assessment',
        },
        {
          id: 'signup',
          label: 'Get Started Free',
          icon: 'sparkle',
          actionType: 'navigate',
          payload: '#/onboarding',
        },
      ],
      followups: [
        {
          label: "What's HSA/FSA eligible?",
          message: 'How does HSA/FSA work for wellness and yoga?',
        },
        { label: 'Fall prevention', message: "I'm worried about falls for my loved one" },
        { label: 'I need respite', message: 'I need a break from caregiving' },
        { label: 'Caregiver burnout', message: "I think I'm burned out from caregiving" },
      ],
      thinkingSteps: THINKING_SEQUENCES.search,
    };
  }

  // ── TASKS / SERVICES ──────────────────────────────────────────────────────

  if (
    msg.includes('task') ||
    msg.includes('service') ||
    msg.includes('what can') ||
    msg.includes('meals') ||
    msg.includes('rides') ||
    msg.includes('companionship') ||
    msg.includes('yard') ||
    msg.includes('errands') ||
    msg.includes('what do you do') ||
    msg.includes('what help')
  ) {
    return {
      content: `Here's what neighbors and Care Navigators help with:\n\n**Companionship** — Visits, walks, phone calls, just being there\n**Meals** — Cooking, meal prep, grocery shopping and delivery\n**Transportation** — Doctor's appointments, errands, pharmacy runs\n**Home Help** — Yard work, light housekeeping, organizing\n**Tech Support** — Phones, tablets, video calls with family\n**Errands** — Prescriptions, post office, whatever's needed\n**Skilled Support** — PT exercises, yoga, health education\n\nEvery task in the Time Bank is valued at one hour, regardless of type. A meal delivery is worth as much as tech support — because all care matters equally.\n\nProfessional Care Navigators handle more complex needs: medication management, care coordination, health monitoring, and multi-hour visits.`,
      actions: [
        {
          id: 'tb',
          label: 'Browse Available Tasks',
          icon: 'clipboard',
          actionType: 'navigate',
          payload: '#/neighbors',
        },
        {
          id: 'signup',
          label: 'Request Care',
          icon: 'sparkle',
          actionType: 'navigate',
          payload: '#/onboarding/family',
        },
      ],
      followups: [
        {
          label: 'How fast can I get help?',
          message: 'How quickly can someone help after I sign up?',
        },
        { label: 'Join as a neighbor', message: 'I want to become a Time Bank neighbor' },
        {
          label: 'Professional vs volunteer',
          message: "What's the difference between a neighbor and a Care Navigator?",
        },
      ],
      thinkingSteps: THINKING_SEQUENCES.local,
    };
  }

  // ── MEDICATION QUESTIONS ──────────────────────────────────────────────────

  if (
    msg.includes('medication') ||
    msg.includes('medicine') ||
    msg.includes('pill') ||
    msg.includes('drug') ||
    msg.includes('prescription') ||
    msg.includes('dose')
  ) {
    return {
      content: `Medication management is one of the trickiest parts of caregiving — you're not alone in worrying about it.\n\nCommon concerns I hear:\n- **Timing conflicts** between multiple medications\n- **Side effects** that look like worsening symptoms\n- **Missed doses** — what's okay and what's dangerous\n\nOnce you're signed in, I can give advice specific to your loved one's medications and flag potential interactions. For now, I'd recommend starting with the burnout assessment — it helps me understand your full situation, not just the medication piece.`,
      actions: [
        {
          id: 'assess',
          label: 'Assess My Situation',
          icon: 'pulse',
          actionType: 'start-assessment',
        },
        { id: 'schedule', label: 'Talk to a Navigator', icon: 'phone', actionType: 'contact' },
      ],
      followups: [
        { label: 'Sundowning help', message: 'My loved one gets confused in the evenings' },
        { label: 'Fall prevention', message: "I'm worried about falls" },
        { label: 'Missed a dose', message: 'What do I do when they miss a medication dose?' },
      ],
      thinkingSteps: THINKING_SEQUENCES.search,
    };
  }

  // ── SUNDOWNING / DEMENTIA / CONFUSION ─────────────────────────────────────

  if (
    msg.includes('sundown') ||
    msg.includes('confus') ||
    msg.includes('agitat') ||
    msg.includes('wander') ||
    msg.includes('dementia') ||
    msg.includes('alzheimer') ||
    msg.includes('memory')
  ) {
    return {
      content: `Sundowning and confusion are incredibly stressful — for both of you. You're managing something that even professionals find challenging.\n\nStrategies other caregivers have found helpful:\n\n- **Keep afternoons calm and well-lit** — dim light can trigger confusion\n- **Maintain a predictable routine** — same meals, activities, bedtimes\n- **Limit caffeine after noon** and heavy evening meals\n- **Redirect gently** — arguing with confusion makes it worse\n- **Music from their era** can be remarkably calming\n\nSome medications work better at specific times to reduce evening confusion — that's worth discussing with their doctor.\n\nYou might also want to check your own burnout level. Caring for someone with cognitive decline takes a particularly heavy toll.`,
      actions: [
        {
          id: 'assess',
          label: 'Check My Burnout Level',
          icon: 'pulse',
          actionType: 'start-assessment',
        },
        { id: 'schedule', label: 'Talk to a Navigator', icon: 'phone', actionType: 'contact' },
      ],
      followups: [
        { label: 'Night wandering safety', message: 'How do I keep them safe at night?' },
        {
          label: 'When to call the doctor',
          message: 'When should I call the doctor about increased confusion?',
        },
        { label: 'I need a break', message: 'I need respite from dementia caregiving' },
      ],
      thinkingSteps: THINKING_SEQUENCES.emotional,
    };
  }

  // ── FALLS / BALANCE ───────────────────────────────────────────────────────

  if (
    msg.includes('fall') ||
    msg.includes('fell') ||
    msg.includes('trip') ||
    msg.includes('balance') ||
    msg.includes('unsteady')
  ) {
    return {
      content: `Falls are the #1 concern I hear — and they're scary. Here's what helps:\n\n**Right now:** Remove throw rugs, add grab bars in the bathroom, and make sure hallways are well-lit at night. These three changes prevent more falls than anything else.\n\n**Ongoing:** Ask their doctor to review medications for dizziness side effects — blood pressure meds are a common culprit. Non-slip shoes matter more than people think.\n\n**If they just fell:** Even if nothing seems broken, let the doctor know. Some injuries don't show symptoms right away, especially in older adults.\n\nA Care Navigator can do a home safety walkthrough and help you identify risks before they become emergencies.`,
      actions: [
        {
          id: 'assess',
          label: 'Assess My Situation',
          icon: 'pulse',
          actionType: 'start-assessment',
        },
        {
          id: 'signup',
          label: 'Get a Home Safety Visit',
          icon: 'sparkle',
          actionType: 'navigate',
          payload: '#/onboarding/family',
        },
      ],
      followups: [
        { label: 'Home safety checklist', message: "What's a good home safety checklist?" },
        { label: 'They fell recently', message: "My parent fell recently and I'm worried" },
        { label: 'Balance exercises', message: 'Are there exercises that help with balance?' },
      ],
      thinkingSteps: THINKING_SEQUENCES.search,
    };
  }

  // ── ADVANCE CARE PLANNING ─────────────────────────────────────────────────

  if (
    msg.includes('advance care') ||
    msg.includes('advance directive') ||
    msg.includes('living will') ||
    msg.includes('power of attorney') ||
    msg.includes('end of life') ||
    msg.includes('acp') ||
    msg.includes('wishes')
  ) {
    return {
      content: `These conversations are hard — but they're also one of the most loving things you can do for your family.\n\nAdvance care planning means making sure everyone knows what your loved one wants before a crisis forces a decision. It covers things like:\n\n- Who makes medical decisions if they can't\n- What kinds of treatment they'd want (or not want)\n- Where they'd prefer to receive care\n- What matters most to them about quality of life\n\nWe have a guided Advance Care Planning tool that walks you through the Five Wishes framework — one conversation at a time, at your pace. Our Care Navigators can also help facilitate these conversations in person.\n\nYou don't have to do this alone, and you don't have to do it all at once.`,
      actions: [
        {
          id: 'acp',
          label: 'Start Advance Care Planning',
          icon: 'clipboard',
          actionType: 'navigate',
          payload: '#/acp',
        },
        { id: 'schedule', label: 'Talk to a Navigator', icon: 'phone', actionType: 'contact' },
      ],
      followups: [
        {
          label: 'How do I start the conversation?',
          message: 'How do I bring up advance care planning with my parent?',
        },
        {
          label: 'Legal documents needed',
          message: 'What legal documents do I need for advance care planning?',
        },
        {
          label: "They won't talk about it",
          message: 'My parent refuses to discuss end-of-life plans',
        },
      ],
      thinkingSteps: THINKING_SEQUENCES.general,
    };
  }

  // ── BOULDER LOCAL / NEARBY ────────────────────────────────────────────────

  if (
    msg.includes('boulder') ||
    msg.includes('colorado') ||
    msg.includes('near me') ||
    msg.includes('local') ||
    msg.includes('in my area') ||
    msg.includes('nearby')
  ) {
    return {
      content: `We're based right here in Boulder, CO — this is our home community.\n\nRight now, co-op.care serves the Boulder County area: Boulder, Louisville, Lafayette, Superior, Longmont, and surrounding neighborhoods.\n\nOur Time Bank neighbors are your actual neighbors — people within a few miles who can help. Our matching prioritizes proximity: closer neighbors get priority matching, because a familiar face nearby is worth more than a stranger across town.\n\nWe'd love to meet you. You can reach us at blaine@co-op.care, or schedule a call — we're happy to do coffee, too.`,
      actions: [
        {
          id: 'signup',
          label: 'Join Our Community',
          icon: 'home',
          actionType: 'navigate',
          payload: '#/onboarding',
        },
        { id: 'schedule', label: 'Meet Us', icon: 'phone', actionType: 'contact' },
      ],
      followups: [
        {
          label: 'How many neighbors are there?',
          message: 'How many people are in the Time Bank?',
        },
        { label: 'Will you expand?', message: 'Will co-op.care expand beyond Boulder?' },
        {
          label: "I'm outside Boulder",
          message: "I don't live in Boulder — can I still use co-op.care?",
        },
      ],
      thinkingSteps: THINKING_SEQUENCES.local,
    };
  }

  // ── THANK YOU / GRATITUDE ─────────────────────────────────────────────────

  if (
    msg.match(/^(thank|thanks|thx|ty|appreciate)/) ||
    msg.includes('you helped') ||
    msg.includes('that helps')
  ) {
    return {
      content: `You're welcome. I'm here whenever you need me — no appointments, no wait times, no judgment.\n\nIf anything changes or you have more questions later, just come back. I'll remember what we talked about.\n\nIn the meantime, is there anything else I can help with?`,
      actions: [
        {
          id: 'assess',
          label: 'Take the Burnout Check',
          icon: 'pulse',
          actionType: 'start-assessment',
        },
        { id: 'schedule', label: 'Schedule a Call', icon: 'phone', actionType: 'contact' },
      ],
      followups: [
        { label: 'Share co-op.care', message: 'How do I tell others about co-op.care?' },
        { label: 'Sign up now', message: 'I want to get started' },
      ],
      thinkingSteps: THINKING_SEQUENCES.general,
    };
  }

  // ── KNOW SOMEONE / REFERRAL ───────────────────────────────────────────────

  if (
    msg.includes('know someone') ||
    msg.includes('my friend') ||
    msg.includes('my sister') ||
    msg.includes('my brother') ||
    msg.includes('someone i know') ||
    msg.includes('recommend') ||
    msg.includes('refer') ||
    msg.includes('tell others') ||
    msg.includes('share')
  ) {
    return {
      content: `That's one of the most powerful things you can do. Caregivers are often too overwhelmed to search for help themselves — having someone point them here can change everything.\n\nYou can share co-op.care in a few ways:\n\n**Send them to Sage** — They can talk to me right here, no sign-up needed. The burnout check takes 30 seconds and gives them a clear starting point.\n\n**Share the link** — co-op.care — they'll land right on this page.\n\n**Tell them it's free** — That matters. Most people assume care support costs money. The assessment, Sage conversations, and neighbor sign-up are all free.\n\nIf they join through your referral, you'll both receive Time Bank bonus hours as a thank-you.`,
      actions: [
        {
          id: 'share',
          label: 'Share co-op.care',
          icon: 'send',
          actionType: 'navigate',
          payload: '#/share',
        },
        {
          id: 'neighbor',
          label: 'Become a Neighbor Yourself',
          icon: 'handshake',
          actionType: 'navigate',
          payload: '#/onboarding',
        },
      ],
      followups: [
        {
          label: 'I want to help them directly',
          message: 'I want to help care for someone I know',
        },
        { label: "What's the referral bonus?", message: 'How does the referral bonus work?' },
      ],
      thinkingSteps: THINKING_SEQUENCES.general,
    };
  }

  // ── QUALITY / HOW GOOD IS THE CARE ────────────────────────────────────────

  if (
    msg.includes('quality') ||
    msg.includes('how good') ||
    msg.includes('reliable') ||
    msg.includes('trained') ||
    msg.includes('qualified') ||
    msg.includes('certification') ||
    msg.includes('experience')
  ) {
    return {
      content: `Care quality comes down to one thing: continuity. The same person, showing up consistently, knowing your loved one's routines, preferences, and personality. That's what agencies fail at — 77% turnover means a new stranger almost every month.\n\nHow we ensure quality:\n\n**Retention** — Care Navigators earn $25-28/hr with equity. They stay because it's worth staying.\n\n**Training** — Every Navigator goes through our care training program, with ongoing skill development.\n\n**Omaha System** — Every care interaction is clinically coded using the Omaha System (42 evidence-based problem categories). This isn't just visits — it's measured, tracked care.\n\n**Your feedback** — Families rate every visit. If something isn't working, we adjust immediately.\n\n**Medical oversight** — Our Medical Director, Dr. Emdur, reviews care plans and assessment results.`,
      actions: [
        { id: 'assess', label: 'Assess My Needs', icon: 'pulse', actionType: 'start-assessment' },
        { id: 'schedule', label: 'Talk to Us', icon: 'phone', actionType: 'contact' },
      ],
      followups: [
        { label: 'Who is Dr. Emdur?', message: 'Tell me about your Medical Director' },
        {
          label: 'What is the Omaha System?',
          message: 'What is the Omaha System and how does it work?',
        },
        { label: 'Compare to agencies', message: 'How does this compare to traditional agencies?' },
      ],
      thinkingSteps: THINKING_SEQUENCES.search,
    };
  }

  // ── BROAD "help" / "need" — catch-all for care-seeking (kept LATE to avoid false matches) ──

  if (
    msg.includes('help') ||
    msg.includes('need') ||
    msg.includes('support') ||
    msg.includes('looking for') ||
    msg.includes('what can you do')
  ) {
    return {
      content: `I'm here for you. Let me understand what would help most.\n\nI can:\n- Run a quick burnout check (30 seconds, free)\n- Help you build a care plan for your situation\n- Show you how to save on care costs\n- Connect you with a neighbor or Care Navigator\n- Set up a call with a real person\n\nWhat feels most useful right now?`,
      actions: [
        {
          id: 'assess',
          label: 'Quick Burnout Check',
          icon: 'pulse',
          actionType: 'start-assessment',
        },
        {
          id: 'intake',
          label: 'Tell Me Your Situation',
          icon: 'clipboard',
          actionType: 'start-intake',
        },
      ],
      followups: [
        { label: 'What is co-op.care?', message: 'What is co-op.care?' },
        { label: 'I need help now', message: 'I need care help for my parent right now' },
        { label: 'What does it cost?', message: 'How much does care cost?' },
      ],
      thinkingSteps: THINKING_SEQUENCES.general,
    };
  }

  // ── DEFAULT FALLBACK ──────────────────────────────────────────────────────

  return {
    content: `That's a great question — let me help you with that.\n\nHere's what I can do right now:\n\n**Run a burnout assessment** — 30 seconds, free, private\n**Answer care questions** — medications, sundowning, falls, costs\n**Calculate savings** — HSA/FSA, Comfort Card, Time Bank\n**Connect you** with a real person in Boulder\n\nWhat would be most helpful?`,
    actions: [
      { id: 'assess', label: 'Quick Burnout Check', icon: 'pulse', actionType: 'start-assessment' },
      {
        id: 'intake',
        label: 'Tell Me Your Situation',
        icon: 'clipboard',
        actionType: 'start-intake',
      },
    ],
    followups: [
      { label: 'What is co-op.care?', message: 'What is co-op.care?' },
      { label: 'I need help now', message: 'I need care help for my parent right now' },
      { label: 'What does it cost?', message: 'How much does care cost?' },
    ],
    thinkingSteps: THINKING_SEQUENCES.general,
  };
}

// ─── Assessment Zone Calculation ────────────────────────────────────────────

function calculateZone(score: number): {
  zone: 'green' | 'yellow' | 'red';
  label: string;
  color: string;
  description: string;
} {
  if (score <= 11) {
    return {
      zone: 'green',
      label: 'Managing Well',
      color: '#22c55e',
      description:
        "You're doing well. Regular self-care and community support can help you stay here.",
    };
  }
  if (score <= 20) {
    return {
      zone: 'yellow',
      label: 'Caution Zone',
      color: '#eab308',
      description: "You're carrying a significant load. Targeted support now can prevent burnout.",
    };
  }
  return {
    zone: 'red',
    label: 'High Burnout Risk',
    color: '#ef4444',
    description:
      'You need support now. This level of strain is not sustainable — and you deserve help.',
  };
}

function generateAssessmentResult(
  physical: number,
  sleep: number,
  isolation: number,
): SageResponse {
  const score = physical + sleep + isolation;
  const { zone, label, description } = calculateZone(score);

  const barWidth = Math.round((score / 30) * 100);

  let recommendations: string;
  if (zone === 'green') {
    recommendations = `**My recommendations:**\n- Join the Time Bank to build your care safety net\n- Take the full CII assessment for deeper insights\n- Stay connected with our community`;
  } else if (zone === 'yellow') {
    recommendations = `**My recommendations:**\n- Consider 5-10 hours/week of professional support\n- The Comfort Card could save you $1,200-1,800/year\n- Let me connect you with a Care Navigator for a free consult`;
  } else {
    recommendations = `**I want you to hear this: you are not failing.** You are doing one of the hardest jobs in the world with too little support.\n\n**My urgent recommendations:**\n- Professional care support — even a few hours/week makes a difference\n- Schedule a call with our Care Navigator this week\n- The Comfort Card can make this affordable ($22-25/hr after HSA savings)`;
  }

  return {
    content: `**Your Caregiver Check-in Results**\n\nScore: **${score}/30** — **${label}**\n\n■■■■■■■■■■ ${barWidth}%\n\nPhysical: ${physical}/10\nSleep: ${sleep}/10\nConnection: ${isolation}/10\n\n${description}\n\n${recommendations}`,
    actions:
      zone === 'green'
        ? [
            {
              id: 'tb',
              label: 'Join Time Bank',
              icon: 'clock',
              actionType: 'navigate',
              payload: '#/onboarding',
            },
            {
              id: 'full-cii',
              label: 'Take Full Assessment',
              icon: 'chart',
              actionType: 'navigate',
              payload: '#/assessments/cii',
            },
          ]
        : zone === 'yellow'
          ? [
              {
                id: 'signup',
                label: 'Get Matched with Care',
                icon: 'sparkle',
                actionType: 'navigate',
                payload: '#/onboarding/family',
              },
              {
                id: 'comfort',
                label: 'Calculate My Savings',
                icon: 'money',
                actionType: 'navigate',
                payload: '#/comfort-card/value',
              },
              {
                id: 'schedule',
                label: 'Talk to a Navigator',
                icon: 'phone',
                actionType: 'contact',
              },
            ]
          : [
              {
                id: 'schedule',
                label: 'Schedule a Call Now',
                icon: 'phone',
                actionType: 'contact',
              },
              {
                id: 'signup',
                label: 'Get Care This Week',
                icon: 'sparkle',
                actionType: 'navigate',
                payload: '#/onboarding/family',
              },
              {
                id: 'comfort',
                label: 'Make It Affordable',
                icon: 'money',
                actionType: 'navigate',
                payload: '#/comfort-card',
              },
            ],
    followups: [
      {
        label: 'What does this score mean?',
        message: `What does a score of ${score} on the caregiver check-in mean?`,
      },
      { label: 'Share with my family', message: 'How do I share these results with my family?' },
      {
        label: 'Take the full assessment',
        message: 'I want to take the full Caregiver Impact Index',
      },
    ],
    thinkingSteps: THINKING_SEQUENCES.assessment,
  };
}

// ─── Voice input hook ───────────────────────────────────────────────────────

interface SpeechRecognitionCompat {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionCompat | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SR);
    if (SR) {
      const recognition: SpeechRecognitionCompat = new SR();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = useCallback((onResult: (text: string) => void) => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      onResult(text);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, isSupported, startListening, stopListening };
}

// ─── Inline Mini CII Assessment ─────────────────────────────────────────────

function InlineMiniCII({ onSubmit }: { onSubmit: (p: number, s: number, i: number) => void }) {
  const [physical, setPhysical] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [isolation, setIsolation] = useState(3);

  const sliders = [
    {
      label: 'Physical Strain',
      sublabel: 'Body aches, exhaustion, health neglect',
      icon: 'pulse',
      value: physical,
      set: setPhysical,
      low: 'Minimal',
      high: 'Severe',
    },
    {
      label: 'Sleep Disruption',
      sublabel: 'Night waking, worry, irregular sleep',
      icon: 'clock',
      value: sleep,
      set: setSleep,
      low: 'Sleeping well',
      high: 'Barely sleeping',
    },
    {
      label: 'Social Isolation',
      sublabel: 'Loneliness, cancelled plans, no breaks',
      icon: 'people',
      value: isolation,
      set: setIsolation,
      low: 'Connected',
      high: 'Very isolated',
    },
  ];

  const total = physical + sleep + isolation;
  const { color } = calculateZone(total);

  return (
    <div className="mt-3 space-y-5">
      <p className="text-xs font-medium text-text-muted">
        Adjust each slider to match how you've been feeling this past week:
      </p>

      {sliders.map((s) => (
        <div key={s.label}>
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TileIcon name={s.icon} size={16} />
              <span className="text-xs font-semibold text-text-primary">{s.label}</span>
            </div>
            <span
              className="min-w-[28px] rounded-md px-1.5 py-0.5 text-center text-xs font-bold text-white"
              style={{ backgroundColor: calculateZone(s.value * 3).color }}
            >
              {s.value}
            </span>
          </div>
          <p className="mb-2 text-[10px] text-text-muted">{s.sublabel}</p>
          <input
            type="range"
            min={1}
            max={10}
            value={s.value}
            onChange={(e) => s.set(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-sage"
          />
          <div className="mt-0.5 flex justify-between text-[10px] text-text-muted">
            <span>{s.low}</span>
            <span>{s.high}</span>
          </div>
        </div>
      ))}

      {/* Live score preview */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2">
        <span className="text-xs text-text-secondary">Current Score:</span>
        <span className="text-sm font-bold" style={{ color }}>
          {total}/30
        </span>
      </div>

      <button
        type="button"
        onClick={() => onSubmit(physical, sleep, isolation)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-sage py-3 text-sm font-semibold text-white transition-all hover:bg-sage-dark active:scale-[0.98]"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        See My Results
      </button>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function SageHero() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'sage',
      content:
        "Hi, I'm **Sage** — your care companion.\n\nWhether you need support for a loved one or want to give back to your community, I can help — and most of what I do is **completely free**:\n\n- Free burnout assessment (30 seconds, right here)\n- Free care planning guidance\n- Sign up to help a neighbor (free)\n- Calculate your HSA/FSA savings\n\nWhat brings you here today?",
      timestamp: new Date(),
      actions: [
        {
          id: 'assess',
          label: 'Free Burnout Check',
          icon: 'pulse',
          actionType: 'start-assessment',
        },
        { id: 'neighbor', label: 'I Want to Help', icon: 'handshake', actionType: 'start-intake' },
        { id: 'intake', label: 'I Need Care', icon: 'heart', actionType: 'start-intake' },
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [activeThinkingSteps, setActiveThinkingSteps] = useState<string[]>([]);
  const [showAssessment, setShowAssessment] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const thinkingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thinkingStepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { isListening, isSupported, startListening, stopListening } = useVoiceInput();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, showAssessment, scrollToBottom]);

  // Thinking step animation
  useEffect(() => {
    if (!isTyping || activeThinkingSteps.length === 0) {
      if (thinkingStepIntervalRef.current) clearInterval(thinkingStepIntervalRef.current);
      return;
    }
    setThinkingStep(0);
    thinkingStepIntervalRef.current = setInterval(() => {
      setThinkingStep((prev) => {
        const next = prev + 1;
        return next < activeThinkingSteps.length ? next : prev;
      });
    }, 1000);
    return () => {
      if (thinkingStepIntervalRef.current) clearInterval(thinkingStepIntervalRef.current);
    };
  }, [isTyping, activeThinkingSteps]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
      if (thinkingStepIntervalRef.current) clearInterval(thinkingStepIntervalRef.current);
    };
  }, []);

  const addSageResponse = useCallback((response: SageResponse, delayMs?: number) => {
    const steps = response.thinkingSteps ?? THINKING_SEQUENCES.general ?? [];
    setActiveThinkingSteps(steps);
    setIsTyping(true);

    const totalSteps = steps.length;
    const delay = delayMs ?? Math.max(1200, totalSteps * 1000);

    thinkingTimerRef.current = setTimeout(() => {
      const sageMsg: Message = {
        id: `sage-${Date.now()}`,
        role: 'sage',
        content: response.content,
        timestamp: new Date(),
        actions: response.actions,
        followups: response.followups,
      };
      setMessages((prev) => [...prev, sageMsg]);
      setIsTyping(false);
      setActiveThinkingSteps([]);
    }, delay);
  }, []);

  const sendMessage = useCallback(
    (text: string, topic?: SuggestedTopic) => {
      if (!text.trim() && !topic) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text.trim() || SUGGESTED_TOPICS.find((t) => t.id === topic)?.label || '',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setShowAssessment(false);

      const response = generatePublicResponse(userMsg.content, topic);
      addSageResponse(response);
    },
    [addSageResponse],
  );

  const handleAction = useCallback(
    (action: ActionButton) => {
      if (action.actionType === 'start-assessment') {
        // Add user message
        setMessages((prev) => [
          ...prev,
          {
            id: `user-${Date.now()}`,
            role: 'user',
            content: 'Start the burnout check-in',
            timestamp: new Date(),
          },
        ]);

        // Show thinking, then assessment
        setActiveThinkingSteps(['Preparing your assessment...', 'Loading burnout check-in...']);
        setIsTyping(true);

        thinkingTimerRef.current = setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `sage-assess-${Date.now()}`,
              role: 'sage',
              content:
                "**Caregiver Burnout Check-in**\n\nThis takes 30 seconds. Adjust each slider to match how you've been feeling this past week. Your results are private.",
              timestamp: new Date(),
              type: 'assessment',
            },
          ]);
          setIsTyping(false);
          setShowAssessment(true);
        }, 1500);
      } else if (action.actionType === 'start-intake') {
        sendMessage('I want to build a care plan for my situation');
      } else if (action.actionType === 'show-plans') {
        sendMessage('Show me the available care plans');
      } else if (action.actionType === 'contact') {
        sendMessage('I want to talk to a real person');
      } else if (action.actionType === 'navigate' && action.payload) {
        window.location.hash = action.payload.replace('#', '');
      }
    },
    [sendMessage],
  );

  const handleAssessmentSubmit = useCallback(
    (physical: number, sleep: number, isolation: number) => {
      setShowAssessment(false);

      // Add user's result as a message
      setMessages((prev) => [
        ...prev,
        {
          id: `user-result-${Date.now()}`,
          role: 'user',
          content: `My results: Physical ${physical}/10, Sleep ${sleep}/10, Isolation ${isolation}/10`,
          timestamp: new Date(),
        },
      ]);

      // Generate and show assessment result
      const response = generateAssessmentResult(physical, sleep, isolation);
      addSageResponse(response, 2500);
    },
    [addSageResponse],
  );

  const handleVoice = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => sendMessage(text));
    }
  }, [isListening, startListening, stopListening, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ── Render helpers ──

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (!line) return <br key={i} />;

      // Table row detection (simple markdown table)
      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line
          .split('|')
          .filter(Boolean)
          .map((c) => c.trim());
        if (cells.every((c) => c.match(/^-+$/))) return null; // separator row
        const isHeader = i > 0 && content.split('\n')[i + 1]?.match(/^\|[\s-|]+\|$/);
        return (
          <div key={i} className="flex gap-2 text-xs">
            {cells.map((cell, j) => (
              <span key={j} className={`flex-1 ${isHeader || j === 0 ? 'font-semibold' : ''}`}>
                {renderInline(cell)}
              </span>
            ))}
          </div>
        );
      }

      // Score bar visualization
      if (line.startsWith('■')) {
        const pctMatch = line.match(/(\d+)%/);
        const pct = pctMatch ? Number(pctMatch[1]) : 0;
        const total = pct * 0.3; // 30-point scale
        const { color } = calculateZone(total);
        return (
          <div key={i} className="my-2 flex items-center gap-2">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-xs font-semibold" style={{ color }}>
              {pct}%
            </span>
          </div>
        );
      }

      const parts = line.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
      return (
        <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
          {parts.map((part, j) => renderInline(part, j))}
        </p>
      );
    });
  };

  const renderInline = (part: string, key?: number) => {
    const boldMatch = part.match(/^\*\*(.+)\*\*$/);
    if (boldMatch) {
      return (
        <strong key={key} className="font-semibold">
          {boldMatch[1]}
        </strong>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={key}
          href={linkMatch[2]}
          className="font-medium text-sage underline decoration-sage/30 underline-offset-2 transition-colors hover:text-sage-dark hover:decoration-sage/60"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return <span key={key}>{part}</span>;
  };

  const showSuggestions = messages.length <= 2 && !isTyping && !showAssessment;

  return (
    <section className="relative bg-warm-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-14 lg:py-16">
        <div className="flex flex-col items-stretch gap-8 lg:flex-row lg:gap-12">
          {/* Left: Context + branding */}
          <div className="flex flex-col justify-center lg:w-[340px] lg:shrink-0">
            <div className="mb-4 inline-flex items-center gap-2 self-start rounded-full bg-sage/10 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-sage" />
              <span className="text-xs font-semibold tracking-wide text-sage">
                Boulder's First Care Cooperative
              </span>
            </div>

            <h1 className="font-heading text-3xl font-bold leading-tight text-navy md:text-4xl lg:text-5xl">
              Care That Feels
              <span className="block text-sage">Like Family.</span>
            </h1>
            <p className="mt-2 font-heading text-lg font-medium text-text-secondary md:text-xl">
              Because it is.
            </p>

            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              Need care? Get a free burnout assessment and care plan. Want to give back? Become a
              neighbor and earn care credits. Most of what we do is completely free.
            </p>

            {/* Value badges — what's free */}
            <div className="mt-6 hidden space-y-2.5 lg:block">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-sage">
                Always free
              </p>
              <div className="flex items-center gap-2.5 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sage/10">
                  <TileIcon name="pulse" size={14} />
                </span>
                <span className="text-text-secondary">Burnout assessment &amp; care plan</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sage/10">
                  <TileIcon name="handshake" size={14} />
                </span>
                <span className="text-text-secondary">Become a neighbor, earn care hours</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sage/10">
                  <TileIcon name="chat" size={14} />
                </span>
                <span className="text-text-secondary">Sage AI support &amp; guidance</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sage/10">
                  <TileIcon name="phone" size={14} />
                </span>
                <span className="text-text-secondary">Voice-enabled conversations</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap items-center gap-4 lg:mt-8">
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <svg
                  className="h-3.5 w-3.5 text-sage"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Worker-Owned
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <svg
                  className="h-3.5 w-3.5 text-sage"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                HIPAA Compliant
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <svg
                  className="h-3.5 w-3.5 text-sage"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                HSA/FSA Eligible
              </div>
            </div>
          </div>

          {/* Right: Sage Chat Interface */}
          <div className="flex min-h-[520px] flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-xl lg:min-h-[580px]">
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-border bg-sage/5 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage text-white">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">Sage</p>
                <p className="text-xs text-text-muted">
                  AI Care Companion — can assess, plan, and connect
                </p>
              </div>
              {isListening && (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  <span className="text-xs font-medium text-red-600">Listening...</span>
                </div>
              )}
              <div className="flex items-center gap-1 rounded-full bg-sage/10 px-2 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-medium text-sage">Online</span>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id}>
                    <div
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-sage text-white'
                            : 'bg-warm-gray text-text-primary'
                        }`}
                      >
                        {renderContent(msg.content)}

                        {/* Inline assessment */}
                        {msg.type === 'assessment' && showAssessment && (
                          <InlineMiniCII onSubmit={handleAssessmentSubmit} />
                        )}

                        {/* Action buttons */}
                        {msg.actions && msg.actions.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {msg.actions.map((action) => (
                              <button
                                key={action.id}
                                type="button"
                                onClick={() => handleAction(action)}
                                className="flex items-center gap-1.5 rounded-lg border border-sage/30 bg-white px-3 py-2 text-xs font-semibold text-sage shadow-sm transition-all hover:border-sage hover:bg-sage/5 hover:shadow-md active:scale-[0.97]"
                              >
                                <TileIcon name={action.icon} size={14} />
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Follow-up chips — shown below the message bubble */}
                    {msg.role === 'sage' &&
                      msg.followups &&
                      msg.followups.length > 0 &&
                      !isTyping && (
                        <div className="mt-2 ml-1 flex flex-wrap gap-1.5">
                          {msg.followups.map((f) => (
                            <button
                              key={f.label}
                              type="button"
                              onClick={() => sendMessage(f.message)}
                              className="rounded-full border border-border bg-white px-2.5 py-1 text-[11px] text-text-secondary transition-all hover:border-sage/40 hover:bg-sage/5 hover:text-sage"
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                ))}

                {/* Thinking animation with steps */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl bg-warm-gray px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <svg
                          className="h-4 w-4 animate-spin text-sage"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span className="text-sm text-text-secondary">
                          {activeThinkingSteps[thinkingStep] || 'Thinking...'}
                        </span>
                      </div>
                      {/* Step progress dots */}
                      {activeThinkingSteps.length > 1 && (
                        <div className="mt-2 flex gap-1">
                          {activeThinkingSteps.map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-1 rounded-full transition-all duration-500 ${
                                idx <= thinkingStep ? 'w-6 bg-sage' : 'w-3 bg-border'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested topics — show when conversation is fresh */}
              {showSuggestions && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {SUGGESTED_TOPICS.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => sendMessage('', topic.id)}
                      className="flex items-center gap-1.5 rounded-full border border-sage/20 bg-sage/5 px-3 py-1.5 text-xs font-medium text-sage transition-all hover:border-sage/40 hover:bg-sage/10"
                    >
                      <TileIcon name={topic.icon} size={14} />
                      {topic.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="border-t border-border bg-white px-3 py-3">
              <div className="flex items-end gap-2">
                {/* Voice button */}
                {isSupported && (
                  <button
                    type="button"
                    onClick={handleVoice}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
                      isListening
                        ? 'animate-pulse bg-red-500 text-white'
                        : 'bg-sage/10 text-sage hover:bg-sage/20'
                    }`}
                    aria-label={isListening ? 'Stop listening' : 'Speak to Sage'}
                    title={isListening ? 'Tap to stop' : 'Tap to speak'}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      {isListening ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      )}
                    </svg>
                  </button>
                )}

                {/* Text input */}
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? 'Listening...' : 'Ask Sage anything...'}
                  rows={1}
                  className="min-h-[40px] flex-1 resize-none rounded-xl border border-border bg-warm-gray px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-sage/40 focus:outline-none focus:ring-1 focus:ring-sage/20"
                  disabled={isListening}
                />

                {/* Send button */}
                <button
                  type="button"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage text-white transition-all hover:bg-sage-dark disabled:opacity-40"
                  aria-label="Send message"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 19V5m0 0l-7 7m7-7l7 7"
                    />
                  </svg>
                </button>
              </div>

              <p className="mt-2 text-center text-[10px] text-text-muted/60">
                Sage is an AI companion, not a medical professional. For emergencies, call 911.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
