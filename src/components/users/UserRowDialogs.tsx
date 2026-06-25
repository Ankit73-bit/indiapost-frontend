import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { AssignClientDialog } from '@/components/users/AssignClientDialog';
import type { ClientOption } from '@/pages/users/usersPage.types';
import type { PublicUser } from '@/types';

interface UserRowDialogsProps {
  user: PublicUser;
  clientOptions: ClientOption[];
  assignOpen: boolean;
  deleteOpen: boolean;
  deleteError: string;
  deleting: boolean;
  onAssignClose: () => void;
  onDeleteClose: () => void;
  onDeleteConfirm: () => void;
}

export function UserRowDialogs({
  user,
  clientOptions,
  assignOpen,
  deleteOpen,
  deleteError,
  deleting,
  onAssignClose,
  onDeleteClose,
  onDeleteConfirm,
}: UserRowDialogsProps) {
  return (
    <>
      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={onDeleteClose}
        onConfirm={onDeleteConfirm}
        title="Delete user"
        description="This deactivates the user account. They will no longer be able to sign in."
        entityName={user.name ?? user.email}
        isLoading={deleting}
        error={deleteError}
      />
      {assignOpen && (
        <AssignClientDialog
          user={user}
          onClose={onAssignClose}
          clientOptions={clientOptions}
        />
      )}
    </>
  );
}
