import { AdminListDate, AdminListImage, AdminListEmpty, AdminListPagination, AdminPublicationStatus } from '@/components/admin/admin-list';
import { AdminPageHeading } from '@/components/layout/admin-workspace';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AdminShowcaseListQuery } from '@arunreah/shared';
import { useNavigate } from 'react-router-dom';
import { AdminIcon } from '@/components/layout/admin-sidebar';
import { AdminToggle } from '@/components/admin/admin-toggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAdminShowcasePageQuery } from './use-admin-showcase-page';
import type { AdminShowcaseContent, ShowcaseStatus } from '@/services/admin-showcase';
import { cmsApi } from '@/services/cms';
import { invalidateCmsDomain } from '@/services/cms-cache';

function StatusBadge({ status }: { status: ShowcaseStatus }) {
  return <AdminPublicationStatus status={status} />;
}

function ShowcaseFooter({ footer }: { footer: AdminShowcaseContent['footer'] }) {
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

type ShowcaseListState = Pick<
  AdminShowcaseListQuery,
  'page' | 'limit' | 'search' | 'status' | 'category' | 'sort' | 'order' | 'showOnHomepage'
>;

function ShowcaseListContent({
  busy,
  content,
  listState,
  onListStateChange,
}: {
  busy: boolean;
  content: AdminShowcaseContent;
  listState: ShowcaseListState;
  onListStateChange: (state: ShowcaseListState) => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notification, setNotification] = useState<{ message: string; tone: 'success' | 'error' } | undefined>();

  const showNotification = (message: string, tone: 'success' | 'error' = 'success') => {
    setNotification({ message, tone });
    setTimeout(() => {
      setNotification(undefined);
    }, 4000);
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsApi.showcases.delete(id),
    onSuccess: async () => {
      await invalidateCmsDomain(queryClient, 'showcases');
      showNotification('Showcase deleted successfully.', 'success');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to delete showcase.';
      showNotification(message, 'error');
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ id, showOnHomepage }: { id: string; showOnHomepage: boolean }) =>
      cmsApi.showcases.update(id, { showOnHomepage }),
    onSuccess: async () => {
      await invalidateCmsDomain(queryClient, 'showcases');
      showNotification('Homepage visibility updated.', 'success');
    },
    onError: () => {
      showNotification('Unable to update visibility.', 'error');
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const categories = [
    content.controls.allCategoryLabel,
    ...Array.from(
      new Set([
        ...(listState.category ? [listState.category] : []),
        ...content.articles.map((art) => art.category),
      ]),
    ),
  ];

  return (
    <main className="min-w-0 flex-1 bg-[#f6f8fb] px-5 py-7 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1440px] w-full">
        {/* Notification Banner */}
        {notification ? (
          <div
            aria-live="polite"
            className={`mb-5 flex items-center justify-between rounded-xl border px-4 py-3 text-[13px] font-semibold ${
              notification.tone === 'error'
                ? 'border-[#fecdca] bg-[#fef3f2] text-[#b42318]'
                : 'border-[#b9f1d0] bg-[#effdf5] text-[#13ad63]'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <AdminIcon className="size-4" name={notification.tone === 'error' ? 'info' : 'check'} />
              {notification.message}
            </span>
            <button
              aria-label="Dismiss notification"
              className={
                notification.tone === 'error'
                  ? 'text-[#b42318] hover:text-[#7a271a]'
                  : 'text-[#13ad63] hover:text-[#0b7944]'
              }
              onClick={() => setNotification(undefined)}
              type="button"
            >
              ✕
            </button>
          </div>
        ) : null}

        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <AdminPageHeading />
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="h-[46px] rounded-xl px-5 text-[14px]"
              icon={
                <span aria-hidden="true" className="text-xl">
                  +
                </span>
              }
              onClick={() => navigate('/admin/showcase/new')}
            >
              {content.controls.addLabel}
            </Button>
          </div>
        </header>

        {/* Filters & Search Toolbar */}
        <Card className="mt-9 rounded-[26px] border-[#dce5ef] p-6">
          <div className="admin-list-toolbar">
            <label className="flex h-[46px] min-w-[220px] flex-1 items-center gap-3 rounded-xl border border-[#dce5ef] bg-[#f9fbfd] px-4 text-[#9badc5]">
              <AdminIcon className="size-5" name="search" />
              <span className="sr-only">Search showcase articles</span>
              <input
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[#182238] outline-none placeholder:text-[#a9b7c9]"
                onChange={(event) =>
                  onListStateChange({
                    ...listState,
                    page: 1,
                    search: event.target.value || undefined,
                  })
                }
                placeholder={content.controls.searchPlaceholder}
                type="search"
                value={listState.search ?? ''}
              />
            </label>

            <label className="flex h-[46px] items-center rounded-xl border border-[#dce5ef] bg-white px-3 text-[#71839e]">
              <span className="sr-only">Filter by category</span>
              <select
                className="bg-transparent text-[14px] font-medium outline-none"
                onChange={(event) =>
                  onListStateChange({
                    ...listState,
                    category:
                      event.target.value === content.controls.allCategoryLabel
                        ? undefined
                        : event.target.value,
                    page: 1,
                  })
                }
                value={listState.category ?? content.controls.allCategoryLabel}
              >
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </label>

            <label className="flex h-[46px] items-center rounded-xl border border-[#dce5ef] bg-white px-3 text-[#71839e]">
              <span className="sr-only">Filter by status</span>
              <select
                className="bg-transparent text-[14px] font-medium outline-none"
                onChange={(event) =>
                  onListStateChange({
                    ...listState,
                    status:
                      event.target.value === 'All Statuses'
                        ? undefined
                        : (event.target.value.toUpperCase() as AdminShowcaseListQuery['status']),
                    page: 1,
                  })
                }
                value={
                  listState.status
                    ? `${listState.status[0]}${listState.status.slice(1).toLowerCase()}`
                    : 'All Statuses'
                }
              >
                <option>All Statuses</option>
                <option>Published</option>
                <option>Draft</option>
                <option>Archived</option>
              </select>
            </label>
          </div>
        </Card>

        {/* Full-width Data Table */}
        <div className="mt-8">
          <Card className="overflow-hidden rounded-[32px] border-[#dce5ef]">
            {busy ? <p className="admin-helper px-4" role="status">Updating showcases…</p> : null}
            <div
              aria-busy={busy}
              aria-label="Showcases table, scroll horizontally for more columns"
              className="admin-table-scroll"
              role="region"
              tabIndex={0}
            >
              <table className="admin-management-table w-full min-w-[780px] border-collapse text-left">
                <thead className="bg-[#f7f9fc] text-[12px] font-bold uppercase tracking-[.5px] text-[#61738d]">
                  <tr>
                    <th className="px-7 py-4" scope="col">
                      Showcase Article
                    </th>
                    <th className="px-5 py-4" scope="col">
                      Category
                    </th>
                    <th className="px-5 py-4" scope="col">
                      Status
                    </th>
                    <th className="px-5 py-4" scope="col">
                      Homepage
                    </th>
                    <th className="px-5 py-4" scope="col">
                      Last Updated
                    </th>
                    <th className="px-7 py-4 text-right" scope="col">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {content.articles.map((article) => (
                    <tr className="border-t border-[#e1e8f0] transition hover:bg-[#f8fbfd]" key={article.id}>
                      <td className="px-7 py-5">
                        <button
                          aria-label={`Edit ${article.title}`}
                          className="flex items-center gap-4 text-left group"
                          onClick={() => navigate(`/admin/showcase/${article.id}/edit`)}
                          type="button"
                        >
                          <AdminListImage src={article.imageUrl} />
                          <span>
                            <span className="block text-[15px] font-bold text-[#182238] group-hover:text-[#2187a8] transition">
                              {article.title}
                            </span>
                            <span className="mt-0.5 block max-w-[280px] truncate text-[13px] text-[#71839e]">
                              {article.subtitle || 'No description provided'}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className="px-5 py-5">
                        <span className="rounded-full border border-[#dce5ef] bg-[#f4f7fb] px-3 py-1 text-[13px] font-bold text-[#71839e]">
                          {article.category}
                        </span>
                      </td>
                      <td className="px-5 py-5">
                        <StatusBadge status={article.status} />
                      </td>
                      <td className="px-5 py-5">
                        <AdminToggle
                          checked={article.homepageVisibility}
                          label={`Feature ${article.title} on homepage`}
                          onChange={(checked) =>
                            toggleVisibilityMutation.mutate({ id: article.id, showOnHomepage: checked })
                          }
                        />
                      </td>
                      <td className="px-5 py-5 text-[14px] text-[#71839e]">
                        <AdminListDate value={article.lastUpdatedDate} />
                      </td>
                      <td className="px-7 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            aria-label={`Edit ${article.title}`}
                            className="rounded-lg px-2.5 py-1.5 text-[13px] font-bold text-[#2187a8] hover:bg-[#edf7fb]"
                            onClick={() => navigate(`/admin/showcase/${article.id}/edit`)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            aria-label={`Delete ${article.title}`}
                            className="rounded-lg px-2.5 py-1.5 text-[13px] font-bold text-[#b42318] hover:bg-[#fef3f2]"
                            disabled={deleteMutation.isPending}
                            onClick={() => handleDelete(article.id, article.title)}
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {content.articles.length === 0 ? (
              <AdminListEmpty
                filtered={Boolean(
                  listState.search || listState.status || listState.category || (listState.page ?? 1) > 1,
                )}
                noun="showcase articles"
                onClear={() =>
                  onListStateChange({
                    ...listState,
                    search: undefined,
                    status: undefined,
                    category: undefined,
                    page: 1,
                  })
                }
              />
            ) : null}

            <AdminListPagination
              busy={busy}
              count={content.articles.length}
              limit={content.meta.limit}
              noun="showcase articles"
              onPageChange={(page) => onListStateChange({ ...listState, page })}
              page={content.meta.page}
              total={content.meta.total}
              totalPages={content.meta.totalPages}
            />
          </Card>
        </div>

        <ShowcaseFooter footer={content.footer} />
      </div>
    </main>
  );
}

function ShowcaseSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading showcase management"
      className="min-h-screen flex-1 bg-[#f6f8fb] p-7 lg:p-11"
    >
      <div className="h-10 w-72 animate-pulse rounded bg-[#e7edf3]" />
      <div className="mt-9 h-[92px] animate-pulse rounded-[26px] bg-white" />
      <div className="mt-8 h-[520px] animate-pulse rounded-[32px] bg-white" />
    </main>
  );
}

function ShowcaseUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen flex-1 place-items-center bg-[#f6f8fb] p-6">
      <Card className="max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold text-[#182238]">Showcases are unavailable</h1>
        <p className="mt-3 text-[#71839e]">Please refresh and try again.</p>
        <Button className="mt-6" onClick={onRetry}>
          Retry
        </Button>
      </Card>
    </main>
  );
}

export function AdminShowcasePage() {
  const [listState, setListState] = useState<ShowcaseListState>({
    page: 1,
    limit: 20,
    sort: 'displayOrder',
    order: 'asc',
  });

  const { data, isError, isLoading, isFetching, refetch } = useAdminShowcasePageQuery(listState);

  if (isLoading) return <ShowcaseSkeleton />;
  if (isError || !data) return <ShowcaseUnavailable onRetry={() => void refetch()} />;

  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:flex">
      <ShowcaseListContent
        busy={isFetching}
        content={data}
        listState={listState}
        onListStateChange={setListState}
      />
    </div>
  );
}
