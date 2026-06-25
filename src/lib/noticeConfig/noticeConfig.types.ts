import type {
  DateOutputStyle,
  NoticeListFieldConfig,
  NoticeTableColumnConfig,
  NoticeTableConfig,
} from '@/types';

export interface NoticeConfigFormValues {
  notice_id: string;
  notice_name: string;
  id_field: string;
  with_header: boolean;
  sort_field: string;
  description: string;
  rotation: boolean;
  max_rows: number;
  file_name: string[];
  date_input_format: string;
  date_output_style: DateOutputStyle;
  variable_fields: string[];
  date_fields: string[];
  decimal_fields: string[];
  password_field: string;
  default_password: string;
  tables: NoticeTableConfig[];
  list_fields: NoticeListFieldConfig[];
}

export const COLUMN_FORMATS: NoticeTableColumnConfig['format'][] = [
  'str',
  'int',
  'float',
  'date',
  'time',
];
