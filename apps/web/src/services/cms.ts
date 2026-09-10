import type { AdminBranchListQuery, AdminBranchRead, AdminDoctorListQuery, AdminShowcaseListQuery, ClinicSettingsAdminRead, ContactSettingsAdminRead, CreateAboutTimelineInput, CreateBranchInput, CreateDoctorInput, CreatePageMediaInput, CreateServiceInput, CreateShowcaseInput, PageMediaPlacement, ServiceListQuery, UpdateAboutTimelineInput, UpdateBranchInput, UpdateClinicSettingsInput, UpdateContactSettingsInput, UpdateDoctorInput, UpdatePageMediaInput, UpdateServiceInput, UpdateShowcaseInput } from '@arunreah/shared';
import { getApiClient, type ApiClient } from '@/lib/api';

type CmsClient = Pick<ApiClient, 'delete' | 'get' | 'patch' | 'post'>;
const client = () => getApiClient();
export type CmsListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CmsList<T> = {
  items: T[];
  meta: CmsListMeta;
};

export type AdminServiceRecord = { id: string; slug: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; featured: boolean; displayOrder: number; nameEn: string; nameKm: string; summaryEn: string | null; summaryKm: string | null; descriptionEn: string | null; descriptionKm: string | null; imageKey: string | null; category: string | null; editorialLabelEn: string | null; editorialLabelKm: string | null; editorialTitleEn: string | null; editorialTitleKm: string | null; detailPresentation: 'STANDARD' | 'JOURNEY' | 'CARE_MENU' | 'CLINICAL_SCOPE' | 'IMAGING_GUIDE' | 'PROBLEM_TO_CARE' | 'FAMILY_CARE'; createdAt: string; updatedAt: string };
export type AdminServiceDetail = AdminServiceRecord & {
  benefits: CreateServiceInput['benefits'];
  detailSections: CreateServiceInput['detailSections'];
  relatedServiceIds: string[];
};
export type AdminDoctorRecord = { id: string; slug: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; featured: boolean; displayOrder: number; nameEn: string; nameKm: string; titleEn: string | null; titleKm: string | null; specialtyEn: string | null; specialtyKm: string | null; shortBioEn: string | null; shortBioKm: string | null; aboutEn: string | null; aboutKm: string | null; photoKey: string | null; yearsExperience: number | null; successfulProcedures: number | null; patientSatisfaction: number | null; phone: string | null; createdAt: string; updatedAt: string };
export type AdminDoctorDetail = AdminDoctorRecord & { expertise: { id: string; titleEn: string; titleKm: string; displayOrder: number }[]; education: { id: string; qualificationEn: string; qualificationKm: string; institutionEn: string; institutionKm: string; yearLabel: string | null; displayOrder: number }[]; relatedDoctorIds: string[] };
export type AdminShowcaseRecord = { id: string; slug: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; showOnHomepage: boolean; displayOrder: number; titleEn: string; titleKm: string; categoryEn: string | null; categoryKm: string | null; summaryEn: string | null; summaryKm: string | null; bodyEn: string | null; bodyKm: string | null; coverImageKey: string | null; metaTitleEn: string | null; metaTitleKm: string | null; metaDescriptionEn: string | null; metaDescriptionKm: string | null; createdAt: string; updatedAt: string };
export type AdminShowcaseDetail = AdminShowcaseRecord & { sections: { id?: string; sectionType: 'TEXT' | 'IMAGE' | 'QUOTE'; headingEn: string | null; headingKm: string | null; bodyEn: string | null; bodyKm: string | null; imageKey: string | null; displayOrder: number }[]; relatedShowcaseIds: string[] };
export type AdminPageMediaRecord = { id: string; placement: PageMediaPlacement; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; titleEn: string | null; titleKm: string | null; bodyEn: string | null; bodyKm: string | null; imageKey: string; displayOrder: number; createdAt: string; updatedAt: string };
export type AdminAboutTimelineRecord = { id: string; year: number; titleEn: string; titleKm: string; bodyEn: string; bodyKm: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; displayOrder: number; createdAt: string; updatedAt: string };

/** Stable, normalized query string for both cache keys and API requests. */
export function normalizeCmsListQuery(query: Record<string, string | number | boolean | undefined>): string {
  const parameters = new URLSearchParams();
  Object.entries(query).filter(([, value]) => value !== undefined && value !== '').sort(([a], [b]) => a.localeCompare(b)).forEach(([key, value]) => parameters.set(key, String(value)));
  const result = parameters.toString();
  return result ? `?${result}` : '';
}

async function list<T>(path: string, api: CmsClient = client()) { return api.get<T>(path, { authenticated: true }); }
async function create<T, Input>(path: string, input: Input, api: CmsClient = client()) { return api.post<T>(path, { authenticated: true, json: input }); }
async function update<T, Input>(path: string, input: Input, api: CmsClient = client()) { return api.patch<T>(path, { authenticated: true, json: input }); }
async function remove(path: string, api: CmsClient = client()) { return api.delete<{ deleted: boolean }>(path, { authenticated: true }); }
const byId = (path: string, id: string) => `${path}/${encodeURIComponent(id)}`;

