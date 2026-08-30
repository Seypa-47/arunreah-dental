import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#3ca8c7] text-white shadow-[0_12px_24px_rgba(58,167,200,0.28)] hover:bg-[#2f98b7] focus-visible:outline-[#0d6f93]',
  secondary:
    'bg-white text-[#2f9fbe] shadow-none hover:bg-[#eef9fc] focus-visible:outline-[#2f9fbe]',
  ghost: 'bg-transparent text-[#155d82] hover:bg-[#edf7fb] focus-visible:outline-[#2f9fbe]',
  link: 'bg-transparent px-0 text-[#0f628a] hover:text-[#2f9fbe] focus-visible:outline-[#2f9fbe]',
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
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60',
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
