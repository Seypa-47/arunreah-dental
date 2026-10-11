import { AdminListImage, AdminPublicationStatus } from '@/components/admin/admin-list';
import { AdminPageHeading } from '@/components/layout/admin-workspace';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { defaultImagePresentation, type ImagePresentation, type PageMediaPlacement } from '@arunreah/shared';
import { MediaUploader } from '@/components/admin/media-uploader';
import { AdminFeedback } from '@/components/admin/admin-feedback';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { queryKeys } from '@/lib/query-keys';
import { cmsApi, type AdminPageMediaRecord } from '@/services/cms';
import { getPublicMediaUrl } from '@/services/media';
import { pageMediaFrames } from '@/components/admin/image-frames';

type EditorState = {
  badgeEn: string;
  badgeKm: string;
  benefitsEn: string;
  benefitsKm: string;
  bodyEn: string;
  bodyKm: string;
  displayOrder: string;
  imageKey: string;
  imagePresentation: ImagePresentation;
  discountEn: string;
  discountKm: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  titleEn: string;
  titleKm: string;
  validUntil: string;
};

const placements: { description: string; label: string; value: PageMediaPlacement }[] = [
  { value: 'HOME_PROMOTIONS', label: 'Home · Promotions', description: 'Current clinic campaigns and announcements. Publish only active promotions, then archive or remove them when finished.' },
  { value: 'ABOUT_CLINIC_GALLERY_PSA_CHAS', label: 'About · Clinic Gallery · Psa Chas', description: 'The ordered clinic-tour photos shown for Psa Chas under “A look inside our clinic”. Add as many photos as needed, with English and Khmer captions.' },
  { value: 'ABOUT_CLINIC_GALLERY_TOUL_TOMPOUNG', label: 'About · Clinic Gallery · Toul Tompoung', description: 'The ordered clinic-tour photos shown for Toul Tompoung under “A look inside our clinic”. Add as many photos as needed, with English and Khmer captions.' },
  { value: 'ABOUT_PROFESSIONAL_DEVELOPMENT', label: 'About · Professional Development', description: 'Editorial images that support the clinic story on the About page.' },
  { value: 'ABOUT_ADVANCED_FACILITIES', label: 'About · Advanced Facilities', description: 'Ordered facility cards for the technology section on the About page.' },
  { value: 'DOCTORS_PATIENT_EDUCATION', label: 'Our Team · Patient-first Approach', description: 'A single educational image block on the Our Team page.' },
];

const emptyEditor = (displayOrder = 0): EditorState => ({ badgeEn: '', badgeKm: '', benefitsEn: '', benefitsKm: '', bodyEn: '', bodyKm: '', discountEn: '', discountKm: '', displayOrder: String(displayOrder), imageKey: '', imagePresentation: defaultImagePresentation, status: 'DRAFT', titleEn: '', titleKm: '', validUntil: '' });
const toEditor = (item: AdminPageMediaRecord): EditorState => ({
  badgeEn: item.badgeEn ?? '', badgeKm: item.badgeKm ?? '', benefitsEn: item.benefitsEn ?? '', benefitsKm: item.benefitsKm ?? '', bodyEn: item.bodyEn ?? '', bodyKm: item.bodyKm ?? '', discountEn: item.discountEn ?? '', discountKm: item.discountKm ?? '', displayOrder: String(item.displayOrder), imageKey: item.imageKey, imagePresentation: item.imagePresentation ?? defaultImagePresentation, status: item.status, titleEn: item.titleEn ?? '', titleKm: item.titleKm ?? '', validUntil: item.validUntil ?? '',
});

function safeError(error: unknown) {
  if (error instanceof Error && error.message.includes('409')) return 'This change conflicts with existing clinic content. Please refresh and try again.';
  return 'We could not save this content. Please check the fields and try again.';
}

export function getNextPageMediaDisplayOrder(items: Pick<AdminPageMediaRecord, 'displayOrder'>[]) {
  return items.reduce((highest, item) => Math.max(highest, item.displayOrder), 0) + 1;
}

