import type { AdminNavIcon } from '@/services/admin-inbox';
import type { AdminDoctorListQuery } from '@arunreah/shared';
import { cmsApi, type AdminDoctorDetail, type AdminDoctorRecord, type CmsListMeta } from '@/services/cms';
import { getPublicMediaUrl } from '@/services/media';

export type DoctorStatus = 'published' | 'draft' | 'archived';

export type DoctorExpertiseItem = { displayOrder: number; titleEn: string; titleKm: string };
export type DoctorEducationItem = {
  displayOrder: number;
  institutionEn: string;
  institutionKm: string;
  qualificationEn: string;
  qualificationKm: string;
  yearLabel: string | null;
};

export type AdminDoctor = {
  avatarBgColor?: string;
  contactPhone: string;
  content?: string;
  contentKm?: string;
  ctaButtonText: string;
  education?: string[];
  educationItems?: DoctorEducationItem[];
  expertise?: string[];
  expertiseItems?: DoctorExpertiseItem[];
  featuredDoctor: boolean;
  id: string;
  imageAlt?: string;
  imageUrl?: string;
  photoKey?: string | null;
  initials?: string;
  name: string;
  nameKm?: string;
  procedures: string;
  roleTitle: string;
  roleTitleKm?: string;
  satisfaction: string;
  seo?: {
    canonicalUrl?: string;
    metaDescription?: string;
    metaTitle?: string;
    slug?: string;
  };
  shortIntro: string;
  shortIntroKm?: string;
  specialtyKm?: string;
  relatedDoctorIds?: string[];
  displayOrder?: number;
  showOnWebsite: boolean;
  specialty: string;
  status: DoctorStatus;
  updatedAt: string;
  yearsExp: string;
};

export type AdminDoctorsContent = {
  brand: {
    logoAlt: string;
    logoUrl: string;
  };
  controls: {
    addLabel: string;
    allSpecialties: string;
    allStatuses: string;
    dateLabel: string;
    searchPlaceholder: string;
  };
  doctors: AdminDoctor[];
  empty: {
    description: string;
    title: string;
  };
  footer: {
    copyright: string;
    encryptionLabel: string;
    sslLabel: string;
  };
  header: {
    subtitle: string;
    title: string;
  };
  navigation: {
    icon: AdminNavIcon;
    label: string;
    section?: 'appointments' | 'services' | 'doctors' | 'clinic';
  }[];
  meta: CmsListMeta;
  table: {
    doctor: string;
    specialty: string;
    status: string;
    updated: string;
  };
};

