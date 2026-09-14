import { AdminFeedback, AdminStatus } from './admin-feedback';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function AdminListImage({ src }: { src?: string }) {
  const [failedSrc, setFailedSrc] = useState<string>();
  return src && failedSrc !== src ? <img alt="" className="admin-list-image" src={src} onError={() => setFailedSrc(src)} /> : <span className="admin-list-image admin-list-image-empty" aria-label="No image">No image</span>;
}

export function AdminListDate({ value }: { value?: string }) {
  const date = value && /^\d{4}-\d{2}-\d{2}T/.test(value) ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? <time dateTime={value} title={value}>{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Phnom_Penh' })}</time> : <span>{value || 'Not available'}</span>;
}

export function AdminPublicationStatus({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const label = normalized === 'published' ? 'Published' : normalized === 'draft' ? 'Draft' : normalized === 'archived' || normalized === 'hidden' ? 'Archived' : status;
  return <AdminStatus tone={normalized === 'published' ? 'success' : normalized === 'draft' ? 'warning' : 'neutral'}>{label}</AdminStatus>;
}

export function AdminListEmpty({ filtered, noun, onClear }: { filtered: boolean; noun: string; onClear?: () => void }) {
  return <AdminFeedback title={filtered ? `No matching ${noun}` : `No ${noun} yet`} tone="empty" actions={filtered && onClear ? <Button onClick={onClear} variant="secondary">Clear filters</Button> : undefined}>
    <p>{filtered ? 'Try a different search or clear the filters to see all items.' : `New ${noun} will appear here when added.`}</p>
  </AdminFeedback>;
}

export function AdminListPagination({ page, totalPages, total, count, limit, noun, busy = false, onPageChange }: {
  page: number; totalPages: number; total: number; count: number; limit: number; noun: string; busy?: boolean; onPageChange: (page: number) => void;
}) {
  const first = count === 0 ? 0 : (page - 1) * limit + 1;
  const last = count === 0 ? 0 : Math.min((page - 1) * limit + count, total);
  return <nav aria-label={`${noun} pagination`} className="admin-list-pagination">
    <p aria-live="polite">{first}–{last} of {total} {noun}</p>
    <div><Button disabled={busy || page <= 1} onClick={() => onPageChange(page - 1)} variant="secondary">Previous</Button><span>Page {page} of {Math.max(1, totalPages)}</span><Button disabled={busy || page >= totalPages} onClick={() => onPageChange(page + 1)} variant="secondary">Next</Button></div>
  </nav>;
}
