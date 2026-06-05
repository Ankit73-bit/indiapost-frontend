import { type NormalizedStatus } from '@/types';

// ─── Status label & color config ─────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  NormalizedStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }
> = {
  BOOKED: {
    label: 'Booked',
    variant: 'secondary',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  IN_TRANSIT: {
    label: 'In Transit',
    variant: 'secondary',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    variant: 'secondary',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  DELIVERED: {
    label: 'Delivered',
    variant: 'default',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  NOT_DELIVERED: {
    label: 'Not Delivered',
    variant: 'destructive',
    color: 'bg-red-100 text-red-700 border-red-200',
  },
  RETURNED: {
    label: 'Returned',
    variant: 'secondary',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  DELIVERED_RTO: {
    label: 'RTO Delivered',
    variant: 'secondary',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
  },
  UNKNOWN: {
    label: 'Unknown',
    variant: 'outline',
    color: 'bg-gray-100 text-gray-500 border-gray-200',
  },
};

export const LIST_STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  ACTIVE: { label: 'Active', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  SYNCING: { label: 'Syncing', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200' },
  ARCHIVED: { label: 'Archived', color: 'bg-gray-100 text-gray-400 border-gray-200' },
};

export const SYNC_JOB_STATUS_CONFIG = {
  QUEUED:    { label: 'Queued',    color: 'bg-gray-100 text-gray-600 border-gray-200' },
  RUNNING:   { label: 'Running',   color: 'bg-blue-100 text-blue-700 border-blue-200' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200' },
  FAILED:    { label: 'Failed',    color: 'bg-red-100 text-red-700 border-red-200' },
  PARTIAL:   { label: 'Partial',   color: 'bg-orange-100 text-orange-700 border-orange-200' },
};

// ─── Date formatting ──────────────────────────────────────────────────────────

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelative(date: string | Date | undefined | null): string {
  if (!date) return '—';
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diff = (new Date(date).getTime() - Date.now()) / 1000;
  const absDiff = Math.abs(diff);

  if (absDiff < 60) return rtf.format(Math.round(diff), 'seconds');
  if (absDiff < 3600) return rtf.format(Math.round(diff / 60), 'minutes');
  if (absDiff < 86400) return rtf.format(Math.round(diff / 3600), 'hours');
  return rtf.format(Math.round(diff / 86400), 'days');
}

// ─── File size ────────────────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ─── Slug generation ──────────────────────────────────────────────────────────

export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
