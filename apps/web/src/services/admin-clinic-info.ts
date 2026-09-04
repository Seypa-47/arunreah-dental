import type { AdminNavIcon } from '@/services/admin-inbox';
import type { AdminBranchRead, ClinicSettingsAdminRead, ContactSettingsAdminRead } from '@arunreah/shared';
import { cmsApi } from '@/services/cms';

export type ClinicBranch = {
  address: string;
  addressKm: string;
  badge: string;
  badgeKm: string;
  city: string;
  closingTime: string;
  enableBookButton: boolean;
  googleMapsLink: string;
  heroHeadline: string;
  heroHeadlineKm: string;
  heroCtaLabel: string;
  heroCtaLabelKm: string;
  heroImage: string;
  heroSubtitle: string;
  heroSubtitleKm: string;
  id: string;
  displayOrder: number;
  featured: boolean;
  includeInHeroCarousel: boolean;
  locationLabel: string;
  locationLabelKm: string;
  name: string;
  nameKm: string;
  openingDays: string;
  openingDaysKm: string;
  openingHours: string;
  openingHoursKm: string;
  openingTime: string;
  phone1: string;
  phone2: string;
  photo: string;
  showOnBranchesPage: boolean;
  showOnHomepageSection: boolean;
  slug: string;
  status: AdminBranchRead['status'];
  summary: string;
  summaryKm: string;
};

export type ClinicGeneralInfo = {
  clinicNameEn: string;
  clinicNameKm: string;
  taglineEn: string;
  taglineKm: string;
  shortAboutEn: string;
  shortAboutKm: string;
  logoKey: string;
  yearsExperience: string;
  successfulCases: string;
  patientSatisfaction: string;
};

export type ContactSettings = {
  primaryPhone: string;
  secondaryPhone: string;
  primaryEmail: string;
  businessHoursEn: string;
  businessHoursKm: string;
  mainGoogleMapsUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  telegramUrl: string;
};

export type AdminClinicInfoContent = {
  branches: ClinicBranch[];
  brand: {
    logoAlt: string;
    logoUrl: string;
  };
  contactSettings: ContactSettings;
  footer: {
    copyright: string;
    encryptionLabel: string;
    sslLabel: string;
  };
  generalInfo: ClinicGeneralInfo;
  header: {
    dateLabel: string;
    subtitle: string;
    title: string;
  };
  navigation: {
    icon: AdminNavIcon;
    label: string;
    section?: 'appointments' | 'services' | 'doctors' | 'clinic';
  }[];
};

