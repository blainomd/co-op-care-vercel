/**
 * Auth Service — Business logic for registration, login, token refresh, 2FA
 */
import { createHmac, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { ROLES_REQUIRING_2FA } from '@shared/constants/business-rules';
import {
  getUserByEmail,
  createUser,
  getUserById,
  setTwoFactorSecret,
  enableTwoFactor,
} from '../../database/queries/index.js';
import type { UserRecord } from '../../database/queries/index.js';
import { cache } from '../../database/redis.js';
import { logger } from '../../common/logger.js';
import {
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from '../../common/errors.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './jwt.js';
import type { RegisterInput, LoginInput, Verify2FAInput } from './schemas.js';
import { emitAudit } from '../../common/audit-events.js';

/** Request context forwarded from the route layer — never stored, audit-only. */
export interface AuthContext {
  ip?: string;
  userAgent?: string;
}

const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_PREFIX = 'refresh:';
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
const TWO_FACTOR_SETUP_PREFIX = '2fa_setup:';
const TWO_FACTOR_SETUP_TTL = 600; // 10 minutes

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  /**
   * Register a new user
   */
  async register(input: RegisterInput, ctx?: AuthContext): Promise<TokenPair> {
    // Check for existing user
    const existing = await getUserByEmail(input.email);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    // Create user via query builder
    const created = await createUser({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      roles: [input.role],
      activeRole: input.role,
      phone: input.phone,
    });

    logger.info({ userId: created.id, role: input.role }, 'User registered');
    emitAudit({
      eventType: 'auth_event',
      action: 'register',
      outcome: 'success',
      userId: created.id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      details: { role: input.role },
    });
    return issueTokens(created);
  },

  /**
   * Login with email + password
   */
  async login(input: LoginInput, ctx?: AuthContext): Promise<TokenPair & { requires2FA: boolean }> {
    const user = await getUserByEmail(input.email);
    if (!user) {
      // Timing-safe: still hash to prevent timing attacks
      await bcrypt.hash(input.password, BCRYPT_ROUNDS);
      emitAudit({
        eventType: 'auth_event',
        action: 'login_failed',
        outcome: 'failure',
        userId: null,
        ip: ctx?.ip,
        userAgent: ctx?.userAgent,
        details: { reason: 'user_not_found' },
      });
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      emitAudit({
        eventType: 'auth_event',
        action: 'login_failed',
        outcome: 'failure',
        userId: user.id,
        ip: ctx?.ip,
        userAgent: ctx?.userAgent,
        details: { reason: 'invalid_password' },
      });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if 2FA is required but not yet enabled
    const needs2FA = user.twoFactorEnabled;
    const role2FARequired = ROLES_REQUIRING_2FA.includes(user.activeRole);

    if (needs2FA) {
      // Issue a limited token that requires 2FA verification
      const tokens = await issueTokens(user, false);
      emitAudit({
        eventType: 'auth_event',
        action: 'login',
        outcome: 'success',
        userId: user.id,
        ip: ctx?.ip,
        userAgent: ctx?.userAgent,
        details: { requires2FA: true, role: user.activeRole },
      });
      return { ...tokens, requires2FA: true };
    }

    if (role2FARequired && !user.twoFactorEnabled) {
      // Role requires 2FA but user hasn't set it up — issue limited token
      const tokens = await issueTokens(user, false);
      emitAudit({
        eventType: 'auth_event',
        action: 'login',
        outcome: 'success',
        userId: user.id,
        ip: ctx?.ip,
        userAgent: ctx?.userAgent,
        details: { requires2FA: true, reason: '2fa_setup_required', role: user.activeRole },
      });
      return { ...tokens, requires2FA: true };
    }

    const tokens = await issueTokens(user, true);
    emitAudit({
      eventType: 'auth_event',
      action: 'login',
      outcome: 'success',
      userId: user.id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      details: { requires2FA: false, role: user.activeRole },
    });
    return { ...tokens, requires2FA: false };
  },

  /**
   * Refresh token rotation — issue new pair, invalidate old
   */
  async refresh(refreshToken: string, ctx?: AuthContext): Promise<TokenPair> {
    const payload = await verifyRefreshToken(refreshToken);

    // Check if token has been revoked (rotation tracking)
    const stored = await cache.get(`${REFRESH_TOKEN_PREFIX}${payload.jti}`);
    if (!stored) {
      emitAudit({
        eventType: 'auth_event',
        action: 'token_refresh',
        outcome: 'failure',
        userId: payload.sub,
        ip: ctx?.ip,
        userAgent: ctx?.userAgent,
        details: { reason: 'token_revoked_or_expired' },
      });
      throw new UnauthorizedError('Refresh token expired or revoked');
    }

    // Revoke old token
    await cache.del(`${REFRESH_TOKEN_PREFIX}${payload.jti}`);

    // Fetch current user data via query builder
    const user = await getUserById(payload.sub);
    if (!user) {
      throw new NotFoundError('User');
    }

    const tokens = await issueTokens(user);
    emitAudit({
      eventType: 'auth_event',
      action: 'token_refresh',
      outcome: 'success',
      userId: user.id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
    });
    return tokens;
  },

  /**
   * Setup 2FA — generate TOTP secret
   */
  async setup2FA(
    userId: string,
    ctx?: AuthContext,
  ): Promise<{ secret: string; otpauthUrl: string }> {
    // RFC 4648 base32 — required by all TOTP authenticator apps (Google Authenticator, Authy, 1Password)
    const secret = toBase32(randomBytes(20));
    const otpauthUrl = `otpauth://totp/CareOS:${userId}?secret=${secret}&issuer=CareOS&algorithm=SHA1&digits=6&period=30`;

    // Store temporarily until verified
    await cache.set(`${TWO_FACTOR_SETUP_PREFIX}${userId}`, secret, TWO_FACTOR_SETUP_TTL);

    emitAudit({
      eventType: 'auth_event',
      action: '2fa_setup',
      outcome: 'success',
      userId,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
    });

    return { secret, otpauthUrl };
  },

  /**
   * Verify 2FA code and enable 2FA on account
   */
  async verify2FA(userId: string, input: Verify2FAInput, ctx?: AuthContext): Promise<TokenPair> {
    // Get the pending secret or the stored secret
    const pendingSecret = await cache.get(`${TWO_FACTOR_SETUP_PREFIX}${userId}`);

    const user = await getUserById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const secret = pendingSecret ?? user.twoFactorSecret;
    if (!secret) {
      throw new ForbiddenError('2FA not set up — call setup endpoint first');
    }

    // Verify TOTP code
    const valid = verifyTOTP(secret, input.code);
    if (!valid) {
      emitAudit({
        eventType: 'auth_event',
        action: '2fa_failed',
        outcome: 'failure',
        userId,
        ip: ctx?.ip,
        userAgent: ctx?.userAgent,
      });
      throw new UnauthorizedError('Invalid 2FA code');
    }

    // If this was setup, persist the secret and enable 2FA
    if (pendingSecret) {
      await setTwoFactorSecret(userId, secret);
      await enableTwoFactor(userId);
      await cache.del(`${TWO_FACTOR_SETUP_PREFIX}${userId}`);
      logger.info({ userId }, '2FA enabled');
      emitAudit({
        eventType: 'auth_event',
        action: '2fa_setup',
        outcome: 'success',
        userId,
      });
    }

    emitAudit({
      eventType: 'auth_event',
      action: '2fa_verify',
      outcome: 'success',
      userId,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
    });

    // Re-fetch user to get updated state
    const updated = await getUserById(userId);
    return issueTokens(updated!, true);
  },
};

/**
 * Issue access + refresh token pair
 */
async function issueTokens(user: UserRecord, twoFactorVerified = true): Promise<TokenPair> {
  const jti = nanoid();

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({
      sub: user.id,
      roles: user.roles,
      activeRole: user.activeRole,
      twoFactorVerified,
    }),
    signRefreshToken({ sub: user.id, jti }),
  ]);

  // Store refresh token ID in Redis for rotation tracking
  await cache.set(`${REFRESH_TOKEN_PREFIX}${jti}`, user.id, REFRESH_TOKEN_TTL);

  return { accessToken, refreshToken };
}

