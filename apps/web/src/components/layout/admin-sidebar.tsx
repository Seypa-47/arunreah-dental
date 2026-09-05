import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminNavigation } from '@/features/admin-auth/admin-navigation';
import { useAdminSession } from '@/features/admin-auth/session-provider';
import type { AdminNavIcon } from '@/services/admin-inbox';

export type AdminIconName =
  | AdminNavIcon
  | 'calendarCheck'
  | 'check'
  | 'chevronDown'
  | 'chevronRight'
  | 'clock'
  | 'eye'
  | 'filter'
  | 'heart'
  | 'info'
  | 'lock'
  | 'search'
  | 'shield'
  | 'smile'
  | 'star'
  | 'upload'
  | 'userAdd'
  | 'utensils';

type AdminNavigationItem = {
  icon: AdminNavIcon;
  label: string;
  section?: 'appointments' | 'services' | 'doctors' | 'clinic';
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
  if (label === 'Services' || label === 'Service Management') return '/admin/services';
  if (label === 'Doctors' || label === 'Doctor Management') return '/admin/doctors';
  if (label === 'Add New Doctor') return '/admin/doctors/new';
  if (label === 'Showcase') return '/admin/showcase';
  if (label === 'Clinic Info' || label === 'Clinic Settings') return '/admin/clinic-info';
  if (label === 'Branches / Locations') return '/admin/clinic-info/branches';
  if (label === 'Contact Settings') return '/admin/clinic-info/contact';
  if (label === 'Admin Management') return '/admin/admins';
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
    eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
    filter: <><path d="M4 7h16M4 12h16M4 17h16" /><circle cx="9" cy="7" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="11" cy="17" r="1.5" /></>,
    heart: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
    inbox: <><path d="M5 7h14l1 11H4L5 7Z" /><path d="M4.5 14h4l1 2h5l1-2h4" /></>,
    info: <><circle cx="12" cy="12" r="8" /><path d="M12 11v4M12 8.2v.2" /></>,
    lock: <><path d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10" /><path d="M6 10h12v10H6z" /></>,
    search: <><circle cx="10.7" cy="10.7" r="5.7" /><path d="m15 15 4.2 4.2" /></>,
    services: <><path d="m8 7 1.7-2.5 2.3 2.3 2.3-2.3L16 7" /><path d="M4.5 17.5h15M6.5 17.5 8 9h8l1.5 8.5" /><path d="M10.5 12.5h3" /></>,
    shield: <path d="M12 3.5 5.5 6v4.6c0 4.3 2.7 7.6 6.5 9.4 3.8-1.8 6.5-5.1 6.5-9.4V6L12 3.5Z" />,
    showcase: <><rect height="13" rx="1" width="15" x="4.5" y="5.5" /><path d="m6.5 15 3.5-3.5 2.5 2.4 2-1.7 3 2.8M8 9h.01" /></>,
    smile: <><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><circle cx="9" cy="9" r="1" /><circle cx="15" cy="9" r="1" /></>,
    star: <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    upload: <><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /><polyline points="16 8 12 4 8 8" /><line x1="12" y1="4" x2="12" y2="16" /></>,
    userAdd: <><circle cx="10" cy="8" r="3" /><path d="M4.5 19v-1a5.5 5.5 0 0 1 9.3-4M17.5 10v6M14.5 13h6" /></>,
    utensils: <><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" /><path d="M15 2v14" /><path d="M15 16a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="9" y1="2" x2="9" y2="6" /><line x1="6" y1="2" x2="6" y2="6" /><path d="M6 6a3 3 0 0 0 3 3 3 3 0 0 0 3-3V2" /></>,
  };

  return <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">{paths[name]}</svg>;
}

