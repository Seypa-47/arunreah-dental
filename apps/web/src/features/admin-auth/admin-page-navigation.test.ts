import { describe, expect, it } from 'vitest';
import { getAdminNavigationGroups, getAdminPageInfo, isAdminNavigationActive } from './admin-page-navigation';
import { canAccessAdminPath } from '@/routes/admin-route-access';

describe('admin navigation presentation', () => {
  it.each(['RECEPTIONIST', 'CMS_ADMIN', 'SUPER_ADMIN'] as const)('only links to permitted routes for %s', (role) => {
    const groups = getAdminNavigationGroups(role);
    expect(groups.every((group) => group.items.length > 0)).toBe(true);
    const links = groups.flatMap((group) => group.items);
    expect(links.every((item) => canAccessAdminPath(role, item.to))).toBe(true);
    expect(new Set(links.map((item) => item.to)).size).toBe(links.length);
    expect(links.some((item) => item.to.includes('calendar'))).toBe(false);
  });
  it('retains all CMS destinations without duplicate create links', () => {
    const links = getAdminNavigationGroups('CMS_ADMIN').flatMap((group) => group.items.map((item) => item.to));
    expect(links).toEqual(['/admin/dashboard', '/admin/services', '/admin/doctors', '/admin/showcase', '/admin/page-media', '/admin/about-timeline', '/admin/clinic-info', '/admin/clinic-info/branches', '/admin/clinic-info/contact']);
  });
  it('distinguishes nested service pages from neighboring list routes', () => {
    expect(isAdminNavigationActive('/admin/services/123/edit', '/admin/services')).toBe(true);
    expect(isAdminNavigationActive('/admin/appointments/inbox', '/admin/appointments')).toBe(false);
    expect(isAdminNavigationActive('/admin/clinic-info/contact', '/admin/clinic-info')).toBe(false);
  });
  it('provides a real parent link for create and edit screens', () => {
    expect(getAdminPageInfo('/admin/doctors/new').parent?.to).toBe('/admin/doctors');
    expect(getAdminPageInfo('/admin/services/123/edit').parent?.to).toBe('/admin/services');
    expect(getAdminPageInfo('/admin/clinic-info/contact').title).toBe('Contact settings');
  });
});
