import { SearchableClientSelect } from '@/components/shared/SearchableClientSelect';
import {
  SearchableNoticeTypeSelect,
  ALL_NOTICE_TYPES,
} from '@/components/shared/SearchableNoticeTypeSelect';
import {
  FilterSheetButton,
  FilterField,
} from '@/components/shared/FilterSheetButton';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ALL_MONTHS,
  ALL_YEARS,
  currentYear,
  MONTH_OPTIONS,
} from '@/pages/lists/listsPage.constants';
import type { Client } from '@/types';

interface ListsPageFiltersSheetProps {
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
}

export function ListsPageFiltersSheet({
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
}: ListsPageFiltersSheetProps) {
  return (
    <FilterSheetButton
      activeCount={filterActiveCount}
      onClear={onClearFilters}
      clearDisabled={!hasFilters}
      description="Narrow lists by client, date, or notice type."
    >
      {isAdmin && (
        <FilterField
          label="Client"
          hint={
            <HelpTooltip content="Filter lists to a single client organization." />
          }
        >
          <SearchableClientSelect
            clients={activeClients}
            value={clientIdFilter}
            onChange={onClientFilterChange}
            className="w-full"
            portaled={false}
          />
        </FilterField>
      )}

      <FilterField
        label="Year"
        hint={
          <HelpTooltip content="Filter by notice date year. Defaults to the current year." />
        }
      >
        <Select
          value={showAllYears ? ALL_YEARS : filterYear}
          onValueChange={(v) =>
            onPatchFilters({ year: v === ALL_YEARS ? 'all' : v })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
            <SelectItem value={ALL_YEARS}>All years</SelectItem>
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Month">
        <Select
          value={filterMonth || ALL_MONTHS}
          onValueChange={(v) => {
            const month = v === ALL_MONTHS ? null : v;
            const updates: Record<string, string | null> = { month };
            if (month && (showAllYears || !hasYearParam)) {
              updates.year = String(currentYear());
            }
            onPatchFilters(updates);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_MONTHS}>All months</SelectItem>
            {MONTH_OPTIONS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField
        label="Notice type"
        hint={
          <HelpTooltip content="Filter by notice type code used when the list was created." />
        }
      >
        <SearchableNoticeTypeSelect
          options={noticeTypeOptions}
          value={filterNoticeType || ALL_NOTICE_TYPES}
          onChange={(v) =>
            onPatchFilters({
              noticeType: v === ALL_NOTICE_TYPES ? null : v,
            })
          }
          className="w-full"
          portaled={false}
        />
      </FilterField>
    </FilterSheetButton>
  );
}
