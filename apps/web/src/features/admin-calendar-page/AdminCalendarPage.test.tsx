import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import {
  DayView,
  MonthView,
  NewAppointmentDialog,
  WeekView,
  formatDateKey,
  getWeekDays,
  parseDateKey,
} from './AdminCalendarPage';
import type { AdminCalendarContent, CalendarAppointmentItem } from '@/services/admin-calendar';

const mockAppointment: CalendarAppointmentItem = {
  branchName: 'TTP Branch',
  doctor: 'Dr. Chuong Kunthy',
  email: 'hongthan@example.com',
  id: 'appt-1',
  label: 'Hong Than Brathna - Dental Implants',
  patientName: 'Hong Than Brathna',
  phone: '012 345 678',
  reference: 'AR-2026-001',
  serviceName: 'Dental Implants',
  status: 'PENDING',
  time: '04:00 PM',
  tone: 'orange',
};

const mockDoctor2Appointment: CalendarAppointmentItem = {
  branchName: 'Old Market Branch',
  doctor: 'Dr. Chho Sonthary',
  email: 'sokha@example.com',
  id: 'appt-2',
  label: 'Sokha Mean - Routine Cleaning',
  patientName: 'Sokha Mean',
  phone: '098 765 432',
  reference: 'AR-2026-002',
  serviceName: 'Routine Cleaning',
  status: 'CONFIRMED',
  time: '10:00 AM',
  tone: 'blue',
};

