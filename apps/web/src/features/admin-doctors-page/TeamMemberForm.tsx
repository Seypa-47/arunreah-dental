import {
  createDoctorSchema,
  responsibilityIconValues,
  teamCategoryValues,
  updateDoctorSchema,
  type ProfileItemKind,
  type ResponsibilityIcon,
  type TeamCategory,
  type TeamProfileItemInput,
} from '@arunreah/shared';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AdminBilingualFields, AdminField, AdminFormActions, AdminFormSection, focusFirstInvalid } from '@/components/admin/admin-form';
import { AdminFeedback } from '@/components/admin/admin-feedback';
import { AdminToggle } from '@/components/admin/admin-toggle';
import { imageFrames } from '@/components/admin/image-frames';
import { MediaUploader } from '@/components/admin/media-uploader';
import { Button } from '@/components/ui/button';
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard';
import type { AdminDoctor } from '@/services/admin-doctors';
import { cmsApi } from '@/services/cms';
import { getPublicMediaUrl } from '@/services/media';
import { sanitizeDoctorCreatePayload, sanitizeDoctorUpdatePayload, sanitizeSlug } from './doctor-payload';

const categoryLabels: Record<TeamCategory, string> = {
  DENTIST: 'Dentist',
  GENERAL_PRACTITIONER: 'General Practitioner',
  RECEPTIONIST: 'Receptionist',
  ASSISTANT: 'Assistant',
};

const inputClass = 'mt-1.5 w-full';

