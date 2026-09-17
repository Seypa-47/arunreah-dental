import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense, type ReactNode } from 'react';
import '@/styles/admin.css';
import { LandingPage } from '@/features/landing-page/LandingPage';
import { RedirectAuthenticatedAdmin, RequireAdminRoute } from '@/features/admin-auth/admin-route-guard';

const AboutPage = lazy(() => import('@/features/about-page/AboutPage').then(({ AboutPage: Page }) => ({ default: Page })));
const AdminLoginPage = lazy(() => import('@/features/admin-login-page/AdminLoginPage').then(({ AdminLoginPage: Page }) => ({ default: Page })));
const AdminInboxPage = lazy(() => import('@/features/admin-inbox-page/AdminInboxPage').then(({ AdminInboxPage: Page }) => ({ default: Page })));
const AdminDashboardPage = lazy(() => import('@/features/admin-dashboard-page/AdminDashboardPage').then(({ AdminDashboardPage: Page }) => ({ default: Page })));
const AdminCalendarPage = lazy(() => import('@/features/admin-calendar-page/AdminCalendarPage').then(({ AdminCalendarPage: Page }) => ({ default: Page })));
const AdminAllAppointmentsPage = lazy(() => import('@/features/admin-all-appointments-page/AdminAllAppointmentsPage').then(({ AdminAllAppointmentsPage: Page }) => ({ default: Page })));
const AdminServiceDetailPage = lazy(() => import('@/features/admin-service-detail-page/AdminServiceDetailPage').then(({ AdminServiceDetailPage: Page }) => ({ default: Page })));
const AdminServiceCreatePage = lazy(() => import('@/features/admin-service-create-page/AdminServiceCreatePage').then(({ AdminServiceCreatePage: Page }) => ({ default: Page })));
const AdminServicesPage = lazy(() => import('@/features/admin-services-page/AdminServicesPage').then(({ AdminServicesPage: Page }) => ({ default: Page })));
const AdminDoctorsPage = lazy(() => import('@/features/admin-doctors-page/AdminDoctorsPage').then(({ AdminDoctorsPage: Page }) => ({ default: Page })));
const AdminAddDoctorPage = lazy(() => import('@/features/admin-add-doctor-page/AdminAddDoctorPage').then(({ AdminAddDoctorPage: Page }) => ({ default: Page })));
const AdminShowcasePage = lazy(() => import('@/features/admin-showcase-page/AdminShowcasePage').then(({ AdminShowcasePage: Page }) => ({ default: Page })));
const AdminAddShowcasePage = lazy(() => import('@/features/admin-add-showcase-page/AdminAddShowcasePage').then(({ AdminAddShowcasePage: Page }) => ({ default: Page })));
const AdminClinicInfoPage = lazy(() => import('@/features/admin-clinic-info-page/AdminClinicInfoPage').then(({ AdminClinicInfoPage: Page }) => ({ default: Page })));
const AdminManagementPage = lazy(() => import('@/features/admin-management-page/AdminManagementPage').then(({ AdminManagementPage: Page }) => ({ default: Page })));
const AdminPageMediaPage = lazy(() => import('@/features/admin-page-media-page/AdminPageMediaPage').then(({ AdminPageMediaPage: Page }) => ({ default: Page })));
const AdminAboutTimelinePage = lazy(() => import('@/features/admin-about-timeline-page/AdminAboutTimelinePage').then(({ AdminAboutTimelinePage: Page }) => ({ default: Page })));
const BookAppointmentPage = lazy(() => import('@/features/book-appointment-page/BookAppointmentPage').then(({ BookAppointmentPage: Page }) => ({ default: Page })));
const BranchesPage = lazy(() => import('@/features/branches-page/BranchesPage').then(({ BranchesPage: Page }) => ({ default: Page })));
const ContactPage = lazy(() => import('@/features/contact-page/ContactPage').then(({ ContactPage: Page }) => ({ default: Page })));
const DoctorDetailPage = lazy(() => import('@/features/doctor-detail-page/DoctorDetailPage').then(({ DoctorDetailPage: Page }) => ({ default: Page })));
const DoctorsPage = lazy(() => import('@/features/doctors-page/DoctorsPage').then(({ DoctorsPage: Page }) => ({ default: Page })));
const ServiceDetailPage = lazy(() => import('@/features/service-detail-page/ServiceDetailPage').then(({ ServiceDetailPage: Page }) => ({ default: Page })));
const ServicesPage = lazy(() => import('@/features/services-page/ServicesPage').then(({ ServicesPage: Page }) => ({ default: Page })));
const ShowcasesPage = lazy(() => import('@/features/showcases-page/ShowcasesPage').then(({ ShowcasesPage: Page }) => ({ default: Page })));
const ShowcaseDetailPage = lazy(() => import('@/features/showcase-detail-page/ShowcaseDetailPage').then(({ ShowcaseDetailPage: Page }) => ({ default: Page })));
const PublicNotFoundPage = lazy(() => import('@/features/public-content/PublicNotFoundPage').then(({ PublicNotFoundPage: Page }) => ({ default: Page })));

