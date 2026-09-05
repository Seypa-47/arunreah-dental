import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import { getPublicMediaUrl } from '@/services/media';
import { useShowcaseDetailPageQuery } from './use-showcase-detail-page';


export function ShowcaseDetailPage() {
  const { showcaseSlug } = useParams();
  const { data, isError, isLoading, refetch } = useShowcaseDetailPageQuery(showcaseSlug);

  if (isLoading) return <main aria-busy="true" className="min-h-screen bg-[#f7fafc]" />;
  if (isError || !data) return <main className="grid min-h-screen place-items-center bg-[#f7fafc] px-4"><Card className="max-w-lg p-8 text-center"><Badge className="bg-[#fff1e6] text-[#9d4d18]">Not found</Badge><h1 className="mt-4 text-2xl font-extrabold text-[#005687]">This showcase is unavailable</h1><p className="mt-2 text-sm text-[#62798b]">It may no longer be published.</p><Button className="mt-6" onClick={() => void refetch()}>Retry</Button></Card></main>;

  const { showcase } = data;
  return (
    <SiteLayout actions={data.chrome.actions} navigation={data.chrome.navigation} services={data.chrome.services}>
      <main className="bg-white pb-16">
        <article>
          {getPublicMediaUrl(showcase.coverImageKey) ? <img alt={showcase.title} className="h-[360px] w-full bg-[#edf5f8] object-cover sm:h-[480px]" src={getPublicMediaUrl(showcase.coverImageKey)} /> : <div aria-hidden="true" className="h-[360px] w-full bg-[#edf5f8] sm:h-[480px]" />}
          <div className="mx-auto max-w-[850px] px-4 py-12 sm:px-6">
            {showcase.category ? <Badge className="bg-[#eef8fb] text-[#005687]">{showcase.category}</Badge> : null}
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-[#005687] sm:text-4xl">{showcase.title}</h1>
            {showcase.summary ? <p className="mt-4 text-lg leading-8 text-[#62798b]">{showcase.summary}</p> : null}
            {showcase.body ? <div className="mt-8 whitespace-pre-line text-[15px] leading-8 text-[#4f6474]">{showcase.body}</div> : null}
            {showcase.sections.map((section) => <section className="mt-10" key={`${section.displayOrder}-${section.heading ?? 'section'}`}><>{section.imageKey && getPublicMediaUrl(section.imageKey) ? <img alt={section.heading ?? ''} className="mb-5 max-h-[460px] w-full rounded-xl object-cover" src={getPublicMediaUrl(section.imageKey)} /> : null}{section.heading ? <h2 className="text-2xl font-extrabold text-[#005687]">{section.heading}</h2> : null}{section.body ? <p className="mt-3 whitespace-pre-line leading-7 text-[#4f6474]">{section.body}</p> : null}</></section>)}
          </div>
        </article>
        {showcase.relatedShowcases.length > 0 ? <section className="bg-[#f7fafc] py-12"><div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8"><h2 className="text-2xl font-extrabold text-[#005687]">Related Showcases</h2><div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{showcase.relatedShowcases.map((related) => <Link className="rounded-xl bg-white p-4 shadow-sm hover:shadow-md" key={related.slug} to={`/showcases/${related.slug}`}>{getPublicMediaUrl(related.coverImageKey) ? <img alt={related.title} className="h-40 w-full rounded-lg object-cover" src={getPublicMediaUrl(related.coverImageKey)} /> : <div aria-hidden="true" className="h-40 w-full rounded-lg bg-[#edf5f8]" />}<h3 className="mt-3 font-bold text-[#005687]">{related.title}</h3></Link>)}</div></div></section> : null}
      </main>
      <SiteFooter {...data.chrome.footer} />
    </SiteLayout>
  );
}
