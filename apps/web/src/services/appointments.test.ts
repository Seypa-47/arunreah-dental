import { describe, expect, it } from 'vitest';
import type { ApiClient } from '@/lib/api';
import { getAdminAppointment, getAdminAppointments, normalizeAppointmentFilters, updateAdminAppointmentStatus } from './appointments';

describe('appointment API service', () => {
  it('normalizes paging and sends authenticated list requests', async () => {
    let request: { path: string; authenticated?: boolean } | undefined;
    const client = { get: async <T>(path: string, options?: { authenticated?: boolean }) => { request = { authenticated: options?.authenticated, path }; return { appointments: [], meta: { limit: 20, page: 1, total: 0, totalPages: 0 } } as T; } } satisfies Pick<ApiClient, 'get'>;
    await getAdminAppointments({ search: '  ', status: 'PENDING' }, client);
    expect(normalizeAppointmentFilters({})).toMatchObject({ limit: 20, order: 'desc', page: 1, sort: 'createdAt' });
    expect(request?.authenticated).toBe(true);
    const params = new URL(`https://example.test${request?.path}`).searchParams;
    expect(Object.fromEntries(params)).toEqual({ limit: '20', order: 'desc', page: '1', sort: 'createdAt', status: 'PENDING' });
  });

  it('encodes detail IDs and restricts status mutation to the API contract payload', async () => {
    let detailPath = '';
    let update: { path: string; json: unknown } | undefined;
    const getClient = { get: async <T>(path: string) => { detailPath = path; return { appointment: { id: 'id' } } as T; } } satisfies Pick<ApiClient, 'get'>;
    const patchClient = { patch: async <T>(path: string, options?: { json?: unknown }) => { update = { json: options?.json, path }; return { appointment: { id: 'id' } } as T; } } satisfies Pick<ApiClient, 'patch'>;
    await getAdminAppointment('appointment/id', getClient);
    await updateAdminAppointmentStatus('appointment/id', { status: 'CONFIRMED' }, patchClient);
    expect(detailPath).toBe('/api/admin/appointments/appointment%2Fid');
    expect(update).toEqual({ json: { status: 'CONFIRMED' }, path: '/api/admin/appointments/appointment%2Fid/status' });
  });
});
