import { ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  defaultVisibleColumns,
  allVisibleColumns,
} from '@/lib/sampleExcel/previewColumns';

export function SampleExcelColumnPickerDialog({
  open,
  onOpenChange,
  allColumns,
  visibleColumns,
  onVisibleColumnsChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allColumns: string[];
  visibleColumns: string[];
  onVisibleColumnsChange: (columns: string[]) => void;
}) {
  const hiddenColumns = allColumns.filter((column) => !visibleColumns.includes(column));

  function toggleColumn(column: string, visible: boolean) {
    if (visible) {
      onVisibleColumnsChange(visibleColumns.filter((name) => name !== column));
      return;
    }
    onVisibleColumnsChange([...visibleColumns, column]);
  }

  function moveColumn(column: string, direction: -1 | 1) {
    const index = visibleColumns.indexOf(column);
    if (index < 0) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= visibleColumns.length) return;
    const next = [...visibleColumns];
    [next[index], next[nextIndex]] = [next[nextIndex]!, next[index]!];
    onVisibleColumnsChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize preview columns</DialogTitle>
          <DialogDescription>
            Choose which columns appear in the preview. This does not change the uploaded
            Excel file.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onVisibleColumnsChange(allVisibleColumns(allColumns))}
          >
            Show all columns
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onVisibleColumnsChange(defaultVisibleColumns(allColumns))}
          >
            Reset to first 10
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Visible columns</Label>
            {visibleColumns.length ? (
              <ul className="mt-2 space-y-1">
                {visibleColumns.map((column) => (
                  <li
                    key={column}
                    className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5"
                  >
                    <input
                      type="checkbox"
                      checked
                      onChange={() => toggleColumn(column, true)}
                      className="h-4 w-4 shrink-0"
                    />
                    <span className="min-w-0 flex-1 truncate font-mono text-xs">{column}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      disabled={visibleColumns.indexOf(column) === 0}
                      onClick={() => moveColumn(column, -1)}
                      aria-label={`Move ${column} up`}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      disabled={visibleColumns.indexOf(column) === visibleColumns.length - 1}
                      onClick={() => moveColumn(column, 1)}
                      aria-label={`Move ${column} down`}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No columns selected.</p>
            )}
          </div>

          {hiddenColumns.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Add columns</Label>
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                {hiddenColumns.map((column) => (
                  <li
                    key={column}
                    className="flex items-center gap-2 rounded-md border border-dashed border-border px-2 py-1.5"
                  >
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => toggleColumn(column, false)}
                      className="h-4 w-4 shrink-0"
                    />
                    <span className="min-w-0 flex-1 truncate font-mono text-xs">{column}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
