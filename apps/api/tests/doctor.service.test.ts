import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDoctorSchema, type CreateDoctorInput } from '@arunreah/shared';
import type { DatabaseClient } from '../src/db/client';

const state = vi.hoisted(() => ({
  appointmentCount: 0,
  updated: false,
}));

const doctor = {
  id: 'doctor-1',
  slug: 'sok-dara',
  status: 'PUBLISHED' as const,
  featured: false,
  displayOrder: 0,
  nameEn: 'Dr. Sok Dara',
  nameKm: 'វេជ្ជបណ្ឌិត សុខ ដារ៉ា',
  roleEn: 'Dentist',
  roleKm: 'ទន្តបណ្ឌិត',
  specialtyEn: null,
  specialtyKm: null,
  shortBioEn: null,
  shortBioKm: null,
  biographyEn: null,
  biographyKm: null,
  photoKey: null,
  yearsExperience: null,
  successfulProcedures: null,
  patientSatisfaction: null,
  phone: null,
  category: 'DENTIST' as const,
  bookable: true,
  departmentEn: 'Dental',
  departmentKm: 'ទន្តសាស្ត្រ',
  teamNoteEn: 'Clinical team',
  teamNoteKm: 'ក្រុមគ្លីនិក',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

vi.mock('../src/repositories/doctor.repository', () => ({
  findDoctorById: async () => doctor,
  findDoctorBySlug: async () => undefined,
  createDoctor: async () => doctor,
  updateDoctor: async () => {
    state.updated = true;
    return doctor;
  },
  countAppointmentsForDoctor: async () => state.appointmentCount,
  doctorsExist: async () => [],
  getDoctorBranchIds: async () => [],
  getDoctorBranchIdsForDoctors: async () => new Map<string, string[]>(),
  getExpertise: async () => [],
  getEducation: async () => [],
  getProfileItems: async () => [
    {
      id: 'profile-1',
      doctorId: 'doctor-1',
      kind: 'RESPONSIBILITY',
      icon: 'welcome',
      titleEn: 'Welcome patients',
      titleKm: 'ស្វាគមន៍អ្នកជំងឺ',
      subtitleEn: null,
      subtitleKm: null,
      meta: null,
      displayOrder: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  getRelatedDoctors: async () => [],
  listPublicDoctors: async () => [doctor],
}));

vi.mock('../src/repositories/branch.repository', () => ({
  branchesExist: async () => [],
}));

vi.mock('../src/repositories/image-presentation.repository', () => ({
  listForOwners: async () => [],
}));

const { createManagedDoctor, getAdminDoctor, updateManagedDoctor } = await import(
  '../src/services/doctor.service'
);

const database = {} as DatabaseClient;

function validCreateInput(): CreateDoctorInput {
  return createDoctorSchema.parse({
    slug: 'sok-dara',
    nameEn: 'Dr. Sok Dara',
    nameKm: 'វេជ្ជបណ្ឌិត សុខ ដារ៉ា',
  });
}

beforeEach(() => {
  state.appointmentCount = 0;
  state.updated = false;
});

describe('doctor service Our Team rules', () => {
  it('rejects a non-clinical bookable member even if validation was bypassed upstream', async () => {
    const input: CreateDoctorInput = {
      ...validCreateInput(),
      category: 'RECEPTIONIST',
      bookable: true,
    };

    await expect(createManagedDoctor(database, input)).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Only dentists and general practitioners can be bookable.',
    });
  });

  it('protects appointment history when changing a clinician to a non-clinical category', async () => {
    state.appointmentCount = 1;

    await expect(
      updateManagedDoctor(database, doctor.id, {
        category: 'ASSISTANT',
        bookable: false,
      }),
    ).rejects.toMatchObject({
      status: 409,
      code: 'CONFLICT',
      message:
        'This doctor is referenced by appointment history and cannot be changed to a non-clinical category. Unpublish or deactivate the doctor instead.',
    });
    expect(state.updated).toBe(false);
  });

  it('returns category fields and profile items in the admin detail model', async () => {
    await expect(getAdminDoctor(database, doctor.id)).resolves.toMatchObject({
      category: 'DENTIST',
      bookable: true,
      departmentEn: 'Dental',
      departmentKm: 'ទន្តសាស្ត្រ',
      teamNoteEn: 'Clinical team',
      teamNoteKm: 'ក្រុមគ្លីនិក',
      profileItems: [
        {
          id: 'profile-1',
          kind: 'RESPONSIBILITY',
          icon: 'welcome',
          titleEn: 'Welcome patients',
        },
      ],
    });
  });
});
