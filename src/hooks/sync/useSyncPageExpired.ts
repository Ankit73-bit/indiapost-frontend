import { useMemo } from 'react';
import { useListTrackingExpiredArticlesQuery } from '@/store/api/syncApi';
import type { SyncPageActiveTab } from '@/hooks/sync/useSyncPageUrlFiltersPagination';

type UseSyncPageExpiredParams = {
  activeTab: SyncPageActiveTab;
  filterClientId: string;
  filterListId: string;
  expiredPage: number;
};

export function useSyncPageExpired({
  activeTab,
  filterClientId,
  filterListId,
  expiredPage,
}: UseSyncPageExpiredParams) {
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

  const { data: expiredData, isLoading: expiredLoading } =
    useListTrackingExpiredArticlesQuery(
      activeTab === 'expired' ? expiredPageQueryArgs : expiredCountQueryArgs,
    );

  return {
    expiredData,
    expiredLoading,
  };
}
