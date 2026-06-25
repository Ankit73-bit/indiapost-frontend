export interface FileDropZoneProps {
  accept: string;
  acceptLabel: string;
  files?: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  icon?: 'file' | 'image';
  emptyHint?: string;
}
