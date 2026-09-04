import { createBrowserRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AboutPage } from '@/features/about-page/AboutPage';
import { AdminLoginPage } from '@/features/admin-login-page/AdminLoginPage';
import { AdminInboxPage } from '@/features/admin-inbox-page/AdminInboxPage';
import { AdminDashboardPage } from '@/features/admin-dashboard-page/AdminDashboardPage';
import { AdminCalendarPage } from '@/features/admin-calendar-page/AdminCalendarPage';
import { AdminAllAppointmentsPage } from '@/features/admin-all-appointments-page/AdminAllAppointmentsPage';
import { AdminServiceDetailPage } from '@/features/admin-service-detail-page/AdminServiceDetailPage';
import { AdminServiceCreatePage } from '@/features/admin-service-create-page/AdminServiceCreatePage';
import { AdminServicesPage } from '@/features/admin-services-page/AdminServicesPage';
import { AdminDoctorsPage } from '@/features/admin-doctors-page/AdminDoctorsPage';
import { AdminAddDoctorPage } from '@/features/admin-add-doctor-page/AdminAddDoctorPage';
import { AdminShowcasePage } from '@/features/admin-showcase-page/AdminShowcasePage';
import { AdminAddShowcasePage } from '@/features/admin-add-showcase-page/AdminAddShowcasePage';
import { AdminClinicInfoPage } from '@/features/admin-clinic-info-page/AdminClinicInfoPage';
import { BookAppointmentPage } from '@/features/book-appointment-page/BookAppointmentPage';
import { BranchesPage } from '@/features/branches-page/BranchesPage';
import { ContactPage } from '@/features/contact-page/ContactPage';
import { DoctorDetailPage } from '@/features/doctor-detail-page/DoctorDetailPage';
import { DoctorsPage } from '@/features/doctors-page/DoctorsPage';
import { LandingPage } from '@/features/landing-page/LandingPage';
import { ServiceDetailPage } from '@/features/service-detail-page/ServiceDetailPage';
import { ServicesPage } from '@/features/services-page/ServicesPage';
import { RedirectAuthenticatedAdmin, RequireAdminRoute } from '@/features/admin-auth/admin-route-guard';

const protectedAdminRoute = (element: ReactNode) => (
  <RequireAdminRoute>{element}</RequireAdminRoute>
);

export const router = createBrowserRouter([
  {
    path: '/admin/login',
    element: <RedirectAuthenticatedAdmin><AdminLoginPage /></RedirectAuthenticatedAdmin>,
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
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/services',
    element: <ServicesPage />,
  },
  {
    path: '/services/:serviceSlug',
    element: <ServiceDetailPage />,
  },
  {
    path: '/doctors',
    element: <DoctorsPage />,
  },
  {
    path: '/doctors/:doctorSlug',
    element: <DoctorDetailPage />,
  },
  {
    path: '/branches',
    element: <BranchesPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },
  {
    path: '/book-appointment',
    element: <BookAppointmentPage />,
  },
  {
    path: '*',
    element: <LandingPage />,
  },
]);
