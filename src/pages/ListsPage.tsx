import { ListsPageAlerts } from '@/components/lists/ListsPageAlerts';
import { ListsPageFilters } from '@/components/lists/ListsPageFilters';
import { ListsPageTable } from '@/components/lists/ListsPageTable';
import { ListFormDialog } from '@/components/lists/ListFormDialog';
import { ListsPageConfirmDialogs } from '@/components/lists/ListsPageConfirmDialogs';
import { useListsPage } from '@/hooks/useListsPage';
import type { List } from '@/types';

export function ListsPage() {
  const lists = useListsPage();

  return (
    <div className="space-y-5">
      <ListsPageAlerts
        customerInactive={lists.customerInactive}
        importingLists={lists.importingLists}
        syncingLists={lists.syncingLists}
        uploadError={lists.uploadError}
      />

      <ListsPageFilters
        searchInput={lists.searchInput}
        onSearchInputChange={lists.setSearchInput}
        isFetching={lists.isFetching}
        isLoading={lists.isLoading}
        onClearSearch={lists.clearSearch}
        filterActiveCount={lists.filterActiveCount}
        hasFilters={lists.hasFilters}
        onClearFilters={lists.clearFilters}
        isAdmin={lists.isAdmin}
        activeClients={lists.activeClients}
        clientIdFilter={lists.clientIdFilter}
        onClientFilterChange={lists.setClientFilter}
        showAllYears={lists.showAllYears}
        filterYear={lists.filterYear}
        yearOptions={lists.yearOptions}
        onPatchFilters={lists.patchFilters}
        filterMonth={lists.filterMonth}
        hasYearParam={lists.searchParams.has('year')}
        noticeTypeOptions={lists.noticeTypeOptions}
        filterNoticeType={lists.filterNoticeType}
        sortOrder={lists.sortOrder}
        meta={lists.data?.meta}
        customerInactive={lists.customerInactive}
        onExportClick={() => lists.setExportDialogOpen(true)}
        onCreateClick={lists.openCreate}
        activeFilterChips={lists.activeFilterChips}
      />

      <ListsPageTable
        data={lists.data?.data}
        meta={lists.data?.meta}
        isLoading={lists.isLoading}
        hasFilters={lists.hasFilters}
        liveListById={lists.liveListById}
        activeClients={lists.activeClients}
        allClients={lists.clientsData?.data}
        isAdmin={lists.isAdmin}
        uploadingListId={lists.uploadingListId}
        exportingListId={lists.exportingListId}
        triggeringSync={lists.triggeringSync}
        onPageChange={lists.setPage}
        onRowClick={(list: List) =>
          lists.navigate(
            `/articles?clientId=${list.clientId}&listId=${list._id}`,
          )
        }
        onUpload={(listId, file) => void lists.handleFileUpload(listId, file)}
        onExport={(listId, listName) => void lists.handleExport(listId, listName)}
        onOpenPdfs={(list) =>
          lists.navigate(
            `/articles?clientId=${list.clientId}&listId=${list._id}&pdfs=1`,
          )
        }
        onTriggerSync={lists.setSyncTarget}
        onEdit={lists.openEdit}
        onDelete={lists.handleDeleteClick}
        onCancelImport={lists.setCancelImportTarget}
        onCancelSync={lists.setCancelSyncTarget}
      />

      <ListFormDialog
        open={lists.dialogOpen}
        onOpenChange={lists.handleDialogOpenChange}
        editing={lists.editing}
        isAdmin={lists.isAdmin}
        activeClients={lists.activeClients}
        customerClient={lists.customerClient}
        authClientId={lists.authUser?.clientId ?? undefined}
        watchedClientId={lists.watchedClientId}
        watchedNoticeType={lists.watchedNoticeType}
        formClientId={lists.formClientId}
        formNoticeTypesData={lists.formNoticeTypesData}
        generatedSlugPreview={lists.generatedSlugPreview}
        submitError={lists.submitError}
        creating={lists.creating}
        updating={lists.updating}
        register={lists.register}
        handleSubmit={lists.handleSubmit}
        setValue={lists.setValue}
        errors={lists.errors}
        onSubmit={(values) => void lists.onSubmit(values)}
      />

      <ListsPageConfirmDialogs
        deleteTarget={lists.deleteTarget}
        onDeleteClose={() => lists.setDeleteTarget(null)}
        onDeleteConfirm={() => void lists.handleDeleteList()}
        deleting={lists.deleting}
        deleteError={lists.deleteError}
        cancelImportTarget={lists.cancelImportTarget}
        onCancelImportClose={lists.handleCancelImportClose}
        onCancelImportConfirm={() => void lists.handleCancelImport()}
        cancellingImport={lists.cancellingImport}
        cancelSyncTarget={lists.cancelSyncTarget}
        onCancelSyncClose={lists.handleCancelSyncClose}
        onCancelSyncConfirm={() => void lists.handleCancelSync()}
        cancellingSync={lists.cancellingSync}
        cancelError={lists.cancelError}
        syncTarget={lists.syncTarget}
        onSyncClose={() => lists.setSyncTarget(null)}
        onSyncConfirm={() => void lists.handleTriggerSync()}
        triggeringSync={lists.triggeringSync}
        exportDialogOpen={lists.exportDialogOpen}
        onExportClose={() => lists.setExportDialogOpen(false)}
        isAdmin={lists.isAdmin}
        activeClients={lists.activeClients}
        defaultClientId={
          lists.isAdmin
            ? lists.clientIdFilter
            : (lists.authUser?.clientId ?? undefined)
        }
        noticeTypeOptions={lists.noticeTypeOptions}
        yearOptions={lists.yearOptions}
        currentFilters={{
          clientId:
            lists.clientIdFilter ??
            (lists.isAdmin ? undefined : (lists.authUser?.clientId ?? undefined)),
          year: lists.showAllYears ? undefined : Number(lists.filterYear),
          month: lists.filterMonth ? Number(lists.filterMonth) : undefined,
          noticeType: lists.filterNoticeType || undefined,
        }}
      />
    </div>
  );
}
