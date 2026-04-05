/**
 * JWT RS256 Token Utilities
 * Uses jose library for signing and verification.
 *
 * Access token: 15 minutes, in HttpOnly cookie
 * Refresh token: 7 days, stored in PostgreSQL with rotation
 */
import { SignJWT, jwtVerify, importPKCS8, importSPKI } from 'jose';
import type { UserRole } from '@shared/constants/business-rules';
import { config } from '../../config/settings.js';

export interface AccessTokenPayload {
  sub: string; // userId
  roles: UserRole[];
  activeRole: UserRole;
  twoFactorVerified: boolean;
}

export interface RefreshTokenPayload {
  sub: string; // userId
  jti: string; // unique token ID for rotation tracking
}

type JWTKey = Awaited<ReturnType<typeof importPKCS8>>;

let privateKey: JWTKey | null = null;
let publicKey: JWTKey | null = null;

async function getPrivateKey(): Promise<JWTKey> {
  if (!privateKey) {
    // Read lazily to support test injection via process.env
    const pem = config.jwt.privateKey || process.env['JWT_PRIVATE_KEY'];
    if (!pem) {
      throw new Error('JWT_PRIVATE_KEY not configured');
    }
    privateKey = await importPKCS8(pem, 'RS256');
  }
  return privateKey;
}

async function getPublicKey(): Promise<JWTKey> {
  if (!publicKey) {
    const pem = config.jwt.publicKey || process.env['JWT_PUBLIC_KEY'];
    if (!pem) {
      throw new Error('JWT_PUBLIC_KEY not configured');
    }
    publicKey = await importSPKI(pem, 'RS256');
  }
  return publicKey;
}

/**
 * Sign an access token (15-min expiry)
 */
export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  const key = await getPrivateKey();
  return new SignJWT({
    roles: payload.roles,
    activeRole: payload.activeRole,
    '2fa': payload.twoFactorVerified,
  })
    .setProtectedHeader({ alg: 'RS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(config.jwt.accessExpiry)
    .setIssuer('careos')
    .setAudience('careos')
    .sign(key);
}

/**
 * Sign a refresh token (7-day expiry)
 */
export async function signRefreshToken(payload: RefreshTokenPayload): Promise<string> {
  const key = await getPrivateKey();
  return new SignJWT({})
    .setProtectedHeader({ alg: 'RS256' })
    .setSubject(payload.sub)
    .setJti(payload.jti)
    .setIssuedAt()
    .setExpirationTime(config.jwt.refreshExpiry)
    .setIssuer('careos')
    .setAudience('careos')
    .sign(key);
}

/**
 * Verify and decode an access token
 */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const key = await getPublicKey();
  const { payload } = await jwtVerify(token, key, {
    algorithms: ['RS256'],
    issuer: 'careos',
    audience: 'careos',
  });

  return {
    sub: payload.sub!,
    roles: payload['roles'] as UserRole[],
    activeRole: payload['activeRole'] as UserRole,
    twoFactorVerified: (payload['2fa'] as boolean) ?? false,
  };
}

/**
 * Verify and decode a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const key = await getPublicKey();
  const { payload } = await jwtVerify(token, key, {
    algorithms: ['RS256'],
    issuer: 'careos',
    audience: 'careos',
  });

  return {
    sub: payload.sub!,
    jti: payload.jti!,
  };
}

/**
 * Reset cached keys (for testing)
 */
export function resetKeyCache(): void {
  privateKey = null;
  publicKey = null;
}
