import { createBrowserRouter } from 'react-router-dom';
import { AboutPage } from '@/features/about-page/AboutPage';
import { AdminLoginPage } from '@/features/admin-login-page/AdminLoginPage';
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