function ResponsibilityGlyph({ icon }: { icon: ResponsibilityIcon }) {
  return <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
    {icon === 'appointments' ? <><rect height="16" rx="2" width="18" x="3" y="5" /><path d="M3 10h18M8 3v4M16 3v4" /></> : null}
    {icon === 'welcome' ? <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" /></> : null}
    {icon === 'enquiries' ? <><path d="M20.5 12a8 8 0 0 1-8 8H8l-4 3v-5.4A8 8 0 1 1 20.5 12Z" /><path d="M10.3 9.6a2.1 2.1 0 0 1 3.9.8c0 1.4-1.9 1.6-1.9 2.9M12.3 16.1h.01" /></> : null}
    {icon === 'communication' ? <path d="M6.6 3.5h2.9l1.5 3.9-2 1.5a12 12 0 0 0 6.1 6.1l1.5-2 3.9 1.5v2.9a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" /> : null}
    {icon === 'support' ? <><circle cx="9" cy="8" r="3.2" /><path d="M3 19c0-3 2.7-5.4 6-5.4s6 2.4 6 5.4M16 5.3a3.2 3.2 0 0 1 0 6.1M18.2 13.9c1.9.9 3.2 2.7 3.2 5.1" /></> : null}
    {icon === 'equipment' ? <><rect height="12" rx="2" width="18" x="3" y="8" /><path d="M8.5 8V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2M12 11.5v5M9.5 14h5" /></> : null}
    {icon === 'comfort' ? <path d="M12 20s-7-4.6-7-9.3A4 4 0 0 1 12 8.2 4 4 0 0 1 19 10.7C19 15.4 12 20 12 20Z" /> : null}
    {icon === 'hygiene' ? <><path d="M12 3 4.5 6v6c0 4.4 3.1 7.6 7.5 9 4.4-1.4 7.5-4.6 7.5-9V6L12 3Z" /><path d="m9 12 2.2 2.2L15.5 10" /></> : null}
    {icon === 'records' ? <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5M8.5 13h7M8.5 16.5h4.5" /></> : null}
  </svg>;
}

function ProfileItemRepeater({ errors, items, kind, label, onChange }: {
  errors: Record<string, string>;
  items: TeamProfileItemInput[];
  kind: ProfileItemKind;
  label: string;
  onChange: (items: TeamProfileItemInput[]) => void;
}) {
  const kindItems = items.filter((item) => item.kind === kind);
  const replaceKind = (next: TeamProfileItemInput[]) => onChange([
    ...items.filter((item) => item.kind !== kind),
    ...next.map((item, displayOrder) => ({ ...item, displayOrder })),
  ]);
  const update = (index: number, patch: Partial<TeamProfileItemInput>) => replaceKind(kindItems.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= kindItems.length) return;
    const next = [...kindItems];
    [next[index], next[target]] = [next[target]!, next[index]!];
    replaceKind(next);
  };
  const globalIndexFor = (item: TeamProfileItemInput) => items.indexOf(item);

  return <div className="space-y-4">
    {kindItems.map((item, index) => {
      const globalIndex = globalIndexFor(item);
      const prefix = `profileItems.${globalIndex}`;
      return <div className="rounded-xl border border-[#dce5ef] bg-[#fbfdff] p-4" key={`${kind}-${index}`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold text-[#183247]">{label} {index + 1}</p>
          <div className="flex gap-2">
            <Button aria-label={`Move ${label} ${index + 1} up`} disabled={index === 0} onClick={() => move(index, -1)} type="button" variant="secondary">↑</Button>
            <Button aria-label={`Move ${label} ${index + 1} down`} disabled={index === kindItems.length - 1} onClick={() => move(index, 1)} type="button" variant="secondary">↓</Button>
            <Button onClick={() => replaceKind(kindItems.filter((_, itemIndex) => itemIndex !== index))} type="button" variant="ghost">Remove</Button>
          </div>
        </div>
        {kind === 'RESPONSIBILITY' ? <AdminField error={errors[`${prefix}.icon`]} label="Icon" required>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {responsibilityIconValues.map((icon) => <button aria-label={icon} aria-pressed={item.icon === icon} className="admin-profile-icon-option" data-selected={item.icon === icon} key={icon} onClick={() => update(index, { icon })} title={icon} type="button"><ResponsibilityGlyph icon={icon} /><span>{icon}</span></button>)}
          </div>
        </AdminField> : null}
        <AdminBilingualFields>
          <AdminField error={errors[`${prefix}.titleEn`]} label="Title (English)" required><input aria-invalid={Boolean(errors[`${prefix}.titleEn`])} className={inputClass} onChange={(event) => update(index, { titleEn: event.target.value })} value={item.titleEn} /></AdminField>
          <AdminField error={errors[`${prefix}.titleKm`]} label="Title (Khmer)" required><input aria-invalid={Boolean(errors[`${prefix}.titleKm`])} className={inputClass} lang="km" onChange={(event) => update(index, { titleKm: event.target.value })} value={item.titleKm} /></AdminField>
          <AdminField error={errors[`${prefix}.subtitleEn`]} label="Detail (English)" optional><textarea aria-invalid={Boolean(errors[`${prefix}.subtitleEn`])} className={inputClass} onChange={(event) => update(index, { subtitleEn: event.target.value || null })} value={item.subtitleEn ?? ''} /></AdminField>
          <AdminField error={errors[`${prefix}.subtitleKm`]} label="Detail (Khmer)" optional><textarea aria-invalid={Boolean(errors[`${prefix}.subtitleKm`])} className={inputClass} lang="km" onChange={(event) => update(index, { subtitleKm: event.target.value || null })} value={item.subtitleKm ?? ''} /></AdminField>
        </AdminBilingualFields>
        <AdminField error={errors[`${prefix}.meta`]} label="Meta label" optional><input aria-invalid={Boolean(errors[`${prefix}.meta`])} className={inputClass} onChange={(event) => update(index, { meta: event.target.value || null })} value={item.meta ?? ''} /></AdminField>
      </div>;
    })}
    <Button onClick={() => replaceKind([...kindItems, { kind, icon: kind === 'RESPONSIBILITY' ? 'support' : null, titleEn: '', titleKm: '', subtitleEn: null, subtitleKm: null, meta: null, displayOrder: kindItems.length }])} type="button" variant="secondary">Add {label}</Button>
  </div>;
}

function Section({ children, description, title }: { children: ReactNode; description?: string; title: string }) {
  return <AdminFormSection description={description} title={title}>{children}</AdminFormSection>;
}

function ExpertiseFields({ category, errors, items, onChange }: {
  category: TeamCategory;
  errors: Record<string, string>;
  items: NonNullable<AdminDoctor['expertiseItems']>;
  onChange: (items: NonNullable<AdminDoctor['expertiseItems']>) => void;
}) {
  const isDentist = category === 'DENTIST';
  const itemLabel = isDentist ? 'Expertise' : 'Area of care';

  return <div className="admin-repeatable-list">
    {errors.expertise ? <p className="admin-form-error" role="alert">{errors.expertise}</p> : null}
    {items.length === 0 ? <p className="admin-repeatable-empty">No {isDentist ? 'expertise' : 'areas of care'} added yet.</p> : null}
    {items.map((item, index) => {
      const titleId = `expertise-${index}-title`;
      return <div aria-labelledby={titleId} className="admin-repeatable-item" key={index} role="group">
        <div className="admin-repeatable-item-header">
          <div>
            <p className="admin-repeatable-item-kicker">{itemLabel}</p>
            <h3 id={titleId}>{itemLabel} {index + 1}</h3>
          </div>
          <Button aria-label={`Remove ${itemLabel.toLowerCase()} ${index + 1}`} onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} type="button" variant="ghost">Remove</Button>
        </div>
        <AdminBilingualFields>
          <AdminField error={errors[`expertise.${index}.titleEn`]} htmlFor={`expertise-${index}-en`} label={`${itemLabel} (English)`} required>
            <input aria-invalid={Boolean(errors[`expertise.${index}.titleEn`])} id={`expertise-${index}-en`} onChange={(event) => onChange(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, titleEn: event.target.value } : entry))} placeholder={isDentist ? 'e.g. Oral surgery' : 'e.g. Family medicine'} value={item.titleEn} />
          </AdminField>
          <AdminField error={errors[`expertise.${index}.titleKm`]} htmlFor={`expertise-${index}-km`} label={`${itemLabel} (Khmer)`} required>
            <input aria-invalid={Boolean(errors[`expertise.${index}.titleKm`])} id={`expertise-${index}-km`} lang="km" onChange={(event) => onChange(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, titleKm: event.target.value } : entry))} placeholder={isDentist ? 'ឧ. វះកាត់មាត់ធ្មេញ' : 'ឧ. វេជ្ជសាស្ត្រគ្រួសារ'} value={item.titleKm} />
          </AdminField>
        </AdminBilingualFields>
      </div>;
    })}
    <Button onClick={() => onChange([...items, { displayOrder: items.length, titleEn: '', titleKm: '' }])} type="button" variant="secondary">Add {isDentist ? 'expertise' : 'area of care'}</Button>
  </div>;
}

