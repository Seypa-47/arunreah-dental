import { Link } from 'react-router-dom';
import { AdminIcon, AdminSidebar } from '@/components/layout/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { AppointmentStatus } from '@arunreah/shared';
import type { AdminDashboard } from '@/services/dashboard';
import { useAdminDashboardPageQuery } from './use-admin-dashboard-page';

const brand = { logoAlt: 'Arunreah Dental Clinic', logoUrl: '/assets/landing/footer-logo-cropped.png' };
const statusClass: Record<AppointmentStatus, string> = { CANCELLED: 'bg-red-50 text-red-700', COMPLETED: 'bg-slate-100 text-slate-700', CONFIRMED: 'bg-sky-50 text-sky-700', PENDING: 'bg-amber-50 text-amber-700' };

function Metric({ label, value }: { label: string; value: number }) { return <Card className="rounded-2xl border-[#dce5ef] p-5"><p className="text-sm text-[#71839e]">{label}</p><p className="mt-2 text-3xl font-bold text-[#182238]">{value}</p></Card>; }

function DashboardContent({ dashboard }: { dashboard: AdminDashboard }) {
  const { appointments, content } = dashboard;
  const recent = dashboard.recentAppointments ?? [];
  return <main className="min-w-0 flex-1 bg-[#f6f8fb] px-5 py-7 sm:px-8 lg:px-10"><div className="mx-auto max-w-[1440px]"><header><h1 className="text-3xl font-bold text-[#182238]">Dashboard</h1><p className="mt-1 text-[#71839e]">Your role: {dashboard.role.replaceAll('_', ' ')}</p></header>
    {appointments ? <section className="mt-8"><h2 className="text-xl font-bold text-[#182238]">Appointment overview</h2><div className="mt-4 grid gap-4 sm:grid-cols-3"><Metric label="Pending requests" value={appointments.pending} /><Metric label="Confirmed today" value={appointments.confirmedToday} /><Metric label="Confirmed this week" value={appointments.confirmedThisWeek} /></div></section> : null}
    {content ? <section className="mt-8"><h2 className="text-xl font-bold text-[#182238]">Content overview</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Object.entries(content).map(([label, metric]) => <Metric key={label} label={`${label[0]?.toUpperCase()}${label.slice(1)} (${metric.published} published)`} value={metric.total} />)}</div></section> : null}
    {appointments ? <section className="mt-8"><div className="flex items-center justify-between"><h2 className="text-xl font-bold text-[#182238]">Recent appointment requests</h2><Link className="text-sm font-semibold text-[#197da2]" to="/admin/appointments/inbox">View inbox</Link></div><Card className="mt-4 overflow-hidden rounded-2xl border-[#dce5ef]">{recent.length === 0 ? <p className="p-8 text-center text-[#71839e]">No recent appointment requests.</p> : <div className="divide-y divide-[#e1e8f0]">{recent.map((item) => <div className="flex flex-wrap items-center justify-between gap-3 p-5" key={item.id}><div><p className="font-semibold text-[#182238]">{item.patientName}</p><p className="text-sm text-[#71839e]">{item.serviceNameSnapshot} · {item.preferredDate} {item.preferredTime}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[item.status]}`}>{item.status}</span></div>)}</div>}</Card></section> : null}
  </div></main>;
}

function PageState({ error, onRetry }: { error?: boolean; onRetry?: () => void }) { return <main className="grid min-h-screen place-items-center bg-[#f6f8fb] p-6"><Card className="max-w-md p-8 text-center"><h1 className="text-2xl font-bold text-[#182238]">{error ? 'Dashboard is unavailable' : 'Loading dashboard'}</h1>{error ? <><p className="mt-3 text-[#71839e]">Please try again.</p><Button className="mt-6" onClick={onRetry}>Retry</Button></> : <AdminIcon className="mx-auto mt-5 size-6 animate-pulse text-[#2187a8]" name="dashboard" />}</Card></main>; }

export function AdminDashboardPage() { const { data, isError, isLoading, refetch } = useAdminDashboardPageQuery(); if (isLoading) return <PageState />; if (isError || !data) return <PageState error onRetry={() => void refetch()} />; return <div className="min-h-screen bg-[#f6f8fb] lg:flex"><AdminSidebar activeLabel="Dashboard" brand={brand} navigation={[]} /><DashboardContent dashboard={data} /></div>; }
