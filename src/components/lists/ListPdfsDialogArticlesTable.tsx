import { Pagination } from '@/components/shared/Pagination';
import {
  ListPdfsDialogArticlesTableBody,
  ListPdfsDialogArticlesTableHeader,
} from '@/components/lists/ListPdfsDialogArticlesTableBody';
import type { PaginationMeta, PdfArticleItem } from '@/types';

interface ListPdfsDialogArticlesTableProps {
  articles: PdfArticleItem[];
  totalArticles: number;
  selected: Set<string>;
  allPageSelected: boolean;
  isLoading: boolean;
  isSearchPending: boolean;
  busyAction: string | null;
  pdfMeta?: PaginationMeta;
  onToggleAllOnPage: () => void;
  onToggleOne: (articleNumber: string) => void;
  onView: (articleNumber: string) => void;
  onDownloadOne: (articleNumber: string) => void;
  onPageChange: (page: number) => void;
}

export function ListPdfsDialogArticlesTable({
  articles,
  totalArticles,
  selected,
  allPageSelected,
  isLoading,
  isSearchPending,
  busyAction,
  pdfMeta,
  onToggleAllOnPage,
  onToggleOne,
  onView,
  onDownloadOne,
  onPageChange,
}: ListPdfsDialogArticlesTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <ListPdfsDialogArticlesTableHeader
          allPageSelected={allPageSelected}
          onToggleAllOnPage={onToggleAllOnPage}
        />
        <tbody>
          <ListPdfsDialogArticlesTableBody
            articles={articles}
            totalArticles={totalArticles}
            selected={selected}
            isLoading={isLoading}
            isSearchPending={isSearchPending}
            busyAction={busyAction}
            onToggleOne={onToggleOne}
            onView={onView}
            onDownloadOne={onDownloadOne}
          />
        </tbody>
      </table>
      {pdfMeta && pdfMeta.total > 0 && (
        <div className="px-3 pb-3">
          <Pagination meta={pdfMeta} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
