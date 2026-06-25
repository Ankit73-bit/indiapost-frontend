import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ALL_NOTICE_TYPES } from './searchableNoticeTypeSelect.constants';
import type { SearchableNoticeTypeSelectMenuProps } from './searchableNoticeTypeSelect.types';

export function SearchableNoticeTypeSelectMenu({
  options,
  value,
  menuRef,
  searchInput,
  onSearchInputChange,
  onPick,
  placeholder,
  portaled,
  position,
}: SearchableNoticeTypeSelectMenuProps) {
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
            placeholder="Search notice types…"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      <ul className="max-h-[240px] overflow-y-auto py-1">
        <li>
          <button
            type="button"
            className={cn(
              'w-full px-3 py-2 text-left text-sm hover:bg-muted/50',
              (!value || value === ALL_NOTICE_TYPES) && 'bg-muted/40',
            )}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onPick(ALL_NOTICE_TYPES)}
          >
            {placeholder}
          </button>
        </li>
        {options.map((t) => (
          <li key={t}>
            <button
              type="button"
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-muted/50',
                value === t && 'bg-muted/40',
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPick(t)}
            >
              {t}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
