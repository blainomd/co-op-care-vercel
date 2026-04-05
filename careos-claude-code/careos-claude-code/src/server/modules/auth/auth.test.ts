/**
 * Auth Module Tests — Schemas, Role Validation, 2FA
 */
import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, verify2FASchema } from './schemas.js';
import {
  USER_ROLES,
  ROLES_REQUIRING_2FA,
  ROLES_WITH_PHI_ACCESS,
} from '@shared/constants/business-rules';

describe('Auth Schemas', () => {
  describe('registerSchema', () => {
    it('accepts valid registration data', () => {
      const result = registerSchema.safeParse({
        email: 'test@co-op.care',
        password: 'SecureP@ss1',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'conductor',
      });
      expect(result.success).toBe(true);
    });

    it('accepts registration with optional phone', () => {
      const result = registerSchema.safeParse({
        email: 'test@co-op.care',
        password: 'SecureP@ss1',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'conductor',
        phone: '303-555-0100',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'not-an-email',
        password: 'SecureP@ss1',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'conductor',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password shorter than 8 chars', () => {
      const result = registerSchema.safeParse({
        email: 'test@co-op.care',
        password: 'short',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'conductor',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty firstName', () => {
      const result = registerSchema.safeParse({
        email: 'test@co-op.care',
        password: 'SecureP@ss1',
        firstName: '',
        lastName: 'Doe',
        role: 'conductor',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid role', () => {
      const result = registerSchema.safeParse({
        email: 'test@co-op.care',
        password: 'SecureP@ss1',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'superadmin',
      });
      expect(result.success).toBe(false);
    });

    it('accepts all 7 valid roles', () => {
      for (const role of USER_ROLES) {
        const result = registerSchema.safeParse({
          email: `${role}@co-op.care`,
          password: 'SecureP@ss1',
          firstName: 'Test',
          lastName: 'User',
          role,
        });
        expect(result.success, `Role ${role} should be valid`).toBe(true);
      }
    });
  });

  describe('loginSchema', () => {
    it('accepts valid login', () => {
      const result = loginSchema.safeParse({
        email: 'user@co-op.care',
        password: 'MyP@ssword1',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing password', () => {
      const result = loginSchema.safeParse({
        email: 'user@co-op.care',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('verify2FASchema', () => {
    it('accepts valid 6-digit code', () => {
      const result = verify2FASchema.safeParse({ code: '123456' });
      expect(result.success).toBe(true);
    });

    it('rejects non-numeric code', () => {
      const result = verify2FASchema.safeParse({ code: 'abcdef' });
      expect(result.success).toBe(false);
    });

    it('rejects code shorter than 6 digits', () => {
      const result = verify2FASchema.safeParse({ code: '12345' });
      expect(result.success).toBe(false);
    });

    it('rejects code longer than 6 digits', () => {
      const result = verify2FASchema.safeParse({ code: '1234567' });
      expect(result.success).toBe(false);
    });
  });
});

describe('Role Validation', () => {
  it('defines exactly 7 roles', () => {
    expect(USER_ROLES).toHaveLength(7);
  });

  it('medical_director requires 2FA', () => {
    expect(ROLES_REQUIRING_2FA).toContain('medical_director');
  });

  it('admin requires 2FA', () => {
    expect(ROLES_REQUIRING_2FA).toContain('admin');
  });

  it('conductor does NOT require 2FA', () => {
    expect(ROLES_REQUIRING_2FA).not.toContain('conductor');
  });

  it('timebank_member does NOT require 2FA', () => {
    expect(ROLES_REQUIRING_2FA).not.toContain('timebank_member');
  });

  it('conductor has PHI access', () => {
    expect(ROLES_WITH_PHI_ACCESS).toContain('conductor');
  });

  it('worker_owner has PHI access', () => {
    expect(ROLES_WITH_PHI_ACCESS).toContain('worker_owner');
  });

  it('employer_hr does NOT have PHI access', () => {
    expect(ROLES_WITH_PHI_ACCESS).not.toContain('employer_hr');
  });

  it('wellness_provider does NOT have PHI access', () => {
    expect(ROLES_WITH_PHI_ACCESS).not.toContain('wellness_provider');
  });

  it('only medical_director and admin require 2FA (exactly 2 roles)', () => {
    expect(ROLES_REQUIRING_2FA).toHaveLength(2);
  });

  it('exactly 4 roles have PHI access', () => {
    expect(ROLES_WITH_PHI_ACCESS).toHaveLength(4);
  });
});

describe('TOTP 2FA Code Format', () => {
  it('valid codes are exactly 6 numeric digits', () => {
    const validCodes = ['000000', '123456', '999999', '000001'];
    for (const code of validCodes) {
      const result = verify2FASchema.safeParse({ code });
      expect(result.success, `${code} should be valid`).toBe(true);
    }
  });

  it('rejects codes with spaces or special chars', () => {
    const invalidCodes = ['12 345', '12-345', '12.345', ' 12345'];
    for (const code of invalidCodes) {
      const result = verify2FASchema.safeParse({ code });
      expect(result.success, `${code} should be invalid`).toBe(false);
    }
  });
});
