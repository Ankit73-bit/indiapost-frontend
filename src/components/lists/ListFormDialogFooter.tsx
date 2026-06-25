import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import type { ListFormValues } from '@/pages/lists/listsPage.types';
import type { List } from '@/types';

interface ListFormDialogFooterProps {
  editing: List | null;
  submitError: string;
  creating: boolean;
  updating: boolean;
  onClose: () => void;
}

export function ListFormDialogFooter({
  editing,
  submitError,
  creating,
  updating,
  onClose,
}: ListFormDialogFooterProps) {
  return (
    <>
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
          {editing ? 'Save Changes' : 'Create List'}
        </Button>
      </DialogFooter>
    </>
  );
}
