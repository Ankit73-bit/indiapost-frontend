import { AlertTriangle, List, Package, Users } from 'lucide-react';
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard';
import type { useGetArticleStatsQuery } from '@/store/api/articlesApi';
import type { useGetClientStatsQuery } from '@/store/api/clientsApi';

interface DashboardStatsGridProps {
  isAdmin: boolean;
  clientStats: ReturnType<typeof useGetClientStatsQuery>['data'];
  totalLists: number;
  listsSub: string | undefined;
  statsData: ReturnType<typeof useGetArticleStatsQuery>['data'];
  statsLoading: boolean;
  failedCount: number;
  articlesSub: string | undefined;
  onNavigateClients: () => void;
  onNavigateLists: () => void;
  onNavigateArticles: () => void;
  onNavigateFailedSync: () => void;
}

export function DashboardStatsGrid({
  isAdmin,
  clientStats,
  totalLists,
  listsSub,
  statsData,
  statsLoading,
  failedCount,
  articlesSub,
  onNavigateClients,
  onNavigateLists,
  onNavigateArticles,
  onNavigateFailedSync,
}: DashboardStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {isAdmin && (
        <DashboardStatCard
          label="Active Clients"
          value={clientStats?.active ?? 0}
          icon={Users}
          sub={`${clientStats?.total ?? 0} total`}
          onClick={onNavigateClients}
        />
      )}
      <DashboardStatCard
        label="Lists"
        value={totalLists}
        icon={List}
        sub={listsSub}
        onClick={onNavigateLists}
      />
      {(statsData || (isAdmin && statsLoading)) && (
        <DashboardStatCard
          label="Total Articles"
          value={
            statsLoading
              ? '…'
              : (statsData?.totalArticles.toLocaleString() ?? '0')
          }
          icon={Package}
          sub={statsData ? articlesSub : undefined}
          onClick={onNavigateArticles}
        />
      )}
      {failedCount > 0 && (
        <DashboardStatCard
          label="Failed Articles"
          value={failedCount}
          icon={AlertTriangle}
          sub="Click to retry"
          onClick={onNavigateFailedSync}
        />
      )}
    </div>
  );
}
