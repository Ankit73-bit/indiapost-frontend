import {
  ChevronDown,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FilterField } from '@/components/shared/FilterSheetButton';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { ALL_STATUSES } from '@/types';
import { STATUS_CONFIG } from '@/lib/helpers';
import type { NormalizedStatus } from '@/types';

interface ArticlesFilterSheetFieldsProps {
  statusFilter: NormalizedStatus | undefined;
  onStatusFilterChange: (status: NormalizedStatus | undefined) => void;
  syncFailedOnly: boolean;
  onSyncFailedOnlyToggle: () => void;
  nonTerminalOnly: boolean;
  onNonTerminalOnlyToggle: () => void;
  listNonTerminalCount: number;
}

export function ArticlesFilterSheetFields({
  statusFilter,
  onStatusFilterChange,
  syncFailedOnly,
  onSyncFailedOnlyToggle,
  nonTerminalOnly,
  onNonTerminalOnlyToggle,
  listNonTerminalCount,
}: ArticlesFilterSheetFieldsProps) {
  const statusLabel = statusFilter
    ? (STATUS_CONFIG[statusFilter]?.label ?? statusFilter)
    : 'All Statuses';

  return (
    <>
      <FilterField label="Status">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between gap-1.5">
              {statusLabel}
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={statusFilter ?? 'all'}
              onValueChange={(v) => {
                onStatusFilterChange(
                  v === 'all' ? undefined : (v as NormalizedStatus),
                );
              }}
            >
              <DropdownMenuRadioItem value="all">
                All Statuses
              </DropdownMenuRadioItem>
              {ALL_STATUSES.map((s) => (
                <DropdownMenuRadioItem key={s} value={s}>
                  {STATUS_CONFIG[s]?.label ?? s}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </FilterField>

      <FilterField
        label="Sync failed only"
        hint={
          <HelpTooltip content="Show only articles where the most recent India Post sync attempt failed." />
        }
      >
        <Button
          variant={syncFailedOnly ? 'default' : 'outline'}
          size="sm"
          className="w-full gap-1.5"
          onClick={onSyncFailedOnlyToggle}
        >
          <AlertCircle className="h-3.5 w-3.5" />
          {syncFailedOnly ? 'Enabled' : 'Off'}
        </Button>
      </FilterField>

      <FilterField
        label="Non-terminal only"
        hint={
          <HelpTooltip content="Show articles still in transit (not delivered or RTO)." />
        }
      >
        <Button
          variant={nonTerminalOnly ? 'default' : 'outline'}
          size="sm"
          className="w-full gap-1.5"
          onClick={onNonTerminalOnlyToggle}
        >
          <Truck className="h-3.5 w-3.5" />
          Non-terminal
          {listNonTerminalCount > 0 && (
            <span className="tabular-nums text-xs opacity-80">
              ({listNonTerminalCount.toLocaleString()})
            </span>
          )}
        </Button>
      </FilterField>
    </>
  );
}
