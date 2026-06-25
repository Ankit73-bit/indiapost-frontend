import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useListClientsQuery } from '@/store/api/clientsApi';
import { listsApi } from '@/store/api/listsApi';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  syncApi,
  useTriggerSyncMutation,
  useListSyncJobsQuery,
  useListFailedArticlesQuery,
  useLazyListFailedArticleIdsQuery,
  useListTrackingExpiredArticlesQuery,
  useRetryFailedArticleMutation,
  useBulkRetryFailedArticlesMutation,
} from '@/store/api/syncApi';
import { getApiErrorMessage } from '@/lib/helpers';
import { listDisplayName } from '@/lib/listNaming';
import { isActiveSyncJob } from '@/lib/syncJobUtils';
import { toast } from '@/lib/toast';
import { SYNC_ALL_LISTS } from '@/pages/sync/syncPage.constants';
import type { SyncJobStatus, SyncJobType } from '@/types';

export function useSyncPage() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [resolvedListNames, setResolvedListNames] = useState<
    Record<string, string>
  >({});

  const filterClientId = searchParams.get('clientId') ?? '';
  const filterListId = searchParams.get('listId') ?? '';
  const filterStatus = searchParams.get('status') ?? '';
  const filterJobType = searchParams.get('type') ?? '';
  const filterFromDate = searchParams.get('fromDate') ?? '';
  const filterToDate = searchParams.get('toDate') ?? '';
  const tabParam = searchParams.get('tab');
  const activeTab =
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
  const [selectedFailedIds, setSelectedFailedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [allFailedSelected, setAllFailedSelected] = useState(false);
  const [selectingAllFailed, setSelectingAllFailed] = useState(false);

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

  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedListId, setSelectedListId] = useState(SYNC_ALL_LISTS);
  const [triggerError, setTriggerError] = useState('');
  const [syncPollForced, setSyncPollForced] = useState(false);

  function patchParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  }

  const { data: clientsData } = useListClientsQuery({ limit: 100 });

  const jobsQueryArgs = useMemo(
    () => ({
      page: jobsPage,
      limit: 20,
      listOnly: true as const,
      clientId: filterClientId || undefined,
      listId: filterListId || undefined,
      status: (filterStatus as SyncJobStatus) || undefined,
      type: (filterJobType as SyncJobType) || undefined,
      fromDate: filterFromDate || undefined,
      toDate: filterToDate || undefined,
    }),
    [
      jobsPage,
      filterClientId,
      filterListId,
      filterStatus,
      filterJobType,
      filterFromDate,
      filterToDate,
    ],
  );

  const failedFilters = useMemo(
    () => ({
      clientId: filterClientId || undefined,
      listId: filterListId || undefined,
      search: failedSearch || undefined,
    }),
    [filterClientId, filterListId, failedSearch],
  );

  const failedCountQueryArgs = useMemo(
    () => ({ ...failedFilters, page: 1, limit: 1 }),
    [failedFilters],
  );

  const failedPageQueryArgs = useMemo(
    () => ({ ...failedFilters, page: failedPage, limit: 20 }),
    [failedFilters, failedPage],
  );

  const expiredFilters = useMemo(
    () => ({
      clientId: filterClientId || undefined,
      listId: filterListId || undefined,
    }),
    [filterClientId, filterListId],
  );

  const expiredCountQueryArgs = useMemo(
    () => ({ ...expiredFilters, page: 1, limit: 1 }),
    [expiredFilters],
  );

  const expiredPageQueryArgs = useMemo(
    () => ({ ...expiredFilters, page: expiredPage, limit: 20 }),
    [expiredFilters, expiredPage],
  );

  const cachedJobs = useAppSelector(
    (state) => syncApi.endpoints.listSyncJobs.select(jobsQueryArgs)(state).data,
  );
  const activeJobs = cachedJobs?.data.filter((j) => isActiveSyncJob(j)) ?? [];
  const shouldPollJobs = syncPollForced || activeJobs.length > 0;

  const { data: jobsData, isLoading: jobsLoading } = useListSyncJobsQuery(
    jobsQueryArgs,
    { pollingInterval: shouldPollJobs ? 3000 : 0 },
  );

  useEffect(() => {
    setSelectedFailedIds(new Set());
    setAllFailedSelected(false);
  }, [failedFilterKey]);

  const { data: failedData, isLoading: failedLoading } =
    useListFailedArticlesQuery(
      activeTab === 'failed' ? failedPageQueryArgs : failedCountQueryArgs,
      {
        pollingInterval: activeTab === 'failed' && shouldPollJobs ? 3000 : 0,
      },
    );

  const { data: expiredData, isLoading: expiredLoading } =
    useListTrackingExpiredArticlesQuery(
      activeTab === 'expired' ? expiredPageQueryArgs : expiredCountQueryArgs,
    );

  const listNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const [id, name] of Object.entries(resolvedListNames))
      map.set(id, name);
    return map;
  }, [resolvedListNames]);

  useEffect(() => {
    if (!jobsData?.data.length) return;

    const known = new Set(listNameById.keys());
    const missing = jobsData.data
      .map((j) => j.listId)
      .filter((id): id is string => Boolean(id && !known.has(id)));

    for (const listId of [...new Set(missing)]) {
      dispatch(listsApi.endpoints.getList.initiate(listId))
        .unwrap()
        .then((list) => {
          setResolvedListNames((prev) => ({
            ...prev,
            [list._id]: listDisplayName(list),
          }));
        })
        .catch(() => {});
    }
  }, [jobsData?.data, dispatch, listNameById]);

  const [triggerSync, { isLoading: triggering }] = useTriggerSyncMutation();
  const [retryArticle] = useRetryFailedArticleMutation();
  const [bulkRetry, { isLoading: bulkRetrying }] =
    useBulkRetryFailedArticlesMutation();
  const [fetchFailedIds] = useLazyListFailedArticleIdsQuery();

  const failedRows = failedData?.data ?? [];
  const allFailedPageSelected =
    failedRows.length > 0 &&
    failedRows.every((fa) => selectedFailedIds.has(fa.articleId));
  const failedSelectionCount = allFailedSelected
    ? (failedData?.meta?.total ?? selectedFailedIds.size)
    : selectedFailedIds.size;
  const failedHeaderChecked = allFailedSelected || allFailedPageSelected;

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

  function handleClientChange(clientId: string) {
    setSelectedClientId(clientId);
    setSelectedListId(SYNC_ALL_LISTS);
    setTriggerError('');
  }

  function openTriggerDialog() {
    setSelectedClientId(filterClientId);
    setSelectedListId(filterListId || SYNC_ALL_LISTS);
    setTriggerError('');
    setTriggerDialogOpen(true);
  }

  async function handleTrigger() {
    if (!selectedClientId) return;
    setTriggerError('');
    try {
      const body =
        selectedListId === SYNC_ALL_LISTS
          ? { clientId: selectedClientId }
          : { clientId: selectedClientId, listId: selectedListId };
      const result = await triggerSync(body).unwrap();
      toast.success(result.message);
      if (result.syncJobId) {
        setSyncPollForced(true);
        window.setTimeout(() => setSyncPollForced(false), 12000);
      }
      setTriggerDialogOpen(false);
      setSelectedClientId('');
      setSelectedListId(SYNC_ALL_LISTS);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setTriggerError(msg);
      toast.error(msg);
    }
  }

  async function handleRetry(articleId: string) {
    try {
      await retryArticle(articleId).unwrap();
      toast.success('Retry enqueued');
      setSyncPollForced(true);
      window.setTimeout(() => setSyncPollForced(false), 12000);
    } catch (err) {
      toast.apiError(err, 'Failed to retry article');
    }
  }

  function toggleFailedSelection(articleId: string) {
    setAllFailedSelected(false);
    setSelectedFailedIds((prev) => {
      const next = new Set(prev);
      if (next.has(articleId)) next.delete(articleId);
      else next.add(articleId);
      return next;
    });
  }

  function toggleAllFailedOnPage() {
    setAllFailedSelected(false);
    setSelectedFailedIds((prev) => {
      const next = new Set(prev);
      if (allFailedPageSelected) {
        for (const fa of failedRows) next.delete(fa.articleId);
      } else {
        for (const fa of failedRows) next.add(fa.articleId);
      }
      return next;
    });
  }

  async function handleToggleAllFailed() {
    if (selectingAllFailed) return;

    if (allFailedSelected || allFailedPageSelected) {
      setSelectedFailedIds(new Set());
      setAllFailedSelected(false);
      return;
    }

    const totalFailed = failedData?.meta?.total ?? 0;
    if (totalFailed > failedRows.length) {
      setSelectingAllFailed(true);
      try {
        const result = await fetchFailedIds({
          clientId: filterClientId || undefined,
          listId: filterListId || undefined,
          search: failedSearch || undefined,
        }).unwrap();
        setSelectedFailedIds(new Set(result.articleIds));
        setAllFailedSelected(result.total > 0);
        if (result.total === 0) {
          toast.info('No failed articles match the current filters');
        }
      } catch {
        toast.error('Failed to select all failed articles');
      } finally {
        setSelectingAllFailed(false);
      }
      return;
    }

    toggleAllFailedOnPage();
  }

  async function handleBulkRetry() {
    if (failedSelectionCount === 0) return;
    try {
      const result = await bulkRetry(
        allFailedSelected
          ? {
              retryFilters: {
                clientId: filterClientId || undefined,
                listId: filterListId || undefined,
                search: failedSearch || undefined,
              },
            }
          : { articleIds: [...selectedFailedIds] },
      ).unwrap();
      toast.success(
        `Retry enqueued for ${result.enqueued.toLocaleString()} article${result.enqueued !== 1 ? 's' : ''}`,
      );
      setSelectedFailedIds(new Set());
      setAllFailedSelected(false);
      setSyncPollForced(true);
      window.setTimeout(() => setSyncPollForced(false), 12000);
    } catch (err) {
      toast.apiError(err, 'Failed to retry selected articles');
    }
  }

  function handleListChange(listId: string) {
    setSelectedListId(listId);
    setTriggerError('');
  }

  const scopeHint =
    selectedListId === SYNC_ALL_LISTS
      ? 'Creates one sync job per list that has non-terminal articles for this client.'
      : 'Syncs only non-terminal articles in the selected list.';

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
    openTriggerDialog,
    activeJobs,
    jobsData,
    jobsLoading,
    setJobsPage,
    listNameById,
    failedData,
    expiredData,
    failedSearchInput,
    setFailedSearchInput,
    setFailedPage,
    failedSelectionCount,
    bulkRetrying,
    handleBulkRetry,
    failedLoading,
    failedRows,
    failedHeaderChecked,
    handleToggleAllFailed,
    selectingAllFailed,
    allFailedSelected,
    selectedFailedIds,
    toggleFailedSelection,
    handleRetry,
    failedSearch,
    expiredLoading,
    setExpiredPage,
    triggerDialogOpen,
    setTriggerDialogOpen,
    selectedClientId,
    selectedListId,
    triggerError,
    scopeHint,
    handleClientChange,
    handleListChange,
    handleTrigger,
    triggering,
  };
}
