import type { AdminNavIcon } from '@/services/admin-inbox';

export type AdminCalendarContent = {
  brand: { logoAlt: string; logoUrl: string };
  calendar: {
    days: {
      appointments: {
        doctor: string;
        id: string;
        label: string;
        time: string;
        tone: 'blue' | 'green' | 'orange' | 'red';
      }[];
      day: number;
      isCurrentDay?: boolean;
      isOutsideMonth?: boolean;
      key: string;
    }[];
    weekdays: string[];
  };
  controls: {
    allDoctors: string;
    monthLabel: string;
    newAppointmentLabel: string;
    searchPlaceholder: string;
    todayLabel: string;
    views: ('Month' | 'Week' | 'Day')[];
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
  navigation: { icon: AdminNavIcon; label: string; section?: 'appointments' }[];
};

export type NewCalendarAppointment = {
  date: string;
  doctor: string;
  patientName: string;
  service: string;
  time: string;
};

const emptyDay = (key: string, day: number, isOutsideMonth = false) => ({ appointments: [], day, isOutsideMonth, key });

const adminCalendarContent: AdminCalendarContent = {
  brand: { logoAlt: 'Arunreah Dental Clinic', logoUrl: '/assets/landing/footer-logo-cropped.png' },
  calendar: {
    days: [
      emptyDay('2024-09-29', 29, true), emptyDay('2024-09-30', 30, true),
      { appointments: [{ doctor: 'Dr. Kimly', id: 'sarah-whitening', label: 'Sarah J. - Whitening', time: '09:00 AM', tone: 'blue' }], day: 1, key: '2024-10-01' },
      emptyDay('2024-10-02', 2),
      { appointments: [{ doctor: 'Dr. Heng', id: 'robert-implants', label: 'Robert W. - Implants', time: '02:00 PM', tone: 'red' }], day: 3, key: '2024-10-03' },
      emptyDay('2024-10-04', 4), emptyDay('2024-10-05', 5), emptyDay('2024-10-06', 6), emptyDay('2024-10-07', 7), emptyDay('2024-10-08', 8),
      { appointments: [{ doctor: 'Dr. Sontary', id: 'michael-cleaning', label: 'Michael C. - Cleaning', time: '10:30 AM', tone: 'orange' }, { doctor: 'Dr. Delux', id: 'emily-ortho', label: 'Emily D. - Ortho', time: '03:30 PM', tone: 'green' }], day: 9, key: '2024-10-09' },
      emptyDay('2024-10-10', 10), emptyDay('2024-10-11', 11), emptyDay('2024-10-12', 12), emptyDay('2024-10-13', 13), emptyDay('2024-10-14', 14), emptyDay('2024-10-15', 15), emptyDay('2024-10-16', 16), emptyDay('2024-10-17', 17), emptyDay('2024-10-18', 18), emptyDay('2024-10-19', 19), emptyDay('2024-10-20', 20), emptyDay('2024-10-21', 21), emptyDay('2024-10-22', 22), emptyDay('2024-10-23', 23), { appointments: [], day: 24, isCurrentDay: true, key: '2024-10-24' },
      { appointments: [{ doctor: 'Dr. Heng', id: 'john-root-canal', label: 'John D. - Root Canal', time: '11:00 AM', tone: 'blue' }], day: 25, key: '2024-10-25' }, emptyDay('2024-10-26', 26), emptyDay('2024-10-27', 27), emptyDay('2024-10-28', 28), emptyDay('2024-10-29', 29), emptyDay('2024-10-30', 30), emptyDay('2024-10-31', 31), emptyDay('2024-11-01', 1, true), emptyDay('2024-11-02', 2, true),
    ],
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  controls: { allDoctors: 'All Doctors', monthLabel: 'October 2024', newAppointmentLabel: 'New Appointment', searchPlaceholder: 'Search appointments...', todayLabel: 'Today', views: ['Month', 'Week', 'Day'] },
  empty: { description: 'Try a different search or doctor selection.', title: 'No appointments found' },
  footer: { copyright: `© ${new Date().getFullYear()} Arunreah Dental Clinic. All rights reserved.`, encryptionLabel: '256-bit Encryption', sslLabel: 'SSL Secured' },
  header: { subtitle: 'Schedule and track patient visits effortlessly.', title: 'Appointment Calendar' },
  navigation: [
    { icon: 'dashboard', label: 'Dashboard' }, { icon: 'appointments', label: 'Appointments', section: 'appointments' }, { icon: 'inbox', label: 'Inbox', section: 'appointments' }, { icon: 'calendar', label: 'Calendar', section: 'appointments' }, { icon: 'appointments', label: 'All Appointments', section: 'appointments' }, { icon: 'services', label: 'Services' }, { icon: 'doctors', label: 'Doctors' }, { icon: 'showcase', label: 'Showcase' }, { icon: 'clinicInfo', label: 'Clinic Info' },
  ],
  newAppointment: {
    cancelLabel: 'Cancel',
    dateLabel: 'Date',
    doctorLabel: 'Doctor',
    patientLabel: 'Patient name',
    saveLabel: 'Create Appointment',
    serviceLabel: 'Service',
    services: ['Routine Cleaning', 'Teeth Whitening', 'Dental Implants', 'Orthodontics Consultation', 'Root Canal Treatment'],
    timeLabel: 'Time',
    title: 'New Appointment',
  },
};

export async function fetchAdminCalendarContent(): Promise<AdminCalendarContent> {
  return adminCalendarContent;
}

export async function createAdminCalendarAppointment(input: NewCalendarAppointment) {
  return {
    appointment: {
      doctor: input.doctor,
      id: `admin-appointment-${Date.now()}`,
      label: `${input.patientName} - ${input.service}`,
      time: input.time,
      tone: 'blue' as const,
    },
    dayKey: input.date,
  };
}
