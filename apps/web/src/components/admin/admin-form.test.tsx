import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AdminBilingualFields, AdminField, AdminFormActions, AdminFormSection } from './admin-form';

describe('admin form primitives', () => {
  it('identifies required and optional fields and keeps help near its field', () => {
    const markup = renderToStaticMarkup(
      <AdminFormSection description="Keep public copy clear." title="Content">
        <AdminBilingualFields>
          <AdminField help="Shown on the public page." htmlFor="title-en" label="Title · English" required><input id="title-en" /></AdminField>
          <AdminField htmlFor="title-km" label="ចំណងជើង · ខ្មែរ" optional><input id="title-km" /></AdminField>
        </AdminBilingualFields>
        <AdminFormActions status="Saved">Actions</AdminFormActions>
      </AdminFormSection>,
    );
    expect(markup).toContain('Title · English');
    expect(markup).toContain('Optional');
    expect(markup).toContain('Shown on the public page.');
    expect(markup).toContain('Saved');
  });
});
