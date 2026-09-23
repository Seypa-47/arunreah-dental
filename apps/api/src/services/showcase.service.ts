import type {
  AdminShowcaseListQuery,
  CreateShowcaseInput,
  ShowcaseLanguage,
  UpdateShowcaseInput,
} from '@arunreah/shared';
import { defaultImagePresentation, type ImagePresentation } from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import * as repository from '../repositories/showcase.repository';
import { HttpError } from '../shared/http-error';
import { localize as localizeText } from '../shared/localize';
import { listForOwners } from '../repositories/image-presentation.repository';

type ShowcaseRecord = NonNullable<Awaited<ReturnType<typeof repository.findShowcaseById>>>;

function presentationFor(rows: Awaited<ReturnType<typeof listForOwners>>, ownerId: string): ImagePresentation {
  const row = rows.find((item) => item.ownerId === ownerId && item.slot === 'PRIMARY');
  return row ? { positionX: row.positionX, positionY: row.positionY, zoom: row.zoom } : defaultImagePresentation;
}

function localize(showcase: ShowcaseRecord, language: ShowcaseLanguage, presentations: Awaited<ReturnType<typeof listForOwners>> = []) {
  return {
    slug: showcase.slug,
    title: localizeText(showcase.titleEn, showcase.titleKm, language) ?? showcase.titleEn,
    summary: localizeText(showcase.excerptEn, showcase.excerptKm, language),
    category: localizeText(showcase.categoryEn, showcase.categoryKm, language),
    coverImageKey: showcase.coverImageKey,
    coverImagePresentation: presentationFor(presentations, showcase.id),
    showOnHomepage: showcase.showOnHomepage,
  };
}

function toAdminShowcase(showcase: ShowcaseRecord, coverImagePresentation: ImagePresentation = defaultImagePresentation) {
  return {
    id: showcase.id,
    slug: showcase.slug,
    status: showcase.status,
    showOnHomepage: showcase.showOnHomepage,
    displayOrder: showcase.displayOrder,
    titleEn: showcase.titleEn,
    titleKm: showcase.titleKm,
    categoryEn: showcase.categoryEn,
    categoryKm: showcase.categoryKm,
    summaryEn: showcase.excerptEn,
    summaryKm: showcase.excerptKm,
    bodyEn: showcase.bodyEn,
    bodyKm: showcase.bodyKm,
    coverImageKey: showcase.coverImageKey,
    coverImagePresentation,
    metaTitleEn: showcase.metaTitleEn,
    metaTitleKm: showcase.metaTitleKm,
    metaDescriptionEn: showcase.metaDescriptionEn,
    metaDescriptionKm: showcase.metaDescriptionKm,
    createdAt: showcase.createdAt,
    updatedAt: showcase.updatedAt,
  };
}

async function toAdminShowcaseWithPresentation(database: DatabaseClient, showcase: ShowcaseRecord) {
  const presentations = await listForOwners(database, [{ ownerType: 'SHOWCASE', ownerId: showcase.id, slot: 'PRIMARY' }]);
  return toAdminShowcase(showcase, presentationFor(presentations, showcase.id));
}

async function validateRelated(
  database: DatabaseClient,
  showcaseId: string | undefined,
  relatedShowcaseIds: string[] | undefined,
) {
  if (relatedShowcaseIds === undefined) return;
  if (new Set(relatedShowcaseIds).size !== relatedShowcaseIds.length) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Related showcases must be unique.');
  }
  if (showcaseId && relatedShowcaseIds.includes(showcaseId)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'A showcase cannot relate to itself.');
  }
  const found = await repository.showcasesExist(database, relatedShowcaseIds);
  if (found.length !== relatedShowcaseIds.length) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'A related showcase does not exist.');
  }
}

export async function createManagedShowcase(database: DatabaseClient, input: CreateShowcaseInput) {
  if (await repository.findShowcaseBySlug(database, input.slug)) {
    throw new HttpError(409, 'CONFLICT', 'A showcase with this slug already exists.');
  }
  await validateRelated(database, undefined, input.relatedShowcaseIds);
  const showcase = await repository.createShowcase(database, input);
  if (!showcase) throw new Error('Created showcase could not be loaded.');
  return toAdminShowcaseWithPresentation(database, showcase);
}

