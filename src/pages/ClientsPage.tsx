import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, PowerOff, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { Pagination } from '@/components/shared/Pagination';
import {
  useListClientsQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeactivateClientMutation,
} from '@/store/api/clientsApi';
import { toSlug, formatDate } from '@/lib/helpers';
import type { Client } from '@/types';

// ─── Form schema ──────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
  contactEmail: z.email('Enter a valid email'),
});
type FormValues = z.infer<typeof schema>;

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ClientsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const { data, isLoading } = useListClientsQuery({ page, limit: 20 });
  const [createClient, { isLoading: creating }] = useCreateClientMutation();
  const [updateClient, { isLoading: updating }] = useUpdateClientMutation();
  const [deactivateClient] = useDeactivateClientMutation();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const nameValue = watch('name');

  function openCreate() {
    setEditing(null);
    reset({ name: '', slug: '', contactEmail: '' });
    setDialogOpen(true);
  }

  function openEdit(client: Client) {
    setEditing(client);
    reset({
      name: client.name,
      slug: client.slug,
      contactEmail: client.contactEmail,
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    if (editing) {
      await updateClient({ clientId: editing._id, body: values }).unwrap();
    } else {
      await createClient(values).unwrap();
    }
    setDialogOpen(false);
    reset();
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clients"
        description="Manage tenant accounts. Each client has their own lists and articles."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> New Client
          </Button>
        }
      />

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Slug
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Created
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            )}
            {!isLoading && data?.data.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No clients yet. Create one to get started.
                </td>
              </tr>
            )}
            {data?.data.map((client) => (
              <tr
                key={client._id}
                className="border-b border-border/50 last:border-0 hover:bg-muted/20 cursor-pointer"
                onClick={() => navigate(`/lists?clientId=${client._id}`)}
              >
                <td className="px-4 py-3 font-medium">{client.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {client.slug}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {client.contactEmail}
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
                      onClick={() => openEdit(client)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {client.isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => deactivateClient(client._id)}
                      >
                        <PowerOff className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data?.meta && data.meta.totalPages > 1 && (
          <div className="px-4 pb-4">
            <Pagination meta={data.meta} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Client' : 'New Client'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                placeholder="Acme Bank"
                {...register('name', {
                  onChange: (e) => {
                    if (!editing) setValue('slug', toSlug(e.target.value));
                  },
                })}
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input placeholder="acme-bank" {...register('slug')} />
              {errors.slug && (
                <p className="text-xs text-destructive">
                  {errors.slug.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Contact Email</Label>
              <Input
                type="email"
                placeholder="ops@acmebank.com"
                {...register('contactEmail')}
              />
              {errors.contactEmail && (
                <p className="text-xs text-destructive">
                  {errors.contactEmail.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating || updating}>
                {(creating || updating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editing ? 'Save Changes' : 'Create Client'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
