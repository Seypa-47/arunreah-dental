import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import { ImageFrame, PageContainer, PageFeedback, ResilientImage } from '@/components/layout/public-ui';
import { getPublicMediaUrl } from '@/services/media';
import type { PublicShowcaseSummary } from '@/services/public-content';
import { publicShell } from '@/features/public-content/public-page-chrome';
import { useShowcasesPageQuery } from './use-showcases-page';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { publicUiCopy } from '@/features/public-content/public-ui-copy';
import { usePublicDocumentTitle } from '@/features/public-content/public-document-title';
import {
  PublicListingHeroSkeleton,
  publicListingGridClass,
  publicListingHeroContentClass,
  publicListingHeroMediaClass,
  publicListingHeroSectionClass,
} from '@/components/layout/public-listing-skeleton';
import { SkeletonBlock, SkeletonCard, SkeletonImage, SkeletonSection, SkeletonText } from '@/components/ui/skeleton';


function ShowcaseCard({ showcase }: { showcase: PublicShowcaseSummary }) {
  const { language } = usePublicLanguage();
  const copy = publicUiCopy(language).showcases;
  const imageUrl = getPublicMediaUrl(showcase.coverImageKey);

  return (
    <Card className="group overflow-hidden rounded-xl border-[#e1ebef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cfe4ec] hover:shadow-[0_8px_20px_rgba(15,23,42,0.07)]">
      <Link className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]" to={`/showcases/${showcase.slug}`}>
        <ImageFrame alt={showcase.title} className="h-[220px] w-full rounded-none border-0 bg-[#edf5f8] shadow-none" fallbackSrc="/assets/landing/showcase-family.png" presentation={showcase.coverImagePresentation} src={imageUrl} />
        <div className="flex min-w-0 flex-1 flex-col p-4 sm:min-h-[184px] sm:p-5">
          {showcase.category ? <Badge className="w-fit bg-[#eef8fb] text-[11px] font-bold text-[#005687]">{showcase.category}</Badge> : null}
          <h2 className="mt-2 line-clamp-2 text-[16px] font-extrabold leading-5 tracking-[-0.015em] text-[#005687] transition group-hover:text-[#167ea7] sm:text-[18px] sm:leading-6">{showcase.title}</h2>
          {showcase.summary ? <p className="mt-2 line-clamp-2 text-[14px] leading-5 text-[#64748b] sm:line-clamp-3 sm:leading-6">{showcase.summary}</p> : null}
          <span className="mt-auto pt-3 text-[13px] font-bold text-[#167ea7]">{copy.readMore} <span aria-hidden="true">→</span></span>
        </div>
      </Link>
    </Card>
  );
}

