import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { ListPdfsDialogArticlesTable } from '@/components/lists/ListPdfsDialogArticlesTable';
import { ListPdfsDialogHeader } from '@/components/lists/ListPdfsDialogHeader';
import { ListPdfsDialogLargeListBanner } from '@/components/lists/ListPdfsDialogLargeListBanner';
import { ListPdfsDialogSearch } from '@/components/lists/ListPdfsDialogSearch';
import { ListPdfsDialogSummary } from '@/components/lists/ListPdfsDialogSummary';
import { ListPdfsDialogToolbar } from '@/components/lists/ListPdfsDialogToolbar';
import { ListPdfsDialogViewerPanel } from '@/components/lists/ListPdfsDialogViewerPanel';
import { ListPdfsDialogZipProgress } from '@/components/lists/ListPdfsDialogZipProgress';
import type { ListPdfsDialogBodyProps } from '@/components/lists/listPdfsDialog.types';
import { useListPdfsDialogBody } from '@/hooks/useListPdfsDialogBody';
import { cn } from '@/lib/utils';

export function ListPdfsDialogBody({
  onClose,
  listId,
  clientId,
  listName,
  viewingArticle,
  onViewingArticleChange,
}: ListPdfsDialogBodyProps) {
  const body = useListPdfsDialogBody({
    listId,
    clientId,
    listName,
    onViewingArticleChange,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
      {viewingArticle && (
        <ListPdfsDialogViewerPanel
          listId={listId}
          clientId={clientId}
          viewingArticle={viewingArticle}
          downloading={body.busyAction === `dl-${viewingArticle}`}
          onClose={() => onViewingArticleChange(null)}
          onDownload={() => void body.handleDownloadOne(viewingArticle)}
        />
      )}

      <div
        className={cn(
          'flex min-h-0 min-w-0 flex-col',
          viewingArticle ? 'w-full lg:w-1/2' : 'w-full',
        )}
      >
        <ListPdfsDialogHeader listName={listName} />

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <ListPdfsDialogSummary totalArticles={body.totalArticles} />

          <ListPdfsDialogLargeListBanner totalArticles={body.totalArticles} />

          <ListPdfsDialogZipProgress
            listZipTask={body.listZipTask}
            onCancel={body.cancelZipDownload}
          />

          <ListPdfsDialogToolbar
            totalArticles={body.totalArticles}
            selectedCount={body.selected.size}
            isZipBusy={body.isZipBusy}
            isFetching={body.isFetching}
            onDownloadAll={body.handleDownloadAll}
            onDownloadSelected={body.handleDownloadSelected}
            onClearSelection={body.clearSelection}
            onRefetch={() => void body.refetch()}
          />

          <ListPdfsDialogSearch
            search={body.search}
            onSearchChange={body.handleSearchChange}
          />

          <ListPdfsDialogArticlesTable
            articles={body.articles}
            totalArticles={body.totalArticles}
            selected={body.selected}
            allPageSelected={body.allPageSelected}
            isLoading={body.isLoading}
            isSearchPending={body.isSearchPending}
            busyAction={body.busyAction}
            pdfMeta={body.pdfMeta}
            onToggleAllOnPage={body.toggleAllOnPage}
            onToggleOne={body.toggleOne}
            onView={body.handleView}
            onDownloadOne={body.handleDownloadOne}
            onPageChange={body.setPage}
          />
        </div>

        <DialogFooter className="shrink-0 border-t border-border px-7 py-3 mb-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </div>
    </div>
  );
}
