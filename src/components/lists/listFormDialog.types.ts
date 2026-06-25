import type {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import type { ListFormValues } from '@/pages/lists/listsPage.types';
import type { Client, List } from '@/types';

export interface ListFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  submitError: string;
  creating: boolean;
  updating: boolean;
  register: UseFormRegister<ListFormValues>;
  handleSubmit: UseFormHandleSubmit<ListFormValues>;
  setValue: UseFormSetValue<ListFormValues>;
  errors: FieldErrors<ListFormValues>;
  onSubmit: (values: ListFormValues) => void;
}
