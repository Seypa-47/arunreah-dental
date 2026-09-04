import { useMutation } from '@tanstack/react-query';
import type { MediaCategory } from '@arunreah/shared';
import { uploadMedia } from '@/services/media';

type MediaUploaderProps = { category: MediaCategory; onUploaded: (key: string) => void; value?: string };

export function MediaUploader({ category, onUploaded, value }: MediaUploaderProps) {
  const upload = useMutation({ mutationFn: (file: File) => uploadMedia(category, file), onSuccess: (media) => onUploaded(media.key) });
  return <label className="block text-sm font-medium text-[#52647d]">Image
    <input accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm" disabled={upload.isPending} onChange={(event) => { const file = event.target.files?.[0]; if (file) upload.mutate(file); }} type="file" />
    {value ? <p className="mt-2 break-all text-xs text-[#71839e]">Stored key: {value}</p> : null}
    {upload.isPending ? <p className="mt-2 text-xs text-[#71839e]">Uploading image…</p> : null}
    {upload.isError ? <p className="mt-2 text-xs text-[#c92727]" role="alert">Image upload failed. Check the file type, size, and access permissions.</p> : null}
  </label>;
}
