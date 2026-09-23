import { AdminPageHeading } from '@/components/layout/admin-workspace';
import { useMemo, useState, useRef, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AdminIcon } from '@/components/layout/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { AdminCalendarContent, CalendarAppointmentItem, NewCalendarAppointment } from '@/services/admin-calendar';
import { useAdminCalendarPageQuery, useCreateAdminCalendarAppointmentMutation } from './use-admin-calendar-page';

const eventTone: Record<string, string> = {
  blue: 'border-l-[#1c8db1] bg-[#edf8fd] text-[#197da2]',
  green: 'border-l-[#18bf8c] bg-[#ecfbf4] text-[#16a775]',
  orange: 'border-l-[#eb8600] bg-[#fff8e4] text-[#dd7b00]',
  red: 'border-l-[#ef3f43] bg-[#fff0f1] text-[#e03338]',
};

type CreatedCalendarAppointment = {
  appointment: CalendarAppointmentItem;
  dayKey: string;
};

export function padZero(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
}

export function parseDateKey(key: string): Date {
  const parts = key.split('-').map((p) => parseInt(p, 10));
  return new Date(parts[0] ?? 2026, (parts[1] ?? 1) - 1, parts[2] ?? 1);
}

export function getWeekDays(d: Date): Date[] {
  const sunday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i);
    days.push(day);
  }
  return days;
}

