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
  { href: '/#services', label: 'Services' },
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
    <section className="relative grid min-h-[430px] place-items-center overflow-hidden text-center text-white">
      <img alt={hero.imageAlt} className="absolute inset-0 h-full w-full object-cover object-center" src={hero.imageUrl} />
      <div aria-hidden="true" className="absolute inset-0 bg-[#08283a]/55" />
      <div className="relative mx-auto w-full max-w-[860px] px-4">
        <p className="text-[12px] font-extrabold uppercase leading-4 tracking-[7px] text-white/85">{hero.eyebrow}</p>
        <h1 className="mt-5 text-[36px] font-extrabold leading-[44px] sm:text-[48px] sm:leading-[56px]">{hero.title}</h1>
        <p className="mx-auto mt-5 max-w-[650px] text-[18px] font-medium leading-8 text-white/90">{hero.subtitle}</p>
      </div>
    </section>
  );
}

function StorySection({ stats, story }: Pick<AboutPageContent, 'stats' | 'story'>) {
  return (
    <section className="bg-white py-[86px]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-0">
        <div className="grid items-center gap-14 lg:grid-cols-[520px_1fr]">
          <img
            alt={story.imageAlt}
            className="h-[398px] w-full rounded-2xl object-cover shadow-[0_18px_42px_rgba(15,23,42,0.12)]"
            src={story.imageUrl}
          />
          <div>
            <p className="text-[12px] font-extrabold uppercase leading-4 tracking-[5px] text-[#3695b9]">{story.eyebrow}</p>
            <h2 className="mt-3 text-[34px] font-extrabold leading-[42px] text-[#0c2243]">{story.title}</h2>
            <div className="mt-2 h-1 w-[88px] rounded-full bg-[#3695b9]" />
            <div className="mt-7 space-y-6 text-[16px] font-medium leading-8 text-[#7a8491]">
              {story.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        <Card className="mt-[70px] grid rounded-xl border-[#e7eef2] bg-white px-6 py-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              className="flex items-center justify-center gap-2 border-[#e7eef2] py-4 text-center lg:border-r lg:last:border-r-0"
              key={stat.label}
            >
              <img alt="" aria-hidden="true" className="size-5" src={stat.iconUrl} />
              <div>
                <p className="text-[28px] font-extrabold leading-8 text-[#0c2243]">{stat.value}</p>
                <p className="mt-1 text-[11px] font-extrabold uppercase leading-4 text-[#8a95a3]">{stat.label}</p>
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
      <article className="bg-[#3695b9] px-4 py-[82px] text-white sm:px-10 lg:pl-[calc((100vw-1280px)/2)]">
        <div className="ml-auto max-w-[520px] lg:mr-[78px]">
          <div className="mb-6 flex items-center gap-5">
            <span className="grid size-14 place-items-center rounded-xl bg-white/16">
              <img alt="" aria-hidden="true" className="size-6 brightness-0 invert" src={vision.iconUrl} />
            </span>
            <h2 className="text-[30px] font-extrabold leading-9">{vision.title}</h2>
          </div>
          <p className="text-[16px] font-medium leading-8 text-white/85">{vision.description}</p>
        </div>
      </article>
      <article className="relative bg-[#f1f7fa] px-4 py-[82px] sm:px-10 lg:pr-[calc((100vw-1280px)/2)]">
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 hidden size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[26px] font-bold text-[#3695b9] shadow-[0_10px_24px_rgba(15,23,42,0.12)] lg:grid"
        >
          +
        </span>
        <div className="max-w-[520px] lg:ml-[78px]">
          <div className="mb-6 flex items-center gap-5">
            <span className="grid size-14 place-items-center rounded-xl bg-[#dff2f7]">
              <img alt="" aria-hidden="true" className="size-6" src={mission.iconUrl} />
            </span>
            <h2 className="text-[30px] font-extrabold leading-9 text-[#005687]">{mission.title}</h2>
          </div>
          <p className="text-[16px] font-medium leading-8 text-[#7a8491]">{mission.description}</p>
        </div>
      </article>
    </section>
  );
}

function DifferencesSection({ differences }: Pick<AboutPageContent, 'differences'>) {
  return (
    <section className="bg-white py-[88px] text-center">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-0">
        <p className="text-[12px] font-extrabold uppercase leading-4 tracking-[5px] text-[#3695b9]">Why Choose Us</p>
        <h2 className="mt-3 text-[34px] font-extrabold leading-[42px] text-[#005687]">What Makes Us Different</h2>
        <div className="mt-[58px] grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {differences.map((item) => (
            <Card className="rounded-xl border-0 bg-[#f7fafc] px-8 py-10 text-center shadow-none" key={item.title}>
              <span className="mx-auto grid size-12 place-items-center rounded-lg bg-white">
                <img alt="" aria-hidden="true" className="max-h-6 max-w-6" src={item.iconUrl} />
              </span>
              <h3 className="mt-6 text-[16px] font-extrabold leading-6 text-[#005687]">{item.title}</h3>
              <p className="mt-3 text-[13px] font-medium leading-5 text-[#87919f]">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FacilitiesSection({ facilities }: Pick<AboutPageContent, 'facilities'>) {
  return (
    <section className="bg-[#f7fafc] py-[86px]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-0">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-extrabold uppercase leading-4 tracking-[5px] text-[#3695b9]">
              Our Services & Facilities
            </p>
            <h2 className="mt-3 text-[34px] font-extrabold leading-[42px] text-[#005687]">
              Premium Care. Advanced Facilities.
            </h2>
          </div>
          <a
            className="hidden items-center gap-2 text-[13px] font-extrabold leading-5 text-[#3695b9] hover:text-[#005687] sm:inline-flex"
            href="/#services"
          >
            See All Services
            <ArrowIcon />
          </a>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {facilities.map((facility) => (
            <article key={facility.title}>
              <img alt={facility.imageAlt} className="h-[226px] w-full rounded-xl object-cover" src={facility.imageUrl} />
              <h3 className="mt-6 text-[18px] font-extrabold leading-6 text-[#005687]">{facility.title}</h3>
              <p className="mt-3 text-[14px] font-medium leading-6 text-[#87919f]">{facility.description}</p>
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
        <h1 className="mt-4 text-3xl font-black text-[#075a82]">About page content is unavailable</h1>
        <p className="mt-3 text-[#62798b]">Please check the content source and try again.</p>
      </Card>
    </main>
  );
}

function AboutPageError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">Error</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#075a82]">We could not load the about page</h1>
        <p className="mt-3 text-[#62798b]">Try again to refresh the clinic story.</p>
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
