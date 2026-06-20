import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  COLUMN_FORMATS,
  emptyListField,
  emptyTable,
  type NoticeConfigFormValues,
} from '@/lib/noticeConfig';
import type { NoticeListFieldConfig, NoticeTableConfig } from '@/types';

interface Props {
  values: NoticeConfigFormValues;
  onChange: (values: NoticeConfigFormValues) => void;
  readOnly?: boolean;
}

export function NoticeTablesListEditors({ values, onChange, readOnly }: Props) {
  function updateTables(tables: NoticeTableConfig[]) {
    onChange({ ...values, tables });
  }

  function updateListFields(list_fields: NoticeListFieldConfig[]) {
    onChange({ ...values, list_fields });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Tables</CardTitle>
          {!readOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                updateTables([
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
            <div key={table.id} className="rounded-lg border border-border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Table {ti + 1}</span>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      updateTables(values.tables.filter((_, i) => i !== ti))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="ID" value={table.id} onChange={(v) => {
                  const tables = [...values.tables];
                  tables[ti] = { ...table, id: v };
                  updateTables(tables);
                }} readOnly={readOnly} />
                <Field label="ID column" value={table.id_column} onChange={(v) => {
                  const tables = [...values.tables];
                  tables[ti] = { ...table, id_column: v };
                  updateTables(tables);
                }} readOnly={readOnly} />
                <Field label="Max rows" value={String(table.max_rows)} onChange={(v) => {
                  const tables = [...values.tables];
                  tables[ti] = { ...table, max_rows: Number.parseInt(v, 10) || 20 };
                  updateTables(tables);
                }} readOnly={readOnly} />
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={Boolean(table.rotation)}
                    disabled={readOnly}
                    onChange={(e) => {
                      const tables = [...values.tables];
                      tables[ti] = { ...table, rotation: e.target.checked };
                      updateTables(tables);
                    }}
                  />
                  <Label className="text-sm">Table rotation</Label>
                </div>
              </div>
              <Field
                label="Placeholder pattern"
                value={table.placeholder_pattern}
                onChange={(v) => {
                  const tables = [...values.tables];
                  tables[ti] = { ...table, placeholder_pattern: v };
                  updateTables(tables);
                }}
                readOnly={readOnly}
                className="sm:col-span-2"
              />
              <div className="space-y-2">
                <Label className="text-xs">Columns</Label>
                {table.columns.map((col, ci) => (
                  <div key={ci} className="flex gap-2">
                    <Input
                      value={col.name}
                      disabled={readOnly}
                      placeholder="Column name"
                      onChange={(e) => {
                        const tables = [...values.tables];
                        const columns = [...table.columns];
                        columns[ci] = { ...col, name: e.target.value };
                        tables[ti] = { ...table, columns };
                        updateTables(tables);
                      }}
                    />
                    <select
                      className="rounded-md border border-input bg-background px-2 text-sm"
                      value={col.format}
                      disabled={readOnly}
                      onChange={(e) => {
                        const tables = [...values.tables];
                        const columns = [...table.columns];
                        columns[ci] = {
                          ...col,
                          format: e.target.value as typeof col.format,
                        };
                        tables[ti] = { ...table, columns };
                        updateTables(tables);
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
                          const tables = [...values.tables];
                          tables[ti] = {
                            ...table,
                            columns: table.columns.filter((_, i) => i !== ci),
                          };
                          updateTables(tables);
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
                      const tables = [...values.tables];
                      tables[ti] = {
                        ...table,
                        columns: [...table.columns, { name: '', format: 'str' }],
                      };
                      updateTables(tables);
                    }}
                  >
                    Add column
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">List fields</CardTitle>
          {!readOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                updateListFields([...values.list_fields, emptyListField()])
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
            <div key={li} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-4">
              <Field label="Field name" value={list.field_name} onChange={(v) => {
                const list_fields = [...values.list_fields];
                list_fields[li] = { ...list, field_name: v };
                updateListFields(list_fields);
              }} readOnly={readOnly} />
              <Field label="Placeholder" value={list.placeholder} onChange={(v) => {
                const list_fields = [...values.list_fields];
                list_fields[li] = { ...list, placeholder: v };
                updateListFields(list_fields);
              }} readOnly={readOnly} />
              <Field label="Max items" value={String(list.max_items ?? 20)} onChange={(v) => {
                const list_fields = [...values.list_fields];
                list_fields[li] = { ...list, max_items: Number.parseInt(v, 10) || 20 };
                updateListFields(list_fields);
              }} readOnly={readOnly} />
              {!readOnly && (
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      updateListFields(values.list_fields.filter((_, i) => i !== li))
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
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  readOnly,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs">{label}</Label>
      <Input
        value={value}
        disabled={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1"
      />
    </div>
  );
}
