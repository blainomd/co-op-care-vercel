/**
 * Advance Care Planning types
 *
 * Types for advance directives, goals of care, care preferences,
 * family conversations, and preparedness checklists.
 */

export type DirectiveType =
  | 'living_will'
  | 'healthcare_proxy'
  | 'polst'
  | 'dnr'
  | 'organ_donation'
  | 'other';
export type DirectiveStatus = 'draft' | 'active' | 'superseded' | 'revoked';

export interface AdvanceDirective {
  id: string;
  familyId: string;
  type: DirectiveType;
  status: DirectiveStatus;
  documentUrl?: string;
  witnessedDate?: string;
  proxyName?: string;
  proxyPhone?: string;
  proxyRelationship?: string;
  alternateProxyName?: string;
  alternateProxyPhone?: string;
  notes?: string;
  fhirConsentId?: string;
  createdAt: string;
  updatedAt: string;
}

export type GoalCategory =
  | 'comfort'
  | 'function'
  | 'longevity'
  | 'autonomy'
  | 'spiritual'
  | 'legacy';
export type GoalPriority = 'high' | 'medium' | 'low';

export interface GoalOfCare {
  id: string;
  familyId: string;
  category: GoalCategory;
  description: string;
  priority: GoalPriority;
  discussedWith: string[];
  startDate: string;
  reviewDate?: string;
  fhirGoalId?: string;
  createdAt: string;
  updatedAt: string;
}

export type PreferenceCategory =
  | 'comfort'
  | 'spiritual'
  | 'legacy'
  | 'daily_routine'
  | 'social'
  | 'dietary';
export type ImportanceLevel = 'essential' | 'preferred' | 'nice_to_have';

export interface CarePreference {
  id: string;
  familyId: string;
  category: PreferenceCategory;
  preference: string;
  importance: ImportanceLevel;
  notes?: string;
  createdAt: string;
}

export type EmotionalTone = 'positive' | 'neutral' | 'difficult' | 'breakthrough';

export interface FamilyConversation {
  id: string;
  familyId: string;
  date: string;
  participants: string[];
  topics: string[];
  keyDecisions: string;
  nextSteps: string;
  emotionalTone?: EmotionalTone;
  fhirCommunicationId?: string;
  createdAt: string;
}

export type ChecklistCategory =
  | 'home_safety'
  | 'emergency'
  | 'medication'
  | 'caregiver_wellness'
  | 'financial_legal'
  | 'family_communication';

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface PreparednessChecklist {
  id: string;
  familyId: string;
  category: ChecklistCategory;
  items: ChecklistItem[];
  updatedAt: string;
}
