import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import { ContentBlocks, EditorialImage, ResilientImage } from '@/components/layout/public-ui';
import type { LandingService, ServiceDetailContent } from '@/features/landing-page/types';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { useServiceDetailPageQuery } from './use-service-detail-page';

const skeletonNavigation = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/branches', label: 'Branches' },
];

const serviceSlug = (name: string) => name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-|-$)/g, '');

type ServiceDetail = NonNullable<ServiceDetailContent['service']>;

function withoutRepeatedImages(service: ServiceDetail): ServiceDetail {
  const usedImages = new Set<string>();
  const claimImage = (imageUrl?: string | null): string => {
    if (!imageUrl || usedImages.has(imageUrl)) return '';
    usedImages.add(imageUrl);
    return imageUrl;
  };
  const heroImageUrl = claimImage(service.hero.imageUrl);
  const aboutImageUrl = claimImage(service.about.imageUrl);
  const detailSections = service.detailSections.map((section) => ({ ...section, imageUrl: claimImage(section.imageUrl) }));

  return {
    ...service,
    about: { ...service.about, imageUrl: aboutImageUrl },
    detailSections,
    hero: { ...service.hero, imageUrl: heroImageUrl },
  };
}

function ArrowIcon() {
  return (
    <span
      aria-hidden="true"
      className="size-[13px] bg-current [mask-image:url('/assets/landing/arrow-right.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
    />
  );
}

function CalendarIcon({ className = 'size-[14px]' }: { className?: string }) {
  return <img alt="" aria-hidden="true" className={className} src="/assets/landing/hero-calendar.svg" />;
}

