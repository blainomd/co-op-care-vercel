// src/shared/constants/sage-onboarding-scripts.ts
/**
 * Sage onboarding conversation scripts — one per OnboardingPhase.
 * Sage uses these as templates, personalizing with firstName.
 */
import type { OnboardingPhase } from '../types/sage-message.types';

export interface SageScript {
  phase: OnboardingPhase;
  greeting: string;
  /** Suggested follow-up buttons */
  followups: { label: string; message: string }[];
  /** Which phase to transition to after this completes */
  nextPhase: OnboardingPhase | null;
}

export const SAGE_SCRIPTS: Record<OnboardingPhase, SageScript> = {
  fresh: {
    phase: 'fresh',
    greeting:
      "Hi! I'm Sage, your care companion. I help families coordinate care for the people they love. What brings you here today?",
    followups: [
      {
        label: 'I need help caring for someone',
        message: 'I need help caring for a family member',
      },
      { label: 'I want to help neighbors', message: 'I want to give care in my community' },
      {
        label: 'Wellness & self-care support',
        message: "I'm looking for yoga, wellness, or self-care support for myself or my family",
      },
      { label: 'Just exploring', message: "I'm just looking around to learn more" },
    ],
    nextPhase: 'exploring',
  },
  exploring: {
    phase: 'exploring',
    greeting:
      "I'd love to understand what you need. Are you looking for help caring for someone, or are you interested in giving care in your community?",
    followups: [
      {
        label: 'Finding care for a loved one',
        message: "I'm coordinating care for a family member",
      },
      { label: 'Giving care as a neighbor', message: 'I want to volunteer or work as a caregiver' },
      {
        label: 'Both — I give and receive',
        message: 'I both care for someone and want to help others',
      },
    ],
    nextPhase: 'profile_intent',
  },
  profile_intent: {
    phase: 'profile_intent',
    greeting:
      'Got it! A few quick questions so I can personalize your experience. What roles interest you?',
    followups: [
      {
        label: 'Conductor — coordinate care',
        message: 'I want to be a Conductor and coordinate care',
      },
      {
        label: 'Neighbor — give care nearby',
        message: 'I want to be a Neighbor and help people near me',
      },
      { label: 'Both roles', message: "I'm interested in both coordinating and giving care" },
    ],
    nextPhase: 'profile_roles',
  },
  profile_roles: {
    phase: 'profile_roles',
    greeting:
      'Great choice! co-op.care is a cooperative — members own it together. Would you like to learn how community ownership works here?',
    followups: [
      { label: 'Yes, tell me more', message: 'Tell me about cooperative ownership' },
      { label: 'Maybe later', message: "I'll learn about that later" },
    ],
    nextPhase: 'profile_community',
  },
  profile_community: {
    phase: 'profile_community',
    greeting:
      'One last thing — I can remember our conversations so I get smarter about helping you over time. Your data stays private and you can delete it anytime. Would you like me to remember you?',
    followups: [
      { label: 'Yes, remember me', message: 'Yes, you can remember our conversations' },
      { label: 'Just this session', message: 'Only remember things for this session' },
    ],
    nextPhase: 'memory_consent',
  },
  memory_consent: {
    phase: 'memory_consent',
    greeting:
      "You're all set! Your Comfort Card is your identity in the co-op. Share the QR code to invite neighbors and earn Time Bank hours. What would you like to do first?",
    followups: [
      { label: 'Show me my card', message: 'Show me my Comfort Card' },
      { label: 'Find help nearby', message: 'Are there neighbors near me who can help?' },
      { label: 'Wellness resources', message: 'What wellness and yoga resources are available?' },
      { label: 'How does Time Bank work?', message: 'Explain how the Time Bank works' },
    ],
    nextPhase: 'onboarded',
  },
  onboarded: {
    phase: 'onboarded',
    greeting: 'Welcome back, {firstName}! How can I help you today?',
    followups: [
      { label: 'Check my Time Bank', message: "What's my Time Bank balance?" },
      { label: 'Find help nearby', message: "Who's available to help near me?" },
      { label: 'Share my card', message: 'I want to invite someone to co-op.care' },
      { label: 'Wellness & yoga', message: 'What wellness and yoga options do I have?' },
    ],
    nextPhase: null,
  },
  returning: {
    phase: 'returning',
    greeting: 'Hey {firstName}, good to see you again! What can I help with?',
    followups: [
      { label: 'Check my Time Bank', message: "What's my Time Bank balance?" },
      { label: 'Find help nearby', message: "Who's available to help near me?" },
      { label: 'Wellness & self-care', message: 'What yoga or wellness support is available?' },
    ],
    nextPhase: null,
  },
};
