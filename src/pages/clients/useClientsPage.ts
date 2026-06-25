import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useListClientsQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeactivateClientMutation,
  useReactivateClientMutation,
  useDeleteClientMutation,
} from '@/store/api/clientsApi';
import { toast } from '@/lib/toast';
import { getApiErrorMessage } from '@/lib/helpers';
import { CLIENTS_PAGE_SIZE, clientFormSchema } from './clientsPage.constants';
import type { ClientFormValues } from './clientsPage.types';
import type { Client } from '@/types';

export function useClientsPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const { data, isLoading } = useListClientsQuery({
    page,
    limit: CLIENTS_PAGE_SIZE,
  });
  const [createClient, { isLoading: creating }] = useCreateClientMutation();
  const [updateClient, { isLoading: updating }] = useUpdateClientMutation();
  const [deactivateClient] = useDeactivateClientMutation();
  const [reactivateClient] = useReactivateClientMutation();
  const [deleteClient, { isLoading: deleting }] = useDeleteClientMutation();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
  });

  function openCreate() {
    setEditing(null);
    setSubmitError('');
    form.reset({ name: '', slug: '' });
    setDialogOpen(true);
  }

  function openEdit(client: Client) {
    setSubmitError('');
    setEditing(client);
    form.reset({
      name: client.name,
      slug: client.slug,
    });
    setDialogOpen(true);
  }

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) setSubmitError('');
  }

  function openDelete(client: Client) {
    setDeleteError('');
    setDeleteTarget(client);
  }

  async function handleDeleteClient() {
    if (!deleteTarget) return;
    setDeleteError('');
    try {
      await deleteClient(deleteTarget._id).unwrap();
      setDeleteTarget(null);
      toast.success('Client deleted');
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'Failed to delete client.'));
    }
  }

  async function onSubmit(values: ClientFormValues) {
    setSubmitError('');
    try {
      if (editing) {
        await updateClient({ clientId: editing._id, body: values }).unwrap();
      } else {
        await createClient(values).unwrap();
      }
      setDialogOpen(false);
      form.reset();
    } catch (err) {
      setSubmitError(
        getApiErrorMessage(
          err,
          editing ? 'Failed to update client.' : 'Failed to create client.',
        ),
      );
    }
  }

  async function handleDeactivate(clientId: string) {
    try {
      await deactivateClient(clientId).unwrap();
      toast.success('Client deactivated');
    } catch (err) {
      toast.apiError(err, 'Failed to deactivate client');
    }
  }

  async function handleReactivate(clientId: string) {
    try {
      await reactivateClient(clientId).unwrap();
      toast.success('Client reactivated');
    } catch (err) {
      toast.apiError(err, 'Failed to reactivate client');
    }
  }

  return {
    page,
    setPage,
    dialogOpen,
    handleDialogOpenChange,
    editing,
    submitError,
    deleteTarget,
    setDeleteTarget,
    deleteError,
    data,
    isLoading,
    creating,
    updating,
    deleting,
    form,
    openCreate,
    openEdit,
    openDelete,
    handleDeleteClient,
    onSubmit,
    handleDeactivate,
    handleReactivate,
  };
}
