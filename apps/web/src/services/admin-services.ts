import type { AdminNavIcon } from '@/services/admin-inbox';

export type AdminService = {
  category: string;
  createdAt: string;
  description: string;
  displayOnHomepage: boolean;
  featured: boolean;
  id: string;
  imageAlt: string;
  imageUrl: string;
  name: string;
  order: number;
  status: 'draft' | 'published';
  updatedAt: string;
};

export type AdminServicesContent = {
  brand: { logoAlt: string; logoUrl: string };
  controls: { addLabel: string; allCategories: string; allStatuses: string; dateLabel: string; filterLabel: string; searchPlaceholder: string };
  empty: { description: string; title: string };
  footer: { copyright: string; encryptionLabel: string; sslLabel: string };
  header: { subtitle: string; title: string };
  navigation: { icon: AdminNavIcon; label: string; section?: 'appointments' | 'services' | 'doctors' }[];
  services: AdminService[];
  table: { actions: string; category: string; service: string; status: string; updated: string };
};

const adminServicesContent: AdminServicesContent = {
  brand: { logoAlt: 'Arunreah Dental Clinic', logoUrl: '/assets/landing/footer-logo-cropped.png' },
  controls: { addLabel: 'Add New Service', allCategories: 'All Categories', allStatuses: 'All Statuses', dateLabel: 'October 24, 2024', filterLabel: 'Filters', searchPlaceholder: 'Search services...' },
  empty: { description: 'Try a different search or filter selection.', title: 'No services found' },
  footer: { copyright: `© ${new Date().getFullYear()} Arunreah Dental Clinic. All rights reserved.`, encryptionLabel: '256-bit Encryption', sslLabel: 'SSL Secured' },
  header: { subtitle: 'Add, edit and manage all services displayed on the website.', title: 'Service Management' },
  navigation: [{ icon: 'dashboard', label: 'Dashboard' }, { icon: 'appointments', label: 'Appointments', section: 'appointments' }, { icon: 'inbox', label: 'Inbox', section: 'appointments' }, { icon: 'calendar', label: 'Calendar', section: 'appointments' }, { icon: 'appointments', label: 'All Appointments', section: 'appointments' }, { icon: 'services', label: 'Services' }, { icon: 'doctors', label: 'Doctors' }, { icon: 'doctors', label: 'Doctor Management', section: 'doctors' }, { icon: 'doctors', label: 'Add New Doctor', section: 'doctors' }, { icon: 'doctors', label: 'Specializations', section: 'doctors' }, { icon: 'showcase', label: 'Showcase' }, { icon: 'clinicInfo', label: 'Clinic Info' }],
  services: [
    { category: 'Restorative', createdAt: 'Oct 10, 2024', description: 'Permanent and natural-looking solution for replacing missing teeth with medical-grade titanium posts.', displayOnHomepage: true, featured: true, id: 'dental-implants', imageAlt: 'Dental implant treatment', imageUrl: '/assets/landing/service-implant.png', name: 'Dental Implants', order: 1, status: 'published', updatedAt: 'Oct 20, 2024' },
    { category: 'Cosmetic', createdAt: 'Oct 8, 2024', description: 'Professional laser teeth whitening service for a brighter, confident smile.', displayOnHomepage: true, featured: false, id: 'teeth-whitening', imageAlt: 'Teeth whitening', imageUrl: '/assets/landing/service-veneer.png', name: 'Teeth Whitening', order: 2, status: 'published', updatedAt: 'Oct 18, 2024' },
    { category: 'Preventative', createdAt: 'Oct 4, 2024', description: 'Deep cleaning and plaque removal for healthy gums and teeth.', displayOnHomepage: true, featured: false, id: 'routine-cleaning', imageAlt: 'Routine dental cleaning', imageUrl: '/assets/landing/service-general.png', name: 'Routine Cleaning', order: 3, status: 'published', updatedAt: 'Oct 15, 2024' },
    { category: 'Specialty', createdAt: 'Oct 1, 2024', description: 'Metal and clear braces for all ages, with personalised treatment planning.', displayOnHomepage: false, featured: false, id: 'orthodontics', imageAlt: 'Orthodontic braces', imageUrl: '/assets/landing/service-orthodontic.png', name: 'Orthodontics', order: 4, status: 'draft', updatedAt: 'Oct 10, 2024' },
  ],
  table: { actions: 'Actions', category: 'Category', service: 'Service', status: 'Status', updated: 'Updated' },
};

export async function fetchAdminServicesContent(): Promise<AdminServicesContent> { return adminServicesContent; }
