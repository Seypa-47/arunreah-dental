import { AdminPageHeading } from '@/components/layout/admin-workspace';
import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { AdminIcon } from '@/components/layout/admin-sidebar';
import { MediaUploader } from '@/components/admin/media-uploader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { AdminServiceDetailContent, BenefitPreview } from '@/services/admin-service-detail';
import type { AdminService } from '@/services/admin-services';
import { useAdminServiceDetailPageQuery } from './use-admin-service-detail-page';
import { cmsApi } from '@/services/cms';
import { invalidateCmsDomain } from '@/services/cms-cache';
import { getPublicMediaUrl } from '@/services/media';
import type { CreateServiceInput } from '@arunreah/shared';

type EditableService = AdminService & {
  aboutContent: string;
  aboutImageUrl: string;
  aboutTitle: string;
  anesthesia: string;
  benefits: BenefitPreview[];
  benefitsIntro: string;
  bottomCtaButton: string;
  bottomCtaDescription: string;
  bottomCtaTitle: string;
  canonicalUrl: string;
  duration: string;
  detailSections: CreateServiceInput['detailSections'];
  detailPresentation: 'STANDARD' | 'JOURNEY' | 'CARE_MENU' | 'CLINICAL_SCOPE' | 'IMAGING_GUIDE' | 'PROBLEM_TO_CARE' | 'FAMILY_CARE';
  editorialLabelEn: string;
  editorialLabelKm: string;
  editorialTitleEn: string;
  editorialTitleKm: string;
  heroHeading: string;
  heroImageUrl: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  heroSummary: string;
  longevity: string;
  metaDescription: string;
  metaTitle: string;
  recovery: string;
  relatedCategory: string;
  relatedServices: string[];
  slug: string;
};

type EditableDetailSection = CreateServiceInput['detailSections'][number];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(^-|-$)/g, '');

