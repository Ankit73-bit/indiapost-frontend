import type { FilterChip } from '@/pages/lists/listsPage.types';
import type { Client, PaginationMeta } from '@/types';

export interface ListsPageFiltersProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  isFetching: boolean;
  isLoading: boolean;
  onClearSearch: () => void;
  filterActiveCount: number;
  hasFilters: boolean;
  onClearFilters: () => void;
  isAdmin: boolean;
  activeClients: Client[];
  clientIdFilter: string | undefined;
  onClientFilterChange: (clientId: string | undefined) => void;
  showAllYears: boolean;
  filterYear: string;
  yearOptions: number[];
  onPatchFilters: (updates: Record<string, string | null>) => void;
  filterMonth: string;
  hasYearParam: boolean;
  noticeTypeOptions: string[];
  filterNoticeType: string;
  sortOrder: 'asc' | 'desc';
  meta: PaginationMeta | undefined;
  customerInactive: boolean;
  onExportClick: () => void;
  onCreateClick: () => void;
  activeFilterChips: FilterChip[];
}
