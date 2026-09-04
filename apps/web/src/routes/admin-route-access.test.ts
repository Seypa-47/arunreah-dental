import { describe, expect, it } from 'vitest';
import { canAccessAdminPath, getSafeAdminReturnPath } from './admin-route-access';

describe('admin route access', () => {
  it('enforces the receptionist/CMS/super-admin route matrix in the frontend UX', () => {
    expect(canAccessAdminPath('RECEPTIONIST', '/admin/appointments/inbox')).toBe(true);
    expect(canAccessAdminPath('RECEPTIONIST', '/admin/services')).toBe(false);

    expect(canAccessAdminPath('CMS_ADMIN', '/admin/services')).toBe(true);
    expect(canAccessAdminPath('CMS_ADMIN', '/admin/appointments/inbox')).toBe(false);

    expect(canAccessAdminPath('SUPER_ADMIN', '/admin/services')).toBe(true);
    expect(canAccessAdminPath('SUPER_ADMIN', '/admin/appointments/inbox')).toBe(true);
  });

  it('allows the dashboard to all authenticated roles but keeps calendar unavailable', () => {
    for (const role of ['RECEPTIONIST', 'CMS_ADMIN', 'SUPER_ADMIN'] as const) {
      expect(canAccessAdminPath(role, '/admin/dashboard')).toBe(true);
      expect(canAccessAdminPath(role, '/admin/appointments/calendar')).toBe(false);
    }
  });

  it('preserves only safe admin return paths after login', () => {
    expect(getSafeAdminReturnPath('/admin/appointments/inbox?status=PENDING')).toBe('/admin/appointments/inbox?status=PENDING');
    expect(getSafeAdminReturnPath('/admin/login?from=/admin/services')).toBe('/admin/dashboard');
    expect(getSafeAdminReturnPath('https://attacker.example')).toBe('/admin/dashboard');
  });
});
