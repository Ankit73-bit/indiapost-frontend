import { useState } from 'react';
import { RefreshCw, RotateCcw, Loader2, ChevronDown } from 'lucide-react';
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
import {
  useTriggerSyncMutation,
  useListSyncJobsQuery,
  useListFailedArticlesQuery,
  useRetryFailedArticleMutation,
} from '@/store/api/syncApi';
import { formatDateTime, formatRelative } from '@/lib/helpers';

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SyncPage() {
  const [jobsPage, setJobsPage] = useState(1);
  const [failedPage, setFailedPage] = useState(1);
  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');

  const { data: clientsData } = useListClientsQuery({ limit: 100 });
  const { data: jobsData, isLoading: jobsLoading } = useListSyncJobsQuery({
    page: jobsPage,
    limit: 20,
    listOnly: false,
  });
  const { data: failedData, isLoading: failedLoading } =
    useListFailedArticlesQuery({
      page: failedPage,
      limit: 20,
    });

  const [triggerSync, { isLoading: triggering }] = useTriggerSyncMutation();
  const [retryArticle] = useRetryFailedArticleMutation();

  async function handleTrigger() {
    if (!selectedClientId) return;
    await triggerSync({ clientId: selectedClientId }).unwrap();
    setTriggerDialogOpen(false);
    setSelectedClientId('');
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sync"
        description="Monitor and trigger India Post tracking sync jobs."
        actions={
          <Button size="sm" onClick={() => setTriggerDialogOpen(true)}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Trigger Sync
          </Button>
        }
      />

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
                    Triggered By
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                    Articles
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
                    <td className="px-4 py-3 capitalize text-muted-foreground">
                      {job.triggeredBy}
                    </td>
                    <td className="px-4 py-3">
                      <SyncJobStatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {job.processedCount}/{job.totalArticles}
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
                      {fa.attempts}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatRelative(fa.lastAttemptAt)}
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
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Trigger Sync</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              This will enqueue a sync job for all non-terminal articles of the
              selected client.
            </p>
            <Select
              value={selectedClientId}
              onValueChange={setSelectedClientId}
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
