import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ALL_LISTS_VALUE } from './searchableListSelect/searchableListSelect.constants';
import type { SearchableListSelectProps } from './searchableListSelect/searchableListSelect.types';
import { SearchableListSelectMenu } from './searchableListSelect/SearchableListSelectMenu';
import { useSearchableListSelect } from './searchableListSelect/useSearchableListSelect';

export {
  ALL_LISTS_VALUE,
  SEARCHABLE_LIST_MENU_SELECTOR,
} from './searchableListSelect/searchableListSelect.constants';
export {
  isSearchableListMenuTarget,
  preventDialogCloseForSearchableListMenu,
} from './searchableListSelect/searchableListSelect.utils';
export type { SearchableListSelectProps } from './searchableListSelect/searchableListSelect.types';

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
  const { open, setOpen, containerRef, menuRef, selectedLabel } =
    useSearchableListSelect({
      value,
      placeholder,
      allOptionLabel,
      allOptionValue,
    });

  const menuProps = {
    clientId: clientId!,
    value,
    anchorRef: containerRef,
    menuRef,
    onChange,
    onClose: () => setOpen(false),
    showAllOption,
    allOptionLabel,
    allOptionValue,
    excludeStatuses,
  };

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
            <SearchableListSelectMenu key={clientId} {...menuProps} portaled />,
            document.body,
          )
        ) : (
          <SearchableListSelectMenu
            key={clientId}
            {...menuProps}
            portaled={false}
          />
        ))}
    </div>
  );
}
