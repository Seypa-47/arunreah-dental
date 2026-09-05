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
import type { PublicDoctorDetail, PublicDoctorSummary, PublicServiceDetail, PublicServiceSummary } from './public-content';

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function bookingCalendar() {
  const today = new Date();
  const selected = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const monthStart = new Date(selected.getFullYear(), selected.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());
  const dates = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const key = dateKey(date);
    return { day: date.getDate(), disabled: date < new Date(today.getFullYear(), today.getMonth(), today.getDate()), key, muted: date.getMonth() !== selected.getMonth() };
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
    imageAlt: service.name,
    imageUrl: getPublicMediaUrl(service.listingThumbnailKey) ?? '',
    name: service.name,
    slug: service.slug,
  } as LandingService;
}

export function toLandingDoctor(doctor: PublicDoctorSummary): LandingDoctor {
  const profileHref = `/doctors/${doctor.slug}`;
  return {
    bookingLabel: `Book with ${doctor.name}`,
    credential: doctor.title ?? doctor.specialty ?? undefined,
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
    name: doctor.name,
    profileHref,
    specialty: doctor.specialty ?? '',
  };
}

export function mapServicesPage(base: ServicesPageContent, services: PublicServiceSummary[]): ServicesPageContent {
  return { ...base, services: services.map(toLandingService) };
}

export function mapDoctorsPage(base: DoctorsPageContent, doctors: PublicDoctorSummary[]): DoctorsPageContent {
  return { ...base, doctors: doctors.map(toLandingDoctor) };
}

export function mapServiceDetail(base: ServiceDetailContent, detail: PublicServiceDetail): ServiceDetailContent {
  const related = detail.relatedServices.map(toLandingService);
  const items = [
    ['Duration', detail.treatmentAtAGlance.duration, 'clock'],
    ['Recovery', detail.treatmentAtAGlance.recovery, 'recovery'],
    ['Visits', detail.treatmentAtAGlance.visits, 'calendar'],
    ['Consultation', detail.treatmentAtAGlance.consultation, 'consultation'],
  ].filter((item): item is [string, string, 'clock' | 'recovery' | 'calendar' | 'consultation'] => typeof item[1] === 'string' && item[1].length > 0);
  const service = {
    ...toLandingService(detail),
    slug: detail.slug,
    about: {
      imageAlt: detail.name,
      imageUrl: getPublicMediaUrl(detail.about.imageKey) ?? '',
      paragraphs: detail.about.body ? detail.about.body.split(/\n{2,}/).filter(Boolean) : [],
      title: detail.about.title ?? detail.name,
    },
    benefits: detail.benefits.map((benefit) => ({
      description: benefit.description ?? '',
      icon: 'check' as const,
      title: benefit.title,
    })),
    cta: {
      appointmentLabel: detail.cta.primaryLabel ?? 'Book Appointment',
      contactLabel: detail.cta.secondaryLabel ?? 'Contact Us',
      description: detail.cta.description ?? '',
      title: detail.cta.title ?? '',
    },
    glance: {
      actionLabel: detail.cta.primaryLabel ?? 'Book Appointment',
      items: items.map(([label, description, icon]) => ({ label, description, icon })),
      title: 'Treatment at a Glance',
    },
    hero: {
      appointmentLabel: detail.cta.primaryLabel ?? 'Book Appointment',
      consultationLabel: detail.cta.secondaryLabel ?? 'Contact Us',
      eyebrow: detail.hero.eyebrow ?? '',
      imageAlt: detail.name,
      imageUrl: getPublicMediaUrl(detail.hero.imageKey) ?? '',
      subtitle: detail.hero.summary ?? detail.shortDescription ?? '',
      title: detail.hero.title ?? detail.name,
    },
  };
  return { ...base, otherServices: related, service, services: [toLandingService(detail), ...related] };
}

export function mapDoctorDetail(base: DoctorDetailContent, detail: PublicDoctorDetail): DoctorDetailContent {
  const doctor = toLandingDoctor(detail);
  doctor.detail = {
    about: detail.about ? detail.about.split(/\n{2,}/).filter(Boolean) : [],
    biography: detail.about ?? '',
    certifications: detail.education.map((item) => ({ institution: item.institution, title: item.qualification })),
    education: detail.education.map((item) => item.qualification),
    experience: detail.statistics.yearsExperience === null ? '' : `${detail.statistics.yearsExperience}+ years of experience`,
    heroSummary: detail.shortBio ?? '',
    languages: [],
    pageDescription: detail.shortBio ?? '',
    profileHref: `/doctors/${detail.slug}`,
    roleTitle: detail.title ?? detail.specialty ?? '',
    services: detail.expertise.map((item) => item.title),
    stats: [
      detail.statistics.yearsExperience === null ? null : { label: 'Years Experience', value: String(detail.statistics.yearsExperience) },
      detail.statistics.successfulProcedures === null ? null : { label: 'Successful Procedures', value: String(detail.statistics.successfulProcedures) },
      detail.statistics.patientSatisfaction === null ? null : { label: 'Patient Satisfaction', value: `${detail.statistics.patientSatisfaction}%` },
    ].filter((item): item is { label: string; value: string } => item !== null),
  };
  return { ...base, doctor, otherDoctors: detail.relatedDoctors.map(toLandingDoctor) };
}

export function mapBookingOptions(
  base: BookAppointmentPageContent,
  services: PublicServiceSummary[],
  doctors: PublicDoctorSummary[],
  branches: { id: string; slug: string; name: string; address: string; branchImageKey: string | null; googleMapsUrl: string | null; acceptsAppointments: boolean }[],
  contact?: { primaryPhone: string | null; primaryEmail: string | null },
): BookAppointmentPageContent {
  const bookableBranches = branches.filter((branch) => branch.acceptsAppointments);
  return {
    ...base,
    calendar: bookingCalendar(),
    branches: bookableBranches.map((branch) => ({
      address: branch.address,
      id: branch.id,
      imageAlt: branch.name,
      imageUrl: getPublicMediaUrl(branch.branchImageKey) ?? '',
      mapLabel: 'View on Map',
      mapUrl: branch.googleMapsUrl ?? '#',
      name: branch.name,
    })) as BookAppointmentPageContent['branches'],
    help: {
      ...base.help,
      email: contact?.primaryEmail ?? '',
      phone: contact?.primaryPhone ?? '',
    },
    doctors: [{ name: 'No Preference', value: '' }, ...doctors.map((doctor) => ({ name: doctor.name, value: doctor.id }))],
    services: services.map(toLandingService),
    servicesList: services.map((service) => ({ name: service.name, value: service.id })),
    // The appointment API accepts a machine-readable HH:mm value. UI labels may
    // format these values later, but the submitted value must remain unambiguous.
    times: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
  };
}
