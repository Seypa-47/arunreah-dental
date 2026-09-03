import { useEffect, useState, type PropsWithChildren } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { LandingNavigationItem, LandingService } from '@/features/landing-page/types';

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

export function SiteLayout({ actions, children, navigation, services = [] }: SiteLayoutProps) {
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'km'>('en');
  const { hash, pathname } = useLocation();
  const navigate = useNavigate();
  const serviceHref = (name: string) => `/services/${serviceSlug(name)}`;

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-[#f7fafc] text-[#0c2243]">
      <header className="sticky top-0 z-40 border-b border-[#edf2f7] bg-white/95 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all duration-200">
        <div className="mx-auto flex h-[64px] w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link aria-label="Arunreah Dental Clinic home" className="shrink-0 leading-none" to="/">
            <span className="block text-[20px] font-extrabold uppercase leading-5 tracking-[-0.25px] text-[#3695b9]">
              Arunreah
            </span>
            <span className="block text-[10px] font-bold uppercase leading-[15px] tracking-[1px] text-[#1789a8]">
              Dental Clinic
            </span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-7 lg:flex">
            {navigation.map((item) => {
              const isActive = isActiveNavigationItem(item);

              if (item.label !== 'Services') {
                return (
                  <Link
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative py-2 text-[14px] font-medium transition-colors duration-200 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695b9] ${
                      isActive ? 'text-[#3695b9]' : 'text-[#475569] hover:text-[#3695b9]'
                    }`}
                    key={item.label}
                    to={item.href}
                  >
                    {item.label}
                    {isActive ? (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#3695b9]" />
                    ) : null}
                  </Link>
                );
              }

              return (
                <div className="group relative" key={item.label}>
                  <Link
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative inline-flex items-center gap-1.5 py-2 text-[14px] font-medium transition-colors duration-200 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695b9] ${
                      isActive ? 'text-[#3695b9]' : 'text-[#475569] hover:text-[#3695b9]'
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
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#3695b9]" />
                    ) : null}
                  </Link>
                  <div className="invisible absolute left-1/2 top-full z-50 mt-2 w-[282px] -translate-x-1/2 translate-y-2 rounded-2xl border border-[#edf2f7] bg-white p-2 opacity-0 shadow-[0_18px_40px_rgba(15,23,42,0.12)] transition-all duration-200 ease-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="absolute -top-2 left-0 h-2 w-full" />
                    {services.map((service) => (
                      <Link
                        className="block rounded-xl px-4 py-2.5 text-[14px] font-medium leading-5 text-[#475569] transition-colors duration-150 hover:bg-[#f0f9fa] hover:text-[#3695b9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3695b9]"
                        key={service.name}
                        to={serviceHref(service.name)}
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <Button
              className="hidden h-9 min-h-9 rounded-none border-0 border-r border-[#3695b9] bg-transparent px-0 py-0 pr-4 text-[14px] font-bold text-[#3695b9] shadow-none hover:bg-transparent hover:text-[#2a86a8] active:opacity-80 sm:inline-flex"
              icon={
                <span className="grid size-8 place-items-center rounded-full border border-[#3695b9]">
                  <img alt="" aria-hidden="true" className="size-3" src={asset('header-phone.svg')} />
                </span>
              }
              onClick={() => navigate('/contact')}
              variant="secondary"
            >
              {actions.contactLabel}
            </Button>
            <Button
              className="h-9 min-h-9 rounded-full bg-[#3695b9] px-5 py-0 text-[14px] font-bold shadow-[0_10px_15px_-3px_#cffafe,0_4px_6px_-4px_#cffafe] transition-transform duration-150 hover:bg-[#2f8fb0] active:scale-95"
              onClick={() => navigate('/book-appointment')}
            >
              {actions.appointmentLabel}
            </Button>
            <div aria-label="Language selector" className="hidden items-center gap-2 pl-2 sm:flex" role="group">
              <button
                aria-label="Switch to Khmer"
                aria-pressed={activeLanguage === 'km'}
                className={`size-[30px] overflow-hidden rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f9fbe] ${
                  activeLanguage === 'km' ? 'opacity-100' : 'opacity-50'
                }`}
                onClick={() => setActiveLanguage('km')}
                type="button"
              >
                <img alt="" className="size-full object-cover" src={asset('flag-kh.png')} />
                <span className="sr-only">Khmer</span>
              </button>
              <span className="text-[12px] font-semibold leading-4 text-[#94a3b8]">|</span>
              <button
                aria-label="Switch to English"
                aria-pressed={activeLanguage === 'en'}
                className={`size-[30px] overflow-hidden rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f9fbe] ${
                  activeLanguage === 'en' ? 'opacity-100' : 'opacity-50'
                }`}
                onClick={() => setActiveLanguage('en')}
                type="button"
              >
                <img alt="" className="size-full object-cover" src={asset('flag-en.png')} />
                <span className="sr-only">English</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
