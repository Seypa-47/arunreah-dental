import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ImageFramingDialog } from './image-framing-dialog';

const frames = [{ aspectRatio: 2.38, label: 'Desktop hero' }, { aspectRatio: 1.07, label: 'Mobile hero' }];

describe('ImageFramingDialog', () => {
  it('renders nothing but the dialog shell while closed', () => {
    const html = renderToStaticMarkup(
      <ImageFramingDialog frames={frames} onApply={() => {}} onClose={() => {}} open={false} src="/photo.png" />,
    );
    expect(html).not.toContain('Desktop hero');
    expect(html).toContain('<dialog');
  });

  it('shows the frame previews, zoom controls and the current presentation when open', () => {
    const html = renderToStaticMarkup(
      <ImageFramingDialog
        frames={frames}
        onApply={() => {}}
        onClose={() => {}}
        open
        src="/photo.png"
        value={{ positionX: 20, positionY: 80, zoom: 1.5 }}
      />,
    );
    expect(html).toContain('Desktop hero');
    expect(html).toContain('Mobile hero');
    expect(html).toContain('1.50×');
    // Previews use the same object-position/scale pair as the public site.
    expect(html).toContain('object-position:20% 80%');
    expect(html).toContain('scale(1.5)');
    expect(html).toContain('Drag to reposition');
  });

  it('explains when there is no image to frame', () => {
    const html = renderToStaticMarkup(
      <ImageFramingDialog frames={frames} onApply={() => {}} onClose={() => {}} open />,
    );
    expect(html).toContain('Upload an image to adjust its framing.');
  });
});
