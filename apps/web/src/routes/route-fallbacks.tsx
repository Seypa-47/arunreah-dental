import { SkeletonBlock, SkeletonCard, SkeletonSection, SkeletonText } from '@/components/ui/skeleton';

export function PublicRouteFallback() {
  return (
    <div className="public-site min-h-screen overflow-x-hidden bg-[#f7fafc] text-[#005687]">
      <header
        aria-hidden="true"
        className="sticky top-0 z-40 border-b border-[#d9e9ee] bg-white/95 shadow-[0_2px_12px_rgba(10,63,90,0.05)] backdrop-blur-xl"
      >
        <div className="ui-page-container flex h-[64px] items-center justify-between gap-2 sm:h-[74px] sm:gap-4">
          <SkeletonBlock className="h-10 w-[140px] rounded-lg bg-[#dfecef] sm:h-12 sm:w-[210px]" />
          <SkeletonSection className="hidden max-w-[460px] flex-1 items-center justify-center gap-5 lg:flex">
            <SkeletonBlock className="h-3 w-14 rounded-full" />
            <SkeletonBlock className="h-3 w-16 rounded-full" />
            <SkeletonBlock className="h-3 w-20 rounded-full" />
            <SkeletonBlock className="h-3 w-16 rounded-full" />
          </SkeletonSection>
          <SkeletonSection className="flex w-auto items-center justify-end gap-2 sm:gap-3">
            <SkeletonBlock className="hidden h-10 w-24 rounded-full lg:block" />
            <SkeletonBlock className="h-10 w-28 rounded-full sm:h-11 sm:w-36" />
            <SkeletonBlock className="size-11 rounded-full lg:hidden" />
          </SkeletonSection>
        </div>
      </header>

      <main aria-busy="true" className="bg-white">
        <span className="sr-only">Loading page</span>
        <SkeletonSection className="grid min-h-[420px] place-items-center border-b border-[#e7eff3] bg-[#f7fafc] px-4 py-12 sm:min-h-[480px] sm:px-6">
          <div className="w-full max-w-[680px] text-center">
            <SkeletonBlock className="mx-auto h-3 w-28 rounded-full" />
            <SkeletonBlock className="mx-auto mt-4 h-10 w-[82%] max-w-[520px] rounded-lg sm:h-12" />
            <SkeletonText
              className="mx-auto mt-5 max-w-[560px]"
              lineClassName="mx-auto h-4"
              lines={2}
              widths={['88%', '68%']}
            />
            <SkeletonBlock className="mx-auto mt-8 h-11 w-44 rounded-full" />
          </div>
        </SkeletonSection>
      </main>
    </div>
  );
}

export function AdminRouteFallback({ variant = 'workspace' }: { variant?: 'auth' | 'workspace' }) {
  if (variant === 'auth') {
    return (
      <main aria-busy="true" className="grid min-h-screen place-items-center bg-[#f7f9fc] px-5 py-12">
        <span className="sr-only">Loading admin page</span>
        <SkeletonCard className="h-[430px] w-full max-w-[520px] rounded-[34px]" />
      </main>
    );
  }

  return (
    <div className="admin-workspace min-h-screen bg-[#f6f8fb]" data-sidebar-collapsed="false">
      <header aria-hidden="true" className="admin-topbar">
        <SkeletonBlock className="h-11 w-20 rounded-lg lg:hidden" />
        <SkeletonBlock className="hidden h-11 w-32 rounded-lg lg:block" />
        <div className="min-w-0">
          <SkeletonBlock className="h-4 w-28 rounded-full" />
          <SkeletonBlock className="mt-2 h-3 w-20 rounded-full" />
        </div>
        <SkeletonBlock className="ml-auto h-3 w-24 rounded-full" />
      </header>

      <div className="admin-workspace-body min-h-[calc(100vh-4rem)]">
        <aside aria-hidden="true" className="admin-navigation-panel">
          <SkeletonSection className="space-y-5 p-4">
            {Array.from({ length: 4 }, (_, groupIndex) => (
              <div className="space-y-2" key={groupIndex}>
                <SkeletonBlock className="h-3 w-20 rounded-full" />
                <SkeletonBlock className="h-10 w-full rounded-lg" />
                <SkeletonBlock className="h-10 w-[88%] rounded-lg" />
              </div>
            ))}
          </SkeletonSection>
        </aside>

        <div className="admin-workspace-content bg-[#f6f8fb]">
          <div aria-hidden="true" className="admin-breadcrumb min-h-[60px]">
            <SkeletonBlock className="h-3 w-44 rounded-full" />
          </div>
          <main aria-busy="true" className="min-h-[calc(100vh-8rem)] px-5 py-7 sm:px-8 lg:px-10 lg:py-8">
            <span className="sr-only">Loading admin page</span>
            <SkeletonSection className="mx-auto max-w-[1400px]">
              <SkeletonText className="max-w-md" lineClassName="h-4" lines={2} widths={['68%', '100%']} />
              <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <SkeletonCard className="h-32 rounded-[20px]" />
                <SkeletonCard className="h-32 rounded-[20px]" />
                <SkeletonCard className="h-32 rounded-[20px]" />
              </div>
              <SkeletonCard className="mt-7 h-[360px] rounded-[28px]" />
            </SkeletonSection>
          </main>
        </div>
      </div>
    </div>
  );
}
