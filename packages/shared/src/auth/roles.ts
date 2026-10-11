export const adminRoleValues = ['RECEPTIONIST', 'CMS_ADMIN', 'SUPER_ADMIN'] as const;

export type AdminRole = (typeof adminRoleValues)[number];

export const permissionValues = [
  'APPOINTMENT_MANAGEMENT',
  'CMS_MANAGEMENT',
  'ADMIN_MANAGEMENT',
] as const;

export type Permission = (typeof permissionValues)[number];

export const rolesByPermission: Record<Permission, readonly AdminRole[]> = {
  APPOINTMENT_MANAGEMENT: ['RECEPTIONIST', 'SUPER_ADMIN'],
  CMS_MANAGEMENT: ['CMS_ADMIN', 'SUPER_ADMIN'],
  ADMIN_MANAGEMENT: ['SUPER_ADMIN'],
};
