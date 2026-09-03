import { useState, useRef, useId, type ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AdminIcon, AdminSidebar } from '@/components/layout/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  useAdminAddShowcasePageQuery,
  useCreateShowcaseArticleMutation,
} from './use-admin-add-showcase-page';
import type {
  NewShowcaseFormState,
  SectionBlock,
} from '@/services/admin-add-showcase';
import type { ShowcaseCategory, ShowcaseStatus } from '@/services/admin-showcase';

function ToggleSwitch({
  checked,
  id,
  label,
  onChange,
}: {
  checked: boolean;
  id?: string;
  label?: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      aria-label={label ?? 'Toggle switch'}
      aria-pressed={checked}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2187a8] focus:ring-offset-2 ${
        checked ? 'bg-[#2187a8]' : 'bg-[#dce5ef]'
      }`}
      id={id}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <span
        className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function AdminAddShowcasePage() {
  const navigate = useNavigate();
  const fileInputId = useId();
  const homepageVisibilityToggleId = useId();
  const showOnHomepageToggleId = useId();
  const { data, isLoading } = useAdminAddShowcasePageQuery();
  const createMutation = useCreateShowcaseArticleMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [category, setCategory] = useState<ShowcaseCategory | ''>('');
  const [status, setStatus] = useState<ShowcaseStatus>('draft');
  const [homepageVisibility, setHomepageVisibility] = useState(true);

  // Cover Content
  const [coverImageUrl, setCoverImageUrl] = useState<string>('/assets/landing/showcase-toothbrush.png');
  const [headline, setHeadline] = useState('');
  const [shortSummary, setShortSummary] = useState('');

  // Detail Page Content
  const [bodyContent, setBodyContent] = useState('');
  const [sectionBlocks, setSectionBlocks] = useState<SectionBlock[]>([
    { content: 'Detailed points regarding the first topic.', id: 's1', title: 'Section 1' },
    { content: 'Further elaboration on the clinical approach.', id: 's2', title: 'Section 2' },
    { content: 'Post-treatment instructions and advice.', id: 's3', title: 'Section 3' },
  ]);

  // CTA & Related Content
  const [primaryCtaText, setPrimaryCtaText] = useState('Book an Appointment');
  const [secondaryCtaText, setSecondaryCtaText] = useState('Request Consultation');
  const [selectedRelatedIds, setSelectedRelatedIds] = useState<string[]>([
    'benefits-of-dental-implants',
  ]);

  // SEO & Publishing
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Right Column Homepage Card Settings
  const [showOnHomepage, setShowOnHomepage] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [cardSummary, setCardSummary] = useState('');

  // UI status
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugCustomized) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      );
    }
  };

  const handleSlugChange = (val: string) => {
    setIsSlugCustomized(true);
    setSlug(val);
  };

  const handlePhotoSelect = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit. Please choose a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handlePhotoSelect(e.dataTransfer.files[0]);
    }
  };

  const toggleRelatedItem = (id: string) => {
    setSelectedRelatedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        alert('You can select up to 3 related showcase articles.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleAddSectionBlock = () => {
    const nextIdx = sectionBlocks.length + 1;
    const newBlock: SectionBlock = {
      content: 'Enter section content details...',
      id: `section-${Date.now()}`,
      title: `Section ${nextIdx}`,
    };
    setSectionBlocks((prev) => [...prev, newBlock]);
  };

  const handleDeleteSectionBlock = (id: string) => {
    setSectionBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleInsertFormat = (tagOpen: string, tagClose: string = '') => {
    setBodyContent((prev) => `${prev} ${tagOpen}${tagClose} `);
  };

  const wordCount = bodyContent.trim() ? bodyContent.trim().split(/\s+/).length : 0;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Showcase title is required';
    if (!slug.trim()) newErrors.slug = 'Slug / URL is required';
    if (!category) newErrors.category = 'Category is required';
    if (!headline.trim()) newErrors.headline = 'Headline is required';
    if (!shortSummary.trim()) newErrors.shortSummary = 'Short summary is required';
    if (!bodyContent.trim()) newErrors.bodyContent = 'Body content is required';
    if (!primaryCtaText.trim()) newErrors.primaryCtaText = 'Primary CTA text is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (chosenStatus?: ShowcaseStatus) => {
    if (!validate()) {
      window.scrollTo({ behavior: 'smooth', top: 0 });
      return;
    }

    const payload: NewShowcaseFormState = {
      bodyContent,
      cardSummary: cardSummary || shortSummary,
      category,
      coverImageUrl,
      displayOrder,
      headline,
      homepageVisibility,
      metaDescription,
      metaTitle,
      primaryCtaText,
      relatedShowcaseIds: selectedRelatedIds,
      secondaryCtaText,
      sectionBlocks,
      shortSummary,
      showOnHomepage,
      slug,
      status: chosenStatus || status,
      title,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        setIsSaved(true);
        setTimeout(() => {
          navigate('/admin/showcase');
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

  // Checklist completion flags for the Live Preview Structure card
  const checklist = [
    { completed: Boolean(coverImageUrl), label: 'Cover Image' },
    { completed: Boolean(headline.trim()), label: 'Headline' },
    { completed: Boolean(shortSummary.trim()), label: 'Short Summary' },
    { completed: Boolean(bodyContent.trim()), label: 'Body Content' },
    { completed: sectionBlocks.length > 0, label: 'Section Blocks' },
    { completed: Boolean(primaryCtaText.trim()), label: 'CTA Buttons' },
    { completed: selectedRelatedIds.length > 0, label: 'Related Showcase' },
  ];

  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:flex">
      {/* Left Sidebar */}
      <AdminSidebar
        activeLabel="Showcase"
        brand={data.brand}
        navigation={data.navigation}
      />

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-[1440px] w-full">
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
            <span className="font-semibold">Showcase article created successfully! Redirecting...</span>
          </div>
        )}

        {/* Breadcrumbs & Header */}
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[14px]">
            <Link
              className="text-[#71839e] transition hover:text-[#2187a8]"
              to="/admin/showcase"
            >
              {data.header.breadcrumb.parent}
            </Link>
            <span className="text-[#a0aec0]">›</span>
            <span className="font-semibold text-[#2187a8]">
              {data.header.breadcrumb.current}
            </span>
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

        {/* 2-Column Grid */}
        <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1.05fr)]">
          {/* Left / Main Column */}
          <div className="space-y-7">
            {/* Card 1: 1. Basic Information */}
            <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 sm:p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
              <h2 className="text-[18px] font-bold text-[#182238]">1. Basic Information</h2>

              <div className="mt-5 space-y-5">
                {/* Row: Showcase Title & Slug / URL */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[13px] font-bold text-[#182238]">
                      Showcase Title <span className="text-[#ef4444]">*</span>
                    </label>
                    <input
                      className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3.5 text-[14px] text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7] ${
                        errors.title ? 'border-[#ef4444]' : 'border-[#dce5ef]'
                      }`}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Enter showcase title"
                      type="text"
                      value={title}
                    />
                    {errors.title && (
                      <p className="mt-1 text-[12px] text-[#ef4444]">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-[#182238]">
                      Slug / URL <span className="text-[#ef4444]">*</span>
                    </label>
                    <input
                      className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3.5 text-[14px] text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7] ${
                        errors.slug ? 'border-[#ef4444]' : 'border-[#dce5ef]'
                      }`}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="enter-showcase-slug"
                      type="text"
                      value={slug}
                    />
                    {errors.slug && (
                      <p className="mt-1 text-[12px] text-[#ef4444]">{errors.slug}</p>
                    )}
                  </div>
                </div>

                {/* Row: Category & Status */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[13px] font-bold text-[#182238]">
                      Category <span className="text-[#ef4444]">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <select
                        className={`h-11 w-full appearance-none rounded-xl border bg-white px-3.5 pr-9 text-[14px] text-[#182238] outline-none transition focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7] ${
                          errors.category ? 'border-[#ef4444]' : 'border-[#dce5ef]'
                        }`}
                        onChange={(e) => setCategory(e.target.value as ShowcaseCategory)}
                        value={category}
                      >
                        <option disabled value="">
                          Select category
                        </option>
                        {data.categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[#8a9bb2]">
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="m19.5 8.25-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                    {errors.category && (
                      <p className="mt-1 text-[12px] text-[#ef4444]">{errors.category}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-[#182238]">
                      Status <span className="text-[#ef4444]">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <select
                        className="h-11 w-full appearance-none rounded-xl border border-[#dce5ef] bg-white px-3.5 pr-9 text-[14px] text-[#182238] outline-none transition focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                        onChange={(e) => setStatus(e.target.value as ShowcaseStatus)}
                        value={status}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="hidden">Hidden</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[#8a9bb2]">
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="m19.5 8.25-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Homepage Visibility */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[13px] font-bold text-[#182238]">
                    Homepage Visibility
                  </span>
                  <ToggleSwitch
                    checked={homepageVisibility}
                    id={homepageVisibilityToggleId}
                    onChange={setHomepageVisibility}
                  />
                  <label
                    className="cursor-pointer text-[13px] text-[#71839e]"
                    htmlFor={homepageVisibilityToggleId}
                  >
                    Show this showcase on homepage cards
                  </label>
                </div>
              </div>
            </Card>

            {/* Card 2: 2. Cover Content */}
            <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 sm:p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
              <h2 className="text-[18px] font-bold text-[#182238]">2. Cover Content</h2>

              <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                {/* Left: Cover Image Dropzone */}
                <div>
                  <label className="block text-[13px] font-bold text-[#182238]">
                    Cover Image <span className="text-[#ef4444]">*</span>
                  </label>

                  <div
                    className="group relative mt-1.5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#b8d6e7] bg-[#f8fbfe] p-6 text-center transition hover:border-[#2187a8] hover:bg-[#f0f7fb]"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <input
                      accept="image/png, image/jpeg, image/webp"
                      className="sr-only"
                      id={fileInputId}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        if (e.target.files?.[0]) handlePhotoSelect(e.target.files[0]);
                      }}
                      ref={fileInputRef}
                      type="file"
                    />

                    {coverImageUrl ? (
                      <div className="flex flex-col items-center gap-2.5">
                        <img
                          alt="Cover preview"
                          className="aspect-video w-full max-w-[200px] rounded-xl object-cover shadow-sm ring-1 ring-[#2187a8]"
                          src={coverImageUrl}
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
                            onClick={() => setCoverImageUrl('')}
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
                        <div className="grid size-12 place-items-center rounded-2xl bg-[#edf7fb] text-[#2187a8]">
                          <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect height="18" rx="2" width="18" x="3" y="3" strokeWidth="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" strokeLinecap="round" strokeWidth="2" />
                          </svg>
                        </div>
                        <p className="mt-3 text-[13px] text-[#71839e]">
                          Drag & drop an image here or
                        </p>
                        <span className="mt-2 inline-flex items-center rounded-lg border border-[#dce5ef] bg-white px-3 py-1 text-xs font-bold text-[#2187a8] shadow-xs">
                          Choose File
                        </span>
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-[11px] text-[#8a9bb2]">
                    Recommended: 1200 × 800px (16:9) | Max size: 2MB
                  </p>
                </div>

                {/* Right: Headline & Short Summary */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-bold text-[#182238]">
                      Headline <span className="text-[#ef4444]">*</span>
                    </label>
                    <input
                      className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3.5 text-[14px] text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7] ${
                        errors.headline ? 'border-[#ef4444]' : 'border-[#dce5ef]'
                      }`}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="Enter compelling headline"
                      type="text"
                      value={headline}
                    />
                    {errors.headline && (
                      <p className="mt-1 text-[12px] text-[#ef4444]">{errors.headline}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-[13px] font-bold text-[#182238]">
                        Short Summary <span className="text-[#ef4444]">*</span>
                      </label>
                      <span className="text-[11px] text-[#8a9bb2]">
                        {shortSummary.length}/160
                      </span>
                    </div>
                    <div className="relative mt-1.5">
                      <textarea
                        className={`h-28 w-full resize-none rounded-xl border bg-white p-3.5 text-[13.5px] leading-relaxed text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7] ${
                          errors.shortSummary ? 'border-[#ef4444]' : 'border-[#dce5ef]'
                        }`}
                        maxLength={160}
                        onChange={(e) => setShortSummary(e.target.value)}
                        placeholder="Write a short summary (max 160 characters) that will appear on the homepage card."
                        value={shortSummary}
                      />
                    </div>
                    {errors.shortSummary && (
                      <p className="mt-1 text-[12px] text-[#ef4444]">{errors.shortSummary}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Card 3: 3. Detail Page Content */}
            <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 sm:p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
              <h2 className="text-[18px] font-bold text-[#182238]">3. Detail Page Content</h2>

              <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                {/* Left: Body Content Editor */}
                <div>
                  <label className="block text-[13px] font-bold text-[#182238]">
                    Body Content <span className="text-[#ef4444]">*</span>
                  </label>

                  <div className="mt-2 overflow-hidden rounded-2xl border border-[#dce5ef] transition focus-within:border-[#2187a8] focus-within:ring-2 focus-within:ring-[#d9f0f7]">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-1 border-b border-[#edf2f7] bg-[#f9fbfd] px-3 py-2 text-[#71839e]">
                      <span className="flex items-center gap-1 px-1.5 text-xs font-medium text-[#182238]">
                        Paragraph ▾
                      </span>
                      <div className="mx-1 h-3.5 w-px bg-[#dce5ef]" />
                      <button
                        className="rounded p-1 font-bold hover:bg-white hover:text-[#182238]"
                        onClick={() => handleInsertFormat('**', '**')}
                        title="Bold"
                        type="button"
                      >
                        B
                      </button>
                      <button
                        className="rounded p-1 italic hover:bg-white hover:text-[#182238]"
                        onClick={() => handleInsertFormat('*', '*')}
                        title="Italic"
                        type="button"
                      >
                        I
                      </button>
                      <button
                        className="rounded p-1 underline hover:bg-white hover:text-[#182238]"
                        onClick={() => handleInsertFormat('<u>', '</u>')}
                        title="Underline"
                        type="button"
                      >
                        <u>U</u>
                      </button>
                      <div className="mx-1 h-3.5 w-px bg-[#dce5ef]" />
                      <button
                        className="rounded p-1 hover:bg-white hover:text-[#182238]"
                        onClick={() => handleInsertFormat('\n• ')}
                        title="Bullet List"
                        type="button"
                      >
                        •≡
                      </button>
                      <button
                        className="rounded p-1 hover:bg-white hover:text-[#182238]"
                        onClick={() => handleInsertFormat('\n1. ')}
                        title="Numbered List"
                        type="button"
                      >
                        1≡
                      </button>
                      <button
                        className="rounded p-1 hover:bg-white hover:text-[#182238]"
                        onClick={() => handleInsertFormat('\n> ')}
                        title="Quote"
                        type="button"
                      >
                        “
                      </button>
                      <button
                        className="rounded p-1 hover:bg-white hover:text-[#182238]"
                        onClick={() => handleInsertFormat('[', '](https://)')}
                        title="Link"
                        type="button"
                      >
                        🔗
                      </button>
                    </div>

                    {/* Textarea */}
                    <textarea
                      className="min-h-[190px] w-full resize-none p-3.5 text-[14px] leading-relaxed text-[#182238] outline-none placeholder:text-[#a9b7c9]"
                      onChange={(e) => setBodyContent(e.target.value)}
                      placeholder="Write the main content for this showcase detail page..."
                      value={bodyContent}
                    />

                    {/* Footer words count */}
                    <div className="border-t border-[#f0f4f8] bg-[#fbfdfe] px-3.5 py-1.5 text-right text-[11px] font-semibold text-[#8a9bb2]">
                      {wordCount} WORDS
                    </div>
                  </div>
                  {errors.bodyContent && (
                    <p className="mt-1 text-[12px] text-[#ef4444]">{errors.bodyContent}</p>
                  )}
                </div>

                {/* Right: Section Blocks */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-[#182238]">Section Blocks</span>
                    <svg className="size-4 text-[#8a9bb2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeWidth="2" />
                    </svg>
                  </div>

                  {/* Section blocks list */}
                  <div className="mt-2 space-y-2.5">
                    {sectionBlocks.map((block) => (
                      <div
                        className="flex items-center justify-between rounded-xl border border-[#edf2f7] bg-[#f8fbfe] p-3 text-[13px]"
                        key={block.id}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Drag handle icon */}
                          <svg className="size-4 cursor-grab text-[#a0aec0]" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="7" cy="5" r="1.5" />
                            <circle cx="13" cy="5" r="1.5" />
                            <circle cx="7" cy="10" r="1.5" />
                            <circle cx="13" cy="10" r="1.5" />
                            <circle cx="7" cy="15" r="1.5" />
                            <circle cx="13" cy="15" r="1.5" />
                          </svg>
                          <div>
                            <span className="block font-bold text-[#182238]">{block.title}</span>
                            <span className="block text-[11px] text-[#8a9bb2]">Title + Text</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            aria-label={`Edit ${block.title}`}
                            className="rounded-lg p-1.5 text-[#71839e] hover:bg-white hover:text-[#2187a8]"
                            onClick={() => {
                              const newTitle = prompt('Edit block title:', block.title);
                              if (newTitle) {
                                setSectionBlocks((prev) =>
                                  prev.map((b) => (b.id === block.id ? { ...b, title: newTitle } : b)),
                                );
                              }
                            }}
                            type="button"
                          >
                            <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                          </button>
                          <button
                            aria-label={`Delete ${block.title}`}
                            className="rounded-lg p-1.5 text-[#71839e] hover:bg-white hover:text-[#ef4444]"
                            onClick={() => handleDeleteSectionBlock(block.id)}
                            type="button"
                          >
                            <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Section Block Button */}
                  <button
                    className="mt-3 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#b8d6e7] bg-white text-[13px] font-semibold text-[#2187a8] transition hover:border-[#2187a8] hover:bg-[#f0f7fb]"
                    onClick={handleAddSectionBlock}
                    type="button"
                  >
                    <span className="text-base font-bold">+</span>
                    <span>Add Section Block</span>
                  </button>
                </div>
              </div>
            </Card>

            {/* Card 4: 4. CTA & Related Content */}
            <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 sm:p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
              <h2 className="text-[18px] font-bold text-[#182238]">4. CTA & Related Content</h2>

              <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)]">
                {/* CTA Buttons */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-bold text-[#182238]">
                      Primary CTA Button Text <span className="text-[#ef4444]">*</span>
                    </label>
                    <input
                      className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3.5 text-[14px] text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7] ${
                        errors.primaryCtaText ? 'border-[#ef4444]' : 'border-[#dce5ef]'
                      }`}
                      onChange={(e) => setPrimaryCtaText(e.target.value)}
                      placeholder="e.g., Book an Appointment"
                      type="text"
                      value={primaryCtaText}
                    />
                    {errors.primaryCtaText && (
                      <p className="mt-1 text-[12px] text-[#ef4444]">{errors.primaryCtaText}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-[#182238]">
                      Secondary CTA Button Text
                    </label>
                    <input
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[14px] text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                      onChange={(e) => setSecondaryCtaText(e.target.value)}
                      placeholder="e.g., Request Consultation"
                      type="text"
                      value={secondaryCtaText}
                    />
                  </div>
                </div>

                {/* Related Showcase Cards */}
                <div>
                  <label className="block text-[13px] font-bold text-[#182238]">
                    Related Showcase (select up to 3)
                  </label>

                  <div className="mt-2 grid grid-cols-3 gap-2.5">
                    {data.defaultRelatedShowcase.map((item) => {
                      const isSelected = selectedRelatedIds.includes(item.id);
                      return (
                        <button
                          className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition ${
                            isSelected
                              ? 'border-[#2187a8] bg-[#f0f7fa] shadow-xs'
                              : 'border-[#e2e8f0] bg-white hover:border-[#b8d6e7]'
                          }`}
                          key={item.id}
                          onClick={() => toggleRelatedItem(item.id)}
                          type="button"
                        >
                          <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                            <img
                              alt={item.title}
                              className="size-full object-cover"
                              src={item.imageUrl}
                            />
                            {/* Checkmark badge */}
                            <div
                              className={`absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-md text-white transition ${
                                isSelected ? 'bg-[#2187a8]' : 'bg-black/30'
                              }`}
                            >
                              {isSelected ? (
                                <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    clipRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    fillRule="evenodd"
                                  />
                                </svg>
                              ) : null}
                            </div>
                          </div>
                          <span className="p-2 text-[11px] font-semibold leading-tight text-[#182238]">
                            {item.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            {/* Card 5: 5. SEO & Publishing */}
            <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 sm:p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
              <h2 className="text-[18px] font-bold text-[#182238]">5. SEO & Publishing</h2>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[13px] font-bold text-[#182238]">
                      Meta Title
                    </label>
                    <span className="text-[11px] text-[#8a9bb2]">{metaTitle.length}/60</span>
                  </div>
                  <input
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[14px] text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                    maxLength={60}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Enter meta title (max 60 characters)"
                    type="text"
                    value={metaTitle}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[13px] font-bold text-[#182238]">
                      Meta Description
                    </label>
                    <span className="text-[11px] text-[#8a9bb2]">{metaDescription.length}/160</span>
                  </div>
                  <textarea
                    className="mt-1.5 h-20 w-full resize-none rounded-xl border border-[#dce5ef] bg-white p-3.5 text-[13.5px] leading-relaxed text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                    maxLength={160}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Enter meta description (max 160 characters)"
                    value={metaDescription}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (Sidebar Cards) */}
          <div className="space-y-7">
            {/* Card A: Publish */}
            <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
              <h2 className="text-[18px] font-bold text-[#182238]">Publish</h2>

              <div className="mt-5 flex gap-3">
                <Button
                  className="flex-1 rounded-xl border border-[#dce5ef] bg-white text-[14px] font-bold text-[#2187a8] shadow-xs hover:bg-[#f4f9fb]"
                  disabled={createMutation.isPending}
                  onClick={() => handleSubmit('draft')}
                  type="button"
                  variant="secondary"
                >
                  Save as Draft
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-[#2187a8] text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(33,135,168,0.25)] hover:bg-[#1a718c]"
                  disabled={createMutation.isPending}
                  onClick={() => handleSubmit('published')}
                  type="button"
                >
                  Publish Showcase
                </Button>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-[12px] text-[#8a9bb2]">
                <svg className="size-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>Changes are saved only when publishing or saving draft.</span>
              </div>
            </Card>

            {/* Card B: Live Preview Structure */}
            <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
              <h2 className="text-[18px] font-bold text-[#182238]">Live Preview Structure</h2>

              <div className="mt-4 flex items-start gap-3">
                <img
                  alt="Showcase thumbnail"
                  className="size-16 shrink-0 rounded-xl object-cover shadow-xs ring-1 ring-black/5"
                  src={coverImageUrl || '/assets/landing/showcase-toothbrush.png'}
                />
                <p className="text-[12.5px] leading-relaxed text-[#71839e]">
                  This is how your showcase will appear on the public site.
                </p>
              </div>

              {/* Checklist */}
              <div className="mt-4 space-y-2 border-t border-[#f0f4f8] pt-3.5">
                {checklist.map((item) => (
                  <div className="flex items-center gap-2 text-[12.5px]" key={item.label}>
                    <div
                      className={`grid size-4 place-items-center rounded-full text-white ${
                        item.completed ? 'bg-[#16a34a]' : 'bg-[#cbd5e1]'
                      }`}
                    >
                      <svg className="size-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          clipRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          fillRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span
                      className={`font-medium ${
                        item.completed ? 'text-[#182238]' : 'text-[#8a9bb2]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Card C: Homepage Card Settings */}
            <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
              <h2 className="text-[18px] font-bold text-[#182238]">Homepage Card Settings</h2>

              <div className="mt-4 space-y-4">
                {/* Show on Homepage */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-[#182238]">
                      Show on Homepage
                    </span>
                    <svg className="size-4 text-[#8a9bb2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeWidth="2" />
                    </svg>
                  </div>
                  <ToggleSwitch
                    checked={showOnHomepage}
                    id={showOnHomepageToggleId}
                    onChange={setShowOnHomepage}
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-[13px] font-bold text-[#182238]">
                    Display Order
                  </label>
                  <input
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[14px] text-[#182238] outline-none transition focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                    min={1}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 1)}
                    type="number"
                    value={displayOrder}
                  />
                </div>

                {/* Card Summary */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[13px] font-bold text-[#182238]">
                      Card Summary (Homepage teaser)
                    </label>
                    <span className="text-[11px] text-[#8a9bb2]">
                      {cardSummary.length}/120
                    </span>
                  </div>
                  <textarea
                    className="mt-1.5 h-20 w-full resize-none rounded-xl border border-[#dce5ef] bg-white p-3 text-[13px] leading-relaxed text-[#182238] outline-none transition placeholder:text-[#a9b7c9] focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                    maxLength={120}
                    onChange={(e) => setCardSummary(e.target.value)}
                    placeholder="Short teaser text that appears on the homepage card."
                    value={cardSummary}
                  />
                </div>
              </div>
            </Card>

            {/* Card D: Quick Tips */}
            <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
              <div className="flex items-center gap-2">
                <span className="text-base">💡</span>
                <h2 className="text-[18px] font-bold text-[#182238]">Quick Tips</h2>
              </div>

              <ul className="mt-4 space-y-2.5 text-[12.5px] leading-relaxed text-[#71839e]">
                {data.quickTips.map((tip, idx) => (
                  <li className="flex items-start gap-2" key={idx}>
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#2187a8]" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#e2e8f0] pt-6 text-[12.5px] text-[#9badc5]">
          <p>{data.footer.copyright}</p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 text-[#71839e]">
              <AdminIcon className="size-3.5 text-[#2187a8]" name="shield" />
              {data.footer.sslLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#71839e]">
              <AdminIcon className="size-3.5 text-[#2187a8]" name="lock" />
              {data.footer.encryptionLabel}
            </span>
          </div>
        </footer>
        </div>
      </main>
    </div>
  );
}
