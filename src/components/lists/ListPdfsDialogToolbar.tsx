import { Download, Loader2, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ListPdfsDialogToolbarProps {
  totalArticles: number;
  selectedCount: number;
  isZipBusy: boolean;
  isFetching: boolean;
  onDownloadAll: () => void;
  onDownloadSelected: () => void;
  onClearSelection: () => void;
  onRefetch: () => void;
}

export function ListPdfsDialogToolbar({
  totalArticles,
  selectedCount,
  isZipBusy,
  isFetching,
  onDownloadAll,
  onDownloadSelected,
  onClearSelection,
  onRefetch,
}: ListPdfsDialogToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={totalArticles === 0 || isZipBusy}
        onClick={onDownloadAll}
      >
        {isZipBusy ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="mr-1.5 h-3.5 w-3.5" />
        )}
        Download all (ZIP)
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={selectedCount === 0 || isZipBusy}
        onClick={onDownloadSelected}
      >
        {isZipBusy ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="mr-1.5 h-3.5 w-3.5" />
        )}
        Download selected ({selectedCount})
      </Button>
      {selectedCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          disabled={isZipBusy}
          onClick={onClearSelection}
        >
          <X className="mr-1.5 h-3.5 w-3.5" />
          Clear selection
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="ml-auto"
        disabled={isFetching}
        onClick={onRefetch}
      >
        {isFetching ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
