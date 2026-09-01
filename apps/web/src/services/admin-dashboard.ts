import type { AdminNavIcon } from '@/services/admin-inbox';

export type AdminDashboardContent = {
  appointments: {
    id: string;
    patientName: string;
    scheduledAt: string;
    service: string;
    status: 'cancelled' | 'completed' | 'confirmed' | 'pending';
  }[];
  brand: {
    logoAlt: string;
    logoUrl: string;
  };
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
    dateLabel: string;
    subtitle: string;
    title: string;
  };
  navigation: {
    icon: AdminNavIcon;
    label: string;
    section?: 'appointments';
  }[];
  table: {
    actionLabel: string;
    columns: {
      actions: string;
      dateTime: string;
      patient: string;
      service: string;
      status: string;
    };
    title: string;
    viewAllLabel: string;
  };
};

const adminDashboardContent: AdminDashboardContent = {
  appointments: [
    { id: 'sarah-jenkins', patientName: 'Sarah Jenkins', scheduledAt: 'Oct 25, 2024 · 10:30 AM', service: 'Teeth Whitening', status: 'pending' },
    { id: 'robert-wilson', patientName: 'Robert Wilson', scheduledAt: 'Oct 25, 2024 · 02:00 PM', service: 'Dental Implants', status: 'confirmed' },
    { id: 'michael-chen', patientName: 'Michael Chen', scheduledAt: 'Oct 24, 2024 · 09:00 AM', service: 'Routine Cleaning', status: 'completed' },
    { id: 'emily-davis', patientName: 'Emily Davis', scheduledAt: 'Oct 24, 2024 · 11:30 AM', service: 'Orthodontics Consultation', status: 'cancelled' },
    { id: 'james-thompson', patientName: 'James Thompson', scheduledAt: 'Oct 25, 2024 · 04:30 PM', service: 'Emergency Extraction', status: 'pending' },
  ],
  brand: {
    logoAlt: 'Arunreah Dental Clinic',
    logoUrl: '/assets/landing/footer-logo-cropped.png',
  },
  empty: {
    description: 'New appointment requests will appear here as they arrive.',
    title: 'No recent appointment requests',
  },
  footer: {
    copyright: `© ${new Date().getFullYear()} Arunreah Dental Clinic. All rights reserved.`,
    encryptionLabel: '256-bit Encryption',
    sslLabel: 'SSL Secured',
  },
  header: {
    dateLabel: 'October 24, 2024',
    subtitle: "Here's what's happening at the clinic today.",
    title: 'Welcome back, Admin',
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
  table: {
    actionLabel: 'Open appointment actions',
    columns: {
      actions: 'Actions',
      dateTime: 'Date & Time',
      patient: 'Patient Name',
      service: 'Service',
      status: 'Status',
    },
    title: 'Recent Appointment Requests',
    viewAllLabel: 'View all appointments',
  },
};

export async function fetchAdminDashboardContent(): Promise<AdminDashboardContent> {
  return adminDashboardContent;
}
