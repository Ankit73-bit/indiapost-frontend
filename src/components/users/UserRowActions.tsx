import {
  UserCheck,
  UserX,
  Link2,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PublicUser } from '@/types';

interface UserRowActionsProps {
  user: PublicUser;
  currentUserId: string;
  onAssign: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  onReactivate: () => void;
}

export function UserRowActions({
  user,
  currentUserId,
  onAssign,
  onEdit,
  onDeactivate,
  onDelete,
  onReactivate,
}: UserRowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      {user.role === 'customer' && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onAssign}
        >
          <Link2 className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={onEdit}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      {user.isActive ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground"
            title="Deactivate user"
            disabled={user.id === currentUserId}
            onClick={onDeactivate}
          >
            <UserX className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            title="Delete user"
            disabled={user.id === currentUserId}
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
          title="Reactivate user"
          onClick={onReactivate}
        >
          <UserCheck className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

export function UserRoleBadge({ role, inactive }: { role: PublicUser['role']; inactive?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium capitalize',
        role === 'admin'
          ? 'bg-purple-100 text-purple-700 border-purple-200'
          : 'bg-blue-100 text-blue-700 border-blue-200',
        inactive && 'opacity-80',
      )}
    >
      {role}
    </span>
  );
}

export function UserActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${
        isActive
          ? 'bg-green-100 text-green-700 border-green-200'
          : 'bg-gray-100 text-gray-400 border-gray-200'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
