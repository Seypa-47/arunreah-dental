import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminIcon, AdminSidebar } from '@/components/layout/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { AdminDashboardContent } from '@/services/admin-dashboard';
import { useAdminDashboardPageQuery } from './use-admin-dashboard-page';

function DashboardStatus({ status }: { status: AdminDashboardContent['appointments'][number]['status'] }) {
  const className = {
    cancelled: 'border-[#ffdce0] bg-[#fff3f4] text-[#e63c45]',
    completed: 'border-[#dbe4ef] bg-[#f1f5f9] text-[#64748b]',
    confirmed: 'border-[#cbe9f7] bg-[#eef9ff] text-[#197da2]',
    pending: 'border-[#fde8b2] bg-[#fff8e8] text-[#e58800]',
  }[status];

  return <span className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-bold uppercase ${className}`}>{status}</span>;
}

function DashboardFooter({ footer }: { footer: AdminDashboardContent['footer'] }) {
  return (
    <footer className="mt-11 flex flex-wrap items-center justify-between gap-5 text-[13px] text-[#9badc5]">
      <p>{footer.copyright}</p>
      <div className="flex flex-wrap gap-7">
        <span className="inline-flex items-center gap-2"><AdminIcon className="size-4 text-[#2187a8]" name="shield" />{footer.sslLabel}</span>
        <span className="inline-flex items-center gap-2"><AdminIcon className="size-4 text-[#2187a8]" name="lock" />{footer.encryptionLabel}</span>
      </div>
    </footer>
  );
}

function RecentRequests({ content }: { content: AdminDashboardContent }) {
  const [openMenuId, setOpenMenuId] = useState<string>();

  if (content.appointments.length === 0) {
    return (
      <Card className="grid min-h-[360px] place-items-center rounded-[32px] border-[#dce5ef] px-6 text-center shadow-[0_2px_4px_rgba(15,23,42,0.03)]">
        <div>
          <h2 className="text-xl font-bold text-[#182238]">{content.empty.title}</h2>
          <p className="mt-3 text-[#71839e]">{content.empty.description}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-[32px] border-[#dce5ef] shadow-[0_2px_4px_rgba(15,23,42,0.03)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e1e8f0] px-7 py-6">
        <h2 className="text-[20px] font-bold text-[#182238]" id="recent-requests-heading">{content.table.title}</h2>
        <Link className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#197da2] hover:text-[#096d91] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8]" to="/admin/appointments/inbox">
          {content.table.viewAllLabel}
          <AdminIcon className="size-4" name="chevronRight" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[830px] border-collapse text-left">
          <thead className="bg-[#f7f9fc] text-[12px] font-bold uppercase tracking-[0.5px] text-[#61738d]">
            <tr>
              <th className="px-7 py-4">{content.table.columns.patient}</th>
              <th className="px-5 py-4">{content.table.columns.service}</th>
              <th className="px-5 py-4">{content.table.columns.dateTime}</th>
              <th className="px-5 py-4">{content.table.columns.status}</th>
              <th className="px-7 py-4 text-right">{content.table.columns.actions}</th>
            </tr>
          </thead>
          <tbody>
            {content.appointments.map((appointment) => (
              <tr className="border-t border-[#e1e8f0]" key={appointment.id}>
                <td className="px-7 py-5 text-[15px] font-semibold text-[#182238]">{appointment.patientName}</td>
                <td className="px-5 py-5 text-[15px] text-[#61738d]">{appointment.service}</td>
                <td className="px-5 py-5 text-[15px] text-[#61738d]">{appointment.scheduledAt}</td>
                <td className="px-5 py-5"><DashboardStatus status={appointment.status} /></td>
                <td className="relative px-7 py-5 text-right">
                  <button aria-expanded={openMenuId === appointment.id} aria-label={`${content.table.actionLabel} for ${appointment.patientName}`} className="rounded-lg p-1.5 text-[#2187a8] transition hover:bg-[#edf7fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8]" onClick={() => setOpenMenuId((id) => id === appointment.id ? undefined : appointment.id)} type="button">
                    <span aria-hidden="true" className="flex flex-col gap-0.5"><i className="size-1 rounded-full bg-current" /><i className="size-1 rounded-full bg-current" /><i className="size-1 rounded-full bg-current" /></span>
                  </button>
                  {openMenuId === appointment.id ? <div className="absolute right-7 top-12 z-10 w-36 rounded-xl border border-[#dce5ef] bg-white p-2 text-left shadow-[0_10px_24px_rgba(15,23,42,0.12)]"><Link className="block rounded-lg px-3 py-2 text-sm text-[#52647d] hover:bg-[#f4f8fb]" to="/admin/appointments/inbox">View request</Link></div> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function DashboardContent({ content }: { content: AdminDashboardContent }) {
  return (
    <main className="min-w-0 flex-1 bg-[#f6f8fb] px-5 py-7 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1440px] w-full">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.6px] text-[#182238] sm:text-[33px]">{content.header.title}</h1>
            <p className="mt-1 text-[16px] text-[#71839e] sm:text-[17px]">{content.header.subtitle}</p>
          </div>
          <div className="inline-flex h-[42px] items-center gap-2.5 rounded-xl border border-[#dce5ef] bg-white px-4 text-[14px] font-medium text-[#71839e]"><AdminIcon className="size-4" name="calendar" />{content.header.dateLabel}</div>
        </header>
        <section className="mt-9" aria-labelledby="recent-requests-heading">
          <RecentRequests content={content} />
        </section>
        <DashboardFooter footer={content.footer} />
      </div>
    </main>
  );
}

function DashboardSkeleton() {
  return <main aria-busy="true" aria-label="Loading admin dashboard" className="min-h-screen bg-[#f6f8fb] p-7 lg:p-11"><div className="h-10 w-72 animate-pulse rounded bg-[#e7edf3]" /><div className="mt-9 h-[410px] max-w-[1120px] animate-pulse rounded-[32px] bg-white" /></main>;
}

function DashboardUnavailable({ onRetry }: { onRetry: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-[#f6f8fb] p-6"><Card className="max-w-md p-8 text-center"><h1 className="text-2xl font-bold text-[#182238]">Dashboard is unavailable</h1><p className="mt-3 text-[#71839e]">Please refresh and try again.</p><Button className="mt-6" onClick={onRetry}>Retry</Button></Card></main>;
}

export function AdminDashboardPage() {
  const { data, isError, isLoading, refetch } = useAdminDashboardPageQuery();

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !data || data.navigation.length === 0) return <DashboardUnavailable onRetry={() => void refetch()} />;

  return <div className="min-h-screen bg-[#f6f8fb] lg:flex"><AdminSidebar activeLabel="Dashboard" brand={data.brand} navigation={data.navigation} /><DashboardContent content={data} /></div>;
}
