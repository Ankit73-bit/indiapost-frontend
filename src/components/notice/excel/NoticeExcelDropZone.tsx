import { useCallback, useRef, useState } from 'react';
import { FileSpreadsheet, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoticeExcelDropZoneProps {
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function NoticeExcelDropZone({
  file,
  onFile,
  onClear,
  disabled,
}: NoticeExcelDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      const f = list?.[0];
      if (!f) return;
      const ext = f.name.split('.').pop()?.toLowerCase();
      if (ext !== 'xlsx' && ext !== 'xls') return;
      onFile(f);
    },
    [onFile],
  );

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <FileSpreadsheet className="h-5 w-5 shrink-0 text-emerald-600" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={onClear}
            className="rounded p-1 hover:bg-muted"
            aria-label="Remove file"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' '))
            inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
          disabled && 'pointer-events-none opacity-50',
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/30',
        )}
      >
        <div className="rounded-full bg-muted p-3">
          <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">
            Drop your Excel file here or{' '}
            <span className="text-primary">browse</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">.xlsx or .xls · max 10 MB</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </>
  );
}
