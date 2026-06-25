import { Loader2 } from 'lucide-react';
import { TableShell } from '@/components/shared/TableShell';
import { SyncJobStatusBadge } from '@/components/shared/StatusBadge';
import { Pagination } from '@/components/shared/Pagination';
import { formatRelative } from '@/lib/helpers';
import { isActiveSyncJob, syncJobPercent } from '@/lib/syncJobUtils';
import type { Client, SyncJob } from '@/types';
import type { useListClientsQuery } from '@/store/api/clientsApi';
import type { useListSyncJobsQuery } from '@/store/api/syncApi';

interface SyncJobsTabProps {
  jobsData: ReturnType<typeof useListSyncJobsQuery>['data'];
  jobsLoading: boolean;
  clientsData: ReturnType<typeof useListClientsQuery>['data'];
  listNameById: Map<string, string>;
  onPageChange: (page: number) => void;
}

export function SyncJobsTab({
  jobsData,
  jobsLoading,
  clientsData,
  listNameById,
  onPageChange,
}: SyncJobsTabProps) {
  return (
    <TableShell
      minWidthClass="min-w-[900px]"
      footer={
        jobsData?.meta && jobsData.meta.total > 0 ? (
          <div className="px-4 pb-4">
            <Pagination meta={jobsData.meta} onPageChange={onPageChange} />
          </div>
        ) : undefined
      }
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
              Job ID
            </th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
              Client
            </th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
              List
            </th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
              Progress
            </th>
            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
              Failed
            </th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
              Started
            </th>
          </tr>
        </thead>
        <tbody>
          {jobsLoading && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center">
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
              </td>
            </tr>
          )}
          {!jobsLoading && jobsData?.data.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                No sync jobs match your filters.
              </td>
            </tr>
          )}
          {jobsData?.data.map((job: SyncJob) => (
            <tr
              key={job._id}
              className="border-b border-border/50 last:border-0"
            >
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {job._id.slice(-8)}
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs">
                {clientsData?.data.find((c: Client) => c._id === job.clientId)?.name ??
                  job.clientId.slice(-6)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {job.listId ? (
                  <span
                    className="block truncate text-xs"
                    title={listNameById.get(job.listId) ?? job.listId}
                  >
                    {listNameById.get(job.listId) ?? job.listId.slice(-6)}
                  </span>
                ) : (
                  '—'
                )}
              </td>
              <td className="px-4 py-3">
                <SyncJobStatusBadge status={job.status} />
              </td>
              <td className="px-4 py-3 min-w-[160px]">
                {job.totalArticles > 0 ? (
                  <div className="space-y-1">
                    <div className="h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isActiveSyncJob(job)
                            ? 'bg-blue-500'
                            : 'bg-muted-foreground/40'
                        }`}
                        style={{ width: `${syncJobPercent(job)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {job.processedCount.toLocaleString()} /{' '}
                      {job.totalArticles.toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-right text-destructive">
                {job.failedCount > 0 ? job.failedCount : '—'}
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs">
                {formatRelative(job.startedAt ?? job.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}
