import type {
  AdminShowcaseListQuery,
  CreateShowcaseInput,
  ShowcaseLanguage,
  UpdateShowcaseInput,
} from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import * as repository from '../repositories/showcase.repository';
import { HttpError } from '../shared/http-error';

type ShowcaseRecord = NonNullable<Awaited<ReturnType<typeof repository.findShowcaseById>>>;

function localize(showcase: ShowcaseRecord, language: ShowcaseLanguage) {
  const isKhmer = language === 'km';
  return {
    slug: showcase.slug,
    title: isKhmer ? showcase.titleKm : showcase.titleEn,
    summary: isKhmer ? showcase.excerptKm : showcase.excerptEn,
    category: isKhmer ? showcase.categoryKm : showcase.categoryEn,
    coverImageKey: showcase.coverImageKey,
    showOnHomepage: showcase.showOnHomepage,
  };
}

function toAdminShowcase(showcase: ShowcaseRecord) {
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
    metaTitleEn: showcase.metaTitleEn,
    metaTitleKm: showcase.metaTitleKm,
    metaDescriptionEn: showcase.metaDescriptionEn,
    metaDescriptionKm: showcase.metaDescriptionKm,
    createdAt: showcase.createdAt,
    updatedAt: showcase.updatedAt,
  };
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
  return toAdminShowcase(showcase);
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
  return toAdminShowcase(showcase);
}

export async function getAdminShowcase(database: DatabaseClient, id: string) {
  const showcase = await repository.findShowcaseById(database, id);
  if (!showcase) throw new HttpError(404, 'NOT_FOUND', 'Showcase not found.');
  const [sections, relatedShowcases] = await Promise.all([
    repository.getSections(database, id),
    repository.getRelatedShowcases(database, id),
  ]);
  return {
    ...toAdminShowcase(showcase),
    sections,
    relatedShowcaseIds: relatedShowcases.map((item) => item.relation.relatedShowcaseId),
  };
}

export async function getAdminShowcaseList(
  database: DatabaseClient,
  query: AdminShowcaseListQuery,
) {
  const { items, total } = await repository.listAdminShowcases(database, query);
  return {
    showcases: items.map(toAdminShowcase),
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
  return (homepageOnly ? showcases.slice(0, 3) : showcases).map((showcase) =>
    localize(showcase, language),
  );
}

export async function getPublicShowcase(
  database: DatabaseClient,
  slug: string,
  language: ShowcaseLanguage,
) {
  const showcase = await repository.findPublicShowcaseBySlug(database, slug);
  if (!showcase) throw new HttpError(404, 'NOT_FOUND', 'Showcase not found.');
  const isKhmer = language === 'km';
  const [sections, relatedShowcases] = await Promise.all([
    repository.getSections(database, showcase.id),
    repository.getRelatedShowcases(database, showcase.id),
  ]);
  return {
    ...localize(showcase, language),
    body: isKhmer ? showcase.bodyKm : showcase.bodyEn,
    sections: sections.map((section) => ({
      sectionType: section.sectionType,
      heading: isKhmer ? section.headingKm : section.headingEn,
      body: isKhmer ? section.bodyKm : section.bodyEn,
      imageKey: section.imageKey,
      displayOrder: section.displayOrder,
    })),
    relatedShowcases: relatedShowcases
      .filter((item) => item.showcase.status === 'PUBLISHED')
      .map((item) => localize(item.showcase, language)),
    seo: {
      title: isKhmer ? showcase.metaTitleKm : showcase.metaTitleEn,
      description: isKhmer ? showcase.metaDescriptionKm : showcase.metaDescriptionEn,
    },
  };
}

export async function deleteManagedShowcase(database: DatabaseClient, id: string) {
  const showcase = await repository.findShowcaseById(database, id);
  if (!showcase) throw new HttpError(404, 'NOT_FOUND', 'Showcase not found.');
  await repository.deleteShowcase(database, id);
}