function DetailIcon({
  className = 'size-[18px]',
  name,
}: {
  className?: string;
  name: ServiceDetail['benefits'][number]['icon'] | ServiceDetail['glance']['items'][number]['icon'];
}) {
  const paths = {
    calendar: (
      <>
        <rect height="14" rx="2" width="14" x="5" y="6" />
        <path d="M8 4v4M16 4v4M5 10h14" />
      </>
    ),
    check: <path d="m5 12 4 4 10-10" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4.4l3 1.6" />
      </>
    ),
    consultation: (
      <>
        <circle cx="12" cy="7" r="3" />
        <path d="M6.5 20c.45-4 2.55-6 5.5-6s5.05 2 5.5 6" />
      </>
    ),
    heart: <path d="M4 12h3.5l2-4.2 3.1 8.4 2-4.2H20" />,
    recovery: (
      <>
        <path d="M5 9h14v8H5z" />
        <path d="M8 9V7h8v2M9 13h6" />
      </>
    ),
    shield: <path d="M12 21s7-3.5 7-10V5l-7-3-7 3v6c0 6.5 7 10 7 10Z" />,
    smile: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M8.8 10h.01M15.2 10h.01M8.8 14.2c1.7 1.7 4.7 1.7 6.4 0" />
      </>
    ),
    star: <path d="m12 3 2.6 5.3 5.8.85-4.2 4.1 1 5.75-5.2-2.72L6.8 19l1-5.75-4.2-4.1 5.8-.85L12 3Z" />,
    utensils: (
      <>
        <path d="M7 3v8M4.5 3v8M9.5 3v8M4.5 11h5L8.7 21H5.3L4.5 11Z" />
        <path d="M16 3c2.2 1.8 3.3 4 3.3 6.7 0 1.9-.72 3.2-2.3 3.8V21h-3V3h2Z" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

function ServiceHero({ editorial, service }: { editorial: boolean; service: ServiceDetail }) {
  const navigate = useNavigate();
  const { language } = usePublicLanguage();
  const guideCopy = service.detailPresentation === 'JOURNEY'
    ? language === 'km'
      ? { eyebrow: 'ព័ត៌មានអំពីការព្យាបាល', body: 'ស្វែងយល់ពីដំណើរការព្យាបាល មួយជំហានម្តងៗ។' }
      : { eyebrow: 'Treatment guide', body: 'Explore the treatment journey, one clear step at a time.' }
    : language === 'km'
      ? { eyebrow: 'ព័ត៌មានអំពីសេវា', body: 'ស្វែងយល់ពីជម្រើសថែទាំដែលសមស្របសម្រាប់អ្នក។' }
      : { eyebrow: 'Service guide', body: 'Explore care options that fit your needs.' };

  return (
    <section className="border-b border-[#e7eff3] bg-[#f7fafc] pb-12 pt-12 sm:pb-14 sm:pt-14">
      <div className={`mx-auto grid w-full max-w-[1280px] gap-8 px-4 sm:px-6 lg:gap-12 lg:px-8 ${editorial ? 'lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end' : 'lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center'}`}>
        <div className={editorial ? 'max-w-[760px]' : ''}>
          <p className="text-[12px] font-extrabold uppercase leading-4 tracking-[3.6px] text-[#3695B9]">{service.hero.eyebrow}</p>
          <h1 className="mt-3 max-w-[620px] text-[30px] font-extrabold leading-tight tracking-[-0.035em] text-[#005687] sm:text-[38px]">
            {service.hero.title}
          </h1>
          <p className="mt-3 max-w-[540px] text-[16px] font-normal leading-7 text-[#607486]">{service.hero.subtitle}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button className="min-h-[46px] rounded-full px-7 text-[14px] font-bold shadow-[0_4px_12px_rgba(54,149,185,0.18)]" onClick={() => navigate('/book-appointment')}>
              {service.hero.appointmentLabel}
            </Button>
            <Button
              className="min-h-[46px] rounded-full border border-[#cfe1e9] px-7 text-[14px] font-bold text-[#005687] shadow-none hover:border-[#3695B9]"
              onClick={() => navigate('/contact')}
              variant="secondary"
            >
              {service.hero.consultationLabel}
            </Button>
          </div>
        </div>
        {editorial ? (
          <div className="border-l-2 border-[#83cadd] pl-5 text-[#365d70]">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#1682a4]">{guideCopy.eyebrow}</p>
            <p className="mt-2 text-[15px] leading-6">{guideCopy.body}</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border-4 border-[#d9edf4] bg-[#edf5f8] shadow-[0_8px_22px_rgba(15,61,84,0.09)]">
            <ResilientImage
              alt={service.hero.imageAlt || service.hero.title}
              className="h-[260px] w-full object-cover sm:h-[320px]"
              fallbackSrc="/assets/landing/hero-clinic.png"
              src={service.hero.imageUrl}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function EditorialOverview({ service }: { service: ServiceDetail }) {
  const { language } = usePublicLanguage();
  const copy = language === 'km'
    ? { eyebrow: 'ចំណុចសំខាន់', title: 'ព័ត៌មានសំខាន់ មុនចាប់ផ្តើម' }
    : { eyebrow: 'At a glance', title: 'What to know before you begin' };

  if (service.slug === 'digital-smile-design' || (service.benefits.length === 0 && service.glance.items.length === 0)) return null;

  return (
    <section className="border-b border-[#e7eff3] bg-white py-9 sm:py-11">
      <div className="mx-auto grid w-full max-w-[1280px] gap-7 px-4 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12 lg:px-8">
        <div>
          <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#3695B9]">{copy.eyebrow}</p>
          <h2 className="mt-2 text-[23px] font-extrabold leading-tight tracking-[-0.03em] text-[#005687]">{copy.title}</h2>
        </div>
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {service.benefits.map((benefit) => (
            <div className="border-l border-[#dcebf0] pl-4" key={benefit.title}>
              <h3 className="text-[15px] font-bold leading-5 text-[#005687]">{benefit.title}</h3>
              {benefit.description ? <p className="mt-1.5 text-[14px] leading-6 text-[#607486]">{benefit.description}</p> : null}
            </div>
          ))}
          {service.glance.items.map((item) => (
            <div className="border-l border-[#dcebf0] pl-4" key={item.label}>
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#3695B9]">{item.label}</p>
              <p className="mt-1 text-[14px] leading-6 text-[#607486]">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GlanceCard({ glance }: { glance: ServiceDetail['glance'] }) {
  return (
    <Card className="rounded-xl border-[#dcebf1] bg-white p-5 shadow-[0_2px_10px_rgba(15,61,84,0.05)] sm:p-6">
      <h2 className="flex items-center gap-3 text-[18px] font-extrabold leading-6 text-[#005687]">
        <CalendarIcon className="size-4" />
        {glance.title}
      </h2>
      <div className="mt-5 space-y-3.5">
        {glance.items.map((item) => (
          <div className="flex items-start gap-3.5" key={item.label}>
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#eef8fb] text-[#3695B9]">
              <DetailIcon className="size-3.5" name={item.icon} />
            </span>
            <div>
              <p className="text-[14px] font-bold leading-5 text-[#005687]">{item.label}</p>
              <p className="text-[13px] font-normal leading-5 text-[#607486]">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AboutService({ service }: { service: ServiceDetail }) {
  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12 lg:px-8">
        <article>
          <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-[#005687] sm:text-[34px]">{service.about.title}</h2>
          <div className="mt-5 max-w-[720px] space-y-4">
            {service.about.paragraphs.map((paragraph) => <ContentBlocks key={paragraph} value={paragraph} />)}
          </div>
          {service.about.imageUrl ? <EditorialImage alt={service.about.imageAlt} caption={service.about.imageAlt} className="mt-7" imageClassName="h-[240px] sm:h-[280px]" src={service.about.imageUrl} /> : null}
        </article>
        <aside>
          <GlanceCard glance={service.glance} />
        </aside>
      </div>
    </section>
  );
}

function BenefitsSection({ benefits, title }: Pick<ServiceDetail, 'benefits'> & { title: string }) {
  const { language } = usePublicLanguage();
  const copy = language === 'km'
    ? { intro: 'ស្វែងយល់ពីគោលបំណង និងអត្ថប្រយោជន៍សំខាន់ៗនៃសេវានេះ។', title: `អត្ថប្រយោជន៍នៃ ${title}` }
    : { intro: 'Understand the key goals and considerations for this service.', title: `Key Benefits of ${title}` };

  if (benefits.length === 0) return null;

  return (
    <section className="bg-[#f7fafc] py-14 text-center sm:py-16">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-[#005687] sm:text-[34px]">{copy.title}</h2>
        <p className="mx-auto mt-3 max-w-[580px] text-[15px] font-normal leading-6 text-[#607486]">
          {copy.intro}
        </p>
        <div className="mt-7 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <Card className="min-h-[154px] rounded-xl border-[#e4edf2] bg-white p-5 shadow-[0_2px_10px_rgba(15,61,84,0.05)]" key={benefit.title}>
              <span className="grid size-10 place-items-center rounded-lg bg-[#eef8fb] text-[#3695B9]">
                <DetailIcon className="size-4" name={benefit.icon} />
              </span>
              <h3 className="mt-4 text-[15px] font-bold leading-5 text-[#005687]">{benefit.title}</h3>
              <p className="mt-2 text-[13px] font-normal leading-5 text-[#6b7280]">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClinicalJourney({ service }: { service: ServiceDetail }) {
  const { language } = usePublicLanguage();
  const sections = service.detailSections;
  const copy = language === 'km'
    ? { eyebrow: service.editorial.label || 'ព័ត៌មានអំពីសេវា', title: service.editorial.title || 'ស្វែងយល់ពីសេវា និងជម្រើសថែទាំ' }
    : { eyebrow: service.editorial.label || 'Service information', title: service.editorial.title || 'Understanding your care' };

  if (sections.length === 0) return null;

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-[660px]">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#3695B9]">{copy.eyebrow}</p>
          <h2 className="mt-2 text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-[#005687] sm:text-[34px]">{copy.title}</h2>
        </div>
        <div className="mt-8 divide-y divide-[#dcebf0] border-y border-[#dcebf0] sm:mt-10">
          {sections.map((section, index) => {
            const reversed = index % 2 === 1;
            const paragraphs = section.body.split(/\n{2,}/).filter(Boolean);
            return (
              <article className={`grid gap-5 py-7 sm:gap-8 sm:py-10 ${section.imageUrl ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14' : ''}`} key={`${section.heading}-${index}`}>
                {section.imageUrl ? (
                  <EditorialImage alt={section.imageAlt} caption={section.imageAlt} className={reversed ? 'lg:order-2' : undefined} imageClassName="h-[250px] sm:h-[340px]" src={section.imageUrl} />
                ) : null}
                <div className="px-1 sm:px-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-extrabold tracking-[0.14em] text-[#3695B9]">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  {section.heading ? <h3 className="mt-3 text-[22px] font-extrabold leading-8 tracking-[-0.025em] text-[#005687]">{section.heading}</h3> : null}
                  <div className="mt-3 space-y-3">
                    {paragraphs.map((paragraph) => <ContentBlocks key={paragraph} value={paragraph} />)}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function OrthodonticTimeline({ service }: { service: ServiceDetail }) {
  if (service.detailSections.length === 0) return null;

  return (
    <section className="border-y border-[#e4edf1] bg-[#f7fafc] py-12 sm:py-16">
      <div className="mx-auto grid w-full max-w-[1120px] gap-8 px-4 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14 lg:px-8">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading service={service} />
        </div>
        <ol className="relative space-y-6 border-l border-[#b9dce8] pl-6 sm:space-y-8 sm:pl-8">
          {service.detailSections.map((section, index) => (
            <li className="relative" key={`${section.heading}-${index}`}>
              <span aria-hidden="true" className="absolute -left-[33px] top-0 grid size-5 place-items-center rounded-full border-4 border-[#f7fafc] bg-[#168aad] text-[9px] font-extrabold text-white sm:-left-[41px] sm:size-6 sm:text-[10px]">{index + 1}</span>
              <article className="rounded-xl border border-[#dcebf0] bg-white p-5 shadow-[0_2px_10px_rgba(15,61,84,0.04)] sm:p-6">
                {section.heading ? <h3 className="text-[21px] font-extrabold leading-7 text-[#005687]">{section.heading}</h3> : null}
                <div className={section.imageUrl ? 'mt-4 grid gap-5 md:grid-cols-[minmax(0,1fr)_220px] md:items-start' : 'mt-3'}>
                  <ContentBlocks value={section.body} />
                  {section.imageUrl ? <EditorialImage alt={section.imageAlt} caption={section.imageAlt} imageClassName="h-40" src={section.imageUrl} /> : null}
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ImplantPlanning({ service }: { service: ServiceDetail }) {
  if (service.detailSections.length === 0) return null;

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#dcebf0] pb-8">
          <SectionHeading service={service} />
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {service.detailSections.map((section, index) => (
            <article className={`grid gap-5 rounded-xl border border-[#dcebf0] bg-[#fbfdfe] p-5 sm:p-6 ${index === 0 && !section.imageUrl ? 'lg:col-span-2 lg:grid-cols-[180px_minmax(0,1fr)]' : ''}`} key={`${section.heading}-${index}`}>
              <span className="grid size-10 place-items-center rounded-lg bg-[#005687] text-[13px] font-extrabold text-white">{String(index + 1).padStart(2, '0')}</span>
              <div>
                {section.heading ? <h3 className="text-[20px] font-extrabold leading-7 text-[#005687]">{section.heading}</h3> : null}
                <ContentBlocks className="mt-2" value={section.body} />
                {section.imageUrl ? <EditorialImage alt={section.imageAlt} caption={section.imageAlt} className="mt-5" imageClassName="h-[210px]" src={section.imageUrl} /> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function JourneyPresentation({ service }: { service: ServiceDetail }) {
  if (service.slug === 'orthodontics') return <OrthodonticTimeline service={service} />;
  if (service.slug === 'dental-implants') return <ImplantPlanning service={service} />;
  return <ClinicalJourney service={service} />;
}

function SectionHeading({ service }: { service: ServiceDetail }) {
  const { language } = usePublicLanguage();
  const copy = language === 'km'
    ? { eyebrow: service.editorial.label || 'ព័ត៌មានអំពីសេវា', title: service.editorial.title || 'ស្វែងយល់ពីជម្រើសថែទាំ' }
    : { eyebrow: service.editorial.label || 'Service information', title: service.editorial.title || 'Explore your care options' };
  return <div className="max-w-[680px]"><p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#3695B9]">{copy.eyebrow}</p><h2 className="mt-2 text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-[#005687] sm:text-[34px]">{copy.title}</h2></div>;
}

function CareMenu({ family, service }: { family?: boolean; service: ServiceDetail }) {
  if (service.detailSections.length === 0) return null;
  return (
    <section className={family ? 'bg-[#f4faf8] py-12 sm:py-16' : 'bg-white py-12 sm:py-16'}>
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <SectionHeading service={service} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {service.detailSections.map((section, index) => (
            <article className={`overflow-hidden rounded-2xl border ${family ? 'border-[#d6ebe4] bg-white' : 'border-[#dcebf0] bg-[#fbfdfe]'} shadow-[0_5px_18px_rgba(15,61,84,0.05)]`} key={`${section.heading}-${index}`}>
              {section.imageUrl ? <img alt={section.imageAlt} className="h-40 w-full object-cover" src={section.imageUrl} /> : null}
              <div className="p-5 sm:p-6"><span className={`grid size-8 place-items-center rounded-full text-[12px] font-extrabold ${family ? 'bg-[#e2f4ed] text-[#187a65]' : 'bg-[#e8f5f9] text-[#1682a4]'}`}>{String(index + 1).padStart(2, '0')}</span>{section.heading ? <h3 className="mt-4 text-[19px] font-extrabold leading-7 text-[#005687]">{section.heading}</h3> : null}<ContentBlocks className="mt-2 text-[15px] leading-7" value={section.body} /></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClinicalScope({ imaging, service }: { imaging?: boolean; service: ServiceDetail }) {
  if (service.detailSections.length === 0) return null;
  return (
    <section className={imaging ? 'bg-[#f3f8fb] py-12 sm:py-16' : 'bg-white py-12 sm:py-16'}>
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8"><SectionHeading service={service} />
        <div className="mt-9 grid gap-5 lg:grid-cols-2">
          {service.detailSections.map((section, index) => <article className="grid gap-5 border-t-2 border-[#b9dce8] pt-5 sm:grid-cols-[44px_minmax(0,1fr)]" key={`${section.heading}-${index}`}><span className={`grid size-10 place-items-center rounded-full text-[13px] font-extrabold ${imaging ? 'bg-[#005687] text-white' : 'bg-[#e8f5f9] text-[#1682a4]'}`}>{String(index + 1).padStart(2, '0')}</span><div>{section.imageUrl ? <EditorialImage alt={section.imageAlt} caption={section.imageAlt} className="mb-5" imageClassName="h-44" src={section.imageUrl} /> : null}{section.heading ? <h3 className="text-[20px] font-extrabold leading-7 text-[#005687]">{section.heading}</h3> : null}<ContentBlocks className="mt-2 text-[15px] leading-7" value={section.body} /></div></article>)}
        </div>
      </div>
    </section>
  );
}

function ProblemToCare({ service }: { service: ServiceDetail }) {
  if (service.detailSections.length === 0) return null;
  return (
    <section className="bg-[#f8fbfc] py-12 sm:py-16"><div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8"><SectionHeading service={service} />
      <div className="mt-9 space-y-5">{service.detailSections.map((section, index) => <article className="grid gap-5 rounded-2xl border border-[#dcebf0] bg-white p-5 shadow-[0_4px_15px_rgba(15,61,84,0.04)] sm:p-7 lg:grid-cols-[160px_minmax(0,1fr)_280px] lg:items-center" key={`${section.heading}-${index}`}><p className="text-[13px] font-extrabold uppercase tracking-[0.14em] text-[#1682a4]">{String(index + 1).padStart(2, '0')}</p><div>{section.heading ? <h3 className="text-[21px] font-extrabold leading-7 text-[#005687]">{section.heading}</h3> : null}<ContentBlocks className="mt-2 text-[15px] leading-7" value={section.body} /></div>{section.imageUrl ? <EditorialImage alt={section.imageAlt} caption={section.imageAlt} imageClassName="h-44" src={section.imageUrl} /> : null}</article>)}</div>
    </div></section>
  );
}

function PurposeLedDetail({ service }: { service: ServiceDetail }) {
  switch (service.detailPresentation) {
    case 'JOURNEY': return <JourneyPresentation service={service} />;
    case 'CARE_MENU': return <CareMenu service={service} />;
    case 'FAMILY_CARE': return <CareMenu family service={service} />;
    case 'CLINICAL_SCOPE': return <ClinicalScope service={service} />;
    case 'IMAGING_GUIDE': return <ClinicalScope imaging service={service} />;
    case 'PROBLEM_TO_CARE': return <ProblemToCare service={service} />;
    default: return <ClinicalJourney service={service} />;
  }
}

function OtherServiceCard({ service }: { service: LandingService }) {
  const hasImage = Boolean(service.imageUrl);

  return (
    <Card className="overflow-hidden rounded-xl border-[#e4edf2] bg-white shadow-[0_2px_10px_rgba(15,61,84,0.05)] transition duration-200 hover:border-[#b9dce8] hover:shadow-[0_7px_18px_rgba(15,61,84,0.09)] sm:h-[326px]">
      <div className={`flex min-h-[192px] h-full flex-row ${hasImage ? 'sm:flex-col' : ''}`}>
        {hasImage ? <img alt={service.imageAlt || service.name} className="h-[192px] w-[42%] shrink-0 bg-[#eaf2f6] object-cover object-center sm:h-[188px] sm:w-full" src={service.imageUrl} /> : null}
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <div>
            <h3 className="text-[16px] font-bold leading-5 text-[#005687]">{service.name}</h3>
            <p className="mt-2 line-clamp-3 text-[14px] font-medium leading-5 text-[#607486] sm:line-clamp-2">{service.description}</p>
          </div>
          <Link
            className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#3695B9] hover:text-[#005687] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]"
            to={`/services/${serviceSlug(service.name)}`}
          >
            View Service
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </Card>
  );
}

function OtherServices({ services }: { services: LandingService[] }) {
  const { language } = usePublicLanguage();
  const copy = language === 'km'
    ? { all: 'មើលសេវាទាំងអស់', description: 'ស្វែងយល់ពីសេវាផ្សេងទៀត សម្រាប់សុខភាពមាត់ធ្មេញរបស់អ្នក។', title: 'សេវាពាក់ព័ន្ធផ្សេងទៀត' }
    : { all: 'All Services', description: 'Explore other services that may support your oral-health goals.', title: 'Explore other services' };
  return (
    <section className="bg-[#f7fafc] py-14 sm:py-16">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-[#005687] sm:text-[34px]">{copy.title}</h2>
            <p className="mt-2 text-[15px] font-normal leading-6 text-[#607486]">{copy.description}</p>
          </div>
          <Link className="hidden text-[13px] font-bold text-[#3695B9] hover:text-[#005687] sm:inline-flex" to="/services">
            {copy.all}
          </Link>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 3).map((service) => (
            <OtherServiceCard key={service.name} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCta({ cta }: { cta: ServiceDetail['cta'] }) {
  const navigate = useNavigate();

  return (
    <section className="bg-white px-4 py-14 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-[860px] rounded-xl bg-[#087b9f] px-5 py-9 text-center text-white sm:px-12 sm:py-11">
        <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.035em] sm:text-[34px]">{cta.title}</h2>
        <p className="mx-auto mt-3 max-w-[580px] text-[16px] font-medium leading-7 text-white/85">{cta.description}</p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            className="min-h-[48px] w-full rounded-full bg-white px-8 text-[14px] text-[#087b9f] shadow-none hover:bg-[#eef8fb] sm:w-auto"
            onClick={() => navigate('/book-appointment')}
            variant="secondary"
          >
            {cta.appointmentLabel}
          </Button>
          <Button
            className="min-h-[48px] w-full rounded-full border border-white bg-transparent px-8 text-[14px] text-white shadow-none hover:bg-white/10 sm:w-auto"
            onClick={() => navigate('/contact')}
            variant="ghost"
          >
            {cta.contactLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}

function ServiceDetailView({ content }: { content: ServiceDetailContent & { service: ServiceDetail } }) {
  const service = withoutRepeatedImages(content.service);
  const editorial = Boolean(service.editorial.label || service.editorial.title);
  return (
    <SiteLayout actions={content.actions} navigation={content.navigation} services={content.services}>
      <main>
        <ServiceHero editorial={editorial} service={service} />
        {editorial ? <EditorialOverview service={service} /> : <><AboutService service={service} /><BenefitsSection benefits={service.benefits} title={service.name} /></>}
        <PurposeLedDetail service={service} />
        <OtherServices services={content.otherServices} />
        <ServiceCta cta={service.cta} />
      </main>
      <SiteFooter {...content.footer} />
    </SiteLayout>
  );
}

function ServiceDetailSkeleton() {
  return (
    <SiteLayout actions={{ appointmentLabel: 'Book Appointment', contactLabel: 'Contact Us' }} navigation={skeletonNavigation}>
      <main aria-busy="true" aria-label="Loading service detail page" className="bg-white">
        <span className="sr-only">Loading treatment information</span>

        <section aria-hidden="true" className="border-b border-[#e7eff3] bg-[#f7fafc] py-10 sm:py-12">
          <div className="mx-auto grid w-full max-w-[1280px] gap-7 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center lg:gap-12 lg:px-8">
            <div className="space-y-4">
              <div className="h-3 w-32 animate-pulse rounded-full bg-[#dcebf0]" />
              <div className="h-9 w-[88%] max-w-[500px] animate-pulse rounded-lg bg-[#d1e6ee] sm:w-[72%]" />
              <div className="space-y-2 pt-1">
                <div className="h-4 w-full max-w-[520px] animate-pulse rounded-full bg-[#e5f0f4]" />
                <div className="h-4 w-[82%] max-w-[420px] animate-pulse rounded-full bg-[#e5f0f4]" />
              </div>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <div className="h-11 w-full animate-pulse rounded-full bg-[#dcebf0] sm:w-44" />
                <div className="h-11 w-full animate-pulse rounded-full bg-white ring-1 ring-[#dcebf0] sm:w-44" />
              </div>
            </div>
            <div className="h-[260px] animate-pulse rounded-xl border-4 border-[#d9edf4] bg-[#e3eef2] sm:h-[320px]" />
          </div>
        </section>

        <section aria-hidden="true" className="bg-white py-10 sm:py-14">
          <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12 lg:px-8">
            <div>
              <div className="h-8 w-56 animate-pulse rounded-lg bg-[#d1e6ee] sm:w-72" />
              <div className="mt-5 max-w-[760px] space-y-3">
                <div className="h-4 w-full animate-pulse rounded-full bg-[#edf4f6]" />
                <div className="h-4 w-[94%] animate-pulse rounded-full bg-[#edf4f6]" />
                <div className="h-4 w-[86%] animate-pulse rounded-full bg-[#edf4f6]" />
                <div className="h-4 w-[72%] animate-pulse rounded-full bg-[#edf4f6]" />
              </div>
              <div className="mt-7 h-[210px] animate-pulse rounded-xl bg-[#e3eef2] sm:h-[280px]" />
            </div>
            <div className="rounded-xl border border-[#e1ebef] bg-[#fbfdfe] p-5 sm:p-6">
              <div className="h-5 w-40 animate-pulse rounded-full bg-[#d1e6ee]" />
              <div className="mt-5 space-y-4">
                {Array.from({ length: 3 }, (_, index) => (
                  <div className="flex gap-3" key={index}>
                    <span className="size-8 shrink-0 animate-pulse rounded-full bg-[#dcebf0]" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 w-2/5 animate-pulse rounded-full bg-[#dcebf0]" />
                      <div className="h-3 w-full animate-pulse rounded-full bg-[#edf4f6]" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 h-11 w-full animate-pulse rounded-full bg-[#dcebf0]" />
            </div>
          </div>
        </section>

        <section aria-hidden="true" className="border-y border-[#e7eff3] bg-[#f7fafc] py-10 sm:py-12">
          <div className="mx-auto max-w-[1280px] px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto h-8 w-64 max-w-full animate-pulse rounded-lg bg-[#d1e6ee] sm:w-80" />
            <div className="mx-auto mt-4 h-4 w-[78%] animate-pulse rounded-full bg-[#e5f0f4] sm:w-[46%]" />
            <div className="mt-7 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div className="min-h-[154px] rounded-xl border border-[#e1ebef] bg-white p-5" key={index}>
                  <span className="block size-10 animate-pulse rounded-lg bg-[#dcebf0]" />
                  <div className="mt-4 h-4 w-3/5 animate-pulse rounded-full bg-[#d1e6ee]" />
                  <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-[#edf4f6]" />
                  <div className="mt-2 h-3 w-4/5 animate-pulse rounded-full bg-[#edf4f6]" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-hidden="true" className="bg-white py-10 sm:py-12">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="h-8 w-56 animate-pulse rounded-lg bg-[#d1e6ee] sm:w-72" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div className="flex min-h-[192px] overflow-hidden rounded-xl border border-[#e3edf1] bg-white sm:block sm:h-[326px]" key={index}>
                  <div className="h-[192px] w-[42%] shrink-0 animate-pulse bg-[#e3eef2] sm:h-[188px] sm:w-full" />
                  <div className="flex flex-1 flex-col justify-center space-y-3 p-4 sm:h-[138px] sm:justify-start sm:p-5">
                    <div className="h-4 w-3/4 animate-pulse rounded-full bg-[#dcebf0]" />
                    <div className="h-3 w-full animate-pulse rounded-full bg-[#edf4f6]" />
                    <div className="h-3 w-2/3 animate-pulse rounded-full bg-[#edf4f6]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-hidden="true" className="border-t border-[#e7eff3] bg-[#f7fafc] px-4 py-10 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-[860px] rounded-xl bg-[#1682a4] px-5 py-8 text-center sm:px-12 sm:py-10">
            <div className="mx-auto h-8 w-56 max-w-full animate-pulse rounded-lg bg-white/45 sm:w-72" />
            <div className="mx-auto mt-4 h-4 w-[78%] animate-pulse rounded-full bg-white/25 sm:w-[56%]" />
            <div className="mx-auto mt-6 h-11 w-48 animate-pulse rounded-full bg-white/70" />
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}

function ServiceDetailEmpty() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge>No content</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">Service detail is unavailable</h1>
        <p className="mt-3 text-[#6b7280]">Please return to the services page and choose another treatment.</p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#3695B9] px-5 text-sm font-extrabold text-white hover:bg-[#2c84a5]"
          to="/services"
        >
          Back to Services
        </Link>
      </Card>
    </main>
  );
}

function ServiceDetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">Error</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">We could not load this service</h1>
        <p className="mt-3 text-[#6b7280]">Try again to refresh the treatment information.</p>
        <Button className="mt-6" onClick={onRetry} type="button">
          Retry
        </Button>
      </Card>
    </main>
  );
}

export function ServiceDetailPage() {
  const { serviceSlug: serviceSlugParam } = useParams();
  const { data, isError, isLoading, refetch } = useServiceDetailPageQuery(serviceSlugParam);

  if (isLoading) {
    return <ServiceDetailSkeleton />;
  }

  if (isError) {
    return <ServiceDetailError onRetry={() => void refetch()} />;
  }

  if (!data?.service) {
    return <ServiceDetailEmpty />;
  }

  return <ServiceDetailView content={{ ...data, service: data.service }} />;
}
