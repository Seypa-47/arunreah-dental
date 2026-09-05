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

export function publicAboutContent(clinic: ClinicSettingsPublicRead, language: 'en' | 'km'): AboutPageContent {
  const clinicName = language === 'km' ? clinic.clinicNameKm : clinic.clinicNameEn;
  const tagline = language === 'km' ? clinic.taglineKm : clinic.taglineEn;
  const shortAbout = language === 'km' ? clinic.shortAboutKm : clinic.shortAboutEn;
  return {
    ...publicShell(),
    differences: [],
    facilities: [],
    hero: { eyebrow: '', imageAlt: '', imageUrl: '', subtitle: tagline ?? '', title: clinicName },
    mission: { description: '', iconUrl: '', title: '' },
    stats: [
      { iconUrl: '/assets/landing/about-stat-experience.svg', label: 'Years Experience', value: String(clinic.yearsExperience) },
      { iconUrl: '/assets/landing/about-stat-cases.svg', label: 'Successful Cases', value: String(clinic.successfulCases) },
      { iconUrl: '/assets/landing/about-stat-satisfaction.svg', label: 'Patient Satisfaction', value: `${clinic.patientSatisfaction}%` },
    ],
    story: { eyebrow: '', imageAlt: '', imageUrl: '', paragraphs: shortAbout ? shortAbout.split(/\n{2,}/).filter(Boolean) : [], title: clinicName },
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
