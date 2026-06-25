import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { emptyTable } from '@/lib/noticeConfig';
import { NoticeTableEditorItem } from '@/components/notice/NoticeTableEditorItem';
import type { NoticeTablesEditorProps } from '@/components/notice/noticeTablesListEditors.types';

export function NoticeTablesEditor({
  values,
  readOnly,
  onUpdateTables,
}: NoticeTablesEditorProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">Tables</CardTitle>
        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onUpdateTables([
                ...values.tables,
                emptyTable(`table${values.tables.length + 1}`),
              ])
            }
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add table
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {values.tables.length === 0 && (
          <p className="text-sm text-muted-foreground">No tables configured.</p>
        )}
        {values.tables.map((table, ti) => (
          <NoticeTableEditorItem
            key={table.id}
            table={table}
            tableIndex={ti}
            readOnly={readOnly}
            onUpdateTables={onUpdateTables}
            allTables={values.tables}
          />
        ))}
      </CardContent>
    </Card>
  );
}
