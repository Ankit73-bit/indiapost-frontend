import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import type { List } from '@/types';

interface ListsPageDeleteConfirmDialogProps {
  deleteTarget: List | null;
  onDeleteClose: () => void;
  onDeleteConfirm: () => void;
  deleting: boolean;
  deleteError: string;
}

export function ListsPageDeleteConfirmDialog({
  deleteTarget,
  onDeleteClose,
  onDeleteConfirm,
  deleting,
  deleteError,
}: ListsPageDeleteConfirmDialogProps) {
  return (
    <ConfirmDeleteDialog
      open={Boolean(deleteTarget)}
      onClose={onDeleteClose}
      onConfirm={onDeleteConfirm}
      title="Delete list"
      description="This will remove the list."
      entityName={deleteTarget?.name ?? ''}
      isLoading={deleting}
      error={deleteError}
    />
  );
}
