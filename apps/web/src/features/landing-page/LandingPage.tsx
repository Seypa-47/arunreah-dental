import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import type {
  LandingBranch,
  LandingDoctor,
  LandingPageContent,
  LandingService,
  LandingShowcase,
} from '@/features/landing-page/types';
import { useLandingPageQuery } from './use-landing-page';

const asset = (name: string) => `/assets/landing/${name}`;
const serviceId = (name: string) => `service-${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-|-$)/g, '')}`;
const serviceSlug = (name: string) => name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-|-$)/g, '');

function AssetIcon({ alt = '', className, name }: { alt?: string; className: string; name: string }) {
  return <img alt={alt} aria-hidden={alt ? undefined : true} className={className} src={asset(name)} />;
}

function ArrowIcon() {
  return (
    <span
      aria-hidden="true"
      className="size-[14px] bg-current [mask-image:url('/assets/landing/arrow-right.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
    />
  );
}

function CarouselArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d={direction === 'left' ? 'M15 18L9 12L15 6' : 'M9 6L15 12L9 18'}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.75"
      />
    </svg>
  );
}

function HeroArrowButton({
  direction,
  onClick,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
}) {
  return (
    <button
      aria-label={direction === 'left' ? 'Previous branch' : 'Next branch'}
      className="grid size-11 place-items-center rounded-full border border-[#3695B9] bg-white/95 text-[#3695B9] shadow-sm transition hover:bg-[#3695B9] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]"
      onClick={onClick}
      type="button"
    >
      <CarouselArrowIcon direction={direction} />
    </button>
  );
}

