import {
  Pencil,
  PowerOff,
  Power,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/helpers';
import type { Client } from '@/types';

interface ClientTableRowProps {
  client: Client;
  onNavigate: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
  onDelete: () => void;
}

export function ClientTableRow({
  client,
  onNavigate,
  onEdit,
  onDeactivate,
  onReactivate,
  onDelete,
}: ClientTableRowProps) {
  return (
    <tr
      className={cn(
        'border-b border-border/50 last:border-0 hover:bg-muted/20 cursor-pointer',
        !client.isActive && 'bg-muted/40 text-muted-foreground opacity-70',
      )}
      onClick={onNavigate}
    >
      <td className="px-4 py-3 font-medium">{client.name}</td>
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
        {client.slug}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${
            client.isActive
              ? 'border-green-200 bg-green-100 text-green-700'
              : 'border-gray-200 bg-gray-100 text-gray-500'
          }`}
        >
          {client.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {formatDate(client.createdAt)}
      </td>
      <td className="px-4 py-3 text-right">
        <div
          className="flex justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {client.isActive ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground"
                title="Deactivate client"
                onClick={onDeactivate}
              >
                <PowerOff className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                title="Delete client"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-primary"
              title="Reactivate client"
              onClick={onReactivate}
            >
              <Power className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
