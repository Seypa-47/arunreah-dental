import type { AdminRole } from '@arunreah/shared';
import type { AdminNavIcon } from '@/services/admin-inbox';

export type AdminNavigationItem = {
  icon: AdminNavIcon;
  label: string;
  section?: 'appointments' | 'services' | 'doctors' | 'clinic';
};

const dashboard: AdminNavigationItem = { icon: 'dashboard', label: 'Dashboard' };

const appointmentNavigation: AdminNavigationItem[] = [
  { icon: 'appointments', label: 'Appointments', section: 'appointments' },
  { icon: 'inbox', label: 'Inbox', section: 'appointments' },
  { icon: 'appointments', label: 'All Appointments', section: 'appointments' },
];

const cmsNavigation: AdminNavigationItem[] = [
  { icon: 'services', label: 'Services' },
  { icon: 'doctors', label: 'Doctors' },
  { icon: 'doctors', label: 'Doctor Management', section: 'doctors' },
  { icon: 'doctors', label: 'Add New Doctor', section: 'doctors' },
  { icon: 'showcase', label: 'Showcase' },
  { icon: 'clinicInfo', label: 'Clinic Info' },
  { icon: 'clinicInfo', label: 'Clinic Settings', section: 'clinic' },
  { icon: 'clinicInfo', label: 'Branches / Locations', section: 'clinic' },
  { icon: 'clinicInfo', label: 'Contact Settings', section: 'clinic' },
];

const adminManagementNavigation: AdminNavigationItem = { icon: 'clinicInfo', label: 'Admin Management' };

export function getAdminNavigation(role: AdminRole): AdminNavigationItem[] {
  if (role === 'RECEPTIONIST') return [dashboard, ...appointmentNavigation];
  if (role === 'CMS_ADMIN') return [dashboard, ...cmsNavigation];
  return [dashboard, ...appointmentNavigation, ...cmsNavigation, adminManagementNavigation];
}
