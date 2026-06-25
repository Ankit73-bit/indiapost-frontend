import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchableListSelect } from '@/components/shared/SearchableListSelect';
import { SearchableClientSelect } from '@/components/shared/SearchableClientSelect';
import {
  FilterSheetButton,
  FilterField,
} from '@/components/shared/FilterSheetButton';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import {
  SYNC_ALL_JOB_TYPES,
  SYNC_ALL_LISTS_FILTER,
  SYNC_ALL_STATUS,
  SYNC_JOB_STATUSES,
  SYNC_JOB_TYPES,
} from '@/pages/sync/syncPage.constants';
import type { useListClientsQuery } from '@/store/api/clientsApi';

interface SyncPageToolbarProps {
  clientsData: ReturnType<typeof useListClientsQuery>['data'];
  filterClientId: string;
  filterListId: string;
  filterStatus: string;
  filterJobType: string;
  filterFromDate: string;
  filterToDate: string;
  jobFilterActiveCount: number;
  hasJobFilters: boolean;
  onClearJobFilters: () => void;
  onPatchParams: (updates: Record<string, string | null>) => void;
  onOpenTriggerDialog: () => void;
}

export function SyncPageToolbar({
  clientsData,
  filterClientId,
  filterListId,
  filterStatus,
  filterJobType,
  filterFromDate,
  filterToDate,
  jobFilterActiveCount,
  hasJobFilters,
  onClearJobFilters,
  onPatchParams,
  onOpenTriggerDialog,
}: SyncPageToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
      <div>
        <h2 className="text-lg font-semibold">Sync Management</h2>
        <p className="text-sm text-muted-foreground">
          Monitor sync jobs, retry failed articles and manage tracking updates.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSheetButton
          activeCount={jobFilterActiveCount}
          onClear={onClearJobFilters}
          clearDisabled={!hasJobFilters}
          description="Filter sync jobs by client, list, status, type, or date range."
        >
          <FilterField
            label="Client"
            hint={
              <HelpTooltip content="Scope jobs to one client organization." />
            }
          >
            <SearchableClientSelect
              clients={clientsData?.data.filter((c) => c.isActive) ?? []}
              value={filterClientId || undefined}
              className="w-full"
              portaled={false}
              onChange={(clientId) =>
                onPatchParams({
                  clientId: clientId ?? null,
                  listId: null,
                })
              }
            />
          </FilterField>

          <FilterField label="List">
            <SearchableListSelect
              clientId={filterClientId || undefined}
              value={filterListId || SYNC_ALL_LISTS_FILTER}
              onChange={(v) =>
                onPatchParams({ listId: v === SYNC_ALL_LISTS_FILTER ? null : v })
              }
              disabled={!filterClientId}
              showAllOption
              allOptionValue={SYNC_ALL_LISTS_FILTER}
              allOptionLabel="All lists"
              placeholder={
                filterClientId ? 'All lists' : 'Select client first'
              }
              className="w-full"
              portaled={false}
            />
          </FilterField>

          <FilterField label="Job status">
            <Select
              value={filterStatus || SYNC_ALL_STATUS}
              onValueChange={(v) =>
                onPatchParams({ status: v === SYNC_ALL_STATUS ? null : v })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SYNC_ALL_STATUS}>All statuses</SelectItem>
                {SYNC_JOB_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Job type">
            <Select
              value={filterJobType || SYNC_ALL_JOB_TYPES}
              onValueChange={(v) =>
                onPatchParams({ type: v === SYNC_ALL_JOB_TYPES ? null : v })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SYNC_ALL_JOB_TYPES}>All types</SelectItem>
                {SYNC_JOB_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField
            label="Date range"
            hint={
              <HelpTooltip content="Filter jobs by start date (inclusive)." />
            }
          >
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                className="h-9"
                value={filterFromDate}
                onChange={(e) =>
                  onPatchParams({ fromDate: e.target.value || null })
                }
              />
              <Input
                type="date"
                className="h-9"
                value={filterToDate}
                onChange={(e) =>
                  onPatchParams({ toDate: e.target.value || null })
                }
              />
            </div>
          </FilterField>
        </FilterSheetButton>

        <Button size="sm" onClick={onOpenTriggerDialog}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Trigger Sync
        </Button>
      </div>
    </div>
  );
}
