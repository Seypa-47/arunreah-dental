import { createBrowserRouter } from 'react-router-dom';
import { LandingPage } from '@/features/landing-page/LandingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '*',
    element: <LandingPage />,
  },
]);
