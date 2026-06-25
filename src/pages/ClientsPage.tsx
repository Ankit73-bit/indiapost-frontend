import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { ClientFormDialog } from '@/components/clients/ClientFormDialog';
import { ClientsTable } from '@/components/clients/ClientsTable';
import { useClientsPage } from '@/pages/clients/useClientsPage';

export function ClientsPage() {
  const clients = useClientsPage();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clients"
        description="Manage tenant accounts. Each client has their own lists and articles."
        actions={
          <Button size="sm" onClick={clients.openCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> New Client
          </Button>
        }
      />

      <ClientsTable
        isLoading={clients.isLoading}
        data={clients.data}
        onPageChange={clients.setPage}
        onEdit={clients.openEdit}
        onDeactivate={clients.handleDeactivate}
        onReactivate={clients.handleReactivate}
        onDelete={clients.openDelete}
      />

      <ClientFormDialog
        open={clients.dialogOpen}
        onOpenChange={clients.handleDialogOpenChange}
        editing={clients.editing}
        submitError={clients.submitError}
        creating={clients.creating}
        updating={clients.updating}
        form={clients.form}
        onSubmit={clients.onSubmit}
      />

      <ConfirmDeleteDialog
        open={Boolean(clients.deleteTarget)}
        onClose={() => clients.setDeleteTarget(null)}
        onConfirm={clients.handleDeleteClient}
        title="Delete client"
        description="This will remove the client."
        entityName={clients.deleteTarget?.name ?? ''}
        isLoading={clients.deleting}
        error={clients.deleteError}
      />
    </div>
  );
}
