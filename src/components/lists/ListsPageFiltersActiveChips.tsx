import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { FilterChip } from '@/pages/lists/listsPage.types';

interface ListsPageFiltersActiveChipsProps {
  activeFilterChips: FilterChip[];
  onClearFilters: () => void;
}

export function ListsPageFiltersActiveChips({
  activeFilterChips,
  onClearFilters,
}: ListsPageFiltersActiveChipsProps) {
  if (activeFilterChips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
      <span className="text-xs font-medium text-muted-foreground">
        Active filters
      </span>
      {activeFilterChips.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondary"
          className="gap-1 pr-1 font-normal"
        >
          {chip.label}
          <button
            type="button"
            className="rounded-full p-0.5 hover:bg-muted-foreground/20"
            onClick={chip.onRemove}
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={onClearFilters}
      >
        Clear all
      </Button>
    </div>
  );
}
