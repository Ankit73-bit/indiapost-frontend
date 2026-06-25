import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { useListClientsQuery, useGetClientStatsQuery } from '@/store/api/clientsApi';
import { useGetArticleStatsQuery } from '@/store/api/articlesApi';
import { useListSyncJobsQuery, useListFailedArticlesQuery } from '@/store/api/syncApi';
import { useListListsQuery, useGetListStatsQuery, listsApi } from '@/store/api/listsApi';
import {
  buildArticlesLink,
  buildArticlesSub,
  buildFailedSyncLink,
  buildListsLink,
  buildListsSubParts,
} from '@/pages/dashboard/dashboardPage.utils';

export function useDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const authUser = useAppSelector((s) => s.auth.user);
  const isAdmin = authUser?.role === 'admin';

  const customerClientId = !isAdmin ? (authUser?.clientId ?? undefined) : undefined;
  const dashboardClientId = isAdmin
    ? (searchParams.get('clientId') ?? undefined)
    : customerClientId;

  const { data: clientStats } = useGetClientStatsQuery(undefined, {
    skip: !isAdmin,
  });
  const { data: clientsData } = useListClientsQuery(
    { isActive: true, limit: 100 },
    { skip: !isAdmin },
  );

  const listStatsArgs = dashboardClientId
    ? { clientId: dashboardClientId }
    : undefined;
  const cachedListStats = useAppSelector((state) =>
    listsApi.endpoints.getListStats.select(listStatsArgs)(state).data,
  );
  const { data: listStats } = useGetListStatsQuery(listStatsArgs, {
    skip: !isAdmin && !customerClientId,
    pollingInterval:
      (cachedListStats?.importing ?? 0) > 0 ||
      (cachedListStats?.syncing ?? 0) > 0
        ? 3000
        : 0,
  });

  const { data: recentListsData } = useListListsQuery({
    clientId: dashboardClientId,
    limit: 5,
    sortOrder: 'desc',
  });

  const { data: statsData, isLoading: statsLoading } = useGetArticleStatsQuery(
    dashboardClientId,
    { skip: !isAdmin && !customerClientId },
  );

  const { data: recentJobs } = useListSyncJobsQuery({ page: 1, limit: 5 });
  const { data: failedData } = useListFailedArticlesQuery(
    dashboardClientId
      ? { clientId: dashboardClientId, limit: 1 }
      : { limit: 1 },
  );

  const totalLists = listStats?.total ?? 0;
  const failedCount = failedData?.meta?.total ?? 0;
  const listsSub = buildListsSubParts(listStats);
  const articlesLink = buildArticlesLink(dashboardClientId);
  const listsLink = buildListsLink(dashboardClientId);
  const failedSyncLink = buildFailedSyncLink(dashboardClientId);
  const articlesSub = statsData
    ? buildArticlesSub(statsData, isAdmin, dashboardClientId)
    : undefined;

  function setDashboardClient(clientId: string | undefined) {
    const next = new URLSearchParams(searchParams);
    if (clientId) next.set('clientId', clientId);
    else next.delete('clientId');
    setSearchParams(next, { replace: true });
  }

  return {
    authUser,
    isAdmin,
    dashboardClientId,
    clientStats,
    clientsData,
    listStats,
    recentListsData,
    statsData,
    statsLoading,
    recentJobs,
    failedCount,
    totalLists,
    listsSub,
    articlesLink,
    listsLink,
    failedSyncLink,
    articlesSub,
    setDashboardClient,
  };
}
