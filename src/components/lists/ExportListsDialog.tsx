import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { ExportListsDialogForm } from '@/components/lists/ExportListsDialogForm';
import type { ExportListsDialogProps } from '@/components/lists/exportListsDialog.types';

export type { CurrentListFilters } from '@/components/lists/exportListsDialog.types';

export function ExportListsDialog({
  open,
  onClose,
  ...formProps
}: ExportListsDialogProps) {
  const formKey = [
    formProps.currentFilters.clientId,
    formProps.currentFilters.year,
    formProps.currentFilters.month,
    formProps.currentFilters.noticeType,
    formProps.defaultClientId,
  ].join('|');

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        {open ? (
          <ExportListsDialogForm key={formKey} onClose={onClose} {...formProps} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
