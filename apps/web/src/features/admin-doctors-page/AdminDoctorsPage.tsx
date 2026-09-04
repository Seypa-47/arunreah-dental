import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminDoctorListQuery } from '@arunreah/shared';
import { useNavigate } from 'react-router-dom';
import { AdminIcon, AdminSidebar } from '@/components/layout/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toAdminDoctorDetail, type AdminDoctor, type AdminDoctorsContent, type DoctorStatus } from '@/services/admin-doctors';
import { queryKeys } from '@/lib/query-keys';
import { useAdminDoctorsPageQuery } from './use-admin-doctors-page';
import { cmsApi } from '@/services/cms';
import { invalidateCmsDomain } from '@/services/cms-cache';

function StatusBadge({ status }: { status: DoctorStatus }) {
  const isPublished = status === 'published';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase ${
        isPublished
          ? 'border-[#c4f3d8] bg-[#eefbf3] text-[#13a863]'
          : 'border-[#e2e8f0] bg-[#f1f5f9] text-[#64748b]'
      }`}
    >
      {isPublished ? 'PUBLISHED' : 'DRAFT'}
    </span>
  );
}

function ToggleSwitch({
  checked,
  id,
  label,
  onChange,
}: {
  checked: boolean;
  id?: string;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] font-semibold text-[#182238]">{label}</span>
      <button
        aria-checked={checked}
        aria-label={label}
        className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8] ${
          checked ? 'bg-[#2187a8]' : 'bg-[#d8e2ec]'
        }`}
        id={id}
        onClick={() => onChange(!checked)}
        role="switch"
        type="button"
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

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

type TabType = 'overview' | 'content' | 'expertise' | 'education' | 'seo';

