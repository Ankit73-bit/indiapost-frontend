import type { NoticeConfigFormValues } from '@/lib/noticeConfig';
import type { NoticeListFieldConfig, NoticeTableConfig } from '@/types';

interface UseNoticeTablesListEditorsOptions {
  values: NoticeConfigFormValues;
  onChange: (values: NoticeConfigFormValues) => void;
}

export function useNoticeTablesListEditors({
  values,
  onChange,
}: UseNoticeTablesListEditorsOptions) {
  function updateTables(tables: NoticeTableConfig[]) {
    onChange({ ...values, tables });
  }

  function updateListFields(list_fields: NoticeListFieldConfig[]) {
    onChange({ ...values, list_fields });
  }

  return { updateTables, updateListFields };
}