function ShowcasesHero({ heroMedia }: { heroMedia?: { badge: string | null; body: string | null; imageKey: string; imagePresentation: import('@arunreah/shared').ImagePresentation; title: string | null } }) {
  const { language } = usePublicLanguage();
  const copy = publicUiCopy(language).showcases;
  const imageUrl = heroMedia?.imageKey ? getPublicMediaUrl(heroMedia.imageKey) : null;
  const eyebrow = heroMedia?.badge || copy.heroEyebrow;
  const title = heroMedia?.title || copy.heroTitle;
  const description = heroMedia?.body || copy.heroSubtitle;

  return (
    <section className={publicListingHeroSectionClass}>
      <PageContainer>
        {imageUrl ? (
          <div className={publicListingHeroMediaClass}>
            <ResilientImage alt={title} className="absolute inset-0 h-full w-full object-cover object-center" presentation={heroMedia?.imagePresentation} src={imageUrl} />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#021827]/90 via-[#021827]/40 to-transparent sm:bg-[linear-gradient(100deg,rgba(2,24,39,0.88)_0%,rgba(2,24,39,0.5)_42%,rgba(2,24,39,0.1)_70%,transparent_100%)]"
            />
            <div className={publicListingHeroContentClass}>
              <div>
                {eyebrow ? (
                  <p className="ui-eyebrow inline-flex w-fit items-center rounded-full bg-[#005687] px-3 py-1 text-[11px] font-extrabold uppercase leading-4 tracking-[0.06em] text-white shadow-sm sm:text-[12px]">
                    {eyebrow}
                  </p>
                ) : null}
                <h1 className={`${eyebrow ? 'mt-3' : ''} text-[28px] font-extrabold leading-[1.18] tracking-[-0.03em] text-white sm:text-[38px] lg:text-[44px]`}>{title}</h1>
                {description ? <p className="mt-3.5 max-w-[600px] text-[15px] font-normal leading-relaxed text-[#e1f0f5] sm:text-[16px] sm:leading-7">{description}</p> : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#d9e9ee] bg-[linear-gradient(120deg,#fafdfe_0%,#edf7fa_100%)] px-5 py-11 text-center shadow-[0_5px_20px_rgba(15,61,84,0.04)] sm:px-8 sm:py-14">
            <div className="mx-auto max-w-[680px] text-center">
              {eyebrow ? (
                <p className="ui-eyebrow inline-flex w-fit items-center rounded-full bg-[#005687] px-3 py-1 text-[11px] font-extrabold uppercase leading-4 tracking-[0.06em] text-white shadow-sm sm:text-[12px]">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="ui-copy-safe mt-2.5 text-[26px] font-extrabold leading-[1.18] tracking-[-0.03em] text-[#005687] sm:mt-3 sm:text-[34px] sm:tracking-[-0.035em]">{title}</h1>
              {description ? <p className="ui-prose mt-3 text-[#607486]">{description}</p> : null}
            </div>
          </div>
        )}
      </PageContainer>
    </section>
  );
}

export function ShowcasesPage() {
  const { data, isError, isLoading, refetch } = useShowcasesPageQuery();
  const { language } = usePublicLanguage();
  const copy = publicUiCopy(language);
  usePublicDocumentTitle(
    data?.heroMedia?.title ?? copy.showcases.heroTitle,
    data?.heroMedia?.body ?? copy.showcases.heroSubtitle,
    { imageUrl: data?.heroMedia?.imageKey ? getPublicMediaUrl(data.heroMedia.imageKey) : undefined },
  );

  if (isLoading) return <ShowcasesPageSkeleton />;
  if (isError || !data) return <PageFeedback action={<Button onClick={() => void refetch()}>{copy.common.retry}</Button>} body={copy.showcases.errorBody} title={copy.showcases.errorTitle} />;

  return (
    <SiteLayout actions={data.chrome.actions} navigation={data.chrome.navigation} services={data.chrome.services}>
      <main className="bg-white">
        <ShowcasesHero heroMedia={data.heroMedia} />
        <section className="py-10 sm:py-14"><PageContainer>
          {data.showcases.length === 0 ? <Card className="rounded-xl border-[#e1ebef] p-8 text-center text-[16px] text-[#64748b]">{copy.showcases.empty}</Card> : <div className={publicListingGridClass}>{data.showcases.map((showcase) => <ShowcaseCard key={showcase.slug} showcase={showcase} />)}</div>}
        </PageContainer></section>
      </main>
      <SiteFooter {...data.chrome.footer} />
    </SiteLayout>
  );
}

export function ShowcasesPageSkeleton() {
  const { language } = usePublicLanguage();
  const shell = publicShell(language);
  const copy = publicUiCopy(language).showcases;
  return (
    <SiteLayout actions={shell.actions} navigation={shell.navigation}>
      <main aria-busy="true" className="bg-white">
        <span className="sr-only">{copy.loading}</span>

        <PublicListingHeroSkeleton />

        <SkeletonSection className="bg-white py-10 sm:py-14" data-skeleton-section="showcases">
          <PageContainer>
            <div className={publicListingGridClass}>
              {Array.from({ length: 3 }, (_, index) => (
                <SkeletonCard className="overflow-hidden rounded-xl" data-skeleton-card="showcase" key={index}>
                  <SkeletonImage className="h-[220px] w-full rounded-none" />
                  <div className="flex flex-col p-4 sm:min-h-[184px] sm:p-5">
                    <SkeletonBlock className="h-5 w-20 rounded-full" />
                    <SkeletonBlock className="mt-3 h-5 w-[92%] rounded-full sm:h-6" />
                    <SkeletonText className="mt-3" lines={2} widths={['100%', '74%']} />
                    <SkeletonBlock className="mt-auto h-3 w-24 rounded-full" />
                  </div>
                </SkeletonCard>
              ))}
            </div>
          </PageContainer>
        </SkeletonSection>
      </main>
    </SiteLayout>
  );
}
