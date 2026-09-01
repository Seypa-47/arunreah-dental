import { useMemo, useState, type FormEvent } from 'react';
import { AdminIcon, AdminSidebar } from '@/components/layout/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { AdminCalendarContent, NewCalendarAppointment } from '@/services/admin-calendar';
import { useAdminCalendarPageQuery, useCreateAdminCalendarAppointmentMutation } from './use-admin-calendar-page';

const eventTone = {
  blue: 'border-l-[#1c8db1] bg-[#edf8fd] text-[#197da2]',
  green: 'border-l-[#18bf8c] bg-[#ecfbf4] text-[#16a775]',
  orange: 'border-l-[#eb8600] bg-[#fff8e4] text-[#dd7b00]',
  red: 'border-l-[#ef3f43] bg-[#fff0f1] text-[#e03338]',
};

type CreatedCalendarAppointment = {
  appointment: AdminCalendarContent['calendar']['days'][number]['appointments'][number];
  dayKey: string;
};

function CalendarFooter({ footer }: { footer: AdminCalendarContent['footer'] }) {
  return <footer className="mt-11 flex flex-wrap items-center justify-between gap-5 text-[13px] text-[#9badc5]"><p>{footer.copyright}</p><div className="flex flex-wrap gap-7"><span className="inline-flex items-center gap-2"><AdminIcon className="size-4 text-[#2187a8]" name="shield" />{footer.sslLabel}</span><span className="inline-flex items-center gap-2"><AdminIcon className="size-4 text-[#2187a8]" name="lock" />{footer.encryptionLabel}</span></div></footer>;
}

function NewAppointmentDialog({ content, doctors, onClose, onCreate }: { content: AdminCalendarContent; doctors: string[]; onClose: () => void; onCreate: (appointment: NewCalendarAppointment) => void }) {
  const [form, setForm] = useState<NewCalendarAppointment>({ date: '2024-10-24', doctor: doctors[0] ?? '', patientName: '', service: content.newAppointment.services[0] ?? '', time: '09:00' });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCreate(form);
  };

  return <div aria-labelledby="new-appointment-title" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-[#0f172a]/35 p-5" role="dialog"><Card className="w-full max-w-[480px] rounded-[26px] border-[#dce5ef] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.20)]"><div className="flex items-center justify-between gap-4"><h2 className="text-[22px] font-bold text-[#182238]" id="new-appointment-title">{content.newAppointment.title}</h2><button aria-label="Close new appointment form" className="rounded-lg px-2 py-1 text-xl text-[#71839e] hover:bg-[#f4f8fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8]" onClick={onClose} type="button">×</button></div><form className="mt-6 grid gap-4" onSubmit={submit}><label className="text-[14px] font-semibold text-[#52647d]">{content.newAppointment.patientLabel}<input className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3 text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#2187a8]/20" onChange={(event) => setForm((value) => ({ ...value, patientName: event.target.value }))} required value={form.patientName} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-[14px] font-semibold text-[#52647d]">{content.newAppointment.dateLabel}<input className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3 text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#2187a8]/20" onChange={(event) => setForm((value) => ({ ...value, date: event.target.value }))} required type="date" value={form.date} /></label><label className="text-[14px] font-semibold text-[#52647d]">{content.newAppointment.timeLabel}<input className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] px-3 text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#2187a8]/20" onChange={(event) => setForm((value) => ({ ...value, time: event.target.value }))} required type="time" value={form.time} /></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-[14px] font-semibold text-[#52647d]">{content.newAppointment.doctorLabel}<select className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#2187a8]/20" onChange={(event) => setForm((value) => ({ ...value, doctor: event.target.value }))} value={form.doctor}>{doctors.map((doctor) => <option key={doctor}>{doctor}</option>)}</select></label><label className="text-[14px] font-semibold text-[#52647d]">{content.newAppointment.serviceLabel}<select className="mt-2 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#2187a8]/20" onChange={(event) => setForm((value) => ({ ...value, service: event.target.value }))} value={form.service}>{content.newAppointment.services.map((service) => <option key={service}>{service}</option>)}</select></label></div><div className="mt-2 flex justify-end gap-3"><Button onClick={onClose} type="button" variant="secondary">{content.newAppointment.cancelLabel}</Button><Button type="submit">{content.newAppointment.saveLabel}</Button></div></form></Card></div>;
}

