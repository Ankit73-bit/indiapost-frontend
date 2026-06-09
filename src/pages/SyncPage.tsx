import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, RotateCcw, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { SyncJobStatusBadge } from '@/components/shared/StatusBadge';
import { Pagination } from '@/components/shared/Pagination';
import { useListClientsQuery } from '@/store/api/clientsApi';
import { useListListsQuery, listsApi } from '@/store/api/listsApi';
import { useAppDispatch } from '@/store';
import { ClientFilterSelect } from '@/components/shared/ClientFilterSelect';
import {
  useTriggerSyncMutation,
  useListSyncJobsQuery,
  useListFailedArticlesQuery,
  useRetryFailedArticleMutation,
} from '@/store/api/syncApi';
import { formatRelative, getApiErrorMessage } from '@/lib/helpers';
import { toast } from '@/lib/toast';
import type { SyncJob, SyncJobStatus } from '@/types';

const ALL_LISTS = '__all__';
const ALL_LISTS_FILTER = '__all_lists__';
const ALL_STATUS = '__all_status__';

const JOB_STATUSES: SyncJobStatus[] = [
  'QUEUED',
  'RUNNING',
  'COMPLETED',
  'PARTIAL',
  'FAILED',
];

function syncJobPercent(job: SyncJob): number {
  if (!job.totalArticles) return 0;
  return Math.min(
    100,
    Math.round((job.processedCount / job.totalArticles) * 100),
  );
}

