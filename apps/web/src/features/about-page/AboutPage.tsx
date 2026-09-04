import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import type { AboutPageContent } from '@/features/landing-page/types';
import { useAboutPageQuery } from './use-about-page';

const skeletonNavigation = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/branches', label: 'Branches' },
];

function ArrowIcon() {
  return (
    <span
      aria-hidden="true"
      className="size-[14px] bg-current [mask-image:url('/assets/landing/arrow-right.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
    />
  );
}

function AboutHero({ hero }: { hero: AboutPageContent['hero'] }) {
  return (
    <section className="relative grid min-h-[300px] place-items-center overflow-hidden py-14 text-center text-white sm:py-16">
      <img alt={hero.imageAlt} className="absolute inset-0 h-full w-full object-cover object-center" src={hero.imageUrl} />
      <div aria-hidden="true" className="absolute inset-0 bg-[#08283a]/55" />
      <div className="relative mx-auto w-full max-w-[780px] px-4">
        <p className="text-[12px] font-extrabold uppercase leading-4 tracking-[4px] text-white/85">{hero.eyebrow}</p>
        <h1 className="mt-4 text-[30px] font-extrabold leading-9 sm:text-[34px] sm:leading-10">{hero.title}</h1>
        <p className="mx-auto mt-3 max-w-[580px] text-[14px] font-normal leading-6 text-white/90">{hero.subtitle}</p>
      </div>
    </section>
  );
}