function CalendarGrid({ content, createdAppointments, doctor, query }: { content: AdminCalendarContent; createdAppointments: CreatedCalendarAppointment[]; doctor: string; query: string }) {
  const normalizedQuery = query.trim().toLowerCase();
  const days = useMemo(() => content.calendar.days.map((day) => ({
    ...day,
    appointments: [...day.appointments, ...createdAppointments.filter((item) => item.dayKey === day.key).map((item) => item.appointment)].filter((appointment) => (doctor === content.controls.allDoctors || appointment.doctor === doctor) && (!normalizedQuery || `${appointment.label} ${appointment.doctor}`.toLowerCase().includes(normalizedQuery))),
  })), [content, createdAppointments, doctor, normalizedQuery]);
  const hasAppointments = days.some((day) => day.appointments.length > 0);

  if (!hasAppointments && (normalizedQuery || doctor !== content.controls.allDoctors)) return <div className="grid min-h-[560px] place-items-center px-6 text-center"><div><h2 className="text-xl font-bold text-[#182238]">{content.empty.title}</h2><p className="mt-3 text-[#71839e]">{content.empty.description}</p></div></div>;

  return <div className="min-w-[840px]">
    <div className="grid grid-cols-7 border-b border-[#e1e8f0] bg-[#f8fafc]">{content.calendar.weekdays.map((day) => <div className="border-r border-[#e1e8f0] py-4 text-center text-[13px] font-bold uppercase tracking-[0.5px] text-[#61738d] last:border-r-0" key={day}>{day}</div>)}</div>
    <div className="grid grid-cols-7">{days.map((day) => <div className={`min-h-[130px] border-b border-r border-[#e1e8f0] p-3 last:border-r-0 ${day.isOutsideMonth ? 'bg-[#fbfcfd] text-[#c4cfdd]' : 'text-[#71839e]'} ${day.isCurrentDay ? 'bg-[#eef9ff]' : 'bg-white'}`} key={day.key}><div className="flex items-center justify-between"><span className={`text-[16px] font-semibold ${day.isCurrentDay ? 'text-[#2187a8]' : ''}`}>{day.day}</span>{day.isCurrentDay ? <span className="size-2 rounded-full bg-[#2187a8]" /> : null}</div><div className="mt-3 space-y-1.5">{day.appointments.map((appointment) => <button className={`w-full border-l-4 px-2 py-1.5 text-left text-[13px] font-bold leading-4 transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8] ${eventTone[appointment.tone]}`} key={appointment.id} title={`${appointment.label}, ${appointment.time}`} type="button"><span className="block truncate">{appointment.label}</span><span className="mt-0.5 block text-[12px] font-medium opacity-65">{appointment.time}</span></button>)}</div></div>)}</div>
  </div>;
}

