import { Loader2 } from 'lucide-react';
import type { ListsPageTableProps } from '@/components/lists/listsPageTable.types';

export function ListsPageTableBodyStates({
  isLoading,
  isEmpty,
  hasFilters,
}: {
  isLoading: boolean;
  isEmpty: boolean;
  hasFilters: boolean;
}) {
  if (isLoading) {
    return (
      <tr>
        <td colSpan={8} className="px-4 py-8 text-center">
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
        </td>
      </tr>
    );
  }

  if (isEmpty) {
    return (
      <tr>
        <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
          {hasFilters
            ? 'No lists match your search or filters.'
            : 'No lists found.'}
        </td>
      </tr>
    );
  }

  return null;
}

export type { ListsPageTableProps };