export async function updateManagedShowcase(
  database: DatabaseClient,
  id: string,
  input: UpdateShowcaseInput,
) {
  const current = await repository.findShowcaseById(database, id);
  if (!current) throw new HttpError(404, 'NOT_FOUND', 'Showcase not found.');
  if (input.slug !== undefined) {
    const existing = await repository.findShowcaseBySlug(database, input.slug);
    if (existing && existing.id !== id) {
      throw new HttpError(409, 'CONFLICT', 'A showcase with this slug already exists.');
    }
  }
  await validateRelated(database, id, input.relatedShowcaseIds);
  const showcase = await repository.updateShowcase(database, id, input);
  if (!showcase) throw new Error('Updated showcase could not be loaded.');
  return toAdminShowcaseWithPresentation(database, showcase);
}

async function sectionsWithPresentation(database: DatabaseClient, showcaseId: string) {
  const sections = await repository.getSections(database, showcaseId);
  const presentations = await listForOwners(database, sections.map((section) => ({ ownerType: 'SHOWCASE_SECTION' as const, ownerId: section.id, slot: 'PRIMARY' })));
  return sections.map((section) => ({ ...section, imagePresentation: presentationFor(presentations, section.id) }));
}

export async function getAdminShowcase(database: DatabaseClient, id: string) {
  const showcase = await repository.findShowcaseById(database, id);
  if (!showcase) throw new HttpError(404, 'NOT_FOUND', 'Showcase not found.');
  const [sections, relatedShowcases, presentations] = await Promise.all([
    sectionsWithPresentation(database, id),
    repository.getRelatedShowcases(database, id),
    listForOwners(database, [{ ownerType: 'SHOWCASE', ownerId: id, slot: 'PRIMARY' }]),
  ]);
  return {
    ...toAdminShowcase(showcase, presentationFor(presentations, id)),
    sections,
    relatedShowcaseIds: relatedShowcases.map((item) => item.relation.relatedShowcaseId),
  };
}

export async function getAdminShowcaseList(
  database: DatabaseClient,
  query: AdminShowcaseListQuery,
) {
  const { items, total } = await repository.listAdminShowcases(database, query);
  const presentations = await listForOwners(database, items.map((showcase) => ({ ownerType: 'SHOWCASE' as const, ownerId: showcase.id, slot: 'PRIMARY' })));
  return {
    showcases: items.map((showcase) => toAdminShowcase(showcase, presentationFor(presentations, showcase.id))),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getPublicShowcaseList(
  database: DatabaseClient,
  language: ShowcaseLanguage,
  homepageOnly = false,
) {
  const showcases = await repository.listPublicShowcases(database, homepageOnly);
  const visible = homepageOnly ? showcases.slice(0, 3) : showcases;
  const presentations = await listForOwners(database, visible.map((showcase) => ({ ownerType: 'SHOWCASE' as const, ownerId: showcase.id, slot: 'PRIMARY' })));
  return visible.map((showcase) => localize(showcase, language, presentations));
}

export async function getPublicShowcase(
  database: DatabaseClient,
  slug: string,
  language: ShowcaseLanguage,
) {
  const showcase = await repository.findPublicShowcaseBySlug(database, slug);
  if (!showcase) throw new HttpError(404, 'NOT_FOUND', 'Showcase not found.');
  const [sections, relatedShowcases, presentations] = await Promise.all([
    sectionsWithPresentation(database, showcase.id),
    repository.getRelatedShowcases(database, showcase.id),
    listForOwners(database, [{ ownerType: 'SHOWCASE', ownerId: showcase.id, slot: 'PRIMARY' }]),
  ]);
  return {
    ...localize(showcase, language, presentations),
    body: localizeText(showcase.bodyEn, showcase.bodyKm, language),
    sections: sections.map((section) => ({
      sectionType: section.sectionType,
      heading: localizeText(section.headingEn, section.headingKm, language),
      body: localizeText(section.bodyEn, section.bodyKm, language),
      imageKey: section.imageKey,
      imagePresentation: section.imagePresentation,
      displayOrder: section.displayOrder,
    })),
    relatedShowcases: relatedShowcases
      .filter((item) => item.showcase.status === 'PUBLISHED')
      .map((item) => localize(item.showcase, language)),
    seo: {
      title: localizeText(showcase.metaTitleEn, showcase.metaTitleKm, language),
      description: localizeText(showcase.metaDescriptionEn, showcase.metaDescriptionKm, language),
    },
  };
}

export async function deleteManagedShowcase(database: DatabaseClient, id: string) {
  const showcase = await repository.findShowcaseById(database, id);
  if (!showcase) throw new HttpError(404, 'NOT_FOUND', 'Showcase not found.');
  await repository.deleteShowcase(database, id);
}
