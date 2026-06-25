import { useState } from 'react';
import { useSyncPageUrlFiltersPagination } from '@/hooks/sync/useSyncPageUrlFiltersPagination';
import { useSyncPageJobs } from '@/hooks/sync/useSyncPageJobs';
import { useSyncPageFailedArticles } from '@/hooks/sync/useSyncPageFailedArticles';
import { useSyncPageExpired } from '@/hooks/sync/useSyncPageExpired';
import { useSyncPageTriggerDialog } from '@/hooks/sync/useSyncPageTriggerDialog';

export function useSyncPage() {
  const [syncPollForced, setSyncPollForced] = useState(false);

  const urlFilters = useSyncPageUrlFiltersPagination();

  const jobs = useSyncPageJobs({
    jobsPage: urlFilters.jobsPage,
    filterClientId: urlFilters.filterClientId,
    filterListId: urlFilters.filterListId,
    filterStatus: urlFilters.filterStatus,
    filterJobType: urlFilters.filterJobType,
    filterFromDate: urlFilters.filterFromDate,
    filterToDate: urlFilters.filterToDate,
    syncPollForced,
  });

  const failedArticles = useSyncPageFailedArticles({
    activeTab: urlFilters.activeTab,
    filterClientId: urlFilters.filterClientId,
    filterListId: urlFilters.filterListId,
    failedSearch: urlFilters.failedSearch,
    failedFilterKey: urlFilters.failedFilterKey,
    failedPage: urlFilters.failedPage,
    shouldPollJobs: jobs.shouldPollJobs,
    setSyncPollForced,
  });

  const expired = useSyncPageExpired({
    activeTab: urlFilters.activeTab,
    filterClientId: urlFilters.filterClientId,
    filterListId: urlFilters.filterListId,
    expiredPage: urlFilters.expiredPage,
  });

  const triggerDialog = useSyncPageTriggerDialog({
    filterClientId: urlFilters.filterClientId,
    filterListId: urlFilters.filterListId,
    setSyncPollForced,
  });

  return {
    activeTab: urlFilters.activeTab,
    patchParams: urlFilters.patchParams,
    filterClientId: urlFilters.filterClientId,
    filterListId: urlFilters.filterListId,
    filterStatus: urlFilters.filterStatus,
    filterJobType: urlFilters.filterJobType,
    filterFromDate: urlFilters.filterFromDate,
    filterToDate: urlFilters.filterToDate,
    clientsData: urlFilters.clientsData,
    jobFilterActiveCount: urlFilters.jobFilterActiveCount,
    hasJobFilters: urlFilters.hasJobFilters,
    clearJobFilters: urlFilters.clearJobFilters,
    openTriggerDialog: triggerDialog.openTriggerDialog,
    activeJobs: jobs.activeJobs,
    jobsData: jobs.jobsData,
    jobsLoading: jobs.jobsLoading,
    setJobsPage: urlFilters.setJobsPage,
    listNameById: jobs.listNameById,
    failedData: failedArticles.failedData,
    expiredData: expired.expiredData,
    failedSearchInput: urlFilters.failedSearchInput,
    setFailedSearchInput: urlFilters.setFailedSearchInput,
    setFailedPage: urlFilters.setFailedPage,
    failedSelectionCount: failedArticles.failedSelectionCount,
    bulkRetrying: failedArticles.bulkRetrying,
    handleBulkRetry: failedArticles.handleBulkRetry,
    failedLoading: failedArticles.failedLoading,
    failedRows: failedArticles.failedRows,
    failedHeaderChecked: failedArticles.failedHeaderChecked,
    handleToggleAllFailed: failedArticles.handleToggleAllFailed,
    selectingAllFailed: failedArticles.selectingAllFailed,
    allFailedSelected: failedArticles.allFailedSelected,
    selectedFailedIds: failedArticles.selectedFailedIds,
    toggleFailedSelection: failedArticles.toggleFailedSelection,
    handleRetry: failedArticles.handleRetry,
    failedSearch: urlFilters.failedSearch,
    expiredLoading: expired.expiredLoading,
    setExpiredPage: urlFilters.setExpiredPage,
    triggerDialogOpen: triggerDialog.triggerDialogOpen,
    setTriggerDialogOpen: triggerDialog.setTriggerDialogOpen,
    selectedClientId: triggerDialog.selectedClientId,
    selectedListId: triggerDialog.selectedListId,
    triggerError: triggerDialog.triggerError,
    scopeHint: triggerDialog.scopeHint,
    handleClientChange: triggerDialog.handleClientChange,
    handleListChange: triggerDialog.handleListChange,
    handleTrigger: triggerDialog.handleTrigger,
    triggering: triggerDialog.triggering,
  };
}
