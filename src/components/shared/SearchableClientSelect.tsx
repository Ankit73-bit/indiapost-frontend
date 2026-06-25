import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SearchableClientSelectMenu } from './searchableClientSelect/SearchableClientSelectMenu';
import type { SearchableClientSelectProps } from './searchableClientSelect/searchableClientSelect.types';
import { useSearchableClientSelect } from './searchableClientSelect/useSearchableClientSelect';

export { ALL_CLIENTS_VALUE } from './searchableClientSelect/searchableClientSelect.constants';
export type { SearchableClientSelectProps } from './searchableClientSelect/searchableClientSelect.types';

export function SearchableClientSelect({
  clients,
  value,
  onChange,
  className,
  placeholder = 'Select client',
  showAllOption = true,
  allOptionLabel = 'All clients',
  disabled,
  portaled = true,
}: SearchableClientSelectProps) {
  const {
    open,
    setOpen,
    searchInput,
    setSearchInput,
    containerRef,
    menuRef,
    position,
    filtered,
    selectedLabel,
    pick,
  } = useSearchableClientSelect({
    clients,
    value,
    onChange,
    placeholder,
    showAllOption,
    allOptionLabel,
    portaled,
  });

  const menu = open ? (
    <SearchableClientSelectMenu
      clients={filtered}
      value={value}
      menuRef={menuRef}
      searchInput={searchInput}
      onSearchInputChange={setSearchInput}
      onPick={pick}
      showAllOption={showAllOption}
      allOptionLabel={allOptionLabel}
      portaled={portaled}
      position={position}
    />
  ) : null;

  return (
    <div ref={containerRef} className={cn('relative min-w-0', className)}>
      <Button
        type="button"
        variant="outline"
        className="h-9 w-full min-w-0 justify-between gap-2 px-3 text-sm font-normal"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
      >
        <span className="min-w-0 flex-1 truncate text-left">{selectedLabel}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {portaled && menu ? createPortal(menu, document.body) : menu}
    </div>
  );
}

/** @deprecated Use SearchableClientSelect */
export function ClientFilterSelect(
  props: SearchableClientSelectProps,
) {
  return <SearchableClientSelect {...props} />;
}