const mockContent: AdminCalendarContent = {
  brand: { logoAlt: 'Arunreah', logoUrl: '/logo.png' },
  calendar: {
    days: [
      {
        appointments: [mockAppointment, mockDoctor2Appointment],
        day: 12,
        isCurrentDay: false,
        isOutsideMonth: false,
        key: '2026-09-12',
      },
    ],
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  controls: {
    allDoctors: 'All Doctors',
    month: 9,
    monthLabel: 'September 2026',
    newAppointmentLabel: 'New Appointment',
    searchPlaceholder: 'Search appointments...',
    todayLabel: 'Today',
    views: ['Month', 'Week', 'Day'],
    year: 2026,
  },
  doctors: [
    'Dr. Chea Kimly',
    'Dr. Chho Sonthary',
    'Dr. Chuong Kunthy',
    'Dr. Heng Bunhabb',
    'Dr. Sreng Heng',
    'Dr. Taing Thanith',
    'Dr. Yim Delux',
  ],
  empty: { description: 'Try adjusting your filters.', title: 'No appointments found' },
  footer: { copyright: '© 2026 Arunreah', encryptionLabel: '256-bit', sslLabel: 'SSL' },
  header: { subtitle: 'Manage calendar', title: 'Calendar' },
  navigation: [],
  newAppointment: {
    cancelLabel: 'Cancel',
    dateLabel: 'Date',
    doctorLabel: 'Doctor',
    patientLabel: 'Patient name',
    saveLabel: 'Create Appointment',
    serviceLabel: 'Service',
    services: ['Routine Cleaning', 'Dental Implants', 'Teeth Whitening'],
    timeLabel: 'Time',
    title: 'New Appointment',
  },
};

describe('AdminCalendarPage Date Utilities', () => {
  it('formatDateKey formats YYYY-MM-DD correctly', () => {
    expect(formatDateKey(new Date(2026, 8, 12))).toBe('2026-09-12');
    expect(formatDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('parseDateKey parses YYYY-MM-DD into a valid Date', () => {
    const d = parseDateKey('2026-09-12');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(8); // 0-indexed September
    expect(d.getDate()).toBe(12);
  });

  it('getWeekDays returns 7 consecutive days starting on Sunday', () => {
    const d = new Date(2026, 8, 12); // Saturday, Sep 12, 2026
    const week = getWeekDays(d);
    expect(week).toHaveLength(7);
    expect(week[0]?.getDay()).toBe(0); // Sunday
    expect(formatDateKey(week[0]!)).toBe('2026-09-06');
    expect(formatDateKey(week[6]!)).toBe('2026-09-12');
  });
});

describe('AdminCalendarPage Views Rendering', () => {
  const allAppointmentsMap = new Map<string, CalendarAppointmentItem[]>([
    ['2026-09-12', [mockAppointment, mockDoctor2Appointment]],
  ]);

  it('renders MonthView with weekday headers and appointments', () => {
    const html = renderToStaticMarkup(
      <MonthView
        allAppointmentsMap={allAppointmentsMap}
        content={mockContent}
        doctor="All Doctors"
        filterAppointment={() => true}
        onSelectAppointment={vi.fn()}
        onSelectDate={vi.fn()}
        query=""
      />,
    );

    expect(html).toContain('Sun');
    expect(html).toContain('Sat');
    expect(html).toContain('12');
    expect(html).toContain('Hong Than Brathna');
    expect(html).toContain('04:00 PM');
  });

  it('renders WeekView with all 7 columns and appointments on Saturday Sep 12', () => {
    const html = renderToStaticMarkup(
      <WeekView
        allAppointmentsMap={allAppointmentsMap}
        filterAppointment={() => true}
        onSelectAppointment={vi.fn()}
        onSelectDate={vi.fn()}
        selectedDate={new Date(2026, 8, 12)}
      />,
    );

    expect(html).toContain('Sun');
    expect(html).toContain('Mon');
    expect(html).toContain('Sat');
    expect(html).toContain('Hong Than Brathna');
    expect(html).toContain('Dental Implants');
    expect(html).toContain('Dr. Chuong Kunthy');
    expect(html).toContain('04:00 PM');
  });

  it('renders DayView with detailed appointment card and doctor name', () => {
    const html = renderToStaticMarkup(
      <DayView
        allAppointmentsMap={allAppointmentsMap}
        filterAppointment={() => true}
        onNewAppointment={vi.fn()}
        onSelectAppointment={vi.fn()}
        selectedDate={new Date(2026, 8, 12)}
      />,
    );

    expect(html).toContain('Saturday, September 12, 2026');
    expect(html).toContain('2 appointments scheduled');
    expect(html).toContain('Hong Than Brathna');
    expect(html).toContain('Dr. Chuong Kunthy');
    expect(html).toContain('Dental Implants');
    expect(html).toContain('012 345 678');
    expect(html).toContain('AR-2026-001');
    expect(html).toContain('View Details');
  });

  it('renders DayView empty state when no appointments are scheduled', () => {
    const emptyMap = new Map<string, CalendarAppointmentItem[]>();
    const html = renderToStaticMarkup(
      <DayView
        allAppointmentsMap={emptyMap}
        filterAppointment={() => true}
        onNewAppointment={vi.fn()}
        onSelectAppointment={vi.fn()}
        selectedDate={new Date(2026, 8, 13)}
      />,
    );

    expect(html).toContain('No appointments scheduled');
    expect(html).toContain('Schedule Appointment');
  });
});

describe('NewAppointmentDialog Doctor List', () => {
  it('renders all real clinic doctors in the dropdown options', () => {
    const doctors = [
      'Any Doctor',
      'Dr. Chea Kimly',
      'Dr. Chho Sonthary',
      'Dr. Chuong Kunthy',
      'Dr. Heng Bunhabb',
      'Dr. Sreng Heng',
      'Dr. Taing Thanith',
      'Dr. Yim Delux',
    ];

    const html = renderToStaticMarkup(
      <NewAppointmentDialog
        content={mockContent}
        defaultDate="2026-09-12"
        doctors={doctors}
        onClose={vi.fn()}
        onCreate={vi.fn()}
      />,
    );

    expect(html).toContain('New Appointment');
    expect(html).toContain('Any Doctor');
    expect(html).toContain('Dr. Chea Kimly');
    expect(html).toContain('Dr. Sreng Heng');
    expect(html).toContain('Dr. Taing Thanith');
    expect(html).toContain('Dr. Yim Delux');
    expect(html).toContain('Dr. Chuong Kunthy');
    expect(html).toContain('Dr. Chho Sonthary');
    expect(html).toContain('Dr. Heng Bunhabb');
  });
});
