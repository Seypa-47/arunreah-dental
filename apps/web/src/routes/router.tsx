import { createBrowserRouter } from 'react-router-dom';
import { AboutPage } from '@/features/about-page/AboutPage';
import { BranchesPage } from '@/features/branches-page/BranchesPage';
import { ContactPage } from '@/features/contact-page/ContactPage';
import { DoctorDetailPage } from '@/features/doctor-detail-page/DoctorDetailPage';
import { DoctorsPage } from '@/features/doctors-page/DoctorsPage';
import { LandingPage } from '@/features/landing-page/LandingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
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
    path: '*',
    element: <LandingPage />,
  },
]);
