import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NoticeTypeCombobox } from '@/components/shared/NoticeTypeCombobox';
import { ListFormDialogClientSection } from '@/components/lists/ListFormDialogClientSection';
import { ListFormDialogDateFields } from '@/components/lists/ListFormDialogDateFields';
import { ListFormDialogSlugPreview } from '@/components/lists/ListFormDialogSlugPreview';
import type { ListFormValues } from '@/pages/lists/listsPage.types';
import type { Client, List } from '@/types';
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';

interface ListFormDialogFieldsProps {
  editing: List | null;
  isAdmin: boolean;
  activeClients: Client[];
  customerClient: Client | undefined;
  authClientId: string | undefined;
  watchedClientId: string;
  watchedNoticeType: string;
  formClientId: string;
  formNoticeTypesData: string[] | undefined;
  generatedSlugPreview: string | null;
  register: UseFormRegister<ListFormValues>;
  setValue: UseFormSetValue<ListFormValues>;
  errors: FieldErrors<ListFormValues>;
}

export function ListFormDialogFields(props: ListFormDialogFieldsProps) {
  const {
    editing,
    isAdmin,
    activeClients,
    customerClient,
    authClientId,
    watchedClientId,
    watchedNoticeType,
    formClientId,
    formNoticeTypesData,
    generatedSlugPreview,
    register,
    setValue,
    errors,
  } = props;

  return (
    <>
      <ListFormDialogClientSection
        editing={editing}
        isAdmin={isAdmin}
        activeClients={activeClients}
        customerClient={customerClient}
        authClientId={authClientId}
        watchedClientId={watchedClientId}
        setValue={setValue}
        errors={errors}
      />
      <NoticeTypeCombobox
        value={watchedNoticeType ?? ''}
        onChange={(v) => setValue('noticeType', v, { shouldValidate: true })}
        knownTypes={formNoticeTypesData}
        clientScoped
        error={errors.noticeType?.message}
        disabled={!formClientId}
      />
      <div className="space-y-1.5">
        <Label>
          Notice Name <span className="text-destructive">*</span>
        </Label>
        <Input placeholder="e.g. aug-demand-batch" {...register('noticeName')} />
        <p className="text-xs text-muted-foreground">
          Short label used in the generated list name (last segment).
        </p>
        {errors.noticeName && (
          <p className="text-xs text-destructive">{errors.noticeName.message}</p>
        )}
      </div>
      <ListFormDialogSlugPreview
        editing={editing}
        generatedSlugPreview={generatedSlugPreview}
      />
      <ListFormDialogDateFields register={register} errors={errors} />
    </>
  );
}
