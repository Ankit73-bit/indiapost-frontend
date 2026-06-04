import { cn } from '@/lib/utils';
import { STATUS_CONFIG, LIST_STATUS_CONFIG, SYNC_JOB_STATUS_CONFIG } from '@/lib/helpers';
import type { NormalizedStatus, ListStatus, SyncJobStatus } from '@/types';

interface ArticleStatusBadgeProps {
  status: NormalizedStatus;
  className?: string;
}

export function ArticleStatusBadge({ status, className }: ArticleStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.UNKNOWN;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium',
        config.color,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

interface ListStatusBadgeProps {
  status: ListStatus;
  className?: string;
}

export function ListStatusBadge({ status, className }: ListStatusBadgeProps) {
  const config = LIST_STATUS_CONFIG[status] ?? LIST_STATUS_CONFIG.DRAFT;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium',
        config.color,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

interface SyncJobStatusBadgeProps {
  status: SyncJobStatus;
  className?: string;
}

export function SyncJobStatusBadge({ status, className }: SyncJobStatusBadgeProps) {
  const config = SYNC_JOB_STATUS_CONFIG[status] ?? SYNC_JOB_STATUS_CONFIG.pending;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium',
        config.color,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
