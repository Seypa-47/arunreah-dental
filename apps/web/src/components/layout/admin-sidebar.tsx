import { useState, type ReactNode } from 'react';
import type { AdminNavIcon } from '@/services/admin-inbox';

export type AdminIconName =
  | AdminNavIcon
  | 'calendarCheck'
  | 'check'
  | 'chevronDown'
  | 'chevronRight'
  | 'clock'
  | 'filter'
  | 'info'
  | 'lock'
  | 'search'
  | 'shield'
  | 'userAdd';

type AdminNavigationItem = {
  icon: AdminNavIcon;
  label: string;
  section?: 'appointments';
};

type AdminSidebarProps = {
  activeLabel: string;
  brand: {
    logoAlt: string;
    logoUrl: string;
  };
  navigation: AdminNavigationItem[];
};

const routeForNavigation = (label: string) => {
  if (label === 'Dashboard') return '/admin/dashboard';
  if (label === 'Inbox') return '/admin/appointments/inbox';
  if (label === 'Calendar') return '/admin/appointments/calendar';
  if (label === 'All Appointments') return '/admin/appointments';
  return '#';
};

export function AdminIcon({ className = 'size-5', name }: { className?: string; name: AdminIconName }) {
  const paths: Record<AdminIconName, ReactNode> = {
    appointments: <><path d="M8 5h8M8 3v4M16 3v4M5 9h14M6 5h12a1 1 0 0 1 1 1v13H5V6a1 1 0 0 1 1-1Z" /><path d="m9.25 14.25 1.75 1.75 3.75-4" /></>,
    calendar: <><path d="M8 5h8M8 3v4M16 3v4M5 9h14M6 5h12a1 1 0 0 1 1 1v13H5V6a1 1 0 0 1 1-1Z" /><path d="M8.5 12.5h.01M12 12.5h.01M15.5 12.5h.01M8.5 15.5h.01M12 15.5h.01" /></>,
    calendarCheck: <><path d="M8 5h8M8 3v4M16 3v4M5 9h14M6 5h12a1 1 0 0 1 1 1v13H5V6a1 1 0 0 1 1-1Z" /><path d="m9.25 14.25 1.75 1.75 3.75-4" /></>,
    check: <path d="m5 12 4.2 4.2L19 6.5" />,
    chevronDown: <path d="m7 10 5 5 5-5" />,
    chevronRight: <path d="m9 18 6-6-6-6" />,
    clinicInfo: <><circle cx="12" cy="12" r="8" /><path d="M12 10v5M12 7.4v.2" /></>,
    clock: <><circle cx="12" cy="12" r="8" /><path d="M12 7.5v4.8l3.1 1.8" /></>,
    dashboard: <><path d="M5 19V5M5 19h14" /><path d="m8 14 3-3 2.2 1.9L18 8" /></>,
    doctors: <><circle cx="12" cy="8" r="3" /><path d="M6 20v-1.4a5.6 5.6 0 0 1 12 0V20M4.5 14.5v-1.2a4 4 0 0 1 2.3-3.6M19.5 14.5v-1.2a4 4 0 0 0-2.3-3.6" /></>,
    filter: <><path d="M4 7h16M4 12h16M4 17h16" /><circle cx="9" cy="7" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="11" cy="17" r="1.5" /></>,
    inbox: <><path d="M5 7h14l1 11H4L5 7Z" /><path d="M4.5 14h4l1 2h5l1-2h4" /></>,
    info: <><circle cx="12" cy="12" r="8" /><path d="M12 11v4M12 8.2v.2" /></>,
    lock: <><path d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10" /><path d="M6 10h12v10H6z" /></>,
    search: <><circle cx="10.7" cy="10.7" r="5.7" /><path d="m15 15 4.2 4.2" /></>,
    services: <><path d="m8 7 1.7-2.5 2.3 2.3 2.3-2.3L16 7" /><path d="M4.5 17.5h15M6.5 17.5 8 9h8l1.5 8.5" /><path d="M10.5 12.5h3" /></>,
    shield: <path d="M12 3.5 5.5 6v4.6c0 4.3 2.7 7.6 6.5 9.4 3.8-1.8 6.5-5.1 6.5-9.4V6L12 3.5Z" />,
    showcase: <><rect height="13" rx="1" width="15" x="4.5" y="5.5" /><path d="m6.5 15 3.5-3.5 2.5 2.4 2-1.7 3 2.8M8 9h.01" /></>,
    userAdd: <><circle cx="10" cy="8" r="3" /><path d="M4.5 19v-1a5.5 5.5 0 0 1 9.3-4M17.5 10v6M14.5 13h6" /></>,
  };

  return <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">{paths[name]}</svg>;
}

