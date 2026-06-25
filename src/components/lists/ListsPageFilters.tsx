import { ListsPageFiltersActiveChips } from '@/components/lists/ListsPageFiltersActiveChips';
import { ListsPageFiltersSearchInput } from '@/components/lists/ListsPageFiltersSearchInput';
import { ListsPageFiltersSheet } from '@/components/lists/ListsPageFiltersSheet';
import { ListsPageFiltersToolbar } from '@/components/lists/ListsPageFiltersToolbar';
import type { ListsPageFiltersProps } from '@/components/lists/listsPageFilters.types';

export type { ListsPageFiltersProps } from '@/components/lists/listsPageFilters.types';

export function ListsPageFilters({
  searchInput,
  onSearchInputChange,
  isFetching,
  isLoading,
  onClearSearch,
  filterActiveCount,
  hasFilters,
  onClearFilters,
  isAdmin,
  activeClients,
  clientIdFilter,
  onClientFilterChange,
  showAllYears,
  filterYear,
  yearOptions,
  onPatchFilters,
  filterMonth,
  hasYearParam,
  noticeTypeOptions,
  filterNoticeType,
  sortOrder,
  meta,
  customerInactive,
  onExportClick,
  onCreateClick,
  activeFilterChips,
}: ListsPageFiltersProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <ListsPageFiltersSearchInput
          searchInput={searchInput}
          onSearchInputChange={onSearchInputChange}
          isFetching={isFetching}
          isLoading={isLoading}
          onClearSearch={onClearSearch}
        />

        <ListsPageFiltersSheet
          filterActiveCount={filterActiveCount}
          hasFilters={hasFilters}
          onClearFilters={onClearFilters}
          isAdmin={isAdmin}
          activeClients={activeClients}
          clientIdFilter={clientIdFilter}
          onClientFilterChange={onClientFilterChange}
          showAllYears={showAllYears}
          filterYear={filterYear}
          yearOptions={yearOptions}
          onPatchFilters={onPatchFilters}
          filterMonth={filterMonth}
          hasYearParam={hasYearParam}
          noticeTypeOptions={noticeTypeOptions}
          filterNoticeType={filterNoticeType}
        />

        <ListsPageFiltersToolbar
          sortOrder={sortOrder}
          onPatchFilters={onPatchFilters}
          meta={meta}
          customerInactive={customerInactive}
          activeClientsCount={activeClients.length}
          onExportClick={onExportClick}
          onCreateClick={onCreateClick}
        />
      </div>

      <ListsPageFiltersActiveChips
        activeFilterChips={activeFilterChips}
        onClearFilters={onClearFilters}
      />
    </div>
  );
}
