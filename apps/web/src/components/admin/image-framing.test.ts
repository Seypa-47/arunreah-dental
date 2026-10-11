import { defaultImagePresentation } from '@arunreah/shared';
import { describe, expect, it } from 'vitest';
import { coverSize, describePresentation, imageRect, isDefaultPresentation, normalizePresentation, nudge, panBy, presentationStyle, toStoredPresentation, zoomAt } from './image-framing';

const landscape = { height: 1000, width: 2000 };
const frame = { height: 300, width: 400 };

describe('image framing geometry', () => {
  it('fits the image to cover the frame', () => {
    expect(coverSize(landscape, frame)).toEqual({ height: 300, width: 600 });
    expect(coverSize({ height: 2000, width: 1000 }, frame)).toEqual({ height: 800, width: 400 });
  });

  it('matches the public object-position + scale rendering', () => {
    expect(imageRect(landscape, frame, defaultImagePresentation)).toEqual({ height: 300, left: -100, top: 0, width: 600 });
    const zoomed = imageRect(landscape, frame, { positionX: 0, positionY: 100, zoom: 2 });
    expect(zoomed).toEqual({ height: 600, left: 0, top: -300, width: 1200 });
  });

  it('pans 1:1 with the pointer and clamps at the image edges', () => {
    // 200px of horizontal overflow: dragging right by 50px moves the image 50px.
    const moved = panBy(landscape, frame, defaultImagePresentation, { x: 50, y: 0 });
    expect(moved.positionX).toBe(25);
    expect(imageRect(landscape, frame, moved).left).toBeCloseTo(-50);
    expect(panBy(landscape, frame, defaultImagePresentation, { x: 500, y: 0 }).positionX).toBe(0);
    expect(panBy(landscape, frame, defaultImagePresentation, { x: -500, y: 0 }).positionX).toBe(100);
  });

  it('keeps an axis unchanged when the image has no overflow on it', () => {
    expect(panBy(landscape, frame, defaultImagePresentation, { x: 0, y: 80 }).positionY).toBe(50);
  });

  it('zooms around the anchor point so it stays under the cursor', () => {
    const anchor = { x: 100, y: 75 };
    const before = imageRect(landscape, frame, defaultImagePresentation);
    const next = zoomAt(landscape, frame, defaultImagePresentation, 1.5, anchor);
    const after = imageRect(landscape, frame, next);
    const u = (anchor.x - before.left) / before.width;
    expect(after.left + u * after.width).toBeCloseTo(anchor.x, 0);
    expect(next.zoom).toBe(1.5);
  });

  it('clamps zoom to the supported 1–2 range', () => {
    expect(zoomAt(landscape, frame, defaultImagePresentation, 5).zoom).toBe(2);
    expect(zoomAt(landscape, frame, defaultImagePresentation, 0.2).zoom).toBe(1);
  });

  it('normalizes, nudges and describes presentations', () => {
    expect(normalizePresentation({ positionX: 140, positionY: -3, zoom: 9 })).toEqual({ positionX: 100, positionY: 0, zoom: 2 });
    expect(nudge(defaultImagePresentation, -60, 5)).toEqual({ positionX: 0, positionY: 55, zoom: 1 });
    expect(isDefaultPresentation(undefined)).toBe(true);
    expect(describePresentation({ positionX: 20, positionY: 70, zoom: 1.25 })).toBe('Focus 20% × 70% · 1.25×');
  });

  it('produces the same inline style as the public site', () => {
    expect(presentationStyle({ positionX: 10, positionY: 90, zoom: 1.5 })).toEqual({ objectPosition: '10% 90%', transform: 'scale(1.5)', transformOrigin: '10% 90%' });
    expect(presentationStyle(defaultImagePresentation).transform).toBeUndefined();
  });
});

describe('toStoredPresentation', () => {
  it('rounds positions to whole percentages for the integer columns', () => {
    expect(toStoredPresentation({ positionX: 22.62, positionY: 99.6, zoom: 1.234 })).toEqual({ positionX: 23, positionY: 100, zoom: 1.23 });
  });
});
