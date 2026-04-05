/**
 * LMN e-Signing Service — DocuSign/HelloSign integration stub
 *
 * In production, this will integrate with DocuSign or HelloSign API
 * for e-signature workflows. Currently provides mock implementations.
 */
import { logger } from '../../common/logger.js';

export type SignatureProvider = 'docusign' | 'hellosign' | 'manual';

export interface SignatureRequest {
  documentId: string;
  signerEmail: string;
  signerName: string;
  documentTitle: string;
  callbackUrl?: string;
}

export interface SignatureResult {
  requestId: string;
  provider: SignatureProvider;
  status: 'sent' | 'signed' | 'declined' | 'error';
  signedAt?: string;
  signatureUrl?: string;
  error?: string;
}

/**
 * Send document for e-signature via configured provider
 */
export async function requestSignature(
  provider: SignatureProvider,
  request: SignatureRequest,
): Promise<SignatureResult> {
  logger.info(
    { provider, documentId: request.documentId, signer: request.signerEmail },
    'Signature requested',
  );

  // In production:
  // - DocuSign: POST /v2.1/accounts/{accountId}/envelopes
  // - HelloSign: POST /signature_request/send

  if (provider === 'manual') {
    // Manual signing — mark as immediately ready
    return {
      requestId: `manual_${request.documentId}_${Date.now()}`,
      provider: 'manual',
      status: 'sent',
    };
  }

  // Mock e-signature provider response
  return {
    requestId: `${provider}_${request.documentId}_${Date.now()}`,
    provider,
    status: 'sent',
    signatureUrl: `https://${provider}.mock/sign/${request.documentId}`,
  };
}

/**
 * Check signature status from provider
 */
export async function checkSignatureStatus(
  provider: SignatureProvider,
  requestId: string,
): Promise<SignatureResult> {
  logger.info({ provider, requestId }, 'Checking signature status');

  // In production: query provider API for status
  // Mock: return current status
  return {
    requestId,
    provider,
    status: 'sent',
  };
}

/**
 * Process signature completion callback (webhook handler)
 */
export async function handleSignatureCallback(
  provider: SignatureProvider,
  payload: Record<string, unknown>,
): Promise<{ requestId: string; signed: boolean }> {
  logger.info({ provider }, 'Signature callback received');

  // In production: parse provider-specific webhook payload
  const requestId = (payload.requestId ?? payload.envelope_id ?? '') as string;
  const signed = (payload.status === 'completed' || payload.status === 'signed') as boolean;

  return { requestId, signed };
}

/**
 * Mark a document as manually signed (for in-person or uploaded signatures)
 */
export async function recordManualSignature(
  documentId: string,
  signerName: string,
): Promise<SignatureResult> {
  logger.info({ documentId, signerName }, 'Manual signature recorded');

  return {
    requestId: `manual_${documentId}_${Date.now()}`,
    provider: 'manual',
    status: 'signed',
    signedAt: new Date().toISOString(),
  };
}
