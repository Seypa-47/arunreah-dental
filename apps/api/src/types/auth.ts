import type { AdminRole } from '@arunreah/shared';

export type AuthenticatedAdmin = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};
