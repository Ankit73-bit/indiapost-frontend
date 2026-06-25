import { NoticeListFieldsEditor } from '@/components/notice/NoticeListFieldsEditor';
import { NoticeTablesEditor } from '@/components/notice/NoticeTablesEditor';
import type { NoticeTablesListEditorsProps } from '@/components/notice/noticeTablesListEditors.types';
import { useNoticeTablesListEditors } from '@/components/notice/useNoticeTablesListEditors';

export function NoticeTablesListEditors({ values, onChange, readOnly }: NoticeTablesListEditorsProps) {
  const { updateTables, updateListFields } = useNoticeTablesListEditors({ values, onChange });

  return (
    <div className="space-y-4">
      <NoticeTablesEditor
        values={values}
        readOnly={readOnly}
        onUpdateTables={updateTables}
      />
      <NoticeListFieldsEditor
        values={values}
        readOnly={readOnly}
        onUpdateListFields={updateListFields}
      />
    </div>
  );
}
