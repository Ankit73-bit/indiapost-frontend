import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ListFormValues } from '@/pages/lists/listsPage.types';
import type { Client, List } from '@/types';
import type { FieldErrors, UseFormSetValue } from 'react-hook-form';

interface ListFormDialogClientSectionProps {
  editing: List | null;
  isAdmin: boolean;
  activeClients: Client[];
  customerClient: Client | undefined;
  authClientId: string | undefined;
  watchedClientId: string;
  setValue: UseFormSetValue<ListFormValues>;
  errors: FieldErrors<ListFormValues>;
}

export function ListFormDialogClientSection({
  editing,
  isAdmin,
  activeClients,
  customerClient,
  authClientId,
  watchedClientId,
  setValue,
  errors,
}: ListFormDialogClientSectionProps) {
  if (editing) return null;

  if (isAdmin) {
    return (
      <div className="space-y-1.5">
        <Label>
          Client <span className="text-destructive">*</span>
        </Label>
        <Select
          value={
            activeClients.some((c) => c._id === watchedClientId)
              ? watchedClientId
              : undefined
          }
          onValueChange={(v) => setValue('clientId', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select client" />
          </SelectTrigger>
          <SelectContent>
            {activeClients.length === 0 && (
              <SelectItem value="__none__" disabled>
                No active clients
              </SelectItem>
            )}
            {activeClients.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.clientId && (
          <p className="text-xs text-destructive">{errors.clientId.message}</p>
        )}
      </div>
    );
  }

  if (!authClientId) return null;

  return (
    <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
      <span className="text-muted-foreground">Client: </span>
      <span className="font-medium">
        {customerClient?.name ?? 'Your organization'}
      </span>
    </div>
  );
}
