import { defaultImagePresentation, type ImagePresentation } from '@arunreah/shared';
import type { CSSProperties } from 'react';

/**
 * Pure geometry for the admin framing editor.
 *
 * Public pages render framed images with `object-fit: cover`, `object-position: X% Y%`
 * and `transform: scale(zoom)` around the same origin. For a frame of width `fw` and a
 * cover-fitted image of width `rw`, that places the image's left edge at
 * `X · (fw − zoom · rw)`. Every function here inverts or reuses that formula so the
 * editor moves the image exactly 1:1 with the pointer and matches the public site.
 */

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 2;

export type Size = { height: number; width: number };
export type Point = { x: number; y: number };

const clampNumber = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number) => Math.round(value * 100) / 100;

export function clampZoom(zoom: number) {
  return round(clampNumber(Number.isFinite(zoom) ? zoom : MIN_ZOOM, MIN_ZOOM, MAX_ZOOM));
}

export function normalizePresentation(value: Partial<ImagePresentation> | undefined): ImagePresentation {
  const merged = { ...defaultImagePresentation, ...value };
  return {
    positionX: round(clampNumber(merged.positionX, 0, 100)),
    positionY: round(clampNumber(merged.positionY, 0, 100)),
    zoom: clampZoom(merged.zoom),
  };
}

export function isDefaultPresentation(value: ImagePresentation | undefined) {
  const current = normalizePresentation(value);
  return current.positionX === defaultImagePresentation.positionX
    && current.positionY === defaultImagePresentation.positionY
    && current.zoom === defaultImagePresentation.zoom;
}

/** The same inline style the public `CmsImage` applies, so admin previews match exactly. */
export function presentationStyle(value: ImagePresentation | undefined): CSSProperties {
  const { positionX, positionY, zoom } = value ?? defaultImagePresentation;
  return {
    objectPosition: `${positionX}% ${positionY}%`,
    transform: zoom > 1 ? `scale(${zoom})` : undefined,
    transformOrigin: `${positionX}% ${positionY}%`,
  };
}

/** Size of the image once `object-fit: cover` has scaled it to fill the frame (before zoom). */
export function coverSize(natural: Size, frame: Size): Size {
  if (natural.width <= 0 || natural.height <= 0) return { ...frame };
  const scale = Math.max(frame.width / natural.width, frame.height / natural.height);
  return { height: natural.height * scale, width: natural.width * scale };
}

/** Where the image is drawn inside the frame for a given presentation (frame-relative pixels). */
export function imageRect(natural: Size, frame: Size, value: ImagePresentation) {
  const cover = coverSize(natural, frame);
  const width = cover.width * value.zoom;
  const height = cover.height * value.zoom;
  return {
    height,
    left: (value.positionX / 100) * (frame.width - width) + 0,
    top: (value.positionY / 100) * (frame.height - height) + 0,
    width,
  };
}

/** Converts an image edge offset back into a 0–100 position; axes with no overflow stay put. */
function positionForOffset(offset: number, frameLength: number, imageLength: number, fallback: number) {
  const overflow = imageLength - frameLength;
  if (overflow < 0.5) return fallback;
  return round(clampNumber((-offset / overflow) * 100, 0, 100));
}

/** Moves the image by a pointer delta so the photo follows the finger exactly. */
export function panBy(natural: Size, frame: Size, value: ImagePresentation, delta: Point): ImagePresentation {
  const rect = imageRect(natural, frame, value);
  return {
    positionX: positionForOffset(rect.left + delta.x, frame.width, rect.width, value.positionX),
    positionY: positionForOffset(rect.top + delta.y, frame.height, rect.height, value.positionY),
    zoom: value.zoom,
  };
}

/** Changes zoom while keeping the image point under `anchor` (frame-relative) fixed in place. */
export function zoomAt(natural: Size, frame: Size, value: ImagePresentation, nextZoom: number, anchor?: Point): ImagePresentation {
  const zoom = clampZoom(nextZoom);
  const point = anchor ?? { x: frame.width / 2, y: frame.height / 2 };
  const before = imageRect(natural, frame, value);
  const cover = coverSize(natural, frame);
  const width = cover.width * zoom;
  const height = cover.height * zoom;
  const u = before.width > 0 ? (point.x - before.left) / before.width : 0.5;
  const v = before.height > 0 ? (point.y - before.top) / before.height : 0.5;
  return {
    positionX: positionForOffset(point.x - u * width, frame.width, width, value.positionX),
    positionY: positionForOffset(point.y - v * height, frame.height, height, value.positionY),
    zoom,
  };
}

/** Keyboard nudges in presentation percentage points. */
export function nudge(value: ImagePresentation, dx: number, dy: number): ImagePresentation {
  return normalizePresentation({ ...value, positionX: value.positionX + dx, positionY: value.positionY + dy });
}

export function describePresentation(value: ImagePresentation | undefined) {
  const current = normalizePresentation(value);
  if (isDefaultPresentation(current)) return 'Centered · 1.00×';
  return `Focus ${Math.round(current.positionX)}% × ${Math.round(current.positionY)}% · ${current.zoom.toFixed(2)}×`;
}

/** Storage shape: whole-percent positions (the DB columns are integers) and 2-decimal zoom. */
export function toStoredPresentation(value: ImagePresentation): ImagePresentation {
  const current = normalizePresentation(value);
  return { positionX: Math.round(current.positionX), positionY: Math.round(current.positionY), zoom: current.zoom };
}
