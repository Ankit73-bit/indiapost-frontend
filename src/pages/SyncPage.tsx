import { useEffect, useState } from 'react';
import { RefreshCw, RotateCcw, Loader2 } from 'lucide-react';
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
import { useListListsQuery } from '@/store/api/listsApi';
import {
  useTriggerSyncMutation,
  useListSyncJobsQuery,
  useListFailedArticlesQuery,
  useRetryFailedArticleMutation,
} from '@/store/api/syncApi';
import { formatRelative, getApiErrorMessage } from '@/lib/helpers';
import type { SyncJob } from '@/types';

const ALL_LISTS = '__all__';

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
  const [jobsPage, setJobsPage] = useState(1);
  const [failedPage, setFailedPage] = useState(1);
  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedListId, setSelectedListId] = useState(ALL_LISTS);
  const [triggerError, setTriggerError] = useState('');
  const [triggerSuccess, setTriggerSuccess] = useState('');
  const [pollJobs, setPollJobs] = useState(false);

  const { data: clientsData } = useListClientsQuery({ limit: 100 });
  const { data: listsData } = useListListsQuery({ limit: 500 });
  const { data: jobsData, isLoading: jobsLoading } = useListSyncJobsQuery(
    {
      page: jobsPage,
      limit: 20,
      listOnly: false,
    },
    { pollingInterval: pollJobs ? 3000 : 0 },
  );
  const { data: failedData, isLoading: failedLoading } =
    useListFailedArticlesQuery(
      {
        page: failedPage,
        limit: 20,
      },
      { pollingInterval: pollJobs ? 3000 : 0 },
    );

  const { data: clientListsData } = useListListsQuery(
    { clientId: selectedClientId || undefined, limit: 100 },
    { skip: !selectedClientId },
  );

  const activeJobs =
    jobsData?.data.filter((j) => isActiveJob(j)) ?? [];

  useEffect(() => {
    setPollJobs(activeJobs.length > 0);
  }, [activeJobs.length]);

  const listNameById = new Map(
    listsData?.data.map((l) => [l._id, l.name]) ?? [],
  );

  const [triggerSync, { isLoading: triggering }] = useTriggerSyncMutation();
  const [retryArticle] = useRetryFailedArticleMutation();

  const syncableLists =
    clientListsData?.data.filter(
      (l) =>
        l.status !== 'IMPORTING' &&
        l.status !== 'SYNCING' &&
        l.status !== 'ARCHIVED',
    ) ?? [];

  function handleClientChange(clientId: string) {
    setSelectedClientId(clientId);
    setSelectedListId(ALL_LISTS);
    setTriggerError('');
  }

  function openTriggerDialog() {
    setSelectedClientId('');
    setSelectedListId(ALL_LISTS);
    setTriggerError('');
    setTriggerSuccess('');
    setTriggerDialogOpen(true);
  }

  async function handleTrigger() {
    if (!selectedClientId) return;
    setTriggerError('');
    setTriggerSuccess('');
    try {
      const body =
        selectedListId === ALL_LISTS
          ? { clientId: selectedClientId }
          : { clientId: selectedClientId, listId: selectedListId };
      const result = await triggerSync(body).unwrap();
      setTriggerSuccess(result.message);
      if (result.syncJobId) {
        setPollJobs(true);
      }
      setTimeout(() => {
        setTriggerDialogOpen(false);
        setSelectedClientId('');
        setSelectedListId(ALL_LISTS);
        setTriggerSuccess('');
      }, 1200);
    } catch (err) {
      setTriggerError(getApiErrorMessage(err));
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

      {activeJobs.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-medium">
            {activeJobs.length} sync job{activeJobs.length !== 1 ? 's' : ''}{' '}
            running — progress refreshes automatically.
          </p>
        </div>
      )}

      <Tabs defaultValue="jobs">
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

        {/* ── Sync Jobs ── */}
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
                      No sync jobs yet.
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
                        ? (listNameById.get(job.listId) ?? job.listId.slice(-6))
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
                                isActiveJob(job) ? 'bg-blue-500' : 'bg-muted-foreground/40'
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

        {/* ── Failed Articles ── */}
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
                        onClick={() => retryArticle(fa.articleId)}
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

      {/* Trigger dialog */}
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
                {clientListsData?.data.some(
                  (l) => l.status === 'IMPORTING' || l.status === 'SYNCING',
                ) && (
                  <p className="text-xs text-muted-foreground">
                    Lists currently importing or syncing are excluded from this
                    picker.
                  </p>
                )}
              </div>
            )}

            {triggerError && (
              <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {triggerError}
              </div>
            )}
            {triggerSuccess && (
              <div className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                {triggerSuccess}
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
