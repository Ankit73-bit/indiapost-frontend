import {
  Upload,
  Download,
  FileText,
  RefreshCw,
  Pencil,
  Trash2,
  XCircle,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { ListActionsMenuContentProps } from '@/components/lists/listActionsMenu.types';

export function ListActionsMenuContent({
  list,
  isAdmin,
  uploading,
  exporting,
  triggeringSync,
  onExport,
  onOpenPdfs,
  onTriggerSync,
  onEdit,
  onDelete,
  onCancelImport,
  onCancelSync,
  fileInputRef,
  isBusy,
  canSync,
}: ListActionsMenuContentProps) {
  return (
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuItem
        className="gap-2"
        disabled={isBusy || uploading}
        onSelect={(e) => {
          e.preventDefault();
          fileInputRef.current?.click();
        }}
      >
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        Upload file
      </DropdownMenuItem>

      <DropdownMenuItem
        className="gap-2"
        disabled={exporting || list.totalArticles === 0}
        onClick={onExport}
      >
        {exporting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        Export Excel
      </DropdownMenuItem>

      <DropdownMenuItem className="gap-2" onClick={onOpenPdfs}>
        <FileText className="h-3.5 w-3.5" />
        Tracking PDFs
      </DropdownMenuItem>

      {canSync && (
        <DropdownMenuItem
          className="gap-2"
          disabled={triggeringSync}
          onClick={onTriggerSync}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync
        </DropdownMenuItem>
      )}

      <DropdownMenuSeparator />

      <DropdownMenuItem className="gap-2" onClick={onEdit}>
        <Pencil className="h-3.5 w-3.5" />
        Edit list
      </DropdownMenuItem>

      {isAdmin && list.status === 'IMPORTING' && (
        <DropdownMenuItem
          className="gap-2 text-destructive focus:text-destructive"
          onClick={onCancelImport}
        >
          <XCircle className="h-3.5 w-3.5" />
          Cancel import
        </DropdownMenuItem>
      )}

      {isAdmin && list.status === 'SYNCING' && (
        <DropdownMenuItem
          className="gap-2 text-destructive focus:text-destructive"
          onClick={onCancelSync}
        >
          <XCircle className="h-3.5 w-3.5" />
          Reset sync
        </DropdownMenuItem>
      )}

      {isAdmin && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 text-destructive focus:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenuContent>
  );
}
