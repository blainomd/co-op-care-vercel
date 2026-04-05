import type { MembershipStatus, GeoPoint } from './user.types';

export interface Family {
  id: string;
  name: string;
  conductorId: string;
  careRecipientIds: string[];
  careTeamIds: string[];
  membershipStatus: MembershipStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareRecipient {
  id: string;
  familyId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  location?: GeoPoint;
  primaryDiagnoses: string[]; // ICD-10 codes
  activeOmahaProblems: number[]; // Omaha problem codes
  fhirPatientId?: string; // Aidbox Patient resource ID
  createdAt: string;
  updatedAt: string;
}
