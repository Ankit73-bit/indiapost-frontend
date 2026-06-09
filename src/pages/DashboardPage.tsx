import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Package,
  Users,
  List,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useAppSelector } from '@/store';
import { useListClientsQuery } from '@/store/api/clientsApi';
import { useGetArticleStatsQuery } from '@/store/api/articlesApi';
import { useListSyncJobsQuery, useListFailedArticlesQuery } from '@/store/api/syncApi';
import { usePollListsWhileActive } from '@/hooks/usePollListsWhileActive';
import {
  ArticleStatusBadge,
  ListStatusBadge,
  SyncJobStatusBadge,
} from '@/components/shared/StatusBadge';
import { ClientFilterSelect } from '@/components/shared/ClientFilterSelect';
import { PageHeader } from '@/components/shared/PageHeader';
import { importResultSummary } from '@/lib/listProgress';
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const authUser = useAppSelector((s) => s.auth.user);
  const isAdmin = authUser?.role === 'admin';

  const customerClientId = !isAdmin ? (authUser?.clientId ?? undefined) : undefined;
  const dashboardClientId = isAdmin
    ? (searchParams.get('clientId') ?? undefined)
    : customerClientId;

  const { data: clientsData } = useListClientsQuery({ limit: 100 }, { skip: !isAdmin });

  const { data: listsData } = usePollListsWhileActive(
    dashboardClientId ? { clientId: dashboardClientId, limit: 100 } : { limit: 100 },
  );

  const importingLists = listsData?.data.filter((l) => l.status === 'IMPORTING') ?? [];
  const syncingLists = listsData?.data.filter((l) => l.status === 'SYNCING') ?? [];
  const hasActiveOps = importingLists.length > 0 || syncingLists.length > 0;

  const { data: statsData, isLoading: statsLoading } = useGetArticleStatsQuery(
    dashboardClientId,
    { skip: !isAdmin && !customerClientId },
  );

  const { data: recentJobs } = useListSyncJobsQuery({ page: 1, limit: 5 });
  const { data: failedData } = useListFailedArticlesQuery(
    dashboardClientId ? { clientId: dashboardClientId } : undefined,
  );

  const activeClients = clientsData?.data.filter((c) => c.isActive).length ?? 0;
  const totalLists = listsData?.meta?.total ?? listsData?.data.length ?? 0;
  const failedCount = failedData?.meta?.total ?? 0;

  const listsSubParts: string[] = [];
  if (importingLists.length > 0) {
    listsSubParts.push(`${importingLists.length} importing`);
  }
  if (syncingLists.length > 0) {
    listsSubParts.push(`${syncingLists.length} syncing`);
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
        title="Dashboard"
        description={`Welcome back${authUser?.email ? `, ${authUser.email}` : ''}.`}
        actions={
          isAdmin ? (
            <ClientFilterSelect
              clients={clientsData?.data.filter((c) => c.isActive) ?? []}
              value={dashboardClientId}
              onChange={setDashboardClient}
            />
          ) : undefined
        }
      />

      {hasActiveOps && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            Background operations in progress
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {importingLists.map((list) => (
              <button
                key={list._id}
                type="button"
                onClick={() =>
                  navigate(`/lists?clientId=${list.clientId}`)
                }
                className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-900 hover:bg-amber-100"
              >
                {list.name} — importing
              </button>
            ))}
            {syncingLists.map((list) => (
              <button
                key={list._id}
                type="button"
                onClick={() =>
                  navigate(
                    `/sync?listId=${list._id}&clientId=${list.clientId}`,
                  )
                }
                className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs text-blue-900 hover:bg-blue-100"
              >
                {list.name} — syncing
              </button>
            ))}
          </div>
        </div>
      )}

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
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Article Status Breakdown</h2>
            <div className="space-y-2">
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
                    <div key={status} className="flex items-center gap-3">
                      <ArticleStatusBadge
                        status={status as NormalizedStatus}
                        className="w-32 justify-center"
                      />
                      <div className="flex-1 rounded-full bg-muted h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-16 text-right font-mono text-xs text-muted-foreground">
                        {(count ?? 0).toLocaleString()}{' '}
                        <span className="text-muted-foreground/60">
                          ({pct}%)
                        </span>
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
        {listsData && listsData.data.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-4 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recent Lists</h2>
              <button
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                onClick={() =>
                  navigate(
                    '/lists' +
                      (dashboardClientId
                        ? `?clientId=${dashboardClientId}`
                        : ''),
                  )
                }
              >
                View all
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-medium text-muted-foreground text-xs">
                    Name
                  </th>
                  <th className="pb-2 text-left font-medium text-muted-foreground text-xs">
                    Status
                  </th>
                  <th className="pb-2 text-right font-medium text-muted-foreground text-xs">
                    Articles
                  </th>
                  <th className="pb-2 text-right font-medium text-muted-foreground text-xs">
                    Delivered
                  </th>
                  <th className="pb-2 text-left font-medium text-muted-foreground text-xs">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {listsData.data.slice(0, 5).map((list) => {
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
                      className="border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/20"
                      onClick={() =>
                        navigate(
                          `/articles?clientId=${list.clientId}&listId=${list._id}`,
                        )
                      }
                    >
                      <td className="py-2.5">
                        <p className="font-medium">{list.name}</p>
                        {importSummary && list.status === 'ACTIVE' && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Last import: {importSummary}
                          </p>
                        )}
                        {(importErrors ?? 0) > 0 && (
                          <p className="mt-0.5 text-xs text-destructive">
                            {importErrors} import error
                            {importErrors !== 1 ? 's' : ''}
                          </p>
                        )}
                      </td>
                      <td className="py-2.5">
                        <ListStatusBadge status={list.status} />
                      </td>
                      <td className="py-2.5 text-right font-mono text-xs">
                        {(list.totalArticles ?? 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-mono text-xs">
                        {delivered.toLocaleString()}{' '}
                        <span className="text-muted-foreground">({pct}%)</span>
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
