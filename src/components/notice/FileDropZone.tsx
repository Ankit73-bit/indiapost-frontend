import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileDropZoneFileList } from '@/components/notice/FileDropZoneFileList';
import type { FileDropZoneProps } from '@/components/notice/fileDropZone.types';
import { useFileDropZone } from '@/components/notice/useFileDropZone';

export function FileDropZone({
  accept,
  acceptLabel,
  files = [],
  onFilesChange,
  multiple = true,
  icon = 'file',
  emptyHint,
}: FileDropZoneProps) {
  const { inputRef, dragOver, setDragOver, addFiles, removeFile } =
    useFileDropZone({ files, multiple, onFilesChange });

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

      <FileDropZoneFileList files={files} icon={icon} onRemove={removeFile} />
    </div>
  );
}
