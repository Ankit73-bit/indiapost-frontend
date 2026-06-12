/** Matches backend `INDIA_POST_TRACKING_RETENTION_DAYS`. */
export const INDIA_POST_TRACKING_RETENTION_DAYS = 60;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type TrackingRetentionStatus = 'ok' | 'expiring-soon' | 'expired';

export function getTrackingRetentionAnchor(
  dispatchDate: string | Date,
  bookedOn?: string | Date | null,
): Date {
  if (bookedOn) return new Date(bookedOn);
  return new Date(dispatchDate);
}

export function getTrackingRetentionExpiryDate(
  dispatchDate: string | Date,
  bookedOn?: string | Date | null,
): Date {
  const anchor = getTrackingRetentionAnchor(dispatchDate, bookedOn);
  return new Date(
    anchor.getTime() + INDIA_POST_TRACKING_RETENTION_DAYS * MS_PER_DAY,
  );
}

export function getDaysUntilTrackingExpiry(
  dispatchDate: string | Date,
  bookedOn?: string | Date | null,
  nowMs: number = Date.now(),
): number {
  const expiry = getTrackingRetentionExpiryDate(dispatchDate, bookedOn).getTime();
  return Math.ceil((expiry - nowMs) / MS_PER_DAY);
}

export function getTrackingRetentionStatus(
  dispatchDate: string | Date,
  bookedOn?: string | Date | null,
  nowMs: number = Date.now(),
): TrackingRetentionStatus {
  const daysLeft = getDaysUntilTrackingExpiry(dispatchDate, bookedOn, nowMs);
  if (daysLeft <= 0) return 'expired';
  if (daysLeft <= 14) return 'expiring-soon';
  return 'ok';
}

export const INDIA_POST_RETENTION_ADMIN_NOTE =
  'India Post removes bulk tracking data about 60 days after dispatch. Sync lists within that window; after expiry we keep only data already stored locally.';
