import { useMutation } from '@tanstack/react-query';
import type { MediaCategory } from '@arunreah/shared';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AdminFeedback } from './admin-feedback';
import { Button } from '@/components/ui/button';
import { getPublicMediaUrl, uploadMedia, type UploadedMedia } from '@/services/media';

const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'] as const;
const maxImageBytes = 5 * 1024 * 1024;

type MediaUploaderProps = {
  category: MediaCategory;
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
    },
  });

  const chooseFile = (file: File) => {
    setValidationMessage(null);
    setUploadedMedia(null);
    if (!acceptedTypes.includes(file.type as (typeof acceptedTypes)[number])) {
      setLocalFile(null);
      setValidationMessage('Choose a JPEG, PNG, or WEBP image.');
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
    <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_9.5rem] sm:items-start">
      <div className="min-w-0">
        <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-[#9bc9da] bg-white px-4 text-sm font-semibold text-[#167ea7] transition hover:border-[#2187a8] hover:bg-[#edf7fb] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#2187a8] focus-within:ring-offset-2">
          <span>{value ? 'Replace image' : 'Choose image'}</span>
          <input accept={acceptedTypes.join(',')} className="sr-only" disabled={upload.isPending} id={inputId} onChange={(event) => { const file = event.target.files?.[0]; event.currentTarget.value = ''; if (file) chooseFile(file); }} type="file" />
        </label>
        {localFile ? <p className="mt-3 break-words text-xs text-[#52647d]"><span className="font-semibold">Selected:</span> {localFile.name} · {formatFileSize(localFile.size)}</p> : null}
        {assetName ? <p className="mt-3 break-words text-xs text-[#52647d]"><span className="font-semibold">Current asset:</span> {assetName}</p> : null}
        {value ? <p className="mt-1 break-all text-xs text-[#8a9ab0]">Reference: {value}</p> : null}
        {upload.isSuccess && uploadedMedia ? <p className="mt-2 text-xs font-medium text-[#19723d]">Upload complete · {uploadedMedia.mimeType.replace('image/', '').toUpperCase()} · {formatFileSize(uploadedMedia.size)}</p> : null}
        {onClear && value ? <Button className="mt-3 px-0 text-xs text-[#a12a22] hover:bg-transparent hover:text-[#7e201a]" onClick={removeFromField} type="button" variant="ghost">Remove from this content</Button> : null}
        {onClear && value ? <p className="mt-1 text-xs leading-5 text-[#71839e]">This only clears the image from this content field. It does not delete the stored media asset.</p> : null}
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[#dce5ef] bg-[#edf3f7]">
        {previewSource && !previewFailed ? <img alt="Selected image preview" className="size-full object-cover" onError={() => setPreviewFailed(true)} src={previewSource} /> : <div className="flex size-full flex-col items-center justify-center p-3 text-center text-xs leading-5 text-[#71839e]"><span className="font-semibold text-[#52647d]">Preview unavailable</span><span className="mt-1">The image will still be saved by its asset reference.</span></div>}
        {upload.isPending ? <div aria-label="Uploading image" aria-valuetext="Uploading image" className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-[#cfe6ef]" role="progressbar"><span className="block h-full w-2/5 animate-pulse bg-[#2187a8]" /></div> : null}
      </div>
    </div>
    <div aria-live="polite" className="mt-4">
      {validationMessage ? <AdminFeedback title="Choose a supported image" tone="error"><p>{validationMessage}</p></AdminFeedback> : null}
      {upload.isPending ? <AdminFeedback title="Uploading image…" tone="loading"><p>Please keep this page open while the image is uploaded.</p></AdminFeedback> : null}
      {upload.isSuccess ? <AdminFeedback title="Image ready" tone="success"><p>Save the form to apply this image to the content.</p></AdminFeedback> : null}
      {upload.isError ? <AdminFeedback title="Image upload failed" tone="error"><p>Check the image type, size, and your access permissions, then try again.</p></AdminFeedback> : null}
    </div>
  </fieldset>;
}
