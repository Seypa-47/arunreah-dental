import type { ReactNode } from 'react';

type FeedbackTone = 'loading' | 'error' | 'success' | 'empty';

/** Presentation only: callers retain ownership of requests and retry actions. */
export function AdminFeedback({ title, children, tone, actions }: {
  title: string;
  children?: ReactNode;
  tone: FeedbackTone;
  actions?: ReactNode;
}) {
  return <section className="admin-feedback" data-tone={tone} role={tone === 'error' ? 'alert' : tone === 'empty' ? undefined : 'status'}>
    <p className="font-semibold">{title}</p>
    {children ? <div className="mt-1 text-sm">{children}</div> : null}
    {actions ? <div className="admin-feedback-actions">{actions}</div> : null}
  </section>;
}

export function AdminStatus({ children, tone }: { children: ReactNode; tone: 'success' | 'warning' | 'neutral' | 'error' }) {
  return <span className="admin-status" data-tone={tone}>{children}</span>;
}
