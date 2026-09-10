import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AdminFeedback, AdminStatus } from './admin-feedback';

describe('admin shared feedback', () => {
  it('announces errors and includes the supplied recovery action', () => {
    const html = renderToStaticMarkup(<AdminFeedback title="Unable to save" tone="error" actions={<button>Retry</button>}>Your changes are still here.</AdminFeedback>);
    expect(html).toContain('role="alert"');
    expect(html).toContain('Your changes are still here.');
    expect(html).toContain('<button>Retry</button>');
  });
  it.each(['loading', 'success'] as const)('announces %s politely', (tone) => {
    expect(renderToStaticMarkup(<AdminFeedback title="Status" tone={tone} />)).toContain('role="status"');
  });
  it('does not announce an empty state as an error', () => {
    const html = renderToStaticMarkup(<AdminFeedback title="No items yet" tone="empty" />);
    expect(html).not.toContain('role="alert"');
    expect(html).toContain('data-tone="empty"');
  });
  it('keeps status meaning available as text, not color alone', () => {
    expect(renderToStaticMarkup(<AdminStatus tone="warning">Pending</AdminStatus>)).toContain('>Pending</span>');
  });
});
