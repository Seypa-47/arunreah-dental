import type {
  AdminBranchListQuery,
  AdminBranchRead,
  CreateBranchInput,
  PublicBranchLanguage,
  PublicBranchRead,
  UpdateBranchInput,
} from '@arunreah/shared';
import { defaultImagePresentation, type ImagePresentation } from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import {
  countAppointmentsForBranch,
  createBranch,
  deleteBranch,
  findBranchById,
  findBranchBySlug,
  findPublicBranchBySlug,
  listAdminBranches,
  listPublicBranches,
  updateBranch,
} from '../repositories/branch.repository';
import { HttpError } from '../shared/http-error';
import { localize } from '../shared/localize';
import { listForOwners } from '../repositories/image-presentation.repository';

type BranchRecord = NonNullable<Awaited<ReturnType<typeof findBranchById>>>;

function toAdminBranch(branch: BranchRecord): AdminBranchRead {
  return {
    id: branch.id,
    slug: branch.slug,
    status: branch.status,
    displayOrder: branch.displayOrder,
    nameEn: branch.nameEn,
    nameKm: branch.nameKm,
    badgeEn: branch.badgeEn,
    badgeKm: branch.badgeKm,
    addressEn: branch.addressEn,
    addressKm: branch.addressKm,
    cityProvince: branch.cityProvince,
    shortLocationLabelEn: branch.shortLocationLabelEn,
    shortLocationLabelKm: branch.shortLocationLabelKm,
    openingHoursEn: branch.openingHoursEn,
    openingHoursKm: branch.openingHoursKm,
    openingDaysEn: branch.openingDaysEn,
    openingDaysKm: branch.openingDaysKm,
    openingTime: branch.openingTime,
    closingTime: branch.closingTime,
    phone: branch.phone,
    secondaryPhone: branch.secondaryPhone,
    googleMapsUrl: branch.googleMapsUrl,
    heroImageKey: branch.heroImageKey,
    branchImageKey: branch.branchImageKey,
    heroHeadlineEn: branch.heroHeadlineEn,
    heroHeadlineKm: branch.heroHeadlineKm,
    heroSupportingTextEn: branch.heroSupportingTextEn,
    heroSupportingTextKm: branch.heroSupportingTextKm,
    heroCtaLabelEn: branch.heroCtaLabelEn,
    heroCtaLabelKm: branch.heroCtaLabelKm,
    shortSummaryEn: branch.shortSummaryEn,
    shortSummaryKm: branch.shortSummaryKm,
    featured: branch.featured,
    acceptsAppointments: branch.acceptsAppointments,
    showOnBranchesPage: branch.showOnBranchesPage,
    showOnHomepage: branch.showOnHomepage,
    includeInHomepageHero: branch.includeInHomepageHero,
    createdAt: branch.createdAt,
    updatedAt: branch.updatedAt,
  };
}

function presentationFor(rows: Awaited<ReturnType<typeof listForOwners>>, ownerId: string, slot: string): ImagePresentation {
  const row = rows.find((item) => item.ownerId === ownerId && item.slot === slot);
  return row ? { positionX: row.positionX, positionY: row.positionY, zoom: row.zoom } : defaultImagePresentation;
}

function toPublicBranch(branch: BranchRecord, language: PublicBranchLanguage, presentations: Awaited<ReturnType<typeof listForOwners>> = []): PublicBranchRead {
  const includeHero = branch.includeInHomepageHero;

  return {
    id: branch.id,
    slug: branch.slug,
    name: localize(branch.nameEn, branch.nameKm, language) ?? branch.nameEn,
    badge: localize(branch.badgeEn, branch.badgeKm, language),
    address: localize(branch.addressEn, branch.addressKm, language) ?? branch.addressEn,
    cityProvince: branch.cityProvince,
    shortLocationLabel: localize(branch.shortLocationLabelEn, branch.shortLocationLabelKm, language),
    openingHours: localize(branch.openingHoursEn, branch.openingHoursKm, language),
    openingDays: localize(branch.openingDaysEn, branch.openingDaysKm, language),
    openingTime: branch.openingTime,
    closingTime: branch.closingTime,
    phone: branch.phone,
    secondaryPhone: branch.secondaryPhone,
    googleMapsUrl: branch.googleMapsUrl,
    heroImageKey: includeHero ? branch.heroImageKey : null,
    branchImageKey: branch.branchImageKey,
    heroImagePresentation: presentationFor(presentations, branch.id, 'HERO'),
    branchImagePresentation: presentationFor(presentations, branch.id, 'PRIMARY'),
    heroHeadline: includeHero ? localize(branch.heroHeadlineEn, branch.heroHeadlineKm, language) : null,
    heroSupportingText: includeHero ? localize(branch.heroSupportingTextEn, branch.heroSupportingTextKm, language) : null,
    heroCtaLabel: includeHero ? localize(branch.heroCtaLabelEn, branch.heroCtaLabelKm, language) : null,
    shortSummary: localize(branch.shortSummaryEn, branch.shortSummaryKm, language),
    featured: branch.featured,
    acceptsAppointments: branch.acceptsAppointments,
    showOnHomepage: branch.showOnHomepage,
    includeInHomepageHero: branch.includeInHomepageHero,
  };
}