function EducationFields({ errors, items, onChange }: {
  errors: Record<string, string>;
  items: NonNullable<AdminDoctor['educationItems']>;
  onChange: (items: NonNullable<AdminDoctor['educationItems']>) => void;
}) {
  return <div className="admin-repeatable-list">
    {errors.education ? <p className="admin-form-error" role="alert">{errors.education}</p> : null}
    {items.length === 0 ? <p className="admin-repeatable-empty">No qualifications added yet.</p> : null}
    {items.map((item, index) => {
      const titleId = `education-${index}-title`;
      const update = (patch: Partial<(typeof items)[number]>) => onChange(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, ...patch } : entry));
      return <div aria-labelledby={titleId} className="admin-repeatable-item" key={index} role="group">
        <div className="admin-repeatable-item-header">
          <div>
            <p className="admin-repeatable-item-kicker">Education</p>
            <h3 id={titleId}>Qualification {index + 1}</h3>
          </div>
          <Button aria-label={`Remove qualification ${index + 1}`} onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} type="button" variant="ghost">Remove</Button>
        </div>
        <AdminBilingualFields>
          <AdminField error={errors[`education.${index}.qualificationEn`]} htmlFor={`education-${index}-qualification-en`} label="Qualification (English)" required>
            <input aria-invalid={Boolean(errors[`education.${index}.qualificationEn`])} id={`education-${index}-qualification-en`} onChange={(event) => update({ qualificationEn: event.target.value })} placeholder="e.g. Doctor of Medicine" value={item.qualificationEn} />
          </AdminField>
          <AdminField error={errors[`education.${index}.qualificationKm`]} htmlFor={`education-${index}-qualification-km`} label="Qualification (Khmer)" required>
            <input aria-invalid={Boolean(errors[`education.${index}.qualificationKm`])} id={`education-${index}-qualification-km`} lang="km" onChange={(event) => update({ qualificationKm: event.target.value })} placeholder="ឧ. វេជ្ជបណ្ឌិតវេជ្ជសាស្ត្រ" value={item.qualificationKm} />
          </AdminField>
          <AdminField error={errors[`education.${index}.institutionEn`]} htmlFor={`education-${index}-institution-en`} label="Institution (English)" required>
            <input aria-invalid={Boolean(errors[`education.${index}.institutionEn`])} id={`education-${index}-institution-en`} onChange={(event) => update({ institutionEn: event.target.value })} placeholder="e.g. University of Health Sciences" value={item.institutionEn} />
          </AdminField>
          <AdminField error={errors[`education.${index}.institutionKm`]} htmlFor={`education-${index}-institution-km`} label="Institution (Khmer)" required>
            <input aria-invalid={Boolean(errors[`education.${index}.institutionKm`])} id={`education-${index}-institution-km`} lang="km" onChange={(event) => update({ institutionKm: event.target.value })} placeholder="ឧ. សាកលវិទ្យាល័យវិទ្យាសាស្ត្រសុខាភិបាល" value={item.institutionKm} />
          </AdminField>
        </AdminBilingualFields>
        <div className="admin-repeatable-item-year">
          <AdminField htmlFor={`education-${index}-year`} label="Year or period" optional>
            <input id={`education-${index}-year`} onChange={(event) => update({ yearLabel: event.target.value || null })} placeholder="e.g. 2020 or 2018–2022" value={item.yearLabel ?? ''} />
          </AdminField>
        </div>
      </div>;
    })}
    <Button onClick={() => onChange([...items, { displayOrder: items.length, qualificationEn: '', qualificationKm: '', institutionEn: '', institutionKm: '', yearLabel: null }])} type="button" variant="secondary">Add qualification</Button>
  </div>;
}

