import { AdminFeedback, AdminStatus } from '@/components/admin/admin-feedback';
import { AdminListEmpty, AdminListPagination } from '@/components/admin/admin-list';
import { AdminPageHeading } from '@/components/layout/admin-workspace';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ApiClientError } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import {
  getAdminAppointment,
  getAdminAppointments,
  normalizeAppointmentFilters,
  updateAdminAppointmentStatus,
  type AppointmentDetail,
  type AppointmentListFilters,
  type AppointmentListItem,
} from '@/services/appointments';
import type { AppointmentStatus } from '@arunreah/shared';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

const statuses: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

function useDebounced(value: string, delay = 350) {
  const [result, setResult] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setResult(value), delay);
    return () => window.clearTimeout(id);
  }, [delay, value]);
  return result;
}

function safeMessage(error: unknown) {
  if (error instanceof ApiClientError && error.status === 404) return 'This appointment could not be found.';
  if (error instanceof ApiClientError && error.status === 409) return 'This appointment was changed by another staff member. Reload and try again.';
  return 'We could not load appointment information. Please try again.';
}

function nextStatuses(status: AppointmentStatus): AppointmentStatus[] {
  return status === 'PENDING' ? ['CONFIRMED', 'CANCELLED'] : status === 'CONFIRMED' ? ['COMPLETED', 'CANCELLED'] : [];
}

function statusLabel(status: AppointmentStatus) {
  return status[0] + status.slice(1).toLowerCase();
}

function statusTone(status: AppointmentStatus) {
  if (status === 'PENDING') return 'warning' as const;
  if (status === 'CONFIRMED' || status === 'COMPLETED') return 'success' as const;
  return 'neutral' as const;
}

function actionLabel(status: AppointmentStatus) {
  if (status === 'CONFIRMED') return 'Confirm request';
  if (status === 'COMPLETED') return 'Mark completed';
  return 'Cancel request';
}

function formatPreferredDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return <AdminStatus tone={statusTone(status)}>{statusLabel(status)}</AdminStatus>;
}

function AppointmentRow({ appointment, selected, onSelect }: { appointment: AppointmentListItem; onSelect: () => void; selected: boolean }) {
  return <button
    aria-pressed={selected}
    className={`admin-list-item w-full border-l-4 p-4 text-left transition sm:p-5 ${selected ? 'border-l-[#2187a8] bg-[#eef9fc]' : appointment.status === 'PENDING' ? 'border-l-[#e2a33b] bg-[#fffcf5] hover:bg-[#fff9eb]' : 'border-l-transparent hover:bg-[#f8fbfd]'}`}
    onClick={onSelect}
    type="button"
  >
    <div className="flex flex-wrap items-start justify-between gap-2">
      <span className="min-w-0"><span className="block truncate font-semibold text-[#182238]">{appointment.patient.name}</span><span className="mt-1 block text-xs text-[#71839e]">{appointment.reference}</span></span>
      <AppointmentStatusBadge status={appointment.status} />
    </div>
    <div className="mt-3 grid gap-1.5 text-sm text-[#52647d] sm:grid-cols-2">
      <span className="truncate"><span className="text-[#71839e]">Service: </span>{appointment.service.nameSnapshot}</span>
      <span><span className="text-[#71839e]">Preferred: </span>{formatPreferredDate(appointment.preferredDate)} · {appointment.preferredTime}</span>
      <span className="truncate"><span className="text-[#71839e]">Branch: </span>{appointment.branch.nameSnapshot}</span>
      <span className="truncate"><span className="text-[#71839e]">Doctor: </span>{appointment.doctor?.nameSnapshot ?? 'No preference'}</span>
    </div>
  </button>;
}

