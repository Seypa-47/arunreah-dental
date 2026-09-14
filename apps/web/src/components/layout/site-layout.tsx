import { useEffect, useState, type PropsWithChildren } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { LandingNavigationItem, LandingService } from '@/features/landing-page/types';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { queryKeys } from '@/lib/query-keys';
import { getPublicClinic, getPublicServices, type PublicLanguage } from '@/services/public-content';
import { getPublicMediaUrl } from '@/services/media';

const asset = (name: string) => `/assets/landing/${name}`;
const serviceSlug = (name: string) => name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-|-$)/g, '');

type SiteLayoutProps = PropsWithChildren<{
  actions: {
    appointmentLabel: string;
    contactLabel: string;
  };
  navigation: LandingNavigationItem[];
  services?: Pick<LandingService, 'name'>[];
}>;

type LanguageFlagSelectorProps = {
  activeLanguage: PublicLanguage;
  className?: string;
  onLanguageChange: (language: PublicLanguage) => void;
};

function LanguageFlagSelector({ activeLanguage, className = '', onLanguageChange }: LanguageFlagSelectorProps) {
  const buttonClassName = (language: PublicLanguage) =>
    `grid size-10 place-items-center overflow-hidden rounded-full border-2 bg-white p-0.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#168aad] ${
      activeLanguage === language
        ? 'border-transparent opacity-100 shadow-[0_3px_8px_rgba(15,61,84,0.16)]'
        : 'border-transparent opacity-60 hover:opacity-100'
    }`;

  return (
    <div aria-label="Language selector" className={`items-center gap-1.5 ${className}`} role="group">
      <button aria-label="Switch to Khmer" aria-pressed={activeLanguage === 'km'} className={buttonClassName('km')} onClick={() => onLanguageChange('km')} type="button">
        <img alt="" aria-hidden="true" className="size-full rounded-full object-cover" src={asset('flag-kh.png')} />
      </button>
      <button aria-label="Switch to English" aria-pressed={activeLanguage === 'en'} className={buttonClassName('en')} onClick={() => onLanguageChange('en')} type="button">
        <img alt="" aria-hidden="true" className="size-full rounded-full object-cover" src={asset('flag-en.png')} />
      </button>
    </div>
  );
}

