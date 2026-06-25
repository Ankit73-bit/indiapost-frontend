import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ALL_CLIENTS_VALUE,
  CLIENT_SELECT_MIN_WIDTH,
} from './searchableClientSelect.constants';
import type {
  SearchableClientSelectProps,
} from './searchableClientSelect.types';

type UseSearchableClientSelectOptions = Pick<
  SearchableClientSelectProps,
  'clients' | 'value' | 'onChange' | 'placeholder' | 'showAllOption' | 'allOptionLabel' | 'portaled'
>;

export function useSearchableClientSelect({
  clients,
  value,
  onChange,
  placeholder = 'Select client',
  showAllOption = true,
  allOptionLabel = 'All clients',
  portaled = true,
}: UseSearchableClientSelectOptions) {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: CLIENT_SELECT_MIN_WIDTH,
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
      width: Math.max(rect.width, CLIENT_SELECT_MIN_WIDTH),
    });
  }, [open, portaled]);

  const filtered = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [clients, searchInput]);

  const selectedLabel =
    !value || value === ALL_CLIENTS_VALUE
      ? showAllOption
        ? allOptionLabel
        : placeholder
      : (clients.find((c) => c._id === value)?.name ?? placeholder);

  function pick(clientId: string | undefined) {
    onChange(clientId);
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
