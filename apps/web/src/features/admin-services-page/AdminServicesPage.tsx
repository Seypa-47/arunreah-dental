import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ServiceListQuery } from '@arunreah/shared';
import { useNavigate } from 'react-router-dom';
import { AdminIcon, AdminSidebar } from '@/components/layout/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { AdminService, AdminServicesContent } from '@/services/admin-services';
import { useAdminServicesPageQuery } from './use-admin-services-page';
import { cmsApi } from '@/services/cms';
import { invalidateCmsDomain } from '@/services/cms-cache';

function StatusBadge({ status }: { status: AdminService['status'] }) {
  const published = status === 'published';
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-bold ${published ? 'border-[#b9f1d0] bg-[#effdf5] text-[#13ad63]' : 'border-[#fde8b2] bg-[#fff8e8] text-[#e58900]'}`}
    >
      {published ? 'Published' : 'Draft'}
    </span>
  );
}

function ServicesFooter({ footer }: { footer: AdminServicesContent['footer'] }) {
  return (
    <footer className="mt-11 flex flex-wrap items-center justify-between gap-5 text-[13px] text-[#9badc5]">
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

function ServiceDetails({
  service,
  onClose,
  onDelete,
  onEdit,
  onToggleStatus,
}: {
  service: AdminService;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
}) {
  const [tab, setTab] = useState<'overview' | 'description' | 'seo'>('overview');
  return (
    <aside
      aria-label="Service details"
      className="flex min-h-full flex-col rounded-[28px] border border-[#e1e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.03)] 2xl:rounded-none 2xl:border-y-0 2xl:border-r-0"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[22px] font-bold text-[#182238]">Service Details</h2>
        <button
          aria-label="Close service details"
          className="rounded-lg p-2 text-xl text-[#71839e] hover:bg-[#f4f8fb]"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
      </div>
      <div className="mt-7 flex items-center gap-4">
        <img
          alt={service.imageAlt}
          className="size-20 rounded-2xl object-cover"
          src={service.imageUrl}
        />
        <div>
          <h3 className="text-[18px] font-bold text-[#182238]">{service.name}</h3>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status={service.status} />
            <span className="text-[14px] text-[#71839e]">{service.category}</span>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-[#f7f9fc] px-4 py-3 text-[14px] text-[#71839e]">
        <span>Last updated {service.updatedAt}</span>
        <a
          className="font-bold text-[#2187a8]"
          href={`/services/${service.id}`}
          rel="noreferrer"
          target="_blank"
        >
          Preview on Website ↗
        </a>
      </div>
      <div className="mt-7 grid grid-cols-3 border-b border-[#dce5ef] text-[14px] font-semibold text-[#71839e]">
        {(
          [
            ['overview', 'Overview'],
            ['description', 'Description'],
            ['seo', 'SEO & Settings'],
          ] as const
        ).map(([id, label]) => (
          <button
            className={`border-b-2 pb-4 ${tab === id ? 'border-[#2187a8] text-[#2187a8]' : 'border-transparent'}`}
            key={id}
            onClick={() => setTab(id)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'overview' ? (
        <dl className="mt-8 space-y-6">
          <div>
            <dt className="text-xs font-bold uppercase tracking-[.6px] text-[#98a8bd]">
              Service Name
            </dt>
            <dd className="mt-2 text-[16px] font-medium text-[#182238]">{service.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-[.6px] text-[#98a8bd]">Category</dt>
            <dd className="mt-2 text-[16px] font-medium text-[#182238]">
              {service.category} Dentistry
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-[.6px] text-[#98a8bd]">
              Short Description
            </dt>
            <dd className="mt-2 text-[16px] leading-7 text-[#182238]">{service.description}</dd>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <dt className="text-xs font-bold uppercase tracking-[.6px] text-[#98a8bd]">
                Display on Homepage
              </dt>
              <dd className="mt-2 font-medium text-[#182238]">
                {service.displayOnHomepage ? 'Yes' : 'No'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[.6px] text-[#98a8bd]">
                Featured Service
              </dt>
              <dd className="mt-2 font-medium text-[#182238]">{service.featured ? 'Yes' : 'No'}</dd>
            </div>
          </div>
          <div className="border-t border-[#dce5ef] pt-5 text-[14px] text-[#71839e]">
            <p className="flex justify-between">
              <span>Created At</span>
              <strong className="font-medium text-[#182238]">{service.createdAt}</strong>
            </p>
            <p className="mt-4 flex justify-between">
              <span>Updated At</span>
              <strong className="font-medium text-[#182238]">{service.updatedAt}</strong>
            </p>
          </div>
        </dl>
      ) : tab === 'description' ? (
        <p className="mt-8 text-[16px] leading-7 text-[#182238]">{service.description}</p>
      ) : (
        <dl className="mt-8 space-y-5">
          <div>
            <dt className="text-xs font-bold uppercase tracking-[.6px] text-[#98a8bd]">
              Page slug
            </dt>
            <dd className="mt-2 text-[#182238]">/services/{service.id}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-[.6px] text-[#98a8bd]">
              Homepage placement
            </dt>
            <dd className="mt-2 text-[#182238]">
              {service.displayOnHomepage ? 'Displayed on homepage' : 'Not displayed on homepage'}
            </dd>
          </div>
        </dl>
      )}
      <div className="mt-auto space-y-3 pt-10">
        <Button className="w-full bg-[#2187a8] text-white hover:bg-[#1a718c]" onClick={onEdit}>
          Edit Service
        </Button>
        <Button
          className="w-full border border-[#dce5ef] text-[#71839e] shadow-none hover:bg-[#f4f8fb]"
          onClick={onToggleStatus}
          variant="secondary"
        >
          {service.status === 'published' ? 'Unpublish Service' : 'Publish Service'}
        </Button>
        <Button
          className="w-full bg-[#fff0f1] text-[#ef4147] shadow-none hover:bg-[#ffe2e4]"
          onClick={onDelete}
        >
          Delete Service
        </Button>
      </div>
    </aside>
  );
}

type ServiceListState = Pick<ServiceListQuery, 'page' | 'limit' | 'search' | 'status' | 'category' | 'sort' | 'order'>;

function ServicesContent({ content, listState, onListStateChange }: { content: AdminServicesContent; listState: ServiceListState; onListStateChange: (state: ServiceListState) => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [services, setServices] = useState(content.services);
  const [selectedId, setSelectedId] = useState<string | undefined>(services[0]?.id);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  useEffect(() => {
    setServices(content.services);
  }, [content.services]);
  const categories = [
    content.controls.allCategories,
    ...Array.from(new Set(services.map((service) => service.category))),
  ];
  const visible = services;
  const selected = services.find((service) => service.id === selectedId);
  const updateStatus = useMutation({
    mutationFn: (service: AdminService) =>
      cmsApi.services.update(service.id, {
        status: service.status === 'published' ? 'DRAFT' : 'PUBLISHED',
      }),
    onSuccess: () => {
      setActionError(null);
      void invalidateCmsDomain(queryClient, 'services');
    },
    onError: () => setActionError('Unable to update this service. Please try again.'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsApi.services.delete(id),
    onSuccess: () => {
      setSelectedId(undefined);
      setActionError(null);
      void invalidateCmsDomain(queryClient, 'services');
    },
    onError: (error: unknown) => setActionError(error instanceof Error && 'code' in error && error.code === 'SERVICE_IN_USE' ? 'This service is referenced by appointment history. Unpublish it instead.' : 'Unable to delete this service.'),
  });
  const toggleStatus = () => {
    const service = services.find((item) => item.id === selectedId);
    if (service) updateStatus.mutate(service);
  };
  const deleteService = () => {
    if (selectedId) deleteMutation.mutate(selectedId);
  };
  return (
    <main className="min-w-0 flex-1 bg-[#f6f8fb] px-5 py-7 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1440px] w-full">
        {actionError ? <p className="mb-4 rounded-xl border border-[#fecaca] bg-[#fff1f2] p-3 text-sm text-[#b91c1c]" role="alert">{actionError}</p> : null}
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-[28px] font-bold tracking-[-.6px] text-[#182238] sm:text-[33px]">
              {content.header.title}
            </h1>
            <p className="mt-1 text-[16px] text-[#71839e] sm:text-[17px]">
              {content.header.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#dce5ef] bg-white px-4 text-[14px] text-[#71839e]">
              <AdminIcon className="size-4" name="calendar" />
              {content.controls.dateLabel}
            </div>
            <Button
              className="h-[46px] rounded-xl px-5 text-[14px]"
              icon={
                <span aria-hidden="true" className="text-xl">
                  +
                </span>
              }
              onClick={() => navigate('/admin/services/new')}
            >
              {content.controls.addLabel}
            </Button>
          </div>
        </header>
        <Card className="mt-9 rounded-[26px] border-[#dce5ef] p-6">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex h-[46px] min-w-[220px] flex-1 items-center gap-3 rounded-xl border border-[#dce5ef] bg-[#f9fbfd] px-4 text-[#9badc5]">
              <AdminIcon className="size-5" name="search" />
              <span className="sr-only">Search services</span>
              <input
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[#182238] outline-none placeholder:text-[#a9b7c9]"
                onChange={(event) => onListStateChange({ ...listState, page: 1, search: event.target.value || undefined })}
                placeholder={content.controls.searchPlaceholder}
                type="search"
                value={listState.search ?? ''}
              />
            </label>
            <label className="flex h-[46px] items-center rounded-xl border border-[#dce5ef] bg-white px-3 text-[#71839e]">
              <span className="sr-only">Filter by category</span>
              <select
                className="bg-transparent text-[14px] font-medium outline-none"
                onChange={(event) => onListStateChange({ ...listState, category: event.target.value === content.controls.allCategories ? undefined : event.target.value, page: 1 })}
                value={listState.category ?? content.controls.allCategories}
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="flex h-[46px] items-center rounded-xl border border-[#dce5ef] bg-white px-3 text-[#71839e]">
              <span className="sr-only">Filter by status</span>
              <select
                className="bg-transparent text-[14px] font-medium outline-none"
                onChange={(event) => onListStateChange({ ...listState, status: event.target.value === content.controls.allStatuses ? undefined : event.target.value.toUpperCase() as ServiceListQuery['status'], page: 1 })}
                value={listState.status ? `${listState.status[0]}${listState.status.slice(1).toLowerCase()}` : content.controls.allStatuses}
              >
                <option>{content.controls.allStatuses}</option>
                <option>Published</option>
                <option>Draft</option>
              </select>
            </label>
            <button
              aria-expanded={filtersOpen}
              className="ml-auto inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#dce5ef] bg-white px-4 text-[14px] font-semibold text-[#71839e] hover:bg-[#f4f8fb]"
              onClick={() => setFiltersOpen(!filtersOpen)}
              type="button"
            >
              <AdminIcon className="size-4" name="filter" />
              {content.controls.filterLabel}
            </button>
          </div>
          {filtersOpen ? (
            <p className="mt-4 text-[13px] text-[#71839e]">
              Use the category and status selectors to refine the service list.
            </p>
          ) : null}
        </Card>
        <div className="mt-8 grid gap-8 2xl:grid-cols-[minmax(0,1fr)_400px]">
          <Card className="overflow-hidden rounded-[32px] border-[#dce5ef]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse text-left">
                <thead className="bg-[#f7f9fc] text-[12px] font-bold uppercase tracking-[.5px] text-[#61738d]">
                  <tr>
                    <th className="px-7 py-4">{content.table.service}</th>
                    <th className="px-5 py-4">{content.table.category}</th>
                    <th className="px-5 py-4">{content.table.status}</th>
                    <th className="px-5 py-4">{content.table.updated}</th>
                    <th className="px-7 py-4 text-right">{content.table.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((service) => (
                    <tr
                      className={`border-t border-[#e1e8f0] transition hover:bg-[#f8fbfd] ${service.id === selectedId ? 'bg-[#eef9ff]' : ''}`}
                      key={service.id}
                    >
                      <td className="px-7 py-5">
                        <button
                          className="flex items-center gap-4 text-left"
                          onClick={() => setSelectedId(service.id)}
                          type="button"
                        >
                          <img
                            alt={service.imageAlt}
                            className="size-[60px] rounded-xl object-cover"
                            src={service.imageUrl}
                          />
                          <span>
                            <span className="block text-[16px] font-bold text-[#182238]">
                              {service.name}
                            </span>
                            <span className="mt-1 block max-w-[230px] truncate text-[14px] text-[#71839e]">
                              {service.description}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className="px-5 py-5">
                        <span className="rounded-full border border-[#dce5ef] bg-[#f4f7fb] px-3 py-1 text-[13px] font-bold text-[#71839e]">
                          {service.category}
                        </span>
                      </td>
                      <td className="px-5 py-5">
                        <StatusBadge status={service.status} />
                      </td>
                      <td className="px-5 py-5 text-[14px] text-[#71839e]">{service.updatedAt}</td>
                      <td className="px-7 py-5 text-right">
                        <button
                          aria-label={`Edit ${service.name}`}
                          className="rounded-lg p-2 text-[#2187a8] hover:bg-[#edf7fb]"
                          onClick={() => navigate(`/admin/services/${service.id}/edit`)}
                          type="button"
                        >
                          ✎
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {visible.length === 0 ? (
              <div className="grid min-h-[220px] place-items-center px-6 text-center">
                <div>
                  <h2 className="text-xl font-bold text-[#182238]">{content.empty.title}</h2>
                  <p className="mt-3 text-[#71839e]">{content.empty.description}</p>
                </div>
              </div>
            ) : null}
            <div className="flex items-center justify-between border-t border-[#e1e8f0] px-7 py-6 text-[13px] text-[#9badc5]">
              {visible.length > 0 ? (
                <span>
                  Showing {(content.meta.page - 1) * content.meta.limit + 1} to {(content.meta.page - 1) * content.meta.limit + visible.length} of {content.meta.total} services
                </span>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button aria-label="Previous page" className="grid size-8 place-items-center rounded-lg border border-[#dce5ef] disabled:opacity-40" disabled={content.meta.page <= 1} onClick={() => onListStateChange({ ...listState, page: content.meta.page - 1 })} type="button">‹</button>
                <span className="grid size-8 place-items-center rounded-lg bg-[#2187a8] text-white">
                  {content.meta.page}
                </span>
                <button aria-label="Next page" className="grid size-8 place-items-center rounded-lg border border-[#dce5ef] disabled:opacity-40" disabled={content.meta.page >= content.meta.totalPages} onClick={() => onListStateChange({ ...listState, page: content.meta.page + 1 })} type="button">›</button>
              </div>
            </div>
          </Card>
          {selected ? (
            <ServiceDetails
              onClose={() => setSelectedId(undefined)}
              onDelete={deleteService}
              onEdit={() => navigate(`/admin/services/${selected.id}/edit`)}
              onToggleStatus={toggleStatus}
              service={selected}
            />
          ) : (
            <Card className="grid min-h-[520px] place-items-center p-6 text-center">
              <p className="text-[#71839e]">Select a service to view its details.</p>
            </Card>
          )}
        </div>
        <ServicesFooter footer={content.footer} />
      </div>
    </main>
  );
}

function ServicesSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading services management"
      className="min-h-screen flex-1 bg-[#f6f8fb] p-7 lg:p-11"
    >
      <div className="h-10 w-72 animate-pulse rounded bg-[#e7edf3]" />
      <div className="mt-9 h-[92px] animate-pulse rounded-[26px] bg-white" />
      <div className="mt-8 h-[520px] animate-pulse rounded-[32px] bg-white" />
    </main>
  );
}
function ServicesUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen flex-1 place-items-center bg-[#f6f8fb] p-6">
      <Card className="max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold text-[#182238]">Services are unavailable</h1>
        <p className="mt-3 text-[#71839e]">Please refresh and try again.</p>
        <Button className="mt-6" onClick={onRetry}>
          Retry
        </Button>
      </Card>
    </main>
  );
}

export function AdminServicesPage() {
  const [listState, setListState] = useState<ServiceListState>({ page: 1, limit: 20, sort: 'displayOrder', order: 'asc' });
  const { data, isError, isLoading, refetch } = useAdminServicesPageQuery(listState);
  if (isLoading) return <ServicesSkeleton />;
  if (isError || !data) return <ServicesUnavailable onRetry={() => void refetch()} />;
  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:flex">
      <AdminSidebar activeLabel="Services" brand={data.brand} navigation={data.navigation} />
      <ServicesContent content={data} listState={listState} onListStateChange={setListState} />
    </div>
  );
}