function DoctorDetailPanel({
  doctor,
  onClose,
  onDelete,
  onSave,
}: {
  doctor: AdminDoctor;
  onClose?: () => void;
  onDelete: (id: string) => void;
  onSave: (updated: AdminDoctor) => void;
}) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [formData, setFormData] = useState<AdminDoctor>(doctor);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync form when selected doctor changes
  useEffect(() => {
    setFormData(doctor);
    setSaveSuccess(false);
  }, [doctor]);

  const handleFieldChange = (field: keyof AdminDoctor, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleDiscard = () => {
    setFormData(doctor);
    setSaveSuccess(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <aside
      aria-label="Specialist details editor"
      className="flex min-h-full flex-col rounded-[28px] border border-[#e1e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.02)] xl:p-7"
    >
      {/* Header Profile Area */}
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <DoctorAvatar doctor={formData} size="lg" />
          <div>
            <h2 className="text-[18px] font-bold text-[#182238]">{formData.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-[#71839e]">
              <StatusBadge status={formData.status} />
              <span aria-hidden="true" className="text-[#a6b6ca]">
                •
              </span>
              <span>{formData.roleTitle}</span>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-1">
          {onClose ? (
            <button
              aria-label="Close specialist panel"
              className="rounded-lg p-2 text-xl text-[#71839e] hover:bg-[#f4f8fb]"
              onClick={onClose}
              type="button"
            >
              ×
            </button>
          ) : null}

          <button
            aria-expanded={menuOpen}
            aria-label="Specialist actions menu"
            className="grid size-9 place-items-center rounded-xl text-lg text-[#71839e] hover:bg-[#f4f8fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2187a8]"
            onClick={() => setMenuOpen(!menuOpen)}
            type="button"
          >
            ⋮
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-11 z-20 w-48 rounded-xl border border-[#e1e8f0] bg-white p-1.5 shadow-lg text-[13px] font-medium text-[#182238]">
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-[#f4f8fb]"
                onClick={() => {
                  const newStatus = formData.status === 'published' ? 'draft' : 'published';
                  handleFieldChange('status', newStatus);
                  onSave({ ...formData, status: newStatus });
                  setMenuOpen(false);
                }}
                type="button"
              >
                {formData.status === 'published' ? 'Set as Draft' : 'Publish Specialist'}
              </button>
              <a
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-[#f4f8fb] text-[#2187a8]"
                href={`/doctors/${formData.seo?.slug || formData.id}`}
                rel="noreferrer"
                target="_blank"
              >
                Preview on Website ↗
              </a>
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[#ef4147] hover:bg-[#fff0f1]"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(formData.id);
                }}
                type="button"
              >
                Delete Specialist
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-[#e5edf5] text-[14px] font-semibold text-[#71839e]">
        {(
          [
            ['overview', 'Overview'],
            ['content', 'Content'],
            ['expertise', 'Expertise'],
            ['education', 'Education'],
            ['seo', 'Publishing'],
          ] as const
        ).map(([tabKey, tabLabel]) => (
          <button
            className={`border-b-2 px-3 pb-3 text-center transition-colors focus-visible:outline-none ${
              activeTab === tabKey
                ? 'border-[#2187a8] text-[#2187a8]'
                : 'border-transparent hover:text-[#182238]'
            }`}
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            type="button"
          >
            {tabLabel}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <form className="mt-6 flex flex-1 flex-col justify-between" onSubmit={handleSubmit}>
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Doctor Name & Role/Title */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#61738d]">
                  Doctor Name *
                </span>
                <input
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#e1e8f0] bg-[#f9fbfd] px-3.5 text-[14px] font-medium text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:bg-white focus:ring-2 focus:ring-[#d9f0f7]"
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  required
                  type="text"
                  value={formData.name}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#61738d]">
                  Role / Title *
                </span>
                <input
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#e1e8f0] bg-[#f9fbfd] px-3.5 text-[14px] font-medium text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:bg-white focus:ring-2 focus:ring-[#d9f0f7]"
                  onChange={(e) => handleFieldChange('roleTitle', e.target.value)}
                  required
                  type="text"
                  value={formData.roleTitle}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#61738d]">Doctor Name (Khmer) *</span>
                <input className="mt-1.5 h-11 w-full rounded-xl border border-[#e1e8f0] bg-[#f9fbfd] px-3.5 text-[14px] font-medium text-[#182238] outline-none transition focus:border-[#2187a8] focus:bg-white focus:ring-2 focus:ring-[#d9f0f7]" onChange={(e) => handleFieldChange('nameKm', e.target.value)} required type="text" value={formData.nameKm ?? ''} />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#61738d]">Role / Title (Khmer)</span>
                <input className="mt-1.5 h-11 w-full rounded-xl border border-[#e1e8f0] bg-[#f9fbfd] px-3.5 text-[14px] font-medium text-[#182238] outline-none transition focus:border-[#2187a8] focus:bg-white focus:ring-2 focus:ring-[#d9f0f7]" onChange={(e) => handleFieldChange('roleTitleKm', e.target.value)} type="text" value={formData.roleTitleKm ?? ''} />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#61738d]">Specialty (Khmer)</span>
                <input className="mt-1.5 h-11 w-full rounded-xl border border-[#e1e8f0] bg-[#f9fbfd] px-3.5 text-[14px] font-medium text-[#182238] outline-none transition focus:border-[#2187a8] focus:bg-white focus:ring-2 focus:ring-[#d9f0f7]" onChange={(e) => handleFieldChange('specialtyKm', e.target.value)} type="text" value={formData.specialtyKm ?? ''} />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#61738d]">Short Intro (Khmer)</span>
                <textarea className="mt-1.5 min-h-[90px] w-full resize-y rounded-xl border border-[#e1e8f0] bg-[#f9fbfd] p-3.5 text-[14px] leading-relaxed text-[#182238] outline-none transition focus:border-[#2187a8] focus:bg-white focus:ring-2 focus:ring-[#d9f0f7]" onChange={(e) => handleFieldChange('shortIntroKm', e.target.value)} rows={3} value={formData.shortIntroKm ?? ''} />
              </label>
            </div>

            {/* Short Intro / Hero Description */}
            <label className="block">
              <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#61738d]">
                Short Intro / Hero Description *
              </span>
              <textarea
                className="mt-1.5 min-h-[90px] w-full resize-y rounded-xl border border-[#e1e8f0] bg-[#f9fbfd] p-3.5 text-[14px] leading-relaxed text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:bg-white focus:ring-2 focus:ring-[#d9f0f7]"
                onChange={(e) => handleFieldChange('shortIntro', e.target.value)}
                required
                rows={3}
                value={formData.shortIntro}
              />
            </label>

            {/* Stats: Years Exp, Procedures, Satisfaction */}
            <div className="grid grid-cols-3 gap-3">
              <label className="block">
                <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#61738d]">
                  Years Exp *
                </span>
                <input
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#e1e8f0] bg-[#f9fbfd] px-3 text-[14px] font-medium text-[#182238] outline-none transition focus:border-[#2187a8] focus:bg-white focus:ring-2 focus:ring-[#d9f0f7]"
                  onChange={(e) => handleFieldChange('yearsExp', e.target.value)}
                  required
                  type="text"
                  value={formData.yearsExp}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#61738d]">
                  Procedures *
                </span>
                <input
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#e1e8f0] bg-[#f9fbfd] px-3 text-[14px] font-medium text-[#182238] outline-none transition focus:border-[#2187a8] focus:bg-white focus:ring-2 focus:ring-[#d9f0f7]"
                  onChange={(e) => handleFieldChange('procedures', e.target.value)}
                  required
                  type="text"
                  value={formData.procedures}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#61738d]">
                  Satisfaction *
                </span>
                <input
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#e1e8f0] bg-[#f9fbfd] px-3 text-[14px] font-medium text-[#182238] outline-none transition focus:border-[#2187a8] focus:bg-white focus:ring-2 focus:ring-[#d9f0f7]"
                  onChange={(e) => handleFieldChange('satisfaction', e.target.value)}
                  required
                  type="text"
                  value={formData.satisfaction}
                />
              </label>
            </div>

            {/* Contact Phone & CTA Button Text */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#61738d]">
                  Contact Phone *
                </span>
                <div className="relative mt-1.5">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#71839e]"
                  >
                    📞
                  </span>
                  <input
                    className="h-11 w-full rounded-xl border border-[#e1e8f0] bg-[#f9fbfd] pl-9 pr-3.5 text-[14px] font-medium text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:bg-white focus:ring-2 focus:ring-[#d9f0f7]"
                    onChange={(e) => handleFieldChange('contactPhone', e.target.value)}
                    required
                    type="tel"
                    value={formData.contactPhone}
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#61738d]">
                  CTA Button Text
                </span>
                <input
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#e1e8f0] bg-[#f9fbfd] px-3.5 text-[14px] font-medium text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:bg-white focus:ring-2 focus:ring-[#d9f0f7]"
                  onChange={(e) => handleFieldChange('ctaButtonText', e.target.value)}
                  type="text"
                  value={formData.ctaButtonText}
                />
              </label>
            </div>

            {/* Switches: Show on Website & Featured Doctor */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <ToggleSwitch
                checked={formData.showOnWebsite}
                label="Show on Website"
                onChange={(checked) => handleFieldChange('showOnWebsite', checked)}
              />
              <ToggleSwitch
                checked={formData.featuredDoctor}
                label="Featured Doctor"
                onChange={(checked) => handleFieldChange('featuredDoctor', checked)}
              />
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#61738d]">
                Extended Bio / Biography
              </span>
              <textarea
                className="mt-1.5 min-h-[180px] w-full resize-y rounded-xl border border-[#e1e8f0] bg-[#f9fbfd] p-3.5 text-[14px] leading-relaxed text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:bg-white focus:ring-2 focus:ring-[#d9f0f7]"
                onChange={(e) => handleFieldChange('content', e.target.value)}
                placeholder="Detailed clinical background, qualifications, and patient care philosophy..."
                rows={6}
                value={formData.content || ''}
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#61738d]">Extended Bio / Biography (Khmer)</span>
              <textarea className="mt-1.5 min-h-[180px] w-full resize-y rounded-xl border border-[#e1e8f0] bg-[#f9fbfd] p-3.5 text-[14px] leading-relaxed text-[#182238] outline-none transition focus:border-[#2187a8] focus:bg-white focus:ring-2 focus:ring-[#d9f0f7]" onChange={(e) => handleFieldChange('contentKm', e.target.value)} rows={6} value={formData.contentKm ?? ''} />
            </label>
          </div>
        )}

        {activeTab === 'expertise' && (
          <div className="space-y-4">
            <p className="text-sm text-[#71839e]">Ordered expertise items require both English and Khmer values.</p>
            {(formData.expertiseItems ?? []).map((item, index) => (
              <div className="grid gap-3 rounded-xl border border-[#e1e8f0] p-3 sm:grid-cols-[1fr_1fr_auto]" key={`${item.displayOrder}-${index}`}>
                <input className="h-10 rounded-lg border border-[#dce5ef] px-3 text-sm" onChange={(e) => handleFieldChange('expertiseItems', (formData.expertiseItems ?? []).map((entry, itemIndex) => itemIndex === index ? { ...entry, titleEn: e.target.value } : entry))} placeholder="Expertise (English)" value={item.titleEn} />
                <input className="h-10 rounded-lg border border-[#dce5ef] px-3 text-sm" onChange={(e) => handleFieldChange('expertiseItems', (formData.expertiseItems ?? []).map((entry, itemIndex) => itemIndex === index ? { ...entry, titleKm: e.target.value } : entry))} placeholder="Expertise (Khmer)" value={item.titleKm} />
                <Button className="text-[#b91c1c]" onClick={() => handleFieldChange('expertiseItems', (formData.expertiseItems ?? []).filter((_, itemIndex) => itemIndex !== index))} type="button" variant="secondary">Remove</Button>
              </div>
            ))}
            <Button onClick={() => handleFieldChange('expertiseItems', [...(formData.expertiseItems ?? []), { displayOrder: (formData.expertiseItems ?? []).length, titleEn: '', titleKm: '' }])} type="button" variant="secondary">Add expertise</Button>
          </div>
        )}

        {activeTab === 'education' && (
          <div className="space-y-4">
            <p className="text-sm text-[#71839e]">Each qualification and institution is stored bilingually and in display order.</p>
            {(formData.educationItems ?? []).map((item, index) => (
              <div className="grid gap-2 rounded-xl border border-[#e1e8f0] p-3 sm:grid-cols-2" key={`${item.displayOrder}-${index}`}>
                {(['qualificationEn', 'qualificationKm', 'institutionEn', 'institutionKm'] as const).map((field) => <input className="h-10 rounded-lg border border-[#dce5ef] px-3 text-sm" key={field} onChange={(e) => handleFieldChange('educationItems', (formData.educationItems ?? []).map((entry, itemIndex) => itemIndex === index ? { ...entry, [field]: e.target.value } : entry))} placeholder={field.replace(/([A-Z])/g, ' $1')} value={item[field]} />)}
                <input className="h-10 rounded-lg border border-[#dce5ef] px-3 text-sm" onChange={(e) => handleFieldChange('educationItems', (formData.educationItems ?? []).map((entry, itemIndex) => itemIndex === index ? { ...entry, yearLabel: e.target.value || null } : entry))} placeholder="Year label (optional)" value={item.yearLabel ?? ''} />
                <Button className="text-[#b91c1c]" onClick={() => handleFieldChange('educationItems', (formData.educationItems ?? []).filter((_, itemIndex) => itemIndex !== index))} type="button" variant="secondary">Remove</Button>
              </div>
            ))}
            <Button onClick={() => handleFieldChange('educationItems', [...(formData.educationItems ?? []), { displayOrder: (formData.educationItems ?? []).length, institutionEn: '', institutionKm: '', qualificationEn: '', qualificationKm: '', yearLabel: null }])} type="button" variant="secondary">Add education</Button>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#61738d]">
                URL Slug
              </span>
              <input
                className="mt-1.5 h-11 w-full rounded-xl border border-[#e1e8f0] bg-[#f9fbfd] px-3.5 text-[14px] font-medium text-[#182238] outline-none transition focus:border-[#2187a8] focus:bg-white focus:ring-2 focus:ring-[#d9f0f7]"
                onChange={(e) => handleFieldChange('seo', { ...formData.seo, slug: e.target.value })}
                type="text"
                value={formData.seo?.slug || ''}
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#61738d]">
                Related Doctor IDs (maximum 3, comma separated)
              </span>
              <textarea
                className="mt-1.5 min-h-[80px] w-full resize-y rounded-xl border border-[#e1e8f0] bg-[#f9fbfd] p-3.5 text-[14px] leading-relaxed text-[#182238] outline-none transition focus:border-[#2187a8] focus:bg-white focus:ring-2 focus:ring-[#d9f0f7]"
                onChange={(e) => handleFieldChange('relatedDoctorIds', e.target.value.split(',').map((id) => id.trim()).filter(Boolean))}
                rows={3}
                value={(formData.relatedDoctorIds ?? []).join(', ')}
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#61738d]">Display order</span>
              <input className="mt-1.5 h-11 w-full rounded-xl border border-[#e1e8f0] bg-[#f9fbfd] px-3.5 text-[14px] font-medium text-[#182238] outline-none transition focus:border-[#2187a8]" min="0" onChange={(e) => handleFieldChange('displayOrder', Number(e.target.value) || 0)} type="number" value={formData.displayOrder ?? 0} />
            </label>
          </div>
        )}

        {/* Feedback message */}
        {saveSuccess && (
          <div className="mt-4 rounded-xl border border-[#c4f3d8] bg-[#effdf5] px-4 py-2 text-center text-[13px] font-bold text-[#13ad63]">
            ✓ Specialist profile saved successfully!
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-[#e5edf5] pt-6">
          <Button
            className="h-11 rounded-xl border border-[#dce5ef] bg-white px-5 text-[14px] font-bold text-[#71839e] shadow-none hover:bg-[#f4f8fb]"
            onClick={handleDiscard}
            type="button"
            variant="secondary"
          >
            Discard Changes
          </Button>

          <Button
            className="h-11 rounded-xl bg-[#2187a8] px-6 text-[14px] font-bold text-white shadow-none hover:bg-[#1a718c]"
            type="submit"
          >
            Save Specialist
          </Button>
        </div>
      </form>
    </aside>
  );
}

function NoDoctorSelectedPanel() {
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

function DoctorsEmptyState({ onAddDoctor }: { onAddDoctor: () => void }) {
  return (
    <Card className="mt-8 flex min-h-[580px] flex-col items-center justify-center rounded-[28px] border-[#e1e8f0] bg-white p-10 text-center shadow-[0_2px_4px_rgba(15,23,42,0.02)] sm:p-14">
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
      <h2 className="text-[24px] font-bold text-[#182238]">No Doctors Found</h2>
      <p className="mt-3 max-w-[460px] text-[15px] leading-relaxed text-[#71839e]">
        It looks like you haven&apos;t added any doctors to your clinic yet. Start by adding your first
        specialist profile to show them on your website.
      </p>

      {/* Button */}
      <Button
        className="mt-7 h-11 rounded-xl bg-[#2187a8] px-6 text-[14px] font-bold text-white shadow-[0_6px_14px_rgba(33,135,168,0.2)] hover:bg-[#1a718c]"
        icon={<span aria-hidden="true" className="text-lg leading-none font-bold">+</span>}
        onClick={onAddDoctor}
      >
        Add Your First Doctor
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
        <span>Quick Tip: Profiles can be saved as drafts first</span>
      </div>
    </Card>
  );
}

function AddDoctorModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (doctor: AdminDoctor) => void;
}) {
  const [name, setName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [specialty, setSpecialty] = useState('Dental Implantology');
  const [status, setStatus] = useState<DoctorStatus>('published');
  const [shortIntro, setShortIntro] = useState('');
  const [yearsExp, setYearsExp] = useState('10+');
  const [procedures, setProcedures] = useState('5k+');
  const [satisfaction, setSatisfaction] = useState('99%');
  const [contactPhone, setContactPhone] = useState('+855 23 456 789');
  const [ctaButtonText, setCtaButtonText] = useState('Book Now');
  const [showOnWebsite, setShowOnWebsite] = useState(true);
  const [featuredDoctor, setFeaturedDoctor] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0]?.toUpperCase())
      .join('');

    const newDoctor: AdminDoctor = {
      id: `doctor-${Date.now()}`,
      name,
      roleTitle,
      specialty,
      status,
      updatedAt: 'Just now',
      initials: initials || 'DR',
      avatarBgColor: 'bg-[#e3f0f7] text-[#1f738f]',
      shortIntro,
      yearsExp,
      procedures,
      satisfaction,
      contactPhone,
      ctaButtonText,
      showOnWebsite,
      featuredDoctor,
    };

    onCreate(newDoctor);
    onClose();
  };

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-xl rounded-3xl border border-[#e1e8f0] bg-white p-7 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e5edf5] pb-4">
          <h3 className="text-xl font-bold text-[#182238]">Add New Specialist</h3>
          <button
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-2xl leading-none text-[#71839e] hover:bg-[#f4f8fb]"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[12px] font-bold uppercase text-[#61738d]">Doctor Name *</span>
              <input
                className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] bg-[#f9fbfd] px-3 text-[14px] text-[#182238] outline-none focus:border-[#2187a8]"
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Meas Vanna"
                required
                type="text"
                value={name}
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-bold uppercase text-[#61738d]">Role / Title *</span>
              <input
                className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] bg-[#f9fbfd] px-3 text-[14px] text-[#182238] outline-none focus:border-[#2187a8]"
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Senior Specialist"
                required
                type="text"
                value={roleTitle}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[12px] font-bold uppercase text-[#61738d]">Specialty</span>
              <select
                className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] bg-[#f9fbfd] px-3 text-[14px] text-[#182238] outline-none focus:border-[#2187a8]"
                onChange={(e) => setSpecialty(e.target.value)}
                value={specialty}
              >
                <option>Dental Implantology</option>
                <option>Prosthodontics</option>
                <option>Orthodontics</option>
                <option>General Dentistry</option>
                <option>Endodontics</option>
                <option>Pediatric Dentistry</option>
                <option>Oral Surgery</option>
                <option>Periodontics</option>
                <option>Cosmetic Dentistry</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[12px] font-bold uppercase text-[#61738d]">Status</span>
              <select
                className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] bg-[#f9fbfd] px-3 text-[14px] text-[#182238] outline-none focus:border-[#2187a8]"
                onChange={(e) => setStatus(e.target.value as DoctorStatus)}
                value={status}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="text-[12px] font-bold uppercase text-[#61738d]">Years Exp</span>
              <input
                className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] bg-[#f9fbfd] px-3 text-[14px] text-[#182238] outline-none focus:border-[#2187a8]"
                onChange={(e) => setYearsExp(e.target.value)}
                type="text"
                value={yearsExp}
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-bold uppercase text-[#61738d]">Procedures</span>
              <input
                className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] bg-[#f9fbfd] px-3 text-[14px] text-[#182238] outline-none focus:border-[#2187a8]"
                onChange={(e) => setProcedures(e.target.value)}
                type="text"
                value={procedures}
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-bold uppercase text-[#61738d]">Satisfaction</span>
              <input
                className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] bg-[#f9fbfd] px-3 text-[14px] text-[#182238] outline-none focus:border-[#2187a8]"
                onChange={(e) => setSatisfaction(e.target.value)}
                type="text"
                value={satisfaction}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[12px] font-bold uppercase text-[#61738d]">Contact Phone</span>
              <input
                className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] bg-[#f9fbfd] px-3 text-[14px] text-[#182238] outline-none focus:border-[#2187a8]"
                onChange={(e) => setContactPhone(e.target.value)}
                type="tel"
                value={contactPhone}
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-bold uppercase text-[#61738d]">CTA Button Text</span>
              <input
                className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] bg-[#f9fbfd] px-3 text-[14px] text-[#182238] outline-none focus:border-[#2187a8]"
                onChange={(e) => setCtaButtonText(e.target.value)}
                type="text"
                value={ctaButtonText}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 py-1">
            <ToggleSwitch
              checked={showOnWebsite}
              label="Show on Website"
              onChange={setShowOnWebsite}
            />
            <ToggleSwitch
              checked={featuredDoctor}
              label="Featured Doctor"
              onChange={setFeaturedDoctor}
            />
          </div>

          <label className="block">
            <span className="text-[12px] font-bold uppercase text-[#61738d]">Short Intro *</span>
            <textarea
              className="mt-1 w-full rounded-xl border border-[#dce5ef] bg-[#f9fbfd] p-3 text-[14px] text-[#182238] outline-none focus:border-[#2187a8]"
              onChange={(e) => setShortIntro(e.target.value)}
              placeholder="Brief description of doctor's clinical focus..."
              required
              rows={2}
              value={shortIntro}
            />
          </label>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              className="border border-[#dce5ef] bg-white text-[#71839e]"
              onClick={onClose}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button className="bg-[#2187a8] text-white hover:bg-[#1a718c]" type="submit">
              Create Specialist
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

type DoctorListState = Pick<AdminDoctorListQuery, 'page' | 'limit' | 'search' | 'status' | 'specialty' | 'sort' | 'order'>;

function DoctorsContent({ content, listState, onListStateChange }: { content: AdminDoctorsContent; listState: DoctorListState; onListStateChange: (next: DoctorListState) => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [doctors, setDoctors] = useState<AdminDoctor[]>(content.doctors);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  useEffect(() => { setDoctors(content.doctors); }, [content.doctors]);
  const doctorDetailQuery = useQuery({
    enabled: selectedId !== null,
    queryFn: () => cmsApi.doctors.get(selectedId!),
    queryKey: queryKeys.admin.doctor(selectedId ?? ''),
  });

  // Extract unique specialties
  const specialties = useMemo(() => {
    return [
      content.controls.allSpecialties,
      ...Array.from(new Set(doctors.map((d) => d.specialty))),
    ];
  }, [content.controls.allSpecialties, doctors]);

  const filteredDoctors = doctors;
  const totalPages = Math.max(1, content.meta.totalPages);
  const effectivePage = content.meta.page;
  const startIndex = (effectivePage - 1) * content.meta.limit;
  const pageDoctors = doctors;

  // Currently selected doctor
  const selectedDoctor = doctorDetailQuery.data ? toAdminDoctorDetail(doctorDetailQuery.data.doctor) : null;

  const updateMutation = useMutation({
    mutationFn: (doctor: AdminDoctor) => cmsApi.doctors.update(doctor.id, {
      status: doctor.status === 'published' ? 'PUBLISHED' : doctor.status === 'archived' ? 'ARCHIVED' : 'DRAFT', featured: doctor.featuredDoctor,
      slug: doctor.seo?.slug, displayOrder: doctor.displayOrder ?? 0, nameEn: doctor.name, nameKm: doctor.nameKm ?? '', titleEn: doctor.roleTitle || null, titleKm: doctor.roleTitleKm || null, specialtyEn: doctor.specialty || null, specialtyKm: doctor.specialtyKm || null,
      shortBioEn: doctor.shortIntro || null, shortBioKm: doctor.shortIntroKm || null, aboutEn: doctor.content || null, aboutKm: doctor.contentKm || null, photoKey: doctor.photoKey ?? null,
      yearsExperience: Number.parseInt(doctor.yearsExp, 10) || null, successfulProcedures: Number.parseInt(doctor.procedures, 10) || null,
      patientSatisfaction: Number.parseInt(doctor.satisfaction, 10) || null, phone: doctor.contactPhone || null,
      expertise: doctor.expertiseItems?.map((item, displayOrder) => ({ ...item, displayOrder })) ?? [],
      education: doctor.educationItems?.map((item, displayOrder) => ({ ...item, displayOrder })) ?? [],
      relatedDoctorIds: doctor.relatedDoctorIds ?? [],
    }),
    onSuccess: () => { setActionError(null); void invalidateCmsDomain(queryClient, 'doctors'); },
    onError: () => setActionError('Unable to save this doctor. Please check the form and try again.'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsApi.doctors.delete(id),
    onSuccess: () => { setSelectedId(null); setActionError(null); void invalidateCmsDomain(queryClient, 'doctors'); },
    onError: (error: unknown) => setActionError(error instanceof Error && 'code' in error && error.code === 'DOCTOR_IN_USE' ? 'This doctor is used by appointment history. Unpublish the profile instead.' : 'Unable to delete this doctor.'),
  });
  const handleSaveDoctor = (updated: AdminDoctor) => updateMutation.mutate(updated);
  const handleDeleteDoctor = (id: string) => deleteMutation.mutate(id);

  const handleAddDoctor = (newDoc: AdminDoctor) => {
    setDoctors((prev) => [newDoc, ...prev]);
    setSelectedId(newDoc.id);
    onListStateChange({ ...listState, page: 1 });
  };

  return (
    <main className="min-w-0 flex-1 bg-[#f6f8fb] px-5 py-7 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1440px] w-full">
      {actionError ? <p className="mb-4 rounded-xl border border-[#fecaca] bg-[#fff1f2] p-3 text-sm text-[#b91c1c]" role="alert">{actionError}</p> : null}
      {/* Top Header */}
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.6px] text-[#182238] sm:text-[33px]">
            {content.header.title}
          </h1>
          <p className="mt-1 text-[16px] text-[#71839e] sm:text-[17px]">
            {content.header.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#dce5ef] bg-white px-4 text-[14px] font-medium text-[#71839e] shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <AdminIcon className="size-4 text-[#71839e]" name="calendar" />
            {content.controls.dateLabel}
          </div>
          <Button
            className="h-[46px] rounded-xl bg-[#2187a8] px-5 text-[14px] font-bold text-white shadow-[0_6px_14px_rgba(33,135,168,0.2)] hover:bg-[#1a718c]"
            icon={<span aria-hidden="true" className="text-lg leading-none font-bold">+</span>}
            onClick={() => navigate('/admin/doctors/new')}
          >
            {content.controls.addLabel}
          </Button>
        </div>
      </header>
      {/* Empty State: no doctors exist at all */}
      {content.meta.total === 0 && !listState.search && !listState.specialty && !listState.status ? (
        <DoctorsEmptyState onAddDoctor={() => navigate('/admin/doctors/new')} />
      ) : (
      /* Main 2-Column Grid */
      <div className="mt-8 grid gap-7 2xl:grid-cols-[minmax(0,1fr)_480px] xl:grid-cols-[minmax(0,1fr)_440px]">
        {/* Left Column: Card containing Filters + Table + Pagination */}
        <Card className="flex flex-col overflow-hidden rounded-[28px] border-[#e1e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
          {/* Filters inside card header */}
          <div className="flex flex-wrap items-center gap-3 pb-6">
            {/* Search Input */}
            <label className="flex h-11 min-w-[200px] flex-1 items-center gap-3 rounded-xl border border-[#e1e8f0] bg-[#f9fbfd] px-4 text-[#9badc5] focus-within:border-[#2187a8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#d9f0f7]">
              <AdminIcon className="size-4 shrink-0 text-[#9badc5]" name="search" />
              <span className="sr-only">Search doctors</span>
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
            <label className="flex h-11 items-center rounded-xl border border-[#e1e8f0] bg-white px-3.5 text-[#71839e] focus-within:border-[#2187a8] focus-within:ring-2 focus-within:ring-[#d9f0f7]">
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
            <label className="flex h-11 items-center rounded-xl border border-[#e1e8f0] bg-white px-3.5 text-[#71839e] focus-within:border-[#2187a8] focus-within:ring-2 focus-within:ring-[#d9f0f7]">
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
                <option value="Draft">Draft</option>
              </select>
            </label>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#f0f4f8] text-[11px] font-bold uppercase tracking-[0.5px] text-[#8699b0]">
                  <th className="pb-3.5 pt-1 font-bold">{content.table.doctor}</th>
                  <th className="pb-3.5 pt-1 font-bold">{content.table.specialty}</th>
                  <th className="pb-3.5 pt-1 font-bold">{content.table.status}</th>
                  <th className="pb-3.5 pt-1 text-right font-bold">{content.table.updated}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4f8]">
                {pageDoctors.map((doc) => {
                  const isSelected = doc.id === selectedId;
                  return (
                    <tr
                      aria-selected={isSelected}
                      className={`cursor-pointer transition-colors hover:bg-[#f8fbfd] ${
                        isSelected ? 'bg-[#f0f7fa]' : ''
                      }`}
                      key={doc.id}
                      onClick={() => setSelectedId(isSelected ? null : doc.id)}
                    >
                      {/* Doctor info */}
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3.5">
                          <DoctorAvatar doctor={doc} size="md" />
                          <div>
                            <span className="block text-[15px] font-bold text-[#182238]">
                              {doc.name}
                            </span>
                            <span className="mt-0.5 block text-[13px] text-[#71839e]">
                              {doc.roleTitle}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Specialty */}
                      <td className="py-4 pr-4 text-[14px] text-[#71839e]">
                        {doc.specialty}
                      </td>

                      {/* Status badge */}
                      <td className="py-4 pr-4">
                        <StatusBadge status={doc.status} />
                      </td>

                      {/* Updated Date */}
                      <td className="py-4 text-right text-[13px] text-[#8a9bb2]">
                        {doc.updatedAt}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State (search/filter yielded no results) */}
          {filteredDoctors.length === 0 ? (
            <div className="grid min-h-[220px] place-items-center px-6 text-center">
              <div>
                <h3 className="text-lg font-bold text-[#182238]">{content.empty.title}</h3>
                <p className="mt-2 text-[14px] text-[#71839e]">{content.empty.description}</p>
              </div>
            </div>
          ) : null}

          {/* Pagination */}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-[#f0f4f8] pt-6 text-[13px] text-[#8a9bb2]">
            <span>
              Showing {filteredDoctors.length > 0 ? startIndex + 1 : 0} to{' '}
              {startIndex + filteredDoctors.length} of {content.meta.total}{' '}
              specialists
            </span>

            <div className="flex items-center gap-1.5">
              <button
                aria-label="Previous page"
                className="grid size-8 place-items-center rounded-lg border border-[#dce5ef] bg-white text-[#71839e] transition hover:bg-[#f4f8fb] disabled:pointer-events-none disabled:opacity-40"
                disabled={effectivePage <= 1}
                onClick={() => onListStateChange({ ...listState, page: Math.max(1, effectivePage - 1) })}
                type="button"
              >
                <AdminIcon className="size-3.5 rotate-180" name="chevronRight" />
              </button>
              <span className="px-2 font-semibold text-[#61738d]">Page {effectivePage} of {totalPages}</span>
              <button
                aria-label="Next page"
                className="grid size-8 place-items-center rounded-lg border border-[#dce5ef] bg-white text-[#71839e] transition hover:bg-[#f4f8fb] disabled:pointer-events-none disabled:opacity-40"
                disabled={effectivePage >= totalPages}
                onClick={() => onListStateChange({ ...listState, page: Math.min(totalPages, effectivePage + 1) })}
                type="button"
              >
                <AdminIcon className="size-3.5" name="chevronRight" />
              </button>
            </div>
          </div>
        </Card>

        {/* Right Column: Doctor Detail & Edit Panel OR No Selection State */}
        {selectedDoctor ? (
          <DoctorDetailPanel
            doctor={selectedDoctor}
            onClose={() => setSelectedId(null)}
            onDelete={handleDeleteDoctor}
            onSave={handleSaveDoctor}
          />
        ) : (
          <NoDoctorSelectedPanel />
        )}
      </div>
      )} {/* end doctors.length === 0 ternary */}

      <DoctorsFooter footer={content.footer} />

      {/* Add Specialist Modal */}
      </div>
      <AddDoctorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreate={handleAddDoctor}
      />
    </main>
  );
}

function DoctorsSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading doctor management"
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
        <h1 className="text-2xl font-bold text-[#182238]">Doctor Management is unavailable</h1>
        <p className="mt-3 text-[#71839e]">
          Unable to retrieve specialist profiles. Please try again.
        </p>
        <Button className="mt-6 bg-[#2187a8] text-white" onClick={onRetry}>
          Retry
        </Button>
      </Card>
    </main>
  );
}

export function AdminDoctorsPage() {
  const [listState, setListState] = useState<DoctorListState>({ page: 1, limit: 20, sort: 'displayOrder', order: 'asc' });
  const { data, isError, isLoading, refetch } = useAdminDoctorsPageQuery(listState);

  if (isLoading) {
    return <DoctorsSkeleton />;
  }

  if (isError || !data) {
    return <DoctorsUnavailable onRetry={() => void refetch()} />;
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:flex">
      <AdminSidebar activeLabel="Doctor Management" brand={data.brand} navigation={data.navigation} />
      <DoctorsContent content={data} listState={listState} onListStateChange={setListState} />
    </div>
  );
}
