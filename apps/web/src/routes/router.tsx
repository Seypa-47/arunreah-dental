import { createBrowserRouter } from 'react-router-dom';
import { DoctorDetailPage } from '@/features/doctor-detail-page/DoctorDetailPage';
import { DoctorsPage } from '@/features/doctors-page/DoctorsPage';
import { LandingPage } from '@/features/landing-page/LandingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
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
    path: '*',
    element: <LandingPage />,
  },
]);
