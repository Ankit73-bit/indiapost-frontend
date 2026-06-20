import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Package,
  Users,
  List,
  AlertTriangle,
} from 'lucide-react';
import { useAppSelector } from '@/store';
import { useListClientsQuery, useGetClientStatsQuery } from '@/store/api/clientsApi';
import { useGetArticleStatsQuery } from '@/store/api/articlesApi';
import { useListSyncJobsQuery, useListFailedArticlesQuery } from '@/store/api/syncApi';
import { useListListsQuery, useGetListStatsQuery, listsApi } from '@/store/api/listsApi';
import {
  ArticleStatusBadge,
  ListStatusBadge,
  SyncJobStatusBadge,
} from '@/components/shared/StatusBadge';
import { ClientFilterSelect } from '@/components/shared/SearchableClientSelect';
import { PageHeader } from '@/components/shared/PageHeader';
import { importResultSummary } from '@/lib/listProgress';
import { listDisplayName } from '@/lib/listNaming';
import { formatRelative } from '@/lib/helpers';
import type { NormalizedStatus } from '@/types';

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  onClick,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`group rounded-xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer hover:border-primary/30 hover:bg-gradient-to-br hover:from-card hover:to-primary/5' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
          {sub && <p className="mt-1 text-xs font-medium text-muted-foreground">{sub}</p>}
        </div>
        <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-3 ring-1 ring-primary/20 group-hover:ring-primary/30 transition-all shrink-0">
          <Icon className="h-5 w-5 text-primary group-hover:text-primary transition-colors" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate();
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

  const listsSubParts: string[] = [];
  if ((listStats?.importing ?? 0) > 0) {
    listsSubParts.push(`${listStats!.importing} importing`);
  }
  if ((listStats?.syncing ?? 0) > 0) {
    listsSubParts.push(`${listStats!.syncing} syncing`);
  }

  function setDashboardClient(clientId: string | undefined) {
    const next = new URLSearchParams(searchParams);
    if (clientId) next.set('clientId', clientId);
    else next.delete('clientId');
    setSearchParams(next, { replace: true });
  }

  const articlesLink =
    '/articles' + (dashboardClientId ? `?clientId=${dashboardClientId}` : '');

  return (
    <div className="space-y-6">
      <PageHeader
        title="IndiaPost CRM"
        description={`Welcome back${authUser?.email ? `, ${authUser.email}` : ''}.`}
        actions={
          isAdmin ? (
            <ClientFilterSelect
              clients={clientsData?.data ?? []}
              value={dashboardClientId}
              onChange={setDashboardClient}
            />
          ) : undefined
        }
      />

      {/* ── Top stats ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isAdmin && (
          <StatCard
            label="Active Clients"
            value={clientStats?.active ?? 0}
            icon={Users}
            sub={`${clientStats?.total ?? 0} total`}
            onClick={() => navigate('/clients')}
          />
        )}
        <StatCard
          label="Lists"
          value={totalLists}
          icon={List}
          sub={listsSubParts.length > 0 ? listsSubParts.join(' · ') : undefined}
          onClick={() =>
            navigate(
              '/lists' +
                (dashboardClientId ? `?clientId=${dashboardClientId}` : ''),
            )
          }
        />
        {(statsData || (isAdmin && statsLoading)) && (
          <StatCard
            label="Total Articles"
            value={
              statsLoading
                ? '…'
                : (statsData?.totalArticles.toLocaleString() ?? '0')
            }
            icon={Package}
            sub={
              statsData
                ? `${statsData.deliveryRate}% delivered${
                    isAdmin && !dashboardClientId ? ' · all clients' : ''
                  }`
                : undefined
            }
            onClick={() => navigate(articlesLink)}
          />
        )}
        {failedCount > 0 && (
          <StatCard
            label="Failed Articles"
            value={failedCount}
            icon={AlertTriangle}
            sub="Click to retry"
            onClick={() =>
              navigate(
                '/sync?tab=failed' +
                  (dashboardClientId ? `&clientId=${dashboardClientId}` : ''),
              )
            }
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Article status breakdown ── */}
        {statsData && statsData.totalArticles > 0 && (
          <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-foreground">Article Status Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(statsData.byStatus)
                .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
                .map(([status, count]) => {
                  const pct =
                    statsData.totalArticles > 0
                      ? Math.round(
                          ((count ?? 0) / statsData.totalArticles) * 100,
                        )
                      : 0;
                  return (
                    <div key={status} className="flex items-center gap-4">
                      <ArticleStatusBadge
                        status={status as NormalizedStatus}
                        className="w-28 justify-center flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="rounded-full bg-muted/60 h-2 overflow-hidden ring-1 ring-border/30">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all shadow-sm"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-20 text-right font-mono text-xs font-semibold text-foreground">
                        {(count ?? 0).toLocaleString()}{' '}
                        <span className="text-muted-foreground">({pct}%)</span>
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ── Recent sync jobs ── */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Recent Sync Jobs</h2>
            <button
              className="text-xs font-semibold text-primary hover:text-primary/80 underline-offset-2 hover:underline transition-colors"
              onClick={() => navigate('/sync')}
            >
              View all →
            </button>
          </div>
          {!recentJobs?.data.length && (
            <p className="text-sm text-muted-foreground">No sync jobs yet.</p>
          )}
          <div className="space-y-2">
            {recentJobs?.data.map((job) => (
              <div
                key={job._id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <SyncJobStatusBadge status={job.status} />
                  <span className="truncate text-xs text-muted-foreground capitalize">
                    {job.triggeredBy}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                  <span className="font-mono">
                    {job.processedCount}/{job.totalArticles}
                  </span>
                  <span>{formatRelative(job.startedAt ?? job.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Lists overview ── */}
        {recentListsData && recentListsData.data.length > 0 && (
          <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Recent Lists</h2>
              <button
                className="text-xs font-semibold text-primary hover:text-primary/80 underline-offset-2 hover:underline transition-colors"
                onClick={() =>
                  navigate(
                    '/lists' +
                      (dashboardClientId
                        ? `?clientId=${dashboardClientId}`
                        : ''),
                  )
                }
              >
                View all →
              </button>
            </div>
            <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="pb-3 text-left font-semibold text-foreground text-xs uppercase tracking-wider">
                    Name
                  </th>
                  <th className="pb-3 text-left font-semibold text-foreground text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="pb-3 text-right font-semibold text-foreground text-xs uppercase tracking-wider">
                    Articles
                  </th>
                  <th className="pb-3 text-right font-semibold text-foreground text-xs uppercase tracking-wider">
                    Delivered
                  </th>
                  <th className="pb-3 text-left font-semibold text-foreground text-xs uppercase tracking-wider">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentListsData.data.map((list) => {
                  const delivered = list.stats?.DELIVERED ?? 0;
                  const pct =
                    list.totalArticles > 0
                      ? Math.round((delivered / list.totalArticles) * 100)
                      : 0;
                  const importSummary = importResultSummary(list);
                  const importErrors = list.lastImportResult?.errorRows?.length;

                  return (
                    <tr
                      key={list._id}
                      className="border-b border-border/30 last:border-0 cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() =>
                        navigate(
                          `/articles?clientId=${list.clientId}&listId=${list._id}`,
                        )
                      }
                    >
                      <td className="py-3">
                        <p className="font-semibold text-foreground">{listDisplayName(list)}</p>
                        {importSummary && (
                          <p className="mt-0.5 text-xs text-muted-foreground font-medium">
                            Last import: {importSummary}
                          </p>
                        )}
                        {(importErrors ?? 0) > 0 && (
                          <p className="mt-0.5 text-xs text-destructive font-semibold">
                            {importErrors} import error
                            {importErrors !== 1 ? 's' : ''}
                          </p>
                        )}
                      </td>
                      <td className="py-3">
                        <ListStatusBadge status={list.status} />
                      </td>
                      <td className="py-3 text-right font-mono text-xs font-semibold text-foreground">
                        {(list.totalArticles ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-mono text-xs font-semibold text-foreground">
                        {delivered.toLocaleString()}{' '}
                        <span className="text-muted-foreground">({pct}%)</span>
                      </td>
                      <td className="py-3 text-xs font-medium text-muted-foreground">
                        {formatRelative(list.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
