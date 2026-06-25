import { useCallback, useRef, useState } from 'react';

interface UseFileDropZoneOptions {
  files: File[];
  multiple: boolean;
  onFilesChange: (files: File[]) => void;
}

export function useFileDropZone({
  files,
  multiple,
  onFilesChange,
}: UseFileDropZoneOptions) {
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

  return {
    inputRef,
    dragOver,
    setDragOver,
    addFiles,
    removeFile,
  };
}
