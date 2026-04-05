/**
 * Share Templates — Message templates, categories, and channel config
 * for all viral sharing touchpoints across CareOS.
 *
 * No PHI ever appears in share content — only aggregate stats,
 * streak counts, task types, and tier names.
 */
import { BRAND } from './business-rules';

export const SHARE_CHANNELS = [
  'sms',
  'email',
  'whatsapp',
  'facebook',
  'x_twitter',
  'linkedin',
  'copy_link',
] as const;

export type ShareChannel = (typeof SHARE_CHANNELS)[number];

export const SHARE_BASE_URL = BRAND.URL;

export const SHARE_CATEGORIES = [
  'referral',
  'gratitude_complete',
  'streak_milestone',
  'onboarding_invite',
  'community_impact',
  'assessment_result',
  'comfort_card',
  'general_invite',
  // ── Viral loop categories (neighbor-to-neighbor growth) ──
  'neighbor_invite',
  'neighbor_task_complete',
  'neighbor_gratitude_received',
  'waitlist_invite',
  'founding_neighbor',
] as const;

export type ShareCategory = (typeof SHARE_CATEGORIES)[number];

export const SHARE_HASHTAGS = [
  '#CareCooperative',
  '#NeighborsCare',
  '#TimeBankCommunity',
  '#BoulderCare',
] as const;

export interface ShareTemplate {
  category: ShareCategory;
  title: string;
  message: string;
  url: string;
}

export const SHARE_TEMPLATES: Record<ShareCategory, ShareTemplate> = {
  referral: {
    category: 'referral',
    title: 'Join our care community',
    message:
      'Join our cooperative care community! When you sign up, we both earn 5 bonus Time Bank hours.',
    url: `${SHARE_BASE_URL}/join`,
  },
  gratitude_complete: {
    category: 'gratitude_complete',
    title: 'A neighbor helped today',
    message:
      'A neighbor just helped my family through our care co-op. This is what community looks like.',
    url: `${SHARE_BASE_URL}/community`,
  },
  streak_milestone: {
    category: 'streak_milestone',
    title: 'Care streak milestone!',
    message: "I've helped a neighbor every week for {weeks} weeks straight through our care co-op!",
    url: `${SHARE_BASE_URL}/community`,
  },
  onboarding_invite: {
    category: 'onboarding_invite',
    title: 'I just joined CareOS',
    message:
      'I just joined a cooperative care community where neighbors help each other. You should too!',
    url: `${SHARE_BASE_URL}/join`,
  },
  community_impact: {
    category: 'community_impact',
    title: 'Our community cares',
    message:
      'Our neighborhood care co-op has given {hours} hours of care to {families} families. Want to join?',
    url: `${SHARE_BASE_URL}/community`,
  },
  assessment_result: {
    category: 'assessment_result',
    title: 'Check on your caregiving',
    message:
      'I just checked in on my caregiving load. It took 30 seconds. Every caregiver should try this.',
    url: `${SHARE_BASE_URL}/check`,
  },
  comfort_card: {
    category: 'comfort_card',
    title: 'Save on home care with your HSA',
    message:
      'Did you know home care can be HSA/FSA eligible? Our co-op makes it easy. Save 28-36%.',
    url: `${SHARE_BASE_URL}/comfort-card`,
  },
  general_invite: {
    category: 'general_invite',
    title: 'Neighbors helping neighbors',
    message:
      'Our care co-op connects families with neighbors who help. Meals, rides, companionship. Community-owned.',
    url: `${SHARE_BASE_URL}/join`,
  },
  // ── Viral loop templates (neighbor-to-neighbor growth) ──
  neighbor_invite: {
    category: 'neighbor_invite',
    title: 'Your neighbor needs you',
    message:
      'Families near you need a hand — a ride, a meal, an afternoon of companionship. See who you can help and earn care credits for your own family.',
    url: `${SHARE_BASE_URL}/neighbors`,
  },
  neighbor_task_complete: {
    category: 'neighbor_task_complete',
    title: 'Just helped a neighbor',
    message:
      'Just helped a neighbor through our care co-op. Earned {hours} hours of care credit for my own family. Your neighborhood probably needs you too.',
    url: `${SHARE_BASE_URL}/neighbors`,
  },
  neighbor_gratitude_received: {
    category: 'neighbor_gratitude_received',
    title: 'This made my day',
    message:
      'A family I helped just sent the most heartfelt thank you. This is what happens when neighbors actually show up for each other.',
    url: `${SHARE_BASE_URL}/neighbors`,
  },
  waitlist_invite: {
    category: 'waitlist_invite',
    title: 'Join the care waitlist',
    message:
      'I just reserved my spot as a founding neighbor at co-op.care. Join the waitlist — the first 50 get premium benefits free for 6 months.',
    url: `${SHARE_BASE_URL}/waitlist`,
  },
  founding_neighbor: {
    category: 'founding_neighbor',
    title: 'Founding Neighbor',
    message:
      "I made it to the top 50 — I'm a Founding Neighbor at co-op.care! This community is going to change how we care for each other.",
    url: `${SHARE_BASE_URL}/neighbors`,
  },
};

/** Channel display config for ShareModal */
export const CHANNEL_CONFIG: Record<ShareChannel, { label: string; color: string }> = {
  sms: { label: 'Text Message', color: 'bg-green-600' },
  email: { label: 'Email', color: 'bg-blue-600' },
  whatsapp: { label: 'WhatsApp', color: 'bg-emerald-500' },
  facebook: { label: 'Facebook', color: 'bg-blue-700' },
  x_twitter: { label: 'X / Twitter', color: 'bg-neutral-800' },
  linkedin: { label: 'LinkedIn', color: 'bg-sky-700' },
  copy_link: { label: 'Copy Link', color: 'bg-warm-gray' },
};
