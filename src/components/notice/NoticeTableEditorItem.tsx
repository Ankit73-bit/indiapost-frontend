import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NoticeConfigField } from '@/components/notice/NoticeConfigField';
import { NoticeTableColumnsEditor } from '@/components/notice/NoticeTableColumnsEditor';
import type { NoticeConfigFormValues } from '@/lib/noticeConfig';

type NoticeTable = NoticeConfigFormValues['tables'][number];

interface NoticeTableEditorItemProps {
  table: NoticeTable;
  tableIndex: number;
  readOnly?: boolean;
  onUpdateTables: (tables: NoticeConfigFormValues['tables']) => void;
  allTables: NoticeConfigFormValues['tables'];
}

export function NoticeTableEditorItem({
  table,
  tableIndex,
  readOnly,
  onUpdateTables,
  allTables,
}: NoticeTableEditorItemProps) {
  return (
    <div className="rounded-lg border border-border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Table {tableIndex + 1}</span>
        {!readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              onUpdateTables(allTables.filter((_, i) => i !== tableIndex))
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <NoticeConfigField
          label="ID"
          value={table.id}
          onChange={(v) => {
            const tables = [...allTables];
            tables[tableIndex] = { ...table, id: v };
            onUpdateTables(tables);
          }}
          readOnly={readOnly}
        />
        <NoticeConfigField
          label="ID column"
          value={table.id_column}
          onChange={(v) => {
            const tables = [...allTables];
            tables[tableIndex] = { ...table, id_column: v };
            onUpdateTables(tables);
          }}
          readOnly={readOnly}
        />
      </div>
      <NoticeConfigField
        label="Placeholder pattern"
        value={table.placeholder_pattern}
        onChange={(v) => {
          const tables = [...allTables];
          tables[tableIndex] = { ...table, placeholder_pattern: v };
          onUpdateTables(tables);
        }}
        readOnly={readOnly}
        className="sm:col-span-2"
      />
      <NoticeTableColumnsEditor
        table={table}
        tableIndex={tableIndex}
        readOnly={readOnly}
        onUpdateTables={onUpdateTables}
        allTables={allTables}
      />
    </div>
  );
}
