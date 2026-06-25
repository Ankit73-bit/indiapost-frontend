import type { NoticeConfig } from '@/types';
import type { NoticeConfigFormValues } from './noticeConfig.types';
import { normalizeListField, normalizeTable } from './noticeConfig.parse';

export function formValuesToNoticeConfig(form: NoticeConfigFormValues): NoticeConfig {
  const config: NoticeConfig = {
    notice_id: form.notice_id.trim(),
    notice_name: form.notice_name.trim(),
    with_header: form.with_header,
    id_field: form.id_field.trim(),
    max_rows: form.max_rows,
    date_output_style: form.date_output_style,
  };
  if (form.sort_field.trim()) config.sort_field = form.sort_field.trim();
  if (form.description.trim()) config.description = form.description.trim();
  if (form.rotation) config.rotation = true;
  if (form.file_name.length) config.file_name = form.file_name;
  if (form.date_input_format.trim()) {
    config.date_input_format = form.date_input_format.trim();
  }
  if (form.variable_fields.length) config.variable_fields = form.variable_fields;
  if (form.date_fields.length) config.date_fields = form.date_fields;
  if (form.decimal_fields.length) config.decimal_fields = form.decimal_fields;
  if (form.password_field.trim()) config.password_field = form.password_field.trim();
  if (form.default_password.trim()) config.default_password = form.default_password.trim();
  if (form.tables.length) config.tables = form.tables;
  if (form.list_fields.length) config.list_fields = form.list_fields;
  return config;
}

export function noticeConfigToFormValues(
  config: NoticeConfig,
  description = '',
): NoticeConfigFormValues {
  return {
    notice_id: config.notice_id,
    notice_name: config.notice_name,
    id_field: config.id_field,
    with_header: config.with_header ?? false,
    sort_field: config.sort_field ?? '',
    description: config.description ?? description,
    rotation: config.rotation ?? false,
    max_rows: config.max_rows ?? 20,
    file_name: config.file_name ?? [],
    date_input_format: config.date_input_format ?? '%Y-%m-%d',
    date_output_style: config.date_output_style ?? 'dd-mm-yyyy',
    variable_fields: config.variable_fields ?? [],
    date_fields: config.date_fields ?? [],
    decimal_fields: config.decimal_fields ?? [],
    password_field: config.password_field ?? '',
    default_password: config.default_password ?? '',
    tables: (config.tables ?? []).map(normalizeTable),
    list_fields: (config.list_fields ?? []).map(normalizeListField),
  };
}
