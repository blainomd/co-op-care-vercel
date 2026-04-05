/**
 * Rate Limit Configuration per Route Group
 * Global rate limit is set in app.ts. These are stricter overrides.
 */
import type { RateLimitPluginOptions } from '@fastify/rate-limit';

/**
 * Auth endpoints: 10 requests per minute (brute-force protection)
 */
export const authRateLimit: Partial<RateLimitPluginOptions> = {
  max: 10,
  timeWindow: '1 minute',
};

/**
 * Assessment submission: 30 per minute (prevent accidental duplicates)
 */
export const assessmentRateLimit: Partial<RateLimitPluginOptions> = {
  max: 30,
  timeWindow: '1 minute',
};

/**
 * Time bank task creation: 20 per minute
 */
export const timebankRateLimit: Partial<RateLimitPluginOptions> = {
  max: 20,
  timeWindow: '1 minute',
};

/**
 * Sage chat: 30 per minute (public, prevent abuse)
 */
export const sageRateLimit: Partial<RateLimitPluginOptions> = {
  max: 30,
  timeWindow: '1 minute',
};

/**
 * Contact form: 5 per minute (prevent spam submissions)
 */
export const contactRateLimit: Partial<RateLimitPluginOptions> = {
  max: 5,
  timeWindow: '1 minute',
};

/**
 * Payment endpoints: 5 per minute (prevent abuse of billing APIs)
 */
export const paymentRateLimit: Partial<RateLimitPluginOptions> = {
  max: 5,
  timeWindow: '1 minute',
};

/**
 * Admin endpoints: 30 per minute
 */
export const adminRateLimit: Partial<RateLimitPluginOptions> = {
  max: 30,
  timeWindow: '1 minute',
};

/**
 * Referral endpoints: 20 per minute
 */
export const referralRateLimit: Partial<RateLimitPluginOptions> = {
  max: 20,
  timeWindow: '1 minute',
};

/**
 * Letter of Medical Necessity: 20 per minute
 */
export const lmnRateLimit: Partial<RateLimitPluginOptions> = {
  max: 20,
  timeWindow: '1 minute',
};

/**
 * Web3/blockchain endpoints: 10 per minute (expensive operations)
 */
export const web3RateLimit: Partial<RateLimitPluginOptions> = {
  max: 10,
  timeWindow: '1 minute',
};
