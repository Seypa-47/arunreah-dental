import type { AdminNavIcon } from '@/services/admin-inbox';

export type AdminAllAppointmentsContent = {
  appointments: {
    doctor: string;
    id: string;
    patientId: string;
    patientName: string;
    scheduledAt: string;
    service: string;
    serviceTone: 'blue' | 'gray' | 'green' | 'orange' | 'red';
    status: 'cancelled' | 'completed' | 'confirmed' | 'pending';
  }[];
  brand: { logoAlt: string; logoUrl: string };
  controls: { allDoctors: string; allStatuses: string; dateRange: string; exportLabel: string; newAppointmentLabel: string; printLabel: string; searchPlaceholder: string };
  empty: { description: string; title: string };
  footer: { copyright: string; encryptionLabel: string; sslLabel: string };
  header: { subtitle: string; title: string };
  navigation: { icon: AdminNavIcon; label: string; section?: 'appointments' | 'services' }[];
  pagination: { nextLabel: string; previousLabel: string; summary: string };
  table: { actions: string; assignedDoctor: string; dateTime: string; patient: string; service: string; status: string };
};

const adminAllAppointmentsContent: AdminAllAppointmentsContent = {
  appointments: [
    { doctor: 'Dr. Marcus Thorne', id: 'sarah-jenkins', patientId: 'PID-4492', patientName: 'Sarah Jenkins', scheduledAt: 'Oct 24, 2024 · 09:00 AM', service: 'Teeth Whitening', serviceTone: 'blue', status: 'confirmed' },
    { doctor: 'Dr. Elena Rodriguez', id: 'michael-chen', patientId: 'PID-5102', patientName: 'Michael Chen', scheduledAt: 'Oct 24, 2024 · 10:30 AM', service: 'Cleaning', serviceTone: 'orange', status: 'pending' },
    { doctor: 'Dr. Samuel Park', id: 'emily-davis', patientId: 'PID-3281', patientName: 'Emily Davis', scheduledAt: 'Oct 24, 2024 · 03:30 PM', service: 'Orthodontics', serviceTone: 'green', status: 'confirmed' },
    { doctor: 'Dr. Marcus Thorne', id: 'robert-williams', patientId: 'PID-8821', patientName: 'Robert Williams', scheduledAt: 'Oct 25, 2024 · 02:00 PM', service: 'Dental Implants', serviceTone: 'red', status: 'completed' },
    { doctor: 'Dr. Elena Rodriguez', id: 'john-doe', patientId: 'PID-9920', patientName: 'John Doe', scheduledAt: 'Oct 26, 2024 · 11:00 AM', service: 'Root Canal', serviceTone: 'gray', status: 'cancelled' },
  ],
  brand: { logoAlt: 'Arunreah Dental Clinic', logoUrl: '/assets/landing/footer-logo-cropped.png' },
  controls: { allDoctors: 'All Doctors', allStatuses: 'All Statuses', dateRange: 'Oct 01 - Oct 31, 2024', exportLabel: 'Export appointments', newAppointmentLabel: 'New Appointment', printLabel: 'Print appointments', searchPlaceholder: 'Search by patient name, ID or phone...' },
  empty: { description: 'Try a different search or filter selection.', title: 'No appointments found' },
  footer: { copyright: `© ${new Date().getFullYear()} Arunreah Dental Clinic. All rights reserved.`, encryptionLabel: '256-bit Encryption', sslLabel: 'SSL Secured' },
  header: { subtitle: 'View and manage all patient visits and schedules.', title: 'All Appointments' },
  navigation: [{ icon: 'dashboard', label: 'Dashboard' }, { icon: 'appointments', label: 'Appointments', section: 'appointments' }, { icon: 'inbox', label: 'Inbox', section: 'appointments' }, { icon: 'calendar', label: 'Calendar', section: 'appointments' }, { icon: 'appointments', label: 'All Appointments', section: 'appointments' }, { icon: 'services', label: 'Services' }, { icon: 'doctors', label: 'Doctors' }, { icon: 'showcase', label: 'Showcase' }, { icon: 'clinicInfo', label: 'Clinic Info' }],
  pagination: { nextLabel: 'Next page', previousLabel: 'Previous page', summary: 'Showing 1 to 5 of 42 appointments' },
  table: { actions: 'Actions', assignedDoctor: 'Assigned Doctor', dateTime: 'Date & Time', patient: 'Patient', service: 'Service', status: 'Status' },
};

export async function fetchAdminAllAppointmentsContent(): Promise<AdminAllAppointmentsContent> { return adminAllAppointmentsContent; }
