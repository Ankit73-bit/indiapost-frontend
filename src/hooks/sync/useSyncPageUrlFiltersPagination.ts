import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useListClientsQuery } from '@/store/api/clientsApi';

export type SyncPageActiveTab = 'jobs' | 'failed' | 'expired';

export function useSyncPageUrlFiltersPagination() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filterClientId = searchParams.get('clientId') ?? '';
  const filterListId = searchParams.get('listId') ?? '';
  const filterStatus = searchParams.get('status') ?? '';
  const filterJobType = searchParams.get('type') ?? '';
  const filterFromDate = searchParams.get('fromDate') ?? '';
  const filterToDate = searchParams.get('toDate') ?? '';
  const tabParam = searchParams.get('tab');
  const activeTab: SyncPageActiveTab =
    tabParam === 'failed'
      ? 'failed'
      : tabParam === 'expired'
        ? 'expired'
        : 'jobs';

  const jobsFilterKey = [
    filterClientId,
    filterListId,
    filterStatus,
    filterJobType,
    filterFromDate,
    filterToDate,
  ].join('|');
  const [failedSearchInput, setFailedSearchInput] = useState('');
  const [failedSearch, setFailedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(
      () => setFailedSearch(failedSearchInput.trim()),
      300,
    );
    return () => clearTimeout(timer);
  }, [failedSearchInput]);

  const failedFilterKey = [filterClientId, filterListId, failedSearch].join(
    '|',
  );
  const expiredFilterKey = failedFilterKey;

  const [pageByKey, setPageByKey] = useState<Record<string, number>>({});
  const jobsPage = pageByKey[`jobs|${jobsFilterKey}`] ?? 1;
  const failedPage = pageByKey[`failed|${failedFilterKey}`] ?? 1;
  const expiredPage = pageByKey[`expired|${expiredFilterKey}`] ?? 1;

  const setJobsPage = (page: number) => {
    setPageByKey((prev) => ({ ...prev, [`jobs|${jobsFilterKey}`]: page }));
  };
  const setFailedPage = (page: number) => {
    setPageByKey((prev) => ({ ...prev, [`failed|${failedFilterKey}`]: page }));
  };
  const setExpiredPage = (page: number) => {
    setPageByKey((prev) => ({
      ...prev,
      [`expired|${expiredFilterKey}`]: page,
    }));
  };

  function patchParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  }

  const { data: clientsData } = useListClientsQuery({ limit: 100 });

  const hasJobFilters = Boolean(
    filterClientId ||
    filterListId ||
    filterStatus ||
    filterJobType ||
    filterFromDate ||
    filterToDate,
  );

  const jobFilterActiveCount = [
    filterClientId,
    filterListId,
    filterStatus,
    filterJobType,
    filterFromDate,
    filterToDate,
  ].filter(Boolean).length;

  function clearJobFilters() {
    patchParams({
      clientId: null,
      listId: null,
      status: null,
      type: null,
      fromDate: null,
      toDate: null,
    });
  }

  return {
    activeTab,
    patchParams,
    filterClientId,
    filterListId,
    filterStatus,
    filterJobType,
    filterFromDate,
    filterToDate,
    clientsData,
    jobFilterActiveCount,
    hasJobFilters,
    clearJobFilters,
    failedFilterKey,
    failedSearchInput,
    setFailedSearchInput,
    failedSearch,
    jobsPage,
    failedPage,
    expiredPage,
    setJobsPage,
    setFailedPage,
    setExpiredPage,
  };
}
