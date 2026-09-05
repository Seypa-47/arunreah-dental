import type {
  CreateServiceInput,
  ServiceLanguage,
  ServiceListQuery,
  UpdateServiceInput,
} from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import * as repo from '../repositories/service.repository';
import { HttpError } from '../shared/http-error';
const admin = (s: NonNullable<Awaited<ReturnType<typeof repo.findServiceById>>>) => s;
const local = (
  s: NonNullable<Awaited<ReturnType<typeof repo.findServiceById>>>,
  lang: ServiceLanguage,
) => ({
  id: s.id,
  slug: s.slug,
  name: lang === 'km' ? s.nameKm : s.nameEn,
  shortDescription: lang === 'km' ? s.summaryKm : s.summaryEn,
  listingThumbnailKey: s.imageKey,
  category: s.category,
  featured: s.featured,
});
function validateNested(id: string, input: { benefits?: unknown[]; relatedServiceIds?: string[] }) {
  if (input.relatedServiceIds) {
    if (new Set(input.relatedServiceIds).size !== input.relatedServiceIds.length)
      throw new HttpError(400, 'VALIDATION_ERROR', 'Related services must be unique.');
    if (input.relatedServiceIds.includes(id))
      throw new HttpError(400, 'VALIDATION_ERROR', 'A service cannot relate to itself.');
  }
}
export async function createManagedService(db: DatabaseClient, input: CreateServiceInput) {
  if (await repo.findServiceBySlug(db, input.slug))
    throw new HttpError(409, 'CONFLICT', 'A service with this slug already exists.');
  validateNested('', input);
  const found = await repo.servicesExist(db, input.relatedServiceIds);
  if (found.length !== input.relatedServiceIds.length)
    throw new HttpError(400, 'VALIDATION_ERROR', 'A related service does not exist.');
  const s = await repo.createService(db, input);
  if (!s) throw new Error('Created service could not be loaded.');
  return admin(s);
}
export async function updateManagedService(
  db: DatabaseClient,
  id: string,
  input: UpdateServiceInput,
) {
  const current = await repo.findServiceById(db, id);
  if (!current) throw new HttpError(404, 'NOT_FOUND', 'Service not found.');
  const update = input as UpdateServiceInput & { slug?: string };
  if (update.slug) {
    const x = await repo.findServiceBySlug(db, update.slug);
    if (x && x.id !== id)
      throw new HttpError(409, 'CONFLICT', 'A service with this slug already exists.');
  }
  validateNested(id, update);
  if (update.relatedServiceIds) {
    const found = await repo.servicesExist(db, update.relatedServiceIds);
    if (found.length !== update.relatedServiceIds.length)
      throw new HttpError(400, 'VALIDATION_ERROR', 'A related service does not exist.');
  }
  const s = await repo.updateService(db, id, update);
  if (!s) throw new Error('Updated service could not be loaded.');
  return admin(s);
}
export async function getAdminService(db: DatabaseClient, id: string) {
  const s = await repo.findServiceById(db, id);
  if (!s) throw new HttpError(404, 'NOT_FOUND', 'Service not found.');
  return {
    ...admin(s),
    benefits: await repo.getBenefits(db, id),
    relatedServiceIds: (await repo.getRelated(db, id)).map((x) => x.relation.relatedServiceId),
  };
}
export async function getAdminServiceList(db: DatabaseClient, q: ServiceListQuery) {
  const r = await repo.listAdminServices(db, q);
  return {
    services: r.items.map(admin),
    meta: {
      page: q.page,
      limit: q.limit,
      total: r.total,
      totalPages: Math.ceil(r.total / q.limit),
    },
  };
}
export async function getPublicServiceList(db: DatabaseClient, l: ServiceLanguage) {
  return (await repo.listPublicServices(db)).map((s) => local(s, l));
}
export async function getPublicService(db: DatabaseClient, slug: string, l: ServiceLanguage) {
  const s = await repo.findPublicServiceBySlug(db, slug);
  if (!s) throw new HttpError(404, 'NOT_FOUND', 'Service not found.');
  const benefits = (await repo.getBenefits(db, s.id)).map((x) => ({
    title: l === 'km' ? x.titleKm : x.titleEn,
    description: l === 'km' ? x.descriptionKm : x.descriptionEn,
    icon: x.icon,
  }));
  const related = (await repo.getRelated(db, s.id))
    .filter((x) => x.service.status === 'PUBLISHED')
    .map((x) => local(x.service, l));
  return {
    ...local(s, l),
    hero: {
      eyebrow: l === 'km' ? s.heroEyebrowKm : s.heroEyebrowEn,
      title: l === 'km' ? s.heroTitleKm : s.heroTitleEn,
      summary: l === 'km' ? s.heroSummaryKm : s.heroSummaryEn,
      imageKey: s.heroImageKey,
    },
    about: {
      title: l === 'km' ? s.aboutTitleKm : s.aboutTitleEn,
      body: l === 'km' ? s.aboutBodyKm : s.aboutBodyEn,
      imageKey: s.aboutImageKey,
    },
    treatmentAtAGlance: {
      duration: l === 'km' ? s.durationKm : s.durationEn,
      recovery: l === 'km' ? s.recoveryKm : s.recoveryEn,
      visits: l === 'km' ? s.visitsKm : s.visitsEn,
      consultation: l === 'km' ? s.consultationKm : s.consultationEn,
    },
    benefits,
    relatedServices: related,
    cta: {
      title: l === 'km' ? s.ctaTitleKm : s.ctaTitleEn,
      description: l === 'km' ? s.ctaDescriptionKm : s.ctaDescriptionEn,
      primaryLabel: l === 'km' ? s.primaryCtaLabelKm : s.primaryCtaLabelEn,
      secondaryLabel: l === 'km' ? s.secondaryCtaLabelKm : s.secondaryCtaLabelEn,
    },
    seo: {
      title: l === 'km' ? s.metaTitleKm : s.metaTitleEn,
      description: l === 'km' ? s.metaDescriptionKm : s.metaDescriptionEn,
    },
  };
}
export async function deleteManagedService(db: DatabaseClient, id: string) {
  const s = await repo.findServiceById(db, id);
  if (!s) throw new HttpError(404, 'NOT_FOUND', 'Service not found.');
  if (await repo.countAppointmentsForService(db, id))
    throw new HttpError(
      409,
      'CONFLICT',
      'This service is referenced by appointment history and cannot be deleted. Unpublish it instead.',
    );
  await repo.deleteService(db, id);
}