export const cmsApi = {
  branches: { create: (input: CreateBranchInput) => create<{ branch: AdminBranchRead }, CreateBranchInput>('/api/admin/branches', input), delete: (id: string) => remove(byId('/api/admin/branches', id)), get: (id: string) => list<{ branch: AdminBranchRead }>(byId('/api/admin/branches', id)), list: async (query: Partial<AdminBranchListQuery> = {}) => { const result = await list<{ branches: AdminBranchRead[]; meta: CmsListMeta }>(`/api/admin/branches${normalizeCmsListQuery(query)}`); return { items: result.branches, meta: result.meta } satisfies CmsList<AdminBranchRead>; }, update: (id: string, input: UpdateBranchInput) => update<{ branch: AdminBranchRead }, UpdateBranchInput>(byId('/api/admin/branches', id), input) },
  clinic: { get: () => list<{ clinic: ClinicSettingsAdminRead }>('/api/admin/clinic'), update: (input: UpdateClinicSettingsInput) => update<{ clinic: ClinicSettingsAdminRead }, UpdateClinicSettingsInput>('/api/admin/clinic', input) },
  contact: { get: () => list<{ contact: ContactSettingsAdminRead }>('/api/admin/contact'), update: (input: UpdateContactSettingsInput) => update<{ contact: ContactSettingsAdminRead }, UpdateContactSettingsInput>('/api/admin/contact', input) },
  doctors: { create: (input: CreateDoctorInput) => create<{ doctor: AdminDoctorRecord }, CreateDoctorInput>('/api/admin/doctors', input), delete: (id: string) => remove(byId('/api/admin/doctors', id)), get: (id: string) => list<{ doctor: AdminDoctorDetail }>(byId('/api/admin/doctors', id)), list: async (query: Partial<AdminDoctorListQuery> = {}) => { const result = await list<{ doctors: AdminDoctorRecord[]; meta: CmsListMeta }>(`/api/admin/doctors${normalizeCmsListQuery(query)}`); return { items: result.doctors, meta: result.meta } satisfies CmsList<AdminDoctorRecord>; }, update: (id: string, input: UpdateDoctorInput) => update<{ doctor: AdminDoctorRecord }, UpdateDoctorInput>(byId('/api/admin/doctors', id), input) },
  services: { create: (input: CreateServiceInput) => create<{ service: AdminServiceRecord }, CreateServiceInput>('/api/admin/services', input), delete: (id: string) => remove(byId('/api/admin/services', id)), get: (id: string) => list<{ service: AdminServiceDetail }>(byId('/api/admin/services', id)), list: async (query: Partial<ServiceListQuery> = {}) => { const result = await list<{ services: AdminServiceRecord[]; meta: CmsListMeta }>(`/api/admin/services${normalizeCmsListQuery(query)}`); return { items: result.services, meta: result.meta } satisfies CmsList<AdminServiceRecord>; }, update: (id: string, input: UpdateServiceInput & Partial<CreateServiceInput>) => update<{ service: AdminServiceRecord }, UpdateServiceInput & Partial<CreateServiceInput>>(byId('/api/admin/services', id), input) },
  showcases: { create: (input: CreateShowcaseInput) => create<{ showcase: AdminShowcaseRecord }, CreateShowcaseInput>('/api/admin/showcases', input), delete: (id: string) => remove(byId('/api/admin/showcases', id)), get: (id: string) => list<{ showcase: AdminShowcaseDetail }>(byId('/api/admin/showcases', id)), list: async (query: Partial<AdminShowcaseListQuery> = {}) => { const result = await list<{ showcases: AdminShowcaseRecord[]; meta: CmsListMeta }>(`/api/admin/showcases${normalizeCmsListQuery(query)}`); return { items: result.showcases, meta: result.meta } satisfies CmsList<AdminShowcaseRecord>; }, update: (id: string, input: UpdateShowcaseInput) => update<{ showcase: AdminShowcaseRecord }, UpdateShowcaseInput>(byId('/api/admin/showcases', id), input) },
  pageMedia: { create: (input: CreatePageMediaInput) => create<{ item: AdminPageMediaRecord }, CreatePageMediaInput>('/api/admin/page-media', input), delete: (id: string) => remove(byId('/api/admin/page-media', id)), list: (placement: PageMediaPlacement) => list<{ items: AdminPageMediaRecord[] }>(`/api/admin/page-media${normalizeCmsListQuery({ placement })}`), update: (id: string, input: UpdatePageMediaInput) => update<{ item: AdminPageMediaRecord }, UpdatePageMediaInput>(byId('/api/admin/page-media', id), input) },
  aboutTimeline: { create: (input: CreateAboutTimelineInput) => create<{ item: AdminAboutTimelineRecord }, CreateAboutTimelineInput>('/api/admin/about-timeline', input), delete: (id: string) => remove(byId('/api/admin/about-timeline', id)), list: () => list<{ items: AdminAboutTimelineRecord[] }>('/api/admin/about-timeline'), update: (id: string, input: UpdateAboutTimelineInput) => update<{ item: AdminAboutTimelineRecord }, UpdateAboutTimelineInput>(byId('/api/admin/about-timeline', id), input) },
};
