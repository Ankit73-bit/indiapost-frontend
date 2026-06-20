import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Save, KeyRound, Mail, User, ShieldAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAppSelector, useAppDispatch } from '@/store';
import { updateUser } from '@/store/authSlice';
import {
  useGetMeQuery,
  useUpdateMeMutation,
  useUpdateMyPasswordMutation,
  useGetUserByIdQuery,
  useAdminUpdateUserMutation,
} from '@/store/api/usersApi';
import { useListClientsQuery } from '@/store/api/clientsApi';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const nameSchema = z.object({ name: z.string().min(1, 'Name is required') });
type NameForm = z.infer<typeof nameSchema>;

const pwSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword:     z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string().min(1, 'Required'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type PwForm = z.infer<typeof pwSchema>;

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function Card({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-2.5 ring-1 ring-primary/20">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-base font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Admin editing another user's name ───────────────────────────────────────

function AdminEditNameForm({ userId, initialName }: { userId: string; initialName?: string }) {
  const [adminUpdate, { isLoading }] = useAdminUpdateUserMutation();
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<NameForm>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: initialName ?? '' },
  });

  async function onSubmit(values: NameForm) {
    await adminUpdate({ userId, body: { name: values.name } }).unwrap();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1.5">
        <Label>Display Name</Label>
        <Input placeholder="Full name" {...register('name')} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <Button type="submit" size="sm" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
        {saved ? 'Saved!' : 'Save Name'}
      </Button>
    </form>
  );
}

// ─── Self: update name ────────────────────────────────────────────────────────

function SelfNameForm({ initialName }: { initialName?: string }) {
  const dispatch = useAppDispatch();
  const [updateMe, { isLoading }] = useUpdateMeMutation();
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<NameForm>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: initialName ?? '' },
  });

  async function onSubmit(values: NameForm) {
    const updated = await updateMe({ name: values.name }).unwrap();
    dispatch(updateUser({ name: updated.name }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1.5">
        <Label>Display Name</Label>
        <Input placeholder="Full name" {...register('name')} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <Button type="submit" size="sm" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
        {saved ? 'Saved!' : 'Save Name'}
      </Button>
    </form>
  );
}

// ─── Self: change password ────────────────────────────────────────────────────

function SelfPasswordForm() {
  const [updatePw, { isLoading }] = useUpdateMyPasswordMutation();
  const [done, setDone] = useState(false);
  const [serverErr, setServerErr] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PwForm>({
    resolver: zodResolver(pwSchema),
  });

  async function onSubmit(values: PwForm) {
    setServerErr('');
    try {
      await updatePw({ currentPassword: values.currentPassword, newPassword: values.newPassword }).unwrap();
      reset();
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (e: unknown) {
      const msg = (e as { data?: { error?: string } })?.data?.error ?? 'Failed to update password';
      setServerErr(msg);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1.5">
        <Label>Current Password</Label>
        <Input type="password" placeholder="••••••••" {...register('currentPassword')} />
        {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>New Password</Label>
        <Input type="password" placeholder="Min 8 characters" {...register('newPassword')} />
        {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Confirm New Password</Label>
        <Input type="password" placeholder="Repeat new password" {...register('confirmPassword')} />
        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
      </div>
      {serverErr && (
        <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverErr}
        </div>
      )}
      <Button type="submit" size="sm" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-3.5 w-3.5" />}
        {done ? 'Password updated!' : 'Update Password'}
      </Button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const [searchParams] = useSearchParams();
  const editUserId = searchParams.get('userId'); // admin editing someone else
  const authUser   = useAppSelector((s) => s.auth.user);
  const isAdmin    = authUser?.role === 'admin';

  const { data: selfData, isLoading: selfLoading } = useGetMeQuery();
  const { data: targetData, isLoading: targetLoading } = useGetUserByIdQuery(editUserId ?? '', {
    skip: !editUserId || !isAdmin,
  });
  const { data: clientsData } = useListClientsQuery({ limit: 100 }, { skip: !isAdmin });

  const isEditingOther = isAdmin && !!editUserId && editUserId !== authUser?.id;
  const profile    = isEditingOther ? targetData : selfData;
  const isLoading  = isEditingOther ? targetLoading : selfLoading;

  const clientName = profile?.clientId
    ? (clientsData?.data.find((c) => c._id === profile.clientId)?.name ?? profile.clientId.slice(-8))
    : null;

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <PageHeader
        title={isEditingOther ? `Edit User — ${profile?.name ?? profile?.email}` : 'My Profile'}
        description={
          isEditingOther
            ? 'Admin editing user profile.'
            : 'Manage your account details and security.'
        }
      />

      {/* Info strip */}
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm space-y-1.5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="font-mono">{profile?.email}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          <span className="capitalize">{profile?.role}</span>
          {clientName && <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{clientName}</span>}
        </div>
      </div>

      {/* Display name */}
      <Card icon={User} title="Display Name">
        {isEditingOther ? (
          <AdminEditNameForm userId={editUserId!} initialName={profile?.name} />
        ) : (
          <SelfNameForm initialName={profile?.name} />
        )}
      </Card>

      {/* Password — self only */}
      {!isEditingOther && (
        <Card icon={KeyRound} title="Change Password">
          <SelfPasswordForm />
        </Card>
      )}
    </div>
  );
}
