import type { AdminRole } from '@arunreah/shared';
import type { AuthenticatedAdmin } from '../types/auth';

export type SafeAdmin = AuthenticatedAdmin & {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminRecord = SafeAdmin & {
  passwordHash: string;
};

export function toAuthenticatedAdmin(admin: {
  id: string;
  displayName: string;
  email: string;
  role: AdminRole;
}): AuthenticatedAdmin {
  return {
    id: admin.id,
    name: admin.displayName,
    email: admin.email,
    role: admin.role,
  };
}

export function toSafeAdmin(admin: {
  id: string;
  displayName: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}): SafeAdmin {
  return {
    ...toAuthenticatedAdmin(admin),
    isActive: admin.isActive,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
}
