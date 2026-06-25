import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ListFormValues } from '@/pages/lists/listsPage.types';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

interface ListFormDialogDateFieldsProps {
  register: UseFormRegister<ListFormValues>;
  errors: FieldErrors<ListFormValues>;
}

export function ListFormDialogDateFields({
  register,
  errors,
}: ListFormDialogDateFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>
            Notice Date <span className="text-destructive">*</span>
          </Label>
          <Input type="date" {...register('noticeDate')} />
          {errors.noticeDate && (
            <p className="text-xs text-destructive">{errors.noticeDate.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>
            Dispatch Date <span className="text-destructive">*</span>
          </Label>
          <Input type="date" {...register('dispatchDate')} />
          {errors.dispatchDate && (
            <p className="text-xs text-destructive">
              {errors.dispatchDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>
          Description{' '}
          <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input placeholder="Brief description" {...register('description')} />
      </div>
    </>
  );
}
