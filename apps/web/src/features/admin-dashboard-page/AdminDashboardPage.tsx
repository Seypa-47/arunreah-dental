import type { AdminRole, AppointmentStatus, DashboardContentSummary } from '@arunreah/shared';
import { Link } from 'react-router-dom';
import { AdminPageHeading } from '@/components/layout/admin-workspace';
import { AdminFeedback, AdminStatus } from '@/components/admin/admin-feedback';
import { Button } from '@/components/ui/button';
import { useAdminSession } from '@/features/admin-auth/session-provider';
import { canAccessAdminPath } from '@/routes/admin-route-access';
import type { AdminDashboard } from '@/services/dashboard';
import { useAdminDashboardPageQuery } from './use-admin-dashboard-page';

const statusPresentation: Record<
  AppointmentStatus,
  { label: string; tone: 'warning' | 'neutral' | 'success' }
> = {
  PENDING: { label: 'Pending', tone: 'warning' },
  CONFIRMED: { label: 'Confirmed', tone: 'neutral' },
  COMPLETED: { label: 'Completed', tone: 'success' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral' },
};
const contentAreas: { key: keyof DashboardContentSummary; label: string; to: string }[] = [
  { key: 'services', label: 'Services', to: '/admin/services' },
  { key: 'doctors', label: 'Doctors', to: '/admin/doctors' },
  { key: 'showcases', label: 'Showcases', to: '/admin/showcase' },
  { key: 'branches', label: 'Branches', to: '/admin/clinic-info/branches' },
];
const count = (value: number | undefined) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? String(value) : 'Unavailable';

function AppointmentOverview({ dashboard }: { dashboard: AdminDashboard }) {
  const summary = dashboard.appointments;
  const recent = dashboard.recentAppointments;
  return (
    <section className="admin-dashboard-section" aria-labelledby="appointment-overview-title">
      <div className="admin-dashboard-section-heading">
        <div>
          <h2 id="appointment-overview-title">Appointment requests</h2>
          <p className="admin-description">Review requests before confirming an appointment.</p>
        </div>
        <Link className="admin-dashboard-link" to="/admin/appointments">
          All appointments →
        </Link>
      </div>
      {summary ? (
        <dl className="admin-dashboard-metrics">
          <div className="admin-dashboard-priority">
            <dt>Pending requests</dt>
            <dd>
              {count(summary.pending)}
              <p>
                {summary.pending === 0
                  ? 'No pending requests right now.'
                  : 'Open the inbox to review pending requests.'}
              </p>
            </dd>
          </div>
          <div>
            <dt>Confirmed today</dt>
            <dd>
              {count(summary.confirmedToday)}
              <p>Appointments confirmed for today.</p>
            </dd>
          </div>
          <div>
            <dt>Confirmed this week</dt>
            <dd>
              {count(summary.confirmedThisWeek)}
              <p>Includes today within the clinic week.</p>
            </dd>
          </div>
        </dl>
      ) : (
        <AdminFeedback title="Appointment counts unavailable" tone="empty">
          <p>You can still review requests in appointment management.</p>
        </AdminFeedback>
      )}
      <div className="admin-dashboard-recent-heading">
        <h3>Recent requests</h3>
        <p>Up to five most recently submitted requests, across all statuses.</p>
      </div>
      {recent === undefined ? (
        <AdminFeedback title="Recent requests unavailable" tone="empty">
          <p>Open appointment management to review current requests.</p>
        </AdminFeedback>
      ) : recent.length === 0 ? (
        <AdminFeedback title="No recent requests" tone="empty">
          <p>New appointment requests will appear here when they are received.</p>
        </AdminFeedback>
      ) : (
        <ul className="admin-dashboard-requests">
          {recent.map((item) => {
            const status = statusPresentation[item.status];
            return (
              <li key={item.id}>
                <Link
                  className="admin-dashboard-request"
                  to={
                    '/admin/appointments?' +
                    new URLSearchParams({ search: item.reference, page: '1' })
                  }
                >
                  <div className="admin-dashboard-patient">
                    <strong>{item.patientName || 'Name unavailable'}</strong>
                    <span>{item.serviceNameSnapshot || 'Service unavailable'}</span>
                    <small>Reference: {item.reference}</small>
                  </div>
                  <div className="admin-dashboard-request-time">
                    <span>Requested date &amp; time</span>
                    <strong>
                      {item.preferredDate || 'Date unavailable'} ·{' '}
                      {item.preferredTime || 'Time unavailable'}
                    </strong>
                  </div>
                  <div className="admin-dashboard-request-action">
                    <AdminStatus tone={status.tone}>{status.label}</AdminStatus>
                    <span>Review request →</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ContentOverview({ dashboard, role }: { dashboard: AdminDashboard; role: AdminRole }) {
  return (
    <section className="admin-dashboard-section" aria-labelledby="content-overview-title">
      <div className="admin-dashboard-section-heading">
        <div>
          <h2 id="content-overview-title">Website content</h2>
          <p className="admin-description">
            Check publication status and open an area to review its content. Drafts are not visible
            on the website.
          </p>
        </div>
      </div>
      {!dashboard.content ? (
        <AdminFeedback title="Content counts unavailable" tone="empty">
          <p>Management links remain available below.</p>
        </AdminFeedback>
      ) : null}
      <ul className="admin-dashboard-content-list">
        {contentAreas
          .filter((area) => canAccessAdminPath(role, area.to))
          .map((area) => {
            const metric = dashboard.content?.[area.key];
            return (
              <li key={area.key}>
                <div>
                  <Link className="admin-dashboard-link" to={area.to}>
                    Manage {area.label.toLowerCase()} →
                  </Link>
                  {metric?.total === 0 ? (
                    <p className="admin-helper">No {area.label.toLowerCase()} added yet.</p>
                  ) : null}
                </div>
                {metric ? (
                  <dl className="admin-dashboard-content-counts">
                    <div>
                      <dt>Drafts</dt>
                      <dd className={metric.draft > 0 ? 'admin-dashboard-drafts' : undefined}>
                        {count(metric.draft)}
                      </dd>
                    </div>
                    <div>
                      <dt>Published</dt>
                      <dd>{count(metric.published)}</dd>
                    </div>
                    <div>
                      <dt>Archived</dt>
                      <dd>{count(metric.archived)}</dd>
                    </div>
                    <div>
                      <dt>Total</dt>
                      <dd>{count(metric.total)}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="admin-helper">Counts unavailable</p>
                )}
              </li>
            );
          })}
      </ul>
    </section>
  );
}

export function DashboardContent({
  dashboard,
  role,
}: {
  dashboard: AdminDashboard;
  role: AdminRole;
}) {
  const appointmentAccess = canAccessAdminPath(role, '/admin/appointments');
  const contentAccess = canAccessAdminPath(role, '/admin/services');
  return (
    <>
      {appointmentAccess ? <AppointmentOverview dashboard={dashboard} /> : null}
      {contentAccess ? <ContentOverview dashboard={dashboard} role={role} /> : null}
      {contentAccess ? (
        <section className="admin-dashboard-tools" aria-labelledby="dashboard-tools-title">
          <h2 id="dashboard-tools-title">Clinic and website settings</h2>
          <div>
            {[
              { label: 'Clinic information', to: '/admin/clinic-info' },
              { label: 'Contact settings', to: '/admin/clinic-info/contact' },
              { label: 'Page media', to: '/admin/page-media' },
              { label: 'About timeline', to: '/admin/about-timeline' },
              { label: 'Staff accounts', to: '/admin/admins' },
            ]
              .filter((item) => canAccessAdminPath(role, item.to))
              .map((item) => (
                <Link className="admin-dashboard-link" key={item.to} to={item.to}>
                  {item.label} →
                </Link>
              ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

export function AdminDashboardPage() {
  const { admin } = useAdminSession();
  const { data, isError, isLoading, isFetching, refetch } = useAdminDashboardPageQuery();
  if (!admin) return null;
  const appointments = canAccessAdminPath(admin.role, '/admin/appointments');
  return (
    <main className="admin-dashboard min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <header className="admin-dashboard-header">
          <AdminPageHeading />
          <Link
            className="admin-dashboard-primary"
            to={
              appointments ? '/admin/appointments/inbox?status=PENDING&page=1' : '/admin/services'
            }
          >
            {appointments ? 'Review pending requests' : 'Manage services'} →
          </Link>
        </header>
        {isLoading ? (
          <div className="admin-dashboard-section" aria-busy="true">
            <AdminFeedback title="Loading dashboard…" tone="loading">
              <p>Retrieving the latest overview. You can still open management pages.</p>
            </AdminFeedback>
          </div>
        ) : null}
        {isError || (!isLoading && !data) ? (
          <div className="admin-dashboard-section">
            <AdminFeedback
              title={data ? 'Dashboard could not refresh' : 'Dashboard is unavailable'}
              tone="error"
              actions={
                <Button disabled={isFetching} onClick={() => void refetch()} variant="secondary">
                  {isFetching ? 'Retrying…' : 'Retry'}
                </Button>
              }
            >
              <p>
                {data
                  ? 'The overview below may be out of date. Retry to retrieve current information.'
                  : 'Please try again. Management pages are still available from the navigation.'}
              </p>
            </AdminFeedback>
          </div>
        ) : null}
        {data && !isLoading ? <DashboardContent dashboard={data} role={admin.role} /> : null}
      </div>
    </main>
  );
}
