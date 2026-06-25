import { useNavigate } from 'react-router-dom';
import { ClientFilterSelect } from '@/components/shared/SearchableClientSelect';
import { PageHeader } from '@/components/shared/PageHeader';
import { ArticleStatusBreakdownCard } from '@/components/dashboard/ArticleStatusBreakdownCard';
import { DashboardStatsGrid } from '@/components/dashboard/DashboardStatsGrid';
import { RecentListsCard } from '@/components/dashboard/RecentListsCard';
import { RecentSyncJobsCard } from '@/components/dashboard/RecentSyncJobsCard';
import { useDashboardPage } from '@/hooks/useDashboardPage';

export function DashboardPage() {
  const navigate = useNavigate();
  const dashboard = useDashboardPage();

  return (
    <div className="space-y-6">
      <PageHeader
        title="IndiaPost CRM"
        description={`Welcome back${dashboard.authUser?.email ? `, ${dashboard.authUser.email}` : ''}.`}
        actions={
          dashboard.isAdmin ? (
            <ClientFilterSelect
              clients={dashboard.clientsData?.data ?? []}
              value={dashboard.dashboardClientId}
              onChange={dashboard.setDashboardClient}
            />
          ) : undefined
        }
      />

      <DashboardStatsGrid
        isAdmin={dashboard.isAdmin}
        clientStats={dashboard.clientStats}
        totalLists={dashboard.totalLists}
        listsSub={dashboard.listsSub}
        statsData={dashboard.statsData}
        statsLoading={dashboard.statsLoading}
        failedCount={dashboard.failedCount}
        articlesSub={dashboard.articlesSub}
        onNavigateClients={() => navigate('/clients')}
        onNavigateLists={() => navigate(dashboard.listsLink)}
        onNavigateArticles={() => navigate(dashboard.articlesLink)}
        onNavigateFailedSync={() => navigate(dashboard.failedSyncLink)}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {dashboard.statsData && (
          <ArticleStatusBreakdownCard statsData={dashboard.statsData} />
        )}

        <RecentSyncJobsCard
          recentJobs={dashboard.recentJobs}
          onViewAll={() => navigate('/sync')}
        />

        {dashboard.recentListsData && (
          <RecentListsCard
            recentListsData={dashboard.recentListsData}
            onViewAll={() => navigate(dashboard.listsLink)}
            onListClick={(clientId, listId) =>
              navigate(`/articles?clientId=${clientId}&listId=${listId}`)
            }
          />
        )}
      </div>
    </div>
  );
}
