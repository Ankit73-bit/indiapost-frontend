import { useNavigate } from 'react-router-dom';
import { Package, Users, List, RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAppSelector } from '@/store';
import { useListClientsQuery } from '@/store/api/clientsApi';
import { useListListsQuery } from '@/store/api/listsApi';
import { useGetArticleStatsQuery } from '@/store/api/articlesApi';
import { useListSyncJobsQuery, useListFailedArticlesQuery } from '@/store/api/syncApi';
import { ArticleStatusBadge, SyncJobStatusBadge } from '@/components/shared/StatusBadge';
import { PageHeader } from '@/components/shared/PageHeader';
import { STATUS_CONFIG, formatRelative, formatDateTime } from '@/lib/helpers';
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
      className={`rounded-lg border border-border bg-card p-4 ${onClick ? 'cursor-pointer hover:bg-muted/20 transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className="rounded-md bg-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate  = useNavigate();
  const authUser  = useAppSelector((s) => s.auth.user);
  const isAdmin   = authUser?.role === 'admin';

  // For customers, scope to their clientId automatically
  const customerClientId = !isAdmin ? (authUser?.clientId ?? undefined) : undefined;

  const { data: clientsData } = useListClientsQuery({ limit: 100 }, { skip: !isAdmin });
  const { data: listsData }   = useListListsQuery(
    customerClientId ? { clientId: customerClientId } : undefined,
  );
  const { data: statsData }   = useGetArticleStatsQuery(
    customerClientId ?? '',
    { skip: !customerClientId },
  );
  const { data: recentJobs }  = useListSyncJobsQuery({ page: 1, limit: 5 });
  const { data: failedData }  = useListFailedArticlesQuery(
    customerClientId ? { clientId: customerClientId } : undefined,
  );

  const activeClients   = clientsData?.data.filter((c) => c.isActive).length ?? 0;
  const totalLists      = listsData?.meta?.total ?? listsData?.data.length ?? 0;
  const failedCount     = failedData?.meta?.total ?? 0;
  const syncingLists    = listsData?.data.filter((l) => l.status === 'SYNCING').length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back${authUser?.email ? `, ${authUser.email}` : ''}.`}
      />

      {/* ── Top stats ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isAdmin && (
          <StatCard
            label="Active Clients"
            value={activeClients}
            icon={Users}
            sub={`${clientsData?.data.length ?? 0} total`}
            onClick={() => navigate('/clients')}
          />
        )}
        <StatCard
          label="Lists"
          value={totalLists}
          icon={List}
          sub={syncingLists > 0 ? `${syncingLists} syncing now` : undefined}
          onClick={() => navigate('/lists')}
        />
        {statsData && (
          <StatCard
            label="Total Articles"
            value={statsData.totalArticles.toLocaleString()}
            icon={Package}
            sub={`${statsData.deliveryRate}% delivered`}
            onClick={() => navigate('/articles' + (customerClientId ? `?clientId=${customerClientId}` : ''))}
          />
        )}
        {failedCount > 0 && (
          <StatCard
            label="Failed Articles"
            value={failedCount}
            icon={AlertTriangle}
            sub="Click to retry"
            onClick={() => navigate('/sync?tab=failed')}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Article status breakdown ── */}
        {statsData && statsData.totalArticles > 0 && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Article Status Breakdown</h2>
            <div className="space-y-2">
              {Object.entries(statsData.byStatus)
                .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
                .map(([status, count]) => {
                  const pct = statsData.totalArticles > 0 ? Math.round(((count ?? 0) / statsData.totalArticles) * 100) : 0;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <ArticleStatusBadge status={status as NormalizedStatus} className="w-32 justify-center" />
                      <div className="flex-1 rounded-full bg-muted h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-16 text-right font-mono text-xs text-muted-foreground">
                        {(count ?? 0).toLocaleString()} <span className="text-muted-foreground/60">({pct}%)</span>
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ── Recent sync jobs ── */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Sync Jobs</h2>
            <button
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              onClick={() => navigate('/sync')}
            >
              View all
            </button>
          </div>
          {!recentJobs?.data.length && (
            <p className="text-sm text-muted-foreground">No sync jobs yet.</p>
          )}
          <div className="space-y-2">
            {recentJobs?.data.map((job) => (
              <div key={job._id} className="flex items-center justify-between gap-3 text-sm">
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
        {listsData && listsData.data.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-4 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recent Lists</h2>
              <button
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                onClick={() => navigate('/lists')}
              >
                View all
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-medium text-muted-foreground text-xs">Name</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground text-xs">Status</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground text-xs">Articles</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground text-xs">Delivered</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground text-xs">Updated</th>
                </tr>
              </thead>
              <tbody>
                {listsData.data.slice(0, 5).map((list) => {
                  const delivered = list.stats?.DELIVERED ?? 0;
                  const pct = list.totalArticles > 0
                    ? Math.round((delivered / list.totalArticles) * 100)
                    : 0;
                  return (
                    <tr
                      key={list._id}
                      className="border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/20"
                      onClick={() => navigate(`/articles?clientId=${list.clientId}&listId=${list._id}`)}
                    >
                      <td className="py-2.5 font-medium">{list.name}</td>
                      <td className="py-2.5">
                        <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${
                          list.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200'
                          : list.status === 'SYNCING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                          : list.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700 border-blue-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}>
                          {list.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono text-xs">
                        {(list.totalArticles ?? 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-mono text-xs">
                        {delivered.toLocaleString()} <span className="text-muted-foreground">({pct}%)</span>
                      </td>
                      <td className="py-2.5 text-xs text-muted-foreground">
                        {formatRelative(list.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