export function SiteLayout({ actions, children, navigation }: SiteLayoutProps) {
  const { language: activeLanguage, setLanguage } = usePublicLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const servicesQuery = useQuery({ queryKey: queryKeys.public.serviceNavigation(activeLanguage), queryFn: () => getPublicServices(activeLanguage) });
  const services = servicesQuery.data?.services ?? [];
  const clinicQuery = useQuery({ queryKey: queryKeys.public.clinic(), queryFn: () => getPublicClinic() });
  const { hash, pathname } = useLocation();
  const navigate = useNavigate();
  const serviceHref = (service: Pick<LandingService, 'name' | 'slug'>) => `/services/${service.slug ?? serviceSlug(service.name)}`;

  useEffect(() => {
    setIsMobileMenuOpen(false);
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [pathname, hash]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMobileMenuOpen]);

  const isActiveNavigationItem = (item: LandingNavigationItem) => {
    if (item.href.startsWith('/doctors')) {
      return pathname.startsWith('/doctors');
    }

    if (item.href.startsWith('/services')) {
      return pathname.startsWith('/services');
    }

    if (!item.href.includes('#') && item.href !== '/') {
      return pathname === item.href;
    }

    if (item.href === '/') {
      return pathname === '/' && !hash;
    }

    if (item.href.includes('#')) {
      return pathname === '/' && hash === item.href.slice(item.href.indexOf('#'));
    }

    return false;
  };
  const clinic = clinicQuery.data;
  const clinicName = activeLanguage === 'km' ? clinic?.clinicNameKm : clinic?.clinicNameEn;
  const logoUrl = getPublicMediaUrl(clinic?.logoKey);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7fafc] text-[#005687]">
      <header className="sticky top-0 z-40 border-b border-[#d9e9ee] bg-white/95 shadow-[0_2px_12px_rgba(10,63,90,0.05)] backdrop-blur-xl">
        <div className="ui-page-container flex h-[64px] items-center justify-between gap-2 sm:h-[74px] sm:gap-4">
          <Link aria-label="Arunreah Dental Clinic home" className="shrink-0 leading-none" to="/">
            {logoUrl ? <img alt={clinicName ?? 'Arunreah Dental Clinic'} className="h-8 max-w-[86px] object-contain object-left sm:h-11 sm:max-w-[190px]" src={logoUrl} /> : <span className="block max-w-[86px] text-[13px] font-extrabold uppercase leading-4 tracking-[-0.25px] text-[#3695B9] sm:max-w-none sm:text-[20px] sm:leading-5">{clinicName ?? 'Arunreah Dental Clinic'}</span>}
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-4 lg:flex xl:gap-6">
            {navigation.map((item) => {
              const isActive = isActiveNavigationItem(item);

              if (item.href !== '/services') {
                return (
                  <Link
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative inline-flex min-h-10 items-center py-2 text-[14px] transition-colors duration-200 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#168aad] ${
                      isActive ? 'font-extrabold text-[#087b9f]' : 'font-semibold text-[#526879] hover:text-[#087b9f]'
                    }`}
                    key={item.label}
                    to={item.href}
                  >
                    {item.label}
                    {isActive ? (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#3695B9]" />
                    ) : null}
                  </Link>
                );
              }

              return (
                <div className="group relative" key={item.label}>
                  <Link
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative inline-flex min-h-10 items-center gap-1.5 py-2 text-[14px] transition-colors duration-200 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#168aad] ${
                      isActive ? 'font-extrabold text-[#087b9f]' : 'font-semibold text-[#526879] hover:text-[#087b9f]'
                    }`}
                    to={item.href}
                  >
                    <span>{item.label}</span>
                    <img
                      alt=""
                      aria-hidden="true"
                      className="size-2.5 transition-transform duration-200 group-hover:rotate-180"
                      src={asset('chevron-down.svg')}
                    />
                    {isActive ? (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#3695B9]" />
                    ) : null}
                  </Link>
                  <div className="invisible absolute left-1/2 top-full z-50 mt-2 w-[296px] -translate-x-1/2 translate-y-2 rounded-2xl border border-[#d9e9ee] bg-white p-2 opacity-0 shadow-[0_18px_40px_rgba(15,61,84,0.14)] transition-all duration-200 ease-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="absolute -top-2 left-0 h-2 w-full" />
                    {services.map((service) => (
                      <Link
                        className="block rounded-xl px-4 py-3 text-[14px] font-semibold leading-5 text-[#526879] transition-colors duration-150 hover:bg-[#eef8fb] hover:text-[#087b9f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#168aad]"
                        key={service.name}
                        to={serviceHref(service)}
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="flex min-w-0 items-center gap-1.5 sm:gap-3 xl:gap-5">
            <button
              className="hidden min-h-11 items-center gap-2.5 rounded-full px-2 text-[14px] font-extrabold text-[#087b9f] transition hover:bg-[#eef8fb] xl:inline-flex"
              onClick={() => navigate('/contact')}
              type="button"
            >
              <span className="grid size-[38px] place-items-center rounded-full border border-[#3695B9]">
                <img alt="" aria-hidden="true" className="size-3.5" src={asset('header-phone.svg')} />
              </span>
              <span>{actions.contactLabel}</span>
            </button>
            <span aria-hidden="true" className="hidden h-5 w-[1.5px] bg-[#3695B9]/40 sm:inline-block" />
            <button
              className="min-h-11 max-w-[112px] rounded-full bg-[#168aad] px-3 text-[12px] font-extrabold leading-4 text-white shadow-[0_6px_16px_rgba(22,138,173,0.2)] transition-all duration-150 hover:bg-[#0d7596] active:scale-95 sm:max-w-none sm:min-h-[44px] sm:px-5 sm:text-[14px] xl:px-6 xl:text-[15px]"
              onClick={() => navigate('/book-appointment')}
              type="button"
            >
              <span>{actions.appointmentLabel}</span>
            </button>
            <LanguageFlagSelector activeLanguage={activeLanguage} className="hidden lg:inline-flex" onLanguageChange={setLanguage} />
            <button
              aria-controls="mobile-primary-navigation"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="grid size-11 shrink-0 place-items-center rounded-full border border-[#cfe4ec] text-[#005687] transition hover:bg-[#eef9fc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3695B9] lg:hidden"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              type="button"
            >
              <span aria-hidden="true" className="flex w-5 flex-col gap-1.5">
                <span className={`h-0.5 w-full rounded-full bg-current transition ${isMobileMenuOpen ? 'translate-y-2 rotate-45' : ''}`} />
                <span className={`h-0.5 w-full rounded-full bg-current transition ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`h-0.5 w-full rounded-full bg-current transition ${isMobileMenuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </div>
        {isMobileMenuOpen ? (
          <div className="h-[calc(100dvh-64px)] overflow-y-auto overscroll-contain border-t border-[#e7f0f4] bg-white px-4 pt-3 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-[0_16px_30px_rgba(15,61,84,0.10)] sm:h-[calc(100dvh-74px)] lg:hidden" id="mobile-primary-navigation">
            <nav aria-label="Mobile primary navigation" className="ui-page-container grid gap-1 px-0 sm:px-2">
              {navigation.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center gap-2">
                  <Link
                    aria-current={isActiveNavigationItem(item) ? 'page' : undefined}
                    className={`flex min-h-11 min-w-0 flex-1 items-center rounded-xl px-4 py-2 text-[16px] transition ${isActiveNavigationItem(item) ? 'bg-[#eef8fb] font-extrabold text-[#087b9f]' : 'font-semibold text-[#365366] hover:bg-[#f5fafc]'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    to={item.href}
                  >
                    {item.label}
                  </Link>
                  {item.href === '/services' && services.length > 0 ? <button aria-label={activeLanguage === 'km' ? 'បង្ហាញសេវាកម្ម' : 'Show service links'} aria-expanded={isServicesOpen} aria-controls="mobile-service-links" className="size-11 shrink-0 rounded-lg text-xl text-[#087b9f]" onClick={() => setIsServicesOpen((open) => !open)} type="button"><span aria-hidden="true">{isServicesOpen ? '−' : '+'}</span></button> : null}
                  </div>
                  {item.href === '/services' && services.length > 0 && isServicesOpen ? <div id="mobile-service-links" className="ml-4 mt-1 grid gap-1 border-l border-[#d9e9ee] pl-3">{services.map((service) => <Link className="ui-copy-safe rounded-lg px-3 py-3 text-[14px] font-semibold leading-5 text-[#607486] hover:bg-[#f5fafc] hover:text-[#087b9f]" key={service.slug} onClick={() => setIsMobileMenuOpen(false)} to={serviceHref(service)}>{service.name}</Link>)}</div> : null}
                </div>
              ))}
              <div className="mt-3 grid gap-2 border-t border-[#e7f0f4] pt-4 sm:grid-cols-2">
                <Link className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b9dce8] px-5 text-[15px] font-extrabold text-[#075d83] hover:bg-[#eef8fb]" onClick={() => setIsMobileMenuOpen(false)} to="/contact">{actions.contactLabel}</Link>
                <button className="min-h-12 rounded-full bg-[#168aad] px-5 text-[15px] font-extrabold text-white shadow-[0_6px_16px_rgba(22,138,173,0.2)] hover:bg-[#0d7596]" onClick={() => { setIsMobileMenuOpen(false); navigate('/book-appointment'); }} type="button">{actions.appointmentLabel}</button>
              </div>
              <div className="mt-3 border-t border-[#e7f0f4] px-1 pt-4">
                <LanguageFlagSelector activeLanguage={activeLanguage} className="inline-flex" onLanguageChange={setLanguage} />
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      {children}
    </div>
  );
}
