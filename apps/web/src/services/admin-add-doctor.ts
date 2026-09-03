import type { AdminNavIcon } from '@/services/admin-inbox';
import type { AdminDoctor, DoctorStatus } from '@/services/admin-doctors';

export type NewDoctorFormState = {
  contactEmail: string;
  contactPhone: string;
  content: string;
  expertise: string[];
  name: string;
  photoUrl: string;
  procedures: string;
  roleTitle: string;
  satisfaction: string;
  shortIntro: string;
  showOnWebsite: boolean;
  specialty: string;
  status: DoctorStatus;
  yearsExp: string;
};

export type AdminAddDoctorContent = {
  brand: {
    logoAlt: string;
    logoUrl: string;
  };
  defaultExpertise: string[];
  footer: {
    copyright: string;
    encryptionLabel: string;
    sslLabel: string;
  };
  header: {
    dateLabel: string;
    subtitle: string;
    title: string;
  };
  navigation: {
    icon: AdminNavIcon;
    label: string;
    section?: 'appointments' | 'services' | 'doctors';
  }[];
  tips: string[];
};

const adminAddDoctorContent: AdminAddDoctorContent = {
  brand: {
    logoAlt: 'Arunreah Dental Clinic',
    logoUrl: '/assets/landing/footer-logo-cropped.png',
  },
  defaultExpertise: [
    'Digital Dental Implants',
    'Full Mouth Rehabilitation',
    'Bone Grafting Procedures',
    'Cosmetic Smile Makeovers',
    'Advanced Oral Surgery',
  ],
  footer: {
    copyright: '© 2026 Arunreah Dental Clinic. All rights reserved.',
    encryptionLabel: '256-bit Encryption',
    sslLabel: 'SSL Secured',
  },
  header: {
    dateLabel: 'October 24, 2024',
    subtitle: 'Fill in the details below to add a new doctor to the clinic.',
    title: 'Add New Doctor',
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
  ],
  tips: [
    'Use a clear, professional photo',
    'Recommended size: 800×1000px',
    'Photo will be displayed on the website',
  ],
};

export async function fetchAdminAddDoctorContent(): Promise<AdminAddDoctorContent> {
  return adminAddDoctorContent;
}

export async function saveNewDoctor(formData: NewDoctorFormState): Promise<AdminDoctor> {
  const id =
    formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `doctor-${Date.now()}`;

  const createdDoctor: AdminDoctor = {
    contactPhone: formData.contactPhone || '+855 23 456 789',
    content: formData.content,
    ctaButtonText: 'Book Now',
    education: ['Doctor of Dental Surgery (DDS)'],
    expertise: formData.expertise,
    featuredDoctor: false,
    id,
    imageAlt: formData.name,
    imageUrl: formData.photoUrl || '/assets/landing/doctor-sreng-heng.jpg',
    initials: formData.name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase(),
    name: formData.name,
    procedures: formData.procedures.endsWith('Procedures') || formData.procedures.endsWith('+')
      ? formData.procedures
      : `${formData.procedures}+`,
    roleTitle: formData.roleTitle || 'Specialist',
    satisfaction: formData.satisfaction.endsWith('%')
      ? formData.satisfaction
      : `${formData.satisfaction}%`,
    seo: {
      metaDescription: formData.shortIntro,
      metaTitle: `${formData.name} | ${formData.specialty} | Arunreah Dental Clinic`,
      slug: id,
    },
    shortIntro: formData.shortIntro,
    showOnWebsite: formData.showOnWebsite,
    specialty: formData.specialty,
    status: formData.status,
    updatedAt: new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    yearsExp: formData.yearsExp.endsWith('Years') || formData.yearsExp.endsWith('+')
      ? formData.yearsExp
      : `${formData.yearsExp}+`,
  };

  return createdDoctor;
}

