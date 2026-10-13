import type {
  AppointmentAcknowledgement,
  CreatePublicAppointmentInput,
  PageMediaPlacement,
  PublicAboutTimelineItem,
  PublicBranch,
  PublicDoctorDetail,
  PublicDoctorProfileItem,
  PublicDoctorSummary,
  PublicPageMedia,
  PublicServiceDetail,
  PublicServiceSummary,
  PublicSiteSnapshot,
  PublicShowcaseDetail,
  PublicShowcaseSummary,
  TeamCategory,
} from '@arunreah/shared';
import {
  appointmentAcknowledgementSchema,
  publicBranchResponseSchema,
  publicDoctorResponseSchema,
  publicServiceResponseSchema,
  publicShowcaseResponseSchema,
  publicSiteResponseSchema,
} from '@arunreah/shared';
import { getApiClient, type ApiClient } from '@/lib/api';

export type PublicLanguage = 'en' | 'km';

export type {
  AppointmentAcknowledgement,
  PageMediaPlacement,
  PublicAboutTimelineItem,
  PublicBranch,
  PublicDoctorDetail,
  PublicDoctorProfileItem,
  PublicDoctorSummary,
  PublicPageMedia,
  PublicServiceDetail,
  PublicServiceSummary,
  PublicSiteSnapshot,
  PublicShowcaseDetail,
  PublicShowcaseSummary,
};

const publicSiteCacheTtlMs = 60_000;
type PublicSiteCacheEntry = {
  expiresAt: number;
  promise: Promise<PublicSiteSnapshot>;
};
const publicSiteCache = new WeakMap<object, Map<PublicLanguage, PublicSiteCacheEntry>>();

function getPublicSite(
  language: PublicLanguage,
  client: Pick<ApiClient, 'get'> = getApiClient(),
): Promise<PublicSiteSnapshot> {
  let byLanguage = publicSiteCache.get(client);
  if (!byLanguage) {
    byLanguage = new Map();
    publicSiteCache.set(client, byLanguage);
  }
  const cached = byLanguage.get(language);
  if (cached && cached.expiresAt > Date.now()) return cached.promise;

  const promise = client
    .get(`/api/public/site${languageQuery(language)}`, { responseSchema: publicSiteResponseSchema })
    .then((response) => response.site)
    .catch((error: unknown) => {
      byLanguage?.delete(language);
      throw error;
    });
  byLanguage.set(language, { expiresAt: Date.now() + publicSiteCacheTtlMs, promise });
  return promise;
}

function languageQuery(language: PublicLanguage, extra?: Record<string, string | boolean | undefined>) {
  const params = new URLSearchParams({ lang: language });
  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value !== undefined) params.set(key, String(value));
  }
  return `?${params.toString()}`;
}

export function getPublicClinic(language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return getPublicSite(language, client).then((site) => site.clinic);
}

export function getPublicContact(language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return getPublicSite(language, client).then((site) => site.contact);
}

export function getPublicServices(language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return getPublicSite(language, client).then((site) => ({ services: site.services }));
}

export function getPublicService(slug: string, language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get(`/api/public/services/${encodeURIComponent(slug)}${languageQuery(language)}`, { responseSchema: publicServiceResponseSchema });
}

export function getPublicDoctors(
  language: PublicLanguage,
  category?: TeamCategory,
  client: Pick<ApiClient, 'get'> = getApiClient(),
) {
  return getPublicSite(language, client).then((site) => ({
    doctors: category
      ? site.doctors.filter((doctor) => doctor.category === category)
      : site.doctors,
  }));
}

export function getPublicBookableDoctors(
  language: PublicLanguage,
  client: Pick<ApiClient, 'get'> = getApiClient(),
) {
  return getPublicSite(language, client).then((site) => ({
    doctors: site.doctors.filter((doctor) => doctor.bookable),
  }));
}

export function getPublicDoctor(slug: string, language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get(`/api/public/team/${encodeURIComponent(slug)}${languageQuery(language)}`, { responseSchema: publicDoctorResponseSchema });
}

export function getPublicBranches(
  language: PublicLanguage,
  scope: 'branches' | 'landing' | 'appointments' = 'branches',
  client: Pick<ApiClient, 'get'> = getApiClient(),
) {
  return getPublicSite(language, client).then((site) => ({ branches: site.branches[scope] }));
}

export function getPublicBranch(slug: string, language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get(`/api/public/branches/${encodeURIComponent(slug)}${languageQuery(language)}`, { responseSchema: publicBranchResponseSchema });
}

export function getPublicShowcases(language: PublicLanguage, homepageOnly = false, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return getPublicSite(language, client).then((site) => ({
    showcases: homepageOnly
      ? site.showcases.filter((showcase) => showcase.showOnHomepage).slice(0, 3)
      : site.showcases,
  }));
}

export function getPublicShowcase(slug: string, language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get(`/api/public/showcases/${encodeURIComponent(slug)}${languageQuery(language)}`, { responseSchema: publicShowcaseResponseSchema });
}
export function getPublicPageMedia(placement: PageMediaPlacement, language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return getPublicSite(language, client).then((site) => ({ items: site.pageMedia[placement] ?? [] }));
}
export function getPublicAboutTimeline(language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return getPublicSite(language, client).then((site) => ({ items: site.aboutTimeline }));
}

export function createPublicAppointment(input: CreatePublicAppointmentInput, client: Pick<ApiClient, 'post'> = getApiClient()) {
  return client.post('/api/public/appointments', { json: input, responseSchema: appointmentAcknowledgementSchema });
}
