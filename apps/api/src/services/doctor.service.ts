import type {
  AdminDoctorListQuery,
  CreateDoctorInput,
  DoctorLanguage,
  ReorderDoctorsInput,
  TeamCategory,
  UpdateDoctorInput,
} from '@arunreah/shared';
import {
  defaultImagePresentation,
  isClinicalTeamCategory,
  type ImagePresentation,
} from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import * as repository from '../repositories/doctor.repository';
import * as branchRepository from '../repositories/branch.repository';
import { HttpError } from '../shared/http-error';
import { localize as localizeText } from '../shared/localize';
import { listForOwners } from '../repositories/image-presentation.repository';

type DoctorRecord = NonNullable<Awaited<ReturnType<typeof repository.findDoctorById>>>;

// Portrait source images are commonly taller than the card frame. Keep the
// face visible for records that predate focal-point metadata; any CMS-saved
// position always takes precedence.
const defaultDoctorPhotoPresentation: ImagePresentation = {
  ...defaultImagePresentation,
  positionY: 0,
};

function presentationFor(rows: Awaited<ReturnType<typeof listForOwners>>, ownerId: string): ImagePresentation {
  const row = rows.find((item) => item.ownerId === ownerId && item.slot === 'PRIMARY');
  return row ? { positionX: row.positionX, positionY: row.positionY, zoom: row.zoom } : defaultDoctorPhotoPresentation;
}

function localize(
  doctor: DoctorRecord,
  language: DoctorLanguage,
  presentations: Awaited<ReturnType<typeof listForOwners>> = [],
  branchIds: string[] = [],
) {
  return {
    id: doctor.id,
    slug: doctor.slug,
    name: localizeText(doctor.nameEn, doctor.nameKm, language) ?? doctor.nameEn,
    title: localizeText(doctor.roleEn, doctor.roleKm, language),
    specialty: localizeText(doctor.specialtyEn, doctor.specialtyKm, language),
    shortBio: localizeText(doctor.shortBioEn, doctor.shortBioKm, language),
    photoKey: doctor.photoKey,
    photoImagePresentation: presentationFor(presentations, doctor.id),
    featured: doctor.featured,
    category: doctor.category,
    bookable: doctor.bookable,
    department: localizeText(doctor.departmentEn, doctor.departmentKm, language),
    teamNote: localizeText(doctor.teamNoteEn, doctor.teamNoteKm, language),
    branchIds,
  };
}

function toAdminDoctor(doctor: DoctorRecord, branchIds: string[] = []) {
  return {
    id: doctor.id,
    slug: doctor.slug,
    status: doctor.status,
    featured: doctor.featured,
    displayOrder: doctor.displayOrder,
    nameEn: doctor.nameEn,
    nameKm: doctor.nameKm,
    titleEn: doctor.roleEn,
    titleKm: doctor.roleKm,
    specialtyEn: doctor.specialtyEn,
    specialtyKm: doctor.specialtyKm,
    shortBioEn: doctor.shortBioEn,
    shortBioKm: doctor.shortBioKm,
    aboutEn: doctor.biographyEn,
    aboutKm: doctor.biographyKm,
    photoKey: doctor.photoKey,
    yearsExperience: doctor.yearsExperience,
    successfulProcedures: doctor.successfulProcedures,
    patientSatisfaction: doctor.patientSatisfaction,
    phone: doctor.phone,
    category: doctor.category,
    bookable: doctor.bookable,
    departmentEn: doctor.departmentEn,
    departmentKm: doctor.departmentKm,
    teamNoteEn: doctor.teamNoteEn,
    teamNoteKm: doctor.teamNoteKm,
    branchIds,
    createdAt: doctor.createdAt,
    updatedAt: doctor.updatedAt,
  };
}

function toAdminProfileItem(
  item: Awaited<ReturnType<typeof repository.getProfileItems>>[number],
) {
  return {
    id: item.id,
    kind: item.kind,
    icon: item.icon,
    titleEn: item.titleEn,
    titleKm: item.titleKm,
    subtitleEn: item.subtitleEn,
    subtitleKm: item.subtitleKm,
    meta: item.meta,
    displayOrder: item.displayOrder,
  };
}

function toPublicProfileItem(
  item: Awaited<ReturnType<typeof repository.getProfileItems>>[number],
  language: DoctorLanguage,
) {
  return {
    kind: item.kind,
    icon: item.icon,
    title: localizeText(item.titleEn, item.titleKm, language) ?? item.titleEn,
    subtitle: localizeText(item.subtitleEn, item.subtitleKm, language),
    meta: item.meta,
    displayOrder: item.displayOrder,
  };
}

function validateBookableCategory(category: TeamCategory, bookable: boolean) {
  if (bookable && !isClinicalTeamCategory(category)) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'Only dentists and general practitioners can be bookable.',
    );
  }
}

