import { describe, expect, it } from 'vitest';
import type { ApiClient } from '@/lib/api';
import { getAdminDashboard } from './dashboard';

describe('dashboard API service', () => {
  it('uses an authenticated request and preserves role-specific optional sections', async () => {
    let authenticated = false;
    const client = { get: async <T>(_path: string, options?: { authenticated?: boolean }) => { authenticated = options?.authenticated ?? false; return { content: { branches: { archived: 0, draft: 0, published: 1, total: 1 }, doctors: { archived: 0, draft: 0, published: 0, total: 0 }, services: { archived: 0, draft: 0, published: 0, total: 0 }, showcases: { archived: 0, draft: 0, published: 0, total: 0 } }, role: 'CMS_ADMIN' } as T; } } satisfies Pick<ApiClient, 'get'>;
    const dashboard = await getAdminDashboard(client);
    expect(authenticated).toBe(true);
    expect(dashboard.role).toBe('CMS_ADMIN');
    expect(dashboard.appointments).toBeUndefined();
    expect(dashboard.recentAppointments).toBeUndefined();
  });
});
