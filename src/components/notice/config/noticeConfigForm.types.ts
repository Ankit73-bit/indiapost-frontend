import type { NoticeConfigFormValues } from '@/lib/noticeConfig';
import type { NoticeConfigFormErrors } from '@/pages/notice/noticeConfigPage.types';
import type { Client } from '@/types';

export interface NoticeConfigFormProps {
  values: NoticeConfigFormValues;
  onChange: (values: NoticeConfigFormValues) => void;
  clients?: Client[];
  clientId: string;
  onClientIdChange?: (id: string) => void;
  isAdmin?: boolean;
  uploadedFileName?: string | null;
  errors?: NoticeConfigFormErrors;
  readOnly?: boolean;
  showWithHeader?: boolean;
}

export interface NoticeConfigTagListFieldProps {
  label: string;
  required: boolean;
  hint?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  error?: string;
  readOnly?: boolean;
}

export type NoticeConfigFieldSetter = <K extends keyof NoticeConfigFormValues>(
  key: K,
  value: NoticeConfigFormValues[K],
) => void;

export interface NoticeConfigCoreMappingCardProps {
  values: NoticeConfigFormValues;
  errors: NoticeConfigFormErrors;
  readOnly: boolean;
  showWithHeader: boolean;
  set: NoticeConfigFieldSetter;
}

export interface NoticeConfigOutputDatesCardProps {
  values: NoticeConfigFormValues;
  readOnly: boolean;
  set: NoticeConfigFieldSetter;
}

export interface NoticeConfigColumnMappingCardProps {
  values: NoticeConfigFormValues;
  readOnly: boolean;
  set: NoticeConfigFieldSetter;
}

export interface NoticeConfigPdfProtectionCardProps {
  values: NoticeConfigFormValues;
  readOnly: boolean;
  set: NoticeConfigFieldSetter;
}

export interface NoticeConfigVersionNotesFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export interface NoticeConfigClientSelectProps {
  clients: Client[];
  clientId: string;
  readOnly: boolean;
  onClientIdChange: (id: string) => void;
}
