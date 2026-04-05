/**
 * LMN Service — Letter of Medical Necessity lifecycle management
 *
 * Generates LMNs from CRI assessment data, routes for MD e-signature,
 * tracks expiry, and syncs to FHIR as DocumentReference.
 */
import * as queries from '../../database/queries/index.js';
import { NotFoundError, ValidationError } from '../../common/errors.js';
import { notificationService } from '../notifications/service.js';
import { logger } from '../../common/logger.js';
import { calculateLMNExpiry } from '../../jobs/lmn-renewal.js';
import { generateLMNDocument, lmnToPlainText } from './templates.js';
import { requestSignature, recordManualSignature } from './signing.js';
import type { LMN, LMNListItem } from '@shared/types/lmn.types';
import type {
  GenerateLMNInput,
  SignLMNInput,
  RenewLMNInput,
  PublicLMNRequestInput,
} from './schemas.js';

/**
 * Generate a new LMN from a CRI assessment
 */
async function generate(userId: string, input: GenerateLMNInput): Promise<LMN> {
  // Verify CRI assessment exists and is approved + LMN-eligible
  const cri = await queries.getAssessmentById(input.criAssessmentId);
  if (!cri) throw new NotFoundError('CRI Assessment');
  if (cri.reviewStatus !== 'approved') {
    throw new ValidationError('CRI must be approved before generating LMN');
  }
  if (!cri.lmnEligible) {
    throw new ValidationError('CRI score does not meet LMN eligibility threshold (acuity >= high)');
  }

  // Check for existing active LMN for this care recipient
  const existingLMNs = await queries.listLMNsByCareRecipient(input.careRecipientId);
  const hasActive = existingLMNs.some(
    (l) => l.status === 'active' || l.status === 'pending_signature',
  );
  if (hasActive) {
    throw new ValidationError('An active or pending LMN already exists for this care recipient');
  }

  const record = await queries.createLMN({
    careRecipientId: input.careRecipientId,
    careRecipientName: cri.careRecipientId ?? 'Unknown', // will be enriched
    generatedBy: userId,
    criAssessmentId: input.criAssessmentId,
    criScore: cri.totalScore,
    acuity: cri.acuity ?? 'high',
    diagnosisCodes: input.diagnosisCodes,
    omahaProblems: [],
    carePlanSummary: input.carePlanSummary,
  });

  logger.info({ lmnId: record.id, criId: input.criAssessmentId }, 'LMN generated');
  return record as unknown as LMN;
}

/**
 * Send LMN for physician signature
 */
