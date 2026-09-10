import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-[#eef8fb] px-3 py-1 text-[12px] font-extrabold uppercase leading-4 text-[#087b9f]',
        className,
      )}
      {...props}
    />
  );
}
