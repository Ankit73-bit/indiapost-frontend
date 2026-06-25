import type { NoticeConfigFormValues } from './noticeConfig.types';

export function validateNoticeConfigForm(
  values: NoticeConfigFormValues,
  clientId: string,
): Partial<Record<string, string>> {
  const errors: Partial<Record<string, string>> = {};
  if (!clientId) errors.clientId = 'Select a client';
  if (!values.notice_id.trim()) errors.notice_id = 'Notice ID is required';
  if (!values.notice_name.trim()) errors.notice_name = 'Notice name is required';
  if (!values.id_field.trim()) errors.id_field = 'ID field is required';
  if (!values.max_rows || values.max_rows < 1) {
    errors.max_rows = 'Max rows must be at least 1';
  }
  return errors;
}
