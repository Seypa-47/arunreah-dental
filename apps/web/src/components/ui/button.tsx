import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#0d7596] text-white shadow-[0_8px_18px_rgba(22,138,173,0.20)] hover:bg-[#075d83] focus-visible:outline-[#075d83]',
  secondary: 'border border-[#b9dce8] bg-white text-[#075d83] shadow-none hover:border-[#168aad] hover:bg-[#eef8fb] focus-visible:outline-[#168aad]',
  ghost: 'bg-transparent text-[#075d83] hover:bg-[#edf7fb] focus-visible:outline-[#168aad]',
  link: 'bg-transparent px-0 text-[#087b9f] hover:text-[#075d83] focus-visible:outline-[#168aad]',
};

export function Button({
  children,
  className,
  icon,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold leading-5 transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:min-h-11',
        variantClasses[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
