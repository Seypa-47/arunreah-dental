import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import { CmsImage, ResilientImage } from '@/components/layout/public-ui';
import type { BookAppointmentPageContent } from '@/features/landing-page/types';
import { useBookAppointmentPageQuery } from './use-book-appointment-page';
import { ApiClientError } from '@/lib/api';
import { env } from '@/config/env';
import { createPublicAppointment } from '@/services/public-content';
import { TurnstileWidget } from './turnstile-widget';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { publicUiCopy } from '@/features/public-content/public-ui-copy';
import { formatFullDate, formatMonthYear, formatWeekdayShort } from '@/features/public-content/public-dates';
import { publicShell } from '@/features/public-content/public-page-chrome';

type IconName = 'calendar' | 'check' | 'clock' | 'doctor' | 'email' | 'hourglass' | 'location' | 'notes' | 'phone' | 'service' | 'user';

function createIdempotencyKey() {
  if (typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function validatePatientName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter your full name.';
  if (trimmed.length < 2) return 'Full name must be at least 2 characters.';
  if (trimmed.length > 160) return 'Full name is too long.';
  return undefined;
}

function validatePhone(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter your phone number.';
  if (!/^[0-9+()\- ]+$/.test(trimmed)) return 'Use only digits, spaces, +, -, and parentheses.';
  if (trimmed.replace(/\D/g, '').length < 8) return 'Enter a valid phone number.';
  if (trimmed.length > 32) return 'Phone number is too long.';
  return undefined;
}

function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter your email address.';
  if (trimmed.length > 320) return 'Email address is too long.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address.';
  return undefined;
}

type AppointmentFieldErrors = { email?: string; fullName?: string; phone?: string };

/** Mirrors the admin form's focusFirstInvalid pattern: wait for the aria-invalid paint, then focus it. */
function focusFirstInvalidField(formEl: HTMLFormElement | null) {
  window.requestAnimationFrame(() => {
    formEl?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  });
}

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
  'h-12 w-full rounded-lg border border-[#d9e4eb] bg-white px-11 text-[16px] font-medium text-[#005687] outline-none transition placeholder:text-[#94a3b8] focus:border-[#3695b9] focus:ring-2 focus:ring-[#d9f0f7] sm:h-11 sm:text-[14px]';

function FieldIcon({ name }: { name: IconName }) {
  return (
    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]">
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
      <label className="mb-2 block text-[13px] font-bold leading-4 text-[#005687]" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <FieldIcon name={icon} />
        <select
          className={`${fieldClass} appearance-none pr-11 text-[#005687]`}
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
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]">
          <ChevronIcon direction="right" />
        </span>
      </div>
    </div>
  );
}

