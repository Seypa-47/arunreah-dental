import type {
  BookAppointmentPageContent,
  DoctorDetailContent,
  DoctorsPageContent,
  LandingDoctor,
  LandingService,
  ServiceDetailContent,
  ServicesPageContent,
} from '@/features/landing-page/types';
import { getPublicMediaUrl } from '@/services/media';
import type { PublicBranch, PublicDoctorDetail, PublicDoctorSummary, PublicLanguage, PublicServiceDetail, PublicServiceSummary } from './public-content';

export function mapLandingBranchHero(branch: PublicBranch, language: PublicLanguage) {
  const isKm = language === 'km';
  return {
    address: branch.address,
    appointmentLabel: isKm ? 'កក់ការណាត់ជួប' : 'Book Appointment',
    branchSlug: branch.slug,
    callLabel: isKm ? 'ទូរស័ព្ទមកយើង' : 'Call Us',
    imageAlt: branch.name,
    imagePresentation: branch.heroImagePresentation,
    imageUrl: getPublicMediaUrl(branch.heroImageKey) ?? getPublicMediaUrl(branch.branchImageKey) ?? '',
    locationLabel: isKm ? 'ទីតាំង' : 'Location',
    phones: [branch.phone, branch.secondaryPhone].filter((phone): phone is string => Boolean(phone)),
    qrImageUrl: '/assets/landing/qr-code.png',
    qrLabel: isKm ? 'ព័ត៌មានគ្លីនិក' : 'Clinic information',
  };
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPhnomPenhTodayDate(now: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === 'year')?.value ?? now.getFullYear());
  const month = Number(parts.find((part) => part.type === 'month')?.value ?? now.getMonth() + 1);
  const day = Number(parts.find((part) => part.type === 'day')?.value ?? now.getDate());
  return new Date(year, month - 1, day);
}

function bookingCalendar() {
  const today = getPhnomPenhTodayDate();
  const selected = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const monthStart = new Date(selected.getFullYear(), selected.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());
  const dates = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const key = dateKey(date);
    return { day: date.getDate(), disabled: date < today, key, muted: date.getMonth() !== selected.getMonth() };
  });
  return {
    dates,
    monthLabel: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(selected),
    selectedDateKey: dateKey(selected),
    selectedDateLabel: new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', weekday: 'long', year: 'numeric' }).format(selected),
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  };
}

export function toLandingService(service: PublicServiceSummary): LandingService {
  return {
    description: service.shortDescription ?? '',
    iconAlt: '',
    iconUrl: '',
    id: service.id,
    imageAlt: service.name,
    imageUrl: getPublicMediaUrl(service.listingThumbnailKey) ?? '',
    imagePresentation: service.imagePresentation,
    name: service.name,
    slug: service.slug,
  } as LandingService;
}

export function toLandingDoctor(doctor: PublicDoctorSummary, language: 'en' | 'km' = 'en'): LandingDoctor {
  const isKm = language === 'km';
  const profileHref = `/doctors/${doctor.slug}`;
  return {
    bookingLabel: isKm ? `កក់ជាមួយ ${doctor.name}` : `Book with ${doctor.name}`,
    credential: doctor.title ?? doctor.specialty ?? undefined,
    id: doctor.id,
    detail: {
      about: [],
      biography: '',
      certifications: [],
      education: [],
      experience: '',
      heroSummary: doctor.shortBio ?? '',
      languages: [],
      pageDescription: doctor.shortBio ?? '',
      profileHref,
      roleTitle: doctor.title ?? doctor.specialty ?? '',
      services: [],
      stats: [],
    },
    focus: doctor.specialty ?? undefined,
    imageAlt: doctor.name,
    imageUrl: getPublicMediaUrl(doctor.photoKey) ?? '',
    imagePresentation: doctor.photoImagePresentation,
    name: doctor.name,
    profileHref,
    specialty: doctor.specialty ?? '',
  };
}

export function mapServicesPage(base: ServicesPageContent, services: PublicServiceSummary[]): ServicesPageContent {
  return { ...base, services: services.map(toLandingService) };
}

