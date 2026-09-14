import type { AdminRole } from '@arunreah/shared';
import { getAdminNavigation } from './admin-navigation';
import { canAccessAdminPath } from '@/routes/admin-route-access';

const routes: Record<string, string> = {
  Dashboard: '/admin/dashboard', Inbox: '/admin/appointments/inbox',
  'All Appointments': '/admin/appointments', Services: '/admin/services',
  'Doctor Management': '/admin/doctors', Showcase: '/admin/showcase',
  'Clinic Settings': '/admin/clinic-info', 'Branches / Locations': '/admin/clinic-info/branches',
  'Contact Settings': '/admin/clinic-info/contact', 'Page Media': '/admin/page-media',
  'About Timeline': '/admin/about-timeline', 'Admin Management': '/admin/admins',
};

export function getAdminNavigationGroups(role: AdminRole) {
  const definitions = [
    { label: 'Overview', labels: ['Dashboard'] },
    { label: 'Appointments', labels: ['Inbox', 'All Appointments'] },
    { label: 'Website content', labels: ['Services', 'Doctor Management', 'Showcase', 'Page Media', 'About Timeline'] },
    { label: 'Clinic settings', labels: ['Clinic Settings', 'Branches / Locations', 'Contact Settings'] },
    { label: 'Administration', labels: ['Admin Management'] },
  ];
  const allowed = getAdminNavigation(role);
  return definitions.map((group) => ({ label: group.label, items: group.labels.flatMap((label) => {
    const item = allowed.find((entry) => entry.label === label);
    const to = routes[label];
    return item && to && canAccessAdminPath(role, to) ? [{ ...item, to, label: label === 'Doctor Management' ? 'Doctors' : label === 'Admin Management' ? 'Staff accounts' : label }] : [];
  }) })).filter((group) => group.items.length > 0);
}

type PageInfo = { title: string; description: string; parent?: { title: string; to: string } };
const pages: Record<string, PageInfo> = {
  '/admin/dashboard': { title: 'Dashboard', description: 'Review recent activity and choose the work that needs your attention.' },
  '/admin/appointments': { title: 'All appointments', description: 'Find appointment requests and review their current status.' },
  '/admin/appointments/inbox': { title: 'Appointment inbox', description: 'Review patient requests and choose the next appropriate action.' },
  '/admin/services': { title: 'Services', description: 'Manage service content, images, and publication status.' },
  '/admin/doctors': { title: 'Doctors', description: 'Manage doctor profiles and their website visibility.' },
  '/admin/showcase': { title: 'Showcases', description: 'Manage articles, supporting images, and publication status.' },
  '/admin/clinic-info': { title: 'Clinic information', description: 'Update the clinic identity and bilingual website information.' },
  '/admin/clinic-info/branches': { title: 'Branches and locations', description: 'Select a branch to update its details and location information.' },
  '/admin/clinic-info/contact': { title: 'Contact settings', description: 'Keep contact details, opening hours, and communication links up to date.' },
  '/admin/page-media': { title: 'Page media', description: 'Manage images and bilingual captions for existing website sections.' },
  '/admin/about-timeline': { title: 'About timeline', description: 'Manage the bilingual milestones that tell the clinic story.' },
  '/admin/admins': { title: 'Staff accounts', description: 'Manage staff accounts, assigned roles, and account access.' },
};
export function getAdminPageInfo(pathname: string): PageInfo {
  for (const [segment, name] of [['services', 'service'], ['doctors', 'doctor'], ['showcase', 'showcase']] as const) {
    const parent = { title: pages[`/admin/${segment}`]!.title, to: `/admin/${segment}` };
    if (pathname === `/admin/${segment}/new`) return { title: `Add ${name}`, description: `Complete the ${name} details, review your changes, then save.`, parent };
    if (segment === 'services' && /^\/admin\/services\/[^/]+\/edit$/.test(pathname)) return { title: 'Edit service', description: 'Review service content and publication settings before saving.', parent };
  }
  return pages[pathname] ?? { title: 'Admin CMS', description: 'Manage clinic content and operations.' };
}

export function isAdminNavigationActive(pathname: string, to: string) {
  return pathname === to || (['/admin/services', '/admin/doctors', '/admin/showcase'].includes(to) && pathname.startsWith(`${to}/`));
}
