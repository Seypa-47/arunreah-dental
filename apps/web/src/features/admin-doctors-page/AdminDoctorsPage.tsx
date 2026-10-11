import { AdminListDate, AdminListEmpty, AdminListPagination, AdminPublicationStatus } from '@/components/admin/admin-list';
import { AdminFeedback, AdminStatus } from '@/components/admin/admin-feedback';
import { AdminPageHeading } from '@/components/layout/admin-workspace';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminDoctorListQuery, ReorderDoctorsInput, TeamCategory } from '@arunreah/shared';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AdminIcon } from '@/components/layout/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toAdminDoctorDetail, type AdminDoctor, type AdminDoctorsContent, type DoctorStatus } from '@/services/admin-doctors';
import { queryKeys } from '@/lib/query-keys';
import { useAdminDoctorsPageQuery } from './use-admin-doctors-page';
import { cmsApi } from '@/services/cms';
import { invalidateCmsDomain } from '@/services/cms-cache';
import { sanitizeDoctorUpdatePayload } from './doctor-payload';
import { isTeamCategory, moveIdRelative, teamCategoryLabel, teamCategoryTabs, teamMemberSaveError } from './team-workspace';
import { TeamMemberForm } from './TeamMemberForm';

function StatusBadge({ status }: { status: DoctorStatus }) { return <AdminPublicationStatus status={status} />; }

