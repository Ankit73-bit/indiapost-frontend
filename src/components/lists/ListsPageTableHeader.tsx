import { Pagination } from '@/components/shared/Pagination';
import type { PaginationMeta } from '@/types';

export function ListsPageTableHeader() {
  return (
    <thead>
      <tr className="border-b border-border bg-muted/40">
        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
          Notice
        </th>
        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
          Client
        </th>
        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
          Type
        </th>
        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
          Status
        </th>
        <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
          Articles
        </th>
        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
          Dispatch
        </th>
        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
          File
        </th>
        <th className="px-4 py-2.5 text-right font-medium text-muted-foreground w-12">
          Actions
        </th>
      </tr>
    </thead>
  );
}

export function ListsPageTableFooter({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Page {meta.page} of {meta.totalPages} · {meta.total.toLocaleString()} total
      </p>
      {meta.totalPages > 1 && (
        <Pagination meta={meta} onPageChange={onPageChange} />
      )}
    </div>
  );
}