/** Admin editors need the saved framing so they can show and keep it. */
async function withBranchPresentations(database: DatabaseClient, branches: AdminBranchRead[]): Promise<AdminBranchRead[]> {
  const presentations = await listForOwners(database, branches.flatMap((branch) => [
    { ownerType: 'BRANCH' as const, ownerId: branch.id, slot: 'HERO' },
    { ownerType: 'BRANCH' as const, ownerId: branch.id, slot: 'PRIMARY' },
  ]));
  return branches.map((branch) => ({
    ...branch,
    heroImagePresentation: presentationFor(presentations, branch.id, 'HERO'),
    branchImagePresentation: presentationFor(presentations, branch.id, 'PRIMARY'),
  }));
}

export async function getAdminBranch(database: DatabaseClient, id: string): Promise<AdminBranchRead> {
  const branch = await findBranchById(database, id);
  if (!branch) throw new HttpError(404, 'NOT_FOUND', 'Branch not found.');
  const [withPresentation] = await withBranchPresentations(database, [toAdminBranch(branch)]);
  return withPresentation ?? toAdminBranch(branch);
}

export async function getAdminBranchList(database: DatabaseClient, query: AdminBranchListQuery) {
  const { items, total } = await listAdminBranches(database, query);
  return {
    branches: await withBranchPresentations(database, items.map(toAdminBranch)),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function createManagedBranch(database: DatabaseClient, input: CreateBranchInput) {
  if (await findBranchBySlug(database, input.slug)) {
    throw new HttpError(409, 'CONFLICT', 'A branch with this slug already exists.');
  }

  const branch = await createBranch(database, input);
  if (!branch) throw new Error('Created branch could not be loaded.');
  return toAdminBranch(branch);
}

export async function updateManagedBranch(
  database: DatabaseClient,
  id: string,
  input: UpdateBranchInput,
) {
  const current = await findBranchById(database, id);
  if (!current) throw new HttpError(404, 'NOT_FOUND', 'Branch not found.');

  if (input.slug !== undefined) {
    const existing = await findBranchBySlug(database, input.slug);
    if (existing && existing.id !== id) {
      throw new HttpError(409, 'CONFLICT', 'A branch with this slug already exists.');
    }
  }

  const branch = await updateBranch(database, id, input);
  if (!branch) throw new Error('Updated branch could not be loaded.');
  return toAdminBranch(branch);
}

export async function deleteManagedBranch(database: DatabaseClient, id: string) {
  const branch = await findBranchById(database, id);
  if (!branch) throw new HttpError(404, 'NOT_FOUND', 'Branch not found.');

  if ((await countAppointmentsForBranch(database, id)) > 0) {
    throw new HttpError(
      409,
      'CONFLICT',
      'This branch is referenced by appointment history and cannot be deleted. Deactivate it instead.',
    );
  }

  await deleteBranch(database, id);
}

export async function getPublicBranchList(
  database: DatabaseClient,
  language: PublicBranchLanguage,
  scope: 'branches' | 'landing' | 'appointments',
) {
  const branches = await listPublicBranches(database, scope);
  const presentations = await listForOwners(database, branches.flatMap((branch) => [
    { ownerType: 'BRANCH' as const, ownerId: branch.id, slot: 'HERO' },
    { ownerType: 'BRANCH' as const, ownerId: branch.id, slot: 'PRIMARY' },
  ]));
  return branches.map((branch) => toPublicBranch(branch, language, presentations));
}

export async function getPublicBranch(
  database: DatabaseClient,
  slug: string,
  language: PublicBranchLanguage,
) {
  const branch = await findPublicBranchBySlug(database, slug);
  if (!branch) throw new HttpError(404, 'NOT_FOUND', 'Branch not found.');
  const presentations = await listForOwners(database, [
    { ownerType: 'BRANCH', ownerId: branch.id, slot: 'HERO' },
    { ownerType: 'BRANCH', ownerId: branch.id, slot: 'PRIMARY' },
  ]);
  return toPublicBranch(branch, language, presentations);
}