async function validateNested(
  database: DatabaseClient,
  doctorId: string | undefined,
  relatedDoctorIds: string[] | undefined,
  branchIds: string[] | undefined,
) {
  if (relatedDoctorIds !== undefined) {
    if (new Set(relatedDoctorIds).size !== relatedDoctorIds.length) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Related doctors must be unique.');
    }
    if (doctorId && relatedDoctorIds.includes(doctorId)) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'A doctor cannot relate to themselves.');
    }
    const found = await repository.doctorsExist(database, relatedDoctorIds);
    if (found.length !== relatedDoctorIds.length) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'A related doctor does not exist.');
    }
  }
  if (branchIds !== undefined && branchIds.length > 0) {
    if (new Set(branchIds).size !== branchIds.length) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Branch assignments must be unique.');
    }
    const foundBranches = await branchRepository.branchesExist(database, branchIds);
    if (foundBranches.length !== branchIds.length) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'One or more assigned branches do not exist.');
    }
  }
}

export async function createManagedDoctor(database: DatabaseClient, input: CreateDoctorInput) {
  validateBookableCategory(input.category, input.bookable);
  if (await repository.findDoctorBySlug(database, input.slug)) {
    throw new HttpError(409, 'CONFLICT', 'A doctor with this slug already exists.');
  }
  await validateNested(database, undefined, input.relatedDoctorIds, input.branchIds);
  const doctor = await repository.createDoctor(database, input);
  if (!doctor) throw new Error('Created doctor could not be loaded.');
  return getAdminDoctor(database, doctor.id);
}

export async function updateManagedDoctor(
  database: DatabaseClient,
  id: string,
  input: UpdateDoctorInput,
) {
  const current = await repository.findDoctorById(database, id);
  if (!current) throw new HttpError(404, 'NOT_FOUND', 'Doctor not found.');
  const category = input.category ?? current.category;
  const bookable = input.bookable ?? current.bookable;
  if (
    input.category !== undefined &&
    input.category !== current.category &&
    !isClinicalTeamCategory(input.category) &&
    (await repository.countAppointmentsForDoctor(database, id)) > 0
  ) {
    throw new HttpError(
      409,
      'CONFLICT',
      'This doctor is referenced by appointment history and cannot be changed to a non-clinical category. Unpublish or deactivate the doctor instead.',
    );
  }
  validateBookableCategory(category, bookable);
  if (input.slug !== undefined) {
    const existing = await repository.findDoctorBySlug(database, input.slug);
    if (existing && existing.id !== id) {
      throw new HttpError(409, 'CONFLICT', 'A doctor with this slug already exists.');
    }
  }
  await validateNested(database, id, input.relatedDoctorIds, input.branchIds);
  const doctor = await repository.updateDoctor(database, id, input);
  if (!doctor) throw new Error('Updated doctor could not be loaded.');
  return getAdminDoctor(database, doctor.id);
}

export async function getAdminDoctor(database: DatabaseClient, id: string) {
  const doctor = await repository.findDoctorById(database, id);
  if (!doctor) throw new HttpError(404, 'NOT_FOUND', 'Doctor not found.');
  const [expertise, education, profileItems, relatedDoctors, branchIds, presentations] = await Promise.all([
    repository.getExpertise(database, id),
    repository.getEducation(database, id),
    repository.getProfileItems(database, id),
    repository.getRelatedDoctors(database, id),
    repository.getDoctorBranchIds(database, id),
    listForOwners(database, [{ ownerType: 'DOCTOR', ownerId: id, slot: 'PRIMARY' }]),
  ]);
  return {
    ...toAdminDoctor(doctor, branchIds),
    photoImagePresentation: presentationFor(presentations, id),
    expertise: expertise.map((item) => ({
      id: item.id,
      titleEn: item.nameEn,
      titleKm: item.nameKm,
      displayOrder: item.displayOrder,
    })),
    education: education.map((item) => ({
      id: item.id,
      qualificationEn: item.degreeEn,
      qualificationKm: item.degreeKm,
      institutionEn: item.institutionEn,
      institutionKm: item.institutionKm,
      yearLabel: item.yearLabel,
      displayOrder: item.displayOrder,
    })),
    profileItems: profileItems.map(toAdminProfileItem),
    relatedDoctorIds: relatedDoctors.map((item) => item.relation.relatedDoctorId),
  };
}

