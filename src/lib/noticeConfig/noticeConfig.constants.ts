import type { NoticeConfigFormValues } from './noticeConfig.types';

export const DEFAULT_NOTICE_CONFIG_FORM: NoticeConfigFormValues = {
  notice_id: '',
  notice_name: '',
  id_field: 'cuid',
  with_header: false,
  sort_field: 'SrNo',
  description: '',
  rotation: false,
  max_rows: 20,
  file_name: [],
  date_input_format: '%Y-%m-%d',
  date_output_style: 'dd-mm-yyyy',
  variable_fields: [],
  date_fields: [],
  decimal_fields: [],
  password_field: '',
  default_password: '',
  tables: [],
  list_fields: [],
};

export function emptyNoticeConfigForm(): NoticeConfigFormValues {
  return { ...DEFAULT_NOTICE_CONFIG_FORM };
}
