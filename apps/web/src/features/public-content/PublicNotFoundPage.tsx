import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';

export function PublicNotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <p className="text-sm font-bold text-[#3695B9]">404</p>
        <h1 className="mt-3 text-3xl font-black text-[#005687]">Page not found</h1>
        <p className="mt-3 text-[#62798b]">The page you requested is unavailable.</p>
        <Link className="mt-6 inline-flex rounded-full bg-[#3695B9] px-5 py-3 text-sm font-bold text-white" to="/">Return home</Link>
      </Card>
    </main>
  );
}
