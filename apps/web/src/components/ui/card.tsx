import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border border-[#d9e9ee] bg-white shadow-[0_2px_10px_rgba(15,61,84,0.06)]', className)}
      {...props}
    />
  );
}
