import { Info } from 'lucide-react';
import { INDIA_POST_RETENTION_ADMIN_NOTE } from '@/lib/indiaPostRetention';

/** Admin-only callout explaining India Post's ~60-day tracking retention. */
export function TrackingRetentionAdminNote({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100 ${className ?? ''}`}
    >
      <div className="flex gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{INDIA_POST_RETENTION_ADMIN_NOTE}</p>
      </div>
    </div>
  );
}
