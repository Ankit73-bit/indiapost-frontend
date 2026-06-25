import { ListPdfsDialog } from '@/components/lists/ListPdfsDialog';
import { ListContextBar } from '@/components/articles/ListContextBar';
import { ArticlesFiltersBar } from '@/components/articles/ArticlesFiltersBar';
import { ArticlesTable } from '@/components/articles/ArticlesTable';
import { ArticleSheet } from '@/components/articles/ArticleSheet';
import { useArticlesListView } from '@/hooks/useArticlesListView';
import type { ArticlesListViewProps } from '@/pages/articles/articlesPage.types';

export function ArticlesListView({
  clientId,
  listId,
  isAdmin,
}: ArticlesListViewProps) {
  const view = useArticlesListView(clientId, listId);

  return (
    <>
      <ListContextBar
        clientId={clientId}
        listId={listId}
        isAdmin={isAdmin}
        totalArticles={view.data?.meta?.total}
        onOpenPdfs={() => view.setPdfsOpen(true)}
      />

      <ListPdfsDialog
        open={view.pdfsOpen}
        onClose={() => view.setPdfsOpen(false)}
        listId={listId}
        clientId={clientId}
        listName={view.listDisplayName}
        listSlug={view.listMeta?.slug ?? 'list'}
        isAdmin={isAdmin}
      />

      <ArticlesFiltersBar
        searchPlaceholder={view.searchPlaceholder}
        searchInput={view.searchInput}
        onSearchInputChange={view.handleSearchInputChange}
        isFetching={view.isFetching}
        isLoading={view.isLoading}
        articleFilterActiveCount={view.articleFilterActiveCount}
        hasActiveFilters={view.hasActiveFilters}
        onClearFilters={view.clearFilters}
        statusFilter={view.statusFilter}
        onStatusFilterChange={view.handleStatusFilterChange}
        syncFailedOnly={view.syncFailedOnly}
        onSyncFailedOnlyToggle={view.handleSyncFailedOnlyToggle}
        nonTerminalOnly={view.nonTerminalOnly}
        onNonTerminalOnlyToggle={view.handleNonTerminalOnlyToggle}
        listNonTerminalCount={view.listNonTerminalCount}
        selectedSyncCount={view.selectedSyncIds.size}
        syncingSelected={view.syncingSelected}
        isListSyncing={view.isListSyncing}
        onSyncSelected={() => void view.handleSyncSelected()}
        exporting={view.exporting}
        meta={view.data?.meta}
        onExport={() => void view.handleExportFiltered()}
      />

      <ArticlesTable
        isError={view.isError}
        isLoading={view.isLoading}
        isImporting={view.isImporting}
        hasActiveFilters={view.hasActiveFilters}
        syncFailedOnly={view.syncFailedOnly}
        clientId={clientId}
        listId={listId}
        isAdmin={isAdmin}
        isListSyncing={view.isListSyncing}
        articles={view.articles}
        extraCols={view.extraCols}
        hasLoanAccount={Boolean(view.hasLoanAccount)}
        hasCustomerId={Boolean(view.hasCustomerId)}
        pdfArticleNumbers={view.pdfArticleNumbers}
        selectedArticleId={view.selectedArticle?._id}
        onSelectArticle={view.setSelectedArticle}
        selectedSyncIds={view.selectedSyncIds}
        onToggleSyncSelection={view.toggleSyncSelection}
        headerCheckboxChecked={view.headerCheckboxChecked}
        selectingAllSyncable={view.selectingAllSyncable}
        onToggleAllSyncable={view.handleToggleAllSyncable}
        nonTerminalOnly={view.nonTerminalOnly}
        listNonTerminalCount={view.listNonTerminalCount}
        syncableOnPageCount={view.syncableOnPage.length}
        listMeta={view.listMeta}
        onClearFilters={view.clearFilters}
        onRefetch={() => void view.refetch()}
        meta={view.data?.meta}
        onPageChange={view.setPage}
      />

      {view.selectedArticle && (
        <ArticleSheet
          article={view.selectedArticle}
          isAdmin={isAdmin}
          onClose={() => view.setSelectedArticle(null)}
        />
      )}
    </>
  );
}
