import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useGetListQuery, useListListsQuery } from '@/store/api/listsApi';
import { listDisplayName } from '@/lib/listNaming';
import type { List, ListStatus } from '@/types';

export const ALL_LISTS_VALUE = '__all_lists__';

/** Portaled menu marker — dialogs must ignore outside clicks on this element. */
export const SEARCHABLE_LIST_MENU_SELECTOR = '[data-searchable-list-select-menu]';

export function isSearchableListMenuTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest(SEARCHABLE_LIST_MENU_SELECTOR))
  );
}

/** Call from DialogContent onInteractOutside / onPointerDownOutside handlers. */
export function preventDialogCloseForSearchableListMenu(event: {
  preventDefault: () => void;
  target: EventTarget | null;
}) {
  if (isSearchableListMenuTarget(event.target)) {
    event.preventDefault();
  }
}

const DEFAULT_EXCLUDE_STATUSES: ListStatus[] = ['ARCHIVED'];

interface SearchableListSelectProps {
  clientId?: string;
  value?: string;
  onChange: (listId: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** When false, menu renders inline (use inside dialogs). Default true. */
  portaled?: boolean;
  showAllOption?: boolean;
  allOptionLabel?: string;
  allOptionValue?: string;
  excludeStatuses?: ListStatus[];
}

interface SearchableListSelectMenuProps {
  clientId: string;
  value?: string;
  anchorRef: React.RefObject<HTMLElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onChange: (listId: string) => void;
  onClose: () => void;
  showAllOption?: boolean;
  allOptionLabel?: string;
  allOptionValue?: string;
  excludeStatuses?: ListStatus[];
  portaled?: boolean;
}

function selectOption(
  listId: string,
  anchorRef: React.RefObject<HTMLElement | null>,
  onChange: (listId: string) => void,
  onClose: () => void,
) {
  onChange(listId);
  const trigger = anchorRef.current?.querySelector('button');
  if (trigger instanceof HTMLButtonElement) {
    trigger.focus();
  }
  requestAnimationFrame(() => onClose());
}

function SearchableListSelectMenu({
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
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [priorPages, setPriorPages] = useState<List[]>([]);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 280 });

  const mergedExcludeStatuses = useMemo(() => {
    const set = new Set<ListStatus>(DEFAULT_EXCLUDE_STATUSES);
    for (const s of excludeStatuses ?? []) set.add(s);
    return [...set];
  }, [excludeStatuses]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
      setPriorPages([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useLayoutEffect(() => {
    if (!portaled) return;

    function updatePosition() {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 280),
      });
    }

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorRef, portaled]);

  const { data, isFetching, isLoading } = useListListsQuery({
    clientId,
    search: search || undefined,
    page,
    limit: 30,
  });

  const accumulated = useMemo(() => {
    const current = data?.data ?? [];
    if (page === 1) return current;
    return [...priorPages, ...current];
  }, [page, priorPages, data?.data]);

  const lists = useMemo(() => {
    if (!mergedExcludeStatuses.length) return accumulated;
    return accumulated.filter((l) => !mergedExcludeStatuses.includes(l.status));
  }, [accumulated, mergedExcludeStatuses]);

  function handleLoadMore() {
    const current = data?.data ?? [];
    setPriorPages((prev) => [...prev, ...current]);
    setPage((p) => p + 1);
  }

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
                selectOption(allOptionValue, anchorRef, onChange, onClose)
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
              onClick={() => selectOption(l._id, anchorRef, onChange, onClose)}
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

export function SearchableListSelect({
  clientId,
  value,
  onChange,
  placeholder = 'Select list',
  className,
  disabled,
  showAllOption,
  allOptionLabel = 'All lists',
  allOptionValue = ALL_LISTS_VALUE,
  excludeStatuses,
  portaled = true,
}: SearchableListSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const { data: selectedList } = useGetListQuery(value!, {
    skip: !value || value === allOptionValue,
  });

  const selectedLabel =
    value === allOptionValue
      ? allOptionLabel
      : (selectedList
          ? listDisplayName(selectedList)
          : value
            ? 'Loading…'
            : placeholder);

  return (
    <div ref={containerRef} className={cn('relative min-w-0 max-w-full', className)}>
      <Button
        type="button"
        variant="outline"
        className="h-9 w-full min-w-0 max-w-full justify-between gap-2 px-3 text-sm font-normal"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        title={selectedLabel}
      >
        <span className="min-w-0 flex-1 truncate text-left">{selectedLabel}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open &&
        clientId &&
        (portaled ? (
          createPortal(
            <SearchableListSelectMenu
              key={clientId}
              clientId={clientId}
              value={value}
              anchorRef={containerRef}
              menuRef={menuRef}
              onChange={onChange}
              onClose={() => setOpen(false)}
              showAllOption={showAllOption}
              allOptionLabel={allOptionLabel}
              allOptionValue={allOptionValue}
              excludeStatuses={excludeStatuses}
              portaled
            />,
            document.body,
          )
        ) : (
          <SearchableListSelectMenu
            key={clientId}
            clientId={clientId}
            value={value}
            anchorRef={containerRef}
            menuRef={menuRef}
            onChange={onChange}
            onClose={() => setOpen(false)}
            showAllOption={showAllOption}
            allOptionLabel={allOptionLabel}
            allOptionValue={allOptionValue}
            excludeStatuses={excludeStatuses}
            portaled={false}
          />
        ))}
    </div>
  );
}