function hiddenPopulatedSections(value: AdminDoctor, next: TeamCategory): string[] {
  const result: string[] = [];
  const hasStats = Boolean(value.yearsExp || value.procedures || value.satisfaction || value.contactPhone);
  const nextIsClinical = next === 'DENTIST' || next === 'GENERAL_PRACTITIONER';
  const currentIsClinical = value.category === 'DENTIST' || value.category === 'GENERAL_PRACTITIONER' || value.category === undefined;
  if (currentIsClinical && !nextIsClinical) {
    if ((value.expertiseItems?.length ?? 0) > 0) result.push('expertise');
    if ((value.educationItems?.length ?? 0) > 0) result.push('education');
  }
  if (value.category === 'DENTIST' && next !== 'DENTIST') {
    if (value.specialty || value.specialtyKm) result.push('dentist specialty');
    if ((value.relatedDoctorIds?.length ?? 0) > 0) result.push('related dentists');
    if (hasStats) result.push('dentist statistics and phone');
  }
  const visibleKinds: Record<TeamCategory, ProfileItemKind[]> = {
    DENTIST: [], GENERAL_PRACTITIONER: ['EXPERIENCE'], RECEPTIONIST: ['RESPONSIBILITY', 'LANGUAGE'], ASSISTANT: ['RESPONSIBILITY', 'TRAINING'],
  };
  const nextKinds = new Set(visibleKinds[next]);
  const hiddenKinds = visibleKinds[value.category ?? 'DENTIST'].filter((kind) => !nextKinds.has(kind));
  for (const kind of hiddenKinds) if (value.profileItems?.some((item) => item.kind === kind)) result.push(kind.toLowerCase());
  if (value.category === 'ASSISTANT' && next !== 'ASSISTANT' && (value.departmentEn || value.departmentKm || value.teamNoteEn || value.teamNoteKm)) result.push('department and team note');
  return result;
}