async function sendForSignature(
  lmnId: string,
  physicianId: string,
  input: SignLMNInput,
): Promise<LMN> {
  const lmn = await queries.getLMNById(lmnId);
  if (!lmn) throw new NotFoundError('LMN');
  if (lmn.status !== 'draft') {
    throw new ValidationError(`Cannot sign — LMN status is ${lmn.status}`);
  }

  // Get physician info
  const physician = await queries.getUserById(physicianId);
  if (!physician) throw new NotFoundError('Physician');

  if (input.signatureMethod === 'manual') {
    // Manual signing — mark as signed immediately
    const result = await recordManualSignature(lmnId, physician.firstName ?? 'Dr.');
    const now = new Date();
    const expiresAt = calculateLMNExpiry(now, lmn.durationDays);

    const updated = await queries.updateLMN(lmnId, {
      status: 'active',
      signingPhysicianId: physicianId,
      signingPhysicianName: `${physician.firstName ?? ''} ${physician.lastName ?? ''}`.trim(),
      signatureRequestId: result.requestId,
      signatureMethod: 'manual',
      signedAt: now.toISOString(),
      issuedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });

    // Queue FHIR sync
    await queries.createOutboxEvent({
      eventType: 'lmn.signed',
      resourceType: 'DocumentReference',
      resourceId: lmnId,
      payload: {
        careRecipientId: lmn.careRecipientId,
        criScore: lmn.criScore,
        acuity: lmn.acuity,
        signedBy: physicianId,
        issuedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
    });

    logger.info({ lmnId, physician: physicianId }, 'LMN manually signed and activated');
    return updated as unknown as LMN;
  }

  // E-signature workflow
  const result = await requestSignature(input.signatureMethod, {
    documentId: lmnId,
    signerEmail: physician.email,
    signerName: `${physician.firstName ?? ''} ${physician.lastName ?? ''}`.trim(),
    documentTitle: `LMN — ${lmn.careRecipientName}`,
  });

  const updated = await queries.updateLMN(lmnId, {
    status: 'pending_signature',
    signingPhysicianId: physicianId,
    signingPhysicianName: `${physician.firstName ?? ''} ${physician.lastName ?? ''}`.trim(),
    signatureRequestId: result.requestId,
    signatureMethod: input.signatureMethod,
  });

  // Notify MD about pending signature
  await notificationService
    .send({
      userId: physicianId,
      type: 'lmn_expiry', // reuse notification type for signing requests
      variables: {
        careRecipientName: lmn.careRecipientName,
        daysRemaining: 'Signature Required',
      },
    })
    .catch((err) => {
      logger.warn({ err, lmnId }, 'Failed to notify physician about pending LMN signature');
    });

  logger.info(
    { lmnId, physician: physicianId, method: input.signatureMethod },
    'LMN sent for e-signature',
  );
  return updated as unknown as LMN;
}

/**
 * Handle signature completion (from webhook or manual confirmation)
 */
async function completeSignature(lmnId: string): Promise<LMN> {
  const lmn = await queries.getLMNById(lmnId);
  if (!lmn) throw new NotFoundError('LMN');
  if (lmn.status !== 'pending_signature') {
    throw new ValidationError('LMN is not pending signature');
  }

  const now = new Date();
  const expiresAt = calculateLMNExpiry(now, lmn.durationDays);

  const updated = await queries.updateLMN(lmnId, {
    status: 'active',
    signedAt: now.toISOString(),
    issuedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });

  // Queue FHIR sync
  await queries.createOutboxEvent({
    eventType: 'lmn.signed',
    resourceType: 'DocumentReference',
    resourceId: lmnId,
    payload: {
      careRecipientId: lmn.careRecipientId,
      criScore: lmn.criScore,
      acuity: lmn.acuity,
      signedBy: lmn.signingPhysicianId,
      issuedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    },
  });

  // Notify the conductor who generated it
  await notificationService
    .send({
      userId: lmn.generatedBy,
      type: 'cri_approved', // reuse: LMN is essentially CRI-approved flow completion
      variables: {
        careRecipientName: lmn.careRecipientName,
        acuity: lmn.acuity,
      },
    })
    .catch((err) => {
      logger.warn({ err, lmnId }, 'Failed to notify conductor of LMN signature completion');
    });

  logger.info({ lmnId }, 'LMN signature completed, now active');
  return updated as unknown as LMN;
}

/**
 * Get LMN by ID
 */
async function getLMN(lmnId: string): Promise<LMN> {
  const record = await queries.getLMNById(lmnId);
  if (!record) throw new NotFoundError('LMN');
  return record as unknown as LMN;
}

/**
 * Get LMN preview (rendered document content)
 */
async function getLMNPreview(lmnId: string): Promise<string> {
  const lmn = await queries.getLMNById(lmnId);
  if (!lmn) throw new NotFoundError('LMN');

  const sections = generateLMNDocument({
    letterDate: lmn.issuedAt ?? new Date().toISOString(),
    patientName: lmn.careRecipientName,
    physicianName: lmn.signingPhysicianName ?? 'Medical Director',
    criScore: lmn.criScore,
    acuity: lmn.acuity,
    diagnosisCodes: lmn.diagnosisCodes,
    omahaProblems: lmn.omahaProblems,
    carePlanSummary: lmn.carePlanSummary,
    issuedAt: lmn.issuedAt ?? new Date().toISOString(),
    expiresAt: lmn.expiresAt ?? calculateLMNExpiry(new Date(), lmn.durationDays).toISOString(),
    durationDays: lmn.durationDays,
    lmnId: lmn.id,
  });

  return lmnToPlainText(sections);
}

/**
 * List LMNs visible to a specific user (scoped by their families).
 * For medical_director/admin the caller should use listLMNs() instead.
 */
async function listLMNsForUser(userId: string): Promise<LMNListItem[]> {
  const records = await queries.listLMNsForUserFamilies(userId);
  const now = new Date();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return records.map((r: any) => {
    const daysUntilExpiry = r.expiresAt
      ? Math.floor((new Date(r.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : undefined;
    return {
      id: r.id,
      careRecipientName: r.careRecipientName,
      status: r.status as LMN['status'],
      acuity: r.acuity,
      issuedAt: r.issuedAt ?? undefined,
      expiresAt: r.expiresAt ?? undefined,
      daysUntilExpiry,
      signingPhysicianName: r.signingPhysicianName ?? undefined,
    };
  });
}

/**
 * List all LMNs with computed expiry info
 */
async function listLMNs(): Promise<LMNListItem[]> {
  const records = await queries.listAllLMNs();
  const now = new Date();

  return records.map((r) => {
    const daysUntilExpiry = r.expiresAt
      ? Math.floor((new Date(r.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : undefined;

    return {
      id: r.id,
      careRecipientName: r.careRecipientName,
      status: r.status as LMN['status'],
      acuity: r.acuity,
      issuedAt: r.issuedAt ?? undefined,
      expiresAt: r.expiresAt ?? undefined,
      daysUntilExpiry,
      signingPhysicianName: r.signingPhysicianName ?? undefined,
    };
  });
}

/**
 * List LMNs pending MD signature
 */
async function listPendingSignature(): Promise<LMNListItem[]> {
  const records = await queries.listPendingSignatureLMNs();
  return records.map((r) => ({
    id: r.id,
    careRecipientName: r.careRecipientName,
    status: r.status as LMN['status'],
    acuity: r.acuity,
    issuedAt: r.issuedAt ?? undefined,
    expiresAt: r.expiresAt ?? undefined,
    signingPhysicianName: r.signingPhysicianName ?? undefined,
  }));
}

/**
 * Revoke an active LMN
 */
async function revoke(lmnId: string, userId: string): Promise<LMN> {
  const lmn = await queries.getLMNById(lmnId);
  if (!lmn) throw new NotFoundError('LMN');
  if (lmn.status !== 'active' && lmn.status !== 'expiring') {
    throw new ValidationError('Can only revoke active or expiring LMNs');
  }

  const updated = await queries.updateLMN(lmnId, { status: 'revoked' });
  logger.info({ lmnId, revokedBy: userId }, 'LMN revoked');
  return updated as unknown as LMN;
}

/**
 * Renew an expiring LMN with a new CRI assessment
 */
async function renew(lmnId: string, userId: string, input: RenewLMNInput): Promise<LMN> {
  const oldLmn = await queries.getLMNById(lmnId);
  if (!oldLmn) throw new NotFoundError('LMN');

  // Verify new CRI
  const cri = await queries.getAssessmentById(input.criAssessmentId);
  if (!cri) throw new NotFoundError('CRI Assessment');
  if (cri.reviewStatus !== 'approved' || !cri.lmnEligible) {
    throw new ValidationError('CRI must be approved and LMN-eligible for renewal');
  }

  // Expire the old LMN
  await queries.updateLMN(lmnId, { status: 'expired' });

  // Create new LMN
  const newLmn = await queries.createLMN({
    careRecipientId: oldLmn.careRecipientId,
    careRecipientName: oldLmn.careRecipientName,
    generatedBy: userId,
    criAssessmentId: input.criAssessmentId,
    criScore: cri.totalScore,
    acuity: cri.acuity ?? 'high',
    diagnosisCodes: oldLmn.diagnosisCodes,
    omahaProblems: oldLmn.omahaProblems,
    carePlanSummary: oldLmn.carePlanSummary,
    durationDays: input.durationDays ?? oldLmn.durationDays,
  });

  logger.info({ oldLmnId: lmnId, newLmnId: newLmn.id }, 'LMN renewed');
  return newLmn as unknown as LMN;
}

/**
 * PUBLIC LMN REQUEST — Direct-to-consumer, no auth required
 *
 * Flow: Family submits intake form → Stripe charges $199 →
 * AI drafts LMN from intake data → Josh reviews queue →
 * Josh signs → family receives signed letter via email/SMS
 */
async function createPublicRequest(
  input: PublicLMNRequestInput,
  stripePaymentIntentId: string,
): Promise<LMN> {
  // Map functional limitations to Omaha problem codes
  const omahaMapping: Record<string, number> = {
    bathing: 38, // Personal care
    dressing: 38,
    meal_prep: 28, // Digestion-Hydration
    medication_management: 24, // Prescribed medication regimen
    mobility: 25, // Neuro-musculo-skeletal function
    toileting: 38,
    transfers: 25,
    housekeeping: 2, // Sanitation
    transportation: 5, // Communication with community resources
    companionship: 6, // Social contact
  };

  const omahaProblems = [
    ...new Set(input.functionalLimitations.map((fl) => omahaMapping[fl]).filter(Boolean)),
  ];

  // Estimate acuity from number of limitations + conditions
  const limitationCount = input.functionalLimitations.length;
  const conditionCount = input.primaryConditions.length;
  const rawScore = limitationCount * 4 + conditionCount * 5;
  const acuity = rawScore >= 30 ? 'critical' : rawScore >= 18 ? 'high' : 'moderate';

  // Build care plan summary from services requested
  const serviceLabels: Record<string, string> = {
    companion_care: 'In-home companion care and supervision',
    personal_care: 'Personal care assistance (bathing, dressing, grooming)',
    respite_care: 'Respite care for family caregiver relief',
    dementia_care: 'Specialized dementia/cognitive support care',
    fall_prevention: 'Fall prevention program and mobility assistance',
    medication_reminders: 'Medication management and reminder services',
    meal_preparation: 'Nutritional support and meal preparation',
    transportation: 'Medical and essential transportation services',
    exercise_program: 'Therapeutic exercise and physical activity program',
    home_modification: 'Home safety assessment and modification',
    wellness_membership: 'Wellness program membership (gym, aquatic therapy)',
    other: input.otherServiceDescription ?? 'Additional care services as needed',
  };

  const carePlanSummary = input.servicesRequested
    .map((s) => `  - ${serviceLabels[s] ?? s}`)
    .join('\n');

  // Create the LMN record (public requests bypass CRI requirement)
  const record = await queries.createLMN({
    careRecipientId: `public_${Date.now()}`, // temporary ID for non-member requests
    careRecipientName: input.patientName,
    generatedBy: 'public_request',
    criAssessmentId: undefined as unknown as string, // public requests bypass CRI
    criScore: rawScore,
    acuity,
    diagnosisCodes: [],
    omahaProblems: omahaProblems.filter((p): p is number => p !== undefined),
    carePlanSummary: [
      `Patient: ${input.patientName} (DOB: ${input.patientDOB})`,
      `Requester: ${input.requesterName} (${input.relationshipToPatient})`,
      `Contact: ${input.requesterEmail}${input.requesterPhone ? `, ${input.requesterPhone}` : ''}`,
      '',
      `Primary Conditions: ${input.primaryConditions.join(', ')}`,
      `Functional Limitations: ${input.functionalLimitations.join(', ')}`,
      input.currentCareDescription ? `\nCurrent Care: ${input.currentCareDescription}` : '',
      '',
      'Recommended Services:',
      carePlanSummary,
      '',
      input.estimatedAnnualCost
        ? `Estimated Annual Cost: $${input.estimatedAnnualCost.toLocaleString()}`
        : '',
      input.hsaFsaProvider ? `HSA/FSA Provider: ${input.hsaFsaProvider}` : '',
      '',
      `Payment: $199 via Stripe (${stripePaymentIntentId})`,
    ]
      .filter(Boolean)
      .join('\n'),
  });

  // Auto-queue for Josh's review
  await queries.createOutboxEvent({
    eventType: 'lmn.public_request',
    resourceType: 'LMN',
    resourceId: record.id,
    payload: {
      requesterEmail: input.requesterEmail,
      requesterPhone: input.requesterPhone,
      patientName: input.patientName,
      stripePaymentIntentId,
      acuity,
    },
  });

  logger.info(
    {
      lmnId: record.id,
      requester: input.requesterEmail,
      patient: input.patientName,
      acuity,
      payment: stripePaymentIntentId,
    },
    'Public LMN request created — queued for physician review',
  );

  return record as unknown as LMN;
}

/**
 * List public LMN requests pending review (for Josh's dashboard)
 */
async function listPublicRequests(): Promise<LMNListItem[]> {
  const records = await queries.listAllLMNs();
  return records
    .filter((r) => r.generatedBy === 'public_request' && r.status === 'draft')
    .map((r) => ({
      id: r.id,
      careRecipientName: r.careRecipientName,
      status: r.status as LMN['status'],
      acuity: r.acuity,
      issuedAt: r.issuedAt ?? undefined,
      expiresAt: r.expiresAt ?? undefined,
      signingPhysicianName: r.signingPhysicianName ?? undefined,
    }));
}

export const lmnService = {
  generate,
  createPublicRequest,
  sendForSignature,
  completeSignature,
  getLMN,
  getLMNPreview,
  listLMNs,
  listLMNsForUser,
  listPendingSignature,
  listPublicRequests,
  revoke,
  renew,
};
