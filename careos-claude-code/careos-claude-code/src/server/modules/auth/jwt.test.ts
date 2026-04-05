/**
 * JWT RS256 Token Tests
 * Tests sign/verify for access and refresh tokens.
 */
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { generateKeyPairSync } from 'node:crypto';
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  resetKeyCache,
  type AccessTokenPayload,
  type RefreshTokenPayload,
} from './jwt.js';

// Generate a test RS256 key pair and inject into env
beforeAll(() => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  process.env['JWT_PRIVATE_KEY'] = privateKey;
  process.env['JWT_PUBLIC_KEY'] = publicKey;
});

afterEach(() => {
  resetKeyCache();
});

describe('Access Tokens', () => {
  const payload: AccessTokenPayload = {
    sub: 'user:abc123',
    roles: ['conductor'],
    activeRole: 'conductor',
    twoFactorVerified: false,
  };

  it('signs and verifies an access token', async () => {
    const token = await signAccessToken(payload);
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts

    const decoded = await verifyAccessToken(token);
    expect(decoded.sub).toBe('user:abc123');
    expect(decoded.roles).toEqual(['conductor']);
    expect(decoded.activeRole).toBe('conductor');
    expect(decoded.twoFactorVerified).toBe(false);
  });

  it('preserves multi-role payload', async () => {
    const multiRole: AccessTokenPayload = {
      sub: 'user:multi',
      roles: ['conductor', 'timebank_member'],
      activeRole: 'conductor',
      twoFactorVerified: true,
    };

    const token = await signAccessToken(multiRole);
    const decoded = await verifyAccessToken(token);
    expect(decoded.roles).toEqual(['conductor', 'timebank_member']);
    expect(decoded.twoFactorVerified).toBe(true);
  });

  it('rejects a tampered token', async () => {
    const token = await signAccessToken(payload);
    const tampered = token.slice(0, -5) + 'XXXXX';
    await expect(verifyAccessToken(tampered)).rejects.toThrow();
  });

  it('preserves 2FA verified flag', async () => {
    const withFA: AccessTokenPayload = {
      sub: 'user:admin1',
      roles: ['admin'],
      activeRole: 'admin',
      twoFactorVerified: true,
    };

    const token = await signAccessToken(withFA);
    const decoded = await verifyAccessToken(token);
    expect(decoded.twoFactorVerified).toBe(true);
  });

  it('handles all 7 roles', async () => {
    const roles = [
      'conductor',
      'worker_owner',
      'timebank_member',
      'medical_director',
      'admin',
      'employer_hr',
      'wellness_provider',
    ] as const;

    for (const role of roles) {
      const p: AccessTokenPayload = {
        sub: `user:${role}`,
        roles: [role],
        activeRole: role,
        twoFactorVerified: false,
      };
      const token = await signAccessToken(p);
      const decoded = await verifyAccessToken(token);
      expect(decoded.activeRole).toBe(role);
    }
  });
});

describe('Refresh Tokens', () => {
  const payload: RefreshTokenPayload = {
    sub: 'user:abc123',
    jti: 'refresh-id-001',
  };

  it('signs and verifies a refresh token', async () => {
    const token = await signRefreshToken(payload);
    expect(token).toBeTruthy();

    const decoded = await verifyRefreshToken(token);
    expect(decoded.sub).toBe('user:abc123');
    expect(decoded.jti).toBe('refresh-id-001');
  });

  it('rejects a tampered refresh token', async () => {
    const token = await signRefreshToken(payload);
    const tampered = token.slice(0, -5) + 'YYYYY';
    await expect(verifyRefreshToken(tampered)).rejects.toThrow();
  });

  it('each refresh token has unique jti', async () => {
    const t1 = await signRefreshToken({ sub: 'user:1', jti: 'jti-aaa' });
    const t2 = await signRefreshToken({ sub: 'user:1', jti: 'jti-bbb' });

    const d1 = await verifyRefreshToken(t1);
    const d2 = await verifyRefreshToken(t2);

    expect(d1.jti).toBe('jti-aaa');
    expect(d2.jti).toBe('jti-bbb');
    expect(d1.jti).not.toBe(d2.jti);
  });
});
