import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mergeNoticeTypes } from '@/lib/listNaming';
import { useListClientsQuery } from '@/store/api/clientsApi';
import {
  useListNoticeTypesQuery,
  useListYearsQuery,
} from '@/store/api/listsApi';
import {
  currentYear,
  MONTH_OPTIONS,
} from '@/pages/lists/listsPage.constants';
import type { AuthUser } from '@/types';
import type { FilterChip } from '@/pages/lists/listsPage.types';

export function useListsPageFilters({
  isAdmin,
  authUser,
}: {
  isAdmin: boolean;
  authUser: AuthUser | null;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const clientIdFilter = searchParams.get('clientId') ?? undefined;
  const yearParam = searchParams.get('year');
  const showAllYears = yearParam === 'all';
  const filterYear = showAllYears
    ? String(currentYear())
    : (yearParam ?? String(currentYear()));
  const filterMonth = searchParams.get('month') ?? '';
  const filterNoticeType = searchParams.get('noticeType') ?? '';
  const sortOrder: 'asc' | 'desc' =
    searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

  useEffect(() => {
    if (!searchParams.has('year')) {
      const next = new URLSearchParams(searchParams);
      next.set('year', String(currentYear()));
      setSearchParams(next, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get('search') ?? '',
  );
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const skipSearchDebounceRef = useRef(false);

  useEffect(() => {
    if (skipSearchDebounceRef.current) {
      skipSearchDebounceRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      setSearch(trimmed);
      const next = new URLSearchParams(searchParams);
      if (trimmed) next.set('search', trimmed);
      else next.delete('search');
      setSearchParams(next, { replace: true });
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: clientsData } = useListClientsQuery({ limit: 100 });
  const activeClients = useMemo(
    () => clientsData?.data.filter((c) => c.isActive) ?? [],
    [clientsData?.data],
  );

  const customerClient = !isAdmin
    ? clientsData?.data.find((c) => c._id === authUser?.clientId)
    : undefined;
  const customerInactive = Boolean(customerClient && !customerClient.isActive);

  const { data: noticeTypesData } = useListNoticeTypesQuery(
    clientIdFilter ? { clientId: clientIdFilter } : undefined,
  );
  const { data: listYearsData } = useListYearsQuery(
    clientIdFilter ? { clientId: clientIdFilter } : undefined,
  );
  const noticeTypeOptions = useMemo(() => {
    const types = noticeTypesData ?? [];
    if (clientIdFilter) {
      return [
        ...new Set(types.map((t) => t.trim().toUpperCase()).filter(Boolean)),
      ].sort();
    }
    return mergeNoticeTypes(types);
  }, [noticeTypesData, clientIdFilter]);

  const yearOptions = useMemo(() => {
    const current = currentYear();
    const years = new Set<number>([current]);
    for (let i = 1; i <= 3; i++) years.add(current - i);
    for (const y of listYearsData ?? []) years.add(y);
    return [...years].sort((a, b) => b - a);
  }, [listYearsData]);

  const isNonDefaultYear =
    showAllYears || (yearParam != null && yearParam !== String(currentYear()));

  const hasFilters = Boolean(
    search ||
    filterMonth ||
    filterNoticeType ||
    clientIdFilter ||
    isNonDefaultYear ||
    sortOrder === 'asc',
  );

  const filterActiveCount = [
    clientIdFilter,
    filterMonth,
    filterNoticeType,
    isNonDefaultYear,
  ].filter(Boolean).length;

  function applySearchParams(next: URLSearchParams) {
    setSearchParams(next, { replace: true });
    setPage(1);
  }

  function setClientFilter(clientId: string | undefined) {
    const next = new URLSearchParams(searchParams);
    if (clientId) next.set('clientId', clientId);
    else next.delete('clientId');
    applySearchParams(next);
  }

  function patchFilters(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    applySearchParams(next);
  }

  function clearSearch() {
    skipSearchDebounceRef.current = true;
    setSearchInput('');
    setSearch('');
    const next = new URLSearchParams(searchParams);
    next.delete('search');
    applySearchParams(next);
  }

  function clearFilters() {
    skipSearchDebounceRef.current = true;
    setSearchInput('');
    setSearch('');
    const next = new URLSearchParams();
    next.set('year', String(currentYear()));
    applySearchParams(next);
  }

  const activeFilterChips = useMemo((): FilterChip[] => {
    const chips: FilterChip[] = [];

    if (search) {
      chips.push({
        key: 'search',
        label: `Search: ${search}`,
        onRemove: clearSearch,
      });
    }

    if (isAdmin && clientIdFilter) {
      const clientName =
        activeClients.find((c) => c._id === clientIdFilter)?.name ?? 'Client';
      chips.push({
        key: 'client',
        label: clientName,
        onRemove: () => setClientFilter(undefined),
      });
    }

    if (showAllYears) {
      chips.push({
        key: 'year',
        label: 'All years',
        onRemove: () => patchFilters({ year: String(currentYear()) }),
      });
    } else if (yearParam && yearParam !== String(currentYear())) {
      chips.push({
        key: 'year',
        label: `Year ${yearParam}`,
        onRemove: () => patchFilters({ year: String(currentYear()) }),
      });
    }

    if (filterMonth) {
      const monthLabel =
        MONTH_OPTIONS.find((m) => m.value === filterMonth)?.label ??
        `Month ${filterMonth}`;
      chips.push({
        key: 'month',
        label: monthLabel,
        onRemove: () => patchFilters({ month: null }),
      });
    }

    if (filterNoticeType) {
      chips.push({
        key: 'noticeType',
        label: filterNoticeType,
        onRemove: () => patchFilters({ noticeType: null }),
      });
    }

    if (sortOrder === 'asc') {
      chips.push({
        key: 'sort',
        label: 'Oldest first',
        onRemove: () => patchFilters({ sortOrder: null }),
      });
    }

    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    search,
    clientIdFilter,
    showAllYears,
    yearParam,
    filterMonth,
    filterNoticeType,
    sortOrder,
    isAdmin,
    activeClients,
  ]);

  return {
    searchParams,
    clientIdFilter,
    yearParam,
    showAllYears,
    filterYear,
    filterMonth,
    filterNoticeType,
    sortOrder,
    page,
    setPage,
    searchInput,
    setSearchInput,
    search,
    clientsData,
    activeClients,
    customerClient,
    customerInactive,
    noticeTypeOptions,
    yearOptions,
    hasFilters,
    filterActiveCount,
    activeFilterChips,
    setClientFilter,
    patchFilters,
    clearSearch,
    clearFilters,
  };
}
