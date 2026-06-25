import {
  Plus,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PaginationMeta } from '@/types';

interface ListsPageFiltersToolbarProps {
  sortOrder: 'asc' | 'desc';
  onPatchFilters: (updates: Record<string, string | null>) => void;
  meta: PaginationMeta | undefined;
  customerInactive: boolean;
  activeClientsCount: number;
  onExportClick: () => void;
  onCreateClick: () => void;
}

export function ListsPageFiltersToolbar({
  sortOrder,
  onPatchFilters,
  meta,
  customerInactive,
  activeClientsCount,
  onExportClick,
  onCreateClick,
}: ListsPageFiltersToolbarProps) {
  const actionsDisabled = customerInactive || activeClientsCount === 0;

  return (
    <>
      <Button
        variant={sortOrder === 'asc' ? 'default' : 'outline'}
        size="sm"
        className="gap-1.5 shrink-0"
        title={
          sortOrder === 'desc'
            ? 'Sorted by newest dispatch first'
            : 'Sorted by oldest dispatch first'
        }
        onClick={() =>
          onPatchFilters({
            sortOrder: sortOrder === 'desc' ? 'asc' : null,
          })
        }
      >
        {sortOrder === 'desc' ? (
          <ArrowDownWideNarrow className="h-3.5 w-3.5" />
        ) : (
          <ArrowUpWideNarrow className="h-3.5 w-3.5" />
        )}
        {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
      </Button>

      <span className="flex-1" />

      {meta && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {meta.total.toLocaleString()} list
          {meta.total !== 1 ? 's' : ''}
        </span>
      )}

      <div className="flex items-center gap-2 border-l border-border pl-2 ml-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onExportClick}
          disabled={actionsDisabled}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" /> Export
        </Button>
        <Button size="sm" onClick={onCreateClick} disabled={actionsDisabled}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New List
        </Button>
      </div>
    </>
  );
}
