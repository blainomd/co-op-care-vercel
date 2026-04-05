/**
 * Referral Service — Hospital Discharge / Social Worker Referral Management
 *
 * Accepts referrals from hospital discharge planners, social workers, physicians,
 * or self-referrals. Auto-estimates CRI acuity from patient conditions/mobility,
 * and triggers LMN draft generation when appropriate.
 */
import { z } from 'zod';
import * as queries from '../../database/queries/index.js';
import { NotFoundError, ValidationError } from '../../common/errors.js';
import { notificationService } from '../notifications/service.js';
import { logger } from '../../common/logger.js';
import {
  generateLMNDraft,
  type CareRecipientProfile,
  type CaregiverProfile,
  type CIIResult,
  type CRIResult,
} from '../sage/lmn-generator.js';

// ── Zod Schemas ─────────────────────────────────────────

export const createReferralSchema = z.object({
  source: z.enum(['hospital', 'social_worker', 'physician', 'self']),
  sourceOrganization: z.string().max(200).optional(),
  sourceContactName: z.string().max(200).optional(),
  sourceContactEmail: z.string().email().optional(),

  patient: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    dateOfBirth: z.string().min(1),
    age: z.number().int().min(0).max(150).optional(),
    conditions: z.array(z.string()).min(1),
    medications: z.array(z.string()).optional(),
    mobilityLevel: z.enum(['independent', 'assisted', 'dependent', 'wheelchair']).optional(),
    state: z.string().min(2).max(2),
  }),

  caregiver: z
    .object({
      firstName: z.string().min(1).max(100),
      lastName: z.string().min(1).max(100),
      relationship: z.string().min(1).max(100),
      email: z.string().email(),
      phone: z.string().optional(),
    })
    .optional(),

  dischargeDate: z.string().optional(),
  urgency: z.enum(['routine', 'expedited', 'urgent']),
  notes: z.string().max(5000).optional(),
});

export type CreateReferralInput = z.infer<typeof createReferralSchema>;

export const updateReferralStatusSchema = z.object({
  status: z.enum(['accepted', 'declined', 'converted_to_family']),
  notes: z.string().max(5000).optional(),
});

export type UpdateReferralStatusInput = z.infer<typeof updateReferralStatusSchema>;

// ── CRI Estimation Heuristics ───────────────────────────

/** Condition keywords mapped to CRI score contribution */
const CONDITION_WEIGHTS: Array<{ keywords: string[]; score: number }> = [
  { keywords: ['dementia', 'alzheimer'], score: 8 },
  { keywords: ['parkinson'], score: 7 },
  { keywords: ['stroke', 'cva'], score: 7 },
  { keywords: ['fall risk', 'falls', 'fall'], score: 6 },
  { keywords: ['heart failure', 'chf'], score: 5 },
  { keywords: ['copd', 'chronic obstructive'], score: 5 },
  { keywords: ['diabetes', 'diabetic'], score: 3 },
  { keywords: ['hypertension', 'high blood pressure'], score: 2 },
  { keywords: ['depression', 'depressive'], score: 3 },
  { keywords: ['anxiety'], score: 2 },
  { keywords: ['chronic pain'], score: 3 },
  { keywords: ['incontinence'], score: 4 },
  { keywords: ['chronic kidney', 'ckd', 'renal'], score: 4 },
  { keywords: ['osteoporosis'], score: 3 },
  { keywords: ['osteoarthritis'], score: 2 },
  { keywords: ['cancer', 'malignancy'], score: 6 },
  { keywords: ['dysphagia', 'swallowing'], score: 5 },
  { keywords: ['malnutrition', 'weight loss', 'failure to thrive'], score: 5 },
];

const MOBILITY_SCORES: Record<string, number> = {
  independent: 0,
  assisted: 4,
  dependent: 8,
  wheelchair: 9,
};

function estimateCriScore(
  conditions: string[],
  mobilityLevel?: string,
  medications?: string[],
): number {
  let score = 0;
  const condText = conditions.map((c) => c.toLowerCase()).join(' ');

  for (const entry of CONDITION_WEIGHTS) {
    if (entry.keywords.some((kw) => condText.includes(kw))) {
      score += entry.score;
    }
  }

  // Mobility contribution
  if (mobilityLevel) {
    score += MOBILITY_SCORES[mobilityLevel] ?? 0;
  }

  // Polypharmacy bonus
  if (medications && medications.length >= 8) {
    score += 3;
  } else if (medications && medications.length >= 5) {
    score += 1;
  }

  // Cap at 50 (CRI max)
  return Math.min(score, 50);
}

function determineAcuity(criScore: number): 'low' | 'moderate' | 'high' | 'critical' {
  if (criScore >= 40) return 'critical';
  if (criScore >= 33) return 'high';
  if (criScore >= 19) return 'moderate';
  return 'low';
}

function recommendTier(criScore: number): string {
  if (criScore >= 40) return 'Intensive Companion';
  if (criScore >= 33) return 'Daily Companion';
  if (criScore >= 19) return 'Regular Companion';
  return 'Peace of Mind';
}

// ── Service ─────────────────────────────────────────────

