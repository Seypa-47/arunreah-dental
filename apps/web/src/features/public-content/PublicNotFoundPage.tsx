import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { publicShell } from '@/features/public-content/public-page-chrome';

export function PublicNotFoundPage() {
  const { language } = usePublicLanguage();
  const isKm = language === 'km';
  const shell = publicShell(language);

  return (
    <SiteLayout actions={shell.actions} navigation={shell.navigation} services={shell.services}>
      <main className="grid min-h-[calc(100vh-180px)] place-items-center bg-[#f5f9fb] px-4 py-16">
        <Card className="max-w-lg p-8 text-center">
          <p className="text-sm font-bold text-[#3695B9]">404</p>
          <h1 className="mt-3 text-3xl font-black text-[#005687]">
            {isKm ? 'រកមិនឃើញទំព័រ' : 'Page not found'}
          </h1>
          <p className="mt-3 text-[#62798b]">
            {isKm ? 'ទំព័រដែលអ្នកបានស្នើសុំមិនមានទេ។' : 'The page you requested is unavailable.'}
          </p>
          <Link
            className="mt-6 inline-flex rounded-full bg-[#3695B9] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2c84a5]"
            to="/"
          >
            {isKm ? 'ត្រឡប់ទៅទំព័រដើម' : 'Return home'}
          </Link>
        </Card>
      </main>
      <SiteFooter {...shell.footer} />
    </SiteLayout>
  );
}
