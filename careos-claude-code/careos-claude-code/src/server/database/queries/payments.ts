/**
 * Payment Records Query Builders
 * Persists receipts for HSA/FSA documentation and audit trail.
 */
import { getPool } from '../postgres.js';

export interface PaymentRecord {
  id: string;
  familyId: string | null;
  userId: string;
  stripePaymentIntentId: string;
  amountCents: number;
  description: string;
  type: 'membership' | 'membership_renewal' | 'credit_purchase' | 'comfort_card';
  hsaFsaEligible: boolean;
  status: 'succeeded' | 'failed';
  createdAt: string;
}

const PAYMENT_RECORD_COLS = `
  id::text,
  family_id::text                 AS "familyId",
  user_id::text                   AS "userId",
  stripe_payment_intent_id        AS "stripePaymentIntentId",
  amount_cents                    AS "amountCents",
  description,
  type,
  hsa_fsa_eligible                AS "hsaFsaEligible",
  status,
  created_at::text                AS "createdAt"
`;

export interface CreatePaymentRecordInput {
  familyId?: string | null;
  userId: string;
  stripePaymentIntentId: string;
  amountCents: number;
  description: string;
  type: PaymentRecord['type'];
  hsaFsaEligible: boolean;
  status: PaymentRecord['status'];
}

export async function createPaymentRecord(input: CreatePaymentRecordInput): Promise<PaymentRecord> {
  const pool = getPool();
  const { rows } = await pool.query<PaymentRecord>(
    `INSERT INTO payment_records
       (family_id, user_id, stripe_payment_intent_id, amount_cents, description, type, hsa_fsa_eligible, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING ${PAYMENT_RECORD_COLS}`,
    [
      input.familyId ?? null,
      input.userId,
      input.stripePaymentIntentId,
      input.amountCents,
      input.description,
      input.type,
      input.hsaFsaEligible,
      input.status,
    ],
  );
  return rows[0]!;
}

export async function getPaymentReceiptByIntentId(
  stripePaymentIntentId: string,
): Promise<PaymentRecord | null> {
  const pool = getPool();
  const { rows } = await pool.query<PaymentRecord>(
    `SELECT ${PAYMENT_RECORD_COLS} FROM payment_records
     WHERE stripe_payment_intent_id = $1 LIMIT 1`,
    [stripePaymentIntentId],
  );
  return rows[0] ?? null;
}

export async function listPaymentReceiptsByFamily(familyId: string): Promise<PaymentRecord[]> {
  const pool = getPool();
  const { rows } = await pool.query<PaymentRecord>(
    `SELECT ${PAYMENT_RECORD_COLS} FROM payment_records
     WHERE family_id = $1 ORDER BY created_at DESC`,
    [familyId],
  );
  return rows;
}

export async function listPaymentReceiptsByUser(userId: string): Promise<PaymentRecord[]> {
  const pool = getPool();
  const { rows } = await pool.query<PaymentRecord>(
    `SELECT ${PAYMENT_RECORD_COLS} FROM payment_records
     WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId],
  );
  return rows;
}