const adminDoctorsContent: AdminDoctorsContent = {
  brand: {
    logoAlt: 'Arunreah Dental Clinic',
    logoUrl: '/assets/landing/footer-logo-cropped.png',
  },
  controls: {
    addLabel: 'Add New Doctor',
    allSpecialties: 'All Specialties',
    allStatuses: 'All Status',
    dateLabel: 'October 24, 2024',
    searchPlaceholder: 'Search doctors...',
  },
  empty: {
    description: 'No doctors matched your criteria. Try adjusting your search query or filters.',
    title: 'No specialists found',
  },
  footer: {
    copyright: '© 2026 Arunreah Dental Clinic. All rights reserved.',
    encryptionLabel: '256-bit Encryption',
    sslLabel: 'SSL Secured',
  },
  header: {
    subtitle: 'Add, edit, and manage specialist profiles shown on the website.',
    title: 'Doctor Management',
  },
  navigation: [
    { icon: 'dashboard', label: 'Dashboard' },
    { icon: 'appointments', label: 'Appointments', section: 'appointments' },
    { icon: 'inbox', label: 'Inbox', section: 'appointments' },
    { icon: 'calendar', label: 'Calendar', section: 'appointments' },
    { icon: 'appointments', label: 'All Appointments', section: 'appointments' },
    { icon: 'services', label: 'Services' },
    { icon: 'doctors', label: 'Doctors' },
    { icon: 'showcase', label: 'Showcase' },
    { icon: 'clinicInfo', label: 'Clinic Info' },
  ],
  meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
  table: {
    doctor: 'DOCTOR',
    specialty: 'SPECIALTY / TITLE',
    status: 'STATUS',
    updated: 'UPDATED',
  },
  doctors: [
    {
      id: 'asst-prof-sreng-heng',
      name: 'Asst. Prof. Sreng Heng',
      roleTitle: 'Senior Specialist',
      specialty: 'Dental Implantology',
      status: 'published',
      updatedAt: 'Oct 24, 2024',
      imageUrl: '/assets/landing/doctor-sreng-heng.jpg',
      imageAlt: 'Asst. Prof. Sreng Heng',
      shortIntro:
        'A leading expert in implantology with over 25 years of clinical excellence and academic contribution.',
      yearsExp: '25+',
      procedures: '10k+',
      satisfaction: '99%',
      contactPhone: '+855 23 456 789',
      ctaButtonText: 'Book Now',
      showOnWebsite: true,
      featuredDoctor: true,
      content:
        'Asst. Prof. Sreng Heng is widely recognized for his precision in dental implantology, sinus lifts, and full arch restorations. He combines cutting-edge 3D guided surgery with patient-centered compassionate care.',
      expertise: ['Dental Implantology', 'Guided Bone Regeneration', 'Full Mouth Rehabilitation', 'Sinus Lift Surgery'],
      education: [
        'Doctor of Dental Surgery (DDS) - UHS Phnom Penh',
        'Assistant Professor of Dental Surgery - UHS',
        'Advanced Implantology Fellowship - ITI International Team for Implantology',
      ],
      seo: {
        metaTitle: 'Asst. Prof. Sreng Heng | Dental Implant Specialist | Arunreah Clinic',
        metaDescription:
          'Consult with Asst. Prof. Sreng Heng, Senior Specialist in dental implants with over 25 years of clinical expertise in Phnom Penh.',
        slug: 'sreng-heng',
      },
    },
    {
      id: 'dr-thai-lychou',
      name: 'Dr. Thai Lychou',
      roleTitle: 'Lead Prosthodontist',
      specialty: 'Prosthodontics',
      status: 'published',
      updatedAt: 'Oct 23, 2024',
      imageUrl: '/assets/landing/doctor-chho-sontary.jpg',
      imageAlt: 'Dr. Thai Lychou',
      shortIntro:
        'Specialist in aesthetic restorations, full mouth rehabilitation, and advanced crown and bridge prosthodontics.',
      yearsExp: '15+',
      procedures: '8k+',
      satisfaction: '98%',
      contactPhone: '+855 23 456 790',
      ctaButtonText: 'Book Consultation',
      showOnWebsite: true,
      featuredDoctor: true,
      expertise: ['Prosthodontics', 'Ceramic Veneers', 'Crown & Bridge Restoration', 'Smile Makeovers'],
      education: ['Doctor of Dental Surgery (DDS)', 'Master in Prosthodontics - Mahidol University'],
      seo: {
        metaTitle: 'Dr. Thai Lychou | Lead Prosthodontist | Arunreah Dental',
        metaDescription: 'Expert cosmetic prosthodontics and smile restoration by Dr. Thai Lychou.',
        slug: 'thai-lychou',
      },
    },
    {
      id: 'dr-sok-chea',
      name: 'Dr. Sok Chea',
      roleTitle: 'Orthodontist',
      specialty: 'Orthodontics',
      status: 'published',
      updatedAt: 'Oct 22, 2024',
      imageUrl: '/assets/landing/doctor-chea-kimly-new.jpg',
      imageAlt: 'Dr. Sok Chea',
      shortIntro:
        'Comprehensive orthodontic specialist offering modern aligners and ceramic bracket systems for perfect alignment.',
      yearsExp: '12+',
      procedures: '6k+',
      satisfaction: '99%',
      contactPhone: '+855 23 456 791',
      ctaButtonText: 'Book Now',
      showOnWebsite: true,
      featuredDoctor: false,
      expertise: ['Invisalign & Clear Aligners', 'Self-Ligating Braces', 'Interceptive Orthodontics'],
      education: ['DDS - University of Health Sciences', 'Certified Clear Aligner Provider'],
      seo: {
        metaTitle: 'Dr. Sok Chea | Orthodontics Specialist | Arunreah Dental',
        metaDescription: 'Straighten your teeth comfortably with Dr. Sok Chea at Arunreah Dental Clinic.',
        slug: 'sok-chea',
      },
    },
    {
      id: 'dr-meas-vanna',
      name: 'Dr. Meas Vanna',
      roleTitle: 'General Dentist',
      specialty: 'General Dentistry',
      status: 'draft',
      updatedAt: 'Oct 21, 2024',
      initials: 'MV',
      avatarBgColor: 'bg-[#e3f0f7] text-[#1f738f]',
      shortIntro:
        'Gentle, preventive dental care and routine oral healthcare for patients of all ages, prioritizing painless dentistry.',
      yearsExp: '7+',
      procedures: '4k+',
      satisfaction: '97%',
      contactPhone: '+855 23 456 792',
      ctaButtonText: 'Book Appointment',
      showOnWebsite: false,
      featuredDoctor: false,
      expertise: ['Preventive Dental Care', 'Tooth Fillings', 'Teeth Scaling & Polishing', 'Routine Checkups'],
      education: ['Doctor of Dental Surgery (DDS) - University of Health Sciences'],
      seo: {
        metaTitle: 'Dr. Meas Vanna | General Dentistry | Arunreah Dental',
        metaDescription: 'Family and general dentistry treatments with Dr. Meas Vanna.',
        slug: 'meas-vanna',
      },
    },
    {
      id: 'dr-heng-bunhabb',
      name: 'Dr. Heng Bunhabb',
      roleTitle: 'Root Canal Specialist',
      specialty: 'Endodontics',
      status: 'published',
      updatedAt: 'Oct 19, 2024',
      imageUrl: '/assets/landing/doctor-heng-bunhabb.jpg',
      imageAlt: 'Dr. Heng Bunhabb',
      shortIntro: 'Specialized in microscopic root canal therapy and preserving natural dentition with painless techniques.',
      yearsExp: '14+',
      procedures: '7k+',
      satisfaction: '99%',
      contactPhone: '+855 23 456 793',
      ctaButtonText: 'Book Now',
      showOnWebsite: true,
      featuredDoctor: false,
    },
    {
      id: 'dr-chuong-kunthy',
      name: 'Dr. Chuong Kunthy',
      roleTitle: 'Pediatric Specialist',
      specialty: 'Pediatric Dentistry',
      status: 'published',
      updatedAt: 'Oct 18, 2024',
      imageUrl: '/assets/landing/doctor-chuong-kunthy.jpg',
      imageAlt: 'Dr. Chuong Kunthy',
      shortIntro: 'Creating a friendly and positive dental environment for children, toddlers, and young teens.',
      yearsExp: '10+',
      procedures: '5k+',
      satisfaction: '99%',
      contactPhone: '+855 23 456 794',
      ctaButtonText: 'Book Appointment',
      showOnWebsite: true,
      featuredDoctor: true,
    },
    {
      id: 'dr-taing-thanith',
      name: 'Dr. Taing Thanith',
      roleTitle: 'Oral & Maxillofacial Surgeon',
      specialty: 'Oral Surgery',
      status: 'published',
      updatedAt: 'Oct 15, 2024',
      imageUrl: '/assets/landing/doctor-taing-thanith-new.jpg',
      imageAlt: 'Dr. Taing Thanith',
      shortIntro: 'Expert in wisdom tooth extraction, complex surgical extractions, and jaw reconstructive care.',
      yearsExp: '16+',
      procedures: '9k+',
      satisfaction: '98%',
      contactPhone: '+855 23 456 795',
      ctaButtonText: 'Book Consultation',
      showOnWebsite: true,
      featuredDoctor: false,
    },
    {
      id: 'dr-yim-delux',
      name: 'Dr. Yim Delux',
      roleTitle: 'Periodontist',
      specialty: 'Periodontics',
      status: 'draft',
      updatedAt: 'Oct 14, 2024',
      imageUrl: '/assets/landing/doctor-yim-delux-new.jpg',
      imageAlt: 'Dr. Yim Delux',
      shortIntro: 'Focused on gum disease treatments, periodontal regeneration, and dental implant site preparation.',
      yearsExp: '11+',
      procedures: '5k+',
      satisfaction: '96%',
      contactPhone: '+855 23 456 796',
      ctaButtonText: 'Book Consultation',
      showOnWebsite: false,
      featuredDoctor: false,
    },
    {
      id: 'dr-som-chantha',
      name: 'Dr. Som Chantha',
      roleTitle: 'Associate Implantologist',
      specialty: 'Dental Implantology',
      status: 'published',
      updatedAt: 'Oct 12, 2024',
      initials: 'SC',
      avatarBgColor: 'bg-[#eef2ff] text-[#4338ca]',
      shortIntro: 'Specialized in computer-assisted implant placements and immediate load restorations.',
      yearsExp: '9+',
      procedures: '3k+',
      satisfaction: '98%',
      contactPhone: '+855 23 456 797',
      ctaButtonText: 'Book Now',
      showOnWebsite: true,
      featuredDoctor: false,
    },
    {
      id: 'dr-keo-rathana',
      name: 'Dr. Keo Rathana',
      roleTitle: 'Smile Design Specialist',
      specialty: 'Cosmetic Dentistry',
      status: 'published',
      updatedAt: 'Oct 10, 2024',
      initials: 'KR',
      avatarBgColor: 'bg-[#fdf4ff] text-[#a21caf]',
      shortIntro: 'Digital smile design expert creating harmonious, bright smiles tailored to patient facial aesthetics.',
      yearsExp: '8+',
      procedures: '3.5k+',
      satisfaction: '99%',
      contactPhone: '+855 23 456 798',
      ctaButtonText: 'Book Consultation',
      showOnWebsite: true,
      featuredDoctor: false,
    },
    {
      id: 'dr-seng-visal',
      name: 'Dr. Seng Visal',
      roleTitle: 'Clear Aligner Specialist',
      specialty: 'Orthodontics',
      status: 'published',
      updatedAt: 'Oct 08, 2024',
      initials: 'SV',
      avatarBgColor: 'bg-[#ecfdf5] text-[#047857]',
      shortIntro: 'Dedicated to precision digital orthodontics and discreet teeth straightening techniques.',
      yearsExp: '10+',
      procedures: '4.5k+',
      satisfaction: '98%',
      contactPhone: '+855 23 456 799',
      ctaButtonText: 'Book Now',
      showOnWebsite: true,
      featuredDoctor: false,
    },
    {
      id: 'dr-ouk-sophea',
      name: 'Dr. Ouk Sophea',
      roleTitle: 'Associate Dentist',
      specialty: 'General Dentistry',
      status: 'draft',
      updatedAt: 'Oct 05, 2024',
      initials: 'OS',
      avatarBgColor: 'bg-[#fff7ed] text-[#c2410c]',
      shortIntro: 'Passionate about patient education, preventative care, and gentle dental cleanings.',
      yearsExp: '5+',
      procedures: '2.5k+',
      satisfaction: '97%',
      contactPhone: '+855 23 456 800',
      ctaButtonText: 'Book Appointment',
      showOnWebsite: false,
      featuredDoctor: false,
    },
  ],
};

