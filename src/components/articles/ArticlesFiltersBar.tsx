import { FilterSheetButton } from '@/components/shared/FilterSheetButton';
import type { ArticlesFiltersBarProps } from '@/pages/articles/articlesPage.types';
import { ArticlesFilterSearchInput } from './articlesFiltersBar/ArticlesFilterSearchInput';
import { ArticlesFilterSheetFields } from './articlesFiltersBar/ArticlesFilterSheetFields';
import { ArticlesFiltersToolbarActions } from './articlesFiltersBar/ArticlesFiltersToolbarActions';

export function ArticlesFiltersBar({
  searchPlaceholder,
  searchInput,
  onSearchInputChange,
  isFetching,
  isLoading,
  articleFilterActiveCount,
  hasActiveFilters,
  onClearFilters,
  statusFilter,
  onStatusFilterChange,
  syncFailedOnly,
  onSyncFailedOnlyToggle,
  nonTerminalOnly,
  onNonTerminalOnlyToggle,
  listNonTerminalCount,
  selectedSyncCount,
  syncingSelected,
  isListSyncing,
  onSyncSelected,
  exporting,
  meta,
  onExport,
}: ArticlesFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ArticlesFilterSearchInput
        searchPlaceholder={searchPlaceholder}
        searchInput={searchInput}
        onSearchInputChange={onSearchInputChange}
        isFetching={isFetching}
        isLoading={isLoading}
      />

      <FilterSheetButton
        activeCount={articleFilterActiveCount}
        onClear={onClearFilters}
        clearDisabled={!hasActiveFilters}
        description="Filter articles by delivery status or sync state."
      >
        <ArticlesFilterSheetFields
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          syncFailedOnly={syncFailedOnly}
          onSyncFailedOnlyToggle={onSyncFailedOnlyToggle}
          nonTerminalOnly={nonTerminalOnly}
          onNonTerminalOnlyToggle={onNonTerminalOnlyToggle}
          listNonTerminalCount={listNonTerminalCount}
        />
      </FilterSheetButton>

      <ArticlesFiltersToolbarActions
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        selectedSyncCount={selectedSyncCount}
        syncingSelected={syncingSelected}
        isListSyncing={isListSyncing}
        onSyncSelected={onSyncSelected}
        exporting={exporting}
        meta={meta}
        onExport={onExport}
      />
    </div>
  );
}