function DoctorAvatar({
  doctor,
  size = 'md',
}: {
  doctor: Pick<AdminDoctor, 'avatarBgColor' | 'imageAlt' | 'imageUrl' | 'initials' | 'name'>;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'size-10 text-xs',
    md: 'size-12 text-sm',
    lg: 'size-14 text-base',
  };

  if (doctor.imageUrl) {
    return (
      <img
        alt={doctor.imageAlt || doctor.name}
        className={`${sizeClasses[size]} shrink-0 rounded-full object-cover border border-[#e1e8f0] shadow-sm`}
        src={doctor.imageUrl}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} shrink-0 rounded-full font-bold flex items-center justify-center border border-[#d3e2ee] ${
        doctor.avatarBgColor || 'bg-[#e4eff8] text-[#1c6e8c]'
      }`}
    >
      {doctor.initials || doctor.name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function DoctorsFooter({ footer }: { footer: AdminDoctorsContent['footer'] }) {
  return (
    <footer className="mt-12 flex flex-wrap items-center justify-between gap-5 text-[13px] text-[#9badc5]">
      <p>{footer.copyright}</p>
      <div className="flex gap-7">
        <span className="inline-flex items-center gap-2">
          <AdminIcon className="size-4 text-[#2187a8]" name="shield" />
          {footer.sslLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <AdminIcon className="size-4 text-[#2187a8]" name="lock" />
          {footer.encryptionLabel}
        </span>
      </div>
    </footer>
  );
}

function DoctorDetailPanel({ doctor, isSaving = false, saveError = null, saveSuccess = false, onClose, onDelete, onSave }: {
  doctor: AdminDoctor;
  isSaving?: boolean;
  saveError?: string | null;
  saveSuccess?: boolean;
  onClose?: () => void;
  onDelete: (id: string) => void;
  onSave: (updated: AdminDoctor) => void;
}) {
  return <TeamMemberForm initialValue={doctor} mode="edit" onCancel={onClose ?? (() => undefined)} onDelete={() => onDelete(doctor.id)} onSubmit={onSave} saveError={saveError} saveSuccess={saveSuccess} saving={isSaving} />;
}

export function NoDoctorSelectedPanel() {
  return (
    <aside
      aria-label="No doctor selected"
      className="flex min-h-[580px] flex-col items-center justify-center rounded-[28px] border border-[#e1e8f0] bg-white p-8 text-center shadow-[0_2px_4px_rgba(15,23,42,0.02)] xl:p-10"
    >
      {/* Illustration */}
      <div className="relative mb-6 flex size-36 items-center justify-center rounded-full bg-[#f0f7fb]">
        {/* Main tile */}
        <div className="flex size-20 items-center justify-center rounded-2xl border border-[#edf2f7] bg-white shadow-[0_4px_16px_rgba(15,23,42,0.06)]">
          <svg
            aria-hidden="true"
            className="size-10 text-[#2187a8]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-5 13c-1.66 0-3 1.34-3 3v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-1.66-1.34-3-3-3h-1.08c-.46.73-1.12 1.32-1.92 1.71V19a2 2 0 1 1-4 0v-1.29c-.8-.39-1.46-.98-1.92-1.71H7z" />
          </svg>
        </div>
        {/* Overlapping pencil edit badge */}
        <div className="absolute -bottom-1 -right-1 flex size-10 items-center justify-center rounded-2xl border border-[#e2e8f0] bg-white text-[#71839e] shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
          <svg
            aria-hidden="true"
            className="size-5 text-[#8699b0]"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>
      </div>

      {/* Heading & Subtitle */}
      <h2 className="text-[20px] font-bold text-[#182238]">No Doctor Selected</h2>
      <p className="mt-3 max-w-[320px] text-[14px] leading-relaxed text-[#71839e]">
        Select a doctor from the list on the left to view and manage their profile details, specialty,
        and website presence.
      </p>

      {/* Quick tip pill */}
      <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#eef7fb] px-5 py-2.5 text-[13px] font-medium text-[#2187a8]">
        <svg
          aria-hidden="true"
          className="size-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <span>Quick Tip: You can also use the search bar</span>
      </div>
    </aside>
  );
}

function TeamEmptyState({ description, noun, onAdd }: { description: string; noun: string; onAdd: () => void }) {
  return (
    <div className="flex min-h-[28rem] flex-col items-center justify-center p-8 text-center sm:p-12">
      {/* Decorative circular disc */}
      <div className="relative mb-7 flex size-44 items-center justify-center rounded-full bg-[#edf6fb]">
        {/* Floating sparkles / stars */}
        <span
          aria-hidden="true"
          className="absolute left-6 top-4 select-none text-base font-bold text-[#b5d5e5]"
        >
          +
        </span>
        <span
          aria-hidden="true"
          className="absolute right-7 top-5 select-none text-sm text-[#b5d5e5]"
        >
          ★
        </span>
        <span
          aria-hidden="true"
          className="absolute bottom-6 left-6 select-none text-xs font-bold text-[#b5d5e5]"
        >
          •
        </span>

        {/* Main tile */}
        <div className="flex size-24 items-center justify-center rounded-2xl border border-[#edf2f7] bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
          <svg
            aria-hidden="true"
            className="size-12 text-[#2187a8]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-5 13c-1.66 0-3 1.34-3 3v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-1.66-1.34-3-3-3h-1.08c-.46.73-1.12 1.32-1.92 1.71V19a2 2 0 1 1-4 0v-1.29c-.8-.39-1.46-.98-1.92-1.71H7z" />
          </svg>
        </div>

        {/* Overlapping clipboard/list badge */}
        <div className="absolute bottom-2 right-2 flex size-12 items-center justify-center rounded-2xl border border-[#e2e8f0] bg-white text-[#71839e] shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
          <svg
            aria-hidden="true"
            className="size-6 text-[#8699b0]"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <rect height="16" rx="2" width="12" x="6" y="4" />
            <path d="M9 2h6v3H9z" />
            <path d="M10 10h4M10 14h4" />
          </svg>
        </div>
      </div>

      {/* Text */}
      <h2 className="text-[24px] font-bold text-[#182238]">No {noun} yet</h2>
      <p className="mt-3 max-w-[460px] text-[15px] leading-relaxed text-[#71839e]">
        {description}
      </p>

      {/* Button */}
      <Button
        className="mt-7 h-11 rounded-xl bg-[#2187a8] px-6 text-[14px] font-bold text-white shadow-[0_6px_14px_rgba(33,135,168,0.2)] hover:bg-[#1a718c]"
        icon={<span aria-hidden="true" className="text-lg leading-none font-bold">+</span>}
        onClick={onAdd}
      >
        Add Team Member
      </Button>

      {/* Tip */}
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f0f4f8] px-4 py-2 text-[12px] font-medium text-[#71839e]">
        <svg
          aria-hidden="true"
          className="size-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <span>Tip: Team profiles can be saved as drafts before publishing.</span>
      </div>
    </div>
  );
}

type DoctorListState = Pick<AdminDoctorListQuery, 'page' | 'limit' | 'search' | 'status' | 'specialty' | 'category' | 'sort' | 'order'>;
type TeamCategoryCounts = Record<'ALL' | TeamCategory, number | undefined>;

function DoctorsContent({ content, listState, onListStateChange, busy, categoryCounts }: { busy: boolean; categoryCounts: TeamCategoryCounts; content: AdminDoctorsContent; listState: DoctorListState; onListStateChange: (next: DoctorListState) => void }) {
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const queryClient = useQueryClient();
  const [doctors, setDoctors] = useState<AdminDoctor[]>(content.doctors);
  const [selectedId, setSelectedId] = useState<string | null>(doctorId ?? null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [reorderNotice, setReorderNotice] = useState<{ tone: 'error' | 'success'; title: string; message: string } | null>(null);
  useEffect(() => { setDoctors(content.doctors); }, [content.doctors]);
  useEffect(() => { setSelectedId(doctorId ?? null); }, [doctorId]);
  useEffect(() => { setReorderNotice(null); setDraggedId(null); }, [listState.category]);
  const doctorDetailQuery = useQuery({
    enabled: selectedId !== null,
    queryFn: () => cmsApi.doctors.get(selectedId!),
    queryKey: queryKeys.admin.doctor(selectedId ?? ''),
  });

  const categoryOrderQuery = useQuery({
    enabled: listState.category !== undefined,
    queryFn: () => cmsApi.doctors.list({ category: listState.category, limit: 100, page: 1, sort: 'displayOrder', order: 'asc' }),
    queryKey: queryKeys.admin.doctors({ category: listState.category, limit: 100, page: 1, sort: 'displayOrder', order: 'asc', purpose: 'reorder' }),
  });

  // Extract unique specialties
  const specialties = useMemo(() => {
    return [
      content.controls.allSpecialties,
      ...Array.from(new Set([...(listState.specialty ? [listState.specialty] : []), ...doctors.map((d) => d.specialty)])),
    ];
  }, [content.controls.allSpecialties, doctors, listState.specialty]);

  const filteredDoctors = doctors;
  const totalPages = Math.max(1, content.meta.totalPages);
  const effectivePage = content.meta.page;
  const pageDoctors = doctors;

  // Currently selected doctor
  const selectedDoctor = useMemo(() => doctorDetailQuery.data ? toAdminDoctorDetail(doctorDetailQuery.data.doctor) : null, [doctorDetailQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (doctor: AdminDoctor) => {
      const payload = sanitizeDoctorUpdatePayload(doctor);
      return cmsApi.doctors.update(doctor.id, payload);
    },
    onSuccess: () => {
      setActionError(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      void invalidateCmsDomain(queryClient, 'doctors');
    },
    onError: (error: unknown) => {
      setActionError(teamMemberSaveError(error));
      setSaveSuccess(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsApi.doctors.delete(id),
    onSuccess: () => { setSelectedId(null); setActionError(null); void invalidateCmsDomain(queryClient, 'doctors'); },
    onError: (error: unknown) => setActionError(error instanceof Error && 'code' in error && error.code === 'DOCTOR_IN_USE' ? 'This doctor is used by appointment history. Unpublish the profile instead.' : 'Unable to delete this doctor.'),
  });
  const reorderMutation = useMutation({
    mutationFn: (input: ReorderDoctorsInput) => cmsApi.doctors.reorder(input),
    onSuccess: () => {
      setReorderNotice({ tone: 'success', title: 'Team order saved', message: 'The public display order for this category is up to date.' });
      void invalidateCmsDomain(queryClient, 'doctors');
    },
    onError: (error: unknown) => {
      setReorderNotice({
        tone: 'error',
        title: 'Team order was not saved',
        message: error instanceof Error && error.message ? error.message : 'The previous order has been restored. Please try again.',
      });
    },
  });
  const handleSaveDoctor = (updated: AdminDoctor) => updateMutation.mutate(updated);
  const handleDeleteDoctor = (id: string) => {
    const doctor = doctors.find((item) => item.id === id);
    if (window.confirm(`Delete ${doctor?.name ?? 'this doctor'}? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleReorder = (targetId: string, placement: 'before' | 'after') => {
    const category = listState.category;
    const movingId = draggedId;
    const fullOrder = categoryOrderQuery.data?.items.map((doctor) => doctor.id) ?? [];
    setDraggedId(null);
    if (!category || !movingId || movingId === targetId || reorderMutation.isPending) return;
    if (categoryOrderQuery.data && categoryOrderQuery.data.meta.total > 100) {
      setReorderNotice({ tone: 'error', title: 'Team order was not changed', message: 'This category has more than 100 members and cannot be reordered from this screen.' });
      return;
    }
    const nextFullOrder = moveIdRelative(fullOrder, movingId, targetId, placement);
    if (nextFullOrder.join('|') === fullOrder.join('|')) return;
    const previousDoctors = doctors;
    const visibleIds = moveIdRelative(doctors.map((doctor) => doctor.id), movingId, targetId, placement);
    const byId = new Map(doctors.map((doctor) => [doctor.id, doctor]));
    setDoctors(visibleIds.flatMap((id) => {
      const doctor = byId.get(id);
      return doctor ? [doctor] : [];
    }));
    setReorderNotice(null);
    reorderMutation.mutate(
      { category, ids: nextFullOrder },
      { onError: () => setDoctors(previousDoctors) },
    );
  };
  const selectedCategoryTab = teamCategoryTabs.find((tab) => tab.category === listState.category) ?? teamCategoryTabs[0]!;
  const hasListFilters = Boolean(listState.search || listState.specialty || listState.status || (listState.page ?? 1) > 1);
  const canReorder = Boolean(
    listState.category &&
    categoryOrderQuery.data &&
    categoryOrderQuery.data.meta.total <= 100 &&
    !reorderMutation.isPending,
  );

  if (doctorId) {
    return (
      <main className="min-w-0 flex-1 bg-[#f6f8fb] px-5 py-7 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-5xl">
          {actionError ? <p className="mb-4 rounded-xl border border-[#fecaca] bg-[#fff1f2] p-3 text-sm text-[#b91c1c]" role="alert">{actionError}</p> : null}
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <AdminPageHeading />
            <Button onClick={() => navigate('/admin/team')} type="button" variant="secondary">Back to team</Button>
          </header>
          {doctorDetailQuery.isLoading ? (
            <Card className="min-h-[32rem] animate-pulse rounded-[28px] bg-white" />
          ) : selectedDoctor ? (
            <DoctorDetailPanel
              doctor={selectedDoctor}
              isSaving={updateMutation.isPending}
              onClose={() => navigate('/admin/team')}
              onDelete={handleDeleteDoctor}
              onSave={handleSaveDoctor}
              saveError={actionError}
              saveSuccess={saveSuccess}
            />
          ) : (
            <Card className="p-6">
              <p className="admin-feedback" role="alert">This doctor could not be found.</p>
              <Button className="mt-4" onClick={() => navigate('/admin/team')} type="button" variant="secondary">Back to team</Button>
            </Card>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-w-0 flex-1 bg-[#f6f8fb] px-5 py-7 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1440px] w-full">
      {actionError ? <p className="mb-4 rounded-xl border border-[#fecaca] bg-[#fff1f2] p-3 text-sm text-[#b91c1c]" role="alert">{actionError}</p> : null}
      {/* Top Header */}
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <AdminPageHeading />
        </div>

        <div className="flex flex-wrap items-center gap-3">

          <Button
            className="h-[46px] rounded-xl bg-[#2187a8] px-5 text-[14px] font-bold text-white shadow-[0_6px_14px_rgba(33,135,168,0.2)] hover:bg-[#1a718c]"
            icon={<span aria-hidden="true" className="text-lg leading-none font-bold">+</span>}
            onClick={() => navigate(`/admin/team/new${listState.category ? `?category=${listState.category}` : ''}`)}
          >
            Add Team Member
          </Button>
        </div>
      </header>
      <div className="mt-8">
        <nav aria-label="Team categories" className="admin-team-tabs">
          {teamCategoryTabs.map((tab) => {
            const active = tab.category === listState.category;
            const count = categoryCounts[tab.category ?? 'ALL'];
            return (
              <button
                aria-current={active ? 'page' : undefined}
                className="admin-team-tab"
                data-active={active}
                key={tab.category ?? 'ALL'}
                onClick={() => onListStateChange({ ...listState, category: tab.category, page: 1 })}
                type="button"
              >
                <span>{tab.label}</span>
                <span aria-label={count === undefined ? 'Count loading' : `${count} team members`} className="admin-team-tab-count">
                  {count ?? '–'}
                </span>
              </button>
            );
          })}
        </nav>
        <Card className="flex flex-col overflow-hidden rounded-[28px] border-[#e1e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
          {/* Filters inside card header */}
          <div className="admin-list-toolbar">
            {/* Search Input */}
            <label className="flex h-11 min-w-[200px] flex-1 items-center gap-3 rounded-xl border border-[#e1e8f0] bg-[#f9fbfd] px-4 text-[#9badc5] transition focus-within:border-[#2187a8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2187a8]/20">
              <AdminIcon className="size-4 shrink-0 text-[#9badc5]" name="search" />
              <span className="sr-only">Search team members</span>
              <input
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[#182238] outline-none placeholder:text-[#a9b7c9]"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  onListStateChange({ ...listState, page: 1, search: e.target.value || undefined });
                }}
                placeholder={content.controls.searchPlaceholder}
                type="search"
                value={listState.search ?? ''}
              />
            </label>

            {/* Specialties Dropdown */}
            <label className="flex h-11 items-center rounded-xl border border-[#e1e8f0] bg-white px-3.5 text-[#71839e] transition focus-within:border-[#2187a8] focus-within:ring-2 focus-within:ring-[#2187a8]/20">
              <span className="sr-only">Filter by specialty</span>
              <select
                className="cursor-pointer bg-transparent text-[14px] font-medium text-[#182238] outline-none"
                onChange={(e) => {
                  onListStateChange({ ...listState, page: 1, specialty: e.target.value === content.controls.allSpecialties ? undefined : e.target.value });
                }}
                value={listState.specialty ?? content.controls.allSpecialties}
              >
                {specialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </label>

            {/* Status Dropdown */}
            <label className="flex h-11 items-center rounded-xl border border-[#e1e8f0] bg-white px-3.5 text-[#71839e] transition focus-within:border-[#2187a8] focus-within:ring-2 focus-within:ring-[#2187a8]/20">
              <span className="sr-only">Filter by status</span>
              <select
                className="cursor-pointer bg-transparent text-[14px] font-medium text-[#182238] outline-none"
                onChange={(e) => {
                  onListStateChange({ ...listState, page: 1, status: e.target.value === content.controls.allStatuses ? undefined : e.target.value.toUpperCase() as AdminDoctorListQuery['status'] });
                }}
                value={listState.status ? `${listState.status[0]}${listState.status.slice(1).toLowerCase()}` : content.controls.allStatuses}
              >
                <option value={content.controls.allStatuses}>{content.controls.allStatuses}</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option><option value="Archived">Archived</option>
              </select>
            </label>
          </div>

          <div className="admin-team-reorder-status" aria-live="polite">
            {reorderMutation.isPending ? (
              <AdminFeedback title="Saving team order…" tone="loading"><p>Please keep this page open while the new order is saved.</p></AdminFeedback>
            ) : reorderNotice ? (
              <AdminFeedback title={reorderNotice.title} tone={reorderNotice.tone}><p>{reorderNotice.message}</p></AdminFeedback>
            ) : listState.category && categoryOrderQuery.isLoading ? (
              <AdminFeedback title="Preparing reorder controls…" tone="loading"><p>Loading the complete {selectedCategoryTab.label.toLowerCase()} order.</p></AdminFeedback>
            ) : listState.category && categoryOrderQuery.isError ? (
              <AdminFeedback title="Reordering is temporarily unavailable" tone="error"><p>The list is still usable, but the complete category order could not be loaded.</p></AdminFeedback>
            ) : categoryOrderQuery.data && categoryOrderQuery.data.meta.total > 100 ? (
              <AdminFeedback title="Reordering is unavailable for this category" tone="error"><p>Categories with more than 100 members must be reordered in smaller groups.</p></AdminFeedback>
            ) : listState.category ? (
              <p className="admin-helper">Drag a row by its handle to change the order within {selectedCategoryTab.label}. Search, status, and pagination filters can remain active.</p>
            ) : (
              <AdminFeedback title="Choose a category to reorder" tone="empty"><p>Reordering is disabled in All because each category keeps its own display order.</p></AdminFeedback>
            )}
          </div>

          {/* Table */}
          {busy ? <p role="status" className="admin-helper px-4">Updating team members…</p> : null}<div aria-busy={busy || reorderMutation.isPending} className="admin-table-scroll admin-team-table-region" role="region" aria-label="Team members table, scroll horizontally for more columns" tabIndex={0}>
            <table className="admin-management-table w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#f0f4f8] text-[11px] font-bold uppercase tracking-[0.5px] text-[#8699b0]">
                  <th aria-label="Reorder" scope="col" className="w-12 pb-3.5 pt-1 font-bold" />
                  <th scope="col" className="pb-3.5 pt-1 font-bold">Team member</th>
                  <th scope="col" className="pb-3.5 pt-1 font-bold">Role</th>
                  <th scope="col" className="pb-3.5 pt-1 font-bold">Category</th>
                  <th scope="col" className="pb-3.5 pt-1 font-bold">{content.table.status}</th>
                  <th scope="col" className="pb-3.5 pt-1 font-bold">Booking</th>
                  <th scope="col" className="pb-3.5 pt-1 text-right font-bold">{content.table.updated}</th>
                  <th scope="col" className="pb-3.5 pt-1 pr-2 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4f8]">
                {pageDoctors.map((doc) => {
                  return (
                    <tr
                      className="admin-team-row transition-colors hover:bg-[#f8fbfd]"
                      data-dragging={draggedId === doc.id}
                      draggable={canReorder}
                      key={doc.id}
                      onDragEnd={() => setDraggedId(null)}
                      onDragOver={(event) => { if (canReorder) event.preventDefault(); }}
                      onDragStart={(event) => {
                        if (!canReorder) return;
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', doc.id);
                        setDraggedId(doc.id);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        const bounds = event.currentTarget.getBoundingClientRect();
                        handleReorder(doc.id, event.clientY >= bounds.top + bounds.height / 2 ? 'after' : 'before');
                      }}
                    >
                      <td className="py-4 pr-1">
                        <span aria-label={canReorder ? `Drag ${doc.name} to reorder` : 'Reordering unavailable'} className="admin-team-drag-handle" data-enabled={canReorder} title={canReorder ? 'Drag to reorder' : 'Choose one category to reorder'}>⋮⋮</span>
                      </td>
                      {/* Doctor info */}
                      <td className="py-4 pr-4">
                        <button type="button" className="flex items-center gap-3.5 text-left" aria-label={`Edit ${doc.name}`} onClick={() => navigate(`/admin/team/${doc.id}/edit`)}>
                          <DoctorAvatar doctor={doc} size="md" />
                          <div>
                            <span className="block text-[15px] font-bold text-[#182238]">
                              {doc.name}
                            </span>
                            <span className="mt-0.5 block text-[13px] text-[#71839e]" lang="km">{doc.nameKm || '—'}</span>
                          </div>
                        </button>
                      </td>

                      <td className="py-4 pr-4 text-[14px] text-[#526477]">
                        <span className="block font-semibold text-[#182238]">{doc.roleTitle || '—'}</span>
                        {doc.roleTitleKm ? <span className="mt-0.5 block text-[13px]" lang="km">{doc.roleTitleKm}</span> : null}
                      </td>

                      <td className="py-4 pr-4">
                        <span className="admin-team-category-badge">{teamCategoryLabel(doc.category ?? 'DENTIST')}</span>
                      </td>

                      {/* Status badge */}
                      <td className="py-4 pr-4">
                        <StatusBadge status={doc.status} />
                      </td>

                      <td className="py-4 pr-4">
                        {doc.category === 'DENTIST' || doc.category === 'GENERAL_PRACTITIONER' || doc.category === undefined ? (
                          <AdminStatus tone={doc.bookable === false ? 'neutral' : 'success'}>{doc.bookable === false ? 'Not bookable' : 'Bookable'}</AdminStatus>
                        ) : <span aria-label="Not applicable" className="text-[#71839e]">—</span>}
                      </td>

                      {/* Updated Date */}
                      <td className="py-4 text-right text-[13px] text-[#8a9bb2]">
                        <AdminListDate value={doc.updatedAt} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-2 text-right">
                        <button
                          aria-label={`Edit ${doc.name}`}
                          className="rounded-lg px-3 py-1.5 text-[13px] font-bold text-[#2187a8] transition hover:bg-[#edf7fb]"
                          onClick={() => navigate(`/admin/team/${doc.id}/edit`)}
                          type="button"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredDoctors.length === 0 ? hasListFilters ? <AdminListEmpty noun={selectedCategoryTab.noun} filtered onClear={() => onListStateChange({ ...listState, search: undefined, specialty: undefined, status: undefined, page: 1 })} /> : <TeamEmptyState description={selectedCategoryTab.emptyDescription} noun={selectedCategoryTab.noun} onAdd={() => navigate(`/admin/team/new${listState.category ? `?category=${listState.category}` : ''}`)} /> : null}
          <AdminListPagination busy={busy || reorderMutation.isPending} noun="team members" page={effectivePage} totalPages={totalPages} total={content.meta.total} limit={content.meta.limit} count={pageDoctors.length} onPageChange={(page) => onListStateChange({ ...listState, page })} />
        </Card>

      </div>

      <DoctorsFooter footer={content.footer} />

      </div>
    </main>
  );
}

function DoctorsSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading team management"
      className="min-h-screen flex-1 bg-[#f6f8fb] p-7 lg:p-10"
    >
      <div className="h-10 w-72 animate-pulse rounded bg-[#e7edf3]" />
      <div className="mt-8 grid gap-7 2xl:grid-cols-[minmax(0,1fr)_480px] xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="h-[580px] animate-pulse rounded-[28px] bg-white" />
        <div className="h-[580px] animate-pulse rounded-[28px] bg-white" />
      </div>
    </main>
  );
}

function DoctorsUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen flex-1 place-items-center bg-[#f6f8fb] p-6">
      <Card className="max-w-md p-8 text-center rounded-[28px]">
        <h1 className="text-2xl font-bold text-[#182238]">Team Management is unavailable</h1>
        <p className="mt-3 text-[#71839e]">
          Unable to retrieve team profiles. Please try again.
        </p>
        <Button className="mt-6 bg-[#2187a8] text-white" onClick={onRetry}>
          Retry
        </Button>
      </Card>
    </main>
  );
}

export function AdminDoctorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = isTeamCategory(searchParams.get('category')) ? searchParams.get('category') as TeamCategory : undefined;
  const [listState, setListState] = useState<DoctorListState>({ category: categoryFromUrl, page: 1, limit: 20, sort: 'displayOrder', order: 'asc' });
  const { data, isError, isLoading, isFetching, refetch } = useAdminDoctorsPageQuery(listState);
  const countQueries = useQueries({
    queries: teamCategoryTabs.map((tab) => ({
      queryFn: () => cmsApi.doctors.list({ category: tab.category, limit: 1, page: 1 }),
      queryKey: queryKeys.admin.doctors({ category: tab.category, limit: 1, page: 1, purpose: 'category-count' }),
      staleTime: 30_000,
    })),
  });
  const categoryCounts = teamCategoryTabs.reduce<TeamCategoryCounts>((counts, tab, index) => {
    counts[tab.category ?? 'ALL'] = countQueries[index]?.data?.meta.total;
    return counts;
  }, { ALL: undefined, DENTIST: undefined, GENERAL_PRACTITIONER: undefined, RECEPTIONIST: undefined, ASSISTANT: undefined });

  useEffect(() => {
    setListState((current) => current.category === categoryFromUrl ? current : { ...current, category: categoryFromUrl, page: 1 });
  }, [categoryFromUrl]);

  const handleListStateChange = (next: DoctorListState) => {
    setListState(next);
    if (next.category === listState.category) return;
    const updated = new URLSearchParams(searchParams);
    if (next.category) updated.set('category', next.category);
    else updated.delete('category');
    setSearchParams(updated, { replace: false });
  };

  if (isLoading) {
    return <DoctorsSkeleton />;
  }

  if (isError || !data) {
    return <DoctorsUnavailable onRetry={() => void refetch()} />;
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:flex">

      <DoctorsContent busy={isFetching} categoryCounts={categoryCounts} content={data} listState={listState} onListStateChange={handleListStateChange} />
    </div>
  );
}
