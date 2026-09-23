import { defaultImagePresentation, type ImagePresentation } from '@arunreah/shared';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { clampZoom, imageRect, MAX_ZOOM, MIN_ZOOM, normalizePresentation, panBy, presentationStyle, toStoredPresentation, zoomAt, type Point, type Size } from './image-framing';

export type FramingFrame = {
  /** Width ÷ height of the place this image appears on the public site. */
  aspectRatio: number;
  label: string;
};

type ImageFramingDialogProps = {
  frames: FramingFrame[];
  onApply: (value: ImagePresentation) => void;
  onClose: () => void;
  open: boolean;
  src?: string;
  title?: string;
  value?: ImagePresentation;
};

const STAGE_PADDING = 28;
const KEY_PAN_PX = 12;
const KEY_ZOOM_STEP = 0.1;

type Gesture =
  | { kind: 'pan'; last: Point }
  | { kind: 'pinch'; distance: number; midpoint: Point };

function distanceBetween(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Social-media style reposition editor: the image is dragged freely behind a fixed frame,
 * the area outside the frame is dimmed, and wheel, pinch, slider or keys zoom it.
 * Only presentation metadata is produced — the original upload is never cropped.
 */
export function ImageFramingDialog({ frames, onApply, onClose, open, src, title = 'Adjust image framing', value }: ImageFramingDialogProps) {
  const titleId = useId();
  const helpId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture | null>(null);
  const [draft, setDraft] = useState<ImagePresentation>(() => normalizePresentation(value));
  const [natural, setNatural] = useState<Size | null>(null);
  const [failed, setFailed] = useState(false);
  const [stage, setStage] = useState<Size>({ height: 0, width: 0 });
  const [interacting, setInteracting] = useState(false);
  const primary = frames[0] ?? { aspectRatio: 16 / 9, label: 'Image' };

  // Refs mirror the latest geometry so native listeners (wheel) never read stale state.
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      setDraft(normalizePresentation(value));
      if (!dialog.open && typeof dialog.showModal === 'function') dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
    // Only re-seed the draft when the dialog opens; live edits must not be overwritten.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    setNatural(null);
    setFailed(false);
  }, [src]);

  useLayoutEffect(() => {
    const node = stageRef.current;
    if (!open || !node) return undefined;
    const measure = () => setStage({ height: node.clientHeight, width: node.clientWidth });
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [open]);

  const availableWidth = Math.max(0, stage.width - STAGE_PADDING * 2);
  const availableHeight = Math.max(0, stage.height - STAGE_PADDING * 2);
  const frameWidth = Math.min(availableWidth, availableHeight * primary.aspectRatio);
  const frame: Size = { height: frameWidth / primary.aspectRatio, width: frameWidth };
  const frameOrigin: Point = { x: (stage.width - frame.width) / 2, y: (stage.height - frame.height) / 2 };
  const ready = Boolean(src && natural && !failed && frame.width > 0);
  const rect = natural && frame.width > 0 ? imageRect(natural, frame, draft) : null;

  const geometryRef = useRef({ frame, frameOrigin, natural });
  geometryRef.current = { frame, frameOrigin, natural };

  const toFramePoint = useCallback((clientX: number, clientY: number): Point => {
    const bounds = stageRef.current?.getBoundingClientRect();
    const { frameOrigin: origin } = geometryRef.current;
    return { x: clientX - (bounds?.left ?? 0) - origin.x, y: clientY - (bounds?.top ?? 0) - origin.y };
  }, []);

  const applyZoom = useCallback((nextZoom: number, anchor?: Point) => {
    const { frame: currentFrame, natural: size } = geometryRef.current;
    if (!size || currentFrame.width <= 0) {
      setDraft((current) => ({ ...current, zoom: clampZoom(nextZoom) }));
      return;
    }
    setDraft((current) => zoomAt(size, currentFrame, current, nextZoom, anchor));
  }, []);

  const applyPan = useCallback((delta: Point) => {
    const { frame: currentFrame, natural: size } = geometryRef.current;
    if (!size || currentFrame.width <= 0) return;
    setDraft((current) => panBy(size, currentFrame, current, delta));
  }, []);

  // Trackpad pinch and mouse wheel zoom toward the cursor. Must be non-passive to stop page scroll.
  useEffect(() => {
    const node = stageRef.current;
    if (!open || !node) return undefined;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const scale = event.deltaMode === 1 ? 16 : 1;
      const factor = Math.exp((-event.deltaY * scale) * (event.ctrlKey ? 0.01 : 0.0025));
      applyZoom(draftRef.current.zoom * factor, toFramePoint(event.clientX, event.clientY));
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [applyZoom, open, toFramePoint]);

  const resetGesture = () => {
    const points = [...pointers.current.values()];
    const [first, second] = points;
    if (first && second) {
      gesture.current = { distance: distanceBetween(first, second), kind: 'pinch', midpoint: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 } };
    } else if (first) {
      gesture.current = { kind: 'pan', last: first };
    } else {
      gesture.current = null;
    }
    setInteracting(points.length > 0);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!ready || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    resetGesture();
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const current = gesture.current;
    const [first, second] = [...pointers.current.values()];
    if (current?.kind === 'pan' && first) {
      applyPan({ x: first.x - current.last.x, y: first.y - current.last.y });
      current.last = first;
    } else if (current?.kind === 'pinch' && first && second) {
      const distance = distanceBetween(first, second);
      const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
      if (current.distance > 0) applyZoom(draftRef.current.zoom * (distance / current.distance), toFramePoint(midpoint.x, midpoint.y));
      applyPan({ x: midpoint.x - current.midpoint.x, y: midpoint.y - current.midpoint.y });
      current.distance = distance;
      current.midpoint = midpoint;
    }
  };

  const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(event.pointerId)) return;
    resetGesture();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? KEY_PAN_PX * 4 : KEY_PAN_PX;
    const moves: Record<string, Point> = { ArrowDown: { x: 0, y: -step }, ArrowLeft: { x: step, y: 0 }, ArrowRight: { x: -step, y: 0 }, ArrowUp: { x: 0, y: step } };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      applyPan(move);
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      applyZoom(draft.zoom + KEY_ZOOM_STEP);
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      applyZoom(draft.zoom - KEY_ZOOM_STEP);
    } else if (event.key === '0') {
      event.preventDefault();
      setDraft(defaultImagePresentation);
    }
  };

  const zoomPercent = Math.round(((draft.zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100);

  return <dialog
    aria-describedby={helpId}
    aria-labelledby={titleId}
    className="m-auto w-[min(1040px,calc(100vw-1.5rem))] max-w-none overflow-hidden rounded-2xl border-0 bg-white p-0 text-[#182238] shadow-[0_24px_64px_rgba(15,23,42,0.35)] backdrop:bg-[#0b1624]/70 backdrop:backdrop-blur-[2px]"
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    ref={dialogRef}
  >
    {open ? <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col">
      <header className="flex items-start justify-between gap-4 border-b border-[#e5edf3] px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 className="text-base font-extrabold tracking-[-0.01em] text-[#182238] sm:text-lg" id={titleId}>{title}</h2>
          <p className="mt-0.5 text-xs leading-5 text-[#61738d]" id={helpId}>Drag to reposition. Scroll, pinch or use the slider to zoom. The original image is never cropped.</p>
        </div>
        <button aria-label="Close without saving" className="grid size-11 shrink-0 place-items-center rounded-full text-[#52647d] transition hover:bg-[#eef4f8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#168aad]" onClick={onClose} type="button">
          <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </header>

      <div className="grid min-h-0 flex-1 max-lg:overflow-y-auto lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="flex min-h-0 min-w-0 flex-col bg-[#0f1b2a]">
          <div
            aria-describedby={helpId}
            aria-label={`${primary.label} framing. Use arrow keys to move, plus and minus to zoom, 0 to reset.`}
            className={cn('relative min-h-[220px] flex-1 touch-none select-none overflow-hidden outline-none max-lg:h-[46vh] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7ee1f8]', ready ? (interacting ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default')}
            onKeyDown={onKeyDown}
            onLostPointerCapture={onPointerEnd}
            onPointerCancel={onPointerEnd}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            ref={stageRef}
            role="application"
            tabIndex={0}
          >
            {src && !failed ? <img
              alt=""
              className={cn('pointer-events-none absolute max-w-none origin-top-left will-change-transform', ready ? 'opacity-100' : 'opacity-0', interacting ? '' : 'transition-[left,top,width,height] duration-100 ease-out')}
              draggable={false}
              onError={() => setFailed(true)}
              onLoad={(event) => setNatural({ height: event.currentTarget.naturalHeight, width: event.currentTarget.naturalWidth })}
              src={src}
              style={rect ? { height: rect.height, left: frameOrigin.x + rect.left, top: frameOrigin.y + rect.top, width: rect.width } : { height: 1, left: 0, top: 0, width: 1 }}
            /> : null}

            {ready ? <div aria-hidden="true" className="pointer-events-none absolute rounded-[3px] shadow-[0_0_0_9999px_rgba(11,22,36,0.72)] ring-2 ring-white" style={{ height: frame.height, left: frameOrigin.x, top: frameOrigin.y, width: frame.width }}>
              <div className={cn('absolute inset-0 transition-opacity duration-150', interacting ? 'opacity-100' : 'opacity-0')}>
                <span className="absolute inset-y-0 left-1/3 w-px bg-white/60" />
                <span className="absolute inset-y-0 left-2/3 w-px bg-white/60" />
                <span className="absolute inset-x-0 top-1/3 h-px bg-white/60" />
                <span className="absolute inset-x-0 top-2/3 h-px bg-white/60" />
              </div>
              <span className={cn('absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#0b1624]/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition-opacity duration-200', interacting ? 'opacity-0' : 'opacity-100')}>
                ✥ Drag to reposition
              </span>
            </div> : null}

            {!src || failed ? <div className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-[#b8c7d8]">{failed ? 'This image could not be loaded for editing.' : 'Upload an image to adjust its framing.'}</div> : null}
            {src && !failed && !ready ? <div className="absolute inset-0 grid place-items-center text-sm text-[#b8c7d8]"><span className="size-8 animate-spin rounded-full border-2 border-white/25 border-t-white" /><span className="sr-only">Loading image</span></div> : null}
          </div>

          <div className="flex items-center gap-3 border-t border-white/10 px-4 py-3 sm:px-6">
            <button aria-label="Zoom out" className="grid size-11 shrink-0 place-items-center rounded-full text-white/85 transition hover:bg-white/10 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7ee1f8]" disabled={!ready || draft.zoom <= MIN_ZOOM} onClick={() => applyZoom(draft.zoom - KEY_ZOOM_STEP)} type="button">
              <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M8 11h6M20 20l-4-4" /></svg>
            </button>
            <input
              aria-label="Zoom"
              aria-valuetext={`${draft.zoom.toFixed(2)} times`}
              className="h-11 min-w-0 flex-1 cursor-pointer accent-[#7ee1f8]"
              disabled={!ready}
              max={MAX_ZOOM}
              min={MIN_ZOOM}
              onChange={(event) => applyZoom(Number(event.target.value))}
              onPointerDown={() => setInteracting(true)}
              onPointerUp={() => setInteracting(false)}
              step="0.01"
              style={{ background: 'transparent' }}
              type="range"
              value={draft.zoom}
            />
            <button aria-label="Zoom in" className="grid size-11 shrink-0 place-items-center rounded-full text-white/85 transition hover:bg-white/10 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7ee1f8]" disabled={!ready || draft.zoom >= MAX_ZOOM} onClick={() => applyZoom(draft.zoom + KEY_ZOOM_STEP)} type="button">
              <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M8 11h6M11 8v6M20 20l-4-4" /></svg>
            </button>
            <span aria-hidden="true" className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums text-white/80">{draft.zoom.toFixed(2)}×</span>
          </div>
        </div>

        <aside className="border-t border-[#e5edf3] bg-[#f8fbfd] p-5 lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-t-0">
          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#61738d]">Live preview</h3>
          <p className="mt-1 text-xs leading-5 text-[#71839e]">How visitors will see it{frames.length > 1 ? ' in each place it appears' : ''}.</p>
          <ul className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-1">
            {frames.map((item) => <li className="min-w-0" key={item.label}>
              <div className="relative overflow-hidden rounded-lg border border-[#dce5ef] bg-[#edf3f7]" style={{ aspectRatio: String(item.aspectRatio) }}>
                {src && !failed ? <img alt="" className="size-full object-cover" draggable={false} src={src} style={presentationStyle(draft)} /> : null}
              </div>
              <p className="mt-1.5 truncate text-xs font-semibold text-[#52647d]">{item.label}</p>
            </li>)}
          </ul>
          <dl className="mt-5 grid grid-cols-3 gap-2 rounded-lg border border-[#e1eaf1] bg-white p-3 text-center text-xs">
            <div><dt className="text-[#8a9ab0]">Horizontal</dt><dd className="mt-0.5 font-bold tabular-nums text-[#182238]">{Math.round(draft.positionX)}%</dd></div>
            <div><dt className="text-[#8a9ab0]">Vertical</dt><dd className="mt-0.5 font-bold tabular-nums text-[#182238]">{Math.round(draft.positionY)}%</dd></div>
            <div><dt className="text-[#8a9ab0]">Zoom</dt><dd className="mt-0.5 font-bold tabular-nums text-[#182238]">{zoomPercent}%</dd></div>
          </dl>
        </aside>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5edf3] px-5 py-4 sm:px-6">
        <Button className="min-h-11 px-4 text-sm" disabled={!ready} onClick={() => setDraft(defaultImagePresentation)} type="button" variant="ghost">Reset</Button>
        <div className="flex gap-2">
          <Button className="min-h-11 px-5 text-sm" onClick={onClose} type="button" variant="secondary">Cancel</Button>
          <Button className="min-h-11 px-6 text-sm" disabled={!ready} onClick={() => onApply(toStoredPresentation(draft))} type="button">Apply</Button>
        </div>
      </footer>
    </div> : null}
  </dialog>;
}
