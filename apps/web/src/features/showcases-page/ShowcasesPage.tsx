import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import { getPublicMediaUrl } from '@/services/media';
import type { PublicShowcaseSummary } from '@/services/public-content';
import { useShowcasesPageQuery } from './use-showcases-page';


function ShowcaseCard({ showcase }: { showcase: PublicShowcaseSummary }) {
  return (
    <Card className="group overflow-hidden rounded-xl border-[#edf2f7] bg-white shadow-[0_2px_6px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(15,23,42,0.1)]">
      <Link className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]" to={`/showcases/${showcase.slug}`}>
        {getPublicMediaUrl(showcase.coverImageKey) ? <img alt={showcase.title} className="h-56 w-full bg-[#edf5f8] object-cover" src={getPublicMediaUrl(showcase.coverImageKey)} /> : <div aria-hidden="true" className="h-56 w-full bg-[#edf5f8]" />}
        <div className="p-5">
          {showcase.category ? <Badge className="bg-[#eef8fb] text-[#005687]">{showcase.category}</Badge> : null}
          <h2 className="mt-3 text-xl font-extrabold text-[#005687] group-hover:text-[#3695B9]">{showcase.title}</h2>
          {showcase.summary ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#62798b]">{showcase.summary}</p> : null}
          <span className="mt-4 inline-block text-sm font-bold text-[#3695B9]">Read showcase →</span>
        </div>
      </Link>
    </Card>
  );
}

export function ShowcasesPage() {
  const { data, isError, isLoading, refetch } = useShowcasesPageQuery();

  if (isLoading) return <main aria-busy="true" className="min-h-screen bg-[#f7fafc]" />;
  if (isError || !data) {
    return <main className="grid min-h-screen place-items-center bg-[#f7fafc] px-4"><Card className="max-w-lg p-8 text-center"><Badge className="bg-[#fff1e6] text-[#9d4d18]">Error</Badge><h1 className="mt-4 text-2xl font-extrabold text-[#005687]">We could not load showcases</h1><Button className="mt-6" onClick={() => void refetch()}>Retry</Button></Card></main>;
  }

  return (
    <SiteLayout actions={data.chrome.actions} navigation={data.chrome.navigation} services={data.chrome.services}>
      <main className="bg-[#f7fafc] pb-16">
        <section className="bg-white py-14 text-center"><p className="text-xs font-bold uppercase tracking-[3px] text-[#3695B9]">Our work</p><h1 className="mt-3 text-4xl font-extrabold text-[#005687]">Latest Showcases</h1></section>
        <section className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
          {data.showcases.length === 0 ? <Card className="p-8 text-center text-[#62798b]">No showcases are available right now.</Card> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.showcases.map((showcase) => <ShowcaseCard key={showcase.slug} showcase={showcase} />)}</div>}
        </section>
      </main>
      <SiteFooter {...data.chrome.footer} />
    </SiteLayout>
  );
}
