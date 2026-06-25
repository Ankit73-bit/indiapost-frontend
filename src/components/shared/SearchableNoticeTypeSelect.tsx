import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SearchableNoticeTypeSelectMenu } from './searchableNoticeTypeSelect/SearchableNoticeTypeSelectMenu';
import type { SearchableNoticeTypeSelectProps } from './searchableNoticeTypeSelect/searchableNoticeTypeSelect.types';
import { useSearchableNoticeTypeSelect } from './searchableNoticeTypeSelect/useSearchableNoticeTypeSelect';

export { ALL_NOTICE_TYPES } from './searchableNoticeTypeSelect/searchableNoticeTypeSelect.constants';
export type { SearchableNoticeTypeSelectProps } from './searchableNoticeTypeSelect/searchableNoticeTypeSelect.types';

export function SearchableNoticeTypeSelect({
  options,
  value,
  onChange,
  className,
  placeholder = 'All types',
  portaled = true,
}: SearchableNoticeTypeSelectProps) {
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
  } = useSearchableNoticeTypeSelect({
    options,
    value,
    onChange,
    placeholder,
    portaled,
  });

  const menu = open ? (
    <SearchableNoticeTypeSelectMenu
      options={filtered}
      value={value}
      menuRef={menuRef}
      searchInput={searchInput}
      onSearchInputChange={setSearchInput}
      onPick={pick}
      placeholder={placeholder}
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
        onClick={() => setOpen((v) => !v)}
      >
        <span className="min-w-0 flex-1 truncate text-left">{selectedLabel}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {portaled && menu ? createPortal(menu, document.body) : menu}
    </div>
  );
}
