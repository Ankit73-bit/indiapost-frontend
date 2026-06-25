import { useRef } from 'react';
import { FilePlus2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilesSidebarHeaderProps {
  readOnly?: boolean;
  isUploading?: boolean;
  onUploadFiles?: (files: FileList) => void;
}

export function FilesSidebarHeader({
  readOnly,
  isUploading,
  onUploadFiles,
}: FilesSidebarHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center justify-between border-b border-border px-3 py-3">
      <p className="text-sm font-medium text-foreground">Files</p>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        className="h-7 w-7"
        disabled={readOnly || isUploading || !onUploadFiles}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FilePlus2 className="h-4 w-4" />
        )}
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".typ,.png,.jpg,.jpeg,.webp,.gif,.svg"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length && onUploadFiles) {
            onUploadFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />
    </div>
  );
}
