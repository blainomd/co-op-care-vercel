/**
 * Sage Message Types — Voice-first conversational AI
 *
 * Sage is the second surface. Everything that isn't on the Card
 * happens through voice/text conversation with Sage.
 * 12 domains absorb all 95+ feature modules.
 */

export type OnboardingPhase =
  | 'fresh'
  | 'exploring'
  | 'profile_intent'
  | 'profile_roles'
  | 'profile_community'
  | 'memory_consent'
  | 'onboarded'
  | 'returning';

export type SageDomainName =
  | 'care'
  | 'schedule'
  | 'assess'
  | 'timebank'
  | 'billing'
  | 'onboard'
  | 'message'
  | 'emergency'
  | 'social'
  | 'govern'
  | 'clinical'
  | 'admin';

export interface SageMessageRequest {
  transcript: string;
  sessionId: string;
  role: string;
}

export interface SageInlineCard {
  type: 'schedule' | 'assessment' | 'balance' | 'task' | 'team' | 'lmn' | 'vote' | 'confirmation';
  data: Record<string, unknown>;
}

export interface SageAction {
  id: string;
  label: string;
  icon: string;
  actionType: string;
  payload?: string;
}

export interface SageFollowup {
  label: string;
  message: string;
}

export interface SageMessageResponse {
  text: string;
  ssml?: string;
  cards?: SageInlineCard[];
  actions?: SageAction[];
  followups?: SageFollowup[];
  domain: SageDomainName;
  confidence: number;
}
