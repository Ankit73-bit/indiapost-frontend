import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UseFormReturn } from 'react-hook-form';
import type { RegisterFormValues } from '@/pages/users/usersPage.types';

interface RegisterUserCredentialFieldsProps {
  form: UseFormReturn<RegisterFormValues>;
}

export function RegisterUserCredentialFields({
  form,
}: RegisterUserCredentialFieldsProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <>
      <div className="space-y-1.5 col-span-2">
        <Label>Email</Label>
        <Input
          type="email"
          placeholder="user@example.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
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
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input placeholder="Full name" {...register('name')} />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>
    </>
  );
}
