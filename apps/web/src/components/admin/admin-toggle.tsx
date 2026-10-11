import type { MouseEvent } from 'react';

type AdminToggleProps = {
  checked: boolean;
  className?: string;
  disabled?: boolean;
  id?: string;
  label: string;
  onChange: (checked: boolean) => void;
  showLabel?: boolean;
  stopPropagation?: boolean;
};

/** A consistent, touch-friendly boolean control for CMS settings. */
export function AdminToggle({
  checked,
  className = '',
  disabled = false,
  id,
  label,
  onChange,
  showLabel = false,
  stopPropagation = false,
}: AdminToggleProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) event.stopPropagation();
    onChange(!checked);
  };

  const control = (
    <button
      aria-checked={checked}
      aria-label={label}
      className={`admin-toggle ${className}`}
      disabled={disabled}
      id={id}
      onClick={handleClick}
      role="switch"
      type="button"
    >
      <span aria-hidden="true" className="admin-toggle-track"><span className="admin-toggle-thumb" /></span>
    </button>
  );

  return showLabel ? <div className="flex items-center gap-3"><span className="text-[13px] font-semibold text-[#182238]">{label}</span>{control}</div> : control;
}
