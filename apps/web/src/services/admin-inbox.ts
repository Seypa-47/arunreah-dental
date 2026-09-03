export type AdminInboxContent = {
  appointments: {
    email: string;
    id: string;
    patientName: string;
    phone: string;
    receivedAt: string;
    scheduledAt: string;
    service: string;
    status: 'confirmed' | 'pending';
  }[];
  brand: {
    logoAlt: string;
    logoUrl: string;
  };
  detailEmpty: {
    description: string;
    meta: string;
    title: string;
  };
  filters: {
    label: string;
    options: {
      label: string;
      value: 'confirmed' | 'pending';
    }[];
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
    section?: 'appointments' | 'services' | 'doctors';
  }[];
  pagination: {
    nextLabel: string;
    pages: number[];
    summary: string;
  };
  searchPlaceholder: string;
};

export type AdminNavIcon = 'appointments' | 'calendar' | 'clinicInfo' | 'dashboard' | 'doctors' | 'inbox' | 'services' | 'showcase';

const adminInboxContent: AdminInboxContent = {
  appointments: [
    {
      email: 'sarah.jenkins@example.com',
      id: 'appointment-sarah-jenkins',
      patientName: 'Sarah Jenkins',
      phone: '069 978 997',
      receivedAt: '2 mins ago',
      scheduledAt: 'Oct 25, 2024 · 10:30 AM',
      service: 'Teeth Whitening',
      status: 'pending',
    },
    {
      email: 'robert.wilson@example.com',
      id: 'appointment-robert-wilson',
      patientName: 'Robert Wilson',
      phone: '061 978 997',
      receivedAt: '15 mins ago',
      scheduledAt: 'Oct 25, 2024 · 02:00 PM',
      service: 'Dental Implants',
      status: 'confirmed',
    },
  ],
  brand: {
    logoAlt: 'Arunreah Dental Clinic',
    logoUrl: '/assets/landing/footer-logo-cropped.png',
  },
  detailEmpty: {
    description: 'Select an appointment from the list to view comprehensive patient information, medical history, and service requirements.',
    meta: 'No appointment currently active',
    title: 'Appointment Details',
  },
  filters: {
    label: 'Filters',
    options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Confirmed', value: 'confirmed' },
    ],
  },
  footer: {
    copyright: `© ${new Date().getFullYear()} Arunreah Dental Clinic. All rights reserved.`,
    encryptionLabel: '256-bit Encryption',
    sslLabel: 'SSL Secured',
  },
  header: {
    dateLabel: 'October 24, 2024',
    subtitle: 'Review and manage all incoming appointment requests.',
    title: 'Appointment Inbox',
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
    { icon: 'doctors', label: 'Specializations', section: 'doctors' },
    { icon: 'showcase', label: 'Showcase' },
    { icon: 'clinicInfo', label: 'Clinic Info' },
  ],
  pagination: {
    nextLabel: 'Next page',
    pages: [1, 2, 3, 4],
    summary: 'Showing 1 to 3 of 24 requests',
  },
  searchPlaceholder: 'Search by patient name, phone or email...',
};

export async function fetchAdminInboxContent(): Promise<AdminInboxContent> {
  return adminInboxContent;
}
