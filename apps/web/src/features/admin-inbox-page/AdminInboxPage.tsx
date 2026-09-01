import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import type { AdminInboxContent, AdminNavIcon } from '@/services/admin-inbox';
import { useAdminInboxPageQuery } from './use-admin-inbox-page';

type IconName = AdminNavIcon | 'calendarCheck' | 'check' | 'chevronDown' | 'chevronRight' | 'clock' | 'filter' | 'info' | 'lock' | 'search' | 'shield' | 'userAdd';

function AdminIcon({ className = 'size-5', name }: { className?: string; name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    appointments: <><path d="M8 5h8M8 3v4M16 3v4M5 9h14M6 5h12a1 1 0 0 1 1 1v13H5V6a1 1 0 0 1 1-1Z" /><path d="m9.25 14.25 1.75 1.75 3.75-4" /></>,
    calendar: <><path d="M8 5h8M8 3v4M16 3v4M5 9h14M6 5h12a1 1 0 0 1 1 1v13H5V6a1 1 0 0 1 1-1Z" /><path d="M8.5 12.5h.01M12 12.5h.01M15.5 12.5h.01M8.5 15.5h.01M12 15.5h.01" /></>,
    calendarCheck: <><path d="M8 5h8M8 3v4M16 3v4M5 9h14M6 5h12a1 1 0 0 1 1 1v13H5V6a1 1 0 0 1 1-1Z" /><path d="m9.25 14.25 1.75 1.75 3.75-4" /></>,
    check: <path d="m5 12 4.2 4.2L19 6.5" />,
    chevronDown: <path d="m7 10 5 5 5-5" />,
    chevronRight: <path d="m9 18 6-6-6-6" />,
    clinicInfo: <><circle cx="12" cy="12" r="8" /><path d="M12 10v5M12 7.4v.2" /></>,
    clock: <><circle cx="12" cy="12" r="8" /><path d="M12 7.5v4.8l3.1 1.8" /></>,
    dashboard: <><path d="M5 19V5M5 19h14" /><path d="m8 14 3-3 2.2 1.9L18 8" /></>,
    doctors: <><circle cx="12" cy="8" r="3" /><path d="M6 20v-1.4a5.6 5.6 0 0 1 12 0V20M4.5 14.5v-1.2a4 4 0 0 1 2.3-3.6M19.5 14.5v-1.2a4 4 0 0 0-2.3-3.6" /></>,
    filter: <><path d="M4 7h16M4 12h16M4 17h16" /><circle cx="9" cy="7" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="11" cy="17" r="1.5" /></>,
    inbox: <><path d="M5 7h14l1 11H4L5 7Z" /><path d="M4.5 14h4l1 2h5l1-2h4" /></>,
    info: <><circle cx="12" cy="12" r="8" /><path d="M12 11v4M12 8.2v.2" /></>,
    lock: <><path d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10" /><path d="M6 10h12v10H6z" /></>,
    search: <><circle cx="10.7" cy="10.7" r="5.7" /><path d="m15 15 4.2 4.2" /></>,
    services: <><path d="m8 7 1.7-2.5 2.3 2.3 2.3-2.3L16 7" /><path d="M4.5 17.5h15M6.5 17.5 8 9h8l1.5 8.5" /><path d="M10.5 12.5h3" /></>,
    shield: <path d="M12 3.5 5.5 6v4.6c0 4.3 2.7 7.6 6.5 9.4 3.8-1.8 6.5-5.1 6.5-9.4V6L12 3.5Z" />,
    showcase: <><rect height="13" rx="1" width="15" x="4.5" y="5.5" /><path d="m6.5 15 3.5-3.5 2.5 2.4 2-1.7 3 2.8M8 9h.01" /></>,
    userAdd: <><circle cx="10" cy="8" r="3" /><path d="M4.5 19v-1a5.5 5.5 0 0 1 9.3-4M17.5 10v6M14.5 13h6" /></>,
  };

  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

function StatusBadge({ status }: { status: 'confirmed' | 'pending' }) {
  const isPending = status === 'pending';
  return <Badge className={isPending ? 'border border-[#fde8b2] bg-[#fff8e8] text-[#e58800]' : 'border border-[#d9edf9] bg-[#eef9ff] text-[#2388ae]'}>{isPending ? 'Pending' : 'Confirmed'}</Badge>;
}

function AppointmentRow({ appointment, isSelected, onSelect }: { appointment: AdminInboxContent['appointments'][number]; isSelected: boolean; onSelect: () => void }) {
  const [date, time] = appointment.scheduledAt.split(' · ');

  return (
    <button className={`grid w-full grid-cols-[20px_1fr_auto] gap-x-4 px-7 py-6 text-left transition hover:bg-[#f8fbfd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#2187a8] ${isSelected ? 'bg-[#eef9fc]' : 'bg-white'}`} onClick={onSelect} type="button">
      <span aria-hidden="true" className={`mt-1 size-5 rounded border ${isSelected ? 'border-[#2187a8] bg-[#2187a8]' : 'border-[#9aa5b5] bg-white'}`}>{isSelected ? <AdminIcon className="size-4 text-white" name="check" /> : null}</span>
      <span>
        <span className="block text-[17px] font-bold leading-5 text-[#182238]">{appointment.patientName}</span>
        <span className="mt-2 block text-[15px] leading-5 text-[#71839e]">{appointment.service}</span>
        <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#71839e]">
          <span className="inline-flex items-center gap-1.5"><AdminIcon className="size-4" name="calendar" />{date}</span>
          <span className="inline-flex items-center gap-1.5"><AdminIcon className="size-4" name="clock" />{time}</span>
        </span>
      </span>
      <span className="text-right">
        <StatusBadge status={appointment.status} />
        <span className="mt-2 block text-[13px] text-[#9badc5]">{appointment.receivedAt}</span>
      </span>
    </button>
  );
}

function DetailEmpty({ content }: { content: AdminInboxContent['detailEmpty'] }) {
  return (
    <div className="grid h-full min-h-[420px] place-items-center px-7 py-10 text-center">
      <div className="max-w-[320px]">
        <div aria-hidden="true" className="relative mx-auto mb-9 grid size-[172px] place-items-center rounded-full bg-[#f4faff]">
          <div className="grid size-[105px] place-items-center rounded-[25px] bg-white text-[#2187a8] shadow-[0_8px_15px_rgba(15,23,42,0.10)]"><AdminIcon className="size-[53px]" name="calendarCheck" /></div>
          <div className="absolute -right-1 top-0 grid size-[44px] place-items-center rounded-xl border border-[#fde8b2] bg-[#fff9ec] text-[#df8700] shadow-sm"><AdminIcon className="size-6" name="clock" /></div>
          <div className="absolute -bottom-1 left-0 grid size-[49px] place-items-center rounded-xl bg-[#effcf7] text-[#2187a8]"><AdminIcon className="size-7" name="userAdd" /></div>
        </div>
        <h2 className="text-[22px] font-bold text-[#182238]">{content.title}</h2>
        <p className="mt-3 text-[15px] leading-6 text-[#71839e]">{content.description}</p>
        <p className="mt-11 inline-flex items-center gap-2 text-[13px] text-[#9badc5]"><AdminIcon className="size-4" name="info" />{content.meta}</p>
      </div>
    </div>
  );
}

function DetailPanel({ appointment, content }: { appointment: AdminInboxContent['appointments'][number] | undefined; content: AdminInboxContent['detailEmpty'] }) {
  if (!appointment) return <DetailEmpty content={content} />;

  return (
    <div className="p-8">
      <h2 className="text-[26px] font-bold text-[#182238]">Appointment Details</h2>
      <div className="mt-8 space-y-5 text-[#71839e]">
        <p><span className="font-semibold text-[#182238]">Patient:</span> {appointment.patientName}</p>
        <p><span className="font-semibold text-[#182238]">Service:</span> {appointment.service}</p>
        <p><span className="font-semibold text-[#182238]">Appointment:</span> {appointment.scheduledAt}</p>
        <p><span className="font-semibold text-[#182238]">Phone:</span> {appointment.phone}</p>
        <p><span className="font-semibold text-[#182238]">Email:</span> {appointment.email}</p>
      </div>
    </div>
  );
}

function InboxContent({ content }: { content: AdminInboxContent }) {
  const [query, setQuery] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>();
  const [activeFilters, setActiveFilters] = useState<AdminInboxContent['filters']['options'][number]['value'][]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const appointments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return content.appointments.filter((appointment) => {
      const matchesQuery = !normalizedQuery || [appointment.patientName, appointment.phone, appointment.email].some((field) => field.toLowerCase().includes(normalizedQuery));
      const matchesFilter = activeFilters.length === 0 || activeFilters.includes(appointment.status);
      return matchesQuery && matchesFilter;
    });
  }, [activeFilters, content.appointments, query]);
  const selectedAppointment = content.appointments.find((appointment) => appointment.id === selectedAppointmentId);

  const toggleFilter = (value: AdminInboxContent['filters']['options'][number]['value']) => {
    setActiveFilters((filters) => filters.includes(value) ? filters.filter((filter) => filter !== value) : [...filters, value]);
  };

  return (
    <main className="flex-1 bg-[#f6f8fb] px-5 py-7 sm:px-7 lg:px-[42px] lg:py-[45px]">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.6px] text-[#182238] sm:text-[33px]">{content.header.title}</h1>
          <p className="mt-1 text-[16px] text-[#71839e] sm:text-[17px]">{content.header.subtitle}</p>
        </div>
        <div className="inline-flex h-[42px] items-center gap-2.5 rounded-xl border border-[#dce5ef] bg-white px-4 text-[14px] font-medium text-[#71839e]"><AdminIcon className="size-4" name="calendar" />{content.header.dateLabel}</div>
      </header>

      <div className="mt-9 grid gap-6 xl:grid-cols-[minmax(0,1.37fr)_minmax(370px,0.92fr)]">
        <Card className="flex min-h-[610px] flex-col overflow-visible rounded-[32px] border-[#dce5ef] shadow-[0_2px_4px_rgba(15,23,42,0.03)]">
          <div className="flex flex-wrap gap-3 px-7 pb-8 pt-7">
            <label className="flex h-[46px] min-w-[230px] flex-1 items-center gap-3 rounded-xl border border-[#dce5ef] bg-[#f9fbfd] px-4 text-[#9badc5] focus-within:border-[#2187a8] focus-within:ring-2 focus-within:ring-[#2187a8]/20">
              <AdminIcon className="size-6" name="search" />
              <span className="sr-only">Search appointments</span>
              <input className="min-w-0 flex-1 bg-transparent text-[14px] text-[#182238] outline-none placeholder:text-[#a9b7c9]" onChange={(event) => setQuery(event.target.value)} placeholder={content.searchPlaceholder} type="search" value={query} />
            </label>
            <div className="relative">
              <Button aria-expanded={filtersOpen} className="h-[46px] rounded-xl border border-[#dce5ef] px-4 text-[14px] font-semibold text-[#71839e] shadow-none hover:bg-[#f3f8fb]" icon={<AdminIcon className="size-4" name="filter" />} onClick={() => setFiltersOpen((open) => !open)} variant="secondary">
                {content.filters.label}
                <span className="grid size-6 place-items-center rounded-full bg-[#2187a8] text-xs text-white">{activeFilters.length || content.filters.options.length}</span>
              </Button>
              {filtersOpen ? <div className="absolute right-0 z-20 mt-2 w-[210px] rounded-2xl border border-[#dce5ef] bg-white p-3 shadow-[0_14px_32px_rgba(15,23,42,0.12)]">
                {content.filters.options.map((filter) => <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[#52647d] hover:bg-[#f4f8fb]" key={filter.value}><input checked={activeFilters.includes(filter.value)} className="size-4 accent-[#2187a8]" onChange={() => toggleFilter(filter.value)} type="checkbox" />{filter.label}</label>)}
              </div> : null}
            </div>
          </div>
          <div className="border-t border-[#e1e8f0]">
            {appointments.length > 0 ? appointments.map((appointment) => <div className="border-b border-[#e1e8f0] last:border-b-0" key={appointment.id}><AppointmentRow appointment={appointment} isSelected={appointment.id === selectedAppointmentId} onSelect={() => setSelectedAppointmentId(appointment.id)} /></div>) : <div className="grid min-h-[300px] place-items-center px-8 text-center"><p className="text-[18px] text-[#71839e]">No appointments match your search or filters.</p></div>}
          </div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-[#e1e8f0] px-7 py-6 text-[13px] text-[#9badc5]">
            <span>{content.pagination.summary}</span>
            <div className="flex gap-2" aria-label="Pagination">
              {content.pagination.pages.map((page) => <button aria-current={page === 1 ? 'page' : undefined} className={`grid size-8 place-items-center rounded-lg border text-[13px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8] ${page === 1 ? 'border-transparent bg-[#edf3f8] text-[#2187a8]' : 'border-[#dce5ef] bg-white text-[#71839e] hover:bg-[#f4f8fb]'}`} key={page} type="button">{page}</button>)}
              <button aria-label={content.pagination.nextLabel} className="grid size-8 place-items-center rounded-lg border border-[#dce5ef] bg-white text-[#71839e] hover:bg-[#f4f8fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8]" type="button"><AdminIcon className="size-4" name="chevronRight" /></button>
            </div>
          </div>
        </Card>
        <Card className="min-h-[610px] overflow-hidden rounded-[32px] border-[#dce5ef] shadow-[0_2px_4px_rgba(15,23,42,0.03)]"><DetailPanel appointment={selectedAppointment} content={content.detailEmpty} /></Card>
      </div>

      <footer className="mt-11 flex flex-wrap items-center justify-between gap-5 text-[13px] text-[#9badc5]">
        <p>{content.footer.copyright}</p>
        <div className="flex flex-wrap gap-7"><span className="inline-flex items-center gap-2"><AdminIcon className="size-4 text-[#2187a8]" name="shield" />{content.footer.sslLabel}</span><span className="inline-flex items-center gap-2"><AdminIcon className="size-4 text-[#2187a8]" name="lock" />{content.footer.encryptionLabel}</span></div>
      </footer>
    </main>
  );
}

function InboxSkeleton() {
  return <main aria-busy="true" aria-label="Loading appointment inbox" className="min-h-screen bg-[#f6f8fb] p-7 lg:p-11"><div className="h-10 w-64 animate-pulse rounded bg-[#e7edf3]" /><div className="mt-9 grid gap-6 xl:grid-cols-[1.37fr_0.92fr]"><div className="h-[610px] animate-pulse rounded-[32px] bg-white" /><div className="h-[610px] animate-pulse rounded-[32px] bg-white" /></div></main>;
}

function InboxUnavailable({ onRetry }: { onRetry: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-[#f6f8fb] p-6"><Card className="max-w-md p-8 text-center"><h1 className="text-2xl font-bold text-[#182238]">Appointment inbox is unavailable</h1><p className="mt-3 text-[#71839e]">Please refresh and try again.</p><Button className="mt-6" onClick={onRetry}>Retry</Button></Card></main>;
}

export function AdminInboxPage() {
  const { data, isError, isLoading, refetch } = useAdminInboxPageQuery();

  if (isLoading) return <InboxSkeleton />;
  if (isError || !data || data.navigation.length === 0) return <InboxUnavailable onRetry={() => void refetch()} />;

  return <div className="min-h-screen bg-[#f6f8fb] lg:flex"><AdminSidebar activeLabel="Inbox" brand={data.brand} navigation={data.navigation} /><InboxContent content={data} /></div>;
}
