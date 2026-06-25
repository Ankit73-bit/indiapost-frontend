import { ExportListsDialog } from '@/components/lists/ExportListsDialog';
import { ListsPageListConfirmDialogs } from '@/components/lists/ListsPageListConfirmDialogs';
import { toast } from '@/lib/toast';
import type { ListsPageConfirmDialogsProps } from '@/components/lists/listsPageConfirmDialogs.types';

export function ListsPageConfirmDialogs({
  deleteTarget,
  onDeleteClose,
  onDeleteConfirm,
  deleting,
  deleteError,
  cancelImportTarget,
  onCancelImportClose,
  onCancelImportConfirm,
  cancellingImport,
  cancelSyncTarget,
  onCancelSyncClose,
  onCancelSyncConfirm,
  cancellingSync,
  cancelError,
  syncTarget,
  onSyncClose,
  onSyncConfirm,
  triggeringSync,
  exportDialogOpen,
  onExportClose,
  isAdmin,
  activeClients,
  defaultClientId,
  noticeTypeOptions,
  yearOptions,
  currentFilters,
}: ListsPageConfirmDialogsProps) {
  return (
    <>
      <ListsPageListConfirmDialogs
        deleteTarget={deleteTarget}
        onDeleteClose={onDeleteClose}
        onDeleteConfirm={onDeleteConfirm}
        deleting={deleting}
        deleteError={deleteError}
        cancelImportTarget={cancelImportTarget}
        onCancelImportClose={onCancelImportClose}
        onCancelImportConfirm={onCancelImportConfirm}
        cancellingImport={cancellingImport}
        cancelSyncTarget={cancelSyncTarget}
        onCancelSyncClose={onCancelSyncClose}
        onCancelSyncConfirm={onCancelSyncConfirm}
        cancellingSync={cancellingSync}
        cancelError={cancelError}
        syncTarget={syncTarget}
        onSyncClose={onSyncClose}
        onSyncConfirm={onSyncConfirm}
        triggeringSync={triggeringSync}
      />

      <ExportListsDialog
        open={exportDialogOpen}
        onClose={onExportClose}
        isAdmin={isAdmin}
        clients={activeClients}
        defaultClientId={defaultClientId}
        noticeTypeOptions={noticeTypeOptions}
        yearOptions={yearOptions}
        currentFilters={currentFilters}
        onSuccess={() => toast.success('Export downloaded')}
      />
    </>
  );
}