function StorySection({ stats, story }: Pick<AboutPageContent, 'stats' | 'story'>) {
  return (
    <section className="bg-white py-12 sm:py-14">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[480px_1fr]">
          <img
            alt={story.imageAlt}
            className="h-[340px] w-full rounded-2xl object-cover shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
            src={story.imageUrl}
          />
          <div>
            <p className="text-[12px] font-extrabold uppercase leading-4 tracking-[3.6px] text-[#3695B9]">{story.eyebrow}</p>
            <h2 className="mt-2 text-[26px] font-extrabold leading-8 text-[#005687] sm:text-[30px] sm:leading-9">{story.title}</h2>
            <div className="mt-2 h-1 w-[72px] rounded-full bg-[#3695B9]" />
            <div className="mt-5 space-y-4 text-[14px] font-normal leading-6 text-[#6b7280]">
              {story.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        <Card className="mt-12 grid rounded-xl border-[#edf2f7] bg-white px-6 py-6 shadow-[0_12px_28px_rgba(15,23,42,0.06)] sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              className="flex items-center justify-center gap-3 border-[#edf2f7] py-3 text-center lg:border-r lg:last:border-r-0"
              key={stat.label}
            >
              <img alt="" aria-hidden="true" className="size-5" src={stat.iconUrl} />
              <div>
                <p className="text-[24px] font-extrabold leading-7 text-[#005687]">{stat.value}</p>
                <p className="mt-0.5 text-[11px] font-extrabold uppercase leading-4 text-[#6b7280]">{stat.label}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </section>
  );
}

function VisionMissionSection({
  mission,
  vision,
}: Pick<AboutPageContent, 'mission' | 'vision'>) {
  return (
    <section className="grid lg:grid-cols-2">
      <article className="bg-[#3695B9] px-4 py-12 text-white sm:px-10 lg:py-14 lg:pl-[calc((100vw-1280px)/2)]">
        <div className="ml-auto max-w-[500px] lg:mr-14">
          <div className="mb-4 flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-xl bg-white/16">
              <img alt="" aria-hidden="true" className="size-5 brightness-0 invert" src={vision.iconUrl} />
            </span>
            <h2 className="text-[24px] font-extrabold leading-7 sm:text-[26px]">{vision.title}</h2>
          </div>
          <p className="text-[14px] font-normal leading-6 text-white/85">{vision.description}</p>
        </div>
      </article>
      <article className="relative bg-[#f1f7fa] px-4 py-12 sm:px-10 lg:py-14 lg:pr-[calc((100vw-1280px)/2)]">
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 hidden size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[22px] font-bold text-[#3695B9] shadow-[0_8px_20px_rgba(15,23,42,0.12)] lg:grid"
        >
          +
        </span>
        <div className="max-w-[500px] lg:ml-14">
          <div className="mb-4 flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-xl bg-[#dff2f7]">
              <img alt="" aria-hidden="true" className="size-5" src={mission.iconUrl} />
            </span>
            <h2 className="text-[24px] font-extrabold leading-7 text-[#005687] sm:text-[26px]">{mission.title}</h2>
          </div>
          <p className="text-[14px] font-normal leading-6 text-[#6b7280]">{mission.description}</p>
        </div>
      </article>
    </section>
  );
}

function DifferencesSection({ differences }: Pick<AboutPageContent, 'differences'>) {
  return (
    <section className="bg-white py-12 text-center sm:py-14">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <p className="text-[12px] font-extrabold uppercase leading-4 tracking-[3.6px] text-[#3695B9]">Why Choose Us</p>
        <h2 className="mt-2 text-[26px] font-extrabold leading-8 text-[#005687] sm:text-[30px] sm:leading-9">What Makes Us Different</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {differences.map((item) => (
            <Card className="rounded-xl border-0 bg-[#f7fafc] px-6 py-8 text-center shadow-none" key={item.title}>
              <span className="mx-auto grid size-11 place-items-center rounded-lg bg-white shadow-sm">
                <img alt="" aria-hidden="true" className="max-h-5 max-w-5" src={item.iconUrl} />
              </span>
              <h3 className="mt-5 text-[15px] font-bold leading-5 text-[#005687]">{item.title}</h3>
              <p className="mt-2 text-[13px] font-normal leading-5 text-[#6b7280]">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FacilitiesSection({ facilities }: Pick<AboutPageContent, 'facilities'>) {
  return (
    <section className="bg-[#f7fafc] py-12 sm:py-14">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-extrabold uppercase leading-4 tracking-[3.6px] text-[#3695B9]">
              Our Services & Facilities
            </p>
            <h2 className="mt-2 text-[26px] font-extrabold leading-8 text-[#005687] sm:text-[30px] sm:leading-9">
              Premium Care. Advanced Facilities.
            </h2>
          </div>
          <Link
            className="hidden items-center gap-2 text-[13px] font-extrabold leading-5 text-[#3695B9] hover:text-[#005687] sm:inline-flex"
            to="/services"
          >
            See All Services
            <ArrowIcon />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility) => (
            <article className="overflow-hidden rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" key={facility.title}>
              <img alt={facility.imageAlt} className="h-[200px] w-full rounded-lg object-cover" src={facility.imageUrl} />
              <h3 className="mt-4 text-[16px] font-bold leading-6 text-[#005687]">{facility.title}</h3>
              <p className="mt-2 text-[13px] font-normal leading-5 text-[#6b7280]">{facility.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutPageView({ content }: { content: AboutPageContent }) {
  return (
    <SiteLayout actions={content.actions} navigation={content.navigation} services={content.services}>
      <main>
        <AboutHero hero={content.hero} />
        <StorySection stats={content.stats} story={content.story} />
        <VisionMissionSection mission={content.mission} vision={content.vision} />
        <DifferencesSection differences={content.differences} />
        <FacilitiesSection facilities={content.facilities} />
      </main>
      <SiteFooter {...content.footer} />
    </SiteLayout>
  );
}

function AboutPageSkeleton() {
  return (
    <SiteLayout actions={{ appointmentLabel: 'Book Appointment', contactLabel: 'Contact Us' }} navigation={skeletonNavigation}>
      <main aria-busy="true" aria-label="Loading about page" className="bg-white">
        <section className="h-[430px] animate-pulse bg-[#d6ecf3]" />
        <section className="mx-auto grid max-w-[1280px] gap-14 px-4 py-[86px] sm:px-6 lg:grid-cols-2 lg:px-0">
          <div className="h-[398px] animate-pulse rounded-2xl bg-[#e8f3f7]" />
          <div className="space-y-5">
            <div className="h-5 w-32 animate-pulse rounded bg-[#d6ecf3]" />
            <div className="h-12 w-full max-w-[420px] animate-pulse rounded bg-[#d6ecf3]" />
            <div className="h-40 animate-pulse rounded bg-[#e8f3f7]" />
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}

function AboutPageEmpty() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge>No content</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">About page content is unavailable</h1>
        <p className="mt-3 text-[#6b7280]">Please check the content source and try again.</p>
      </Card>
    </main>
  );
}

function AboutPageError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">Error</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">We could not load the about page</h1>
        <p className="mt-3 text-[#6b7280]">Try again to refresh the clinic story.</p>
        <Button className="mt-6" onClick={onRetry} type="button">
          Retry
        </Button>
      </Card>
    </main>
  );
}

function hasAboutContent(content: AboutPageContent | undefined): content is AboutPageContent {
  return Boolean(
    content &&
      content.navigation.length > 0 &&
      content.hero.title &&
      content.story.paragraphs.length > 0 &&
      content.stats.length > 0 &&
      content.differences.length > 0 &&
      content.facilities.length > 0,
  );
}

export function AboutPage() {
  const { data, isError, isLoading, refetch } = useAboutPageQuery();

  if (isLoading) {
    return <AboutPageSkeleton />;
  }

  if (isError) {
    return <AboutPageError onRetry={() => void refetch()} />;
  }

  if (!hasAboutContent(data)) {
    return <AboutPageEmpty />;
  }

  return <AboutPageView content={data} />;
}
