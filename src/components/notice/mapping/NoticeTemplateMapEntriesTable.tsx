import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { NoticeTemplateMapEntriesTableProps } from '@/pages/notice/noticeTemplateMapPage.types';

export function NoticeTemplateMapEntriesTable({
  entries,
  typFiles,
  readOnly,
  isBusy,
  onUpdateEntry,
  onRemoveEntry,
  onAddEntry,
}: NoticeTemplateMapEntriesTableProps) {
  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[1fr_1fr_40px] gap-2 border-b border-border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
          <span>Key (state / language)</span>
          <span>.typ file</span>
          <span />
        </div>
        <div className="divide-y divide-border">
          {entries.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No mappings yet. Import template.json or add rows below.
            </p>
          ) : (
            entries.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_1fr_40px] items-center gap-2 px-3 py-2"
              >
                <Input
                  value={row.key}
                  disabled={readOnly || isBusy}
                  placeholder='e.g. DEFAULT or "UTTAR PRADESH"'
                  className="font-mono text-xs"
                  onChange={(e) => onUpdateEntry(row.id, { key: e.target.value })}
                />
                <Select
                  value={row.value || '__none__'}
                  onValueChange={(v) => {
                    if (v !== '__none__') onUpdateEntry(row.id, { value: v });
                  }}
                  disabled={readOnly || isBusy || typFiles.length === 0}
                >
                  <SelectTrigger className="font-mono text-xs">
                    <SelectValue placeholder="Select .typ" />
                  </SelectTrigger>
                  <SelectContent>
                    {typFiles.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  disabled={readOnly || isBusy}
                  onClick={() => onRemoveEntry(row.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {!readOnly && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={isBusy}
          onClick={onAddEntry}
        >
          <Plus className="h-3.5 w-3.5" />
          Add mapping
        </Button>
      )}
    </>
  );
}

export function NoticeTemplateMapEntriesLoading() {
  return (
    <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading mappings…
    </div>
  );
}
