import { PdfViewerPanel } from '@/components/lists/PdfViewerPanel';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';

interface TemplatePreviewPanelProps {
  fileName: string;
  pdfUrl: string | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onRefresh: () => void;
}

export function TemplatePreviewPanel({
  fileName,
  pdfUrl,
  loading,
  error,
  onClose,
  onRefresh,
}: TemplatePreviewPanelProps) {
  const shortName = fileName.split('/').pop() ?? fileName;

  return (
    <aside className="flex w-[min(42vw,480px)] shrink-0 flex-col border-l border-border bg-card">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-xs font-medium text-foreground">{shortName}</span>
          {loading && (
            <span className="text-[10px] text-muted-foreground animate-pulse">Rendering…</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={loading}
            onClick={onRefresh}
            title="Refresh preview"
          >
            <RefreshCw className={loading ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onClose}
            title="Close preview"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <PdfViewerPanel
        title={shortName}
        blobUrl={pdfUrl}
        loading={loading}
        error={error}
        onClose={onClose}
        showBackButton={false}
      />
    </aside>
  );
}
