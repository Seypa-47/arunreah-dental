import { useRef, useState, type PropsWithChildren } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AdminSidebar } from './admin-sidebar';
import { getAdminPageInfo } from '@/features/admin-auth/admin-page-navigation';
import { useAdminSession } from '@/features/admin-auth/session-provider';

export function AdminPageHeading() {
  const { pathname } = useLocation();
  const page = getAdminPageInfo(pathname);
  return <div className="admin-page-heading"><h1>{page.title}</h1><p className="admin-description">{page.description}</p></div>;
}

export function AdminWorkspace({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  const { admin } = useAdminSession();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const page = getAdminPageInfo(pathname);
  const open = openPath === pathname;
  const close = () => { setOpenPath(null); toggle.current?.focus(); };
  return <div className="admin-workspace" onKeyDown={(event) => { if (event.key === 'Escape' && open) { event.preventDefault(); close(); } }}>
    <a className="admin-skip" href="#admin-content" onClick={() => content.current?.focus()}>Skip to page content</a>
    <header className="admin-topbar">
      <button ref={toggle} type="button" className="admin-menu-toggle" aria-expanded={open} aria-controls="admin-sidebar" onClick={() => setOpenPath(open ? null : pathname)}>{open ? 'Close menu' : 'Menu'}</button>
      <Link className="admin-brand-name" to="/admin/dashboard">Arunreah <span>Admin CMS</span></Link>
      <span className="admin-role">{admin?.role === 'SUPER_ADMIN' ? 'Administrator' : admin?.role === 'CMS_ADMIN' ? 'Content editor' : 'Reception'}</span>
    </header>
    <div className="admin-workspace-body">
      <div id="admin-sidebar" className="admin-navigation-panel" data-open={open}>
        <AdminSidebar onNavigate={() => { setOpenPath(null); content.current?.focus(); }} />
      </div>
      <div className="admin-workspace-content" id="admin-content" ref={content} tabIndex={-1}>
        <nav aria-label="Breadcrumb" className="admin-breadcrumb"><ol>
          {pathname !== '/admin/dashboard' ? <li><Link to="/admin/dashboard">Dashboard</Link></li> : null}
          {page.parent ? <li><Link to={page.parent.to}>{page.parent.title}</Link></li> : null}
          <li><span aria-current="page">{page.title}</span></li>
        </ol></nav>
        {children}
      </div>
    </div>
  </div>;
}