const adminClinicInfoContent: AdminClinicInfoContent = {
  branches: [
    {
      address:
        '#123, Street 155, Sangkat Toul Tompoung I, Khan Chamkarmon, Phnom Penh, Cambodia',
      addressKm: '',
      badge: 'Main Branch',
      badgeKm: '',
      city: 'Phnom Penh',
      closingTime: '07:00 PM',
      enableBookButton: true,
      googleMapsLink: 'https://maps.google.com/?q=Toul+Tompoung+Branch',
      heroHeadline: 'Arunreah Dental Clinic - TTP',
      heroHeadlineKm: '',
      heroCtaLabel: '',
      heroCtaLabelKm: '',
      heroImage: '/assets/landing/hero-clinic.png',
      heroSubtitle:
        'Modern facilities, advanced technology, and a caring team ready to help.',
      heroSubtitleKm: '',
      id: 'toul-tompoung',
      displayOrder: 0,
      featured: false,
      includeInHeroCarousel: true,
      locationLabel: 'TOUL TOMPOUNG BRANCH',
      locationLabelKm: '',
      name: 'Toul Tompoung Branch',
      nameKm: '',
      openingDays: 'Mon - Sun',
      openingDaysKm: '',
      openingHours: '',
      openingHoursKm: '',
      openingTime: '08:00 AM',
      phone1: '098 701 302',
      phone2: '012 964 200',
      photo: '/assets/landing/branches-clinic.png',
      showOnBranchesPage: true,
      showOnHomepageSection: true,
      slug: 'toul-tompoung',
      status: 'PUBLISHED',
      summary:
        'Our Toul Tompoung branch offers comprehensive dental care in a comfortable, modern environment. Conveniently located in the heart of Phnom Penh with easy access and parking.',
      summaryKm: '',
    },
    {
      address:
        '#45, Street 13, Sangkat Wat Phnom, Khan Daun Penh, Phnom Penh, Cambodia (Near Old Market)',
      addressKm: '',
      badge: 'City Branch',
      badgeKm: '',
      city: 'Phnom Penh',
      closingTime: '07:00 PM',
      enableBookButton: true,
      googleMapsLink: 'https://maps.google.com/?q=Psa+Chas+Branch',
      heroHeadline: 'Arunreah Dental Clinic - Psa Chas',
      heroHeadlineKm: '',
      heroCtaLabel: '',
      heroCtaLabelKm: '',
      heroImage: '/assets/landing/hero-psa-chas.png',
      heroSubtitle:
        'Experienced specialists offering gentle and precise dental treatments in downtown.',
      heroSubtitleKm: '',
      id: 'psa-chas',
      displayOrder: 0,
      featured: false,
      includeInHeroCarousel: true,
      locationLabel: 'PSA CHAS BRANCH',
      locationLabelKm: '',
      name: 'Psa Chas Branch',
      nameKm: '',
      openingDays: 'Mon - Sun',
      openingDaysKm: '',
      openingHours: '',
      openingHoursKm: '',
      openingTime: '08:00 AM',
      phone1: '069 978 997',
      phone2: '061 978 997',
      photo: '/assets/landing/branch-card-clinic.png',
      showOnBranchesPage: true,
      showOnHomepageSection: true,
      slug: 'psa-chas',
      status: 'PUBLISHED',
      summary:
        'Centrally situated near Old Market and Wat Phnom, providing emergency services, restorative dentistry, and cosmetic consultations.',
      summaryKm: '',
    },
  ],
  brand: {
    logoAlt: 'Arunreah Dental Clinic',
    logoUrl: '/assets/landing/footer-logo-cropped.png',
  },
  contactSettings: {
    primaryPhone: '', secondaryPhone: '', primaryEmail: '', businessHoursEn: '', businessHoursKm: '',
    mainGoogleMapsUrl: '', facebookUrl: '', instagramUrl: '', telegramUrl: '',
  },
  footer: {
    copyright: '© 2026 Arunreah Dental Clinic. All rights reserved.',
    encryptionLabel: '256-bit Encryption',
    sslLabel: 'SSL Secured',
  },
  generalInfo: {
    clinicNameEn: '', clinicNameKm: '', taglineEn: '', taglineKm: '', shortAboutEn: '', shortAboutKm: '',
    logoKey: '', yearsExperience: '', successfulCases: '', patientSatisfaction: '',
  },
  header: {
    dateLabel: 'October 24, 2024',
    subtitle: 'Manage your clinic information, contact details, and branch locations.',
    title: 'Clinic Info Settings',
  },
  navigation: [
    { icon: 'dashboard', label: 'Dashboard' },
    { icon: 'appointments', label: 'Appointments', section: 'appointments' },
    { icon: 'inbox', label: 'Inbox', section: 'appointments' },
    { icon: 'calendar', label: 'Calendar', section: 'appointments' },
    { icon: 'appointments', label: 'All Appointments', section: 'appointments' },
    { icon: 'services', label: 'Services' },
    { icon: 'doctors', label: 'Doctors' },
    { icon: 'doctors', label: 'Doctor Management', section: 'doctors' },
    { icon: 'doctors', label: 'Add New Doctor', section: 'doctors' },
    { icon: 'showcase', label: 'Showcase' },
    { icon: 'clinicInfo', label: 'Clinic Info' },
    { icon: 'clinicInfo', label: 'Clinic Settings', section: 'clinic' },
    { icon: 'clinicInfo', label: 'Branches / Locations', section: 'clinic' },
    { icon: 'clinicInfo', label: 'Contact Settings', section: 'clinic' },
  ],
};

