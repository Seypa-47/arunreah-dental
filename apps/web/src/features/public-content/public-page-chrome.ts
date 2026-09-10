import type {
  AboutPageContent,
  BookAppointmentPageContent,
  BranchesPageContent,
  ContactPageContent,
  DoctorDetailContent,
  DoctorsPageContent,
  LandingFooterLinkGroup,
  LandingNavigationItem,
  LandingPageContent,
  ServiceDetailContent,
  ServicesPageContent,
} from '@/features/landing-page/types';
import type { ClinicSettingsPublicRead } from '@arunreah/shared';
import { getPublicMediaUrl } from '@/services/media';
import type { PublicDoctorSummary, PublicShowcaseDetail } from '@/services/public-content';

// These values are interface copy and layout configuration. CMS-owned records
// (clinic, contact, services, doctors, branches, showcases and images) are
// deliberately supplied only by the public API mappers.
const navigation: LandingNavigationItem[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/branches', label: 'Branches' },
  { href: '/showcases', label: 'Showcases' },
];

const linkGroups: LandingFooterLinkGroup[] = [
  { title: 'Explore', links: [{ href: '/services', label: 'Services' }, { href: '/doctors', label: 'Doctors' }, { href: '/branches', label: 'Locations' }] },
  { title: 'Contact', links: [{ href: '/contact', label: 'Contact Us' }, { href: '/book-appointment', label: 'Book Appointment' }] },
];

export function publicShell() {
  return {
    actions: { appointmentLabel: 'Book Appointment', contactLabel: 'Contact Us' },
    footer: { branchLinks: [], description: '', linkGroups, tagline: '' },
    navigation,
    services: [],
  };
}

export function publicLandingChrome(): LandingPageContent {
  return {
    ...publicShell(),
    branches: [],
    doctors: [],
    heroes: [],
    showcase: [],
  };
}

export function publicAboutContent(
  clinic: ClinicSettingsPublicRead,
  language: 'en' | 'km',
  clinicShowcase?: PublicShowcaseDetail,
  featuredDoctor?: PublicDoctorSummary,
): AboutPageContent {
  const clinicName = language === 'km' ? clinic.clinicNameKm : clinic.clinicNameEn;
  const tagline = language === 'km' ? clinic.taglineKm : clinic.taglineEn;
  const shortAbout = language === 'km' ? clinic.shortAboutKm : clinic.shortAboutEn;
  return {
    ...publicShell(),
    clinicGallery: clinicShowcase
      ? [
          clinicShowcase.coverImageKey
            ? { imageAlt: clinicShowcase.title, imageUrl: getPublicMediaUrl(clinicShowcase.coverImageKey) ?? '' }
            : null,
          ...clinicShowcase.sections
            .filter((section) => section.sectionType === 'IMAGE' && section.imageKey)
            .map((section) => ({ imageAlt: section.heading ?? clinicShowcase.title, imageUrl: getPublicMediaUrl(section.imageKey) ?? '' })),
        ].filter((image): image is { imageAlt: string; imageUrl: string } => image !== null && Boolean(image.imageUrl))
      : [],
    editorial: language === 'km'
      ? {
          editionLabel: 'ព័ត៌មានគ្លីនិក',
          galleryEyebrow: 'បរិយាកាសគ្លីនិក',
          galleryTitle: 'ទិដ្ឋភាពនៅក្នុងគ្លីនិករបស់យើង',
          professionalEyebrow: 'ការអភិវឌ្ឍវិជ្ជាជីវៈ',
          professionalTitle: 'រៀនដើម្បីថែទាំអ្នកបានកាន់តែប្រសើរ',
          timelineEyebrow: 'ប្រវត្តិនៃការរីកចម្រើន',
          timelineTitle: 'ដំណើរឆ្ពោះទៅមុខរបស់យើង',
          profileLabel: 'ជួបជាមួយក្រុមការងារ',
          profileTitle: 'ការថែទាំដែលចាប់ផ្តើមពីការស្តាប់',
        }
      : {
          editionLabel: 'Clinic profile',
          galleryEyebrow: 'Inside our clinic',
          galleryTitle: 'A look inside our clinic',
          professionalEyebrow: 'Professional development',
          professionalTitle: 'Learning to care better',
          timelineEyebrow: 'Our journey',
          timelineTitle: 'Growing with our community',
          profileLabel: 'Meet the team',
          profileTitle: 'Care that starts with listening',
        },
    featuredDoctor: featuredDoctor
      ? {
          imageAlt: featuredDoctor.name,
          imageUrl: getPublicMediaUrl(featuredDoctor.photoKey) ?? '',
          name: featuredDoctor.name,
          profileHref: `/doctors/${featuredDoctor.slug}`,
          specialty: featuredDoctor.specialty ?? '',
          summary: featuredDoctor.shortBio ?? '',
          title: featuredDoctor.title ?? '',
        }
      : undefined,
    differences: [],
    facilities: [],
    hero: { eyebrow: '', imageAlt: '', imageUrl: '', subtitle: tagline ?? '', title: clinicName },
    mission: { description: '', iconUrl: '', title: '' },
    stats: [
      { iconUrl: '/assets/landing/about-stat-experience.svg', label: language === 'km' ? 'ឆ្នាំនៃបទពិសោធន៍' : 'Years of experience', value: String(clinic.yearsExperience) },
      { iconUrl: '/assets/landing/about-stat-cases.svg', label: language === 'km' ? 'ករណីដែលបានថែទាំ' : 'Cases cared for', value: String(clinic.successfulCases) },
      { iconUrl: '/assets/landing/about-stat-satisfaction.svg', label: language === 'km' ? 'ការពេញចិត្តរបស់អ្នកជំងឺ' : 'Patient satisfaction', value: `${clinic.patientSatisfaction}%` },
    ],
    story: { eyebrow: '', imageAlt: '', imageUrl: '', paragraphs: shortAbout ? shortAbout.replace(/\\n/g, '\n').split(/\n{2,}/).filter(Boolean) : [], title: clinicName },
    vision: { description: '', iconUrl: '', title: '' },
  };
}

