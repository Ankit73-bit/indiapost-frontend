import { useCallback, useRef, useState } from 'react';
import { Upload, X, FileIcon, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileDropZoneProps {
  accept: string;
  acceptLabel: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  icon?: 'file' | 'image';
  emptyHint?: string;
}

export function FileDropZone({
  accept,
  acceptLabel,
  files,
  onFilesChange,
  multiple = true,
  icon = 'file',
  emptyHint,
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const list = [...incoming];
      if (!list.length) return;
      if (multiple) {
        const names = new Set(files.map((f) => f.name));
        const merged = [...files];
        for (const f of list) {
          if (!names.has(f.name)) {
            merged.push(f);
            names.add(f.name);
          }
        }
        onFilesChange(merged);
      } else {
        onFilesChange([list[0]!]);
      }
    },
    [files, multiple, onFilesChange],
  );

  const removeFile = (name: string) => {
    onFilesChange(files.filter((f) => f.name !== name));
  };

  const Icon = icon === 'image' ? ImageIcon : FileIcon;

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40',
        )}
      >
        <div className="rounded-full bg-muted p-3">
          <Upload className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">
            Drop files here or <span className="text-primary">browse</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{acceptLabel}</p>
        </div>
        {emptyHint && (
          <p className="max-w-sm text-xs text-muted-foreground">{emptyHint}</p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file.name}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
            >
              {icon === 'image' ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="h-10 w-10 rounded object-cover"
                  onLoad={(e) =>
                    URL.revokeObjectURL((e.target as HTMLImageElement).src)
                  }
                />
              ) : (
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.name);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
