import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RegisterUserDialogForm } from '@/components/users/RegisterUserDialogForm';
import { useRegisterUserDialog } from '@/components/users/useRegisterUserDialog';
import type { ClientOption } from '@/pages/users/usersPage.types';

interface RegisterUserDialogProps {
  open: boolean;
  onClose: () => void;
  clientOptions: ClientOption[];
}

export function RegisterUserDialog({
  open,
  onClose,
  clientOptions,
}: RegisterUserDialogProps) {
  const { form, role, loading, error, onSubmit } = useRegisterUserDialog({
    onClose,
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>
        <RegisterUserDialogForm
          form={form}
          role={role}
          clientOptions={clientOptions}
          loading={loading}
          error={error}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
