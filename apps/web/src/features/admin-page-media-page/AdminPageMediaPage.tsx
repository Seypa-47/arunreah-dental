import { AdminListImage, AdminPublicationStatus } from '@/components/admin/admin-list';
import { AdminPageHeading } from '@/components/layout/admin-workspace';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PageMediaPlacement } from '@arunreah/shared';
import { MediaUploader } from '@/components/admin/media-uploader';
import { AdminFeedback } from '@/components/admin/admin-feedback';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { queryKeys } from '@/lib/query-keys';
import { cmsApi, type AdminPageMediaRecord } from '@/services/cms';
import { getPublicMediaUrl } from '@/services/media';

type EditorState = {
  bodyEn: string;
  bodyKm: string;
  displayOrder: string;
  imageKey: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  titleEn: string;
  titleKm: string;
};

const placements: { description: string; label: string; value: PageMediaPlacement }[] = [
  { value: 'ABOUT_PROFESSIONAL_DEVELOPMENT', label: 'About · Professional Development', description: 'Editorial images that support the clinic story on the About page.' },
  { value: 'DOCTORS_HERO', label: 'Doctors · Team Hero', description: 'The team photo and bilingual introduction at the top of the Doctors page.' },
  { value: 'DOCTORS_PATIENT_EDUCATION', label: 'Doctors · Patient-first Approach', description: 'A single educational image block on the Doctors page.' },
];

const emptyEditor = (): EditorState => ({ bodyEn: '', bodyKm: '', displayOrder: '0', imageKey: '', status: 'DRAFT', titleEn: '', titleKm: '' });
const toEditor = (item: AdminPageMediaRecord): EditorState => ({
  bodyEn: item.bodyEn ?? '', bodyKm: item.bodyKm ?? '', displayOrder: String(item.displayOrder), imageKey: item.imageKey, status: item.status, titleEn: item.titleEn ?? '', titleKm: item.titleKm ?? '',
});

function safeError(error: unknown) {
  if (error instanceof Error && error.message.includes('409')) return 'This change conflicts with existing clinic content. Please refresh and try again.';
  return 'We could not save this content. Please check the fields and try again.';
}

