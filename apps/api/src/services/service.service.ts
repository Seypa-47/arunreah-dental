import type {
  CreateServiceInput,
  ServiceLanguage,
  ServiceListQuery,
  UpdateServiceInput,
} from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import * as repo from '../repositories/service.repository';
import { HttpError } from '../shared/http-error';
import { localize } from '../shared/localize';
const admin = (s: NonNullable<Awaited<ReturnType<typeof repo.findServiceById>>>) => s;
const local = (
  s: NonNullable<Awaited<ReturnType<typeof repo.findServiceById>>>,
  lang: ServiceLanguage,
) => ({
  id: s.id,
  slug: s.slug,
  name: localize(s.nameEn, s.nameKm, lang) ?? s.nameEn,
  shortDescription: localize(s.summaryEn, s.summaryKm, lang),
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
    detailSections: await repo.getDetailSections(db, id),
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
  const [benefits, detailSections, related] = await Promise.all([
    repo.getBenefits(db, s.id),
    repo.getDetailSections(db, s.id),
    repo.getRelated(db, s.id),
  ]);
  const localizedBenefits = benefits.map((x) => ({
    title: localize(x.titleEn, x.titleKm, l) ?? x.titleEn,
    description: localize(x.descriptionEn, x.descriptionKm, l),
    icon: x.icon,
  }));
  const localizedRelated = related
    .filter((x) => x.service.status === 'PUBLISHED')
    .map((x) => local(x.service, l));
  return {
    ...local(s, l),
    detailPresentation: s.detailPresentation,
    hero: {
      eyebrow: localize(s.heroEyebrowEn, s.heroEyebrowKm, l),
      title: localize(s.heroTitleEn, s.heroTitleKm, l),
      summary: localize(s.heroSummaryEn, s.heroSummaryKm, l),
      imageKey: s.heroImageKey,
    },
    about: {
      title: localize(s.aboutTitleEn, s.aboutTitleKm, l),
      body: localize(s.aboutBodyEn, s.aboutBodyKm, l),
      imageKey: s.aboutImageKey,
    },
    treatmentAtAGlance: {
      duration: localize(s.durationEn, s.durationKm, l),
      recovery: localize(s.recoveryEn, s.recoveryKm, l),
      visits: localize(s.visitsEn, s.visitsKm, l),
      consultation: localize(s.consultationEn, s.consultationKm, l),
    },
    editorial: {
      label: localize(s.editorialLabelEn, s.editorialLabelKm, l),
      title: localize(s.editorialTitleEn, s.editorialTitleKm, l),
    },
    benefits: localizedBenefits,
    detailSections: detailSections.map((section) => ({
      sectionType: section.sectionType,
      heading: localize(section.headingEn, section.headingKm, l),
      body: localize(section.bodyEn, section.bodyKm, l),
      imageKey: section.imageKey,
      displayOrder: section.displayOrder,
    })),
    relatedServices: localizedRelated,
    cta: {
      title: localize(s.ctaTitleEn, s.ctaTitleKm, l),
      description: localize(s.ctaDescriptionEn, s.ctaDescriptionKm, l),
      primaryLabel: localize(s.primaryCtaLabelEn, s.primaryCtaLabelKm, l),
      secondaryLabel: localize(s.secondaryCtaLabelEn, s.secondaryCtaLabelKm, l),
    },
    seo: {
      title: localize(s.metaTitleEn, s.metaTitleKm, l),
      description: localize(s.metaDescriptionEn, s.metaDescriptionKm, l),
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
