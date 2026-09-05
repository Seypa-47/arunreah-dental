import { describe, expect, it } from 'vitest';
import type { ApiClient } from '@/lib/api';
import { createPublicAppointment, getPublicBranch, getPublicClinic, getPublicContact, getPublicDoctor, getPublicServices, getPublicShowcase, getPublicShowcases } from './public-content';

describe('public content API service', () => {
  it('uses language-specific public endpoints without admin credentials', async () => {
    const requests: Array<{ path: string; authenticated?: boolean }> = [];
    const client = {
      get: async <T>(path: string, options?: { authenticated?: boolean }) => {
        requests.push({ authenticated: options?.authenticated, path });
        return { doctors: [], services: [], showcases: [] } as T;
      },
    } satisfies Pick<ApiClient, 'get'>;

    await getPublicServices('km', client);
    await getPublicShowcases('en', true, client);
    await getPublicShowcase('smile/transformation', 'en', client);
    await getPublicDoctor('a/doctor', 'km', client);

    expect(requests).toEqual([
      { authenticated: undefined, path: '/api/public/services?lang=km' },
      { authenticated: undefined, path: '/api/public/showcases?lang=en&homepage=true' },
      { authenticated: undefined, path: '/api/public/showcases/smile%2Ftransformation?lang=en' },
      { authenticated: undefined, path: '/api/public/doctors/a%2Fdoctor?lang=km' },
    ]);
  });

  it('uses public clinic, contact, and branch endpoints without an admin session', async () => {
    const requests: Array<{ path: string; authenticated?: boolean }> = [];
    const client = {
      get: async <T>(path: string, options?: { authenticated?: boolean }) => {
        requests.push({ authenticated: options?.authenticated, path });
        return {} as T;
      },
    } satisfies Pick<ApiClient, 'get'>;

    await getPublicClinic(client);
    await getPublicContact(client);
    await getPublicBranch('toul tompoung', 'km', client);

    expect(requests).toEqual([
      { authenticated: undefined, path: '/api/public/clinic' },
      { authenticated: undefined, path: '/api/public/contact' },
      { authenticated: undefined, path: '/api/public/branches/toul%20tompoung?lang=km' },
    ]);
  });

  it('submits appointment requests without admin credentials and preserves a null doctor choice', async () => {
    const input = {
      branchId: '550e8400-e29b-41d4-a716-446655440003',
      doctorId: null,
      email: 'patient@example.com',
      idempotencyKey: '550e8400-e29b-41d4-a716-446655440004',
      notes: null,
      patientName: 'Sok Dara',
      phone: '012 345 678',
      preferredDate: '2026-09-08',
      preferredTime: '09:00',
      serviceId: '550e8400-e29b-41d4-a716-446655440001',
    };
    let request: { path: string; options: unknown } | undefined;
    const client = {
      post: async <T>(path: string, options?: unknown) => {
        request = { options, path };
        return { reference: 'AR-20260908-ABC123', status: 'PENDING' } as T;
      },
    } satisfies Pick<ApiClient, 'post'>;

    await createPublicAppointment(input, client);

    expect(request).toEqual({ path: '/api/public/appointments', options: { json: input } });
  });
});