function TextField({
  error,
  icon,
  id,
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
}: {
  error?: string;
  icon: IconName;
  id: string;
  label: string;
  placeholder: string;
  type?: 'email' | 'tel' | 'text';
  value: string;
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label className="mb-2 block text-[13px] font-bold leading-4 text-[#005687]" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <FieldIcon name={icon} />
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className={`${fieldClass} ${error ? 'border-[#e6a4a4] focus:border-[#b91c1c] focus:ring-[#fbe4e4]' : ''}`}
          id={id}
          name={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-[12px] font-semibold text-[#b91c1c]" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#3695b9] text-[13px] font-bold text-white">
        {number}
      </span>
      <h2 className="text-[20px] font-extrabold leading-7 tracking-[-0.02em] text-[#005687] sm:text-[22px]">{title}</h2>
    </div>
  );
}

function AppointmentHero({ hero }: { hero: BookAppointmentPageContent['hero'] }) {
  const bookingCopy = publicUiCopy(usePublicLanguage().language).booking;
  const imageUrl = hero.backgroundImageUrl || '/assets/landing/figma-branches/image5_183_4173.jpg';
  const eyebrow = hero.eyebrow ?? bookingCopy.heroEyebrow;
  return (
    <section className="border-b border-[#e7eff3] bg-[#f7fafc] py-5 sm:py-7">
      <div className="relative mx-auto w-full max-w-[1280px] overflow-hidden rounded-2xl border border-[#d9e9ee] bg-[#f7fafc] px-4 sm:px-6 lg:px-8">
      <ResilientImage
        alt={hero.backgroundImageAlt}
        className="absolute inset-0 h-full w-full object-cover object-center"
        fallbackSrc="/assets/landing/figma-branches/image5_183_4173.jpg"
        presentation={hero.imagePresentation}
        src={imageUrl}
      />
      <div className="relative z-10 flex items-center py-8 sm:min-h-[250px] sm:py-10">
        <div className="max-w-[600px]">
          {eyebrow ? <p className="text-[11px] font-bold uppercase tracking-[3px] text-[#3695B9] sm:text-[12px] sm:tracking-[3.6px]">{eyebrow}</p> : null}
          <h1 className="mt-2 text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-[#005687] sm:text-[38px]">{hero.title}</h1>
          <p className="mt-3 max-w-[560px] text-[16px] font-medium leading-7 text-[#0e3b5e]">{hero.subtitle}</p>
        </div>
      </div>
      </div>
    </section>
  );
}

export const DEFAULT_HOURS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
export const MINUTE_OPTIONS = ['00', '15', '30', '45'];

export function formatDisplayTime(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  const hours = Number(parts[0]);
  const minutes = parts[1] ?? '00';
  if (Number.isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${String(displayHours).padStart(2, '0')}:${minutes} ${ampm}`;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function AppointmentCalendar({
  calendar,
  onSelectDate,
  selectedDate,
}: {
  calendar?: BookAppointmentPageContent['calendar'];
  onSelectDate: (date: string) => void;
  selectedDate: string;
}) {
  const { language } = usePublicLanguage();

  const [viewDate, setViewDate] = useState(() => {
    const initialKey = selectedDate || calendar?.selectedDateKey;
    if (initialKey) {
      const parts = initialKey.split('-').map(Number);
      if (parts[0] && parts[1]) {
        return new Date(parts[0], parts[1] - 1, 1);
      }
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const today = new Date();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxMonthStart = new Date(today.getFullYear() + 1, today.getMonth(), 1);

  const canGoPrev = viewDate > currentMonthStart;
  const canGoNext = viewDate < maxMonthStart;

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    if (!canGoNext) return;
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const monthLabel = useMemo(() => {
    return formatMonthYear(viewDate, language);
  }, [language, viewDate]);

  const weekdays = useMemo(() => {
    const formatter = { format: (value: Date) => formatWeekdayShort(value, language) };
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2026, 8, 20 + i);
      return formatter.format(d);
    });
  }, [language]);

  const calendarDates = useMemo(() => {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthStart = new Date(year, month, 1);
    const startDay = monthStart.getDay();
    const gridStart = new Date(year, month, 1 - startDay);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);
      const key = toDateKey(date);
      const isPast = date < todayMidnight;
      const isCurrentMonth = date.getMonth() === month;
      return {
        date,
        day: date.getDate(),
        disabled: isPast,
        key,
        muted: !isCurrentMonth,
      };
    });
  }, [viewDate]);

  const dateFormatter = { format: (value: Date) => formatFullDate(value, language) };

  const handleSelectDate = (item: (typeof calendarDates)[number]) => {
    if (item.disabled) return;
    onSelectDate(item.key);
    if (item.muted) {
      setViewDate(new Date(item.date.getFullYear(), item.date.getMonth(), 1));
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <button
          aria-label={canGoPrev ? 'Previous month' : 'Previous month unavailable'}
          className={`grid size-11 place-items-center rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3695b9] ${
            canGoPrev
              ? 'text-[#005687] hover:bg-[#edf7fb] hover:text-[#3695b9]'
              : 'cursor-not-allowed text-[#cbd5e1] opacity-40'
          }`}
          disabled={!canGoPrev}
          onClick={handlePrevMonth}
          type="button"
        >
          <ChevronIcon direction="left" />
        </button>
        <h3 className="text-[15px] font-extrabold leading-6 text-[#005687]">{monthLabel}</h3>
        <button
          aria-label={canGoNext ? 'Next month' : 'Next month unavailable'}
          className={`grid size-11 place-items-center rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3695b9] ${
            canGoNext
              ? 'text-[#005687] hover:bg-[#edf7fb] hover:text-[#3695b9]'
              : 'cursor-not-allowed text-[#cbd5e1] opacity-40'
          }`}
          disabled={!canGoNext}
          onClick={handleNextMonth}
          type="button"
        >
          <ChevronIcon direction="right" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center sm:gap-y-3">
        {weekdays.map((day) => (
          <span className="text-[12px] font-bold leading-4 text-[#6b7280]" key={day}>
            {day}
          </span>
        ))}
        {calendarDates.map((item) => {
          const isSelected = item.key === selectedDate;
          return (
            <button
              aria-label={dateFormatter.format(new Date(`${item.key}T12:00:00`))}
              aria-pressed={isSelected}
              className={`mx-auto grid aspect-square w-full max-w-10 place-items-center rounded-full text-[13px] font-bold transition sm:max-w-8 ${
                isSelected
                  ? 'bg-[#3695b9] text-white shadow-sm'
                  : item.muted
                    ? 'text-[#d5dce3] hover:text-[#94a3b8]'
                    : item.disabled
                      ? 'cursor-not-allowed text-[#cbd5e1] opacity-40'
                      : 'text-[#6b7280] hover:bg-[#edf7fb] hover:text-[#3695b9]'
              }`}
              disabled={item.disabled}
              key={item.key}
              onClick={() => handleSelectDate(item)}
              type="button"
            >
              {item.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AvailableTimes({
  onSelectTime,
  selectedTime,
  times,
}: {
  onSelectTime: (time: string) => void;
  selectedTime: string;
  times: string[];
}) {
  const bookingCopy = publicUiCopy(usePublicLanguage().language).booking;
  const baseTimes = times && times.length > 0 ? times : DEFAULT_HOURS;
  const baseHours = Array.from(new Set(baseTimes.map((t) => t.split(':')[0] ?? t)));

  const selectedParts = selectedTime ? selectedTime.split(':') : [];
  const selectedHour = selectedParts[0] ?? baseHours[0] ?? '08';
  const selectedMinute = selectedParts[1] ?? '00';

  return (
    <div>
      <h3 className="mb-5 text-center text-[15px] font-extrabold leading-6 text-[#005687]">{bookingCopy.availableTime}</h3>
      <div className="space-y-2.5">
        {baseHours.map((hour) => {
          const isHourActive = selectedHour === hour;
          const formattedHourLabel = formatDisplayTime(`${hour}:00`);

          return (
            <div key={hour} className="space-y-2">
              <button
                aria-label={`Select ${formattedHourLabel}`}
                aria-pressed={isHourActive}
                className={`min-h-12 w-full rounded-lg border text-[14px] font-bold transition sm:min-h-[42px] sm:text-[13px] ${
                  isHourActive
                    ? 'border-[#3695b9] bg-[#3695b9] text-white shadow-none'
                    : 'border-[#edf2f7] bg-white text-[#6b7280] hover:border-[#bcdce8] hover:text-[#3695b9]'
                }`}
                onClick={() => {
                  onSelectTime(`${hour}:${selectedMinute || '00'}`);
                }}
                type="button"
              >
                {isHourActive ? formatDisplayTime(selectedTime) : formattedHourLabel}
              </button>

              {isHourActive ? (
                <div className="rounded-xl border border-[#bce0ed] bg-[#f2f9fb] p-3 shadow-inner">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[#005687]">{bookingCopy.selectMinute}</span>
                    <span className="rounded-full bg-[#3695b9]/10 px-2 py-0.5 text-[11px] font-extrabold text-[#087b9f]">
                      {formatDisplayTime(selectedTime)}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {MINUTE_OPTIONS.map((minute) => {
                      const slotTime = `${hour}:${minute}`;
                      const isSlotSelected = selectedTime === slotTime;
                      return (
                        <button
                          key={minute}
                          type="button"
                          aria-label={formatDisplayTime(slotTime)}
                          aria-pressed={isSlotSelected}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTime(slotTime);
                          }}
                          className={`h-9 rounded-lg text-[13px] font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3695b9] ${
                            isSlotSelected
                              ? 'bg-[#3695b9] text-white shadow-sm ring-2 ring-[#3695b9]/30'
                              : 'border border-[#d2e4ec] bg-white text-[#005687] hover:border-[#3695b9] hover:bg-[#eaf4f8] hover:text-[#3695b9]'
                          }`}
                        >
                          :{minute}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
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
  onSubmit,
  onTurnstileToken,
  isSubmitting,
  submissionError,
  turnstileResetSignal,
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
  onSubmit: (values: { patientName: string; phone: string; email: string; notes: string }) => void;
  onTurnstileToken: (token: string | null) => void;
  isSubmitting: boolean;
  submissionError: string | null;
  turnstileResetSignal: number;
}) {
  const bookingCopy = publicUiCopy(usePublicLanguage().language).booking;
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<AppointmentFieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  const handlePatientNameChange = (value: string) => {
    setPatientName(value);
    setFieldErrors((previous) => (previous.fullName ? { ...previous, fullName: undefined } : previous));
  };
  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setFieldErrors((previous) => (previous.phone ? { ...previous, phone: undefined } : previous));
  };
  const handleEmailChange = (value: string) => {
    setEmail(value);
    setFieldErrors((previous) => (previous.email ? { ...previous, email: undefined } : previous));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextFieldErrors: AppointmentFieldErrors = {
      email: validateEmail(email),
      fullName: validatePatientName(patientName),
      phone: validatePhone(phone),
    };

    if (nextFieldErrors.email || nextFieldErrors.fullName || nextFieldErrors.phone) {
      setFieldErrors(nextFieldErrors);
      focusFirstInvalidField(formRef.current);
      return;
    }

    setFieldErrors({});
    onSubmit({ patientName, phone, email, notes });
  };

  return (
    <Card className="rounded-xl border-[#e1ebef] p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] sm:p-7">
      <form className="space-y-7 sm:space-y-8" noValidate onSubmit={handleSubmit} ref={formRef}>
        <section>
          <SectionTitle number="1" title={bookingCopy.appointmentDetails} />
          <div className="mt-5 space-y-4">
            <SelectField
              icon="location"
              id="branch"
              label={bookingCopy.selectBranch}
              onChange={onSelectBranch}
              options={content.branches.map((branch) => ({ name: branch.name, value: branch.id ?? '' }))}
              value={selectedBranch}
            />
            <SelectField
              icon="service"
              id="service"
              label={bookingCopy.selectService}
              onChange={onSelectService}
              options={content.servicesList}
              value={selectedService}
            />
            <SelectField
              icon="doctor"
              id="doctor"
              label={bookingCopy.selectDoctor}
              onChange={onSelectDoctor}
              options={content.doctors}
              value={selectedDoctor}
            />
          </div>
        </section>

        <section className="border-t border-[#e7eff3] pt-7 sm:pt-8">
          <SectionTitle number="2" title={bookingCopy.chooseDateTime} />
          <div className="mt-5 grid gap-7 lg:grid-cols-[1fr_300px]">
            <AppointmentCalendar calendar={content.calendar} onSelectDate={onSelectDate} selectedDate={selectedDate} />
            <AvailableTimes onSelectTime={onSelectTime} selectedTime={selectedTime} times={content.times} />
          </div>
        </section>

        <section className="border-t border-[#e7eff3] pt-7 sm:pt-8">
          <SectionTitle number="3" title={bookingCopy.yourInformation} />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TextField error={fieldErrors.fullName} icon="user" id="fullName" label={content.form.fields.fullName} onChange={handlePatientNameChange} placeholder={content.form.placeholders.fullName} value={patientName} />
            <TextField
              error={fieldErrors.phone}
              icon="phone"
              id="phone"
              label={content.form.fields.phone}
              placeholder={content.form.placeholders.phone}
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
            />
            <TextField
              error={fieldErrors.email}
              icon="email"
              id="email"
              label={content.form.fields.email}
              placeholder={content.form.placeholders.email}
              type="email"
              value={email}
              onChange={handleEmailChange}
            />
            <TextField icon="notes" id="notes" label={content.form.fields.notes} onChange={setNotes} placeholder={content.form.placeholders.notes} value={notes} />
          </div>
        </section>

        <TurnstileWidget onToken={onTurnstileToken} resetSignal={turnstileResetSignal} />
        {submissionError ? <p className="text-sm font-medium text-[#9d4d18]" role="alert">{submissionError}</p> : null}
        <Button className="min-h-12 w-full rounded-full px-7 text-[14px] font-bold shadow-none sm:min-h-11 sm:w-auto" disabled={isSubmitting} type="submit">
          <AppointmentIcon className="size-[16px]" name="calendar" />
          {isSubmitting ? 'Sending request…' : content.form.submitLabel}
        </Button>
      </form>
    </Card>
  );
}

function SummaryRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3 sm:gap-4">
      <AppointmentIcon className="size-[15px] text-[#3695b9]" name={icon} />
      <span className="text-[13px] font-medium leading-5 text-[#64748b]">{label}</span>
      <span className="ui-copy-safe text-right text-[13px] font-bold leading-5 text-[#005687]">{value}</span>
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
  const bookingCopy = publicUiCopy(usePublicLanguage().language).booking;
  const hasBranchImage = Boolean(branch.imageUrl);

  return (
    <Card className="sticky top-20 rounded-xl border-[#e1ebef] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] sm:p-6">
      <h2 className="text-[18px] font-extrabold leading-6 text-[#005687] sm:text-[20px]">{content.summary.title}</h2>
      <div className="mt-5 rounded-xl bg-[#f2f9fb] p-3.5">
        <div className={`grid gap-4 ${hasBranchImage ? 'grid-cols-[80px_1fr]' : 'grid-cols-1'}`}>
          {hasBranchImage ? <CmsImage alt={branch.imageAlt || branch.name} className="h-[80px] w-[80px] rounded-lg bg-[#e8e8f0] object-cover" presentation={branch.imagePresentation} src={branch.imageUrl} /> : null}
          <div>
            <h3 className="text-[13px] font-bold leading-5 text-[#005687]">{branch.name}</h3>
            <p className="mt-1 text-[12px] font-normal leading-4 text-[#64748b]">{branch.address}</p>
            <a
              className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#3695b9] hover:text-[#005687] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3695B9]"
              href={branch.mapUrl}
            >
              <AppointmentIcon className="size-[13px]" name="location" />
              {branch.mapLabel}
            </a>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <SummaryRow icon="service" label={bookingCopy.service} value={selectedServiceName} />
        <SummaryRow icon="doctor" label={bookingCopy.doctor} value={selectedDoctorName} />
        <SummaryRow icon="calendar" label={bookingCopy.date} value={selectedDateLabel} />
        <SummaryRow icon="clock" label={bookingCopy.time} value={formatDisplayTime(selectedTime)} />
        {content.summary.duration ? <SummaryRow icon="hourglass" label={bookingCopy.duration} value={content.summary.duration} /> : null}
      </div>

      {content.information.length > 0 ? <div className="mt-5 rounded-xl border border-[#d7e7ef] bg-[#f4fbfd] p-4">
        <h3 className="flex items-center gap-2 text-[13px] font-bold leading-5 text-[#3695b9]">
          <AppointmentIcon className="size-[15px]" name="doctor" />
          Important Information
        </h3>
        <ul className="mt-3.5 space-y-3">
          {content.information.map((item) => (
            <li className="flex gap-3 text-[12px] font-medium leading-5 text-[#64748b]" key={item}>
              <AppointmentIcon className="mt-0.5 size-[13px] shrink-0 text-[#3695b9]" name="check" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div> : null}

      <div className="mt-5 border-t border-[#edf2f5] pt-5">
        <h3 className="text-[16px] font-bold leading-5 text-[#005687]">{content.help.title}</h3>
        <p className="mt-1 text-[12px] font-medium leading-5 text-[#64748b]">{content.help.subtitle}</p>
        <div className="mt-4 space-y-2.5 text-[13px] font-bold leading-5 text-[#3695b9]">
          {content.help.phone ? <a className="flex items-center gap-2.5 hover:text-[#005687]" href={`tel:${content.help.phone.replaceAll(/[^0-9+]/g, '')}`}>
            <AppointmentIcon className="size-[15px]" name="phone" />
            {content.help.phone}
          </a> : null}
          {content.help.email ? <a className="flex items-center gap-2.5 hover:text-[#005687]" href={`mailto:${content.help.email}`}>
            <AppointmentIcon className="size-[15px]" name="email" />
            {content.help.email}
          </a> : null}
        </div>
      </div>
    </Card>
  );
}

export function dateLabel(selectedDate: string, language: 'en' | 'km') {
  const date = new Date(`${selectedDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return selectedDate;
  }
  return formatFullDate(date, language);
}

