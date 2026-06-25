import { SyncJobStatusBadge } from '@/components/shared/StatusBadge';
import { formatRelative } from '@/lib/helpers';
import type { useListSyncJobsQuery } from '@/store/api/syncApi';

interface RecentSyncJobsCardProps {
  recentJobs: ReturnType<typeof useListSyncJobsQuery>['data'];
  onViewAll: () => void;
}

export function RecentSyncJobsCard({
  recentJobs,
  onViewAll,
}: RecentSyncJobsCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Recent Sync Jobs</h2>
        <button
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          onClick={onViewAll}
        >
          View all
        </button>
      </div>
      {!recentJobs?.data.length && (
        <p className="text-sm text-muted-foreground">No sync jobs yet.</p>
      )}
      <div className="space-y-2">
        {recentJobs?.data.map((job) => (
          <div
            key={job._id}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <SyncJobStatusBadge status={job.status} />
              <span className="truncate text-xs text-muted-foreground capitalize">
                {job.triggeredBy}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
              <span className="font-mono">
                {job.processedCount}/{job.totalArticles}
              </span>
              <span>{formatRelative(job.startedAt ?? job.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
