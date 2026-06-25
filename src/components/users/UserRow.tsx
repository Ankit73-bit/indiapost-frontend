import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useDeactivateUserMutation,
  useReactivateUserMutation,
  useDeleteUserMutation,
} from '@/store/api/usersApi';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/helpers';
import { UserRowCells } from '@/components/users/UserRowCells';
import { UserRowDialogs } from '@/components/users/UserRowDialogs';
import type { ClientOption } from '@/pages/users/usersPage.types';
import type { PublicUser } from '@/types';

interface UserRowProps {
  user: PublicUser;
  clientOptions: ClientOption[];
  currentUserId: string;
}

export function UserRow({ user, clientOptions, currentUserId }: UserRowProps) {
  const navigate = useNavigate();
  const [assignOpen, setAssignOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deactivate] = useDeactivateUserMutation();
  const [reactivate] = useReactivateUserMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const clientName = clientOptions.find((c) => c._id === user.clientId)?.name;

  async function handleDeleteUser() {
    setDeleteError('');
    try {
      await deleteUser(user.id).unwrap();
      setDeleteOpen(false);
      toast.success('User deleted');
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'Failed to delete user.'));
    }
  }

  return (
    <>
      <tr
        className={cn(
          'border-b border-border/50 last:border-0',
          !user.isActive && 'bg-muted/40 text-muted-foreground opacity-70',
        )}
      >
        <UserRowCells
          user={user}
          clientName={clientName}
          currentUserId={currentUserId}
          onAssign={() => setAssignOpen(true)}
          onEdit={() => navigate(`/profile?userId=${user.id}`)}
          onDeactivate={() => deactivate(user.id)}
          onDelete={() => {
            setDeleteError('');
            setDeleteOpen(true);
          }}
          onReactivate={() => reactivate(user.id)}
        />
      </tr>
      <UserRowDialogs
        user={user}
        clientOptions={clientOptions}
        assignOpen={assignOpen}
        deleteOpen={deleteOpen}
        deleteError={deleteError}
        deleting={deleting}
        onAssignClose={() => setAssignOpen(false)}
        onDeleteClose={() => setDeleteOpen(false)}
        onDeleteConfirm={handleDeleteUser}
      />
    </>
  );
}
