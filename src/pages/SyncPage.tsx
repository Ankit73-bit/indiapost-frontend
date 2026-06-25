import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SyncPageToolbar } from '@/components/sync/SyncPageToolbar';
import { SyncJobsTab } from '@/components/sync/SyncJobsTab';
import { SyncFailedArticlesTab } from '@/components/sync/SyncFailedArticlesTab';
import { SyncExpiredArticlesTab } from '@/components/sync/SyncExpiredArticlesTab';
import { SyncTriggerDialog } from '@/components/sync/SyncTriggerDialog';
import { useSyncPage } from '@/hooks/useSyncPage';

export function SyncPage() {
  const sync = useSyncPage();

  return (
    <div className="space-y-5">
      <SyncPageToolbar
        clientsData={sync.clientsData}
        filterClientId={sync.filterClientId}
        filterListId={sync.filterListId}
        filterStatus={sync.filterStatus}
        filterJobType={sync.filterJobType}
        filterFromDate={sync.filterFromDate}
        filterToDate={sync.filterToDate}
        jobFilterActiveCount={sync.jobFilterActiveCount}
        hasJobFilters={sync.hasJobFilters}
        onClearJobFilters={sync.clearJobFilters}
        onPatchParams={sync.patchParams}
        onOpenTriggerDialog={sync.openTriggerDialog}
      />

      {sync.activeJobs.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-medium">
            {sync.activeJobs.length} sync job{sync.activeJobs.length !== 1 ? 's' : ''}{' '}
            running — progress refreshes automatically.
          </p>
        </div>
      )}

      <Tabs
        value={sync.activeTab}
        onValueChange={(tab) =>
          sync.patchParams({ tab: tab === 'jobs' ? null : tab })
        }
      >
        <TabsList className="mb-4 h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="jobs">Sync Jobs</TabsTrigger>
          <TabsTrigger value="failed">
            Failed Articles
            {sync.failedData?.meta && sync.failedData.meta.total > 0 && (
              <span className="ml-1.5 rounded-full bg-destructive/15 px-1.5 py-0.5 text-xs text-destructive">
                {sync.failedData.meta.total}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="expired">
            Tracking Expired
            {sync.expiredData?.meta && sync.expiredData.meta.total > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-xs text-amber-800 dark:text-amber-200">
                {sync.expiredData.meta.total}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <SyncJobsTab
            jobsData={sync.jobsData}
            jobsLoading={sync.jobsLoading}
            clientsData={sync.clientsData}
            listNameById={sync.listNameById}
            onPageChange={sync.setJobsPage}
          />
        </TabsContent>

        <TabsContent value="failed">
          <SyncFailedArticlesTab
            failedData={sync.failedData}
            failedLoading={sync.failedLoading}
            failedRows={sync.failedRows}
            failedSearchInput={sync.failedSearchInput}
            onFailedSearchInputChange={sync.setFailedSearchInput}
            onFailedPageReset={() => sync.setFailedPage(1)}
            failedSelectionCount={sync.failedSelectionCount}
            bulkRetrying={sync.bulkRetrying}
            onBulkRetry={() => void sync.handleBulkRetry()}
            failedHeaderChecked={sync.failedHeaderChecked}
            onToggleAllFailed={() => void sync.handleToggleAllFailed()}
            selectingAllFailed={sync.selectingAllFailed}
            allFailedSelected={sync.allFailedSelected}
            selectedFailedIds={sync.selectedFailedIds}
            onToggleFailedSelection={sync.toggleFailedSelection}
            onRetry={(articleId) => void sync.handleRetry(articleId)}
            failedSearch={sync.failedSearch}
            onPageChange={sync.setFailedPage}
          />
        </TabsContent>

        <TabsContent value="expired">
          <SyncExpiredArticlesTab
            expiredData={sync.expiredData}
            expiredLoading={sync.expiredLoading}
            onPageChange={sync.setExpiredPage}
          />
        </TabsContent>
      </Tabs>

      <SyncTriggerDialog
        open={sync.triggerDialogOpen}
        onOpenChange={sync.setTriggerDialogOpen}
        clientsData={sync.clientsData}
        selectedClientId={sync.selectedClientId}
        selectedListId={sync.selectedListId}
        onClientChange={sync.handleClientChange}
        onListChange={sync.handleListChange}
        scopeHint={sync.scopeHint}
        triggerError={sync.triggerError}
        onTrigger={() => void sync.handleTrigger()}
        triggering={sync.triggering}
      />
    </div>
  );
}
