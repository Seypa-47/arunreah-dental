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
  PublicShowcaseDetail,
  PublicShowcaseSummary,
  TeamCategory,
} from '@arunreah/shared';
import {
  appointmentAcknowledgementSchema,
  publicAboutTimelineResponseSchema,
  publicBranchesResponseSchema,
  publicBranchResponseSchema,
  publicClinicResponseSchema,
  publicContactResponseSchema,
  publicDoctorsResponseSchema,
  publicDoctorResponseSchema,
  publicPageMediaResponseSchema,
  publicServicesResponseSchema,
  publicServiceResponseSchema,
  publicShowcasesResponseSchema,
  publicShowcaseResponseSchema,
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
  PublicShowcaseDetail,
  PublicShowcaseSummary,
};

function languageQuery(language: PublicLanguage, extra?: Record<string, string | boolean | undefined>) {
  const params = new URLSearchParams({ lang: language });
  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value !== undefined) params.set(key, String(value));
  }
  return `?${params.toString()}`;
}

export function getPublicLanguage(): PublicLanguage {
  return document.documentElement.lang.toLowerCase().startsWith('km') ? 'km' : 'en';
}

export function getPublicClinic(client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get('/api/public/clinic', { responseSchema: publicClinicResponseSchema }).then((response) => response.clinic);
}

export function getPublicContact(client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get('/api/public/contact', { responseSchema: publicContactResponseSchema }).then((response) => response.contact);
}

export function getPublicServices(language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get(`/api/public/services${languageQuery(language)}`, { responseSchema: publicServicesResponseSchema });
}

export function getPublicService(slug: string, language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get(`/api/public/services/${encodeURIComponent(slug)}${languageQuery(language)}`, { responseSchema: publicServiceResponseSchema });
}

export function getPublicDoctors(
  language: PublicLanguage,
  category?: TeamCategory,
  client: Pick<ApiClient, 'get'> = getApiClient(),
) {
  return client.get(
    `/api/public/team${languageQuery(language, { category })}`,
    { responseSchema: publicDoctorsResponseSchema },
  );
}

export function getPublicBookableDoctors(
  language: PublicLanguage,
  client: Pick<ApiClient, 'get'> = getApiClient(),
) {
  return client.get(
    `/api/public/team${languageQuery(language, { bookable: true })}`,
    { responseSchema: publicDoctorsResponseSchema },
  );
}

export function getPublicDoctor(slug: string, language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get(`/api/public/team/${encodeURIComponent(slug)}${languageQuery(language)}`, { responseSchema: publicDoctorResponseSchema });
}

export function getPublicBranches(
  language: PublicLanguage,
  scope: 'branches' | 'landing' | 'appointments' = 'branches',
  client: Pick<ApiClient, 'get'> = getApiClient(),
) {
  return client.get(`/api/public/branches${languageQuery(language, { scope })}`, { responseSchema: publicBranchesResponseSchema });
}

export function getPublicBranch(slug: string, language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get(`/api/public/branches/${encodeURIComponent(slug)}${languageQuery(language)}`, { responseSchema: publicBranchResponseSchema });
}

export function getPublicShowcases(language: PublicLanguage, homepageOnly = false, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get(`/api/public/showcases${languageQuery(language, homepageOnly ? { homepage: true } : undefined)}`, { responseSchema: publicShowcasesResponseSchema });
}

export function getPublicShowcase(slug: string, language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get(`/api/public/showcases/${encodeURIComponent(slug)}${languageQuery(language)}`, { responseSchema: publicShowcaseResponseSchema });
}
export function getPublicPageMedia(placement: PageMediaPlacement, language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get(`/api/public/page-media${languageQuery(language, { placement })}`, { responseSchema: publicPageMediaResponseSchema });
}
export function getPublicAboutTimeline(language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get(`/api/public/about-timeline${languageQuery(language)}`, { responseSchema: publicAboutTimelineResponseSchema });
}

export function createPublicAppointment(input: CreatePublicAppointmentInput, client: Pick<ApiClient, 'post'> = getApiClient()) {
  return client.post('/api/public/appointments', { json: input, responseSchema: appointmentAcknowledgementSchema });
}
