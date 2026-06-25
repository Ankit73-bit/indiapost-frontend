import { Loader2 } from 'lucide-react';
import { TableShell } from '@/components/shared/TableShell';
import { Pagination } from '@/components/shared/Pagination';
import { UserRow } from '@/components/users/UserRow';
import {
  USERS_TABLE_COLUMNS,
  UsersTableHeader,
} from '@/components/users/UsersTableHeader';
import type { ClientOption } from '@/pages/users/usersPage.types';
import type { PaginationMeta, PublicUser } from '@/types';

interface UsersTableProps {
  isLoading: boolean;
  data: { data: PublicUser[]; meta?: PaginationMeta } | undefined;
  clientOptions: ClientOption[];
  currentUserId: string;
  onPageChange: (page: number) => void;
}

export function UsersTable({
  isLoading,
  data,
  clientOptions,
  currentUserId,
  onPageChange,
}: UsersTableProps) {
  return (
    <TableShell
      footer={
        data?.meta && data.meta.totalPages > 1 ? (
          <div className="px-4 pb-4">
            <Pagination meta={data.meta} onPageChange={onPageChange} />
          </div>
        ) : undefined
      }
    >
      <table className="w-full text-sm">
        <UsersTableHeader columns={USERS_TABLE_COLUMNS} />
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center">
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
              </td>
            </tr>
          )}
          {!isLoading && data?.data.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                No users found.
              </td>
            </tr>
          )}
          {data?.data.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              clientOptions={clientOptions}
              currentUserId={currentUserId}
            />
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}
