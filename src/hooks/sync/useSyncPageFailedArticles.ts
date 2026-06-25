import { useEffect, useMemo, useState } from 'react';
import {
  useListFailedArticlesQuery,
  useLazyListFailedArticleIdsQuery,
  useRetryFailedArticleMutation,
  useBulkRetryFailedArticlesMutation,
} from '@/store/api/syncApi';
import { toast } from '@/lib/toast';
import type { SyncPageActiveTab } from '@/hooks/sync/useSyncPageUrlFiltersPagination';

type UseSyncPageFailedArticlesParams = {
  activeTab: SyncPageActiveTab;
  filterClientId: string;
  filterListId: string;
  failedSearch: string;
  failedFilterKey: string;
  failedPage: number;
  shouldPollJobs: boolean;
  setSyncPollForced: (forced: boolean) => void;
};

export function useSyncPageFailedArticles({
  activeTab,
  filterClientId,
  filterListId,
  failedSearch,
  failedFilterKey,
  failedPage,
  shouldPollJobs,
  setSyncPollForced,
}: UseSyncPageFailedArticlesParams) {
  const [selectedFailedIds, setSelectedFailedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [allFailedSelected, setAllFailedSelected] = useState(false);
  const [selectingAllFailed, setSelectingAllFailed] = useState(false);

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

  return {
    failedData,
    failedLoading,
    failedRows,
    failedSelectionCount,
    bulkRetrying,
    handleBulkRetry,
    failedHeaderChecked,
    handleToggleAllFailed,
    selectingAllFailed,
    allFailedSelected,
    selectedFailedIds,
    toggleFailedSelection,
    handleRetry,
  };
}
