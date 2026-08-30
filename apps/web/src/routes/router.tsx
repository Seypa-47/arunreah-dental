import { createBrowserRouter } from 'react-router-dom';

function DevelopmentPlaceholder() {
  return (
    <main className="p-6 font-sans">
      <h1>Arunreah Dental Clinic</h1>
      <p>Development Environment Ready</p>
    </main>
  );
}

export const router = createBrowserRouter([
  {
    path: '*',
    element: <DevelopmentPlaceholder />,
  },
]);
