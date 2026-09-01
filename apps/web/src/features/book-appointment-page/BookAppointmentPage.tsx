import { useMemo, useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import type { BookAppointmentPageContent } from '@/features/landing-page/types';
import { useBookAppointmentPageQuery } from './use-book-appointment-page';

const skeletonNavigation = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/branches', label: 'Branches' },
];

type IconName = 'calendar' | 'check' | 'clock' | 'doctor' | 'email' | 'hourglass' | 'location' | 'notes' | 'phone' | 'service' | 'user';

function AppointmentIcon({ className = 'size-[18px]', name }: { className?: string; name: IconName }) {
  const icons = {
    calendar: (
      <>
        <rect height="14" rx="2" width="14" x="5" y="6" />
        <path d="M8 4v4M16 4v4M5 10h14" />
      </>
    ),
    check: <path d="m5.5 12.5 3.7 3.7 9.3-9.4" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4.3l3 1.7" />
      </>
    ),
    doctor: (
      <>
        <circle cx="12" cy="7" r="3" />
        <path d="M6.5 20c.45-4 2.55-6 5.5-6s5.05 2 5.5 6" />
        <path d="M12 16.4v3M10.5 17.9h3" />
      </>
    ),
    email: (
      <>
        <path d="M4 7h16v10H4z" />
        <path d="m5 8 7 5 7-5" />
      </>
    ),
    hourglass: (
      <>
        <path d="M7 4h10M7 20h10M8 4c0 4 8 4 8 8s-8 4-8 8M16 4c0 4-8 4-8 8s8 4 8 8" />
      </>
    ),
    location: (
      <>
        <path d="M12 21s7-5.92 7-11.7A6.86 6.86 0 0 0 12 2.4a6.86 6.86 0 0 0-7 6.9C5 15.08 12 21 12 21Z" />
        <circle cx="12" cy="9.3" r="2.2" />
      </>
    ),
    notes: <path d="M4 6h16M4 12h12M4 18h9" />,
    phone: (
      <path d="M7.25 4.25 9.6 3.7l2 4.65-1.9 1.25a9.75 9.75 0 0 0 4.7 4.7l1.25-1.9 4.65 2-.55 2.35a2 2 0 0 1-2.25 1.52C10.8 17.3 6.7 13.2 5.73 6.5a2 2 0 0 1 1.52-2.25Z" />
    ),
    service: <path d="M12 4.5v15M8 7.5c0 3 8 3 8 0M8 16.5c0-3 8-3 8 0" />,
    user: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M6 20c.55-4.2 2.75-6.3 6-6.3s5.45 2.1 6 6.3" />
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
      {icons[name]}
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

const fieldClass =
  'h-[54px] w-full rounded-xl border border-[#d9e4eb] bg-white px-12 text-[14px] font-semibold text-[#25384a] outline-none transition placeholder:text-[#aeb7c2] focus:border-[#3695b9] focus:ring-2 focus:ring-[#d9f0f7]';

function FieldIcon({ name }: { name: IconName }) {
  return (
    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a3adba]">
      <AppointmentIcon className="size-[18px]" name={name} />
    </span>
  );
}

function SelectField({
  icon,
  id,
  label,
  onChange,
  options,
  value,
}: {
  icon: IconName;
  id: string;
  label: string;
  onChange: (value: string) => void;
  options: { name: string; value: string }[];
  value: string;
}) {
  return (
    <div>
      <label className="mb-3 block text-[13px] font-extrabold leading-4 text-[#4e5967]" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <FieldIcon name={icon} />
        <select
          className={`${fieldClass} appearance-none pr-11 text-[#6b7280]`}
          id={id}
          name={id}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.name}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#a3adba]">
          <ChevronIcon direction="right" />
        </span>
      </div>
    </div>
  );
}

function TextField({
  icon,
  id,
  label,
  placeholder,
  type = 'text',
}: {
  icon: IconName;
  id: string;
  label: string;
  placeholder: string;
  type?: 'email' | 'tel' | 'text';
}) {
  return (
    <div>
      <label className="mb-3 block text-[13px] font-extrabold leading-4 text-[#4e5967]" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <FieldIcon name={icon} />
        <input className={fieldClass} id={id} name={id} placeholder={placeholder} type={type} />
      </div>
    </div>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#0076a8] text-[15px] font-extrabold text-white">
        {number}
      </span>
      <h2 className="text-[22px] font-extrabold leading-7 text-[#253244]">{title}</h2>
    </div>
  );
}

