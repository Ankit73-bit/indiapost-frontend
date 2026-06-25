import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { useListsPageFilters } from '@/hooks/lists/useListsPageFilters';
import { useListsPageQueries } from '@/hooks/lists/useListsPageQueries';
import { useListsPageConfirmDialogs } from '@/hooks/lists/useListsPageConfirmDialogs';
import { useListsPageFormDialog } from '@/hooks/lists/useListsPageFormDialog';
import { useListsPageActions } from '@/hooks/lists/useListsPageActions';

export function useListsPage() {
  const navigate = useNavigate();
  const authUser = useAppSelector((s) => s.auth.user);
  const isAdmin = authUser?.role === 'admin';

  const filters = useListsPageFilters({ isAdmin, authUser });

  const queries = useListsPageQueries({
    clientIdFilter: filters.clientIdFilter,
    search: filters.search,
    showAllYears: filters.showAllYears,
    filterYear: filters.filterYear,
    filterMonth: filters.filterMonth,
    filterNoticeType: filters.filterNoticeType,
    sortOrder: filters.sortOrder,
    page: filters.page,
  });

  const confirmDialogs = useListsPageConfirmDialogs();

  const formDialog = useListsPageFormDialog({
    isAdmin,
    authUser,
    clientIdFilter: filters.clientIdFilter,
    activeClients: filters.activeClients,
    clientsData: filters.clientsData,
  });

  const actions = useListsPageActions({
    setOpsPollForced: queries.setOpsPollForced,
    deleteTarget: confirmDialogs.deleteTarget,
    setDeleteTarget: confirmDialogs.setDeleteTarget,
    setDeleteError: confirmDialogs.setDeleteError,
    cancelImportTarget: confirmDialogs.cancelImportTarget,
    setCancelImportTarget: confirmDialogs.setCancelImportTarget,
    cancelSyncTarget: confirmDialogs.cancelSyncTarget,
    setCancelSyncTarget: confirmDialogs.setCancelSyncTarget,
    syncTarget: confirmDialogs.syncTarget,
    setSyncTarget: confirmDialogs.setSyncTarget,
    setCancelError: confirmDialogs.setCancelError,
  });

  return {
    navigate,
    isAdmin,
    authUser,
    searchParams: filters.searchParams,
    clientIdFilter: filters.clientIdFilter,
    yearParam: filters.yearParam,
    showAllYears: filters.showAllYears,
    filterYear: filters.filterYear,
    filterMonth: filters.filterMonth,
    filterNoticeType: filters.filterNoticeType,
    sortOrder: filters.sortOrder,
    page: filters.page,
    setPage: filters.setPage,
    searchInput: filters.searchInput,
    setSearchInput: filters.setSearchInput,
    search: filters.search,
    dialogOpen: formDialog.dialogOpen,
    editing: formDialog.editing,
    submitError: formDialog.submitError,
    uploadingListId: actions.uploadingListId,
    deleteTarget: confirmDialogs.deleteTarget,
    setDeleteTarget: confirmDialogs.setDeleteTarget,
    deleteError: confirmDialogs.deleteError,
    cancelImportTarget: confirmDialogs.cancelImportTarget,
    cancelSyncTarget: confirmDialogs.cancelSyncTarget,
    syncTarget: confirmDialogs.syncTarget,
    setSyncTarget: confirmDialogs.setSyncTarget,
    cancelError: confirmDialogs.cancelError,
    uploadError: actions.uploadError,
    exportingListId: actions.exportingListId,
    exportDialogOpen: confirmDialogs.exportDialogOpen,
    setExportDialogOpen: confirmDialogs.setExportDialogOpen,
    clientsData: filters.clientsData,
    activeClients: filters.activeClients,
    customerClient: filters.customerClient,
    customerInactive: filters.customerInactive,
    noticeTypeOptions: filters.noticeTypeOptions,
    importingLists: queries.importingLists,
    syncingLists: queries.syncingLists,
    data: queries.data,
    isLoading: queries.isLoading,
    isFetching: queries.isFetching,
    liveListById: queries.liveListById,
    yearOptions: filters.yearOptions,
    hasFilters: filters.hasFilters,
    filterActiveCount: filters.filterActiveCount,
    activeFilterChips: filters.activeFilterChips,
    setClientFilter: filters.setClientFilter,
    patchFilters: filters.patchFilters,
    clearSearch: filters.clearSearch,
    clearFilters: filters.clearFilters,
    creating: formDialog.creating,
    updating: formDialog.updating,
    deleting: actions.deleting,
    cancellingImport: actions.cancellingImport,
    cancellingSync: actions.cancellingSync,
    triggeringSync: actions.triggeringSync,
    register: formDialog.register,
    handleSubmit: formDialog.handleSubmit,
    setValue: formDialog.setValue,
    errors: formDialog.errors,
    watchedClientId: formDialog.watchedClientId,
    watchedNoticeType: formDialog.watchedNoticeType,
    formClientId: formDialog.formClientId,
    formNoticeTypesData: formDialog.formNoticeTypesData,
    generatedSlugPreview: formDialog.generatedSlugPreview,
    openCreate: formDialog.openCreate,
    openEdit: formDialog.openEdit,
    onSubmit: formDialog.onSubmit,
    handleFileUpload: actions.handleFileUpload,
    handleDeleteList: actions.handleDeleteList,
    handleCancelImport: actions.handleCancelImport,
    handleCancelSync: actions.handleCancelSync,
    handleExport: actions.handleExport,
    handleTriggerSync: actions.handleTriggerSync,
    handleDialogOpenChange: formDialog.handleDialogOpenChange,
    handleDeleteClick: confirmDialogs.handleDeleteClick,
    handleCancelImportClose: confirmDialogs.handleCancelImportClose,
    handleCancelSyncClose: confirmDialogs.handleCancelSyncClose,
    setCancelImportTarget: confirmDialogs.setCancelImportTarget,
    setCancelSyncTarget: confirmDialogs.setCancelSyncTarget,
  };
}

export type UseListsPageReturn = ReturnType<typeof useListsPage>;
