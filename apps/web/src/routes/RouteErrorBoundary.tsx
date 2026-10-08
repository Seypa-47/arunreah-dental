import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { isChunkLoadError, tryReloadForStaleChunk } from './lazy-with-retry';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const { language } = usePublicLanguage();
  const isKm = language === 'km';
  const chunkError = isChunkLoadError(error);

  useEffect(() => {
    if (chunkError) {
      tryReloadForStaleChunk();
    }
  }, [chunkError]);

  const title = chunkError
    ? isKm
      ? 'ទំព័រត្រូវបានធ្វើបច្ចុប្បន្នភាព'
      : 'Page updated'
    : isKm
      ? 'មានបញ្ហាបច្ចេកទេសបន្តិចបន្តួច'
      : 'Unable to load this page';

  const description = chunkError
    ? isKm
      ? 'គេហទំព័រគ្លីនិកធ្មេញ អរុណរះ ទើបតែត្រូវបានធ្វើបច្ចុប្បន្នភាពថ្មី។ សូមផ្ទុកទំព័រនេះឡើងវិញដើម្បីបន្ត។'
      : 'A newer version of the website is available. Please reload this page to load the latest content.'
    : isKm
      ? 'យើងមិនអាចបើកទំព័រនេះបានទេនៅពេលនេះ។ សូមផ្ទុកទំព័រឡើងវិញ ឬត្រឡប់ទៅទំព័រដើម។'
      : 'We could not load this page right now. Please reload the page or return to the homepage.';

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4 py-16">
      <Card className="max-w-lg p-8 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3695B9]">
          {isKm ? 'គ្លីនិកធ្មេញ អរុណរះ' : 'Arunreah Dental Clinic'}
        </p>
        <h1 className="mt-3 text-2xl font-black text-[#005687] sm:text-3xl">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#62798b] sm:text-base">{description}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#3695B9] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2c84a5]"
            onClick={() => window.location.reload()}
            type="button"
          >
            {isKm ? 'ផ្ទុកទំព័រឡើងវិញ' : 'Reload page'}
          </button>
          <a
            className="inline-flex items-center justify-center rounded-full border border-[#c7dce7] bg-white px-5 py-3 text-sm font-bold text-[#005687] transition hover:bg-[#edf5f9]"
            href="/"
          >
            {isKm ? 'ត្រឡប់ទៅទំព័រដើម' : 'Return home'}
          </a>
        </div>
      </Card>
    </main>
  );
}
