import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

type DecorativeDivProps = Omit<HTMLAttributes<HTMLDivElement>, 'aria-hidden'>;
type DecorativeSectionProps = Omit<HTMLAttributes<HTMLElement>, 'aria-hidden'>;

export function SkeletonBlock({ className, ...props }: DecorativeDivProps) {
  return (
    <div
      {...props}
      aria-hidden="true"
      data-skeleton="block"
      className={cn('skeleton-shimmer rounded-lg bg-[#e7f1f4]', className)}
    />
  );
}

interface SkeletonTextProps extends Omit<DecorativeDivProps, 'children'> {
  lines?: number;
  lineClassName?: string;
  widths?: readonly string[];
}

export function SkeletonText({
  className,
  lines = 3,
  lineClassName,
  widths = [],
  ...props
}: SkeletonTextProps) {
  const lineCount = Number.isFinite(lines) ? Math.max(1, Math.floor(lines)) : 3;

  return (
    <div
      {...props}
      aria-hidden="true"
      data-skeleton="text"
      className={cn('space-y-2', className)}
    >
      {Array.from({ length: lineCount }, (_, index) => (
        <SkeletonBlock
          key={index}
          className={cn('h-3 rounded-full', lineClassName)}
          style={{ width: widths[index] ?? (index === lineCount - 1 ? '72%' : '100%') }}
        />
      ))}
    </div>
  );
}

export function SkeletonImage({ className, ...props }: DecorativeDivProps) {
  return (
    <div
      {...props}
      aria-hidden="true"
      data-skeleton="image"
      className={cn('skeleton-shimmer overflow-hidden rounded-xl bg-[#dfecef]', className)}
    />
  );
}

export function SkeletonCard({ className, ...props }: DecorativeDivProps) {
  return (
    <div
      {...props}
      aria-hidden="true"
      data-skeleton="card"
      className={cn(
        'skeleton-shimmer rounded-xl border border-[#d9e9ee] bg-white shadow-[0_2px_10px_rgba(15,61,84,0.04)]',
        className,
      )}
    />
  );
}

export function SkeletonSection({ className, ...props }: DecorativeSectionProps) {
  return (
    <section
      {...props}
      aria-hidden="true"
      data-skeleton="section"
      className={cn('w-full', className)}
    />
  );
}
