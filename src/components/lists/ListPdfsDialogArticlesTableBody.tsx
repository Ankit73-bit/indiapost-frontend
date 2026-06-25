import { Loader2 } from 'lucide-react';
import { ListPdfsDialogArticleRow } from '@/components/lists/ListPdfsDialogArticleRow';
import type { PdfArticleItem } from '@/types';

interface ListPdfsDialogArticlesTableBodyProps {
  articles: PdfArticleItem[];
  totalArticles: number;
  selected: Set<string>;
  isLoading: boolean;
  isSearchPending: boolean;
  busyAction: string | null;
  onToggleOne: (articleNumber: string) => void;
  onView: (articleNumber: string) => void;
  onDownloadOne: (articleNumber: string) => void;
}

export function ListPdfsDialogArticlesTableBody({
  articles,
  totalArticles,
  selected,
  isLoading,
  isSearchPending,
  busyAction,
  onToggleOne,
  onView,
  onDownloadOne,
}: ListPdfsDialogArticlesTableBodyProps) {
  if (isLoading || isSearchPending) {
    return (
      <tr>
        <td colSpan={4} className="px-4 py-10 text-center">
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
        </td>
      </tr>
    );
  }

  if (articles.length === 0) {
    return (
      <tr>
        <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
          {totalArticles === 0
            ? 'No articles in this list yet.'
            : 'No articles match your search.'}
        </td>
      </tr>
    );
  }

  return (
    <>
      {articles.map((item) => (
        <ListPdfsDialogArticleRow
          key={item.articleNumber}
          item={item}
          isSelected={selected.has(item.articleNumber)}
          viewBusy={busyAction === `view-${item.articleNumber}`}
          dlBusy={busyAction === `dl-${item.articleNumber}`}
          busyAction={busyAction}
          onToggle={() => onToggleOne(item.articleNumber)}
          onView={() => void onView(item.articleNumber)}
          onDownload={() => void onDownloadOne(item.articleNumber)}
        />
      ))}
    </>
  );
}

export function ListPdfsDialogArticlesTableHeader({
  allPageSelected,
  onToggleAllOnPage,
}: {
  allPageSelected: boolean;
  onToggleAllOnPage: () => void;
}) {
  return (
    <thead>
      <tr className="border-b border-border bg-muted/40">
        <th className="w-10 px-3 py-2">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-border"
            checked={allPageSelected}
            onChange={onToggleAllOnPage}
            aria-label="Select all articles on this page"
          />
        </th>
        <th className="px-3 py-2 text-left font-medium text-muted-foreground">
          Article
        </th>
        <th className="hidden px-3 py-2 text-left font-medium text-muted-foreground sm:table-cell">
          Status
        </th>
        <th className="px-3 py-2 text-right font-medium text-muted-foreground">
          Actions
        </th>
      </tr>
    </thead>
  );
}
