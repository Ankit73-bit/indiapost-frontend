import type { ListSummaryStats } from '@/types';
import type { useGetArticleStatsQuery } from '@/store/api/articlesApi';

export function buildListsSubParts(
  listStats: ListSummaryStats | undefined,
): string | undefined {
  const parts: string[] = [];
  if ((listStats?.importing ?? 0) > 0) {
    parts.push(`${listStats!.importing} importing`);
  }
  if ((listStats?.syncing ?? 0) > 0) {
    parts.push(`${listStats!.syncing} syncing`);
  }
  return parts.length > 0 ? parts.join(' · ') : undefined;
}

export function buildArticlesLink(clientId: string | undefined): string {
  return '/articles' + (clientId ? `?clientId=${clientId}` : '');
}

export function buildListsLink(clientId: string | undefined): string {
  return '/lists' + (clientId ? `?clientId=${clientId}` : '');
}

export function buildFailedSyncLink(clientId: string | undefined): string {
  return (
    '/sync?tab=failed' + (clientId ? `&clientId=${clientId}` : '')
  );
}

export function buildArticlesSub(
  statsData: NonNullable<ReturnType<typeof useGetArticleStatsQuery>['data']>,
  isAdmin: boolean,
  dashboardClientId: string | undefined,
): string {
  return `${statsData.deliveryRate}% delivered${
    isAdmin && !dashboardClientId ? ' · all clients' : ''
  }`;
}
