import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminSession } from '@/features/admin-auth/session-provider';
import { getAdminNavigationGroups, isAdminNavigationActive } from '@/features/admin-auth/admin-page-navigation';
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

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { admin, isLoggingOut, logout } = useAdminSession();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [logoutFailed, setLogoutFailed] = useState(false);
  if (!admin) return null;
  const groups = getAdminNavigationGroups(admin.role);
  return <aside className="admin-sidebar">
    <nav aria-label="Admin navigation">
      {groups.map((group) => <section className="admin-nav-group" key={group.label} aria-label={group.label}>
        <p className="admin-nav-group-label" data-active={group.items.some((item) => isAdminNavigationActive(pathname, item.to))}>{group.label}</p>
        <ul>{group.items.map((item) => {
          const active = isAdminNavigationActive(pathname, item.to);
          return <li key={item.to}><Link className="admin-nav-link" aria-current={active ? (pathname === item.to ? 'page' : 'location') : undefined} to={item.to} onClick={onNavigate}>
            <AdminIcon className="size-5 shrink-0" name={item.icon} /><span>{item.label}</span>
          </Link></li>;
        })}</ul>
      </section>)}
    </nav>
    <div className="admin-sidebar-footer">
      {logoutFailed ? <p role="alert">We could not sign you out. Please try again.</p> : null}
      <button type="button" disabled={isLoggingOut} onClick={() => {
        setLogoutFailed(false);
        void logout().then(() => navigate('/admin/login', { replace: true })).catch(() => setLogoutFailed(true));
      }}>{isLoggingOut ? 'Signing out…' : 'Sign out'}</button>
    </div>
  </aside>;
}
