import type { ReactNode, RefObject } from 'react';

type AdminFormSectionProps = {
  children: ReactNode;
  description?: string;
  title: string;
};

/** Shared, intentionally non-sticky form grouping for private CMS editors. */
export function AdminFormSection({ children, description, title }: AdminFormSectionProps) {
  return (
    <section className="admin-form-section" aria-label={title}>
      <div className="admin-form-section-heading">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="admin-form-section-body">{children}</div>
    </section>
  );
}

type AdminFieldProps = {
  children: ReactNode;
  error?: string;
  help?: string;
  htmlFor?: string;
  label: string;
  optional?: boolean;
  required?: boolean;
};

export function AdminField({ children, error, help, htmlFor, label, optional = false, required = false }: AdminFieldProps) {
  const helperId = htmlFor ? `${htmlFor}-help` : undefined;
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  return (
    <div className="admin-form-field">
      <label htmlFor={htmlFor}>
        {label}
        {required ? <span aria-hidden="true" className="admin-form-required"> *</span> : null}
        {optional ? <span className="admin-form-optional">Optional</span> : null}
      </label>
      {children}
      {help ? <p className="admin-helper" id={helperId}>{help}</p> : null}
      {error ? <p className="admin-form-error" id={errorId} role="alert">{error}</p> : null}
    </div>
  );
}

export function AdminBilingualFields({ children }: { children: ReactNode }) {
  return <div className="admin-bilingual-fields">{children}</div>;
}

export function AdminFormActions({ children, status }: { children: ReactNode; status?: ReactNode }) {
  return (
    <div className="admin-form-actions">
      <div aria-live="polite" className="admin-form-actions-status">{status}</div>
      <div className="admin-form-actions-buttons">{children}</div>
    </div>
  );
}

/** Focuses the first invalid field after React has painted validation feedback. */
export function focusFirstInvalid(formRef: RefObject<HTMLFormElement | null>) {
  window.requestAnimationFrame(() => {
    const firstInvalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], :invalid');
    firstInvalid?.focus();
  });
}
