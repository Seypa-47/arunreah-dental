import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-[#eef9fc] px-3 py-1 text-xs font-bold uppercase text-[#2f9fbe]',
        className,
      )}
      {...props}
    />
  );
}
