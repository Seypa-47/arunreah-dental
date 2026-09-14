import { defaultImagePresentation } from '@arunreah/shared';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ImagePositionEditor } from './image-position-editor';

function findButton(html: string, label: string) {
  return html.match(new RegExp(`<button[^>]*>${label}</button>`))?.[0];
}

describe('ImagePositionEditor', () => {
  it('falls back to the default 50/50/1x presentation when no value is given', () => {
    const html = renderToStaticMarkup(
      <ImagePositionEditor aspectClassName="aspect-video" onChange={() => {}} />,
    );
    expect(html).toContain('1.00×');
    expect(html).toContain('Position: 50% × 50%');
    expect(findButton(html, 'Center')).toContain('bg-[#0d7596]');
  });

  it('highlights the preset button matching the current position and leaves others inactive', () => {
    const html = renderToStaticMarkup(
      <ImagePositionEditor
        aspectClassName="aspect-video"
        onChange={() => {}}
        value={{ positionX: 0, positionY: 0, zoom: 1.25 }}
      />,
    );
    expect(findButton(html, 'Top left')).toContain('bg-[#0d7596]');
    expect(findButton(html, 'Center')).toContain('border border-[#b9dce8]');
    expect(findButton(html, 'Bottom right')).toContain('border border-[#b9dce8]');
    expect(html).toContain('1.25×');
    expect(html).toContain('Position: 0% × 0%');
  });

  it('clamps the zoom slider to the 1-2 range and reflects it as the input value', () => {
    const html = renderToStaticMarkup(
      <ImagePositionEditor
        aspectClassName="aspect-video"
        onChange={() => {}}
        value={{ ...defaultImagePresentation, zoom: 1.5 }}
      />,
    );
    expect(html).toContain('min="1"');
    expect(html).toContain('max="2"');
    expect(html).toContain('value="1.5"');
  });

  it('shows a placeholder when no image is selected and the image once a src is provided', () => {
    const withoutSrc = renderToStaticMarkup(
      <ImagePositionEditor aspectClassName="aspect-video" onChange={() => {}} />,
    );
    expect(withoutSrc).toContain('Upload or select an image to adjust its framing.');
    expect(withoutSrc).not.toContain('<img');

    const withSrc = renderToStaticMarkup(
      <ImagePositionEditor
        aspectClassName="aspect-video"
        onChange={() => {}}
        src="https://media.example.com/doctors/photo.jpg"
        value={{ positionX: 25, positionY: 75, zoom: 1 }}
      />,
    );
    expect(withSrc).toContain('src="https://media.example.com/doctors/photo.jpg"');
    expect(withSrc).toContain('object-position:25% 75%');
  });

  it('exposes a reset control that restores the default presentation', () => {
    const html = renderToStaticMarkup(
      <ImagePositionEditor
        aspectClassName="aspect-video"
        onChange={() => {}}
        value={{ positionX: 10, positionY: 90, zoom: 2 }}
      />,
    );
    expect(html).toContain('Reset position');
  });
});