export function TeamMemberForm({ initialValue, mode, onCancel, onDelete, onSubmit, saveError, saveSuccess, saving = false }: {
  initialValue: AdminDoctor;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onDelete?: () => void;
  onSubmit: (value: AdminDoctor) => void;
  saveError?: string | null;
  saveSuccess?: boolean;
  saving?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState(initialValue);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [errors, setErrors] = useState<Record<string, string>>({});
  useUnsavedChangesGuard(dirty);

  useEffect(() => { setValue(initialValue); setDirty(false); setErrors({}); }, [initialValue]);
  useEffect(() => { if (saveSuccess) setDirty(false); }, [saveSuccess]);

  const setField = <Key extends keyof AdminDoctor>(field: Key, next: AdminDoctor[Key]) => {
    setValue((current) => ({ ...current, [field]: next }));
    setDirty(true);
    setErrors((current) => { const nextErrors = { ...current }; delete nextErrors[field]; return nextErrors; });
  };
  const setName = (name: string) => {
    setValue((current) => ({ ...current, name, seo: { ...current.seo, slug: slugTouched ? current.seo?.slug : sanitizeSlug(name) ?? '' } }));
    setDirty(true);
  };
  const changeCategory = (category: TeamCategory) => {
    if (category === value.category) return;
    const hidden = hiddenPopulatedSections(value, category);
    if (hidden.length > 0 && !window.confirm(`Changing category will hide ${hidden.join(', ')}. The entered data will be kept and saved. Continue?`)) return;
    setValue((current) => ({ ...current, category, bookable: category === 'RECEPTIONIST' || category === 'ASSISTANT' ? false : current.bookable }));
    setDirty(true);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const payload = mode === 'create' ? sanitizeDoctorCreatePayload(value) : sanitizeDoctorUpdatePayload(value);
    const parsed = (mode === 'create' ? createDoctorSchema : updateDoctorSchema).safeParse(payload);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join('.');
        if (path && !nextErrors[path]) nextErrors[path] = issue.message;
      }
      setErrors(nextErrors);
      focusFirstInvalid(formRef);
      return;
    }
    setErrors({});
    onSubmit(value);
  };

  const category = value.category ?? 'DENTIST';
  const isClinical = category === 'DENTIST' || category === 'GENERAL_PRACTITIONER';
  const branchesQuery = useQuery({ queryKey: ['admin', 'branches', 'team-member-form'], queryFn: () => cmsApi.branches.list({ limit: 100 }) });
  const branches = (branchesQuery.data?.items ?? []).filter((branch) => branch.status !== 'ARCHIVED');
  return <form className="admin-team-member-form admin-stack" noValidate onSubmit={submit} ref={formRef}>
    <Section description="These bilingual fields appear throughout the public team directory and profile." title="Team member details">
      <div className="admin-stack">
        <AdminField error={errors.category} htmlFor="team-category" label="Category" required><select aria-invalid={Boolean(errors.category)} id="team-category" onChange={(event) => changeCategory(event.target.value as TeamCategory)} value={category}>{teamCategoryValues.map((item) => <option key={item} value={item}>{categoryLabels[item]}</option>)}</select></AdminField>
        <AdminBilingualFields>
          <AdminField error={errors.nameEn} htmlFor="team-name-en" label="Name (English)" required><input aria-invalid={Boolean(errors.nameEn)} id="team-name-en" onChange={(event) => setName(event.target.value)} value={value.name} /></AdminField>
          <AdminField error={errors.nameKm} htmlFor="team-name-km" label="Name (Khmer)" required><input aria-invalid={Boolean(errors.nameKm)} id="team-name-km" lang="km" onChange={(event) => setField('nameKm', event.target.value)} value={value.nameKm ?? ''} /></AdminField>
          <AdminField error={errors.titleEn} htmlFor="team-role-en" label="Role title (English)" optional><input aria-invalid={Boolean(errors.titleEn)} id="team-role-en" onChange={(event) => setField('roleTitle', event.target.value)} value={value.roleTitle} /></AdminField>
          <AdminField error={errors.titleKm} htmlFor="team-role-km" label="Role title (Khmer)" optional><input aria-invalid={Boolean(errors.titleKm)} id="team-role-km" lang="km" onChange={(event) => setField('roleTitleKm', event.target.value)} value={value.roleTitleKm ?? ''} /></AdminField>
        </AdminBilingualFields>
        <AdminField error={errors.slug} htmlFor="team-slug" label="Public profile slug" required help="Generated from the English name until you edit it."><input aria-invalid={Boolean(errors.slug)} id="team-slug" onChange={(event) => { setSlugTouched(true); setField('seo', { ...value.seo, slug: event.target.value }); }} value={value.seo?.slug ?? ''} /></AdminField>
        <AdminBilingualFields>
          <AdminField error={errors.shortBioEn} htmlFor="team-intro-en" label="Short intro (English)" optional><textarea aria-invalid={Boolean(errors.shortBioEn)} id="team-intro-en" onChange={(event) => setField('shortIntro', event.target.value)} value={value.shortIntro} /></AdminField>
          <AdminField error={errors.shortBioKm} htmlFor="team-intro-km" label="Short intro (Khmer)" optional><textarea aria-invalid={Boolean(errors.shortBioKm)} id="team-intro-km" lang="km" onChange={(event) => setField('shortIntroKm', event.target.value)} value={value.shortIntroKm ?? ''} /></AdminField>
          <AdminField error={errors.aboutEn} htmlFor="team-about-en" label="About (English)" optional><textarea aria-invalid={Boolean(errors.aboutEn)} id="team-about-en" onChange={(event) => setField('content', event.target.value)} value={value.content ?? ''} /></AdminField>
          <AdminField error={errors.aboutKm} htmlFor="team-about-km" label="About (Khmer)" optional><textarea aria-invalid={Boolean(errors.aboutKm)} id="team-about-km" lang="km" onChange={(event) => setField('contentKm', event.target.value)} value={value.contentKm ?? ''} /></AdminField>
        </AdminBilingualFields>
      </div>
    </Section>

    <Section description="Upload once, then adjust the crop used by team cards and profile layouts." title="Portrait">
      <MediaUploader category="doctors" framing={{ frames: imageFrames.doctorPhoto, onChange: (presentation) => setField('photoImagePresentation', presentation), value: value.photoImagePresentation }} help="Use a clear portrait. JPEG, PNG, WEBP, AVIF, or GIF up to 5 MB." label="Team member portrait" onClear={() => { setField('photoKey', null); setField('imageUrl', undefined); }} onUploaded={(photoKey) => { setField('photoKey', photoKey); setField('imageUrl', getPublicMediaUrl(photoKey)); }} value={value.photoKey ?? undefined} />
    </Section>

    {category === 'DENTIST' || category === 'GENERAL_PRACTITIONER' ? <>
      <Section description={category === 'DENTIST' ? 'Clinical specialties shown on the dentist profile.' : 'Areas of medical care shown on the practitioner profile.'} title={category === 'DENTIST' ? 'Expertise' : 'Areas of medical care'}>
        <ExpertiseFields category={category} errors={errors} items={value.expertiseItems ?? []} onChange={(items) => setField('expertiseItems', items)} />
      </Section>
      <Section description={category === 'DENTIST' ? 'Dental education and qualifications.' : 'Medical qualifications and institutions.'} title={category === 'DENTIST' ? 'Education' : 'Medical qualifications'}>
        <EducationFields errors={errors} items={value.educationItems ?? []} onChange={(items) => setField('educationItems', items)} />
      </Section>
    </> : null}

    {category === 'GENERAL_PRACTITIONER' ? <Section title="Experience"><ProfileItemRepeater errors={errors} items={value.profileItems ?? []} kind="EXPERIENCE" label="experience item" onChange={(items) => setField('profileItems', items)} /></Section> : null}
    {category === 'RECEPTIONIST' || category === 'ASSISTANT' ? <Section title="Responsibilities"><ProfileItemRepeater errors={errors} items={value.profileItems ?? []} kind="RESPONSIBILITY" label="responsibility" onChange={(items) => setField('profileItems', items)} /></Section> : null}
    {category === 'RECEPTIONIST' ? <Section title="Languages"><ProfileItemRepeater errors={errors} items={value.profileItems ?? []} kind="LANGUAGE" label="language" onChange={(items) => setField('profileItems', items)} /></Section> : null}
    {category === 'ASSISTANT' ? <>
      <Section title="Training"><ProfileItemRepeater errors={errors} items={value.profileItems ?? []} kind="TRAINING" label="training item" onChange={(items) => setField('profileItems', items)} /></Section>
      <Section title="Team connection"><AdminBilingualFields><AdminField error={errors.departmentEn} label="Department (English)" optional><input aria-invalid={Boolean(errors.departmentEn)} onChange={(event) => setField('departmentEn', event.target.value)} value={value.departmentEn ?? ''} /></AdminField><AdminField error={errors.departmentKm} label="Department (Khmer)" optional><input aria-invalid={Boolean(errors.departmentKm)} lang="km" onChange={(event) => setField('departmentKm', event.target.value)} value={value.departmentKm ?? ''} /></AdminField><AdminField error={errors.teamNoteEn} label="Team note (English)" optional><textarea aria-invalid={Boolean(errors.teamNoteEn)} onChange={(event) => setField('teamNoteEn', event.target.value)} value={value.teamNoteEn ?? ''} /></AdminField><AdminField error={errors.teamNoteKm} label="Team note (Khmer)" optional><textarea aria-invalid={Boolean(errors.teamNoteKm)} lang="km" onChange={(event) => setField('teamNoteKm', event.target.value)} value={value.teamNoteKm ?? ''} /></AdminField></AdminBilingualFields></Section>
    </> : null}

    {category === 'DENTIST' ? <Section description="Dentist-only profile and booking information." title="Dentist details">
      <AdminBilingualFields><AdminField error={errors.specialtyEn} label="Specialty (English)" optional><input onChange={(event) => setField('specialty', event.target.value)} value={value.specialty} /></AdminField><AdminField error={errors.specialtyKm} label="Specialty (Khmer)" optional><input lang="km" onChange={(event) => setField('specialtyKm', event.target.value)} value={value.specialtyKm ?? ''} /></AdminField></AdminBilingualFields>
      <div className="admin-team-stats-grid">
        <AdminField error={errors.yearsExperience} htmlFor="dentist-years-experience" label="Years experience" optional><input aria-invalid={Boolean(errors.yearsExperience)} id="dentist-years-experience" inputMode="numeric" min="0" onChange={(event) => setField('yearsExp', event.target.value)} placeholder="e.g. 12" type="number" value={value.yearsExp} /></AdminField>
        <AdminField error={errors.successfulProcedures} htmlFor="dentist-procedures" label="Procedures" optional><input aria-invalid={Boolean(errors.successfulProcedures)} id="dentist-procedures" inputMode="numeric" min="0" onChange={(event) => setField('procedures', event.target.value)} placeholder="e.g. 500" type="number" value={value.procedures} /></AdminField>
        <AdminField error={errors.patientSatisfaction} htmlFor="dentist-satisfaction" label="Satisfaction %" optional><input aria-invalid={Boolean(errors.patientSatisfaction)} id="dentist-satisfaction" inputMode="numeric" max="100" min="0" onChange={(event) => setField('satisfaction', event.target.value)} placeholder="e.g. 98" type="number" value={value.satisfaction} /></AdminField>
        <AdminField error={errors.phone} htmlFor="dentist-phone" label="Phone" optional><input aria-invalid={Boolean(errors.phone)} autoComplete="tel" id="dentist-phone" inputMode="tel" onChange={(event) => setField('contactPhone', event.target.value)} placeholder="e.g. 012 345 678" type="tel" value={value.contactPhone} /></AdminField>
      </div>
      <AdminField error={errors.relatedDoctorIds} label="Related dentists" optional help="Enter up to three doctor IDs, separated by commas."><input aria-invalid={Boolean(errors.relatedDoctorIds)} onChange={(event) => setField('relatedDoctorIds', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} value={(value.relatedDoctorIds ?? []).join(', ')} /></AdminField>
    </Section> : null}

    <Section description="Branch availability and public ordering are shared across every category." title="Placement and publishing">
      <div className="admin-stack">
        <AdminField error={errors.branchIds} label="Branches" optional><div className="mt-2 flex flex-wrap gap-3"><BranchChoices branches={branches} selected={value.branchIds ?? []} onChange={(branchIds) => setField('branchIds', branchIds)} /></div></AdminField>
        <div className="grid gap-4 sm:grid-cols-2"><AdminField error={errors.status} label="Status" required><select onChange={(event) => { const status = event.target.value as AdminDoctor['status']; setField('status', status); setField('showOnWebsite', status === 'published'); }} value={value.status}><option value="draft">Draft</option><option value="published">Published</option>{mode === 'edit' ? <option value="archived">Archived</option> : null}</select></AdminField><AdminField error={errors.displayOrder} label="Display order" required><input min="0" onChange={(event) => setField('displayOrder', Number(event.target.value) || 0)} type="number" value={value.displayOrder ?? 0} /></AdminField></div>
        <div className="flex flex-wrap gap-6"><AdminToggle checked={value.featuredDoctor} label="Featured team member" onChange={(checked) => setField('featuredDoctor', checked)} showLabel />{isClinical ? <AdminToggle checked={value.bookable !== false} label="Bookable clinician" onChange={(checked) => setField('bookable', checked)} showLabel /> : null}</div>
      </div>
    </Section>

    {errors.profileItems ? <AdminFeedback title="Profile items need attention" tone="error"><p>{errors.profileItems}</p></AdminFeedback> : null}
    {saveError ? <AdminFeedback title="Team member could not be saved" tone="error"><p>{saveError}</p></AdminFeedback> : null}
    {saveSuccess ? <AdminFeedback title="Team member saved" tone="success"><p>The profile and category-specific content are up to date.</p></AdminFeedback> : null}
    <AdminFormActions status={saving ? 'Saving team member…' : dirty ? 'Unsaved changes' : 'All changes saved'}>
      {mode === 'edit' && value.status === 'published' && value.seo?.slug ? <Link className="inline-flex items-center px-4 text-sm font-semibold text-[#0d7596]" rel="noreferrer" target="_blank" to={`/team/${value.seo.slug}`}>View public profile ↗</Link> : null}
      {onDelete ? <Button onClick={onDelete} type="button" variant="ghost">Delete</Button> : null}
      <Button disabled={saving} onClick={onCancel} type="button" variant="secondary">Cancel</Button>
      <Button disabled={saving} type="submit">{saving ? 'Saving…' : mode === 'create' ? 'Add Team Member' : 'Save Team Member'}</Button>
    </AdminFormActions>
  </form>;
}