export function toClinicBranch(branch: AdminBranchRead): ClinicBranch {
  return {
    address: branch.addressEn,
    addressKm: branch.addressKm,
    badge: branch.badgeEn ?? '',
    badgeKm: branch.badgeKm ?? '',
    city: branch.cityProvince ?? '',
    closingTime: branch.closingTime ?? '',
    enableBookButton: branch.acceptsAppointments,
    googleMapsLink: branch.googleMapsUrl ?? '',
    heroHeadline: branch.heroHeadlineEn ?? '',
    heroHeadlineKm: branch.heroHeadlineKm ?? '',
    heroCtaLabel: branch.heroCtaLabelEn ?? '',
    heroCtaLabelKm: branch.heroCtaLabelKm ?? '',
    heroImage: branch.heroImageKey ?? '',
    heroSubtitle: branch.heroSupportingTextEn ?? '',
    heroSubtitleKm: branch.heroSupportingTextKm ?? '',
    id: branch.id,
    displayOrder: branch.displayOrder,
    featured: branch.featured,
    includeInHeroCarousel: branch.includeInHomepageHero,
    locationLabel: branch.shortLocationLabelEn ?? '',
    locationLabelKm: branch.shortLocationLabelKm ?? '',
    name: branch.nameEn,
    nameKm: branch.nameKm,
    openingDays: branch.openingDaysEn ?? '',
    openingDaysKm: branch.openingDaysKm ?? '',
    openingHours: branch.openingHoursEn ?? '',
    openingHoursKm: branch.openingHoursKm ?? '',
    openingTime: branch.openingTime ?? '',
    phone1: branch.phone,
    phone2: branch.secondaryPhone ?? '',
    photo: branch.branchImageKey ?? '',
    showOnBranchesPage: branch.showOnBranchesPage,
    showOnHomepageSection: branch.showOnHomepage,
    slug: branch.slug,
    status: branch.status,
    summary: branch.shortSummaryEn ?? '',
    summaryKm: branch.shortSummaryKm ?? '',
  };
}

function numberForForm(value: number | null): string {
  return value === null ? '' : String(value);
}

function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function nullableInteger(value: string): number | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : Number.parseInt(trimmed, 10);
}

function toClinicGeneralInfo(clinic: ClinicSettingsAdminRead): ClinicGeneralInfo {
  return {
    clinicNameEn: clinic.clinicNameEn,
    clinicNameKm: clinic.clinicNameKm,
    taglineEn: clinic.taglineEn ?? '',
    taglineKm: clinic.taglineKm ?? '',
    shortAboutEn: clinic.shortAboutEn ?? '',
    shortAboutKm: clinic.shortAboutKm ?? '',
    logoKey: clinic.logoKey ?? '',
    yearsExperience: numberForForm(clinic.yearsExperience),
    successfulCases: numberForForm(clinic.successfulCases),
    patientSatisfaction: numberForForm(clinic.patientSatisfaction),
  };
}

function toContactSettings(contact: ContactSettingsAdminRead): ContactSettings {
  return {
    primaryPhone: contact.primaryPhone,
    secondaryPhone: contact.secondaryPhone ?? '',
    primaryEmail: contact.primaryEmail ?? '',
    businessHoursEn: contact.businessHoursEn ?? '',
    businessHoursKm: contact.businessHoursKm ?? '',
    mainGoogleMapsUrl: contact.mainGoogleMapsUrl ?? '',
    facebookUrl: contact.facebookUrl ?? '',
    telegramUrl: contact.telegramUrl ?? '',
    instagramUrl: contact.instagramUrl ?? '',
  };
}

