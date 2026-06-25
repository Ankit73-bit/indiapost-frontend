import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { COLUMN_FORMATS } from '@/lib/noticeConfig';
import { NoticeConfigField } from '@/components/notice/NoticeConfigField';
import { parseColumnFormat } from '@/components/notice/noticeTablesListEditors.utils';
import type { NoticeConfigFormValues } from '@/lib/noticeConfig';

type NoticeTable = NoticeConfigFormValues['tables'][number];

interface NoticeTableColumnsEditorProps {
  table: NoticeTable;
  tableIndex: number;
  readOnly?: boolean;
  onUpdateTables: (tables: NoticeConfigFormValues['tables']) => void;
  allTables: NoticeConfigFormValues['tables'];
}

export function NoticeTableColumnsEditor({
  table,
  tableIndex,
  readOnly,
  onUpdateTables,
  allTables,
}: NoticeTableColumnsEditorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">Columns</Label>
      {table.columns.map((col, ci) => (
        <div key={ci} className="flex gap-2">
          <Input
            value={col.name}
            disabled={readOnly}
            placeholder="Column name"
            onChange={(e) => {
              const tables = [...allTables];
              const columns = [...table.columns];
              columns[ci] = { ...col, name: e.target.value };
              tables[tableIndex] = { ...table, columns };
              onUpdateTables(tables);
            }}
          />
          <select
            className="rounded-md border border-input bg-background px-2 text-sm"
            value={col.format}
            disabled={readOnly}
            onChange={(e) => {
              const tables = [...allTables];
              const columns = [...table.columns];
              columns[ci] = {
                ...col,
                format: parseColumnFormat(e.target.value),
              };
              tables[tableIndex] = { ...table, columns };
              onUpdateTables(tables);
            }}
          >
            {COLUMN_FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          {!readOnly && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                const tables = [...allTables];
                tables[tableIndex] = {
                  ...table,
                  columns: table.columns.filter((_, i) => i !== ci),
                };
                onUpdateTables(tables);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      {!readOnly && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const tables = [...allTables];
            tables[tableIndex] = {
              ...table,
              columns: [...table.columns, { name: '', format: 'str' }],
            };
            onUpdateTables(tables);
          }}
        >
          Add column
        </Button>
      )}
    </div>
  );
}
