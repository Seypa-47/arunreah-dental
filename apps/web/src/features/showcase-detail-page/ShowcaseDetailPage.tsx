import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import { CmsImage, ResilientImage } from '@/components/layout/public-ui';
import { getPublicMediaUrl } from '@/services/media';
import { publicShell } from '@/features/public-content/public-page-chrome';
import { useShowcaseDetailPageQuery } from './use-showcase-detail-page';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { publicUiCopy } from '@/features/public-content/public-ui-copy';

export function ShowcaseDetailPage() {
  const { showcaseSlug } = useParams();
  const { data, isError, isLoading, refetch } = useShowcaseDetailPageQuery(showcaseSlug);
  const { language } = usePublicLanguage();
  const copy = publicUiCopy(language);

  if (isLoading) return <ShowcaseDetailPageSkeleton />;
  if (isError || !data) return <main className="grid min-h-screen place-items-center bg-[#f7fafc] px-4"><Card className="max-w-lg p-8 text-center"><Badge className="bg-[#fff1e6] text-[#9d4d18]">{copy.showcaseDetail.notFound}</Badge><h1 className="mt-4 text-2xl font-extrabold text-[#005687]">{copy.showcaseDetail.errorTitle}</h1><p className="mt-2 text-sm text-[#62798b]">{copy.showcaseDetail.errorBody}</p><Button className="mt-6" onClick={() => void refetch()}>{copy.common.retry}</Button></Card></main>;

  const { showcase } = data;
  const coverImageUrl = getPublicMediaUrl(showcase.coverImageKey);

  return (
    <SiteLayout actions={data.chrome.actions} navigation={data.chrome.navigation} services={data.chrome.services}>
      <main className="bg-white">
        <article>
          <div className="border-b border-[#e7eff3] bg-[#f7fafc] py-6 sm:py-8">
            <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
              <CmsImage
                alt={showcase.title}
                className="h-[250px] w-full rounded-xl bg-[#edf5f8] object-cover sm:h-[390px]"
                fallbackSrc="/assets/landing/showcase-room.png"
                loading="eager"
                presentation={showcase.coverImagePresentation}
                src={coverImageUrl}
              />
            </div>
          </div>
          <div className="mx-auto max-w-[820px] px-4 py-10 sm:px-6 sm:py-14">
            {showcase.category ? <Badge className="bg-[#eef8fb] text-[11px] font-bold text-[#005687]">{showcase.category}</Badge> : null}
            <h1 className="ui-copy-safe mt-3 text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-[#005687] sm:text-[42px]">{showcase.title}</h1>
            {showcase.summary ? <p className="mt-4 max-w-[720px] text-[18px] leading-8 text-[#64748b]">{showcase.summary}</p> : null}
            {showcase.body ? <div className="mt-7 whitespace-pre-line text-[16px] leading-8 text-[#465d6c]">{showcase.body}</div> : null}
            {showcase.sections.map((section) => {
              const sectionImageUrl = section.imageKey ? getPublicMediaUrl(section.imageKey) : null;

              return (
                <section className="mt-9 border-t border-[#e7eff3] pt-8" key={`${section.displayOrder}-${section.heading ?? 'section'}`}>
                    {sectionImageUrl ? <div className="mb-5 overflow-hidden rounded-xl bg-[#edf5f8]"><ResilientImage alt={section.heading ?? showcase.title} className="h-[200px] w-full object-cover sm:h-[420px]" presentation={section.imagePresentation} src={sectionImageUrl} /></div> : null}
                  {section.heading ? <h2 className="text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-[#005687] sm:text-[28px]">{section.heading}</h2> : null}
                  {section.body ? <p className="mt-3 whitespace-pre-line text-[16px] leading-8 text-[#465d6c]">{section.body}</p> : null}
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
                      {relatedImageUrl ? <CmsImage alt={related.title} className="h-[150px] w-[40%] shrink-0 bg-[#edf5f8] object-cover sm:h-40 sm:w-full" presentation={related.coverImagePresentation} src={relatedImageUrl} /> : null}
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

function ShowcaseDetailPageSkeleton() {
  const { language } = usePublicLanguage();
  const shell = publicShell(language);
  const copy = publicUiCopy(language).showcaseDetail;
  return (
    <SiteLayout actions={shell.actions} navigation={shell.navigation}>
      <main aria-busy="true" aria-label={copy.loading} className="bg-white">
        <span className="sr-only">{copy.loading}</span>

        <article>
          <section aria-hidden="true" className="border-b border-[#e7eff3] bg-[#f7fafc] py-6 sm:py-8">
            <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
              <div className="h-[250px] w-full animate-pulse rounded-xl bg-[linear-gradient(135deg,#dbeef3_0%,#edf5f7_100%)] sm:h-[390px]" />
            </div>
          </section>

          <section aria-hidden="true" className="mx-auto max-w-[820px] px-4 py-10 sm:px-6 sm:py-14">
            <div className="h-5 w-24 animate-pulse rounded-full bg-[#e1f0f4]" />
            <div className="mt-4 h-10 w-[92%] animate-pulse rounded-lg bg-[#d4e7ed] sm:h-12" />
            <div className="mt-3 h-10 w-[66%] animate-pulse rounded-lg bg-[#d4e7ed] sm:h-12" />

            <div className="mt-6 space-y-3">
              <div className="h-4 w-full animate-pulse rounded-full bg-[#e7f0f3]" />
              <div className="h-4 w-[92%] animate-pulse rounded-full bg-[#e7f0f3]" />
              <div className="h-4 w-[70%] animate-pulse rounded-full bg-[#e7f0f3]" />
            </div>

            <div className="mt-9 space-y-3 border-t border-[#e7eff3] pt-8">
              {Array.from({ length: 5 }, (_, index) => (
                <div className={`h-4 animate-pulse rounded-full bg-[#edf4f6] ${index === 4 ? 'w-[68%]' : index === 3 ? 'w-[86%]' : 'w-full'}`} key={index} />
              ))}
            </div>

            <div className="mt-9 border-t border-[#e7eff3] pt-8">
              <div className="h-7 w-56 animate-pulse rounded-lg bg-[#d9e9ee]" />
              <div className="mt-5 h-[220px] w-full animate-pulse rounded-xl bg-[#e4f0f3] sm:h-[320px]" />
              <div className="mt-5 space-y-3">
                <div className="h-4 w-full animate-pulse rounded-full bg-[#edf4f6]" />
                <div className="h-4 w-[84%] animate-pulse rounded-full bg-[#edf4f6]" />
              </div>
            </div>
          </section>
        </article>

        <section aria-hidden="true" className="border-t border-[#e7eff3] bg-[#f7fafc] py-10 sm:py-12">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="h-8 w-56 animate-pulse rounded-lg bg-[#d4e7ed]" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div className="flex min-h-[150px] overflow-hidden rounded-xl border border-[#e1ebef] bg-white sm:block" key={index}>
                  <div className="h-[150px] w-[40%] shrink-0 animate-pulse bg-[#e3eef2] sm:h-40 sm:w-full" />
                  <div className="flex flex-1 items-center p-4 sm:block sm:p-5">
                    <div className="h-5 w-full animate-pulse rounded-full bg-[#dcebf0]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
