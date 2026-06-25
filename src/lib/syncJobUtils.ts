import type { SyncJob } from '@/types';

export function syncJobPercent(job: SyncJob): number {
  if (!job.totalArticles) return 0;
  return Math.min(
    100,
    Math.round((job.processedCount / job.totalArticles) * 100),
  );
}

export function isActiveSyncJob(job: SyncJob): boolean {
  return job.status === 'QUEUED' || job.status === 'RUNNING';
}