export async function getAdminDoctorList(database: DatabaseClient, query: AdminDoctorListQuery) {
  const { items, total } = await repository.listAdminDoctors(database, query);
  const [presentations, branchMap, profileItemMap] = await Promise.all([
    listForOwners(database, items.map((doctor) => ({ ownerType: 'DOCTOR' as const, ownerId: doctor.id, slot: 'PRIMARY' }))),
    repository.getDoctorBranchIdsForDoctors(database, items.map((d) => d.id)),
    repository.getProfileItemsForDoctors(database, items.map((doctor) => doctor.id)),
  ]);
  return {
    doctors: items.map((doctor) => ({
      ...toAdminDoctor(doctor, branchMap.get(doctor.id) ?? []),
      photoImagePresentation: presentationFor(presentations, doctor.id),
      profileItems: (profileItemMap.get(doctor.id) ?? []).map(toAdminProfileItem),
    })),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function reorderManagedDoctors(
  database: DatabaseClient,
  input: ReorderDoctorsInput,
) {
  const current = await repository.listDoctorIdsByCategory(database, input.category);
  const currentIds = new Set(current.map((doctor) => doctor.id));
  if (
    current.length !== input.ids.length ||
    input.ids.some((id) => !currentIds.has(id))
  ) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'Doctor IDs must include every doctor in the category exactly once.',
    );
  }
  await repository.reorderDoctorsWithinCategory(database, input);
}

export async function getPublicDoctorList(
  database: DatabaseClient,
  language: DoctorLanguage,
  filters: repository.PublicDoctorListFilters = {},
) {
  const doctors = await repository.listPublicDoctors(database, filters);
  const [presentations, branchMap, profileItemMap] = await Promise.all([
    listForOwners(database, doctors.map((doctor) => ({ ownerType: 'DOCTOR' as const, ownerId: doctor.id, slot: 'PRIMARY' }))),
    repository.getDoctorBranchIdsForDoctors(database, doctors.map((d) => d.id)),
    repository.getProfileItemsForDoctors(database, doctors.map((doctor) => doctor.id)),
  ]);
  return doctors.map((doctor) => ({
    ...localize(doctor, language, presentations, branchMap.get(doctor.id) ?? []),
    profileItems: (profileItemMap.get(doctor.id) ?? []).map((item) =>
      toPublicProfileItem(item, language),
    ),
  }));
}

export async function getPublicDoctor(
  database: DatabaseClient,
  slug: string,
  language: DoctorLanguage,
) {
  const doctor = await repository.findPublicDoctorBySlug(database, slug);
  if (!doctor) throw new HttpError(404, 'NOT_FOUND', 'Doctor not found.');
  const [expertise, education, profileItems, relatedDoctors] = await Promise.all([
    repository.getExpertise(database, doctor.id),
    repository.getEducation(database, doctor.id),
    repository.getProfileItems(database, doctor.id),
    repository.getRelatedDoctors(database, doctor.id),
  ]);
  const publishedRelatedDoctors = relatedDoctors.filter((item) => item.doctor.status === 'PUBLISHED');
  const allDoctorIds = [doctor.id, ...publishedRelatedDoctors.map((item) => item.doctor.id)];
  const [presentations, branchMap] = await Promise.all([
    listForOwners(database, allDoctorIds.map((ownerId) => ({ ownerType: 'DOCTOR' as const, ownerId, slot: 'PRIMARY' }))),
    repository.getDoctorBranchIdsForDoctors(database, allDoctorIds),
  ]);
  return {
    ...localize(doctor, language, presentations, branchMap.get(doctor.id) ?? []),
    about: localizeText(doctor.biographyEn, doctor.biographyKm, language),
    statistics: {
      yearsExperience: doctor.yearsExperience,
      successfulProcedures: doctor.successfulProcedures,
      patientSatisfaction: doctor.patientSatisfaction,
    },
    expertise: expertise.map((item) => ({
      title: localizeText(item.nameEn, item.nameKm, language) ?? item.nameEn,
      displayOrder: item.displayOrder,
    })),
    education: education.map((item) => ({
      qualification: localizeText(item.degreeEn, item.degreeKm, language) ?? item.degreeEn,
      institution: localizeText(item.institutionEn, item.institutionKm, language) ?? item.institutionEn,
      yearLabel: item.yearLabel,
      displayOrder: item.displayOrder,
    })),
    profileItems: profileItems.map((item) => toPublicProfileItem(item, language)),
    relatedDoctors: publishedRelatedDoctors.map((item) => localize(item.doctor, language, presentations, branchMap.get(item.doctor.id) ?? [])),
  };
}

export async function deleteManagedDoctor(database: DatabaseClient, id: string) {
  const doctor = await repository.findDoctorById(database, id);
  if (!doctor) throw new HttpError(404, 'NOT_FOUND', 'Doctor not found.');
  if ((await repository.countAppointmentsForDoctor(database, id)) > 0) {
    throw new HttpError(
      409,
      'CONFLICT',
      'This doctor is referenced by appointment history and cannot be deleted. Unpublish or deactivate the doctor instead.',
    );
  }
  await repository.deleteDoctor(database, id);
}
