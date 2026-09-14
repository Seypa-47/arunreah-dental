import { describe, expect, it } from 'vitest';
import type { ApiClient } from '@/lib/api';
import { adminManagementApi } from './admin-management';

describe('admin management API', () => {
  it('uses authenticated requests and never returns a submitted password', async () => {
    const calls: Array<{ path: string; options: unknown }> = [];
    const client = {
      get: async <T>(path: string, options?: unknown) => { calls.push({ path, options }); return { admins: [] } as T; },
      post: async <T>(path: string, options?: unknown) => { calls.push({ path, options }); return { admin: { id: '1', name: 'Staff', email: 'staff@example.com', role: 'RECEPTIONIST', isActive: true, createdAt: '', updatedAt: '' } } as T; },
      patch: async <T>(path: string, options?: unknown) => { calls.push({ path, options }); return { admin: {} } as T; },
    } satisfies Pick<ApiClient, 'get' | 'post' | 'patch'>;
    await adminManagementApi.list(client);
    const result = await adminManagementApi.create({ name: 'Staff', email: 'staff@example.com', password: 'a-secure-password', role: 'RECEPTIONIST' }, client);
    await adminManagementApi.update('admin/id', { name: 'Updated staff', role: 'CMS_ADMIN', isActive: false }, client);
    expect(calls).toEqual([
      { path: '/api/admin/admins', options: { authenticated: true } },
      { path: '/api/admin/admins', options: { authenticated: true, json: { name: 'Staff', email: 'staff@example.com', password: 'a-secure-password', role: 'RECEPTIONIST' } } },
      { path: '/api/admin/admins/admin%2Fid', options: { authenticated: true, json: { name: 'Updated staff', role: 'CMS_ADMIN', isActive: false } } },
    ]);
    expect(result).not.toHaveProperty('password');
  });
});
