import type { ReactNode } from 'react';

/** Shared line-icon tile for qualification and responsibility cards. */
export function ProfileLineIcon({ children }: { children: ReactNode }) {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f0f7fa] text-[#0d7596]">
      <svg
        aria-hidden="true"
        className="size-[18px]"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        {children}
      </svg>
    </span>
  );
}

export const profileSectionEyebrow =
  'ui-eyebrow text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#0d7596]';

export const profileSectionTitle =
  'mt-2 text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-[#005687] sm:text-[28px]';