export function AppointmentSuccessModal({
  acknowledgement,
  details,
  language,
  onClose,
}: {
  acknowledgement: { message: string; reference: string; status: string };
  details: {
    branchName: string;
    dateLabel: string;
    doctorName: string;
    patientName: string;
    phone: string;
    serviceName: string;
    time: string;
  };
  language: 'en' | 'km';
  onClose: () => void;
}) {
  const isKhmer = language === 'km';
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(acknowledgement.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      aria-labelledby="appointment-success-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div
        className="relative my-8 w-full max-w-[540px] overflow-hidden rounded-3xl border border-[#d6e7ee] bg-white p-6 shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          aria-label={isKhmer ? 'បិទ' : 'Close'}
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-[#3695B9]"
          onClick={onClose}
          type="button"
        >
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-[#a7f3d0] bg-[#ecfdf5] text-[#059669] shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <svg className="size-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="mt-4 text-center">
          <h2 className="text-[22px] font-extrabold leading-tight text-[#073f60] sm:text-[26px]" id="appointment-success-title">
            {isKhmer ? 'បានទទួលសំណើសុំការណាត់ជួប' : 'Appointment Request Received'}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#597184] sm:text-[15px]">
            {isKhmer
              ? 'សូមអរគុណសម្រាប់ការជ្រើសរើស គ្លីនិកធ្មេញ អរុណរះ។ ក្រុមការងារយើងខ្ញុំនឹងទាក់ទងទៅលោកអ្នកក្នុងពេលឆាប់ៗដើម្បីបញ្ជាក់ការណាត់ជួប។'
              : 'Thank you for choosing Arunreah Dental Clinic. Our receptionist will contact you shortly to confirm your booking.'}
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-[#bce0ec] bg-[#f4fafd] p-4 text-center sm:p-5">
          <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#2c84a5]">
            {isKhmer ? 'លេខកូដសម្គាល់ការណាត់ជួប' : 'Booking Reference Code'}
          </p>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="font-mono text-[22px] font-extrabold tracking-wider text-[#005687] sm:text-[26px]">
              {acknowledgement.reference}
            </span>
            <button
              className="inline-flex items-center gap-1 rounded-lg border border-[#9fd1e3] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#167ea7] transition hover:bg-[#edf7fb]"
              onClick={handleCopy}
              type="button"
            >
              {copied ? (isKhmer ? 'បានចម្លង!' : 'Copied!') : (isKhmer ? 'ចម្លង' : 'Copy')}
            </button>
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fed7aa] bg-[#fffbeb] px-3 py-0.5 text-[11px] font-bold text-[#b45309]">
              <span className="size-1.5 rounded-full bg-[#f59e0b]" />
              {isKhmer ? 'ស្ថានភាព៖ រង់ចាំការបញ្ជាក់' : 'Status: Pending Confirmation'}
            </span>
          </div>
        </div>

        <div className="mt-5 divide-y divide-[#edf3f6] rounded-xl border border-[#e2edf2] bg-[#fafcfd] text-[13px] sm:text-[14px]">
          <div className="flex justify-between px-4 py-2.5">
            <span className="font-medium text-[#64748b]">{isKhmer ? 'សាខា' : 'Branch'}</span>
            <span className="text-right font-bold text-[#073f60]">{details.branchName}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="font-medium text-[#64748b]">{isKhmer ? 'សេវាកម្ម' : 'Service'}</span>
            <span className="text-right font-bold text-[#073f60]">{details.serviceName}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="font-medium text-[#64748b]">{isKhmer ? 'ទន្តបណ្ឌិត' : 'Doctor'}</span>
            <span className="text-right font-bold text-[#073f60]">{details.doctorName}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="font-medium text-[#64748b]">{isKhmer ? 'កាលបរិច្ឆេទ & ម៉ោង' : 'Date & Time'}</span>
            <span className="text-right font-bold text-[#073f60]">{details.dateLabel} — {details.time}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="font-medium text-[#64748b]">{isKhmer ? 'អ្នកជំងឺ' : 'Patient'}</span>
            <span className="text-right font-bold text-[#073f60]">{details.patientName} ({details.phone})</span>
          </div>
        </div>

        <p className="mt-4 text-center text-[12px] leading-relaxed text-[#768c9c]">
          {isKhmer
            ? 'ចំណាំ៖ ការស្នើសុំការណាត់ជួបមិនមែនជាការបញ្ជាក់ដោយស្វ័យប្រវត្តិនោះទេ។ គ្លីនិកនឹងទាក់ទងមកអ្នកដើម្បីបញ្ជាក់ពេលវេលាច្បាស់លាស់។'
            : 'Notice: Appointments are requests subject to confirmation by our front desk team.'}
        </p>

        <div className="mt-6">
          <Button
            className="min-h-12 w-full rounded-xl bg-[#3695B9] text-[15px] font-bold text-white shadow-sm hover:bg-[#2c84a5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3695B9]"
            onClick={onClose}
          >
            {isKhmer ? 'រួចរាល់' : 'Done'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function BookAppointmentView({ content }: { content: BookAppointmentPageContent }) {
  const { language } = usePublicLanguage();
  const [searchParams] = useSearchParams();
  const requestedBranch = searchParams.get('branch');
  const requestedDoctor = searchParams.get('doctor');
  const requestedService = searchParams.get('service');

  const initialBranch = useMemo<string>(() => {
    if (requestedBranch) {
      const match = content.branches.find(
        (b) => b.id === requestedBranch || b.name.toLowerCase() === requestedBranch.toLowerCase(),
      );
      if (match?.id) return match.id;
    }
    return content.branches[0]?.id ?? '';
  }, [content.branches, requestedBranch]);

  const initialService = useMemo<string>(() => {
    if (requestedService) {
      const match = content.servicesList.find(
        (s) => s.value === requestedService || s.name.toLowerCase() === requestedService.toLowerCase(),
      );
      if (match?.value) return match.value;
    }
    return content.servicesList[0]?.value ?? '';
  }, [content.servicesList, requestedService]);

  const initialDoctor = useMemo<string>(() => {
    if (requestedDoctor) {
      const match = content.doctors.find(
        (d) => d.value === requestedDoctor || d.name.toLowerCase() === requestedDoctor.toLowerCase(),
      );
      if (match?.value) return match.value;
    }
    return content.doctors[0]?.value ?? '';
  }, [content.doctors, requestedDoctor]);

  const [selectedBranch, setSelectedBranch] = useState<string>(initialBranch);
  const [selectedService, setSelectedService] = useState<string>(initialService);
  const [selectedDoctor, setSelectedDoctor] = useState<string>(initialDoctor);

  useEffect(() => {
    if (requestedBranch) {
      const match = content.branches.find(
        (b) => b.id === requestedBranch || b.name.toLowerCase() === requestedBranch.toLowerCase(),
      );
      if (match?.id) setSelectedBranch(match.id);
    }
  }, [content.branches, requestedBranch]);

  useEffect(() => {
    if (requestedService) {
      const match = content.servicesList.find(
        (s) => s.value === requestedService || s.name.toLowerCase() === requestedService.toLowerCase(),
      );
      if (match?.value) setSelectedService(match.value);
    }
  }, [content.servicesList, requestedService]);

  useEffect(() => {
    if (requestedDoctor) {
      const match = content.doctors.find(
        (d) => d.value === requestedDoctor || d.name.toLowerCase() === requestedDoctor.toLowerCase(),
      );
      if (match?.value) setSelectedDoctor(match.value);
    }
  }, [content.doctors, requestedDoctor]);

  const [selectedDate, setSelectedDate] = useState(content.calendar.selectedDateKey);
  const [selectedTime, setSelectedTime] = useState(content.times[2] ?? content.times[0] ?? '10:00');
  const [formKey, setFormKey] = useState(0);
  const idempotencyKey = useRef(createIdempotencyKey());
  const [acknowledgement, setAcknowledgement] = useState<{ message: string; reference: string; status: string } | null>(null);
  const [submittedDetails, setSubmittedDetails] = useState<{
    branchName: string;
    dateLabel: string;
    doctorName: string;
    patientName: string;
    phone: string;
    serviceName: string;
    time: string;
  } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const submitMutation = useMutation({ mutationFn: (input: Parameters<typeof createPublicAppointment>[0]) => createPublicAppointment(input) });
  const handleTurnstileToken = useCallback((token: string | null) => {
    setTurnstileToken(token);
    if (token) setTurnstileError(null);
  }, []);

  const branch = useMemo(
    () => content.branches.find((item) => item.id === selectedBranch) ?? content.branches[0],
    [content.branches, selectedBranch],
  );
  const service = content.servicesList.find((item) => item.value === selectedService);
  const doctor = content.doctors.find((item) => item.value === selectedDoctor);

  if (!branch || !service || !doctor) {
    return <BookAppointmentEmpty />;
  }

  const submit = (values: { email: string; notes: string; patientName: string; phone: string }) => {
    if (env.turnstileSiteKey && !turnstileToken) {
      setTurnstileError('Please complete the verification challenge before sending your request.');
      return;
    }
    setTurnstileError(null);
    void submitMutation.mutateAsync({
      ...values,
      branchId: selectedBranch,
      doctorId: selectedDoctor || null,
      idempotencyKey: idempotencyKey.current,
      notes: values.notes.trim() || null,
      preferredDate: selectedDate,
      preferredTime: selectedTime,
      serviceId: selectedService,
      turnstileToken: turnstileToken ?? undefined,
    }).then((response) => {
      setSubmittedDetails({
        branchName: branch.name,
        dateLabel: dateLabel(selectedDate, language),
        doctorName: doctor.name,
        patientName: values.patientName,
        phone: values.phone,
        serviceName: service.name,
        time: formatDisplayTime(selectedTime),
      });
      setAcknowledgement(response);
      idempotencyKey.current = createIdempotencyKey();
    }).catch(() => undefined).finally(() => setTurnstileResetSignal((value) => value + 1));
  };

  const handleCloseModal = () => {
    setAcknowledgement(null);
    setSubmittedDetails(null);
    setFormKey((previous) => previous + 1);
  };

  const requestError = submitMutation.error instanceof ApiClientError
    ? submitMutation.error.status === 429
      ? 'Too many requests. Please wait a moment and try again.'
      : submitMutation.error.message
    : null;
  const submissionError = turnstileError ?? requestError;

  return (
    <SiteLayout actions={content.actions} navigation={content.navigation} services={content.services}>
      <main className="bg-white">
        <AppointmentHero hero={content.hero} />
        <section className="mx-auto grid w-full max-w-[1180px] gap-6 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 lg:px-8">
          <AppointmentForm
            content={content}
            isSubmitting={submitMutation.isPending}
            key={formKey}
            onSelectBranch={setSelectedBranch}
            onSelectDate={setSelectedDate}
            onSelectDoctor={setSelectedDoctor}
            onSelectService={setSelectedService}
            onSelectTime={setSelectedTime}
            onSubmit={submit}
            onTurnstileToken={handleTurnstileToken}
            selectedBranch={selectedBranch}
            selectedDate={selectedDate}
            selectedDoctor={selectedDoctor}
            selectedService={selectedService}
            selectedTime={selectedTime}
            submissionError={submissionError}
            turnstileResetSignal={turnstileResetSignal}
          />
          <AppointmentSummary
            branch={branch}
            content={content}
            selectedDateLabel={dateLabel(selectedDate, language)}
            selectedDoctorName={doctor.name}
            selectedServiceName={service.name}
            selectedTime={selectedTime}
          />
        </section>
        {acknowledgement && submittedDetails ? (
          <AppointmentSuccessModal
            acknowledgement={acknowledgement}
            details={submittedDetails}
            language={language}
            onClose={handleCloseModal}
          />
        ) : null}
      </main>
      <SiteFooter {...content.footer} />
    </SiteLayout>
  );
}

function BookAppointmentSkeleton() {
  const { language } = usePublicLanguage();
  const shell = publicShell(language);
  const copy = publicUiCopy(language).booking;
  return (
    <SiteLayout actions={shell.actions} navigation={shell.navigation}>
      <main aria-busy="true" aria-label={copy.loading} className="bg-white">
        <span className="sr-only">{copy.loading}</span>

        <section aria-hidden="true" className="border-b border-[#e7eff3] bg-[#f7fafc] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto flex min-h-[180px] max-w-[1280px] items-center sm:min-h-[200px]">
            <div className="w-full max-w-[600px] animate-pulse">
              <div className="h-3 w-32 rounded-full bg-[#dcebf0]" />
              <div className="mt-3 h-10 w-[82%] rounded-lg bg-[#d1e6ee] sm:h-11" />
              <div className="mt-4 h-4 w-full max-w-[520px] rounded-full bg-[#e5f0f4]" />
              <div className="mt-2 h-4 w-[70%] rounded-full bg-[#e5f0f4]" />
            </div>
          </div>
        </section>

        <section aria-hidden="true" className="mx-auto grid w-full max-w-[1180px] gap-6 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 lg:px-8">
          <div className="rounded-xl border border-[#e1ebef] bg-white p-5 sm:p-7">
            <div className="flex items-center gap-3.5">
              <div className="size-8 animate-pulse rounded-full bg-[#d3e9f0]" />
              <div className="h-6 w-48 animate-pulse rounded-lg bg-[#d5e7ed]" />
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <div className="space-y-2" key={index}>
                  <div className="h-3 w-24 animate-pulse rounded-full bg-[#dcebf0]" />
                  <div className="h-11 w-full animate-pulse rounded-lg border border-[#e3edf1] bg-[#f9fbfc]" />
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-[#e8f0f3] pt-7">
              <div className="flex items-center gap-3.5">
                <div className="size-8 animate-pulse rounded-full bg-[#d3e9f0]" />
                <div className="h-6 w-52 animate-pulse rounded-lg bg-[#d5e7ed]" />
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <div className="space-y-2" key={index}>
                    <div className="h-3 w-28 animate-pulse rounded-full bg-[#dcebf0]" />
                    <div className="h-11 w-full animate-pulse rounded-lg border border-[#e3edf1] bg-[#f9fbfc]" />
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2">
                <div className="h-3 w-24 animate-pulse rounded-full bg-[#dcebf0]" />
                <div className="h-24 w-full animate-pulse rounded-lg border border-[#e3edf1] bg-[#f9fbfc]" />
              </div>
              <div className="mt-6 h-11 w-full animate-pulse rounded-lg bg-[#cce7ef] sm:w-52" />
            </div>
          </div>

          <aside className="h-fit rounded-xl border border-[#e1ebef] bg-[#f7fafc] p-5 sm:p-6 lg:sticky lg:top-6">
            <div className="h-6 w-40 animate-pulse rounded-lg bg-[#d5e7ed]" />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div className="flex items-center gap-3 border-b border-[#e4edf0] pb-4 last:border-b-0 last:pb-0" key={index}>
                  <div className="size-9 shrink-0 animate-pulse rounded-full bg-[#dcebf0]" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3 w-20 animate-pulse rounded-full bg-[#dcebf0]" />
                    <div className="h-4 w-full max-w-[190px] animate-pulse rounded-full bg-[#e8f1f3]" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-lg border border-[#dcebef] bg-white p-4">
              <div className="h-3 w-24 animate-pulse rounded-full bg-[#dcebf0]" />
              <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-[#e8f1f3]" />
              <div className="mt-2 h-4 w-[76%] animate-pulse rounded-full bg-[#e8f1f3]" />
            </div>
          </aside>
        </section>
      </main>
    </SiteLayout>
  );
}

function BookAppointmentEmpty() {
  const { language } = usePublicLanguage();
  const copy = publicUiCopy(language);
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge>{copy.common.noContent}</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">{copy.booking.unavailableTitle}</h1>
        <p className="mt-3 text-[#6b7280]">{copy.booking.unavailableBody}</p>
      </Card>
    </main>
  );
}

function BookAppointmentError({ onRetry }: { onRetry: () => void }) {
  const { language } = usePublicLanguage();
  const copy = publicUiCopy(language);
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">{copy.common.error}</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">{copy.booking.errorTitle}</h1>
        <p className="mt-3 text-[#6b7280]">{copy.booking.errorBody}</p>
        <Button className="mt-6" onClick={onRetry} type="button">
          {copy.common.retry}
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
