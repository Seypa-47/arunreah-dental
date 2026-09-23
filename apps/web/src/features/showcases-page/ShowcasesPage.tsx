import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import { ImageFrame, PageContainer, PageFeedback, ResilientImage, SectionIntro } from '@/components/layout/public-ui';
import { getPublicMediaUrl } from '@/services/media';
import type { PublicShowcaseSummary } from '@/services/public-content';
import { publicShell } from '@/features/public-content/public-page-chrome';
import { useShowcasesPageQuery } from './use-showcases-page';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { publicUiCopy } from '@/features/public-content/public-ui-copy';


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
  const description = heroMedia?.body;

  return (
    <section className="border-b border-[#e7eff3] bg-[#f7fafc] py-5 sm:py-7">
      <PageContainer>
        {imageUrl ? (
          <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-[#d9e9ee] bg-[#00546f] sm:min-h-[380px] lg:min-h-[420px]">
            <ResilientImage alt={title} className="absolute inset-0 h-full w-full object-cover object-center" presentation={heroMedia?.imagePresentation} src={imageUrl} />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#021827]/90 via-[#021827]/40 to-transparent sm:bg-[linear-gradient(100deg,rgba(2,24,39,0.88)_0%,rgba(2,24,39,0.5)_42%,rgba(2,24,39,0.1)_70%,transparent_100%)]"
            />
            <div className="relative z-10 flex min-h-[320px] max-w-[720px] flex-col justify-end p-6 sm:min-h-[380px] sm:p-10 lg:min-h-[420px] lg:p-12">
              <div>
                {eyebrow ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[1.8px] text-[#7ee1f8] backdrop-blur-md sm:text-[12px]">
                    <span className="size-1.5 rounded-full bg-[#7ee1f8] shadow-[0_0_8px_#7ee1f8]" />
                    <span>{eyebrow}</span>
                  </div>
                ) : null}
                <h1 className={`${eyebrow ? 'mt-3.5' : ''} text-[28px] font-extrabold leading-[1.18] tracking-[-0.03em] text-white sm:text-[38px] lg:text-[44px]`}>{title}</h1>
                {description ? <p className="mt-3.5 max-w-[600px] text-[15px] font-normal leading-relaxed text-[#e1f0f5] sm:text-[16px] sm:leading-7">{description}</p> : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#d9e9ee] bg-[linear-gradient(120deg,#fafdfe_0%,#edf7fa_100%)] px-5 py-11 text-center shadow-[0_5px_20px_rgba(15,61,84,0.04)] sm:px-8 sm:py-14">
            <SectionIntro align="center" as="h1" description={description ?? undefined} eyebrow={eyebrow} title={title} />
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

  if (isLoading) return <ShowcasesPageSkeleton />;
  if (isError || !data) return <PageFeedback action={<Button onClick={() => void refetch()}>{copy.common.retry}</Button>} body={copy.showcases.errorBody} title={copy.showcases.errorTitle} />;

  return (
    <SiteLayout actions={data.chrome.actions} navigation={data.chrome.navigation} services={data.chrome.services}>
      <main className="bg-white">
        <ShowcasesHero heroMedia={data.heroMedia} />
        <section className="py-10 sm:py-14"><PageContainer>
          {data.showcases.length === 0 ? <Card className="rounded-xl border-[#e1ebef] p-8 text-center text-[16px] text-[#64748b]">{copy.showcases.empty}</Card> : <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">{data.showcases.map((showcase) => <ShowcaseCard key={showcase.slug} showcase={showcase} />)}</div>}
        </PageContainer></section>
      </main>
      <SiteFooter {...data.chrome.footer} />
    </SiteLayout>
  );
}

function ShowcasesPageSkeleton() {
  const { language } = usePublicLanguage();
  const shell = publicShell(language);
  const copy = publicUiCopy(language).showcases;
  return (
    <SiteLayout actions={shell.actions} navigation={shell.navigation}>
      <main aria-busy="true" aria-label={copy.loading} className="bg-white">
        <span className="sr-only">{copy.loading}</span>

        <section aria-hidden="true" className="border-b border-[#e7eff3] bg-[#f7fafc] px-4 py-10 text-center sm:px-6 sm:py-12">
          <div className="mx-auto max-w-[620px] animate-pulse">
            <div className="mx-auto h-3 w-24 rounded-full bg-[#dcebf0]" />
            <div className="mx-auto mt-3 h-9 w-60 max-w-full rounded-lg bg-[#d1e6ee] sm:w-72" />
          </div>
        </section>

        <section aria-hidden="true" className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <article className="overflow-hidden rounded-xl border border-[#e1ebef] bg-white" key={index}>
                <div className="h-[220px] w-full animate-pulse bg-[#e3eef2]" />
                <div className="flex min-w-0 flex-1 flex-col justify-center space-y-3 p-4 sm:min-h-[184px] sm:justify-start sm:p-5">
                  <div className="h-5 w-20 animate-pulse rounded-full bg-[#e2f1f5]" />
                  <div className="h-5 w-[92%] animate-pulse rounded-full bg-[#d7e8ee] sm:h-6" />
                  <div className="h-3 w-full animate-pulse rounded-full bg-[#edf4f6]" />
                  <div className="h-3 w-[74%] animate-pulse rounded-full bg-[#edf4f6]" />
                  <div className="h-3 w-24 animate-pulse rounded-full bg-[#dcebf0]" />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-hidden="true" className="border-t border-[#e7eff3] bg-[#f7fafc] px-4 py-10 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-[860px] rounded-xl border border-[#e1ebef] bg-white px-5 py-8 text-center sm:px-12 sm:py-10">
            <div className="mx-auto h-8 w-60 max-w-full animate-pulse rounded-lg bg-[#d1e6ee] sm:w-72" />
            <div className="mx-auto mt-4 h-4 w-[80%] animate-pulse rounded-full bg-[#edf4f6] sm:w-[62%]" />
            <div className="mx-auto mt-2 h-4 w-[64%] animate-pulse rounded-full bg-[#edf4f6] sm:w-[46%]" />
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
