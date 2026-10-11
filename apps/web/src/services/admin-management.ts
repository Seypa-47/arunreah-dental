import type { AdminRole, CreateAdminInput, UpdateAdminInput } from '@arunreah/shared';
import { getApiClient, type ApiClient } from '@/lib/api';

type AdminClient = Pick<ApiClient, 'get' | 'patch' | 'post'>;

export type ManagedAdmin = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const api = () => getApiClient();

export const adminManagementApi = {
  create: async (input: CreateAdminInput, client: AdminClient = api()) => {
    const result = await client.post<{ admin: ManagedAdmin }>('/api/admin/admins', { authenticated: true, json: input });
    return result.admin;
  },
  list: async (client: AdminClient = api()) => {
    const result = await client.get<{ admins: ManagedAdmin[] }>('/api/admin/admins', { authenticated: true });
    return result.admins;
  },
  update: async (id: string, input: UpdateAdminInput, client: AdminClient = api()) => {
    const result = await client.patch<{ admin: ManagedAdmin }>(`/api/admin/admins/${encodeURIComponent(id)}`, { authenticated: true, json: input });
    return result.admin;
  },
};
