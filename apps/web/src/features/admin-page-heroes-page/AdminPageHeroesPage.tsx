import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  defaultImagePresentation,
  type ImagePresentation,
  type PageMediaPlacement,
} from '@arunreah/shared';
import { Link } from 'react-router-dom';
import { AdminPageHeading } from '@/components/layout/admin-workspace';
import { AdminIcon, type AdminIconName } from '@/components/layout/admin-sidebar';
import { AdminPublicationStatus } from '@/components/admin/admin-list';
import { MediaUploader } from '@/components/admin/media-uploader';
import { pageHeroFrames } from '@/components/admin/image-frames';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { queryKeys } from '@/lib/query-keys';
import { cmsApi, type AdminPageMediaRecord } from '@/services/cms';
import { getPublicMediaUrl } from '@/services/media';
import { ContactIcon } from '@/components/layout/public-ui';

type HeroPreviewLayout = 'image-only' | 'light' | 'overlay' | 'overlay-or-text';

export type HeroPageConfig = {
  aspectRatio: string;
  defaultEyebrowEn: string;
  defaultEyebrowKm: string;
  defaultImage: string;
  defaultSubtitleEn: string;
  defaultSubtitleKm: string;
  defaultTitleEn: string;
  defaultTitleKm: string;
  icon: AdminIconName;
  id: string;
  name: string;
  placement: PageMediaPlacement;
  previewLayout: HeroPreviewLayout;
  publicUrl: string;
  supportsCopy?: boolean;
  subtitle: string;
};

export function heroPreviewShowsImage(
  page: Pick<HeroPageConfig, 'previewLayout'>,
  imageKey: string,
) {
  return page.previewLayout !== 'overlay-or-text' || Boolean(imageKey);
}

