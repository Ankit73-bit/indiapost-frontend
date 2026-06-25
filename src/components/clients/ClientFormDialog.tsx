import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ClientFormFields } from '@/components/clients/ClientFormFields';
import type { ClientFormValues } from '@/pages/clients/clientsPage.types';
import type { Client } from '@/types';
import type { UseFormReturn } from 'react-hook-form';

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Client | null;
  submitError: string;
  creating: boolean;
  updating: boolean;
  form: UseFormReturn<ClientFormValues>;
  onSubmit: (values: ClientFormValues) => Promise<void>;
}

export function ClientFormDialog({
  open,
  onOpenChange,
  editing,
  submitError,
  creating,
  updating,
  form,
  onSubmit,
}: ClientFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Client' : 'New Client'}</DialogTitle>
        </DialogHeader>
        <ClientFormFields
          editing={editing}
          submitError={submitError}
          creating={creating}
          updating={updating}
          form={form}
          onClose={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
