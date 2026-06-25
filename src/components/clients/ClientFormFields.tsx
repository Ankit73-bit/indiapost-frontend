import { Loader2 } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { toSlug } from '@/lib/helpers';
import type { ClientFormValues } from '@/pages/clients/clientsPage.types';
import type { Client } from '@/types';

interface ClientFormFieldsProps {
  editing: Client | null;
  submitError: string;
  creating: boolean;
  updating: boolean;
  form: UseFormReturn<ClientFormValues>;
  onClose: () => void;
  onSubmit: (values: ClientFormValues) => Promise<void>;
}

export function ClientFormFields({
  editing,
  submitError,
  creating,
  updating,
  form,
  onClose,
  onSubmit,
}: ClientFormFieldsProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input
          placeholder="Acme Bank"
          {...register('name', {
            onChange: (e) => {
              if (!editing) setValue('slug', toSlug(e.target.value));
            },
          })}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label>Slug</Label>
        <Input placeholder="acme-bank" {...register('slug')} />
        {errors.slug && (
          <p className="text-xs text-destructive">{errors.slug.message}</p>
        )}
      </div>
      {submitError && (
        <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={creating || updating}>
          {(creating || updating) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {editing ? 'Save Changes' : 'Create Client'}
        </Button>
      </DialogFooter>
    </form>
  );
}
