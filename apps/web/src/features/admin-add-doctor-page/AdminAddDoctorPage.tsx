import { useState, useRef, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AdminIcon, AdminSidebar } from '@/components/layout/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  useAdminAddDoctorPageQuery,
  useCreateDoctorMutation,
} from './use-admin-add-doctor-page';
import type { NewDoctorFormState } from '@/services/admin-add-doctor';

export function AdminAddDoctorPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useAdminAddDoctorPageQuery();
  const createMutation = useCreateDoctorMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [yearsExp, setYearsExp] = useState('');
  const [shortIntro, setShortIntro] = useState('');
  const [content, setContent] = useState('');
  const [procedures, setProcedures] = useState('');
  const [satisfaction, setSatisfaction] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [showOnWebsite, setShowOnWebsite] = useState(true);

  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Expertise tags
  const [expertiseList, setExpertiseList] = useState<string[]>([
    'Digital Dental Implants',
    'Full Mouth Rehabilitation',
    'Bone Grafting Procedures',
    'Cosmetic Smile Makeovers',
    'Advanced Oral Surgery',
  ]);
  const [expertiseInput, setExpertiseInput] = useState('');

  // UI state
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePhotoSelect = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit. Please choose a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handlePhotoSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAddExpertise = () => {
    const trimmed = expertiseInput.trim();
    if (trimmed && !expertiseList.includes(trimmed)) {
      setExpertiseList((prev) => [...prev, trimmed]);
      setExpertiseInput('');
    }
  };

  const handleRemoveExpertise = (tagToRemove: string) => {
    setExpertiseList((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleExpertiseKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddExpertise();
    }
  };

  const handleInsertFormat = (tagOpen: string, tagClose: string = '') => {
    setContent((prev) => `${prev} ${tagOpen}${tagClose} `);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!roleTitle.trim()) newErrors.roleTitle = 'Position/Title is required';
    if (!specialty.trim()) newErrors.specialty = 'Specialization is required';
    if (!yearsExp.trim()) newErrors.yearsExp = 'Experience is required';
    if (!shortIntro.trim()) newErrors.shortIntro = 'Short bio is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) {
      window.scrollTo({ behavior: 'smooth', top: 0 });
      return;
    }

    const payload: NewDoctorFormState = {
      contactEmail,
      contactPhone,
      content,
      expertise: expertiseList,
      name,
      photoUrl: photoPreview || '',
      procedures: procedures || '0',
      roleTitle,
      satisfaction: satisfaction || '100%',
      shortIntro,
      showOnWebsite,
      specialty,
      status,
      yearsExp,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        setIsSaved(true);
        setTimeout(() => {
          navigate('/admin/doctors');
        }, 800);
      },
    });
  };

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen bg-[#f6f8fb]">
        <div className="min-w-0 flex-1 p-8">
          <div className="h-8 w-60 animate-pulse rounded-lg bg-[#e2e8f0]" />
          <div className="mt-8 grid gap-7 lg:grid-cols-2">
            <div className="h-96 animate-pulse rounded-2xl bg-white" />
            <div className="h-96 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:flex">
      {/* Left Sidebar */}
      <AdminSidebar
        activeLabel="Add New Doctor"
        brand={data.brand}
        navigation={data.navigation}
      />

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-8">
        {/* Success toast banner */}
        {isSaved && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-[#15803d] shadow-sm">
            <svg className="size-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                clipRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                fillRule="evenodd"
              />
            </svg>
            <span className="font-semibold">Specialist profile saved successfully! Redirecting...</span>
          </div>
        )}

        {/* Breadcrumbs & Header */}
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[14px]">
            <Link
              className="text-[#71839e] transition hover:text-[#2187a8]"
              to="/admin/doctors"
            >
              Doctors
            </Link>
            <span className="text-[#a0aec0]">›</span>
            <span className="font-semibold text-[#2187a8]">Add New Doctor</span>
          </nav>

          <header className="mt-2.5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-bold tracking-[-0.6px] text-[#182238] sm:text-[32px]">
                {data.header.title}
              </h1>
              <p className="mt-1 text-[15px] text-[#71839e]">
                {data.header.subtitle}
              </p>
            </div>

            {/* Date Badge */}
            <div className="inline-flex h-[44px] items-center gap-2.5 rounded-xl border border-[#dce5ef] bg-white px-4 text-[13.5px] font-medium text-[#71839e] shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <AdminIcon className="size-4 text-[#71839e]" name="calendar" />
              <span>{data.header.dateLabel}</span>
            </div>
          </header>
        </div>

        {/* Form Container */}
        <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
          {/* Main 2-Column Grid */}
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1.05fr)]">
            {/* Left Column */}
            <div className="space-y-7">
              {/* Card 1: Basic Information */}
              <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 sm:p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
                <h2 className="text-[18px] font-bold text-[#182238]">Basic Information</h2>

                {/* Profile Photo Upload */}
                <div className="mt-5">
                  <label className="block text-[13px] font-bold text-[#182238]">
                    Profile Photo <span className="text-[#ef4444]">*</span>
                  </label>

                  <div className="mt-2.5 flex flex-col gap-4 sm:flex-row sm:items-stretch">
                    {/* Drag and Drop Zone */}
                    <div
                      className="group relative flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#b8d6e7] bg-[#f8fbfe] p-6 text-center transition hover:border-[#2187a8] hover:bg-[#f0f7fb]"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                    >
                      <input
                        accept="image/png, image/jpeg, image/webp"
                        className="sr-only"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          if (e.target.files?.[0]) handlePhotoSelect(e.target.files[0]);
                        }}
                        ref={fileInputRef}
                        type="file"
                      />

                      {photoPreview ? (
                        <div className="flex flex-col items-center gap-3">
                          <img
                            alt="Doctor preview"
                            className="size-20 rounded-2xl object-cover shadow-sm ring-2 ring-[#2187a8]"
                            src={photoPreview}
                          />
                          <div className="flex gap-2">
                            <button
                              className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-[#2187a8] shadow-sm hover:bg-[#f8fbfe]"
                              onClick={() => fileInputRef.current?.click()}
                              type="button"
                            >
                              Change
                            </button>
                            <button
                              className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-[#ef4444] shadow-sm hover:bg-[#f8fbfe]"
                              onClick={() => setPhotoPreview(null)}
                              type="button"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="flex flex-col items-center focus:outline-none"
                          onClick={() => fileInputRef.current?.click()}
                          type="button"
                        >
                          <div className="grid size-12 place-items-center rounded-2xl bg-[#edf7fb] text-[#2187a8] transition group-hover:scale-105">
                            <svg
                              className="size-6"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                            </svg>
                          </div>
                          <p className="mt-3 text-[14px] text-[#71839e]">
                            <span className="font-bold text-[#182238]">Click to upload</span> or drag and drop
                          </p>
                          <p className="mt-1 text-[12px] text-[#9badc5]">
                            PNG, JPG or WEBP (Max. 2MB)
                          </p>
                        </button>
                      )}
                    </div>

                    {/* Tips Box */}
                    <div className="rounded-2xl bg-[#edf7fc] p-5 sm:w-[250px]">
                      <p className="text-[13px] font-bold text-[#2187a8]">Tips:</p>
                      <ul className="mt-2 space-y-2 text-[12px] leading-relaxed text-[#55809e]">
                        {data.tips.map((tip, idx) => (
                          <li className="flex items-start gap-2" key={idx}>
                            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#2187a8]" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Form Inputs Grid */}
                <div className="mt-6 space-y-5">
                  {/* Row 1: Full Name & Position / Title */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[13px] font-bold text-[#182238]">
                        Full Name <span className="text-[#ef4444]">*</span>
                      </label>
                      <input
                        className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3.5 text-[14px] text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7] ${
                          errors.name ? 'border-[#ef4444]' : 'border-[#dce5ef]'
                        }`}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                        }}
                        placeholder="Enter doctor full name"
                        type="text"
                        value={name}
                      />
                      {errors.name && (
                        <p className="mt-1 text-[12px] text-[#ef4444]">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-[#182238]">
                        Position / Title <span className="text-[#ef4444]">*</span>
                      </label>
                      <input
                        className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3.5 text-[14px] text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7] ${
                          errors.roleTitle ? 'border-[#ef4444]' : 'border-[#dce5ef]'
                        }`}
                        onChange={(e) => {
                          setRoleTitle(e.target.value);
                          if (errors.roleTitle) setErrors((prev) => ({ ...prev, roleTitle: '' }));
                        }}
                        placeholder="e.g. Asst. Prof."
                        type="text"
                        value={roleTitle}
                      />
                      {errors.roleTitle && (
                        <p className="mt-1 text-[12px] text-[#ef4444]">{errors.roleTitle}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Specialization / Designation & Experience */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[13px] font-bold text-[#182238]">
                        Specialization / Designation <span className="text-[#ef4444]">*</span>
                      </label>
                      <input
                        className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3.5 text-[14px] text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7] ${
                          errors.specialty ? 'border-[#ef4444]' : 'border-[#dce5ef]'
                        }`}
                        onChange={(e) => {
                          setSpecialty(e.target.value);
                          if (errors.specialty) setErrors((prev) => ({ ...prev, specialty: '' }));
                        }}
                        placeholder="e.g. Senior Implant Specialist"
                        type="text"
                        value={specialty}
                      />
                      {errors.specialty && (
                        <p className="mt-1 text-[12px] text-[#ef4444]">{errors.specialty}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-[#182238]">
                        Experience <span className="text-[#ef4444]">*</span>
                      </label>
                      <div className="relative mt-1.5">
                        <input
                          className={`h-11 w-full rounded-xl border bg-white pl-3.5 pr-14 text-[14px] text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7] ${
                            errors.yearsExp ? 'border-[#ef4444]' : 'border-[#dce5ef]'
                          }`}
                          onChange={(e) => {
                            setYearsExp(e.target.value);
                            if (errors.yearsExp) setErrors((prev) => ({ ...prev, yearsExp: '' }));
                          }}
                          placeholder="e.g. 25+"
                          type="text"
                          value={yearsExp}
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[13px] font-medium text-[#8a9bb2]">
                          Years
                        </span>
                      </div>
                      {errors.yearsExp && (
                        <p className="mt-1 text-[12px] text-[#ef4444]">{errors.yearsExp}</p>
                      )}
                    </div>
                  </div>

                  {/* Short Bio */}
                  <div>
                    <label className="block text-[13px] font-bold text-[#182238]">
                      Short Bio <span className="text-[#ef4444]">*</span>
                    </label>
                    <p className="mt-0.5 text-[12px] text-[#8a9bb2]">
                      A short introduction about the doctor (shown on doctor detail page)
                    </p>
                    <div className="relative mt-2">
                      <textarea
                        className={`h-24 w-full resize-none rounded-xl border bg-white p-3.5 pb-7 text-[14px] text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7] ${
                          errors.shortIntro ? 'border-[#ef4444]' : 'border-[#dce5ef]'
                        }`}
                        maxLength={160}
                        onChange={(e) => {
                          setShortIntro(e.target.value);
                          if (errors.shortIntro) setErrors((prev) => ({ ...prev, shortIntro: '' }));
                        }}
                        placeholder="Enter short bio (max 160 characters)"
                        value={shortIntro}
                      />
                      <span className="pointer-events-none absolute bottom-2 right-3 text-[11px] font-medium text-[#9badc5]">
                        {shortIntro.length}/160
                      </span>
                    </div>
                    {errors.shortIntro && (
                      <p className="mt-1 text-[12px] text-[#ef4444]">{errors.shortIntro}</p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Card 2: About the Doctor */}
              <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 sm:p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
                <h2 className="text-[18px] font-bold text-[#182238]">About the Doctor</h2>
                <p className="mt-1 text-[13px] text-[#8a9bb2]">
                  Detailed information about the doctor, experience, philosophy, and approach.
                </p>

                {/* Editor Container */}
                <div className="mt-4 overflow-hidden rounded-2xl border border-[#dce5ef] transition focus-within:border-[#2187a8] focus-within:ring-2 focus-within:ring-[#d9f0f7]">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 border-b border-[#edf2f7] bg-[#f9fbfd] px-3 py-2 text-[#71839e]">
                    <button
                      className="rounded p-1.5 font-bold hover:bg-white hover:text-[#182238]"
                      onClick={() => handleInsertFormat('**', '**')}
                      title="Bold"
                      type="button"
                    >
                      B
                    </button>
                    <button
                      className="rounded p-1.5 italic hover:bg-white hover:text-[#182238]"
                      onClick={() => handleInsertFormat('*', '*')}
                      title="Italic"
                      type="button"
                    >
                      <span className="italic">I</span>
                    </button>
                    <button
                      className="rounded p-1.5 underline hover:bg-white hover:text-[#182238]"
                      onClick={() => handleInsertFormat('<u>', '</u>')}
                      title="Underline"
                      type="button"
                    >
                      <u>U</u>
                    </button>

                    <div className="mx-1 h-4 w-px bg-[#dce5ef]" />

                    {/* Bullet List */}
                    <button
                      className="rounded p-1.5 hover:bg-white hover:text-[#182238]"
                      onClick={() => handleInsertFormat('\n• ')}
                      title="Bullet list"
                      type="button"
                    >
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>

                    {/* Numbered List */}
                    <button
                      className="rounded p-1.5 hover:bg-white hover:text-[#182238]"
                      onClick={() => handleInsertFormat('\n1. ')}
                      title="Numbered list"
                      type="button"
                    >
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M4 14h2a1 1 0 011 1v1a1 1 0 01-1 1H4h3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>

                    <div className="mx-1 h-4 w-px bg-[#dce5ef]" />

                    {/* Align Left */}
                    <button
                      className="rounded p-1.5 hover:bg-white hover:text-[#182238]"
                      onClick={() => {}}
                      title="Align Left"
                      type="button"
                    >
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M4 6h16M4 12h10M4 18h14" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>

                    {/* Align Center */}
                    <button
                      className="rounded p-1.5 hover:bg-white hover:text-[#182238]"
                      onClick={() => {}}
                      title="Align Center"
                      type="button"
                    >
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M4 6h16M7 12h10M5 18h14" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>

                    <div className="mx-1 h-4 w-px bg-[#dce5ef]" />

                    {/* Link */}
                    <button
                      className="rounded p-1.5 hover:bg-white hover:text-[#182238]"
                      onClick={() => handleInsertFormat('[', '](https://)')}
                      title="Insert Link"
                      type="button"
                    >
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>

                    {/* Unlink / Strike */}
                    <button
                      className="rounded p-1.5 hover:bg-white hover:text-[#182238]"
                      onClick={() => handleInsertFormat('~~', '~~')}
                      title="Strikethrough"
                      type="button"
                    >
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 12h14M16 6c-.8-1-2-1.5-4-1.5-3 0-4.5 1.5-4.5 3.5 0 1.5.8 2.5 2.5 3M8 18c.8 1 2 1.5 4 1.5 3 0 4.5-1.5 4.5-3.5 0-1-.5-2-1.5-2.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>

                  {/* Body Textarea */}
                  <div className="relative bg-white">
                    <textarea
                      className="min-h-[220px] w-full resize-none p-4 pb-8 text-[14px] leading-relaxed text-[#182238] outline-none placeholder:text-[#a9b7c9]"
                      maxLength={2000}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter detailed description..."
                      value={content}
                    />
                    <span className="pointer-events-none absolute bottom-3 right-4 text-[11px] font-medium text-[#9badc5]">
                      {content.length}/2000
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-7">
              {/* Card 3: Professional Statistics */}
              <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
                <h2 className="text-[18px] font-bold text-[#182238]">Professional Statistics</h2>
                <p className="mt-1 text-[13px] text-[#8a9bb2]">
                  These will be displayed on the doctor detail page.
                </p>

                <div className="mt-5 space-y-4">
                  {/* Years of Experience */}
                  <div>
                    <label className="flex items-center gap-2 text-[13px] font-bold text-[#182238]">
                      <svg className="size-4 text-[#2187a8]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>Years of Experience <span className="text-[#ef4444]">*</span></span>
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        className="h-11 w-full rounded-xl border border-[#dce5ef] bg-white pl-3.5 pr-14 text-[14px] text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                        onChange={(e) => setYearsExp(e.target.value)}
                        placeholder="e.g. 25+"
                        type="text"
                        value={yearsExp}
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[13px] font-medium text-[#8a9bb2]">
                        Years
                      </span>
                    </div>
                  </div>

                  {/* Successful Procedures */}
                  <div>
                    <label className="flex items-center gap-2 text-[13px] font-bold text-[#182238]">
                      <svg className="size-4 text-[#2187a8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                      <span>Successful Procedures <span className="text-[#ef4444]">*</span></span>
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        className="h-11 w-full rounded-xl border border-[#dce5ef] bg-white pl-3.5 pr-24 text-[14px] text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                        onChange={(e) => setProcedures(e.target.value)}
                        placeholder="e.g. 10k+"
                        type="text"
                        value={procedures}
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[13px] font-medium text-[#8a9bb2]">
                        Procedures
                      </span>
                    </div>
                  </div>

                  {/* Patient Satisfaction */}
                  <div>
                    <label className="flex items-center gap-2 text-[13px] font-bold text-[#182238]">
                      <svg className="size-4 text-[#2187a8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                      <span>Patient Satisfaction <span className="text-[#ef4444]">*</span></span>
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        className="h-11 w-full rounded-xl border border-[#dce5ef] bg-white pl-3.5 pr-10 text-[14px] text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                        onChange={(e) => setSatisfaction(e.target.value)}
                        placeholder="e.g. 99%"
                        type="text"
                        value={satisfaction}
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[13px] font-medium text-[#8a9bb2]">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 4: Areas of Expertise */}
              <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
                <h2 className="text-[18px] font-bold text-[#182238]">Areas of Expertise</h2>
                <p className="mt-1 text-[13px] text-[#8a9bb2]">
                  Add doctor expertise. These will appear as list on the website.
                </p>

                <div className="mt-5">
                  <label className="block text-[13px] font-bold text-[#182238]">
                    Add Expertise <span className="text-[#ef4444]">*</span>
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      className="h-11 flex-1 rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[14px] text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                      onChange={(e) => setExpertiseInput(e.target.value)}
                      onKeyDown={handleExpertiseKeyDown}
                      placeholder="Enter expertise and press Enter"
                      type="text"
                      value={expertiseInput}
                    />
                    <Button
                      className="h-11 rounded-xl bg-[#2187a8] px-5 text-[14px] font-bold text-white shadow-sm hover:bg-[#1a718c]"
                      onClick={handleAddExpertise}
                      type="button"
                    >
                      Add
                    </Button>
                  </div>

                  {/* Pills List */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {expertiseList.map((tag) => (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#d0e8f2] bg-[#edf7fb] px-3.5 py-1.5 text-[12.5px] font-semibold text-[#2187a8]"
                        key={tag}
                      >
                        {tag}
                        <button
                          aria-label={`Remove ${tag}`}
                          className="grid size-4 place-items-center rounded-full text-[#2187a8] transition hover:bg-[#d8edf6]"
                          onClick={() => handleRemoveExpertise(tag)}
                          type="button"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Card 5: Contact Information */}
              <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
                <h2 className="text-[18px] font-bold text-[#182238]">Contact Information</h2>

                <div className="mt-5 space-y-4">
                  {/* Phone Number */}
                  <div>
                    <label className="block text-[13px] font-bold text-[#182238]">
                      Phone Number
                    </label>
                    <div className="relative mt-1.5">
                      <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#8a9bb2]">
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </span>
                      <input
                        className="h-11 w-full rounded-xl border border-[#dce5ef] bg-white pl-10 pr-3.5 text-[14px] text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="e.g. +855 23 456 789"
                        type="tel"
                        value={contactPhone}
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-[13px] font-bold text-[#182238]">
                      Email Address
                    </label>
                    <div className="relative mt-1.5">
                      <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#8a9bb2]">
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </span>
                      <input
                        className="h-11 w-full rounded-xl border border-[#dce5ef] bg-white pl-10 pr-3.5 text-[14px] text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="e.g. doctor.email@example.com"
                        type="email"
                        value={contactEmail}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 6: Publish Settings */}
              <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
                <h2 className="text-[18px] font-bold text-[#182238]">Publish Settings</h2>

                <div className="mt-5 space-y-3">
                  <span className="block text-[13px] font-bold text-[#182238]">Status</span>

                  {/* Radio Published */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 transition hover:bg-[#f8fafc]">
                    <input
                      checked={status === 'published'}
                      className="mt-1 size-4 accent-[#2187a8]"
                      name="status"
                      onChange={() => setStatus('published')}
                      type="radio"
                    />
                    <div>
                      <span className="block text-[14px] font-bold text-[#182238]">Published</span>
                      <span className="block text-[12px] text-[#8a9bb2]">Visible on website</span>
                    </div>
                  </label>

                  {/* Radio Draft */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 transition hover:bg-[#f8fafc]">
                    <input
                      checked={status === 'draft'}
                      className="mt-1 size-4 accent-[#2187a8]"
                      name="status"
                      onChange={() => setStatus('draft')}
                      type="radio"
                    />
                    <div>
                      <span className="block text-[14px] font-bold text-[#182238]">Draft</span>
                      <span className="block text-[12px] text-[#8a9bb2]">Save as draft, not visible on website</span>
                    </div>
                  </label>
                </div>

                <div className="my-5 border-t border-[#f0f4f8]" />

                {/* Display on Website Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[#182238]">Display on Website</span>
                  <button
                    aria-pressed={showOnWebsite}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2187a8] focus:ring-offset-2 ${
                      showOnWebsite ? 'bg-[#2187a8]' : 'bg-[#dce5ef]'
                    }`}
                    onClick={() => setShowOnWebsite((prev) => !prev)}
                    type="button"
                  >
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        showOnWebsite ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </Card>
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="flex items-center justify-center gap-4 pt-4 pb-10">
            <Button
              className="h-11 rounded-xl border border-[#dce5ef] bg-white px-7 text-[14px] font-semibold text-[#71839e] shadow-sm hover:bg-[#f8fafc]"
              onClick={() => navigate('/admin/doctors')}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              className="flex h-11 items-center gap-2 rounded-xl bg-[#2187a8] px-7 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(33,135,168,0.25)] hover:bg-[#1a718c]"
              disabled={createMutation.isPending}
              type="submit"
            >
              <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l6-6a1 1 0 00-1.414-1.414l-5.293 5.293-2.293-2.293z" />
              </svg>
              <span>{createMutation.isPending ? 'Saving...' : 'Save Doctor'}</span>
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

