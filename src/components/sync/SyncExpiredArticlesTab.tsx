import { Loader2 } from 'lucide-react';
import { TableShell } from '@/components/shared/TableShell';
import { Pagination } from '@/components/shared/Pagination';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { formatDate } from '@/lib/helpers';
import type { useListTrackingExpiredArticlesQuery } from '@/store/api/syncApi';

interface SyncExpiredArticlesTabProps {
  expiredData: ReturnType<typeof useListTrackingExpiredArticlesQuery>['data'];
  expiredLoading: boolean;
  onPageChange: (page: number) => void;
}

export function SyncExpiredArticlesTab({
  expiredData,
  expiredLoading,
  onPageChange,
}: SyncExpiredArticlesTabProps) {
  return (
    <>
      <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        Tracking expired
        <HelpTooltip content="Articles past India Post's ~60-day tracking window. Local tracking events are kept; further syncs are skipped automatically." />
      </div>
      <TableShell
        footer={
          expiredData?.meta && expiredData.meta.totalPages > 1 ? (
            <div className="px-4 pb-4">
              <Pagination meta={expiredData.meta} onPageChange={onPageChange} />
            </div>
          ) : undefined
        }
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Article #
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                List
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Dispatch
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Last Synced
              </th>
            </tr>
          </thead>
          <tbody>
            {expiredLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </td>
              </tr>
            )}
            {!expiredLoading && expiredData?.data.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No tracking-expired articles.
                </td>
              </tr>
            )}
            {expiredData?.data.map((row) => (
              <tr
                key={row._id}
                className="border-b border-border/50 last:border-0"
              >
                <td className="px-4 py-3 font-mono text-xs">
                  {row.articleNumber}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs max-w-[180px] truncate">
                  {row.listName ?? row.listId.slice(-6)}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                  {formatDate(row.dispatchDate)}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {row.normalizedStatus}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                  {formatDate(row.lastSyncedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </>
  );
}