export function AdminPageMediaPage() {
  const client = useQueryClient();
  const [placement, setPlacement] = useState<PageMediaPlacement>('ABOUT_PROFESSIONAL_DEVELOPMENT');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<EditorState>(emptyEditor);
  const pageMedia = useQuery({ queryKey: queryKeys.admin.pageMedia(placement), queryFn: () => cmsApi.pageMedia.list(placement) });
  const selected = useMemo(() => pageMedia.data?.items.find((item) => item.id === selectedId), [pageMedia.data?.items, selectedId]);

  useEffect(() => {
    if (selected) setForm(toEditor(selected));
  }, [selected]);

  const invalidate = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: queryKeys.admin.pageMedia(placement) }),
      client.invalidateQueries({ queryKey: ['public', 'page-media', placement] }),
    ]);
  };
  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        placement,
        status: form.status,
        titleEn: form.titleEn.trim() || null,
        titleKm: form.titleKm.trim() || null,
        bodyEn: form.bodyEn.trim() || null,
        bodyKm: form.bodyKm.trim() || null,
        imageKey: form.imageKey,
        displayOrder: Number.parseInt(form.displayOrder, 10) || 0,
      };
      if (!payload.imageKey) throw new Error('An image is required.');
      return selectedId ? cmsApi.pageMedia.update(selectedId, payload) : cmsApi.pageMedia.create(payload);
    },
    onSuccess: async (result) => {
      setSelectedId(result.item.id);
      await invalidate();
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => cmsApi.pageMedia.delete(id),
    onSuccess: async () => { setSelectedId(null); setForm(emptyEditor()); await invalidate(); },
  });
  const set = <K extends keyof EditorState>(key: K, value: EditorState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const placementLabel = placements.find((item) => item.value === placement);

  return <div className="min-h-screen bg-[#f6f8fb] lg:flex">

    <main className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2187a8]">CMS content blocks</p>
          <AdminPageHeading />
        </header>

        <div className="mt-7 grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <Card className="overflow-hidden rounded-2xl border-[#dce5ef] bg-white p-5 shadow-none">
            <label className="block text-sm font-semibold text-[#52647d]">Filter by website section
              <select className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-sm text-[#182238]" onChange={(event) => { setPlacement(event.target.value as PageMediaPlacement); setSelectedId(null); setForm(emptyEditor()); }} value={placement}>
                {placements.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <p className="mt-3 text-sm leading-6 text-[#71839e]">{placementLabel?.description}</p>
            <div className="mt-5 border-t border-[#edf1f5] pt-5">
              <div className="flex items-center justify-between gap-3"><div><h2 className="font-bold text-[#182238]">Existing blocks</h2><p className="mt-1 text-xs text-[#71839e]">{pageMedia.data?.items.length ?? 0} image-backed content block{pageMedia.data?.items.length === 1 ? '' : 's'}</p></div><Button className="px-3 py-2 text-xs" onClick={() => { setSelectedId(null); setForm(emptyEditor()); }} type="button" variant="secondary">New block</Button></div>
              {pageMedia.isLoading ? <AdminFeedback title="Loading content…" tone="loading" /> : pageMedia.isError ? <AdminFeedback title="Content could not load" tone="error" actions={<Button onClick={() => void pageMedia.refetch()} variant="secondary">Retry</Button>} /> : pageMedia.data?.items.length ? <div className="mt-4 space-y-3">{pageMedia.data.items.map((item) => {
                const isSelected = item.id === selectedId;
                const imageUrl = getPublicMediaUrl(item.imageKey);
                return <button aria-pressed={isSelected} aria-label={`Edit ${item.titleEn || item.titleKm || 'content block'}`} className={`admin-list-item flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${isSelected ? 'border-[#2187a8] bg-[#edf7fb]' : 'border-[#e3ebf1] hover:border-[#bcd8e4]'}`} key={item.id} onClick={() => setSelectedId(item.id)} type="button">
                  <AdminListImage src={imageUrl ?? undefined} />
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[#182238]">{item.titleEn || item.titleKm || 'Untitled block'}</span><span className="mt-2 flex flex-wrap items-center gap-2"><AdminPublicationStatus status={item.status} /><span className="admin-helper">Order {item.displayOrder}</span></span></span>
                </button>;
              })}</div> : <div className="mt-4"><AdminFeedback title="No content blocks yet" tone="empty"><p>No content blocks are set up for this section yet.</p></AdminFeedback></div>}
            </div>
          </Card>

          <Card className="rounded-2xl border-[#dce5ef] bg-white p-5 shadow-none sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-[#182238]">{selectedId ? 'Edit content block' : 'New content block'}</h2><p className="mt-1 text-sm text-[#71839e]">Add English and Khmer separately. Publish only after the image and copy are ready.</p></div>{selected?.imageKey ? <span className="rounded-full bg-[#edf7fb] px-3 py-1 text-xs font-bold text-[#167ea7]">Editing existing item</span> : null}</div>
            <form className="mt-6 space-y-5" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
              <MediaUploader category="clinic" help="Choose an image that supports this website section. JPEG, PNG, or WEBP up to 5 MB." label="Content image" onClear={() => set('imageKey', '')} onUploaded={(key) => set('imageKey', key)} required value={form.imageKey} />
              <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-[#52647d]">Status<select className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-sm" onChange={(event) => set('status', event.target.value as EditorState['status'])} value={form.status}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></select></label><label className="text-sm font-semibold text-[#52647d]">Display order<input className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3 text-sm" min="0" onChange={(event) => set('displayOrder', event.target.value)} type="number" value={form.displayOrder} /></label></div>
              <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-[#52647d]">Title · English<input className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3 text-sm" maxLength={160} onChange={(event) => set('titleEn', event.target.value)} value={form.titleEn} /></label><label className="text-sm font-semibold text-[#52647d]">ចំណងជើង · ខ្មែរ<input className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3 text-sm" maxLength={160} onChange={(event) => set('titleKm', event.target.value)} value={form.titleKm} /></label></div>
              <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-[#52647d]">Description · English<textarea className="mt-2 min-h-32 w-full rounded-xl border border-[#dce5ef] p-3 text-sm leading-6" maxLength={1200} onChange={(event) => set('bodyEn', event.target.value)} value={form.bodyEn} /></label><label className="text-sm font-semibold text-[#52647d]">ពិពណ៌នា · ខ្មែរ<textarea className="mt-2 min-h-32 w-full rounded-xl border border-[#dce5ef] p-3 text-sm leading-6" maxLength={1200} onChange={(event) => set('bodyKm', event.target.value)} value={form.bodyKm} /></label></div>
              {save.isError ? <p className="text-sm text-[#c92727]" role="alert">{safeError(save.error)}</p> : null}
              {remove.isError ? <p className="text-sm text-[#c92727]" role="alert">We could not remove this block. Please try again.</p> : null}
              <div className="flex flex-wrap justify-between gap-3 border-t border-[#edf1f5] pt-5"><div>{selectedId ? <div><Button className="bg-[#b42318] hover:bg-[#8f1c14]" disabled={remove.isPending || save.isPending} onClick={() => { if (window.confirm('Remove this CMS content block? The uploaded image will remain in media storage.')) remove.mutate(selectedId); }} type="button">Remove content block</Button><p className="mt-2 max-w-sm text-xs leading-5 text-[#71839e]">This removes the placement and its copy from the page. It does not delete the image asset from R2.</p></div> : null}</div><Button disabled={save.isPending || !form.imageKey} type="submit">{save.isPending ? 'Saving…' : selectedId ? 'Save changes' : 'Create block'}</Button></div>
            </form>
          </Card>
        </div>
      </div>
    </main>
  </div>;
}
