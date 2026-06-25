import { formatDate } from '@/lib/helpers';
import {
  UserActiveBadge,
  UserRoleBadge,
  UserRowActions,
} from '@/components/users/UserRowActions';
import type { PublicUser } from '@/types';

interface UserRowCellsProps {
  user: PublicUser;
  clientName: string | undefined;
  currentUserId: string;
  onAssign: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  onReactivate: () => void;
}

export function UserRowCells({
  user,
  clientName,
  currentUserId,
  onAssign,
  onEdit,
  onDeactivate,
  onDelete,
  onReactivate,
}: UserRowCellsProps) {
  return (
    <>
      <td className="px-4 py-3">
        <p className="font-medium">{user.name ?? '—'}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </td>
      <td className="px-4 py-3">
        <UserRoleBadge role={user.role} inactive={!user.isActive} />
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {clientName ?? (user.clientId ? user.clientId.slice(-8) : '—')}
      </td>
      <td className="px-4 py-3">
        <UserActiveBadge isActive={user.isActive} />
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {formatDate(user.id ? undefined : undefined)}
      </td>
      <td className="px-4 py-3 text-right">
        <UserRowActions
          user={user}
          currentUserId={currentUserId}
          onAssign={onAssign}
          onEdit={onEdit}
          onDeactivate={onDeactivate}
          onDelete={onDelete}
          onReactivate={onReactivate}
        />
      </td>
    </>
  );
}
