import { useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import type { ContactPageContent } from '@/features/landing-page/types';
import { useContactPageQuery } from './use-contact-page';

const skeletonNavigation = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/branches', label: 'Branches' },
];

type ContactIconName = ContactPageContent['contactCards'][number]['icon'];

function ContactIcon({ className = 'size-[18px]', name }: { className?: string; name: ContactIconName }) {
  const iconPath = {
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7.8v4.45l3 1.75" />
      </>
    ),
    email: (
      <>
        <path d="M4 7h16v10H4z" />
        <path d="m5 8 7 5 7-5" />
      </>
    ),
    location: (
      <>
        <path
          d="M12 21s7-5.92 7-11.7A6.86 6.86 0 0 0 12 2.4a6.86 6.86 0 0 0-7 6.9C5 15.08 12 21 12 21Z"
          fill="currentColor"
          stroke="none"
        />
        <circle cx="12" cy="9.3" fill="white" r="2.1" stroke="none" />
      </>
    ),
    phone: (
      <path
        d="M7.25 4.25 9.6 3.7l2 4.65-1.9 1.25a9.75 9.75 0 0 0 4.7 4.7l1.25-1.9 4.65 2-0.55 2.35a2 2 0 0 1-2.25 1.52C10.8 17.3 6.7 13.2 5.73 6.5a2 2 0 0 1 1.52-2.25Z"
        fill="currentColor"
        stroke="none"
      />
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
      {iconPath[name]}
    </svg>
  );
}

function SendIcon() {
  return (
    <svg aria-hidden="true" className="size-[15px]" fill="currentColor" viewBox="0 0 20 20">
      <path d="M17.82 2.18a1 1 0 0 0-1.05-.23L2.92 7.4a1 1 0 0 0 .02 1.87l5.28 1.98 1.98 5.28a1 1 0 0 0 1.87.02l5.45-13.85a1 1 0 0 0-.23-1.05ZM9.05 10.3 5.9 9.12l7.1-2.8-3.95 3.98Zm1.55 1.55 3.98-3.95-2.8 7.1-1.18-3.15Z" />
    </svg>
  );
}

function InfoBlock({ item, compact = false }: { compact?: boolean; item: ContactPageContent['contactCards'][number] }) {
  return (
    <div className={`flex items-center ${compact ? 'gap-4' : 'gap-5'}`}>
      <span
        className={`grid shrink-0 place-items-center rounded-full bg-[#eef8fb] text-[#3695b9] ${
          compact ? 'size-[38px]' : 'size-[46px]'
        }`}
      >
        <ContactIcon className={compact ? 'size-[15px]' : 'size-[18px]'} name={item.icon} />
      </span>
      <div>
        <p className="text-[12px] font-extrabold leading-4 text-[#3695b9]">{item.label}</p>
        <p className={`whitespace-pre-line font-extrabold text-[#0c2243] ${compact ? 'text-[14px] leading-5' : 'text-[16px] leading-6'}`}>
          {item.value}
        </p>
        {!compact && item.description !== item.value ? (
          <p className="text-[12px] font-medium leading-4 text-[#6b7280]">{item.description}</p>
        ) : null}
      </div>
    </div>
  );
}

