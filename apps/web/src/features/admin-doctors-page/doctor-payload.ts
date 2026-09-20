import type { UpdateDoctorInput } from '@arunreah/shared';
import type { AdminDoctor } from '@/services/admin-doctors';
import { toMediaKey } from '@/services/media';

export function parseYearsExp(val?: string | null): number | null {
  if (val === undefined || val === null) return null;
  const trimmed = String(val).trim();
  if (trimmed === '') return null;
  const match = trimmed.match(/\d+/);
  if (!match) return null;
  const parsed = parseInt(match[0], 10);
  if (Number.isNaN(parsed)) return null;
  return Math.max(0, Math.min(100, parsed));
}

export function parseProcedures(val?: string | null): number | null {
  if (val === undefined || val === null) return null;
  const trimmed = String(val).trim().toLowerCase();
  if (trimmed === '') return null;
  const kMatch = trimmed.match(/^([\d.]+)\s*k/);
  if (kMatch && kMatch[1]) {
    const mult = parseFloat(kMatch[1]) * 1000;
    return Number.isNaN(mult) ? null : Math.max(0, Math.min(10_000_000, Math.round(mult)));
  }
  const digits = trimmed.replace(/[^\d]/g, '');
  if (!digits) return null;
  const parsed = parseInt(digits, 10);
  if (Number.isNaN(parsed)) return null;
  return Math.max(0, Math.min(10_000_000, parsed));
}

export function parseSatisfaction(val?: string | null): number | null {
  if (val === undefined || val === null) return null;
  const trimmed = String(val).trim();
  if (trimmed === '') return null;
  const match = trimmed.match(/\d+/);
  if (!match) return null;
  const parsed = parseInt(match[0], 10);
  if (Number.isNaN(parsed)) return null;
  return Math.max(0, Math.min(100, parsed));
}

export function parsePhone(val?: string | null): string | null {
  if (val === undefined || val === null) return null;
  const trimmed = String(val).trim();
  if (!trimmed) return null;
  const cleaned = trimmed.replace(/[^0-9+()\-\s]/g, '').trim();
  if (cleaned.length < 6 || cleaned.length > 32) return null;
  return cleaned;
}

export function sanitizeSlug(slug?: string | null, fallbackName?: string): string | undefined {
  const raw = (slug || fallbackName || '').trim().toLowerCase();
  const cleaned = raw.replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-+|-+$)/g, '').slice(0, 160);
  return cleaned || undefined;
}

export function sanitizeDoctorUpdatePayload(doctor: AdminDoctor): UpdateDoctorInput {
  let effectiveStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  if (doctor.status === 'archived') {
    effectiveStatus = 'ARCHIVED';
  } else if (typeof doctor.showOnWebsite === 'boolean') {
    effectiveStatus = doctor.showOnWebsite ? 'PUBLISHED' : 'DRAFT';
  } else {
    effectiveStatus = doctor.status === 'published' ? 'PUBLISHED' : 'DRAFT';
  }

  const nameEn = doctor.name.trim();
  const rawNameKm = doctor.nameKm?.trim();
  const nameKm = (rawNameKm || nameEn).slice(0, 160);

  const slug = sanitizeSlug(doctor.seo?.slug, nameEn);

  const expertise = (doctor.expertiseItems ?? [])
    .map((item, index) => {
      const titleEn = item.titleEn?.trim() || '';
      const titleKm = item.titleKm?.trim() || '';
      if (!titleEn && !titleKm) return null;
      return {
        titleEn: (titleEn || titleKm).slice(0, 160),
        titleKm: (titleKm || titleEn).slice(0, 160),
        displayOrder: index,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .slice(0, 10);

  const education = (doctor.educationItems ?? [])
    .map((item, index) => {
      const qualEn = item.qualificationEn?.trim() || '';
      const qualKm = item.qualificationKm?.trim() || '';
      const instEn = item.institutionEn?.trim() || '';
      const instKm = item.institutionKm?.trim() || '';
      if (!qualEn && !qualKm && !instEn && !instKm) return null;
      return {
        qualificationEn: (qualEn || qualKm || 'Degree').slice(0, 300),
        qualificationKm: (qualKm || qualEn || 'សញ្ញាបត្រ').slice(0, 300),
        institutionEn: (instEn || instKm || 'Institution').slice(0, 300),
        institutionKm: (instKm || instEn || 'សាកលវិទ្យាល័យ').slice(0, 300),
        yearLabel: item.yearLabel?.trim() ? item.yearLabel.trim().slice(0, 100) : null,
        displayOrder: index,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .slice(0, 10);

  const relatedDoctorIds = (doctor.relatedDoctorIds ?? [])
    .map((id) => id.trim())
    .filter((id) => Boolean(id) && id !== doctor.id)
    .slice(0, 3);

  const payload: UpdateDoctorInput = {
    status: effectiveStatus,
    featured: Boolean(doctor.featuredDoctor),
    displayOrder:
      typeof doctor.displayOrder === 'number' && !Number.isNaN(doctor.displayOrder)
        ? Math.max(0, Math.min(1_000_000, Math.round(doctor.displayOrder)))
        : 0,
    nameEn,
    nameKm,
    titleEn: doctor.roleTitle?.trim() || null,
    titleKm: doctor.roleTitleKm?.trim() || null,
    specialtyEn: doctor.specialty?.trim() || null,
    specialtyKm: doctor.specialtyKm?.trim() || null,
    shortBioEn: doctor.shortIntro?.trim() || null,
    shortBioKm: doctor.shortIntroKm?.trim() || null,
    aboutEn: doctor.content?.trim() || null,
    aboutKm: doctor.contentKm?.trim() || null,
    photoKey: toMediaKey(doctor.photoKey),
    yearsExperience: parseYearsExp(doctor.yearsExp),
    successfulProcedures: parseProcedures(doctor.procedures),
    patientSatisfaction: parseSatisfaction(doctor.satisfaction),
    phone: parsePhone(doctor.contactPhone),
    expertise,
    education,
    relatedDoctorIds,
  };

  if (slug) {
    payload.slug = slug;
  }

  return payload;
}