export function publicServicesChrome(): ServicesPageContent {
  return {
    ...publicShell(),
    cta: { consultationLabel: 'Book Appointment', contactLabel: 'Contact Us', description: 'Talk with our clinic team about the care that is right for you.', title: 'Ready to take the next step?' },
    hero: { description: 'Explore the treatments currently offered by our clinic.', title: 'Our Services' },
  };
}

export function publicDoctorsChrome(): DoctorsPageContent {
  return { ...publicShell(), doctors: [], hero: { description: 'Meet our clinic professionals.', title: 'Our Specialists' } };
}

export function publicServiceDetailChrome(): ServiceDetailContent {
  return { ...publicShell(), otherServices: [], service: undefined };
}

export function publicDoctorDetailChrome(): DoctorDetailContent {
  return { ...publicShell(), doctor: undefined, otherDoctors: [] };
}

export function publicBranchesChrome(): BranchesPageContent {
  return {
    ...publicShell(),
    benefits: [],
    branches: [],
    cta: { backgroundImageAlt: '', backgroundImageUrl: '', buttonLabel: 'Book Appointment', eyebrow: '', subtitle: 'Choose a branch and send an appointment request.', title: 'Visit Arunreah Dental Clinic' },
    hero: { appointmentLabel: 'Book Appointment', backgroundImageAlt: '', backgroundImageUrl: '', eyebrow: '', highlights: [], metrics: [], subtitle: 'Find a clinic branch that works for you.', title: 'Our Locations' },
    sections: { benefitsEyebrow: '', benefitsTitle: '', branchesDescription: '', branchesEyebrow: '', branchesTitle: 'Clinic Locations' },
  };
}

export function publicContactChrome(): ContactPageContent {
  return {
    ...publicShell(),
    contactCards: [],
    form: {
      branches: [], fields: { email: 'Email Address', fullName: 'Full Name', message: 'Message', phone: 'Phone Number', preferredBranch: 'Preferred Branch', preferredDate: 'Preferred Date', preferredTime: 'Preferred Time', service: 'Service' },
      messageLimit: 1000,
      placeholders: { email: 'Enter your email address', fullName: 'Enter your name', message: 'Tell us how we can help', phone: 'Enter your phone number', preferredBranch: 'Select a branch', preferredDate: 'Select date', preferredTime: 'Select time', service: 'Select a service' },
      services: [], submitLabel: 'Send Inquiry', times: [], title: 'Send Us a Message',
    },
    hero: { backgroundImageAlt: '', backgroundImageUrl: '', eyebrow: 'Get In Touch', info: [], subtitle: 'Contact our clinic team for help with your care.', title: 'Contact Us' },
    maps: [],
  };
}

export function publicBookingChrome(): BookAppointmentPageContent {
  return {
    ...publicShell(),
    branches: [],
    calendar: { dates: [], monthLabel: '', selectedDateKey: '', selectedDateLabel: '', weekdays: [] },
    doctors: [],
    form: { fields: { email: 'Email Address', fullName: 'Full Name', notes: 'Additional Notes (Optional)', phone: 'Phone Number' }, placeholders: { email: 'Enter your email address', fullName: 'Enter your full name', notes: 'Tell us more about your concern', phone: 'Enter your phone number' }, submitLabel: 'Send Appointment Request' },
    help: { email: '', phone: '', subtitle: 'Our team is ready to assist you.', title: 'Need Help?' },
    hero: { backgroundImageAlt: '', backgroundImageUrl: '', subtitle: 'Send a preferred appointment request and our clinic will review it.', title: 'Book an Appointment' },
    information: [], servicesList: [], summary: { duration: '', title: 'Appointment Summary' }, times: [],
  };
}
