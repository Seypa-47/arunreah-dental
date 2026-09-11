import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import { ImageFrame, PageContainer, PageFeedback, SectionIntro } from '@/components/layout/public-ui';
import { getPublicMediaUrl } from '@/services/media';
import type { PublicShowcaseSummary } from '@/services/public-content';
import { useShowcasesPageQuery } from './use-showcases-page';

const skeletonNavigation = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/branches', label: 'Branches' },
];


function ShowcaseCard({ showcase }: { showcase: PublicShowcaseSummary }) {
  const imageUrl = getPublicMediaUrl(showcase.coverImageKey);

  return (
    <Card className="group overflow-hidden rounded-xl border-[#e1ebef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cfe4ec] hover:shadow-[0_8px_20px_rgba(15,23,42,0.07)]">
      <Link className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]" to={`/showcases/${showcase.slug}`}>
        {imageUrl ? <ImageFrame alt={showcase.title} className="h-[220px] w-full rounded-none border-0 bg-[#edf5f8] shadow-none" src={imageUrl} /> : null}
        <div className="flex min-w-0 flex-1 flex-col p-4 sm:min-h-[184px] sm:p-5">
          {showcase.category ? <Badge className="w-fit bg-[#eef8fb] text-[11px] font-bold text-[#005687]">{showcase.category}</Badge> : null}
          <h2 className="mt-2 line-clamp-2 text-[16px] font-extrabold leading-5 tracking-[-0.015em] text-[#005687] transition group-hover:text-[#167ea7] sm:text-[18px] sm:leading-6">{showcase.title}</h2>
          {showcase.summary ? <p className="mt-2 line-clamp-2 text-[14px] leading-5 text-[#64748b] sm:line-clamp-3 sm:leading-6">{showcase.summary}</p> : null}
          <span className="mt-auto pt-3 text-[13px] font-bold text-[#167ea7]">Read showcase <span aria-hidden="true">→</span></span>
        </div>
      </Link>
    </Card>
  );
}

export function ShowcasesPage() {
  const { data, isError, isLoading, refetch } = useShowcasesPageQuery();

  if (isLoading) return <ShowcasesPageSkeleton />;
  if (isError || !data) return <PageFeedback action={<Button onClick={() => void refetch()}>Retry</Button>} body="Try again to refresh the latest clinic stories." title="We could not load showcases" />;

  return (
    <SiteLayout actions={data.chrome.actions} navigation={data.chrome.navigation} services={data.chrome.services}>
      <main className="bg-white">
        <section className="border-b border-[#e7eff3] bg-[#f7fafc] py-5 sm:py-7">
          <PageContainer><div className="rounded-2xl border border-[#d9e9ee] bg-[linear-gradient(120deg,#fafdfe_0%,#edf7fa_100%)] px-5 py-11 text-center shadow-[0_5px_20px_rgba(15,61,84,0.04)] sm:px-8 sm:py-14"><SectionIntro align="center" as="h1" eyebrow="Our work" title="Latest Showcases" /></div></PageContainer>
        </section>
        <section className="py-10 sm:py-14"><PageContainer>
          {data.showcases.length === 0 ? <Card className="rounded-xl border-[#e1ebef] p-8 text-center text-[16px] text-[#64748b]">No showcases are available right now.</Card> : <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">{data.showcases.map((showcase) => <ShowcaseCard key={showcase.slug} showcase={showcase} />)}</div>}
        </PageContainer></section>
      </main>
      <SiteFooter {...data.chrome.footer} />
    </SiteLayout>
  );
}

function ShowcasesPageSkeleton() {
  return (
    <SiteLayout actions={{ appointmentLabel: 'Book Appointment', contactLabel: 'Contact Us' }} navigation={skeletonNavigation}>
      <main aria-busy="true" aria-label="Loading clinic showcases" className="bg-white">
        <span className="sr-only">Loading clinic showcases</span>

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