function AdminFooter({ footer }: { footer: AdminServiceDetailContent['footer'] }) {
  return (
    <footer className="mt-10 flex flex-wrap items-center justify-between gap-5 text-[12px] text-[#9badc5]">
      <p>{footer.copyright}</p>
      <div className="flex gap-6">
        <span className="inline-flex items-center gap-2">
          <AdminIcon className="size-3.5 text-[#2187a8]" name="shield" />
          {footer.sslLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <AdminIcon className="size-3.5 text-[#2187a8]" name="lock" />
          {footer.encryptionLabel}
        </span>
      </div>
    </footer>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="text-[12px] font-bold text-[#61738d]">{label}</span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-10 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[13px] font-medium text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
    />
  );
}

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <button
      aria-pressed={checked}
      className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8] ${
        checked ? 'bg-[#2187a8]' : 'bg-[#dce5ef]'
      }`}
      onClick={onChange}
      type="button"
    >
      <span className="sr-only">{label}</span>
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

function StatusSwitch({
  draftLabel,
  label,
  onChange,
  publishedLabel,
  status,
}: {
  draftLabel: string;
  label: string;
  onChange: (status: 'published' | 'draft') => void;
  publishedLabel: string;
  status: 'published' | 'draft' | 'archived';
}) {
  return (
    <div>
      <p className="text-[12px] font-bold text-[#61738d]">{label}</p>
      <div className="mt-1.5 grid h-10 grid-cols-2 rounded-xl border border-[#dce5ef] bg-white p-0.5 text-[12.5px] font-bold">
        <button
          aria-pressed={status === 'published'}
          className={`rounded-lg transition ${
            status === 'published' ? 'bg-[#2187a8] text-white shadow-sm' : 'text-[#71839e] hover:text-[#182238]'
          }`}
          onClick={() => onChange('published')}
          type="button"
        >
          {publishedLabel}
        </button>
        <button
          aria-pressed={status === 'draft'}
          className={`rounded-lg transition ${
            status === 'draft' ? 'bg-[#2187a8] text-white shadow-sm' : 'text-[#71839e] hover:text-[#182238]'
          }`}
          onClick={() => onChange('draft')}
          type="button"
        >
          {draftLabel}
        </button>
      </div>
    </div>
  );
}

function BasicInformation({
  content,
  service,
  setService,
}: {
  content: AdminServiceDetailContent;
  service: EditableService;
  setService: Dispatch<SetStateAction<EditableService>>;
}) {
  return (
    <Card className="rounded-[18px] border-[#dce5ef] p-6 shadow-none">
      <h2 className="text-[16px] font-bold text-[#182238]">{content.editor.basicTitle}</h2>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr_0.8fr]">
        <div className="grid gap-4 xl:col-span-2 sm:grid-cols-2">
          <Field label={`${content.editor.nameLabel} · English`}>
            <TextInput
              onChange={(event) =>
                setService((current) => ({
                  ...current,
                  heroHeading: `Restore Your Smile with ${event.target.value}`,
                  name: event.target.value,
                  slug: slugify(event.target.value),
                }))
              }
              value={service.name}
            />
          </Field>
          <Field label="ឈ្មោះសេវា · ខ្មែរ">
            <TextInput
              lang="km"
              onChange={(event) => setService((current) => ({ ...current, nameKm: event.target.value }))}
              value={service.nameKm}
            />
          </Field>
        </div>
        <Field label={content.editor.slugLabel}>
          <TextInput
            onChange={(event) => setService((current) => ({ ...current, slug: event.target.value }))}
            value={service.slug}
          />
        </Field>
        <StatusSwitch
          draftLabel={content.editor.statusDraftLabel}
          label={content.editor.statusLabel}
          onChange={(newStatus) => setService((current) => ({ ...current, status: newStatus }))}
          publishedLabel={content.editor.statusPublishedLabel}
          status={service.status}
        />
        <Field label={content.editor.categoryLabel}>
          <select
            className="h-10 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[13px] font-medium text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
            onChange={(event) =>
              setService((current) => ({
                ...current,
                category: event.target.value,
                relatedCategory: event.target.value,
              }))
            }
            value={service.category}
          >
            {content.editor.categoryOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>
        <div className="xl:col-start-3">
          <p className="text-[12px] font-bold text-[#61738d]">{content.editor.featuredLabel}</p>
          <div className="mt-2.5">
            <Toggle
              checked={service.featured}
              label={content.editor.featuredLabel}
              onChange={() => setService((current) => ({ ...current, featured: !current.featured }))}
            />
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_0.6fr]">
        <div className="grid gap-4 sm:grid-cols-2 xl:col-span-1">
          <Field label={`${content.editor.descriptionLabel} · English`}>
            <textarea
              className="h-[120px] w-full resize-none rounded-xl border border-[#dce5ef] bg-white px-3.5 py-2.5 text-[13px] font-medium leading-6 text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
              onChange={(event) => setService((current) => ({ ...current, description: event.target.value }))}
              value={service.description}
            />
          </Field>
          <Field label="ពិពណ៌នាខ្លី · ខ្មែរ">
            <textarea
              className="h-[120px] w-full resize-none rounded-xl border border-[#dce5ef] bg-white px-3.5 py-2.5 text-[13px] font-medium leading-6 text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
              lang="km"
              onChange={(event) => setService((current) => ({ ...current, descriptionKm: event.target.value }))}
              value={service.descriptionKm}
            />
          </Field>
        </div>
        <div>
          <p className="text-[12px] font-bold text-[#61738d]">{content.editor.imageLabel}</p>
          <div className="mt-1.5 flex items-center gap-4 rounded-xl border border-dashed border-[#d4e4ee] bg-[#fafbfd] p-3">
            <img
              alt={service.imageAlt}
              className="h-[96px] w-[114px] rounded-lg border border-[#e8eff5] object-cover"
              src={service.imageUrl}
            />
            <div>
              <Button
                className="h-8 rounded-lg border border-[#dce5ef] bg-white px-3 text-[11.5px] font-semibold text-[#182238] shadow-none hover:bg-[#f4f8fb]"
                type="button"
                variant="secondary"
              >
                <AdminIcon className="mr-1.5 size-3.5 text-[#2187a8]" name="upload" />
                {content.editor.imageUploadLabel}
              </Button>
              <p className="mt-2 text-[10.5px] font-medium text-[#8a9ab0]">{content.editor.imageHelp}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

const presentationOptions: { description: string; label: string; value: EditableService['detailPresentation'] }[] = [
  { value: 'STANDARD', label: 'Standard information', description: 'A flexible editorial page for a service overview and supporting details.' },
  { value: 'JOURNEY', label: 'Ordered treatment process', description: 'Use only when the content explains genuine clinical stages in sequence.' },
  { value: 'CARE_MENU', label: 'Services included', description: 'For a group of related care options rather than a step-by-step treatment.' },
  { value: 'CLINICAL_SCOPE', label: 'Clinical scope', description: 'For specialist care, procedures, and the conditions the team can address.' },
  { value: 'IMAGING_GUIDE', label: 'Diagnostic guide', description: 'For imaging, technology, or educational information that is not a treatment process.' },
  { value: 'PROBLEM_TO_CARE', label: 'Problem to care', description: 'For condition-focused services that explain the problem, care, and expected visit.' },
  { value: 'FAMILY_CARE', label: 'Family care', description: 'For age-specific or family-oriented services and preventive care.' },
];

function PagePresentation({ service, setService }: { service: EditableService; setService: Dispatch<SetStateAction<EditableService>> }) {
  const selected = presentationOptions.find((option) => option.value === service.detailPresentation);
  return (
    <Card className="mt-4 rounded-[18px] border-[#dce5ef] p-6 shadow-none">
      <div>
        <h2 className="text-[16px] font-bold text-[#182238]">Page presentation</h2>
        <p className="mt-1 text-[13px] leading-6 text-[#71839e]">Choose the reading pattern that best fits this service. It does not change the content you have entered.</p>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Field label="Content pattern">
          <select
            aria-describedby="presentation-help"
            className="h-10 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[13px] font-medium text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
            onChange={(event) => setService((current) => ({ ...current, detailPresentation: event.target.value as EditableService['detailPresentation'] }))}
            value={service.detailPresentation}
          >
            {presentationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <p className="mt-2 text-[12px] leading-5 text-[#71839e]" id="presentation-help">{selected?.description}</p>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Editorial label · English">
            <TextInput onChange={(event) => setService((current) => ({ ...current, editorialLabelEn: event.target.value }))} value={service.editorialLabelEn} />
          </Field>
          <Field label="ស្លាកអត្ថបទ · ខ្មែរ">
            <TextInput lang="km" onChange={(event) => setService((current) => ({ ...current, editorialLabelKm: event.target.value }))} value={service.editorialLabelKm} />
          </Field>
          <Field label="Editorial title · English">
            <TextInput onChange={(event) => setService((current) => ({ ...current, editorialTitleEn: event.target.value }))} value={service.editorialTitleEn} />
          </Field>
          <Field label="ចំណងជើងអត្ថបទ · ខ្មែរ">
            <TextInput lang="km" onChange={(event) => setService((current) => ({ ...current, editorialTitleKm: event.target.value }))} value={service.editorialTitleKm} />
          </Field>
        </div>
      </div>
    </Card>
  );
}

function sectionLanguageState(section: EditableDetailSection) {
  const english = Boolean(section.headingEn?.trim() || section.bodyEn?.trim());
  const khmer = Boolean(section.headingKm?.trim() || section.bodyKm?.trim());
  return english && khmer ? 'English + Khmer ready' : english ? 'Khmer content needed' : khmer ? 'English content needed' : 'Content needed';
}

function DetailSectionsEditor({ service, setService }: { service: EditableService; setService: Dispatch<SetStateAction<EditableService>> }) {
  const [openIndex, setOpenIndex] = useState<number | undefined>();
  const imageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    service.detailSections.forEach((section) => {
      if (section.imageKey) counts.set(section.imageKey, (counts.get(section.imageKey) ?? 0) + 1);
    });
    return counts;
  }, [service.detailSections]);
  const updateSection = (index: number, patch: Partial<EditableDetailSection>) =>
    setService((current) => ({
      ...current,
      detailSections: current.detailSections.map((section, sectionIndex) => sectionIndex === index ? { ...section, ...patch } : section),
    }));
  const moveSection = (from: number, direction: -1 | 1) => {
    const to = from + direction;
    if (to < 0 || to >= service.detailSections.length) return;
    setService((current) => {
      const sections = [...current.detailSections];
      const source = sections[from];
      const destination = sections[to];
      if (!source || !destination) return current;
      [sections[from], sections[to]] = [destination, source];
      return { ...current, detailSections: sections.map((section, index) => ({ ...section, displayOrder: index })) };
    });
    setOpenIndex(to);
  };
  const addSection = () => {
    setService((current) => ({
      ...current,
      detailSections: [...current.detailSections, { sectionType: 'TEXT', headingEn: null, headingKm: null, bodyEn: null, bodyKm: null, imageKey: null, displayOrder: current.detailSections.length }],
    }));
    setOpenIndex(service.detailSections.length);
  };

  return (
    <Card className="mt-4 rounded-[18px] border-[#dce5ef] p-6 shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-[#182238]">Detail sections</h2>
          <p className="mt-1 text-[13px] leading-6 text-[#71839e]">Build the flexible content blocks for this service. Use the order controls to define how they appear on the page.</p>
        </div>
        <Button className="shrink-0" onClick={addSection} type="button" variant="secondary">Add section</Button>
      </div>
      {service.detailSections.length ? (
        <ol className="mt-5 space-y-3" aria-label="Ordered service detail sections">
          {service.detailSections.map((section, index) => {
            const isOpen = openIndex === index;
            const imageUrl = section.imageKey ? getPublicMediaUrl(section.imageKey) : null;
            const repeatedImage = section.imageKey && (imageCounts.get(section.imageKey) ?? 0) > 1;
            return (
              <li className="overflow-hidden rounded-xl border border-[#dce5ef]" key={`${section.displayOrder}-${index}`}>
                <div className="flex flex-wrap items-center gap-3 bg-[#fbfdfe] p-3 sm:flex-nowrap">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#edf7fb] text-[12px] font-bold text-[#167ea7]">{index + 1}</span>
                  {imageUrl ? <img alt="Selected section media" className="size-11 shrink-0 rounded-lg border border-[#dce5ef] object-cover" src={imageUrl} /> : <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-dashed border-[#dce5ef] text-[11px] text-[#71839e]">No image</span>}
                  <button aria-expanded={isOpen} className="min-w-0 flex-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8]" onClick={() => setOpenIndex((current) => current === index ? undefined : index)} type="button">
                    <span className="block truncate text-[14px] font-bold text-[#182238]">{section.headingEn?.trim() || section.headingKm?.trim() || 'Untitled section'}</span>
                    <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[#71839e]"><span>{section.sectionType === 'IMAGE' ? 'Image-led section' : 'Text section'}</span><span>{sectionLanguageState(section)}</span></span>
                  </button>
                  <div className="flex shrink-0 items-center gap-1" aria-label={`Section ${index + 1} ordering controls`}>
                    <Button aria-label={`Move section ${index + 1} earlier`} className="min-h-9 px-3 py-1" disabled={index === 0} onClick={() => moveSection(index, -1)} type="button" variant="secondary">↑</Button>
                    <Button aria-label={`Move section ${index + 1} later`} className="min-h-9 px-3 py-1" disabled={index === service.detailSections.length - 1} onClick={() => moveSection(index, 1)} type="button" variant="secondary">↓</Button>
                  </div>
                </div>
                {isOpen ? (
                  <div className="border-t border-[#dce5ef] p-4 sm:p-5">
                    <div className="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
                      <Field label="Section type">
                        <select className="h-10 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-[13px]" onChange={(event) => updateSection(index, { sectionType: event.target.value as EditableDetailSection['sectionType'] })} value={section.sectionType}>
                          <option value="TEXT">Text section</option>
                          <option value="IMAGE">Image-led section</option>
                        </select>
                      </Field>
                      <div className="rounded-lg bg-[#f4f8fa] px-3 py-2 text-[12px] leading-5 text-[#52647d]">{section.sectionType === 'IMAGE' ? 'Use the image to support this content; headings and copy remain available for context.' : 'An image is optional. Leave it empty when text communicates the information better.'}</div>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Field label="Heading · English"><TextInput onChange={(event) => updateSection(index, { headingEn: event.target.value || null })} value={section.headingEn ?? ''} /></Field>
                      <Field label="ចំណងជើង · ខ្មែរ"><TextInput lang="km" onChange={(event) => updateSection(index, { headingKm: event.target.value || null })} value={section.headingKm ?? ''} /></Field>
                      <Field label="Body · English"><textarea className="h-32 w-full rounded-xl border border-[#dce5ef] px-3 py-2 text-[13px]" onChange={(event) => updateSection(index, { bodyEn: event.target.value || null })} value={section.bodyEn ?? ''} /></Field>
                      <Field label="ខ្លឹមសារ · ខ្មែរ"><textarea className="h-32 w-full rounded-xl border border-[#dce5ef] px-3 py-2 text-[13px]" lang="km" onChange={(event) => updateSection(index, { bodyKm: event.target.value || null })} value={section.bodyKm ?? ''} /></Field>
                    </div>
                    <div className="mt-4"><MediaUploader category="services" help="Optional. Add one image only when it helps patients understand this section." label="Section image" onClear={() => updateSection(index, { imageKey: null })} onUploaded={(imageKey) => updateSection(index, { imageKey })} value={section.imageKey ?? undefined} /></div>
                    {repeatedImage ? <p className="mt-3 rounded-lg border border-[#f0c36d] bg-[#fff8e8] px-3 py-2 text-[12px] leading-5 text-[#7a4900]" role="status">This image is also used in another detail section. That can be intentional, but consider using a different image if the sections cover different topics.</p> : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : <p className="mt-5 rounded-xl border border-dashed border-[#dce5ef] p-4 text-[13px] leading-6 text-[#71839e]">No detail sections yet. Add a text or image-led section when this service needs supporting information.</p>}
    </Card>
  );
}

function SectionRows({
  sections,
  service,
  setService,
}: {
  sections: AdminServiceDetailContent['editor']['sections'];
  service: EditableService;
  setService: Dispatch<SetStateAction<EditableService>>;
}) {
  const [open, setOpen] = useState<string | undefined>();

  return (
    <div className="mt-4 space-y-2.5">
      {sections.map((section) => {
        const isOpen = open === section.title;

        return (
          <Card className="rounded-[16px] border-[#dce5ef] shadow-none" key={section.title}>
            <button
              aria-expanded={isOpen}
              className="flex min-h-[54px] w-full items-center justify-between gap-4 px-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8]"
              onClick={() => setOpen((current) => (current === section.title ? undefined : section.title))}
              type="button"
            >
              <span className="text-[15px] font-bold text-[#182238]">{section.title}</span>
              <span className="hidden text-[12px] font-normal text-[#8a9ab0] md:block">{section.description}</span>
              <AdminIcon
                className={`size-4 shrink-0 text-[#61738d] transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                name="chevronDown"
              />
            </button>

            {isOpen ? (
              <div className="border-t border-[#e1e8f0] bg-[#fafbfd] px-6 py-5">
                {section.title.includes('2. Hero Section') ? (
                  <div className="space-y-4">
                    <Field label="Hero Heading">
                      <TextInput
                        onChange={(e) => setService((c) => ({ ...c, heroHeading: e.target.value }))}
                        value={service.heroHeading}
                      />
                    </Field>
                    <Field label="Hero Summary">
                      <textarea
                        className="h-20 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 py-2.5 text-[13px] font-medium leading-relaxed text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                        onChange={(e) => setService((c) => ({ ...c, heroSummary: e.target.value }))}
                        value={service.heroSummary}
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Primary CTA Button">
                        <TextInput
                          onChange={(e) => setService((c) => ({ ...c, heroPrimaryCta: e.target.value }))}
                          value={service.heroPrimaryCta}
                        />
                      </Field>
                      <Field label="Secondary CTA Button">
                        <TextInput
                          onChange={(e) => setService((c) => ({ ...c, heroSecondaryCta: e.target.value }))}
                          value={service.heroSecondaryCta}
                        />
                      </Field>
                    </div>
                  </div>
                ) : section.title.includes('2a. Page Presentation') ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Page presentation">
                      <select
                        className="h-10 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[13px] font-medium text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                        onChange={(e) => setService((c) => ({ ...c, detailPresentation: e.target.value as EditableService['detailPresentation'] }))}
                        value={service.detailPresentation}
                      >
                        <option value="STANDARD">Standard information</option>
                        <option value="JOURNEY">Multi-stage treatment</option>
                        <option value="CARE_MENU">Care menu</option>
                        <option value="CLINICAL_SCOPE">Clinical scope</option>
                        <option value="IMAGING_GUIDE">Imaging guide</option>
                        <option value="PROBLEM_TO_CARE">Problem to care</option>
                        <option value="FAMILY_CARE">Family care</option>
                      </select>
                    </Field>
                    <div className="hidden sm:block" aria-hidden="true" />
                    <Field label="Guide label (English)">
                      <TextInput onChange={(e) => setService((c) => ({ ...c, editorialLabelEn: e.target.value }))} value={service.editorialLabelEn} />
                    </Field>
                    <Field label="Guide label (Khmer)">
                      <TextInput onChange={(e) => setService((c) => ({ ...c, editorialLabelKm: e.target.value }))} value={service.editorialLabelKm} />
                    </Field>
                    <Field label="Guide title (English)">
                      <TextInput onChange={(e) => setService((c) => ({ ...c, editorialTitleEn: e.target.value }))} value={service.editorialTitleEn} />
                    </Field>
                    <Field label="Guide title (Khmer)">
                      <TextInput onChange={(e) => setService((c) => ({ ...c, editorialTitleKm: e.target.value }))} value={service.editorialTitleKm} />
                    </Field>
                    <p className="sm:col-span-2 text-[12px] leading-5 text-[#71839e]">Select the presentation that matches the content. Use a multi-stage treatment only for genuinely ordered clinical stages.</p>
                  </div>
                ) : section.title.includes('3. About Section') ? (
                  <div className="space-y-4">
                    <Field label="About Heading">
                      <TextInput
                        onChange={(e) => setService((c) => ({ ...c, aboutTitle: e.target.value }))}
                        value={service.aboutTitle}
                      />
                    </Field>
                    <Field label="About Content">
                      <textarea
                        className="h-24 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 py-2.5 text-[13px] font-medium leading-relaxed text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                        onChange={(e) => setService((c) => ({ ...c, aboutContent: e.target.value }))}
                        value={service.aboutContent}
                      />
                    </Field>
                  </div>
                ) : section.title.includes('4. Treatment at a Glance') ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Procedure Duration">
                      <TextInput
                        onChange={(e) => setService((c) => ({ ...c, duration: e.target.value }))}
                        value={service.duration}
                      />
                    </Field>
                    <Field label="Recovery Time">
                      <TextInput
                        onChange={(e) => setService((c) => ({ ...c, recovery: e.target.value }))}
                        value={service.recovery}
                      />
                    </Field>
                    <Field label="Anesthesia Type">
                      <TextInput
                        onChange={(e) => setService((c) => ({ ...c, anesthesia: e.target.value }))}
                        value={service.anesthesia}
                      />
                    </Field>
                    <Field label="Expected Longevity">
                      <TextInput
                        onChange={(e) => setService((c) => ({ ...c, longevity: e.target.value }))}
                        value={service.longevity}
                      />
                    </Field>
                  </div>
                ) : section.title.includes('5. Benefits Section') ? (
                  <div className="space-y-4">
                    <Field label="Benefits Intro Text">
                      <TextInput
                        onChange={(e) => setService((c) => ({ ...c, benefitsIntro: e.target.value }))}
                        value={service.benefitsIntro}
                      />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {service.benefits.map((b, idx) => (
                        <Field key={b.icon} label={`Benefit #${idx + 1}`}>
                          <TextInput
                            onChange={(e) => {
                              const newBenefits = [...service.benefits];
                              newBenefits[idx] = { ...b, title: e.target.value };
                              setService((c) => ({ ...c, benefits: newBenefits }));
                            }}
                            value={b.title}
                          />
                        </Field>
                      ))}
                    </div>
                  </div>
                ) : section.title.includes('6. Related Services') ? (
                  <div className="space-y-3">
                    <p className="text-[12px] font-bold text-[#61738d]">Select related services to recommend:</p>
                    <div className="flex flex-wrap gap-2">
                      {['Teeth Whitening', 'Routine Cleaning', 'Orthodontics', 'Porcelain Veneers', 'Root Canal Therapy'].map(
                        (rel) => {
                          const isSelected = service.relatedServices.includes(rel);
                          return (
                            <button
                              className={`rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition ${
                                isSelected
                                  ? 'border-[#2187a8] bg-[#eef8fb] text-[#2187a8]'
                                  : 'border-[#dce5ef] bg-white text-[#71839e] hover:bg-[#f4f8fb]'
                              }`}
                              key={rel}
                              onClick={() => {
                                setService((c) => ({
                                  ...c,
                                  relatedServices: isSelected
                                    ? c.relatedServices.filter((s) => s !== rel)
                                    : [...c.relatedServices, rel],
                                }));
                              }}
                              type="button"
                            >
                              {isSelected ? '✓ ' : '+ '}
                              {rel}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>
                ) : section.title.includes('7. Bottom CTA Section') ? (
                  <div className="space-y-4">
                    <Field label="CTA Heading">
                      <TextInput
                        onChange={(e) => setService((c) => ({ ...c, bottomCtaTitle: e.target.value }))}
                        value={service.bottomCtaTitle}
                      />
                    </Field>
                    <Field label="CTA Description">
                      <textarea
                        className="h-20 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 py-2.5 text-[13px] font-medium leading-relaxed text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                        onChange={(e) => setService((c) => ({ ...c, bottomCtaDescription: e.target.value }))}
                        value={service.bottomCtaDescription}
                      />
                    </Field>
                    <Field label="Button Text">
                      <TextInput
                        onChange={(e) => setService((c) => ({ ...c, bottomCtaButton: e.target.value }))}
                        value={service.bottomCtaButton}
                      />
                    </Field>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Field label="Meta Title">
                      <TextInput
                        onChange={(e) => setService((c) => ({ ...c, metaTitle: e.target.value }))}
                        value={service.metaTitle}
                      />
                    </Field>
                    <Field label="Meta Description">
                      <textarea
                        className="h-20 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 py-2.5 text-[13px] font-medium leading-relaxed text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                        onChange={(e) => setService((c) => ({ ...c, metaDescription: e.target.value }))}
                        value={service.metaDescription}
                      />
                    </Field>
                    <Field label="Canonical URL">
                      <TextInput
                        onChange={(e) => setService((c) => ({ ...c, canonicalUrl: e.target.value }))}
                        value={service.canonicalUrl}
                      />
                    </Field>
                  </div>
                )}
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}

function LivePreview({ content, service }: { content: AdminServiceDetailContent; service: EditableService }) {
  return (
    <Card className="rounded-[18px] border-[#dce5ef] p-5 shadow-none">
      <h2 className="text-[16px] font-bold text-[#182238]">Live Page Preview</h2>
      <div className="mt-3.5 rounded-xl border border-[#dce5ef] bg-white p-3.5 shadow-sm">
        {/* Hero Section Preview */}
        <span className="inline-block rounded bg-[#eef8fb] px-2 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider text-[#2187a8]">
          {service.slug.replaceAll('-', ' ').toUpperCase()}
        </span>
        <div className="mt-2.5 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] font-extrabold leading-tight text-[#005687]">
              {service.heroHeading || `${content.preview.titlePrefix} ${service.name}`}
            </h3>
            <p className="mt-2 line-clamp-3 text-[10.5px] leading-relaxed text-[#71839e]">
              {service.heroSummary || service.description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="rounded-md bg-[#2187a8] px-2.5 py-1 text-[8.5px] font-bold text-white shadow-none">
                {service.heroPrimaryCta || 'Book an Appointment'}
              </span>
              <span className="rounded-md border border-[#dce5ef] bg-white px-2.5 py-1 text-[8.5px] font-bold text-[#2187a8]">
                {service.heroSecondaryCta || content.preview.requestLabel}
              </span>
            </div>
          </div>
          <img
            alt="Patient smiling"
            className="h-[105px] w-[130px] shrink-0 rounded-xl object-cover"
            src={service.heroImageUrl}
          />
        </div>

        {/* About Section Preview */}
        <div className="mt-3.5 border-t border-[#edf2f7] pt-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h4 className="text-[12px] font-extrabold text-[#005687]">
                {service.aboutTitle || `${content.preview.aboutTitle} ${service.name}`}
              </h4>
              <p className="mt-1 text-[9.5px] leading-relaxed text-[#71839e]">
                {service.aboutContent || content.preview.aboutDescription}
              </p>
            </div>
            <img
              alt="Dental implant treatment"
              className="h-[60px] w-[105px] shrink-0 rounded-lg object-cover"
              src={service.aboutImageUrl}
            />
          </div>

          {/* Benefits Grid */}
          <div className="mt-3 grid grid-cols-6 gap-1 border-t border-[#edf2f7] pt-2.5">
            {service.benefits.map((benefit) => (
              <div className="flex flex-col items-center text-center" key={benefit.title}>
                <span className="grid size-6 place-items-center rounded-md bg-[#eef8fb] text-[#2187a8]">
                  <AdminIcon className="size-3.5" name={benefit.icon} />
                </span>
                <p className="mt-1 text-[7.5px] font-bold leading-tight text-[#005687]">{benefit.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function PublishingCard({ content, service }: { content: AdminServiceDetailContent; service: EditableService }) {
  return (
    <Card className="rounded-[18px] border-[#dce5ef] p-5 shadow-none">
      <h2 className="text-[15px] font-bold text-[#182238]">{content.publishing.title}</h2>
      <dl className="mt-4 space-y-3 text-[12.5px]">
        <div className="flex items-center justify-between gap-4">
          <dt className="font-semibold text-[#71839e]">{content.publishing.statusLabel}</dt>
          <dd>
            <span
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                service.status === 'published'
                  ? 'border-[#b9f1d0] bg-[#effdf5] text-[#13ad63]'
                  : 'border-[#fde8b2] bg-[#fff8e8] text-[#e58900]'
              }`}
            >
              {service.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="font-semibold text-[#71839e]">{content.publishing.lastUpdatedLabel}</dt>
          <dd className="text-right font-medium text-[#182238]">{content.publishing.lastUpdatedValue}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="font-semibold text-[#71839e]">{content.publishing.updatedByLabel}</dt>
          <dd className="font-medium text-[#182238]">{content.publishing.updatedByValue}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="font-semibold text-[#71839e]">{content.publishing.publishedLabel}</dt>
          <dd className="text-right font-medium text-[#182238]">{content.publishing.publishedOnLabel}</dd>
        </div>
      </dl>
    </Card>
  );
}

function OrderingCard({
  content,
  service,
  setService,
}: {
  content: AdminServiceDetailContent;
  service: EditableService;
  setService: Dispatch<SetStateAction<EditableService>>;
}) {
  return (
    <Card className="rounded-[18px] border-[#dce5ef] p-5 shadow-none">
      <h2 className="text-[15px] font-bold text-[#182238]">{content.ordering.title}</h2>
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[12.5px] font-semibold text-[#71839e]">{content.ordering.showLabel}</span>
            <Toggle
              checked={service.displayOnHomepage}
              label={content.ordering.showLabel}
              onChange={() =>
                setService((current) => ({ ...current, displayOnHomepage: !current.displayOnHomepage }))
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] font-semibold text-[#71839e]">{content.ordering.sortLabel}</span>
            <input
              className="h-9 w-14 rounded-lg border border-[#dce5ef] bg-white text-center text-[13px] font-bold text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
              min={1}
              onChange={(event) =>
                setService((current) => ({ ...current, order: Number(event.target.value) || 1 }))
              }
              type="number"
              value={service.order}
            />
          </div>
        </div>
        <div>
          <span className="block text-[12px] font-bold text-[#61738d]">{content.ordering.categoryLabel}</span>
          <select
            className="mt-1.5 h-10 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[13px] font-medium text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
            onChange={(event) => setService((current) => ({ ...current, relatedCategory: event.target.value }))}
            value={service.relatedCategory}
          >
            {content.ordering.categoryOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
}

function ChecklistCard({ checklist }: { checklist: AdminServiceDetailContent['checklist'] }) {
  return (
    <Card className="rounded-[18px] border-[#dce5ef] p-5 shadow-none">
      <h2 className="text-[15px] font-bold text-[#182238]">{checklist.title}</h2>
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div className="space-y-2.5">
          {checklist.column1.map((item) => (
            <span className="flex items-center gap-2.5 text-[12px] font-medium text-[#52647d]" key={item}>
              <span className="grid size-4 place-items-center rounded-full border border-[#85dcb0] bg-[#edfbf3] text-[#13ad63]">
                <AdminIcon className="size-2.5" name="check" />
              </span>
              {item}
            </span>
          ))}
        </div>
        <div className="space-y-2.5">
          {checklist.column2.map((item) => (
            <span className="flex items-center gap-2.5 text-[12px] font-medium text-[#52647d]" key={item}>
              <span className="grid size-4 place-items-center rounded-full border border-[#85dcb0] bg-[#edfbf3] text-[#13ad63]">
                <AdminIcon className="size-2.5" name="check" />
              </span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

function ServiceDetailEditor({ content }: { content: AdminServiceDetailContent & { service: AdminService } }) {
  const queryClient = useQueryClient();
  const [service, setService] = useState<EditableService>(() => ({
    ...content.service,
    aboutContent: content.preview.aboutDescription,
    aboutImageUrl: content.preview.aboutImageUrl,
    aboutTitle: content.preview.aboutTitle,
    anesthesia: 'Local Anesthesia / Sedation',
    benefits: content.preview.benefits,
    benefitsIntro: `Why choose ${content.service.name} at Arunreah Dental Clinic`,
    bottomCtaButton: 'Book Consultation',
    bottomCtaDescription: 'Schedule a personalized consultation with our experienced dental team today.',
    bottomCtaTitle: `Ready to Restore Your Smile with ${content.service.name}?`,
    canonicalUrl: `/services/${content.service.id}`,
    duration: '1 - 2 Hours',
    detailSections: content.service.detailSections,
    detailPresentation: content.service.detailPresentation,
    editorialLabelEn: content.service.editorialLabelEn,
    editorialLabelKm: content.service.editorialLabelKm,
    editorialTitleEn: content.service.editorialTitleEn,
    editorialTitleKm: content.service.editorialTitleKm,
    heroHeading: `${content.preview.titlePrefix} ${content.service.name}`,
    heroImageUrl: content.preview.heroImageUrl,
    heroPrimaryCta: 'Book an Appointment',
    heroSecondaryCta: content.preview.requestLabel,
    heroSummary: content.service.description,
    longevity: 'Permanent / Long-Term',
    metaDescription: content.service.description,
    metaTitle: `${content.service.name} in Phnom Penh | Arunreah Dental Clinic`,
    recovery: '3 - 6 Months',
    relatedCategory: content.service.category,
    relatedServices: ['Teeth Whitening', 'Routine Cleaning', 'Orthodontics'],
    slug: content.service.id,
  }));

  const [notification, setNotification] = useState<string | undefined>();
  const saveMutation = useMutation({
    mutationFn: (status: 'DRAFT' | 'PUBLISHED') => cmsApi.services.update(content.service.id, {
      status, slug: service.slug, nameEn: service.name, nameKm: service.nameKm, category: service.category || null, summaryEn: service.description || null, summaryKm: service.descriptionKm || null,
      descriptionEn: service.heroSummary || null, imageKey: service.imageUrl || null, featured: service.featured,
      heroTitleEn: service.heroHeading || null, heroSummaryEn: service.heroSummary || null, heroImageKey: service.heroImageUrl || null,
      aboutTitleEn: service.aboutTitle || null, aboutBodyEn: service.aboutContent || null, aboutImageKey: service.aboutImageUrl || null,
      editorialLabelEn: service.editorialLabelEn || null, editorialLabelKm: service.editorialLabelKm || null,
      editorialTitleEn: service.editorialTitleEn || null, editorialTitleKm: service.editorialTitleKm || null,
      detailPresentation: service.detailPresentation,
      detailSections: service.detailSections,
      metaTitleEn: service.metaTitle || null, metaDescriptionEn: service.metaDescription || null,
    }),
    onSuccess: async () => { await invalidateCmsDomain(queryClient, 'services'); },
    onError: () => showNotification('Unable to save this service. Please check the fields and try again.'),
  });
  const previewHref = useMemo(() => `/services/${service.slug}`, [service.slug]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(undefined);
    }, 4000);
  };

  const handleSaveDraft = () => {
    setService((current) => ({ ...current, status: 'draft' }));
    saveMutation.mutate('DRAFT', { onSuccess: () => showNotification('Service draft saved successfully.') });
  };

  const handleUpdateService = () => {
    setService((current) => ({ ...current, status: 'published' }));
    saveMutation.mutate('PUBLISHED', { onSuccess: () => showNotification('Service updated and published successfully.') });
  };

  return (
    <main className="min-w-0 flex-1 bg-[#f6f8fb] px-5 py-7 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1440px] w-full">
      {notification ? (
        <div
          aria-live="polite"
          className="mb-5 flex items-center justify-between rounded-xl border border-[#b9f1d0] bg-[#effdf5] px-4 py-3 text-[13px] font-semibold text-[#13ad63]"
        >
          <span className="inline-flex items-center gap-2">
            <AdminIcon className="size-4" name="check" />
            {notification}
          </span>
          <button
            aria-label="Dismiss notification"
            className="text-[#13ad63] hover:text-[#0b7944]"
            onClick={() => setNotification(undefined)}
            type="button"
          >
            ✕
          </button>
        </div>
      ) : null}

      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>

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
            {content.controls.previewLabel}
          </Button>
          <Button
            className="h-9.5 rounded-xl border border-[#dce5ef] bg-white px-4 text-[12.5px] font-semibold text-[#2187a8] shadow-none hover:bg-[#f4f8fb]"
            onClick={handleSaveDraft}
            type="button"
            variant="secondary"
          >
            {content.controls.saveDraftLabel}
          </Button>
          <Button
            className="h-9.5 rounded-xl bg-[#2187a8] px-4.5 text-[12.5px] font-bold text-white hover:bg-[#1a718c]"
            onClick={handleUpdateService}
            type="button"
          >
            {content.controls.updateLabel}
          </Button>
        </div>
      </header>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_480px] 2xl:grid-cols-[minmax(0,1.2fr)_510px]">
        <section aria-label="Service editor">
          <BasicInformation content={content} service={service} setService={setService} />
          <PagePresentation service={service} setService={setService} />
          <DetailSectionsEditor service={service} setService={setService} />
          <SectionRows
            sections={content.editor.sections.filter((section) => !section.title.includes('2a. Page Presentation'))}
            service={service}
            setService={setService}
          />
        </section>
        <aside className="space-y-4">
          <LivePreview content={content} service={service} />
          <PublishingCard content={content} service={service} />
          <OrderingCard content={content} service={service} setService={setService} />
          <ChecklistCard checklist={content.checklist} />
        </aside>
      </div>

      <AdminFooter footer={content.footer} />
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:flex">
      <main aria-busy="true" aria-label="Loading service editor" className="min-h-screen flex-1 p-7 lg:p-10">
        <div className="h-8 w-64 animate-pulse rounded bg-[#e7edf3]" />
        <div className="mt-8 grid gap-6 2xl:grid-cols-[1fr_510px]">
          <div className="h-[520px] animate-pulse rounded-[18px] bg-white" />
          <div className="h-[720px] animate-pulse rounded-[18px] bg-white" />
        </div>
      </main>
    </div>
  );
}

function EmptyState({ content }: { content: AdminServiceDetailContent }) {
  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:flex">

      <main className="grid min-h-screen flex-1 place-items-center p-6">
        <Card className="max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-[#182238]">{content.empty.title}</h1>
          <p className="mt-3 text-[#71839e]">{content.empty.description}</p>
          <Link
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#2187a8] px-5 text-sm font-bold text-white"
            to="/admin/services"
          >
            Back to Services
          </Link>
        </Card>
      </main>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8fb] p-6">
      <Card className="max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold text-[#182238]">Service editor is unavailable</h1>
        <p className="mt-3 text-[#71839e]">Please refresh and try again.</p>
        <Button className="mt-6" onClick={onRetry}>
          Retry
        </Button>
      </Card>
    </main>
  );
}

export function AdminServiceDetailPage() {
  const { serviceId } = useParams();
  const { data, isError, isLoading, refetch } = useAdminServiceDetailPageQuery(serviceId);

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState onRetry={() => void refetch()} />;
  if (!data.service) return <EmptyState content={data} />;

  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:flex">

      <ServiceDetailEditor content={{ ...data, service: data.service }} />
    </div>
  );
}
