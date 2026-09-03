import { createBrowserRouter } from 'react-router-dom';
import { AboutPage } from '@/features/about-page/AboutPage';
import { AdminLoginPage } from '@/features/admin-login-page/AdminLoginPage';
import { AdminInboxPage } from '@/features/admin-inbox-page/AdminInboxPage';
import { AdminDashboardPage } from '@/features/admin-dashboard-page/AdminDashboardPage';
import { AdminCalendarPage } from '@/features/admin-calendar-page/AdminCalendarPage';
import { AdminAllAppointmentsPage } from '@/features/admin-all-appointments-page/AdminAllAppointmentsPage';
import { AdminServiceDetailPage } from '@/features/admin-service-detail-page/AdminServiceDetailPage';
import { AdminServicesPage } from '@/features/admin-services-page/AdminServicesPage';
import { AdminDoctorsPage } from '@/features/admin-doctors-page/AdminDoctorsPage';
import { AdminAddDoctorPage } from '@/features/admin-add-doctor-page/AdminAddDoctorPage';
import { BookAppointmentPage } from '@/features/book-appointment-page/BookAppointmentPage';
import { BranchesPage } from '@/features/branches-page/BranchesPage';
import { ContactPage } from '@/features/contact-page/ContactPage';
import { DoctorDetailPage } from '@/features/doctor-detail-page/DoctorDetailPage';
import { DoctorsPage } from '@/features/doctors-page/DoctorsPage';
import { LandingPage } from '@/features/landing-page/LandingPage';
import { ServiceDetailPage } from '@/features/service-detail-page/ServiceDetailPage';
import { ServicesPage } from '@/features/services-page/ServicesPage';

export const router = createBrowserRouter([
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboardPage />,
  },
  {
    path: '/admin/appointments/calendar',
    element: <AdminCalendarPage />,
  },
  {
    path: '/admin/appointments',
    element: <AdminAllAppointmentsPage />,
  },
  {
    path: '/admin/appointments/inbox',
    element: <AdminInboxPage />,
  },
  {
    path: '/admin/services',
    element: <AdminServicesPage />,
  },
  {
    path: '/admin/services/:serviceId/edit',
    element: <AdminServiceDetailPage />,
  },
  {
    path: '/admin/doctors/new',
    element: <AdminAddDoctorPage />,
  },
  {
    path: '/admin/doctors',
    element: <AdminDoctorsPage />,
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
