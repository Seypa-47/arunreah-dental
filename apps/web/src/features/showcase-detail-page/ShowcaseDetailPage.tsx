import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SkeletonBlock, SkeletonImage, SkeletonSection, SkeletonText } from '@/components/ui/skeleton';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import { CmsImage, ContentBlocks, ResilientImage } from '@/components/layout/public-ui';
import { getPublicMediaUrl } from '@/services/media';
import { publicShell } from '@/features/public-content/public-page-chrome';
import { useShowcaseDetailPageQuery } from './use-showcase-detail-page';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { publicUiCopy } from '@/features/public-content/public-ui-copy';
import { isPublicNotFoundError } from '@/features/public-content/public-errors';
import {
  buildBreadcrumbStructuredData,
  publicSiteOrigin,
  usePublicDocumentTitle,
} from '@/features/public-content/public-document-title';

export function ShowcaseDetailPage() {
  const { showcaseSlug } = useParams();
  const { data, error, isError, isLoading, refetch } = useShowcaseDetailPageQuery(showcaseSlug);
  const { language } = usePublicLanguage();
  const copy = publicUiCopy(language);
  usePublicDocumentTitle(
    data?.showcase.seo.title ?? data?.showcase.title ?? (language === 'km' ? 'ស្នាដៃ' : 'Showcase'),
    data?.showcase.seo.description ?? data?.showcase.summary,
    {
      imageUrl: data?.showcase.coverImageKey ? getPublicMediaUrl(data.showcase.coverImageKey) : undefined,
      noIndex: isError && isPublicNotFoundError(error),
      type: 'article',
      structuredData: data?.showcase
        ? [
            buildBreadcrumbStructuredData([
              { name: 'Home', path: '/' },
              { name: language === 'km' ? 'ស្នាដៃ' : 'Showcases', path: '/showcases' },
              { name: data.showcase.title, path: `/showcases/${data.showcase.slug}` },
            ]),
            {
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: data.showcase.title,
              description: data.showcase.seo.description ?? data.showcase.summary,
              image: data.showcase.coverImageKey ? getPublicMediaUrl(data.showcase.coverImageKey) : undefined,
              mainEntityOfPage: `${publicSiteOrigin}/showcases/${data.showcase.slug}`,
              publisher: { '@id': `${publicSiteOrigin}/#organization` },
            },
          ]
        : null,
    },
  );

  if (isLoading) return <ShowcaseDetailPageSkeleton />;
  if ((isError && isPublicNotFoundError(error)) || (!isError && !data)) return <main className="grid min-h-screen place-items-center bg-[#f7fafc] px-4"><Card className="max-w-lg p-8 text-center"><Badge>{copy.showcaseDetail.notFound}</Badge><h1 className="mt-4 text-2xl font-extrabold text-[#005687]">{copy.showcaseDetail.errorTitle}</h1><p className="mt-2 text-sm text-[#62798b]">{copy.showcaseDetail.errorBody}</p><Link className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#3695B9] px-5 text-sm font-extrabold text-white hover:bg-[#2c84a5]" to="/showcases">{language === 'km' ? 'មើលស្នាដៃទាំងអស់' : 'Browse Showcases'}</Link></Card></main>;
  if (isError || !data) return <main className="grid min-h-screen place-items-center bg-[#f7fafc] px-4"><Card className="max-w-lg p-8 text-center"><Badge className="bg-[#fff1e6] text-[#9d4d18]">{copy.common.error}</Badge><h1 className="mt-4 text-2xl font-extrabold text-[#005687]">{language === 'km' ? 'យើងមិនអាចផ្ទុកស្នាដៃនេះបានទេ' : 'We could not load this showcase'}</h1><p className="mt-2 text-sm text-[#62798b]">{language === 'km' ? 'សូមព្យាយាមម្ដងទៀត។' : 'Please try again to refresh this article.'}</p><Button className="mt-6" onClick={() => void refetch()}>{copy.common.retry}</Button></Card></main>;

  const { showcase } = data;
  const coverImageUrl = getPublicMediaUrl(showcase.coverImageKey);

  return (
    <SiteLayout actions={data.chrome.actions} navigation={data.chrome.navigation} services={data.chrome.services}>
      <main className="bg-white">
        <article>
          <div className="border-b border-[#e7eff3] bg-[#f7fafc] py-6 sm:py-8">
            <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
              <div className="mb-4">
                <Link
                  className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#3695B9] transition hover:text-[#167ea7]"
                  to="/showcases"
                >
                  <span aria-hidden="true">←</span>
                  <span>{copy.showcaseDetail.backToShowcases}</span>
                </Link>
              </div>
              <div className="overflow-hidden rounded-xl bg-[#edf5f8]">
                <CmsImage
                  alt={showcase.title}
                  className="h-[250px] w-full object-cover sm:h-[390px]"
                  fallbackSrc="/assets/landing/showcase-room.png"
                  loading="eager"
                  presentation={showcase.coverImagePresentation}
                  src={coverImageUrl}
                />
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-[820px] px-4 py-10 sm:px-6 sm:py-14">
            {showcase.category ? <Badge className="bg-[#eef8fb] text-[11px] font-bold text-[#005687]">{showcase.category}</Badge> : null}
            <h1 className="ui-copy-safe mt-3 text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-[#005687] sm:text-[42px]">{showcase.title}</h1>
            {showcase.summary ? <p className="mt-4 max-w-[720px] text-[18px] leading-8 text-[#64748b]">{showcase.summary}</p> : null}
            {showcase.body ? <ContentBlocks className="mt-7 text-[16px] leading-8 text-[#465d6c]" value={showcase.body} /> : null}
            {showcase.sections.map((section) => {
              const sectionImageUrl = section.imageKey ? getPublicMediaUrl(section.imageKey) : null;

              return (
                <section className="mt-9 border-t border-[#e7eff3] pt-8" key={`${section.displayOrder}-${section.heading ?? 'section'}`}>
                    {sectionImageUrl ? <div className="mb-5 overflow-hidden rounded-xl bg-[#edf5f8]"><ResilientImage alt={section.heading ?? showcase.title} className="h-[200px] w-full object-cover sm:h-[420px]" presentation={section.imagePresentation} src={sectionImageUrl} /></div> : null}
                  {section.heading ? <h2 className="text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-[#005687] sm:text-[28px]">{section.heading}</h2> : null}
                  {section.body ? <ContentBlocks className="mt-3 text-[16px] leading-8 text-[#465d6c]" value={section.body} /> : null}
                </section>
              );
            })}
          </div>
        </article>
        {showcase.relatedShowcases.length > 0 ? (
          <section className="border-t border-[#e7eff3] bg-[#f7fafc] py-10 sm:py-12">
            <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
              <h2 className="text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-[#005687] sm:text-[28px]">{copy.showcaseDetail.related}</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {showcase.relatedShowcases.map((related) => {
                  const relatedImageUrl = getPublicMediaUrl(related.coverImageKey);

                  return (
                    <Link className={`group flex min-h-[150px] overflow-hidden rounded-xl border border-[#e1ebef] bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#cfe4ec] hover:shadow-[0_8px_20px_rgba(15,23,42,0.07)] ${relatedImageUrl ? 'sm:block' : 'sm:flex'}`} key={related.slug} to={`/showcases/${related.slug}`}>
                      {relatedImageUrl ? (
                        <div className="h-[150px] w-[40%] shrink-0 overflow-hidden bg-[#edf5f8] sm:h-40 sm:w-full">
                          <CmsImage alt={related.title} className="h-full w-full object-cover" presentation={related.coverImagePresentation} src={relatedImageUrl} />
                        </div>
                      ) : null}
                      <div className="flex min-w-0 flex-1 items-center p-4 sm:block">
                        <h3 className="line-clamp-2 text-[15px] font-bold leading-5 text-[#005687] transition group-hover:text-[#167ea7]">{related.title}</h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter {...data.chrome.footer} />
    </SiteLayout>
  );
}

export function ShowcaseDetailPageSkeleton() {
  const { language } = usePublicLanguage();
  const shell = publicShell(language);
  const copy = publicUiCopy(language).showcaseDetail;
  return (
    <SiteLayout actions={shell.actions} navigation={shell.navigation}>
      <main aria-busy="true" className="bg-white">
        <span className="sr-only">{copy.loading}</span>

        <article>
          <SkeletonSection className="border-b border-[#e7eff3] bg-[#f7fafc] py-6 sm:py-8" data-skeleton-section="showcase-cover">
            <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
              <SkeletonBlock className="mb-4 h-4 w-36 rounded-full" data-skeleton-slot="back-link" />
              <SkeletonImage className="h-[250px] w-full sm:h-[390px]" data-skeleton-slot="cover-image" />
            </div>
          </SkeletonSection>

          <SkeletonSection className="mx-auto max-w-[820px] px-4 py-10 sm:px-6 sm:py-14" data-skeleton-section="showcase-article">
            <SkeletonBlock className="h-5 w-24 rounded-full" />
            <SkeletonBlock className="mt-4 h-10 w-[92%] sm:h-12" data-skeleton-slot="title" />
            <SkeletonBlock className="mt-3 h-10 w-[66%] sm:h-12" />
            <SkeletonText className="mt-6" lineClassName="h-4" lines={3} widths={['100%', '92%', '70%']} data-skeleton-slot="summary" />
            <SkeletonText className="mt-9 border-t border-[#e7eff3] pt-8" lineClassName="h-4" lines={5} widths={['100%', '100%', '100%', '86%', '68%']} data-skeleton-slot="body" />

            <div className="mt-9 border-t border-[#e7eff3] pt-8" data-skeleton-slot="content-section">
              <SkeletonImage className="mb-5 h-[200px] w-full sm:h-[420px]" />
              <SkeletonBlock className="h-7 w-56 max-w-full" />
              <SkeletonText className="mt-4" lineClassName="h-4" lines={3} widths={['100%', '84%', '62%']} />
            </div>
          </SkeletonSection>
        </article>
      </main>
    </SiteLayout>
  );
}
