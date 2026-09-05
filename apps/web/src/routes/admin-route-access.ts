import type { AdminRole } from '@arunreah/shared';

const appointmentPathPrefix = '/admin/appointments';
const cmsPathPrefixes = [
  '/admin/services',
  '/admin/doctors',
  '/admin/showcase',
  '/admin/clinic-info',
] as const;
const adminManagementPathPrefix = '/admin/admins';

export function canAccessAdminPath(role: AdminRole, pathname: string): boolean {
  if (pathname === '/admin/dashboard') return true;
  if (pathname === '/admin/appointments/calendar') return false;

  if (pathname.startsWith(appointmentPathPrefix)) {
    return role === 'RECEPTIONIST' || role === 'SUPER_ADMIN';
  }

  if (pathname.startsWith(adminManagementPathPrefix)) return role === 'SUPER_ADMIN';

  if (cmsPathPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return role === 'CMS_ADMIN' || role === 'SUPER_ADMIN';
  }

  return false;
}

export function getSafeAdminReturnPath(value: unknown): string {
  return typeof value === 'string' && value.startsWith('/admin/') && !value.startsWith('/admin/login')
    ? value
    : '/admin/dashboard';
}
