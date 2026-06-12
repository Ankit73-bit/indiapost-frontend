import {
  getDaysUntilTrackingExpiry,
  getTrackingRetentionStatus,
} from '@/lib/indiaPostRetention';

/** Admin-only badge for list rows — warns before / after India Post retention window. */
export function ListTrackingRetentionBadge({
  dispatchDate,
}: {
  dispatchDate: string;
}) {
  const status = getTrackingRetentionStatus(dispatchDate);
  if (status === 'ok') return null;

  const daysLeft = getDaysUntilTrackingExpiry(dispatchDate);

  if (status === 'expired') {
    return (
      <span className="mt-1 inline-block rounded border border-amber-300/60 bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
        IP tracking expired
      </span>
    );
  }

  return (
    <span className="mt-1 inline-block rounded border border-orange-300/60 bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-900 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-200">
      IP tracking ends in {daysLeft}d
    </span>
  );
}
