import { useState } from 'react';
import { Loader2, KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateMyPasswordMutation } from '@/store/api/usersApi';
import { pwSchema, type PwForm } from '@/pages/profile/profilePage.schemas';

function getPasswordUpdateErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    typeof error.data === 'object' &&
    error.data !== null &&
    'error' in error.data &&
    typeof error.data.error === 'string'
  ) {
    return error.data.error;
  }
  return 'Failed to update password';
}

export function SelfPasswordForm() {
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
      setServerErr(getPasswordUpdateErrorMessage(e));
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