function AppointmentHero({ hero }: { hero: BookAppointmentPageContent['hero'] }) {
  return (
    <section className="relative overflow-hidden bg-[#0c7fa9]">
      <img
        alt={hero.backgroundImageAlt}
        className="absolute inset-0 h-full w-full object-cover object-center opacity-20"
        src={hero.backgroundImageUrl}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[#047aa6]/88" />
      <div className="relative mx-auto flex min-h-[300px] w-full max-w-[1240px] items-center px-4 pb-12 pt-12 sm:px-6 lg:px-0">
        <div className="max-w-[600px]">
          <h1 className="text-[42px] font-extrabold leading-[52px] text-white">{hero.title}</h1>
          <p className="mt-5 max-w-[520px] text-[18px] font-medium leading-8 text-white/75">{hero.subtitle}</p>
        </div>
      </div>
    </section>
  );
}

function AppointmentCalendar({
  calendar,
  onSelectDate,
  selectedDate,
}: {
  calendar: BookAppointmentPageContent['calendar'];
  onSelectDate: (date: string) => void;
  selectedDate: string;
}) {
  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <button aria-label="Previous month" className="text-[#a7b1bd] transition hover:text-[#3695b9]" type="button">
          <ChevronIcon direction="left" />
        </button>
        <h3 className="text-[16px] font-extrabold leading-6 text-[#253244]">{calendar.monthLabel}</h3>
        <button aria-label="Next month" className="text-[#a7b1bd] transition hover:text-[#3695b9]" type="button">
          <ChevronIcon direction="right" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-5 text-center">
        {calendar.weekdays.map((day) => (
          <span className="text-[12px] font-extrabold leading-4 text-[#a3adba]" key={day}>
            {day}
          </span>
        ))}
        {calendar.dates.map((date) => {
          const isSelected = date.key === selectedDate;
          return (
            <button
              aria-pressed={isSelected}
              className={`mx-auto grid size-9 place-items-center rounded-full text-[13px] font-extrabold transition ${
                isSelected
                  ? 'bg-[#0076a8] text-white'
                  : date.muted
                    ? 'text-[#d5dce3]'
                    : 'text-[#5f6b7a] hover:bg-[#edf7fb] hover:text-[#0076a8]'
              }`}
              disabled={date.disabled}
              key={date.key}
              onClick={() => onSelectDate(date.key)}
              type="button"
            >
              {date.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AvailableTimes({
  onSelectTime,
  selectedTime,
  times,
}: {
  onSelectTime: (time: string) => void;
  selectedTime: string;
  times: string[];
}) {
  return (
    <div>
      <h3 className="mb-6 text-center text-[16px] font-extrabold leading-6 text-[#253244]">Available Time</h3>
      <div className="space-y-3">
        {times.map((time) => {
          const isSelected = time === selectedTime;
          return (
            <button
              aria-pressed={isSelected}
              className={`h-[50px] w-full rounded-lg border text-[15px] font-extrabold transition ${
                isSelected
                  ? 'border-[#0076a8] bg-[#0076a8] text-white shadow-[0_12px_22px_rgba(0,118,168,0.2)]'
                  : 'border-[#e6edf2] bg-white text-[#727d8b] hover:border-[#bcdce8] hover:text-[#0076a8]'
              }`}
              key={time}
              onClick={() => onSelectTime(time)}
              type="button"
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AppointmentForm({
  content,
  onSelectBranch,
  onSelectDate,
  onSelectDoctor,
  onSelectService,
  onSelectTime,
  selectedBranch,
  selectedDate,
  selectedDoctor,
  selectedService,
  selectedTime,
}: {
  content: BookAppointmentPageContent;
  onSelectBranch: (value: string) => void;
  onSelectDate: (value: string) => void;
  onSelectDoctor: (value: string) => void;
  onSelectService: (value: string) => void;
  onSelectTime: (value: string) => void;
  selectedBranch: string;
  selectedDate: string;
  selectedDoctor: string;
  selectedService: string;
  selectedTime: string;
}) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <Card className="rounded-xl border-[#dfe8ee] px-6 py-10 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:px-10 lg:px-[44px]">
      <form className="space-y-[54px]" onSubmit={handleSubmit}>
        <section>
          <SectionTitle number="1" title="Appointment Details" />
          <div className="mt-9 space-y-7">
            <SelectField
              icon="location"
              id="branch"
              label="Select Branch"
              onChange={onSelectBranch}
              options={content.branches.map((branch) => ({ name: branch.name, value: branch.name }))}
              value={selectedBranch}
            />
            <SelectField
              icon="service"
              id="service"
              label="Select Service"
              onChange={onSelectService}
              options={content.servicesList}
              value={selectedService}
            />
            <SelectField
              icon="doctor"
              id="doctor"
              label="Select Doctor (Optional)"
              onChange={onSelectDoctor}
              options={content.doctors}
              value={selectedDoctor}
            />
          </div>
        </section>

        <section>
          <SectionTitle number="2" title="Choose Date & Time" />
          <div className="mt-9 grid gap-12 lg:grid-cols-[1fr_360px]">
            <AppointmentCalendar calendar={content.calendar} onSelectDate={onSelectDate} selectedDate={selectedDate} />
            <AvailableTimes onSelectTime={onSelectTime} selectedTime={selectedTime} times={content.times} />
          </div>
        </section>

        <section>
          <SectionTitle number="3" title="Your Information" />
          <div className="mt-9 grid gap-7 md:grid-cols-2">
            <TextField icon="user" id="fullName" label={content.form.fields.fullName} placeholder={content.form.placeholders.fullName} />
            <TextField
              icon="phone"
              id="phone"
              label={content.form.fields.phone}
              placeholder={content.form.placeholders.phone}
              type="tel"
            />
            <TextField
              icon="email"
              id="email"
              label={content.form.fields.email}
              placeholder={content.form.placeholders.email}
              type="email"
            />
            <TextField icon="notes" id="notes" label={content.form.fields.notes} placeholder={content.form.placeholders.notes} />
          </div>
        </section>

        <Button className="min-h-[64px] rounded-lg bg-[#0076a8] px-10 text-[17px] shadow-[0_14px_28px_rgba(0,118,168,0.25)]">
          <AppointmentIcon className="size-[18px]" name="calendar" />
          {content.form.submitLabel}
        </Button>
      </form>
    </Card>
  );
}

function SummaryRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[24px_1fr_auto] items-center gap-5">
      <AppointmentIcon className="size-[17px] text-[#0076a8]" name={icon} />
      <span className="text-[15px] font-medium leading-5 text-[#87909d]">{label}</span>
      <span className="text-right text-[15px] font-extrabold leading-5 text-[#253244]">{value}</span>
    </div>
  );
}

function AppointmentSummary({
  branch,
  content,
  selectedDateLabel,
  selectedDoctorName,
  selectedServiceName,
  selectedTime,
}: {
  branch: BookAppointmentPageContent['branches'][number];
  content: BookAppointmentPageContent;
  selectedDateLabel: string;
  selectedDoctorName: string;
  selectedServiceName: string;
  selectedTime: string;
}) {
  return (
    <Card className="sticky top-20 rounded-xl border-[#dfe8ee] px-7 py-8 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
      <h2 className="text-[22px] font-extrabold leading-7 text-[#253244]">{content.summary.title}</h2>
      <div className="mt-7 rounded-xl bg-[#edf7fb] p-4">
        <div className="grid grid-cols-[96px_1fr] gap-5">
          <img alt={branch.imageAlt} className="h-[96px] w-[96px] rounded-lg bg-[#e8e8f0] object-cover" src={branch.imageUrl} />
          <div>
            <h3 className="text-[14px] font-extrabold leading-5 text-[#0076a8]">{branch.name}</h3>
            <p className="mt-1 text-[12px] font-medium leading-5 text-[#7b8794]">{branch.address}</p>
            <a
              className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-extrabold text-[#0076a8] hover:text-[#005687] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3695B9]"
              href={branch.mapUrl}
            >
              <AppointmentIcon className="size-[13px]" name="location" />
              {branch.mapLabel}
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-7">
        <SummaryRow icon="service" label="Service" value={selectedServiceName} />
        <SummaryRow icon="doctor" label="Doctor" value={selectedDoctorName} />
        <SummaryRow icon="calendar" label="Date" value={selectedDateLabel} />
        <SummaryRow icon="clock" label="Time" value={selectedTime} />
        <SummaryRow icon="hourglass" label="Duration" value={content.summary.duration} />
      </div>

      <div className="mt-8 rounded-xl border border-[#d7e7ef] bg-[#f4fbfd] p-6">
        <h3 className="flex items-center gap-2 text-[14px] font-extrabold leading-5 text-[#0076a8]">
          <AppointmentIcon className="size-[16px]" name="doctor" />
          Important Information
        </h3>
        <ul className="mt-5 space-y-5">
          {content.information.map((item) => (
            <li className="flex gap-4 text-[13px] font-medium leading-5 text-[#697583]" key={item}>
              <AppointmentIcon className="mt-0.5 size-[13px] shrink-0 text-[#0076a8]" name="check" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 border-t border-[#edf2f5] pt-8">
        <h3 className="text-[18px] font-extrabold leading-6 text-[#253244]">{content.help.title}</h3>
        <p className="mt-2 text-[13px] font-medium leading-5 text-[#87909d]">{content.help.subtitle}</p>
        <div className="mt-5 space-y-3 text-[14px] font-extrabold leading-5 text-[#0076a8]">
          <a className="flex items-center gap-3 hover:text-[#005687]" href={`tel:${content.help.phone.replaceAll(/[^0-9+]/g, '')}`}>
            <AppointmentIcon className="size-[16px]" name="phone" />
            {content.help.phone}
          </a>
          <a className="flex items-center gap-3 hover:text-[#005687]" href={`mailto:${content.help.email}`}>
            <AppointmentIcon className="size-[16px]" name="email" />
            {content.help.email}
          </a>
        </div>
      </div>
    </Card>
  );
}

function dateLabel(content: BookAppointmentPageContent, selectedDate: string) {
  if (selectedDate === content.calendar.selectedDateKey) {
    return content.calendar.selectedDateLabel;
  }

  const date = new Date(`${selectedDate}T00:00:00`);
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  }).format(date);
}

function BookAppointmentView({ content }: { content: BookAppointmentPageContent }) {
  const [selectedBranch, setSelectedBranch] = useState(content.branches[0]?.name ?? '');
  const [selectedService, setSelectedService] = useState(content.servicesList[0]?.value ?? '');
  const [selectedDoctor, setSelectedDoctor] = useState(content.doctors[0]?.value ?? '');
  const [selectedDate, setSelectedDate] = useState(content.calendar.selectedDateKey);
  const [selectedTime, setSelectedTime] = useState(content.times[2] ?? content.times[0] ?? '');

  const branch = useMemo(
    () => content.branches.find((item) => item.name === selectedBranch) ?? content.branches[0],
    [content.branches, selectedBranch],
  );
  const service = content.servicesList.find((item) => item.value === selectedService);
  const doctor = content.doctors.find((item) => item.value === selectedDoctor);

  if (!branch || !service || !doctor) {
    return <BookAppointmentEmpty />;
  }

  return (
    <SiteLayout actions={content.actions} navigation={content.navigation} services={content.services}>
      <main className="bg-[#f2f7fa]">
        <AppointmentHero hero={content.hero} />
        <section className="relative z-10 mx-auto grid w-full max-w-[1240px] gap-8 px-4 pb-[94px] sm:px-6 lg:-mt-[28px] lg:grid-cols-[1fr_390px] lg:px-0">
          <AppointmentForm
            content={content}
            onSelectBranch={setSelectedBranch}
            onSelectDate={setSelectedDate}
            onSelectDoctor={setSelectedDoctor}
            onSelectService={setSelectedService}
            onSelectTime={setSelectedTime}
            selectedBranch={selectedBranch}
            selectedDate={selectedDate}
            selectedDoctor={selectedDoctor}
            selectedService={selectedService}
            selectedTime={selectedTime}
          />
          <AppointmentSummary
            branch={branch}
            content={content}
            selectedDateLabel={dateLabel(content, selectedDate)}
            selectedDoctorName={doctor.name}
            selectedServiceName={service.name}
            selectedTime={selectedTime}
          />
        </section>
      </main>
      <SiteFooter {...content.footer} />
    </SiteLayout>
  );
}

function BookAppointmentSkeleton() {
  return (
    <SiteLayout actions={{ appointmentLabel: 'Book Appointment', contactLabel: 'Contact Us' }} navigation={skeletonNavigation}>
      <main aria-busy="true" aria-label="Loading appointment page" className="bg-[#f2f7fa]">
        <section className="h-[300px] animate-pulse bg-[#238eb4]" />
        <section className="relative z-10 mx-auto grid max-w-[1240px] gap-8 px-4 pb-[94px] sm:px-6 lg:-mt-[28px] lg:grid-cols-[1fr_390px] lg:px-0">
          <div className="h-[1020px] animate-pulse rounded-xl bg-white" />
          <div className="h-[645px] animate-pulse rounded-xl bg-white" />
        </section>
      </main>
    </SiteLayout>
  );
}

function BookAppointmentEmpty() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge>No appointment content</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#075a82]">Appointment information is unavailable</h1>
        <p className="mt-3 text-[#62798b]">Please check the content source and try again.</p>
      </Card>
    </main>
  );
}

function BookAppointmentError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">Error</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#075a82]">We could not load booking</h1>
        <p className="mt-3 text-[#62798b]">Try again to refresh the appointment form.</p>
        <Button className="mt-6" onClick={onRetry} type="button">
          Retry
        </Button>
      </Card>
    </main>
  );
}

function hasBookAppointmentContent(content: BookAppointmentPageContent | undefined): content is BookAppointmentPageContent {
  return Boolean(
    content &&
      content.navigation.length > 0 &&
      content.branches.length > 0 &&
      content.servicesList.length > 0 &&
      content.doctors.length > 0 &&
      content.times.length > 0,
  );
}

export function BookAppointmentPage() {
  const { data, isError, isLoading, refetch } = useBookAppointmentPageQuery();

  if (isLoading) {
    return <BookAppointmentSkeleton />;
  }

  if (isError) {
    return <BookAppointmentError onRetry={() => void refetch()} />;
  }

  if (!hasBookAppointmentContent(data)) {
    return <BookAppointmentEmpty />;
  }

  return <BookAppointmentView content={data} />;
}
