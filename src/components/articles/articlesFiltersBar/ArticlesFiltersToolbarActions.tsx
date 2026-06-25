import { X, Loader2, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PaginationMeta } from '@/types';

interface ArticlesFiltersToolbarActionsProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  selectedSyncCount: number;
  syncingSelected: boolean;
  isListSyncing: boolean;
  onSyncSelected: () => void;
  exporting: boolean;
  meta?: PaginationMeta;
  onExport: () => void;
}

export function ArticlesFiltersToolbarActions({
  hasActiveFilters,
  onClearFilters,
  selectedSyncCount,
  syncingSelected,
  isListSyncing,
  onSyncSelected,
  exporting,
  meta,
  onExport,
}: ArticlesFiltersToolbarActionsProps) {
  return (
    <>
      {selectedSyncCount > 0 && (
        <Button
          size="sm"
          className="gap-1.5 shrink-0"
          disabled={syncingSelected || isListSyncing}
          onClick={onSyncSelected}
        >
          {syncingSelected ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Sync selected ({selectedSyncCount})
        </Button>
      )}

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="mr-1 h-3.5 w-3.5" /> Clear
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 shrink-0"
        disabled={exporting || (meta?.total ?? 0) === 0}
        title={
          (meta?.total ?? 0) === 0
            ? 'No articles to export'
            : hasActiveFilters
              ? 'Export filtered articles'
              : 'Export all articles'
        }
        onClick={onExport}
      >
        {exporting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        Export
      </Button>

      {meta && (
        <span className="ml-auto text-xs text-muted-foreground shrink-0">
          {meta.total.toLocaleString()} article
          {meta.total !== 1 ? 's' : ''}
          {hasActiveFilters && ' matching filters'}
        </span>
      )}
    </>
  );
}
