import { useMutation } from '@tanstack/react-query';
import { defaultImagePresentation, type ImagePresentation, type MediaCategory } from '@arunreah/shared';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AdminFeedback } from './admin-feedback';
import { describePresentation, isDefaultPresentation, presentationStyle } from './image-framing';
import { ImageFramingDialog, type FramingFrame } from './image-framing-dialog';
import { Button } from '@/components/ui/button';
import { getPublicMediaUrl, uploadMedia, type UploadedMedia } from '@/services/media';

const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'] as const;
const acceptedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'];
const maxImageBytes = 5 * 1024 * 1024;

export type MediaFraming = {
  /** Public placements for this image; the first one is the editor's main frame. */
  frames: FramingFrame[];
  onChange: (value: ImagePresentation) => void;
  value?: ImagePresentation;
};

type MediaUploaderProps = {
  category: MediaCategory;
  /** Enables the drag-and-zoom framing editor for this image. */
  framing?: MediaFraming;
  help?: string;
  label?: string;
  onClear?: () => void;
  onUploaded: (key: string) => void;
  required?: boolean;
  value?: string;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileNameFromKey(key: string) {
  return key.split('/').at(-1) || key;
}

export function MediaUploader({
  category,
  framing,
  help = 'JPEG, PNG, or WEBP up to 5 MB.',
  label = 'Image',
  onClear,
  onUploaded,
  required = false,
  value,
}: MediaUploaderProps) {
  const inputId = useId();
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const lastUploadedKey = useRef<string | null>(null);
  const [framingOpen, setFramingOpen] = useState(false);
  const framingValue = framing?.value ?? defaultImagePresentation;
  const primaryFrame = framing?.frames[0];
  const remotePreview = useMemo(() => (value ? getPublicMediaUrl(value) : undefined), [value]);
  const previewSource = localPreview ?? uploadedMedia?.url ?? remotePreview;
  const assetName = value ? fileNameFromKey(value) : null;

  useEffect(() => {
    if (!localFile) {
      setLocalPreview(null);
      return undefined;
    }
    const objectUrl = URL.createObjectURL(localFile);
    setLocalPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [localFile]);

  useEffect(() => setPreviewFailed(false), [previewSource]);

  useEffect(() => {
    if (value === lastUploadedKey.current) return;
    setLocalFile(null);
    setUploadedMedia(null);
  }, [value]);

  const upload = useMutation({
    mutationFn: (file: File) => uploadMedia(category, file),
    onSuccess: (media) => {
      lastUploadedKey.current = media.key;
      setUploadedMedia(media);
      onUploaded(media.key);
      if (framing) {
        // A new photo starts centered; open the editor straight away like social apps do.
        framing.onChange(defaultImagePresentation);
        setFramingOpen(true);
      }
    },
  });

  const chooseFile = async (rawFile: File) => {
    setValidationMessage(null);
    setUploadedMedia(null);

    let file = rawFile;
    // Detect Apple HEIC/HEIF photos (even if named .jpg)
    try {
      const header = new Uint8Array(await rawFile.slice(0, 16).arrayBuffer());
      const isHeic =
        (header.length >= 12 &&
          header[4] === 0x66 &&
          header[5] === 0x74 &&
          header[6] === 0x79 &&
          header[7] === 0x70 &&
          (
            (header[8] === 0x68 && header[9] === 0x65 && header[10] === 0x69) ||
            (header[8] === 0x6d && header[9] === 0x69 && header[10] === 0x66)
          )) ||
        /\.(heic|heif)$/i.test(rawFile.name);

      if (isHeic) {
        let converted = false;
        try {
          const bitmap = await createImageBitmap(rawFile);
          const canvas = document.createElement('canvas');
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(bitmap, 0, 0);
            const blob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob(resolve, 'image/jpeg', 0.92)
            );
            if (blob) {
              const newName = rawFile.name.replace(/\.(heic|heif|jpg|jpeg|png)$/i, '') + '.jpg';
              file = new File([blob], newName, { type: 'image/jpeg' });
              converted = true;
            }
          }
        } catch {
          // Browser cannot decode HEIC
        }

        if (!converted) {
          setLocalFile(null);
          setValidationMessage(
            'This is an Apple HEIC/HEIF photo. Web browsers cannot display HEIC. Please export or convert it to JPEG or PNG before uploading (e.g. in Preview: File > Export > JPEG).'
          );
          return;
        }
      }
    } catch {
      // Header check fallback
    }

    const ext = file.name.split('.').at(-1)?.toLowerCase() ?? '';
    const isMimeAccepted = acceptedTypes.includes(file.type as (typeof acceptedTypes)[number]);
    const isExtAccepted = acceptedExtensions.includes(ext);

    if (!isMimeAccepted && !isExtAccepted) {
      setLocalFile(null);
      setValidationMessage('Choose a JPEG, PNG, WEBP, or AVIF image.');
      return;
    }
    if (file.size > maxImageBytes) {
      setLocalFile(null);
      setValidationMessage('Choose an image smaller than 5 MB.');
      return;
    }
    setLocalFile(file);
    upload.mutate(file);
  };

  const removeFromField = () => {
    lastUploadedKey.current = null;
    setLocalFile(null);
    setUploadedMedia(null);
    setValidationMessage(null);
    onClear?.();
  };

  return <fieldset className="rounded-xl border border-[#dce5ef] bg-[#fbfdff] p-4 sm:p-5">
    <legend className="px-1 text-sm font-semibold text-[#182238]">{label} {required ? <span className="text-[#c92727]">*</span> : null}</legend>
    <p className="mt-1 text-xs leading-5 text-[#71839e]">{help}</p>
    <div className={framing ? 'mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,15rem)] sm:items-start' : 'mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_9.5rem] sm:items-start'}>
      <div className="min-w-0">
        <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-[#9bc9da] bg-white px-4 text-sm font-semibold text-[#167ea7] transition hover:border-[#2187a8] hover:bg-[#edf7fb] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#2187a8] focus-within:ring-offset-2">
          <span>{value ? 'Replace image' : 'Choose image'}</span>
          <input accept={`${acceptedTypes.join(',')},.jpg,.jpeg,.png,.webp,.avif,.gif`} className="sr-only" disabled={upload.isPending} id={inputId} onChange={(event) => { const file = event.target.files?.[0]; event.currentTarget.value = ''; if (file) chooseFile(file); }} type="file" />
        </label>
        {localFile ? <p className="mt-3 break-words text-xs text-[#52647d]"><span className="font-semibold">Selected:</span> {localFile.name} · {formatFileSize(localFile.size)}</p> : null}
        {assetName ? <p className="mt-3 break-words text-xs text-[#52647d]"><span className="font-semibold">Current asset:</span> {assetName}</p> : null}
        {value ? <p className="mt-1 break-all text-xs text-[#8a9ab0]">Reference: {value}</p> : null}
        {upload.isSuccess && uploadedMedia ? <p className="mt-2 text-xs font-medium text-[#19723d]">Upload complete · {uploadedMedia.mimeType.replace('image/', '').toUpperCase()} · {formatFileSize(uploadedMedia.size)}</p> : null}
        {onClear && value ? <Button className="mt-3 px-0 text-xs text-[#a12a22] hover:bg-transparent hover:text-[#7e201a]" onClick={removeFromField} type="button" variant="ghost">Remove from this content</Button> : null}
        {onClear && value ? <p className="mt-1 text-xs leading-5 text-[#71839e]">This only clears the image from this content field. It does not delete the stored media asset.</p> : null}
      </div>
      <div className="min-w-0">
      <div className={framing ? 'group relative overflow-hidden rounded-lg border border-[#dce5ef] bg-[#edf3f7]' : 'relative aspect-[4/3] overflow-hidden rounded-lg border border-[#dce5ef] bg-[#edf3f7]'} style={primaryFrame ? { aspectRatio: String(primaryFrame.aspectRatio) } : undefined}>
        {previewSource && !previewFailed ? <img alt="Selected image preview" className="size-full object-cover" onError={() => setPreviewFailed(true)} src={previewSource} style={framing ? presentationStyle(framingValue) : undefined} /> : <div className="flex size-full flex-col items-center justify-center p-3 text-center text-xs leading-5 text-[#71839e]"><span className="font-semibold text-[#52647d]">Preview unavailable</span><span className="mt-1">The image will still be saved by its asset reference.</span></div>}
        {upload.isPending ? <div aria-label="Uploading image" aria-valuetext="Uploading image" className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-[#cfe6ef]" role="progressbar"><span className="block h-full w-2/5 animate-pulse bg-[#2187a8]" /></div> : null}
        {framing && previewSource && !previewFailed && !upload.isPending ? <button aria-hidden="true" className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-[#0b1624]/55 via-transparent to-transparent pb-2.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100" onClick={() => setFramingOpen(true)} tabIndex={-1} type="button">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#075d83] shadow">Adjust framing</span>
        </button> : null}
      </div>
      {framing ? <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        <Button className="min-h-11 px-4 text-xs" disabled={!previewSource || previewFailed || upload.isPending} onClick={() => setFramingOpen(true)} type="button" variant="secondary">
          <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" /></svg>
          Adjust framing
        </Button>
        {!isDefaultPresentation(framingValue) ? <Button className="min-h-11 px-3 text-xs" onClick={() => framing.onChange(defaultImagePresentation)} type="button" variant="ghost">Reset</Button> : null}
        <p aria-live="polite" className="w-full text-xs text-[#71839e]">{describePresentation(framingValue)}</p>
      </div> : null}
      </div>
    </div>
    <div aria-live="polite" className="mt-4">
      {validationMessage ? <AdminFeedback title="Choose a supported image" tone="error"><p>{validationMessage}</p></AdminFeedback> : null}
      {upload.isPending ? <AdminFeedback title="Uploading image…" tone="loading"><p>Please keep this page open while the image is uploaded.</p></AdminFeedback> : null}
      {upload.isSuccess ? <AdminFeedback title="Image ready" tone="success"><p>Save the form to apply this image to the content.</p></AdminFeedback> : null}
      {upload.isError ? <AdminFeedback title="Image upload failed" tone="error"><p>{(upload.error as Error)?.message || 'Check the image type, size, and your access permissions, then try again.'}</p></AdminFeedback> : null}
    </div>
    {framing ? <ImageFramingDialog
      frames={framing.frames}
      onApply={(next) => { framing.onChange(next); setFramingOpen(false); }}
      onClose={() => setFramingOpen(false)}
      open={framingOpen}
      src={previewSource}
      title={`Adjust ${label.toLowerCase()} framing`}
      value={framingValue}
    /> : null}
  </fieldset>;
}
