import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TableShell } from '@/components/shared/TableShell';
import { Pagination } from '@/components/shared/Pagination';
import { ClientTableRow } from '@/components/clients/ClientTableRow';
import { ClientsTableHeader } from '@/components/clients/ClientsTableHeader';
import type { Client, PaginationMeta } from '@/types';

interface ClientsTableProps {
  isLoading: boolean;
  data: { data: Client[]; meta?: PaginationMeta } | undefined;
  onPageChange: (page: number) => void;
  onEdit: (client: Client) => void;
  onDeactivate: (clientId: string) => Promise<void>;
  onReactivate: (clientId: string) => Promise<void>;
  onDelete: (client: Client) => void;
}

export function ClientsTable({
  isLoading,
  data,
  onPageChange,
  onEdit,
  onDeactivate,
  onReactivate,
  onDelete,
}: ClientsTableProps) {
  const navigate = useNavigate();

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
        <ClientsTableHeader />
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              </td>
            </tr>
          )}
          {!isLoading && data?.data.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                No clients yet. Create one to get started.
              </td>
            </tr>
          )}
          {data?.data.map((client) => (
            <ClientTableRow
              key={client._id}
              client={client}
              onNavigate={() => navigate(`/lists?clientId=${client._id}`)}
              onEdit={() => onEdit(client)}
              onDeactivate={() => void onDeactivate(client._id)}
              onReactivate={() => void onReactivate(client._id)}
              onDelete={() => onDelete(client)}
            />
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}
