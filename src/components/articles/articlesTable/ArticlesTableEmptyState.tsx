import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OperationProgressBar } from '@/components/shared/OperationProgressBar';
import { importPercent } from '@/lib/listProgress';
import type { List } from '@/types';

interface ArticlesTableEmptyStateProps {
  colSpan: number;
  isImporting: boolean;
  hasActiveFilters: boolean;
  syncFailedOnly: boolean;
  clientId: string;
  listId: string;
  listMeta?: List;
  onClearFilters: () => void;
}

export function ArticlesTableEmptyState({
  colSpan,
  isImporting,
  hasActiveFilters,
  syncFailedOnly,
  clientId,
  listId,
  listMeta,
  onClearFilters,
}: ArticlesTableEmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center">
        {isImporting && !hasActiveFilters ? (
          <div className="mx-auto max-w-sm space-y-3">
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
            <p className="font-medium">Import in progress</p>
            <p className="text-sm text-muted-foreground">
              Articles appear here as rows are processed. You can
              leave this page — import continues on the server.
            </p>
            {listMeta?.importProgress && (
              <OperationProgressBar
                variant="import"
                percent={importPercent(listMeta)}
                label={`${listMeta.importProgress.processedRows.toLocaleString()} / ${listMeta.importProgress.totalRows.toLocaleString()} rows`}
                className="mx-auto max-w-[200px]"
              />
            )}
          </div>
        ) : (
          <>
            <p className="text-muted-foreground">
              {hasActiveFilters
                ? 'No articles match your filters.'
                : 'No articles in this list yet.'}
            </p>
            {hasActiveFilters && (
              <Button
                variant="link"
                size="sm"
                className="mt-1 h-auto p-0"
                onClick={onClearFilters}
              >
                Clear filters
              </Button>
            )}
            {syncFailedOnly && (
              <Button
                variant="link"
                size="sm"
                className="mt-1 h-auto p-0"
                asChild
              >
                <Link
                  to={`/sync?tab=failed&clientId=${clientId}&listId=${listId}`}
                >
                  View on Sync page
                </Link>
              </Button>
            )}
          </>
        )}
      </td>
    </tr>
  );
}
