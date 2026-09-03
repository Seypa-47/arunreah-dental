import type { AdminNavIcon } from '@/services/admin-inbox';

export type ClinicBranch = {
  address: string;
  badge: 'Main Branch' | 'City Branch';
  city: string;
  closingTime: string;
  enableBookButton: boolean;
  enableCallButton: boolean;
  enableDirectionsButton: boolean;
  googleMapsLink: string;
  heroHeadline: string;
  heroImage: string;
  heroSubtitle: string;
  id: string;
  includeInHeroCarousel: boolean;
  locationLabel: string;
  name: string;
  openingDays: string;
  openingTime: string;
  phone1: string;
  phone2: string;
  photo: string;
  showOnBranchesPage: boolean;
  showOnHomepageSection: boolean;
  status: 'Active' | 'Inactive';
  summary: string;
};

export type ClinicGeneralInfo = {
  clinicName: string;
  days: string;
  email: string;
  endTime: string;
  faviconUrl: string;
  logoUrl: string;
  shortDescription: string;
  startTime: string;
  tagline: string;
  website: string;
};

export type ContactSettings = {
  backupChannel: string;
  contactFormErrorText: string;
  contactFormSectionTitle: string;
  contactFormSubmitLabel: string;
  contactFormSuccessText: string;
  contactPageShortDesc: string;
  emailCardTitle: string;
  enableContactForm: boolean;
  enableEmailNotifications: boolean;
  enableTelegramNotifications: boolean;
  eyebrow: string;
  facebookUrl: string;
  googleMapsEmbed: string;
  heading: string;
  instagramUrl: string;
  mainEmail: string;
  mainPhone: string;
  openingHoursCardTitle: string;
  phoneCardTitle: string;
  recipientEmail: string;
  secondaryPhone: string;
  showBranchQuickLinks: boolean;
  showMapOnContactPage: boolean;
  socialCardTitle: string;
  supportEmail: string;
  supportNote: string;
  telegramLink: string;
  websiteDomain: string;
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
      badge: 'Main Branch',
      city: 'Phnom Penh',
      closingTime: '07:00 PM',
      enableBookButton: true,
      enableCallButton: true,
      enableDirectionsButton: true,
      googleMapsLink: 'https://maps.google.com/?q=Toul+Tompoung+Branch',
      heroHeadline: 'Arunreah Dental Clinic - TTP',
      heroImage: '/assets/landing/hero-clinic.png',
      heroSubtitle:
        'Modern facilities, advanced technology, and a caring team ready to help.',
      id: 'toul-tompoung',
      includeInHeroCarousel: true,
      locationLabel: 'TOUL TOMPOUNG BRANCH',
      name: 'Toul Tompoung Branch',
      openingDays: 'Mon - Sun',
      openingTime: '08:00 AM',
      phone1: '098 701 302',
      phone2: '012 964 200',
      photo: '/assets/landing/branches-clinic.png',
      showOnBranchesPage: true,
      showOnHomepageSection: true,
      status: 'Active',
      summary:
        'Our Toul Tompoung branch offers comprehensive dental care in a comfortable, modern environment. Conveniently located in the heart of Phnom Penh with easy access and parking.',
    },
    {
      address:
        '#45, Street 13, Sangkat Wat Phnom, Khan Daun Penh, Phnom Penh, Cambodia (Near Old Market)',
      badge: 'City Branch',
      city: 'Phnom Penh',
      closingTime: '07:00 PM',
      enableBookButton: true,
      enableCallButton: true,
      enableDirectionsButton: true,
      googleMapsLink: 'https://maps.google.com/?q=Psa+Chas+Branch',
      heroHeadline: 'Arunreah Dental Clinic - Psa Chas',
      heroImage: '/assets/landing/hero-psa-chas.png',
      heroSubtitle:
        'Experienced specialists offering gentle and precise dental treatments in downtown.',
      id: 'psa-chas',
      includeInHeroCarousel: true,
      locationLabel: 'PSA CHAS BRANCH',
      name: 'Psa Chas Branch',
      openingDays: 'Mon - Sun',
      openingTime: '08:00 AM',
      phone1: '069 978 997',
      phone2: '061 978 997',
      photo: '/assets/landing/branch-card-clinic.png',
      showOnBranchesPage: true,
      showOnHomepageSection: true,
      status: 'Active',
      summary:
        'Centrally situated near Old Market and Wat Phnom, providing emergency services, restorative dentistry, and cosmetic consultations.',
    },
  ],
  brand: {
    logoAlt: 'Arunreah Dental Clinic',
    logoUrl: '/assets/landing/footer-logo-cropped.png',
  },
  contactSettings: {
    backupChannel: 'Telegram',
    contactFormErrorText: 'Something went wrong. Please try again later.',
    contactFormSectionTitle: 'Send Us a Message',
    contactFormSubmitLabel: 'Send Message',
    contactFormSuccessText: 'Thank you! Your message has been sent successfully.',
    contactPageShortDesc:
      "We'd love to hear from you. Reach out to us for appointments, inquiries, or any questions about our dental care services.",
    emailCardTitle: 'Email',
    enableContactForm: true,
    enableEmailNotifications: true,
    enableTelegramNotifications: true,
    eyebrow: 'GET IN TOUCH',
    facebookUrl: 'https://facebook.com/arunreahdental',
    googleMapsEmbed: 'https://maps.app.goo.gl/abc123xyz',
    heading: 'Contact Arunreah Dental Clinic',
    instagramUrl: 'https://instagram.com/arunreah.dental',
    mainEmail: 'info@arunreahdental.com',
    mainPhone: '069 978 997',
    openingHoursCardTitle: 'Opening Hours',
    phoneCardTitle: 'Phone',
    recipientEmail: 'info@arunreahdental.com',
    secondaryPhone: '061 978 997',
    showBranchQuickLinks: true,
    showMapOnContactPage: true,
    socialCardTitle: 'Social',
    supportEmail: 'support@arunreahdental.com',
    supportNote:
      'Our team is available Monday to Sunday, 8:00 AM - 7:00 PM. We usually respond within business hours.',
    telegramLink: 'https://t.me/arunreahdental',
    websiteDomain: 'https://arunreahdental.com',
  },
  footer: {
    copyright: '© 2026 Arunreah Dental Clinic. All rights reserved.',
    encryptionLabel: '256-bit Encryption',
    sslLabel: 'SSL Secured',
  },
  generalInfo: {
    clinicName: 'Arunreah Dental Clinic',
    days: 'Mon - Sun',
    email: 'info@arunreahdental.com',
    endTime: '07:00 PM',
    faviconUrl: '/assets/landing/footer-logo-cropped.png',
    logoUrl: '/assets/landing/footer-logo-cropped.png',
    shortDescription:
      'Providing medical luxury dental care with a focus on precision, comfort, and professional excellence.',
    startTime: '08:00 AM',
    tagline: 'Healthy smiles for a better life.',
    website: 'https://arunreahdental.com',
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

export async function fetchAdminClinicInfoContent(): Promise<AdminClinicInfoContent> {
  return adminClinicInfoContent;
}

export async function saveClinicInfo(info: ClinicGeneralInfo): Promise<ClinicGeneralInfo> {
  adminClinicInfoContent.generalInfo = info;
  return info;
}

export async function saveBranch(branch: ClinicBranch): Promise<ClinicBranch> {
  const index = adminClinicInfoContent.branches.findIndex((b) => b.id === branch.id);
  if (index >= 0) {
    adminClinicInfoContent.branches[index] = branch;
  } else {
    adminClinicInfoContent.branches.push(branch);
  }
  return branch;
}

export async function saveContactSettings(settings: ContactSettings): Promise<ContactSettings> {
  adminClinicInfoContent.contactSettings = settings;
  return settings;
}

