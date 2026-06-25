import { useEffect, useMemo, useRef, useState } from 'react';
import { usePollListsWhileActive } from '@/hooks/usePollListsWhileActive';
import { useOperationsLists } from '@/hooks/useOperationsLists';
import { listsApi } from '@/store/api/listsApi';
import { useAppDispatch } from '@/store';
import type { List } from '@/types';

export function useListsPageQueries({
  clientIdFilter,
  search,
  showAllYears,
  filterYear,
  filterMonth,
  filterNoticeType,
  sortOrder,
  page,
}: {
  clientIdFilter: string | undefined;
  search: string;
  showAllYears: boolean;
  filterYear: string;
  filterMonth: string;
  filterNoticeType: string;
  sortOrder: 'asc' | 'desc';
  page: number;
}) {
  const dispatch = useAppDispatch();
  const [opsPollForced, setOpsPollForced] = useState(false);

  const {
    importing: importingLists,
    syncing: syncingLists,
    data: opsData,
  } = useOperationsLists({
    clientId: clientIdFilter,
    forcePoll: opsPollForced,
  });

  const { data, isLoading, isFetching } = usePollListsWhileActive(
    {
      clientId: clientIdFilter,
      search: search || undefined,
      year: showAllYears ? undefined : Number(filterYear),
      month: filterMonth ? Number(filterMonth) : undefined,
      noticeType: filterNoticeType || undefined,
      sortOrder,
      page,
      limit: 20,
    },
    { forcePoll: opsPollForced },
  );

  const prevSyncingCountRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = prevSyncingCountRef.current;
    prevSyncingCountRef.current = syncingLists.length;
    if (prev !== null && prev > 0 && syncingLists.length === 0) {
      dispatch(listsApi.util.invalidateTags([{ type: 'List', id: 'LIST' }]));
    }
  }, [syncingLists.length, dispatch]);

  const liveListById = useMemo(() => {
    const map = new Map<string, List>();
    for (const l of opsData?.data ?? []) {
      if (l.status === 'IMPORTING' || l.status === 'SYNCING') {
        map.set(l._id, l);
      }
    }
    for (const l of data?.data ?? []) map.set(l._id, l);
    return map;
  }, [opsData?.data, data?.data]);

  useEffect(() => {
    if (!opsPollForced) return;
    if (importingLists.length === 0 && syncingLists.length === 0) {
      const timer = setTimeout(() => setOpsPollForced(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [opsPollForced, importingLists.length, syncingLists.length]);

  return {
    importingLists,
    syncingLists,
    data,
    isLoading,
    isFetching,
    liveListById,
    setOpsPollForced,
  };
}
