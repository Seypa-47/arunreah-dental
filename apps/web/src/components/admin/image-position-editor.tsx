import { defaultImagePresentation, type ImagePresentation } from '@arunreah/shared';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

type ImagePositionEditorProps = {
  aspectClassName: string;
  onChange: (value: ImagePresentation) => void;
  src?: string;
  value?: ImagePresentation;
};

const presets: { label: string; x: number; y: number }[] = [
  { label: 'Center', x: 50, y: 50 }, { label: 'Top', x: 50, y: 0 }, { label: 'Bottom', x: 50, y: 100 },
  { label: 'Left', x: 0, y: 50 }, { label: 'Right', x: 100, y: 50 }, { label: 'Top left', x: 0, y: 0 },
  { label: 'Top right', x: 100, y: 0 }, { label: 'Bottom left', x: 0, y: 100 }, { label: 'Bottom right', x: 100, y: 100 },
];

const clamp = (value: number) => Math.min(100, Math.max(0, value));

export function ImagePositionEditor({ aspectClassName, onChange, src, value = defaultImagePresentation }: ImagePositionEditorProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ moved: boolean; startX: number; startY: number; value: ImagePresentation } | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [failed, setFailed] = useState(false);
  const update = (next: Partial<ImagePresentation>) => onChange({ ...value, ...next });

  const pointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { moved: false, startX: event.clientX, startY: event.clientY, value };
    setIsDragging(true);
  };
  const pointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current; const rect = previewRef.current?.getBoundingClientRect();
    if (!drag || !rect) return;
    const deltaX = event.clientX - drag.startX; const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) drag.moved = true;
    update({ positionX: clamp(drag.value.positionX - (deltaX / rect.width) * 100 / value.zoom), positionY: clamp(drag.value.positionY - (deltaY / rect.height) * 100 / value.zoom) });
  };
  const pointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current; const rect = previewRef.current?.getBoundingClientRect();
    if (drag && rect && !drag.moved) update({ positionX: clamp(((event.clientX - rect.left) / rect.width) * 100), positionY: clamp(((event.clientY - rect.top) / rect.height) * 100) });
    dragRef.current = undefined; setIsDragging(false);
  };

  return <fieldset className="rounded-xl border border-[#dce5ef] bg-[#fbfdff] p-4 sm:p-5">
    <legend className="px-1 text-sm font-semibold text-[#182238]">Image framing</legend>
    <p className="mt-1 text-xs leading-5 text-[#71839e]">Drag the image to reposition it, or click the important point. This changes presentation only; the original image is not cropped.</p>
    <div aria-label="Image focal point preview" className={cn('relative mt-4 overflow-hidden rounded-xl border border-[#cfe2ea] bg-[#edf4f7] touch-none select-none', aspectClassName, isDragging ? 'cursor-grabbing' : 'cursor-grab')} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} ref={previewRef} role="application">
      {src && !failed ? <img alt="Interactive image framing preview" className="size-full object-cover" draggable={false} onError={() => setFailed(true)} src={src} style={{ objectPosition: `${value.positionX}% ${value.positionY}%`, transform: value.zoom > 1 ? `scale(${value.zoom})` : undefined, transformOrigin: `${value.positionX}% ${value.positionY}%` }} /> : <div className="grid size-full place-items-center px-6 text-center text-sm text-[#71839e]">Upload or select an image to adjust its framing.</div>}
      {src && !failed ? <span aria-hidden="true" className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#168aad]/85 shadow" style={{ left: `${value.positionX}%`, top: `${value.positionY}%` }}><span className="absolute inset-1 rounded-full border border-white/80" /></span> : null}
    </div>
    <label className="mt-5 block text-sm font-semibold text-[#52647d]">Zoom <span className="float-right tabular-nums text-[#167ea7]">{value.zoom.toFixed(2)}×</span><input aria-label="Image zoom" className="mt-2 w-full accent-[#168aad]" max="2" min="1" onChange={(event) => update({ zoom: Number(event.target.value) })} step="0.01" type="range" value={value.zoom} /></label>
    <div className="mt-5"><p className="text-sm font-semibold text-[#52647d]">Position</p><div className="mt-2 flex flex-wrap gap-2">{presets.map((preset) => <Button className="min-h-9 px-3 text-xs" key={preset.label} onClick={() => update({ positionX: preset.x, positionY: preset.y })} type="button" variant={value.positionX === preset.x && value.positionY === preset.y ? 'primary' : 'secondary'}>{preset.label}</Button>)}</div></div>
    <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#e5eef2] pt-4"><p className="text-xs text-[#71839e]">Position: {Math.round(value.positionX)}% × {Math.round(value.positionY)}%</p><Button className="min-h-9 px-3 text-xs" onClick={() => onChange(defaultImagePresentation)} type="button" variant="secondary">Reset position</Button></div>
  </fieldset>;
}