const statusForUi = (status: AdminDoctorRecord['status']): DoctorStatus =>
  status === 'PUBLISHED' ? 'published' : status === 'ARCHIVED' ? 'archived' : 'draft';

export function toAdminDoctor(doctor: AdminDoctorRecord): AdminDoctor {
  return {
    id: doctor.id, name: doctor.nameEn, nameKm: doctor.nameKm, roleTitle: doctor.titleEn ?? '', roleTitleKm: doctor.titleKm ?? '', specialty: doctor.specialtyEn ?? '', specialtyKm: doctor.specialtyKm ?? '', shortIntro: doctor.shortBioEn ?? '', shortIntroKm: doctor.shortBioKm ?? '', content: doctor.aboutEn ?? '', contentKm: doctor.aboutKm ?? '',
    imageAlt: doctor.nameEn, imageUrl: getPublicMediaUrl(doctor.photoKey), photoKey: doctor.photoKey, contactPhone: doctor.phone ?? '', expertise: [], expertiseItems: [],
    education: [], educationItems: [], relatedDoctorIds: [], procedures: doctor.successfulProcedures?.toString() ?? '', satisfaction: doctor.patientSatisfaction?.toString() ?? '', yearsExp: doctor.yearsExperience?.toString() ?? '',
    featuredDoctor: doctor.featured, showOnWebsite: doctor.status === 'PUBLISHED', status: statusForUi(doctor.status), updatedAt: doctor.updatedAt, ctaButtonText: 'Book Now', seo: { slug: doctor.slug }, displayOrder: doctor.displayOrder,
  };
}

export function toAdminDoctorDetail(doctor: AdminDoctorDetail): AdminDoctor {
  const result = toAdminDoctor(doctor);
  return {
    ...result,
    education: doctor.education.map((item) => item.qualificationEn),
    educationItems: doctor.education.map(({ displayOrder, institutionEn, institutionKm, qualificationEn, qualificationKm, yearLabel }) => ({ displayOrder, institutionEn, institutionKm, qualificationEn, qualificationKm, yearLabel })),
    expertise: doctor.expertise.map((item) => item.titleEn),
    expertiseItems: doctor.expertise.map(({ displayOrder, titleEn, titleKm }) => ({ displayOrder, titleEn, titleKm })),
    relatedDoctorIds: doctor.relatedDoctorIds,
  };
}

export async function fetchAdminDoctorsContent(query: Partial<AdminDoctorListQuery> = {}): Promise<AdminDoctorsContent> {
  const response = await cmsApi.doctors.list({ limit: 20, page: 1, ...query });
  return { ...adminDoctorsContent, meta: response.meta, doctors: response.items.map(toAdminDoctor) };
}
