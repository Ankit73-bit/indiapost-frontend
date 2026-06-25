import type { NoticeConfigFormValues } from '@/lib/noticeConfig';

export interface NoticeTablesListEditorsProps {
  values: NoticeConfigFormValues;
  onChange: (values: NoticeConfigFormValues) => void;
  readOnly?: boolean;
}

export interface NoticeConfigFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  className?: string;
}

export interface NoticeTablesEditorProps {
  values: NoticeConfigFormValues;
  readOnly?: boolean;
  onUpdateTables: (tables: NoticeConfigFormValues['tables']) => void;
}

export interface NoticeListFieldsEditorProps {
  values: NoticeConfigFormValues;
  readOnly?: boolean;
  onUpdateListFields: (listFields: NoticeConfigFormValues['list_fields']) => void;
}
