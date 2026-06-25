import type { SyncJobStatus, SyncJobType } from '@/types';

export const SYNC_ALL_LISTS = '__all__';
export const SYNC_ALL_LISTS_FILTER = '__all_lists__';
export const SYNC_ALL_STATUS = '__all_status__';
export const SYNC_ALL_JOB_TYPES = '__all_job_types__';

export const SYNC_JOB_TYPES: SyncJobType[] = ['MANUAL', 'SCHEDULED', 'RETRY', 'PARTIAL'];

export const SYNC_JOB_STATUSES: SyncJobStatus[] = [
  'QUEUED',
  'RUNNING',
  'COMPLETED',
  'PARTIAL',
  'FAILED',
];
