import { Loader2 } from 'lucide-react';
import { Pagination } from '@/components/shared/Pagination';
import type { ArticlesTableProps } from '@/pages/articles/articlesPage.types';
import { ArticlesTableEmptyState } from './articlesTable/ArticlesTableEmptyState';
import { ArticlesTableErrorState } from './articlesTable/ArticlesTableErrorState';
import { ArticlesTableHeader } from './articlesTable/ArticlesTableHeader';
import { ArticlesTableRow } from './articlesTable/ArticlesTableRow';
import { articlesTableColSpan } from './articlesTable/articlesTable.utils';

export function ArticlesTable({
  isError,
  isLoading,
  isImporting,
  hasActiveFilters,
  syncFailedOnly,
  clientId,
  listId,
  isAdmin,
  isListSyncing,
  articles,
  extraCols,
  hasLoanAccount,
  hasCustomerId,
  pdfArticleNumbers,
  selectedArticleId,
  onSelectArticle,
  selectedSyncIds,
  onToggleSyncSelection,
  headerCheckboxChecked,
  selectingAllSyncable,
  onToggleAllSyncable,
  nonTerminalOnly,
  listNonTerminalCount,
  syncableOnPageCount,
  listMeta,
  onClearFilters,
  onRefetch,
  meta,
  onPageChange,
}: ArticlesTableProps) {
  const colSpan = articlesTableColSpan(extraCols);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {isError ? (
        <ArticlesTableErrorState onRefetch={onRefetch} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <ArticlesTableHeader
              extraCols={extraCols}
              hasLoanAccount={hasLoanAccount}
              hasCustomerId={hasCustomerId}
              headerCheckboxChecked={headerCheckboxChecked}
              selectingAllSyncable={selectingAllSyncable}
              nonTerminalOnly={nonTerminalOnly}
              listNonTerminalCount={listNonTerminalCount}
              syncableOnPageCount={syncableOnPageCount}
              isListSyncing={isListSyncing}
              onToggleAllSyncable={onToggleAllSyncable}
            />
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-12 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              )}
              {!isLoading && articles.length === 0 && (
                <ArticlesTableEmptyState
                  colSpan={colSpan}
                  isImporting={isImporting}
                  hasActiveFilters={hasActiveFilters}
                  syncFailedOnly={syncFailedOnly}
                  clientId={clientId}
                  listId={listId}
                  listMeta={listMeta}
                  onClearFilters={onClearFilters}
                />
              )}
              {articles.map((article) => (
                <ArticlesTableRow
                  key={article._id}
                  article={article}
                  selectedArticleId={selectedArticleId}
                  onSelectArticle={onSelectArticle}
                  hasLoanAccount={hasLoanAccount}
                  hasCustomerId={hasCustomerId}
                  pdfArticleNumbers={pdfArticleNumbers}
                  selectedSyncIds={selectedSyncIds}
                  isListSyncing={isListSyncing}
                  isAdmin={isAdmin}
                  onToggleSyncSelection={onToggleSyncSelection}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isError && meta && meta.totalPages > 1 && (
        <div className="border-t border-border px-4 py-3">
          <Pagination meta={meta} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