export function AdminSidebar({ activeLabel, brand, navigation }: AdminSidebarProps) {
  const { admin, isLoggingOut, logout } = useAdminSession();
  const navigate = useNavigate();
  const [logoutFailed, setLogoutFailed] = useState(false);
  const effectiveNavigation = admin ? getAdminNavigation(admin.role) : navigation;
  const hasActiveAppointmentItem = effectiveNavigation.some(
    (item) => item.section === 'appointments' && item.label !== 'Appointments' && item.label === activeLabel,
  );
  const [appointmentsExpanded, setAppointmentsExpanded] = useState(hasActiveAppointmentItem);
  const hasActiveServiceItem = effectiveNavigation.some(
    (item) => item.section === 'services' && item.label !== 'Services' && item.label === activeLabel,
  );
  const [servicesExpanded, setServicesExpanded] = useState(hasActiveServiceItem);
  const hasActiveDoctorItem =
    activeLabel === 'Doctors' ||
    activeLabel === 'Doctor Management' ||
    activeLabel === 'Add New Doctor' ||
    effectiveNavigation.some(
      (item) => item.section === 'doctors' && item.label === activeLabel,
    );
  const [doctorsExpanded, setDoctorsExpanded] = useState(hasActiveDoctorItem);
  const hasActiveClinicItem =
    activeLabel === 'Clinic Info' ||
    activeLabel === 'Clinic Settings' ||
    activeLabel === 'Branches / Locations' ||
    activeLabel === 'Contact Settings' ||
    effectiveNavigation.some(
      (item) => item.section === 'clinic' && item.label === activeLabel,
    );
  const [clinicInfoExpanded, setClinicInfoExpanded] = useState(hasActiveClinicItem);
  const primaryNavigation = effectiveNavigation.filter(
    (item) =>
      !item.section ||
      item.label === 'Appointments' ||
      item.label === 'Services' ||
      item.label === 'Doctors' ||
      item.label === 'Clinic Info',
  );
  const appointmentNavigation = effectiveNavigation.filter((item) => item.section === 'appointments' && item.label !== 'Appointments');
  const serviceNavigation = effectiveNavigation.filter((item) => item.section === 'services' && item.label !== 'Services');
  const rawDoctorNav = effectiveNavigation.filter(
    (item) => item.section === 'doctors' && item.label !== 'Doctors' && item.label !== 'Specializations',
  );
  const defaultDoctorNavigation: AdminNavigationItem[] = [
    { icon: 'doctors', label: 'Doctor Management', section: 'doctors' },
    { icon: 'doctors', label: 'Add New Doctor', section: 'doctors' },
  ];
  const doctorNavigation = rawDoctorNav.length > 0 ? rawDoctorNav : defaultDoctorNavigation;
  const rawClinicNav = effectiveNavigation.filter((item) => item.section === 'clinic' && item.label !== 'Clinic Info');
  const defaultClinicNavigation: AdminNavigationItem[] = [
    { icon: 'clinicInfo', label: 'Clinic Settings', section: 'clinic' },
    { icon: 'clinicInfo', label: 'Branches / Locations', section: 'clinic' },
    { icon: 'clinicInfo', label: 'Contact Settings', section: 'clinic' },
  ];
  const clinicNavigation = rawClinicNav.length > 0 ? rawClinicNav : defaultClinicNavigation;

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[#e1e8f0] bg-white px-5 py-5 lg:min-h-screen lg:w-[302px] lg:border-b-0 lg:border-r lg:px-7 lg:py-7">
      <a aria-label="Arunreah Dental Clinic admin home" className="mx-2 inline-flex w-fit" href="/admin/dashboard">
        <img alt={brand.logoAlt} className="h-auto w-[168px] max-w-full" src={brand.logoUrl} />
      </a>
      <nav aria-label="Admin navigation" className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:mt-11 lg:block">
        {primaryNavigation.map((item) => {
          const isActive =
            item.label === activeLabel ||
            (item.label === 'Services' && (activeLabel === 'Services' || activeLabel === 'Service Management')) ||
            (item.label === 'Doctors' && (activeLabel === 'Doctors' || activeLabel === 'Doctor Management'));
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

          if (item.label === 'Services' && serviceNavigation.length > 0) {
            return (
              <div className="col-span-2 sm:col-span-1 lg:col-auto" key={item.label}>
                <button
                  aria-expanded={servicesExpanded}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold transition hover:bg-[#f4f8fb] hover:text-[#2187a8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8] ${hasActiveServiceItem ? 'text-[#2187a8]' : 'text-[#71839e]'}`}
                  onClick={() => setServicesExpanded((expanded) => !expanded)}
                  type="button"
                >
                  <AdminIcon className="size-5 shrink-0" name={item.icon} />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <AdminIcon className={`size-4 transition ${servicesExpanded ? 'rotate-180' : ''}`} name="chevronDown" />
                </button>
                {servicesExpanded ? (
                  <div className="mt-1 space-y-1 lg:ml-4">
                    {serviceNavigation.map((subItem) => {
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
                          <span className="min-w-0 flex-1 truncate">{subItem.label}</span>
                        </a>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          }

          if (item.label === 'Doctors') {
            return (
              <div className="col-span-2 sm:col-span-1 lg:col-auto" key={item.label}>
                <button
                  aria-expanded={doctorsExpanded}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold transition hover:bg-[#f4f8fb] hover:text-[#2187a8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8] ${
                    hasActiveDoctorItem ? 'text-[#2187a8]' : 'text-[#71839e]'
                  }`}
                  onClick={() => setDoctorsExpanded((expanded) => !expanded)}
                  type="button"
                >
                  <AdminIcon className="size-5 shrink-0" name={item.icon} />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <AdminIcon
                    className={`size-4 transition ${doctorsExpanded ? 'rotate-180' : ''}`}
                    name="chevronDown"
                  />
                </button>
                {doctorsExpanded ? (
                  <div className="mt-1 space-y-1 lg:ml-4">
                    {doctorNavigation.map((subItem) => {
                      const isSubItemActive =
                        subItem.label === activeLabel ||
                        (subItem.label === 'Doctor Management' && activeLabel === 'Doctors');
                      const subItemHref = routeForNavigation(subItem.label);

                      return (
                        <a
                          aria-current={isSubItemActive ? 'page' : undefined}
                          className={`flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8] ${
                            isSubItemActive
                              ? 'bg-[#edf7fb] text-[#2187a8] font-bold'
                              : 'text-[#71839e] hover:bg-[#f4f8fb] hover:text-[#2187a8]'
                          }`}
                          href={subItemHref}
                          key={subItem.label}
                          onClick={(event) => {
                            if (subItemHref === '#') event.preventDefault();
                          }}
                        >
                          <span className="min-w-0 flex-1 truncate">{subItem.label}</span>
                        </a>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          }

          if (item.label === 'Clinic Info') {
            return (
              <div className="col-span-2 sm:col-span-1 lg:col-auto" key={item.label}>
                <button
                  aria-expanded={clinicInfoExpanded}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold transition hover:bg-[#f4f8fb] hover:text-[#2187a8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8] ${
                    hasActiveClinicItem ? 'text-[#2187a8]' : 'text-[#71839e]'
                  }`}
                  onClick={() => setClinicInfoExpanded((expanded) => !expanded)}
                  type="button"
                >
                  <AdminIcon className="size-5 shrink-0" name={item.icon} />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <AdminIcon
                    className={`size-4 transition ${clinicInfoExpanded ? 'rotate-180' : ''}`}
                    name="chevronDown"
                  />
                </button>
                {clinicInfoExpanded ? (
                  <div className="mt-1 space-y-1 lg:ml-4">
                    {clinicNavigation.map((subItem) => {
                      const isSubItemActive =
                        subItem.label === activeLabel ||
                        (subItem.label === 'Clinic Settings' &&
                          (activeLabel === 'Clinic Info' || activeLabel === 'Clinic Settings'));
                      const subItemHref = routeForNavigation(subItem.label);

                      return (
                        <a
                          aria-current={isSubItemActive ? 'page' : undefined}
                          className={`flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2187a8] ${
                            isSubItemActive
                              ? 'bg-[#edf7fb] text-[#2187a8] font-bold'
                              : 'text-[#71839e] hover:bg-[#f4f8fb] hover:text-[#2187a8]'
                          }`}
                          href={subItemHref}
                          key={subItem.label}
                          onClick={(event) => {
                            if (subItemHref === '#') event.preventDefault();
                          }}
                        >
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
      {logoutFailed ? (
        <p aria-live="polite" className="mt-5 px-3 text-sm text-[#c92727]" role="alert">
          We could not sign you out. Please try again.
        </p>
      ) : null}
      <button
        className="mt-7 flex items-center gap-3 px-3 py-2.5 text-left text-[14px] font-semibold text-[#ed3838] transition hover:text-[#c92727] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ed3838] disabled:cursor-not-allowed disabled:opacity-60 lg:mt-auto"
        disabled={isLoggingOut}
        onClick={() => {
          setLogoutFailed(false);
          void logout()
            .then(() => navigate('/admin/login', { replace: true }))
            .catch(() => setLogoutFailed(true));
        }}
        type="button"
      >
        <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M10 17 15 12l-5-5M15 12H3" /><path d="M13 5h5v14h-5" /></svg>
        {isLoggingOut ? 'Signing out…' : 'Logout'}
      </button>
    </aside>
  );
}
