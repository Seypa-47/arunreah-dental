import { describe, expect, it } from 'vitest';
import { canAccessAdminPath, getSafeAdminReturnPath } from './admin-route-access';

describe('admin route access', () => {
  it('enforces the receptionist/CMS/super-admin route matrix in the frontend UX', () => {
    expect(canAccessAdminPath('RECEPTIONIST', '/admin/appointments/inbox')).toBe(true);
    expect(canAccessAdminPath('RECEPTIONIST', '/admin/services')).toBe(false);

    expect(canAccessAdminPath('CMS_ADMIN', '/admin/services')).toBe(true);
    expect(canAccessAdminPath('CMS_ADMIN', '/admin/page-media')).toBe(true);
    expect(canAccessAdminPath('CMS_ADMIN', '/admin/appointments/inbox')).toBe(false);

    expect(canAccessAdminPath('SUPER_ADMIN', '/admin/services')).toBe(true);
    expect(canAccessAdminPath('SUPER_ADMIN', '/admin/appointments/inbox')).toBe(true);
    expect(canAccessAdminPath('SUPER_ADMIN', '/admin/admins')).toBe(true);
    expect(canAccessAdminPath('CMS_ADMIN', '/admin/admins')).toBe(false);
    expect(canAccessAdminPath('RECEPTIONIST', '/admin/admins')).toBe(false);
    expect(canAccessAdminPath('RECEPTIONIST', '/admin/page-media')).toBe(false);
  });

  it('allows receptionist and super-admin to access appointments calendar', () => {
    expect(canAccessAdminPath('RECEPTIONIST', '/admin/appointments/calendar')).toBe(true);
    expect(canAccessAdminPath('SUPER_ADMIN', '/admin/appointments/calendar')).toBe(true);
    expect(canAccessAdminPath('CMS_ADMIN', '/admin/appointments/calendar')).toBe(false);

    expect(canAccessAdminPath('RECEPTIONIST', '/admin/calendar')).toBe(true);
    expect(canAccessAdminPath('SUPER_ADMIN', '/admin/calendar')).toBe(true);
    expect(canAccessAdminPath('CMS_ADMIN', '/admin/calendar')).toBe(false);
  });

  it('preserves only safe admin return paths after login', () => {
    expect(getSafeAdminReturnPath('/admin/appointments/inbox?status=PENDING')).toBe('/admin/appointments/inbox?status=PENDING');
    expect(getSafeAdminReturnPath('/admin/login?from=/admin/services')).toBe('/admin/dashboard');
    expect(getSafeAdminReturnPath('https://attacker.example')).toBe('/admin/dashboard');
  });
});
