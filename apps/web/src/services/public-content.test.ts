import { describe, expect, it } from 'vitest';
import type { ApiClient } from '@/lib/api';
import {
  createPublicAppointment,
  getPublicAboutTimeline,
  getPublicBookableDoctors,
  getPublicBranch,
  getPublicBranches,
  getPublicClinic,
  getPublicContact,
  getPublicDoctor,
  getPublicDoctors,
  getPublicPageMedia,
  getPublicServices,
  getPublicShowcase,
  getPublicShowcases,
} from './public-content';

describe('public content API service', () => {
  it('coalesces a full public page load into one snapshot request', async () => {
    const requests: string[] = [];
    const client = {
      get: async <T>(path: string) => {
        requests.push(path);
        return {
          site: {
            aboutTimeline: [],
            branches: { appointments: [], branches: [], landing: [] },
            clinic: {},
            contact: {},
            doctors: [],
            pageMedia: {},
            services: [],
            showcases: [],
          },
        } as T;
      },
    } satisfies Pick<ApiClient, 'get'>;

    await Promise.all([
      getPublicClinic('en', client),
      getPublicContact('en', client),
      getPublicServices('en', client),
      getPublicDoctors('en', undefined, client),
      getPublicBookableDoctors('en', client),
      getPublicBranches('en', 'landing', client),
      getPublicBranches('en', 'branches', client),
      getPublicBranches('en', 'appointments', client),
      getPublicShowcases('en', true, client),
      getPublicPageMedia('HOME_PROMOTIONS', 'en', client),
      getPublicAboutTimeline('en', client),
    ]);

    expect(requests).toEqual(['/api/public/site?lang=en']);
  });

  it('uses language-specific public endpoints without admin credentials', async () => {
    const requests: Array<{ path: string; authenticated?: boolean }> = [];
    const client = {
      get: async <T>(path: string, options?: { authenticated?: boolean }) => {
        requests.push({ authenticated: options?.authenticated, path });
        if (path.startsWith('/api/public/site')) {
          return {
            site: {
              aboutTimeline: [],
              branches: { appointments: [], branches: [], landing: [] },
              clinic: {},
              contact: {},
              doctors: [],
              pageMedia: {},
              services: [],
              showcases: [],
            },
          } as T;
        }
        return {} as T;
      },
    } satisfies Pick<ApiClient, 'get'>;

    await getPublicServices('km', client);
    await getPublicShowcases('en', true, client);
    await getPublicShowcase('smile/transformation', 'en', client);
    await getPublicDoctors('en', 'ASSISTANT', client);
    await getPublicBookableDoctors('km', client);
    await getPublicDoctor('a/doctor', 'km', client);
    await getPublicPageMedia('DOCTORS_PATIENT_EDUCATION', 'km', client);
    await getPublicPageMedia('ABOUT_ADVANCED_FACILITIES', 'en', client);
    await getPublicPageMedia('ABOUT_CLINIC_GALLERY_PSA_CHAS', 'en', client);
    await getPublicPageMedia('ABOUT_CLINIC_GALLERY_TOUL_TOMPOUNG', 'km', client);
    await getPublicPageMedia('HOME_PROMOTIONS', 'en', client);

    expect(requests).toEqual([
      { authenticated: undefined, path: '/api/public/site?lang=km' },
      { authenticated: undefined, path: '/api/public/site?lang=en' },
      { authenticated: undefined, path: '/api/public/showcases/smile%2Ftransformation?lang=en' },
      { authenticated: undefined, path: '/api/public/team/a%2Fdoctor?lang=km' },
    ]);
  });

  it('uses public clinic, contact, and branch endpoints without an admin session', async () => {
    const requests: Array<{ path: string; authenticated?: boolean }> = [];
    const client = {
      get: async <T>(path: string, options?: { authenticated?: boolean }) => {
        requests.push({ authenticated: options?.authenticated, path });
        if (path.startsWith('/api/public/site')) {
          return {
            site: {
              aboutTimeline: [],
              branches: { appointments: [], branches: [], landing: [] },
              clinic: {},
              contact: {},
              doctors: [],
              pageMedia: {},
              services: [],
              showcases: [],
            },
          } as T;
        }
        return {} as T;
      },
    } satisfies Pick<ApiClient, 'get'>;

    await getPublicClinic('en', client);
    await getPublicContact('en', client);
    await getPublicBranch('toul tompoung', 'km', client);

    expect(requests).toEqual([
      { authenticated: undefined, path: '/api/public/site?lang=en' },
      { authenticated: undefined, path: '/api/public/branches/toul%20tompoung?lang=km' },
    ]);
  });

  it('submits appointment requests without admin credentials and preserves a null doctor choice', async () => {
    const input = {
      branchId: '550e8400-e29b-41d4-a716-446655440003',
      doctorId: null,
      email: 'patient@example.com',
      idempotencyKey: '550e8400-e29b-41d4-a716-446655440004',
      locale: 'en' as const,
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

    expect(request).toEqual({
      path: '/api/public/appointments',
      options: { json: input, responseSchema: expect.anything() },
    });
  });
});