export function AdminPageMediaPage() {
  const client = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPlacement = placements.find((item) => item.value === searchParams.get('placement'))?.value;
  const [placement, setPlacement] = useState<PageMediaPlacement>(requestedPlacement ?? 'ABOUT_PROFESSIONAL_DEVELOPMENT');
  const isClinicGallery = placement === 'ABOUT_CLINIC_GALLERY_PSA_CHAS' || placement === 'ABOUT_CLINIC_GALLERY_TOUL_TOMPOUNG';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<EditorState>(emptyEditor);
  const [notice, setNotice] = useState<string>();
  const pageMedia = useQuery({ queryKey: queryKeys.admin.pageMedia(placement), queryFn: () => cmsApi.pageMedia.list(placement) });
  const selected = useMemo(() => pageMedia.data?.items.find((item) => item.id === selectedId), [pageMedia.data?.items, selectedId]);

  useEffect(() => {
    if (selected) setForm(toEditor(selected));
  }, [selected]);

  useEffect(() => {
    if (requestedPlacement && requestedPlacement !== placement) {
      setPlacement(requestedPlacement);
      setSelectedId(null);
      setForm(emptyEditor());
      setNotice(undefined);
    }
  }, [placement, requestedPlacement]);

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
        badgeEn: placement === 'HOME_PROMOTIONS' ? form.badgeEn.trim() || null : null,
        badgeKm: placement === 'HOME_PROMOTIONS' ? form.badgeKm.trim() || null : null,
        benefitsEn: placement === 'HOME_PROMOTIONS' ? form.benefitsEn.trim() || null : null,
        benefitsKm: placement === 'HOME_PROMOTIONS' ? form.benefitsKm.trim() || null : null,
        imageKey: form.imageKey,
        imagePresentation: form.imagePresentation,
        discountEn: placement === 'HOME_PROMOTIONS' ? form.discountEn.trim() || null : null,
        discountKm: placement === 'HOME_PROMOTIONS' ? form.discountKm.trim() || null : null,
        validUntil: placement === 'HOME_PROMOTIONS' ? form.validUntil || null : null,
        displayOrder: Number.parseInt(form.displayOrder, 10) || 0,
      };
      if (!payload.imageKey) throw new Error('An image is required.');
      return selectedId ? cmsApi.pageMedia.update(selectedId, payload) : cmsApi.pageMedia.create(payload);
    },
    onSuccess: async (result) => {
      setSelectedId(result.item.id);
      await invalidate();
      setNotice(isClinicGallery ? 'Gallery photo saved successfully.' : 'Content block saved successfully.');
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => cmsApi.pageMedia.delete(id),
    onSuccess: async () => { setSelectedId(null); setForm(emptyEditor()); await invalidate(); setNotice(isClinicGallery ? 'Gallery photo removed.' : 'Content block removed.'); },
  });
  const set = <K extends keyof EditorState>(key: K, value: EditorState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const placementLabel = placements.find((item) => item.value === placement);
  const isPromotion = placement === 'HOME_PROMOTIONS';
  const itemCount = pageMedia.data?.items.length ?? 0;
  const galleryBranchName = placement === 'ABOUT_CLINIC_GALLERY_PSA_CHAS' ? 'Psa Chas Branch' : placement === 'ABOUT_CLINIC_GALLERY_TOUL_TOMPOUNG' ? 'Toul Tompoung Branch' : undefined;
  const startNewItem = () => {
    setSelectedId(null);
    setForm(emptyEditor(getNextPageMediaDisplayOrder(pageMedia.data?.items ?? [])));
    setNotice(undefined);
  };
  const selectPlacement = (nextPlacement: PageMediaPlacement) => {
    setPlacement(nextPlacement);
    setSelectedId(null);
    setForm(emptyEditor());
    setNotice(undefined);
    const next = new URLSearchParams(searchParams);
    next.set('placement', nextPlacement);
    setSearchParams(next, { replace: true });
  };

  return <div className="min-h-screen bg-[#f6f8fb] lg:flex">

    <main className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0d7596]">CMS content blocks</p>
          <AdminPageHeading />
        </header>

        <div className="mt-5 flex items-center justify-between rounded-xl border border-[#dce5ef] bg-[#edf7fb] px-4 py-3 text-xs font-semibold text-[#167ea7]">
          <span>Looking to edit main website hero banners and headlines?</span>
          <Link className="inline-flex items-center gap-1 font-bold text-[#2187a8] underline hover:text-[#1a718c]" to="/admin/page-heroes">
            Go to Hero Sections Management ↗
          </Link>
        </div>

        {notice ? <div aria-live="polite" className="mt-5"><AdminFeedback title={notice} tone="success" /></div> : null}

        <div className="mt-7 grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <Card className="overflow-hidden rounded-2xl border-[#dce5ef] bg-white p-5 shadow-none">
            <label className="block text-sm font-semibold text-[#52647d]">Filter by website section
              <select className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-sm text-[#182238]" onChange={(event) => selectPlacement(event.target.value as PageMediaPlacement)} value={placement}>
                {placements.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <p className="mt-3 text-sm leading-6 text-[#71839e]">{placementLabel?.description}</p>
            <div className="mt-5 border-t border-[#edf1f5] pt-5">
              <div className="flex items-center justify-between gap-3"><div><h2 className="font-bold text-[#182238]">{isClinicGallery ? 'Gallery photos' : 'Existing blocks'}</h2><p className="mt-1 text-xs text-[#71839e]">{isClinicGallery ? `${itemCount} photo${itemCount === 1 ? '' : 's'} configured · add as many as needed` : `${itemCount} image-backed content block${itemCount === 1 ? '' : 's'}`}</p></div><Button className="shrink-0 px-3 py-2 text-xs" onClick={startNewItem} type="button" variant="secondary">{isClinicGallery && itemCount > 0 ? 'Add another photo' : isClinicGallery ? 'Add photo' : 'New block'}</Button></div>
              {pageMedia.isLoading ? <AdminFeedback title="Loading content…" tone="loading" /> : pageMedia.isError ? <AdminFeedback title="Content could not load" tone="error" actions={<Button onClick={() => void pageMedia.refetch()} variant="secondary">Retry</Button>} /> : pageMedia.data?.items.length ? <div className="mt-4 space-y-3">{pageMedia.data.items.map((item) => {
                const isSelected = item.id === selectedId;
                const imageUrl = getPublicMediaUrl(item.imageKey);
                return <button aria-pressed={isSelected} aria-label={`Edit ${item.titleEn || item.titleKm || 'content block'}`} className={`admin-list-item flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${isSelected ? 'border-[#2187a8] bg-[#edf7fb]' : 'border-[#e3ebf1] hover:border-[#bcd8e4]'}`} key={item.id} onClick={() => setSelectedId(item.id)} type="button">
                  <AdminListImage src={imageUrl ?? undefined} />
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[#182238]">{item.titleEn || item.titleKm || (isClinicGallery ? 'Untitled photo' : 'Untitled block')}</span><span className="mt-2 flex flex-wrap items-center gap-2"><AdminPublicationStatus status={item.status} /><span className="admin-helper">Order {item.displayOrder}</span></span></span>
                </button>;
              })}</div> : <div className="mt-4"><AdminFeedback title={isClinicGallery ? 'No gallery photos yet' : 'No content blocks yet'} tone="empty"><p>{isClinicGallery ? 'Add the first clinic photo, then publish it when both captions are ready.' : 'No content blocks are set up for this section yet.'}</p></AdminFeedback></div>}
            </div>
          </Card>

          <Card className="rounded-2xl border-[#dce5ef] bg-white p-5 shadow-none sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-[#182238]">{isClinicGallery ? (selectedId ? 'Edit gallery photo' : 'Add gallery photo') : (selectedId ? 'Edit content block' : 'New content block')}</h2><p className="mt-1 text-sm text-[#71839e]">{isClinicGallery ? `Upload a photo for ${galleryBranchName}, add its English and Khmer captions, then publish it.` : 'Add English and Khmer separately. Publish only after the image and copy are ready.'}</p></div><div className="flex flex-wrap items-center gap-2">{galleryBranchName ? <span className="rounded-full border border-[#b9dce8] bg-[#f0f8fa] px-3 py-1 text-xs font-bold text-[#0d7596]">{galleryBranchName}</span> : null}{selected?.imageKey ? <span className="rounded-full bg-[#edf7fb] px-3 py-1 text-xs font-bold text-[#0d7596]">Editing existing item</span> : null}</div></div>
            <form className="mt-6 space-y-5" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
              <MediaUploader category="clinic" framing={{ frames: pageMediaFrames(placement), onChange: (imagePresentation) => set('imagePresentation', imagePresentation), value: form.imagePresentation }} help={isClinicGallery ? 'Use a clear landscape photo. Adjust the framing preview so the important area remains visible on every screen.' : 'Choose an image that supports this website section. JPEG, PNG, or WEBP up to 5 MB.'} label={isClinicGallery ? 'Clinic photo' : 'Content image'} onClear={() => set('imageKey', '')} onUploaded={(key) => set('imageKey', key)} required value={form.imageKey} />
              <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-[#52647d]">Status<select className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-sm" onChange={(event) => set('status', event.target.value as EditorState['status'])} value={form.status}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></select></label><label className="text-sm font-semibold text-[#52647d]">Display order<input className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3 text-sm" min="0" onChange={(event) => set('displayOrder', event.target.value)} type="number" value={form.displayOrder} /></label></div>
              <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-[#52647d]">{isClinicGallery ? 'Caption · English' : 'Title · English'}<input className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3 text-sm" maxLength={160} onChange={(event) => set('titleEn', event.target.value)} placeholder={isClinicGallery ? 'e.g. Comfortable waiting lounge' : undefined} value={form.titleEn} /></label><label className="text-sm font-semibold text-[#52647d]">{isClinicGallery ? 'ចំណងជើងរូបភាព · ខ្មែរ' : 'ចំណងជើង · ខ្មែរ'}<input className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3 text-sm" lang="km" maxLength={160} onChange={(event) => set('titleKm', event.target.value)} value={form.titleKm} /></label></div>
              {!isClinicGallery ? <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-[#52647d]">Description · English<textarea className="mt-2 min-h-32 w-full rounded-xl border border-[#dce5ef] p-3 text-sm leading-6" maxLength={1200} onChange={(event) => set('bodyEn', event.target.value)} value={form.bodyEn} /></label><label className="text-sm font-semibold text-[#52647d]">ពិពណ៌នា · ខ្មែរ<textarea className="mt-2 min-h-32 w-full rounded-xl border border-[#dce5ef] p-3 text-sm leading-6" lang="km" maxLength={1200} onChange={(event) => set('bodyKm', event.target.value)} value={form.bodyKm} /></label></div> : null}
              {isPromotion ? <fieldset className="space-y-5 rounded-xl border border-[#dcebf0] bg-[#f8fcfd] p-4 sm:p-5">
                <legend className="px-1 text-sm font-bold text-[#182238]">Promotion details <span className="font-normal text-[#71839e]">(all optional)</span></legend>
                <p className="-mt-2 text-xs leading-5 text-[#71839e]">Use only details that are true for this campaign. Add up to three short benefits, one per line.</p>
                <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-[#52647d]">Campaign label · English<input className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-sm" maxLength={80} onChange={(event) => set('badgeEn', event.target.value)} placeholder="e.g. Limited-time offer" value={form.badgeEn} /></label><label className="text-sm font-semibold text-[#52647d]">ស្លាកកម្មវិធី · ខ្មែរ<input className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-sm" maxLength={80} onChange={(event) => set('badgeKm', event.target.value)} value={form.badgeKm} /></label></div>
                <div className="grid gap-4 sm:grid-cols-3"><label className="text-sm font-semibold text-[#52647d]">Discount · English<input className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-sm" maxLength={40} onChange={(event) => set('discountEn', event.target.value)} placeholder="e.g. 20% OFF" value={form.discountEn} /></label><label className="text-sm font-semibold text-[#52647d]">ការបញ្ចុះតម្លៃ · ខ្មែរ<input className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-sm" maxLength={40} onChange={(event) => set('discountKm', event.target.value)} placeholder="ឧ. បញ្ចុះតម្លៃ 20%" value={form.discountKm} /></label><label className="text-sm font-semibold text-[#52647d]">Valid until<input className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-sm" onChange={(event) => set('validUntil', event.target.value)} type="date" value={form.validUntil} /></label></div>
                <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-[#52647d]">Benefits · English<textarea className="mt-2 min-h-28 w-full rounded-xl border border-[#dce5ef] bg-white p-3 text-sm leading-6" maxLength={600} onChange={(event) => set('benefitsEn', event.target.value)} placeholder={'Benefit one\\nBenefit two\\nBenefit three'} value={form.benefitsEn} /></label><label className="text-sm font-semibold text-[#52647d]">អត្ថប្រយោជន៍ · ខ្មែរ<textarea className="mt-2 min-h-28 w-full rounded-xl border border-[#dce5ef] bg-white p-3 text-sm leading-6" maxLength={600} onChange={(event) => set('benefitsKm', event.target.value)} value={form.benefitsKm} /></label></div>
              </fieldset> : null}
              {save.isError ? <p className="text-sm text-[#c92727]" role="alert">{safeError(save.error)}</p> : null}
              {remove.isError ? <p className="text-sm text-[#c92727]" role="alert">We could not remove this block. Please try again.</p> : null}
              <div className="flex flex-wrap justify-between gap-3 border-t border-[#edf1f5] pt-5"><div>{selectedId ? <div><Button className="bg-[#b42318] hover:bg-[#8f1c14]" disabled={remove.isPending || save.isPending} onClick={() => { if (window.confirm(isClinicGallery ? 'Remove this gallery photo? The uploaded image will remain in media storage.' : 'Remove this CMS content block? The uploaded image will remain in media storage.')) remove.mutate(selectedId); }} type="button">{isClinicGallery ? 'Remove photo' : 'Remove content block'}</Button><p className="mt-2 max-w-sm text-xs leading-5 text-[#71839e]">This removes the placement and its copy from the page. It does not delete the image asset from R2.</p></div> : null}</div><div className="flex flex-wrap justify-end gap-3">{isClinicGallery && selectedId ? <Button disabled={save.isPending || remove.isPending} onClick={startNewItem} type="button" variant="secondary">Add another photo</Button> : null}<Button disabled={save.isPending || !form.imageKey} type="submit">{save.isPending ? 'Saving…' : selectedId ? 'Save changes' : isClinicGallery ? 'Add photo' : 'Create block'}</Button></div></div>
            </form>
          </Card>
        </div>
      </div>
    </main>
  </div>;
}
