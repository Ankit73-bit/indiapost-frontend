import { ConfirmActionDialog } from '@/components/shared/ConfirmActionDialog';
import { ListsPageDeleteConfirmDialog } from '@/components/lists/ListsPageDeleteConfirmDialog';
import type { List } from '@/types';

interface ListsPageListConfirmDialogsProps {
  deleteTarget: List | null;
  onDeleteClose: () => void;
  onDeleteConfirm: () => void;
  deleting: boolean;
  deleteError: string;
  cancelImportTarget: List | null;
  onCancelImportClose: () => void;
  onCancelImportConfirm: () => void;
  cancellingImport: boolean;
  cancelSyncTarget: List | null;
  onCancelSyncClose: () => void;
  onCancelSyncConfirm: () => void;
  cancellingSync: boolean;
  cancelError: string;
  syncTarget: List | null;
  onSyncClose: () => void;
  onSyncConfirm: () => void;
  triggeringSync: boolean;
}

export function ListsPageListConfirmDialogs(props: ListsPageListConfirmDialogsProps) {
  const {
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
  } = props;

  return (
    <>
      <ListsPageDeleteConfirmDialog
        deleteTarget={deleteTarget}
        onDeleteClose={onDeleteClose}
        onDeleteConfirm={onDeleteConfirm}
        deleting={deleting}
        deleteError={deleteError}
      />

      <ConfirmActionDialog
        open={Boolean(cancelImportTarget)}
        onClose={onCancelImportClose}
        onConfirm={onCancelImportConfirm}
        title="Cancel import"
        description="Stops tracking this import in the UI. The server job may still finish in the background. You can upload the file again afterward."
        entityName={cancelImportTarget?.name ?? ''}
        confirmLabel="Cancel import"
        isLoading={cancellingImport}
        error={cancelError}
      />

      <ConfirmActionDialog
        open={Boolean(cancelSyncTarget)}
        onClose={onCancelSyncClose}
        onConfirm={onCancelSyncConfirm}
        title="Reset sync status"
        description="Clears the stuck syncing state for this list. Trigger Sync again when ready."
        entityName={cancelSyncTarget?.name ?? ''}
        confirmLabel="Reset sync"
        isLoading={cancellingSync}
        error={cancelError}
      />

      <ConfirmActionDialog
        open={Boolean(syncTarget)}
        onClose={onSyncClose}
        onConfirm={onSyncConfirm}
        title="Sync"
        description="Starts India Post tracking sync for all non-terminal articles in this list."
        entityName={syncTarget?.name ?? ''}
        confirmLabel="Start sync"
        isLoading={triggeringSync}
      />
    </>
  );
}
