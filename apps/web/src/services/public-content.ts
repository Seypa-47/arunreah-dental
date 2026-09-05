import type {
  ClinicSettingsPublicRead,
  ContactSettingsPublicRead,
  CreatePublicAppointmentInput,
} from '@arunreah/shared';
import { getApiClient, type ApiClient } from '@/lib/api';

export type PublicLanguage = 'en' | 'km';

export type PublicServiceSummary = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  listingThumbnailKey: string | null;
  category: string | null;
  featured: boolean;
};

export type PublicServiceDetail = PublicServiceSummary & {
  hero: { eyebrow: string | null; title: string | null; summary: string | null; imageKey: string | null };
  about: { title: string | null; body: string | null; imageKey: string | null };
  treatmentAtAGlance: { duration: string | null; recovery: string | null; visits: string | null; consultation: string | null };
  benefits: { title: string; description: string | null; icon: string | null }[];
  relatedServices: PublicServiceSummary[];
  cta: { title: string | null; description: string | null; primaryLabel: string | null; secondaryLabel: string | null };
  seo: { title: string | null; description: string | null };
};

export type PublicDoctorSummary = {
  id: string;
  slug: string;
  name: string;
  title: string | null;
  specialty: string | null;
  shortBio: string | null;
  photoKey: string | null;
  featured: boolean;
};

export type PublicDoctorDetail = PublicDoctorSummary & {
  about: string | null;
  statistics: { yearsExperience: number | null; successfulProcedures: number | null; patientSatisfaction: number | null };
  expertise: { title: string; displayOrder: number }[];
  education: { qualification: string; institution: string; yearLabel: string | null; displayOrder: number }[];
  relatedDoctors: PublicDoctorSummary[];
};

export type PublicBranch = {
  id: string;
  slug: string;
  name: string;
  badge: string | null;
  address: string;
  cityProvince: string | null;
  shortLocationLabel: string | null;
  openingHours: string | null;
  openingDays: string | null;
  openingTime: string | null;
  closingTime: string | null;
  phone: string;
  secondaryPhone: string | null;
  googleMapsUrl: string | null;
  heroImageKey: string | null;
  branchImageKey: string | null;
  heroHeadline: string | null;
  heroSupportingText: string | null;
  heroCtaLabel: string | null;
  shortSummary: string | null;
  featured: boolean;
  acceptsAppointments: boolean;
  showOnHomepage: boolean;
  includeInHomepageHero: boolean;
};

export type PublicShowcaseSummary = {
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  coverImageKey: string | null;
  showOnHomepage: boolean;
};

export type PublicShowcaseDetail = PublicShowcaseSummary & {
  body: string | null;
  sections: { sectionType: 'TEXT' | 'IMAGE' | 'QUOTE'; heading: string | null; body: string | null; imageKey: string | null; displayOrder: number }[];
  relatedShowcases: PublicShowcaseSummary[];
  seo: { title: string | null; description: string | null };
};

export type AppointmentAcknowledgement = {
  reference: string;
  status: 'PENDING';
  message: string;
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
  return client.get<{ clinic: ClinicSettingsPublicRead }>('/api/public/clinic').then((response) => response.clinic);
}

export function getPublicContact(client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get<{ contact: ContactSettingsPublicRead }>('/api/public/contact').then((response) => response.contact);
}

export function getPublicServices(language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get<{ services: PublicServiceSummary[] }>(`/api/public/services${languageQuery(language)}`);
}

export function getPublicService(slug: string, language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get<{ service: PublicServiceDetail }>(`/api/public/services/${encodeURIComponent(slug)}${languageQuery(language)}`);
}

export function getPublicDoctors(language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get<{ doctors: PublicDoctorSummary[] }>(`/api/public/doctors${languageQuery(language)}`);
}

export function getPublicDoctor(slug: string, language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get<{ doctor: PublicDoctorDetail }>(`/api/public/doctors/${encodeURIComponent(slug)}${languageQuery(language)}`);
}

export function getPublicBranches(language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get<{ branches: PublicBranch[] }>(`/api/public/branches${languageQuery(language)}`);
}

export function getPublicBranch(slug: string, language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get<{ branch: PublicBranch }>(`/api/public/branches/${encodeURIComponent(slug)}${languageQuery(language)}`);
}

export function getPublicShowcases(language: PublicLanguage, homepageOnly = false, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get<{ showcases: PublicShowcaseSummary[] }>(`/api/public/showcases${languageQuery(language, homepageOnly ? { homepage: true } : undefined)}`);
}

export function getPublicShowcase(slug: string, language: PublicLanguage, client: Pick<ApiClient, 'get'> = getApiClient()) {
  return client.get<{ showcase: PublicShowcaseDetail }>(`/api/public/showcases/${encodeURIComponent(slug)}${languageQuery(language)}`);
}

export function createPublicAppointment(input: CreatePublicAppointmentInput, client: Pick<ApiClient, 'post'> = getApiClient()) {
  return client.post<AppointmentAcknowledgement>('/api/public/appointments', { json: input });
}