export const HERO_PAGES: HeroPageConfig[] = [
  {
    aspectRatio: 'aspect-[21/9]',
    defaultEyebrowEn: 'ABOUT US',
    defaultEyebrowKm: 'អំពីយើង',
    defaultImage: '/assets/landing/figma-branches/image2_183_4173.png',
    defaultSubtitleEn: 'Thoughtful dental care for a healthier, more confident smile.',
    defaultSubtitleKm: 'ការថែទាំធ្មេញដោយយកចិត្តទុកដាក់ ដើម្បីស្នាមញញឹមមានសុខភាពល្អ និងទំនុកចិត្ត។',
    defaultTitleEn: 'About Arunreah Dental Clinic',
    defaultTitleKm: 'អំពី គ្លីនិកធ្មេញ អរុណរះ',
    icon: 'clinicInfo',
    id: 'about',
    name: 'About Us',
    placement: 'ABOUT_HERO',
    previewLayout: 'light',
    publicUrl: '/about',
    subtitle: 'Clinic history and story header banner',
  },
  {
    aspectRatio: 'aspect-[21/9]',
    defaultEyebrowEn: 'Our Treatments',
    defaultEyebrowKm: 'ការព្យាបាលរបស់យើង',
    defaultImage: '/assets/landing/hero-clinic.png',
    defaultSubtitleEn: 'Explore the treatments currently offered by our clinic.',
    defaultSubtitleKm: 'ស្វែងយល់ពីសេវាកម្មព្យាបាលធ្មេញដែលមាននៅគ្លីនិករបស់យើង។',
    defaultTitleEn: 'Our Services',
    defaultTitleKm: 'សេវាកម្មរបស់យើង',
    icon: 'services',
    id: 'services',
    name: 'Our Services',
    placement: 'SERVICES_HERO',
    previewLayout: 'overlay-or-text',
    publicUrl: '/services',
    subtitle: 'Comprehensive dental procedures directory hero',
  },
  {
    aspectRatio: 'aspect-[16/9]',
    defaultEyebrowEn: 'Our Dental Team',
    defaultEyebrowKm: 'ក្រុមទន្តបណ្ឌិតរបស់យើង',
    defaultImage: '/assets/landing/hero-clinic.png',
    defaultSubtitleEn: 'Meet our clinic professionals committed to exceptional patient care.',
    defaultSubtitleKm: 'ជួបជាមួយក្រុមទន្តបណ្ឌិតឯកទេសរបស់យើងដែលប្តេជ្ញាផ្តល់ការថែទាំដ៏ល្អបំផុត។',
    defaultTitleEn: 'Our Specialists',
    defaultTitleKm: 'ទន្តបណ្ឌិតឯកទេស',
    icon: 'doctors',
    id: 'doctors',
    name: 'Our Doctors',
    placement: 'DOCTORS_HERO',
    previewLayout: 'image-only',
    publicUrl: '/doctors',
    supportsCopy: false,
    subtitle: 'Specialists team introduction and group photo banner',
  },
  {
    aspectRatio: 'aspect-[21/9]',
    defaultEyebrowEn: '',
    defaultEyebrowKm: '',
    defaultImage: '/assets/landing/figma-branches/image2_183_4173.png',
    defaultSubtitleEn: 'Find a clinic branch that works for you.',
    defaultSubtitleKm: 'ស្វែងរកសាខាគ្លីនិកដែលសមស្របសម្រាប់អ្នក។',
    defaultTitleEn: 'Our Locations',
    defaultTitleKm: 'ទីតាំងរបស់យើង',
    icon: 'clinicInfo',
    id: 'branches',
    name: 'Branches',
    placement: 'BRANCHES_HERO',
    previewLayout: 'light',
    publicUrl: '/branches',
    subtitle: 'Branch locations and facilities header',
  },
  {
    aspectRatio: 'aspect-[21/9]',
    defaultEyebrowEn: 'Get In Touch',
    defaultEyebrowKm: 'ទំនាក់ទំនង',
    defaultImage: '/assets/landing/figma-branches/image2_183_4173.png',
    defaultSubtitleEn: 'Contact our clinic team for help with your care.',
    defaultSubtitleKm:
      'ទាក់ទងមកកាន់ក្រុមការងារគ្លីនិករបស់យើងសម្រាប់ការជួយសម្រួលដល់ការព្យាបាលរបស់អ្នក។',
    defaultTitleEn: 'Contact Us',
    defaultTitleKm: 'ទាក់ទងមកយើង',
    icon: 'appointments',
    id: 'contact',
    name: 'Contact Us',
    placement: 'CONTACT_HERO',
    previewLayout: 'light',
    publicUrl: '/contact',
    subtitle: 'Contact channels and directions hero banner',
  },
  {
    aspectRatio: 'aspect-[21/9]',
    defaultEyebrowEn: 'Our Work',
    defaultEyebrowKm: 'ស្នាដៃរបស់យើង',
    defaultImage: '/assets/landing/showcase-family.png',
    defaultSubtitleEn: 'Real stories, treatment journeys, and patient transformations.',
    defaultSubtitleKm: 'រឿងរ៉ាវពិត ដំណើរនៃការព្យាបាល និងការផ្លាស់ប្តូរស្នាមញញឹមរបស់អ្នកជំងឺ។',
    defaultTitleEn: 'Latest Showcases',
    defaultTitleKm: 'ករណីព្យាបាលចុងក្រោយ',
    icon: 'showcase',
    id: 'showcases',
    name: 'Showcases',
    placement: 'SHOWCASES_HERO',
    previewLayout: 'overlay-or-text',
    publicUrl: '/showcases',
    subtitle: 'Smile transformations and clinic stories hero',
  },
  {
    aspectRatio: 'aspect-[21/9]',
    defaultEyebrowEn: '',
    defaultEyebrowKm: '',
    defaultImage: '/assets/landing/figma-branches/image5_183_4173.jpg',
    defaultSubtitleEn: 'Send a preferred appointment request and our clinic will review it.',
    defaultSubtitleKm: 'ផ្ញើសំណើណាត់ជួបដែលអ្នកពេញចិត្ត ហើយគ្លីនិករបស់យើងនឹងពិនិត្យមើល។',
    defaultTitleEn: 'Book an Appointment',
    defaultTitleKm: 'កក់ការណាត់ជួប',
    icon: 'calendar',
    id: 'booking',
    name: 'Book Appointment',
    placement: 'BOOKING_HERO',
    previewLayout: 'light',
    publicUrl: '/book-appointment',
    subtitle: 'Online appointment booking form header banner',
  },
];

const homeCarouselBranchQuery = {
  limit: 100,
  order: 'asc',
  sort: 'displayOrder',
} as const;

type HeroFormState = {
  badgeEn: string;
  badgeKm: string;
  bodyEn: string;
  bodyKm: string;
  imageKey: string;
  imagePresentation: ImagePresentation;
  status: 'DRAFT' | 'PUBLISHED';
  titleEn: string;
  titleKm: string;
};

const emptyHeroForm = (): HeroFormState => ({
  badgeEn: '',
  badgeKm: '',
  bodyEn: '',
  bodyKm: '',
  imageKey: '',
  imagePresentation: defaultImagePresentation,
  status: 'PUBLISHED',
  titleEn: '',
  titleKm: '',
});

