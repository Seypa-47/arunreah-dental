import type { AdminRole } from '@arunreah/shared';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdminDashboard } from '@/services/dashboard';
import { AdminDashboardPage, DashboardContent } from './AdminDashboardPage';

const query = vi.hoisted(() => ({
  data: undefined as AdminDashboard | undefined,
  isError: false,
  isLoading: false,
  isFetching: false,
  refetch: vi.fn(),
}));
vi.mock('./use-admin-dashboard-page', () => ({ useAdminDashboardPageQuery: () => query }));
vi.mock('@/features/admin-auth/session-provider', () => ({
  useAdminSession: () => ({ admin: { role: 'SUPER_ADMIN' } }),
}));

const emptyMetric = { total: 0, published: 0, draft: 0, archived: 0 };
const dashboard: AdminDashboard = {
  role: 'SUPER_ADMIN',
  appointments: { pending: 0, confirmedToday: 0, confirmedThisWeek: 0 },
  recentAppointments: [],
  content: {
    services: emptyMetric,
    doctors: emptyMetric,
    showcases: emptyMetric,
    branches: emptyMetric,
  },
};
const renderContent = (data: AdminDashboard, role: AdminRole = 'SUPER_ADMIN') =>
  renderToStaticMarkup(
    <MemoryRouter>
      <DashboardContent dashboard={data} role={role} />
    </MemoryRouter>,
  );
const renderPage = () =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={['/admin/dashboard']}>
      <AdminDashboardPage />
    </MemoryRouter>,
  );

describe('staff-priority dashboard', () => {
  beforeEach(() =>
    Object.assign(query, { data: undefined, isError: false, isLoading: false, isFetching: false }),
  );

  it('treats zero counts as real data and shows useful empty states', () => {
    const html = renderContent(dashboard);
    expect(html).toContain('No pending requests right now.');
    expect(html).toContain('No recent requests');
    expect(html).toContain('No services added yet.');
    expect(html).toContain('<dd>0</dd>');
    expect(html).not.toContain('unavailable');
  });
  it('distinguishes missing sections from zero', () => {
    const html = renderContent({ role: 'SUPER_ADMIN' });
    expect(html).toContain('Appointment counts unavailable');
    expect(html).toContain('Recent requests unavailable');
    expect(html).toContain('Content counts unavailable');
    expect(html).not.toContain('No pending requests');
    expect(html).not.toContain('<dd>0</dd>');
    expect(html).toContain('href="/admin/services"');
  });
  it('limits reception to appointment work even if extra data is supplied', () => {
    const html = renderContent(dashboard, 'RECEPTIONIST');
    expect(html).toContain('Appointment requests');
    expect(html).not.toContain('Website content');
    expect(html).not.toContain('href="/admin/services"');
    expect(html).not.toContain('href="/admin/admins"');
  });
  it('keeps patient information and staff management out of the content editor view', () => {
    const html = renderContent(dashboard, 'CMS_ADMIN');
    expect(html).toContain('Website content');
    expect(html).not.toContain('Appointment requests');
    expect(html).not.toContain('href="/admin/admins"');
  });
  it('links a recent request to the supported reference search and preserves supplied status', () => {
    const html = renderContent({
      ...dashboard,
      recentAppointments: [
        {
          id: 'test-request',
          reference: 'TEST-001',
          patientName: 'Test patient',
          serviceNameSnapshot: 'Test service',
          preferredDate: '2026-09-10',
          preferredTime: '09:00',
          createdAt: '2026-09-09T00:00:00Z',
          status: 'PENDING',
        },
      ],
    });
    expect(html).toContain('/admin/appointments?search=TEST-001&amp;page=1');
    expect(html).toContain('>Pending</span>');
    expect(html).toContain('Requested date &amp; time');
    expect(html).toContain('across all statuses');
  });
  it('shows the API publication breakdown without deriving invented metrics', () => {
    const html = renderContent(
      {
        ...dashboard,
        content: {
          ...dashboard.content!,
          services: { total: 7, draft: 2, published: 4, archived: 1 },
        },
      },
      'CMS_ADMIN',
    );
    expect(html).toContain('>2</dd>');
    expect(html).toContain('<dt>Published</dt><dd>4</dd>');
    expect(html).toContain('<dt>Archived</dt><dd>1</dd>');
    expect(html).toContain('<dt>Total</dt><dd>7</dd>');
  });
  it('retains a role-appropriate destination during loading', () => {
    query.isLoading = true;
    const html = renderPage();
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('Loading dashboard');
    expect(html).toContain('/admin/appointments/inbox?status=PENDING&amp;page=1');
    expect(html).not.toContain('No recent requests');
  });
  it('offers retry on failure without fabricating zero counts', () => {
    query.isError = true;
    const html = renderPage();
    expect(html).toContain('role="alert"');
    expect(html).toContain('>Retry</button>');
    expect(html).not.toContain('<dd>0</dd>');
  });
  it('labels stale data explicitly after a failed refresh', () => {
    query.data = dashboard;
    query.isError = true;
    expect(renderPage()).toContain('overview below may be out of date');
  });
});
