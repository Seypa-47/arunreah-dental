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
    if (role === 'CMS_ADMIN') {
      expect(links.some((item) => item.to.includes('calendar'))).toBe(false);
    } else {
      expect(links.some((item) => item.to.includes('calendar'))).toBe(true);
    }
  });
  it('retains all CMS destinations and exposes both team workspace links', () => {
    const links = getAdminNavigationGroups('CMS_ADMIN').flatMap((group) => group.items.map((item) => item.to));
    expect(links).toEqual(['/admin/dashboard', '/admin/team', '/admin/team/new', '/admin/services', '/admin/showcase', '/admin/page-heroes', '/admin/page-media', '/admin/about-timeline', '/admin/clinic-info', '/admin/clinic-info/branches']);
  });
  it('distinguishes nested service pages from neighboring list routes', () => {
    expect(isAdminNavigationActive('/admin/services/123/edit', '/admin/services')).toBe(true);
    expect(isAdminNavigationActive('/admin/appointments/inbox', '/admin/appointments')).toBe(false);
    expect(isAdminNavigationActive('/admin/clinic-info/branches', '/admin/clinic-info')).toBe(false);
    expect(isAdminNavigationActive('/admin/team/new', '/admin/team')).toBe(false);
    expect(isAdminNavigationActive('/admin/team/new', '/admin/team/new')).toBe(true);
  });
  it('provides a real parent link for create and edit screens', () => {
    expect(getAdminPageInfo('/admin/team/new').parent?.to).toBe('/admin/team');
    expect(getAdminPageInfo('/admin/services/123/edit').parent?.to).toBe('/admin/services');
    expect(getAdminPageInfo('/admin/clinic-info/contact').title).toBe('Clinic information');
  });
});