export function AdminSidebar({ activeLabel, brand, navigation }: AdminSidebarProps) {
  const hasActiveAppointmentItem = navigation.some(
    (item) => item.section === 'appointments' && item.label !== 'Appointments' && item.label === activeLabel,
  );
  const [appointmentsExpanded, setAppointmentsExpanded] = useState(hasActiveAppointmentItem);
  const primaryNavigation = navigation.filter((item) => !item.section || item.label === 'Appointments');
  const appointmentNavigation = navigation.filter((item) => item.section === 'appointments' && item.label !== 'Appointments');

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[#e1e8f0] bg-white px-5 py-5 lg:min-h-screen lg:w-[302px] lg:border-b-0 lg:border-r lg:px-7 lg:py-7">
      <a aria-label="Arunreah Dental Clinic admin home" className="mx-2 inline-flex w-fit" href="/admin/dashboard">
        <img alt={brand.logoAlt} className="h-auto w-[168px] max-w-full" src={brand.logoUrl} />
      </a>
      <nav aria-label="Admin navigation" className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:mt-11 lg:block">
        {primaryNavigation.map((item) => {
          const isActive = item.label === activeLabel;
          const href = routeForNavigation(item.label);

          if (item.label === 'Appointments') {
            return (
              <div
                className="col-span-2 sm:col-span-1 lg:col-auto"
                key={item.label}
              >
                <button
                  aria-expanded={appointmentsExpanded}
                  className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold text-[#71839e] transition hover:bg-[#f4f8fb] hover:text-[#2187a8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8]"
                  onClick={() => setAppointmentsExpanded((expanded) => !expanded)}
                  type="button"
                >
                  <AdminIcon className="size-5 shrink-0" name={item.icon} />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <AdminIcon className={`size-4 transition ${appointmentsExpanded ? 'rotate-180' : ''}`} name="chevronDown" />
                </button>
                {appointmentsExpanded ? (
                  <div className="mt-1 space-y-1 lg:ml-4">
                    {appointmentNavigation.map((subItem) => {
                      const isSubItemActive = subItem.label === activeLabel;
                      const subItemHref = routeForNavigation(subItem.label);

                      return (
                        <a
                          aria-current={isSubItemActive ? 'page' : undefined}
                          className={`flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8] ${isSubItemActive ? 'bg-[#2187a8] text-white shadow-[0_6px_12px_rgba(33,135,168,0.14)]' : 'text-[#71839e] hover:bg-[#f4f8fb] hover:text-[#2187a8]'}`}
                          href={subItemHref}
                          key={subItem.label}
                          onClick={(event) => {
                            if (subItemHref === '#') event.preventDefault();
                          }}
                        >
                          <AdminIcon className="size-5 shrink-0" name={subItem.icon} />
                          <span className="min-w-0 flex-1 truncate">{subItem.label}</span>
                        </a>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          }

          return (
            <a
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8] ${isActive ? 'bg-[#2187a8] text-white shadow-[0_6px_12px_rgba(33,135,168,0.14)]' : 'text-[#71839e] hover:bg-[#f4f8fb] hover:text-[#2187a8]'}`}
              href={href}
              key={item.label}
              onClick={(event) => {
                if (href === '#') event.preventDefault();
              }}
            >
              <AdminIcon className="size-5 shrink-0" name={item.icon} />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </a>
          );
        })}
      </nav>
      <a className="mt-7 flex items-center gap-3 px-3 py-2.5 text-[14px] font-semibold text-[#ed3838] transition hover:text-[#c92727] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ed3838] lg:mt-auto" href="/admin/login">
        <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M10 17 15 12l-5-5M15 12H3" /><path d="M13 5h5v14h-5" /></svg>
        Logout
      </a>
    </aside>
  );
}