const toHeroForm = (item: AdminPageMediaRecord): HeroFormState => ({
  badgeEn: item.badgeEn ?? '',
  badgeKm: item.badgeKm ?? '',
  bodyEn: item.bodyEn ?? '',
  bodyKm: item.bodyKm ?? '',
  imageKey: item.imageKey,
  imagePresentation: item.imagePresentation ?? defaultImagePresentation,
  status: item.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
  titleEn: item.titleEn ?? '',
  titleKm: item.titleKm ?? '',
});

export function AdminPageHeroesPage() {
  const queryClient = useQueryClient();
  const [selectedPageId, setSelectedPageId] = useState<string>('about');
  const [previewLanguage, setPreviewLanguage] = useState<'en' | 'km'>('en');
  const [notification, setNotification] = useState<
    { message: string; tone: 'success' | 'error' } | undefined
  >();

  const activePage = useMemo(
    () => HERO_PAGES.find((page) => page.id === selectedPageId) ?? HERO_PAGES[0]!,
    [selectedPageId],
  );

  const heroQuery = useQuery({
    queryFn: () => cmsApi.pageMedia.list(activePage.placement),
    queryKey: queryKeys.admin.pageMedia(activePage.placement),
  });

  const branchHeroQuery = useQuery({
    queryFn: () => cmsApi.branches.list(homeCarouselBranchQuery),
    queryKey: queryKeys.admin.branches(homeCarouselBranchQuery),
  });

  const existingRecord = useMemo(() => heroQuery.data?.items?.[0], [heroQuery.data?.items]);

  const branchHeroSlides = useMemo(
    () =>
      (branchHeroQuery.data?.items ?? []).filter(
        (branch) => branch.status === 'PUBLISHED' && branch.includeInHomepageHero,
      ),
    [branchHeroQuery.data?.items],
  );
  const publicBranches = useMemo(
    () =>
      (branchHeroQuery.data?.items ?? []).filter(
        (branch) => branch.status === 'PUBLISHED' && branch.showOnBranchesPage,
      ),
    [branchHeroQuery.data?.items],
  );
  const primaryPublicBranch = publicBranches[0];
  const contactQuery = useQuery({
    enabled: activePage.id === 'contact',
    queryFn: () => cmsApi.contact.get(),
    queryKey: queryKeys.admin.contact(),
  });

  const [form, setForm] = useState<HeroFormState>(() => emptyHeroForm());

  useEffect(() => {
    if (existingRecord) {
      setForm(toHeroForm(existingRecord));
    } else {
      setForm(emptyHeroForm());
    }
  }, [existingRecord, activePage]);

  const showNotification = (message: string, tone: 'success' | 'error' = 'success') => {
    setNotification({ message, tone });
    setTimeout(() => {
      setNotification(undefined);
    }, 5000);
  };

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pageMedia(activePage.placement) }),
      queryClient.invalidateQueries({ queryKey: ['public'] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        badgeEn: form.badgeEn.trim() || null,
        badgeKm: form.badgeKm.trim() || null,
        bodyEn: form.bodyEn.trim() || null,
        bodyKm: form.bodyKm.trim() || null,
        displayOrder: 0,
        imageKey: form.imageKey || 'placeholder',
        imagePresentation: form.imagePresentation,
        placement: activePage.placement,
        status: form.status,
        titleEn: form.titleEn.trim() || null,
        titleKm: form.titleKm.trim() || null,
      };

      if (!payload.imageKey || payload.imageKey === 'placeholder') {
        throw new Error('Please select or upload an image for this hero banner.');
      }

      if (existingRecord) {
        return cmsApi.pageMedia.update(existingRecord.id, payload);
      }
      return cmsApi.pageMedia.create(payload);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to save hero section.';
      showNotification(message, 'error');
    },
    onSuccess: async () => {
      await invalidate();
      showNotification(`${activePage.name} hero section saved successfully.`, 'success');
    },
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      if (!existingRecord) return;
      return cmsApi.pageMedia.delete(existingRecord.id);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to reset hero section.';
      showNotification(message, 'error');
    },
    onSuccess: async () => {
      setForm(emptyHeroForm());
      await invalidate();
      showNotification(`${activePage.name} hero section reset to defaults.`, 'success');
    },
  });

  const branchFallbackImage = getPublicMediaUrl(
    primaryPublicBranch?.heroImageKey || primaryPublicBranch?.branchImageKey || undefined,
  );
  const previewImage = form.imageKey
    ? getPublicMediaUrl(form.imageKey)
    : activePage.id === 'branches'
      ? branchFallbackImage || activePage.defaultImage
      : activePage.defaultImage;
  const previewEyebrow =
    previewLanguage === 'km'
      ? form.badgeKm ||
        (activePage.id === 'branches' ? primaryPublicBranch?.badgeKm : undefined) ||
        activePage.defaultEyebrowKm
      : form.badgeEn ||
        (activePage.id === 'branches' ? primaryPublicBranch?.badgeEn : undefined) ||
        activePage.defaultEyebrowEn;
  const previewTitle =
    previewLanguage === 'km'
      ? form.titleKm || activePage.defaultTitleKm
      : form.titleEn || activePage.defaultTitleEn;
  const previewSubtitle =
    previewLanguage === 'km'
      ? form.bodyKm ||
        (activePage.id === 'branches' ? primaryPublicBranch?.heroSupportingTextKm : undefined) ||
        activePage.defaultSubtitleKm
      : form.bodyEn ||
        (activePage.id === 'branches' ? primaryPublicBranch?.heroSupportingTextEn : undefined) ||
        activePage.defaultSubtitleEn;
  const isPublishedHero = existingRecord?.status === 'PUBLISHED';
  const previewShowsImage = heroPreviewShowsImage(activePage, form.imageKey);
  const contact = contactQuery.data?.contact;
  const contactPreviewItems = [
    {
      icon: 'phone' as const,
      label: previewLanguage === 'km' ? 'ទូរស័ព្ទមកយើង' : 'Call Us',
      value: [contact?.primaryPhone, contact?.secondaryPhone].filter(Boolean).join('\n'),
    },
    contact?.primaryEmail
      ? {
          icon: 'email' as const,
          label: previewLanguage === 'km' ? 'អ៊ីមែលមកយើង' : 'Email Us',
          value: contact.primaryEmail,
        }
      : null,
    {
      icon: 'clock' as const,
      label: previewLanguage === 'km' ? 'ម៉ោងធ្វើការ' : 'Opening Hours',
      value:
        previewLanguage === 'km'
          ? (contact?.businessHoursKm ?? '')
          : (contact?.businessHoursEn ?? ''),
    },
    {
      icon: 'location' as const,
      label: previewLanguage === 'km' ? 'មកកាន់យើង' : 'Visit Us',
      value:
        previewLanguage === 'km'
          ? `ទីតាំងគ្លីនិកទាំង ${publicBranches.length}`
          : `${publicBranches.length} clinic location${publicBranches.length === 1 ? '' : 's'}`,
    },
  ].filter(
    (
      item,
    ): item is { icon: 'clock' | 'email' | 'location' | 'phone'; label: string; value: string } =>
      Boolean(item?.value),
  );

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <main className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1360px]">
          {/* Notification Alert */}
          {notification ? (
            <div
              aria-live="polite"
              className={`mb-6 flex items-center justify-between rounded-xl border px-4 py-3 text-[13px] font-semibold ${
                notification.tone === 'error'
                  ? 'border-[#fecdca] bg-[#fef3f2] text-[#b42318]'
                  : 'border-[#b9f1d0] bg-[#effdf5] text-[#13ad63]'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <AdminIcon
                  className="size-4"
                  name={notification.tone === 'error' ? 'info' : 'check'}
                />
                {notification.message}
              </span>
              <button
                aria-label="Dismiss notification"
                className={
                  notification.tone === 'error'
                    ? 'text-[#b42318] hover:text-[#7a271a]'
                    : 'text-[#13ad63] hover:text-[#0b7944]'
                }
                onClick={() => setNotification(undefined)}
                type="button"
              >
                ✕
              </button>
            </div>
          ) : null}

          {/* Page Heading */}
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2187a8]">
                Website Content Management
              </p>
              <AdminPageHeading />
            </div>
            <a
              className="inline-flex items-center gap-2 rounded-xl border border-[#dce5ef] bg-white px-4 py-2.5 text-xs font-bold text-[#2187a8] transition hover:bg-[#f4f8fb]"
              href={activePage.publicUrl}
              rel="noreferrer"
              target="_blank"
            >
              <AdminIcon className="size-4" name="eye" />
              View {activePage.name} Live ↗
            </a>
          </header>

          <Card className="mt-7 rounded-2xl border-[#dce5ef] bg-white p-5 shadow-none sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#edf1f5] pb-4">
              <div>
                <h2 className="text-[16px] font-bold text-[#182238]">Homepage carousel</h2>
                <p className="mt-0.5 max-w-2xl text-xs leading-5 text-[#71839e]">
                  These are the published branch slides currently visible to website visitors.
                  Edit a branch slide in Branches &amp; Locations.
                </p>
              </div>
              <span className="rounded-full bg-[#eef8fb] px-3 py-1 text-xs font-bold text-[#2187a8]">
                {branchHeroSlides.length} live {branchHeroSlides.length === 1 ? 'slide' : 'slides'}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {branchHeroQuery.isLoading ? (
                <div className="min-h-40 animate-pulse rounded-xl border border-[#dce5ef] bg-[#f7fafc]" />
              ) : null}
              {branchHeroSlides.map((branch) => {
                const branchImage = getPublicMediaUrl(
                  branch.heroImageKey || branch.branchImageKey || undefined,
                );
                return (
                  <article
                    className="overflow-hidden rounded-xl border border-[#dce5ef] bg-white"
                    key={branch.id}
                  >
                    <div className="aspect-[21/9] bg-[#eaf3f6]">
                      {branchImage ? (
                        <img
                          alt={branch.nameEn}
                          className="h-full w-full object-cover"
                          src={branchImage}
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-xs font-semibold text-[#71839e]">
                          No branch hero image
                        </div>
                      )}
                    </div>
                    <div className="p-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-bold text-[#182238]">{branch.nameEn}</p>
                        <span className="rounded-full bg-[#eef8fb] px-2.5 py-1 text-[11px] font-bold text-[#2187a8]">
                          Branch slide
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-[#71839e]">
                        Managed with this branch’s hero content and visibility settings.
                      </p>
                      <Link
                        className="mt-2 inline-flex min-h-10 items-center text-xs font-bold text-[#2187a8] hover:text-[#176d89] hover:underline"
                        to={`/admin/clinic-info/branches?branch=${encodeURIComponent(branch.id)}`}
                      >
                        Edit branch slide →
                      </Link>
                    </div>
                  </article>
                );
              })}
              {branchHeroSlides.length === 0 && !branchHeroQuery.isLoading ? (
                <p className="rounded-xl border border-dashed border-[#dce5ef] bg-[#f8fcfd] p-4 text-sm text-[#71839e]">
                  No published branch slides are enabled for the homepage carousel yet.
                </p>
              ) : null}
            </div>
          </Card>

          {/* Main Layout: Page Selector List + Editor/Preview */}
          <div className="mt-8 grid gap-7 xl:grid-cols-[340px_minmax(0,1fr)]">
            {/* Left Column: Pages List */}
            <Card className="h-fit rounded-2xl border-[#dce5ef] bg-white p-4 shadow-none">
              <h2 className="px-2 text-xs font-bold uppercase tracking-[0.15em] text-[#71839e]">
                Select Page to Edit
              </h2>
              <div className="mt-3 space-y-1.5">
                {HERO_PAGES.map((page) => {
                  const isSelected = page.id === selectedPageId;
                  return (
                    <button
                      aria-current={isSelected ? 'true' : undefined}
                      className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition ${
                        isSelected
                          ? 'bg-[#2187a8] text-white shadow-sm'
                          : 'text-[#182238] hover:bg-[#f4f8fb]'
                      }`}
                      key={page.id}
                      onClick={() => setSelectedPageId(page.id)}
                      type="button"
                    >
                      <span
                        className={`grid size-8 shrink-0 place-items-center rounded-lg ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#eef8fb] text-[#2187a8]'
                        }`}
                      >
                        <AdminIcon className="size-4" name={page.icon} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-bold">{page.name}</span>
                        <span
                          className={`block truncate text-[12px] ${
                            isSelected ? 'text-white/80' : 'text-[#71839e]'
                          }`}
                        >
                          {page.subtitle}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Right Column: Hero Editor & Live Preview */}
            <div className="space-y-6">
              {/* Live Preview Card */}
              <Card className="overflow-hidden rounded-2xl border-[#dce5ef] bg-white p-5 shadow-none sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1f5] pb-4">
                  <div>
                    <h2 className="text-[16px] font-bold text-[#182238]">
                      {isPublishedHero
                          ? `Live Page Layout · ${activePage.name}`
                          : `Draft Editor Preview · ${activePage.name}`}
                    </h2>
                    <p className="mt-0.5 text-xs text-[#71839e]">
                      {isPublishedHero
                          ? 'This is the layout currently shown to website visitors.'
                          : 'Draft changes are not visible to website visitors until you publish them.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#71839e]">Preview language:</span>
                    <div className="inline-flex rounded-lg border border-[#dce5ef] p-0.5">
                      <button
                        className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                          previewLanguage === 'en'
                            ? 'bg-[#2187a8] text-white'
                            : 'text-[#71839e] hover:text-[#182238]'
                        }`}
                        onClick={() => setPreviewLanguage('en')}
                        type="button"
                      >
                        English
                      </button>
                      <button
                        className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                          previewLanguage === 'km'
                            ? 'bg-[#2187a8] text-white'
                            : 'text-[#71839e] hover:text-[#182238]'
                        }`}
                        onClick={() => setPreviewLanguage('km')}
                        type="button"
                      >
                        ខ្មែរ
                      </button>
                    </div>
                  </div>
                </div>

                {/* Banner Visual Preview Box */}
                <div
                  className={`relative mt-5 overflow-hidden rounded-xl border border-[#d9e9ee] ${previewShowsImage ? 'bg-[#063e5c]' : 'bg-[linear-gradient(120deg,#fafdfe_0%,#edf7fa_100%)]'}`}
                >
                  <div className="relative min-h-[220px] sm:min-h-[280px]">
                    {previewShowsImage ? (
                      <img
                        alt={previewTitle}
                        className="absolute inset-0 h-full w-full object-cover"
                        src={previewImage}
                        style={{
                          objectPosition: `${form.imagePresentation.positionX}% ${form.imagePresentation.positionY}%`,
                          transform: `scale(${form.imagePresentation.zoom})`,
                        }}
                      />
                    ) : null}
                    {activePage.placement === 'CONTACT_HERO' ? (
                      <div className="relative z-10 grid min-h-[220px] items-center gap-4 p-4 sm:min-h-[280px] sm:grid-cols-[minmax(0,1fr)_220px] sm:gap-6 sm:p-6">
                        <div className="max-w-[360px]">
                          {previewEyebrow ? (
                            <p className="text-[10px] font-extrabold uppercase leading-4 tracking-[2.5px] text-[#3695B9] sm:text-[11px] sm:tracking-[3px]">
                              {previewEyebrow}
                            </p>
                          ) : null}
                          <h3 className="mt-1 text-[18px] font-extrabold leading-tight tracking-[-0.03em] text-[#005687] sm:mt-2 sm:text-[24px]">
                            {previewTitle}
                          </h3>
                          {previewSubtitle ? (
                            <p className="mt-2 text-[12px] font-medium leading-relaxed text-[#0e3b5e] sm:text-[13px]">
                              {previewSubtitle}
                            </p>
                          ) : null}
                        </div>
                        <div className="hidden rounded-xl border border-[#d9e9ee] bg-white/95 p-3.5 shadow-[0_4px_16px_rgba(0,86,135,0.08)] backdrop-blur-md sm:block">
                          {contactQuery.isLoading ? (
                            <div className="h-24 animate-pulse rounded-lg bg-[#eef8fb]" />
                          ) : (
                            <div className="space-y-2.5">
                              {contactPreviewItems.map((item) => (
                                <div className="flex items-center gap-2.5" key={item.label}>
                                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#eef8fb] text-[#3695b9]">
                                    <ContactIcon className="size-3.5" name={item.icon} />
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-[#3695b9]">
                                      {item.label}
                                    </p>
                                    <p className="whitespace-pre-line text-[11px] font-extrabold text-[#005687]">
                                      {item.value}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : activePage.previewLayout === 'light' ? (
                      <div className="relative z-10 flex min-h-[220px] items-center p-4 sm:min-h-[280px] sm:p-6">
                        <div className="max-w-[420px]">
                          {previewEyebrow ? (
                            <p className="text-[10px] font-extrabold uppercase leading-4 tracking-[2.5px] text-[#3695B9] sm:text-[11px] sm:tracking-[3px]">
                              {previewEyebrow}
                            </p>
                          ) : null}
                          <h3 className="mt-1 text-[18px] font-extrabold leading-tight tracking-[-0.03em] text-[#005687] sm:mt-2 sm:text-[24px]">
                            {previewTitle}
                          </h3>
                          {previewSubtitle ? (
                            <p className="mt-2 text-[12px] font-medium leading-relaxed text-[#0e3b5e] sm:text-[13px]">
                              {previewSubtitle}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : activePage.previewLayout ===
                      'image-only' /* Doctors hero displays the clean doctor team photo without text or overlay so all doctors are clearly visible */ ? null : activePage.previewLayout ===
                        'overlay-or-text' && !previewShowsImage ? (
                      <div className="flex min-h-[220px] items-center justify-center p-6 text-center sm:min-h-[280px] sm:p-10">
                        <div className="max-w-[620px]">
                          {previewEyebrow ? (
                            <p className="ui-eyebrow text-[11px] font-bold uppercase tracking-[3px] text-[#3695B9] sm:text-[12px] sm:tracking-[3.6px]">
                              {previewEyebrow}
                            </p>
                          ) : null}
                          <h3 className="mt-2 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-[#005687] sm:text-[38px]">
                            {previewTitle}
                          </h3>
                          {previewSubtitle ? (
                            <p className="mt-3 text-[16px] font-medium leading-7 text-[#607486]">
                              {previewSubtitle}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#021827]/90 via-[#021827]/40 to-transparent sm:bg-[linear-gradient(100deg,rgba(2,24,39,0.88)_0%,rgba(2,24,39,0.5)_42%,rgba(2,24,39,0.1)_70%,transparent_100%)]"
                        />
                        <div className="relative z-10 flex min-h-[220px] max-w-[640px] flex-col justify-end p-6 text-white sm:min-h-[280px] sm:p-8">
                          {previewEyebrow ? (
                            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[11px] font-bold uppercase tracking-[1.5px] text-[#7ee1f8] backdrop-blur-md">
                              <span className="size-1.5 rounded-full bg-[#7ee1f8] shadow-[0_0_8px_#7ee1f8]" />
                              <span>{previewEyebrow}</span>
                            </div>
                          ) : null}
                          <h3
                            className={`${previewEyebrow ? 'mt-2.5' : ''} text-[22px] font-extrabold leading-tight tracking-[-0.03em] text-white sm:text-[30px]`}
                          >
                            {previewTitle}
                          </h3>
                          {previewSubtitle ? (
                            <p className="mt-2 text-[13px] leading-relaxed text-[#e1f0f5] sm:text-[14px] sm:leading-6">
                              {previewSubtitle}
                            </p>
                          ) : null}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>

              {/* Editor Form Card */}
              <Card className="rounded-2xl border-[#dce5ef] bg-white p-5 shadow-none sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1f5] pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#182238]">
                      {`Edit ${activePage.name} Content`}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#71839e]">
                      Configure the image, focal point, and bilingual copy for this page.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#71839e]">Current status:</span>
                    <AdminPublicationStatus
                      status={
                        existingRecord
                          ? (form.status.toLowerCase() as 'published' | 'draft')
                          : 'draft'
                      }
                    />
                  </div>
                </div>

                <form
                  className="mt-6 space-y-6"
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveMutation.mutate();
                  }}
                >
                  {/* Hero Photo Upload & Framing */}
                  <div className="space-y-4">
                    <MediaUploader
                      category="clinic"
                      framing={{
                        frames: pageHeroFrames(activePage.placement),
                        onChange: (imagePresentation) =>
                          setForm((prev) => ({ ...prev, imagePresentation })),
                        value: form.imagePresentation,
                      }}
                      help={
                        activePage.supportsCopy === false
                          ? 'Choose the team photo shown at the top of the Doctors page. JPEG, PNG, or WEBP up to 5 MB.'
                          : 'Choose a high quality landscape photo. JPEG, PNG, or WEBP up to 5 MB.'
                      }
                      label={
                        activePage.supportsCopy === false
                          ? 'Doctor Team Photo'
                          : 'Hero Background Photo'
                      }
                      onClear={() => setForm((prev) => ({ ...prev, imageKey: '' }))}
                      onUploaded={(key) => setForm((prev) => ({ ...prev, imageKey: key }))}
                      required
                      value={form.imageKey}
                    />
                  </div>

                  {/* Publication Status Selector */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-[#52647d]">
                      Publication Status
                      <select
                        className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-sm text-[#182238]"
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            status: e.target.value as 'DRAFT' | 'PUBLISHED',
                          }))
                        }
                        value={form.status}
                      >
                        <option value="PUBLISHED">Published (Visible on live site)</option>
                        <option value="DRAFT">
                          Draft (Saved but not visible to website visitors)
                        </option>
                      </select>
                    </label>
                  </div>

                  {activePage.supportsCopy !== false ? (
                    <>
                      {/* Bilingual Eyebrow Badge */}
                      <fieldset className="rounded-xl border border-[#dce5ef] p-4 sm:p-5">
                        <legend className="px-1 text-xs font-bold uppercase tracking-[0.14em] text-[#2187a8]">
                          Eyebrow / Category Badge (Small upper label)
                        </legend>
                        <div className="mt-2 grid gap-4 sm:grid-cols-2">
                          <label className="text-sm font-semibold text-[#52647d]">
                            Badge · English
                            <input
                              className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3 text-sm"
                              maxLength={80}
                              onChange={(e) =>
                                setForm((prev) => ({ ...prev, badgeEn: e.target.value }))
                              }
                              placeholder={activePage.defaultEyebrowEn}
                              value={form.badgeEn}
                            />
                          </label>
                          <label className="text-sm font-semibold text-[#52647d]">
                            ផ្លាកចំណងជើង · ខ្មែរ
                            <input
                              className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3 text-sm"
                              maxLength={80}
                              onChange={(e) =>
                                setForm((prev) => ({ ...prev, badgeKm: e.target.value }))
                              }
                              placeholder={activePage.defaultEyebrowKm}
                              value={form.badgeKm}
                            />
                          </label>
                        </div>
                      </fieldset>

                      {/* Bilingual Main Heading / Title */}
                      <fieldset className="rounded-xl border border-[#dce5ef] p-4 sm:p-5">
                        <legend className="px-1 text-xs font-bold uppercase tracking-[0.14em] text-[#2187a8]">
                          Hero Title / Main Heading
                        </legend>
                        <div className="mt-2 grid gap-4 sm:grid-cols-2">
                          <label className="text-sm font-semibold text-[#52647d]">
                            Title · English
                            <input
                              className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3 text-sm"
                              maxLength={160}
                              onChange={(e) =>
                                setForm((prev) => ({ ...prev, titleEn: e.target.value }))
                              }
                              placeholder={activePage.defaultTitleEn}
                              value={form.titleEn}
                            />
                          </label>
                          <label className="text-sm font-semibold text-[#52647d]">
                            ចំណងជើងធំ · ខ្មែរ
                            <input
                              className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3 text-sm"
                              maxLength={160}
                              onChange={(e) =>
                                setForm((prev) => ({ ...prev, titleKm: e.target.value }))
                              }
                              placeholder={activePage.defaultTitleKm}
                              value={form.titleKm}
                            />
                          </label>
                        </div>
                      </fieldset>

                      {/* Bilingual Subtitle / Description */}
                      <fieldset className="rounded-xl border border-[#dce5ef] p-4 sm:p-5">
                        <legend className="px-1 text-xs font-bold uppercase tracking-[0.14em] text-[#2187a8]">
                          Subtitle / Supporting Description
                        </legend>
                        <div className="mt-2 grid gap-4 sm:grid-cols-2">
                          <label className="text-sm font-semibold text-[#52647d]">
                            Description · English
                            <textarea
                              className="mt-2 min-h-24 w-full rounded-xl border border-[#dce5ef] p-3 text-sm leading-6"
                              maxLength={600}
                              onChange={(e) =>
                                setForm((prev) => ({ ...prev, bodyEn: e.target.value }))
                              }
                              placeholder={activePage.defaultSubtitleEn}
                              value={form.bodyEn}
                            />
                          </label>
                          <label className="text-sm font-semibold text-[#52647d]">
                            ការពិពណ៌នា · ខ្មែរ
                            <textarea
                              className="mt-2 min-h-24 w-full rounded-xl border border-[#dce5ef] p-3 text-sm leading-6"
                              maxLength={600}
                              onChange={(e) =>
                                setForm((prev) => ({ ...prev, bodyKm: e.target.value }))
                              }
                              placeholder={activePage.defaultSubtitleKm}
                              value={form.bodyKm}
                            />
                          </label>
                        </div>
                      </fieldset>
                    </>
                  ) : (
                    <p className="rounded-xl border border-[#dce5ef] bg-[#f8fcfd] px-4 py-3 text-sm leading-6 text-[#52647d]">
                      The Doctors page hero is a team photo only. Its title and supporting copy are
                      managed by the public page design, so there are no unused text fields here.
                    </p>
                  )}

                  {/* Actions Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#edf1f5] pt-5">
                    <div>
                      {existingRecord ? (
                        <Button
                          className="border border-[#fecdca] bg-[#fff5f5] text-[#b42318] shadow-none hover:bg-[#fee2e2]"
                          disabled={removeMutation.isPending || saveMutation.isPending}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Reset ${activePage.name} hero to defaults? The custom hero copy and image will be removed.`,
                              )
                            ) {
                              removeMutation.mutate();
                            }
                          }}
                          type="button"
                          variant="secondary"
                        >
                          {removeMutation.isPending ? 'Resetting…' : 'Reset to Defaults'}
                        </Button>
                      ) : null}
                    </div>
                    <Button
                      className="bg-[#2187a8] px-6 text-white hover:bg-[#1a718c]"
                      disabled={saveMutation.isPending || !form.imageKey}
                      type="submit"
                    >
                      {saveMutation.isPending ? 'Saving…' : 'Save Hero Section'}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
