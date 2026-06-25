import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UseFormReturn } from 'react-hook-form';
import type { ClientOption, RegisterFormValues } from '@/pages/users/usersPage.types';
import type { UserRole } from '@/types';

interface RegisterUserRoleFieldsProps {
  form: UseFormReturn<RegisterFormValues>;
  role: UserRole;
  clientOptions: ClientOption[];
}

export function RegisterUserRoleFields({
  form,
  role,
  clientOptions,
}: RegisterUserRoleFieldsProps) {
  const { setValue } = form;

  return (
    <>
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
    </>
  );
}
