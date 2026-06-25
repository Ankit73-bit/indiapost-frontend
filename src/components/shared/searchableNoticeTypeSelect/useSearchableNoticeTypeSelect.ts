import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ALL_NOTICE_TYPES,
  NOTICE_TYPE_SELECT_MIN_WIDTH,
} from './searchableNoticeTypeSelect.constants';
import type { SearchableNoticeTypeSelectProps } from './searchableNoticeTypeSelect.types';

type UseSearchableNoticeTypeSelectOptions = Pick<
  SearchableNoticeTypeSelectProps,
  'options' | 'value' | 'onChange' | 'placeholder' | 'portaled'
>;

export function useSearchableNoticeTypeSelect({
  options,
  value,
  onChange,
  placeholder = 'All types',
  portaled = true,
}: UseSearchableNoticeTypeSelectOptions) {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: NOTICE_TYPE_SELECT_MIN_WIDTH,
  });

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

  useEffect(() => {
    if (!open || !portaled) return;
    const anchor = containerRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, NOTICE_TYPE_SELECT_MIN_WIDTH),
    });
  }, [open, portaled]);

  const filtered = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q) return options;
    return options.filter((t) => t.toLowerCase().includes(q));
  }, [options, searchInput]);

  const selectedLabel =
    !value || value === ALL_NOTICE_TYPES ? placeholder : value;

  function pick(next: string) {
    onChange(next);
    setOpen(false);
    setSearchInput('');
  }

  return {
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
  };
}
