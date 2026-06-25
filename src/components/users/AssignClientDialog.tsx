import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAssignClientMutation } from '@/store/api/usersApi';
import type { ClientOption } from '@/pages/users/usersPage.types';
import type { PublicUser } from '@/types';

interface AssignClientDialogProps {
  user: PublicUser;
  onClose: () => void;
  clientOptions: ClientOption[];
}

export function AssignClientDialog({
  user,
  onClose,
  clientOptions,
}: AssignClientDialogProps) {
  const [assignClient, { isLoading }] = useAssignClientMutation();
  const [selected, setSelected] = useState<string>(user.clientId ?? '_none');

  async function handleSave() {
    await assignClient({
      userId: user.id,
      body: { clientId: selected === '_none' ? null : selected },
    }).unwrap();
    onClose();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign Client — {user.email}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">No client (unassign)</SelectItem>
              {clientOptions.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