/**
 * TOTP verification (RFC 6238)
 * Uses a 30-second window with 1-step tolerance
 */
function verifyTOTP(secret: string, code: string): boolean {
  const now = Math.floor(Date.now() / 1000);
  const step = 30;

  // Check current and adjacent time steps (±1 window)
  for (let i = -1; i <= 1; i++) {
    const counter = Math.floor(now / step) + i;
    const expected = generateTOTPCode(secret, counter);
    if (expected === code) {
      return true;
    }
  }
  return false;
}

/**
 * RFC 4648 base32 encoding — required by TOTP authenticator apps.
 * Only uses characters A-Z and 2-7.
 */
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function toBase32(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
  }
  return output;
}

function fromBase32(encoded: string): Buffer {
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  for (const char of encoded.toUpperCase()) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/**
 * Generate a TOTP code for a given counter value
 * HMAC-SHA1 based TOTP (RFC 6238 / RFC 4226)
 */
function generateTOTPCode(secret: string, counter: number): string {
  // Convert counter to 8-byte buffer (big-endian)
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(4, counter, false);

  // Decode base32 secret to raw bytes for HMAC
  const secretBytes = fromBase32(secret);

  // HMAC-SHA1 computation
  const hmac = createHmac('sha1', secretBytes);
  hmac.update(Buffer.from(buffer));
  const hash = hmac.digest();

  // Dynamic truncation (RFC 4226)
  const offset = hash[hash.length - 1]! & 0x0f;
  const binary =
    ((hash[offset]! & 0x7f) << 24) |
    ((hash[offset + 1]! & 0xff) << 16) |
    ((hash[offset + 2]! & 0xff) << 8) |
    (hash[offset + 3]! & 0xff);

  const otp = binary % 1_000_000;
  return otp.toString().padStart(6, '0');
}
