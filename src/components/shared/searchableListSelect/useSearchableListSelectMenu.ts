import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useListListsQuery } from '@/store/api/listsApi';
import type { List, ListStatus } from '@/types';
import { DEFAULT_EXCLUDE_STATUSES } from './searchableListSelect.constants';

interface UseSearchableListSelectMenuOptions {
  clientId: string;
  anchorRef: React.RefObject<HTMLElement | null>;
  excludeStatuses?: ListStatus[];
  portaled?: boolean;
}

export function useSearchableListSelectMenu({
  clientId,
  anchorRef,
  excludeStatuses,
  portaled = true,
}: UseSearchableListSelectMenuOptions) {
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

  return {
    searchInput,
    setSearchInput,
    position,
    lists,
    isFetching,
    isLoading,
    page,
    data,
    handleLoadMore,
  };
}