export async function fetchAdminClinicInfoContent(): Promise<AdminClinicInfoContent> {
  const [clinicResponse, contactResponse, branchesResponse] = await Promise.all([cmsApi.clinic.get(), cmsApi.contact.get(), cmsApi.branches.list({ limit: 20 })]);
  const clinic = clinicResponse.clinic;
  const contact = contactResponse.contact;
  return {
    ...adminClinicInfoContent,
    generalInfo: toClinicGeneralInfo(clinic),
    contactSettings: toContactSettings(contact),
    branches: branchesResponse.items.map(toClinicBranch),
  };
}

export async function saveClinicInfo(info: ClinicGeneralInfo): Promise<ClinicGeneralInfo> {
  await cmsApi.clinic.update({
    clinicNameEn: info.clinicNameEn.trim(),
    clinicNameKm: info.clinicNameKm.trim(),
    taglineEn: nullableText(info.taglineEn),
    taglineKm: nullableText(info.taglineKm),
    shortAboutEn: nullableText(info.shortAboutEn),
    shortAboutKm: nullableText(info.shortAboutKm),
    logoKey: nullableText(info.logoKey),
    yearsExperience: nullableInteger(info.yearsExperience),
    successfulCases: nullableInteger(info.successfulCases),
    patientSatisfaction: nullableInteger(info.patientSatisfaction),
  });
  return info;
}

export async function saveBranch(branch: ClinicBranch): Promise<ClinicBranch> {
  await cmsApi.branches.update(branch.id, {
    addressEn: branch.address,
    addressKm: branch.addressKm,
    acceptsAppointments: branch.enableBookButton,
    badgeEn: branch.badge || null,
    badgeKm: branch.badgeKm || null,
    branchImageKey: branch.photo || null,
    cityProvince: branch.city || null,
    displayOrder: branch.displayOrder,
    featured: branch.featured,
    closingTime: branch.closingTime || null,
    googleMapsUrl: branch.googleMapsLink || null,
    heroCtaLabelEn: branch.heroCtaLabel || null,
    heroCtaLabelKm: branch.heroCtaLabelKm || null,
    heroHeadlineEn: branch.heroHeadline || null,
    heroHeadlineKm: branch.heroHeadlineKm || null,
    heroImageKey: branch.heroImage || null,
    heroSupportingTextEn: branch.heroSubtitle || null,
    heroSupportingTextKm: branch.heroSubtitleKm || null,
    includeInHomepageHero: branch.includeInHeroCarousel,
    nameEn: branch.name,
    nameKm: branch.nameKm,
    openingDaysEn: branch.openingDays || null,
    openingDaysKm: branch.openingDaysKm || null,
    openingHoursEn: branch.openingHours || null,
    openingHoursKm: branch.openingHoursKm || null,
    openingTime: branch.openingTime || null,
    phone: branch.phone1,
    secondaryPhone: branch.phone2 || null,
    shortLocationLabelEn: branch.locationLabel || null,
    shortLocationLabelKm: branch.locationLabelKm || null,
    shortSummaryEn: branch.summary || null,
    shortSummaryKm: branch.summaryKm || null,
    showOnBranchesPage: branch.showOnBranchesPage,
    showOnHomepage: branch.showOnHomepageSection,
    slug: branch.slug,
    status: branch.status,
  });
  return branch;
}

export async function saveContactSettings(settings: ContactSettings): Promise<ContactSettings> {
  await cmsApi.contact.update({
    primaryPhone: settings.primaryPhone.trim(),
    secondaryPhone: nullableText(settings.secondaryPhone),
    primaryEmail: nullableText(settings.primaryEmail),
    businessHoursEn: nullableText(settings.businessHoursEn),
    businessHoursKm: nullableText(settings.businessHoursKm),
    mainGoogleMapsUrl: nullableText(settings.mainGoogleMapsUrl),
    facebookUrl: nullableText(settings.facebookUrl),
    telegramUrl: nullableText(settings.telegramUrl),
    instagramUrl: nullableText(settings.instagramUrl),
  });
  return settings;
}
