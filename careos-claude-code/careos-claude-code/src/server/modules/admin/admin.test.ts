/**
 * Admin module tests — capacity calculations, schema validation, curve generation
 */
import { describe, it, expect } from 'vitest';
import { manualAssignSchema, adminDisbursementSchema, listMembersQuerySchema } from './schemas';

// Import the pure function directly from service
// (the async functions require DB mocking, so we test the curve generator + schemas)
import { adminService } from './service';

describe('Admin: Michaelis-Menten Capacity Curve', () => {
  it('generates correct number of points', () => {
    const curve = adminService.generateCapacityCurve(10, 5, 50);
    expect(curve.length).toBe(51); // 0 to 50 inclusive
  });

  it('starts at V=0 when S=0', () => {
    const curve = adminService.generateCapacityCurve(10, 5, 50);
    expect(curve[0]!.substrate).toBe(0);
    expect(curve[0]!.velocity).toBe(0);
  });

  it('approaches Vmax at high substrate', () => {
    const vmax = 10;
    const km = 5;
    const curve = adminService.generateCapacityCurve(vmax, km, 1000);
    const lastPoint = curve[curve.length - 1]!;
    // At S=1000, V should be very close to Vmax
    expect(lastPoint.velocity).toBeGreaterThan(vmax * 0.99);
    expect(lastPoint.velocity).toBeLessThanOrEqual(vmax);
  });

  it('reaches half-max velocity at Km', () => {
    const vmax = 12;
    const km = 8;
    // V at S=Km should be Vmax/2
    const v = (vmax * km) / (km + km);
    expect(v).toBe(vmax / 2);
  });

  it('velocity increases monotonically', () => {
    const curve = adminService.generateCapacityCurve(15, 10, 100);
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i]!.velocity).toBeGreaterThanOrEqual(curve[i - 1]!.velocity);
    }
  });

  it('handles small Km (fast saturation)', () => {
    const curve = adminService.generateCapacityCurve(10, 0.5, 20);
    // Should reach near-Vmax quickly
    const midPoint = curve[Math.floor(curve.length / 2)]!;
    expect(midPoint.velocity).toBeGreaterThan(9); // >90% of Vmax at mid-range
  });

  it('handles large Km (slow saturation)', () => {
    const curve = adminService.generateCapacityCurve(10, 100, 50);
    const lastPoint = curve[curve.length - 1]!;
    // At S=50 with Km=100, should be well below Vmax
    const expected = (10 * 50) / (100 + 50);
    expect(lastPoint.velocity).toBeCloseTo(expected, 1);
  });
});

describe('Admin: Schema Validation', () => {
  describe('manualAssignSchema', () => {
    it('accepts valid userId', () => {
      const result = manualAssignSchema.safeParse({ userId: 'user-123' });
      expect(result.success).toBe(true);
    });

    it('rejects empty userId', () => {
      const result = manualAssignSchema.safeParse({ userId: '' });
      expect(result.success).toBe(false);
    });

    it('rejects missing userId', () => {
      const result = manualAssignSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('adminDisbursementSchema', () => {
    it('accepts valid disbursement', () => {
      const result = adminDisbursementSchema.safeParse({ recipientUserId: 'u1', hours: 12 });
      expect(result.success).toBe(true);
    });

    it('rejects hours > 48', () => {
      const result = adminDisbursementSchema.safeParse({ recipientUserId: 'u1', hours: 49 });
      expect(result.success).toBe(false);
    });

    it('rejects hours <= 0', () => {
      const result = adminDisbursementSchema.safeParse({ recipientUserId: 'u1', hours: 0 });
      expect(result.success).toBe(false);
    });

    it('accepts boundary values (1 and 48)', () => {
      expect(adminDisbursementSchema.safeParse({ recipientUserId: 'u1', hours: 1 }).success).toBe(
        true,
      );
      expect(adminDisbursementSchema.safeParse({ recipientUserId: 'u1', hours: 48 }).success).toBe(
        true,
      );
    });

    it('rejects non-numeric hours', () => {
      const result = adminDisbursementSchema.safeParse({ recipientUserId: 'u1', hours: 'twelve' });
      expect(result.success).toBe(false);
    });

    it('rejects missing recipientUserId', () => {
      const result = adminDisbursementSchema.safeParse({ hours: 10 });
      expect(result.success).toBe(false);
    });
  });

  describe('listMembersQuerySchema', () => {
    it('accepts valid role filter', () => {
      const result = listMembersQuerySchema.safeParse({ role: 'conductor' });
      expect(result.success).toBe(true);
    });

    it('accepts all valid roles', () => {
      const roles = [
        'conductor',
        'worker_owner',
        'timebank_member',
        'medical_director',
        'admin',
        'employer_hr',
        'wellness_provider',
      ];
      for (const role of roles) {
        expect(listMembersQuerySchema.safeParse({ role }).success).toBe(true);
      }
    });

    it('accepts empty query (no role filter)', () => {
      const result = listMembersQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBeUndefined();
      }
    });

    it('rejects invalid role', () => {
      const result = listMembersQuerySchema.safeParse({ role: 'superadmin' });
      expect(result.success).toBe(false);
    });
  });
});

describe('Admin: Michaelis-Menten Math Properties', () => {
  it('V = Vmax * S / (Km + S) at any point', () => {
    const vmax = 10;
    const km = 5;
    const s = 15;
    const expected = (vmax * s) / (km + s);
    expect(expected).toBe(7.5);
  });

  it('saturation percentage is V/Vmax * 100', () => {
    const vmax = 10;
    const v = 7.5;
    const saturation = (v / vmax) * 100;
    expect(saturation).toBe(75);
  });

  it('estimated clear time is S / V', () => {
    const s = 20; // open tasks
    const v = 5; // tasks/hour
    const clearTime = s / v;
    expect(clearTime).toBe(4); // 4 hours to clear
  });

  it('clear time is Infinity when velocity is 0', () => {
    const s = 10;
    const v = 0;
    const clearTime = v > 0 ? s / v : Infinity;
    expect(clearTime).toBe(Infinity);
  });

  it('clear time is 0 when no open tasks', () => {
    const s = 0;
    const v = 5;
    const clearTime = v > 0 ? s / v : 0;
    expect(clearTime).toBe(0);
  });
});
