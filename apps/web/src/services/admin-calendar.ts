import type { AdminNavIcon } from '@/services/admin-inbox';
import type { AppointmentStatus } from '@arunreah/shared';
import { getAdminAppointments, type AppointmentListItem } from '@/services/appointments';
import { getPublicServices } from '@/services/public-content';

export type CalendarAppointmentItem = {
  branchName?: string;
  doctor: string;
  email?: string;
  id: string;
  label: string;
  patientName?: string;
  phone?: string;
  reference?: string;
  serviceName?: string;
  status?: AppointmentStatus;
  time: string;
  tone: 'blue' | 'green' | 'orange' | 'red';
};

export type AdminCalendarContent = {
  brand: { logoAlt: string; logoUrl: string };
  calendar: {
    days: {
      appointments: CalendarAppointmentItem[];
      day: number;
      isCurrentDay?: boolean;
      isOutsideMonth?: boolean;
      key: string;
    }[];
    weekdays: string[];
  };
  controls: {
    allDoctors: string;
    month: number;
    monthLabel: string;
    newAppointmentLabel: string;
    searchPlaceholder: string;
    todayLabel: string;
    views: ('Month' | 'Week' | 'Day')[];
    year: number;
  };
  newAppointment: {
    cancelLabel: string;
    dateLabel: string;
    doctorLabel: string;
    patientLabel: string;
    saveLabel: string;
    serviceLabel: string;
    services: string[];
    timeLabel: string;
    title: string;
  };
  empty: { description: string; title: string };
  footer: { copyright: string; encryptionLabel: string; sslLabel: string };
  header: { subtitle: string; title: string };
  navigation: { icon: AdminNavIcon; label: string; section?: 'appointments' | 'services' | 'doctors' }[];
};

export type NewCalendarAppointment = {
  date: string;
  doctor: string;
  patientName: string;
  service: string;
  time: string;
  phone?: string;
};

const defaultServices = [
  'Routine Cleaning',
  'Teeth Whitening',
  'Dental Implants',
  'Orthodontics Consultation',
  'Root Canal Treatment',
];

const statusToneMap: Record<AppointmentStatus, 'blue' | 'green' | 'orange' | 'red'> = {
  PENDING: 'orange',
  CONFIRMED: 'blue',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

function formatDisplayTime(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  const hours = Number(parts[0]);
  const minutes = parts[1] ?? '00';
  if (Number.isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${String(displayHours).padStart(2, '0')}:${minutes} ${ampm}`;
}

export async function fetchAdminCalendarContent(options?: {
  month?: number;
  year?: number;
}): Promise<AdminCalendarContent> {
  const now = new Date();
  const year = options?.year ?? now.getFullYear();
  const month = options?.month ?? (now.getMonth() + 1);

  let appointments: AppointmentListItem[] = [];
  try {
    const fromDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const toDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
    const result = await getAdminAppointments({
      fromDate,
      limit: 100,
      order: 'asc',
      sort: 'preferredDate',
      toDate,
    });
    if (result && Array.isArray(result.appointments)) {
      appointments = result.appointments;
    }
  } catch (error) {
    console.warn('Unable to load live appointments for calendar:', error);
  }

  let servicesList = defaultServices;
  try {
    const servicesRes = await getPublicServices('en');
    if (servicesRes.services?.length) {
      servicesList = servicesRes.services.map((s) => s.name);
    }
  } catch {
    // Keep defaultServices
  }

  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();

  const appointmentsByDate = new Map<string, CalendarAppointmentItem[]>();
  for (const appt of appointments) {
    const key = appt.preferredDate;
    const tone = statusToneMap[appt.status] ?? 'blue';
    const item: CalendarAppointmentItem = {
      branchName: appt.branch?.nameSnapshot,
      doctor: appt.doctor?.nameSnapshot || 'Any Doctor',
      email: appt.patient?.email,
      id: appt.id,
      label: `${appt.patient?.name || 'Patient'} - ${appt.service?.nameSnapshot || 'Service'}`,
      patientName: appt.patient?.name,
      phone: appt.patient?.phone,
      reference: appt.reference,
      serviceName: appt.service?.nameSnapshot,
      status: appt.status,
      time: formatDisplayTime(appt.preferredTime),
      tone,
    };
    const existing = appointmentsByDate.get(key) ?? [];
    existing.push(item);
    appointmentsByDate.set(key, existing);
  }

  const days: AdminCalendarContent['calendar']['days'] = [];

  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  for (let i = 0; i < firstDayOfWeek; i++) {
    const dayNumber = prevMonthDays - firstDayOfWeek + 1 + i;
    const key = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    days.push({
      appointments: appointmentsByDate.get(key) ?? [],
      day: dayNumber,
      isOutsideMonth: true,
      key,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({
      appointments: appointmentsByDate.get(key) ?? [],
      day: d,
      isCurrentDay: key === todayKey,
      key,
    });
  }

  const remaining = (7 - (days.length % 7)) % 7;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  for (let d = 1; d <= remaining; d++) {
    const key = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({
      appointments: appointmentsByDate.get(key) ?? [],
      day: d,
      isOutsideMonth: true,
      key,
    });
  }

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return {
    brand: { logoAlt: 'Arunreah Dental Clinic', logoUrl: '/assets/landing/footer-logo-cropped.png' },
    calendar: {
      days,
      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    controls: {
      allDoctors: 'All Doctors',
      month,
      monthLabel,
      newAppointmentLabel: 'New Appointment',
      searchPlaceholder: 'Search appointments...',
      todayLabel: 'Today',
      views: ['Month', 'Week', 'Day'],
      year,
    },
    empty: { description: 'Try a different search or doctor selection.', title: 'No appointments found' },
    footer: {
      copyright: `© ${now.getFullYear()} Arunreah Dental Clinic. All rights reserved.`,
      encryptionLabel: '256-bit Encryption',
      sslLabel: 'SSL Secured',
    },
    header: { subtitle: 'Schedule and track patient visits effortlessly.', title: 'Appointment Calendar' },
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
    newAppointment: {
      cancelLabel: 'Cancel',
      dateLabel: 'Date',
      doctorLabel: 'Doctor',
      patientLabel: 'Patient name',
      saveLabel: 'Create Appointment',
      serviceLabel: 'Service',
      services: servicesList,
      timeLabel: 'Time',
      title: 'New Appointment',
    },
  };
}

export async function createAdminCalendarAppointment(input: NewCalendarAppointment) {
  return {
    appointment: {
      doctor: input.doctor,
      id: `admin-appointment-${Date.now()}`,
      label: `${input.patientName} - ${input.service}`,
      patientName: input.patientName,
      serviceName: input.service,
      status: 'PENDING' as const,
      time: formatDisplayTime(input.time),
      tone: 'orange' as const,
    },
    dayKey: input.date,
  };
}
