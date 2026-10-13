import { beforeEach, describe, expect, it, vi } from 'vitest';
import { pageMediaPlacementValues } from '@arunreah/shared';
import type { Bindings } from '../src/types/env';

const calls = vi.hoisted(() => ({
  branches: [] as string[],
  languages: [] as string[],
}));

vi.mock('../src/db/client', () => ({ createDbClient: () => ({}) }));
vi.mock('../src/services/clinic-settings.service', () => ({
  getPublicClinicSettings: async () => ({
    clinicNameEn: 'Arunreah Dental Clinic',
    clinicNameKm: 'អរុណរះ ទន្តពេទ្យ',
    taglineEn: null,
    taglineKm: null,
    shortAboutEn: null,
    shortAboutKm: null,
    footerDescriptionEn: null,
    footerDescriptionKm: null,
    logoKey: null,
    yearsExperience: null,
    successfulCases: null,
    patientSatisfaction: null,
  }),
}));
vi.mock('../src/services/contact-settings.service', () => ({
  getPublicContactSettings: async () => ({
    primaryPhone: '012 345 678',
    secondaryPhone: null,
    primaryEmail: null,
    addressEn: null,
    addressKm: null,
    businessHoursEn: null,
    businessHoursKm: null,
    mainGoogleMapsUrl: null,
    facebookUrl: null,
    telegramUrl: null,
    instagramUrl: null,
  }),
}));
vi.mock('../src/services/service.service', () => ({
  getPublicServiceList: async (_database: unknown, language: string) => {
    calls.languages.push(language);
    return [];
  },
}));
vi.mock('../src/services/doctor.service', () => ({ getPublicDoctorList: async () => [] }));
vi.mock('../src/services/branch.service', () => ({
  getPublicBranchList: async (_database: unknown, _language: string, scope: string) => {
    calls.branches.push(scope);
    return [];
  },
}));
vi.mock('../src/services/showcase.service', () => ({ getPublicShowcaseList: async () => [] }));
vi.mock('../src/services/page-media.service', () => ({
  listAllPublic: async () => Object.fromEntries(
    pageMediaPlacementValues.map((placement) => [placement, []]),
  ),
}));
vi.mock('../src/services/about-timeline.service', () => ({ listPublic: async () => ({ items: [] }) }));

const { app } = await import('../src/app');

const testBindings = {
  APP_ENV: 'development',
  CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
  DB: {} as D1Database,
  ASSETS: {} as R2Bucket,
} satisfies Bindings;

beforeEach(() => {
  calls.branches = [];
  calls.languages = [];
});

describe('public site snapshot API', () => {
  it('returns shared CMS content in one cacheable request', async () => {
    const response = await app.request(
      'http://localhost/api/public/site?lang=km',
      undefined,
      testBindings,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=60, must-revalidate');
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: {
        site: {
          clinic: { clinicNameEn: 'Arunreah Dental Clinic' },
          contact: { primaryPhone: '012 345 678' },
          services: [],
          doctors: [],
          branches: { branches: [], landing: [], appointments: [] },
          showcases: [],
          aboutTimeline: [],
        },
      },
    });
    expect(calls.languages).toEqual(['km']);
    expect(calls.branches).toEqual(['branches', 'landing', 'appointments']);
  });
});
