/**
 * Reimbursement / HSA Claims Types
 *
 * Closes the loop: family pays for care -> co-op.care generates the
 * documentation needed to get reimbursed from HSA/FSA.
 */

export type ClaimStatus = 'draft' | 'ready' | 'submitted' | 'approved' | 'denied' | 'resubmitted';

export type ServiceType =
  | 'companion_care'
  | 'personal_care'
  | 'medication_management'
  | 'meal_preparation'
  | 'transportation'
  | 'respite';

export type EOBDocumentType = 'eob' | 'receipt' | 'annual_summary' | 'lmn_copy';

export interface ClaimLineItem {
  date: string;
  serviceType: ServiceType;
  hours: number;
  rate: number; // $/hr
  amount: number;
  caregiverId: string;
  caregiverName: string;
  cptCode?: string;
  description: string;
}

export interface ReimbursementClaim {
  id: string;
  familyId: string;
  careRecipientId: string;
  careRecipientName: string;
  lmnId: string;
  claimPeriod: { start: string; end: string };
  status: ClaimStatus;

  // Line items
  lineItems: ClaimLineItem[];
  totalAmount: number;
  estimatedReimbursement: number;

  // Documentation
  lmnDocumentHash?: string;
  supportingDocuments: string[];

  // IRS compliance
  irsCategories: string[];
  taxYear: number;

  // HSA/FSA provider info
  hsaProvider?: string;
  hsaAccountId?: string;

  submittedAt?: string;
  resolvedAt?: string;
  denialReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReimbursementSummary {
  familyId: string;
  taxYear: number;
  totalSpent: number;
  totalReimbursed: number;
  totalPending: number;
  totalDenied: number;
  claimCount: number;
  averageProcessingDays: number;
  savingsPercentage: number;
}

export interface EOBDocument {
  id: string;
  claimId: string;
  type: EOBDocumentType;
  generatedAt: string;
  content: string;
}
