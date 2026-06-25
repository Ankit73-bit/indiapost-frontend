import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ListFormDialogFields } from '@/components/lists/ListFormDialogFields';
import { ListFormDialogFooter } from '@/components/lists/ListFormDialogFooter';
import type { ListFormDialogProps } from '@/components/lists/listFormDialog.types';

export function ListFormDialog({
  open,
  onOpenChange,
  editing,
  isAdmin,
  activeClients,
  customerClient,
  authClientId,
  watchedClientId,
  watchedNoticeType,
  formClientId,
  formNoticeTypesData,
  generatedSlugPreview,
  submitError,
  creating,
  updating,
  register,
  handleSubmit,
  setValue,
  errors,
  onSubmit,
}: ListFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit List' : 'New List'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ListFormDialogFields
            editing={editing}
            isAdmin={isAdmin}
            activeClients={activeClients}
            customerClient={customerClient}
            authClientId={authClientId}
            watchedClientId={watchedClientId}
            watchedNoticeType={watchedNoticeType}
            formClientId={formClientId}
            formNoticeTypesData={formNoticeTypesData}
            generatedSlugPreview={generatedSlugPreview}
            register={register}
            setValue={setValue}
            errors={errors}
          />
          <ListFormDialogFooter
            editing={editing}
            submitError={submitError}
            creating={creating}
            updating={updating}
            onClose={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