function SectionHeader({
  actionHref = '#',
  actionLabel,
  align = 'left',
  eyebrow,
  title,
}: {
  align?: 'center' | 'left';
  actionHref?: string;
  actionLabel: string;
  eyebrow?: string;
  title: string;
}) {
  const titleColor = 'text-[#005687]';

  return (
    <div className="mx-auto flex w-full max-w-[1280px] items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <div className={align === 'center' ? 'mx-auto text-center' : undefined}>
        {eyebrow ? (
          <p className="mb-4 text-[12px] font-bold uppercase leading-4 tracking-[3.6px] text-[#3695b9]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className={`text-[28px] font-extrabold leading-tight tracking-[-0.035em] sm:text-[38px] ${titleColor}`}>{title}</h2>
      </div>
      {align === 'left' ? (
        <Link
          className="hidden items-center gap-2 text-[14px] font-bold leading-5 text-[#005687] transition hover:text-[#3695B9] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9] sm:inline-flex"
          to={actionHref}
        >
          {actionLabel}
          <ArrowIcon />
        </Link>
      ) : null}
    </div>
  );
}

function HeroSlide({ hero }: { hero: LandingPageContent['heroes'][number] }) {
  const navigate = useNavigate();
  const imageUrl = hero.imageUrl || '/assets/landing/hero-clinic.png';

  return (
    <article className="w-full shrink-0 snap-center">
      <div className="relative mx-auto w-full max-w-[1280px] px-4 pb-7 pt-3 sm:px-6 md:px-8 lg:h-[530px] lg:pb-0">
        <div className="relative h-full">
          <div className="relative h-[264px] overflow-hidden rounded-[20px] bg-[#dfe9ee] shadow-[0_8px_22px_rgba(15,61,84,0.08)] sm:h-[330px] md:h-[400px] lg:absolute lg:inset-x-0 lg:top-3 lg:h-[438px] lg:rounded-[24px]">
            <img alt={hero.imageAlt || 'Arunreah Dental Clinic'} className="h-full w-full object-cover object-center" src={imageUrl} />
          </div>
          <div className="relative mx-2 -mt-7 grid overflow-hidden rounded-xl border border-[#dcebef] bg-white text-[#005687] shadow-[0_8px_22px_rgba(15,61,84,0.09)] sm:mx-4 sm:grid-cols-2 lg:absolute lg:left-1/2 lg:top-[398px] lg:mx-0 lg:mt-0 lg:w-[calc(100%-4rem)] lg:-translate-x-1/2 lg:grid-cols-[minmax(0,1.35fr)_auto_minmax(0,0.85fr)] xl:w-[920px]">
            <div className="order-2 flex items-center gap-3 px-5 py-4 sm:px-6 sm:py-5 lg:order-none">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#3695B9] sm:size-[43px]">
                <AssetIcon className="h-[18px] w-[14px]" name="hero-location.svg" />
              </span>
              <div className="min-w-0 max-w-[330px]">
                <p className="text-[11px] font-bold leading-[14px] text-[#3695B9]">{hero.locationLabel}</p>
                <p className="mt-0.5 text-[13px] font-semibold leading-[18px] text-[#005687]">{hero.address}</p>
              </div>
            </div>
            <div className="order-1 flex items-center justify-center border-b border-[#e5eef1] px-5 py-3.5 sm:col-span-2 sm:border-y sm:px-6 sm:py-4 lg:order-none lg:col-span-1 lg:border-y-0 lg:border-x">
              <Button
                className="min-h-11 w-full max-w-[224px] rounded-lg bg-[#3695B9] px-5 text-[15px] font-bold text-white shadow-none hover:bg-[#2c84a5]"
                icon={<AssetIcon className="h-4 w-[14px]" name="hero-calendar.svg" />}
                onClick={() => navigate('/book-appointment')}
              >
                {hero.appointmentLabel}
              </Button>
            </div>
            <div className="order-3 flex items-center gap-3 border-t border-[#e5eef1] px-5 py-4 sm:border-t-0 sm:px-6 sm:py-5 lg:order-none">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#3695B9] sm:size-[43px]">
                <AssetIcon className="size-[18px]" name="hero-phone.svg" />
              </span>
              <div>
                <p className="mb-0.5 text-[11px] font-bold leading-[14px] text-[#3695B9]">{hero.callLabel}</p>
                <div className="text-[15px] font-bold leading-5 text-[#005687]">
                  {hero.phones.map((phone) => (
                    <a className="block hover:underline" href={`tel:${phone.replaceAll(' ', '')}`} key={phone}>
                      {phone}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function HeroSection({ heroes }: { heroes: LandingPageContent['heroes'] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const scrollToHero = (index: number) => {
    const carousel = carouselRef.current;
    const nextIndex = Math.min(Math.max(index, 0), heroes.length - 1);

    if (!carousel) {
      return;
    }

    setActiveHeroIndex(nextIndex);
    carousel.scrollTo({
      behavior: 'smooth',
      left: carousel.clientWidth * nextIndex,
    });
  };

  const scrollToBranch = (direction: -1 | 1) => {
    scrollToHero(activeHeroIndex + direction);
  };

  const syncActiveHero = () => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    setActiveHeroIndex(Math.round(carousel.scrollLeft / carousel.clientWidth));
  };

  return (
    <section aria-label="Clinic branches" className="relative bg-[#f7fafc]">
      <div
        className="hero-carousel flex snap-x snap-mandatory overflow-hidden scroll-smooth touch-pan-y [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        data-scroll-container
        onScroll={syncActiveHero}
        ref={carouselRef}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {heroes.map((hero) => (
          <HeroSlide hero={hero} key={hero.address} />
        ))}
      </div>
      {heroes.length > 1 ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-[142px] mx-auto flex w-full max-w-[1180px] items-center justify-between px-2 sm:top-[196px] sm:px-5 md:top-[230px]">
            <div className="pointer-events-auto">
              <HeroArrowButton direction="left" onClick={() => scrollToBranch(-1)} />
            </div>
            <div className="pointer-events-auto">
              <HeroArrowButton direction="right" onClick={() => scrollToBranch(1)} />
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

function useSmoothCarousel<T>(items: T[]) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const hasMoved = useRef(false);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const momentumRaf = useRef<number | null>(null);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { clientWidth, scrollLeft, scrollWidth } = scrollRef.current;
      const maxScroll = Math.max(0, scrollWidth - clientWidth);
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft < maxScroll - 2);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [items, checkScroll]);

  const cancelMomentum = useCallback(() => {
    if (momentumRaf.current !== null) {
      cancelAnimationFrame(momentumRaf.current);
      momentumRaf.current = null;
    }
  }, []);

  useEffect(() => {
    return () => cancelMomentum();
  }, [cancelMomentum]);

  const handleScroll = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      cancelMomentum();
      const el = scrollRef.current;
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      const scrollDistance = 310;
      const target = direction === 'left'
        ? Math.max(0, el.scrollLeft - scrollDistance)
        : Math.min(maxScroll, el.scrollLeft + scrollDistance);

      el.scrollTo({
        behavior: 'smooth',
        left: target,
      });
    }
  }, [cancelMomentum]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current || e.button !== 0) return;
    cancelMomentum();
    isDragging.current = true;
    setIsDraggingState(true);
    hasMoved.current = false;
    startX.current = e.clientX;
    lastX.current = e.clientX;
    lastTime.current = performance.now();
    scrollStart.current = scrollRef.current.scrollLeft;
    velocity.current = 0;
  }, [cancelMomentum]);

  useEffect(() => {
    if (!isDraggingState) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !scrollRef.current) return;
      const el = scrollRef.current;
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);

      const dx = e.clientX - startX.current;
      if (Math.abs(dx) > 3) {
        hasMoved.current = true;
      }

      let target = scrollStart.current - dx;
      if (target <= 0) {
        target = 0;
        startX.current = e.clientX;
        scrollStart.current = 0;
      } else if (target >= maxScroll) {
        target = maxScroll;
        startX.current = e.clientX;
        scrollStart.current = maxScroll;
      }

      el.scrollLeft = target;

      const now = performance.now();
      const dt = now - lastTime.current;
      if (dt > 8) {
        velocity.current = (e.clientX - lastX.current) / dt;
        lastX.current = e.clientX;
        lastTime.current = now;
      }
    };

    const handleGlobalMouseUp = () => {
      if (!isDragging.current || !scrollRef.current) return;
      isDragging.current = false;
      setIsDraggingState(false);

      if (hasMoved.current) {
        setTimeout(() => {
          hasMoved.current = false;
        }, 80);
      }

      const now = performance.now();
      const timeSinceMove = now - lastTime.current;
      if (timeSinceMove < 60 && Math.abs(velocity.current) > 0.15) {
        let currentVelocity = -velocity.current * 14;
        const glide = () => {
          if (!scrollRef.current || Math.abs(currentVelocity) < 0.5) {
            momentumRaf.current = null;
            checkScroll();
            return;
          }
          const el = scrollRef.current;
          const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
          const next = el.scrollLeft + currentVelocity;

          if (next <= 0) {
            el.scrollLeft = 0;
            momentumRaf.current = null;
            checkScroll();
            return;
          }
          if (next >= maxScroll) {
            el.scrollLeft = maxScroll;
            momentumRaf.current = null;
            checkScroll();
            return;
          }

          el.scrollLeft = next;
          currentVelocity *= 0.92;
          momentumRaf.current = requestAnimationFrame(glide);
        };
        momentumRaf.current = requestAnimationFrame(glide);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDraggingState, checkScroll]);

  return {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    isDragging: isDraggingState,
    hasMoved,
    handleScroll,
    handleMouseDown,
    checkScroll,
  };
}

function ServicesSection({ services }: { services: LandingService[] }) {
  const {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    isDragging,
    hasMoved,
    handleScroll,
    handleMouseDown,
    checkScroll,
  } = useSmoothCarousel(services);

  return (
    <section className="mt-2 bg-white pb-16 pt-16 sm:pb-20 sm:pt-20" id="services">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-[12px] font-bold uppercase leading-4 tracking-[3.6px] text-[#3695b9]">
              What We Offer
            </p>
            <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-[#005687] sm:text-[38px]">Our Services</h2>
          </div>
          <div className="flex items-center gap-5">
            <Link
              className="hidden items-center gap-2 text-[14px] font-bold leading-5 text-[#005687] transition hover:text-[#3695B9] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9] sm:inline-flex"
              to="/services"
            >
              See All Services
              <ArrowIcon />
            </Link>
            <div className="flex items-center gap-2">
              <button
                aria-label="Scroll services left"
                className={`grid size-9 place-items-center rounded-full border transition duration-200 ${
                  canScrollLeft
                    ? 'border-[#3695B9] text-[#3695B9] hover:bg-[#f0f9fa]'
                    : 'cursor-not-allowed border-[#e2e8f0] text-[#cbd5e1]'
                }`}
                disabled={!canScrollLeft}
                onClick={() => handleScroll('left')}
                type="button"
              >
                ‹
              </button>
              <button
                aria-label="Scroll services right"
                className={`grid size-9 place-items-center rounded-full transition duration-200 ${
                  canScrollRight
                    ? 'bg-[#3695B9] text-white shadow-sm hover:bg-[#2c84a5]'
                    : 'cursor-not-allowed bg-[#e2e8f0] text-[#94a3b8]'
                }`}
                disabled={!canScrollRight}
                onClick={() => handleScroll('right')}
                type="button"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        <div
          className={`no-scrollbar mt-6 flex gap-4 overflow-x-auto px-1 py-2 select-none overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          data-scroll-container
          onMouseDown={handleMouseDown}
          onScroll={checkScroll}
          ref={scrollRef}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {services.map((service) => {
            const slug = serviceSlug(service.name);
            const id = serviceId(service.name);
            const hasImage = Boolean(service.imageUrl);

            return (
              <Card
                className={`w-[268px] shrink-0 overflow-hidden rounded-xl border-[#e4edf2] bg-white shadow-[0_2px_10px_rgba(15,61,84,0.06)] transition duration-200 hover:border-[#b9dce8] hover:shadow-[0_7px_18px_rgba(15,61,84,0.09)] sm:w-[286px] ${hasImage ? 'h-[318px] sm:h-[334px]' : 'min-h-[176px]'}`}
                id={id}
                key={service.name}
              >
                <Link
                  aria-label={`View ${service.name}`}
                  className="group block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]"
                  onClick={(e) => {
                    if (hasMoved.current) {
                      e.preventDefault();
                    }
                  }}
                  to={`/services/${slug}`}
                >
                  {hasImage ? <img alt={service.imageAlt || service.name} className="pointer-events-none h-[182px] w-full bg-[#eaf2f6] object-cover object-center transition duration-500 group-hover:scale-[1.02] sm:h-[196px]" draggable={false} src={service.imageUrl} /> : null}
                  <div className={`flex flex-col justify-center px-4 py-4 sm:px-5 ${hasImage ? 'h-[136px] sm:h-[138px]' : 'min-h-[176px]'}`}>
                    <h3 className="text-[16px] font-bold leading-5 text-[#005687]">{service.name}</h3>
                    <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-[19px] text-[#607486]">
                      {service.description}
                    </p>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DoctorsSection({ doctors }: { doctors: LandingDoctor[] }) {
  const {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    isDragging,
    hasMoved,
    handleScroll,
    handleMouseDown,
    checkScroll,
  } = useSmoothCarousel(doctors);

  return (
    <section className="bg-[#f4f9fb] pb-16 pt-16 sm:pb-20 sm:pt-20" id="doctors">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-[12px] font-bold uppercase leading-4 tracking-[3.6px] text-[#3695B9]">
              Expert Team
            </p>
            <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-[#005687] sm:text-[38px]">Meet Our Specialists</h2>
          </div>
          <div className="flex items-center gap-5">
            <Link
              className="hidden items-center gap-2 text-[14px] font-bold leading-5 text-[#005687] transition hover:text-[#3695B9] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9] sm:inline-flex"
              to="/doctors"
            >
              See All Doctors
              <ArrowIcon />
            </Link>
            <div className="flex items-center gap-2">
              <button
                aria-label="Scroll specialists left"
                className={`grid size-9 place-items-center rounded-full border transition duration-200 ${
                  canScrollLeft
                    ? 'border-[#3695B9] text-[#3695B9] hover:bg-[#f0f9fa]'
                    : 'cursor-not-allowed border-[#e2e8f0] text-[#cbd5e1]'
                }`}
                disabled={!canScrollLeft}
                onClick={() => handleScroll('left')}
                type="button"
              >
                ‹
              </button>
              <button
                aria-label="Scroll specialists right"
                className={`grid size-9 place-items-center rounded-full transition duration-200 ${
                  canScrollRight
                    ? 'bg-[#3695B9] text-white shadow-sm hover:bg-[#2c84a5]'
                    : 'cursor-not-allowed bg-[#e2e8f0] text-[#94a3b8]'
                }`}
                disabled={!canScrollRight}
                onClick={() => handleScroll('right')}
                type="button"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        <div
          className={`no-scrollbar mt-6 flex gap-4 overflow-x-auto px-1 py-2 select-none overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          data-scroll-container
          onMouseDown={handleMouseDown}
          onScroll={checkScroll}
          ref={scrollRef}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {doctors.map((doctor) => {
            const hasImage = Boolean(doctor.imageUrl);
            return <Card
              className={`w-[268px] shrink-0 overflow-hidden rounded-xl border-[#e4edf2] bg-white shadow-[0_2px_10px_rgba(15,61,84,0.06)] transition duration-200 hover:border-[#b9dce8] hover:shadow-[0_7px_18px_rgba(15,61,84,0.09)] sm:w-[286px] ${hasImage ? 'h-[326px] sm:h-[342px]' : 'min-h-[176px]'}`}
              key={doctor.name}
            >
              <Link
                aria-label={`View profile for ${doctor.name}`}
                className="group block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]"
                onClick={(e) => {
                  if (hasMoved.current) {
                    e.preventDefault();
                  }
                }}
                to={doctor.detail?.profileHref || '/doctors'}
              >
                  {hasImage ? <img alt={doctor.imageAlt || doctor.name} className="pointer-events-none h-[226px] w-full bg-[#eaf2f6] object-cover object-top transition duration-500 group-hover:scale-[1.02] sm:h-[242px]" draggable={false} src={doctor.imageUrl} /> : null}
                <div className={`flex flex-col justify-center px-4 py-4 sm:px-5 ${hasImage ? 'h-[100px]' : 'min-h-[176px]'}`}>
                  <h3 className="text-[16px] font-bold leading-5 text-[#005687]">{doctor.name}</h3>
                  <p className="mt-1.5 text-[13px] font-semibold leading-4 text-[#168aad]">{doctor.specialty}</p>
                </div>
              </Link>
            </Card>;
          })}
        </div>
      </div>
    </section>
  );
}

function BranchesSection({ branches }: { branches: LandingBranch[] }) {
  return (
    <section className="bg-[#f4f9fb] pb-16 pt-6 sm:pb-20" id="branches">
      <SectionHeader actionHref="/branches" actionLabel="See All Branches" title="Branches" />
      <div className="mx-auto mt-6 grid w-full max-w-[1280px] gap-5 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {branches.map((branch) => {
          const [days, time] = branch.hours.split(', ');
          const hasImage = Boolean(branch.imageUrl);

          return (
            <Card
              className={`grid min-h-[212px] overflow-hidden rounded-xl border-[#e4edf2] bg-white shadow-[0_2px_10px_rgba(15,61,84,0.06)] transition duration-200 hover:border-[#b9dce8] hover:shadow-[0_7px_18px_rgba(15,61,84,0.09)] md:min-h-[232px] ${hasImage ? 'grid-cols-[1.15fr_0.85fr] md:grid-cols-[1.08fr_0.92fr]' : 'grid-cols-1'}`}
              key={branch.name}
            >
              <div className="p-4 sm:p-5 md:p-6">
                <h3 className="mb-4 flex items-center gap-2 text-[16px] font-bold leading-5 text-[#005687] sm:text-[19px] sm:leading-[22px]">
                  <img alt="" aria-hidden="true" className="size-6" src={asset('branch-card-pin.svg')} />
                  {branch.name}
                </h3>
                <div className="space-y-2 border-b border-[#edf2f7] pb-3 sm:space-y-3 sm:pb-4">
                  {branch.phones.map((phone) => (
                    <a
                      className="flex items-center gap-2 text-[13px] font-semibold leading-4 text-[#005687] hover:underline sm:gap-3 sm:text-[14px] sm:leading-5"
                      href={`tel:${phone.replaceAll(' ', '')}`}
                      key={phone}
                    >
                      <img alt="" aria-hidden="true" className="size-5" src={asset('branch-card-phone.svg')} />
                      {phone}
                    </a>
                  ))}
                </div>
                <p className="mt-3 flex items-start gap-2 text-[12px] leading-4 text-[#607486] sm:mt-4 sm:gap-3 sm:text-[13px] sm:leading-5">
                  <img alt="" aria-hidden="true" className="size-5" src={asset('branch-card-clock.svg')} />
                  <span>
                    {days}
                    <span className="block font-semibold text-[#005687]">{time}</span>
                  </span>
                </p>
              </div>
              {hasImage ? <img alt={branch.imageAlt || branch.name} className="h-full min-h-[212px] w-full bg-[#e5e7eb] object-cover object-center md:min-h-0" src={branch.imageUrl} /> : null}
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function ShowcaseSection({ showcase }: { showcase: LandingShowcase[] }) {
  return (
    <section className="relative overflow-hidden bg-[#00546f] pb-16 pt-16 text-white sm:pb-20 sm:pt-20" id="showcase">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(65,183,213,0.32),transparent_30%),radial-gradient(circle_at_85%_75%,rgba(21,134,166,0.45),transparent_35%)]" />
      <div className="relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between border-b border-white/25 pb-4">
          <div>
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.22em] text-[#b9e8f5]">Patient stories & clinic guidance</p>
            <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.035em] sm:text-[38px]">Latest Showcase</h2>
          </div>
          <Link
            className="hidden items-center gap-2 text-[16px] font-semibold leading-6 hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:inline-flex"
            to="/showcases"
          >
            View Show Cases
            <AssetIcon className="h-3 w-[8px]" name="showcase-chevron.svg" />
          </Link>
        </div>
        <div className="mx-auto grid max-w-[1080px] gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {showcase.map((item) => (
            <article className="w-full" key={item.slug ?? item.title}>
              {item.slug ? (
                <Link
                  aria-label={`View ${item.title}`}
                  className="group block overflow-hidden rounded-xl border border-white/10 bg-white/[0.05] p-2 transition duration-200 hover:bg-white/[0.10] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  to={`/showcases/${item.slug}`}
                >
                  {item.imageUrl ? <img alt={item.imageAlt || item.title} className="h-[212px] w-full rounded-lg object-cover object-center transition duration-500 group-hover:scale-[1.02]" src={item.imageUrl} /> : null}
                  <h3 className="px-2 pb-3 pt-4 text-[18px] font-bold leading-6 text-white group-hover:underline">{item.title}</h3>
                </Link>
              ) : (
                <>
                  {item.imageUrl ? <img alt={item.imageAlt || item.title} className="h-[212px] w-full rounded-lg object-cover object-center" src={item.imageUrl} /> : null}
                  <h3 className="px-2 pb-3 pt-4 text-[18px] font-bold leading-6 text-white">{item.title}</h3>
                </>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LandingPageView({ content }: { content: LandingPageContent }) {
  return (
    <SiteLayout actions={content.actions} navigation={content.navigation} services={content.services}>
      <main>
        <h1 className="sr-only">Arunreah Dental Clinic</h1>
        <HeroSection heroes={content.heroes} />
        <ServicesSection services={content.services} />
        <DoctorsSection doctors={content.doctors} />
        <BranchesSection branches={content.branches} />
        <ShowcaseSection showcase={content.showcase} />
      </main>
      <SiteFooter {...content.footer} />
    </SiteLayout>
  );
}

function LandingPageSkeleton() {
  return (
    <SiteLayout
      actions={{ appointmentLabel: 'Book Appointment', contactLabel: 'Contact Us' }}
      navigation={[
        { href: '/', label: 'Home' },
        { href: '/services', label: 'Services' },
        { href: '/doctors', label: 'Doctors' },
      ]}
    >
      <main aria-busy="true" aria-label="Loading landing page" className="bg-white">
        <span className="sr-only">Loading clinic content</span>

        <section aria-hidden="true" className="bg-[#f7fafc]">
          <div className="relative mx-auto w-full max-w-[1280px] px-4 pb-7 pt-3 sm:px-6 md:h-[530px] md:pb-0 lg:px-8">
            <div className="relative h-full">
              <div className="relative h-[264px] overflow-hidden rounded-[20px] bg-[#dfecef] sm:h-[310px] md:absolute md:inset-x-0 md:top-3 md:h-[438px] md:rounded-[24px]">
                <div className="h-full w-full animate-pulse bg-[linear-gradient(110deg,rgba(255,255,255,0.18),rgba(255,255,255,0.5),rgba(255,255,255,0.18))]" />
              </div>
              <div className="relative mx-2 -mt-7 grid min-h-[84px] overflow-hidden rounded-xl bg-[#e8f1f4] p-4 md:absolute md:left-1/2 md:top-[395px] md:mx-0 md:mt-0 md:w-[calc(100%-4rem)] md:-translate-x-1/2 md:grid-cols-[72px_repeat(3,minmax(0,1fr))] md:p-0 lg:w-[920px] lg:grid-cols-[88px_276px_276px_280px]">
                <div className="hidden bg-white/70 md:block" />
                <div className="flex items-center gap-3 py-2 md:border-r md:border-white/70 md:px-5">
                  <span className="size-10 shrink-0 animate-pulse rounded-full bg-white/80" />
                  <div className="space-y-2">
                    <div className="h-2.5 w-16 animate-pulse rounded-full bg-white/75" />
                    <div className="h-3 w-28 animate-pulse rounded-full bg-white" />
                  </div>
                </div>
                <div className="hidden items-center justify-center border-x border-white/70 px-5 md:flex">
                  <div className="h-11 w-full max-w-[210px] animate-pulse rounded-xl bg-white" />
                </div>
                <div className="hidden items-center gap-3 px-5 md:flex">
                  <span className="size-10 shrink-0 animate-pulse rounded-full bg-white/80" />
                  <div className="space-y-2">
                    <div className="h-2.5 w-12 animate-pulse rounded-full bg-white/75" />
                    <div className="h-3 w-24 animate-pulse rounded-full bg-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-hidden="true" className="bg-white py-12 sm:py-16">
          <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-3">
                <div className="h-3 w-28 animate-pulse rounded-full bg-[#dcebf0]" />
                <div className="h-8 w-48 animate-pulse rounded-lg bg-[#d1e6ee] sm:w-64" />
              </div>
              <div className="hidden h-9 w-32 animate-pulse rounded-full bg-[#e5f0f4] sm:block" />
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div className="overflow-hidden rounded-xl border border-[#e3edf1] bg-white" key={index}>
                  <div className="h-[152px] animate-pulse bg-[#e3eef2] sm:h-[180px]" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#dcebf0]" />
                    <div className="h-3 w-full animate-pulse rounded-full bg-[#edf4f6]" />
                    <div className="h-3 w-4/5 animate-pulse rounded-full bg-[#edf4f6]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-hidden="true" className="bg-[#f4f9fb] py-12 sm:py-16">
          <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="space-y-3">
              <div className="h-3 w-24 animate-pulse rounded-full bg-[#dcebf0]" />
              <div className="h-8 w-56 animate-pulse rounded-lg bg-[#d1e6ee] sm:w-72" />
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div className="overflow-hidden rounded-xl border border-[#e3edf1] bg-white" key={index}>
                  <div className="h-[190px] animate-pulse bg-[#e3eef2] sm:h-[220px]" />
                  <div className="space-y-2 p-4">
                    <div className="h-4 w-3/5 animate-pulse rounded-full bg-[#dcebf0]" />
                    <div className="h-3 w-2/5 animate-pulse rounded-full bg-[#edf4f6]" />
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

function LandingPageEmpty() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge>No content</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">Landing page content is unavailable</h1>
        <p className="mt-3 text-[#6b7280]">Please check the content source and try again.</p>
      </Card>
    </main>
  );
}

function LandingPageError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">Error</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">We could not load the landing page</h1>
        <p className="mt-3 text-[#6b7280]">Try again to refresh the clinic content.</p>
        <Button className="mt-6" onClick={onRetry}>
          Retry
        </Button>
      </Card>
    </main>
  );
}

function hasLandingContent(content: LandingPageContent | undefined): content is LandingPageContent {
  return Boolean(
      content &&
      content.navigation.length > 0 &&
      content.heroes.length > 0 &&
      content.services.length > 0 &&
      content.doctors.length > 0 &&
      content.branches.length > 0 &&
      content.showcase.length > 0,
  );
}

export function LandingPage() {
  const { data, isError, isLoading, refetch } = useLandingPageQuery();

  if (isLoading) {
    return <LandingPageSkeleton />;
  }

  if (isError) {
    return <LandingPageError onRetry={() => void refetch()} />;
  }

  if (!hasLandingContent(data)) {
    return <LandingPageEmpty />;
  }

  return <LandingPageView content={data} />;
}