function DetailItem({ children, label }: { children: ReactNode; label: string }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[#71839e]">{label}</dt><dd className="mt-1 break-words text-sm leading-6 text-[#182238]">{children}</dd></div>;
}

function AppointmentDetailPanel({
  appointment,
  isUpdating,
  onChangeStatus,
  updateError,
}: {
  appointment: AppointmentDetail;
  isUpdating: boolean;
  onChangeStatus: (status: AppointmentStatus) => void;
  updateError: unknown;
}) {
  const validNextStatuses = nextStatuses(appointment.status);
  return <div>
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#edf1f5] pb-5">
      <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2187a8]">Appointment request</p><h2 className="mt-1 text-xl font-bold text-[#182238]">{appointment.patient.name}</h2><p className="mt-1 text-sm text-[#71839e]">Reference {appointment.reference}</p></div>
      <AppointmentStatusBadge status={appointment.status} />
    </div>

    <section aria-labelledby="patient-information" className="pt-5">
      <h3 className="text-sm font-bold text-[#182238]" id="patient-information">Patient information</h3>
      <dl className="mt-3 grid gap-4 sm:grid-cols-2">
        <DetailItem label="Phone"><a className="font-medium text-[#167ea7] underline-offset-2 hover:underline" href={`tel:${appointment.patient.phone}`}>{appointment.patient.phone}</a><span className="ml-2 text-xs text-[#71839e]">Call</span></DetailItem>
        <DetailItem label="Email"><a className="font-medium text-[#167ea7] underline-offset-2 hover:underline" href={`mailto:${appointment.patient.email}`}>{appointment.patient.email}</a><span className="ml-2 text-xs text-[#71839e]">Email</span></DetailItem>
      </dl>
    </section>

    <section aria-labelledby="request-details" className="mt-6 border-t border-[#edf1f5] pt-5">
      <h3 className="text-sm font-bold text-[#182238]" id="request-details">Requested appointment details</h3>
      <dl className="mt-3 grid gap-4 sm:grid-cols-2">
        <DetailItem label="Requested service">{appointment.service.nameSnapshot}</DetailItem>
        <DetailItem label="Preferred date and time"><time dateTime={`${appointment.preferredDate}T${appointment.preferredTime}`}>{formatPreferredDate(appointment.preferredDate)} · {appointment.preferredTime}</time></DetailItem>
        <DetailItem label="Branch preference">{appointment.branch.nameSnapshot}</DetailItem>
        <DetailItem label="Doctor preference">{appointment.doctor?.nameSnapshot ?? 'No preference'}</DetailItem>
      </dl>
      {appointment.notes ? <div className="mt-4 rounded-lg bg-[#f7fafc] p-3"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#71839e]">Patient notes</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#182238]">{appointment.notes}</p></div> : null}
    </section>

    <section aria-labelledby="staff-actions" className="mt-6 border-t border-[#edf1f5] pt-5">
      <h3 className="text-sm font-bold text-[#182238]" id="staff-actions">Staff actions</h3>
      <p className="mt-1 text-sm leading-6 text-[#71839e]">This is a request. Contact the patient and confirm availability before confirming it.</p>
      {validNextStatuses.length ? <div className="mt-4 flex flex-wrap gap-2">{validNextStatuses.map((status) => <Button disabled={isUpdating} key={status} onClick={() => onChangeStatus(status)} type="button" variant={status === 'CONFIRMED' || status === 'COMPLETED' ? 'primary' : 'secondary'}>{isUpdating ? 'Updating…' : actionLabel(status)}</Button>)}</div> : <AdminFeedback title="No further status actions" tone="empty"><p>{appointment.status === 'COMPLETED' ? 'This appointment is marked completed.' : 'This appointment has been cancelled.'}</p></AdminFeedback>}
      {updateError ? <p className="mt-3 text-sm text-[#c92727]" role="alert">{safeMessage(updateError)}</p> : null}
    </section>
  </div>;
}

export function AppointmentList({ inbox }: { inbox: boolean }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [selectedId, setSelectedId] = useState<string>();
  const [actionNotice, setActionNotice] = useState<string>();
  const debouncedSearch = useDebounced(search);
  const requestedStatus = (searchParams.get('status') as AppointmentStatus | null) ?? undefined;
  const filters: AppointmentListFilters = normalizeAppointmentFilters({
    page: Number(searchParams.get('page') ?? '1'),
    limit: 20,
    search: debouncedSearch || undefined,
    status: inbox ? 'PENDING' : requestedStatus,
  });
  const listQuery = useQuery({ placeholderData: keepPreviousData, queryFn: () => getAdminAppointments(filters), queryKey: queryKeys.admin.appointments(filters), retry: false });
  const detailQuery = useQuery({ enabled: Boolean(selectedId), queryFn: () => getAdminAppointment(selectedId!), queryKey: queryKeys.admin.appointment(selectedId ?? 'none'), retry: false });
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) => updateAdminAppointmentStatus(id, { status }),
    onSuccess: async (_result, variables) => {
      setActionNotice(`Request marked ${statusLabel(variables.status).toLowerCase()}.`);
      if (inbox) setSelectedId(undefined);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'appointments'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() }),
      ]);
    },
  });
  const setFilter = (status: string) => {
    const next = new URLSearchParams(searchParams);
    if (status) next.set('status', status); else next.delete('status');
    next.set('page', '1');
    setSearchParams(next);
  };
  const setPage = (page: number) => { const next = new URLSearchParams(searchParams); next.set('page', String(page)); setSearchParams(next); };
  const clearFilters = () => { setSearch(''); const next = new URLSearchParams(searchParams); next.delete('search'); if (!inbox) next.delete('status'); next.set('page', '1'); setSearchParams(next); };
  const title = inbox ? 'Appointment inbox' : 'All appointments';

  if (listQuery.isLoading) return <main aria-busy="true" aria-label="Loading appointments" className="grid min-h-screen place-items-center bg-[#f6f8fb]"><AdminFeedback title="Loading appointment requests…" tone="loading" /></main>;
  if (listQuery.isError || !listQuery.data) return <main className="grid min-h-screen place-items-center bg-[#f6f8fb] p-6"><Card className="max-w-md p-8 text-center"><h1 className="text-xl font-bold">Appointments are unavailable</h1><p className="mt-3 text-[#71839e]">{safeMessage(listQuery.error)}</p><Button className="mt-5" onClick={() => void listQuery.refetch()}>Retry</Button></Card></main>;

  const { appointments, meta } = listQuery.data;
  return <div className="min-h-screen bg-[#f6f8fb] lg:flex"><main className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-8"><div className="mx-auto max-w-[1400px]"><header aria-label={title}><AdminPageHeading /><p className="admin-description">{inbox ? 'Review new appointment requests first. These are not automatically confirmed bookings.' : 'Search appointment requests and review their current status.'}</p></header>
    {actionNotice ? <div aria-live="polite" className="mt-5"><AdminFeedback title={actionNotice} tone="success" /></div> : null}
    <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(22rem,.88fr)]">
      <Card className="overflow-hidden rounded-2xl border-[#dce5ef] bg-white shadow-none">
        <div className="border-b border-[#edf1f5] p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-[#182238]">{inbox ? 'Pending requests' : 'Appointment requests'}</h2><p className="mt-1 text-sm text-[#71839e]">{meta.total} request{meta.total === 1 ? '' : 's'} {inbox ? 'awaiting review' : 'matching the current view'}</p></div>{inbox ? <AppointmentStatusBadge status="PENDING" /> : null}</div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row"><label className="flex min-h-11 min-w-0 flex-1 items-center rounded-lg border border-[#dce5ef] bg-white px-3 focus-within:border-[#2187a8] focus-within:ring-2 focus-within:ring-[#2187a8]/20"><span className="sr-only">Search appointments</span><input aria-label="Search appointments" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#8a9ab0]" onChange={(event) => { setSearch(event.target.value); const next = new URLSearchParams(searchParams); next.set('page', '1'); if (event.target.value) next.set('search', event.target.value); else next.delete('search'); setSearchParams(next, { replace: true }); }} placeholder="Search name, phone, email, or reference" type="search" value={search} /></label>{!inbox ? <label className="flex min-h-11 items-center rounded-lg border border-[#dce5ef] bg-white px-3"><span className="sr-only">Filter appointments by status</span><select aria-label="Filter appointments by status" className="w-full bg-transparent text-sm text-[#182238] outline-none" onChange={(event) => setFilter(event.target.value)} value={filters.status ?? ''}><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label> : null}</div>
        </div>
        {listQuery.isFetching ? <p className="border-b border-[#edf1f5] px-5 py-2 text-xs text-[#71839e]" role="status">Updating requests…</p> : null}
        <div aria-busy={listQuery.isFetching} className="divide-y divide-[#edf1f5]">{appointments.length === 0 ? <div className="p-5"><AdminListEmpty noun="appointments" filtered={Boolean(search || (!inbox && filters.status) || (filters.page ?? 1) > 1)} onClear={clearFilters} /></div> : appointments.map((appointment) => <AppointmentRow appointment={appointment} key={appointment.id} onSelect={() => { setSelectedId(appointment.id); setActionNotice(undefined); }} selected={selectedId === appointment.id} />)}</div>
        <AdminListPagination busy={listQuery.isFetching} count={appointments.length} limit={meta.limit} noun="appointments" onPageChange={setPage} page={meta.page} total={meta.total} totalPages={meta.totalPages} />
      </Card>
      <Card className="h-fit rounded-2xl border-[#dce5ef] bg-white p-5 shadow-none sm:p-6 xl:sticky xl:top-6">{!selectedId ? <AdminFeedback title="Select an appointment request" tone="empty"><p>Choose a request to see the patient contact details, requested visit, and valid staff actions.</p></AdminFeedback> : detailQuery.isLoading ? <AdminFeedback title="Loading appointment details…" tone="loading" /> : detailQuery.isError || !detailQuery.data ? <AdminFeedback actions={<Button onClick={() => void detailQuery.refetch()} variant="secondary">Retry</Button>} title="Appointment details are unavailable" tone="error"><p>{safeMessage(detailQuery.error)}</p></AdminFeedback> : <AppointmentDetailPanel appointment={detailQuery.data} isUpdating={mutation.isPending} onChangeStatus={(status) => mutation.mutate({ id: detailQuery.data.id, status })} updateError={mutation.error} />}</Card>
    </div>
  </div></main></div>;
}
