import { FileIcon, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileDropZoneFileListProps {
  files: File[];
  icon: 'file' | 'image';
  onRemove: (name: string) => void;
}

export function FileDropZoneFileList({
  files,
  icon,
  onRemove,
}: FileDropZoneFileListProps) {
  const Icon = icon === 'image' ? ImageIcon : FileIcon;

  if (files.length === 0) return null;

  return (
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
              onRemove(file.name);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