function ContactHero({ hero }: { hero: ContactPageContent['hero'] }) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative min-h-[560px]">
        <img
          alt={hero.backgroundImageAlt}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
          src={hero.backgroundImageUrl}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-white via-white/86 to-white/10" />
        <div className="relative mx-auto grid min-h-[560px] w-full max-w-[1280px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_410px] lg:px-8">
          <div className="max-w-[620px]">
            <p className="text-[12px] font-extrabold uppercase leading-4 tracking-[5px] text-[#3695b9]">{hero.eyebrow}</p>
            <h1 className="mt-6 text-[42px] font-extrabold leading-[50px] text-[#005687] sm:text-[58px] sm:leading-[66px]">
              {hero.title}
            </h1>
            <p className="mt-3 max-w-[600px] text-[18px] font-medium leading-8 text-[#6b7280]">{hero.subtitle}</p>
          </div>
          <Card className="rounded-[28px] border-white/60 bg-white/88 px-8 py-8 shadow-[0_18px_42px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="space-y-6">
              {hero.info.map((item) => (
                <InfoBlock compact item={item} key={item.label} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function ContactCards({ cards }: { cards: ContactPageContent['contactCards'] }) {
  return (
    <section className="bg-[#f1f7fa] py-[62px]">
      <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {cards.map((card) => (
          <Card className="rounded-2xl border-[#edf2f7] px-7 py-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)]" key={card.label}>
            <InfoBlock compact item={card} />
          </Card>
        ))}
      </div>
    </section>
  );
}

const fieldClass =
  'min-h-[54px] w-full rounded-xl border border-[#d9e6ed] bg-[#f8fbfd] px-4 text-[14px] font-medium text-[#0c2243] outline-none transition placeholder:text-[#94a3b8] focus:border-[#3695b9] focus:bg-white focus:ring-2 focus:ring-[#d9f0f7]';

function TextField({
  id,
  label,
  placeholder,
  type = 'text',
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: 'date' | 'email' | 'tel' | 'text';
}) {
  return (
    <div>
      <label className="mb-2 block text-[12px] font-extrabold leading-4 text-[#005687]" htmlFor={id}>
        {label}
      </label>
      <input className={fieldClass} id={id} name={id} placeholder={placeholder} type={type} />
    </div>
  );
}

function SelectField({
  id,
  label,
  options,
  placeholder,
}: {
  id: string;
  label: string;
  options: string[];
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[12px] font-extrabold leading-4 text-[#005687]" htmlFor={id}>
        {label}
      </label>
      <select className={`${fieldClass} appearance-none`} defaultValue="" id={id} name={id}>
        <option disabled value="">
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function ContactForm({ form }: { form: ContactPageContent['form'] }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <section className="bg-[#f1f7fa] pb-[46px]">
      <Card className="mx-auto w-[calc(100%-32px)] max-w-[1280px] rounded-2xl border-[#edf2f7] px-6 py-10 shadow-[0_10px_28px_rgba(15,23,42,0.04)] sm:px-10 lg:px-12">
        <h2 className="text-[26px] font-extrabold leading-8 text-[#005687]">{form.title}</h2>
        <form className="mt-9 grid gap-x-6 gap-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            <TextField id="fullName" label={form.fields.fullName} placeholder={form.placeholders.fullName} />
            <TextField id="phone" label={form.fields.phone} placeholder={form.placeholders.phone} type="tel" />
            <TextField id="email" label={form.fields.email} placeholder={form.placeholders.email} type="email" />
            <SelectField
              id="preferredBranch"
              label={form.fields.preferredBranch}
              options={form.branches}
              placeholder={form.placeholders.preferredBranch}
            />
            <SelectField id="service" label={form.fields.service} options={form.services} placeholder={form.placeholders.service} />
            <TextField id="preferredDate" label={form.fields.preferredDate} placeholder={form.placeholders.preferredDate} type="date" />
          </div>
          <SelectField id="preferredTime" label={form.fields.preferredTime} options={form.times} placeholder={form.placeholders.preferredTime} />
          <div>
            <label className="mb-2 block text-[12px] font-extrabold leading-4 text-[#005687]" htmlFor="message">
              {form.fields.message}
            </label>
            <textarea
              aria-describedby="message-count"
              className={`${fieldClass} min-h-[122px] resize-none py-4`}
              id="message"
              maxLength={form.messageLimit}
              name="message"
              onChange={(event) => setMessage(event.target.value)}
              placeholder={form.placeholders.message}
              value={message}
            />
            <p className="mt-2 text-right text-[12px] font-semibold text-[#94a3b8]" id="message-count">
              {message.length}/{form.messageLimit}
            </p>
          </div>
          <Button className="mx-auto mt-1 min-h-[54px] w-full max-w-[650px] rounded-full text-[14px]" icon={<SendIcon />} type="submit">
            {form.submitLabel}
          </Button>
        </form>
      </Card>
    </section>
  );
}

function MapsSection({ maps }: { maps: ContactPageContent['maps'] }) {
  return (
    <section className="bg-[#f1f7fa] pb-[108px]">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {maps.map((map) => (
          <article className="relative overflow-hidden rounded-sm" key={map.imageAlt}>
            <img alt={map.imageAlt} className="h-[360px] w-full object-cover" src={map.imageUrl} />
            <span className="absolute left-1/2 top-[53%] inline-flex -translate-x-1/2 items-center gap-2 rounded-lg bg-white px-5 py-3 text-[13px] font-extrabold text-[#0c2243] shadow-[0_10px_22px_rgba(15,23,42,0.18)]">
              <ContactIcon className="size-[14px] text-[#3695b9]" name="location" />
              {map.label}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

function ContactPageView({ content }: { content: ContactPageContent }) {
  return (
    <SiteLayout actions={content.actions} navigation={content.navigation} services={content.services}>
      <main>
        <ContactHero hero={content.hero} />
        <ContactCards cards={content.contactCards} />
        <ContactForm form={content.form} />
        <MapsSection maps={content.maps} />
      </main>
      <SiteFooter {...content.footer} />
    </SiteLayout>
  );
}

function ContactPageSkeleton() {
  return (
    <SiteLayout actions={{ appointmentLabel: 'Book Appointment', contactLabel: 'Contact Us' }} navigation={skeletonNavigation}>
      <main aria-busy="true" aria-label="Loading contact page" className="bg-[#f1f7fa]">
        <section className="h-[560px] animate-pulse bg-[#d6ecf3]" />
        <section className="mx-auto grid max-w-[1280px] gap-6 px-4 py-[62px] sm:px-6 lg:grid-cols-4 lg:px-8">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="h-[88px] animate-pulse rounded-2xl bg-[#e8f3f7]" key={index} />
          ))}
        </section>
        <section className="mx-auto h-[650px] w-[calc(100%-32px)] max-w-[1280px] animate-pulse rounded-2xl bg-white" />
      </main>
    </SiteLayout>
  );
}

function ContactPageEmpty() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge>No contact content</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#075a82]">Contact page content is unavailable</h1>
        <p className="mt-3 text-[#62798b]">Please check the content source and try again.</p>
      </Card>
    </main>
  );
}

function ContactPageError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">Error</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#075a82]">We could not load the contact page</h1>
        <p className="mt-3 text-[#62798b]">Try again to refresh the contact information.</p>
        <Button className="mt-6" onClick={onRetry} type="button">
          Retry
        </Button>
      </Card>
    </main>
  );
}

function hasContactContent(content: ContactPageContent | undefined): content is ContactPageContent {
  return Boolean(
    content &&
      content.navigation.length > 0 &&
      content.hero.title &&
      content.hero.info.length > 0 &&
      content.contactCards.length > 0 &&
      content.form.services.length > 0 &&
      content.maps.length > 0,
  );
}

export function ContactPage() {
  const { data, isError, isLoading, refetch } = useContactPageQuery();

  if (isLoading) {
    return <ContactPageSkeleton />;
  }

  if (isError) {
    return <ContactPageError onRetry={() => void refetch()} />;
  }

  if (!hasContactContent(data)) {
    return <ContactPageEmpty />;
  }

  return <ContactPageView content={data} />;
}