async function create(input: CreateReferralInput) {
  const estimatedCri = estimateCriScore(
    input.patient.conditions,
    input.patient.mobilityLevel,
    input.patient.medications,
  );
  const acuity = determineAcuity(estimatedCri);
  const tier = recommendTier(estimatedCri);

  // Store referral
  const referral = await queries.createReferral({
    source: input.source,
    sourceOrganization: input.sourceOrganization,
    sourceContactName: input.sourceContactName,
    sourceContactEmail: input.sourceContactEmail,
    patientFirstName: input.patient.firstName,
    patientLastName: input.patient.lastName,
    patientDateOfBirth: input.patient.dateOfBirth,
    patientAge: input.patient.age,
    patientConditions: input.patient.conditions,
    patientMedications: input.patient.medications,
    patientMobilityLevel: input.patient.mobilityLevel,
    patientState: input.patient.state,
    caregiverFirstName: input.caregiver?.firstName,
    caregiverLastName: input.caregiver?.lastName,
    caregiverRelationship: input.caregiver?.relationship,
    caregiverEmail: input.caregiver?.email,
    caregiverPhone: input.caregiver?.phone,
    dischargeDate: input.dischargeDate,
    urgency: input.urgency,
    notes: input.notes,
    estimatedCriScore: estimatedCri,
    estimatedAcuity: acuity,
    recommendedTier: tier,
  });

  // Auto-generate LMN draft if estimated CRI >= 19 (moderate acuity)
  let lmnDraft = null;
  if (estimatedCri >= 19 && input.caregiver) {
    try {
      const careRecipient: CareRecipientProfile = {
        id: referral.id,
        name: `${input.patient.firstName} ${input.patient.lastName}`,
        dateOfBirth: input.patient.dateOfBirth,
        age: input.patient.age ?? 75,
        conditions: input.patient.conditions,
        medications: input.patient.medications ?? [],
        mobilityLevel: input.patient.mobilityLevel ?? 'assisted',
        riskFlags: [],
        state: input.patient.state,
      };
      const caregiver: CaregiverProfile = {
        id: 'referral-caregiver',
        name: `${input.caregiver.firstName} ${input.caregiver.lastName}`,
        relationship: input.caregiver.relationship,
        email: input.caregiver.email,
      };
      const ciiResult: CIIResult = {
        physical: 0,
        sleep: 0,
        isolation: 0,
        total: 0,
        zone: 'green',
        completedAt: new Date().toISOString(),
      };
      const criResult: CRIResult = {
        mobility: MOBILITY_SCORES[input.patient.mobilityLevel ?? 'independent'] ?? 0,
        memory: 0,
        dailyTasks: 0,
        medications: 0,
        social: 0,
        total: estimatedCri,
        zone: estimatedCri >= 33 ? 'red' : estimatedCri >= 19 ? 'yellow' : 'green',
        omahaFlags: [],
        completedAt: new Date().toISOString(),
      };

      lmnDraft = generateLMNDraft(careRecipient, caregiver, ciiResult, criResult, []);
      logger.info(
        { referralId: referral.id, acuity: lmnDraft.acuity },
        'LMN draft auto-generated from referral',
      );
    } catch (err) {
      logger.warn(
        { err, referralId: referral.id },
        'Failed to auto-generate LMN draft from referral',
      );
    }
  }

  // Notify admin and medical_director roles
  try {
    const admins = await queries.listUsersByRole('admin');
    const medDirs = await queries.listUsersByRole('medical_director');
    const notifyUsers = [...admins, ...medDirs];

    for (const user of notifyUsers) {
      await notificationService
        .send({
          userId: user.id,
          type: 'cri_pending_review',
          variables: {
            careRecipientName: `${input.patient.firstName} ${input.patient.lastName}`,
            rawScore: String(estimatedCri),
            acuity,
            lmnEligible: estimatedCri >= 19 ? 'Yes' : 'No',
          },
        })
        .catch((err) => {
          logger.warn({ err, userId: user.id }, 'Failed to notify user of new referral');
        });
    }
  } catch (err) {
    logger.warn({ err }, 'Failed to send referral notifications');
  }

  logger.info(
    { referralId: referral.id, source: input.source, estimatedCri, acuity, urgency: input.urgency },
    'Referral created',
  );

  return {
    referral,
    estimatedCriScore: estimatedCri,
    estimatedAcuity: acuity,
    recommendedTier: tier,
    lmnDraftGenerated: lmnDraft !== null,
  };
}

async function getById(id: string) {
  const referral = await queries.getReferralById(id);
  if (!referral) throw new NotFoundError('Referral');
  return referral;
}

async function list() {
  return queries.listAllReferrals();
}

async function updateStatus(id: string, input: UpdateReferralStatusInput) {
  const existing = await queries.getReferralById(id);
  if (!existing) throw new NotFoundError('Referral');

  if (existing.status !== 'pending') {
    throw new ValidationError(`Cannot update referral — current status is ${existing.status}`);
  }

  const updated = await queries.updateReferral(id, {
    status: input.status,
    notes: input.notes ?? existing.notes,
  });

  logger.info({ referralId: id, newStatus: input.status }, 'Referral status updated');
  return updated;
}

export const referralService = {
  create,
  getById,
  list,
  updateStatus,
};
