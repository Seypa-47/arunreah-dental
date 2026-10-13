import { PageContainer } from '@/components/layout/public-ui';
import { SkeletonBlock, SkeletonImage, SkeletonSection, SkeletonText } from '@/components/ui/skeleton';

export const publicListingHeroSectionClass = 'border-b border-[#e7eff3] bg-[#f7fafc] py-5 sm:py-7';
export const publicListingHeroMediaClass =
  'relative min-h-[320px] overflow-hidden rounded-2xl border border-[#d9e9ee] bg-[#00546f] sm:min-h-[380px] lg:min-h-[420px]';
export const publicListingHeroContentClass =
  'relative z-10 flex min-h-[320px] max-w-[720px] flex-col justify-end p-6 sm:min-h-[380px] sm:p-10 lg:min-h-[420px] lg:p-12';
export const publicListingGridClass = 'grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3';

export function PublicListingHeroSkeleton() {
  return (
    <SkeletonSection className={publicListingHeroSectionClass} data-skeleton-section="hero">
      <PageContainer>
        <div className={publicListingHeroMediaClass}>
          <SkeletonImage className="absolute inset-0 h-full w-full rounded-none bg-[#d8e9ef]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#021827]/75 via-[#021827]/25 to-transparent sm:bg-[linear-gradient(100deg,rgba(2,24,39,0.72)_0%,rgba(2,24,39,0.34)_42%,rgba(2,24,39,0.08)_70%,transparent_100%)]" />
          <div className={publicListingHeroContentClass}>
            <div className="w-full max-w-[600px]">
              <SkeletonBlock className="h-6 w-28 rounded-full bg-white/45" />
              <SkeletonBlock className="mt-3 h-10 w-[82%] rounded-lg bg-white/65 sm:h-12" />
              <SkeletonText className="mt-4" lineClassName="h-4 bg-white/35" lines={2} widths={['92%', '68%']} />
            </div>
          </div>
        </div>
      </PageContainer>
    </SkeletonSection>
  );
}
