import { Loader2 } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { RegisterUserCredentialFields } from '@/components/users/RegisterUserCredentialFields';
import { RegisterUserRoleFields } from '@/components/users/RegisterUserRoleFields';
import type { ClientOption, RegisterFormValues } from '@/pages/users/usersPage.types';
import type { UserRole } from '@/types';

interface RegisterUserDialogFormProps {
  form: UseFormReturn<RegisterFormValues>;
  role: UserRole;
  clientOptions: ClientOption[];
  loading: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (values: RegisterFormValues) => Promise<void>;
}

export function RegisterUserDialogForm({
  form,
  role,
  clientOptions,
  loading,
  error,
  onClose,
  onSubmit,
}: RegisterUserDialogFormProps) {
  const { handleSubmit } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <RegisterUserCredentialFields form={form} />
        <RegisterUserRoleFields
          form={form}
          role={role}
          clientOptions={clientOptions}
        />
      </div>

      {error && (
        <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create User
        </Button>
      </DialogFooter>
    </form>
  );
}
