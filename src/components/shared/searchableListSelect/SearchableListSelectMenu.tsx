import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { listDisplayName } from '@/lib/listNaming';
import { ALL_LISTS_VALUE } from './searchableListSelect.constants';
import type { SearchableListSelectMenuProps } from './searchableListSelect.types';
import { selectSearchableListOption } from './searchableListSelect.utils';
import { useSearchableListSelectMenu } from './useSearchableListSelectMenu';

export function SearchableListSelectMenu({
  clientId,
  value,
  anchorRef,
  menuRef,
  onChange,
  onClose,
  showAllOption,
  allOptionLabel = 'All lists',
  allOptionValue = ALL_LISTS_VALUE,
  excludeStatuses,
  portaled = true,
}: SearchableListSelectMenuProps) {
  const {
    searchInput,
    setSearchInput,
    position,
    lists,
    isFetching,
    isLoading,
    page,
    data,
    handleLoadMore,
  } = useSearchableListSelectMenu({
    clientId,
    anchorRef,
    excludeStatuses,
    portaled,
  });

  const menuClassName = cn(
    'z-[200] rounded-md border border-border bg-popover shadow-md',
    portaled ? 'fixed' : 'absolute left-0 right-0 top-full mt-1',
  );

  const menuStyle = portaled
    ? {
        top: position.top,
        left: position.left,
        width: position.width,
        maxWidth: 'calc(100vw - 1rem)',
      }
    : undefined;

  return (
    <div
      ref={menuRef}
      data-searchable-list-select-menu
      className={menuClassName}
      style={menuStyle}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="border-b border-border p-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="h-8 pl-7 text-xs"
            placeholder="Search by notice name…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            autoFocus
          />
          {isFetching && page === 1 && (
            <Loader2 className="absolute right-2 top-2.5 h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <ul className="max-h-[260px] overflow-y-auto overflow-x-hidden py-1">
        {showAllOption && (
          <li>
            <button
              type="button"
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-muted/50',
                value === allOptionValue && 'bg-muted/40',
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                selectSearchableListOption(
                  allOptionValue,
                  anchorRef,
                  onChange,
                  onClose,
                )
              }
            >
              <span className="block truncate">{allOptionLabel}</span>
            </button>
          </li>
        )}

        {isLoading && page === 1 && (
          <li className="px-3 py-6 text-center text-xs text-muted-foreground">
            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
          </li>
        )}

        {!isLoading && lists.length === 0 && (
          <li className="px-3 py-6 text-center text-xs text-muted-foreground">
            No lists found
          </li>
        )}

        {lists.map((l) => (
          <li key={l._id}>
            <button
              type="button"
              className={cn(
                'w-full min-w-0 px-3 py-2 text-left hover:bg-muted/50',
                value === l._id && 'bg-muted/40',
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                selectSearchableListOption(l._id, anchorRef, onChange, onClose)
              }
              title={listDisplayName(l)}
            >
              <span className="block truncate text-xs">{listDisplayName(l)}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {l.totalArticles.toLocaleString()} articles
                {l.noticeType ? ` · ${l.noticeType}` : ''}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {data?.meta && data.meta.totalPages > page && (
        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-full text-xs"
            disabled={isFetching}
            onClick={handleLoadMore}
          >
            {isFetching ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              `Load more (${data.meta.total.toLocaleString()} total)`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
