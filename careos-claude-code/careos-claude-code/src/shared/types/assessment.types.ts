import type { CIIZone } from '../constants/business-rules';

export interface CIIAssessment {
  id: string;
  familyId: string;
  conductorId: string;
  scores: number[]; // 12 dimensions, each 1-10
  totalScore: number; // sum, max 120
  zone: CIIZone;
  completedAt: string;
  fhirQuestionnaireResponseId?: string;
}

export interface MiniCIIAssessment {
  id: string;
  familyId?: string;
  conductorId?: string;
  scores: number[]; // 3 dimensions (physical, sleep, isolation), each 1-10
  totalScore: number; // sum, max 30
  zone: CIIZone;
  completedAt: string;
}

export type CRIAcuity = 'low' | 'moderate' | 'high' | 'critical';
export type CRIReviewStatus = 'pending' | 'reviewed' | 'approved' | 'revision_requested';

export interface CRIAssessment {
  id: string;
  careRecipientId: string;
  assessorId: string; // medical director
  factors: CRIFactor[];
  rawScore: number; // 14.4 - 72.0
  acuity: CRIAcuity;
  lmnEligible: boolean;
  reviewStatus: CRIReviewStatus;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  completedAt: string;
  fhirQuestionnaireResponseId?: string;
}

export interface CRIFactor {
  name: string;
  weight: number;
  score: number;
}

export interface KBSRating {
  id: string;
  careRecipientId: string;
  omahaProblemCode: number;
  knowledge: number; // 1-5
  behavior: number; // 1-5
  status: number; // 1-5
  assessmentDay: 0 | 30 | 60 | 90; // intake, 30, 60, 90
  ratedBy: string;
  ratedAt: string;
  fhirObservationId?: string;
}