function BranchChoices({ branches, onChange, selected }: { branches: { id: string; nameEn: string; nameKm: string }[]; onChange: (ids: string[]) => void; selected: string[] }) {
  return <>{branches.map((branch) => <label className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#ccd7e1] px-3" key={branch.id}><input checked={selected.includes(branch.id)} onChange={() => onChange(selected.includes(branch.id) ? selected.filter((id) => id !== branch.id) : [...selected, branch.id])} type="checkbox" /><span>{branch.nameEn}{branch.nameKm ? ` / ${branch.nameKm}` : ''}</span></label>)}</>;
}

export function emptyTeamMember(category: TeamCategory): AdminDoctor {
  return {
    id: '', category, bookable: category === 'DENTIST' || category === 'GENERAL_PRACTITIONER', name: '', nameKm: '', roleTitle: '', roleTitleKm: '', specialty: '', specialtyKm: '', shortIntro: '', shortIntroKm: '', content: '', contentKm: '', contactPhone: '', ctaButtonText: 'Book Now', educationItems: [], expertiseItems: [], profileItems: [], relatedDoctorIds: [], branchIds: [], procedures: '', satisfaction: '', yearsExp: '', featuredDoctor: false, showOnWebsite: false, status: 'draft', updatedAt: '', displayOrder: 0, departmentEn: '', departmentKm: '', teamNoteEn: '', teamNoteKm: '', seo: { slug: '' },
  };
}
