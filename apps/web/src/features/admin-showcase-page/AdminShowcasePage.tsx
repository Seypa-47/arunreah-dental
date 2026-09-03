import { useState, useMemo, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminIcon, AdminSidebar } from '@/components/layout/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAdminShowcasePageQuery } from './use-admin-showcase-page';
import type {
  ShowcaseArticle,
  ShowcaseCategory,
  ShowcaseStatus,
} from '@/services/admin-showcase';

function StatusBadge({ status }: { status: ShowcaseStatus }) {
  if (status === 'published') {
    return (
      <span className="inline-flex items-center rounded-md border border-[#bbf7d0] bg-[#f0fdf4] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#16a34a]">
        Published
      </span>
    );
  }
  if (status === 'draft') {
    return (
      <span className="inline-flex items-center rounded-md border border-[#fef3c7] bg-[#fffbeb] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#d97706]">
        Draft
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md border border-[#e2e8f0] bg-[#f1f5f9] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">
      Hidden
    </span>
  );
}

function ToggleSwitch({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
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
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
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

function AddShowcaseModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newArticle: ShowcaseArticle) => void;
}) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<ShowcaseCategory>('Treatment');
  const [status, setStatus] = useState<ShowcaseStatus>('published');
  const [homepageVisibility, setHomepageVisibility] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newDoc: ShowcaseArticle = {
      category,
      homepageVisibility,
      id,
      imageAlt: title,
      imageUrl: '/assets/landing/showcase-family.png',
      lastUpdatedAuthor: 'Admin',
      lastUpdatedDate: new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      order: Date.now(),
      status,
      structure: {
        bodyContent: subtitle || 'New showcase article content description.',
        coverImage: '/assets/landing/showcase-family.png',
        ctaButtonCount: 2,
        headline: title,
        relatedCardsCount: 3,
        sectionBlocksCount: 4,
        shortSummary: subtitle || 'Showcase summary details.',
      },
      subtitle: subtitle || 'Article introduction',
      title,
    };

    onCreate(newDoc);
    onClose();
  };

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#f0f4f8] pb-4">
          <h2 className="text-xl font-bold text-[#182238]">Add New Showcase Article</h2>
          <button
            aria-label="Close dialog"
            className="grid size-8 place-items-center rounded-lg text-[#71839e] hover:bg-[#f4f8fb]"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[13px] font-bold text-[#182238]">
              Article Title <span className="text-[#ef4444]">*</span>
            </label>
            <input
              className="mt-1.5 h-11 w-full rounded-xl border border-[#dce5ef] px-3.5 text-[14px] text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Restore Your Smile with Dental Implants"
              required
              type="text"
              value={title}
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#182238]">
              Short Subtitle / Summary
            </label>
            <input
              className="mt-1.5 h-11 w-full rounded-xl border border-[#dce5ef] px-3.5 text-[14px] text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. A permanent solution"
              type="text"
              value={subtitle}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-[#182238]">Category</label>
              <select
                className="mt-1.5 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-[14px] text-[#182238] outline-none focus:border-[#2187a8]"
                onChange={(e) => setCategory(e.target.value as ShowcaseCategory)}
                value={category}
              >
                <option value="Treatment">Treatment</option>
                <option value="Patient Education">Patient Education</option>
                <option value="Clinic Experience">Clinic Experience</option>
                <option value="Smile Care">Smile Care</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#182238]">Status</label>
              <select
                className="mt-1.5 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-[14px] text-[#182238] outline-none focus:border-[#2187a8]"
                onChange={(e) => setStatus(e.target.value as ShowcaseStatus)}
                value={status}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#edf2f7] bg-[#f8fbfe] p-3.5">
            <span className="text-[13px] font-bold text-[#182238]">Homepage Visibility</span>
            <ToggleSwitch checked={homepageVisibility} onChange={setHomepageVisibility} />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <Button
              className="border border-[#dce5ef] bg-white text-[#71839e]"
              onClick={onClose}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button className="bg-[#2187a8] text-white hover:bg-[#1a718c]" type="submit">
              Create Article
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ShowcaseSkeleton() {
  return (
    <div className="min-h-screen bg-[#f6f8fb] p-7 lg:p-10">
      <div className="h-10 w-72 animate-pulse rounded bg-[#e7edf3]" />
      <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        <div className="h-[600px] animate-pulse rounded-[28px] bg-white" />
        <div className="h-[600px] animate-pulse rounded-[28px] bg-white" />
      </div>
    </div>
  );
}

function ShowcaseErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f6f8fb] p-6">
      <Card className="max-w-md rounded-[28px] p-8 text-center">
        <h1 className="text-2xl font-bold text-[#182238]">Showcase Management is unavailable</h1>
        <p className="mt-3 text-[#71839e]">
          Unable to retrieve showcase articles. Please try again.
        </p>
        <Button className="mt-6 bg-[#2187a8] text-white" onClick={onRetry}>
          Retry
        </Button>
      </Card>
    </div>
  );
}