function CalendarFooter({ footer }: { footer: AdminCalendarContent['footer'] }) {
  return (
    <footer className="mt-11 flex flex-wrap items-center justify-between gap-5 text-[13px] text-[#9badc5]">
      <p>{footer.copyright}</p>
      <div className="flex flex-wrap gap-7">
        <span className="inline-flex items-center gap-2">
          <AdminIcon className="size-4 text-[#2187a8]" name="shield" />
          {footer.sslLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <AdminIcon className="size-4 text-[#2187a8]" name="lock" />
          {footer.encryptionLabel}
        </span>
      </div>
    </footer>
  );
}

function AppointmentDetailDialog({
  appointment,
  onClose,
}: {
  appointment: CalendarAppointmentItem;
  onClose: () => void;
}) {
  const statusLabels: Record<string, { bg: string; label: string; text: string }> = {
    CANCELLED: { bg: 'bg-[#fff0f1]', label: 'Cancelled', text: 'text-[#e03338]' },
    COMPLETED: { bg: 'bg-[#ecfbf4]', label: 'Completed', text: 'text-[#16a775]' },
    CONFIRMED: { bg: 'bg-[#edf8fd]', label: 'Confirmed', text: 'text-[#197da2]' },
    PENDING: { bg: 'bg-[#fff8e4]', label: 'Pending Request', text: 'text-[#dd7b00]' },
  };
  const statusInfo = statusLabels[appointment.status ?? 'PENDING'] ?? statusLabels.PENDING!;

  return (
    <div
      aria-labelledby="appointment-detail-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-[#0f172a]/35 p-5"
      role="dialog"
    >
      <Card className="w-full max-w-[480px] rounded-[26px] border-[#dce5ef] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.20)]">
        <div className="flex items-center justify-between gap-4 border-b border-[#e5edf5] pb-4">
          <div>
            <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold ${statusInfo.bg} ${statusInfo.text}`}>
              {statusInfo.label}
            </span>
            <h2 className="mt-2 text-[20px] font-bold text-[#182238]" id="appointment-detail-title">
              {appointment.patientName || appointment.label}
            </h2>
          </div>
          <button
            aria-label="Close details"
            className="rounded-lg px-2 py-1 text-xl text-[#71839e] hover:bg-[#f4f8fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8]"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="mt-5 space-y-3.5 text-[14px]">
          {appointment.reference ? (
            <div className="flex justify-between border-b border-[#f1f5f9] pb-2">
              <span className="font-medium text-[#71839e]">Reference</span>
              <span className="font-mono font-semibold text-[#182238]">{appointment.reference}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-b border-[#f1f5f9] pb-2">
            <span className="font-medium text-[#71839e]">Service</span>
            <span className="font-semibold text-[#182238]">{appointment.serviceName || appointment.label}</span>
          </div>
          <div className="flex justify-between border-b border-[#f1f5f9] pb-2">
            <span className="font-medium text-[#71839e]">Doctor</span>
            <span className="font-semibold text-[#182238]">{appointment.doctor}</span>
          </div>
          <div className="flex justify-between border-b border-[#f1f5f9] pb-2">
            <span className="font-medium text-[#71839e]">Scheduled Time</span>
            <span className="font-semibold text-[#182238]">{appointment.time}</span>
          </div>
          {appointment.phone ? (
            <div className="flex justify-between border-b border-[#f1f5f9] pb-2">
              <span className="font-medium text-[#71839e]">Patient Phone</span>
              <a className="font-semibold text-[#2187a8] hover:underline" href={`tel:${appointment.phone}`}>
                {appointment.phone}
              </a>
            </div>
          ) : null}
          {appointment.email ? (
            <div className="flex justify-between border-b border-[#f1f5f9] pb-2">
              <span className="font-medium text-[#71839e]">Patient Email</span>
              <a className="font-semibold text-[#2187a8] hover:underline" href={`mailto:${appointment.email}`}>
                {appointment.email}
              </a>
            </div>
          ) : null}
          {appointment.branchName ? (
            <div className="flex justify-between border-b border-[#f1f5f9] pb-2">
              <span className="font-medium text-[#71839e]">Branch</span>
              <span className="font-semibold text-[#182238]">{appointment.branchName}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#edf8fd] px-4 text-xs font-bold text-[#197da2] transition hover:bg-[#dceef7]"
            to="/admin/appointments"
          >
            Open in All Appointments →
          </Link>
          <Button onClick={onClose} type="button" variant="secondary">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function NewAppointmentDialog({
  content,
  defaultDate,
  doctors,
  onClose,
  onCreate,
}: {
  content: AdminCalendarContent;
  defaultDate: string;
  doctors: string[];
  onClose: () => void;
  onCreate: (appointment: NewCalendarAppointment) => void;
}) {
  const [form, setForm] = useState<NewCalendarAppointment>({
    date: defaultDate || new Date().toISOString().slice(0, 10),
    doctor: doctors[0] ?? 'Any Doctor',
    patientName: '',
    service: content.newAppointment.services[0] ?? 'General Dentistry',
    time: '09:00',
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.patientName.trim()) return;
    onCreate(form);
  };

  return (
    <div
      aria-labelledby="new-appointment-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-[#0f172a]/35 p-5"
      role="dialog"
    >
      <Card className="w-full max-w-[480px] rounded-[26px] border-[#dce5ef] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.20)]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[22px] font-bold text-[#182238]" id="new-appointment-title">
            {content.newAppointment.title}
          </h2>
          <button
            aria-label="Close new appointment form"
            className="rounded-lg px-2 py-1 text-xl text-[#71839e] hover:bg-[#f4f8fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8]"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <label className="text-[14px] font-semibold text-[#52647d]">
            {content.newAppointment.patientLabel} *
            <input
              className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3 text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#2187a8]/20"
              onChange={(event) => setForm((value) => ({ ...value, patientName: event.target.value }))}
              placeholder="e.g. Hong Than Brathna"
              required
              value={form.patientName}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-[14px] font-semibold text-[#52647d]">
              {content.newAppointment.dateLabel} *
              <input
                className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3 text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#2187a8]/20"
                onChange={(event) => setForm((value) => ({ ...value, date: event.target.value }))}
                required
                type="date"
                value={form.date}
              />
            </label>
            <label className="text-[14px] font-semibold text-[#52647d]">
              {content.newAppointment.timeLabel} *
              <input
                className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3 text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#2187a8]/20"
                onChange={(event) => setForm((value) => ({ ...value, time: event.target.value }))}
                required
                type="time"
                value={form.time}
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-[14px] font-semibold text-[#52647d]">
              {content.newAppointment.doctorLabel}
              <select
                className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#2187a8]/20"
                onChange={(event) => setForm((value) => ({ ...value, doctor: event.target.value }))}
                value={form.doctor}
              >
                {doctors.map((doctor) => (
                  <option key={doctor}>{doctor}</option>
                ))}
              </select>
            </label>
            <label className="text-[14px] font-semibold text-[#52647d]">
              {content.newAppointment.serviceLabel}
              <select
                className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#2187a8]/20"
                onChange={(event) => setForm((value) => ({ ...value, service: event.target.value }))}
                value={form.service}
              >
                {content.newAppointment.services.map((service) => (
                  <option key={service}>{service}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-2 flex justify-end gap-3">
            <Button onClick={onClose} type="button" variant="secondary">
              {content.newAppointment.cancelLabel}
            </Button>
            <Button type="submit">{content.newAppointment.saveLabel}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export function MonthView({
  allAppointmentsMap,
  content,
  doctor,
  filterAppointment,
  onSelectAppointment,
  onSelectDate,
  query,
}: {
  allAppointmentsMap: Map<string, CalendarAppointmentItem[]>;
  content: AdminCalendarContent;
  doctor: string;
  filterAppointment: (item: CalendarAppointmentItem) => boolean;
  onSelectAppointment: (appointment: CalendarAppointmentItem) => void;
  onSelectDate: (date: Date) => void;
  query: string;
}) {
  const days = useMemo(() => {
    return content.calendar.days.map((day) => {
      const appointments = (allAppointmentsMap.get(day.key) ?? []).filter(filterAppointment);
      return {
        ...day,
        appointments,
      };
    });
  }, [content.calendar.days, allAppointmentsMap, filterAppointment]);

  const hasAppointments = days.some((day) => day.appointments.length > 0);

  if (!hasAppointments && (query.trim() || doctor !== content.controls.allDoctors)) {
    return (
      <div className="grid min-h-[560px] place-items-center px-6 text-center">
        <div>
          <h2 className="text-xl font-bold text-[#182238]">{content.empty.title}</h2>
          <p className="mt-3 text-[#71839e]">{content.empty.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-[840px]">
      <div className="grid grid-cols-7 border-b border-[#e1e8f0] bg-[#f8fafc]">
        {content.calendar.weekdays.map((day) => (
          <div
            className="border-r border-[#e1e8f0] py-4 text-center text-[13px] font-bold uppercase tracking-[0.5px] text-[#61738d] last:border-r-0"
            key={day}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => (
          <div
            className={`min-h-[130px] border-b border-r border-[#e1e8f0] p-3 last:border-r-0 ${
              day.isOutsideMonth ? 'bg-[#fbfcfd] text-[#c4cfdd]' : 'text-[#71839e]'
            } ${day.isCurrentDay ? 'bg-[#eef9ff]' : 'bg-white'}`}
            key={day.key}
          >
            <div className="flex items-center justify-between">
              <button
                className={`text-[16px] font-semibold transition hover:text-[#2187a8] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2187a8] ${
                  day.isCurrentDay ? 'text-[#2187a8]' : ''
                }`}
                onClick={() => onSelectDate(parseDateKey(day.key))}
                title={`Switch to Day view for ${day.key}`}
                type="button"
              >
                {day.day}
              </button>
              {day.isCurrentDay ? <span className="size-2 rounded-full bg-[#2187a8]" /> : null}
            </div>
            <div className="mt-3 space-y-1.5">
              {day.appointments.map((appointment) => (
                <button
                  className={`w-full border-l-4 px-2 py-1.5 text-left text-[13px] font-bold leading-4 transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8] ${
                    eventTone[appointment.tone]
                  }`}
                  key={appointment.id}
                  onClick={() => onSelectAppointment(appointment)}
                  title={`${appointment.label}, ${appointment.time}`}
                  type="button"
                >
                  <span className="block truncate">{appointment.patientName || appointment.label}</span>
                  <span className="mt-0.5 block text-[12px] font-medium opacity-65">
                    {appointment.time}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WeekView({
  allAppointmentsMap,
  filterAppointment,
  onSelectAppointment,
  onSelectDate,
  selectedDate,
}: {
  allAppointmentsMap: Map<string, CalendarAppointmentItem[]>;
  filterAppointment: (item: CalendarAppointmentItem) => boolean;
  onSelectAppointment: (appointment: CalendarAppointmentItem) => void;
  onSelectDate: (d: Date) => void;
  selectedDate: Date;
}) {
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const todayKey = formatDateKey(new Date());

  return (
    <div className="min-w-[840px]">
      <div className="grid grid-cols-7 border-b border-[#e1e8f0] bg-[#f8fafc]">
        {weekDays.map((d) => {
          const key = formatDateKey(d);
          const isToday = key === todayKey;
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = d.getDate();
          return (
            <button
              className="border-r border-[#e1e8f0] py-3.5 text-center transition hover:bg-[#eef9ff] last:border-r-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2187a8]"
              key={key}
              onClick={() => onSelectDate(d)}
              title={`Switch to Day view for ${dayName}, ${key}`}
              type="button"
            >
              <span className="block text-[11px] font-bold uppercase tracking-[0.5px] text-[#61738d]">
                {dayName}
              </span>
              <span
                className={`mt-1 inline-grid size-7 place-items-center rounded-full text-[15px] font-bold ${
                  isToday ? 'bg-[#2187a8] text-white' : 'text-[#182238]'
                }`}
              >
                {dayNum}
              </span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-7">
        {weekDays.map((d) => {
          const key = formatDateKey(d);
          const isToday = key === todayKey;
          const appointments = (allAppointmentsMap.get(key) ?? []).filter(filterAppointment);
          return (
            <div
              className={`min-h-[420px] border-b border-r border-[#e1e8f0] p-2.5 last:border-r-0 ${
                isToday ? 'bg-[#f4faff]' : 'bg-white'
              }`}
              key={key}
            >
              <div className="space-y-2">
                {appointments.map((appointment) => (
                  <button
                    className={`w-full rounded-xl border-l-4 p-2.5 text-left transition hover:shadow-md hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2187a8] ${eventTone[appointment.tone]}`}
                    key={appointment.id}
                    onClick={() => onSelectAppointment(appointment)}
                    title={`${appointment.label}, ${appointment.time}`}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-1 text-[11px] font-bold">
                      <span>{appointment.time}</span>
                      <span className="rounded bg-white/70 px-1.5 py-0.5 text-[9px] uppercase tracking-wider">
                        {appointment.status || 'PENDING'}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] font-bold text-[#182238] truncate">
                      {appointment.patientName || appointment.label}
                    </p>
                    <p className="text-[12px] opacity-85 truncate">
                      {appointment.serviceName || appointment.label}
                    </p>
                    <p className="mt-1 text-[11px] font-medium opacity-70 truncate">
                      👨‍⚕️ {appointment.doctor}
                    </p>
                  </button>
                ))}
                {appointments.length === 0 ? (
                  <div className="grid min-h-[100px] place-items-center rounded-xl border border-dashed border-[#e2e8f0] p-2 text-center text-[12px] text-[#9badc5]">
                    <span>No visits</span>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DayView({
  allAppointmentsMap,
  filterAppointment,
  onNewAppointment,
  onSelectAppointment,
  selectedDate,
}: {
  allAppointmentsMap: Map<string, CalendarAppointmentItem[]>;
  filterAppointment: (item: CalendarAppointmentItem) => boolean;
  onNewAppointment: (dateStr: string) => void;
  onSelectAppointment: (appointment: CalendarAppointmentItem) => void;
  selectedDate: Date;
}) {
  const dayKey = formatDateKey(selectedDate);
  const appointments = (allAppointmentsMap.get(dayKey) ?? []).filter(filterAppointment);
  const fullDateLabel = selectedDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e1e8f0] pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#182238]">{fullDateLabel}</h2>
          <p className="mt-1 text-[13px] text-[#71839e]">
            {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'} scheduled for this date
          </p>
        </div>
        <Button
          className="h-10 rounded-xl px-4 text-xs font-bold"
          icon={<span aria-hidden="true" className="text-base leading-none">+</span>}
          onClick={() => onNewAppointment(dayKey)}
          type="button"
        >
          Add to This Day
        </Button>
      </div>

      <div className="mt-6">
        {appointments.length > 0 ? (
          <div className="space-y-3.5">
            {appointments.map((appointment) => (
              <div
                className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e1e8f0] border-l-4 bg-white p-5 shadow-sm transition hover:shadow-md ${
                  appointment.tone === 'blue'
                    ? 'border-l-[#1c8db1]'
                    : appointment.tone === 'green'
                    ? 'border-l-[#18bf8c]'
                    : appointment.tone === 'orange'
                    ? 'border-l-[#eb8600]'
                    : 'border-l-[#ef3f43]'
                }`}
                key={appointment.id}
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div className="grid min-w-[90px] place-items-center rounded-xl bg-[#f4f8fb] px-3 py-2 text-center">
                    <span className="text-sm font-bold text-[#182238]">{appointment.time}</span>
                    <span
                      className={`mt-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        appointment.status === 'CONFIRMED'
                          ? 'bg-[#edf8fd] text-[#197da2]'
                          : appointment.status === 'COMPLETED'
                          ? 'bg-[#ecfbf4] text-[#16a775]'
                          : appointment.status === 'CANCELLED'
                          ? 'bg-[#fff0f1] text-[#e03338]'
                          : 'bg-[#fff8e4] text-[#dd7b00]'
                      }`}
                    >
                      {appointment.status || 'PENDING'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#182238]">
                      {appointment.patientName || appointment.label}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[13px] text-[#52647d]">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        🦷 {appointment.serviceName || appointment.label}
                      </span>
                      <span className="text-[#cbd5e1]">•</span>
                      <span className="inline-flex items-center gap-1.5 font-medium text-[#2187a8]">
                        👨‍⚕️ {appointment.doctor}
                      </span>
                      {appointment.branchName ? (
                        <>
                          <span className="text-[#cbd5e1]">•</span>
                          <span className="inline-flex items-center gap-1.5 text-[#71839e]">
                            📍 {appointment.branchName}
                          </span>
                        </>
                      ) : null}
                    </div>
                    {appointment.phone || appointment.email ? (
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#71839e]">
                        {appointment.phone ? (
                          <a
                            className="font-medium hover:text-[#2187a8] hover:underline"
                            href={`tel:${appointment.phone}`}
                          >
                            📞 {appointment.phone}
                          </a>
                        ) : null}
                        {appointment.email ? (
                          <a
                            className="font-medium hover:text-[#2187a8] hover:underline"
                            href={`mailto:${appointment.email}`}
                          >
                            ✉️ {appointment.email}
                          </a>
                        ) : null}
                        {appointment.reference ? (
                          <span className="font-mono text-[#94a3b8]">
                            Ref: {appointment.reference}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>

                <Button
                  className="rounded-xl"
                  onClick={() => onSelectAppointment(appointment)}
                  type="button"
                  variant="secondary"
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid min-h-[260px] place-items-center rounded-2xl border border-dashed border-[#dce5ef] bg-[#fafcff] p-8 text-center">
            <div>
              <AdminIcon className="mx-auto size-12 text-[#9badc5]" name="calendarCheck" />
              <h3 className="mt-3 text-lg font-bold text-[#182238]">No appointments scheduled</h3>
              <p className="mt-1 text-sm text-[#71839e]">
                There are no patient visits booked for {fullDateLabel}.
              </p>
              <Button
                className="mt-5 rounded-xl px-5"
                onClick={() => onNewAppointment(dayKey)}
                type="button"
              >
                + Schedule Appointment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarContent({
  content,
  onSelectDate,
  selectedDate,
}: {
  content: AdminCalendarContent;
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
}) {
  const [view, setView] = useState<(typeof content.controls.views)[number]>('Month');
  const [doctor, setDoctor] = useState(content.controls.allDoctors);
  const [query, setQuery] = useState('');
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [createDefaultDate, setCreateDefaultDate] = useState(formatDateKey(selectedDate));
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointmentItem | null>(null);
  const [createdAppointments, setCreatedAppointments] = useState<CreatedCalendarAppointment[]>([]);
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(selectedDate.getFullYear());
  const datePickerRef = useRef<HTMLDivElement>(null);

  const createAppointmentMutation = useCreateAdminCalendarAppointmentMutation();

  // Synchronize picker year when selected date changes
  useEffect(() => {
    setPickerYear(selectedDate.getFullYear());
  }, [selectedDate]);

  // Click outside to close date picker popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setDatePickerOpen(false);
      }
    }
    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDatePickerOpen]);

  // Comprehensive Doctor Options list
  const doctorOptions = useMemo(() => {
    const fromContent = content.doctors ?? [];
    const fromAppointments = content.calendar.days.flatMap((d) => d.appointments.map((a) => a.doctor));
    const fromCreated = createdAppointments.map((c) => c.appointment.doctor);
    const combined = Array.from(new Set([...fromContent, ...fromAppointments, ...fromCreated]))
      .map((d) => d.trim())
      .filter((d) => d && d !== 'Any Doctor' && d !== content.controls.allDoctors);
    combined.sort((a, b) => a.localeCompare(b));
    return [content.controls.allDoctors, 'Any Doctor', ...combined];
  }, [content.doctors, content.calendar.days, createdAppointments, content.controls.allDoctors]);

  const modalDoctors = useMemo(() => {
    return doctorOptions.filter((d) => d !== content.controls.allDoctors);
  }, [doctorOptions, content.controls.allDoctors]);

  // Group all appointments by date key
  const allAppointmentsMap = useMemo(() => {
    const map = new Map<string, CalendarAppointmentItem[]>();
    for (const day of content.calendar.days) {
      if (day.appointments.length > 0) {
        map.set(day.key, [...day.appointments]);
      }
    }
    for (const created of createdAppointments) {
      const list = map.get(created.dayKey) ?? [];
      list.push(created.appointment);
      map.set(created.dayKey, list);
    }
    return map;
  }, [content.calendar.days, createdAppointments]);

  // Normalized search & doctor filter predicate
  const normalizedQuery = query.trim().toLowerCase();
  const filterAppointment = useMemo(() => {
    return (appointment: CalendarAppointmentItem): boolean => {
      // Doctor filter
      if (doctor !== content.controls.allDoctors) {
        if (doctor === 'Any Doctor') {
          const doc = (appointment.doctor || '').trim().toLowerCase();
          if (doc !== 'any doctor' && doc !== '') return false;
        } else {
          const targetDoc = doctor.toLowerCase().replace(/^dr\.?\s*/i, '').trim();
          const apptDoc = (appointment.doctor || '').toLowerCase().replace(/^dr\.?\s*/i, '').trim();
          if (!apptDoc.includes(targetDoc) && !targetDoc.includes(apptDoc)) return false;
        }
      }

      // Search query filter
      if (normalizedQuery) {
        const searchTarget = [
          appointment.patientName,
          appointment.doctor,
          appointment.serviceName,
          appointment.label,
          appointment.phone,
          appointment.email,
          appointment.reference,
          appointment.branchName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!searchTarget.includes(normalizedQuery)) return false;
      }

      return true;
    };
  }, [doctor, content.controls.allDoctors, normalizedQuery]);

  // Count matches
  const matchingCount = useMemo(() => {
    let total = 0;
    allAppointmentsMap.forEach((list) => {
      total += list.filter(filterAppointment).length;
    });
    return total;
  }, [allAppointmentsMap, filterAppointment]);

  const isFilterActive = Boolean(normalizedQuery || doctor !== content.controls.allDoctors);

  // Dynamic header date label depending on active view
  const headerDateLabel = useMemo(() => {
    if (view === 'Month') {
      return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (view === 'Week') {
      const days = getWeekDays(selectedDate);
      const first = days[0]!;
      const last = days[6]!;
      const firstMonth = first.toLocaleDateString('en-US', { month: 'short' });
      const lastMonth = last.toLocaleDateString('en-US', { month: 'short' });
      return firstMonth === lastMonth
        ? `${firstMonth} ${first.getDate()} – ${last.getDate()}, ${first.getFullYear()}`
        : `${firstMonth} ${first.getDate()} – ${lastMonth} ${last.getDate()}, ${last.getFullYear()}`;
    }
    return selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }, [selectedDate, view]);

  // Navigation handlers
  const handlePrev = () => {
    if (view === 'Month') {
      onSelectDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
    } else if (view === 'Week') {
      onSelectDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 7));
    } else {
      onSelectDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1));
    }
  };

  const handleNext = () => {
    if (view === 'Month') {
      onSelectDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
    } else if (view === 'Week') {
      onSelectDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 7));
    } else {
      onSelectDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1));
    }
  };

  const handleToday = () => {
    onSelectDate(new Date());
  };

  const handleOpenCreateWithDate = (dateStr: string) => {
    setCreateDefaultDate(dateStr);
    setCreateOpen(true);
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <>
      <main className="min-w-0 flex-1 bg-[#f6f8fb] px-5 py-7 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-[1440px]">
          <header className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <AdminPageHeading />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Interactive Date & Month Picker Button with Dropdown Popover */}
              <div className="relative" ref={datePickerRef}>
                <button
                  aria-expanded={isDatePickerOpen}
                  aria-label="Change calendar month or year"
                  className="inline-flex h-[46px] items-center gap-2.5 rounded-xl border border-[#dce5ef] bg-white px-4 text-[14px] font-semibold text-[#182238] transition hover:border-[#2187a8] hover:bg-[#f8fafc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2187a8]"
                  onClick={() => setDatePickerOpen((open) => !open)}
                  type="button"
                >
                  <AdminIcon className="size-4 text-[#2187a8]" name="calendar" />
                  <span>{headerDateLabel}</span>
                  <AdminIcon className="size-3 text-[#71839e]" name="chevronDown" />
                </button>

                {isDatePickerOpen ? (
                  <div
                    aria-label="Month and year picker"
                    className="absolute right-0 top-[52px] z-50 w-[290px] rounded-2xl border border-[#dce5ef] bg-white p-4 shadow-xl"
                    role="dialog"
                  >
                    <div className="flex items-center justify-between border-b border-[#eef2f6] pb-3">
                      <button
                        aria-label="Previous year"
                        className="grid size-8 place-items-center rounded-lg text-[#71839e] hover:bg-[#f4f8fb]"
                        onClick={() => setPickerYear((y) => y - 1)}
                        type="button"
                      >
                        <AdminIcon className="size-4 rotate-180" name="chevronRight" />
                      </button>
                      <span className="text-[16px] font-bold text-[#182238]">{pickerYear}</span>
                      <button
                        aria-label="Next year"
                        className="grid size-8 place-items-center rounded-lg text-[#71839e] hover:bg-[#f4f8fb]"
                        onClick={() => setPickerYear((y) => y + 1)}
                        type="button"
                      >
                        <AdminIcon className="size-4" name="chevronRight" />
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {months.map((m, idx) => {
                        const isSelected =
                          selectedDate.getFullYear() === pickerYear && selectedDate.getMonth() === idx;
                        return (
                          <button
                            className={`h-9 rounded-xl text-[13px] font-semibold transition ${
                              isSelected
                                ? 'bg-[#2187a8] text-white'
                                : 'text-[#52647d] hover:bg-[#eef9ff] hover:text-[#2187a8]'
                            }`}
                            key={m}
                            onClick={() => {
                              const newDate = new Date(
                                pickerYear,
                                idx,
                                Math.min(selectedDate.getDate(), new Date(pickerYear, idx + 1, 0).getDate()),
                              );
                              onSelectDate(newDate);
                              setDatePickerOpen(false);
                            }}
                            type="button"
                          >
                            {m}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 border-t border-[#eef2f6] pt-2.5 text-center">
                      <button
                        className="text-[12px] font-bold text-[#2187a8] hover:underline"
                        onClick={() => {
                          const today = new Date();
                          onSelectDate(today);
                          setPickerYear(today.getFullYear());
                          setDatePickerOpen(false);
                        }}
                        type="button"
                      >
                        Jump to Today
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <Button
                className="h-[46px] rounded-xl px-5 text-[14px]"
                icon={<span aria-hidden="true" className="text-xl leading-none">+</span>}
                onClick={() => handleOpenCreateWithDate(formatDateKey(selectedDate))}
              >
                {content.controls.newAppointmentLabel}
              </Button>
            </div>
          </header>

          <Card className="mt-9 overflow-hidden rounded-[32px] border-[#dce5ef] shadow-[0_2px_4px_rgba(15,23,42,0.03)]">
            <div className="flex flex-wrap items-center justify-between gap-5 border-b border-[#e1e8f0] px-7 py-5">
              <div className="flex flex-wrap items-center gap-5">
                {/* Working Month / Week / Day View Tabs */}
                <div className="inline-flex overflow-hidden rounded-xl border border-[#dce5ef] bg-white">
                  {content.controls.views.map((item) => (
                    <button
                      aria-pressed={view === item}
                      className={`min-h-[42px] border-r border-[#dce5ef] px-5 text-[14px] font-semibold last:border-r-0 transition ${
                        view === item ? 'bg-[#eef5f9] text-[#2187a8]' : 'text-[#71839e] hover:bg-[#f8fafc]'
                      }`}
                      key={item}
                      onClick={() => setView(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>

                {/* Previous / Today / Next Controls */}
                <button
                  aria-label="Previous period"
                  className="grid size-[42px] place-items-center rounded-xl border border-[#dce5ef] text-[#71839e] hover:bg-[#f8fafc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8]"
                  onClick={handlePrev}
                  type="button"
                >
                  <AdminIcon className="size-4 rotate-180" name="chevronRight" />
                </button>
                <button
                  className="text-[14px] font-bold text-[#2187a8] hover:text-[#096d91] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8]"
                  onClick={handleToday}
                  type="button"
                >
                  {content.controls.todayLabel}
                </button>
                <button
                  aria-label="Next period"
                  className="grid size-[42px] place-items-center rounded-xl border border-[#dce5ef] text-[#71839e] hover:bg-[#f8fafc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8]"
                  onClick={handleNext}
                  type="button"
                >
                  <AdminIcon className="size-4" name="chevronRight" />
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Search Bar with Clear Button */}
                <label className="relative flex h-[42px] min-w-[230px] items-center gap-2 rounded-xl border border-[#dce5ef] bg-[#f9fbfd] px-3.5 text-[#9badc5] transition focus-within:border-[#2187a8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2187a8]/20">
                  <AdminIcon className="size-4 shrink-0 text-[#71839e]" name="search" />
                  <span className="sr-only">Search appointments</span>
                  <input
                    className="min-w-0 flex-1 bg-transparent text-[14px] text-[#182238] outline-none placeholder:text-[#a9b7c9]"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={content.controls.searchPlaceholder}
                    type="search"
                    value={query}
                  />
                  {query ? (
                    <button
                      aria-label="Clear search"
                      className="grid size-5 place-items-center rounded-full text-xs font-bold text-[#71839e] hover:bg-[#e1e8f0] hover:text-[#182238]"
                      onClick={() => setQuery('')}
                      type="button"
                    >
                      ×
                    </button>
                  ) : null}
                </label>

                {/* Doctor Filter Dropdown with All Real Doctors */}
                <label className="flex h-[42px] items-center gap-2 rounded-xl border border-[#dce5ef] bg-white px-3 text-[#71839e] transition focus-within:border-[#2187a8] focus-within:ring-2 focus-within:ring-[#2187a8]/20">
                  <AdminIcon className="size-4" name="filter" />
                  <span className="sr-only">Filter by doctor</span>
                  <select
                    className="cursor-pointer bg-transparent pr-1 text-[14px] font-medium outline-none"
                    onChange={(event) => setDoctor(event.target.value)}
                    value={doctor}
                  >
                    {doctorOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Filter Active Feedback Banner */}
            {isFilterActive ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e1e8f0] bg-[#fdfaf5] px-7 py-2.5 text-xs text-[#8a5d14]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">Filter active:</span>
                  {query ? (
                    <span className="rounded border border-[#e8dfcf] bg-white px-2 py-0.5">
                      Search: &ldquo;{query}&rdquo;
                    </span>
                  ) : null}
                  {doctor !== content.controls.allDoctors ? (
                    <span className="rounded border border-[#e8dfcf] bg-white px-2 py-0.5">
                      Doctor: {doctor}
                    </span>
                  ) : null}
                  <span>({matchingCount} matching)</span>
                </div>
                <button
                  className="font-bold text-[#b45309] hover:underline"
                  onClick={() => {
                    setQuery('');
                    setDoctor(content.controls.allDoctors);
                  }}
                  type="button"
                >
                  Clear all filters
                </button>
              </div>
            ) : null}

            {/* View Switching: Month, Week, Day */}
            <div className="overflow-x-auto">
              {view === 'Month' ? (
                <MonthView
                  allAppointmentsMap={allAppointmentsMap}
                  content={content}
                  doctor={doctor}
                  filterAppointment={filterAppointment}
                  onSelectAppointment={(appt) => setSelectedAppointment(appt)}
                  onSelectDate={(date) => {
                    onSelectDate(date);
                    setView('Day');
                  }}
                  query={query}
                />
              ) : view === 'Week' ? (
                <WeekView
                  allAppointmentsMap={allAppointmentsMap}
                  filterAppointment={filterAppointment}
                  onSelectAppointment={(appt) => setSelectedAppointment(appt)}
                  onSelectDate={(d) => {
                    onSelectDate(d);
                    setView('Day');
                  }}
                  selectedDate={selectedDate}
                />
              ) : (
                <DayView
                  allAppointmentsMap={allAppointmentsMap}
                  filterAppointment={filterAppointment}
                  onNewAppointment={(dateStr) => handleOpenCreateWithDate(dateStr)}
                  onSelectAppointment={(appt) => setSelectedAppointment(appt)}
                  selectedDate={selectedDate}
                />
              )}
            </div>
          </Card>
          <CalendarFooter footer={content.footer} />
        </div>
      </main>

      {/* New Appointment Modal with All Doctors */}
      {isCreateOpen ? (
        <NewAppointmentDialog
          content={content}
          defaultDate={createDefaultDate}
          doctors={modalDoctors}
          onClose={() => setCreateOpen(false)}
          onCreate={(appointment) =>
            createAppointmentMutation.mutate(appointment, {
              onSuccess: (createdAppointment) => {
                setCreatedAppointments((items) => [...items, createdAppointment]);
                setCreateOpen(false);
              },
            })
          }
        />
      ) : null}

      {/* Appointment Detail Modal */}
      {selectedAppointment ? (
        <AppointmentDetailDialog
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      ) : null}
    </>
  );
}

function CalendarSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading appointment calendar" className="min-h-screen bg-[#f6f8fb] p-7 lg:p-11">
      <div className="h-10 w-72 animate-pulse rounded bg-[#e7edf3]" />
      <div className="mt-9 h-[720px] animate-pulse rounded-[32px] bg-white" />
    </main>
  );
}

function CalendarUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8fb] p-6">
      <Card className="max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold text-[#182238]">Calendar is unavailable</h1>
        <p className="mt-3 text-[#71839e]">Please refresh and try again.</p>
        <Button className="mt-6" onClick={onRetry}>
          Retry
        </Button>
      </Card>
    </main>
  );
}

export function AdminCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;

  const { data, isError, isLoading, refetch } = useAdminCalendarPageQuery(year, month);

  if (isLoading) return <CalendarSkeleton />;
  if (isError || !data || data.calendar.days.length === 0) {
    return <CalendarUnavailable onRetry={() => void refetch()} />;
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:flex">
      <CalendarContent
        content={data}
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
      />
    </div>
  );
}