function CalendarContent({ content }: { content: AdminCalendarContent }) {
  const [view, setView] = useState<(typeof content.controls.views)[number]>('Month');
  const [doctor, setDoctor] = useState(content.controls.allDoctors);
  const [query, setQuery] = useState('');
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [createdAppointments, setCreatedAppointments] = useState<CreatedCalendarAppointment[]>([]);
  const createAppointmentMutation = useCreateAdminCalendarAppointmentMutation();
  const doctors = [
    content.controls.allDoctors,
    ...Array.from(new Set([...content.calendar.days.flatMap((day) => day.appointments.map((appointment) => appointment.doctor)), ...createdAppointments.map((item) => item.appointment.doctor)])),
  ];

  return <><main className="flex-1 bg-[#f6f8fb] px-5 py-7 sm:px-7 lg:px-[42px] lg:py-[45px]"><header className="flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-[28px] font-bold tracking-[-0.6px] text-[#182238] sm:text-[33px]">{content.header.title}</h1><p className="mt-1 text-[16px] text-[#71839e] sm:text-[17px]">{content.header.subtitle}</p></div><div className="flex flex-wrap items-center gap-3"><div className="inline-flex h-[46px] items-center gap-2.5 rounded-xl border border-[#dce5ef] bg-white px-4 text-[14px] font-medium text-[#71839e]"><AdminIcon className="size-4" name="calendar" />{content.controls.monthLabel}</div><Button className="h-[46px] rounded-xl px-5 text-[14px]" icon={<span aria-hidden="true" className="text-xl leading-none">+</span>} onClick={() => setCreateOpen(true)}>{content.controls.newAppointmentLabel}</Button></div></header>
    <Card className="mt-9 overflow-hidden rounded-[32px] border-[#dce5ef] shadow-[0_2px_4px_rgba(15,23,42,0.03)]"><div className="flex flex-wrap items-center justify-between gap-5 border-b border-[#e1e8f0] px-7 py-5"><div className="flex flex-wrap items-center gap-5"><div className="inline-flex overflow-hidden rounded-xl border border-[#dce5ef] bg-white">{content.controls.views.map((item) => <button aria-pressed={view === item} className={`min-h-[42px] border-r border-[#dce5ef] px-5 text-[14px] font-semibold last:border-r-0 ${view === item ? 'bg-[#eef5f9] text-[#2187a8]' : 'text-[#71839e] hover:bg-[#f8fafc]'}`} key={item} onClick={() => setView(item)} type="button">{item}</button>)}</div><button aria-label="Previous month" className="grid size-[42px] place-items-center rounded-xl border border-[#dce5ef] text-[#71839e] hover:bg-[#f8fafc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8]" type="button"><AdminIcon className="size-4 rotate-180" name="chevronRight" /></button><button className="text-[14px] font-bold text-[#2187a8] hover:text-[#096d91] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8]" type="button">{content.controls.todayLabel}</button><button aria-label="Next month" className="grid size-[42px] place-items-center rounded-xl border border-[#dce5ef] text-[#71839e] hover:bg-[#f8fafc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8]" type="button"><AdminIcon className="size-4" name="chevronRight" /></button></div><div className="flex flex-wrap gap-3"><label className="flex h-[42px] min-w-[230px] items-center gap-3 rounded-xl border border-[#dce5ef] bg-[#f9fbfd] px-4 text-[#9badc5] focus-within:border-[#2187a8] focus-within:ring-2 focus-within:ring-[#2187a8]/20"><AdminIcon className="size-5" name="search" /><span className="sr-only">Search appointments</span><input className="min-w-0 flex-1 bg-transparent text-[14px] text-[#182238] outline-none placeholder:text-[#a9b7c9]" onChange={(event) => setQuery(event.target.value)} placeholder={content.controls.searchPlaceholder} type="search" value={query} /></label><label className="flex h-[42px] items-center gap-2 rounded-xl border border-[#dce5ef] bg-white px-3 text-[#71839e]"><AdminIcon className="size-4" name="filter" /><span className="sr-only">Filter by doctor</span><select className="bg-transparent pr-1 text-[14px] font-medium outline-none" onChange={(event) => setDoctor(event.target.value)} value={doctor}>{doctors.map((item) => <option key={item}>{item}</option>)}</select></label></div></div><div className="overflow-x-auto"><CalendarGrid content={content} createdAppointments={createdAppointments} doctor={doctor} query={query} /></div></Card><CalendarFooter footer={content.footer} /></main>{isCreateOpen ? <NewAppointmentDialog content={content} doctors={doctors.filter((item) => item !== content.controls.allDoctors)} onClose={() => setCreateOpen(false)} onCreate={(appointment) => createAppointmentMutation.mutate(appointment, { onSuccess: (createdAppointment) => { setCreatedAppointments((items) => [...items, createdAppointment]); setCreateOpen(false); } })} /> : null}</>;
}

function CalendarSkeleton() { return <main aria-busy="true" aria-label="Loading appointment calendar" className="min-h-screen bg-[#f6f8fb] p-7 lg:p-11"><div className="h-10 w-72 animate-pulse rounded bg-[#e7edf3]" /><div className="mt-9 h-[720px] animate-pulse rounded-[32px] bg-white" /></main>; }
function CalendarUnavailable({ onRetry }: { onRetry: () => void }) { return <main className="grid min-h-screen place-items-center bg-[#f6f8fb] p-6"><Card className="max-w-md p-8 text-center"><h1 className="text-2xl font-bold text-[#182238]">Calendar is unavailable</h1><p className="mt-3 text-[#71839e]">Please refresh and try again.</p><Button className="mt-6" onClick={onRetry}>Retry</Button></Card></main>; }

export function AdminCalendarPage() { const { data, isError, isLoading, refetch } = useAdminCalendarPageQuery(); if (isLoading) return <CalendarSkeleton />; if (isError || !data || data.calendar.days.length === 0) return <CalendarUnavailable onRetry={() => void refetch()} />; return <div className="min-h-screen bg-[#f6f8fb] lg:flex"><AdminSidebar activeLabel="Calendar" brand={data.brand} navigation={data.navigation} /><CalendarContent content={data} /></div>; }