function isActiveJob(job: SyncJob): boolean {
  return job.status === 'QUEUED' || job.status === 'RUNNING';
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SyncPage() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [resolvedListNames, setResolvedListNames] = useState<
    Record<string, string>
  >({});

  const filterClientId = searchParams.get('clientId') ?? '';
  const filterListId = searchParams.get('listId') ?? '';
  const filterStatus = searchParams.get('status') ?? '';
  const activeTab =
    searchParams.get('tab') === 'failed' ? 'failed' : 'jobs';

  const [jobsPage, setJobsPage] = useState(1);
  const [failedPage, setFailedPage] = useState(1);
  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedListId, setSelectedListId] = useState(ALL_LISTS);
  const [triggerError, setTriggerError] = useState('');
  const [pollJobs, setPollJobs] = useState(false);

  function patchParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  }

  useEffect(() => {
    setJobsPage(1);
    setFailedPage(1);
  }, [filterClientId, filterListId, filterStatus]);

  const { data: clientsData } = useListClientsQuery({ limit: 100 });
  const { data: listsData } = useListListsQuery({ limit: 100 });
  const { data: filterListsData } = useListListsQuery(
    { clientId: filterClientId || undefined, limit: 100 },
    { skip: !filterClientId },
  );

  const { data: jobsData, isLoading: jobsLoading } = useListSyncJobsQuery(
    {
      page: jobsPage,
      limit: 20,
      listOnly: true,
      clientId: filterClientId || undefined,
      listId: filterListId || undefined,
      status: (filterStatus as SyncJobStatus) || undefined,
    },
    { pollingInterval: pollJobs ? 3000 : 0 },
  );

  const { data: failedData, isLoading: failedLoading } =
    useListFailedArticlesQuery(
      {
        page: failedPage,
        limit: 20,
        clientId: filterClientId || undefined,
        listId: filterListId || undefined,
      },
      { pollingInterval: pollJobs ? 3000 : 0 },
    );

  const { data: clientListsData } = useListListsQuery(
    { clientId: selectedClientId || undefined, limit: 100 },
    { skip: !selectedClientId },
  );

  const activeJobs = jobsData?.data.filter((j) => isActiveJob(j)) ?? [];

  useEffect(() => {
    setPollJobs(activeJobs.length > 0);
  }, [activeJobs.length]);

  const listNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const l of listsData?.data ?? []) map.set(l._id, l.name);
    for (const l of filterListsData?.data ?? []) map.set(l._id, l.name);
    for (const [id, name] of Object.entries(resolvedListNames)) map.set(id, name);
    return map;
  }, [listsData?.data, filterListsData?.data, resolvedListNames]);

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
          setResolvedListNames((prev) => ({ ...prev, [list._id]: list.name }));
        })
        .catch(() => {});
    }
  }, [jobsData?.data, dispatch, listNameById]);

  const [triggerSync, { isLoading: triggering }] = useTriggerSyncMutation();
  const [retryArticle] = useRetryFailedArticleMutation();

  const syncableLists =
    clientListsData?.data.filter(
      (l) =>
        l.status !== 'IMPORTING' &&
        l.status !== 'SYNCING' &&
        l.status !== 'ARCHIVED',
    ) ?? [];

  const hasJobFilters = Boolean(
    filterClientId || filterListId || filterStatus,
  );

  function handleClientChange(clientId: string) {
    setSelectedClientId(clientId);
    setSelectedListId(ALL_LISTS);
    setTriggerError('');
  }

  function openTriggerDialog() {
    setSelectedClientId(filterClientId);
    setSelectedListId(filterListId || ALL_LISTS);
    setTriggerError('');
    setTriggerDialogOpen(true);
  }

  async function handleTrigger() {
    if (!selectedClientId) return;
    setTriggerError('');
    try {
      const body =
        selectedListId === ALL_LISTS
          ? { clientId: selectedClientId }
          : { clientId: selectedClientId, listId: selectedListId };
      const result = await triggerSync(body).unwrap();
      toast.success(result.message);
      if (result.syncJobId) setPollJobs(true);
      setTriggerDialogOpen(false);
      setSelectedClientId('');
      setSelectedListId(ALL_LISTS);
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
      setPollJobs(true);
    } catch (err) {
      toast.apiError(err, 'Failed to retry article');
    }
  }

  const scopeHint =
    selectedListId === ALL_LISTS
      ? 'Creates one sync job per list that has non-terminal articles for this client.'
      : 'Syncs only non-terminal articles in the selected list.';

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sync"
        description="Monitor and trigger India Post tracking sync jobs."
        actions={
          <Button size="sm" onClick={openTriggerDialog}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Trigger Sync
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <ClientFilterSelect
          clients={clientsData?.data.filter((c) => c.isActive) ?? []}
          value={filterClientId || undefined}
          className="w-[180px]"
          onChange={(clientId) =>
            patchParams({
              clientId: clientId ?? null,
              listId: null,
            })
          }
        />

        <Select
          value={filterListId || ALL_LISTS_FILTER}
          onValueChange={(v) =>
            patchParams({ listId: v === ALL_LISTS_FILTER ? null : v })
          }
          disabled={!filterClientId}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue
              placeholder={filterClientId ? 'All lists' : 'Select client first'}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_LISTS_FILTER}>All lists</SelectItem>
            {filterListsData?.data.map((l) => (
              <SelectItem key={l._id} value={l._id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterStatus || ALL_STATUS}
          onValueChange={(v) =>
            patchParams({ status: v === ALL_STATUS ? null : v })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUS}>All statuses</SelectItem>
            {JOB_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasJobFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              patchParams({ clientId: null, listId: null, status: null })
            }
          >
            <X className="mr-1 h-3.5 w-3.5" /> Clear filters
          </Button>
        )}
      </div>

      {activeJobs.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-medium">
            {activeJobs.length} sync job{activeJobs.length !== 1 ? 's' : ''}{' '}
            running — progress refreshes automatically.
          </p>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(tab) => patchParams({ tab: tab === 'jobs' ? null : tab })}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="jobs">Sync Jobs</TabsTrigger>
          <TabsTrigger value="failed">
            Failed Articles
            {failedData?.meta && failedData.meta.total > 0 && (
              <span className="ml-1.5 rounded-full bg-destructive/15 px-1.5 py-0.5 text-xs text-destructive">
                {failedData.meta.total}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <div className="rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Job ID
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Client
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    List
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Progress
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                    Failed
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Started
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobsLoading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                )}
                {!jobsLoading && jobsData?.data.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No sync jobs match your filters.
                    </td>
                  </tr>
                )}
                {jobsData?.data.map((job) => (
                  <tr
                    key={job._id}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {job._id.slice(-8)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {clientsData?.data.find((c) => c._id === job.clientId)
                        ?.name ?? job.clientId.slice(-6)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {job.listId
                        ? (listNameById.get(job.listId) ??
                          job.listId.slice(-6))
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <SyncJobStatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3 min-w-[160px]">
                      {job.totalArticles > 0 ? (
                        <div className="space-y-1">
                          <div className="h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isActiveJob(job)
                                  ? 'bg-blue-500'
                                  : 'bg-muted-foreground/40'
                              }`}
                              style={{ width: `${syncJobPercent(job)}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">
                            {job.processedCount.toLocaleString()} /{' '}
                            {job.totalArticles.toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-destructive">
                      {job.failedCount > 0 ? job.failedCount : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatRelative(job.startedAt ?? job.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {jobsData?.meta && jobsData.meta.totalPages > 1 && (
              <div className="px-4 pb-4">
                <Pagination meta={jobsData.meta} onPageChange={setJobsPage} />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="failed">
          <p className="mb-3 text-sm text-muted-foreground">
            Articles where the last sync attempt failed. Trigger Sync on the list
            retries all of these automatically — per-article Retry is optional.
          </p>
          <div className="rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Article #
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Reason
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                    Attempts
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Last Attempt
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {failedLoading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                )}
                {!failedLoading && failedData?.data.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No failed articles.
                    </td>
                  </tr>
                )}
                {failedData?.data.map((fa) => (
                  <tr
                    key={fa._id}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {fa.articleNumber}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-sm truncate">
                      {fa.reason}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {fa.retryCount}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatRelative(fa.updatedAt ?? fa.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1"
                        onClick={() => handleRetry(fa.articleId)}
                      >
                        <RotateCcw className="h-3 w-3" /> Retry
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {failedData?.meta && failedData.meta.totalPages > 1 && (
              <div className="px-4 pb-4">
                <Pagination
                  meta={failedData.meta}
                  onPageChange={setFailedPage}
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={triggerDialogOpen} onOpenChange={setTriggerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Trigger Sync</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">{scopeHint}</p>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Client
              </label>
              <Select
                value={selectedClientId}
                onValueChange={handleClientChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clientsData?.data
                    .filter((c) => c.isActive)
                    .map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClientId && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  List
                </label>
                <Select
                  value={selectedListId}
                  onValueChange={(v) => {
                    setSelectedListId(v);
                    setTriggerError('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select list" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_LISTS}>
                      All lists (one job per list)
                    </SelectItem>
                    {syncableLists.map((l) => (
                      <SelectItem key={l._id} value={l._id}>
                        {l.name}
                        {l.totalArticles > 0
                          ? ` · ${l.totalArticles.toLocaleString()} articles`
                          : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {triggerError && (
              <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {triggerError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTriggerDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTrigger}
              disabled={!selectedClientId || triggering}
            >
              {triggering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Trigger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
