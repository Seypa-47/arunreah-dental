import { AdminPageHeading } from '@/components/layout/admin-workspace';
import { useId, useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { defaultImagePresentation, type ImagePresentation, type UpdateShowcaseInput } from '@arunreah/shared';
import { AdminIcon } from '@/components/layout/admin-sidebar';
import { AdminToggle } from '@/components/admin/admin-toggle';
import { MediaUploader } from '@/components/admin/media-uploader';
import { imageFrames } from '@/components/admin/image-frames';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cmsApi, type AdminShowcaseDetail } from '@/services/cms';
import { invalidateCmsDomain } from '@/services/cms-cache';
import { queryKeys } from '@/lib/query-keys';
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard';
import { toMediaKey } from '@/services/media';

const categoryOptions = [
  'Treatment',
  'Smile Makeover',
  'Restorative Dentistry',
  'Cosmetic Dentistry',
  'Patient Education',
  'Clinic Experience',
  'Smile Care',
  'Technology',
];

function Field({
  children,
  help,
  label,
  required,
}: {
  children: ReactNode;
  help?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[12.5px] font-bold text-[#61738d]">
        {label} {required ? <span className="text-[#e03137]">*</span> : null}
      </label>
      <div className="mt-1.5">{children}</div>
      {help ? <p className="mt-1 text-[11.5px] text-[#71839e]">{help}</p> : null}
    </div>
  );
}

function TextInput({
  className = '',
  lang,
  onChange,
  placeholder,
  type = 'text',
  value,
  min,
}: {
  className?: string;
  lang?: string;
  min?: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  value?: string | number;
}) {
  return (
    <input
      className={`h-10 w-full rounded-xl border border-[#64748b] bg-white px-3.5 text-[13px] font-medium text-[#182238] shadow-xs outline-none transition placeholder:text-[#71839e] hover:border-[#475569] focus:border-[#096b89] focus:ring-2 focus:ring-[#096b89]/20 ${className}`}
      lang={lang}
      min={min}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      value={value ?? ''}
    />
  );
}

function StatusSwitch({
  onChange,
  status,
}: {
  onChange: (status: 'DRAFT' | 'PUBLISHED') => void;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}) {
  const publishedId = useId();
  const draftId = useId();

  return (
    <div>
      <p className="text-[12px] font-bold text-[#61738d]">Status</p>
      <div className="mt-1.5 flex h-10 items-center gap-4">
        <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] font-bold text-[#182238]" htmlFor={publishedId}>
          <input
            checked={status === 'PUBLISHED'}
            className="size-4 accent-[#2187a8]"
            id={publishedId}
            name="showcase-status"
            onChange={() => onChange('PUBLISHED')}
            type="radio"
          />
          Published
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium text-[#71839e]" htmlFor={draftId}>
          <input
            checked={status !== 'PUBLISHED'}
            className="size-4 accent-[#2187a8]"
            id={draftId}
            name="showcase-status"
            onChange={() => onChange('DRAFT')}
            type="radio"
          />
          Draft
        </label>
      </div>
    </div>
  );
}

function ShowcaseDetailEditor({ showcase }: { showcase: AdminShowcaseDetail }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDirty, setIsDirty] = useState(false);

  // Form State
  const [titleEn, setTitleEn] = useState(showcase.titleEn ?? '');
  const [titleKm, setTitleKm] = useState(showcase.titleKm ?? '');
  const [slug, setSlug] = useState(showcase.slug ?? '');
  const [categoryEn, setCategoryEn] = useState(showcase.categoryEn ?? 'Treatment');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>(showcase.status ?? 'DRAFT');
  const [showOnHomepage, setShowOnHomepage] = useState(showcase.showOnHomepage ?? false);
  const [displayOrder, setDisplayOrder] = useState<number>(showcase.displayOrder ?? 0);
  const [summaryEn, setSummaryEn] = useState(showcase.summaryEn ?? '');
  const [summaryKm, setSummaryKm] = useState(showcase.summaryKm ?? '');
  const [bodyEn, setBodyEn] = useState(showcase.bodyEn ?? '');
  const [bodyKm, setBodyKm] = useState(showcase.bodyKm ?? '');
  const [coverImageKey, setCoverImageKey] = useState<string | null>(showcase.coverImageKey ?? null);
  const [coverImagePresentation, setCoverImagePresentation] = useState<ImagePresentation>(
    showcase.coverImagePresentation ?? defaultImagePresentation,
  );
  const [sections, setSections] = useState<AdminShowcaseDetail['sections']>(showcase.sections ?? []);
  const [relatedShowcaseIds, setRelatedShowcaseIds] = useState<string[]>(showcase.relatedShowcaseIds ?? []);
  const [metaTitleEn, setMetaTitleEn] = useState(showcase.metaTitleEn ?? '');
  const [metaTitleKm, setMetaTitleKm] = useState(showcase.metaTitleKm ?? '');
  const [metaDescriptionEn, setMetaDescriptionEn] = useState(showcase.metaDescriptionEn ?? '');
  const [metaDescriptionKm, setMetaDescriptionKm] = useState(showcase.metaDescriptionKm ?? '');

  const [openSectionIndex, setOpenSectionIndex] = useState<number | undefined>(0);
  const [notification, setNotification] = useState<{ message: string; tone: 'success' | 'error' } | undefined>();

  // Fetch other showcases for related section
  const { data: otherShowcasesData } = useQuery({
    queryKey: queryKeys.admin.showcases({ limit: 50 }),
    queryFn: () => cmsApi.showcases.list({ limit: 50 }),
  });

  const availableRelated = useMemo(() => {
    return (otherShowcasesData?.items ?? []).filter((item) => item.id !== showcase.id);
  }, [otherShowcasesData?.items, showcase.id]);

  const markDirty = () => setIsDirty(true);
  useUnsavedChangesGuard(isDirty);

  const showNotification = (message: string, tone: 'success' | 'error' = 'success') => {
    setNotification({ message, tone });
    setTimeout(() => {
      setNotification(undefined);
    }, 5000);
  };

  const saveMutation = useMutation({
    mutationFn: async (targetStatus?: 'DRAFT' | 'PUBLISHED') => {
      const activeStatus = targetStatus ?? (status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT');
      const payload: UpdateShowcaseInput = {
        titleEn: titleEn.trim(),
        titleKm: titleKm.trim(),
        slug: slug.trim().toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-+|-+$)/g, ''),
        categoryEn: categoryEn.trim() || null,
        categoryKm: null,
        status: activeStatus,
        showOnHomepage,
        displayOrder,
        summaryEn: summaryEn.trim() || null,
        summaryKm: summaryKm.trim() || null,
        bodyEn: bodyEn.trim() || null,
        bodyKm: bodyKm.trim() || null,
        coverImageKey: toMediaKey(coverImageKey),
        coverImagePresentation,
        sections: sections.map((sec, idx) => ({
          sectionType: sec.sectionType,
          headingEn: sec.headingEn?.trim() || null,
          headingKm: sec.headingKm?.trim() || null,
          bodyEn: sec.bodyEn?.trim() || null,
          bodyKm: sec.bodyKm?.trim() || null,
          imageKey: toMediaKey(sec.imageKey),
          ...(sec.imageKey && sec.imagePresentation ? { imagePresentation: sec.imagePresentation } : {}),
          displayOrder: idx,
        })),
        relatedShowcaseIds,
        metaTitleEn: metaTitleEn.trim() || null,
        metaTitleKm: metaTitleKm.trim() || null,
        metaDescriptionEn: metaDescriptionEn.trim() || null,
        metaDescriptionKm: metaDescriptionKm.trim() || null,
      };

      return cmsApi.showcases.update(showcase.id, payload);
    },
    onSuccess: async () => {
      setIsDirty(false);
      await invalidateCmsDomain(queryClient, 'showcases');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to save this showcase. Please check the fields and try again.';
      showNotification(message || 'Unable to save this showcase. Please check the fields and try again.', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => cmsApi.showcases.delete(showcase.id),
    onSuccess: async () => {
      await invalidateCmsDomain(queryClient, 'showcases');
      navigate('/admin/showcase');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to delete this showcase.';
      showNotification(message, 'error');
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this showcase? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const handleSaveDraft = () => {
    setStatus('DRAFT');
    saveMutation.mutate('DRAFT', {
      onSuccess: () => showNotification('Showcase draft saved successfully.', 'success'),
    });
  };

  const handleUpdate = () => {
    setStatus('PUBLISHED');
    saveMutation.mutate('PUBLISHED', {
      onSuccess: () => showNotification('Showcase updated and published successfully.', 'success'),
    });
  };

  // Section manipulation
  const addSection = () => {
    markDirty();
    setSections((current) => [
      ...current,
      {
        displayOrder: current.length,
        headingEn: null,
        headingKm: null,
        bodyEn: null,
        bodyKm: null,
        imageKey: null,
        sectionType: 'TEXT',
      },
    ]);
    setOpenSectionIndex(sections.length);
  };

  const removeSection = (index: number) => {
    markDirty();
    setSections((current) => current.filter((_, i) => i !== index));
    if (openSectionIndex === index) setOpenSectionIndex(undefined);
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    markDirty();
    setSections((current) => {
      const next = [...current];
      const item = next[index]!;
      next[index] = next[target]!;
      next[target] = item;
      return next;
    });
    setOpenSectionIndex(target);
  };

  const updateSection = (index: number, patch: Partial<AdminShowcaseDetail['sections'][number]>) => {
    markDirty();
    setSections((current) => {
      const next = [...current];
      next[index] = { ...next[index]!, ...patch };
      return next;
    });
  };

  const previewHref = `/showcases/${slug || showcase.slug || showcase.id}`;

  return (
    <main className="min-w-0 flex-1 bg-[#f6f8fb] px-5 py-7 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1200px] w-full">
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
              className={notification.tone === 'error' ? 'text-[#b42318] hover:text-[#7a271a]' : 'text-[#13ad63] hover:text-[#0b7944]'}
              onClick={() => setNotification(undefined)}
              type="button"
            >
              ✕
            </button>
          </div>
        ) : null}

        {/* Header Bar */}
        <header className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12.5px] font-medium text-[#71839e]">
              <Link className="hover:text-[#2187a8]" to="/admin/dashboard">
                Dashboard
              </Link>
              <span>/</span>
              <Link className="hover:text-[#2187a8]" to="/admin/showcase">
                Showcases
              </Link>
              <span>/</span>
              <span className="font-semibold text-[#182238]">Edit showcase</span>
            </nav>
            <AdminPageHeading />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              className="h-9.5 rounded-xl border border-[#dce5ef] bg-white px-4 text-[12.5px] font-semibold text-[#2187a8] shadow-none hover:bg-[#f4f8fb]"
              onClick={() => window.open(previewHref, '_blank', 'noreferrer')}
              type="button"
              variant="secondary"
            >
              <AdminIcon className="size-3.5" name="eye" />
              Preview Page
            </Button>
            <Button
              className="h-9.5 rounded-xl border border-[#fecdca] bg-[#fff5f5] px-4 text-[12.5px] font-semibold text-[#b42318] shadow-none hover:bg-[#fee2e2]"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
              type="button"
              variant="secondary"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete Showcase'}
            </Button>
            <Button
              className="h-9.5 rounded-xl border border-[#dce5ef] bg-white px-4 text-[12.5px] font-semibold text-[#2187a8] shadow-none hover:bg-[#f4f8fb]"
              disabled={saveMutation.isPending}
              onClick={handleSaveDraft}
              type="button"
              variant="secondary"
            >
              Save Draft
            </Button>
            <Button
              className="h-9.5 rounded-xl bg-[#2187a8] px-4.5 text-[12.5px] font-bold text-white hover:bg-[#1a718c]"
              disabled={saveMutation.isPending}
              onClick={handleUpdate}
              type="button"
            >
              {saveMutation.isPending ? 'Updating…' : 'Update Showcase'}
            </Button>
          </div>
        </header>

        {/* Editor Sections */}
        <section aria-label="Showcase editor" className="mt-6 space-y-5">
          {/* 1. Basic Information */}
          <Card className="rounded-[18px] border-[#dce5ef] p-6 shadow-none">
            <h2 className="text-[16px] font-bold text-[#182238]">1. Basic Information</h2>
            <div className="mt-5 space-y-5">
              {/* Titles */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Showcase Title · English" required>
                  <TextInput
                    onChange={(e) => {
                      markDirty();
                      setTitleEn(e.target.value);
                    }}
                    placeholder="e.g. Full Mouth Rehabilitation"
                    value={titleEn}
                  />
                </Field>
                <Field label="ចំណងជើង · ខ្មែរ" required>
                  <TextInput
                    lang="km"
                    onChange={(e) => {
                      markDirty();
                      setTitleKm(e.target.value);
                    }}
                    placeholder="បញ្ចូលចំណងជើងជាភាសាខ្មែរ"
                    value={titleKm}
                  />
                </Field>
              </div>

              {/* URL Slug & Category */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field help="Unique URL path identifier for this showcase article." label="URL Slug" required>
                  <TextInput
                    onChange={(e) => {
                      markDirty();
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replaceAll(/[^a-z0-9]+/g, '-')
                          .replaceAll(/(^-+|-+$)/g, ''),
                      );
                    }}
                    placeholder="full-mouth-rehabilitation"
                    value={slug}
                  />
                </Field>
                <Field label="Category">
                  <select
                    className="h-10 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[13px] font-medium text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                    onChange={(e) => {
                      markDirty();
                      setCategoryEn(e.target.value);
                    }}
                    value={categoryEn}
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Status, Sort Order, and Show on Homepage */}
              <div className="grid gap-5 rounded-xl border border-[#edf2f7] bg-[#fbfcfd] p-4 sm:grid-cols-3 items-start">
                <StatusSwitch
                  onChange={(newStatus) => {
                    markDirty();
                    setStatus(newStatus);
                  }}
                  status={status}
                />
                <Field help="Lower numbers appear first in the public showcases list." label="Sort Order">
                  <TextInput
                    min={0}
                    onChange={(e) => {
                      markDirty();
                      setDisplayOrder(Number(e.target.value) || 0);
                    }}
                    type="number"
                    value={displayOrder}
                  />
                </Field>
                <div>
                  <p className="text-[12px] font-bold text-[#61738d]">Homepage Visibility</p>
                  <div className="mt-1.5 flex h-10 items-center">
                    <AdminToggle
                      checked={showOnHomepage}
                      label="Feature on homepage"
                      onChange={(checked) => {
                        markDirty();
                        setShowOnHomepage(checked);
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[11.5px] leading-tight text-[#71839e]">
                    Feature this showcase card on homepage highlights.
                  </p>
                </div>
              </div>

              {/* Short Summaries */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field help="Short summary displayed on cards and search results." label="Short Summary · English">
                  <textarea
                    className="h-[100px] w-full resize-none rounded-xl border border-[#dce5ef] bg-white px-3.5 py-2.5 text-[13px] font-medium leading-6 text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                    onChange={(e) => {
                      markDirty();
                      setSummaryEn(e.target.value);
                    }}
                    placeholder="Brief description of the patient case or treatment story..."
                    value={summaryEn}
                  />
                </Field>
                <Field help="សេចក្តីសង្ខេបខ្លីសម្រាប់បង្ហាញលើកាត" label="ពិពណ៌នាខ្លី · ខ្មែរ">
                  <textarea
                    className="h-[100px] w-full resize-none rounded-xl border border-[#dce5ef] bg-white px-3.5 py-2.5 text-[13px] font-medium leading-6 text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                    lang="km"
                    onChange={(e) => {
                      markDirty();
                      setSummaryKm(e.target.value);
                    }}
                    placeholder="សេចក្តីសង្ខេបខ្លីសម្រាប់កាត..."
                    value={summaryKm}
                  />
                </Field>
              </div>

              {/* Cover Image */}
              <div className="space-y-3 rounded-xl border border-[#edf2f7] bg-[#fbfcfd] p-4">
                <MediaUploader
                  category="showcases"
                  framing={{
                    frames: imageFrames.showcaseCover,
                    onChange: (presentation) => {
                      markDirty();
                      setCoverImagePresentation(presentation);
                    },
                    value: coverImagePresentation,
                  }}
                  help="Choose a clear cover photograph representing this showcase. JPEG, PNG, or WEBP up to 5 MB."
                  label="Cover Image"
                  onClear={() => {
                    markDirty();
                    setCoverImageKey(null);
                  }}
                  onUploaded={(key) => {
                    markDirty();
                    setCoverImageKey(key);
                  }}
                  value={coverImageKey ?? undefined}
                />
              </div>
            </div>
          </Card>

          {/* 2. Article Body Content */}
          <Card className="rounded-[18px] border-[#dce5ef] p-6 shadow-none">
            <h2 className="text-[16px] font-bold text-[#182238]">2. Article Body & Content</h2>
            <p className="mt-1 text-[12.5px] text-[#71839e]">
              Provide the introductory or overarching case narrative for this showcase.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Main Body · English">
                <textarea
                  className="h-44 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 py-2.5 text-[13px] font-medium leading-relaxed text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                  onChange={(e) => {
                    markDirty();
                    setBodyEn(e.target.value);
                  }}
                  placeholder="Comprehensive clinical overview, patient background, and treatment narrative..."
                  value={bodyEn}
                />
              </Field>
              <Field label="ខ្លឹមសារដើម · ខ្មែរ">
                <textarea
                  className="h-44 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 py-2.5 text-[13px] font-medium leading-relaxed text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                  lang="km"
                  onChange={(e) => {
                    markDirty();
                    setBodyKm(e.target.value);
                  }}
                  placeholder="ខ្លឹមសារលម្អិតអំពីករណីព្យាបាល..."
                  value={bodyKm}
                />
              </Field>
            </div>
          </Card>

          {/* 3. Section Blocks */}
          <Card className="rounded-[18px] border-[#dce5ef] p-6 shadow-none">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-[16px] font-bold text-[#182238]">3. Section Blocks</h2>
                <p className="mt-1 text-[12.5px] text-[#71839e]">
                  Break the showcase into progressive narrative chapters, clinical procedures, or photo sections.
                </p>
              </div>
              <Button
                className="h-9 rounded-xl bg-[#edf7fb] px-3.5 text-[12.5px] font-bold text-[#167ea7] shadow-none hover:bg-[#e0f0f8]"
                onClick={addSection}
                type="button"
                variant="secondary"
              >
                + Add Section
              </Button>
            </div>

            {sections.length > 0 ? (
              <ol aria-label="Showcase section blocks" className="mt-5 space-y-3">
                {sections.map((sec, idx) => {
                  const isOpen = openSectionIndex === idx;
                  const titleDisplay = sec.headingEn?.trim() || sec.headingKm?.trim() || `Section ${idx + 1}`;

                  return (
                    <li className="overflow-hidden rounded-xl border border-[#dce5ef]" key={`section-${idx}`}>
                      <div className="flex flex-wrap items-center gap-3 bg-[#fbfdfe] p-3 sm:flex-nowrap">
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#edf7fb] text-[12px] font-bold text-[#167ea7]">
                          {idx + 1}
                        </span>
                        <button
                          aria-expanded={isOpen}
                          className="min-w-0 flex-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8]"
                          onClick={() => setOpenSectionIndex((current) => (current === idx ? undefined : idx))}
                          type="button"
                        >
                          <span className="block truncate text-[14px] font-bold text-[#182238]">{titleDisplay}</span>
                          <span className="mt-0.5 flex items-center gap-2 text-[12px] text-[#71839e]">
                            <span className="rounded bg-[#edf2f7] px-1.5 py-0.5 text-[10.5px] font-bold uppercase">
                              {sec.sectionType}
                            </span>
                            <span>{sec.bodyEn ? 'Content added' : 'Empty'}</span>
                          </span>
                        </button>
                        <div aria-label={`Section ${idx + 1} ordering controls`} className="flex shrink-0 items-center gap-1">
                          <Button
                            aria-label={`Move section ${idx + 1} earlier`}
                            className="min-h-8 px-2.5 py-1 text-xs"
                            disabled={idx === 0}
                            onClick={() => moveSection(idx, -1)}
                            type="button"
                            variant="secondary"
                          >
                            ↑
                          </Button>
                          <Button
                            aria-label={`Move section ${idx + 1} later`}
                            className="min-h-8 px-2.5 py-1 text-xs"
                            disabled={idx === sections.length - 1}
                            onClick={() => moveSection(idx, 1)}
                            type="button"
                            variant="secondary"
                          >
                            ↓
                          </Button>
                          <Button
                            aria-label={`Remove section ${idx + 1}`}
                            className="min-h-8 px-2.5 py-1 text-xs text-[#b42318] hover:bg-[#fff0f1]"
                            onClick={() => removeSection(idx)}
                            type="button"
                            variant="secondary"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>

                      {isOpen ? (
                        <div className="border-t border-[#dce5ef] p-4 sm:p-5 space-y-4">
                          <div className="grid gap-4 sm:grid-cols-[14rem_minmax(0,1fr)]">
                            <Field label="Section Type">
                              <select
                                className="h-10 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-[13px]"
                                onChange={(e) => updateSection(idx, { sectionType: e.target.value as 'TEXT' | 'IMAGE' | 'QUOTE' })}
                                value={sec.sectionType}
                              >
                                <option value="TEXT">Standard Text</option>
                                <option value="IMAGE">Image-Led</option>
                                <option value="QUOTE">Patient Quote</option>
                              </select>
                            </Field>
                            <div className="rounded-lg bg-[#f4f8fa] px-3.5 py-2.5 text-[12px] leading-5 text-[#52647d]">
                              {sec.sectionType === 'IMAGE'
                                ? 'Use image-led sections for clinical before-and-after photos or procedure snapshots.'
                                : sec.sectionType === 'QUOTE'
                                  ? 'Highlights a direct quote or patient testimonial regarding the transformation.'
                                  : 'General narrative section for explaining diagnostics, treatments, and outcomes.'}
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Section Heading · English">
                              <TextInput
                                onChange={(e) => updateSection(idx, { headingEn: e.target.value })}
                                placeholder="e.g. Assessment & Smile Analysis"
                                value={sec.headingEn ?? ''}
                              />
                            </Field>
                            <Field label="ចំណងជើងផ្នែក · ខ្មែរ">
                              <TextInput
                                lang="km"
                                onChange={(e) => updateSection(idx, { headingKm: e.target.value })}
                                placeholder="ចំណងជើងផ្នែកជាភាសាខ្មែរ"
                                value={sec.headingKm ?? ''}
                              />
                            </Field>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Section Content · English">
                              <textarea
                                className="h-32 w-full rounded-xl border border-[#dce5ef] px-3 py-2 text-[13px]"
                                onChange={(e) => updateSection(idx, { bodyEn: e.target.value })}
                                placeholder="Detailed section explanation..."
                                value={sec.bodyEn ?? ''}
                              />
                            </Field>
                            <Field label="ខ្លឹមសារផ្នែក · ខ្មែរ">
                              <textarea
                                className="h-32 w-full rounded-xl border border-[#dce5ef] px-3 py-2 text-[13px]"
                                lang="km"
                                onChange={(e) => updateSection(idx, { bodyKm: e.target.value })}
                                placeholder="ខ្លឹមសារផ្នែកជាភាសាខ្មែរ..."
                                value={sec.bodyKm ?? ''}
                              />
                            </Field>
                          </div>

                          <MediaUploader
                            category="showcases"
                            framing={{
                              frames: imageFrames.showcaseSection,
                              onChange: (imagePresentation) => updateSection(idx, { imagePresentation }),
                              value: sec.imagePresentation,
                            }}
                            help="Optional supporting photo for this specific section."
                            label="Section Image"
                            onClear={() => updateSection(idx, { imageKey: null })}
                            onUploaded={(key) => updateSection(idx, { imageKey: key })}
                            value={sec.imageKey ?? undefined}
                          />
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="mt-5 rounded-xl border border-dashed border-[#dce5ef] p-5 text-center text-[13px] leading-6 text-[#71839e]">
                No section blocks yet. Click <strong>+ Add Section</strong> to include detailed treatment steps or photography.
              </p>
            )}
          </Card>

          {/* 4. Related Showcases */}
          <Card className="rounded-[18px] border-[#dce5ef] p-6 shadow-none">
            <h2 className="text-[16px] font-bold text-[#182238]">4. Related Showcases</h2>
            <p className="mt-1 text-[12.5px] text-[#71839e]">
              Select up to 3 related articles to present at the bottom of the public showcase page.
            </p>

            {availableRelated.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {availableRelated.map((article) => {
                  const isSelected = relatedShowcaseIds.includes(article.id);
                  return (
                    <button
                      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? 'border-[#2187a8] bg-[#f0f9fc]'
                          : 'border-[#dce5ef] bg-white hover:border-[#b8cfdf]'
                      }`}
                      key={article.id}
                      onClick={() => {
                        markDirty();
                        if (isSelected) {
                          setRelatedShowcaseIds((current) => current.filter((id) => id !== article.id));
                        } else {
                          if (relatedShowcaseIds.length >= 3) {
                            showNotification('You can select a maximum of 3 related showcases.', 'error');
                            return;
                          }
                          setRelatedShowcaseIds((current) => [...current, article.id]);
                        }
                      }}
                      type="button"
                    >
                      <input
                        checked={isSelected}
                        className="mt-0.5 size-4 rounded accent-[#2187a8]"
                        readOnly
                        type="checkbox"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold text-[#182238]">{article.titleEn}</p>
                        <p className="truncate text-[11.5px] text-[#71839e]">{article.categoryEn || 'General'}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-[#71839e]">No other published showcases found.</p>
            )}
          </Card>

          {/* 5. SEO & Metadata */}
          <Card className="rounded-[18px] border-[#dce5ef] p-6 shadow-none">
            <h2 className="text-[16px] font-bold text-[#182238]">5. SEO & Search Settings</h2>
            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Meta Title · English">
                  <TextInput
                    onChange={(e) => {
                      markDirty();
                      setMetaTitleEn(e.target.value);
                    }}
                    placeholder="Showcase Title | Arunreah Dental Clinic"
                    value={metaTitleEn}
                  />
                </Field>
                <Field label="ចំណងជើង SEO · ខ្មែរ">
                  <TextInput
                    lang="km"
                    onChange={(e) => {
                      markDirty();
                      setMetaTitleKm(e.target.value);
                    }}
                    placeholder="ចំណងជើង SEO ជាភាសាខ្មែរ"
                    value={metaTitleKm}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Meta Description · English">
                  <textarea
                    className="h-20 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 py-2.5 text-[13px] font-medium leading-relaxed text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                    onChange={(e) => {
                      markDirty();
                      setMetaDescriptionEn(e.target.value);
                    }}
                    placeholder="Concise overview for Google search results and social previews..."
                    value={metaDescriptionEn}
                  />
                </Field>
                <Field label="ពិពណ៌នា SEO · ខ្មែរ">
                  <textarea
                    className="h-20 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 py-2.5 text-[13px] font-medium leading-relaxed text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                    lang="km"
                    onChange={(e) => {
                      markDirty();
                      setMetaDescriptionKm(e.target.value);
                    }}
                    placeholder="ការពិពណ៌នា SEO ជាភាសាខ្មែរ..."
                    value={metaDescriptionKm}
                  />
                </Field>
              </div>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#e2e8f0] pt-6 text-[12.5px] text-[#9badc5]">
          <p>© {new Date().getFullYear()} Arunreah Dental Clinic. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 text-[#71839e]">
              <AdminIcon className="size-3.5 text-[#2187a8]" name="shield" />
              SSL Secured
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#71839e]">
              <AdminIcon className="size-3.5 text-[#2187a8]" name="lock" />
              256-bit Encryption
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:flex">
      <main aria-busy="true" aria-label="Loading showcase editor" className="min-h-screen flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-[1200px] w-full">
          <div className="h-8 w-64 animate-pulse rounded bg-[#e7edf3]" />
          <div className="mt-8 space-y-4">
            <div className="h-[420px] animate-pulse rounded-[18px] bg-white" />
            <div className="h-[220px] animate-pulse rounded-[18px] bg-white" />
          </div>
        </div>
      </main>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8fb] p-6">
      <Card className="max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold text-[#182238]">Showcase editor is unavailable</h1>
        <p className="mt-3 text-[#71839e]">Please refresh and try again.</p>
        <Button className="mt-6" onClick={onRetry}>
          Retry
        </Button>
      </Card>
    </main>
  );
}

export function AdminShowcaseDetailPage() {
  const { showcaseId } = useParams<{ showcaseId: string }>();
  const { data, isError, isLoading, refetch } = useQuery({
    queryKey: queryKeys.admin.showcase(showcaseId ?? ''),
    queryFn: () => (showcaseId ? cmsApi.showcases.get(showcaseId) : null),
    enabled: Boolean(showcaseId),
  });

  if (isLoading) return <LoadingState />;
  if (isError || !data?.showcase) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:flex">
      <ShowcaseDetailEditor showcase={data.showcase} />
    </div>
  );
}
