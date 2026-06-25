import { useEffect, useRef, useState } from 'react';
import { useGetListQuery } from '@/store/api/listsApi';
import { listDisplayName } from '@/lib/listNaming';
import { ALL_LISTS_VALUE } from './searchableListSelect.constants';
import type { SearchableListSelectProps } from './searchableListSelect.types';

type UseSearchableListSelectOptions = Pick<
  SearchableListSelectProps,
  'value' | 'placeholder' | 'allOptionLabel' | 'allOptionValue'
>;

export function useSearchableListSelect({
  value,
  placeholder = 'Select list',
  allOptionLabel = 'All lists',
  allOptionValue = ALL_LISTS_VALUE,
}: UseSearchableListSelectOptions) {
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

  return {
    open,
    setOpen,
    containerRef,
    menuRef,
    selectedLabel,
  };
}