const protectedAdminRoute = (element: ReactNode) => (
  <div className="admin-ui"><RequireAdminRoute><RouteLoadingBoundary>{element}</RouteLoadingBoundary></RequireAdminRoute></div>
);

function RouteLoadingBoundary({ children }: { children: ReactNode }) {
  return <Suspense fallback={<main aria-busy="true" className="admin-state-page"><span className="sr-only">Loading page</span></main>}>{children}</Suspense>;
}

const lazyPublicRoute = (element: ReactNode) => <RouteLoadingBoundary>{element}</RouteLoadingBoundary>;

export const router = createBrowserRouter([
  {
    path: '/admin/login',
    element: <div className="admin-ui"><RedirectAuthenticatedAdmin><RouteLoadingBoundary><AdminLoginPage /></RouteLoadingBoundary></RedirectAuthenticatedAdmin></div>,
  },
  {
    path: '/admin/dashboard',
    element: protectedAdminRoute(<AdminDashboardPage />),
  },
  {
    path: '/admin/appointments/calendar',
    element: protectedAdminRoute(<AdminCalendarPage />),
  },
  {
    path: '/admin/calendar',
    element: protectedAdminRoute(<AdminCalendarPage />),
  },
  {
    path: '/admin/appointments',
    element: protectedAdminRoute(<AdminAllAppointmentsPage />),
  },
  {
    path: '/admin/appointments/inbox',
    element: protectedAdminRoute(<AdminInboxPage />),
  },
  {
    path: '/admin/services',
    element: protectedAdminRoute(<AdminServicesPage />),
  },
  {
    path: '/admin/services/new',
    element: protectedAdminRoute(<AdminServiceCreatePage />),
  },
  {
    path: '/admin/services/:serviceId/edit',
    element: protectedAdminRoute(<AdminServiceDetailPage />),
  },
  {
    path: '/admin/doctors/new',
    element: protectedAdminRoute(<AdminAddDoctorPage />),
  },
  {
    path: '/admin/doctors',
    element: protectedAdminRoute(<AdminDoctorsPage />),
  },
  {
    path: '/admin/showcase/new',
    element: protectedAdminRoute(<AdminAddShowcasePage />),
  },
  {
    path: '/admin/showcase',
    element: protectedAdminRoute(<AdminShowcasePage />),
  },
  {
    path: '/admin/showcases',
    element: protectedAdminRoute(<AdminShowcasePage />),
  },
  {
    path: '/admin/clinic-info',
    element: protectedAdminRoute(<AdminClinicInfoPage initialTab="clinic" />),
  },
  {
    path: '/admin/clinic-info/branches',
    element: protectedAdminRoute(<AdminClinicInfoPage initialTab="branches" />),
  },
  {
    path: '/admin/clinic-info/contact',
    element: protectedAdminRoute(<AdminClinicInfoPage initialTab="contact" />),
  },
  {
    path: '/admin/admins',
    element: protectedAdminRoute(<AdminManagementPage />),
  },
  {
    path: '/admin/page-media',
    element: protectedAdminRoute(<AdminPageMediaPage />),
  },
  {
    path: '/admin/about-timeline',
    element: protectedAdminRoute(<AdminAboutTimelinePage />),
  },
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/about',
    element: lazyPublicRoute(<AboutPage />),
  },
  {
    path: '/services',
    element: lazyPublicRoute(<ServicesPage />),
  },
  {
    path: '/services/:serviceSlug',
    element: lazyPublicRoute(<ServiceDetailPage />),
  },
  {
    path: '/doctors',
    element: lazyPublicRoute(<DoctorsPage />),
  },
  {
    path: '/doctors/:doctorSlug',
    element: lazyPublicRoute(<DoctorDetailPage />),
  },
  {
    path: '/branches',
    element: lazyPublicRoute(<BranchesPage />),
  },
  {
    path: '/showcases',
    element: lazyPublicRoute(<ShowcasesPage />),
  },
  {
    path: '/showcases/:showcaseSlug',
    element: lazyPublicRoute(<ShowcaseDetailPage />),
  },
  {
    path: '/contact',
    element: lazyPublicRoute(<ContactPage />),
  },
  {
    path: '/book-appointment',
    element: lazyPublicRoute(<BookAppointmentPage />),
  },
  {
    path: '*',
    element: lazyPublicRoute(<PublicNotFoundPage />),
  },
]);
