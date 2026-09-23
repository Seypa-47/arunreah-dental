import type {
  AdminDoctorListQuery,
  CreateDoctorInput,
  DoctorLanguage,
  UpdateDoctorInput,
} from '@arunreah/shared';
import { defaultImagePresentation, type ImagePresentation } from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import * as repository from '../repositories/doctor.repository';
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

function localize(doctor: DoctorRecord, language: DoctorLanguage, presentations: Awaited<ReturnType<typeof listForOwners>> = []) {
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
  };
}

function toAdminDoctor(doctor: DoctorRecord) {
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
    createdAt: doctor.createdAt,
    updatedAt: doctor.updatedAt,
  };
}

async function validateNested(
  database: DatabaseClient,
  doctorId: string | undefined,
  relatedDoctorIds: string[] | undefined,
) {
  if (relatedDoctorIds === undefined) return;
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

export async function createManagedDoctor(database: DatabaseClient, input: CreateDoctorInput) {
  if (await repository.findDoctorBySlug(database, input.slug)) {
    throw new HttpError(409, 'CONFLICT', 'A doctor with this slug already exists.');
  }
  await validateNested(database, undefined, input.relatedDoctorIds);
  const doctor = await repository.createDoctor(database, input);
  if (!doctor) throw new Error('Created doctor could not be loaded.');
  return toAdminDoctor(doctor);
}

export async function updateManagedDoctor(
  database: DatabaseClient,
  id: string,
  input: UpdateDoctorInput,
) {
  const current = await repository.findDoctorById(database, id);
  if (!current) throw new HttpError(404, 'NOT_FOUND', 'Doctor not found.');
  if (input.slug !== undefined) {
    const existing = await repository.findDoctorBySlug(database, input.slug);
    if (existing && existing.id !== id) {
      throw new HttpError(409, 'CONFLICT', 'A doctor with this slug already exists.');
    }
  }
  await validateNested(database, id, input.relatedDoctorIds);
  const doctor = await repository.updateDoctor(database, id, input);
  if (!doctor) throw new Error('Updated doctor could not be loaded.');
  return toAdminDoctor(doctor);
}

export async function getAdminDoctor(database: DatabaseClient, id: string) {
  const doctor = await repository.findDoctorById(database, id);
  if (!doctor) throw new HttpError(404, 'NOT_FOUND', 'Doctor not found.');
  const [expertise, education, relatedDoctors, presentations] = await Promise.all([
    repository.getExpertise(database, id),
    repository.getEducation(database, id),
    repository.getRelatedDoctors(database, id),
    listForOwners(database, [{ ownerType: 'DOCTOR', ownerId: id, slot: 'PRIMARY' }]),
  ]);
  return {
    ...toAdminDoctor(doctor),
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
    relatedDoctorIds: relatedDoctors.map((item) => item.relation.relatedDoctorId),
  };
}

export async function getAdminDoctorList(database: DatabaseClient, query: AdminDoctorListQuery) {
  const { items, total } = await repository.listAdminDoctors(database, query);
  const presentations = await listForOwners(database, items.map((doctor) => ({ ownerType: 'DOCTOR' as const, ownerId: doctor.id, slot: 'PRIMARY' })));
  return {
    doctors: items.map((doctor) => ({ ...toAdminDoctor(doctor), photoImagePresentation: presentationFor(presentations, doctor.id) })),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getPublicDoctorList(database: DatabaseClient, language: DoctorLanguage) {
  const doctors = await repository.listPublicDoctors(database);
  const presentations = await listForOwners(database, doctors.map((doctor) => ({ ownerType: 'DOCTOR' as const, ownerId: doctor.id, slot: 'PRIMARY' })));
  return doctors.map((doctor) => localize(doctor, language, presentations));
}

export async function getPublicDoctor(
  database: DatabaseClient,
  slug: string,
  language: DoctorLanguage,
) {
  const doctor = await repository.findPublicDoctorBySlug(database, slug);
  if (!doctor) throw new HttpError(404, 'NOT_FOUND', 'Doctor not found.');
  const [expertise, education, relatedDoctors, presentations] = await Promise.all([
    repository.getExpertise(database, doctor.id),
    repository.getEducation(database, doctor.id),
    repository.getRelatedDoctors(database, doctor.id),
    listForOwners(database, [{ ownerType: 'DOCTOR', ownerId: doctor.id, slot: 'PRIMARY' }]),
  ]);
  return {
    ...localize(doctor, language, presentations),
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
    relatedDoctors: relatedDoctors
      .filter((item) => item.doctor.status === 'PUBLISHED')
      .map((item) => localize(item.doctor, language)),
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
