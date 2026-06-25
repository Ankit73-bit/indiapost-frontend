import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch } from '@/store';
import { updateUser } from '@/store/authSlice';
import { useUpdateMeMutation } from '@/store/api/usersApi';
import { nameSchema, type NameForm } from '@/pages/profile/profilePage.schemas';

interface SelfNameFormProps {
  initialName?: string;
}

export function SelfNameForm({ initialName }: SelfNameFormProps) {
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