export function mapDoctorsPage(
  base: DoctorsPageContent,
  doctors: PublicDoctorSummary[],
  language: 'en' | 'km' = 'en',
): DoctorsPageContent {
  return { ...base, doctors: doctors.map((doctor) => toLandingDoctor(doctor, language)) };
}

export function mapServiceDetail(
  base: ServiceDetailContent,
  detail: PublicServiceDetail,
  language: 'en' | 'km' = 'en',
): ServiceDetailContent {
  const isKm = language === 'km';
  const defaultBookLabel = isKm ? 'កក់ការណាត់ជួប' : 'Book Appointment';
  const defaultContactLabel = isKm ? 'ទាក់ទងយើង' : 'Contact Us';
  const related = detail.relatedServices.map(toLandingService);
  const items = [
    [isKm ? 'រយៈពេល' : 'Duration', detail.treatmentAtAGlance.duration, 'clock'],
    [isKm ? 'ការជាសះស្បើយ' : 'Recovery', detail.treatmentAtAGlance.recovery, 'recovery'],
    [isKm ? 'ចំនួនដងមកពិនិត្យ' : 'Visits', detail.treatmentAtAGlance.visits, 'calendar'],
    [isKm ? 'ការពិគ្រោះយោបល់' : 'Consultation', detail.treatmentAtAGlance.consultation, 'consultation'],
  ].filter((item): item is [string, string, 'clock' | 'recovery' | 'calendar' | 'consultation'] => typeof item[1] === 'string' && item[1].length > 0);
  const service = {
    ...toLandingService(detail),
    slug: detail.slug,
    about: {
      imageAlt: detail.name,
      imageUrl: getPublicMediaUrl(detail.about.imageKey) ?? '',
      imagePresentation: detail.about.imagePresentation,
      paragraphs: detail.about.body ? detail.about.body.split(/\n{2,}/).filter(Boolean) : [],
      title: detail.about.title ?? detail.name,
    },
    benefits: detail.benefits.map((benefit) => ({
      description: benefit.description ?? '',
      icon: 'check' as const,
      title: benefit.title,
    })),
    detailSections: detail.detailSections.map((section) => ({
      body: section.body ?? '',
      heading: section.heading ?? '',
      imageAlt: section.heading ?? detail.name,
      imageUrl: getPublicMediaUrl(section.imageKey) ?? '',
      imagePresentation: section.imagePresentation,
      sectionType: section.sectionType,
    })),
    detailPresentation: detail.detailPresentation,
    editorial: {
      label: detail.editorial.label ?? '',
      title: detail.editorial.title ?? '',
    },
    cta: {
      appointmentLabel: detail.cta.primaryLabel ?? defaultBookLabel,
      contactLabel: detail.cta.secondaryLabel ?? defaultContactLabel,
      description: detail.cta.description ?? '',
      title: detail.cta.title ?? '',
    },
    glance: {
      actionLabel: detail.cta.primaryLabel ?? defaultBookLabel,
      items: items.map(([label, description, icon]) => ({ label, description, icon })),
      title: isKm ? 'ព័ត៌មានសង្ខេបនៃការព្យាបាល' : 'Treatment at a Glance',
    },
    hero: {
      appointmentLabel: detail.cta.primaryLabel ?? defaultBookLabel,
      consultationLabel: detail.cta.secondaryLabel ?? defaultContactLabel,
      eyebrow: detail.hero.eyebrow ?? '',
      imageAlt: detail.name,
      imageUrl: getPublicMediaUrl(detail.hero.imageKey) ?? '',
      imagePresentation: detail.hero.imagePresentation,
      subtitle: detail.shortDescription ?? detail.hero.summary ?? '',
      title: detail.hero.title ?? detail.name,
    },
  };
  return { ...base, otherServices: related, service, services: [toLandingService(detail), ...related] };
}