export function AdminShowcasePage() {
  const navigate = useNavigate();
  const { data, isError, isLoading, refetch } = useAdminShowcasePageQuery();

  const [articles, setArticles] = useState<ShowcaseArticle[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Edit selected text states
  const [isEditingSelected, setIsEditingSelected] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editHeadline, setEditHeadline] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editBlocksCount, setEditBlocksCount] = useState<number>(5);
  const [editCtaCount, setEditCtaCount] = useState<number>(2);
  const [editRelatedCount, setEditRelatedCount] = useState<number>(3);
  const [editCategory, setEditCategory] = useState<ShowcaseCategory>('Treatment');
  const [editStatus, setEditStatus] = useState<ShowcaseStatus>('published');
  const [editSavedToast, setEditSavedToast] = useState(false);

  // Sync articles when data loads
  useMemo(() => {
    if (data?.articles && articles.length === 0) {
      setArticles(data.articles);
      if (data.articles[0]) {
        setSelectedId(data.articles[0].id);
      }
    }
  }, [data?.articles, articles.length]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        !searchQuery.trim() ||
        `${article.title} ${article.subtitle} ${article.category}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === 'All' || article.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, categoryFilter]);

  const selectedArticle = useMemo(() => {
    return articles.find((a) => a.id === selectedId) || articles[0] || null;
  }, [articles, selectedId]);

  const startEditing = (articleToEdit?: ShowcaseArticle) => {
    const target = articleToEdit || selectedArticle;
    if (!target) return;
    setEditTitle(target.title);
    setEditHeadline(target.structure.headline || target.title);
    setEditSummary(target.structure.shortSummary || target.subtitle);
    setEditBody(target.structure.bodyContent);
    setEditBlocksCount(target.structure.sectionBlocksCount || 4);
    setEditCtaCount(target.structure.ctaButtonCount || 2);
    setEditRelatedCount(target.structure.relatedCardsCount || 3);
    setEditCategory(target.category);
    setEditStatus(target.status);
    setIsEditingSelected(true);
  };

  const handleSaveEditing = () => {
    if (!selectedArticle) return;
    const updated: ShowcaseArticle = {
      ...selectedArticle,
      category: editCategory,
      status: editStatus,
      structure: {
        ...selectedArticle.structure,
        bodyContent: editBody.trim(),
        ctaButtonCount: Number(editCtaCount) || 1,
        headline: editHeadline.trim() || editTitle.trim(),
        relatedCardsCount: Number(editRelatedCount) || 1,
        sectionBlocksCount: Number(editBlocksCount) || 1,
        shortSummary: editSummary.trim(),
      },
      subtitle: editSummary.trim().slice(0, 35) + '...',
      title: editTitle.trim() || selectedArticle.title,
    };
    setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setIsEditingSelected(false);
    setEditSavedToast(true);
    setTimeout(() => setEditSavedToast(false), 2500);
  };

  const handleToggleVisibility = (id: string, newVisibility: boolean) => {
    setArticles((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, homepageVisibility: newVisibility } : a,
      ),
    );
  };

  const handleAddArticle = (newArticle: ShowcaseArticle) => {
    setArticles((prev) => [newArticle, ...prev]);
    setSelectedId(newArticle.id);
  };

  if (isLoading) return <ShowcaseSkeleton />;
  if (isError || !data) return <ShowcaseErrorState onRetry={() => void refetch()} />;

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
        {/* Breadcrumb & Header */}
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

        {/* Filter & Controls Bar */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {/* Search Input */}
            <label className="flex h-11 min-w-[240px] flex-1 max-w-md items-center gap-3 rounded-xl border border-[#dce5ef] bg-white px-4 text-[#9badc5] shadow-xs focus-within:border-[#2187a8] focus-within:ring-2 focus-within:ring-[#d9f0f7]">
              <AdminIcon className="size-4 shrink-0 text-[#9badc5]" name="search" />
              <input
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[#182238] outline-none placeholder:text-[#a9b7c9]"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                placeholder={data.controls.searchPlaceholder}
                type="search"
                value={searchQuery}
              />
            </label>

            {/* Category Dropdown */}
            <label className="flex h-11 items-center gap-2 rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[#71839e] shadow-xs focus-within:border-[#2187a8] focus-within:ring-2 focus-within:ring-[#d9f0f7]">
              <select
                className="cursor-pointer bg-transparent text-[14px] font-medium text-[#182238] outline-none"
                onChange={(e) => setCategoryFilter(e.target.value)}
                value={categoryFilter}
              >
                <option value="All">All</option>
                {data.controls.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Add New Showcase Button */}
          <Button
            className="h-11 rounded-xl bg-[#2187a8] px-5 text-[14px] font-bold text-white shadow-[0_6px_14px_rgba(33,135,168,0.2)] hover:bg-[#1a718c]"
            icon={<span aria-hidden="true" className="text-lg leading-none font-bold">+</span>}
            onClick={() => navigate('/admin/showcase/new')}
          >
            {data.controls.addLabel}
          </Button>
        </div>

        {/* Main 2-Column Grid */}
        <div className="mt-6 grid gap-7 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1.05fr)]">
          {/* Left Column: Showcase Articles Table Card */}
          <Card className="flex flex-col overflow-hidden rounded-[26px] border-[#e1e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
            {/* Card Header with drag hint */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0f4f8] pb-5">
              <h2 className="text-[18px] font-bold text-[#182238]">
                {data.table.title}
              </h2>
              <div className="flex items-center gap-1.5 text-[13px] text-[#8a9bb2]">
                <svg className="size-4 shrink-0 text-[#8a9bb2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeWidth="2" />
                </svg>
                <span>{data.table.dragTip}</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#f0f4f8] text-[11px] font-bold uppercase tracking-[0.6px] text-[#8699b0]">
                    <th className="py-4 pr-4 font-bold">{data.table.article}</th>
                    <th className="py-4 pr-4 font-bold">{data.table.category}</th>
                    <th className="py-4 pr-4 font-bold">{data.table.visibility}</th>
                    <th className="py-4 pr-4 font-bold">{data.table.status}</th>
                    <th className="py-4 pr-4 font-bold">{data.table.updated}</th>
                    <th className="py-4 text-right font-bold"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f4f8]">
                  {filteredArticles.map((article) => {
                    const isSelected = article.id === selectedArticle?.id;
                    return (
                      <tr
                        aria-selected={isSelected}
                        className={`group cursor-pointer transition-colors hover:bg-[#f8fbfd] ${
                          isSelected ? 'bg-[#f0f7fa]' : ''
                        }`}
                        key={article.id}
                        onClick={() => setSelectedId(article.id)}
                      >
                        {/* Article Info */}
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3.5">
                            <img
                              alt={article.imageAlt}
                              className="size-12 rounded-xl object-cover shadow-xs ring-1 ring-black/5"
                              src={article.imageUrl}
                            />
                            <div className="min-w-0">
                              <span className="block truncate text-[14.5px] font-bold text-[#182238]">
                                {article.title}
                              </span>
                              <span className="block truncate text-[12.5px] text-[#8a9bb2]">
                                {article.subtitle}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 pr-4 text-[13.5px] text-[#71839e]">
                          {article.category}
                        </td>

                        {/* Homepage Visibility */}
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2.5">
                            <ToggleSwitch
                              checked={article.homepageVisibility}
                              label={`Toggle homepage visibility for ${article.title}`}
                              onChange={(checked) => handleToggleVisibility(article.id, checked)}
                            />
                            <span
                              className={`text-[13px] font-semibold ${
                                article.homepageVisibility ? 'text-[#2187a8]' : 'text-[#8a9bb2]'
                              }`}
                            >
                              {article.homepageVisibility ? 'Visible' : 'Hidden'}
                            </span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 pr-4">
                          <StatusBadge status={article.status} />
                        </td>

                        {/* Last Updated */}
                        <td className="py-4 pr-4">
                          <span className="block text-[13.5px] font-medium text-[#182238]">
                            {article.lastUpdatedDate}
                          </span>
                          <span className="block text-[11.5px] text-[#8a9bb2]">
                            {article.lastUpdatedAuthor}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              aria-label={`Preview ${article.title}`}
                              className="grid size-8 place-items-center rounded-lg text-[#9badc5] transition hover:bg-white hover:text-[#2187a8]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(article.id);
                                setIsEditingSelected(false);
                              }}
                              title="Preview article"
                              type="button"
                            >
                              <AdminIcon className="size-4" name="eye" />
                            </button>
                            <button
                              aria-label={`Edit ${article.title}`}
                              className="grid size-8 place-items-center rounded-lg text-[#9badc5] transition hover:bg-white hover:text-[#2187a8]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(article.id);
                                startEditing(article);
                              }}
                              title="Edit article text"
                              type="button"
                            >
                              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State if filter yields 0 */}
            {filteredArticles.length === 0 && (
              <div className="grid min-h-[220px] place-items-center px-6 text-center">
                <div>
                  <h3 className="text-lg font-bold text-[#182238]">No showcase articles found</h3>
                  <p className="mt-1.5 text-[14px] text-[#71839e]">
                    Try adjusting your search query or category filter.
                  </p>
                  <Button
                    className="mt-4 border border-[#dce5ef] bg-white text-[#71839e]"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('All');
                    }}
                    variant="secondary"
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Right Column: Selected Article Structure Panel */}
          {selectedArticle && (
            <Card className="flex flex-col rounded-[26px] border-[#e1e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
              {/* Success update notification */}
              {editSavedToast && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-3 text-[13px] font-semibold text-[#15803d]">
                  <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      fillRule="evenodd"
                    />
                  </svg>
                  <span>Article text updated successfully!</span>
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-bold text-[#182238]">
                    {isEditingSelected ? 'Edit Article Content' : 'Selected Article Structure'}
                  </h2>
                  <p className="text-[12px] text-[#8a9bb2]">
                    {isEditingSelected ? 'Modify text fields below' : 'Currently selected'}
                  </p>
                </div>
                <button
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#b8d6e7] bg-[#edf7fb] px-3 py-1.5 text-xs font-bold text-[#2187a8] transition hover:bg-[#e2f1f7]"
                  onClick={() => {
                    if (isEditingSelected) {
                      setIsEditingSelected(false);
                    } else {
                      startEditing();
                    }
                  }}
                  type="button"
                >
                  <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  <span>{isEditingSelected ? 'Cancel' : 'Edit Text'}</span>
                </button>
              </div>

              {/* Editing Form Mode */}
              {isEditingSelected ? (
                <div className="mt-4 space-y-4">
                  {/* Article Title */}
                  <div>
                    <label className="block text-[12.5px] font-bold text-[#182238]">
                      Article Title <span className="text-[#ef4444]">*</span>
                    </label>
                    <input
                      className="mt-1 h-10 w-full rounded-xl border border-[#2187a8] bg-white px-3 text-[14px] font-bold text-[#182238] outline-none ring-2 ring-[#d9f0f7]"
                      onChange={(e) => setEditTitle(e.target.value)}
                      type="text"
                      value={editTitle}
                    />
                  </div>

                  {/* Headline */}
                  <div>
                    <label className="block text-[12.5px] font-bold text-[#182238]">
                      Headline
                    </label>
                    <input
                      className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-[13.5px] text-[#182238] outline-none focus:border-[#2187a8]"
                      onChange={(e) => setEditHeadline(e.target.value)}
                      type="text"
                      value={editHeadline}
                    />
                  </div>

                  {/* Short Summary */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-[12.5px] font-bold text-[#182238]">
                        Short Summary
                      </label>
                      <span className="text-[11px] text-[#8a9bb2]">{editSummary.length}/160</span>
                    </div>
                    <textarea
                      className="mt-1 h-20 w-full resize-none rounded-xl border border-[#dce5ef] bg-white p-2.5 text-[13px] leading-relaxed text-[#182238] outline-none focus:border-[#2187a8]"
                      maxLength={160}
                      onChange={(e) => setEditSummary(e.target.value)}
                      value={editSummary}
                    />
                  </div>

                  {/* Body Content */}
                  <div>
                    <label className="block text-[12.5px] font-bold text-[#182238]">
                      Body Content
                    </label>
                    <textarea
                      className="mt-1 h-28 w-full resize-none rounded-xl border border-[#dce5ef] bg-white p-2.5 text-[13px] leading-relaxed text-[#182238] outline-none focus:border-[#2187a8]"
                      onChange={(e) => setEditBody(e.target.value)}
                      value={editBody}
                    />
                  </div>

                  {/* Structure Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl border border-[#edf2f7] bg-[#f8fbfe] p-2">
                      <label className="block text-[10.5px] font-semibold text-[#71839e]">Blocks</label>
                      <input
                        className="mt-1 w-full bg-transparent text-center text-[13px] font-bold text-[#182238] outline-none"
                        min={1}
                        onChange={(e) => setEditBlocksCount(Number(e.target.value) || 1)}
                        type="number"
                        value={editBlocksCount}
                      />
                    </div>
                    <div className="rounded-xl border border-[#edf2f7] bg-[#f8fbfe] p-2">
                      <label className="block text-[10.5px] font-semibold text-[#71839e]">CTA Buttons</label>
                      <input
                        className="mt-1 w-full bg-transparent text-center text-[13px] font-bold text-[#182238] outline-none"
                        min={1}
                        onChange={(e) => setEditCtaCount(Number(e.target.value) || 1)}
                        type="number"
                        value={editCtaCount}
                      />
                    </div>
                    <div className="rounded-xl border border-[#edf2f7] bg-[#f8fbfe] p-2">
                      <label className="block text-[10.5px] font-semibold text-[#71839e]">Cards</label>
                      <input
                        className="mt-1 w-full bg-transparent text-center text-[13px] font-bold text-[#182238] outline-none"
                        min={1}
                        onChange={(e) => setEditRelatedCount(Number(e.target.value) || 1)}
                        type="number"
                        value={editRelatedCount}
                      />
                    </div>
                  </div>

                  {/* Category & Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11.5px] font-bold text-[#182238]">Category</label>
                      <select
                        className="mt-1 h-9 w-full rounded-lg border border-[#dce5ef] bg-white px-2 text-[12.5px] text-[#182238] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setEditCategory(e.target.value as ShowcaseCategory)}
                        value={editCategory}
                      >
                        <option value="Treatment">Treatment</option>
                        <option value="Patient Education">Patient Education</option>
                        <option value="Clinic Experience">Clinic Experience</option>
                        <option value="Smile Care">Smile Care</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-bold text-[#182238]">Status</label>
                      <select
                        className="mt-1 h-9 w-full rounded-lg border border-[#dce5ef] bg-white px-2 text-[12.5px] text-[#182238] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setEditStatus(e.target.value as ShowcaseStatus)}
                        value={editStatus}
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 rounded-xl border border-[#dce5ef] bg-white text-[13.5px] font-semibold text-[#71839e] hover:bg-[#f8fafc]"
                      onClick={() => setIsEditingSelected(false)}
                      type="button"
                      variant="secondary"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 rounded-xl bg-[#2187a8] text-[13.5px] font-bold text-white shadow-sm hover:bg-[#1a718c]"
                      onClick={handleSaveEditing}
                      type="button"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                /* Normal Preview Structure Mode */
                <>
                  {/* Title & Cover Image */}
                  <div className="mt-4">
                    <div className="group flex items-center justify-between gap-2">
                      <h3
                        className="cursor-pointer text-[17px] font-bold text-[#182238] transition hover:text-[#2187a8]"
                        onClick={() => startEditing()}
                        title="Click to edit article text"
                      >
                        {selectedArticle.title}
                      </h3>
                      <button
                        className="rounded p-1 text-[#2187a8] opacity-70 transition hover:bg-[#edf7fb] hover:opacity-100"
                        onClick={() => startEditing()}
                        title="Edit text"
                        type="button"
                      >
                        <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </button>
                    </div>

                    <img
                      alt={selectedArticle.title}
                      className="mt-3 aspect-[4/3] w-full rounded-2xl object-cover shadow-sm ring-1 ring-black/5"
                      src={selectedArticle.structure.coverImage}
                    />
                  </div>

                  {/* Structure Elements Checklist */}
                  <div className="mt-6 space-y-3.5 divide-y divide-[#f0f4f8] text-[13.5px]">
                    {/* 1. Cover Image */}
                    <div className="flex items-center gap-3 pt-1 text-[#50637f]">
                      <svg className="size-4 shrink-0 text-[#71839e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect height="18" rx="2" width="18" x="3" y="3" strokeWidth="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-5-5L5 21" strokeLinecap="round" strokeWidth="2" />
                      </svg>
                      <span className="font-medium text-[#182238]">Cover Image</span>
                    </div>

                    {/* 2. Headline */}
                    <div
                      className="flex cursor-pointer items-center gap-3 pt-3.5 text-[#50637f] transition hover:text-[#2187a8]"
                      onClick={() => startEditing()}
                      title="Click to edit headline"
                    >
                      <span className="font-serif text-[15px] font-bold text-[#71839e]">A</span>
                      <span className="font-medium text-[#182238]">{selectedArticle.structure.headline || 'Headline'}</span>
                    </div>

                    {/* 3. Short Summary */}
                    <div
                      className="flex cursor-pointer items-center gap-3 pt-3.5 text-[#50637f] transition hover:text-[#2187a8]"
                      onClick={() => startEditing()}
                      title="Click to edit short summary"
                    >
                      <svg className="size-4 shrink-0 text-[#71839e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M4 6h16M4 12h10M4 18h7" strokeLinecap="round" strokeWidth="2" />
                      </svg>
                      <span className="truncate font-medium text-[#182238]">{selectedArticle.structure.shortSummary || 'Short Summary'}</span>
                    </div>

                    {/* 4. Body Content */}
                    <div
                      className="flex cursor-pointer items-center gap-3 pt-3.5 text-[#50637f] transition hover:text-[#2187a8]"
                      onClick={() => startEditing()}
                      title="Click to edit body content"
                    >
                      <svg className="size-4 shrink-0 text-[#71839e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeWidth="2" />
                      </svg>
                      <span className="truncate font-medium text-[#182238]">Body Content</span>
                    </div>

                    {/* 5. Section Blocks */}
                    <div className="flex items-center justify-between pt-3.5 text-[#50637f]">
                      <div className="flex items-center gap-3">
                        <svg className="size-4 shrink-0 text-[#71839e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect height="7" rx="1" width="7" x="3" y="3" strokeWidth="2" />
                          <rect height="7" rx="1" width="7" x="14" y="3" strokeWidth="2" />
                          <rect height="7" rx="1" width="7" x="14" y="14" strokeWidth="2" />
                          <rect height="7" rx="1" width="7" x="3" y="14" strokeWidth="2" />
                        </svg>
                        <span className="font-medium text-[#182238]">Section Blocks</span>
                      </div>
                      <span className="rounded-lg bg-[#f1f5f9] px-2.5 py-1 text-[12px] font-semibold text-[#64748b]">
                        {selectedArticle.structure.sectionBlocksCount} blocks
                      </span>
                    </div>

                    {/* 6. CTA Button Text */}
                    <div className="flex items-center justify-between pt-3.5 text-[#50637f]">
                      <div className="flex items-center gap-3">
                        <svg className="size-4 shrink-0 text-[#71839e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="9" strokeWidth="2" />
                          <circle cx="12" cy="12" r="3" strokeWidth="2" />
                        </svg>
                        <span className="font-medium text-[#182238]">CTA Button Text</span>
                      </div>
                      <span className="rounded-lg bg-[#f1f5f9] px-2.5 py-1 text-[12px] font-semibold text-[#64748b]">
                        {selectedArticle.structure.ctaButtonCount} buttons
                      </span>
                    </div>

                    {/* 7. Related Showcase Cards */}
                    <div className="flex items-center justify-between pt-3.5 text-[#50637f]">
                      <div className="flex items-center gap-3">
                        <svg className="size-4 shrink-0 text-[#71839e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="m12 2 9 4.9V17L12 22l-9-5V6.9L12 2z" strokeWidth="2" />
                        </svg>
                        <span className="font-medium text-[#182238]">Related Showcase Cards</span>
                      </div>
                      <span className="rounded-lg bg-[#f1f5f9] px-2.5 py-1 text-[12px] font-semibold text-[#64748b]">
                        {selectedArticle.structure.relatedCardsCount} cards
                      </span>
                    </div>
                  </div>

                  <div className="my-6 border-t border-[#f0f4f8]" />

                  {/* Show on Homepage Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-[#182238]">
                      Show on Homepage
                    </span>
                    <ToggleSwitch
                      checked={selectedArticle.homepageVisibility}
                      label="Show on homepage toggle"
                      onChange={(checked) =>
                        handleToggleVisibility(selectedArticle.id, checked)
                      }
                    />
                  </div>

                  {/* Edit Selected Article Button */}
                  <Button
                    className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2187a8] text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(33,135,168,0.25)] hover:bg-[#1a718c]"
                    onClick={() => startEditing()}
                    type="button"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    <span>Edit Selected Article</span>
                  </Button>
                </>
              )}
            </Card>
          )}
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

        {/* Modal for adding article */}
        <AddShowcaseModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onCreate={handleAddArticle}
        />
      </main>
    </div>
  );
}
