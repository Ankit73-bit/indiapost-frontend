import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ALL_CLIENTS_VALUE } from './searchableClientSelect.constants';
import type { SearchableClientSelectMenuProps } from './searchableClientSelect.types';

export function SearchableClientSelectMenu({
  clients,
  value,
  menuRef,
  searchInput,
  onSearchInputChange,
  onPick,
  showAllOption,
  allOptionLabel,
  portaled,
  position,
}: SearchableClientSelectMenuProps) {
  return (
    <div
      ref={menuRef}
      data-searchable-select-menu
      className={cn(
        'z-[200] rounded-md border border-border bg-popover shadow-md',
        portaled ? 'fixed' : 'absolute left-0 right-0 top-full z-50 mt-1',
      )}
      style={
        portaled
          ? {
              top: position.top,
              left: position.left,
              width: position.width,
              maxWidth: 'calc(100vw - 1rem)',
            }
          : undefined
      }
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="border-b border-border p-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="h-8 pl-7 text-xs"
            placeholder="Search clients…"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      <ul className="max-h-[260px] overflow-y-auto py-1">
        {showAllOption && (
          <li>
            <button
              type="button"
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-muted/50',
                (!value || value === ALL_CLIENTS_VALUE) && 'bg-muted/40',
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPick(undefined)}
            >
              {allOptionLabel}
            </button>
          </li>
        )}
        {clients.length === 0 && (
          <li className="px-3 py-6 text-center text-xs text-muted-foreground">
            No clients found
          </li>
        )}
        {clients.map((c) => (
          <li key={c._id}>
            <button
              type="button"
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-muted/50',
                value === c._id && 'bg-muted/40',
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPick(c._id)}
            >
              {c.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
