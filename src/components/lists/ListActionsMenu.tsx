import { useRef } from 'react';
import {
  MoreHorizontal,
  Upload,
  Download,
  FileText,
  RefreshCw,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
  onCancelImport: () => void;
  onCancelSync: () => void;
}

export function ListActionsMenu({
  list,
  isAdmin,
  uploading,
  exporting,
  triggeringSync,
  onUpload,
  onExport,
  onOpenPdfs,
  onTriggerSync,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  onCancelImport,
  onCancelSync,
}: ListActionsMenuProps) {
  const isBusy = list.status === 'IMPORTING' || list.status === 'SYNCING';
  const canSync =
    isAdmin && !isBusy && list.status !== 'ARCHIVED' && list.totalArticles > 0;

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <DropdownMenu>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        disabled={isBusy || uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = '';
        }}
      />
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">List actions</span>
        </Button>
      </DropdownMenuTrigger>
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
            Trigger sync
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
            {list.status === 'ARCHIVED' ? (
              <DropdownMenuItem className="gap-2" onClick={onUnarchive}>
                <ArchiveRestore className="h-3.5 w-3.5" />
                Unarchive
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="gap-2" onClick={onArchive}>
                <Archive className="h-3.5 w-3.5" />
                Archive
              </DropdownMenuItem>
            )}
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
    </DropdownMenu>
  );
}
