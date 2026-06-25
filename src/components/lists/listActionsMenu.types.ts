import type { RefObject } from 'react';
import type { List } from '@/types';

export interface ListActionsMenuProps {
  list: List;
  isAdmin: boolean;
  uploading: boolean;
  exporting: boolean;
  triggeringSync: boolean;
  onUpload: (file: File) => void;
  onExport: () => void;
  onOpenPdfs: () => void;
  onTriggerSync: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCancelImport: () => void;
  onCancelSync: () => void;
}

export interface ListActionsMenuContentProps extends ListActionsMenuProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  isBusy: boolean;
  canSync: boolean;
}
