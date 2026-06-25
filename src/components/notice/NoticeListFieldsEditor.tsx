import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { emptyListField } from '@/lib/noticeConfig';
import { NoticeConfigField } from '@/components/notice/NoticeConfigField';
import type { NoticeListFieldsEditorProps } from '@/components/notice/noticeTablesListEditors.types';

export function NoticeListFieldsEditor({
  values,
  readOnly,
  onUpdateListFields,
}: NoticeListFieldsEditorProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">List fields</CardTitle>
        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onUpdateListFields([...values.list_fields, emptyListField()])
            }
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add list field
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {values.list_fields.length === 0 && (
          <p className="text-sm text-muted-foreground">No list fields configured.</p>
        )}
        {values.list_fields.map((list, li) => (
          <div key={li} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-3">
            <NoticeConfigField label="Field name" value={list.field_name} onChange={(v) => {
              const list_fields = [...values.list_fields];
              list_fields[li] = { ...list, field_name: v };
              onUpdateListFields(list_fields);
            }} readOnly={readOnly} />
            <NoticeConfigField label="Placeholder" value={list.placeholder} onChange={(v) => {
              const list_fields = [...values.list_fields];
              list_fields[li] = { ...list, placeholder: v };
              onUpdateListFields(list_fields);
            }} readOnly={readOnly} />
            {!readOnly && (
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    onUpdateListFields(values.list_fields.filter((_, i) => i !== li))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
