import { useState } from 'react';
import { Columns3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SampleExcelColumnPickerDialog } from '@/components/notice/sampleExcel/SampleExcelColumnPickerDialog';
import type { SampleExcelPreviewData } from '@/types';

export function SampleExcelPreviewPanel({
  preview,
  visibleColumns,
  onVisibleColumnsChange,
  loading,
  fileName,
}: {
  preview: SampleExcelPreviewData | null;
  visibleColumns: string[];
  onVisibleColumnsChange: (columns: string[]) => void;
  loading?: boolean;
  fileName?: string;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const displayColumns = visibleColumns.filter((column) =>
    preview?.columns.includes(column),
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-3">
          <div>
            <CardTitle className="text-base">Excel preview</CardTitle>
            {fileName ? (
              <p className="mt-1 text-xs text-muted-foreground">{fileName}</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!preview?.columns.length || loading}
            onClick={() => setPickerOpen(true)}
          >
            <Columns3 className="mr-1.5 h-4 w-4" />
            Customize columns
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-[160px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !preview?.columns.length ? (
            <p className="text-sm text-muted-foreground">No preview data available.</p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {displayColumns.map((column) => (
                        <TableHead key={column} className="font-mono text-xs">
                          {column || '(empty)'}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.rows.length ? (
                      preview.rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {displayColumns.map((column) => {
                            const columnIndex = preview.columns.indexOf(column);
                            const value =
                              columnIndex >= 0 ? (row[columnIndex] ?? '') : '';
                            return (
                              <TableCell key={column} className="font-mono text-xs">
                                {value || '—'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={Math.max(displayColumns.length, 1)}
                          className="text-center text-muted-foreground"
                        >
                          No data rows
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Showing {Math.min(preview.rows.length, 5)} of {preview.totalRowCount}{' '}
                data row{preview.totalRowCount !== 1 ? 's' : ''} ·{' '}
                {displayColumns.length} of {preview.columns.length} column
                {preview.columns.length !== 1 ? 's' : ''} visible
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {preview ? (
        <SampleExcelColumnPickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          allColumns={preview.columns}
          visibleColumns={visibleColumns}
          onVisibleColumnsChange={onVisibleColumnsChange}
        />
      ) : null}
    </>
  );
}
