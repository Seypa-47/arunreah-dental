import type {
  AdminBranchListQuery,
  AdminBranchRead,
  CreateBranchInput,
  PublicBranchLanguage,
  PublicBranchRead,
  UpdateBranchInput,
} from '@arunreah/shared';
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

function toPublicBranch(branch: BranchRecord, language: PublicBranchLanguage): PublicBranchRead {
  const isKhmer = language === 'km';
  const includeHero = branch.includeInHomepageHero;

  return {
    slug: branch.slug,
    name: isKhmer ? branch.nameKm : branch.nameEn,
    badge: isKhmer ? branch.badgeKm : branch.badgeEn,
    address: isKhmer ? branch.addressKm : branch.addressEn,
    cityProvince: branch.cityProvince,
    shortLocationLabel: isKhmer ? branch.shortLocationLabelKm : branch.shortLocationLabelEn,
    openingHours: isKhmer ? branch.openingHoursKm : branch.openingHoursEn,
    openingDays: isKhmer ? branch.openingDaysKm : branch.openingDaysEn,
    openingTime: branch.openingTime,
    closingTime: branch.closingTime,
    phone: branch.phone,
    secondaryPhone: branch.secondaryPhone,
    googleMapsUrl: branch.googleMapsUrl,
    heroImageKey: includeHero ? branch.heroImageKey : null,
    branchImageKey: branch.branchImageKey,
    heroHeadline: includeHero ? (isKhmer ? branch.heroHeadlineKm : branch.heroHeadlineEn) : null,
    heroSupportingText: includeHero
      ? (isKhmer ? branch.heroSupportingTextKm : branch.heroSupportingTextEn)
      : null,
    heroCtaLabel: includeHero ? (isKhmer ? branch.heroCtaLabelKm : branch.heroCtaLabelEn) : null,
    shortSummary: isKhmer ? branch.shortSummaryKm : branch.shortSummaryEn,
    featured: branch.featured,
    acceptsAppointments: branch.acceptsAppointments,
    showOnHomepage: branch.showOnHomepage,
    includeInHomepageHero: branch.includeInHomepageHero,
  };
}

export async function getAdminBranch(database: DatabaseClient, id: string): Promise<AdminBranchRead> {
  const branch = await findBranchById(database, id);
  if (!branch) throw new HttpError(404, 'NOT_FOUND', 'Branch not found.');
  return toAdminBranch(branch);
}

export async function getAdminBranchList(database: DatabaseClient, query: AdminBranchListQuery) {
  const { items, total } = await listAdminBranches(database, query);
  return {
    branches: items.map(toAdminBranch),
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

export async function getPublicBranchList(database: DatabaseClient, language: PublicBranchLanguage) {
  const branches = await listPublicBranches(database);
  return branches.map((branch) => toPublicBranch(branch, language));
}

export async function getPublicBranch(
  database: DatabaseClient,
  slug: string,
  language: PublicBranchLanguage,
) {
  const branch = await findPublicBranchBySlug(database, slug);
  if (!branch) throw new HttpError(404, 'NOT_FOUND', 'Branch not found.');
  return toPublicBranch(branch, language);
}