export function mapDoctorDetail(
  base: DoctorDetailContent,
  detail: PublicDoctorDetail,
  language: 'en' | 'km' = 'en',
): DoctorDetailContent {
  const isKm = language === 'km';
  const doctor = toLandingDoctor(detail, language);
  doctor.detail = {
    about: detail.about ? detail.about.split(/\n{2,}/).filter(Boolean) : [],
    biography: detail.about ?? '',
    certifications: detail.education.map((item) => ({
      institution: item.institution,
      title: item.qualification,
      yearLabel: item.yearLabel,
    })),
    education: detail.education.map((item) => item.qualification),
    experience:
      detail.statistics.yearsExperience === null
        ? ''
        : isKm
          ? `បទពិសោធន៍ ${detail.statistics.yearsExperience}+ ឆ្នាំ`
          : `${detail.statistics.yearsExperience}+ years of experience`,
    heroSummary: detail.shortBio ?? '',
    languages: [],
    pageDescription: detail.shortBio ?? '',
    profileHref: `/doctors/${detail.slug}`,
    roleTitle: detail.title ?? detail.specialty ?? '',
    services: detail.expertise.map((item) => item.title),
    stats: [
      detail.statistics.yearsExperience === null
        ? null
        : { label: isKm ? 'ឆ្នាំនៃបទពិសោធន៍' : 'Years Experience', value: String(detail.statistics.yearsExperience) },
      detail.statistics.successfulProcedures === null
        ? null
        : { label: isKm ? 'ការព្យាបាលជោគជ័យ' : 'Successful Procedures', value: String(detail.statistics.successfulProcedures) },
      detail.statistics.patientSatisfaction === null
        ? null
        : { label: isKm ? 'ការពេញចិត្តរបស់អ្នកជំងឺ' : 'Patient Satisfaction', value: `${detail.statistics.patientSatisfaction}%` },
    ].filter((item): item is { label: string; value: string } => item !== null),
  };
  return { ...base, doctor, otherDoctors: detail.relatedDoctors.map((item) => toLandingDoctor(item, language)) };
}

export function mapBookingOptions(
  base: BookAppointmentPageContent,
  services: PublicServiceSummary[],
  doctors: PublicDoctorSummary[],
  branches: {
    id: string;
    slug: string;
    name: string;
    address: string;
    branchImageKey: string | null;
    branchImagePresentation?: import('@arunreah/shared').ImagePresentation;
    googleMapsUrl: string | null;
    acceptsAppointments: boolean;
    openingHours?: string | null;
    openingDays?: string | null;
    openingTime?: string | null;
    closingTime?: string | null;
  }[],
  contact?: { primaryPhone: string | null; primaryEmail: string | null },
  language: 'en' | 'km' = 'en',
): BookAppointmentPageContent {
  const isKm = language === 'km';
  const bookableBranches = branches.filter((branch) => branch.acceptsAppointments);
  return {
    ...base,
    calendar: bookingCalendar(),
    branches: bookableBranches.map((branch) => ({
      address: branch.address,
      id: branch.id,
      imageAlt: branch.name,
      imagePresentation: branch.branchImagePresentation,
      imageUrl: getPublicMediaUrl(branch.branchImageKey) ?? '',
      mapLabel: isKm ? 'មើលលើផែនទី' : 'View on Map',
      mapUrl: branch.googleMapsUrl ?? (branch.slug === 'psa-chas' ? 'https://maps.app.goo.gl/sxiKakoGPZEMzciB9' : 'https://maps.app.goo.gl/6HenBVpmvf4PiWwv6'),
      name: branch.name,
      slug: branch.slug,
      openingHours: branch.openingHours,
      openingDays: branch.openingDays,
      openingTime: branch.openingTime,
      closingTime: branch.closingTime,
    })) as BookAppointmentPageContent['branches'],
    help: {
      ...base.help,
      email: contact?.primaryEmail ?? '',
      phone: contact?.primaryPhone ?? '',
    },
    doctors: [
      { name: isKm ? 'គ្មានចំណូលចិត្ត' : 'No Preference', value: '' },
      ...doctors.map((doctor) => ({ name: doctor.name, slug: doctor.slug, value: doctor.id })),
    ],
    services: services.map(toLandingService),
    servicesList: services.map((service) => ({ name: service.name, slug: service.slug, value: service.id })),
    // The appointment API accepts a machine-readable HH:mm value. UI labels may
    // format these values later, but the submitted value must remain unambiguous.
    times: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
  };
}
