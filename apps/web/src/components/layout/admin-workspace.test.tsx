import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AdminPageHeading, AdminWorkspace } from './admin-workspace';

vi.mock('@/features/admin-auth/session-provider', () => ({
  useAdminSession: () => ({ admin: { role: 'CMS_ADMIN' }, isLoggingOut: false, logout: vi.fn() }),
}));

describe('shared admin workspace', () => {
  const render = (path: string) => renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><AdminWorkspace><main><AdminPageHeading /></main></AdminWorkspace></MemoryRouter>);
  it('provides a collapsed mobile menu, skip target, and one breadcrumb', () => {
    const html = render('/admin/services/new');
    expect(html).toContain('aria-expanded="false" aria-controls="admin-sidebar"');
    expect(html).toContain('id="admin-content" tabindex="-1"');
    expect(html.match(/aria-label="Breadcrumb"/g)).toHaveLength(1);
    expect(html).toContain('<h1>Add service</h1>');
  });
  it('highlights the parent section for nested editors without calling it the current page', () => {
    const html = render('/admin/services/123/edit');
    expect(html).toContain('aria-current="location" href="/admin/services"');
    expect(html).toContain('aria-current="page">Edit service');
  });
  it('does not render restricted destinations for a content editor', () => {
    const html = render('/admin/doctors');
    expect(html).not.toContain('href="/admin/admins"');
    expect(html).not.toContain('href="/admin/appointments');
    expect(html).toContain('aria-current="page" href="/admin/doctors"');
  });
});
