import { Loader2, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableShell } from '@/components/shared/TableShell';
import { Pagination } from '@/components/shared/Pagination';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { formatRelative } from '@/lib/helpers';
import type { FailedArticle } from '@/types';
import type { useListFailedArticlesQuery } from '@/store/api/syncApi';

interface SyncFailedArticlesTabProps {
  failedData: ReturnType<typeof useListFailedArticlesQuery>['data'];
  failedLoading: boolean;
  failedRows: FailedArticle[];
  failedSearchInput: string;
  onFailedSearchInputChange: (value: string) => void;
  onFailedPageReset: () => void;
  failedSelectionCount: number;
  bulkRetrying: boolean;
  onBulkRetry: () => void;
  failedHeaderChecked: boolean;
  onToggleAllFailed: () => void;
  selectingAllFailed: boolean;
  allFailedSelected: boolean;
  selectedFailedIds: Set<string>;
  onToggleFailedSelection: (articleId: string) => void;
  onRetry: (articleId: string) => void;
  failedSearch: string;
  onPageChange: (page: number) => void;
}

export function SyncFailedArticlesTab({
  failedData,
  failedLoading,
  failedRows,
  failedSearchInput,
  onFailedSearchInputChange,
  onFailedPageReset,
  failedSelectionCount,
  bulkRetrying,
  onBulkRetry,
  failedHeaderChecked,
  onToggleAllFailed,
  selectingAllFailed,
  allFailedSelected,
  selectedFailedIds,
  onToggleFailedSelection,
  onRetry,
  failedSearch,
  onPageChange,
}: SyncFailedArticlesTabProps) {
  return (
    <>
      <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        Failed sync attempts
        <HelpTooltip content="Articles where the last sync attempt failed. Select rows and retry in bulk, or use Trigger Sync on the list to retry all non-terminal articles." />
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search article # or error…"
            className="pl-8"
            value={failedSearchInput}
            onChange={(e) => {
              onFailedSearchInputChange(e.target.value);
              onFailedPageReset();
            }}
          />
        </div>
        {failedSelectionCount > 0 && (
          <Button
            size="sm"
            className="gap-1.5"
            disabled={bulkRetrying}
            onClick={onBulkRetry}
          >
            {bulkRetrying ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            Retry selected ({failedSelectionCount.toLocaleString()})
          </Button>
        )}
        {failedData?.meta && (
          <span className="ml-auto text-xs text-muted-foreground">
            {failedData.meta.total.toLocaleString()} failed article
            {failedData.meta.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <TableShell
        footer={
          failedData?.meta && failedData.meta.totalPages > 1 ? (
            <div className="px-4 pb-4">
              <Pagination meta={failedData.meta} onPageChange={onPageChange} />
            </div>
          ) : undefined
        }
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-border"
                  checked={failedHeaderChecked}
                  onChange={onToggleAllFailed}
                  disabled={
                    failedRows.length === 0 ||
                    selectingAllFailed ||
                    failedLoading
                  }
                  aria-label={
                    failedData?.meta &&
                    failedData.meta.total > failedRows.length
                      ? 'Select all failed articles matching filters'
                      : 'Select all failed articles on this page'
                  }
                />
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Article #
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Reason
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                Attempts
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Last Attempt
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {failedLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </td>
              </tr>
            )}
            {!failedLoading && failedRows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {failedSearch
                    ? 'No failed articles match your search.'
                    : 'No failed articles.'}
                </td>
              </tr>
            )}
            {failedRows.map((fa) => (
              <tr
                key={fa._id}
                className="border-b border-border/50 last:border-0"
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-border"
                    checked={
                      allFailedSelected || selectedFailedIds.has(fa.articleId)
                    }
                    onChange={() => onToggleFailedSelection(fa.articleId)}
                    aria-label={`Select ${fa.articleNumber}`}
                  />
                </td>
                <td className="px-4 py-3 text-xs">{fa.articleNumber}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-sm truncate">
                  {fa.reason}
                </td>
                <td className="px-4 py-3 text-right">{fa.retryCount}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {formatRelative(fa.updatedAt ?? fa.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1"
                    onClick={() => onRetry(fa.articleId)}
                  >
                    <RotateCcw className="h-3 w-3" /> Retry
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </>
  );
}
