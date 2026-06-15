import { useState } from 'react';
import { Plus, Loader2, UserCheck, UserX, Link2, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { TableShell } from '@/components/shared/TableShell';
import { getApiBaseUrl } from '@/lib/apiBase';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { Pagination } from '@/components/shared/Pagination';
import {
  useListUsersQuery,
  useDeactivateUserMutation,
  useReactivateUserMutation,
  useDeleteUserMutation,
  useAssignClientMutation,
} from '@/store/api/usersApi';
import { useListClientsQuery } from '@/store/api/clientsApi';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { formatDate, getApiErrorMessage } from '@/lib/helpers';
import { useAppSelector } from '@/store';
import type { UserRole, PublicUser } from '@/types';

// ─── Register new user form — calls /api/v1/auth/register ────────────────────
// We use a plain fetch here since RTK Query endpoint is a public mutation
// but we want it inline. Could also inject authApi.register endpoint later.

const registerSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Min 8 characters'),
  role: z.enum(['admin', 'customer']),
  name: z.string().min(1, 'Name is required'),
  clientId: z.string().optional(),
});
type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterUserDialog({
  open,
  onClose,
  clientOptions,
}: {
  open: boolean;
  onClose: () => void;
  clientOptions: { _id: string; name: string }[];
}) {
  const apiUrl = getApiBaseUrl() || window.location.origin;
  const token = useAppSelector((s) => s.auth.token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'customer' },
  });
  const role = watch('role');

  async function onSubmit(values: RegisterFormValues) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'Registration failed');
      }
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="user@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Min 8 characters"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="Full name" {...register('name')} />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                defaultValue="customer"
                onValueChange={(v) => setValue('role', v as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {role === 'customer' && (
              <div className="space-y-1.5 col-span-2">
                <Label>
                  Assign to Client{' '}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Select
                  onValueChange={(v) =>
                    setValue('clientId', v === '_none' ? undefined : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">No client</SelectItem>
                    {clientOptions.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assign client dialog ─────────────────────────────────────────────────────

function AssignClientDialog({
  user,
  onClose,
  clientOptions,
}: {
  user: PublicUser;
  onClose: () => void;
  clientOptions: { _id: string; name: string }[];
}) {
  const [assignClient, { isLoading }] = useAssignClientMutation();
  const [selected, setSelected] = useState<string>(user.clientId ?? '_none');

  async function handleSave() {
    await assignClient({
      userId: user.id,
      body: { clientId: selected === '_none' ? null : selected },
    }).unwrap();
    onClose();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign Client — {user.email}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">No client (unassign)</SelectItem>
              {clientOptions.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── User row actions ─────────────────────────────────────────────────────────

function UserRow({
  user,
  clientOptions,
  currentUserId,
}: {
  user: PublicUser;
  clientOptions: { _id: string; name: string }[];
  currentUserId: string;
}) {
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
        <td className="px-4 py-3">
          <p className="font-medium">{user.name ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </td>
        <td className="px-4 py-3">
          <span
            className={cn(
              'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium capitalize',
              user.role === 'admin'
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : 'bg-blue-100 text-blue-700 border-blue-200',
              !user.isActive && 'opacity-80',
            )}
          >
            {user.role}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">
          {clientName ?? (user.clientId ? user.clientId.slice(-8) : '—')}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${
              user.isActive
                ? 'bg-green-100 text-green-700 border-green-200'
                : 'bg-gray-100 text-gray-400 border-gray-200'
            }`}
          >
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="px-4 py-3 text-muted-foreground">
          {formatDate(user.id ? undefined : undefined)}
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex justify-end gap-1">
            {user.role === 'customer' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setAssignOpen(true)}
              >
                <Link2 className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => navigate(`/profile?userId=${user.id}`)}
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
                  onClick={() => deactivate(user.id)}
                >
                  <UserX className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  title="Delete user"
                  disabled={user.id === currentUserId}
                  onClick={() => {
                    setDeleteError('');
                    setDeleteOpen(true);
                  }}
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
                onClick={() => reactivate(user.id)}
              >
                <UserCheck className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </td>
      </tr>
      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteUser}
        title="Delete user"
        description="This deactivates the user account. They will no longer be able to sign in."
        entityName={user.name ?? user.email}
        isLoading={deleting}
        error={deleteError}
      />
      {assignOpen && (
        <AssignClientDialog
          user={user}
          onClose={() => setAssignOpen(false)}
          clientOptions={clientOptions}
        />
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function UsersPage() {
  const currentUser = useAppSelector((s) => s.auth.user);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'customer'>(
    'all',
  );

  const { data: clientsData } = useListClientsQuery({ limit: 100 });
  const { data, isLoading } = useListUsersQuery({
    role: roleFilter === 'all' ? undefined : roleFilter,
    page,
    limit: 20,
  });

  const clientOptions = clientsData?.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users"
        description="Manage admin and customer user accounts."
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Create User
          </Button>
        }
      />

      <Tabs
        value={roleFilter}
        onValueChange={(v) => {
          setRoleFilter(v as typeof roleFilter);
          setPage(1);
        }}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
          <TabsTrigger value="customer">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value={roleFilter}>
          <TableShell
            footer={
              data?.meta && data.meta.totalPages > 1 ? (
                <div className="px-4 pb-4">
                  <Pagination meta={data.meta} onPageChange={setPage} />
                </div>
              ) : undefined
            }
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    User
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Client
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
                    currentUserId={currentUser?.id ?? ''}
                  />
                ))}
              </tbody>
            </table>
          </TableShell>
        </TabsContent>
      </Tabs>

      <RegisterUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        clientOptions={clientOptions}
      />
    </div>
  );
}
