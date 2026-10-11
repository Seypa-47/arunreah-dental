import { AdminPublicationStatus } from '@/components/admin/admin-list';
import { AdminFeedback } from '@/components/admin/admin-feedback';
import { AdminPageHeading } from '@/components/layout/admin-workspace';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { queryKeys } from '@/lib/query-keys';
import { cmsApi, type AdminAboutTimelineRecord } from '@/services/cms';

type Form = {
  year: string;
  titleEn: string;
  titleKm: string;
  bodyEn: string;
  bodyKm: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  displayOrder: string;
};

const empty = (): Form => ({
  year: '',
  titleEn: '',
  titleKm: '',
  bodyEn: '',
  bodyKm: '',
  status: 'PUBLISHED',
  displayOrder: '0',
});

const toForm = (item: AdminAboutTimelineRecord): Form => ({
  year: String(item.year),
  titleEn: item.titleEn,
  titleKm: item.titleKm,
  bodyEn: item.bodyEn,
  bodyKm: item.bodyKm,
  status: item.status,
  displayOrder: String(item.displayOrder),
});

export function AdminAboutTimelinePage() {
  const client = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ title: string; body: string } | null>(null);
  const [form, setForm] = useState<Form>(empty);

  const query = useQuery({
    queryKey: queryKeys.admin.aboutTimeline(),
    queryFn: () => cmsApi.aboutTimeline.list(),
  });

  const items = useMemo(() => query.data?.items ?? [], [query.data?.items]);
  const publishedCount = useMemo(
    () => items.filter((item) => item.status === 'PUBLISHED').length,
    [items],
  );
  const selected = useMemo(
    () => items.find((item) => item.id === selectedId),
    [items, selectedId],
  );

  useEffect(() => {
    if (selected) {
      setForm(toForm(selected));
    }
  }, [selected]);

  const refresh = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: queryKeys.admin.aboutTimeline() }),
      client.invalidateQueries({ queryKey: ['public', 'about-timeline'] }),
      client.invalidateQueries({ queryKey: ['public'] }),
    ]);

  const save = useMutation({
    mutationFn: () => {
      const input = {
        year: Number(form.year),
        titleEn: form.titleEn.trim(),
        titleKm: form.titleKm.trim(),
        bodyEn: form.bodyEn.trim(),
        bodyKm: form.bodyKm.trim(),
        status: form.status,
        displayOrder: Number(form.displayOrder) || 0,
      };
      return selectedId
        ? cmsApi.aboutTimeline.update(selectedId, input)
        : cmsApi.aboutTimeline.create(input);
    },
    onSuccess: async ({ item }) => {
      const wasEditing = Boolean(selectedId);
      setSelectedId(item.id);
      setConfirmDeleteId(null);
      setNotice({
        title: wasEditing ? 'Milestone updated' : 'Milestone created',
        body: `${item.year} · ${item.titleEn} has been saved.`,
      });
      await refresh();
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    }) => cmsApi.aboutTimeline.update(id, { status }),
    onSuccess: async ({ item }) => {
      if (selectedId === item.id) {
        setForm(toForm(item));
      }
      setNotice({
        title:
          item.status === 'PUBLISHED'
            ? 'Milestone published on About page'
            : 'Milestone hidden from About page',
        body: `${item.year} · ${item.titleEn} is now ${item.status.toLowerCase()}.`,
      });
      await refresh();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => cmsApi.aboutTimeline.delete(id),
    onSuccess: async (_data, deletedId) => {
      const deletedItem = items.find((item) => item.id === deletedId);
      if (selectedId === deletedId) {
        setSelectedId(null);
        setForm(empty());
      }
      setConfirmDeleteId(null);
      setNotice({
        title: 'Milestone removed',
        body: deletedItem
          ? `${deletedItem.year} · ${deletedItem.titleEn} was permanently removed from the timeline.`
          : 'The milestone was permanently removed from the timeline.',
      });
      await refresh();
    },
  });

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const startNewMilestone = () => {
    const nextOrder =
      items.length > 0
        ? Math.max(...items.map((item) => item.displayOrder)) + 10
        : 10;
    setSelectedId(null);
    setConfirmDeleteId(null);
    setNotice(null);
    setForm({ ...empty(), displayOrder: String(nextOrder) });
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:flex">
      <main className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1200px]">
          <header className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#2187a8]">
              CMS content
            </p>
            <AdminPageHeading />
          </header>

          {notice ? (
            <div className="mt-5">
              <AdminFeedback title={notice.title} tone="success">
                <p>{notice.body}</p>
              </AdminFeedback>
            </div>
          ) : null}

          {remove.isError ? (
            <div className="mt-5">
              <AdminFeedback title="Could not remove milestone" tone="error">
                <p>Please try again or refresh the page.</p>
              </AdminFeedback>
            </div>
          ) : null}

          <div className="mt-7 grid gap-6 xl:grid-cols-[.88fr_1.12fr]">
            <Card className="rounded-2xl border-[#dce5ef] bg-white p-5 shadow-none">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-[#182238]">Milestones</h2>
                  <p className="mt-0.5 text-xs text-[#71839e]">
                    {items.length} total · {publishedCount} shown on About page
                  </p>
                </div>
                <Button
                  onClick={startNewMilestone}
                  type="button"
                  variant="secondary"
                >
                  New milestone
                </Button>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#71839e]">
                Select a milestone to edit it, click <span className="font-semibold text-[#52647d]">Hide</span> to keep it without showing it publicly, or click <span className="font-semibold text-[#b42318]">Remove</span> to delete it permanently.
              </p>

              {query.isLoading ? (
                <div className="mt-5">
                  <AdminFeedback title="Loading timeline…" tone="loading" />
                </div>
              ) : query.isError ? (
                <div className="mt-5">
                  <AdminFeedback
                    actions={
                      <Button
                        onClick={() => void query.refetch()}
                        variant="secondary"
                      >
                        Retry
                      </Button>
                    }
                    title="Timeline could not load"
                    tone="error"
                  />
                </div>
              ) : items.length ? (
                <div className="mt-5 space-y-2.5">
                  {items.map((item) => {
                    const isSelected = item.id === selectedId;
                    const isConfirmingDelete = confirmDeleteId === item.id;
                    const isPublished = item.status === 'PUBLISHED';

                    return (
                      <div
                        className={`rounded-xl border p-4 transition ${
                          isSelected
                            ? 'border-[#2187a8] bg-[#edf7fb]'
                            : 'border-[#e2ebf0] bg-white hover:border-[#bcd8e4]'
                        }`}
                        key={item.id}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button
                            aria-label={`Edit ${item.titleEn || item.titleKm}`}
                            aria-pressed={isSelected}
                            className="min-w-0 flex-1 text-left focus:outline-none"
                            onClick={() => {
                              setSelectedId(item.id);
                              setConfirmDeleteId(null);
                              setNotice(null);
                            }}
                            type="button"
                          >
                            <span className="text-xs font-extrabold tracking-[.1em] text-[#2187a8]">
                              {item.year}
                            </span>
                            <span className="mt-1 block font-semibold text-[#182238]">
                              {item.titleEn}
                            </span>
                            {item.titleKm ? (
                              <span className="mt-0.5 block truncate text-xs text-[#64748b]">
                                {item.titleKm}
                              </span>
                            ) : null}
                            <span className="mt-2 flex flex-wrap items-center gap-2">
                              <AdminPublicationStatus status={item.status} />
                              <span className="admin-helper">
                                Order {item.displayOrder}
                              </span>
                            </span>
                          </button>

                          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                            <button
                              aria-label={
                                isPublished
                                  ? `Hide ${item.year} ${item.titleEn}`
                                  : `Publish ${item.year} ${item.titleEn}`
                              }
                              className="inline-flex min-h-9 items-center rounded-lg border border-[#cfe0ec] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#3f5873] transition hover:border-[#2187a8] hover:text-[#0b5c7a] disabled:opacity-50"
                              disabled={
                                toggleVisibility.isPending || remove.isPending
                              }
                              onClick={() => {
                                setConfirmDeleteId(null);
                                toggleVisibility.mutate({
                                  id: item.id,
                                  status: isPublished ? 'DRAFT' : 'PUBLISHED',
                                });
                              }}
                              type="button"
                            >
                              {isPublished ? 'Hide' : 'Publish'}
                            </button>

                            <button
                              aria-label={`Remove ${item.year} ${item.titleEn}`}
                              className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#f2c6c2] bg-[#fff5f4] px-2.5 py-1.5 text-xs font-semibold text-[#b42318] transition hover:border-[#e0948d] hover:bg-[#ffe9e6] disabled:opacity-50"
                              disabled={remove.isPending || save.isPending}
                              onClick={() =>
                                setConfirmDeleteId((current) =>
                                  current === item.id ? null : item.id,
                                )
                              }
                              type="button"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {isConfirmingDelete ? (
                          <div
                            aria-live="polite"
                            className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#f2c6c2] bg-[#fff5f4] px-3 py-2.5 text-xs text-[#912018]"
                          >
                            <span className="font-semibold">
                              Remove &ldquo;{item.year} · {item.titleEn}&rdquo; permanently?
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                className="inline-flex min-h-8 items-center rounded-md border border-[#d5dee8] bg-white px-2.5 py-1 text-xs font-semibold text-[#42556d] hover:bg-[#f4f7fa]"
                                disabled={remove.isPending}
                                onClick={() => setConfirmDeleteId(null)}
                                type="button"
                              >
                                Cancel
                              </button>
                              <button
                                aria-label={`Confirm remove ${item.year} ${item.titleEn}`}
                                className="inline-flex min-h-8 items-center rounded-md bg-[#b42318] px-3 py-1 text-xs font-semibold text-white hover:bg-[#8f1c14] disabled:opacity-50"
                                disabled={remove.isPending}
                                onClick={() => remove.mutate(item.id)}
                                type="button"
                              >
                                {remove.isPending ? 'Removing…' : 'Yes, remove'}
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-5 rounded-xl border border-dashed border-[#dce5ef] p-4 text-sm text-[#71839e]">
                  No milestones yet. Use the form on the right to add one.
                </p>
              )}
            </Card>

            <Card className="rounded-2xl border-[#dce5ef] bg-white p-5 shadow-none sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#182238]">
                    {selectedId ? 'Edit milestone' : 'New milestone'}
                  </h2>
                  <p className="mt-1 text-xs text-[#71839e]">
                    {selectedId
                      ? `Editing ${selected?.year ?? form.year} milestone. Save changes or remove it below.`
                      : 'Create a new bilingual milestone for the About page timeline.'}
                  </p>
                </div>
                {selectedId ? (
                  <span className="rounded-full bg-[#edf7fb] px-3 py-1 text-xs font-bold text-[#167ea7]">
                    Editing {selected?.year}
                  </span>
                ) : null}
              </div>

              <form
                className="mt-6 space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  save.mutate();
                }}
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="text-sm font-semibold text-[#52647d]">
                    Year
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3"
                      max="2100"
                      min="1900"
                      onChange={(e) => set('year', e.target.value)}
                      required
                      type="number"
                      value={form.year}
                    />
                  </label>
                  <label className="text-sm font-semibold text-[#52647d]">
                    Status
                    <select
                      className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3"
                      onChange={(e) =>
                        set('status', e.target.value as Form['status'])
                      }
                      value={form.status}
                    >
                      <option value="DRAFT">Draft (Hidden)</option>
                      <option value="PUBLISHED">Published (Visible)</option>
                      <option value="ARCHIVED">Archived (Hidden)</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-[#52647d]">
                    Display order
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3"
                      min="0"
                      onChange={(e) => set('displayOrder', e.target.value)}
                      type="number"
                      value={form.displayOrder}
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-[#52647d]">
                    Title · English
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3"
                      maxLength={180}
                      onChange={(e) => set('titleEn', e.target.value)}
                      required
                      value={form.titleEn}
                    />
                  </label>
                  <label className="text-sm font-semibold text-[#52647d]">
                    ចំណងជើង · ខ្មែរ
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3"
                      maxLength={180}
                      onChange={(e) => set('titleKm', e.target.value)}
                      required
                      value={form.titleKm}
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-[#52647d]">
                    Description · English
                    <textarea
                      className="mt-2 min-h-32 w-full rounded-xl border border-[#dce5ef] p-3 leading-6"
                      maxLength={1200}
                      onChange={(e) => set('bodyEn', e.target.value)}
                      required
                      value={form.bodyEn}
                    />
                  </label>
                  <label className="text-sm font-semibold text-[#52647d]">
                    ពិពណ៌នា · ខ្មែរ
                    <textarea
                      className="mt-2 min-h-32 w-full rounded-xl border border-[#dce5ef] p-3 leading-6"
                      maxLength={1200}
                      onChange={(e) => set('bodyKm', e.target.value)}
                      required
                      value={form.bodyKm}
                    />
                  </label>
                </div>

                {save.isError ? (
                  <p className="text-sm text-[#b42318]" role="alert">
                    We could not save this milestone. Please check the fields and try again.
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1f5] pt-5">
                  {selectedId ? (
                    confirmDeleteId === selectedId ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-[#b42318]">
                          Confirm permanent removal?
                        </span>
                        <Button
                          disabled={remove.isPending}
                          onClick={() => setConfirmDeleteId(null)}
                          type="button"
                          variant="secondary"
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-[#b42318] text-white hover:bg-[#8f1c14]"
                          disabled={remove.isPending}
                          onClick={() => remove.mutate(selectedId)}
                          type="button"
                        >
                          {remove.isPending ? 'Removing…' : 'Yes, remove milestone'}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="bg-[#b42318] text-white hover:bg-[#8f1c14]"
                        disabled={save.isPending || remove.isPending}
                        onClick={() => setConfirmDeleteId(selectedId)}
                        type="button"
                      >
                        Remove milestone
                      </Button>
                    )
                  ) : (
                    <span />
                  )}

                  <Button
                    disabled={
                      save.isPending ||
                      !form.year ||
                      !form.titleEn.trim() ||
                      !form.titleKm.trim() ||
                      !form.bodyEn.trim() ||
                      !form.bodyKm.trim()
                    }
                    type="submit"
                  >
                    {save.isPending
                      ? 'Saving…'
                      : selectedId
                        ? 'Save changes'
                        : 'Create milestone'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

